'use client';

import React, { createContext, useContext, useState } from 'react';
import { CartItem, Product } from '@/types';

// Función para calcular el subtotal respetando las promociones 2x1 y 3x2
export function getCartItemSubtotal(item: CartItem): number {
  const { product, quantity } = item;
  const promo = product.promoType || 'percentage';

  if (promo === '2x1') {
    // Cada par paga solo 1 unidad a precio de lista (originalPrice)
    const payableUnits = Math.floor(quantity / 2) + (quantity % 2);
    return payableUnits * product.originalPrice;
  }

  if (promo === '3x2') {
    // Cada trío paga 2 unidades a precio de lista
    const payableUnits = Math.floor(quantity / 3) * 2 + (quantity % 3);
    return payableUnits * product.originalPrice;
  }

  // Descuento por porcentaje tradicional
  return quantity * product.discountPrice;
}

interface CartContextType {
  cart: CartItem[];
  addItem: (product: Product, customQty?: number) => void;
  removeItem: (productId: string) => void;
  getItemQuantity: (productId: string) => number;
  totalItems: number;
  totalPrice: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);

  const addItem = (product: Product, customQty?: number) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);

      // Si es la primera vez que agrega una promo 2x1 o 3x2, añade el bloque entero (2 o 3 unidades)
      let qtyToAdd = customQty || 1;
      if (!existing && !customQty) {
        if (product.promoType === '2x1') {
          qtyToAdd = product.stock >= 2 ? 2 : 1;
        } else if (product.promoType === '3x2') {
          qtyToAdd = product.stock >= 3 ? 3 : 1;
        }
      }

      if (existing) {
        if (existing.quantity >= product.stock) return prevCart;
        const newQty = Math.min(product.stock, existing.quantity + (customQty || 1));
        return prevCart.map((item) =>
          item.product.id === product.id ? { ...item, quantity: newQty } : item
        );
      }

      return [...prevCart, { product, quantity: qtyToAdd }];
    });
  };

  const removeItem = (productId: string) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === productId);
      if (!existing) return prevCart;
      if (existing.quantity === 1) {
        return prevCart.filter((item) => item.product.id !== productId);
      }
      return prevCart.map((item) =>
        item.product.id === productId
          ? { ...item, quantity: item.quantity - 1 }
          : item
      );
    });
  };

  const getItemQuantity = (productId: string) => {
    return cart.find((item) => item.product.id === productId)?.quantity || 0;
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);

  const totalPrice = cart.reduce(
    (sum, item) => sum + getCartItemSubtotal(item),
    0
  );

  return (
    <CartContext.Provider
      value={{
        cart,
        addItem,
        removeItem,
        getItemQuantity,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart debe usarse dentro de CartProvider');
  return context;
};