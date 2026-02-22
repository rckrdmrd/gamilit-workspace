import { useState, useEffect, type MutableRefObject } from 'react';
import { Mic, Square, FileAudio, AlertCircle } from 'lucide-react';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@/shared/components/exercises/UnifiedExerciseLayout';
import { fetchPodcastExercise } from './podcastArgumentativoAPI';
import type { PodcastExercise, Recording } from './podcastArgumentativoTypes';
import type { FeedbackData } from '@/shared/components/mechanics/mechanicsTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';
import { uploadMedia } from '@/shared/api/mediaApi';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';
import { useAudioRecorder } from '@/shared/hooks/useAudioRecorder';
import { useSpeechToText } from '@/shared/hooks/useSpeechToText';

interface ExerciseProgressData {
  progress: {
    currentStep: number;
    totalSteps: number;
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  answers: {
    topicId: string;
    script: string;
    audioUrl?: string;
  };
}

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ExerciseProgressData) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
  }>;
}

interface ExerciseState {
  hasRecording: boolean;
  recordingDuration: number;
  currentScore: number;
}

export const PodcastArgumentativoExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  actionsRef,
}: ExerciseProps) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Audio Recorder Hook
  const {
    permissionState,
    recordingState,
    error: recorderError,
    audioBlob,
    audioUrl: hookAudioUrl,
    duration: recordingDuration,
    checkPermission,
    requestPermission,
    startRecording: startRecordingHook,
    stopRecording: stopRecordingHook,
    resetRecording: resetRecordingHook,
    isSupported,
    isRecording,
    isSecureContext,
  } = useAudioRecorder();

  // CORRECCION-006: Web Speech API integration for real-time transcription
  const {
    transcript: speechTranscript,
    interimTranscript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: isSpeechSupported,
    isListening,
    error: speechError,
    confidence: _speechConfidence,
  } = useSpeechToText({ language: 'es-MX', continuous: true, interimResults: true }); const { submitAsync } = useExerciseSubmission(exerciseId);


  const [exercise, setExercise] = useState<PodcastExercise | null>(null);
  const [recording, setRecording] = useState<Recording>({
    id: '',
    audioBlob: null,
    transcription: '',
    analysis: null,
    duration: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [scriptText, setScriptText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; text: string } | null>(null);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    loadExercise();
    checkPermission(); // Check permission on mount
  }, [checkPermission]);

  // Sync audioBlob from hook to recording state
  useEffect(() => {
    if (audioBlob && recordingState === 'stopped') {
      setRecording((prev) => ({
        ...prev,
        audioBlob,
        duration: recordingDuration,
      }));
    }
  }, [audioBlob, recordingState, recordingDuration]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, currentScore]);

  // Update progress and answers
  useEffect(() => {
    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    // Determine current script (manual text or transcription)
    const currentScript = scriptText || recording.transcription || '';

    // Calculate progress steps
    const hasScript = currentScript.length >= 200;
    const currentStep = hasScript ? 1 : 0;
    const totalSteps = 1;

    // Send progress with answers in the new format
    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep,
          totalSteps,
          score: currentScore,
          hintsUsed: 0,
          timeSpent: elapsed,
        },
        answers: {
          topicId: selectedTopic?.id || 'topic-1',
          script: currentScript,
          audioUrl: hookAudioUrl || undefined,
        },
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, scriptText, currentScore, selectedTopic, hookAudioUrl]);

  const loadExercise = async () => {
    const data = await fetchPodcastExercise('podcast-1');
    setExercise(data);
    // Inicializar tema seleccionado con el del ejercicio
    if (data?.topic) {
      setSelectedTopic({ id: 'topic-1', text: data.topic });
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      hasRecording: recording.audioBlob !== null,
      recordingDuration: recording.duration,
      currentScore,
    };
    saveProgressUtil(exerciseId, state);
  };

  // CORRECCION-006: Start both audio recording and speech recognition
  const startRecording = async () => {
    await startRecordingHook();
    // Start speech-to-text if supported
    if (isSpeechSupported) {
      startListening();
    }
  };

  // CORRECCION-006: Stop both audio recording and speech recognition
  const stopRecording = () => {
    stopRecordingHook();
    // Stop speech-to-text
    if (isSpeechSupported) {
      stopListening();
    }
  };

  const handleComplete = async () => {
    // Validaci\u00f3n de autenticaci\u00f3n
    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de autenticaci\u00f3n',
        message: 'Debes estar autenticado para enviar el ejercicio.',
        isCorrect: false,
      });
      setShowFeedback(true);
      return;
    }

    // Determinar el gui\u00f3n a enviar (escrito manualmente o transcripci\u00f3n del audio)
    const finalScript = scriptText || recording.transcription;

    // Validaci\u00f3n de longitud m\u00ednima del gui\u00f3n (200 caracteres)
    if (!finalScript || finalScript.length < 200) {
      setFeedback({
        type: 'error',
        title: 'Gui\u00f3n muy corto',
        message: `El gui\u00f3n debe tener al menos 200 caracteres. Actualmente tiene ${finalScript?.length || 0} caracteres.`,
        isCorrect: false,
      });
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Upload audio blob to get a server URL (instead of sending blob: URL)
      let serverAudioUrl: string | undefined = undefined;
      if (audioBlob) {
        try {
          const audioFile = new File(
            [audioBlob],
            `podcast-${exerciseId}-${Date.now()}.webm`,
            { type: audioBlob.type || 'audio/webm' },
          );
          const uploadResult = await uploadMedia(audioFile, {
            type: 'audio',
            exerciseId,
          });
          serverAudioUrl = uploadResult.url;
        } catch (_uploadError) {
          setFeedback({
            type: 'error',
            title: 'Error al Subir Audio',
            message: 'No se pudo subir el archivo de audio. Por favor intenta nuevamente.',
          });
          setShowFeedback(true);
          return;
        } finally {
          setIsUploading(false);
        }
      } else {
        setIsUploading(false);
      }

      // Preparar respuestas seg\u00fan el formato PodcastArgumentativoAnswers
      const answers = {
        topicId: selectedTopic?.id || 'topic-1',
        script: finalScript,
        audioUrl: serverAudioUrl || undefined,
      };

      // Enviar al backend
      const response = await submitAsync(answers);

      // CORRECCION-001: Verificar si requiere revision manual del maestro
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        // Mostrar mensaje de "en espera de revision"
        setFeedback({
          type: 'info',
          title: 'Ejercicio Enviado',
          message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          score: undefined, // No mostrar score aun
          showConfetti: false,
          xpEarned: 0,
          mlCoinsEarned: 0,
          pendingReview: true,
        });

        setShowFeedback(true);

        // Sync pero sin mostrar rewards
        await syncAndInvalidate();

        return;
      }

      // Flujo normal: ejercicio auto-calificado
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      // Crear objeto de feedback con rewards
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '\u00a1Excelente Argumentaci\u00f3n!'
          : response.score >= 70
            ? 'Buen Trabajo'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has completado el podcast argumentativo con ${response.score} puntos.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: rewards.xp || 0,
        mlCoinsEarned: rewards.mlCoins || 0,
      });

      // Mostrar feedback con el score del backend
      setShowFeedback(true);
      setCurrentScore(response.score);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un error al enviar tu podcast. Por favor intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    resetRecordingHook();
    resetTranscript();
    setRecording({ id: '', audioBlob: null, transcription: '', analysis: null, duration: 0 });
    setCurrentScore(0);
    setScriptText('');
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, currentScore]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!exercise) {
    return (
      <div className="from-detective-orange-50 to-detective-blue-50 flex h-screen items-center justify-center bg-gradient-to-br">
        <div className="text-detective-lg text-detective-text-secondary">Cargando ejercicio...</div>
      </div>
    );
  }

  return (
    <>
      <UnifiedExerciseLayout
        title="Podcast Argumentativo"
        description={exercise.topic}
        icon={<FileAudio className="h-8 w-8" />}
        headerChildren={
          <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm mt-3">
            <p>{exercise.prompt}</p>
          </div>
        }
        cardPadding="lg"
      >
        <div className="space-y-6">
          {/* Recording Controls */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-3xl sm:text-6xl font-bold text-detective-orange">
                {formatTime(recordingDuration)}
              </div>
              <div className="text-detective-sm text-detective-text-secondary">
                Tiempo l\u00edmite: {formatTime(exercise.timeLimit)}
              </div>
            </div>

            {/* HTTPS Required */}
            {!isSecureContext && (
              <div className="mb-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <h4 className="mb-1 font-semibold text-amber-900">Conexi\u00f3n Segura Requerida</h4>
                    <p className="text-sm text-amber-700">
                      La grabaci\u00f3n de audio requiere una conexi\u00f3n segura (HTTPS). Contacta al
                      administrador del sistema para habilitar HTTPS en el servidor.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Unsupported Browser */}
            {isSecureContext && !isSupported && (
              <div className="mb-6 rounded-lg border-2 border-detective-danger/20 bg-detective-danger/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-detective-danger" />
                  <div>
                    <h4 className="mb-1 font-semibold text-red-900">Navegador No Soportado</h4>
                    <p className="text-sm text-detective-danger">
                      Tu navegador no soporta grabaci\u00f3n de audio. Por favor usa Chrome, Firefox o
                      Edge actualizado.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Permission Denied */}
            {permissionState === 'denied' && (
              <div className="mb-6 rounded-lg border-2 border-amber-200 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-amber-600" />
                  <div>
                    <h4 className="mb-1 font-semibold text-amber-900">Permisos Requeridos</h4>
                    <p className="mb-3 text-sm text-amber-700">
                      Necesitas habilitar el acceso al micr\u00f3fono para grabar tu podcast.
                    </p>
                    <p className="text-xs text-amber-600">
                      <strong>C\u00f3mo habilitar:</strong>
                      <br />
                      1. Haz clic en el \u00edcono de candado o informaci\u00f3n (i) en la barra de
                      direcciones
                      <br />
                      2. Busca la opci\u00f3n de &quot;Micr\u00f3fono&quot;
                      <br />
                      3. Selecciona &quot;Permitir&quot;
                      <br />
                      4. Recarga la p\u00e1gina
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recorder Error */}
            {recorderError && (
              <div className="mb-6 rounded-lg border-2 border-detective-danger/20 bg-detective-danger/10 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-detective-danger" />
                  <div>
                    <h4 className="mb-1 font-semibold text-red-900">{recorderError.message}</h4>
                    <p className="text-sm text-detective-danger">{recorderError.userAction}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Permission Prompt */}
            {permissionState === 'prompt' && isSupported && !recording.audioBlob && (
              <div className="mb-6 flex justify-center">
                <DetectiveButton
                  variant="primary"
                  onClick={requestPermission}
                  icon={<Mic className="h-6 w-6" />}
                  className="bg-detective-blue hover:bg-detective-blue/90"
                >
                  Permitir Acceso al Micr\u00f3fono
                </DetectiveButton>
              </div>
            )}

            {/* Recording Buttons */}
            {permissionState === 'granted' && (
              <div className="mb-6 flex justify-center gap-4">
                {!isRecording && !recording.audioBlob && (
                  <DetectiveButton
                    variant="primary"
                    onClick={startRecording}
                    icon={<Mic className="h-6 w-6" />}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Iniciar Grabaci\u00f3n
                  </DetectiveButton>
                )}
                {isRecording && (
                  <DetectiveButton
                    variant="secondary"
                    onClick={stopRecording}
                    icon={<Square className="h-6 w-6" />}
                    className="animate-pulse bg-gray-800 hover:bg-gray-900"
                  >
                    Detener Grabaci\u00f3n
                  </DetectiveButton>
                )}
              </div>
            )}

            {/* CORRECCION-006: Real-time transcription display while recording */}
            {(isRecording || isListening) && isSpeechSupported && (
              <div className="mt-4 rounded-lg border-2 border-dashed border-detective-orange/50 bg-orange-50 p-4">
                <h4 className="mb-2 flex items-center gap-2 text-detective-sm font-semibold text-detective-orange">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500"></span>
                  Transcripcion en Tiempo Real
                </h4>
                <p className="min-h-[3rem] text-detective-sm text-detective-text">
                  {speechTranscript || interimTranscript || (
                    <span className="italic text-detective-text-secondary">Esperando audio...</span>
                  )}
                  {interimTranscript && speechTranscript && (
                    <span className="text-detective-text-secondary"> {interimTranscript}</span>
                  )}
                </p>
                {speechError && (
                  <p className="mt-2 text-detective-xs text-red-500">
                    {speechError.message}
                  </p>
                )}
              </div>
            )}

            {/* Speech API not supported warning */}
            {isRecording && !isSpeechSupported && (
              <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                <p className="text-detective-xs text-amber-700">
                  La transcripcion automatica no esta disponible en tu navegador.
                  El audio se grabara pero la transcripcion sera aproximada.
                </p>
              </div>
            )}

            {/* Manual script textarea -- always visible as fallback */}
            <div className="mt-4 rounded-lg border-2 border-detective-blue/30 bg-blue-50 p-4">
              <h4 className="mb-2 font-semibold text-detective-blue">
                {isSpeechSupported
                  ? 'Tambi\u00e9n puedes escribir o editar tu guion aqu\u00ed:'
                  : 'Escribe tu guion manualmente:'}
              </h4>
              <textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder="Escribe aqui el guion de tu podcast argumentativo (minimo 200 caracteres)..."
                className="w-full resize-none rounded-lg border-2 border-detective-border p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                rows={6}
              />
              <p className="mt-1 text-right text-detective-xs text-detective-text-secondary">
                {scriptText.length}/200 caracteres minimo
              </p>
            </div>

            {recording.audioBlob && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 rounded-lg bg-detective-bg p-4">
                  <FileAudio className="h-6 w-6 text-detective-orange" />
                  <span className="text-detective-base font-medium">
                    Grabaci\u00f3n completada ({formatTime(recording.duration)})
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Transcription */}
          {recording.transcription && (
            <div className="rounded-detective border-2 border-detective-border-light bg-white p-3 sm:p-6">
              <h3 className="mb-3 text-detective-lg font-semibold text-detective-blue">
                Transcripci\u00f3n
              </h3>
              <p className="rounded-lg bg-detective-bg p-4 text-detective-sm leading-relaxed text-detective-text">
                {recording.transcription}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            {onExit && (
              <DetectiveButton variant="secondary" onClick={onExit}>
                Salir
              </DetectiveButton>
            )}
            <DetectiveButton variant="gold" onClick={handleReset}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={(!scriptText || scriptText.length < 200) || isSubmitting || isUploading}
              loading={isSubmitting || isUploading}
            >
              {isUploading ? 'Subiendo audio...' : isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
            </DetectiveButton>
          </div>
        </div>
      </UnifiedExerciseLayout>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={{
            ...feedback,
            xpEarned: feedback.xpEarned || 0,
            mlCoinsEarned: feedback.mlCoinsEarned || 0,
          }}
          onClose={() => {
            setShowFeedback(false);
            // Llamar a onComplete despu\u00e9s de cerrar el feedback si el score es aprobatorio
            if (feedback.type === 'success' || (feedback.score && feedback.score >= 70)) {
              onComplete?.(feedback.score || currentScore, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default PodcastArgumentativoExercise;
