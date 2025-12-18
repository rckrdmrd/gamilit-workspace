import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Audio Recorder Error Types
 */
export interface AudioRecorderError {
  type: 'permission_denied' | 'device_not_found' | 'device_in_use' | 'not_supported' | 'unknown';
  message: string;
  userAction: string; // What the user should do to resolve
}

/**
 * Get supported audio MIME type
 * Different browsers support different formats:
 * - Chrome/Firefox/Edge: audio/webm
 * - Safari/iOS: audio/mp4 or audio/wav
 */
function _getSupportedMimeType(): string | undefined {
  const mimeTypes = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/mp4',
    'audio/ogg;codecs=opus',
    'audio/wav',
    'audio/mpeg',
  ];

  for (const mimeType of mimeTypes) {
    if (MediaRecorder.isTypeSupported(mimeType)) {
      return mimeType;
    }
  }

  return undefined;
}

/**
 * Recording State
 */
export type RecordingState = 'idle' | 'recording' | 'paused' | 'stopped';

/**
 * Permission State
 */
export type PermissionState = 'prompt' | 'granted' | 'denied' | 'unsupported';

/**
 * useAudioRecorder Hook Return Type
 */
export interface UseAudioRecorderReturn {
  // Estados
  permissionState: PermissionState;
  recordingState: RecordingState;
  error: AudioRecorderError | null;

  // Datos
  audioBlob: Blob | null;
  audioUrl: string | null;
  duration: number; // segundos de grabación

  // Acciones
  checkPermission: () => Promise<PermissionState>;
  requestPermission: () => Promise<boolean>;
  startRecording: () => Promise<void>;
  stopRecording: () => void;
  resetRecording: () => void;

  // Info
  isSupported: boolean;
  isRecording: boolean;
  isSecureContext: boolean; // True if running on HTTPS or localhost
}

/**
 * Create error message for user
 */
function createErrorMessage(error: unknown): AudioRecorderError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          type: 'permission_denied',
          message: 'Permiso de micrófono denegado',
          userAction:
            'Por favor habilita el micrófono en la configuración de tu navegador. Busca el ícono de candado o información (i) en la barra de direcciones.',
        };
      case 'NotFoundError':
        return {
          type: 'device_not_found',
          message: 'No se encontró un micrófono',
          userAction:
            'Asegúrate de tener un micrófono conectado a tu dispositivo. Verifica la configuración de audio en tu sistema operativo.',
        };
      case 'NotReadableError':
        return {
          type: 'device_in_use',
          message: 'El micrófono está siendo usado por otra aplicación',
          userAction:
            'Cierra otras aplicaciones que puedan estar usando el micrófono (Zoom, Teams, Discord, etc.) e intenta nuevamente.',
        };
      default:
        return {
          type: 'unknown',
          message: `Error desconocido: ${error.message}`,
          userAction:
            'Intenta recargar la página. Si el problema persiste, contacta al soporte técnico.',
        };
    }
  }

  return {
    type: 'unknown',
    message: error instanceof Error ? error.message : 'Error desconocido',
    userAction: 'Intenta recargar la página. Si el problema persiste, contacta al soporte técnico.',
  };
}

/**
 * useAudioRecorder Hook
 *
 * @description Custom hook for audio recording with permission management
 * and comprehensive error handling.
 *
 * Features:
 * - Checks browser support for MediaRecorder API
 * - Verifies microphone permissions before requesting access
 * - Handles all types of getUserMedia errors with user-friendly messages
 * - Tracks recording duration
 * - Cleans up media streams on unmount
 * - Provides audio blob and URL for playback
 *
 * @example
 * ```tsx
 * const {
 *   permissionState,
 *   recordingState,
 *   error,
 *   audioBlob,
 *   audioUrl,
 *   duration,
 *   checkPermission,
 *   requestPermission,
 *   startRecording,
 *   stopRecording,
 *   resetRecording,
 *   isSupported,
 *   isRecording
 * } = useAudioRecorder();
 *
 * // Check permission on mount
 * useEffect(() => {
 *   checkPermission();
 * }, [checkPermission]);
 *
 * // Request permission
 * if (permissionState === 'prompt') {
 *   return <button onClick={requestPermission}>Allow Microphone</button>;
 * }
 *
 * // Record audio
 * if (permissionState === 'granted') {
 *   return (
 *     <>
 *       {!isRecording && <button onClick={startRecording}>Start Recording</button>}
 *       {isRecording && <button onClick={stopRecording}>Stop Recording</button>}
 *       {audioUrl && <audio src={audioUrl} controls />}
 *     </>
 *   );
 * }
 * ```
 */
