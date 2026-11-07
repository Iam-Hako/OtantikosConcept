import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { DataService } from '@/lib/data/store-data';

export async function POST(request: Request) {
  try {
    const configuredSecret = process.env.PAYMENT_WEBHOOK_SECRET;
    if (!configuredSecret) {
      console.error('[CRITICAL] PAYMENT_WEBHOOK_SECRET is not configured on server.');
      return NextResponse.json({ error: 'Webhook servisi yapılandırılmamış' }, { status: 500 });
    }

    const incomingSecret = request.headers.get('x-webhook-secret') || request.headers.get('x-payment-secret') || '';
    const isSecretValid =
      incomingSecret.length === configuredSecret.length &&
      crypto.timingSafeEqual(Buffer.from(incomingSecret), Buffer.from(configuredSecret));

    if (!isSecretValid) {
      return NextResponse.json({ error: 'Geçersiz webhook kimlik doğrulaması' }, { status: 401 });
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
      await DataService.markOrderPaid(order.order_number, 'credit_card');
    } else if (status === 'failed') {
      await DataService.markOrderFailed(order.order_number, 'Ödeme webhook servisi başarısız bildirimi');
    }

    return NextResponse.json({ status: 'OK' });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
