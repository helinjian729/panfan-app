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
    pending: '待支付',
    paid: '已支付',
    completed: '已完成',
    cancelled: '已取消',
    refunded: '已退款',
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    paid: 'status-paid',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
    refunded: 'status-refunded',
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
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">我的订单</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 标签切换 -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'all' }]"
        @click="handleTabChange('all')"
      >
        全部
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'pending' }]"
        @click="handleTabChange('pending')"
      >
        待支付
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'completed' }]"
        @click="handleTabChange('completed')"
      >
        已完成
      </button>
    </div>

    <!-- 订单列表 -->
    <div class="orders-list">
      <div
        v-for="order in orderStore.orders"
        :key="order.id"
        class="order-card"
        @click="goToOrderDetail(order.id)"
      >
        <div class="order-header">
          <span class="order-date">{{ formatDate(order.createdAt) }}</span>
          <span :class="['status', getStatusClass(order.status)]">
            {{ getStatusText(order.status) }}
          </span>
        </div>
        <div class="order-info">
          <span class="restaurant-name">{{ order.restaurant?.name || '未知餐厅' }}</span>
          <span class="order-amount">¥{{ order.finalAmount }}</span>
        </div>
        <div v-if="order.group" class="order-group">
          拼饭团: {{ order.group.name }}
        </div>
      </div>

      <div v-if="orderStore.orders.length === 0" class="empty-state">
        <span class="empty-icon">📋</span>
        <p>暂无订单</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.orders-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 24px;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.header-spacer {
  width: 32px;
}

.tab-bar {
  display: flex;
  padding: 12px 16px;
  background: #fff;
  gap: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #FF6B35;
  color: #fff;
}

.orders-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.order-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.order-card:active {
  transform: scale(0.98);
}

.order-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.order-date {
  font-size: 12px;
  color: #999;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-pending {
  background: #FFF3E0;
  color: #FF9800;
}

.status-paid {
  background: #E3F2FD;
  color: #2196F3;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-cancelled {
  background: #FFEBEE;
  color: #F44336;
}

.status-refunded {
  background: #F3E5F5;
  color: #9C27B0;
}

.order-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.restaurant-name {
  font-size: 15px;
  font-weight: 500;
}

.order-amount {
  font-size: 16px;
  font-weight: 600;
  color: #FF6B35;
}

.order-group {
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f5f5f5;
  font-size: 12px;
  color: #666;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
}
</style>
