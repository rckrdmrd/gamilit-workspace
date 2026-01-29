import {
  Injectable,
  Logger,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SkillRatingService } from './skill-rating.service';
import { PeerChallengesService } from '@modules/social/services/peer-challenges.service';
import { DifficultyLevelEnum } from '@shared/constants';
import {
  MatchmakingPreferencesDto,
  QueuePositionResponseDto,
  MatchResultDto,
  QueueStatusResponseDto,
} from '../dto/matchmaking.dto';

/**
 * User profile in matchmaking queue
 */
interface UserMatchProfile {
  userId: string;
  skillRating: number;
  preferences: MatchmakingPreferencesDto;
  queuedAt: Date;
  searchRangeExpansions: number;
  displayName?: string;
  avatarUrl?: string;
}

/**
 * Match criteria for finding opponents
 * @internal Reserved for future use in advanced matchmaking
 */
interface _MatchCriteria {
  challengeType: 'head_to_head' | 'multiplayer';
  difficultyLevel?: DifficultyLevelEnum;
  moduleId?: string;
  exerciseId?: string;
  maxSkillDiff: number;
}

/**
 * MatchmakingService
 *
 * @description Service for managing the matchmaking queue and finding suitable opponents.
 * Uses in-memory cache for queue management and processes matches every 2 seconds.
 *
 * Queue Configuration:
 * - Initial skill range: ±100
 * - Range expansion: +50 every 30 seconds
 * - Max expansion: ±300
 * - Queue timeout: 5 minutes
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see ET-PEER-001-matchmaking.md
 */
@Injectable()
export class MatchmakingService {
  private readonly logger = new Logger(MatchmakingService.name);

  /**
   * Matchmaking configuration constants
   */
  private static readonly INITIAL_SKILL_RANGE = 100;
  private static readonly SKILL_RANGE_EXPANSION = 50;
  private static readonly MAX_SKILL_RANGE = 300;
  private static readonly EXPANSION_INTERVAL_MS = 30000; // 30 seconds
  private static readonly QUEUE_TIMEOUT_MS = 300000; // 5 minutes
  private static readonly QUEUE_KEY_PREFIX = 'matchmaking:queue:';
  private static readonly USER_QUEUE_KEY_PREFIX = 'matchmaking:user:';

