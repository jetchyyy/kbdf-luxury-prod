import { supabase } from '../../../lib/supabase/supabaseClient';

export async function fetchPlatformAnalytics() {
  const [tenantsRes, itemsRes, leadsRes, expensesRes] = await Promise.all([
    supabase.from('tenants').select('id, is_active'),
    supabase.from('items').select('id'),
    supabase.from('leads').select('id'),
    supabase.from('expenses').select('amount, date'),
  ]);

  const tenants = tenantsRes.data || [];
  const items = itemsRes.data || [];
  const leads = leadsRes.data || [];
  const expenses = expensesRes.data || [];

  const totalTenants = tenants.length;
  const activeTenants = tenants.filter((t: any) => t.is_active).length;
  const totalItems = items.length;
  const totalLeads = leads.length;

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const monthlyExpenses = expenses
    .filter((e: any) => e.date >= startOfMonth.slice(0, 10))
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  return {
    totalTenants,
    activeTenants,
    totalItems,
    totalLeads,
    monthlyExpenses,
  };
}
