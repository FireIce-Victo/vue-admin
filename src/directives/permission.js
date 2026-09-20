import { hasAnyPerm } from '@/utils/permission'

/** 用法: v-permission="'system:user:delete'" 或 v-permission="['system:user:delete','system:user:reset']" */
const permission = {
  mounted(el, binding) {
    const { value } = binding
    const required = Array.isArray(value) ? value : [value]
    if (required.length && !hasAnyPerm(required)) {
      el.parentNode?.removeChild(el) // 无权限则移除元素
    }
  }
}

export default permission