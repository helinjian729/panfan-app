import { api } from './request'
import type { Order, CreateOrderRequest } from '@/types'

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return api.post<Order>('/orders', data)
}

// 获取订单列表
export const getOrders = (params?: { page?: number; pageSize?: number }) => {
  // 后端返回 { code, message, data: Order[], timestamp }
  return api.get<Order[]>('/orders', { params })
}

// 获取订单详情
export const getOrderById = (id: string) => {
  return api.get<Order>(`/orders/${id}`)
}

// 支付订单
export const payOrder = (id: string, data: { paymentMethod?: 'wechat' | 'alipay' }) => {
  return api.post<Order>(`/orders/${id}/pay`, { payMethod: data.paymentMethod })
}

// 取消订单
export const cancelOrder = (id: string) => {
  return api.post<void>(`/orders/${id}/cancel`)
}
