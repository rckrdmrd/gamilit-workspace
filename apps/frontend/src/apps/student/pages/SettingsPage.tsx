import { useState } from 'react';
import { useAuth } from '@/app/providers/AuthContext';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { SettingsSidebar, type SettingsSection } from './settings/SettingsSidebar';
import { ProfileSection } from './settings/ProfileSection';
import { AccountSection } from './settings/AccountSection';
import { NotificationsSection } from './settings/NotificationsSection';
import { PrivacySection } from './settings/PrivacySection';

export default function SettingsPage() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      <GamifiedHeader
        user={user}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
        }}
      />

      {/* Hero banner */}
      <div className="bg-gradient-to-r from-detective-orange/10 via-orange-100/50 to-detective-gold/10 px-4 py-6">
        <div className="mx-auto flex max-w-7xl items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full border-3 border-detective-orange/40 bg-gradient-to-br from-detective-orange to-detective-gold shadow-md">
            <img
              src={
                user.avatar_url ||
                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user.displayName || user.email)}`
              }
              alt="Avatar"
              className="h-full w-full object-cover"
            />
          </div>
          <div>
            <h1 className="text-xl font-bold text-detective-text">
              {user.displayName || user.email?.split('@')[0]}
            </h1>
            {gamificationData && (
              <p className="text-sm text-detective-text-secondary">
                {gamificationData.rank || 'Explorador'} &middot;{' '}
                Nivel {gamificationData.level ?? 1}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-4">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <SettingsSidebar
              activeSection={activeSection}
              onSectionChange={setActiveSection}
            />
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeSection === 'profile' && <ProfileSection user={user} />}
            {activeSection === 'account' && <AccountSection user={user} />}
            {activeSection === 'notifications' && <NotificationsSection />}
            {activeSection === 'privacy' && <PrivacySection user={user} />}
          </div>
        </div>

        <div className="h-16" />
      </div>
    </div>
  );
}
