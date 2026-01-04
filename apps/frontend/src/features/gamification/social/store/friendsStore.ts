/**
 * Friends Store
 *
 * @description Zustand store for managing friend relationships and activities.
 * Data is fetched from real backend APIs - no mock data is used.
 *
 * @updated 2025-12-29 - Removed mock data, added fetchRecommendations and fetchActivities
 */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type {
  Friend,
  FriendRequest,
  FriendRecommendation,
  FriendActivity,
} from '../types/friendsTypes';
import { friendsAPI } from '@/services/api/friendsAPI';
import { useAuthStore } from '@/features/auth/store/authStore';

interface FriendsStore {
  friends: Friend[];
  friendRequests: FriendRequest[];
  recommendations: FriendRecommendation[];
  activities: FriendActivity[];
  onlineFriends: Friend[];
  loading: boolean;
  error: string | null;

  fetchFriends: (userId: string) => Promise<void>;
  fetchPendingRequests: (userId: string) => Promise<void>;
  fetchRecommendations: (userId: string) => Promise<void>;
  fetchActivities: (userId: string, limit?: number) => Promise<void>;
  addFriend: (userId: string) => void;
  removeFriend: (friendId: string) => Promise<void>;
  sendFriendRequest: (friendId: string, message?: string) => Promise<void>;
  acceptFriendRequest: (requestId: string) => Promise<void>;
  declineFriendRequest: (requestId: string) => Promise<void>;
  praiseActivity: (activityId: string) => void;
  refreshFriends: (userId: string) => Promise<void>;
  clearError: () => void;
}

