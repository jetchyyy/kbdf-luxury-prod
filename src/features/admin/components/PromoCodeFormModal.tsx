import { useState, useEffect } from 'react';
import type { PromoCode } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';

interface PromoCodeFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  promoCode?: PromoCode | null;
  tenantId: string;
}

export function PromoCodeFormModal({ isOpen, onClose, onSave, promoCode, tenantId }: PromoCodeFormModalProps) {
  const [code, setCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed'>('percentage');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [maxUses, setMaxUses] = useState<string>('');
  const [expiresAt, setExpiresAt] = useState<string>('');
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      if (promoCode) {
        setCode(promoCode.code);
        setDiscountType(promoCode.discount_type);
        setDiscountValue(promoCode.discount_value);
        setMaxUses(promoCode.max_uses !== null ? String(promoCode.max_uses) : '');
        setExpiresAt(
          promoCode.expires_at 
            ? new Date(promoCode.expires_at).toISOString().slice(0, 16) 
            : ''
        );
        setIsActive(promoCode.is_active);
      } else {
        setCode('');
        setDiscountType('percentage');
        setDiscountValue(0);
        setMaxUses('');
        setExpiresAt('');
        setIsActive(true);
      }
    }
  }, [isOpen, promoCode]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!code.trim()) {
      setError('Promo code is required');
      setIsSubmitting(false);
      return;
    }

    if (discountValue <= 0) {
      setError('Discount value must be greater than zero');
      setIsSubmitting(false);
      return;
    }

    if (discountType === 'percentage' && discountValue > 100) {
      setError('Percentage discount cannot exceed 100%');
      setIsSubmitting(false);
      return;
    }

    try {
      const parsedMaxUses = maxUses.trim() !== '' ? parseInt(maxUses.trim(), 10) : null;
      const parsedExpiresAt = expiresAt.trim() !== '' ? new Date(expiresAt).toISOString() : null;

      const payload = {
        tenant_id: tenantId,
        code: code.trim().toUpperCase(),
        discount_type: discountType,
        discount_value: discountValue,
        max_uses: parsedMaxUses,
        expires_at: parsedExpiresAt,
        is_active: isActive,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save promo code');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl flex flex-col my-8">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {promoCode ? 'Edit Promo Code' : 'Add Promo Code'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
              {error}
            </div>
          )}

          {/* Code */}
          <div className="flex flex-col gap-2">
            <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Promo Code *</label>
            <input
              type="text"
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              required
              placeholder="e.g. SUMMER50"
              className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors uppercase"
            />
          </div>

          {/* Discount Type & Value */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Discount Type</label>
              <select
                value={discountType}
                onChange={e => {
                  setDiscountType(e.target.value as any);
                  setDiscountValue(0);
                }}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount</option>
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">
                Discount Value {discountType === 'percentage' ? '(%)' : '(Amount)'} *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={discountValue || ''}
                onChange={e => setDiscountValue(parseFloat(e.target.value))}
                required
                placeholder={discountType === 'percentage' ? '10' : '500'}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>
          </div>

          {/* Limits */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Max Usage Limit</label>
              <input
                type="number"
                min="1"
                value={maxUses}
                onChange={e => setMaxUses(e.target.value)}
                placeholder="Unlimited if empty"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Expiration Date</label>
              <input
                type="datetime-local"
                value={expiresAt}
                onChange={e => setExpiresAt(e.target.value)}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>
          </div>

          {/* Is Active Toggle */}
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isActive"
              checked={isActive}
              onChange={e => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-white/10 text-[#fb7a90] bg-transparent outline-none focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <label htmlFor="isActive" className="text-white/70 text-sm font-medium select-none cursor-pointer">
              Active & Usable at Storefront Checkout
            </label>
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
              {isSubmitting ? 'Saving...' : 'Save Promo Code'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
