/**
 * AdminLtiPage - LTI Consumer Management Page
 *
 * Admin page for managing LTI (Learning Tools Interoperability) consumers.
 * Allows creating, editing, testing, and managing LMS integrations.
 *
 * Features:
 * - List of LTI consumers with status indicators
 * - Add/Edit consumer modal
 * - Connection test functionality
 * - Credential display and regeneration
 *
 * @module features/admin/lti/AdminLtiPage
 * @see ET-LTI-001-integration.md
 * @see EXT-007
 */

import React, { useState, useCallback, useMemo } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '@features/auth/hooks/useAuth';
import { AdminLayout } from '@/apps/admin/layouts/AdminLayout';
import { DetectiveCard } from '@shared/components/base/DetectiveCard';
import { DetectiveButton } from '@shared/components/base/DetectiveButton';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useLtiConsumers } from '@/apps/admin/hooks/useLtiConsumers';
import {
  LtiConsumerList,
  LtiConsumerForm,
  LtiCredentialsDisplay,
  ConnectionTestModal,
} from './components';
import {
  Shield,
  Plus,
  RefreshCw,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Link2,
} from 'lucide-react';
import type { LtiConsumer, CreateLtiConsumerDto } from '@/shared/types/lti.types';

/**
 * Stats card component for LTI metrics
 */
function StatsCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: number;
  icon: React.ElementType;
  color: string;
}) {
  return (
    <DetectiveCard hoverable={false}>
      <div className="flex items-center gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <p className="text-sm text-detective-text-secondary">{title}</p>
          <p className="text-2xl font-bold text-detective-text">{value}</p>
        </div>
      </div>
    </DetectiveCard>
  );
}

/**
 * AdminLtiPage Component
 */
