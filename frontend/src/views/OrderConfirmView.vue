<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useOrderStore } from '@/stores/order'
import { useGroupStore } from '@/stores/group'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const orderStore = useOrderStore()
const groupStore = useGroupStore()
const cartStore = useCartStore()

const paymentMethod = ref<'wechat' | 'alipay'>('wechat')
const isCreating = ref(false)

const finalAmount = computed(() => {
  if (!groupStore.calculateInfo) return cartStore.totalPrice
  return groupStore.calculateInfo.finalAmount
})

const goBack = () => {
  router.back()
}

const handleCreateOrder = async () => {
  if (!groupStore.currentGroup) {
    return
  }

  isCreating.value = true
  try {
    await orderStore.fetchCreateOrder({
      groupId: groupStore.currentGroup.id,
      paymentMethod: paymentMethod.value,
    })
    router.push(`/order/${orderStore.currentOrder?.id}`)
  } catch (error) {
    console.error('创建订单失败:', error)
  } finally {
    isCreating.value = false
  }
}
</script>

<template>
  <div class="order-confirm-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">确认订单</h1>
    </header>

    <div class="content">
      <!-- Group Info -->
      <div v-if="groupStore.currentGroup" class="section-card">
        <div class="card-header">
          <span class="card-icon">👥</span>
          <h3 class="card-title">拼饭团信息</h3>
        </div>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">拼饭团</span>
            <span class="info-value">{{ groupStore.currentGroup.name }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">邀请码</span>
            <span class="info-value accent">{{ groupStore.currentGroup.inviteCode }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">目标金额</span>
            <span class="info-value">¥{{ groupStore.currentGroup.totalAmount }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">当前金额</span>
            <span class="info-value highlight">¥{{ groupStore.calculateInfo?.currentAmount || 0 }}</span>
          </div>
        </div>
      </div>

      <!-- Cost Details -->
      <div v-if="groupStore.calculateInfo" class="section-card">
        <div class="card-header">
          <span class="card-icon">💰</span>
          <h3 class="card-title">费用明细</h3>
        </div>
        <div class="cost-list">
          <div class="cost-item">
            <span class="cost-label">商品金额</span>
            <span class="cost-value">¥{{ groupStore.calculateInfo.currentAmount }}</span>
          </div>
          <div class="cost-item discount">
            <span class="cost-label">满减优惠</span>
            <span class="cost-value">-¥{{ groupStore.calculateInfo.discountAmount }}</span>
          </div>
          <div class="cost-item">
            <span class="cost-label">配送费</span>
            <span class="cost-value">¥{{ groupStore.calculateInfo.deliveryFee }}</span>
          </div>
          <div class="cost-item total">
            <span class="cost-label">合计</span>
            <span class="cost-value final">¥{{ groupStore.calculateInfo.finalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- Menu Items -->
      <div v-if="groupStore.groupItems.length > 0" class="section-card">
        <div class="card-header">
          <span class="card-icon">🍱</span>
          <h3 class="card-title">已选菜品</h3>
        </div>
        <div class="menu-list">
          <div v-for="item in groupStore.groupItems" :key="item.id" class="menu-item">
            <div class="menu-info">
              <span class="menu-name">{{ item.menuItem?.name || '未知菜品' }}</span>
              <span class="menu-qty">x{{ item.quantity }}</span>
            </div>
            <span class="menu-price">¥{{ (item.menuItem?.price || 0) * item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- Payment Method -->
      <div class="section-card">
        <div class="card-header">
          <span class="card-icon">💳</span>
          <h3 class="card-title">支付方式</h3>
        </div>
        <div class="payment-options">
          <button
            :class="['payment-btn', { active: paymentMethod === 'wechat' }]"
            @click="paymentMethod = 'wechat'"
          >
            <span class="payment-icon">💚</span>
            <span>微信支付</span>
          </button>
          <button
            :class="['payment-btn', { active: paymentMethod === 'alipay' }]"
            @click="paymentMethod = 'alipay'"
          >
            <span class="payment-icon">💙</span>
            <span>支付宝</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <div class="price-info">
        <span class="price-label">合计</span>
        <span class="price-value">¥{{ finalAmount }}</span>
      </div>
      <button class="submit-btn" :disabled="isCreating" @click="handleCreateOrder">
        {{ isCreating ? '提交中...' : '提交订单' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-confirm-page {
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

/* Info Grid */
.info-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-4);
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-1);
}

.info-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.info-value {
  font-size: 0.875rem;
  font-weight: 600;
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

.info-value.highlight {
  color: var(--color-accent);
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

/* Menu List */
.menu-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.menu-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.menu-info {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.menu-name {
  font-size: 0.875rem;
  color: var(--text-primary);
}

.menu-qty {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.menu-price {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

/* Payment Options */
.payment-options {
  display: flex;
  gap: var(--space-3);
}

.payment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.payment-btn:hover {
  background: var(--border-light);
}

.payment-btn.active {
  border-color: var(--color-accent);
  background: rgba(99, 102, 241, 0.05);
  color: var(--color-accent);
}

.payment-icon {
  font-size: 1.25rem;
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-label {
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.price-value {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.submit-btn {
  padding: var(--space-4) var(--space-8);
  background: var(--color-accent);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.submit-btn:hover {
  background: #5558E3;
  box-shadow: var(--shadow-glow);
}

.submit-btn:disabled {
  background: var(--border-medium);
  cursor: not-allowed;
}
</style>