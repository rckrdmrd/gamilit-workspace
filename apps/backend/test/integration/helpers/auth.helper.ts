/**
 * Auth Helper — Integration Tests
 *
 * @description Provides convenience functions for obtaining JWT tokens within
 * integration tests.  Calls the real `/api/auth/login` endpoint so the tokens
 * are valid JWTs signed by the running NestJS application.
 *
 * Usage:
 * ```typescript
 * const authHelper = new AuthHelper(app.getHttpServer());
 * const tokens = await authHelper.loginAsAdmin();
 * // tokens.accessToken, tokens.refreshToken
 * ```
 *
 * The seeded test users are expected to exist in the dev database.
 * Credentials match the dev seeds in `apps/database/seeds/dev/`.
 */

import { HttpStatus, INestApplication } from '@nestjs/common';
// @ts-expect-error — supertest types not available in all configurations
import * as request from 'supertest';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  userId: string;
}

/**
 * Known seeded users (from dev seeds).
 * These credentials must exist in the database before running integration tests.
 */
const SEEDED_USERS = {
  admin: {
    email: 'admin@gamilit.com',
    password: 'Admin123!',
  },
  teacher: {
    email: 'teacher@gamilit.com',
    password: 'Teacher123!',
  },
  student: {
    email: 'student@gamilit.com',
    password: 'Student123!',
  },
} as const;

export class AuthHelper {
  private readonly httpServer: ReturnType<INestApplication['getHttpServer']>;

  constructor(httpServer: ReturnType<INestApplication['getHttpServer']>) {
    this.httpServer = httpServer;
  }

  /**
   * Login with arbitrary credentials.
   * Throws if the response is not 200 with accessToken.
   */
  async login(email: string, password: string): Promise<AuthTokens> {
    const response = await request(this.httpServer)
      .post('/api/auth/login')
      .send({ email, password })
      .expect(HttpStatus.OK);

    if (!response.body.accessToken) {
      throw new Error(
        `Login failed for ${email}: ${JSON.stringify(response.body)}`,
      );
    }

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
      userId: response.body.user?.id ?? response.body.user?.user_id ?? '',
    };
  }

  /** Login as the seeded admin user. */
  async loginAsAdmin(): Promise<AuthTokens> {
    return this.login(SEEDED_USERS.admin.email, SEEDED_USERS.admin.password);
  }

  /** Login as the seeded teacher user. */
  async loginAsTeacher(): Promise<AuthTokens> {
    return this.login(SEEDED_USERS.teacher.email, SEEDED_USERS.teacher.password);
  }

  /** Login as the seeded student user. */
  async loginAsStudent(): Promise<AuthTokens> {
    return this.login(SEEDED_USERS.student.email, SEEDED_USERS.student.password);
  }

  /**
   * Returns the Authorization header value for a given token.
   * @example helper.bearerHeader(tokens.accessToken) → 'Bearer eyJ...'
   */
  static bearerHeader(accessToken: string): string {
    return `Bearer ${accessToken}`;
  }
}

/**
 * Generate a unique test email address to avoid conflicts between test runs.
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}@integration-test.gamilit.local`;
}

/**
 * Standard password that passes all validation rules used in RegisterUserDto.
 */
export const TEST_PASSWORD = 'IntegrationTest123!';
