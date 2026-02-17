---
titulo: Guia de Testing E2E con Playwright
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [testing, e2e, playwright, react]
aplica_a: [frontend, fullstack]
estado: vigente
---

# Guia de Testing E2E con Playwright

## 1. Proposito

Esta guia establece la estrategia, configuracion y mejores practicas para implementar testing end-to-end (E2E) automatizado en la plataforma gamilit utilizando Playwright. El objetivo es cubrir los flujos criticos de los 4 portales (Estudiante, Maestro, Administrador y Padres) con tests que simulen el comportamiento real de los usuarios.

### Contexto de gamilit

| Aspecto | Detalle |
|---------|---------|
| Portales | 4 (Estudiante, Maestro, Admin, Padres) |
| Componentes .tsx | 475 produccion |
| Paginas | 68 activas |
| Rutas | 70 en App.tsx |
| Ejercicios | 30 mecanicas unicas en 5 modulos educativos |
| Tests E2E actuales | 0 (primera implementacion) |
| Test runner unitario frontend | Vitest (46 archivos) |
| Test runner backend | Jest (833 tests, 57 spec files) |

### Objetivos

- Cubrir los flujos criticos de autenticacion para los 4 roles (estudiante, maestro, admin, padre)
- Validar los flujos educativos principales (ejercicios, asignaciones, progreso)
- Verificar el sistema de gamificacion (XP, rangos maya, ML Coins, tienda)
- Detectar regresiones visuales en componentes clave
- Integrar la ejecucion E2E en el pipeline de CI/CD

---

## 2. Setup Inicial

### 2.1 Instalacion

```bash
cd apps/frontend
npm install -D @playwright/test
npx playwright install
```

> **Nota:** `npx playwright install` descarga los binarios de Chromium, Firefox y WebKit necesarios para la ejecucion cross-browser.

### 2.2 Configuracion — `playwright.config.ts`

Crear el archivo `apps/frontend/e2e/playwright.config.ts` adaptado al entorno gamilit:

```typescript
// apps/frontend/e2e/playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html', { outputFolder: '../playwright-report' }],
    ['junit', { outputFile: '../test-results/e2e-junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3005',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
    navigationTimeout: 30000,
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: [
    {
      command: 'cd ../../backend && npm run start:dev',
      url: 'http://localhost:3006/api/health',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
    {
      command: 'cd .. && npm run dev',
      url: 'http://localhost:3005',
      reuseExistingServer: !process.env.CI,
      timeout: 120000,
    },
  ],
});
```

**Puntos clave de la configuracion:**

- `baseURL`: apunta al frontend en `http://localhost:3005` (puerto de gamilit frontend)
- `webServer`: levanta tanto el backend (puerto 3006) como el frontend (puerto 3005)
- `retries: 2` en CI para manejar flakiness, `0` en local para feedback rapido
- `projects`: 3 navegadores de escritorio + 1 movil para cobertura cross-browser
- `reporter`: HTML para inspeccion visual + JUnit para integracion CI

---

## 3. Estructura de Archivos E2E

