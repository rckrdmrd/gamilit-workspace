import { useState, useEffect, useMemo } from 'react';
import { StudentMonitoringPanel } from '../components/monitoring/StudentMonitoringPanel';
import { useClassrooms } from '../hooks/useClassrooms';
import { useClassroomRealtime } from '../hooks/useClassroomRealtime';
import type { RealtimeEvent } from '../hooks/useClassroomRealtime';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { Users, BookOpen, RefreshCw, Filter, AlertCircle, Loader2, Wifi, WifiOff, Activity, Bell } from 'lucide-react';
import { LoadingSpinner } from '@shared/components/loading';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

/**
 * TeacherMonitoringPage - Pagina de monitoreo en tiempo real
 *
 * Funcionalidades mejoradas:
 * - Filtros por clase (classroom)
 * - Estadisticas en tiempo real con status mejorados
 * - Auto-refresh configurable (15s, 30s, 60s, manual)
 * - Notificaciones Toast para eventos de estudiantes
 * - Contador regresivo y última actualización
 * - Tema Detective consistente
 */
export default function TeacherMonitoringPage() {
  const { classrooms, selectedClassroom, students, loading, error, selectClassroom, refresh } =
    useClassrooms();
  const [showFilters, setShowFilters] = useState(false);

  // Build classroomIds array for real-time hook (stable reference via useMemo)
  const classroomIds = useMemo(
    () => (selectedClassroom ? [selectedClassroom.id] : []),
    [selectedClassroom],
  );

  // Real-time classroom monitoring via WebSocket
  const {
    isConnected: realtimeConnected,
    isConnecting: realtimeConnecting,
    events: realtimeEvents,
    onlineStudents,
    clearEvents,
    reconnect: realtimeReconnect,
  } = useClassroomRealtime({
    classroomIds,
    enabled: classroomIds.length > 0,
  });

  // Derive counts from real-time data
  const onlineCount = onlineStudents.size;
  const recentAlerts = realtimeEvents.filter(
    (e: RealtimeEvent) => e.type === 'alert',
  ).length;
  const recentSubmissions = realtimeEvents.filter(
    (e: RealtimeEvent) => e.type === 'submission',
  ).length;

  // Auto-seleccionar la primera clase cuando carguen los datos
  useEffect(() => {
    if (!selectedClassroom && classrooms.length > 0) {
      selectClassroom(classrooms[0].id);
    }
  }, [classrooms, selectedClassroom, selectClassroom]);

  // Clear real-time events when switching classrooms
  useEffect(() => {
    clearEvents();
  }, [selectedClassroom?.id, clearEvents]);

  return (
    <TeacherPageShell>
    <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Monitoreo en Tiempo Real</h1>
              <p className="mt-1 text-detective-text-secondary">
                Supervisa la actividad de tus estudiantes en tiempo real
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Real-time connection status indicator */}
              {classroomIds.length > 0 && (
                <div className="flex items-center gap-2" aria-live="polite">
                  {realtimeConnected ? (
                    <span className="flex items-center gap-1 rounded-full bg-green-500/20 px-3 py-1 text-xs font-medium text-green-400">
                      <Wifi className="h-3 w-3" />
                      En vivo
                    </span>
                  ) : realtimeConnecting ? (
                    <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-3 py-1 text-xs font-medium text-yellow-400">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Conectando...
                    </span>
                  ) : (
                    <button
                      onClick={realtimeReconnect}
                      className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1 text-xs font-medium text-red-400 transition-colors hover:bg-red-500/30"
                      title="Haz clic para reconectar"
                    >
                      <WifiOff className="h-3 w-3" />
                      Desconectado
                    </button>
                  )}
                </div>
              )}
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
            <div className="flex flex-col items-center justify-center py-20" aria-live="polite">
              <LoadingSpinner size="lg" className="mb-4" />
              <p className="text-detective-text-secondary">Cargando clases...</p>
            </div>
          )}

          {/* Error al cargar clases */}
          {error && !loading && (
            <DetectiveCard variant="danger">
              <div className="flex items-start gap-4" role="alert">
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
                  {realtimeConnected && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-400">
                        {onlineCount}
                      </p>
                      <p className="text-detective-text-secondary">En linea</p>
                    </div>
                  )}
                  <div className="text-center">
                    <p className="text-detective-accent text-2xl font-bold">{students.length}</p>
                    <p className="text-detective-text-secondary">Cargados</p>
                  </div>
                </div>
              </div>
            </DetectiveCard>
          )}

          {/* Real-time Activity Summary */}
          {selectedClassroom && realtimeConnected && !loading && !error && realtimeEvents.length > 0 && (
            <DetectiveCard>
              <div className="space-y-3" role="region" aria-label="Actividad en tiempo real" aria-live="polite">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-detective-orange" />
                    <h3 className="text-lg font-semibold text-detective-text">
                      Actividad en Tiempo Real
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    {recentSubmissions > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-medium text-blue-400">
                        <BookOpen className="h-3 w-3" />
                        {recentSubmissions} entrega{recentSubmissions !== 1 ? 's' : ''}
                      </span>
                    )}
                    {recentAlerts > 0 && (
                      <span className="flex items-center gap-1 rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-medium text-red-400">
                        <Bell className="h-3 w-3" />
                        {recentAlerts} alerta{recentAlerts !== 1 ? 's' : ''}
                      </span>
                    )}
                    <button
                      onClick={clearEvents}
                      className="text-xs text-detective-text-secondary hover:text-detective-text"
                      aria-label="Limpiar eventos de actividad en tiempo real"
                    >
                      Limpiar
                    </button>
                  </div>
                </div>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {realtimeEvents.slice(0, 10).map((event, idx) => {
                    let icon = '';
                    let text = '';
                    const ts = 'timestamp' in event.data
                      ? new Date(event.data.timestamp).toLocaleTimeString()
                      : '';

                    switch (event.type) {
                      case 'activity':
                        icon = '📝';
                        text = `${event.data.studentName}: ${event.data.activityType.replace(/_/g, ' ')}${event.data.exerciseTitle ? ` — ${event.data.exerciseTitle}` : ''}`;
                        break;
                      case 'submission':
                        icon = '✅';
                        text = `${event.data.studentName} entrego ${event.data.exerciseTitle} (${event.data.score}/${event.data.maxScore})`;
                        break;
                      case 'alert':
                        icon = '⚠️';
                        text = `${event.data.studentName}: ${event.data.title}`;
                        break;
                      case 'online_status':
                        icon = event.data.isOnline ? '🟢' : '🔴';
                        text = `${event.data.studentName} ${event.data.isOnline ? 'se conecto' : 'se desconecto'}`;
                        break;
                      case 'progress':
                        icon = '🏆';
                        text = `${event.data.studentName}: ${event.data.progressType.replace(/_/g, ' ')}`;
                        break;
                      case 'classroom_update':
                        icon = '📢';
                        text = `${event.data.classroomName}: ${event.data.updateType.replace(/_/g, ' ')}`;
                        break;
                    }

                    return (
                      <div
                        key={`${event.type}-${idx}`}
                        className="flex items-center gap-2 rounded px-2 py-1 text-sm text-detective-text-secondary hover:bg-detective-surface"
                      >
                        <span className="flex-shrink-0">{icon}</span>
                        <span className="flex-1 truncate">{text}</span>
                        <span className="flex-shrink-0 text-xs opacity-60">{ts}</span>
                      </div>
                    );
                  })}
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
    </TeacherPageShell>
  );
}
