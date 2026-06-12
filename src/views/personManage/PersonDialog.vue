<template>
  <el-dialog
    v-model="visible"
    :title="isEdit ? '编辑人员' : '添加人员'"
    width="520px"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <el-form
      ref="formRef"
      :model="formData"
      :rules="rules"
      label-width="100px"
      class="dialog-form"
    >
      <el-form-item label="用户名称" prop="name">
        <el-input
          v-model="formData.name"
          placeholder="请输入用户名称"
          maxlength="20"
          show-word-limit
        />
      </el-form-item>

      <el-form-item label="电话号码" prop="phone">
        <el-input
          v-model="formData.phone"
          placeholder="请输入电话号码"
          maxlength="11"
        />
      </el-form-item>

      <el-form-item label="角色" prop="role">
        <el-select
          v-model="formData.role"
          placeholder="请选择角色"
          style="width: 100%"
        >
          <el-option
            v-for="item in ROLE_OPTIONS"
            :key="item.value"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose">取消</el-button>
        <el-button type="primary" @click="handleConfirm" :loading="submitLoading">
          确认
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, computed } from 'vue'
import { ROLE_OPTIONS } from './constants'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  mode: {
    type: String,
    default: 'add'
  },
  data: {
    type: Object,
    default: () => ({})
  }
})

const emit = defineEmits(['update:modelValue', 'confirm'])

const visible = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
})

const isEdit = computed(() => props.mode === 'edit')

const formRef = ref(null)
const submitLoading = ref(false)

const initFormData = () => ({
  name: '',
  phone: '',
  role: ''
})

const formData = reactive(initFormData())

const rules = {
  name: [
    { required: true, message: '请输入用户名称', trigger: 'blur' },
    { min: 2, max: 20, message: '长度在 2 到 20 个字符', trigger: 'blur' }
  ],
  phone: [
    { required: true, message: '请输入电话号码', trigger: 'blur' },
    { pattern: /^1[3-9]\d{9}$/, message: '请输入正确的手机号码', trigger: 'blur' }
  ],
  role: [
    { required: true, message: '请选择角色', trigger: 'change' }
  ]
}

watch(
  () => props.modelValue,
  (val) => {
    if (val) {
      if (isEdit.value && props.data) {
        Object.assign(formData, {
          name: props.data.name || '',
          phone: props.data.phone || '',
          role: props.data.role || ''
        })
      } else {
        Object.assign(formData, initFormData())
      }
      submitLoading.value = false
    }
  }
)

function handleClose() {
  formRef.value?.resetFields()
  Object.assign(formData, initFormData())
  visible.value = false
}

async function handleConfirm() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return

  submitLoading.value = true
  try {
    emit('confirm', {
      ...formData,
      id: props.data?.id
    })
  } finally {
    submitLoading.value = false
  }
}
</script>

<style lang="scss" scoped>
.dialog-form {
  padding: 10px 0;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
</style>