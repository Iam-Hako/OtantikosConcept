'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle2, Sparkles, Share, PlusSquare, AlertCircle, Smartphone } from 'lucide-react';
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
  const [isSupported, setIsSupported] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Device & Browser Detection
    const ua = navigator.userAgent.toLowerCase();
    const iosDevice = /iphone|ipad|ipod/.test(ua);
    const standaloneMode =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true;

    setIsIOS(iosDevice);
    setIsStandalone(standaloneMode);

    // 2. Web Push Support Check
    const hasPush = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(hasPush);

    if (hasPush) {
      const currentPerm = Notification.permission;
      setPermission(currentPerm);

      if (currentPerm === 'granted') {
        setIsSubscribed(true);
        registerServiceWorkerAndSync();
        return;
      }
    }

    // 3. Check dismissal memory (24 hours cooldown)
    const dismissedAt = localStorage.getItem('otantikos_push_dismissed_at');
    if (dismissedAt) {
      const hoursSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60);
      if (hoursSince < 24) return;
    }

    // 4. Auto-trigger prompt after 1.5s on mobile/desktop
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const registerServiceWorkerAndSync = async () => {
    try {
      if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

      const reg = await navigator.serviceWorker.register('/sw.js');
      await navigator.serviceWorker.ready;

      // Check existing subscription
      let sub = await reg.pushManager.getSubscription();

      if (!sub) {
        // Fetch VAPID public key
        const res = await fetch('/api/notifications/vapid-public-key');
        const { publicKey } = await res.json();
        if (!publicKey) return;

        const applicationServerKey = urlBase64ToUint8Array(publicKey);
        sub = await reg.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey,
        });
      }

      // Send subscription to server
      const p256dh = sub.getKey('p256dh');
      const auth = sub.getKey('auth');

      if (p256dh && auth) {
        const rawP256dh = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(p256dh))));
        const rawAuth = btoa(String.fromCharCode.apply(null, Array.from(new Uint8Array(auth))));

        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            endpoint: sub.endpoint,
            keys: {
              p256dh: rawP256dh,
              auth: rawAuth,
            },
          }),
        });
        setIsSubscribed(true);
      }
    } catch (err) {
      console.warn('[Push Sync Notice]', err);
    }
  };

  const handleEnableNotifications = async () => {
    // Special handling for iOS Safari (when not added to home screen)
    if (isIOS && !isStandalone) {
      setShowIosGuide(true);
      return;
    }

    if (!isSupported) {
      toast.error('Tarayıcınız anlık bildirim özelliğini desteklemiyor.');
      return;
    }

    setIsSubscribing(true);

    try {
      // 1. Request Browser Permission (Must be direct user gesture)
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        setIsVisible(false);
        setShowIosGuide(false);
        await registerServiceWorkerAndSync();
        toast.success('Bildirimler Başarıyla Açıldı! 🎉', {
          description: 'Özel indirimler, yeni squishy ürünleri ve sipariş durumunuzdan ilk siz haberdar olacaksınız.',
        });
      } else if (perm === 'denied') {
        setIsVisible(false);
        toast.info('Bildirim izni tarayıcınızda engellendi.', {
          description: 'Adres çubuğundaki kilit / ayar simgesine dokunarak bildirimlere izin verebilirsiniz.',
        });
      }
    } catch (err: any) {
      console.error('[Notification Subscribe Error]', err);
      toast.error('Bildirim izni alınırken bir sorun oluştu.');
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
        description: 'En güncel fırsatlar ve siparişleriniz doğrudan cihazınıza iletiliyor.',
      });
      return;
    }
    if (isIOS && !isStandalone) {
      setShowIosGuide(true);
      return;
    }
    if (permission === 'denied') {
      toast.info('Bildirimler tarayıcınızda engelli.', {
        description: 'Adres çubuğundaki kilit simgesine tıklayıp Bildirimler seçeneğini "İzin Ver" olarak değiştirin.',
      });
      return;
    }
    setIsVisible(true);
  };

  return (
    <>
      {/* 1. FLOATING PERMANENT NOTIFICATION BELL (Always accessible on mobile & desktop) */}
      <button
        type="button"
        onClick={handleBellClick}
        title={isSubscribed ? 'Bildirimleriniz Açık' : 'Fırsat Bildirimlerini Aç'}
        className="fixed bottom-5 left-4 z-40 p-3 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 rounded-full shadow-lg border border-stone-200 transition-all flex items-center justify-center group cursor-pointer"
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
              Apple kuralları gereği iPhone&apos;da anlık bildirim alabilmek için siteyi ana ekranınıza eklemeniz gerekmektedir:
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
                <span>Ana ekrandan Otantikos uygulamasını açarak bildirimleri tek tıkla aktif edin!</span>
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
                    <span>{isSubscribing ? 'Açılıyor...' : 'Bildirimleri Aç'}</span>
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
