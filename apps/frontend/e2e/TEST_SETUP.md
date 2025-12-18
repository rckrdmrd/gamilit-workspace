# E2E Test Setup Guide

This guide will help you set up the environment to run E2E tests for GAMILIT.

## Prerequisites

1. Node.js >= 18.0.0
2. npm >= 9.0.0
3. PostgreSQL database
4. Backend API running
5. Frontend dev server running

## Step 1: Install Dependencies

```bash
cd apps/frontend
npm install
npx playwright install chromium
```

## Step 2: Database Setup

Create test users in your database. You can use this SQL script:

```sql
-- Test Student
INSERT INTO users (email, password_hash, role, display_name, created_at, updated_at)
VALUES (
  'student@test.gamilit.com',
  '$2b$10$...',  -- Hash for 'TestStudent123!'
  'student',
  'Test Student',
  NOW(),
  NOW()
);

-- Test Teacher
INSERT INTO users (email, password_hash, role, display_name, created_at, updated_at)
VALUES (
  'teacher@test.gamilit.com',
  '$2b$10$...',  -- Hash for 'TestTeacher123!'
  'teacher',
  'Test Teacher',
  NOW(),
  NOW()
);

-- Test Admin
INSERT INTO users (email, password_hash, role, display_name, created_at, updated_at)
VALUES (
  'admin@test.gamilit.com',
  '$2b$10$...',  -- Hash for 'TestAdmin123!'
  'admin',
  'Test Admin',
  NOW(),
  NOW()
);
```

**OR** use the backend seed command (if available):

```bash
cd apps/backend
npm run db:seed:test
```

## Step 3: Environment Variables

Create a `.env.test` file in the frontend directory:

```env
VITE_API_URL=http://localhost:3006
VITE_APP_URL=http://localhost:3005
VITE_ENABLE_FEATURE_FLAGS=true
```

## Step 4: Start Services

Open 2 terminal windows:

**Terminal 1 - Backend:**
```bash
cd apps/backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd apps/frontend
npm run dev
```

Wait for both services to be ready.

## Step 5: Run Tests

**Option A: Run all tests (headless)**
```bash
npm run test:e2e
```

**Option B: Run with UI (recommended for development)**
```bash
npm run test:e2e:ui
```

**Option C: Run specific flow**
```bash
# Student exercises
npx playwright test student-exercise-m4.spec.ts

# Teacher workflow
npx playwright test teacher-flow.spec.ts

# Admin features
npx playwright test admin-flow.spec.ts

# Gamification
npx playwright test gamification-flow.spec.ts
```

**Option D: Debug mode**
```bash
npm run test:e2e:debug
```

## Test Data Requirements

For all tests to pass, you need:

### Users
- ✅ Student user: `student@test.gamilit.com`
- ✅ Teacher user: `teacher@test.gamilit.com`
- ✅ Admin user: `admin@test.gamilit.com`

### Exercises
- Module 4 with Quiz TikTok exercise
- Module 4 with Infografia Interactiva exercise

### Optional (for full coverage)
- Sample achievements
- Sample classrooms
- Some existing submissions for teacher tests

## Troubleshooting

### Tests timeout
- **Issue:** Tests fail with timeout errors
- **Solution:** Make sure backend and frontend are running and accessible at the configured URLs

### Element not found errors
- **Issue:** Tests can't find elements on page
- **Solution:** Check if the UI has changed, update selectors or add data-testid attributes

### Authentication fails
- **Issue:** Login tests fail
- **Solution:**
  - Verify test users exist in database
  - Check password hashes match the test passwords
  - Ensure backend authentication is working

### Flaky tests
- **Issue:** Tests pass sometimes but fail randomly
- **Solution:**
  - Add explicit waits using `waitForPageLoad()` or `waitForLoadingToFinish()`
  - Check for race conditions
  - Use data-testid attributes for more stable selectors

### Tests skip automatically
- **Issue:** Many tests show as "skipped"
- **Solution:** This is intentional. Tests skip gracefully when:
  - Required elements don't exist (feature not implemented)
  - Test data is missing
  - Backend endpoints are not available

## Running Tests in CI

Example GitHub Actions workflow:

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node
        uses: actions/setup-node@v3
        with:
          node-version: 18

      - name: Install dependencies
        run: |
          npm ci
          npx playwright install chromium

      - name: Setup database
        run: npm run db:migrate && npm run db:seed:test

      - name: Start backend
        run: npm run dev --workspace=backend &

      - name: Start frontend
        run: npm run dev --workspace=frontend &

      - name: Wait for services
        run: npx wait-on http://localhost:3005 http://localhost:3006

      - name: Run E2E tests
        run: npm run test:e2e

      - name: Upload test results
        if: always()
        uses: actions/upload-artifact@v3
        with:
          name: playwright-report
          path: playwright-report/
```

## Test Coverage Report

After running tests, view the HTML report:

```bash
npm run test:e2e:report
```

This will open a browser with detailed test results, screenshots, and videos of failed tests.

## Best Practices

1. **Keep tests independent** - Each test should set up and tear down its own state
2. **Use data-testid** - Add `data-testid` attributes to important UI elements
3. **Avoid hard waits** - Use Playwright's auto-waiting or helper functions
4. **Test user journeys** - Focus on complete flows, not individual components
5. **Handle async operations** - Always wait for loading states to finish
6. **Clean test data** - Remove or reset test data after tests run

## Next Steps

Once tests are running successfully:

1. Add more specific test scenarios
2. Implement visual regression testing
3. Add performance benchmarks
4. Set up continuous testing in CI/CD
5. Create test data factories for easier test setup

## Support

If you encounter issues:

1. Check the main README: `e2e/README.md`
2. Review test output for error messages
3. Run tests in headed mode to see what's happening
4. Check browser console logs in test results
5. Review screenshots/videos in `test-results/` directory
