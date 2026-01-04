/**
 * MissionsPage - Complete Missions Hub for GLIT Platform
 *
 * Full-featured missions page with:
 * - Hero section with stats
 * - Tab navigation (Daily, Weekly, Special)
 * - Mission cards grid with animations
 * - Active mission tracker sidebar
 * - Rewards preview
 * - Real-time updates
 * - Responsive design
 * - Confetti on claim
 *
 * Route: /student/missions
 */

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import type {
  MissionStatus,
  MissionType,
} from '@/features/gamification/missions/types/missionsTypes';

// Components
import { GamifiedHeader } from '@shared/components/layout/GamifiedHeader';
import { MissionTabs } from '@/features/gamification/missions/components/MissionTabs';
import { MissionGrid } from '@/features/gamification/missions/components/MissionGrid';
import { ActiveMissionTracker } from '@/features/gamification/missions/components/ActiveMissionTracker';
import { RewardsPreview } from '@/features/gamification/missions/components/RewardsPreview';

// Hooks
import { useMissions } from '@/features/gamification/missions/hooks/useMissions';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { useUserGamification } from '@shared/hooks/useUserGamification';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import toast from 'react-hot-toast';

export default function MissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user, logout } = useAuth();

  // Use useUserGamification hook (currently with mock data until backend endpoint is ready)
  const { gamificationData } = useUserGamification(user?.id);

  // Dashboard invalidation hook - FIX: Invalidate cache after claiming missions
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Get tab from URL or default to 'daily'
  const tabFromUrl = (searchParams.get('tab') as MissionType) || 'daily';

  // Hook
  const {
    dailyMissions,
    weeklyMissions,
    specialMissions,
    activeMissions,
    currentTab,
    setCurrentTab,
    startMission,
    claimReward,
    trackMission,
    untrackMission,
    isTracked,
    rewardsSummary,
    loading,
    error,
    refresh,
  } = useMissions();

  // Status filter
  const [statusFilter, setStatusFilter] = useState<MissionStatus | 'all'>('all');

  // Initialize tab from URL
  useEffect(() => {
    if (tabFromUrl !== currentTab) {
      setCurrentTab(tabFromUrl);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tabFromUrl]);

  // Update URL when tab changes
  const handleTabChange = (tab: MissionType) => {
    setCurrentTab(tab);
    setSearchParams({ tab });
  };

  // Get current missions based on tab
  const currentMissions = useMemo(() => {
    switch (currentTab) {
      case 'daily':
        return dailyMissions;
      case 'weekly':
        return weeklyMissions;
      case 'special':
        return specialMissions;
      default:
        return dailyMissions;
    }
  }, [currentTab, dailyMissions, weeklyMissions, specialMissions]);

  // Handle mission start
  const handleStartMission = async (missionId: string) => {
    const result = await startMission(missionId);
    if (result.success) {
      // Auto-track on start
      trackMission(missionId);
      toast.success('¡Misión iniciada! Buena suerte');
    } else {
      toast.error(result.message || 'Error al iniciar la misión');
      console.error(result.message);
    }
  };

  // Handle claim reward
  const handleClaimReward = async (missionId: string) => {
    const result = await claimReward(missionId);
    if (result.success) {
      // FIX: Invalidate dashboard cache to update coins and XP
      await syncAndInvalidate();

      // Show success toast with rewards
      const rewardsText = result.rewards
        ? `+${result.rewards.mlCoins || 0} ML Coins, +${result.rewards.xp || 0} XP`
        : '';
      toast.success(`¡Recompensa reclamada! ${rewardsText}`);
    } else {
      toast.error(result.message || 'Error al reclamar recompensa');
      console.error(result.message);
    }
  };

  // Empty message based on tab and filter
  const getEmptyMessage = () => {
    if (statusFilter !== 'all') {
      return `No hay misiones con estado "${statusFilter}"`;
    }

    switch (currentTab) {
      case 'daily':
        return '¡Vuelve mañana para nuevas misiones diarias!';
      case 'weekly':
        return 'Nuevas misiones semanales el próximo lunes';
      case 'special':
        return 'No hay eventos especiales activos actualmente';
      default:
        return 'No hay misiones disponibles';
    }
  };

  // Check if all missions completed
  const allCompleted = currentMissions.every((m) => m.status === 'claimed');

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100">
      {/* Header siempre visible */}
      <GamifiedHeader
        user={user || undefined}
        gamificationData={gamificationData}
        onLogout={async () => {
          await logout();
          // No need to navigate - performLogout() handles redirect
        }}
      />

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-lg border-2 border-red-300 bg-red-50 p-4 text-red-800"
          >
            <p className="font-semibold">{error}</p>
            <button onClick={refresh} className="mt-2 text-sm underline hover:no-underline">
              Reintentar
            </button>
          </motion.div>
        )}

        {/* Tabs Navigation */}
        <MissionTabs
          currentTab={currentTab}
          onTabChange={handleTabChange}
          dailyMissions={dailyMissions}
          weeklyMissions={weeklyMissions}
          specialMissions={specialMissions}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />

        {/* All Completed Banner */}
        {allCompleted && currentMissions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mb-6 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 p-6 text-center text-white"
          >
            <h3 className="mb-2 text-2xl font-bold">¡Increíble! 🎉</h3>
            <p className="text-lg">
              Has completado todas las misiones{' '}
              {currentTab === 'daily'
                ? 'diarias'
                : currentTab === 'weekly'
                  ? 'semanales'
                  : 'especiales'}
            </p>
          </motion.div>
        )}

        {/* Main Grid + Sidebar Layout */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Missions Grid (Left - 2 cols on desktop) */}
          <div className="lg:col-span-2">
            <MissionGrid
              missions={currentMissions}
              loading={loading}
              statusFilter={statusFilter}
              onStartMission={handleStartMission}
              onClaimReward={handleClaimReward}
              onTrackMission={trackMission}
              isTracked={isTracked}
              emptyMessage={getEmptyMessage()}
            />
          </div>

          {/* Active Mission Tracker (Right - 1 col on desktop) */}
          <div className="lg:col-span-1">
            <ActiveMissionTracker
              trackedMissions={activeMissions}
              onClaim={handleClaimReward}
              onUntrack={untrackMission}
            />
          </div>
        </div>

        {/* Rewards Preview Banner */}
        {currentMissions.length > 0 && (
          <RewardsPreview summary={rewardsSummary} currentTab={currentTab} />
        )}
      </div>

      {/* Bottom Spacing */}
      <div className="h-16" />
    </div>
  );
}
