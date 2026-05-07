import { api } from './request'
import type {
  Group,
  GroupItem,
  GroupCalculate,
  CreateGroupRequest,
  JoinGroupRequest,
} from '@/types'

// 发起拼饭团
export const createGroup = (data: CreateGroupRequest) => {
  return api.post<{ data: Group }>('/groups', data)
}

// 获取拼饭团列表
export const getGroups = (params?: { type?: 'created' | 'joined' }) => {
  return api.get<{ data: { items: Group[]; total: number } }>('/groups', { params })
}

// 获取附近可加入的拼饭团
export const getNearbyGroups = () => {
  return api.get<{ data: Group[] }>('/groups/nearby')
}

// 获取拼饭团详情
export const getGroupById = (id: string) => {
  return api.get<{ data: Group }>(`/groups/${id}`)
}

// 加入拼饭团
export const joinGroup = (data: JoinGroupRequest) => {
  return api.post<{ data: Group }>('/groups/join', data)
}

// 取消拼饭团（仅发起人）
export const cancelGroup = (id: string) => {
  return api.post<{ data: void }>(`/groups/${id}/cancel`)
}

// 退出拼饭团（成员）
export const leaveGroup = (id: string) => {
  return api.post<{ data: void }>(`/groups/${id}/leave`)
}

// 获取拼饭团菜品清单
export const getGroupItems = (id: string) => {
  return api.get<{ data: GroupItem[] }>(`/groups/${id}/items`)
}

// 添加菜品到拼饭团
export const addGroupItem = (id: string, data: { menuItemId: string; quantity: number; note?: string }) => {
  return api.post<{ data: GroupItem }>(`/groups/${id}/items`, data)
}

// 删除拼饭团菜品
export const deleteGroupItem = (id: string, itemId: string) => {
  return api.delete<{ data: void }>(`/groups/${id}/items/${itemId}`)
}

// 计算凑单进度
export const calculateGroup = (id: string) => {
  return api.get<{ data: GroupCalculate }>(`/groups/${id}/calculate`)
}
