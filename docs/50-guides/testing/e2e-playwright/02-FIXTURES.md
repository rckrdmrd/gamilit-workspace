---
titulo: E2E Playwright - Page Objects, Fixtures y Test Data
version: 1.0.0
fecha_creacion: 2026-02-14
parte_de: GUIA-E2E-PLAYWRIGHT
seccion: 4-6
tags: [testing, e2e, playwright, pom, fixtures, test-data]
aplica_a: [frontend, fullstack]
estado: vigente
---

# E2E Playwright - Page Objects, Fixtures y Test Data

> Parte 2 de 5 — Page Object Model, Fixtures de Autenticacion, Test Data Seeding
> Guia completa: [GUIA-E2E-PLAYWRIGHT](../GUIA-E2E-PLAYWRIGHT.md)

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
DELETE FROM gamification_system.student_xp_log WHERE created_at > NOW() - INTERVAL '1 hour';
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

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
