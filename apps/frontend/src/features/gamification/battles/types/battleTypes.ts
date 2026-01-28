/**
 * Battle Types
 *
 * @description Type definitions for peer-to-peer battles (EXT-009)
 */

/**
 * Battle status enum
 */
export type BattleStatus = 'waiting' | 'countdown' | 'active' | 'finished';

/**
 * Match result from matchmaking
 */
export interface MatchResult {
  challengeId: string;
  opponent: {
    id: string;
    displayName: string;
    skillRating: number;
    avatarUrl?: string;
  };
  challengeType: 'head_to_head' | 'multiplayer';
  difficultyLevel?: string;
}

/**
 * Queue position information
 */
export interface QueuePosition {
  position: number;
  estimatedWaitTime: number;
  queuedAt: Date;
  preferences: MatchmakingPreferences;
  currentSearchRange: number;
}

/**
 * Matchmaking preferences
 */
export interface MatchmakingPreferences {
  challengeType: 'head_to_head' | 'multiplayer';
  difficultyLevel?: string;
  moduleId?: string;
  exerciseId?: string;
  maxSkillDiff?: number;
}

/**
 * Queue status
 */
export interface QueueStatus {
  inQueue: boolean;
  position?: QueuePosition;
  totalInQueue: number;
}

/**
 * Battle player state
 */
export interface BattlePlayer {
  id: string;
  displayName: string;
  avatarUrl?: string;
  isReady: boolean;
  isConnected: boolean;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
}

/**
 * Battle question
 */
export interface BattleQuestion {
  id: string;
  text: string;
  options: Array<{ id: string; text: string }>;
  questionNumber: number;
  totalQuestions: number;
  timeLimit?: number;
  points?: number;
}

/**
 * Battle state
 */
export interface BattleState {
  challengeId: string;
  status: BattleStatus;
  players: BattlePlayer[];
  currentQuestion?: BattleQuestion;
  timeRemaining?: number;
  totalTime?: number;
  startedAt?: Date;
  endsAt?: Date;
}

/**
 * Answer result
 */
export interface AnswerResult {
  correct: boolean;
  pointsEarned: number;
  totalScore: number;
  correctAnswer?: string;
  explanation?: string;
  timeBonus?: number;
  streakBonus?: number;
}

/**
 * Player result in battle
 */
export interface PlayerResult {
  id: string;
  displayName: string;
  score: number;
  correctAnswers: number;
  totalAnswers: number;
  accuracy: number;
  avgTimePerQuestion: number;
  xpEarned: number;
  coinsEarned: number;
  ratingChange: number;
  newRating: number;
}

/**
 * Battle result
 */
export interface BattleResult {
  challengeId: string;
  winnerId: string | null;
  isDraw: boolean;
  duration: number;
  players: PlayerResult[];
  stats: {
    totalQuestions: number;
    avgResponseTime: number;
    fastestAnswer: {
      playerId: string;
      time: number;
    };
  };
}

/**
 * Skill rating information
 */
export interface SkillRating {
  userId: string;
  rating: number;
  gamesPlayed: number;
  wins: number;
  losses: number;
  draws: number;
  currentStreak: number;
  bestStreak: number;
  peakRating: number;
  winRate: number;
  lastUpdated: Date;
}

/**
 * Leaderboard entry
 */
export interface LeaderboardEntry {
  rank: number;
  userId: string;
  displayName: string;
  avatarUrl?: string;
  rating: number;
  gamesPlayed: number;
  winRate: number;
}

/**
 * Matchmaking WebSocket events
 */
export enum MatchmakingEvent {
  JOIN_QUEUE = 'matchmaking:joinQueue',
  LEAVE_QUEUE = 'matchmaking:leaveQueue',
  GET_STATUS = 'matchmaking:getStatus',
  QUEUE_JOINED = 'matchmaking:queueJoined',
  QUEUE_LEFT = 'matchmaking:queueLeft',
  QUEUE_UPDATE = 'matchmaking:queueUpdate',
  MATCH_FOUND = 'matchmaking:matchFound',
  MATCHMAKING_TIMEOUT = 'matchmaking:timeout',
  ERROR = 'matchmaking:error',
}

/**
 * Battle WebSocket events
 */
export enum BattleEvent {
  JOIN = 'battle:join',
  READY = 'battle:ready',
  ANSWER = 'battle:answer',
  POWERUP = 'battle:powerup',
  EMOJI = 'battle:emoji',
  STATE = 'battle:state',
  COUNTDOWN = 'battle:countdown',
  START = 'battle:start',
  SCORE_UPDATE = 'battle:scoreUpdate',
  QUESTION_NEXT = 'battle:questionNext',
  OPPONENT_ANSWERED = 'battle:opponentAnswered',
  POWERUP_USED = 'battle:powerupUsed',
  END = 'battle:end',
  OPPONENT_DISCONNECTED = 'battle:opponentDisconnected',
  OPPONENT_RECONNECTED = 'battle:opponentReconnected',
  ERROR = 'battle:error',
}
