import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';

export async function fetchAnalyticsSummary(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;

  const [itemsRes, leadsRes, expensesRes] = await Promise.all([
    supabase.from('items').select('id, price, quantity, stock_status, created_at').eq('tenant_id', tid!),
    supabase.from('leads').select('id, status, created_at').eq('tenant_id', tid!),
    supabase.from('expenses').select('id, amount, date, category_id, expense_categories(name, color)').eq('tenant_id', tid!),
  ]);

  const items = itemsRes.data ?? [];
  const leads = leadsRes.data ?? [];
  const expenses = expensesRes.data ?? [];

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();

  const monthlyExpenses = expenses
    .filter((e: any) => e.date >= startOfMonth.slice(0, 10))
    .reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  const totalExpenses = expenses.reduce((sum: number, e: any) => sum + Number(e.amount), 0);

  // Expenses by category for chart
  const expensesByCategory: Record<string, { name: string; color: string; total: number }> = {};
  for (const e of expenses as any[]) {
    const cat = (e as unknown as { expense_categories: { name: string; color: string } | null }).expense_categories;
    const key = cat?.name ?? 'Uncategorized';
    const color = cat?.color ?? '#6b7280';
    if (!expensesByCategory[key]) expensesByCategory[key] = { name: key, color, total: 0 };
    expensesByCategory[key].total += Number(e.amount);
  }

  const activeLeads = leads.filter((l: any) => l.status === 'new' || l.status === 'contacted').length;
  const totalItems = items.length;
  const lowStockItems = items.filter((i: any) => i.stock_status === 'low_stock').length;
  const outOfStockItems = items.filter((i: any) => i.stock_status === 'out_of_stock').length;

  return {
    totalItems,
    activeLeads,
    monthlyExpenses,
    totalExpenses,
    lowStockItems,
    outOfStockItems,
    expensesByCategory: Object.values(expensesByCategory),
    leadsByStatus: {
      new: leads.filter((l: any) => l.status === 'new').length,
      contacted: leads.filter((l: any) => l.status === 'contacted').length,
      qualified: leads.filter((l: any) => l.status === 'qualified').length,
      converted: leads.filter((l: any) => l.status === 'converted').length,
      archived: leads.filter((l: any) => l.status === 'archived').length,
    },
  };
}
