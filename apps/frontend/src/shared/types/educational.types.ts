/**
 * Educational Types
 * Type definitions for Educational Module API responses
 */

/**
 * Difficulty Level Enum
 * Matches database enum: public.difficulty_level
 */
export enum DifficultyLevel {
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard'
}

/**
 * Exercise Type Enum
 * Matches database enum: educational_content.exercise_type
 * @see Backend: ExerciseTypeEnum
 */
export enum ExerciseType {
  // =====================================================
  // MODULE 1: Comprensión Literal
  // =====================================================
  CRUCIGRAMA = 'crucigrama',
  LINEA_TIEMPO = 'linea_tiempo',
  SOPA_LETRAS = 'sopa_letras',
  MAPA_CONCEPTUAL = 'mapa_conceptual',
  EMPAREJAMIENTO = 'emparejamiento',

  // =====================================================
  // MODULE 2: Comprensión Inferencial
  // =====================================================
  DETECTIVE_TEXTUAL = 'detective_textual',
  CONSTRUCCION_HIPOTESIS = 'construccion_hipotesis',
  PREDICCION_NARRATIVA = 'prediccion_narrativa',
  PUZZLE_CONTEXTO = 'puzzle_contexto',
  RUEDA_INFERENCIAS = 'rueda_inferencias',

  // =====================================================
  // MODULE 3: Comprensión Crítica
  // =====================================================
  TRIBUNAL_OPINIONES = 'tribunal_opiniones',
  DEBATE_DIGITAL = 'debate_digital',
  ANALISIS_FUENTES = 'analisis_fuentes',
  PODCAST_ARGUMENTATIVO = 'podcast_argumentativo',
  MATRIZ_PERSPECTIVAS = 'matriz_perspectivas',

  // =====================================================
  // MODULE 4: Lectura Digital
  // =====================================================
  VERIFICADOR_FAKE_NEWS = 'verificador_fake_news',
  INFOGRAFIA_INTERACTIVA = 'infografia_interactiva',
  QUIZ_TIKTOK = 'quiz_tiktok',
  NAVEGACION_HIPERTEXTUAL = 'navegacion_hipertextual',
  ANALISIS_MEMES = 'analisis_memes',

  // =====================================================
  // MODULE 5: Producción Lectora
  // =====================================================
  DIARIO_MULTIMEDIA = 'diario_multimedia',
  COMIC_DIGITAL = 'comic_digital',
  VIDEO_CARTA = 'video_carta',

  // =====================================================
  // AUXILIAR EXERCISES
  // =====================================================
  COMPRENSION_AUDITIVA = 'comprension_auditiva',
  COLLAGE_PRENSA = 'collage_prensa',
  TEXTO_MOVIMIENTO = 'texto_movimiento',
  CALL_TO_ACTION = 'call_to_action',
  VERDADERO_FALSO = 'verdadero_falso',
  COMPLETAR_ESPACIOS = 'completar_espacios',
  DIARIO_INTERACTIVO = 'diario_interactivo',
  RESUMEN_VISUAL = 'resumen_visual',
}

/**
 * Content Status Enum
 * Matches database enum: educational_content.content_status
 */
export enum ContentStatus {
  DRAFT = 'draft',
  PENDING_REVIEW = 'pending_review',
  IN_REVIEW = 'in_review',
  APPROVED = 'approved',
  PUBLISHED = 'published',
  ARCHIVED = 'archived'
}

/**
 * Module
 * Represents an educational module/course
 * @see Database: educational_content.modules
 * @see Backend: ModuleResponseDto
 */
export interface Module {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  id: string;
  tenant_id?: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  title: string;
  subtitle?: string;
  description?: string;
  summary?: string;

  /**
   * Module content (JSONB)
   */
  content?: Record<string, any>;

  order_index: number;
  module_code?: string;

  // =====================================================
  // DIFFICULTY & CONTENT
  // =====================================================

