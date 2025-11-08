import React, { useState, useMemo } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { ClassProgressDashboard } from '../components/progress/ClassProgressDashboard';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { BarChart3, RefreshCw, Filter, ChevronDown } from 'lucide-react';

/**
 * TeacherProgressPage - Página de seguimiento de progreso académico
 *
 * Proporciona una vista integral del progreso de los estudiantes con:
 * - Selector de clase para filtrar datos
 * - Dashboard de progreso con gráficos y métricas
 * - Identificación de estudiantes rezagados
 * - Análisis por módulo
 */
export default function TeacherProgressPage() {
  const { user, logout } = useAuth();
  const { classrooms, loading: dashboardLoading } = useTeacherDashboard();
  const [selectedClassroom, setSelectedClassroom] = useState<string>('all');
  const [showClassroomDropdown, setShowClassroomDropdown] = useState(false);

  // Mock gamification data - será reemplazado con datos reales del API
  const gamificationData = {
    level: 15,
    xp: 2450,
    xp_to_next: 3000,
    ml: 1250,
    rank: 'Mentor Experto',
    badges: ['first_class', 'streak_master', '100_students'],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Obtener el nombre de la clase seleccionada
  const selectedClassroomName = useMemo(() => {
    if (selectedClassroom === 'all') return 'Todas las clases';
    const classroom = classrooms.find((c) => c.id === selectedClassroom);
    return classroom?.name || 'Clase no encontrada';
  }, [selectedClassroom, classrooms]);

  // Estadísticas generales de todas las clases
  const overallStats = useMemo(() => {
    if (classrooms.length === 0) {
      return {
        totalStudents: 0,
        averageScore: 0,
        activeClasses: 0,
      };
    }

    return {
      totalStudents: classrooms.reduce((sum, c) => sum + (c.studentCount || 0), 0),
      averageScore: classrooms.reduce((sum, c) => sum + (c.averageScore || 0), 0) / classrooms.length,
      activeClasses: classrooms.filter((c) => c.isActive).length,
    };
  }, [classrooms]);

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={gamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-detective-orange bg-opacity-10 rounded-lg">
              <BarChart3 className="w-8 h-8 text-detective-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-detective-text">
                Progreso Académico
              </h1>
              <p className="text-detective-text-secondary">
                Monitorea el rendimiento y avance de tus estudiantes
              </p>
            </div>
          </div>

          {/* Refresh Button */}
          <DetectiveButton
            variant="secondary"
            size="sm"
            onClick={() => window.location.reload()}
            className="self-start md:self-auto"
          >
            <RefreshCw className="w-4 h-4" />
            Actualizar
          </DetectiveButton>
        </div>

        {/* Overall Stats Cards - Solo cuando se ve "Todas las clases" */}
        {selectedClassroom === 'all' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="text-detective-text-secondary text-sm mb-2">
                  Total de Estudiantes
                </p>
                <p className="text-4xl font-bold text-detective-text">
                  {overallStats.totalStudents}
                </p>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="text-detective-text-secondary text-sm mb-2">
                  Promedio General
                </p>
                <p className="text-4xl font-bold text-detective-gold">
                  {overallStats.averageScore.toFixed(0)}%
                </p>
              </div>
            </DetectiveCard>

            <DetectiveCard hoverable={false}>
              <div className="text-center">
                <p className="text-detective-text-secondary text-sm mb-2">
                  Clases Activas
                </p>
                <p className="text-4xl font-bold text-detective-accent">
                  {overallStats.activeClasses}
                </p>
              </div>
            </DetectiveCard>
          </div>
        )}

        {/* Classroom Selector */}
        <DetectiveCard hoverable={false}>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Filter className="w-5 h-5 text-detective-orange" />
              <div>
                <label className="text-sm font-medium text-detective-text-secondary block mb-1">
                  Filtrar por Clase
                </label>
                <p className="text-xs text-detective-text-secondary">
                  Selecciona una clase específica o visualiza todas
                </p>
              </div>
            </div>

            {/* Custom Dropdown */}
            <div className="relative">
              <button
                onClick={() => setShowClassroomDropdown(!showClassroomDropdown)}
                disabled={dashboardLoading}
                className="w-full md:w-80 px-4 py-3 bg-detective-bg-secondary border-2 border-detective-border rounded-lg text-left flex items-center justify-between hover:border-detective-orange transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-detective-text font-medium truncate">
                  {dashboardLoading ? 'Cargando clases...' : selectedClassroomName}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-detective-text-secondary transition-transform ${
                    showClassroomDropdown ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {showClassroomDropdown && !dashboardLoading && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-detective-card border-2 border-detective-border rounded-lg shadow-detective-lg z-50 max-h-80 overflow-y-auto">
                  {/* All Classes Option */}
                  <button
                    onClick={() => {
                      setSelectedClassroom('all');
                      setShowClassroomDropdown(false);
                    }}
                    className={`w-full px-4 py-3 text-left hover:bg-detective-bg-secondary transition-colors ${
                      selectedClassroom === 'all'
                        ? 'bg-detective-orange bg-opacity-10 text-detective-orange font-semibold'
                        : 'text-detective-text'
                    }`}
                  >
                    <div>
                      <p className="font-medium">Todas las clases</p>
                      <p className="text-xs text-detective-text-secondary mt-0.5">
                        Vista general de {classrooms.length} clase(s)
                      </p>
                    </div>
                  </button>

                  {/* Divider */}
                  {classrooms.length > 0 && (
                    <div className="border-t border-detective-border my-1"></div>
                  )}

                  {/* Individual Classrooms */}
                  {classrooms.map((classroom) => (
                    <button
                      key={classroom.id}
                      onClick={() => {
                        setSelectedClassroom(classroom.id);
                        setShowClassroomDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-detective-bg-secondary transition-colors ${
                        selectedClassroom === classroom.id
                          ? 'bg-detective-orange bg-opacity-10 text-detective-orange font-semibold'
                          : 'text-detective-text'
                      }`}
                    >
                      <div>
                        <p className="font-medium">{classroom.name}</p>
                        <p className="text-xs text-detective-text-secondary mt-0.5">
                          {classroom.studentCount} estudiante(s) • {classroom.grade} • {classroom.subject}
                        </p>
                      </div>
                    </button>
                  ))}

                  {/* Empty State */}
                  {classrooms.length === 0 && (
                    <div className="px-4 py-6 text-center text-detective-text-secondary">
                      <p className="text-sm">No hay clases disponibles</p>
                      <p className="text-xs mt-1">Crea una clase para comenzar</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </DetectiveCard>

        {/* Progress Dashboard */}
        {selectedClassroom !== 'all' ? (
          <ClassProgressDashboard classroomId={selectedClassroom} />
        ) : (
          <DetectiveCard hoverable={false}>
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-detective-orange bg-opacity-10 rounded-full mb-4">
                <BarChart3 className="w-8 h-8 text-detective-orange" />
              </div>
              <h3 className="text-xl font-bold text-detective-text mb-2">
                Selecciona una clase
              </h3>
              <p className="text-detective-text-secondary max-w-md mx-auto">
                Para ver el progreso detallado, análisis por módulos y estudiantes rezagados,
                selecciona una clase específica del menú desplegable superior.
              </p>
              {classrooms.length === 0 && (
                <DetectiveButton
                  variant="primary"
                  className="mt-6"
                  onClick={() => window.location.href = '/teacher/classrooms'}
                >
                  Crear Primera Clase
                </DetectiveButton>
              )}
            </div>
          </DetectiveCard>
        )}

        {/* Info Card - Tips para el Teacher */}
        <DetectiveCard hoverable={false}>
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0 p-3 bg-detective-accent bg-opacity-10 rounded-lg">
              <BarChart3 className="w-6 h-6 text-detective-accent" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-detective-text mb-2">
                Consejos para el Seguimiento de Progreso
              </h3>
              <ul className="space-y-2 text-sm text-detective-text-secondary">
                <li className="flex items-start gap-2">
                  <span className="text-detective-orange font-bold mt-0.5">•</span>
                  <span>
                    Revisa las alertas de estudiantes rezagados semanalmente para intervenir a tiempo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-detective-orange font-bold mt-0.5">•</span>
                  <span>
                    Los gráficos de progreso por módulo te ayudan a identificar temas que necesitan refuerzo
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-detective-orange font-bold mt-0.5">•</span>
                  <span>
                    Exporta reportes en PDF o Excel para compartir con directivos o padres de familia
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-detective-orange font-bold mt-0.5">•</span>
                  <span>
                    Compara el rendimiento entre clases para adaptar tus estrategias de enseñanza
                  </span>
                </li>
              </ul>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Click Outside Handler for Dropdown */}
      {showClassroomDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowClassroomDropdown(false)}
        />
      )}
    </TeacherLayout>
  );
}
