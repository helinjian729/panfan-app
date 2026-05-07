<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()

const keyword = ref('')
const sortBy = ref<'rating' | 'sales' | 'deliveryTime' | 'deliveryFee'>('rating')

const sortOptions = [
  { label: '评分最高', value: 'rating' },
  { label: '销量最高', value: 'sales' },
  { label: '配送最快', value: 'deliveryTime' },
  { label: '配送费最低', value: 'deliveryFee' },
]

onMounted(() => {
  restaurantStore.fetchRestaurants()
})

const handleSearch = () => {
  restaurantStore.fetchRestaurants({
    keyword: keyword.value,
    sort: sortBy.value,
  })
}

const goToRestaurant = (id: string) => {
  router.push(`/restaurant/${id}`)
}

const goToCart = () => {
  router.push('/cart')
}

const goToGroups = () => {
  router.push('/groups')
}

const goToOrders = () => {
  router.push('/orders')
}
</script>

<template>
  <div class="home-page">
    <!-- 顶部导航 -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🍱</span>
        <span class="logo-text">拼饭</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="goToGroups">我的拼饭团</button>
        <button class="action-btn" @click="goToOrders">我的订单</button>
      </div>
    </header>

    <!-- 搜索栏 -->
    <div class="search-bar">
      <input
        v-model="keyword"
        type="search"
        placeholder="搜索商家名称"
        @keyup.enter="handleSearch"
      />
      <button class="search-btn" @click="handleSearch">搜索</button>
    </div>

    <!-- 排序选项 -->
    <div class="sort-bar">
      <button
        v-for="option in sortOptions"
        :key="option.value"
        :class="['sort-btn', { active: sortBy === option.value }]"
        @click="sortBy = option.value as any; handleSearch()"
      >
        {{ option.label }}
      </button>
    </div>

    <!-- 商家列表 -->
    <div class="restaurant-list">
      <div
        v-for="restaurant in restaurantStore.restaurants"
        :key="restaurant.id"
        class="restaurant-card"
        @click="goToRestaurant(restaurant.id)"
      >
        <div class="restaurant-logo">
          <img v-if="restaurant.logo" :src="restaurant.logo" :alt="restaurant.name" />
          <span v-else class="logo-placeholder">{{ restaurant.name.charAt(0) }}</span>
        </div>
        <div class="restaurant-info">
          <h3 class="restaurant-name">{{ restaurant.name }}</h3>
          <div class="restaurant-meta">
            <span class="rating">⭐ {{ restaurant.rating }}</span>
            <span class="sales">月售 {{ restaurant.sales }}</span>
            <span class="delivery-time">{{ restaurant.deliveryTime }}分钟</span>
          </div>
          <div class="restaurant-fee">
            <span>配送费¥{{ restaurant.deliveryFee }}</span>
            <span>起送价¥{{ restaurant.minimumOrder }}</span>
          </div>
          <div v-if="restaurant.discounts?.length" class="discounts">
            <span
              v-for="discount in restaurant.discounts"
              :key="discount.id"
              class="discount-tag"
            >
              满{{ discount.threshold }}减{{ discount.reduction }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="restaurantStore.restaurants.length === 0 && !restaurantStore.isLoading" class="empty-state">
        <p>暂无商家</p>
      </div>

      <div v-if="restaurantStore.isLoading" class="loading-state">
        <p>加载中...</p>
      </div>
    </div>

    <!-- 底部购物车 -->
    <div v-if="cartStore.totalCount > 0" class="cart-bar" @click="goToCart">
      <div class="cart-info">
        <span class="cart-icon">🛒</span>
        <span class="cart-count">{{ cartStore.totalCount }}</span>
      </div>
      <div class="cart-price">
        <span class="price">¥{{ cartStore.totalPrice }}</span>
        <span class="tip">拼单更优惠</span>
      </div>
      <button class="cart-btn">去凑单</button>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 16px 12px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
}

.logo-icon {
  font-size: 28px;
}

.logo-text {
  font-size: 20px;
  font-weight: 600;
  color: #FF6B35;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.action-btn {
  padding: 6px 12px;
  background: #FFF3EF;
  color: #FF6B35;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
}

.search-bar {
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  background: #fff;
}

.search-bar input {
  flex: 1;
  height: 40px;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 0 16px;
  font-size: 14px;
}

.search-bar input:focus {
  outline: none;
  border-color: #FF6B35;
}

.search-btn {
  width: 60px;
  height: 40px;
  background: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
}

.sort-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  overflow-x: auto;
  hide-scrollbar: ;
}

.sort-btn {
  padding: 6px 16px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.sort-btn.active {
  background: #FF6B35;
  color: #fff;
}

.restaurant-list {
  padding: 12px 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.restaurant-card {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  cursor: pointer;
  transition: transform 0.2s;
}

.restaurant-card:active {
  transform: scale(0.98);
}

.restaurant-logo {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
}

.restaurant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.logo-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.restaurant-info {
  flex: 1;
  min-width: 0;
}

.restaurant-name {
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.restaurant-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.rating {
  color: #FF8F6B;
}

.restaurant-fee {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
}

.discounts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.discount-tag {
  padding: 2px 6px;
  background: #FFF3EF;
  color: #FF6B35;
  border-radius: 4px;
  font-size: 11px;
}

.empty-state,
.loading-state {
  text-align: center;
  padding: 40px;
  color: #999;
}

.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #333;
  z-index: 100;
}

.cart-info {
  position: relative;
}

.cart-icon {
  font-size: 28px;
}

.cart-count {
  position: absolute;
  top: -4px;
  right: -8px;
  width: 18px;
  height: 18px;
  background: #FF6B35;
  color: #fff;
  border-radius: 50%;
  font-size: 11px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.cart-price {
  display: flex;
  flex-direction: column;
}

.price {
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.tip {
  color: #FF8F6B;
  font-size: 11px;
}

.cart-btn {
  padding: 10px 24px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>
