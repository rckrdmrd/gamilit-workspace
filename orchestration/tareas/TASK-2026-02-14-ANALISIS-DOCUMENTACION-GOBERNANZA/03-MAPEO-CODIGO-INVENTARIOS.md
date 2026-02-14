# 03 - MAPEO CODIGO ↔ INVENTARIOS

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fase:** 3
**Fecha:** 2026-02-14

---

## Tabla de Comparacion de Metricas

| Metrica | CLAUDE.md | MASTER_INV | Inventario Individual | Codigo Real | Discrepancia |
|---------|-----------|------------|----------------------|-------------|--------------|
| **DATABASE** | | | | | |
| Schemas | 18 | 18 | 18 | 18 dirs | NO |
| Tablas | 169 | ~~171~~ 169 | ~~171~~ 169 | 169 | CORREGIDO |
| RLS Policies | ~~418~~ 207 | ~~263~~ 207 | ~~263~~ 207 | 207 DDL | CORREGIDO |
| Triggers | ~~126~~ 67 | ~~126~~ 67 | ~~126~~ 67 | 66-67 | CORREGIDO |
| Views | 22 | 22 | 22 | ~22 | NO |
| Materialized Views | 7 | 7 | 7 | 7 | NO |
| Funciones | 183/249 | 183 | 183 | 183 DDL / 249 runtime | CLARIFICADO |
| Foreign Keys | 298 | 298 | 298 | ~268 runtime | VERIFICAR |
| ENUMs | 42 | 42 | 42 | 42 | NO |
| **BACKEND** | | | | | |
| Modulos | 22 | 22 | 22 | 22 dirs | NO |
| Entities | 152 | 152 | 152 | 152 files (153 @Entity) | NO |
| Services | 170 | 170 | 170 | 170 @Injectable | NO |
| Controllers | 107 | 107 | 107 | 107 @Controller | NO |
| Endpoints | 899 | 899 | 899 | ~899 | NO |
| Guards | 15 | 15 | 15 | 15 | NO |
| Interceptors | 5 | 5 | 5 | 6 (tracing.interceptor.ts nuevo) | DRIFT |
| Spec files | 57 | 57 | 57 | 59 | DRIFT |
| **FRONTEND** | | | | | |
| Componentes | 475 | 475 | 475 | ~455-460 est. | RECONTEO |
| Hooks | 102 | 102 | 102 | ~103 | CERCANO |
| Paginas | 68 | 68 | 68 | 67 | CERCANO |
| Stores Zustand | 14 | 14 | 14 | 14 | NO |
| API Files | 52 | 52 | 52 | ~52 | NO |
| Routes | 70 | 70 | 70 | 72 | DRIFT |

---

## Validacion Backend por Modulo

Los 22 modulos validados — entity/service/controller counts coinciden excepto:
- **health:** 2 services reales vs 1 reclamado (metrics.service.ts agregado, untracked)

## Validacion Database por Schema

18 schemas validados — todos los directorios existen. Discrepancias:
- **communication:** Inventario reclama 4 tablas, reales son 3
- **admin_dashboard:** Inventario reclama 4 tablas, reales son 3 (01-materialized_views.sql no es tabla)

## DDL → Entity Gap Analysis

| Metrica | Valor |
|---------|-------|
| Tablas DDL | 169 |
| Entity files | 152 |
| @Entity classes | 153 |
| Tablas con entity | 153 |
| Tablas sin entity | 16 (todas en data_warehouse — intencional) |
| Cobertura | 90.5% (no 87% como reclamaba inventario) |

---

## Correcciones Aplicadas en Esta Sesion

| Archivo | Metrica | Antes | Despues |
|---------|---------|-------|---------|
| CLAUDE.md | RLS | 418 | 207 |
| CLAUDE.md | Triggers | 126 | 67 |
| CLAUDE.md | RC2 text | "171 tablas" | "169 tablas, 153 entities, 16 DDL-only" |
| MASTER_INVENTORY | tablas | 171 | 169 |
| MASTER_INVENTORY | triggers | 126 | 67 |
| MASTER_INVENTORY | rls_policies | 263 | 207 |
| MASTER_INVENTORY | coherencia | 89.5% | 90.5% |
| CONTEXT-MAP | rls_policies | 418 | 207 |
| CONTEXT-MAP | tablas | 170 | 169 |
| CONTEXT-MAP | triggers | 132 | 67 |
| CONTEXT-MAP | endpoints | 850 | 899 |
| CONTEXT-MAP | enums | 41 | 42 |
| _MAP.md | tablas | 171 | 169 |
| _MAP.md | triggers | 126 | 67 |

## Correcciones Pendientes (No Aplicadas)

| Archivo | Metrica | Valor Actual | Valor Correcto | Prioridad |
|---------|---------|--------------|----------------|-----------|
| BACKEND_INVENTORY | interceptors | 5 | 6 | P1 |
| BACKEND_INVENTORY | health services | 1 | 2 | P1 |
| BACKEND_INVENTORY | spec files | 57 | 59 | P2 |
| DATABASE_INVENTORY | rls_policies | 263 | 207 | P0 |
| DATABASE_INVENTORY | triggers | 126 | 67 | P0 |
| DATABASE_INVENTORY | tablas | 171 | 169 | P1 |
| DATABASE_INVENTORY | communication tables | 4 | 3 | P1 |
| DATABASE_INVENTORY | admin_dashboard tables | 4 | 3 | P1 |
| DATABASE_INVENTORY | tablas_sin_entity | 22 | 16 | P1 |
| DATABASE_INVENTORY | cobertura | "87%" | "90.5%" | P1 |
| FRONTEND_INVENTORY | routes | 70 | 72 | P2 |
| FRONTEND_INVENTORY | total .tsx | 517 | ~497 | P2 |

---

*Auditoria completada 2026-02-14 — Fase 3 ANALYSIS*
