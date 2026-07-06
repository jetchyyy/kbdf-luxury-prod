import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Lead } from '../../../lib/supabase/database.types';

type LeadUpdate = Partial<Pick<Lead, 'status' | 'notes'>>;

export async function fetchLeads(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('tenant_id', tid!)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function updateLead(id: string, payload: LeadUpdate) {
  const { data, error } = await supabase
    .from('leads')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteLead(id: string) {
  const { error } = await supabase.from('leads').delete().eq('id', id);
  if (error) throw error;
}

/** Submit from storefront contact form */
export async function submitLead(payload: {
  tenant_id: string;
  name: string;
  email: string;
  phone?: string;
  subject?: string;
  message?: string;
}) {
  const { data, error } = await supabase
    .from('leads')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}
