import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ExerciseFormData } from '../../types/exercise-builder.types';

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

interface StepBasicInfoProps {
  formData: ExerciseFormData;
  updateField: <K extends keyof ExerciseFormData>(key: K, value: ExerciseFormData[K]) => void;
}

export function StepBasicInfo({ formData, updateField }: StepBasicInfoProps) {
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
