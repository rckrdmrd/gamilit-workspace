/**
 * ExerciseContext + ExerciseProvider
 *
 * Composes all exercise hooks into a single context.
 * Eliminates prop drilling between ExercisePage, sidebar, mechanic, etc.
 *
 * @version 1.0.0
 * @since Phase 2 - Exercise System Restructuring
 */
import { createContext, useContext, useCallback, useRef, useState, useEffect, type ComponentType, type MutableRefObject, type ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import type { UserGamificationSummary } from '@/services/api/gamification/gamificationAPI';
import type { User } from '@/features/auth/types/auth.types';
import { useExerciseData, type ExerciseData, type PedagogicalGuide } from '../hooks/useExerciseData';
import { useExerciseComodines, type UseExerciseComodinesReturn } from '../hooks/useExerciseComodines';
import { useExerciseProgress, type ExerciseProgress, type ProgressUpdate } from '../hooks/useExerciseProgress';
import { useExercisePowerUps, type PowerUpEffects } from '@/apps/student/hooks/useExercisePowerUps';
import type { PowerUp as GamificationPowerUp, ActivePowerUp as GamificationActivePowerUp } from '@/features/gamification/social/types/powerUpsTypes';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import { submitExercise } from '@/services/api/educationalAPI';
import type { ExerciseMechanicActions, ExerciseComodinesContext, ExerciseRegistryEntry } from '../types/exercise-mechanic.types';
import type { ComodinType } from '../types/exercise.types';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { MANUAL_REVIEW_PENDING_MESSAGE } from '@/features/mechanics/constants/manualReviewMessages';
import { ConfirmDialog } from '@/shared/components/common/ConfirmDialog';

// ============================================================================
// CONTEXT TYPE
// ============================================================================

export interface ExerciseContextValue {
  // === Auth & User ===
  user: User | null;
  logout: () => Promise<void>;
  gamificationData: UserGamificationSummary | null;

  // === Exercise Data ===
  exercise: ExerciseData | null;
  adaptedExercise: Record<string, unknown> | null;
  mechanicEntry: ExerciseRegistryEntry | undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  MechanicComponent: ComponentType<any> | null;
  isLoading: boolean;
  loadError: string | null;
  hints: string[];
  pedagogicalGuide: PedagogicalGuide;
  isInactive: boolean;

  // === Progress ===
  progress: ExerciseProgress;
  userAnswers: unknown;
  hasUnsavedChanges: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
  lastSavedAt: Date | null;
  startTime: Date;
  handleProgressUpdate: (update: Partial<ExerciseProgress> | ProgressUpdate) => void;
  handleSaveProgress: () => Promise<void>;

  // === Comodines (new — real API) ===
  comodines: UseExerciseComodinesReturn;

  // === Legacy Power-ups (existing hook) ===
  powerUps: {
    availablePowerUps: GamificationPowerUp[];
    activePowerUps: GamificationActivePowerUp[];
    activatePowerUp: (id: string) => Promise<boolean>;
    getUsedPowerUps: () => string[];
    effects: PowerUpEffects;
    isLoading: boolean;
    error: string | null;
  };

  // === Comodines context for mechanic components ===
  comodinesContext: ExerciseComodinesContext;

  // === Actions ===
  handleSubmit: () => Promise<void>;
  handleSkip: () => void;
  handleComplete: () => void;
  navigateBack: () => void;

  // === Mechanic actions ref ===
  mechanicActionsRef: MutableRefObject<ExerciseMechanicActions>;

  // === Feedback ===
  feedback: FeedbackData | null;
  showFeedback: boolean;
  setShowFeedback: (show: boolean) => void;
  setFeedback: (feedback: FeedbackData | null) => void;

  // === Coins ===
  availableCoins: number;

  // === Route params ===
  exerciseId: string;
  moduleId: string | undefined;
}

// ============================================================================
// CONTEXT
// ============================================================================

const ExerciseContext = createContext<ExerciseContextValue | null>(null);

/**
 * Hook to access exercise context. Must be used within ExerciseProvider.
 */
export function useExerciseContext(): ExerciseContextValue {
  const ctx = useContext(ExerciseContext);
  if (!ctx) {
    throw new Error('useExerciseContext must be used within an ExerciseProvider');
  }
  return ctx;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface ExerciseProviderProps {
  exerciseId: string;
  children: ReactNode;
}

export function ExerciseProvider({ exerciseId, children }: ExerciseProviderProps) {
  const { moduleId } = useParams();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);
  const { syncAndInvalidate } = useInvalidateDashboard();

  // === Compose hooks ===
  const exerciseData = useExerciseData(exerciseId);
  const progressHook = useExerciseProgress(exerciseId);
  const comodines = useExerciseComodines(
    exerciseId,
    user?.id,
    (exerciseData.exercise?.mechanicData as Record<string, unknown> | undefined)?.comodines_allowed as ComodinType[] | null ?? null,
  );

  // Legacy power-ups hook
  const powerUps = useExercisePowerUps({
    exerciseId: exerciseId || '',
    userId: user?.id,
  });

  // Feedback state
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [availableCoins, setAvailableCoins] = useState(350);

  // Skip confirmation dialog state
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);

  // Mechanic actions ref
  const mechanicActionsRef = useRef<ExerciseMechanicActions>({});

  // Set initial feedback from load error
  useEffect(() => {
    if (exerciseData.error && !feedback) {
      setFeedback({
        type: 'info',
        title: 'Modo sin conexión',
        message: exerciseData.error,
      });
    }
  }, [exerciseData.error, feedback]);

  // Set recovery feedback
  useEffect(() => {
    if (progressHook.autoSaveStatus === 'saved' && progressHook.lastSavedAt) {
      // Recovery happened
    }
  }, [progressHook.autoSaveStatus, progressHook.lastSavedAt]);

  // Merge comodines context from both new and legacy hooks
  const comodinesContext: ExerciseComodinesContext = {
    hintsRevealed: comodines.comodinesContext.hintsRevealed + powerUps.effects.hintsRevealed,
    visionActive: comodines.comodinesContext.visionActive || powerUps.effects.visionActive,
    hasSecondChance: comodines.comodinesContext.hasSecondChance || powerUps.effects.hasSecondChance,
    timeExtension: comodines.comodinesContext.timeExtension + powerUps.effects.timeExtension,
    multiplierActive: comodines.comodinesContext.multiplierActive || powerUps.effects.multiplierActive,
  };

  // === HANDLERS ===

  const handleSubmit = useCallback(async () => {
    if (!exerciseId) return;

    // Delegate to mechanic's own submission logic if available.
    // Self-submitting exercises (e.g. Podcast, DebateDigital, AnalisisFuentes)
    // have fresh local state + client-side validation + audio upload.
    if (mechanicActionsRef.current.handleCheck) {
      mechanicActionsRef.current.handleCheck();
      return;
    }

    if (!progressHook.userAnswers) {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron obtener tus respuestas. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
      return;
    }

    try {
      const usedPowerUpsList = powerUps.getUsedPowerUps();
      const usedComodinTypes = comodines.getUsedComodinTypes();

      const result = await submitExercise(exerciseId, {
        answers: progressHook.userAnswers,
        startedAt: progressHook.startTime.getTime(),
        hintsUsed: progressHook.progress.hintsUsed || 0,
        powerupsUsed: [...(usedPowerUpsList || []), ...usedComodinTypes],
      });

      await syncAndInvalidate();

      // M3-M5: ejercicio requiere revision manual — no mostrar rewards aun
      if (result.requiresManualReview || result.status === 'pending_review') {
        setFeedback({
          type: 'info',
          title: 'Ejercicio Completado',
          message: MANUAL_REVIEW_PENDING_MESSAGE,
          pendingReview: true,
          timeSpent: Math.floor((Date.now() - progressHook.startTime.getTime()) / 1000),
          hintsUsed: progressHook.progress.hintsUsed || 0,
        });
        setShowFeedback(true);
        return;
      }

      // Flujo normal: auto-graded (M1-M2)
      const xpEarned = result.rewards?.xp ?? 0;
      const mlCoinsEarned = result.rewards?.mlCoins ?? 0;
      let feedbackMessage = `Has obtenido ${result.score} puntos. Ganaste ${xpEarned} XP y ${mlCoinsEarned} ML Coins.`;

      if (result.rewards?.bonuses && result.rewards.bonuses.length > 0) {
        const bonusDetails = result.rewards.bonuses.map((b: { amount: number; type: string }) => `+${b.amount} ${b.type}`).join(', ');
        feedbackMessage += ` Bonos: ${bonusDetails}`;
      }

      if (result.rankUp) {
        feedbackMessage += `\n\n¡Felicidades! Has subido de rango: ${result.rankUp.previousRank} → ${result.rankUp.newRank}`;
        if (result.rankUp.unlockedFeatures?.length > 0) {
          feedbackMessage += `\nNuevas funciones desbloqueadas: ${result.rankUp.unlockedFeatures.join(', ')}`;
        }
      }

      setFeedback({
        type: 'success',
        title: result.isPerfect ? '¡Perfecto!' : 'Ejercicio Completado',
        message: feedbackMessage,
        score: result.score,
        maxScore: 100,
        xpEarned,
        mlCoinsEarned,
        showConfetti: result.isPerfect || result.score >= 80 || !!result.rankUp,
        achievements: result.achievements?.map((a: { name: string; description?: string; icon?: string; rarity?: string; mlCoinsReward?: number; xpReward?: number }) => ({
          name: a.name,
          description: a.description || '',
          icon: a.icon || 'trophy',
          rarity: a.rarity ?? 'common',
          mlCoinsReward: a.mlCoinsReward ?? 0,
          xpReward: a.xpReward ?? 0,
        })),
        rankUp: result.rankUp ? {
          newRank: result.rankUp.newRank,
          previousRank: result.rankUp.previousRank,
          bonusMLCoins: 0,
          newMultiplier: 1,
        } : null,
        timeSpent: Math.floor((Date.now() - progressHook.startTime.getTime()) / 1000),
        hintsUsed: progressHook.progress.hintsUsed || 0,
      });
      setShowFeedback(true);

      if (mlCoinsEarned) {
        setAvailableCoins((prev) => prev + mlCoinsEarned);
      }
    } catch (error) {
      console.error('Error submitting exercise:', error);
      setFeedback({
        type: 'error',
        title: 'Error al enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  }, [exerciseId, progressHook, powerUps, comodines, syncAndInvalidate]);

  const handleSkip = useCallback(() => {
    setShowSkipConfirm(true);
  }, []);

  const confirmSkip = useCallback(() => {
    setShowSkipConfirm(false);
    const targetModuleId = exerciseData.exercise?.module_id || moduleId;
    if (targetModuleId && targetModuleId !== 'undefined') {
      navigate(`/modules/${targetModuleId}`);
    } else {
      navigate('/dashboard');
    }
  }, [exerciseData.exercise, moduleId, navigate]);

  const handleComplete = useCallback(() => {
    // Guard: M3-M5 exercises handle their own pending review feedback.
    // Do not show a second success modal if feedback is already active.
    if (feedback?.pendingReview || showFeedback) {
      return;
    }
    setFeedback({
      type: 'success',
      title: '¡Ejercicio Completado!',
      message: `¡Excelente trabajo! Has ganado ${exerciseData.exercise?.points} puntos.`,
      showConfetti: true,
    });
    setShowFeedback(true);
  }, [exerciseData.exercise, feedback, showFeedback]);

  const navigateBack = useCallback(() => {
    const targetModuleId = exerciseData.exercise?.module_id || moduleId;
    if (targetModuleId && targetModuleId !== 'undefined') {
      navigate(`/modules/${targetModuleId}`);
    } else {
      navigate('/dashboard');
    }
  }, [exerciseData.exercise, moduleId, navigate]);

  // === CONTEXT VALUE ===

  const value: ExerciseContextValue = {
    user,
    logout,
    gamificationData,

    exercise: exerciseData.exercise,
    adaptedExercise: exerciseData.adaptedExercise,
    mechanicEntry: exerciseData.mechanicEntry,
    MechanicComponent: exerciseData.MechanicComponent,
    isLoading: exerciseData.isLoading,
    loadError: exerciseData.error,
    hints: exerciseData.hints,
    pedagogicalGuide: exerciseData.pedagogicalGuide,
    isInactive: exerciseData.isInactive,

    progress: progressHook.progress,
    userAnswers: progressHook.userAnswers,
    hasUnsavedChanges: progressHook.hasUnsavedChanges,
    autoSaveStatus: progressHook.autoSaveStatus,
    lastSavedAt: progressHook.lastSavedAt,
    startTime: progressHook.startTime,
    handleProgressUpdate: progressHook.handleProgressUpdate,
    handleSaveProgress: progressHook.handleSaveProgress,

    comodines,
    powerUps: {
      availablePowerUps: powerUps.availablePowerUps,
      activePowerUps: powerUps.activePowerUps,
      activatePowerUp: powerUps.activatePowerUp,
      getUsedPowerUps: powerUps.getUsedPowerUps,
      effects: powerUps.effects,
      isLoading: powerUps.isLoading,
      error: powerUps.error,
    },
    comodinesContext,

    handleSubmit,
    handleSkip,
    handleComplete,
    navigateBack,

    mechanicActionsRef,

    feedback,
    showFeedback,
    setShowFeedback,
    setFeedback,

    availableCoins,

    exerciseId,
    moduleId,
  };

  return (
    <ExerciseContext.Provider value={value}>
      {children}
      <ConfirmDialog
        isOpen={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={confirmSkip}
        title="Omitir ejercicio"
        message="¿Estás seguro de que deseas omitir este ejercicio?"
        confirmText="Omitir"
        variant="warning"
      />
    </ExerciseContext.Provider>
  );
}
