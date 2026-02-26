import { useState, useEffect, type FC } from 'react';
import { useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { cn } from '@shared/utils/cn';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Send,
  FileText,
  Puzzle,
  Settings,
  Eye,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { AdminPageShell } from '../components/shared/AdminPageShell';
import { ExerciseTypeSelector } from '../components/exercise-builder/ExerciseTypeSelector';
import { ExercisePreview } from '../components/exercise-builder/ExercisePreview';
import { StepBasicInfo } from '../components/exercise-builder/StepBasicInfo';
import {
  CompletarEspaciosConfig,
  CrucigramaConfig,
  EmparejamientoConfig,
  LineaTiempoConfig,
  MapaConceptualConfig,
  SopaLetrasConfig,
  VerdaderoFalsoConfig,
  ConstruccionHipotesisConfig,
  DetectiveTextualConfig,
  PrediccionNarrativaConfig,
  PuzzleContextoConfig,
  RuedaInferenciasConfig,
  AnalisisFuentesConfig,
  DebateDigitalConfig,
  MatrizPerspectivasConfig,
  PodcastArgumentativoConfig,
  TribunalOpinionesConfig,
} from '../components/exercise-builder/type-configs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import { CONTENT_QUERY_KEYS, useModulesQuery } from '../hooks/useContentQueries';
import { getExercise } from '@/services/api/educationalAPI';
import type { ExerciseFormData } from '../types/exercise-builder.types';

export type { ExerciseFormData } from '../types/exercise-builder.types';

const STEPS = [
  { id: 1, label: 'Informacion Basica', icon: FileText },
  { id: 2, label: 'Tipo de Ejercicio', icon: Puzzle },
  { id: 3, label: 'Configuracion', icon: Settings },
  { id: 4, label: 'Vista Previa', icon: Eye },
];

const TYPE_CONFIG_MAP: Record<string, FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }>> = {
  completar_espacios: CompletarEspaciosConfig,
  crucigrama: CrucigramaConfig,
  emparejamiento: EmparejamientoConfig,
  linea_tiempo: LineaTiempoConfig,
  mapa_conceptual: MapaConceptualConfig,
  sopa_letras: SopaLetrasConfig,
  verdadero_falso: VerdaderoFalsoConfig,
  construccion_hipotesis: ConstruccionHipotesisConfig,
  detective_textual: DetectiveTextualConfig,
  prediccion_narrativa: PrediccionNarrativaConfig,
  puzzle_contexto: PuzzleContextoConfig,
  rueda_inferencias: RuedaInferenciasConfig,
  analisis_fuentes: AnalisisFuentesConfig,
  debate_digital: DebateDigitalConfig,
  matriz_perspectivas: MatrizPerspectivasConfig,
  podcast_argumentativo: PodcastArgumentativoConfig,
  tribunal_opiniones: TribunalOpinionesConfig,
};

const initialFormData: ExerciseFormData = {
  title: '',
  description: '',
  instructions: '',
  moduleId: '',
  difficulty: 'beginner',
  estimatedTime: 10,
  howToSolve: '',
  recommendedStrategy: '',
  pedagogicalNotes: '',
  exerciseType: '',
  typeConfig: {},
  xpReward: 50,
  mlCoinsReward: 10,
  hintsAllowed: 3,
};

/**
 * Maps frontend difficulty values to backend DifficultyLevelEnum values.
 * The form uses 'expert' which is not in the backend enum; mapped to 'proficient'.
 */
const DIFFICULTY_MAP: Record<ExerciseFormData['difficulty'], string> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  expert: 'proficient',
};

/**
 * Reverse map: backend difficulty → frontend difficulty
 */
const DIFFICULTY_REVERSE_MAP: Record<string, ExerciseFormData['difficulty']> = {
  beginner: 'beginner',
  intermediate: 'intermediate',
  advanced: 'advanced',
  proficient: 'expert',
};

/**
 * Converts camelCase ExerciseFormData to snake_case backend payload
 * matching the educational_content.exercises table schema.
 *
 * @see Backend: POST /api/v1/educational/exercises (ExercisesController.create)
 * @see Entity: apps/backend/src/modules/educational/entities/exercise.entity.ts
 */
