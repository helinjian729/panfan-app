<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const user = ref({
  nickname: '',
  phone: '',
  avatarUrl: '',
})

onMounted(() => {
  authStore.initUser()
  if (authStore.user) {
    user.value = {
      nickname: authStore.user.nickname || '用户',
      phone: authStore.user.phone || '',
      avatarUrl: authStore.user.avatar || '',
    }
  }
})

const goToAddresses = () => {
  router.push('/addresses')
}

const goToOrders = () => {
  router.push('/orders')
}

const goToGroups = () => {
  router.push('/groups')
}

const handleLogout = () => {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="profile-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="router.back()">←</button>
      <h1 class="header-title">个人中心</h1>
    </header>

    <!-- User Info Card -->
    <div class="user-card">
      <div class="user-avatar">
        <img v-if="user.avatarUrl" :src="user.avatarUrl" :alt="user.nickname" />
        <span v-else class="avatar-placeholder">{{ user.nickname.charAt(0) }}</span>
      </div>
      <div class="user-info">
        <h2 class="user-name">{{ user.nickname }}</h2>
        <p class="user-phone">{{ user.phone }}</p>
      </div>
    </div>

    <!-- Menu List -->
    <div class="menu-section">
      <div class="menu-list">
        <div class="menu-item" @click="goToOrders">
          <div class="menu-left">
            <span class="menu-icon">📋</span>
            <span class="menu-text">我的订单</span>
          </div>
        </div>
        <div class="menu-item" @click="goToGroups">
          <div class="menu-left">
            <span class="menu-icon">👥</span>
            <span class="menu-text">我的拼饭团</span>
          </div>
        </div>
        <div class="menu-item" @click="goToAddresses">
          <div class="menu-left">
            <span class="menu-icon">📍</span>
            <span class="menu-text">收货地址</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Logout Button -->
    <div class="logout-section">
      <button class="logout-btn" @click="handleLogout">退出登录</button>
    </div>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: var(--space-6);
}

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-back:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

/* User Card */
.user-card {
  display: flex;
  align-items: center;
  gap: var(--space-4);
  padding: var(--space-6);
  background: var(--bg-secondary);
  margin: var(--space-4);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.user-avatar {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, var(--color-accent), #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.avatar-placeholder {
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--text-inverse);
}

.user-info {
  flex: 1;
}

.user-name {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.user-phone {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Menu Section */
.menu-section {
  padding: 0 var(--space-4);
}

.menu-list {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  border-bottom: 1px solid var(--border-light);
  cursor: pointer;
  transition: background var(--transition-fast);
}

.menu-item:last-child {
  border-bottom: none;
}

.menu-item:hover {
  background: var(--bg-tertiary);
}

.menu-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.menu-icon {
  font-size: 1.25rem;
}

.menu-text {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.menu-arrow {
  font-size: 0.875rem;
  color: var(--text-tertiary);
}

/* Logout Section */
.logout-section {
  padding: var(--space-8) var(--space-4) 0;
}

.logout-btn {
  width: 100%;
  padding: var(--space-4);
  background: var(--bg-secondary);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--color-error);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.logout-btn:hover {
  background: rgba(239, 68, 68, 0.1);
}
</style>