---
titulo: E2E Playwright - Visual Regression y CI/CD
version: 1.0.0
fecha_creacion: 2026-02-14
parte_de: GUIA-E2E-PLAYWRIGHT
seccion: 8-9
tags: [testing, e2e, playwright, visual-regression, cicd, github-actions]
aplica_a: [frontend, fullstack]
estado: vigente
---

# E2E Playwright - Visual Regression y CI/CD

> Parte 4 de 5 — Visual Regression Testing, Integracion con CI/CD (secciones 8-9)
> Guia completa: [GUIA-E2E-PLAYWRIGHT](../GUIA-E2E-PLAYWRIGHT.md)

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

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
