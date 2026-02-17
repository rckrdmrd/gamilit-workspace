/**
 * Environment Variables Validation
 *
 * Uses class-validator to validate all environment variables at startup.
 * Prevents the application from starting with invalid configuration.
 *
 * @ref ESTANDAR-12-FACTOR-APP §Factor III
 */

import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  validateSync,
  Min,
  Max,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  @Min(1)
  @Max(65535)
  PORT: number = 3006;

  // Database
  @IsString()
  @IsOptional()
  DB_HOST: string = 'localhost';

  @IsNumber()
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  @IsOptional()
  DB_USERNAME: string = 'gamilit_user';

  @IsString()
  @IsOptional()
  DB_PASSWORD?: string;

  @IsString()
  @IsOptional()
  DB_DATABASE: string = 'gamilit_platform';

  // JWT
  @IsString()
  @IsOptional()
  JWT_SECRET?: string;

  @IsString()
  @IsOptional()
  JWT_REFRESH_SECRET?: string;

  // Cron jobs
  @IsString()
  @IsOptional()
  CRON_ENABLED?: string;

  // Redis
  @IsString()
  @IsOptional()
  REDIS_ENABLED?: string;

  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  // CORS
  @IsString()
  @IsOptional()
  CORS_ORIGIN?: string;

  // Logging
  @IsString()
  @IsOptional()
  LOG_LEVEL?: string;

  // OpenTelemetry
  @IsString()
  @IsOptional()
  OTEL_ENABLED?: string;
}

/**
 * Validate environment variables using class-validator.
 * Called by ConfigModule.forRoot({ validate: validateEnv })
 */
export function validateEnv(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: true,
    whitelist: false,
  });

  if (errors.length > 0) {
    const messages = errors.map(err => {
      const constraints = err.constraints ? Object.values(err.constraints).join(', ') : 'unknown error';
      return `  - ${err.property}: ${constraints}`;
    });
    throw new Error(`Environment validation failed:\n${messages.join('\n')}`);
  }

  return validatedConfig;
}
