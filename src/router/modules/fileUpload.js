export default {
  path: '/file-upload',
  meta: {
    icon: 'fileUpload'
  },
  order: 7,
  redirect: '/file-upload',
  children: [
    {
      path: '',
      name: 'FileUpload',
      component: () => import('@/views/fileUpload/index.vue'),
      meta: {
        title: '文件上传',
        perms: ['file:upload:page']
      }
    }
  ]
};