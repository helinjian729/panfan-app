<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCartStore } from '@/stores/cart'

const route = useRoute()
const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()

const activeCategory = ref('all')
const restaurantId = route.params.id as string

onMounted(async () => {
  await Promise.all([
    restaurantStore.fetchRestaurantById(restaurantId),
    restaurantStore.fetchMenu(restaurantId),
    restaurantStore.fetchDiscountInfo(restaurantId),
  ])
})

const categories = computed(() => {
  const cats = ['all']
  restaurantStore.menuItems.forEach(item => {
    if (!cats.includes(item.category)) {
      cats.push(item.category)
    }
  })
  return cats
})

const filteredMenuItems = computed(() => {
  if (activeCategory.value === 'all') {
    return restaurantStore.menuItems
  }
  return restaurantStore.menuItems.filter(item => item.category === activeCategory.value)
})

const handleAddToCart = (item: any) => {
  if (cartStore.restaurantId && cartStore.restaurantId !== restaurantId) {
    cartStore.clearCart()
  }
  cartStore.addItem(item)
}

const handleUpdateQuantity = (item: any, delta: number) => {
  const currentQty = cartStore.getItemCount(item.id)
  const newQty = currentQty + delta
  if (newQty <= 0) {
    cartStore.removeItem(item.id)
  } else {
    cartStore.updateQuantity(item.id, newQty)
  }
}

const goBack = () => {
  router.back()
}

const goToCart = () => {
  router.push('/cart')
}

const goToCreateGroup = () => {
  router.push('/group/create')
}

const getCartTotal = () => {
  return cartStore.items
    .filter(item => item.menuItem.restaurantId === restaurantId)
    .reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
}
</script>

<template>
  <div class="restaurant-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">{{ restaurantStore.currentRestaurant?.name || '商家详情' }}</h1>
    </header>

    <!-- Restaurant Info -->
    <div v-if="restaurantStore.currentRestaurant" class="restaurant-info">
      <div class="info-main">
        <div class="restaurant-logo">
          <img v-if="restaurantStore.currentRestaurant.logo" :src="restaurantStore.currentRestaurant.logo" :alt="restaurantStore.currentRestaurant.name" />
          <span v-else>{{ restaurantStore.currentRestaurant.name.charAt(0) }}</span>
        </div>
        <div class="info-content">
          <h2 class="restaurant-name">{{ restaurantStore.currentRestaurant.name }}</h2>
          <div class="restaurant-meta">
            <span class="meta-rating">
              <span class="star">⭐</span>
              {{ restaurantStore.currentRestaurant.rating }}
            </span>
            <span class="meta-divider">|</span>
            <span class="meta-address">{{ restaurantStore.currentRestaurant.address }}</span>
          </div>
        </div>
      </div>
      <div v-if="restaurantStore.discountInfo" class="discount-tags">
        <span
          v-for="(info, key) in restaurantStore.discountInfo"
          :key="key"
          class="discount-tag"
        >
          满{{ info.threshold }}减{{ info.discount }}
        </span>
      </div>
    </div>

    <!-- Category Bar -->
    <div class="category-section">
      <div class="category-bar">
        <button
          v-for="cat in categories"
          :key="cat"
          :class="['category-btn', { active: activeCategory === cat }]"
          @click="activeCategory = cat"
        >
          {{ cat === 'all' ? '全部' : cat }}
        </button>
      </div>
    </div>

    <!-- Menu List -->
    <div class="menu-section">
      <div class="menu-list">
        <div
          v-for="(item, index) in filteredMenuItems"
          :key="item.id"
          class="menu-item"
          :style="{ animationDelay: `${index * 30}ms` }"
        >
          <div class="item-image">
            <img v-if="item.image || item.imageUrl" :src="item.image || item.imageUrl" :alt="item.name" />
            <span v-else class="image-placeholder">{{ item.name.charAt(0) }}</span>
          </div>
          <div class="item-content">
            <h3 class="item-name">{{ item.name }}</h3>
            <p v-if="item.description" class="item-desc">{{ item.description }}</p>
            <span class="item-price">¥{{ item.price }}</span>
          </div>
          <div class="item-actions">
            <template v-if="cartStore.getItemCount(item.id) > 0">
              <button class="qty-btn" @click="handleUpdateQuantity(item, -1)">−</button>
              <span class="qty-value">{{ cartStore.getItemCount(item.id) }}</span>
              <button class="qty-btn" @click="handleUpdateQuantity(item, 1)">+</button>
            </template>
            <button v-else class="add-btn" @click="handleAddToCart(item)">
              <span class="add-icon">+</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Cart Bar -->
    <div v-if="cartStore.totalCount > 0" class="cart-bar">
      <div class="cart-left" @click="goToCart">
        <div class="cart-icon-wrapper">
          <span class="cart-icon">🛒</span>
          <span class="cart-badge">{{ cartStore.totalCount }}</span>
        </div>
        <span class="cart-price">¥{{ getCartTotal() }}</span>
      </div>
      <button class="cart-btn" @click="goToCreateGroup">发起拼饭团</button>
    </div>
  </div>
</template>

<style scoped>
.restaurant-page {
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

/* Restaurant Info */
.restaurant-info {
  padding: var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.info-main {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.restaurant-logo {
  width: 64px;
  height: 64px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--color-accent), #818CF8);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-inverse);
  font-size: 1.5rem;
  font-weight: 600;
}

.restaurant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-content {
  flex: 1;
  min-width: 0;
}

.restaurant-name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.restaurant-meta {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  font-size: 0.75rem;
  color: var(--text-secondary);
}

.meta-rating {
  display: flex;
  align-items: center;
  gap: var(--space-1);
  font-weight: 600;
  color: var(--color-warning);
}

.meta-divider {
  color: var(--border-medium);
}

.discount-tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-2);
}

.discount-tag {
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  font-weight: 500;
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
  border-radius: var(--radius-sm);
}

/* Category Section */
.category-section {
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
}

.category-bar {
  display: flex;
  gap: var(--space-2);
  overflow-x: auto;
  hide-scrollbar: ;
}

.category-btn {
  padding: var(--space-2) var(--space-4);
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 500;
  color: var(--text-secondary);
  white-space: nowrap;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.category-btn:hover {
  background: var(--border-light);
}

.category-btn.active {
  background: var(--color-accent);
  color: var(--text-inverse);
}

/* Menu Section */
.menu-section {
  padding: var(--space-4) var(--space-5);
}

.menu-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-3);
}

.menu-item {
  display: flex;
  gap: var(--space-4);
  padding: var(--space-4);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-sm);
  animation: fadeIn 0.3s ease-out backwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(5px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.item-image {
  width: 80px;
  height: 80px;
  border-radius: var(--radius-lg);
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, var(--bg-tertiary), var(--border-light));
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform var(--transition-fast);
}

.item-image:hover img {
  transform: scale(1.05);
}

.image-placeholder {
  font-size: 1.25rem;
  color: var(--text-tertiary);
}

.item-content {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.item-desc {
  font-size: 0.75rem;
  color: var(--text-tertiary);
  margin-bottom: var(--space-2);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-price {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
}

.item-actions {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.add-btn {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-full);
  color: var(--text-inverse);
  font-size: 1rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.add-btn:hover {
  background: #5558E3;
  box-shadow: var(--shadow-glow);
}

.qty-btn {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.qty-btn:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.qty-value {
  min-width: 24px;
  text-align: center;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
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
  cursor: pointer;
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