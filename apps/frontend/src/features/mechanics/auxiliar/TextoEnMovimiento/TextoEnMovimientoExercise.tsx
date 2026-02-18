import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Type, Play, Settings, Trash2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { TextoEnMovimientoExerciseProps, AnimatedText, AnimationConfig } from './textoEnMovimientoTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

const DEFAULT_ANIMATIONS: AnimationConfig[] = [
  {
    id: 'fadeIn',
    name: 'Aparecer',
    variants: { hidden: { opacity: 0 }, visible: { opacity: 1 } },
  },
  {
    id: 'slideUp',
    name: 'Deslizar Arriba',
    variants: { hidden: { y: 100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  },
  {
    id: 'slideDown',
    name: 'Deslizar Abajo',
    variants: { hidden: { y: -100, opacity: 0 }, visible: { y: 0, opacity: 1 } },
  },
  {
    id: 'scale',
    name: 'Escalar',
    variants: { hidden: { scale: 0, opacity: 0 }, visible: { scale: 1, opacity: 1 } },
  },
  {
    id: 'rotate',
    name: 'Rotar',
    variants: { hidden: { rotate: -180, opacity: 0 }, visible: { rotate: 0, opacity: 1 } },
  },
];

const DEFAULT_COLORS = ['#f97316', '#1e3a8a', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6'];

export const TextoEnMovimientoExercise: React.FC<TextoEnMovimientoExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');


  const [texts, setTexts] = useState<AnimatedText[]>([]);
  const [currentText, setCurrentText] = useState(exercise.topic || 'Marie Curie');
  const [selectedAnimation, setSelectedAnimation] = useState('fadeIn');
  const [duration, setDuration] = useState(2);
  const [color, setColor] = useState('#f97316');
  const [fontSize, setFontSize] = useState(48);
  const [isPlaying, setIsPlaying] = useState(false);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [validated, setValidated] = useState(false);

  const animations = exercise.availableAnimations || DEFAULT_ANIMATIONS;
  const availableColors = exercise.availableColors || DEFAULT_COLORS;
  const minTexts = exercise.minTexts || 2;
  const minDuration = exercise.minDuration || 0.5;
  const maxDuration = exercise.maxDuration || 5;
  const minFontSize = exercise.minFontSize || 16;
  const maxFontSize = exercise.maxFontSize || 96;

  // Progress update effect
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep: texts.length,
          totalSteps: minTexts,
          score: 0, // Score calculated by backend
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { texts },
      });

      console.log('📊 [TextoEnMovimiento] Progress update sent:', {
        textsCount: texts.length,
        minRequired: minTexts,
      });
    }
  }, [texts, hintsUsed, onProgressUpdate, minTexts, startTime]);

  const addText = () => {
    if (validated || !currentText.trim()) return;

    const newText: AnimatedText = {
      id: Date.now().toString(),
      text: currentText,
      animation: selectedAnimation,
      duration,
      color,
      fontSize,
    };

    setTexts([...texts, newText]);
    setCurrentText('');
  };

  const removeText = (id: string) => {
    if (validated) return;
    setTexts(texts.filter((t) => t.id !== id));
  };

  const getAnimationVariants = (animationId: string) => {
    return animations.find((a) => a.id === animationId)?.variants || animations[0].variants;
  };

  const handleCheck = useCallback(async () => {
    if (validated || isSubmitting) return;

    if (texts.length < minTexts) {
      setFeedback({
        type: 'error',
        title: 'Textos Insuficientes',
        message: `Tu animación necesita al menos ${minTexts} textos. Tienes ${texts.length}.`,
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
      const response = await submitAsync({ texts });

      setValidated(true);

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Animación Perfecta!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Sigue mejorando',
        message:
          response.feedback?.overall ||
          `Tu animación ha sido evaluada con ${Math.round(response.score)}%. Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      await syncAndInvalidate();

      console.log('✅ [TextoEnMovimiento] Submission successful:', {
        attemptId: response.attemptId,
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('❌ [TextoEnMovimiento] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu animación. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [texts, validated, isSubmitting, user, exercise.id, minTexts, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    setTexts([]);
    setCurrentText(exercise.topic || 'Marie Curie');
    setIsPlaying(false);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, [exercise.topic]);

  // Populate actionsRef for parent component
  useEffect(() => {
    if (actionsRef) {
      actionsRef.current = {
        handleReset,
        handleCheck,
      };
    }
  }, [actionsRef, handleReset, handleCheck]);

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title || 'Texto en Movimiento'}
        description={exercise.instructions || `Crea animaciones de texto sobre ${exercise.topic || 'Marie Curie'}.`}
        icon={<Type className="h-8 w-8" />}
        headerActions={
          <div className="flex items-center gap-4">
            <span className="rounded-full bg-detective-bg-secondary px-3 py-1 text-sm text-detective-text-secondary">
              {texts.length}/{minTexts} textos mínimos
            </span>
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="flex items-center gap-2 rounded-detective bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              <Play className="h-5 w-5" />
              {isPlaying ? 'Pausar' : 'Reproducir'}
            </button>
          </div>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <DetectiveCard variant="default" padding="lg" className="space-y-4">
            <h3 className="flex items-center gap-2 font-bold text-detective-text">
              <Settings className="h-5 w-5" />
              Configuración
            </h3>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Texto:</label>
              <input
                type="text"
                value={currentText}
                onChange={(e) => setCurrentText(e.target.value)}
                disabled={validated}
                placeholder="Escribe tu texto..."
                className="w-full rounded-detective border-2 border-detective-border px-3 py-2 focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Animación:</label>
              <select
                value={selectedAnimation}
                onChange={(e) => setSelectedAnimation(e.target.value)}
                disabled={validated}
                className="w-full rounded-detective border-2 border-detective-border px-3 py-2 focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
              >
                {animations.map((anim) => (
                  <option key={anim.id} value={anim.id}>
                    {anim.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">
                Duración: {duration}s
              </label>
              <input
                type="range"
                min={minDuration}
                max={maxDuration}
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
                disabled={validated}
                className="w-full accent-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">
                Tamaño: {fontSize}px
              </label>
              <input
                type="range"
                min={minFontSize}
                max={maxFontSize}
                step="4"
                value={fontSize}
                onChange={(e) => setFontSize(parseInt(e.target.value))}
                disabled={validated}
                className="w-full accent-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div>
              <label className="mb-2 block font-medium text-detective-text">Color:</label>
              <div className="flex gap-2">
                {availableColors.map((c) => (
                  <button
                    key={c}
                    onClick={() => !validated && setColor(c)}
                    disabled={validated}
                    className={`h-10 w-10 rounded-full border-4 transition-all ${
                      color === c ? 'border-detective-text' : 'border-detective-border'
                    } disabled:cursor-not-allowed disabled:opacity-50`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <button
              onClick={addText}
              disabled={validated || !currentText.trim()}
              className="w-full rounded-detective bg-detective-orange py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
            >
              Agregar Texto
            </button>
          </DetectiveCard>

          <DetectiveCard
            variant="default"
            padding="lg"
            className="overflow-hidden lg:col-span-3"
            style={{ minHeight: '500px' }}
          >
            <div className="relative flex h-full w-full items-center justify-center rounded-detective bg-detective-text p-12">
              {texts.map((text, index) => (
                <motion.div
                  key={text.id}
                  initial="hidden"
                  animate={isPlaying ? 'visible' : 'hidden'}
                  variants={getAnimationVariants(text.animation)}
                  transition={{
                    duration: text.duration,
                    delay: index * (text.duration + 0.5),
                    repeat: isPlaying ? Infinity : 0,
                    repeatDelay: (texts.length - 1) * (text.duration + 0.5),
                  }}
                  className="absolute"
                  style={{
                    color: text.color,
                    fontSize: `${text.fontSize}px`,
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  {text.text}
                </motion.div>
              ))}

              {texts.length === 0 && (
                <div className="text-center text-white/50">
                  <Type className="mx-auto mb-4 h-20 w-20" />
                  <p className="text-xl">Agrega textos animados</p>
                  <p className="text-sm">para crear tu animación</p>
                </div>
              )}
            </div>
          </DetectiveCard>
        </div>

        {texts.length > 0 && (
          <DetectiveCard variant="default" padding="lg">
            <h3 className="mb-4 font-bold text-detective-text">Secuencia de Animación:</h3>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {texts.map((text, index) => (
                <div
                  key={text.id}
                  className="flex items-center justify-between rounded-detective border-2 border-detective-border p-3"
                >
                  <div>
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-detective-blue text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="font-medium text-detective-text">{text.text}</span>
                    </div>
                    <p className="text-xs text-detective-text-secondary">
                      {animations.find((a) => a.id === text.animation)?.name} • {text.duration}s
                    </p>
                  </div>
                  {!validated && (
                    <button
                      onClick={() => removeText(text.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </DetectiveCard>
        )}
      </UnifiedExerciseLayout>

      {feedback && (
        <FeedbackModal
          isOpen={showFeedback}
          feedback={feedback}
          onClose={() => {
            setShowFeedback(false);
            if (feedback.type === 'success' && onComplete) {
              onComplete();
            }
          }}
          onRetry={() => {
            setShowFeedback(false);
            handleReset();
          }}
        />
      )}
    </>
  );
};

export default TextoEnMovimientoExercise;
