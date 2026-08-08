<template>
  <div class="app-hamburger" @click="toggleClick">
    <el-icon :size="25">
      <component :is="!collapsed ? Expand : Fold" class="hamburger"/>
    </el-icon>
  </div>
</template>

<script setup>
import { Expand, Fold } from '@element-plus/icons-vue';

defineProps({
  collapsed: {
    type: Boolean,
    default: false
  }
});
const emits = defineEmits(['toggleClick'])

function toggleClick() {
    emits('toggleClick')
}
</script>

<style lang="scss" scoped>
.app-hamburger {
    padding: 8px 0px 0 20px;
}

.hamburger {
    display: inline-block;
    vertical-align: middle;
    color: black;
}
</style>
