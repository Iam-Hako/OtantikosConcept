'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  Truck, 
  Store, 
  CreditCard, 
  Lock, 
  Check, 
  ArrowLeft, 
  Gift, 
  FileText,
  AlertCircle,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useAuth } from '@/lib/store/auth-context';
import { TURKISH_PROVINCES } from '@/lib/data/provinces-and-districts';
import { DataService } from '@/lib/data/store-data';
import { generateOrderNumber, formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuth();
  const {
    items,
    subtotal,
    shippingFee,
    giftWrapFee,
    hasGiftWrap,
    giftNote,
    deliveryType,
    setDeliveryType,
    total,
    kdvAmount,
    clearCart,
  } = useCart();

  // Step state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Address & Contact state
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [province, setProvince] = useState('İstanbul');
  const [district, setDistrict] = useState('Fatih (Eminönü/Tahtakale)');
  const [fullAddress, setFullAddress] = useState('');
  const [postalCode, setPostalCode] = useState('34116');
  const [courierNote, setCourierNote] = useState('');

  // Invoice state
  const [invoiceType, setInvoiceType] = useState<'individual' | 'corporate'>('individual');
  const [identityNumber, setIdentityNumber] = useState('');
  const [companyTitle, setCompanyTitle] = useState('');
  const [taxOffice, setTaxOffice] = useState('');
  const [taxNumber, setTaxNumber] = useState('');

  // Legal approvals
  const [acceptDistanceSales, setAcceptDistanceSales] = useState(true);
  const [acceptPreInfo, setAcceptPreInfo] = useState(true);
  const [acceptKvkk, setAcceptKvkk] = useState(true);

  // Virtual POS Card state
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [cvc, setCvc] = useState('');

  // Active district list based on selected province
  const currentDistricts = TURKISH_PROVINCES.find((p) => p.name === province)?.districts || [];

  // Update district when province changes
  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const found = TURKISH_PROVINCES.find((p) => p.name === newProvince);
    if (found && found.districts.length > 0) {
      setDistrict(found.districts[0]);
    }
  };

  const handleFillDemoCard = () => {
    setCardNumber('5400 0000 0000 0000');
    setCardHolder(fullName || 'Ahmet Yılmaz');
    setExpiryDate('12/28');
    setCvc('123');
    toast.info('Test kredi kartı bilgileri dolduruldu.');
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Sepetiniz boş.');
      router.push('/kategori/tum-urunler');
      return;
    }

    if (!acceptDistanceSales || !acceptPreInfo || !acceptKvkk) {
      toast.error('Lütfen yasal sözleşme ve ön bilgilendirme koşullarını onaylayınız.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Race Condition Inventory Check
      const allProducts = await DataService.getProducts();
      for (const item of items) {
        const prod = allProducts.find((p) => p.id === item.product.id);
        const availStock = item.variant ? item.variant.stock : prod?.stock ?? 0;
        if (availStock < item.quantity) {
          toast.error(`Üzgünüz, "${item.product.name}" için yeterli stok bulunamadı! (Mevcut: ${availStock} adet)`);
          setIsSubmitting(false);
          return;
        }
      }

      // 2. Build Order Payload
      // 2. Submit to Server-Side Hardened Checkout API (Enforces Price & Stock Integrity)
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            product_id: i.product.id,
            variant_id: i.variant?.id || null,
            quantity: Math.floor(Math.max(1, i.quantity)),
          })),
          delivery_type: deliveryType,
          has_gift_wrap: hasGiftWrap,
          gift_note: giftNote ? giftNote.trim().slice(0, 500) : '',
          shipping_address: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            province,
            district,
            full_address: deliveryType === 'magaza_teslim' ? 'Tahtakale Eminönü Mağaza Teslim' : fullAddress.trim(),
            postal_code: postalCode.trim(),
            courier_note: courierNote.trim().slice(0, 200),
            invoice_type: invoiceType,
            identity_number: identityNumber.trim(),
            company_title: companyTitle.trim(),
            tax_office: taxOffice.trim(),
            tax_number: taxNumber.trim(),
          },
          billing_address: {
            full_name: fullName.trim(),
            phone: phone.trim(),
            province,
            district,
            full_address: deliveryType === 'magaza_teslim' ? 'Tahtakale Eminönü Mağaza Teslim' : fullAddress.trim(),
            postal_code: postalCode.trim(),
            invoice_type: invoiceType,
            identity_number: identityNumber.trim(),
            company_title: companyTitle.trim(),
            tax_office: taxOffice.trim(),
            tax_number: taxNumber.trim(),
          },
          user_id: user?.id || null,
          guest_email: email.trim().toLowerCase(),
          guest_name: fullName.trim(),
          guest_phone: phone.trim(),
        }),
      });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.error || 'Sipariş oluşturulamadı.');
      }

      // 3. Clear Cart and Redirect
      clearCart();
      toast.success('Siparişiniz başarıyla alındı!');
      router.push(`/odeme/basarili?order_number=${result.order_number}&email=${encodeURIComponent(email)}`);
    } catch (err: any) {
      toast.error(err.message || 'Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-xl font-bold text-stone-900 mb-4">Sepetiniz Boş</h2>
        <Link href="/kategori/tum-urunler" className="px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-lg">
          Ürünlere Göz Atın
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Breadcrumbs */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/sepet" className="p-1.5 rounded-lg border border-stone-200 text-stone-600 hover:bg-stone-100">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
              Güvenli Ödeme ve Sipariş Onayı
            </h1>
            <p className="text-xs text-stone-500">256-Bit SSL korumalı Tahtakale güvenli checkout</p>
          </div>
        </div>
      </div>

      <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Forms (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* 1. CONTACT & DELIVERY TYPE */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-5 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">1</span>
                <span>İletişim ve Teslimat Tercihi</span>
              </h2>
              {!user && (
                <Link href="/giris?redirect=/odeme" className="text-xs text-amber-700 font-bold hover:underline">
                  Giriş Yaparak Devam Et ➔
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Adınız Soyadınız *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">E-Posta Adresiniz *</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@example.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Cep Telefonu *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 123 45 67"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Delivery Type Option */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-stone-700 mb-2">Teslimat Yöntemi:</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                    deliveryType === 'kargo' ? 'border-amber-600 bg-amber-50/40' : 'border-stone-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="checkout-del"
                    checked={deliveryType === 'kargo'}
                    onChange={() => setDeliveryType('kargo')}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <Truck className="w-4 h-4 text-amber-700" />
                      <span>Standart Kargo Teslimatı</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Adresinize sigortalı gönderim</span>
                  </div>
                </label>

                <label
                  className={`p-3.5 rounded-xl border-2 cursor-pointer flex items-center gap-3 transition ${
                    deliveryType === 'magaza_teslim' ? 'border-amber-600 bg-amber-50/40' : 'border-stone-200'
                  }`}
                >
                  <input
                    type="radio"
                    name="checkout-del"
                    checked={deliveryType === 'magaza_teslim'}
                    onChange={() => setDeliveryType('magaza_teslim')}
                    className="text-amber-600"
                  />
                  <div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-stone-900">
                      <Store className="w-4 h-4 text-amber-700" />
                      <span>Eminönü Tahtakale Mağaza Teslim (Ücretsiz)</span>
                    </div>
                    <span className="text-[10px] text-stone-500">Şubemizden hemen elden teslim alın</span>
                  </div>
                </label>
              </div>
            </div>
          </div>

          {/* 2. ADDRESS FORM (81 PROVINCES & DEPENDENT DISTRICTS) */}
          {deliveryType === 'kargo' && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
                <span>Teslimat ve Kargo Adresi (81 İl Doğrulamalı)</span>
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* 81 Provinces Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">İl Seçiniz *</label>
                  <select
                    value={province}
                    onChange={(e) => handleProvinceChange(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    {TURKISH_PROVINCES.map((p) => (
                      <option key={p.name} value={p.name}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Districts Dropdown */}
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">İlçe Seçiniz *</label>
                  <select
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                  >
                    {currentDistricts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">Açık Adres (Cadde, Mahalle, Bina No, Daire) *</label>
                <textarea
                  required={deliveryType === 'kargo'}
                  rows={2}
                  value={fullAddress}
                  onChange={(e) => setFullAddress(e.target.value)}
                  placeholder="Örn: Moda Cad. No:14 Daire:5 Caferağa Mah."
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Posta Kodu</label>
                  <input
                    type="text"
                    value={postalCode}
                    onChange={(e) => setPostalCode(e.target.value)}
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Kurye / Kargo Teslimat Notu</label>
                  <input
                    type="text"
                    value={courierNote}
                    onChange={(e) => setCourierNote(e.target.value)}
                    placeholder="Örn: Zili çalmayınız, kapıya bırakınız."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* 3. INVOICE TYPE (Individual / Corporate) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Fatura Bilgileri</span>
            </h2>

            <div className="flex gap-4 text-xs font-semibold">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inv-type"
                  checked={invoiceType === 'individual'}
                  onChange={() => setInvoiceType('individual')}
                  className="text-amber-600"
                />
                <span>Bireysel Fatura</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="inv-type"
                  checked={invoiceType === 'corporate'}
                  onChange={() => setInvoiceType('corporate')}
                  className="text-amber-600"
                />
                <span>Kurumsal Şirket Faturası</span>
              </label>
            </div>

            {invoiceType === 'individual' ? (
              <div>
                <label className="block text-xs font-semibold text-stone-700 mb-1">T.C. Kimlik Numarası (İsteğe bağlı)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="11111111110"
                  className="w-full sm:w-1/2 text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none"
                />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Firma Ünvanı *</label>
                  <input
                    type="text"
                    required
                    value={companyTitle}
                    onChange={(e) => setCompanyTitle(e.target.value)}
                    placeholder="Örn: Otantikos Tic. Ltd. Şti."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Vergi Dairesi *</label>
                  <input
                    type="text"
                    required
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    placeholder="Fatih V.D."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-stone-700 mb-1">Vergi Numarası *</label>
                  <input
                    type="text"
                    required
                    maxLength={10}
                    value={taxNumber}
                    onChange={(e) => setTaxNumber(e.target.value)}
                    placeholder="1234567890"
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 4. VIRTUAL POS PAYMENT FORM */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Kredi / Banka Kartı ile Güvenli Ödeme</span>
              </h2>
              {process.env.NODE_ENV === 'development' && (
                <button
                  type="button"
                  onClick={handleFillDemoCard}
                  className="text-[11px] font-bold text-amber-700 hover:text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200"
                >
                  Test Kartı Bilgilerini Doldur
                </button>
              )}
            </div>

            <div className="p-4 rounded-xl bg-stone-900 text-white space-y-4 max-w-md">
              <div className="flex justify-between items-center text-xs text-stone-400">
                <span>SANAL POS • 3D SECURE</span>
                <CreditCard className="w-5 h-5 text-amber-400" />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Kart Üzerindeki İsim</label>
                <input
                  type="text"
                  required
                  value={cardHolder}
                  onChange={(e) => setCardHolder(e.target.value)}
                  placeholder="AD SOYAD"
                  className="w-full bg-stone-800 text-white text-xs p-2.5 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Kart Numarası</label>
                <input
                  type="text"
                  required
                  maxLength={19}
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="**** **** **** ****"
                  className="w-full bg-stone-800 text-white font-mono text-sm p-2.5 rounded-lg border border-stone-700 focus:outline-none focus:border-amber-400 tracking-wider"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">Son Kul. (AA/YY)</label>
                  <input
                    type="text"
                    required
                    maxLength={5}
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    placeholder="12/28"
                    className="w-full bg-stone-800 text-white text-xs p-2.5 rounded-lg border border-stone-700 text-center"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-stone-400 uppercase tracking-wider mb-1">CVC / CVV</label>
                  <input
                    type="password"
                    required
                    maxLength={3}
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    placeholder="***"
                    className="w-full bg-stone-800 text-white text-xs p-2.5 rounded-lg border border-stone-700 text-center"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 5. MANDATORY LEGAL AGREEMENTS CHECKBOXES */}
          <div className="bg-stone-50 rounded-2xl border border-stone-200 p-5 space-y-3 text-xs text-stone-700">
            <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider">
              Yasal Onaylar ve Sözleşmeler
            </h3>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptDistanceSales}
                onChange={(e) => setAcceptDistanceSales(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded"
              />
              <span>
                <Link href="/mesafeli-satis-sozlesmesi" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">
                  Mesafeli Satış Sözleşmesi
                </Link>
                'ni okudum, içeriğini anladım ve kabul ediyorum.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptPreInfo}
                onChange={(e) => setAcceptPreInfo(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded"
              />
              <span>
                <Link href="/on-bilgilendirme-formu" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">
                  Ön Bilgilendirme Koşulları
                </Link>
                'nı okudum ve onaylıyorum.
              </span>
            </label>

            <label className="flex items-start gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={acceptKvkk}
                onChange={(e) => setAcceptKvkk(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 rounded"
              />
              <span>
                <Link href="/kvkk" target="_blank" rel="noopener noreferrer" className="text-amber-700 font-bold underline">
                  KVKK Aydınlatma Metni
                </Link>{' '}
                kapsamında kişisel verilerimin siparişimin ifası amacıyla işlenmesine onay veriyorum.
              </span>
            </label>
          </div>

        </div>

        {/* Right Column: Sticky Order Summary & Submit Button (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-5 sticky top-24">
          <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-100 pb-3">
            Sipariş Dökümü
          </h2>

          {/* Cart Mini List */}
          <div className="divide-y divide-stone-100 max-h-60 overflow-y-auto pr-1">
            {items.map((i) => {
              const itemPrice = i.variant?.price_override ?? i.product.price;
              const cover = i.variant?.image_url || i.product.images?.[0]?.image_url || '/images/logo.webp';
              return (
                <div key={`${i.product.id}-${i.variant?.id}`} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-10 h-10 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
                      <Image src={cover} alt={i.product.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-stone-900 truncate">{i.product.name}</div>
                      <div className="text-[10px] text-stone-400">{i.quantity} Adet {i.variant ? `(${i.variant.value})` : ''}</div>
                    </div>
                  </div>
                  <span className="font-bold text-stone-900 shrink-0">{formatPrice(itemPrice * i.quantity)}</span>
                </div>
              );
            })}
          </div>

          {/* Price details */}
          <div className="space-y-2 text-xs text-stone-600 border-t border-stone-100 pt-3">
            <div className="flex justify-between">
              <span>Ara Toplam</span>
              <span className="font-semibold text-stone-900">{formatPrice(subtotal)}</span>
            </div>

            <div className="flex justify-between text-[11px] text-stone-400">
              <span>KDV (%20 Dahil)</span>
              <span>{formatPrice(kdvAmount)}</span>
            </div>

            {hasGiftWrap && (
              <div className="flex justify-between text-amber-800">
                <span>Özel Hediye Paketi</span>
                <span className="font-semibold">{formatPrice(giftWrapFee)}</span>
              </div>
            )}

            <div className="flex justify-between">
              <span>Kargo Bedeli</span>
              <span className="font-semibold">
                {shippingFee === 0 ? <span className="text-emerald-700 font-bold">ÜCRETSİZ</span> : formatPrice(shippingFee)}
              </span>
            </div>

            <div className="border-t border-stone-200 pt-3 flex justify-between text-base font-black text-stone-950">
              <span>Ödenecek Tutar</span>
              <span className="text-xl text-amber-700">{formatPrice(total)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2"
          >
            <Lock className="w-4 h-4" />
            <span>{isSubmitting ? 'Sipariş İşleniyor...' : 'Siparişi Onayla ve Öde'}</span>
          </button>

          <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Sipariş anında stok kilidi aktif edilir</span>
          </div>
        </div>

      </form>

    </div>
  );
}
