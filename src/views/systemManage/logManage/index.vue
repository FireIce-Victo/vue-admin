<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>操作日志</span>
        </div>
      </template>

      <!-- 筛选 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="操作人">
          <el-input v-model="searchForm.operator" placeholder="请输入操作人" clearable />
        </el-form-item>
        <el-form-item label="操作类型">
          <el-select v-model="searchForm.type" placeholder="请选择" clearable>
            <el-option label="新增" value="create" />
            <el-option label="修改" value="update" />
            <el-option label="删除" value="delete" />
            <el-option label="登录" value="login" />
            <el-option label="导出" value="export" />
          </el-select>
        </el-form-item>
        <el-form-item label="操作时间">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            value-format="YYYY-MM-DD"
          />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="logList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="operator" label="操作人" width="120" />
        <el-table-column prop="action" label="操作描述" min-width="200" />
        <el-table-column prop="type" label="操作类型" width="100">
          <template #default="{ row }">
            <el-tag :type="getTypeTag(row.type)" size="small">
              {{ getTypeLabel(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="module" label="操作模块" width="120" />
        <el-table-column prop="ip" label="IP地址" width="140" />
        <el-table-column prop="createTime" label="操作时间" width="180" />
        <el-table-column label="操作" width="100" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleDetail(row)">详情</el-button>
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
        @size-change="handleSearch"
        @current-change="handleSearch"
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  operator: '',
  type: '',
  dateRange: []
})

const TYPE_MAP = {
  create: '新增',
  update: '修改',
  delete: '删除',
  login: '登录',
  export: '导出'
}

function getTypeLabel(type) {
  return TYPE_MAP[type] || type
}

function getTypeTag(type) {
  const map = { create: 'success', update: 'primary', delete: 'danger', login: 'info', export: 'warning' }
  return map[type] || 'info'
}

const logList = ref([
  { id: 1, operator: 'admin', action: '修改了角色【管理员】的权限配置', type: 'update', module: '角色管理', ip: '192.168.1.100', createTime: '2026-05-25 14:30:00' },
  { id: 2, operator: 'admin', action: '新增用户【张三】', type: 'create', module: '用户管理', ip: '192.168.1.100', createTime: '2026-05-25 13:20:00' },
  { id: 3, operator: 'zhangsan', action: '登录系统', type: 'login', module: '系统登录', ip: '192.168.1.50', createTime: '2026-05-25 12:00:00' },
  { id: 4, operator: 'admin', action: '删除菜单【文档中心】', type: 'delete', module: '菜单管理', ip: '192.168.1.100', createTime: '2026-05-25 11:45:00' },
  { id: 5, operator: 'lisi', action: '导出用户数据报表', type: 'export', module: '用户管理', ip: '192.168.1.30', createTime: '2026-05-25 10:30:00' },
  { id: 6, operator: 'admin', action: '修改系统基础配置', type: 'update', module: '系统配置', ip: '192.168.1.100', createTime: '2026-05-25 09:15:00' }
])

total.value = logList.value.length

function handleSearch() {
  // TODO: 接入接口 fetchLogList({ ...searchForm, currentPage: currentPage.value, pageSize: pageSize.value })
}

function handleReset() {
  searchForm.operator = ''
  searchForm.type = ''
  searchForm.dateRange = []
  currentPage.value = 1
  handleSearch()
}

function handleDetail(row) {
  // TODO: 弹窗展示详情或跳转详情页
  console.log('查看日志详情：', row)
}
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.search-form {
  margin-bottom: 16px;
}
</style>