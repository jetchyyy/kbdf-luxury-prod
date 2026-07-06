import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Product } from '../types';

const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    title: 'The Continental Tote (Mock)',
    slug: 'the-continental-tote',
    description: 'A masterpiece in fine-grained calfskin leather with a minimalist silhouette.',
    price: 3200,
    category_id: 'bags',
    image_urls: ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800&auto=format&fit=crop'],
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
    image_urls: ['https://images.unsplash.com/photo-1548036328-c9fa89d128fa?q=80&w=800&auto=format&fit=crop'],
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
    image_urls: ['https://images.unsplash.com/photo-1606503825008-9087118151eb?q=80&w=800&auto=format&fit=crop'],
    stock_status: 'low_stock',
    condition: 'new',
    brand: 'KBDF',
    created_at: new Date().toISOString()
  }
];

export async function fetchProducts(categorySlug?: string): Promise<Product[]> {
  if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
    // If tenant variables are placeholders, return mock products gracefully
    console.log('Using mock products (tenant id is unset)');
    if (categorySlug && categorySlug !== 'all') {
      return MOCK_PRODUCTS.filter(p => p.category_id === categorySlug);
    }
    return MOCK_PRODUCTS;
  }

  try {
    let query = supabase
      .from('items')
      .select('*, categories(slug)')
      .eq('tenant_id', TENANT_ID)
      .eq('is_active', true);

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
      image_urls: item.image_urls && item.image_urls.length > 0 ? item.image_urls : ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800'],
      stock_status: item.stock_status,
      condition: item.condition,
      brand: item.brand || 'KBDF',
      created_at: item.created_at
    }));
  } catch (err) {
    console.error('Error fetching storefront products:', err);
    return MOCK_PRODUCTS;
  }
}

export async function fetchProductBySlug(slug: string): Promise<Product | null> {
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
      image_urls: data.image_urls && data.image_urls.length > 0 ? data.image_urls : ['https://images.unsplash.com/photo-1584916201218-f4242ceb4809?q=80&w=800'],
      stock_status: data.stock_status,
      condition: data.condition,
      brand: data.brand || 'KBDF',
      created_at: data.created_at
    };
  } catch (err) {
    console.error('Error fetching product by slug:', err);
    return MOCK_PRODUCTS.find(p => p.slug === slug) || null;
  }
}
