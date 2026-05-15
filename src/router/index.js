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

router.beforeEach((to, from, next) => {
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
