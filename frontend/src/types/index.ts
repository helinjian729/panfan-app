// 用户相关类型
export interface User {
  id: string
  phone: string
  nickname?: string
  avatar?: string
  createdAt: string
}

// 认证相关类型
export interface SendCodeRequest {
  phone: string
}

export interface LoginRequest {
  phone: string
  code: string
}

export interface LoginResponse {
  token: string
  refreshToken: string
  user: User
}

export interface RefreshTokenResponse {
  token: string
  refreshToken: string
}

// 商家相关类型
export interface Restaurant {
  id: string
  name: string
  address: string
  phone: string
  rating: number
  sales: number
  deliveryTime: string
  deliveryFee: number
  minimumOrder: number
  logo?: string
  banner?: string
  discounts?: Discount[]
}

export interface Discount {
  id: string
  description: string
  threshold: number
  reduction: number
}

export interface MenuItem {
  id: string
  restaurantId: string
  name: string
  description?: string
  price: number
  image?: string
  category: string
  sales: number
}

export interface DiscountInfo {
  restaurantId: string
  discounts: Discount[]
  groupDiscounts?: GroupDiscount[]
}

export interface GroupDiscount {
  id: string
  description: string
  threshold: number
  reduction: number
  currentCount: number
  targetCount: number
}

// 拼饭团相关类型
export interface Group {
  id: string
  restaurantId: string
  restaurant?: Restaurant
  creatorId: string
  creator?: User
  name: string
  inviteCode: string
  status: 'pending' | 'full' | 'completed' | 'cancelled'
  currentAmount: number
  targetAmount: number
  memberCount: number
  maxMembers: number
  deadline: string
  createdAt: string
}

export interface GroupMember {
  id: string
  groupId: string
  userId: string
  user?: User
  role: 'creator' | 'member'
  joinedAt: string
}

export interface GroupItem {
  id: string
  groupId: string
  userId: string
  user?: User
  menuItemId: string
  menuItem?: MenuItem
  quantity: number
  note?: string
  createdAt: string
}

export interface GroupCalculate {
  groupId: string
  currentAmount: number
  targetAmount: number
  discountAmount: number
  deliveryFee: number
  finalAmount: number
  progress: number
}

export interface CreateGroupRequest {
  restaurantId: string
  name: string
  targetAmount: number
  maxMembers: number
  deadline: string
}

export interface JoinGroupRequest {
  inviteCode: string
}

// 订单相关类型
export interface Order {
  id: string
  groupId: string
  group?: Group
  userId: string
  user?: User
  restaurantId: string
  restaurant?: Restaurant
  totalAmount: number
  discountAmount: number
  deliveryFee: number
  finalAmount: number
  status: 'pending' | 'paid' | 'completed' | 'cancelled' | 'refunded'
  paymentMethod?: 'wechat' | 'alipay'
  paidAt?: string
  createdAt: string
}

export interface CreateOrderRequest {
  groupId: string
  paymentMethod: 'wechat' | 'alipay'
}

// API 响应类型
export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

// 购物车类型
export interface CartItem {
  id: string
  menuItem: MenuItem
  quantity: number
  note?: string
}
