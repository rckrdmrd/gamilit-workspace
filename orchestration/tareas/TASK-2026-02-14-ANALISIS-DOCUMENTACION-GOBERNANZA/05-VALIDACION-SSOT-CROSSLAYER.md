# 05 - VALIDACION SSOT CROSS-LAYER

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fase:** 5
**Fecha:** 2026-02-14

---

## Tabla de Coherencia: Database

| Metrica | CLAUDE.md | MASTER_INV | CONTEXT-MAP | _MAP.md | DB_INV | DDL Real | MEMORY runtime |
|---------|-----------|------------|-------------|---------|--------|----------|---------------|
| Schemas | 18 | 18 | 18 | 18 | 18 | 18 | -- |
| Tablas | **169** | **169** | **169** | **169** | 171 | **169** | 163 |
| Triggers | **67** | **67** | **67** | **67** | 126 | **66** | 67 |
| RLS Policies | **207** | **207** | **207** | -- | 263 | **207** | 203 |
| Funciones | 183/249 | 183 | 249 | 183/249 | 183 | ~183 | 249 |
| Views | 22 | 22 | -- | 22 | 22 | -- | 16 |
| MVs | 7 | 7 | -- | -- | 7 | 7 | 4 |
| FKs | 298 | 298 | -- | -- | 298 | -- | 268 |
| ENUMs | 42 | 42 | 42 | 42 | 42 | -- | 42 |

**Estado post-correccion:** CLAUDE.md, MASTER_INV, CONTEXT-MAP y _MAP.md ahora coherentes para tablas, triggers, RLS.
**Pendiente:** DATABASE_INVENTORY.yml aun tiene valores stale (171 tablas, 126 triggers, 263 RLS).

---

## Tabla de Coherencia: Backend

| Metrica | CLAUDE.md | MASTER_INV | _MAP.md | BE_INV |
|---------|-----------|------------|---------|--------|
| Modulos | 22 | 22 | 22 | 22 |
| Entities | 152 | 152 | 152 | 152 |
| Services | 170 | 170 | 170 | 170 |
| Controllers | 107 | 107 | 107 | 107 |
| Endpoints | 899 | 899 | 899 | 899 |
| Guards | 15 | 15 | 15 | 15 |

**Estado:** 100% coherente entre todas las fuentes.

## Tabla de Coherencia: Frontend

| Metrica | CLAUDE.md | MASTER_INV | _MAP.md | FE_INV |
|---------|-----------|------------|---------|--------|
| Componentes | 475 | 475 | 475 | 475 |
| Hooks | 102 | 102 | 102 | 102 |
| Paginas | 68 | 68 | 68 | 68 |
| Stores | 14 | 14 | 14 | 14 |
| API Files | 52 | 52 | -- | 52 |
| Routes | 70 | 70 | 70 | 70 |

**Estado:** 100% coherente entre todas las fuentes (pero routes reales = 72, drift menor).

---

## DDL → Entity Gap Analysis

| Concepto | Valor |
|----------|-------|
| Tablas DDL | 169 |
| Entity classes | 153 |
| Tablas con entity | 153 |
| Tablas DDL-only | 16 (todas en data_warehouse) |
| Cobertura real | 90.5% |
| Cobertura reclamada DB_INV | "87%" — INCORRECTO |
| gap_justificado reclamado | "16 DW + 6 infrastructure" — los 6 no se substantian |

**Las 16 tablas DDL-only (data_warehouse):**
`dim_achievement`, `dim_date`, `dim_event_type`, `dim_exercise`, `dim_module`, `dim_student`, `dim_teacher`, `dim_time`, `etl_extraction_logs`, `etl_load_log`, `fact_daily_progress`, `fact_exercise_completions`, `fact_gamification_events`, `fact_teacher_metrics`, `ml_model_weights`, `ml_prediction_logs`

---

## Root Cause de Errores Metricos

| Patron de Error | Metricas Afectadas | Explicacion |
|-----------------|-------------------|-------------|
| Double-counting | RLS (418) | Sumaron ALTER TABLE ENABLE RLS + CREATE POLICY |
| Wrong object type | Triggers (126) | Contaron trigger functions, no CREATE TRIGGER |
| File count vs table count | Tablas (171) | No ajustaron por MV file (-1) ni multi-table files (+2) |
| Methodology diff | Funciones (183 vs 249) | DDL source vs PostgreSQL runtime — ambos validos |
| Stale propagation | Multiple | CONTEXT-MAP actualizado pero no propagado a otros |

---

## Correcciones Realizadas (15)

Aplicadas directamente en CLAUDE.md, MASTER_INVENTORY.yml, CONTEXT-MAP.yml, y _MAP.md.
Ver detalle en `03-MAPEO-CODIGO-INVENTARIOS.md`.

## Correcciones Pendientes (12)

Requieren actualizacion de DATABASE_INVENTORY.yml y BACKEND_INVENTORY.yml individual.
Ver tabla en `03-MAPEO-CODIGO-INVENTARIOS.md`.

---

*Auditoria completada 2026-02-14 — Fase 5 ANALYSIS*
