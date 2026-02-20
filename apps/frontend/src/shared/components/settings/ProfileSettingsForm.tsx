import { useState } from 'react';
import type { ChangeEvent, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Camera, Eye, EyeOff, Key } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { InputDetective } from '@shared/components/base/InputDetective';
import { SaveButton, type SaveStatus } from '@shared/components/feedback/SaveButton';
import { cn } from '@shared/utils/cn';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface ProfileFormData {
  displayName: string;
  firstName: string;
  lastName: string;
  bio: string;
}

export interface PasswordChangeData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AvatarUploadConfig {
  /** Current avatar URL (or local preview) */
  avatarUrl: string;
  /** Fallback initial to show when no avatar */
  fallbackInitial?: string;
  /** Handler for file-based upload (teacher flow) */
  onFileUpload?: (e: ChangeEvent<HTMLInputElement>) => void;
  /** Handler for avatar selection modal (student flow) */
  onSelectAvatar?: () => void;
  /** Whether upload is in progress */
  isUploading?: boolean;
  /** Upload progress percentage (0-100) */
  uploadProgress?: number;
}

export interface ProfileSettingsFormProps {
  /** Profile form fields */
  profile: ProfileFormData;
  onProfileChange: (profile: ProfileFormData) => void;

  /** Email (displayed as disabled field) */
  email?: string;

  /** Avatar configuration */
  avatar?: AvatarUploadConfig;

  /** Extra fields rendered between bio and the save button */
  extraFields?: ReactNode;

  /** Bio max length (default 200) */
  bioMaxLength?: number;
  /** Bio placeholder text */
  bioPlaceholder?: string;
  /** Bio label hint (shown on the right side) */
  bioHint?: string;

  /** Password change section (omit to hide) */
  showPasswordChange?: boolean;
  passwordData?: PasswordChangeData;
  onPasswordDataChange?: (data: PasswordChangeData) => void;
  onPasswordChange?: () => void;

  /** Save handling */
  saveStatus: SaveStatus;
  onSave: () => void;
  saveLabel?: string;

