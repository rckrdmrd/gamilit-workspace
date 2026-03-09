# Pendientes e Issues Post-Implementación

**Fecha:** 2026-02-17  
**Estado:** cerrado  
**Origen:** ejecución de `sync-work-items-to-docs.js` + validación integral

## 1) Pendientes detectados (estado final)

## P1 - Desalineación work-items vs docs (histórico) - CERRADO

Del reporte `orchestration/trazabilidad/SYNC-WORKITEMS-DOCS-REPORT.json`:

- `missing_in_docs` (11 épicas técnicas históricas)
- `missing_in_work_items`:
  - `EPIC-GAM-F4-VALIDATION`

### Acción implementada

1. Se mejoró `orchestration/scripts/sync-work-items-to-docs.js` para detectar épicas en estructura anidada de docs.
2. Se agregó `orchestration/work-items/epics/EPIC-GAM-F4-VALIDATION.yml`.
3. Se actualizó `orchestration/work-items/epics/_INDEX.yml` incorporando F4.
4. Se re-ejecutó sync con resultado:
   - `total_work_items_epics: 34`
   - `total_docs_epics: 34`
   - `missing_in_docs: []`
   - `missing_in_work_items: []`

## P2 - Madurez CI/CD de trazabilidad - CERRADO

Los scripts de validación quedaron integrados en workflow CI.

### Acción implementada

1. Se creó `.github/workflows/validate-traceability.yml`.
2. El workflow:
   - ejecuta `sync-work-items-to-docs.js`
   - falla PR si hay épicas faltantes
   - ejecuta `validate-traceability.js`
   - publica artefactos de reporte

## 2) Estado de integración con agentes

Quedó integrado en:

- `orchestration/directivas/simco/SIMCO-TAREA.md`
- `orchestration/directivas/simco/SIMCO-ESTANDARES.md`
- `orchestration/referencias/MATRIZ-PERFIL-DIRECTIVAS.yml`
- `orchestration/agents/perfiles/PERFIL-ORQUESTADOR.md`

## 3) Recomendación operativa inmediata

Usar este orden en cada tarea multi-capa:

1. `CHECKLIST-GATE-PRE-EJECUCION`
2. ejecución CAPVED
3. `CHECKLIST-GATE-POST-EJECUCION`
4. `CHECKLIST-VALIDACION-INTEGRAL`
5. `validate-traceability.js`

Con esto, los pendientes quedan explícitos y gobernables por task derivada.

## 4) Cierre

No quedan pendientes abiertos del lote identificado en post-implementación.
