import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Category } from '../../../lib/supabase/database.types';

type CategoryInsert = Omit<Category, 'id' | 'created_at' | 'updated_at'>;
type CategoryUpdate = Partial<CategoryInsert>;

export async function fetchCategories(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('tenant_id', tid!)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function fetchCategoriesPaginated(params: {
  tenantId?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
}) {
  const tid = params.tenantId ?? TENANT_ID;
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('categories')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tid!);

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }

  const sortBy = params.sortBy || 'sort_order';
  const sortDir = params.sortDir || 'asc';
  query = query.order(sortBy, { ascending: sortDir === 'asc' });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    totalCount: count || 0,
  };
}

export async function createCategory(payload: CategoryInsert) {
  const { data, error } = await supabase
    .from('categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(id: string, payload: CategoryUpdate) {
  const { data, error } = await supabase
    .from('categories')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteCategory(id: string) {
  const { error } = await supabase.from('categories').delete().eq('id', id);
  if (error) throw error;
}
