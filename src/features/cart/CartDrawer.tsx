import { motion, AnimatePresence } from "framer-motion";
import { X, Trash2 } from "lucide-react";
import { useCart } from "./CartContext";
import { Link } from "react-router-dom";

export function CartDrawer() {
  const { isCartOpen, closeCart, items, removeFromCart, cartTotal } = useCart();

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
                  <p className="text-[10px] uppercase tracking-widest font-bold">Discover our new arrivals</p>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 border-b border-surface-light pb-6">
                    <div className="w-24 h-32 bg-surface-offWhite flex-shrink-0">
                      <img src={item.image_urls[0]} alt={item.title} className="w-full h-full object-cover mix-blend-multiply" />
                    </div>
                    <div className="flex flex-col flex-1 justify-between py-2">
                      <div>
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-bold text-typography-primary leading-tight">{item.title}</h3>
                          <button onClick={() => removeFromCart(item.id)} className="text-typography-muted hover:text-brand-pink">
                            <Trash2 className="w-4 h-4" strokeWidth={1.5} />
                          </button>
                        </div>
                        <p className="text-[10px] uppercase tracking-widest font-bold text-brand-peach">{item.brand}</p>
                      </div>
                      <div className="flex justify-between items-end">
                        <p className="text-xs text-typography-muted font-medium">Qty: {item.quantity}</p>
                        <p className="text-sm font-bold text-typography-primary">PHP {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-surface-light bg-surface-offWhite">
                <div className="flex justify-between items-center mb-6">
                  <span className="text-xs uppercase tracking-widest font-bold text-typography-primary">Subtotal</span>
                  <span className="text-lg font-bold text-typography-primary">PHP {cartTotal.toLocaleString()}</span>
                </div>
                <Link 
                  to="/checkout"
                  onClick={closeCart}
                  className="w-full bg-brand-navy text-white py-4 text-[10px] uppercase tracking-widest font-bold hover:bg-brand-pink transition-colors text-center block"
                >
                  Proceed to Checkout
                </Link>
                <div className="mt-4 text-center">
                  <Link to="/cart" onClick={closeCart} className="text-[10px] uppercase tracking-widest text-typography-muted hover:text-brand-navy border-b border-transparent hover:border-brand-navy pb-0.5 transition-all">
                    View full bag
                  </Link>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
