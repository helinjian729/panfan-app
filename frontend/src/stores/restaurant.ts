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
      // 后端直接返回数组
      restaurants.value = response.data
      total.value = response.data.length
    } finally {
      isLoading.value = false
    }
  }

  // 获取商家详情
  const fetchRestaurantById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getRestaurantById(id)
      currentRestaurant.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取商家菜单
  const fetchMenu = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getRestaurantMenu(id)
      menuItems.value = response.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取满减信息
  const fetchDiscountInfo = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getDiscountInfo(id)
      discountInfo.value = response.data
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
