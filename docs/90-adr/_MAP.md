# _MAP: docs/90-adr/

**Ultima actualizacion:** 2026-02-14
**Estado:** Activo
**Version:** 4.0.0
**Proposito:** Architecture Decision Records

---

## Proposito

Registro de todas las decisiones arquitectonicas importantes del proyecto GAMILIT.

**Formato:** ADR-{NNN}-{titulo}.md

**Audiencia:** Tech Leads, Arquitectos, Product Owner

---

## Nota sobre Numeracion

Los ADRs tienen gaps en numeracion por decisiones deprecadas o no finalizadas:
- ADR-006: Nunca creado
- ADR-024, ADR-025: Reservados para uso futuro

Los ADRs NO se renumeran para mantener estabilidad de referencias.

---

## Contenido

### ADRs (40 total)

#### Fundamentos y Arquitectura (001-005)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-001 | Sistema de Gamificacion con Tematica de Cultura Maya | Accepted | Architecture |
| ADR-002 | Socket.IO para Interacciones en Tiempo Real | Accepted | Architecture |
| ADR-003 | Row-Level Security (RLS) para Multi-tenancy | Accepted | Architecture |
| ADR-004 | Arquitectura Modular del Exercise Engine (23 Tipos) | Accepted | Architecture |
| ADR-005 | Migracion de Documentacion workspace-v2 a workspace-arch | Accepted | Architecture |

#### Base de Datos (007-012, 016, 027, 033, 043)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-007 | Schemas de Base de Datos Sin Tablas | Accepted | Database |
| ADR-008 | Sistema Dual exercise_type + Categorias Pedagogicas | Accepted | Database |
| ADR-009 | Duracion del Ejercicio 3.4 - Podcast Argumentativo | Accepted | Content Design |
| ADR-010 | DocumentoDeDiseno como Fuente de Verdad | Accepted | Architecture |
| ADR-012 | Inicializacion Automatica de Usuarios mediante Trigger | Accepted | Database |
| ADR-016 | Simplificar Backend XP - Delegar Promocion a Trigger DB | Accepted | Backend |
| ADR-027 | Mapeo de Triggers de Misiones | Accepted | Database |
| ADR-033 | Expansion de Schemas de 8 a 18 | Accepted | Database |
| ADR-043 | Consolidacion de Base de Datos GAMILIT | Accepted | Database |

#### Frontend (011, 013-015, 019-021, 029-030)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-011 | Estructura de API Clients en Frontend | Accepted | Frontend |
| ADR-013 | Adopcion de React Query (TanStack Query v5) | Accepted | Frontend |
| ADR-014 | Nil-Safety Patterns con Optional Chaining | Accepted | Frontend |
| ADR-015 | Centralizacion de Rutas API en apiConfig.ts | Accepted | Frontend |
| ADR-019 | Adopcion de Zod v3 para Runtime Validation | Accepted | Frontend |
| ADR-020 | Multiples Alternativas en Completar Espacios | Accepted | Database |
| ADR-021 | Estandarizacion de Recompensas XP | Accepted | Gamification |
| ADR-029 | Consolidacion de TeacherResourcesPage | Accepted | Frontend |
| ADR-030 | Convencion de Nombres de Paginas | Accepted | Frontend |

#### Portales (017, 028, 031-032)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-017 | Admin Portal Avanzado vs Alcance Inicial | Accepted | Architecture |
| ADR-028 | Sistema de Roles Hibrido (ENUM + RBAC) | Accepted | Architecture |
| ADR-031 | Portal de Padres (Parent Portal) | Accepted | Portals |
| ADR-032 | Parent Notifications Integration | Accepted | Portals |

#### Deuda Tecnica y Mantenimiento (018, 022-023)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-018 | Eliminacion de Carpetas Migrations | Accepted | Maintenance |
| ADR-022 | Eliminacion de CHANGELOG.md y deuda-tecnica/ | Accepted | Maintenance |
| ADR-023 | Consolidacion Tecnica ETC-001 | Accepted | Maintenance |

#### Gobernanza y Orchestration (026, 034-042)

| ADR | Titulo | Estado | Categoria |
|-----|--------|--------|-----------|
| ADR-026 | Estructura Modular SIMCO v2 | Accepted | Documentation |
| ADR-034 | Jerarquia Anidada Profunda para Documentacion | Accepted | Documentation |
| ADR-035 | Sistema SAAD (Activacion Automatica de Directivas) | Accepted | Governance |
| ADR-036 | Sistema NEXUS v4.1 (Gestion de Contexto) | Accepted | Governance |
| ADR-037 | Gobernanza de Tareas con Ciclo CAPVED | Accepted | Governance |
| ADR-038 | Estructura Canonica del Directorio apps/ | Accepted | Architecture |
| ADR-039 | SSOT - Documentacion del Producto en el Proyecto | Accepted | Governance |
| ADR-040 | Adopcion de Arquitectura Monorepo | Accepted | Architecture |
| ADR-041 | Implementacion del Sistema SIMCO | Accepted | Governance |
| ADR-042 | Team vs Guild Terminology | Accepted | Social Features |

**Total ADRs:** 40 | **Numeros libres:** 006, 024, 025

---

## Distribucion por Categoria

| Categoria | Cantidad | ADRs |
|-----------|----------|------|
| Architecture | 8 | 001, 002, 003, 004, 005, 010, 017, 028, 038, 040 |
| Database | 6 | 007, 008, 012, 020, 027, 033, 043 |
| Frontend | 6 | 011, 013, 014, 015, 019, 029, 030 |
| Governance | 4 | 035, 036, 037, 039, 041 |
| Documentation | 2 | 026, 034 |
| Maintenance | 3 | 018, 022, 023 |
| Backend | 1 | 016 |
| Gamification | 1 | 021 |
| Social Features | 1 | 042 |
| Content Design | 1 | 009 |
| Portals | 2 | 031, 032 |

---

## Interdependencias

### Esta Carpeta Alimenta A:

- **docs/20-architecture/** - Decisiones arquitectonicas
- **Desarrolladores** - Contexto de decisiones
- **docs/50-guides/** - Guias de implementacion

---

## Proximos ADRs Disponibles

Numeros disponibles para nuevos ADRs: **ADR-006**, **ADR-024**, **ADR-025**, **ADR-044+**

---

**Generado:** 2025-11-07
**Ultima consolidacion:** 2026-02-14 (40 ADRs documentados)
**Version:** 4.0.0
