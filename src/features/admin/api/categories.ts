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
