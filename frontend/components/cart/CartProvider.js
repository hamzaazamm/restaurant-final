'use client';

import { createContext, useContext, useReducer, useEffect } from 'react';

const CartContext = createContext(null);

const cartReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_ITEM': {
      const { product, variantId, variantName, extras, quantity, unitPricePKR } = action.payload;
      const key = `${product._id}-${variantId || 'base'}-${extras?.map(e => e._id).sort().join('-') || ''}`;
      const existingIdx = state.items.findIndex((i) => i.key === key);

      if (existingIdx >= 0) {
        const updated = [...state.items];
        const newQty = Math.min(updated[existingIdx].quantity + quantity, 20);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return { ...state, items: updated };
      }

      return {
        ...state,
        items: [
          ...state.items,
          { key, product, variantId, variantName, extras: extras || [], quantity, unitPricePKR },
        ],
      };
    }

    case 'UPDATE_QUANTITY': {
      const { key, quantity } = action.payload;
      if (quantity <= 0) {
        return { ...state, items: state.items.filter((i) => i.key !== key) };
      }
      return {
        ...state,
        items: state.items.map((i) =>
          i.key === key ? { ...i, quantity: Math.min(quantity, 20) } : i
        ),
      };
    }

    case 'REMOVE_ITEM':
      return { ...state, items: state.items.filter((i) => i.key !== action.payload.key) };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'HYDRATE':
      return { ...state, items: action.payload, hydrated: true };

    default:
      return state;
  }
};

const initialState = { items: [], hydrated: false };

export default function CartProvider({ children }) {
  const [state, dispatch] = useReducer(cartReducer, initialState);

  // Persist cart to localStorage
  useEffect(() => {
    if (state.hydrated) {
      try {
        localStorage.setItem('enb_cart', JSON.stringify(state.items));
      } catch {
        // localStorage unavailable — cart won't persist
      }
    }
  }, [state.items, state.hydrated]);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('enb_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          dispatch({ type: 'HYDRATE', payload: parsed });
          return;
        }
      }
    } catch {
      // Corrupted data — start fresh
    }
    dispatch({ type: 'HYDRATE', payload: [] });
  }, []);

  // Computed values
  const itemCount = state.items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = state.items.reduce((sum, i) => sum + i.unitPricePKR * i.quantity, 0);

  const addItem = (product, variantId, variantName, extras, quantity, unitPricePKR) =>
    dispatch({ type: 'ADD_ITEM', payload: { product, variantId, variantName, extras, quantity, unitPricePKR } });

  const updateQuantity = (key, quantity) =>
    dispatch({ type: 'UPDATE_QUANTITY', payload: { key, quantity } });

  const removeItem = (key) =>
    dispatch({ type: 'REMOVE_ITEM', payload: { key } });

  const clearCart = () =>
    dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ items: state.items, itemCount, subtotal, addItem, updateQuantity, removeItem, clearCart, hydrated: state.hydrated }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
