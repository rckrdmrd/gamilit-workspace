---
id: "US-VAL-002"
title: "Database Integrity"
type: "User Story"
status: "Pendiente"
priority: "Alta"
epic: "EPIC-GAM-F4-VALIDATION"
story_points: 13
sprint: "Sprint-15"
created_date: "2026-02-10"
updated_date: "2026-02-10"
---

# US-VAL-002: Database Integrity

**Epica:** EPIC-GAM-F4-VALIDATION — Validacion Integral
**Sprint:** Sprint 15 | **SP:** 13 | **Prioridad:** Alta | **Estado:** Pendiente

---

## Descripcion

**Como** DBA
**Quiero** validar la integridad de la base de datos recreada (schemas, FKs, RLS, triggers, seeds, enums)
**Para** asegurar que la estructura DDL es coherente y funcional

## Criterios de Aceptacion

### CA-01: Schemas y Tablas
Exactamente 18 schemas y 173 tablas

### CA-02: Foreign Keys
301 FKs validadas, 0 referencias huerfanas

### CA-03: RLS Policies
251 RLS policies activas y funcionando

### CA-04: Triggers
4 triggers disparan correctamente en cascada (INSERT profile → 15 inserts automaticos)

### CA-05: Seed Data
0 orphan records, conteos correctos

### CA-06: Enums
42 ENUMs DDL coinciden con entities TypeScript, 0 mismatches

## Tasks

| Task | Titulo | Subtipo |
|------|--------|---------|
| [TASK-VAL-002-F1-DATABASE](TASK-VAL-002-F1-DATABASE.md) | Query schemas + tables count | Schemas |
| [TASK-VAL-002-F1-DATABASE-FKS](TASK-VAL-002-F1-DATABASE-FKS.md) | Validar FKs + constraints | FKs |
| [TASK-VAL-002-F1-DATABASE-RLS](TASK-VAL-002-F1-DATABASE-RLS.md) | Validar RLS policies | RLS |
| [TASK-VAL-002-F1-DATABASE-TRIGGERS](TASK-VAL-002-F1-DATABASE-TRIGGERS.md) | Test trigger cascade | Triggers |
| [TASK-VAL-002-F1-DATABASE-SEEDS](TASK-VAL-002-F1-DATABASE-SEEDS.md) | Integridad seed data | Seeds |
| [TASK-VAL-002-F1-DATABASE-ENUMS](TASK-VAL-002-F1-DATABASE-ENUMS.md) | Comparar ENUMs DDL vs TS | Enums |

---

*Actualizado: 2026-02-10*
