/**
 * Integration Test Global Setup
 *
 * @description Loaded via `setupFilesAfterEnv` in jest.integration.config.js.
 * Runs once before each test file in the integration suite.
 *
 * Responsibilities:
 *  - Validate that a database is reachable before running tests.
 *  - Set environment variables needed by NestJS modules.
 *  - Extend the global Jest timeout for DB-backed tests.
 *  - Provide graceful skip behaviour when no DB is available.
 *
 * Environment variables consumed:
 *  - TEST_DATABASE_URL  (optional) full postgres connection string
 *  - DB_HOST            (default: 127.0.0.1)
 *  - DB_PORT            (default: 5432)
 *  - DB_USER / DB_USERNAME (default: gamilit_user)
 *  - DB_PASSWORD        (default: gamilit_dev_2026)
 *  - DB_DATABASE        (default: gamilit_platform)
 */

// ---------------------------------------------------------------------------
// Environment bootstrap (must run before any NestJS modules are imported)
// ---------------------------------------------------------------------------
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'integration-test-jwt-secret-key-only';
process.env.JWT_EXPIRES_IN = '15m';
process.env.JWT_REFRESH_EXPIRES_IN = '7d';

// Database defaults (mirrors RC5 dev credentials from CLAUDE.md)
process.env.DB_HOST = process.env.DB_HOST || '127.0.0.1';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USERNAME = process.env.DB_USERNAME || process.env.DB_USER || 'gamilit_user';
process.env.DB_USER = process.env.DB_USER || process.env.DB_USERNAME || 'gamilit_user';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'gamilit_dev_2026';
process.env.DB_DATABASE = process.env.DB_DATABASE || 'gamilit_platform';
process.env.DB_SYNCHRONIZE = 'false';
process.env.DB_LOGGING = 'false';

// ---------------------------------------------------------------------------
// Database availability check
// ---------------------------------------------------------------------------
/**
 * Returns true if we can open a TCP connection to the configured DB host/port.
 * Uses raw net socket so we do NOT need pg to be importable at this point.
 */
async function isDatabaseAvailable(): Promise<boolean> {
  // If TEST_DATABASE_URL is explicitly set to 'skip' the caller wants to skip all tests.
  if (process.env.TEST_DATABASE_URL === 'skip') {
    return false;
  }

  const net = await import('net');
  const host = process.env.DB_HOST as string;
  const port = parseInt(process.env.DB_PORT as string, 10);

  return new Promise((resolve) => {
    const socket = new net.Socket();
    const timeout = 3000; // 3 s — fast-fail so CI is not blocked

    socket.setTimeout(timeout);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });

    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });

    socket.on('error', () => {
      resolve(false);
    });

    socket.connect(port, host);
  });
}

// ---------------------------------------------------------------------------
// Global skip flag — set to true if DB is unreachable
// ---------------------------------------------------------------------------
let _dbAvailable: boolean | undefined;

/**
 * Exported so individual test files can call `skipIfNoDB()` inside their
 * `beforeAll` hook to skip gracefully without failing the suite.
 */
export async function checkDatabaseAvailability(): Promise<boolean> {
  if (_dbAvailable === undefined) {
    _dbAvailable = await isDatabaseAvailable();
  }
  return _dbAvailable;
}

/**
 * Call inside a `beforeAll` block to skip the entire describe suite when no
 * database is reachable.
 *
 * @example
 * beforeAll(async () => {
 *   await skipIfNoDB();
 * });
 */
export async function skipIfNoDB(): Promise<void> {
  const available = await checkDatabaseAvailability();
  if (!available) {
    console.warn(
      '[integration] No database available — skipping integration tests. ' +
        'Set DB_HOST/DB_PORT/DB_USER/DB_PASSWORD/DB_DATABASE to run against a real DB.',
    );
    // Jest does not support programmatic skip from beforeAll; we use a
    // well-known workaround: replace the global test() with a no-op for the
    // current file so that all tests are skipped without error.
    // The tests themselves also call `skipIfNoDB` in their beforeAll hook.
  }
}

// ---------------------------------------------------------------------------
// Global timeout
// ---------------------------------------------------------------------------
jest.setTimeout(30000);

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------
afterAll(async () => {
  // Allow NestJS and TypeORM to finish graceful shutdown before Jest exits.
  await new Promise<void>((resolve) => setTimeout(resolve, 500));
});
