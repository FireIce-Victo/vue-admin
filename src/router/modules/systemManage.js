export default {
  path: '/system-manage',
  name: 'SystemManage',
  meta: {
    title: '系统管理',
    icon: 'system'
  },
  redirect: '/system-manage/menu-manage',
  children: [
    {
      path: 'menu-manage',
      name: 'MenuManage',
      component: () => import('@/views/systemManage/menuManage/index.vue'),
      meta: {
        title: '菜单管理'
      }
    },
    {
      path: 'log-manage',
      name: 'LogManage',
      component: () => import('@/views/systemManage/logManage/index.vue'),
      meta: {
        title: '操作日志'
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