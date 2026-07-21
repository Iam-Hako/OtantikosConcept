"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { ShieldCheck, CreditCard, Lock, CheckCircle2, Truck, ArrowLeft } from "lucide-react";
import confetti from "canvas-confetti";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, grandTotal, subtotal, shipping, discountAmount, clearCart } = useCart();

  const [paymentMethod, setPaymentMethod] = useState<"card" | "transfer">("card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [orderId, setOrderId] = useState("");

  // Form State
  const [formData, setFormData] = useState({
    fullName: "Ahmet Yılmaz",
    email: "ahmet.yilmaz@example.com",
    phone: "0532 123 45 67",
    city: "İstanbul",
    district: "Kadıköy",
    address: "Moda Cd. No:42 Daire:5",
    cardNumber: "4543 2100 1234 5678",
    cardHolder: "AHMET YILMAZ",
    expiry: "12/28",
    cvv: "321",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmitOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    // Mock Ödeme İşlemi Simülasyonu (1.5 saniye)
    setTimeout(() => {
      const generatedOrderId = `OTC-${Math.floor(100000 + Math.random() * 900000)}`;
      setOrderId(generatedOrderId);
      setIsProcessing(false);
      setIsSuccess(true);
      clearCart();

      // Konfeti Kutlama Efekti
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
      });
    }, 1500);
  };

  if (isSuccess) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-600 animate-bounce">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-widest text-[#C86D51]">Siparişiniz Alındı!</span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-[#3E2E28]">
            Teşekkür Ederiz, Ahmet Bey!
          </h1>
          <p className="text-sm text-[#7C6354]">
            Sipariş Numaranız: <strong className="text-[#3E2E28] font-mono text-base">{orderId}</strong>
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] text-left text-xs space-y-3 max-w-md mx-auto">
          <h3 className="font-bold text-[#3E2E28] border-b border-[#E6DCD3] pb-2 text-sm">Sipariş Bilgileri</h3>
          <p><strong>Teslimat Adresi:</strong> {formData.address}, {formData.district} / {formData.city}</p>
          <p><strong>Ödeme Tipi:</strong> Kredi Kartı (Iyzico Güvenli Ödeme)</p>
          <p><strong>Tahmini Teslimat:</strong> 2-3 İş Günü İçi Yurtiçi Kargo</p>
          <p className="text-emerald-700 font-medium">✉ Sipariş onay detayları {formData.email} adresinize gönderildi.</p>
        </div>

        <div className="pt-4">
          <Link
            href="/"
            className="px-8 py-3.5 bg-[#C86D51] text-white font-semibold rounded-full hover:bg-[#B05B41] transition shadow-md inline-block text-sm"
          >
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-20 text-center space-y-4">
        <p className="text-sm text-[#7C6354]">Ödeme yapmak için sepetinizde en az bir ürün bulunmalıdır.</p>
        <Link href="/urunler" className="px-6 py-2.5 bg-[#C86D51] text-white text-xs font-semibold rounded-full inline-block">
          Ürünlere Git
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      
      {/* Üst Navigasyon */}
      <div className="flex items-center justify-between mb-8">
        <Link href="/sepet" className="inline-flex items-center gap-2 text-xs font-semibold text-[#7C6354] hover:text-[#C86D51]">
          <ArrowLeft className="w-4 h-4" /> Sepete Geri Dön
        </Link>
        <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Korumalı Checkout
        </div>
      </div>

      <form onSubmit={handleSubmitOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* SOL: ADRES VE ÖDEME BİLGİLERİ */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Teslimat Adresi */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#3E2E28] flex items-center gap-2">
              <Truck className="w-5 h-5 text-[#C86D51]" /> Teslimat Adresi
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Ad Soyad</label>
                <input
                  type="text"
                  name="fullName"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2E28] mb-1">E-Posta Adresi</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Telefon Numarası</label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Şehir</label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Açık Adres</label>
              <textarea
                name="address"
                rows={3}
                required
                value={formData.address}
                onChange={handleChange}
                className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
              />
            </div>
          </div>

          {/* 2. Ödeme Yöntemi ve Kart Bilgileri */}
          <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-4">
            <h2 className="font-serif text-lg font-bold text-[#3E2E28] flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-[#C86D51]" /> Ödeme Yöntemi
            </h2>

            {/* Kart / Havale Tablar */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  paymentMethod === "card"
                    ? "bg-[#3E2E28] text-white border-[#3E2E28]"
                    : "bg-[#F8F5F0] text-[#3E2E28] border-[#D8C7B5]"
                }`}
              >
                <CreditCard className="w-4 h-4" /> Kredi / Banka Kartı
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("transfer")}
                className={`py-3 px-4 rounded-xl text-xs font-bold border flex items-center justify-center gap-2 transition ${
                  paymentMethod === "transfer"
                    ? "bg-[#3E2E28] text-white border-[#3E2E28]"
                    : "bg-[#F8F5F0] text-[#3E2E28] border-[#D8C7B5]"
                }`}
              >
                EFT / Havale (%5 İndirimli)
              </button>
            </div>

            {paymentMethod === "card" ? (
              <div className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Kart Üzerindeki İsim</label>
                  <input
                    type="text"
                    name="cardHolder"
                    required
                    value={formData.cardHolder}
                    onChange={handleChange}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs focus:ring-1 focus:ring-[#C86D51] focus:outline-none uppercase"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Kart Numarası</label>
                  <input
                    type="text"
                    name="cardNumber"
                    required
                    maxLength={19}
                    value={formData.cardNumber}
                    onChange={handleChange}
                    className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-[#C86D51] focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2E28] mb-1">Son Kullanma (AA/YY)</label>
                    <input
                      type="text"
                      name="expiry"
                      placeholder="MM/YY"
                      required
                      value={formData.expiry}
                      onChange={handleChange}
                      className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-[#C86D51] focus:outline-none text-center"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-[#3E2E28] mb-1">CVV Güvenlik Kodu</label>
                    <input
                      type="password"
                      name="cvv"
                      required
                      maxLength={4}
                      value={formData.cvv}
                      onChange={handleChange}
                      className="w-full bg-[#F8F5F0] border border-[#D8C7B5] rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-[#C86D51] focus:outline-none text-center"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-[#F8F5F0] rounded-xl text-xs text-[#7C6354] space-y-2 border border-[#D8C7B5]">
                <p className="font-bold text-[#3E2E28]">Banka Havalesi Bilgileri:</p>
                <p>Banka: Ziraat Bankası</p>
                <p>Alıcı: OtantikosConcept Tic. Ltd. Şti.</p>
                <p className="font-mono text-xs text-[#3E2E28] bg-white p-2 rounded border border-[#E6DCD3]">
                  IBAN: TR92 0001 0009 0123 4567 8900 01
                </p>
                <p className="text-[11px]">Sipariş numaranızı açıklama kısmına yazmayı unutmayınız.</p>
              </div>
            )}
          </div>

        </div>

        {/* SAĞ: SİPARİŞ ÖZETİ & TAMAMLA */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-[#E6DCD3] shadow-sm space-y-6 sticky top-28">
            <h2 className="font-serif text-lg font-bold text-[#3E2E28] border-b border-[#E6DCD3] pb-4">
              Siparişiniz ({cart.length} Ürün)
            </h2>

            {/* Ürün Mini Listesi */}
            <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
              {cart.map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-xs">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-[#F8F5F0] border border-[#E6DCD3] flex-shrink-0">
                    <Image src={item.product.images[0]} alt={item.product.title} fill className="object-cover" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-[#3E2E28] line-clamp-1">{item.product.title}</h4>
                    <span className="text-[#7C6354]">{item.quantity} Adet {item.selectedVariant && `(${item.selectedVariant})`}</span>
                  </div>
                  <span className="font-bold text-[#3E2E28]">
                    {(item.product.price * item.quantity).toFixed(2)} TL
                  </span>
                </div>
              ))}
            </div>

            {/* Fiyat Listesi */}
            <div className="space-y-2 text-xs border-t border-b border-[#E6DCD3] py-4">
              <div className="flex justify-between text-[#7C6354]">
                <span>Ara Toplam</span>
                <span>{subtotal.toFixed(2)} TL</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>İndirim</span>
                  <span>-{discountAmount.toFixed(2)} TL</span>
                </div>
              )}

              <div className="flex justify-between text-[#7C6354]">
                <span>Kargo</span>
                <span>{shipping === 0 ? "Ücretsiz" : `${shipping.toFixed(2)} TL`}</span>
              </div>

              <div className="flex justify-between items-baseline pt-2 border-t border-[#E6DCD3] text-sm">
                <span className="font-bold text-[#3E2E28]">Ödenecek Tutar</span>
                <span className="text-xl font-bold text-[#C86D51]">{grandTotal.toFixed(2)} TL</span>
              </div>
            </div>

            {/* Siparişi Onayla Butonu */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-4 bg-[#C86D51] text-white font-semibold text-sm rounded-full hover:bg-[#B05B41] transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span>Ödeme İşleniyor...</span>
              ) : (
                <>
                  <Lock className="w-4 h-4" /> Siparişi Tamamla & Öde ({grandTotal.toFixed(2)} TL)
                </>
              )}
            </button>

            <p className="text-[10px] text-center text-[#7C6354]">
              "Siparişi Tamamla" butonuna basarak Mesafeli Satış Sözleşmesi'ni kabul etmiş olursunuz.
            </p>
          </div>
        </div>

      </form>
    </div>
  );
}
