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
    PENDING: '招募中',
    SUCCESS: '已满员',
    FAILED: '已失败',
    CANCELLED: '已取消',
  }
  return statusMap[status] || status
}

const getStatusClass = (status: string) => {
  const classMap: Record<string, string> = {
    PENDING: 'status-pending',
    SUCCESS: 'status-success',
    FAILED: 'status-cancelled',
    CANCELLED: 'status-cancelled',
  }
  return classMap[status] || ''
}

const getProgress = (group: any) => {
  if (!group.totalAmount || group.totalAmount == 0) return 0
  return Math.min((Number(group.totalAmount) / Number(group.totalAmount)) * 100, 100)
}
</script>

<template>
  <div class="groups-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="router.push('/home')">←</button>
      <h1 class="header-title">我的拼饭团</h1>
      <button class="header-action" @click="goToJoinGroup">+</button>
    </header>

    <!-- Tab Bar -->
    <div class="tab-section">
      <div class="tab-bar">
        <button
          :class="['tab-item', { active: activeTab === 'created' }]"
          @click="handleTabChange('created')"
        >
          我发起的
        </button>
        <button
          :class="['tab-item', { active: activeTab === 'joined' }]"
          @click="handleTabChange('joined')"
        >
          我加入的
        </button>
      </div>
    </div>

    <!-- Groups List -->
    <div class="groups-list">
      <div
        v-for="(group, index) in activeTab === 'created' ? groupStore.createdGroups : groupStore.joinedGroups"
        :key="group.id"
        class="group-card"
        :style="{ animationDelay: `${index * 50}ms` }"
        @click="goToGroupDetail(group.id)"
      >
        <div class="group-header">
          <div class="group-title-row">
            <h3 class="group-name">{{ group.name }}</h3>
            <span :class="['status-badge', getStatusClass(group.status)]">
              {{ getStatusText(group.status) }}
            </span>
          </div>
          <div class="group-code-row">
            <span class="code-label">邀请码</span>
            <span class="code-value">{{ group.inviteCode }}</span>
          </div>
        </div>

        <div class="group-stats">
          <div class="stat-item">
            <span class="stat-value">¥{{ group.totalAmount }}</span>
            <span class="stat-label">目标金额</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ group.currentCount || 0 }}</span>
            <span class="stat-label">当前人数</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">{{ group.targetCount }}</span>
            <span class="stat-label">目标人数</span>
          </div>
        </div>

        <div class="progress-section">
          <div class="progress-bar">
            <div
              class="progress-fill"
              :style="{ width: '100%' }"
            ></div>
          </div>
        </div>

        <div v-if="group.restaurant" class="group-restaurant">
          <span class="restaurant-icon">🍱</span>
          <span class="restaurant-name">{{ group.restaurant.name }}</span>
        </div>
      </div>

      <div v-if="(activeTab === 'created' ? groupStore.createdGroups : groupStore.joinedGroups).length === 0" class="empty-state">
        <div class="empty-icon">👥</div>
        <div class="empty-title">暂无拼饭团</div>
        <div class="empty-desc">快发起或加入一个拼饭团吧</div>
        <button class="btn btn-primary" @click="goToCreateGroup">发起拼饭团</button>
      </div>

      <div v-if="groupStore.isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="bottom-bar">
      <button class="action-btn create" @click="goToCreateGroup">
        <span class="btn-icon">+</span>
        发起拼饭团
      </button>
      <button class="action-btn join" @click="goToJoinGroup">
        <span class="btn-icon">›</span>
        加入拼饭团
      </button>
    </div>
  </div>
</template>

<style scoped>
.groups-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: 100px;
}

/* Header */
.header {
  display: flex;
  align-items: center;
  padding: var(--space-4) var(--space-5);
  background: var(--bg-secondary);
  border-bottom: 1px solid var(--border-light);
  position: sticky;
  top: 0;
  z-index: 100;
}

.header-back {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--bg-tertiary);
  border: none;
  border-radius: var(--radius-full);
  font-size: 1rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-back:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.header-title {
  flex: 1;
  text-align: center;
  font-size: 1rem;
  font-weight: 600;
}

.header-action {
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  border: none;
  border-radius: var(--radius-full);
  font-size: 1.25rem;
  color: var(--text-inverse);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.header-action:hover {
  background: #5558E3;
  box-shadow: var(--shadow-glow);
}

/* Tab Section */
.tab-section {
  padding: var(--space-4) var(--space-5);
}

.tab-bar {
  display: flex;
  gap: var(--space-2);
  padding: var(--space-2);
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
}

.tab-item {
  flex: 1;
  padding: var(--space-3);
  font-size: 0.875rem;
  font-weight: 500;
  text-align: center;
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.tab-item:hover {
  background: var(--bg-tertiary);
}

.tab-item.active {
  background: var(--color-accent);
  color: var(--text-inverse);
}

/* Groups List */
.groups-list {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

.group-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  animation: fadeIn 0.3s ease-out backwards;
}

.group-card:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.group-card:active {
  transform: scale(0.98);
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group-header {
  margin-bottom: var(--space-4);
}

.group-title-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-2);
}

.group-name {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.status-badge {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-2);
  font-size: 0.75rem;
  font-weight: 500;
  border-radius: var(--radius-full);
}

.status-pending {
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
}

.status-success {
  background: rgba(34, 197, 94, 0.1);
  color: var(--color-success);
}

.status-cancelled {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.group-code-row {
  display: flex;
  align-items: center;
  gap: var(--space-2);
}

.code-label {
  font-size: 0.75rem;
  color: var(--text-tertiary);
}

.code-value {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--color-accent);
  background: rgba(99, 102, 241, 0.1);
  padding: var(--space-1) var(--space-2);
  border-radius: var(--radius-sm);
}

/* Group Stats */
.group-stats {
  display: flex;
  gap: var(--space-4);
  margin-bottom: var(--space-4);
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: var(--space-3);
  background: var(--bg-primary);
  border-radius: var(--radius-md);
}

.stat-value {
  display: block;
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--text-primary);
  margin-bottom: var(--space-1);
}

.stat-label {
  font-size: 0.625rem;
  color: var(--text-tertiary);
  text-transform: uppercase;
}

/* Progress Section */
.progress-section {
  margin-bottom: var(--space-3);
}

.progress-bar {
  height: 6px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, var(--color-accent), #818CF8);
  border-radius: var(--radius-full);
  transition: width var(--transition-slow);
}

/* Group Restaurant */
.group-restaurant {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.restaurant-icon {
  font-size: 0.875rem;
}

/* Empty State */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) 0;
  text-align: center;
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: var(--space-4);
  opacity: 0.5;
}

.empty-title {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: var(--space-2);
}

.empty-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-6);
}

/* Loading State */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: var(--space-12) 0;
  gap: var(--space-3);
  color: var(--text-secondary);
  font-size: 0.875rem;
}

.loading-spinner {
  width: 24px;
  height: 24px;
  border: 2px solid var(--border-light);
  border-top-color: var(--color-accent);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Bottom Bar */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  gap: var(--space-3);
  padding: var(--space-4) var(--space-5);
  padding-bottom: calc(var(--space-4) + env(safe-area-inset-bottom));
  background: var(--bg-secondary);
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.08);
  z-index: 100;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-2);
  padding: var(--space-4);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.create {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-btn.create:hover {
  background: #5558E3;
  box-shadow: var(--shadow-glow);
}

.action-btn.join {
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.action-btn.join:hover {
  background: var(--border-light);
}

.btn-icon {
  font-size: 1rem;
}
</style>