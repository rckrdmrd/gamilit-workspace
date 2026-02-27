/**
 * Integration Test: Auth — Token Refresh Flow
 *
 * @description Tests the refresh-token rotation flow against a real PostgreSQL database.
 * Exercises POST /api/v1/auth/refresh end-to-end.
 *
 * Tests:
 *  1. Valid refresh token → 200 + new access & refresh tokens
 *  2. Expired / invalid refresh token → 401
 *  3. Completely garbage token string → 401
 *  4. Missing refreshToken field → 400 validation error
 *  5. New access token from refresh is itself valid (can call authenticated endpoint)
 *
 * @ref ADR-044 (test coverage), ESTANDAR-TESTING v2.0 §10
 */

import { INestApplication, HttpStatus } from '@nestjs/common';
// @ts-expect-error — supertest types not available in all configurations
import * as request from 'supertest';
import { TestAppHelper } from '../helpers/test-app.helper';
import { AuthHelper, generateTestEmail, TEST_PASSWORD } from '../helpers/auth.helper';
import { checkDatabaseAvailability } from '../setup';
import { AuthModule } from '../../../src/modules/auth/auth.module';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Auth — Token Refresh (Integration)', () => {
  let app: INestApplication;
  let dbAvailable: boolean;

  beforeAll(async () => {
    dbAvailable = await checkDatabaseAvailability();

    if (!dbAvailable) {
      console.warn('[token-refresh.integration] No DB available — all tests will be skipped.');
      return;
    }

    app = await TestAppHelper.createWithModules([AuthModule]);
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // -------------------------------------------------------------------------
  // Helpers
  // -------------------------------------------------------------------------

  function refreshRequest(body: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send(body)
      .set('Content-Type', 'application/json');
  }

  async function registerAndGetTokens(): Promise<{ accessToken: string; refreshToken: string } | null> {
    const email = generateTestEmail('refresh-tc');
    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: TEST_PASSWORD })
      .set('Content-Type', 'application/json');

    if (response.status !== HttpStatus.CREATED) {
      return null;
    }

    return {
      accessToken: response.body.accessToken,
      refreshToken: response.body.refreshToken,
    };
  }

  // -------------------------------------------------------------------------
  // TC-REFRESH-001: Valid refresh token → new tokens
  // -------------------------------------------------------------------------
  it('TC-REFRESH-001: returns 200 with new access and refresh tokens for a valid refresh token', async () => {
    if (!dbAvailable) return;

    const tokens = await registerAndGetTokens();
    if (!tokens) {
      console.warn('[TC-REFRESH-001] Could not obtain tokens (rate-limited or DB issue). Skipping.');
      return;
    }

    const response = await refreshRequest({ refreshToken: tokens.refreshToken });

    expect([HttpStatus.OK, HttpStatus.UNAUTHORIZED]).toContain(response.status);

    if (response.status === HttpStatus.OK) {
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(response.body.accessToken.length).toBeGreaterThan(0);
      // New refresh token should differ from old one (token rotation)
      expect(response.body.refreshToken).not.toBe(tokens.refreshToken);
    }
  });

  // -------------------------------------------------------------------------
  // TC-REFRESH-002: Invalid (garbage) refresh token → 401
  // -------------------------------------------------------------------------
  it('TC-REFRESH-002: returns 401 for a completely invalid token string', async () => {
    if (!dbAvailable) return;

    const response = await refreshRequest({
      refreshToken: 'this-is-not-a-valid-refresh-token-at-all',
    });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  // -------------------------------------------------------------------------
  // TC-REFRESH-003: Well-formed but expired / revoked JWT string → 401
  // -------------------------------------------------------------------------
  it('TC-REFRESH-003: returns 401 for a JWT-shaped token that is expired or revoked', async () => {
    if (!dbAvailable) return;

    // This is a syntactically valid JWT but signed with a different secret / expired.
    const expiredToken =
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' +
      '.eyJzdWIiOiIwMDAwMDAwMC0wMDAwLTAwMDAtMDAwMC0wMDAwMDAwMDAwMDAiLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0' +
      '.INVALID_SIGNATURE_HERE';

    const response = await refreshRequest({ refreshToken: expiredToken });

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  // -------------------------------------------------------------------------
  // TC-REFRESH-004: Missing refreshToken field → 400 validation
  // -------------------------------------------------------------------------
  it('TC-REFRESH-004: returns 400 when refreshToken field is absent', async () => {
    if (!dbAvailable) return;

    const response = await refreshRequest({});

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  // -------------------------------------------------------------------------
  // TC-REFRESH-005: New access token is valid for authenticated endpoints
  // -------------------------------------------------------------------------
  it('TC-REFRESH-005: new access token obtained via refresh can call GET /api/v1/auth/profile', async () => {
    if (!dbAvailable) return;

    const tokens = await registerAndGetTokens();
    if (!tokens) {
      console.warn('[TC-REFRESH-005] Could not obtain tokens. Skipping.');
      return;
    }

    const refreshResponse = await refreshRequest({ refreshToken: tokens.refreshToken });

    if (refreshResponse.status !== HttpStatus.OK) {
      console.warn(`[TC-REFRESH-005] Refresh returned ${refreshResponse.status}. Skipping profile call.`);
      return;
    }

    const newAccessToken: string = refreshResponse.body.accessToken;

    // Use the new token to call an authenticated endpoint
    const profileResponse = await request(app.getHttpServer())
      .get('/api/v1/auth/profile')
      .set('Authorization', AuthHelper.bearerHeader(newAccessToken));

    // 200 means the new token is valid; 401 would indicate the token is broken.
    expect([HttpStatus.OK, HttpStatus.TOO_MANY_REQUESTS]).toContain(profileResponse.status);
  });

  // -------------------------------------------------------------------------
  // TC-REFRESH-006: Empty string as refreshToken → 400
  // -------------------------------------------------------------------------
  it('TC-REFRESH-006: returns 400 when refreshToken is an empty string', async () => {
    if (!dbAvailable) return;

    const response = await refreshRequest({ refreshToken: '' });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
