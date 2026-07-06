import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchCategoriesPaginated, createCategory, updateCategory, deleteCategory } from '../api/categories';
import type { Category } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { useNotification } from '../../../core/context/NotificationContext';

export function CategoriesPage() {
  const { adminUser } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('categories');
  const { showError, showConfirm } = useNotification();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Server States
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('sort_order');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    if (tenantId) {
      loadCategories();
    }
  }, [tenantId, page, search, sortBy, sortDir]);

  async function loadCategories() {
    setIsLoading(true);
    try {
      const res = await fetchCategoriesPaginated({
        tenantId,
        page,
        pageSize,
        search,
        sortBy,
        sortDir
      });
      setCategories(res.data);
      setTotalCount(res.totalCount);
    } catch (err) {
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveCategory(payload: any) {
    if (editingCategory) {
      await updateCategory(editingCategory.id, payload);
    } else {
      await createCategory(payload);
    }
    await loadCategories();
  }

  async function handleDeleteCategory(id: string) {
    const confirmed = await showConfirm('Are you sure you want to delete this category? All products under this category will have their category cleared.');
    if (confirmed) {
      try {
        await deleteCategory(id);
        await loadCategories();
      } catch (err) {
        showError('Failed to delete category: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(category: Category) {
    setEditingCategory(category);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingCategory(null);
    setIsModalOpen(true);
  }

  const columns: Column<Category>[] = [
    {
      key: 'image_url',
      label: 'Image',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-[#0f1117] border border-white/10 overflow-hidden flex items-center justify-center">
          {row.image_url ? (
            <img src={row.image_url} alt={row.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-white/20 font-medium">No Image</span>
          )}
        </div>
      ),
      width: '80px',
    },
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.name}</p>
          {row.description && <p className="text-[11px] text-white/30 truncate max-w-[250px]">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'slug',
      label: 'Slug',
      sortable: true,
      render: (row) => <span className="font-mono text-xs text-white/50">{row.slug}</span>,
    },
    {
      key: 'sort_order',
      label: 'Sort Order',
      sortable: true,
      render: (row) => <span className="text-white/70">{row.sort_order}</span>,
    },
    {
      key: 'is_active',
      label: 'Status',
      sortable: true,
      render: (row) => (
        <span className={`px-2 py-0.5 text-xs rounded-full border ${
          row.is_active
            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            : 'bg-white/5 text-white/30 border-white/5'
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
          {canEdit && (
            <button
              onClick={() => handleEditClick(row)}
              className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
              title="Edit Category"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteCategory(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Category"
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
          <h2 className="text-xl font-bold text-white">Categories</h2>
          <p className="text-white/40 text-xs mt-0.5">Manage the product collections and sorting order for your storefront filters.</p>
        </div>

        <PermissionGate module="categories" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </PermissionGate>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={categories}
        isLoading={isLoading}
        searchPlaceholder="Search category name or slug..."
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
      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        tenantId={tenantId!}
      />
    </div>
  );
}
