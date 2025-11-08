# END-TO-END TESTING STRATEGY

**Proyecto:** Gamilit Platform
**Módulo:** Testing Strategy - E2E Testing
**Fecha:** 01 de Noviembre, 2025
**Versión:** 1.0
**Estado:** Documento Técnico
**RFC:** RFC-0001 (Modularización de Documentación)

---

## Tabla de Contenidos

1. [Overview](#overview)
2. [Flujos Críticos](#flujos-críticos)
3. [Playwright Setup](#playwright-setup)
4. [E2E Test Examples](#e2e-test-examples)
5. [Page Object Model](#page-object-model)

---

## 1. Overview

### 1.1 Definición

End-to-End Testing simula **flujos de usuario completos** desde la interfaz, verificando la integración de frontend, backend, base de datos y servicios externos.

### 1.2 Distribución en la Pirámide de Testing

```
E2E Tests: 10% del total (~30 tests de 300)
- User Journeys: 7 flujos críticos
- Multiple scenarios per flow
```

### 1.3 Herramienta Recomendada

**Playwright** (sobre Cypress):
- Mejor soporte para múltiples navegadores
- Mejor performance
- Auto-waiting nativo
- Mejor soporte para WebSocket y real-time features

---

## 2. Flujos Críticos

### 2.1 Prioridad CRÍTICA (7 flujos)

**1. User Registration → Email Verification → Login**
- Estado: Parcialmente implementado (tests unitarios)
- Gap: Falta flujo completo E2E

**2. Student: Browse → Select Exercise → Solve → Submit → See Results**
- Estado: NO IMPLEMENTADO
- Prioridad: CRÍTICA
- Valor de negocio: Core functionality

**3. Student: Buy Power-up → Use in Exercise → See Effect**
- Estado: NO IMPLEMENTADO
- Prioridad: ALTA

**4. Student: Complete Module → Rank Up → Unlock New Content**
- Estado: NO IMPLEMENTADO
- Prioridad: CRÍTICA (Sistema de progresión)

**5. Teacher: Create Classroom → Invite Students → Assign Task**
- Estado: NO IMPLEMENTADO
- Prioridad: ALTA

**6. Teacher: Grade Submission → Give Feedback → Student Notified**
- Estado: NO IMPLEMENTADO
- Prioridad: MEDIA

**7. Admin: Moderate Content → Approve/Reject → Notify Creator**
- Estado: Parcialmente implementado (UserManagementPage.test.tsx)

---

## 3. Playwright Setup

### 3.1 Configuration

**playwright.config.ts (Crear este archivo):**

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
    // Mobile
    {
      name: 'Mobile Chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 12'] },
    },
  ],

  webServer: [
    {
      command: 'npm run dev',
      cwd: './projects/gamilit-platform-web',
      port: 5173,
      reuseExistingServer: !process.env.CI,
    },
    {
      command: 'npm run dev',
      cwd: './projects/gamilit-platform-backend',
      port: 3000,
      reuseExistingServer: !process.env.CI,
    },
  ],
});
```

### 3.2 Installation

```bash
# Install Playwright
npm install -D @playwright/test

# Install browsers
npx playwright install

