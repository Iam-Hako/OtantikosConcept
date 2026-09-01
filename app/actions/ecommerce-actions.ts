'use server';

import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { Product, Category, Order, ReturnRequest, AccountingTransaction } from '@/lib/types/ecommerce';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function getCurrentAdminUser() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    if (user.app_metadata?.role === 'admin') return user;
    const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();
    if (profile?.role === 'admin') return user;
    const isOwnerEmail = (user.email === 'chessvip11@gmail.com' || user.email === 'admin@otantikosconcept.com');
    if (isOwnerEmail) return user;
  } catch {
    // Fallback
  }
  return null;
}

async function verifyAdmin() {
  const user = await getCurrentAdminUser();
  return Boolean(user);
}

export async function actionSaveProduct(productData: Partial<Product>) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  const saved = await DataService.saveProduct(productData);

  try {
    const supabaseAdmin = createAdminClient();
    const isUuid = saved.id && UUID_REGEX.test(saved.id);

    // Resolve category UUID if needed
    let categoryDbId = saved.category_id && UUID_REGEX.test(saved.category_id) ? saved.category_id : null;
    if (!categoryDbId && saved.category?.slug) {
      const { data: catRow } = await supabaseAdmin
        .from('categories')
        .select('id')
        .eq('slug', saved.category.slug)
        .maybeSingle();
      if (catRow?.id) categoryDbId = catRow.id;
    }

    const payload: any = {
      name: saved.name,
      slug: saved.slug,
      description: saved.description,
      short_description: saved.short_description || '',
      price: Number(saved.price) || 0,
      stock: Math.max(0, Number(saved.stock) || 0),
      sku: saved.sku,
      category_id: categoryDbId,
      is_featured: Boolean(saved.is_featured),
      is_new: saved.is_new ?? true,
      is_active: saved.is_active ?? true,
      video_url: saved.video_url || null,
      updated_at: new Date().toISOString(),
    };

    let upsertedProduct: any = null;

    if (isUuid) {
      // Existing product with verified UUID: update or upsert by ID to allow slug renaming!
      payload.id = saved.id;
      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (!error && data) upsertedProduct = data;
    } else {
      // New product: upsert by slug
      const { data, error } = await supabaseAdmin
        .from('products')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();
      if (!error && data) upsertedProduct = data;
    }

    if (upsertedProduct) {
      const prodDbId = upsertedProduct.id;
      saved.id = prodDbId;

      // Update runtime in-memory representation
      DataService.syncRuntimeProductId(productData.id || '', prodDbId);

      // 1. Sync Product Images
      if (saved.images !== undefined) {
        await supabaseAdmin.from('product_images').delete().eq('product_id', prodDbId);
        if (saved.images.length > 0) {
          const hasExplicitCover = saved.images.some(img => img.is_cover);
          await supabaseAdmin.from('product_images').insert(
            saved.images.map((img, i) => ({
              product_id: prodDbId,
              image_url: img.image_url,
              is_cover: img.is_cover === true || (!hasExplicitCover && i === 0),
              display_order: img.display_order || i + 1,
              alt_text: img.alt_text || saved.name,
            }))
          );
        }
      }

      // 2. Sync Product Variants
      if (saved.variants !== undefined) {
        await supabaseAdmin.from('product_variants').delete().eq('product_id', prodDbId);
        if (saved.variants.length > 0) {
          await supabaseAdmin.from('product_variants').insert(
            saved.variants.map((v) => ({
              product_id: prodDbId,
              name: v.name,
              value: v.value,
              stock: Math.max(0, Number(v.stock) || 0),
              price_override: v.price_override ? Number(v.price_override) : null,
              sku: v.sku || null,
              image_url: v.image_url || null,
              is_active: v.is_active ?? true,
            }))
          );
        }
      }

      // 3. Sync Product Specifications
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

  try {
    const supabaseAdmin = createAdminClient();
    let dbId = productId;
    const isUuid = UUID_REGEX.test(productId);

    if (!isUuid) {
      const { data: prod } = await supabaseAdmin
        .from('products')
        .select('id')
        .eq('slug', productId)
        .maybeSingle();
      if (prod?.id) dbId = prod.id;
    }

    if (UUID_REGEX.test(dbId)) {
      await supabaseAdmin.from('product_images').delete().eq('product_id', dbId);
      await supabaseAdmin.from('product_variants').delete().eq('product_id', dbId);
      await supabaseAdmin.from('product_specifications').delete().eq('product_id', dbId);
      await supabaseAdmin.from('reviews').delete().eq('product_id', dbId);
      await supabaseAdmin.from('questions').delete().eq('product_id', dbId);
      await supabaseAdmin.from('in_stock_alerts').delete().eq('product_id', dbId);
      await supabaseAdmin.from('favorites').delete().eq('product_id', dbId);
      await supabaseAdmin.from('cart_items').delete().eq('product_id', dbId);
      await supabaseAdmin.from('products').delete().eq('id', dbId);
    } else {
      await supabaseAdmin.from('products').delete().eq('slug', productId);
    }
  } catch (err) {
    console.error('Supabase admin delete product error:', err);
  }

  const ok = await DataService.deleteProduct(productId);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: ok };
}

