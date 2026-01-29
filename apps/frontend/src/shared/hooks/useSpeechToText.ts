import { useState, useRef, useCallback, useEffect } from 'react';

/**
 * Speech-to-Text Hook using Web Speech API
 *
 * Browser Support:
 * - Chrome/Edge: Full support via webkitSpeechRecognition
 * - Firefox: Partial support (may require flags)
 * - Safari: iOS 14.5+ with experimental support
 *
 * @module useSpeechToText
 */

/**
 * Speech recognition error types
 */
export interface SpeechError {
  type:
    | 'not_supported'
    | 'permission_denied'
    | 'network'
    | 'audio_capture'
    | 'no_speech'
    | 'aborted'
    | 'unknown';
  message: string;
  userAction: string;
}

/**
 * Speech recognition state
 */
export type SpeechState = 'idle' | 'listening' | 'processing' | 'finished';

/**
 * Supported languages for speech recognition
 */
export type SpeechLanguage = 'es-MX' | 'es-ES' | 'en-US' | 'en-GB';

/**
 * Hook configuration options
 */
export interface UseSpeechToTextOptions {
  language?: SpeechLanguage;
  continuous?: boolean;
  interimResults?: boolean;
  maxAlternatives?: number;
}

/**
 * Hook return type
 */
export interface UseSpeechToTextReturn {
  // State
  state: SpeechState;
  transcript: string;
  interimTranscript: string;
  confidence: number;
  error: SpeechError | null;

  // Actions
  startListening: () => void;
  stopListening: () => void;
  resetTranscript: () => void;

  // Info
  isSupported: boolean;
  isListening: boolean;
}

// Type declarations for Web Speech API (not in standard TypeScript lib)
interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message?: string;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognitionInstance extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  maxAlternatives: number;
  grammars?: unknown;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onerror: ((event: SpeechRecognitionErrorEvent) => void) | null;
  onend: (() => void) | null;
  onstart: (() => void) | null;
  onspeechend: (() => void) | null;
}

declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognitionInstance;
    webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
  }
}

/**
 * Map Web Speech API error codes to user-friendly messages
 */
function mapSpeechError(errorCode: string): SpeechError {
  const errorMap: Record<string, SpeechError> = {
    'not-allowed': {
      type: 'permission_denied',
      message: 'Permiso de microfono denegado',
      userAction:
        'Por favor habilita el acceso al microfono en la configuracion de tu navegador.',
    },
    'service-not-allowed': {
      type: 'permission_denied',
      message: 'Servicio de reconocimiento de voz no permitido',
      userAction: 'Verifica que tu navegador tenga permisos para usar el servicio de voz.',
    },
    network: {
      type: 'network',
      message: 'Error de red al procesar el audio',
      userAction: 'Verifica tu conexion a internet e intenta nuevamente.',
    },
    'audio-capture': {
      type: 'audio_capture',
      message: 'No se pudo capturar el audio',
      userAction:
        'Asegurate de que tu microfono este conectado y no este siendo usado por otra aplicacion.',
    },
    'no-speech': {
      type: 'no_speech',
      message: 'No se detecto ninguna voz',
      userAction: 'Por favor habla claramente cerca del microfono e intenta nuevamente.',
    },
    aborted: {
      type: 'aborted',
      message: 'Reconocimiento de voz cancelado',
      userAction: 'El proceso fue cancelado. Puedes intentar nuevamente.',
    },
    'language-not-supported': {
      type: 'not_supported',
      message: 'Idioma no soportado',
      userAction: 'El idioma seleccionado no esta disponible en tu navegador.',
    },
  };

  return (
    errorMap[errorCode] || {
      type: 'unknown',
      message: `Error desconocido: ${errorCode}`,
      userAction: 'Intenta recargar la pagina. Si el problema persiste, contacta al soporte.',
    }
  );
}

/**
 * useSpeechToText Hook
 *
 * @description Custom hook for speech-to-text using the Web Speech API.
 * Provides real-time transcription of spoken audio with support for
 * Spanish and English languages.
 *
 * @example
 * ```tsx
 * const {
 *   state,
 *   transcript,
 *   interimTranscript,
 *   startListening,
 *   stopListening,
 *   resetTranscript,
 *   isSupported,
 *   isListening,
 *   error
 * } = useSpeechToText({ language: 'es-MX' });
 *
 * // Start listening
 * <button onClick={startListening} disabled={!isSupported || isListening}>
 *   Start Recording
 * </button>
 *
 * // Stop listening
 * <button onClick={stopListening} disabled={!isListening}>
 *   Stop Recording
 * </button>
 *
 * // Show transcript
 * <p>{transcript}</p>
 * <p className="opacity-50">{interimTranscript}</p>
 * ```
 */
