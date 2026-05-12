<template>
  <div class="login-container">
    <div class="login-form-wrapper">
      <h2 class="login-title">Vue Admin</h2>
      <el-form :rules="loginRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input type="password" placeholder="请输入密码" show-password />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" class="login-button" @click="handleLogin">登录</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useRouter } from 'vue-router';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loginForm = reactive({
  username: '',
  password: ''
});

const loginRules = {
  username: [
    { message: '请输入用户名', trigger: 'blur' }
  ],
  password: [
    { message: '请输入密码', trigger: 'blur' }
  ]
};

const handleLogin = () => {
  // 模拟登录验证
  // if (loginForm.username && loginForm.password) {
  //   // 登录成功，跳转到管理后台
  //   localStorage.setItem('token', 'mock-token');
  //   ElMessage.success('登录成功');
  //   router.push('/dashboard');
  // } else {
  //   ElMessage.error('请输入用户名和密码');
  // }
  router.push('/dashboard');
};
</script>

<style lang="scss" scoped>
.login-container {
  width: 100vw;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-form-wrapper {
  width: 400px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);

  .login-title {
    text-align: center;
    margin-bottom: 30px;
    color: #303133;
    font-size: 24px;
    font-weight: 600;
  }

  .login-button {
    width: 100%;
    height: 40px;
    font-size: 16px;
  }
}
</style>
