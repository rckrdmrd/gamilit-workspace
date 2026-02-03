import React, { useState, useEffect, useCallback } from 'react';
import { Image, Type, Plus, Trash2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { CollagePrensaExerciseProps, CollageElement } from './collagePrensaTypes';
import { submitExercise } from '@/features/progress/api/progressAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

export const CollagePrensaExercise: React.FC<CollagePrensaExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();

  const [elements, setElements] = useState<CollageElement[]>([]);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [validated, setValidated] = useState(false);

  const minElements = exercise.minElements || 3;
  const newspaperTitle = exercise.newspaperTitle || 'LE JOURNAL SCIENTIFIQUE';
  const newspaperDate = exercise.newspaperDate || 'Paris, 1903';

  // Progress update effect
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep: elements.length,
          totalSteps: minElements,
          score: 0, // Score calculated by backend
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { elements },
      });

      console.log('📊 [CollagePrensa] Progress update sent:', {
        elementsCount: elements.length,
        minRequired: minElements,
      });
    }
  }, [elements, hintsUsed, onProgressUpdate, minElements, startTime]);

  const addHeadline = () => {
    if (validated) return;
    const defaultText = exercise.suggestedHeadlines?.[0] || 'MARIE CURIE GANA PREMIO NOBEL';
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'headline',
      content: defaultText,
      x: 10,
      y: 10 + elements.length * 5,
      width: 80,
      height: 15,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addText = () => {
    if (validated) return;
    const defaultText = exercise.suggestedTexts?.[0] || 'La científica descubre el radio...';
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'text',
      content: defaultText,
      x: 10,
      y: 30 + elements.length * 5,
      width: 40,
      height: 20,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const addImage = (file: File) => {
    if (validated) return;
    const url = URL.createObjectURL(file);
    const newElement: CollageElement = {
      id: Date.now().toString(),
      type: 'image',
      content: url,
      x: 20,
      y: 20 + elements.length * 5,
      width: 30,
      height: 30,
      rotation: 0,
    };
    setElements([...elements, newElement]);
  };

  const removeElement = (id: string) => {
    if (validated) return;
    setElements(elements.filter((e) => e.id !== id));
    if (selectedElement === id) setSelectedElement(null);
  };

  const handleCheck = useCallback(async () => {
    if (validated || isSubmitting) return;

    if (elements.length < minElements) {
      setFeedback({
        type: 'error',
        title: 'Elementos Insuficientes',
        message: `Tu collage necesita al menos ${minElements} elementos. Tienes ${elements.length}.`,
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
      const response = await submitExercise(exercise.id, user.id, { elements });

      setValidated(true);

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Excelente Collage!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Sigue mejorando',
        message:
          response.feedback?.overall ||
          `Tu collage ha sido evaluado con ${Math.round(response.score)}%. Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      await syncAndInvalidate();

      console.log('✅ [CollagePrensa] Submission successful:', {
        attemptId: response.attemptId,
        score: response.score,
        rewards: response.rewards,
      });
    } catch (error) {
      console.error('❌ [CollagePrensa] Submission error:', error);
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tu collage. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [elements, validated, isSubmitting, user, exercise.id, minElements, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    setElements([]);
    setSelectedElement(null);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, []);

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
      <div className="space-y-6">
        <DetectiveCard variant="default" padding="lg">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Image className="h-8 w-8 text-detective-orange" />
              <h1 className="text-2xl font-bold text-detective-text">
                {exercise.title || 'Collage de Prensa'}
              </h1>
            </div>
            <span className="rounded-full bg-detective-bg-secondary px-3 py-1 text-sm text-detective-text-secondary">
              {elements.length}/{minElements} elementos mínimos
            </span>
          </div>
          <p className="text-detective-text-secondary">
            {exercise.instructions || `Crea un collage estilo periódico sobre ${exercise.topic || 'Marie Curie'}.`}
          </p>
        </DetectiveCard>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          <DetectiveCard variant="default" padding="lg" className="space-y-4">
            <h3 className="font-bold text-detective-text">Herramientas</h3>

            <button
              onClick={addHeadline}
              disabled={validated}
              className="flex w-full items-center gap-2 rounded-detective bg-detective-orange px-4 py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-5 w-5" />
              Titular
            </button>

            <button
              onClick={addText}
              disabled={validated}
              className="flex w-full items-center gap-2 rounded-detective bg-detective-blue px-4 py-3 font-medium text-white transition-colors hover:bg-detective-blue/90 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Type className="h-5 w-5" />
              Texto
            </button>

            <div>
              <p className="mb-2 font-medium text-detective-text">Agregar Imágenes:</p>
              <input
                type="file"
                accept="image/*"
                disabled={validated}
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) addImage(file);
                }}
                className="w-full rounded-detective border-2 border-gray-300 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {selectedElement && !validated && (
              <button
                onClick={() => removeElement(selectedElement)}
                className="flex w-full items-center gap-2 rounded-detective bg-red-500 px-4 py-3 font-medium text-white transition-colors hover:bg-red-600"
              >
                <Trash2 className="h-5 w-5" />
                Eliminar Seleccionado
              </button>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-detective-text-secondary">
                💡 Haz clic en los elementos para seleccionarlos
              </p>
            </div>
          </DetectiveCard>

          <DetectiveCard variant="default" padding="lg" className="lg:col-span-3">
            <div
              className="relative overflow-hidden border-4 border-detective-text bg-yellow-50"
              style={{ aspectRatio: '3/4', minHeight: '600px' }}
            >
              <div className="absolute left-4 right-4 top-4 mb-4 border-b-4 border-detective-text pb-2 text-center">
                <h2 className="font-serif text-3xl font-bold text-detective-text">
                  {newspaperTitle}
                </h2>
                <p className="text-sm text-detective-text-secondary">{newspaperDate}</p>
              </div>

              {elements.map((element) => (
                <div
                  key={element.id}
                  onClick={() => !validated && setSelectedElement(element.id)}
                  className={`absolute cursor-pointer transition-all ${
                    selectedElement === element.id ? 'ring-4 ring-detective-orange' : ''
                  } ${validated ? 'cursor-default' : 'hover:ring-2 hover:ring-detective-orange/50'}`}
                  style={{
                    left: `${element.x}%`,
                    top: `${element.y}%`,
                    width: `${element.width}%`,
                    height: `${element.height}%`,
                    transform: `rotate(${element.rotation}deg)`,
                  }}
                >
                  {element.type === 'headline' && (
                    <div className="h-full bg-detective-text p-3 text-center text-lg font-bold text-white">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'text' && (
                    <div className="h-full border-2 border-detective-text bg-white p-3 text-sm">
                      {element.content}
                    </div>
                  )}
                  {element.type === 'image' && (
                    <img
                      src={element.content}
                      alt=""
                      className="h-full w-full border-2 border-detective-text object-cover"
                    />
                  )}
                </div>
              ))}

              {elements.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-detective-text-secondary">
                    <Image className="mx-auto mb-4 h-20 w-20 opacity-30" />
                    <p className="text-lg">Comienza agregando elementos</p>
                    <p className="text-sm">para crear tu collage de prensa</p>
                  </div>
                </div>
              )}
            </div>
          </DetectiveCard>
        </div>
      </div>

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

export default CollagePrensaExercise;
