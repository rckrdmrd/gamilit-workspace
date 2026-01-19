/**
 * Guilds Store
 *
 * Note: Backend uses "teams" but frontend displays as "guilds"
 * This store maps Team DTOs to Guild types for UI consistency
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { Guild, GuildMember, GuildChallenge, GuildActivity } from '../types/guildsTypes';
import { teamsAPI, type Team, type TeamMember } from '@/services/api/teamsAPI';
import { apiClient } from '@/services/api/apiClient';
import { useAuthStore } from '@/features/auth/store/authStore';

interface GuildsStore {
  allGuilds: Guild[];
  userGuild: Guild | null;
  guildMembers: GuildMember[];
  guildChallenges: GuildChallenge[];
  guildActivities: GuildActivity[];
  isInGuild: boolean;
  loading: boolean;
  error: string | null;

  fetchAllGuilds: (classroomId?: string) => Promise<void>;
  fetchUserGuild: (userId: string) => Promise<void>;
  fetchGuildMembers: (guildId: string) => Promise<void>;
  fetchGuildChallenges: (guildId: string) => Promise<void>;
  joinGuild: (guildId: string) => Promise<void>;
  leaveGuild: (guildId: string) => Promise<void>;
  createGuild: (guild: Partial<Guild>) => Promise<void>;
  refreshGuildData: (userId: string) => Promise<void>;
  clearError: () => void;
}

/**
 * Maps Team from API to Guild type for frontend
 * FIX-2026-01-19: Updated to use camelCase properties (API now returns transformed data)
 */
function mapTeamToGuild(team: Team): Guild {
  return {
    id: team.id,
    name: team.name,
    description: team.description || '',
    emblem: team.avatarUrl || 'shield',
    leaderId: team.leaderId || team.creatorId,
    memberCount: team.currentMembersCount,
    maxMembers: team.maxMembers,
    level: Math.floor(team.totalXp / 1000) + 1, // Calculate level from XP
    xp: team.totalXp,
    createdAt: team.foundedAt, // Already a Date object from transformer
    isPublic: team.isPublic,
    status: team.isActive
      ? team.currentMembersCount >= team.maxMembers
        ? 'full'
        : team.allowJoinRequests
          ? 'recruiting'
          : 'active'
      : 'inactive',
    requirements: undefined, // Not in Team type
    stats: {
      totalExercisesCompleted: team.modulesCompleted,
      totalMlCoinsEarned: team.totalMlCoins,
      totalAchievements: team.achievementsEarned,
      averageScore: 0, // Not directly available
    },
  };
}

/**
 * Maps TeamMember from API to GuildMember type for frontend
 * FIX-2026-01-19: Updated to use camelCase properties
 */
function mapTeamMemberToGuildMember(member: TeamMember): GuildMember {
  return {
    userId: member.userId,
    username: 'Team Member', // TODO: Fetch user details
    avatar: '/avatars/default.png',
    role: member.role, // Valores directos: owner, admin, member (sincronizado 2026-01-07)
    joinedAt: member.joinedAt, // Already a Date object from transformer
    contributionScore: 0, // Not in TeamMember type
    lastActive: new Date(), // Not in TeamMember type
    rank: 'al_mehen' as const,
    level: 1,
  };
}

