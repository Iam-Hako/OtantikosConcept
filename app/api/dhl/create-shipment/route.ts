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
    const allOrders = await DataService.getOrders();
    const order = allOrders.find((o) => (order_id && o.id === order_id) || (order_number && o.order_number === order_number));

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
      await supabaseAdmin.from('orders').update({
        status: 'kargoya_verildi',
        tracking_number: dhlRes.trackingNumber,
        tracking_carrier: 'DHL Kargo',
        updated_at: new Date().toISOString(),
      }).eq('id', order.id);
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
      label_pdf_base64: dhlRes.labelPdfBase64,
      is_simulated: dhlRes.isSimulated,
      message: dhlRes.message || 'DHL gönderi kaydı ve takip barkodu başarıyla oluşturuldu.',
    });
  } catch (err: any) {
    console.error('[DHL API Route Error]', err);
    return NextResponse.json({ error: err.message || 'Sunucu hatası.' }, { status: 500 });
  }
}
