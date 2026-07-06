import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchExpenses, createExpense, updateExpense, deleteExpense } from '../api/expenses';
import type { Expense } from '../../../lib/supabase/database.types';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { Plus, Edit2, Trash2, Receipt, Calendar, Tag, ArrowUpRight } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { ExpenseFormModal } from '../components/ExpenseFormModal';
import { StatsCard } from '../components/StatsCard';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function ExpensesPage() {
  const { adminUser, tenant } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('expenses');
  const [expenses, setExpenses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Summary Metrics
  const [totalMonth, setTotalMonth] = useState(0);
  const [totalYear, setTotalYear] = useState(0);
  const [averageMonthly, setAverageMonthly] = useState(0);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  useEffect(() => {
    if (tenantId) {
      loadExpenses();
    }
  }, [tenantId]);

  async function loadExpenses() {
    setIsLoading(true);
    try {
      const data = await fetchExpenses(tenantId);
      setExpenses(data);
      calculateSummary(data);
    } catch (err) {
      console.error('Error loading expenses:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function calculateSummary(list: any[]) {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    let monthSum = 0;
    let yearSum = 0;
    const monthlyBuckets: Record<string, number> = {};

    list.forEach(e => {
      const amt = Number(e.amount);
      const eDate = new Date(e.date);
      const eYear = eDate.getFullYear();
      const eMonth = eDate.getMonth();

      if (eYear === currentYear) {
        yearSum += amt;
        if (eMonth === currentMonth) {
          monthSum += amt;
        }
      }

      const key = `${eYear}-${eMonth}`;
      monthlyBuckets[key] = (monthlyBuckets[key] || 0) + amt;
    });

    const monthsCount = Object.keys(monthlyBuckets).length || 1;

    setTotalMonth(monthSum);
    setTotalYear(yearSum);
    setAverageMonthly(yearSum / Math.max(1, monthsCount));
  }

  async function handleSaveExpense(payload: any) {
    // Add created_by if we are creating
    if (editingExpense) {
      await updateExpense(editingExpense.id, payload);
    } else {
      await createExpense({
        ...payload,
        created_by: adminUser?.id || null
      });
    }
    await loadExpenses();
  }

  async function handleDeleteExpense(id: string) {
    if (window.confirm('Are you sure you want to delete this expense record?')) {
      try {
        await deleteExpense(id);
        await loadExpenses();
      } catch (err) {
        alert('Failed to delete expense: ' + (err as any).message);
      }
    }
  }

  function handleEditClick(expense: Expense) {
    setEditingExpense(expense);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingExpense(null);
    setIsModalOpen(true);
  }

  const columns: Column<any>[] = [
    {
      key: 'title',
      label: 'Expense Title',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.title}</p>
          {row.description && <p className="text-[11px] text-white/30 truncate max-w-[200px]">{row.description}</p>}
        </div>
      ),
    },
    {
      key: 'category',
      label: 'Category',
      render: (row) => {
        const cat = row.expense_categories;
        return (
          <span
            className="px-2 py-0.5 text-xs rounded-full border"
            style={{
              color: cat?.color || '#a1a1aa',
              borderColor: `${cat?.color || '#27272a'}40`,
              backgroundColor: `${cat?.color || '#27272a'}10`,
            }}
          >
            {cat?.name || 'Uncategorized'}
          </span>
        );
      },
    },
    {
      key: 'amount',
      label: 'Amount',
      sortable: true,
      render: (row) => (
        <span className="font-bold text-white">
          {currency}{Number(row.amount).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'date',
      label: 'Date',
      sortable: true,
      render: (row) => (
        <span className="text-white/60 text-xs">
          {new Date(row.date).toLocaleDateString()}
        </span>
      ),
      width: '120px',
    },
    {
      key: 'receipt_url',
      label: 'Receipt',
      render: (row) => (
        row.receipt_url ? (
          <a
            href={row.receipt_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#fb7a90] hover:text-[#f16881] text-xs font-semibold inline-flex items-center gap-1 hover:underline"
          >
            View <ArrowUpRight className="w-3.5 h-3.5" />
          </a>
        ) : (
          <span className="text-white/20 text-xs">No Receipt</span>
        )
      ),
      width: '100px',
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
              title="Edit Expense Record"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => handleDeleteExpense(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Record"
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
          <h2 className="text-xl font-bold text-white">Expense Tracker</h2>
          <p className="text-white/40 text-xs mt-0.5">Log operational costs, supplier payments, shipping costs, and utility expenses.</p>
        </div>

        <PermissionGate module="expenses" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Record Expense
          </button>
        </PermissionGate>
      </div>

      {/* Metrics Summary Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard
          label="This Month's Spending"
          value={`${currency}${totalMonth.toLocaleString()}`}
          icon={Receipt}
          color="pink"
        />
        <StatsCard
          label="This Year's Spending"
          value={`${currency}${totalYear.toLocaleString()}`}
          icon={Calendar}
          color="blue"
        />
        <StatsCard
          label="Average Monthly Spending"
          value={`${currency}${averageMonthly.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
          icon={Tag}
          color="purple"
        />
      </div>

      {/* Main Table */}
      <DataTable
        columns={columns}
        data={expenses}
        isLoading={isLoading}
        searchPlaceholder="Search expense records..."
      />

      {/* Modals */}
      <ExpenseFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveExpense}
        expense={editingExpense}
        tenantId={tenantId!}
      />
    </div>
  );
}
