"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight, Tag, ShieldCheck } from "lucide-react";

export default function CartPage() {
  const {
    cart,
    removeFromCart,
    updateQuantity,
    subtotal,
    shipping,
    grandTotal,
    appliedCoupon,
    applyCoupon,
    removeCoupon,
    discountAmount,
    clearCart,
  } = useCart();
  const { siteTexts } = useAuth();

  const [couponInput, setCouponInput] = React.useState("");
  const [couponError, setCouponError] = React.useState("");
  const [couponSuccess, setCouponSuccess] = React.useState("");

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError("");
    setCouponSuccess("");

    if (!couponInput.trim()) return;

    const success = applyCoupon(couponInput);
    if (success) {
      setCouponSuccess(siteTexts?.cartPage?.couponSuccessText || "%10 İndirim Kuponu Başarıyla Uygulandı!");
      setCouponInput("");
    } else {
      setCouponError("Geçersiz kupon kodu. İpucu: 'OTANTIK10' deneyin.");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-6">
        <div className="w-24 h-24 bg-[#EAE0D5] rounded-full flex items-center justify-center mx-auto text-[#C86D51]">
          <ShoppingBag className="w-12 h-12" />
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#3E2E28]">
          {siteTexts?.cartPage?.emptyCartTitle || "Sepetiniz Boş"}
        </h1>
        <p className="text-sm text-[#7C6354] max-w-md mx-auto">
          {siteTexts?.cartPage?.emptyCartDesc || "Henüz sepetinize ürün eklemediniz. Ürünler sayfamızdan alışverişe başlayabilirsiniz."}
        </p>
        <Link
          href="/urunler"
          className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md"
        >
          <span>{siteTexts?.cartPage?.startShoppingButton || "Alışverişe Başla"}</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="font-serif text-3xl font-bold text-[#3E2E28] mb-8">
        {siteTexts?.cartPage?.title || "Alışveriş Sepetiniz"}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL: SEPETTEKİ ÜRÜNLER LİSTESİ */}
        <div className="lg:col-span-8 space-y-4">
          <div className="bg-white rounded-2xl border border-[#E6DCD3] shadow-sm overflow-hidden">
            <div className="p-4 bg-[#F8F5F0] border-b border-[#E6DCD3] flex justify-between items-center text-xs font-bold uppercase text-[#7C6354]">
              <span>Ürün</span>
              <button
                onClick={clearCart}
                className="text-xs text-rose-600 hover:underline font-normal capitalize"
              >
                Sepeti Temizle
              </button>
            </div>

            <div className="divide-y divide-[#E6DCD3]">
              {cart.map((item, idx) => (
                <div key={idx} className="p-4 sm:p-6 flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[#F8F5F0] border border-[#E6DCD3] flex-shrink-0">
                    <Image src={item.product.images[0] || "/otantikos-logo.png"} alt={item.product.title} fill className="object-cover" />
                  </div>

                  <div className="flex-1 text-center sm:text-left">
                    <span className="text-[10px] font-bold text-[#C86D51] uppercase tracking-wider">
                      {item.product.category}
                    </span>
                    <Link href={`/urun/${item.product.slug}`}>
                      <h3 className="font-serif text-base font-bold text-[#3E2E28] hover:text-[#C86D51] transition">
                        {item.product.title}
                      </h3>
                    </Link>
                    {item.selectedVariant && (
                      <p className="text-xs text-[#7C6354] mt-0.5">Seçim: {item.selectedVariant}</p>
                    )}
                  </div>

                  <div className="flex items-center border border-[#D8C7B5] rounded-full bg-[#F8F5F0] px-2 py-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant)}
                      className="p-1 text-[#3E2E28] hover:text-[#C86D51]"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="w-8 text-center text-xs font-bold text-[#3E2E28]">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant)}
                      className="p-1 text-[#3E2E28] hover:text-[#C86D51]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right hidden sm:block min-w-[90px]">
                    <span className="text-base font-bold text-[#3E2E28]">
                      {(item.product.price * item.quantity).toFixed(2)} TL
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.product.id, item.selectedVariant)}
                    className="p-2 text-rose-500 hover:bg-rose-50 rounded-full transition"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* SAĞ: SİPARİŞ ÖZETİ */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#3E2E28] border-b border-[#E6DCD3] pb-4">
              {siteTexts?.cartPage?.summaryTitle || "Sipariş Özeti"}
            </h2>

            {/* Kupon Kodu Girişi */}
            <div>
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder={siteTexts?.cartPage?.couponPlaceholder || "Kupon Kodunuz (Örn: OTANTIK10)"}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl py-2 px-3 pl-8 text-xs focus:outline-none focus:ring-1 focus:ring-[#C86D51] uppercase"
                  />
                  <Tag className="w-3.5 h-3.5 text-[#7C6354] absolute left-2.5 top-3" />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#3E2E28] text-white text-xs font-semibold rounded-xl hover:bg-black transition"
                >
                  {siteTexts?.cartPage?.couponApplyButton || "Uygula"}
                </button>
              </form>
              {couponError && <p className="text-[11px] text-rose-600 mt-1.5">{couponError}</p>}
              {couponSuccess && <p className="text-[11px] text-emerald-600 mt-1.5 font-medium">{couponSuccess}</p>}

              {appliedCoupon && (
                <div className="mt-2 p-2 bg-emerald-50 rounded-lg text-xs text-emerald-800 flex justify-between items-center">
                  <span>Kupon: <strong>{appliedCoupon}</strong> (%10 İndirim)</span>
                  <button onClick={removeCoupon} className="text-rose-600 font-bold hover:underline">Kaldır</button>
                </div>
              )}
            </div>

            {/* Fiyat Hesaplama Tablosu */}
            <div className="space-y-3 text-xs border-t border-b border-[#E6DCD3] py-4">
              <div className="flex justify-between text-[#7C6354]">
                <span>{siteTexts?.cartPage?.subtotal || "Ara Toplam"}</span>
                <span className="font-semibold text-[#3E2E28]">{subtotal.toFixed(2)} TL</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>{siteTexts?.cartPage?.couponDiscount || "Kupon İndirimi (%10)"}</span>
                  <span>-{discountAmount.toFixed(2)} TL</span>
                </div>
              )}

              <div className="flex justify-between text-[#7C6354]">
                <span>{siteTexts?.cartPage?.shipping || "Kargo Ücreti"}</span>
                <span className="font-semibold text-[#3E2E28]">{shipping.toFixed(2)} TL</span>
              </div>
            </div>

            {/* Toplam */}
            <div className="flex justify-between items-baseline">
              <span className="font-serif text-base font-bold text-[#3E2E28]">
                {siteTexts?.cartPage?.total || "Genel Toplam"}
              </span>
              <span className="text-2xl font-bold text-[#C86D51]">
                {grandTotal.toFixed(2)} <span className="text-xs font-normal">TL</span>
              </span>
            </div>

            {/* Ödeme Yap Butonu */}
            <Link
              href="/checkout"
              className="w-full py-4 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition shadow-lg flex items-center justify-center gap-2 group text-sm"
            >
              <span>{siteTexts?.cartPage?.checkoutButton || "Ödemeye Geç"}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>

            <div className="flex items-center justify-center gap-2 text-[11px] text-[#7C6354] pt-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>{siteTexts?.cartPage?.secureShoppingBadge || "Güvenli Alışveriş & 256-bit SSL"}</span>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
