<template>
  <div class="app-container file-upload-page">
    <div class="upload-container">
      <!-- 上传区域 -->
      <el-card shadow="never" class="upload-card">
        <template #header>
          <span class="card-title">文件上传</span>
        </template>

        <el-upload
          drag
          multiple
          :show-file-list="false"
          :http-request="handleUpload"
          :before-upload="beforeUpload"
          :accept="ACCEPT"
          :disabled="uploading"
        >
          <el-icon class="upload-icon"><UploadFilled /></el-icon>
          <div class="el-upload__text">拖拽文件到此处，或 <em>点击上传</em></div>
          <template #tip>
            <div class="el-upload__tip">
              单文件不超过 10MB，支持 {{ ALLOWED_EXT.join(' / ') }}
            </div>
          </template>
        </el-upload>

        <div v-if="uploading" class="upload-progress">
          <el-progress :percentage="uploadPercent" :stroke-width="6" />
          <span class="progress-text">正在上传（{{ uploadingCount }} 个文件）...</span>
        </div>
      </el-card>

      <!-- 文件列表 -->
      <el-card shadow="never" class="file-list-card">
        <template #header>
          <div class="card-header">
            <span class="card-title">我的文件</span>
            <el-button size="small" :icon="Refresh" :disabled="loading" @click="loadList">
              刷新
            </el-button>
          </div>
        </template>

        <el-table v-loading="loading" :data="fileList" style="width: 100%">
          <el-table-column label="预览" width="80">
            <template #default="{ row }">
              <el-image
                v-if="isImage(row.name)"
                :src="row.url"
                :preview-src-list="[row.url]"
                preview-teleported
                style="width: 48px; height: 48px"
                fit="cover"
                class="file-preview"
              />
              <div v-else class="file-icon-box">
                <el-icon :size="28"><Document /></el-icon>
              </div>
            </template>
          </el-table-column>
          <el-table-column prop="name" label="文件名" min-width="200">
            <template #default="{ row }">
              <span class="file-name" :title="row.name">{{ row.name }}</span>
            </template>
          </el-table-column>
          <el-table-column label="大小" width="100">
            <template #default="{ row }">{{ formatSize(row.size) }}</template>
          </el-table-column>
          <el-table-column label="类型" width="100">
            <template #default="{ row }">
              <el-tag size="small" :type="getFileTagType(row.name)">
                {{ getFileType(row.name) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column label="上传时间" width="180">
            <template #default="{ row }">{{ formatDateTime(row.time) }}</template>
          </el-table-column>
          <el-table-column label="操作" width="120" fixed="right">
            <template #default="{ row }">
              <el-button link type="primary" size="small" @click="handleDownload(row)">
                下载
              </el-button>
              <el-button link type="danger" size="small" @click="handleDelete(row)">
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>

        <el-empty v-if="!loading && !fileList.length" description="暂无上传文件" :image-size="100" />

        <el-pagination
          v-if="total > 0"
          v-model:current-page="query.page"
          v-model:page-size="query.pageSize"
          :total="total"
          :page-sizes="[10, 20, 50]"
          layout="total, sizes, prev, pager, next"
          class="pagination"
          @current-change="loadList"
          @size-change="handleSizeChange"
        />
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { UploadFilled, Document, Refresh } from '@element-plus/icons-vue'
import { fileUploadAPI, fileListAPI, fileDeleteAPI, fileDownloadAPI } from '@/api/file'
import { formatDateTime } from '@/utils/date'

// 与后端 utils/upload.js 白名单保持一致
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.zip', '.txt', '.csv']
const ACCEPT = ALLOWED_EXT.join(',')
const MAX_SIZE = 10 * 1024 * 1024

// ========== 上传状态 ==========
// uid -> 上传百分比，支持多文件并行上传
const progressMap = ref(new Map())
const uploadingCount = computed(() => progressMap.value.size)
const uploading = computed(() => progressMap.value.size > 0)
const uploadPercent = computed(() => {
  const values = [...progressMap.value.values()]
  if (!values.length) return 0
  return Math.round(values.reduce((sum, v) => sum + v, 0) / values.length)
})

// ========== 文件列表 ==========
const loading = ref(false)
const fileList = ref([])
const total = ref(0)
const query = ref({ page: 1, pageSize: 10 })

async function loadList() {
  loading.value = true
  try {
    const res = await fileListAPI({ page: query.value.page, pageSize: query.value.pageSize })
    fileList.value = (res.data.list || []).map((item) => ({
      id: item.id,
      name: item.original_name,
      size: item.size,
      mimeType: item.mime_type,
      url: item.url,
      time: item.created_at
    }))
    total.value = res.data.total || 0
  } catch {
    // 错误提示已由 request 响应拦截器统一处理
  } finally {
    loading.value = false
  }
}

function handleSizeChange() {
  query.value.page = 1
  loadList()
}

// ========== 上传 ==========
function beforeUpload(file) {
  const ext = '.' + file.name.split('.').pop().toLowerCase()
  if (!ALLOWED_EXT.includes(ext)) {
    ElMessage.error(`不支持的文件类型：${ext}`)
    return false
  }
  if (file.size > MAX_SIZE) {
    ElMessage.error(`「${file.name}」超过 10MB 限制`)
    return false
  }
  return true
}

async function handleUpload(options) {
  const { uid } = options.file
  progressMap.value.set(uid, 0)

  const form = new FormData()
  form.append('file', options.file)

  try {
    await fileUploadAPI(form, (e) => {
      if (e.total) {
        progressMap.value.set(uid, Math.round((e.loaded / e.total) * 100))
      }
    })
    ElMessage.success(`「${options.file.name}」上传成功`)
    options.onSuccess?.()
    query.value.page = 1
    await loadList()
  } catch (err) {
    options.onError?.(err)
  } finally {
    progressMap.value.delete(uid)
  }
}

// ========== 删除 ==========
async function handleDelete(row) {
  try {
    await ElMessageBox.confirm(`确定删除「${row.name}」吗？`, '提示', { type: 'warning' })
  } catch {
    return // 用户取消
  }
  try {
    await fileDeleteAPI(row.id)
    ElMessage.success('删除成功')
    // 当前页删空则回退一页
    if (fileList.value.length === 1 && query.value.page > 1) {
      query.value.page -= 1
    }
    await loadList()
  } catch {
    // 错误提示已由 request 响应拦截器统一处理
  }
}

// ========== 下载 ==========
async function handleDownload(row) {
  try {
    const res = await fileDownloadAPI(row.id)
    const blob = new Blob([res.data], { type: row.mimeType || 'application/octet-stream' })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = row.name
    link.click()
    window.URL.revokeObjectURL(url)
  } catch {
    // 错误提示已由 request 响应拦截器统一处理
  }
}

// ========== 工具函数 ==========
function isImage(name) {
  return /\.(png|jpe?g|gif|webp)$/i.test(name)
}

function formatSize(bytes) {
  if (!bytes) return '-'
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

function getExt(name) {
  return name.split('.').pop().toLowerCase()
}

function getFileType(name) {
  const ext = getExt(name)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return '图片'
  if (ext === 'pdf') return 'PDF'
  if (ext === 'zip') return '压缩包'
  if (['doc', 'docx'].includes(ext)) return 'Word'
  if (['xls', 'xlsx', 'csv'].includes(ext)) return 'Excel'
  if (ext === 'txt') return '文本'
  return '文件'
}

function getFileTagType(name) {
  const ext = getExt(name)
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return 'success'
  if (ext === 'pdf') return 'danger'
  if (ext === 'zip') return 'warning'
  if (['doc', 'docx', 'xls', 'xlsx', 'csv'].includes(ext)) return 'primary'
  return 'info'
}

onMounted(loadList)
</script>

<style lang="scss" scoped>
.file-upload-page {
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}

.upload-container {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

.upload-card {
  margin-bottom: 16px;

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .upload-icon {
    font-size: 48px;
    color: #c0c4cc;
  }

  .upload-progress {
    margin-top: 16px;
    display: flex;
    align-items: center;
    gap: 12px;

    .el-progress {
      flex: 1;
    }

    .progress-text {
      font-size: 13px;
      color: #909399;
      white-space: nowrap;
    }
  }
}

.file-list-card {
  .card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  .card-title {
    font-size: 15px;
    font-weight: 600;
    color: #303133;
  }

  .pagination {
    margin-top: 16px;
    justify-content: flex-end;
  }
}

.file-preview {
  border-radius: 4px;
  border: 1px solid #ebeef5;
  cursor: pointer;
}

.file-icon-box {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f7fa;
  border-radius: 4px;
  color: #909399;
}

.file-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>