<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>权限管理</span>
          <el-button type="primary" @click="handleAdd(null)">新增权限</el-button>
        </div>
      </template>

      <el-table
        :data="permissionList"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
        style="width: 100%"
        v-loading="loading"
      >
        <el-table-column prop="name" label="权限名称" min-width="170" />
        <el-table-column label="类型" width="85" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="typeTagType(row.type)">{{ typeText(row.type) }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="code" label="权限编码" min-width="200" show-overflow-tooltip />
        <el-table-column prop="resource" label="资源" width="90" align="center">
          <template #default="{ row }">{{ row.resource || '-' }}</template>
        </el-table-column>
        <el-table-column prop="action" label="操作" width="90" align="center">
          <template #default="{ row }">{{ row.action || '-' }}</template>
        </el-table-column>
        <el-table-column prop="path" label="路由路径" min-width="130">
          <template #default="{ row }">{{ row.path || '-' }}</template>
        </el-table-column>
        <el-table-column prop="component" label="组件路径" min-width="170" show-overflow-tooltip>
          <template #default="{ row }">{{ row.component || '-' }}</template>
        </el-table-column>
        <el-table-column prop="icon" label="图标" width="80" align="center">
          <template #default="{ row }">{{ row.icon || '-' }}</template>
        </el-table-column>
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column label="可见" width="65" align="center">
          <template #default="{ row }">
            <el-icon v-if="row.is_visible === 1" color="#67c23a"><View /></el-icon>
            <el-icon v-else color="#c0c4cc"><Hide /></el-icon>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="75" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="220" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleAdd(row)" :disabled="row.type === 'api'">新增子项</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗（va_permission） -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑权限' : '新增权限'" width="650px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
        <el-form-item label="上级权限" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="parentOptions"
            :props="{ label: 'name', value: 'id' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="不选择则为顶级"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="权限类型" prop="type">
          <el-radio-group v-model="form.type" @change="handleTypeChange">
            <el-radio-button label="directory">目录</el-radio-button>
            <el-radio-button label="menu">菜单</el-radio-button>
            <el-radio-button label="button">按钮</el-radio-button>
            <el-radio-button label="api">接口</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="权限名称" prop="name">
          <el-input v-model="form.name" placeholder="菜单名/按钮名/接口名" />
        </el-form-item>
        <el-form-item label="权限编码" prop="code">
          <el-input v-model="form.code" placeholder="格式: module:resource:action，如 system:user:list" />
        </el-form-item>
        <template v-if="form.type === 'button' || form.type === 'api'">
          <el-form-item label="资源标识" prop="resource">
            <el-input v-model="form.resource" placeholder="如 user/role/article" />
          </el-form-item>
          <el-form-item label="操作标识" prop="action">
            <el-input v-model="form.action" placeholder="如 list/create/update/delete/export/import" />
          </el-form-item>
        </template>
        <template v-if="form.type === 'directory' || form.type === 'menu'">
          <el-form-item label="路由路径" prop="path">
            <el-input v-model="form.path" placeholder="如 /system/user" />
          </el-form-item>
          <el-form-item label="组件路径" prop="component">
            <el-input v-model="form.component" placeholder="如 system/user/index" />
          </el-form-item>
          <el-form-item label="图标" prop="icon">
            <el-input v-model="form.icon" placeholder="Element Plus 图标名，如 User" />
          </el-form-item>
        </template>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="菜单可见" prop="isVisible">
          <el-radio-group v-model="form.isVisible">
            <el-radio :label="1">可见</el-radio>
            <el-radio :label="0">隐藏</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="备注" prop="remark">
          <el-input v-model="form.remark" type="textarea" :rows="2" placeholder="备注" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { View, Hide } from '@element-plus/icons-vue'
import { sysPermTreeAPI, sysPermAddAPI, sysPermUpdateAPI, sysPermDeleteAPI } from '@/api/permission'

const typeText = (t) => ({ directory: '目录', menu: '菜单', button: '按钮', api: '接口' }[t] || t)
const typeTagType = (t) => ({ directory: 'primary', menu: 'success', button: 'warning', api: 'info' }[t] || 'info')

// ========== 列表 ==========
const loading = ref(false)
const permissionList = ref([])

async function loadTree() {
  loading.value = true
  try {
    const res = await sysPermTreeAPI()
    permissionList.value = res.data
  } finally {
    loading.value = false
  }
}

// 上级权限下拉（编辑时排除自身及后代）
const parentOptions = computed(() => {
  if (!isEdit.value) return permissionList.value
  const excludeIds = new Set([form.id])
  const walk = (list) => {
    list.forEach((r) => {
      if (r.parent_id === form.id || excludeIds.has(r.parent_id)) {
        excludeIds.add(r.id)
        walk(r.children || [])
      }
    })
  }
  walk(permissionList.value)
  const filterTree = (list) =>
    list
      .filter((r) => !excludeIds.has(r.id))
      .map((r) => ({ ...r, children: filterTree(r.children || []) }))
  return filterTree(permissionList.value)
})

// ========== 新增/编辑（va_permission） ==========
const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const form = reactive({
  id: null,
  parentId: null,
  type: 'directory',
  name: '',
  code: '',
  resource: '',
  action: '',
  path: '',
  component: '',
  icon: '',
  sort: 0,
  isVisible: 1,
  status: 1,
  remark: ''
})
const formRules = {
  name: [{ required: true, message: '请输入权限名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入权限编码', trigger: 'blur' }],
  type: [{ required: true, message: '请选择权限类型', trigger: 'change' }]
}

function handleTypeChange() {
  // 切换类型时清空不适用字段
  if (form.type === 'button' || form.type === 'api') {
    form.path = ''
    form.component = ''
    form.icon = ''
  } else if (form.type === 'directory' || form.type === 'menu') {
    form.resource = ''
    form.action = ''
  }
}

function handleAdd(row) {
  isEdit.value = false
  Object.assign(form, {
    id: null,
    parentId: row ? row.id : null,
    type: 'directory',
    name: '',
    code: '',
    resource: '',
    action: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    isVisible: 1,
    status: 1,
    remark: ''
  })
  formDialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parent_id || null,
    type: row.type,
    name: row.name,
    code: row.code,
    resource: row.resource || '',
    action: row.action || '',
    path: row.path || '',
    component: row.component || '',
    icon: row.icon || '',
    sort: row.sort,
    isVisible: row.is_visible,
    status: row.status,
    remark: row.remark || ''
  })
  formDialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, {
    id: null,
    parentId: null,
    type: 'directory',
    name: '',
    code: '',
    resource: '',
    action: '',
    path: '',
    component: '',
    icon: '',
    sort: 0,
    isVisible: 1,
    status: 1,
    remark: ''
  })
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      type: form.type,
      parentId: form.parentId || 0,
      resource: form.resource || '',
      action: form.action || '',
      path: form.path || '',
      component: form.component || '',
      icon: form.icon || '',
      sort: form.sort,
      isVisible: form.isVisible,
      status: form.status,
      remark: form.remark || ''
    }
    if (isEdit.value) {
      await sysPermUpdateAPI(form.id, payload)
      ElMessage.success('修改成功')
    } else {
      await sysPermAddAPI(payload)
      ElMessage.success('新增成功')
    }
    formDialogVisible.value = false
    loadTree()
  } finally {
    submitting.value = false
  }
}

async function handleStatusChange(row) {
  try {
    await sysPermUpdateAPI(row.id, {
      name: row.name,
      code: row.code,
      type: row.type,
      parentId: row.parent_id,
      resource: row.resource || '',
      action: row.action || '',
      path: row.path || '',
      component: row.component || '',
      icon: row.icon || '',
      sort: row.sort,
      isVisible: row.is_visible,
      status: row.status,
      remark: row.remark || ''
    })
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}权限 ${row.name}`)
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除权限【${row.name}】？`, '警告', { type: 'warning', confirmButtonType: 'danger' })
    .then(async () => {
      await sysPermDeleteAPI(row.id)
      ElMessage.success('删除成功')
      loadTree()
    })
    .catch(() => {})
}

onMounted(loadTree)
</script>

<style lang="scss" scoped>
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
