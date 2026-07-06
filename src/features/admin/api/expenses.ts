import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import type { Expense, ExpenseCategory } from '../../../lib/supabase/database.types';

// --- Expense Categories ---
export async function fetchExpenseCategories(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('expense_categories')
    .select('*')
    .eq('tenant_id', tid!)
    .order('name');
  if (error) throw error;
  return data;
}

export async function createExpenseCategory(payload: Omit<ExpenseCategory, 'id' | 'created_at'>) {
  const { data, error } = await supabase
    .from('expense_categories')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpenseCategory(id: string) {
  const { error } = await supabase.from('expense_categories').delete().eq('id', id);
  if (error) throw error;
}

// --- Expenses ---
export async function fetchExpenses(tenantId?: string) {
  const tid = tenantId ?? TENANT_ID;
  const { data, error } = await supabase
    .from('expenses')
    .select('*, expense_categories(name, color), admin_users(full_name)')
    .eq('tenant_id', tid!)
    .order('date', { ascending: false });
  if (error) throw error;
  return data;
}

export async function createExpense(payload: Omit<Expense, 'id' | 'created_at' | 'updated_at'>) {
  const { data, error } = await supabase
    .from('expenses')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateExpense(id: string, payload: Partial<Omit<Expense, 'id' | 'created_at' | 'updated_at'>>) {
  const { data, error } = await supabase
    .from('expenses')
    .update(payload)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteExpense(id: string) {
  const { error } = await supabase.from('expenses').delete().eq('id', id);
  if (error) throw error;
}
