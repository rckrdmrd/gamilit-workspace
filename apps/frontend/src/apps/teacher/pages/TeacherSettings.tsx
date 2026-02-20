/**
 * TeacherSettingsPage - Teacher Settings and Preferences
 *
 * Sections:
 * - Profile settings (avatar, display name, bio)
 * - Teaching preferences (classroom notifications, grading defaults, communication)
 * - Notification preferences (student alerts, submissions, messages)
 * - Privacy settings (profile visibility, contact preferences)
 *
 * @route /teacher/settings
 */

import React, { useState, useEffect } from 'react';
import { TeacherPageShell } from '../components/shared/TeacherPageShell';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/hooks/useAuth';
import { User, Bell, Shield, GraduationCap } from 'lucide-react';
import toast from 'react-hot-toast';
// ISS-FE-002: Use teacher namespace import for consistency
import { profileAPI } from '@/services/api/teacher';
import type { UpdatePreferencesDto } from '@/services/api/teacher';

// Components
import { useUserPreferences } from '@shared/hooks/useUserPreferences';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { ProfileSettingsSection } from '../components/settings/ProfileSettingsSection';
import { TeachingPreferencesSection } from '../components/settings/TeachingPreferencesSection';
import { NotificationsSettingsSection } from '../components/settings/NotificationsSettingsSection';
import { PrivacySettingsSection } from '../components/settings/PrivacySettingsSection';

// Utils
import { cn } from '@shared/utils/cn';

type SettingsSection = 'profile' | 'teaching' | 'notifications' | 'privacy';

/**
 * Extended preferences payload for teacher settings.
 * The backend accepts arbitrary preference objects via the generic preferences endpoint,
 * but UpdatePreferencesDto only covers basic theme/language/notifications fields.
 * This interface extends it with teacher-specific fields actually sent by this page.
 */
interface TeacherPreferencesPayload extends UpdatePreferencesDto {
  email_notifications?: boolean;
  notifications_enabled?: boolean;
  preferences?: Record<string, Record<string, unknown>>;
}

/**
 * TeacherSettingsPage Component
 *
 * Provides a comprehensive settings interface for teachers with:
 * - Profile customization
 * - Teaching-specific preferences
 * - Notification management
 * - Privacy controls
 *
 * @component
 */
