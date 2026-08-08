export default {
  path: '/table-show',
  meta: {
    icon: 'table'
  },
  order: 4,
  redirect: '/table-show',
  children: [
    {
      path: '',
      name: 'TableShow',
      component: () => import('@/views/tableShow/index.vue'),
      meta: {
        title: '表格展示'
      }
    }
  ]
};
