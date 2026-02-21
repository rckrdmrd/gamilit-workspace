/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { StudentPageShell } from '../components/shared/StudentPageShell';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ConfirmDialog } from '@shared/components/common/ConfirmDialog';
import { ScoreDisplay } from '@shared/components/mechanics/ScoreDisplay';
import { TimerWidget } from '@shared/components/mechanics/TimerWidget';
import { ProgressTracker } from '@shared/components/mechanics/ProgressTracker';
import { HintSystem } from '@shared/components/mechanics/HintSystem';
import { FeedbackModal } from '@shared/components/mechanics/FeedbackModal';
import {
  ArrowLeft,
  Save,
  Send,
  SkipForward,
  Star,
  Loader2,
  RotateCcw,
  Check,
} from 'lucide-react';
import { LoadingSpinner } from '@shared/components/loading';
import type { FeedbackData } from '@shared/components/mechanics/mechanicsTypes';
import { DifficultyLevel } from '@shared/types/educational.types';
import {
  getExercise,
  saveExerciseProgress,
  submitExercise,
  getExerciseHints,
} from '@/services/api/educationalAPI';
import { adaptExerciseData } from '@shared/utils/exerciseAdapter';
import { ExerciseGuide } from '@/features/exercises/components/ExerciseGuide';
import { UnderConstructionExercise } from '@/features/exercises/components/UnderConstructionExercise';
import { useExerciseAutoSave } from '../hooks/useExerciseAutoSave';
import { PowerUpBar } from '../components/PowerUpBar';
import { useExercisePowerUps } from '../hooks/useExercisePowerUps';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import { ExercisePageHeader } from '../components/exercise/ExercisePageHeader';

// ============================================================================
// TYPES
// ============================================================================

interface ExerciseData {
  id: string;
  module_id: string;
  title: string;
  type: string;
  description: string;
  difficulty: DifficultyLevel;
  points: number;
  estimatedTime: number;
  completed: boolean;
  moduleTitle?: string;
  mechanicData?: any;
  is_active?: boolean; // GAP-005: Field to detect if exercise is active
}

interface ExerciseProgress {
  currentStep: number;
  totalSteps: number;
  score: number;
  hintsUsed: number;
  timeSpent: number;
  powerupsUsed?: string[];
}

// FE-055: Interface for progress updates from mechanics
interface ProgressUpdate {
  progress: Partial<ExerciseProgress>;
  answers: any; // User's actual answers (format varies by exercise type)
}

// ============================================================================
// DYNAMIC IMPORTS MAPPING
// ============================================================================

