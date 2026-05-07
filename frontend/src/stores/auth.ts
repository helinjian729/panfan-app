import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { sendCode, login } from '@/api/auth'
import { TokenManager } from '@/api/request'
import type { User, SendCodeRequest, LoginRequest } from '@/types'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const isLoggedIn = computed(() => !!user.value || TokenManager.isLoggedIn())
  const isLoading = ref(false)
  const codeCooldown = ref(0)
  let codeTimer: ReturnType<typeof setInterval> | null = null

  // 初始化用户信息
  const initUser = () => {
    const userInfo = localStorage.getItem('userInfo')
    if (userInfo) {
      user.value = JSON.parse(userInfo)
    }
  }

  // 发送验证码
  const sendVerifyCode = async (phone: string) => {
    const data: SendCodeRequest = { phone }
    await sendCode(data)
  }

  // 开始验证码倒计时
  const startCodeCooldown = (seconds: number = 60) => {
    codeCooldown.value = seconds
    if (codeTimer) clearInterval(codeTimer)
    codeTimer = setInterval(() => {
      codeCooldown.value--
      if (codeCooldown.value <= 0) {
        if (codeTimer) clearInterval(codeTimer)
      }
    }, 1000)
  }

  // 用户登录
  const loginUser = async (phone: string, code: string) => {
    isLoading.value = true
    try {
      const data: LoginRequest = { phone, code }
      const response = await login(data)
      const { token, refreshToken, user: userData } = response.data.data

      TokenManager.setToken(token, refreshToken)
      user.value = userData
      localStorage.setItem('userInfo', JSON.stringify(userData))

      return response.data.data
    } finally {
      isLoading.value = false
    }
  }

  // 登出
  const logout = () => {
    TokenManager.clearToken()
    user.value = null
    localStorage.removeItem('userInfo')
  }

  return {
    user,
    isLoggedIn,
    isLoading,
    codeCooldown,
    initUser,
    sendVerifyCode,
    startCodeCooldown,
    loginUser,
    logout,
  }
})
