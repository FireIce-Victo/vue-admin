<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>人员列表</span>
          <el-button type="primary">添加人员</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="姓名">
          <el-input v-model="searchForm.name" placeholder="请输入姓名"></el-input>
        </el-form-item>
        <el-form-item label="部门">
          <el-select v-model="searchForm.department" placeholder="请选择部门">
            <el-option label="技术部" value="tech"></el-option>
            <el-option label="产品部" value="product"></el-option>
            <el-option label="运营部" value="operation"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary">查询</el-button>
          <el-button>重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="personList" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80"></el-table-column>
        <el-table-column prop="name" label="姓名" width="120"></el-table-column>
        <el-table-column prop="age" label="年龄" width="80"></el-table-column>
        <el-table-column prop="department" label="部门" width="120"></el-table-column>
        <el-table-column prop="position" label="职位" width="120"></el-table-column>
        <el-table-column prop="phone" label="联系电话" width="150"></el-table-column>
        <el-table-column prop="email" label="邮箱"></el-table-column>
        <el-table-column label="操作" width="180">
          <template #default>
            <el-button type="primary" link>编辑</el-button>
            <el-button type="danger" link>删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50, 100]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 20px; justify-content: flex-end"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const searchForm = ref({
  name: '',
  department: ''
});

const personList = ref([
  {
    id: 1,
    name: '张三',
    age: 28,
    department: '技术部',
    position: '前端工程师',
    phone: '13800138001',
    email: 'zhangsan@example.com'
  },
  {
    id: 2,
    name: '李四',
    age: 32,
    department: '产品部',
    position: '产品经理',
    phone: '13800138002',
    email: 'lisi@example.com'
  },
  {
    id: 3,
    name: '王五',
    age: 25,
    department: '技术部',
    position: '后端工程师',
    phone: '13800138003',
    email: 'wangwu@example.com'
  },
  {
    id: 4,
    name: '赵六',
    age: 30,
    department: '运营部',
    position: '运营专员',
    phone: '13800138004',
    email: 'zhaoliu@example.com'
  }
]);

const currentPage = ref(1);
const pageSize = ref(10);
const total = ref(4);
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 20px;
}
</style>
