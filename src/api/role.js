import request from '@/utils/request';

// ==================== 角色管理（va_role）====================

// 角色树
export function sysRoleTreeAPI(params) {
  return request({
    url: '/role/tree',
    method: 'get',
    params
  });
}

// 角色列表（扁平，下拉用）
export function sysRoleListAPI(params) {
  return request({
    url: '/role/list',
    method: 'get',
    params
  });
}

// 角色详情
export function sysRoleDetailAPI(id) {
  return request({
    url: `/role/${id}`,
    method: 'get'
  });
}

// 新增角色
export function sysRoleAddAPI(data) {
  return request({
    url: '/role',
    method: 'post',
    data
  });
}

// 编辑角色
export function sysRoleUpdateAPI(id, data) {
  return request({
    url: `/role/${id}`,
    method: 'put',
    data
  });
}

// 删除角色
export function sysRoleDeleteAPI(id) {
  return request({
    url: `/role/${id}`,
    method: 'delete'
  });
}

// 角色已授权权限ID列表
export function sysRolePermissionsAPI(id) {
  return request({
    url: `/role/${id}/permissions`,
    method: 'get'
  });
}

// 分配权限（va_role_permission）
export function sysRoleAssignPermsAPI(id, data) {
  return request({
    url: `/role/${id}/permissions`,
    method: 'put',
    data
  });
}
