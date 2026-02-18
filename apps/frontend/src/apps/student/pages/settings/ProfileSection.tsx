/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/features/auth/store/authStore';
import { profileAPI } from '@/services/api/profileAPI';
import { AvatarSelectionModal } from '@shared/components/profile/AvatarSelectionModal';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { SaveButton, type SaveStatus } from './SaveButton';
import type { User } from '@/shared/types/auth.types';

interface ProfileSectionProps {
  user: User;
}

export const ProfileSection: React.FC<ProfileSectionProps> = ({ user }) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [profile, setProfile] = useState({
    displayName: user.displayName || user.email?.split('@')[0] || '',
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    bio: '',
    gradeLevel: '',
  });

  const avatarUrl =
    user.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName || user.email)}`;

  const handleAvatarSelect = async (selectedUrl: string) => {
    try {
      // Optimistic update
      // @ts-expect-error - Types need synchronization
      useAuthStore.setState({ user: { ...user, avatar_url: selectedUrl } });
      await profileAPI.updateProfile(user.id, { avatar_url: selectedUrl });
      toast.success('Avatar actualizado');
      setShowAvatarModal(false);
    } catch {
      toast.error('Error al actualizar avatar');
    }
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      await profileAPI.updateProfile(user.id, {
        display_name: profile.displayName,
        first_name: profile.firstName,
        last_name: profile.lastName,
        bio: profile.bio,
        grade_level: profile.gradeLevel,
      });
      setSaveStatus('saved');
      toast.success('Perfil guardado correctamente');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      setSaveStatus('error');
      const msg =
        error instanceof Error
          ? ((error as any).response?.data?.message || error.message)
          : 'Error al guardar perfil';
      toast.error(msg);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <DetectiveCard>
          <h2 className="mb-2 text-2xl font-bold text-detective-text">
            Configuracion del Perfil
          </h2>
          <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

          <div className="space-y-8">
            {/* Avatar */}
            <div>
              <label className="mb-3 block text-sm font-medium text-detective-text">
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-32 w-32 items-center justify-center overflow-hidden rounded-full border-4 border-detective-orange/30 bg-gradient-to-br from-detective-orange to-detective-gold shadow-lg">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => setShowAvatarModal(true)}
                    className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-detective-orange shadow-md transition-all hover:scale-110 hover:bg-detective-orange-dark"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-medium text-detective-text">
                    Haz clic para cambiar tu avatar
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    Elige entre 12 avatares predefinidos
                  </p>
                </div>
              </div>
            </div>

            {/* Display Name */}
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Nombre de usuario
              </label>
              <input
                type="text"
                value={profile.displayName}
                onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
              />
            </div>

            {/* Bio */}
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-detective-text">
                  Biografia
                </label>
                <span className="text-xs text-detective-text-secondary">
                  Cuenta un poco sobre ti (max 200 caracteres)
                </span>
              </div>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                maxLength={200}
                className="w-full resize-vertical rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                rows={4}
                placeholder="Cuentanos sobre ti..."
              />
              <p className="mt-1 text-xs text-detective-text-secondary">
                {profile.bio.length} / 200 caracteres
              </p>
            </div>

            <SaveButton status={saveStatus} onClick={handleSave} idleLabel="Guardar Perfil" />
          </div>
        </DetectiveCard>
      </motion.div>

      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user.avatar_url || ''}
      />
    </>
  );
};
