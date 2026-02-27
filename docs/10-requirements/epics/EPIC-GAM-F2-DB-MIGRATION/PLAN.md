# Plan de Desarrollo: EPIC-GAM-F2-DB-MIGRATION

**Version:** 1.0.0 | **Fecha:** 2026-02-10
**Epica:** [EPIC.md](./EPIC.md)
**SP Total:** 20
**Estado:** Completado

---

## Secuencia de Desarrollo

| Orden | Tarea | Descripcion | Dependencias | Sprint |
|-------|-------|-------------|-------------|--------|
| 1 | Esquema 44 tablas | Definicion DDL de las 44 tablas base del sistema | EPIC-GAM-F1-AUTH, EPIC-GAM-F1-CONFIG | S1 |
| 2 | Indices (Parte 1) | Indices primarios y de foreign key para integridad referencial | Esquema 44 tablas | S1 |
| 3 | Indices (Parte 2) | Indices de performance, compuestos y parciales | Indices Parte 1 | S2 |
| 4 | Scripts de instalacion | Scripts automatizados para crear BD desde cero | Esquema + Indices | S2 |
| 5 | Datos seed | Datos iniciales para desarrollo y testing | Scripts de instalacion | S2 |

## Notas

Esta epica no tiene User Stories formales. Se compone de 5 tareas tecnicas migradas desde el workspace v2 (EMR-001-migracion-bd). El contenido original incluye documentacion de esquema, indices y scripts de instalacion.

## Enfoque Tecnico
- **Stack:** PostgreSQL 15, bash scripts, DDL puro
- **Base de datos:** Schema `gamilit` con 18 schemas modulares
- **Patron:** Schema-per-module, RLS (Row Level Security) para multi-tenancy
- **Migracion:** Scripts idempotentes con verificacion de estado previo

## Estrategia de Testing
- **DDL:** Recreacion completa via unified-recreate-db.sh con --drop
- **Integridad:** Verificacion de foreign keys, constraints, enums
- **Seeds:** Validacion de datos iniciales consistentes entre ambientes

## Riesgos
| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Conflictos de esquema entre modulos | Media | Alto | Schema-per-module aislado |
| Performance de migracion con datos existentes | Baja | Medio | Scripts idempotentes, dry-run previo |
| Incompatibilidad de indices con queries complejas | Baja | Alto | EXPLAIN ANALYZE en queries criticas |

---

*Generado: 2026-02-10 | ADR-0020*
