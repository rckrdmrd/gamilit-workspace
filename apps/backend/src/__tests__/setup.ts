/**
 * Jest Test Setup Configuration
 *
 * @description Global test setup for Jest test runner.
 * Configures environment variables, database mocks, and test utilities.
 *
 * Sprint 0 - P0-008: Test Infrastructure
 * Target: Increase coverage from 14% to 30%+
 */

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key-for-testing-only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Mock console methods to reduce noise in test output
global.console = {
  ...console,
  // Uncomment to suppress logs during tests
  // log: jest.fn(),
  // debug: jest.fn(),
  // info: jest.fn(),
  // warn: jest.fn(),
  // error: jest.fn(),
};

// Global test timeout (30 seconds)
jest.setTimeout(30000);

// Clean up after all tests
afterAll(async () => {
  // Close any open connections
  await new Promise((resolve) => setTimeout(resolve, 500));
});
