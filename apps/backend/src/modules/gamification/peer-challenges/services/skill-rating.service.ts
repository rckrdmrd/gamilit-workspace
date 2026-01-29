import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserSkillRating } from '../entities/user-skill-rating.entity';

/**
 * SkillRatingService
 *
 * @description Service for managing ELO-based skill ratings for peer challenges.
 * Implements a modified ELO rating system with dynamic K-factor based on games played.
 *
 * ELO System Configuration:
 * - Initial rating: 1200
 * - K-factor: 40 (0-30 games), 20 (31-100 games), 10 (101+ games)
 * - Rating floor: 100 (minimum rating)
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see ET-PEER-001-matchmaking.md
 */
@Injectable()
export class SkillRatingService {
  private readonly logger = new Logger(SkillRatingService.name);

  /**
   * Rating constants
   */
  private static readonly INITIAL_RATING = 1200;
  private static readonly RATING_FLOOR = 100;
  private static readonly RATING_HISTORY_MAX = 20;

  constructor(
    @InjectRepository(UserSkillRating, 'social')
    private readonly skillRatingRepo: Repository<UserSkillRating>,
  ) {}

  /**
   * Get or create skill rating for a user
   * @param userId - User ID
   * @returns User skill rating
   */
  async getOrCreateSkillRating(userId: string): Promise<UserSkillRating> {
    let skillRating = await this.skillRatingRepo.findOne({
      where: { user_id: userId },
    });

    if (!skillRating) {
      this.logger.log(`Creating initial skill rating for user ${userId}`);
      skillRating = this.skillRatingRepo.create({
        user_id: userId,
        rating: SkillRatingService.INITIAL_RATING,
        games_played: 0,
        wins: 0,
        losses: 0,
        draws: 0,
        current_streak: 0,
        best_streak: 0,
        peak_rating: SkillRatingService.INITIAL_RATING,
        lowest_rating: SkillRatingService.INITIAL_RATING,
        rating_history: [],
        metadata: {},
      });
      skillRating = await this.skillRatingRepo.save(skillRating);
    }

    return skillRating;
  }

  /**
   * Get skill rating by user ID
   * @param userId - User ID
   * @returns User skill rating or null
   */
  async getSkillRating(userId: string): Promise<UserSkillRating | null> {
    return this.skillRatingRepo.findOne({ where: { user_id: userId } });
  }

  /**
   * Get skill rating value for a user (creates if not exists)
   * @param userId - User ID
   * @returns Rating value
   */
  async getRatingValue(userId: string): Promise<number> {
    const skillRating = await this.getOrCreateSkillRating(userId);
    return skillRating.rating;
  }

  /**
   * Update ratings after a challenge completion
   *
   * @param winnerId - ID of the winner (null if draw)
   * @param loserId - ID of the loser (null if draw)
   * @param challengeId - ID of the challenge
   * @param isDraw - Whether the match was a draw
   * @returns Object with new ratings for both players
   */
  async updateRatings(
    player1Id: string,
    player2Id: string,
    challengeId: string,
    result: 'player1' | 'player2' | 'draw',
  ): Promise<{ player1: { oldRating: number; newRating: number; change: number }; player2: { oldRating: number; newRating: number; change: number } }> {
    const player1Rating = await this.getOrCreateSkillRating(player1Id);
    const player2Rating = await this.getOrCreateSkillRating(player2Id);

    const player1OldRating = player1Rating.rating;
    const player2OldRating = player2Rating.rating;

    // Calculate expected scores
    const player1Expected = this.calculateExpectedScore(player1OldRating, player2OldRating);
    const player2Expected = this.calculateExpectedScore(player2OldRating, player1OldRating);

    // Determine actual scores
    let player1Actual: number;
    let player2Actual: number;

    switch (result) {
      case 'player1':
        player1Actual = 1;
        player2Actual = 0;
        break;
      case 'player2':
        player1Actual = 0;
        player2Actual = 1;
        break;
      case 'draw':
        player1Actual = 0.5;
        player2Actual = 0.5;
        break;
    }

    // Calculate rating changes
    const player1KFactor = this.getKFactor(player1Rating.games_played);
    const player2KFactor = this.getKFactor(player2Rating.games_played);

    const player1Change = this.calculateRatingChange(player1Actual, player1Expected, player1KFactor);
    const player2Change = this.calculateRatingChange(player2Actual, player2Expected, player2KFactor);

    // Apply changes (with floor)
    player1Rating.rating = Math.max(
      SkillRatingService.RATING_FLOOR,
      player1OldRating + player1Change,
    );
    player2Rating.rating = Math.max(
      SkillRatingService.RATING_FLOOR,
      player2OldRating + player2Change,
    );

    // Update statistics
    player1Rating.games_played += 1;
    player2Rating.games_played += 1;

    if (result === 'player1') {
      player1Rating.wins += 1;
      player2Rating.losses += 1;
      player1Rating.current_streak = Math.max(1, player1Rating.current_streak + 1);
      player2Rating.current_streak = Math.min(-1, player2Rating.current_streak - 1);
    } else if (result === 'player2') {
      player2Rating.wins += 1;
      player1Rating.losses += 1;
      player2Rating.current_streak = Math.max(1, player2Rating.current_streak + 1);
      player1Rating.current_streak = Math.min(-1, player1Rating.current_streak - 1);
    } else {
      player1Rating.draws += 1;
      player2Rating.draws += 1;
      player1Rating.current_streak = 0;
      player2Rating.current_streak = 0;
    }

    // Update best streak
    player1Rating.best_streak = Math.max(player1Rating.best_streak, player1Rating.current_streak);
    player2Rating.best_streak = Math.max(player2Rating.best_streak, player2Rating.current_streak);

    // Update peak/lowest ratings
    player1Rating.peak_rating = Math.max(player1Rating.peak_rating, player1Rating.rating);
    player1Rating.lowest_rating = Math.min(player1Rating.lowest_rating, player1Rating.rating);
    player2Rating.peak_rating = Math.max(player2Rating.peak_rating, player2Rating.rating);
    player2Rating.lowest_rating = Math.min(player2Rating.lowest_rating, player2Rating.rating);

    // Add to history
    const now = new Date().toISOString();
    player1Rating.rating_history = this.addToHistory(player1Rating.rating_history, {
      rating: player1Rating.rating,
      change: player1Change,
      challengeId,
      opponentId: player2Id,
      result: result === 'player1' ? 'win' : result === 'player2' ? 'loss' : 'draw',
      date: now,
    });
    player2Rating.rating_history = this.addToHistory(player2Rating.rating_history, {
      rating: player2Rating.rating,
      change: player2Change,
      challengeId,
      opponentId: player1Id,
      result: result === 'player2' ? 'win' : result === 'player1' ? 'loss' : 'draw',
      date: now,
    });

    // Save both ratings
    await this.skillRatingRepo.save([player1Rating, player2Rating]);

    this.logger.log(
      `Ratings updated: Player1 (${player1Id}): ${player1OldRating} -> ${player1Rating.rating} (${player1Change > 0 ? '+' : ''}${player1Change}), ` +
      `Player2 (${player2Id}): ${player2OldRating} -> ${player2Rating.rating} (${player2Change > 0 ? '+' : ''}${player2Change})`,
    );

    return {
      player1: {
        oldRating: player1OldRating,
        newRating: player1Rating.rating,
        change: player1Change,
      },
      player2: {
        oldRating: player2OldRating,
        newRating: player2Rating.rating,
        change: player2Change,
      },
    };
  }

