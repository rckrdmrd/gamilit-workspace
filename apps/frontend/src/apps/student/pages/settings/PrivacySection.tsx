/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { profileAPI } from '@/services/api/profileAPI';
import {
  PrivacySettingsForm,
  type PrivacyToggleItem,
} from '@shared/components/settings';
import type { SaveStatus } from '@shared/components/feedback/SaveButton';
import type { User } from '@/shared/types/auth.types';

interface PrivacySectionProps {
  user: User;
}

interface PrivacySettings {
  profileVisibility: string;
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  showActivity: boolean;
}

const DEFAULT_PRIVACY: PrivacySettings = {
  profileVisibility: 'public',
  showOnlineStatus: true,
  allowFriendRequests: true,
  showActivity: true,
};

export const PrivacySection: React.FC<PrivacySectionProps> = ({ user }) => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [loading, setLoading] = useState(true);
  const [privacy, setPrivacy] = useState<PrivacySettings>(DEFAULT_PRIVACY);

  // Load saved privacy preferences from backend on mount
  useEffect(() => {
    const load = async () => {
      try {
        const res = await profileAPI.getPreferences();
        const prefs = res.preferences as Record<string, any>;
        if (prefs?.privacy) {
          setPrivacy({
            profileVisibility: prefs.privacy.profileVisibility ?? prefs.privacy.profile_visibility ?? DEFAULT_PRIVACY.profileVisibility,
            showOnlineStatus: prefs.privacy.showOnlineStatus ?? prefs.privacy.show_online_status ?? DEFAULT_PRIVACY.showOnlineStatus,
            allowFriendRequests: prefs.privacy.allowFriendRequests ?? prefs.privacy.allow_friend_requests ?? DEFAULT_PRIVACY.allowFriendRequests,
            showActivity: prefs.privacy.showActivity ?? prefs.privacy.show_activity ?? DEFAULT_PRIVACY.showActivity,
          });
        }
      } catch {
        // Keep defaults on error
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // Load current preferences first, then merge privacy into them
      const currentRes = await profileAPI.getPreferences();
      const currentPrefs = (currentRes.preferences || {}) as Record<string, any>;

      await profileAPI.updatePreferences(user.id, {
        ...currentPrefs,
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

  // Build toggle items from student privacy state
  const toggles: PrivacyToggleItem[] = [
    {
      key: 'showOnlineStatus',
      label: 'Mostrar estado en linea',
      description: 'Tus amigos pueden ver cuando estas conectado',
      value: privacy.showOnlineStatus,
    },
    {
      key: 'allowFriendRequests',
      label: 'Permitir solicitudes de amistad',
      description: 'Cualquiera puede enviarte solicitudes de amistad',
      value: privacy.allowFriendRequests,
    },
    {
      key: 'showActivity',
      label: 'Mostrar actividad reciente',
      description: 'Tus amigos pueden ver tus actividades recientes',
      value: privacy.showActivity,
    },
  ];

  const handleToggleChange = (key: string, value: boolean) => {
    setPrivacy((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <PrivacySettingsForm
      subtitle="Controla quien puede ver tu perfil y actividad en la plataforma"
      profileVisibility={privacy.profileVisibility}
      onVisibilityChange={(val) => setPrivacy((prev) => ({ ...prev, profileVisibility: val }))}
      toggles={toggles}
      onToggleChange={handleToggleChange}
      saveStatus={saveStatus}
      onSave={handleSave}
      loading={loading}
    />
  );
};
