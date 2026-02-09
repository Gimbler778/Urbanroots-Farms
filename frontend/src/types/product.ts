// Product related types
export interface Product {
  id: string;
  name: string;
  category: 'equipment' | 'service';
  price: number;
  description: string;
  longDescription: string;
  images: string[];
  features: string[];
  specifications?: { [key: string]: string };
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Review {
  id: string;
  productId: string;
  author: string;
  rating: number;
  comment: string;
  date: string;
}
