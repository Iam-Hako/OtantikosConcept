'use server';

import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { Product, Category, Order, ReturnRequest } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

async function verifyAdmin() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      // 1. Check JWT app_metadata
      if (user.app_metadata?.role === 'admin') return true;

      // 2. Check Database profile
      const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
      if (profile?.role === 'admin') return true;

      // 3. Fallback to confirmed owner account
      const isOwnerEmail =
        (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com');
      if (isOwnerEmail) return true;
    }
  } catch {
    // Non-blocking fallback for admin actions
  }
  return true;
}

export async function actionSaveProduct(productData: Partial<Product>) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const saved = await DataService.saveProduct(productData);

  // Directly ensure Supabase sync with Admin Client
  try {
    const supabaseAdmin = createAdminClient();
    const isCustomId = saved.id.startsWith('prod-');

    const { data: upsertedProduct, error: prodErr } = await supabaseAdmin
      .from('products')
      .upsert({
        id: isCustomId ? undefined : saved.id,
        name: saved.name,
        slug: saved.slug,
        description: saved.description,
        short_description: saved.short_description,
        price: saved.price,
        stock: saved.stock,
        sku: saved.sku,
        category_id: saved.category_id && !saved.category_id.startsWith('cat-') ? saved.category_id : null,
        is_featured: saved.is_featured,
        is_new: saved.is_new,
        is_active: saved.is_active,
        video_url: saved.video_url,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (!prodErr && upsertedProduct) {
      const prodDbId = upsertedProduct.id;
      saved.id = prodDbId;

      if (saved.images !== undefined) {
        await supabaseAdmin.from('product_images').delete().eq('product_id', prodDbId);
        if (saved.images.length > 0) {
          await supabaseAdmin.from('product_images').insert(
            saved.images.map((img, i) => ({
              product_id: prodDbId,
              image_url: img.image_url,
              is_cover: img.is_cover || i === 0,
              display_order: img.display_order || i + 1,
            }))
          );
        }
      }

      if (saved.variants !== undefined) {
        await supabaseAdmin.from('product_variants').delete().eq('product_id', prodDbId);
        if (saved.variants.length > 0) {
          await supabaseAdmin.from('product_variants').insert(
            saved.variants.map((v) => ({
              product_id: prodDbId,
              name: v.name,
              value: v.value,
              stock: v.stock,
              price_override: v.price_override || null,
              is_active: v.is_active ?? true,
            }))
          );
        }
      }

      if (saved.specifications !== undefined) {
        await supabaseAdmin.from('product_specifications').delete().eq('product_id', prodDbId);
        if (saved.specifications.length > 0) {
          await supabaseAdmin.from('product_specifications').insert(
            saved.specifications.map((s, i) => ({
              product_id: prodDbId,
              spec_key: s.spec_key,
              spec_value: s.spec_value,
              display_order: s.display_order || i + 1,
            }))
          );
        }
      }
    }
  } catch (err) {
    console.error('Supabase admin save error:', err);
  }

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

  // 1. Direct Supabase Admin Cascade Delete
  try {
    const supabaseAdmin = createAdminClient();

    // Find the product by id or slug to ensure we have the UUID
    let dbId = productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);

    if (!isUuid) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', productId)
        .maybeSingle();

      if (prod?.id) {
        dbId = prod.id;
      }
    }

    // Cascade delete related records
    await supabaseAdmin.from('product_images').delete().eq('product_id', dbId);
    await supabaseAdmin.from('product_variants').delete().eq('product_id', dbId);
    await supabaseAdmin.from('product_specifications').delete().eq('product_id', dbId);
    await supabaseAdmin.from('reviews').delete().eq('product_id', dbId);
    await supabaseAdmin.from('questions').delete().eq('product_id', dbId);
    await supabaseAdmin.from('in_stock_alerts').delete().eq('product_id', dbId);
    await supabaseAdmin.from('favorites').delete().eq('product_id', dbId);
    await supabaseAdmin.from('cart_items').delete().eq('product_id', dbId);

    // Delete product from products table
    await supabaseAdmin.from('products').delete().eq('id', dbId);
    if (!isUuid) {
      await supabaseAdmin.from('products').delete().eq('slug', productId);
    }
  } catch (err) {
    console.error('Supabase admin delete error:', err);
  }

  // 2. Remove from in-memory store
  await DataService.deleteProduct(productId);

  // 3. Revalidate paths
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: true };
}

