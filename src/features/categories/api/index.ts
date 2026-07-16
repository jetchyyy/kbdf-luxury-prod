import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { withCache } from '../../../lib/utils/cache';

export async function fetchStorefrontCategories() {
  const tid = TENANT_ID;
  if (!tid || tid === 'will-be-set-after-migration-seed') {
    return [];
  }
  
  const cacheKey = `storefront_categories_${tid}`;
  return withCache(cacheKey, 10 * 60 * 1000, async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .eq('tenant_id', tid)
      .order('sort_order', { ascending: true });
    
    if (error) throw error;
    return data || [];
  });
}