const loadMechanic = (mechanicType: string) => {
  // Validate mechanicType
  if (!mechanicType || typeof mechanicType !== 'string') {
    return null;
  }

  const mechanicMap: Record<string, () => Promise<any>> = {
    // Module 1 - Comprensión Literal
    crucigrama_cientifico: () =>
      import('@/features/mechanics/module1/Crucigrama/CrucigramaExercise'),
    crucigrama: () => import('@/features/mechanics/module1/Crucigrama/CrucigramaExercise'),
    linea_tiempo: () => import('@/features/mechanics/module1/Timeline/TimelineExercise'),
    timeline: () => import('@/features/mechanics/module1/Timeline/TimelineExercise'),
    sopa_letras: () => import('@/features/mechanics/module1/SopaLetras/SopaLetrasExercise'),
    mapa_conceptual: () =>
      import('@/features/mechanics/module1/MapaConceptual/MapaConceptualExercise'),
    emparejamiento: () =>
      import('@/features/mechanics/module1/Emparejamiento/EmparejamientoExercise'),
    verdadero_falso: () =>
      import('@/features/mechanics/module1/VerdaderoFalso/VerdaderoFalsoExercise'),
    completar_espacios: () =>
      import('@/features/mechanics/module1/CompletarEspacios/CompletarEspaciosExercise'),

    // Module 2 - Comprensión Inferencial
    detective_textual: () =>
      import('@/features/mechanics/module2/DetectiveTextual/DetectiveTextualExercise'),
    lectura_inferencial: () =>
      import('@/features/mechanics/module2/LecturaInferencial/LecturaInferencialExercise'),
    construccion_hipotesis: () =>
      import('@/features/mechanics/module2/ConstruccionHipotesis/CausaEfectoExercise'),
    prediccion_narrativa: () =>
      import('@/features/mechanics/module2/PrediccionNarrativa/PrediccionNarrativaExercise'),
    puzzle_contexto: () =>
      import('@/features/mechanics/module2/PuzzleContexto/PuzzleContextoExercise'),
    rueda_inferencias: () =>
      import('@/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise'),

    // Module 3 - Comprensión Crítica
    analisis_fuentes: () =>
      import('@/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise'),
    debate_digital: () =>
      import('@/features/mechanics/module3/DebateDigital/DebateDigitalExercise'),
    matriz_perspectivas: () =>
      import('@/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise'),
    podcast_argumentativo: () =>
      import('@/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise'),
    tribunal_opiniones: () =>
      import('@/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise'),

    // Module 4 - Textos Digitales y Multimediales
    verificador_fake_news: () =>
      import('@/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise'),
    verificador_fakenews: () =>
      import('@/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise'),
    fake_news: () =>
      import('@/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise'),
    quiz_tiktok: () => import('@/features/mechanics/module4/QuizTikTok/QuizTikTokExercise'),
    navegacion_hipertextual: () =>
      import('@/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise'),
    analisis_memes: () =>
      import('@/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise'),
    infografia_interactiva: () =>
      import('@/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise'),
    // Removed: email_formal, chat_literario, ensayo_argumentativo, resena_critica (exercises deleted)

    // Module 5 - Producción Creativa
    diario_multimedia: () =>
      import('@/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise'),
    comic_digital: () => import('@/features/mechanics/module5/ComicDigital/ComicDigitalExercise'),
    video_carta: () => import('@/features/mechanics/module5/VideoCarta/VideoCartaExercise'),

    // Auxiliar Mechanics
    call_to_action: () => import('@/features/mechanics/auxiliar/CallToAction/CallToActionExercise'),
    collage_prensa: () =>
      import('@/features/mechanics/auxiliar/CollagePrensa/CollagePrensaExercise'),
    comprension_auditiva: () =>
      import('@/features/mechanics/auxiliar/ComprensiónAuditiva/ComprensiónAuditivaExercise'),
    texto_movimiento: () =>
      import('@/features/mechanics/auxiliar/TextoEnMovimiento/TextoEnMovimientoExercise'),
  };

  return mechanicMap[mechanicType.toLowerCase()] || null;
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function ExercisePage() {
  const { moduleId, exerciseId } = useParams();
  const navigate = useNavigate();

  // State
  const [exercise, setExercise] = useState<ExerciseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [MechanicComponent, setMechanicComponent] = useState<React.ComponentType<any> | null>(null);
  const [progress, setProgress] = useState<ExerciseProgress>({
    currentStep: 0,
    totalSteps: 1,
    score: 0,
    hintsUsed: 0,
    timeSpent: 0,
  });
  const [availableCoins, setAvailableCoins] = useState(350);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showSkipConfirm, setShowSkipConfirm] = useState(false);
  const [startTime] = useState(new Date());
  // Backend returns hints as string[], not objects
  const [hints, setHints] = useState<string[]>([]);
  // FE-055: Store user's actual answers (not just progress metadata)
  const [userAnswers, setUserAnswers] = useState<any>(null);

  const { user } = useAuth();

  // Power-ups hook
  const {
    availablePowerUps,
    activePowerUps,
    activatePowerUp,
    getUsedPowerUps,
    isLoading: powerUpLoading,
    error: powerUpError,
  } = useExercisePowerUps({
    exerciseId: exerciseId || '',
    userId: user?.id,
    onHintReveal: (_count) => {
      // Hints will be automatically available through the effects.hintsRevealed
    },
    onTimeExtension: (_seconds) => {
      // Time extension effect is tracked in powerUpEffects.timeExtension
    },
    onSecondChance: () => {
      // Second chance effect tracked in powerUpEffects.hasSecondChance
    },
    onVisionActivate: () => {
      // Vision effect tracked in powerUpEffects.visionActive
    },
  });

  // Auto-save hook integration
  const {
    status: autoSaveStatus,
    lastSavedAt,
    recoveredData,
    saveProgress: autoSaveProgress,
    clearRecoveredData,
  } = useExerciseAutoSave({
    exerciseId: exerciseId || '',
    enabled: !!exerciseId,
    intervalMs: 30000, // 30 seconds
    debounceMs: 2000, // 2 seconds debounce
  });

  // Dashboard invalidation hook - FIX: Invalidate cache after exercise completion
  const { syncAndInvalidate } = useInvalidateDashboard();

  // ============================================================================
  // DATA FETCHING
  // ============================================================================

  useEffect(() => {
    const fetchExercise = async () => {
      try {
        setLoading(true);

        // Fetch exercise from API
        const exerciseData = await getExercise(exerciseId!);

        // Map API response to ExerciseData format
        // Handle both 'type' and 'exercise_type' fields from backend
        const exerciseType =
          exerciseData.type ||
          exerciseData.exercise_type ||
          (exerciseData as any).exerciseType ||
          'crucigrama_cientifico';

        const mappedExercise: ExerciseData = {
          id: exerciseData.id,
          // API returns camelCase after apiClient transformation (snake_case → camelCase)
          module_id: exerciseData.module_id || (exerciseData as any).moduleId,
          title: exerciseData.title,
          type: exerciseType,
          description: exerciseData.description || '',
          difficulty: exerciseData.difficulty, // Uses DifficultyLevel enum (CEFR levels)
          points: exerciseData.points || exerciseData.max_points || 0,
          estimatedTime:
            exerciseData.estimatedTime ||
            (exerciseData.estimated_time_minutes ? exerciseData.estimated_time_minutes * 60 : 900), // Backend returns seconds, fallback to 15 minutes
          completed: exerciseData.completed || false,
          moduleTitle: undefined,
          mechanicData: exerciseData,
          is_active: exerciseData.is_active, // GAP-005: Preserve is_active field
        };

        setExercise(mappedExercise);

        // Fetch hints for this exercise
        try {
          const exerciseHints = await getExerciseHints(exerciseId!);
          // Backend returns string[], but API might return objects - handle both
          if (Array.isArray(exerciseHints)) {
            setHints(
              exerciseHints.map((h) => (typeof h === 'string' ? h : (h as any).text || String(h))),
            );
          }
        } catch (_hintError) {
          // Continue without hints - not critical (silent fail for optional feature)
        }

        // GAP-005 Resolution: Check if exercise is active (is_active field)
        // If is_active = false, show UnderConstructionExercise component
        const isActiveExercise = exerciseData.is_active !== false; // Default to true if field is missing

        if (!isActiveExercise) {
          // Set UnderConstructionExercise component for inactive exercises
          setMechanicComponent(() => UnderConstructionExercise);
        } else {
          // Load dynamic component for active exercises
          const loader = loadMechanic(mappedExercise.type);
          if (loader) {
            const module = await loader();
            setMechanicComponent(() => module.default || module.CrucigramaExercise || module);
          }
        }
      } catch (error) {
        // Fallback to mock data if API fails
        const mockExercise: ExerciseData = {
          id: exerciseId!,
          module_id: moduleId!,
          title: 'Crucigrama: Primeros Años de Marie Curie',
          type: 'crucigrama_cientifico',
          description:
            'Completa el crucigrama sobre los primeros años de la científica Marie Curie',
          difficulty: DifficultyLevel.INTERMEDIATE,
          points: 150,
          estimatedTime: 900, // 15 minutes
          completed: false,
          moduleTitle: 'Los Primeros Pasos de Marie Curie',
          mechanicData: {},
        };

        setExercise(mockExercise);

        // Load component with mock data
        const loader = loadMechanic(mockExercise.type);
        if (loader) {
          const module = await loader();
          setMechanicComponent(() => module.default || module.CrucigramaExercise || module);
        }

        // Show info but don't block the UI
        setFeedback({
          type: 'info',
          title: 'Modo sin conexión',
          message: 'No se pudo conectar con el servidor. Estás viendo datos de ejemplo.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (exerciseId) {
      fetchExercise();
    }
  }, [exerciseId, moduleId]);

  // ============================================================================
  // AUTO-SAVE - RECOVERY
  // ============================================================================

  // Recover saved progress on mount
  useEffect(() => {
    if (recoveredData?.partialAnswers && !userAnswers) {
      // Restore answers
      setUserAnswers(recoveredData.partialAnswers);

      // Restore time spent if available
      if (recoveredData.timeSpentSeconds) {
        setProgress((prev) => ({
          ...prev,
          timeSpent: recoveredData.timeSpentSeconds,
        }));
      }

      // Restore metadata
      if (recoveredData.metadata) {
        setProgress((prev) => ({
          ...prev,
          hintsUsed: recoveredData.metadata?.hintsUsed || prev.hintsUsed,
          powerupsUsed: recoveredData.metadata?.comodinesUsed || prev.powerupsUsed,
        }));
      }

      // Clear recovered data to avoid re-applying
      clearRecoveredData();

      // Show notification
      setFeedback({
        type: 'info',
        title: 'Progreso Recuperado',
        message: 'Se ha recuperado tu progreso anterior. Puedes continuar donde lo dejaste.',
      });
      setShowFeedback(true);
    }
  }, [recoveredData, userAnswers, clearRecoveredData]);

  // ============================================================================
  // AUTO-SAVE - PERIODIC SAVE
  // ============================================================================

  // Auto-save when answers or progress changes
  useEffect(() => {
    if (!exerciseId || !userAnswers) return;

    const currentTime = Math.floor((Date.now() - startTime.getTime()) / 1000);

    autoSaveProgress({
      partialAnswers: userAnswers,
      timeSpentSeconds: currentTime,
      metadata: {
        hintsUsed: progress.hintsUsed,
        comodinesUsed: progress.powerupsUsed,
        currentStep: progress.currentStep,
      },
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userAnswers, progress.hintsUsed, progress.powerupsUsed, progress.currentStep]);

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const handleSaveProgress = async () => {
    if (!exerciseId) return;

    try {
      // Save progress via API
      await saveExerciseProgress(exerciseId, {
        currentStep: progress.currentStep,
        totalSteps: progress.totalSteps,
        score: progress.score,
        hintsUsed: progress.hintsUsed,
        timeSpent: progress.timeSpent,
      });

      setHasUnsavedChanges(false);

    } catch (error) {

      // Fallback to localStorage if API fails
      try {
        localStorage.setItem(
          `exercise_${exerciseId}_progress`,
          JSON.stringify({
            progress,
            timestamp: new Date().toISOString(),
          }),
        );
        setHasUnsavedChanges(false);
      } catch (localError) {
        // Error handled silently
      }
    }
  };

  const handleSubmit = async () => {
    if (!exerciseId) return;

    // FE-055: Validate that we have user answers before submitting
    if (!userAnswers) {
      setFeedback({
        type: 'error',
        title: 'Error',
        message: 'No se pudieron obtener tus respuestas. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
      return;
    }

    try {
      // Get used power-ups from hook
      const usedPowerUpsList = getUsedPowerUps();

      // FE-055: Submit exercise with REAL user answers (not progress metadata)
      const result = await submitExercise(exerciseId, {
        answers: userAnswers, // ✅ FIXED: Send actual user answers
        startedAt: startTime.getTime(),
        hintsUsed: progress.hintsUsed || 0,
        powerupsUsed: usedPowerUpsList || [],
      });

      // FIX: Invalidate dashboard cache to update ranks, XP, and coins in real-time
      await syncAndInvalidate();

      // Build feedback message (E6-FIX: null guards for M3-M5 manual review exercises without rewards)
      const xpEarned = result.rewards?.xp ?? 0;
      const mlCoinsEarned = result.rewards?.mlCoins ?? 0;
      let feedbackMessage = `Has obtenido ${result.score} puntos. Ganaste ${xpEarned} XP y ${mlCoinsEarned} ML Coins.`;

      // Add bonus information if present
      if (result.rewards?.bonuses && result.rewards.bonuses.length > 0) {
        const bonusDetails = result.rewards.bonuses.map((b) => `+${b.amount} ${b.type}`).join(', ');
        feedbackMessage += ` Bonos: ${bonusDetails}`;
      }

      // Add rank up celebration if present (E12-FIX: null guard for unlockedFeatures)
      if (result.rankUp) {
        feedbackMessage += `\n\n¡Felicidades! Has subido de rango: ${result.rankUp.previousRank} → ${result.rankUp.newRank}`;
        if (result.rankUp.unlockedFeatures?.length > 0) {
          feedbackMessage += `\nNuevas funciones desbloqueadas: ${result.rankUp.unlockedFeatures.join(', ')}`;
        }
      }

      // Display submission results
      setFeedback({
        type: 'success',
        title: result.isPerfect ? '¡Perfecto!' : 'Ejercicio Completado',
        message: feedbackMessage,
        score: result.score,
        xpEarned,
        mlCoinsEarned,
        showConfetti: result.isPerfect || result.score >= 80 || !!result.rankUp,
      });
      setShowFeedback(true);

      // Update coins if earned
      if (mlCoinsEarned) {
        setAvailableCoins((prev) => prev + mlCoinsEarned);
      }

      // Mark exercise as completed locally
      if (exercise) {
        setExercise({ ...exercise, completed: true });
      }
    } catch (error) {
      setFeedback({
        type: 'error',
        title: 'Error al enviar',
        message: 'Hubo un problema al enviar tu respuesta. Por favor, intenta nuevamente.',
      });
      setShowFeedback(true);
    }
  };

  const handleSkip = useCallback(() => {
    setShowSkipConfirm(true);
  }, []);

  const handleConfirmSkip = useCallback(() => {
    setShowSkipConfirm(false);
    // Priorizar module_id del ejercicio, luego moduleId del URL, luego dashboard
    const targetModuleId = exercise?.module_id || (exercise as any)?.moduleId || moduleId;
    if (targetModuleId && targetModuleId !== 'undefined') {
      navigate(`/modules/${targetModuleId}`);
    } else {
      navigate('/dashboard');
    }
  }, [exercise, moduleId, navigate]);

  const handleComplete = () => {
    setFeedback({
      type: 'success',
      title: '¡Ejercicio Completado!',
      message: `¡Excelente trabajo! Has ganado ${exercise?.points} puntos.`,
      showConfetti: true,
    });
    setShowFeedback(true);
  };

  const handleUseHint = (hint: { id: string; text: string; cost: number }) => {
    if (availableCoins >= hint.cost) {
      setAvailableCoins((prev) => prev - hint.cost);
      setProgress((prev) => ({ ...prev, hintsUsed: prev.hintsUsed + 1 }));
      setHasUnsavedChanges(true);
    }
  };

  // FE-055: Updated to handle both progress metadata AND user answers
  const handleProgressUpdate = React.useCallback(
    (update: Partial<ExerciseProgress> | ProgressUpdate) => {
      // Check if this is the new format (object with progress + answers)
      if (update && typeof update === 'object' && 'progress' in update && 'answers' in update) {
        const progressUpdate = update as ProgressUpdate;
        setProgress((prev) => ({ ...prev, ...progressUpdate.progress }));
        setUserAnswers(progressUpdate.answers);
      } else {
        // Old format (just progress) - maintain backward compatibility
        setProgress((prev) => ({ ...prev, ...(update as Partial<ExerciseProgress>) }));
      }
      setHasUnsavedChanges(true);
    },
    [],
  );

  // Refs for mechanic callbacks
  const mechanicActionsRef = React.useRef<{
    handleReset?: () => void;
    handleCheck?: () => void;
    specificActions?: Array<{
      label: string;
      icon?: React.ReactNode;
      onClick: () => void;
      variant?: 'primary' | 'secondary' | 'blue' | 'gold';
    }>;
  }>({});

  // ============================================================================
  // RENDER HELPERS
  // ============================================================================

  // @ts-expect-error Reserved for future use in exercise difficulty display
  const _getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'text-green-600 bg-green-100';
      case 'medio':
        return 'text-yellow-600 bg-yellow-100';
      case 'dificil':
        return 'text-red-600 bg-red-100';
      case 'experto':
        return 'text-purple-600 bg-purple-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  // @ts-expect-error Reserved for future use in exercise difficulty display
  const _getDifficultyLabel = (difficulty: string) => {
    switch (difficulty) {
      case 'facil':
        return 'Fácil';
      case 'medio':
        return 'Medio';
      case 'dificil':
        return 'Difícil';
      case 'experto':
        return 'Experto';
      default:
        return difficulty;
    }
  };

  // ============================================================================
  // ADAPT EXERCISE DATA (MUST BE BEFORE EARLY RETURNS)
  // ============================================================================

  // Adapt exercise data to mechanic-specific format
  // IMPORTANT: This must be called unconditionally (before any returns) to follow Rules of Hooks
  const adaptedExercise = React.useMemo(() => {
    if (!exercise) return null;
    return adaptExerciseData(exercise);
  }, [exercise]);

  // ============================================================================
  // LOADING STATE
  // ============================================================================

  if (loading) {
    return (
      <StudentPageShell>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <DetectiveCard hoverable={false}>
            <div className="flex flex-col items-center justify-center py-12">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="font-semibold text-detective-text">
                Cargando ejercicio...
              </p>
            </div>
          </DetectiveCard>
        </div>
      </StudentPageShell>
    );
  }

  if (!exercise || !MechanicComponent) {
    return (
      <StudentPageShell>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-800"
          >
            <p className="font-semibold">No se pudo cargar el ejercicio</p>
            <DetectiveButton
              variant="blue"
              onClick={() => navigate('/dashboard')}
              className="mt-4"
            >
              Volver al Dashboard
            </DetectiveButton>
          </motion.div>
        </div>
      </StudentPageShell>
    );
  }

  // Guard: If exercise is already completed, show completion message instead of mechanic
  if (exercise.completed) {
    const targetModuleId = exercise.module_id || (exercise as any)?.moduleId || moduleId;
    return (
      <StudentPageShell>
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-lg text-center"
          >
            <DetectiveCard hoverable={false}>
              <div className="py-8">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
                  className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-green-400 to-emerald-500 shadow-lg"
                >
                  <Check className="h-10 w-10 text-white" />
                </motion.div>
                <h2 className="mb-2 text-2xl font-bold text-gray-900">Ejercicio Completado</h2>
                <p className="mb-6 text-gray-600">
                  Ya completaste este ejercicio. Puedes continuar con los demás ejercicios del
                  módulo.
                </p>
                <DetectiveButton
                  variant="primary"
                  icon={<ArrowLeft className="h-4 w-4" />}
                  onClick={() =>
                    navigate(
                      targetModuleId && targetModuleId !== 'undefined'
                        ? `/modules/${targetModuleId}`
                        : '/dashboard',
                    )
                  }
                >
                  Volver al Módulo
                </DetectiveButton>
              </div>
            </DetectiveCard>
          </motion.div>
        </div>
      </StudentPageShell>
    );
  }

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <StudentPageShell>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Unified Exercise Header */}
        <ExercisePageHeader
          exercise={exercise}
          autoSaveStatus={autoSaveStatus}
          lastSavedAt={lastSavedAt}
          hasUnsavedChanges={hasUnsavedChanges}
          className="mb-6"
        />

        {/* Pedagogical Guide (FE-060: 2025-11-19) */}
        {exercise.mechanicData && (
          <ExerciseGuide
            objective={(exercise.mechanicData as any).objective}
            how_to_solve={(exercise.mechanicData as any).how_to_solve}
            recommended_strategy={(exercise.mechanicData as any).recommended_strategy}
            pedagogical_notes={(exercise.mechanicData as any).pedagogical_notes}
            defaultExpanded={false}
            className="mb-6"
          />
        )}

        {/* Main Grid Layout - Compact */}
        <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-4">
          {/* Main Exercise Area */}
          <div className="lg:col-span-3">
            <AnimatePresence mode="wait">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <Suspense
                  fallback={
                    <DetectiveCard hoverable={false}>
                      <div className="flex items-center justify-center py-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        >
                          <Loader2 className="h-6 w-6 text-detective-orange" />
                        </motion.div>
                      </div>
                      <p className="mt-2 text-center text-sm text-detective-text-secondary">
                        Cargando mecánica...
                      </p>
                    </DetectiveCard>
                  }
                >
                  <MechanicComponent
                    exercise={adaptedExercise || exercise}
                    exerciseId={exercise?.id}
                    onComplete={handleComplete}
                    onProgressUpdate={handleProgressUpdate}
                    actionsRef={mechanicActionsRef}
                  />
                </Suspense>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sidebar - Compact */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Power-ups Bar */}
              <PowerUpBar
                availablePowerUps={availablePowerUps}
                activePowerUps={activePowerUps}
                onActivatePowerUp={activatePowerUp}
                disabled={powerUpLoading}
              />

              {/* Show power-up error if any */}
              {powerUpError && (
                <div className="rounded-lg border-2 border-red-300 bg-red-50 p-2 text-xs text-red-700">
                  {powerUpError}
                </div>
              )}

              {/* Actions Card */}
              <DetectiveCard hoverable={false}>
                <h3 className="mb-3 text-sm font-bold text-detective-text">Acciones</h3>
                <div className="space-y-2">
                  {/* Navigation Actions */}
                  <DetectiveButton
                    variant="blue"
                    icon={<ArrowLeft className="h-4 w-4" />}
                    onClick={() => navigate(`/modules/${exercise.module_id}`)}
                    className="w-full"
                  >
                    Volver
                  </DetectiveButton>

                  <DetectiveButton
                    variant="secondary"
                    icon={<Save className="h-4 w-4" />}
                    onClick={handleSaveProgress}
                    disabled={!hasUnsavedChanges}
                    className="w-full"
                  >
                    Guardar
                  </DetectiveButton>

                  <DetectiveButton
                    variant="secondary"
                    icon={<SkipForward className="h-4 w-4" />}
                    onClick={handleSkip}
                    className="w-full"
                  >
                    Omitir
                  </DetectiveButton>

                  <div className="border-detective-border my-2 border-t"></div>

                  {/* Mechanic Actions */}
                  <DetectiveButton
                    variant="blue"
                    icon={<RotateCcw className="h-4 w-4" />}
                    onClick={() => mechanicActionsRef.current.handleReset?.()}
                    className="w-full"
                  >
                    Reiniciar
                  </DetectiveButton>

                  <DetectiveButton
                    variant="gold"
                    icon={<Check className="h-4 w-4" />}
                    onClick={() => mechanicActionsRef.current.handleCheck?.()}
                    className="w-full"
                  >
                    Verificar
                  </DetectiveButton>

                  {/* Submit Button */}
                  <DetectiveButton
                    variant="primary"
                    icon={<Send className="h-4 w-4" />}
                    onClick={() => handleSubmit()}
                    className="w-full"
                  >
                    Enviar Respuestas
                  </DetectiveButton>

                  {/* Specific Mechanic Actions */}
                  {mechanicActionsRef.current.specificActions &&
                    mechanicActionsRef.current.specificActions.length > 0 && (
                      <>
                        {mechanicActionsRef.current.specificActions.map((action, index) => (
                          <DetectiveButton
                            key={index}
                            variant={action.variant || 'secondary'}
                            icon={action.icon}
                            onClick={action.onClick}
                            className="w-full"
                          >
                            {action.label}
                          </DetectiveButton>
                        ))}
                      </>
                    )}

                  {/* Hints Button */}
                  {hints.length > 0 && (
                    <HintSystem
                      hints={hints}
                      onHintUsed={(hintIndex) => {
                        if (hints[hintIndex]) {
                          handleUseHint({
                            id: `hint-${hintIndex}`,
                            text: hints[hintIndex],
                            cost: 15,
                          });
                        }
                      }}
                    />
                  )}
                </div>
              </DetectiveCard>

              {/* Score Display */}
              <DetectiveCard hoverable={false}>
                <h3 className="mb-3 text-sm font-bold text-detective-text">Puntuación</h3>
                <ScoreDisplay score={progress.score} maxScore={exercise.points} />
              </DetectiveCard>

              {/* Timer */}
              <DetectiveCard hoverable={false}>
                <h3 className="mb-3 text-sm font-bold text-detective-text">Tiempo</h3>
                <TimerWidget startTime={Date.now()} isPaused={false} showSeconds={true} />
              </DetectiveCard>

              {/* Progress Tracker */}
              <DetectiveCard hoverable={false}>
                <h3 className="mb-3 text-sm font-bold text-detective-text">Progreso</h3>
                <ProgressTracker
                  currentStep={progress.currentStep}
                  totalSteps={progress.totalSteps}
                />
                <p className="mt-2 text-center text-sm text-detective-text-secondary">
                  {progress.currentStep} de {progress.totalSteps}
                </p>
              </DetectiveCard>

              {/* ML Coins Display */}
              <DetectiveCard hoverable={false}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-detective-gold" />
                    <span className="text-sm font-bold text-detective-text">ML Coins</span>
                  </div>
                  <span className="text-xl font-bold text-detective-gold">{availableCoins}</span>
                </div>
              </DetectiveCard>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      <AnimatePresence>
        {feedback && showFeedback && (
          <FeedbackModal
            isOpen={showFeedback}
            feedback={feedback}
            onClose={() => {
              setShowFeedback(false);
              if (feedback.type === 'success') {
                // Priorizar module_id del ejercicio, luego moduleId del URL, luego dashboard
                const targetModuleId = exercise?.module_id || (exercise as any)?.moduleId || moduleId;
                if (targetModuleId && targetModuleId !== 'undefined') {
                  navigate(`/modules/${targetModuleId}`);
                } else {
                  navigate('/dashboard');
                }
              }
            }}
            onRetry={() => {
              setShowFeedback(false);
              // Reset logic if needed
            }}
          />
        )}
      </AnimatePresence>

      {/* Skip Exercise Confirm Dialog */}
      <ConfirmDialog
        isOpen={showSkipConfirm}
        onClose={() => setShowSkipConfirm(false)}
        onConfirm={handleConfirmSkip}
        title="Omitir ejercicio"
        message="¿Estás seguro de que deseas omitir este ejercicio? Tu progreso no guardado se perderá."
        confirmText="Omitir"
        cancelText="Continuar ejercicio"
        variant="warning"
      />
    </StudentPageShell>
  );
}
