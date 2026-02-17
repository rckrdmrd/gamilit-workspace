/**
 * TeacherAlertConfigPage
 *
 * Page for managing teacher alert configurations.
 * Allows teachers to customize thresholds and notification preferences.
 *
 * @module TeacherAlertConfigPage
 * @since US-PM-007
 */

import { useState } from 'react';
import {
  Bell,
  Settings,
  AlertCircle,
  TrendingDown,
  Clock,
  XCircle,
  Activity,
  RefreshCw,
  Mail,
  Smartphone,
  Plus,
} from 'lucide-react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { TeacherLayout } from '../layouts/TeacherLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useAlertConfig, AlertConfigType } from '../hooks/useAlertConfig';
import type { AlertConfigResponse, AlertConfigDefaults } from '../hooks/useAlertConfig';
import { ThresholdUnit } from '../../../services/api/teacher/alertConfigApi';

// ============================================================================
// CONSTANTS
// ============================================================================

/**
 * Alert type icons
 */
const ALERT_ICONS: Record<AlertConfigType, React.ReactNode> = {
  [AlertConfigType.NO_ACTIVITY]: <Clock className="h-6 w-6" />,
  [AlertConfigType.LOW_SCORE]: <TrendingDown className="h-6 w-6" />,
  [AlertConfigType.DECLINING_TREND]: <Activity className="h-6 w-6" />,
  [AlertConfigType.REPEATED_FAILURES]: <XCircle className="h-6 w-6" />,
  [AlertConfigType.EXCESSIVE_TIME]: <Clock className="h-6 w-6" />,
  [AlertConfigType.LOW_ENGAGEMENT]: <AlertCircle className="h-6 w-6" />,
};

/**
 * Alert type colors
 */
const ALERT_COLORS: Record<AlertConfigType, string> = {
  [AlertConfigType.NO_ACTIVITY]: 'text-yellow-500',
  [AlertConfigType.LOW_SCORE]: 'text-red-500',
  [AlertConfigType.DECLINING_TREND]: 'text-orange-500',
  [AlertConfigType.REPEATED_FAILURES]: 'text-red-600',
  [AlertConfigType.EXCESSIVE_TIME]: 'text-blue-500',
  [AlertConfigType.LOW_ENGAGEMENT]: 'text-purple-500',
};

/**
 * Unit labels
 */
const UNIT_LABELS: Record<ThresholdUnit, string> = {
  [ThresholdUnit.PERCENTAGE]: '%',
  [ThresholdUnit.DAYS]: 'dias',
  [ThresholdUnit.COUNT]: 'veces',
  [ThresholdUnit.MINUTES]: 'min',
};

// ============================================================================
// COMPONENT
// ============================================================================

/**
 * Alert Configuration Page
 *
 * Features:
 * - Cards for each alert type
 * - Toggle enable/disable
 * - Threshold slider/input
 * - Notification preferences
 * - Initialize defaults button
 */
