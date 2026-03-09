# Baseline de Gobernanza y Estándares

**Fecha:** 2026-02-17  
**Estado:** completado  
**Alcance:** monorepo completo (`apps/`, `docs/`, `orchestration/`)

## Objetivo

Establecer una línea base única para ejecutar mejoras de desarrollo con cumplimiento explícito de estándares, principios, perfiles y skills, evitando desalineaciones entre planeación, ejecución y documentación.

## Referencias normativas activas (baseline)

### Ciclo y principios obligatorios

- `orchestration/directivas/simco/SIMCO-TAREA.md`
- `orchestration/directivas/principios/PRINCIPIO-CAPVED.md`
- `orchestration/directivas/principios/PRINCIPIO-DOC-PRIMERO.md`
- `orchestration/directivas/principios/PRINCIPIO-ANTI-DUPLICACION.md`
- `orchestration/directivas/principios/PRINCIPIO-VALIDACION-OBLIGATORIA.md`

### Gestión de estándares

- `orchestration/directivas/simco/SIMCO-ESTANDARES.md`
- `docs/40-standards/_INDEX.md`
- `docs/40-standards/ESTANDAR-CODIGO.md`
- `docs/40-standards/ESTANDAR-SEGURIDAD.md`
- `docs/40-standards/ESTANDAR-TESTING.md`

### Planeación, trazabilidad y procesos

- `orchestration/work-items/epics/_INDEX.yml`
- `orchestration/scrum/SPRINT-ACTUAL.yml`
- `docs/30-ux-ui/flujos/TRACEABILITY-MATRIX.md`
- `docs/30-ux-ui/flujos/VALIDACION-ANALISIS-VS-INTEGRACION.md`
- `orchestration/referencias/MATRIZ-PERFIL-DIRECTIVAS.yml`

## Formato mínimo de evidencia por tarea

Cada tarea de mejora debe generar evidencia en 4 capas:

1. **Planeación:** objetivo, alcance, criterio de entrada/salida, riesgo.
2. **Implementación:** archivos modificados, decisión aplicada, validaciones técnicas.
3. **Trazabilidad:** vínculo `epic -> US -> task -> código -> tests -> docs`.
4. **Cierre:** validación final, pendientes residuales y siguientes acciones.

## Niveles de severidad para brechas

| Severidad | Definición | Acción requerida |
|---|---|---|
| Crítica | Rompe coherencia entre capas o seguridad | Bloquea ejecución hasta corregir |
| Alta | Afecta trazabilidad, calidad o estabilidad | Debe entrar en P0 o P1 |
| Media | Impacto acotado con workaround | Planificar en P1 o P2 |
| Baja | Mejora incremental sin riesgo inmediato | Backlog de mejora continua |

## Resultado de Fase 0

- Baseline normativo consolidado.
- Formato de evidencia definido para todas las fases.
- Criterios de severidad listos para priorización en roadmap.
