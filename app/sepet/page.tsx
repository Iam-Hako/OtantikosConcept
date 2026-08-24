'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  Gift, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Store,
  RotateCcw
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { formatPrice } from '@/lib/utils/format';

export default function CartPage() {
  const {
    items,
    removeItem,
    updateQuantity,
    clearCart,
    subtotal,
    shippingFee,
    giftWrapFee,
    hasGiftWrap,
    setHasGiftWrap,
    giftNote,
    setGiftNote,
    deliveryType,
    setDeliveryType,
    total,
    kdvAmount,
    totalItems,
  } = useCart();

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-20 h-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingBag className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-serif font-black text-stone-900 mb-2">Sepetiniz Henüz Boş</h1>
        <p className="text-xs sm:text-sm text-stone-500 max-w-md mx-auto mb-6">
          Eminönü Tahtakale'nin eşsiz çelik takı, nostaljik lamba ve trend oyuncak koleksiyonlarını keşfetmek için hemen alışverişe başlayın.
        </p>
        <Link
          href="/kategori/tum-urunler"
          className="inline-flex items-center gap-2 px-6 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition"
        >
          <span>Koleksiyonu Keşfet</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900">
            Alışveriş Sepetim
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Sepetinizde toplam <strong className="text-stone-800">{totalItems} adet</strong> ürün bulunmaktadır.
          </p>
        </div>
        <button
          onClick={clearCart}
          className="text-xs text-rose-600 hover:text-rose-700 font-semibold flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Sepeti Boşalt</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Cart Items & Gift Options (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Items List */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden divide-y divide-stone-100 shadow-xs">
            {items.map((item) => {
              const itemPrice = item.variant?.price_override ?? item.product.price;
              const cover = item.variant?.image_url || item.product.images?.[0]?.image_url || '/images/logo.webp';
              const maxStock = item.variant ? item.variant.stock : item.product.stock;

              return (
                <div key={`${item.product.id}-${item.variant?.id || 'base'}`} className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4 sm:items-center justify-between">
                  <div className="flex gap-4 items-center">
                    <div className="relative w-20 h-20 rounded-xl bg-stone-100 border border-stone-200 overflow-hidden shrink-0">
                      <Image src={cover} alt={item.product.name} fill className="object-cover" />
                    </div>

                    <div className="space-y-1">
                      <span className="text-[10px] text-amber-700 uppercase font-bold tracking-wider">
                        {item.product.category?.name || 'Tahtakale'}
                      </span>
                      <h3 className="text-xs sm:text-sm font-bold text-stone-900 line-clamp-2">
                        <Link href={`/urun/${item.product.slug}`} className="hover:text-amber-700">
                          {item.product.name}
                        </Link>
                      </h3>
                      {item.variant && (
                        <span className="inline-block text-[11px] text-stone-600 bg-stone-100 px-2 py-0.5 rounded">
                          {item.variant.name}: <strong>{item.variant.value}</strong>
                        </span>
                      )}
                      <div className="text-xs text-stone-500 font-medium sm:hidden">
                        Birim Fiyat: {formatPrice(itemPrice)}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-6 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                    {/* Stepper */}
                    <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.variant?.id)}
                        className="p-1.5 text-stone-600 hover:text-amber-700"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-bold text-stone-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.variant?.id)}
                        disabled={item.quantity >= maxStock}
                        className="p-1.5 text-stone-600 hover:text-amber-700 disabled:opacity-30"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Line Total */}
                    <div className="text-right min-w-[90px]">
                      <div className="text-sm font-black text-amber-700">
                        {formatPrice(itemPrice * item.quantity)}
                      </div>
                      <div className="text-[10px] text-stone-400 hidden sm:block">
                        Adet: {formatPrice(itemPrice)}
                      </div>
                    </div>

                    {/* Delete */}
                    <button
                      onClick={() => removeItem(item.product.id, item.variant?.id)}
                      className="text-stone-400 hover:text-rose-600 p-1 transition"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Delivery Method Selection */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-stone-900">
              Teslimat Yöntemi Tercihiniz
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  deliveryType === 'kargo'
                    ? 'border-amber-600 bg-amber-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="kargo"
                  checked={deliveryType === 'kargo'}
                  onChange={() => setDeliveryType('kargo')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                    <Truck className="w-4 h-4 text-amber-700" />
                    <span>Anlaşmalı Standart Kargo</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Adresinize güvenli ve sigortalı teslimat.
                  </p>
                </div>
              </label>

              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition flex items-start gap-3 ${
                  deliveryType === 'magaza_teslim'
                    ? 'border-amber-600 bg-amber-50/50'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <input
                  type="radio"
                  name="delivery"
                  value="magaza_teslim"
                  checked={deliveryType === 'magaza_teslim'}
                  onChange={() => setDeliveryType('magaza_teslim')}
                  className="mt-1 text-amber-600 focus:ring-amber-500"
                />
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-xs text-stone-900">
                    <Store className="w-4 h-4 text-amber-700" />
                    <span>Tahtakale Mağazadan Teslim (Ücretsiz)</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    Eminönü şubemizden aynı gün kargo ücreti ödemeden teslim alın.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Gift Wrap Box */}
          <div className="bg-amber-50/70 rounded-2xl border border-amber-200 p-6 space-y-4">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasGiftWrap}
                onChange={(e) => setHasGiftWrap(e.target.checked)}
                className="w-4 h-4 text-amber-600 rounded border-stone-300 focus:ring-amber-500"
              />
              <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-stone-900">
                <Gift className="w-4 h-4 text-amber-700" />
                <span>Siparişimi Özel Hediye Paketi Yap (+₺50,00)</span>
              </div>
            </label>

            {hasGiftWrap && (
              <div className="space-y-1.5 pt-2">
                <div className="flex justify-between text-xs text-stone-500">
                  <span>Özel Hediye Kartı Notu:</span>
                  <span className={giftNote.length > 240 ? 'text-amber-700 font-bold' : ''}>
                    {giftNote.length} / 250 Karakter
                  </span>
                </div>
                <textarea
                  rows={2}
                  maxLength={250}
                  value={giftNote}
                  onChange={(e) => setGiftNote(e.target.value)}
                  placeholder="Sevdiklerinize iletmek istediğiniz özel notunuzu yazabilirsiniz..."
                  className="w-full text-xs p-3 bg-white border border-amber-300 rounded-xl focus:outline-none focus:border-amber-600"
                />
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Order Summary (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5 sticky top-24">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
            Sipariş Özeti
          </h2>

          <div className="space-y-2.5 text-xs text-stone-600">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-[11px] text-stone-400">
              <span>%20 KDV Dahil Tutar</span>
              <span>{formatPrice(kdvAmount)}</span>
            </div>

            {hasGiftWrap && (
              <div className="flex justify-between text-amber-800 font-medium">
                <span>Özel Hediye Paketi</span>
                <span>{formatPrice(giftWrapFee)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Kargo Ücreti</span>
              <span className="font-semibold">
                {shippingFee === 0 ? (
                  <span className="text-emerald-700 font-bold">Ücretsiz</span>
                ) : (
                  formatPrice(shippingFee)
                )}
              </span>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-black text-stone-950">
              <span>Toplam Tutar</span>
              <span className="text-xl text-amber-700">{formatPrice(total)}</span>
            </div>
          </div>

          <Link
            href="/odeme"
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-600/30 transition flex items-center justify-center gap-2 group"
          >
            <span>Güvenli Ödemeye Geç</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
          </Link>

          <div className="space-y-2 pt-2 border-t border-stone-100 text-[11px] text-stone-500">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>256-Bit SSL ve 3D Secure ile korunan sanal POS</span>
            </div>
            <div className="flex items-center gap-2">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <span>14 gün yasal koşulsuz iade ve değişim hakkı</span>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
}
