/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef } from 'react';
import { Search, RefreshCw, Users } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { InputDetective } from '@shared/components/base/InputDetective';
import { StudentStatusCard } from './StudentStatusCard';
import { StudentDetailModal } from './StudentDetailModal';
import { RefreshControl } from './RefreshControl';
import { useStudentMonitoring } from '../../hooks/useStudentMonitoring';
import { useToast } from '@shared/components/base/Toast';
import type { StudentFilter, StudentMonitoring } from '../../types';

interface StudentMonitoringPanelProps {
  classroomId: string;
}

export function StudentMonitoringPanel({ classroomId }: StudentMonitoringPanelProps) {
  const [filters, setFilters] = useState<StudentFilter>({});
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitoring | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const previousStudentsRef = useRef<StudentMonitoring[]>([]);
  const { showToast } = useToast();

  const { students, loading, error, refreshInterval, setRefreshInterval, refresh, lastUpdate } =
    useStudentMonitoring(classroomId, filters);

  // Detect student events and show notifications
  useEffect(() => {
    if (!previousStudentsRef.current.length || !students.length) {
      previousStudentsRef.current = students;
      return;
    }

    const previous = previousStudentsRef.current;
    const current = students;

    // Check for newly active students
    current.forEach((student) => {
      const prevStudent = previous.find((s) => s.id === student.id);
      if (!prevStudent) return;

      // Student just became active
      const now = new Date();
      const lastActivity = new Date(student.last_activity);
      const diffMins = Math.floor((now.getTime() - lastActivity.getTime()) / 60000);

      if (diffMins < 1 && student.status === 'active') {
        const prevLastActivity = new Date(prevStudent.last_activity);
        const prevDiffMins = Math.floor((now.getTime() - prevLastActivity.getTime()) / 60000);

        if (prevDiffMins > 5) {
          showToast({
            type: 'info',
            title: 'Estudiante conectado',
            message: `${student.full_name} acaba de iniciar sesión`,
            duration: 4000,
          });
        }
      }

      // Student completed an exercise
      if (student.exercises_completed > prevStudent.exercises_completed) {
        showToast({
          type: 'success',
          title: 'Ejercicio completado',
          message: `${student.full_name} completó un ejercicio`,
          duration: 4000,
        });
      }
    });

    previousStudentsRef.current = students;
  }, [students, showToast]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setFilters((prev) => ({ ...prev, search: value }));
  };

  const handleStatusFilter = (status: string) => {
    setFilters((prev) => {
      const currentStatuses = prev.status || [];
      const newStatuses = currentStatuses.includes(status as any)
        ? currentStatuses.filter((s) => s !== status)
        : [...currentStatuses, status as any];

      return {
        ...prev,
        status: newStatuses.length > 0 ? newStatuses : undefined,
      };
    });
  };

  // Calculate counts based on improved status logic
  const getStudentStatus = (student: StudentMonitoring) => {
    const now = new Date();
    const last = new Date(student.last_activity);
    const diffMins = Math.floor((now.getTime() - last.getTime()) / 60000);

    if (diffMins < 5) return 'active';
    if (student.current_exercise && diffMins < 30) return 'in_exercise';
    if (diffMins >= 30) return 'offline';
    return 'inactive';
  };

  const activeCount = students.filter((s) => getStudentStatus(s) === 'active').length;
  const inExerciseCount = students.filter((s) => getStudentStatus(s) === 'in_exercise').length;
  const inactiveCount = students.filter((s) => getStudentStatus(s) === 'inactive').length;
  const offlineCount = students.filter((s) => getStudentStatus(s) === 'offline').length;

  if (error) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center">
          <p className="text-red-500">Error: {error.message}</p>
          <DetectiveButton onClick={refresh} variant="secondary" className="mt-4">
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with RefreshControl */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-2xl font-bold text-detective-text">Monitoreo de Estudiantes</h2>
            <p className="text-detective-text-secondary">Vista en tiempo real del aula</p>
          </div>
        </div>
        <RefreshControl
          interval={refreshInterval}
          onIntervalChange={setRefreshInterval}
          onRefresh={refresh}
          loading={loading}
          lastUpdate={lastUpdate}
        />
      </div>

      {/* Stats Overview with improved categorization */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-detective-text">{students.length}</p>
              <p className="text-sm text-detective-text-secondary">Total</p>
            </div>
            <Users className="h-8 w-8 text-detective-orange" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-green-500">{activeCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <div className="h-2 w-2 rounded-full bg-green-500" />
                Activos
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-blue-500">{inExerciseCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                En ejercicio
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-gray-500">{inactiveCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <div className="h-2 w-2 rounded-full bg-gray-500" />
                Inactivos
              </p>
            </div>
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-bold text-red-500">{offlineCount}</p>
              <p className="flex items-center gap-1 text-sm text-detective-text-secondary">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                Offline
              </p>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Search and Filters */}
      <DetectiveCard>
        <div className="space-y-4">
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-detective-text-secondary" />
                <InputDetective
                  type="text"
                  placeholder="Buscar estudiante..."
                  value={searchTerm}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <DetectiveButton
                variant={filters.status?.includes('active') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('active')}
              >
                🟢 Activos
              </DetectiveButton>
              <DetectiveButton
                variant={filters.status?.includes('inactive') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('inactive')}
              >
                🟡 Inactivos
              </DetectiveButton>
              <DetectiveButton
                variant={filters.status?.includes('offline') ? 'primary' : 'secondary'}
                onClick={() => handleStatusFilter('offline')}
              >
                🔴 Offline
              </DetectiveButton>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Students Grid */}
      {loading && !students.length ? (
        <div className="py-12 text-center">
          <RefreshCw className="mx-auto mb-4 h-8 w-8 animate-spin text-detective-orange" />
          <p className="text-detective-text-secondary">Cargando estudiantes...</p>
        </div>
      ) : students.length === 0 ? (
        <DetectiveCard>
          <div className="py-12 text-center">
            <Users className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
            <p className="text-detective-text-secondary">No se encontraron estudiantes</p>
          </div>
        </DetectiveCard>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {students.map((student) => (
            <StudentStatusCard
              key={student.id}
              student={student}
              onClick={() => setSelectedStudent(student)}
            />
          ))}
        </div>
      )}

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
