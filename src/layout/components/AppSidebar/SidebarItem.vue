<template>
  <div v-if="!item.hidden">
    <template
      v-if="
        hasOneShowingChild(item.children) &&
        (!onlyOneChild.children || onlyOneChild.noShowingChildren) &&
        !item.meta?.alwaysShow
      "
    >
      <AppLink v-if="onlyOneChild.meta" :to="resolvePath(onlyOneChild.path)">
        <el-menu-item :index="resolvePath(onlyOneChild.path)">
          <Item
            :title="onlyOneChild.meta.title"
            :icon="onlyOneChild.meta.icon || (item.meta && item.meta.icon)"
            icon-size="1em"
          />
        </el-menu-item>
      </AppLink>
    </template>

    <el-sub-menu v-else popper-append-to-body :index="resolvePath(item.path)">
      <template #title>
        <Item
          v-if="item.meta"
          icon-size="1em"
          :icon="item.meta && item.meta.icon"
          :title="item.meta.title"
        />
      </template>
      <sidebar-item
        v-for="child in item.children"
        :key="child.path"
        :item="child"
        :base-path="item.path"
        :is-nest="true"
        class="nest-menu"
      />
    </el-sub-menu>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import path from 'path-browserify';
import { isExternalLink } from '@/utils';
import Item from '@/layout/components/AppSidebar/Item.vue';
import AppLink from './Link.vue';

const props = defineProps({
  item: {
    type: Object,
    required: true,
    default: () => {}
  },
  basePath: {
    type: String,
    default: '',
    required: true
  },
  isNest: {
    type: Boolean,
    default: false
  }
});

const onlyOneChild = ref(null);

/**
 * 判断当前路由是否只有一个子路由
 * @param children
 */
const hasOneShowingChild = (children = []) => {
  const showingChildren = children.filter(item => {
    if (item?.hidden) {
      return false;
    }
    onlyOneChild.value = item;
    return true;
  });

  if (showingChildren.length === 1) {
    return true;
  }

  if (showingChildren.length === 0) {
    onlyOneChild.value = { ...props.item, noShowingChildren: true };
    return true;
  }

  return false;
};

/**
 * 解析路由的路径
 * @param routePath
 */
const resolvePath = routePath => {
  if (isExternalLink(routePath)) {
    return routePath;
  }
  if (isExternalLink(props.basePath)) {
    return props.basePath;
  }
  return path.resolve(props.basePath, routePath);
};
</script>
