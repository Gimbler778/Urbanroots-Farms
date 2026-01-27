import axios from 'axios'
import type { Product, Order, User } from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Products
export const getProducts = async (category?: string) => {
  const params = category ? { category } : {}
  const response = await api.get<Product[]>('/products', { params })
  return response.data
}

export const getProduct = async (id: string) => {
  const response = await api.get<Product>(`/products/${id}`)
  return response.data
}

// Orders
export const createOrder = async (orderData: Partial<Order>) => {
  const response = await api.post<Order>('/orders', orderData)
  return response.data
}

export const getOrders = async () => {
  const response = await api.get<Order[]>('/orders')
  return response.data
}

export const getOrder = async (id: string) => {
  const response = await api.get<Order>(`/orders/${id}`)
  return response.data
}

// User
export const getUser = async () => {
  const response = await api.get<User>('/user')
  return response.data
}

export const updateUser = async (userData: Partial<User>) => {
  const response = await api.put<User>('/user', userData)
  return response.data
}

export default api
