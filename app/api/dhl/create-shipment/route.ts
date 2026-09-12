import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { createDhlShipment } from '@/lib/services/dhl-service';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_id, order_number, weight_kg, package_count, description } = body;

    if (!order_id && !order_number) {
      return NextResponse.json({ error: 'Sipariş ID veya sipariş numarası zorunludur.' }, { status: 400 });
    }

    // 1. Fetch order
    let order = order_id ? await DataService.getOrderById(order_id) : null;
    if (!order && order_number) {
      order = await DataService.getOrderByNumber(order_number);
    }
    if (!order) {
      const allOrders = await DataService.getOrders();
      order = allOrders.find((o) => (order_id && o.id === order_id) || (order_number && o.order_number === order_number)) || null;
    }

    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
    }

    const shipping = order.shipping_address as any;
    const addressLine = shipping?.full_address || shipping?.address_detail || shipping?.address || '';
    if (!shipping || !shipping.full_name || !addressLine) {
      return NextResponse.json({ error: 'Sipariş teslimat adresi eksik veya geçersiz.' }, { status: 400 });
    }

    // 2. Call DHL shipment creation service
    const dhlRes = await createDhlShipment({
      orderNumber: order.order_number,
      recipientName: shipping.full_name,
      phone: shipping.phone || order.guest_phone || '+905000000000',
      email: order.guest_email || undefined,
      addressLine: addressLine,
      city: shipping.province || 'İstanbul',
      district: shipping.district || undefined,
      postalCode: shipping.postal_code || shipping.zip_code || undefined,
      countryCode: 'TR',
      weightInKg: weight_kg ? Number(weight_kg) : 0.5,
      packageCount: package_count ? Number(package_count) : 1,
      itemDescription: description || 'Otantikos Concept Hediyelik Eşya Siparişi',
    });

    if (!dhlRes.success || !dhlRes.trackingNumber) {
      return NextResponse.json({
        error: dhlRes.error || 'DHL kargo gönderisi oluşturulamadı.',
      }, { status: 500 });
    }

    // 3. Update order in Supabase and DataService
    try {
      const supabaseAdmin = createAdminClient();
      const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(order.id);
      let updateQuery = supabaseAdmin.from('orders').update({
        status: 'kargoya_verildi',
        tracking_number: dhlRes.trackingNumber,
        tracking_carrier: 'DHL Kargo',
        updated_at: new Date().toISOString(),
      });
      if (isUuid) {
        await updateQuery.eq('id', order.id);
      } else {
        await updateQuery.eq('order_number', order.order_number);
      }
    } catch (err) {
      console.warn('Supabase direct order update notice:', err);
    }

    await DataService.updateOrderStatus(
      order.id,
      'kargoya_verildi',
      dhlRes.trackingNumber,
      'DHL Kargo'
    );

    // 4. Revalidate pages
    try {
      revalidatePath('/admin/siparisler');
      revalidatePath(`/admin/siparisler/${order.id}`);
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
