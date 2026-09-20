import request from '@/utils/request';

// ==================== 文件管理（va_file）====================

// 单文件上传（字段名固定为 file，可选 bizType 业务类型）
export function fileUploadAPI(formData, onUploadProgress) {
  return request({
    url: '/file/upload',
    method: 'post',
    data: formData,
    // 覆盖 axios 实例默认的 application/json，交给浏览器补 multipart 边界
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
    onUploadProgress
  });
}

// 文件列表（分页，仅返回当前登录用户的文件）
export function fileListAPI(params) {
  return request({
    url: '/file/list',
    method: 'get',
    params
  });
}

// 删除文件（软删，仅本人）
export function fileDeleteAPI(id) {
  return request({
    url: `/file/${id}`,
    method: 'delete'
  });
}

// 下载文件（返回二进制流，调用方自行处理 Blob）
export function fileDownloadAPI(id) {
  return request({
    url: `/file/${id}/download`,
    method: 'get',
    responseType: 'blob',
    timeout: 60000
  });
}
