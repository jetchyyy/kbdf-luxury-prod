import { useState, useEffect } from 'react';
import type { PaymentMethod } from '../../../lib/supabase/database.types';
import { X } from 'lucide-react';
import { ImageUploadInput } from './ImageUploadInput';

interface PaymentMethodFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (payload: any) => Promise<void>;
  paymentMethod?: PaymentMethod | null;
  tenantId: string;
}

export function PaymentMethodFormModal({ isOpen, onClose, onSave, paymentMethod, tenantId }: PaymentMethodFormModalProps) {
  const [name, setName] = useState('');
  const [type, setType] = useState<'qr' | 'bank_transfer' | 'cod' | 'custom'>('qr');
  const [accountName, setAccountName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [instructions, setInstructions] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      if (paymentMethod) {
        setName(paymentMethod.name);
        setType(paymentMethod.type);
        setAccountName(paymentMethod.account_name || '');
        setAccountNumber(paymentMethod.account_number || '');
        setQrCodeUrl(paymentMethod.qr_code_url || '');
        setInstructions(paymentMethod.instructions || '');
        setSortOrder(paymentMethod.sort_order);
        setIsActive(paymentMethod.is_active);
      } else {
        setName('');
        setType('qr');
        setAccountName('');
        setAccountNumber('');
        setQrCodeUrl('');
        setInstructions('');
        setSortOrder(0);
        setIsActive(true);
      }
      setError('');
    }
  }, [isOpen, paymentMethod]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!name.trim()) {
      setError('Payment method name is required');
      setIsSubmitting(false);
      return;
    }

    if (type === 'qr' && !qrCodeUrl.trim()) {
      setError('QR Code image upload is required for QR-type payment methods');
      setIsSubmitting(false);
      return;
    }

    try {
      const payload = {
        tenant_id: tenantId,
        name: name.trim(),
        type,
        account_name: accountName.trim() || null,
        account_number: accountNumber.trim() || null,
        qr_code_url: type === 'qr' ? qrCodeUrl.trim() : null,
        instructions: instructions.trim() || null,
        sort_order: sortOrder,
        is_active: isActive,
      };

      await onSave(payload);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to save payment method');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
          <h3 className="text-white font-semibold text-lg">
            {paymentMethod ? 'Edit Payment Method' : 'Add Payment Method'}
          </h3>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          {/* Scrollable Form Body */}
          <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 max-h-[60vh] no-scrollbar">
            {error && (
              <div className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                {error}
              </div>
            )}

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Method Name *</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                placeholder="e.g. GCash QR, Maya QR, Bank Transfer"
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
              />
            </div>

            {/* Type Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Type</label>
              <select
                value={type}
                onChange={e => setType(e.target.value as any)}
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
              >
                <option value="qr">QR Code (GCash, Maya, etc.)</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="cod">Cash on Delivery (COD)</option>
                <option value="custom">Custom Method</option>
              </select>
            </div>

            {/* Conditional input fields based on type */}
            {type !== 'cod' && (
              <>
                {/* Account Name */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Account Name</label>
                  <input
                    type="text"
                    value={accountName}
                    onChange={e => setAccountName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>

                {/* Account Number */}
                <div className="flex flex-col gap-2">
                  <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Account / Phone Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="e.g. 0917-123-4567 or 1234-5678-90"
                    className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors"
                  />
                </div>
              </>
            )}

            {/* QR Code image Upload */}
            {type === 'qr' && (
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">QR Code Photo / Image *</label>
                <ImageUploadInput
                  value={qrCodeUrl}
                  onChange={setQrCodeUrl}
                  tenantId={tenantId}
                  placeholder="Select QR Code photo..."
                />
              </div>
            )}

            {/* Instructions */}
            <div className="flex flex-col gap-2">
              <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Instructions for Customers</label>
              <textarea
                value={instructions}
                onChange={e => setInstructions(e.target.value)}
                rows={2}
                placeholder="e.g. Please scan the QR code and upload proof of payment screenshot in checkout page."
                className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/20 outline-none focus:border-[#fb7a90]/50 transition-colors resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Sort Order */}
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Sort Order</label>
                <input
                  type="number"
                  value={sortOrder}
                  onChange={e => setSortOrder(parseInt(e.target.value) || 0)}
                  placeholder="0"
                  className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white outline-none focus:border-[#fb7a90]/50 transition-colors"
                />
              </div>

              {/* Status toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-white/60 text-xs font-medium uppercase tracking-wider">Status</label>
                <div className="flex items-center h-full">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={e => setIsActive(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#fb7a90]"></div>
                    <span className="ml-3 text-sm font-medium text-white/70">{isActive ? 'Active' : 'Inactive'}</span>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-white/5 flex items-center justify-end gap-3 flex-shrink-0 bg-[#161d2a]/50">
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
              {isSubmitting ? 'Saving...' : 'Save Method'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
