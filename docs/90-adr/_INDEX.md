---
titulo: "90 - Architecture Decision Records (ADRs)"
tipo: indice
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-03-03"
estado: activo
---

# 90 - Architecture Decision Records (ADRs)

> Registro de Decisiones de Arquitectura del proyecto GAMILIT.
> Formato canonico: `ADR-NNN-lowercase-hyphen.md`

---

## Indice Completo (49 ADRs)

### Fundamentos y Arquitectura (001-005)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-001](./ADR-001-gamificacion-maya.md) | Sistema de Gamificacion con Tematica de Cultura Maya | Accepted |
| [ADR-002](./ADR-002-socket-io-realtime.md) | Socket.IO para Interacciones en Tiempo Real | Accepted |
| [ADR-003](./ADR-003-rls-multitenancy.md) | Row-Level Security (RLS) para Multi-tenancy | Accepted |
| [ADR-004](./ADR-004-modular-exercise-engine.md) | Arquitectura Modular del Exercise Engine (23 Tipos) | Accepted |
| [ADR-005](./ADR-005-migracion-v2-a-arch.md) | Migracion de Documentacion workspace-v2 a workspace-arch | Accepted |

### Base de Datos (007-012, 016, 027, 033)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-007](./ADR-007-schemas-sin-tablas.md) | Schemas de Base de Datos Sin Tablas | Accepted |
| [ADR-008](./ADR-008-sistema-dual-exercise-mechanics.md) | Sistema Dual exercise_type + Categorias Pedagogicas | Accepted |
| [ADR-009](./ADR-009-duracion-podcast-ejercicio-3-4.md) | Duracion del Ejercicio 3.4 - Podcast Argumentativo | Accepted |
| [ADR-010](./ADR-010-documento-diseno-fuente-verdad.md) | DocumentoDeDiseno como Fuente de Verdad | Accepted |
| [ADR-012](./ADR-012-automatic-user-initialization-trigger.md) | Inicializacion Automatica de Usuarios mediante Trigger | Accepted |
| [ADR-016](./ADR-016-simplificar-backend-xp-acumulacion.md) | Simplificar Backend XP - Delegar Promocion a Trigger DB | Accepted |
| [ADR-027](./ADR-027-missions-triggers-mapping.md) | Mapeo de Triggers de Misiones | Accepted |
| [ADR-033](./ADR-033-expansion-schemas-8-to-18.md) | Expansion de Schemas de 8 a 18 | Accepted |
| [ADR-043](./ADR-043-consolidacion-bd.md) | Consolidacion de Base de Datos GAMILIT | Accepted |

### Frontend (011, 013-015, 019-021, 029-030, 046)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-011](./ADR-011-frontend-api-client-structure.md) | Estructura de API Clients en Frontend | Amended |
| [ADR-013](./ADR-013-react-query-adoption.md) | Adopcion de React Query (TanStack Query v5) | Accepted |
| [ADR-014](./ADR-014-nil-safety-patterns.md) | Nil-Safety Patterns con Optional Chaining | Accepted |
| [ADR-015](./ADR-015-centralized-api-routes-configuration.md) | Centralizacion de Rutas API en apiConfig.ts | Accepted |
| [ADR-019](./ADR-019-runtime-validation-zod.md) | Adopcion de Zod v3 para Runtime Validation | Accepted |
| [ADR-020](./ADR-020-validacion-alternativas-ejercicio-completar-espacios.md) | Multiples Alternativas en Completar Espacios | Accepted |
| [ADR-021](./ADR-021-estandarizacion-recompensas-xp-ejercicios.md) | Estandarizacion de Recompensas XP | Accepted |
| [ADR-029](./ADR-029-consolidacion-teacher-resources.md) | Consolidacion de TeacherResourcesPage | Accepted |
| [ADR-030](./ADR-030-convencion-nombres-paginas.md) | Convencion de Nombres de Paginas — Sufijo "Page" | Amended |
| [ADR-046](./ADR-046-pageshell-pattern.md) | PageShell Pattern Replaces HOC Layout Wrappers | Accepted |

