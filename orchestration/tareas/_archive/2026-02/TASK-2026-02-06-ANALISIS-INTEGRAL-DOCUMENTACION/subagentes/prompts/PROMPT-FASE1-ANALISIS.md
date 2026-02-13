# PROMPT: Fase 1 - Analisis Profundo (6 agentes paralelos)

**Perfil:** Explore (Sonnet)
**Fase:** 1 - Analisis
**Herramientas:** Glob, Read, Grep

### SA-DEEP-01: Requirements Completeness
**Tarea:** Compare docs/50-requerimientos/ RF files against docs/_SSOT/REQUIREMENTS-INDEX.yml. For each EPIC, count existing RF files vs expected. Calculate gap percentage. List all missing RF IDs.
**Resultado:** 81 RF faltantes (72% gap), EXT-001 96% gap, EXT-002 95% gap

### SA-DEEP-02: Metric Consistency
**Tarea:** Read 10 sources of metrics (PROJECT-PROFILE, MASTER_INVENTORY, PROYECTO-GAMILIT, mirrors, CODE-MAPPINGS, COMPLETENESS-TRACKER, FRONTEND_INVENTORY, PROXIMA-ACCION, PROJECT-STATUS, CLAUDE.md local). For each source, extract: schemas, tables, entities, endpoints, MVP%. Create comparison matrix.
**Resultado:** 18 metricas divergentes, 6 fuentes desactualizadas

### SA-DEEP-03: Traceability & SSOT Validation
**Tarea:** Find all files named TRACEABILITY*.yml across the project. Compare versions, content, and canonical status. Check docs/_SSOT/ for completeness. Validate CODE-MAPPINGS coverage (schemas documented vs total).
**Resultado:** 3 TRACEABILITY duplicados, ENTITIES-CATALOG 87% incompleto

### SA-DEEP-04: Stale/Obsolete Docs
**Tarea:** Search for documents with dates older than 2026-01-15 in docs/80-referencias/ that haven't been updated. Find temporary analysis files, correction reports, and documents superseded by newer versions. Classify as P0 (purge), P1 (archive), P2 (update).
**Resultado:** 52 elementos obsoletos (10 P0, 22 P1, 20 P2)

### SA-DEEP-05: Business Logic Coverage
**Tarea:** Read docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md. Compare design document sections against actual implementation (DDL tables, entities, services). Identify missing business logic sections.
**Resultado:** Design doc 85%, faltan achievements/missions/leaderboards

### SA-DEEP-06: Architecture Docs Coherence
**Tarea:** Read ARCHITECTURE.md, all ADR files in docs/90-adr/, and _MAP.md files. Check schema names, table counts, rank names against MASTER_INVENTORY v6.0.0. Identify all inconsistencies.
**Resultado:** ARCHITECTURE.md "8 schemas" incorrecto, 20 hallazgos ADR
