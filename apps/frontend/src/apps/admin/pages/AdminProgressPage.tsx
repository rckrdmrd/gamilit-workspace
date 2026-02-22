/**
 * AdminProgressPage - Sistema de Seguimiento de Progreso
 *
 * Página completa para administrar y visualizar el progreso de estudiantes incluyendo:
 * - Vista general del sistema
 * - Progreso por aula con detalles de estudiantes
 * - Vista detallada de progreso individual
 * - Funcionalidad de búsqueda y filtrado
 * - Exportación a CSV
 *
 * Integrado con backend completo (6 endpoints REST funcionales)
 *
 * @author Frontend-Agent
 * @date 2025-11-24
 * @component
 */

import { Fragment, useState, useEffect, useMemo } from 'react';
import { AdminPageShell } from '../components/shared';
import { useProgress, useClassroomsList } from '../hooks';

// Components
import { OverviewView } from '../components/progress/OverviewView';
import { ClassroomsView } from '../components/progress/ClassroomsView';
import { StudentDetailView } from '../components/progress/StudentDetailView';
import { ClassroomSelector } from '../components/progress/ClassroomSelector';
import { StudentSearch } from '../components/progress/StudentSearch';

// Icons
import { TrendingUp, RefreshCw, Download, School, User } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

// Types
type ViewType = 'overview' | 'classrooms' | 'students';

/**
 * AdminProgressPage Component
 */
