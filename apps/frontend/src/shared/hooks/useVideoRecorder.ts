import { useState, useRef, useEffect, useCallback } from 'react';

/**
 * Video Recorder Error Types
 */
export interface VideoRecorderError {
  type: 'permission_denied' | 'device_not_found' | 'device_in_use' | 'not_supported' | 'unknown';
  message: string;
  userAction: string; // What the user should do to resolve
}

/**
 * Video constraints for recording
 */
export interface VideoConstraints {
  width?: number;
  height?: number;
  frameRate?: number;
  facingMode?: 'user' | 'environment';
}

/**
 * Get supported video MIME type
 * Different browsers support different formats:
 * - Chrome/Firefox/Edge: video/webm
 * - Safari: video/mp4
 */
function _getSupportedMimeType(): string | undefined {
  const mimeTypes = [
    'video/webm;codecs=vp9,opus',
    'video/webm;codecs=vp8,opus',
    'video/webm',
    'video/mp4',
    'video/ogg',
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
 * useVideoRecorder Hook Return Type
 */
export interface UseVideoRecorderReturn {
  // Estados
  permissionState: PermissionState;
  recordingState: RecordingState;
  error: VideoRecorderError | null;

  // Datos
  videoBlob: Blob | null;
  videoUrl: string | null;
  previewUrl: string | null; // For live preview
  duration: number; // segundos de grabación

  // Acciones
  checkPermission: () => Promise<PermissionState>;
  requestPermission: () => Promise<boolean>;
  startRecording: (constraints?: VideoConstraints) => Promise<void>;
  stopRecording: () => void;
  pauseRecording: () => void;
  resumeRecording: () => void;
  resetRecording: () => void;

  // Info
  isSupported: boolean;
  isRecording: boolean;
  isPaused: boolean;
  isSecureContext: boolean; // True if running on HTTPS or localhost
}

/**
 * Create error message for user
 */
function createErrorMessage(error: unknown): VideoRecorderError {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          type: 'permission_denied',
          message: 'Permiso de cámara/micrófono denegado',
          userAction:
            'Por favor habilita la cámara y micrófono en la configuración de tu navegador. Busca el ícono de candado o información (i) en la barra de direcciones.',
        };
      case 'NotFoundError':
        return {
          type: 'device_not_found',
          message: 'No se encontró una cámara',
          userAction:
            'Asegúrate de tener una cámara conectada a tu dispositivo. Verifica la configuración de video en tu sistema operativo.',
        };
      case 'NotReadableError':
        return {
          type: 'device_in_use',
          message: 'La cámara está siendo usada por otra aplicación',
          userAction:
            'Cierra otras aplicaciones que puedan estar usando la cámara (Zoom, Teams, Discord, etc.) e intenta nuevamente.',
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
 * useVideoRecorder Hook
 *
 * @description Custom hook for video recording with permission management,
 * live preview, and comprehensive error handling.
 *
 * Features:
 * - Checks browser support for MediaRecorder API
 * - Verifies camera/microphone permissions before requesting access
 * - Handles all types of getUserMedia errors with user-friendly messages
 * - Tracks recording duration
 * - Provides live preview stream
 * - Supports pause/resume functionality
 * - Cleans up media streams on unmount
 * - Provides video blob and URL for playback
 * - Configurable video constraints (resolution, framerate, facing mode)
 *
 * @example
 * ```tsx
 * const {
 *   permissionState,
 *   recordingState,
 *   error,
 *   videoBlob,
 *   videoUrl,
 *   previewUrl,
 *   duration,
 *   checkPermission,
 *   requestPermission,
 *   startRecording,
 *   stopRecording,
 *   pauseRecording,
 *   resumeRecording,
 *   resetRecording,
 *   isSupported,
 *   isRecording,
 *   isPaused
 * } = useVideoRecorder();
 *
 * // Check permission on mount
 * useEffect(() => {
 *   checkPermission();
 * }, [checkPermission]);
 *
 * // Request permission
 * if (permissionState === 'prompt') {
 *   return <button onClick={requestPermission}>Allow Camera</button>;
 * }
 *
 * // Record video with preview
 * if (permissionState === 'granted') {
 *   return (
 *     <>
 *       {previewUrl && <video src={previewUrl} autoPlay muted />}
 *       {!isRecording && <button onClick={() => startRecording()}>Start Recording</button>}
 *       {isRecording && !isPaused && <button onClick={pauseRecording}>Pause</button>}
 *       {isPaused && <button onClick={resumeRecording}>Resume</button>}
 *       {isRecording && <button onClick={stopRecording}>Stop Recording</button>}
 *       {videoUrl && <video src={videoUrl} controls />}
 *     </>
 *   );
 * }
 * ```
 */
export function useVideoRecorder(): UseVideoRecorderReturn {
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
  const [error, setError] = useState<VideoRecorderError | null>(null);
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [duration, setDuration] = useState(0);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<BlobPart[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  /**
   * Check camera/microphone permission status
   */
  const checkPermission = useCallback(async (): Promise<PermissionState> => {
    if (!isSupported) {
      return 'unsupported';
    }

    try {
      // Try to use Permissions API if available
      if (navigator.permissions && navigator.permissions.query) {
        // Check both camera and microphone permissions
        const cameraResult = await navigator.permissions.query({ name: 'camera' as PermissionName });
        const micResult = await navigator.permissions.query({ name: 'microphone' as PermissionName });

        // Return the most restrictive permission state
        if (cameraResult.state === 'denied' || micResult.state === 'denied') {
          setPermissionState('denied');
          return 'denied';
        }
        if (cameraResult.state === 'granted' && micResult.state === 'granted') {
          setPermissionState('granted');
          return 'granted';
        }
        setPermissionState('prompt');
        return 'prompt';
      }

      // Fallback: permission state unknown, assume prompt
      setPermissionState('prompt');
      return 'prompt';
    } catch (_err) {
      // Permissions API not supported or failed
      setPermissionState('prompt');
      return 'prompt';
    }
  }, [isSupported]);

  /**
   * Request camera/microphone permission
   */
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Tu navegador no soporta grabación de video',
        userAction: 'Por favor usa Chrome, Firefox, Edge o Safari actualizado.',
      });
      return false;
    }

    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      // Create preview URL
      const previewObjectUrl = URL.createObjectURL(new MediaSource());
      setPreviewUrl(previewObjectUrl);

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
   * Start recording video
   */
  const startRecording = useCallback(async (constraints?: VideoConstraints): Promise<void> => {
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Tu navegador no soporta grabación de video',
        userAction: 'Por favor usa Chrome, Firefox, Edge o Safari actualizado.',
      });
      return;
    }

    try {
      setError(null);

      // Build video constraints
      const videoConstraints: MediaTrackConstraints = {
        width: constraints?.width || 1280,
        height: constraints?.height || 720,
        frameRate: constraints?.frameRate || 30,
      };

      if (constraints?.facingMode) {
        videoConstraints.facingMode = constraints.facingMode;
      }

      // Get media stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: videoConstraints,
        audio: true
      });
      streamRef.current = stream;

      // Create preview URL from stream
      const streamUrl = URL.createObjectURL(stream);
      setPreviewUrl(streamUrl);

      // Get supported MIME type
      const mimeType = _getSupportedMimeType();

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || 'video/webm',
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
        const blob = new Blob(chunksRef.current, { type: mimeType || 'video/webm' });
        const url = URL.createObjectURL(blob);
        setVideoBlob(blob);
        setVideoUrl(url);
        setRecordingState('stopped');

        // Stop timer
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }

        // Clean up preview
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl(null);
        }
      };

      mediaRecorder.onpause = () => {
        setRecordingState('paused');
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      };

      mediaRecorder.onresume = () => {
        setRecordingState('recording');
        // Resume timer
        timerRef.current = setInterval(() => {
          setDuration((prev) => prev + 1);
        }, 1000);
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
  }, [isSupported, previewUrl]);

  /**
   * Stop recording video
   */
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && (recordingState === 'recording' || recordingState === 'paused')) {
      mediaRecorderRef.current.stop();
      // Note: cleanup of stream will happen in useEffect cleanup
    }
  }, [recordingState]);

  /**
   * Pause recording
   */
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'recording') {
      mediaRecorderRef.current.pause();
    }
  }, [recordingState]);

  /**
   * Resume recording
   */
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current && recordingState === 'paused') {
      mediaRecorderRef.current.resume();
    }
  }, [recordingState]);

  /**
   * Reset recording state
   */
  const resetRecording = useCallback(() => {
    // Clean up old video URL
    if (videoUrl) {
      URL.revokeObjectURL(videoUrl);
    }

    // Clean up preview URL
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }

    // Reset state
    setVideoBlob(null);
    setVideoUrl(null);
    setPreviewUrl(null);
    setDuration(0);
    setRecordingState('idle');
    setError(null);
    chunksRef.current = [];
  }, [videoUrl, previewUrl]);

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

      // Revoke video URL
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }

      // Revoke preview URL
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [videoUrl, previewUrl]);

  return {
    // Estados
    permissionState,
    recordingState,
    error,

    // Datos
    videoBlob,
    videoUrl,
    previewUrl,
    duration,

    // Acciones
    checkPermission,
    requestPermission,
    startRecording,
    stopRecording,
    pauseRecording,
    resumeRecording,
    resetRecording,

    // Info
    isSupported,
    isRecording: recordingState === 'recording',
    isPaused: recordingState === 'paused',
    isSecureContext,
  };
}
