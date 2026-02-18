import React from 'react';
import { motion } from 'framer-motion';
import { Camera, Eye, EyeOff, Key } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { cn } from '@shared/utils/cn';
import { SaveButton } from './SaveButton';

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
  saveStatus: 'idle' | 'saving' | 'saved' | 'error';
  handleSave: () => void;
  handleAvatarUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handlePasswordChange: () => void;
}

export function ProfileSettingsSection({
  profile,
  setProfile,
  account,
  setAccount,
  showPassword,
  setShowPassword,
  isUploading,
  uploadProgress,
  saveStatus,
  handleSave,
  handleAvatarUpload,
  handlePasswordChange,
}: ProfileSettingsSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: 'easeOut' }}
    >
      <DetectiveCard>
        <h2 className="mb-2 text-2xl font-bold text-detective-text">
          Configuración de Perfil
        </h2>
        <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

        <div className="space-y-8">
          {/* Avatar */}
          <div>
            <label className="mb-3 block text-sm font-medium text-detective-text">
              Foto de Perfil
            </label>
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-detective-orange to-detective-gold">
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt="Avatar"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl font-bold text-white">
                      {profile.displayName.charAt(0).toUpperCase()}
                    </span>
                  )}
                </div>
                <label
                  htmlFor="avatar-upload"
                  className={cn(
                    'absolute bottom-0 right-0 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full transition-all',
                    isUploading
                      ? 'cursor-not-allowed bg-gray-400'
                      : 'bg-detective-orange hover:scale-110 hover:bg-detective-orange-dark',
                  )}
                >
                  <Camera
                    className={cn('h-4 w-4 text-white', isUploading && 'animate-pulse')}
                  />
                </label>
                <input
                  id="avatar-upload"
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarUpload}
                  disabled={isUploading}
                  className="hidden"
                />
              </div>
              <div>
                <p className="text-sm text-detective-text-secondary">
                  Sube una nueva foto de perfil
                </p>
                <p className="text-xs text-detective-text-secondary">
                  JPG, PNG o GIF. Tamaño máximo 2MB.
                </p>
              </div>
            </div>

            {/* Progress indicator */}
            {isUploading && uploadProgress > 0 && (
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
                        animate={{ width: `${uploadProgress}%` }}
                        transition={{ duration: 0.3 }}
                        className="h-2 bg-gradient-to-r from-detective-orange to-detective-gold"
                      />
                    </div>
                  </div>
                  <span className="text-sm font-medium text-detective-text">
                    {uploadProgress}%
                  </span>
                </div>
                <p className="mt-1 text-xs text-detective-text-secondary">
                  {uploadProgress < 100 ? 'Subiendo avatar...' : '¡Completado!'}
                </p>
              </motion.div>
            )}
          </div>

          {/* Display Name */}
          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Nombre a Mostrar
            </label>
            <input
              type="text"
              value={profile.displayName}
              onChange={(e) => setProfile({ ...profile, displayName: e.target.value })}
              className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
            />
          </div>

          {/* First Name & Last Name */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Nombre
              </label>
              <input
                type="text"
                value={profile.firstName}
                onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                  transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                  focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Apellido
              </label>
              <input
                type="text"
                value={profile.lastName}
                onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                  transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                  focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
              />
            </div>
          </div>

          {/* Bio */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-detective-text">Biografía</label>
              <span className="text-xs text-detective-text-secondary">
                Cuéntales a tus estudiantes sobre ti (máx 200 caracteres)
              </span>
            </div>
            <textarea
              value={profile.bio}
              onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
              className="resize-vertical w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4
                py-3 transition-all duration-200 placeholder:text-gray-400
                focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
              rows={4}
              placeholder="Ej: Profesor de historia con 10 años de experiencia. Me apasiona hacer que el aprendizaje sea divertido..."
            />
            <p className={cn(
              "mt-1 text-xs",
              profile.bio.length > 200
                ? "text-red-500 font-medium"
                : "text-detective-text-secondary"
            )}>
              {profile.bio.length} / 200 caracteres
              {profile.bio.length > 200 && " (excede el límite)"}
            </p>
          </div>

          {/* Email & Password Section */}
          <hr className="border-detective-bg" />
          <h3 className="text-xl font-bold text-detective-text">Seguridad de Cuenta</h3>

          <div>
            <label className="mb-2 block text-sm font-medium text-detective-text">
              Email
            </label>
            <input
              type="email"
              value={account.email}
              disabled
              className="w-full cursor-not-allowed rounded-lg border-2 border-detective-orange/20 bg-gray-50 px-4
                py-3 text-gray-600"
            />
            <p className="mt-1 text-xs text-detective-text-secondary">
              Contacta al administrador para cambiar tu email
            </p>
          </div>

          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="text-sm font-medium text-detective-text">
                Contraseña Actual
              </label>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={account.currentPassword}
                onChange={(e) =>
                  setAccount({ ...account, currentPassword: e.target.value })
                }
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3 pr-10
                  transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                  focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                placeholder="Introduce tu contraseña actual"
              />
              <button
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
                Nueva Contraseña
              </label>
              <input
                type="password"
                value={account.newPassword}
                onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                  transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                  focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                placeholder="Nueva contraseña"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-detective-text">
                Confirmar Contraseña
              </label>
              <input
                type="password"
                value={account.confirmPassword}
                onChange={(e) =>
                  setAccount({ ...account, confirmPassword: e.target.value })
                }
                className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                  transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                  focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                placeholder="Confirma la contraseña"
              />
            </div>
          </div>

          {account.currentPassword && account.newPassword && (
            <motion.button
              onClick={handlePasswordChange}
              disabled={saveStatus === 'saving'}
              whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
              whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
              className="hover:bg-detective-blue-dark flex items-center gap-2 rounded-lg bg-detective-blue px-6 py-3 font-medium text-white shadow-md transition-all"
            >
              <Key className="h-4 w-4" />
              <span>Cambiar Contraseña</span>
            </motion.button>
          )}

          <SaveButton saveStatus={saveStatus} onClick={handleSave} />
        </div>
      </DetectiveCard>
    </motion.div>
  );
}
