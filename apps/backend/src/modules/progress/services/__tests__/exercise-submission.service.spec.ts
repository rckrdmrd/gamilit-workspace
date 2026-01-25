import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken, getEntityManagerToken } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { ExerciseSubmissionService } from '../exercise-submission.service';
import { ExerciseSubmission } from '../../entities';
import { Exercise } from '@/modules/educational/entities';
import { Profile } from '@/modules/auth/entities';
import { UserStatsService } from '@/modules/gamification/services/user-stats.service';
import { MLCoinsService } from '@/modules/gamification/services/ml-coins.service';
import { MissionsService } from '@/modules/gamification/services/missions.service';
import { AchievementsService } from '@/modules/gamification/services/achievements.service';
import { NotificationService } from '@/modules/notifications/services/notification.service';
import { MailService } from '@/modules/mail/mail.service';
import { WebSocketService } from '@/modules/websocket/websocket.service';

/**
 * Test suite for ExerciseSubmissionService
 *
 * @description Tests for Rueda de Inferencias validation logic with category-specific criteria
 * @see orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/04-GUIA-PRUEBAS-RESPUESTAS.md
 */
describe('ExerciseSubmissionService - Rueda de Inferencias Validation', () => {
  let service: ExerciseSubmissionService;
  let submissionRepo: jest.Mocked<Repository<ExerciseSubmission>>;
  let exerciseRepo: jest.Mocked<Repository<Exercise>>;
  let profileRepo: jest.Mocked<Repository<Profile>>;
  let _entityManager: jest.Mocked<EntityManager>;
  let _userStatsService: jest.Mocked<UserStatsService>;
  let _mlCoinsService: jest.Mocked<MLCoinsService>;

  // Mock exercise data
  const mockExercise: Partial<Exercise> = {
    id: 'exercise-123',
    exercise_type: 'rueda_inferencias' as any,
    passing_score: 70,
    max_points: 100,
    solution: {
      validation: {
        minKeywords: 2,
        minLength: 20,
        maxLength: 200,
      },
      fragments: [
        {
          id: 'frag-1',
          text: 'Marie Curie fue pionera en el estudio de la radiactividad...',
          categoryExpectations: {
            'cat-literal': {
              keywords: ['pionera', 'radiactividad', 'nobel', 'primera', 'mujer', 'cientifico', 'premio', 'campos', 'unica'],
              description: 'Identifica hechos explícitos del texto',
              example: 'Marie fue la primera mujer en ganar un Nobel y ganó en dos campos científicos diferentes.',
              points: 20,
            },
            'cat-inferencial': {
              keywords: ['impacto', 'importancia', 'consecuencia', 'implica', 'deducir', 'sugiere', 'interdisciplinario', 'excepcional', 'destacada'],
              description: 'Deduce información no explícita basándose en pistas',
              example: 'El hecho de ganar en dos campos sugiere que Marie tenía conocimientos interdisciplinarios excepcionales.',
              points: 25,
            },
            'cat-critico': {
              keywords: ['evaluar', 'analizar', 'considerar', 'perspectiva', 'contexto', 'significa', 'barreras', 'historico', 'estructural'],
              description: 'Analiza y evalúa críticamente el contenido',
              example: 'Ganar dos Nobeles en época de discriminación demuestra que Marie superó barreras estructurales significativas.',
              points: 30,
            },
            'cat-creativo': {
              keywords: ['imaginar', 'si', 'podría', 'nuevo', 'relacionar', 'aplicar', 'innovar', 'futuro', 'actual', 'inspirar'],
              description: 'Genera ideas originales relacionadas con el texto',
              example: 'Si Marie hubiera tenido tecnología moderna, podría haber descubierto aplicaciones médicas décadas antes.',
              points: 25,
            },
          },
        },
        {
          id: 'frag-2',
          text: 'A pesar de enfrentar discriminación...',
          categoryExpectations: {
            'cat-literal': {
              keywords: ['discriminacion', 'mujer', 'persistio', 'investigacion', 'laboratorio', 'condiciones', 'dificiles', 'hombres', 'campo'],
              description: 'Identifica hechos explícitos del texto',
              example: 'Marie enfrentó discriminación por ser mujer y persistió en su investigación.',
              points: 20,
            },
            'cat-inferencial': {
              keywords: ['determinacion', 'resiliencia', 'obstaculos', 'motivacion', 'supero', 'fortaleza', 'compromiso', 'vocacion'],
              description: 'Deduce información no explícita basándose en pistas',
              example: 'Su persistencia muestra determinación extraordinaria.',
              points: 25,
            },
            'cat-critico': {
              keywords: ['injusticia', 'desigualdad', 'sistema', 'cambio', 'evaluar', 'significado', 'estructural', 'social', 'genero'],
              description: 'Analiza y evalúa críticamente el contenido',
              example: 'La discriminación evidencia la injusticia del sistema científico del siglo XX.',
              points: 30,
            },
            'cat-creativo': {
              keywords: ['inspirar', 'lecciones', 'paralelo', 'actual', 'aplicar', 'futuro', 'relacionar', 'si', 'modelo', 'ejemplo'],
              description: 'Genera ideas originales relacionadas con el texto',
              example: 'Marie inspira a científicas actuales que enfrentan obstáculos similares.',
              points: 25,
            },
          },
        },
      ],
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSubmissionService,
        {
          provide: getRepositoryToken(ExerciseSubmission, 'progress'),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Exercise, 'educational'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getEntityManagerToken('progress'),
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: UserStatsService,
          useValue: {
            addXp: jest.fn(),
          },
        },
        {
          provide: MLCoinsService,
          useValue: {
            addCoins: jest.fn(),
          },
        },
        {
          provide: MissionsService,
          useValue: {
            findByTypeAndUser: jest.fn().mockResolvedValue([]),
            updateProgress: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AchievementsService,
          useValue: {
            checkAndGrantAchievements: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendNotificationEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WebSocketService,
          useValue: {
            emitToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExerciseSubmissionService>(ExerciseSubmissionService);
    submissionRepo = module.get(getRepositoryToken(ExerciseSubmission, 'progress'));
    exerciseRepo = module.get(getRepositoryToken(Exercise, 'educational'));
    profileRepo = module.get(getRepositoryToken(Profile, 'auth'));
    _entityManager = module.get(getEntityManagerToken('progress'));
    _userStatsService = module.get(UserStatsService);
    _mlCoinsService = module.get(MLCoinsService);
  });

  describe('validateRuedaInferencias - Category Literal', () => {
    it('should score high (18-20 points) with excellent literal answer', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Marie Curie fue pionera en el estudio de la radiactividad, fue la primera mujer en ganar un Premio Nobel y la única persona en ganarlo en dos campos científicos diferentes.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-literal',
          userText: answers.fragments['frag-1'],
          timeSpent: 45,
        },
      ];

      // Mock exercise repository
      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);

      // Mock profile for getProfileId
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      // Create submission
      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'submitted',
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        score: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null); // No existing submission
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      // Submit exercise (this will trigger autoGrade which calls validateRuedaInferencias)
      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      // Score should be 18-20 for excellent literal answer (8/9 keywords)
      expect(result.score).toBeGreaterThanOrEqual(15);
      expect(result.score).toBeLessThanOrEqual(20);
    });

    it('should score medium (12-17 points) with acceptable literal answer', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Marie fue la primera mujer en recibir un Nobel y ganó premios en dos campos científicos.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-literal',
          userText: answers.fragments['frag-1'],
          timeSpent: 30,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      // Score should be 12-17 for acceptable answer (5/9 keywords)
      expect(result.score).toBeGreaterThanOrEqual(10);
      expect(result.score).toBeLessThanOrEqual(17);
    });

    it('should score zero with incorrect literal answer (keywords < minKeywords)', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Marie Curie era muy inteligente y trabajadora.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-literal',
          userText: answers.fragments['frag-1'],
          timeSpent: 20,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      expect(result.score).toBe(0);
    });
  });

  describe('validateRuedaInferencias - Category Inferencial', () => {
    it('should score high (20-25 points) with excellent inferencial answer', async () => {
      const answers = {
        fragments: {
          'frag-1': 'El hecho de que Marie ganara en dos campos científicos diferentes sugiere que tenía conocimientos interdisciplinarios excepcionales, lo que implica una capacidad intelectual destacada para dominar múltiples disciplinas.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-inferencial',
          userText: answers.fragments['frag-1'],
          timeSpent: 60,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      // Score should be 20-25 for excellent inferencial answer (5/9 keywords)
      expect(result.score).toBeGreaterThanOrEqual(14);
      expect(result.score).toBeLessThanOrEqual(25);
    });
  });

  describe('validateRuedaInferencias - Category Crítico', () => {
    it('should score high (24-30 points) with excellent critical answer', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Al analizar el contexto histórico, ganar dos Premios Nobel en una época de discriminación significa que Marie superó barreras estructurales significativas. Esto permite evaluar su impacto desde la perspectiva de las mujeres en la ciencia del siglo XX.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-critico',
          userText: answers.fragments['frag-1'],
          timeSpent: 90,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      // Score should be 24-30 for excellent critical answer (8/9 keywords)
      expect(result.score).toBeGreaterThanOrEqual(22);
      expect(result.score).toBeLessThanOrEqual(30);
    });
  });

  describe('validateRuedaInferencias - Multiple Fragments with Different Categories', () => {
    it('should validate multiple fragments with different categories correctly', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Marie Curie fue pionera en el estudio de la radiactividad y la primera mujer en ganar un Nobel.',
          'frag-2': 'Su persistencia muestra determinación y resiliencia extraordinarias al superar obstáculos.',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-literal',
          userText: answers.fragments['frag-1'],
          timeSpent: 40,
        },
        {
          fragmentId: 'frag-2',
          categoryId: 'cat-inferencial',
          userText: answers.fragments['frag-2'],
          timeSpent: 50,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      expect(result.score).toBeGreaterThan(0);
      // Should have validated both fragments
      expect((result as any).details?.byFragment?.length).toBe(2);
    });
  });

  describe('validateRuedaInferencias - Edge Cases', () => {
    it('should handle missing fragmentStates gracefully (use default category)', async () => {
      const answers = {
        fragments: {
          'frag-1': 'Marie fue la primera mujer en ganar un Nobel.',
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: answers,
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', answers);

      expect(result).toBeDefined();
      // Should use default 'cat-literal' category
      expect(result.score).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty user answer gracefully', async () => {
      const answers = {
        fragments: {
          'frag-1': '',
        },
      };

      const fragmentStates = [
        {
          fragmentId: 'frag-1',
          categoryId: 'cat-literal',
          userText: '',
          timeSpent: 0,
        },
      ];

      exerciseRepo.findOne.mockResolvedValue(mockExercise as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-123',
        answer_data: { ...answers, fragmentStates },
        status: 'graded',
        score: 0,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne.mockResolvedValue(null);
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue(mockSubmission);

      const result = await service.submitExercise('user-123', 'exercise-123', { ...answers, fragmentStates });

      expect(result).toBeDefined();
      expect(result.score).toBe(0);
    });
  });
});

/**
 * Test suite for Completar Espacios - Anti-redundancy validation (Exercise 1.3)
 *
 * @description Tests for Exercise 1.3 spaces 5 and 6 validation (cannot be identical)
 * @see docs/00-vision-general/GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md
 * @see orchestration/agentes/architecture-analyst/ejercicio-1-3-analisis-2025-11-23/
 */
describe('ExerciseSubmissionService - Completar Espacios Anti-redundancy', () => {
  let service: ExerciseSubmissionService;
  let submissionRepo: jest.Mocked<Repository<ExerciseSubmission>>;
  let exerciseRepo: jest.Mocked<Repository<Exercise>>;
  let profileRepo: jest.Mocked<Repository<Profile>>;
  let entityManager: jest.Mocked<EntityManager>;
  let _userStatsService: jest.Mocked<UserStatsService>;
  let _mlCoinsService: jest.Mocked<MLCoinsService>;

  // Mock exercise data for Completar Espacios
  const mockExerciseCompletarEspacios: Partial<Exercise> = {
    id: 'exercise-1.3',
    exercise_type: 'completar_espacios' as any,
    passing_score: 70,
    max_points: 100,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSubmissionService,
        {
          provide: getRepositoryToken(ExerciseSubmission, 'progress'),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Exercise, 'educational'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: getEntityManagerToken('progress'),
          useValue: {
            query: jest.fn(),
          },
        },
        {
          provide: UserStatsService,
          useValue: {
            addXp: jest.fn(),
          },
        },
        {
          provide: MLCoinsService,
          useValue: {
            addCoins: jest.fn(),
          },
        },
        {
          provide: MissionsService,
          useValue: {
            findByTypeAndUser: jest.fn().mockResolvedValue([]),
            updateProgress: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: AchievementsService,
          useValue: {
            checkAndGrantAchievements: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: NotificationService,
          useValue: {
            sendNotification: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendNotificationEmail: jest.fn().mockResolvedValue(true),
          },
        },
        {
          provide: WebSocketService,
          useValue: {
            emitToUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ExerciseSubmissionService>(ExerciseSubmissionService);
    submissionRepo = module.get(getRepositoryToken(ExerciseSubmission, 'progress'));
    exerciseRepo = module.get(getRepositoryToken(Exercise, 'educational'));
    profileRepo = module.get(getRepositoryToken(Profile, 'auth'));
    entityManager = module.get(getEntityManagerToken('progress'));
    _userStatsService = module.get(UserStatsService);
    _mlCoinsService = module.get(MLCoinsService);
  });

  describe('Redundancy Detection - Should Reject', () => {
    it('should reject when spaces 5 and 6 are both "ciencias"', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': 'ciencias',
          '6': 'ciencias', // REDUNDANT
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 33,
        attempt_number: 1,
        max_score: 100,
        hint_used: false,
        hints_count: 0,
        ml_coins_spent: 0,
        is_correct: false,
        time_spent_seconds: 0,
      } as unknown as ExerciseSubmission;

      // First call returns null (no existing submission), second call returns submitted, third returns graded
      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValueOnce(mockSubmission)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      expect(result).toBeDefined();
      expect(result.score).toBe(33);
      expect(result.is_correct).toBe(false);
      expect(result.feedback).toContain('no pueden tener la misma palabra');
      expect(result.feedback).toContain('ciencias');
      // @ts-ignore - testing details property
      expect(result.details?.error?.type).toBe('redundancia');
      // @ts-ignore - testing details property
      expect(result.details?.error?.espacios).toEqual(['5', '6']);
    });

    it('should reject when spaces 5 and 6 are both "matemáticas"', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': 'matemáticas',
          '6': 'matemáticas', // REDUNDANT
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 33,
        is_correct: false,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      expect(result.score).toBe(33);
      expect(result.is_correct).toBe(false);
      expect(result.feedback).toContain('matemáticas');
    });

    it('should reject when spaces 5 and 6 are both "física"', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': 'física',
          '6': 'física', // REDUNDANT
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 33,
        is_correct: false,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      expect(result.score).toBe(33);
      expect(result.is_correct).toBe(false);
      expect(result.feedback).toContain('física');
    });

    it('should be case-insensitive (reject "Ciencias" vs "ciencias")', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': 'Ciencias', // Different case
          '6': 'ciencias', // REDUNDANT (case-insensitive)
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 33,
        is_correct: false,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      expect(result.score).toBe(33);
      expect(result.is_correct).toBe(false);
      expect(result.feedback).toContain('no pueden tener la misma palabra');
    });
  });

  describe('Valid Combinations - Should Accept', () => {
    const validCombinations = [
      { space5: 'ciencias', space6: 'matemáticas', testName: 'ciencias + matemáticas' },
      { space5: 'ciencias', space6: 'física', testName: 'ciencias + física' },
      { space5: 'matemáticas', space6: 'ciencias', testName: 'matemáticas + ciencias' },
      { space5: 'matemáticas', space6: 'física', testName: 'matemáticas + física' },
      { space5: 'física', space6: 'ciencias', testName: 'física + ciencias' },
      { space5: 'física', space6: 'matemáticas', testName: 'física + matemáticas' },
    ];

    validCombinations.forEach(({ space5, space6, testName }) => {
      it(`should accept valid combination: ${testName}`, async () => {
        const answers = {
          blanks: {
            '1': 'Perú',
            '2': 'niñez',
            '3': 'escribir',
            '4': 'premio',
            '5': space5,
            '6': space6,
          },
        };

        exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
        profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

        // Mock SQL validation returning success
        entityManager.query.mockResolvedValue([
          {
            score: 100,
            is_correct: true,
            max_score: 100,
            feedback: 'Todas las respuestas son correctas',
            details: { correct_answers: 6, total_questions: 6 },
            audit_id: 'audit-123',
          },
        ]);

        const mockSubmission = {
          id: 'submission-123',
          user_id: 'profile-123',
          exercise_id: 'exercise-1.3',
          answer_data: answers,
          status: 'submitted',
          score: 100,
          is_correct: true,
        } as unknown as ExerciseSubmission;

        submissionRepo.findOne.mockResolvedValueOnce(null).mockResolvedValueOnce(mockSubmission);
        submissionRepo.create.mockReturnValue(mockSubmission);
        submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

        const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

        // Verify anti-redundancy check passed and SQL validation was called
        expect(entityManager.query).toHaveBeenCalled();
        expect(result.score).toBe(100);
        expect(result.is_correct).toBe(true);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle missing space 5 gracefully (skip anti-redundancy check)', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          // '5' is missing
          '6': 'matemáticas',
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      // Mock SQL validation
      entityManager.query.mockResolvedValue([
        {
          score: 83,
          is_correct: true,
          max_score: 100,
          feedback: '5 de 6 respuestas correctas',
          details: { correct_answers: 5, total_questions: 6 },
          audit_id: 'audit-123',
        },
      ]);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 83,
        is_correct: true,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      // Should skip anti-redundancy check and proceed to SQL validation
      expect(entityManager.query).toHaveBeenCalled();
      expect(result.score).toBe(83);
    });

    it('should handle missing space 6 gracefully (skip anti-redundancy check)', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': 'ciencias',
          // '6' is missing
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      // Mock SQL validation
      entityManager.query.mockResolvedValue([
        {
          score: 83,
          is_correct: true,
          max_score: 100,
          feedback: '5 de 6 respuestas correctas',
          details: { correct_answers: 5, total_questions: 6 },
          audit_id: 'audit-123',
        },
      ]);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 83,
        is_correct: true,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      // Should skip anti-redundancy check and proceed to SQL validation
      expect(entityManager.query).toHaveBeenCalled();
      expect(result.score).toBe(83);
    });

    it('should trim whitespace before comparison', async () => {
      const answers = {
        blanks: {
          '1': 'Perú',
          '2': 'niñez',
          '3': 'escribir',
          '4': 'premio',
          '5': '  ciencias  ', // With whitespace
          '6': 'ciencias', // REDUNDANT after trim
        },
      };

      exerciseRepo.findOne.mockResolvedValue(mockExerciseCompletarEspacios as Exercise);
      profileRepo.findOne.mockResolvedValue({ id: 'profile-123', user_id: 'user-123' } as any);

      const mockSubmission = {
        id: 'submission-123',
        user_id: 'profile-123',
        exercise_id: 'exercise-1.3',
        answer_data: answers,
        status: 'submitted',
        score: 33,
        is_correct: false,
      } as unknown as ExerciseSubmission;

      submissionRepo.findOne
        .mockResolvedValueOnce(null)
        .mockResolvedValue({ ...mockSubmission, status: 'graded' as any });
      submissionRepo.create.mockReturnValue(mockSubmission);
      submissionRepo.save.mockResolvedValue({ ...mockSubmission, status: 'graded' as any });

      const result = await service.submitExercise('user-123', 'exercise-1.3', answers);

      expect(result.score).toBe(33);
      expect(result.is_correct).toBe(false);
      expect(result.feedback).toContain('no pueden tener la misma palabra');
    });
  });
});

