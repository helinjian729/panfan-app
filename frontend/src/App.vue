<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import Toast from '@/components/Toast.vue'

const authStore = useAuthStore()

onMounted(() => {
  authStore.initUser()
})
</script>

<template>
  <router-view />
  <Toast />
</template>
