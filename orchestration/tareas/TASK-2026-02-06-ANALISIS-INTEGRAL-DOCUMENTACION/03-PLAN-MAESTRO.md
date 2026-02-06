# 03-PLAN-MAESTRO - Plan de Remediacion Integral

**Task:** TASK-2026-02-06-ANALISIS-INTEGRAL-DOCUMENTACION
**Fase:** P (Planificacion) | **Estado:** COMPLETADO | **Fecha:** 2026-02-06

---

## Resumen del Plan

**Total hallazgos:** 127 | **Sprints:** 5 | **Esfuerzo total:** 90-120h (~55-75h paralelo)

```
Sprint 0: Validacion y Quick Wins           (4-6h,  1 dia)
Sprint 1: Metricas y SSOT                   (12-16h, 2-3 dias)
Sprint 2: Requerimientos RF                  (25-35h, 3-5 dias)
Sprint 3: Arquitectura y Business Logic      (20-25h, 3-4 dias)
Sprint 4: Purga, Archivado y Consolidacion   (15-20h, 2-3 dias)
Sprint 5: Cierre, Validacion y Documentacion (8-12h,  1-2 dias)
```

**Orden logico:** Sprint 0 valida dead features ANTES de purgar (Sprint 4). Sprint 1 sincroniza metricas ANTES de crear RF (Sprint 2). Sprint 3 actualiza arquitectura ANTES de consolidar (Sprint 4).

---

## Sprint 0: Validacion y Quick Wins (4-6h)

**Objetivo:** Validar dead features en codigo real y resolver quick wins que desbloquean sprints posteriores.

### TAREA-S0-01: Validar Dead Features en Codigo (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-012, DOC-013 | **Esfuerzo:** 2-3h

```
C: Verificar existencia real de boosts/forum/social_interactions/team_vs_team en codigo
A: grep en apps/backend/src y apps/frontend/src para cada feature
P: Clasificar: DEAD (eliminar refs) vs ALIVE (actualizar TASK-2026-02-05)
V: Confirmar con DDL (tablas, functions, triggers)
E: Documentar resultado en tabla DEAD-FEATURES-VALIDATED.md
D: Actualizar HALLAZGOS-DOCUMENTACION.md con resultado
```

**Subtareas (paralelizables):**

| ID | Subtarea | Agente | CAPVED |
|----|----------|--------|--------|
| S0-01a | Validar "boosts" en backend+frontend+DDL | SA-VAL-01 | C: grep boosts, A: analizar uso, P: clasificar, E: documentar, D: hallazgo |
| S0-01b | Validar "forum" en backend+frontend+DDL | SA-VAL-02 | Idem |
| S0-01c | Validar "social_interactions" | SA-VAL-03 | Idem |
| S0-01d | Validar "team_vs_team" | SA-VAL-04 | Idem |

### TAREA-S0-02: Quick Wins Inmediatos (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-022, DOC-023, DOC-051 | **Esfuerzo:** 1-2h

```
C: Archivos temporales obvios que pueden moverse/eliminarse sin analisis
A: Confirmar que son obsoletos
P: Plan de movimiento/eliminacion
V: Verificar sin referencias activas
E: Mover archivos
D: Log de cambios
```

**Subtareas:**

| ID | Subtarea | Accion | CAPVED |
|----|----------|--------|--------|
| S0-02a | Mover legacy_guidelines a _archive | mv orchestration/_internal/legacy_guidelines/ → _archive/ | Completo |
| S0-02b | Purge ACTUALIZACION-FRONTEND-2025-11-26.md | Eliminar (ya integrado en FRONTEND_INV) | Completo |
| S0-02c | Archivar CORR-009/010/011 | mv docs/80-refs/transversal/correcciones/CORR-* → _archive/2026-01/ | Completo |

---

## Sprint 1: Metricas y SSOT (12-16h)

**Objetivo:** Sincronizar TODAS las fuentes de metricas y consolidar SSOT de trazabilidad.
**Dependencia:** Sprint 0 (dead features validados).

