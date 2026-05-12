export default {
  path: '/user-manage',
  name: 'UserManage',
  meta: {
    title: '用户管理',
    icon: "dashboard"
  },
  redirect: '/user-manage/role-manage',
  children: [
    {
      path: 'role-manage',
      name: 'RoleManage',
      component: () => import('@/views/userManage/roleManage/index.vue'),
      meta: {
        title: '角色管理'
      }
    },
    {
      path: 'user-list',
      name: 'UserList',
      component: () => import('@/views/userManage/userList/index.vue'),
      meta: {
        title: '用户列表'
      }
    }
  ]
};
