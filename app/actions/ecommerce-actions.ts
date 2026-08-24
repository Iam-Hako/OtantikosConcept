'use server';

import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { Product, Category, Order } from '@/lib/types/ecommerce';

// Zero-Push Instant Live Revalidation Server Actions

export async function actionSaveProduct(productData: Partial<Product>) {
  const saved = await DataService.saveProduct(productData);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath(`/urun/${saved.slug}`);
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: true, product: saved };
}

export async function actionUpdateQuickStock(productId: string, stock: number, price: number) {
  const ok = await DataService.updateQuickStockAndPrice(productId, stock, price);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/hizli-stok');
  revalidatePath('/admin');
  return { success: ok };
}

export async function actionSaveCategory(catData: Partial<Category>) {
  const saved = await DataService.saveCategory(catData);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/kategoriler');
  return { success: true, category: saved };
}

export async function actionUpdateOrderStatus(orderId: string, status: Order['status'], trackingNumber?: string, trackingCarrier?: string) {
  const ok = await DataService.updateOrderStatus(orderId, status, trackingNumber, trackingCarrier);
  revalidatePath('/siparis-takip');
  revalidatePath('/hesabim');
  revalidatePath('/admin/siparisler');
  revalidatePath(`/admin/siparisler/${orderId}`);
  return { success: ok };
}
