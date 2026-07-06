import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Role } from '../../../lib/supabase/database.types';

type RoleInsert = Omit<Role, 'id' | 'created_at' | 'updated_at'>;
type RoleUpdate = Partial<RoleInsert>;

export async function fetchRoles(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('roles')
    .select('*')
    .eq('tenant_id', tid!)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createRole(payload: RoleInsert) {
  const { data, error } = await supabase
    .from('roles')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateRole(id: string, payload: RoleUpdate) {
  const { data, error } = await supabase
    .from('roles')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteRole(id: string) {
  const { error } = await supabase.from('roles').delete().eq('id', id);
  if (error) throw error;
}
