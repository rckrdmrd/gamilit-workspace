import React, { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { StudentMonitoringPanel } from '../components/monitoring/StudentMonitoringPanel';
import { useTeacherDashboard } from '../hooks/useTeacherDashboard';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Users, BookOpen, RefreshCw, Filter, AlertCircle } from 'lucide-react';

/**
 * TeacherMonitoringPage - Pagina de monitoreo en tiempo real
 *
 * Funcionalidades:
 * - Filtros por clase (classroom)
 * - Estadisticas en tiempo real
 * - Auto-refresh cada 30 segundos (configurado en StudentMonitoringPanel)
 * - Usa TeacherLayout para consistencia visual
 * - Tema Detective consistente
 */
export default function TeacherMonitoringPage() {
  const { user, logout } = useAuth();
  const { classrooms, loading: classroomsLoading, error: classroomsError } = useTeacherDashboard();
  const [selectedClassroom, setSelectedClassroom] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Mock gamification data - reemplazar con datos reales del API
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

  // Auto-seleccionar la primera clase cuando carguen los datos
  useEffect(() => {
    if (!selectedClassroom && classrooms.length > 0) {
      setSelectedClassroom(classrooms[0].id);
    }
  }, [classrooms, selectedClassroom]);

  // Obtener información de la clase seleccionada
  const selectedClassroomData = classrooms.find((c) => c.id === selectedClassroom);

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={gamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-detective-text">
              Monitoreo en Tiempo Real
            </h1>
            <p className="text-detective-text-secondary mt-1">
              Supervisa la actividad de tus estudiantes en tiempo real
            </p>
          </div>

          <div className="flex items-center gap-3">
            <DetectiveButton
              variant="secondary"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4 mr-2" />
              {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
            </DetectiveButton>
          </div>
        </div>

        {/* Error al cargar clases */}
        {classroomsError && (
          <DetectiveCard>
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-sm font-medium text-red-800">
                  Error al cargar las clases
                </p>
                <p className="text-xs text-red-600 mt-1">{classroomsError}</p>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Filtros por Clase */}
        {showFilters && (
          <DetectiveCard>
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-detective-orange" />
                <h3 className="text-lg font-semibold text-detective-text">
                  Seleccionar Clase
                </h3>
              </div>

              {classroomsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 text-detective-orange animate-spin" />
                  <span className="ml-3 text-detective-text-secondary">
                    Cargando clases...
                  </span>
                </div>
              ) : classrooms.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-detective-text-secondary mx-auto mb-3" />
                  <p className="text-detective-text-secondary">
                    No tienes clases creadas todavia
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {classrooms.map((classroom) => (
                    <button
                      key={classroom.id}
                      onClick={() => setSelectedClassroom(classroom.id)}
                      className={`p-4 rounded-lg border-2 transition-all text-left ${
                        selectedClassroom === classroom.id
                          ? 'border-detective-orange bg-detective-orange/10'
                          : 'border-detective-border hover:border-detective-orange/50'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-detective-text">
                            {classroom.name}
                          </h4>
                          <p className="text-sm text-detective-text-secondary mt-1">
                            {classroom.grade} - {classroom.subject}
                          </p>
                        </div>
                        {selectedClassroom === classroom.id && (
                          <div className="w-3 h-3 rounded-full bg-detective-orange" />
                        )}
                      </div>
                      <div className="flex items-center gap-4 mt-3 text-xs text-detective-text-secondary">
                        <div className="flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          <span>{classroom.studentCount} estudiantes</span>
                        </div>
                        {classroom.averageScore !== undefined && (
                          <div className="flex items-center gap-1">
                            <span>Promedio:</span>
                            <span className="font-medium text-detective-orange">
                              {classroom.averageScore.toFixed(1)}%
                            </span>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </DetectiveCard>
        )}

        {/* Informacion de la clase seleccionada */}
        {selectedClassroomData && (
          <DetectiveCard hoverable={false}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-detective-orange/10 rounded-lg">
                  <BookOpen className="w-6 h-6 text-detective-orange" />
                </div>
                <div>
                  <h3 className="font-semibold text-detective-text">
                    {selectedClassroomData.name}
                  </h3>
                  <p className="text-sm text-detective-text-secondary">
                    {selectedClassroomData.grade} - {selectedClassroomData.subject}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6 text-sm">
                <div className="text-center">
                  <p className="text-2xl font-bold text-detective-text">
                    {selectedClassroomData.studentCount}
                  </p>
                  <p className="text-detective-text-secondary">Estudiantes</p>
                </div>
                {selectedClassroomData.averageScore !== undefined && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-detective-orange">
                      {selectedClassroomData.averageScore.toFixed(1)}%
                    </p>
                    <p className="text-detective-text-secondary">Promedio</p>
                  </div>
                )}
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Panel de Monitoreo de Estudiantes */}
        {selectedClassroom ? (
          <StudentMonitoringPanel classroomId={selectedClassroom} />
        ) : (
          <DetectiveCard>
            <div className="text-center py-12">
              <BookOpen className="w-16 h-16 text-detective-text-secondary mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-detective-text mb-2">
                Selecciona una clase
              </h3>
              <p className="text-detective-text-secondary mb-6">
                Elige una clase para ver el monitoreo en tiempo real de tus estudiantes
              </p>
              {!showFilters && (
                <DetectiveButton
                  variant="primary"
                  onClick={() => setShowFilters(true)}
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Mostrar Filtros
                </DetectiveButton>
              )}
            </div>
          </DetectiveCard>
        )}
      </div>
    </TeacherLayout>
  );
}
