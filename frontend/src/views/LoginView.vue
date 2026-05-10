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
    <!-- Background Elements -->
    <div class="bg-decoration">
      <div class="bg-circle bg-circle-1"></div>
      <div class="bg-circle bg-circle-2"></div>
      <div class="bg-grid"></div>
    </div>

    <!-- Header -->
    <div class="login-header">
      <div class="logo">
        <span class="logo-icon">🍱</span>
        <span class="logo-text">拼饭</span>
      </div>
      <p class="slogan">白领午餐拼饭神器</p>
    </div>

    <!-- Login Card -->
    <div class="login-card">
      <div class="card-header">
        <h2 class="card-title">欢迎回来</h2>
        <p class="card-subtitle">登录后开始拼饭之旅</p>
      </div>

      <div class="form">
        <div class="input-group">
          <label class="input-label">手机号</label>
          <div class="input-wrapper">
            <span class="input-prefix">+86</span>
            <input
              v-model="phone"
              type="tel"
              placeholder="请输入手机号"
              maxlength="11"
              class="input"
            />
          </div>
        </div>

        <div class="input-group">
          <label class="input-label">验证码</label>
          <div class="input-wrapper code-wrapper">
            <input
              v-model="code"
              type="text"
              placeholder="请输入验证码"
              maxlength="6"
              class="input"
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

        <button class="btn btn-primary btn-full btn-lg" @click="handleLogin">
          登录
        </button>
      </div>

      <p class="tips">未注册用户将自动创建账号</p>
    </div>

    <!-- Footer -->
    <div class="login-footer">
      <span class="footer-text">登录即表示同意</span>
      <a href="#" class="footer-link">用户协议</a>
      <span class="footer-text">和</span>
      <a href="#" class="footer-link">隐私政策</a>
    </div>
  </div>
</template>

<style scoped>
.login-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-6);
  position: relative;
  overflow: hidden;
}

/* Background Decoration */
.bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.bg-circle {
  position: absolute;
  border-radius: 50%;
  opacity: 0.5;
}

.bg-circle-1 {
  width: 300px;
  height: 300px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1), rgba(99, 102, 241, 0.05));
  top: -100px;
  right: -100px;
}

.bg-circle-2 {
  width: 200px;
  height: 200px;
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(34, 197, 94, 0.05));
  bottom: -50px;
  left: -50px;
}

.bg-grid {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image:
    linear-gradient(rgba(99, 102, 241, 0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(99, 102, 241, 0.03) 1px, transparent 1px);
  background-size: 40px 40px;
}

/* Header */
.login-header {
  text-align: center;
  margin-bottom: var(--space-8);
  position: relative;
  z-index: 1;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-3);
  margin-bottom: var(--space-3);
}

.logo-icon {
  font-size: 2.5rem;
}

.logo-text {
  font-size: 2rem;
  font-weight: 700;
  color: var(--text-primary);
}

.slogan {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Login Card */
.login-card {
  width: 100%;
  max-width: 380px;
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-6);
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
}

.card-header {
  margin-bottom: var(--space-6);
  text-align: center;
}

.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.card-subtitle {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Form */
.form {
  display: flex;
  flex-direction: column;
  gap: var(--space-5);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-primary);
  border: 1px solid var(--border-light);
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-accent);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

.input-prefix {
  padding: var(--space-3) var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  background: var(--bg-tertiary);
  border-right: 1px solid var(--border-light);
}

.input-wrapper .input {
  border: none;
  background: transparent;
  padding-left: 0;
}

.input-wrapper.code-wrapper {
  display: flex;
}

.code-btn {
  padding: var(--space-3) var(--space-4);
  background: var(--bg-tertiary);
  color: var(--color-accent);
  border: none;
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.code-btn:disabled {
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  cursor: not-allowed;
}

.btn-primary {
  margin-top: var(--space-2);
}

.tips {
  text-align: center;
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-top: var(--space-4);
}

/* Footer */
.login-footer {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-1);
  margin-top: var(--space-6);
  position: relative;
  z-index: 1;
}

.footer-text {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.footer-link {
  font-size: 0.75rem;
  color: var(--color-accent);
  text-decoration: none;
}
</style>