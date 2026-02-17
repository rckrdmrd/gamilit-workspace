import { useState } from 'react';
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
} from 'lucide-react';
import toast from 'react-hot-toast';
import { ExerciseTypeSelector } from '../components/exercise-builder/ExerciseTypeSelector';
import { ExercisePreview } from '../components/exercise-builder/ExercisePreview';
import { CompletarEspaciosConfig } from '../components/exercise-builder/type-configs/CompletarEspaciosConfig';
import { CrucigramaConfig } from '../components/exercise-builder/type-configs/CrucigramaConfig';
import { EmparejamientoConfig } from '../components/exercise-builder/type-configs/EmparejamientoConfig';
import { LineaTiempoConfig } from '../components/exercise-builder/type-configs/LineaTiempoConfig';
import { MapaConceptualConfig } from '../components/exercise-builder/type-configs/MapaConceptualConfig';
import { SopaLetrasConfig } from '../components/exercise-builder/type-configs/SopaLetrasConfig';
import { VerdaderoFalsoConfig } from '../components/exercise-builder/type-configs/VerdaderoFalsoConfig';
import { ConstruccionHipotesisConfig } from '../components/exercise-builder/type-configs/ConstruccionHipotesisConfig';
import { DetectiveTextualConfig } from '../components/exercise-builder/type-configs/DetectiveTextualConfig';
import { PrediccionNarrativaConfig } from '../components/exercise-builder/type-configs/PrediccionNarrativaConfig';
import { PuzzleContextoConfig } from '../components/exercise-builder/type-configs/PuzzleContextoConfig';
import { RuedaInferenciasConfig } from '../components/exercise-builder/type-configs/RuedaInferenciasConfig';
import { AnalisisFuentesConfig } from '../components/exercise-builder/type-configs/AnalisisFuentesConfig';
import { DebateDigitalConfig } from '../components/exercise-builder/type-configs/DebateDigitalConfig';
import { MatrizPerspectivasConfig } from '../components/exercise-builder/type-configs/MatrizPerspectivasConfig';
import { PodcastArgumentativoConfig } from '../components/exercise-builder/type-configs/PodcastArgumentativoConfig';
import { TribunalOpinionesConfig } from '../components/exercise-builder/type-configs/TribunalOpinionesConfig';

export interface ExerciseFormData {
  title: string;
  description: string;
  instructions: string;
  moduleId: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: number;
  howToSolve: string;
  recommendedStrategy: string;
  pedagogicalNotes: string;
  exerciseType: string;
  typeConfig: Record<string, unknown>;
  xpReward: number;
  mlCoinsReward: number;
  hintsAllowed: number;
}

const MODULE_OPTIONS = [
  { id: 'module-1', name: 'M1 - Comprension Literal' },
  { id: 'module-2', name: 'M2 - Comprension Inferencial' },
  { id: 'module-3', name: 'M3 - Comprension Critica' },
  { id: 'module-4', name: 'M4 - Literacidad Digital' },
  { id: 'module-5', name: 'M5 - Produccion Textual' },
];

const DIFFICULTY_OPTIONS = [
  { id: 'beginner', name: 'Principiante', color: 'bg-green-500/20 text-green-400' },
  { id: 'intermediate', name: 'Intermedio', color: 'bg-yellow-500/20 text-yellow-400' },
  { id: 'advanced', name: 'Avanzado', color: 'bg-orange-500/20 text-orange-400' },
  { id: 'expert', name: 'Experto', color: 'bg-red-500/20 text-red-400' },
];

const STEPS = [
  { id: 1, label: 'Informacion Basica', icon: FileText },
  { id: 2, label: 'Tipo de Ejercicio', icon: Puzzle },
  { id: 3, label: 'Configuracion', icon: Settings },
  { id: 4, label: 'Vista Previa', icon: Eye },
];

const TYPE_CONFIG_MAP: Record<string, React.FC<{ config: Record<string, unknown>; onChange: (c: Record<string, unknown>) => void }>> = {
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

export default function AdminExerciseCreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
  const [saving, setSaving] = useState(false);

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
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Borrador guardado exitosamente');
    } catch {
      toast.error('Error al guardar el borrador');
    } finally {
      setSaving(false);
    }
  };

  const handleSubmitForReview = async () => {
    setSaving(true);
    try {
      await new Promise((r) => setTimeout(r, 800));
      toast.success('Ejercicio enviado para revision');
    } catch {
      toast.error('Error al enviar para revision');
    } finally {
      setSaving(false);
    }
  };

  const TypeConfigComponent = TYPE_CONFIG_MAP[formData.exerciseType];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-detective-text">Crear Ejercicio</h1>
        <p className="mt-1 text-detective-text-secondary">
          Asistente paso a paso para crear un nuevo ejercicio educativo
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
                  Guardar Borrador
                </DetectiveButton>
                <DetectiveButton
                  variant="primary"
                  leftIcon={<Send className="h-4 w-4" />}
                  onClick={handleSubmitForReview}
                  loading={saving}
                >
                  Enviar a Revision
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
  );
}

