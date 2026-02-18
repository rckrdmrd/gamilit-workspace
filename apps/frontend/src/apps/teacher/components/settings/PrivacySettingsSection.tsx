import React from 'react';
import { motion } from 'framer-motion';
import { Shield, AlertCircle } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton } from './SaveButton';

interface PrivacyState {
  profileVisibility: string;
  showContactInfo: boolean;
  allowStudentContact: boolean;
  allowParentContact: boolean;
  showActivity: boolean;
}

interface PrivacySettingsSectionProps {
  privacy: PrivacyState;
  setPrivacy: React.Dispatch<React.SetStateAction<PrivacyState>>;
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  handleSave: () => void;
}

export function PrivacySettingsSection({
  privacy,
  setPrivacy,
  saveStatus,
  handleSave,
}: PrivacySettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 text-2xl font-bold text-detective-text">
          Configuración de Privacidad
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-8">
          {/* Profile Visibility */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Visibilidad del Perfil
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) =>
                setPrivacy({ ...privacy, profileVisibility: e.target.value })
              }
              className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4
                py-3 transition-all duration-200 focus:border-detective-orange
                focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
            >
              <option value="public">Público (Todos)</option>
              <option value="school">Escuela (Solo mi institución)</option>
              <option value="private">Privado (Solo yo)</option>
            </select>
            <p className="mt-1 text-xs text-detective-text-secondary">
              Controla quién puede ver tu perfil y actividad
            </p>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3">
            <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
              <div className="flex-1">
                <p className="font-medium text-detective-text">
                  Mostrar Información de Contacto
                </p>
                <p className="mt-1 text-sm text-detective-text-secondary">
                  Tu email será visible para estudiantes y padres
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showContactInfo}
                onChange={(e) =>
                  setPrivacy({ ...privacy, showContactInfo: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
              <div className="flex-1">
                <p className="font-medium text-detective-text">
                  Permitir Contacto de Estudiantes
                </p>
                <p className="mt-1 text-sm text-detective-text-secondary">
                  Los estudiantes pueden enviarte mensajes directos
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowStudentContact}
                onChange={(e) =>
                  setPrivacy({ ...privacy, allowStudentContact: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
              <div className="flex-1">
                <p className="font-medium text-detective-text">
                  Permitir Contacto de Padres
                </p>
                <p className="mt-1 text-sm text-detective-text-secondary">
                  Los padres/tutores pueden contactarte
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.allowParentContact}
                onChange={(e) =>
                  setPrivacy({ ...privacy, allowParentContact: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
              />
            </label>

            <label className="flex cursor-pointer items-start justify-between rounded-lg bg-detective-bg p-4">
              <div className="flex-1">
                <p className="font-medium text-detective-text">Mostrar Actividad</p>
                <p className="mt-1 text-sm text-detective-text-secondary">
                  Mostrar tu actividad reciente a otros profesores
                </p>
              </div>
              <input
                type="checkbox"
                checked={privacy.showActivity}
                onChange={(e) =>
                  setPrivacy({ ...privacy, showActivity: e.target.checked })
                }
                className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
              />
            </label>
          </div>

          {/* Privacy Notice */}
          <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
            <div>
              <p className="text-sm font-medium text-blue-800">
                Protección de Datos y Privacidad
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Tu información personal está protegida según las políticas de privacidad
                de la institución. Los estudiantes y padres solo verán la información que
                permitas explícitamente.
              </p>
            </div>
          </div>

          <SaveButton
            saveStatus={saveStatus}
            onClick={handleSave}
            label="Guardar Privacidad"
            icon={<Shield className="h-4 w-4" />}
          />
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
