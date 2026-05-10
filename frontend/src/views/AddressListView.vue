<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAddresses, deleteAddress, setDefaultAddress } from '@/api/address'
import type { Address } from '@/api/address'

const router = useRouter()
const addresses = ref<Address[]>([])
const isLoading = ref(false)

const loadAddresses = async () => {
  isLoading.value = true
  try {
    const response = await getAddresses()
    addresses.value = response.data.data || []
  } catch (error) {
    console.error('Failed to load addresses:', error)
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  loadAddresses()
})

const goBack = () => {
  router.back()
}

const goToEdit = (id?: string) => {
  if (id) {
    router.push(`/address/edit/${id}`)
  } else {
    router.push('/address/edit')
  }
}

const handleSetDefault = async (id: string) => {
  try {
    await setDefaultAddress(id)
    await loadAddresses()
  } catch (error) {
    console.error('Failed to set default:', error)
  }
}

const handleDelete = async (id: string) => {
  if (confirm('确定要删除此地址吗？')) {
    try {
      await deleteAddress(id)
      await loadAddresses()
    } catch (error) {
      console.error('Failed to delete:', error)
    }
  }
}

const formatAddress = (addr: Address) => {
  return `${addr.province} ${addr.city} ${addr.district} ${addr.detail}`
}
</script>

<template>
  <div class="address-list-page">
    <!-- Header -->
    <header class="header">
      <button class="header-back" @click="goBack">←</button>
      <h1 class="header-title">收货地址</h1>
      <button class="header-add" @click="goToEdit()">+</button>
    </header>

    <!-- Address List -->
    <div class="address-list">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <span>加载中...</span>
      </div>

      <div v-else-if="addresses.length === 0" class="empty-state">
        <div class="empty-icon">📍</div>
        <div class="empty-title">暂无收货地址</div>
        <div class="empty-desc">点击右上角添加收货地址</div>
      </div>

      <div
        v-else
        v-for="addr in addresses"
        :key="addr.id"
        class="address-card"
        @click="goToEdit(addr.id)"
      >
        <div class="address-main">
          <div class="address-header">
            <span class="receiver">{{ addr.receiver }}</span>
            <span class="phone">{{ addr.phone }}</span>
            <span v-if="addr.tag" class="tag">{{ addr.tag }}</span>
            <span v-if="addr.isDefault" class="default-badge">默认</span>
          </div>
          <p class="address-detail">{{ formatAddress(addr) }}</p>
        </div>
        <div class="address-actions" @click.stop>
          <button
            v-if="!addr.isDefault"
            class="action-btn default"
            @click="handleSetDefault(addr.id)"
          >
           设为默认
          </button>
          <button class="action-btn delete" @click="handleDelete(addr.id)">
            删除
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.address-list-page {
  min-height: 100vh;
  min-height: 100dvh;
  background: var(--bg-primary);
  padding-bottom: var(--space-6);
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

.header-add {
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

.header-add:hover {
  background: #5558E3;
}

/* Address List */
.address-list {
  padding: var(--space-4) var(--space-5);
  display: flex;
  flex-direction: column;
  gap: var(--space-4);
}

/* Address Card */
.address-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-xl);
  padding: var(--space-5);
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.address-card:hover {
  box-shadow: var(--shadow-md);
}

.address-main {
  margin-bottom: var(--space-3);
}

.address-header {
  display: flex;
  align-items: center;
  gap: var(--space-2);
  margin-bottom: var(--space-2);
}

.receiver {
  font-size: 1rem;
  font-weight: 600;
  color: var(--text-primary);
}

.phone {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.tag {
  font-size: 0.625rem;
  padding: var(--space-1) var(--space-2);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
}

.default-badge {
  font-size: 0.625rem;
  padding: var(--space-1) var(--space-2);
  background: rgba(99, 102, 241, 0.1);
  color: var(--color-accent);
  border-radius: var(--radius-sm);
}

.address-detail {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.address-actions {
  display: flex;
  gap: var(--space-2);
  padding-top: var(--space-3);
  border-top: 1px solid var(--border-light);
}

.action-btn {
  padding: var(--space-2) var(--space-3);
  font-size: 0.75rem;
  font-weight: 500;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.action-btn.default {
  background: var(--bg-tertiary);
  color: var(--text-secondary);
}

.action-btn.default:hover {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.action-btn.delete {
  background: rgba(239, 68, 68, 0.1);
  color: var(--color-error);
}

.action-btn.delete:hover {
  background: var(--color-error);
  color: var(--text-inverse);
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

.btn {
  padding: var(--space-3) var(--space-6);
  border: none;
  border-radius: var(--radius-lg);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.btn-primary {
  background: var(--color-accent);
  color: var(--text-inverse);
}

.btn-primary:hover {
  background: #5558E3;
}
</style>