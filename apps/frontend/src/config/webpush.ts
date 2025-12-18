/**
 * Web Push Configuration
 *
 * @description Configuración de Web Push API nativo (sin Firebase)
 * @version 1.0 (2025-11-29)
 *
 * Web Push API:
 * - Estándar W3C implementado nativamente en navegadores
 * - No requiere Firebase ni servicios externos
 * - Usa claves VAPID para autenticación servidor-navegador
 * - Compatible con Chrome, Firefox, Edge, Safari 16.4+
 */

import { apiClient } from '@/services/api/apiClient';

/**
 * Check if Web Push is supported
 */
export const isWebPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
};

/**
 * Get VAPID public key from backend
 */
export const getVapidPublicKey = async (): Promise<string | null> => {
  try {
    const response = await apiClient.get<{ vapidPublicKey: string }>(
      '/notifications/devices/vapid-public-key',
    );
    return response.data.vapidPublicKey;
  } catch (error) {
    console.error('[WebPush] Failed to get VAPID key:', error);
    return null;
  }
};

/**
 * Convert VAPID key to Uint8Array for subscription
 */
export const urlBase64ToUint8Array = (base64String: string): Uint8Array => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

/**
 * Register service worker for push notifications
 */
export const registerServiceWorker = async (): Promise<ServiceWorkerRegistration | null> => {
  if (!('serviceWorker' in navigator)) {
    console.warn('[WebPush] Service workers not supported');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw-push.js');
    console.log('[WebPush] Service worker registered:', registration.scope);
    return registration;
  } catch (error) {
    console.error('[WebPush] Service worker registration failed:', error);
    return null;
  }
};

/**
 * Request push notification permission
 */
export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) {
    return 'denied';
  }
  return await Notification.requestPermission();
};

/**
 * Subscribe to push notifications
 * Returns the PushSubscription as JSON string (to store as deviceToken)
 */
export const subscribeToPush = async (): Promise<string | null> => {
  try {
    // Get service worker registration
    const registration = await navigator.serviceWorker.ready;

    // Get VAPID key from backend
    const vapidKey = await getVapidPublicKey();
    if (!vapidKey) {
      console.error('[WebPush] No VAPID key available');
      return null;
    }

    // Subscribe to push
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(vapidKey),
    });

    console.log('[WebPush] Subscription obtained');

    // Return as JSON string (this is what we store as deviceToken)
    return JSON.stringify(subscription.toJSON());
  } catch (error) {
    console.error('[WebPush] Subscription failed:', error);
    return null;
  }
};

/**
 * Unsubscribe from push notifications
 */
export const unsubscribeFromPush = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[WebPush] Unsubscribed successfully');
      return true;
    }
    return false;
  } catch (error) {
    console.error('[WebPush] Unsubscribe failed:', error);
    return false;
  }
};

/**
 * Check if currently subscribed
 */
export const isSubscribed = async (): Promise<boolean> => {
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch {
    return false;
  }
};
