import { NextResponse } from 'next/server';
import { CouponService } from '@/lib/services/coupon-service';
import { applyRateLimit } from '@/lib/security/rate-limit';

export async function POST(request: Request) {
  try {
    // Rate limit: max 30 coupon attempts per minute
    const rateLimitResponse = applyRateLimit(request, {
      actionName: 'coupon-validate',
      limit: 30,
      windowSeconds: 60,
      errorMessage: 'Çok sık kupon denemesi yapıldı. Lütfen biraz bekleyiniz.',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const body = await request.json().catch(() => ({}));
    const { code, subtotal } = body;

    if (!code || typeof code !== 'string') {
      return NextResponse.json({
        valid: false,
        message: 'Lütfen geçerli bir indirim kuponu kodu giriniz.',
        discountAmount: 0,
      }, { status: 400 });
    }

    const numericSubtotal = typeof subtotal === 'number' && !isNaN(subtotal) ? subtotal : 0;
    const result = CouponService.validateCoupon(code, numericSubtotal);

    return NextResponse.json({
      success: result.valid,
      ...result,
    });
  } catch (error: any) {
    return NextResponse.json({
      valid: false,
      message: error?.message || 'Kupon doğrulanırken bir hata oluştu.',
      discountAmount: 0,
    }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const subtotalParam = searchParams.get('subtotal');

    if (code) {
      const subtotal = subtotalParam ? parseFloat(subtotalParam) : 0;
      const result = CouponService.validateCoupon(code, isNaN(subtotal) ? 0 : subtotal);
      return NextResponse.json(result);
    }

    // Return list of publicly highlightable coupons (e.g. for banners / chips)
    const active = CouponService.getActiveCoupons().map((c) => ({
      code: c.code,
      description: c.description,
      min_order_amount: c.min_order_amount,
      discount_type: c.discount_type,
      discount_value: c.discount_value,
    }));

    return NextResponse.json({
      coupons: active,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Hata' }, { status: 500 });
  }
}
