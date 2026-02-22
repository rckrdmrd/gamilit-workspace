import { useState, useEffect, useRef, useMemo, type MutableRefObject, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Trash2, Save, Send, Loader2, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';

import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import {
  calculateScore,
  saveProgress,
} from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MANUAL_REVIEW_PENDING_SHORT_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';

import { MemeAnnotator } from './MemeAnnotator';
import type { AnalisisMemesData, MemeAnnotation, MemeItem, AnalisisMemesProgressData, AnalisisMemesExerciseState } from './analisisMemesTypes';
import type { FeedbackData, DifficultyLevel } from '@shared/components/mechanics/mechanicsTypes';

/** Props for the AnalisisMemes exercise component */
interface AnalisisMemesExerciseProps {
  exerciseId: string;
  userId?: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: AnalisisMemesProgressData) => void;
  initialData?: AnalisisMemesExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  exercise?: AnalisisMemesData;
  actionsRef?: MutableRefObject<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>;
}

const defaultExercise: AnalisisMemesData = {
  id: 'analisis-memes',
  title: 'Análisis de Memes',
  description: 'Analiza la imagen del meme e identifica elementos clave',
  difficulty: 'medium' as DifficultyLevel,
  estimatedTime: 600,
  topic: 'Análisis de textos digitales',
  hints: [],
  memeUrl: '/memes/marie-curie-glowing.svg',
  memeTitle: 'Drake Hotline Bling: Marie Curie',
  expectedAnnotations: [],
  memes: [
    { id: 'meme1', imageUrl: '/memes/marie-curie-glowing.svg', format: 'Drake Hotline Bling' },
    { id: 'meme2', imageUrl: '/memes/expanding-brain-curie.svg', format: 'Expanding Brain' },
    { id: 'meme3', imageUrl: '/memes/distracted-curie.svg', format: 'Distracted Boyfriend' },
    { id: 'meme4', imageUrl: '/memes/change-my-mind-curie.svg', format: 'Change My Mind' },
    { id: 'meme5', imageUrl: '/memes/one-does-not-simply-curie.svg', format: 'One Does Not Simply' },
    { id: 'meme6', imageUrl: '/memes/this-is-fine-curie.svg', format: 'This Is Fine' },
  ],
};

/**
 * Análisis de Memes Exercise — Module 4: Textos Digitales y Multimediales
 *
 * Students analyze meme images by placing annotations identifying text, context,
 * humor, and critical elements. Supports multi-meme navigation with prev/next
 * controls when the exercise contains multiple memes.
 *
 * Requires manual grading (requiresManualReview = true).
 */