### Portales (017, 028, 031-032)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-017](./ADR-017-admin-portal-avanzado-vs-alcance-inicial.md) | Admin Portal Avanzado vs Alcance Inicial | Accepted |
| [ADR-028](./ADR-028-roles-system-hybrid-design.md) | Sistema de Roles Hibrido (ENUM + RBAC) | Accepted |
| [ADR-031](./ADR-031-portal-parent.md) | Portal de Padres (Parent Portal) | Accepted |
| [ADR-032](./ADR-032-parent-notifications-integration.md) | Parent Notifications Integration | Accepted |

### Deuda Tecnica y Mantenimiento (018, 022-023)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-018](./ADR-018-removal-migrations-folders.md) | Eliminacion de Carpetas Migrations | Accepted |
| [ADR-022](./ADR-022-eliminacion-changelog-deuda-tecnica.md) | Eliminacion de CHANGELOG.md y deuda-tecnica/ | Accepted |
| [ADR-023](./ADR-023-consolidacion-tecnica-etc-001.md) | Consolidacion Tecnica ETC-001 | Accepted |

### Gobernanza y Orchestration (026, 034-042)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-026](./ADR-026-simco-v2-estructura-modular.md) | Estructura Modular SIMCO v2 | Accepted |
| [ADR-034](./ADR-034-jerarquia-anidada-profunda.md) | Jerarquia Anidada Profunda para Documentacion | Accepted |
| [ADR-035](./ADR-035-sistema-saad.md) | Sistema SAAD (Activacion Automatica de Directivas) | Accepted |
| [ADR-036](./ADR-036-sistema-nexus.md) | Sistema NEXUS v4.1 (Gestion de Contexto) | Accepted |
| [ADR-037](./ADR-037-gobernanza-capved.md) | Gobernanza de Tareas con Ciclo CAPVED | Accepted |
| [ADR-038](./ADR-038-estructura-canonica-apps.md) | Estructura Canonica del Directorio apps/ | Accepted |
| [ADR-039](./ADR-039-ssot-docs-en-proyecto.md) | SSOT - Documentacion del Producto en el Proyecto | Accepted |
| [ADR-040](./ADR-040-monorepo-architecture.md) | Adopcion de Arquitectura Monorepo | Accepted |
| [ADR-041](./ADR-041-simco-system.md) | Implementacion del Sistema SIMCO | Accepted |
| [ADR-042](./ADR-042-team-vs-guild.md) | Team vs Guild Terminology | Accepted |

### Calidad y Arquitectura (044-049)

| ADR | Titulo | Estado |
|-----|--------|--------|
| [ADR-044](./ADR-044-test-coverage-strategy.md) | Estrategia de Test Coverage | Accepted |
| [ADR-045](./ADR-045-clean-architecture-pragmatica.md) | Clean Architecture Pragmatica | Accepted |
| [ADR-047](./ADR-047-state-architecture-zustand-react-query.md) | State Architecture — Zustand + React Query | Accepted |
| [ADR-048](./ADR-048-component-sharing-strategy.md) | Component Sharing Strategy | Accepted |
| [ADR-049](./ADR-049-confirm-dialog-consolidation.md) | ConfirmDialog Consolidation | Accepted |
| [ADR-050](./ADR-050-responsive-design-strategy.md) | Responsive Design Strategy | Accepted |
| [ADR-051](./ADR-051-vision-lectora-frontend-only.md) | Vision Lectora Frontend-Only CSS Scoped Implementation | Accepted |
| [ADR-052](./ADR-052-ml-coins-transaction-integrity.md) | ML Coins — Integridad Transaccional | Aceptada |

---

**Total:** 49 ADRs | **Numeros libres:** 006, 024, 025
