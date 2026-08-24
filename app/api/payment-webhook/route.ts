import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data/store-data';

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (configuredSecret) {
      const incomingSecret = request.headers.get('x-webhook-secret') || request.headers.get('x-payment-secret');
      if (incomingSecret !== configuredSecret) {
        return NextResponse.json({ error: 'Geçersiz webhook kimlik doğrulaması' }, { status: 401 });
      }
    }

    const body = await request.json();
    const { order_number, status } = body;

    if (!order_number || !status) {
      return NextResponse.json({ error: 'Geçersiz webhook verisi' }, { status: 400 });
    }

    const order = await DataService.getOrderByNumber(order_number);
    if (!order) {
      return NextResponse.json({ error: 'Sipariş bulunamadı' }, { status: 404 });
    }

    if (status === 'success') {
      if (order.status === 'siparis_alindi') {
        await DataService.updateOrderStatus(order.id, 'hazirlaniyor');
      }
    } else if (status === 'failed') {
      if (order.status === 'siparis_alindi') {
        await DataService.updateOrderStatus(order.id, 'iptal_edildi');
      }
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
