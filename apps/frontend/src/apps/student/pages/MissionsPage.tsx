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

import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSearchParams, useNavigate } from 'react-router-dom';
import type {
  MissionStatus,
  MissionType,
} from '@/features/gamification/missions/types/missionsTypes';

// Components
import { StudentPageShell } from '../components/shared/StudentPageShell';
import { MissionTabs } from '@/features/gamification/missions/components/MissionTabs';
import { MissionGrid } from '@/features/gamification/missions/components/MissionGrid';
import { ActiveMissionTracker } from '@/features/gamification/missions/components/ActiveMissionTracker';
import { RewardsPreview } from '@/features/gamification/missions/components/RewardsPreview';

// Hooks
import { useMissions } from '@/features/gamification/missions/hooks/useMissions';
import { useInvalidateDashboard } from '@/shared/hooks/useInvalidateDashboard';
import { useUserModules } from '@/apps/student/hooks/useUserModules';
import toast from 'react-hot-toast';

export default function MissionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // Dashboard invalidation hook - FIX: Invalidate cache after claiming missions
  const { syncAndInvalidate } = useInvalidateDashboard();

  // User modules for resolving required_module (integer) to module UUID
  const { modules: userModules } = useUserModules();

  // Get tab from URL or default to 'daily'
  const tabFromUrl = (searchParams.get('tab') as MissionType) || 'daily';

  // Hook
  const {
    dailyMissions,
    weeklyMissions,
    specialMissions,
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

  /**
   * Navigate to the appropriate module/exercise for a special mission.
   * Resolves required_module (integer 1-5) to a module UUID using the
   * userModules list (sorted by order_index, 0-based).
   */
  const navigateToMissionExercise = useCallback(
    (missionId: string) => {
      const mission = allMissions.find((m) => m.id === missionId);
      if (!mission || mission.type !== 'special') return;

      // Extract exercise constraints from the first objective
      const firstObjective = mission.objectives?.[0];
      if (!firstObjective) return;

      const requiredModule = firstObjective.required_module;
      const requiredExerciseType = firstObjective.required_exercise_type;

      // If there's a required module, navigate to that module's detail page
      if (requiredModule && userModules.length > 0) {
        // required_module is 1-based (module 1-5), userModules are ordered by order_index (0-based)
        const targetModule = userModules[requiredModule - 1];
        if (targetModule) {
          const params = new URLSearchParams();
          params.set('mission_id', missionId);
          if (requiredExerciseType) {
            params.set('exercise_type', requiredExerciseType);
          }
          navigate(`/modules/${targetModule.id}?${params.toString()}`);
          return;
        }
      }

      // Fallback: if no required_module but has exercise_type, go to learning page
      if (requiredExerciseType) {
        navigate(`/learning?mission_id=${missionId}&exercise_type=${requiredExerciseType}`);
        return;
      }

      // Final fallback: go to learning hub
      navigate('/learning');
    },
    [allMissions, userModules, navigate],
  );

  // Handle mission start
  const handleStartMission = async (missionId: string) => {
    const result = await startMission(missionId);
    if (result.success) {
      // Auto-track on start
      trackMission(missionId);
      toast.success('Mision iniciada! Buena suerte');

      // For special missions, navigate to the appropriate module/exercise
      const mission = allMissions.find((m) => m.id === missionId);
      if (mission?.type === 'special') {
        const firstObjective = mission.objectives?.[0];
        if (firstObjective?.required_module || firstObjective?.required_exercise_type) {
          navigateToMissionExercise(missionId);
        }
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
      case 'special':
        return 'No hay eventos especiales activos actualmente';
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
          <div className="lg:col-span-2" role="region" aria-label="Lista de misiones">
            <MissionGrid
              missions={currentMissions}
              loading={loading}
              statusFilter={statusFilter}
              onStartMission={handleStartMission}
              onClaimReward={handleClaimReward}
              onTrackMission={trackMission}
              onGoToExercise={handleGoToExercise}
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

      {/* Bottom Spacing */}
      <div className="h-16" />
    </StudentPageShell>
  );
}
