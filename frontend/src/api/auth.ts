import { api } from './request'
import type {
  SendCodeRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenResponse,
} from '@/types'

// 发送验证码
export const sendCode = (data: SendCodeRequest) => {
  return api.post('/auth/send-code', data)
}

// 用户登录
export const login = (data: LoginRequest) => {
  return api.post<{ data: LoginResponse }>('/auth/login', data)
}

// 刷新 Token
export const refreshToken = (refreshToken: string) => {
  return api.post<{ data: RefreshTokenResponse }>('/auth/refresh', {
    refreshToken,
  })
}
