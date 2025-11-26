/**
 * SettingsPage - User Settings and Preferences
 *
 * Sections:
 * - Profile settings (avatar, display name, bio)
 * - Account settings (email, password)
 * - Preferences (theme, language, notifications)
 * - Privacy settings
 * - Connected accounts
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/app/providers/AuthContext';
import {
  Settings as SettingsIcon,
  User,
  Lock,
  Bell,
  Shield,
  Palette,
  Globe,
  Mail,
  Key,
  Eye,
  EyeOff,
  Save,
  Camera,
  Link as LinkIcon,
  AlertCircle,
  Check,
  Loader2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { profileAPI } from '@/services/api/profileAPI';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { EnhancedCard } from '@shared/components/base/EnhancedCard';
import { ColorfulCard } from '@shared/components/base/ColorfulCard';

// Utils
import { cn } from '@shared/utils/cn';

type SettingsSection = 'profile' | 'account' | 'preferences' | 'privacy' | 'connected';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // State
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');
  const [showPassword, setShowPassword] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState<boolean>(false);

  // Profile Settings
  const [profile, setProfile] = useState({
    displayName: user?.displayName || user?.email?.split('@')[0] || '',
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    bio: '',
    gradeLevel: '',
    avatar: '',
  });

  // Account Settings
  const [account, setAccount] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Preferences
  const [preferences, setPreferences] = useState({
    theme: 'light',
    language: 'es',
    emailNotifications: true,
    pushNotifications: true,
    achievementAlerts: true,
    friendRequests: true,
    guildInvites: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    showOnlineStatus: true,
    allowFriendRequests: true,
    showActivity: true,
  });

  // Handle Save
  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    setSaveStatus('saving');

    try {
      // Save profile based on active section
      if (activeSection === 'profile') {
        await profileAPI.updateProfile(user.id, {
          display_name: profile.displayName,
          first_name: profile.firstName,
          last_name: profile.lastName,
          bio: profile.bio,
          grade_level: profile.gradeLevel,
        });
      }

      if (activeSection === 'preferences') {
        await profileAPI.updatePreferences(user.id, {
          theme: preferences.theme,
          language: preferences.language,
          notifications: {
            email: preferences.emailNotifications,
            push: preferences.pushNotifications,
            in_app: preferences.achievementAlerts,
          },
        });
      }

      if (activeSection === 'privacy') {
        await profileAPI.updatePreferences(user.id, {
          privacy: {
            profileVisibility: privacy.profileVisibility,
            showOnlineStatus: privacy.showOnlineStatus,
            allowFriendRequests: privacy.allowFriendRequests,
            showActivity: privacy.showActivity,
          },
        } as any);
      }

      setSaveStatus('saved');
      toast.success('¡Configuración guardada correctamente!', {
        duration: 3000,
        icon: '✅',
        style: {
          border: '2px solid #f97316',
          padding: '16px',
          color: '#1a1a1a',
        },
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      toast.error(error.response?.data?.message || 'Error al guardar configuracion');

      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  // Handle Avatar Upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    // Validar tamaño (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 2MB.');
      return;
    }

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor sube una imagen válida (JPG, PNG, GIF).');
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Preview image locally first
    const reader = new FileReader();
    reader.onloadend = () => {
      setProfile({ ...profile, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);

    try {
      // Simular progreso de upload
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 150);

      const result = await profileAPI.uploadAvatar(user.id, file);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Avatar actualizado correctamente');
      setProfile({ ...profile, avatar: result.avatar_url });

      // Reset progress después de 1 segundo
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error: any) {
      console.error('Error uploading avatar:', error);
      toast.error(error.response?.data?.message || 'Error al subir avatar');
      setUploadProgress(0);
      setIsUploading(false);
    }
  };

  // Handle Password Change
  const handlePasswordChange = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    if (!account.currentPassword || !account.newPassword) {
      toast.error('Por favor complete todos los campos de contrasena');
      return;
    }

    if (account.newPassword !== account.confirmPassword) {
      toast.error('Las contrasenas no coinciden');
      return;
    }

    if (account.newPassword.length < 8) {
      toast.error('La contrasena debe tener al menos 8 caracteres');
      return;
    }

    setSaveStatus('saving');

    try {
      await profileAPI.updatePassword(user.id, {
        current_password: account.currentPassword,
        new_password: account.newPassword,
      });

      toast.success('Contrasena actualizada correctamente');
      setSaveStatus('saved');

      // Clear password fields
      setAccount({
        ...account,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: any) {
      console.error('Error changing password:', error);
      setSaveStatus('error');
      toast.error(error.response?.data?.message || 'Error al cambiar contrasena');

      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const sections = [
    { id: 'profile' as SettingsSection, label: 'Profile', icon: User },
    { id: 'account' as SettingsSection, label: 'Account', icon: Lock },
    { id: 'preferences' as SettingsSection, label: 'Preferences', icon: SettingsIcon },
    { id: 'privacy' as SettingsSection, label: 'Privacy', icon: Shield },
    { id: 'connected' as SettingsSection, label: 'Connected Accounts', icon: LinkIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user ?? undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <EnhancedCard hover={false} padding="sm" variant="default">
              <nav className="space-y-1">
                {sections.map((section) => {
                  const Icon = section.icon;
                  const isActive = activeSection === section.id;

                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all',
                        isActive
                          ? 'bg-detective-orange text-white'
                          : 'text-detective-text hover:bg-detective-bg',
                      )}
                    >
                      <Icon className="h-5 w-5" />
                      <span>{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </EnhancedCard>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {/* Profile Settings */}
            {activeSection === 'profile' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ColorfulCard index={0} hover={false} animate={false}>
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">Profile Settings</h2>
                  <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

                  <div className="space-y-8">
                    {/* Avatar */}
                    <div>
                      <label className="mb-3 block text-sm font-medium text-detective-text">
                        Profile Picture
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
                            Upload a new profile picture
                          </p>
                          <p className="text-xs text-detective-text-secondary">
                            JPG, PNG or GIF. Max size 2MB.
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
                        Display Name
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

                    {/* Bio */}
                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-detective-text">Bio</label>
                        <span className="text-xs text-detective-text-secondary">
                          Cuenta un poco sobre ti (máx 200 caracteres)
                        </span>
                      </div>
                      <textarea
                        value={profile.bio}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        className="resize-vertical w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4
                          py-3 transition-all duration-200 placeholder:text-gray-400
                          focus:border-detective-orange focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                        rows={4}
                        placeholder="Tell us about yourself..."
                      />
                      <p className="mt-1 text-xs text-detective-text-secondary">
                        {profile.bio.length} / 200 characters
                      </p>
                    </div>

                    <motion.button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
                      whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
                        saveStatus === 'saving' && 'cursor-not-allowed bg-gray-400',
                        saveStatus === 'saved' && 'bg-green-500 text-white',
                        saveStatus === 'error' && 'bg-red-500 text-white',
                        saveStatus === 'idle' &&
                          'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : saveStatus === 'saved' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          <span>¡Guardado!</span>
                        </motion.div>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Error</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Guardar Cambios</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </ColorfulCard>
              </motion.div>
            )}

            {/* Account Settings */}
            {activeSection === 'account' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ColorfulCard index={1} hover={false} animate={false}>
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">Account Settings</h2>
                  <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

                  <div className="space-y-8">
                    {/* Email */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-detective-text">
                        Email Address
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="email"
                          value={account.email}
                          onChange={(e) => setAccount({ ...account, email: e.target.value })}
                          className="flex-1 rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                            transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                            focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                        />
                        <button className="hover:bg-detective-blue-dark rounded-lg bg-detective-blue px-4 py-2 font-medium text-white transition-colors">
                          Verify
                        </button>
                      </div>
                    </div>

                    <hr className="border-detective-bg" />

                    {/* Change Password */}
                    <h3 className="text-xl font-bold text-detective-text">Change Password</h3>

                    <div>
                      <div className="mb-2 flex items-center justify-between">
                        <label className="text-sm font-medium text-detective-text">
                          Current Password
                        </label>
                        <span className="flex items-center gap-1 text-xs text-detective-text-secondary">
                          <Shield className="h-3 w-3" />
                          Requerido para cambiar contraseña
                        </span>
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

                    <div>
                      <label className="mb-2 block text-sm font-medium text-detective-text">
                        New Password
                      </label>
                      <input
                        type="password"
                        value={account.newPassword}
                        onChange={(e) => setAccount({ ...account, newPassword: e.target.value })}
                        className="w-full rounded-lg border-2 border-detective-orange/40 bg-white px-4 py-3
                          transition-all duration-200 placeholder:text-gray-400 focus:border-detective-orange
                          focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-detective-text">
                        Confirm New Password
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
                      />
                    </div>

                    <motion.button
                      onClick={handlePasswordChange}
                      disabled={saveStatus === 'saving'}
                      whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
                      whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
                        saveStatus === 'saving' && 'cursor-not-allowed bg-gray-400',
                        saveStatus === 'saved' && 'bg-green-500 text-white',
                        saveStatus === 'error' && 'bg-red-500 text-white',
                        saveStatus === 'idle' &&
                          'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Updating...</span>
                        </>
                      ) : saveStatus === 'saved' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          <span>¡Actualizado!</span>
                        </motion.div>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Error</span>
                        </>
                      ) : (
                        <>
                          <Key className="h-4 w-4" />
                          <span>Update Password</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </ColorfulCard>
              </motion.div>
            )}

            {/* Preferences */}
            {activeSection === 'preferences' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ColorfulCard index={2} hover={false} animate={false}>
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">Preferences</h2>
                  <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

                  <div className="space-y-8">
                    {/* Theme */}
                    <div>
                      <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-detective-text">
                        <Palette className="h-4 w-4" />
                        Theme
                      </label>
                      <select
                        value={preferences.theme}
                        onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
                        className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4
                          py-3 transition-all duration-200 focus:border-detective-orange
                          focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto (System)</option>
                      </select>
                    </div>

                    {/* Language */}
                    <div>
                      <label className="mb-2 block flex items-center gap-2 text-sm font-medium text-detective-text">
                        <Globe className="h-4 w-4" />
                        Language
                      </label>
                      <select
                        value={preferences.language}
                        onChange={(e) =>
                          setPreferences({ ...preferences, language: e.target.value })
                        }
                        className="w-full cursor-pointer rounded-lg border-2 border-detective-orange/40 bg-white px-4
                          py-3 transition-all duration-200 focus:border-detective-orange
                          focus:outline-none focus:ring-2 focus:ring-detective-orange/20"
                      >
                        <option value="es">Español</option>
                        <option value="en">English</option>
                      </select>
                    </div>

                    <hr className="border-detective-bg" />

                    {/* Notifications */}
                    <h3 className="flex items-center gap-2 text-xl font-bold text-detective-text">
                      <Bell className="h-5 w-5" />
                      Notifications
                    </h3>

                    <div className="space-y-3">
                      {[
                        { key: 'emailNotifications', label: 'Email Notifications' },
                        { key: 'pushNotifications', label: 'Push Notifications' },
                        { key: 'achievementAlerts', label: 'Achievement Alerts' },
                        { key: 'friendRequests', label: 'Friend Requests' },
                        { key: 'guildInvites', label: 'Guild Invitations' },
                      ].map((item) => (
                        <label
                          key={item.key}
                          className="flex cursor-pointer items-center justify-between rounded-lg bg-detective-bg p-3"
                        >
                          <span className="font-medium text-detective-text">{item.label}</span>
                          <input
                            type="checkbox"
                            checked={preferences[item.key as keyof typeof preferences] as boolean}
                            onChange={(e) =>
                              setPreferences({ ...preferences, [item.key]: e.target.checked })
                            }
                            className="h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                          />
                        </label>
                      ))}
                    </div>

                    {/* Advanced Notification Settings */}
                    <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <h4 className="mb-2 text-sm font-bold text-blue-800">
                        Advanced Notification Settings
                      </h4>
                      <p className="mb-3 text-xs text-blue-700">
                        Configure detailed preferences for each notification type and manage devices
                        for push notifications
                      </p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => navigate('/settings/notifications')}
                          className="rounded-lg bg-detective-orange px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-detective-orange-dark"
                        >
                          Notification Preferences
                        </button>
                        <button
                          onClick={() => navigate('/settings/devices')}
                          className="hover:bg-detective-blue-dark rounded-lg bg-detective-blue px-4 py-2 text-sm font-medium text-white transition-colors"
                        >
                          Manage Devices
                        </button>
                      </div>
                    </div>

                    <motion.button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
                      whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
                        saveStatus === 'saving' && 'cursor-not-allowed bg-gray-400',
                        saveStatus === 'saved' && 'bg-green-500 text-white',
                        saveStatus === 'error' && 'bg-red-500 text-white',
                        saveStatus === 'idle' &&
                          'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : saveStatus === 'saved' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          <span>¡Guardado!</span>
                        </motion.div>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Error</span>
                        </>
                      ) : (
                        <>
                          <Save className="h-4 w-4" />
                          <span>Guardar Preferencias</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </ColorfulCard>
              </motion.div>
            )}

            {/* Privacy Settings */}
            {activeSection === 'privacy' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ColorfulCard index={3} hover={false} animate={false}>
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">Privacy Settings</h2>
                  <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

                  <div className="space-y-8">
                    {/* Profile Visibility */}
                    <div>
                      <label className="mb-2 block text-sm font-medium text-detective-text">
                        Profile Visibility
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
                        <option value="public">Public (Everyone)</option>
                        <option value="friends">Friends Only</option>
                        <option value="private">Private</option>
                      </select>
                    </div>

                    {/* Privacy Toggles */}
                    <div className="space-y-3">
                      {[
                        {
                          key: 'showOnlineStatus',
                          label: 'Show Online Status',
                          description: 'Let friends see when you are online',
                        },
                        {
                          key: 'allowFriendRequests',
                          label: 'Allow Friend Requests',
                          description: 'Anyone can send you friend requests',
                        },
                        {
                          key: 'showActivity',
                          label: 'Show Activity',
                          description: 'Display your recent activities to friends',
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
                            checked={privacy[item.key as keyof typeof privacy] as boolean}
                            onChange={(e) =>
                              setPrivacy({ ...privacy, [item.key]: e.target.checked })
                            }
                            className="mt-1 h-4 w-4 rounded text-detective-orange focus:ring-detective-orange"
                          />
                        </label>
                      ))}
                    </div>

                    <motion.button
                      onClick={handleSave}
                      disabled={saveStatus === 'saving'}
                      whileHover={saveStatus === 'idle' ? { scale: 1.02 } : {}}
                      whileTap={saveStatus === 'idle' ? { scale: 0.98 } : {}}
                      className={cn(
                        'flex items-center gap-2 rounded-lg px-6 py-3 font-medium shadow-md transition-all',
                        saveStatus === 'saving' && 'cursor-not-allowed bg-gray-400',
                        saveStatus === 'saved' && 'bg-green-500 text-white',
                        saveStatus === 'error' && 'bg-red-500 text-white',
                        saveStatus === 'idle' &&
                          'bg-detective-orange text-white hover:bg-detective-orange-dark hover:shadow-lg',
                      )}
                    >
                      {saveStatus === 'saving' ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Guardando...</span>
                        </>
                      ) : saveStatus === 'saved' ? (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="flex items-center gap-2"
                        >
                          <Check className="h-5 w-5" />
                          <span>¡Guardado!</span>
                        </motion.div>
                      ) : saveStatus === 'error' ? (
                        <>
                          <AlertCircle className="h-4 w-4" />
                          <span>Error</span>
                        </>
                      ) : (
                        <>
                          <Shield className="h-4 w-4" />
                          <span>Guardar Privacidad</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </ColorfulCard>
              </motion.div>
            )}

            {/* Connected Accounts */}
            {activeSection === 'connected' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              >
                <ColorfulCard index={4} hover={false} animate={false}>
                  <h2 className="mb-2 text-2xl font-bold text-detective-text">
                    Connected Accounts
                  </h2>
                  <div className="mb-6 h-1 w-16 rounded-full bg-gradient-to-r from-detective-orange to-transparent" />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between rounded-lg bg-detective-bg p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-500">
                          <Mail className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-detective-text">Google</p>
                          <p className="text-sm text-detective-text-secondary">Not connected</p>
                        </div>
                      </div>
                      <button className="rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark">
                        Connect
                      </button>
                    </div>

                    <div className="flex items-center justify-between rounded-lg bg-detective-bg p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800">
                          <LinkIcon className="h-5 w-5 text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-detective-text">GitHub</p>
                          <p className="text-sm text-detective-text-secondary">Not connected</p>
                        </div>
                      </div>
                      <button className="rounded-lg bg-detective-orange px-4 py-2 font-medium text-white transition-colors hover:bg-detective-orange-dark">
                        Connect
                      </button>
                    </div>

                    <div className="flex gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                      <div>
                        <p className="text-sm font-medium text-blue-800">
                          Connect your accounts for easier login
                        </p>
                        <p className="mt-1 text-xs text-blue-600">
                          You can sign in with any connected account without remembering your
                          password.
                        </p>
                      </div>
                    </div>
                  </div>
                </ColorfulCard>
              </motion.div>
            )}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </div>
    </div>
  );
}
