import { api } from './request'
import type { Restaurant, MenuItem, DiscountInfo } from '@/types'

// 获取商家列表
export const getRestaurants = (params?: {
  keyword?: string
  sort?: 'rating' | 'sales' | 'deliveryTime' | 'deliveryFee'
}) => {
  // 后端返回 { code, message, data: Restaurant[], timestamp }
  return api.get<Restaurant[]>('/restaurants', { params })
}

// 获取商家详情
export const getRestaurantById = (id: string) => {
  return api.get<Restaurant>(`/restaurants/${id}`)
}

// 获取商家菜单
export const getRestaurantMenu = (id: string) => {
  return api.get<MenuItem[]>(`/restaurants/${id}/menu`)
}

// 获取商家满减信息
export const getDiscountInfo = (id: string) => {
  return api.get<DiscountInfo>(`/restaurants/${id}/discount-info`)
}
