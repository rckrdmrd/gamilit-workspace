/**
 * Rueda de Inferencias Exercise
 *
 * @description Main exercise component for Inference Wheel (Module 2.5)
 * Mechanic: Spin wheel → select category → write free-text inference (30 seconds)
 * @task FE-071
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RotateCw, Send, Book, CheckCircle2 } from 'lucide-react';
import { WheelSpinner } from './WheelSpinner';
import { CountdownTimer } from './CountdownTimer';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { RankUpModal } from '@/features/gamification/ranks/components/RankUpModal';
import { submitExercise } from '@features/progress/api/progressAPI';
import { useInvalidateDashboard } from '@/shared/hooks';
import type {
  RuedaInferenciasExerciseProps,
  RuedaInferenciasExercise as RuedaInferenciasExerciseType,
  InferenceCategory,
  FragmentState,
  RuedaInferenciasAnswers,
} from './ruedaInferenciasTypes';
import type { ExerciseFeedback } from '@shared/components/mechanics/mechanicsTypes';

// Mock data (will be replaced with real API call)
const mockExercise: RuedaInferenciasExerciseType = {
  id: 'ex-rueda-001',
  title: 'Rueda de Inferencias: Marie Curie',
  description: 'Analiza fragmentos del texto y escribe inferencias según la categoría seleccionada',
  difficulty_level: 'medium',
  max_score: 100,
  passing_score: 70,
  content: {
    categories: [
      {
        id: 'cat-literal',
        name: 'Literal',
        description: 'Información directa del texto',
        color: '#3B82F6',
        icon: '📖',
      },
      {
        id: 'cat-inferencial',
        name: 'Inferencial',
        description: 'Conclusiones basadas en pistas',
        color: '#10B981',
        icon: '🔍',
      },
      {
        id: 'cat-critico',
        name: 'Crítico',
        description: 'Análisis y evaluación',
        color: '#F59E0B',
        icon: '💡',
      },
      {
        id: 'cat-creativo',
        name: 'Creativo',
        description: 'Ideas originales relacionadas',
        color: '#8B5CF6',
        icon: '🎨',
      },
    ],
    fragments: [
      {
        id: 'frag-1',
        text: 'Marie Curie fue pionera en el estudio de la radiactividad, convirtiéndose en la primera mujer en ganar un Premio Nobel y la única persona en ganar en dos campos científicos diferentes.',
        difficulty: 'medium',
        hints: ['Piensa en logros', 'Considera el impacto histórico'],
      },
      {
        id: 'frag-2',
        text: 'A pesar de enfrentar discriminación por ser mujer en un campo dominado por hombres, Marie persistió en su investigación, trabajando en condiciones difíciles en un laboratorio improvisado.',
        difficulty: 'medium',
        hints: ['Considera el contexto social', 'Piensa en obstáculos'],
      },
      {
        id: 'frag-3',
        text: 'Los cuadernos de Marie Curie todavía son radiactivos y se guardan en cajas especiales de plomo. Las personas que quieren consultarlos deben firmar un descargo de responsabilidad.',
        difficulty: 'hard',
        hints: ['Piensa en consecuencias a largo plazo', 'Considera riesgos'],
      },
    ],
    settings: {
      timeLimit: 30,
      minTextLength: 20,
      maxTextLength: 200,
      wheelAnimation: true,
      showTimer: true,
      allowSkip: false,
    },
    instructions:
      '1. Gira la ruleta para seleccionar una categoría\n2. Lee el fragmento de texto\n3. Escribe una inferencia en 30 segundos\n4. Continúa con el siguiente fragmento',
  },
};

type GamePhase =
  | 'intro'
  | 'spinning'
  | 'reading'
  | 'writing'
  | 'summary'
  | 'completed'
  | 'feedback';

export const RuedaInferenciasExercise: React.FC<RuedaInferenciasExerciseProps> = ({
  exerciseId,
  userId,
  onComplete,
  onProgressUpdate,
  initialData,
  actionsRef,
}) => {
  // Store hooks for syncing rewards
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Exercise data
  const [exercise] = useState<RuedaInferenciasExerciseType>(mockExercise);

  // Game state
  const [phase, setPhase] = useState<GamePhase>('intro');
  const [currentFragmentIndex, setCurrentFragmentIndex] = useState(0);
  const [isWheelSpinning, setIsWheelSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<InferenceCategory | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [usedCategoryIds, setUsedCategoryIds] = useState<string[]>([]);

  // Fragment states
  const [fragmentStates, setFragmentStates] = useState<FragmentState[]>(
    exercise.content.fragments.map((frag) => ({
      fragmentId: frag.id,
      categoryId: null,
      userText: '',
      timeSpent: 0,
      isComplete: false,
      startedAt: null,
    })),
  );

  // Current fragment text input
  const [currentText, setCurrentText] = useState('');
  const [characterCount, setCharacterCount] = useState(0);

  // Progress tracking
  const [totalTimeSpent, setTotalTimeSpent] = useState(initialData?.totalTimeSpent || 0);
  const [score, setScore] = useState(initialData?.score || 0);

  // Feedback modal
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<ExerciseFeedback | null>(null);

  // Submitting state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // RankUp modal
  const [showRankUpModal, setShowRankUpModal] = useState(false);
  const [rankUpData, setRankUpData] = useState<any>(null);

  // Refs
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const startTimeRef = useRef<Date | null>(null);

  // Current fragment
  const currentFragment = exercise.content.fragments[currentFragmentIndex];

  // Timer effect
  useEffect(() => {
    if (phase === 'writing' || phase === 'reading') {
      const interval = setInterval(() => {
        setTotalTimeSpent((prev) => prev + 1);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [phase]);

  // Progress callback - send both progress AND answers to ExercisePage
  useEffect(() => {
    if (onProgressUpdate) {
      // Prepare answers in the format ExercisePage expects
      const answers: RuedaInferenciasAnswers = {
        fragments: fragmentStates.reduce(
          (acc, state) => {
            if (state.userText) {
              acc[state.fragmentId] = state.userText;
            }
            return acc;
          },
          {} as Record<string, string>,
        ),
        fragmentStates: fragmentStates.map((state) => ({
          fragmentId: state.fragmentId,
          categoryId: state.categoryId || 'cat-literal',
          userText: state.userText,
          timeSpent: state.timeSpent,
        })),
        timeSpent: totalTimeSpent,
      };

      // Send both progress and answers
      onProgressUpdate({
        progress: {
          currentStep: currentFragmentIndex + 1,
          totalSteps: exercise.content.fragments.length,
          score,
          hintsUsed: 0,
          timeSpent: totalTimeSpent,
        },
        answers: answers,
      });
    }
  }, [
    currentFragmentIndex,
    score,
    totalTimeSpent,
    fragmentStates,
    onProgressUpdate,
    exercise.content.fragments.length,
  ]);

  // Character count
  useEffect(() => {
    setCharacterCount(currentText.length);
  }, [currentText]);

  // Handle spin wheel
  const handleSpinWheel = () => {
    setIsWheelSpinning(true);
    setPhase('spinning');
  };

  // Handle wheel spin complete
  const handleWheelSpinComplete = (category: InferenceCategory) => {
    setSelectedCategory(category);
    setIsWheelSpinning(false);
    setPhase('reading');

    // Update fragment state
    setFragmentStates((prev) =>
      prev.map((state, idx) =>
        idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state,
      ),
    );

    // Track used category
    setUsedCategoryIds((prev) => [...prev, category.id]);
  };

  // Handle start writing
  const handleStartWriting = () => {
    setPhase('writing');
    setIsTimerRunning(true);
    startTimeRef.current = new Date();
    setTimeout(() => textareaRef.current?.focus(), 100);
  };

  // Handle timer complete
  const handleTimerComplete = () => {
    setIsTimerRunning(false);
    handleSaveFragment();
  };

  // Handle save fragment
  const handleSaveFragment = useCallback(() => {
    const timeSpent = startTimeRef.current
      ? Math.floor((new Date().getTime() - startTimeRef.current.getTime()) / 1000)
      : 0;

    // Update fragment state
    setFragmentStates((prev) =>
      prev.map((state, idx) =>
        idx === currentFragmentIndex
          ? {
              ...state,
              userText: currentText,
              timeSpent,
              isComplete: true,
            }
          : state,
      ),
    );

    // Move to next fragment or show summary
    if (currentFragmentIndex < exercise.content.fragments.length - 1) {
      setCurrentFragmentIndex((prev) => prev + 1);
      setPhase('intro');
      setSelectedCategory(null);
      setCurrentText('');
      setIsTimerRunning(false);
      startTimeRef.current = null;
    } else {
      // Mostrar resumen antes de enviar
      setPhase('summary');
    }
  }, [currentFragmentIndex, currentText, exercise.content.fragments.length]);

  // Handle manual submit (before timer runs out)
  const handleManualSubmit = () => {
    if (characterCount < exercise.content.settings.minTextLength) {
      alert(
        `Tu respuesta debe tener al menos ${exercise.content.settings.minTextLength} caracteres. Actualmente tienes ${characterCount}.`,
      );
      return;
    }

    setIsTimerRunning(false);
    handleSaveFragment();
  };

  // Handle submit exercise to backend
  const handleSubmitExercise = async () => {
    setIsSubmitting(true);

    try {
      // Prepare answers in backend format
      const answers: RuedaInferenciasAnswers = {
        fragments: fragmentStates.reduce(
          (acc, state) => {
            acc[state.fragmentId] = state.userText;
            return acc;
          },
          {} as Record<string, string>,
        ),
        fragmentStates: fragmentStates.map((state) => ({
          fragmentId: state.fragmentId,
          categoryId: state.categoryId || 'cat-literal',
          userText: state.userText,
          timeSpent: state.timeSpent,
        })),
        categoryId: selectedCategory?.id,
        timeSpent: totalTimeSpent,
      };

      const response = await submitExercise(exerciseId, userId, answers);

      if (response.rankUp) {
        setRankUpData(response.rankUp);
      }

      // Show feedback
      const feedbackMessage =
        typeof response.feedback === 'string'
          ? response.feedback
          : response.feedback?.overall || 'Ejercicio completado';

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Perfecto!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Intenta de nuevo',
        message: feedbackMessage,
        score: response.score,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
        showConfetti: response.isPerfect,
        isCorrect: response.score >= exercise.passing_score,
        details: (response as any).details?.byFragment,
      });

      setScore(response.score);
      setShowFeedback(true);

      // Sync stores with backend (rewards already calculated and saved by backend)
      await syncAndInvalidate();

      console.log('✅ [RuedaInferencias] Submission successful:', {
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'Hubo un error al enviar tus respuestas. Por favor intenta de nuevo.',
        score: 0,
        isCorrect: false,
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle reset
  const handleReset = () => {
    setCurrentFragmentIndex(0);
    setPhase('intro');
    setSelectedCategory(null);
    setCurrentText('');
    setIsTimerRunning(false);
    setIsWheelSpinning(false);
    setUsedCategoryIds([]);
    setFragmentStates(
      exercise.content.fragments.map((frag) => ({
        fragmentId: frag.id,
        categoryId: null,
        userText: '',
        timeSpent: 0,
        isComplete: false,
        startedAt: null,
      })),
    );
    setTotalTimeSpent(0);
    setScore(0);
    setShowFeedback(false);
    setFeedback(null);
  };

  // Actions ref
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        getState: () => {
          // Prepare answers in backend format
          const answers: RuedaInferenciasAnswers = {
            fragments: fragmentStates.reduce(
              (acc, state) => {
                if (state.userText) {
                  acc[state.fragmentId] = state.userText;
                }
                return acc;
              },
              {} as Record<string, string>,
            ),
            fragmentStates: fragmentStates.map((state) => ({
              fragmentId: state.fragmentId,
              categoryId: state.categoryId || 'cat-literal',
              userText: state.userText,
              timeSpent: state.timeSpent,
            })),
            timeSpent: totalTimeSpent,
          };

          return {
            currentFragmentIndex,
            fragments: fragmentStates,
            totalTimeSpent,
            score,
            hintsUsed: 0,
            isWheelSpinning,
            selectedCategoryId: selectedCategory?.id || null,
            answers, // Include answers for ExercisePage
          };
        },
        reset: handleReset,
        submit: handleSubmitExercise,
      };
    }
  }, [actionsRef]);

  // Validate text length
  const isTextValid =
    characterCount >= exercise.content.settings.minTextLength &&
    characterCount <= exercise.content.settings.maxTextLength;

  const getCharacterColor = () => {
    if (characterCount < exercise.content.settings.minTextLength) return 'text-red-600';
    if (characterCount > exercise.content.settings.maxTextLength) return 'text-red-600';
    return 'text-green-600';
  };

  return (
    <>
      <DetectiveCard variant="default" padding="lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white shadow-lg">
            <h2 className="mb-2 text-2xl font-bold">{exercise.title}</h2>
            <p className="mb-4 opacity-90">{exercise.description}</p>
            <div className="space-y-2">
              <div className="flex items-center gap-4 text-sm">
                <div>
                  📊 Ronda {currentFragmentIndex + 1} de {exercise.content.fragments.length}
                </div>
                <div>
                  ⏱️ Tiempo: {Math.floor(totalTimeSpent / 60)}:
                  {String(totalTimeSpent % 60).padStart(2, '0')}
                </div>
                {score > 0 && <div>⭐ Puntuación: {score}/100</div>}
              </div>

              {/* Barra de progreso visual */}
              <div className="flex gap-2">
                {exercise.content.fragments.map((_, idx) => (
                  <div
                    key={idx}
                    className={`h-2 flex-1 rounded ${
                      idx < currentFragmentIndex
                        ? 'bg-green-500'
                        : idx === currentFragmentIndex
                          ? 'animate-pulse bg-blue-300'
                          : 'bg-white bg-opacity-30'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Categorías usadas */}
          {usedCategoryIds.length > 0 && (
            <div className="rounded-lg border bg-gray-50 p-4">
              <h4 className="mb-2 text-sm font-semibold text-gray-700">
                Categorías seleccionadas:
              </h4>
              <div className="flex flex-wrap gap-2">
                {exercise.content.categories.map((category) => {
                  const isUsed = usedCategoryIds.includes(category.id);
                  return (
                    <div
                      key={category.id}
                      className={`rounded px-3 py-1 text-sm font-medium ${
                        isUsed
                          ? 'border border-green-500 bg-green-100 text-green-800'
                          : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {category.icon} {category.name}
                      {isUsed && ' ✓'}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Instructions (Intro Phase) */}
          {phase === 'intro' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="intro"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6 text-center"
              >
                <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
                  <Book className="mx-auto mb-4 h-12 w-12 text-blue-600" />
                  <h3 className="mb-3 text-xl font-semibold text-blue-900">¿Cómo funciona?</h3>
                  <div className="mx-auto max-w-2xl space-y-2 text-left text-gray-700">
                    {exercise.content.instructions.split('\n').map((line, idx) => (
                      <div key={idx} className="flex items-start gap-2">
                        <span className="font-semibold text-blue-600">{line}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  onClick={handleSpinWheel}
                  className="mx-auto flex transform items-center gap-3 rounded-lg bg-blue-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
                >
                  <RotateCw className="h-6 w-6" />
                  Girar la Ruleta
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Wheel Spinning Phase */}
          {phase === 'spinning' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="spinning"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
              >
                <WheelSpinner
                  categories={exercise.content.categories}
                  isSpinning={isWheelSpinning}
                  onSpinComplete={handleWheelSpinComplete}
                  usedCategoryIds={usedCategoryIds}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {/* Reading Phase */}
          {phase === 'reading' && selectedCategory && (
            <AnimatePresence mode="wait">
              <motion.div
                key="reading"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Selected Category */}
                <div
                  className="rounded-lg p-6 text-center text-white shadow-lg"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  <div className="mb-3 text-5xl">{selectedCategory.icon}</div>
                  <h3 className="mb-2 text-2xl font-bold">{selectedCategory.name}</h3>
                  <p className="text-lg opacity-90">{selectedCategory.description}</p>
                </div>

                {/* Fragment Text */}
                <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-8">
                  <h4 className="mb-4 text-lg font-semibold text-gray-700">
                    Fragmento {currentFragmentIndex + 1}:
                  </h4>
                  <p className="text-lg leading-relaxed text-gray-800">{currentFragment.text}</p>
                </div>

                <button
                  onClick={handleStartWriting}
                  className="mx-auto flex transform items-center gap-3 rounded-lg bg-green-600 px-8 py-4 font-bold text-white shadow-lg transition-all hover:scale-105 hover:bg-green-700"
                >
                  <Send className="h-6 w-6" />
                  Comenzar a Escribir
                </button>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Writing Phase */}
          {phase === 'writing' && selectedCategory && (
            <AnimatePresence mode="wait">
              <motion.div
                key="writing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                {/* Timer */}
                <CountdownTimer
                  duration={exercise.content.settings.timeLimit}
                  isRunning={isTimerRunning}
                  onComplete={handleTimerComplete}
                />

                {/* Category Reminder */}
                <div
                  className="rounded-lg p-4 text-center text-white"
                  style={{ backgroundColor: selectedCategory.color }}
                >
                  <span className="mr-2 text-2xl">{selectedCategory.icon}</span>
                  <span className="font-semibold">
                    Escribe una inferencia {selectedCategory.name.toLowerCase()}
                  </span>
                </div>

                {/* Fragment Text */}
                <div className="rounded-lg border-2 border-gray-200 bg-gray-50 p-6">
                  <p className="text-base leading-relaxed text-gray-800">{currentFragment.text}</p>
                </div>

                {/* Textarea */}
                <div className="space-y-2">
                  <textarea
                    ref={textareaRef}
                    value={currentText}
                    onChange={(e) => setCurrentText(e.target.value)}
                    placeholder={`Escribe tu inferencia aquí (${exercise.content.settings.minTextLength}-${exercise.content.settings.maxTextLength} caracteres)...`}
                    className="h-40 w-full resize-none rounded-lg border-2 border-gray-300 p-4 text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    maxLength={exercise.content.settings.maxTextLength}
                    disabled={!isTimerRunning}
                  />
                  <div className="flex items-center justify-between">
                    <span className={`text-sm font-semibold ${getCharacterColor()}`}>
                      {characterCount} / {exercise.content.settings.maxTextLength} caracteres
                      {characterCount < exercise.content.settings.minTextLength &&
                        ` (mínimo ${exercise.content.settings.minTextLength})`}
                    </span>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="flex justify-center">
                  <button
                    onClick={handleManualSubmit}
                    disabled={!isTextValid || !isTimerRunning}
                    className={`flex items-center gap-3 rounded-lg px-8 py-4 font-bold shadow-lg transition-all ${
                      isTextValid && isTimerRunning
                        ? 'transform bg-blue-600 text-white hover:scale-105 hover:bg-blue-700'
                        : 'cursor-not-allowed bg-gray-300 text-gray-500'
                    }`}
                  >
                    <Send className="h-6 w-6" />
                    {currentFragmentIndex < exercise.content.fragments.length - 1
                      ? 'Guardar y Continuar'
                      : 'Guardar Respuesta'}
                  </button>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Summary Phase - Antes de enviar */}
          {phase === 'summary' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="summary"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div className="rounded-lg border-2 border-blue-300 bg-blue-50 p-6">
                  <h3 className="mb-4 text-xl font-bold text-blue-900">
                    📋 Resumen de tus respuestas
                  </h3>

                  {fragmentStates.map((state, idx) => (
                    <div key={idx} className="mb-4 rounded border bg-white p-4">
                      <div className="mb-2 flex items-center gap-2">
                        <span className="font-semibold">Ronda {idx + 1}</span>
                        <span className="text-sm text-gray-600">
                          (
                          {exercise.content.categories.find((c) => c.id === state.categoryId)
                            ?.name || 'Sin categoría'}
                          )
                        </span>
                        <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />
                      </div>
                      <p className="text-sm italic text-gray-700">
                        "{state.userText.substring(0, 100)}
                        {state.userText.length > 100 ? '...' : ''}"
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex justify-center gap-4">
                  <button
                    onClick={() => {
                      // Volver a editar última respuesta
                      setCurrentFragmentIndex(exercise.content.fragments.length - 1);
                      setCurrentText(
                        fragmentStates[exercise.content.fragments.length - 1].userText,
                      );
                      setPhase('writing');
                      setIsTimerRunning(true);
                    }}
                    className="rounded-lg bg-gray-300 px-8 py-4 font-bold text-gray-800 transition-all hover:bg-gray-400"
                  >
                    Editar Última Respuesta
                  </button>

                  <div className="text-center">
                    <p className="mb-2 text-sm text-gray-600">
                      ✅ Todas las respuestas completadas
                    </p>
                    <p className="text-xs text-gray-500">
                      Usa el botón "Enviar Respuestas" para finalizar
                    </p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}

          {/* Completed Phase */}
          {phase === 'completed' && (
            <AnimatePresence mode="wait">
              <motion.div
                key="completed"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6 text-center"
              >
                <div className="rounded-lg border-2 border-green-300 bg-green-50 p-8">
                  <CheckCircle2 className="mx-auto mb-4 h-16 w-16 text-green-600" />
                  <h3 className="mb-2 text-2xl font-bold text-green-900">¡Ejercicio Completado!</h3>
                  <p className="text-gray-700">
                    {isSubmitting ? 'Enviando tus respuestas...' : 'Procesando resultados...'}
                  </p>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </DetectiveCard>

      {/* Feedback Modal */}
      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (rankUpData) {
              setTimeout(() => setShowRankUpModal(true), 300);
            } else if (feedback?.type === 'success') {
              onComplete?.(score, totalTimeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}

      {showRankUpModal && rankUpData && (
        <RankUpModal
          isOpen={showRankUpModal}
          onClose={() => {
            setShowRankUpModal(false);
            setRankUpData(null);
            if (feedback?.type === 'success') {
              onComplete?.(score, totalTimeSpent);
            }
          }}
        />
      )}
    </>
  );
};

export default RuedaInferenciasExercise;
