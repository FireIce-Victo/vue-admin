<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>表格展示</span>
          <el-button type="primary" @click="handleAdd">新增</el-button>
        </div>
      </template>

      <!-- 筛选（后端仅支持 keyword / status） -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="标题">
          <el-input
            v-model="searchForm.keyword"
            placeholder="请输入标题"
            clearable
            @keyup.enter="handleSearch"
          />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="发布状态" clearable style="width: 120px">
            <el-option label="未发布" :value="0" />
            <el-option label="已发布" :value="1" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table v-loading="loading" :data="tableData" style="width: 100%">
        <el-table-column prop="title" label="标题" min-width="200" show-overflow-tooltip />
        <el-table-column prop="author" label="作者" width="120" align="center" />
        <el-table-column label="发布状态" width="100" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.status === 1 ? 'success' : 'info'">
              {{ row.status === 1 ? '已发布' : '未发布' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="发布时间" width="170">
          <template #default="{ row }">{{ formatDateTime(row.publish_time) }}</template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column prop="updated_at" label="更新时间" width="170" />
        <el-table-column label="操作" width="160" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
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
        class="pagination"
        @size-change="handleSizeChange"
        @current-change="fetchTableData"
      />
    </el-card>

    <!-- 新增/编辑弹窗 -->
    <TableDialog v-model="dialogVisible" :row="currentRow" @submit="handleDialogSubmit" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { getTableList, addTableData, updateTableData, deleteTableData } from '@/api/table'
import { formatDateTime } from '@/utils/date'
import TableDialog from './TableDialog.vue'

// ========== 列表 & 分页 ==========
const loading = ref(false)
const tableData = ref([])
const total = ref(0)
const currentPage = ref(1)
const pageSize = ref(10)
const searchForm = reactive({ keyword: '', status: '' })

async function fetchTableData() {
  loading.value = true
  try {
    const res = await getTableList({
      page: currentPage.value,
      pageSize: pageSize.value,
      // 只传非空筛选参数
      keyword: searchForm.keyword || undefined,
      status: searchForm.status === '' ? undefined : searchForm.status
    })
    tableData.value = res.data.list || []
    total.value = res.data.total || 0
  } catch {
    // 错误已在 request 拦截器中统一提示
  } finally {
    loading.value = false
  }
}

function handleSearch() {
  currentPage.value = 1
  fetchTableData()
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
  fetchTableData()
}

function handleSizeChange() {
  currentPage.value = 1
  fetchTableData()
}

onMounted(fetchTableData)

// ========== 新增/编辑弹窗 ==========
const dialogVisible = ref(false)
const currentRow = ref(null)

function handleAdd() {
  currentRow.value = null
  dialogVisible.value = true
}

function handleEdit(row) {
  currentRow.value = { ...row }
  dialogVisible.value = true
}

async function handleDialogSubmit(payload, done) {
  try {
    const { isEdit, ...data } = payload
    if (isEdit) {
      await updateTableData(data)
      ElMessage.success('编辑成功')
    } else {
      await addTableData(data)
      ElMessage.success('新增成功')
    }
    dialogVisible.value = false
    fetchTableData()
    done(true)
  } catch {
    // 错误已在 request 拦截器中统一提示，保持弹窗不关闭
    done(false)
  }
}

// ========== 删除 ==========
function handleDelete(row) {
  ElMessageBox.confirm(
    `确认删除【${row.title}】？此操作不可恢复。`,
    '警告',
    { type: 'warning', confirmButtonType: 'danger' }
  )
    .then(async () => {
      try {
        await deleteTableData(row.id)
        ElMessage.success('删除成功')
        // 删除的是当前页最后一条时，回退一页
        if (tableData.value.length === 1 && currentPage.value > 1) {
          currentPage.value -= 1
        }
        fetchTableData()
      } catch {
        // 错误已在 request 拦截器中统一提示
      }
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
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
