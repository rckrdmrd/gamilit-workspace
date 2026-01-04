/**
 * useFriends Hook
 *
 * @description Hook for managing friends and friend requests with API integration
 * @updated 2025-12-29 - Added fetchRecommendations and fetchActivities
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
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
    fetchRecommendations,
    fetchActivities,
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

  // Search state for user search functionality
  const [searchQuery, setSearchQuery] = useState('');
  const [searchLoading, setSearchLoading] = useState(false);

  // Auto-fetch friends, requests, recommendations and activities when user is authenticated
  useEffect(() => {
    if (currentUser?.id) {
      fetchFriends(currentUser.id);
      fetchPendingRequests(currentUser.id);
      fetchRecommendations(currentUser.id);
      fetchActivities(currentUser.id);
    }
  }, [currentUser?.id, fetchFriends, fetchPendingRequests, fetchRecommendations, fetchActivities]);

  /**
   * Search for users to add as friends
   *
   * NOTE: Backend user search endpoint not implemented yet.
   * Currently filters recommendations by name.
   * When backend is ready, this should call: GET /api/v1/users/search?query=...
   *
   * @todo Implement backend endpoint for user search
   */
  const searchUsers = useCallback((query: string) => {
    setSearchQuery(query);
    setSearchLoading(true);

    // TODO: Call backend search endpoint when available
    // For now, this just triggers a filter on recommendations
    // which is handled by filteredRecommendations below

    // Simulate async behavior for future API call
    setTimeout(() => setSearchLoading(false), 100);
  }, []);

  // Filter recommendations based on search query
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) {
      return recommendations;
    }

    const query = searchQuery.toLowerCase();
    return recommendations.filter(
      (rec) =>
        rec.username.toLowerCase().includes(query) ||
        rec.reason.toLowerCase().includes(query) ||
        rec.commonInterests.some((interest) => interest.toLowerCase().includes(query))
    );
  }, [recommendations, searchQuery]);

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

    // Search state
    searchQuery,
    searchLoading,

    // Actions
    addFriend,
    removeFriend,
    sendFriendRequest,
    acceptFriendRequest,
    declineFriendRequest,
    praiseActivity,
    refreshFriends: handleRefreshFriends,
    clearError,
    searchUsers,

    // Computed values
    getPendingRequests,
    getTopRecommendations,
    getRecentActivities,
    getFriendById,
    getOnlineCount,
    getTotalFriends,
    filteredRecommendations,
  };
};
