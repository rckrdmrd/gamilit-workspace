# User Stories — EPIC-GAM-F4-VALIDATION

> Indice de historias de usuario para la validacion integral de gamilit.

---

## F0 — Environment Setup

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-001](US-VAL-001/US-VAL-001.md) | Environment Setup | 8 | 5 | Pendiente |

## F1 — Database Integrity

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-002](US-VAL-002/US-VAL-002.md) | Database Integrity | 13 | 6 | Pendiente |

## F2 — Backend API Smoke

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-003](US-VAL-003/US-VAL-003.md) | Backend API Smoke | 13 | 5 | Pendiente |

## F3 — Frontend Portal Load

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-004](US-VAL-004/US-VAL-004.md) | Frontend Portal Load | 13 | 5 | Pendiente |

## F4a — User Lifecycle Integration

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-005](US-VAL-005/US-VAL-005.md) | User Lifecycle Integration | 8 | 4 | Pendiente |

## F4b — Exercise Submission Integration

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-006](US-VAL-006/US-VAL-006.md) | Exercise Submission Integration | 13 | 4 | Pendiente |

## F4c — Gamification Mechanics

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-007](US-VAL-007/US-VAL-007.md) | Gamification Mechanics | 13 | 8 | Pendiente |

## F4d — DB-Backend Coherence Audit

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-008](US-VAL-008/US-VAL-008.md) | DB-Backend Coherence Audit | 5 | 3 | Pendiente |

## F5 — Documentation

| US ID | Titulo | SP | Tasks | Estado |
|-------|--------|----|-------|--------|
| [US-VAL-009](US-VAL-009/US-VAL-009.md) | Findings Documentation | 3 | 4 | Pendiente |

---

## Resumen

| Fase | US | Tasks | SP |
|------|-----|-------|----|
| F0 | 1 | 5 | 8 |
| F1 | 1 | 6 | 13 |
| F2 | 1 | 5 | 13 |
| F3 | 1 | 5 | 13 |
| F4a | 1 | 4 | 8 |
| F4b | 1 | 4 | 13 |
| F4c | 1 | 8 | 13 |
| F4d | 1 | 3 | 5 |
| F5 | 1 | 4 | 3 |
| **Total** | **9** | **44** | **89** |

---

## Nota de Auditoria (2026-02-12)

> **IMPORTANTE:** Los criterios de aceptacion de US-VAL-002 (Database Integrity) usan metricas pre-auditoria que deben actualizarse con el baseline real verificado en TASK-2026-02-12-ANALISIS-BD-VS-DOCS:
>
> | Metrica | Valor en US | Valor Real Correcto |
> |---------|-------------|---------------------|
> | Tablas | 147/170 | **171** |
> | FKs | 299 | **298** |
> | RLS Policies | 282 | **263** |
> | ENUMs | 36 | **42** |
> | Funciones | 128/255 | **183** |
> | Triggers | 49/132 | **126** |
> | PostgreSQL | 16 (en algunos docs) | **15** |
>
> **Referencia:** `orchestration/inventarios/DATABASE_INVENTORY.yml` (v8.0.0)

---

*Actualizado: 2026-02-12 | EPIC-GAM-F4-VALIDATION*
