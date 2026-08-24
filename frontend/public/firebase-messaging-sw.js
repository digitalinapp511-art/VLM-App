// Firebase Cloud Messaging Service Worker
// IMPORTANT: This file MUST be served from the root /firebase-messaging-sw.js
// It handles background push notifications when the app tab is not active.

importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyA6WSLXwNV4vBI-oiHfyXxfQrMeNIZFoT0',
  authDomain: 'vlm-app-33106.firebaseapp.com',
  projectId: 'vlm-app-33106',
  storageBucket: 'vlm-app-33106.firebasestorage.app',
  messagingSenderId: '385880718255',
  appId: '1:385880718255:web:5d7a560ded45b149db8d5a',
});

const messaging = firebase.messaging();

// Handle background messages — show a native browser notification
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] Background message received:', payload);

  const { title = 'VLM Academy', body = '', icon, data } = {
    title: payload.notification?.title,
    body: payload.notification?.body,
    icon: payload.notification?.icon || '/icon-192x192.png',
    data: payload.data || {},
  };

  self.registration.showNotification(title, {
    body,
    icon,
    badge: '/badge-72x72.png',
    data,
    vibrate: [200, 100, 200],
    tag: data?.notifId || 'vlm-notification',
    renotify: true,
  });
});

// Handle notification click — open / focus the app
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const deepLink = event.notification.data?.deepLink || '/';
  const url = new URL(deepLink, self.location.origin).href;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      for (const client of windowClients) {
        if (client.url === url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(url);
      }
    })
  );
});
