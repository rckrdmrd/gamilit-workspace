import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Image, Plus, Trash2, Save, Send, Loader2, CheckCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import { MemeAnnotator } from './MemeAnnotator';
import { AnalisisMemesData, MemeAnnotation } from './analisisMemesTypes';
import {
  calculateScore,
  saveProgress,
  FeedbackData,
} from '@shared/components/mechanics/mechanicsTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

interface ProgressData {
  progress: {
    currentStep: number;
    totalSteps: number;
    score: number;
    hintsUsed: number;
    timeSpent: number;
  };
  answers: Record<string, unknown>;
}

interface ExerciseProps {
  exerciseId: string;
  userId?: string;
  onComplete?: (score: number, timeSpent: number) => void;
  onExit?: () => void;
  onProgressUpdate?: (data: ProgressData) => void;
  initialData?: ExerciseState;
  difficulty?: 'easy' | 'medium' | 'hard';
  exercise?: AnalisisMemesData;
}

interface ExerciseState {
  annotations: MemeAnnotation[];
}

const defaultExercise: AnalisisMemesData = {
  id: 'analisis-memes',
  title: 'Análisis de Memes',
  description: 'Analiza la imagen del meme e identifica elementos clave',
  difficulty: 'medium' as any,
  estimatedTime: 600,
  topic: 'Análisis de textos digitales',
  hints: [],
  memeUrl: 'https://via.placeholder.com/600x400?text=Meme+Example',
  memeTitle: 'Meme sobre Marie Curie',
  expectedAnnotations: [],
};

export const AnalisisMemesExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onExit,
  onProgressUpdate,
  initialData,
  exercise = defaultExercise,
}) => {
  const [annotations, setAnnotations] = useState<MemeAnnotation[]>(initialData?.annotations || []);
  const [isAdding, setIsAdding] = useState(false);
  const [editingAnnotation, setEditingAnnotation] = useState<MemeAnnotation | null>(null);
  const [startTime] = useState(new Date());
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const {
    submit,
    isSubmitting,
  } = useExerciseSubmission(exerciseId || '', {
    onSuccess: (result) => {
      setIsSubmitted(true);
      const timeSpent = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);

      // Verificar si está pendiente de revisión manual
      if (result.status === 'pending_review' || result.requiresManualReview) {
        setFeedback({
            type: 'info',
            title: 'Análisis Enviado',
            message: 'Tu análisis ha sido enviado para revisión del maestro. Recibirás tus recompensas cuando sea evaluado.',
          pendingReview: true,
          xpEarned: 0,
          mlCoinsEarned: 0,
        });
        setShowFeedback(true);
        onComplete?.(0, timeSpent);
        return;
      }

      // Flujo normal cuando ya está evaluado
      setFeedback({
        type: 'success',
        title: '¡Análisis Completado!',
        message: 'Tu análisis ha sido evaluado correctamente.',
        score: result.score,
        xpEarned: result.rewards?.xp || 0,
        mlCoinsEarned: result.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);
      onComplete?.(result.score, timeSpent);
    },
    onError: (err) => {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: err?.message || 'Hubo un problema. Intenta de nuevo.',
        score: 0,
      });
      setShowFeedback(true);
    },
  });

  const actionsRef = useRef<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>({});

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
      const currentState: ExerciseState = { annotations };
      saveProgress(exerciseId, currentState);
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

  // Handle check/verification
  const handleCheck = async () => {
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
      message: `Has identificado ${annotations.length} elementos en el meme. Buen trabajo analizando los diferentes aspectos.`,
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
    const currentState: ExerciseState = { annotations };
    saveProgress(exerciseId, currentState);

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
  const handleSubmit = () => {
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

    submit({
      // Primary format expected by AnalisisMemesAnswerDto
      annotations: dtoAnnotations,
      analysis: {
        message: analysisMessage || 'Análisis del meme sobre Marie Curie',
      },

      // Metadata for backwards compatibility and context
      metadata: {
        memeId: exercise.id,
        memeTitle: exercise.memeTitle || exercise.title,
        fullAnnotations: annotations, // Include category info for grading
        selectedCategories: [...new Set(annotations.map((a) => a.category))],
        annotationCount: annotations.length,
      },
    });
  };

  // Attach actions to ref

  useEffect(() => {
    actionsRef.current = {
      handleReset,
      handleCheck,
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
  }, [actionsRef]);

  return (
    <>
      <DetectiveCard variant="default" padding="lg" className="mb-6">
        <div className="mb-6 rounded-xl bg-gradient-to-r from-detective-blue to-detective-orange p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center gap-3">
            <Image className="h-8 w-8" />
            <h2 className="text-detective-2xl font-bold">{exercise.title}</h2>
          </div>
          <p className="mb-4 opacity-90">{exercise.description}</p>
          <div className="flex flex-wrap gap-3">
            <DetectiveButton
              variant={isAdding ? 'secondary' : 'gold'}
              icon={<Plus />}
              onClick={() => setIsAdding(!isAdding)}
            >
              {isAdding ? 'Cancelar' : 'Añadir Anotación'}
            </DetectiveButton>
            {isAdding && (
              <p className="flex items-center text-detective-text-secondary">
                Click en la imagen para agregar una anotación
              </p>
            )}
          </div>
        </div>

        <MemeAnnotator
          memeUrl={exercise.memeUrl}
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
                  className="rounded-detective border-2 border-detective-border p-4 transition-colors hover:border-detective-orange"
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
      </DetectiveCard>

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
