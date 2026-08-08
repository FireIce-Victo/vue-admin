<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>角色管理</span>
          <el-button type="primary" @click="handleAdd(null)">新增角色</el-button>
        </div>
      </template>

      <el-table
        :data="roleList"
        v-loading="loading"
        style="width: 100%"
        row-key="id"
        default-expand-all
        :tree-props="{ children: 'children' }"
      >
        <el-table-column prop="name" label="角色名称" min-width="150" />
        <el-table-column prop="code" label="角色编码" min-width="130" />
        <el-table-column label="父角色" width="140">
          <template #default="{ row }">
            {{ parentName(row.parent_id) || '—' }}
          </template>
        </el-table-column>
        <el-table-column prop="description" label="描述" min-width="180" show-overflow-tooltip />
        <el-table-column prop="sort" label="排序" width="70" align="center" />
        <el-table-column prop="userCount" label="用户数" width="80" align="center" />
        <el-table-column label="内置" width="70" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.is_system === 1 ? 'danger' : 'info'">
              {{ row.is_system === 1 ? '是' : '否' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="240" fixed="right">
          <template #default="{ row }">
            <el-button type="success" link @click="handlePermission(row)">分配权限</el-button>
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="danger" link @click="handleDelete(row)" :disabled="row.is_system === 1">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <!-- 新增/编辑弹窗（va_role） -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑角色' : '新增角色'" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="父角色" prop="parentId">
          <el-tree-select
            v-model="form.parentId"
            :data="roleTreeOptions"
            :props="{ label: 'name', value: 'id' }"
            node-key="id"
            check-strictly
            clearable
            placeholder="不选择则为顶级角色（不继承）"
            style="width: 100%"
          />
        </el-form-item>
        <el-form-item label="角色名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入角色名称" />
        </el-form-item>
        <el-form-item label="角色编码" prop="code">
          <el-input v-model="form.code" :disabled="isEdit" placeholder="如 admin/editor/viewer" />
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="form.description" type="textarea" :rows="2" placeholder="角色描述" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input-number v-model="form.sort" :min="0" />
        </el-form-item>
        <el-form-item label="状态" prop="status">
          <el-radio-group v-model="form.status">
            <el-radio :label="1">启用</el-radio>
            <el-radio :label="0">禁用</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="formDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 分配权限弹窗（va_role_permission） -->
    <el-dialog v-model="permDialogVisible" title="分配权限" width="520px">
      <div class="perm-tip">
        <el-alert
          type="info"
          :closable="false"
          show-icon
          title="勾选后保存，子角色将自动继承父角色权限"
        />
      </div>
      <div v-loading="permLoading" class="perm-tree">
        <el-tree
          ref="permTreeRef"
          :data="permTree"
          show-checkbox
          node-key="id"
          default-expand-all
          :props="{ label: 'name', children: 'children' }"
        >
          <template #default="{ data }">
            <span class="perm-node">
              <span>{{ data.name }}</span>
              <el-tag size="small" class="perm-type-tag" :type="typeTagType(data.type)">{{ typeText(data.type) }}</el-tag>
              <span class="perm-code">{{ data.code }}</span>
            </span>
          </template>
        </el-tree>
        <el-empty v-if="!permLoading && permTree.length === 0" description="暂无权限数据" />
      </div>
      <template #footer>
        <el-button @click="permDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handlePermSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  sysRoleTreeAPI,
  sysRoleAddAPI,
  sysRoleUpdateAPI,
  sysRoleDeleteAPI,
  sysRolePermissionsAPI,
  sysRoleAssignPermsAPI
} from '@/api/role'
import { sysPermTreeAPI } from '@/api/permission'

// ========== 列表 ==========
const loading = ref(false)
const roleList = ref([])

async function loadTree() {
  loading.value = true
  try {
    const res = await sysRoleTreeAPI()
    roleList.value = res.data
  } finally {
    loading.value = false
  }
}

const flatRoles = computed(() => {
  const result = []
  const walk = (list) => {
    list.forEach((r) => {
      result.push(r)
      if (r.children?.length) walk(r.children)
    })
  }
  walk(roleList.value)
  return result
})

const parentName = (id) => {
  if (!id) return ''
  return flatRoles.value.find((r) => r.id === id)?.name || ''
}

const typeText = (t) => ({ directory: '目录', menu: '菜单', button: '按钮', api: '接口' }[t] || t)
const typeTagType = (t) => ({ directory: 'primary', menu: 'success', button: 'warning', api: 'info' }[t] || 'info')

// ========== 新增/编辑（va_role） ==========
const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const form = reactive({ id: null, parentId: null, name: '', code: '', description: '', sort: 0, status: 1 })
const formRules = {
  name: [{ required: true, message: '请输入角色名称', trigger: 'blur' }],
  code: [{ required: true, message: '请输入角色编码', trigger: 'blur' }]
}

// 父角色下拉（编辑时排除自身及后代，防止成环）
const roleTreeOptions = computed(() => {
  if (!isEdit.value) return roleList.value
  const excludeIds = new Set([form.id])
  const walk = (list) => {
    list.forEach((r) => {
      if (r.parent_id === form.id || excludeIds.has(r.parent_id)) {
        excludeIds.add(r.id)
        walk(r.children || [])
      }
    })
  }
  walk(roleList.value)
  const filterTree = (list) =>
    list
      .filter((r) => !excludeIds.has(r.id))
      .map((r) => ({ ...r, children: filterTree(r.children || []) }))
  return filterTree(roleList.value)
})

function handleAdd() {
  isEdit.value = false
  Object.assign(form, { id: null, parentId: null, name: '', code: '', description: '', sort: 0, status: 1 })
  formDialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    parentId: row.parent_id,
    name: row.name,
    code: row.code,
    description: row.description,
    sort: row.sort,
    status: row.status
  })
  formDialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, { id: null, parentId: null, name: '', code: '', description: '', sort: 0, status: 1 })
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    const payload = {
      name: form.name,
      code: form.code,
      parentId: form.parentId || null,
      description: form.description || '',
      sort: form.sort,
      status: form.status
    }
    if (isEdit.value) {
      await sysRoleUpdateAPI(form.id, payload)
      ElMessage.success('修改成功')
    } else {
      await sysRoleAddAPI(payload)
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
    await sysRoleUpdateAPI(row.id, {
      name: row.name,
      code: row.code,
      parentId: row.parent_id || null,
      description: row.description,
      sort: row.sort,
      status: row.status
    })
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}角色 ${row.name}`)
  } catch {
    row.status = row.status === 1 ? 0 : 1
  }
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除角色【${row.name}】？其下子角色将自动变为顶级，关联关系将被清理。`, '警告', {
    type: 'warning',
    confirmButtonType: 'danger'
  })
    .then(async () => {
      await sysRoleDeleteAPI(row.id)
      ElMessage.success('删除成功')
      loadTree()
    })
    .catch(() => {})
}

