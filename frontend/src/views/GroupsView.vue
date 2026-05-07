<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group'

const router = useRouter()
const groupStore = useGroupStore()

const activeTab = ref<'created' | 'joined'>('created')

onMounted(() => {
  loadGroups()
})

const loadGroups = async () => {
  await groupStore.fetchGroups(activeTab.value)
}

const handleTabChange = async (tab: 'created' | 'joined') => {
  activeTab.value = tab
  await loadGroups()
}

const goToGroupDetail = (groupId: string) => {
  router.push(`/group/${groupId}`)
}

const goToCreateGroup = () => {
  router.push('/group/create')
}

const goToJoinGroup = () => {
  router.push('/group/join')
}

const getStatusText = (status: string) => {
  const statusMap: Record<string, string> = {
    pending: '招募中',
    full: '已满员',
    completed: '已完成',
    cancelled: '已取消',
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    pending: 'status-pending',
    full: 'status-full',
    completed: 'status-completed',
    cancelled: 'status-cancelled',
  }
  return classMap[status] || ''
}
</script>

<template>
  <div class="groups-page">
    <header class="header">
      <button class="back-btn" @click="router.push('/home')">←</button>
      <h1 class="title">我的拼饭团</h1>
      <button class="add-btn" @click="goToJoinGroup">+加入</button>
    </header>

    <!-- 标签切换 -->
    <div class="tab-bar">
      <button
        :class="['tab-btn', { active: activeTab === 'created' }]"
        @click="handleTabChange('created')"
      >
        我发起的
      </button>
      <button
        :class="['tab-btn', { active: activeTab === 'joined' }]"
        @click="handleTabChange('joined')"
      >
        我加入的
      </button>
    </div>

    <!-- 拼饭团列表 -->
    <div class="groups-list">
      <div
        v-for="group in activeTab === 'created' ? groupStore.createdGroups : groupStore.joinedGroups"
        :key="group.id"
        class="group-card"
        @click="goToGroupDetail(group.id)"
      >
        <div class="group-header">
          <h3 class="group-name">{{ group.name }}</h3>
          <span :class="['status', getStatusClass(group.status)]">
            {{ getStatusText(group.status) }}
          </span>
        </div>
        <div class="group-info">
          <div class="info-item">
            <span class="label">目标金额</span>
            <span class="value">¥{{ group.targetAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">当前金额</span>
            <span class="value">¥{{ group.currentAmount }}</span>
          </div>
          <div class="info-item">
            <span class="label">成员</span>
            <span class="value">{{ group.memberCount }}/{{ group.maxMembers }}</span>
          </div>
        </div>
        <div class="progress-bar">
          <div
            class="progress-fill"
            :style="{ width: `${(group.currentAmount / group.targetAmount) * 100}%` }"
          ></div>
        </div>
        <div class="invite-code">
          邀请码: <span class="code">{{ group.inviteCode }}</span>
        </div>
      </div>

      <div v-if="(activeTab === 'created' ? groupStore.createdGroups : groupStore.joinedGroups).length === 0" class="empty-state">
        <span class="empty-icon">👥</span>
        <p>暂无拼饭团</p>
        <button class="create-btn" @click="goToCreateGroup">发起拼饭团</button>
      </div>
    </div>

    <!-- 底部操作栏 -->
    <div class="bottom-bar">
      <button class="action-btn create" @click="goToCreateGroup">发起新拼饭团</button>
      <button class="action-btn join" @click="goToJoinGroup">加入拼饭团</button>
    </div>
  </div>
</template>

<style scoped>
.groups-page {
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

.add-btn {
  width: 32px;
  height: 32px;
  background: #FF6B35;
  color: #fff;
  border: none;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
}

.tab-bar {
  display: flex;
  padding: 12px 16px;
  background: #fff;
  gap: 16px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  background: #f5f5f5;
  color: #666;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
}

.tab-btn.active {
  background: #FF6B35;
  color: #fff;
}

.groups-list {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: transform 0.2s;
}

.group-card:active {
  transform: scale(0.98);
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.group-name {
  font-size: 15px;
  font-weight: 500;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}

.status-pending {
  background: #E3F2FD;
  color: #2196F3;
}

.status-full {
  background: #FFF3E0;
  color: #FF9800;
}

.status-completed {
  background: #E8F5E9;
  color: #4CAF50;
}

.status-cancelled {
  background: #FFEBEE;
  color: #F44336;
}

.group-info {
  display: flex;
  gap: 16px;
  margin-bottom: 12px;
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
  font-size: 14px;
  color: #333;
}

.progress-bar {
  height: 6px;
  background: #f5f5f5;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 12px;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #FF6B35 0%, #FF8F6B 100%);
  border-radius: 3px;
  transition: width 0.3s;
}

.invite-code {
  font-size: 12px;
  color: #666;
}

.code {
  color: #FF6B35;
  font-weight: 500;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 0;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-state p {
  color: #999;
  margin-bottom: 24px;
}

.create-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 24px;
  font-size: 14px;
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

.action-btn.create {
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
}

.action-btn.join {
  background: #FFF3EF;
  color: #FF6B35;
}
</style>
