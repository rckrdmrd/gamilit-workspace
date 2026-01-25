/**
 * Service Mocks
 *
 * @description Reusable mock implementations for NestJS services.
 * Provides pre-configured mocks for commonly used services.
 *
 * Sprint 0 - P0-008: Test Infrastructure
 */

import { JwtService } from '@nestjs/jwt';
import { EntityManager } from 'typeorm';

/**
 * Mock JwtService
 */
export const createMockJwtService = (): jest.Mocked<JwtService> => ({
  sign: jest.fn(),
  signAsync: jest.fn(),
  verify: jest.fn(),
  verifyAsync: jest.fn(),
  decode: jest.fn(),
} as any);

/**
 * Mock EntityManager
 */
export const createMockEntityManager = (): jest.Mocked<EntityManager> => ({
  query: jest.fn(),
  save: jest.fn(),
  remove: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  transaction: jest.fn(),
  getRepository: jest.fn(),
  createQueryBuilder: jest.fn(),
} as any);

/**
 * Mock MLCoinsService
 */
export const createMockMLCoinsService = () => ({
  getBalance: jest.fn(),
  getCoinsStats: jest.fn(),
  addCoins: jest.fn(),
  spendCoins: jest.fn(),
  getTransactions: jest.fn(),
  getTransactionsByType: jest.fn(),
  getTransactionsByDateRange: jest.fn(),
  getTotalEarningsInPeriod: jest.fn(),
  getTotalSpendingInPeriod: jest.fn(),
  getTransactionsByReference: jest.fn(),
  auditBalance: jest.fn(),
  getTopEarners: jest.fn(),
  getDailySummary: jest.fn(),
});

/**
 * Mock UserStatsService
 */
export const createMockUserStatsService = () => ({
  findByUserId: jest.fn(),
  updateStats: jest.fn(),
  createStats: jest.fn(),
  incrementExercises: jest.fn(),
  addXP: jest.fn(),
  addXp: jest.fn(), // Both casing variants
  updateStreak: jest.fn(),
  getLeaderboard: jest.fn(),
});

/**
 * Mock RanksService
 */
export const createMockRanksService = () => ({
  getCurrentRank: jest.fn(),
  checkForRankUp: jest.fn(),
  getRankRequirements: jest.fn(),
  getAllRanks: jest.fn(),
  getRankProgress: jest.fn(),
});

/**
 * Mock MissionTemplatesService
 */
export const createMockMissionTemplatesService = () => ({
  getActiveByTypeAndLevel: jest.fn(),
  getActiveByType: jest.fn(),
  selectRandom: jest.fn(),
  findById: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
});

/**
 * Mock ExerciseValidatorService
 */
export const createMockExerciseValidatorService = () => ({
  validateExercise: jest.fn(),
  requiresManualGrading: jest.fn(),
  checkAntiRedundancy: jest.fn(),
  countWords: jest.fn(),
});

/**
 * Mock ExerciseGradingService
 */
export const createMockExerciseGradingService = () => ({
  autoGrade: jest.fn(),
  applyManualGrade: jest.fn(),
  generateFeedback: jest.fn(),
});

/**
 * Mock ExerciseRewardsService
 */
export const createMockExerciseRewardsService = () => ({
  calculateRewards: jest.fn(),
  applyRewards: jest.fn(),
  getBonusMultiplier: jest.fn(),
});

/**
 * Helper: Reset all service mocks
 */
export function resetServiceMocks(service: any): void {
  Object.keys(service).forEach((key) => {
    if (typeof service[key]?.mockReset === 'function') {
      service[key].mockReset();
    }
  });
}

/**
 * Test Data Factories
 */
export const TestDataFactory = {
  /**
   * Creates a mock UUID
   */
  createUuid: (prefix: string = 'test'): string => {
    const randomPart = Math.random().toString(36).substring(2, 15);
    return `${prefix}-${randomPart}-0000-0000-000000000000`.substring(0, 36);
  },

  /**
   * Creates a mock date
   */
  createDate: (daysOffset: number = 0): Date => {
    const date = new Date();
    date.setDate(date.getDate() + daysOffset);
    return date;
  },

  /**
   * Creates a mock email
   */
  createEmail: (username: string = 'test'): string => {
    return `${username}@gamilit-test.com`;
  },

  /**
   * Creates a mock user object
   */
  createUser: (overrides: any = {}) => ({
    id: TestDataFactory.createUuid('user'),
    email: TestDataFactory.createEmail('testuser'),
    encrypted_password: '$2b$10$hashedpassword',
    role: 'student',
    created_at: new Date(),
    updated_at: new Date(),
    last_sign_in_at: null,
    deleted_at: null,
    email_confirmed_at: null,
    banned_until: null,
    ...overrides,
  }),

  /**
   * Creates a mock profile object
   */
  createProfile: (overrides: any = {}) => ({
    id: TestDataFactory.createUuid('profile'),
    user_id: TestDataFactory.createUuid('user'),
    tenant_id: TestDataFactory.createUuid('tenant'),
    email: TestDataFactory.createEmail('testuser'),
    first_name: 'Test',
    last_name: 'User',
    role: 'student',
    status: 'active',
    email_verified: false,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  /**
   * Creates a mock tenant object
   */
  createTenant: (overrides: any = {}) => ({
    id: TestDataFactory.createUuid('tenant'),
    slug: 'gamilit-prod',
    name: 'GAMILIT Platform',
    is_active: true,
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  /**
   * Creates a mock mission object
   */
  createMission: (overrides: any = {}) => ({
    id: TestDataFactory.createUuid('mission'),
    user_id: TestDataFactory.createUuid('user'),
    template_id: TestDataFactory.createUuid('template'),
    title: 'Test Mission',
    description: 'Complete test objectives',
    mission_type: 'daily',
    status: 'active',
    progress: 0,
    objectives: [
      {
        type: 'exercise_completion',
        target: 5,
        current: 0,
        description: 'Complete 5 exercises',
      },
    ],
    rewards: {
      ml_coins: 50,
      xp: 100,
    },
    start_date: new Date(),
    end_date: TestDataFactory.createDate(1),
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),

  /**
   * Creates a mock exercise object
   */
  createExercise: (overrides: any = {}) => ({
    id: TestDataFactory.createUuid('exercise'),
    module_id: TestDataFactory.createUuid('module'),
    title: 'Test Exercise',
    exercise_type: 'multiple_choice',
    max_score: 100,
    passing_score: 60,
    requires_manual_grading: false,
    solution: {},
    created_at: new Date(),
    updated_at: new Date(),
    ...overrides,
  }),
};
