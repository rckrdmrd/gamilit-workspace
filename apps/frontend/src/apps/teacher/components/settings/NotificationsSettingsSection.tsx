import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { TrendingUp, ClipboardCheck, MessageSquare } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton, type SaveStatus } from '@shared/components/feedback/SaveButton';

interface NotificationsState {
  studentRiskAlerts: boolean;
  inactivityAlerts: boolean;
  performanceDropAlerts: boolean;
  newSubmissions: boolean;
  gradingReminders: boolean;
  dueDateReminders: boolean;
  studentMessages: boolean;
  parentMessages: boolean;
  adminAnnouncements: boolean;
  emailNotifications: boolean;
  pushNotifications: boolean;
  inAppNotifications: boolean;
}

interface NotificationsSettingsSectionProps {
  notifications: NotificationsState;
  setNotifications: React.Dispatch<React.SetStateAction<NotificationsState>>;
  saveStatus: SaveStatus;
  handleSave: () => void;
  navigate: (path: string) => void;
}

export function NotificationsSettingsSection({
  notifications,
  setNotifications,
  saveStatus,
  handleSave,
  navigate,
}: NotificationsSettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 text-2xl font-bold text-detective-text">
          Preferencias de Notificaciones
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-8">
          {/* Student Risk Alerts */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <TrendingUp className="h-5 w-5" />
              Alertas de Estudiantes en Riesgo
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'studentRiskAlerts',
                  label: 'Alertas de Riesgo',
                  description:
                    'Notificaciones cuando un estudiante muestre signos de riesgo académico',
                },
                {
                  key: 'inactivityAlerts',
                  label: 'Alertas de Inactividad',
                  description:
                    'Avisos cuando un estudiante no ha estado activo recientemente',
                },
                {
                  key: 'performanceDropAlerts',
                  label: 'Caída en el Rendimiento',
                  description:
                    'Alertas cuando el rendimiento de un estudiante disminuya significativamente',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-detective-text">{item.label}</p>
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications] as boolean
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </label>
              ))}
            </div>
          </div>

          <hr className="border-detective-bg" />

          {/* Assignment & Submissions */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <ClipboardCheck className="h-5 w-5" />
              Tareas y Entregas
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'newSubmissions',
                  label: 'Nuevas Entregas',
                  description: 'Notificaciones de tareas recién entregadas',
                },
                {
                  key: 'gradingReminders',
                  label: 'Recordatorios de Calificación',
                  description: 'Recordatorios de tareas pendientes de calificar',
                },
                {
                  key: 'dueDateReminders',
                  label: 'Recordatorios de Fechas Límite',
                  description: 'Avisos antes de las fechas límite de asignaciones',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-detective-text">{item.label}</p>
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications] as boolean
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </label>
              ))}
            </div>
          </div>

          <hr className="border-detective-bg" />

          {/* Communication */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <MessageSquare className="h-5 w-5" />
              Comunicación
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'studentMessages',
                  label: 'Mensajes de Estudiantes',
                  description: 'Notificaciones de mensajes de estudiantes',
                },
                {
                  key: 'parentMessages',
                  label: 'Mensajes de Padres',
                  description: 'Notificaciones de mensajes de padres/tutores',
                },
                {
                  key: 'adminAnnouncements',
                  label: 'Anuncios Administrativos',
                  description: 'Avisos importantes del administrador',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-detective-text">{item.label}</p>
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications] as boolean
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </label>
              ))}
            </div>
          </div>

          <hr className="border-detective-bg" />

          {/* Delivery Methods */}
          <div>
            <h3 className="mb-4 text-lg font-bold text-detective-text">
              Métodos de Entrega
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'emailNotifications',
                  label: 'Notificaciones por Email',
                  description: 'Recibir notificaciones en tu correo electrónico',
                },
                {
                  key: 'pushNotifications',
                  label: 'Notificaciones Push',
                  description: 'Notificaciones en tiempo real en tu dispositivo',
                },
                {
                  key: 'inAppNotifications',
                  label: 'Notificaciones en la App',
                  description: 'Ver notificaciones dentro de la plataforma',
                },
              ].map((item) => (
                <label
                  key={item.key}
                  className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4"
                >
                  <div className="flex-1">
                    <p className="font-medium text-detective-text">{item.label}</p>
                    <p className="mt-1 text-sm text-detective-text-secondary">
                      {item.description}
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    checked={
                      notifications[item.key as keyof typeof notifications] as boolean
                    }
                    onChange={(e) =>
                      setNotifications({
                        ...notifications,
                        [item.key]: e.target.checked,
                      })
                    }
                    className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                  />
                </label>
              ))}
            </div>
          </div>

          {/* Advanced Settings Link */}
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-blue-800">
              Configuración Avanzada de Notificaciones
            </h4>
            <p className="mb-3 text-xs text-blue-700">
              Gestiona preferencias detalladas para cada tipo de notificación y
              dispositivos
            </p>
            <button
              onClick={() => navigate('/teacher/settings/notifications')}
              className="rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              Ir a Preferencias de Notificaciones
            </button>
          </div>

          {/* Intervention Alerts Configuration Link */}
          <div className="rounded-lg border border-orange-200 bg-orange-50 p-4">
            <h4 className="mb-2 text-sm font-bold text-orange-800">
              Configuración de Alertas de Intervención
            </h4>
            <p className="mb-3 text-xs text-orange-700">
              Personaliza los umbrales y criterios para las alertas automáticas de
              estudiantes en riesgo
            </p>
            <Link
              to="/teacher/settings/alerts"
              className="inline-block rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-orange-dark"
            >
              Configurar Alertas de Intervención
            </Link>
          </div>

          <SaveButton status={saveStatus} onClick={handleSave} idleLabel="Guardar Notificaciones" />
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
