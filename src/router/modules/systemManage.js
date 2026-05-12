export default {
  path: '/system-manage',
  name: 'SystemManage',
  meta: {
    title: '系统管理',
    icon: "dashboard"
  },
  redirect: '/system-manage/basic-config',
  children: [
    {
      path: 'basic-config',
      name: 'BasicConfig',
      component: () => import('@/views/systemManage/basicConfig/index.vue'),
      meta: {
        title: '基础配置'
      }
    },
    {
      path: 'security',
      name: 'Security',
      component: () => import('@/views/systemManage/security/index.vue'),
      meta: {
        title: '安全设置'
      }
    }
  ]
};
