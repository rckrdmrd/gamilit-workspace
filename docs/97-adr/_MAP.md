# _MAP: docs/97-adr/

**Última actualización:** 2025-11-29
**Estado:** 🟢 Activo
**Versión:** 3.0
**Propósito:** Architecture Decision Records

---

## 📋 Propósito de esta Carpeta

Registro de todas las decisiones arquitectónicas importantes del proyecto GAMILIT.

**Formato:** ADR-{NUM}-{título}.md

**Audiencia:** Tech Leads, Arquitectos, Product Owner

---

## 📁 Contenido

### ADRs Implementados (19)

| ADR | Título | Estado | Categoría |
|-----|--------|--------|-----------|
| **ADR-0001** | Monorepo Architecture | ✅ Implemented | Architecture |
| **ADR-0002** | Sistema SIMCO (_MAP.md) | ✅ Implemented | Documentation |
| **ADR-0003** | Team vs Guild | ✅ Implemented | Social Features |
| **ADR-007** | Schemas sin Tablas | ✅ Accepted | Database |
| **ADR-008** | Sistema Dual exercise_type | ✅ Implemented | Database |
| **ADR-009** | Duración Podcast Ejercicio 3.4 | ✅ Implemented | Content Design |
| **ADR-010** | Documento Diseño Fuente Verdad | ✅ Accepted | Architecture |
| **ADR-011** | Frontend API Client Structure | ✅ Accepted | Frontend |
| **ADR-012** | Automatic User Initialization Trigger | ✅ Implemented | Database |
| **ADR-013** | React Query Adoption | ✅ Implemented | Frontend |
| **ADR-014** | Nil-Safety Patterns | ✅ Accepted | Frontend |
| **ADR-015** | Centralized API Routes | ✅ Implemented | Frontend |
| **ADR-016** | Simplificar Backend XP | ✅ Implemented | Backend |
| **ADR-017** | Admin Portal Avanzado | ✅ Accepted | Architecture |
| **ADR-018** | Removal Migrations Folders | ✅ Accepted | Database |
| **ADR-019** | Runtime Validation Zod | ✅ Accepted | Frontend |
| **ADR-020** | Validación Alternativas Fill-in-Blank | ✅ Implemented | Database |
| **ADR-021** | Estandarización Recompensas XP | ✅ Implemented | Gamification |
| **ADR-026** | SIMCO v2 Estructura Modular | ✅ Accepted | Documentation |

**Total ADRs:** 19 implementados/aceptados

**Estado:** 🟢 Sistema activo y consolidado

---

## 📊 Distribución por Categoría

| Categoría | Cantidad | ADRs |
|-----------|----------|------|
| **Architecture** | 4 | 0001, 0002, 010, 017 |
| **Database** | 5 | 007, 008, 012, 018, 020 |
| **Frontend** | 5 | 011, 013, 014, 015, 019 |
| **Documentation** | 2 | 0002, 026 |
| **Backend** | 1 | 016 |
| **Gamification** | 1 | 021 |
| **Social Features** | 1 | 0003 |
| **Content Design** | 1 | 009 |

---

## 🔗 Interdependencias

### Esta Carpeta Alimenta A:

- **docs/02-especificaciones-tecnicas/** - Decisiones técnicas
- **Desarrolladores** - Contexto de decisiones
- **docs/95-guias-desarrollo/** - Guías de implementación

---

## 🎯 Próximos ADRs Disponibles

Números disponibles para nuevos ADRs: **ADR-022**, **ADR-023**, **ADR-024**, **ADR-025**, **ADR-027+**

---

**Generado:** 2025-11-07
**Última consolidación:** 2025-11-29 (19 ADRs documentados)
**Versión:** 3.0.0
