import axios, { AxiosError, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import router from '@/router'

const BASE_URL = 'http://localhost:3000/api/v1'

// 创建 Axios 实例
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Token 管理
const TokenManager = {
  getToken: () => localStorage.getItem('token'),
  getRefreshToken: () => localStorage.getItem('refreshToken'),
  setToken: (token: string, refreshToken: string) => {
    localStorage.setItem('token', token)
    localStorage.setItem('refreshToken', refreshToken)
  },
  clearToken: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('refreshToken')
  },
  isLoggedIn: () => !!localStorage.getItem('token'),
}

// 请求拦截器
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = TokenManager.getToken()
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error: AxiosError) => {
    return Promise.reject(error)
  }
)

// 响应拦截器
api.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean }

    // 处理 401 错误，尝试刷新 Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      const refreshToken = TokenManager.getRefreshToken()
      if (refreshToken) {
        try {
          const response = await axios.post(`${BASE_URL}/auth/refresh`, {
            refreshToken,
          })
          const { token, refreshToken: newRefreshToken } = response.data.data

          TokenManager.setToken(token, newRefreshToken)

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${token}`
          }
          return api(originalRequest)
        } catch (refreshError) {
          TokenManager.clearToken()
          router.push('/login')
          return Promise.reject(refreshError)
        }
      } else {
        router.push('/login')
      }
    }

    // 处理其他错误
    if (error.response?.status === 403) {
      router.push('/login')
    }

    return Promise.reject(error)
  }
)

export { api, TokenManager, BASE_URL }
export default api