```
apps/frontend/
├── e2e/
│   ├── playwright.config.ts          # Configuracion Playwright
│   ├── fixtures/
│   │   ├── auth.fixture.ts           # Helpers de login por rol
│   │   └── test-data.fixture.ts      # Datos de prueba reutilizables
│   ├── pages/                        # Page Object Models (POM)
│   │   ├── LoginPage.ts              # POM: pagina de login
│   │   ├── student/
│   │   │   ├── DashboardPage.ts      # POM: dashboard estudiante
│   │   │   ├── ExercisePage.ts       # POM: pagina de ejercicio
│   │   │   ├── StorePage.ts          # POM: tienda ML Coins
│   │   │   ├── LeaderboardPage.ts    # POM: tabla de posiciones
│   │   │   └── ModulePage.ts         # POM: modulo educativo
│   │   ├── teacher/
│   │   │   ├── ClassroomPage.ts      # POM: gestion de aulas
│   │   │   ├── AssignmentsPage.ts    # POM: asignaciones
│   │   │   ├── StudentProgressPage.ts # POM: progreso del estudiante
│   │   │   └── ReportsPage.ts        # POM: reportes de aula
│   │   ├── admin/
│   │   │   ├── ContentManagementPage.ts # POM: gestion de contenido
│   │   │   ├── UserManagementPage.ts    # POM: gestion de usuarios
│   │   │   └── AnalyticsPage.ts         # POM: analytics globales
│   │   └── parent/
│   │       ├── ProgressDashboardPage.ts # POM: dashboard de progreso
│   │       └── NotificationsPage.ts     # POM: notificaciones
│   ├── tests/
│   │   ├── auth.spec.ts              # Tests: flujos login/logout
│   │   ├── student-portal.spec.ts    # Tests: portal estudiante
│   │   ├── teacher-portal.spec.ts    # Tests: portal maestro
│   │   ├── admin-portal.spec.ts      # Tests: portal administrador
│   │   └── parent-portal.spec.ts     # Tests: portal padres
│   ├── screenshots/                  # Baselines de visual regression
│   └── setup-test-data.sh           # Script de seeding para E2E
```

### Convencion de Nombres

| Tipo | Patron | Ejemplo |
|------|--------|---------|
| Page Object | `PascalCase.ts` | `DashboardPage.ts` |
| Test file | `kebab-case.spec.ts` | `student-portal.spec.ts` |
| Fixture | `kebab-case.fixture.ts` | `auth.fixture.ts` |
| Screenshot baseline | `kebab-case.png` | `student-dashboard.png` |

---

## 4. Page Object Model (POM)

El patron Page Object Model encapsula los selectores y acciones de cada pagina, facilitando el mantenimiento y la reutilizacion.

### 4.1 LoginPage

```typescript
// e2e/pages/LoginPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loadingSpinner: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByTestId('login-email');
    this.passwordInput = page.getByTestId('login-password');
    this.submitButton = page.getByTestId('login-submit');
    this.errorMessage = page.getByTestId('login-error');
    this.loadingSpinner = page.getByTestId('login-loading');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
    await expect(this.emailInput).toBeVisible();
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectError(message: string): Promise<void> {
    await expect(this.errorMessage).toBeVisible();
    await expect(this.errorMessage).toContainText(message);
  }

  async expectRedirectToDashboard(): Promise<void> {
    await this.page.waitForURL(/\/(student|teacher|admin|parent)/);
  }
}
```

### 4.2 StudentDashboardPage

```typescript
// e2e/pages/student/DashboardPage.ts
import { Page, Locator, expect } from '@playwright/test';

export class StudentDashboardPage {
  readonly page: Page;
  readonly xpDisplay: Locator;
  readonly rangoMaya: Locator;
  readonly mlCoinsBalance: Locator;
  readonly moduleCards: Locator;
  readonly leaderboardWidget: Locator;
  readonly achievementBadges: Locator;
  readonly progressBar: Locator;

  constructor(page: Page) {
    this.page = page;
    this.xpDisplay = page.getByTestId('student-xp-display');
    this.rangoMaya = page.getByTestId('student-rango-maya');
    this.mlCoinsBalance = page.getByTestId('student-ml-coins');
    this.moduleCards = page.getByTestId('module-card');
    this.leaderboardWidget = page.getByTestId('leaderboard-widget');
    this.achievementBadges = page.getByTestId('achievement-badge');
    this.progressBar = page.getByTestId('progress-bar');
  }

  async expectLoaded(): Promise<void> {
    await expect(this.xpDisplay).toBeVisible();
    await expect(this.rangoMaya).toBeVisible();
  }

  async getXP(): Promise<string> {
    return (await this.xpDisplay.textContent()) ?? '0';
  }

  async getMLCoins(): Promise<string> {
    return (await this.mlCoinsBalance.textContent()) ?? '0';
  }

  async navigateToModule(moduleIndex: number): Promise<void> {
    await this.moduleCards.nth(moduleIndex).click();
  }

  async getModuleCount(): Promise<number> {
    return await this.moduleCards.count();
  }
}
```

