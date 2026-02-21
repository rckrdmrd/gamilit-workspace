import React from 'react';
import { X, Clock, Star, BookOpen, FileText, Tag, Calendar } from 'lucide-react';
import { Modal } from '@shared/components/common/Modal';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import type { Exercise } from '../../hooks/useContentManagement';

export interface ExercisePreviewModalProps {
  isOpen: boolean;
  exercise: Partial<Exercise> | null;
  onClose: () => void;
}

const difficultyConfig = {
  facil: { label: 'Facil', color: 'bg-green-500/20 text-green-500' },
  medio: { label: 'Medio', color: 'bg-yellow-500/20 text-yellow-500' },
  dificil: { label: 'Dificil', color: 'bg-red-500/20 text-red-500' },
  experto: { label: 'Experto', color: 'bg-purple-500/20 text-purple-500' },
} as const;

const statusConfig = {
  draft: { label: 'Borrador', color: 'bg-gray-500/20 text-gray-400' },
  published: { label: 'Publicado', color: 'bg-green-500/20 text-green-500' },
  archived: { label: 'Archivado', color: 'bg-orange-500/20 text-orange-500' },
} as const;

const exerciseTypeLabels: Record<string, string> = {
  'multiple-choice': 'Opcion Multiple',
  'true-false': 'Verdadero/Falso',
  'fill-blank': 'Completar Espacios',
  'code': 'Ejercicio de Codigo',
  'essay': 'Ensayo',
};

export const ExercisePreviewModal: React.FC<ExercisePreviewModalProps> = ({
  isOpen,
  exercise,
  onClose,
}) => {
  if (!isOpen || !exercise) return null;

  const difficulty = exercise.difficulty || 'facil';
  const status = exercise.status || 'draft';
  const difficultyStyle = difficultyConfig[difficulty] || difficultyConfig.facil;
  const statusStyle = statusConfig[status] || statusConfig.draft;
  const typeLabel = exerciseTypeLabels[exercise.type || ''] || exercise.type || 'Sin tipo';

  return (
    <Modal isOpen={isOpen} onClose={onClose} showCloseButton={false} size="lg" className="border border-detective-orange/30 bg-detective-bg shadow-2xl p-0 overflow-hidden">
      <div className="-mx-6 -my-4">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-detective-orange/20 bg-detective-bg-secondary px-6 py-4">
          <div className="flex-1 pr-4">
            <h2
              id="exercise-preview-title"
              className="text-xl font-bold text-white"
            >
              {exercise.title || 'Sin titulo'}
            </h2>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className={`rounded-lg px-3 py-1 text-xs font-medium ${difficultyStyle.color}`}>
                {difficultyStyle.label}
              </span>
              <span className={`rounded-lg px-3 py-1 text-xs font-medium ${statusStyle.color}`}>
                {statusStyle.label}
              </span>
              <span className="rounded-lg bg-blue-500/20 px-3 py-1 text-xs font-medium text-blue-400">
                {typeLabel}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-detective-orange/20 hover:text-detective-orange"
            aria-label="Cerrar preview"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(90vh-180px)] overflow-y-auto p-6">
          {/* Stats Row */}
          <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="rounded-lg bg-detective-bg-secondary p-3 text-center">
              <Star className="mx-auto mb-1 h-5 w-5 text-detective-orange" />
              <p className="text-lg font-bold text-white">{exercise.points || 0}</p>
              <p className="text-xs text-gray-400">Puntos</p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-3 text-center">
              <Tag className="mx-auto mb-1 h-5 w-5 text-blue-400" />
              <p className="text-sm font-medium text-white">{typeLabel}</p>
              <p className="text-xs text-gray-400">Tipo</p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-3 text-center">
              <Clock className="mx-auto mb-1 h-5 w-5 text-green-400" />
              <p className="text-sm font-medium text-white">~5 min</p>
              <p className="text-xs text-gray-400">Estimado</p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-3 text-center">
              <Calendar className="mx-auto mb-1 h-5 w-5 text-purple-400" />
              <p className="text-sm font-medium text-white">
                {exercise.createdAt
                  ? new Date(exercise.createdAt).toLocaleDateString('es-MX')
                  : 'N/A'}
              </p>
              <p className="text-xs text-gray-400">Creado</p>
            </div>
          </div>

          {/* Description */}
          {exercise.description && (
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-400">
                <FileText className="h-4 w-4" />
                Descripcion
              </h3>
              <p className="rounded-lg bg-detective-bg-secondary p-4 text-gray-300">
                {exercise.description}
              </p>
            </div>
          )}

          {/* Instructions */}
          {exercise.instructions && (
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-400">
                <BookOpen className="h-4 w-4" />
                Instrucciones
              </h3>
              <div
                className="prose prose-invert max-w-none rounded-lg bg-detective-bg-secondary p-4 text-gray-300"
                dangerouslySetInnerHTML={{ __html: exercise.instructions }}
              />
            </div>
          )}

          {/* Content Preview (if available) */}
          {exercise.content && Object.keys(exercise.content).length > 0 && (
            <div className="mb-6">
              <h3 className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-400">
                <Tag className="h-4 w-4" />
                Contenido del Ejercicio
              </h3>
              <pre className="overflow-x-auto rounded-lg bg-detective-bg-secondary p-4 text-xs text-gray-400">
                {JSON.stringify(exercise.content, null, 2)}
              </pre>
            </div>
          )}

          {/* Metadata */}
          <div className="rounded-lg border border-detective-orange/10 bg-detective-bg-secondary/50 p-4">
            <h3 className="mb-3 text-sm font-semibold text-gray-400">Metadata</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-500">ID:</span>
                <span className="ml-2 font-mono text-gray-400">{exercise.id || 'Nuevo'}</span>
              </div>
              <div>
                <span className="text-gray-500">Estado:</span>
                <span className="ml-2 text-gray-400">{statusStyle.label}</span>
              </div>
              <div>
                <span className="text-gray-500">Creado por:</span>
                <span className="ml-2 text-gray-400">{exercise.createdBy || 'N/A'}</span>
              </div>
              <div>
                <span className="text-gray-500">Actualizado:</span>
                <span className="ml-2 text-gray-400">
                  {exercise.updatedAt
                    ? new Date(exercise.updatedAt).toLocaleDateString('es-MX')
                    : 'N/A'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 border-t border-detective-orange/20 bg-detective-bg-secondary px-6 py-4">
          <DetectiveButton variant="primary" onClick={onClose}>
            Cerrar
          </DetectiveButton>
        </div>
      </div>
    </Modal>
  );
};

ExercisePreviewModal.displayName = 'ExercisePreviewModal';
