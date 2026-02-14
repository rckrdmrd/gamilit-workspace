# 02 - AUDITORIA DE ESTRUCTURA DE DOCUMENTACION (docs/)

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fase:** 2
**Fecha:** 2026-02-14
**Secciones auditadas:** 12

---

## Estado por Seccion

| Seccion | _INDEX | Funcional | Archivos reclamados vs reales | Issues |
|---------|--------|-----------|-------------------------------|--------|
| 00-overview | Si | Parcial | 6 / 10+ | 3 archivos + 2 subdirs no listados |
| 10-requirements | Si | Si | 3 / 3 + 34 EPICs | OK |
| **20-architecture** | Si | **NO** | **0 / 33** | **CRITICO: titulo incorrecto, contenido vacio** |
| 30-ux-ui | Si | Minimo | 1 / 1 | OK (sparse) |
| 40-api | Si | Si | 3 / 4 | README.md no listado |
| 40-standards | Si | Si | 17 + 8 sub / 17 + 8 sub | OK |
| 50-guides | Si | Si | ~124 / ~120+ | documentation-master/ reclama ~11, solo 5 existen |
| 60-portals | Si | Si | 3 / 3 (37 files) | OK |
| 70-onboarding | Si | Si | 3 / 3 | OK |
| 80-references | Si | Minimo | 1 / 2 subdirs | knowledge-base/ no listado |
| 90-adr | Si | Si | 40 / 40 | _MAP.md 19 ADRs atras |
| 99-delivery | Si | Si | 1 dir / 1 dir (12 files) | OK |

---

## Issues Criticos

### P1: `docs/20-architecture/_INDEX.md` era stub vacio
- **Estado:** CORREGIDO — reescrito con indice completo de 10 archivos root + 22 schema-reference
- Titulo corregido de "20 - Perfiles" a "20 - Arquitectura"

### P1: 90+ cross-references rotas a paths legacy
- `docs/02-especificaciones-tecnicas/` — no existe (30+ refs)
- `docs/95-guias-desarrollo/` — no existe, ahora `docs/50-guides/` (30+ refs)
- `docs/90-transversal/` — no existe (30+ refs)
- **Estado:** DOCUMENTADO — requiere batch fix separado

### P1: `docs/90-adr/_MAP.md` — 19 ADRs atras
- Lista 21 ADRs (ult. actualizacion 2025-11-29), _INDEX.md lista 40 correctamente
- **Estado:** DOCUMENTADO — requiere actualizacion

### P1: 12 EPIC files referencian ADR-0019 inexistente
- Todos los 11 EPICs Wave-3 + epics/_INDEX.md linkan a `ADR-0019-ssot-documentacion-producto-en-proyecto.md`
- Equivalente gamilit: `ADR-039-ssot-docs-en-proyecto.md`
- **Estado:** DOCUMENTADO — requiere fix de referencias

### P2: Metricas stale en `overview/directivas/_INDEX.md`
- Reclama 32 stores (real 14), 458 componentes (real 475), 127 hooks (real 102), 85 paginas (real 68), 850 endpoints (real 899)
- **Estado:** DOCUMENTADO

---

## EPICs Audit

- **34 EPICs total**, todos estructuralmente completos
- 23 EPICs F1-F4 con EPIC.md + PLAN.md
- 11 EPICs Wave-3 con EPIC.md (template diferente)
- **Issue:** Ref rota a ADR-0019 en 12 archivos

## ADR Audit

- **40 ADRs**, todos existen con estructura valida (titulo, fecha, estado, contexto, decision)
- Gaps intencionales: 006, 024, 025
- **Issue P3:** Status labels inconsistentes ("Accepted", "Aceptada", "APROBADO", "Implemented")

---

## Acciones Recomendadas

| Prioridad | Accion | Impacto |
|-----------|--------|---------|
| P1 | ~~Reescribir 20-architecture/_INDEX.md~~ | HECHO |
| P1 | Actualizar 90-adr/_MAP.md con 40 ADRs | Elimina inconsistencia |
| P1 | Fix 12 refs ADR-0019 → ADR-039 en EPICs | Repara links rotos |
| P2 | Batch-fix 90+ refs legacy paths en docs/ | Mayor clase de links rotos |
| P2 | Actualizar metricas en overview/directivas | Precision datos |
| P3 | Estandarizar ADR status labels | Normalizacion |

---

*Auditoria completada 2026-02-14 — Fase 2 ANALYSIS*
