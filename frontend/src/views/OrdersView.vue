<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const router = useRouter()
const orderStore = useOrderStore()

const activeTab = ref<'all' | 'pending' | 'completed'>('all')

onMounted(() => {
  orderStore.fetchOrders()
})

const handleTabChange = (tab: 'all' | 'pending' | 'completed') => {
  activeTab.value = tab
  orderStore.fetchOrders()
}

const goToOrderDetail = (orderId: string) => {
  router.push(`/order/${orderId}`)
}

const goBack = () => {
  router.push('/home')
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '待支付',
    PAID: '已支付',
    ACCEPTED: '已接单',
    DELIVERING: '配送中',
    DELIVERED: '已送达',
    COMPLETED: '已完成',
    REFUNDED: '已退款',
    CANCELLED: '已取消',
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    PENDING: 'status-pending',
    PAID: 'status-paid',
    ACCEPTED: 'status-paid',
    DELIVERING: 'status-paid',
    DELIVERED: 'status-completed',
    COMPLETED: 'status-completed',
    REFUNDED: 'status-refunded',
    CANCELLED: 'status-cancelled',
  }
  return classMap[status] || ''
}

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="orders-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">我的订单</h1>
    </header>

    <!-- Tab Bar -->
    <div class="tab-section">
      <div class="tab-bar">
        <button
          :class="['tab-item', { active: activeTab === 'all' }]"
          @click="handleTabChange('all')"
        >
          全部
        </button>
        <button
          :class="['tab-item', { active: activeTab === 'pending' }]"
          @click="handleTabChange('pending')"
        >
          待支付
        </button>
        <button
          :class="['tab-item', { active: activeTab === 'completed' }]"
          @click="handleTabChange('completed')"
        >
          已完成
        </button>
      </div>
    </div>

    <!-- Orders List -->
    <div class="orders-list">
      <div
        v-for="(order, index) in orderStore.orders"
        :key="order.id"
        class="order-card"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="goToOrderDetail(order.id)"
      >
        <div class="order-header">
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          <span :class="['status-badge', getStatusClass(order.status)]">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        <div class="order-info">
          <div class="order-restaurant">
            <span class="restaurant-icon">🍱</span>
            <span class="restaurant-name">{{ order.group?.restaurant?.name || '拼饭团订单' }}</span>
          </div>
          <span class="order-amount">¥{{ order.finalAmount }}</span>
        </div>
        <div v-if="order.group" class="order-group">
          <span class="group-icon">👥</span>
          <span class="group-name">{{ order.group.name }}</span>
          <span class="group-code">{{ order.group.inviteCode }}</span>
        </div>
      </div>

      <div v-if="orderStore.orders.length === 0" class="empty-state">
        <div class="empty-icon">📋</div>
        <div class="empty-title">暂无订单</div>
        <div class="empty-desc">快去发起拼饭团吧</div>
        <button class="btn btn-primary" @click="router.push('/group/create')">发起拼饭团</button>
      </div>

      <div v-if="orderStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
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

.header-action {
  width: 36px;
}

/* Tab Section */
.tab-section {
  padding: var(--space-4) var(--space-5);
}

.tab-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.tab-item {
  flex: 1;
  padding: var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-item:hover {
  background: var(--bg-tertiary);
}

.tab-item.active {
  background: var(--color-accent);
  color: var(--text-inverse);
}

/* Orders List */
.orders-list {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.order-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: var(--space-4);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: fadeIn 0.3s ease-out backwards;
}

.order-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.order-card:active {
  transform: scale(0.98);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-3);
}

.order-date {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-full);
}

.status-pending {
  background: rgba(245, 158, 11, 0.1);
  color: var(--color-warning);
}

.status-paid {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
}

.status-completed {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.status-refunded {
  background: rgba(156, 39, 176, 0.1);
  color: #9C27B0;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.order-restaurant {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.restaurant-icon {
  font-size: 1rem;
}

.restaurant-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.order-amount {
  font-size: 1rem;
  font-weight: 700;
  color: var(--text-primary);
}

.order-group {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-2);
  border-top: 1px solid var(--border-light);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.group-icon {
  font-size: 0.75rem;
}

.group-code {
  margin-left: auto;
  color: var(--color-accent);
  font-weight: 500;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) 0;
  gap: var(--space-3);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>