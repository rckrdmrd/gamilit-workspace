# Auditoria CLAUDE.md — Verificacion Linea por Linea

**Fecha:** 2026-02-27
**Version CLAUDE.md auditada:** v4.0.0 (2026-02-11)
**Dias sin actualizacion:** 16

---

## Metricas en CLAUDE.md vs Real

### Seccion: IDENTIDAD

| Claim | Valor en CLAUDE.md | Real | Veredicto |
|-------|-------------------|------|-----------|
| Stack | NestJS 11 + React 19 + PostgreSQL 15 + TypeORM 0.3.x + Redis + Socket.IO 4.8+ + Vite 6.x | Correcto | OK |
| Estado | MVP 98% Completado | Correcto | OK |
| Modulos educativos | 5 | 5 | OK |
| Tipos de ejercicio | 23 | 23 | OK |
| Portales | 4 | 4 | OK |

### Seccion: RC2 COHERENCIA

| Claim | Valor en CLAUDE.md | Real | Veredicto |
|-------|-------------------|------|-----------|
| 173 tablas | 173 | 173 | OK |
| 156 entity files | 156 | 156 | OK |
| 157 classes | 157 | 157 | OK |
| 16 DDL-only data_warehouse | 16 | 16 | OK |
| 912 endpoints | 912 | ~912-914 | OK (±2) |

### Seccion: MODULOS (23)

| Claim | Valor | Real | Veredicto |
|-------|-------|------|-----------|
| Total 23 modulos | 23 | 22 dirs + mail transitivo = 23 | OK |
| 156 entities (157 classes) | 156/157 | 156/157 | OK |
| 172 services | 172 | 172 | OK |
| 108 controllers | 108 | 108 | OK |
| 912 endpoints | 912 | 912 | OK |
| 4 no importados (etl, ml, viz, mail) | 4 | 4 (confirmado app.module.ts) | OK |

#### Estado por Modulo

| Modulo | CLAUDE.md % | Verificacion | Issue |
|--------|------------|-------------|-------|
| auth | 100% | OK | - |
| users | 100% | OK (conceptual, en auth module) | - |
| tenants | 100% | OK (en auth module) | - |
| core | 100% | OK | - |
| health | 100% | OK | - |
| settings | 100% | OK (en admin module) | - |
| notifications | 90% | OK | - |
| modules | 95% | OK | - |
| exercises | 95% | OK | - |
| content | 95% | OK | - |
| classrooms | 90% | OK | - |
| students | 90% | OK | - |
| gamification | 95% | OK | - |
| leaderboard | 85% | OK | - |
| missions | 85% | OK | - |
| store | 75% | OK | - |
| achievements | 90% | OK | - |
| social | 60% | OK | - |
| teachers | 95% | OK | - |
| **parents** | **100%** | **~57% (pages), 100% backend** | **ERROR — debe ser "100% backend, ~57% frontend"** |
| analytics | 85% | OK | - |
| reports | 75% | OK | - |
| mail | 100% | OK (transitivo) | - |

### Seccion: PORTALES

| Portal | CLAUDE.md | Real | Veredicto |
|--------|-----------|------|-----------|
| Estudiante ~100% | ~100% | ~100% | OK |
| Maestro ~95% | ~95% | ~95% | OK |
| Admin ~90% | ~90% | ~90% | OK |
| **Padres 100%** | **100%** | **100% backend, ~57% frontend (4/7 pages)** | **ERROR** |

### Seccion: METRICAS ACTUALES — Base de Datos

| Metrica | CLAUDE.md | Real | Veredicto |
|---------|-----------|------|-----------|
| Schemas | 18 | 18 | OK |
| Tablas | 173 | 173 | OK |
| Views | 18 | 18 | OK |
| Materialized Views | 7 | 7 | OK |
| Funciones | 158 | 158 (functions/) | OK |
| Triggers | 68 | 68 (triggers/) | OK |
| RLS Policies | 251 | 251 (rls-policies/) | OK |
| Foreign Keys | 301 | ~350 (undercounted) | MINOR |
| ENUMs | 42 | 40-42 | OK |

### Seccion: METRICAS ACTUALES — Backend

| Metrica | CLAUDE.md | Real | Veredicto |
|---------|-----------|------|-----------|
| Modulos | 23 | 23 | OK |
| Entities | 156 files (157 classes) | 156/157 | OK |
| DTOs | 401 | 401 | OK |
| Services | 172 | 172 | OK |
| Controllers | 108 | 108 | OK |
| Endpoints | 912 | 912 | OK |
| Guards | 15 | 15 | OK |
| Decorators | 18 | 18 | OK |
| Tests | 833 passing (63 spec files) | 2324 total (2296+28), 63 specs | **ERROR — 833 obsoleto, real es 2324** |

