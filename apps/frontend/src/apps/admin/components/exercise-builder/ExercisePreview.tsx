import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { cn } from '@shared/utils/cn';
import { Clock, Star, Coins, HelpCircle, BookOpen, AlertTriangle } from 'lucide-react';
import type { ExerciseFormData } from '../../pages/AdminExerciseCreatePage';

const MODULE_NAMES: Record<string, string> = {
  'module-1': 'M1 - Comprension Literal',
  'module-2': 'M2 - Comprension Inferencial',
  'module-3': 'M3 - Comprension Critica',
  'module-4': 'M4 - Literacidad Digital',
  'module-5': 'M5 - Produccion Textual',
};

const DIFFICULTY_STYLES: Record<string, { label: string; color: string }> = {
  beginner: { label: 'Principiante', color: 'bg-green-500/20 text-green-400' },
  intermediate: { label: 'Intermedio', color: 'bg-yellow-500/20 text-yellow-400' },
  advanced: { label: 'Avanzado', color: 'bg-orange-500/20 text-orange-400' },
  expert: { label: 'Experto', color: 'bg-red-500/20 text-red-400' },
};

const TYPE_NAMES: Record<string, string> = {
  completar_espacios: 'Completar Espacios',
  crucigrama: 'Crucigrama',
  emparejamiento: 'Emparejamiento',
  linea_tiempo: 'Linea de Tiempo',
  mapa_conceptual: 'Mapa Conceptual',
  sopa_letras: 'Sopa de Letras',
  verdadero_falso: 'Verdadero o Falso',
  construccion_hipotesis: 'Construccion de Hipotesis',
  detective_textual: 'Detective Textual',
  prediccion_narrativa: 'Prediccion Narrativa',
  puzzle_contexto: 'Puzzle de Contexto',
  rueda_inferencias: 'Rueda de Inferencias',
  analisis_fuentes: 'Analisis de Fuentes',
  debate_digital: 'Debate Digital',
  matriz_perspectivas: 'Matriz de Perspectivas',
  podcast_argumentativo: 'Podcast Argumentativo',
  tribunal_opiniones: 'Tribunal de Opiniones',
};

export interface ExercisePreviewProps {
  formData: ExerciseFormData;
}

export function ExercisePreview({ formData }: ExercisePreviewProps) {
  const diff = DIFFICULTY_STYLES[formData.difficulty] || DIFFICULTY_STYLES.beginner;

  return (
    <div className="space-y-4">
      {/* Banner */}
      <div className="flex items-center gap-2 rounded-lg border border-blue-500/30 bg-blue-500/10 px-4 py-3">
        <AlertTriangle className="h-5 w-5 text-blue-400" />
        <span className="text-sm text-blue-300">
          Vista previa — los estudiantes veran esta vista al iniciar el ejercicio.
        </span>
      </div>

      {/* Main Preview Card */}
      <DetectiveCard hoverable={false}>
        {/* Title & Description */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-detective-text">
            {formData.title || 'Sin titulo'}
          </h2>
          <p className="mt-1 text-detective-text-secondary">
            {formData.description || 'Sin descripcion'}
          </p>
        </div>

        {/* Badges */}
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {formData.moduleId && (
            <span className="rounded-full bg-detective-orange/20 px-3 py-1 text-xs font-medium text-detective-orange">
              <BookOpen className="mr-1 inline h-3 w-3" />
              {MODULE_NAMES[formData.moduleId] || formData.moduleId}
            </span>
          )}
          <span className={cn('rounded-full px-3 py-1 text-xs font-medium', diff.color)}>
            {diff.label}
          </span>
          {formData.exerciseType && (
            <span className="rounded-full bg-purple-500/20 px-3 py-1 text-xs font-medium text-purple-400">
              {TYPE_NAMES[formData.exerciseType] || formData.exerciseType}
            </span>
          )}
        </div>

        {/* Stats Row */}
        <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-gray-400">
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {formData.estimatedTime} min
          </span>
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400" />
            {formData.xpReward} XP
          </span>
          <span className="flex items-center gap-1">
            <Coins className="h-4 w-4 text-amber-400" />
            {formData.mlCoinsReward} ML Coins
          </span>
          <span className="flex items-center gap-1">
            <HelpCircle className="h-4 w-4" />
            {formData.hintsAllowed} pistas
          </span>
        </div>

        {/* Instructions */}
        {formData.instructions && (
          <div className="mb-6 rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-2 text-sm font-semibold text-gray-300">Instrucciones</h3>
            <p className="whitespace-pre-wrap text-sm text-gray-400">{formData.instructions}</p>
          </div>
        )}

        {/* Type Config Preview */}
        {Object.keys(formData.typeConfig).length > 0 && (
          <div className="rounded-lg bg-gray-800/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-300">
              Configuracion del Ejercicio
            </h3>
            <div className="space-y-2">
              {Object.entries(formData.typeConfig).map(([key, value]) => (
                <div key={key} className="flex items-start gap-2 text-sm">
                  <span className="font-mono text-detective-orange">{key}:</span>
                  <span className="text-gray-400">
                    {typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DetectiveCard>

      {/* Pedagogical Notes Preview */}
      {(formData.howToSolve || formData.recommendedStrategy || formData.pedagogicalNotes) && (
        <DetectiveCard hoverable={false}>
          <h3 className="mb-3 text-lg font-bold text-detective-text">Notas Pedagogicas</h3>
          <div className="space-y-3">
            {formData.howToSolve && (
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Como Resolver
                </span>
                <p className="mt-1 text-sm text-gray-400">{formData.howToSolve}</p>
              </div>
            )}
            {formData.recommendedStrategy && (
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Estrategia Recomendada
                </span>
                <p className="mt-1 text-sm text-gray-400">{formData.recommendedStrategy}</p>
              </div>
            )}
            {formData.pedagogicalNotes && (
              <div>
                <span className="text-xs font-semibold uppercase text-gray-500">
                  Notas Pedagogicas
                </span>
                <p className="mt-1 text-sm text-gray-400">{formData.pedagogicalNotes}</p>
              </div>
            )}
          </div>
        </DetectiveCard>
      )}
    </div>
  );
}

export default ExercisePreview;
