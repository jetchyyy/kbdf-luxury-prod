import { ShieldAlert, Globe, Server } from 'lucide-react';

export function PlatformSettingsPage() {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold text-white">Platform Settings</h2>
        <p className="text-white/40 text-xs mt-0.5">Global configuration settings for EcomSaaS multi-tenant database infrastructure.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Supabase details */}
        <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Server className="w-4 h-4 text-[#fb7a90]" />
            <h3 className="text-white font-semibold text-sm">Database Configuration</h3>
          </div>
          
          <div className="space-y-3 text-xs text-white/70">
            <div>
              <p className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Shared Project Endpoint</p>
              <p className="font-mono bg-[#07080c] p-2.5 rounded-lg border border-white/5 text-white/90 overflow-x-auto truncate mt-1">
                {supabaseUrl}
              </p>
            </div>
            <div>
              <p className="text-white/40 text-[9px] uppercase tracking-wider font-semibold">Row-Level Security State</p>
              <p className="mt-1 font-semibold text-emerald-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Active (Isolated)
              </p>
            </div>
          </div>
        </div>

        {/* Deployment notice */}
        <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Globe className="w-4 h-4 text-[#fb7a90]" />
            <h3 className="text-white font-semibold text-sm">deployment settings</h3>
          </div>
          <p className="text-xs text-white/60 leading-relaxed">
            EcomSaaS is designed around a single-repository, multi-site architecture. When onboarding a tenant:
          </p>
          <ul className="list-disc list-inside text-xs text-white/50 space-y-1">
            <li>Generate their customized config `.env` in Tenants page.</li>
            <li>Commit code adjustments or push same branch to Netlify.</li>
            <li>Link a new Netlify website to this repository and supply the downloaded `.env` fields.</li>
          </ul>
        </div>

      </div>

      {/* Security alert */}
      <div className="bg-[#111827] border border-white/5 p-5 rounded-2xl flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="text-xs space-y-1 text-white/70">
          <h4 className="font-semibold text-white">System Security Notice</h4>
          <p>
            Platform Superadmin routes are strictly protected by Row Level Security bypassing policies. 
            Keep your authentication details secure, and ensure that Service Role keys are never exposed in storefront bundles.
          </p>
        </div>
      </div>

    </div>
  );
}
