import { ref, onBeforeUnmount } from 'vue'

/**
 * WebSocket 组合式函数
 *
 * 只提供三个功能，与后端 ws 模块一一对应：
 *   1. connect()        —— 创建连接（握手 + JWT 鉴权，服务端回 connected 帧）
 *   2. close()          —— 关闭连接（先发 close 帧告知服务端，再走正常关闭码 1000）
 *   3. sendHeartbeat()  —— 发送心跳（发 ping 帧，服务端回 pong 帧并回带 ts 用于算 RTT）
 *
 * 连接地址：ws(s)://<当前页 host><VITE_WS_PATH>?token=<裸token>
 *   - 开发环境由 Vite 把 /ws 代理到后端（见 vite.config.js 的 ws: true）
 *   - 生产环境同源部署，由 nginx 透传 Upgrade 头（见设计方案 §8）
 *
 * @param {Object}   options
 * @param {string}   [options.token]             裸 token；缺省从 localStorage 的 ACCESS_TOKEN 读取
 * @param {string}   [options.path]              WS 路径，缺省取 VITE_WS_PATH 或 '/ws'
 * @param {number}   [options.heartbeatInterval] 心跳周期(ms)，缺省 30000；服务端 connected 帧会下发权威值
 * @param {boolean}  [options.autoReconnect]     断线是否自动重连，缺省 true
 * @param {Function} [options.onConnected]       连接成功回调
 * @param {Function} [options.onPong]           收到心跳应答回调 ({ rtt, serverTime })
 * @param {Function} [options.onClose]          连接关闭回调 ({ code, reason, willReconnect })
 * @param {Function} [options.onError]          协议/网络错误回调 ({ code, message })
 */