  /**
   * In-memory queue for faster access
   * Redis would be used in production for distributed systems
   */
  private matchmakingQueue: Map<string, UserMatchProfile> = new Map();

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    private readonly skillRatingService: SkillRatingService,
    @Inject(forwardRef(() => PeerChallengesService))
    private readonly peerChallengesService: PeerChallengesService,
  ) {}

  /**
   * Add user to the matchmaking queue
   *
   * @param userId - User ID
   * @param preferences - Matchmaking preferences
   * @returns Queue position information
   */
  async joinQueue(
    userId: string,
    preferences: MatchmakingPreferencesDto,
    displayName?: string,
    avatarUrl?: string,
  ): Promise<QueuePositionResponseDto> {
    // Check if user is already in queue
    if (this.matchmakingQueue.has(userId)) {
      throw new BadRequestException('User is already in the matchmaking queue');
    }

    // Get user's skill rating
    const skillRating = await this.skillRatingService.getRatingValue(userId);

    // Create user match profile
    const userProfile: UserMatchProfile = {
      userId,
      skillRating,
      preferences: {
        ...preferences,
        maxSkillDiff: preferences.maxSkillDiff || MatchmakingService.INITIAL_SKILL_RANGE,
      },
      queuedAt: new Date(),
      searchRangeExpansions: 0,
      displayName,
      avatarUrl,
    };

    // Add to queue
    this.matchmakingQueue.set(userId, userProfile);
    this.logger.log(`User ${userId} joined matchmaking queue with rating ${skillRating}`);

    // Calculate position and estimated wait time
    const position = this.calculateQueuePosition(userId);
    const estimatedWaitTime = this.estimateWaitTime(userProfile);

    return {
      position,
      estimatedWaitTime,
      queuedAt: userProfile.queuedAt,
      preferences: userProfile.preferences,
      currentSearchRange: userProfile.preferences.maxSkillDiff || MatchmakingService.INITIAL_SKILL_RANGE,
    };
  }

  /**
   * Remove user from the matchmaking queue
   *
   * @param userId - User ID
   */
  async leaveQueue(userId: string): Promise<void> {
    if (!this.matchmakingQueue.has(userId)) {
      this.logger.warn(`User ${userId} attempted to leave queue but was not in it`);
      return;
    }

    this.matchmakingQueue.delete(userId);
    this.logger.log(`User ${userId} left matchmaking queue`);
  }

  /**
   * Get queue status for a user
   *
   * @param userId - User ID
   * @returns Queue status
   */
  async getQueueStatus(userId: string): Promise<QueueStatusResponseDto> {
    const userProfile = this.matchmakingQueue.get(userId);

    if (!userProfile) {
      return {
        inQueue: false,
        totalInQueue: this.matchmakingQueue.size,
      };
    }

    const position = this.calculateQueuePosition(userId);
    const estimatedWaitTime = this.estimateWaitTime(userProfile);

    return {
      inQueue: true,
      position: {
        position,
        estimatedWaitTime,
        queuedAt: userProfile.queuedAt,
        preferences: userProfile.preferences,
        currentSearchRange: this.calculateCurrentSearchRange(userProfile),
      },
      totalInQueue: this.matchmakingQueue.size,
    };
  }

  /**
   * Find a match for a specific user
   *
   * @param userId - User ID looking for a match
   * @returns Match result or null if no match found
   */
  async findMatch(userId: string): Promise<MatchResultDto | null> {
    const userProfile = this.matchmakingQueue.get(userId);
    if (!userProfile) {
      return null;
    }

    const opponent = this.findSuitableOpponent(userProfile);
    if (!opponent) {
      return null;
    }

    // Create the challenge
    const challenge = await this.createMatchedChallenge(userProfile, opponent);

    // Remove both users from queue
    this.matchmakingQueue.delete(userId);
    this.matchmakingQueue.delete(opponent.userId);

    this.logger.log(
      `Match found: ${userId} (${userProfile.skillRating}) vs ${opponent.userId} (${opponent.skillRating})`,
    );

    return {
      challengeId: challenge.id,
      opponent: {
        id: opponent.userId,
        displayName: opponent.displayName || 'Opponent',
        skillRating: opponent.skillRating,
        avatarUrl: opponent.avatarUrl,
      },
      challengeType: userProfile.preferences.challengeType,
      difficultyLevel: userProfile.preferences.difficultyLevel,
    };
  }

  /**
   * Process the matchmaking queue (called every 2 seconds by cron)
   * Matches compatible users and handles timeouts
   */
  @Cron(CronExpression.EVERY_5_SECONDS)
  async processQueue(): Promise<void> {
    if (this.matchmakingQueue.size < 2) {
      return;
    }

    const now = new Date();
    const processedUsers = new Set<string>();
    const matchesToCreate: Array<{ user1: UserMatchProfile; user2: UserMatchProfile }> = [];

    // Update search ranges and remove timed out users
    for (const [userId, profile] of this.matchmakingQueue) {
      // Check for timeout
      const timeInQueue = now.getTime() - profile.queuedAt.getTime();
      if (timeInQueue > MatchmakingService.QUEUE_TIMEOUT_MS) {
        this.matchmakingQueue.delete(userId);
        this.logger.log(`User ${userId} removed from queue due to timeout`);
        continue;
      }

      // Expand search range over time
      const expansions = Math.floor(timeInQueue / MatchmakingService.EXPANSION_INTERVAL_MS);
      if (expansions > profile.searchRangeExpansions) {
        profile.searchRangeExpansions = expansions;
        const newRange = Math.min(
          MatchmakingService.INITIAL_SKILL_RANGE + expansions * MatchmakingService.SKILL_RANGE_EXPANSION,
          MatchmakingService.MAX_SKILL_RANGE,
        );
        profile.preferences.maxSkillDiff = newRange;
        this.logger.debug(`User ${userId} search range expanded to ${newRange}`);
      }
    }

    // Find matches
    for (const [userId, profile] of this.matchmakingQueue) {
      if (processedUsers.has(userId)) {
        continue;
      }

      const opponent = this.findSuitableOpponent(profile, processedUsers);
      if (opponent) {
        matchesToCreate.push({ user1: profile, user2: opponent });
        processedUsers.add(userId);
        processedUsers.add(opponent.userId);
      }
    }

    // Create challenges for matched users
    for (const match of matchesToCreate) {
      try {
        await this.createMatchedChallenge(match.user1, match.user2);
        this.matchmakingQueue.delete(match.user1.userId);
        this.matchmakingQueue.delete(match.user2.userId);
        this.logger.log(
          `Match created: ${match.user1.userId} vs ${match.user2.userId}`,
        );
      } catch (error) {
        this.logger.error(
          `Failed to create match between ${match.user1.userId} and ${match.user2.userId}`,
          error,
        );
      }
    }
  }

  /**
   * Find a suitable opponent for a user
   *
   * @param user - User looking for opponent
   * @param excludeUsers - Set of user IDs to exclude from search
   * @returns Suitable opponent or null
   */
  private findSuitableOpponent(
    user: UserMatchProfile,
    excludeUsers: Set<string> = new Set(),
  ): UserMatchProfile | null {
    const currentRange = this.calculateCurrentSearchRange(user);
    let bestMatch: UserMatchProfile | null = null;
    let bestMatchScore = Infinity;

    for (const [opponentId, opponent] of this.matchmakingQueue) {
      // Skip self and excluded users
      if (opponentId === user.userId || excludeUsers.has(opponentId)) {
        continue;
      }

      // Check if preferences are compatible
      if (!this.arePreferencesCompatible(user.preferences, opponent.preferences)) {
        continue;
      }

      // Check skill difference
      const skillDiff = Math.abs(user.skillRating - opponent.skillRating);
      const opponentRange = this.calculateCurrentSearchRange(opponent);
      const maxAllowedDiff = Math.max(currentRange, opponentRange);

      if (skillDiff > maxAllowedDiff) {
        continue;
      }

      // Calculate match score (lower is better)
      // Prioritize: smaller skill diff, longer wait time
      const waitTimeFactor = (Date.now() - opponent.queuedAt.getTime()) / 1000;
      const matchScore = skillDiff - waitTimeFactor * 0.5;

      if (matchScore < bestMatchScore) {
        bestMatch = opponent;
        bestMatchScore = matchScore;
      }
    }

    return bestMatch;
  }

  /**
   * Check if two users' preferences are compatible
   */
  private arePreferencesCompatible(
    pref1: MatchmakingPreferencesDto,
    pref2: MatchmakingPreferencesDto,
  ): boolean {
    // Challenge type must match
    if (pref1.challengeType !== pref2.challengeType) {
      return false;
    }

    // If both specified module, must match
    if (pref1.moduleId && pref2.moduleId && pref1.moduleId !== pref2.moduleId) {
      return false;
    }

    // If both specified exercise, must match
    if (pref1.exerciseId && pref2.exerciseId && pref1.exerciseId !== pref2.exerciseId) {
      return false;
    }

    // If both specified difficulty, must match
    if (
      pref1.difficultyLevel &&
      pref2.difficultyLevel &&
      pref1.difficultyLevel !== pref2.difficultyLevel
    ) {
      return false;
    }

    return true;
  }

  /**
   * Calculate current search range for a user based on time in queue
   */
  private calculateCurrentSearchRange(user: UserMatchProfile): number {
    const timeInQueue = Date.now() - user.queuedAt.getTime();
    const expansions = Math.floor(timeInQueue / MatchmakingService.EXPANSION_INTERVAL_MS);
    return Math.min(
      MatchmakingService.INITIAL_SKILL_RANGE + expansions * MatchmakingService.SKILL_RANGE_EXPANSION,
      MatchmakingService.MAX_SKILL_RANGE,
    );
  }

  /**
   * Calculate queue position for a user
   */
  private calculateQueuePosition(userId: string): number {
    const users = Array.from(this.matchmakingQueue.values());
    users.sort((a, b) => a.queuedAt.getTime() - b.queuedAt.getTime());
    const index = users.findIndex((u) => u.userId === userId);
    return index + 1;
  }

  /**
   * Estimate wait time based on queue state
   */
  private estimateWaitTime(user: UserMatchProfile): number {
    // Base estimate: 15 seconds if queue has potential matches
    const queueSize = this.matchmakingQueue.size;
    if (queueSize <= 1) {
      return 60; // 1 minute if alone in queue
    }

    // Count potential matches
    let potentialMatches = 0;
    for (const [_, opponent] of this.matchmakingQueue) {
      if (opponent.userId === user.userId) continue;
      if (this.arePreferencesCompatible(user.preferences, opponent.preferences)) {
        potentialMatches++;
      }
    }

    if (potentialMatches === 0) {
      return 90; // 1.5 minutes if no compatible players
    }

    // Estimate based on potential matches
    return Math.max(5, Math.round(30 / potentialMatches));
  }

  /**
   * Create a peer challenge for matched users
   */
  private async createMatchedChallenge(
    player1: UserMatchProfile,
    player2: UserMatchProfile,
  ) {
    const preferences = player1.preferences;

    return this.peerChallengesService.create(player1.userId, {
      challenge_type: preferences.challengeType,
      title: `${preferences.challengeType === 'head_to_head' ? '1v1' : 'Multiplayer'} Challenge`,
      difficulty_level: preferences.difficultyLevel,
      module_id: preferences.moduleId,
      exercise_id: preferences.exerciseId,
      max_participants: 2,
      min_participants: 2,
      current_participants: 2,
      status: 'full',
      is_public: false,
      requires_approval: false,
      rewards: {
        xp: 50,
        ml_coins: 25,
      },
      metadata: {
        matchmaking: true,
        player1Id: player1.userId,
        player2Id: player2.userId,
        player1Rating: player1.skillRating,
        player2Rating: player2.skillRating,
        matchedAt: new Date().toISOString(),
      },
    });
  }

  /**
   * Get queue statistics for monitoring
   */
  getQueueStats(): {
    totalInQueue: number;
    byType: Record<string, number>;
    avgWaitTime: number;
  } {
    const byType: Record<string, number> = {
      head_to_head: 0,
      multiplayer: 0,
    };

    let totalWaitTime = 0;
    const now = Date.now();

    for (const [_, user] of this.matchmakingQueue) {
      byType[user.preferences.challengeType]++;
      totalWaitTime += now - user.queuedAt.getTime();
    }

    return {
      totalInQueue: this.matchmakingQueue.size,
      byType,
      avgWaitTime: this.matchmakingQueue.size > 0
        ? Math.round(totalWaitTime / this.matchmakingQueue.size / 1000)
        : 0,
    };
  }
}