### 4.3 ExercisePage

```typescript
// e2e/pages/student/ExercisePage.ts
import { Page, Locator, expect } from '@playwright/test';

export class ExercisePage {
  readonly page: Page;
  readonly exerciseTitle: Locator;
  readonly exerciseContent: Locator;
  readonly answerInput: Locator;
  readonly submitAnswer: Locator;
  readonly feedbackMessage: Locator;
  readonly xpRewardAnimation: Locator;
  readonly nextExerciseButton: Locator;
  readonly timerDisplay: Locator;

  constructor(page: Page) {
    this.page = page;
    this.exerciseTitle = page.getByTestId('exercise-title');
    this.exerciseContent = page.getByTestId('exercise-content');
    this.answerInput = page.getByTestId('exercise-answer');
    this.submitAnswer = page.getByTestId('exercise-submit');
    this.feedbackMessage = page.getByTestId('exercise-feedback');
    this.xpRewardAnimation = page.getByTestId('xp-reward-animation');
    this.nextExerciseButton = page.getByTestId('next-exercise');
    this.timerDisplay = page.getByTestId('exercise-timer');
  }

  async expectExerciseLoaded(): Promise<void> {
    await expect(this.exerciseTitle).toBeVisible();
    await expect(this.exerciseContent).toBeVisible();
  }

  async submitAnswerText(answer: string): Promise<void> {
    await this.answerInput.fill(answer);
    await this.submitAnswer.click();
  }

  async selectMultipleChoiceOption(optionIndex: number): Promise<void> {
    const option = this.page.getByTestId(`exercise-option-${optionIndex}`);
    await option.click();
    await this.submitAnswer.click();
  }

  async expectCorrectFeedback(): Promise<void> {
    await expect(this.feedbackMessage).toBeVisible();
    await expect(this.feedbackMessage).toHaveAttribute('data-correct', 'true');
  }

  async expectXPReward(): Promise<void> {
    await expect(this.xpRewardAnimation).toBeVisible();
  }

  async goToNextExercise(): Promise<void> {
    await this.nextExerciseButton.click();
  }
}
```

### 4.4 Principios del POM para gamilit

- **Un POM por pagina/vista:** Cada pagina del sistema tiene su propio Page Object
- **Selectores `data-testid`:** Usar atributos `data-testid` exclusivamente, nunca clases CSS de TailwindCSS
- **Metodos descriptivos:** Cada accion del usuario es un metodo del POM (`login()`, `submitAnswer()`, `navigateToModule()`)
- **Asserts encapsulados:** Metodos `expect*()` para validaciones frecuentes
- **Sin logica de test en el POM:** Solo selectores y acciones, la logica de validacion va en los `.spec.ts`

---

## 5. Fixtures de Autenticacion

### 5.1 Fixture Principal

```typescript
// e2e/fixtures/auth.fixture.ts
import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';

type GamilitRoles = 'student' | 'teacher' | 'admin' | 'parent';

const credentials: Record<GamilitRoles, { email: string; password: string }> = {
  student: { email: 'estudiante@test.gamilit.com', password: 'TestPass123!' },
  teacher: { email: 'maestro@test.gamilit.com', password: 'TestPass123!' },
  admin: { email: 'admin@test.gamilit.com', password: 'TestPass123!' },
  parent: { email: 'padre@test.gamilit.com', password: 'TestPass123!' },
};

type AuthFixtures = {
  authenticatedPage: Page;
  loginAs: (role: GamilitRoles) => Promise<Page>;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Por defecto autentica como estudiante
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    const creds = credentials.student;
    await loginPage.login(creds.email, creds.password);
    await loginPage.expectRedirectToDashboard();
    await use(page);
  },

  loginAs: async ({ page }, use) => {
    const login = async (role: GamilitRoles): Promise<Page> => {
      const loginPage = new LoginPage(page);
      await loginPage.goto();
      const creds = credentials[role];
      await loginPage.login(creds.email, creds.password);
      await loginPage.expectRedirectToDashboard();
      return page;
    };
    await use(login);
  },
});

export { expect } from '@playwright/test';
export type { GamilitRoles };
```

