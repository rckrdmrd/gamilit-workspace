/**
 * Friends Service
 *
 * Manages friend relationships, requests, and social interactions.
 * Provides high-level API for friend management including search,
 * leaderboards, and friend profiles.
 *
 * @module social/services
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Friendship } from '../entities/friendship.entity';
import { FriendRequest } from '../entities/friend-request.entity';
import { FriendshipStatusEnum } from '@shared/constants/enums.constants';

// Constants
const MAX_FRIENDS = 100;
const MAX_REQUESTS_PER_HOUR = 10;

/**
 * Friend profile information
 */
export interface FriendProfile {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rank?: string;
  level?: number;
  isOnline?: boolean;
  lastActiveAt?: Date;
}

/**
 * User search result with friend status
 */
export interface FriendSearchResult {
  id: string;
  username: string;
  displayName: string;
  avatarUrl?: string;
  rank?: string;
  level?: number;
  isFriend: boolean;
  hasPendingRequest: boolean;
}

/**
 * Pending friend request with requester profile
 */
export interface PendingRequest {
  id: string;
  requester: FriendProfile;
  createdAt: Date;
  message?: string;
}

/**
 * Sent friend request with recipient profile
 */
export interface SentRequest {
  id: string;
  recipient: FriendProfile;
  createdAt: Date;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  user: FriendProfile;
  value: number;
}

@Injectable()
export class FriendsService {
  private readonly logger = new Logger(FriendsService.name);

  constructor(
    @InjectRepository(Friendship, 'social')
    private readonly friendshipRepository: Repository<Friendship>,
    @InjectRepository(FriendRequest, 'social')
    private readonly friendRequestRepository: Repository<FriendRequest>,
  ) {}

  /**
   * Get all friends for a user
   * @param userId - ID of the user
   * @returns List of friend profiles
   */
  async getFriends(userId: string): Promise<FriendProfile[]> {
    this.logger.log(`Getting friends for user ${userId}`);

    const friendships = await this.friendshipRepository.find({
      where: [
        { user_id: userId, status: FriendshipStatusEnum.ACCEPTED },
        { friend_id: userId, status: FriendshipStatusEnum.ACCEPTED },
      ],
      order: { updated_at: 'DESC' },
    });

    // Extract friend IDs
    const friendIds = friendships.map((f) =>
      f.user_id === userId ? f.friend_id : f.user_id,
    );

    // In production, fetch full profiles from ProfilesService
    // For now, return mock profile data
    return friendIds.map((id) => ({
      id,
      username: `user_${id.substring(0, 8)}`,
      displayName: `User ${id.substring(0, 8)}`,
      avatarUrl: undefined,
      rank: 'Novato',
      level: 1,
      isOnline: Math.random() > 0.5,
      lastActiveAt: new Date(),
    }));
  }

  /**
   * Search users to add as friends
   * @param userId - Current user ID
   * @param query - Search query (min 2 chars)
   * @param limit - Max results (default 20)
   * @returns Search results with friend status
   */
  async searchUsers(
    userId: string,
    query: string,
    limit = 20,
  ): Promise<FriendSearchResult[]> {
    this.logger.log(`Searching users with query: ${query}`);

    if (query.length < 2) {
      throw new BadRequestException(
        'Search query must be at least 2 characters',
      );
    }

    // Get current friends
    const friendIds = await this.getFriendIds(userId);

    // Get pending requests (sent and received)
    const pendingRequests = await this.friendRequestRepository.find({
      where: [
        { requester_id: userId, status: 'pending' },
        { recipient_id: userId, status: 'pending' },
      ],
    });

    const pendingUserIds = new Set([
      ...pendingRequests.map((r) => r.requester_id),
      ...pendingRequests.map((r) => r.recipient_id),
    ]);

    // In production, search in ProfilesService
    // For now, return mock search results
    const mockResults: FriendSearchResult[] = Array.from(
      { length: Math.min(limit, 10) },
      (_, i) => {
        const id = `mock-user-${i}-${Date.now()}`;
        return {
          id,
          username: `${query.toLowerCase()}_user_${i}`,
          displayName: `${query} User ${i + 1}`,
          avatarUrl: undefined,
          rank: 'Novato',
          level: Math.floor(Math.random() * 10) + 1,
          isFriend: friendIds.has(id),
          hasPendingRequest: pendingUserIds.has(id),
        };
      },
    );

    // Filter out self
    return mockResults.filter((r) => r.id !== userId);
  }

