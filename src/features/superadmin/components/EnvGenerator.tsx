import { Download } from 'lucide-react';
import type { Tenant } from '../../../lib/supabase/database.types';

interface EnvGeneratorProps {
  tenant: Tenant;
}

export function EnvGenerator({ tenant }: EnvGeneratorProps) {
  function downloadEnvFile() {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

    const envContent = `# ============================================================
# Auto-generated .env file for EcomSaaS Tenant
# Tenant Name: ${tenant.name}
# Tenant Slug: ${tenant.slug}
# Generated At: ${new Date().toLocaleString()}
# ============================================================

VITE_APP_NAME=${tenant.name}
VITE_TENANT_SLUG=${tenant.slug}
VITE_TENANT_ID=${tenant.id}

# Supabase Configurations
VITE_SUPABASE_URL=${supabaseUrl}
VITE_SUPABASE_ANON_KEY=${supabaseAnonKey}

# Tenant Branding Configurations
VITE_PRIMARY_COLOR=${tenant.primary_color || '#2f4065'}
VITE_ACCENT_COLOR=${tenant.accent_color || '#fb7a90'}
VITE_LOGO_URL=${tenant.logo_url || ''}
VITE_CURRENCY_SYMBOL=${tenant.currency_symbol || '₱'}
VITE_TIMEZONE=${tenant.timezone || 'Asia/Manila'}

# Deployment Metadata
VITE_IS_PLATFORM=false
`;

    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `.env.${tenant.slug}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={downloadEnvFile}
      className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fb7a90]/10 hover:bg-[#fb7a90]/20 border border-[#fb7a90]/20 rounded-xl text-xs font-semibold text-[#fb7a90] transition-all"
    >
      <Download className="w-3.5 h-3.5" /> Download .env
    </button>
  );
}
export default EnvGenerator;
