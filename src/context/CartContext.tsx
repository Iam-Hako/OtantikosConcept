"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product } from "@/data/mockData";

export interface CartItem {
  product: Product;
  quantity: number;
  selectedVariant?: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (product: Product, quantity?: number, selectedVariant?: string) => void;
  removeFromCart: (productId: string, selectedVariant?: string) => void;
  updateQuantity: (productId: string, quantity: number, selectedVariant?: string) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shipping: number;
  grandTotal: number;
  appliedCoupon: string | null;
  applyCoupon: (code: string) => boolean;
  removeCoupon: () => void;
  discountAmount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [appliedCoupon, setAppliedCoupon] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedCart = localStorage.getItem("otantikos_cart");
      const savedCoupon = localStorage.getItem("otantikos_coupon");
      if (savedCart) setCart(JSON.parse(savedCart));
      if (savedCoupon) setAppliedCoupon(savedCoupon);
    } catch (e) {
      console.error("Cart localStorage load error:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("otantikos_cart", JSON.stringify(cart));
      if (appliedCoupon) {
        localStorage.setItem("otantikos_coupon", appliedCoupon);
      } else {
        localStorage.removeItem("otantikos_coupon");
      }
    }
  }, [cart, appliedCoupon, isLoaded]);

  const addToCart = (product: Product, quantity = 1, selectedVariant?: string) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex(
        (item) => item.product.id === product.id && item.selectedVariant === selectedVariant
      );

      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += quantity;
        return updated;
      }

      return [...prevCart, { product, quantity, selectedVariant }];
    });
  };

  const removeFromCart = (productId: string, selectedVariant?: string) => {
    setCart((prevCart) =>
      prevCart.filter(
        (item) => !(item.product.id === productId && item.selectedVariant === selectedVariant)
      )
    );
  };

  const updateQuantity = (productId: string, quantity: number, selectedVariant?: string) => {
    if (quantity <= 0) {
      removeFromCart(productId, selectedVariant);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => {
        if (item.product.id === productId && item.selectedVariant === selectedVariant) {
          return { ...item, quantity };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setCart([]);
    setAppliedCoupon(null);
  };

  const applyCoupon = (code: string): boolean => {
    const cleanCode = code.trim().toUpperCase();
    if (cleanCode === "OTANTIK10" || cleanCode === "HOŞGELDİN") {
      setAppliedCoupon(cleanCode);
      return true;
    }
    return false;
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.quantity, 0);

  const subtotal = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const discountAmount = appliedCoupon ? subtotal * 0.10 : 0; // %10 İndirim

  // Sabit kargo ücreti: Kargo bedava ibaresi kaldırıldı. Sepet boşsa 0, ürün varsa sabit 49.90 TL kargo ücreti eklenir.
  const shipping = subtotal === 0 ? 0 : 49.90;

  const grandTotal = Math.max(0, subtotal - discountAmount + shipping);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shipping,
        grandTotal,
        appliedCoupon,
        applyCoupon,
        removeCoupon,
        discountAmount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
