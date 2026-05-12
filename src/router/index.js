import { createRouter, createWebHistory } from 'vue-router';
import Layout from '@/layout/index.vue';
const modules = import.meta.glob('./modules/*.js', { eager: true });

const moduleRoutes = Object.values(modules).map(module => module.default);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录',
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

// 路由守卫：未登录跳转到登录页
// router.beforeEach((to, from) => {
//   if (to.path !== '/login') {
//     return '/login'
//   } else if (to.path === '/dashboard') {
//     return '/dashboard';
//   }
// });

export default router;