### TAREA-S1-01: Sincronizacion Global de Metricas (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-004 a DOC-007, DOC-017, DOC-032 a DOC-040 | **Esfuerzo:** 4-6h

```
C: 6 fuentes desactualizadas, 18 metricas divergentes
A: Tabla de metricas correctas (de MASTER_INVENTORY v6.0.0)
P: Actualizar cada fuente con valores correctos
V: Comparar post-actualizacion (todas deben coincidir)
E: Editar archivos
D: Log de sincronizacion
```

**Subtareas (paralelizables):**

| ID | Archivo a Actualizar | Metricas | Agente |
|----|---------------------|----------|--------|
| S1-01a | PROJECT-PROFILE.yml | schemas 18, tablas 171, entities 141, functions 128, triggers 49 | SA-SYNC-01 |
| S1-01b | PROJECT-STATUS.md | MVP 98%, tablas 171, entities 141, coherencia 82.5% | SA-SYNC-02 |
| S1-01c | FRONTEND_INVENTORY.yml | components 458, pages 85, stores 32, hooks 127 | SA-SYNC-03 |
| S1-01d | shared/mirrors/gamilit/ | Todos los valores + README | SA-SYNC-04 |
| S1-01e | docs/60-proyectos/PROYECTO-GAMILIT.md | Todos los valores | SA-SYNC-05 |
| S1-01f | CHANGELOG.md | Agregar entrada v2.7.0 reconciliacion | SA-SYNC-06 |

### TAREA-S1-02: Consolidar SSOT Trazabilidad (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-008, DOC-009, DOC-010, DOC-020, DOC-041 a DOC-045 | **Esfuerzo:** 4-5h

```
C: 3 TRACEABILITY duplicados, ENTITIES-CATALOG 87% incompleto, CODE-MAPPINGS 19% desactualizado
A: Determinar canonico, identificar gaps
P: Eliminar duplicados, regenerar catalogo, actualizar mappings
V: Verificar unicidad SSOT
E: Editar/eliminar archivos
D: Documentar SSOT final
```

**Subtareas:**

| ID | Subtarea | Accion | Agente |
|----|----------|--------|--------|
| S1-02a | Eliminar TRACEABILITY-MASTER.yml duplicado | DELETE docs/10-arquitectura/modelado/trazabilidad/TRACEABILITY-MASTER.yml | SA-SSOT-01 |
| S1-02b | Actualizar orchestration/TRACEABILITY.yml | SYNC a v3.1.0 o REDIRECT a docs/_SSOT/ | SA-SSOT-01 |
| S1-02c | Regenerar ENTITIES-CATALOG.md | Expandir de 18 a 141 entities por modulo | SA-SSOT-02 |
| S1-02d | Actualizar CODE-MAPPINGS.yml | Agregar 32 tablas faltantes + data_warehouse + communication | SA-SSOT-03 |
| S1-02e | Corregir referencias rotas | Fix paths: 97-adr→90-adr, 90-transversal→orchestration | SA-SSOT-04 |
| S1-02f | Actualizar COMPLETENESS-TRACKER.yml | Cambiar 100%→82%, marcar BACKLOG EPICs | SA-SSOT-05 |

### TAREA-S1-03: Reconciliar Estado Proyecto (CAPVED)
**Prioridad:** P0 | **Hallazgo:** DOC-011 | **Esfuerzo:** 1-2h

```
C: PROJECT-STATUS dice MVP 75%, PROXIMA-ACCION dice 98%
A: Determinar valor correcto consultando todas las fuentes
P: Unificar en un solo valor consistente
V: Verificar con inventarios actuales
E: Actualizar ambos archivos
D: Log de reconciliacion
```

---

## Sprint 2: Requerimientos RF (25-35h)

**Objetivo:** Crear los 81 archivos RF faltantes, corregir nomenclatura, actualizar indices.
**Dependencia:** Sprint 1 (SSOT consolidado, metricas correctas).

### TAREA-S2-01: Crear RF para EPICs Phase 1 (CAPVED)
**Prioridad:** P1 | **Hallazgos:** DOC-025 a DOC-029 | **Esfuerzo:** 8-10h

