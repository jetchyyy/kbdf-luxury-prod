import { useState, useEffect } from 'react';
import type { Role, PermissionModule, PermissionAction } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';

interface RoleFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (roleData: any) => Promise<void>;
  role?: Role | null;
  tenantId: string;
}

const MODULES: { key: PermissionModule; label: string; actions: PermissionAction[] }[] = [
  { key: 'overview', label: 'Overview', actions: ['read'] },
  { key: 'analytics', label: 'Analytics', actions: ['read'] },
  { key: 'items', label: 'Items / Products', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'categories', label: 'Categories', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'users', label: 'Users / Staff', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'roles', label: 'Roles', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'leads', label: 'Leads / Contacts', actions: ['read', 'edit', 'delete'] },
  { key: 'expenses', label: 'Expense Tracker', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'payment_methods', label: 'Payment Methods & QR', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'promo_codes', label: 'Promo Codes', actions: ['create', 'read', 'edit', 'delete'] },
  { key: 'settings', label: 'Settings', actions: ['read', 'edit'] },
];

export function RoleFormModal({ isOpen, onClose, onSave, role, tenantId }: RoleFormModalProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState<Record<string, Record<string, boolean>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (role) {
        setName(role.name);
        setDescription(role.description || '');
        const rolePermissions = (role.permissions as any) || {};
        setPermissions(rolePermissions);
      } else {
        setName('');
        setDescription('');
        // Initialize default permissions structure
        const defaultPerms: Record<string, Record<string, boolean>> = {};
        MODULES.forEach(mod => {
          defaultPerms[mod.key] = {};
          mod.actions.forEach(act => {
            defaultPerms[mod.key][act] = false;
          });
        });
        setPermissions(defaultPerms);
      }
      setError('');
    }
  }, [isOpen, role]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Role name is required');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        tenant_id: tenantId,
        name: name.trim(),
        description: description.trim() || null,
        permissions,
        is_system_role: role ? role.is_system_role : false,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save role');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCheckboxChange(moduleKey: string, actionKey: string, checked: boolean) {
    setPermissions(prev => ({
      ...prev,
      [moduleKey]: {
        ...(prev[moduleKey] || {}),
        [actionKey]: checked
      }
    }));
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {role ? 'Edit Role' : 'Add Role'}
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

          {/* Name & Description */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Role Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                disabled={role?.is_system_role}
                placeholder="Manager"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors disabled:opacity-50"
              />
              {role?.is_system_role && (
                <p className="text-[10px] text-amber-400">System roles cannot change names.</p>
              )}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Description</label>
              <input
                type="text"
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Can manage items and categories only"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>
          </div>

          {/* Permissions Matrix */}
          <div className="space-y-4">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider block">Permissions Matrix</label>
            <div className="border border-white/5 rounded-xl overflow-hidden bg-[#0f1117]">
              <div className="grid grid-cols-5 bg-white/5 px-4 py-2 text-[10px] font-semibold text-white/40 uppercase tracking-wider border-b border-white/5">
                <div className="col-span-1">Module</div>
                <div className="text-center">Read</div>
                <div className="text-center">Create</div>
                <div className="text-center">Edit</div>
                <div className="text-center">Delete</div>
              </div>

              <div className="divide-y divide-white/5">
                {MODULES.map(mod => (
                  <div key={mod.key} className="grid grid-cols-5 px-4 py-3 text-sm items-center text-white/80">
                    <div className="col-span-1 font-medium">{mod.label}</div>
                    
                    {/* Read */}
                    <div className="flex justify-center">
                      {mod.actions.includes('read') ? (
                        <input
                          type="checkbox"
                          checked={permissions[mod.key]?.['read'] || false}
                          onChange={e => handleCheckboxChange(mod.key, 'read', e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>

                    {/* Create */}
                    <div className="flex justify-center">
                      {mod.actions.includes('create') ? (
                        <input
                          type="checkbox"
                          checked={permissions[mod.key]?.['create'] || false}
                          onChange={e => handleCheckboxChange(mod.key, 'create', e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>

                    {/* Edit */}
                    <div className="flex justify-center">
                      {mod.actions.includes('edit') ? (
                        <input
                          type="checkbox"
                          checked={permissions[mod.key]?.['edit'] || false}
                          onChange={e => handleCheckboxChange(mod.key, 'edit', e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>

                    {/* Delete */}
                    <div className="flex justify-center">
                      {mod.actions.includes('delete') ? (
                        <input
                          type="checkbox"
                          checked={permissions[mod.key]?.['delete'] || false}
                          onChange={e => handleCheckboxChange(mod.key, 'delete', e.target.checked)}
                          className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
                        />
                      ) : (
                        <span className="text-white/10">—</span>
                      )}
                    </div>
                  </div>
                ))}
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
              {isSubmitting ? 'Saving...' : 'Save Role'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
