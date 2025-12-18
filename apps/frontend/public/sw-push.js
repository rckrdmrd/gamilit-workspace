/**
 * Service Worker for Web Push Notifications
 *
 * Handles push notifications when the app is closed or in background.
 * This is a standard Web Push service worker (no Firebase).
 */

// Push event - receive notification from server
self.addEventListener('push', (event) => {
  console.log('[SW] Push received');

  let data = {
    title: 'GAMILIT',
    body: 'Nueva notificación',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    tag: 'gamilit-notification',
    data: {},
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      console.error('[SW] Failed to parse push data:', e);
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag,
    vibrate: data.vibrate || [200, 100, 200],
    data: data.data,
    requireInteraction: data.requireInteraction || false,
    actions: [
      { action: 'open', title: 'Ver' },
      { action: 'dismiss', title: 'Cerrar' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);

  event.notification.close();

  if (event.action === 'dismiss') {
    return;
  }

  // Determine URL to open
  const urlToOpen = event.notification.data?.action_url || '/notifications';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If app is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            return client.focus().then((focusedClient) => {
              if ('navigate' in focusedClient) {
                return focusedClient.navigate(urlToOpen);
              }
            });
          }
        }
        // Otherwise, open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Notification close event (for analytics if needed)
self.addEventListener('notificationclose', (event) => {
  console.log('[SW] Notification closed');
});

// Service worker install
self.addEventListener('install', (event) => {
  console.log('[SW] Installing push service worker');
  self.skipWaiting();
});

// Service worker activate
self.addEventListener('activate', (event) => {
  console.log('[SW] Push service worker activated');
  event.waitUntil(clients.claim());
});
