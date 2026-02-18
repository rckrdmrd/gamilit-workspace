import React from 'react';
import { motion } from 'framer-motion';
import { Bell, ClipboardCheck, MessageSquare } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton } from './SaveButton';

interface TeachingPreferencesState {
  newSubmissions: boolean;
  lateSubmissions: boolean;
  studentQuestions: boolean;
  classroomActivity: boolean;
  defaultGradingScale: string;
  autoReturnGraded: boolean;
  allowLateSubmissions: boolean;
  lateSubmissionPenalty: number;
  allowStudentMessages: boolean;
  allowParentMessages: boolean;
  autoResponseEnabled: boolean;
  preferredContactMethod: string;
}

interface TeachingPreferencesSectionProps {
  teachingPreferences: TeachingPreferencesState;
  setTeachingPreferences: React.Dispatch<React.SetStateAction<TeachingPreferencesState>>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  handleSave: () => void;
}

export function TeachingPreferencesSection({
  teachingPreferences,
  setTeachingPreferences,
  saveStatus,
  handleSave,
}: TeachingPreferencesSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 text-2xl font-bold text-detective-text">
          Preferencias de Enseñanza
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-8">
          {/* Classroom Notifications */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <Bell className="h-5 w-5" />
              Notificaciones de Aula
            </h3>
            <div className="space-y-3">
              {[
                {
                  key: 'newSubmissions',
                  label: 'Nuevas Entregas',
                  description: 'Notificarme cuando un estudiante entregue una tarea',
                },
                {
                  key: 'lateSubmissions',
                  label: 'Entregas Tardías',
                  description: 'Alertas de tareas entregadas después de la fecha límite',
                },
                {
                  key: 'studentQuestions',
                  label: 'Preguntas de Estudiantes',
                  description:
                    'Notificarme cuando un estudiante haga una pregunta en una tarea',
                },
                {
                  key: 'classroomActivity',
                  label: 'Actividad del Aula',
                  description: 'Resumen diario de actividad en mis aulas',
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
                      teachingPreferences[
                        item.key as keyof typeof teachingPreferences
                      ] as boolean
                    }
                    onChange={(e) =>
                      setTeachingPreferences({
                        ...teachingPreferences,
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

          {/* Grading Defaults */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <ClipboardCheck className="h-5 w-5" />
              Configuración de Calificación
            </h3>

            <div className="space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium text-detective-text">
                  Escala de Calificación Predeterminada
                </label>
                <select
                  value={teachingPreferences.defaultGradingScale}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      defaultGradingScale: e.target.value,
                    })
                  }
                  className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4
                    py-3 transition-all duration-200 focus:border-detective-orange
                    focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                >
                  <option value="100">0-100 (Puntos)</option>
                  <option value="letter">A-F (Letras)</option>
                  <option value="pass-fail">Aprobado/Desaprobado</option>
                </select>
              </div>

              <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
                <div className="flex-1">
                  <p className="font-medium text-detective-text">
                    Devolver Tareas Calificadas Automáticamente
                  </p>
                  <p className="mt-1 text-sm text-detective-text-secondary">
                    Las tareas se devolverán a los estudiantes automáticamente al
                    calificarlas
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={teachingPreferences.autoReturnGraded}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      autoReturnGraded: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
                <div className="flex-1">
                  <p className="font-medium text-detective-text">
                    Permitir Entregas Tardías
                  </p>
                  <p className="mt-1 text-sm text-detective-text-secondary">
                    Los estudiantes pueden entregar tareas después de la fecha límite
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={teachingPreferences.allowLateSubmissions}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      allowLateSubmissions: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </label>

              {teachingPreferences.allowLateSubmissions && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <label className="mb-2 block text-sm font-medium text-detective-text">
                    Penalización por Entrega Tardía (%)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={teachingPreferences.lateSubmissionPenalty}
                    onChange={(e) =>
                      setTeachingPreferences({
                        ...teachingPreferences,
                        lateSubmissionPenalty: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                      transition-all duration-200 focus:border-detective-orange
                      focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                  />
                </motion.div>
              )}
            </div>
          </div>

          <hr className="border-detective-bg" />

          {/* Communication Preferences */}
          <div>
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-detective-text">
              <MessageSquare className="h-5 w-5" />
              Preferencias de Comunicación
            </h3>

            <div className="space-y-3">
              <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
                <div className="flex-1">
                  <p className="font-medium text-detective-text">
                    Permitir Mensajes de Estudiantes
                  </p>
                  <p className="mt-1 text-sm text-detective-text-secondary">
                    Los estudiantes pueden enviarte mensajes directos
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={teachingPreferences.allowStudentMessages}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      allowStudentMessages: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </label>

              <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
                <div className="flex-1">
                  <p className="font-medium text-detective-text">
                    Permitir Mensajes de Padres
                  </p>
                  <p className="mt-1 text-sm text-detective-text-secondary">
                    Los padres/tutores pueden contactarte
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={teachingPreferences.allowParentMessages}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      allowParentMessages: e.target.checked,
                    })
                  }
                  className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                />
              </label>

              <div>
                <label className="mb-2 block text-sm font-medium text-detective-text">
                  Método de Contacto Preferido
                </label>
                <select
                  value={teachingPreferences.preferredContactMethod}
                  onChange={(e) =>
                    setTeachingPreferences({
                      ...teachingPreferences,
                      preferredContactMethod: e.target.value,
                    })
                  }
                  className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4
                    py-3 transition-all duration-200 focus:border-detective-orange
                    focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                >
                  <option value="platform">Mensajería de la Plataforma</option>
                  <option value="email">Email</option>
                  <option value="both">Ambos</option>
                </select>
              </div>
            </div>
          </div>

          <SaveButton saveStatus={saveStatus} onClick={handleSave} label="Guardar Preferencias" />
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
