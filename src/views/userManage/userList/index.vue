<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户列表</span>
          <el-button type="primary" @click="handleCreate">新增用户</el-button>
        </div>
      </template>

      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.username" placeholder="请输入用户名" clearable />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable>
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item label="手机号">
          <el-input v-model="searchForm.phone" placeholder="请输入手机号" clearable />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="username" label="用户名" min-width="120" />
        <el-table-column prop="nickname" label="昵称" min-width="120" />
        <el-table-column prop="phone" label="手机号" width="140" />
        <el-table-column prop="email" label="邮箱" min-width="160" />
        <el-table-column prop="role" label="角色" width="100">
          <template #default="{ row }">
            <el-tag :type="getRoleTagType(row.role)" size="small">{{ ROLES[row.role] || row.role }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="warning" link @click="handleResetPwd(row)">重置密码</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
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
      />
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const ROLES = { admin: '管理员', editor: '编辑者', viewer: '普通用户' }

function getRoleTagType(role) {
  const map = { admin: 'danger', editor: 'warning' }
  return map[role] || 'info'
}

const loading = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

const searchForm = reactive({
  username: '',
  status: '',
  phone: ''
})

const userList = ref([
  { id: 1, username: 'admin', nickname: '系统管理员', phone: '13800138000', email: 'admin@example.com', role: 'admin', status: 1, createTime: '2026-01-15 10:00:00' },
  { id: 2, username: 'zhangsan', nickname: '张三', phone: '13800138001', email: 'zhangsan@example.com', role: 'editor', status: 1, createTime: '2026-02-20 14:30:00' },
  { id: 3, username: 'lisi', nickname: '李四', phone: '13800138002', email: 'lisi@example.com', role: 'viewer', status: 1, createTime: '2026-03-10 09:15:00' },
  { id: 4, username: 'wangwu', nickname: '王五', phone: '13800138003', email: 'wangwu@example.com', role: 'viewer', status: 0, createTime: '2026-04-05 16:45:00' },
  { id: 5, username: 'zhaoliu', nickname: '赵六', phone: '13800138004', email: 'zhaoliu@example.com', role: 'editor', status: 1, createTime: '2026-05-01 11:00:00' }
])

total.value = userList.value.length

function handleSearch() {
  // TODO: userApi.fetchList({ ...searchForm, currentPage: currentPage.value, pageSize: pageSize.value })
}

function handleReset() {
  searchForm.username = ''
  searchForm.status = ''
  searchForm.phone = ''
  currentPage.value = 1
}

function handleCreate() {
  // TODO: 打开新增用户弹窗
  ElMessage.info('新增用户功能')
}

function handleEdit(row) {
  // TODO: 打开编辑用户弹窗
  ElMessage.info('编辑用户：' + row.username)
}

function handleResetPwd(row) {
  ElMessageBox.confirm(`确认要重置用户【${row.username}】的密码吗？`, '提示', { type: 'warning' })
    .then(() => {
      // TODO: userApi.resetPwd(row.id)
      ElMessage.success('密码已重置')
    })
    .catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认要删除用户【${row.username}】吗？此操作不可恢复。`, '警告', { type: 'warning', confirmButtonType: 'danger' })
    .then(() => {
      // TODO: userApi.delete(row.id)
      ElMessage.success('删除成功')
    })
    .catch(() => {})
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