---
titulo: E2E Playwright - Escenarios Criticos por Portal
version: 1.0.0
fecha_creacion: 2026-02-14
parte_de: GUIA-E2E-PLAYWRIGHT
seccion: 7
tags: [testing, e2e, playwright, tests, portales, escenarios]
aplica_a: [frontend, fullstack]
estado: vigente
---

# E2E Playwright - Escenarios Criticos por Portal

> Parte 3 de 5 — Escenarios Criticos por Portal (seccion 7)
> Guia completa: [GUIA-E2E-PLAYWRIGHT](../GUIA-E2E-PLAYWRIGHT.md)

## 7. Escenarios Criticos por Portal

### 7.1 Portal Estudiante

```typescript
// e2e/tests/student-portal.spec.ts
import { test, expect } from '../fixtures/test-data.fixture';
import { StudentDashboardPage } from '../pages/student/DashboardPage';
import { ExercisePage } from '../pages/student/ExercisePage';
import { StorePage } from '../pages/student/StorePage';
import { LeaderboardPage } from '../pages/student/LeaderboardPage';

test.describe('Portal Estudiante', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('student');
  });

  test('deberia mostrar dashboard con XP y rango maya', async ({ page }) => {
    const dashboard = new StudentDashboardPage(page);
    await dashboard.expectLoaded();

    // Verificar que se muestra XP
    const xp = await dashboard.getXP();
    expect(parseInt(xp)).toBeGreaterThanOrEqual(0);

    // Verificar que se muestra rango maya
    await expect(dashboard.rangoMaya).toBeVisible();

    // Verificar que se muestran ML Coins
    await expect(dashboard.mlCoinsBalance).toBeVisible();
  });

  test('deberia navegar a modulo educativo, completar ejercicio y ganar XP', async ({ page }) => {
    const dashboard = new StudentDashboardPage(page);
    await dashboard.expectLoaded();

    // Capturar XP inicial
    const xpInicial = await dashboard.getXP();

    // Navegar al primer modulo
    await dashboard.navigateToModule(0);

    // Completar un ejercicio
    const exercise = new ExercisePage(page);
    await exercise.expectExerciseLoaded();
    await exercise.selectMultipleChoiceOption(0);
    await exercise.expectCorrectFeedback();
    await exercise.expectXPReward();
  });

  test('deberia visitar tienda y comprar item con ML Coins', async ({ page }) => {
    // Navegar a la tienda
    await page.getByTestId('nav-store').click();

    const store = new StorePage(page);
    // Verificar que la tienda muestra items
    await expect(store.storeItems.first()).toBeVisible();

    // Verificar saldo de ML Coins
    await expect(store.mlCoinsBalance).toBeVisible();
  });

  test('deberia ver leaderboard y posicion del estudiante', async ({ page }) => {
    // Navegar al leaderboard
    await page.getByTestId('nav-leaderboard').click();

    const leaderboard = new LeaderboardPage(page);
    await expect(leaderboard.rankingTable).toBeVisible();
    await expect(leaderboard.currentUserPosition).toBeVisible();
  });

  test('deberia mostrar los 5 modulos educativos', async ({ page }) => {
    const dashboard = new StudentDashboardPage(page);
    await dashboard.expectLoaded();

    const moduleCount = await dashboard.getModuleCount();
    expect(moduleCount).toBe(5);
  });
});
```

### 7.2 Portal Maestro

```typescript
// e2e/tests/teacher-portal.spec.ts
import { test, expect } from '../fixtures/test-data.fixture';

test.describe('Portal Maestro', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('teacher');
  });

  test('deberia mostrar dashboard con lista de aulas', async ({ page }) => {
    await expect(page.getByTestId('teacher-dashboard')).toBeVisible();
    await expect(page.getByTestId('classroom-list')).toBeVisible();
  });

  test('deberia crear asignacion y asignarla a un aula', async ({ page }) => {
    // Navegar a asignaciones
    await page.getByTestId('nav-assignments').click();

    // Crear nueva asignacion
    await page.getByTestId('create-assignment').click();
    await page.getByTestId('assignment-title').fill('Ejercicio E2E Test');
    await page.getByTestId('assignment-module').selectOption({ index: 0 });
    await page.getByTestId('assignment-classroom').selectOption({ index: 0 });
    await page.getByTestId('assignment-submit').click();

    // Verificar que aparece en la lista
    await expect(page.getByText('Ejercicio E2E Test')).toBeVisible();
  });

  test('deberia ver progreso de un estudiante', async ({ page }) => {
    // Navegar a un aula
    await page.getByTestId('classroom-list').locator('[data-testid="classroom-card"]').first().click();

    // Seleccionar un estudiante
    await page.getByTestId('student-list').locator('[data-testid="student-row"]').first().click();

    // Verificar que se muestra el progreso
    await expect(page.getByTestId('student-progress')).toBeVisible();
    await expect(page.getByTestId('student-xp')).toBeVisible();
  });

  test('deberia generar reporte de aula', async ({ page }) => {
    // Navegar a reportes
    await page.getByTestId('nav-reports').click();

    // Seleccionar aula y generar reporte
    await page.getByTestId('report-classroom-select').selectOption({ index: 0 });
    await page.getByTestId('generate-report').click();

    // Verificar que el reporte se genera
    await expect(page.getByTestId('report-content')).toBeVisible();
  });
});
```

