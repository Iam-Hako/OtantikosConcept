import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { createDhlShipment } from '@/lib/services/dhl-service';
import { createAdminClient } from '@/lib/supabase/admin';
import { createClient as createServerClient } from '@/lib/supabase/server';
import { verifyAdminAuth } from '@/lib/supabase/auth-guard';

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function POST(request: Request) {
  try {
    const auth = await verifyAdminAuth();
    if (!auth.isAuthorized) {
      return NextResponse.json(
        { error: auth.error || 'DHL kargo etiketi oluşturmak için yönetici yetkisi gereklidir.' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { order_id, order_number, weight_kg, package_count, description } = body;

    if (!order_id && !order_number) {
      return NextResponse.json({ error: 'Sipariş ID veya sipariş numarası zorunludur.' }, { status: 400 });
    }

    let order: any = null;
    const supabaseAdmin = createAdminClient();

    // 1. Direct Supabase query via Admin client
    try {
      if (order_id && UUID_REGEX.test(order_id)) {
        const { data } = await supabaseAdmin
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('id', order_id)
          .maybeSingle();
        if (data) order = data;
      }
      if (!order && order_number) {
        const { data } = await supabaseAdmin
          .from('orders')
          .select('*, items:order_items(*)')
          .eq('order_number', String(order_number).trim().toUpperCase())
          .maybeSingle();
        if (data) order = data;
      }
    } catch {
      // Fallback
    }

    // 2. Fallback to SSR cookie client
    if (!order) {
      try {
        const serverSupabase = await createServerClient();
        if (order_id && UUID_REGEX.test(order_id)) {
          const { data } = await serverSupabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('id', order_id)
            .maybeSingle();
          if (data) order = data;
        }
        if (!order && order_number) {
          const { data } = await serverSupabase
            .from('orders')
            .select('*, items:order_items(*)')
            .eq('order_number', String(order_number).trim().toUpperCase())
            .maybeSingle();
          if (data) order = data;
        }
      } catch {
        // Fallback
      }
    }

    // 3. Fallback to DataService in-memory store
    if (!order && order_id) {
      order = await DataService.getOrderById(order_id);
    }
    if (!order && order_number) {
      order = await DataService.getOrderByNumber(order_number);
    }

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    const shipping = (order.shipping_address || {}) as any;
    const addressLine =
      shipping?.full_address ||
      shipping?.address_detail ||
      shipping?.address ||
      `${shipping?.neighborhood || ''} ${shipping?.street || ''} ${shipping?.district || ''} / ${shipping?.province || 'İstanbul'}`.trim();

    if (!shipping?.full_name && !order.guest_name) {
      return NextResponse.json({ error: 'Sipariş alıcı adı eksik.' }, { status: 400 });
    }

    // 4. Call DHL shipment creation service
    const dhlRes = await createDhlShipment({
      orderNumber: order.order_number,
      recipientName: shipping.full_name || order.guest_name || 'Müşteri',
      phone: shipping.phone || order.guest_phone || '+905000000000',
      email: order.guest_email || undefined,
      addressLine: addressLine || 'Tahtakale Eminönü Teslimat',
      city: shipping.province || 'İstanbul',
      district: shipping.district || undefined,
      postalCode: shipping.postal_code || shipping.zip_code || undefined,
      countryCode: 'TR',
      desi: order.total_desi || (weight_kg ? Number(weight_kg) : 1),
      weightInKg: weight_kg ? Number(weight_kg) : 1,
      packageCount: package_count ? Number(package_count) : 1,
      itemDescription: description || 'Otantikos Concept Hediyelik Eşya Siparişi',
    });

    if (!dhlRes.success || !dhlRes.trackingNumber) {
      return NextResponse.json(
        {
          error: dhlRes.error || 'DHL kargo gönderisi oluşturulamadı.',
        },
        { status: 400 }
      );
    }

    const nowIso = new Date().toISOString();
    const updatePayload = {
      status: 'kargoya_verildi',
      tracking_number: dhlRes.trackingNumber,
      tracking_carrier: 'DHL Kargo',
      updated_at: nowIso,
    };

    // 5. Persist tracking number in Supabase via both Admin & SSR Cookie clients
    try {
      const isUuid = UUID_REGEX.test(order.id);
      const { error } = isUuid
        ? await supabaseAdmin.from('orders').update(updatePayload).eq('id', order.id)
        : await supabaseAdmin.from('orders').update(updatePayload).eq('order_number', order.order_number);

      if (error) {
        const serverSupabase = await createServerClient();
        if (isUuid) {
          await serverSupabase.from('orders').update(updatePayload).eq('id', order.id);
        } else {
          await serverSupabase.from('orders').update(updatePayload).eq('order_number', order.order_number);
        }
      }
    } catch (err) {
      console.warn('Supabase direct order update notice:', err);
    }

    await DataService.updateOrderStatus(order.id, 'kargoya_verildi', dhlRes.trackingNumber, 'DHL Kargo');

    try {
      revalidatePath('/admin');
      revalidatePath('/admin/siparisler');
      revalidatePath(`/admin/siparisler/${order.id}`);
      revalidatePath('/admin/kargo-etiketi');
      revalidatePath('/siparis-takip');
      revalidatePath('/hesabim');
    } catch {
      // Ignore
    }

    return NextResponse.json({
      success: true,
      tracking_number: dhlRes.trackingNumber,
      carrier: 'DHL Kargo',
      label_url: dhlRes.labelUrl,
      zpl: dhlRes.zpl,
      barcode: dhlRes.barcode,
      invoice_id: dhlRes.invoiceId,
      is_simulated: dhlRes.isSimulated,
      message: dhlRes.message || 'DHL gönderi kaydı ve 10x10 ZPL barkodu başarıyla oluşturuldu.',
    });
  } catch (err: any) {
    console.error('[DHL API Route Error]', err);
    return NextResponse.json({ error: err.message || 'Sunucu hatası.' }, { status: 500 });
  }
}
