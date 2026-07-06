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