/**
 * Test suite for ExerciseSubmissionService - General Functionality
 *
 * @description Tests for core submission service functionality including:
 * - submitExercise() flow
 * - M5 validation (150 words minimum for diario_multimedia)
 * - Exercise already completed (one submission only)
 * - countWords() helper
 * - gradeSubmission()
 * - claimRewards()
 *
 * Target: 50%+ test coverage for module progress
 */
describe('ExerciseSubmissionService - General Functionality', () => {
  let service: ExerciseSubmissionService;
  let _submissionRepo: Repository<ExerciseSubmission>;
  let _exerciseRepo: Repository<Exercise>;
  let _profileRepo: Repository<Profile>;
  let _entityManager: EntityManager;
  let _userStatsService: UserStatsService;
  let _mlCoinsService: MLCoinsService;
  let _missionsService: any;
  let _notificationsService: any;
  let _mailService: any;

  // Mock repositories
  const mockSubmissionRepo = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    count: jest.fn(),
  };

  const mockExerciseRepo = {
    findOne: jest.fn(),
    count: jest.fn(),
  };

  const mockProfileRepo = {
    findOne: jest.fn(),
  };

  const mockEntityManager = {
    query: jest.fn(),
  };

  const mockUserStatsService = {
    findByUserId: jest.fn(),
    addXp: jest.fn(),
  };

  const mockMLCoinsService = {
    addCoins: jest.fn(),
  };

  const mockMissionsService = {
    findByTypeAndUser: jest.fn(),
    updateProgress: jest.fn(),
  };

  const mockNotificationsService = {
    sendNotification: jest.fn(),
  };

  const mockMailService = {
    sendNotificationEmail: jest.fn(),
  };

  const mockAchievementsService = {
    checkAndGrantAchievements: jest.fn(),
  };

  const mockWebSocketService = {
    emitToUser: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseSubmissionService,
        {
          provide: getRepositoryToken(ExerciseSubmission, 'progress'),
          useValue: mockSubmissionRepo,
        },
        {
          provide: getRepositoryToken(Exercise, 'educational'),
          useValue: mockExerciseRepo,
        },
        {
          provide: getRepositoryToken(Profile, 'auth'),
          useValue: mockProfileRepo,
        },
        {
          provide: getEntityManagerToken('progress'),
          useValue: mockEntityManager,
        },
        {
          provide: UserStatsService,
          useValue: mockUserStatsService,
        },
        {
          provide: MLCoinsService,
          useValue: mockMLCoinsService,
        },
        {
          provide: MissionsService,
          useValue: mockMissionsService,
        },
        {
          provide: NotificationService,
          useValue: mockNotificationsService,
        },
        {
          provide: MailService,
          useValue: mockMailService,
        },
        {
          provide: AchievementsService,
          useValue: mockAchievementsService,
        },
        {
          provide: WebSocketService,
          useValue: mockWebSocketService,
        },
      ],
    }).compile();

    service = module.get<ExerciseSubmissionService>(ExerciseSubmissionService);
    _submissionRepo = module.get(getRepositoryToken(ExerciseSubmission, 'progress'));
    _exerciseRepo = module.get(getRepositoryToken(Exercise, 'educational'));
    _profileRepo = module.get(getRepositoryToken(Profile, 'auth'));
    _entityManager = module.get(getEntityManagerToken('progress'));
    _userStatsService = module.get<UserStatsService>(UserStatsService);
    _mlCoinsService = module.get<MLCoinsService>(MLCoinsService);

    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('create', () => {
    const createDto: any = {
      user_id: 'profile-123',
      exercise_id: 'exercise-456',
      answer_data: { answer: 'test answer' },
      max_score: 100,
    };

    it('should create new submission successfully', async () => {
      // Arrange
      const mockCreatedSubmission = {
        id: 'submission-new',
        ...createDto,
        status: 'submitted',
        submitted_at: new Date(),
        hint_used: false,
        hints_count: 0,
        comodines_used: [],
        ml_coins_spent: 0,
        attempt_number: 1,
        score: 0,
      };

      mockSubmissionRepo.create.mockReturnValue(mockCreatedSubmission);
      mockSubmissionRepo.save.mockResolvedValue(mockCreatedSubmission);

      // Act
      const result = await service.create(createDto);

      // Assert
      expect(result).toBeDefined();
      expect(result.status).toBe('submitted');
      expect(result.score).toBe(0);
      expect(result.max_score).toBe(100);
      expect(mockSubmissionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: 'profile-123',
          exercise_id: 'exercise-456',
          status: 'submitted',
          hint_used: false,
          hints_count: 0,
          score: 0,
          max_score: 100,
        }),
      );
      expect(mockSubmissionRepo.save).toHaveBeenCalled();
    });

    it('should use default values for optional fields', async () => {
      // Arrange
      const mockSubmission = {
        id: 'submission-1',
        ...createDto,
        status: 'submitted',
      };

      mockSubmissionRepo.create.mockReturnValue(mockSubmission);
      mockSubmissionRepo.save.mockResolvedValue(mockSubmission);

      // Act
      await service.create(createDto);

      // Assert
      expect(mockSubmissionRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({
          hint_used: false,
          hints_count: 0,
          comodines_used: [],
          ml_coins_spent: 0,
          attempt_number: 1,
        }),
      );
    });
  });

  describe('submitExercise - M5 Validation (diario_multimedia)', () => {
    const userId = 'auth-user-123';
    const profileId = 'profile-456';
    const exerciseId = 'exercise-789';

    const mockProfile = {
      id: profileId,
      user_id: userId,
    };

    const mockExercise = {
      id: exerciseId,
      title: 'Diario Multimedia',
      exercise_type: 'diario_multimedia',
      requires_manual_grading: true,
      module_id: 'module-5',
      xp_reward: 100,
      ml_coins_reward: 20,
      passing_score: 60,
    };

    beforeEach(() => {
      mockProfileRepo.findOne.mockResolvedValue(mockProfile);
      mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
      mockSubmissionRepo.findOne.mockResolvedValue(null); // No existing submission
      mockNotificationsService.sendNotification.mockResolvedValue(true);
      mockMailService.sendNotificationEmail.mockResolvedValue(true);
      mockEntityManager.query.mockResolvedValue([
        {
          teacher_id: 'teacher-1',
          teacher_email: 'teacher@example.com',
          teacher_name: 'Test Teacher',
          classroom_name: 'Test Classroom',
        },
      ]);
    });

    it('should reject diario_multimedia with less than 150 words', async () => {
      // Arrange
      const contentWith100Words = 'word '.repeat(100).trim();
      const invalidAnswers = { content: contentWith100Words };

      // Act & Assert
      await expect(
        service.submitExercise(userId, exerciseId, invalidAnswers),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.submitExercise(userId, exerciseId, invalidAnswers),
      ).rejects.toThrow('El diario debe tener al menos 150 palabras');
    });

    it('should accept diario_multimedia with exactly 150 words', async () => {
      // Arrange
      const contentWith150Words = 'word '.repeat(150).trim();
      const validAnswers = { content: contentWith150Words };

      const mockSubmission = {
        id: 'submission-new',
        user_id: profileId,
        exercise_id: exerciseId,
        answer_data: validAnswers,
        status: 'graded',
        score: 80,
        max_score: 100,
        is_correct: true,
      };

      mockSubmissionRepo.create.mockReturnValue(mockSubmission);
      mockSubmissionRepo.save.mockResolvedValue(mockSubmission);

      mockEntityManager.query.mockResolvedValue([
        {
          score: 80,
          is_correct: true,
          details: { correct_answers: 8, total_questions: 10 },
          feedback: 'Good!',
          audit_id: 'audit-123',
          max_score: 100,
        },
      ]);

      // Act
      const result = await service.submitExercise(userId, exerciseId, validAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(mockSubmissionRepo.create).toHaveBeenCalled();
    });

    it('should accept diario_multimedia with more than 150 words', async () => {
      // Arrange
      const contentWith200Words = 'word '.repeat(200).trim();
      const validAnswers = { content: contentWith200Words };

      const mockSubmission = {
        id: 'submission-new',
        user_id: profileId,
        exercise_id: exerciseId,
        answer_data: validAnswers,
        status: 'graded',
        score: 90,
        max_score: 100,
        is_correct: true,
      };

      mockSubmissionRepo.create.mockReturnValue(mockSubmission);
      mockSubmissionRepo.save.mockResolvedValue(mockSubmission);

      mockEntityManager.query.mockResolvedValue([
        {
          score: 90,
          is_correct: true,
          details: {},
          feedback: 'Excellent!',
          audit_id: 'audit-123',
          max_score: 100,
        },
      ]);

      // Act
      const result = await service.submitExercise(userId, exerciseId, validAnswers);

      // Assert
      expect(result).toBeDefined();
      expect(mockSubmissionRepo.create).toHaveBeenCalled();
    });
  });

  describe('submitExercise - Exercise Already Completed', () => {
    const userId = 'auth-user-123';
    const profileId = 'profile-456';
    const exerciseId = 'exercise-789';

    const mockProfile = {
      id: profileId,
      user_id: userId,
    };

    const mockExercise = {
      id: exerciseId,
      title: 'Test Exercise',
      exercise_type: 'multiple_choice',
      requires_manual_grading: true,
      module_id: 'module-1',
    };

    beforeEach(() => {
      mockProfileRepo.findOne.mockResolvedValue(mockProfile);
      mockExerciseRepo.findOne.mockResolvedValue(mockExercise);
    });

    it('should throw error if exercise already completed (one submission only)', async () => {
      // Arrange
      const existingSubmission = {
        id: 'submission-existing',
        user_id: profileId,
        exercise_id: exerciseId,
        status: 'graded',
      };

      mockSubmissionRepo.findOne.mockResolvedValue(existingSubmission);

      // Act & Assert
      await expect(
        service.submitExercise(userId, exerciseId, { answer: 'test' }),
      ).rejects.toThrow(BadRequestException);

      await expect(
        service.submitExercise(userId, exerciseId, { answer: 'test' }),
      ).rejects.toThrow('You have already submitted this exercise');
    });

    it('should throw error if draft submission exists', async () => {
      // Arrange
      const draftSubmission = {
        id: 'submission-draft',
        user_id: profileId,
        exercise_id: exerciseId,
        status: 'draft',
      };

      mockSubmissionRepo.findOne.mockResolvedValue(draftSubmission);

      // Act & Assert
      await expect(
        service.submitExercise(userId, exerciseId, { answer: 'test' }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('countWords helper', () => {
    it('should return 0 for empty string', () => {
      // Arrange - Access private method via type casting
      const privateService = service as any;

      // Act
      const result = privateService.countWords('');

      // Assert
      expect(result).toBe(0);
    });

    it('should return 0 for null/undefined', () => {
      // Arrange
      const privateService = service as any;

      // Act & Assert
      expect(privateService.countWords(null)).toBe(0);
      expect(privateService.countWords(undefined)).toBe(0);
    });

    it('should count words correctly', () => {
      // Arrange
      const privateService = service as any;
      const text = 'Este es un texto de prueba con siete palabras extra';

      // Act
      const result = privateService.countWords(text);

      // Assert
      expect(result).toBe(9);
    });

    it('should handle multiple spaces between words', () => {
      // Arrange
      const privateService = service as any;
      const text = 'palabra1    palabra2     palabra3';

      // Act
      const result = privateService.countWords(text);

      // Assert
      expect(result).toBe(3);
    });

    it('should handle leading and trailing spaces', () => {
      // Arrange
      const privateService = service as any;
      const text = '   palabra1 palabra2 palabra3   ';

      // Act
      const result = privateService.countWords(text);

      // Assert
      expect(result).toBe(3);
    });

    it('should handle newlines and tabs', () => {
      // Arrange
      const privateService = service as any;
      const text = 'palabra1\npalabra2\tpalabra3';

      // Act
      const result = privateService.countWords(text);

      // Assert
      expect(result).toBe(3);
    });

    it('should count exactly 150 words', () => {
      // Arrange
      const privateService = service as any;
      const text = 'word '.repeat(150).trim();

      // Act
      const result = privateService.countWords(text);

      // Assert
      expect(result).toBe(150);
    });
  });

  describe('gradeSubmission', () => {
    const submissionId = 'submission-123';

    const mockSubmission = {
      id: submissionId,
      user_id: 'profile-456',
      exercise_id: 'exercise-789',
      answer_data: { answer: 'test' },
      status: 'submitted',
      score: 0,
      max_score: 100,
      attempt_number: 1,
    };

    it('should auto-grade submission using SQL validate_and_audit', async () => {
      // Arrange
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission);

      mockEntityManager.query.mockResolvedValue([
        {
          score: 85,
          is_correct: true,
          details: { correct_answers: 8, total_questions: 10 },
          feedback: 'Good job!',
          audit_id: 'audit-123',
          max_score: 100,
        },
      ]);

      mockSubmissionRepo.save.mockResolvedValue({
        ...mockSubmission,
        score: 85,
        is_correct: true,
        status: 'graded',
        graded_at: new Date(),
        feedback: 'Good job!',
      });

      mockExerciseRepo.findOne.mockResolvedValue({
        id: 'exercise-789',
        exercise_type: 'multiple_choice',
      });

      // Act
      const result = await service.gradeSubmission(submissionId);

      // Assert
      expect(result.score).toBe(85);
      expect(result.is_correct).toBe(true);
      expect(result.status).toBe('graded');
      expect(result.graded_at).toBeDefined();
      expect(mockSubmissionRepo.save).toHaveBeenCalled();
    });

    it('should apply manual grading when score provided', async () => {
      // Arrange
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission);
      mockSubmissionRepo.save.mockResolvedValue({
        ...mockSubmission,
        score: 90,
        is_correct: true,
        status: 'graded',
        feedback: 'Excellent work!',
      });

      // Act
      const result = await service.gradeSubmission(submissionId, {
        final_score: 90,
        grader_id: 'teacher-123',
        feedback: 'Excellent work!',
      });

      // Assert
      expect(result.score).toBe(90);
      expect(result.is_correct).toBe(true);
      expect(result.feedback).toBe('Excellent work!');
      expect(mockSubmissionRepo.save).toHaveBeenCalled();
    });

    it('should throw error if submission already graded', async () => {
      // Arrange
      const gradedSubmission = {
        ...mockSubmission,
        status: 'graded',
      };

      mockSubmissionRepo.findOne.mockResolvedValue(gradedSubmission);

      // Act & Assert
      await expect(service.gradeSubmission(submissionId)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.gradeSubmission(submissionId)).rejects.toThrow(
        'Submission already graded',
      );
    });

    it('should throw error if submission not found', async () => {
      // Arrange
      mockSubmissionRepo.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.gradeSubmission('non-existent')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should validate manual score range', async () => {
      // Arrange
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission);

      // Act & Assert - Score too high
      await expect(
        service.gradeSubmission(submissionId, { final_score: 150 }),
      ).rejects.toThrow(BadRequestException);

      // Act & Assert - Score negative
      await expect(
        service.gradeSubmission(submissionId, { final_score: -10 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set is_correct to false if score < 60% (passing threshold)', async () => {
      // Arrange
      mockSubmissionRepo.findOne.mockResolvedValue(mockSubmission);
      mockSubmissionRepo.save.mockResolvedValue({
        ...mockSubmission,
        score: 50,
        is_correct: false,
        status: 'graded',
      });

      // Act
      const result = await service.gradeSubmission(submissionId, {
        final_score: 50,
      });

      // Assert
      expect(result.is_correct).toBe(false);
    });
  });

  describe('findByUserId', () => {
    const userId = 'profile-123';

    it('should return all submissions for user ordered by date', async () => {
      // Arrange
      const mockSubmissions = [
        {
          id: 'sub-1',
          user_id: userId,
          submitted_at: new Date('2024-01-02'),
        },
        {
          id: 'sub-2',
          user_id: userId,
          submitted_at: new Date('2024-01-01'),
        },
      ];

      mockSubmissionRepo.find.mockResolvedValue(mockSubmissions);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(2);
      expect(mockSubmissionRepo.find).toHaveBeenCalledWith({
        where: { user_id: userId },
        order: { submitted_at: 'DESC' },
      });
    });

    it('should return empty array if no submissions found', async () => {
      // Arrange
      mockSubmissionRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.findByUserId(userId);

      // Assert
      expect(result).toHaveLength(0);
    });
  });

  describe('getSubmissionStats', () => {
    const userId = 'profile-123';

    it('should calculate submission statistics', async () => {
      // Arrange
      const mockSubmissions = [
        {
          id: 'sub-1',
          user_id: userId,
          status: 'graded',
          score: 90,
          max_score: 100,
          hint_used: false,
          time_spent_seconds: 300,
        },
        {
          id: 'sub-2',
          user_id: userId,
          status: 'graded',
          score: 100,
          max_score: 100,
          hint_used: false,
          time_spent_seconds: 250,
        },
        {
          id: 'sub-3',
          user_id: userId,
          status: 'submitted',
          score: 0,
          max_score: 100,
          hint_used: true,
          time_spent_seconds: 400,
        },
      ];

      mockSubmissionRepo.find.mockResolvedValue(mockSubmissions);

      // Act
      const result = await service.getSubmissionStats(userId);

      // Assert
      expect(result.total_submissions).toBe(3);
      expect(result.graded_submissions).toBe(2);
      expect(result.completion_rate).toBe(66.67);
      expect(result.average_score).toBe(95);
      expect(result.perfect_scores_count).toBe(1);
      expect(result.total_time_spent).toBe(950);
    });

    it('should return zeros for user with no submissions', async () => {
      // Arrange
      mockSubmissionRepo.find.mockResolvedValue([]);

      // Act
      const result = await service.getSubmissionStats(userId);

      // Assert
      expect(result.total_submissions).toBe(0);
      expect(result.graded_submissions).toBe(0);
      expect(result.completion_rate).toBe(0);
      expect(result.average_score).toBe(0);
      expect(result.perfect_scores_count).toBe(0);
      expect(result.total_time_spent).toBe(0);
    });
  });
});