export function useWebSocket(options = {}) {
  const {
    token: tokenOption,
    path = import.meta.env.VITE_WS_PATH || '/ws',
    heartbeatInterval = 30000,
    autoReconnect = true,
    onConnected,
    onPong,
    onClose,
    onError
  } = options

  /** idle 未连接 | connecting 连接中 | connected 已连接 | reconnecting 重连等待中 | closed 已关闭 */
  const status = ref('idle')
  const connected = ref(false)
  /** 最近一次心跳往返耗时(ms)，心跳未应答时为 null */
  const rtt = ref(null)
  const lastPongAt = ref(null)
  const onlineCount = ref(0)
  const connectionId = ref('')
  const retryCount = ref(0)
  /** 当前生效的心跳周期(ms)：初始为入参，服务端 connected 帧下发后以其为准 */
  const heartbeatIntervalMs = ref(heartbeatInterval)

  let socket = null
  let heartbeatTimer = null
  let reconnectTimer = null
  /** 用户主动关闭：置 true 后不再自动重连 */
  let manualClose = false

  // ─────────────── 内部工具 ───────────────

  function resolveToken() {
    return tokenOption || localStorage.getItem('ACCESS_TOKEN') || ''
  }

  function buildUrl() {
    const scheme = location.protocol === 'https:' ? 'wss:' : 'ws:'
    const token = resolveToken()
    return `${scheme}//${location.host}${path}?token=${encodeURIComponent(token)}`
  }

  /** 发一帧 JSON；非 OPEN 状态返回 false 由调用方决定怎么处理 */
  function sendFrame(frame) {
    if (socket?.readyState !== WebSocket.OPEN) return false
    socket.send(JSON.stringify(frame))
    return true
  }

  function startHeartbeat(interval) {
    stopHeartbeat()
    if (interval) heartbeatIntervalMs.value = interval
    heartbeatTimer = setInterval(() => sendHeartbeat(), heartbeatIntervalMs.value)
  }

  function stopHeartbeat() {
    clearInterval(heartbeatTimer)
    heartbeatTimer = null
  }

  function clearReconnectTimer() {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }

  // ─────────────── 功能3：发送心跳 ───────────────

  /**
   * 发送一次心跳。自动心跳由 startHeartbeat 定时调用，也可手动触发用于探活。
   * @returns {boolean} 是否成功发出
   */
  function sendHeartbeat() {
    const sentAt = Date.now()
    const ok = sendFrame({ type: 'ping', ts: sentAt })
    if (ok) socket._lastPingTs = sentAt
    return ok
  }

  // ─────────────── 功能2：关闭连接 ───────────────

  /**
   * 关闭连接。先发 close 帧让服务端有机会记录，再按正常码 1000 关闭。
   * @param {string} [reason] 关闭原因，仅用于本地日志
   */
  function close(reason = 'client closed') {
    manualClose = true
    clearReconnectTimer()
    stopHeartbeat()

    if (!socket) {
      status.value = 'closed'
      connected.value = false
      return
    }

    const s = socket
    socket = null

    if (s.readyState === WebSocket.OPEN) {
      try {
        s.send(JSON.stringify({ type: 'close' }))
      } catch {
        /* 忽略：连接可能刚好断开 */
      }
      s.close(1000, reason)
    } else {
      s.close()
    }

    status.value = 'closed'
    connected.value = false
    rtt.value = null
  }

  // ─────────────── 自动重连（属于「创建连接」的容错，非独立功能） ───────────────

  function scheduleReconnect() {
    if (!autoReconnect || manualClose) return
    status.value = 'reconnecting'
    // 指数退避：1s, 2s, 4s, 8s… 封顶 30s
    const delay = Math.min(30000, 1000 * 2 ** retryCount.value)
    retryCount.value += 1
    reconnectTimer = setTimeout(connect, delay)
  }

  // ─────────────── 功能1：创建连接 ───────────────

  /** 创建连接（若已连接或正在连接则忽略，避免重复握手） */
  function connect() {
    if (socket && (socket.readyState === WebSocket.OPEN || socket.readyState === WebSocket.CONNECTING)) {
      return
    }

    manualClose = false
    clearReconnectTimer()
    status.value = 'connecting'

    const s = new WebSocket(buildUrl())
    socket = s

    s.onopen = () => {
      if (socket !== s) return // 已被更新的连接取代，丢弃
      connected.value = true
      status.value = 'connected'
      retryCount.value = 0
      startHeartbeat(heartbeatInterval)
      onConnected?.()
    }

    s.onmessage = (event) => {
      if (socket !== s) return
      let frame
      try {
        frame = JSON.parse(event.data)
      } catch {
        return
      }

      switch (frame.type) {
        case 'connected':
          // 服务端回执：以服务端下发的心跳周期为准
          connectionId.value = frame.data?.connectionId || ''
          onlineCount.value = frame.data?.onlineCount || 0
          if (frame.data?.heartbeatInterval && frame.data.heartbeatInterval !== heartbeatIntervalMs.value) {
            startHeartbeat(frame.data.heartbeatInterval)
          }
          break

        case 'pong': {
          const now = Date.now()
          const sentAt = frame.data?.ts ?? s._lastPingTs
          rtt.value = sentAt ? now - sentAt : null
          lastPongAt.value = now
          onPong?.({ rtt: rtt.value, serverTime: frame.data?.serverTime })
          break
        }

        case 'error':
          onError?.({ code: frame.data?.code, message: frame.data?.message })
          break

        default:
          break
      }
    }

    s.onclose = (event) => {
      if (socket !== s) return
      socket = null
      connected.value = false
      stopHeartbeat()
      rtt.value = null
      connectionId.value = ''

      const willReconnect = autoReconnect && !manualClose
      if (willReconnect) scheduleReconnect()
      else status.value = 'closed'

      onClose?.({ code: event.code, reason: event.reason, willReconnect })
    }

    s.onerror = () => {
      if (socket !== s) return
      onError?.({ code: 'NETWORK_ERROR', message: 'WebSocket 连接异常' })
      // onerror 后浏览器一定会再触发 onclose，重连逻辑统一放在 onclose 里
    }
  }

  // 组件卸载时兜底清理，避免遗留连接与定时器
  onBeforeUnmount(() => close('component unmounted'))

  return {
    // 状态
    status,
    connected,
    rtt,
    lastPongAt,
    onlineCount,
    connectionId,
    retryCount,
    heartbeatIntervalMs,
    // 三个功能
    connect,
    close,
    sendHeartbeat
  }
}
