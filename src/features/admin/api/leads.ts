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

export async function fetchLeadsPaginated(params: {
  tenantId?: string;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: string;
  sortDir?: 'asc' | 'desc';
  statusFilter?: string;
}) {
  const tid = params.tenantId ?? TENANT_ID;
  const from = (params.page - 1) * params.pageSize;
  const to = from + params.pageSize - 1;

  let query = supabase
    .from('leads')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tid!);

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.or(`name.ilike.%${q}%,email.ilike.%${q}%,subject.ilike.%${q}%`);
  }

  if (params.statusFilter && params.statusFilter !== 'all') {
    query = query.eq('status', params.statusFilter);
  }

  const sortBy = params.sortBy || 'created_at';
  const sortDir = params.sortDir || 'desc';
  query = query.order(sortBy, { ascending: sortDir === 'asc' });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: data || [],
    totalCount: count || 0,
  };
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
