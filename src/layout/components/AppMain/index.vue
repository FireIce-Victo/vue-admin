<template>
  <section class="app-main">
    <router-view v-slot="{ Component, route }">
      <transition name="fade-transform" mode="out-in">
        <keep-alive :include="tagsViewStore.cachedViews">
          <component :is="Component" :key="route.fullPath" />
        </keep-alive>
      </transition>
    </router-view>
  </section>
</template>

<script setup>
import { useTagsViewStore } from '@/store';

const tagsViewStore = useTagsViewStore();
</script>

<style scoped lang="scss">
.app-main {
  height: calc(100% - 80px);
  overflow-x: hidden;
  overflow-y: auto;
}

.fixed-heaader + .app-main {
  padding-top: 50px;
}
</style>
