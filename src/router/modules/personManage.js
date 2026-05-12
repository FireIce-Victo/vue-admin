export default {
  path: '/',
  meta: {
    title: '人员管理',
    icon: "dashboard"
  },
  redirect: '/person-manage',
  children: [
    {
      path: 'person-manage',
      name: 'person-manage',
      component: () => import('@/views/personManage/index.vue'),
      meta: {
        title: '人员管理'
      }
    }
  ]
};
