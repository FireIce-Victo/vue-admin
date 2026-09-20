<template>
  <div class="app-container">
    <el-card>
      <template #header>
        <div class="card-header">
          <span>用户管理</span>
          <el-button type="primary" @click="handleAdd">新增用户</el-button>
        </div>
      </template>

      <!-- 筛选 -->
      <el-form :inline="true" :model="searchForm" class="search-form">
        <el-form-item label="用户名">
          <el-input v-model="searchForm.keyword" placeholder="用户名/姓名/手机/邮箱" clearable @keyup.enter="handleSearch" />
        </el-form-item>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="用户状态" clearable style="width: 120px">
            <el-option label="启用" :value="1" />
            <el-option label="禁用" :value="0" />
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSearch">查询</el-button>
          <el-button @click="handleReset">重置</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="userList" v-loading="loading" style="width: 100%">
        <el-table-column prop="id" label="ID" width="70" align="center" />
        <el-table-column prop="username" label="用户名" min-width="110" />
        <el-table-column prop="real_name" label="真实姓名" min-width="100" />
        <el-table-column prop="phone" label="手机号" width="130" />
        <el-table-column prop="email" label="邮箱" min-width="170" show-overflow-tooltip />
        <el-table-column label="性别" width="70" align="center">
          <template #default="{ row }">{{ genderText(row.gender) }}</template>
        </el-table-column>
        <el-table-column label="角色" min-width="170">
          <template #default="{ row }">
            <el-tooltip v-for="r in row.roles" :key="r.roleId" :content="`${r.roleCode}${r.expiresAt ? '（至 ' + r.expiresAt + '）' : '（永久）'}`">
              <el-tag size="small" :type="isRoleExpired(r) ? 'info' : 'primary'" class="role-tag">
                {{ r.roleName }}
              </el-tag>
            </el-tooltip>
            <span v-if="!row.roles?.length" style="color: #999">-</span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="80" align="center">
          <template #default="{ row }">
            <el-switch v-model="row.status" :active-value="1" :inactive-value="0" @change="handleStatusChange(row)" />
          </template>
        </el-table-column>
        <el-table-column prop="created_at" label="创建时间" width="170" />
        <el-table-column label="操作" width="300" fixed="right">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleEdit(row)">编辑</el-button>
            <el-button type="success" link @click="handleAssignRole(row)">分配角色</el-button>
            <el-button type="warning" link @click="handleDirectPerm(row)">直授权限</el-button>
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
        class="pagination"
        @current-change="handleSearch"
        @size-change="handleSearch"
      />
    </el-card>

    <!-- 新增/编辑弹窗（va_user） -->
    <el-dialog v-model="formDialogVisible" :title="isEdit ? '编辑用户' : '新增用户'" width="560px" @close="resetForm">
      <el-form ref="formRef" :model="form" :rules="formRules" label-width="90px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" :disabled="isEdit" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-if="!isEdit" label="密码" prop="password">
          <el-input v-model="form.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="form.realName" placeholder="请输入真实姓名" />
        </el-form-item>
        <el-form-item label="手机号" prop="phone">
          <el-input v-model="form.phone" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="性别" prop="gender">
          <el-radio-group v-model="form.gender">
            <el-radio :label="0">未知</el-radio>
            <el-radio :label="1">男</el-radio>
            <el-radio :label="2">女</el-radio>
          </el-radio-group>
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

    <!-- 分配角色弹窗（va_user_role — 含过期时间） -->
    <el-dialog v-model="roleDialogVisible" title="分配角色" width="560px" @close="resetRoleForm">
      <div v-loading="roleLoading" class="role-list">
        <div v-for="r in roleOptions" :key="r.id" class="role-item">
          <el-checkbox v-model="r.checked" :disabled="r.status !== 1">
            {{ r.name }}
            <span class="role-code">({{ r.code }})</span>
          </el-checkbox>
          <span class="role-expire">
            过期时间:
            <el-date-picker
              v-model="r.expireDate"
              type="date"
              placeholder="永久有效"
              value-format="YYYY-MM-DD"
              :disabled="!r.checked"
              style="width: 150px"
            />
          </span>
        </div>
        <el-empty v-if="!roleLoading && roleOptions.length === 0" description="暂无角色，请先在角色管理中创建" />
      </div>
      <template #footer>
        <el-button @click="roleDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleAssignRoleSubmit">确认</el-button>
      </template>
    </el-dialog>

    <!-- 用户直授权限弹窗（va_user_permission） -->
    <el-dialog v-model="permDialogVisible" title="用户直授权限" width="620px">
      <div class="perm-tip">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          title="优先级规则: deny(直授禁止) > allow(角色) > allow(直授)"
        />
      </div>
      <el-table :data="directPermList" v-loading="permLoading" style="width: 100%" max-height="300">
        <el-table-column prop="code" label="权限编码" min-width="180" show-overflow-tooltip />
        <el-table-column prop="name" label="权限名称" min-width="110" />
        <el-table-column label="效果" width="90" align="center">
          <template #default="{ row }">
            <el-tag size="small" :type="row.effect === 'allow' ? 'success' : 'danger'">
              {{ row.effect === 'allow' ? '允许' : '禁止' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="过期时间" width="130">
          <template #default="{ row }">{{ row.expiresAt || '永久' }}</template>
        </el-table-column>
        <el-table-column label="操作" width="80" align="center">
          <template #default="{ row }">
            <el-button type="danger" link @click="handleRemoveDirectPerm(row)">移除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <el-divider />
      <el-form :inline="true" :model="directPermForm" class="add-perm-form">
        <el-form-item label="权限编码">
          <el-select v-model="directPermForm.permissionId" placeholder="选择权限编码" filterable style="width: 210px">
            <el-option
              v-for="p in permOptions"
              :key="p.id"
              :label="`${p.code} (${p.name})`"
              :value="p.id"
            />
          </el-select>
        </el-form-item>
        <el-form-item label="效果">
          <el-select v-model="directPermForm.effect" style="width: 100px">
            <el-option label="允许" value="allow" />
            <el-option label="禁止" value="deny" />
          </el-select>
        </el-form-item>
        <el-form-item label="过期时间">
          <el-date-picker v-model="directPermForm.expiresAt" type="date" placeholder="永久" value-format="YYYY-MM-DD" style="width: 140px" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleAddDirectPerm">添加</el-button>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="permDialogVisible = false">关闭</el-button>
        <el-button type="primary" :loading="submitting" @click="handleDirectPermSubmit">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  sysUserListAPI,
  sysUserAddAPI,
  sysUserUpdateAPI,
  sysUserDeleteAPI,
  sysUserResetPwdAPI,
  sysUserAssignRolesAPI,
  sysUserDirectPermsAPI,
  sysUserSetDirectPermsAPI
} from '@/api/user'
import { sysRoleListAPI } from '@/api/role'
import { sysPermListAPI } from '@/api/permission'

// ========== 列表 ==========
const loading = ref(false)
const userList = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)
const searchForm = reactive({ keyword: '', status: '' })

