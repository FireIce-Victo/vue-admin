import request from '@/utils/request';

export function loginAPI(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}

// 退出登录：通知后端把当前 token 的 jti 写入黑名单（真吊销）+ 记录登出审计
// 必须在清空本地 token 之前调用，否则请求会因缺少 token 被拒
export function logoutAPI() {
  return request({
    url: '/logout',
    method: 'post'
  })
}   