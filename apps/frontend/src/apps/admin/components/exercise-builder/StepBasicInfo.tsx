import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import type { ExerciseFormData } from '../../types/exercise-builder.types';
import { useModulesQuery } from '../../hooks/useContentQueries';
import { CreateModuleModal } from './CreateModuleModal';

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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const { modules, isLoading: modulesLoading } = useModulesQuery();

  const sortedModules = [...modules].sort((a, b) => (a.order_index ?? 0) - (b.order_index ?? 0));

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
            {modulesLoading ? (
              <div className="flex items-center gap-2 py-2 text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span className="text-sm">Cargando modulos...</span>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  className="input-detective w-full flex-1"
                  value={formData.moduleId}
                  onChange={(e) => updateField('moduleId', e.target.value)}
                >
                  <option value="">Seleccionar modulo...</option>
                  {sortedModules.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.module_code ? `${m.module_code} - ` : ''}{m.title}{m.status === 'draft' ? ' (Borrador)' : ''}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(true)}
                  className="flex items-center gap-1 rounded-lg border border-detective-border bg-detective-card px-3 py-2 text-sm text-detective-orange hover:bg-detective-orange/10 transition-colors"
                  title="Crear nuevo modulo"
                >
                  <Plus className="h-4 w-4" />
                  <span className="hidden sm:inline">Nuevo</span>
                </button>
              </div>
            )}
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

      <CreateModuleModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onModuleCreated={(newModule) => {
          updateField('moduleId', newModule.id);
        }}
        existingModuleCount={modules.length}
      />
    </div>
  );
}
