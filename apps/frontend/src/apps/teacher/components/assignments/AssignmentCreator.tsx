import { useState, useEffect } from 'react';
import { Plus, List, AlertCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AssignmentWizard } from './AssignmentWizard';
import { AssignmentList } from './AssignmentList';
import type { Assignment } from '../../types';
import { apiClient } from '@/services/api/apiClient';
import { API_ENDPOINTS } from '@/config/api.config';
import toast from 'react-hot-toast';

interface AssignmentCreatorProps {
  classroomId: string;
}

interface ModuleWithExercises {
  id: string;
  title: string;
  exercises: Array<{ id: string; title: string }>;
}

interface StudentBasic {
  id: string;
  full_name: string;
}

export function AssignmentCreator({ classroomId }: AssignmentCreatorProps) {
  const [showWizard, setShowWizard] = useState(false);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [modules, setModules] = useState<ModuleWithExercises[]>([]);
  const [students, setStudents] = useState<StudentBasic[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch assignments
        const assignmentsResponse = await apiClient.get(API_ENDPOINTS.teacher.assignments, {
          params: { classroom_id: classroomId },
        });
        setAssignments(assignmentsResponse.data.assignments || []);

        // Fetch modules for wizard (if endpoint exists)
        try {
          const modulesResponse = await apiClient.get(API_ENDPOINTS.teacher.modules || '/teacher/modules');
          setModules(modulesResponse.data.modules || []);
        } catch {
          // Modules endpoint may not exist yet - wizard will handle empty state
          setModules([]);
        }

        // Fetch students for wizard
        try {
          const studentsResponse = await apiClient.get(
            API_ENDPOINTS.teacher.classroomStudents?.(classroomId) ||
              `/teacher/classrooms/${classroomId}/students`
          );
          setStudents(studentsResponse.data.students || studentsResponse.data || []);
        } catch {
          // Students endpoint may fail - wizard will handle empty state
          setStudents([]);
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Error al cargar asignaciones';
        setError(errorMessage);
        toast.error('No se pudieron cargar las asignaciones. Por favor, intenta nuevamente.', {
          duration: 4000,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [classroomId]);

  const handleCreateAssignment = async (data: Record<string, unknown>) => {
    try {
      const response = await apiClient.post(API_ENDPOINTS.teacher.createAssignment, {
        ...data,
        classroom_id: classroomId,
      });

      const newAssignment = response.data;
      setAssignments([newAssignment, ...assignments]);
      setShowWizard(false);
      toast.success('Asignación creada exitosamente', { duration: 3000 });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear asignación';
      toast.error(`Error al crear la asignación: ${errorMessage}`, { duration: 4000 });
      // Do NOT use mock data fallback - show real error to user
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <List className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-2xl font-bold text-detective-text">Asignaciones</h2>
            <p className="text-detective-text-secondary">Gestiona y crea nuevas asignaciones</p>
          </div>
        </div>
        {!showWizard && (
          <DetectiveButton onClick={() => setShowWizard(true)} disabled={loading}>
            <Plus className="h-5 w-5" />
            Nueva Asignación
          </DetectiveButton>
        )}
      </div>

      {/* Error State */}
      {error && (
        <DetectiveCard variant="warning">
          <div className="flex items-center gap-3 p-4">
            <AlertCircle className="h-6 w-6 text-red-500" />
            <div className="flex-1">
              <p className="font-medium text-red-700">Error al cargar datos</p>
              <p className="text-sm text-red-600">{error}</p>
            </div>
            <DetectiveButton
              variant="secondary"
              size="sm"
              onClick={() => window.location.reload()}
            >
              Reintentar
            </DetectiveButton>
          </div>
        </DetectiveCard>
      )}

      {/* Content */}
      {showWizard ? (
        <AssignmentWizard
          modules={modules}
          students={students}
          onComplete={handleCreateAssignment}
          onCancel={() => setShowWizard(false)}
        />
      ) : loading ? (
        <DetectiveCard>
          <div className="py-12 text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-detective-orange mx-auto mb-3"></div>
            <p className="text-detective-text-secondary">Cargando asignaciones...</p>
          </div>
        </DetectiveCard>
      ) : (
        <AssignmentList assignments={assignments} />
      )}
    </div>
  );
}