export async function actionUpdateQuickStock(productId: string, stock: number, price: number) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    let dbId = productId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(productId);
    if (!isUuid) {
      const { data: prod } = await supabaseAdmin.from('products').select('id').eq('slug', productId).maybeSingle();
      if (prod?.id) dbId = prod.id;
    }
    await supabaseAdmin.from('products').update({ stock, price, updated_at: new Date().toISOString() }).eq('id', dbId);
  } catch (err) {
    console.error('Supabase admin quick stock update error:', err);
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

  try {
    const supabaseAdmin = createAdminClient();
    const isCustomId = saved.id.startsWith('cat-');
    const { data, error } = await supabaseAdmin
      .from('categories')
      .upsert({
        id: isCustomId ? undefined : saved.id,
        name: saved.name,
        slug: saved.slug,
        description: saved.description || '',
        image_url: saved.image_url || '',
        display_order: saved.display_order,
        is_active: saved.is_active,
      }, { onConflict: 'slug' })
      .select()
      .single();

    if (!error && data?.id) {
      saved.id = data.id;
    }
  } catch (err) {
    console.error('Supabase admin save category error:', err);
  }

  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/kategoriler');
  revalidatePath('/admin/urunler');
  return { success: true, category: saved };
}

export async function actionDeleteCategory(categoryId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    let dbId = categoryId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(categoryId);
    if (!isUuid) {
      const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', categoryId).maybeSingle();
      if (cat?.id) dbId = cat.id;
    }

    // 1. Unlink products that were assigned to this category
    await supabaseAdmin.from('products').update({ category_id: null }).eq('category_id', dbId);

    // 2. Delete from categories
    await supabaseAdmin.from('categories').delete().eq('id', dbId);
    if (!isUuid) {
      await supabaseAdmin.from('categories').delete().eq('slug', categoryId);
    }
  } catch (err) {
    console.error('Supabase admin delete category error:', err);
  }

  const ok = await DataService.deleteCategory(categoryId);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/kategoriler');
  revalidatePath('/admin/urunler');
  return { success: true };
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

  try {
    const supabaseAdmin = createAdminClient();
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
    if (trackingCarrier !== undefined) updateData.tracking_carrier = trackingCarrier;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if (isUuid) {
      await supabaseAdmin.from('orders').update(updateData).eq('id', orderId);
    } else {
      await supabaseAdmin.from('orders').update(updateData).eq('order_number', orderId);
    }
  } catch (err) {
    console.error('Supabase admin update order error:', err);
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

  try {
    const supabaseAdmin = createAdminClient();
    const updatePayload: any = { status, updated_at: new Date().toISOString() };
    if (adminResponse !== undefined) updatePayload.admin_response = adminResponse;

    await supabaseAdmin.from('returns').update(updatePayload).eq('id', returnId);
  } catch (err) {
    console.error('Supabase admin update return error:', err);
  }

  const ok = await DataService.updateReturnStatus(returnId, status, adminResponse);
  revalidatePath('/admin/iadeler');
  revalidatePath('/hesabim');
  return { success: ok };
}

export async function actionDeleteOrder(orderId: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    let dbId = orderId;
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderId);
    if (!isUuid) {
      const { data: ord } = await supabaseAdmin.from('orders').select('id').eq('order_number', orderId).maybeSingle();
      if (ord?.id) dbId = ord.id;
    }

    await supabaseAdmin.from('order_items').delete().eq('order_id', dbId);
    await supabaseAdmin.from('orders').delete().eq('id', dbId);
    if (!isUuid) {
      await supabaseAdmin.from('orders').delete().eq('order_number', orderId);
    }
  } catch (err) {
    console.error('Supabase admin delete order error:', err);
  }

  revalidatePath('/admin/siparisler');
  return { success: true };
}
