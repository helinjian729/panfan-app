<script setup lang="ts">
import { onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group'
import { useAuthStore } from '@/stores/auth'

const route = useRoute()
const router = useRouter()
const groupStore = useGroupStore()
const authStore = useAuthStore()

const groupId = route.params.id as string
const isCreator = computed(() => groupStore.currentGroup?.creatorId === authStore.user?.id)

onMounted(async () => {
  await Promise.all([
    groupStore.fetchGroupById(groupId),
    groupStore.fetchGroupItems(groupId),
    groupStore.fetchCalculate(groupId),
  ])
})

const goBack = () => {
  router.push('/groups')
}

const handleLeaveGroup = async () => {
  if (confirm('确定要退出这个拼饭团吗？')) {
    await groupStore.fetchLeaveGroup(groupId)
    router.push('/groups')
  }
}

const handleCancelGroup = async () => {
  if (confirm('确定要取消这个拼饭团吗？')) {
    await groupStore.fetchCancelGroup(groupId)
    router.push('/groups')
  }
}

const handleDeleteItem = async (itemId: string) => {
  if (confirm('确定要删除这个菜品吗？')) {
    await groupStore.fetchDeleteGroupItem(groupId, itemId)
    await Promise.all([
      groupStore.fetchGroupItems(groupId),
      groupStore.fetchCalculate(groupId),
    ])
  }
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    PENDING: '招募中',
    SUCCESS: '已满员',
    FAILED: '已失败',
    CANCELLED: '已取消',
  }
  return statusMap[status] || status
}

const getProgress = computed(() => {
  const group = groupStore.currentGroup
  if (!group) return 0
  const target = Number(group.totalAmount) || 0
  if (target === 0) return 0
  return Math.min((Number(group.totalAmount) / target) * 100, 100)
})
</script>

<template>
  <div class="group-detail-page">
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">拼饭团详情</h1>
      <div class="header-spacer"></div>
    </header>

    <div v-if="groupStore.currentGroup" class="group-content">
      <!-- 拼饭团状态 -->
      <div class="status-card">
        <div class="status-header">
          <h2 class="group-name">{{ groupStore.currentGroup.name }}</h2>
          <span class="status-badge">{{ getStatusText(groupStore.currentGroup.status) }}</span>
        </div>
        <div class="status-info">
          <div class="info-item">
            <span class="label">目标金额</span>
            <span class="value">¥{{ groupStore.currentGroup.totalAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前金额</span>
            <span class="value highlight">¥{{ groupStore.calculateInfo?.currentAmount || 0 }}</span>
          </div>
          <div class="info-item">
            <span class="label">成员</span>
            <span class="value">{{ groupStore.currentGroup.currentCount || 0 }}/{{ groupStore.currentGroup.targetCount }}</span>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: `${groupStore.calculateInfo?.progress || 0}%` }"
            ></div>
          </div>
          <span class="progress-text">
            {{ (groupStore.calculateInfo?.progress || 0).toFixed(0) }}%
          </span>
        </div>
        <div class="invite-code">
          邀请码: <span class="code">{{ groupStore.currentGroup.inviteCode }}</span>
        </div>
      </div>

      <!-- 凑单计算 -->
      <div v-if="groupStore.calculateInfo" class="calculate-card">
        <h3 class="card-title">费用明细</h3>
        <div class="calculate-row">
          <span>商品金额</span>
          <span>¥{{ groupStore.calculateInfo.currentAmount }}</span>
        </div>
        <div class="calculate-row discount">
          <span>满减优惠</span>
          <span>-¥{{ groupStore.calculateInfo.discountAmount }}</span>
        </div>
        <div class="calculate-row">
          <span>配送费</span>
          <span>¥{{ groupStore.calculateInfo.deliveryFee }}</span>
        </div>
        <div class="calculate-row total">
          <span>合计</span>
          <span>¥{{ groupStore.calculateInfo.finalAmount }}</span>
        </div>
      </div>

      <!-- 菜品清单 -->
      <div class="items-card">
        <h3 class="card-title">已选菜品</h3>
        <div class="items-list">
          <div
            v-for="item in groupStore.groupItems"
            :key="item.id"
            class="item-row"
          >
            <div class="item-info">
              <span class="item-name">{{ item.menuItem?.name || '未知菜品' }}</span>
              <span class="item-qty">x{{ item.quantity }}</span>
            </div>
            <span class="item-price">¥{{ (item.menuItem?.price || 0) * item.quantity }}</span>
            <button
              v-if="item.userId === authStore.user?.id"
              class="delete-btn"
              @click="handleDeleteItem(item.id)"
            >
              删除
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <template v-if="isCreator">
        <button class="action-btn cancel" @click="handleCancelGroup">取消拼饭团</button>
        <button class="action-btn checkout" @click="router.push('/order/confirm')">去结算</button>
      </template>
      <template v-else>
        <button class="action-btn leave" @click="handleLeaveGroup">退出拼饭团</button>
      </template>
    </div>
  </div>
</template>

<style scoped>
.group-detail-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 80px;
}

.header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background: #fff;
  position: sticky;
  top: 0;
  z-index: 100;
}

.back-btn {
  width: 32px;
  height: 32px;
  background: #f5f5f5;
  border: none;
  border-radius: 50%;
  font-size: 18px;
  cursor: pointer;
}

.title {
  flex: 1;
  text-align: center;
  font-size: 16px;
  font-weight: 500;
}

.header-spacer {
  width: 32px;
}

.group-content {
  padding: 16px;
}

.status-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.status-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.group-name {
  font-size: 16px;
  font-weight: 500;
}

.status-badge {
  padding: 4px 12px;
  background: #E3F2FD;
  color: #2196F3;
  border-radius: 12px;
  font-size: 12px;
}

.status-info {
  display: flex;
  gap: 16px;
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  flex-direction: column;
}

.label {
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
}

.value {
  font-size: 16px;
  font-weight: 500;
}

.value.highlight {
  color: #FF6B35;
}

.progress-section {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.progress-bar {
  flex: 1;
  height: 8px;
  background: #f5f5f5;
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8F6B 100%);
  border-radius: 4px;
  transition: width 0.3s;
}

.progress-text {
  font-size: 14px;
  color: #FF6B35;
  font-weight: 500;
}

.invite-code {
  font-size: 14px;
  color: #666;
}

.code {
  color: #FF6B35;
  font-weight: 600;
}

.calculate-card,
.items-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.card-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.calculate-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  font-size: 14px;
  color: #666;
}

.calculate-row.discount {
  color: #4CAF50;
}

.calculate-row.total {
  border-top: 1px solid #eee;
  margin-top: 8px;
  padding-top: 16px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.items-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.item-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #f5f5f5;
}

.item-row:last-child {
  border-bottom: none;
}

.item-info {
  flex: 1;
  display: flex;
  justify-content: space-between;
}

.item-name {
  font-size: 14px;
}

.item-qty {
  font-size: 12px;
  color: #999;
}

.item-price {
  font-size: 14px;
  color: #FF6B35;
}

.delete-btn {
  padding: 4px 12px;
  background: #FFEBEE;
  color: #F44336;
  border: none;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  padding-bottom: calc(12px + env(safe-area-inset-bottom));
  background: #fff;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
  z-index: 100;
}

.action-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
}

.action-btn.cancel {
  background: #FFEBEE;
  color: #F44336;
}

.action-btn.checkout,
.action-btn.leave {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
}
</style>
