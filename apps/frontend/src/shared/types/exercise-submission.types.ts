/**
 * Exercise Submission Types
 *
 * Type definitions for exercise submissions and attempts.
 *
 * @description Single Source of Truth (SSOT) for exercise submission types.
 * Aligned with backend entity: progress_tracking.exercise_submissions
 *
 * @see Backend Entity: /modules/progress/entities/exercise-submission.entity.ts
 * @see Backend DTO: /modules/progress/dto/exercise-submission-response.dto.ts
 * @see Database: progress_tracking.exercise_submissions table
 *
 * DTO-001: Created canonical types for ExerciseSubmission to replace `any` usage
 */

import { ExerciseType } from './educational.types';

/**
 * Submission Status Enum
 *
 * Status values for exercise submissions
 */
export type SubmissionStatus =
  | 'draft'      // Submission in progress (not yet submitted)
  | 'submitted'  // Submission completed and sent
  | 'graded'     // Submission has been graded
  | 'reviewed';  // Submission has been manually reviewed

/**
 * Rank Up Info
 *
 * Information about rank promotion after exercise completion
 */
export interface RankUpInfo {
  /**
   * New rank achieved
   */
  newRank: string;

  /**
   * Previous rank
   */
  previousRank?: string;

  /**
   * Bonus ML Coins for ranking up
   */
  bonusMLCoins: number;

  /**
   * New XP multiplier
   */
  newMultiplier: number;
}

/**
 * Exercise Submission Interface
 *
 * Complete exercise submission record including answer, scoring,
 * feedback, and gamification rewards.
 *
 * @description Represents a student's submission for an exercise.
 * This is the main submission type returned by the backend.
 */
export interface ExerciseSubmission {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  /**
   * Unique submission ID
   */
  id: string;

  /**
   * User ID who made the submission
   */
  userId: string;

  /**
   * Exercise ID being submitted
   */
  exerciseId: string;

  // =====================================================
  // ANSWER DATA
  // =====================================================

  /**
   * Student's answer data (structure varies by exercise type)
   * This is a flexible JSON object that matches the exercise's expected format
   */
  answerData: Record<string, unknown>;

  // =====================================================
  // RESULTS & SCORING
  // =====================================================

  /**
   * Whether the answer is correct
   * Null for exercises pending manual review
   */
  isCorrect: boolean | null;

  /**
   * Score obtained (0 to maxScore)
   */
  score: number;

  /**
   * Maximum possible score
   */
  maxScore: number;

  /**
   * Feedback from system or teacher
   */
  feedback: string | null;

  // =====================================================
  // HINTS & POWER-UPS (COMODINES)
  // =====================================================

  /**
   * Whether any hint was used
   */
  hintUsed: boolean;

  /**
   * Number of hints used
   */
  hintsCount: number;

  /**
   * Power-ups (comodines) used
   * Values: 'pistas', 'vision_lectora', 'segunda_oportunidad'
   */
  comodinesUsed: string[] | null;

  /**
   * ML Coins spent on power-ups
   */
  mlCoinsSpent: number;

  // =====================================================
  // TIME & ATTEMPT TRACKING
  // =====================================================

  /**
   * Time spent on exercise (in seconds)
   */
  timeSpentSeconds: number | null;

  /**
   * Attempt number (1, 2, 3, ...)
   */
  attemptNumber: number;

  // =====================================================
  // STATUS & WORKFLOW
  // =====================================================

  /**
   * Submission status
   */
  status: SubmissionStatus;

  // =====================================================
  // TIMESTAMPS
  // =====================================================

  /**
   * When exercise was started
   */
  startedAt: string | null; // ISO date string

  /**
   * When submission was sent
   */
  submittedAt: string; // ISO date string

  /**
   * When submission was graded
   */
  gradedAt: string | null; // ISO date string

  /**
   * Record creation timestamp
   */
  createdAt: string; // ISO date string

