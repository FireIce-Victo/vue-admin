<template>
  <div class="person-manage app-container">
    <el-card shadow="never" class="search-card">
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名称">
          <el-input
            v-model="searchForm.name"
            placeholder="请输入用户名称"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="角色">
          <el-select
            v-model="searchForm.role"
            placeholder="请选择角色"
            clearable
            style="width: 180px"
          >
            <el-option
              v-for="item in ROLE_OPTIONS"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">
            <el-icon><Search /></el-icon>
            <span>查询</span>
          </el-button>
          <el-button @click="handleReset">
            <el-icon><Refresh /></el-icon>
            <span>重置</span>
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="never" class="table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">人员列表</span>
          <div class="header-actions">
            <el-button type="danger" :disabled="selectedIds.length === 0" @click="handleBatchDelete">
              批量删除
            </el-button>
            <el-button type="primary" @click="handleAdd">
              <el-icon><Plus /></el-icon>
              <span>添加人员</span>
            </el-button>
          </div>
        </div>
      </template>

      <el-table
        ref="tableRef"
        v-loading="loading"
        :data="personList"
        style="width: 100%"
        @selection-change="handleSelectionChange"
      >
        <el-table-column type="selection" width="50" />
        <el-table-column prop="id" label="ID" width="80" />
        <el-table-column prop="name" label="用户名称" min-width="140" />
        <el-table-column prop="phone" label="电话号码" width="160" />
        <el-table-column prop="role" label="角色" width="140" />
        <el-table-column label="操作" width="180" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row.id)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrapper">
        <el-pagination
          v-model:current-page="pagination.currentPage"
          v-model:page-size="pagination.pageSize"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handlePageSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>

    <PersonDialog
      v-model="dialogVisible"
      :mode="dialogMode"
      :data="currentRow"
      @confirm="handleDialogConfirm"
    />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import PersonDialog from './PersonDialog.vue'

const searchForm = ref({
  name: '',
  role: ''
})

const personList = ref([])
const loading = ref(false)
const selectedIds = ref([])
const tableRef = ref(null)

const pagination = reactive({
  currentPage: 1,
  pageSize: 10,
  total: 0
})

const dialogVisible = ref(false)
const dialogMode = ref('add')
const currentRow = ref(null)

const roleTagTypes = {
  admin: 'danger',
  editor: 'warning',
  auditor: 'info',
  user: ''
}

function getRoleTagType(role) {
  return roleTagTypes[role] || 'info'
}

function handleSelectionChange(selection) {
  selectedIds.value = selection.map((item) => item.id)
}

function handleSearch() {
  pagination.currentPage = 1
  fetchPersonList()
}

function handleReset() {
  searchForm.value.name = ''
  searchForm.value.role = ''
  pagination.currentPage = 1
  fetchPersonList()
}

function handlePageChange(page) {
  pagination.currentPage = page
  fetchPersonList()
}

function handlePageSizeChange(size) {
  pagination.pageSize = size
  pagination.currentPage = 1
  fetchPersonList()
}

function handleAdd() {
  dialogMode.value = 'add'
  currentRow.value = null
  dialogVisible.value = true
}

function handleEdit(row) {
  dialogMode.value = 'edit'
  currentRow.value = { ...row }
  dialogVisible.value = true
}

