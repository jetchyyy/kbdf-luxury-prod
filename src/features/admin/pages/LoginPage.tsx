import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, LogIn, Lock } from 'lucide-react';
import { adminSignIn } from '../api/auth';
import { useAdminAuth } from '../context/AdminAuthContext';
import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function AdminLoginPage() {
  const { adminUser, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [tenant, setTenant] = useState<any>(null);

  useEffect(() => {
    if (TENANT_ID) {
      supabase
        .from('tenants')
        .select('*')
        .eq('id', TENANT_ID)
        .single()
        .then(({ data }: any) => {
          if (data) {
            setTenant(data);
            document.title = `Admin — ${data.name}`;
          }
        });
    }
  }, []);

  if (!isLoading && adminUser) return <Navigate to="/admin" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await adminSignIn(email, password);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Invalid credentials. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-surface-white flex font-sans">
      {/* Left Side Image */}
      <div className="hidden lg:block w-1/2 relative bg-[#111827] overflow-hidden">
        {tenant?.store_settings?.branding?.admin_bg_url && (
          <img src={tenant.store_settings.branding.admin_bg_url} className="absolute inset-0 w-full h-full object-cover" alt="Admin Background" />
        )}
        <div className={`absolute inset-0 ${tenant?.store_settings?.branding?.admin_bg_url ? 'bg-black/60' : 'bg-gradient-to-t from-black/80 via-black/20 to-transparent'}`}></div>
        <div className="absolute bottom-16 left-16 right-16 text-white z-10">
          <h1 className="text-4xl font-serif mb-4 drop-shadow-md">
            {tenant?.name || 'Store'} Workspace
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-bold text-white/80">Secure Administration Portal</p>
        </div>
      </div>

      {/* Right Side Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-surface-white">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.32, 0.72, 0, 1] }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <div className="w-12 h-12 border border-brand-navy flex items-center justify-center rounded-full mx-auto mb-6">
              <Lock className="w-5 h-5 text-brand-navy" strokeWidth={1.5} />
            </div>
            <h2 className="text-3xl font-serif text-typography-primary mb-3">
              Admin Access
            </h2>
            <p className="text-[10px] uppercase tracking-widest text-typography-muted font-bold">
              Sign in to manage your storefront
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="admin@example.com"
                className="w-full border-b border-surface-light py-3 bg-transparent outline-none focus:border-brand-peach transition-colors text-xs text-typography-primary placeholder:text-typography-muted/50"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-[10px] uppercase tracking-widest text-typography-primary font-bold">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  placeholder="••••••••"
                  className="w-full border-b border-surface-light py-3 pr-10 bg-transparent outline-none focus:border-brand-peach transition-colors text-xs text-typography-primary placeholder:text-typography-muted/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-0 top-1/2 -translate-y-1/2 text-typography-muted hover:text-typography-primary transition-colors p-2"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-500 bg-red-50 border border-red-200 p-4 text-[10px] uppercase tracking-widest font-bold text-center"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="mt-6 flex items-center justify-center gap-2 bg-brand-navy text-white px-8 py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-peach transition-colors w-full disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {submitting ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer Text */}
          <div className="mt-12 text-center">
             <p className="text-[10px] text-typography-muted">
               Protected by advanced encryption. Unauthorized access is strictly prohibited.
             </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