export function TeacherAlertConfigPage() {
  const {
    configurations,
    defaults,
    loading,
    saving,
    error,
    updateConfiguration,
    toggleEnabled,
    initializeDefaults,
    refresh,
  } = useAlertConfig();

  const { user, logout } = useAuth();
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Novato',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<number>(0);

  /**
   * Get configuration for a specific alert type
   */
  const getConfigForType = (alertType: AlertConfigType): AlertConfigResponse | undefined => {
    return configurations.find((c) => c.alert_type === alertType);
  };

  /**
   * Get default for a specific alert type
   */
  const getDefaultForType = (alertType: AlertConfigType): AlertConfigDefaults | undefined => {
    return defaults.find((d) => d.alert_type === alertType);
  };

  /**
   * Handle threshold save
   */
  const handleSaveThreshold = async (config: AlertConfigResponse) => {
    try {
      await updateConfiguration(config.id, { threshold_value: editValue });
      setEditingId(null);
    } catch {
      // Error handled by hook
    }
  };

  /**
   * Handle notification toggle
   */
  const handleNotificationToggle = async (
    config: AlertConfigResponse,
    type: 'email' | 'in_app',
  ) => {
    const update = type === 'email'
      ? { notify_email: !config.notify_email }
      : { notify_in_app: !config.notify_in_app };

    try {
      await updateConfiguration(config.id, update);
    } catch {
      // Error handled by hook
    }
  };

  /**
   * Render alert config card
   */
  const renderAlertCard = (alertType: AlertConfigType) => {
    const config = getConfigForType(alertType);
    const defaultConfig = getDefaultForType(alertType);

    if (!defaultConfig) return null;

    const isEnabled = config?.is_enabled ?? true;
    const thresholdValue = config?.threshold_value ?? defaultConfig.default_threshold_value;
    const thresholdUnit = config?.threshold_unit ?? defaultConfig.default_threshold_unit;
    const unitLabel = UNIT_LABELS[thresholdUnit];
    const isEditing = editingId === config?.id;

    return (
      <DetectiveCard key={alertType} className="relative">
        {/* Disabled overlay */}
        {config && !isEnabled && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50">
            <span className="rounded bg-gray-800 px-3 py-1 text-sm text-gray-400">
              Deshabilitado
            </span>
          </div>
        )}

        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={`rounded-lg bg-detective-bg-secondary p-2 ${ALERT_COLORS[alertType]}`}>
                {ALERT_ICONS[alertType]}
              </div>
              <div>
                <h3 className="font-semibold text-detective-text">{defaultConfig.label}</h3>
                <p className="text-sm text-detective-text-secondary">
                  {defaultConfig.description}
                </p>
              </div>
            </div>

            {/* Enable toggle */}
            {config && (
              <button
                onClick={() => toggleEnabled(config.id, !isEnabled)}
                disabled={saving}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  isEnabled ? 'bg-detective-orange' : 'bg-gray-600'
                } disabled:opacity-50`}
              >
                <span
                  className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-transform ${
                    isEnabled ? 'left-6' : 'left-1'
                  }`}
                />
              </button>
            )}
          </div>

          {/* Threshold */}
          {config && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-detective-text-secondary">
                Umbral
              </label>
              {isEditing ? (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    value={editValue}
                    onChange={(e) => setEditValue(Number(e.target.value))}
                    className="w-24 rounded border border-gray-700 bg-detective-bg px-3 py-1 text-detective-text focus:border-detective-orange focus:outline-none"
                    min={0}
                    max={thresholdUnit === ThresholdUnit.PERCENTAGE ? 100 : 999}
                  />
                  <span className="text-detective-text-secondary">{unitLabel}</span>
                  <DetectiveButton
                    variant="primary"
                    size="sm"
                    onClick={() => handleSaveThreshold(config)}
                    disabled={saving}
                  >
                    Guardar
                  </DetectiveButton>
                  <DetectiveButton
                    variant="secondary"
                    size="sm"
                    onClick={() => setEditingId(null)}
                  >
                    Cancelar
                  </DetectiveButton>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-detective-text">
                    {thresholdValue}
                  </span>
                  <span className="text-detective-text-secondary">{unitLabel}</span>
                  <button
                    onClick={() => {
                      setEditingId(config.id);
                      setEditValue(thresholdValue);
                    }}
                    className="ml-2 text-sm text-detective-orange hover:underline"
                  >
                    Editar
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          {config && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-detective-text-secondary">
                Notificaciones
              </label>
              <div className="flex gap-3">
                <button
                  onClick={() => handleNotificationToggle(config, 'in_app')}
                  disabled={saving}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    config.notify_in_app
                      ? 'bg-detective-orange/20 text-detective-orange'
                      : 'bg-gray-700 text-gray-400'
                  } disabled:opacity-50`}
                >
                  <Smartphone className="h-4 w-4" />
                  <span className="text-sm">En App</span>
                </button>
                <button
                  onClick={() => handleNotificationToggle(config, 'email')}
                  disabled={saving}
                  className={`flex items-center gap-2 rounded-lg px-3 py-2 transition-colors ${
                    config.notify_email
                      ? 'bg-detective-orange/20 text-detective-orange'
                      : 'bg-gray-700 text-gray-400'
                  } disabled:opacity-50`}
                >
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email</span>
                </button>
              </div>
            </div>
          )}

          {/* Not configured state */}
          {!config && (
            <div className="text-center text-detective-text-secondary">
              <p className="text-sm">No configurado</p>
              <p className="text-xs">
                Umbral por defecto: {defaultConfig.default_threshold_value}{' '}
                {UNIT_LABELS[defaultConfig.default_threshold_unit]}
              </p>
            </div>
          )}
        </div>
      </DetectiveCard>
    );
  };

  // Loading state
  if (loading && configurations.length === 0) {
    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName={user?.organization?.name || 'Mi Institucion'}
        onLogout={handleLogout}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-center">
            <RefreshCw className="mx-auto h-8 w-8 animate-spin text-detective-orange" />
            <p className="mt-4 text-detective-text-secondary">Cargando configuraciones...</p>
          </div>
        </div>
      </TeacherLayout>
    );
  }

  // Error state
  if (error && configurations.length === 0) {
    return (
      <TeacherLayout
        user={user ?? undefined}
        gamificationData={displayGamificationData}
        organizationName={user?.organization?.name || 'Mi Institucion'}
        onLogout={handleLogout}
      >
        <div className="flex min-h-[400px] items-center justify-center">
          <DetectiveCard className="max-w-md text-center">
            <AlertCircle className="mx-auto h-12 w-12 text-red-500" />
            <h3 className="mt-4 text-lg font-semibold text-detective-text">Error</h3>
            <p className="mt-2 text-detective-text-secondary">{error.message}</p>
            <DetectiveButton variant="primary" onClick={refresh} className="mt-4">
              Reintentar
            </DetectiveButton>
          </DetectiveCard>
        </div>
      </TeacherLayout>
    );
  }

  return (
    <TeacherLayout
      user={user ?? undefined}
      gamificationData={displayGamificationData}
      organizationName={user?.organization?.name || 'Mi Institucion'}
      onLogout={handleLogout}
    >
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-detective-orange/20 p-2">
            <Bell className="h-8 w-8 text-detective-orange" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-detective-text">
              Configuracion de Alertas
            </h1>
            <p className="text-detective-text-secondary">
              Personaliza cuando y como recibir alertas sobre tus estudiantes
            </p>
          </div>
        </div>

        <div className="flex gap-3">
          <DetectiveButton
            variant="secondary"
            onClick={refresh}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </DetectiveButton>

          {configurations.length === 0 && (
            <DetectiveButton
              variant="primary"
              onClick={() => initializeDefaults()}
              disabled={saving}
            >
              <Plus className="mr-2 h-4 w-4" />
              Inicializar Configuraciones
            </DetectiveButton>
          )}
        </div>
      </div>

      {/* Info card */}
      <DetectiveCard className="border-detective-orange/30 bg-detective-orange/10">
        <div className="flex items-start gap-3">
          <Settings className="mt-1 h-5 w-5 text-detective-orange" />
          <div>
            <p className="font-medium text-detective-text">
              Configuraciones de Alerta
            </p>
            <p className="mt-1 text-sm text-detective-text-secondary">
              Estas configuraciones determinan cuando el sistema genera alertas de
              intervencion para tus estudiantes. Ajusta los umbrales segun las
              necesidades de tu aula.
            </p>
          </div>
        </div>
      </DetectiveCard>

      {/* Alert type cards */}
      {configurations.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {Object.values(AlertConfigType).map((alertType) =>
            renderAlertCard(alertType),
          )}
        </div>
      ) : (
        <DetectiveCard className="text-center">
          <Bell className="mx-auto h-12 w-12 text-detective-text-secondary" />
          <h3 className="mt-4 text-lg font-semibold text-detective-text">
            Sin Configuraciones
          </h3>
          <p className="mt-2 text-detective-text-secondary">
            No tienes configuraciones de alertas. Haz clic en "Inicializar
            Configuraciones" para crear las configuraciones con valores por defecto.
          </p>
          <DetectiveButton
            variant="primary"
            onClick={() => initializeDefaults()}
            disabled={saving}
            className="mt-4"
          >
            <Plus className="mr-2 h-4 w-4" />
            Inicializar Configuraciones
          </DetectiveButton>
        </DetectiveCard>
      )}
    </div>
    </TeacherLayout>
  );
}