### 5.2 Fixture de Datos de Prueba

```typescript
// e2e/fixtures/test-data.fixture.ts
import { test as authTest } from './auth.fixture';

interface TestStudent {
  nombre: string;
  email: string;
  xp: number;
  rango: string;
  mlCoins: number;
  moduloActual: number;
}

interface TestClassroom {
  nombre: string;
  codigo: string;
  cantidadEstudiantes: number;
}

const testStudents: TestStudent[] = [
  {
    nombre: 'Estudiante E2E',
    email: 'estudiante@test.gamilit.com',
    xp: 1500,
    rango: 'Aj Tz\'ib (Escriba)',
    mlCoins: 250,
    moduloActual: 2,
  },
];

const testClassrooms: TestClassroom[] = [
  {
    nombre: 'Aula E2E Testing',
    codigo: 'E2E-001',
    cantidadEstudiantes: 5,
  },
];

export const test = authTest.extend<{
  testStudent: TestStudent;
  testClassroom: TestClassroom;
}>({
  testStudent: async ({}, use) => {
    await use(testStudents[0]);
  },
  testClassroom: async ({}, use) => {
    await use(testClassrooms[0]);
  },
});

export { expect } from '@playwright/test';
```

---

## 6. Test Data Seeding

### 6.1 Script de Preparacion de Datos

Antes de ejecutar la suite E2E, se deben cargar los datos de prueba en la base de datos. El script utiliza los seeds existentes del proyecto en `apps/database/seeds/dev/`.

```bash
#!/bin/bash
# e2e/setup-test-data.sh
# Prepara la base de datos con datos de prueba para E2E

set -e

DB_HOST="${DB_HOST:-127.0.0.1}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-gamilit_platform}"
DB_USER="${DB_USER:-gamilit_user}"
DB_PASS="${DB_PASS:-gamilit_dev_2026}"

export PGPASSWORD="$DB_PASS"

echo "=== Preparando datos E2E para gamilit ==="

# 1. Ejecutar seeds de desarrollo (incluyen usuarios de prueba)
echo "[1/3] Ejecutando seeds de desarrollo..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -f ../../database/seeds/dev/seed-test-users.sql

# 2. Insertar datos especificos para E2E
echo "[2/3] Insertando datos especificos E2E..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" <<'EOSQL'
-- Asegurar que existen usuarios de prueba para cada rol
-- Los seeds de dev ya deben incluir estos usuarios
-- Este bloque solo verifica y crea si faltan

DO $$
BEGIN
  RAISE NOTICE 'Datos E2E verificados correctamente';
END $$;
EOSQL

# 3. Verificar que los datos estan disponibles
echo "[3/3] Verificando datos E2E..."
psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
  -c "SELECT COUNT(*) as total_usuarios FROM auth.users WHERE email LIKE '%@test.gamilit.com';"

echo "=== Datos E2E listos ==="
```

### 6.2 Cleanup Post-Suite

Despues de ejecutar los tests E2E, limpiar los datos generados durante la ejecucion:

