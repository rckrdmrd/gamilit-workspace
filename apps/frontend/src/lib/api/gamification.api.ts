import apiClient from './client';
import type {
  Achievement,
  UserAchievement,
  AchievementSummary,
} from '@/shared/types/achievement.types';
import type {
  LeaderboardResponse,
  LeaderboardEntry,
  LeaderboardType,
  LeaderboardTimePeriod,
} from '@/shared/types/leaderboard.types';
import type {
  UserStats,
  UserRank,
  MLCoinsBalance,
  UpdateUserStatsDto,
} from '@/shared/types/gamification.types';

/**
 * Gamification API Client
 * Provides methods to interact with the gamification backend module
 */
export const gamificationApi = {
  // ===========================
  // USER STATS ENDPOINTS
  // ===========================

  /**
   * Get user statistics
   * @param userId - User ID
   * @returns User stats including XP, level, streak, etc.
   */
  getUserStats: async (userId: string): Promise<UserStats> => {
    const { data } = await apiClient.get<UserStats>(`/gamification/users/${userId}/stats`);
    return data;
  },

  /**
   * Update user stats
   * @param userId - User ID
   * @param stats - Partial stats to update
   * @returns Updated user stats
   */
  updateUserStats: async (userId: string, stats: UpdateUserStatsDto): Promise<UserStats> => {
    const { data } = await apiClient.patch<UserStats>(`/gamification/users/${userId}/stats`, stats);
    return data;
  },

  /**
   * Get user rank information
   * @param userId - User ID
   * @returns User rank with progress
   */
  getUserRank: async (userId: string): Promise<UserRank> => {
    const { data} = await apiClient.get<UserRank>(`/gamification/users/${userId}/rank`);
    return data;
  },

  // ===========================
  // ML COINS ENDPOINTS
  // ===========================

  /**
   * Get ML Coins balance for a user
   * @param userId - User ID
   * @returns ML Coins balance with earned/spent totals
   */
  getMLCoinsBalance: async (userId: string): Promise<MLCoinsBalance> => {
    const { data } = await apiClient.get<MLCoinsBalance>(`/gamification/users/${userId}/ml-coins`);
    return data;
  },

  // ===========================
  // ACHIEVEMENTS ENDPOINTS
  // ===========================

  /**
   * Get all available achievements
   * @returns List of all achievements in the system
   */
  getAllAchievements: async (): Promise<Achievement[]> => {
    const { data } = await apiClient.get<Achievement[]>('/gamification/achievements');
    return data;
  },

  /**
   * Get a specific achievement by ID
   * @param achievementId - Achievement ID
   * @returns Single achievement details
   */
  getAchievementById: async (achievementId: string): Promise<Achievement> => {
    const { data } = await apiClient.get<Achievement>(`/gamification/achievements/${achievementId}`);
    return data;
  },

  /**
   * Get user's achievement progress
   * @param userId - User ID
   * @returns List of user achievements with progress
   */
  getUserAchievements: async (userId: string): Promise<UserAchievement[]> => {
    const { data } = await apiClient.get<UserAchievement[]>(
      `/gamification/users/${userId}/achievements`
    );
    return data;
  },

  /**
   * Get achievement summary for user
   * @param userId - User ID
   * @returns Summary stats of user's achievements
   */
  getAchievementSummary: async (userId: string): Promise<AchievementSummary> => {
    const { data } = await apiClient.get<AchievementSummary>(
      `/gamification/users/${userId}/achievements/summary`
    );
    return data;
  },

  /**
   * Claim achievement rewards
   * @param userId - User ID
   * @param achievementId - Achievement ID to claim
   * @returns Updated user achievement with claimed status
   */
  claimAchievement: async (userId: string, achievementId: string): Promise<UserAchievement> => {
    const { data } = await apiClient.post<UserAchievement>(
      `/gamification/users/${userId}/achievements/${achievementId}/claim`,
      {}
    );
    return data;
  },

  // ===========================
  // LEADERBOARD ENDPOINTS
  // ===========================

  /**
   * Get global leaderboard
   * @param limit - Number of entries to return (default: 100)
   * @param offset - Pagination offset (default: 0)
   * @param timePeriod - Time period filter (optional)
   * @returns Global leaderboard with top users
   */
  getGlobalLeaderboard: async (
    limit: number = 100,
    offset: number = 0,
    timePeriod?: LeaderboardTimePeriod
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (timePeriod) {
      params.append('timePeriod', timePeriod);
    }

    const { data } = await apiClient.get<LeaderboardResponse>(
      `/gamification/leaderboard/global?${params.toString()}`
    );
    return data;
  },

  /**
   * Get school leaderboard
   * @param schoolId - School ID
   * @param limit - Number of entries to return (default: 100)
   * @param offset - Pagination offset (default: 0)
   * @param timePeriod - Time period filter (optional)
   * @returns School leaderboard
   */
  getSchoolLeaderboard: async (
    schoolId: string,
    limit: number = 100,
    offset: number = 0,
    timePeriod?: LeaderboardTimePeriod
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (timePeriod) {
      params.append('timePeriod', timePeriod);
    }

    const { data } = await apiClient.get<LeaderboardResponse>(
      `/gamification/leaderboard/schools/${schoolId}?${params.toString()}`
    );
    return data;
  },

  /**
   * Get classroom leaderboard
   * @param classroomId - Classroom ID
   * @param limit - Number of entries to return (default: 100)
   * @param offset - Pagination offset (default: 0)
   * @param timePeriod - Time period filter (optional)
   * @returns Classroom leaderboard
   */
  getClassroomLeaderboard: async (
    classroomId: string,
    limit: number = 100,
    offset: number = 0,
    timePeriod?: LeaderboardTimePeriod
  ): Promise<LeaderboardResponse> => {
    const params = new URLSearchParams({
      limit: limit.toString(),
      offset: offset.toString(),
    });

    if (timePeriod) {
      params.append('timePeriod', timePeriod);
    }

    const { data } = await apiClient.get<LeaderboardResponse>(
      `/gamification/leaderboard/classrooms/${classroomId}?${params.toString()}`
    );
    return data;
  },

  /**
   * Get leaderboard by type (unified method)
   * @param type - Leaderboard type (global, school, classroom)
   * @param id - School or classroom ID (if applicable)
   * @param limit - Number of entries to return
   * @param offset - Pagination offset
   * @param timePeriod - Time period filter (optional)
   * @returns Leaderboard response
   */
  getLeaderboard: async (
    type: LeaderboardType,
    id?: string,
    limit: number = 100,
    offset: number = 0,
    timePeriod?: LeaderboardTimePeriod
  ): Promise<LeaderboardResponse> => {
    switch (type) {
      case 'global':
        return gamificationApi.getGlobalLeaderboard(limit, offset, timePeriod);
      case 'school':
        if (!id) throw new Error('School ID required for school leaderboard');
        return gamificationApi.getSchoolLeaderboard(id, limit, offset, timePeriod);
      case 'classroom':
        if (!id) throw new Error('Classroom ID required for classroom leaderboard');
        return gamificationApi.getClassroomLeaderboard(id, limit, offset, timePeriod);
      default:
        throw new Error(`Unknown leaderboard type: ${type}`);
    }
  },
};
