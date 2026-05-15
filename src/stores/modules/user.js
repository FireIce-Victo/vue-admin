import { loginAPI } from '@/api/login';
import { useStorage } from '@vueuse/core';
import { defineStore } from 'pinia';

export const userStore = defineStore('user', () => {
  const token = useStorage('TOKEN', '');
  const userInfo = useStorage('USER_INFO', '');
  const loginStatus = useStorage('LOGIN_STATUS', false)

  // 登录
  function login(loginForm) {
    return new Promise((resolve, reject) => {
      loginAPI(loginForm)
        .then(res => {
          token.value = res.token;
          loginStatus.value = true;
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  return { token, login, loginStatus };
});
