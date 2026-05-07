<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cart'
import { useRestaurantStore } from '@/stores/restaurant'

const router = useRouter()
const cartStore = useCartStore()
const restaurantStore = useRestaurantStore()

const progress = computed(() => {
  if (!restaurantStore.discountInfo?.discounts?.length) return 0
  const target = restaurantStore.discountInfo.discounts[0].threshold
  return cartStore.getProgress(target)
})

const currentDiscount = computed(() => {
  if (!restaurantStore.discountInfo?.discounts?.length) return null
  return restaurantStore.discountInfo.discounts[0]
})

const goBack = () => {
  router.back()
}

const handleCheckout = () => {
  router.push('/order/confirm')
}
</script>

<template>
  <div class="cart-page">
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">购物车</h1>
      <button v-if="cartStore.items.length > 0" class="clear-btn" @click="cartStore.clearCart">清空</button>
    </header>

    <div v-if="cartStore.items.length === 0" class="empty-state">
      <span class="empty-icon">🛒</span>
      <p>购物车是空的</p>
      <button class="go-shopping" @click="router.push('/home')">去选购</button>
    </div>

    <div v-else class="cart-content">
      <!-- 凑单进度 -->
      <div v-if="currentDiscount" class="progress-card">
        <div class="progress-info">
          <span class="label">拼单满减</span>
          <span class="desc">满{{ currentDiscount.threshold }}减{{ currentDiscount.reduction }}</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" :style="{ width: `${progress}%` }"></div>
        </div>
        <div class="progress-tip">
          <span v-if="progress >= 100" class="success">已凑满，减{{ currentDiscount.reduction }}元</span>
          <span v-else>还差¥{{ (currentDiscount.threshold - cartStore.totalPrice).toFixed(2) }}可凑满</span>
        </div>
      </div>

      <!-- 购物车列表 -->
      <div class="cart-list">
        <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
          <div class="item-info">
            <h3 class="item-name">{{ item.menuItem.name }}</h3>
            <p v-if="item.note" class="item-note">备注: {{ item.note }}</p>
            <span class="item-price">¥{{ item.menuItem.price }}</span>
          </div>
          <div class="item-actions">
            <button class="qty-btn" @click="cartStore.updateQuantity(item.menuItem.id, item.quantity - 1)">-</button>
            <span class="qty">{{ item.quantity }}</span>
            <button class="qty-btn" @click="cartStore.updateQuantity(item.menuItem.id, item.quantity + 1)">+</button>
          </div>
        </div>
      </div>

      <!-- 金额明细 -->
      <div class="amount-detail">
        <div class="detail-row">
          <span>商品金额</span>
          <span>¥{{ cartStore.totalPrice }}</span>
        </div>
        <div v-if="progress >= 100" class="detail-row discount">
          <span>满减优惠</span>
          <span>-¥{{ currentDiscount?.reduction }}</span>
        </div>
        <div class="detail-row total">
          <span>合计</span>
          <span>¥{{ progress >= 100 ? cartStore.totalPrice - (currentDiscount?.reduction || 0) : cartStore.totalPrice }}</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div v-if="cartStore.items.length > 0" class="bottom-bar">
      <div class="total-info">
        <span class="total-price">¥{{ progress >= 100 && currentDiscount ? cartStore.totalPrice - currentDiscount.reduction : cartStore.totalPrice }}</span>
        <span v-if="progress >= 100 && currentDiscount" class="original-price">¥{{ cartStore.totalPrice }}</span>
      </div>
      <button class="checkout-btn" @click="handleCheckout">去结算</button>
    </div>
  </div>
</template>

<style scoped>
.cart-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 70px;
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

.clear-btn {
  background: none;
  border: none;
  color: #FF6B35;
  font-size: 14px;
  cursor: pointer;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 0;
}

.empty-icon {
  font-size: 64px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 24px;
}

.go-shopping {
  padding: 12px 32px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  cursor: pointer;
}

.cart-content {
  padding: 16px;
}

.progress-card {
  background: #FFF3EF;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.label {
  font-size: 14px;
  font-weight: 500;
  color: #FF6B35;
}

.desc {
  font-size: 13px;
  color: #333;
}

.progress-bar {
  height: 8px;
  background: #fff;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8F6B 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-tip {
  font-size: 12px;
  color: #666;
}

.progress-tip .success {
  color: #4CAF50;
}

.cart-list {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
}

.cart-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
}

.item-name {
  font-size: 14px;
  margin-bottom: 4px;
}

.item-note {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  font-size: 16px;
  cursor: pointer;
}

.qty {
  width: 24px;
  text-align: center;
  font-size: 14px;
}

.amount-detail {
  margin-top: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
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

.total-info {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.total-price {
  font-size: 20px;
  font-weight: 600;
  color: #FF6B35;
}

.original-price {
  font-size: 14px;
  color: #999;
  text-decoration: line-through;
}

.checkout-btn {
  padding: 14px 32px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}
</style>
