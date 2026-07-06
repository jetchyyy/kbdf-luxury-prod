import { supabase } from '../../../lib/supabase/supabaseClient';
import type { Tenant } from '../../../lib/supabase/database.types';

type TenantInsert = Omit<Tenant, 'id' | 'created_at' | 'updated_at'>;
type TenantUpdate = Partial<TenantInsert>;

export async function fetchTenants() {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function fetchTenantById(id: string) {
  const { data, error } = await supabase
    .from('tenants')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data;
}

export async function updateTenant(id: string, payload: TenantUpdate) {
  const { data, error } = await supabase
    .from('tenants')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteTenant(id: string) {
  const { error } = await supabase
    .from('tenants')
    .delete()
    .eq('id', id);
  if (error) throw error;
}