export async function actionUpdateQuickStock(
  productId: string, 
  stock: number, 
  price: number, 
  costPrice?: number | null,
  wholesalePrice?: number | null, 
  isPublished?: boolean
) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    let dbId = productId;
    const isUuid = UUID_REGEX.test(productId);
    if (!isUuid) {
      const { data: prod } = await supabaseAdmin.from('products').select('id').eq('slug', productId).maybeSingle();
      if (prod?.id) dbId = prod.id;
    }

    if (UUID_REGEX.test(dbId)) {
      const payload: any = { stock: Math.max(0, stock), price: Math.max(0, price), updated_at: new Date().toISOString() };
      if (costPrice !== undefined) payload.cost_price = costPrice;
      if (wholesalePrice !== undefined) payload.wholesale_price = wholesalePrice;
      if (isPublished !== undefined) payload.is_published = isPublished;

      await supabaseAdmin.from('products').update(payload).eq('id', dbId);
    } else {
      const payload: any = { stock: Math.max(0, stock), price: Math.max(0, price), updated_at: new Date().toISOString() };
      if (costPrice !== undefined) payload.cost_price = costPrice;
      if (wholesalePrice !== undefined) payload.wholesale_price = wholesalePrice;
      if (isPublished !== undefined) payload.is_published = isPublished;

      await supabaseAdmin.from('products').update(payload).eq('slug', productId);
    }
  } catch (err) {
    console.error('Supabase admin quick stock update error:', err);
  }

  const ok = await DataService.updateQuickStockAndPrice(productId, stock, price, costPrice, wholesalePrice, isPublished);
  revalidatePath('/');
  revalidatePath('/kategori/[slug]', 'page');
  revalidatePath('/admin/hizli-stok');
  revalidatePath('/admin/kar-zarar');
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
    const isUuid = saved.id && UUID_REGEX.test(saved.id);

    const payload: any = {
      name: saved.name,
      slug: saved.slug,
      description: saved.description || '',
      image_url: saved.image_url || '',
      display_order: saved.display_order,
      is_active: saved.is_active,
    };

    if (isUuid) {
      payload.id = saved.id;
      const { data, error } = await supabaseAdmin
        .from('categories')
        .upsert(payload, { onConflict: 'id' })
        .select()
        .single();
      if (!error && data?.id) saved.id = data.id;
    } else {
      const { data, error } = await supabaseAdmin
        .from('categories')
        .upsert(payload, { onConflict: 'slug' })
        .select()
        .single();
      if (!error && data?.id) saved.id = data.id;
    }

    DataService.syncRuntimeCategoryId(catData.id || '', saved.id);
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
    const isUuid = UUID_REGEX.test(categoryId);
    if (!isUuid) {
      const { data: cat } = await supabaseAdmin.from('categories').select('id').eq('slug', categoryId).maybeSingle();
      if (cat?.id) dbId = cat.id;
    }

    if (UUID_REGEX.test(dbId)) {
      // 1. Unlink products referencing this category
      await supabaseAdmin.from('products').update({ category_id: null }).eq('category_id', dbId);
      // 2. Delete from categories table
      await supabaseAdmin.from('categories').delete().eq('id', dbId);
    } else {
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

  try {
    const supabaseAdmin = createAdminClient();
    const updateData: any = { status, updated_at: new Date().toISOString() };
    if (trackingNumber !== undefined) updateData.tracking_number = trackingNumber;
    if (trackingCarrier !== undefined) updateData.tracking_carrier = trackingCarrier;
    if (adminNotes !== undefined) updateData.admin_notes = adminNotes;

    const isUuid = UUID_REGEX.test(orderId);
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

  // Normalize status to valid PostgreSQL enum
  let validStatus = status;
  if (status === 'kargo_bekleniyor' as any || status === 'inceleniyor' as any) {
    validStatus = 'talep_alindi';
  }

  try {
    const supabaseAdmin = createAdminClient();
    const updatePayload: any = { status: validStatus, updated_at: new Date().toISOString() };
    if (adminResponse !== undefined) updatePayload.admin_response = adminResponse;

    const isUuid = UUID_REGEX.test(returnId);
    if (isUuid) {
      await supabaseAdmin.from('returns').update(updatePayload).eq('id', returnId);
    }
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
    const isUuid = UUID_REGEX.test(orderId);
    if (!isUuid) {
      const { data: ord } = await supabaseAdmin.from('orders').select('id').eq('order_number', orderId).maybeSingle();
      if (ord?.id) dbId = ord.id;
    }

    if (UUID_REGEX.test(dbId)) {
      await supabaseAdmin.from('order_items').delete().eq('order_id', dbId);
      await supabaseAdmin.from('orders').delete().eq('id', dbId);
    } else {
      await supabaseAdmin.from('orders').delete().eq('order_number', orderId);
    }
  } catch (err) {
    console.error('Supabase admin delete order error:', err);
  }

  revalidatePath('/admin/siparisler');
  return { success: true };
}

export interface CargoLabelData {
  id?: string;
  recipient_name: string;
  phone?: string | null;
  address: string;
  order_number?: string | null;
  print_count?: number;
  created_at?: string;
}

export async function actionGetCargoLabels(): Promise<{ success: boolean; data: CargoLabelData[]; error?: string }> {
  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('cargo_labels')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        return { success: false, data: [], error: 'TABLE_NOT_FOUND' };
      }
      return { success: false, data: [], error: error.message };
    }
    return { success: true, data: data || [] };
  } catch (err: any) {
    return { success: false, data: [], error: err?.message || 'Bilinmeyen hata' };
  }
}

