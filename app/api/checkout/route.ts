import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { DataService } from '@/lib/data/store-data';
import { generateOrderNumber } from '@/lib/utils/format';
import { calculateDynamicShippingFee } from '@/lib/services/dhl-service';
import { CouponService } from '@/lib/services/coupon-service';
import { verifyAdmin } from '@/app/actions/ecommerce-actions';
import { applyRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    // 1. Rate Limiting: Max 10 checkout submissions per minute per IP
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'checkout-submit',
      limit: 10,
      windowSeconds: 60,
      errorMessage: 'Çok sık sipariş oluşturma denemesi yapıldı. Lütfen biraz bekleyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

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
      payment_method,
      is_admin_test,
      coupon_code,
    } = body;

    // Security Guard: Admin test order MUST verify real admin session
    let isVerifiedAdmin = false;
    if (is_admin_test || payment_method === 'admin_test') {
      isVerifiedAdmin = await verifyAdmin();
      if (!isVerifiedAdmin) {
        return NextResponse.json({ error: 'Yönetici test siparişi için admin yetkisi gereklidir.' }, { status: 403 });
      }
    }

    const isPickup = delivery_type === 'magaza_teslim' || delivery_type === 'pickup';

    // Disallow bypassing credit card payment gateway for standard shipping orders
    if (!isVerifiedAdmin && !isPickup) {
      return NextResponse.json({
        error: 'Kredi kartı ile kargo siparişleri yalnızca iyzico güvenli ödeme geçidi üzerinden tamamlanabilir.',
      }, { status: 400 });
    }

    const isOnlineSalesActive = process.env.NEXT_PUBLIC_ONLINE_SALES_ACTIVE === 'true';
    if (!isOnlineSalesActive && !isVerifiedAdmin) {
      return NextResponse.json({
        error: 'Online sipariş altyapısı geçici olarak devre dışıdır. Siparişleriniz için WhatsApp hattımızdan iletişime geçebilirsiniz.',
      }, { status: 403 });
    }

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
      if (!item.product_id || !Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 500) {
        return NextResponse.json({ error: 'Geçersiz ürün adedi veya parametresi.' }, { status: 400 });
      }

      const prod = allProducts.find((p) => p.id === item.product_id);
      if (!prod) {
        return NextResponse.json({ error: `Ürün sistemde bulunamadı: ${item.product_name || item.product_id}` }, { status: 404 });
      }

      // Check Active and Published Status
      if (prod.is_active === false) {
        return NextResponse.json({ error: `"${prod.name}" satıştan kaldırılmıştır.` }, { status: 400 });
      }
      if (prod.is_published === false && !isPickup) {
        return NextResponse.json({ error: `"${prod.name}" online kargo gönderimine kapalıdır (yalnızca mağazadan teslim alınabilir).` }, { status: 400 });
      }

      // 1. Strict Product Master Stock Check
      if (Number(prod.stock) <= 0) {
        return NextResponse.json({ error: `Ürün tükendi: ${prod.name}` }, { status: 409 });
      }

      let verifiedUnitPrice = Number(prod.price);
      let variantName = null;

      // 2. Strict Variant & Quantity Stock Check
      if (prod.variants && prod.variants.length > 0) {
        if (!item.variant_id) {
          return NextResponse.json({ error: `Lütfen bir seçenek/varyant seçiniz: ${prod.name}` }, { status: 400 });
        }
        const v = prod.variants.find((vr) => vr.id === item.variant_id);
        if (!v || v.is_active === false) {
          return NextResponse.json({ error: `Seçilen varyant bulunamadı: ${prod.name}` }, { status: 400 });
        }
        const variantStock = Number(v.stock);
        const effectiveStock = Math.min(Number(prod.stock), variantStock);

        if (effectiveStock <= 0 || item.quantity > effectiveStock) {
          return NextResponse.json({
            error: `Yetersiz stok: ${prod.name} (${v.value || 'Seçenek'}) - Kalan: ${Math.max(0, effectiveStock)}`
          }, { status: 409 });
        }
        if (v.price_override !== undefined && v.price_override !== null) {
          verifiedUnitPrice = Number(v.price_override);
        }
        variantName = `${v.name}: ${v.value}`;
      } else {
        if (Number(prod.stock) < item.quantity) {
          return NextResponse.json({ error: `Yetersiz stok: ${prod.name} - Kalan: ${prod.stock}` }, { status: 409 });
        }
      }

      if (isNaN(verifiedUnitPrice) || verifiedUnitPrice <= 0) {
        return NextResponse.json({ error: `Ürün fiyatı geçersiz: ${prod.name}` }, { status: 400 });
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

    // 3. Calculate verified shipping and gift wrap fees
    const dynamicShipping = calculateDynamicShippingFee(verifiedItems, delivery_type);
    const verifiedShippingFee = dynamicShipping.shippingFee;
    const verifiedGiftWrapFee = has_gift_wrap ? 50 : 0;

    // Server-side strict coupon verification
    let verifiedDiscountAmount = 0;
    let appliedCouponCode: string | null = null;

    if (coupon_code && typeof coupon_code === 'string') {
      const couponValidation = CouponService.validateCoupon(coupon_code, calculatedSubtotal);
      if (couponValidation.valid) {
        verifiedDiscountAmount = couponValidation.discountAmount;
        appliedCouponCode = couponValidation.coupon?.code || coupon_code.trim().toUpperCase();
      }
    }

    const verifiedTotalAmount = Math.max(0, calculatedSubtotal - verifiedDiscountAmount) + verifiedShippingFee + verifiedGiftWrapFee;

    const orderNumber = generateOrderNumber();

    const orderPaymentStatus: 'paid' | 'pending' = isVerifiedAdmin ? 'paid' : (isPickup ? 'pending' : 'pending');
    const orderPaymentMethod = isVerifiedAdmin ? 'admin_test' : (isPickup ? 'magaza_nakit' : 'credit_card');
    const orderAdminNotes = isVerifiedAdmin
      ? '🧪 Yönetici Test Satın Alımı (Kartsız Başarılı)'
      : (isPickup ? '🏪 Mağazada Nakit/POS ile Ödeme Bekleniyor' : undefined);

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
      coupon_code: appliedCouponCode,
      discount_amount: verifiedDiscountAmount,
      payment_status: orderPaymentStatus,
      payment_method: orderPaymentMethod,
      status: 'hazirlaniyor',
      admin_notes: orderAdminNotes,
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
