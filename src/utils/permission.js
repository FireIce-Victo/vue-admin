import { userStore } from '@/stores/modules/user'

/**
 * 预览模式(跳过登录与权限校验):仅当 VITE_SKIP_LOGIN=true 时启用。
 * 用于不启动后端即可预览全部页面;上线前必须移除该配置。
 */
export const isPreviewMode = import.meta.env.VITE_SKIP_LOGIN === 'true'

/** 当前用户是否拥有单个权限码（支持通配符 '*'） */
export function hasPerm(code) {
  if (isPreviewMode) return true // 预览模式放行一切
  const perms = userStore().perms || []
  return perms.includes('*') || perms.includes(code)
}

/** 是否拥有任一个权限码（路由 meta.perms 为数组，满足其一即可） */
export function hasAnyPerm(codes) {
  if (!codes || codes.length === 0) return true // 未声明权限 = 公开
  return codes.some((c) => hasPerm(c))
}

/** 按权限过滤路由树（用于侧边栏），保留：自身有权限 or 有可见子路由 */
export function filterRoutesByPerms(routes) {
  const result = []
  for (const route of routes) {
    if (route.meta?.hidden) continue // 尊重路由自身的 hidden
    let children = []
    if (route.children?.length) {
      children = filterRoutesByPerms(route.children)
    }
    const selfPass = hasAnyPerm(route.meta?.perms)
    if (route.children?.length) {
      // 目录：任一子路由可见则显示
      if (children.length) result.push({ ...route, children })
    } else if (selfPass) {
      result.push(route)
    }
  }
  return result
}