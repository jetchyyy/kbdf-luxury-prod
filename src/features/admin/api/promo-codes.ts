import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { PromoCode } from '../../../lib/supabase/database.types';

type PromoCodeInsert = Omit<PromoCode, 'id' | 'created_at' | 'updated_at' | 'used_count'>;
type PromoCodeUpdate = Partial<PromoCodeInsert>;

export async function fetchPromoCodesPaginated(params: {
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
    .from('promo_codes')
    .select('*', { count: 'exact' })
    .eq('tenant_id', tid!);

  if (params.search && params.search.trim()) {
    const q = params.search.trim();
    query = query.ilike('code', `%${q}%`);
  }

  const sortBy = params.sortBy || 'created_at';
  const sortDir = params.sortDir || 'desc';
  query = query.order(sortBy, { ascending: sortDir === 'asc' });

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return {
    data: (data || []) as PromoCode[],
    totalCount: count || 0,
  };
}

export async function createPromoCode(payload: PromoCodeInsert) {
  const { data, error } = await supabase
    .from('promo_codes')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data as PromoCode;
}

export async function updatePromoCode(id: string, payload: PromoCodeUpdate) {
  const { data, error } = await supabase
    .from('promo_codes')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data as PromoCode;
}

export async function deletePromoCode(id: string) {
  const { error } = await supabase.from('promo_codes').delete().eq('id', id);
  if (error) throw error;
}
