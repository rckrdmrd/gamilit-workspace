import { useState } from 'react';
import { GeneralSettings, SecuritySettings } from '../components/settings';
import { ProfileSettings } from '../components/settings/ProfileSettings';
import { AdminPageShell } from '../components/shared';
import { AdminTabBar, type AdminTab } from '../components/shared';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { AlertTriangle, Settings, Shield, User } from 'lucide-react';

type TabType = 'general' | 'security' | 'profile';

const TABS: AdminTab<TabType>[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Configuración general del sistema y mantenimiento',
    icon: Settings,
  },
  {
    id: 'security',
    label: 'Seguridad',
    description: 'Autenticación, sesiones y políticas de seguridad',
    icon: Shield,
  },
  {
    id: 'profile',
    label: 'Mi Perfil',
    description: 'Gestionar mi cuenta de administrador',
    icon: User,
  },
];

/**
 * AdminSettingsPage - System Configuration Management
 * Allows administrators to configure general system settings and security policies
 *
 * Features:
 * - General settings (registrations, maintenance mode, maintenance message)
 * - Security settings (login attempts, lockout duration, session timeout)
 *
 * Architecture:
 * - Uses GeneralSettings and SecuritySettings components
 * - Each component uses useSystemConfig hook for category-based config management
 * - Connects to backend endpoints: GET/PUT /admin/system/config/:category
 *
 * Updated: 2025-11-29 - Fixed theme consistency (detective theme), integrated useUserGamification
 * Updated: 2025-11-28 - Enabled feature (SHOW_CONTENT = true), documented architecture
 * Updated: 2025-11-25 - Added SHOW_CONTENT flag to preserve code while showing Under Construction
 */
export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'security':
        return <SecuritySettings />;
      case 'profile':
        return <ProfileSettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-detective-text">Configuración del Sistema</h1>
          <p className="mt-1 text-detective-text-secondary">
            Gestiona la configuración global y políticas de seguridad
          </p>
        </div>

        {/* Tabs Navigation */}
        <AdminTabBar tabs={TABS} activeTab={activeTab} onTabChange={setActiveTab} variant="underline" />

        {/* Tab Content */}
        <div className="transition-all duration-200">{renderTabContent()}</div>

        {/* Info Footer */}
        <DetectiveCard className="border-detective-orange/30 bg-detective-orange/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-detective-orange" />
            <div>
              <h3 className="text-sm font-medium text-detective-text">
                Cambios en la Configuración
              </h3>
              <p className="mt-1 text-sm text-detective-text-secondary">
                Los cambios en la configuración del sistema pueden afectar a todos los usuarios.
                Por favor revise cuidadosamente antes de guardar. Algunos cambios pueden requerir
                que los usuarios vuelvan a iniciar sesión o limpien su caché.
              </p>
            </div>
          </div>
        </DetectiveCard>
      </div>
    </AdminPageShell>
  );
}
