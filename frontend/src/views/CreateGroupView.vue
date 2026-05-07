<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useRestaurantStore } from '@/stores/restaurant'
import { useGroupStore } from '@/stores/group'
import { useCartStore } from '@/stores/cart'

const router = useRouter()
const restaurantStore = useRestaurantStore()
const groupStore = useGroupStore()
const cartStore = useCartStore()

const name = ref('')
const targetAmount = ref(0)
const maxMembers = ref(4)
const deadline = ref('')

const minDate = computed(() => {
  const now = new Date()
  return now.toISOString().split('T')[0]
})

onMounted(async () => {
  await restaurantStore.fetchRestaurants()
})

const handleCreateGroup = async () => {
  if (!name.value || !cartStore.restaurantId) {
    alert('请填写完整信息')
    return
  }

  // 设置默认截止时间为当天 12:00
  const defaultDeadline = new Date()
  defaultDeadline.setHours(12, 0, 0, 0)
  if (new Date() > defaultDeadline) {
    defaultDeadline.setDate(defaultDeadline.getDate() + 1)
  }

  try {
    const group = await groupStore.fetchCreateGroup({
      restaurantId: cartStore.restaurantId,
      name: name.value,
      targetAmount: targetAmount.value || cartStore.totalPrice,
      maxMembers: maxMembers.value,
      deadline: deadline.value || defaultDeadline.toISOString(),
    })

    // 将购物车商品添加到拼饭团
    for (const item of cartStore.items) {
      await groupStore.fetchAddGroupItem(group.id, {
        menuItemId: item.menuItem.id,
        quantity: item.quantity,
        note: item.note,
      })
    }

    cartStore.clearCart()
    router.push(`/group/${group.id}`)
  } catch (error) {
    console.error('创建拼饭团失败:', error)
  }
}

const goBack = () => {
  router.back()
}

const selectRestaurant = (restaurant: any) => {
  router.push(`/restaurant/${restaurant.id}`)
}
</script>

<template>
  <div class="create-group-page">
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">发起拼饭团</h1>
      <div class="header-spacer"></div>
    </header>

    <div class="form-content">
      <!-- 选择餐厅 -->
      <div class="form-section">
        <h3 class="section-title">选择餐厅</h3>
        <div
          v-if="cartStore.restaurantId && restaurantStore.currentRestaurant"
          class="selected-restaurant"
          @click="router.push('/home')"
        >
          <div class="restaurant-logo">
            <img v-if="restaurantStore.currentRestaurant.logo" :src="restaurantStore.currentRestaurant.logo" :alt="restaurantStore.currentRestaurant.name" />
            <span v-else>{{ restaurantStore.currentRestaurant.name.charAt(0) }}</span>
          </div>
          <div class="restaurant-info">
            <span class="name">{{ restaurantStore.currentRestaurant.name }}</span>
            <span class="tip">点击重新选择</span>
          </div>
        </div>
        <div v-else class="restaurant-list">
          <div
            v-for="restaurant in restaurantStore.restaurants.slice(0, 5)"
            :key="restaurant.id"
            class="restaurant-item"
            @click="selectRestaurant(restaurant)"
          >
            <div class="restaurant-logo">
              <img v-if="restaurant.logo" :src="restaurant.logo" :alt="restaurant.name" />
              <span v-else>{{ restaurant.name.charAt(0) }}</span>
            </div>
            <span class="name">{{ restaurant.name }}</span>
          </div>
        </div>
      </div>

      <!-- 购物车商品 -->
      <div v-if="cartStore.items.length > 0" class="form-section">
        <h3 class="section-title">已选菜品</h3>
        <div class="cart-items">
          <div v-for="item in cartStore.items" :key="item.id" class="cart-item">
            <span class="item-name">{{ item.menuItem.name }}</span>
            <span class="item-qty">x{{ item.quantity }}</span>
            <span class="item-price">¥{{ item.menuItem.price * item.quantity }}</span>
          </div>
        </div>
        <div class="cart-total">
          合计: <span class="price">¥{{ cartStore.totalPrice }}</span>
        </div>
      </div>

      <!-- 拼饭团设置 -->
      <div class="form-section">
        <h3 class="section-title">拼饭团设置</h3>

        <div class="form-item">
          <label>拼饭团名称</label>
          <input
            v-model="name"
            type="text"
            placeholder="给拼饭团起个名字"
          />
        </div>

        <div class="form-item">
          <label>目标金额</label>
          <input
            v-model.number="targetAmount"
            type="number"
            placeholder="填写目标凑单金额"
          />
          <span class="hint">当前已选 ¥{{ cartStore.totalPrice }}</span>
        </div>

        <div class="form-item">
          <label>最大成员数</label>
          <div class="member-selector">
            <button
              v-for="n in [2, 3, 4, 5, 6]"
              :key="n"
              :class="['member-btn', { active: maxMembers === n }]"
              @click="maxMembers = n"
            >
              {{ n }}人
            </button>
          </div>
        </div>

        <div class="form-item">
          <label>截止时间</label>
          <input
            v-model="deadline"
            type="date"
            :min="minDate"
          />
          <span class="hint">默认当天12:00截止</span>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <button
        class="create-btn"
        :disabled="!cartStore.restaurantId || cartStore.items.length === 0"
        @click="handleCreateGroup"
      >
        发起拼饭团
      </button>
    </div>
  </div>
</template>

<style scoped>
.create-group-page {
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

.form-content {
  padding: 16px;
}

.form-section {
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

.selected-restaurant {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: #FFF3EF;
  border-radius: 8px;
  cursor: pointer;
}

.restaurant-logo {
  width: 48px;
  height: 48px;
  border-radius: 8px;
  overflow: hidden;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}

.restaurant-logo img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.restaurant-info {
  flex: 1;
}

.restaurant-info .name {
  font-size: 14px;
  font-weight: 500;
}

.restaurant-info .tip {
  font-size: 12px;
  color: #999;
}

.restaurant-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.restaurant-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.restaurant-item:hover {
  background: #f5f5f5;
}

.cart-items {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 12px;
}

.cart-item {
  display: flex;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.cart-item:last-child {
  border-bottom: none;
}

.item-name {
  flex: 1;
  font-size: 14px;
}

.item-qty {
  margin: 0 12px;
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
}

.cart-total {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
  font-size: 14px;
}

.cart-total .price {
  color: #FF6B35;
  font-weight: 600;
  margin-left: 4px;
}

.form-item {
  margin-bottom: 16px;
}

.form-item:last-child {
  margin-bottom: 0;
}

.form-item label {
  display: block;
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.form-item input {
  width: 100%;
  height: 44px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 12px;
  font-size: 14px;
}

.form-item input:focus {
  outline: none;
  border-color: #FF6B35;
}

.hint {
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 6px;
}

.member-selector {
  display: flex;
  gap: 8px;
}

.member-btn {
  flex: 1;
  padding: 10px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 13px;
  cursor: pointer;
  transition: all 0.3s;
}

.member-btn.active {
  background: #FF6B35;
  color: #fff;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.create-btn {
  width: 100%;
  padding: 14px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
}

.create-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
