import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Smartphone, Trophy, BookOpen, Flame } from 'lucide-react';
import toast from 'react-hot-toast';
import {
  notificationsAPI,
  type NotificationPreference,
} from '@/services/api/notificationsAPI';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ToggleSwitch } from './ToggleSwitch';
import { SaveButton, type SaveStatus } from '@shared/components/feedback/SaveButton';

/**
 * Notification toggles mapped to backend notification types.
 *
 * The backend `notificationsAPI.updateMultiplePreferences` expects:
 *   { preferences: [{ notificationType, inAppEnabled, emailEnabled, pushEnabled }] }
 *
 * We expose 5 user-friendly toggles and map them to the relevant type+channel.
 */

interface NotifToggle {
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  /** Backend notification type for channel-level preference */
  backendType?: string;
  /** Which channel this toggle controls */
  channel: 'email' | 'push' | 'in_app_email';
}

const TOGGLES: NotifToggle[] = [
  {
    key: 'emailGlobal',
    label: 'Notificaciones por correo',
    description: 'Recibir notificaciones generales por email',
    icon: <Mail className="h-4 w-4 text-detective-orange" />,
    channel: 'email',
  },
  {
    key: 'pushGlobal',
    label: 'Notificaciones push del navegador',
    description: 'Recibir alertas push en tu navegador',
    icon: <Smartphone className="h-4 w-4 text-detective-orange" />,
    channel: 'push',
  },
  {
    key: 'achievements',
    label: 'Alertas de logros',
    description: 'Avisos cuando desbloqueas logros o subes de rango',
    icon: <Trophy className="h-4 w-4 text-detective-orange" />,
    backendType: 'achievement_unlocked',
    channel: 'in_app_email',
  },
  {
    key: 'assignments',
    label: 'Nuevas tareas asignadas',
    description: 'Avisos cuando tu maestro te asigna una nueva tarea',
    icon: <BookOpen className="h-4 w-4 text-detective-orange" />,
    backendType: 'assignment_created',
    channel: 'in_app_email',
  },
  {
    key: 'streaks',
    label: 'Misiones y rachas',
    description: 'Recordatorios de rachas diarias y misiones activas',
    icon: <Flame className="h-4 w-4 text-detective-orange" />,
    backendType: 'mission_completed',
    channel: 'in_app_email',
  },
];

export const NotificationsSection: React.FC = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [toggles, setToggles] = useState<Record<string, boolean>>({
    emailGlobal: true,
    pushGlobal: false,
    achievements: true,
    assignments: true,
    streaks: true,
  });

  // Load notification preferences from real API
  useEffect(() => {
    const load = async () => {
      try {
        const res = await notificationsAPI.getPreferences();
        const prefs = res.preferences;
        if (prefs.length > 0) {
          // Derive toggle state from backend preferences
          const map = new Map<string, NotificationPreference>();
          prefs.forEach((p) => map.set(p.notificationType, p));

          // Global email: true if any preference has emailEnabled
          const anyEmail = prefs.some((p) => p.emailEnabled);
          const anyPush = prefs.some((p) => p.pushEnabled);

          setToggles({
            emailGlobal: prefs.length === 0 ? true : anyEmail,
            pushGlobal: anyPush,
            achievements: map.get('achievement_unlocked')?.inAppEnabled ?? true,
            assignments: map.get('assignment_created')?.inAppEnabled ?? true,
            streaks: map.get('mission_completed')?.inAppEnabled ?? true,
          });
        }
      } catch {
        // Keep defaults on error — backend returns defaults when no prefs configured
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleToggle = (key: string, value: boolean) => {
    setToggles((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Build batch update from current toggle state
      const preferences = [
        {
          notificationType: 'achievement_unlocked',
          inAppEnabled: toggles.achievements,
          emailEnabled: toggles.emailGlobal && toggles.achievements,
          pushEnabled: toggles.pushGlobal,
        },
        {
          notificationType: 'assignment_created',
          inAppEnabled: toggles.assignments,
          emailEnabled: toggles.emailGlobal && toggles.assignments,
          pushEnabled: toggles.pushGlobal,
        },
        {
          notificationType: 'mission_completed',
          inAppEnabled: toggles.streaks,
          emailEnabled: toggles.emailGlobal && toggles.streaks,
          pushEnabled: toggles.pushGlobal,
        },
        {
          notificationType: 'friend_request',
          emailEnabled: toggles.emailGlobal,
          pushEnabled: toggles.pushGlobal,
          inAppEnabled: true,
        },
        {
          notificationType: 'system_announcement',
          emailEnabled: toggles.emailGlobal,
          pushEnabled: toggles.pushGlobal,
          inAppEnabled: true,
        },
      ];

      await notificationsAPI.updateMultiplePreferences({ preferences });
      setSaveStatus('saved');
      toast.success('Preferencias de notificaciones guardadas');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      setSaveStatus('error');
      const msg =
        error instanceof Error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message)
          : 'Error al guardar preferencias';
      toast.error(msg);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 flex items-center gap-2 text-2xl font-bold text-detective-text">
          <Bell className="h-6 w-6 text-detective-orange" />
          Notificaciones
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-detective-orange border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-8">
            <div className="space-y-3">
              {TOGGLES.map((t) => (
                <div key={t.key} className="flex items-center gap-3">
                  <div className="flex-shrink-0">{t.icon}</div>
                  <div className="flex-1">
                    <ToggleSwitch
                      checked={toggles[t.key]}
                      onChange={(val) => handleToggle(t.key, val)}
                      label={t.label}
                      description={t.description}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Info note */}
            <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
              <p className="text-xs text-orange-700">
                Las notificaciones por correo se envian a tu email registrado.
                Las notificaciones push funcionan en navegadores compatibles.
              </p>
            </div>

            <SaveButton
              status={saveStatus}
              onClick={handleSave}
              idleLabel="Guardar Notificaciones"
              idleIcon={<Bell className="h-4 w-4" />}
            />
          </div>
        )}
      </DetectiveCard>
    </motion.div>
  );
};
