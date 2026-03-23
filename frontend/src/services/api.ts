import axios from 'axios'
import type {
  AdminProductCreatePayload,
  AdminProductUpdatePayload,
  Product,
  Order,
  User,
  BuildingApplicationPayload,
  BuildingApplicationRecord,
  OrderHistoryItem,
  PodRentalRequest,
  PodRentalResponse,
  PodReview,
  PodReviewCreatePayload,
  PodReviewListResponse,
  PodReviewReplyPayload,
  PodReviewVotePayload,
  AdminDashboardData,
  BuildingApplicationStatus,
  PodRentalStatus,
} from '@/types'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
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

export const submitBuildingApplication = async (payload: BuildingApplicationPayload) => {
  const response = await api.post<{ message: string }>('/applications', payload, { withCredentials: true })
  return response.data
}

export const createPodRental = async (payload: PodRentalRequest) => {
  const response = await api.post<PodRentalResponse>('/pod-rentals', payload)
  return response.data
}

export const getMyOrders = async () => {
  const response = await api.get<OrderHistoryItem[]>('/my-orders')
  return response.data
}

export const cancelPodRental = async (id: string) => {
  const response = await api.post<PodRentalResponse>(`/pod-rentals/${id}/cancel`)
  return response.data
}

export const getPodReviews = async (podPlanId: string, page = 1, pageSize = 10, sort: 'newest' | 'oldest' | 'top' = 'newest') => {
  const response = await api.get<PodReviewListResponse>(`/pods/${podPlanId}/reviews`, {
    params: {
      page,
      page_size: pageSize,
      sort,
    },
  })
  return response.data
}

export const createPodReview = async (podPlanId: string, payload: PodReviewCreatePayload) => {
  const response = await api.post<PodReview>(`/pods/${podPlanId}/reviews`, payload)
  return response.data
}

export const replyToPodReview = async (podPlanId: string, reviewId: string, payload: PodReviewReplyPayload) => {
  const response = await api.post<PodReview>(`/pods/${podPlanId}/reviews/${reviewId}/replies`, payload)
  return response.data
}

export const votePodReview = async (podPlanId: string, reviewId: string, payload: PodReviewVotePayload) => {
  const response = await api.post<PodReview>(`/pods/${podPlanId}/reviews/${reviewId}/vote`, payload)
  return response.data
}

export const deletePodReview = async (podPlanId: string, reviewId: string) => {
  const response = await api.delete<{ success: boolean; message: string }>(`/pods/${podPlanId}/reviews/${reviewId}`)
  return response.data
}

export const getAdminDashboard = async () => {
  const response = await api.get<AdminDashboardData>('/admin/dashboard')
  return response.data
}

export const updateAdminPodRentalStatus = async (id: string, status: PodRentalStatus) => {
  const response = await api.patch<PodRentalResponse['rental']>(`/admin/pod-rentals/${id}`, { status })
  return response.data
}

export const updateAdminBuildingApplicationStatus = async (id: string, status: BuildingApplicationStatus) => {
  const response = await api.patch<BuildingApplicationRecord>(`/admin/building-applications/${id}`, { status })
  return response.data
}

export const createAdminProduct = async (payload: AdminProductCreatePayload) => {
  const response = await api.post<Product>('/admin/products', payload)
  return response.data
}

export const updateAdminProduct = async (id: string, payload: AdminProductUpdatePayload) => {
  const response = await api.put<Product>(`/admin/products/${id}`, payload)
  return response.data
}

export const deleteAdminProduct = async (id: string) => {
  await api.delete(`/admin/products/${id}`)
}

// FarmBot chat
export const chatWithFarmBot = async (messages: { role: string; content: string }[]) => {
  const response = await api.post<{ reply: string }>('/farmbot/chat', { messages })
  return response.data.reply
}

export default api