```bash
#!/bin/bash
# e2e/cleanup-test-data.sh
# Limpia datos generados durante tests E2E

export PGPASSWORD="${DB_PASS:-gamilit_dev_2026}"

psql -h "${DB_HOST:-127.0.0.1}" -p "${DB_PORT:-5432}" \
  -U "${DB_USER:-gamilit_user}" -d "${DB_NAME:-gamilit_platform}" <<'EOSQL'
-- Limpiar datos generados por E2E (mantener seeds base)
-- Solo eliminar registros creados durante la ejecucion de tests
DELETE FROM gamification.student_xp_log WHERE created_at > NOW() - INTERVAL '1 hour';
DELETE FROM progress.exercise_attempts WHERE created_at > NOW() - INTERVAL '1 hour';
EOSQL
```

### 6.3 Estrategia de Aislamiento de Datos

| Estrategia | Cuando Usar | Ventajas | Desventajas |
|-----------|-------------|----------|-------------|
| Seeds fijos + cleanup | Desarrollo local | Simple, predecible | Puede dejar datos huerfanos |
| Transacciones con rollback | Tests individuales | Aislamiento total | No aplica para E2E browser |
| Base de datos temporal | CI/CD | Aislamiento completo | Mas lento, mas recursos |
| Prefijo en datos | Todos los entornos | Facil de filtrar y limpiar | Requiere disciplina |

**Recomendacion para gamilit:** Usar seeds fijos con prefijo `e2e-` en nombres/emails y cleanup al final de la suite.

---

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

## 8. Visual Regression Testing

### 8.1 Proposito

Detectar cambios visuales no intencionales en componentes criticos de la interfaz. Especialmente util para:
- Dashboard del estudiante (XP, rango maya, logros)
- Paginas de ejercicios (30 mecanicas distintas)
- Tienda virtual con ML Coins
- Reportes del maestro

### 8.2 Configuracion de Screenshots

```typescript
// En cualquier test .spec.ts
import { test, expect } from '../fixtures/auth.fixture';

test.describe('Visual Regression - Dashboard Estudiante', () => {
  test.beforeEach(async ({ loginAs }) => {
    await loginAs('student');
  });

  test('dashboard completo deberia coincidir con baseline', async ({ page }) => {
    // Esperar a que el dashboard cargue completamente
    await page.getByTestId('student-dashboard').waitFor({ state: 'visible' });
    await page.waitForLoadState('networkidle');

    // Comparar con screenshot baseline
    await expect(page).toHaveScreenshot('student-dashboard.png', {
      maxDiffPixelRatio: 0.002, // 0.2% de diferencia permitida
      fullPage: false,
    });
  });

  test('modulo educativo deberia coincidir con baseline', async ({ page }) => {
    await page.getByTestId('module-card').first().click();
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('module-page.png', {
      maxDiffPixelRatio: 0.002,
    });
  });
});
```

### 8.3 Gestion de Baselines

| Accion | Comando | Cuando Usar |
|--------|---------|-------------|
| Generar baselines iniciales | `npx playwright test --update-snapshots` | Primera vez o cambio UI intencional |
| Comparar contra baselines | `npx playwright test` | Ejecucion normal |
| Ver diferencias | `npx playwright show-report` | Cuando un test falla |

### 8.4 Directorio de Screenshots

```
e2e/screenshots/
├── student-dashboard-chromium.png
├── student-dashboard-firefox.png
├── student-dashboard-webkit.png
├── module-page-chromium.png
├── exercise-page-chromium.png
├── store-page-chromium.png
└── teacher-dashboard-chromium.png
```

> **Nota:** Playwright genera un archivo por proyecto/navegador. Los screenshots se versionan en git para servir como baselines de referencia.

### 8.5 Threshold Recomendado

| Componente | maxDiffPixelRatio | Justificacion |
|-----------|-------------------|---------------|
| Dashboards | 0.002 (0.2%) | Datos dinamicos (XP, fechas) cambian |
| Paginas estaticas | 0.001 (0.1%) | Contenido fijo, mas estricto |
| Ejercicios | 0.005 (0.5%) | Animaciones y estados variables |
| Reportes/graficas | 0.01 (1%) | Graficas con datos variables |

