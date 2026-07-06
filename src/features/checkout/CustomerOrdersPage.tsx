import { useEffect, useState } from "react";
import { useUserAuth } from "../../core/context/UserAuthContext";
import { useTenant } from "../../core/context/TenantContext";
import { useNotification } from "../../core/context/NotificationContext";
import { supabase } from "../../lib/supabase/supabaseClient";
import { Check, Calendar, ShoppingBag, MapPin, CreditCard, ChevronDown, ChevronUp, AlertCircle, Loader2 } from "lucide-react";
import { Link } from "react-router-dom";
import { ImageUploadInput } from "../admin/components/ImageUploadInput";

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
  notes: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export function CustomerOrdersPage() {
  const { user, isLoading: authLoading } = useUserAuth();
  const { tenant } = useTenant();
  const { showSuccess, showError } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);
  const [receiptUrlMap, setReceiptUrlMap] = useState<{ [orderId: string]: string }>({});

  const currencySymbol = tenant?.currency_symbol || '₱';

  useEffect(() => {
    if (user) {
      loadCustomerOrders();
    }
  }, [user]);

  const loadCustomerOrders = async () => {
    setLoadingOrders(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*, order_items(*)")
        .eq("customer_id", user!.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);

      // Initialize receipt URL inputs
      const initialMap: { [orderId: string]: string } = {};
      data?.forEach((o: Order) => {
        initialMap[o.id] = o.proof_of_payment_url || "";
      });
      setReceiptUrlMap(initialMap);
    } catch (err) {
      console.error("Error loading customer orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleUpdateReceipt = async (orderId: string) => {
    const newUrl = receiptUrlMap[orderId];
    try {
      const { error } = await supabase
        .from("orders")
        .update({ proof_of_payment_url: newUrl })
        .eq("id", orderId);

      if (error) throw error;
      
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, proof_of_payment_url: newUrl } : o));
      showSuccess("Payment receipt uploaded successfully!");
    } catch (err: any) {
      showError("Failed to update receipt: " + (err.message || err));
    }
  };

  const toggleExpandOrder = (id: string) => {
    setExpandedOrderId(prev => prev === id ? null : id);
  };

  // Timeline helpers
  const steps = [
    { key: 'pending_verification', label: 'Ordered' },
    { key: 'verified', label: 'Paid' },
    { key: 'processing', label: 'Processing' },
    { key: 'shipped', label: 'Shipped' },
    { key: 'completed', label: 'Completed' }
  ];

  const getStepIndex = (status: string) => {
    if (status === 'cancelled') return -1;
    return steps.findIndex(s => s.key === status);
  };

  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending_verification':
        return 'bg-amber-50 text-amber-500 border-amber-200';
      case 'verified':
        return 'bg-blue-50 text-blue-500 border-blue-200';
      case 'processing':
        return 'bg-purple-50 text-purple-500 border-purple-200';
      case 'shipped':
        return 'bg-brand-pink/5 text-brand-pink border-brand-pink/20';
      case 'completed':
        return 'bg-emerald-50 text-emerald-500 border-emerald-200';
      case 'cancelled':
        return 'bg-red-50 text-red-500 border-red-200';
      default:
        return 'bg-surface-light text-typography-muted border-surface-light';
    }
  };

  if (authLoading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-brand-pink" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-surface-white flex flex-col items-center justify-center text-center px-4">
        <AlertCircle className="w-12 h-12 text-brand-pink mb-4" strokeWidth={1} />
        <h2 className="text-xl font-serif text-typography-primary mb-2">Access Denied</h2>
        <p className="text-xs text-typography-muted mb-6 uppercase tracking-wider">Please sign in to view your order history.</p>
        <Link to="/auth" className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3 text-[10px] uppercase tracking-widest font-bold transition-all">Go to Sign In</Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-24 min-h-screen bg-surface-white">
      <div className="max-w-4xl mx-auto px-4">
        
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-2xl font-sans font-light tracking-widest uppercase text-typography-primary">
            Order History
          </h1>
          <div className="w-12 h-px bg-typography-primary mt-4 mb-2"></div>
          <p className="text-xs text-typography-muted uppercase tracking-wider">View and track all orders associated with your profile</p>
        </div>

        {loadingOrders ? (
          <div className="space-y-4">
            {[1, 2].map(i => (
              <div key={i} className="h-24 bg-surface-offWhite border border-surface-light rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : orders.length === 0 ? (
          <div className="border border-surface-light bg-surface-offWhite rounded-3xl p-12 text-center">
            <ShoppingBag className="w-12 h-12 text-typography-muted/40 mx-auto mb-4" strokeWidth={1} />
            <h3 className="text-lg font-serif text-typography-primary">No Orders Placed Yet</h3>
            <p className="text-xs text-typography-muted mt-1 uppercase tracking-wider mb-6">Explore our curated collections to place your first order</p>
            <Link to="/shop" className="bg-brand-navy hover:bg-brand-pink text-white px-8 py-3.5 text-[10px] uppercase tracking-widest font-bold transition-all">Shop Collections</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map(order => {
              const isExpanded = expandedOrderId === order.id;
              const activeIndex = getStepIndex(order.status);

              return (
                <div key={order.id} className="border border-surface-light rounded-2xl overflow-hidden bg-surface-offWhite transition-all">
                  
                  {/* Summary Header Accordion toggle */}
                  <button 
                    onClick={() => toggleExpandOrder(order.id)}
                    className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-5 text-left gap-4 hover:bg-surface-light/40 transition-colors"
                  >
                    <div className="space-y-1">
                      <span className="font-mono text-sm font-bold text-typography-primary tracking-wider">{order.tracking_number}</span>
                      <div className="flex items-center gap-3 text-xs text-typography-muted">
                        <span className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" /> {new Date(order.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}</span>
                        <span>•</span>
                        <span>{order.order_items.length} {order.order_items.length === 1 ? 'item' : 'items'}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="font-bold text-sm text-typography-primary block">{currencySymbol}{order.total.toLocaleString()}</span>
                        <span className={`px-2 py-0.5 text-[10px] rounded-full border uppercase font-bold tracking-wider ${getBadgeStyle(order.status)}`}>
                          {order.status.replace('_', ' ')}
                        </span>
                      </div>
                      {isExpanded ? <ChevronUp className="w-5 h-5 text-typography-muted" /> : <ChevronDown className="w-5 h-5 text-typography-muted" />}
                    </div>
                  </button>

                  {/* Expanded details view */}
                  {isExpanded && (
                    <div className="border-t border-surface-light p-6 bg-white space-y-8 animate-fadeIn">
                      
                      {/* Timeline steps */}
                      {order.status === 'cancelled' ? (
                        <div className="bg-red-50 border border-red-200 text-red-500 rounded-xl p-4 text-center text-xs">
                          This order was cancelled by the store administrator. Please contact support.
                        </div>
                      ) : (
                        <div className="flex flex-col md:flex-row justify-between items-center relative gap-6 py-2 border-b border-surface-light pb-6">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-surface-light -translate-y-1/2 hidden md:block z-0" />
                          {steps.map((step, idx) => {
                            const isCompleted = idx <= activeIndex;
                            const isCurrent = idx === activeIndex;

                            return (
                              <div key={step.key} className="flex flex-col items-center text-center relative z-10 w-full md:w-auto">
                                <div className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                                  isCompleted 
                                    ? 'bg-brand-pink border-brand-pink text-white shadow-md' 
                                    : 'bg-white border-surface-light text-typography-muted'
                                }`}>
                                  {isCompleted ? <Check className="w-3.5 h-3.5" strokeWidth={3} /> : idx + 1}
                                </div>
                                <span className={`text-[9px] uppercase font-bold tracking-wider mt-1.5 ${
                                  isCurrent ? 'text-brand-pink font-extrabold' : 'text-typography-muted'
                                }`}>
                                  {step.label}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Info grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-xs text-typography-primary">
                        
                        {/* Address */}
                        <div className="space-y-3">
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-typography-muted border-b border-surface-light pb-1 flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-brand-pink" /> Delivery Details
                          </h4>
                          <div>
                            <p className="font-semibold capitalize">{order.delivery_method} Delivery</p>
                            {order.delivery_method !== 'pickup' && (
                              <div className="text-typography-muted space-y-0.5 mt-1">
                                <p>{order.shipping_street}</p>
                                <p>{order.shipping_barangay}, {order.shipping_city}</p>
                                <p>{order.shipping_province}</p>
                                {order.shipping_landmark && <p className="italic text-typography-primary bg-surface-offWhite p-2 rounded mt-1.5">Landmark: {order.shipping_landmark}</p>}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Payment */}
                        <div className="space-y-3 flex flex-col justify-between">
                          <div className="space-y-3">
                            <h4 className="text-[10px] uppercase font-bold tracking-widest text-typography-muted border-b border-surface-light pb-1 flex items-center gap-1.5">
                              <CreditCard className="w-4 h-4 text-brand-pink" /> Payment Receipt
                            </h4>
                            <p className="font-semibold uppercase">{order.payment_method_type.replace('_', ' ')}</p>
                            {order.proof_of_payment_url && (
                              <div className="w-20 h-20 bg-surface-offWhite border border-surface-light rounded overflow-hidden mt-1">
                                <img src={order.proof_of_payment_url} alt="Proof" className="w-full h-full object-cover" />
                              </div>
                            )}
                          </div>

                          {/* Upload receipt trigger if pending */}
                          {order.status === 'pending_verification' && (
                            <div className="space-y-2 pt-2">
                              <label className="text-[9px] font-bold uppercase text-typography-muted block">
                                {order.proof_of_payment_url ? 'Update Payment Receipt' : 'Upload Payment Receipt'}
                              </label>
                              <div className="flex gap-2">
                                <ImageUploadInput
                                  value={receiptUrlMap[order.id] || ""}
                                  onChange={url => setReceiptUrlMap(prev => ({ ...prev, [order.id]: url }))}
                                  tenantId={order.tenant_id}
                                  placeholder="Select receipt file..."
                                />
                                <button 
                                  onClick={() => handleUpdateReceipt(order.id)}
                                  disabled={receiptUrlMap[order.id] === order.proof_of_payment_url}
                                  className="bg-brand-navy hover:bg-brand-pink text-white rounded-xl px-4 py-2 text-[10px] font-bold uppercase tracking-wider disabled:opacity-50 transition-all whitespace-nowrap self-start"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Ordered Items list */}
                        <div className="md:col-span-2 space-y-3 pt-2">
                          <h4 className="text-[10px] uppercase font-bold tracking-widest text-typography-muted border-b border-surface-light pb-1">
                            Items Purchased
                          </h4>
                          <div className="divide-y divide-surface-light">
                            {order.order_items.map(item => (
                              <div key={item.id} className="flex justify-between py-2 items-center text-xs">
                                <div>
                                  <p className="font-semibold">{item.title}</p>
                                  <p className="text-typography-muted">Qty: {item.quantity}</p>
                                </div>
                                <span className="font-bold">{currencySymbol}{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>

                    </div>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
export default CustomerOrdersPage;
