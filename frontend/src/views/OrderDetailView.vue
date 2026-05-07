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

const getStatusStep = (status: string) => {
  const steps: Record<string, number> = {
    pending: 0,
    paid: 1,
    completed: 2,
    cancelled: -1,
    refunded: -1,
  }
  return steps[status] || 0
}

const formatDate = (dateStr: string) => {
  if (!dateStr) return '-'
  const date = new Date(dateStr)
  return `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`
}
</script>

<template>
  <div class="order-detail-page">
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">订单详情</h1>
      <div class="header-spacer"></div>
    </header>

    <div v-if="orderStore.currentOrder" class="content">
      <!-- 订单状态 -->
      <div class="status-card">
        <div :class="['status-badge', getStatusClass(orderStore.currentOrder.status)]">
          {{ getStatusText(orderStore.currentOrder.status) }}
        </div>

        <!-- 状态进度 -->
        <div v-if="orderStore.currentOrder.status !== 'cancelled' && orderStore.currentOrder.status !== 'refunded'" class="status-progress">
          <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 0 }]">
            <div class="step-icon">1</div>
            <span class="step-label">下单</span>
          </div>
          <div class="step-line" :class="{ active: getStatusStep(orderStore.currentOrder.status) >= 1 }"></div>
          <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 1 }]">
            <div class="step-icon">2</div>
            <span class="step-label">支付</span>
          </div>
          <div class="step-line" :class="{ active: getStatusStep(orderStore.currentOrder.status) >= 2 }"></div>
          <div :class="['step', { active: getStatusStep(orderStore.currentOrder.status) >= 2 }]">
            <div class="step-icon">3</div>
            <span class="step-label">完成</span>
          </div>
        </div>
      </div>

      <!-- 订单信息 -->
      <div class="info-card">
        <h3 class="card-title">订单信息</h3>
        <div class="info-row">
          <span class="label">订单编号</span>
          <span class="value">{{ orderStore.currentOrder.id }}</span>
        </div>
        <div class="info-row">
          <span class="label">下单时间</span>
          <span class="value">{{ formatDate(orderStore.currentOrder.createdAt) }}</span>
        </div>
        <div v-if="orderStore.currentOrder.paidAt" class="info-row">
          <span class="label">支付时间</span>
          <span class="value">{{ formatDate(orderStore.currentOrder.paidAt) }}</span>
        </div>
        <div class="info-row">
          <span class="label">支付方式</span>
          <span class="value">{{ orderStore.currentOrder.paymentMethod === 'wechat' ? '微信支付' : '支付宝' }}</span>
        </div>
      </div>

      <!-- 拼饭团信息 -->
      <div v-if="orderStore.currentOrder.group" class="info-card">
        <h3 class="card-title">拼饭团信息</h3>
        <div class="info-row">
          <span class="label">拼饭团名称</span>
          <span class="value">{{ orderStore.currentOrder.group.name }}</span>
        </div>
        <div class="info-row">
          <span class="label">邀请码</span>
          <span class="value code">{{ orderStore.currentOrder.group.inviteCode }}</span>
        </div>
      </div>

      <!-- 金额信息 -->
      <div class="info-card">
        <h3 class="card-title">金额信息</h3>
        <div class="info-row">
          <span class="label">商品金额</span>
          <span class="value">¥{{ orderStore.currentOrder.totalAmount }}</span>
        </div>
        <div v-if="orderStore.currentOrder.discountAmount > 0" class="info-row discount">
          <span class="label">满减优惠</span>
          <span class="value">-¥{{ orderStore.currentOrder.discountAmount }}</span>
        </div>
        <div class="info-row">
          <span class="label">配送费</span>
          <span class="value">¥{{ orderStore.currentOrder.deliveryFee }}</span>
        </div>
        <div class="info-row total">
          <span class="label">合计</span>
          <span class="value">¥{{ orderStore.currentOrder.finalAmount }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="orderStore.currentOrder" class="bottom-bar">
      <template v-if="orderStore.currentOrder.status === 'pending'">
        <button class="action-btn cancel" @click="handleCancel">取消订单</button>
        <button class="action-btn pay" @click="handlePay">去支付</button>
      </template>
      <template v-else-if="orderStore.currentOrder.status === 'completed'">
        <button class="action-btn back" @click="goBack">返回订单列表</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.order-detail-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 80px;
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

.content {
  padding: 16px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 16px;
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 8px 24px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 24px;
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

.status-progress {
  display: flex;
  align-items: center;
  justify-content: center;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.step-icon {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e0e0e0;
  color: #999;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  margin-bottom: 8px;
}

.step.active .step-icon {
  background: #FF6B35;
  color: #fff;
}

.step-label {
  font-size: 12px;
  color: #999;
}

.step.active .step-label {
  color: #FF6B35;
}

.step-line {
  width: 60px;
  height: 2px;
  background: #e0e0e0;
  margin: 0 8px;
  margin-bottom: 24px;
}

.step-line.active {
  background: #FF6B35;
}

.info-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
}

.info-row.total {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 16px;
  font-weight: 600;
}

.label {
  color: #999;
}

.value {
  color: #333;
}

.value.code {
  color: #FF6B35;
  font-weight: 500;
}

.info-row.discount .value {
  color: #4CAF50;
}

.info-row.total .value {
  color: #FF6B35;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.cancel {
  background: #FFEBEE;
  color: #F44336;
}

.action-btn.pay {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
}

.action-btn.back {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
}
</style>
