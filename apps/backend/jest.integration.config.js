/**
 * Jest Integration Test Configuration
 *
 * @description Separate Jest config for integration tests that hit a real PostgreSQL database.
 * Integration tests use the suffix `.integration.spec.ts` to distinguish from unit tests.
 *
 * Run: npm run test:integration
 *
 * @note Uses --runInBand to avoid parallel database conflicts.
 * @note Excludes TypeORM mock used in unit tests (integration tests use real TypeORM).
 * @note Set TEST_DATABASE_URL or DB_HOST/DB_USER/etc. env vars to enable DB access.
 */

/** @type {import('jest').Config} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/test/integration'],
  testRegex: '\\.integration\\.spec\\.ts$',
  setupFilesAfterEnv: ['<rootDir>/test/integration/setup.ts'],

  // Memory optimization (mirrors main jest.config.js)
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  detectOpenHandles: true,
  forceExit: true,
  cache: false,

  // Longer timeout for DB-backed tests
  testTimeout: 30000,
  verbose: true,

  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts',
  ],
  coverageDirectory: './coverage-integration',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],

  transform: {
    '^.+\\.ts$': [
      'ts-jest',
      {
        tsconfig: {
          strict: false,
          strictPropertyInitialization: false,
          strictNullChecks: false,
          skipLibCheck: true,
        },
        isolatedModules: true,
      },
    ],
  },

  // Path aliases — same as main jest.config.js BUT without the TypeORM mock override.
  // Integration tests use real TypeORM to exercise actual DB interactions.
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@__mocks__/(.*)$': '<rootDir>/src/__mocks__/$1',
    // NOTE: No typeorm mock override here — integration tests need the real typeorm.
  },
};
