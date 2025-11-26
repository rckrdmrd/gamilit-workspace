/**
 * AdminAnalyticsPage - Comprehensive Analytics Dashboard
 *
 * Complete analytics page for admin portal featuring:
 * - Overview tab with key metrics and activity timeline
 * - Engagement tab with user segment analysis
 * - Gamification tab with XP, ranks, and levels distribution
 * - Retention tab with cohort analysis
 * - Export functionality to CSV
 * - Refresh capability
 *
 * Integrates with 7 backend REST endpoints:
 * - GET /admin/analytics/overview
 * - GET /admin/analytics/engagement
 * - GET /admin/analytics/gamification
 * - GET /admin/analytics/activity-timeline
 * - GET /admin/analytics/top-users
 * - GET /admin/analytics/retention
 * - GET /admin/analytics/export
 *
 * @author Frontend-Developer Agent
 * @date 2025-11-24
 * @component
 */

import { useState } from 'react';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '../layouts/AdminLayout';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useAnalytics } from '../hooks/useAnalytics';

// Components
import { OverviewTab } from '../components/analytics/OverviewTab';
import { EngagementTab } from '../components/analytics/EngagementTab';
import { GamificationTab } from '../components/analytics/GamificationTab';
import { RetentionTab } from '../components/analytics/RetentionTab';

// Icons
import { TrendingUp, RefreshCw, Download, BarChart3, Users, Award, Target } from 'lucide-react';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';

// Types
type TabType = 'overview' | 'engagement' | 'gamification' | 'retention';

interface TabConfig {
  id: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
  badge?: string;
  badgeTooltip?: string;
}

/**
 * AdminAnalyticsPage Component
 */
export default function AdminAnalyticsPage() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExporting, setIsExporting] = useState(false);

  // Gamification data
  const { gamificationData } = useUserGamification(user?.id);
  const displayGamificationData = gamificationData || {
    userId: user?.id || 'mock-admin-id',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  // Analytics hook
  const {
    overview,
    engagement,
    gamification,
    activityTimeline,
    topUsers,
    retention,
    isLoading,
    error,
    refresh,
    exportToCSV,
  } = useAnalytics();

  // Handlers
  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportToCSV();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      alert('Error al exportar CSV. Por favor, intenta nuevamente.');
    } finally {
      setIsExporting(false);
    }
  };

  // Tab configuration
  const tabs: TabConfig[] = [
    {
      id: 'overview' as TabType,
      label: 'General',
      icon: BarChart3,
      description: 'Vista general y métricas principales',
    },
    {
      id: 'engagement' as TabType,
      label: 'Engagement',
      icon: Users,
      description: 'Análisis de participación por segmento',
      badge: 'Datos limitados',
      badgeTooltip:
        'Este análisis está basado en datos históricos limitados. A medida que el sistema acumule más información, los resultados serán más precisos.',
    },
    {
      id: 'gamification' as TabType,
      label: 'Gamificación',
      icon: Award,
      description: 'XP, rangos y niveles',
    },
    {
      id: 'retention' as TabType,
      label: 'Retención',
      icon: Target,
      description: 'Análisis de cohortes',
      badge: 'Beta',
      badgeTooltip:
        'El análisis de retención requiere un período mínimo de 30 días de datos históricos. Los resultados mostrados son preliminares.',
    },
  ];

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-detective-orange" />
              <h1 className="text-3xl font-bold text-detective-text">Analíticas</h1>
            </div>
            <p className="text-detective-text-secondary">
              Análisis completo de usuarios, engagement, gamificación y retención
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <DetectiveButton
              variant="secondary"
              onClick={handleExport}
              disabled={isExporting || isLoading}
            >
              <Download className={`h-5 w-5 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exportando...' : 'Exportar CSV'}
            </DetectiveButton>

            <DetectiveButton variant="primary" onClick={refresh} disabled={isLoading}>
              <RefreshCw className={`h-5 w-5 ${isLoading ? 'animate-spin' : ''}`} />
              Actualizar
            </DetectiveButton>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500">
            <p className="font-semibold">Error al cargar analíticas:</p>
            <p>{error}</p>
          </div>
        )}

        {/* Tabs Navigation */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-lg border-2 p-4 transition-all ${
                  isActive
                    ? 'border-detective-orange bg-detective-orange/10'
                    : 'border-detective-border bg-detective-bg-secondary hover:border-detective-orange/50'
                }`}
              >
                <div className="mb-2 flex items-center gap-3">
                  <Icon
                    className={`h-6 w-6 ${
                      isActive ? 'text-detective-orange' : 'text-detective-text-secondary'
                    }`}
                  />
                  <span
                    className={`font-semibold ${
                      isActive ? 'text-detective-orange' : 'text-detective-text'
                    }`}
                  >
                    {tab.label}
                  </span>
                  {tab.badge && (
                    <div className="group relative">
                      <span className="ml-1 cursor-help rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                        {tab.badge}
                      </span>
                      {tab.badgeTooltip && (
                        <div className="pointer-events-none absolute -top-2 left-full z-10 ml-2 hidden w-64 rounded-lg bg-gray-900 p-3 text-xs text-white shadow-lg group-hover:block">
                          <div className="absolute -left-1 top-3 h-2 w-2 rotate-45 transform bg-gray-900"></div>
                          {tab.badgeTooltip}
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="text-left text-sm text-detective-text-secondary">{tab.description}</p>
              </button>
            );
          })}
        </div>

        {/* Loading State */}
        {isLoading && (
          <DetectiveCard className="p-12">
            <div className="flex flex-col items-center justify-center gap-4">
              <RefreshCw className="h-12 w-12 animate-spin text-detective-orange" />
              <p className="text-detective-text-secondary">Cargando analíticas...</p>
            </div>
          </DetectiveCard>
        )}

        {/* Tab Content */}
        {!isLoading && (
          <div className="min-h-[400px]">
            {activeTab === 'overview' && (
              <OverviewTab
                overview={overview}
                activityTimeline={activityTimeline}
                topUsers={topUsers}
              />
            )}

            {activeTab === 'engagement' && <EngagementTab engagement={engagement} />}

            {activeTab === 'gamification' && <GamificationTab gamification={gamification} />}

            {activeTab === 'retention' && <RetentionTab retention={retention} />}
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
