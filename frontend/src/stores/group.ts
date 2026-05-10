import { defineStore } from 'pinia'
import { ref } from 'vue'
import {
  createGroup,
  getGroups,
  getNearbyGroups,
  getGroupById,
  joinGroup,
  cancelGroup,
  leaveGroup,
  getGroupItems,
  addGroupItem,
  deleteGroupItem,
  calculateGroup,
} from '@/api/group'
import type { Group, GroupItem, GroupCalculate, CreateGroupRequest, JoinGroupRequest } from '@/types'

export const useGroupStore = defineStore('group', () => {
  const createdGroups = ref<Group[]>([])
  const joinedGroups = ref<Group[]>([])
  const nearbyGroups = ref<Group[]>([])
  const currentGroup = ref<Group | null>(null)
  const groupItems = ref<GroupItem[]>([])
  const calculateInfo = ref<GroupCalculate | null>(null)
  const isLoading = ref(false)
  const total = ref(0)

  // 创建拼饭团
  const fetchCreateGroup = async (data: CreateGroupRequest) => {
    isLoading.value = true
    try {
      const response = await createGroup(data)
      currentGroup.value = response.data.data
      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取我发起的/加入的拼饭团
  const fetchGroups = async (type: 'created' | 'joined') => {
    isLoading.value = true
    try {
      const response = await getGroups({ type })
      // 后端返回 { code, message, data: [...], timestamp }
      if (type === 'created') {
        createdGroups.value = response.data.data
      } else {
        joinedGroups.value = response.data.data
      }
      total.value = response.data.data.length
    } finally {
      isLoading.value = false
    }
  }

  // 获取附近可加入的拼饭团
  const fetchNearbyGroups = async () => {
    isLoading.value = true
    try {
      const response = await getNearbyGroups()
      nearbyGroups.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 获取拼饭团详情
  const fetchGroupById = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getGroupById(id)
      currentGroup.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 加入拼饭团
  const fetchJoinGroup = async (data: JoinGroupRequest) => {
    isLoading.value = true
    try {
      const response = await joinGroup(data)
      currentGroup.value = response.data.data
      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 取消拼饭团
  const fetchCancelGroup = async (id: string) => {
    isLoading.value = true
    try {
      await cancelGroup(id)
      currentGroup.value = null
    } finally {
      isLoading.value = false
    }
  }

  // 退出拼饭团
  const fetchLeaveGroup = async (id: string) => {
    isLoading.value = true
    try {
      await leaveGroup(id)
      currentGroup.value = null
    } finally {
      isLoading.value = false
    }
  }

  // 获取拼饭团菜品
  const fetchGroupItems = async (id: string) => {
    isLoading.value = true
    try {
      const response = await getGroupItems(id)
      groupItems.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 添加菜品到拼饭团
  const fetchAddGroupItem = async (id: string, data: { menuItemId: string; quantity: number; note?: string }) => {
    isLoading.value = true
    try {
      const response = await addGroupItem(id, data)
      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 删除拼饭团菜品
  const fetchDeleteGroupItem = async (id: string, itemId: string) => {
    isLoading.value = true
    try {
      await deleteGroupItem(id, itemId)
    } finally {
      isLoading.value = false
    }
  }

  // 计算凑单进度
  const fetchCalculate = async (id: string) => {
    isLoading.value = true
    try {
      const response = await calculateGroup(id)
      calculateInfo.value = response.data.data
    } finally {
      isLoading.value = false
    }
  }

  return {
    createdGroups,
    joinedGroups,
    nearbyGroups,
    currentGroup,
    groupItems,
    calculateInfo,
    isLoading,
    total,
    fetchCreateGroup,
    fetchGroups,
    fetchNearbyGroups,
    fetchGroupById,
    fetchJoinGroup,
    fetchCancelGroup,
    fetchLeaveGroup,
    fetchGroupItems,
    fetchAddGroupItem,
    fetchDeleteGroupItem,
    fetchCalculate,
  }
})
