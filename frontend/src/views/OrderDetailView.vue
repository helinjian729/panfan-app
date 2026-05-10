<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'

const route = useRoute()
const router = useRouter()
const orderStore = useOrderStore()

const orderId = route.params.id as string

onMounted(async () => {
  await orderStore.fetchOrderById(orderId)
})

const goBack = () => {
  router.push('/orders')
}

const handlePay = async () => {
  if (confirm('确定要支付订单吗？')) {
    await orderStore.fetchPayOrder(orderId, 'wechat')
  }
}

const handleCancel = async () => {
  if (confirm('确定要取消订单吗？')) {
    await orderStore.fetchCancelOrder(orderId)
    router.push('/orders')
  }
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

const getStatusStep = (status: string) => {
  const steps: Record<string, number> = {
    PENDING: 0,
    PAID: 1,
    ACCEPTED: 1,
    DELIVERING: 1,
    DELIVERED: 2,
    COMPLETED: 2,
    REFUNDED: -1,
    CANCELLED: -1,
  }
  return steps[status] ?? 0
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="order-detail-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">订单详情</h1>
    </header>

    <div v-if="orderStore.currentOrder" class="content">
      <!-- Order Status -->
      <div class="section-card">
        <div class="status-header">
          <span :class="['status-badge', getStatusClass(orderStore.currentOrder.status)]">
            {{ getStatusText(orderStore.currentOrder.status) }}
          </span>
        </div>

        <!-- Status Progress -->
        <div v-if="orderStore.currentOrder.status !== 'CANCELLED' && orderStore.currentOrder.status !== 'REFUNDED'" class="status-progress">
          <div class="step-wrapper">
            <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 0 }]">
              <div class="step-icon">1</div>
            </div>
            <span class="step-label">下单</span>
          </div>
          <div class="step-line" :class="{ active: getStatusStep(orderStore.currentOrder.status) >= 1 }"></div>
          <div class="step-wrapper">
            <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 1 }]">
              <div class="step-icon">2</div>
            </div>
            <span class="step-label">支付</span>
          </div>
          <div class="step-line" :class="{ active: getStatusStep(orderStore.currentOrder.status) >= 2 }"></div>
          <div class="step-wrapper">
            <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 2 }]">
              <div class="step-icon">3</div>
            </div>
            <span class="step-label">完成</span>
          </div>
        </div>
      </div>

      <!-- Order Info -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-icon">📋</span>
          <h3 class="card-title">订单信息</h3>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">订单编号</span>
            <span class="info-value">{{ orderStore.currentOrder.id }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">下单时间</span>
            <span class="info-value">{{ formatDate(orderStore.currentOrder.createdAt) }}</span>
          </div>
          <div v-if="orderStore.currentOrder.paidAt" class="info-row">
            <span class="info-label">支付时间</span>
            <span class="info-value">{{ formatDate(orderStore.currentOrder.paidAt) }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">支付方式</span>
            <span class="info-value">{{ orderStore.currentOrder.paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</span>
          </div>
        </div>
      </div>

      <!-- Group Info -->
      <div v-if="orderStore.currentOrder.group" class="section-card">
        <div class="card-header">
          <span class="card-icon">👥</span>
          <h3 class="card-title">拼饭团信息</h3>
        </div>
        <div class="info-list">
          <div class="info-row">
            <span class="info-label">拼饭团名称</span>
            <span class="info-value">{{ orderStore.currentOrder.group.name }}</span>
          </div>
          <div class="info-row">
            <span class="info-label">邀请码</span>
            <span class="info-value accent">{{ orderStore.currentOrder.group.inviteCode }}</span>
          </div>
        </div>
      </div>

      <!-- Amount Info -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-icon">💰</span>
          <h3 class="card-title">金额信息</h3>
        </div>
        <div class="cost-list">
          <div class="cost-item">
            <span class="cost-label">商品金额</span>
            <span class="cost-value">¥{{ orderStore.currentOrder.totalAmount }}</span>
          </div>
          <div v-if="orderStore.currentOrder.discountAmount > 0" class="cost-item discount">
            <span class="cost-label">满减优惠</span>
            <span class="cost-value">-¥{{ orderStore.currentOrder.discountAmount }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">配送费</span>
            <span class="cost-value">¥{{ orderStore.currentOrder.deliveryFee }}</span>
          </div>
          <div class="cost-item total">
            <span class="cost-label">合计</span>
            <span class="cost-value final">¥{{ orderStore.currentOrder.finalAmount }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div v-if="orderStore.currentOrder" class="bottom-bar">
      <template v-if="orderStore.currentOrder.status === 'PENDING'">
        <button class="action-btn cancel" @click="handleCancel">取消订单</button>
        <button class="action-btn pay" @click="handlePay">去支付</button>
      </template>
      <template v-else-if="orderStore.currentOrder.status === 'COMPLETED'">
        <button class="action-btn back" @click="goBack">返回订单列表</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: 100px;
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

/* Content */
.content {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Section Card */
.section-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
}

.card-header {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  margin-bottom: var(--space-4);
  padding-bottom: var(--space-3);
  border-bottom: 1px solid var(--border-light);
}

.card-icon {
  font-size: 1.25rem;
}

.card-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Status Header */
.status-header {
  text-align: center;
  margin-bottom: var(--space-5);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-2) var(--space-5);
  font-size: 0.875rem;
  font-weight: 600;
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

/* Status Progress */
.status-progress {
  display: flex;
  align-items: flex-start;
  justify-content: center;
}

.step-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-2);
}

.step {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-tertiary);
  transition: all var(--transition-fast);
}

.step.active {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.step-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.step-wrapper:has(.step.active) .step-label {
  color: var(--color-accent);
}

.step-line {
  width: 48px;
  height: 2px;
  background: var(--bg-tertiary);
  margin: 15px var(--space-2) 0;
  transition: all var(--transition-fast);
}

.step-line.active {
  background: var(--color-accent);
}

/* Info List */
.info-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.info-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.info-value.accent {
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
  display: inline-block;
  width: fit-content;
}

/* Cost List */
.cost-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.cost-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.cost-label {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.cost-value {
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-primary);
}

.cost-item.discount .cost-value {
  color: var(--color-success);
}

.cost-item.total {
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
  margin-top: var(--space-2);
}

.cost-item.total .cost-label {
  font-weight: 600;
  color: var(--text-primary);
}

.cost-value.final {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-accent);
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-4);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.cancel {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.action-btn.pay {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-btn.pay:hover {
  background: #5558E3;
  box-shadow: var(--shadow-glow);
}

.action-btn.back {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-btn.back:hover {
  background: #5558E3;
}
</style>