```
C: 19 RF faltantes en 5 EPICs de Phase 1 (EAI-001 a EAI-005, EAI-007)
A: Derivar RF de US existentes y ET specs
P: Crear archivos siguiendo estructura existente
V: Verificar coherencia RF↔US↔ET
E: Crear archivos RF
D: Actualizar REQUIREMENTS-INDEX.yml
```

**Subtareas (paralelizables por EPIC):**

| ID | EPIC | RF a Crear | Base | Agente |
|----|------|-----------|------|--------|
| S2-01a | EAI-001 | RF-AUTH-004 a RF-AUTH-008 (4 RF) | US-FUND-005 a US-FUND-008 | SA-RF-01 |
| S2-01b | EAI-002 | RF-EDU-004 a RF-EDU-008 (5 RF) | US-ACT-004 a US-ACT-008 | SA-RF-02 |
| S2-01c | EAI-003 | RF-GAM-005 a RF-GAM-008 (4 RF) | US-GAM-005 a US-GAM-008 | SA-RF-03 |
| S2-01d | EAI-005 | RF-ADM-005 a RF-ADM-007 (3 RF) | US-ADM-005 a US-ADM-007 | SA-RF-04 |
| S2-01e | EAI-007 | RF-M45-004 a RF-M45-006 (3 RF) | US-M45 existentes | SA-RF-05 |

### TAREA-S2-02: Crear RF para EXT-001 Portal Maestros (CAPVED)
**Prioridad:** P0 | **Hallazgo:** DOC-018 | **Esfuerzo:** 6-8h

```
C: 23 RF faltantes, EPIC critico completado pero sin documentacion formal
A: Mapear US-PM-001 a US-PM-024 → RF-TCH-001 a RF-TCH-024
P: Crear cada RF derivado de US + ET correspondientes
V: Verificar cobertura completa
E: Crear 23 archivos
D: Actualizar REQUIREMENTS-INDEX.yml, documentar mapeo US-PM→RF-TCH
```

**Subtareas (paralelizables en waves de 6):**

| Wave | IDs | Agente |
|------|-----|--------|
| Wave 1 | RF-TCH-001 a RF-TCH-006 | SA-RF-06 |
| Wave 2 | RF-TCH-007 a RF-TCH-012 | SA-RF-07 |
| Wave 3 | RF-TCH-013 a RF-TCH-018 | SA-RF-08 |
| Wave 4 | RF-TCH-019 a RF-TCH-024 | SA-RF-09 |

### TAREA-S2-03: Crear RF para EXT-002 Admin Extendido (CAPVED)
**Prioridad:** P0 | **Hallazgo:** DOC-019 | **Esfuerzo:** 5-7h

```
C: 18 RF faltantes para EPIC completado
A: Mapear US-AE-001 a US-AE-019 → RF-AE-001 a RF-AE-019
P: Crear cada RF
V: Verificar cobertura
E: Crear 18 archivos
D: Actualizar indices
```

**Subtareas (3 waves):**

| Wave | IDs | Agente |
|------|-----|--------|
| Wave 1 | RF-AE-001 a RF-AE-007 | SA-RF-10 |
| Wave 2 | RF-AE-008 a RF-AE-013 | SA-RF-11 |
| Wave 3 | RF-AE-014 a RF-AE-019 | SA-RF-12 |

### TAREA-S2-04: Resolver ETC-001 y Otros (CAPVED)
**Prioridad:** P0/P1 | **Hallazgos:** DOC-002, DOC-030, DOC-031 | **Esfuerzo:** 3-4h

```
C: ETC-001 sin docs, EAI-003-EXT con 4 RF faltantes, nomenclatura inconsistente
A: Determinar si ETC-001 es tecnico (sin US/RF necesarios) o tiene gap
P: Crear docs o reclasificar
V: Verificar coherencia con COMPLETENESS-TRACKER
E: Ejecutar
D: Actualizar indices
```

**Subtareas:**

