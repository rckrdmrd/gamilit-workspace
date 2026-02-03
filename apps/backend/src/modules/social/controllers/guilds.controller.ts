/**
 * Guilds Controller
 *
 * REST API endpoints for guild management.
 * Provides functionality for guild CRUD, member management,
 * join requests, and leadership operations.
 *
 * @module social/controllers
 * @sprint 5 - EAI-003-EXT Gamificacion Social
 */

import {
  Controller,
  Get,
  Post,
  Put,
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
  GuildsService,
  CreateGuildDto,
  UpdateGuildDto,
  GuildResponse,
} from '../services/guilds.service';
import { GuildJoinRequest } from '../entities/guild-join-request.entity';
import { GuildMission, GuildMissionStatus } from '../entities/guild-mission.entity';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '@shared/decorators/current-user.decorator';

/**
 * DTO for creating a guild
 */
class CreateGuildBodyDto implements CreateGuildDto {
  /**
   * Guild name (unique, max 30 characters)
   */
  name: string;

  /**
   * Guild description
   */
  description?: string;

  /**
   * ID of the guild emblem (default: 1)
   */
  emblemId?: number;

  /**
   * Whether the guild is public (default: true)
   */
  isPublic?: boolean;
}

/**
 * DTO for updating a guild
 */
class UpdateGuildBodyDto implements UpdateGuildDto {
  /**
   * New guild name
   */
  name?: string;

  /**
   * New guild description
   */
  description?: string;

  /**
   * New emblem ID
   */
  emblemId?: number;

  /**
   * Whether the guild is public
   */
  isPublic?: boolean;
}

/**
 * DTO for join request
 */
class JoinRequestBodyDto {
  /**
   * Optional message to include with the request
   */
  message?: string;
}

/**
 * DTO for responding to join request
 */
class RespondToRequestDto {
  /**
   * True to accept, false to reject
   */
  accept: boolean;
}

@ApiTags('Social - Guilds', 'social-public')
@ApiBearerAuth()
@Controller('guilds')
@UseGuards(JwtAuthGuard)
export class GuildsController {
  constructor(private readonly guildsService: GuildsService) {}

  // =====================================================
  // GUILD CRUD
  // =====================================================

