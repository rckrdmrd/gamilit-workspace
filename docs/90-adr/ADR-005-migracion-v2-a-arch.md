# ADR-005: Migracion de Documentacion workspace-v2 a workspace-arch

**Fecha:** 2026-02-07
**Estado:** Aceptada
**Tipo:** Governance

## Contexto

El proyecto GAMILIT existia con documentacion y gobernanza distribuida en workspace-v2 (~1,619 archivos). Se requeria migrar a workspace-arch bajo la nueva estructura de gobernanza SIMCO v4.0.0 con herencia de workspace padre.

## Decision

Migrar selectivamente siguiendo la clasificacion:
- **MIGRAR:** 57 archivos (3%) — contenido activo faltante (mecanicas, guias pruebas, ADRs, inventarios, trazabilidad)
- **PURGAR:** 699 archivos (43%) — duplicados de workspace-level (estandares, directivas, agents, templates)
- **ARCHIVAR:** 824 archivos (51%) — historicos (requerimientos por fases, tareas, trazas)
- **YA MIGRADO:** 72 archivos (3%) — pre-existentes en workspace-arch

Se mantuvo workspace-v2 intacto como referencia historica.

## Consecuencias

### Positivas
- Workspace-arch gamilit ahora tiene 129 archivos (de 72) con documentacion completa
- 33 ADRs vigentes disponibles (de 4 originales)
- Inventarios especializados (trazabilidad, dependencias, seeds, coverage) migrados
- Guias de pruebas por modulo disponibles para QA
- Mecanicas de gamificacion documentadas formalmente

### Negativas
- 569 archivos de requerimientos granulares por fase quedan solo en workspace-v2 (acceso historico)
- Trazas de ejecucion historicas no migradas (bajo valor)

### Riesgos Mitigados
- Zero refs a workspace-v2 en archivos migrados (limpieza verificada)
- Todos los READMEs actualizados con nuevos archivos
- _INDEX.yml actualizado con nueva estructura

## Alternativas Consideradas

1. **Migrar todo (~1,619 archivos):** Rechazada — 96% es duplicado o historico
2. **No migrar nada:** Rechazada — gaps criticos (mecanicas, guias, ADRs) sin resolver
3. **Migracion selectiva (elegida):** Balance entre completitud y economia

## Referencias
- Plan completo: orchestration/analisis/ANALISIS-MIGRACION-GAMILIT.md
- Manifest: orchestration/analisis/MIGRATION-MANIFEST.yml
- Purga: orchestration/analisis/PURGA-DECISION-LOG.md
