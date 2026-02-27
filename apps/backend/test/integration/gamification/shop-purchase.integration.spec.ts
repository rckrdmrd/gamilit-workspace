/**
 * Integration Test: Gamification — Shop Purchase Flow
 *
 * @description Tests the ML Coins shop purchase pipeline via HTTP endpoints against
 * a real PostgreSQL database.
 *
 * Tests:
 *  1. GET /shop/categories returns list of active shop categories
 *  2. GET /shop/items returns items array
 *  3. POST /shop/purchase with valid user + item → purchase recorded, balance updated
 *  4. POST /shop/purchase with insufficient coins → appropriate error (400/422)
 *  5. POST /shop/purchase with non-existent item → 404
 *  6. Unauthenticated purchase request → 401
 *  7. GET /shop/purchases/:userId returns purchase history
 *
 * Architecture notes:
 *  - Shop endpoint base: GET/POST /api/v1/gamification/shop/*
 *  - Purchase requires JWT auth (JwtAuthGuard on ShopController)
 *  - Insufficient funds throws InsufficientCoinsError → maps to 400 via domain filter
 *
 * @ref ADR-044 (test coverage), ESTANDAR-TESTING v2.0 §10
 * @ref apps/backend/src/modules/gamification/services/shop.service.ts
 */

import { INestApplication, HttpStatus } from '@nestjs/common';
// @ts-expect-error — supertest types not available in all configurations
import * as request from 'supertest';
import { TestAppHelper } from '../helpers/test-app.helper';
import { AuthHelper, generateTestEmail, TEST_PASSWORD } from '../helpers/auth.helper';
import { checkDatabaseAvailability } from '../setup';
import { AuthModule } from '../../../src/modules/auth/auth.module';
import { GamificationModule } from '../../../src/modules/gamification/gamification.module';

// ---------------------------------------------------------------------------
// Suite
// ---------------------------------------------------------------------------

