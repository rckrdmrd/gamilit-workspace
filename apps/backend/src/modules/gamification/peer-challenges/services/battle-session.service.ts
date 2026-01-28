import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PeerChallengesService } from '@modules/social/services/peer-challenges.service';
import { ChallengeParticipantsService } from '@modules/social/services/challenge-participants.service';
import { SkillRatingService } from './skill-rating.service';
import {
  BattleStateDto,
  BattlePlayerDto,
  BattleQuestionDto,
  AnswerResultDto,
  BattleResultDto,
} from '../dto/battle.dto';

/**
 * Battle session stored in cache
 */
interface BattleSession {
  challengeId: string;
  status: 'waiting' | 'countdown' | 'active' | 'finished';
  players: Map<string, BattlePlayer>;
  questions: BattleQuestion[];
  currentQuestionIndex: Map<string, number>;
  startedAt: Date | null;
  endsAt: Date | null;
  timeLimit: number; // seconds
  totalQuestions: number;
  metadata: Record<string, unknown>;
}

interface BattlePlayer {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  answers: Map<string, PlayerAnswer>;
  lastActivityAt: Date;
}

interface PlayerAnswer {
  questionId: string;
  answer: string;
  correct: boolean;
  points: number;
  timeTakenMs: number;
  answeredAt: Date;
}

interface BattleQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  correctAnswer: string;
  points: number;
  timeLimit: number;
  explanation?: string;
}

/**
 * BattleSessionService
 *
 * @description Service for managing real-time battle sessions between players.
 * Handles battle initialization, answer processing, scoring, and result calculation.
 *
 * @see Epic: EXT-009 - Peer Challenges
 * @see ET-PEER-002-realtime-battles.md
 */
@Injectable()
export class BattleSessionService {
  private readonly logger = new Logger(BattleSessionService.name);

  /**
   * Battle configuration constants
   */
  private static readonly DEFAULT_TIME_LIMIT = 300; // 5 minutes
  private static readonly DEFAULT_QUESTION_COUNT = 10;
  private static readonly POINTS_PER_CORRECT = 50;
  private static readonly TIME_BONUS_MAX = 25;
  private static readonly STREAK_BONUS = 10;
  private static readonly RECONNECT_TIMEOUT_MS = 60000; // 60 seconds
  private static readonly BATTLE_CACHE_TTL = 3600000; // 1 hour
  private static readonly CACHE_KEY_PREFIX = 'battle:';

