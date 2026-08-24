import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getMessaging } from 'firebase-admin/messaging';

let initialized = false;

/**
 * Initialize Firebase Admin SDK (idempotent — safe to call multiple times)
 */
export const initFirebase = () => {
  if (initialized || getApps().length > 0) {
    initialized = true;
    return;
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
    console.warn('[FCM] Firebase credentials not set — push notifications disabled');
    return;
  }

  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey,
    }),
  });

  initialized = true;
  console.log('[FCM] Firebase Admin SDK initialized ✓');
};

/**
 * Send push notification to a single FCM token
 */
export const sendPushToToken = async (token, { title, body, data = {}, imageUrl } = {}) => {
  if (!initialized && getApps().length === 0) return null;

  try {
    const message = {
      token,
      notification: {
        title,
        body,
        ...(imageUrl && { imageUrl }),
      },
      data: Object.fromEntries(
        Object.entries(data).map(([k, v]) => [k, String(v)])
      ),
      android: {
        priority: 'high',
        notification: {
          channelId: 'vlm_notifications',
          clickAction: 'FLUTTER_NOTIFICATION_CLICK',
          ...(imageUrl && { imageUrl }),
        },
      },
      webpush: {
        headers: { Urgency: 'high' },
        notification: {
          title,
          body,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...(imageUrl && { image: imageUrl }),
        },
        fcmOptions: { link: data.deepLink || '/' },
      },
    };

    const response = await getMessaging().send(message);
    return response;
  } catch (err) {
    // Token expired / unregistered — caller should clean it up
    if (
      err.code === 'messaging/registration-token-not-registered' ||
      err.code === 'messaging/invalid-registration-token'
    ) {
      return { stale: true, token };
    }
    console.error('[FCM] sendPushToToken error:', err.message);
    return null;
  }
};

/**
 * Send push to multiple FCM tokens (auto-batches in chunks of 500)
 */
export const sendPushToTokens = async (tokens, payload) => {
  if (!tokens?.length || (!initialized && getApps().length === 0)) return [];

  const CHUNK_SIZE = 500;
  const staleTokens = [];
  const results = [];

  for (let i = 0; i < tokens.length; i += CHUNK_SIZE) {
    const chunk = tokens.slice(i, i + CHUNK_SIZE);
    const promises = chunk.map((token) => sendPushToToken(token, payload));
    const chunkResults = await Promise.allSettled(promises);

    chunkResults.forEach((r, idx) => {
      if (r.status === 'fulfilled' && r.value?.stale) {
        staleTokens.push(chunk[idx]);
      }
      results.push(r);
    });
  }

  // Return stale tokens so the caller can purge them
  return { results, staleTokens };
};

/**
 * Subscribe tokens to a named topic (e.g. "all_students")
 */
export const subscribeToTopic = async (tokens, topic) => {
  if (!tokens?.length || (!initialized && getApps().length === 0)) return;
  try {
    await getMessaging().subscribeToTopic(tokens, topic);
  } catch (err) {
    console.error('[FCM] subscribeToTopic error:', err.message);
  }
};

/**
 * Send to a Firebase topic (broadcast to all subscribed devices)
 */
export const sendPushToTopic = async (topic, payload) => {
  if (!initialized && getApps().length === 0) return null;
  try {
    const message = {
      topic,
      notification: {
        title: payload.title,
        body: payload.body,
        ...(payload.imageUrl && { imageUrl: payload.imageUrl }),
      },
      data: Object.fromEntries(
        Object.entries(payload.data || {}).map(([k, v]) => [k, String(v)])
      ),
      android: { priority: 'high' },
    };
    return await getMessaging().send(message);
  } catch (err) {
    console.error('[FCM] sendPushToTopic error:', err.message);
    return null;
  }
};