async function handleDelete(id) {
  try {
    await ElMessageBox.confirm('确认删除该人员信息？', '删除确认', {
      type: 'warning',
      confirmButtonText: '确认',
      cancelButtonText: '取消'
    })
  } catch {
    return
  }
  try {
    await personApi.delete(id)
    ElMessage.success('删除成功')
    fetchPersonList()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleBatchDelete() {
  try {
    await ElMessageBox.confirm(
      `确认删除选中的 ${selectedIds.value.length} 条人员信息？`,
      '批量删除确认',
      {
        type: 'warning',
        confirmButtonText: '确认',
        cancelButtonText: '取消'
      }
    )
  } catch {
    return
  }
  try {
    await personApi.batchDelete(selectedIds.value)
    ElMessage.success('批量删除成功')
    fetchPersonList()
  } catch {
    ElMessage.error('批量删除失败')
  }
}

async function handleDialogConfirm(formData) {
  try {
    if (dialogMode.value === 'add') {
      await personApi.create(formData)
      ElMessage.success('添加成功')
    } else {
      await personApi.update(formData.id, formData)
      ElMessage.success('编辑成功')
    }
    dialogVisible.value = false
    fetchPersonList()
  } catch {
    ElMessage.error('操作失败')
  }
}

const personApi = {
  async fetchList(params) {
    const { currentPage, pageSize, name, role } = params
    const filtered = MOCK_DATA.filter((item) => {
      if (name && !item.name.includes(name)) return false
      if (role && item.role !== role) return false
      return true
    })
    const total = filtered.length
    const start = (currentPage - 1) * pageSize
    const list = filtered.slice(start, start + pageSize)
    return new Promise((resolve) => {
      setTimeout(() => resolve({ list, total }), 300)
    })
  },

  async create(data) {
    const newItem = {
      id: Math.max(0, ...MOCK_DATA.map((i) => i.id)) + 1,
      ...data
    }
    MOCK_DATA.unshift(newItem)
    return Promise.resolve(newItem)
  },

  async update(id, data) {
    const index = MOCK_DATA.findIndex((item) => item.id === id)
    if (index !== -1) {
      MOCK_DATA[index] = { ...MOCK_DATA[index], ...data }
    }
    return Promise.resolve(MOCK_DATA[index])
  },

  async delete(id) {
    const index = MOCK_DATA.findIndex((item) => item.id === id)
    if (index !== -1) {
      MOCK_DATA.splice(index, 1)
    }
    return Promise.resolve()
  },

  async batchDelete(ids) {
    ids.forEach((id) => {
      const index = MOCK_DATA.findIndex((item) => item.id === id)
      if (index !== -1) {
        MOCK_DATA.splice(index, 1)
      }
    })
    return Promise.resolve()
  }
}

async function fetchPersonList() {
  loading.value = true
  try {
    const { list, total } = await personApi.fetchList({
      currentPage: pagination.currentPage,
      pageSize: pagination.pageSize,
      name: searchForm.value.name,
      role: searchForm.value.role
    })
    personList.value = list
    pagination.total = total
    tableRef.value?.clearSelection()
  } finally {
    loading.value = false
  }
}

const MOCK_DATA = [
  { id: 1, name: '张伟', phone: '13800138001', role: 'admin' },
  { id: 2, name: '李娜', phone: '13800138002', role: 'editor' },
  { id: 3, name: '王强', phone: '13800138003', role: 'user' },
  { id: 4, name: '赵敏', phone: '13800138004', role: 'auditor' },
  { id: 5, name: '刘洋', phone: '13800138005', role: 'user' },
  { id: 6, name: '陈静', phone: '13800138006', role: 'editor' },
  { id: 7, name: '杨帆', phone: '13800138007', role: 'admin' },
  { id: 8, name: '黄磊', phone: '13800138008', role: 'user' },
  { id: 9, name: '周洁', phone: '13800138009', role: 'auditor' },
  { id: 10, name: '吴涛', phone: '13800138010', role: 'editor' },
  { id: 11, name: '徐悦', phone: '13800138011', role: 'user' },
  { id: 12, name: '孙鹏', phone: '13800138012', role: 'admin' },
  { id: 13, name: '马丽', phone: '13800138013', role: 'user' },
  { id: 14, name: '朱峰', phone: '13800138014', role: 'editor' },
  { id: 15, name: '胡慧', phone: '13800138015', role: 'auditor' },
  { id: 16, name: '郭亮', phone: '13800138016', role: 'user' },
  { id: 17, name: '林燕', phone: '13800138017', role: 'admin' },
  { id: 18, name: '何勇', phone: '13800138018', role: 'editor' },
  { id: 19, name: '罗琳', phone: '13800138019', role: 'user' },
  { id: 20, name: '梁超', phone: '13800138020', role: 'auditor' },
  { id: 21, name: '宋媛', phone: '13800138021', role: 'user' },
  { id: 22, name: '唐杰', phone: '13800138022', role: 'editor' },
  { id: 23, name: '韩雪', phone: '13800138023', role: 'admin' },
  { id: 24, name: '冯磊', phone: '13800138024', role: 'user' },
  { id: 25, name: '董瑶', phone: '13800138025', role: 'auditor' }
]

onMounted(() => {
  fetchPersonList()
})
</script>

<style lang="scss" scoped>
.person-manage {
  padding: 16px;
}

.search-card {
  margin-bottom: 16px;
}

.search-form {
  :deep(.el-form-item) {
    margin-bottom: 0;
  }
}

.table-card {
  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .card-title {
    font-size: 16px;
    font-weight: 600;
    color: #303133;
  }

  .header-actions {
    display: flex;
    gap: 12px;
  }
}

.pagination-wrapper {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
}
</style>