export default {
  path: '/system-manage',
  name: 'SystemManage',
  meta: {
    title: '系统管理',
    icon: 'system'
  },
  order: 2,
  redirect: '/system-manage/user-manage',
  children: [
    {
      path: 'user-manage',
      name: 'UserManage',
      component: () => import('@/views/systemManage/userManage/index.vue'),
      meta: {
        title: '用户管理'
      }
    },
    {
      path: 'role-manage',
      name: 'RoleManage',
      component: () => import('@/views/systemManage/roleManage/index.vue'),
      meta: {
        title: '角色管理'
      }
    },
    {
      path: 'permission-manage',
      name: 'PermissionManage',
      component: () => import('@/views/systemManage/permissionManage/index.vue'),
      meta: {
        title: '权限管理'
      }
    }
  ]
};
