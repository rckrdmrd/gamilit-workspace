# 01 - AUDITORIA DE ESTRUCTURA DE ORQUESTACION

**Tarea:** TASK-2026-02-14-ANALISIS-DOCUMENTACION-GOBERNANZA
**Fase:** 1
**Fecha:** 2026-02-14
**Archivos verificados:** ~180

---

## Resumen

| Area | Archivos | Issues P1 | Issues P2 | Issues P3 |
|------|----------|-----------|-----------|-----------|
| SIMCO Directivas | 70 activos + 15 archivados | 2 | 3 | 0 |
| Principios | 15 | 0 | 1 | 0 |
| Triggers | 13 (+ 2 phantoms) | 1 | 0 | 0 |
| Politicas | 3 | 1 | 0 | 0 |
| Modos | 3 | 1 | 0 | 0 |
| Perfiles Full | 28 | 3 | 2 | 0 |
| Perfiles Compact | 15 | 1 | 0 | 0 |
| Definitions | 32 | 0 | 2 | 1 |
| Inventarios | 9 | 1 | 0 | 0 |
| **Total** | **~180** | **10** | **8** | **1** |

---

## Hallazgos por Area

### SIMCO Directivas (70 activos)

- [OK] 70 archivos SIMCO activos confirmados en disco
- [OK] 10 archivos spot-checked con estructura valida
- [FIXED] _INDEX.md ESTRUCTURA actualizada a 70 archivos (era ~43)
- [FIXED] 8 phantoms eliminados del arbol: REUTILIZAR, CONTRIBUIR-CATALOGO, MOBILE, ML, PROPAGACION, DOCUMENTAR-SUITE, CHECKLIST-FASE-D, LECCIONES-APRENDIDAS
- [FIXED] Paths `core/` corregidos a `orchestration/`
- [ISSUE P1] GUIA RAPIDA y ALIAS sections tenian 5 phantom refs — CORREGIDO
- [ISSUE P2] 3 archivos .yml orphan en simco/: CONTEXT-LAYER-MAP.yml, PRESUPUESTO-DINAMICO.yml, VALIDATION-CHECKLIST-PHASE-4.yml

### Principios (15)

- [OK] 15 archivos confirmados, todos listados en _INDEX.md
- [ISSUE P2] Version mismatch en _INDEX.md (header 1.0.0, footer 1.1.0)

### Triggers (13 on disk)

- [OK] 13 triggers verificados
- [FIXED] TRIGGER-PROPAGACION-AUTOMATICA y TRIGGER-DUPLICADOS marcados como PHANTOM
- [ISSUE P1] MODE-PROPAGATION.md referenciado en flujos pero no existe

### Politicas (3)

- [OK] 3 archivos verificados
- [ISSUE P1] POLITICA-SUPPLY-CHAIN.md existe pero falta en _INDEX.md

### Modos (3)

- [OK] 3 modos verificados (FULL, QUICK, ANALYSIS)
- [ISSUE P1] MODE-PROPAGATION.md listado en _INDEX.md pero no existe en disco

### Perfiles (28 full + 15 compact)

- [OK] 28 full profiles confirmados
- [ISSUE P1] _MAP.md tiene phantoms: PERFIL-INFRASTRUCTURE-MANAGER, PERFIL-BACKEND-EXPRESS (solo en archive)
- [ISSUE P1] PERFIL-DEPLOY-SERVER.md y PERFIL-DOCUMENTATION-MAINTAINER.md no catalogados en _MAP.md
- [ISSUE P1] 13 full profiles sin compact equivalente (sin excepcion documentada)
- [ISSUE P2] PERFIL-ML-COMPACT y PERFIL-QA-COMPACT referencian full profiles archivados

### Definitions (32)

- [OK] 32 archivos verificados
- [ISSUE P2] CHECKLIST-SECURITY-SUPPLY-CHAIN.md orphan (no en _INDEX.yml)
- [ISSUE P2] SUBAGENTS-LOG.yml orphan
- [ISSUE P3] _INDEX.yml statistics counts incorrectos

### Inventarios (9)

- [OK] 7 de 9 con version y fecha actualizadas
- [ISSUE P1] DEPENDENCY_GRAPH.yml severamente stale (2025-12-05, dice 75% vs 98% real)
- [OK] TRACEABILITY_MATRIX.yml aceptable (2026-01-16)

---

## Archivos Orphan (en disco, sin indice)

| Archivo | Prioridad |
|---------|-----------|
| `simco/CONTEXT-LAYER-MAP.yml` | P2 |
| `simco/PRESUPUESTO-DINAMICO.yml` | P2 |
| `simco/VALIDATION-CHECKLIST-PHASE-4.yml` | P2 |
| `politicas/POLITICA-SUPPLY-CHAIN.md` | P1 — agregar a _INDEX |
| `_definitions/checklists/CHECKLIST-SECURITY-SUPPLY-CHAIN.md` | P2 |
| `_definitions/templates/SUBAGENTS-LOG.yml` | P3 |
| `agents/perfiles/PERFIL-DEPLOY-SERVER.md` | P1 — agregar a _MAP |
| `agents/perfiles/PERFIL-DOCUMENTATION-MAINTAINER.md` | P1 — agregar a _MAP |

## Referencias Phantom (en indices, sin archivo)

| Referencia | Ubicacion |
|------------|-----------|
| SIMCO-REUTILIZAR.md | _INDEX.md GUIA RAPIDA — CORREGIDO |
| SIMCO-CONTRIBUIR-CATALOGO.md | _INDEX.md — CORREGIDO |
| SIMCO-MOBILE.md | _INDEX.md — CORREGIDO |
| SIMCO-ML.md | _INDEX.md — CORREGIDO |
| SIMCO-PROPAGACION.md | _INDEX.md — CORREGIDO |
| MODE-PROPAGATION.md | modos/_INDEX.md |
| PERFIL-WORKSPACE-MANAGER.md | agents/ALIASES.yml |
| SIMCO-QA.md | agents/ALIASES.yml |
| SIMCO-SECURITY.md | agents/ALIASES.yml |
| ~18 phantoms | orchestration/referencias/ALIASES.yml (legacy file) |

---

## Archivo Mas Problematico

**`orchestration/referencias/ALIASES.yml`** — archivo legacy del workspace era con ~25 phantom references a archivos, perfiles, directivas y directorios completos que no existen. Es el target de cleanup de mayor valor.

---

*Auditoria completada 2026-02-14 — Fase 1 ANALYSIS*
