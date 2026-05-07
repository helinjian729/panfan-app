<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useCartStore } from '@/stores/cart'
import { useToast } from '@/hooks/useToast'

const route = useRoute()
const router = useRouter()
const restaurantStore = useRestaurantStore()
const cartStore = useCartStore()
const { showToast } = useToast()

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
    showToast({ message: '已清空其他餐厅的购物车' })
    cartStore.clearCart()
  }
  cartStore.addItem(item)
  showToast({ message: '已添加至购物车' })
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
</script>

<template>
  <div class="restaurant-page">
    <!-- 顶部导航 -->
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">{{ restaurantStore.currentRestaurant?.name || '商家详情' }}</h1>
      <div class="header-spacer"></div>
    </header>

    <!-- 商家信息 -->
    <div v-if="restaurantStore.currentRestaurant" class="restaurant-info">
      <div class="info-main">
        <div class="logo">
          <img v-if="restaurantStore.currentRestaurant.logo" :src="restaurantStore.currentRestaurant.logo" :alt="restaurantStore.currentRestaurant.name" />
          <span v-else>{{ restaurantStore.currentRestaurant.name.charAt(0) }}</span>
        </div>
        <div class="info-text">
          <h2>{{ restaurantStore.currentRestaurant.name }}</h2>
          <p class="address">{{ restaurantStore.currentRestaurant.address }}</p>
          <div class="meta">
            <span>⭐ {{ restaurantStore.currentRestaurant.rating }}</span>
            <span>月售 {{ restaurantStore.currentRestaurant.sales }}</span>
            <span>{{ restaurantStore.currentRestaurant.deliveryTime }}分钟</span>
          </div>
        </div>
      </div>
      <div v-if="restaurantStore.discountInfo?.discounts?.length" class="discounts">
        <span
          v-for="d in restaurantStore.discountInfo.discounts"
          :key="d.id"
          class="discount-tag"
        >
          满{{ d.threshold }}减{{ d.reduction }}
        </span>
      </div>
    </div>

    <!-- 分类标签 -->
    <div class="category-bar">
      <button
        v-for="cat in categories"
        :key="cat"
        :class="['cat-btn', { active: activeCategory === cat }]"
        @click="activeCategory = cat"
      >
        {{ cat === 'all' ? '全部' : cat }}
      </button>
    </div>

    <!-- 菜单列表 -->
    <div class="menu-list">
      <div
        v-for="item in filteredMenuItems"
        :key="item.id"
        class="menu-item"
      >
        <div class="item-image">
          <img v-if="item.image" :src="item.image" :alt="item.name" />
          <span v-else class="image-placeholder">{{ item.name.charAt(0) }}</span>
        </div>
        <div class="item-info">
          <h3 class="item-name">{{ item.name }}</h3>
          <p v-if="item.description" class="item-desc">{{ item.description }}</p>
          <div class="item-meta">
            <span class="price">¥{{ item.price }}</span>
            <span class="sales">月售 {{ item.sales }}</span>
          </div>
        </div>
        <div class="item-actions">
          <template v-if="cartStore.getItemCount(item.id) > 0">
            <button class="qty-btn" @click="handleUpdateQuantity(item, -1)">-</button>
            <span class="qty">{{ cartStore.getItemCount(item.id) }}</span>
            <button class="qty-btn" @click="handleUpdateQuantity(item, 1)">+</button>
          </template>
          <button v-else class="add-btn" @click="handleAddToCart(item)">+</button>
        </div>
      </div>
    </div>

    <!-- 凑单提示 -->
    <div v-if="restaurantStore.discountInfo?.groupDiscounts?.length" class="group-tip">
      <div class="tip-title">拼饭团满减</div>
      <div
        v-for="gd in restaurantStore.discountInfo.groupDiscounts"
        :key="gd.id"
        class="group-discount"
      >
        <span class="desc">{{ gd.description }}</span>
        <span class="progress">{{ gd.currentCount }}/{{ gd.targetCount }}人</span>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <div class="cart-summary" @click="goToCart">
        <span class="cart-icon">🛒</span>
        <span v-if="cartStore.totalCount > 0" class="cart-count">{{ cartStore.totalCount }}</span>
        <span class="cart-price">¥{{ cartStore.totalPrice }}</span>
      </div>
      <button class="group-btn" @click="goToCreateGroup">发起拼饭团</button>
    </div>
  </div>
</template>

<style scoped>
.restaurant-page {
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

.header-spacer {
  width: 32px;
}

.restaurant-info {
  padding: 16px;
  background: #fff;
  margin-bottom: 8px;
}

.info-main {
  display: flex;
  gap: 12px;
}

.logo {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 24px;
  font-weight: 600;
}

.logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.info-text h2 {
  font-size: 16px;
  margin-bottom: 4px;
}

.address {
  font-size: 12px;
  color: #666;
  margin-bottom: 6px;
}

.meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.discounts {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 12px;
}

.discount-tag {
  padding: 4px 8px;
  background: #FFF3EF;
  color: #FF6B35;
  border-radius: 4px;
  font-size: 12px;
}

.category-bar {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  background: #fff;
  overflow-x: auto;
  margin-bottom: 8px;
}

.cat-btn {
  padding: 6px 16px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 16px;
  font-size: 13px;
  white-space: nowrap;
  cursor: pointer;
}

.cat-btn.active {
  background: #FF6B35;
  color: #fff;
}

.menu-list {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
}

.item-image {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  background: #f5f5f5;
  display: flex;
  align-items: center;
  justify-content: center;
}

.item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.image-placeholder {
  font-size: 20px;
  color: #999;
}

.item-info {
  flex: 1;
  min-width: 0;
}

.item-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.item-desc {
  font-size: 12px;
  color: #999;
  margin-bottom: 6px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.item-meta {
  display: flex;
  align-items: center;
  gap: 12px;
}

.price {
  font-size: 16px;
  color: #FF6B35;
  font-weight: 500;
}

.sales {
  font-size: 12px;
  color: #999;
}

.item-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.qty-btn {
  width: 28px;
  height: 28px;
  background: #FF6B35;
  color: #fff;
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

.add-btn {
  width: 28px;
  height: 28px;
  background: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.group-tip {
  margin: 16px;
  padding: 16px;
  background: #FFF3EF;
  border-radius: 12px;
}

.tip-title {
  font-size: 14px;
  font-weight: 500;
  color: #FF6B35;
  margin-bottom: 12px;
}

.group-discount {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
}

.desc {
  font-size: 13px;
  color: #333;
}

.progress {
  font-size: 12px;
  color: #FF6B35;
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

.cart-summary {
  display: flex;
  align-items: center;
  gap: 8px;
}

.cart-icon {
  font-size: 24px;
}

.cart-count {
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
  font-size: 16px;
  font-weight: 500;
}

.group-btn {
  padding: 12px 24px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}
</style>
