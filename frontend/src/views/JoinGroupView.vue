<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useGroupStore } from '@/stores/group'

const router = useRouter()
const groupStore = useGroupStore()

const inviteCode = ref('')
const isJoining = ref(false)

onMounted(() => {
  groupStore.fetchNearbyGroups()
})

const handleJoinGroup = async () => {
  if (!inviteCode.value.trim()) {
    return
  }

  isJoining.value = true
  try {
    await groupStore.fetchJoinGroup({ inviteCode: inviteCode.value.trim() })
    router.push('/groups')
  } catch (error) {
    console.error('加入拼饭团失败:', error)
  } finally {
    isJoining.value = false
  }
}

const goToNearbyGroup = (groupId: string) => {
  router.push(`/group/${groupId}`)
}

const goBack = () => {
  router.push('/groups')
}
</script>

<template>
  <div class="join-group-page">
    <header class="header">
      <button class="back-btn" @click="goBack">←</button>
      <h1 class="title">加入拼饭团</h1>
      <div class="header-spacer"></div>
    </header>

    <div class="content">
      <!-- 邀请码加入 -->
      <div class="invite-section">
        <h3 class="section-title">输入邀请码</h3>
        <div class="invite-form">
          <input
            v-model="inviteCode"
            type="text"
            placeholder="请输入6位邀请码"
            maxlength="6"
          />
          <button
            class="join-btn"
            :disabled="!inviteCode.trim() || isJoining"
            @click="handleJoinGroup"
          >
            {{ isJoining ? '加入中...' : '加入' }}
          </button>
        </div>
      </div>

      <!-- 附近可加入的拼饭团 -->
      <div class="nearby-section">
        <h3 class="section-title">附近可加入</h3>
        <div class="groups-list">
          <div
            v-for="group in groupStore.nearbyGroups"
            :key="group.id"
            class="group-card"
            @click="goToNearbyGroup(group.id)"
          >
            <div class="group-info">
              <h4 class="group-name">{{ group.name }}</h4>
              <div class="group-meta">
                <span>¥{{ group.currentAmount }}/{{ group.targetAmount }}</span>
                <span>{{ group.memberCount }}/{{ group.maxMembers }}人</span>
              </div>
            </div>
            <span class="invite-code">码: {{ group.inviteCode }}</span>
          </div>

          <div v-if="groupStore.nearbyGroups.length === 0" class="empty-state">
            <p>附近暂无可加入的拼饭团</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.join-group-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: #FFF9F5;
  padding-bottom: 24px;
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

.content {
  padding: 16px;
}

.invite-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 16px;
}

.section-title {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 12px;
  color: #333;
}

.invite-form {
  display: flex;
  gap: 12px;
}

.invite-form input {
  flex: 1;
  height: 48px;
  border: 1px solid #eee;
  border-radius: 8px;
  padding: 0 16px;
  font-size: 16px;
  letter-spacing: 4px;
  text-align: center;
}

.invite-form input:focus {
  outline: none;
  border-color: #FF6B35;
}

.join-btn {
  width: 80px;
  height: 48px;
  background: linear-gradient(135deg, #FF6B35 0%, #FF8F6B 100%);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.join-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.nearby-section {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
}

.groups-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.group-card {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  cursor: pointer;
  transition: background 0.2s;
}

.group-card:hover {
  background: #f0f0f0;
}

.group-name {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 4px;
}

.group-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #666;
}

.invite-code {
  font-size: 12px;
  color: #FF6B35;
}

.empty-state {
  text-align: center;
  padding: 24px;
  color: #999;
}
</style>
