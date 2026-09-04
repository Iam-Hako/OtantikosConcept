'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { X, Trash2, Plus, Minus, Gift, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils/format';

export default function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    closeDrawer,
    removeItem,
    updateQuantity,
    subtotal,
    shippingFee,
    totalDesi,
    billableDesi,
    giftWrapFee,
    hasGiftWrap,
    setHasGiftWrap,
    giftNote,
    setGiftNote,
    total,
    kdvAmount,
    totalItems,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fade-in">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-900/60 backdrop-blur-xs transition-opacity"
        onClick={closeDrawer}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col animate-slide-in-right">
          
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-stone-50/70">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-amber-700" />
              <h2 className="text-base font-bold text-stone-900">
                Alışveriş Sepetim ({totalItems} Ürün)
              </h2>
            </div>
            <button
              onClick={closeDrawer}
              className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/60 transition"
              aria-label="Sepeti Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-6 divide-y divide-stone-100">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center py-12">
                <div className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                  <ShoppingBag className="w-8 h-8 stroke-[1.5]" />
                </div>
                <h3 className="text-base font-bold text-stone-900 mb-1">Sepetiniz Boş</h3>
                <p className="text-xs text-stone-500 max-w-xs mb-6">
                  Tahtakale konseptindeki özel takı, oyuncak ve hediyelik eşyalarımızı keşfetmeye başlayın.
                </p>
                <Link
                  href="/kategori/tum-urunler"
                  onClick={closeDrawer}
                  className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg shadow-sm transition"
                >
                  Ürünleri Keşfet
                </Link>
              </div>
            ) : (
              items.map((item) => {
                const itemPrice = item.variant?.price_override ?? item.product.price;
                const coverImage = item.variant?.image_url || (item.product.images && item.product.images[0]?.image_url) || '/images/logo.webp';
                const maxStock = item.variant ? item.variant.stock : item.product.stock;

                return (
                  <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="py-4 flex gap-4">
                    {/* Item Image */}
                    <div className="relative w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                      <Image
                        src={coverImage}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <Link
                            href={`/urun/${item.product.slug}`}
                            onClick={closeDrawer}
                            className="text-xs font-semibold text-stone-900 hover:text-amber-700 line-clamp-2"
                          >
                            {item.product.name}
                          </Link>
                          <button
                            onClick={() => removeItem(item.product.id, item.variant?.id)}
                            className="text-stone-400 hover:text-rose-600 transition p-0.5"
                            title="Ürünü Kaldır"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {item.variant && (
                          <span className="inline-block mt-1 text-[11px] text-stone-500 bg-stone-100 px-2 py-0.5 rounded">
                            {item.variant.name}: <strong className="text-stone-700">{item.variant.value}</strong>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between mt-3">
                        {/* Stepper */}
                        <div className="flex items-center border border-stone-200 rounded-lg bg-stone-50">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                            className="p-1 text-stone-600 hover:text-amber-700 transition"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold text-stone-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                            disabled={item.quantity >= maxStock}
                            className="p-1 text-stone-600 hover:text-amber-700 disabled:opacity-30 transition"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Price */}
                        <div className="text-right">
                          <div className="text-xs font-bold text-amber-700">
                            {formatPrice(itemPrice * item.quantity)}
                          </div>
                          {item.quantity > 1 && (
                            <div className="text-[10px] text-stone-400">
                              Adet: {formatPrice(itemPrice)}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Gift Wrap & Special Note Section */}
            {items.length > 0 && (
              <div className="py-4 bg-amber-50/50 -mx-6 px-6 border-t border-b border-amber-100">
                <label className="flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={hasGiftWrap}
                    onChange={(e) => setHasGiftWrap(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
                  />
                  <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                    <Gift className="w-4 h-4 text-amber-700" />
                    <span>Özel Hediye Paketi İstiyorum (+₺50,00)</span>
                  </div>
                </label>

                {hasGiftWrap && (
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mb-1">
                      <span>Özel Hediye Notunuz:</span>
                      <span className={giftNote.length > 240 ? 'text-amber-700 font-bold' : ''}>
                        {giftNote.length} / 250
                      </span>
                    </div>
                    <textarea
                      value={giftNote}
                      onChange={(e) => setGiftNote(e.target.value.slice(0, 250))}
                      placeholder="Paket içine eklenecek hediye mesajınızı buraya yazabilirsiniz..."
                      rows={2}
                      className="w-full text-xs p-2.5 bg-white border border-amber-200 rounded-lg focus:outline-none focus:border-amber-500"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer Summary */}
          {items.length > 0 && (
            <div className="p-6 border-t border-stone-200 bg-stone-50/50 space-y-3">
              <div className="space-y-1.5 text-xs text-stone-600">
                <div className="flex justify-between">
                  <span>Ara Toplam</span>
                  <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-stone-400 text-[11px]">
                  <span>KDV (%20 Dahil)</span>
                  <span>{formatPrice(kdvAmount)}</span>
                </div>
                {hasGiftWrap && (
                  <div className="flex justify-between text-amber-800">
                    <span>Özel Hediye Paketi</span>
                    <span className="font-semibold">{formatPrice(giftWrapFee)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-1.5">
                    <span>Kargo Ücreti</span>
                    {billableDesi > 0 && shippingFee > 0 && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold border border-amber-200">
                        DHL • {billableDesi} Desi
                      </span>
                    )}
                  </div>
                  <span className="font-semibold">
                    {shippingFee === 0 ? (
                      <span className="text-emerald-700 font-bold">ÜCRETSİZ</span>
                    ) : (
                      formatPrice(shippingFee)
                    )}
                  </span>
                </div>
                <div className="border-t border-stone-200 pt-2 flex justify-between text-sm font-black text-stone-950">
                  <span>Genel Toplam</span>
                  <span className="text-base text-amber-700">{formatPrice(total)}</span>
                </div>
              </div>

              <Link
                href="/odeme"
                onClick={closeDrawer}
                className="w-full py-3.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition group"
              >
                <span>Güvenli Ödemeye Geç</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
              </Link>

              <div className="space-y-2 pt-1 border-t border-stone-200">
                <div className="flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>256-Bit SSL & 3D Secure ile %100 Güvenli Ödeme</span>
                </div>
                <div className="relative h-6 w-full opacity-85 hover:opacity-100 transition-opacity">
                  <Image
                    src="/images/iyzico/logo_band_colored.svg"
                    alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
                    fill
                    className="object-contain"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
