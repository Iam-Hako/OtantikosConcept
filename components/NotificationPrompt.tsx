'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellRing, X, CheckCircle, Sparkles } from 'lucide-react';
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
  const [isSupported, setIsSupported] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribing, setIsSubscribing] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Check Service Worker and Notification support
    const supported = 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    setIsSupported(supported);

    if (!supported) return;

    const currentPermission = Notification.permission;
    setPermission(currentPermission);

    // If already granted, ensure service worker is active and subscription is registered
    if (currentPermission === 'granted') {
      registerServiceWorkerAndSync();
      return;
    }

    // If denied or already dismissed in last 3 days, don't show prompt
    if (currentPermission === 'denied') return;

    const dismissedAt = localStorage.getItem('otantikos_push_dismissed_at');
    if (dismissedAt) {
      const daysSince = (Date.now() - Number(dismissedAt)) / (1000 * 60 * 60 * 24);
      if (daysSince < 3) return;
    }

    // Show friendly prompt after 4 seconds of smooth browsing
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 4000);

    return () => clearTimeout(timer);
  }, []);

  const registerServiceWorkerAndSync = async () => {
    try {
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
      }
    } catch (err) {
      console.warn('[Push Sync Notice]', err);
    }
  };

  const handleEnableNotifications = async () => {
    if (!isSupported) {
      toast.error('Tarayıcınız anlık bildirim özelliğini desteklemiyor.');
      return;
    }

    setIsSubscribing(true);

    try {
      // 1. Request Browser Permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm === 'granted') {
        setIsVisible(false);
        await registerServiceWorkerAndSync();
        toast.success('Bildirimler Başarıyla Açıldı! 🎉', {
          description: 'Özel indirimler, yeni squishy ürünleri ve sipariş durumunuzdan ilk siz haberdar olacaksınız.',
        });
      } else if (perm === 'denied') {
        setIsVisible(false);
        toast.info('Bildirim izni verilmedi.', {
          description: 'Dilediğiniz zaman tarayıcı ayarlarından bildirimleri aktif edebilirsiniz.',
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
    localStorage.setItem('otantikos_push_dismissed_at', String(Date.now()));
  };

  if (!isVisible || !isSupported || permission !== 'default') {
    return null;
  }

  return (
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
                <span>{isSubscribing ? 'Kaydediliyor...' : 'Bildirimleri Aç'}</span>
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
  );
}
