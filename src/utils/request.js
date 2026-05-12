import axios from 'axios';
import { ElMessage } from 'element-plus';

// 创建axios实例
const service = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// 请求拦截器
service.interceptors.request.use(
  (config) => {
    // 在发送请求之前做些什么
    // 例如：添加token
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
  }
);

// 响应拦截器
service.interceptors.response.use(
  (response) => {
    // 对响应数据做点什么
    const res = response.data;

    // 根据后端返回的状态码判断请求是否成功
    if (res.code !== 200) {
      ElMessage.error(res.message || '请求失败');
      return Promise.reject(new Error(res.message || '请求失败'));
    }

    return res;
  },
  (error) => {
    // 对响应错误做点什么
    let message = '网络错误';

    if (error.response) {
      switch (error.response.status) {
        case 400:
          message = '请求参数错误';
          break;
        case 401:
          message = '未授权，请重新登录';
          // 可以在这里处理登出逻辑
          localStorage.removeItem('token');
          window.location.href = '/login';
          break;
        case 403:
          message = '拒绝访问';
          break;
        case 404:
          message = '请求的资源不存在';
          break;
        case 500:
          message = '服务器内部错误';
          break;
        default:
          message = `连接错误${error.response.status}`;
      }
    } else if (error.request) {
      message = '网络请求超时，请稍后重试';
    }

    ElMessage.error(message);
    return Promise.reject(error);
  }
);

/**
 * 封装请求函数
 * @param {Object} config - axios配置对象
 * @returns {Promise} - 返回Promise对象
 */
export function request(config) {
  return service(config);
}

/**
 * GET请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} config - 其他配置
 * @returns {Promise}
 */
export function get(url, params = {}, config = {}) {
  return service({
    url,
    method: 'get',
    params,
    ...config
  });
}

/**
 * POST请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} config - 其他配置
 * @returns {Promise}
 */
export function post(url, data = {}, config = {}) {
  return service({
    url,
    method: 'post',
    data,
    ...config
  });
}

/**
 * PUT请求
 * @param {string} url - 请求地址
 * @param {Object} data - 请求数据
 * @param {Object} config - 其他配置
 * @returns {Promise}
 */
export function put(url, data = {}, config = {}) {
  return service({
    url,
    method: 'put',
    data,
    ...config
  });
}

/**
 * DELETE请求
 * @param {string} url - 请求地址
 * @param {Object} params - 请求参数
 * @param {Object} config - 其他配置
 * @returns {Promise}
 */
export function del(url, params = {}, config = {}) {
  return service({
    url,
    method: 'delete',
    params,
    ...config
  });
}

export default service;