// ========== 分配权限（va_role_permission） ==========
const permDialogVisible = ref(false)
const permLoading = ref(false)
const permTree = ref([])
const permTreeRef = ref(null)
let permTargetRole = null

async function handlePermission(row) {
  permTargetRole = row
  permDialogVisible.value = true
  permLoading.value = true
  try {
    const [treeRes, idsRes] = await Promise.all([
      sysPermTreeAPI({ status: 1 }),
      sysRolePermissionsAPI(row.id)
    ])
    permTree.value = treeRes.data
    await new Promise((resolve) => setTimeout(resolve, 0))
    // 回显已授权节点（含半选状态）
    permTreeRef.value.setCheckedKeys(idsRes.data, false)
  } finally {
    permLoading.value = false
  }
}

async function handlePermSubmit() {
  submitting.value = true
  try {
    // 全选 + 半选合并提交，保证父节点勾选关系完整
    const checked = permTreeRef.value.getCheckedKeys()
    const halfChecked = permTreeRef.value.getHalfCheckedKeys()
    await sysRoleAssignPermsAPI(permTargetRole.id, { permissionIds: [...checked, ...halfChecked] })
    ElMessage.success('权限分配成功')
    permDialogVisible.value = false
  } finally {
    submitting.value = false
  }
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
.perm-tip {
  margin-bottom: 12px;
}
.perm-tree {
  max-height: 420px;
  overflow: auto;
  .perm-node {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    .perm-type-tag {
      transform: scale(0.85);
    }
    .perm-code {
      color: #999;
      font-size: 12px;
    }
  }
}
</style>
