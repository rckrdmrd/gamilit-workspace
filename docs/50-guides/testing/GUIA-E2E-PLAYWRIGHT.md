---
titulo: Guia de Testing E2E con Playwright
version: 1.0.0
fecha_creacion: 2026-02-14
tags: [testing, e2e, playwright, react]
aplica_a: [frontend, fullstack]
estado: vigente
tipo: hub
---

# Guia de Testing E2E con Playwright

> Hub page — Contenido dividido en 5 archivos en `e2e-playwright/`

## Contenido

| Parte | Archivo | Secciones |
|-------|---------|-----------|
| 1 | [01-SETUP.md](./e2e-playwright/01-SETUP.md) | Proposito, Setup Inicial, Estructura de Archivos (1-3) |
| 2 | [02-FIXTURES.md](./e2e-playwright/02-FIXTURES.md) | Page Object Model, Fixtures, Test Data Seeding (4-6) |
| 3 | [03-TESTS.md](./e2e-playwright/03-TESTS.md) | Escenarios Criticos por Portal (7) |
| 4 | [04-ADVANCED.md](./e2e-playwright/04-ADVANCED.md) | Visual Regression Testing, CI/CD (8-9) |
| 5 | [05-REFERENCE.md](./e2e-playwright/05-REFERENCE.md) | Comandos, Mejores Practicas, Resumen, Referencias (10-12) |

## Contexto de gamilit

| Aspecto | Detalle |
|---------|---------|
| Portales | 4 (Estudiante, Maestro, Admin, Padres) |
| Paginas | 70 activas |
| Ejercicios | 29 mecanicas unicas (comprension_auditiva en BACKLOG) en 5 modulos educativos |
| Tests E2E actuales | 0 (primera implementacion) |
| Tests objetivo minimo | 27+ flujos criticos |

## Acceso Rapido

- **Instalacion:** [01-SETUP.md — Setup Inicial](./e2e-playwright/01-SETUP.md#2-setup-inicial)
- **Page Objects:** [02-FIXTURES.md — POM](./e2e-playwright/02-FIXTURES.md#4-page-object-model-pom)
- **Tests por portal:** [03-TESTS.md](./e2e-playwright/03-TESTS.md)
- **CI/CD workflow:** [04-ADVANCED.md — CI/CD](./e2e-playwright/04-ADVANCED.md#9-integracion-con-cicd)
- **Comandos CLI:** [05-REFERENCE.md — Comandos](./e2e-playwright/05-REFERENCE.md#10-comandos)

## Referencias Cruzadas

- [ESTANDAR-TESTING](../../40-standards/ESTANDAR-TESTING.md) - Estandar general de testing
- [GUIA-COVERAGE-TESTING](./GUIA-COVERAGE-TESTING.md) - Estrategia de cobertura
- [TESTING-GUIDE](./TESTING-GUIDE.md) - Guia general de testing (Jest + Vitest)
- [Playwright Documentation](https://playwright.dev/docs/intro) - Documentacion oficial

---

**Version:** 1.0.0 | **Mantenido por:** Agent E — Documentacion Testing