  /**
   * Record last update timestamp
   */
  updatedAt: string; // ISO date string

  // =====================================================
  // GAMIFICATION REWARDS
  // =====================================================

  /**
   * XP earned from this submission
   */
  xpEarned?: number;

  /**
   * ML Coins earned from this submission
   */
  mlCoinsEarned?: number;

  /**
   * Rank up information (if user ranked up)
   */
  rankUp?: RankUpInfo | null;
}

/**
 * Exercise Submission Summary
 *
 * Simplified submission info for quick display
 */
export interface ExerciseSubmissionSummary {
  /**
   * Submission ID
   */
  id: string;

  /**
   * Exercise ID
   */
  exerciseId: string;

  /**
   * User ID
   */
  userId: string;

  /**
   * Score obtained
   */
  score: number;

  /**
   * Maximum score
   */
  maxScore: number;

  /**
   * Whether correct
   */
  isCorrect: boolean | null;

  /**
   * Submission status
   */
  status: SubmissionStatus;

  /**
   * Submitted timestamp
   */
  submittedAt: string;

  /**
   * XP earned
   */
  xpEarned?: number;

  /**
   * ML Coins earned
   */
  mlCoinsEarned?: number;
}

// =====================================================
// EXERCISE-SPECIFIC SUBMISSION CONTENT TYPES
// =====================================================

/**
 * Verificador Fake News Content
 *
 * Submission content for fake news verification exercise
 */
export interface VerificadorFakeNewsContent {
  type: 'verificador_fake_news';
  claimsVerified: Array<{
    claimId: string;
    isFake: boolean;
    evidence: string;
    sources?: string[];
  }>;
}

/**
 * Infografía Interactiva Content
 *
 * Submission content for interactive infographic exercise
 */
export interface InfografiaInteractivaContent {
  type: 'infografia_interactiva';
  sections: Array<{
    sectionId: string;
    completed: boolean;
    answers: Record<string, unknown>;
  }>;
  totalProgress: number; // 0-100%
}

/**
 * Quiz TikTok Content
 *
 * Submission content for TikTok-style quiz exercise
 */
export interface QuizTikTokContent {
  type: 'quiz_tiktok';
  answers: Array<{
    questionId: string;
    selectedOption: string;
    isCorrect?: boolean;
  }>;
  completionTime: number; // seconds
}

/**
 * Navegación Hipertextual Content
 *
 * Submission content for hypertext navigation exercise
 */
export interface NavegacionHipertextualContent {
  type: 'navegacion_hipertextual';
  path: string[]; // IDs of nodes visited
  decisions: Array<{
    nodeId: string;
    choice: string;
    timestamp: number;
  }>;
  endingReached: string;
}

/**
 * Análisis Memes Content
 *
 * Submission content for meme analysis exercise
 */
export interface AnalisisMemesContent {
  type: 'analisis_memes';
  analyses: Array<{
    memeId: string;
    interpretation: string;
    context: string;
    critique: string;
  }>;
}

/**
 * Diario Reflexivo Content
 *
 * Submission content for reflective journal exercise
 */
export interface DiarioReflexivoContent {
  type: 'diario_multimedia';
  entries: Array<{
    entryId: string;
    text: string;
    mediaUrls?: string[];
    emotions?: string[];
    timestamp: string;
  }>;
}

/**
 * Video Carta Content
 *
 * Submission content for video letter exercise
 */
export interface VideoCartaContent {
  type: 'video_carta';
  videoUrl: string;
  transcript?: string;
  duration: number; // seconds
  captions?: Array<{
    timestamp: number;
    text: string;
  }>;
}

/**
 * Podcast Content
 *
 * Submission content for podcast creation exercise
 */
export interface PodcastContent {
  type: 'podcast_argumentativo';
  audioUrl: string;
  transcript?: string;
  duration: number; // seconds
  script?: string;
  sources?: string[];
}

