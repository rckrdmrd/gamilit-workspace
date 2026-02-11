import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_DATABASE || 'gamilit_platform',
  synchronize: process.env.DB_SYNCHRONIZE === 'true',
  logging: process.env.DB_LOGGING === 'true',
  ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
  // TypeORM retry configuration for WSL2 connectivity
  retryAttempts: parseInt(process.env.DB_RETRY_ATTEMPTS || '5', 10),
  retryDelay: parseInt(process.env.DB_RETRY_DELAY || '5000', 10),
  extra: {
    // Connection pool configuration
    // REDUCED: 10→2 to avoid WSL2 network saturation with 10 datasources
    // 10 datasources × 2 connections = 20 total (vs 100 before)
    max: parseInt(process.env.DB_POOL_MAX || '2', 10),
    // Connection timeout increased for WSL2 localhost forwarding latency
    // 10 datasources connecting simultaneously need more time
    connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || '15000', 10),
    // Idle timeout to release connections faster
    idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || '30000', 10),
  },
}));
