'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellRing, X, CheckCircle2, Sparkles, Share, PlusSquare, Smartphone } from 'lucide-react';
import { toast } from 'sonner';

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function NotificationPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [showIosGuide, setShowIosGuide] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [hasNotificationAPI, setHasNotificationAPI] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission | 'unsupported'>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const registerServiceWorkerAndSync = useCallback(async () => {
    if (typeof window === 'undefined') return;

    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker bu tarayıcıda desteklenmiyor.');
    }

    // 1. Register service worker with root scope
    const reg = await navigator.serviceWorker.register('/sw.js', { scope: '/' });
    await navigator.serviceWorker.ready;

    // 2. Check pushManager
    if (!reg.pushManager) {
      throw new Error('Push Manager bu tarayıcıda aktif değil.');
    }

    // 3. Check existing subscription or create new
    let sub = await reg.pushManager.getSubscription();

    if (!sub) {
      // Fetch VAPID public key
      const res = await fetch('/api/notifications/vapid-public-key');
      if (!res.ok) throw new Error('VAPID anahtarı sunucudan alınamadı.');
      const { publicKey } = await res.json();
      if (!publicKey) throw new Error('VAPID anahtarı boş döndü.');

      const applicationServerKey = urlBase64ToUint8Array(publicKey);
      sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey,
      });
    }

    // 4. Send subscription keys to server
    const p256dh = sub.getKey('p256dh');
    const auth = sub.getKey('auth');

    if (!p256dh || !auth) {
      throw new Error('Abonelik güvenlik anahtarları üretilemedi.');
    }

    const rawP256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh))));
    const rawAuth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))));

    // Determine platform
    const ua = navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const isAndroidDevice = /android/.test(ua);
    const platform = isIosDevice ? 'ios' : isAndroidDevice ? 'android' : 'desktop';

    // Retrieve user phone if stored locally
    const savedPhone = localStorage.getItem('otantikos_customer_phone') || null;

    const subResponse = await fetch('/api/notifications/subscribe', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: sub.endpoint,
        keys: {
          p256dh: rawP256dh,
          auth: rawAuth,
        },
        platform,
        phone: savedPhone,
      }),
    });

    if (!subResponse.ok) {
      const errData = await subResponse.json().catch(() => ({}));
      throw new Error(errData.error || 'Abonelik sunucuya kaydedilemedi.');
    }

    setIsSubscribed(true);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Device & Browser Detection
    const ua = navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(iosDevice);
    setIsStandalone(standaloneMode);

    // 2. Notification API Capability Check
    const hasNotification = 'Notification' in window && typeof Notification.requestPermission === 'function';
    setHasNotificationAPI(hasNotification);

    // 3. Register Service Worker silently in the background
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js', { scope: '/' }).catch(() => {
        // Background registration silent fail is acceptable
      });
    }

    // 4. If already granted, sync subscription immediately
    if (hasNotification) {
      const currentPerm = Notification.permission;
      setPermission(currentPerm);

      if (currentPerm === 'granted') {
        setIsSubscribed(true);
        registerServiceWorkerAndSync().catch(() => {});
        return;
      }
    } else {
      setPermission('unsupported');
    }

    // 5. Standalone PWA vs Browser Tab Logic:
    // When opened from Home Screen (standalone), we ALWAYS show prompt if permission is 'default'
    if (standaloneMode) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 800);
      return () => clearTimeout(timer);
    }

    // In regular browser tab, check 24-hour dismissal cooldown
    const dismissedAt = localStorage.getItem('otantikos_push_dismissed_at');
    if (dismissedAt) {
      const hoursSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    // Auto-trigger banner after 2s
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [registerServiceWorkerAndSync]);

  const handleEnableNotifications = async () => {
    // Case 1: In iOS Safari (outside Home Screen PWA), Notification API is undefined
    if (isIOS && !hasNotificationAPI) {
      setShowIosGuide(true);
      return;
    }

    // Case 2: Browser does not support notifications at all
    if (!hasNotificationAPI) {
      toast.error('Tarayıcınız anlık bildirim özelliğini desteklemiyor.');
      return;
    }

    // Case 3: Already denied by user in device/browser settings
    if (Notification.permission === 'denied') {
      if (isIOS) {
        toast.error('Bildirimler iPhone ayarlarınızda kapalı görünüyor.', {
          description: 'Lütfen iPhone Ayarlar > Bildirimler > Otantikos bölümünden bildirimlere izin verin.',
          duration: 7000,
        });
      } else {
        toast.error('Bildirim izni tarayıcınızda engellenmiş.', {
          description: 'Adres çubuğundaki kilit simgesine dokunarak Bildirimler seçeneğini "İzin Ver" olarak değiştirin.',
          duration: 6000,
        });
      }
      return;
    }

    // Case 4: Request permission via direct user gesture
    setIsSubscribing(true);
    const toastId = toast.loading('Bildirim izni isteniyor...');

    try {
      // Must be called directly synchronously within the click event
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        toast.loading('Bildirim sunucusuna bağlanılıyor...', { id: toastId });
        await registerServiceWorkerAndSync();

        setIsVisible(false);
        setShowIosGuide(false);
        setIsSubscribed(true);

        toast.success('Bildirimler Başarıyla Açıldı! 🎉', {
          id: toastId,
          description: 'Özel indirimler, yeni squishy ürünleri ve sipariş durumunuz anında ekranınıza gelecek.',
          duration: 5000,
        });
      } else if (perm === 'denied') {
        setIsVisible(false);
        toast.info('Bildirim izni verilmedi.', {
          id: toastId,
          description: isIOS
            ? 'Dilediğiniz zaman iPhone Ayarlar > Bildirimler üzerinden aktif edebilirsiniz.'
            : 'Dilediğiniz zaman tarayıcı kilit simgesinden bildirimleri aktif edebilirsiniz.',
          duration: 6000,
        });
      } else {
        toast.dismiss(toastId);
      }
    } catch (err: any) {
      console.error('[Notification Subscribe Error]', err);
      toast.error('Bildirim izni alınırken bir sorun oluştu: ' + (err.message || ''), {
        id: toastId,
        duration: 6000,
      });
    } finally {
      setIsSubscribing(false);
    }
  };

  const handleDismiss = () => {
    setIsVisible(false);
    setShowIosGuide(false);
    localStorage.setItem('otantikos_push_dismissed_at', String(Date.now()));
  };

  const handleBellClick = () => {
    if (isSubscribed) {
      toast.success('Bildirimleriniz Açık! ✓', {
        description: 'En güncel fırsatlar ve siparişleriniz anında bu cihaza iletiliyor.',
      });
      return;
    }

    // If iOS Safari without PWA, show guide
    if (isIOS && !hasNotificationAPI) {
      setShowIosGuide(true);
      return;
    }

    // Otherwise, directly trigger enable flow
    handleEnableNotifications();
  };

  return (
    <>
      {/* 1. FLOATING PERMANENT NOTIFICATION BELL */}
      {/* On mobile: positioned above MobileBottomNav (bottom-20 left-4) */}
      {/* On desktop: positioned bottom-6 left-6 */}
      <button
        type="button"
        onClick={handleBellClick}
        title={isSubscribed ? 'Bildirimleriniz Açık' : 'Fırsat Bildirimlerini Aç'}
        className="fixed bottom-20 left-4 lg:bottom-6 lg:left-6 z-40 p-3.5 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 rounded-full shadow-2xl border border-stone-200 transition-all flex items-center justify-center group cursor-pointer"
        aria-label="Bildirim Ayarları"
      >
        {isSubscribed ? (
          <div className="relative">
            <Bell className="w-5 h-5 text-emerald-600" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white" />
          </div>
        ) : (
          <div className="relative">
            <BellRing className="w-5 h-5 text-[#e60012] group-hover:animate-bounce" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e60012] rounded-full animate-ping" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#e60012] rounded-full" />
          </div>
        )}
      </button>

      {/* 2. iOS PWA INSTALL & NOTIFICATION GUIDE MODAL */}
      {showIosGuide && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-stone-200 space-y-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between border-b border-stone-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-red-50 text-[#e60012] flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-stone-900">iPhone&apos;da Bildirimleri Aç</h3>
              </div>
              <button onClick={() => setShowIosGuide(false)} className="text-stone-400 hover:text-stone-700 p-1">
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              Apple güvenlik kuralları gereği iPhone&apos;da anlık bildirim alabilmek için siteyi ana ekranınıza eklemeniz gerekmektedir:
            </p>

            <div className="space-y-2.5 text-xs bg-stone-50 p-3.5 rounded-2xl border border-stone-100">
              <div className="flex items-center gap-2.5 text-stone-800">
                <div className="w-6 h-6 rounded-lg bg-stone-200/80 flex items-center justify-center font-bold shrink-0">1</div>
                <span>Safari&apos;nin altındaki <b>Paylaş</b> simgesine (<Share className="w-3.5 h-3.5 inline text-blue-600" />) dokunun.</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800">
                <div className="w-6 h-6 rounded-lg bg-stone-200/80 flex items-center justify-center font-bold shrink-0">2</div>
                <span>Menüyü kaydırıp <b>&quot;Ana Ekrana Ekle&quot;</b> (<PlusSquare className="w-3.5 h-3.5 inline text-stone-700" />) seçeneğini seçin.</span>
              </div>
              <div className="flex items-center gap-2.5 text-stone-800">
                <div className="w-6 h-6 rounded-lg bg-stone-200/80 flex items-center justify-center font-bold shrink-0">3</div>
                <span>Ana ekrandaki <b>Otantikos</b> uygulamasına dokunarak bildirimleri tek tıkla aktif edin!</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIosGuide(false)}
              className="w-full py-2.5 bg-stone-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Anladım
            </button>
          </div>
        </div>
      )}

      {/* 3. STANDARD AUTO PROMPT BANNER (Mobile & Desktop) */}
      {isVisible && !showIosGuide && !isSubscribed && (
        <aside
          aria-label="Bildirim İzni"
          className="fixed bottom-20 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-50 animate-in fade-in slide-in-from-bottom-4 duration-300 pointer-events-auto"
        >
          <div className="bg-white rounded-3xl p-5 shadow-2xl border-2 border-stone-200/90 backdrop-blur-xl relative overflow-hidden">
            {/* Glow Accent */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#e60012] via-amber-400 to-[#e60012]" />

            {/* Close Button */}
            <button
              onClick={handleDismiss}
              className="absolute top-3.5 right-3.5 p-1.5 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-full transition cursor-pointer"
              title="Daha Sonra"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-start gap-4">
              {/* Animated Icon */}
              <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center shrink-0 shadow-xs">
                <BellRing className="w-6 h-6 text-[#e60012] animate-bounce" />
              </div>

              <div className="space-y-1.5 pr-4 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-black uppercase tracking-wider text-[#e60012]">Fırsat Bildirimleri</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <h4 className="font-bold text-sm text-stone-900 leading-snug">
                  İndirimleri ve Yenilikleri Kaçırmayın!
                </h4>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sürpriz kuponlar, sınırlı stok viral squishy modelleri ve kargo bildirimleri doğrudan ekranınıza gelsin.
                </p>

                <div className="pt-3 flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleEnableNotifications}
                    disabled={isSubscribing}
                    className="flex-1 py-2.5 px-4 bg-[#e60012] hover:bg-[#c90010] active:scale-95 text-white text-xs font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>{isSubscribing ? 'İzin İsteniyor...' : 'Bildirimleri Aç'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDismiss}
                    className="py-2.5 px-3.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold rounded-xl transition cursor-pointer"
                  >
                    Daha Sonra
                  </button>
                </div>
              </div>
            </div>
          </div>
        </aside>
      )}
    </>
  );
}
