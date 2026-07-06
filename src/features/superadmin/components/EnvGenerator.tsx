import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import type { Tenant } from '../../../lib/supabase/database.types';

interface EnvGeneratorProps {
  tenant: Tenant;
  variant?: 'inline' | 'button';
}

export function EnvGenerator({ tenant, variant = 'button' }: EnvGeneratorProps) {
  const [copied, setCopied] = useState(false);

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

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(envContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const downloadEnvFile = () => {
    const blob = new Blob([envContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `.env.${tenant.slug}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (variant === 'button') {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[10px] font-semibold text-white transition-all"
          title="Copy env configurations"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" /> Copied
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-white/50" /> Copy .env
            </>
          )}
        </button>
        <button
          type="button"
          onClick={downloadEnvFile}
          className="flex items-center gap-1.5 px-2.5 py-1.5 bg-[#fb7a90]/10 hover:bg-[#fb7a90]/20 border border-[#fb7a90]/20 rounded-xl text-[10px] font-semibold text-[#fb7a90] transition-all"
          title="Download env file"
        >
          <Download className="w-3 h-3" /> Download
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-3 w-full">
      <div className="flex items-center justify-between gap-4">
        <span className="text-white/40 text-[10px] uppercase font-bold tracking-wider">Generated .env Configuration</span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-semibold text-white transition-all"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-white/50" /> Copy Code
              </>
            )}
          </button>
          <button
            type="button"
            onClick={downloadEnvFile}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#fb7a90]/10 hover:bg-[#fb7a90]/20 border border-[#fb7a90]/20 rounded-xl text-xs font-semibold text-[#fb7a90] transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
        </div>
      </div>
      <pre className="bg-[#0f1117] border border-white/10 rounded-xl p-4 text-xs font-mono text-white/70 overflow-x-auto whitespace-pre leading-relaxed select-all">
        {envContent}
      </pre>
    </div>
  );
}
export default EnvGenerator;
