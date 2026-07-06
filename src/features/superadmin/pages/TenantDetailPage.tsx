import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { fetchTenantById, updateTenant, deleteTenant } from '../api/tenants';
import { fetchItems } from '../../admin/api/items';
import { fetchAdminUsers, createAdminUser, updateAdminUser, deactivateAdminUser } from '../../admin/api/users';
import type { Tenant, Item, AdminUser } from '../../../lib/supabase/database.types';
import { Globe, ArrowLeft, Package, Users, Plus, Edit2, Trash2 } from 'lucide-react';
import { DataTable } from '../../admin/components/DataTable';
import type { Column } from '../../admin/components/DataTable';
import { EnvGenerator } from '../components/EnvGenerator';
import { UserFormModal } from '../../admin/components/UserFormModal';
import { useNotification } from '../../../core/context/NotificationContext';

export function TenantDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [staff, setStaff] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { showSuccess, showError, showConfirm } = useNotification();

  // Edit branding state
  const [primaryColor, setPrimaryColor] = useState('');
  const [accentColor, setAccentColor] = useState('');
  const [isSavingBranding, setIsSavingBranding] = useState(false);

  // User management modal state
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<AdminUser | null>(null);

  useEffect(() => {
    if (id) {
      loadTenantData();
    }
  }, [id]);

  async function loadTenantData() {
    setIsLoading(true);
    try {
      const tenantData = await fetchTenantById(id!);
      setTenant(tenantData);
      setPrimaryColor(tenantData.primary_color || '#2f4065');
      setAccentColor(tenantData.accent_color || '#fb7a90');

      // Fetch tenant items and users (scoped by tenantId)
      const [itemsData, staffData] = await Promise.all([
        fetchItems(id!),
        fetchAdminUsers(id!)
      ]);
      setItems(itemsData);
      setStaff(staffData);
    } catch (err) {
      console.error('Error fetching tenant details:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleToggleActive() {
    if (!tenant) return;
    const confirmMsg = tenant.is_active
      ? 'Deactivate this tenant? Storefront will become offline.'
      : 'Activate this tenant? Storefront will become online.';
    const confirmed = await showConfirm(confirmMsg);
    if (confirmed) {
      try {
        const updated = await updateTenant(tenant.id, { is_active: !tenant.is_active });
        setTenant(updated);
        showSuccess(`Tenant status updated to: ${!tenant.is_active ? 'Active' : 'Inactive'}`);
      } catch (err) {
        showError('Failed to update tenant status');
      }
    }
  }

  async function handleSaveBranding(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    setIsSavingBranding(true);
    try {
      const updated = await updateTenant(tenant.id, {
        primary_color: primaryColor,
        accent_color: accentColor,
      });
      setTenant(updated);
      showSuccess('Branding colors updated successfully.');
    } catch (err) {
      showError('Failed to save branding changes.');
    } finally {
      setIsSavingBranding(false);
    }
  }

  async function handleDeleteStore() {
    if (!tenant) return;
    const confirmed = await showConfirm('WARNING: Are you absolutely sure you want to delete this tenant and all associated data? This action is irreversible.');
    if (confirmed) {
      try {
        await deleteTenant(tenant.id);
        navigate('/odc/tenants');
      } catch (err) {
        showError('Failed to delete tenant storefront: ' + (err as any).message);
      }
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
      const staffData = await fetchAdminUsers(id!);
      setStaff(staffData);
    } catch (err: any) {
      showError('Error saving staff user: ' + err.message);
      throw err;
    }
  }

  async function handleDeactivateUser(userId: string) {
    const confirmed = await showConfirm('Are you sure you want to deactivate this staff user account? They will lose access immediately.');
    if (confirmed) {
      try {
        await deactivateAdminUser(userId);
        const staffData = await fetchAdminUsers(id!);
        setStaff(staffData);
      } catch (err: any) {
        showError('Failed to deactivate user: ' + err.message);
      }
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-8 h-8 border-2 border-[#fb7a90] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!tenant) {
    return (
      <div className="text-center py-12 space-y-4">
        <h2 className="text-xl font-bold text-red-400">Tenant Not Found</h2>
        <Link to="/odc/tenants" className="text-[#fb7a90] inline-flex items-center gap-1.5 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to Tenants
        </Link>
      </div>
    );
  }

  const itemColumns: Column<Item>[] = [
    {
      key: 'title',
      label: 'Product Name',
      render: (row) => <span className="font-semibold text-white">{row.title}</span>,
    },
    {
      key: 'price',
      label: 'Price',
      render: (row) => <span>{tenant.currency_symbol}{Number(row.price).toLocaleString()}</span>,
    },
    {
      key: 'quantity',
      label: 'Quantity',
      render: (row) => <span>{row.quantity}</span>,
    },
    {
      key: 'stock_status',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${
          row.stock_status === 'in_stock'
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : row.stock_status === 'low_stock'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {row.stock_status.toUpperCase()}
        </span>
      ),
    },
  ];

  const staffColumns: Column<any>[] = [
    {
      key: 'full_name',
      label: 'Full Name',
      render: (row) => <span className="font-semibold text-white">{row.full_name}</span>,
    },
    {
      key: 'email',
      label: 'Email Address',
      render: (row) => <span className="text-white/60">{row.email}</span>,
    },
    {
      key: 'role',
      label: 'Role',
      render: (row) => <span className="text-[#fb7a90]">{row.roles?.name || 'Store Owner/Admin'}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${
          row.is_active ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
        }`}>
          {row.is_active ? 'Active' : 'Inactive'}
        </span>
      ),
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setEditingUser(row);
              setIsUserModalOpen(true);
            }}
            className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
            title="Edit Admin/Staff"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          {row.is_active && (
            <button
              onClick={() => handleDeactivateUser(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Deactivate Account"
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
      {/* Header breadcrumb */}
      <div>
        <Link to="/odc/tenants" className="text-white/40 hover:text-white text-xs inline-flex items-center gap-1.5 transition-all">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Tenant Listing
        </Link>
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5 text-white/70 overflow-hidden flex-shrink-0">
              {tenant.logo_url ? (
                <img src={tenant.logo_url} alt="logo" className="w-full h-full object-cover" />
              ) : (
                <Globe className="w-5 h-5" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{tenant.name}</h2>
              <p className="text-white/40 text-xs font-mono">Store slug: {tenant.slug}</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <EnvGenerator tenant={tenant} />
            <button
              onClick={handleToggleActive}
              className={`px-4 py-2 rounded-xl text-xs font-semibold border transition-all ${
                tenant.is_active
                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20'
                  : 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20'
              }`}
            >
              {tenant.is_active ? 'Deactivate Storefront' : 'Activate Storefront'}
            </button>
            <button
              onClick={handleDeleteStore}
              className="px-4 py-2 rounded-xl text-xs font-semibold border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-all"
            >
              Delete Store
            </button>
          </div>
        </div>
      </div>

      {/* Grid: metadata and color theme configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Branding Configuration */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 space-y-4 md:col-span-1">
          <h3 className="text-white font-semibold text-sm border-b border-white/5 pb-2">Branding Override</h3>
          <form onSubmit={handleSaveBranding} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Primary Theme</label>
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

            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Accent Theme</label>
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

            <button
              type="submit"
              disabled={isSavingBranding}
              className="w-full bg-[#fb7a90] hover:bg-[#f16881] text-white text-xs font-semibold py-2 rounded-xl transition-all"
            >
              {isSavingBranding ? 'Saving...' : 'Save Theme Override'}
            </button>
          </form>
        </div>

        {/* Catalog overview */}
        <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 md:col-span-2 space-y-4">
          <div className="flex items-center gap-2 border-b border-white/5 pb-2">
            <Package className="w-4 h-4 text-white/40" />
            <h3 className="text-white font-semibold text-sm">Products Catalog</h3>
          </div>
          <DataTable
            columns={itemColumns}
            data={items}
            pageSize={5}
            searchable={false}
            emptyMessage="Store catalog is empty."
          />
        </div>

      </div>

      {/* Staff listing */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between border-b border-white/5 pb-2">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-white/40" />
            <h3 className="text-white font-semibold text-sm">Store Administrative Staff</h3>
          </div>
          <button
            onClick={() => {
              setEditingUser(null);
              setIsUserModalOpen(true);
            }}
            className="flex items-center gap-1.5 bg-[#fb7a90] hover:bg-[#f16881] text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Admin/Staff Account
          </button>
        </div>
        <DataTable
          columns={staffColumns}
          data={staff}
          pageSize={5}
          searchable={false}
          emptyMessage="No administrative staff registered."
        />
      </div>

      {/* User Form Modal */}
      <UserFormModal
        isOpen={isUserModalOpen}
        onClose={() => {
          setIsUserModalOpen(false);
          setEditingUser(null);
        }}
        onSave={handleSaveUser}
        user={editingUser}
        tenantId={tenant.id}
      />
    </div>
  );
}
