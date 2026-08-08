export default {
  path: '/charts-show',
  meta: {
    icon: 'chart'
  },
  order: 5,
  redirect: '/charts-show',
  children: [
    {
      path: '',
      name: 'ChartsShow',
      component: () => import('@/views/chartsShow/index.vue'),
      meta: {
        title: '可视化图表'
      }
    }
  ]
};
