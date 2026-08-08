<template>
  <el-pagination
    class="pagination"
    :current-page="currentPage"
    :page-size="pageSize"
    :page-sizes="pageSizes"
    :total="total"
    :layout="layout"
    @size-change="sizeChange"
    @current-change="currentChange"
  />
</template>

<script setup>
defineOptions({
  name: 'Pagination'
});

defineProps({
  currentPage: {
    type: Number,
    default: 1
  },
  pageSize: {
    type: Number,
    default: 10
  },
  pageSizes: {
    type: Array,
    default: () => [10, 20, 50, 100]
  },
  total: {
    type: Number,
    default: 0
  },
  layout: {
    type: String,
    default: 'total, sizes, prev, pager, next, jumper'
  }
});
const emits = defineEmits(['update:currentPage', 'update:pageSize', 'change']);

const sizeChange = pageSize => {
  emits('update:pageSize', pageSize);
};

const currentChange = currentPage => {
  emits('update:currentPage', currentPage);
};

const change = () => {
  emits('change');
};
</script>

<style lang="scss" scoped>
.pagination {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  margin-top: 20px;
}
</style>
