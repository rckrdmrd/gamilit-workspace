/**
 * useClassroomRealtime Hook
 *
 * P2-01: Created 2025-12-18
 * Real-time classroom monitoring via WebSocket for Teacher Portal.
 *
 * Features:
 * - Subscribe to classroom activity updates
 * - Receive real-time student activity notifications
 * - Handle new submissions and alerts
 * - Track student online/offline status
 * - Auto-reconnect and connection status
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useAuthStore } from '@/features/auth/store/authStore';
import { API_CONFIG } from '@/config/api.config';

// ============================================================================
// TYPES
// ============================================================================

export interface StudentActivity {
  studentId: string;
  studentName: string;
  classroomId: string;
  activityType: 'exercise_start' | 'exercise_complete' | 'hint_used' | 'comodin_used' | 'module_start';
  exerciseId?: string;
  exerciseTitle?: string;
  moduleId?: string;
  moduleTitle?: string;
  metadata?: Record<string, unknown>;
  timestamp: string;
}

export interface ClassroomUpdate {
  classroomId: string;
  classroomName: string;
  updateType: 'student_joined' | 'student_left' | 'stats_changed';
  data: Record<string, unknown>;
  timestamp: string;
}

export interface NewSubmission {
  submissionId: string;
  studentId: string;
  studentName: string;
  exerciseId: string;
  exerciseTitle: string;
  classroomId: string;
  score: number;
  maxScore: number;
  requiresReview: boolean;
  timestamp: string;
}

export interface AlertTriggered {
  alertId: string;
  studentId: string;
  studentName: string;
  classroomId: string;
  alertType: 'at_risk' | 'low_performance' | 'inactive' | 'struggling';
  severity: 'low' | 'medium' | 'high';
  title: string;
  description: string;
  timestamp: string;
}

export interface StudentOnlineStatus {
  studentId: string;
  studentName: string;
  classroomId: string;
  isOnline: boolean;
  lastActivity?: string;
  timestamp: string;
}

export interface ProgressUpdate {
  studentId: string;
  studentName: string;
  classroomId: string;
  progressType: 'module_complete' | 'exercise_complete' | 'level_up' | 'achievement';
  details: Record<string, unknown>;
  timestamp: string;
}

export type RealtimeEvent =
  | { type: 'activity'; data: StudentActivity }
  | { type: 'classroom_update'; data: ClassroomUpdate }
  | { type: 'submission'; data: NewSubmission }
  | { type: 'alert'; data: AlertTriggered }
  | { type: 'online_status'; data: StudentOnlineStatus }
  | { type: 'progress'; data: ProgressUpdate };

export interface UseClassroomRealtimeOptions {
  classroomIds: string[];
  onActivity?: (data: StudentActivity) => void;
  onSubmission?: (data: NewSubmission) => void;
  onAlert?: (data: AlertTriggered) => void;
  onStudentOnline?: (data: StudentOnlineStatus) => void;
  onStudentOffline?: (data: StudentOnlineStatus) => void;
  onProgressUpdate?: (data: ProgressUpdate) => void;
  onClassroomUpdate?: (data: ClassroomUpdate) => void;
  enabled?: boolean;
}

export interface UseClassroomRealtimeReturn {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  events: RealtimeEvent[];
  onlineStudents: Map<string, StudentOnlineStatus>;
  clearEvents: () => void;
  reconnect: () => void;
}

// ============================================================================
// SOCKET EVENTS
// ============================================================================

const SocketEvents = {
  // Client -> Server
  SUBSCRIBE_CLASSROOM: 'teacher:subscribe_classroom',
  UNSUBSCRIBE_CLASSROOM: 'teacher:unsubscribe_classroom',
  // Server -> Client
  STUDENT_ACTIVITY: 'teacher:student_activity',
  CLASSROOM_UPDATE: 'teacher:classroom_update',
  NEW_SUBMISSION: 'teacher:new_submission',
  ALERT_TRIGGERED: 'teacher:alert_triggered',
  STUDENT_ONLINE: 'teacher:student_online',
  STUDENT_OFFLINE: 'teacher:student_offline',
  PROGRESS_UPDATE: 'teacher:progress_update',
  AUTHENTICATED: 'authenticated',
  ERROR: 'error',
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useClassroomRealtime(
  options: UseClassroomRealtimeOptions,
): UseClassroomRealtimeReturn {
  const {
    classroomIds,
    onActivity,
    onSubmission,
    onAlert,
    onStudentOnline,
    onStudentOffline,
    onProgressUpdate,
    onClassroomUpdate,
    enabled = true,
  } = options;

  const { user } = useAuth();
  const token = useAuthStore((state) => state.token);
  const socketRef = useRef<Socket | null>(null);
  const subscribedRoomsRef = useRef<Set<string>>(new Set());

  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [events, setEvents] = useState<RealtimeEvent[]>([]);
  const [onlineStudents, setOnlineStudents] = useState<Map<string, StudentOnlineStatus>>(
    new Map(),
  );

  // Add event to history
  const addEvent = useCallback((event: RealtimeEvent) => {
    setEvents((prev) => {
      const newEvents = [event, ...prev];
      // Keep only last 100 events
      return newEvents.slice(0, 100);
    });
  }, []);

  // Clear events
  const clearEvents = useCallback(() => {
    setEvents([]);
  }, []);

  // Subscribe to a classroom
  const subscribeToClassroom = useCallback((socket: Socket, classroomId: string) => {
    if (subscribedRoomsRef.current.has(classroomId)) return;

    socket.emit(SocketEvents.SUBSCRIBE_CLASSROOM, { classroomId }, (response: { success: boolean }) => {
      if (response?.success) {
        subscribedRoomsRef.current.add(classroomId);
        console.log(`[useClassroomRealtime] Subscribed to classroom ${classroomId}`);
      }
    });
  }, []);

  // Unsubscribe from a classroom
  const unsubscribeFromClassroom = useCallback((socket: Socket, classroomId: string) => {
    if (!subscribedRoomsRef.current.has(classroomId)) return;

    socket.emit(SocketEvents.UNSUBSCRIBE_CLASSROOM, { classroomId }, (response: { success: boolean }) => {
      if (response?.success) {
        subscribedRoomsRef.current.delete(classroomId);
        console.log(`[useClassroomRealtime] Unsubscribed from classroom ${classroomId}`);
      }
    });
  }, []);

  // Connect to WebSocket
  const connect = useCallback(() => {
    if (!enabled || !user || !token) return;

    // EXT-003 FIX 2026-01-04: Use centralized WebSocket URL from API_CONFIG
    const wsUrl = API_CONFIG.wsURL;

    setIsConnecting(true);
    setError(null);

    const socket = io(wsUrl, {
      path: '/socket.io/',
      transports: ['websocket', 'polling'],
      auth: { token },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    socket.on('connect', () => {
      console.log('[useClassroomRealtime] Connected');
      setIsConnecting(false);
      setIsConnected(true);
      setError(null);
    });

    socket.on(SocketEvents.AUTHENTICATED, () => {
      console.log('[useClassroomRealtime] Authenticated');
      // Subscribe to all classrooms
      classroomIds.forEach((id) => subscribeToClassroom(socket, id));
    });

    socket.on('disconnect', (reason) => {
      console.log('[useClassroomRealtime] Disconnected:', reason);
      setIsConnected(false);
      subscribedRoomsRef.current.clear();
    });

    socket.on('connect_error', (err) => {
      console.error('[useClassroomRealtime] Connection error:', err);
      setIsConnecting(false);
      setError(err);
    });

    socket.on(SocketEvents.ERROR, (data: { message: string }) => {
      console.error('[useClassroomRealtime] Socket error:', data.message);
      setError(new Error(data.message));
    });

    // Activity event
    socket.on(SocketEvents.STUDENT_ACTIVITY, (data: StudentActivity) => {
      addEvent({ type: 'activity', data });
      onActivity?.(data);
    });

    // Classroom update event
    socket.on(SocketEvents.CLASSROOM_UPDATE, (data: ClassroomUpdate) => {
      addEvent({ type: 'classroom_update', data });
      onClassroomUpdate?.(data);
    });

    // New submission event
    socket.on(SocketEvents.NEW_SUBMISSION, (data: NewSubmission) => {
      addEvent({ type: 'submission', data });
      onSubmission?.(data);
    });

    // Alert triggered event
    socket.on(SocketEvents.ALERT_TRIGGERED, (data: AlertTriggered) => {
      addEvent({ type: 'alert', data });
      onAlert?.(data);
    });

    // Student online event
    socket.on(SocketEvents.STUDENT_ONLINE, (data: StudentOnlineStatus) => {
      setOnlineStudents((prev) => {
        const updated = new Map(prev);
        updated.set(data.studentId, data);
        return updated;
      });
      addEvent({ type: 'online_status', data });
      onStudentOnline?.(data);
    });

    // Student offline event
    socket.on(SocketEvents.STUDENT_OFFLINE, (data: StudentOnlineStatus) => {
      setOnlineStudents((prev) => {
        const updated = new Map(prev);
        updated.delete(data.studentId);
        return updated;
      });
      addEvent({ type: 'online_status', data });
      onStudentOffline?.(data);
    });

    // Progress update event
    socket.on(SocketEvents.PROGRESS_UPDATE, (data: ProgressUpdate) => {
      addEvent({ type: 'progress', data });
      onProgressUpdate?.(data);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      subscribedRoomsRef.current.clear();
    };
  }, [
    enabled,
    user,
    token,
    classroomIds,
    subscribeToClassroom,
    addEvent,
    onActivity,
    onSubmission,
    onAlert,
    onStudentOnline,
    onStudentOffline,
    onProgressUpdate,
    onClassroomUpdate,
  ]);

  // Reconnect function
  const reconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    subscribedRoomsRef.current.clear();
    connect();
  }, [connect]);

  // Effect to connect on mount
  useEffect(() => {
    const cleanup = connect();
    return () => {
      cleanup?.();
    };
  }, [connect]);

  // Effect to handle classroom subscription changes
  useEffect(() => {
    const socket = socketRef.current;
    if (!socket || !isConnected) return;

    // Get current subscriptions
    const currentSubs = subscribedRoomsRef.current;
    const newClassroomIds = new Set(classroomIds);

    // Subscribe to new classrooms
    classroomIds.forEach((id) => {
      if (!currentSubs.has(id)) {
        subscribeToClassroom(socket, id);
      }
    });

    // Unsubscribe from removed classrooms
    currentSubs.forEach((id) => {
      if (!newClassroomIds.has(id)) {
        unsubscribeFromClassroom(socket, id);
      }
    });
  }, [classroomIds, isConnected, subscribeToClassroom, unsubscribeFromClassroom]);

  return {
    isConnected,
    isConnecting,
    error,
    events,
    onlineStudents,
    clearEvents,
    reconnect,
  };
}

export default useClassroomRealtime;
