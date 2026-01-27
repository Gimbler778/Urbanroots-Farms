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
  address?: Address
}
