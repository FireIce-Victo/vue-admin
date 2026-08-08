import request from '@/utils/request.js';

export function getTableList(params) {
  return request({
    url: '/table/list',
    method: 'get',
    params
  });
}

export function addTableData(data) {
  return request({
    url: '/table/add',
    method: 'post',
    data
  });
}

export function updateTableData(data) {
  const { id, ...rest } = data;
  return request({
    url: `/table/update/${id}`,
    method: 'put',
    data: rest
  });
}

export function deleteTableData(id) {
  return request({
    url: `/table/${id}`,
    method: 'delete'
  });
}