export default function TeacherSettingsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Load user preferences from backend
  const {
    preferences: backendPreferences,
    loading: _preferencesLoading,
    error: _preferencesError,
  } = useUserPreferences();

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
    avatar: '',
  });

  // Account Settings
  const [account, setAccount] = useState({
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Teaching Preferences (específico para teachers)
  const [teachingPreferences, setTeachingPreferences] = useState({
    // Classroom Notifications
    newSubmissions: true,
    lateSubmissions: true,
    studentQuestions: true,
    classroomActivity: true,

    // Grading Defaults
    defaultGradingScale: '100',
    autoReturnGraded: true,
    allowLateSubmissions: true,
    lateSubmissionPenalty: 10,

    // Communication
    allowStudentMessages: true,
    allowParentMessages: true,
    autoResponseEnabled: false,
    preferredContactMethod: 'platform',
  });

  // Notification Preferences
  const [notifications, setNotifications] = useState({
    // Student Risk Alerts
    studentRiskAlerts: true,
    inactivityAlerts: true,
    performanceDropAlerts: true,

    // Assignment & Submissions
    newSubmissions: true,
    gradingReminders: true,
    dueDateReminders: true,

    // Communication
    studentMessages: true,
    parentMessages: true,
    adminAnnouncements: true,

    // Delivery Methods
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
  });

  // Privacy Settings
  const [privacy, setPrivacy] = useState({
    profileVisibility: 'school', // 'public', 'school', 'private'
    showContactInfo: false,
    allowStudentContact: true,
    allowParentContact: true,
    showActivity: true,
  });

  // TASK-025: Sync form state with backend preferences on load
  useEffect(() => {
    if (backendPreferences?.preferences) {
      const prefs = backendPreferences.preferences as Record<string, Record<string, unknown>>;

      // Sync teaching preferences
      if (prefs.teaching) {
        setTeachingPreferences((prev) => ({ ...prev, ...prefs.teaching }));
      }

      // Sync notification preferences
      if (prefs.notifications) {
        setNotifications((prev) => ({ ...prev, ...prefs.notifications }));
      }

      // Sync privacy settings
      if (prefs.privacy) {
        setPrivacy((prev) => ({ ...prev, ...prefs.privacy }));
      }
    }
  }, [backendPreferences]);

  // Handle Save
  const handleSave = async () => {
    if (!user?.id) {
      toast.error('Usuario no autenticado');
      return;
    }

    // TASK-028: Validate profile fields before save
    if (activeSection === 'profile') {
      if (profile.bio.length > 200) {
        toast.error('La biografía no puede exceder 200 caracteres');
        return;
      }
      if (!profile.displayName.trim()) {
        toast.error('El nombre a mostrar es requerido');
        return;
      }
    }

    setSaveStatus('saving');

    try {
      // Save profile based on active section
      if (activeSection === 'profile') {
        await profileAPI.updateProfile(user.id, {
          display_name: profile.displayName.trim(),
          first_name: profile.firstName.trim(),
          last_name: profile.lastName.trim(),
          bio: profile.bio.trim(),
        });
      }

      if (activeSection === 'teaching') {
        // Map teaching preferences to backend structure
        await profileAPI.updatePreferences(user.id, {
          preferences: {
            teaching: {
              newSubmissions: teachingPreferences.newSubmissions,
              lateSubmissions: teachingPreferences.lateSubmissions,
              studentQuestions: teachingPreferences.studentQuestions,
              classroomActivity: teachingPreferences.classroomActivity,
              defaultGradingScale: teachingPreferences.defaultGradingScale,
              autoReturnGraded: teachingPreferences.autoReturnGraded,
              allowLateSubmissions: teachingPreferences.allowLateSubmissions,
              lateSubmissionPenalty: teachingPreferences.lateSubmissionPenalty,
              allowStudentMessages: teachingPreferences.allowStudentMessages,
              allowParentMessages: teachingPreferences.allowParentMessages,
              autoResponseEnabled: teachingPreferences.autoResponseEnabled,
              preferredContactMethod: teachingPreferences.preferredContactMethod,
            },
          },
        } as TeacherPreferencesPayload);
      }

      if (activeSection === 'notifications') {
        // Map notification preferences to backend structure
        await profileAPI.updatePreferences(user.id, {
          email_notifications: notifications.emailNotifications,
          notifications_enabled: notifications.pushNotifications,
          preferences: {
            notifications: {
              studentRiskAlerts: notifications.studentRiskAlerts,
              inactivityAlerts: notifications.inactivityAlerts,
              performanceDropAlerts: notifications.performanceDropAlerts,
              newSubmissions: notifications.newSubmissions,
              gradingReminders: notifications.gradingReminders,
              dueDateReminders: notifications.dueDateReminders,
              studentMessages: notifications.studentMessages,
              parentMessages: notifications.parentMessages,
              adminAnnouncements: notifications.adminAnnouncements,
              inAppNotifications: notifications.inAppNotifications,
            },
          },
        } as TeacherPreferencesPayload);
      }

      if (activeSection === 'privacy') {
        // Map privacy settings to backend structure
        await profileAPI.updatePreferences(user.id, {
          preferences: {
            privacy: {
              profileVisibility: privacy.profileVisibility,
              showContactInfo: privacy.showContactInfo,
              allowStudentContact: privacy.allowStudentContact,
              allowParentContact: privacy.allowParentContact,
              showActivity: privacy.showActivity,
            },
          },
        } as TeacherPreferencesPayload);
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
    } catch (error: unknown) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      const message = error instanceof Error ? error.message : 'Error al guardar configuración';
      toast.error(message);

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
      // FIX-2026-01-19: Use camelCase from transformed API response
      setProfile({ ...profile, avatar: result.avatarUrl });

      // Reset progress después de 1 segundo
      setTimeout(() => {
        setUploadProgress(0);
        setIsUploading(false);
      }, 1000);
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      const message = error instanceof Error ? error.message : 'Error al subir avatar';
      toast.error(message);
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
      toast.error('Por favor complete todos los campos de contraseña');
      return;
    }

    if (account.newPassword !== account.confirmPassword) {
      toast.error('Las contraseñas no coinciden');
      return;
    }

    if (account.newPassword.length < 8) {
      toast.error('La contraseña debe tener al menos 8 caracteres');
      return;
    }

    setSaveStatus('saving');

    try {
      await profileAPI.updatePassword(user.id, {
        current_password: account.currentPassword,
        new_password: account.newPassword,
      });

      toast.success('Contraseña actualizada correctamente');
      setSaveStatus('saved');

      // Clear password fields
      setAccount({
        ...account,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      setSaveStatus('error');
      const message = error instanceof Error ? error.message : 'Error al cambiar contraseña';
      toast.error(message);

      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const sections = [
    { id: 'profile' as SettingsSection, label: 'Perfil', icon: User },
    { id: 'teaching' as SettingsSection, label: 'Preferencias de Enseñanza', icon: GraduationCap },
    { id: 'notifications' as SettingsSection, label: 'Notificaciones', icon: Bell },
    { id: 'privacy' as SettingsSection, label: 'Privacidad', icon: Shield },
  ];

  return (
    <TeacherPageShell>
    <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <DetectiveCard padding="sm">
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
                      <span className="text-sm">{section.label}</span>
                    </button>
                  );
                })}
              </nav>
            </DetectiveCard>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && (
              <ProfileSettingsSection
                profile={profile}
                setProfile={setProfile}
                account={account}
                setAccount={setAccount}
                showPassword={showPassword}
                setShowPassword={setShowPassword}
                isUploading={isUploading}
                uploadProgress={uploadProgress}
                saveStatus={saveStatus}
                handleSave={handleSave}
                handleAvatarUpload={handleAvatarUpload}
                handlePasswordChange={handlePasswordChange}
              />
            )}

            {activeSection === 'teaching' && (
              <TeachingPreferencesSection
                teachingPreferences={teachingPreferences}
                setTeachingPreferences={setTeachingPreferences}
                saveStatus={saveStatus}
                handleSave={handleSave}
              />
            )}

            {activeSection === 'notifications' && (
              <NotificationsSettingsSection
                notifications={notifications}
                setNotifications={setNotifications}
                saveStatus={saveStatus}
                handleSave={handleSave}
                navigate={navigate}
              />
            )}

            {activeSection === 'privacy' && (
              <PrivacySettingsSection
                privacy={privacy}
                setPrivacy={setPrivacy}
                saveStatus={saveStatus}
                handleSave={handleSave}
              />
            )}
          </div>
        </div>

        {/* Bottom Spacing */}
        <div className="h-16" />
      </div>
    </TeacherPageShell>
  );
}
