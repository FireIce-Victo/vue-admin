<template>
  <div>
    <SvgIcon v-if="icon" :size="iconSize" :icon-class="icon" />
    <span v-if="title">{{ title }}</span>
  </div>
</template>

<script setup>
import SvgIcon from '@/components/SvgIcon/index.vue';

const props = defineProps({
  title: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: ''
  },
  iconSize: {
    type: String,
    default: '1em'
  }
});
</script>
