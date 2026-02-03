/**
 * Friends Controller
 *
 * REST API endpoints for friend management.
 * Provides high-level friend operations including search, leaderboards,
 * and friend request management.
 *
 * @module social/controllers
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 */

import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import {
  FriendsService,
  FriendProfile,
  FriendSearchResult,
  PendingRequest,
  SentRequest,
  LeaderboardEntry,
} from '../services/friends.service';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

/**
 * DTO for sending a friend request
 */
class SendFriendRequestDto {
  /**
   * ID of the user to send request to
   */
  recipientId: string;

  /**
   * Optional message to include with the request
   */
  message?: string;
}

/**
 * DTO for responding to a friend request
 */
class RespondToRequestDto {
  /**
   * True to accept, false to reject
   */
  accept: boolean;
}

@ApiTags('Social - Friends', 'social-public')
@ApiBearerAuth()
@Controller('friends')
@UseGuards(JwtAuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Get current user's friends list
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my friends list',
    description: 'Retrieves the list of all accepted friends for the current user',
  })
  @ApiResponse({
    status: 200,
    description: 'Friends list retrieved successfully',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          username: 'user_abc123',
          displayName: 'User ABC',
          avatarUrl: null,
          rank: 'Novato',
          level: 5,
          isOnline: true,
          lastActiveAt: '2026-02-03T10:00:00Z',
        },
      ],
    },
  })
  async getFriends(@CurrentUser('sub') userId: string): Promise<FriendProfile[]> {
    return this.friendsService.getFriends(userId);
  }

  /**
   * Search users to add as friends
   */
  @Get('search')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search users to add as friends',
    description: 'Search for users by username or display name. Returns friend status for each result.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query (minimum 2 characters)',
    required: true,
    example: 'john',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results (default 20)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiResponse({
    status: 200,
    description: 'Search results',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440002',
          username: 'john_user_1',
          displayName: 'John User 1',
          avatarUrl: null,
          rank: 'Novato',
          level: 3,
          isFriend: false,
          hasPendingRequest: false,
        },
      ],
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Search query too short',
  })
  async searchUsers(
    @CurrentUser('sub') userId: string,
    @Query('q') query: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit: number,
  ): Promise<FriendSearchResult[]> {
    return this.friendsService.searchUsers(userId, query, limit);
  }

  /**
   * Get pending friend requests (received)
   */
  @Get('requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get pending friend requests',
    description: 'Retrieves friend requests that the current user has received and not yet responded to',
  })
  @ApiResponse({
    status: 200,
    description: 'Pending requests retrieved successfully',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440001',
          requester: {
            id: '550e8400-e29b-41d4-a716-446655440003',
            username: 'user_xyz789',
            displayName: 'User XYZ',
            rank: 'Novato',
            level: 2,
          },
          createdAt: '2026-02-02T14:00:00Z',
          message: 'Hi! Let us be friends!',
        },
      ],
    },
  })
  async getPendingRequests(
    @CurrentUser('sub') userId: string,
  ): Promise<PendingRequest[]> {
    return this.friendsService.getPendingRequests(userId);
  }

  /**
   * Get sent friend requests
   */
  @Get('requests/sent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get sent friend requests',
    description: 'Retrieves friend requests that the current user has sent and are still pending',
  })
  @ApiResponse({
    status: 200,
    description: 'Sent requests retrieved successfully',
    schema: {
      example: [
        {
          id: '660e8400-e29b-41d4-a716-446655440002',
          recipient: {
            id: '550e8400-e29b-41d4-a716-446655440004',
            username: 'user_def456',
            displayName: 'User DEF',
            rank: 'Novato',
            level: 7,
          },
          createdAt: '2026-02-01T10:00:00Z',
        },
      ],
    },
  })
  async getSentRequests(@CurrentUser('sub') userId: string): Promise<SentRequest[]> {
    return this.friendsService.getSentRequests(userId);
  }

  /**
   * Get friends leaderboard
   */
  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get friends leaderboard',
    description: 'Retrieves a leaderboard of the current user and their friends ranked by the specified metric',
  })
  @ApiQuery({
    name: 'metric',
    description: 'Metric to rank by',
    required: false,
    enum: ['xp', 'level', 'streak'],
    example: 'xp',
  })
  @ApiResponse({
    status: 200,
    description: 'Leaderboard data retrieved successfully',
    schema: {
      example: [
        {
          rank: 1,
          user: {
            id: '550e8400-e29b-41d4-a716-446655440001',
            username: 'user_abc123',
            displayName: 'User ABC',
            rank: 'Experto',
            level: 15,
            isOnline: true,
          },
          value: 9500,
        },
        {
          rank: 2,
          user: {
            id: '550e8400-e29b-41d4-a716-446655440000',
            username: 'me',
            displayName: 'Me',
            rank: 'Novato',
            level: 5,
            isOnline: true,
          },
          value: 7200,
        },
      ],
    },
  })
  async getFriendsLeaderboard(
    @CurrentUser('sub') userId: string,
    @Query('metric') metric?: 'xp' | 'level' | 'streak',
  ): Promise<LeaderboardEntry[]> {
    return this.friendsService.getFriendsLeaderboard(userId, metric);
  }

  /**
   * Send friend request
   */
  @Post('request')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Send friend request',
    description: 'Sends a friend request to another user',
  })
  @ApiBody({
    type: SendFriendRequestDto,
    description: 'Friend request data',
    examples: {
      example1: {
        value: {
          recipientId: '550e8400-e29b-41d4-a716-446655440002',
          message: 'Hi! I would like to be your friend!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Friend request sent successfully',
    schema: {
      example: {
        id: '660e8400-e29b-41d4-a716-446655440003',
        requester_id: '550e8400-e29b-41d4-a716-446655440000',
        recipient_id: '550e8400-e29b-41d4-a716-446655440002',
        status: 'pending',
        message: 'Hi! I would like to be your friend!',
        created_at: '2026-02-03T12:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid request (self-request, too many requests, friend limit)',
  })
  @ApiResponse({
    status: 409,
    description: 'Already friends or request already pending',
  })
  async sendFriendRequest(
    @CurrentUser('sub') userId: string,
    @Body() dto: SendFriendRequestDto,
  ) {
    return this.friendsService.sendFriendRequest(
      userId,
      dto.recipientId,
      dto.message,
    );
  }

  /**
   * Accept or reject friend request
   */
  @Post('request/:id/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Respond to friend request',
    description: 'Accept or reject a pending friend request',
  })
  @ApiParam({
    name: 'id',
    description: 'Friend request ID',
    type: String,
    example: '660e8400-e29b-41d4-a716-446655440001',
  })
  @ApiBody({
    type: RespondToRequestDto,
    description: 'Response to the request',
    examples: {
      accept: {
        summary: 'Accept request',
        value: { accept: true },
      },
      reject: {
        summary: 'Reject request',
        value: { accept: false },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Response recorded successfully',
    schema: {
      example: { success: true },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Friend limit reached',
  })
  @ApiResponse({
    status: 404,
    description: 'Friend request not found',
  })
  async respondToRequest(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) requestId: string,
    @Body() dto: RespondToRequestDto,
  ): Promise<{ success: boolean }> {
    await this.friendsService.respondToRequest(requestId, userId, dto.accept);
    return { success: true };
  }

  /**
   * Cancel a sent friend request
   */
  @Delete('request/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Cancel friend request',
    description: 'Cancel a friend request that the current user has sent',
  })
  @ApiParam({
    name: 'id',
    description: 'Friend request ID',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Request cancelled successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Friend request not found',
  })
  async cancelRequest(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) requestId: string,
  ): Promise<void> {
    return this.friendsService.cancelRequest(requestId, userId);
  }

  /**
   * Remove friend
   */
  @Delete(':friendId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove friend',
    description: 'Remove a user from the current user\'s friends list',
  })
  @ApiParam({
    name: 'friendId',
    description: 'Friend user ID',
    type: String,
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @ApiResponse({
    status: 204,
    description: 'Friend removed successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Friendship not found',
  })
  async removeFriend(
    @CurrentUser('sub') userId: string,
    @Param('friendId', ParseUUIDPipe) friendId: string,
  ): Promise<void> {
    return this.friendsService.removeFriend(userId, friendId);
  }
}
