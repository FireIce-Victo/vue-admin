export const ROLE_OPTIONS = [
  { label: '管理员', value: 'admin' },
  { label: '普通用户', value: 'user' },
  { label: '编辑者', value: 'editor' },
  { label: '审计员', value: 'auditor' }
]

export const ROLE_MAP = Object.fromEntries(
  ROLE_OPTIONS.map((item) => [item.value, item.label])
)