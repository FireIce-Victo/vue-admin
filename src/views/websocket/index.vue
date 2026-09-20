<template>
  <div class="app-container ws-page">
    <el-card shadow="never" class="ws-card">
      <template #header>
        <div class="card-header">
          <span>WebSocket 连接验证台</span>
          <el-tag :type="statusTagType" size="small">{{ statusText }}</el-tag>
        </div>
      </template>

      <el-alert
        type="info"
        :closable="false"
        show-icon
        class="tip"
        title="本模块只提供三个功能"
        description="创建连接 / 关闭连接 / 发送心跳。除 ping 与 close 外的任何帧都会被服务端拒绝。"
      />

      <!-- 三个功能按钮 -->
      <div class="action-bar">
        <el-button
          type="primary"
          :loading="status === 'connecting'"
          :disabled="connected"
          @click="handleConnect"
        >
          创建连接
        </el-button>
        <el-button type="danger" :disabled="!connected && status !== 'reconnecting'" @click="handleClose">
          关闭连接
        </el-button>
        <el-button :disabled="!connected" @click="handleHeartbeat">发送心跳</el-button>
        <el-switch
          v-model="autoReconnect"
          class="reconnect-switch"
          active-text="断线自动重连"
          @change="handleAutoReconnectChange"
        />
      </div>

      <!-- 连接状态明细 -->
      <el-descriptions :column="3" border class="desc">
        <el-descriptions-item label="连接状态">{{ statusText }}</el-descriptions-item>
        <el-descriptions-item label="连接ID">{{ connectionId || '-' }}</el-descriptions-item>
        <el-descriptions-item label="在线用户数">{{ onlineCount }}</el-descriptions-item>
        <el-descriptions-item label="心跳周期">{{ heartbeatIntervalMs / 1000 }}s</el-descriptions-item>
        <el-descriptions-item label="最近心跳 RTT">
          {{ rtt === null ? '-' : rtt + ' ms' }}
        </el-descriptions-item>
        <el-descriptions-item label="最近心跳时间">{{ lastPongText }}</el-descriptions-item>
      </el-descriptions>

      <!-- 事件日志 -->
      <div class="log-header">
        <span>事件日志</span>
        <el-button link type="primary" size="small" @click="logs = []">清空</el-button>
      </div>
      <div class="log-box">
        <el-empty v-if="!logs.length" description="暂无日志" :image-size="60" />
        <div v-for="(l, i) in logs" :key="i" class="log-line" :class="'log-' + l.level">
          <span class="log-time">{{ l.time }}</span>
          <span class="log-text">{{ l.text }}</span>
        </div>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useWebSocket } from '@/composables/useWebSocket'

const HEARTBEAT_INTERVAL = 30000
const autoReconnect = ref(true)

const logs = ref([])

function pushLog(text, level = 'info') {
  logs.value.unshift({
    text,
    level,
    time: new Date().toLocaleTimeString('zh-CN', { hour12: false })
  })
  if (logs.value.length > 200) logs.value.pop()
}

const { status, connected, rtt, lastPongAt, onlineCount, connectionId, retryCount, heartbeatIntervalMs, connect, close, sendHeartbeat } =
  useWebSocket({
    heartbeatInterval: HEARTBEAT_INTERVAL,
    autoReconnect: true,
    onConnected: () => {
      pushLog('创建连接成功，等待服务端 connected 回执', 'success')
      ElMessage.success('WebSocket 已连接')
    },
    onPong: ({ rtt: r }) => pushLog(`收到心跳应答 pong，RTT ${r} ms`, 'info'),
    onClose: ({ code, reason, willReconnect }) => {
      pushLog(
        `连接已关闭 code=${code}${reason ? ' reason=' + reason : ''}${willReconnect ? ' → 即将自动重连' : ''}`,
        willReconnect ? 'warn' : 'error'
      )
    },
    onError: ({ code, message }) => {
      pushLog(`错误 ${code}：${message}`, 'error')
      ElMessage.error(message)
    }
  })

const statusText = computed(
  () =>
    ({
      idle: '未连接',
      connecting: '连接中…',
      connected: '已连接',
      reconnecting: `重连等待中（第 ${retryCount.value} 次）`,
      closed: '已关闭'
    })[status.value] || status.value
)

const statusTagType = computed(
  () =>
    ({
      idle: 'info',
      connecting: 'warning',
      connected: 'success',
      reconnecting: 'warning',
      closed: 'danger'
    })[status.value] || 'info'
)

const lastPongText = computed(() =>
  lastPongAt.value ? new Date(lastPongAt.value).toLocaleTimeString('zh-CN', { hour12: false }) : '-'
)

// ─────────── 三个功能的操作入口 ───────────

function handleConnect() {
  pushLog('发起创建连接…')
  connect()
}

function handleClose() {
  pushLog('发起关闭连接（发送 close 帧 + 关闭码 1000）')
  close('user clicked close')
  ElMessage.info('WebSocket 已断开')
}

function handleHeartbeat() {
  const ok = sendHeartbeat()
  if (!ok) {
    pushLog('发送心跳失败：连接未处于 OPEN 状态', 'warn')
    return
  }
  pushLog('已发送心跳 ping，等待 pong')
}

function handleAutoReconnectChange(val) {
  pushLog(`断线自动重连已${val ? '开启' : '关闭'}`)
}

onMounted(() => {
  if (!localStorage.getItem('ACCESS_TOKEN')) {
    pushLog('未检测到登录 token，连接会在握手阶段被拒绝（401），请先登录', 'warn')
  }
})
</script>

<style lang="scss" scoped>
.ws-page {
  height: 100%;
  box-sizing: border-box;
}

.ws-card {
  height: 100%;
  display: flex;
  flex-direction: column;

  :deep(.el-card__body) {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tip {
  margin-bottom: 16px;
}

.action-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;

  .reconnect-switch {
    margin-left: auto;
  }
}

.desc {
  margin-bottom: 16px;
}

.log-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
  margin-bottom: 8px;
}

.log-box {
  flex: 1;
  min-height: 160px;
  overflow-y: auto;
  background: #1e1e1e;
  border-radius: 6px;
  padding: 10px 12px;
  font-family: Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.7;

  .log-line {
    display: flex;
    gap: 10px;
    word-break: break-all;

    &.log-success .log-text {
      color: #67c23a;
    }
    &.log-warn .log-text {
      color: #e6a23c;
    }
    &.log-error .log-text {
      color: #f56c6c;
    }
    &.log-info .log-text {
      color: #dcdfe6;
    }
  }

  .log-time {
    color: #6b7280;
    flex-shrink: 0;
  }
}
</style>
