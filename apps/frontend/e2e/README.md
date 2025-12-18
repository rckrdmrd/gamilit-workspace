# E2E Tests - GAMILIT

End-to-End tests using Playwright for the GAMILIT educational gamification platform.

## 📋 Overview

This directory contains End-to-End (E2E) tests that verify critical user flows and ensure the application works correctly from a user's perspective.

## 🚀 Running Tests

### Run all E2E tests (headless)
```bash
npm run test:e2e
```

### Run with UI (interactive mode)
```bash
npm run test:e2e:ui
```

### Run with browser visible (headed mode)
```bash
npm run test:e2e:headed
```

### Debug mode (step through tests)
```bash
npm run test:e2e:debug
```

### View test report
```bash
npm run test:e2e:report
```

### Run specific test file
```bash
npx playwright test auth.spec.ts
```

### Run tests in specific browser
```bash
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project="Mobile Chrome"
```

## 📁 Test Files

### Core Tests
- **`auth.spec.ts`** - Authentication and registration flows
- **`navigation.spec.ts`** - Basic navigation and routing
- **`student-journey.spec.ts`** - Original student journey tests (legacy)

### Critical Flow Tests (NEW)

#### `student-exercise-m4.spec.ts`
Module 4 exercise flows for students:
- Complete Quiz TikTok with time penalty tracking
- Complete Infografia Interactiva with drag-drop
- Submit exercises and view points
- Track exercise progress

#### `teacher-flow.spec.ts`
Teacher workflow tests:
- View pending submissions
- Review and grade student work
- Receive notifications for new submissions
- Filter submissions by student/exercise
- View student progress analytics
- Export reports
- Bulk grade submissions

#### `admin-flow.spec.ts`
Admin portal tests:
- Access admin dashboard
- Manage feature flags (view, toggle, create)
- Configure feature flag targeting rules
- Manage user roles and permissions
- Search and filter users
- Edit user permissions

#### `gamification-flow.spec.ts`
Gamification system tests:
- Display and track XP/levels
- Gain XP after exercise completion
- Level up animations
- View and unlock achievements
- Display leaderboard with rankings
- Filter leaderboard by period/classroom
- Earn and display ML Coins

## 🎯 Test Status

### Implemented Critical Flow Tests (NEW):
✅ **Student Exercise Flow** - M4 Quiz TikTok with time penalty
✅ **Student Exercise Flow** - Infografia drag-drop exercise
✅ **Teacher Flow** - View and grade submissions
✅ **Teacher Flow** - Notification system
✅ **Admin Flow** - Feature flag management
✅ **Admin Flow** - Role and permission management
✅ **Gamification** - XP and level progression
✅ **Gamification** - Achievement system
✅ **Gamification** - Leaderboard functionality

### Legacy Tests (Original):
✅ Login page display
✅ Form validation
✅ Navigation basics
✅ 404 handling
✅ Protected routes redirect
✅ Performance checks

### Tests Requiring Test Data Setup:
Most new critical flow tests will run but may skip certain scenarios if:
- Test user accounts don't exist in database
- Backend API is not running
- Specific test data (exercises, achievements) is not seeded

**Note:** Tests are designed to gracefully skip scenarios when prerequisites are not met.

## 🔧 Configuration

Configuration is in `playwright.config.ts`:
- **Test directory:** `./e2e`
- **Base URL:** `http://localhost:3005`
- **Browsers:** Chromium, Firefox, Mobile Chrome
- **Retries:** 2 (on CI), 0 (local)
- **Reports:** HTML, List, JSON

## 📊 Test Coverage Status

### Critical Flows (Priority 1) 🔥
- [x] Authentication (Login/Register)
- [x] Student: Browse → Start Exercise → Complete
- [x] Student: Module 4 Quiz TikTok with time penalty
- [x] Student: Module 4 Infografia drag-drop
- [x] Teacher: View submissions → Review → Grade
- [x] Teacher: Receive notifications
- [x] Admin: Feature flag management
- [x] Admin: Role and permission management
- [x] Gamification: XP and level progression
- [x] Gamification: Achievement system
- [x] Leaderboard display and filtering

### Important Flows (Priority 2) 🟡
- [x] Student progress tracking
- [x] Teacher: Filter submissions by student/exercise
- [x] Teacher: Export reports
- [x] Teacher: Bulk grading
- [x] Admin: Search and filter users
- [ ] Profile management
- [ ] Social features (friends, classrooms)

### Nice to Have (Priority 3) 🟢
- [ ] Settings/preferences
- [ ] Advanced notifications
- [ ] Search functionality
- [ ] Mobile responsiveness
- [ ] Visual regression testing

## 🏗️ Test Data Setup

### Required Test Users
Create these users in your test database:

```javascript
// Student user
{
  email: 'student@test.gamilit.com',
  password: 'TestStudent123!',
  role: 'student',
  displayName: 'Test Student'
}

// Teacher user
{
  email: 'teacher@test.gamilit.com',
  password: 'TestTeacher123!',
  role: 'teacher',
  displayName: 'Test Teacher'
}

// Admin user
{
  email: 'admin@test.gamilit.com',
  password: 'TestAdmin123!',
  role: 'admin',
  displayName: 'Test Admin'
}
```