# Install browser dependencies (Linux)
npx playwright install-deps
```

---

## 4. E2E Test Examples

### 4.1 Student Exercise Flow

```typescript
// e2e/student-exercise-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Student Exercise Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'student@test.com');
    await page.fill('[data-testid="password-input"]', 'Test1234');
    await page.click('[data-testid="login-button"]');

    // Wait for dashboard
    await expect(page).toHaveURL('/dashboard');
  });

  test('should complete crucigrama exercise and earn ML Coins', async ({ page }) => {
    // Navigate to exercises
    await page.click('[data-testid="exercises-link"]');
    await expect(page).toHaveURL(/\/exercises/);

    // Filter by type
    await page.selectOption('[data-testid="exercise-type-filter"]', 'crucigrama');

    // Select exercise
    await page.click('[data-testid="exercise-card-crucigrama-marie-curie"]');
    await expect(page).toHaveURL(/\/exercises\/crucigrama-marie-curie/);

    // Verify exercise loaded
    await expect(page.locator('h1')).toContainText('Elementos Químicos');
    await expect(page.locator('[data-testid="ml-coins-reward"]')).toContainText('20 ML Coins');

    // Start exercise
    await page.click('[data-testid="start-exercise-button"]');

    // Fill answers
    await page.fill('[data-testid="answer-1-across"]', 'RADIO');
    await page.fill('[data-testid="answer-2-down"]', 'POLONIO');
    await page.fill('[data-testid="answer-3-across"]', 'CURIE');

    // Submit
    await page.click('[data-testid="submit-button"]');

    // Wait for results
    await expect(page.locator('[data-testid="results-modal"]')).toBeVisible();

    // Verify score
    await expect(page.locator('[data-testid="score"]')).toContainText('100');
    await expect(page.locator('[data-testid="ml-coins-earned"]')).toContainText('20');

    // Verify confetti animation
    await expect(page.locator('[data-testid="confetti"]')).toBeVisible();

    // Go to dashboard
    await page.click('[data-testid="back-to-dashboard"]');
    await expect(page).toHaveURL('/dashboard');

    // Verify ML Coins updated
    const mlCoinsBalance = await page.locator('[data-testid="ml-coins-balance"]').textContent();
    expect(parseInt(mlCoinsBalance || '0')).toBeGreaterThanOrEqual(20);

    // Verify progress updated
    await expect(page.locator('[data-testid="exercises-completed"]')).not.toContainText('0');
  });

  test('should use power-up during exercise', async ({ page }) => {
    // Buy power-up first
    await page.click('[data-testid="store-link"]');
    await page.click('[data-testid="buy-hint-powerup"]');
    await page.click('[data-testid="confirm-purchase"]');

    // Go to exercise
    await page.click('[data-testid="exercises-link"]');
    await page.click('[data-testid="exercise-card-crucigrama-marie-curie"]');
    await page.click('[data-testid="start-exercise-button"]');

    // Use hint power-up
    await page.click('[data-testid="powerup-hint"]');

    // Verify hint revealed
    await expect(page.locator('[data-testid="hint-revealed"]')).toBeVisible();
    await expect(page.locator('[data-testid="hint-revealed"]')).toContainText('R');

    // Verify power-up count decreased
    await expect(page.locator('[data-testid="powerup-hint-count"]')).toContainText('0');
  });

  test('should show rank up notification after completing module', async ({ page }) => {
    // Complete all exercises in module (simulate by API)
    // ...

    // Complete final exercise
    await page.click('[data-testid="exercise-final"]');
    await page.click('[data-testid="start-exercise-button"]');
    // ... fill and submit

    // Verify rank up modal
    await expect(page.locator('[data-testid="rank-up-modal"]')).toBeVisible();
    await expect(page.locator('[data-testid="new-rank"]')).toContainText('Chaak');
    await expect(page.locator('[data-testid="rank-icon"]')).toBeVisible();

    // Close modal
    await page.click('[data-testid="close-rank-up-modal"]');

    // Verify rank updated in header
    await expect(page.locator('[data-testid="user-rank"]')).toContainText('Chaak');
  });
});
```

### 4.2 Authentication Flow

```typescript
// e2e/authentication-flow.spec.ts

import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should complete full registration and login flow', async ({ page }) => {
    // Go to registration
    await page.goto('http://localhost:5173/register');

    // Fill registration form
    await page.fill('[data-testid="email-input"]', 'newuser@test.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="confirm-password-input"]', 'SecurePass123!');
    await page.fill('[data-testid="fullname-input"]', 'New Test User');
    await page.selectOption('[data-testid="role-select"]', 'student');

    // Submit
    await page.click('[data-testid="register-button"]');

    // Should redirect to email verification page
    await expect(page).toHaveURL(/\/verify-email/);
    await expect(page.locator('h1')).toContainText('Verifica tu correo');

    // Simulate email verification (get token from test email service)
    // For now, use API to verify
    const response = await page.request.post('http://localhost:3000/api/auth/verify-email', {
      data: { email: 'newuser@test.com', token: 'test-verification-token' },
    });
    expect(response.ok()).toBeTruthy();

    // Login with verified account
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'newuser@test.com');
    await page.fill('[data-testid="password-input"]', 'SecurePass123!');
    await page.click('[data-testid="login-button"]');

    // Should be on dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('[data-testid="user-name"]')).toContainText('New Test User');
  });

  test('should handle invalid login credentials', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    await page.fill('[data-testid="email-input"]', 'wrong@test.com');
    await page.fill('[data-testid="password-input"]', 'WrongPassword');
    await page.click('[data-testid="login-button"]');

    // Should show error
    await expect(page.locator('[data-testid="error-message"]')).toContainText(
      'Credenciales inválidas'
    );
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'student@test.com');
    await page.fill('[data-testid="password-input"]', 'Test1234');
    await page.click('[data-testid="login-button"]');

    await expect(page).toHaveURL('/dashboard');

    // Logout
    await page.click('[data-testid="user-menu"]');
    await page.click('[data-testid="logout-button"]');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
```

### 4.3 Teacher Classroom Flow

```typescript
// e2e/teacher-classroom-flow.spec.ts