  /**
   * Calculate expected score (probability of winning)
   *
   * @param playerRating - Rating of the player
   * @param opponentRating - Rating of the opponent
   * @returns Expected score (0 to 1)
   */
  calculateExpectedScore(playerRating: number, opponentRating: number): number {
    return 1 / (1 + Math.pow(10, (opponentRating - playerRating) / 400));
  }

  /**
   * Calculate rating change based on actual vs expected result
   *
   * @param actualScore - Actual result (1 = win, 0 = loss, 0.5 = draw)
   * @param expectedScore - Expected score (probability)
   * @param kFactor - K-factor for the player
   * @returns Rating change (can be positive or negative)
   */
  calculateRatingChange(actualScore: number, expectedScore: number, kFactor: number): number {
    return Math.round(kFactor * (actualScore - expectedScore));
  }

  /**
   * Get K-factor based on games played
   * Higher K-factor = faster rating changes for new players
   *
   * @param gamesPlayed - Number of games played
   * @returns K-factor value
   */
  getKFactor(gamesPlayed: number): number {
    if (gamesPlayed <= 30) {
      return 40; // New players - volatile rating
    } else if (gamesPlayed <= 100) {
      return 20; // Intermediate players
    } else {
      return 10; // Experienced players - stable rating
    }
  }

  /**
   * Get leaderboard of top players by skill rating
   *
   * @param limit - Number of players to return
   * @param offset - Offset for pagination
   * @returns Array of top players
   */
  async getLeaderboard(limit: number = 50, offset: number = 0): Promise<UserSkillRating[]> {
    return this.skillRatingRepo.find({
      where: {},
      order: { rating: 'DESC', wins: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get player rank (position in leaderboard)
   *
   * @param userId - User ID
   * @returns Rank number (1-based)
   */
  async getPlayerRank(userId: string): Promise<number> {
    const userRating = await this.getSkillRating(userId);
    if (!userRating) {
      return 0;
    }

    const higherRatedCount = await this.skillRatingRepo
      .createQueryBuilder('usr')
      .where('usr.rating > :rating', { rating: userRating.rating })
      .getCount();

    return higherRatedCount + 1;
  }

  /**
   * Add entry to rating history, maintaining max size
   */
  private addToHistory(
    history: UserSkillRating['rating_history'],
    entry: UserSkillRating['rating_history'][0],
  ): UserSkillRating['rating_history'] {
    const newHistory = [entry, ...history];
    if (newHistory.length > SkillRatingService.RATING_HISTORY_MAX) {
      newHistory.pop();
    }
    return newHistory;
  }

  /**
   * Calculate win rate for a user
   *
   * @param userId - User ID
   * @returns Win rate as percentage (0-100)
   */
  async getWinRate(userId: string): Promise<number> {
    const rating = await this.getSkillRating(userId);
    if (!rating || rating.games_played === 0) {
      return 0;
    }
    return Math.round((rating.wins / rating.games_played) * 100 * 10) / 10;
  }
}
