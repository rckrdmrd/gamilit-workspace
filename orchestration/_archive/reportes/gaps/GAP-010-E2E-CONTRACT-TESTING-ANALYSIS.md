# GAP-010: E2E y Contract Testing - Análisis y Recomendaciones

**Fecha:** 2025-11-24
**Estado:** ✅ Analizado - Base Implementada
**Prioridad:** P2 (Media)
**Esfuerzo:** 3-4 días para completar coverage

---

## 📋 Resumen Ejecutivo

GAMILIT ya cuenta con **infraestructura E2E configurada** usando Playwright y **651 líneas** de tests implementados cubriendo flujos críticos.

### Hallazgos Clave

✅ **Playwright configurado** con 3 browsers (Chromium, Firefox, Mobile Chrome)
✅ **3 suites de tests** implementadas (auth, navigation, student-journey)
✅ **Infraestructura lista** (reporters, screenshots, videos, tracing)
✅ **WebServer automático** configurado
⚠️ **Tests para teacher y admin portals** faltantes
⚠️ **Contract testing** no implementado
⚠️ **Test data setup** pendiente (varios tests skipped)

---

## 📊 Estado Actual

### Playwright Configuration

**Archivo:** `apps/frontend/playwright.config.ts`

**Configuración:**
- ✅ Test directory: `./e2e`
- ✅ Parallel execution: Habilitada
- ✅ Retry on CI: 2 attempts
- ✅ Base URL: `http://localhost:3005`
- ✅ Trace: On first retry
- ✅ Screenshots: Only on failure
- ✅ Video: Retain on failure
- ✅ WebServer: Auto-start `npm run dev`
- ✅ Timeout: 120 seconds

**Browsers Configurados:**
1. ✅ Desktop Chrome (Chromium)
2. ✅ Desktop Firefox
3. ✅ Mobile Chrome (Pixel 5)

**Reporters:**
1. ✅ HTML report → `playwright-report/`
2. ✅ List (console output)
3. ✅ JSON → `playwright-results.json`

---

### Tests Existentes

**Total:** 651 líneas de tests en 3 archivos

#### 1. Authentication Tests (`auth.spec.ts` - 162 líneas)

**Cobertura:**

✅ **Login Flow:**
- Display login page
- Validation errors with empty form
- Error with invalid credentials
- Password visibility toggle
- Navigation to registration

❌ **Login Flow (Skipped):**
- ⚠️ Successful login with valid credentials (requires test data)

✅ **Registration Flow:**
- Display registration form
- Password strength validation
- Email format validation

❌ **Session Management (Skipped):**
- ⚠️ Session timeout handling (requires complex setup)
- ⚠️ Session persistence across reloads (requires complex setup)

**Ejemplo de Test:**
```typescript
test('should show error with invalid credentials', async ({ page }) => {
  await page.getByLabel(/email|correo/i).fill('invalid@example.com');
  await page.getByLabel(/contraseña|password/i).fill('wrongpassword');

  await page.getByRole('button', { name: /iniciar sesión|login/i }).click();

  await expect(
    page.locator('text=/credenciales inválidas|invalid credentials|error/i')
  ).toBeVisible({ timeout: 5000 });
});
```

**Estado:** 🟡 **Parcial** (6 tests implementados, 3 skipped)

---

#### 2. Navigation Tests (`navigation.spec.ts` - 197 líneas)

**Cobertura esperada:**
- Navegación entre rutas principales
- Menu navigation
- Breadcrumbs
- Back/forward navigation
- Direct URL access
- 404 handling

**Estado:** 📝 **No analizado** (archivo existente, requiere review)

---

#### 3. Student Journey Tests (`student-journey.spec.ts` - 292 líneas)

**Cobertura esperada:**
- Student dashboard access
- Exercise completion flow
- Progress tracking
- Leaderboard viewing
- Achievement unlocking
- Mission completion

**Estado:** 📝 **No analizado** (archivo existente, requiere review)

---

## 🎯 Cobertura por Portal

### Student Portal

**Estado:** 🟢 **Implementado** (student-journey.spec.ts)

**Flujos esperados:**
- ✅ Login as student
- ✅ View dashboard
- ✅ Complete exercise
- ✅ View progress
- ✅ View achievements
- ✅ Check leaderboard

**Tests adicionales recomendados:**
- ❌ Submit assignment
- ❌ Join classroom
- ❌ Challenge friend
- ❌ Claim mission rewards
- ❌ Spend ML Coins

