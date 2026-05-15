import request from '@/utils/request';

export function loginAPI(data) {
  return request({
    url: '/login',
    method: 'post',
    data
  })
}   