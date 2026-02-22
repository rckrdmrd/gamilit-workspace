import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '@/app/providers/AuthContext';
import { profileAPI } from '@/services/api/profileAPI';
import { AvatarSelectionModal } from '@shared/components/profile/AvatarSelectionModal';
import { InputDetective } from '@shared/components/base/InputDetective';
import {
  ProfileSettingsForm,
  type ProfileFormData,
} from '@shared/components/settings';
import type { SaveStatus } from '@shared/components/feedback/SaveButton';
import type { User } from '@/shared/types/auth.types';

interface ProfileSectionProps {
  user: User;
}

export const ProfileSection = ({ user }: ProfileSectionProps) => {
  const { refreshUser } = useAuth();
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [profile, setProfile] = useState<ProfileFormData & { gradeLevel: string }>({
    displayName: user.displayName || user.display_name || user.email?.split('@')[0] || '',
    firstName: user.firstName || user.first_name || '',
    lastName: user.lastName || user.last_name || '',
    bio: user.bio || '',
    gradeLevel: user.grade_level || '',
  });

  const avatarUrl =
    user.avatar_url ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile.displayName || user.email)}`;

  const handleAvatarSelect = async (selectedUrl: string) => {
    try {
      await profileAPI.updateProfile(user.id, { avatar_url: selectedUrl });
      await refreshUser();
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
      await refreshUser();
      setSaveStatus('saved');
      toast.success('Perfil guardado correctamente');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      setSaveStatus('error');
      const msg =
        error instanceof Error
          ? ((error as { response?: { data?: { message?: string } } }).response?.data?.message || error.message)
          : 'Error al guardar perfil';
      toast.error(msg);
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  return (
    <>
      <ProfileSettingsForm
        title="Configuracion del Perfil"
        profile={profile}
        onProfileChange={(data) => setProfile((prev) => ({ ...prev, ...data }))}
        avatar={{
          avatarUrl,
          onSelectAvatar: () => setShowAvatarModal(true),
        }}
        extraFields={
          <InputDetective
            label="Grado escolar"
            value={profile.gradeLevel}
            onChange={(e) => setProfile((prev) => ({ ...prev, gradeLevel: e.target.value }))}
            placeholder="Ej: 6to de primaria"
          />
        }
        bioMaxLength={200}
        bioHint="Cuenta un poco sobre ti (max 200 caracteres)"
        bioPlaceholder="Cuentanos sobre ti..."
        saveStatus={saveStatus}
        onSave={handleSave}
        saveLabel="Guardar Perfil"
      />

      <AvatarSelectionModal
        isOpen={showAvatarModal}
        onClose={() => setShowAvatarModal(false)}
        onSelect={handleAvatarSelect}
        currentAvatar={user.avatar_url || ''}
      />
    </>
  );
};
