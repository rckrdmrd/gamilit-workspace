import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { GeneralSettings, SecuritySettings } from '../components/settings';
import { UnderConstruction } from '@shared/components/common';

// Feature flag - set to true when ready to show actual content
const SHOW_CONTENT = false;

type TabType = 'general' | 'security';

interface Tab {
  id: TabType;
  label: string;
  description: string;
}

const TABS: Tab[] = [
  {
    id: 'general',
    label: 'General',
    description: 'System-wide configuration and maintenance settings',
  },
  {
    id: 'security',
    label: 'Security',
    description: 'Authentication, sessions, and security policies',
  },
];

/**
 * AdminSettingsPage - System Configuration Management
 * Allows administrators to configure general system settings and security policies
 *
 * Estado: EN CONSTRUCCIÓN
 * Esta página incluirá la configuración del sistema:
 * - Configuraciones generales
 * - Configuraciones de seguridad
 *
 * Updated: 2025-11-25 - Added SHOW_CONTENT flag to preserve code while showing Under Construction
 */
export default function AdminSettingsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('general');

  const gamificationData = {
    userId: user?.id || 'mock-admin-id',
    level: 20,
    totalXP: 5000,
    mlCoins: 2500,
    rank: 'Super Admin',
    achievements: ['admin_master', 'config_master'],
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
      gamificationData={gamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      {SHOW_CONTENT ? (
        <div className="p-6">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
            <p className="mt-1 text-gray-600">Manage system-wide settings and configuration</p>
          </div>

          {/* Tabs Navigation */}
          <div className="mb-6 rounded-lg bg-white shadow-sm">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex" aria-label="Tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`
                      border-b-2 px-6 py-4 text-sm font-medium transition-colors
                      ${
                        activeTab === tab.id
                          ? 'border-blue-600 text-blue-600'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }
                    `}
                  >
                    <div className="flex flex-col items-start">
                      <span>{tab.label}</span>
                      <span className="mt-0.5 text-xs font-normal text-gray-500">
                        {tab.description}
                      </span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="transition-all duration-200">{renderTabContent()}</div>

          {/* Info Footer */}
          <div className="mt-6 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">Configuration Changes</h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Changes to system configuration may affect all users. Please review carefully
                    before saving. Some changes may require users to re-login or clear their cache.
                  </p>
                </div>
              </div>
            </div>
          </div>
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