| ID | Subtarea | Agente |
|----|----------|--------|
| S2-04a | Resolver ETC-001: Crear 5 HU + 5 RF o documentar como tecnico | SA-RF-13 |
| S2-04b | Crear 4 RF para EAI-003-EXT (gamificacion social) | SA-RF-14 |
| S2-04c | Documentar mapeo nomenclatura US-PM-*→RF-TCH-* en README | SA-RF-15 |

### TAREA-S2-05: Actualizar Indices SSOT (CAPVED)
**Prioridad:** P1 | **Esfuerzo:** 2-3h
**Dependencia:** S2-01 a S2-04 completados.

```
C: REQUIREMENTS-INDEX.yml y EPIC-INDEX.yml desactualizados post-creacion RF
A: Contar archivos reales vs declarados
P: Actualizar conteos y mappings
V: Verificar 100% match archivos↔indice
E: Editar indices
D: Log de actualizacion
```

---

## Sprint 3: Arquitectura y Business Logic (20-25h)

**Objetivo:** Actualizar documentacion de arquitectura, ADRs, design doc, y API.
**Dependencia:** Sprint 1 (metricas correctas), Sprint 0 (dead features validados).

### TAREA-S3-01: Actualizar ARCHITECTURE.md (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-014, DOC-060 | **Esfuerzo:** 2-3h

```
C: "8 schemas, 40+ tables" cuando hay 18/171
A: Recopilar datos correctos de MASTER_INVENTORY
P: Reescribir secciones de schemas y modulos
V: Verificar coherencia con DDL actual
E: Editar archivo
D: Log de cambios
```

### TAREA-S3-02: Crear ADR-033 y Resolver Gaps (CAPVED)
**Prioridad:** P0 | **Hallazgos:** DOC-015, DOC-016 | **Esfuerzo:** 3-4h

```
C: Expansion 8→18 schemas sin ADR, 5 gaps numeracion
A: Investigar razones de expansion, documentar alternativas
P: Crear ADR-033, resolver gaps ADR-004-006, ADR-024-025
V: Verificar coherencia con ADRs existentes
E: Crear archivos
D: Actualizar README.md de ADRs
```

**Subtareas:**

| ID | Subtarea | Agente |
|----|----------|--------|
| S3-02a | Crear ADR-033: Evolucion Schemas 8→18 | SA-ADR-01 |
| S3-02b | Crear stubs ADR-004 a ADR-006 (numeros saltados) | SA-ADR-02 |
| S3-02c | Crear stubs ADR-024, ADR-025 (numeros saltados) | SA-ADR-02 |
| S3-02d | Agregar campo Status a ADRs 027-032 | SA-ADR-03 |
| S3-02e | Corregir refs "docs/97-adr/" → "docs/90-adr/" | SA-ADR-04 |

### TAREA-S3-03: Expandir DocumentoDeDiseño (CAPVED)
**Prioridad:** P0 | **Hallazgo:** DOC-021 | **Esfuerzo:** 5-7h

```
C: Design doc no cubre achievements, missions, leaderboards, streaks, social
A: Recopilar info de ET-GAM-001/007/008/009 y EAI-003
P: Crear secciones 6-10 del design doc
V: Verificar coherencia con implementacion
E: Editar DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md (o crear v7.0)
D: Actualizar version y changelog interno
```

**Subtareas (paralelizables):**

| ID | Seccion | Fuente | Agente |
|----|---------|--------|--------|
| S3-03a | Seccion 6: Sistema de Logros (Achievements) | ET-GAM-001 | SA-BL-01 |
| S3-03b | Seccion 7: Sistema de Misiones (Missions) | ET-GAM-008 | SA-BL-02 |
| S3-03c | Seccion 8: Tablas de Lideres (Leaderboards) | ET-GAM-007 | SA-BL-03 |
| S3-03d | Seccion 9: Rachas y Engagement (Streaks) | ET-GAM-009 | SA-BL-04 |
| S3-03e | Seccion 10: Features Sociales | EAI-003/EAI-003-EXT | SA-BL-05 |
| S3-03f | Seccion 11: Ciclo de Vida Ejercicios | CICLO-VIDA-EJERCICIO.md | SA-BL-06 |