async function handleSearch() {
  loading.value = true
  try {
    const res = await sysUserListAPI({
      page: currentPage.value,
      pageSize: pageSize.value,
      keyword: searchForm.keyword || undefined,
      status: searchForm.status === '' ? undefined : searchForm.status
    })
    userList.value = res.data.list
    total.value = res.data.total
  } finally {
    loading.value = false
  }
}

function handleReset() {
  searchForm.keyword = ''
  searchForm.status = ''
  currentPage.value = 1
  handleSearch()
}

const genderText = (g) => ({ 0: '未知', 1: '男', 2: '女' }[g] || '未知')
const isRoleExpired = (role) => {
  if (!role.expiresAt) return false
  return new Date(role.expiresAt) < new Date()
}

// ========== 新增/编辑（va_user） ==========
const formDialogVisible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)
const form = reactive({ id: null, username: '', password: '', realName: '', phone: '', email: '', gender: 0, status: 1 })
const formRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
  phone: [{ pattern: /^1[3-9]\d{9}$/, message: '手机号格式不正确', trigger: 'blur' }],
  email: [{ type: 'email', message: '邮箱格式不正确', trigger: 'blur' }]
}

function handleAdd() {
  isEdit.value = false
  formDialogVisible.value = true
}

function handleEdit(row) {
  isEdit.value = true
  Object.assign(form, {
    id: row.id,
    username: row.username,
    password: '',
    realName: row.real_name,
    phone: row.phone,
    email: row.email,
    gender: row.gender,
    status: row.status
  })
  formDialogVisible.value = true
}

function resetForm() {
  formRef.value?.resetFields()
  Object.assign(form, { id: null, username: '', password: '', realName: '', phone: '', email: '', gender: 0, status: 1 })
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    if (isEdit.value) {
      await sysUserUpdateAPI(form.id, {
        username: form.username,
        realName: form.realName,
        phone: form.phone,
        email: form.email,
        gender: form.gender,
        status: form.status
      })
      ElMessage.success('修改成功')
    } else {
      await sysUserAddAPI({
        username: form.username,
        password: form.password,
        realName: form.realName,
        phone: form.phone,
        email: form.email,
        gender: form.gender,
        status: form.status
      })
      ElMessage.success('新增成功')
    }
    formDialogVisible.value = false
    handleSearch()
  } finally {
    submitting.value = false
  }
}

// ========== 分配角色（va_user_role — 含过期时间） ==========
const roleDialogVisible = ref(false)
const roleLoading = ref(false)
const roleOptions = ref([])
let assignTargetId = null

async function handleAssignRole(row) {
  assignTargetId = row.id
  roleDialogVisible.value = true
  roleLoading.value = true
  try {
    const res = await sysRoleListAPI({ status: 1 })
    roleOptions.value = res.data.map((r) => ({
      ...r,
      checked: false,
      expireDate: null
    }))
    // 回显已分配的角色
    row.roles?.forEach((rr) => {
      const target = roleOptions.value.find((o) => o.id === rr.roleId)
      if (target) {
        target.checked = true
        target.expireDate = rr.expiresAt || null
      }
    })
  } finally {
    roleLoading.value = false
  }
}

