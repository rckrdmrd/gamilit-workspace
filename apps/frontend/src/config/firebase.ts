/**
 * Firebase Configuration for Push Notifications
 *
 * @description Configuración de Firebase SDK para web push notifications
 * @version 1.0 (2025-11-29)
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { getMessaging, Messaging, getToken, onMessage, MessagePayload } from 'firebase/messaging';

// Firebase config from environment variables
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
};

// VAPID key for web push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || '';

let app: FirebaseApp | null = null;
let messaging: Messaging | null = null;

/**
 * Check if Firebase is properly configured
 */
export const isFirebaseConfigured = (): boolean => {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    firebaseConfig.messagingSenderId &&
    VAPID_KEY
  );
};

/**
 * Initialize Firebase app (lazy initialization)
 */
export const initializeFirebase = (): FirebaseApp | null => {
  if (!isFirebaseConfigured()) {
    console.warn('[Firebase] Not configured. Push notifications will not work.');
    return null;
  }

  if (!app) {
    try {
      app = initializeApp(firebaseConfig);
      console.log('[Firebase] Initialized successfully');
    } catch (error) {
      console.error('[Firebase] Initialization error:', error);
      return null;
    }
  }

  return app;
};

/**
 * Get Firebase Messaging instance
 */
export const getFirebaseMessaging = (): Messaging | null => {
  if (!messaging) {
    const firebaseApp = initializeFirebase();
    if (firebaseApp && 'Notification' in window) {
      try {
        messaging = getMessaging(firebaseApp);
      } catch (error) {
        console.error('[Firebase] Messaging initialization error:', error);
        return null;
      }
    }
  }
  return messaging;
};

/**
 * Request notification permission and get FCM token
 */
export const requestPushPermission = async (): Promise<string | null> => {
  try {
    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('[Firebase] Notifications not supported in this browser');
      return null;
    }

    // Request permission
    const permission = await Notification.requestPermission();

    if (permission !== 'granted') {
      console.log('[Firebase] Notification permission denied');
      return null;
    }

    // Get messaging instance
    const messagingInstance = getFirebaseMessaging();
    if (!messagingInstance) {
      return null;
    }

    // Get token
    const token = await getToken(messagingInstance, { vapidKey: VAPID_KEY });
    console.log('[Firebase] FCM Token obtained');

    return token;
  } catch (error) {
    console.error('[Firebase] Error getting token:', error);
    return null;
  }
};

/**
 * Subscribe to foreground messages
 */
export const onForegroundMessage = (
  callback: (payload: MessagePayload) => void,
): (() => void) | null => {
  const messagingInstance = getFirebaseMessaging();
  if (!messagingInstance) {
    return null;
  }

  const unsubscribe = onMessage(messagingInstance, (payload) => {
    console.log('[Firebase] Foreground message received:', payload);
    callback(payload);
  });

  return unsubscribe;
};

export { getToken };
