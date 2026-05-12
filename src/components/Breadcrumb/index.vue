<template>
  <el-breadcrumb class="app-breadcrumb">
    <transition-group name="breadcrumb">
      <el-breadcrumb-item v-for="(item, index) in breadcrumbList" :key="item.path">
        <span
          v-if="item.redirect === 'noredirect' || index === breadcrumbList.length - 1"
          class="no-redirect"
        >
          {{ item.meta.title }}
        </span>
        <a v-else @click.prevent="handleLink(item)">{{ item.meta.title }}</a>
      </el-breadcrumb-item>
    </transition-group>
  </el-breadcrumb>
</template>

<script setup>
import { onBeforeMount, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { compile } from 'path-to-regexp';
import router from '@/router';

const route = useRoute();
const breadcrumbList = ref([]);

const pathCompile = path => {
  const { params } = route;
  const toPath = compile(path);
  return toPath(params);
};

const getBreadCrumbList = () => {
  let matched = route.matched.filter(item => item.meta && item.meta.title);
//   const first = matched[0];
//   if (!isDashboard(first)) {
//     matched = [{ path: '/dashboard', meta: { title: '首页' } }].concat(matched);
//   }
  breadcrumbList.value = matched.filter(
    item => item.meta && item.meta.title && item.meta.breadcrumb !== false
  );
};

function isDashboard(route) {
  const name = route && route.name;
  if (!name) {
    return false;
  }
  return name.toString().trim().toLocaleLowerCase() === 'Dashboard'.toLocaleLowerCase();
}

const handleLink = item => {
  const { redirect, path } = item;
  if (redirect) {
    router.push(redirect);
    return;
  }
  router.push(pathCompile(path));
};

watch(
  () => route.path,
  path => {
    if (path.startsWith('/redirect/')) {
      return;
    }
    getBreadCrumbList();
  }
);

onBeforeMount(() => {
  getBreadCrumbList();
});
</script>

<style lang="scss" scoped>
.app-breadcrumb.el-breadcrumb {
  line-height: 50px;
  margin-left: 5px;

  .no-redirect {
    color:#fff;
    cursor: text;
  }
}
</style>