export default function AdminLtiPage() {
  const { user, logout } = useAuth();

  // LTI consumers hook
  const {
    consumers,
    stats,
    loading,
    error,
    testingConnection,
    regeneratingCredentials,
    createConsumer,
    updateConsumer,
    activateConsumer,
    deactivateConsumer,
    testConnection,
    regenerateCredentials,
    refetch,
  } = useLtiConsumers();

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCredentialsOpen, setIsCredentialsOpen] = useState(false);
  const [isTestModalOpen, setIsTestModalOpen] = useState(false);
  const [selectedConsumer, setSelectedConsumer] = useState<LtiConsumer | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Gamification data for layout
  const { gamificationData, isLoading: gamificationLoading } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: gamificationLoading ? 0 : 1,
    totalXP: 0,
    mlCoins: 0,
    rank: gamificationLoading ? 'Loading...' : 'Ajaw',
    rankColor: '#9E9E9E',
    progressToNextLevel: 0,
    xpToNextLevel: 100,
    achievements: [],
    totalAchievements: 0,
  };

  // Calculate stats from consumers if backend stats not available
  const displayStats = useMemo(() => {
    if (stats) return stats;
    return {
      total: consumers.length,
      active: consumers.filter((c) => c.isActive).length,
      verified: consumers.filter((c) => c.isVerified).length,
    };
  }, [stats, consumers]);

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  // Form handlers
  const handleOpenCreateForm = useCallback(() => {
    setSelectedConsumer(null);
    setIsFormOpen(true);
  }, []);

  const handleOpenEditForm = useCallback((consumer: LtiConsumer) => {
    setSelectedConsumer(consumer);
    setIsFormOpen(true);
  }, []);

  const handleCloseForm = useCallback(() => {
    setIsFormOpen(false);
    setSelectedConsumer(null);
  }, []);

  const handleFormSubmit = useCallback(
    async (data: CreateLtiConsumerDto) => {
      setIsSubmitting(true);
      try {
        if (selectedConsumer) {
          await updateConsumer(selectedConsumer.id, data);
          toast.success('Consumer updated successfully');
        } else {
          await createConsumer(data);
          toast.success('Consumer created successfully');
        }
        handleCloseForm();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Operation failed';
        toast.error(message);
        throw err;
      } finally {
        setIsSubmitting(false);
      }
    },
    [selectedConsumer, createConsumer, updateConsumer, handleCloseForm]
  );

  // Activation handlers
  const handleActivate = useCallback(
    async (consumer: LtiConsumer) => {
      try {
        await activateConsumer(consumer.id);
        toast.success(`${consumer.platformName} activated`);
      } catch (_err) {
        toast.error('Failed to activate consumer');
      }
    },
    [activateConsumer]
  );

  const handleDeactivate = useCallback(
    async (consumer: LtiConsumer) => {
      try {
        await deactivateConsumer(consumer.id);
        toast.success(`${consumer.platformName} deactivated`);
      } catch (_err) {
        toast.error('Failed to deactivate consumer');
      }
    },
    [deactivateConsumer]
  );

  // Credentials handlers
  const handleViewCredentials = useCallback((consumer: LtiConsumer) => {
    setSelectedConsumer(consumer);
    setIsCredentialsOpen(true);
  }, []);

  const handleCloseCredentials = useCallback(() => {
    setIsCredentialsOpen(false);
    setSelectedConsumer(null);
  }, []);

  // Connection test handlers
  const handleOpenTestModal = useCallback((consumer: LtiConsumer) => {
    setSelectedConsumer(consumer);
    setIsTestModalOpen(true);
  }, []);

  const handleCloseTestModal = useCallback(() => {
    setIsTestModalOpen(false);
    setSelectedConsumer(null);
  }, []);

  return (
    <AdminLayout
      user={user || undefined}
      gamificationData={displayGamificationData}
      organizationName="GAMILIT Platform Admin"
      onLogout={handleLogout}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Link2 className="h-8 w-8 text-detective-orange" />
              <h1 className="text-3xl font-bold text-detective-text">LTI Integrations</h1>
            </div>
            <p className="mt-1 text-detective-text-secondary">
              Manage LMS integrations via Learning Tools Interoperability (LTI 1.3)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DetectiveButton variant="secondary" onClick={() => refetch()} disabled={loading}>
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="ml-2 hidden sm:inline">Refresh</span>
            </DetectiveButton>
            <DetectiveButton variant="primary" onClick={handleOpenCreateForm}>
              <Plus className="h-4 w-4" />
              <span className="ml-2">Add Consumer</span>
            </DetectiveButton>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatsCard
            title="Total Consumers"
            value={displayStats.total}
            icon={Shield}
            color="bg-detective-orange/20 text-detective-orange"
          />
          <StatsCard
            title="Active"
            value={displayStats.active}
            icon={CheckCircle}
            color="bg-green-500/20 text-green-500"
          />
          <StatsCard
            title="Verified"
            value={displayStats.verified}
            icon={AlertTriangle}
            color="bg-blue-500/20 text-blue-500"
          />
        </div>

        {/* Error Message */}
        {error && (
          <DetectiveCard className="border-red-500/30 bg-red-500/10">
            <div className="flex items-start gap-3">
              <XCircle className="h-5 w-5 flex-shrink-0 text-red-500" />
              <div>
                <p className="font-medium text-red-500">Error loading LTI consumers</p>
                <p className="mt-1 text-sm text-red-400">{error}</p>
              </div>
            </div>
          </DetectiveCard>
        )}

        {/* Consumer List */}
        <LtiConsumerList
          consumers={consumers}
          loading={loading}
          onEdit={handleOpenEditForm}
          onActivate={handleActivate}
          onDeactivate={handleDeactivate}
          onTestConnection={handleOpenTestModal}
          onViewCredentials={handleViewCredentials}
        />

        {/* Help Card */}
        <DetectiveCard className="border-detective-orange/30 bg-detective-orange/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 text-detective-orange" />
            <div>
              <h3 className="font-medium text-detective-text">LTI Integration Help</h3>
              <p className="mt-1 text-sm text-detective-text-secondary">
                To integrate GAMILIT with your LMS, you need to register GAMILIT as an LTI 1.3
                tool in your LMS admin panel. Click on any consumer to view the configuration
                URLs needed for setup.
              </p>
              <ul className="mt-2 list-inside list-disc text-sm text-detective-text-secondary">
                <li>For Canvas LMS, use Developer Keys configuration</li>
                <li>For Moodle, use External tool configuration</li>
                <li>For Blackboard, use LTI Tool Providers</li>
              </ul>
            </div>
          </div>
        </DetectiveCard>
      </div>

      {/* Modals */}
      <LtiConsumerForm
        consumer={selectedConsumer}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        isSubmitting={isSubmitting}
      />

      <LtiCredentialsDisplay
        consumer={selectedConsumer}
        isOpen={isCredentialsOpen}
        onClose={handleCloseCredentials}
        onRegenerateCredentials={regenerateCredentials}
        isRegenerating={regeneratingCredentials}
      />

      <ConnectionTestModal
        consumer={selectedConsumer}
        isOpen={isTestModalOpen}
        onClose={handleCloseTestModal}
        onTest={testConnection}
        isTesting={testingConnection}
      />
    </AdminLayout>
  );
}