export const useGuildsStore = create<GuildsStore>()(
  devtools(
    (set, get) => ({
      allGuilds: [],
      userGuild: null,
      guildMembers: [],
      guildChallenges: [],
      guildActivities: [],
      isInGuild: false,
      loading: false,
      error: null,

      fetchAllGuilds: async (classroomId?: string) => {
        set({ loading: true, error: null });
        try {
          const teams = await teamsAPI.getAllTeams(classroomId);
          const guilds = teams.map(mapTeamToGuild);
          set({ allGuilds: guilds, loading: false });
        } catch (error: unknown) {
          set({ error: (error as Error).message || 'Failed to fetch guilds', loading: false });
        }
      },

      fetchUserGuild: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const userTeams = await teamsAPI.getUserTeams(userId);

          if (userTeams.length > 0) {
            // Get the first team the user is a member of
            // FIX-2026-01-19: Use camelCase teamId from transformed API response
            const teamId = userTeams[0].teamId;
            const team = await teamsAPI.getTeamById(teamId);
            const guild = mapTeamToGuild(team);
            set({ userGuild: guild, isInGuild: true, loading: false });

            // Also fetch guild challenges
            get().fetchGuildChallenges(teamId);
          } else {
            set({ userGuild: null, isInGuild: false, guildChallenges: [], loading: false });
          }
        } catch (error: unknown) {
          set({ error: (error as Error).message || 'Failed to fetch user guild', loading: false });
        }
      },

      fetchGuildMembers: async (guildId: string) => {
        set({ loading: true, error: null });
        try {
          const members = await teamsAPI.getTeamMembers(guildId);
          const guildMembers = members.map(mapTeamMemberToGuildMember);
          set({ guildMembers, loading: false });
        } catch (error: unknown) {
          set({ error: (error as Error).message || 'Failed to fetch guild members', loading: false });
        }
      },

      fetchGuildChallenges: async (guildId: string) => {
        set({ loading: true, error: null });
        try {
          const response = await apiClient.get(`/social/team-challenges/teams/${guildId}`);
          const challengesData = response.data;

          // Map backend response to GuildChallenge type
          const guildChallenges: GuildChallenge[] = (Array.isArray(challengesData) ? challengesData : []).map((c: {
            id: string;
            challenge_id: string;
            status: string;
            score: number;
            max_score?: number;
            started_at?: string;
            completed_at?: string;
            created_at?: string;
            challenge?: {
              name?: string;
              description?: string;
              xp_reward?: number;
              ml_coins_reward?: number;
            };
          }) => ({
            id: c.id,
            name: c.challenge?.name || `Challenge ${c.challenge_id}`,
            description: c.challenge?.description || '',
            type: 'team' as const,
            status: c.status === 'completed' ? 'completed' : c.status === 'in_progress' ? 'in_progress' : 'active',
            progress: c.score || 0,
            target: c.max_score || 100,
            xpReward: c.challenge?.xp_reward || 0,
            mlCoinsReward: c.challenge?.ml_coins_reward || 0,
            startDate: c.started_at ? new Date(c.started_at) : new Date(c.created_at || Date.now()),
            endDate: c.completed_at ? new Date(c.completed_at) : undefined,
          }));

          set({ guildChallenges, loading: false });
        } catch (error: unknown) {
          console.error('Failed to fetch guild challenges:', error);
          set({ guildChallenges: [], error: (error as Error).message || 'Failed to fetch guild challenges', loading: false });
        }
      },

      joinGuild: async (guildId: string) => {
        set({ loading: true, error: null });
        try {
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          const updatedTeam = await teamsAPI.addTeamMember(guildId, currentUserId);
          const guild = mapTeamToGuild(updatedTeam);

          set({
            userGuild: guild,
            isInGuild: true,
            loading: false,
          });

          // Refresh guild members
          get().fetchGuildMembers(guildId);
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to join guild', loading: false });
        }
      },

      leaveGuild: async (guildId: string) => {
        set({ loading: true, error: null });
        try {
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          await teamsAPI.removeTeamMember(guildId, currentUserId);

          set({
            userGuild: null,
            isInGuild: false,
            guildMembers: [],
            loading: false,
          });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to leave guild', loading: false });
        }
      },

      createGuild: async (guildData: Partial<Guild>) => {
        set({ loading: true, error: null });
        try {
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          const team = await teamsAPI.createTeam({
            name: guildData.name || 'New Guild',
            description: guildData.description || '',
            max_members: guildData.maxMembers || 50,
            is_public: guildData.isPublic ?? true,
            allow_join_requests: true,
            require_approval: false,
          });

          const guild = mapTeamToGuild(team);

          set({
            allGuilds: [...get().allGuilds, guild],
            userGuild: guild,
            isInGuild: true,
            loading: false,
          });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to create guild', loading: false });
        }
      },

      refreshGuildData: async (userId: string) => {
        const { fetchAllGuilds, fetchUserGuild } = get();
        await Promise.all([fetchAllGuilds(), fetchUserGuild(userId)]);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'GuildsStore' },
  ),
);
