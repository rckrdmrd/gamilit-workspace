/**
 * usePushNotifications Hook
 *
 * @description Hook para gestionar push notifications con Web Push API nativo
 * @version 2.0 (2025-11-29) - Migrado de Firebase a Web Push nativo
 */

import { useState, useEffect, useCallback } from 'react';
import { useNotificationsStore } from '../store/notificationsStore';
import {
  isWebPushSupported,
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  isSubscribed,
} from '@/config/webpush';
import toast from 'react-hot-toast';

interface UsePushNotificationsReturn {
  /** Whether Web Push is supported in this browser */
  isSupported: boolean;
  /** Current permission status */
  permissionStatus: NotificationPermission;
  /** Whether currently subscribed to push */
  isSubscribedToPush: boolean;
  /** Whether we're currently registering */
  isRegistering: boolean;
  /** Error message if any */
  error: string | null;
  /** Request permission and subscribe to push */
  enablePushNotifications: () => Promise<boolean>;
  /** Unsubscribe from push */
  disablePushNotifications: () => Promise<boolean>;
}

/**
 * Get browser and OS info for device naming
 */
const getDeviceInfo = (): { name: string; type: 'web' | 'ios' | 'android' } => {
  const ua = navigator.userAgent.toLowerCase();

  let platform = 'Desconocido';
  if (ua.includes('win')) platform = 'Windows';
  else if (ua.includes('mac')) platform = 'macOS';
  else if (ua.includes('linux')) platform = 'Linux';
  else if (ua.includes('iphone') || ua.includes('ipad')) platform = 'iOS';
  else if (ua.includes('android')) platform = 'Android';

  let browser = 'Navegador';
  if (ua.includes('chrome') && !ua.includes('edg')) browser = 'Chrome';
  else if (ua.includes('safari') && !ua.includes('chrome')) browser = 'Safari';
  else if (ua.includes('firefox')) browser = 'Firefox';
  else if (ua.includes('edg')) browser = 'Edge';

  return {
    name: `${browser} en ${platform}`,
    type: 'web',
  };
};

export const usePushNotifications = (): UsePushNotificationsReturn => {
  const { registerDevice, fetchDevices } = useNotificationsStore();

  const [isSupported, setIsSupported] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isSubscribedToPush, setIsSubscribedToPush] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check support on mount
  useEffect(() => {
    const supported = isWebPushSupported();
    setIsSupported(supported);

    if (supported) {
      setPermissionStatus(Notification.permission);

      // Register service worker
      registerServiceWorker();

      // Check if already subscribed
      isSubscribed().then(setIsSubscribedToPush);
    }
  }, []);

  // Enable push notifications
  const enablePushNotifications = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError('Tu navegador no soporta notificaciones push');
      return false;
    }

    setIsRegistering(true);
    setError(null);

    try {
      // Request permission
      const permission = await requestNotificationPermission();
      setPermissionStatus(permission);

      if (permission !== 'granted') {
        setError('Permiso de notificaciones denegado');
        return false;
      }

      // Subscribe to push
      const subscriptionJson = await subscribeToPush();

      if (!subscriptionJson) {
        setError('No se pudo suscribir a notificaciones push');
        return false;
      }

      // Get device info
      const deviceInfo = getDeviceInfo();

      // Register device in backend
      // The subscriptionJson is stored as deviceToken
      await registerDevice({
        deviceToken: subscriptionJson,
        deviceType: deviceInfo.type,
        deviceName: deviceInfo.name,
      });

      setIsSubscribedToPush(true);
      toast.success('¡Notificaciones push activadas!');

      // Refresh devices list
      await fetchDevices();

      return true;
    } catch (err) {
      console.error('[Push] Enable failed:', err);
      setError(err instanceof Error ? err.message : 'Error al activar notificaciones');
      return false;
    } finally {
      setIsRegistering(false);
    }
  }, [isSupported, registerDevice, fetchDevices]);

  // Disable push notifications
  const disablePushNotifications = useCallback(async (): Promise<boolean> => {
    try {
      const success = await unsubscribeFromPush();
      if (success) {
        setIsSubscribedToPush(false);
        toast.success('Notificaciones push desactivadas');
      }
      return success;
    } catch (err) {
      console.error('[Push] Disable failed:', err);
      return false;
    }
  }, []);

  return {
    isSupported,
    permissionStatus,
    isSubscribedToPush,
    isRegistering,
    error,
    enablePushNotifications,
    disablePushNotifications,
  };
};
