import { createRouter, createWebHistory } from 'vue-router';
import { ElMessage } from 'element-plus';
import Layout from '@/layout/index.vue';
import { userStore } from '@/stores/modules/user';
import { hasAnyPerm, isPreviewMode } from '@/utils/permission';

const modules = import.meta.glob('./modules/*.js', { eager: true });

const moduleRoutes = Object.values(modules).map(module => module.default).sort((a,b) => a.order - b.order);

const routes = [
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/login/index.vue'),
    meta: {
      title: '登录'
    }
  },
  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: moduleRoutes
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0, left: 0 })
});

// 调试开关：仅开发环境且显式配置时才跳过登录（.env.development 中 VITE_SKIP_LOGIN=true）
const DEBUG_SKIP_LOGIN = isPreviewMode

router.beforeEach(async (to) => {
  if (DEBUG_SKIP_LOGIN) return true

  const store = userStore();

  if (to.path === '/login') {
    if (store.loginStatus) return '/dashboard'
    return true
  }

  if (!store.loginStatus) return '/login'

  // 首次进入时加载权限（只加载一次）
  if (!store.perms.length) {
    try { await store.loadPerms() }
    catch { /* 加载失败放行，由接口 401 兜底 */ }
  }

  // 路由级权限：meta.perms 任一命中即可
  if (to.meta?.perms?.length && !hasAnyPerm(to.meta.perms)) {
    ElMessage.warning('暂无访问权限')
    return to.path === '/dashboard' ? '/login' : '/dashboard'
  }
  return true
});

export default router;