import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/index.vue';
import { userStore } from '@/stores/modules/user';

const modules = import.meta.glob('./modules/*.js', { eager: true });

const moduleRoutes = Object.values(modules).map(module => module.default);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: moduleRoutes
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 })
});

// ========== 调试模式：true = 跳过登录校验，false = 恢复登录校验 ==========
const DEBUG_SKIP_LOGIN = true

router.beforeEach((to, from, next) => {
  if (DEBUG_SKIP_LOGIN) {
    next()
    return
  }

  const store = userStore();

  if (to.path !== '/login') {
    if (!store.loginStatus) {
      next('/login');
    } else {
      next();
    }
  } else {
    if (store.loginStatus) {
      next('/dashboard');
    } else {
      next();
    }
  }
});

export default router;