### Seccion: METRICAS ACTUALES — Frontend

| Metrica | CLAUDE.md | Real | Veredicto |
|---------|-----------|------|-----------|
| Componentes | 577 | ~539 (strict) a 577 (loose) | MINOR-MAJOR (depende de metodologia) |
| Hooks | 134 | ~92 (strict unique) | **MAJOR** |
| Paginas | 67 | 67 | OK |
| Stores Zustand | 13 | 13 | OK |
| API Service Files | 65 | 65 | OK |
| API Calls Total | ~575 | ~580 | MINOR (MASTER ya corrigio a 580) |
| Portales | 4 | 4 | OK |
| Mecanicas Ejercicio | 30 | 30 | OK |
| Routes | 74 | 71 (App.tsx) | **MAJOR** |
| Type Files | 49 | 49 | OK |

### Seccion: ALIASES

| Alias | Path | Existe | Veredicto |
|-------|------|--------|-----------|
| @BACKEND | apps/backend/src/modules/ | Si | OK |
| @FRONTEND | apps/frontend/src/ | Si | OK |
| @DDL | apps/database/ddl/ | Si | OK |
| @SEEDS | apps/database/seeds/ | Si | OK |
| @DOCS-LOCAL | docs/ | Si | OK |
| @INVENTORY | orchestration/inventarios/ | Si | OK |
| @WORK-ITEMS | orchestration/work-items/ | Si | OK |
| @PROJECT-CTX | orchestration/PROJECT-CONTEXT.md | Si | OK |
| @SIMCO | orchestration/directivas/simco/ | Si | OK |
| @PRINCIPIOS | orchestration/directivas/principios/ | Si | OK |
| @TRIGGERS | orchestration/directivas/triggers/ | Si | OK |
| @PERFILES-MAP | orchestration/agents/perfiles/_MAP.md | Si | OK |
| @GUIDES | docs/50-guides/ | Si | OK |
| @PORTALS | docs/60-portals/ | Si | OK |
| @SCHEMA-REF | docs/20-architecture/schema-reference/ | Si | OK |
| @BACKEND-STD | docs/40-standards/backend-profesional/ | Si | OK |
| @PROMPTS-INDEX | orchestration/referencias/prompts/PROMPTS-INDEX.md | Si | OK |
| @NEXUS | orchestration/directivas/simco/SIMCO-CONTEXT-MANAGEMENT-V2.md | Si | OK |
| @CONTEXT-MAP | orchestration/CONTEXT-MAP.yml | Si | OK |
| @BOOTLOADER | orchestration/directivas/simco/SIMCO-BOOTLOADER.md | Si | OK |
| @PROXIMA-ACCION | orchestration/PROXIMA-ACCION.md | Si | OK |
| @COMPACT-PROFILES | orchestration/agents/perfiles/compact/ | Si | OK |
| @RECREAR-BD | orchestration/directivas/simco/SIMCO-RECREAR-BD.md | Si | OK |
| @PERFIL-DEPLOY | orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md | Si | OK |
| @ECOSYSTEM | ecosystem.config.js | Si | OK |
| @AMBIENTES | docs/20-architecture/AMBIENTES-DEV-PROD.md | Si | OK |

**Todos los aliases apuntan a paths existentes.** OK.

---

## Resumen de Errores en CLAUDE.md

| # | Seccion | Error | Severidad | Correccion |
|---|---------|-------|-----------|-----------|
| 1 | Modulos #20 | parents: 100% → deberia indicar "100% backend, ~57% frontend" | MAJOR | Actualizar |
| 2 | Portales | Padres: 100% → "100% backend, 57% pages (4 of 7 flujos)" | MAJOR | Actualizar |
| 3 | Metricas Backend | Tests: 833 passing → 2324 (2296+28 skipped) | MAJOR | Actualizar |
| 4 | Metricas Frontend | Hooks: 134 → Necesita re-auditoria (probablemente ~92-134 segun criterio) | MAJOR | Investigar y corregir |
| 5 | Metricas Frontend | Routes: 74 → 71 | MAJOR | Actualizar |
| 6 | Metricas Frontend | API Calls Total: ~575 → ~580 | MINOR | Actualizar |

**NOTA IMPORTANTE sobre hooks y componentes:** La discrepancia en hooks (134 vs ~92) depende de la metodologia de conteo. El valor 134 puede incluir re-exports, barrel files, y hooks en archivos no-hook. Una re-auditoria manual con criterio unificado es necesaria antes de cambiar el numero. Por ahora, se recomienda agregar una nota aclaratoria en CLAUDE.md sin cambiar el valor hasta que se defina la metodologia.

---

*Auditoria CLAUDE.md completada — 6 errores identificados (3 MAJOR, 2 MAJOR pendientes de metodologia, 1 MINOR)*
