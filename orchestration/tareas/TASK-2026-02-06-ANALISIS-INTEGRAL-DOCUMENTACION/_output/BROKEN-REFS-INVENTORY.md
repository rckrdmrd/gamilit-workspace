# BROKEN-REFS-INVENTORY - Referencias Rotas Pendientes

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Sprint:** 1 (descubierto) / 4 (ejecucion) | **Fecha:** 2026-02-06

---

## Resumen

| Categoria | Descripcion | Total | Resueltas S1 | Pendientes S4 |
|-----------|-------------|-------|-------------|---------------|
| CAT-1 | `docs/97-adr/` → `docs/90-adr/` | 69 | **69** | 0 |
| CAT-2 | `8 schemas` → `18 schemas` | 6 | 0 | 6 |
| CAT-3 | Old trazabilidad path TRACEABILITY | 1 | **1** | 0 |
| CAT-4 | TRACEABILITY-MASTER.yml wrong canonical path | 16 | 0 | 16 |
| CAT-5 | Wrong table/schema counts (→171/18) | 61 | 0 | 61 |
| CAT-6 | Wrong entity counts (→141 or 153) | 11 | 0 | 11 |
| **TOTAL** | | **164** | **70** | **94** |

---

## CAT-1: RESUELTO en Sprint 1

Global replace `docs/97-adr/` → `docs/90-adr/` en 46 archivos. 0 ocurrencias restantes.

## CAT-2: 8 schemas → 18 schemas (6 pendientes)

| Archivo | Linea |
|---------|-------|
| docs/80-referencias/transversal/arquitectura/ARCHITECTURE.md | 73, 97 |
| docs/90-adr/ADR-017-admin-portal-avanzado-vs-alcance-inicial.md | 51 |
| apps/devops/_MAP.md | 155 |
| orchestration/tareas/TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS/PLAN-MAESTRO-EXTENDIDO.md | 292 |
| orchestration/tareas/TASK-2026-02-03-PLAN-MAESTRO-BD-REQUERIMIENTOS/ANALISIS-CONFLICTOS-DUPLICIDADES.md | 76 |

**Nota:** ARCHITECTURE.md requiere reescritura completa (Sprint 3 S3-01).

## CAT-3: RESUELTO en Sprint 1

`docs/10-arquitectura/modelado/README.md` linea 21: path actualizado a `../../_SSOT/TRACEABILITY-MASTER.yml`.

## CAT-4: TRACEABILITY-MASTER.yml canonical path (16 pendientes)

Canonical: `docs/_SSOT/TRACEABILITY-MASTER.yml` (v3.1.0)
Note: `orchestration/TRACEABILITY.yml` (v1.1.0) es archivo DIFERENTE (operational record).

| Archivo | Linea | Ref incorrecta |
|---------|-------|----------------|
| orchestration/_definitions/SSOT.yml | 68 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/directivas/simco/SIMCO-PROPAGACION-CAMBIOS.md | 70,161,260 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/directivas/simco/SIMCO-MULTI-WORKSPACE.md | 208 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/directivas/simco/SIMCO-GIT-COORDINADO.md | 314 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/directivas/simco/SIMCO-FUNCIONALIDADES.md | 441 | TRACEABILITY-MASTER.yml |
| orchestration/directivas/simco/SIMCO-ESTANDAR-ORCHESTRATION.md | 51,91 | TRACEABILITY-MASTER.yml |
| orchestration/directivas/principios/PROPAGACION-ARCHITECTURE.md | 310 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/agents/prompts/PROMPT-AGENTE-PROPAGACION.md | 18 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/agents/perfiles/PERFIL-WORKSPACE-ORCHESTRATOR.md | 52,433 | TRACEABILITY-MASTER.yml |
| orchestration/referencias/INVOCACIONES.yml | 358 | orchestration/TRACEABILITY-MASTER.yml |
| orchestration/referencias/ALIASES.yml | 196 | TRACEABILITY-MASTER.yml |

## CAT-5: Wrong table/schema counts (61 pendientes)

**Prioridad ALTA** (archivos activos de referencia):
- ARCHITECTURE.md: "40+ tables" → "171 tables" (Sprint 3)
- orchestration/QUICK-REFERENCE.md: "137 tablas" → "171 tablas"
- orchestration/_MAP.md: "135 tablas" → "171 tablas"
- orchestration/PROXIMA-ACCION.md: 138/137 → 171
- orchestration/PROJECT-STATUS.md: "147 tablas" → "171 tablas"
- orchestration/TRACEABILITY.yml: "137 tablas" → "171 tablas"
- docs/README.md: "16 schemas" → "18 schemas"
- apps/database/_MAP.md, README.md, scripts/ files
- .gemini/.windsurf/.trae BOOTLOADER files

**Prioridad BAJA** (archivos historicos/archivados):
- orchestration/reports/audits/*.md (historical)
- orchestration/tareas/_archive/ (archived tasks)
- docs/50-requerimientos/ changelog files

## CAT-6: Wrong entity counts (11 pendientes)

| Archivo | Valor actual | Correcto |
|---------|-------------|----------|
| orchestration/PROJECT-STATUS.md | 137 | 141+ |
| orchestration/PROXIMA-ACCION.md | 137 | 141+ |
| Various task docs | 124/125/137/158 | 141+ |

**NOTA IMPORTANTE:** El scan de entities encontro 153 entity classes (vs 141 reportadas).
Diferencia de +12 requiere verificacion antes de actualizar el conteo canonico.
Posibles causas: entidades no commiteadas, entidades no registradas en modulos TypeORM, conteo previo excluyendo ciertas entidades.

---

## Plan de Ejecucion (Sprint 4)

1. **Batch 1:** CAT-4 (TRACEABILITY paths) - 16 ediciones quirurgicas
2. **Batch 2:** CAT-5 alta prioridad (table/schema counts) - ~20 archivos activos
3. **Batch 3:** CAT-2 (8→18 schemas) - 6 ediciones
4. **Batch 4:** CAT-6 (entity counts) - 11 ediciones (post-verificacion)
5. **Batch 5:** CAT-5 baja prioridad (historical files) - ~40 archivos

**Esfuerzo estimado:** 3-4h con subagentes paralelos.