### Environment Setup

1. **Backend API:** Running on `http://localhost:3006`
2. **Frontend:** Running on `http://localhost:3005`
3. **Database:** Test database with seeded data

### Fixtures and Helpers (IMPLEMENTED)

All test files now use centralized fixtures and helpers:

- **`fixtures/test-users.ts`** - Test user credentials and exercise IDs
- **`fixtures/auth-helpers.ts`** - Login/logout helper functions
- **`helpers/page-helpers.ts`** - Reusable page interaction functions

### Helper Functions Available:
- `loginAsStudent(page)` - Authenticate as student
- `loginAsTeacher(page)` - Authenticate as teacher
- `loginAsAdmin(page)` - Authenticate as admin
- `waitForPageLoad(page)` - Wait for complete page load
- `waitForToast(page)` - Wait for toast notifications
- `waitForModal(page)` - Wait for modal dialogs
- `waitForLoadingToFinish(page)` - Wait for spinners to disappear

## 🎨 Visual Regression Testing

Future enhancement: Add visual regression tests using Playwright's screenshot comparison:

```typescript
test('should match homepage screenshot', async ({ page }) => {
  await page.goto('/');
  await expect(page).toHaveScreenshot('homepage.png');
});
```

## 📈 CI/CD Integration

Tests are configured to run in CI with:
- Automatic retries (2 attempts)
- Screenshot on failure
- Video on failure
- HTML report generation

### GitHub Actions Example:
```yaml
- name: Run E2E tests
  run: npm run test:e2e
- name: Upload test results
  if: always()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## 🐛 Debugging Tips

### Test Failing? Try:
1. Run in headed mode: `npm run test:e2e:headed`
2. Run in debug mode: `npm run test:e2e:debug`
3. Check screenshot in `test-results/` directory
4. View video in `test-results/` directory
5. Check console errors in test output

### Common Issues:
- **Timeout errors:** Increase timeout or check if backend is running
- **Element not found:** Check if UI has changed
- **Authentication issues:** Verify test user credentials
- **Flaky tests:** Add explicit waits or check for race conditions

## 📚 Resources

- [Playwright Documentation](https://playwright.dev/)
- [Best Practices](https://playwright.dev/docs/best-practices)
- [Debugging Guide](https://playwright.dev/docs/debug)
- [Selectors Guide](https://playwright.dev/docs/selectors)

## 🎓 Writing New Tests

### Test Structure:
```typescript
import { test, expect } from '@playwright/test';

test.describe('Feature Name', () => {
  test.beforeEach(async ({ page }) => {
    // Setup before each test
    await page.goto('/feature');
  });

  test('should do something', async ({ page }) => {
    // Test implementation
    await page.click('button');
    await expect(page.locator('result')).toBeVisible();
  });
});
```

### Best Practices:
- Use data-testid attributes for stable selectors
- Write descriptive test names
- Keep tests independent
- Clean up test data
- Use Page Object Model for complex flows
- Avoid hard-coded waits (use Playwright's auto-waiting)

## ✅ Definition of Done for E2E Tests

A test is "Done" when:
- [ ] Test written and passing
- [ ] Test is not flaky (runs consistently)
- [ ] Test has meaningful assertions
- [ ] Test cleans up after itself
- [ ] Test is documented (comments if complex)
- [ ] Test runs in CI

## 📦 Test Structure

```
e2e/
├── fixtures/
│   ├── test-users.ts          # Test user credentials and data
│   └── auth-helpers.ts        # Authentication helper functions
├── helpers/
│   └── page-helpers.ts        # Reusable page interaction helpers
├── auth.spec.ts               # Authentication tests
├── navigation.spec.ts         # Navigation tests
├── student-journey.spec.ts    # Legacy student tests
├── student-exercise-m4.spec.ts   # M4 exercise flow tests (NEW)
├── teacher-flow.spec.ts       # Teacher workflow tests (NEW)
├── admin-flow.spec.ts         # Admin portal tests (NEW)
├── gamification-flow.spec.ts  # Gamification tests (NEW)
└── README.md                  # This file
```

## 🎯 Quick Start

1. **Start the application:**
```bash
# Terminal 1: Start backend
cd apps/backend
npm run dev

# Terminal 2: Start frontend
cd apps/frontend
npm run dev
```

2. **Seed test data:**
```bash
# Run database seeds to create test users and data
npm run db:seed:test
```

3. **Run tests:**
```bash
# Run all tests
npm run test:e2e

# Run specific flow
npx playwright test student-exercise-m4.spec.ts

# Run with UI (recommended for development)
npm run test:e2e:ui
```

---

**Last Updated:** December 5, 2025
**Test Framework:** Playwright v1.56+
**Coverage:** 8 test files, 60+ test cases
**Critical Flows Covered:** Student Exercises, Teacher Review, Admin Management, Gamification