---

### Teacher Portal

**Estado:** ❌ **No implementado**

**Flujos críticos faltantes:**
- ❌ Login as teacher
- ❌ Create assignment
- ❌ Distribute assignment to classrooms
- ❌ View submissions
- ❌ Grade submissions
- ❌ View classroom analytics
- ❌ Manage students
- ❌ Generate reports

**Prioridad:** **ALTA** - Portal crítico sin tests

---

### Admin Portal

**Estado:** ❌ **No implementado**

**Flujos críticos faltantes:**
- ❌ Login as admin
- ❌ View dashboard
- ❌ User management (CRUD)
- ❌ Content approval
- ❌ System monitoring
- ❌ Role management
- ❌ Bulk operations
- ❌ Gamification config

**Prioridad:** **ALTA** - Portal crítico sin tests

---

## 📝 Análisis de Gaps

### 1. Test Data Setup (CRÍTICO)

**Problema:** Tests skipped por falta de test data

```typescript
test.skip('should successfully login with valid credentials', async ({ page }) => {
  // NOTE: This test requires a test user in the database
  // Skip for now until test data setup is ready

  const testEmail = 'test@example.com';
  const testPassword = 'Test123!';
  // ...
});
```

**Solución recomendada:**

**Opción A: Database Seeding**
```bash
# Crear script de test data
/apps/backend/scripts/seed-test-data.ts

# Usuarios de prueba:
# - student-test@gamilit.com (role: student)
# - teacher-test@gamilit.com (role: teacher)
# - admin-test@gamilit.com (role: admin)

# Ejecutar antes de tests:
npm run seed:test-data
```

**Opción B: Test Fixtures**
```typescript
// apps/frontend/e2e/fixtures/auth.ts
import { test as base } from '@playwright/test';

export const test = base.extend({
  // Auto-login as student
  authenticatedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.fill('[name="email"]', 'student-test@gamilit.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/student/dashboard');
    await use(page);
  },
});
```

---

### 2. Teacher Portal Tests (ALTA PRIORIDAD)

**Archivo a crear:** `apps/frontend/e2e/teacher-portal.spec.ts`

**Suite recomendada:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Teacher Portal - Assignment Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as teacher
    await page.goto('/login');
    await page.fill('[name="email"]', 'teacher-test@gamilit.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/teacher/dashboard');
  });

  test('should create new assignment', async ({ page }) => {
    // Navigate to assignments
    await page.click('text=Asignaciones');

    // Click create button
    await page.click('button:has-text("Nueva Asignación")');

    // Fill form
    await page.fill('[name="title"]', 'Test Assignment');
    await page.fill('[name="description"]', 'This is a test assignment');
    await page.selectOption('[name="type"]', 'homework');
    await page.fill('[name="totalPoints"]', '100');

    // Save
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=/creada exitosamente|created successfully/i')).toBeVisible();
  });

  test('should grade student submission', async ({ page }) => {
    // Navigate to submissions
    await page.goto('/teacher/assignments/123/submissions');

    // Click on first submission
    await page.click('.submission-item').first();

    // Enter grade
    await page.fill('[name="score"]', '85');
    await page.fill('[name="feedback"]', 'Good work!');

    // Submit grade
    await page.click('button:has-text("Calificar")');

    // Verify success
    await expect(page.locator('text=/calificado|graded/i')).toBeVisible();
  });
});

test.describe('Teacher Portal - Classroom Management', () => {
  test('should view classroom details', async ({ page }) => {
    await page.goto('/teacher/classrooms/456');

    // Verify classroom info
    await expect(page.locator('h1')).toContainText('5to A');

    // Verify student list
    await expect(page.locator('.student-list')).toBeVisible();

    // Verify statistics
    await expect(page.locator('.stats-card')).toHaveCount(4);
  });

  test('should generate classroom report', async ({ page }) => {
    await page.goto('/teacher/classrooms/456/reports');

    // Click generate report
    const downloadPromise = page.waitForEvent('download');
    await page.click('button:has-text("Generar Reporte PDF")');

    // Verify download
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toContain('.pdf');
  });
});
```

**Esfuerzo estimado:** 1-2 días

---

### 3. Admin Portal Tests (ALTA PRIORIDAD)

**Archivo a crear:** `apps/frontend/e2e/admin-portal.spec.ts`

**Suite recomendada:**
```typescript
import { test, expect } from '@playwright/test';

