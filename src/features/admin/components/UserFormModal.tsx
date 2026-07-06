import { useState, useEffect } from 'react';
import type { AdminUser, Role } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';
import { fetchRoles } from '../api/roles';

interface UserFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any, password?: string) => Promise<void>;
  user?: AdminUser | null;
  tenantId: string;
}

const ACCESS_MODULES = [
  { key: 'access_overview', label: 'Overview' },
  { key: 'access_analytics', label: 'Analytics' },
  { key: 'access_items', label: 'Item Management' },
  { key: 'access_users', label: 'User Management' },
  { key: 'access_settings', label: 'Settings' },
  { key: 'access_leads', label: 'Lead Management' },
  { key: 'access_expenses', label: 'Expense Tracker' },
  { key: 'access_categories', label: 'Categories' },
  { key: 'access_roles', label: 'Roles' },
  { key: 'access_payment_methods', label: 'Payment Methods & QR' },
];

export function UserFormModal({ isOpen, onClose, onSave, user, tenantId }: UserFormModalProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [roleId, setRoleId] = useState('');
  const [roles, setRoles] = useState<Role[]>([]);
  const [isActive, setIsActive] = useState(true);

  // Checkbox module accesses
  const [access, setAccess] = useState<Record<string, boolean>>({});
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      fetchRoles(tenantId).then(setRoles).catch(err => console.error('Error loading roles:', err));

      if (user) {
        setFullName(user.full_name);
        setEmail(user.email);
        setPassword('');
        setRoleId(user.role_id || '');
        setIsActive(user.is_active);
        
        const loadedAccess: Record<string, boolean> = {};
        ACCESS_MODULES.forEach(mod => {
          loadedAccess[mod.key] = (user as any)[mod.key] || false;
        });
        setAccess(loadedAccess);
      } else {
        setFullName('');
        setEmail('');
        setPassword('');
        setRoleId('');
        setIsActive(true);
        
        const defaultAccess: Record<string, boolean> = {};
        ACCESS_MODULES.forEach(mod => {
          defaultAccess[mod.key] = false;
        });
        setAccess(defaultAccess);
      }
      setError('');
    }
  }, [isOpen, user, tenantId]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!fullName.trim()) {
      setError('Full name is required');
      setIsSubmitting(false);
      return;
    }
    if (!email.trim()) {
      setError('Email is required');
      setIsSubmitting(false);
      return;
    }
    if (!user && !password) {
      setError('Password is required for new accounts');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        tenant_id: tenantId,
        full_name: fullName.trim(),
        role_id: roleId || null,
        is_active: isActive,
        ...access
      };

      if (user) {
        // Edit existing user profile
        await onSave(payload);
      } else {
        // Create new auth user + profile
        await onSave({ ...payload, email: email.trim() }, password);
      }
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save staff user');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckboxChange(key: string, checked: boolean) {
    setAccess(prev => ({
      ...prev,
      [key]: checked
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {user ? 'Edit Staff User' : 'Add Staff User'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Full Name & Email */}
          <div className="grid grid-cols-1 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Full Name *</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required
                placeholder="John Doe"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                disabled={!!user}
                placeholder="staff@store.com"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
              />
            </div>

            {/* Password (Only for new user creation) */}
            {!user && (
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Role selection */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Role</label>
              <select
                value={roleId}
                onChange={e => setRoleId(e.target.value)}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="">No Role Assigned</option>
                {roles.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </select>
            </div>

            {/* Status toggle */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Account Status</label>
              <div className="flex items-center h-full">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={e => setIsActive(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fb7a90]"></div>
                  <span className="ml-3 text-sm font-medium text-white/70">{isActive ? 'Active' : 'Deactivated'}</span>
                </label>
              </div>
            </div>
          </div>

          {/* Module Access Checkboxes */}
          <div className="space-y-3">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">Module Visibility Access</label>
            <div className="grid grid-cols-2 gap-3 bg-[#0f1117] p-4 rounded-xl border border-white/5">
              {ACCESS_MODULES.map(mod => (
                <label key={mod.key} className="flex items-center gap-3 text-sm text-white/80 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={access[mod.key] || false}
                    onChange={e => handleCheckboxChange(mod.key, e.target.checked)}
                    className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                  />
                  {mod.label}
                </label>
              ))}
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
              {isSubmitting ? 'Saving...' : 'Save User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
