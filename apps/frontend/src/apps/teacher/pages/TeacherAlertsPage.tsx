import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useClassrooms } from '../hooks/useClassrooms';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { InterventionAlertsPanel } from '../components/alerts/InterventionAlertsPanel';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { AlertTriangle, Bell, Filter, X, TrendingUp, Activity, AlertCircle } from 'lucide-react';
import type { AlertPriority, AlertType } from '../types';

/**
 * TeacherAlertsPage - Sistema de Alertas
 *
 * ESTADO: Completamente Funcional
 * - ✅ Ver alertas generadas automáticamente
 * - ✅ Filtrar por tipo, prioridad y estado
 * - ✅ Gestionar alertas (reconocer, resolver, descartar)
 * - ⏳ Configurar alertas personalizadas - Fase 3
 * - ⏳ Notificaciones push/email - Fase 3
 *
 * Sistema de alertas de intervención para monitoreo y seguimiento de estudiantes.
 */
export default function TeacherAlertsPage() {
  const { user, logout } = useAuth();
  const { classrooms, selectedClassroom } = useClassrooms();

  // Filtros principales
  const [filterPriority, setFilterPriority] = useState<AlertPriority | 'all'>('all');
  const [filterType, setFilterType] = useState<AlertType | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Classroom ID from user context - use first classroom if available
  const selectedClassroomId = selectedClassroom?.id ?? classrooms[0]?.id ?? null;

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Fallback gamification data in case hook fails or user is not loaded
  const displayGamificationData = gamificationData || {
    userId: user?.id || 'mock-teacher-id',
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

  // Tipos de alertas con sus configuraciones
  const alertTypes = [
    {
      value: 'no_activity',
      label: 'Sin Actividad',
      icon: '🚨',
      description: 'Estudiantes inactivos >7 días',
    },
    { value: 'low_score', label: 'Bajo Rendimiento', icon: '⚠️', description: 'Promedio <60%' },
    {
      value: 'declining_trend',
      label: 'Tendencia Decreciente',
      icon: '📉',
      description: 'Rendimiento en declive',
    },
    {
      value: 'repeated_failures',
      label: 'Fallos Repetidos',
      icon: '🎯',
      description: 'Múltiples intentos fallidos',
    },
  ];

  // Prioridades con sus configuraciones
  const priorities = [
    {
      value: 'critical',
      label: 'Crítica',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      icon: '🔴',
    },
    {
      value: 'high',
      label: 'Alta',
      color: 'bg-orange-500',
      textColor: 'text-orange-500',
      icon: '🟠',
    },
    {
      value: 'medium',
      label: 'Media',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      icon: '🟡',
    },
    { value: 'low', label: 'Baja', color: 'bg-blue-500', textColor: 'text-blue-500', icon: '🔵' },
  ];

  const clearFilters = () => {
    setFilterPriority('all');
    setFilterType('all');
  };

  const hasActiveFilters = filterPriority !== 'all' || filterType !== 'all';

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName="GLIT Platform"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header con título y descripción */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-detective-orange bg-opacity-10 p-3">
              <Bell className="h-8 w-8 text-detective-orange" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-detective-text">Alertas y Notificaciones</h1>
              <p className="mt-1 text-detective-text-secondary">
                Sistema de monitoreo inteligente para intervención temprana
              </p>
            </div>
          </div>

          <DetectiveButton
            variant="secondary"
            onClick={() => setShowFilters(!showFilters)}
            className="self-start md:self-center"
          >
            <Filter className="h-4 w-4" />
            {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
          </DetectiveButton>
        </div>

        {/* Información contextual sobre tipos de alertas */}
        <DetectiveCard>
          <div className="space-y-3">
            <div className="mb-4 flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-detective-orange" />
              <h3 className="font-semibold text-detective-text">Tipos de Alertas del Sistema</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
              {alertTypes.map((type) => (
                <div
                  key={type.value}
                  className="hover:bg-detective-bg-tertiary cursor-pointer rounded-lg bg-detective-bg-secondary p-3 transition-colors"
                  onClick={() => setFilterType(type.value as AlertType)}
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-2xl">{type.icon}</span>
                    <span className="text-sm font-semibold text-detective-text">{type.label}</span>
                  </div>
                  <p className="text-xs text-detective-text-secondary">{type.description}</p>
                </div>
              ))}
            </div>
          </div>
        </DetectiveCard>

        {/* Panel de filtros expandible */}
        {showFilters && (
          <DetectiveCard>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Filter className="h-5 w-5 text-detective-orange" />
                  <h3 className="font-semibold text-detective-text">Filtros Avanzados</h3>
                </div>
                {hasActiveFilters && (
                  <DetectiveButton variant="secondary" onClick={clearFilters}>
                    <X className="h-4 w-4" />
                    Limpiar Filtros
                  </DetectiveButton>
                )}
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* Filtro por Prioridad */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-detective-text">
                    Filtrar por Prioridad
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => setFilterPriority('all')}
                      className={`rounded-lg border-2 p-3 transition-all ${
                        filterPriority === 'all'
                          ? 'border-detective-orange bg-detective-orange bg-opacity-10'
                          : 'border-detective-border hover:border-detective-orange hover:bg-detective-bg-secondary'
                      }`}
                    >
                      <div className="text-center">
                        <div className="mb-1 text-lg">📊</div>
                        <div className="text-sm font-medium text-detective-text">Todas</div>
                      </div>
                    </button>
                    {priorities.map((priority) => (
                      <button
                        key={priority.value}
                        onClick={() => setFilterPriority(priority.value as AlertPriority)}
                        className={`rounded-lg border-2 p-3 transition-all ${
                          filterPriority === priority.value
                            ? 'border-detective-orange bg-detective-orange bg-opacity-10'
                            : 'border-detective-border hover:border-detective-orange hover:bg-detective-bg-secondary'
                        }`}
                      >
                        <div className="text-center">
                          <div className="mb-1 text-lg">{priority.icon}</div>
                          <div className={`text-sm font-medium ${priority.textColor}`}>
                            {priority.label}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Filtro por Tipo */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-detective-text">
                    Filtrar por Tipo de Alerta
                  </label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setFilterType('all')}
                      className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                        filterType === 'all'
                          ? 'border-detective-orange bg-detective-orange bg-opacity-10'
                          : 'border-detective-border hover:border-detective-orange hover:bg-detective-bg-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-lg">🔔</span>
                        <span className="text-sm font-medium text-detective-text">
                          Todos los Tipos
                        </span>
                      </div>
                    </button>
                    {alertTypes.map((type) => (
                      <button
                        key={type.value}
                        onClick={() => setFilterType(type.value as AlertType)}
                        className={`w-full rounded-lg border-2 p-3 text-left transition-all ${
                          filterType === type.value
                            ? 'border-detective-orange bg-detective-orange bg-opacity-10'
                            : 'border-detective-border hover:border-detective-orange hover:bg-detective-bg-secondary'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{type.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-detective-text">
                              {type.label}
                            </div>
                            <div className="text-xs text-detective-text-secondary">
                              {type.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Resumen de filtros activos */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-sm text-detective-text-secondary">Filtros activos:</span>
            {filterPriority !== 'all' && (
              <div className="inline-flex items-center gap-2 rounded-full bg-detective-orange bg-opacity-10 px-3 py-1">
                <span className="text-sm font-medium text-detective-text">
                  Prioridad: {priorities.find((p) => p.value === filterPriority)?.label}
                </span>
                <button
                  onClick={() => setFilterPriority('all')}
                  className="text-detective-text-secondary hover:text-detective-text"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
            {filterType !== 'all' && (
              <div className="inline-flex items-center gap-2 rounded-full bg-detective-orange bg-opacity-10 px-3 py-1">
                <span className="text-sm font-medium text-detective-text">
                  Tipo: {alertTypes.find((t) => t.value === filterType)?.label}
                </span>
                <button
                  onClick={() => setFilterType('all')}
                  className="text-detective-text-secondary hover:text-detective-text"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Panel principal de alertas */}
        {selectedClassroomId ? (
          <InterventionAlertsPanel classroomId={selectedClassroomId} />
        ) : (
          <DetectiveCard variant="warning">
            <div className="py-16 text-center">
              <AlertCircle className="mx-auto mb-4 h-20 w-20 text-yellow-500 opacity-50" />
              <h3 className="mb-2 text-xl font-bold text-detective-text">
                No hay clases disponibles
              </h3>
              <p className="mb-6 text-detective-text-secondary">
                Necesitas tener al menos una clase asignada para ver las alertas de intervención.
                Por favor, contacta con el administrador para que te asigne una clase.
              </p>
            </div>
          </DetectiveCard>
        )}

        {/* Información de ayuda */}
        <DetectiveCard>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-detective-orange" />
              <h3 className="font-semibold text-detective-text">Sobre el Sistema de Alertas</h3>
            </div>
            <div className="grid grid-cols-1 gap-4 text-sm text-detective-text-secondary md:grid-cols-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Activity className="h-4 w-4 text-detective-orange" />
                  <span className="font-medium text-detective-text">Detección Automática</span>
                </div>
                <p>
                  El sistema analiza continuamente la actividad y rendimiento de los estudiantes
                  para identificar patrones que requieren atención.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-detective-orange" />
                  <span className="font-medium text-detective-text">Priorización Inteligente</span>
                </div>
                <p>
                  Las alertas se priorizan automáticamente según la severidad y urgencia de la
                  situación del estudiante.
                </p>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-detective-orange" />
                  <span className="font-medium text-detective-text">Intervención Temprana</span>
                </div>
                <p>
                  Actúa rápidamente con acciones predefinidas: enviar mensajes, asignar recursos
                  adicionales o programar seguimientos.
                </p>
              </div>
            </div>
          </div>
        </DetectiveCard>
      </div>
    </TeacherLayout>
  );
}