### TAREA-S3-04: Actualizar DDL-SCHEMA-ORDER y DB Docs (CAPVED)
**Prioridad:** P1 | **Hallazgos:** DOC-053, DOC-106 | **Esfuerzo:** 2-3h

```
C: DDL-SCHEMA-ORDER tiene 16 schemas, falta data_warehouse y otros
A: Listar 18 schemas con orden correcto
P: Actualizar archivo
V: Verificar contra DDL real
E: Editar
D: Log
```

### TAREA-S3-05: Resolver API Documentation (CAPVED)
**Prioridad:** P0 | **Hallazgo:** DOC-024 | **Esfuerzo:** 3-4h

```
C: API.md solo cubre auth (~5% de 850 endpoints)
A: Evaluar opciones: expandir markdown vs referir Swagger
P: Decision: Agregar nota Swagger + crear resumen por modulo
V: Verificar que Swagger URL es correcta
E: Actualizar API.md con referencia + crear API-MODULES-INDEX.md
D: Log
```

### TAREA-S3-06: Actualizar Documentacion Database Refs (CAPVED)
**Prioridad:** P1 | **Esfuerzo:** 2-3h

```
C: FK-STRATEGY.md, DESIGN-GUIDELINES.md potencialmente desactualizados
A: Verificar contra DATABASE_INVENTORY v6.0.0
P: Actualizar valores
V: Cross-check
E: Editar
D: Log
```

---

## Sprint 4: Purga, Archivado y Consolidacion (15-20h)

**Objetivo:** Limpiar documentacion obsoleta, archivar temporal, deprecar dead features.
**Dependencia:** Sprint 0 (dead features validados), Sprint 3 (arquitectura actualizada).

### TAREA-S4-01: Purga de Dead Features (CAPVED)
**Prioridad:** P2 | **Hallazgos:** DOC-061 a DOC-072 | **Esfuerzo:** 4-5h
**Dependencia:** TAREA-S0-01 (validacion completada).

```
C: Resultado de validacion de dead features de Sprint 0
A: Para cada feature CONFIRMADA dead: listar todas las referencias
P: Para cada referencia: DEPRECAR (agregar nota) o PURGE (eliminar seccion)
V: Verificar sin placeholders, sin refs rotas
E: Editar archivos afectados
D: Log de purga
```

**Subtareas (por feature, paralelizables):**

| ID | Feature | Docs Estimados | Agente |
|----|---------|---------------|--------|
| S4-01a | Purge "forum" refs | ~26 archivos | SA-PURGE-01 |
| S4-01b | Purge "team_vs_team" refs | ~5 archivos | SA-PURGE-02 |
| S4-01c | Purge/update "boosts" refs (segun resultado S0) | ~16 archivos | SA-PURGE-03 |
| S4-01d | Purge/update "social_interactions" (segun resultado S0) | ~26 archivos | SA-PURGE-04 |

### TAREA-S4-02: Archivar Documentacion Temporal (CAPVED)
**Prioridad:** P1 | **Hallazgos:** DOC-046 a DOC-052 | **Esfuerzo:** 2-3h

```
C: 15+ documentos temporales de 2025-12 y 2026-01 no archivados
A: Clasificar: ARCHIVAR vs INTEGRAR vs PURGE
P: Plan de movimiento
V: Verificar sin refs activas
E: Mover archivos
D: Log
```

**Subtareas:**

| ID | Subtarea | Accion |
|----|----------|--------|
| S4-02a | Crear dirs _archive/ en docs/80-refs/transversal/ | mkdir |
| S4-02b | Mover CORR-009/010/011 + analisis 2026-01 | mv → _archive/2026-01/ |
| S4-02c | Integrar QUICK-REFERENCE-ADMIN en FRONTEND_INV o purge | Evaluar |
| S4-02d | Purge ACTUALIZACION-FRONTEND-2025-11-26 (ya integrado) | rm |
| S4-02e | Evaluar REPORTE-VALIDACION-2025-12-26 | Validar hallazgos → archivar |

