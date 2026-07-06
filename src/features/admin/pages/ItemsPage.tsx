import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchItems, createItem, updateItem, deleteItem } from '../api/items';
import { fetchCategories } from '../api/categories';
import type { Item, Category } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, Trash2, Filter } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { ItemFormModal } from '../components/ItemFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function ItemsPage() {
  const { adminUser, tenant } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('items');
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedStock, setSelectedStock] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  useEffect(() => {
    if (tenantId) {
      loadData();
    }
  }, [tenantId]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [itemsData, categoriesData] = await Promise.all([
        fetchItems(tenantId),
        fetchCategories(tenantId)
      ]);
      setItems(itemsData);
      setCategories(categoriesData);
    } catch (err) {
      console.error('Error loading data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveItem(payload: any) {
    if (editingItem) {
      await updateItem(editingItem.id, payload);
    } else {
      await createItem(payload);
    }
    await loadData();
  }

  async function handleDeleteItem(id: string) {
    if (window.confirm('Are you sure you want to delete this item?')) {
      try {
        await deleteItem(id);
        await loadData();
      } catch (err) {
        alert('Failed to delete item: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(item: Item) {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingItem(null);
    setIsModalOpen(true);
  }

  // Apply frontend filters (DataTable does search)
  const filteredItems = items.filter(item => {
    const categoryMatch = selectedCategory === 'all' || item.category_id === selectedCategory;
    const stockMatch = selectedStock === 'all' || item.stock_status === selectedStock;
    const conditionMatch = selectedCondition === 'all' || item.condition === selectedCondition;
    return categoryMatch && stockMatch && conditionMatch;
  });

  const columns: Column<any>[] = [
    {
      key: 'image',
      label: 'Image',
      render: (row) => (
        <div className="w-10 h-10 rounded-lg bg-[#0f1117] border border-white/10 overflow-hidden flex items-center justify-center">
          {row.image_urls && row.image_urls[0] ? (
            <img src={row.image_urls[0]} alt={row.title} className="w-full h-full object-cover" />
          ) : (
            <span className="text-[10px] text-white/20">No Img</span>
          )}
        </div>
      ),
      width: '80px',
    },
    {
      key: 'title',
      label: 'Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-white">{row.title}</p>
          {row.sku && <p className="text-[11px] text-white/30">{row.sku}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => (
        <span className="text-white/60">
          {row.categories?.name || 'Uncategorized'}
        </span>
      ),
    },
    {
      key: 'price',
      label: 'Price',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-white">
          {currency}{Number(row.price).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'quantity',
      label: 'Qty',
      sortable: true,
      render: (row) => (
        <span className={row.quantity === 0 ? 'text-red-400 font-medium' : 'text-white/70'}>
          {row.quantity}
        </span>
      ),
    },
    {
      key: 'stock_status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        let badgeStyle = '';
        let label = '';
        switch (row.stock_status) {
          case 'in_stock':
            badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            label = 'In Stock';
            break;
          case 'low_stock':
            badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            label = 'Low Stock';
            break;
          case 'out_of_stock':
            badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
            label = 'Out of Stock';
            break;
        }
        return (
          <span className={`px-2 py-0.5 text-xs rounded-full border ${badgeStyle}`}>
            {label}
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
              title="Edit Item"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteItem(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Item"
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
          <h2 className="text-xl font-bold text-white">Products</h2>
          <p className="text-white/40 text-xs mt-0.5">Manage your items, prices, conditions and stock levels.</p>
        </div>

        <PermissionGate module="items" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Item
          </button>
        </PermissionGate>
      </div>

      {/* Filter panel */}
      <div className="bg-[#111827] border border-white/5 rounded-2xl p-4 flex flex-wrap gap-4 items-center">
        <div className="flex items-center gap-2 text-white/40 text-xs uppercase tracking-wider font-semibold">
          <Filter className="w-4 h-4" /> Filters
        </div>

        {/* Category Filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Stock Filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedStock}
            onChange={e => setSelectedStock(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Stock Statuses</option>
            <option value="in_stock">In Stock</option>
            <option value="low_stock">Low Stock</option>
            <option value="out_of_stock">Out of Stock</option>
          </select>
        </div>

        {/* Condition Filter */}
        <div className="flex flex-col gap-1">
          <select
            value={selectedCondition}
            onChange={e => setSelectedCondition(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Conditions</option>
            <option value="new">New</option>
            <option value="preloved_excellent">Preloved (Excellent)</option>
            <option value="preloved_good">Preloved (Good)</option>
            <option value="preloved_fair">Preloved (Fair)</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={filteredItems}
        isLoading={isLoading}
        searchPlaceholder="Search title, SKU or brand..."
        emptyMessage="No items matching your criteria."
      />

      {/* Modals */}
      <ItemFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveItem}
        item={editingItem}
        tenantId={tenantId!}
      />
    </div>
  );
}
