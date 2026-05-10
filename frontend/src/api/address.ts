import { api } from './request'

export interface Address {
  id: string
  receiver: string
  phone: string
  province: string
  city: string
  district: string
  detail: string
  tag?: string
  isDefault: boolean
}

export const getAddresses = () => {
  return api.get<Address[]>('/addresses')
}

export const getAddress = (id: string) => {
  return api.get<Address>(`/addresses/${id}`)
}

export const createAddress = (data: Omit<Address, 'id'>) => {
  return api.post<Address>('/addresses', data)
}

export const updateAddress = (id: string, data: Partial<Address>) => {
  return api.put<Address>(`/addresses/${id}`, data)
}

export const deleteAddress = (id: string) => {
  return api.delete(`/addresses/${id}`)
}

export const setDefaultAddress = (id: string) => {
  return api.put<Address>(`/addresses/${id}/default`, {})
}