import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchAdminUsers, createAdminUser, updateAdminUser, deactivateAdminUser } from '../api/users';
import type { AdminUser } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, ShieldAlert } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { UserFormModal } from '../components/UserFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';

export function UsersPage() {
  const { adminUser } = useAdminUser();
  const { canEdit } = usePermissions('users');
  const { showSuccess, showError, showConfirm } = useNotification();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  useEffect(() => {
    if (tenantId) {
      loadUsers();
    }
  }, [tenantId]);

  async function loadUsers() {
    setIsLoading(true);
    try {
      const data = await fetchAdminUsers(tenantId);
      setUsers(data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveUser(payload: any, password?: string) {
    try {
      if (editingUser) {
        await updateAdminUser(editingUser.id, payload);
      } else {
        if (!password) throw new Error('Password is required');
        const { email, ...rest } = payload;
        const res = await createAdminUser(email, password, rest);
        if (res && (res as any).createdAutomatically === false) {
          showSuccess("Staff profile created successfully! \n\nNote: Auth account could not be auto-created (requires Service Role Key). Please manually create/invite user email '" + email + "' in your Supabase Auth dashboard. The profile will auto-link upon signup.");
        }
      }
      await loadUsers();
    } catch (err: any) {
      showError('Error saving user: ' + err.message);
      throw err;
    }
  }

  async function handleDeactivate(id: string) {
    const confirmed = await showConfirm('Are you sure you want to deactivate this staff user account? They will lose access immediately.');
    if (confirmed) {
      try {
        await deactivateAdminUser(id);
        await loadUsers();
      } catch (err) {
        showError('Failed to deactivate user: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(user: AdminUser) {
    setEditingUser(user);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingUser(null);
    setIsModalOpen(true);
  }

  const columns: Column<any>[] = [
    {
      key: 'full_name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.full_name}</p>
          {row.is_superadmin && (
            <span className="px-1 text-[8px] font-bold text-pink-400 bg-pink-400/10 border border-pink-400/20 rounded uppercase tracking-wider">
              Platform Superadmin
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (row) => <span className="text-white/60">{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => (
        <span className="text-[#fb7a90] font-medium">
          {row.roles?.name || 'No Role Assigned'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${
          row.is_active
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {row.is_active ? 'Active' : 'Deactivated'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => {
        // Prevent editing or deactivating yourself or superadmins
        const isSelf = row.id === adminUser?.id;
        const isProtected = row.is_superadmin || isSelf;

        return (
          <div className="flex items-center gap-2">
            {canEdit && !isProtected && (
              <button
                onClick={() => handleEditClick(row)}
                className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                title="Edit User Profile"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            )}
            {canEdit && !isProtected && row.is_active && (
              <button
                onClick={() => handleDeactivate(row.id)}
                className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                title="Deactivate Account"
              >
                <ShieldAlert className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
      width: '100px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">User Management</h2>
          <p className="text-white/40 text-xs mt-0.5">Manage store admins, managers, and staff accounts, including their specific module visibility.</p>
        </div>

        <PermissionGate module="users" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Staff User
          </button>
        </PermissionGate>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search staff name or email..."
      />

      {/* Modals */}
      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveUser}
        user={editingUser}
        tenantId={tenantId!}
      />
    </div>
  );
}
