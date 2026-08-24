import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { generateOrderNumber } from '@/lib/utils/format';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      items,
      shipping_address,
      billing_address,
      delivery_type,
      has_gift_wrap,
      gift_note,
      user_id,
      guest_email,
      guest_name,
      guest_phone,
    } = body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepet boş veya geçersiz format.' }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.full_name || !shipping_address.phone || !shipping_address.province) {
      return NextResponse.json({ error: 'Teslimat adresi eksik veya geçersiz.' }, { status: 400 });
    }

    // 1. Fetch fresh products from server single source of truth
    const allProducts = await DataService.getProducts();

    // 2. Recalculate verified items, stock and prices on server side (Prevent price tampering)
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
      if (!item.product_id || !item.quantity || item.quantity <= 0 || item.quantity > 500) {
        return NextResponse.json({ error: 'Geçersiz ürün adedi veya parametresi.' }, { status: 400 });
      }

      const prod = allProducts.find((p) => p.id === item.product_id);
      if (!prod) {
        return NextResponse.json({ error: `Ürün sistemde bulunamadı: ${item.product_name || item.product_id}` }, { status: 404 });
      }

      let verifiedUnitPrice = Number(prod.price);
      let variantName = null;

      if (item.variant_id && prod.variants && prod.variants.length > 0) {
        const v = prod.variants.find((vr) => vr.id === item.variant_id);
        if (v) {
          if (v.price_override !== undefined && v.price_override !== null) {
            verifiedUnitPrice = Number(v.price_override);
          }
          variantName = `${v.name}: ${v.value}`;
          if (v.stock < item.quantity) {
            return NextResponse.json({ error: `Yetersiz stok: ${prod.name} (${v.value}) - Kalan: ${v.stock}` }, { status: 409 });
          }
        }
      } else {
        if (prod.stock < item.quantity) {
          return NextResponse.json({ error: `Yetersiz stok: ${prod.name} - Kalan: ${prod.stock}` }, { status: 409 });
        }
      }

      const itemTotal = verifiedUnitPrice * item.quantity;
      calculatedSubtotal += itemTotal;

      verifiedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        variant_id: item.variant_id || null,
        variant_name: variantName || item.variant_name || null,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        total: itemTotal,
      });
    }

    // 3. Calculate verified shipping and gift wrap fees
    const isPickup = delivery_type === 'magaza_teslim' || delivery_type === 'magazadan_teslim' || delivery_type === 'pickup';
    const verifiedShippingFee = isPickup ? 0 : 200;
    const verifiedGiftWrapFee = has_gift_wrap ? 50 : 0;
    const verifiedTotalAmount = calculatedSubtotal + verifiedShippingFee + verifiedGiftWrapFee;

    const orderNumber = generateOrderNumber();

    const order = await DataService.createOrder({
      order_number: orderNumber,
      user_id: user_id || null,
      guest_email: guest_email || null,
      guest_name: guest_name || shipping_address.full_name,
      guest_phone: guest_phone || shipping_address.phone,
      total_amount: verifiedTotalAmount,
      shipping_fee: verifiedShippingFee,
      gift_wrap_fee: verifiedGiftWrapFee,
      has_gift_wrap: Boolean(has_gift_wrap),
      gift_note: gift_note ? String(gift_note).slice(0, 500) : '',
      delivery_type: isPickup ? 'magaza_teslim' : 'kargo',
      shipping_address,
      billing_address: billing_address || shipping_address,
      items: verifiedItems,
      payment_status: 'paid',
    });

    try {
      revalidatePath('/');
      revalidatePath('/kategori/[slug]', 'page');
      revalidatePath('/admin/urunler');
      revalidatePath('/admin/hizli-stok');
      for (const item of verifiedItems) {
        const prod = allProducts.find(p => p.id === item.product_id);
        if (prod) {
          revalidatePath(`/urun/${prod.slug}`);
        }
      }
    } catch {
      // Revalidation error ignored
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      total_amount: order.total_amount,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Ödeme işlemi başarısız' }, { status: 500 });
  }
}
