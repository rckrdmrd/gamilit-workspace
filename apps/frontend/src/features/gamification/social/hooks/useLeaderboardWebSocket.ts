/**
 * useLeaderboardWebSocket Hook
 *
 * React hook for managing WebSocket connections for real-time leaderboard updates
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '@/features/auth/store/authStore';
import { getAuthToken } from '@/services/api/apiClient';
import { API_CONFIG } from '@/config/api.config';
import { useLeaderboardsStore } from '../store/leaderboardsStore';
import type { LeaderboardEntry } from '../types/leaderboardsTypes';

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

export interface LeaderboardUpdatePayload {
  leaderboard: LeaderboardEntry[];
  timestamp: string;
}

export interface UseLeaderboardWebSocketReturn {
  isConnected: boolean;
  disconnect: () => void;
}

/**
 * Hook for WebSocket connection specific to leaderboards
 */
export function useLeaderboardWebSocket(): UseLeaderboardWebSocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const isConnectedRef = useRef(false);
  const { user } = useAuthStore();
  const leaderboardStore = useLeaderboardsStore();

  /**
   * Handle leaderboard update from WebSocket
   */
  const handleLeaderboardUpdate = useCallback(
    (data: LeaderboardUpdatePayload) => {
      console.log('📊 Leaderboard update received via WebSocket:', {
        entriesCount: data.leaderboard?.length,
        timestamp: data.timestamp,
      });

      // Update the store with new leaderboard data
      leaderboardStore.updateFromWebSocket(data.leaderboard);
    },
    [leaderboardStore],
  );

  /**
   * Initialize WebSocket connection
   */
  const connect = useCallback(async () => {
    if (socketRef.current?.connected) {
      console.log('✅ Leaderboard WebSocket already connected');
      return;
    }

    if (!user?.id) {
      console.log('⚠️ No user ID available, skipping leaderboard WebSocket connection');
      return;
    }

    console.log('🔌 Connecting to leaderboard WebSocket server:', WEBSOCKET_URL);

    // Get authentication token
    let token = getAuthToken();

    if (!token) {
      console.log(
        'ℹ️ No authentication token available, skipping leaderboard WebSocket connection',
      );
      return;
    }

    // Validate token before connecting - attempt refresh if expired
    if (!isTokenValid(token)) {
      console.log('⚠️ Token expired, attempting to refresh for leaderboard WebSocket...');

      try {
        // Attempt to refresh the token
        const { refreshSession } = useAuthStore.getState();
        await refreshSession();

        // Get the new token after refresh
        token = getAuthToken();

        if (!token || !isTokenValid(token)) {
          console.log('ℹ️ Token refresh failed. Leaderboard real-time updates unavailable.');
          return;
        }

        console.log('✅ Token refreshed successfully for leaderboard WebSocket');
      } catch (error) {
        console.error('❌ Token refresh error for leaderboard WebSocket:', error);
        console.log('ℹ️ Leaderboard real-time updates unavailable.');
        return;
      }
    }

    const socket = io(WEBSOCKET_URL, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
      auth: {
        token: token,
      },
    });

    // Connection events
    socket.on('connect', () => {
      console.log('✅ Leaderboard WebSocket connected:', socket.id);
      isConnectedRef.current = true;
    });

    socket.on('authenticated', (data: any) => {
      console.log('✅ Leaderboard WebSocket authenticated:', data);
    });

    socket.on('disconnect', (reason: string) => {
      console.log('❌ Leaderboard WebSocket disconnected:', reason);
      isConnectedRef.current = false;
    });

    socket.on('connect_error', (error: Error) => {
      // Only log if it's not an authentication error
      if (!error.message.includes('Authentication') && !error.message.includes('authentication')) {
        console.error('❌ Leaderboard WebSocket connection error:', error);
      } else {
        console.log(
          'ℹ️ Leaderboard WebSocket authentication required. Real-time updates unavailable.',
        );
      }
      isConnectedRef.current = false;
    });

    socket.on('error', (error: any) => {
      console.error('❌ Leaderboard WebSocket error:', error);
    });

    // Listen for leaderboard updates
    socket.on('leaderboard:updated', handleLeaderboardUpdate);

    // Also listen for the alternative event name (from backend types)
    socket.on('leaderboard_updated', handleLeaderboardUpdate);

    socketRef.current = socket;
  }, [user?.id, handleLeaderboardUpdate]);

  /**
   * Disconnect WebSocket
   */
  const disconnect = useCallback(() => {
    if (socketRef.current) {
      console.log('🔌 Disconnecting leaderboard WebSocket...');
      socketRef.current.disconnect();
      socketRef.current = null;
      isConnectedRef.current = false;
    }
  }, []);

  /**
   * Connect on mount, disconnect on unmount
   * Only connect if user is authenticated with a valid token
   */
  useEffect(() => {
    const token = getAuthToken();

    if (user?.id && token) {
      connect();
    } else {
      console.log(
        '⚠️ Skipping leaderboard WebSocket connection: User not authenticated or token missing',
      );
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return {
    isConnected: isConnectedRef.current,
    disconnect,
  };
}