  /** Card title */
  title?: string;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export function ProfileSettingsForm({
  profile,
  onProfileChange,
  email,
  avatar,
  extraFields,
  bioMaxLength = 200,
  bioPlaceholder = 'Cuentanos sobre ti...',
  bioHint,
  showPasswordChange = false,
  passwordData,
  onPasswordDataChange,
  onPasswordChange,
  saveStatus,
  onSave,
  saveLabel = 'Guardar Perfil',
  title = 'Configuracion del Perfil',
}: ProfileSettingsFormProps) {
  const [showPassword, setShowPassword] = useState(false);

  const updateField = <K extends keyof ProfileFormData>(key: K, value: ProfileFormData[K]) => {
    onProfileChange({ ...profile, [key]: value });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 text-2xl font-bold text-detective-text">{title}</h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-6">
          {/* ---- Avatar ---- */}
          {avatar && (
            <div>
              <label className="mb-3 block text-sm font-medium text-detective-text">
                Foto de perfil
              </label>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div
                    className={cn(
                      'flex items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-detective-orange to-detective-gold',
                      avatar.onSelectAvatar
                        ? 'h-32 w-32 border-4 border-detective-orange/30 shadow-lg'
                        : 'h-20 w-20',
                    )}
                  >
                    {avatar.avatarUrl ? (
                      <img
                        src={avatar.avatarUrl}
                        alt="Avatar"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-2xl font-bold text-white">
                        {(avatar.fallbackInitial || profile.displayName.charAt(0) || 'U').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {/* File upload trigger (teacher) */}
                  {avatar.onFileUpload && (
                    <>
                      <label
                        htmlFor="avatar-upload"
                        className={cn(
                          'absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-all',
                          avatar.isUploading
                            ? 'cursor-not-allowed bg-gray-400'
                            : 'bg-detective-orange hover:scale-110 hover:bg-detective-orange-dark',
                        )}
                      >
                        <Camera
                          className={cn('h-4 w-4 text-white', avatar.isUploading && 'animate-pulse')}
                        />
                      </label>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={avatar.onFileUpload}
                        disabled={avatar.isUploading}
                        className="hidden"
                      />
                    </>
                  )}

                  {/* Avatar selection trigger (student) */}
                  {avatar.onSelectAvatar && !avatar.onFileUpload && (
                    <button
                      onClick={avatar.onSelectAvatar}
                      className="absolute bottom-1 right-1 flex h-8 w-8 items-center justify-center rounded-full bg-detective-orange shadow-md transition-all hover:scale-110 hover:bg-detective-orange-dark"
                    >
                      <Camera className="h-4 w-4 text-white" />
                    </button>
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-detective-text">
                    {avatar.onSelectAvatar
                      ? 'Haz clic para cambiar tu avatar'
                      : 'Sube una nueva foto de perfil'}
                  </p>
                  <p className="text-xs text-detective-text-secondary">
                    {avatar.onSelectAvatar
                      ? 'Elige entre 12 avatares predefinidos'
                      : 'JPG, PNG o GIF. Tamano maximo 2MB.'}
                  </p>
                </div>
              </div>

              {/* Upload progress indicator (file upload flow) */}
              {avatar.isUploading && avatar.uploadProgress != null && avatar.uploadProgress > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <div className="h-2 w-full overflow-hidden rounded-full bg-detective-bg">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${avatar.uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                          className="h-2 bg-gradient-to-r from-detective-orange to-detective-gold"
                        />
                      </div>
                    </div>
                    <span className="text-sm font-medium text-detective-text">
                      {avatar.uploadProgress}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-detective-text-secondary">
                    {avatar.uploadProgress < 100 ? 'Subiendo avatar...' : 'Completado!'}
                  </p>
                </motion.div>
              )}
            </div>
          )}

          {/* ---- Display Name ---- */}
          <InputDetective
            label="Nombre de usuario"
            value={profile.displayName}
            onChange={(e) => updateField('displayName', e.target.value)}
            placeholder="Tu nombre de usuario"
          />

          {/* ---- First Name + Last Name ---- */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InputDetective
              label="Nombre"
              value={profile.firstName}
              onChange={(e) => updateField('firstName', e.target.value)}
              placeholder="Tu nombre"
            />
            <InputDetective
              label="Apellido"
              value={profile.lastName}
              onChange={(e) => updateField('lastName', e.target.value)}
              placeholder="Tu apellido"
            />
          </div>

          {/* ---- Extra fields (e.g., grade level for students) ---- */}
          {extraFields}

          {/* ---- Bio ---- */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-detective-text">Biografia</label>
              {bioHint && (
                <span className="text-xs text-detective-text-secondary">{bioHint}</span>
              )}
            </div>
            <textarea
              value={profile.bio}
              onChange={(e) => updateField('bio', e.target.value)}
              maxLength={bioMaxLength + 50} // allow slight overshoot for validation UX
              className="input-detective w-full resize-vertical"
              rows={4}
              placeholder={bioPlaceholder}
            />
            <p
              className={cn(
                'mt-1 text-xs',
                profile.bio.length > bioMaxLength
                  ? 'font-medium text-red-500'
                  : 'text-detective-text-secondary',
              )}
            >
              {profile.bio.length} / {bioMaxLength} caracteres
              {profile.bio.length > bioMaxLength && ' (excede el limite)'}
            </p>
          </div>

          {/* ---- Password Change Section ---- */}
          {showPasswordChange && passwordData && onPasswordDataChange && (
            <>
              <hr className="border-detective-bg" />
              <h3 className="text-xl font-bold text-detective-text">Seguridad de Cuenta</h3>

              {email && (
                <div>
                  <label className="mb-2 block text-sm font-medium text-detective-text">
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    disabled
                    className="w-full cursor-not-allowed rounded-lg border-2 border-detective-orange/20 bg-gray-50 px-4 py-3 text-gray-600"
                  />
                  <p className="mt-1 text-xs text-detective-text-secondary">
                    Contacta al administrador para cambiar tu email
                  </p>
                </div>
              )}

              <div>
                <label className="mb-2 block text-sm font-medium text-detective-text">
                  Contrasena Actual
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      onPasswordDataChange({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 pr-10 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                    placeholder="Introduce tu contrasena actual"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-detective-text-secondary"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5" />
                    ) : (
                      <Eye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-detective-text">
                    Nueva Contrasena
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      onPasswordDataChange({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                    placeholder="Nueva contrasena"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium text-detective-text">
                    Confirmar Contrasena
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      onPasswordDataChange({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                    placeholder="Confirma la contrasena"
                  />
                </div>
              </div>

              {passwordData.currentPassword && passwordData.newPassword && onPasswordChange && (
                <motion.button
                  onClick={onPasswordChange}
                  disabled={saveStatus === 'saving'}
                  whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
                  whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
                  className="hover:bg-detective-blue-dark flex items-center gap-2 rounded-lg bg-detective-blue px-6 py-3 font-medium text-white shadow-md transition-all"
                >
                  <Key className="h-4 w-4" />
                  <span>Cambiar Contrasena</span>
                </motion.button>
              )}
            </>
          )}

          <SaveButton status={saveStatus} onClick={onSave} idleLabel={saveLabel} />
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
