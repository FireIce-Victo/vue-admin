export default {
  path: '/',
  meta: {
    title: '首页',
    icon: "dashboard"
  },
  redirect: '/dashboard',
  children: [
    {
      path: 'dashboard',
      name: 'dashboard',
      component: () => import('@/views/dashboard/index.vue'),
      meta: {
        title: '首页',
      }
    }
  ]
};