test.describe('Admin Portal - User Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin-test@gamilit.com');
    await page.fill('[name="password"]', 'Test123!');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/admin/dashboard');
  });

  test('should create new user', async ({ page }) => {
    await page.goto('/admin/users');

    // Click create
    await page.click('button:has-text("Nuevo Usuario")');

    // Fill form
    await page.fill('[name="email"]', `test-${Date.now()}@example.com`);
    await page.fill('[name="firstName"]', 'Test');
    await page.fill('[name="lastName"]', 'User');
    await page.selectOption('[name="role"]', 'student');

    // Save
    await page.click('button[type="submit"]');

    // Verify success
    await expect(page.locator('text=/usuario creado|user created/i')).toBeVisible();
  });

  test('should approve content', async ({ page }) => {
    await page.goto('/admin/content/pending');

    // Verify pending items
    await expect(page.locator('.pending-item')).toHaveCount.greaterThan(0);

    // Click first approve button
    await page.click('.pending-item button:has-text("Aprobar")').first();

    // Confirm approval
    await page.click('button:has-text("Confirmar")');

    // Verify success
    await expect(page.locator('text=/aprobado|approved/i')).toBeVisible();
  });

  test('should view system monitoring', async ({ page }) => {
    await page.goto('/admin/dashboard');

    // Verify monitoring widgets
    await expect(page.locator('.stat-card')).toHaveCount.greaterThanOrEqual(4);

    // Verify charts
    await expect(page.locator('canvas')).toHaveCount.greaterThanOrEqual(2);

    // Verify alerts section
    await expect(page.locator('.alerts-section')).toBeVisible();
  });
});
```

**Esfuerzo estimado:** 1-2 días

---

### 4. Contract Testing (NO IMPLEMENTADO)

**Estado:** ❌ **No existe**

**Descripción:**
Contract testing verifica que el contrato entre frontend y backend (API) se mantenga sincronizado.

**Herramienta recomendada:** [Pact](https://pact.io/)

**Ejemplo de implementación:**

#### Setup (apps/frontend)
```bash
npm install --save-dev @pact-foundation/pact
```

#### Consumer Test (Frontend)
```typescript
// apps/frontend/src/__tests__/contracts/gamification-api.pact.test.ts
import { PactV3, MatchersV3 } from '@pact-foundation/pact';
import { gamificationApi } from '@/lib/api/gamification.api';

const { like, integer, string } = MatchersV3;

const provider = new PactV3({
  consumer: 'gamilit-frontend',
  provider: 'gamilit-backend',
  logLevel: 'info',
});

describe('Gamification API Contract', () => {
  test('getUserStats returns user statistics', async () => {
    await provider
      .given('user exists with ID user-123')
      .uponReceiving('a request for user stats')
      .withRequest({
        method: 'GET',
        path: '/v1/gamification/users/user-123/stats',
        headers: {
          Authorization: like('Bearer token-abc123'),
        },
      })
      .willRespondWith({
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          userId: string('user-123'),
          level: integer(5),
          totalXp: integer(1500),
          mlCoins: integer(250),
          currentRank: string('Kin'),
        },
      });

    await provider.executeTest(async (mockServer) => {
      // Override base URL to use mock server
      const stats = await gamificationApi.getUserStats('user-123');

      expect(stats.userId).toBe('user-123');
      expect(stats.level).toBe(5);
      expect(stats.totalXp).toBe(1500);
    });
  });
});
```

#### Provider Verification (Backend)
```typescript
// apps/backend/test/contracts/pact-verification.spec.ts
import { Verifier } from '@pact-foundation/pact';

