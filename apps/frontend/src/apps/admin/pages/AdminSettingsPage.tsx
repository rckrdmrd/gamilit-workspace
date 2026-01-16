import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { GeneralSettings, SecuritySettings } from '../components/settings';
import { UnderConstruction } from '@/shared/components/UnderConstruction';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { AlertTriangle, Settings, Shield } from 'lucide-react';

// Feature flag - set to true when ready to show actual content
const SHOW_CONTENT = true;

type TabType = 'general' | 'security';

interface Tab {
  id: TabType;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const TABS: Tab[] = [
  {
    id: 'general',
    label: 'General',
    description: 'Configuración general del sistema y mantenimiento',
    icon: <Settings className="h-4 w-4" />,
  },
  {
    id: 'security',
    label: 'Seguridad',
    description: 'Autenticación, sesiones y políticas de seguridad',
    icon: <Shield className="h-4 w-4" />,
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
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Use useUserGamification hook with real API endpoint
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  // Fallback gamification data while loading or if data not available
  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Cargando...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSettings />;
      case 'security':
        return <SecuritySettings />;
      default:
        return <GeneralSettings />;
    }
  };

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      {SHOW_CONTENT ? (
        <div className="space-y-6">
          {/* Header */}
          <div>
            <h1 className="text-3xl font-bold text-detective-text">Configuración del Sistema</h1>
            <p className="mt-1 text-detective-text-secondary">
              Gestiona la configuración global y políticas de seguridad
            </p>
          </div>

          {/* Tabs Navigation */}
          <DetectiveCard>
            <div className="border-detective-border border-b">
              <nav className="-mb-px flex" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      flex items-center gap-2 border-b-2 px-6 py-4 text-sm font-medium transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-detective-orange text-detective-orange'
                          : 'border-transparent text-detective-text-secondary hover:border-detective-orange/50 hover:text-detective-text'
                      }
                    `}
                  >
                    {tab.icon}
                    <div className="flex flex-col items-start">
                      <span>{tab.label}</span>
                      <span className="mt-0.5 text-xs font-normal text-detective-text-secondary">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </DetectiveCard>

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
      ) : (
        <UnderConstruction
          variant="page"
          feature="Configuración del Sistema"
          description="Esta sección incluirá configuraciones generales del sistema y políticas de seguridad. Permite configurar ajustes globales, autenticación, sesiones y políticas de seguridad."
          estimatedDate="Fase 2 - Q2 2026"
        />
      )}
    </AdminLayout>
  );
}
