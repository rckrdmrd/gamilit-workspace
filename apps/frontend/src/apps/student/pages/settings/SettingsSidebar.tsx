import type { FC } from 'react';
import { User, Lock, Bell, Shield } from 'lucide-react';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { cn } from '@shared/utils/cn';

export type SettingsSection = 'profile' | 'account' | 'notifications' | 'privacy';

const SECTIONS: { id: SettingsSection; label: string; icon: FC<{ className?: string }> }[] = [
  { id: 'profile', label: 'Perfil', icon: User },
  { id: 'account', label: 'Cuenta', icon: Lock },
  { id: 'notifications', label: 'Notificaciones', icon: Bell },
  { id: 'privacy', label: 'Privacidad', icon: Shield },
];

interface SettingsSidebarProps {
  activeSection: SettingsSection;
  onSectionChange: (section: SettingsSection) => void;
}

export const SettingsSidebar = ({
  activeSection,
  onSectionChange,
}: SettingsSidebarProps) => (
  <DetectiveCard padding="sm">
    <nav className="space-y-1">
      {SECTIONS.map((section) => {
        const Icon = section.icon;
        const isActive = activeSection === section.id;

        return (
          <button
            key={section.id}
            onClick={() => onSectionChange(section.id)}
            className={cn(
              'flex w-full items-center gap-3 rounded-lg px-4 py-3 font-medium transition-all',
              isActive
                ? 'bg-gradient-to-r from-detective-orange to-orange-500 text-white shadow-md'
                : 'text-detective-text hover:bg-detective-bg',
            )}
          >
            <Icon className="h-5 w-5" />
            <span>{section.label}</span>
          </button>
        );
      })}
    </nav>
  </DetectiveCard>
);
