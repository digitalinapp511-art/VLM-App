import { initializeApp, getApps } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: 'AIzaSyA6WSLXwNV4vBI-oiHfyXxfQrMeNIZFoT0',
  authDomain: 'vlm-app-33106.firebaseapp.com',
  projectId: 'vlm-app-33106',
  storageBucket: 'vlm-app-33106.firebasestorage.app',
  messagingSenderId: '385880718255',
  appId: '1:385880718255:web:5d7a560ded45b149db8d5a',
  measurementId: 'G-1MPWHYKDJ5',
};

// Initialize only once (safe in strict mode / HMR environments)
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

let messaging: ReturnType<typeof getMessaging> | null = null;

// Messaging is only available in browser environments that support service workers
const isMessagingSupported =
  typeof window !== 'undefined' && 'serviceWorker' in navigator && 'Notification' in window;

if (isMessagingSupported) {
  try {
    messaging = getMessaging(app);
  } catch {
    // silently fail in non-supported environments (e.g. iOS WebView without permission)
  }
}

const VAPID_KEY = 'BJW5YWcKRQFRqoUE0ffGlKB1nuQSfjOlSAUUIuTMb53_aqnM4loh99a2vHysYvxm79WGUeUtbZKwPRJ28Fjg5nU';

/**
 * Request notification permission and get the FCM registration token.
 * Returns the token string, or null if permission was denied / not supported.
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  if (!messaging || !isMessagingSupported) return null;

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.info('[FCM] Notification permission denied');
      return null;
    }

    // Register the service worker first
    const registration = await navigator.serviceWorker.register('/firebase-messaging-sw.js', {
      scope: '/',
    });

    const token = await getToken(messaging, {
      vapidKey: VAPID_KEY,
      serviceWorkerRegistration: registration,
    });

    if (token) {
      console.info('[FCM] Token obtained:', token.substring(0, 20) + '...');
      return token;
    }
    return null;
  } catch (err) {
    console.error('[FCM] Failed to get token:', err);
    return null;
  }
};

/**
 * Listen for foreground messages (app is open).
 * Call this once when the app mounts after login.
 * Returns an unsubscribe function.
 */
export const onForegroundMessage = (
  callback: (payload: { title: string; body: string; data?: Record<string, string> }) => void
) => {
  if (!messaging) return () => {};

  return onMessage(messaging, (payload) => {
    const { notification, data } = payload;
    callback({
      title: notification?.title ?? 'VLM Academy',
      body: notification?.body ?? '',
      data: data as Record<string, string>,
    });
  });
};

export { app, messaging };
