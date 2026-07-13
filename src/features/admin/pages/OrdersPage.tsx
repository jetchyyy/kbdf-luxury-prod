import { useState, useEffect } from 'react';
import { useAdminUser } from '../hooks/useAdminUser';
import { usePermissions } from '../hooks/usePermissions';
import { supabase, TENANT_ID } from '../../../lib/supabase/supabaseClient';
import { DataTable } from '../components/DataTable';
import type { Column } from '../components/DataTable';
import { ShoppingBag, Eye, CheckCircle, Truck, FileCheck, XCircle, Info, Calendar, Trash2 } from 'lucide-react';
import { useNotification } from '../../../core/context/NotificationContext';

interface OrderItem {
  id: string;
  title: string;
  price: number;
  quantity: number;
  size?: string | null;
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
  notes: string | null;
  pickup_location: string | null;
  created_at: string;
  order_items: OrderItem[];
}

export function OrdersPage() {
  const { adminUser, tenant } = useAdminUser();
  const { canEdit } = usePermissions('orders');
  const { showSuccess, showError, showConfirm } = useNotification();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [notes, setNotes] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week'>('all');

  const tenantId = adminUser?.tenant_id ?? TENANT_ID;
  const currency = tenant?.currency_symbol ?? '₱';

  useEffect(() => {
    if (tenantId) {
      loadOrders();
    }
  }, [tenantId]);

  async function loadOrders() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .eq('tenant_id', tenantId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function handleViewOrder(order: Order) {
    setSelectedOrder(order);
    setNotes(order.notes || '');
    setPickupLocation(order.pickup_location || '');
    setIsModalOpen(true);
  }

  async function updateOrderStatus(orderId: string, newStatus: Order['status']) {
    if (!canEdit) return;
    try {
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: newStatus, 
          notes: notes.trim() || null,
          pickup_location: selectedOrder?.delivery_method === 'pickup' ? pickupLocation.trim() || null : null
        })
        .eq('id', orderId);

      if (error) throw error;
      
      // Update local state
      setOrders(prev => prev.map(o => o.id === orderId ? { 
        ...o, 
        status: newStatus, 
        notes: notes.trim() || null,
        pickup_location: o.delivery_method === 'pickup' ? pickupLocation.trim() || null : null
      } : o));
      setSelectedOrder(prev => prev ? { 
        ...prev, 
        status: newStatus, 
        notes: notes.trim() || null,
        pickup_location: prev.delivery_method === 'pickup' ? pickupLocation.trim() || null : null
      } : null);
      showSuccess(`Order status updated to: ${newStatus.replace('_', ' ')}`);
    } catch (err: any) {
      showError('Failed to update status: ' + (err.message || err));
    }
  }

  async function handleDeleteOrder(orderId: string) {
    if (!canEdit) return;
    const confirmed = await showConfirm('Are you sure you want to delete this order? This action cannot be undone.');
    if (!confirmed) return;

    try {
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) throw error;

      setOrders(prev => prev.filter(o => o.id !== orderId));
      if (selectedOrder?.id === orderId) {
        setIsModalOpen(false);
        setSelectedOrder(null);
      }
      showSuccess('Order deleted successfully.');
    } catch (err: any) {
      showError('Failed to delete order: ' + (err.message || err));
    }
  }

  // Filter orders
  const filteredOrders = orders.filter(o => {
    // 1. Status Filter
    if (statusFilter !== 'all' && o.status !== statusFilter) return false;

    // 2. Date Filter
    if (dateFilter === 'today') {
      const orderDate = new Date(o.created_at);
      const today = new Date();
      return orderDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'week') {
      const orderDate = new Date(o.created_at);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      return orderDate >= oneWeekAgo;
    }
    return true;
  });

  const columns: Column<Order>[] = [
    {
      key: 'tracking_number',
      label: 'Tracking Number',
      sortable: true,
      render: (row) => (
        <span className="font-mono font-bold text-white tracking-wider">{row.tracking_number}</span>
      ),
      width: '180px',
    },
    {
      key: 'customer',
      label: 'Customer Name',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.customer_first_name} {row.customer_last_name}</p>
          <p className="text-[11px] text-white/30">{row.customer_phone}</p>
        </div>
      ),
    },
    {
      key: 'created_at',
      label: 'Order Date',
      sortable: true,
      render: (row) => (
        <span className="text-white/60 text-xs flex items-center gap-1">
          <Calendar className="w-3.5 h-3.5" />
          {new Date(row.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
        </span>
      ),
    },
    {
      key: 'total',
      label: 'Total',
      sortable: true,
      render: (row) => (
        <span className="font-semibold text-white">
          {currency}{Number(row.total).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (row) => {
        let badgeStyle = '';
        switch (row.status) {
          case 'pending_verification':
            badgeStyle = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
            break;
          case 'verified':
            badgeStyle = 'bg-blue-500/10 text-blue-400 border-blue-500/20';
            break;
          case 'processing':
            badgeStyle = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
            break;
          case 'shipped':
            badgeStyle = 'bg-[#fb7a90]/10 text-[#fb7a90] border-[#fb7a90]/20';
            break;
          case 'completed':
            badgeStyle = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
            break;
          case 'cancelled':
            badgeStyle = 'bg-red-500/10 text-red-400 border-red-500/20';
            break;
        }
        return (
          <span className={`px-2.5 py-0.5 text-xs rounded-full border uppercase font-semibold ${badgeStyle}`}>
            {row.status.replace('_', ' ')}
          </span>
        );
      },
    },
    {
      key: 'actions',
      label: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleViewOrder(row)}
            className="p-1.5 text-white/50 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-all flex items-center gap-1 text-xs"
            title="View Details"
          >
            <Eye className="w-4 h-4" /> Details
          </button>
          {canEdit && (
            <button
              onClick={() => handleDeleteOrder(row.id)}
              className="p-1.5 text-white/30 hover:text-red-400 bg-white/5 hover:bg-red-500/10 rounded-lg transition-all"
              title="Delete Order"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      ),
      width: '140px',
    },
  ];

  return (
    <div className="space-y-6">
      
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-[#fb7a90]" /> Order Verification
          </h2>
          <p className="text-white/40 text-xs mt-0.5">Verify digital transfer receipts, shipping address details, and update tracking progress.</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-2.5 self-start sm:self-auto">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Statuses</option>
            <option value="pending_verification">Pending Verification</option>
            <option value="verified">Verified Payments</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>

          {/* Date Range Filter */}
          <select
            value={dateFilter}
            onChange={e => setDateFilter(e.target.value as any)}
            className="bg-[#0f1117] border border-white/10 rounded-xl px-4 py-2.5 text-xs font-semibold text-white outline-none focus:border-[#fb7a90]/50"
          >
            <option value="all">All Time</option>
            <option value="today">Today's Orders</option>
            <option value="week">Past 7 Days</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredOrders}
        isLoading={isLoading}
        searchPlaceholder="Search tracking number or customer..."
        emptyMessage="No orders matching your criteria."
      />

      {/* Details Modal */}
      {isModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-[#111827] border border-white/10 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl flex flex-col my-8 max-h-[85vh]">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between flex-shrink-0">
              <h3 className="text-white font-semibold text-lg flex items-center gap-2">
                Order details: <span className="font-mono text-[#fb7a90]">{selectedOrder.tracking_number}</span>
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-white/40 hover:text-white transition-colors">Close</button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Status Timeline */}
              {(() => {
                const STATUS_STEPS = [
                  { key: 'pending_verification', label: 'Verify' },
                  { key: 'verified', label: 'Verified' },
                  { key: 'processing', label: 'Processing' },
                  { key: 'shipped', label: 'Shipped' },
                  { key: 'completed', label: 'Completed' }
                ];
                const currentStatusIndex = STATUS_STEPS.findIndex(step => step.key === selectedOrder.status);

                return (
                  <div className="col-span-1 lg:col-span-3 bg-[#0f1117] border border-white/5 rounded-2xl p-6 flex flex-col items-center justify-center space-y-4">
                    <strong className="text-white/40 text-[10px] uppercase tracking-widest self-start">Order Progress</strong>
                    {selectedOrder.status === 'cancelled' ? (
                      <div className="text-red-400 bg-red-500/10 border border-red-500/20 px-6 py-3 rounded-xl w-full text-center font-bold text-xs">
                        This order has been cancelled and cannot be processed further.
                      </div>
                    ) : (
                      <div className="w-full flex items-center justify-between relative max-w-2xl px-4 py-2">
                        {/* Connector Line background */}
                        <div className="absolute left-10 right-10 top-7 h-0.5 bg-white/5 -translate-y-1/2 z-0" />
                        {/* Connector Line progress */}
                        <div 
                          className="absolute left-10 top-7 h-0.5 bg-gradient-to-r from-[#fb7a90] to-[#f16881] -translate-y-1/2 transition-all duration-500 z-0"
                          style={{ width: `${currentStatusIndex >= 0 ? (currentStatusIndex / (STATUS_STEPS.length - 1)) * 90 : 0}%` }}
                        />

                        {STATUS_STEPS.map((step, idx) => {
                          const isDone = idx <= currentStatusIndex;
                          const isCurrent = idx === currentStatusIndex;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative z-10 flex-1">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 border ${
                                isDone 
                                  ? 'bg-gradient-to-r from-[#fb7a90] to-[#f16881] border-[#fb7a90] text-white shadow-lg shadow-[#fb7a90]/20' 
                                  : 'bg-[#111827] border-white/10 text-white/40'
                              } ${isCurrent ? 'ring-4 ring-[#fb7a90]/20 scale-110' : ''}`}>
                                {idx + 1}
                              </div>
                              <span className={`text-[10px] mt-2 font-medium tracking-wide uppercase text-center transition-all ${
                                isDone ? 'text-white' : 'text-white/30'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* Col 1: Customer details */}
              <div className="space-y-4 text-sm text-white/70">
                <h4 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <Info className="w-4 h-4 text-white/50" /> Customer & Shipping
                </h4>
                <div className="space-y-3 bg-[#0f1117] p-4 rounded-xl border border-white/5">
                  <div>
                    <strong className="block text-[10px] uppercase text-white/40 mb-0.5">Recipients</strong>
                    <p className="font-bold text-white">{selectedOrder.customer_first_name} {selectedOrder.customer_last_name}</p>
                    <p className="text-xs">{selectedOrder.customer_phone}</p>
                    <p className="text-xs">{selectedOrder.customer_email}</p>
                    {selectedOrder.customer_fb_link && (
                      <a href={selectedOrder.customer_fb_link} target="_blank" rel="noreferrer" className="text-[#fb7a90] text-xs hover:underline mt-1 block">Facebook Account</a>
                    )}
                  </div>

                  <div>
                    <strong className="block text-[10px] uppercase text-white/40 mb-0.5">Address</strong>
                    <p className="capitalize">Method: {selectedOrder.delivery_method}</p>
                    {selectedOrder.delivery_method !== 'pickup' ? (
                      <>
                        <p className="text-xs">{selectedOrder.shipping_street}</p>
                        <p className="text-xs">{selectedOrder.shipping_barangay}, {selectedOrder.shipping_city}</p>
                        <p className="text-xs">{selectedOrder.shipping_province}</p>
                        {selectedOrder.shipping_landmark && (
                          <p className="text-xs italic text-white/40 mt-1">Landmark: {selectedOrder.shipping_landmark}</p>
                        )}
                      </>
                    ) : (
                      <div className="mt-2 pt-2 border-t border-white/5">
                        <strong className="block text-[10px] uppercase text-white/40 mb-0.5">Pick Up Location</strong>
                        <p className="text-xs text-white bg-white/5 px-2.5 py-1.5 rounded-lg border border-white/5 mt-1 font-mono">
                          {selectedOrder.pickup_location || 'Default Store Location'}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Col 2: Payment Receipt & Details */}
              <div className="space-y-4 text-sm text-white/70">
                <h4 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-1 flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4 text-white/50" /> Payment & Proof
                </h4>
                <div className="space-y-3 bg-[#0f1117] p-4 rounded-xl border border-white/5">
                  <div>
                    <strong className="block text-[10px] uppercase text-white/40 mb-0.5">Payment Route</strong>
                    <p className="font-bold text-white uppercase">{selectedOrder.payment_method_type.replace('_', ' ')}</p>
                  </div>

                  {selectedOrder.proof_of_payment_url ? (
                    <div>
                      <strong className="block text-[10px] uppercase text-white/40 mb-1.5">Uploaded Receipt</strong>
                      <a href={selectedOrder.proof_of_payment_url} target="_blank" rel="noreferrer" className="group block relative w-full aspect-square rounded-lg overflow-hidden border border-white/10 bg-black">
                        <img src={selectedOrder.proof_of_payment_url} alt="Receipt Proof" className="w-full h-full object-contain" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <span className="text-xs text-white font-bold bg-[#fb7a90] px-3 py-1 rounded-full">Open in New Tab</span>
                        </div>
                      </a>
                    </div>
                  ) : (
                    <div className="text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg">
                      No receipt has been uploaded yet by the customer.
                    </div>
                  )}
                </div>
              </div>

              {/* Col 3: Items Ordered & Status Actions */}
              <div className="space-y-4 text-sm text-white/70 flex flex-col justify-between">
                <div>
                  <h4 className="text-xs uppercase font-bold text-white tracking-widest border-b border-white/5 pb-1 flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-white/50" /> Ordered Items
                  </h4>
                  <div className="divide-y divide-white/5 mt-2 max-h-48 overflow-y-auto pr-1">
                    {selectedOrder.order_items.map((item) => (
                      <div key={item.id} className="flex justify-between items-center py-2 text-xs">
                        <div>
                          <p className="font-semibold text-white">{item.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-white/40">Qty: {item.quantity}</span>
                            {item.size && (
                              <span className="text-[#fb7a90] bg-[#fb7a90]/10 border border-[#fb7a90]/25 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                                Size: {item.size}
                              </span>
                            )}
                          </div>
                        </div>
                        <span className="font-bold text-white">{currency}{(item.price * item.quantity).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-3 border-t border-white/5 flex justify-between items-center font-bold text-white mt-2">
                    <span>Total</span>
                    <span>{currency}{selectedOrder.total.toLocaleString()}</span>
                  </div>
                </div>

                {/* Status Update Actions */}
                {(() => {
                  const isCompletedOrCancelled = selectedOrder.status === 'completed' || selectedOrder.status === 'cancelled';
                  const canVerify = selectedOrder.status === 'pending_verification';
                  const canProcess = selectedOrder.status === 'verified';
                  const canShip = selectedOrder.status === 'processing';
                  const canComplete = selectedOrder.status === 'shipped';
                  const canCancel = !isCompletedOrCancelled;

                  return canEdit ? (
                    <div className="pt-6 border-t border-white/5 space-y-3">
                      {selectedOrder.delivery_method === 'pickup' && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase font-bold text-white/40">Custom Pick Up Location (Optional)</label>
                          <input
                            type="text"
                            value={pickupLocation}
                            onChange={e => setPickupLocation(e.target.value)}
                            placeholder="e.g. Building 5, North Lobby / Store Counter 2"
                            className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-[#fb7a90]/50"
                          />
                          <p className="text-[9px] text-white/30">If left blank, it defaults to the store's primary address.</p>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[10px] uppercase font-bold text-white/40">Order Verification Notes</label>
                        <textarea
                          value={notes}
                          onChange={e => setNotes(e.target.value)}
                          placeholder="Add verification updates, bank reference checks..."
                          rows={2}
                          className="bg-[#0f1117] border border-white/10 rounded-xl px-3 py-2 text-xs text-white resize-none outline-none focus:border-[#fb7a90]/50"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'verified')}
                          disabled={!canVerify}
                          className="flex items-center justify-center gap-1 bg-blue-500 hover:bg-blue-600 disabled:opacity-20 disabled:hover:bg-blue-500 disabled:cursor-not-allowed text-white rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] disabled:active:scale-100 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Verify Payment
                        </button>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'processing')}
                          disabled={!canProcess}
                          className="flex items-center justify-center gap-1 bg-purple-500 hover:bg-purple-600 disabled:opacity-20 disabled:hover:bg-purple-500 disabled:cursor-not-allowed text-white rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] disabled:active:scale-100 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Start Process
                        </button>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'shipped')}
                          disabled={!canShip}
                          className="flex items-center justify-center gap-1 bg-[#fb7a90] hover:bg-[#fb7a90]/90 disabled:opacity-20 disabled:hover:bg-[#fb7a90] disabled:cursor-not-allowed text-white rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] disabled:active:scale-100 transition-all"
                        >
                          <Truck className="w-3.5 h-3.5" /> Ship Order
                        </button>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'completed')}
                          disabled={!canComplete}
                          className="flex items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-20 disabled:hover:bg-emerald-500 disabled:cursor-not-allowed text-white rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] disabled:active:scale-100 transition-all"
                        >
                          <CheckCircle className="w-3.5 h-3.5" /> Complete
                        </button>
                        <button
                          onClick={() => updateOrderStatus(selectedOrder.id, 'cancelled')}
                          disabled={!canCancel}
                          className="flex items-center justify-center gap-1 bg-red-500 hover:bg-red-600 disabled:opacity-20 disabled:hover:bg-red-500 disabled:cursor-not-allowed text-white rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] disabled:active:scale-100 transition-all"
                        >
                          <XCircle className="w-3.5 h-3.5" /> Cancel Order
                        </button>
                        <button
                          onClick={() => handleDeleteOrder(selectedOrder.id)}
                          className="flex items-center justify-center gap-1 bg-white/5 hover:bg-red-500/10 text-white/50 hover:text-red-400 border border-white/10 hover:border-red-500/20 rounded-xl py-2 text-xs font-semibold tracking-wider active:scale-[0.98] transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" /> Delete Order
                        </button>
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
}
export default OrdersPage;
