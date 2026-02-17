# Auditoría Normativa y Documental

**Fecha:** 2026-02-17  
**Estado:** completado  
**Tipo:** análisis CAPVED (Fase 1)

## Objetivo

Evaluar cobertura y coherencia de la planeación/documentación frente a estándares, principios y directivas activas.

## Cobertura evaluada

- Estándares técnicos y generales en `docs/40-standards/`.
- Ciclo CAPVED y directivas operativas en `orchestration/directivas/`.
- Planeación por épicas en `orchestration/work-items/epics/` y `docs/10-requirements/epics/`.
- Flujos y trazabilidad de procesos en `docs/30-ux-ui/flujos/`.
- Asignación de perfiles/directivas en `orchestration/referencias/MATRIZ-PERFIL-DIRECTIVAS.yml`.

## Hallazgos priorizados

### Críticos

1. **Desalineación potencial entre planeación operativa y sprint activo**  
   - Evidencia: `orchestration/scrum/SPRINT-ACTUAL.yml` mantiene Sprint 0 histórico, mientras `orchestration/work-items/epics/_INDEX.yml` refleja carga funcional extensa.
2. **Trazabilidad parcial task -> commit -> validación**  
   - Evidencia: no existe artefacto maestro consolidado operativo en `orchestration/trazabilidad/`.

### Altos

1. **Necesidad de plantilla unificada de task con trazabilidad completa**  
   - Acción: crear template en `docs/10-requirements/epics/`.
2. **Gates de validación dispersos**  
   - Acción: centralizar checklists ejecutables en `orchestration/checklists/`.

### Medios

1. **Automatización parcial de validación documental/código**  
   - Acción: crear scripts de verificación y reporte.

## Matriz de cumplimiento por dominio (snapshot)

| Dominio | Estado general | Brecha principal | Acción inmediata |
|---|---|---|---|
| Backend | Medio-Alto | Homogeneidad de evidencia por task | Checklist + trazabilidad master |
| Frontend | Medio-Alto | Validación uniforme flujo-test-doc | Integrar validación de trazabilidad |
| Database | Medio | Coherencia documental cross-layer | Consolidar verificación DDL-Entity |
| Docs | Alto | Sincronización con ejecución técnica | Scripts de validación + template task |
| Orchestration | Medio-Alto | Governance distribuida en varios archivos | Baseline y artefactos consolidados |

## Resultado de Fase 1

- Brechas clasificadas por severidad.
- Áreas de mejora documentadas para pasar a auditoría técnica (Fase 2).
- Inputs listos para priorización y roadmap de remediación.
