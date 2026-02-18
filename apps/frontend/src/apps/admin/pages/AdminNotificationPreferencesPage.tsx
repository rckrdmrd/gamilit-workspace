/**
 * AdminNotificationPreferencesPage - Preferencias de Notificaciones para Admin
 *
 * Features:
 * - Configuracion de preferencias por tipo de notificacion
 * - Toggle para canales: In-App, Email, Push
 * - Gestion de dispositivos para Push Notifications
 *
 * Route: /admin/settings/notifications
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Bell,
  ArrowLeft,
  Smartphone,
  Mail,
  MonitorSmartphone,
  Loader2,
  Trash2,
} from 'lucide-react';

// Layout
import { AdminPageShell } from '../components/shared';

// Store & Hooks
import { useNotificationsStore } from '@/features/notifications/store/notificationsStore';
import { usePushNotifications } from '@/features/notifications/hooks/usePushNotifications';

// Utils
import { cn } from '@shared/utils/cn';

// Notification types for admin
const notificationTypes = [
  { key: 'system_announcement', label: 'Anuncios del Sistema', description: 'Comunicaciones oficiales' },
  { key: 'security_alert', label: 'Alertas de Seguridad', description: 'Incidentes y amenazas de seguridad' },
  { key: 'user_activity', label: 'Actividad de Usuarios', description: 'Registros y actividad de usuarios' },
  { key: 'institution_update', label: 'Instituciones', description: 'Cambios en instituciones' },
  { key: 'system_health', label: 'Estado del Sistema', description: 'Metricas y alertas de salud' },
  { key: 'database_alert', label: 'Base de Datos', description: 'Alertas de base de datos' },
];

export default function AdminNotificationPreferencesPage() {
  const {
    preferences,
    devices,
    preferencesLoading,
    devicesLoading,
    fetchPreferences,
    fetchDevices,
    updatePreference,
    deleteDevice,
  } = useNotificationsStore();

  // Push notifications hook
  const {
    isSupported: pushSupported,
    isSubscribedToPush: pushEnabled,
    enablePushNotifications: enablePush,
    disablePushNotifications: disablePush,
  } = usePushNotifications();

  // Local state (aligned with API field names)
  const [localPreferences, setLocalPreferences] = useState<Record<string, { inAppEnabled: boolean; emailEnabled: boolean; pushEnabled: boolean }>>({});
  const [savingType, setSavingType] = useState<string | null>(null);

  // Fetch data on mount
  useEffect(() => {
    fetchPreferences();
    fetchDevices();
  }, [fetchPreferences, fetchDevices]);

  // Initialize local preferences from store
  useEffect(() => {
    const prefs: Record<string, { inAppEnabled: boolean; emailEnabled: boolean; pushEnabled: boolean }> = {};
    preferences.forEach((pref) => {
      prefs[pref.notificationType] = {
        inAppEnabled: pref.inAppEnabled,
        emailEnabled: pref.emailEnabled,
        pushEnabled: pref.pushEnabled,
      };
    });
    setLocalPreferences(prefs);
  }, [preferences]);

  // Handle preference toggle
  const handleToggle = async (type: string, channel: 'inAppEnabled' | 'emailEnabled' | 'pushEnabled') => {
    const current = localPreferences[type] || { inAppEnabled: true, emailEnabled: true, pushEnabled: false };
    const newValue = !current[channel];

    setLocalPreferences((prev) => ({
      ...prev,
      [type]: { ...current, [channel]: newValue },
    }));

    setSavingType(type);
    try {
      await updatePreference(type, { [channel]: newValue });
    } catch (_error) {
      setLocalPreferences((prev) => ({
        ...prev,
        [type]: current,
      }));
    } finally {
      setSavingType(null);
    }
  };

  // Handle push notification toggle
  const handlePushToggle = async () => {
    if (pushEnabled) {
      await disablePush();
    } else {
      await enablePush();
    }
  };

  // Get preference value
  const getPreference = (type: string, channel: 'inAppEnabled' | 'emailEnabled' | 'pushEnabled') => {
    return localPreferences[type]?.[channel] ?? (channel === 'pushEnabled' ? false : true);
  };

  return (
    <AdminPageShell>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link
            to="/admin/notifications"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 shadow-lg">
              <Bell className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Preferencias de Notificaciones</h1>
              <p className="text-gray-400">Configura como recibir notificaciones</p>
            </div>
          </div>
        </div>

        {/* Push Notifications Status */}
        {pushSupported && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/5 border border-white/10"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/20">
                  <Smartphone className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="font-medium text-white">Notificaciones Push</h3>
                  <p className="text-sm text-gray-400">
                    {pushEnabled ? 'Activadas en este dispositivo' : 'Desactivadas'}
                  </p>
                </div>
              </div>
              <button
                onClick={handlePushToggle}
                className={cn(
                  'px-4 py-2 rounded-lg font-medium transition-colors',
                  pushEnabled
                    ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
                    : 'bg-purple-500 text-white hover:bg-purple-600',
                )}
              >
                {pushEnabled ? 'Desactivar' : 'Activar'}
              </button>
            </div>
          </motion.div>
        )}

        {/* Preferences Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-xl bg-white/5 border border-white/10 overflow-hidden"
        >
          <div className="grid grid-cols-4 gap-4 p-4 border-b border-white/10 bg-white/5">
            <div className="text-sm font-medium text-gray-400">Tipo de Notificacion</div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400">
                <MonitorSmartphone className="w-4 h-4" />
                In-App
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400">
                <Mail className="w-4 h-4" />
                Email
              </div>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-sm font-medium text-gray-400">
                <Smartphone className="w-4 h-4" />
                Push
              </div>
            </div>
          </div>

          <div className="divide-y divide-white/10">
            {preferencesLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-6 h-6 text-purple-500 animate-spin" />
              </div>
            ) : (
              notificationTypes.map((type) => (
                <div
                  key={type.key}
                  className="grid grid-cols-4 gap-4 p-4 hover:bg-white/5 transition-colors"
                >
                  <div>
                    <div className="font-medium text-white">{type.label}</div>
                    <div className="text-sm text-gray-400">{type.description}</div>
                  </div>

                  {(['inAppEnabled', 'emailEnabled', 'pushEnabled'] as const).map((channel) => (
                    <div key={channel} className="flex items-center justify-center">
                      <button
                        onClick={() => handleToggle(type.key, channel)}
                        disabled={savingType === type.key || (channel === 'pushEnabled' && !pushEnabled)}
                        className={cn(
                          'w-12 h-6 rounded-full transition-colors relative',
                          getPreference(type.key, channel) ? 'bg-purple-500' : 'bg-gray-600',
                          (savingType === type.key || (channel === 'pushEnabled' && !pushEnabled)) && 'opacity-50',
                        )}
                      >
                        <motion.div
                          animate={{ x: getPreference(type.key, channel) ? 24 : 2 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow"
                        />
                      </button>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Registered Devices */}
        {devices.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-xl bg-white/5 border border-white/10 p-4 space-y-4"
          >
            <h3 className="text-lg font-medium text-white flex items-center gap-2">
              <Smartphone className="w-5 h-5" />
              Dispositivos Registrados
            </h3>

            <div className="space-y-2">
              {devicesLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-5 h-5 text-purple-500 animate-spin" />
                </div>
              ) : (
                devices.map((device) => (
                  <div
                    key={device.id}
                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <Smartphone className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium text-white">
                          {device.deviceName || device.deviceType}
                        </div>
                        <div className="text-sm text-gray-400">
                          {device.deviceType} - Ultimo uso: {device.lastUsedAt ? new Date(device.lastUsedAt).toLocaleDateString('es-MX') : 'N/A'}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteDevice(device.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 transition-colors group"
                    >
                      <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </div>
    </AdminPageShell>
  );
}
