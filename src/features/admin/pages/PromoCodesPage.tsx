import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchPromoCodesPaginated, createPromoCode, updatePromoCode, deletePromoCode } from '../api/promo-codes';
import type { PromoCode } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, Trash2, Ticket } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { PromoCodeFormModal } from '../components/PromoCodeFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';

export function PromoCodesPage() {
  const { adminUser, tenant } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('promo_codes');
  const { showError, showConfirm } = useNotification();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Server States
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCode, setEditingCode] = useState<PromoCode | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (tenantId) {
      loadPromoCodes();
    }
  }, [tenantId, page, search, sortBy, sortDir]);

  async function loadPromoCodes() {
    setIsLoading(true);
    try {
      const res = await fetchPromoCodesPaginated({
        tenantId,
        page,
        pageSize,
        search,
        sortBy,
        sortDir
      });
      setPromoCodes(res.data);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error loading promo codes:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCode(payload: any) {
    if (editingCode) {
      await updatePromoCode(editingCode.id, payload);
    } else {
      await createPromoCode(payload);
    }
    await loadPromoCodes();
  }

  async function handleDeleteCode(id: string) {
    const confirmed = await showConfirm('Are you sure you want to delete this promo code permanently?');
    if (confirmed) {
      try {
        await deletePromoCode(id);
        await loadPromoCodes();
      } catch (err) {
        showError('Failed to delete promo code: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(codeObj: PromoCode) {
    setEditingCode(codeObj);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingCode(null);
    setIsModalOpen(true);
  }

  const columns: Column<PromoCode>[] = [
    {
      key: 'code',
      label: 'Promo Code',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-white bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg">
          {row.code}
        </span>
      ),
    },
    {
      key: 'discount_value',
      label: 'Discount',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-emerald-400">
          {row.discount_type === 'percentage' 
            ? `${Number(row.discount_value)}% OFF` 
            : `${currency}${Number(row.discount_value).toLocaleString()} OFF`}
        </span>
      ),
    },
    {
      key: 'used_count',
      label: 'Usage',
      render: (row) => (
        <span className="text-white/70 text-xs">
          {row.used_count} / {row.max_uses !== null ? row.max_uses : '∞'}
        </span>
      ),
    },
    {
      key: 'expires_at',
      label: 'Expires At',
      sortable: true,
      render: (row) => (
        <span className="text-white/40 text-xs">
          {row.expires_at 
            ? new Date(row.expires_at).toLocaleString() 
            : 'No Expiration'}
        </span>
      ),
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => {
        const isExpired = row.expires_at && new Date(row.expires_at) < new Date();
        const limitReached = row.max_uses !== null && row.used_count >= row.max_uses;
        const valid = row.is_active && !isExpired && !limitReached;

        return (
          <span className={`px-2 py-0.5 text-xs rounded-full border ${
            valid
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-red-500/10 text-red-400 border-red-500/20'
          }`}>
            {valid ? 'Active' : isExpired ? 'Expired' : limitReached ? 'Limit Reached' : 'Inactive'}
          </span>
        );
      },
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
              title="Edit Promo Code"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteCode(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Promo Code"
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
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Ticket className="w-5 h-5 text-[#fb7a90]" /> Promo Codes
          </h2>
          <p className="text-white/40 text-xs mt-0.5">Create discount codes for items, tracking validation times and usage caps.</p>
        </div>

        <PermissionGate module="promo_codes" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Promo Code
          </button>
        </PermissionGate>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={promoCodes}
        isLoading={isLoading}
        searchPlaceholder="Search promo code..."
        serverSide={true}
        totalCount={totalCount}
        currentPage={page}
        onPageChange={setPage}
        onSearchChange={setSearch}
        onSortChange={(key, dir) => {
          setSortBy(key);
          setSortDir(dir);
        }}
      />

      {/* Modals */}
      <PromoCodeFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCode}
        promoCode={editingCode}
        tenantId={tenantId!}
      />
    </div>
  );
}
