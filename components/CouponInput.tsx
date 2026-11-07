'use client';

import React, { useState } from 'react';
import { useCart } from '@/lib/store/cart-store';
import { Tag, Check, X, ArrowRight, Loader2, Sparkles } from 'lucide-react';

interface CouponInputProps {
  className?: string;
  variant?: 'compact' | 'full';
}

export function CouponInput({ className = '', variant = 'full' }: CouponInputProps) {
  const { appliedCoupon, discountAmount, applyCoupon, removeCoupon, subtotal } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCode.trim() || isLoading) return;

    setIsLoading(true);
    await applyCoupon(couponCode);
    setIsLoading(false);
    setCouponCode('');
  };

  const handleApplyPreset = async (code: string) => {
    setIsLoading(true);
    setCouponCode(code);
    await applyCoupon(code);
    setIsLoading(false);
    setCouponCode('');
  };

  // If already applied
  if (appliedCoupon) {
    const isBelowMin = subtotal < appliedCoupon.min_order_amount;
    const remainingToMin = Math.max(0, appliedCoupon.min_order_amount - subtotal);

    return (
      <div className={`rounded-xl border border-emerald-200/80 bg-emerald-50/50 p-3.5 transition-all dark:border-emerald-900/50 dark:bg-emerald-950/20 ${className}`}>
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-600 text-white shadow-sm">
              <Tag className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold tracking-wider text-emerald-900 uppercase dark:text-emerald-300">
                  {appliedCoupon.code}
                </span>
                <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:bg-emerald-900/60 dark:text-emerald-200">
                  Uygulandı
                </span>
              </div>
              <p className="text-xs text-stone-600 dark:text-stone-300">
                {appliedCoupon.description}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {discountAmount > 0 && (
              <span className="font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                -{discountAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
              </span>
            )}
            <button
              type="button"
              onClick={removeCoupon}
              className="flex h-7 w-7 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-600 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-400 dark:hover:bg-red-950/30 dark:hover:text-red-400"
              title="Kuponu Kaldır"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        {isBelowMin && (
          <div className="mt-2.5 rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-[11px] text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
            ⚠️ Bu indirimden faydalanmak için sepetinize{' '}
            <strong className="font-semibold">
              {remainingToMin.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ₺
            </strong>{' '}
            tutarında daha ürün ekleyiniz (Min. {appliedCoupon.min_order_amount} ₺).
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`space-y-2.5 ${className}`}>
      {/* Accordion toggle if compact */}
      {variant === 'compact' && !isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="flex w-full items-center justify-between rounded-lg border border-dashed border-stone-300 px-3 py-2 text-xs font-medium text-stone-700 transition hover:border-stone-400 hover:bg-stone-50 dark:border-stone-700 dark:text-stone-300 dark:hover:bg-stone-800"
        >
          <span className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-stone-500" />
            İndirim Kuponum Var
          </span>
          <span className="text-[11px] text-amber-600 font-semibold dark:text-amber-400">
            Giriş Yap
          </span>
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="relative">
          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="İndirim kuponu kodu"
                className="w-full rounded-xl border border-stone-200 bg-white py-2 pl-9 pr-3 text-xs tracking-wider uppercase text-stone-900 placeholder:normal-case placeholder:text-stone-400 transition-all focus:border-stone-900 focus:outline-none focus:ring-1 focus:ring-stone-900 dark:border-stone-700 dark:bg-stone-800 dark:text-stone-100 dark:placeholder:text-stone-500 dark:focus:border-amber-400 dark:focus:ring-amber-400"
              />
              <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-stone-400" />
            </div>
            <button
              type="submit"
              disabled={isLoading || !couponCode.trim()}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-stone-900 px-3.5 py-2 text-xs font-semibold text-white transition-all hover:bg-stone-800 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
            >
              {isLoading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <>
                  <span>Uygula</span>
                  <ArrowRight className="h-3 w-3" />
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Haute Couture Suggestion Pills */}
      <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
        <span className="text-[11px] font-medium text-stone-400 flex items-center gap-1">
          <Sparkles className="h-3 w-3 text-amber-500" />
          Fırsat:
        </span>
        <button
          type="button"
          onClick={() => handleApplyPreset('OTANTIKOS50')}
          disabled={isLoading}
          className="group inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50/70 px-2.5 py-1 text-[11px] font-medium text-amber-900 transition-all hover:border-amber-300 hover:bg-amber-100/90 active:scale-95 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-200"
        >
          <span className="font-mono font-bold tracking-wider">OTANTIKOS50</span>
          <span className="text-[10px] text-amber-700 dark:text-amber-300">
            (500 ₺ üzeri 50 ₺ indirim)
          </span>
        </button>
      </div>
    </div>
  );
}