test.describe('Teacher Classroom Management', () => {
  test('should create classroom and invite students', async ({ page }) => {
    // Login as teacher
    await page.goto('http://localhost:5173/login');
    await page.fill('[data-testid="email-input"]', 'teacher@test.com');
    await page.fill('[data-testid="password-input"]', 'Test1234');
    await page.click('[data-testid="login-button"]');

    // Go to classrooms
    await page.click('[data-testid="classrooms-link"]');
    await expect(page).toHaveURL(/\/classrooms/);

    // Create new classroom
    await page.click('[data-testid="create-classroom-button"]');
    await page.fill('[data-testid="classroom-name-input"]', 'Historia de México 2025');
    await page.fill('[data-testid="classroom-description-input"]', 'Curso de historia');
    await page.click('[data-testid="submit-classroom"]');

    // Verify classroom created
    await expect(page.locator('[data-testid="classroom-card"]')).toContainText(
      'Historia de México 2025'
    );

    // Invite students
    await page.click('[data-testid="classroom-card"]');
    await page.click('[data-testid="invite-students-button"]');

    // Copy invite link
    await page.click('[data-testid="copy-invite-link"]');

    // Verify link copied (check clipboard or notification)
    await expect(page.locator('[data-testid="notification"]')).toContainText(
      'Link de invitación copiado'
    );
  });

  test('should assign task to classroom', async ({ page }) => {
    // Login and navigate to classroom
    // ... (similar to above)

    // Create task
    await page.click('[data-testid="create-task-button"]');
    await page.fill('[data-testid="task-title-input"]', 'Ejercicio sobre Marie Curie');
    await page.selectOption('[data-testid="exercise-select"]', 'crucigrama-marie-curie');
    await page.fill('[data-testid="due-date-input"]', '2025-12-31');
    await page.click('[data-testid="submit-task"]');

    // Verify task appears in classroom
    await expect(page.locator('[data-testid="task-item"]')).toContainText(
      'Ejercicio sobre Marie Curie'
    );
  });
});
```

---

## 5. Page Object Model

### 5.1 LoginPage

```typescript
// e2e/pages/LoginPage.ts

import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator('[data-testid="email-input"]');
    this.passwordInput = page.locator('[data-testid="password-input"]');
    this.loginButton = page.locator('[data-testid="login-button"]');
    this.rememberMeCheckbox = page.locator('[data-testid="remember-me"]');
    this.errorMessage = page.locator('[data-testid="error-message"]');
  }

  async goto() {
    await this.page.goto('/login');
  }

  async login(email: string, password: string, rememberMe = false) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);

    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    }

    await this.loginButton.click();
  }

  async getErrorMessage() {
    return await this.errorMessage.textContent();
  }
}

// Usage in test:
import { LoginPage } from './pages/LoginPage';

test('login with valid credentials', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.login('student@test.com', 'Test1234');

  await expect(page).toHaveURL('/dashboard');
});
```

### 5.2 ExercisePage

```typescript
// e2e/pages/ExercisePage.ts

export class ExercisePage {
  readonly page: Page;
  readonly exerciseTitle: Locator;
  readonly startButton: Locator;
  readonly submitButton: Locator;
  readonly resultsModal: Locator;
  readonly scoreDisplay: Locator;
  readonly mlCoinsEarned: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exerciseTitle = page.locator('h1');
    this.startButton = page.locator('[data-testid="start-exercise-button"]');
    this.submitButton = page.locator('[data-testid="submit-button"]');
    this.resultsModal = page.locator('[data-testid="results-modal"]');
    this.scoreDisplay = page.locator('[data-testid="score"]');
    this.mlCoinsEarned = page.locator('[data-testid="ml-coins-earned"]');
  }

  async startExercise() {
    await this.startButton.click();
  }

  async submitExercise() {
    await this.submitButton.click();
  }

  async fillAnswer(testId: string, answer: string) {
    await this.page.fill(`[data-testid="${testId}"]`, answer);
  }

  async getScore(): Promise<number> {
    const scoreText = await this.scoreDisplay.textContent();
    return parseInt(scoreText || '0');
  }

  async getMLCoinsEarned(): Promise<number> {
    const coinsText = await this.mlCoinsEarned.textContent();
    return parseInt(coinsText || '0');
  }
}
```

### 5.3 DashboardPage

```typescript
// e2e/pages/DashboardPage.ts

export class DashboardPage {
  readonly page: Page;
  readonly userName: Locator;
  readonly mlCoinsBalance: Locator;
  readonly userRank: Locator;
  readonly exercisesLink: Locator;
  readonly storeLink: Locator;
  readonly userMenu: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userName = page.locator('[data-testid="user-name"]');
    this.mlCoinsBalance = page.locator('[data-testid="ml-coins-balance"]');
    this.userRank = page.locator('[data-testid="user-rank"]');
    this.exercisesLink = page.locator('[data-testid="exercises-link"]');
    this.storeLink = page.locator('[data-testid="store-link"]');
    this.userMenu = page.locator('[data-testid="user-menu"]');
  }

  async goToExercises() {
    await this.exercisesLink.click();
  }

  async goToStore() {
    await this.storeLink.click();
  }

  async getMLCoinsBalance(): Promise<number> {
    const balanceText = await this.mlCoinsBalance.textContent();
    return parseInt(balanceText || '0');
  }

  async getUserRank(): Promise<string> {
    return (await this.userRank.textContent()) || '';
  }
}
```

---

## Referencias

- [Testing Strategy - Overview](./README.md)
- [Unit Testing](./unit-testing.md)
- [Integration Testing](./integration-testing.md)
- [Test Infrastructure](./test-infrastructure.md)

---

**Documento creado:** 01 de Noviembre, 2025
**Próxima revisión:** Cada sprint
**Owner:** QA Team + Engineering Team
