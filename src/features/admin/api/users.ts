import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { AdminUser } from '../../../lib/supabase/database.types';

type AdminUserInsert = Omit<AdminUser, 'id' | 'created_at' | 'updated_at'>;
type AdminUserUpdate = Partial<AdminUserInsert>;

export async function fetchAdminUsers(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('admin_users')
    .select('*, roles(name)')
    .eq('tenant_id', tid!)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createAdminUser(
  email: string,
  password: string,
  profile: Omit<AdminUserInsert, 'auth_id' | 'email'>
) {
  const { data: authId, error: rpcError } = await supabase.rpc('create_admin_user_safe', {
    p_email: email,
    p_password: password,
    p_profile: profile
  });

  if (rpcError) throw rpcError;

  // Retrieve the newly created profile to return it
  const { data, error } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_id', authId)
    .single();
  if (error) throw error;

  return { ...data, createdAutomatically: true };
}

export async function updateAdminUser(id: string, payload: AdminUserUpdate) {
  const { data, error } = await supabase
    .from('admin_users')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deactivateAdminUser(id: string) {
  return updateAdminUser(id, { is_active: false });
}
