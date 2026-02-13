# SIMCO Archive - Mapeo de Retencion

**Fecha de archivo:** 2026-02-11
**Politica de retencion:** 3 meses (revision programada: Mayo 2026)
**Decision:** CONSERVAR - contenido reciente, archivado durante consolidacion GAM-CLEANUP-P7

## Mapeo Archivado -> Canonico

| Archivo Archivado | Version Canonica | Absorcion |
|---|---|---|
| SIMCO-CONTROL-TOKENS.md | SIMCO-CONTEXT-MANAGEMENT-V2.md | 95% |
| SIMCO-MEMORIA-TOKENS.md | SIMCO-CONTEXT-MANAGEMENT-V2.md | 90% |
| SIMCO-IOC-CONTEXTO.md | SIMCO-CONTEXT-ENGINEERING.md | 70% (*) |
| SIMCO-CONTEXT-RESOLUTION.md | SIMCO-CONTEXT-MANAGEMENT-V2.md | 95% |
| SIMCO-DELEGACION-PARALELA.md | SIMCO-DELEGACION.md | 90% |
| SIMCO-MULTI-AGENT.md | SIMCO-CONTEXT-ENGINEERING.md | 85% |
| PROTOCOLO-HANDOFF-SUBAGENTE.md | SIMCO-SUBAGENTE.md | 75% (*) |
| SIMCO-CCA-SUBAGENTE.md | SIMCO-SUBAGENTE.md | 95% |
| SIMCO-DOCUMENTACION-INDEX.md | SIMCO-DOCUMENTACION-PROYECTO.md | 90% |
| SIMCO-UBICACION-DOCUMENTACION.md | SIMCO-DOCUMENTACION-PROYECTO.md | 40% (*) |
| SIMCO-MANTENIMIENTO-DOCUMENTACION.md | SIMCO-DOCUMENTACION-PROYECTO.md | 90% |
| SIMCO-GIT-WORKFLOW.md | SIMCO-GIT.md | 95% |
| SIMCO-NOMENCLATURA-TAREAS.md | SIMCO-NOMENCLATURA.md | 50% (*) |
| SIMCO-DDL-UNIFIED.md | SIMCO-DDL.md | 60% (*) |

(*) = Contenido parcialmente absorbido. Gaps pendientes de integracion.

## Gaps Criticos Pendientes

1. **SIMCO-UBICACION-DOCUMENTACION.md** - Matriz de decision para ubicacion de documentacion NO presente en canonico
2. **SIMCO-DDL-UNIFIED.md** - Arquitectura de script unificado y troubleshooting NO presente en canonico
3. **PROTOCOLO-HANDOFF-SUBAGENTE.md** - Template YAML de reporte de handoff NO presente en canonico
4. **SIMCO-NOMENCLATURA-TAREAS.md** - Formato v2.0 de IDs de tarea NO presente en canonico

## Revision Programada

- **Mayo 2026:** Verificar integracion de gaps criticos en versiones canonicas
- Si gaps integrados: eliminar archivos correspondientes
- Si gaps no integrados: mantener archivos o promover a canonicos
