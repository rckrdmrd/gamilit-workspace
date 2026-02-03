/**
 * Guilds Service
 *
 * Manages guild creation, membership, and operations.
 * Provides functionality for guild CRUD, member management,
 * join requests, and leadership transfers.
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
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Not } from 'typeorm';
import { Guild } from '../entities/guild.entity';
import { GuildMember, GuildMemberRole } from '../entities/guild-member.entity';
import { GuildJoinRequest, GuildJoinRequestStatus } from '../entities/guild-join-request.entity';
import { GuildMission, GuildMissionStatus } from '../entities/guild-mission.entity';

// Constants for guild limits
const MAX_GUILD_MEMBERS = 20;
const MAX_OFFICERS = 3;

/**
 * DTO for creating a guild
 */
export interface CreateGuildDto {
  name: string;
  description?: string;
  emblemId?: number;
  isPublic?: boolean;
}

/**
 * DTO for updating a guild
 */
export interface UpdateGuildDto {
  name?: string;
  description?: string;
  emblemId?: number;
  isPublic?: boolean;
}

/**
 * Guild response with all public information
 */
export interface GuildResponse {
  id: string;
  name: string;
  description?: string;
  emblemId: number;
  leaderId: string;
  memberCount: number;
  level: number;
  totalXp: number;
  isPublic: boolean;
  createdAt: Date;
  members?: GuildMemberResponse[];
}

/**
 * Guild member response
 */
export interface GuildMemberResponse {
  id: string;
  userId: string;
  role: GuildMemberRole;
  contributionXp: number;
  missionsCompleted: number;
  joinedAt: Date;
  username?: string;
  displayName?: string;
}

@Injectable()
export class GuildsService {
  private readonly logger = new Logger(GuildsService.name);

  constructor(
    @InjectRepository(Guild, 'social')
    private readonly guildRepository: Repository<Guild>,
    @InjectRepository(GuildMember, 'social')
    private readonly memberRepository: Repository<GuildMember>,
    @InjectRepository(GuildJoinRequest, 'social')
    private readonly joinRequestRepository: Repository<GuildJoinRequest>,
    @InjectRepository(GuildMission, 'social')
    private readonly missionRepository: Repository<GuildMission>,
  ) {}

  /**
   * Create a new guild
   * @param userId - ID of the user creating the guild
   * @param dto - Guild creation data
   * @returns Created guild
   */
  async createGuild(userId: string, dto: CreateGuildDto): Promise<GuildResponse> {
    this.logger.log(`Creating guild "${dto.name}" for user ${userId}`);

    // Check if user already in a guild
    const existingMembership = await this.memberRepository.findOne({
      where: { userId },
    });

    if (existingMembership) {
      throw new ConflictException(
        'You are already a member of a guild. Leave your current guild first.',
      );
    }

    // Check name uniqueness
    const existingGuild = await this.guildRepository.findOne({
      where: { name: dto.name },
    });

    if (existingGuild) {
      throw new ConflictException('A guild with this name already exists');
    }

    // Create guild
    const guild = this.guildRepository.create({
      name: dto.name,
      description: dto.description,
      emblemId: dto.emblemId || 1,
      leaderId: userId,
      isPublic: dto.isPublic ?? true,
      memberCount: 1,
      level: 1,
      totalXp: 0,
      lastActivityAt: new Date(),
    });

    await this.guildRepository.save(guild);

    // Add creator as leader member
    const member = this.memberRepository.create({
      guildId: guild.id,
      userId,
      role: GuildMemberRole.LEADER,
    });

    await this.memberRepository.save(member);

    this.logger.log(`Guild "${guild.name}" created with ID ${guild.id}`);

    return this.mapToResponse(guild);
  }

  /**
   * Search guilds
   * @param query - Optional search query
   * @param limit - Max results (default 20)
   * @param offset - Offset for pagination (default 0)
   * @returns List of guilds and total count
   */
  async searchGuilds(
    query?: string,
    limit = 20,
    offset = 0,
  ): Promise<{ guilds: GuildResponse[]; total: number }> {
    const whereCondition: Record<string, unknown> = { isActive: true, isPublic: true };

    if (query) {
      whereCondition.name = ILike(`%${query}%`);
    }

    const [guilds, total] = await this.guildRepository.findAndCount({
      where: whereCondition,
      order: { memberCount: 'DESC', level: 'DESC' },
      take: limit,
      skip: offset,
    });

    return {
      guilds: guilds.map((g) => this.mapToResponse(g)),
      total,
    };
  }

