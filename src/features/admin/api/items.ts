import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Item } from '../../../lib/supabase/database.types';

type ItemInsert = Omit<Item, 'id' | 'created_at' | 'updated_at'>;
type ItemUpdate = Partial<ItemInsert>;

export async function fetchItems(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('items')
    .select('*, categories(name)')
    .eq('tenant_id', tid!)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchItemsPaginated(params: {
  tenantId?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  categoryFilter?: string;
  stockFilter?: string;
  conditionFilter?: string;
}) {
  const tid = params.tenantId ?? TENANT_ID;
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('items')
    .select('*, categories(name)', { count: 'exact' })
    .eq('tenant_id', tid!);

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(`title.ilike.%${q}%,description.ilike.%${q}%`);
  }

  if (params.categoryFilter && params.categoryFilter !== 'all') {
    query = query.eq('category_id', params.categoryFilter);
  }

  if (params.stockFilter && params.stockFilter !== 'all') {
    query = query.eq('stock_status', params.stockFilter);
  }

  if (params.conditionFilter && params.conditionFilter !== 'all') {
    query = query.eq('condition', params.conditionFilter);
  }

  // Handle sorting
  const sortBy = params.sortBy || 'created_at';
  const sortDir = params.sortDir || 'desc';
  query = query.order(sortBy, { ascending: sortDir === 'asc' });

  // Apply pagination range
  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    totalCount: count || 0,
  };
}

export async function createItem(payload: ItemInsert) {
  const { data, error } = await supabase
    .from('items')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateItem(id: string, payload: ItemUpdate) {
  const { data, error } = await supabase
    .from('items')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteItem(id: string) {
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

/** Generate a URL-friendly slug from a title */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}
