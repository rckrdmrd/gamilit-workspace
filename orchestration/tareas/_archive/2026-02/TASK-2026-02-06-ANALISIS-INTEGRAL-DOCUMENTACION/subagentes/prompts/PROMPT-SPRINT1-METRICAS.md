# PROMPT: Sprint 1 - Sincronizacion Metricas (9 agentes, 2 waves)

**Perfil:** Explore/General (Sonnet)
**Fase:** Sprint 1
**Herramientas:** Read, Glob, Grep

### Wave 1: Lectura de Fuentes (6 agentes paralelos)
Cada agente lee 1-2 archivos SSOT y extrae metricas:
- SA-S1-READ-01: PROJECT-PROFILE.yml + PROXIMA-ACCION.md
- SA-S1-READ-02: MASTER_INVENTORY.yml (full read)
- SA-S1-READ-03: CODE-MAPPINGS.yml + COMPLETENESS-TRACKER.yml
- SA-S1-READ-04: TRACEABILITY duplicates scan
- SA-S1-READ-05: mirrors/gamilit + PROYECTO-GAMILIT.md
- SA-S1-READ-06: FRONTEND_INVENTORY + CHANGELOG

### Wave 2: Background Analysis (3 agentes paralelos)
- SA-S1-BG-01: Count ALL *.entity.ts files in apps/backend/src/ (found 153)
- SA-S1-BG-02: Count ALL DDL schemas and tables (confirmed 18/171)
- SA-S1-BG-03: Grep for broken refs patterns: "docs/97-adr/", "8 schemas", old TRACEABILITY paths (found 164)

**Resultado:** Matriz de comparacion de 10 fuentes, 164 broken refs catalogadas
