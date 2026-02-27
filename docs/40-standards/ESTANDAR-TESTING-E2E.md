---
titulo: Estandar de Testing — E2E y Visual Regression
tipo: estandar-proyecto
version: 3.0.0
fecha_creacion: 2026-02-02
ultima_actualizacion: 2026-02-27
autor: Equipo de Arquitectura
categoria: estandares
tags:
  - testing
  - e2e-tests
  - playwright
  - visual-regression
aplica_a:
  - frontend
  - fullstack
estado: vigente
---

# Estandar de Testing — E2E y Visual Regression

> Archivo especializado extraido de `ESTANDAR-TESTING.md`. Ver [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) para el indice completo y secciones de Cobertura y Checklists.

## Referencias Cruzadas

| Archivo | Contenido |
|---------|-----------|
| [ESTANDAR-TESTING.md](ESTANDAR-TESTING.md) | Indice, Cobertura Minima (Sec. 5), Checklists (Sec. 9), Referencias |
| [ESTANDAR-TESTING-UNIT.md](ESTANDAR-TESTING-UNIT.md) | Unit Tests, Naming Conventions, Mocking, Test Data |
| [ESTANDAR-TESTING-INTEGRATION.md](ESTANDAR-TESTING-INTEGRATION.md) | Integration Tests (backend, frontend, DB) |
| [ESTANDAR-TESTING-ARCHITECTURE.md](ESTANDAR-TESTING-ARCHITECTURE.md) | Architecture Tests (ts-arch, circular deps) |

---

## 4. E2E Tests

### 4.1 Herramientas Recomendadas

| Herramienta | Uso Principal | Ventajas |
|-------------|---------------|----------|
| Playwright | E2E cross-browser | Multi-browser, rapido, auto-wait |
| Cypress | E2E + Component | Developer experience, time-travel |

**Recomendacion:** Playwright para proyectos nuevos.

### 4.2 Escenarios Criticos a Cubrir

```
AUTENTICACION
├── Login exitoso
├── Login fallido (credenciales incorrectas)
├── Logout
├── Recuperacion de password
└── Registro de usuario

FLUJOS CORE DE NEGOCIO
├── Crear/Editar/Eliminar entidades principales
├── Checkout completo (si aplica)
├── Generacion de reportes
└── Flujos de aprobacion/workflow

PERMISOS Y SEGURIDAD
├── Acceso a rutas protegidas sin autenticacion
├── Acceso a recursos sin autorizacion
└── Validacion de roles
```

### 4.3 Ejemplo Playwright con Page Object Model

```typescript
// pages/LoginPage.ts
import { Page, Locator } from '@playwright/test';

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel('Email');
    this.passwordInput = page.getByLabel('Password');
    this.submitButton = page.getByRole('button', { name: 'Sign In' });
    this.errorMessage = page.getByRole('alert');
  }

  async goto(): Promise<void> {
    await this.page.goto('/login');
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async getErrorMessage(): Promise<string> {
    return await this.errorMessage.textContent() ?? '';
  }
}

// pages/DashboardPage.ts
import { Page, Locator } from '@playwright/test';

export class DashboardPage {
  readonly page: Page;
  readonly welcomeMessage: Locator;
  readonly userMenu: Locator;
  readonly logoutButton: Locator;

  constructor(page: Page) {
    this.page = page;
    this.welcomeMessage = page.getByTestId('welcome-message');
    this.userMenu = page.getByTestId('user-menu');
    this.logoutButton = page.getByRole('menuitem', { name: 'Logout' });
  }

  async logout(): Promise<void> {
    await this.userMenu.click();
    await this.logoutButton.click();
  }

  async getWelcomeText(): Promise<string> {
    return await this.welcomeMessage.textContent() ?? '';
  }
}
```

```typescript
// tests/auth.spec.ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

test.describe('Authentication', () => {
  test('should login successfully with valid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login('admin@example.com', 'AdminPass123!');

    // Assert
    await expect(page).toHaveURL('/dashboard');
    const welcomeText = await dashboardPage.getWelcomeText();
    expect(welcomeText).toContain('Welcome');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.goto();
    await loginPage.login('wrong@example.com', 'wrongpass');

    // Assert
    await expect(page).toHaveURL('/login');
    const errorMessage = await loginPage.getErrorMessage();
    expect(errorMessage).toContain('Invalid credentials');
  });

  test('should redirect to login when accessing protected route', async ({ page }) => {
    // Act
    await page.goto('/dashboard');

    // Assert
    await expect(page).toHaveURL(/\/login/);
  });

  test('should logout successfully', async ({ page }) => {
    // Arrange - Login first
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('admin@example.com', 'AdminPass123!');
    await expect(page).toHaveURL('/dashboard');

    // Act
    await dashboardPage.logout();

    // Assert
    await expect(page).toHaveURL('/login');
  });
});
```

