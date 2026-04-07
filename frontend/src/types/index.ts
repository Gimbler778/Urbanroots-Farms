export interface Product {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  organic: boolean
  unit: string
}

export interface AdminProductCreatePayload {
  name: string
  description: string
  price: number
  image: string
  category: string
  stock: number
  organic: boolean
  unit: string
}

export type AdminProductUpdatePayload = Partial<AdminProductCreatePayload>

export interface CartItem {
  product: Product
  quantity: number
}

export interface Order {
  id: string
  items: CartItem[]
  total: number
  status: 'pending' | 'processing' | 'shipped' | 'delivered'
  createdAt: string
  shippingAddress: Address
}

export type PodRentalStatus = 'requested' | 'contact_scheduled' | 'renting' | 'completed' | 'cancelled' | 'refund_pending'
export type BuildingApplicationStatus = 'submitted' | 'reviewing' | 'approved' | 'rejected'

export interface PodRentalRequest {
  pod_plan_id: 'starter' | 'standard' | 'premium'
  full_name: string
  email: string
  phone: string
  street_name: string
  house_number: string
  city: string
  state: string
  zip_code: string
  preferred_start_date: string
  rental_term_months: number
  building_name?: string
  location_type: string
  growing_goals?: string
  notes?: string
  terms_accepted: boolean
}

export interface PodRental {
  id: string
  user_id: string
  pod_plan_id: 'starter' | 'standard' | 'premium'
  pod_name: string
  pod_size: 'small' | 'medium' | 'large'
  monthly_price: number
  installation_fee: number
  status: PodRentalStatus
  full_name: string
  email: string
  phone: string
  street_name: string
  house_number: string
  city: string
  state: string
  zip_code: string
  preferred_start_date: string
  rental_term_months: number
  building_name?: string | null
  location_type: string
  growing_goals?: string | null
  notes?: string | null
  terms_accepted: boolean
  created_at: string
  updated_at: string
}

export interface PodRentalResponse {
  rental: PodRental
  email_delivered: boolean
  message: string
}

export interface PodReview {
  id: string
  pod_plan_id: 'starter' | 'standard' | 'premium'
  parent_id: string | null
  user_id: string
  author_name: string
  body: string
  rating: number | null
  depth: number
  path: string
  upvotes: number
  score: number
  is_deleted: boolean
  user_vote: -1 | 0 | 1
  created_at: string
  updated_at: string
}

export interface PodReviewListResponse {
  reviews: PodReview[]
  page: number
  page_size: number
  total_top_level: number
  has_next: boolean
  sort: 'newest' | 'oldest' | 'top'
}

export interface PodReviewCreatePayload {
  body: string
  rating: number
}

export interface PodReviewReplyPayload {
  body: string
}

export interface PodReviewVotePayload {
  value: -1 | 0 | 1
}

export interface ProductReview {
  id: string
  product_id: string
  parent_id: string | null
  user_id: string
  author_name: string
  body: string
  rating: number | null
  depth: number
  path: string
  upvotes: number
  score: number
  is_deleted: boolean
  user_vote: -1 | 0 | 1
  created_at: string
  updated_at: string
}

export interface ProductReviewListResponse {
  reviews: ProductReview[]
  page: number
  page_size: number
  total_top_level: number
  has_next: boolean
  sort: 'newest' | 'oldest' | 'top'
}

export interface ProductReviewCreatePayload {
  body: string
  rating: number
}

export interface ProductReviewReplyPayload {
  body: string
}

export interface ProductReviewVotePayload {
  value: -1 | 0 | 1
}

export interface PersistedCartItem {
  product_id: string
  name: string
  category: string
  price: number
  description: string
  image: string
  quantity: number
}

export interface OrderHistoryItem {
  id: string
  type: 'product' | 'pod_rental'
  title: string
  subtitle: string
  status: string
  created_at: string
  total?: number
  batch_ref?: string
  monthly_price?: number
  installation_fee?: number
  pod_size?: string
  preferred_start_date?: string
  rental_term_months?: number
  item_count?: number
  can_cancel?: boolean
  product_items?: ProductOrderBatchItem[]
  details: Record<string, string>
}

export interface ProductOrderBatchItem {
  id: string
  batch_id: string
  product_id: string
  name: string
  image: string
  category: string
  quantity: number
  unit_price: number
  line_total: number
  status: 'requested' | 'processing' | 'contact_schedule' | 'completed' | 'cancelled'
}

export interface ProductOrderBatch {
  id: string
  batch_ref: string
  user_id: string
  customer_name: string
  customer_email: string
  status: 'requested' | 'processing' | 'contact_schedule' | 'completed' | 'cancelled'
  subtotal: number
  tax: number
  total: number
  item_count: number
  created_at: string
  updated_at: string
  items: ProductOrderBatchItem[]
}

export interface ProductOrderBatchActionResponse {
  message: string
  batch: ProductOrderBatch
}

export interface CheckoutOrderBatchPayload {
  coupon_code?: string
  referral_code?: string
}

export interface Address {
  fullName: string
  street: string
  city: string
  state: string
  zipCode: string
  country: string
  phone: string
}

export interface User {
  id: string
  email: string
  name: string
  role?: 'user' | 'admin'
  address?: Address
}

export interface BuildingApplicationPayload {
  full_name: string
  phone: string
  building_name: string
  address: string
  building_type: string
  space_size: string
  additional_info?: string
}

export interface BuildingApplicationRecord extends BuildingApplicationPayload {
  id: string
  user_id: string
  user_email: string
  status: BuildingApplicationStatus
  created_at: string
  updated_at: string
}

export interface AdminMetrics {
  products: number
  pod_rentals: number
  building_applications: number
  product_order_batches: number
  pending_pod_rentals: number
  pending_applications: number
  pending_product_batches: number
}

export interface AdminDashboardData {
  metrics: AdminMetrics
  products: Product[]
  pod_rentals: PodRental[]
  building_applications: BuildingApplicationRecord[]
}
