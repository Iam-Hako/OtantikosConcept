import { NextResponse } from 'next/server';
import { trackDhlShipment } from '@/lib/services/dhl-service';
import { DataService } from '@/lib/data/store-data';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    let trackingNumber = url.searchParams.get('tracking_number') || url.searchParams.get('trackingNumber');
    const orderNumber = url.searchParams.get('order_number') || url.searchParams.get('orderNumber');

    // If order_number is provided instead of tracking_number, resolve it
    if (!trackingNumber && orderNumber) {
      const order = await DataService.getOrderByNumber(orderNumber);
      if (order && order.tracking_number) {
        trackingNumber = order.tracking_number;
      }
    }

    if (!trackingNumber) {
      return NextResponse.json({ error: 'Kargo takip numarası belirtilmedi.' }, { status: 400 });
    }

    const result = await trackDhlShipment(trackingNumber);
    return NextResponse.json(result);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'DHL takip sorgusu başarısız.' }, { status: 500 });
  }
}
