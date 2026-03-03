import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { EmptyState } from '@shared/components/feedback';
import { AlertCircle, RefreshCw, ChevronDown } from 'lucide-react';
import type { Classroom } from '../../types';

// ============================================================================
// TYPES
// ============================================================================

export interface DashboardClassroomsListProps {
  classrooms: Classroom[];
  classroomsLoading: boolean;
  selectedClassroomId: string;
  onClassroomChange: (classroomId: string) => void;
  loading: boolean;
  error: Error | null;
  onRefresh: () => Promise<void>;
}

// ============================================================================
// COMPONENT
// ============================================================================

export function DashboardClassroomsList({
  classrooms,
  classroomsLoading,
  selectedClassroomId,
  onClassroomChange,
  loading,
  error,
  onRefresh,
}: DashboardClassroomsListProps) {
  return (
    <>
      {/* Welcome Section */}
      <div className="mb-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="mb-2 text-2xl sm:text-4xl font-bold text-detective-text">
              Dashboard del Profesor
            </h1>
            <p className="text-detective-text-secondary">
              Gestiona tu aula, monitorea estudiantes y genera analíticas avanzadas
            </p>
          </div>
          <div className="flex items-center gap-3">
            {/* Classroom Selector */}
            {!classroomsLoading && classrooms && classrooms.length > 0 && (
              <div className="relative">
                <select
                  value={selectedClassroomId}
                  onChange={(e) => onClassroomChange(e.target.value)}
                  className="border-detective-border cursor-pointer appearance-none rounded-lg border bg-detective-bg-secondary px-4 py-2 pr-10 text-detective-text focus:border-detective-orange focus:outline-none"
                >
                  {classrooms.map((classroom) => (
                    <option key={classroom.id} value={classroom.id}>
                      {classroom.name || `Clase ${classroom.id}`}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-detective-text-secondary" />
              </div>
            )}
            {!loading && !error && (
              <DetectiveButton
                onClick={onRefresh}
                variant="secondary"
                className="flex items-center gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Actualizar
              </DetectiveButton>
            )}
          </div>
        </div>
      </div>

      {/* Empty Classrooms State — H-02 FIX */}
      {!classroomsLoading && (!classrooms || classrooms.length === 0) && (
        <DetectiveCard>
          <EmptyState
            icon={AlertCircle}
            title="No hay aulas asignadas"
            description="No tienes aulas asignadas actualmente. Contacta al administrador para que te asigne un aula, o crea una nueva desde el panel de administracion."
          />
        </DetectiveCard>
      )}
    </>
  );
}
