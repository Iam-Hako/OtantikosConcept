import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data/store-data';
import { generateOrderNumber } from '@/lib/utils/format';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items, shipping_address, billing_address, delivery_type, has_gift_wrap, gift_note, total_amount, shipping_fee, gift_wrap_fee, user_id, guest_email, guest_name, guest_phone } = body;

    if (!items || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş' }, { status: 400 });
    }

    // Race condition stock verification
    const allProducts = await DataService.getProducts();
    for (const item of items) {
      const prod = allProducts.find((p) => p.id === item.product_id);
      const avail = item.variant_id && prod?.variants ? (prod.variants.find(v => v.id === item.variant_id)?.stock ?? 0) : (prod?.stock ?? 0);
      if (avail < item.quantity) {
        return NextResponse.json(
          { error: `Ürün için yetersiz stok: ${item.product_name}` },
          { status: 409 }
        );
      }
    }

    const orderNumber = generateOrderNumber();

    const order = await DataService.createOrder({
      order_number: orderNumber,
      user_id,
      guest_email,
      guest_name,
      guest_phone,
      total_amount,
      shipping_fee,
      gift_wrap_fee,
      has_gift_wrap,
      gift_note,
      delivery_type,
      shipping_address,
      billing_address,
      items,
      payment_status: 'paid',
    });

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ödeme işlemi başarısız' }, { status: 500 });
  }
}
