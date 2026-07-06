import { useEffect, useState } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { fetchPaymentMethods, createPaymentMethod, updatePaymentMethod, deletePaymentMethod, togglePaymentMethod } from '../api/payment-methods';
import type { PaymentMethod } from '../../../lib/supabase/database.types';
import { Plus, Edit2, Trash2, QrCode, CreditCard, Banknote, HelpCircle, Eye, X } from 'lucide-react';
import { PermissionGate } from '../components/PermissionGate';
import { PaymentMethodFormModal } from '../components/PaymentMethodFormModal';
import { TENANT_ID } from '../../../lib/supabase/supabaseClient';

export function PaymentMethodsPage() {
  const { adminUser } = useAdminUser();
  const { canEdit, canDelete } = usePermissions('payment_methods');
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);

  // QR Preview Modal State
  const [previewQrUrl, setPreviewQrUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState('');

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;

  useEffect(() => {
    if (tenantId) {
      loadMethods();
    }
  }, [tenantId]);

  async function loadMethods() {
    setIsLoading(true);
    try {
      const data = await fetchPaymentMethods(tenantId);
      setMethods(data);
    } catch (err) {
      console.error('Error loading payment methods:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleSaveMethod(payload: any) {
    if (editingMethod) {
      await updatePaymentMethod(editingMethod.id, payload);
    } else {
      await createPaymentMethod(payload);
    }
    await loadMethods();
  }

  async function handleDeleteMethod(id: string) {
    if (window.confirm('Are you sure you want to delete this payment method?')) {
      try {
        await deletePaymentMethod(id);
        await loadMethods();
      } catch (err) {
        alert('Failed to delete payment method: ' + (err as any).message);
      }
    }
  }

  async function handleToggleActive(id: string, currentVal: boolean) {
    try {
      await togglePaymentMethod(id, !currentVal);
      await loadMethods();
    } catch (err) {
      alert('Failed to toggle status: ' + (err as any).message);
    }
  }

  function handleEditClick(method: PaymentMethod) {
    setEditingMethod(method);
    setIsModalOpen(true);
  }

  function handleAddClick() {
    setEditingMethod(null);
    setIsModalOpen(true);
  }

  function handleQrPreview(url: string, name: string) {
    setPreviewQrUrl(url);
    setPreviewName(name);
  }

  function getIcon(type: PaymentMethod['type']) {
    switch (type) {
      case 'qr':
        return <QrCode className="w-5 h-5" />;
      case 'bank_transfer':
        return <CreditCard className="w-5 h-5" />;
      case 'cod':
        return <Banknote className="w-5 h-5" />;
      default:
        return <HelpCircle className="w-5 h-5" />;
    }
  }

  return (
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Payment Methods & QR Codes</h2>
          <p className="text-white/40 text-xs mt-0.5">Configure GCash QR codes, bank accounts, and COD options that customers can use for storefront payments.</p>
        </div>

        <PermissionGate module="payment_methods" action="create">
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 bg-gradient-to-r from-[#fb7a90] to-[#f16881] text-white rounded-xl px-4 py-2.5 font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" /> Add Payment Method
          </button>
        </PermissionGate>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-white/5 border border-white/10 rounded-2xl" />
          ))}
        </div>
      ) : methods.length === 0 ? (
        <div className="bg-[#111827] border border-white/5 rounded-2xl py-16 text-center">
          <QrCode className="w-12 h-12 text-white/15 mx-auto mb-4" strokeWidth={1} />
          <h3 className="text-white font-semibold text-base mb-1">No payment methods configured</h3>
          <p className="text-white/40 text-xs max-w-xs mx-auto mb-6">Add your GCash/Maya QR codes or bank details so customers can submit payment proofs.</p>
          <PermissionGate module="payment_methods" action="create">
            <button
              onClick={handleAddClick}
              className="bg-white/5 hover:bg-white/10 border border-white/10 px-4 py-2 rounded-xl text-xs font-semibold text-white transition-all"
            >
              Add Your First Method
            </button>
          </PermissionGate>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {methods.map(method => (
            <div
              key={method.id}
              className={`bg-[#111827] border rounded-2xl p-5 flex flex-col justify-between h-56 transition-all ${
                method.is_active ? 'border-white/5 shadow-lg' : 'border-white/5 opacity-50'
              }`}
            >
              {/* Top row */}
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-white/70">
                      {getIcon(method.type)}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{method.name}</h4>
                      <p className="text-white/40 text-[10px] uppercase tracking-wider font-semibold">{method.type.replace('_', ' ')}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {canEdit && (
                      <button
                        onClick={() => handleToggleActive(method.id, method.is_active)}
                        className={`px-2 py-0.5 text-[10px] font-bold rounded-full border transition-all ${
                          method.is_active
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                            : 'bg-white/5 text-white/30 border-white/5'
                        }`}
                      >
                        {method.is_active ? 'Active' : 'Inactive'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Details */}
                {method.type !== 'cod' && (
                  <div className="text-xs space-y-1 bg-[#0f1117] p-2.5 rounded-lg border border-white/5 font-mono">
                    {method.account_name && (
                      <p className="text-white/50 truncate">NAME: <span className="text-white">{method.account_name}</span></p>
                    )}
                    {method.account_number && (
                      <p className="text-white/50 truncate">ACCT: <span className="text-white">{method.account_number}</span></p>
                    )}
                  </div>
                )}

                {method.instructions && (
                  <p className="text-[11px] text-white/40 line-clamp-2 italic px-1">
                    "{method.instructions}"
                  </p>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div>
                  {method.type === 'qr' && method.qr_code_url && (
                    <button
                      onClick={() => handleQrPreview(method.qr_code_url!, method.name)}
                      className="flex items-center gap-1.5 text-xs font-semibold text-[#fb7a90] hover:text-[#f16881] transition-all"
                    >
                      <Eye className="w-4 h-4" /> Preview QR Code
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {canEdit && (
                    <button
                      onClick={() => handleEditClick(method)}
                      className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all"
                      title="Edit Payment Method"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  )}
                  {canDelete && (
                    <button
                      onClick={() => handleDeleteMethod(method.id)}
                      className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
                      title="Delete Payment Method"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* QR Preview Modal */}
      {previewQrUrl && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-[60]" onClick={() => setPreviewQrUrl(null)}>
          <div className="bg-[#111827] border border-white/10 rounded-2xl overflow-hidden max-w-sm w-full p-6 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-white/5 pb-3">
              <h4 className="font-semibold text-white text-base">{previewName} QR Code</h4>
              <button onClick={() => setPreviewQrUrl(null)} className="p-1.5 text-white/40 hover:text-white bg-white/5 rounded-lg transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="bg-white p-4 rounded-xl inline-block">
              <img src={previewQrUrl} alt="QR Code" className="max-w-[200px] h-auto mx-auto object-contain" />
            </div>
            <p className="text-white/40 text-xs">Scan this QR code from payment applications to proceed with payments.</p>
          </div>
        </div>
      )}

      {/* Modals */}
      <PaymentMethodFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMethod}
        paymentMethod={editingMethod}
        tenantId={tenantId!}
      />
    </div>
  );
}
