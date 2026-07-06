import { useState } from "react";
import { FadeUp } from "../../ui/Motion/FadeUp";
import { ArrowRight, Search, Check, RefreshCw, AlertCircle, ShoppingBag, MapPin, CreditCard, ExternalLink } from "lucide-react";
import { supabase } from "../../lib/supabase/supabaseClient";
import { ImageUploadInput } from "../admin/components/ImageUploadInput";
import { useTenant } from "../../core/context/TenantContext";
import { useNotification } from "../../core/context/NotificationContext";

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  tenant_id: string;
  tracking_number: string;
  customer_first_name: string;
  customer_last_name: string;
  customer_email: string;
  customer_phone: string;
  customer_fb_link: string | null;
  shipping_province: string;
  shipping_city: string;
  shipping_barangay: string;
  shipping_street: string;
  shipping_landmark: string | null;
  delivery_method: string;
  payment_method_type: string;
  proof_of_payment_url: string | null;
  subtotal: number;
  shipping_fee: number;
  total: number;
  status: 'pending_verification' | 'verified' | 'processing' | 'shipped' | 'completed' | 'cancelled';
  created_at: string;
  order_items: OrderItem[];
}

export function TrackPage() {
  const { tenant } = useTenant();
  const { showSuccess, showError } = useNotification();
  const [trackingCode, setTrackingCode] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [receiptUrl, setReceiptUrl] = useState("");

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trackingCode.trim()) return;

    setIsSearching(true);
    setErrorMsg(null);
    setOrder(null);

    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("tracking_number", trackingCode.trim().toUpperCase())
        .single();

      if (error || !data) {
        throw new Error("Tracking number not found. Make sure it is typed correctly.");
      }

      setOrder(data);
      setReceiptUrl(data.proof_of_payment_url || "");
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || "Failed to search tracking code.");
    } finally {
      setIsSearching(false);
    }
  };

  const handleSaveReceipt = async () => {
    if (!order) return;
    try {
      const { error } = await supabase
        .from("orders")
        .update({ proof_of_payment_url: receiptUrl })
        .eq("id", order.id);

      if (error) throw error;

      setOrder(prev => prev ? { ...prev, proof_of_payment_url: receiptUrl } : null);
      showSuccess("Receipt saved successfully!");
    } catch (err: any) {
      showError("Failed to save receipt: " + (err.message || err));
    }
  };

  // Timeline Helper
  const steps = [
    { key: 'pending_verification', label: 'Ordered' },
    { key: 'verified', label: 'Payment Verified' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === status);
  };

  const activeIndex = order ? getStepIndex(order.status) : 0;

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-4xl mx-auto px-6 w-full">
        <FadeUp delay={0.1}>
          
          {/* Header */}
          <div className="mb-12 flex flex-col items-center text-center">
            <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary mb-4">
              Track Order
            </h1>
            <div className="w-12 h-px bg-typography-primary mb-6"></div>
            <p className="max-w-md text-xs tracking-wider text-typography-muted uppercase">
              Enter your tracking code below to query your package delivery status
            </p>
          </div>

          {/* Search bar */}
          <form onSubmit={handleTrack} className="max-w-xl mx-auto flex flex-col items-center gap-6 mb-12">
            <div className="w-full flex items-center border-b border-surface-light pb-2">
              <Search className="w-4 h-4 text-typography-muted mr-4" strokeWidth={1} />
              <input
                type="text"
                value={trackingCode}
                onChange={(e) => setTrackingCode(e.target.value)}
                placeholder="Tracking Number (e.g. TRK-XXXXXX-XXXX)"
                className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-typography-primary tracking-widest uppercase placeholder:text-typography-muted/50"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching || !trackingCode.trim()}
              className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3 text-xs uppercase tracking-widest font-bold transition-all disabled:opacity-50 flex items-center gap-3"
            >
              {isSearching ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Querying...
                </>
              ) : (
                <>
                  <span>Track Package</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {errorMsg && (
            <div className="max-w-xl mx-auto text-red-500 bg-red-50 border border-red-200/50 p-4 rounded-2xl flex items-center gap-2 text-xs">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Search Results Display */}
          {order && (
            <div className="space-y-8 animate-fadeIn">
              
              {/* STATUS TIMELINE BAR */}
              <div className="bg-surface-offWhite border border-surface-light rounded-3xl p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-[10px] uppercase font-bold text-typography-muted tracking-widest">
                    Tracking ID: <span className="font-mono text-typography-primary">{order.tracking_number}</span>
                  </span>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase border ${
                    order.status === 'cancelled' 
                      ? 'bg-red-50 border-red-200 text-red-500' 
                      : order.status === 'completed'
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-500'
                      : 'bg-brand-pink/5 border-brand-pink/20 text-brand-pink'
                  }`}>
                    {order.status.replace('_', ' ')}
                  </span>
                </div>

                {order.status === 'cancelled' ? (
                  <div className="bg-red-50 border border-red-200 p-4 rounded-xl text-center text-xs text-red-500">
                    This order was cancelled by the store administrator. Please contact client support for further verification.
                  </div>
                ) : (
                  <div className="flex flex-col md:flex-row justify-between items-center relative gap-8 py-4">
                    {/* Connecting line */}
                    <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-light -translate-y-1/2 hidden md:block z-0" />
                    
                    {steps.map((step, idx) => {
                      const isCompleted = idx <= activeIndex;
                      const isCurrent = idx === activeIndex;

                      return (
                        <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-full md:w-auto">
                          <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all ${
                            isCompleted 
                              ? 'bg-brand-pink border-brand-pink text-white shadow-md' 
                              : 'bg-white border-surface-light text-typography-muted'
                          }`}>
                            {isCompleted ? <Check className="w-4 h-4" strokeWidth={3} /> : idx + 1}
                          </div>
                          <span className={`text-[10px] uppercase font-bold tracking-wider mt-2 ${
                            isCurrent ? 'text-brand-pink font-extrabold' : 'text-typography-muted'
                          }`}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Delivery and details */}
                <div className="border border-surface-light rounded-2xl p-6 space-y-4 text-sm text-typography-primary">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary border-b border-surface-light pb-2 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-brand-pink" /> Customer & Delivery Details
                  </h3>
                  <div>
                    <strong className="block text-[10px] uppercase text-typography-muted mb-0.5">Recipients</strong>
                    <p className="font-semibold">{order.customer_first_name} {order.customer_last_name}</p>
                    <p className="text-xs text-typography-muted">{order.customer_email}</p>
                    <p className="text-xs text-typography-muted">{order.customer_phone}</p>
                    {order.customer_fb_link && (
                      <a href={order.customer_fb_link} target="_blank" rel="noreferrer" className="text-brand-pink text-xs hover:underline flex items-center gap-1 mt-1">
                        Facebook Account <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  <div>
                    <strong className="block text-[10px] uppercase text-typography-muted mb-0.5">Shipping Route</strong>
                    <p className="font-semibold capitalize">{order.delivery_method} Delivery</p>
                    {order.delivery_method !== 'pickup' && (
                      <>
                        <p className="text-xs text-typography-muted">{order.shipping_street}</p>
                        <p className="text-xs text-typography-muted">{order.shipping_barangay}, {order.shipping_city}</p>
                        <p className="text-xs text-typography-muted">{order.shipping_province}</p>
                        {order.shipping_landmark && (
                          <p className="text-xs italic text-typography-muted mt-1 bg-surface-offWhite p-2 rounded border border-surface-light">
                            Landmark: {order.shipping_landmark}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </div>

                {/* Payment Receipt details */}
                <div className="border border-surface-light rounded-2xl p-6 space-y-4 text-sm text-typography-primary flex flex-col justify-between">
                  <div className="space-y-4">
                    <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary border-b border-surface-light pb-2 flex items-center gap-2">
                      <CreditCard className="w-4 h-4 text-brand-pink" /> Payment Receipt Verification
                    </h3>
                    <div>
                      <strong className="block text-[10px] uppercase text-typography-muted mb-0.5">Payment Route</strong>
                      <p className="font-semibold uppercase">{order.payment_method_type.replace('_', ' ')}</p>
                    </div>

                    {order.proof_of_payment_url ? (
                      <div className="space-y-2">
                        <strong className="block text-[10px] uppercase text-typography-muted">Uploaded Receipt</strong>
                        <div className="w-32 h-32 bg-surface-light border border-surface-light rounded overflow-hidden">
                          <img src={order.proof_of_payment_url} alt="Proof" className="w-full h-full object-cover" />
                        </div>
                      </div>
                    ) : (
                      <div className="text-xs text-red-500 bg-red-50 border border-red-200/50 p-3 rounded-xl">
                        No receipt has been uploaded yet. Payment verification is required to process your order.
                      </div>
                    )}
                  </div>

                  {/* Allow updating receipt if pending verification */}
                  {order.status === 'pending_verification' && (
                    <div className="pt-4 border-t border-surface-light space-y-2">
                      <label className="text-[10px] font-bold uppercase text-typography-primary block">
                        {order.proof_of_payment_url ? 'Replace / Update Receipt' : 'Upload Receipt Photo'}
                      </label>
                      <div className="flex gap-2">
                        <ImageUploadInput
                          value={receiptUrl}
                          onChange={setReceiptUrl}
                          tenantId={order.tenant_id}
                          placeholder="Select payment receipt..."
                        />
                        <button 
                          onClick={handleSaveReceipt}
                          disabled={receiptUrl === order.proof_of_payment_url}
                          className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-4 py-2.5 text-xs font-semibold uppercase tracking-wider disabled:opacity-50 transition-all whitespace-nowrap self-start"
                        >
                          Save
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items Summary list */}
                <div className="border border-surface-light rounded-2xl p-6 md:col-span-2 space-y-4">
                  <h3 className="text-xs uppercase tracking-widest font-bold text-typography-primary border-b border-surface-light pb-2 flex items-center gap-2">
                    <ShoppingBag className="w-4 h-4 text-brand-pink" /> Items Ordered
                  </h3>
                  <div className="divide-y divide-surface-light">
                    {order.order_items.map((item: any) => (
                      <div key={item.id} className="flex justify-between items-center py-2 text-xs">
                        <div>
                          <p className="font-semibold text-typography-primary">{item.title}</p>
                          <p className="text-typography-muted">Quantity: {item.quantity}</p>
                        </div>
                        <span className="font-bold text-typography-primary">
                          {tenant?.currency_symbol || '₱'}{(item.price * item.quantity).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-4 border-t border-surface-light flex justify-between items-center text-sm font-bold">
                    <span>Total Amount</span>
                    <span>{tenant?.currency_symbol || '₱'}{order.total.toLocaleString()}</span>
                  </div>
                </div>

              </div>

            </div>
          )}

        </FadeUp>
      </div>
    </div>
  );
}
export default TrackPage;