### TAREA-S4-03: Revisar Archived Tasks (CAPVED)
**Prioridad:** P2 | **Hallazgos:** DOC-082 a DOC-098 | **Esfuerzo:** 3-4h

```
C: 48 tareas archivadas pueden contener definiciones valiosas
A: Scan superficial de METADATA.yml + deliverables por tarea
P: Extraer definiciones utiles → integrar en docs/
V: Verificar no duplicamos
E: Copiar/mover definiciones
D: Log de extraccion
```

### TAREA-S4-04: Consolidar y Limpiar Stubs (CAPVED)
**Prioridad:** P3 | **Hallazgos:** DOC-103 a DOC-105 | **Esfuerzo:** 2-3h

```
C: 3 directorios stub (20-perfiles, 60-proyectos, 70-onboarding)
A: Evaluar si necesitan contenido o se eliminan
P: Poblar con contenido basico o documentar como "ver 00-vision/"
V: Coherencia con estructura V2
E: Crear contenido minimo o redirect
D: Log
```

### TAREA-S4-05: Paths y Referencias Globales (CAPVED)
**Prioridad:** P1 | **Hallazgos:** DOC-057, DOC-058 | **Esfuerzo:** 1-2h

```
C: refs a "docs/97-adr/", paths absolutos Linux
A: grep global
P: Search and replace
V: Verificar no se rompieron links
E: Editar
D: Log
```

---

## Sprint 5: Cierre, Validacion y Documentacion (8-12h)

**Objetivo:** Validar TODA la remediacion, actualizar inventarios, documentar tarea.
**Dependencia:** Sprints 0-4 completados.

### TAREA-S5-01: Validacion Global Post-Remediacion (CAPVED)
**Prioridad:** P0 | **Esfuerzo:** 3-4h

```
C: Todos los sprints completados
A: Recalcular metricas post-remediacion
P: Ejecutar validaciones cruzadas
V: Score objetivo: 90+/100
E: Documentar gaps residuales
D: Informe de validacion
```

**Subtareas (paralelizables):**

| ID | Validacion | Agente |
|----|-----------|--------|
| S5-01a | Contar RF reales vs REQUIREMENTS-INDEX (objetivo: 100% match) | SA-VAL-05 |
| S5-01b | Comparar metricas en 10 fuentes (objetivo: 0 discrepancias) | SA-VAL-06 |
| S5-01c | Verificar 0 TRACEABILITY duplicados | SA-VAL-07 |
| S5-01d | Verificar 0 refs a "docs/97-adr/" o paths Linux | SA-VAL-08 |
| S5-01e | Verificar ARCHITECTURE.md dice 18 schemas | SA-VAL-09 |
| S5-01f | Verificar Design Doc tiene secciones 6-11 | SA-VAL-10 |

### TAREA-S5-02: Actualizar Inventarios Master (CAPVED)
**Prioridad:** P1 | **Esfuerzo:** 2-3h

```
C: Post-remediacion, inventarios pueden necesitar bump
A: Verificar si metricas cambiaron
P: Bump versions si necesario
V: Cross-check
E: Editar
D: Log
```

### TAREA-S5-03: Documentacion Final CAPVED (CAPVED)
**Prioridad:** P0 | **Esfuerzo:** 2-3h

```
C: Tarea completa
A: Compilar resultados
P: Escribir documentos de cierre
V: Checklist post-task
E: Crear 04-VALIDACION.md, 05-EJECUCION.md, 06-DOCUMENTACION.md
D: Actualizar METADATA.yml, _INDEX.yml
```

### TAREA-S5-04: Actualizar _INDEX.yml de Tareas (CAPVED)
**Prioridad:** P0 | **Esfuerzo:** 0.5h

```
C: Nueva tarea completada
A: Verificar formato
P: Agregar entrada
V: YAML valido
E: Editar _INDEX.yml
D: Commit
```

---

## Mapa de Dependencias