  /**
   * Send friend request
   * @param requesterId - ID of user sending request
   * @param recipientId - ID of user receiving request
   * @param message - Optional message
   * @returns Created friend request
   */
  async sendFriendRequest(
    requesterId: string,
    recipientId: string,
    message?: string,
  ): Promise<FriendRequest> {
    this.logger.log(
      `Sending friend request from ${requesterId} to ${recipientId}`,
    );

    // Validations
    if (requesterId === recipientId) {
      throw new BadRequestException('Cannot send friend request to yourself');
    }

    // Check if already friends
    const existingFriendship = await this.friendshipRepository.findOne({
      where: [
        {
          user_id: requesterId,
          friend_id: recipientId,
          status: FriendshipStatusEnum.ACCEPTED,
        },
        {
          user_id: recipientId,
          friend_id: requesterId,
          status: FriendshipStatusEnum.ACCEPTED,
        },
      ],
    });

    if (existingFriendship) {
      throw new ConflictException('Already friends with this user');
    }

    // Check for existing pending request
    const existingRequest = await this.friendRequestRepository.findOne({
      where: [
        { requester_id: requesterId, recipient_id: recipientId, status: 'pending' },
        { requester_id: recipientId, recipient_id: requesterId, status: 'pending' },
      ],
    });

    if (existingRequest) {
      throw new ConflictException('Friend request already pending');
    }

    // Check friend limit
    const friendCount = await this.getFriendCount(requesterId);
    if (friendCount >= MAX_FRIENDS) {
      throw new BadRequestException(
        `Cannot have more than ${MAX_FRIENDS} friends`,
      );
    }

    // Check rate limit (simplified - in production use Redis)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const recentRequests = await this.friendRequestRepository
      .createQueryBuilder('fr')
      .where('fr.requester_id = :requesterId', { requesterId })
      .andWhere('fr.created_at > :oneHourAgo', { oneHourAgo })
      .getCount();

    if (recentRequests >= MAX_REQUESTS_PER_HOUR) {
      throw new BadRequestException(
        'Too many friend requests. Please wait before sending more.',
      );
    }

    // Create request
    const friendRequest = this.friendRequestRepository.create({
      requester_id: requesterId,
      recipient_id: recipientId,
      message: message || undefined,
      status: 'pending',
    });

    await this.friendRequestRepository.save(friendRequest);
    this.logger.log(`Friend request created: ${friendRequest.id}`);

    // TODO: Send notification to recipient

    return friendRequest;
  }

  /**
   * Get pending friend requests (received)
   * @param userId - User ID
   * @returns List of pending requests with requester profiles
   */
  async getPendingRequests(userId: string): Promise<PendingRequest[]> {
    this.logger.log(`Getting pending requests for user ${userId}`);

    const requests = await this.friendRequestRepository.find({
      where: { recipient_id: userId, status: 'pending' },
      order: { created_at: 'DESC' },
    });

    return requests.map((r) => ({
      id: r.id,
      requester: {
        id: r.requester_id,
        username: `user_${r.requester_id.substring(0, 8)}`,
        displayName: `User ${r.requester_id.substring(0, 8)}`,
        rank: 'Novato',
        level: 1,
      },
      createdAt: r.created_at,
      message: r.message,
    }));
  }

  /**
   * Get sent friend requests
   * @param userId - User ID
   * @returns List of sent requests with recipient profiles
   */
  async getSentRequests(userId: string): Promise<SentRequest[]> {
    const requests = await this.friendRequestRepository.find({
      where: { requester_id: userId, status: 'pending' },
      order: { created_at: 'DESC' },
    });

    return requests.map((r) => ({
      id: r.id,
      recipient: {
        id: r.recipient_id,
        username: `user_${r.recipient_id.substring(0, 8)}`,
        displayName: `User ${r.recipient_id.substring(0, 8)}`,
        rank: 'Novato',
        level: 1,
      },
      createdAt: r.created_at,
    }));
  }

