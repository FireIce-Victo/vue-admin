<template>
  <div class="app-header">
    <Breadcrumb class="bread-crumb" />
  </div>
</template>

<script setup>
import Breadcrumb from '@/components/Breadcrumb/index.vue';
</script>

<style lang="scss" scoped>
.app-header {
  height: 80px;
  position: relative;
  background-color: black;

  .bread-crumb {
    padding-top: 15px;
    padding-left: 15px;
  }
}
</style>
