'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
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
  Sparkles,
  X,
  MessageCircle,
  Clock,
  ArrowRight,
  Bell,
  CheckCircle2,
  Phone,
  MapPin
} from 'lucide-react';
import { useCart } from '@/lib/store/cart-store';
import { useAuth } from '@/lib/store/auth-context';
import { TURKISH_PROVINCES } from '@/lib/data/provinces-and-districts';
import { DataService } from '@/lib/data/store-data';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

// Online sales active flag (can be toggled via NEXT_PUBLIC_ONLINE_SALES_ACTIVE in .env.local)
const isOnlineSalesActive = process.env.NEXT_PUBLIC_ONLINE_SALES_ACTIVE === 'true';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const urlError = searchParams?.get('error');

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

  // Pre-launch email notification state
  const [notifyEmail, setNotifyEmail] = useState(user?.email || '');
  const [isNotified, setIsNotified] = useState(false);

  // Step & Modal state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'iyzico' | 'magaza_nakit'>('iyzico');
  const [isIyzicoModalOpen, setIsIyzicoModalOpen] = useState(false);
  const [iyzicoHtml, setIyzicoHtml] = useState('');
  const iyzicoContainerRef = useRef<HTMLDivElement>(null);

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

  // Catch URL errors from iyzico callback
  useEffect(() => {
    if (urlError) {
      toast.error(decodeURIComponent(urlError), { duration: 6000 });
    }
  }, [urlError]);

  // Handle iyzico checkout form script injection
  useEffect(() => {
    if (isIyzicoModalOpen && iyzicoHtml && iyzicoContainerRef.current) {
      try {
        iyzicoContainerRef.current.innerHTML = '';
        const range = document.createRange();
        range.selectNode(iyzicoContainerRef.current);
        const fragment = range.createContextualFragment(iyzicoHtml);
        iyzicoContainerRef.current.appendChild(fragment);
      } catch (err) {
        console.error('iyzico script execution error:', err);
      }
    }
  }, [isIyzicoModalOpen, iyzicoHtml]);

  // Handle pre-launch email submission
  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyEmail.trim() || !notifyEmail.includes('@')) {
      toast.error('Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    setIsNotified(true);
    toast.success('Bildirim kaydınız alındı! Satışlar başladığında ilk size haber vereceğiz.');
  };

  // Build prefilled WhatsApp message with selected cart items
  const whatsappCartMessage = encodeURIComponent(
    `Merhaba Otantikos Concept, sepetimdeki şu ürünler için sipariş vermek istiyorum:\n\n` +
    items.map((it) => `• ${it.product.name} ${it.variant ? `(${it.variant.value})` : ''} - ${it.quantity} Adet (${formatPrice((it.variant?.price_override ?? it.product.price) * it.quantity)})`).join('\n') +
    `\n\nAra Toplam: ${formatPrice(subtotal)}\nToplam Tutar: ${formatPrice(total)}\n\nSiparişim için yardımcı olabilir misiniz?`
  );

  // Active district list based on selected province
  const currentDistricts = TURKISH_PROVINCES.find((p) => p.name === province)?.districts || [];

  const handleProvinceChange = (newProvince: string) => {
    setProvince(newProvince);
    const found = TURKISH_PROVINCES.find((p) => p.name === newProvince);
    if (found && found.districts.length > 0) {
      setDistrict(found.districts[0]);
    }
  };

  const handleCompleteOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toast.error('Sepetiniz boş.');
      router.push('/kategori/tum-urunler');
      return;
    }

    if (!acceptDistanceSales || !acceptPreInfo || !acceptKvkk) {
      toast.error('Lütfen Mesafeli Satış Sözleşmesi ve Yasal Onayları kabul ediniz.');
      return;
    }

    if (!fullName.trim() || !phone.trim() || !email.trim()) {
      toast.error('Lütfen ad, soyad, telefon ve e-posta alanlarını doldurunuz.');
      return;
    }

    if (deliveryType !== 'magaza_teslim' && !fullAddress.trim()) {
      toast.error('Lütfen açık teslimat adresinizi giriniz.');
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

      const orderPayloadItems = items.map((i) => ({
        product_id: i.product.id,
        variant_id: i.variant?.id || null,
        quantity: Math.floor(Math.max(1, i.quantity)),
      }));

      const addressData = {
        full_name: fullName.trim(),
        phone: phone.trim(),
        province,
        district,
        address_detail: deliveryType === 'magaza_teslim' ? 'Tahtakale Eminönü Mağaza Teslim' : fullAddress.trim(),
        zip_code: postalCode.trim(),
        invoice_type: invoiceType,
        identity_number: identityNumber.trim(),
        company_title: companyTitle.trim(),
        tax_office: taxOffice.trim(),
        tax_number: taxNumber.trim(),
      };

      // 2A. iyzico Payment Flow
      if (paymentMethod === 'iyzico') {
        const response = await fetch('/api/iyzico/initialize', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderPayloadItems,
            delivery_type: deliveryType,
            has_gift_wrap: hasGiftWrap,
            gift_note: giftNote ? giftNote.trim().slice(0, 500) : '',
            shipping_address: addressData,
            billing_address: addressData,
            user_id: user?.id || null,
            guest_email: email.trim().toLowerCase(),
            guest_name: fullName.trim(),
            guest_phone: phone.trim(),
            identity_number: identityNumber.trim() || '11111111111',
          }),
        });

        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error || 'iyzico ödeme formu başlatılamadı.');
        }

        if (result.isPreLaunch) {
          router.push('/yakinda');
          return;
        }

        if (result.checkoutFormContent) {
          setIyzicoHtml(result.checkoutFormContent);
          setIsIyzicoModalOpen(true);
        } else if (result.paymentPageUrl && !result.isSimulated) {
          window.location.href = result.paymentPageUrl;
        } else {
          router.push('/yakinda');
        }
      } 
      // 2B. Direct Store Delivery Cash/POS
      else {
        const response = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            items: orderPayloadItems,
            delivery_type: 'magaza_teslim',
            has_gift_wrap: hasGiftWrap,
            gift_note: giftNote ? giftNote.trim().slice(0, 500) : '',
            shipping_address: addressData,
            billing_address: addressData,
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

        clearCart();
        toast.success('Siparişiniz mağazadan teslim alınmak üzere oluşturuldu!');
        router.push(`/odeme/basarili?order_number=${result.order_number}&email=${encodeURIComponent(email)}`);
      }
    } catch (err: any) {
      toast.error(err.message || 'Ödeme işlemi sırasında bir hata oluştu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-stone-900">Sepetiniz Boş</h2>
        <p className="text-xs text-stone-500 max-w-sm mx-auto">
          Sepetinize henüz ürün eklemediniz. Tahtakale özgün koleksiyonumuzu hemen keşfedebilirsiniz.
        </p>
        <Link href="/kategori/tum-urunler" className="inline-flex px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition">
          Ürünlere Göz Atın
        </Link>
      </div>
    );
  }

  // =========================================================================
  // PRE-LAUNCH SCREEN: DISPLAYED WHEN ONLINE SALES ARE PREPARING
  // =========================================================================
  if (!isOnlineSalesActive) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8 pb-24 lg:pb-16 text-center">
        
        {/* Top Breadcrumb / Back Link */}
        <div className="flex items-center justify-between border-b border-stone-200 pb-4">
          <Link href="/sepet" className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-amber-700 transition">
            <ArrowLeft className="w-4 h-4" />
            <span>Sepete Geri Dön</span>
          </Link>
          <div className="flex items-center gap-2 text-xs text-stone-500">
            <Lock className="w-3.5 h-3.5 text-emerald-600" />
            <span>256-Bit SSL & iyzico Sanal POS Hazırlığı</span>
          </div>
        </div>

        {/* Hero Announcement */}
        <div className="space-y-4">
          <div className="relative w-20 h-20 mx-auto bg-stone-950 rounded-3xl p-3 border border-stone-800 shadow-xl">
            <Image src="/images/logo.webp" alt="Otantikos Concept" fill className="object-contain p-1.5" />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold">
            <Clock className="w-3.5 h-3.5 text-amber-700" />
            <span>Geri Sayım Başladı • Altyapı Hazırlığı Sürüyor</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-serif font-black text-stone-900 leading-tight">
            Online Satışlarımız Çok Yakında Başlıyor!
          </h1>

          <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto leading-relaxed">
            Otantikos Concept Eminönü Tahtakale koleksiyonumuz için doğrudan kredi kartı ve <strong>iyzico Sanal POS</strong> satış altyapımız tamamlanmak üzeredir. Çok yakında tüm Türkiye&apos;ye 3D Secure güvenli ödeme ve peşin fiyatına taksitle online sipariş alımına başlıyoruz.
          </p>
        </div>

        {/* Official iyzico Logo Band */}
        <div className="p-4 sm:p-5 bg-stone-50 rounded-3xl border border-stone-200 shadow-2xs max-w-xl mx-auto space-y-2">
          <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider block">
            BDDK Lisanslı iyzico Sanal POS Entegrasyonu
          </span>
          <div className="relative h-7 w-60 mx-auto opacity-90">
            <Image
              src="/images/iyzico/logo_band_colored.svg"
              alt="iyzico, Visa, MasterCard, Troy"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-[10px] text-stone-400">
            256-Bit SSL Sertifikası • 3D Secure SMS Koruması • Tüm Banka Kartlarına Taksit İmkanı
          </p>
        </div>

        {/* Selected Cart Items Mini Preview (Customer's Cart is Safe!) */}
        <div className="bg-white rounded-3xl border border-stone-200 p-5 sm:p-6 max-w-xl mx-auto text-left space-y-4 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <h3 className="font-bold text-xs uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Seçtiğiniz Ürünler ({items.length} Kalem)</span>
            </h3>
            <span className="text-xs font-black text-amber-700">{formatPrice(total)}</span>
          </div>

          <div className="divide-y divide-stone-100 max-h-52 overflow-y-auto pr-1">
            {items.map((i) => {
              const itemPrice = i.variant?.price_override ?? i.product.price;
              const cover = i.variant?.image_url || i.product.images?.[0]?.image_url || '/images/logo.webp';
              return (
                <div key={`${i.product.id}-${i.variant?.id}`} className="py-2.5 flex items-center justify-between text-xs gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative w-9 h-9 rounded-lg bg-stone-100 overflow-hidden shrink-0 border border-stone-200">
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
        </div>

        {/* Immediate Ordering Actions: WhatsApp & Store */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto text-left">
          
          {/* WhatsApp Direct Order Button */}
          <div className="p-6 bg-emerald-50/80 border border-emerald-200 rounded-3xl space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                <MessageCircle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">WhatsApp ile Hemen Sipariş Verin</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Sepetinizdeki ürünleri beklemeden doğrudan WhatsApp sipariş hattımız üzerinden teyit edip satın alabilirsiniz.
              </p>
            </div>

            <a
              href={`https://wa.me/905077737777?text=${whatsappCartMessage}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp'tan Siparişi Gönder</span>
            </a>
          </div>

          {/* Physical Store Pickup */}
          <div className="p-6 bg-amber-50/80 border border-amber-200 rounded-3xl space-y-3 shadow-xs flex flex-col justify-between">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-700 text-white flex items-center justify-center shadow-xs">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-stone-900 text-sm">Tahtakale Mağazamızdan Teslim Alın</h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Eminönü Süleymaniye Tamburacı ve Görenli Han&apos;daki mağazamızdan elden teslim alabilir ve ödemenizi yapabilirsiniz.
              </p>
            </div>

            <Link
              href="/iletisim"
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
            >
              <MapPin className="w-4 h-4 text-amber-400" />
              <span>Mağaza Adresi ve Yol Tarifi</span>
            </Link>
          </div>

        </div>

        {/* Notify when sales open */}
        <div className="p-6 sm:p-8 bg-white rounded-3xl border border-stone-200 shadow-2xs max-w-xl mx-auto space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-stone-900">Satışlar Başladığında İlk Size Haber Verelim</h3>
            <p className="text-xs text-stone-500">
              Online kartlı ödeme aktif olduğunda ve açılışa özel tekliflerde anında haberdar olun.
            </p>
          </div>

          {isNotified ? (
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>E-posta adresiniz kaydedildi. Açılış anında bilgilendirileceksiniz!</span>
            </div>
          ) : (
            <form onSubmit={handleNotifySubmit} className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                required
                value={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.value)}
                placeholder="E-posta adresinizi giriniz..."
                className="flex-1 text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:bg-white focus:outline-none focus:border-amber-600"
              />
              <button
                type="submit"
                className="px-5 py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-1.5 shrink-0"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>Haber Ver</span>
              </button>
            </form>
          )}
        </div>

        {/* Back to Products */}
        <div>
          <Link
            href="/kategori/tum-urunler"
            className="inline-flex items-center gap-2 text-xs font-bold text-amber-700 hover:text-amber-800 underline"
          >
            <span>Koleksiyonu İncelemeye Devam Et</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>
    );
  }

  // =========================================================================
  // LIVE CHECKOUT FORM (ACTIVE WHEN NEXT_PUBLIC_ONLINE_SALES_ACTIVE IS TRUE)
  // =========================================================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 pb-24 lg:pb-12">
      
      {/* Header & Back Link */}
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <Link href="/sepet" className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-amber-700 transition">
          <ArrowLeft className="w-4 h-4" />
          <span>Sepete Geri Dön</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-stone-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600" />
          <span>256-Bit SSL & iyzico Korumalı Ödeme</span>
        </div>
      </div>

      <form onSubmit={handleCompleteOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form Fields (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* 1. DELIVERY TYPE SELECTOR */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">1</span>
              <span>Teslimat Yöntemi</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                    <span>DHL Kargo ile Adrese Teslim</span>
                  </div>
                  <p className="text-[11px] text-stone-500 mt-1">
                    1-3 iş gününde güvenli, sigortalı kapıya teslimat (+₺200,00)
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
                    Eminönü şubemizden aynı gün kargo bedelsiz elden teslim alın.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* 2. CONTACT & SHIPPING ADDRESS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">2</span>
              <span>İletişim ve Teslimat Bilgileri</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Ad Soyad *</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Örn: Ahmet Yılmaz"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">Telefon Numarası *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0532 000 00 00"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-[11px] font-bold text-stone-700 mb-1">E-Posta Adresi * (Kargo ve Fatura Takibi İçin)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ahmet@ornek.com"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                />
              </div>

              {deliveryType === 'kargo' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">İl *</label>
                    <select
                      value={province}
                      onChange={(e) => handleProvinceChange(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                    >
                      {TURKISH_PROVINCES.map((p) => (
                        <option key={p.name} value={p.name}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">İlçe *</label>
                    <select
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                    >
                      {currentDistricts.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Açık Adres (Mahalle, Cadde, Sokak, No, Daire) *</label>
                    <textarea
                      required
                      rows={2}
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="Örn: Süleymaniye Mah. Uzunçarşı Cad. No: 187/2G Fatih / İSTANBUL"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg focus:bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Posta Kodu</label>
                    <input
                      type="text"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      placeholder="34000"
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-stone-700 mb-1">Kurye / Teslimat Notu</label>
                    <input
                      type="text"
                      value={courierNote}
                      onChange={(e) => setCourierNote(e.target.value)}
                      placeholder="Zile basmayınız, kapıya bırakınız vb."
                      className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                    />
                  </div>
                </>
              )}

              {deliveryType === 'magaza_teslim' && (
                <div className="sm:col-span-2 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                  <div className="font-bold flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-amber-800" />
                    <span>Tahtakale Mağazadan Teslim Alma Adresi:</span>
                  </div>
                  <p className="text-[11px] text-amber-800">
                    Süleymaniye Mah. Uzunçarşı Cad. Tamburacı ve Görenli Han No: 187 / 2G Fatih / İSTANBUL
                  </p>
                  <p className="text-[10px] text-amber-700">
                    Mesai Saatleri: Pazartesi - Cumartesi 10:00 - 17:00
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* 3. INVOICE DETAILS */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">3</span>
              <span>Fatura Türü ve Bilgileri</span>
            </h2>

            <div className="flex gap-4 border-b border-stone-100 pb-3">
              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="invoiceType"
                  value="individual"
                  checked={invoiceType === 'individual'}
                  onChange={() => setInvoiceType('individual')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Bireysel Fatura</span>
              </label>

              <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
                <input
                  type="radio"
                  name="invoiceType"
                  value="corporate"
                  checked={invoiceType === 'corporate'}
                  onChange={() => setInvoiceType('corporate')}
                  className="text-amber-600 focus:ring-amber-500"
                />
                <span>Kurumsal Fatura (Şirket)</span>
              </label>
            </div>

            {invoiceType === 'individual' ? (
              <div>
                <label className="block text-[11px] font-bold text-stone-700 mb-1">T.C. Kimlik Numarası (Opsiyonel)</label>
                <input
                  type="text"
                  maxLength={11}
                  value={identityNumber}
                  onChange={(e) => setIdentityNumber(e.target.value)}
                  placeholder="11111111111"
                  className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg max-w-sm"
                />
                <p className="text-[10px] text-stone-400 mt-1">E-faturanız T.C. kimlik numaranıza veya adınıza düzenlenecektir.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Şirket Resmi Unvanı *</label>
                  <input
                    type="text"
                    required
                    value={companyTitle}
                    onChange={(e) => setCompanyTitle(e.target.value)}
                    placeholder="Örn: ABC Ltd. Şti."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Vergi Dairesi *</label>
                  <input
                    type="text"
                    required
                    value={taxOffice}
                    onChange={(e) => setTaxOffice(e.target.value)}
                    placeholder="Hocapaşa V.D."
                    className="w-full text-xs p-2.5 bg-stone-50 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-stone-700 mb-1">Vergi Kimlik Numarası (VKN) *</label>
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

          {/* 4. PAYMENT METHOD SELECTOR (OFFICIAL IYZICO INTEGRATION) */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6 space-y-4 shadow-xs">
            <h2 className="text-xs font-bold uppercase tracking-wider text-stone-900 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-amber-600 text-white flex items-center justify-center text-[10px]">4</span>
                <span>Ödeme Seçenekleri</span>
              </div>
              <div className="flex items-center gap-1.5 text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>3D Secure & 256-Bit SSL</span>
              </div>
            </h2>

            <div className="space-y-3">
              {/* Option A: iyzico Gateway */}
              <label
                className={`p-4 rounded-xl border-2 cursor-pointer transition block ${
                  paymentMethod === 'iyzico'
                    ? 'border-amber-600 bg-amber-50/40'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="iyzico"
                      checked={paymentMethod === 'iyzico'}
                      onChange={() => setPaymentMethod('iyzico')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                        <span>Kredi / Banka Kartı ile Güvenli Öde</span>
                        <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-bold">Önerilen</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        BDDK Lisanslı iyzico Sanal POS altyapısı ile peşin fiyatına taksit ve 3D Secure SMS şifreli tam koruma.
                      </p>
                    </div>
                  </div>

                  {/* iyzico horizontal logo */}
                  <div className="relative h-6 w-28 shrink-0 hidden sm:block">
                    <Image
                      src="/images/iyzico/iyzico_ile_ode_colored_horizontal.svg"
                      alt="iyzico ile Öde"
                      fill
                      className="object-contain object-right"
                    />
                  </div>
                </div>

                {/* Sub-card: Verified Logos & Details */}
                {paymentMethod === 'iyzico' && (
                  <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-[11px] text-stone-600">
                    <div className="flex items-center gap-2">
                      <Lock className="w-3.5 h-3.5 text-amber-600" />
                      <span>Kart bilgileriniz asla saklanmaz, doğrudan bankanıza iletilir.</span>
                    </div>

                    {/* Official iyzico Cards Band */}
                    <div className="relative h-6 w-48 shrink-0">
                      <Image
                        src="/images/iyzico/logo_band_colored.svg"
                        alt="iyzico, Visa, MasterCard, Troy"
                        fill
                        className="object-contain object-left sm:object-right"
                      />
                    </div>
                  </div>
                )}
              </label>

              {/* Option B: Store Cash/POS (Click & Collect only) */}
              {deliveryType === 'magaza_teslim' && (
                <label
                  className={`p-4 rounded-xl border-2 cursor-pointer transition block ${
                    paymentMethod === 'magaza_nakit'
                      ? 'border-amber-600 bg-amber-50/40'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="paymentMethod"
                      value="magaza_nakit"
                      checked={paymentMethod === 'magaza_nakit'}
                      onChange={() => setPaymentMethod('magaza_nakit')}
                      className="mt-1 text-amber-600 focus:ring-amber-500"
                    />
                    <div>
                      <div className="font-bold text-xs text-stone-900 flex items-center gap-2">
                        <Store className="w-4 h-4 text-amber-700" />
                        <span>Tahtakale Mağazada Elden Ödeme (Nakit / POS)</span>
                      </div>
                      <p className="text-[11px] text-stone-500 mt-1">
                        Siparişinizi Eminönü şubemizden teslim alırken nakit veya kredi kartınız ile ödeyebilirsiniz.
                      </p>
                    </div>
                  </div>
                </label>
              )}
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
            className="w-full py-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-50 text-white font-bold text-sm rounded-xl shadow-xl transition flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <Lock className="w-4 h-4" />
            <span>
              {isSubmitting 
                ? 'Ödeme Başlatılıyor...' 
                : paymentMethod === 'iyzico' 
                  ? 'iyzico ile Güvenli Öde' 
                  : 'Siparişi Onayla'}
            </span>
          </button>

          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="text-[11px] text-stone-500 text-center flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Sipariş anında stok kilidi aktif edilir</span>
            </div>

            {/* Official iyzico, Visa, Mastercard, Troy Band */}
            <div className="pt-1 flex flex-col items-center gap-1.5">
              <div className="relative h-7 w-full opacity-90 hover:opacity-100 transition-opacity">
                <Image
                  src="/images/iyzico/logo_band_colored.svg"
                  alt="iyzico, Visa, MasterCard, Troy ile Güvenli Ödeme"
                  fill
                  className="object-contain"
                />
              </div>
              <div className="flex items-center gap-2 text-[10px] text-stone-400">
                <span>256-Bit SSL</span>
                <span>•</span>
                <span>3D Secure</span>
                <span>•</span>
                <span>DHL Kargo</span>
              </div>
            </div>
          </div>
        </div>

      </form>

      {/* iyzico Official Checkout Form Modal */}
      {isIyzicoModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-stone-200 animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 px-6 border-b border-stone-200 bg-stone-50">
              <div className="flex items-center gap-3">
                <div className="relative h-6 w-24">
                  <Image
                    src="/images/iyzico/iyzico_ile_ode_colored_horizontal.svg"
                    alt="iyzico"
                    fill
                    className="object-contain object-left"
                  />
                </div>
                <span className="text-xs font-bold text-stone-800 border-l border-stone-300 pl-3">
                  3D Secure Güvenli Ödeme
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsIyzicoModalOpen(false)}
                className="p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 rounded-xl transition"
                aria-label="Kapat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* iyzico Dynamic Script Mount Container */}
            <div className="p-4 sm:p-6 max-h-[85vh] overflow-y-auto">
              <div ref={iyzicoContainerRef} id="iyzipay-checkout-form" className="responsive" />
            </div>

            {/* Modal Footer */}
            <div className="p-3 bg-stone-50 border-t border-stone-200 text-center text-[10px] text-stone-500">
              256-Bit SSL şifreli BDDK lisanslı güvenli ödeme penceresi
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-stone-500">
        Ödeme ekranı yükleniyor...
      </div>
    }>
      <CheckoutContent />
    </Suspense>
  );
}