  /**
   * Difficulty level
   * @deprecated Use difficulty_level instead
   */
  difficulty?: DifficultyLevel;

  difficulty_level?: DifficultyLevel;
  grade_levels?: string[];
  subjects?: string[];

  // =====================================================
  // TIMING & DURATION
  // =====================================================

  /**
   * @deprecated Use estimated_duration_minutes instead
   */
  estimated_time_minutes?: number;

  estimated_duration_minutes?: number;
  estimated_sessions?: number;

  // =====================================================
  // LEARNING OBJECTIVES & COMPETENCIES
  // =====================================================

  learning_objectives?: string[];
  competencies?: string[];
  skills_developed?: string[];

  // =====================================================
  // PREREQUISITES
  // =====================================================

  prerequisites?: string[]; // Array of module IDs
  prerequisite_skills?: string[];

  // =====================================================
  // GAMIFICATION & REWARDS
  // =====================================================

  maya_rank_required?: string;
  maya_rank_granted?: string;
  xp_reward?: number;
  ml_coins_reward?: number;

  // =====================================================
  // STATUS & PUBLICATION
  // =====================================================

  status?: ContentStatus | string;
  is_published?: boolean;
  is_featured?: boolean;
  is_free?: boolean;
  is_demo_module?: boolean;
  published_at?: string;
  archived_at?: string;

  // =====================================================
  // VERSIONING & REVISION
  // =====================================================

  version?: number;
  version_notes?: string;
  created_by?: string;
  reviewed_by?: string;
  approved_by?: string;

  // =====================================================
  // METADATA & INDEXING
  // =====================================================

  keywords?: string[];
  tags?: string[];
  thumbnail_url?: string;

  /**
   * @deprecated Use thumbnail_url instead
   */
  icon?: string;

  cover_image_url?: string;
  settings?: Record<string, any>;
  metadata?: Record<string, any>;

  // =====================================================
  // COMPUTED FIELDS
  // =====================================================

  /**
   * Total number of exercises in the module
   */
  total_exercises?: number;

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  created_at?: string;
  updated_at?: string;
}

/**
 * Exercise
 * Represents an exercise within a module with complete configuration
 *
 * @see Database: educational_content.exercises
 * @see Backend: modules/educational/entities/exercise.entity.ts
 *
 * UPDATED: Added 20+ fields from Backend/Database for full feature parity
 * - Grading & scoring configuration
 * - Timing & retry logic
 * - Power-ups (comodines) configuration
 * - Gamification rewards
 * - Adaptive learning settings
 * - Audit & versioning
 */
export interface Exercise {
  // =====================================================
  // CORE IDENTIFIERS
  // =====================================================

  id: string;
  module_id: string;

  // =====================================================
  // BASIC INFORMATION
  // =====================================================

  title: string;

  /**
   * Subtitle for additional context
   */
  subtitle?: string;

  description?: string;

  /**
   * Detailed instructions for the student
   */
  instructions?: string;

  order_index: number;

  // =====================================================
  // EXERCISE TYPE & MECHANICS
  // =====================================================

  /**
   * Exercise type (using ExerciseTypeEnum from shared constants)
   */
  type: ExerciseType;

  /**
   * Exercise-specific configuration (JSONB)
   * Structure varies by exercise type
   */
  config?: Record<string, any>;

  /**
   * Exercise content (JSONB)
   */
  content: ExerciseContent;

  /**
   * Solution data (JSONB)
   * Private information not visible to students during resolution
   */
  solution?: Record<string, any>;

  /**
   * Evaluation rubric (JSONB)
   */
  rubric?: Record<string, any>;

  // =====================================================
  // GRADING & SCORING
  // =====================================================

  /**
   * Whether the exercise can be auto-graded
   */
  auto_gradable: boolean;

  difficulty: DifficultyLevel;

  /**
   * Maximum points possible
   */
  max_score: number;

  /**
   * Alternative name for max_score (Backend uses max_points)
   */
  max_points?: number;

