'use client';

import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { Product } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/lib/store/auth-context';
import { toast } from 'sonner';

interface WishlistContextType {
  favorites: Product[];
  toggleFavorite: (product: Product) => void;
  isFavorite: (productId: string) => boolean;
  totalFavorites: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = 'otantikos_wishlist_v2';
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const { user } = useAuth();
  const supabase = createClient();
  const isSyncingRef = useRef(false);

  // 1. Initial Load from LocalStorage
  useEffect(() => {
    setIsMounted(true);
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (saved) {
        setFavorites(JSON.parse(saved));
      }
    } catch {
      // Ignore storage error
    }
  }, []);

  // 2. Sync with Supabase when logged in
  useEffect(() => {
    if (!isMounted || !user?.id || !UUID_REGEX.test(user.id)) return;

    async function syncFromSupabase() {
      try {
        isSyncingRef.current = true;
        const { data, error } = await supabase
          .from('favorites')
          .select('product_id, products(*, images:product_images(*), variants:product_variants(*), specifications:product_specifications(*))')
          .eq('user_id', user!.id);

        if (!error && data) {
          const dbProducts = data
            .map((row: any) => row.products)
            .filter(Boolean) as Product[];

          setFavorites((prev) => {
            const mergedMap = new Map<string, Product>();
            prev.forEach((p) => mergedMap.set(p.id, p));
            dbProducts.forEach((p) => mergedMap.set(p.id, p));
            const merged = Array.from(mergedMap.values());
            try {
              localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(merged));
            } catch {}
            return merged;
          });
        }
      } catch {
        // Fallback
      } finally {
        isSyncingRef.current = false;
      }
    }

    syncFromSupabase();
  }, [user?.id, isMounted]);

  // 3. Save to LocalStorage on state change
  useEffect(() => {
    if (!isMounted) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(favorites));
    } catch {
      // Ignore storage error
    }
  }, [favorites, isMounted]);

  const toggleFavorite = async (product: Product) => {
    const exists = favorites.some((p) => p.id === product.id);

    if (exists) {
      toast.info(`${product.name} favorilerden çıkarıldı.`);
      setFavorites((prev) => prev.filter((p) => p.id !== product.id));

      if (user?.id && UUID_REGEX.test(user.id) && UUID_REGEX.test(product.id)) {
        try {
          await supabase
            .from('favorites')
            .delete()
            .eq('user_id', user.id)
            .eq('product_id', product.id);
        } catch {
          // Fallback
        }
      }
    } else {
      toast.success(`${product.name} favorilere eklendi!`);
      setFavorites((prev) => [...prev, product]);

      if (user?.id && UUID_REGEX.test(user.id) && UUID_REGEX.test(product.id)) {
        try {
          await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              product_id: product.id,
            });
        } catch {
          // Fallback
        }
      }
    }
  };

  const isFavorite = (productId: string) => {
    return favorites.some((p) => p.id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        favorites,
        toggleFavorite,
        isFavorite,
        totalFavorites: favorites.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
