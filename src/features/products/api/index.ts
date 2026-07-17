import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { withCache, invalidateCache } from '../../../lib/utils/cache';
import type { Product, Review } from '../types';
export { invalidateCache };

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'The Continental Tote (Mock)',
    slug: 'the-continental-tote',
    description: 'A masterpiece in fine-grained calfskin leather with a minimalist silhouette.',
    price: 3200,
    category_id: 'bags',
    image_urls: [],
    stock_status: 'in_stock',
    condition: 'new',
    brand: 'KBDF',
    created_at: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Vintage Quilted Chain (Mock)',
    slug: 'vintage-quilted-chain',
    description: 'Preloved excellent condition, featuring signature interlocking closure and gold-tone hardware.',
    price: 4500,
    original_price: 5200,
    category_id: 'preloved-bags',
    image_urls: [],
    stock_status: 'in_stock',
    condition: 'preloved_excellent',
    brand: 'Heritage',
    created_at: new Date().toISOString()
  },
  {
    id: '3',
    title: 'Minimalist Cardholder (Mock)',
    slug: 'minimalist-cardholder',
    description: 'Sleek, essential, and crafted from sustainable pebble leather.',
    price: 450,
    category_id: 'wallets',
    image_urls: [],
    stock_status: 'low_stock',
    condition: 'new',
    brand: 'KBDF',
    created_at: new Date().toISOString()
  }
];

export async function fetchProducts(
  categorySlug?: string, 
  searchQuery?: string, 
  onlyNewArrivals?: boolean,
  page: number = 1,
  limit: number = 12
): Promise<Product[]> {
  const cacheKey = `products_${TENANT_ID}_${categorySlug || 'all'}_${searchQuery || ''}_${onlyNewArrivals || false}_${page}_${limit}`;
  return withCache(cacheKey, 5 * 60 * 1000, async () => {
  if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
    // If tenant variables are placeholders, return mock products gracefully
    console.log('Using mock products (tenant id is unset)');
    let filtered = MOCK_PRODUCTS;
    if (categorySlug && categorySlug !== 'all') {
      filtered = filtered.filter(p => p.category_id === categorySlug);
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(p => p.title.toLowerCase().includes(q) || (p.brand && p.brand.toLowerCase().includes(q)));
    }
    const startIndex = (page - 1) * limit;
    return filtered.slice(startIndex, startIndex + limit);
  }

  try {
    let query = supabase
      .from('items')
      .select('*, categories(slug)')
      .eq('tenant_id', TENANT_ID)
      .eq('is_active', true);

    if (onlyNewArrivals) {
      query = query.eq('is_new_arrival', true);
    }

    if (categorySlug && categorySlug !== 'all') {
      // Filter by category slug relation
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('tenant_id', TENANT_ID)
        .eq('slug', categorySlug)
        .single();
      
      if (catData) {
        query = query.eq('category_id', catData.id);
      } else {
        return [];
      }
    }

    if (searchQuery) {
      query = query.or(`brand.ilike.%${searchQuery}%,title.ilike.%${searchQuery}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error } = await query;
    if (error) throw error;
    
    return (data || []).map((item: any) => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      description: item.description || '',
      price: Number(item.price),
      original_price: item.original_price ? Number(item.original_price) : undefined,
      category_id: item.category_id || '',
      image_urls: item.image_urls && item.image_urls.length > 0 ? item.image_urls : [],
      stock_status: item.stock_status,
      stock_quantity: Number(item.quantity || 0),
      condition: item.condition,
      brand: item.brand || 'KBDF',
      sizes: item.sizes || [],
      colors: item.colors || [],
      features: item.features || [],
      delivery_info: item.delivery_info || null,
      is_new_arrival: item.is_new_arrival || false,
      leeway_enabled: item.leeway_enabled || false,
      leeway_down_payment_required: item.leeway_down_payment_required || false,
      leeway_down_payment_amount: item.leeway_down_payment_amount ? Number(item.leeway_down_payment_amount) : 0,
      created_at: item.created_at
    }));
  } catch (err) {
    console.error('Error fetching storefront products:', err);
    return MOCK_PRODUCTS;
  }
  });
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
  const cacheKey = `product_${TENANT_ID}_${slug}`;
  return withCache(cacheKey, 5 * 60 * 1000, async () => {
  if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }

  try {
    const { data, error } = await supabase
      .from('items')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('slug', slug)
      .single();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      title: data.title,
      slug: data.slug,
      description: data.description || '',
      price: Number(data.price),
      original_price: data.original_price ? Number(data.original_price) : undefined,
      category_id: data.category_id || '',
      image_urls: data.image_urls && data.image_urls.length > 0 ? data.image_urls : [],
      stock_status: data.stock_status,
      stock_quantity: Number(data.quantity || 0),
      condition: data.condition,
      brand: data.brand || 'KBDF',
      sizes: data.sizes || [],
      colors: data.colors || [],
      features: data.features || [],
      delivery_info: data.delivery_info || null,
      is_new_arrival: data.is_new_arrival || false,
      leeway_enabled: data.leeway_enabled || false,
      leeway_down_payment_required: data.leeway_down_payment_required || false,
      leeway_down_payment_amount: data.leeway_down_payment_amount ? Number(data.leeway_down_payment_amount) : 0,
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
  });
}

export async function fetchProductReviews(itemId: string): Promise<Review[]> {
  const cacheKey = `reviews_${TENANT_ID}_${itemId}`;
  return withCache(cacheKey, 5 * 60 * 1000, async () => {
  if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
    return [];
  }
  
  try {
    const { data, error } = await supabase
      .from('product_reviews')
      .select('*')
      .eq('tenant_id', TENANT_ID)
      .eq('item_id', itemId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false });

    if (error) {
      // Return empty if table doesn't exist yet (before migration runs)
      console.warn('Error fetching reviews (maybe table not created yet):', error.message);
      return [];
    }
    
    return data as Review[];
  } catch (err) {
    console.error('Error in fetchProductReviews:', err);
    return [];
  }
  });
}

export async function submitProductReview(review: {
  item_id: string;
  author_name: string;
  rating: number;
  content: string;
  images?: string[];
  size?: string;
  color?: string;
  is_verified_buyer?: boolean;
}): Promise<void> {
  if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
    throw new Error('Tenant ID is unset or invalid.');
  }

  const { error } = await supabase
    .from('product_reviews')
    .insert({
      tenant_id: TENANT_ID,
      item_id: review.item_id,
      author_name: review.author_name,
      rating: review.rating,
      content: review.content,
      images: review.images || [],
      size: review.size || null,
      color: review.color || null,
      is_approved: true, // Auto-approve for instant feedback
      is_verified_buyer: review.is_verified_buyer || false
    });

  if (error) {
    throw error;
  }

  // Clear cache for product reviews
  const cacheKey = `reviews_${TENANT_ID}_${review.item_id}`;
  invalidateCache(cacheKey);
}

