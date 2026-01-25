/**
 * useFriends Hook
 *
 * @description Hook for managing friends and friend requests with API integration
 * @updated 2025-12-29 - Added fetchRecommendations and fetchActivities
 */

import { useEffect, useCallback, useState, useMemo } from 'react';
import { useFriendsStore } from '../store/friendsStore';
import { useAuthStore } from '@/features/auth/store/authStore';
import { apiClient } from '@/services/api/apiClient';

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
  const [searchResults, setSearchResults] = useState<Array<{ id: string; displayName: string; avatarUrl: string | null; username: string }>>([]);

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
   * Calls backend endpoint: GET /users/search?query=...
   */
  const searchUsers = useCallback(async (query: string) => {
    setSearchQuery(query);

    // Don't search if query is too short
    if (query.length < 2) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    setSearchLoading(true);
    try {
      const response = await apiClient.get(`/users/search?query=${encodeURIComponent(query)}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Filter recommendations based on search query
  // If search results from backend are available, use those instead
  const filteredRecommendations = useMemo(() => {
    if (!searchQuery.trim()) {
      return recommendations;
    }

    // If we have search results from backend, return empty
    // (search results will be shown separately)
    if (searchResults.length > 0) {
      return [];
    }

    // Fallback to local filter while backend search is loading
    const query = searchQuery.toLowerCase();
    return recommendations.filter(
      (rec) =>
        rec.username.toLowerCase().includes(query) ||
        rec.reason.toLowerCase().includes(query) ||
        rec.commonInterests.some((interest) => interest.toLowerCase().includes(query))
    );
  }, [recommendations, searchQuery, searchResults]);

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
    searchResults,

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
