---
task_id: TASK-2026-03-03-DOC-COMPREHENSIVE-REMEDIATION
title: "Auditoría y Remediación Comprehensiva de Documentación"
date: 2026-03-03
status: in_progress
scope: docs-only
estimated_files: 35-40
---

# Auditoría y Remediación Comprehensiva de Documentación

## Gaps Identificados

| Gap ID | Severidad | Descripción |
|--------|-----------|-------------|
| MODULES-ARCH | CRITICO | MODULES-ARCHITECTURE.md métricas obsoletas |
| GAP-1 | MEDIO | BoostController no documentado en specs |
| GAP-2 | MEDIO | Boost/XP gap comportamental no documentado |
| GAP-3 | BAJO | SPEC-GAMIFICATION rutas stale |
| GAP-4 | BAJO | ET-GAM-010 endpoints inexistentes |
| GAP-7 | MEDIO | "30 mecánicas" en 11 docs (real: 29) |
| GAP-8 | INFO | Boost expiration on-read no documentado |
| GAP-9 | INFO | SPEC-EXERCISES GAPs pendientes |
| SIMCO-ADR | MEDIO | 0 refs ADRs gobernanza en SIMCO |
| SIMCO-EST | MEDIO | SIMCO-ESTANDARES dice 16 (real: 37) |
| SIMCO-VAL | BAJO | SIMCO-VALIDACION métricas stale |
| ADR-IDX | BAJO | _INDEX dice 47 ADRs (real: 48) |
| SCHEMA-HDR | MEDIO | 04-gamification header dice 27 tablas (real: 21) |
| GAP-6 | BAJO | Admin pages 18 vs 19 |

## Fases

- Fase 0: Setup + Baseline ✅
- Fase 1: Correcciones CRITICAS (3 paralelo)
- Fase 2: Gobernanza & Cross-Refs (3 paralelo)
- Fase 3: Métricas Stale (4 paralelo)
- Fase 4: Fixes Administrativos (2 paralelo)
- Fase 5: Inventory Updates (2 paralelo)
- Fase 6: Validación Final