export function useSpeechToText(options: UseSpeechToTextOptions = {}): UseSpeechToTextReturn {
  const {
    language = 'es-MX',
    continuous = true,
    interimResults = true,
    maxAlternatives = 1,
  } = options;

  // Check for Web Speech API support
  const SpeechRecognition =
    typeof window !== 'undefined'
      ? window.SpeechRecognition || window.webkitSpeechRecognition
      : undefined;

  const isSupported = !!SpeechRecognition;

  // State
  const [state, setState] = useState<SpeechState>('idle');
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [confidence, setConfidence] = useState(0);
  const [error, setError] = useState<SpeechError | null>(null);

  // Refs
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isListeningRef = useRef(false);

  /**
   * Initialize speech recognition instance
   */
  const initRecognition = useCallback(() => {
    if (!SpeechRecognition) return null;

    const recognition = new SpeechRecognition();
    recognition.continuous = continuous;
    recognition.interimResults = interimResults;
    recognition.lang = language;
    recognition.maxAlternatives = maxAlternatives;

    recognition.onstart = () => {
      setState('listening');
      setError(null);
      isListeningRef.current = true;
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      let currentInterim = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const text = result[0].transcript;

        if (result.isFinal) {
          finalTranscript += text + ' ';
          setConfidence(result[0].confidence);
        } else {
          currentInterim += text;
        }
      }

      if (finalTranscript) {
        setTranscript((prev) => prev + finalTranscript);
      }
      setInterimTranscript(currentInterim);
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const speechError = mapSpeechError(event.error);
      setError(speechError);

      // Only set to idle for non-recoverable errors
      if (event.error !== 'no-speech') {
        setState('idle');
        isListeningRef.current = false;
      }
    };

    recognition.onend = () => {
      setInterimTranscript('');

      // If we're still supposed to be listening (continuous mode),
      // and didn't encounter a fatal error, restart
      if (isListeningRef.current && continuous) {
        try {
          recognition.start();
        } catch (_e) {
          // Already started or other error - ignore
          setState('finished');
          isListeningRef.current = false;
        }
      } else {
        setState('finished');
        isListeningRef.current = false;
      }
    };

    recognition.onspeechend = () => {
      setState('processing');
    };

    return recognition;
  }, [SpeechRecognition, continuous, interimResults, language, maxAlternatives]);

  /**
   * Start listening for speech
   */
  const startListening = useCallback(() => {
    if (!isSupported) {
      setError({
        type: 'not_supported',
        message: 'Tu navegador no soporta reconocimiento de voz',
        userAction:
          'Por favor usa Chrome, Edge o Safari actualizado para usar esta funcionalidad.',
      });
      return;
    }

    // Stop any existing recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        // Ignore
      }
    }

    // Create new recognition instance
    const recognition = initRecognition();
    if (!recognition) return;

    recognitionRef.current = recognition;
    isListeningRef.current = true;

    try {
      recognition.start();
    } catch (_e) {
      setError({
        type: 'unknown',
        message: 'Error al iniciar el reconocimiento de voz',
        userAction: 'Por favor recarga la pagina e intenta nuevamente.',
      });
      setState('idle');
      isListeningRef.current = false;
    }
  }, [isSupported, initRecognition]);

  /**
   * Stop listening for speech
   */
  const stopListening = useCallback(() => {
    isListeningRef.current = false;

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_e) {
        // Ignore - recognition may already be stopped
      }
    }

    setState('finished');
    setInterimTranscript('');
  }, []);

  /**
   * Reset transcript and state
   */
  const resetTranscript = useCallback(() => {
    setTranscript('');
    setInterimTranscript('');
    setConfidence(0);
    setError(null);
    setState('idle');
  }, []);

  /**
   * Cleanup on unmount
   */
  useEffect(() => {
    return () => {
      isListeningRef.current = false;
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_e) {
          // Ignore
        }
      }
    };
  }, []);

  return {
    // State
    state,
    transcript,
    interimTranscript,
    confidence,
    error,

    // Actions
    startListening,
    stopListening,
    resetTranscript,

    // Info
    isSupported,
    isListening: state === 'listening',
  };
}

export default useSpeechToText;
