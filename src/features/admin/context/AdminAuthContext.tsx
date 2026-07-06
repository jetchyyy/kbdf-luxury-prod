import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase } from '../../../lib/supabase/supabaseClient';
import type { AdminUser, Role, Tenant, RolePermissions, PermissionModule, PermissionAction } from '../../../lib/supabase/database.types';

interface AdminAuthContextType {
  adminUser: AdminUser | null;
  tenant: Tenant | null;
  role: Role | null;
  isLoading: boolean;
  isSuperadmin: boolean;
  can: (module: PermissionModule, action: PermissionAction) => boolean;
  hasAccess: (module: string) => boolean;
  signOut: () => Promise<void>;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [adminUser, setAdminUser] = useState<AdminUser | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check current session
    supabase.auth.getSession().then(({ data: { session } }: any) => {
      if (session?.user) {
        loadAdminUser(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: any, session: any) => {
      if (session?.user) {
        loadAdminUser(session.user.id);
      } else {
        setAdminUser(null);
        setTenant(null);
        setRole(null);
        setIsLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function loadAdminUser(authId: string) {
    setIsLoading(true);
    try {
      const { data: user, error } = await supabase
        .from('admin_users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error || !user) {
        setIsLoading(false);
        return;
      }

      setAdminUser(user);

      // Load tenant if not superadmin
      if (user.tenant_id && !user.is_superadmin) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', user.tenant_id)
          .single();
        setTenant(tenantData);
      }

      // Load role
      if (user.role_id) {
        const { data: roleData } = await supabase
          .from('roles')
          .select('*')
          .eq('id', user.role_id)
          .single();
        setRole(roleData);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const isSuperadmin = adminUser?.is_superadmin ?? false;

  // Check CRUD permission for a module via role.permissions JSONB
  function can(module: PermissionModule, action: PermissionAction): boolean {
    if (isSuperadmin) return true;
    if (!role) return false;
    const perms = role.permissions as RolePermissions;
    
    const explicitPerm = perms?.[module]?.[action];
    if (explicitPerm !== undefined) return explicitPerm;

    // Fallback for new orders module
    if (module === 'orders') {
      const hasModuleAccess = hasAccess('orders');
      const isSystemOrAdmin = role.name.toLowerCase() === 'admin' || role.is_system_role;
      return hasModuleAccess && isSystemOrAdmin;
    }

    // Fallback for new promo_codes module
    if (module === 'promo_codes') {
      const hasModuleAccess = hasAccess('promo_codes');
      const isSystemOrAdmin = 
        role.name.toLowerCase() === 'admin' || 
        role.name.toLowerCase() === 'administrator' || 
        role.is_system_role;
      return hasModuleAccess && isSystemOrAdmin;
    }

    return false;
  }

  // Check if a module is visible (access_* boolean on admin_users)
  function hasAccess(module: string): boolean {
    if (isSuperadmin) return true;
    if (!adminUser) return false;
    const key = `access_${module}` as keyof AdminUser;
    return (adminUser[key] as boolean) ?? false;
  }

  async function signOut() {
    await supabase.auth.signOut();
  }

  return (
    <AdminAuthContext.Provider value={{
      adminUser,
      tenant,
      role,
      isLoading,
      isSuperadmin,
      can,
      hasAccess,
      signOut,
    }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error('useAdminAuth must be used within AdminAuthProvider');
  return ctx;
}
