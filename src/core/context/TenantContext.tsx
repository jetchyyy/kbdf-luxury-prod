import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { supabase, TENANT_ID } from '../../lib/supabase/supabaseClient';
import type { Tenant } from '../../lib/supabase/database.types';

interface TenantContextType {
  tenant: Tenant | null;
  isLoading: boolean;
  error: string | null;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchTenantDetails() {
      if (!TENANT_ID || TENANT_ID === 'will-be-set-after-migration-seed') {
        setIsLoading(false);
        return;
      }

      try {
        const { data, error: err } = await supabase
          .from('tenants')
          .select('*')
          .eq('id', TENANT_ID)
          .single();

        if (err) throw err;
        setTenant(data);

        // Apply theme colors dynamically
        if (data) {
          const root = document.documentElement;
          if (data.primary_color) {
            root.style.setProperty('--brand-navy', data.primary_color);
          }
          if (data.accent_color) {
            root.style.setProperty('--brand-pink', data.accent_color);
          }
        }
      } catch (err: any) {
        console.error('Failed to load tenant details on storefront:', err);
        setError(err.message || 'Failed to fetch tenant details');
      } finally {
        setIsLoading(false);
      }
    }

    fetchTenantDetails();
  }, []);

  return (
    <TenantContext.Provider value={{ tenant, isLoading, error }}>
      {children}
    </TenantContext.Provider>
  );
}

export function useTenant() {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
}
