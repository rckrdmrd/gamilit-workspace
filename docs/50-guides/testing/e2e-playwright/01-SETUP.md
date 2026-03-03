---
titulo: E2E Playwright - Setup y Estructura
version: 1.0.0
fecha_creacion: 2026-02-14
parte_de: GUIA-E2E-PLAYWRIGHT
seccion: 1-3
tags: [testing, e2e, playwright, setup, configuracion]
aplica_a: [frontend, fullstack]
estado: vigente
---

# E2E Playwright - Setup y Estructura

> Parte 1 de 5 — Proposito, Setup Inicial, Estructura de Archivos
> Guia completa: [GUIA-E2E-PLAYWRIGHT](../GUIA-E2E-PLAYWRIGHT.md)

## 1. Proposito

Esta guia establece la estrategia, configuracion y mejores practicas para implementar testing end-to-end (E2E) automatizado en la plataforma gamilit utilizando Playwright. El objetivo es cubrir los flujos criticos de los 4 portales (Estudiante, Maestro, Administrador y Padres) con tests que simulen el comportamiento real de los usuarios.

### Contexto de gamilit

| Aspecto | Detalle |
|---------|---------|
| Portales | 4 (Estudiante, Maestro, Admin, Padres) |
| Componentes .tsx | 580 produccion |
| Paginas | 70 activas |
| Rutas | 73 en App.tsx |
| Ejercicios | 29 mecanicas unicas (comprension_auditiva en BACKLOG) en 5 modulos educativos |
| Tests E2E actuales | 0 (primera implementacion) |
| Test runner unitario frontend | Vitest (46 archivos) |
| Test runner backend | Jest (2324 tests, 63 spec files) |

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

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
