import request from '@/utils/request';

// ==================== 权限管理（va_permission）====================

// 权限树
export function sysPermTreeAPI(params) {
  return request({
    url: '/permission/tree',
    method: 'get',
    params
  });
}

// 权限列表（扁平，下拉用）
export function sysPermListAPI(params) {
  return request({
    url: '/permission/list',
    method: 'get',
    params
  });
}

// 新增权限
export function sysPermAddAPI(data) {
  return request({
    url: '/permission',
    method: 'post',
    data
  });
}

// 编辑权限
export function sysPermUpdateAPI(id, data) {
  return request({
    url: `/permission/${id}`,
    method: 'put',
    data
  });
}

// 删除权限
export function sysPermDeleteAPI(id) {
  return request({
    url: `/permission/${id}`,
    method: 'delete'
  });
}