  /**
   * In-memory battle sessions (would use Redis in production)
   */
  private activeBattles: Map<string, BattleSession> = new Map();

  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
    @Inject(forwardRef(() => PeerChallengesService))
    private readonly peerChallengesService: PeerChallengesService,
    @Inject(forwardRef(() => ChallengeParticipantsService))
    private readonly participantsService: ChallengeParticipantsService,
    private readonly skillRatingService: SkillRatingService,
  ) {}

  /**
   * Initialize a battle session
   *
   * @param challengeId - ID of the peer challenge
   * @returns Initialized battle session state
   */
  async initBattle(challengeId: string): Promise<BattleStateDto> {
    // Check if battle already exists
    if (this.activeBattles.has(challengeId)) {
      return this.getBattleState(challengeId);
    }

    // Get challenge details
    const challenge = await this.peerChallengesService.findById(challengeId);
    if (!challenge) {
      throw new NotFoundException(`Challenge ${challengeId} not found`);
    }

    // Get participants
    const participants = await this.participantsService.findByChallengeId(challengeId);
    if (participants.length < 2) {
      throw new BadRequestException('Not enough participants to start battle');
    }

    // Generate questions (mock for now - would integrate with exercise service)
    const questions = this.generateMockQuestions(
      BattleSessionService.DEFAULT_QUESTION_COUNT,
    );

    // Create battle session
    const session: BattleSession = {
      challengeId,
      status: 'waiting',
      players: new Map(),
      questions,
      currentQuestionIndex: new Map(),
      startedAt: null,
      endsAt: null,
      timeLimit: challenge.time_limit_minutes
        ? challenge.time_limit_minutes * 60
        : BattleSessionService.DEFAULT_TIME_LIMIT,
      totalQuestions: questions.length,
      metadata: challenge.metadata || {},
    };

    // Initialize players
    for (const participant of participants) {
      session.players.set(participant.user_id, {
        id: participant.user_id,
        displayName: `Player ${participant.user_id.slice(0, 8)}`,
        isReady: false,
        isConnected: false,
        score: 0,
        correctAnswers: 0,
        totalAnswers: 0,
        answers: new Map(),
        lastActivityAt: new Date(),
      });
      session.currentQuestionIndex.set(participant.user_id, 0);
    }

    this.activeBattles.set(challengeId, session);
    this.logger.log(`Battle session initialized for challenge ${challengeId}`);

    return this.toBattleStateDto(session);
  }

  /**
   * Get current battle state
   *
   * @param challengeId - Challenge ID
   * @returns Battle state DTO
   */
  async getBattleState(challengeId: string): Promise<BattleStateDto> {
    const session = this.activeBattles.get(challengeId);
    if (!session) {
      throw new NotFoundException(`Battle session ${challengeId} not found`);
    }

    return this.toBattleStateDto(session);
  }

  /**
   * Mark player as ready
   *
   * @param challengeId - Challenge ID
   * @param playerId - Player ID
   * @returns Whether all players are now ready
   */
  async setPlayerReady(challengeId: string, playerId: string): Promise<boolean> {
    const session = this.getBattleSession(challengeId);
    const player = session.players.get(playerId);

    if (!player) {
      throw new NotFoundException(`Player ${playerId} not in battle`);
    }

    player.isReady = true;
    player.isConnected = true;
    player.lastActivityAt = new Date();

    this.logger.log(`Player ${playerId} is ready for battle ${challengeId}`);

    return this.areAllPlayersReady(challengeId);
  }

  /**
   * Check if all players are ready
   */
  async areAllPlayersReady(challengeId: string): Promise<boolean> {
    const session = this.getBattleSession(challengeId);

    for (const player of session.players.values()) {
      if (!player.isReady) {
        return false;
      }
    }

    return true;
  }

  /**
   * Start the battle (called after countdown)
   */
  async startBattle(challengeId: string): Promise<void> {
    const session = this.getBattleSession(challengeId);

    if (session.status !== 'waiting' && session.status !== 'countdown') {
      throw new BadRequestException(`Battle ${challengeId} cannot be started in status ${session.status}`);
    }

    session.status = 'active';
    session.startedAt = new Date();
    session.endsAt = new Date(Date.now() + session.timeLimit * 1000);

    // Update challenge status
    await this.peerChallengesService.start(challengeId);

    this.logger.log(`Battle ${challengeId} started`);
  }

  /**
   * Process a player's answer
   *
   * @param challengeId - Challenge ID
   * @param playerId - Player ID
   * @param questionId - Question ID
   * @param answer - Player's answer
   * @param timeTakenMs - Time taken to answer in milliseconds
   * @returns Answer result
   */
  async processAnswer(
    challengeId: string,
    playerId: string,
    questionId: string,
    answer: string,
    timeTakenMs: number = 0,
  ): Promise<AnswerResultDto> {
    const session = this.getBattleSession(challengeId);

    if (session.status !== 'active') {
      throw new BadRequestException('Battle is not active');
    }

    const player = session.players.get(playerId);
    if (!player) {
      throw new NotFoundException(`Player ${playerId} not in battle`);
    }

    // Check if already answered
    if (player.answers.has(questionId)) {
      throw new BadRequestException('Question already answered');
    }

    // Find question
    const question = session.questions.find((q) => q.id === questionId);
    if (!question) {
      throw new NotFoundException(`Question ${questionId} not found`);
    }

    // Check answer
    const correct = answer === question.correctAnswer;

    // Calculate points
    let points = 0;
    if (correct) {
      points = BattleSessionService.POINTS_PER_CORRECT;

      // Time bonus (faster = more points)
      if (timeTakenMs > 0 && question.timeLimit > 0) {
        const timeRatio = 1 - timeTakenMs / (question.timeLimit * 1000);
        const timeBonus = Math.max(0, Math.round(timeRatio * BattleSessionService.TIME_BONUS_MAX));
        points += timeBonus;
      }

      // Streak bonus
      const correctStreak = this.getCorrectStreak(player);
      if (correctStreak >= 2) {
        points += BattleSessionService.STREAK_BONUS * Math.min(correctStreak, 5);
      }
    }

    // Record answer
    const playerAnswer: PlayerAnswer = {
      questionId,
      answer,
      correct,
      points,
      timeTakenMs,
      answeredAt: new Date(),
    };
    player.answers.set(questionId, playerAnswer);

    // Update player stats
    player.totalAnswers++;
    if (correct) {
      player.correctAnswers++;
    }
    player.score += points;
    player.lastActivityAt = new Date();

    // Move to next question
    const currentIndex = session.currentQuestionIndex.get(playerId) || 0;
    session.currentQuestionIndex.set(playerId, currentIndex + 1);

    this.logger.debug(
      `Player ${playerId} answered ${correct ? 'correctly' : 'incorrectly'}, +${points} points`,
    );

    return {
      correct,
      pointsEarned: points,
      totalScore: player.score,
      correctAnswer: correct ? undefined : question.correctAnswer,
      explanation: question.explanation,
      timeBonus: correct && timeTakenMs > 0 ? points - BattleSessionService.POINTS_PER_CORRECT : 0,
      streakBonus: this.getCorrectStreak(player) >= 2 ? BattleSessionService.STREAK_BONUS : 0,
    };
  }

  /**
   * Get next question for a player
   */
  async getNextQuestion(
    challengeId: string,
    playerId: string,
  ): Promise<BattleQuestionDto | null> {
    const session = this.getBattleSession(challengeId);
    const currentIndex = session.currentQuestionIndex.get(playerId) || 0;

    if (currentIndex >= session.questions.length) {
      return null; // No more questions
    }

    const question = session.questions[currentIndex];

    return {
      id: question.id,
      text: question.text,
      options: question.options,
      questionNumber: currentIndex + 1,
      totalQuestions: session.totalQuestions,
      timeLimit: question.timeLimit,
      points: question.points,
    };
  }

  /**
   * Check if the battle should end
   */
  async checkBattleEnd(challengeId: string): Promise<boolean> {
    const session = this.getBattleSession(challengeId);

    // Already finished
    if (session.status === 'finished') {
      return true;
    }

    // Time expired
    if (session.endsAt && new Date() > session.endsAt) {
      return true;
    }

    // All players finished all questions
    let allFinished = true;
    for (const [playerId] of session.players) {
      const currentIndex = session.currentQuestionIndex.get(playerId) || 0;
      if (currentIndex < session.totalQuestions) {
        allFinished = false;
        break;
      }
    }

    return allFinished;
  }

  /**
   * Finalize battle and calculate results
   */
  async finalizeBattle(challengeId: string): Promise<BattleResultDto> {
    const session = this.getBattleSession(challengeId);

    if (session.status === 'finished') {
      throw new BadRequestException('Battle already finalized');
    }

    session.status = 'finished';

    // Calculate duration
    const duration = session.startedAt
      ? Math.round((Date.now() - session.startedAt.getTime()) / 1000)
      : 0;

    // Determine winner
    const playerResults: BattleResultDto['players'] = [];
    let highestScore = 0;
    let winnerId: string | null = null;
    let isDraw = false;

    // Convert players to array and sort by score
    const players = Array.from(session.players.values()).sort(
      (a, b) => b.score - a.score,
    );

    // Check for draw
    if (players.length >= 2 && players[0].score === players[1].score) {
      isDraw = true;
    } else if (players.length > 0) {
      winnerId = players[0].id;
      highestScore = players[0].score;
    }

    // Calculate rating changes
    let ratingChanges: Record<string, number> = {};
    if (players.length === 2) {
      const result = isDraw ? 'draw' : (winnerId === players[0].id ? 'player1' : 'player2');
      const ratingResult = await this.skillRatingService.updateRatings(
        players[0].id,
        players[1].id,
        challengeId,
        result,
      );
      ratingChanges[players[0].id] = ratingResult.player1.change;
      ratingChanges[players[1].id] = ratingResult.player2.change;
    }

    // Calculate XP and coins
    const calculateRewards = (
      player: BattlePlayer,
      isWinner: boolean,
    ): { xp: number; coins: number } => {
      let xp = player.correctAnswers * 10; // Base XP
      let coins = Math.round(player.score / 10); // Base coins

      if (isWinner) {
        xp = Math.round(xp * 1.5); // Winner bonus
        coins = Math.round(coins * 1.5);
      }

      return { xp, coins };
    };

    // Build player results
    for (const player of players) {
      const isWinner = !isDraw && player.id === winnerId;
      const rewards = calculateRewards(player, isWinner);
      const rating = await this.skillRatingService.getOrCreateSkillRating(player.id);

      // Calculate average time per question
      let totalTime = 0;
      for (const answer of player.answers.values()) {
        totalTime += answer.timeTakenMs;
      }
      const avgTime = player.totalAnswers > 0 ? totalTime / player.totalAnswers : 0;

      playerResults.push({
        id: player.id,
        displayName: player.displayName,
        score: player.score,
        correctAnswers: player.correctAnswers,
        totalAnswers: player.totalAnswers,
        accuracy: player.totalAnswers > 0
          ? Math.round((player.correctAnswers / player.totalAnswers) * 100)
          : 0,
        avgTimePerQuestion: Math.round(avgTime),
        xpEarned: rewards.xp,
        coinsEarned: rewards.coins,
        ratingChange: ratingChanges[player.id] || 0,
        newRating: rating.rating,
      });
    }

    // Update challenge status
    await this.peerChallengesService.complete(challengeId);

    // Calculate stats
    let fastestAnswer: { playerId: string; time: number } = { playerId: '', time: Infinity };
    let totalResponseTime = 0;
    let totalResponses = 0;

    for (const player of players) {
      for (const answer of player.answers.values()) {
        totalResponseTime += answer.timeTakenMs;
        totalResponses++;
        if (answer.timeTakenMs < fastestAnswer.time) {
          fastestAnswer = { playerId: player.id, time: answer.timeTakenMs };
        }
      }
    }

    const result: BattleResultDto = {
      challengeId,
      winnerId: isDraw ? null : winnerId,
      isDraw,
      duration,
      players: playerResults,
      stats: {
        totalQuestions: session.totalQuestions,
        avgResponseTime: totalResponses > 0 ? Math.round(totalResponseTime / totalResponses) : 0,
        fastestAnswer,
      },
    };

    this.logger.log(
      `Battle ${challengeId} finalized. Winner: ${isDraw ? 'Draw' : winnerId}`,
    );

    // Clean up session after a delay (keep for results retrieval)
    setTimeout(() => {
      this.activeBattles.delete(challengeId);
    }, BattleSessionService.BATTLE_CACHE_TTL);

    return result;
  }

  /**
   * Handle player disconnect
   */
  async handlePlayerDisconnect(challengeId: string, playerId: string): Promise<void> {
    const session = this.activeBattles.get(challengeId);
    if (!session) return;

    const player = session.players.get(playerId);
    if (!player) return;

    player.isConnected = false;
    this.logger.log(`Player ${playerId} disconnected from battle ${challengeId}`);
  }

  /**
   * Handle player reconnect
   */
  async handlePlayerReconnect(challengeId: string, playerId: string): Promise<BattleStateDto | null> {
    const session = this.activeBattles.get(challengeId);
    if (!session) return null;

    const player = session.players.get(playerId);
    if (!player) return null;

    player.isConnected = true;
    player.lastActivityAt = new Date();
    this.logger.log(`Player ${playerId} reconnected to battle ${challengeId}`);

    return this.toBattleStateDto(session);
  }

  /**
   * Clean up battle session
   */
  async cleanupBattle(challengeId: string): Promise<void> {
    this.activeBattles.delete(challengeId);
    this.logger.log(`Battle ${challengeId} cleaned up`);
  }

  /**
   * Get battle session or throw
   */
  private getBattleSession(challengeId: string): BattleSession {
    const session = this.activeBattles.get(challengeId);
    if (!session) {
      throw new NotFoundException(`Battle session ${challengeId} not found`);
    }
    return session;
  }

  /**
   * Convert battle session to DTO
   */
  private toBattleStateDto(session: BattleSession): BattleStateDto {
    const players: BattlePlayerDto[] = [];

    for (const player of session.players.values()) {
      players.push({
        id: player.id,
        displayName: player.displayName,
        avatarUrl: player.avatarUrl,
        isReady: player.isReady,
        isConnected: player.isConnected,
        score: player.score,
        correctAnswers: player.correctAnswers,
        totalAnswers: player.totalAnswers,
        accuracy: player.totalAnswers > 0
          ? Math.round((player.correctAnswers / player.totalAnswers) * 100)
          : 0,
      });
    }

    return {
      challengeId: session.challengeId,
      status: session.status,
      players,
      timeRemaining: session.endsAt
        ? Math.max(0, Math.round((session.endsAt.getTime() - Date.now()) / 1000))
        : undefined,
      totalTime: session.timeLimit,
      startedAt: session.startedAt || undefined,
      endsAt: session.endsAt || undefined,
    };
  }

  /**
   * Get current correct answer streak for a player
   */
  private getCorrectStreak(player: BattlePlayer): number {
    const answers = Array.from(player.answers.values()).sort(
      (a, b) => b.answeredAt.getTime() - a.answeredAt.getTime(),
    );

    let streak = 0;
    for (const answer of answers) {
      if (answer.correct) {
        streak++;
      } else {
        break;
      }
    }

    return streak;
  }

  /**
   * Generate mock questions (placeholder - would integrate with exercise service)
   */
  private generateMockQuestions(count: number): BattleQuestion[] {
    const questions: BattleQuestion[] = [];

    for (let i = 0; i < count; i++) {
      questions.push({
        id: `q-${i + 1}-${Date.now()}`,
        text: `Sample question ${i + 1}`,
        options: [
          { id: 'a', text: 'Option A' },
          { id: 'b', text: 'Option B' },
          { id: 'c', text: 'Option C' },
          { id: 'd', text: 'Option D' },
        ],
        correctAnswer: 'a',
        points: BattleSessionService.POINTS_PER_CORRECT,
        timeLimit: 30,
        explanation: 'This is the explanation for the answer.',
      });
    }

    return questions;
  }

  /**
   * Check if a battle exists and is active
   */
  isBattleActive(challengeId: string): boolean {
    const session = this.activeBattles.get(challengeId);
    return session !== undefined && session.status === 'active';
  }
}
