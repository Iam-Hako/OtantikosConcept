// Otantikos Concept - High-Performance Service Worker & Web Push Handler
const CACHE_NAME = 'otantikos-cache-v1';

self.addEventListener('install', (event) => {
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});

// ---------------------------------------------------------------------------
// PUSH NOTIFICATION RECEIVER (Chrome, Safari iOS 16.4+, Firefox, Edge)
// ---------------------------------------------------------------------------
self.addEventListener('push', (event) => {
  let data = {};
  try {
    if (event.data) {
      data = event.data.json();
    }
  } catch (e) {
    data = {
      title: 'Otantikos Concept',
      body: event.data ? event.data.text() : 'Yeni bir bildiriminiz var!',
      url: '/',
    };
  }

  const title = data.title || 'Otantikos Concept | Fırsatlar';
  const options = {
    body: data.body || data.message || 'Özel squishy ve hediyelik fırsatlarını kaçırmayın!',
    icon: data.icon || '/icons/icon-192.png',
    badge: data.badge || '/icons/badge-72.png',
    image: data.image || data.image_url || undefined,
    vibrate: [200, 100, 200],
    tag: data.tag || 'otantikos-notification',
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    actions: [
      {
        action: 'explore',
        title: 'Hemen İncele 🛍️',
      },
      {
        action: 'close',
        title: 'Kapat',
      },
    ],
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

// ---------------------------------------------------------------------------
// NOTIFICATION CLICK HANDLER
// ---------------------------------------------------------------------------
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') {
    return;
  }

  const targetUrl = event.notification.data?.url || '/';

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open at Otantikos domain, focus and navigate it
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise open a new window
      if (self.clients.openWindow) {
        return self.clients.openWindow(targetUrl);
      }
    })
  );
});
