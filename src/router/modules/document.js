export default {
  path: '/',
  meta: {
    title: '文档中心',
    icon: "dashboard"
  },
  redirect: '/document',
  children: [
    {
      path: 'document',
      name: 'document',
      component: () => import('@/views/document/index.vue'),
      meta: {
        title: '文档列表'
      }
    }
  ]
};
