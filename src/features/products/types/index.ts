export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  original_price?: number;
  category_id: string;
  image_urls: string[];
  stock_status: 'in_stock' | 'low_stock' | 'out_of_stock';
  stock_quantity?: number;
  condition: 'new' | 'preloved_excellent' | 'preloved_good' | 'preloved_fair';
  brand: string;
  weight?: number;
  sizes?: { size: string; quantity: number }[] | null;
  colors?: { name: string; hex: string }[] | null;
  features?: string[] | null;
  delivery_info?: string | null;
  leeway_enabled?: boolean;
  leeway_down_payment_required?: boolean;
  leeway_down_payment_amount?: number;
  created_at: string;
}

export interface Review {
  id: string;
  author_name: string;
  rating: number;
  content: string;
  images?: string[];
  size?: string;
  color?: string;
  is_verified_buyer: boolean;
  created_at: string;
}
