<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <span>数据展示</span>
      </template>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="date" label="日期" width="180"></el-table-column>
        <el-table-column prop="name" label="姓名" width="180"></el-table-column>
        <el-table-column prop="address" label="地址"></el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
const tableData = [
  {
    date: '2024-01-01',
    name: '张三',
    address: '北京市朝阳区'
  },
  {
    date: '2024-01-02',
    name: '李四',
    address: '上海市浦东新区'
  },
  {
    date: '2024-01-03',
    name: '王五',
    address: '广州市天河区'
  }
];
</script>
