import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useCart, getCartItemKey } from "./CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { 
    isCartOpen, closeCart, items, removeFromCart, 
    selectedCartKeys, toggleCartItemSelection, selectedCartItems, selectedCartTotal 
  } = useCart();
  
  const [isSummaryExpanded, setIsSummaryExpanded] = useState(false);

  const checkItemOutOfStock = (item: any) => {
    const hasSizes = item.sizes && item.sizes.length > 0;
    if (hasSizes) {
      const sizeObj = item.sizes.find((s: any) => s.size === item.selectedSize);
      return !sizeObj || sizeObj.quantity <= 0;
    }
    return item.stock_status === 'out_of_stock' || (item.stock_quantity !== undefined && item.stock_quantity <= 0);
  };

  const hasOutOfStockItems = items.some(checkItemOutOfStock);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-brand-navy/30 backdrop-blur-sm z-[60]"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-surface-white z-[70] shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-surface-light">
              <h2 className="text-xl font-sans tracking-widest uppercase font-bold text-typography-primary">Your Bag</h2>
              <button onClick={closeCart} className="text-typography-muted hover:text-brand-pink transition-colors">
                <X strokeWidth={1.5} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center opacity-60">
                  <p className="font-serif italic text-lg mb-2">Your bag is empty.</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold">Discover our latest arrivals</p>
                </div>
              ) : (
                items.map((item) => {
                  const isOutOfStock = checkItemOutOfStock(item);
                  const itemKey = getCartItemKey(item.id, item.selectedSize, item.selectedColor);
                  const isSelected = selectedCartKeys.includes(itemKey);

                  return (
                    <div key={itemKey} className={`flex items-center gap-4 border border-surface-light p-4 bg-white ${isOutOfStock ? 'opacity-70' : ''}`}>
                      <div className="flex-shrink-0 flex items-center justify-center">
                        <input
                          type="checkbox"
                          disabled={isOutOfStock}
                          checked={isSelected && !isOutOfStock}
                          onChange={() => toggleCartItemSelection(itemKey)}
                          className="w-4 h-4 rounded-none border-typography-primary text-brand-navy focus:ring-0 focus:ring-offset-0 cursor-pointer disabled:opacity-40"
                        />
                      </div>
                      <div className="w-24 h-32 bg-surface-offWhite flex-shrink-0 relative">
                        <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-red-900/10 flex items-center justify-center">
                            <span className="bg-red-600 text-white font-bold text-[8px] uppercase tracking-wider px-1.5 py-0.5 rounded">
                              Unavailable
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col flex-1 justify-between py-2">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h3 className="text-sm font-bold text-typography-primary leading-tight">{item.title}</h3>
                            <button onClick={() => removeFromCart(item.id, item.selectedSize, item.selectedColor)} className="text-typography-muted hover:text-brand-pink">
                              <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                            </button>
                          </div>
                          <p className="text-[10px] uppercase tracking-widest font-bold text-brand-peach">{item.brand}</p>
                          <div className="flex flex-wrap gap-1.5 mt-1">
                            {item.selectedSize && (
                              <span className="inline-block bg-surface-offWhite border border-surface-light text-typography-muted text-[10px] font-semibold px-2 py-0.5 rounded">
                                Size: {item.selectedSize}
                              </span>
                            )}
                            {item.selectedColor && (
                              <span className="inline-block bg-surface-offWhite border border-surface-light text-typography-muted text-[10px] font-semibold px-2 py-0.5 rounded">
                                Color: {item.selectedColor}
                              </span>
                            )}
                            {isOutOfStock && (
                              <span className="inline-block bg-red-50 border border-red-200 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded">
                                Out of Stock
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-end">
                          <p className="text-xs text-typography-muted font-medium">Qty: {item.quantity}</p>
                          <p className="text-sm font-bold text-typography-primary">PHP {(item.price * item.quantity).toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-surface-light bg-surface-offWhite space-y-4">
                {hasOutOfStockItems && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-red-700 text-xs font-semibold">
                    ⚠️ Your bag contains unavailable items. Please remove them to proceed to checkout.
                  </div>
                )}
                
                {/* Selected Items Summary */}
                {selectedCartItems.length > 0 && (
                  <div className="bg-white border border-surface-light">
                    <button 
                      onClick={() => setIsSummaryExpanded(!isSummaryExpanded)}
                      className="w-full flex items-center justify-between p-4 focus:outline-none"
                    >
                      <h4 className="text-[10px] uppercase font-bold tracking-widest text-typography-primary">
                        Selected Items ({selectedCartItems.length})
                      </h4>
                      {isSummaryExpanded ? (
                        <ChevronUp className="w-4 h-4 text-typography-muted" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-typography-muted" />
                      )}
                    </button>
                    
                    <AnimatePresence>
                      {isSummaryExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden"
                        >
                          <div className="px-4 pb-4 space-y-2 max-h-32 overflow-y-auto border-t border-surface-light mt-1 pt-3">
                            {selectedCartItems.map(item => (
                              <div key={getCartItemKey(item.id, item.selectedSize, item.selectedColor)} className="flex justify-between items-start text-xs text-typography-muted">
                                <span className="flex-1 pr-2 truncate">
                                  {item.quantity}x {item.title} 
                                  {item.selectedSize && ` (${item.selectedSize})`}
                                  {item.selectedColor && ` [${item.selectedColor}]`}
                                </span>
                                <span className="font-semibold text-typography-primary whitespace-nowrap">
                                  PHP {(item.price * item.quantity).toLocaleString()}
                                </span>
                              </div>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-xs uppercase tracking-widest font-bold text-typography-primary">Subtotal ({selectedCartItems.length} items)</span>
                  <span className="text-lg font-bold text-typography-primary">PHP {selectedCartTotal.toLocaleString()}</span>
                </div>
                
                {hasOutOfStockItems || selectedCartItems.length === 0 ? (
                  <button 
                    disabled
                    className="w-full bg-surface-light text-typography-muted py-4 text-[10px] uppercase tracking-widest font-bold cursor-not-allowed text-center block border border-surface-light"
                  >
                    Proceed to Checkout
                  </button>
                ) : (
                  <Link 
                    to="/checkout"
                    onClick={closeCart}
                    className="w-full bg-brand-navy text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-pink transition-colors text-center block"
                  >
                    Proceed to Checkout ({selectedCartItems.length})
                  </Link>
                )}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