  /**
   * Minimum score to pass
   */
  passing_score: number;

  // =====================================================
  // TIMING
  // =====================================================

  /**
   * Estimated time in minutes to complete
   */
  estimated_time_minutes: number;

  /**
   * Time limit in minutes (null = no limit)
   */
  time_limit_minutes?: number;

  // =====================================================
  // ATTEMPTS & RETRY LOGIC
  // =====================================================

  /**
   * Maximum number of attempts allowed
   */
  max_attempts: number;

  /**
   * Whether retrying is allowed
   */
  allow_retry: boolean;

  /**
   * Minutes to wait between retries
   */
  retry_delay_minutes: number;

  // =====================================================
  // HINTS & SUPPORT
  // =====================================================

  hints?: string[];

  /**
   * Whether hints are enabled
   */
  enable_hints: boolean;

  /**
   * Cost in ML Coins to use a hint
   */
  hint_cost_ml_coins: number;

  // =====================================================
  // POWER-UPS (COMODINES)
  // =====================================================

  /**
   * Types of power-ups allowed in this exercise
   * Values: pistas, vision_lectora, segunda_oportunidad
   */
  comodines_allowed: string[];

  /**
   * Power-ups configuration (JSONB)
   * Structure: {pistas: {cost: 15, enabled: true}, ...}
   */
  comodines_config: Record<string, any>;

  // =====================================================
  // GAMIFICATION & REWARDS
  // =====================================================

  /**
   * XP awarded for correct completion
   */
  xp_reward: number;

  /**
   * ML Coins awarded for correct completion
   */
  ml_coins_reward: number;

  /**
   * Bonus multiplier for rewards (e.g., 1.5 = 50% more)
   */
  bonus_multiplier: number;

  // =====================================================
  // STATUS & VISIBILITY
  // =====================================================

  /**
   * Whether the exercise is active and available
   */
  is_active: boolean;

  /**
   * Deprecated: Use is_active instead
   * @deprecated
   */
  is_published?: boolean;

  /**
   * Whether the exercise is optional (doesn't affect progress)
   */
  is_optional: boolean;

  /**
   * Whether the exercise grants bonus rewards
   */
  is_bonus: boolean;

  // =====================================================
  // VERSIONING & REVIEW
  // =====================================================

  /**
   * Version number of the exercise
   */
  version: number;

  /**
   * Notes about version changes
   */
  version_notes?: string;

  /**
   * User ID who created the exercise
   */
  created_by?: string;

  /**
   * User ID who reviewed the exercise
   */
  reviewed_by?: string;

  // =====================================================
  // ADAPTIVE LEARNING
  // =====================================================

  /**
   * Whether the exercise adapts difficulty based on performance
   */
  adaptive_difficulty: boolean;

  /**
   * Array of prerequisite exercise IDs
   */
  prerequisites?: string[];

  /**
   * Additional metadata (JSONB)
   */
  metadata: Record<string, any>;

  // =====================================================
  // AUDIT FIELDS
  // =====================================================

  created_at: string;
  updated_at: string;

  /**
   * Deprecated: Use solution instead
   * @deprecated
   */
  solution_explanation?: string;
}

/**
 * Exercise Content
 * Content varies by exercise type
 */
export interface ExerciseContent {
  question?: string;
  options?: string[];
  correct_answer?: string | string[];
  code_template?: string;
  test_cases?: TestCase[];
  [key: string]: any;
}

/**
 * Test Case
 * For coding exercises
 */
export interface TestCase {
  input: any;
  expected_output: any;
  is_hidden: boolean;
  description?: string;
}

/**
 * Module with Progress
 * Module data combined with user progress
 */
export interface ModuleWithProgress extends Module {
  progress?: {
    status: string;
    progress_percentage: number;
    exercises_completed: number;
    exercises_total: number;
    time_spent_seconds: number;
    last_accessed_at: string;
  };
}