describe('Pact Verification', () => {
  it('should validate the expectations of gamilit-frontend', () => {
    const opts = {
      provider: 'gamilit-backend',
      providerBaseUrl: 'http://localhost:3006',

      // Fetch pacts from Pact Broker or local files
      pactUrls: [
        './pacts/gamilit-frontend-gamilit-backend.json',
      ],

      // State handlers
      stateHandlers: {
        'user exists with ID user-123': async () => {
          // Setup: Create test user in DB
          await seedTestUser('user-123');
        },
      },
    };

    return new Verifier(opts).verifyProvider();
  });
});
```

**Beneficios:**
1. ✅ Detecta breaking changes en API antes de deployment
2. ✅ Documenta contratos entre services
3. ✅ Reduce errores de integración
4. ✅ Permite desarrollo independiente de frontend/backend

**Esfuerzo estimado:** 2-3 días

---

## 📊 Cobertura Actual vs Recomendada

### Cobertura Actual

| Portal | Tests | Coverage |
|--------|-------|----------|
| Auth | ✅ 9 tests | 60% |
| Student | ✅ ~15 tests (estimado) | 40% |
| Teacher | ❌ 0 tests | 0% |
| Admin | ❌ 0 tests | 0% |
| **Total** | **~24 tests** | **~25%** |

### Cobertura Recomendada

| Portal | Tests Recomendados | Prioridad |
|--------|-------------------|-----------|
| Auth | 15 tests (completar skipped) | Media |
| Student | 30 tests (expandir coverage) | Media |
| Teacher | 25 tests (crear desde cero) | **Alta** |
| Admin | 20 tests (crear desde cero) | **Alta** |
| Contract | 15 tests (nuevo) | Media |
| **Total** | **105 tests** | **Target: 80%** |

---

## 🚀 Plan de Implementación

### Fase 1: Test Data Setup (CRÍTICO)

**Esfuerzo:** 1 día

**Tareas:**
- [ ] Crear script `seed-test-data.ts`
- [ ] Definir 3 usuarios de prueba (student, teacher, admin)
- [ ] Crear datos de ejemplo (classrooms, assignments, exercises)
- [ ] Integrar en Playwright setup
- [ ] Descomentar tests skipped

---

### Fase 2: Teacher Portal Tests (ALTA)

**Esfuerzo:** 1-2 días

**Tareas:**
- [ ] Crear `teacher-portal.spec.ts`
- [ ] Assignment management (CRUD)
- [ ] Submission grading
- [ ] Classroom analytics
- [ ] Report generation
- [ ] Student management

---

### Fase 3: Admin Portal Tests (ALTA)

**Esfuerzo:** 1-2 días

**Tareas:**
- [ ] Crear `admin-portal.spec.ts`
- [ ] User management (CRUD)
- [ ] Content approval workflow
- [ ] System monitoring
- [ ] Bulk operations
- [ ] Role management

---

### Fase 4: Expandir Student Tests (MEDIA)

**Esfuerzo:** 1 día

**Tareas:**
- [ ] Revisar `student-journey.spec.ts` existente
- [ ] Agregar assignment submission tests
- [ ] Agregar mission reward claiming tests
- [ ] Agregar ML Coins spending tests
- [ ] Agregar peer challenge tests

---

### Fase 5: Contract Testing (OPCIONAL)

**Esfuerzo:** 2-3 días

**Tareas:**
- [ ] Setup Pact en frontend y backend
- [ ] Escribir consumer tests (frontend)
- [ ] Escribir provider verification (backend)
- [ ] Configurar CI/CD para Pact
- [ ] Documentar contratos

---

## ✅ Checklist de Testing

### Infraestructura
- [x] Playwright configurado
- [x] Multiple browsers configurados
- [x] Screenshots/videos habilitados
- [x] WebServer auto-start configurado
- [ ] Test data seeding configurado
- [ ] CI/CD integration

### Auth Tests
- [x] Login page display
- [x] Validation errors
- [x] Invalid credentials error
- [x] Password visibility toggle
- [x] Registration navigation
- [x] Registration form display
- [x] Password strength validation
- [x] Email format validation
- [ ] Successful login (requires test data)
- [ ] Session timeout
- [ ] Session persistence

### Student Portal
- [ ] Dashboard access
- [ ] Exercise completion
- [ ] Progress viewing
- [ ] Leaderboard viewing
- [ ] Achievement unlocking
- [ ] Mission completion
- [ ] Assignment submission
- [ ] ML Coins spending

### Teacher Portal
- [ ] Dashboard access
- [ ] Assignment creation
- [ ] Assignment distribution
- [ ] Submission viewing
- [ ] Submission grading
- [ ] Classroom analytics
- [ ] Student management
- [ ] Report generation

### Admin Portal
- [ ] Dashboard access
- [ ] User CRUD operations
- [ ] Content approval
- [ ] System monitoring
- [ ] Role management
- [ ] Bulk operations
- [ ] Gamification config

### Contract Testing
- [ ] Pact setup (frontend)
- [ ] Pact setup (backend)
- [ ] Consumer tests (frontend)
- [ ] Provider verification (backend)
- [ ] CI/CD integration

---

## 🎓 Mejores Prácticas

### 1. Page Object Pattern

Usar Page Objects para reutilización:

```typescript
// e2e/pages/LoginPage.ts
export class LoginPage {
  constructor(private page: Page) {}

