import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Grid3x3, Sparkles, Eye } from 'lucide-react';
import { DetectiveCard } from '@/shared/components/base/DetectiveCard';
import { DetectiveButton } from '@/shared/components/base/DetectiveButton';
import { FeedbackModal } from '@/shared/components/mechanics/FeedbackModal';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useRanksStore } from '@/features/gamification/ranks/store/ranksStore';
import { useEconomyStore } from '@/features/gamification/economy/store/economyStore';
import { fetchMatrixExercise, getAIPerspectives } from './matrizPerspectivasAPI';
import type { MatrixExercise } from './matrizPerspectivasTypes';
import { saveProgress as saveProgressUtil } from '@/shared/utils/storage';

interface ExerciseProps {
  exerciseId: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (progress: number) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
}

interface ExerciseState {
  perspectives: any[];
  currentScore: number;
  perspectivesGenerated: boolean;
}

// Answer format for backend submission
interface MatrizPerspectivasAnswers {
  questions: Record<string, string>; // { "q1": "respuesta", "q2": "respuesta", "q3": "respuesta" }
}

export const MatrizPerspectivasExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
}) => {
  const { user } = useAuth();
  const { fetchUserProgress } = useRanksStore();
  const { fetchBalance } = useEconomyStore();
  const [exercise, setExercise] = useState<MatrixExercise | null>(null);
  const [perspectives, setPerspectives] = useState<any[]>(initialData?.perspectives || []);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [currentScore, setCurrentScore] = useState(initialData?.currentScore || 0);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<any>(null);
  const actionsRef = useRef<any>(null);

  // Analysis questions answers
  const [answers, setAnswers] = useState<Record<string, string>>({
    q1: '',
    q2: '',
    q3: '',
  });

  useEffect(() => {
    loadExercise();
  }, []);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress();
    }, 30000);
    return () => clearInterval(interval);
  }, [perspectives, currentScore]);

  // Update progress
  useEffect(() => {
    if (!exercise) return;
    const progress = perspectives.length > 0 ? 100 : 0;
    onProgressUpdate?.(progress);

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);
  }, [perspectives, exercise]);

  const loadExercise = async () => {
    try {
      const data = await fetchMatrixExercise('matrix-1');
      setExercise(data);
    } finally {
      setLoading(false);
    }
  };

  const saveProgress = () => {
    const state: ExerciseState = {
      perspectives,
      currentScore,
      perspectivesGenerated: perspectives.length > 0,
    };
    saveProgressUtil(exerciseId, state);
  };

  const handleGenerate = async () => {
    if (!exercise) return;
    setGenerating(true);
    try {
      const persp = await getAIPerspectives(exercise.topic, exercise.perspectiveCount);
      setPerspectives(persp);
      const newScore = 50; // Base score for generating perspectives
      setCurrentScore(newScore);
    } finally {
      setGenerating(false);
    }
  };

  const handleComplete = async () => {
    // Validate that all questions have minimum 50 characters
    const allAnswered = Object.values(answers).every((a) => a.trim().length >= 50);
    if (!allAnswered) {
      setFeedback({
        type: 'error',
        title: 'Preguntas Incompletas',
        message: 'Por favor completa todas las preguntas con al menos 50 caracteres cada una.',
      });
      setShowFeedback(true);
      return;
    }

    if (!user?.id) {
      setFeedback({
        type: 'error',
        title: 'Error de Autenticación',
        message: 'Debes estar autenticado para enviar el ejercicio.',
      });
      setShowFeedback(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await submitExercise(exercise?.id || exerciseId, user.id, {
        questions: answers,
      } as MatrizPerspectivasAnswers);

      // Extraer rewards de la respuesta
      const rewards = response.rewards || { mlCoins: 0, xp: 0, bonuses: {} };

      const finalFeedback = {
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Análisis Completo Excelente!'
          : response.score >= 70
            ? '¡Buen Análisis de Perspectivas!'
            : 'Sigue Practicando',
        message:
          response.feedback?.overall ||
          `Has completado el análisis de ${perspectives.length} perspectivas con una calificación de ${response.score} puntos.`,
        score: response.score,
        showConfetti: response.isPerfect,
        // Agregar rewards
        xpEarned: rewards.xp,
        mlCoinsEarned: rewards.mlCoins,
      };

      setFeedback(finalFeedback);
      setCurrentScore(response.score);
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await fetchUserProgress();
      await fetchBalance();

      console.log('✅ [MatrizPerspectivas] Submission successful:', {
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('[MatrizPerspectivas] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu análisis. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setPerspectives([]);
    setCurrentScore(0);
    setAnswers({ q1: '', q2: '', q3: '' });
    setShowFeedback(false);
  };

  // Attach actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck: handleComplete,
        getState: () => ({ perspectives, currentScore }),
      };
    }
  }, [perspectives, currentScore]);

  if (loading || !exercise) {
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
              <Grid3x3 className="h-8 w-8" />
              <h1 className="text-detective-3xl font-bold">Matriz de Perspectivas</h1>
            </div>
            <p className="mb-2 text-detective-lg">{exercise.topic}</p>
            <p className="text-detective-base opacity-90">{exercise.description}</p>
          </motion.div>

          {/* Generate Button */}
          <div className="text-center">
            <DetectiveButton
              variant="primary"
              onClick={handleGenerate}
              disabled={generating}
              loading={generating}
              icon={<Sparkles className="h-6 w-6" />}
            >
              {generating ? 'Generando Perspectivas...' : 'Generar Perspectivas con IA'}
            </DetectiveButton>
          </div>

          {/* Perspectives Grid */}
          {perspectives.length > 0 && (
            <>
              <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
                {perspectives.map((persp, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.15 }}
                  >
                    <div className="hover:shadow-detective-md rounded-detective border-2 border-detective-border-light bg-white p-6 transition-shadow">
                      <div className="mb-4 flex items-center gap-2">
                        <Eye className="h-5 w-5 text-detective-orange" />
                        <h3 className="text-detective-lg font-semibold text-detective-blue">
                          {persp.perspective}
                        </h3>
                      </div>

                      {/* Viewpoint */}
                      <div className="mb-4 rounded-lg bg-blue-50 p-3">
                        <p className="text-detective-sm font-medium text-blue-900">
                          {persp.viewpoint}
                        </p>
                      </div>

                      {/* Arguments */}
                      <div className="mb-4">
                        <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                          Argumentos
                        </h4>
                        <ul className="space-y-1">
                          {persp.arguments.map((arg: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-detective-xs">
                              <span className="text-green-600">+</span>
                              <span>{arg}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Counter-arguments */}
                      <div className="mb-4">
                        <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                          Contraargumentos
                        </h4>
                        <ul className="space-y-1">
                          {persp.counterarguments.map((counter: string, i: number) => (
                            <li key={i} className="flex items-start gap-1 text-detective-xs">
                              <span className="text-red-600">−</span>
                              <span>{counter}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Biases */}
                      {persp.biases && persp.biases.length > 0 && (
                        <div className="mb-4">
                          <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                            Sesgos Posibles
                          </h4>
                          <ul className="space-y-1">
                            {persp.biases.map((bias: string, i: number) => (
                              <li key={i} className="text-detective-xs text-yellow-800">
                                ⚠ {bias}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Contextual Factors */}
                      {persp.contextualFactors && persp.contextualFactors.length > 0 && (
                        <div>
                          <h4 className="mb-2 text-detective-sm font-semibold text-detective-blue">
                            Factores Contextuales
                          </h4>
                          <ul className="space-y-1">
                            {persp.contextualFactors.map((factor: string, i: number) => (
                              <li key={i} className="text-detective-xs text-gray-600">
                                • {factor}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Analysis Questions Section */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-8 rounded-detective-lg border-2 border-detective-blue bg-gradient-to-br from-blue-50 to-purple-50 p-6"
              >
                <h2 className="mb-4 flex items-center gap-2 text-detective-2xl font-bold text-detective-blue">
                  <Grid3x3 className="h-6 w-6" />
                  Preguntas de Análisis
                </h2>
                <p className="mb-6 text-detective-base text-detective-text-secondary">
                  Responde las siguientes preguntas basándote en las perspectivas generadas (mínimo
                  50 caracteres por respuesta):
                </p>

                <div className="space-y-6">
                  {/* Question 1 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      1. ¿Qué perspectiva fue más injusta con Marie?
                    </label>
                    <textarea
                      value={answers.q1}
                      onChange={(e) => setAnswers({ ...answers, q1: e.target.value })}
                      placeholder="Analiza y explica cuál perspectiva consideras más injusta y por qué..."
                      className="w-full resize-none rounded-detective border-2 border-gray-300 p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q1.trim().length >= 50 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {answers.q1.trim().length < 50
                          ? `Faltan ${50 - answers.q1.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-gray-500">{answers.q1.length}/500</p>
                    </div>
                  </div>

                  {/* Question 2 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      2. ¿Cómo ha evolucionado la percepción de Marie con el tiempo?
                    </label>
                    <textarea
                      value={answers.q2}
                      onChange={(e) => setAnswers({ ...answers, q2: e.target.value })}
                      placeholder="Describe cómo ha cambiado la forma en que se ve a Marie Curie..."
                      className="w-full resize-none rounded-detective border-2 border-gray-300 p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q2.trim().length >= 50 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {answers.q2.trim().length < 50
                          ? `Faltan ${50 - answers.q2.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-gray-500">{answers.q2.length}/500</p>
                    </div>
                  </div>

                  {/* Question 3 */}
                  <div>
                    <label className="mb-2 block text-detective-base font-semibold text-detective-blue">
                      3. ¿Qué grupo tuvo la perspectiva más equilibrada?
                    </label>
                    <textarea
                      value={answers.q3}
                      onChange={(e) => setAnswers({ ...answers, q3: e.target.value })}
                      placeholder="Identifica cuál grupo presentó la visión más balanceada y fundamenta tu respuesta..."
                      className="w-full resize-none rounded-detective border-2 border-gray-300 p-4 transition-all focus:border-detective-blue focus:ring-2 focus:ring-detective-blue/20"
                      rows={4}
                      maxLength={500}
                    />
                    <div className="mt-1 flex justify-between">
                      <p
                        className={`text-detective-sm ${answers.q3.trim().length >= 50 ? 'text-green-600' : 'text-red-600'}`}
                      >
                        {answers.q3.trim().length < 50
                          ? `Faltan ${50 - answers.q3.trim().length} caracteres`
                          : '✓ Completo'}
                      </p>
                      <p className="text-detective-sm text-gray-500">{answers.q3.length}/500</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}

          {/* Empty State */}
          {perspectives.length === 0 && !generating && (
            <div className="mt-6 rounded-detective border-2 border-detective-border-light bg-white p-12 text-center">
              <Grid3x3 className="mx-auto mb-4 h-16 w-16 text-gray-300" />
              <p className="text-detective-base text-detective-text-secondary">
                Genera perspectivas con IA para comenzar el análisis
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
            <DetectiveButton variant="gold" onClick={handleReset} disabled={isSubmitting}>
              Reiniciar
            </DetectiveButton>
            <DetectiveButton
              variant="primary"
              onClick={handleComplete}
              disabled={
                perspectives.length === 0 ||
                isSubmitting ||
                !Object.values(answers).every((a) => a.trim().length >= 50)
              }
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
            if (feedback.type === 'success') {
              onComplete?.(feedback.score || currentScore, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default MatrizPerspectivasExercise;
