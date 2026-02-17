/**
 * Leaderboards Store
 *
 * @description Zustand store for managing leaderboard state.
 * Data is fetched from real backend APIs.
 *
 * @updated 2025-12-29 - Removed mock data from initial state
 *
 * @note 2026-01-27 - NOT DEPRECATED - Different purpose than newLeaderboardsStore
 *
 * This store uses TYPE/PERIOD model (filter by scope + time):
 * - Types: global, school, friends, classroom, grade
 * - Periods: daily, weekly, monthly, all-time
 *
 * newLeaderboardsStore uses TAB-BASED model (filter by metric):
 * - Tabs: xp, coins, streaks, global (materialized views)
 *
 * Both stores serve DIFFERENT use cases:
 * - THIS STORE: "Show me XP rankings filtered by who (school, friends) and when (weekly)"
 * - NEW STORE: "Show me different ranking metrics (XP vs Coins vs Streaks)"
 *
 * Current consumers (valid usage):
 * - LeaderboardPage.tsx - Uses type/period filtering
 * - LeaderboardPreview.tsx - Uses type/period filtering
 * - useLeaderboards.ts hook - Abstracts this store
 */
 

import { create } from 'zustand';
import type { LeaderboardData, LeaderboardType, TimePeriod } from '../types/leaderboardsTypes';
import { getLeaderboard, getUserLeaderboardRank, getClassroomLeaderboard } from '../api/socialAPI';

// Empty leaderboard for initial state
const emptyLeaderboard: LeaderboardData = {
  type: 'global',
  timePeriod: 'all-time',
  entries: [],
  lastUpdated: new Date(),
  userRank: undefined,
  totalParticipants: 0, // Required to prevent undefined errors in UI
};

interface LeaderboardsStore {
  currentLeaderboard: LeaderboardData;
  selectedType: LeaderboardType;
  selectedPeriod: TimePeriod;
  loading: boolean;
  error: string | null;

  setLeaderboardType: (type: LeaderboardType, classroomId?: string) => Promise<void>;
  setTimePeriod: (period: TimePeriod) => Promise<void>;
  refreshLeaderboard: (classroomId?: string) => Promise<void>;
}

export const useLeaderboardsStore = create<LeaderboardsStore>((set, get) => ({
  currentLeaderboard: emptyLeaderboard, // Will be populated by API call
  selectedType: 'global',
  selectedPeriod: 'all-time',
  loading: true, // Start loading to trigger initial fetch
  error: null,

  setLeaderboardType: async (type: LeaderboardType, classroomId?: string) => {
    set({ loading: true, error: null, selectedType: type });

    try {
      const { selectedPeriod } = get();
      let entries;

      // Get user info for school/friends leaderboards
      const authStore = (await import('@/features/auth/store/authStore')).useAuthStore.getState();
      const user = authStore.user;

      if (type === 'classroom') {
        if (!classroomId) {
          throw new Error('Classroom ID is required for classroom leaderboard');
        }
        entries = await getClassroomLeaderboard(classroomId);
      } else if (type === 'school') {
        // Get school ID from user profile
        const schoolId = user?.schoolId;
        if (!schoolId) {
          throw new Error('No school ID available for this user');
        }
        entries = await getLeaderboard(type, selectedPeriod, 100, { schoolId });
      } else if (type === 'friends') {
        if (!user?.id) {
          throw new Error('User ID required for friends leaderboard');
        }
        entries = await getLeaderboard(type, selectedPeriod, 100, { userId: user.id });
      } else {
        // Global leaderboard
        entries = await getLeaderboard(type, selectedPeriod);
      }

      // Try to get user's rank (skip for classroom as it's already included)
      let userRank: number | undefined = undefined;
      if (type !== 'classroom') {
        try {
          const userEntry = await getUserLeaderboardRank(type, selectedPeriod);
          userRank = userEntry?.rank;
        } catch (err) {
          console.warn('Could not fetch user rank:', err);
        }
      }

      const leaderboard: LeaderboardData = {
        type,
        timePeriod: selectedPeriod,
        entries,
        userRank,
        totalParticipants: entries.length,
        lastUpdated: new Date(),
      };

      set({ currentLeaderboard: leaderboard, loading: false });
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
        loading: false,
      });
    }
  },

  setTimePeriod: async (period: TimePeriod) => {
    set({ loading: true, error: null, selectedPeriod: period });

    try {
      const { selectedType } = get();

      // Fetch new data based on period
      const entries = await getLeaderboard(selectedType, period);

      // Try to get user's rank
      let userRank: number | undefined = undefined;
      try {
        const userEntry = await getUserLeaderboardRank(selectedType, period);
        userRank = userEntry?.rank;
      } catch (err) {
        console.warn('Could not fetch user rank:', err);
      }

      const leaderboard: LeaderboardData = {
        type: selectedType,
        timePeriod: period,
        entries,
        userRank,
        totalParticipants: entries.length,
        lastUpdated: new Date(),
      };

      set({ currentLeaderboard: leaderboard, loading: false });
    } catch (error) {
      console.error('Error changing time period:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to load leaderboard',
        loading: false,
      });
    }
  },

  refreshLeaderboard: async (classroomId?: string) => {
    const { selectedType, selectedPeriod } = get();
    set({ loading: true, error: null });

    try {
      let entries;

      // Get user info for school/friends leaderboards
      const authStore = (await import('@/features/auth/store/authStore')).useAuthStore.getState();
      const user = authStore.user;

      if (selectedType === 'classroom') {
        if (!classroomId) {
          throw new Error('Classroom ID is required for classroom leaderboard');
        }
        entries = await getClassroomLeaderboard(classroomId);
      } else if (selectedType === 'school') {
        // Get school ID from user profile
        const schoolId = user?.schoolId;
        if (!schoolId) {
          throw new Error('No school ID available for this user');
        }
        entries = await getLeaderboard(selectedType, selectedPeriod, 100, { schoolId });
      } else if (selectedType === 'friends') {
        if (!user?.id) {
          throw new Error('User ID required for friends leaderboard');
        }
        entries = await getLeaderboard(selectedType, selectedPeriod, 100, { userId: user.id });
      } else {
        // Global leaderboard
        entries = await getLeaderboard(selectedType, selectedPeriod);
      }

      // Try to get user's rank (skip for classroom as it's already included)
      let userRank: number | undefined = undefined;
      if (selectedType !== 'classroom') {
        try {
          const userEntry = await getUserLeaderboardRank(selectedType, selectedPeriod);
          userRank = userEntry?.rank;
        } catch (err) {
          console.warn('Could not fetch user rank:', err);
        }
      }

      const leaderboard: LeaderboardData = {
        type: selectedType,
        timePeriod: selectedPeriod,
        entries,
        userRank,
        totalParticipants: entries.length,
        lastUpdated: new Date(),
      };

      set({ currentLeaderboard: leaderboard, loading: false });
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      set({
        error: error instanceof Error ? error.message : 'Failed to refresh leaderboard',
        loading: false,
      });
    }
  },
}));
