export default {
  path: '/websocket',
  meta: {
    icon: 'webSocket'
  },
  order: 6,
  redirect: '/websocket',
  children: [
    {
      path: '',
      name: 'WebSocket',
      component: () => import('@/views/websocket/index.vue'),
      meta: {
        title: 'WebSocket',
        perms: ['ws:chat:page']
      }
    }
  ]
};