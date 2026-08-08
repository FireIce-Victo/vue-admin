/**
 * 时间格式化为标准形式 YYYY-MM-DD HH:mm:ss
 * 兼容 MySQL datetime（YYYY-MM-DD HH:mm:ss）、ISO 字符串（2026-08-08T10:00:00.000Z）、时间戳
 * 空值返回 '-'；无法解析的值原样返回
 */
export const formatDateTime = (val) => {
  if (!val) return '-'
  // 已是标准格式，直接返回
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(val)) return val
  const d = new Date(val)
  if (Number.isNaN(d.getTime())) return val
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
