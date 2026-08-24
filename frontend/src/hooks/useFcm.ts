import { useEffect, useRef } from 'react';
import { requestNotificationPermission, onForegroundMessage } from '@/lib/firebase';
import { apiClient } from '@/lib/api-client';
import { toast } from 'sonner';

/**
 * useFcm — registers the FCM device token with the backend and
 * shows a toast for foreground (in-app) push messages.
 *
 * Call this once inside a component that is mounted after the user is logged in
 * (e.g. StudentLayout or DashboardPage).
 */
export const useFcm = () => {
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    const init = async () => {
      try {
        const token = await requestNotificationPermission();
        if (!token) return;

        // Send the FCM token to our backend
        await apiClient.post('/student/device-token', { token, platform: 'web' });
        console.info('[useFcm] Device token registered with backend');
      } catch (err) {
        // Non-critical — just log, don't break the UI
        console.warn('[useFcm] Token registration failed:', err);
      }
    };

    init();

    // Listen for foreground messages and show them as toasts
    const unsubscribe = onForegroundMessage(({ title, body }) => {
      toast(title, {
        description: body,
        duration: 6000,
        icon: '🔔',
      });
    });

    return () => {
      unsubscribe();
    };
  }, []);
};
