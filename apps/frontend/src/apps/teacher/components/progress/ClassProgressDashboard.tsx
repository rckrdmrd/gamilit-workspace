import { useState } from 'react';
import toast from 'react-hot-toast';
import { TrendingUp, Download, Users, Target, Clock, Award } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ProgressChart } from './ProgressChart';
import { ModuleCompletionCard } from './ModuleCompletionCard';
import { StudentProgressList } from './StudentProgressList';
import { StudentDetailModal } from '../monitoring/StudentDetailModal';
import { useClassroomData } from '../../hooks/useClassroomData';
import { reportsApi } from '@/services/api/teacher/reportsApi';
import type { GenerateReportDto } from '@/services/api/teacher/reportsApi';
import type { StudentMonitoring } from '../../types';

interface ClassProgressDashboardProps {
  classroomId: string;
}

export function ClassProgressDashboard({ classroomId }: ClassProgressDashboardProps) {
  const { data, moduleProgress, students, loading, error, refresh } = useClassroomData(classroomId);
  const [selectedStudent, setSelectedStudent] = useState<StudentMonitoring | null>(null);

  const handleExport = async (format: 'pdf' | 'excel') => {
    try {
      const dto: GenerateReportDto = {
        type: 'progress',
        classroom_id: classroomId,
        format,
      };

      const result = await reportsApi.generateReport(dto);
      const blob = result.blob;
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `progress-report-${classroomId}.${format === 'excel' ? 'xlsx' : 'pdf'}`;
      a.click();
      toast.success(`Reporte exportado como ${format.toUpperCase()}`, {
        duration: 3000,
        icon: '📊',
      });
    } catch (error) {
      console.error('Error exporting report:', error);
      toast.error('Error al exportar el reporte. Verifica tu conexión.', {
        duration: 4000,
      });
    }
  };

  // Identificar estudiantes rezagados (menos del 50% de progreso)
  const laggingStudentsCount = data ? Math.floor(data.student_count * 0.2) : 0;

  if (loading) {
    return (
      <DetectiveCard>
        <div className="py-12 text-center">
          <p className="text-detective-text-secondary">Cargando datos de progreso...</p>
        </div>
      </DetectiveCard>
    );
  }

  if (error || !data) {
    return (
      <DetectiveCard>
        <div className="py-8 text-center">
          <p className="text-red-500">Error al cargar datos: {error?.message}</p>
          <DetectiveButton onClick={refresh} variant="secondary" className="mt-4">
            Reintentar
          </DetectiveButton>
        </div>
      </DetectiveCard>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <TrendingUp className="h-8 w-8 text-detective-orange" />
          <div>
            <h2 className="text-2xl font-bold text-detective-text">Progreso de Clase</h2>
            <p className="text-detective-text-secondary">Vista general del rendimiento del aula</p>
          </div>
        </div>
        <div className="flex gap-2">
          <DetectiveButton variant="secondary" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4" />
            Exportar PDF
          </DetectiveButton>
          <DetectiveButton variant="secondary" onClick={() => handleExport('excel')}>
            <Download className="h-4 w-4" />
            Exportar Excel
          </DetectiveButton>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Completitud General</p>
              <p className="text-3xl font-bold text-detective-text">
                {data.average_completion.toFixed(0)}%
              </p>
            </div>
            <Target className="h-10 w-10 text-detective-orange" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Score Promedio</p>
              <p className="text-3xl font-bold text-detective-gold">
                {data.average_score.toFixed(0)}%
              </p>
            </div>
            <Award className="h-10 w-10 text-detective-gold" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Estudiantes Activos</p>
              <p className="text-3xl font-bold text-detective-text">
                {data.active_students}/{data.student_count}
              </p>
            </div>
            <Users className="text-detective-accent h-10 w-10" />
          </div>
        </DetectiveCard>

        <DetectiveCard hoverable={false}>
          <div className="flex items-center justify-between">
            <div>
              <p className="mb-1 text-sm text-detective-text-secondary">Ejercicios Completados</p>
              <p className="text-3xl font-bold text-detective-text">
                {data.completed_exercises}/{data.total_exercises}
              </p>
            </div>
            <Clock className="h-10 w-10 text-detective-orange" />
          </div>
        </DetectiveCard>
      </div>

      {/* Alerts for Lagging Students */}
      {laggingStudentsCount > 0 && (
        <DetectiveCard hoverable={false}>
          <div className="flex items-start gap-4">
            <div className="rounded-lg bg-yellow-500/10 p-3">
              <Users className="h-6 w-6 text-yellow-500" />
            </div>
            <div>
              <h3 className="mb-1 text-lg font-bold text-detective-text">Estudiantes Rezagados</h3>
              <p className="text-detective-text-secondary">
                Se identificaron aproximadamente {laggingStudentsCount} estudiante(s) con progreso
                menor al 50%. Considera intervenir para apoyarlos.
              </p>
            </div>
          </div>
        </DetectiveCard>
      )}

      {/* Module Progress Charts */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <ProgressChart
          title="Completitud por Módulo"
          data={moduleProgress.map((m) => ({
            label: m.module_name.substring(0, 20) + '...',
            value: m.completion_percentage,
          }))}
          type="bar"
        />

        <ProgressChart
          title="Score Promedio por Módulo"
          data={moduleProgress.map((m) => ({
            label: m.module_name.substring(0, 20) + '...',
            value: m.average_score,
            color:
              m.average_score >= 80
                ? 'bg-green-500'
                : m.average_score >= 60
                  ? 'bg-yellow-500'
                  : 'bg-red-500',
          }))}
          type="bar"
        />
      </div>

      {/* Time Chart */}
      <ProgressChart
        title="Tiempo Promedio por Módulo (minutos)"
        data={moduleProgress.map((m) => ({
          label: m.module_name.substring(0, 15) + '...',
          value: m.average_time_minutes,
        }))}
        type="line"
      />

      {/* Module Cards Grid */}
      <div>
        <h3 className="mb-4 text-xl font-bold text-detective-text">Detalle por Módulo</h3>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {moduleProgress.map((module) => (
            <ModuleCompletionCard key={module.module_id} module={module} />
          ))}
        </div>
      </div>

      {/* Summary Stats */}
      <DetectiveCard hoverable={false}>
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-detective-text">Resumen de Rendimiento</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-detective-text-secondary">Tasa de Finalización</p>
              <p className="text-2xl font-bold text-detective-text">
                {((data.completed_exercises / data.total_exercises) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-detective-text-secondary">Engagement Rate</p>
              <p className="text-2xl font-bold text-detective-text">
                {((data.active_students / data.student_count) * 100).toFixed(0)}%
              </p>
            </div>
            <div className="rounded-lg bg-detective-bg-secondary p-4">
              <p className="mb-2 text-sm text-detective-text-secondary">
                Módulos Promedio Completados
              </p>
              <p className="text-2xl font-bold text-detective-text">
                {(
                  moduleProgress.reduce(
                    (sum, m) => sum + (m.completion_percentage === 100 ? 1 : 0),
                    0,
                  ) / data.student_count
                ).toFixed(1)}
              </p>
            </div>
          </div>
        </div>
      </DetectiveCard>

      {/* Student Progress List */}
      <StudentProgressList students={students} onStudentClick={setSelectedStudent} />

      {/* Student Detail Modal */}
      {selectedStudent && (
        <StudentDetailModal student={selectedStudent} onClose={() => setSelectedStudent(null)} />
      )}
    </div>
  );
}
