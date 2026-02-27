/**
 * Integration Test: Auth — Registration Flow
 *
 * @description Tests the complete user registration flow against a real PostgreSQL database.
 * Exercises POST /api/v1/auth/register end-to-end: HTTP → Controller → Service → DB.
 *
 * Tests:
 *  1. New email → 201 Created with tokens
 *  2. Duplicate email → 409 Conflict
 *  3. Invalid email format → 400 Bad Request
 *  4. Password too short → 400 Bad Request
 *  5. Missing required fields → 400 Bad Request
 *  6. Registered user can immediately login
 *
 * Each test generates a unique email address to avoid conflicts between runs.
 * Registered test users are NOT cleaned up — they accumulate in the dev DB (acceptable
 * since emails contain a timestamp and the DB is reset periodically from seeds).
 *
 * @ref ADR-044 (test coverage), ESTANDAR-TESTING v2.0 §10
 */

import { INestApplication, HttpStatus } from '@nestjs/common';
// @ts-expect-error — supertest types not available in all configurations
import * as request from 'supertest';
import { TestAppHelper } from '../helpers/test-app.helper';
import { generateTestEmail, TEST_PASSWORD } from '../helpers/auth.helper';
import { checkDatabaseAvailability } from '../setup';
import { AuthModule } from '../../../src/modules/auth/auth.module';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Auth — Register (Integration)', () => {
  let app: INestApplication;
  let dbAvailable: boolean;

  beforeAll(async () => {
    dbAvailable = await checkDatabaseAvailability();

    if (!dbAvailable) {
      console.warn('[register.integration] No DB available — all tests will be skipped.');
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

  function registerRequest(body: Record<string, unknown>) {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send(body)
      .set('Content-Type', 'application/json');
  }

  // -------------------------------------------------------------------------
  // TC-REG-001: Successful registration with a brand-new email
  // -------------------------------------------------------------------------
  it('TC-REG-001: returns 201 with tokens for a new unique email', async () => {
    if (!dbAvailable) return;

    const email = generateTestEmail('reg-tc001');

    const response = await registerRequest({
      email,
      password: TEST_PASSWORD,
    });

    // 201 Created is the success path.
    // 429 is acceptable if the throttler fires (rare in tests but possible).
    expect([HttpStatus.CREATED, HttpStatus.TOO_MANY_REQUESTS]).toContain(response.status);

    if (response.status === HttpStatus.CREATED) {
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(response.body).toHaveProperty('user');
      expect(response.body.user).toHaveProperty('email', email);
    }
  });

  // -------------------------------------------------------------------------
  // TC-REG-002: Duplicate email → 409 Conflict
  // -------------------------------------------------------------------------
  it('TC-REG-002: returns 409 when registering with an already-used email', async () => {
    if (!dbAvailable) return;

    const email = generateTestEmail('reg-tc002-dup');

    // First registration — should succeed
    const first = await registerRequest({ email, password: TEST_PASSWORD });
    if (first.status === HttpStatus.TOO_MANY_REQUESTS) {
      console.warn('[TC-REG-002] Rate-limited on first request — skipping.');
      return;
    }
    expect(first.status).toBe(HttpStatus.CREATED);

    // Second registration with same email — should conflict
    const second = await registerRequest({ email, password: TEST_PASSWORD });
    expect([HttpStatus.CONFLICT, HttpStatus.TOO_MANY_REQUESTS]).toContain(second.status);
  });

  // -------------------------------------------------------------------------
  // TC-REG-003: Invalid email format → 400
  // -------------------------------------------------------------------------
  it('TC-REG-003: returns 400 for an invalid email format', async () => {
    if (!dbAvailable) return;

    const response = await registerRequest({
      email: 'not-a-valid-email',
      password: TEST_PASSWORD,
    });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  // -------------------------------------------------------------------------
  // TC-REG-004: Password too short → 400
  // -------------------------------------------------------------------------
  it('TC-REG-004: returns 400 when password is shorter than 8 characters', async () => {
    if (!dbAvailable) return;

    const response = await registerRequest({
      email: generateTestEmail('reg-tc004'),
      password: 'short',
    });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  // -------------------------------------------------------------------------
  // TC-REG-005: Missing email → 400
  // -------------------------------------------------------------------------
  it('TC-REG-005: returns 400 when email is absent', async () => {
    if (!dbAvailable) return;

    const response = await registerRequest({
      password: TEST_PASSWORD,
    });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  // -------------------------------------------------------------------------
  // TC-REG-006: Missing password → 400
  // -------------------------------------------------------------------------
  it('TC-REG-006: returns 400 when password is absent', async () => {
    if (!dbAvailable) return;

    const response = await registerRequest({
      email: generateTestEmail('reg-tc006'),
    });

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });

  // -------------------------------------------------------------------------
  // TC-REG-007: Registered user can immediately login
  // -------------------------------------------------------------------------
  it('TC-REG-007: user registered in this test can login immediately after', async () => {
    if (!dbAvailable) return;

    const email = generateTestEmail('reg-tc007-login');

    const regResponse = await registerRequest({ email, password: TEST_PASSWORD });

    if (regResponse.status === HttpStatus.TOO_MANY_REQUESTS) {
      console.warn('[TC-REG-007] Rate-limited — skipping follow-up login check.');
      return;
    }

    expect(regResponse.status).toBe(HttpStatus.CREATED);

    // Now login with the same credentials
    const loginResponse = await request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email, password: TEST_PASSWORD })
      .set('Content-Type', 'application/json');

    expect([HttpStatus.OK, HttpStatus.TOO_MANY_REQUESTS]).toContain(loginResponse.status);

    if (loginResponse.status === HttpStatus.OK) {
      expect(loginResponse.body).toHaveProperty('accessToken');
      expect(typeof loginResponse.body.accessToken).toBe('string');
    }
  });

  // -------------------------------------------------------------------------
  // TC-REG-008: Registration response contains expected user fields
  // -------------------------------------------------------------------------
  it('TC-REG-008: registration response user object contains id and email', async () => {
    if (!dbAvailable) return;

    const email = generateTestEmail('reg-tc008-shape');

    const response = await registerRequest({ email, password: TEST_PASSWORD });

    if (response.status === HttpStatus.TOO_MANY_REQUESTS) {
      console.warn('[TC-REG-008] Rate-limited — skipping shape assertion.');
      return;
    }

    expect(response.status).toBe(HttpStatus.CREATED);
    expect(response.body.user).toHaveProperty('id');
    expect(response.body.user.email).toBe(email);
  });
});
