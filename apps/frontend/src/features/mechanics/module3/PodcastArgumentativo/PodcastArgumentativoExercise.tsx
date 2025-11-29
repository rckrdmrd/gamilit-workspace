import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, FileAudio, AlertCircle } from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { fetchPodcastExercise, analyzeRecording } from './podcastArgumentativoAPI';
import type { PodcastExercise, Recording } from './podcastArgumentativoTypes';
import type { ArgumentAnalysis } from '../../shared/aiTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { useAudioRecorder } from '@/shared/hooks/useAudioRecorder';

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
}

interface ExerciseState {
  hasRecording: boolean;
  recordingDuration: number;
  currentScore: number;
  analyzed: boolean;
}

export const PodcastArgumentativoExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
}) => {
  const { user } = useAuth();
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();

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
  } = useAudioRecorder();

  const [exercise, setExercise] = useState<PodcastExercise | null>(null);
  const [recording, setRecording] = useState<Recording>({
    id: '',
    audioBlob: null,
    transcription: '',
    analysis: null,
    duration: 0,
  });
  const [analyzing, setAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [scriptText, setScriptText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; text: string } | null>(null);
  const [feedback, setFeedback] = useState<any>(null);
  const actionsRef = useRef<any>(null);

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
    const hasAnalysis = analysis !== null;
    const currentStep = (hasScript ? 1 : 0) + (hasAnalysis ? 1 : 0);
    const totalSteps = 2; // Script + Analysis

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
  }, [recording, analysis, scriptText, currentScore, selectedTopic, hookAudioUrl]);

  const _calculateProgress = () => {
    let progress = 0;
    if (recording.audioBlob) progress += 50;
    if (analysis) progress += 50;
    return progress;
  };

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
      analyzed: analysis !== null,
    };
    saveProgressUtil(exerciseId, state);
  };

  const startRecording = async () => {
    await startRecordingHook();
  };

  const stopRecording = () => {
    stopRecordingHook();
  };

  const handleAnalyze = async () => {
    if (!recording.audioBlob) return;
    setAnalyzing(true);
    try {
      const mockTranscription =
        'Marie Curie fue una científica extraordinaria que superó innumerables obstáculos. Su trabajo con elementos radiactivos revolucionó la física y la medicina. A pesar de enfrentar discriminación de género, perseveró y ganó dos Premios Nobel. Su legado inspira a científicas de todo el mundo.';
      const result = await analyzeRecording(mockTranscription);
      setRecording((prev) => ({ ...prev, transcription: mockTranscription }));
      setAnalysis(result);

      // Guardar la transcripción como scriptText si no hay texto escrito manualmente
      if (!scriptText) {
        setScriptText(mockTranscription);
      }

      // Calculate score based on analysis metrics
      const avgScore = (result.clarity + result.logic + result.evidence + result.persuasion) / 4;
      const newScore = Math.round(avgScore * 100);
      setCurrentScore(newScore);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleComplete = async () => {
    // Validación de autenticación
    if (!user?.id) {
      alert('Debes estar autenticado para enviar el ejercicio.');
      return;
    }

    // Determinar el guión a enviar (escrito manualmente o transcripción del audio)
    const finalScript = scriptText || recording.transcription;

    // Validación de longitud mínima del guión (200 caracteres)
    if (!finalScript || finalScript.length < 200) {
      alert(
        `El guión debe tener al menos 200 caracteres. Actualmente tiene ${finalScript?.length || 0} caracteres.`,
      );
      return;
    }

    setIsSubmitting(true);

    try {
      // Preparar respuestas según el formato PodcastArgumentativoAnswers
      const answers = {
        topicId: selectedTopic?.id || 'topic-1',
        script: finalScript,
        audioUrl: hookAudioUrl || undefined,
      };

      // Enviar al backend
      const response = await submitExercise(exercise?.id || exerciseId, user.id, answers);

      // Extraer rewards de la respuesta
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      // Crear objeto de feedback con rewards
      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Excelente Argumentación!'
          : response.score >= 70
            ? 'Buen Trabajo'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has completado el podcast argumentativo con ${response.score} puntos.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      });

      // Mostrar feedback con el score del backend
      setShowFeedback(true);
      setCurrentScore(response.score);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await fetchUserProgress();
      await fetchBalance();

      console.log('✅ [PodcastArgumentativo] Submission successful:', {
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('[PodcastArgumentativo] Error al enviar:', error);
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
    resetRecordingHook(); // Reset hook state
    setRecording({ id: '', audioBlob: null, transcription: '', analysis: null, duration: 0 });
    setAnalysis(null);
    setCurrentScore(0);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
        getState: () => ({ recording, currentScore, analysis }),
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recording, currentScore, analysis]);

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
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-detective-lg bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white shadow-detective-lg"
          >
            <div className="mb-2 flex items-center gap-3">
              <FileAudio className="h-8 w-8" />
              <h1 className="text-detective-3xl font-bold">Podcast Argumentativo</h1>
            </div>
            <p className="mb-2 text-detective-lg">{exercise.topic}</p>
            <div className="rounded-lg bg-white/20 p-3 backdrop-blur-sm">
              <p>{exercise.prompt}</p>
            </div>
          </motion.div>

          {/* Recording Controls */}
          <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-6">
            <div className="mb-6 text-center">
              <div className="mb-2 text-6xl font-bold text-detective-orange">
                {formatTime(recordingDuration)}
              </div>
              <div className="text-detective-sm text-detective-text-secondary">
                Tiempo límite: {formatTime(exercise.timeLimit)}
              </div>
            </div>

            {/* Unsupported Browser */}
            {!isSupported && (
              <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h4 className="mb-1 font-semibold text-red-900">Navegador No Soportado</h4>
                    <p className="text-sm text-red-700">
                      Tu navegador no soporta grabación de audio. Por favor usa Chrome, Firefox o
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
                      Necesitas habilitar el acceso al micrófono para grabar tu podcast.
                    </p>
                    <p className="text-xs text-amber-600">
                      <strong>Cómo habilitar:</strong>
                      <br />
                      1. Haz clic en el ícono de candado o información (i) en la barra de
                      direcciones
                      <br />
                      2. Busca la opción de &quot;Micrófono&quot;
                      <br />
                      3. Selecciona &quot;Permitir&quot;
                      <br />
                      4. Recarga la página
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Recorder Error */}
            {recorderError && (
              <div className="mb-6 rounded-lg border-2 border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
                  <div>
                    <h4 className="mb-1 font-semibold text-red-900">{recorderError.message}</h4>
                    <p className="text-sm text-red-700">{recorderError.userAction}</p>
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
                  Permitir Acceso al Micrófono
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
                    Iniciar Grabación
                  </DetectiveButton>
                )}
                {isRecording && (
                  <DetectiveButton
                    variant="secondary"
                    onClick={stopRecording}
                    icon={<Square className="h-6 w-6" />}
                    className="animate-pulse bg-gray-800 hover:bg-gray-900"
                  >
                    Detener Grabación
                  </DetectiveButton>
                )}
              </div>
            )}

            {recording.audioBlob && (
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-4 rounded-lg bg-detective-bg p-4">
                  <FileAudio className="h-6 w-6 text-detective-orange" />
                  <span className="text-detective-base font-medium">
                    Grabación completada ({formatTime(recording.duration)})
                  </span>
                </div>
                <DetectiveButton
                  variant="primary"
                  onClick={handleAnalyze}
                  disabled={analyzing}
                  loading={analyzing}
                  className="w-full"
                >
                  {analyzing ? 'Analizando...' : 'Analizar Podcast'}
                </DetectiveButton>
              </div>
            )}
          </div>

          {/* Transcription */}
          {recording.transcription && (
            <div className="rounded-detective border-2 border-detective-border-light bg-white p-6">
              <h3 className="mb-3 text-detective-lg font-semibold text-detective-blue">
                Transcripción
              </h3>
              <p className="rounded-lg bg-gray-50 p-4 text-detective-sm leading-relaxed text-detective-text">
                {recording.transcription}
              </p>
            </div>
          )}

          {/* Analysis Results */}
          {analysis && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div className="rounded-detective border-2 border-detective-border-light bg-white p-6">
                <h3 className="mb-4 text-detective-lg font-semibold text-detective-blue">
                  Análisis del Argumento
                </h3>

                {/* Metrics Grid */}
                <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
                  {[
                    { label: 'Claridad', value: analysis.clarity, color: 'text-blue-600' },
                    { label: 'Lógica', value: analysis.logic, color: 'text-green-600' },
                    { label: 'Evidencia', value: analysis.evidence, color: 'text-orange-600' },
                    { label: 'Persuasión', value: analysis.persuasion, color: 'text-purple-600' },
                  ].map((metric) => (
                    <div key={metric.label} className="rounded-lg bg-detective-bg p-4 text-center">
                      <div className={`text-3xl font-bold ${metric.color} mb-1`}>
                        {Math.round(metric.value * 100)}
                      </div>
                      <div className="text-detective-xs text-detective-text-secondary">
                        {metric.label}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Feedback */}
                <div className="mb-4">
                  <h4 className="mb-2 text-detective-base font-semibold">Retroalimentación</h4>
                  <ul className="space-y-1">
                    {analysis.feedback.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-detective-sm">
                        <span className="text-green-600">✓</span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Improvements */}
                <div>
                  <h4 className="mb-2 text-detective-base font-semibold">Áreas de Mejora</h4>
                  <ul className="space-y-1">
                    {analysis.improvements.map((i, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-detective-sm">
                        <span className="text-detective-orange">→</span>
                        <span>{i}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
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
              disabled={!analysis || isSubmitting}
              loading={isSubmitting}
            >
              {isSubmitting ? 'Enviando...' : 'Completar Ejercicio'}
            </DetectiveButton>
          </div>
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            // Llamar a onComplete después de cerrar el feedback si el score es aprobatorio
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
