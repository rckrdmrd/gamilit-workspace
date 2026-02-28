---
titulo: "Plan de Desarrollo: EPIC-GAM-F1-ADMIN"
tipo: plan
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# Plan de Desarrollo: EPIC-GAM-F1-ADMIN

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 50
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | US ID | Titulo | SP | Dependencias | Sprint |
|-------|-------|--------|----|-------------|--------|
| 1 | US-ADM-001 | Gestion aulas CRUD | 8 | F1-AUTH | Sprint 4 |
| 2 | US-ADM-002 | Gestion estudiantes aula | 8 | US-ADM-001 | Sprint 4 |
| 3 | US-ADM-005 | Gestion grupos | 5 | US-ADM-001 | Sprint 5 |
| 4 | US-ADM-006 | Configuracion basica aula | 5 | US-ADM-001 | Sprint 5 |
| 5 | US-ADM-004 | Asignacion modulos | 8 | US-ADM-001, F1-EXERCISES | Sprint 5 |
| 6 | US-ADM-003 | Dashboard maestro | 8 | US-ADM-001, US-ADM-002 | Sprint 6 |
| 7 | US-ADM-007 | Vista actividad aula | 8 | US-ADM-003, F1-ANALYTICS | Sprint 6 |

## Enfoque Tecnico
- **Stack:** NestJS 11 / TypeScript / PostgreSQL 15 / React 19 / Vite 6.x
- **Base de datos:** Schema `educational_content` (tablas classrooms, classroom_students, classroom_modules, groups)
- **Patron:** CRUD con validacion de pertenencia a tenant, multi-role access (teacher, admin)

## Estrategia de Testing
- **Unit:** classrooms.service, groups.service (Jest)
- **Integration:** /api/v1/classrooms/*, /api/v1/groups/* (supertest)
- **E2E:** Crear aula, agregar estudiantes, asignar modulos (Playwright)

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Conflictos de asignacion multi-maestro | Media | Medio | Ownership model claro, validacion en backend |
| Carga masiva de estudiantes | Media | Medio | Import CSV con validacion, batch processing |
| RLS entre maestros del mismo tenant | Baja | Alto | Policies especificas por classroom ownership |

---

*Generado: 2026-02-10 | ADR-0020*
