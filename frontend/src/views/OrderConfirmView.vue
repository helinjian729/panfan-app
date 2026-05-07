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
    alert('请先选择拼饭团')
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
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">确认订单</h1>
      <div class="header-spacer"></div>
    </header>

    <div class="content">
      <!-- 拼饭团信息 -->
      <div v-if="groupStore.currentGroup" class="section group-info">
        <h3 class="section-title">拼饭团信息</h3>
        <div class="info-card">
          <div class="info-row">
            <span class="label">拼饭团</span>
            <span class="value">{{ groupStore.currentGroup.name }}</span>
          </div>
          <div class="info-row">
            <span class="label">邀请码</span>
            <span class="value code">{{ groupStore.currentGroup.inviteCode }}</span>
          </div>
          <div class="info-row">
            <span class="label">目标金额</span>
            <span class="value">¥{{ groupStore.currentGroup.targetAmount }}</span>
          </div>
          <div class="info-row">
            <span class="label">当前金额</span>
            <span class="value highlight">¥{{ groupStore.currentGroup.currentAmount }}</span>
          </div>
        </div>
      </div>

      <!-- 费用明细 -->
      <div v-if="groupStore.calculateInfo" class="section">
        <h3 class="section-title">费用明细</h3>
        <div class="detail-card">
          <div class="detail-row">
            <span>商品金额</span>
            <span>¥{{ groupStore.calculateInfo.currentAmount }}</span>
          </div>
          <div class="detail-row discount">
            <span>满减优惠</span>
            <span>-¥{{ groupStore.calculateInfo.discountAmount }}</span>
          </div>
          <div class="detail-row">
            <span>配送费</span>
            <span>¥{{ groupStore.calculateInfo.deliveryFee }}</span>
          </div>
          <div class="detail-row total">
            <span>合计</span>
            <span class="final-price">¥{{ groupStore.calculateInfo.finalAmount }}</span>
          </div>
        </div>
      </div>

      <!-- 菜品清单 -->
      <div v-if="groupStore.groupItems.length > 0" class="section">
        <h3 class="section-title">已选菜品</h3>
        <div class="items-card">
          <div v-for="item in groupStore.groupItems" :key="item.id" class="item-row">
            <div class="item-info">
              <span class="item-name">{{ item.menuItem?.name || '未知菜品' }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">¥{{ (item.menuItem?.price || 0) * item.quantity }}</span>
          </div>
        </div>
      </div>

      <!-- 支付方式 -->
      <div class="section">
        <h3 class="section-title">支付方式</h3>
        <div class="payment-options">
          <button
            :class="['payment-btn', { active: paymentMethod === 'wechat' }]"
            @click="paymentMethod = 'wechat'"
          >
            <span class="icon">💳</span>
            <span>微信支付</span>
          </button>
          <button
            :class="['payment-btn', { active: paymentMethod === 'alipay' }]"
            @click="paymentMethod = 'alipay'"
          >
            <span class="icon">💳</span>
            <span>支付宝</span>
          </button>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="price-info">
        <span class="label">合计</span>
        <span class="price">¥{{ finalAmount }}</span>
      </div>
      <button class="pay-btn" :disabled="isCreating" @click="handleCreateOrder">
        {{ isCreating ? '提交中...' : '提交订单' }}
      </button>
    </div>
  </div>
</template>

<style scoped>
.order-confirm-page {
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

.section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.info-card,
.detail-card,
.items-card {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
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

.value.highlight {
  color: #FF6B35;
  font-weight: 600;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}

.detail-row.discount {
  color: #4CAF50;
}

.detail-row.total {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.final-price {
  color: #FF6B35;
  font-size: 18px;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  display: flex;
  gap: 8px;
}

.item-name {
  font-size: 14px;
}

.item-qty {
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
}

.payment-options {
  display: flex;
  gap: 12px;
}

.payment-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 16px;
  background: #f9f9f9;
  border: 2px solid transparent;
  border-radius: 12px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.payment-btn.active {
  border-color: #FF6B35;
  background: #FFF3EF;
}

.icon {
  font-size: 20px;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.price-info {
  display: flex;
  flex-direction: column;
}

.price-info .label {
  font-size: 12px;
  color: #999;
}

.price-info .price {
  font-size: 20px;
  font-weight: 600;
  color: #FF6B35;
}

.pay-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.pay-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
