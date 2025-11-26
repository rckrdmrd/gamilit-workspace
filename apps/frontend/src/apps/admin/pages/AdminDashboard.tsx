/**
 * Admin Dashboard - Main Page
 *
 * Comprehensive admin dashboard with real-time system monitoring,
 * user management, analytics, and content moderation.
 *
 * Features:
 * - System health monitoring (auto-refresh every 10s)
 * - Key metrics display with trends
 * - Quick action buttons
 * - Recent admin actions log
 * - User activity charts
 * - System alerts panel
 * - Real-time updates
 * - Responsive design
 */

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { RefreshCw, ChevronDown } from 'lucide-react';
import {
  AdminDashboardHero,
  SystemMetricsGrid,
  QuickActionsGrid,
  RecentActionsTable,
  UserActivityChart,
  SystemAlertsPanel,
} from '../components/dashboard';
import { useAdminDashboard } from '../hooks/useAdminDashboard';

const AdminDashboard: React.FC = () => {
  // ============================================================================
  // HOOKS
  // ============================================================================

  const {
    systemHealth,
    metrics,
    recentActions,
    alerts,
    userActivity,
    loading,
    error,
    lastUpdated,
    refreshAll,
    dismissAlert,
    pauseRefresh,
    resumeRefresh,
    isPaused,
  } = useAdminDashboard();

  // ============================================================================
  // STATE
  // ============================================================================

  const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({
    metrics: false,
    actions: false,
    alerts: false,
    activity: false,
  });

  // ============================================================================
  // HANDLERS
  // ============================================================================

  const toggleSection = (section: string) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const handleRefreshAll = async () => {
    await refreshAll();
  };

  // ============================================================================
  // RENDER
  // ============================================================================

  return (
    <div className="min-h-screen bg-gradient-to-br from-detective-bg to-detective-bg-secondary">
      <GamifiedHeader
        user={{
          id: 'mock-admin-dashboard-id',
          email: 'admin@gamilit.com',
          role: 'super_admin',
          displayName: 'Admin Dashboard',
        }}
      />

      <main className="detective-container py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-detective-title mb-2">Admin Dashboard</h1>
              <p className="text-detective-base text-gray-400">
                Complete system management and monitoring
              </p>
            </div>

            <div className="flex items-center gap-4">
              {/* Last updated */}
              {lastUpdated && (
                <div className="text-detective-small text-gray-500">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </div>
              )}

              {/* Pause/Resume auto-refresh */}
              <button
                onClick={isPaused ? resumeRefresh : pauseRefresh}
                className={`rounded-lg px-4 py-2 transition-colors ${
                  isPaused
                    ? 'bg-green-500/20 text-green-500 hover:bg-green-500/30'
                    : 'bg-yellow-500/20 text-yellow-500 hover:bg-yellow-500/30'
                }`}
              >
                {isPaused ? 'Resume Auto-refresh' : 'Pause Auto-refresh'}
              </button>

              {/* Manual refresh */}
              <motion.button
                onClick={handleRefreshAll}
                disabled={loading}
                className={`flex items-center gap-2 rounded-lg bg-detective-orange px-4 py-2 transition-colors hover:bg-detective-orange-dark ${
                  loading ? 'cursor-not-allowed opacity-50' : ''
                }`}
                whileHover={!loading ? { scale: 1.05 } : {}}
                whileTap={!loading ? { scale: 0.95 } : {}}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                <span>Refresh All</span>
              </motion.button>
            </div>
          </div>

          {/* Error display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-red-500/30 bg-red-500/10 p-4"
            >
              <p className="text-detective-base text-red-500">Error: {error}</p>
            </motion.div>
          )}
        </div>

        {/* System Health Banner */}
        <div className="mb-8">
          <AdminDashboardHero
            health={systemHealth}
            loading={loading}
            onRefresh={handleRefreshAll}
          />
        </div>

        {/* Key Metrics Grid */}
        <CollapsibleSection
          title="Key Metrics"
          subtitle="System statistics and growth trends"
          isCollapsed={collapsedSections.metrics}
          onToggle={() => toggleSection('metrics')}
        >
          <SystemMetricsGrid metrics={metrics} loading={loading} />
        </CollapsibleSection>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-detective-subtitle mb-4">Quick Actions</h2>
          <QuickActionsGrid flaggedContent={metrics?.flaggedContentCount} />
        </div>

        {/* Two Column Layout: Recent Actions & Alerts */}
        <div className="mb-8 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Recent Actions */}
          <CollapsibleSection
            title="Recent Admin Actions"
            subtitle="Audit log of administrative activities"
            isCollapsed={collapsedSections.actions}
            onToggle={() => toggleSection('actions')}
          >
            <RecentActionsTable
              actions={recentActions}
              loading={loading}
              onRefresh={handleRefreshAll}
            />
          </CollapsibleSection>

          {/* System Alerts */}
          <CollapsibleSection
            title="System Alerts"
            subtitle={`${alerts.length} active alerts`}
            isCollapsed={collapsedSections.alerts}
            onToggle={() => toggleSection('alerts')}
          >
            <SystemAlertsPanel alerts={alerts} loading={loading} onDismiss={dismissAlert} />
          </CollapsibleSection>
        </div>

        {/* User Activity Chart */}
        <CollapsibleSection
          title="User Activity"
          subtitle="Activity trends over the last 7 days"
          isCollapsed={collapsedSections.activity}
          onToggle={() => toggleSection('activity')}
        >
          <UserActivityChart data={userActivity} loading={loading} />
        </CollapsibleSection>

        {/* System Status Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 rounded-lg border border-gray-700 bg-detective-bg-secondary p-6"
        >
          <div className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
            <div>
              <p className="text-detective-small mb-1 text-gray-400">System Status</p>
              <p
                className={`text-detective-base font-semibold ${
                  systemHealth?.status === 'healthy'
                    ? 'text-green-500'
                    : systemHealth?.status === 'degraded'
                      ? 'text-yellow-500'
                      : 'text-red-500'
                }`}
              >
                {systemHealth?.status?.toUpperCase() || 'UNKNOWN'}
              </p>
            </div>
            <div>
              <p className="text-detective-small mb-1 text-gray-400">Active Sessions</p>
              <p className="text-detective-base font-semibold text-detective-orange">
                {metrics?.activeSessions || 0}
              </p>
            </div>
            <div>
              <p className="text-detective-small mb-1 text-gray-400">Pending Alerts</p>
              <p className="text-detective-base font-semibold text-detective-orange">
                {alerts.length}
              </p>
            </div>
            <div>
              <p className="text-detective-small mb-1 text-gray-400">Auto-Refresh</p>
              <p
                className={`text-detective-base font-semibold ${
                  isPaused ? 'text-yellow-500' : 'text-green-500'
                }`}
              >
                {isPaused ? 'PAUSED' : 'ACTIVE'}
              </p>
            </div>
          </div>
        </motion.div>
      </main>
    </div>
  );
};

// ============================================================================
// COLLAPSIBLE SECTION COMPONENT
// ============================================================================

interface CollapsibleSectionProps {
  title: string;
  subtitle?: string;
  isCollapsed: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
  title,
  subtitle,
  isCollapsed,
  onToggle,
  children,
}) => {
  return (
    <div className="mb-8">
      <div
        className="group mb-4 flex cursor-pointer items-center justify-between"
        onClick={onToggle}
      >
        <div>
          <h2 className="text-detective-subtitle transition-colors group-hover:text-detective-orange">
            {title}
          </h2>
          {subtitle && <p className="text-detective-small text-gray-400">{subtitle}</p>}
        </div>
        <motion.div animate={{ rotate: isCollapsed ? 0 : 180 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="h-5 w-5 text-gray-400 transition-colors group-hover:text-detective-orange" />
        </motion.div>
      </div>

      <motion.div
        initial={false}
        animate={{
          height: isCollapsed ? 0 : 'auto',
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        {children}
      </motion.div>
    </div>
  );
};

export default AdminDashboard;
