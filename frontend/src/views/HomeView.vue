<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCartStore } from '@/stores/cart'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const keyword = ref('')
const sortBy = ref<'rating' | 'sales' | 'deliveryTime' | 'deliveryFee'>('rating')

const sortOptions = [
  { label: '评分', value: 'rating' },
  { label: '销量', value: 'sales' },
  { label: '配送', value: 'deliveryTime' },
  { label: '配送费', value: 'deliveryFee' },
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

const goToProfile = () => {
  router.push('/profile')
}
</script>

<template>
  <div class="home-page">
    <!-- Header -->
    <header class="header">
      <div class="logo">
        <span class="logo-icon">🍱</span>
        <span class="logo-text">拼饭</span>
      </div>
      <div class="header-actions">
        <button class="action-btn" @click="goToGroups">
          <span class="action-icon">👥</span>
          <span class="action-text">拼饭团</span>
        </button>
        <button class="action-btn" @click="goToOrders">
          <span class="action-icon">📋</span>
          <span class="action-text">订单</span>
        </button>
        <button class="action-btn" @click="goToProfile">
          <span class="action-icon">👤</span>
          <span class="action-text">我的</span>
        </button>
      </div>
    </header>

    <!-- Search Section -->
    <div class="search-section">
      <div class="search-box">
        <span class="search-icon">🔍</span>
        <input
          v-model="keyword"
          type="search"
          placeholder="搜索商家名称..."
          class="search-input"
          @keyup.enter="handleSearch"
        />
        <button class="search-btn" @click="handleSearch">搜索</button>
      </div>
      <div class="sort-tabs">
        <button
          v-for="option in sortOptions"
          :key="option.value"
          :class="['sort-tab', { active: sortBy === option.value }]"
          @click="sortBy = option.value as any; handleSearch()"
        >
          {{ option.label }}
        </button>
      </div>
    </div>

    <!-- Restaurant List -->
    <div class="restaurant-list">
      <div
        v-for="(restaurant, index) in restaurantStore.restaurants"
        :key="restaurant.id"
        class="restaurant-card"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="goToRestaurant(restaurant.id)"
      >
        <div class="restaurant-logo">
          <img v-if="restaurant.logo" :src="restaurant.logo" :alt="restaurant.name" />
          <span v-else class="logo-placeholder">{{ restaurant.name.charAt(0) }}</span>
        </div>
        <div class="restaurant-content">
          <div class="restaurant-header">
            <h3 class="restaurant-name">{{ restaurant.name }}</h3>
            <div class="restaurant-rating">
              <span class="star">⭐</span>
              <span class="rating-value">{{ restaurant.rating }}</span>
            </div>
          </div>
          <div class="restaurant-meta">
            <span class="meta-item">
              <span class="meta-icon">📍</span>
              {{ restaurant.address }}
            </span>
          </div>
          <div class="restaurant-tags">
            <span class="tag tag-delivery">
              <span class="tag-icon">🚀</span>
              配送费¥{{ restaurant.deliveryFee }}
            </span>
            <span class="tag tag-min">
              <span class="tag-icon">💰</span>
              起送¥{{ restaurant.minOrder }}
            </span>
            <span
              v-for="(info, key) in restaurant.discountInfo"
              :key="key"
              class="tag tag-discount"
            >
              满{{ info.threshold }}减{{ info.discount }}
            </span>
          </div>
        </div>
      </div>

      <div v-if="restaurantStore.restaurants.length === 0 && !restaurantStore.isLoading" class="empty-state">
        <div class="empty-icon">🍽️</div>
        <div class="empty-title">暂无商家</div>
        <div class="empty-desc">稍后再来看看吧</div>
      </div>

      <div v-if="restaurantStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- Cart Bar -->
    <div v-if="cartStore.totalCount > 0" class="cart-bar" @click="goToCart">
      <div class="cart-left">
        <div class="cart-icon-wrapper">
          <span class="cart-icon">🛒</span>
          <span class="cart-badge">{{ cartStore.totalCount }}</span>
        </div>
        <div class="cart-info">
          <span class="cart-price">¥{{ cartStore.totalPrice }}</span>
        </div>
      </div>
      <button class="cart-btn">去凑单</button>
    </div>
  </div>
</template>

<style scoped>
.home-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: 100px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.logo {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.logo-icon {
  font-size: 1.5rem;
}

.logo-text {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--text-primary);
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.action-btn {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-btn.logout {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.action-btn.logout:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-icon {
  font-size: 0.875rem;
  position: relative;
}

.action-icon::before {
  content: none;
}

.action-icon::after {
  content: none;
}

.action-text {
  font-weight: 500;
}

/* Search Section */
.search-section {
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
}

.search-box {
  display: flex;
  align-items: center;
  gap: var(--space-3);
  padding: var(--space-3) var(--space-4);
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  margin-bottom: var(--space-3);
}

.search-icon {
  font-size: 1rem;
  opacity: 0.5;
}

.search-input {
  flex: 1;
  border: none;
  background: transparent;
  font-size: 0.875rem;
  color: var(--text-primary);
  outline: none;
}

.search-input::placeholder {
  color: var(--text-tertiary);
}

.search-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--color-accent);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.search-btn:hover {
  background: #5558E3;
}

.sort-tabs {
  display: flex;
  gap: var(--space-2);
}

.sort-tab {
  padding: var(--space-2) var(--space-3);
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-md);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.sort-tab:hover {
  background: var(--border-light);
}

.sort-tab.active {
  background: var(--color-accent);
  color: var(--text-inverse);
}

/* Restaurant List */
.restaurant-list {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.restaurant-card {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-base);
  animation: fadeIn 0.3s ease-out backwards;
}

.restaurant-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.restaurant-card:active {
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

.restaurant-logo {
  width: 72px;
  height: 72px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-accent), #818CF8);
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
  color: var(--text-inverse);
  font-size: 1.5rem;
  font-weight: 600;
}

.restaurant-content {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: var(--space-2);
}

.restaurant-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.restaurant-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.restaurant-rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
}

.star {
  font-size: 0.75rem;
}

.rating-value {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--color-warning);
}

.restaurant-meta {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.meta-item {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.meta-icon {
  font-size: 0.75rem;
}

.restaurant-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.tag {
  display: inline-flex;
  align-items: center;
  gap: var(--space-1);
  padding: var(--space-1) var(--space-2);
  font-size: 0.625rem;
  font-weight: 500;
  border-radius: var(--radius-sm);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.tag-discount {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.tag-icon {
  font-size: 0.625rem;
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

/* Cart Bar */
.cart-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-4) var(--space-5);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  background: var(--color-primary);
  z-index: 100;
}

.cart-left {
  display: flex;
  align-items: center;
  gap: var(--space-3);
}

.cart-icon-wrapper {
  position: relative;
}

.cart-icon {
  font-size: 1.5rem;
}

.cart-badge {
  position: absolute;
  top: -4px;
  right: -8px;
  min-width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--text-inverse);
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: 600;
}

.cart-price {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-inverse);
}

.cart-btn {
  padding: var(--space-3) var(--space-5);
  background: var(--color-accent);
  color: var(--text-inverse);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.cart-btn:hover {
  background: #5558E3;
}
</style>