export async function actionSaveCargoLabel(labelData: {
  id?: string;
  recipient_name: string;
  phone?: string;
  address: string;
  order_number?: string;
  print_count?: number;
}): Promise<{ success: boolean; data?: CargoLabelData; error?: string }> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const payload = {
      recipient_name: labelData.recipient_name.trim().toUpperCase(),
      phone: labelData.phone?.trim() || null,
      address: labelData.address.trim().toUpperCase(),
      order_number: labelData.order_number?.trim() || null,
      print_count: Math.max(1, labelData.print_count || 1),
      updated_at: new Date().toISOString(),
    };

    let result;
    if (labelData.id && UUID_REGEX.test(labelData.id)) {
      result = await supabaseAdmin
        .from('cargo_labels')
        .update(payload)
        .eq('id', labelData.id)
        .select()
        .maybeSingle();
    } else {
      result = await supabaseAdmin
        .from('cargo_labels')
        .insert({
          ...payload,
          created_at: new Date().toISOString(),
        })
        .select()
        .maybeSingle();
    }

    if (result.error) {
      return { success: false, error: result.error.message };
    }

    revalidatePath('/admin/kargo-etiketi');
    return { success: true, data: result.data };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Veritabanı kayıt hatası' };
  }
}

export async function actionDeleteCargoLabel(id: string): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('cargo_labels').delete().eq('id', id);
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/kargo-etiketi');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export async function actionClearAllCargoLabels(): Promise<{ success: boolean; error?: string }> {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { error } = await supabaseAdmin.from('cargo_labels').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    if (error) return { success: false, error: error.message };

    revalidatePath('/admin/kargo-etiketi');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message };
  }
}

