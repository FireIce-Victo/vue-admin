<template>
  <div class="login-container">
    <!-- 玻璃反射光效 -->
    <!-- <div class="glass-reflection"></div> -->

    <div class="login-card">
      <h3 class="login-title">Admin System</h3>
      <el-form
        ref="loginFormRef"
        :model="loginForm"
        :rules="loginRules"
        label-width="80px"
        class="login-form"
        @keyup.enter="handleLogin(loginFormRef)"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="loginForm.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="请输入密码"
            show-password
          />
        </el-form-item>
        <el-form-item class="form-links">
          <span class="link-btn" @click="handleChangePwd">修改密码</span>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            class="login-button"
            @click="handleLogin(loginFormRef)"
            :loading="loading"
          >
            登录
          </el-button>
        </el-form-item>
      </el-form>
    </div>

    <!-- 修改密码弹窗 -->
    <ChangePwdDialog v-model="pwdDialogVisible" />
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import md5 from 'md5'
import { userStore } from '@/stores/modules/user'
import ChangePwdDialog from './ChangePwdDialog.vue'

const router = useRouter()
const store = userStore()
const loading = ref(false)
const loginFormRef = ref(null)

const loginForm = reactive({
  username: '',
  password: ''
})

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
}

const handleLogin = async (formEl) => {
  await formEl.validate((valid) => {
    if (valid) {
      loading.value = true
      const params = {
        username: loginForm.username,
        password: loginForm.password
      }
      store
        .login(params)
        .then(() => {
          ElMessage.success('登陆成功')
          setTimeout(() => {
            router.push('/')
          }, 500)
        })
        .finally(() => {
          loading.value = false
        })
    }
  })
}

// ========== 修改密码弹窗 ==========
const pwdDialogVisible = ref(false)

function handleChangePwd() {
  pwdDialogVisible.value = true
}
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;
}

/* 玻璃反射光效 */
.glass-reflection {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 1;

  &::before {
    content: '';
    position: absolute;
    top: -60%;
    left: -30%;
    width: 160%;
    height: 160%;
    background: linear-gradient(
      45deg,
      transparent 30%,
      rgba(255, 255, 255, 0.06) 40%,
      rgba(255, 255, 255, 0.12) 45%,
      rgba(255, 255, 255, 0.06) 50%,
      transparent 60%
    );
    animation: glass-sweep 10s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 20% 50%, rgba(255, 255, 255, 0.08) 0%, transparent 50%),
      radial-gradient(ellipse at 80% 20%, rgba(255, 255, 255, 0.06) 0%, transparent 50%),
      radial-gradient(ellipse at 50% 80%, rgba(255, 255, 255, 0.05) 0%, transparent 50%);
  }
}

@keyframes glass-sweep {
  0% {
    transform: translateX(-20%) translateY(-10%) rotate(0deg);
  }
  100% {
    transform: translateX(20%) translateY(10%) rotate(0deg);
  }
}

/* 玻璃卡片 */
.login-card {
  position: relative;
  z-index: 10;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 24px;
  padding: 48px 52px 36px;
  box-shadow:
    0 8px 48px rgba(31, 38, 135, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.25);
  min-width: 460px;
}

.login-title {
  margin: 0 0 40px;
  color: #ffffff;
  font-size: 36px;
  font-weight: 700;
  text-align: center;
  letter-spacing: 3px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.login-form {
  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #ffffff;
    font-size: 15px;
    height: 40px;
    line-height: 40px;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    margin-right: 10px;
    min-width: auto;
  }

  :deep(.el-form-item) {
    display: flex;
    justify-content: center;
    margin-bottom: 24px;
  }

  :deep(.el-input__wrapper) {
    padding: 12px 16px;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.15);
    backdrop-filter: blur(8px);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.4) inset;
    border: 1px solid rgba(255, 255, 255, 0.25);
    transition: all 0.3s ease;
    height: 40px;

    &:hover {
      background: rgba(255, 255, 255, 0.25);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6) inset;
      border-color: rgba(255, 255, 255, 0.5);
    }

    &.is-focus {
      background: rgba(255, 255, 255, 0.3);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7) inset;
      border-color: rgba(255, 255, 255, 0.7);
    }
  }

  :deep(.el-input) {
    height: 40px;
  }

  :deep(.el-input__inner) {
    color: #ffffff;
    font-size: 15px;
    height: 38px;
    line-height: 38px;

    &::placeholder {
      color: rgba(255, 255, 255, 0.6);
    }
  }

  .form-links {
    margin-bottom: 16px;

    :deep(.el-form-item__content) {
      justify-content: flex-end;
    }
  }

  .link-btn {
    color: rgba(255, 255, 255, 0.85);
    font-size: 14px;
    cursor: pointer;
    user-select: none;
    transition: color 0.3s;

    &:hover {
      color: #ffffff;
    }
  }

  .login-button {
    width: 100%;
    height: 44px;
    font-size: 15px;
    font-weight: 600;
    border-radius: 10px;
    background: rgba(255, 255, 255, 0.2);
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.4);
    backdrop-filter: blur(8px);
    transition: all 0.3s ease;
    letter-spacing: 2px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.25) inset, 0 4px 24px rgba(31, 38, 135, 0.25);

    &:hover {
      background: rgba(255, 255, 255, 0.3);
      border-color: rgba(255, 255, 255, 0.7);
      transform: translateY(-1px);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 8px 32px rgba(31, 38, 135, 0.35);
    }

    &:active {
      background: rgba(255, 255, 255, 0.25);
      transform: translateY(0);
    }
  }
}
</style>