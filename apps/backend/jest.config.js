module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.test.ts', '**/__tests__/**/*.spec.ts', '**/*.spec.ts'],
  setupFilesAfterEnv: ['<rootDir>/src/__tests__/setup.ts'],

  // Memory optimization settings (SUBTASK-008)
  // Run tests serially to reduce memory footprint
  maxWorkers: 1,
  workerIdleMemoryLimit: '512MB',
  detectOpenHandles: true,
  forceExit: true,
  // Disable caching to reduce memory
  cache: false,
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/main.ts',
    '!src/**/__tests__/**',
    '!src/**/__mocks__/**',
    '!src/**/*.spec.ts',
    '!src/**/*.test.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html', 'json-summary'],
  coverageThreshold: {
    global: {
      branches: 30,
      functions: 30,
      lines: 30,
      statements: 30
    }
  },
  transform: {
    '^.+\\.ts$': ['ts-jest', {
      tsconfig: {
        strict: false,
        strictPropertyInitialization: false,
        strictNullChecks: false,
        skipLibCheck: true
      },
      isolatedModules: true
    }]
  },
  moduleNameMapper: {
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@middleware/(.*)$': '<rootDir>/src/middleware/$1',
    '^@config/(.*)$': '<rootDir>/src/config/$1',
    '^@database/(.*)$': '<rootDir>/src/database/$1',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@__mocks__/(.*)$': '<rootDir>/src/__mocks__/$1',
    // Map TypeORM to mock to avoid path-scurry issues in Node 20+
    '^typeorm$': '<rootDir>/src/__mocks__/typeorm.ts',
  },
  testTimeout: 30000,
  verbose: true
};
