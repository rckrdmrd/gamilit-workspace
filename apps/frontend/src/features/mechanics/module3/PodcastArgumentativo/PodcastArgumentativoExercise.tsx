import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Mic, Square, FileAudio } from 'lucide-react';
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

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: number) => void;
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
  const [exercise, setExercise] = useState<PodcastExercise | null>(null);
  const [recording, setRecording] = useState<Recording>({
    id: '',
    audioBlob: null,
    transcription: '',
    analysis: null,
    duration: 0,
  });
  const [isRecording, setIsRecording] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [timer, setTimer] = useState(0);
  const [analysis, setAnalysis] = useState<ArgumentAnalysis | null>(null);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [scriptText, setScriptText] = useState('');
  const [selectedTopic, setSelectedTopic] = useState<{ id: string; text: string } | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | undefined>(undefined);
  const [feedback, setFeedback] = useState<any>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const actionsRef = useRef<any>(null);

  useEffect(() => {
    loadExercise();
  }, []);

  // Recording timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isRecording) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [recording, currentScore]);

  // Update progress
  useEffect(() => {
    const progress = calculateProgress();
    onProgressUpdate?.(progress);

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);
  }, [recording, analysis]);

  const calculateProgress = () => {
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
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      const chunks: BlobPart[] = [];

      mediaRecorder.ondataavailable = (e) => chunks.push(e.data);
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm' });
        setRecording((prev) => ({ ...prev, audioBlob: blob, duration: timer }));
      };

      mediaRecorder.start();
      setIsRecording(true);
      setTimer(0);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('No se pudo acceder al micrófono. Por favor verifica los permisos.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach((track) => track.stop());
      setIsRecording(false);

      // Generar URL del audio grabado (simulado en este caso)
      // En producción, aquí subirías el blob a un servidor y obtendrías la URL real
      if (recording.audioBlob) {
        const url = URL.createObjectURL(recording.audioBlob);
        setAudioUrl(url);
      }
    }
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
        audioUrl: audioUrl || undefined,
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
    setRecording({ id: '', audioBlob: null, transcription: '', analysis: null, duration: 0 });
    setAnalysis(null);
    setCurrentScore(0);
    setTimer(0);
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
                {formatTime(timer)}
              </div>
              <div className="text-detective-sm text-detective-text-secondary">
                Tiempo límite: {formatTime(exercise.timeLimit)}
              </div>
            </div>

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
