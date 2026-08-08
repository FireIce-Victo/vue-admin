export default {
  path: '/',
  meta: {
    icon: 'dashboard'
  },
  order: 1,
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
