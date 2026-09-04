import { NextResponse } from 'next/server';
import { DataService } from '@/lib/data/store-data';
import { generateOrderNumber } from '@/lib/utils/format';
import { initializeIyzicoCheckoutForm } from '@/lib/services/iyzico-service';
import { calculateDynamicShippingFee } from '@/lib/services/dhl-service';

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
      identity_number,
    } = body;

    const isOnlineSalesActive = process.env.NEXT_PUBLIC_ONLINE_SALES_ACTIVE === 'true';
    if (!isOnlineSalesActive) {
      return NextResponse.json({
        success: true,
        isPreLaunch: true,
        message: 'Online kredi kartı satışlarımız geçici olarak devre dışıdır.',
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: 'Sepetiniz boş.' }, { status: 400 });
    }

    if (!shipping_address || !shipping_address.full_name || !shipping_address.phone || !shipping_address.province) {
      return NextResponse.json({ error: 'Lütfen teslimat adresinizi eksiksiz giriniz.' }, { status: 400 });
    }

    // 1. Fetch fresh products from server single source of truth
    const allProducts = await DataService.getProducts();

    // 2. Verify items, stock, and calculate subtotal on server
    const verifiedItems = [];
    let calculatedSubtotal = 0;

    for (const item of items) {
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

      const prodDesi = Number((prod as any).desi || (prod as any).weight_kg) || 1;

      verifiedItems.push({
        product_id: prod.id,
        product_name: prod.name,
        variant_id: item.variant_id || null,
        variant_name: variantName || item.variant_name || null,
        price: verifiedUnitPrice,
        quantity: item.quantity,
        total: itemTotal,
        desi: prodDesi,
      });
    }

    const dynamicShipping = calculateDynamicShippingFee(verifiedItems, delivery_type);
    const verifiedShippingFee = dynamicShipping.shippingFee;
    const verifiedGiftWrapFee = has_gift_wrap ? 50 : 0;
    const verifiedTotalAmount = calculatedSubtotal + verifiedShippingFee + verifiedGiftWrapFee;

    const orderNumber = generateOrderNumber();

    // Create order with pending payment status first
    const order = await DataService.createOrder({
      order_number: orderNumber,
      user_id: user_id || null,
      guest_email: guest_email || null,
      guest_name: guest_name || shipping_address.full_name,
      guest_phone: guest_phone || shipping_address.phone,
      total_amount: verifiedTotalAmount,
      shipping_fee: verifiedShippingFee,
      total_desi: dynamicShipping.totalDesi,
      gift_wrap_fee: verifiedGiftWrapFee,
      has_gift_wrap: Boolean(has_gift_wrap),
      gift_note: gift_note ? String(gift_note).slice(0, 500) : '',
      delivery_type: dynamicShipping.isPickup ? 'magaza_teslim' : 'kargo',
      shipping_address,
      billing_address: billing_address || shipping_address,
      items: verifiedItems,
      payment_status: 'pending',
    });

    // Determine callback URL
    const host = request.headers.get('host') || 'www.otantikosconcept.com';
    const proto = request.headers.get('x-forwarded-proto') || 'https';
    const appUrl = `${proto}://${host}`;
    const callbackUrl = `${appUrl}/api/iyzico/callback?order_number=${encodeURIComponent(orderNumber)}`;

    // Client IP
    const forwarded = request.headers.get('x-forwarded-for');
    const ip = forwarded ? forwarded.split(',')[0].trim() : '85.95.230.1';

    // Initialize iyzico Checkout Form
    const iyzicoRes = await initializeIyzicoCheckoutForm({
      orderNumber,
      totalAmount: verifiedTotalAmount,
      customerName: shipping_address.full_name || guest_name || 'Müşteri',
      customerEmail: guest_email || 'siparis@otantikosconcept.com',
      customerPhone: shipping_address.phone || guest_phone || '',
      customerIdentityNumber: identity_number || '11111111111',
      shippingAddress: {
        fullName: shipping_address.full_name,
        phone: shipping_address.phone,
        addressDetail: shipping_address.address_detail || shipping_address.address || 'Adres',
        province: shipping_address.province || 'İstanbul',
        district: shipping_address.district || 'Fatih',
        zipCode: shipping_address.zip_code || '34000',
      },
      billingAddress: billing_address ? {
        fullName: billing_address.full_name || shipping_address.full_name,
        phone: billing_address.phone || shipping_address.phone,
        addressDetail: billing_address.address_detail || billing_address.address || shipping_address.address_detail,
        province: billing_address.province || shipping_address.province,
        district: billing_address.district || shipping_address.district,
        zipCode: billing_address.zip_code || '34000',
      } : undefined,
      items: verifiedItems.map((it) => ({
        id: it.product_id,
        name: it.product_name,
        price: it.price,
      })),
      callbackUrl,
      userIp: ip,
    });

    if (!iyzicoRes.success) {
      return NextResponse.json({
        error: iyzicoRes.error || 'iyzico ödeme formu başlatılamadı.',
      }, { status: 400 });
    }

    if (iyzicoRes.isPreLaunch) {
      return NextResponse.json({
        success: true,
        isPreLaunch: true,
        message: iyzicoRes.message || 'Online satışlarımız çok yakında başlayacaktır!',
      });
    }

    return NextResponse.json({
      success: true,
      order_number: order.order_number,
      order_id: order.id,
      total_amount: order.total_amount,
      token: iyzicoRes.token,
      checkoutFormContent: iyzicoRes.checkoutFormContent,
      paymentPageUrl: iyzicoRes.paymentPageUrl,
      isSimulated: iyzicoRes.isSimulated,
    });
  } catch (err: any) {
    console.error('iyzico initialization error:', err);
    return NextResponse.json({ error: err.message || 'Ödeme altyapısında bir sorun oluştu.' }, { status: 500 });
  }
}
