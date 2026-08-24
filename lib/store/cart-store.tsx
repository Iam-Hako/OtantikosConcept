'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { Product, ProductVariant, CartItem, DeliveryType } from '@/lib/types/ecommerce';
import { toast } from 'sonner';

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant?: ProductVariant | null, quantity?: number) => void;
  removeItem: (productId: string, variantId?: string | null) => void;
  updateQuantity: (productId: string, quantity: number, variantId?: string | null) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  shippingFee: number;
  giftWrapFee: number;
  hasGiftWrap: boolean;
  setHasGiftWrap: (val: boolean) => void;
  giftNote: string;
  setGiftNote: (val: string) => void;
  deliveryType: DeliveryType;
  setDeliveryType: (val: DeliveryType) => void;
  total: number;
  kdvAmount: number; // 20% included KDV breakdown
  isDrawerOpen: boolean;
  setIsDrawerOpen: (val: boolean) => void;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = 'otantikos_cart_v2';
const GIFT_OPTIONS_KEY = 'otantikos_gift_v2';
const GIFT_WRAP_PRICE = 50.00;
const STANDARD_SHIPPING_PRICE = 49.00;

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hasGiftWrap, setHasGiftWrap] = useState<boolean>(false);
  const [giftNote, setGiftNote] = useState<string>('');
  const [deliveryType, setDeliveryType] = useState<DeliveryType>('kargo');
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [isMounted, setIsMounted] = useState<boolean>(false);

  // Load from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        const parsed = JSON.parse(savedCart);
        if (Array.isArray(parsed)) {
          const validItems: CartItem[] = parsed.filter(
            (i: any) =>
              i &&
              typeof i === 'object' &&
              i.product &&
              typeof i.product === 'object' &&
              typeof i.product.id === 'string' &&
              typeof i.quantity === 'number' &&
              i.quantity > 0
          );
          setItems(validItems);
        }
      }
      const savedGift = localStorage.getItem(GIFT_OPTIONS_KEY);
      if (savedGift) {
        const parsed = JSON.parse(savedGift);
        if (parsed && typeof parsed === 'object') {
          setHasGiftWrap(Boolean(parsed.hasGiftWrap));
          setGiftNote(typeof parsed.giftNote === 'string' ? parsed.giftNote.slice(0, 500) : '');
          if (parsed.deliveryType === 'magaza_teslim' || parsed.deliveryType === 'kargo') {
            setDeliveryType(parsed.deliveryType);
          }
        }
      }
    } catch {
      // LocalStorage access error ignored
    }
  }, []);

  // Save to LocalStorage
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
      localStorage.setItem(
        GIFT_OPTIONS_KEY,
        JSON.stringify({ hasGiftWrap, giftNote, deliveryType })
      );
    } catch {
      // LocalStorage access error ignored
    }
  }, [items, hasGiftWrap, giftNote, deliveryType, isMounted]);

  const addItem = (product: Product, variant?: ProductVariant | null, quantity = 1) => {
    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex(
        (item) =>
          item.product.id === product.id &&
          (variant ? item.variant?.id === variant.id : !item.variant)
      );

      const maxStock = variant ? variant.stock : product.stock;

      if (existingIndex > -1) {
        const currentQty = prevItems[existingIndex].quantity;
        const newQty = Math.min(currentQty + quantity, maxStock);
        
        if (newQty === currentQty && currentQty >= maxStock) {
          toast.warning(`Stok sınırına ulaşıldı (Maksimum ${maxStock} adet).`);
          return prevItems;
        }

        const updated = [...prevItems];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const initialQty = Math.min(quantity, maxStock);
        return [...prevItems, { product, variant, quantity: initialQty }];
      }
    });

    const variantText = variant ? ` (${variant.value})` : '';
    toast.success(`${product.name}${variantText} sepete eklendi!`);
    setIsDrawerOpen(true);
  };

  const removeItem = (productId: string, variantId?: string | null) => {
    setItems((prevItems) =>
      prevItems.filter(
        (item) =>
          !(
            item.product.id === productId &&
            (variantId ? item.variant?.id === variantId : !item.variant)
          )
      )
    );
    toast.info('Ürün sepetten çıkarıldı.');
  };

  const updateQuantity = (productId: string, quantity: number, variantId?: string | null) => {
    if (quantity <= 0) {
      removeItem(productId, variantId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) => {
        if (
          item.product.id === productId &&
          (variantId ? item.variant?.id === variantId : !item.variant)
        ) {
          const maxStock = item.variant ? item.variant.stock : item.product.stock;
          return {
            ...item,
            quantity: Math.min(quantity, maxStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
    setHasGiftWrap(false);
    setGiftNote('');
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = items.reduce((sum, item) => {
    const itemPrice = item.variant?.price_override ?? item.product.price;
    return sum + itemPrice * item.quantity;
  }, 0);

  // Standard shipping (₺49.00) or Tahtakale Store Pick-up (₺0.00)
  const shippingFee =
    deliveryType === 'magaza_teslim' || items.length === 0
      ? 0
      : STANDARD_SHIPPING_PRICE;

  const giftWrapFee = hasGiftWrap && items.length > 0 ? GIFT_WRAP_PRICE : 0;
  const total = subtotal + shippingFee + giftWrapFee;

  // %20 KDV dahil dökümü
  const kdvAmount = subtotal > 0 ? subtotal - subtotal / 1.2 : 0;

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalItems,
        subtotal,
        shippingFee,
        giftWrapFee,
        hasGiftWrap,
        setHasGiftWrap,
        giftNote,
        setGiftNote,
        deliveryType,
        setDeliveryType,
        total,
        kdvAmount,
        isDrawerOpen,
        setIsDrawerOpen,
        openDrawer: () => setIsDrawerOpen(true),
        closeDrawer: () => setIsDrawerOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