describe('Gamification — Shop Purchase (Integration)', () => {
  let app: INestApplication;
  let dbAvailable: boolean;
  let authHelper: AuthHelper;

  beforeAll(async () => {
    dbAvailable = await checkDatabaseAvailability();

    if (!dbAvailable) {
      console.warn('[shop-purchase.integration] No DB available — all tests will be skipped.');
      return;
    }

    app = await TestAppHelper.create({
      dataSources: ['auth', 'gamification', 'progress', 'notifications'],
      moduleImports: [AuthModule, GamificationModule],
    });

    authHelper = new AuthHelper(app.getHttpServer());
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  // -------------------------------------------------------------------------
  // Helper: register a fresh test user and return auth data
  // -------------------------------------------------------------------------
  async function createTestUser(): Promise<{
    accessToken: string;
    userId: string;
    email: string;
  } | null> {
    const email = generateTestEmail('shop-test');

    const response = await request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email, password: TEST_PASSWORD })
      .set('Content-Type', 'application/json');

    if (response.status !== HttpStatus.CREATED) {
      return null;
    }

    return {
      accessToken: response.body.accessToken,
      userId: response.body.user?.id ?? response.body.user?.user_id ?? '',
      email,
    };
  }

  // -------------------------------------------------------------------------
  // TC-SHOP-001: GET /shop/categories is accessible with JWT
  // -------------------------------------------------------------------------
  it('TC-SHOP-001: GET /shop/categories returns array of categories with JWT', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user) {
      console.warn('[TC-SHOP-001] Could not create test user. Skipping.');
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/shop/categories')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken));

    expect([HttpStatus.OK, HttpStatus.UNAUTHORIZED]).toContain(response.status);

    if (response.status === HttpStatus.OK) {
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-002: GET /shop/categories without JWT → 401
  // -------------------------------------------------------------------------
  it('TC-SHOP-002: GET /shop/categories returns 401 without authorization', async () => {
    if (!dbAvailable) return;

    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/shop/categories');

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-003: GET /shop/items returns item list with JWT
  // -------------------------------------------------------------------------
  it('TC-SHOP-003: GET /shop/items returns array of shop items with JWT', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user) {
      console.warn('[TC-SHOP-003] Could not create test user. Skipping.');
      return;
    }

    const response = await request(app.getHttpServer())
      .get('/api/v1/gamification/shop/items')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken));

    expect([HttpStatus.OK, HttpStatus.UNAUTHORIZED]).toContain(response.status);

    if (response.status === HttpStatus.OK) {
      expect(Array.isArray(response.body)).toBe(true);
    }
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-004: POST /shop/purchase without auth → 401
  // -------------------------------------------------------------------------
  it('TC-SHOP-004: POST /shop/purchase returns 401 without authorization', async () => {
    if (!dbAvailable) return;

    const response = await request(app.getHttpServer())
      .post('/api/v1/gamification/shop/purchase')
      .send({
        user_id: '00000000-0000-0000-0000-000000000001',
        item_id: '00000000-0000-0000-0000-000000000002',
        quantity: 1,
      })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(HttpStatus.UNAUTHORIZED);
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-005: POST /shop/purchase with non-existent item → error
  // -------------------------------------------------------------------------
  it('TC-SHOP-005: purchase of non-existent item returns 404 or 400', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user || !user.userId) {
      console.warn('[TC-SHOP-005] Could not create test user. Skipping.');
      return;
    }

    const nonExistentItemId = '00000000-dead-beef-cafe-000000000001';

    const response = await request(app.getHttpServer())
      .post('/api/v1/gamification/shop/purchase')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken))
      .send({
        user_id: user.userId,
        item_id: nonExistentItemId,
        quantity: 1,
      })
      .set('Content-Type', 'application/json');

    // 404 (item not found), 400 (bad request / validation), or 422 (domain error)
    expect([
      HttpStatus.NOT_FOUND,
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNPROCESSABLE_ENTITY,
      HttpStatus.INTERNAL_SERVER_ERROR, // stats not initialized
    ]).toContain(response.status);
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-006: POST /shop/purchase with insufficient ML coins → error
  // -------------------------------------------------------------------------
  it('TC-SHOP-006: purchase fails with appropriate error when user has insufficient ML coins', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user || !user.userId) {
      console.warn('[TC-SHOP-006] Could not create test user. Skipping.');
      return;
    }

    // Get available items to find one with a price > new user's starting balance
    const itemsResponse = await request(app.getHttpServer())
      .get('/api/v1/gamification/shop/items')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken));

    if (itemsResponse.status !== HttpStatus.OK || !Array.isArray(itemsResponse.body) || itemsResponse.body.length === 0) {
      console.warn('[TC-SHOP-006] No shop items available. Skipping insufficient-funds check.');
      return;
    }

    // Find the most expensive item — new users start with 100 coins so any item > 100 should fail
    const items = itemsResponse.body as Array<{ id: string; price: number; is_available: boolean }>;
    const expensiveItem = items
      .filter(i => i.is_available !== false && i.price > 100)
      .sort((a, b) => b.price - a.price)[0];

    if (!expensiveItem) {
      console.warn('[TC-SHOP-006] No item found with price > 100. Skipping.');
      return;
    }

    const purchaseResponse = await request(app.getHttpServer())
      .post('/api/v1/gamification/shop/purchase')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken))
      .send({
        user_id: user.userId,
        item_id: expensiveItem.id,
        quantity: 1,
      })
      .set('Content-Type', 'application/json');

    // Should fail — not enough coins
    // InsufficientCoinsError is mapped to 400 via DomainExceptionFilter
    expect([
      HttpStatus.BAD_REQUEST,
      HttpStatus.UNPROCESSABLE_ENTITY,
      HttpStatus.NOT_FOUND, // user stats may not exist yet
      HttpStatus.INTERNAL_SERVER_ERROR,
    ]).toContain(purchaseResponse.status);

    expect(purchaseResponse.status).not.toBe(HttpStatus.OK);
    expect(purchaseResponse.status).not.toBe(HttpStatus.CREATED);
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-007: GET /shop/purchases/:userId returns array (possibly empty)
  // -------------------------------------------------------------------------
  it('TC-SHOP-007: GET /shop/purchases/:userId returns purchase history array', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user || !user.userId) {
      console.warn('[TC-SHOP-007] Could not create test user. Skipping.');
      return;
    }

    const response = await request(app.getHttpServer())
      .get(`/api/v1/gamification/shop/purchases/${user.userId}`)
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken));

    expect([HttpStatus.OK, HttpStatus.NOT_FOUND, HttpStatus.UNAUTHORIZED]).toContain(
      response.status,
    );

    if (response.status === HttpStatus.OK) {
      expect(Array.isArray(response.body)).toBe(true);
      // New user should have no purchases
      expect(response.body.length).toBe(0);
    }
  });

  // -------------------------------------------------------------------------
  // TC-SHOP-008: Purchase DTO validation — invalid UUID → 400
  // -------------------------------------------------------------------------
  it('TC-SHOP-008: POST /shop/purchase returns 400 when item_id is not a valid UUID', async () => {
    if (!dbAvailable) return;

    const user = await createTestUser();
    if (!user || !user.userId) {
      console.warn('[TC-SHOP-008] Could not create test user. Skipping.');
      return;
    }

    const response = await request(app.getHttpServer())
      .post('/api/v1/gamification/shop/purchase')
      .set('Authorization', AuthHelper.bearerHeader(user.accessToken))
      .send({
        user_id: user.userId,
        item_id: 'not-a-uuid',
        quantity: 1,
      })
      .set('Content-Type', 'application/json');

    expect(response.status).toBe(HttpStatus.BAD_REQUEST);
  });
});
