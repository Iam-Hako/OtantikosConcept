import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data/store-data';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { order_number, status, payment_id, signature } = body;

    if (!order_number) {
      return NextResponse.json({ error: 'Geçersiz webhook verisi' }, { status: 400 });
    }

    const order = await DataService.getOrderByNumber(order_number);
    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    if (status === 'success') {
      await DataService.updateOrderStatus(order.id, 'hazirlaniyor');
    } else if (status === 'failed') {
      await DataService.updateOrderStatus(order.id, 'iptal_edildi');
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
