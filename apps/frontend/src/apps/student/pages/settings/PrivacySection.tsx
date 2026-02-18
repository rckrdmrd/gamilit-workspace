/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { profileAPI } from '@/services/api/profileAPI';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ToggleSwitch } from './ToggleSwitch';
import { SaveButton, type SaveStatus } from './SaveButton';
import type { User } from '@/shared/types/auth.types';

interface PrivacySectionProps {
  user: User;
}

export const PrivacySection: React.FC<PrivacySectionProps> = ({ user }) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowFriendRequests: true,
    showActivity: true,
  });

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await profileAPI.updatePreferences(user.id, {
        privacy: {
          profileVisibility: privacy.profileVisibility,
          showOnlineStatus: privacy.showOnlineStatus,
          allowFriendRequests: privacy.allowFriendRequests,
          showActivity: privacy.showActivity,
        },
      } as any);
      setSaveStatus('saved');
      toast.success('Configuracion de privacidad guardada');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      setSaveStatus('error');
      const msg =
        error instanceof Error
          ? ((error as any).response?.data?.message || error.message)
          : 'Error al guardar configuracion';
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
          <Shield className="h-6 w-6 text-detective-orange" />
          Privacidad
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-8">
          {/* Profile Visibility */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Visibilidad del perfil
            </label>
            <select
              value={privacy.profileVisibility}
              onChange={(e) => setPrivacy({ ...privacy, profileVisibility: e.target.value })}
              className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
            >
              <option value="public">Publico (Todos)</option>
              <option value="friends">Solo amigos</option>
              <option value="private">Privado</option>
            </select>
          </div>

          {/* Privacy Toggles */}
          <div className="space-y-3">
            <ToggleSwitch
              checked={privacy.showOnlineStatus}
              onChange={(val) => setPrivacy({ ...privacy, showOnlineStatus: val })}
              label="Mostrar estado en linea"
              description="Tus amigos pueden ver cuando estas conectado"
            />
            <ToggleSwitch
              checked={privacy.allowFriendRequests}
              onChange={(val) => setPrivacy({ ...privacy, allowFriendRequests: val })}
              label="Permitir solicitudes de amistad"
              description="Cualquiera puede enviarte solicitudes de amistad"
            />
            <ToggleSwitch
              checked={privacy.showActivity}
              onChange={(val) => setPrivacy({ ...privacy, showActivity: val })}
              label="Mostrar actividad reciente"
              description="Tus amigos pueden ver tus actividades recientes"
            />
          </div>

          <SaveButton
            status={saveStatus}
            onClick={handleSave}
            idleLabel="Guardar Privacidad"
            idleIcon={<Shield className="h-4 w-4" />}
          />
        </div>
      </DetectiveCard>
    </motion.div>
  );
};
