import { defineStore } from 'pinia'
import { ref } from 'vue'
import { createOrder, getOrders, getOrderById, payOrder, cancelOrder } from '@/api/order'
import type { Order, CreateOrderRequest } from '@/types'

export const useOrderStore = defineStore('order', () => {
  const orders = ref<Order[]>([])
  const currentOrder = ref<Order | null>(null)
  const isLoading = ref(false)
  const total = ref(0)

  // 创建订单
  const fetchCreateOrder = async (data: CreateOrderRequest) => {
    isLoading.value = true
    try {
      const response = await createOrder(data)
      currentOrder.value = response.data.data
      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取订单列表
  const fetchOrders = async (params?: { page?: number; pageSize?: number }) => {
    isLoading.value = true
    try {
      const response = await getOrders(params)
      // 后端返回 { code, message, data: [...], timestamp }
      orders.value = response.data.data
      total.value = response.data.data.length
    } finally {
      isLoading.value = false
    }
  }

  // 获取订单详情
  const fetchOrderById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getOrderById(id)
      currentOrder.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 支付订单
  const fetchPayOrder = async (id: string, paymentMethod: 'wechat' | 'alipay') => {
    isLoading.value = true
    try {
      const response = await payOrder(id, { paymentMethod })
      currentOrder.value = response.data.data
      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 取消订单
  const fetchCancelOrder = async (id: string) => {
    isLoading.value = true
    try {
      await cancelOrder(id)
      currentOrder.value = null
    } finally {
      isLoading.value = false
    }
  }

  return {
    orders,
    currentOrder,
    isLoading,
    total,
    fetchCreateOrder,
    fetchOrders,
    fetchOrderById,
    fetchPayOrder,
    fetchCancelOrder,
  }
})
