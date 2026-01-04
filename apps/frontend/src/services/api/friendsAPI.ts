/**
 * Friends API Integration
 *
 * API client for social friendship features including friend requests,
 * friend lists, and friendship management.
 */

import { apiClient } from '@/services/api/apiClient';
import { handleAPIError } from './apiErrorHandler';

// ============================================================================
// TYPE DEFINITIONS (aligned with backend DTOs)
// ============================================================================

/**
 * Friendship status types
 */
export type FriendshipStatus = 'pending' | 'accepted' | 'rejected' | 'blocked';

/**
 * Friendship DTO from backend
 */
export interface FriendshipDTO {
  id: string;
  user_id: string;
  friend_id: string;
  status: FriendshipStatus;
  created_at: string;
  updated_at: string;
}

/**
 * Create friendship request payload
 */
export interface CreateFriendshipRequest {
  user_id: string;
  friend_id: string;
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

/**
 * Get all friends for a user
 *
 * @description Fetches all friendship relationships for a user (friends and requests)
 *
 * @param userId - User UUID
 * @returns Promise<FriendshipDTO[]>
 *
 * @endpoint GET /api/v1/social/users/:userId/friends
 *
 * @example
 * ```ts
 * const friends = await friendsAPI.getUserFriends('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getUserFriends(userId: string): Promise<FriendshipDTO[]> {
  try {
    const response = await apiClient.get<FriendshipDTO[]>(`/social/users/${userId}/friends`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch user friends');
  }
}

/**
 * Get pending friend requests (received)
 *
 * @description Fetches pending friend requests received by the user
 *
 * @param userId - User UUID
 * @returns Promise<FriendshipDTO[]>
 *
 * @endpoint GET /api/v1/social/users/:userId/friends/pending
 *
 * @example
 * ```ts
 * const pending = await friendsAPI.getPendingRequests('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getPendingRequests(userId: string): Promise<FriendshipDTO[]> {
  try {
    const response = await apiClient.get<FriendshipDTO[]>(
      `/social/users/${userId}/friends/pending`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch pending friend requests');
  }
}

/**
 * Get sent friend requests
 *
 * @description Fetches friend requests sent by the user
 *
 * @param userId - User UUID
 * @returns Promise<FriendshipDTO[]>
 *
 * @endpoint GET /api/v1/social/users/:userId/friends/sent
 *
 * @example
 * ```ts
 * const sent = await friendsAPI.getSentRequests('550e8400-e29b-41d4-a716-446655440000');
 * ```
 */
export async function getSentRequests(userId: string): Promise<FriendshipDTO[]> {
  try {
    const response = await apiClient.get<FriendshipDTO[]>(`/social/users/${userId}/friends/sent`);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch sent friend requests');
  }
}

/**
 * Send a friend request
 *
 * @description Sends a friend request to another user
 *
 * @param data - Friend request data (user_id, friend_id)
 * @returns Promise<FriendshipDTO>
 *
 * @endpoint POST /api/v1/social/friendships/request
 *
 * @example
 * ```ts
 * const request = await friendsAPI.sendFriendRequest({
 *   user_id: '550e8400-e29b-41d4-a716-446655440000',
 *   friend_id: '550e8400-e29b-41d4-a716-446655440002'
 * });
 * ```
 */
export async function sendFriendRequest(data: CreateFriendshipRequest): Promise<FriendshipDTO> {
  try {
    const response = await apiClient.post<FriendshipDTO>('/social/friendships/request', data);
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to send friend request');
  }
}

/**
 * Accept a friend request
 *
 * @description Accepts a pending friend request
 *
 * @param requestId - Friend request UUID
 * @returns Promise<FriendshipDTO>
 *
 * @endpoint PATCH /api/v1/social/friendships/:id/accept
 *
 * @example
 * ```ts
 * const accepted = await friendsAPI.acceptFriendRequest('660e8400-e29b-41d4-a716-446655440003');
 * ```
 */
export async function acceptFriendRequest(requestId: string): Promise<FriendshipDTO> {
  try {
    const response = await apiClient.patch<FriendshipDTO>(
      `/social/friendships/${requestId}/accept`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to accept friend request');
  }
}

/**
 * Reject a friend request
 *
 * @description Rejects a pending friend request
 *
 * @param requestId - Friend request UUID
 * @returns Promise<FriendshipDTO>
 *
 * @endpoint PATCH /api/v1/social/friendships/:id/reject
 *
 * @example
 * ```ts
 * const rejected = await friendsAPI.rejectFriendRequest('660e8400-e29b-41d4-a716-446655440003');
 * ```
 */
export async function rejectFriendRequest(requestId: string): Promise<FriendshipDTO> {
  try {
    const response = await apiClient.patch<FriendshipDTO>(
      `/social/friendships/${requestId}/reject`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to reject friend request');
  }
}

/**
 * Remove a friend
 *
 * @description Removes an existing friendship
 *
 * @param userId - User UUID
 * @param friendId - Friend UUID
 * @returns Promise<void>
 *
 * @endpoint DELETE /api/v1/social/users/:userId/friends/:friendId
 *
 * @example
 * ```ts
 * await friendsAPI.removeFriend('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002');
 * ```
 */
export async function removeFriend(userId: string, friendId: string): Promise<void> {
  try {
    await apiClient.delete(`/social/users/${userId}/friends/${friendId}`);
  } catch (error) {
    throw handleAPIError(error, 'Failed to remove friend');
  }
}

/**
 * Block a user
 *
 * @description Blocks a user, preventing friendship
 *
 * @param userId - User UUID
 * @param friendId - User to block UUID
 * @returns Promise<FriendshipDTO>
 *
 * @endpoint POST /api/v1/social/users/:userId/block/:friendId
 *
 * @example
 * ```ts
 * const blocked = await friendsAPI.blockUser('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002');
 * ```
 */
export async function blockUser(userId: string, friendId: string): Promise<FriendshipDTO> {
  try {
    const response = await apiClient.post<FriendshipDTO>(
      `/social/users/${userId}/block/${friendId}`,
    );
    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to block user');
  }
}

/**
 * Unblock a user
 *
 * @description Unblocks a previously blocked user
 *
 * @param userId - User UUID
 * @param friendId - User to unblock UUID
 * @returns Promise<void>
 *
 * @endpoint DELETE /api/v1/social/users/:userId/block/:friendId
 *
 * @example
 * ```ts
 * await friendsAPI.unblockUser('550e8400-e29b-41d4-a716-446655440000', '550e8400-e29b-41d4-a716-446655440002');
 * ```
 */
export async function unblockUser(userId: string, friendId: string): Promise<void> {
  try {
    await apiClient.delete(`/social/users/${userId}/block/${friendId}`);
  } catch (error) {
    throw handleAPIError(error, 'Failed to unblock user');
  }
}

// ============================================================================
// ACTIVITY TYPES (aligned with backend DTOs)
// ============================================================================

/**
 * Activity DTO from backend
 */
export interface ActivityDTO {
  activity_id: string;
  user_id: string;
  activity_type: 'achievement' | 'level_up' | 'exercise' | 'rankup' | 'milestone';
  title: string;
  description: string;
  metadata?: Record<string, unknown>;
  is_public: boolean;
  created_at: string;
}

/**
 * Friend Recommendation type (not yet supported by backend)
 */
export interface FriendRecommendation {
  userId: string;
  username: string;
  avatar: string;
  rank: string;
  level: number;
  mutualFriends: number;
  commonInterests: string[];
  matchScore: number;
  reason: string;
}

// ============================================================================
// FRIEND ACTIVITIES API
// ============================================================================

/**
 * Get friend activities feed
 *
 * @description Fetches activity feed for a user's friends
 *
 * @param userId - User UUID (to fetch their friends first)
 * @param limit - Max number of activities (default 20)
 * @returns Promise<ActivityDTO[]>
 *
 * @endpoint GET /api/v1/social/activities/feed?friendIds=...
 *
 * @example
 * ```ts
 * const activities = await friendsAPI.getFriendActivities('user-id', 20);
 * ```
 */
export async function getFriendActivities(userId: string, limit: number = 20): Promise<ActivityDTO[]> {
  try {
    // First get the user's friends
    const friendships = await getUserFriends(userId);
    const acceptedFriends = friendships.filter(f => f.status === 'accepted');

    if (acceptedFriends.length === 0) {
      return []; // No friends, no activities
    }

    // Get friend IDs
    const friendIds = acceptedFriends.map(f =>
      f.friend_id === userId ? f.user_id : f.friend_id
    );

    // Fetch activities from the feed endpoint
    const response = await apiClient.get<ActivityDTO[]>(
      '/social/activities/feed',
      { params: { friendIds: friendIds.join(','), limit } }
    );

    return response.data;
  } catch (error) {
    throw handleAPIError(error, 'Failed to fetch friend activities');
  }
}

/**
 * Get friend recommendations
 *
 * @description Returns friend recommendations for the user
 *
 * NOTE: Backend endpoint `/gamification/friends/recommendations` does not exist yet.
 * This function returns an empty array until the backend is implemented.
 *
 * @param _userId - User UUID (not used yet)
 * @returns Promise<FriendRecommendation[]>
 *
 * @todo Implement backend endpoint for friend recommendations
 *       Potential sources: same classroom, similar level, mutual friends
 */
export async function getFriendRecommendations(_userId: string): Promise<FriendRecommendation[]> {
  // TODO: Backend endpoint not implemented yet
  // When implemented, this should call: GET /api/v1/gamification/friends/recommendations
  // Returning empty array to indicate no mock data
  return [];
}

// ============================================================================
// EXPORTS
// ============================================================================

/**
 * Friends API namespace
 *
 * @usage
 * ```ts
 * import { friendsAPI } from '@/services/api/friendsAPI';
 *
 * const friends = await friendsAPI.getUserFriends('user-id');
 * await friendsAPI.sendFriendRequest({ user_id: 'id1', friend_id: 'id2' });
 * ```
 */
export const friendsAPI = {
  getUserFriends,
  getPendingRequests,
  getSentRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  removeFriend,
  blockUser,
  unblockUser,
  getFriendActivities,
  getFriendRecommendations,
};

export default friendsAPI;