export interface AdminUserListItem {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: 'customer' | 'admin';
  avatar_url: string | null;
  created_at: string;
}

export async function actionGetUsers(): Promise<{ 
  success: boolean; 
  data: AdminUserListItem[]; 
  currentUserId?: string; 
  error?: string 
}> {
  const currentAdmin = await getCurrentAdminUser();
  if (!currentAdmin) {
    return { success: false, data: [], error: 'Bu işlem için yönetici yetkisi gereklidir.' };
  }

  try {
    const supabaseAdmin = createAdminClient();
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('id, email, full_name, phone, role, avatar_url, created_at')
      .order('created_at', { ascending: false });

    if (error) {
      return { success: false, data: [], error: error.message };
    }

    return { 
      success: true, 
      data: (data || []) as AdminUserListItem[],
      currentUserId: currentAdmin.id
    };
  } catch (err: any) {
    return { success: false, data: [], error: err?.message || 'Kullanıcılar alınırken hata oluştu.' };
  }
}

export async function actionUpdateUserRole(
  targetUserId: string,
  newRole: 'admin' | 'customer'
): Promise<{ success: boolean; error?: string }> {
  const currentAdmin = await getCurrentAdminUser();
  if (!currentAdmin) {
    return { success: false, error: 'Bu işlem için yönetici yetkisi gereklidir.' };
  }

  // Self-demotion guard
  if (currentAdmin.id === targetUserId && newRole !== 'admin') {
    return { success: false, error: 'Kendi yöneticilik (admin) yetkinizi kaldıramazsınız.' };
  }

  if (newRole !== 'admin' && newRole !== 'customer') {
    return { success: false, error: 'Geçersiz yetki türü.' };
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 1. Update public.profiles
    const { error: profileErr } = await supabaseAdmin
      .from('profiles')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', targetUserId);

    if (profileErr) {
      return { success: false, error: 'Profil yetkisi güncellenemedi: ' + profileErr.message };
    }

    // 2. Sync Supabase Auth app_metadata
    try {
      await supabaseAdmin.auth.admin.updateUserById(targetUserId, {
        app_metadata: { role: newRole }
      });
    } catch (authErr) {
      console.warn('Auth app_metadata update warning:', authErr);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/kullanicilar');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Yetki güncelleme sırasında beklenmeyen bir hata oluştu.' };
  }
}


export async function actionToggleProductPublish(productId: string, isPublished: boolean) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  await DataService.toggleProductPublish(productId, isPublished);

  try {
    const supabaseAdmin = createAdminClient();
    await supabaseAdmin
      .from('products')
      .update({ is_published: isPublished, updated_at: new Date().toISOString() })
      .eq('id', productId);
  } catch (err) {
    console.warn('Supabase toggle publish sync warning:', err);
  }

  revalidatePath('/');
  revalidatePath('/admin/urunler');
  revalidatePath('/admin/hizli-stok');
  return { success: true };
}

