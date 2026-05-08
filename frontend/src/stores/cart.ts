import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { CartItem, MenuItem } from '@/types'

export const useCartStore = defineStore('cart', () => {
  const items = ref<CartItem[]>([])
  const restaurantId = ref<string | null>(null)

  // 计算总价
  const totalPrice = computed(() => {
    return items.value.reduce((sum, item) => sum + item.menuItem.price * item.quantity, 0)
  })

  // 计算总数量
  const totalCount = computed(() => {
    return items.value.reduce((sum, item) => sum + item.quantity, 0)
  })

  // 判断菜品是否在购物车
  const isInCart = (menuItemId: string) => {
    return items.value.some(item => item.menuItem.id === menuItemId)
  }

  // 获取菜品数量
  const getItemCount = (menuItemId: string) => {
    const item = items.value.find(item => item.menuItem.id === menuItemId)
    return item?.quantity || 0
  }

  // 添加到购物车
  const addItem = (menuItem: MenuItem, quantity: number = 1, note?: string) => {
    // 如果购物车已有其他餐厅的菜品，先清空
    if (restaurantId.value && restaurantId.value !== menuItem.restaurantId) {
      items.value = []
    }

    restaurantId.value = menuItem.restaurantId

    const existingItem = items.value.find(item => item.menuItem.id === menuItem.id)
    if (existingItem) {
      existingItem.quantity += quantity
      if (note) existingItem.note = note
    } else {
      items.value.push({
        id: `cart_${Date.now()}_${menuItem.id}`,
        menuItem,
        quantity,
        note,
      })
    }
  }

  // 更新菜品数量
  const updateQuantity = (menuItemId: string, quantity: number) => {
    const item = items.value.find(item => item.menuItem.id === menuItemId)
    if (item) {
      if (quantity <= 0) {
        removeItem(menuItemId)
      } else {
        item.quantity = quantity
      }
    }
  }

  // 从购物车移除
  const removeItem = (menuItemId: string) => {
    const index = items.value.findIndex(item => item.menuItem.id === menuItemId)
    if (index > -1) {
      items.value.splice(index, 1)
    }
    if (items.value.length === 0) {
      restaurantId.value = null
    }
  }

  // 清空购物车
  const clearCart = () => {
    items.value = []
    restaurantId.value = null
  }

  // 获取指定餐厅的凑单进度
  const getProgress = (targetAmount: number) => {
    return Math.min((totalPrice.value / targetAmount) * 100, 100)
  }

  return {
    items,
    restaurantId,
    totalPrice,
    totalCount,
    isInCart,
    getItemCount,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    getProgress,
  }
})
