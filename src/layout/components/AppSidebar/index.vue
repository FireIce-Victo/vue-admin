<template>
  <div>
    <el-scrollbar wrap-class="scrollbar-wrapper">
      <el-menu
        :default-active="activeMenu"
        :unique-opened="true"
        background-color="black"
        text-color="white"
        active-text-color="#829BB8"
        :collapse="collapsed"
      >
        <sidebar-item
          v-for="route in menuRoutes"
          :key="route.path"
          :item="route"
          :base-path="route.path"
        />
        <div class="hamburger-btn">
          <el-menu-item index="1" @click="toggleSidebar">
            <el-icon :size="18">
              <component :is="!collapsed ? Expand : Fold" />
            </el-icon>
            <span style="padding-left: 5px;">{{ collapsed ? '展开菜单' : '关闭菜单' }}</span>
          </el-menu-item>
        </div>
      </el-menu>
    </el-scrollbar>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import SidebarItem from './SidebarItem.vue';
import { Expand, Fold } from '@element-plus/icons-vue';
import { useAppStore } from '@/store';

const appStore = useAppStore();

const collapsed = computed(() => {
  return !appStore.sidebar.opened;
});

const router = useRouter();

const activeMenu = computed(() => router.currentRoute.value.path);

const menuRoutes = computed(() => {
  const rootRoute = router.options.routes.find(r => r.path === '/');
  return rootRoute?.children || [];
});

function toggleSidebar() {
  console.log(collapsed)
  appStore.toggleSidebar();
}
</script>

<style lang="scss" scoped>
:deep(.el-scrollbar__view) {
  margin-top: 30px;
}
</style>