export default function AdminProgressPage() {
  // Fetch classrooms from API (replaces classrooms)
  const { classrooms, isLoading: _classroomsLoading } = useClassroomsList();

  // Progress hook
  const {
    overview,
    classroomProgress,
    studentProgress,
    isLoading,
    error,
    fetchOverview,
    fetchClassroomProgress,
    fetchStudentProgress,
    exportToCSV,
    clearError,
  } = useProgress();

  // View state
  const [activeView, setActiveView] = useState<ViewType>('overview');
  const [selectedClassroomId, setSelectedClassroomId] = useState<string | null>(null);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [isExporting, setIsExporting] = useState(false);

  // Load overview on mount
  useEffect(() => {
    if (activeView === 'overview') {
      fetchOverview();
    }
  }, [activeView, fetchOverview]);

  // Students list for search (extracted from classroom progress)
  const studentsForSearch = useMemo(() => {
    if (!classroomProgress) return [];
    return classroomProgress.students.map((student) => ({
      id: student.user_id,
      name: student.display_name,
      email: student.email,
    }));
  }, [classroomProgress]);

  // Handlers
  const handleViewChange = (view: ViewType) => {
    setActiveView(view);
    clearError();

    // Reset selections when changing views
    if (view === 'overview') {
      setSelectedClassroomId(null);
      setSelectedStudentId(null);
    }
  };

  const handleClassroomSelect = (classroomId: string) => {
    setSelectedClassroomId(classroomId);
    setSelectedStudentId(null);
    fetchClassroomProgress(classroomId);
  };

  const handleStudentClick = (studentId: string) => {
    setSelectedStudentId(studentId);
    setActiveView('students');
    fetchStudentProgress(studentId, {
      classroom_id: selectedClassroomId || undefined,
    });
  };

  const handleRefresh = () => {
    if (activeView === 'overview') {
      fetchOverview();
    } else if (activeView === 'classrooms' && selectedClassroomId) {
      fetchClassroomProgress(selectedClassroomId);
    } else if (activeView === 'students' && selectedStudentId) {
      fetchStudentProgress(selectedStudentId, {
        classroom_id: selectedClassroomId || undefined,
      });
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      let exportType: 'students' | 'classrooms' | 'modules' = 'students';

      if (activeView === 'classrooms') {
        exportType = 'classrooms';
      }

      await exportToCSV(exportType, selectedClassroomId || undefined);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  // Breadcrumb trail
  const breadcrumbs = useMemo(() => {
    const crumbs = ['Progreso'];

    if (activeView === 'classrooms' && selectedClassroomId) {
      const classroom = classrooms.find((c) => c.id === selectedClassroomId);
      if (classroom) {
        crumbs.push(classroom.name);
      }
    }

    if (activeView === 'students' && studentProgress) {
      crumbs.push(studentProgress.user_info.display_name);
    }

    return crumbs;
  }, [activeView, selectedClassroomId, studentProgress]);

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-detective-orange" />
              <h1 className="text-3xl font-bold text-detective-text">Seguimiento de Progreso</h1>
            </div>
            <nav aria-label="Ruta de navegacion">
              <div className="flex items-center gap-2 text-detective-text-secondary">
                {breadcrumbs.map((crumb, index) => (
                  <Fragment key={index}>
                    {index > 0 && <span aria-hidden="true">/</span>}
                    <span className={index === breadcrumbs.length - 1 ? 'font-medium' : ''} aria-current={index === breadcrumbs.length - 1 ? 'page' : undefined}>
                      {crumb}
                    </span>
                  </Fragment>
                ))}
              </div>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <DetectiveButton variant="outline" onClick={handleRefresh} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </DetectiveButton>

            <DetectiveButton
              variant="primary"
              onClick={handleExport}
              disabled={isExporting || activeView === 'overview'}
            >
              <Download className="mr-2 h-5 w-5" />
              Exportar CSV
            </DetectiveButton>
          </div>
        </div>

        {/* View Selector */}
        <DetectiveCard padding="sm">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Selector de vista">
            <DetectiveButton
              variant={activeView === 'overview' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('overview')}
              size="sm"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Resumen General
            </DetectiveButton>

            <DetectiveButton
              variant={activeView === 'classrooms' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('classrooms')}
              size="sm"
            >
              <School className="mr-2 h-4 w-4" />
              Por Aula
            </DetectiveButton>

            <DetectiveButton
              variant={activeView === 'students' ? 'primary' : 'outline'}
              onClick={() => handleViewChange('students')}
              size="sm"
            >
              <User className="mr-2 h-4 w-4" />
              Por Estudiante
            </DetectiveButton>
          </div>
        </DetectiveCard>

        {/* Filters (Classrooms and Students views) */}
        {activeView !== 'overview' && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {activeView === 'classrooms' && (
              <ClassroomSelector
                classrooms={classrooms}
                selectedClassroomId={selectedClassroomId}
                onSelect={handleClassroomSelect}
                isLoading={isLoading}
              />
            )}

            {activeView === 'students' && (
              <>
                <ClassroomSelector
                  classrooms={classrooms}
                  selectedClassroomId={selectedClassroomId}
                  onSelect={handleClassroomSelect}
                  isLoading={isLoading}
                />
                <StudentSearch
                  students={studentsForSearch}
                  onSelect={handleStudentClick}
                  isLoading={isLoading}
                />
              </>
            )}
          </div>
        )}

        {/* Error Message */}
        <div aria-live="polite">
          {error && (
            <DetectiveCard variant="danger">
              <div className="flex items-start gap-3" role="alert">
                <div className="rounded-lg bg-red-500/20 p-2">
                  <TrendingUp className="h-5 w-5 text-red-500" />
                </div>
                <div className="flex-1">
                  <p className="mb-1 font-semibold text-red-500">Error al cargar datos</p>
                  <p className="text-sm text-red-400">{error}</p>
                </div>
                <DetectiveButton variant="outline" size="sm" onClick={clearError}>
                  Cerrar
                </DetectiveButton>
              </div>
            </DetectiveCard>
          )}
        </div>

        {/* Content based on active view */}
        <div role="region" aria-label={`Vista: ${activeView === 'overview' ? 'Resumen General' : activeView === 'classrooms' ? 'Por Aula' : 'Por Estudiante'}`}>
        {activeView === 'overview' && <OverviewView overview={overview} isLoading={isLoading} />}

        {activeView === 'classrooms' && (
          <ClassroomsView
            classroomProgress={classroomProgress}
            isLoading={isLoading}
            onStudentClick={handleStudentClick}
          />
        )}

        {activeView === 'students' && (
          <StudentDetailView studentProgress={studentProgress} isLoading={isLoading} />
        )}
        </div>
      </div>
    </AdminPageShell>
  );
}
