export default {
  path: '/map-show',
  meta: {
    icon: 'map'
  },
  order: 3,
  redirect: '/map-show',
  children: [
    {
      path: '',
      name: 'MapShow',
      component: () => import('@/views/mapShow/index.vue'),
      meta: {
        title: '地图展示'
      }
    }
  ]
};