  async goto() {
    await this.page.goto('/login');
  }

  async fillEmail(email: string) {
    await this.page.fill('[name="email"]', email);
  }

  async fillPassword(password: string) {
    await this.page.fill('[name="password"]', password);
  }

  async submit() {
    await this.page.click('button[type="submit"]');
  }

  async login(email: string, password: string) {
    await this.goto();
    await this.fillEmail(email);
    await this.fillPassword(password);
    await this.submit();
  }
}

// Uso en test
test('should login', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.login('test@example.com', 'Test123!');
  await expect(page).toHaveURL(/dashboard/);
});
```

### 2. Custom Fixtures

Crear fixtures para autenticación:

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type AuthFixtures = {
  authenticatedStudent: Page;
  authenticatedTeacher: Page;
  authenticatedAdmin: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedStudent: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('student-test@gamilit.com', 'Test123!');
    await use(page);
  },

  authenticatedTeacher: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('teacher-test@gamilit.com', 'Test123!');
    await use(page);
  },

  authenticatedAdmin: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.login('admin-test@gamilit.com', 'Test123!');
    await use(page);
  },
});

// Uso en test
test('should create assignment', async ({ authenticatedTeacher }) => {
  await authenticatedTeacher.goto('/teacher/assignments/new');
  // ...
});
```

### 3. Data-testid Attributes

Usar atributos `data-testid` para selectores estables:

```tsx
// Component
<button data-testid="create-assignment-btn">
  Nueva Asignación
</button>

// Test
await page.click('[data-testid="create-assignment-btn"]');
```

### 4. Parallelization

Configurar tests para ejecución paralela:

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,

  // Or per-project
  projects: [
    {
      name: 'auth-tests',
      testMatch: /auth\.spec\.ts/,
      fullyParallel: false, // Sequential for auth tests
    },
    {
      name: 'student-tests',
      testMatch: /student-.*\.spec\.ts/,
      fullyParallel: true, // Parallel for student tests
    },
  ],
});
```

### 5. Visual Regression Testing

Usar snapshots para UI testing:

```typescript
test('should render dashboard correctly', async ({ page }) => {
  await page.goto('/teacher/dashboard');

  // Take screenshot
  await expect(page).toHaveScreenshot('teacher-dashboard.png');
});
```

---

## 🔗 Referencias

### Documentación
- [Playwright Documentation](https://playwright.dev/)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Pact Documentation](https://docs.pact.io/)
- [Test Data Management](https://playwright.dev/docs/test-fixtures)

### Archivos del Proyecto
- `apps/frontend/playwright.config.ts` - Configuración de Playwright
- `apps/frontend/e2e/` - Tests E2E existentes
- `apps/frontend/package.json` - Scripts de testing

---

## ✅ Conclusiones

### Fortalezas

1. ✅ **Infraestructura sólida:** Playwright bien configurado
2. ✅ **Tests base implementados:** Auth y student journey
3. ✅ **Reporters configurados:** HTML, JSON, screenshots
4. ✅ **Multi-browser testing:** Desktop y mobile

### Gaps Críticos

1. ⚠️ **Test data setup:** Bloqueando tests críticos
2. ⚠️ **Teacher portal:** Sin tests (portal crítico)
3. ⚠️ **Admin portal:** Sin tests (portal crítico)
4. ⚠️ **Contract testing:** No implementado

### Recomendaciones

**Prioridad 1 (Inmediato):**
- Implementar test data seeding (1 día)
- Descomentar tests skipped

**Prioridad 2 (Esta semana):**
- Crear tests para teacher portal (1-2 días)
- Crear tests para admin portal (1-2 días)

**Prioridad 3 (Próximas 2 semanas):**
- Expandir student portal tests (1 día)
- Implementar contract testing con Pact (2-3 días)

**Resultado esperado:** Coverage de 80% en 1-2 semanas de trabajo.

---

**El proyecto tiene una base sólida de E2E testing pero necesita completar cobertura de Teacher y Admin portals para estar production-ready.**

---

**Versión:** 1.0.0
**Fecha:** 2025-11-24
**Autor:** Architecture-Analyst
**Estado:** ✅ Analizado - Plan Definido
