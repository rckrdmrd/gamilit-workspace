---
titulo: E2E Playwright - Comandos, Practicas y Referencia
version: 1.0.0
fecha_creacion: 2026-02-14
parte_de: GUIA-E2E-PLAYWRIGHT
seccion: 10-12
tags: [testing, e2e, playwright, comandos, mejores-practicas, referencia]
aplica_a: [frontend, fullstack]
estado: vigente
---

# E2E Playwright - Comandos, Practicas y Referencia

> Parte 5 de 5 — Comandos, Mejores Practicas, Resumen Cobertura, Referencias (secciones 10-12)
> Guia completa: [GUIA-E2E-PLAYWRIGHT](../GUIA-E2E-PLAYWRIGHT.md)

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

- [ESTANDAR-TESTING](../../../40-standards/ESTANDAR-TESTING.md) - Estandar general de testing (piramide, unit, integration, E2E)
- [GUIA-COVERAGE-TESTING](../GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura y metricas
- [TESTING-GUIDE](../TESTING-GUIDE.md) - Guia general de testing gamilit (Jest + Vitest)
- [Guias de Pruebas por Modulo](../exercise-guides/README.md) - Respuestas ejemplo y criterios de validacion para los 23 tipos de ejercicio (5 modulos)
- [Playwright Documentation](https://playwright.dev/docs/intro) - Documentacion oficial

---

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
