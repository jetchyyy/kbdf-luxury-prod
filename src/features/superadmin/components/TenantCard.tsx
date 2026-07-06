import { Globe, ArrowRight } from 'lucide-react';
import type { Tenant } from '../../../lib/supabase/database.types';
import { EnvGenerator } from './EnvGenerator';
import { Link } from 'react-router-dom';

interface TenantCardProps {
  tenant: Tenant;
}

export function TenantCard({ tenant }: TenantCardProps) {
  return (
    <div
      className={`bg-[#111827] border rounded-2xl p-5 flex flex-col justify-between h-48 transition-all ${
        tenant.is_active ? 'border-white/5 shadow-lg' : 'border-white/5 opacity-50'
      }`}
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70 overflow-hidden border border-white/5">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>
            <div>
              <h4 className="font-semibold text-white text-sm">{tenant.name}</h4>
              <p className="text-white/40 text-[10px] font-mono">{tenant.slug}</p>
            </div>
          </div>

          <span className={`px-2 py-0.5 text-[9px] font-bold rounded-full border uppercase tracking-wider ${
            tenant.is_active
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {tenant.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>

        {/* Configurations */}
        <div className="flex items-center gap-4 text-xs text-white/60">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: tenant.primary_color }} />
            Primary Theme
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-white/20" style={{ backgroundColor: tenant.accent_color }} />
            Accent Color
          </div>
        </div>
      </div>

      {/* Footer controls */}
      <div className="flex items-center justify-between pt-4 border-t border-white/5">
        <EnvGenerator tenant={tenant} />
        
        <Link
          to={`/odc/tenants/${tenant.id}`}
          className="text-xs font-semibold text-[#fb7a90] hover:text-[#f16881] transition-all flex items-center gap-1 hover:underline"
        >
          View Store Data <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}
export default TenantCard;
