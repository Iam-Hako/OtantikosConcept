'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { 
  Star, 
  Heart, 
  ShoppingBag, 
  Truck, 
  RotateCcw, 
  ShieldCheck, 
  Sparkles, 
  Plus, 
  Minus, 
  HelpCircle, 
  MessageSquare, 
  Share2, 
  Play, 
  Eye, 
  Check, 
  Bell,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Product, ProductVariant, Question, Review } from '@/lib/types/ecommerce';
import { DataService } from '@/lib/data/store-data';
import { useCart } from '@/lib/store/cart-store';
import { useWishlist } from '@/lib/store/wishlist-store';
import { formatPrice } from '@/lib/utils/format';
import { toast } from 'sonner';

export default function ProductDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { addItem } = useCart();
  const { toggleFavorite, isFavorite } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [quantity, setQuantity] = useState<number>(1);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Optical Lens Zoom State
  const [isZooming, setIsZooming] = useState<boolean>(false);
  const [zoomPos, setZoomPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const imageContainerRef = useRef<HTMLDivElement>(null);

  // In-Stock Alert Modal & Form State
  const [isStockAlertOpen, setIsStockAlertOpen] = useState<boolean>(false);
  const [stockAlertEmail, setStockAlertEmail] = useState<string>('');

  // Q&A and Review Form States
  const [newQuestionName, setNewQuestionName] = useState<string>('');
  const [newQuestionEmail, setNewQuestionEmail] = useState<string>('');
  const [newQuestionText, setNewQuestionText] = useState<string>('');
  const [activeAccordion, setActiveAccordion] = useState<string | null>(null);

  const [newReviewName, setNewReviewName] = useState<string>('');
  const [newReviewRating, setNewReviewRating] = useState<number>(5);
  const [newReviewComment, setNewReviewComment] = useState<string>('');

  useEffect(() => {
    async function loadProductData() {
      setIsLoading(true);
      try {
        const prod = await DataService.getProductBySlug(slug);
        const all = await DataService.getProducts();
        setAllProducts(all);

        if (prod) {
          setProduct(prod);
          if (prod.variants && prod.variants.length > 0) {
            setSelectedVariant(prod.variants[0]);
          }

          // Fetch questions and reviews
          const [qList, rList] = await Promise.all([
            DataService.getQuestions(prod.id),
            DataService.getReviews(prod.id),
          ]);
          setQuestions(qList);
          setReviews(rList);

          // Save to Recently Viewed in LocalStorage
          try {
            const recentKey = 'otantikos_recent_views_v1';
            const recent = JSON.parse(localStorage.getItem(recentKey) || '[]');
            const filtered = recent.filter((p: any) => p.id !== prod.id);
            filtered.unshift(prod);
            localStorage.setItem(recentKey, JSON.stringify(filtered.slice(0, 5)));
          } catch {
            // Ignore
          }
        }
      } finally {
        setIsLoading(false);
      }
    }

    if (slug) {
      loadProductData();
    }
  }, [slug]);

  // Handle Optical Lens Mouse Movement
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageContainerRef.current) return;
    const rect = imageContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomPos({ x, y });
  };

  const handleSelectVariant = (variant: ProductVariant) => {
    setSelectedVariant(variant);
    // If variant has specific image, switch gallery index or display
    if (variant.image_url && product?.images) {
      const imgIdx = product.images.findIndex((img) => img.image_url === variant.image_url);
      if (imgIdx > -1) {
        setActiveImageIndex(imgIdx);
      }
    }
  };

  const handleStockAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stockAlertEmail || !product) return;
    toast.success('Haber verme talebiniz kaydedildi!', {
      description: `${product.name} stoğa girdiği an ${stockAlertEmail} adresine e-posta gönderilecektir.`,
    });
    setIsStockAlertOpen(false);
    setStockAlertEmail('');
  };

  const handleQuestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText || !product) return;
    await DataService.addQuestion(
      product.id,
      newQuestionName || 'İsimsiz Müşteri',
      newQuestionEmail,
      newQuestionText
    );
    toast.success('Sorunuz yöneticiye iletildi!', {
      description: 'Yönetici onayından sonra ürün sayfasında yanıtıyla birlikte yayınlanacaktır.',
    });
    setNewQuestionText('');
    setNewQuestionName('');
    setNewQuestionEmail('');
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewComment || !product) return;
    const newRev = await DataService.addReview(
      product.id,
      newReviewName || 'Müşteri',
      newReviewRating,
      newReviewComment
    );
    setReviews((prev) => [newRev, ...prev]);
    toast.success('Değerlendirmeniz için teşekkür ederiz!');
    setNewReviewComment('');
    setNewReviewName('');
  };

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <div className="w-12 h-12 border-4 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
        <p className="text-sm font-semibold text-stone-600">Tahtakale ürün detayları yükleniyor...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Ürün Bulunamadı</h2>
        <p className="text-xs text-stone-500 mb-6">Aradığınız ürün kaldırılmış veya bağlantı değişmiş olabilir.</p>
        <Link href="/kategori/tum-urunler" className="px-5 py-2.5 bg-amber-600 text-white text-xs font-bold rounded-lg">
          Koleksiyona Dön
        </Link>
      </div>
    );
  }

  const currentPrice = selectedVariant?.price_override ?? product.price;
  const currentStock = selectedVariant ? selectedVariant.stock : product.stock;
  const currentSKU = selectedVariant?.sku || product.sku;
  const isOutOfStock = currentStock <= 0;
  const images = product.images && product.images.length > 0 ? product.images : [{ image_url: '/images/logo.webp', is_cover: true, display_order: 1 }];
  const currentActiveImage = images[activeImageIndex]?.image_url || images[0]?.image_url;

  const similarProducts = allProducts
    .filter((p) => p.id !== product.id && (p.category_id === product.category_id || p.is_featured))
    .slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      
      {/* 1. BREADCRUMBS */}
      <nav className="text-xs text-stone-500 flex items-center gap-1.5">
        <Link href="/" className="hover:text-amber-700">Ana Sayfa</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/kategori/${product.category.slug}`} className="hover:text-amber-700">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-stone-900 font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* 2. PRODUCT MAIN GALLERY & BUYING PANEL */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Gallery & Optical Loupe Zoom (7 Cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            
            {/* Thumbnails list */}
            {images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0 pb-2 sm:pb-0">
                {images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition shrink-0 ${
                      activeImageIndex === idx ? 'border-amber-600 ring-2 ring-amber-600/20' : 'border-stone-200 hover:border-stone-400'
                    }`}
                  >
                    <Image
                      src={img.image_url}
                      alt={img.alt_text || product.name}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Main Image with Optical Loupe Zoom */}
            <div 
              ref={imageContainerRef}
              onMouseEnter={() => setIsZooming(true)}
              onMouseLeave={() => setIsZooming(false)}
              onMouseMove={handleMouseMove}
              className="relative flex-1 aspect-square bg-stone-100 rounded-3xl overflow-hidden border border-stone-200 shadow-xs cursor-crosshair group"
            >
              <Image
                src={currentActiveImage}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />

              {/* Optical Loupe Lens Overlay */}
              {isZooming && (
                <div
                  className="absolute inset-0 pointer-events-none hidden md:block bg-no-repeat rounded-3xl transition-transform duration-75"
                  style={{
                    backgroundImage: `url(${currentActiveImage})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                    backgroundSize: '250%',
                  }}
                />
              )}

              {/* Hover Badge */}
              <div className="absolute bottom-3 right-3 bg-stone-900/70 backdrop-blur-xs text-white text-[10px] font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                <Eye className="w-3 h-3 text-amber-400" />
                <span>Büyütmek için üzerine gelin</span>
              </div>
            </div>
          </div>

          {/* Promotional Video Embed (if provided) */}
          {product.video_url && (
            <div className="mt-6 p-4 rounded-2xl bg-stone-900 text-white">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-amber-400">
                <Play className="w-4 h-4 fill-amber-400" />
                <span>Ürün Tanıtım & İnceleme Videosu</span>
              </div>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-black">
                <iframe
                  src={product.video_url}
                  title={`${product.name} Video`}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Buying Box & Specifications (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Header & Badges */}
          <div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700">
                {product.category?.name || 'Tahtakale Koleksiyonu'}
              </span>
              <span className="text-[11px] text-stone-400 font-mono">
                SKU: {currentSKU}
              </span>
            </div>

            <h1 className="text-xl sm:text-2xl font-serif font-black text-stone-900 mt-1 leading-snug">
              {product.name}
            </h1>

            {/* Ratings & Question count */}
            <div className="flex items-center gap-3 mt-2 text-xs">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="font-bold ml-1 text-stone-800">{product.rating}</span>
              </div>
              <span className="text-stone-300">|</span>
              <a href="#yorumlar" className="text-stone-500 hover:text-amber-700 underline">
                {reviews.length} Değerlendirme
              </a>
              <span className="text-stone-300">|</span>
              <a href="#sorular" className="text-stone-500 hover:text-amber-700 underline">
                {questions.length} Soru & Cevap
              </a>
            </div>
          </div>

          {/* Net Price & Stock Box */}
          <div className="p-5 bg-amber-50/60 rounded-2xl border border-amber-200/80">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs text-stone-500 block">Doğrudan Net Fiyat (KDV Dahil):</span>
                <span className="text-3xl font-serif font-black text-amber-900">
                  {formatPrice(currentPrice)}
                </span>
              </div>
              <div className="text-right">
                {isOutOfStock ? (
                  <span className="inline-block px-3 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-full">
                    Tükendi
                  </span>
                ) : (
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    Stokta ({currentStock} Adet)
                  </span>
                )}
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-amber-200/60 text-[11px] text-stone-600 flex items-center justify-between">
              <span>💳 Peşin fiyatına taksit seçenekleri mevcuttur</span>
              <span className="font-bold text-amber-800">Net Fiyat Garantisi</span>
            </div>
          </div>

          {/* Dynamic Variant Selector */}
          {product.variants && product.variants.length > 0 && (
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-900">
                Seçenek / {product.variants[0].name}:{' '}
                <strong className="text-amber-700">{selectedVariant?.value}</strong>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {product.variants.map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isVarOut = variant.stock <= 0;

                  return (
                    <button
                      key={variant.id || variant.value}
                      onClick={() => handleSelectVariant(variant)}
                      className={`px-4 py-2.5 rounded-xl text-xs font-semibold border transition flex items-center gap-2 ${
                        isSelected
                          ? 'border-amber-600 bg-amber-600 text-white shadow-xs font-bold'
                          : 'border-stone-200 bg-white text-stone-800 hover:border-stone-400'
                      } ${isVarOut ? 'opacity-40 line-through' : ''}`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5" />}
                      <span>{variant.value}</span>
                      {variant.price_override && variant.price_override !== product.price && (
                        <span className={`text-[10px] ${isSelected ? 'text-amber-200' : 'text-stone-400'}`}>
                          ({formatPrice(variant.price_override)})
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Short Description */}
          {product.short_description && (
            <p className="text-xs text-stone-600 leading-relaxed bg-white p-3.5 rounded-xl border border-stone-200">
              {product.short_description}
            </p>
          )}

          {/* Add to Cart / Out of Stock Actions */}
          <div className="space-y-3 pt-2">
            {!isOutOfStock ? (
              <div className="flex gap-3">
                {/* Stepper */}
                <div className="flex items-center border border-stone-300 rounded-xl bg-white px-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 text-stone-600 hover:text-amber-700"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center text-xs font-bold text-stone-900">
                    {quantity}
                  </span>
                  <button
                    onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                    className="p-2 text-stone-600 hover:text-amber-700"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Submit Button */}
                <button
                  onClick={() => addItem(product, selectedVariant, quantity)}
                  className="flex-1 py-3.5 px-6 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg hover:shadow-amber-600/30 transition flex items-center justify-center gap-2 group"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Sepete Ekle</span>
                </button>

                {/* Wishlist Icon */}
                <button
                  onClick={() => toggleFavorite(product)}
                  className="p-3.5 rounded-xl border border-stone-300 hover:border-rose-400 text-stone-700 hover:text-rose-600 bg-white transition"
                  aria-label="Favoriye Ekle"
                >
                  <Heart className={`w-5 h-5 ${isFavorite(product.id) ? 'fill-rose-500 text-rose-500' : ''}`} />
                </button>
              </div>
            ) : (
              /* Out of Stock "Gelince Haber Ver" Flow */
              <div className="space-y-2">
                <button
                  onClick={() => setIsStockAlertOpen(true)}
                  className="w-full py-3.5 px-6 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2"
                >
                  <Bell className="w-4 h-4 text-amber-400" />
                  <span>Gelince Haber Ver</span>
                </button>
                <p className="text-[11px] text-center text-stone-500">
                  Bu ürün şu anda tükenmiştir. Stoğa girdiğinde e-posta bildirimi alabilirsiniz.
                </p>
              </div>
            )}
          </div>

          {/* Trust Value Badges */}
          <div className="grid grid-cols-2 gap-3 pt-4 border-t border-stone-200 text-xs">
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200">
              <Truck className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block text-[11px]">Hızlı Sevkiyat</span>
                <span className="text-[10px] text-stone-500">Eminönü Doğrudan Kargo</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white border border-stone-200">
              <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
              <div>
                <span className="font-bold text-stone-900 block text-[11px]">14 Gün İade</span>
                <span className="text-[10px] text-stone-500">Kolay RMA Masası</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* 3. DYNAMIC TECHNICAL SPECIFICATIONS TABLE (Dynamic Spec Builder Output) */}
      <section className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <Sparkles className="w-4 h-4" />
            <span>Detaylı Ürün Analizi</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 mt-1">
            Teknik Özellikler ve Ürün Açıklaması
          </h2>
        </div>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
          {product.description}
        </p>

        {product.specifications && product.specifications.length > 0 && (
          <div className="mt-6 border border-stone-200 rounded-2xl overflow-hidden">
            <div className="bg-stone-100/70 px-4 py-3 border-b border-stone-200 text-xs font-bold text-stone-900 uppercase tracking-wider">
              Ürün Teknik Özellikler Tablosu
            </div>
            <div className="divide-y divide-stone-100 text-xs">
              {product.specifications.map((spec, idx) => (
                <div
                  key={idx}
                  className={`grid grid-cols-1 sm:grid-cols-3 p-3.5 ${
                    idx % 2 === 0 ? 'bg-white' : 'bg-stone-50/50'
                  }`}
                >
                  <span className="font-bold text-stone-800 sm:col-span-1">{spec.spec_key}</span>
                  <span className="text-stone-600 sm:col-span-2 mt-0.5 sm:mt-0">{spec.spec_value}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 4. PRODUCT Q&A ACCORDION */}
      <section id="sorular" className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Müşteri Soruları</span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 mt-1">
              Soru & Cevap ({questions.length})
            </h2>
          </div>
        </div>

        {/* Existing Q&A List */}
        <div className="space-y-3">
          {questions.length === 0 ? (
            <p className="text-xs text-stone-500 py-2">
              Bu ürün hakkında henüz soru sorulmamış. İlk soruyu aşağıdaki formdan iletebilirsiniz.
            </p>
          ) : (
            questions.map((q) => {
              const isOpen = activeAccordion === q.id;
              return (
                <div key={q.id} className="border border-stone-200 rounded-2xl overflow-hidden">
                  <button
                    onClick={() => setActiveAccordion(isOpen ? null : q.id)}
                    className="w-full p-4 text-left bg-stone-50/60 hover:bg-stone-100 flex items-center justify-between gap-4 transition"
                  >
                    <div className="flex items-start gap-2.5">
                      <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-stone-900">{q.question_text}</h4>
                        <span className="text-[10px] text-stone-400">{q.user_name} • {new Date(q.created_at).toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-stone-500" /> : <ChevronDown className="w-4 h-4 text-stone-500" />}
                  </button>

                  {isOpen && (
                    <div className="p-4 bg-white border-t border-stone-200 text-xs text-stone-700 space-y-1 animate-slide-down">
                      <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-[11px]">
                        <Check className="w-3.5 h-3.5" />
                        <span>Otantikos Yetkili Yanıtı:</span>
                      </div>
                      <p className="pl-5 leading-relaxed text-stone-600">
                        {q.answer_text || 'Bu soru inceleniyor, yanıt yakında eklenecektir.'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Ask Question Form */}
        <form onSubmit={handleQuestionSubmit} className="pt-6 border-t border-stone-200 space-y-3 bg-stone-50 p-5 rounded-2xl">
          <h4 className="text-xs font-bold text-stone-900">Ürün Hakkında Soru Sorun</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Adınız Soyadınız"
              value={newQuestionName}
              onChange={(e) => setNewQuestionName(e.target.value)}
              className="text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
            <input
              type="email"
              placeholder="E-Posta Adresiniz (Cevap iletilsin)"
              value={newQuestionEmail}
              onChange={(e) => setNewQuestionEmail(e.target.value)}
              className="text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
          </div>
          <textarea
            required
            rows={2}
            placeholder="Sorunuzu buraya yazın..."
            value={newQuestionText}
            onChange={(e) => setNewQuestionText(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-stone-900 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
          >
            Soruyu Gönder
          </button>
        </form>
      </section>

      {/* 5. CUSTOMER REVIEWS & RATINGS */}
      <section id="yorumlar" className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Deneyimler</span>
            <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900 mt-1">
              Müşteri Değerlendirmeleri ({reviews.length})
            </h2>
          </div>
          <div className="flex items-center gap-2 bg-amber-50 px-4 py-2 rounded-xl border border-amber-200">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-stone-900">{product.rating}</span>
            <span className="text-xs text-stone-500">/ 5.0 Genel Memnuniyet</span>
          </div>
        </div>

        {/* Reviews List */}
        <div className="divide-y divide-stone-100">
          {reviews.length === 0 ? (
            <p className="text-xs text-stone-500 py-4">
              Bu ürün için henüz yorum yapılmamış. İlk yorumu siz yazın!
            </p>
          ) : (
            reviews.map((rev) => (
              <div key={rev.id} className="py-4 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-900">{rev.user_name}</span>
                  <span className="text-[10px] text-stone-400">
                    {new Date(rev.created_at).toLocaleDateString('tr-TR')}
                  </span>
                </div>
                <div className="flex items-center text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < rev.rating ? 'fill-amber-400' : 'text-stone-300'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>

        {/* Submit Review Form */}
        <form onSubmit={handleReviewSubmit} className="pt-6 border-t border-stone-200 space-y-3 bg-stone-50 p-5 rounded-2xl">
          <h4 className="text-xs font-bold text-stone-900">Ürünü Değerlendirin</h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <input
              type="text"
              required
              placeholder="Adınız Soyadınız"
              value={newReviewName}
              onChange={(e) => setNewReviewName(e.target.value)}
              className="text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
            />
            <div className="flex items-center gap-2 bg-white px-3 py-2 border border-stone-300 rounded-lg">
              <span className="text-xs text-stone-600">Puanınız:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setNewReviewRating(star)}
                    className="p-0.5"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= newReviewRating ? 'fill-amber-400 text-amber-400' : 'text-stone-300'
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
          <textarea
            required
            rows={2}
            placeholder="Ürün hakkındaki yorum ve deneyiminiz..."
            value={newReviewComment}
            onChange={(e) => setNewReviewComment(e.target.value)}
            className="w-full text-xs p-2.5 bg-white border border-stone-300 rounded-lg focus:outline-none focus:border-amber-500"
          />
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-lg transition"
          >
            Yorumu Gönder
          </button>
        </form>
      </section>

      {/* 6. SIMILAR PRODUCTS RECOMMENDATION */}
      {similarProducts.length > 0 && (
        <section className="space-y-6 pt-6">
          <h2 className="text-xl sm:text-2xl font-serif font-black text-stone-900">
            Benzer Tahtakale Ürünleri
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {similarProducts.map((p) => {
              const cover = p.images?.[0]?.image_url || '/images/logo.webp';
              return (
                <div key={p.id} className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs hover:shadow-lg transition">
                  <div className="relative aspect-square bg-stone-100">
                    <Link href={`/urun/${p.slug}`}>
                      <Image src={cover} alt={p.name} fill className="object-cover" />
                    </Link>
                  </div>
                  <div className="p-4">
                    <h3 className="font-bold text-xs text-stone-900 line-clamp-2 hover:text-amber-700">
                      <Link href={`/urun/${p.slug}`}>{p.name}</Link>
                    </h3>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="font-black text-sm text-amber-700">{formatPrice(p.price)}</span>
                      <button
                        onClick={() => addItem(p, p.variants?.[0] || null)}
                        className="p-2 bg-stone-900 hover:bg-amber-600 text-white rounded-lg text-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 7. IN-STOCK ALERT MODAL */}
      {isStockAlertOpen && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-slide-up">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Bell className="w-5 h-5" />
                <span>Gelince Haber Ver</span>
              </div>
              <button onClick={() => setIsStockAlertOpen(false)} className="text-stone-400 hover:text-stone-700">
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-600">
              <strong>{product.name}</strong> stoğa girdiğinde anında haberdar olmak için e-posta adresinizi bırakın.
            </p>

            <form onSubmit={handleStockAlertSubmit} className="space-y-3">
              <input
                type="email"
                required
                placeholder="E-Posta Adresiniz"
                value={stockAlertEmail}
                onChange={(e) => setStockAlertEmail(e.target.value)}
                className="w-full text-xs p-3 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-amber-500"
              />
              <button
                type="submit"
                className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition"
              >
                Bildirim Talebi Oluştur
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