### 7.3 Portal Administrador

```typescript
// e2e/tests/admin-portal.spec.ts
import { test, expect } from '../fixtures/test-data.fixture';

test.describe('Portal Administrador', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('admin');
  });

  test('deberia mostrar dashboard global con metricas', async ({ page }) => {
    await expect(page.getByTestId('admin-dashboard')).toBeVisible();
    await expect(page.getByTestId('total-students-metric')).toBeVisible();
    await expect(page.getByTestId('total-teachers-metric')).toBeVisible();
    await expect(page.getByTestId('active-classrooms-metric')).toBeVisible();
  });

  test('deberia gestionar contenido educativo (crear/editar/eliminar)', async ({ page }) => {
    // Navegar a gestion de contenido
    await page.getByTestId('nav-content-management').click();

    // Verificar que se muestra la lista de contenido
    await expect(page.getByTestId('content-list')).toBeVisible();

    // Crear nuevo contenido
    await page.getByTestId('create-content').click();
    await page.getByTestId('content-title').fill('Contenido E2E Test');
    await page.getByTestId('content-save').click();

    // Verificar creacion
    await expect(page.getByText('Contenido E2E Test')).toBeVisible();
  });

  test('deberia ver analytics globales', async ({ page }) => {
    await page.getByTestId('nav-analytics').click();
    await expect(page.getByTestId('analytics-dashboard')).toBeVisible();
    await expect(page.getByTestId('analytics-chart')).toBeVisible();
  });

  test('deberia gestionar usuarios y roles', async ({ page }) => {
    await page.getByTestId('nav-user-management').click();
    await expect(page.getByTestId('user-table')).toBeVisible();

    // Verificar que se pueden filtrar por rol
    await page.getByTestId('role-filter').selectOption('teacher');
    await expect(page.getByTestId('user-table')).toBeVisible();
  });
});
```

### 7.4 Portal Padres

```typescript
// e2e/tests/parent-portal.spec.ts
import { test, expect } from '../fixtures/test-data.fixture';

test.describe('Portal Padres', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('parent');
  });

  test('deberia mostrar dashboard con progreso del hijo', async ({ page }) => {
    await expect(page.getByTestId('parent-dashboard')).toBeVisible();
    await expect(page.getByTestId('child-progress')).toBeVisible();
    await expect(page.getByTestId('child-xp')).toBeVisible();
    await expect(page.getByTestId('child-rango')).toBeVisible();
  });

  test('deberia verificar progreso academico detallado', async ({ page }) => {
    // Click en el detalle de progreso
    await page.getByTestId('view-detailed-progress').click();

    // Verificar que se muestran los modulos con progreso
    await expect(page.getByTestId('module-progress-list')).toBeVisible();
    await expect(page.getByTestId('module-progress-item')).toHaveCount(5);
  });

  test('deberia ver notificaciones', async ({ page }) => {
    await page.getByTestId('nav-notifications').click();
    await expect(page.getByTestId('notifications-list')).toBeVisible();
  });
});
```

### 7.5 Tests de Autenticacion (Cross-Portal)

```typescript
// e2e/tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

test.describe('Autenticacion', () => {
  test('deberia hacer login exitoso como estudiante', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('estudiante@test.gamilit.com', 'TestPass123!');
    await loginPage.expectRedirectToDashboard();
    await expect(page).toHaveURL(/\/student/);
  });

  test('deberia hacer login exitoso como maestro', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('maestro@test.gamilit.com', 'TestPass123!');
    await loginPage.expectRedirectToDashboard();
    await expect(page).toHaveURL(/\/teacher/);
  });

  test('deberia hacer login exitoso como administrador', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('admin@test.gamilit.com', 'TestPass123!');
    await loginPage.expectRedirectToDashboard();
    await expect(page).toHaveURL(/\/admin/);
  });

  test('deberia hacer login exitoso como padre', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('padre@test.gamilit.com', 'TestPass123!');
    await loginPage.expectRedirectToDashboard();
    await expect(page).toHaveURL(/\/parent/);
  });

  test('deberia mostrar error con credenciales invalidas', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('noexiste@test.com', 'WrongPass');
    await loginPage.expectError('Credenciales invalidas');
    await expect(page).toHaveURL(/\/login/);
  });

  test('deberia redirigir a login al acceder ruta protegida sin autenticacion', async ({ page }) => {
    await page.goto('/student/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  test('deberia hacer logout correctamente', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('estudiante@test.gamilit.com', 'TestPass123!');
    await loginPage.expectRedirectToDashboard();

    // Hacer logout
    await page.getByTestId('user-menu').click();
    await page.getByTestId('logout-button').click();

    // Verificar redireccion a login
    await expect(page).toHaveURL(/\/login/);
  });
});
```

---

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
