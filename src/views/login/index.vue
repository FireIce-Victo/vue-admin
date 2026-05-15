<template>
  <div class="login-container">
    <h3 class="login-title">Vue Admin</h3>
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
      <el-form-item>
        <el-button
          type="primary"
          class="login-button"
          @click="handleLogin(loginFormRef)"
          :loading="loading"
          >登录</el-button
        >
      </el-form-item>
    </el-form>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';
import { userStore } from '@/stores/modules/user';

const router = useRouter();
const store = userStore();
const loading = ref(false);
const loginFormRef = ref(null);

const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
};

const handleLogin = async formEl => {
  await formEl.validate(valid => {
    if (valid) {
      loading.value = true;
      store
        .login(loginForm)
        .then(() => {
          ElMessage.success('登陆成功');
          setTimeout(() => {
            router.push('/');
          }, 500);
        })
        .finally(() => {
          loading.value = false;
        });
    }
  });
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%);
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
    animation: pulse 15s ease-in-out infinite;
    z-index: 0;
  }
}

@keyframes pulse {
  0%,
  100% {
    transform: translate(0, 0);
  }
  50% {
    transform: translate(-5%, -5%);
  }
}

.login-title {
  margin-bottom: 50px;
  color: #ffffff;
  font-size: 42px;
  font-weight: 700;
  letter-spacing: 3px;
  text-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  position: relative;
  z-index: 10;
}

.login-form {
  width: 450px;
  position: relative;
  z-index: 10;

  :deep(.el-form-item__content) {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  :deep(.el-form-item__label) {
    font-weight: 500;
    color: #ffffff;
    font-size: 16px;
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
    margin-bottom: 28px;
  }

  :deep(.el-input__wrapper) {
    padding: 14px 18px;
    border-radius: 12px;
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 8px 32px rgba(31, 38, 135, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.4);
    transition: all 0.3s ease;
    height: 40px;

    &:hover {
      background: rgba(255, 255, 255, 0.35);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.8) inset, 0 12px 40px rgba(31, 38, 135, 0.3);
      transform: translateY(-2px);
    }

    &.is-focus {
      background: rgba(255, 255, 255, 0.45);
      box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.9) inset, 0 12px 40px rgba(31, 38, 135, 0.4);
      border-color: rgba(255, 255, 255, 0.8);
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
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);

    &::placeholder {
      color: rgba(255, 255, 255, 0.7);
      text-shadow: none;
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
    border: 1px solid rgba(255, 255, 255, 0.5);
    backdrop-filter: blur(10px);
    transition: all 0.3s ease;
    letter-spacing: 2px;
    margin-top: 8px;
    box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.3) inset, 0 8px 32px rgba(31, 38, 135, 0.3);

    &:hover {
      background: rgba(255, 255, 255, 0.35);
      border-color: rgba(255, 255, 255, 0.8);
      transform: translateY(-2px);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.6) inset, 0 12px 30px rgba(31, 38, 135, 0.4);
    }

    &:active {
      background: rgba(255, 255, 255, 0.3);
      transform: translateY(0);
      box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.5) inset, 0 6px 20px rgba(31, 38, 135, 0.3);
    }
  }
}
</style>
