'use server';

import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { Product, Category, Order } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;
    if (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com') return true;
    if (user.app_metadata?.role === 'admin') return true;

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    return profile?.role === 'admin';
  } catch {
    return false;
  }
}

export async function actionSaveProduct(productData: Partial<Product>) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const saved = await DataService.saveProduct(productData);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath(`/urun/${saved.slug}`);
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: true, product: saved };
}

export async function actionUpdateQuickStock(productId: string, stock: number, price: number) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.updateQuickStockAndPrice(productId, stock, price);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/hizli-stok');
  revalidatePath('/admin');
  return { success: ok };
}

export async function actionSaveCategory(catData: Partial<Category>) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const saved = await DataService.saveCategory(catData);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/kategoriler');
  return { success: true, category: saved };
}

export async function actionUpdateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string, trackingCarrier?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.updateOrderStatus(orderId, status, trackingNumber, trackingCarrier);
  revalidatePath('/siparis-takip');
  revalidatePath('/hesabim');
  revalidatePath('/admin/siparisler');
  revalidatePath(`/admin/siparisler/${orderId}`);
  return { success: ok };
}