  /**
   * Get guild by ID with members
   * @param guildId - Guild ID
   * @returns Guild with members
   */
  async getGuild(guildId: string): Promise<GuildResponse> {
    const guild = await this.guildRepository.findOne({
      where: { id: guildId, isActive: true },
      relations: ['members'],
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    const response = this.mapToResponse(guild);
    response.members = guild.members?.map((m) => ({
      id: m.id,
      userId: m.userId,
      role: m.role,
      contributionXp: Number(m.contributionXp),
      missionsCompleted: m.missionsCompleted,
      joinedAt: m.joinedAt,
    }));

    return response;
  }

  /**
   * Get user's guild
   * @param userId - User ID
   * @returns User's guild or null
   */
  async getUserGuild(userId: string): Promise<GuildResponse | null> {
    const membership = await this.memberRepository.findOne({
      where: { userId },
      relations: ['guild'],
    });

    if (!membership || !membership.guild) {
      return null;
    }

    return this.getGuild(membership.guildId);
  }

  /**
   * Request to join guild
   * @param userId - User ID
   * @param guildId - Guild ID
   * @param message - Optional message
   * @returns Created join request
   */
  async requestJoin(
    userId: string,
    guildId: string,
    message?: string,
  ): Promise<GuildJoinRequest> {
    this.logger.log(`User ${userId} requesting to join guild ${guildId}`);

    // Check if user already in a guild
    const existingMembership = await this.memberRepository.findOne({
      where: { userId },
    });

    if (existingMembership) {
      throw new ConflictException('You are already a member of a guild');
    }

    // Check if guild exists and accepts requests
    const guild = await this.guildRepository.findOne({
      where: { id: guildId, isActive: true },
    });

    if (!guild) {
      throw new NotFoundException('Guild not found');
    }

    if (!guild.isPublic) {
      throw new BadRequestException('This guild is not accepting public join requests');
    }

    if (guild.memberCount >= MAX_GUILD_MEMBERS) {
      throw new BadRequestException('This guild is full');
    }

    // Check for existing pending request
    const existingRequest = await this.joinRequestRepository.findOne({
      where: {
        guildId,
        requesterId: userId,
        status: GuildJoinRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending request to this guild');
    }

    // Create request
    const request = this.joinRequestRepository.create({
      guildId,
      requesterId: userId,
      message,
      status: GuildJoinRequestStatus.PENDING,
    });

    await this.joinRequestRepository.save(request);
    return request;
  }

  /**
   * Get pending join requests for guild
   * @param guildId - Guild ID
   * @param userId - Requesting user ID (must be leader or officer)
   * @returns List of pending requests
   */
  async getJoinRequests(guildId: string, userId: string): Promise<GuildJoinRequest[]> {
    // Verify user is leader or officer
    const membership = await this.memberRepository.findOne({
      where: { guildId, userId },
    });

    if (
      !membership ||
      (membership.role !== GuildMemberRole.LEADER &&
        membership.role !== GuildMemberRole.OFFICER)
    ) {
      throw new ForbiddenException('Only leaders and officers can view join requests');
    }

    return this.joinRequestRepository.find({
      where: { guildId, status: GuildJoinRequestStatus.PENDING },
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Respond to join request
   * @param requestId - Join request ID
   * @param responderId - Responder user ID (must be leader or officer)
   * @param accept - True to accept, false to reject
   */
  async respondToJoinRequest(
    requestId: string,
    responderId: string,
    accept: boolean,
  ): Promise<void> {
    const request = await this.joinRequestRepository.findOne({
      where: { id: requestId, status: GuildJoinRequestStatus.PENDING },
      relations: ['guild'],
    });

    if (!request) {
      throw new NotFoundException('Join request not found');
    }

    // Verify responder is leader or officer
    const membership = await this.memberRepository.findOne({
      where: { guildId: request.guildId, userId: responderId },
    });

    if (
      !membership ||
      (membership.role !== GuildMemberRole.LEADER &&
        membership.role !== GuildMemberRole.OFFICER)
    ) {
      throw new ForbiddenException('Only leaders and officers can respond to join requests');
    }

    if (accept) {
      // Check guild capacity
      const guild = await this.guildRepository.findOne({
        where: { id: request.guildId },
      });
      if (guild && guild.memberCount >= MAX_GUILD_MEMBERS) {
        throw new BadRequestException('Guild is full');
      }

      // Check if user already joined another guild
      const existingMembership = await this.memberRepository.findOne({
        where: { userId: request.requesterId },
      });

      if (existingMembership) {
        request.status = GuildJoinRequestStatus.REJECTED;
        request.respondedBy = responderId;
        request.respondedAt = new Date();
        await this.joinRequestRepository.save(request);
        throw new BadRequestException('User is already in another guild');
      }

      // Add member
      const newMember = this.memberRepository.create({
        guildId: request.guildId,
        userId: request.requesterId,
        role: GuildMemberRole.MEMBER,
      });
      await this.memberRepository.save(newMember);

      // Update guild member count
      await this.guildRepository.increment(
        { id: request.guildId },
        'memberCount',
        1,
      );

      request.status = GuildJoinRequestStatus.ACCEPTED;
    } else {
      request.status = GuildJoinRequestStatus.REJECTED;
    }

    request.respondedBy = responderId;
    request.respondedAt = new Date();
    await this.joinRequestRepository.save(request);
  }

  /**
   * Leave guild
   * @param userId - User ID
   */
  async leaveGuild(userId: string): Promise<void> {
    const membership = await this.memberRepository.findOne({
      where: { userId },
      relations: ['guild'],
    });

    if (!membership) {
      throw new NotFoundException('You are not a member of any guild');
    }

    if (membership.role === GuildMemberRole.LEADER) {
      // Leader must transfer leadership or disband
      const otherMembers = await this.memberRepository.count({
        where: { guildId: membership.guildId, userId: Not(userId) },
      });

      if (otherMembers > 0) {
        throw new BadRequestException(
          'Transfer leadership before leaving or disband the guild',
        );
      }

      // Disband guild (solo member)
      await this.guildRepository.update(membership.guildId, { isActive: false });
    } else {
      // Update guild member count
      await this.guildRepository.decrement(
        { id: membership.guildId },
        'memberCount',
        1,
      );
    }

    await this.memberRepository.remove(membership);
    this.logger.log(`User ${userId} left guild ${membership.guildId}`);
  }

  /**
   * Transfer leadership
   * @param currentLeaderId - Current leader user ID
   * @param newLeaderId - New leader user ID
   */
  async transferLeadership(currentLeaderId: string, newLeaderId: string): Promise<void> {
    const currentLeader = await this.memberRepository.findOne({
      where: { userId: currentLeaderId, role: GuildMemberRole.LEADER },
    });

    if (!currentLeader) {
      throw new ForbiddenException('You are not a guild leader');
    }

    const newLeader = await this.memberRepository.findOne({
      where: { guildId: currentLeader.guildId, userId: newLeaderId },
    });

    if (!newLeader) {
      throw new NotFoundException('User is not a member of your guild');
    }

    // Transfer
    currentLeader.role = GuildMemberRole.MEMBER;
    newLeader.role = GuildMemberRole.LEADER;

    await this.memberRepository.save([currentLeader, newLeader]);

    // Update guild leader_id
    await this.guildRepository.update(currentLeader.guildId, {
      leaderId: newLeaderId,
    });

    this.logger.log(`Leadership transferred from ${currentLeaderId} to ${newLeaderId}`);
  }

  /**
   * Promote member to officer
   * @param leaderId - Leader user ID
   * @param memberId - Member user ID to promote
   */
  async promoteMember(leaderId: string, memberId: string): Promise<void> {
    const leaderMembership = await this.memberRepository.findOne({
      where: { userId: leaderId, role: GuildMemberRole.LEADER },
    });

    if (!leaderMembership) {
      throw new ForbiddenException('Only guild leader can promote members');
    }

    const member = await this.memberRepository.findOne({
      where: { guildId: leaderMembership.guildId, userId: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === GuildMemberRole.OFFICER) {
      throw new BadRequestException('Member is already an officer');
    }

    if (member.role === GuildMemberRole.LEADER) {
      throw new BadRequestException('Cannot promote the leader');
    }

    // Check officer limit
    const officerCount = await this.memberRepository.count({
      where: { guildId: leaderMembership.guildId, role: GuildMemberRole.OFFICER },
    });

    if (officerCount >= MAX_OFFICERS) {
      throw new BadRequestException(`Cannot have more than ${MAX_OFFICERS} officers`);
    }

    member.role = GuildMemberRole.OFFICER;
    await this.memberRepository.save(member);
  }

  /**
   * Demote officer to member
   * @param leaderId - Leader user ID
   * @param officerId - Officer user ID to demote
   */
  async demoteMember(leaderId: string, officerId: string): Promise<void> {
    const leaderMembership = await this.memberRepository.findOne({
      where: { userId: leaderId, role: GuildMemberRole.LEADER },
    });

    if (!leaderMembership) {
      throw new ForbiddenException('Only guild leader can demote officers');
    }

    const officer = await this.memberRepository.findOne({
      where: {
        guildId: leaderMembership.guildId,
        userId: officerId,
        role: GuildMemberRole.OFFICER,
      },
    });

    if (!officer) {
      throw new NotFoundException('Officer not found');
    }

    officer.role = GuildMemberRole.MEMBER;
    await this.memberRepository.save(officer);
  }

  /**
   * Remove member from guild
   * @param actorId - Actor user ID (leader or officer)
   * @param memberId - Member user ID to remove
   */
  async removeMember(actorId: string, memberId: string): Promise<void> {
    const actorMembership = await this.memberRepository.findOne({
      where: { userId: actorId },
    });

    if (
      !actorMembership ||
      (actorMembership.role !== GuildMemberRole.LEADER &&
        actorMembership.role !== GuildMemberRole.OFFICER)
    ) {
      throw new ForbiddenException('Only leaders and officers can remove members');
    }

    const member = await this.memberRepository.findOne({
      where: { guildId: actorMembership.guildId, userId: memberId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === GuildMemberRole.LEADER) {
      throw new ForbiddenException('Cannot remove the guild leader');
    }

    if (
      member.role === GuildMemberRole.OFFICER &&
      actorMembership.role !== GuildMemberRole.LEADER
    ) {
      throw new ForbiddenException('Only the leader can remove officers');
    }

    await this.memberRepository.remove(member);

    // Update guild member count
    await this.guildRepository.decrement(
      { id: actorMembership.guildId },
      'memberCount',
      1,
    );
  }

  /**
   * Get guild leaderboard
   * @param limit - Max results (default 10)
   * @returns List of top guilds
   */
  async getGuildLeaderboard(limit = 10): Promise<GuildResponse[]> {
    const guilds = await this.guildRepository.find({
      where: { isActive: true },
      order: { totalXp: 'DESC', level: 'DESC' },
      take: limit,
    });

    return guilds.map((g) => this.mapToResponse(g));
  }

  /**
   * Update guild settings
   * @param guildId - Guild ID
   * @param userId - User ID (must be leader)
   * @param dto - Update data
   * @returns Updated guild
   */
  async updateGuild(
    guildId: string,
    userId: string,
    dto: UpdateGuildDto,
  ): Promise<GuildResponse> {
    const membership = await this.memberRepository.findOne({
      where: { guildId, userId, role: GuildMemberRole.LEADER },
    });

    if (!membership) {
      throw new ForbiddenException('Only the guild leader can update settings');
    }

    if (dto.name) {
      const existing = await this.guildRepository.findOne({
        where: { name: dto.name, id: Not(guildId) },
      });
      if (existing) {
        throw new ConflictException('A guild with this name already exists');
      }
    }

    await this.guildRepository.update(guildId, {
      ...dto,
      updatedAt: new Date(),
    });

    return this.getGuild(guildId);
  }

  /**
   * Get guild missions
   * @param guildId - Guild ID
   * @param userId - User ID (must be member)
   * @param status - Optional status filter
   * @returns List of guild missions
   */
  async getGuildMissions(
    guildId: string,
    userId: string,
    status?: GuildMissionStatus,
  ): Promise<GuildMission[]> {
    // Verify user is a member
    const membership = await this.memberRepository.findOne({
      where: { guildId, userId },
    });

    if (!membership) {
      throw new ForbiddenException('You are not a member of this guild');
    }

    const where: Record<string, unknown> = { guildId };
    if (status) {
      where.status = status;
    }

    return this.missionRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  // ==================== Private Methods ====================

  /**
   * Map guild entity to response DTO
   */
  private mapToResponse(guild: Guild): GuildResponse {
    return {
      id: guild.id,
      name: guild.name,
      description: guild.description,
      emblemId: guild.emblemId,
      leaderId: guild.leaderId,
      memberCount: guild.memberCount,
      level: guild.level,
      totalXp: Number(guild.totalXp),
      isPublic: guild.isPublic,
      createdAt: guild.createdAt,
    };
  }
}
