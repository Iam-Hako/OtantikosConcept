import fs from 'fs';
import path from 'path';
import { Coupon } from '@/lib/types/ecommerce';

// Server-side & Client compatible Coupon Service
const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'OTANTIKOS50',
    description: '500 ₺ ve üzeri alışverişlerde net 50 ₺ indirim!',
    discount_type: 'fixed',
    discount_value: 50,
    min_order_amount: 500,
    is_active: true,
  },
  {
    code: 'HOSGELDIN',
    description: '500 ₺ ve üzeri alışverişlerde %10 Hoş Geldin indirimi!',
    discount_type: 'percentage',
    discount_value: 10,
    min_order_amount: 500,
    max_discount_amount: 250,
    is_active: true,
  },
  {
    code: 'TAHTAKALE100',
    description: '1.000 ₺ ve üzeri alışverişlerde net 100 ₺ indirim!',
    discount_type: 'fixed',
    discount_value: 100,
    min_order_amount: 1000,
    is_active: true,
  },
];

const DATA_DIR = path.join(process.cwd(), '.data');
const FILE_PATH = path.join(DATA_DIR, 'coupons.json');

declare global {
  var __otantikos_coupons: Coupon[] | undefined;
}

function getStoredCoupons(): Coupon[] {
  if (globalThis.__otantikos_coupons && Array.isArray(globalThis.__otantikos_coupons)) {
    return globalThis.__otantikos_coupons;
  }
  try {
    if (typeof fs !== 'undefined' && fs.existsSync && fs.existsSync(FILE_PATH)) {
      const data = fs.readFileSync(FILE_PATH, 'utf8');
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) {
        globalThis.__otantikos_coupons = parsed;
        return parsed;
      }
    }
  } catch {
    // File read error fallback
  }

  globalThis.__otantikos_coupons = INITIAL_COUPONS;
  return INITIAL_COUPONS;
}

export const CouponService = {
  /**
   * Return all active coupons
   */
  getActiveCoupons(): Coupon[] {
    const list = getStoredCoupons();
    const now = new Date();
    return list.filter((c) => {
      if (!c.is_active) return false;
      if (c.expires_at && new Date(c.expires_at) < now) return false;
      return true;
    });
  },

  /**
   * Find coupon by code
   */
  getCouponByCode(code: string): Coupon | null {
    if (!code) return null;
    const clean = code.trim().toUpperCase();
    const list = getStoredCoupons();
    return list.find((c) => c.code.toUpperCase() === clean) || null;
  },

  /**
   * Calculate discount amount given coupon and subtotal
   */
  calculateDiscount(coupon: Coupon, subtotal: number): number {
    if (subtotal < coupon.min_order_amount) return 0;

    let discount = 0;
    if (coupon.discount_type === 'fixed') {
      discount = Math.min(coupon.discount_value, subtotal);
    } else if (coupon.discount_type === 'percentage') {
      discount = subtotal * (coupon.discount_value / 100);
      if (coupon.max_discount_amount && coupon.max_discount_amount > 0) {
        discount = Math.min(discount, coupon.max_discount_amount);
      }
    }

    return Math.round(discount * 100) / 100;
  },

  /**
   * Validate coupon code against current subtotal
   */
  validateCoupon(
    code: string,
    subtotal: number
  ): {
    valid: boolean;
    coupon?: Coupon;
    discountAmount: number;
    message: string;
  } {
    if (!code || !code.trim()) {
      return {
        valid: false,
        discountAmount: 0,
        message: 'Lütfen bir indirim kuponu kodu giriniz.',
      };
    }

    const clean = code.trim().toUpperCase();
    const coupon = this.getCouponByCode(clean);

    if (!coupon) {
      return {
        valid: false,
        discountAmount: 0,
        message: `"${clean}" kodlu kupon bulunamadı veya geçersiz.`,
      };
    }

    if (!coupon.is_active) {
      return {
        valid: false,
        discountAmount: 0,
        message: `"${clean}" kuponu artık aktif değildir.`,
      };
    }

    if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
      return {
        valid: false,
        discountAmount: 0,
        message: `"${clean}" kuponunun kullanım süresi dolmuştur.`,
      };
    }

    if (subtotal < coupon.min_order_amount) {
      const remaining = Math.round((coupon.min_order_amount - subtotal) * 100) / 100;
      return {
        valid: false,
        coupon,
        discountAmount: 0,
        message: `Bu kupon ${coupon.min_order_amount} ₺ ve üzeri alışverişlerde geçerlidir. (Kalan tutar: ${remaining} ₺)`,
      };
    }

    const discountAmount = this.calculateDiscount(coupon, subtotal);

    const discountLabel =
      coupon.discount_type === 'fixed'
        ? `${coupon.discount_value} ₺`
        : `%${coupon.discount_value}`;

    return {
      valid: true,
      coupon,
      discountAmount,
      message: `Tebrikler! ${coupon.code} kuponu ile ${discountLabel} (${discountAmount.toFixed(2)} ₺) indirim uygulandı.`,
    };
  },
};
