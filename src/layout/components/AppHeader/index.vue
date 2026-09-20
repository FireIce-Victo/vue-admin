<template>
  <div class="app-header">
    <div class="navbar">
      <Hamburger
        class="hamburger-container"
        :collapsed="store.sidebar.opened"
        @toggleClick="toggleSideBar"
      />
      <Breadcrumb class="bread-crumb" />

      <!-- 右侧用户区：退出登录入口 -->
      <div class="navbar-right">
        <el-dropdown trigger="click" @command="handleCommand">
          <span class="user-info">
            <el-avatar :size="26" class="user-avatar">{{ avatarText }}</el-avatar>
            <span class="user-name">{{ displayName }}</span>
            <el-icon class="arrow"><ArrowDown /></el-icon>
          </span>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="logout">
                <el-icon><SwitchButton /></el-icon>退出登录
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage, ElMessageBox } from 'element-plus';
import { ArrowDown, SwitchButton } from '@element-plus/icons-vue';
import Breadcrumb from '@/components/Breadcrumb/index.vue';
import Hamburger from '@/components/Hamburger/index.vue';
import { useAppStore, userStore, useTagsViewStore } from '@/stores';
import { logoutAPI } from '@/api/login';

const store = useAppStore();
const router = useRouter();
const user = userStore();
const tagsViewStore = useTagsViewStore();

const loggingOut = ref(false);

const displayName = computed(() => user.userInfo?.realName || user.userInfo?.username || '未登录');
const avatarText = computed(() => displayName.value.charAt(0));

function toggleSideBar() {
  store.toggleSidebar();
}

function handleCommand(command) {
  if (command === 'logout') handleLogout();
}

async function handleLogout() {
  if (loggingOut.value) return; // 幂等：防重复触发

  try {
    await ElMessageBox.confirm('确认退出登录？', '提示', {
      type: 'warning',
      confirmButtonText: '退出',
      cancelButtonText: '取消'
    });
  } catch {
    return; // 用户取消
  }

  loggingOut.value = true;
  try {
    // ① 通知后端吊销 token（必须在清 token 之前，否则请求会缺 token 被拒）
    //    失败不能阻塞本地登出：网络异常 / token 已过期都要继续往下走
    try {
      await logoutAPI();
    } catch {
      /* 忽略：本地登出继续 */
    }

    // ② 清标签页 + keep-alive 缓存（必须先于清登录态，避免旧账号数据被渲染）
    await tagsViewStore.delAllViews();
    // ③ 清 token / loginStatus / perms / userInfo
    user.logout();
    // ④ 跳登录页（replace 不留历史，防止「后退」回到已登录页面）
    await router.replace('/login');
    ElMessage.success('已退出登录');
  } catch {
    window.location.href = '/login'; // 兜底：路由异常时硬跳转
  } finally {
    loggingOut.value = false;
  }
}

// 多标签页退出同步：其他标签页退出后，本页的 loginStatus 会经 storage 事件变为 false，
// 这里立即跳登录页，避免停留在「已登出但界面还在」的状态
watch(
  () => user.loginStatus,
  (val) => {
    if (!val && router.currentRoute.value.path !== '/login') {
      router.replace('/login');
    }
  }
);
</script>

<style lang="scss" scoped>
.app-header {
  height: 50px;
  position: relative;
  background-color: white;
  border: 1px solid gray;

  .navbar {
    height: 50px;
    overflow: hidden;
    position: relative;
    display: flex;

    .bread-crumb {
      padding-top: 10px;
      padding-left: 10px;
    }

    .hamburger-container {
      line-height: 46px;
      height: 100%;
      cursor: pointer;
      transition: background 0.3s;
      -webkit-tap-highlight-color: transparent;
    }

    .navbar-right {
      margin-left: auto;
      display: flex;
      align-items: center;
      padding-right: 16px;

      .user-info {
        display: flex;
        align-items: center;
        gap: 8px;
        cursor: pointer;
        outline: none;
        color: #303133;
        font-size: 14px;
      }

      .user-avatar {
        background: #5470c6;
        color: #fff;
        font-size: 13px;
      }

      .arrow {
        font-size: 12px;
        color: #909399;
      }
    }
  }
}
</style>
