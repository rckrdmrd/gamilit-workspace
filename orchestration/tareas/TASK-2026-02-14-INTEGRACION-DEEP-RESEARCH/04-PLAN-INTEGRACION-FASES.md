# Plan de Integracion por Fases

**Version:** 1.0.0
**Fecha:** 2026-02-14
**Tarea:** TASK-2026-02-14-INTEGRACION-DEEP-RESEARCH
**Fase:** 0 — Plan de Ejecucion

---

## Resumen Ejecutivo

24 documentos de workspace-arch deep research seran integrados en gamilit como documentacion (estandares, guias, politicas, directivas). No se crea codigo — solo documentacion adaptada de Express.js a NestJS 11.

**Total archivos:** 17 nuevos + 10 modificados = 27 archivos
**Ejecucion:** 4 rondas con subagentes paralelos (max 4 simultaneos)

---

## Fase 1: Seguridad (PRIORIDAD CRITICA)

### Agent A: OWASP API Security + Estandar Seguridad v2.0

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| EXTENDER | `docs/40-standards/ESTANDAR-SEGURIDAD.md` | Modificar |
| ACTUALIZAR | `docs/40-standards/_INDEX.md` | Modificar |
| ACTUALIZAR | `orchestration/directivas/simco/SIMCO-BACKEND.md` | Modificar |

### Agent B: Supply Chain + Secrets Rotation

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `orchestration/directivas/politicas/POLITICA-SUPPLY-CHAIN.md` | Nuevo |
| CREAR | `docs/50-guides/backend/GUIA-ROTACION-SECRETOS.md` | Nuevo |
| CREAR | `orchestration/_definitions/checklists/CHECKLIST-SECURITY-SUPPLY-CHAIN.md` | Nuevo |

---

## Fase 2: Arquitectura y Patrones

### Agent C: Clean Architecture + Dependency Rules + Design Patterns

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| EXTENDER | `docs/40-standards/backend-profesional/02-clean-architecture.md` | Modificar |
| CREAR | `docs/50-guides/backend/GUIA-DEPENDENCY-RULES.md` | Nuevo |
| CREAR | `docs/50-guides/backend/GUIA-DESIGN-PATTERNS-NESTJS.md` | Nuevo |

### Agent D: Architecture Testing + PostgreSQL Runbook + Expand/Contract

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/50-guides/testing/GUIA-ARCHITECTURE-TESTING.md` | Nuevo |
| CREAR | `docs/50-guides/backend/GUIA-RUNBOOK-POSTGRESQL.md` | Nuevo |
| CREAR | `docs/50-guides/backend/GUIA-EXPAND-CONTRACT-MIGRATIONS.md` | Nuevo |

---

## Fase 3: Testing + Observabilidad

### Agent E: E2E Playwright + Testing Extension

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/50-guides/testing/GUIA-E2E-PLAYWRIGHT.md` | Nuevo |
| EXTENDER | `docs/40-standards/ESTANDAR-TESTING.md` | Modificar |

### Agent F: Observabilidad (OpenTelemetry + Prometheus)

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/40-standards/ESTANDAR-OBSERVABILIDAD.md` | Nuevo |
| CREAR | `docs/50-guides/backend/GUIA-OPENTELEMETRY-NESTJS.md` | Nuevo |

---

## Fase 4: DevOps y CI/CD

### Agent G: GitHub Actions + Docker

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/50-guides/deployment/GUIA-GITHUB-ACTIONS-CICD.md` | Nuevo |
| CREAR | `docs/50-guides/deployment/GUIA-DOCKER-MULTISTAGE.md` | Nuevo |
| CREAR | `orchestration/directivas/triggers/TRIGGER-QUALITY-GATE.md` | Nuevo |

### Agent H: 12-Factor + Pipeline Migraciones

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/40-standards/ESTANDAR-12-FACTOR-APP.md` | Nuevo |
| CREAR | `docs/50-guides/deployment/GUIA-PIPELINE-MIGRACIONES.md` | Nuevo |
| EXTENDER | `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md` | Modificar |

---

## Fase 5: KB Integration + Navigation

### Agent I: KB + WCAG + Indices

| Accion | Archivo Target | Tipo |
|--------|---------------|------|
| CREAR | `docs/80-references/knowledge-base/SIMCO-KB-MAPPING.md` | Nuevo |
| CREAR | `docs/50-guides/frontend/GUIA-WCAG-ACCESSIBILITY.md` | Nuevo |
| ACTUALIZAR | `docs/40-standards/_INDEX.md` | Modificar (final) |
| ACTUALIZAR | `docs/50-guides/_INDEX.md` | Modificar |
| ACTUALIZAR | `orchestration/_MAP.md` | Modificar |
| ACTUALIZAR | `orchestration/directivas/triggers/_INDEX.md` | Modificar |

---

## Cronograma de Ejecucion

```
Ronda 1 (Fase 0): Analisis ──────── [COMPLETADA]
  └── 4 documentos de analisis

Ronda 2 (Fases 1+2): Security + Architecture ──── [4 agentes paralelos]
  ├── Agent A: OWASP API + Security Standard
  ├── Agent B: Supply Chain + Secrets
  ├── Agent C: Clean Arch + Design Patterns
  └── Agent D: Arch Testing + PostgreSQL + Expand/Contract

Ronda 3 (Fases 3+4): Testing + DevOps ──── [4 agentes paralelos]
  ├── Agent E: Playwright E2E + Testing Standard
  ├── Agent F: Observability Standard + Guide
  ├── Agent G: GitHub Actions + Docker
  └── Agent H: 12-Factor + Pipeline Migraciones

Ronda 4 (Fase 5): KB + Navigation ──── [1 agente]
  └── Agent I: KB mapping + WCAG + Index updates
```

---

## Directrices de Adaptacion

1. **Express.js → NestJS:** Toda referencia a express middleware, Router, app.use() mapeada a Guards, Interceptors, Pipes, Filters, Decorators
2. **Ejemplos con codigo real:** Usar modulos reales de gamilit (auth, users, educational, gamification) con paths reales
3. **No duplicar:** Verificar que el contenido no exista ya en docs actuales
4. **Mantener formato:** _INDEX.md para secciones, _MAP.md para subsecciones, frontmatter YAML
5. **Idioma:** Espanol
6. **Stack:** NestJS 11, React 19, TypeORM 0.3.x, PostgreSQL 15, Redis, Socket.IO 4.8+, Vite 6.x
7. **Solo documentacion:** No crear archivos de codigo

---

*Documento generado como parte de TASK-2026-02-14-INTEGRACION-DEEP-RESEARCH*
