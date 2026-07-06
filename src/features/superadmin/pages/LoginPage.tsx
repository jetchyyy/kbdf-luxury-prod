import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, ShieldAlert } from 'lucide-react';
import { adminSignIn } from '../../admin/api/auth';
import { useAdminAuth } from '../../admin/context/AdminAuthContext';

export function SuperAdminLoginPage() {
  const { adminUser, isSuperadmin, isLoading } = useAdminAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated as superadmin, redirect to /odc dashboard
  if (!isLoading && adminUser && isSuperadmin) return <Navigate to="/odc" replace />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const response = await adminSignIn(email, password);
      
      const { data: userDetails, error: userError } = await (supabase as any)
        .from('admin_users')
        .select('is_superadmin')
        .eq('auth_id', response.user.id)
        .single();

      if (userError || !userDetails || !userDetails.is_superadmin) {
        throw new Error('Unauthorized. You do not have Superadmin privileges.');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid credentials. Access Denied.');
      // Sign out immediately to clean up sessions
      supabase.auth.signOut().catch(() => {});
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#07080c] flex items-center justify-center px-4">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#fb7a90]/5 blur-[120px]" />
        <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-[#2f4065]/10 blur-[120px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="bg-[#111827] border border-white/8 rounded-3xl p-8 shadow-2xl space-y-8">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#fb7a90] to-[#2f4065] flex items-center justify-center">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-white font-bold text-sm tracking-wider uppercase">Platform Admin</p>
              <p className="text-white/40 text-xs">EcomSaaS Superadmin Dashboard</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                placeholder="superadmin@ecomsaas.com"
                className="bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors font-mono"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Password</label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-[#07080c] border border-white/10 rounded-xl px-4 py-3 pr-11 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                >
                  {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-6 py-3 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed pt-3"
            >
              {submitting ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : null}
              {submitting ? 'Authenticating...' : 'Sign In to Superadmin'}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
}

// Import supabase internally so the inline details lookup works
import { supabase } from '../../../lib/supabase/supabaseClient';