export function useAudioRecorder(): UseAudioRecorderReturn {
  // Check if we're in a secure context (HTTPS or localhost)
  const isSecureContext =
    typeof window !== 'undefined' &&
    (window.isSecureContext ||
      window.location.protocol === 'https:' ||
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1');

  // Check if MediaRecorder API is supported
  // Note: navigator.mediaDevices is only available in secure contexts (HTTPS)
  const isSupported =
    typeof navigator !== 'undefined' &&
    isSecureContext &&
    !!navigator.mediaDevices &&
    !!navigator.mediaDevices.getUserMedia &&
    typeof window.MediaRecorder !== 'undefined';

  // State
  const [permissionState, setPermissionState] = useState<PermissionState>(
    isSupported ? 'prompt' : 'unsupported',
  );
  const [recordingState, setRecordingState] = useState<RecordingState>('idle');
  const [error, setError] = useState<AudioRecorderError | null>(null);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Check microphone permission status
   */
  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    if (!isSupported) {
      return 'unsupported';
    }

    try {
      // Try to use Permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
        const state = result.state as PermissionState;
        setPermissionState(state);
        return state;
      }

      // Fallback: permission state unknown, assume prompt
      setPermissionState('prompt');
      return 'prompt';
    } catch (err) {
      // Permissions API not supported or failed
      setPermissionState('prompt');
      return 'prompt';
    }
  }, [isSupported]);

  /**
   * Request microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Tu navegador no soporta grabación de audio',
        userAction: 'Por favor usa Chrome, Firefox, Edge o Safari actualizado.',
      });
      return false;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Immediately stop the stream - we only wanted to request permission
      stream.getTracks().forEach((track) => track.stop());
      setPermissionState('granted');
      return true;
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);

      if (errorMessage.type === 'permission_denied') {
        setPermissionState('denied');
      }

      return false;
    }
  }, [isSupported]);

  /**
   * Start recording audio
   */
  const startRecording = useCallback(async (): Promise<void> => {
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Tu navegador no soporta grabación de audio',
        userAction: 'Por favor usa Chrome, Firefox, Edge o Safari actualizado.',
      });
      return;
    }

    try {
      setError(null);

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm',
      });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      // Event handlers
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioBlob(blob);
        setAudioUrl(url);
        setRecordingState('stopped');

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('MediaRecorder error:', event);
        setError({
          type: 'unknown',
          message: 'Error durante la grabación',
          userAction: 'Intenta nuevamente. Si el problema persiste, recarga la página.',
        });
        setRecordingState('idle');
      };

      // Start recording
      mediaRecorder.start();
      setRecordingState('recording');
      setPermissionState('granted');

      // Start duration timer
      setDuration(0);
      timerRef.current = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      const errorMessage = createErrorMessage(err);
      setError(errorMessage);

      if (errorMessage.type === 'permission_denied') {
        setPermissionState('denied');
      }

      setRecordingState('idle');
    }
  }, [isSupported]);

  /**
   * Stop recording audio
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.stop();
      // Note: cleanup of stream will happen in useEffect cleanup
    }
  }, [recordingState]);

  /**
   * Reset recording state
   */
  const resetRecording = useCallback(() => {
    // Clean up old audio URL
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }

    // Reset state
    setAudioBlob(null);
    setAudioUrl(null);
    setDuration(0);
    setRecordingState('idle');
    setError(null);
    chunksRef.current = [];
  }, [audioUrl]);

  /**
   * Cleanup on unmount or when recording stops
   */
  useEffect(() => {
    return () => {
      // Stop and clean up media stream
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Revoke audio URL
      if (audioUrl) {
        URL.revokeObjectURL(audioUrl);
      }
    };
  }, [audioUrl]);

  return {
    // Estados
    permissionState,
    recordingState,
    error,

    // Datos
    audioBlob,
    audioUrl,
    duration,

    // Acciones
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    resetRecording,

    // Info
    isSupported,
    isRecording: recordingState === 'recording',
    isSecureContext,
  };
}
