# 01 - INTEGRIDAD ESTRUCTURAL

**Fecha:** 2026-02-25 | **Fase:** 1 | **Subagentes:** S-IDX-01, S-IDX-02

---

## Resumen

| Categoria | Total Verificado | Problemas |
|-----------|-----------------|-----------|
| _INDEX.md revisados | 19 | 17 archivos huerfanos |
| _MAP.md revisados | 12 | 1 referencia rota |
| Links markdown | ~50 muestras | 1 roto |
| CONTEXT-MAP.yml aliases | 38 | 0 rotos |
| ALIASES.yml referencias | 95 | 10 phantom |
| CLAUDE.md aliases | 36 | 0 rotos (1 ambiguedad semantica) |

---

## ADR Index Gaps

| Estado | Conteo |
|--------|--------|
| _INDEX.md dice | 43 ADRs |
| _MAP.md dice | 40 ADRs |
| Archivos en disco | 47 ADRs |

**ADRs no indexados:**
- `ADR-047-state-architecture-zustand-react-query.md` (Status: Accepted, implementado)
- `ADR-048-component-sharing-strategy.md` (Status: Accepted, implementado)
- `ADR-049-confirm-dialog-consolidation.md` (Status: Accepted, implementado)

**_MAP.md adicionalmente falta:** ADR-044, ADR-045, ADR-046 (6 ADRs detras de la realidad)

---

## Referencias Rotas (listado en indice pero archivo no existe)

| Indice | Referencia Rota |
|--------|----------------|
| `docs/80-references/transversal/correcciones/_MAP.md` | `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md` (no existe) |

---

## Archivos Huerfanos (existen pero no estan en ningun indice)

| # | Archivo | Indice que deberia listarlo |
|---|---------|---------------------------|
| 1 | `docs/00-overview/DEPLOYMENT.md` | `docs/00-overview/_INDEX.md` |
| 2 | `docs/00-overview/MODULOS.md` | `docs/00-overview/_INDEX.md` |
| 3 | `docs/00-overview/REPORTE-INTEGRAL-2026-01-20.md` | `docs/00-overview/_INDEX.md` |
| 4 | `docs/20-architecture/DB-OPERACION-AMBIENTES-DECISION.md` | `docs/20-architecture/_INDEX.md` |
| 5 | `docs/20-architecture/schema-reference/UUID-SERIES-CATALOG.md` | `schema-reference/_INDEX.md` |
| 6 | `docs/30-ux-ui/flujos/AUDITORIA-FASE1-CALIDAD-FLUJOS-2026-02-17.md` | `flujos/_INDEX.md` |
| 7 | `docs/40-api/README.md` | `docs/40-api/_INDEX.md` |
| 8 | `docs/40-standards/README.md` | `docs/40-standards/_INDEX.md` |
| 9 | `docs/60-portals/README.md` | `docs/60-portals/_INDEX.md` |
| 10 | `docs/60-portals/PORTAL-ADMIN-API-REFERENCE.md` | `docs/60-portals/_INDEX.md` |
| 11 | `docs/70-onboarding/README.md` | `docs/70-onboarding/_INDEX.md` |
| 12 | `docs/80-references/README.md` | `docs/80-references/_INDEX.md` |
| 13 | `docs/80-references/knowledge-base/SIMCO-KB-MAPPING.md` | `docs/80-references/_INDEX.md` |
| 14 | `docs/90-adr/README.md` | `docs/90-adr/_INDEX.md` |
| 15 | `docs/90-adr/ADR-047-*.md` | `docs/90-adr/_INDEX.md` |
| 16 | `docs/90-adr/ADR-048-*.md` | `docs/90-adr/_INDEX.md` |
| 17 | `docs/90-adr/ADR-049-*.md` | `docs/90-adr/_INDEX.md` |

---

## ALIASES.yml Phantom References (10)

| # | Alias | Path Declarado | Estado |
|---|-------|---------------|--------|
| 1 | `@CHK_DELEGACION` | `checklists/CHECKLIST-PRE-DELEGACION.md` | NO EXISTE |
| 2 | `@PERFIL_INFRASTRUCTURE_MANAGER` | `agents/perfiles/PERFIL-INFRASTRUCTURE-MANAGER.md` | NO EXISTE |
| 3 | `@CTX_STANDALONE` | `templates/CONTEXTO-NIVEL-STANDALONE.md` | NO EXISTE |
| 4 | `@CTX_SUITE` | `templates/CONTEXTO-NIVEL-SUITE.md` | NO EXISTE |
| 5 | `@CTX_SUITE_CORE` | `templates/CONTEXTO-NIVEL-SUITE-CORE.md` | NO EXISTE |
| 6 | `@CTX_VERTICAL` | `templates/CONTEXTO-NIVEL-VERTICAL.md` | NO EXISTE |
| 7 | `@IMPACTOS` | `impactos/` | DIRECTORIO NO EXISTE |
| 8 | `@TPL_CAPVED` | `templates/TEMPLATE-TAREA-CAPVED.md` | NO EXISTE |
| 9 | `@TPL_RECOVERY_CTX` | `templates/TEMPLATE-RECOVERY-CONTEXT.md` | NO EXISTE |
| 10 | `@TPL_HERENCIA_CTX` | `templates/TEMPLATE-HERENCIA-CONTEXTO.md` | NO EXISTE |

**Nota:** `orchestration/templates/` solo contiene `README.md` y `_MAP.md`. Los 4 templates de contexto nivel y 3 plantillas nunca fueron creados.

---

## Indices de Orquestacion

### SIMCO _INDEX.md
- Dice: 70 activas
- Real: 72 archivos `SIMCO-*.md`
- Huerfano: `SIMCO-DELEGACION-GEMINI-CLI.md` (no listado)
- Error de conteo: Seccion ANALISIS dice "(1)" pero lista 2 archivos

### agents/perfiles/_MAP.md
- Roto: `PERFIL-INFRASTRUCTURE-MANAGER.md` (listado pero no existe en disco)
- Huerfanos: `PERFIL-DB-DEV-WSL.md`, `PERFIL-CONTRATO-TRANSVERSAL.md`, `PERFIL-POLICY-AUDITOR.md` (existen pero no catalogados)

### orchestration/_INDEX.yml
- Lista solo 4 de 10 inventarios YAML
- Huerfanos: DEPENDENCY_GRAPH.yml, LOCAL-WSL-ENVIRONMENT.yml, SEEDS_INVENTORY.yml, SKILLS-REGISTRY.yml, TEST_COVERAGE.yml, TRACEABILITY_MATRIX.yml

### orchestration/inventarios/
- NO tiene _INDEX.yml propio

---

## Ambiguedad Semantica: @BOOTLOADER

| Fuente | Target |
|--------|--------|
| CLAUDE.md | `orchestration/directivas/simco/SIMCO-BOOTLOADER.md` (v2.0.0, NEXUS v4.1) |
| ALIASES.yml | `orchestration/BOOTLOADER.md` (v1.0.0, NEXUS v4.0) |

Ambos archivos existen. El root es version anterior y deberia eliminarse (ver Fase 5).

---

## Metadata Stale en Indices

| Archivo | Claim | Real | Tipo |
|---------|-------|------|------|
| `docs/90-adr/_INDEX.md` | "43 ADRs" | 47 | Conteo desactualizado |
| `docs/90-adr/_MAP.md` | "40 ADRs, ADR-044+ disponibles" | 47 (044-049 existen) | Conteo + metadata stale |
| `docs/20-architecture/schema-reference/_INDEX.md` | "22 archivos" | 23 (falta UUID-SERIES-CATALOG.md) | Conteo -1 |
