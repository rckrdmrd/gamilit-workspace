/**
 * Leaderboards Store
 *
 * Now connects to real API instead of mock data
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import type { LeaderboardData, LeaderboardType, TimePeriod } from '../types/leaderboardsTypes';
import { getLeaderboardByType as getMockLeaderboardByType } from '../mockData/leaderboardsMockData';
import { getLeaderboard, getUserLeaderboardRank, getClassroomLeaderboard } from '../api/socialAPI';
import { FEATURE_FLAGS } from '@/config/api.config';

interface LeaderboardsStore {
  currentLeaderboard: LeaderboardData;
  selectedType: LeaderboardType;
  selectedPeriod: TimePeriod;
  loading: boolean;
  error: string | null;

  setLeaderboardType: (type: LeaderboardType, classroomId?: string) => Promise<void>;
  setTimePeriod: (period: TimePeriod) => Promise<void>;
  refreshLeaderboard: (classroomId?: string) => Promise<void>;
  updateFromWebSocket: (entries: any[]) => void;
}

export const useLeaderboardsStore = create<LeaderboardsStore>((set, get) => ({
  currentLeaderboard: getMockLeaderboardByType('global'),
  selectedType: 'global',
  selectedPeriod: 'all-time',
  loading: false,
  error: null,

  setLeaderboardType: async (type: LeaderboardType, classroomId?: string) => {
    set({ loading: true, error: null, selectedType: type });

    try {
      if (FEATURE_FLAGS.USE_MOCK_DATA) {
        const leaderboard = getMockLeaderboardByType(type);
        set({ currentLeaderboard: leaderboard, loading: false });
        return;
      }

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
          userRank = userEntry.rank;
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

      // Fallback to mock data on error
      const mockLeaderboard = getMockLeaderboardByType(type);
      set({ currentLeaderboard: mockLeaderboard });
    }
  },

  setTimePeriod: async (period: TimePeriod) => {
    set({ loading: true, error: null, selectedPeriod: period });

    try {
      if (FEATURE_FLAGS.USE_MOCK_DATA) {
        set({ loading: false });
        return;
      }

      const { selectedType } = get();

      // Fetch new data based on period
      const entries = await getLeaderboard(selectedType, period);

      // Try to get user's rank
      let userRank: number | undefined = undefined;
      try {
        const userEntry = await getUserLeaderboardRank(selectedType, period);
        userRank = userEntry.rank;
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
      if (FEATURE_FLAGS.USE_MOCK_DATA) {
        const leaderboard = getMockLeaderboardByType(selectedType);
        set({ currentLeaderboard: { ...leaderboard, lastUpdated: new Date() }, loading: false });
        return;
      }

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
          userRank = userEntry.rank;
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

      // Fallback to mock data on error
      const mockLeaderboard = getMockLeaderboardByType(selectedType);
      set({ currentLeaderboard: { ...mockLeaderboard, lastUpdated: new Date() } });
    }
  },

  updateFromWebSocket: (entries: any[]) => {
    const { currentLeaderboard } = get();

    // Only update if we have entries
    if (!entries || entries.length === 0) {
      console.warn('⚠️ Received empty leaderboard update from WebSocket');
      return;
    }

    console.log('🔄 Updating leaderboard from WebSocket:', entries.length, 'entries');

    // Create updated leaderboard data
    const updatedLeaderboard: LeaderboardData = {
      ...currentLeaderboard,
      entries,
      totalParticipants: entries.length,
      lastUpdated: new Date(),
      // Try to find user rank from the updated entries
      userRank: entries.find((e) => e.isCurrentUser)?.rank || currentLeaderboard.userRank,
    };

    set({ currentLeaderboard: updatedLeaderboard });
  },
}));
