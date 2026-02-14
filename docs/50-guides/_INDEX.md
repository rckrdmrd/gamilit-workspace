# Guias de Implementacion - GAMILIT

Guias tecnicas por dominio para desarrolladores, DevOps y QA.

---

## Subdirectorios

| Directorio | Contenido | Archivos |
|------------|-----------|----------|
| [backend/](./backend/) | Guias de backend NestJS (DTOs, entities, modules, DB, observabilidad, patrones) | ~24 |
| [frontend/](./frontend/) | Guias de frontend React (components, hooks, types, state, accesibilidad) | ~52 |
| [deployment/](./deployment/) | Guias de deploy, SSL, Nginx, produccion, CI/CD, Docker, migraciones | ~11 (+9 archived) |
| [testing/](./testing/) | Guias de testing manual, automatizado, arquitectura, E2E Playwright | ~6 |
| [troubleshooting/](./troubleshooting/) | Errores comunes por dominio + build errors | ~16 |
| [integration/](./integration/) | Integracion entre portales, TypeORM, WebSocket | ~4 |
| [documentation-master/](./documentation-master/) | Analisis master de documentacion (7 fases) | ~11 |

## Archivos Raiz

| Archivo | Descripcion |
|---------|-------------|
| [GUIA-REFERENCIAS-SIMCO.md](./GUIA-REFERENCIAS-SIMCO.md) | Como usar referencias SIMCO en el proyecto |

---

### Guias Nuevas (2026-02-14)

**Backend** (6 nuevas):
- GUIA-ROTACION-SECRETOS.md — Rotacion de secretos y credenciales
- GUIA-DEPENDENCY-RULES.md — Reglas de dependencia entre modulos
- GUIA-DESIGN-PATTERNS-NESTJS.md — Patrones de diseno GoF en NestJS
- GUIA-RUNBOOK-POSTGRESQL.md — Runbook operativo de PostgreSQL
- GUIA-OPENTELEMETRY-NESTJS.md — Instrumentacion OpenTelemetry en NestJS
- GUIA-EXPAND-CONTRACT-MIGRATIONS.md — Patron expand/contract para migraciones

**Testing** (2 nuevas):
- GUIA-ARCHITECTURE-TESTING.md — Tests de arquitectura (ArchUnit-style)
- GUIA-E2E-PLAYWRIGHT.md — Tests end-to-end con Playwright

**Deployment** (3 nuevas):
- GUIA-GITHUB-ACTIONS-CICD.md — Pipeline CI/CD con GitHub Actions
- GUIA-DOCKER-MULTISTAGE.md — Builds Docker multistage optimizados
- GUIA-PIPELINE-MIGRACIONES.md — Pipeline automatizado de migraciones

**Frontend** (1 nueva):
- GUIA-WCAG-ACCESSIBILITY.md — Accesibilidad WCAG 2.1 AA para React

---

**Origen:** Migrado desde `docs/40-standards/guias/` (2026-02-11)
