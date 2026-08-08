import request from '@/utils/request';

// ==================== 用户管理（va_user）====================

// 用户列表（分页）
export function sysUserListAPI(params) {
  return request({
    url: '/user/list',
    method: 'get',
    params
  });
}

// 用户详情
export function sysUserDetailAPI(id) {
  return request({
    url: `/user/${id}`,
    method: 'get'
  });
}

// 新增用户
export function sysUserAddAPI(data) {
  return request({
    url: '/user',
    method: 'post',
    data
  });
}

// 编辑用户
export function sysUserUpdateAPI(id, data) {
  return request({
    url: `/user/${id}`,
    method: 'put',
    data
  });
}

// 重置密码
export function sysUserResetPwdAPI(id, data) {
  return request({
    url: `/user/${id}/password`,
    method: 'put',
    data
  });
}

// 删除用户（软删除）
export function sysUserDeleteAPI(id) {
  return request({
    url: `/user/${id}`,
    method: 'delete'
  });
}

// 分配角色（va_user_role）
export function sysUserAssignRolesAPI(id, data) {
  return request({
    url: `/user/${id}/roles`,
    method: 'put',
    data
  });
}

// 用户直授权限列表（va_user_permission）
export function sysUserDirectPermsAPI(id) {
  return request({
    url: `/user/${id}/permissions`,
    method: 'get'
  });
}

// 保存用户直授权限（全量覆盖）
export function sysUserSetDirectPermsAPI(id, data) {
  return request({
    url: `/user/${id}/permissions`,
    method: 'put',
    data
  });
}

// 当前用户权限编码集合（按钮级控制）
export function sysUserMyPermsAPI() {
  return request({
    url: '/user/perms',
    method: 'get'
  });
}

// 当前用户菜单树
export function sysUserMyMenusAPI() {
  return request({
    url: '/user/menus',
    method: 'get'
  });
}