/**
 * Generic Exercise Content
 *
 * Fallback content type for exercises not listed above
 */
export interface GenericExerciseContent {
  type: string;
  [key: string]: unknown;
}

/**
 * Exercise Submission Content (Discriminated Union)
 *
 * Union type of all possible submission content structures
 */
export type ExerciseSubmissionContent =
  | VerificadorFakeNewsContent
  | InfografiaInteractivaContent
  | QuizTikTokContent
  | NavegacionHipertextualContent
  | AnalisisMemesContent
  | DiarioReflexivoContent
  | VideoCartaContent
  | PodcastContent
  | GenericExerciseContent;

// =====================================================
// DTOs FOR CREATING/UPDATING SUBMISSIONS
// =====================================================

/**
 * Create Exercise Submission DTO
 *
 * Data required to create a new exercise submission
 */
export interface CreateExerciseSubmissionDto {
  /**
   * Exercise ID (required)
   */
  exerciseId: string;

  /**
   * Student's answer data (required)
   */
  answerData: Record<string, unknown>;

  /**
   * Time spent in seconds
   */
  timeSpentSeconds?: number;

  /**
   * Hints used count
   */
  hintsCount?: number;

  /**
   * Power-ups used
   */
  comodinesUsed?: string[];

  /**
   * ML Coins spent
   */
  mlCoinsSpent?: number;

  /**
   * When exercise was started
   */
  startedAt?: string; // ISO date string
}

/**
 * Update Exercise Submission DTO
 *
 * Data allowed to be updated in a submission
 * (usually only by teachers/admins for manual grading)
 */
export interface UpdateExerciseSubmissionDto {
  /**
   * Override score
   */
  score?: number;

  /**
   * Override correct status
   */
  isCorrect?: boolean;

  /**
   * Add/update feedback
   */
  feedback?: string;

  /**
   * Update status
   */
  status?: SubmissionStatus;
}

/**
 * Grade Submission DTO
 *
 * Data for manually grading a submission
 */
export interface GradeSubmissionDto {
  /**
   * Score to assign (0 to maxScore)
   */
  score: number;

  /**
   * Whether answer is correct
   */
  isCorrect: boolean;

  /**
   * Feedback for student
   */
  feedback?: string;
}

/**
 * Submission Query Filters
 *
 * Filters for querying exercise submissions
 */
export interface SubmissionQueryFilters {
  /**
   * Filter by user ID
   */
  userId?: string;

  /**
   * Filter by exercise ID
   */
  exerciseId?: string;

  /**
   * Filter by status
   */
  status?: SubmissionStatus;

  /**
   * Filter by correctness
   */
  isCorrect?: boolean;

  /**
   * Minimum score
   */
  minScore?: number;

  /**
   * Maximum score
   */
  maxScore?: number;

  /**
   * Submitted after this date
   */
  submittedAfter?: string; // ISO date string

  /**
   * Submitted before this date
   */
  submittedBefore?: string; // ISO date string

  /**
   * Page number
   */
  page?: number;

  /**
   * Results per page
   */
  limit?: number;

  /**
   * Sort field
   */
  sortBy?: 'submittedAt' | 'score' | 'timeSpentSeconds';

  /**
   * Sort order
   */
  sortOrder?: 'asc' | 'desc';
}

/**
 * Paginated Submissions Response
 *
 * Wrapper for paginated submission results
 */
export interface PaginatedSubmissions {
  /**
   * Array of submissions
   */
  data: ExerciseSubmission[];

  /**
   * Pagination metadata
   */
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}

/**
 * Submission with Exercise Info
 *
 * Extended submission with related exercise information
 */
export interface SubmissionWithExercise extends ExerciseSubmission {
  /**
   * Related exercise data
   */
  exercise?: {
    id: string;
    title: string;
    type: ExerciseType;
    moduleId: string;
    moduleName?: string;
  };
}
