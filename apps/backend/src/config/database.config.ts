import { registerAs } from '@nestjs/config';

// All process.env reads MUST be inside the factory function.
// registerAs() factories run AFTER ConfigModule loads .env files (dotenv).
// Reading process.env at module scope captures stale values (before dotenv runs).
export default registerAs('database', () => {
  const dbHostMode = (process.env.DB_HOST_MODE || 'auto').trim().toLowerCase();
  const dbHost = (process.env.DB_HOST || '127.0.0.1').trim();

  if (!dbHost) {
    throw new Error('[database] DB_HOST is empty. Check .env.local/.env.dev/.env priority.');
  }

  if (!['auto', 'localhost', 'wsl-ip'].includes(dbHostMode)) {
    throw new Error(
      `[database] Invalid DB_HOST_MODE="${dbHostMode}". Allowed: auto | localhost | wsl-ip`,
    );
  }

  // Info: localhost on Windows uses connection stagger (see app.module.ts dsStagger)
  if (
    process.platform === 'win32' &&
    (dbHost === '127.0.0.1' || dbHost === 'localhost') &&
    process.env.NODE_ENV !== 'production'
  ) {
    console.log(
      '[database] DB_HOST is localhost on Windows — connection stagger enabled (500ms × 11 datasources).',
    );
  }

  if (process.env.NODE_ENV !== 'production') {
    console.log(`[database] DB_HOST_MODE=${dbHostMode}, DB_HOST=${dbHost}`);
  }

  return {
    host: dbHost,
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    database: process.env.DB_DATABASE || 'gamilit_platform',
    synchronize: process.env.DB_SYNCHRONIZE === 'true',
    logging: process.env.DB_LOGGING === 'true',
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
    retryDelay: parseInt(process.env.DB_RETRY_DELAY || '5000', 10),
    extra: {
      // Pool max per datasource (11 datasources × 2 = 22 total connections)
      max: parseInt(process.env.DB_POOL_MAX || '2', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '15000', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
    },
  };
});
