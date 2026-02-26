---
id: "US-VAL-008"
title: "DB-Backend Coherence Audit"
type: "User Story"
status: "Pendiente"
priority: "Media"
epic: "EPIC-GAM-F4-VALIDATION"
story_points: 5
sprint: "Sprint-16"
created_date: "2026-02-10"
updated_date: "2026-02-10"
---

# US-VAL-008: DB-Backend Coherence Audit

**Epica:** EPIC-GAM-F4-VALIDATION — Validacion Integral
**Sprint:** Sprint 16 | **SP:** 5 | **Prioridad:** Media | **Estado:** Pendiente

---

## Descripcion

**Como** architecture analyst
**Quiero** auditar la coherencia entre DB tables, backend entities, y API endpoints
**Para** identificar gaps y mismatches entre capas

## Criterios de Aceptacion

### CA-01: Table-Entity Mapping
173 tablas mapeadas a 156 entity files (157 classes), delta explicado (views, junction tables)

### CA-02: Column-Field Alignment
0 type mismatches entre columnas DB y campos entity

### CA-03: Endpoint Coverage
912 endpoints mapeados a controllers

## Tasks

| Task | Titulo | Capa |
|------|--------|------|
| [TASK-VAL-008-F4-AUDIT-TABLES](TASK-VAL-008-F4-AUDIT-TABLES/) | Table-Entity mapping | Tables |
| [TASK-VAL-008-F4-AUDIT-COLUMNS](TASK-VAL-008-F4-AUDIT-COLUMNS/) | Column-Field alignment | Columns |
| [TASK-VAL-008-F4-AUDIT-ENDPOINTS](TASK-VAL-008-F4-AUDIT-ENDPOINTS/) | Endpoint-Controller coverage | Endpoints |

---

*Actualizado: 2026-02-10*
