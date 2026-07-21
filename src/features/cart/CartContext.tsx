import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Product } from '../products/types';

interface CartItem extends Product {
  quantity: number;
  selectedSize?: string | null;
  selectedColor?: string | null;
}

interface CartContextType {
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  items: CartItem[];
  addToCart: (product: Product & { selectedSize?: string | null, selectedColor?: string | null }) => void;
  updateQuantity: (productId: string, selectedSize?: string | null, selectedColor?: string | null, newQuantity?: number) => void;
  removeFromCart: (productId: string, selectedSize?: string | null, selectedColor?: string | null) => void;
  setCartItems: (items: CartItem[]) => void;
  clearCart: () => void;
  cartTotal: number;
  
  // Selection
  selectedCartKeys: string[];
  toggleCartItemSelection: (key: string) => void;
  selectAllCartItems: (keys: string[]) => void;
  selectedCartItems: CartItem[];
  selectedCartTotal: number;
  clearSelectedItems: () => void;
}

export const getCartItemKey = (productId: string, size?: string | null, color?: string | null) => {
  return `${productId}|${size || ''}|${color || ''}`;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [items, setItems] = useState<CartItem[]>(() => {
    try {
      const localData = localStorage.getItem('kbdf_cart_items');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });
  
  const [selectedCartKeys, setSelectedCartKeys] = useState<string[]>(() => {
    try {
      const localData = localStorage.getItem('kbdf_cart_selected_keys');
      return localData ? JSON.parse(localData) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('kbdf_cart_items', JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem('kbdf_cart_selected_keys', JSON.stringify(selectedCartKeys));
  }, [selectedCartKeys]);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);

  const getItemMaxStock = (product: Product & { selectedSize?: string | null }) => {
    let maxStock = product.stock_quantity ?? 999;
    if (product.sizes && product.sizes.length > 0 && product.selectedSize) {
      const sizeObj = product.sizes.find((s: any) => s.size === product.selectedSize);
      if (sizeObj && sizeObj.quantity !== undefined) {
        maxStock = sizeObj.quantity;
      }
    }
    return maxStock;
  };

  const addToCart = (product: Product & { selectedSize?: string | null, selectedColor?: string | null }) => {
    const key = getCartItemKey(product.id, product.selectedSize, product.selectedColor);
    const maxStock = getItemMaxStock(product);
    
    setItems(prev => {
      const existing = prev.find(item => item.id === product.id && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor);
      if (existing) {
        const newQty = Math.min(existing.quantity + 1, maxStock);
        return prev.map(item => (item.id === product.id && item.selectedSize === product.selectedSize && item.selectedColor === product.selectedColor) 
          ? { ...item, ...product, quantity: newQty } 
          : item
        );
      }
      return [...prev, { ...product, quantity: Math.min(1, maxStock) }];
    });
    
    setSelectedCartKeys(prev => {
      if (!prev.includes(key)) return [...prev, key];
      return prev;
    });
    
    openCart();
  };

  const updateQuantity = (productId: string, selectedSize?: string | null, selectedColor?: string | null, newQuantity: number = 1) => {
    if (newQuantity <= 0) {
      removeFromCart(productId, selectedSize, selectedColor);
      return;
    }

    setItems(prev => prev.map(item => {
      if (item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor) {
        const maxStock = getItemMaxStock(item);
        const clampedQuantity = Math.min(newQuantity, maxStock);
        return { ...item, quantity: clampedQuantity };
      }
      return item;
    }));
  };

  const removeFromCart = (productId: string, selectedSize?: string | null, selectedColor?: string | null) => {
    const keyToRemove = getCartItemKey(productId, selectedSize, selectedColor);
    setItems(prev => prev.filter(item => !(item.id === productId && item.selectedSize === selectedSize && item.selectedColor === selectedColor)));
    setSelectedCartKeys(prev => prev.filter(key => key !== keyToRemove));
  };

  const clearCart = () => {
    setItems([]);
    setSelectedCartKeys([]);
  };

  const setCartItems = (newItems: CartItem[]) => {
    setItems(newItems);
  };

  const cartTotal = items.reduce((total, item) => total + (item.price * item.quantity), 0);

  const toggleCartItemSelection = (key: string) => {
    setSelectedCartKeys(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const selectAllCartItems = (keys: string[]) => {
    setSelectedCartKeys(keys);
  };

  const selectedCartItems = items.filter(item => selectedCartKeys.includes(getCartItemKey(item.id, item.selectedSize, item.selectedColor)));
  
  const selectedCartTotal = selectedCartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  const clearSelectedItems = () => {
    setItems(prev => prev.filter(item => !selectedCartKeys.includes(getCartItemKey(item.id, item.selectedSize, item.selectedColor))));
    setSelectedCartKeys([]);
  };

  return (
    <CartContext.Provider value={{ 
      isCartOpen, openCart, closeCart, items, addToCart, updateQuantity, removeFromCart, setCartItems, clearCart, cartTotal,
      selectedCartKeys, toggleCartItemSelection, selectAllCartItems, selectedCartItems, selectedCartTotal, clearSelectedItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
};
