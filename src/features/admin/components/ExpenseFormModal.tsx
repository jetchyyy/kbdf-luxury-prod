import { useState, useEffect } from 'react';
import type { Expense, ExpenseCategory } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';
import { fetchExpenseCategories, createExpenseCategory } from '../api/expenses';

interface ExpenseFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (expensePayload: any, customCategoryName?: string) => Promise<void>;
  expense?: Expense | null;
  tenantId: string;
}

export function ExpenseFormModal({ isOpen, onClose, onSave, expense, tenantId }: ExpenseFormModalProps) {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [receiptUrl, setReceiptUrl] = useState('');
  
  // Category state
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [isCustomCategory, setIsCustomCategory] = useState(false);
  const [customCategoryName, setCustomCategoryName] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadCategories();

      if (expense) {
        setTitle(expense.title);
        setAmount(Number(expense.amount));
        setDate(expense.date);
        setDescription(expense.description || '');
        setReceiptUrl(expense.receipt_url || '');
        setCategoryId(expense.category_id || '');
        setIsCustomCategory(false);
        setCustomCategoryName('');
      } else {
        setTitle('');
        setAmount('');
        setDate(new Date().toISOString().split('T')[0]);
        setDescription('');
        setReceiptUrl('');
        setCategoryId('');
        setIsCustomCategory(false);
        setCustomCategoryName('');
      }
      setError('');
    }
  }, [isOpen, expense]);

  async function loadCategories() {
    try {
      const data = await fetchExpenseCategories(tenantId);
      setCategories(data);
    } catch (err) {
      console.error('Error loading expense categories:', err);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!title.trim()) {
      setError('Title is required');
      setIsSubmitting(false);
      return;
    }
    if (!amount || Number(amount) <= 0) {
      setError('Amount must be greater than 0');
      setIsSubmitting(false);
      return;
    }
    if (!date) {
      setError('Date is required');
      setIsSubmitting(false);
      return;
    }
    if (isCustomCategory && !customCategoryName.trim()) {
      setError('Custom category name is required');
      setIsSubmitting(false);
      return;
    }
    if (!isCustomCategory && !categoryId) {
      setError('Please select a category or enter a custom one');
      setIsSubmitting(false);
      return;
    }

    try {
      let finalCategoryId = categoryId;

      // Handle inline custom category creation
      if (isCustomCategory && customCategoryName.trim()) {
        // Create new category
        const newCat = await createExpenseCategory({
          tenant_id: tenantId,
          name: customCategoryName.trim(),
          color: '#fb7a90', // Default color, can edit later
          is_predefined: false
        });
        finalCategoryId = newCat.id;
      }

      const payload = {
        tenant_id: tenantId,
        category_id: finalCategoryId || null,
        title: title.trim(),
        amount: Number(amount),
        date,
        description: description.trim() || null,
        receipt_url: receiptUrl.trim() || null,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save expense');
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {expense ? 'Edit Expense Record' : 'Record Expense'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Title */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Expense Title *</label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              required
              placeholder="e.g. Paid Courier/Shipping Fee"
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Amount (PHP) *</label>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                required
                min="0.01"
                step="0.01"
                placeholder="500"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Date */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Date *</label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>
          </div>

          {/* Category Selector */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Category *</label>
              <button
                type="button"
                onClick={() => {
                  setIsCustomCategory(!isCustomCategory);
                  setError('');
                }}
                className="text-xs text-[#fb7a90] hover:text-[#f16881] font-semibold"
              >
                {isCustomCategory ? 'Select Existing' : 'Enter Custom'}
              </button>
            </div>

            {isCustomCategory ? (
              <input
                type="text"
                value={customCategoryName}
                onChange={e => setCustomCategoryName(e.target.value)}
                required
                placeholder="Enter custom category name..."
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            ) : (
              <select
                value={categoryId}
                onChange={e => setCategoryId(e.target.value)}
                required
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="">Select Category</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Description</label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows={2}
              placeholder="Provide a brief explanation of the expense..."
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors resize-none"
            />
          </div>

          {/* Receipt URL */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Receipt Link / URL</label>
            <input
              type="url"
              value={receiptUrl}
              onChange={e => setReceiptUrl(e.target.value)}
              placeholder="https://drive.google.com/..."
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
            />
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
              {isSubmitting ? 'Recording...' : 'Record Expense'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
