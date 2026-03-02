/**
 * CreateModuleModal - Modal para crear modulos desde el wizard de ejercicios
 *
 * @description Modal inline para crear un modulo nuevo sin salir del flujo de creacion de ejercicio.
 * @see Pattern: CreateUserModal.tsx
 */

import { useState, useEffect } from 'react';
import type { FormEvent, ReactElement } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Modal } from '@shared/components/common/Modal';
import { useModulesQuery } from '../../hooks/useContentQueries';
import type { Module } from '@shared/types';

// ============================================================================
// TYPES
// ============================================================================

interface CreateModuleFormData {
  title: string;
  module_code: string;
  description: string;
  order_index: number;
  difficulty_level: 'beginner' | 'intermediate' | 'advanced' | 'proficient';
  status: 'draft' | 'published';
  xp_reward: number;
  ml_coins_reward: number;
}

interface CreateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onModuleCreated: (module: Module) => void;
  existingModuleCount: number;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function CreateModuleModal({
  isOpen,
  onClose,
  onModuleCreated,
  existingModuleCount,
}: CreateModuleModalProps): ReactElement | null {
  const { createModule, isCreating } = useModulesQuery();

  const [formData, setFormData] = useState<CreateModuleFormData>({
    title: '',
    module_code: '',
    description: '',
    order_index: existingModuleCount + 1,
    difficulty_level: 'beginner',
    status: 'draft',
    xp_reward: 100,
    ml_coins_reward: 50,
  });

  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      setFormData({
        title: '',
        module_code: '',
        description: '',
        order_index: existingModuleCount + 1,
        difficulty_level: 'beginner',
        status: 'draft',
        xp_reward: 100,
        ml_coins_reward: 50,
      });
      setError(null);
    }
  }, [isOpen, existingModuleCount]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const payload = {
        title: formData.title,
        order_index: formData.order_index,
        description: formData.description || undefined,
        module_code: formData.module_code || undefined,
        difficulty_level: formData.difficulty_level,
        status: formData.status,
        xp_reward: formData.xp_reward,
        ml_coins_reward: formData.ml_coins_reward,
      };

      const newModule = await createModule(payload);
      onModuleCreated(newModule);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear modulo');
    }
  };

  const handleClose = () => {
    if (!isCreating) {
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      animated
      size="lg"
      showCloseButton={false}
      overlayClassName="bg-black/60 backdrop-blur-sm"
      className="bg-detective-dark rounded-xl border border-detective-border shadow-2xl"
      contentClassName="custom"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-detective-border">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-detective-orange/20">
            <Plus className="h-5 w-5 text-detective-orange" />
          </div>
          <h2 className="text-lg font-semibold text-white">Crear Nuevo Modulo</h2>
        </div>
        <button
          onClick={handleClose}
          disabled={isCreating}
          className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-lg hover:bg-detective-bg-secondary transition-colors disabled:opacity-50"
        >
          <X className="h-5 w-5 text-detective-text-secondary" />
        </button>
      </div>

      {/* Content */}
      <div className="p-6 max-h-[calc(100vh-10rem)] overflow-y-auto">
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-500/20 border border-red-500/50">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-detective-text mb-1">
              Titulo del Modulo *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Ej: Comprension Critica Avanzada"
              className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
            />
          </div>

          {/* Module Code */}
          <div>
            <label className="block text-sm font-medium text-detective-text mb-1">
              Codigo (opcional)
            </label>
            <input
              type="text"
              value={formData.module_code}
              onChange={(e) => setFormData({ ...formData, module_code: e.target.value })}
              placeholder="Ej: MOD-06-NUEVO"
              className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-detective-text mb-1">
              Descripcion (opcional)
            </label>
            <textarea
              rows={2}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Descripcion breve del modulo..."
              className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text placeholder-detective-text-secondary focus:ring-2 focus:ring-detective-orange focus:border-transparent"
            />
          </div>

          {/* Row: Order Index + Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                Orden
              </label>
              <input
                type="number"
                min={1}
                value={formData.order_index}
                onChange={(e) =>
                  setFormData({ ...formData, order_index: parseInt(e.target.value) || 1 })
                }
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                Dificultad
              </label>
              <select
                value={formData.difficulty_level}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    difficulty_level: e.target.value as CreateModuleFormData['difficulty_level'],
                  })
                }
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              >
                <option value="beginner">Principiante</option>
                <option value="intermediate">Intermedio</option>
                <option value="advanced">Avanzado</option>
                <option value="proficient">Competente</option>
              </select>
            </div>
          </div>

          {/* Row: Status + XP + ML Coins */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                Estado
              </label>
              <select
                value={formData.status}
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value as 'draft' | 'published' })
                }
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              >
                <option value="draft">Borrador</option>
                <option value="published">Publicado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                XP Reward
              </label>
              <input
                type="number"
                min={0}
                step={10}
                value={formData.xp_reward}
                onChange={(e) =>
                  setFormData({ ...formData, xp_reward: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-detective-text mb-1">
                ML Coins
              </label>
              <input
                type="number"
                min={0}
                step={5}
                value={formData.ml_coins_reward}
                onChange={(e) =>
                  setFormData({ ...formData, ml_coins_reward: parseInt(e.target.value) || 0 })
                }
                className="w-full px-4 py-2 bg-detective-card border border-detective-border rounded-lg text-detective-text focus:ring-2 focus:ring-detective-orange focus:border-transparent"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <DetectiveButton
              type="button"
              variant="secondary"
              onClick={handleClose}
              disabled={isCreating}
              className="flex-1"
            >
              Cancelar
            </DetectiveButton>
            <DetectiveButton
              type="submit"
              variant="primary"
              disabled={isCreating || !formData.title.trim()}
              className="flex-1"
            >
              {isCreating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Creando...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-2" />
                  Crear Modulo
                </>
              )}
            </DetectiveButton>
          </div>
        </form>
      </div>
    </Modal>
  );
}

export default CreateModuleModal;
