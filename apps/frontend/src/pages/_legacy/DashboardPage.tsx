/* eslint-disable @typescript-eslint/no-unused-vars */
// Legacy Dashboard - unused vars are intentional in error handling patterns
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Zap, Coins, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '@/app/providers/AuthContext';
import { DashboardLayout } from '@/shared/layouts/_legacy/DashboardLayout';
import { UserStatsCard } from '@/shared/components/UserStatsCard';
import { AchievementsGrid } from '@/shared/components/AchievementsGrid';
import { SkeletonStats } from '@/shared/components/Skeleton';
import { gamificationApi } from '@/lib/api/gamification.api';
import { educationalApi } from '@/lib/api/educational.api';
import { progressApi, type RecentActivity } from '@/lib/api/progress.api';
import type { PendingActivity as DashboardPendingActivity } from '@/components/_legacy/dashboard-migration-sprint/PendingActivitiesList';
import type { UserAchievement } from '@/shared/types/achievement.types';
import type { Module } from '@/shared/types/educational.types';
import type { ModuleProgress } from '@/shared/types/progress.types';
import { MotivationalBanner } from '@/components/_legacy/dashboard-migration-sprint/MotivationalBanner';
import { ModulesGrid } from '@/components/_legacy/dashboard-migration-sprint/ModulesGrid';
import { PendingActivitiesList } from '@/components/_legacy/dashboard-migration-sprint/PendingActivitiesList';
import { RecentActivityFeed } from '@/components/_legacy/dashboard-migration-sprint/RecentActivityFeed';

// Local types
interface UserStats {
  totalPoints: number;
  level?: number;
  experienceProgress?: number;
  tasksCompleted?: number;
  currentStreak?: number;
}

interface MLCoinsBalance {
  balance: number;
  totalEarned?: number;
}

/**
 * DashboardPage Component
 * Main dashboard page with user stats, achievements, and progress
 *
 * Features:
 * - Welcome header with user name
 * - Stats grid: XP, ML Coins, Level/Rank, Streak
 * - Recent achievements section
 * - Progress chart (TODO: placeholder)
 * - Upcoming missions (TODO: placeholder)
 * - Data fetching with loading states
 * - Error handling with retry
 *
 * Data Sources:
 * - getUserStats: User XP, level, tasks completed, streak
 * - getUserAchievements: List of achievements
 * - getMLCoinsBalance: ML Coins balance
 */
