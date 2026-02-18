import { useCallback } from 'react';
import { DataTable, Column } from '@shared/components/common';
import { CheckCircle, XCircle } from 'lucide-react';
import { usePendingExercisesQuery } from '../../hooks/useContentQueries';
import type { PendingExercise } from '../../types';

interface PendingExercisesTabProps {
  onPreview: (exercise: PendingExercise) => void;
  onReject: (exercise: PendingExercise) => void;
}

export function PendingExercisesTab({ onPreview, onReject }: PendingExercisesTabProps) {
  const {
    pendingExercises,
    loading: loadingPending,
    error_message: errorPending,
    approveExercise,
  } = usePendingExercisesQuery();

  const handleApproveExercise = useCallback(
    async (exerciseId: string) => {
      try {
        await approveExercise(exerciseId);
      } catch (err) {
        console.error('Failed to approve exercise:', err);
      }
    },
    [approveExercise],
  );

  const mappedPendingExercises: PendingExercise[] = pendingExercises.map((content) => ({
    id: content.id,
    title: content.title,
    type: content.type,
    authorId: content.authorId,
    authorName: content.author,
    createdAt: content.submittedAt,
    status: 'pending' as const,
  }));

  const pendingColumns: Column<PendingExercise>[] = [
    {
      key: 'title',
      label: 'Titulo',
      sortable: true,
      render: (row) => (
        <div>
          <p className="font-medium text-detective-text">{row.title}</p>
          <p className="text-xs text-gray-400">{row.type}</p>
        </div>
      ),
    },
    {
      key: 'authorName',
      label: 'Autor',
      sortable: true,
    },
    {
      key: 'createdAt',
      label: 'Fecha',
      sortable: true,
      render: (row) => new Date(row.createdAt).toLocaleDateString('es-ES'),
    },
    {
      key: 'actions',
      label: 'Acciones',
      render: (row) => (
        <div className="flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPreview(row);
            }}
            className="rounded-lg bg-blue-500/20 px-3 py-1 text-sm text-blue-500 transition-colors hover:bg-blue-500/30"
          >
            Ver
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleApproveExercise(row.id);
            }}
            className="rounded-lg bg-green-500/20 px-3 py-1 text-sm text-green-500 transition-colors hover:bg-green-500/30"
          >
            <CheckCircle className="mr-1 inline h-4 w-4" />
            Aprobar
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onReject(row);
            }}
            className="rounded-lg bg-red-500/20 px-3 py-1 text-sm text-red-500 transition-colors hover:bg-red-500/30"
          >
            <XCircle className="mr-1 inline h-4 w-4" />
            Rechazar
          </button>
        </div>
      ),
    },
  ];

  return (
    <div>
      {errorPending && (
        <div className="mb-6 rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
          <p className="font-semibold">Error:</p>
          <p>{errorPending}</p>
        </div>
      )}

      {loadingPending && !pendingExercises.length ? (
        <div className="py-12 text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-b-2 border-detective-orange"></div>
          <p className="mt-4 text-detective-text-secondary">
            Cargando ejercicios pendientes...
          </p>
        </div>
      ) : (
        <DataTable
          data={mappedPendingExercises}
          columns={pendingColumns}
          searchPlaceholder="Buscar ejercicios..."
        />
      )}
    </div>
  );
}
