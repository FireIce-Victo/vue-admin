<template>
  <a v-if="isExternalLink(props.to)" :href="props.to" target="_blank" rel="noopener">
    <slot />
  </a>
  <router-link v-else :to="props.to">
    <slot />
  </router-link>
</template>

<script setup>
import { isExternalLink } from '@/utils';

const props = defineProps({
  to: {
    type: String,
    required: true
  }
});
</script>
