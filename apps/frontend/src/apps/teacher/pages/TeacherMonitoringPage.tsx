import { useState, useEffect } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { StudentMonitoringPanel } from '../components/monitoring/StudentMonitoringPanel';
import { useClassrooms } from '../hooks/useClassrooms';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { ToastContainer, useToast } from '@shared/components/base/Toast';
import { Users, BookOpen, RefreshCw, Filter, AlertCircle, Loader2 } from 'lucide-react';

/**
 * TeacherMonitoringPage - Pagina de monitoreo en tiempo real
 *
 * Funcionalidades mejoradas:
 * - Filtros por clase (classroom)
 * - Estadisticas en tiempo real con status mejorados
 * - Auto-refresh configurable (15s, 30s, 60s, manual)
 * - Notificaciones Toast para eventos de estudiantes
 * - Contador regresivo y última actualización
 * - Usa TeacherLayout para consistencia visual
 * - Tema Detective consistente
 */
export default function TeacherMonitoringPage() {
  const { user, logout } = useAuth();
  const { classrooms, selectedClassroom, students, loading, error, selectClassroom, refresh } =
    useClassrooms();
  const [showFilters, setShowFilters] = useState(false);
  const { toasts } = useToast();

  // Use useUserGamification hook for real-time gamification data
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Auto-seleccionar la primera clase cuando carguen los datos
  useEffect(() => {
    if (!selectedClassroom && classrooms.length > 0) {
      selectClassroom(classrooms[0].id);
    }
  }, [classrooms, selectedClassroom, selectClassroom]);

  return (
    <>
      {/* Toast notifications container */}
      <ToastContainer toasts={toasts} position="top-right" />

      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName="Mi Institución"
        onLogout={handleLogout}
      >
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-detective-text">Monitoreo en Tiempo Real</h1>
              <p className="mt-1 text-detective-text-secondary">
                Supervisa la actividad de tus estudiantes en tiempo real
              </p>
            </div>

            <div className="flex items-center gap-3">
              {!loading && !error && (
                <DetectiveButton variant="secondary" onClick={refresh}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Actualizar
                </DetectiveButton>
              )}
              <DetectiveButton variant="secondary" onClick={() => setShowFilters(!showFilters)}>
                <Filter className="mr-2 h-4 w-4" />
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </DetectiveButton>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="mb-4 h-12 w-12 animate-spin text-detective-orange" />
              <p className="text-detective-text-secondary">Cargando clases...</p>
            </div>
          )}

          {/* Error al cargar clases */}
          {error && !loading && (
            <DetectiveCard variant="danger">
              <div className="flex items-start gap-4">
                <AlertCircle className="h-8 w-8 flex-shrink-0 text-red-500" />
                <div className="flex-1">
                  <h3 className="mb-2 text-lg font-bold text-detective-text">
                    Error al cargar clases
                  </h3>
                  <p className="mb-4 text-detective-text-secondary">
                    No se pudieron cargar las clases. Por favor, intenta nuevamente.
                  </p>
                  <p className="mb-4 rounded bg-red-950 p-2 font-mono text-sm text-red-400">
                    {error.message}
                  </p>
                  <DetectiveButton onClick={refresh} variant="primary">
                    <RefreshCw className="h-4 w-4" />
                    Reintentar
                  </DetectiveButton>
                </div>
              </div>
            </DetectiveCard>
          )}

          {/* Filtros por Clase */}
          {showFilters && !loading && !error && (
            <DetectiveCard>
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-detective-orange" />
                  <h3 className="text-lg font-semibold text-detective-text">Seleccionar Clase</h3>
                </div>

                {classrooms.length === 0 ? (
                  <div className="py-8 text-center">
                    <Users className="mx-auto mb-3 h-12 w-12 text-detective-text-secondary" />
                    <p className="text-detective-text-secondary">
                      No tienes clases creadas todavia
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                    {classrooms.map((classroom) => (
                      <button
                        key={classroom.id}
                        onClick={() => selectClassroom(classroom.id)}
                        className={`rounded-lg border-2 p-4 text-left transition-all ${
                          selectedClassroom?.id === classroom.id
                            ? 'border-detective-orange bg-detective-orange/10'
                            : 'border-detective-border hover:border-detective-orange/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-semibold text-detective-text">{classroom.name}</h4>
                            <p className="mt-1 text-sm text-detective-text-secondary">
                              {classroom.grade_level} - {classroom.subject}
                            </p>
                          </div>
                          {selectedClassroom?.id === classroom.id && (
                            <div className="h-3 w-3 rounded-full bg-detective-orange" />
                          )}
                        </div>
                        <div className="mt-3 flex items-center gap-4 text-xs text-detective-text-secondary">
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span>{classroom.student_count} estudiantes</span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </DetectiveCard>
          )}

          {/* Informacion de la clase seleccionada */}
          {selectedClassroom && !loading && !error && (
            <DetectiveCard hoverable={false}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-detective-orange/10 p-3">
                    <BookOpen className="h-6 w-6 text-detective-orange" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-detective-text">{selectedClassroom.name}</h3>
                    <p className="text-sm text-detective-text-secondary">
                      {selectedClassroom.grade_level} - {selectedClassroom.subject}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-detective-text">
                      {selectedClassroom.student_count}
                    </p>
                    <p className="text-detective-text-secondary">Estudiantes</p>
                  </div>
                  <div className="text-center">
                    <p className="text-detective-accent text-2xl font-bold">{students.length}</p>
                    <p className="text-detective-text-secondary">Cargados</p>
                  </div>
                </div>
              </div>
            </DetectiveCard>
          )}

          {/* Panel de Monitoreo de Estudiantes */}
          {selectedClassroom && !loading && !error ? (
            <StudentMonitoringPanel classroomId={selectedClassroom.id} />
          ) : !loading && !error ? (
            <DetectiveCard>
              <div className="py-12 text-center">
                <BookOpen className="mx-auto mb-4 h-16 w-16 text-detective-text-secondary" />
                <h3 className="mb-2 text-lg font-semibold text-detective-text">
                  Selecciona una clase
                </h3>
                <p className="mb-6 text-detective-text-secondary">
                  Elige una clase para ver el monitoreo en tiempo real de tus estudiantes
                </p>
                {!showFilters && classrooms.length > 0 && (
                  <DetectiveButton variant="primary" onClick={() => setShowFilters(true)}>
                    <Filter className="mr-2 h-4 w-4" />
                    Mostrar Filtros
                  </DetectiveButton>
                )}
              </div>
            </DetectiveCard>
          ) : null}
        </div>
      </TeacherLayout>
    </>
  );
}
