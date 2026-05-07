import { api } from './request'
import type { Order, CreateOrderRequest } from '@/types'

// 创建订单
export const createOrder = (data: CreateOrderRequest) => {
  return api.post<{ data: Order }>('/orders', data)
}

// 获取订单列表
export const getOrders = (params?: { page?: number; pageSize?: number }) => {
  return api.get<{ data: { items: Order[]; total: number } }>('/orders', { params })
}

// 获取订单详情
export const getOrderById = (id: string) => {
  return api.get<{ data: Order }>(`/orders/${id}`)
}

// 支付订单
export const payOrder = (id: string, data: { paymentMethod: 'wechat' | 'alipay' }) => {
  return api.post<{ data: Order }>(`/orders/${id}/pay`, data)
}

// 取消订单
export const cancelOrder = (id: string) => {
  return api.post<{ data: void }>(`/orders/${id}/cancel`)
}