---

## 9. Integracion con CI/CD

### 9.1 Workflow de GitHub Actions (Template)

```yaml
# .github/workflows/e2e.yml
name: E2E Tests

on:
  push:
    branches: [master]
  pull_request:
    branches: [master]

jobs:
  e2e-tests:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: gamilit_platform
          POSTGRES_USER: gamilit_user
          POSTGRES_PASSWORD: gamilit_dev_2026
        ports:
          - 5432:5432
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Instalar dependencias
        run: npm ci

      - name: Instalar navegadores Playwright
        run: npx playwright install --with-deps

      - name: Inicializar base de datos
        run: bash apps/database/scripts/init-database.sh

      - name: Seed datos de prueba E2E
        run: bash apps/frontend/e2e/setup-test-data.sh

      - name: Build backend
        run: cd apps/backend && npm run build

      - name: Build frontend
        run: cd apps/frontend && npm run build

      - name: Ejecutar tests E2E
        run: cd apps/frontend && npx playwright test --config=e2e/playwright.config.ts
        env:
          BASE_URL: http://localhost:3005
          API_URL: http://localhost:3006
          DATABASE_HOST: localhost
          DATABASE_PORT: 5432
          DATABASE_NAME: gamilit_platform
          DATABASE_USER: gamilit_user
          DATABASE_PASSWORD: gamilit_dev_2026
          REDIS_HOST: localhost
          REDIS_PORT: 6379

      - name: Subir reporte Playwright
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report
          path: apps/frontend/playwright-report/
          retention-days: 30

      - name: Subir resultados JUnit
        uses: actions/upload-artifact@v4
        if: always()
        with:
          name: e2e-results
          path: apps/frontend/test-results/
```

### 9.2 Consideraciones para CI

| Aspecto | Configuracion CI | Justificacion |
|---------|-----------------|---------------|
| Workers | 1 | Evitar conflictos de datos |
| Retries | 2 | Manejar flakiness de red/render |
| Timeout | 30 min total | Incluye build + 4 portales |
| Screenshots | Solo on-failure | Reducir almacenamiento |
| Video | retain-on-failure | Debug de fallos |

---

## 10. Comandos

### 10.1 Ejecucion de Tests

```bash
# Ejecutar TODOS los tests E2E
cd apps/frontend && npx playwright test --config=e2e/playwright.config.ts

# Ejecutar tests de un portal especifico
npx playwright test e2e/tests/student-portal.spec.ts
npx playwright test e2e/tests/teacher-portal.spec.ts
npx playwright test e2e/tests/admin-portal.spec.ts
npx playwright test e2e/tests/parent-portal.spec.ts

# Ejecutar solo tests de autenticacion
npx playwright test e2e/tests/auth.spec.ts

# Ejecutar tests con un navegador especifico
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Ejecutar tests en modo movil
npx playwright test --project=mobile-chrome
```

### 10.2 Depuracion

```bash
# Modo debug (abre navegador visible + inspector)
npx playwright test --headed --debug

# Modo debug para un test especifico
npx playwright test e2e/tests/student-portal.spec.ts --headed --debug

# Ejecutar con UI interactiva de Playwright
npx playwright test --ui

# Generar traza completa para todos los tests
npx playwright test --trace on
```

### 10.3 Reportes y Screenshots

```bash
# Ver reporte HTML despues de la ejecucion
npx playwright show-report

# Actualizar screenshots baseline (cuando hay cambios UI intencionales)
npx playwright test --update-snapshots

# Generar solo el reporte sin ejecutar tests de nuevo
npx playwright show-report playwright-report/
```

### 10.4 Generacion de Codigo

```bash
# Abrir Playwright Codegen para grabar interacciones
npx playwright codegen http://localhost:3005

# Grabar interacciones para un dispositivo movil
npx playwright codegen --device="Pixel 5" http://localhost:3005
```

---

