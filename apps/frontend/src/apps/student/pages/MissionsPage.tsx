/**
 * MissionsPage - Complete Missions Hub for GLIT Platform
 *
 * Full-featured missions page with:
 * - Hero section with stats
 * - Tab navigation (Daily, Weekly)
 * - Mission cards grid with animations
 * - Active mission tracker sidebar
 * - Rewards preview
 * - Real-time updates
 * - Responsive design
 * - Confetti on claim
 *
 * Route: /student/missions
 */

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type {
  Mission,
  MissionStatus,
  MissionType,
} from '@/features/gamification/missions/types/missionsTypes';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';
import { MissionTabs } from '@/features/gamification/missions/components/MissionTabs';
import { MissionGrid } from '@/features/gamification/missions/components/MissionGrid';
import { ActiveMissionTracker } from '@/features/gamification/missions/components/ActiveMissionTracker';
import { RewardsPreview } from '@/features/gamification/missions/components/RewardsPreview';
import { MissionDetailModal } from '@/features/gamification/missions/components/MissionDetailModal';

// Hooks
import { useMissions } from '@/features/gamification/missions/hooks/useMissions';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import toast from 'react-hot-toast';

export default function MissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Mission detail modal state
  const [selectedMission, setSelectedMission] = useState<Mission | null>(null);

  // Dashboard invalidation hook - FIX: Invalidate cache after claiming missions
  const { syncAndInvalidate } = useInvalidateDashboard();

  // Handle card click to show detail modal
  const handleCardClick = (mission: Mission) => setSelectedMission(mission);

  // Get tab from URL or default to 'daily'. Redirect 'special' to 'daily' — tab removed from UI.
  const rawTab = searchParams.get('tab') as MissionType | null;
  const tabFromUrl: 'daily' | 'weekly' =
    rawTab === 'daily' || rawTab === 'weekly' ? rawTab : 'daily';

  // Hook
  const {
    dailyMissions,
    weeklyMissions,
    activeMissions,
    allMissions,
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
  const handleTabChange = (tab: 'daily' | 'weekly') => {
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
      default:
        return dailyMissions;
    }
  }, [currentTab, dailyMissions, weeklyMissions]);

  /**
   * Navigate to the exercise linked to a mission via exercise_id.
   * Special-missions module routing removed — 'special' tab is hidden from UI.
   */
  const navigateToMissionExercise = useCallback(
    (missionId: string) => {
      const mission = allMissions.find((m) => m.id === missionId);
      if (!mission) return;

      // Direct exercise link via exercise_id
      if (mission.exercise_id) {
        navigate(`/exercises/${mission.exercise_id}`);
      }
    },
    [allMissions, navigate],
  );

  // Handle mission start
  const handleStartMission = async (missionId: string) => {
    const result = await startMission(missionId);
    if (result.success) {
      // Auto-track on start
      trackMission(missionId);
      toast.success('Mision iniciada! Buena suerte');

      // Navigate to exercise if mission has a direct exercise link
      const mission = allMissions.find((m) => m.id === missionId);
      if (mission?.exercise_id) {
        navigate(`/exercises/${mission.exercise_id}`);
      }
    } else {
      toast.error(result.message || 'Error al iniciar la mision');
      console.error(result.message);
    }
  };

  // Handle navigating to exercise for an in-progress special mission
  const handleGoToExercise = useCallback(
    (missionId: string) => {
      navigateToMissionExercise(missionId);
    },
    [navigateToMissionExercise],
  );

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
      default:
        return 'No hay misiones disponibles';
    }
  };

  // Check if all missions completed
  const allCompleted = currentMissions.every((m) => m.status === 'claimed');

  return (
    <StudentPageShell>
      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Error Display */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            role="alert"
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
              {currentTab === 'daily' ? 'diarias' : 'semanales'}
            </p>
          </motion.div>
        )}

        {/* Main Grid + Sidebar Layout */}
        <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Missions Grid (Left - 2 cols on desktop) */}
          <div className="lg:col-span-2" role="region" aria-label="Lista de misiones">
            <MissionGrid
              missions={currentMissions}
              loading={loading}
              statusFilter={statusFilter}
              onStartMission={handleStartMission}
              onClaimReward={handleClaimReward}
              onTrackMission={trackMission}
              onGoToExercise={handleGoToExercise}
              onCardClick={handleCardClick}
              isTracked={isTracked}
              emptyMessage={getEmptyMessage()}
            />
          </div>

          {/* Active Mission Tracker (Right - 1 col on desktop) */}
          <div className="lg:col-span-1" role="region" aria-label="Seguimiento de misiones activas">
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

      {/* Mission Detail Modal */}
      <MissionDetailModal
        mission={selectedMission}
        isOpen={!!selectedMission}
        onClose={() => setSelectedMission(null)}
        onStart={handleStartMission}
        onClaim={handleClaimReward}
        onGoToExercise={handleGoToExercise}
      />

      {/* Bottom Spacing */}
      <div className="h-16" />
    </StudentPageShell>
  );
}
