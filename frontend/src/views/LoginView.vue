<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const phone = ref('')
const code = ref('')
const isSending = ref(false)

const validatePhone = (phone: string) => {
  return /^1[3-9]\d{9}$/.test(phone)
}

const handleSendCode = async () => {
  if (!validatePhone(phone.value)) {
    return
  }

  isSending.value = true
  try {
    await authStore.sendVerifyCode(phone.value)
    authStore.startCodeCooldown(60)
  } finally {
    isSending.value = false
  }
}

const handleLogin = async () => {
  if (!validatePhone(phone.value) || code.value.length !== 6) {
    return
  }

  try {
    await authStore.loginUser(phone.value, code.value)
    router.push('/home')
  } catch (error) {
    console.error('Login failed:', error)
  }
}
</script>

<template>
  <div class="login-page">
    <div class="login-header">
      <div class="logo">
        <span class="logo-icon">🍱</span>
        <span class="logo-text">拼饭App</span>
      </div>
      <p class="slogan">白领午餐拼饭神器</p>
    </div>

    <div class="login-form">
      <div class="form-item">
        <label>手机号</label>
        <input
          v-model="phone"
          type="tel"
          placeholder="请输入手机号"
          maxlength="11"
        />
      </div>

      <div class="form-item">
        <label>验证码</label>
        <div class="code-input">
          <input
            v-model="code"
            type="text"
            placeholder="请输入验证码"
            maxlength="6"
          />
          <button
            class="code-btn"
            :disabled="authStore.codeCooldown > 0 || isSending"
            @click="handleSendCode"
          >
            {{ authStore.codeCooldown > 0 ? `${authStore.codeCooldown}s` : '获取验证码' }}
          </button>
        </div>
      </div>

      <button class="login-btn" @click="handleLogin">登录</button>
    </div>

    <p class="tips">未注册用户将自动创建账号</p>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #FFF9F5 0%, #FFF 100%);
  padding: 60px 24px 24px;
  display: flex;
  flex-direction: column;
}

.login-header {
  text-align: center;
  padding: 40px 0;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.logo-icon {
  font-size: 48px;
}

.logo-text {
  font-size: 28px;
  font-weight: 600;
  color: #FF6B35;
}

.slogan {
  color: #666;
  font-size: 14px;
}

.login-form {
  background: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(255, 107, 53, 0.1);
}

.form-item {
  margin-bottom: 20px;
}

.form-item label {
  display: block;
  font-size: 14px;
  color: #333;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  height: 48px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 16px;
  transition: border-color 0.3s;
}

.form-item input:focus {
  outline: none;
  border-color: #FF6B35;
}

.code-input {
  display: flex;
  gap: 12px;
}

.code-input input {
  flex: 1;
}

.code-btn {
  width: 120px;
  height: 48px;
  background: #FFF3EF;
  color: #FF6B35;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.code-btn:disabled {
  background: #f5f5f5;
  color: #999;
  cursor: not-allowed;
}

.login-btn {
  width: 100%;
  height: 48px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: transform 0.2s;
}

.login-btn:active {
  transform: scale(0.98);
}

.tips {
  text-align: center;
  color: #999;
  font-size: 12px;
  margin-top: 24px;
}
</style>
