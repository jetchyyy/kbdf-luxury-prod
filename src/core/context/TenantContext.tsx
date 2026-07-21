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
          if (data.name) {
            document.title = data.name;
          }

          // Update dynamic meta tags for sharing
          const storeName = data.name || 'Luxury Store';
          const settings = (data.store_settings as any) || {};
          const branding = settings.branding || {};

          // Store Logo for favicon & branding, Share Image for social media previews (OG Image)
          const storeLogo = data.logo_url || `${window.location.origin}/kbdflogotext.jpg`;
          const shareImage = branding.meta_image_url || data.logo_url || `${window.location.origin}/kbdflogotext.jpg`;
          const storeDesc = branding.meta_description || settings.description || `Welcome to ${storeName}. Discover curated luxury items, new arrivals, and special collections.`;

          updateMetaTag('name', 'description', storeDesc);
          updateMetaTag('property', 'og:title', storeName);
          updateMetaTag('property', 'og:description', storeDesc);
          updateMetaTag('property', 'og:image', shareImage);
          updateMetaTag('property', 'og:url', window.location.href);
          updateMetaTag('property', 'og:type', 'website');
          updateMetaTag('name', 'twitter:card', 'summary_large_image');
          updateMetaTag('name', 'twitter:title', storeName);
          updateMetaTag('name', 'twitter:description', storeDesc);
          updateMetaTag('name', 'twitter:image', shareImage);

          // Favicon / Icon (strictly uses store logo)
          const favicon = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
          if (favicon) {
            favicon.href = storeLogo;
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

function updateMetaTag(attributeName: string, attributeValue: string, content: string) {
  if (typeof document === 'undefined') return;
  let element = document.head.querySelector(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement('meta');
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.setAttribute('content', content);
}
