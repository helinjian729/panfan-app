import { defineStore } from 'pinia'
import { ref } from 'vue'
import { getRestaurants, getRestaurantById, getRestaurantMenu, getDiscountInfo } from '@/api/restaurant'
import type { Restaurant, MenuItem, DiscountInfo } from '@/types'

export const useRestaurantStore = defineStore('restaurant', () => {
  const restaurants = ref<Restaurant[]>([])
  const currentRestaurant = ref<Restaurant | null>(null)
  const menuItems = ref<MenuItem[]>([])
  const discountInfo = ref<DiscountInfo | null>(null)
  const isLoading = ref(false)
  const total = ref(0)

  // 获取商家列表
  const fetchRestaurants = async (params?: {
    keyword?: string
    sort?: 'rating' | 'sales' | 'deliveryTime' | 'deliveryFee'
  }) => {
    isLoading.value = true
    try {
      const response = await getRestaurants(params)
      // 后端返回 { code, message, data: [...], timestamp }
      restaurants.value = response.data.data || []
      total.value = (response.data.data || []).length
    } catch (error) {
      console.error('Search error:', error)
      restaurants.value = []
      total.value = 0
    } finally {
      isLoading.value = false
    }
  }

  // 获取商家详情
  const fetchRestaurantById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getRestaurantById(id)
      currentRestaurant.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取商家菜单
  const fetchMenu = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getRestaurantMenu(id)
      menuItems.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取满减信息
  const fetchDiscountInfo = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getDiscountInfo(id)
      discountInfo.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  return {
    restaurants,
    currentRestaurant,
    menuItems,
    discountInfo,
    isLoading,
    total,
    fetchRestaurants,
    fetchRestaurantById,
    fetchMenu,
    fetchDiscountInfo,
  }
})
