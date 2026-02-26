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

import { useState, useEffect } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import { useApiError } from '@shared/hooks';

// Components
import { AdminPageShell } from '../components/shared';
import { AdminTabBar, type AdminTab } from '../components/shared';
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

/**
 * AdminAnalyticsPage Component
 */
export default function AdminAnalyticsPage() {
  const { handleError } = useApiError();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

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

  const handleExport = async () => {
    setIsExporting(true);
    setToast(null);
    try {
      await exportToCSV();
      setToast({ type: 'success', message: 'CSV exportado exitosamente' });
    } catch (err) {
      handleError(err, 'Error al exportar CSV');
    } finally {
      setIsExporting(false);
    }
  };

  // Auto-dismiss toast after 5 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Tab configuration
  const tabs: AdminTab<TabType>[] = [
    {
      id: 'overview',
      label: 'General',
      icon: BarChart3,
      description: 'Vista general y métricas principales',
    },
    {
      id: 'engagement',
      label: 'Engagement',
      icon: Users,
      description: 'Análisis de participación por segmento',
      badge: 'Datos limitados',
      badgeTooltip:
        'Este análisis está basado en datos históricos limitados. A medida que el sistema acumule más información, los resultados serán más precisos.',
    },
    {
      id: 'gamification',
      label: 'Gamificación',
      icon: Award,
      description: 'XP, rangos y niveles',
    },
    {
      id: 'retention',
      label: 'Retención',
      icon: Target,
      description: 'Análisis de cohortes',
      badge: 'Beta',
      badgeTooltip:
        'El análisis de retención requiere un período mínimo de 30 días de datos históricos. Los resultados mostrados son preliminares.',
    },
  ];

  return (
    <AdminPageShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-detective-orange" />
              <h1 className="text-2xl sm:text-3xl font-bold text-detective-text">Analíticas</h1>
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
        <div aria-live="polite">
          {error && (
            <div className="rounded-lg border border-red-500/50 bg-red-500/20 p-4 text-red-500" role="alert">
              <p className="font-semibold">Error al cargar analiticas:</p>
              <p>{error}</p>
            </div>
          )}
        </div>

        {/* Toast Notification */}
        <div aria-live="polite">
          {toast && (
            <div
              className={`rounded-lg border p-4 ${
                toast.type === 'success'
                  ? 'border-green-500/50 bg-green-500/20 text-green-400'
                  : 'border-red-500/50 bg-red-500/20 text-red-400'
              }`}
              role="status"
            >
              <div className="flex items-center justify-between">
                <span>{toast.message}</span>
                <button onClick={() => setToast(null)} className="ml-4 hover:opacity-70" aria-label="Cerrar notificacion">
                  <span aria-hidden="true">&#10005;</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Tabs Navigation */}
        <AdminTabBar tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} variant="cards" />

        {/* Loading State */}
        {isLoading && (
          <DetectiveCard className="p-12">
            <div className="flex flex-col items-center justify-center gap-4" aria-live="polite">
              <RefreshCw className="h-12 w-12 animate-spin text-detective-orange" />
              <p className="text-detective-text-secondary">Cargando analiticas...</p>
            </div>
          </DetectiveCard>
        )}

        {/* Tab Content */}
        {!isLoading && (
          <div className="min-h-[400px]" role="region" aria-label={`Contenido de pestana: ${tabs.find(t => t.id === activeTab)?.label ?? activeTab}`}>
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
    </AdminPageShell>
  );
}
