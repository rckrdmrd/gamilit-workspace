# 05 - SALUD DE ORQUESTACION

**Fecha:** 2026-02-25 | **Fase:** 5 | **Subagentes:** S-ORCH-01, S-ORCH-02

---

## Staleness

### PROJECT-STATUS.md
- **Fecha:** 2026-02-15 (10 dias stale)
- **Problemas:** Backend entities=141 (real=156), services=121 (real=172), controllers=65 (real=108), endpoints=750+ (real=912), components=398 (real=577)
- **Veredicto:** SIGNIFICATIVAMENTE STALE
- **Accion:** Regenerar desde MASTER_INVENTORY

### PROXIMA-ACCION.md
- **Fecha:** 2026-02-21 (4 dias stale)
- **Estado:** MAYORMENTE ACTUAL — items pendientes correctamente descritos
- **Faltante:** Cambios post-2026-02-21 (.env.production, serve.cjs, ecosystem.config.js)
- **Accion:** Agregar entrada para cambios recientes

### SPRINT-ACTUAL.yml
- **Sprint 1:** completado 2026-02-17 (14 dias antes de fecha planificada)
- **Sprint 2:** NO PLANIFICADO
- **Accion URGENTE:** Crear Sprint 2 para cubrir trabajo 2026-02-17 a presente

### BACKLOG.yml
- **Estado:** 5 EPICs (WS-004 a WS-008) marcados `en_progreso` pero TODOS sus items estan completados/deferred
- **Accion:** Marcar WS-005, WS-006, WS-007, WS-008 como `completado`. WS-004 como completado excepto MQ-010 (P3).

### Directivas SIMCO

| Directiva | Version | Fecha | Staleness |
|-----------|---------|-------|-----------|
| SIMCO-TAREA | 1.1.0 | 2025-12-08 | STALE (>2 meses) |
| SIMCO-DEPLOY-PRODUCTION | 1.0.0 | 2026-01-25 | MODERADAMENTE STALE (31 dias) |
| SIMCO-RECREAR-BD | 1.0.0 | 2026-02-11 | ACTUAL (modificado en working tree) |
| SIMCO-NORMALIZACION-DOCUMENTAL | 1.0.0 | 2026-02-13 | ACTUAL (modificado en working tree) |
| SIMCO-CONTEXT-MANAGEMENT-V2 | 2.3.0 | 2026-02-17 | ACTUAL |

### Work Items
- EPIC-GAM-FRONTEND/EPIC.yml: v2.0.0, 2026-02-07 — STALE (components=475 vs 577)
- EPIC-GAM-BACKEND/EPIC.yml: v3.0.0, 2026-02-07 — STALE (entities=152 vs 156, endpoints=899 vs 912)

---

## Resumen Staleness

| Estado | Archivos |
|--------|----------|
| Actual | 3 (SIMCO-CONTEXT-MGMT, SIMCO-RECREAR-BD, SIMCO-NORMALIZACION) |
| Moderadamente stale | 5 (PROXIMA-ACCION, BACKLOG epic states, SIMCO-DEPLOY, work items x2) |
| Significativamente stale | 4 (PROJECT-STATUS, SPRINT-ACTUAL, SIMCO-TAREA, BACKLOG epic flags) |

---

## Redundancia y Duplicados

### Pares Analizados

| # | Archivo A | Archivo B | Overlap | Recomendacion |
|---|-----------|-----------|---------|---------------|
| 1 | `orch/inventarios/TRACEABILITY_MATRIX.yml` | `docs/20-arch/TRACEABILITY-US-SCHEMAS.md` | 15% | **KEEP BOTH** (YAML agente vs MD humano) |
| 2 | `orch/DEPENDENCY-GRAPH.yml` (raiz) | `orch/inventarios/DEPENDENCY_GRAPH.yml` | 10% | **DELETE raiz** (v1.0 legacy multi-project) |
| 3 | `docs/00-overview/MODULOS.md` | `docs/00-overview/MODULOS-SISTEMA.md` | 60% | **DELETE MODULOS-SISTEMA.md** (stub 21 lineas) |
| 4 | `docs/00-overview/DEPLOYMENT.md` | `docs/50-guides/deployment/DEPLOYMENT-MASTER.md` | 35% | **KEEP BOTH** (B ya marcado DEPRECATED) |
| 5 | `orch/PROJECT-CONTEXT.md` | `docs/00-overview/ESTADO-ACTUAL.md` | 10% | **KEEP BOTH** (L1 context vs stub humano) |
| 6 | `orch/BOOTLOADER.md` (raiz) | `orch/directivas/simco/SIMCO-BOOTLOADER.md` | 75% | **DELETE raiz** (v1.0 superseded by v2.0) |

### Acciones de Limpieza

1. **DELETE** `orchestration/DEPENDENCY-GRAPH.yml` — superseded por inventarios/DEPENDENCY_GRAPH.yml v3.0.0
2. **DELETE** `docs/00-overview/MODULOS-SISTEMA.md` — stub absorbido por MODULOS.md
3. **DELETE** `orchestration/BOOTLOADER.md` — superseded por SIMCO-BOOTLOADER.md v2.0.0
4. **UPDATE** @BOOTLOADER alias en ALIASES.yml para evitar ambiguedad

---

## _INDEX vs _MAP Pattern

| Rol | _INDEX.md | _MAP.md |
|-----|-----------|---------|
| Proposito | Catalogo exhaustivo (TOC) | Navegacion rapida por tema |
| Formato | Lista completa con links | Agrupacion por caso de uso |
| Audiencia | Completitud | Orientacion |

- Distincion clara en `20-architecture/` y `30-ux-ui/flujos/`
- Overlap excesivo en `90-adr/` (~70%) — considerar consolidar
- Pattern es arquitecturalmente solido cuando se respeta

---

## docs/80-references/ Assessment

- **Archivos:** 9 (3 dirs: root, knowledge-base, transversal/correcciones)
- **Calidad:** ADECUADA — `SIMCO-KB-MAPPING.md` y correcciones son utiles
- **Problema:** `_INDEX.md` solo menciona `transversal/`, omite `knowledge-base/`
- **Accion:** Poblar `_INDEX.md` con ambos subdirectorios