function buildExercisePayload(formData: ExerciseFormData, isActive: boolean) {
  return {
    title: formData.title,
    description: formData.description,
    instructions: formData.instructions,
    module_id: formData.moduleId,
    exercise_type: formData.exerciseType,
    difficulty_level: DIFFICULTY_MAP[formData.difficulty] || formData.difficulty,
    estimated_time_minutes: formData.estimatedTime,
    how_to_solve: formData.howToSolve || undefined,
    recommended_strategy: formData.recommendedStrategy || undefined,
    pedagogical_notes: formData.pedagogicalNotes || undefined,
    config: formData.typeConfig,
    content: formData.typeConfig,
    xp_reward: formData.xpReward,
    ml_coins_reward: formData.mlCoinsReward,
    enable_hints: formData.hintsAllowed > 0,
    is_active: isActive,
    order_index: 0,
  };
}

export default function AdminExerciseCreatePage() {
  const { id: exerciseId } = useParams<{ id: string }>();
  const isEditMode = !!exerciseId;
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
  const [formInitialized, setFormInitialized] = useState(false);
  const queryClient = useQueryClient();
  const { modules } = useModulesQuery();

  // Fetch exercise data when in edit mode
  const exerciseQuery = useQuery({
    queryKey: ['admin', 'exercise', exerciseId],
    queryFn: () => getExercise(exerciseId!),
    enabled: isEditMode,
  });

  // Populate form when exercise data loads
  useEffect(() => {
    if (exerciseQuery.data && !formInitialized) {
      const ex = exerciseQuery.data as unknown as Record<string, unknown>;
      const difficultyRaw = (ex.difficulty || ex.difficulty_level || 'beginner') as string;
      setFormData({
        title: (ex.title as string) || '',
        description: (ex.description as string) || '',
        instructions: (ex.instructions as string) || '',
        moduleId: (ex.module_id as string) || '',
        difficulty: DIFFICULTY_REVERSE_MAP[difficultyRaw] || 'beginner',
        estimatedTime: (ex.estimated_time_minutes as number) || (ex.estimatedTime as number) || 10,
        howToSolve: (ex.how_to_solve as string) || '',
        recommendedStrategy: (ex.recommended_strategy as string) || '',
        pedagogicalNotes: (ex.pedagogical_notes as string) || '',
        exerciseType: ((ex.exercise_type || ex.type) as string) || '',
        typeConfig: (ex.config as Record<string, unknown>) || (ex.content as Record<string, unknown>) || {},
        xpReward: (ex.xp_reward as number) || 50,
        mlCoinsReward: (ex.ml_coins_reward as number) || 10,
        hintsAllowed: (ex.enable_hints as boolean) ? 3 : 0,
      });
      setFormInitialized(true);
    }
  }, [exerciseQuery.data, formInitialized]);

  // Mutation for creating exercises via POST /api/v1/educational/exercises
  const createExerciseMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await apiClient.post(API_ENDPOINTS.educational.exercises, payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.exercises() });
    },
  });

  // Mutation for updating exercises via PATCH /api/v1/educational/exercises/:id
  const updateExerciseMutation = useMutation({
    mutationFn: async (payload: Record<string, unknown>) => {
      const response = await apiClient.patch(API_ENDPOINTS.educational.exercise(exerciseId!), payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONTENT_QUERY_KEYS.exercises() });
      queryClient.invalidateQueries({ queryKey: ['admin', 'exercise', exerciseId] });
    },
  });

  const saving = createExerciseMutation.isPending || updateExerciseMutation.isPending;

  const updateField = <K extends keyof ExerciseFormData>(key: K, value: ExerciseFormData[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const canAdvance = (): boolean => {
    switch (currentStep) {
      case 1:
        return !!(formData.title && formData.description && formData.moduleId);
      case 2:
        return !!formData.exerciseType;
      case 3:
        return Object.keys(formData.typeConfig).length > 0;
      case 4:
        return true;
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (currentStep < 4 && canAdvance()) {
      setCurrentStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((s) => s - 1);
    }
  };

  const handleSaveDraft = async () => {
    try {
      const payload = buildExercisePayload(formData, false);
      if (isEditMode) {
        await updateExerciseMutation.mutateAsync(payload);
      } else {
        await createExerciseMutation.mutateAsync(payload);
      }
      toast.success(isEditMode ? 'Borrador actualizado exitosamente' : 'Borrador guardado exitosamente');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Error al guardar el borrador';
      toast.error(message);
    }
  };

  const handleSubmitForReview = async () => {
    try {
      const payload = buildExercisePayload(formData, true);
      if (isEditMode) {
        await updateExerciseMutation.mutateAsync(payload);
      } else {
        await createExerciseMutation.mutateAsync(payload);
      }
      toast.success(isEditMode ? 'Ejercicio actualizado exitosamente' : 'Ejercicio enviado para revision');
    } catch (error: unknown) {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message
        || 'Error al enviar para revision';
      toast.error(message);
    }
  };

  const TypeConfigComponent = TYPE_CONFIG_MAP[formData.exerciseType];

  if (isEditMode && exerciseQuery.isLoading) {
    return (
      <AdminPageShell>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-detective-orange" />
          <span className="ml-3 text-detective-text-secondary">Cargando ejercicio...</span>
        </div>
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell>
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">
          {isEditMode ? 'Editar Ejercicio' : 'Crear Ejercicio'}
        </h1>
        <p className="mt-1 text-detective-text-secondary">
          {isEditMode
            ? 'Modifica los datos del ejercicio existente'
            : 'Asistente paso a paso para crear un nuevo ejercicio educativo'}
        </p>
      </div>

      {/* Step Indicator */}
      <DetectiveCard padding="sm" hoverable={false}>
        <div className="flex items-center justify-between">
          {STEPS.map((step, idx) => {
            const StepIcon = step.icon;
            const isActive = currentStep === step.id;
            const isCompleted = currentStep > step.id;

            return (
              <div key={step.id} className="flex flex-1 items-center">
                <button
                  onClick={() => {
                    if (isCompleted) setCurrentStep(step.id);
                  }}
                  disabled={!isCompleted && !isActive}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                    isActive && 'bg-detective-orange/20 text-detective-orange',
                    isCompleted && 'cursor-pointer text-green-400 hover:bg-green-500/10',
                    !isActive && !isCompleted && 'cursor-default text-gray-500'
                  )}
                >
                  <div
                    className={cn(
                      'flex h-8 w-8 items-center justify-center rounded-full border-2 transition-colors',
                      isActive && 'border-detective-orange bg-detective-orange/20',
                      isCompleted && 'border-green-500 bg-green-500/20',
                      !isActive && !isCompleted && 'border-gray-600 bg-gray-800'
                    )}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4 text-green-400" />
                    ) : (
                      <StepIcon className="h-4 w-4" />
                    )}
                  </div>
                  <span className="hidden md:inline">{step.label}</span>
                </button>
                {idx < STEPS.length - 1 && (
                  <div
                    className={cn(
                      'mx-2 h-0.5 flex-1',
                      isCompleted ? 'bg-green-500' : 'bg-gray-700'
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </DetectiveCard>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          {currentStep === 1 && (
            <StepBasicInfo formData={formData} updateField={updateField} />
          )}
          {currentStep === 2 && (
            <ExerciseTypeSelector
              selectedType={formData.exerciseType}
              moduleFilter={formData.moduleId}
              modules={modules}
              onSelect={(typeId) => {
                updateField('exerciseType', typeId);
                updateField('typeConfig', {});
              }}
            />
          )}
          {currentStep === 3 && (
            <DetectiveCard hoverable={false}>
              <h2 className="mb-4 text-xl font-bold text-detective-text">
                Configuracion del Ejercicio
              </h2>
              {TypeConfigComponent ? (
                <TypeConfigComponent
                  config={formData.typeConfig}
                  onChange={(c) => updateField('typeConfig', c)}
                />
              ) : (
                <p className="text-detective-text-secondary">
                  Selecciona un tipo de ejercicio en el paso anterior.
                </p>
              )}
            </DetectiveCard>
          )}
          {currentStep === 4 && <ExercisePreview formData={formData} />}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <DetectiveCard padding="sm" hoverable={false}>
        <div className="flex items-center justify-between">
          <DetectiveButton
            variant="ghost"
            leftIcon={<ChevronLeft className="h-4 w-4" />}
            onClick={handleBack}
            disabled={currentStep === 1}
          >
            Anterior
          </DetectiveButton>

          <div className="flex items-center gap-3">
            {currentStep === 4 && (
              <>
                <DetectiveButton
                  variant="secondary"
                  leftIcon={<Save className="h-4 w-4" />}
                  onClick={handleSaveDraft}
                  loading={saving}
                >
                  {isEditMode ? 'Guardar Cambios (Borrador)' : 'Guardar Borrador'}
                </DetectiveButton>
                <DetectiveButton
                  variant="primary"
                  leftIcon={<Send className="h-4 w-4" />}
                  onClick={handleSubmitForReview}
                  loading={saving}
                >
                  {isEditMode ? 'Guardar y Publicar' : 'Enviar a Revision'}
                </DetectiveButton>
              </>
            )}
            {currentStep < 4 && (
              <DetectiveButton
                variant="primary"
                rightIcon={<ChevronRight className="h-4 w-4" />}
                onClick={handleNext}
                disabled={!canAdvance()}
              >
                Siguiente
              </DetectiveButton>
            )}
          </div>
        </div>
      </DetectiveCard>
    </div>
    </AdminPageShell>
  );
}
