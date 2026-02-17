/**
 * useGuilds Hook
 *
 * Hook for managing guilds with API integration
 * Note: Backend uses "teams" but frontend displays as "guilds"
 */

import { useEffect } from 'react';
import { useGuildsStore } from '../store/guildsStore';
import { useAuthStore } from '@/features/auth/store/authStore';

export const useGuilds = () => {
  const {
    allGuilds,
    userGuild,
    guildMembers,
    guildChallenges,
    guildActivities,
    isInGuild,
    loading,
    error,
    fetchAllGuilds,
    fetchUserGuild,
    fetchGuildMembers,
    joinGuild,
    leaveGuild,
    createGuild,
    refreshGuildData,
    clearError,
  } = useGuildsStore();

  const currentUser = useAuthStore((state) => state.user);

  // Auto-fetch guilds and user's guild when user is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      fetchAllGuilds();
      fetchUserGuild(currentUser.id);
    }
  }, [currentUser?.id, fetchAllGuilds, fetchUserGuild]);

  // Fetch guild members when user guild changes
  useEffect(() => {
    if (userGuild?.id) {
      fetchGuildMembers(userGuild.id);
    }
  }, [userGuild?.id, fetchGuildMembers]);

  const getPublicGuilds = () => {
    return allGuilds.filter((g) => g.isPublic);
  };

  const getRecruitingGuilds = () => {
    return allGuilds.filter((g) => g.status === 'recruiting');
  };

  const getActiveChallenges = () => {
    return guildChallenges.filter((c) => c.status === 'active');
  };

  const getGuildLeaders = () => {
    return guildMembers.filter((m) => m.role === 'owner' || m.role === 'admin');
  };

  const canJoinGuild = (guildId: string, userLevel: number = 1, _userRank: string = 'Nacom') => {
    const guild = allGuilds.find((g) => g.id === guildId);
    if (!guild || guild.memberCount >= guild.maxMembers) return false;

    if (guild.requirements?.minLevel && userLevel < guild.requirements.minLevel) {
      return false;
    }

    return true;
  };

  const handleJoinGuild = async (guildId: string) => {
    await joinGuild(guildId);
  };

  const handleLeaveGuild = async () => {
    if (userGuild?.id) {
      await leaveGuild(userGuild.id);
    }
  };

  const handleRefreshGuildData = async () => {
    if (currentUser?.id) {
      await refreshGuildData(currentUser.id);
    }
  };

  return {
    // State
    allGuilds,
    userGuild,
    guildMembers,
    guildChallenges,
    guildActivities,
    isInGuild,
    loading,
    error,

    // Actions
    joinGuild: handleJoinGuild,
    leaveGuild: handleLeaveGuild,
    createGuild,
    refreshGuildData: handleRefreshGuildData,
    clearError,

    // Computed values
    getPublicGuilds,
    getRecruitingGuilds,
    getActiveChallenges,
    getGuildLeaders,
    canJoinGuild,
  };
};