  /**
   * Create a new guild
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new guild',
    description: 'Creates a new guild with the current user as the leader. User must not be a member of another guild.',
  })
  @ApiBody({
    type: CreateGuildBodyDto,
    description: 'Guild creation data',
    examples: {
      example1: {
        value: {
          name: 'The Champions',
          description: 'A guild for top performers',
          emblemId: 1,
          isPublic: true,
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Guild created successfully',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'The Champions',
        description: 'A guild for top performers',
        emblemId: 1,
        leaderId: '550e8400-e29b-41d4-a716-446655440000',
        memberCount: 1,
        level: 1,
        totalXp: 0,
        isPublic: true,
        createdAt: '2026-02-03T10:00:00Z',
      },
    },
  })
  @ApiResponse({
    status: 409,
    description: 'Already a member of a guild or name already exists',
  })
  async createGuild(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateGuildBodyDto,
  ): Promise<GuildResponse> {
    return this.guildsService.createGuild(userId, dto);
  }

  /**
   * Search guilds
   */
  @Get()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Search guilds',
    description: 'Search for public guilds by name. Returns paginated results.',
  })
  @ApiQuery({
    name: 'q',
    description: 'Search query for guild name',
    required: false,
    example: 'champions',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results (default 20)',
    required: false,
    type: Number,
    example: 20,
  })
  @ApiQuery({
    name: 'offset',
    description: 'Offset for pagination (default 0)',
    required: false,
    type: Number,
    example: 0,
  })
  @ApiResponse({
    status: 200,
    description: 'List of guilds',
    schema: {
      example: {
        guilds: [
          {
            id: '550e8400-e29b-41d4-a716-446655440001',
            name: 'The Champions',
            description: 'A guild for top performers',
            emblemId: 1,
            leaderId: '550e8400-e29b-41d4-a716-446655440000',
            memberCount: 15,
            level: 5,
            totalXp: 50000,
            isPublic: true,
            createdAt: '2026-01-15T10:00:00Z',
          },
        ],
        total: 1,
      },
    },
  })
  async searchGuilds(
    @Query('q') query?: string,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit?: number,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset?: number,
  ): Promise<{ guilds: GuildResponse[]; total: number }> {
    return this.guildsService.searchGuilds(query, limit, offset);
  }

  /**
   * Get guild leaderboard
   */
  @Get('leaderboard')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get guild leaderboard',
    description: 'Returns top guilds ranked by total XP',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Maximum number of results (default 10)',
    required: false,
    type: Number,
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Guild leaderboard',
    schema: {
      example: [
        {
          id: '550e8400-e29b-41d4-a716-446655440001',
          name: 'The Champions',
          memberCount: 20,
          level: 10,
          totalXp: 150000,
          isPublic: true,
        },
      ],
    },
  })
  async getLeaderboard(
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ): Promise<GuildResponse[]> {
    return this.guildsService.getGuildLeaderboard(limit);
  }

  /**
   * Get current user's guild
   */
  @Get('my')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get my guild',
    description: 'Returns the current user\'s guild with all members, or null if not in a guild',
  })
  @ApiResponse({
    status: 200,
    description: 'User\'s guild or null',
    schema: {
      example: {
        id: '550e8400-e29b-41d4-a716-446655440001',
        name: 'The Champions',
        description: 'A guild for top performers',
        emblemId: 1,
        leaderId: '550e8400-e29b-41d4-a716-446655440000',
        memberCount: 15,
        level: 5,
        totalXp: 50000,
        isPublic: true,
        createdAt: '2026-01-15T10:00:00Z',
        members: [
          {
            id: '660e8400-e29b-41d4-a716-446655440001',
            userId: '550e8400-e29b-41d4-a716-446655440000',
            role: 'leader',
            contributionXp: 10000,
            missionsCompleted: 25,
            joinedAt: '2026-01-15T10:00:00Z',
          },
        ],
      },
    },
  })
  async getMyGuild(
    @CurrentUser('sub') userId: string,
  ): Promise<GuildResponse | null> {
    return this.guildsService.getUserGuild(userId);
  }

  /**
   * Get guild by ID
   */
  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get guild by ID',
    description: 'Returns guild details including all members',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Guild details',
  })
  @ApiResponse({
    status: 404,
    description: 'Guild not found',
  })
  async getGuild(
    @Param('id', ParseUUIDPipe) guildId: string,
  ): Promise<GuildResponse> {
    return this.guildsService.getGuild(guildId);
  }

  /**
   * Update guild settings
   */
  @Put(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Update guild settings',
    description: 'Updates guild settings. Only the guild leader can perform this action.',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiBody({
    type: UpdateGuildBodyDto,
    description: 'Guild update data',
  })
  @ApiResponse({
    status: 200,
    description: 'Guild updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not the guild leader',
  })
  @ApiResponse({
    status: 404,
    description: 'Guild not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Guild name already exists',
  })
  async updateGuild(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) guildId: string,
    @Body() dto: UpdateGuildBodyDto,
  ): Promise<GuildResponse> {
    return this.guildsService.updateGuild(guildId, userId, dto);
  }

  // =====================================================
  // JOIN REQUESTS
  // =====================================================

  /**
   * Request to join guild
   */
  @Post(':id/join')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Request to join guild',
    description: 'Sends a join request to a public guild. User must not be a member of another guild.',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiBody({
    type: JoinRequestBodyDto,
    description: 'Join request data',
    required: false,
    examples: {
      example1: {
        value: {
          message: 'I would like to join your guild!',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Join request sent successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Guild is not public or is full',
  })
  @ApiResponse({
    status: 404,
    description: 'Guild not found',
  })
  @ApiResponse({
    status: 409,
    description: 'Already in a guild or request already pending',
  })
  async requestJoin(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) guildId: string,
    @Body() dto?: JoinRequestBodyDto,
  ): Promise<GuildJoinRequest> {
    return this.guildsService.requestJoin(userId, guildId, dto?.message);
  }

  /**
   * Get join requests (leader/officer only)
   */
  @Get(':id/requests')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get join requests',
    description: 'Returns pending join requests for the guild. Only leaders and officers can view.',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'List of pending join requests',
    schema: {
      example: [
        {
          id: '770e8400-e29b-41d4-a716-446655440001',
          guildId: '550e8400-e29b-41d4-a716-446655440001',
          requesterId: '550e8400-e29b-41d4-a716-446655440002',
          message: 'I would like to join!',
          status: 'pending',
          createdAt: '2026-02-03T10:00:00Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Not a leader or officer',
  })
  async getJoinRequests(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) guildId: string,
  ): Promise<GuildJoinRequest[]> {
    return this.guildsService.getJoinRequests(guildId, userId);
  }

  /**
   * Respond to join request
   */
  @Post(':id/requests/:requestId/respond')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Respond to join request',
    description: 'Accept or reject a join request. Only leaders and officers can respond.',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiParam({
    name: 'requestId',
    description: 'Join request ID (UUID)',
    type: String,
  })
  @ApiBody({
    type: RespondToRequestDto,
    description: 'Response data',
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
  })
  @ApiResponse({
    status: 400,
    description: 'Guild is full or user already in another guild',
  })
  @ApiResponse({
    status: 403,
    description: 'Not a leader or officer',
  })
  @ApiResponse({
    status: 404,
    description: 'Join request not found',
  })
  async respondToJoinRequest(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) _guildId: string,
    @Param('requestId', ParseUUIDPipe) requestId: string,
    @Body() dto: RespondToRequestDto,
  ): Promise<{ success: boolean }> {
    await this.guildsService.respondToJoinRequest(requestId, userId, dto.accept);
    return { success: true };
  }

  // =====================================================
  // MEMBER MANAGEMENT
  // =====================================================

  /**
   * Leave guild
   */
  @Delete('leave')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Leave guild',
    description: 'Leave the current guild. Leaders must transfer leadership first unless they are the only member.',
  })
  @ApiResponse({
    status: 204,
    description: 'Left guild successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Leader must transfer leadership first',
  })
  @ApiResponse({
    status: 404,
    description: 'Not a member of any guild',
  })
  async leaveGuild(@CurrentUser('sub') userId: string): Promise<void> {
    return this.guildsService.leaveGuild(userId);
  }

  /**
   * Transfer leadership
   */
  @Post('transfer/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Transfer leadership',
    description: 'Transfer guild leadership to another member. Only the current leader can perform this action.',
  })
  @ApiParam({
    name: 'userId',
    description: 'New leader user ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Leadership transferred successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not the guild leader',
  })
  @ApiResponse({
    status: 404,
    description: 'User is not a member of your guild',
  })
  async transferLeadership(
    @CurrentUser('sub') currentLeaderId: string,
    @Param('userId', ParseUUIDPipe) newLeaderId: string,
  ): Promise<{ success: boolean }> {
    await this.guildsService.transferLeadership(currentLeaderId, newLeaderId);
    return { success: true };
  }

  /**
   * Promote member to officer
   */
  @Post('members/:userId/promote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Promote member to officer',
    description: 'Promote a regular member to officer. Only the leader can promote members. Max 3 officers per guild.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Member user ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Member promoted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Member is already an officer or officer limit reached',
  })
  @ApiResponse({
    status: 403,
    description: 'Not the guild leader',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
  })
  async promoteMember(
    @CurrentUser('sub') leaderId: string,
    @Param('userId', ParseUUIDPipe) memberId: string,
  ): Promise<{ success: boolean }> {
    await this.guildsService.promoteMember(leaderId, memberId);
    return { success: true };
  }

  /**
   * Demote officer to member
   */
  @Post('members/:userId/demote')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Demote officer to member',
    description: 'Demote an officer back to regular member. Only the leader can demote officers.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Officer user ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Officer demoted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not the guild leader',
  })
  @ApiResponse({
    status: 404,
    description: 'Officer not found',
  })
  async demoteMember(
    @CurrentUser('sub') leaderId: string,
    @Param('userId', ParseUUIDPipe) officerId: string,
  ): Promise<{ success: boolean }> {
    await this.guildsService.demoteMember(leaderId, officerId);
    return { success: true };
  }

  /**
   * Remove member from guild
   */
  @Delete('members/:userId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Remove member from guild',
    description: 'Remove a member from the guild. Leaders can remove anyone except themselves. Officers can only remove regular members.',
  })
  @ApiParam({
    name: 'userId',
    description: 'Member user ID (UUID)',
    type: String,
  })
  @ApiResponse({
    status: 204,
    description: 'Member removed successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Not authorized to remove this member',
  })
  @ApiResponse({
    status: 404,
    description: 'Member not found',
  })
  async removeMember(
    @CurrentUser('sub') actorId: string,
    @Param('userId', ParseUUIDPipe) memberId: string,
  ): Promise<void> {
    return this.guildsService.removeMember(actorId, memberId);
  }

  // =====================================================
  // MISSIONS
  // =====================================================

  /**
   * Get guild missions
   */
  @Get(':id/missions')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get guild missions',
    description: 'Returns missions for the guild. User must be a member to view.',
  })
  @ApiParam({
    name: 'id',
    description: 'Guild ID (UUID)',
    type: String,
  })
  @ApiQuery({
    name: 'status',
    description: 'Filter by mission status',
    required: false,
    enum: GuildMissionStatus,
  })
  @ApiResponse({
    status: 200,
    description: 'List of guild missions',
    schema: {
      example: [
        {
          id: '880e8400-e29b-41d4-a716-446655440001',
          guildId: '550e8400-e29b-41d4-a716-446655440001',
          title: 'Complete 100 exercises',
          description: 'Guild members must complete 100 exercises total',
          missionType: 'exercises_completed',
          targetValue: 100,
          currentValue: 45,
          rewardXp: 500,
          rewardCoins: 250,
          difficulty: 'normal',
          status: 'active',
          startsAt: '2026-02-01T00:00:00Z',
          expiresAt: '2026-02-28T23:59:59Z',
        },
      ],
    },
  })
  @ApiResponse({
    status: 403,
    description: 'Not a member of this guild',
  })
  async getGuildMissions(
    @CurrentUser('sub') userId: string,
    @Param('id', ParseUUIDPipe) guildId: string,
    @Query('status') status?: GuildMissionStatus,
  ): Promise<GuildMission[]> {
    return this.guildsService.getGuildMissions(guildId, userId, status);
  }
}
