# Architecture Decision Records (ADRs) - GAMILIT

Registro de decisiones arquitectonicas del proyecto.

---

## ADRs Documentados

### ADRs Arquitectonicos (workspace-arch)
| ADR | Titulo | Estado | Fecha |
|-----|--------|--------|-------|
| [ADR-001](ADR-001-gamificacion-maya.md) | Sistema de gamificacion con tematica de cultura maya | Aceptada | 2025-08-15 |
| [ADR-002](ADR-002-socket-io-realtime.md) | Socket.IO para interacciones en tiempo real | Aceptada | 2025-08-20 |
| [ADR-003](ADR-003-rls-multitenancy.md) | RLS multi-tenancy para aislamiento de escuelas | Aceptada | 2025-08-18 |
| [ADR-004](ADR-004-modular-exercise-engine.md) | Arquitectura modular del exercise engine (23 tipos) | Aceptada | 2025-09-01 |

### ADRs Migrados (workspace-v2, todos vigentes)
| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-040](ADR-040-monorepo-architecture.md) | Adopcion de Arquitectura Monorepo | Aceptada |
| [ADR-041](ADR-041-simco-system.md) | Implementacion del Sistema SIMCO | Aceptada |
| [ADR-042](ADR-042-team-vs-guild.md) | Team vs Guild Terminology | Aceptada |
| [ADR-007](ADR-007-schemas-sin-tablas.md) | Schemas de BD Sin Tablas | Aceptada |
| [ADR-008](ADR-008-sistema-dual-exercise-mechanics.md) | Sistema Dual exercise_type + Categorias Pedagogicas | Aceptada |
| [ADR-009](ADR-009-duracion-podcast-ejercicio-3-4.md) | Duracion Ejercicio 3.4 Podcast | Aceptada |
| [ADR-010](ADR-010-documento-diseno-fuente-verdad.md) | DocumentoDeDiseño como Fuente de Verdad | Aceptada |
| [ADR-011](ADR-011-frontend-api-client-structure.md) | Estructura API Clients Frontend | Aceptada |
| [ADR-012](ADR-012-automatic-user-initialization-trigger.md) | Inicializacion Automatica Usuarios (Trigger) | Aceptada |
| [ADR-013](ADR-013-react-query-adoption.md) | Adopcion React Query v5 | Aceptada |
| [ADR-014](ADR-014-nil-safety-patterns.md) | Nil-Safety Patterns | Aceptada |
| [ADR-015](ADR-015-centralized-api-routes-configuration.md) | Centralizacion Rutas API | Aceptada |
| [ADR-016](ADR-016-simplificar-backend-xp-acumulacion.md) | Simplificar Backend XP → DB Trigger | Aceptada |
| [ADR-017](ADR-017-admin-portal-avanzado-vs-alcance-inicial.md) | Admin Portal Avanzado vs Alcance Inicial | Aceptada |
| [ADR-018](ADR-018-removal-migrations-folders.md) | Eliminacion Carpetas Migrations (Clean Load) | Aceptada |
| [ADR-019](ADR-019-runtime-validation-zod.md) | Adopcion Zod v3 Runtime Validation | Aceptada |
| [ADR-020](ADR-020-validacion-alternativas-ejercicio-completar-espacios.md) | Multiples Alternativas Completar Espacios | Aceptada |
| [ADR-021](ADR-021-estandarizacion-recompensas-xp-ejercicios.md) | Estandarizacion Recompensas XP | Aceptada |
| [ADR-022](ADR-022-eliminacion-changelog-deuda-tecnica.md) | Eliminacion Changelog Deuda Tecnica | Aceptada |
| [ADR-023](ADR-023-consolidacion-tecnica-etc-001.md) | Consolidacion Tecnica ETC-001 | Aceptada |
| [ADR-026](ADR-026-simco-v2-estructura-modular.md) | SIMCO v2 Estructura Modular | Aceptada |
| [ADR-027](ADR-027-missions-triggers-mapping.md) | Missions Triggers Mapping | Aceptada |
| [ADR-028](ADR-028-roles-system-hybrid-design.md) | Roles System Hybrid Design | Aceptada |
| [ADR-029](ADR-029-consolidacion-teacher-resources.md) | Consolidacion Teacher Resources | Aceptada |
| [ADR-030](ADR-030-convencion-nombres-paginas.md) | Convencion Nombres Paginas | Aceptada |
| [ADR-031](ADR-031-portal-parent.md) | Portal Parent | Aceptada |
| [ADR-032](ADR-032-parent-notifications-integration.md) | Parent Notifications Integration | Aceptada |
| [ADR-033](ADR-033-expansion-schemas-8-to-18.md) | Expansion Schemas 8→18 | Aceptada |
| [ADR-043](ADR-043-consolidacion-bd.md) | Consolidacion BD 2026-01-07 | Aceptada |
| [ADR-044](ADR-044-test-coverage-strategy.md) | Estrategia Test Coverage (50% enforced, 80% aspiracional) | Aceptada |
| [ADR-045](ADR-045-clean-architecture-pragmatica.md) | Clean Architecture Pragmatica (incremental, domain errors first) | Aceptada |

---

## Formato

Cada ADR sigue el formato:

```markdown
# ADR-XXX: Titulo

**Fecha:** YYYY-MM-DD
**Estado:** Aceptada / Rechazada / Deprecated
**Contexto:** Descripcion del problema
**Decision:** Decision tomada
**Consecuencias:** Impacto de la decision
**Alternativas Consideradas:** Otras opciones evaluadas
```

---

*GAMILIT - Architecture Decision Records*
