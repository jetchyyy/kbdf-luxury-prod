import { useState, useEffect } from 'react';
import { X, Globe, ShieldAlert } from 'lucide-react';
import { onboardTenant } from '../api/onboarding';

interface TenantOnboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (result: any) => void;
}

export function TenantOnboardModal({ isOpen, onClose, onSuccess }: TenantOnboardModalProps) {
  const [storeName, setStoreName] = useState('');
  const [slug, setSlug] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminName, setAdminName] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [primaryColor, setPrimaryColor] = useState('#2f4065');
  const [accentColor, setAccentColor] = useState('#fb7a90');
  const [currencySymbol, setCurrencySymbol] = useState('₱');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Auto-slugify store name
  useEffect(() => {
    if (storeName && !slug) {
      setSlug(
        storeName
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim()
      );
    }
  }, [storeName]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!storeName.trim() || !slug.trim() || !adminEmail.trim() || !adminName.trim() || !adminPassword.trim()) {
      setError('All starred (*) fields are required.');
      setIsSubmitting(false);
      return;
    }

    try {
      const result = await onboardTenant({
        name: storeName.trim(),
        slug: slug.trim(),
        adminEmail: adminEmail.trim(),
        adminName: adminName.trim(),
        adminPassword: adminPassword.trim(),
        logoUrl: logoUrl.trim() || undefined,
        primaryColor,
        accentColor,
        currencySymbol: currencySymbol.trim() || undefined
      });

      onSuccess(result);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Tenant onboarding failed.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-[#fb7a90]" />
            <h3 className="text-white font-bold text-lg">Onboard New Tenant Store</h3>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* User notice on Auth user restrictions */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 flex items-start gap-3 text-xs text-blue-400">
            <ShieldAlert className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <p>
              Onboarding will create the Tenant store record, default roles, default expense/storefront categories, and admin profile. 
              <strong> Note:</strong> Auto-creating Auth accounts requires a Supabase Service Role Key. If missing, please create the Auth account manually in the dashboard with the specified email.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Store Information */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/5 pb-1">Store Details</h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Store Name *</label>
                <input
                  type="text"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  required
                  placeholder="e.g. KBDF Luxury Store"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Domain Slug *</label>
                <input
                  type="text"
                  value={slug}
                  onChange={e => setSlug(e.target.value)}
                  required
                  placeholder="e.g. kbdf"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Logo URL</label>
                <input
                  type="url"
                  value={logoUrl}
                  onChange={e => setLogoUrl(e.target.value)}
                  placeholder="https://example.com/logo.png"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>
            </div>

            {/* Admin/Owner Credentials */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider border-b border-white/5 pb-1">Store Admin Credentials</h4>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Admin Full Name *</label>
                <input
                  type="text"
                  value={adminName}
                  onChange={e => setAdminName(e.target.value)}
                  required
                  placeholder="John Doe"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Admin Email Address *</label>
                <input
                  type="email"
                  value={adminEmail}
                  onChange={e => setAdminEmail(e.target.value)}
                  required
                  placeholder="admin@kbdf.com"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors font-mono"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Initial Password *</label>
                <input
                  type="password"
                  value={adminPassword}
                  onChange={e => setAdminPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Custom Branding details */}
          <div className="space-y-4 pt-4 border-t border-white/5">
            <h4 className="text-xs font-bold text-white/50 uppercase tracking-wider">Custom Store Branding</h4>
            <div className="grid grid-cols-3 gap-6">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Primary Theme Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={e => setPrimaryColor(e.target.value)}
                    className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white/70">{primaryColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Accent Color</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={e => setAccentColor(e.target.value)}
                    className="w-10 h-10 rounded border border-white/10 bg-transparent cursor-pointer"
                  />
                  <span className="font-mono text-xs text-white/70">{accentColor}</span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-white/60 text-xs font-medium">Currency Symbol</label>
                <input
                  type="text"
                  value={currencySymbol}
                  onChange={e => setCurrencySymbol(e.target.value)}
                  maxLength={3}
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors font-mono"
                />
              </div>

            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-white/5 text-white rounded-xl text-sm font-semibold hover:bg-white/10 transition-all disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl text-sm font-semibold hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}
              {isSubmitting ? 'Onboarding...' : 'Onboard Store'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
