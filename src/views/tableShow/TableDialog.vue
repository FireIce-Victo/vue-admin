<template>
  <el-dialog v-model="visible" :title="isEdit ? '编辑' : '新增'" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="form" :rules="rules" label-width="90px">
      <el-form-item label="标题" prop="title">
        <el-input v-model="form.title" placeholder="请输入标题" />
      </el-form-item>
      <el-form-item label="作者" prop="author">
        <el-input v-model="form.author" placeholder="请输入作者" />
      </el-form-item>
      <el-form-item label="发布状态" prop="status">
        <el-radio-group v-model="form.status">
          <el-radio :label="0">未发布</el-radio>
          <el-radio :label="1">已发布</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="发布时间" prop="publish_time">
        <el-date-picker
          v-model="form.publish_time"
          type="datetime"
          placeholder="请选择发布时间"
          value-format="YYYY-MM-DD HH:mm:ss"
          style="width: 100%"
        />
      </el-form-item>

      <!-- 编辑时展示时间信息 -->
      <template v-if="isEdit">
        <el-divider content-position="left">时间信息</el-divider>
        <el-form-item label="创建时间">
          <el-input :model-value="form.created_at" disabled />
        </el-form-item>
        <el-form-item label="更新时间">
          <el-input :model-value="form.updated_at" disabled />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" :loading="submitting" @click="handleSubmit">确认</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { formatDateTime } from '@/utils/date'

const props = defineProps({
  modelValue: { type: Boolean, default: false },
  row: { type: Object, default: null }
})
const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)
const isEdit = ref(false)
const submitting = ref(false)
const formRef = ref(null)

const defaultForm = {
  id: null,
  title: '',
  author: '',
  status: 0,
  publish_time: '',
  created_at: '',
  updated_at: ''
}
const form = reactive({ ...defaultForm })

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
  author: [{ required: true, message: '请输入作者', trigger: 'blur' }],
  status: [{ required: true, message: '请选择发布状态', trigger: 'change' }]
}

// 同步 modelValue
watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
    if (val) initForm()
  }
)
watch(visible, (val) => {
  emit('update:modelValue', val)
})

function initForm() {
  if (props.row) {
    isEdit.value = true
    Object.assign(form, {
      id: props.row.id,
      title: props.row.title || '',
      author: props.row.author || '',
      status: props.row.status ?? 0,
      publish_time: props.row.publish_time ? formatDateTime(props.row.publish_time) : '',
      created_at: props.row.created_at || '',
      updated_at: props.row.updated_at || ''
    })
  } else {
    isEdit.value = false
    Object.assign(form, { ...defaultForm })
  }
  formRef.value?.clearValidate()
}

function handleClose() {
  submitting.value = false
  formRef.value?.resetFields()
}

async function handleSubmit() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    // 等待父组件完成提交：成功回调 true（关闭弹窗），失败回调 false（保留表单）
    const success = await new Promise((resolve) => {
      emit('submit', { ...form, isEdit: isEdit.value }, resolve)
    })
    if (success) visible.value = false
  } finally {
    submitting.value = false
  }
}
</script>