export async function actionSaveAccountingTransaction(txData: Partial<AccountingTransaction>) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    const savedTx = await DataService.saveAccountingTransaction(txData);

    try {
      const supabaseAdmin = createAdminClient();
      const payload: any = {
        type: savedTx.type,
        product_id: savedTx.product_id && UUID_REGEX.test(savedTx.product_id) ? savedTx.product_id : null,
        product_name: savedTx.product_name,
        quantity: savedTx.quantity,
        unit_price: savedTx.unit_price,
        total_amount: savedTx.total_amount,
        unit_cost: savedTx.unit_cost,
        total_cost: savedTx.total_cost,
        net_profit: savedTx.net_profit,
        customer_name: savedTx.customer_name,
        customer_phone: savedTx.customer_phone,
        sale_channel: savedTx.sale_channel,
        supplier_name: savedTx.supplier_name,
        payment_method: savedTx.payment_method,
        payment_status: savedTx.payment_status || (savedTx.payment_method === 'veresiye' ? 'pending' : 'paid'),
        due_date: savedTx.due_date || null,
        document_no: savedTx.document_no,
        notes: savedTx.notes,
        transaction_date: savedTx.transaction_date,
        update_stock: savedTx.update_stock,
        updated_at: new Date().toISOString(),
      };

      if (savedTx.id && UUID_REGEX.test(savedTx.id)) {
        payload.id = savedTx.id;
      }

      await supabaseAdmin.from('accounting_transactions').upsert(payload);

      // If stock update was requested, directly fetch current product from DB and update stock
      if (savedTx.product_id && savedTx.update_stock) {
        let dbId = savedTx.product_id;
        const isUuid = UUID_REGEX.test(dbId);
        
        let currentProd: any = null;
        if (isUuid) {
          const { data } = await supabaseAdmin.from('products').select('id, stock, cost_price').eq('id', dbId).maybeSingle();
          currentProd = data;
        } else {
          const { data } = await supabaseAdmin.from('products').select('id, stock, cost_price').eq('slug', dbId).maybeSingle();
          currentProd = data;
        }

        if (currentProd) {
          const currentStock = Number(currentProd.stock) || 0;
          const newStock = savedTx.type === 'purchase'
            ? currentStock + Number(savedTx.quantity)
            : Math.max(0, currentStock - Number(savedTx.quantity));

          const updatePayload: any = { 
            stock: newStock, 
            updated_at: new Date().toISOString() 
          };

          if (savedTx.type === 'purchase' && savedTx.unit_price > 0) {
            updatePayload.cost_price = savedTx.unit_price;
          }

          await supabaseAdmin
            .from('products')
            .update(updatePayload)
            .eq('id', currentProd.id);
        }
      }
    } catch (err) {
      console.warn('Accounting Supabase sync notice:', err);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/kar-zarar');
    revalidatePath('/admin/urunler');
    revalidatePath('/admin/hizli-stok');
    return { success: true, transaction: savedTx };
  } catch (err: any) {
    return { success: false, error: err?.message || 'İşlem kaydedilirken bir hata oluştu.' };
  }
}

export async function actionToggleTransactionPaymentStatus(id: string, newStatus: 'paid' | 'pending') {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    await DataService.toggleTransactionPaymentStatus(id, newStatus);

    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from('accounting_transactions')
        .update({ payment_status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', id);
    } catch (err) {
      console.warn('Accounting status toggle sync notice:', err);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/kar-zarar');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Ödeme durumu güncellenemedi.' };
  }
}

export async function actionDeleteAccountingTransaction(id: string) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    await DataService.deleteAccountingTransaction(id);

    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin.from('accounting_transactions').delete().eq('id', id);
    } catch (err) {
      console.warn('Accounting delete sync notice:', err);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/kar-zarar');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'İşlem silinirken bir hata oluştu.' };
  }
}

export async function actionUpdateProductCostPrice(productId: string, costPrice: number) {
  const isAdmin = await verifyAdmin();
  if (!isAdmin) {
    return { success: false, error: 'Bu işlem için yetkiniz bulunmamaktadır.' };
  }

  try {
    await DataService.updateProductCostPrice(productId, costPrice);

    try {
      const supabaseAdmin = createAdminClient();
      await supabaseAdmin
        .from('products')
        .update({ cost_price: costPrice, updated_at: new Date().toISOString() })
        .eq('id', productId);
    } catch (err) {
      console.warn('Product cost price sync notice:', err);
    }

    revalidatePath('/admin');
    revalidatePath('/admin/kar-zarar');
    revalidatePath('/admin/hizli-stok');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Maliyet fiyatı güncellenemedi.' };
  }
}