/* ------------------------------------------------------------------
   Step 1: Basic Info
   ------------------------------------------------------------------ */
interface StepBasicInfoProps {
  formData: ExerciseFormData;
  updateField: <K extends keyof ExerciseFormData>(key: K, value: ExerciseFormData[K]) => void;
}

function StepBasicInfo({ formData, updateField }: StepBasicInfoProps) {
  return (
    <div className="space-y-6">
      {/* Core Info */}
      <DetectiveCard hoverable={false}>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Informacion Basica</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          {/* Title */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-400">Titulo *</label>
            <input
              type="text"
              className="input-detective w-full"
              placeholder="Ej: Encuentra las palabras clave del relato maya"
              value={formData.title}
              onChange={(e) => updateField('title', e.target.value)}
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-400">Descripcion *</label>
            <textarea
              className="input-detective w-full"
              rows={3}
              placeholder="Descripcion breve del ejercicio..."
              value={formData.description}
              onChange={(e) => updateField('description', e.target.value)}
            />
          </div>

          {/* Instructions */}
          <div className="md:col-span-2">
            <label className="mb-1 block text-sm font-medium text-gray-400">Instrucciones</label>
            <textarea
              className="input-detective w-full"
              rows={3}
              placeholder="Instrucciones para el estudiante..."
              value={formData.instructions}
              onChange={(e) => updateField('instructions', e.target.value)}
            />
          </div>

          {/* Module */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Modulo *</label>
            <select
              className="input-detective w-full"
              value={formData.moduleId}
              onChange={(e) => updateField('moduleId', e.target.value)}
            >
              <option value="">Seleccionar modulo...</option>
              {MODULE_OPTIONS.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          {/* Difficulty */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">Dificultad</label>
            <select
              className="input-detective w-full"
              value={formData.difficulty}
              onChange={(e) =>
                updateField('difficulty', e.target.value as ExerciseFormData['difficulty'])
              }
            >
              {DIFFICULTY_OPTIONS.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>

          {/* Estimated Time */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Tiempo Estimado (min)
            </label>
            <input
              type="number"
              className="input-detective w-full"
              min={1}
              max={120}
              value={formData.estimatedTime}
              onChange={(e) => updateField('estimatedTime', parseInt(e.target.value) || 10)}
            />
          </div>

          {/* Hints */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Pistas Permitidas
            </label>
            <input
              type="number"
              className="input-detective w-full"
              min={0}
              max={10}
              value={formData.hintsAllowed}
              onChange={(e) => updateField('hintsAllowed', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </DetectiveCard>

      {/* Pedagogical Notes */}
      <DetectiveCard hoverable={false}>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Notas Pedagogicas</h2>
        <div className="grid grid-cols-1 gap-5">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Como Resolver
            </label>
            <textarea
              className="input-detective w-full"
              rows={2}
              placeholder="Guia paso a paso de como resolver el ejercicio..."
              value={formData.howToSolve}
              onChange={(e) => updateField('howToSolve', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Estrategia Recomendada
            </label>
            <textarea
              className="input-detective w-full"
              rows={2}
              placeholder="Estrategia de lectura recomendada..."
              value={formData.recommendedStrategy}
              onChange={(e) => updateField('recommendedStrategy', e.target.value)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Notas Pedagogicas
            </label>
            <textarea
              className="input-detective w-full"
              rows={2}
              placeholder="Notas adicionales para el equipo docente..."
              value={formData.pedagogicalNotes}
              onChange={(e) => updateField('pedagogicalNotes', e.target.value)}
            />
          </div>
        </div>
      </DetectiveCard>

      {/* Gamification Rewards */}
      <DetectiveCard hoverable={false}>
        <h2 className="mb-4 text-xl font-bold text-detective-text">Recompensas</h2>
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">XP Reward</label>
            <input
              type="number"
              className="input-detective w-full"
              min={0}
              step={10}
              value={formData.xpReward}
              onChange={(e) => updateField('xpReward', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">ML Coins</label>
            <input
              type="number"
              className="input-detective w-full"
              min={0}
              step={5}
              value={formData.mlCoinsReward}
              onChange={(e) => updateField('mlCoinsReward', parseInt(e.target.value) || 0)}
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-400">
              Pistas Permitidas
            </label>
            <input
              type="number"
              className="input-detective w-full"
              min={0}
              max={10}
              value={formData.hintsAllowed}
              onChange={(e) => updateField('hintsAllowed', parseInt(e.target.value) || 0)}
            />
          </div>
        </div>
      </DetectiveCard>
    </div>
  );
}
