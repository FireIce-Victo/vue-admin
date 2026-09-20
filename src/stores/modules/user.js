import { loginAPI } from '@/api/login';
import { sysUserMyPermsAPI } from '@/api/user';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

export const userStore = defineStore('user', () => {
  const token = useStorage('ACCESS_TOKEN', '');
  const loginStatus = useStorage('LOGIN_STATUS', false)
  // 权限编码集合，localStorage 持久化（刷新不丢）；'*' 表示超管
  const perms = useStorage('USER_PERMS', [])
  // 登录用户信息（登录响应里本来就有，之前被丢弃了）
  const userInfo = useStorage('USER_INFO', {})

  // 登录
  function login(loginForm) {
    return new Promise((resolve, reject) => {
      loginAPI(loginForm)
        .then(res => {
          token.value = res.accessToken;
          userInfo.value = res.user || {};
          loginStatus.value = true;
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  // 拉取当前用户权限编码
  async function loadPerms() {
    const res = await sysUserMyPermsAPI()
    perms.value = res.data || []
    return perms.value
  }

  // 登出：清空状态
  function logout() {
    token.value = ''
    loginStatus.value = false
    perms.value = []
    userInfo.value = {}
  }

  return { token, login, loginStatus, perms, userInfo, loadPerms, logout };
});