<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleCreate">新增角色</el-button>
        </div>
      </template>

      <el-table :data="roleList" v-loading="loading" style="width: 100%">
        <el-table-column type="index" label="#" width="60" />
        <el-table-column prop="name" label="角色名称" min-width="140" />
        <el-table-column prop="code" label="角色编码" min-width="140" />
        <el-table-column prop="description" label="描述" min-width="220" show-overflow-tooltip />
        <el-table-column prop="userCount" label="用户数" width="90" align="center" />
        <el-table-column prop="status" label="状态" width="90" align="center">
          <template #default="{ row }">
            <el-tag :type="row.status === 1 ? 'success' : 'danger'" size="small">
              {{ row.status === 1 ? '启用' : '禁用' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="180" />
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handlePermission(row)">权限分配</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'

const loading = ref(false)

const roleList = ref([
  { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', userCount: 1, status: 1, createTime: '2026-01-15 10:00:00' },
  { id: 2, name: '编辑者', code: 'editor', description: '具备内容编辑和发布的权限', userCount: 2, status: 1, createTime: '2026-02-20 14:30:00' },
  { id: 3, name: '普通用户', code: 'viewer', description: '仅具备基础查看权限', userCount: 5, status: 1, createTime: '2026-03-10 09:15:00' },
  { id: 4, name: '审计员', code: 'auditor', description: '具备日志查看和审计权限', userCount: 0, status: 0, createTime: '2026-04-05 16:45:00' }
])

function handleCreate() {
  // TODO: 打开新增角色弹窗
  ElMessage.info('新增角色功能')
}

function handleEdit(row) {
  // TODO: 打开编辑角色弹窗
  ElMessage.info('编辑角色：' + row.name)
}

function handlePermission(row) {
  // TODO: 打开权限分配弹窗
  ElMessage.info('分配角色【' + row.name + '】的权限')
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认要删除角色【${row.name}】吗？此操作不可恢复。`, '警告', { type: 'warning', confirmButtonType: 'danger' })
    .then(() => {
      // TODO: roleApi.delete(row.id)
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
</style>