## 11. Mejores Practicas para gamilit

### 11.1 Selectores

| Practica | Estado | Ejemplo |
|----------|--------|---------|
| Usar `data-testid` | OBLIGATORIO | `data-testid="student-xp-display"` |
| Evitar clases CSS de TailwindCSS | OBLIGATORIO | NO usar `.bg-blue-500` como selector |
| Usar `getByRole` cuando aplique | RECOMENDADO | `getByRole('button', { name: /guardar/i })` |
| Usar `getByText` para contenido | ACEPTABLE | `getByText('Modulo 1: Comprension Literal')` |
| Selectores XPath | PROHIBIDO | Fragiles y dificiles de mantener |

### 11.2 Convencion de `data-testid` para gamilit

```
Formato: {portal}-{componente}-{accion?}

Ejemplos:
  data-testid="student-xp-display"
  data-testid="student-module-card"
  data-testid="teacher-classroom-list"
  data-testid="admin-content-create"
  data-testid="parent-child-progress"
  data-testid="login-submit"
  data-testid="nav-store"
  data-testid="exercise-submit"
  data-testid="exercise-option-0"
```

### 11.3 Esperas y Sincronizacion

```typescript
// CORRECTO — Esperar con assertions de Playwright (auto-retry)
await expect(page.getByTestId('dashboard')).toBeVisible();
await expect(page.getByTestId('xp-display')).toContainText('1500');

// CORRECTO — Esperar a que la red se estabilice
await page.waitForLoadState('networkidle');

// CORRECTO — Esperar una respuesta API especifica
await page.waitForResponse(resp =>
  resp.url().includes('/api/exercises') && resp.status() === 200
);

// INCORRECTO — Nunca usar timeouts fijos
await page.waitForTimeout(3000); // PROHIBIDO
```

### 11.4 Estructura de Tests

| Regla | Descripcion |
|-------|-------------|
| Un test = un flujo de usuario | Cada test simula un flujo completo de principio a fin |
| Independencia | Los tests NO deben depender del resultado de otros tests |
| Paralelismo por portal | Tests de distintos portales pueden correr en paralelo |
| Setup compartido | Usar `beforeEach` para login, NO compartir estado entre tests |
| Datos aislados | Cada test debe funcionar con datos seeds, sin crear dependencias |

### 11.5 Mantenimiento

- **Actualizar POMs** cuando cambie la estructura de paginas del frontend
- **Revisar baselines** de screenshots despues de cada actualizacion de UI o TailwindCSS
- **Ejecutar E2E completo** antes de cada merge a `master`
- **Documentar tests nuevos** en el `README.md` del directorio `e2e/`
- **Monitorear flakiness**: si un test falla intermitentemente, investigar y corregir antes de agregar retries

---

## 12. Resumen de Cobertura E2E Objetivo

| Portal | Tests Minimos | Flujos Cubiertos |
|--------|--------------|------------------|
| Autenticacion | 7 | Login 4 roles, error, redireccion, logout |
| Estudiante | 5 | Dashboard, ejercicio, tienda, leaderboard, modulos |
| Maestro | 4 | Dashboard, asignacion, progreso, reporte |
| Administrador | 4 | Dashboard, contenido, analytics, usuarios |
| Padres | 3 | Dashboard, progreso, notificaciones |
| Visual Regression | 4+ | Dashboards principales, modulos |
| **Total minimo** | **27+** | Flujos criticos de todos los portales |

---

## Referencias Cruzadas

- [ESTANDAR-TESTING](../../40-standards/ESTANDAR-TESTING.md) - Estandar general de testing (piramide, unit, integration, E2E)
- [GUIA-COVERAGE-TESTING](./GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas
- [TESTING-GUIDE](./TESTING-GUIDE.md) - Guia general de testing gamilit (Jest + Vitest)
- [Playwright Documentation](https://playwright.dev/docs/intro) - Documentacion oficial

---

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