export const AnalisisMemesExercise = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  exercise = defaultExercise,
  actionsRef,
}: AnalisisMemesExerciseProps) => {
  const [annotations, setAnnotations] = useState<MemeAnnotation[]>(initialData?.annotations || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<MemeAnnotation | null>(null);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);

  // Multi-meme support: derive meme list and current meme
  const memeList: MemeItem[] = useMemo(() => {
    if (exercise.memes && exercise.memes.length > 0) return exercise.memes;
    // Fallback: single meme from memeUrl
    return [{ id: exercise.id, imageUrl: exercise.memeUrl, format: exercise.memeTitle || '' }];
  }, [exercise.memes, exercise.id, exercise.memeUrl, exercise.memeTitle]);

  const currentMeme = memeList[currentMemeIndex];
  const currentMemeUrl = currentMeme?.imageUrl || exercise.memeUrl;
  const currentMemeTitle = currentMeme?.format
    ? `${currentMeme.format}: ${exercise.title}`
    : exercise.memeTitle;
  const hasMultipleMemes = memeList.length > 1;

  const {
    submitAsync,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '');

  const localActionsRef = useRef<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>({});
  const resolvedActionsRef = actionsRef || localActionsRef;

  const categories: Array<'texto' | 'contexto' | 'humor' | 'critica'> = [
    'texto',
    'contexto',
    'humor',
    'critica',
  ];

  // Calculate progress
  const calculateProgress = () => {
    const minAnnotations = 3;
    return Math.min(100, (annotations.length / minAnnotations) * 100);
  };

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      saveProgress(exerciseId, { data: { annotations } });
    }, 30000);

    return () => clearInterval(interval);
  }, [annotations, exerciseId]);

  // Update progress

  useEffect(() => {
    const progress = calculateProgress();
    const minAnnotations = 3;

    const elapsed = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
    setTimeSpent(elapsed);

    // FIX: Send answers in DTO format (annotations with x,y,text + analysis.message) for ExercisePage.tsx submit button
    // Build analysis message from annotations
    const analysisMessage = annotations.length > 0
      ? `Análisis del meme: Se identificaron ${annotations.length} elementos. ${annotations.map(a => a.text).join('. ')}`
      : 'Análisis pendiente';

    onProgressUpdate?.({
      progress: {
        currentStep: annotations.length,
        totalSteps: minAnnotations,
        score: Math.round(progress),
        hintsUsed: 0,
        timeSpent: elapsed,
      },
      answers: {
        // Primary format: DTO expected by backend
        annotations: annotations.map((a) => ({
          x: a.x,
          y: a.y,
          text: a.text,
        })),
        analysis: {
          message: analysisMessage,
        },

        // Secondary format for backwards compatibility
        memeAnnotations: annotations.map((a) => ({
          memeId: exercise.id,
          category: a.category,
          text: a.text,
        })),

        // Metadata
        metadata: {
          memeId: exercise.id,
          totalAnnotations: annotations.length,
        },
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [annotations, onProgressUpdate, startTime]);

  // Handle add annotation
  const handleAddAnnotation = (x: number, y: number) => {
    const newAnnotation: MemeAnnotation = {
      id: `ann-${Date.now()}`,
      x,
      y,
      text: 'Nueva anotación',
      category: 'texto',
    };
    setAnnotations((prev) => [...prev, newAnnotation]);
    setEditingAnnotation(newAnnotation);
    setIsAdding(false);
  };

  // Handle delete annotation
  const handleDeleteAnnotation = (id: string) => {
    setAnnotations((prev) => prev.filter((a) => a.id !== id));
    setEditingAnnotation(null);
  };

  // Handle update annotation
  const handleUpdateAnnotation = (id: string, updates: Partial<MemeAnnotation>) => {
    setAnnotations((prev) => prev.map((a) => (a.id === id ? { ...a, ...updates } : a)));
  };

  // Handle verify (preview/validation action — does NOT submit to backend)
  const handleVerify = async () => {
    if (annotations.length < 3) {
      setFeedback({
        type: 'error',
        title: 'Análisis Incompleto',
        message: 'Debes agregar al menos 3 anotaciones para completar el análisis.',
        showConfetti: false,
      });
      setShowFeedback(true);
      return;
    }

    const score = calculateScore(
      annotations.length,
      Math.max(3, exercise.expectedAnnotations?.length || 3),
    );

    setFeedback({
      type: 'success',
      title: '¡Análisis Completado!',
      message: `Has identificado ${annotations.length} elementos en el meme. Buen trabajo analizando los diferentes aspectos.\n\nEsta es una vista previa. Usa 'Enviar Respuestas' para enviar al profesor.`,
      score,
      showConfetti: true,
    });
    setShowFeedback(true);
  };

  // Handle reset
  const handleReset = () => {
    setAnnotations([]);
    setIsAdding(false);
    setEditingAnnotation(null);
    setFeedback(null);
    setShowFeedback(false);
  };

  // Handle save
  const handleSave = () => {
    saveProgress(exerciseId, { data: { annotations } });

    setFeedback({
      type: 'info',
      title: 'Progreso Guardado',
      message: 'Tu análisis ha sido guardado correctamente.',
      showConfetti: false,
    });
    setShowFeedback(true);
  };

  // Handle submit
  // FIX: Transform data to match AnalisisMemesAnswerDto expected by backend
  const handleSubmit = async () => {
    if (!exerciseId || isSubmitting || isSubmitted) return;

    // Transform annotations to DTO format: { x, y, text } (without id/category)
    const dtoAnnotations = annotations.map((a) => ({
      x: a.x,
      y: a.y,
      text: a.text,
    }));

    // Build analysis message from all annotations
    const analysisMessage = annotations
      .map((a) => `[${a.category.toUpperCase()}] ${a.text}`)
      .join('. ');

    try {
      const response = await submitAsync({
        // Primary format expected by AnalisisMemesAnswerDto
        annotations: dtoAnnotations,
        analysis: {
          message: analysisMessage || 'Análisis del meme sobre Marie Curie',
        },

        // Metadata for backwards compatibility and context
        metadata: {
          memeId: currentMeme?.id || exercise.id,
          memeTitle: currentMemeTitle || exercise.title,
          memeFormat: currentMeme?.format,
          currentMemeIndex,
          totalMemes: memeList.length,
          fullAnnotations: annotations, // Include category info for grading
          selectedCategories: [...new Set(annotations.map((a) => a.category))],
          annotationCount: annotations.length,
        },
      });
      setIsSubmitted(true);
      const elapsedTime = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Check for manual review (MUST include 'submitted')
      if (response.status === 'pending_review' || response.status === 'submitted' || response.requiresManualReview) {
        setFeedback({
          type: 'info',
          title: 'Análisis Enviado',
          message: MANUAL_REVIEW_PENDING_SHORT_MESSAGE,
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        onComplete?.(0, elapsedTime);
        return;
      }

      // Normal graded flow
      setFeedback({
        type: 'success',
        title: '¡Análisis Completado!',
        message: 'Tu análisis ha sido evaluado correctamente.',
        score: response.score,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(response.score, elapsedTime);
    } catch (err) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: (err instanceof Error ? err.message : null) || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    }
  };

  // Attach actions to ref

  useEffect(() => {
    resolvedActionsRef.current = {
      handleReset,
      handleCheck: handleVerify,
      specificActions: [
        {
          label: 'Guardar',
          icon: <Save className="h-4 w-4" />,
          onClick: handleSave,
          variant: 'blue',
        },
      ],
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resolvedActionsRef, annotations]);

  return (
    <>
      <UnifiedExerciseLayout
        title={exercise.title}
        description={exercise.description}
        icon={<Image className="h-6 w-6" />}
        headerActions={
          <>
            <DetectiveButton
              variant={isAdding ? 'secondary' : 'gold'}
              icon={<Plus />}
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? 'Cancelar' : 'Añadir Anotación'}
            </DetectiveButton>
            {isAdding && (
              <p className="flex items-center text-detective-text-secondary text-sm ml-2">
                Click en la imagen para agregar una anotación
              </p>
            )}
          </>
        }
        cardPadding="lg"
      >
        {/* Multi-meme navigation */}
        {hasMultipleMemes && (
          <div className="mb-4 flex items-center justify-between rounded-detective border-2 border-detective-border bg-detective-bg-secondary p-3">
            <DetectiveButton
              variant="secondary"
              icon={<ChevronLeft className="h-4 w-4" />}
              onClick={() => setCurrentMemeIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentMemeIndex === 0}
            >
              Anterior
            </DetectiveButton>
            <span className="text-detective-sm font-medium text-detective-text">
              Meme {currentMemeIndex + 1} de {memeList.length}
              {currentMeme?.format && (
                <span className="ml-2 text-detective-text-secondary">— {currentMeme.format}</span>
              )}
            </span>
            <DetectiveButton
              variant="secondary"
              onClick={() => setCurrentMemeIndex((prev) => Math.min(memeList.length - 1, prev + 1))}
              disabled={currentMemeIndex === memeList.length - 1}
            >
              Siguiente
              <ChevronRight className="h-4 w-4" />
            </DetectiveButton>
          </div>
        )}

        <MemeAnnotator
          memeUrl={currentMemeUrl}
          annotations={annotations}
          onAddAnnotation={handleAddAnnotation}
          isAddingMode={isAdding}
        />

        {/* Annotations List */}
        {annotations.length > 0 && (
          <div className="mt-6">
            <h2 className="mb-4 text-detective-lg font-bold text-detective-text">
              Anotaciones ({annotations.length})
            </h2>
            <div className="space-y-3">
              {annotations.map((annotation, idx) => (
                <motion.div
                  key={annotation.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="rounded-detective border-2 border-detective-border p-2 sm:p-4 transition-colors hover:border-detective-orange"
                >
                  {editingAnnotation?.id === annotation.id ? (
                    <div className="space-y-3">
                      <div>
                        <label className="mb-2 block text-detective-sm font-medium text-detective-text">
                          Categoría:
                        </label>
                        <select
                          value={annotation.category}
                          onChange={(e) =>
                            handleUpdateAnnotation(annotation.id, {
                              category: e.target.value as MemeAnnotation['category'],
                            })
                          }
                          className="w-full rounded-detective border-2 border-detective-border px-3 py-2 focus:border-detective-orange focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat.charAt(0).toUpperCase() + cat.slice(1)}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-2 block text-detective-sm font-medium text-detective-text">
                          Texto:
                        </label>
                        <textarea
                          value={annotation.text}
                          onChange={(e) =>
                            handleUpdateAnnotation(annotation.id, { text: e.target.value })
                          }
                          rows={3}
                          className="w-full resize-none rounded-detective border-2 border-detective-border px-3 py-2 focus:border-detective-orange focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <DetectiveButton
                          variant="primary"
                          onClick={() => setEditingAnnotation(null)}
                        >
                          Guardar
                        </DetectiveButton>
                        <DetectiveButton
                          variant="secondary"
                          onClick={() => setEditingAnnotation(null)}
                        >
                          Cancelar
                        </DetectiveButton>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-2 flex items-center gap-2">
                          <span className="rounded-full bg-detective-orange px-2 py-1 text-detective-xs text-white">
                            {annotation.category}
                          </span>
                        </div>
                        <p className="text-detective-text">{annotation.text}</p>
                      </div>
                      <div className="flex gap-2">
                        <DetectiveButton
                          variant="blue"
                          onClick={() => setEditingAnnotation(annotation)}
                        >
                          Editar
                        </DetectiveButton>
                        <DetectiveButton
                          variant="secondary"
                          icon={<Trash2 className="h-4 w-4" />}
                          onClick={() => handleDeleteAnnotation(annotation.id)}
                        >
                          Eliminar
                        </DetectiveButton>
                      </div>
                    </div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap gap-3">
          <DetectiveButton variant="secondary" onClick={onExit}>
            Salir
          </DetectiveButton>
          <DetectiveButton variant="blue" icon={<Save />} onClick={handleSave}>
            Guardar Progreso
          </DetectiveButton>
          <DetectiveButton variant="gold" onClick={handleReset}>
            Reiniciar
          </DetectiveButton>
          <DetectiveButton
            variant="primary"
            onClick={handleSubmit}
            disabled={annotations.length < 3 || isSubmitting || isSubmitted}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Enviando...
              </>
            ) : isSubmitted ? (
              <>
                <CheckCircle className="h-5 w-5" />
                Enviado
              </>
            ) : (
              <>
                <Send className="h-5 w-5" />
                Enviar Respuestas
              </>
            )}
          </DetectiveButton>
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
            if (feedback.type === 'success' && feedback.score) {
              onComplete?.(feedback.score, timeSpent);
            }
          }}
          onRetry={handleReset}
        />
      )}
    </>
  );
};

export default AnalisisMemesExercise;
