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
  condition: 'new' | 'preloved_excellent' | 'preloved_good' | 'preloved_fair';
  brand: string;
  sizes?: { size: string; quantity: number }[];
  created_at: string;
}
