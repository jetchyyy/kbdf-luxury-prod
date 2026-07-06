import { useEffect, useState } from 'react';
import { fetchTenants } from '../api/tenants';
import type { Tenant } from '../../../lib/supabase/database.types';
import { TenantCard } from '../components/TenantCard';
import { TenantOnboardModal } from '../components/TenantOnboardModal';
import { EnvGenerator } from '../components/EnvGenerator';
import { Globe, Plus, Sparkles, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function TenantsPage() {
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  // Onboarding Success Details to show env download card
  const [onboardedResult, setOnboardedResult] = useState<any | null>(null);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    setIsLoading(true);
    try {
      const data = await fetchTenants();
      setTenants(data);
    } catch (err) {
      console.error('Error loading tenants:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleOnboardSuccess(result: any) {
    setOnboardedResult(result);
    loadTenants();
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Tenant Stores</h2>
          <p className="text-white/40 text-xs mt-0.5">Onboard new Shopify-style store tenants, customize branding configurations, and download Netlify deploy files.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Onboard New Tenant
        </button>
      </div>

      {/* Onboarding Success Banner showing env download */}
      <AnimatePresence>
        {onboardedResult && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6 relative flex flex-col sm:flex-row sm:items-center justify-between gap-6"
          >
            <button
              onClick={() => setOnboardedResult(null)}
              className="absolute top-4 right-4 text-white/40 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="w-5 h-5 animate-pulse" />
                <h4 className="font-bold text-base">Store Onboarded Successfully!</h4>
              </div>
              <p className="text-white/60 text-xs max-w-xl">
                Store <strong>{onboardedResult.tenant.name}</strong> has been registered in the database. 
                {onboardedResult.authCreatedAutomatically ? (
                  <span> Owner Auth credentials were created successfully.</span>
                ) : (
                  <span className="text-amber-400 font-medium"> Note: Auto-Auth user creation failed (Service Role Key required). Please create their account manually in the Supabase Dashboard under email: {onboardedResult.adminUserProfile.email}.</span>
                )}
              </p>
              <p className="text-white/40 text-[10px]">
                Download the configuration file below to set up deployment environment variables in Netlify.
              </p>
            </div>

            <div className="flex-shrink-0">
              <EnvGenerator tenant={onboardedResult.tenant} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card lists */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl" />
          ))}
        </div>
      ) : tenants.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-2xl py-20 text-center">
          <Globe className="w-12 h-12 text-white/15 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-white font-semibold text-base mb-1">No Stores Onboarded</h3>
          <p className="text-white/40 text-xs max-w-xs mx-auto mb-6">Create your first Shopify-style tenant storefront to begin.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
          >
            Onboard Storefront
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tenants.map(tenant => (
            <TenantCard key={tenant.id} tenant={tenant} />
          ))}
        </div>
      )}

      {/* Modals */}
      <TenantOnboardModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleOnboardSuccess}
      />
    </div>
  );
}
