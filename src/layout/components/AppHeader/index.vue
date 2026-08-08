<template>
  <div class="app-header">
    <div class="navbar">
      <Hamburger
        class="hamburger-container"
        :collapsed="store.sidebar.opened"
        @toggleClick="toggleSideBar"
      />
      <Breadcrumb class="bread-crumb" />
    </div>
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/Breadcrumb/index.vue';
import Hamburger from '@/components/Hamburger/index.vue';
import { useAppStore } from '@/stores';

const store = useAppStore();

function toggleSideBar() {
  store.toggleSidebar();
}
</script>

<style lang="scss" scoped>
.app-header {
  height: 50px;
  position: relative;
  background-color: white;

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
  }
}
</style>
