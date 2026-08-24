'use server';

import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { Product, Category, Order, ReturnRequest } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/server';

async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    // 1. Check JWT app_metadata
    if (user.app_metadata?.role === 'admin') return true;

    // 2. Check Database profile
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role === 'admin') return true;

    // 3. Fallback to confirmed owner account
    const isOwnerEmail =
      (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com') &&
      Boolean(user.email_confirmed_at);
    return isOwnerEmail;
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

export async function actionDeleteProduct(productId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.deleteProduct(productId);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: ok };
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

export async function actionDeleteCategory(categoryId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.deleteCategory(categoryId);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/kategoriler');
  return { success: ok };
}

export async function actionUpdateOrderStatus(
  orderId: string,
  status: Order['status'],
  trackingNumber?: string,
  trackingCarrier?: string,
  adminNotes?: string
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.updateOrderStatus(orderId, status, trackingNumber, trackingCarrier, adminNotes);
  revalidatePath('/siparis-takip');
  revalidatePath('/hesabim');
  revalidatePath('/admin/siparisler');
  revalidatePath(`/admin/siparisler/${orderId}`);
  return { success: ok };
}

export async function actionUpdateReturnStatus(returnId: string, status: ReturnRequest['status'], adminResponse?: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const ok = await DataService.updateReturnStatus(returnId, status, adminResponse);
  revalidatePath('/admin/iadeler');
  revalidatePath('/hesabim');
  return { success: ok };
}
