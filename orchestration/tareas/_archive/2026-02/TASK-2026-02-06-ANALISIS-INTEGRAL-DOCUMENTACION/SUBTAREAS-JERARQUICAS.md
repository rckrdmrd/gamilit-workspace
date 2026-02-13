# SUBTAREAS-JERARQUICAS - Arbol Completo de Tareas

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Total:** 6 sprints, 18 tareas L1, 68+ subtareas L2 | **Fecha:** 2026-02-06

---

## Arbol de Ejecucion

```
TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
│
├── SPRINT-0: Validacion y Quick Wins (4-6h) ─── PENDIENTE
│   ├── S0-01: Validar Dead Features [P0] (2-3h)
│   │   ├── S0-01a: Validar "boosts" en codigo ────── [CAPVED] SA-VAL-01
│   │   ├── S0-01b: Validar "forum" en codigo ─────── [CAPVED] SA-VAL-02
│   │   ├── S0-01c: Validar "social_interactions" ─── [CAPVED] SA-VAL-03
│   │   └── S0-01d: Validar "team_vs_team" ────────── [CAPVED] SA-VAL-04
│   └── S0-02: Quick Wins Inmediatos [P0] (1-2h)
│       ├── S0-02a: Mover legacy_guidelines a _archive [CAPVED]
│       ├── S0-02b: Purge ACTUALIZACION-FE-2025-11-26 [CAPVED]
│       └── S0-02c: Archivar CORR-009/010/011 ─────── [CAPVED]
│
├── SPRINT-1: Metricas y SSOT (12-16h) ─── dep: S0
│   ├── S1-01: Sincronizacion Global Metricas [P0] (4-6h)
│   │   ├── S1-01a: Actualizar PROJECT-PROFILE.yml ── [CAPVED] SA-SYNC-01
│   │   ├── S1-01b: Actualizar PROJECT-STATUS.md ──── [CAPVED] SA-SYNC-02
│   │   ├── S1-01c: Reconciliar FRONTEND_INVENTORY ── [CAPVED] SA-SYNC-03
│   │   ├── S1-01d: Sincronizar shared/mirrors/ ───── [CAPVED] SA-SYNC-04
│   │   ├── S1-01e: Actualizar PROYECTO-GAMILIT.md ── [CAPVED] SA-SYNC-05
│   │   └── S1-01f: Agregar CHANGELOG v2.7.0 ──────── [CAPVED] SA-SYNC-06
│   ├── S1-02: Consolidar SSOT Trazabilidad [P0] (4-5h)
│   │   ├── S1-02a: Eliminar TRACEABILITY duplicado ── [CAPVED] SA-SSOT-01
│   │   ├── S1-02b: Sync orchestration/TRACEABILITY ── [CAPVED] SA-SSOT-01
│   │   ├── S1-02c: Regenerar ENTITIES-CATALOG (141) ─ [CAPVED] SA-SSOT-02
│   │   ├── S1-02d: Actualizar CODE-MAPPINGS (+32 tbl) [CAPVED] SA-SSOT-03
│   │   ├── S1-02e: Corregir refs rotas globales ───── [CAPVED] SA-SSOT-04
│   │   └── S1-02f: Actualizar COMPLETENESS-TRACKER ── [CAPVED] SA-SSOT-05
│   └── S1-03: Reconciliar Estado Proyecto [P0] (1-2h)
│       └── S1-03a: Unificar MVP % en todas fuentes ── [CAPVED]
│
├── SPRINT-2: Requerimientos RF (25-35h) ─── dep: S1 [PARALELO con S3]
│   ├── S2-01: RF Phase 1 EPICs [P1] (8-10h)
│   │   ├── S2-01a: RF EAI-001 (4 archivos) ───── [CAPVED] SA-RF-01
│   │   ├── S2-01b: RF EAI-002 (5 archivos) ───── [CAPVED] SA-RF-02
│   │   ├── S2-01c: RF EAI-003 (4 archivos) ───── [CAPVED] SA-RF-03
│   │   ├── S2-01d: RF EAI-005 (3 archivos) ───── [CAPVED] SA-RF-04
│   │   └── S2-01e: RF EAI-007 (3 archivos) ───── [CAPVED] SA-RF-05
│   ├── S2-02: RF EXT-001 Portal Maestros [P0] (6-8h)
│   │   ├── S2-02/W1: RF-TCH-001 a 006 ────────── [CAPVED] SA-RF-06
│   │   ├── S2-02/W2: RF-TCH-007 a 012 ────────── [CAPVED] SA-RF-07
│   │   ├── S2-02/W3: RF-TCH-013 a 018 ────────── [CAPVED] SA-RF-08
│   │   └── S2-02/W4: RF-TCH-019 a 024 ────────── [CAPVED] SA-RF-09
│   ├── S2-03: RF EXT-002 Admin Extendido [P0] (5-7h)
│   │   ├── S2-03/W1: RF-AE-001 a 007 ─────────── [CAPVED] SA-RF-10
│   │   ├── S2-03/W2: RF-AE-008 a 013 ─────────── [CAPVED] SA-RF-11
│   │   └── S2-03/W3: RF-AE-014 a 019 ─────────── [CAPVED] SA-RF-12
│   ├── S2-04: RF ETC-001 + EAI-003-EXT + Nomenclatura [P0/P1] (3-4h)
│   │   ├── S2-04a: Resolver ETC-001 (5 HU + 5 RF) ── [CAPVED] SA-RF-13
│   │   ├── S2-04b: RF EAI-003-EXT (4 archivos) ───── [CAPVED] SA-RF-14
│   │   └── S2-04c: Doc mapeo US-PM→RF-TCH ──────── [CAPVED] SA-RF-15
│   └── S2-05: Actualizar Indices SSOT [P1] (2-3h) ── dep: S2-01..S2-04
│       ├── S2-05a: Update REQUIREMENTS-INDEX.yml
│       ├── S2-05b: Update EPIC-INDEX.yml
│       └── S2-05c: Validar 100% match archivos↔indice
│
├── SPRINT-3: Arquitectura y Business Logic (20-25h) ─── dep: S1 [PARALELO con S2]
│   ├── S3-01: Actualizar ARCHITECTURE.md [P0] (2-3h)
│   │   └── S3-01a: Reescribir schemas + modulos ──── [CAPVED]
│   ├── S3-02: ADR-033 y Gaps [P0] (3-4h)
│   │   ├── S3-02a: Crear ADR-033 (Schemas 8→18) ──── [CAPVED] SA-ADR-01
│   │   ├── S3-02b: Stubs ADR-004 a ADR-006 ────────── [CAPVED] SA-ADR-02
│   │   ├── S3-02c: Stubs ADR-024, ADR-025 ──────────── [CAPVED] SA-ADR-02
│   │   ├── S3-02d: Status ADRs 027-032 ─────────────── [CAPVED] SA-ADR-03
│   │   └── S3-02e: Fix refs "docs/90-adr/" ──────────── [CAPVED] SA-ADR-04
│   ├── S3-03: Expandir DocumentoDeDiseño [P0] (5-7h)
│   │   ├── S3-03a: Sec 6: Achievements ──────────────── [CAPVED] SA-BL-01
│   │   ├── S3-03b: Sec 7: Missions ──────────────────── [CAPVED] SA-BL-02
│   │   ├── S3-03c: Sec 8: Leaderboards ──────────────── [CAPVED] SA-BL-03
│   │   ├── S3-03d: Sec 9: Streaks ───────────────────── [CAPVED] SA-BL-04
│   │   ├── S3-03e: Sec 10: Social ───────────────────── [CAPVED] SA-BL-05
│   │   └── S3-03f: Sec 11: Exercise Lifecycle ────────── [CAPVED] SA-BL-06
│   ├── S3-04: DDL-SCHEMA-ORDER + DB Docs [P1] (2-3h)
│   │   └── S3-04a: Actualizar a 18 schemas ──────────── [CAPVED]
│   ├── S3-05: API Documentation [P0] (3-4h)
│   │   ├── S3-05a: Agregar nota Swagger en API.md ───── [CAPVED]
│   │   └── S3-05b: Crear API-MODULES-INDEX.md ──────── [CAPVED]
│   └── S3-06: Database Refs Update [P1] (2-3h)
│       ├── S3-06a: Verificar FK-STRATEGY.md vs 299 FKs [CAPVED]
│       └── S3-06b: Verificar DESIGN-GUIDELINES.md ───── [CAPVED]
│
├── SPRINT-4: Purga, Archivado, Consolidacion (15-20h) ─── dep: S0, S3
│   ├── S4-01: Purga Dead Features [P2] (4-5h) ── dep: S0-01
│   │   ├── S4-01a: Purge "forum" refs (~26 docs) ──── [CAPVED] SA-PURGE-01
│   │   ├── S4-01b: Purge "team_vs_team" (~5 docs) ─── [CAPVED] SA-PURGE-02
│   │   ├── S4-01c: Handle "boosts" refs (~16 docs) ─── [CAPVED] SA-PURGE-03
│   │   └── S4-01d: Handle "social_interactions" ─────── [CAPVED] SA-PURGE-04
│   ├── S4-02: Archivar Docs Temporales [P1] (2-3h)
│   │   ├── S4-02a: Crear dirs _archive/ ─────────────── [CAPVED]
│   │   ├── S4-02b: Mover CORR + analisis 2026-01 ──── [CAPVED]
│   │   ├── S4-02c: Evaluar QUICK-REF-ADMIN ──────────── [CAPVED]
│   │   ├── S4-02d: Purge ACTUALIZACION-FE-2025 ──────── [CAPVED]
│   │   └── S4-02e: Evaluar REPORTE-VALIDACION-2025 ─── [CAPVED]
│   ├── S4-03: Revisar Archived Tasks [P2] (3-4h)
│   │   └── S4-03a: Scan 48 tareas, extraer defs ─────── [CAPVED]
│   ├── S4-04: Consolidar Stubs [P3] (2-3h)
│   │   ├── S4-04a: 20-perfiles → contenido o redirect ─ [CAPVED]
│   │   ├── S4-04b: 60-proyectos → contenido o redirect  [CAPVED]
│   │   └── S4-04c: 70-onboarding → redirect a 00-vision [CAPVED]
│   └── S4-05: Fix Paths Globales [P1] (1-2h)
│       ├── S4-05a: Replace "docs/90-adr/" → "docs/90-adr/" [CAPVED]
│       └── S4-05b: Replace paths absolutos Linux ─────── [CAPVED]
│
└── SPRINT-5: Cierre (8-12h) ─── dep: S0-S4
    ├── S5-01: Validacion Global [P0] (3-4h)
    │   ├── S5-01a: Validar RF count match ─────── [CAPVED] SA-VAL-05
    │   ├── S5-01b: Validar metricas 0 discrepancias [CAPVED] SA-VAL-06
    │   ├── S5-01c: Validar 0 TRACE duplicados ──── [CAPVED] SA-VAL-07
    │   ├── S5-01d: Validar 0 refs rotas ──────────── [CAPVED] SA-VAL-08
    │   ├── S5-01e: Validar ARCHITECTURE.md ──────── [CAPVED] SA-VAL-09
    │   └── S5-01f: Validar Design Doc secciones ── [CAPVED] SA-VAL-10
    ├── S5-02: Actualizar Inventarios [P1] (2-3h)
    │   └── S5-02a: Bump MASTER/DATABASE/BACKEND/FRONTEND
    ├── S5-03: Documentacion Final [P0] (2-3h)
    │   ├── S5-03a: Crear 04-VALIDACION.md
    │   ├── S5-03b: Crear 05-EJECUCION.md
    │   ├── S5-03c: Crear 06-DOCUMENTACION.md (INFORME-FINAL)
    │   └── S5-03d: Actualizar METADATA.yml
    └── S5-04: Actualizar _INDEX.yml [P0] (0.5h)
        └── S5-04a: Agregar tarea en indice
```

---

## Conteo Total

| Nivel | Cantidad | Con CAPVED |
|-------|----------|------------|
| Sprints (L0) | 6 | N/A |
| Tareas (L1) | 18 | 18/18 (100%) |
| Subtareas (L2) | 68 | 68/68 (100%) |
| Sub-subtareas (L3) | 12 | 12/12 (100%) |
| **Total** | **104** | **98/98 (100%)** |

**Principio CAPVED cumplido:** Toda tarea y subtarea a cualquier nivel tiene ciclo CAPVED definido.
