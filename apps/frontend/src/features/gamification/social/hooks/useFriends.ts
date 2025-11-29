/**
 * useFriends Hook
 *
 * Hook for managing friends and friend requests with API integration
 */

import { useEffect } from 'react';
import { useFriendsStore } from '../store/friendsStore';
import { useAuthStore } from '@/features/auth/store/authStore';

export const useFriends = () => {
  const {
    friends,
    friendRequests,
    recommendations,
    activities,
    onlineFriends,
    loading,
    error,
    fetchFriends,
    fetchPendingRequests,
    addFriend,
    removeFriend,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    praiseActivity,
    refreshFriends,
    clearError,
  } = useFriendsStore();

  const currentUser = useAuthStore((state) => state.user);

  // Auto-fetch friends and requests when user is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      fetchFriends(currentUser.id);
      fetchPendingRequests(currentUser.id);
    }
  }, [currentUser?.id, fetchFriends, fetchPendingRequests]);

  const getPendingRequests = () => {
    return friendRequests.filter((r) => r.status === 'pending');
  };

  const getTopRecommendations = (limit: number = 5) => {
    return recommendations.slice(0, limit);
  };

  const getRecentActivities = (limit: number = 10) => {
    return activities.slice(0, limit);
  };

  const getFriendById = (userId: string) => {
    return friends.find((f) => f.userId === userId);
  };

  const getOnlineCount = () => {
    return onlineFriends.length;
  };

  const getTotalFriends = () => {
    return friends.length;
  };

  const handleRefreshFriends = async () => {
    if (currentUser?.id) {
      await refreshFriends(currentUser.id);
    }
  };

  return {
    // State
    friends,
    friendRequests,
    recommendations,
    activities,
    onlineFriends,
    loading,
    error,

    // Actions
    addFriend,
    removeFriend,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    praiseActivity,
    refreshFriends: handleRefreshFriends,
    clearError,

    // Computed values
    getPendingRequests,
    getTopRecommendations,
    getRecentActivities,
    getFriendById,
    getOnlineCount,
    getTotalFriends,
  };
};