export const useFriendsStore = create<FriendsStore>()(
  devtools(
    (set, get) => ({
      friends: [],
      friendRequests: [],
      recommendations: [], // Fetched from API via fetchRecommendations
      activities: [], // Fetched from API via fetchActivities
      onlineFriends: [],
      loading: false,
      error: null,

      fetchFriends: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const friendships = await friendsAPI.getUserFriends(userId);

          // Convert friendships to Friend objects
          // Note: This requires fetching user details for each friend
          // For now, we'll create basic Friend objects
          const friends: Friend[] = friendships
            .filter((f) => f.status === 'accepted')
            .map((f) => ({
              userId: f.friend_id === userId ? f.user_id : f.friend_id,
              username: 'Friend User', // TODO: Fetch user details
              avatar: '/avatars/default.png',
              rank: 'al_mehen' as const,
              level: 1,
              xp: 0,
              mlCoins: 0,
              lastActive: new Date(f.updated_at),
              friendsSince: new Date(f.created_at),
              isOnline: false,
              commonInterests: [],
              mutualFriends: 0,
            }));

          set({ friends, loading: false });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to fetch friends', loading: false });
        }
      },

      fetchPendingRequests: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const pendingFriendships = await friendsAPI.getPendingRequests(userId);

          // Convert to FriendRequest objects
          const friendRequests: FriendRequest[] = pendingFriendships.map((f) => ({
            id: f.id,
            senderId: f.user_id,
            senderName: 'Friend User', // TODO: Fetch user details
            senderAvatar: '/avatars/default.png',
            senderRank: 'al_mehen' as const,
            senderLevel: 1,
            receiverId: f.friend_id,
            sentAt: new Date(f.created_at),
            status: f.status as any,
            message: undefined,
          }));

          set({ friendRequests, loading: false });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to fetch pending requests', loading: false });
        }
      },

      fetchRecommendations: async (userId: string) => {
        set({ loading: true, error: null });
        try {
          const recommendations = await friendsAPI.getFriendRecommendations(userId);
          // Transform API response to store format
          const mappedRecommendations: FriendRecommendation[] = recommendations.map((r) => ({
            userId: r.userId,
            username: r.username,
            avatar: r.avatar,
            rank: r.rank as any,
            level: r.level,
            mutualFriends: r.mutualFriends,
            commonInterests: r.commonInterests,
            matchScore: r.matchScore,
            reason: r.reason,
          }));
          set({ recommendations: mappedRecommendations, loading: false });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to fetch recommendations', loading: false });
        }
      },

      fetchActivities: async (userId: string, limit: number = 20) => {
        set({ loading: true, error: null });
        try {
          const activitiesData = await friendsAPI.getFriendActivities(userId, limit);
          // Transform API response to store format
          const activities: FriendActivity[] = activitiesData.map((a) => ({
            id: a.activity_id,
            userId: a.user_id,
            userName: '', // TODO: Join with user data
            userAvatar: '/avatars/default.png',
            type: a.activity_type as any,
            description: a.description,
            metadata: a.metadata || {},
            timestamp: new Date(a.created_at),
            praised: false,
            praiseCount: 0,
          }));
          set({ activities, loading: false });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to fetch activities', loading: false });
        }
      },

      addFriend: (userId: string) => {
        set((state) => {
          const recommendation = state.recommendations.find((r) => r.userId === userId);
          if (!recommendation) return state;

          const newFriend: Friend = {
            userId: recommendation.userId,
            username: recommendation.username,
            avatar: recommendation.avatar,
            rank: recommendation.rank,
            level: recommendation.level,
            xp: 0,
            mlCoins: 0,
            lastActive: new Date(),
            friendsSince: new Date(),
            isOnline: false,
            commonInterests: recommendation.commonInterests,
            mutualFriends: recommendation.mutualFriends,
          };

          return {
            friends: [...state.friends, newFriend],
            recommendations: state.recommendations.filter((r) => r.userId !== userId),
          };
        });
      },

      removeFriend: async (friendId: string) => {
        set({ loading: true, error: null });
        try {
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          await friendsAPI.removeFriend(currentUserId, friendId);

          set((state) => ({
            friends: state.friends.filter((f) => f.userId !== friendId),
            loading: false,
          }));
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to remove friend', loading: false });
        }
      },

      sendFriendRequest: async (friendId: string, _message?: string) => {
        set({ loading: true, error: null });
        try {
          const currentUserId = useAuthStore.getState().user?.id;
          if (!currentUserId) {
            throw new Error('User not authenticated');
          }

          await friendsAPI.sendFriendRequest({
            user_id: currentUserId,
            friend_id: friendId,
          });

          set({ loading: false });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to send friend request', loading: false });
        }
      },

      acceptFriendRequest: async (requestId: string) => {
        set({ loading: true, error: null });
        try {
          const friendship = await friendsAPI.acceptFriendRequest(requestId);

          // Remove from pending requests and add to friends
          set((state) => {
            const request = state.friendRequests.find((r) => r.id === requestId);
            if (!request) return { loading: false };

            const newFriend: Friend = {
              userId: request.senderId,
              username: request.senderName,
              avatar: request.senderAvatar,
              rank: request.senderRank,
              level: request.senderLevel,
              xp: 0,
              mlCoins: 0,
              lastActive: new Date(),
              friendsSince: new Date(friendship.updated_at),
              isOnline: false,
              commonInterests: [],
              mutualFriends: 0,
            };

            return {
              friends: [...state.friends, newFriend],
              friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
              loading: false,
            };
          });
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to accept friend request', loading: false });
        }
      },

      declineFriendRequest: async (requestId: string) => {
        set({ loading: true, error: null });
        try {
          await friendsAPI.rejectFriendRequest(requestId);

          set((state) => ({
            friendRequests: state.friendRequests.filter((r) => r.id !== requestId),
            loading: false,
          }));
        } catch (error: unknown) {
          set({ error: error.message || 'Failed to decline friend request', loading: false });
        }
      },

      praiseActivity: (activityId: string) => {
        set((state) => ({
          activities: state.activities.map((a) =>
            a.id === activityId ? { ...a, praised: !a.praised } : a,
          ),
        }));
      },

      refreshFriends: async (userId: string) => {
        const { fetchFriends, fetchPendingRequests, fetchRecommendations, fetchActivities } = get();
        await Promise.all([
          fetchFriends(userId),
          fetchPendingRequests(userId),
          fetchRecommendations(userId),
          fetchActivities(userId),
        ]);
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    { name: 'FriendsStore' },
  ),
);