### 4.4 Configuracion Playwright

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [
    ['html'],
    ['junit', { outputFile: 'test-results/junit.xml' }],
  ],
  use: {
    baseURL: process.env.BASE_URL || 'http://localhost:3006',
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
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
  ],
  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3006',
    reuseExistingServer: !process.env.CI,
    timeout: 120000,
  },
});
```

---

## 11. Visual Regression Testing

### 11.1 Cuando Usar

Visual regression testing debe aplicarse en los siguientes escenarios:

- **Componentes UI criticos:** Dashboards de los 4 portales, paginas de ejercicios, sistema de gamificacion (XP, rangos maya, logros, tienda)
- **Despues de actualizar TailwindCSS o dependencias de UI:** Cualquier cambio en la configuracion de estilos puede causar regresiones visuales no intencionales
- **Cross-browser rendering verification:** Verificar que la apariencia es consistente en Chromium, Firefox y WebKit
- **Despues de refactors de componentes:** Garantizar que la apariencia se mantiene identica tras cambios internos

### 11.2 Herramienta: Playwright Screenshots

Playwright incluye soporte nativo para comparacion de screenshots mediante `toHaveScreenshot()`.

```typescript
// Ejemplo basico
test('dashboard estudiante deberia coincidir con baseline', async ({ page }) => {
  await page.goto('/student/dashboard');
  await page.waitForLoadState('networkidle');

  await expect(page).toHaveScreenshot('student-dashboard.png', {
    maxDiffPixelRatio: 0.002, // 0.2% de diferencia permitida
  });
});
```

### 11.3 Configuracion

| Parametro | Valor Recomendado | Descripcion |
|-----------|-------------------|-------------|
| `maxDiffPixelRatio` | 0.002 (0.2%) | Porcentaje maximo de pixeles diferentes |
| `threshold` | 0.2 | Sensibilidad de comparacion por pixel (0-1) |
| `animations` | `'disabled'` | Deshabilitar animaciones CSS para consistencia |
| `fullPage` | `false` | Capturar solo viewport visible por defecto |

### 11.4 Gestion de Baselines

- Los screenshots baseline se versionan en git dentro de `e2e/screenshots/`
- Actualizar baselines: `npx playwright test --update-snapshots`
- Cada navegador/proyecto genera su propio baseline (sufijo automatico)
- Revisar diferencias: `npx playwright show-report`

### 11.5 Componentes Prioritarios para Visual Regression en gamilit

| Componente | Portal | Justificacion |
|-----------|--------|---------------|
| Dashboard principal | Estudiante | Punto de entrada, XP, rango maya |
| Pagina de ejercicio | Estudiante | 30 mecanicas, interacciones criticas |
| Tienda ML Coins | Estudiante | Economia virtual, items visuales |
| Dashboard de aulas | Maestro | Vista principal del maestro |
| Reportes de progreso | Maestro | Graficas y tablas de datos |
| Gestion de contenido | Admin | Formularios complejos |
| Dashboard de hijo | Padres | Progreso academico visual |

Ver: [GUIA-E2E-PLAYWRIGHT](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) seccion Visual Regression para implementacion completa.

---

## Referencias Cruzadas

### Estandares Relacionados
- [ESTANDAR-FRONTEND-PROFESIONAL.md](ESTANDAR-FRONTEND-PROFESIONAL.md) - Testing patterns para React

### Guias de Implementacion
- [GUIA-E2E-PLAYWRIGHT](../50-guides/testing/GUIA-E2E-PLAYWRIGHT.md) - Testing E2E con Playwright para los 4 portales
- [GUIA-COVERAGE-TESTING](../50-guides/testing/GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas actuales

### Principios Aplicados
- [PRINCIPIO-VALIDACION-OBLIGATORIA](../../orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md) - Principio de validacion obligatoria (build + lint + tests)

## Referencias
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Trophy - Kent C. Dodds](https://kentcdodds.com/blog/the-testing-trophy-and-testing-classifications)
