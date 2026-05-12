<template>
  <div :class="classObj" class="app-wrapper">
    <div class="app-section">
      <AppSidebar class="sidebar-container" />
      <div class="app-content">
        <AppHeader />
        <AppMain />
      </div>
    </div>
  </div>
</template>

<script setup>
import AppHeader from './components/AppHeader/index.vue';
import AppSidebar from './components/AppSidebar/index.vue';
import AppMain from './components/AppMain/index.vue';
import { useAppStore } from '@/store';
import { computed } from 'vue';

const appStore = useAppStore();

const classObj = computed(() => {
  return {
    hideSidebar: !appStore.sidebar.opened,
    openSidebar: appStore.sidebar.opened
  };
});
</script>

<style lang="scss" scoped>
.app-wrapper {
  height: 100%;

  .app-section {
    height: 100%;
    position: relative;
    overflow: hidden;
    display: flex;
  }

  .app-content {
    position: relative;
    margin-left: 210px;
    flex: 1;
    background: white;
    overflow: hidden;
    height: 100%;
    transition: margin-left 0.28s;
  }
}
</style>
