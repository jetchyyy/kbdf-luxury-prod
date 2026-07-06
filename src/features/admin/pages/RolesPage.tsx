import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchRoles, createRole, updateRole, deleteRole } from '../api/roles';
import type { Role } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { RoleFormModal } from '../components/RoleFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';

export function RolesPage() {
  const { adminUser } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('roles');
  const { showError, showConfirm } = useNotification();
  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  useEffect(() => {
    if (tenantId) {
      loadRoles();
    }
  }, [tenantId]);

  async function loadRoles() {
    setIsLoading(true);
    try {
      const data = await fetchRoles(tenantId);
      setRoles(data);
    } catch (err) {
      console.error('Error loading roles:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveRole(payload: any) {
    if (editingRole) {
      await updateRole(editingRole.id, payload);
    } else {
      await createRole(payload);
    }
    await loadRoles();
  }

  async function handleDeleteRole(id: string) {
    const confirmed = await showConfirm('Are you sure you want to delete this role? All staff users with this role will be updated to no role.');
    if (confirmed) {
      try {
        await deleteRole(id);
        await loadRoles();
      } catch (err) {
        showError('Failed to delete role: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(role: Role) {
    setEditingRole(role);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingRole(null);
    setIsModalOpen(true);
  }

  const columns: Column<Role>[] = [
    {
      key: 'name',
      label: 'Role Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-white">{row.name}</span>
          {row.is_system_role && (
            <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold text-amber-400 bg-amber-400/10 border border-amber-400/20 rounded uppercase tracking-wider">
              System
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'description',
      label: 'Description',
      render: (row) => <span className="text-white/60">{row.description || 'No description provided'}</span>,
    },
    {
      key: 'created_at',
      label: 'Created At',
      sortable: true,
      render: (row) => (
        <span className="text-white/40 text-xs">
          {new Date(row.created_at).toLocaleDateString()}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canEdit && (
            <button
              onClick={() => handleEditClick(row)}
              className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              title="Edit Role"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && !row.is_system_role && (
            <button
              onClick={() => handleDeleteRole(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Role"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '100px',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Role Management</h2>
          <p className="text-white/40 text-xs mt-0.5">Configure access-control roles with customized read, write, and delete permissions per module.</p>
        </div>

        <PermissionGate module="roles" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Role
          </button>
        </PermissionGate>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={roles}
        isLoading={isLoading}
        searchPlaceholder="Search roles..."
      />

      {/* Modals */}
      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveRole}
        role={editingRole}
        tenantId={tenantId!}
      />
    </div>
  );
}
