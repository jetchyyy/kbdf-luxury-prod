import { supabase } from '../../../lib/supabase/supabaseClient';

interface OnboardPayload {
  name: string;
  slug: string;
  adminEmail: string;
  adminName: string;
  adminPassword?: string;
  logoUrl?: string;
  primaryColor?: string;
  accentColor?: string;
  currencySymbol?: string;
}

export async function onboardTenant(payload: OnboardPayload) {
  // 1. Insert tenant
  const { data: tenant, error: tenantError } = await (supabase as any)
    .from('tenants')
    .insert({
      name: payload.name,
      slug: payload.slug,
      logo_url: payload.logoUrl || null,
      primary_color: payload.primaryColor || '#2f4065',
      accent_color: payload.accentColor || '#fb7a90',
      currency_symbol: payload.currencySymbol || '₱',
      is_active: true
    })
    .select()
    .single();

  if (tenantError) throw tenantError;

  // 2. Create default Admin role
  const { data: adminRole, error: roleError } = await (supabase as any)
    .from('roles')
    .insert({
      tenant_id: tenant.id,
      name: 'Admin',
      description: 'Full store administrative access',
      is_system_role: true,
      permissions: {
        overview:        { read: true },
        analytics:       { read: true },
        items:           { create: true, read: true, edit: true, delete: true },
        categories:      { create: true, read: true, edit: true, delete: true },
        users:           { create: true, read: true, edit: true, delete: true },
        roles:           { create: true, read: true, edit: true, delete: true },
        leads:           { read: true, edit: true, delete: true },
        expenses:        { create: true, read: true, edit: true, delete: true },
        payment_methods: { create: true, read: true, edit: true, delete: true },
        settings:        { read: true, edit: true }
      }
    })
    .select()
    .single();

  if (roleError) throw roleError;

  // Create default Staff role
  const { error: staffRoleError } = await (supabase as any)
    .from('roles')
    .insert({
      tenant_id: tenant.id,
      name: 'Staff',
      description: 'Read-only access to assigned modules',
      is_system_role: true,
      permissions: {
        overview:        { read: true },
        analytics:       { read: false },
        items:           { create: false, read: true, edit: false, delete: false },
        categories:      { create: false, read: true, edit: false, delete: false },
        users:           { create: false, read: false, edit: false, delete: false },
        roles:           { create: false, read: false, edit: false, delete: false },
        leads:           { read: true, edit: false, delete: false },
        expenses:        { create: false, read: true, edit: false, delete: false },
        payment_methods: { create: false, read: true, edit: false, delete: false },
        settings:        { read: false, edit: false }
      }
    });

  if (staffRoleError) throw staffRoleError;

  // 3. Seed default expense categories
  const predefinedExpenseCategories = [
    { tenant_id: tenant.id, name: 'Inventory',  color: '#3b82f6', is_predefined: true },
    { tenant_id: tenant.id, name: 'Marketing',  color: '#8b5cf6', is_predefined: true },
    { tenant_id: tenant.id, name: 'Shipping',   color: '#f59e0b', is_predefined: true },
    { tenant_id: tenant.id, name: 'Utilities',  color: '#10b981', is_predefined: true },
    { tenant_id: tenant.id, name: 'Rent',       color: '#ef4444', is_predefined: true },
    { tenant_id: tenant.id, name: 'Payroll',    color: '#ec4899', is_predefined: true },
    { tenant_id: tenant.id, name: 'Supplies',   color: '#14b8a6', is_predefined: true },
    { tenant_id: tenant.id, name: 'Other',      color: '#6b7280', is_predefined: true },
  ];

  const { error: expError } = await (supabase as any)
    .from('expense_categories')
    .insert(predefinedExpenseCategories);

  if (expError) throw expError;

  // 4. Create owner auth user & admin_users record using SQL RPC
  if (!payload.adminPassword) {
    throw new Error('Admin password is required for onboarding');
  }

  const { data: authUserId, error: rpcError } = await supabase.rpc('create_admin_user_safe', {
    p_email: payload.adminEmail,
    p_password: payload.adminPassword,
    p_profile: {
      tenant_id: tenant.id,
      role_id: adminRole.id,
      full_name: payload.adminName,
      is_superadmin: false,
      is_active: true,
      // Default full module visibility for the store owner
      access_overview: true,
      access_analytics: true,
      access_items: true,
      access_users: true,
      access_settings: true,
      access_leads: true,
      access_expenses: true,
      access_categories: true,
      access_roles: true,
      access_payment_methods: true
    }
  });

  if (rpcError) throw rpcError;

  // Retrieve the newly created profile
  const { data: adminUserProfile, error: profileError } = await supabase
    .from('admin_users')
    .select('*')
    .eq('auth_id', authUserId)
    .single();

  if (profileError) throw profileError;

  return {
    tenant,
    adminRole,
    adminUserProfile,
    authCreatedAutomatically: true
  };
}
