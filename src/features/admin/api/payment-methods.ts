import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { PaymentMethod } from '../../../lib/supabase/database.types';

type PaymentMethodInsert = Omit<PaymentMethod, 'id' | 'created_at' | 'updated_at'>;
type PaymentMethodUpdate = Partial<PaymentMethodInsert>;

export async function fetchPaymentMethods(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('payment_methods')
    .select('*')
    .eq('tenant_id', tid!)
    .order('sort_order', { ascending: true });
  if (error) throw error;
  return data;
}

export async function createPaymentMethod(payload: PaymentMethodInsert) {
  const { data, error } = await supabase
    .from('payment_methods')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePaymentMethod(id: string, payload: PaymentMethodUpdate) {
  const { data, error } = await supabase
    .from('payment_methods')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function togglePaymentMethod(id: string, isActive: boolean) {
  return updatePaymentMethod(id, { is_active: isActive });
}

export async function deletePaymentMethod(id: string) {
  const { error } = await supabase.from('payment_methods').delete().eq('id', id);
  if (error) throw error;
}