function resetRoleForm() {
  roleOptions.value.forEach((r) => {
    r.checked = false
    r.expireDate = null
  })
}

async function handleAssignRoleSubmit() {
  submitting.value = true
  try {
    const roles = roleOptions.value
      .filter((r) => r.checked)
      .map((r) => ({ roleId: r.id, expiresAt: r.expireDate || null }))
    await sysUserAssignRolesAPI(assignTargetId, { roles })
    ElMessage.success('角色分配成功')
    roleDialogVisible.value = false
    handleSearch()
  } finally {
    submitting.value = false
  }
}

// ========== 用户直授权限（va_user_permission） ==========
const permDialogVisible = ref(false)
const permLoading = ref(false)
const directPermList = ref([])
const permOptions = ref([])
let directPermTargetId = null
const directPermForm = reactive({ permissionId: null, effect: 'allow', expiresAt: null })

async function handleDirectPerm(row) {
  directPermTargetId = row.id
  permDialogVisible.value = true
  permLoading.value = true
  try {
    const [permRes, listRes] = await Promise.all([
      sysPermListAPI({ status: 1 }),
      sysUserDirectPermsAPI(row.id)
    ])
    // 直授可选范围为 button/api 类型
    permOptions.value = permRes.data.filter((p) => p.type === 'button' || p.type === 'api')
    // 后端返回 snake_case(permission_id/expires_at),映射为前端 camelCase,保证展示与去重校验正确
    directPermList.value = (listRes.data || []).map((p) => ({
      permissionId: p.permission_id,
      code: p.code,
      name: p.name,
      effect: p.effect,
      expiresAt: p.expires_at
    }))
  } finally {
    permLoading.value = false
  }
}

function handleAddDirectPerm() {
  if (!directPermForm.permissionId) return ElMessage.warning('请选择权限编码')
  const exists = directPermList.value.find((p) => p.permissionId === directPermForm.permissionId)
  if (exists) return ElMessage.warning('该权限已存在')
  const perm = permOptions.value.find((p) => p.id === directPermForm.permissionId)
  directPermList.value.push({
    permissionId: directPermForm.permissionId,
    code: perm?.code || '',
    name: perm?.name || '',
    effect: directPermForm.effect,
    expiresAt: directPermForm.expiresAt || null
  })
  directPermForm.permissionId = null
  directPermForm.effect = 'allow'
  directPermForm.expiresAt = null
}

function handleRemoveDirectPerm(row) {
  directPermList.value = directPermList.value.filter((p) => p.permissionId !== row.permissionId)
}

async function handleDirectPermSubmit() {
  submitting.value = true
  try {
    const permissions = directPermList.value.map((p) => ({
      permissionId: p.permissionId,
      effect: p.effect,
      expiresAt: p.expiresAt || null
    }))
    await sysUserSetDirectPermsAPI(directPermTargetId, { permissions })
    ElMessage.success('直授权限保存成功')
    permDialogVisible.value = false
    handleSearch()
  } finally {
    submitting.value = false
  }
}

// ========== 其他操作 ==========
async function handleStatusChange(row) {
  try {
    await sysUserUpdateAPI(row.id, {
      username: row.username,
      realName: row.real_name,
      phone: row.phone,
      email: row.email,
      gender: row.gender,
      status: row.status
    })
    ElMessage.success(`已${row.status === 1 ? '启用' : '禁用'}用户 ${row.username}`)
  } catch {
    row.status = row.status === 1 ? 0 : 1 // 失败回滚
  }
}

function handleResetPwd(row) {
  ElMessageBox.confirm(`确认将用户【${row.username}】的密码重置为 123456？`, '提示', { type: 'warning' })
    .then(async () => {
      await sysUserResetPwdAPI(row.id, { password: '123456' })
      ElMessage.success('密码已重置')
    })
    .catch(() => {})
}

function handleDelete(row) {
  ElMessageBox.confirm(`确认删除用户【${row.username}】？此操作不可恢复。`, '警告', { type: 'warning', confirmButtonType: 'danger' })
    .then(async () => {
      await sysUserDeleteAPI(row.id)
      ElMessage.success('删除成功')
      if (userList.value.length === 1 && currentPage.value > 1) currentPage.value -= 1
      handleSearch()
    })
    .catch(() => {})
}

onMounted(handleSearch)
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
.role-tag {
  margin-right: 4px;
}
.role-list {
  min-height: 60px;
  .role-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px solid #f0f0f0;
    &:last-child {
      border-bottom: none;
    }
    .role-code {
      color: #999;
      font-size: 12px;
      margin-left: 4px;
    }
    .role-expire {
      font-size: 13px;
      color: #666;
      display: flex;
      align-items: center;
      gap: 6px;
    }
  }
}
.perm-tip {
  margin-bottom: 12px;
}
.add-perm-form {
  margin-top: 8px;
}
</style>
