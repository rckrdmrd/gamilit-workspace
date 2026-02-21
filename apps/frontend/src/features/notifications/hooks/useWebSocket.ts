/**
 * useWebSocket Hook
 *
 * React hook for managing WebSocket connections for real-time notifications
 */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useNotificationsStore } from '../store/notificationsStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getAuthToken } from '@/services/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import type { Notification } from '@/services/api/notificationsAPI';

// Use unified API config for WebSocket URL
const WEBSOCKET_URL = API_CONFIG.wsURL;

/**
 * Check if JWT token is valid (not expired)
 */
function isTokenValid(token: string): boolean {
  try {
    // Decode JWT payload (base64)
    const payload = JSON.parse(atob(token.split('.')[1]));

    // Check if token is expired
    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (_error) {
    return false;
  }
}

// Notification types from backend WebSocket (may differ from API types)
type WebSocketNotificationType =
  | 'achievement'
  | 'mission'
  | 'assignment'
  | 'social'
  | 'system'
  | 'gamification'
  | 'achievement_unlocked'
  | 'rank_up'
  | 'rank_promoted'
  | 'streak_milestone'
  | 'coins_earned'
  | 'ml_coins_earned'
  | 'xp_earned'
  | 'module_completed'
  | 'new_assignment'
  | 'exercise_feedback'
  | 'mission_rewards_claimed'
  | 'shop_purchase'
  | 'system_announcement';

export interface WebSocketNotification {
  notification: {
    id: string;
    userId: string;
    type: WebSocketNotificationType;
    title: string;
    message: string;
    metadata?: Record<string, unknown>;
    isRead: boolean;
    createdAt: string;
  };
  timestamp: string;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  sendMessage: (event: string, data: unknown) => void;
  disconnect: () => void;
}

/**
 * Hook for WebSocket connection
 */
export function useWebSocket(): UseWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  // Use selectors to prevent re-renders on unrelated store changes
  const user = useAuthStore((state) => state.user);
  const addNotification = useNotificationsStore((state) => state.addNotification);
  const fetchUnreadCount = useNotificationsStore((state) => state.fetchUnreadCount);

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      return;
    }

    if (!user?.id) {
      return;
    }

    // Get authentication token
    let token = getAuthToken();

    if (!token) {
      return;
    }

    // Validate token before connecting - attempt refresh if expired
    if (!isTokenValid(token)) {
      try {
        // Attempt to refresh the token
        const { refreshSession } = useAuthStore.getState();
        await refreshSession();

        // Get the new token after refresh
        token = getAuthToken();

        if (!token || !isTokenValid(token)) {
          return;
        }
      } catch (_error) {
        // Connection error handled silently
        return;
      }
    }

    const socket = io(WEBSOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 30000, // Aumentado: max 30s entre intentos
      reconnectionAttempts: Infinity, // Reconectar indefinidamente
      randomizationFactor: 0.5, // Backoff exponencial con jitter
      timeout: 20000, // Timeout de conexion 20s
      auth: {
        token: token,
      },
    });

    // Connection events
    socket.on('connect', () => {
      isConnectedRef.current = true;
    });

    socket.on('authenticated', (_data: unknown) => {
      // Connection authenticated successfully
    });

    socket.on('disconnect', (_reason: string) => {
      isConnectedRef.current = false;
    });

    socket.on('connect_error', (_error: Error) => {
      // Connection error handled silently
      isConnectedRef.current = false;
    });

    socket.on('error', (_error: unknown) => {
      // Connection error handled silently
    });

    // Listen for new notifications
    socket.on('new_notification', (data: WebSocketNotification) => {
      // Map WebSocket notification type to system notification type (aligned with DDL EXT-003)
      const mapNotificationType = (wsType: WebSocketNotificationType): string => {
        const typeMap: Record<WebSocketNotificationType, string> = {
          achievement: 'achievement',
          mission: 'mission',
          assignment: 'assignment',
          social: 'social',
          system: 'system',
          gamification: 'gamification',
          achievement_unlocked: 'achievement_unlocked',
          rank_up: 'rank_promoted',
          rank_promoted: 'rank_promoted',
          streak_milestone: 'streak_milestone',
          coins_earned: 'coins_received',
          ml_coins_earned: 'coins_received',
          xp_earned: 'xp_earned',
          module_completed: 'module_completed',
          new_assignment: 'new_assignment',
          exercise_feedback: 'exercise_feedback',
          mission_rewards_claimed: 'mission_rewards_claimed',
          shop_purchase: 'shop_purchase',
          system_announcement: 'system_announcement',
        };
        const mapped = typeMap[wsType];
        if (!mapped) {
          console.warn(`[WebSocket] Unknown notification type: ${wsType}, defaulting to system_announcement`);
          return 'system_announcement';
        }
        return mapped;
      };

      // Transform to match Notification type
      const notification = {
        id: data.notification.id,
        userId: data.notification.userId,
        type: mapNotificationType(data.notification.type) as Notification['type'],
        title: data.notification.title,
        message: data.notification.message,
        data: data.notification.metadata || {},
        status: 'unread' as const,
        createdAt: data.notification.createdAt,
      };

      // Add to notifications store (automatically increments unreadCount)
      addNotification(notification);

      // Exercise review feedback can trigger delayed rewards UI in student pages.
      if (notification.type === 'exercise_feedback') {
        window.dispatchEvent(new CustomEvent('gamilit:exercise:feedback', { detail: notification }));
      }

      // Show browser notification if permission granted
      showBrowserNotification(data.notification);
    });

    // Listen for notification read events

    socket.on('notification_read', (_data: { notificationId: string; timestamp: string }) => {
      // Notification read acknowledgment received
    });

    // Listen for notification deleted events

    socket.on('notification_deleted', (_data: { notificationId: string; timestamp: string }) => {
      // Notification deletion acknowledgment received
    });

    // Listen for unread count updates

    socket.on('unread_count_updated', (_data: { count: number; timestamp: string }) => {
      // The store will be updated via fetchUnreadCount
      fetchUnreadCount();
      window.dispatchEvent(new CustomEvent('gamilit:notifications:unread-updated'));
    });

    // ---------------------------------------------------------------
    // Gamification events — dispatched as custom DOM events so the
    // GamificationOverlay (useGamificationEvents hook) can react
    // without coupling to the socket instance.
    // ---------------------------------------------------------------

    socket.on('xp:gained', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:xp:gained', { detail: data }));
    });

    socket.on('mlcoins:earned', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:mlcoins:earned', { detail: data }));
    });

    socket.on('balance:updated', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:balance:updated', { detail: data }));
    });

    socket.on('achievement:unlocked', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:achievement:unlocked', { detail: data }));
    });

    socket.on('rank:updated', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:rank:updated', { detail: data }));
    });

    socket.on('mission:completed', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:mission:completed', { detail: data }));
    });

    socket.on('mission:progress', (data: unknown) => {
      window.dispatchEvent(new CustomEvent('gamilit:mission:progress', { detail: data }));
    });

    socketRef.current = socket;
  }, [user?.id, addNotification, fetchUnreadCount]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  /**
   * Send message to WebSocket server
   */
  const sendMessage = useCallback((event: string, data: unknown) => {
    if (socketRef.current?.connected) {
      socketRef.current.emit(event, data);
    } else {
      console.warn('⚠️ Cannot send message: WebSocket not connected');
    }
  }, []);

  /**
   * Show browser notification
   */
  const showBrowserNotification = (notification: WebSocketNotification['notification']) => {
    // Check if browser supports notifications
    if (!('Notification' in window)) {
      return;
    }

    // Check permission
    if (Notification.permission === 'granted') {
      new Notification(notification.title, {
        body: notification.message,
        icon: '/logo.png', // Add your logo path
        tag: notification.id,
        requireInteraction: false,
      });
    } else if (Notification.permission !== 'denied') {
      // Request permission
      Notification.requestPermission().then((permission) => {
        if (permission === 'granted') {
          new Notification(notification.title, {
            body: notification.message,
            icon: '/logo.png',
            tag: notification.id,
            requireInteraction: false,
          });
        }
      });
    }
  };

  /**
   * Connect on mount, disconnect on unmount
   * Only connect if user is authenticated with a valid token
   *
   * FIX E1 (TASK-2026-01-18-006): Use isMounted flag to handle React 18 StrictMode
   * where components mount/unmount/remount. This prevents "WebSocket closed before
   * connection established" errors when cleanup runs before connect() completes.
   */
  useEffect(() => {
    let isMounted = true;
    const token = getAuthToken();

    if (user?.id && token && isMounted) {
      connect();
    }

    return () => {
      isMounted = false;
      disconnect();
    };
  }, [user?.id, connect, disconnect]);

  return {
    isConnected: isConnectedRef.current,
    sendMessage,
    disconnect,
  };
}

/**
 * Request browser notification permission
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!('Notification' in window)) {
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  const permission = await Notification.requestPermission();
  return permission;
}
