import React from 'react';
import {
  ProfileSettingsForm,
  type ProfileFormData,
  type PasswordChangeData,
} from '@shared/components/settings';
import type { SaveStatus } from '@shared/components/feedback/SaveButton';

/* ------------------------------------------------------------------ */
/*  Types kept for backward-compat with TeacherSettings parent page    */
/* ------------------------------------------------------------------ */

interface ProfileState {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
  avatar: string;
}

interface AccountState {
  email: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

interface ProfileSettingsSectionProps {
  profile: ProfileState;
  setProfile: React.Dispatch<React.SetStateAction<ProfileState>>;
  account: AccountState;
  setAccount: React.Dispatch<React.SetStateAction<AccountState>>;
  showPassword: boolean;
  setShowPassword: React.Dispatch<React.SetStateAction<boolean>>;
  isUploading: boolean;
  uploadProgress: number;
  saveStatus: SaveStatus;
  handleSave: () => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: () => void;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileSettingsSection({
  profile,
  setProfile,
  account,
  setAccount,
  isUploading,
  uploadProgress,
  saveStatus,
  handleSave,
  handleAvatarUpload,
  handlePasswordChange,
}: ProfileSettingsSectionProps) {
  // Map parent state to shared form data
  const formData: ProfileFormData = {
    displayName: profile.displayName,
    firstName: profile.firstName,
    lastName: profile.lastName,
    bio: profile.bio,
  };

  const passwordData: PasswordChangeData = {
    currentPassword: account.currentPassword,
    newPassword: account.newPassword,
    confirmPassword: account.confirmPassword,
  };

  return (
    <ProfileSettingsForm
      title="Configuracion de Perfil"
      profile={formData}
      onProfileChange={(data) =>
        setProfile((prev) => ({
          ...prev,
          displayName: data.displayName,
          firstName: data.firstName,
          lastName: data.lastName,
          bio: data.bio,
        }))
      }
      email={account.email}
      avatar={{
        avatarUrl: profile.avatar,
        fallbackInitial: profile.displayName.charAt(0),
        onFileUpload: handleAvatarUpload,
        isUploading,
        uploadProgress,
      }}
      bioMaxLength={200}
      bioHint="Cuentales a tus estudiantes sobre ti (max 200 caracteres)"
      bioPlaceholder="Ej: Profesor de historia con 10 anos de experiencia. Me apasiona hacer que el aprendizaje sea divertido..."
      showPasswordChange
      passwordData={passwordData}
      onPasswordDataChange={(data) =>
        setAccount((prev) => ({
          ...prev,
          currentPassword: data.currentPassword,
          newPassword: data.newPassword,
          confirmPassword: data.confirmPassword,
        }))
      }
      onPasswordChange={handlePasswordChange}
      saveStatus={saveStatus}
      onSave={handleSave}
      saveLabel="Guardar Cambios"
    />
  );
}
