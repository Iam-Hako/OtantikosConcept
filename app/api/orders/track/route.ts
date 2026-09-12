import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { DataService } from '@/lib/data/store-data';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const orderNumber = searchParams.get('order_number') || searchParams.get('siparis') || '';
    const emailOrName = searchParams.get('email') || '';

    if (!orderNumber.trim()) {
      return NextResponse.json({ error: 'Sipariş numarası gereklidir.' }, { status: 400 });
    }

    const cleanNumber = orderNumber.trim().toUpperCase();

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(orderNumber.trim());

    // 1. Try Supabase with Admin Client (bypasses guest RLS limitation safely)
    try {
      const supabase = createAdminClient();
      let query = supabase.from('orders').select('*, items:order_items(*)');
      if (isUuid) {
        query = query.eq('id', orderNumber.trim());
      } else {
        query = query.eq('order_number', cleanNumber);
      }
      const { data, error } = await query.maybeSingle();

      if (!error && data) {
        if (emailOrName && emailOrName.trim()) {
          const q = emailOrName.trim().toLowerCase();
          const guestEmail = (data.guest_email || '').toLowerCase();
          const name = (data.shipping_address?.full_name || '').toLowerCase();
          if (!guestEmail.includes(q) && !name.includes(q)) {
            return NextResponse.json({ error: 'E-posta veya isim sipariş ile eşleşmiyor.' }, { status: 403 });
          }
        }
        return NextResponse.json({ success: true, order: data });
      }
    } catch {
      // Fallback to in-memory store
    }

    // 2. Fallback to store data service
    const localOrder = await DataService.getOrderById(orderNumber.trim());
    if (localOrder) {
      return NextResponse.json({ success: true, order: localOrder });
    }

    return NextResponse.json({ error: 'Sipariş bulunamadı.' }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Sipariş sorgulanamadı.' }, { status: 500 });
  }
}
