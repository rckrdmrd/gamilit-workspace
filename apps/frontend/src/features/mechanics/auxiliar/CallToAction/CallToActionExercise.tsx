import React, { useState, useEffect, useCallback } from 'react';
import { Megaphone, Users, Share2, CheckCircle, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { UnifiedExerciseLayout } from '@shared/components/exercises/UnifiedExerciseLayout';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { CallToActionExerciseProps, Campaign } from './callToActionTypes';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useInvalidateDashboard } from '@/shared/hooks';

const DEFAULT_CAUSES = [
  'Más mujeres en STEM',
  'Becas científicas para mujeres',
  'Reconocimiento a científicas',
  'Educación científica inclusiva',
  'Igualdad en investigación',
];

const DEFAULT_TAGS = [
  'Ciencia',
  'Educación',
  'Igualdad',
  'Marie Curie',
  'Mujeres',
  'Investigación',
  'Nobel',
  'Física',
  'Química',
];

export const CallToActionExercise: React.FC<CallToActionExerciseProps> = ({
  exercise,
  onComplete,
  onProgressUpdate,
  actionsRef,
}) => {
  const { user } = useAuth();
  const { syncAndInvalidate } = useInvalidateDashboard();
  const { submitAsync } = useExerciseSubmission(exercise?.id || 'unknown');


  const [title, setTitle] = useState('');
  const [cause, setCause] = useState('');
  const [description, setDescription] = useState('');
  const [goal, setGoal] = useState(exercise.minGoal || 100);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [startTime] = useState(new Date());
  const [hintsUsed] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [validated, setValidated] = useState(false);

  const causes = exercise.availableCauses || DEFAULT_CAUSES;
  const availableTags = exercise.availableTags || DEFAULT_TAGS;
  const minGoal = exercise.minGoal || 50;
  const maxGoal = exercise.maxGoal || 1000;
  const goalStep = exercise.goalStep || 50;
  const minCampaigns = exercise.minCampaigns || 1;

  // Progress update effect
  useEffect(() => {
    if (onProgressUpdate) {
      onProgressUpdate({
        progress: {
          currentStep: campaigns.length,
          totalSteps: minCampaigns,
          score: 0, // Score calculated by backend
          hintsUsed,
          timeSpent: Math.floor((new Date().getTime() - startTime.getTime()) / 1000),
        },
        answers: { campaigns },
      });

    }
  }, [campaigns, hintsUsed, onProgressUpdate, minCampaigns, startTime]);

  const handleCreateCampaign = () => {
    if (validated || !title || !cause || !description) return;

    const newCampaign: Campaign = {
      id: Date.now().toString(),
      title,
      cause,
      description,
      goal,
      signatures: Math.floor(Math.random() * 50),
      tags: selectedTags,
    };

    setCampaigns([newCampaign, ...campaigns]);
    setTitle('');
    setDescription('');
    setSelectedTags([]);
  };

  const removeCampaign = (id: string) => {
    if (validated) return;
    setCampaigns(campaigns.filter((c) => c.id !== id));
  };

  const toggleTag = (tag: string) => {
    if (validated) return;
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const signCampaign = (id: string) => {
    setCampaigns(
      campaigns.map((c) => (c.id === id ? { ...c, signatures: c.signatures + 1 } : c)),
    );
  };

  const handleCheck = useCallback(async () => {
    if (validated || isSubmitting) return;

    if (campaigns.length < minCampaigns) {
      setFeedback({
        type: 'error',
        title: 'Campañas Insuficientes',
        message: `Necesitas crear al menos ${minCampaigns} campaña(s). Tienes ${campaigns.length}.`,
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
      const response = await submitAsync({ campaigns });

      setValidated(true);

      setFeedback({
        type: response.isPerfect ? 'success' : response.score >= 70 ? 'partial' : 'error',
        title: response.isPerfect
          ? '¡Campaña Inspiradora!'
          : response.score >= 70
            ? '¡Buen trabajo!'
            : 'Sigue mejorando',
        message:
          response.feedback?.overall ||
          `Tus campañas han sido evaluadas con ${Math.round(response.score)}%. Ganaste ${response.rewards?.xp || 0} XP y ${response.rewards?.mlCoins || 0} ML Coins.`,
        score: response.score,
        showConfetti: response.isPerfect,
        xpEarned: response.rewards?.xp || 0,
        mlCoinsEarned: response.rewards?.mlCoins || 0,
      });
      setShowFeedback(true);

      await syncAndInvalidate();

    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al Enviar',
        message: 'Hubo un problema al enviar tus campañas. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    } finally {
      setIsSubmitting(false);
    }
  }, [campaigns, validated, isSubmitting, user, exercise.id, minCampaigns, syncAndInvalidate]);

  const handleReset = useCallback(() => {
    setCampaigns([]);
    setTitle('');
    setCause('');
    setDescription('');
    setGoal(minGoal);
    setSelectedTags([]);
    setValidated(false);
    setShowFeedback(false);
    setFeedback(null);
  }, [minGoal]);

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
        title={exercise.title || 'Call to Action'}
        description={exercise.instructions || `Crea una campaña de acción social inspirada en ${exercise.topic || 'el legado de Marie Curie'}.`}
        icon={<Megaphone className="h-8 w-8" />}
        headerActions={
          <span className="rounded-full bg-detective-bg-secondary px-3 py-1 text-sm text-detective-text-secondary">
            {campaigns.length}/{minCampaigns} campaña(s) mínima(s)
          </span>
        }
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <DetectiveCard variant="default" padding="lg" className="space-y-4">
              <h3 className="text-xl font-bold text-detective-text">Nueva Campaña</h3>

              <div>
                <label className="mb-2 block font-medium text-detective-text">
                  Título de la campaña:
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  disabled={validated}
                  placeholder="Más mujeres en la ciencia"
                  className="w-full rounded-detective border-2 border-detective-border px-4 py-2 focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">Causa:</label>
                <select
                  value={cause}
                  onChange={(e) => setCause(e.target.value)}
                  disabled={validated}
                  className="w-full rounded-detective border-2 border-detective-border px-4 py-2 focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecciona una causa...</option>
                  {causes.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">Descripción:</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={validated}
                  rows={4}
                  placeholder="Describe tu campaña, por qué es importante y qué cambio buscas..."
                  className="w-full resize-none rounded-detective border-2 border-detective-border px-4 py-2 focus:border-detective-orange focus:outline-none disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">
                  Meta de firmas: {goal}
                </label>
                <input
                  type="range"
                  min={minGoal}
                  max={maxGoal}
                  step={goalStep}
                  value={goal}
                  onChange={(e) => setGoal(parseInt(e.target.value))}
                  disabled={validated}
                  className="w-full accent-detective-orange disabled:cursor-not-allowed disabled:opacity-50"
                />
              </div>

              <div>
                <label className="mb-2 block font-medium text-detective-text">Etiquetas:</label>
                <div className="flex flex-wrap gap-2">
                  {availableTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => toggleTag(tag)}
                      disabled={validated}
                      className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                        selectedTags.includes(tag)
                          ? 'bg-detective-orange text-white'
                          : 'bg-detective-bg-secondary text-detective-text hover:bg-gray-300'
                      } disabled:cursor-not-allowed disabled:opacity-50`}
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreateCampaign}
                disabled={validated || !title || !cause || !description}
                className="w-full rounded-detective bg-detective-orange py-3 font-medium text-white transition-colors hover:bg-detective-orange-dark disabled:cursor-not-allowed disabled:bg-gray-300"
              >
                Crear Campaña
              </button>
            </DetectiveCard>

            <div className="space-y-4">
              <h3 className="text-xl font-bold text-detective-text">Campañas Activas</h3>
              {campaigns.map((campaign) => (
                <DetectiveCard key={campaign.id} variant="default" padding="lg">
                  <div className="mb-2 flex items-start justify-between">
                    <h4 className="text-xl font-bold text-detective-text">{campaign.title}</h4>
                    {!validated && (
                      <button
                        onClick={() => removeCampaign(campaign.id)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    )}
                  </div>
                  <p className="mb-3 font-medium text-detective-blue">{campaign.cause}</p>
                  <p className="mb-4 text-detective-text-secondary">{campaign.description}</p>

                  <div className="mb-4 flex flex-wrap gap-2">
                    {campaign.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded bg-detective-bg px-2 py-1 text-xs text-detective-text"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>

                  <div className="mb-4">
                    <div className="mb-2 flex justify-between">
                      <span className="font-medium text-detective-text">
                        {campaign.signatures} firmas
                      </span>
                      <span className="text-detective-text-secondary">Meta: {campaign.goal}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-detective-bg-secondary">
                      <div
                        className="h-3 rounded-full bg-detective-orange transition-all"
                        style={{
                          width: `${Math.min((campaign.signatures / campaign.goal) * 100, 100)}%`,
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => signCampaign(campaign.id)}
                      className="flex flex-1 items-center justify-center gap-2 rounded-detective bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark"
                    >
                      <CheckCircle className="h-5 w-5" />
                      Firmar Petición
                    </button>
                    <button
                      onClick={() => toast.success('Compartiendo en redes sociales...')}
                      className="flex items-center gap-2 rounded-detective bg-detective-blue px-4 py-2 font-medium text-white transition-colors hover:bg-detective-blue/90"
                    >
                      <Share2 className="h-5 w-5" />
                      Compartir
                    </button>
                  </div>
                </DetectiveCard>
              ))}

              {campaigns.length === 0 && (
                <div className="py-12 text-center text-detective-text-secondary">
                  <Users className="mx-auto mb-4 h-16 w-16 opacity-50" />
                  <p>No hay campañas todavía</p>
                  <p className="text-sm">Crea la primera campaña inspirada en Marie Curie</p>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-detective bg-gradient-to-r from-detective-orange to-detective-gold p-6 text-white shadow-lg">
              <h3 className="mb-4 text-xl font-bold">Impacto</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-white/80">Campañas creadas</p>
                  <p className="text-3xl font-bold">{campaigns.length}</p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Total de firmas</p>
                  <p className="text-3xl font-bold">
                    {campaigns.reduce((sum, c) => sum + c.signatures, 0)}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-white/80">Campañas completadas</p>
                  <p className="text-3xl font-bold">
                    {campaigns.filter((c) => c.signatures >= c.goal).length}
                  </p>
                </div>
              </div>
            </div>

            <DetectiveCard variant="default" padding="lg">
              <h3 className="mb-3 font-bold text-detective-text">💡 Consejos:</h3>
              <ul className="space-y-2 text-sm text-detective-text-secondary">
                <li>• Sé específico en tu propuesta</li>
                <li>• Explica por qué es importante</li>
                <li>• Conecta con el legado de Marie Curie</li>
                <li>• Propón acciones concretas</li>
                <li>• Inspira a otros a actuar</li>
              </ul>
            </DetectiveCard>
          </div>
        </div>
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

export default CallToActionExercise;