export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // State for stats
  const [stats, setStats] = useState<UserStats | null>(null);
  const [achievements, setAchievements] = useState<UserAchievement[]>([]);
  const [mlCoins, setMlCoins] = useState<MLCoinsBalance | null>(null);

  // State for modules and progress
  const [modules, setModules] = useState<Module[]>([]);
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [pendingActivities, setPendingActivities] = useState<DashboardPendingActivity[]>([]);
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([]);
  const [dailyStats, setDailyStats] = useState<{ exercises_completed: number } | null>(null);

  // Loading states
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [isLoadingAchievements, setIsLoadingAchievements] = useState(true);
  const [isLoadingCoins, setIsLoadingCoins] = useState(true);
  const [isLoadingModules, setIsLoadingModules] = useState(true);
  const [isLoadingProgress, setIsLoadingProgress] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [_isLoadingDailyStats, setIsLoadingDailyStats] = useState(true);

  // Error states - track errors per data type
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Fetch user stats
  useEffect(() => {
    const loadStats = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingStats(true);
        setErrors((prev) => {
          const { stats: _stats, ...rest } = prev;
          return rest;
        }); // Clear stats error
        const data = await gamificationApi.getUserStats(user.id);
        setStats(data as any);
      } catch (err) {
        console.error('Failed to load user stats:', err);
        setErrors((prev) => ({ ...prev, stats: 'Failed to load stats. Please try again.' }));
      } finally {
        setIsLoadingStats(false);
      }
    };

    loadStats();
  }, [user?.id]);

  // Fetch achievements
  useEffect(() => {
    const loadAchievements = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingAchievements(true);
        setErrors((prev) => {
          const { achievements: _achievements, ...rest } = prev;
          return rest;
        }); // Clear achievements error
        const data = await gamificationApi.getUserAchievements(user.id);
        setAchievements(data);
      } catch (err) {
        console.error('Failed to load achievements:', err);
        setErrors((prev) => ({
          ...prev,
          achievements: 'Failed to load achievements. Please try again.',
        }));
      } finally {
        setIsLoadingAchievements(false);
      }
    };

    loadAchievements();
  }, [user?.id]);

  // Fetch ML Coins balance
  useEffect(() => {
    const loadCoins = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingCoins(true);
        setErrors((prev) => {
          const { mlCoins: _mlCoins, ...rest } = prev;
          return rest;
        }); // Clear mlCoins error
        const data = await gamificationApi.getMLCoinsBalance(user.id);
        setMlCoins(data as any);
      } catch (err) {
        console.error('Failed to load ML coins:', err);
        setErrors((prev) => ({ ...prev, mlCoins: 'Failed to load ML Coins. Please try again.' }));
      } finally {
        setIsLoadingCoins(false);
      }
    };

    loadCoins();
  }, [user?.id]);

  // Fetch modules
  useEffect(() => {
    const loadModules = async () => {
      try {
        setIsLoadingModules(true);
        setErrors((prev) => {
          const { modules: _modules, ...rest } = prev;
          return rest;
        }); // Clear modules error
        const data = await educationalApi.getModules();
        setModules(data);
      } catch (err) {
        console.error('Failed to load modules:', err);
        setErrors((prev) => ({ ...prev, modules: 'Failed to load modules. Please try again.' }));
      } finally {
        setIsLoadingModules(false);
      }
    };

    loadModules();
  }, []);

  // Fetch user progress
  useEffect(() => {
    const loadProgress = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingProgress(true);
        setErrors((prev) => {
          const { progress: _progress, ...rest } = prev;
          return rest;
        }); // Clear progress error
        const progressData = await progressApi.getUserProgress(user.id);

        // Convert array to Record<moduleId, ModuleProgress>
        const progressMap = progressData.reduce(
          (acc, progress) => {
            acc[progress.module_id] = progress;
            return acc;
          },
          {} as Record<string, ModuleProgress>,
        );

        setModuleProgress(progressMap);

        // Fetch pending activities from backend
        try {
          const pending = await progressApi.getPendingActivities(user.id, { limit: 5 });
          // Transform to dashboard format
          setPendingActivities(
            pending.map((p) => ({
              id: p.id,
              title: p.title,
              type: p.type as any,
              dueDate: p.due_date,
            })) as any,
          );
        } catch (pendingErr) {
          console.error('Failed to load pending activities:', pendingErr);
          // Don't set error state, just show empty activities list
        }
      } catch (err) {
        console.error('Failed to load progress:', err);
        setErrors((prev) => ({ ...prev, progress: 'Failed to load progress. Please try again.' }));
      } finally {
        setIsLoadingProgress(false);
      }
    };

    loadProgress();
  }, [user?.id, modules]);

  // Fetch recent activities
  useEffect(() => {
    const loadRecentActivities = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingActivities(true);
        setErrors((prev) => {
          const { recentActivities: _recentActivities, ...rest } = prev;
          return rest;
        }); // Clear error
        const data = await progressApi.getRecentActivities(user.id, { limit: 10 });
        setRecentActivities(data);
      } catch (err) {
        console.error('Failed to load recent activities:', err);
        setErrors((prev) => ({ ...prev, recentActivities: 'Failed to load recent activities.' }));
      } finally {
        setIsLoadingActivities(false);
      }
    };

    loadRecentActivities();
  }, [user?.id]);

  // Fetch daily stats
  useEffect(() => {
    const loadDailyStats = async () => {
      if (!user?.id) return;

      try {
        setIsLoadingDailyStats(true);
        setErrors((prev) => {
          const { dailyStats: _dailyStats, ...rest } = prev;
          return rest;
        }); // Clear error
        const data = await progressApi.getSessionStats(user.id, 'daily');
        setDailyStats({ exercises_completed: (data as any).exercises_completed ?? 0 });
      } catch (err) {
        console.error('Failed to load daily stats:', err);
        // Don't set error state for daily stats, just use 0 as fallback
        setDailyStats({ exercises_completed: 0 });
      } finally {
        setIsLoadingDailyStats(false);
      }
    };

    loadDailyStats();
  }, [user?.id]);

  // Retry specific API calls
  const retryStats = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingStats(true);
      setErrors((prev) => {
        const { stats: _stats, ...rest } = prev;
        return rest;
      });
      const data = await gamificationApi.getUserStats(user.id);
      setStats(data as any);
    } catch (err) {
      console.error('Failed to load user stats:', err);
      setErrors((prev) => ({ ...prev, stats: 'Failed to load stats. Please try again.' }));
    } finally {
      setIsLoadingStats(false);
    }
  }, [user?.id]);

  const retryAchievements = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingAchievements(true);
      setErrors((prev) => {
        const { achievements: _achievements, ...rest } = prev;
        return rest;
      });
      const data = await gamificationApi.getUserAchievements(user.id);
      setAchievements(data);
    } catch (err) {
      console.error('Failed to load achievements:', err);
      setErrors((prev) => ({
        ...prev,
        achievements: 'Failed to load achievements. Please try again.',
      }));
    } finally {
      setIsLoadingAchievements(false);
    }
  }, [user?.id]);

  const retryMLCoins = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingCoins(true);
      setErrors((prev) => {
        const { mlCoins: _mlCoins, ...rest } = prev;
        return rest;
      });
      const data = await gamificationApi.getMLCoinsBalance(user.id);
      setMlCoins(data as any);
    } catch (err) {
      console.error('Failed to load ML coins:', err);
      setErrors((prev) => ({ ...prev, mlCoins: 'Failed to load ML Coins. Please try again.' }));
    } finally {
      setIsLoadingCoins(false);
    }
  }, [user?.id]);

  const retryModules = useCallback(async () => {
    try {
      setIsLoadingModules(true);
      setErrors((prev) => {
        const { modules: _modules, ...rest } = prev;
        return rest;
      });
      const data = await educationalApi.getModules();
      setModules(data);
    } catch (err) {
      console.error('Failed to load modules:', err);
      setErrors((prev) => ({ ...prev, modules: 'Failed to load modules. Please try again.' }));
    } finally {
      setIsLoadingModules(false);
    }
  }, []);

  const retryProgress = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingProgress(true);
      setErrors((prev) => {
        const { progress: _progress, ...rest } = prev;
        return rest;
      });
      const progressData = await progressApi.getUserProgress(user.id);

      const progressMap = progressData.reduce(
        (acc, progress) => {
          acc[progress.module_id] = progress;
          return acc;
        },
        {} as Record<string, ModuleProgress>,
      );

      setModuleProgress(progressMap);

      try {
        const pending = await progressApi.getPendingActivities(user.id, { limit: 5 });
        // Transform to dashboard format
        setPendingActivities(
          pending.map((p) => ({
            id: p.id,
            title: p.title,
            type: p.type as any,
            dueDate: p.due_date,
          })) as any,
        );
      } catch (pendingErr) {
        console.error('Failed to load pending activities:', pendingErr);
      }
    } catch (err) {
      console.error('Failed to load progress:', err);
      setErrors((prev) => ({ ...prev, progress: 'Failed to load progress. Please try again.' }));
    } finally {
      setIsLoadingProgress(false);
    }
  }, [user?.id]);

  const retryRecentActivities = useCallback(async () => {
    if (!user?.id) return;
    try {
      setIsLoadingActivities(true);
      setErrors((prev) => {
        const { recentActivities: _recentActivities, ...rest } = prev;
        return rest;
      });
      const data = await progressApi.getRecentActivities(user.id, { limit: 10 });
      setRecentActivities(data);
    } catch (err) {
      console.error('Failed to load recent activities:', err);
      setErrors((prev) => ({ ...prev, recentActivities: 'Failed to load recent activities.' }));
    } finally {
      setIsLoadingActivities(false);
    }
  }, [user?.id]);

  // Map error keys to retry handlers
  const retryHandlers = useMemo(
    () => ({
      stats: retryStats,
      achievements: retryAchievements,
      mlCoins: retryMLCoins,
      modules: retryModules,
      progress: retryProgress,
      recentActivities: retryRecentActivities,
    }),
    [
      retryStats,
      retryAchievements,
      retryMLCoins,
      retryModules,
      retryProgress,
      retryRecentActivities,
    ],
  );

  // Retry all failed API calls
  const handleRetryAll = useCallback(async () => {
    const retryPromises = Object.keys(errors).map((key) => {
      const handler = retryHandlers[key as keyof typeof retryHandlers];
      return handler ? handler() : Promise.resolve();
    });
    await Promise.all(retryPromises);
  }, [errors, retryHandlers]);

  // Get user display name
  const userDisplayName = useMemo(() => {
    if (!user?.email) return 'User';
    return user.email.split('@')[0];
  }, [user?.email]);

  // Handle module click
  const handleModuleClick = useCallback(
    (moduleId: string) => {
      navigate(`/modules/${moduleId}`);
    },
    [navigate],
  );

  // Handle pending activity click
  const handleActivityClick = useCallback(
    (activityId: string) => {
      // Activity ID format is "activity-{moduleId}", extract module ID
      const moduleId = activityId.replace('activity-', '');
      navigate(`/modules/${moduleId}`);
    },
    [navigate],
  );

  // Handle recent activity click
  const handleRecentActivityClick = useCallback(
    (activity: RecentActivity) => {
      // Navigate based on entity type
      if (activity.entity_type === 'module') {
        navigate(`/modules/${activity.entity_id}`);
      } else if (activity.entity_type === 'exercise') {
        // Navigate to module page (could be enhanced to go directly to exercise)
        navigate(`/modules/${activity.entity_id}`);
      }
      // Add more navigation cases as needed
    },
    [navigate],
  );

  // Count unlocked achievements
  const unlockedAchievementsCount = useMemo(() => {
    return achievements.filter((a) => a.status === 'earned' || a.status === 'claimed').length;
  }, [achievements]);

  // Prepare user stats for MotivationalBanner
  const motivationalStats = useMemo(() => {
    if (!stats) return undefined;

    return {
      current_rank: stats.level?.toString() || 'Ajaw',
      xp_total: stats.totalPoints || 0,
      ml_coins: mlCoins?.balance || 0,
      exercises_completed_today: dailyStats?.exercises_completed || 0,
      current_streak: stats.currentStreak || 0,
      achievements_unlocked_count: unlockedAchievementsCount,
    };
  }, [stats, mlCoins?.balance, unlockedAchievementsCount, dailyStats]);

  // Check if there are any errors
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  // Format error entries for display
  const errorEntries = useMemo(() => Object.entries(errors), [errors]);

  return (
    <DashboardLayout>
      {/* Motivational Banner */}
      <div className="mb-8">
        <MotivationalBanner userName={userDisplayName} userStats={motivationalStats} />
      </div>

      {/* Error Alerts */}
      {hasErrors && (
        <div className="mb-6 space-y-3">
          {errorEntries.map(([key, message]) => {
            const retryHandler = retryHandlers[key as keyof typeof retryHandlers];
            return (
              <div
                key={key}
                className="flex items-start space-x-3 rounded-lg border border-red-200 bg-red-50 p-4"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-600" />
                <div className="flex-1">
                  <h3 className="text-sm font-medium capitalize text-red-800">
                    Error Loading {key.replace(/([A-Z])/g, ' $1').trim()}
                  </h3>
                  <p className="mt-1 text-sm text-red-700">{message}</p>
                </div>
                {retryHandler && (
                  <button
                    onClick={retryHandler}
                    className="flex-shrink-0 rounded bg-red-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-red-700"
                  >
                    Retry
                  </button>
                )}
              </div>
            );
          })}
          {errorEntries.length > 1 && (
            <button
              onClick={handleRetryAll}
              className="w-full rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-red-700"
            >
              Retry All ({errorEntries.length})
            </button>
          )}
        </div>
      )}

      {/* Stats Grid */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Total XP */}
        {isLoadingStats ? (
          <SkeletonStats />
        ) : (
          <UserStatsCard
            title="Total XP"
            value={stats?.totalPoints || 0}
            icon={<Zap />}
            subtitle={`${stats?.experienceProgress || 0}% to next level`}
            color="yellow"
            trend="up"
          />
        )}

        {/* ML Coins */}
        {isLoadingCoins ? (
          <SkeletonStats />
        ) : (
          <UserStatsCard
            title="ML Coins"
            value={mlCoins?.balance || 0}
            icon={<Coins />}
            subtitle={`${mlCoins?.totalEarned || 0} earned total`}
            color="purple"
          />
        )}

        {/* Current Level */}
        {isLoadingStats ? (
          <SkeletonStats />
        ) : (
          <UserStatsCard
            title="Current Level"
            value={stats?.level || 1}
            icon={<TrendingUp />}
            subtitle="Keep learning to level up!"
            color="blue"
          />
        )}

        {/* Tasks Completed */}
        {isLoadingStats ? (
          <SkeletonStats />
        ) : (
          <UserStatsCard
            title="Tasks Completed"
            value={stats?.tasksCompleted || 0}
            icon={<TrendingUp />}
            subtitle={`${stats?.currentStreak || 0} day streak`}
            color="green"
            trend={stats?.currentStreak ? 'up' : 'neutral'}
          />
        )}
      </div>

      {/* Recent Achievements Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Achievements</h2>
          <a
            href="/achievements"
            className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
          >
            View All
          </a>
        </div>

        <AchievementsGrid
          achievements={achievements}
          isLoading={isLoadingAchievements}
          maxDisplay={4}
        />
      </div>

      {/* Modules Grid Section */}
      <div className="mb-8">
        <ModulesGrid
          modules={modules}
          userProgress={moduleProgress}
          onModuleClick={handleModuleClick}
          isLoading={isLoadingModules || isLoadingProgress}
        />
      </div>

      {/* Pending Activities Section */}
      <div className="mb-8">
        <PendingActivitiesList
          activities={pendingActivities}
          onActivityClick={handleActivityClick}
          maxItems={5}
        />
      </div>

      {/* Recent Activity Section */}
      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Recent Activity</h2>
          {recentActivities.length > 0 && (
            <a
              href="/activity"
              className="text-sm font-medium text-orange-600 transition-colors hover:text-orange-700"
            >
              View All
            </a>
          )}
        </div>
        <RecentActivityFeed
          activities={recentActivities}
          loading={isLoadingActivities}
          onActivityClick={handleRecentActivityClick}
        />
      </div>
    </DashboardLayout>
  );
};

export default DashboardPage;