  /**
   * Respond to friend request
   * @param requestId - Friend request ID
   * @param userId - Responding user ID
   * @param accept - True to accept, false to reject
   */
  async respondToRequest(
    requestId: string,
    userId: string,
    accept: boolean,
  ): Promise<void> {
    this.logger.log(
      `Responding to request ${requestId}: ${accept ? 'accept' : 'reject'}`,
    );

    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, recipient_id: userId, status: 'pending' },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    if (accept) {
      // Check friend limit for both users
      const requesterFriendCount = await this.getFriendCount(request.requester_id);
      const recipientFriendCount = await this.getFriendCount(userId);

      if (
        requesterFriendCount >= MAX_FRIENDS ||
        recipientFriendCount >= MAX_FRIENDS
      ) {
        throw new BadRequestException('Friend limit reached');
      }

      // Create friendship
      const friendship = this.friendshipRepository.create({
        user_id: request.requester_id,
        friend_id: userId,
        status: FriendshipStatusEnum.ACCEPTED,
      });
      await this.friendshipRepository.save(friendship);

      // Update request status
      request.status = 'accepted';
      request.responded_at = new Date();
      await this.friendRequestRepository.save(request);

      // TODO: Send notification to requester
      this.logger.log(
        `Friendship created between ${request.requester_id} and ${userId}`,
      );
    } else {
      // Reject request
      request.status = 'rejected';
      request.responded_at = new Date();
      await this.friendRequestRepository.save(request);
      this.logger.log(`Friend request ${requestId} rejected`);
    }
  }

  /**
   * Remove friend
   * @param userId - User ID
   * @param friendId - Friend ID to remove
   */
  async removeFriend(userId: string, friendId: string): Promise<void> {
    this.logger.log(`Removing friendship between ${userId} and ${friendId}`);

    const friendship = await this.friendshipRepository.findOne({
      where: [
        { user_id: userId, friend_id: friendId, status: FriendshipStatusEnum.ACCEPTED },
        { user_id: friendId, friend_id: userId, status: FriendshipStatusEnum.ACCEPTED },
      ],
    });

    if (!friendship) {
      throw new NotFoundException('Friendship not found');
    }

    await this.friendshipRepository.remove(friendship);
    this.logger.log('Friendship removed');
  }

  /**
   * Get friends leaderboard
   * @param userId - User ID
   * @param metric - Metric to rank by (xp, level, streak)
   * @returns Leaderboard entries
   */
  async getFriendsLeaderboard(
    userId: string,
    _metric: 'xp' | 'level' | 'streak' = 'xp',
  ): Promise<LeaderboardEntry[]> {
    const friends = await this.getFriends(userId);

    // Add the user themselves
    const allUsers: FriendProfile[] = [
      ...friends,
      {
        id: userId,
        username: 'me',
        displayName: 'Me',
        rank: 'Novato',
        level: 1,
        isOnline: true,
      },
    ];

    // Mock leaderboard data - in production, fetch from gamification service based on _metric
    const leaderboard = allUsers.map((user) => ({
      user,
      value: Math.floor(Math.random() * 10000),
    }));

    // Sort by value descending
    leaderboard.sort((a, b) => b.value - a.value);

    // Add ranks
    return leaderboard.map((entry, index) => ({
      rank: index + 1,
      user: entry.user,
      value: entry.value,
    }));
  }

  /**
   * Cancel a sent friend request
   * @param requestId - Friend request ID
   * @param userId - User ID (must be the requester)
   */
  async cancelRequest(requestId: string, userId: string): Promise<void> {
    this.logger.log(`Cancelling friend request ${requestId} by user ${userId}`);

    const request = await this.friendRequestRepository.findOne({
      where: { id: requestId, requester_id: userId, status: 'pending' },
    });

    if (!request) {
      throw new NotFoundException('Friend request not found');
    }

    request.status = 'cancelled';
    request.responded_at = new Date();
    await this.friendRequestRepository.save(request);
    this.logger.log(`Friend request ${requestId} cancelled`);
  }

  // ==================== Private Methods ====================

  /**
   * Get friend IDs for a user
   * @param userId - User ID
   * @returns Set of friend IDs
   */
  private async getFriendIds(userId: string): Promise<Set<string>> {
    const friendships = await this.friendshipRepository.find({
      where: [
        { user_id: userId, status: FriendshipStatusEnum.ACCEPTED },
        { friend_id: userId, status: FriendshipStatusEnum.ACCEPTED },
      ],
    });

    const ids = new Set<string>();
    friendships.forEach((f) => {
      ids.add(f.user_id === userId ? f.friend_id : f.user_id);
    });

    return ids;
  }

  /**
   * Get friend count for a user
   * @param userId - User ID
   * @returns Number of friends
   */
  private async getFriendCount(userId: string): Promise<number> {
    const count = await this.friendshipRepository.count({
      where: [
        { user_id: userId, status: FriendshipStatusEnum.ACCEPTED },
        { friend_id: userId, status: FriendshipStatusEnum.ACCEPTED },
      ],
    });
    return count;
  }
}