```
Sprint 0 (Validacion + Quick Wins)
    │
    ├──→ Sprint 1 (Metricas + SSOT)
    │       │
    │       ├──→ Sprint 2 (Requerimientos RF)
    │       │       │
    │       │       └──→ Sprint 5 (Cierre)
    │       │
    │       └──→ Sprint 3 (Arquitectura + BL)
    │               │
    │               └──→ Sprint 4 (Purga + Consolidacion)
    │                       │
    │                       └──→ Sprint 5 (Cierre)
    │
    └──→ Sprint 4 (Dead features → Purga)
```

**Paralelismo maximo:**
- Sprint 2 y Sprint 3 pueden ejecutarse en PARALELO (despues de Sprint 1)
- Sprint 4 requiere Sprint 0 + Sprint 3
- Sprint 5 requiere TODO completado

---

## Subagentes Planificados

### Resumen por Sprint

| Sprint | Subagentes | Tipo | Paralelismo Max |
|--------|-----------|------|-----------------|
| S0 | 4 validadores + 3 quick wins | Explore + Bash | 4 paralelos |
| S1 | 6 sync + 5 SSOT + 1 reconciliar | Write + Edit | 6 paralelos |
| S2 | 15 RF creators + 1 index updater | Write | 6 paralelos (waves) |
| S3 | 4 ADR + 6 BL + 3 DB + 1 API | Write + Edit | 6 paralelos |
| S4 | 4 purge + 5 archive + 2 clean | Edit + Bash | 4 paralelos |
| S5 | 10 validators + 3 docs | Explore + Write | 6 paralelos |
| **Total** | **~68 subagentes** | | **Max 6 simultaneos** |

### Perfiles de Agente

| Perfil | Rol | Sprints |
|--------|-----|---------|
| VALIDATOR | Verifica existencia/estado en codigo y docs | S0, S5 |
| SYNC_AGENT | Actualiza metricas en archivos | S1 |
| SSOT_AGENT | Consolida trazabilidad y catalogo | S1 |
| RF_CREATOR | Crea archivos RF derivados de US/ET | S2 |
| ADR_WRITER | Crea/actualiza ADRs | S3 |
| BL_WRITER | Expande design doc con logica de negocio | S3 |
| PURGE_AGENT | Limpia refs obsoletas | S4 |
| ARCHIVE_AGENT | Mueve docs a _archive/ | S4 |
| DOC_WRITER | Documenta resultados CAPVED | S5 |

---

## Metricas Objetivo Post-Remediacion

| Metrica | Actual | Objetivo | Delta |
|---------|--------|----------|-------|
| Score Global Documentacion | 68/100 | 90+/100 | +22 |
| RF existentes vs declarados | 28% (31/112) | 95%+ (106+/112) | +67% |
| Fuentes metricas alineadas | 4/10 | 10/10 | +6 |
| TRACEABILITY duplicados | 3 | 1 | -2 |
| ENTITIES-CATALOG cobertura | 13% (18/141) | 95%+ | +82% |
| ARCHITECTURE.md precision | Incorrecta | Correcta | Fix |
| Dead features validadas | 0/4 | 4/4 | +4 |
| Docs temporales archivados | 0/15 | 15/15 | +15 |
| Design doc secciones | 5 | 11 | +6 |
| ADR gaps resueltos | 0/5 | 5/5 | +5 |

---

## Cronograma Estimado

```
Dia 1:  Sprint 0 (4-6h) ─────────────────────────────────── COMPLETO
Dia 2:  Sprint 1 (12-16h) ──────────────────────────────── COMPLETO
Dia 3:  Sprint 1 (cont) + Sprint 2 inicio ─────────────── EN PROGRESO
Dia 4:  Sprint 2 (paralelo) + Sprint 3 inicio ─────────── EN PROGRESO
Dia 5:  Sprint 2 (cont) + Sprint 3 (paralelo) ─────────── EN PROGRESO
Dia 6:  Sprint 3 (cont) + Sprint 4 inicio ─────────────── EN PROGRESO
Dia 7:  Sprint 4 (cont) ────────────────────────────────── COMPLETO
Dia 8:  Sprint 5 (cierre) ──────────────────────────────── COMPLETO
```

**Total:** 8 dias habiles (~2 semanas calendario con margen)
**Esfuerzo real:** 90-120h (55-75h con paralelismo)
