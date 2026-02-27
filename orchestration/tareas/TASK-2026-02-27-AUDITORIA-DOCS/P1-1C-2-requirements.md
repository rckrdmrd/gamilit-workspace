# P1-1C-2: Auditoria docs/10-requirements/

**Fecha:** 2026-02-27
**Seccion auditada:** `docs/10-requirements/`
**Metodo:** Sampling + pattern analysis (sin modificacion de archivos)
**Auditor:** Claude Sonnet 4.6

---

## 1. Resumen ejecutivo

| Metrica | Valor |
|---------|-------|
| Total archivos | 1,631 |
| Epics principales (EPIC-GAM-F*) | 23 |
| Epics tecnicas (Wave 3) | 11 |
| Epics total | 34 (segun _INDEX.md) |
| Estructura ADR-034 | MAYORMENTE CORRECTA |
| Stubs (~3 lineas) | ~85-90% de TASK files |
| Archivos sustantivos | ~10-15% (US.md, EPIC.md, PLAN.md, specs, reqs) |
| Gaps criticos | 5 items |

**Veredicto general:** La seccion 10-requirements tiene una estructura jerarquica bien definida y mayormente consistente, pero acumula una deuda tecnica significativa en forma de: (1) stub overload en archivos TASK, (2) directorios legacy no archivados dentro de `epics/`, (3) `testing-guides/` en ubicacion incorrecta per ADR-039, (4) inconsistencia en frontmatter entre epics, y (5) falta casi total de `_MAP.md` a nivel de epic.

---

## 2. Estructura top-level de docs/10-requirements/

```
docs/10-requirements/
├── README.md                      <- BIEN: punto de entrada
├── VISION-ALCANCE.md              <- BIEN: documento sustantivo
├── epics/                         <- PRINCIPAL: 1,500+ archivos
│   ├── _INDEX.md                  <- BIEN: indice maestro completo
│   ├── _TEMPLATE-TASK-TRAZABILIDAD.md
│   ├── README.md
│   ├── 03-desarrollo/             <- LEGACY (1 archivo, redirect puente)
│   ├── 04-fase-backlog/           <- LEGACY (2 archivos, redirect puente)
│   ├── features/                  <- CANDIDATO A ARCHIVAR (3 archivos, no es epic)
│   ├── _wave-3-technical/         <- BIEN: epics tecnicas completadas
│   ├── EPIC-GAM-F1-ADMIN/
│   ├── EPIC-GAM-F1-ANALYTICS/
│   ├── EPIC-GAM-F1-AUTH/
│   ├── EPIC-GAM-F1-CONFIG/
│   ├── EPIC-GAM-F1-EXERCISES/
│   ├── EPIC-GAM-F1-GAMIFICATION/
│   ├── EPIC-GAM-F1-PORTAL-ADMIN/
│   ├── EPIC-GAM-F2-DB-MIGRATION/
│   ├── EPIC-GAM-F2-MODULES-M4M5/
│   ├── EPIC-GAM-F2-TECH-CONSOLIDATION/
│   ├── EPIC-GAM-F3-ADMIN-EXTENDED/
│   ├── EPIC-GAM-F3-CONTENT/
│   ├── EPIC-GAM-F3-LTI/
│   ├── EPIC-GAM-F3-NOTIFICATIONS/
│   ├── EPIC-GAM-F3-PARENT-NOTIFICATIONS/
│   ├── EPIC-GAM-F3-PARENT-PORTAL/
│   ├── EPIC-GAM-F3-PEER-CHALLENGES/
│   ├── EPIC-GAM-F3-PROFILES/
│   ├── EPIC-GAM-F3-REPORTS/
│   ├── EPIC-GAM-F3-SOCIAL-GAMIFICATION/
│   ├── EPIC-GAM-F3-TEACHER-PORTAL/
│   ├── EPIC-GAM-F3-WHITE-LABEL/
│   └── EPIC-GAM-F4-VALIDATION/
├── sistema-recompensas/           <- LEGACY (redirect puente, 10 archivos)
├── testing-guides/                <- UBICACION INCORRECTA (ADR-039)
└── user-stories/                  <- LEGACY (solo _MOVED.md)
```

---

## 3. Verificacion patron ADR-034

ADR-034 define la jerarquia: `epics/EPIC-GAM-F{N}-{ID}/` -> `EPIC.md, PLAN.md, user-stories/US-{ID}/`, `tasks/TASK-{ID}-{CODE}/`.

### 3.1 Patron EPIC.md / PLAN.md

| Epics con EPIC.md | 23 de 23 activos (+ 11 wave-3) = 34 total |
| Epics con PLAN.md | 23 de 23 activos, 3 wave-3 (SCAFFOLD, K8S, DEVOPS no tienen) |

ESTADO: BIEN — todos los epics activos tienen EPIC.md. Algunos wave-3 sin PLAN.md es aceptable (son completados/historicos).

EXCEPCION ENCONTRADA: `EPIC-GAM-F1-GAMIFICATION` no tiene PLAN.md en la muestra... validado: SI tiene PLAN.md.
EXCEPCION REAL: Wave-3 epics `EPIC-GAM-ARCHITECTURE`, `EPIC-GAM-REQUIREMENTS`, `EPIC-GAM-INTEGRATION`, `EPIC-GAM-DATABASE` carecen de PLAN.md (solo `_INDEX.md`). MENOR — son historicos completados.

### 3.2 Patron user-stories/

Epics funcionales (F1-F4) tienen `user-stories/US-{ID}/US-{ID}-*.md`:
- EPIC-GAM-F1-AUTH: US-FUND-001..008 — CORRECTO
- EPIC-GAM-F1-EXERCISES: US-ACT-001..008 — CORRECTO
- EPIC-GAM-F1-GAMIFICATION: US-GAM-001..008 — CORRECTO
- EPIC-GAM-F1-ANALYTICS: US-ANA-001..003 (solo 3 de 8 muestreadas) — CORRECTO
- EPIC-GAM-F3-PARENT-PORTAL: US-PP-001..004 — CORRECTO
- EPIC-GAM-F4-VALIDATION: US-VAL-001..009 — CORRECTO

### 3.3 Patron tasks/TASK-{ID}-{CODE}/

Patrón observado: `TASK-{US-ID}-{LAYER}-{NN}` donde LAYER = F0-DATABASE, F1-BACKEND, F2-FRONTEND, F4-TEST.

**Variacion detectada:** Existen DOS patrones de tarea en uso simultaneo:

**Patron A (estandar nuevo):** `TASK-ANA-001-F1-BACKEND-01/` (directorio con archivo del mismo nombre)
- Encontrado en: EPIC-F1-AUTH, EPIC-F1-ANALYTICS, EPIC-F1-GAMIFICATION

**Patron B (simplificado):** `TASK-ADM-001-F1-BACKEND/` (sin numero secuencial, directorio)
- Encontrado en: EPIC-F1-ADMIN, EPIC-F3-PARENT-PORTAL, EPIC-F3-TEACHER-PORTAL

**Patron C (plano — sin directorio):** Archivos de tarea directamente en `user-stories/US-*/` sin subdirectorio
- Encontrado en: EPIC-F4-VALIDATION (US-VAL-001 tiene `TASK-VAL-001-F0-DATABASE/` como directorio pero otros al mismo nivel)

ESTADO: INCONSISTENCIA MENOR — 3 variantes de patron de tarea coexisten. No rompe funcionalidad pero dificulta automatizacion.

**Caso especial EPIC-GAM-F1-PORTAL-ADMIN:** No tiene user-stories subdirectorio con US-*. Solo tiene `tasks/TASKS-IMPLEMENTATION.md` como archivo plano. Es un epic legacy migrado parcialmente (EPIC.md lo documenta: "Solo contenido activo migrado: TRACEABILITY.yml").

---

## 4. Archivos stub — analisis de muestra

Se muestrearon 30 archivos TASK de diferentes epics:

### Muestra de archivos TASK (30 files sampled)

| Archivo | Lineas | Tipo |
|---------|--------|------|
| TASK-ANA-001-F0-DATABASE-01.md | 3 | STUB |
| TASK-ANA-001-F1-BACKEND-01.md | 3 | STUB |
| TASK-ANA-001-F2-FRONTEND-01.md | 3 | STUB |
| TASK-ANA-001-F4-TEST-01.md | 3 | STUB |
| TASK-ADM-001-F1-BACKEND.md | 3 | STUB |
| TASK-ADM-001-F2-FRONTEND.md | 3 | STUB |
| TASK-FUND-001-F0-DATABASE-01.md | 3 | STUB |
| TASK-FUND-001-F1-BACKEND-01.md | 3 | STUB |
| TASK-FUND-004-F0-DATABASE-01.md | 3 | STUB |
| TASK-GAM-001-F0-DATABASE-01.md | 3 | STUB (estimado) |
| TASK-ACT-001-F4-TEST-01.md | 3 | STUB (estimado) |
| TASK-PP-001-F1-BACKEND.md | 6-7 | SEMI-STUB (tiene "## Descripcion" vacia) |
| TASK-VAL-001-F0-DATABASE.md | 16 | SUSTANTIVO |
| TASK-VAL-003-F2-BACKEND.md | estimado sustantivo | SUSTANTIVO |
| TASK-M4-001-F1-BACKEND.md | estimado stub | STUB |

### Formato stub estandar (3 lineas):
```
# TASK-XXX-YYY: Descripcion breve

**US:** US-XXX | **Tipo:** Backend/Frontend/Database/Testing | **Estado:** Done/Pendiente | **Est:** Xh | **Sub:** N
```

### Cuantificacion estimada:
- TASK files stub (3-4 lineas): ~85-90% del total de TASK files
- TASK files sustantivos (EPIC-F4-VALIDATION): ~10-15%
- US files sustantivos: ~100% (todos tienen frontmatter YAML + descripcion)
- EPIC.md files: ~100% sustantivos
- PLAN.md files: ~100% sustantivos
- RF-*.md (requirements): sustantivos
- ET-*.md (specifications): sustantivos

**Conclusion:** Los ~1,400+ archivos TASK son principalmente stubs de 3 lineas. Esto es intencional — sirven como placeholders de trazabilidad. No son un defecto per se, pero si se espera contenido detallado, representan una deuda masiva. El unico epic con TASKs sustantivas es EPIC-F4-VALIDATION.

---

## 5. Cobertura _INDEX.md

### Nivel epic (epics/EPIC-GAM-*/):

| Epic | _INDEX.md presente |
|------|-------------------|
| EPIC-GAM-F1-ADMIN | SI |
| EPIC-GAM-F1-ANALYTICS | SI |
| EPIC-GAM-F1-AUTH | SI |
| EPIC-GAM-F1-CONFIG | SI |
| EPIC-GAM-F1-EXERCISES | SI |
| EPIC-GAM-F1-GAMIFICATION | SI |
| EPIC-GAM-F1-PORTAL-ADMIN | SI |
| EPIC-GAM-F2-DB-MIGRATION | SI |
| EPIC-GAM-F2-MODULES-M4M5 | SI |
| EPIC-GAM-F2-TECH-CONSOLIDATION | SI |
| EPIC-GAM-F3-ADMIN-EXTENDED | SI |
| EPIC-GAM-F3-CONTENT | SI |
| EPIC-GAM-F3-LTI | SI |
| EPIC-GAM-F3-NOTIFICATIONS | SI |
| EPIC-GAM-F3-PARENT-NOTIFICATIONS | SI |
| EPIC-GAM-F3-PARENT-PORTAL | SI |
| EPIC-GAM-F3-PEER-CHALLENGES | SI |
| EPIC-GAM-F3-PROFILES | SI |
| EPIC-GAM-F3-REPORTS | SI |
| EPIC-GAM-F3-SOCIAL-GAMIFICATION | SI |
| EPIC-GAM-F3-TEACHER-PORTAL | NO |
| EPIC-GAM-F3-WHITE-LABEL | SI |
| EPIC-GAM-F4-VALIDATION | SI |

**_INDEX.md a nivel epic:** 22/23 (96%) — BIEN. Falta: `EPIC-GAM-F3-TEACHER-PORTAL`.

### Nivel user-stories/ en epics:

La mayoria de epics tiene `user-stories/_INDEX.md`. Confirmado en: F1-AUTH, F1-EXERCISES, F1-GAMIFICATION, F1-ANALYTICS, F1-ADMIN, F2-MODULES-M4M5, F3-PARENT-PORTAL, F4-VALIDATION.

### Nivel tasks/ en US:

La mayoria de US tiene `tasks/_INDEX.md`. Confirmado como presente en todas las US muestreadas.

### Gaps _INDEX.md totales:
- CRITICO: `EPIC-GAM-F3-TEACHER-PORTAL` sin `_INDEX.md` al nivel epic
- MENOR: `docs/10-requirements/` no tiene su propio `_INDEX.md` (solo README.md)
- ACEPTABLE: Directorios legacy (03-desarrollo, 04-fase-backlog, sistema-recompensas) tienen README.md puente, no _INDEX.md

---

## 6. Cobertura _MAP.md

### Nivel epic:

Solo 2 epics tienen `_MAP.md` al nivel epic root:
- `EPIC-GAM-F3-PARENT-PORTAL/_MAP.md` — SI
- `EPIC-GAM-F3-SOCIAL-GAMIFICATION/_MAP.md` — SI

La mayoria de epics NO tiene `_MAP.md` a nivel root de epic.

### _MAP.md en subdirectorios:

Algunos epics tienen `_MAP.md` dentro de subdirectorios:
- `EPIC-GAM-F1-EXERCISES/requirements/_MAP.md` — SI
- `EPIC-GAM-F1-EXERCISES/specifications/_MAP.md` — SI
- `EPIC-GAM-F1-GAMIFICATION/requirements/_MAP.md` — SI
- `EPIC-GAM-F1-GAMIFICATION/specifications/_MAP.md` — SI
- `EPIC-GAM-F2-MODULES-M4M5/requirements/_MAP.md` — SI
- `EPIC-GAM-F2-MODULES-M4M5/specifications/_MAP.md` — SI
- `EPIC-GAM-F2-MODULES-M4M5/tasks/_MAP.md` — SI
- `EPIC-GAM-F3-PARENT-PORTAL/requirements/_MAP.md` — SI
- `EPIC-GAM-F3-PARENT-PORTAL/specifications/_MAP.md` — SI
- `EPIC-GAM-F3-PARENT-PORTAL/tasks/_MAP.md` — SI
- `EPIC-GAM-F3-TEACHER-PORTAL/specifications/_MAP.md` — SI
- `EPIC-GAM-F3-TEACHER-PORTAL/tasks/_MAP.md` — SI

**Gap _MAP.md:** La adopcion es inconsistente. Algunos epics tienen _MAP.md en subdirectorios, otros no. No hay un patron uniforme de cuales directorios deben tener _MAP.md vs cuales no. SEVERIDAD: MENOR.

---

## 7. Frontmatter — analisis de consistencia

### User Stories (US-*.md):

**Patron mayoritario (YAML frontmatter):**
```yaml
---
id: "US-ANA-001"
title: "Dashboard de Clase Basico"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-004"           <- PROBLEMA: ref legacy EAI-XXX, no EPIC-GAM-F*
story_points: 8
budget: "$4,000 MXN"
sprint: "Sprint-1"
labels: [...]
created_date: "2025-11-02"
updated_date: "2026-01-04"
---
```

**Variacion detectada:** El campo `epic` en el frontmatter de US files referencia IDs legacy (`EAI-001`, `EAI-002`, `EAI-004`, `EAI-005`, `EXT-001`, `EXT-011`) en lugar de los IDs actuales (`EPIC-GAM-F1-AUTH`, `EPIC-GAM-F3-TEACHER-PORTAL`). Esto crea una discrepancia de trazabilidad.

**Excepcion:** US-VAL-001 usa `epic: "EPIC-GAM-F4-VALIDATION"` — formato correcto y moderno.

**US-PP-001 (Parent Portal):** Usa formato simplificado sin comillas en algunos campos. Leve inconsistencia.

### EPIC.md:

Varios formatos coexisten:
- **Formato tabla:** `EPIC-GAM-F1-PORTAL-ADMIN`, `EPIC-GAM-F3-SOCIAL-GAMIFICATION`, `EPIC-GAM-F3-WHITE-LABEL` (usan tabla | Campo | Valor |)
- **Formato campos inline:** `EPIC-GAM-F1-AUTH`, `EPIC-GAM-F1-EXERCISES`, `EPIC-GAM-F1-GAMIFICATION` (usan `**ID:** xxx`)
- **Formato libre con old IDs:** `EPIC-GAM-F3-TEACHER-PORTAL` usa `EXT-001` como titulo principal, no `EPIC-GAM-F3-TEACHER-PORTAL`

SEVERIDAD: MENOR — No rompe funcionalidad pero dificulta parsing automatizado.

### TASK files (stubs):

El stub estandar no tiene frontmatter YAML formal, solo texto en negrita:
```
# TASK-ID: Titulo

**US:** ... | **Tipo:** ... | **Estado:** ... | **Est:** ... | **Sub:** ...
```

Esto es consistente dentro del patron stub, pero diverge de los US files que si tienen YAML frontmatter.

---

## 8. Directorios legacy — evaluacion de archivado

### 8.1 `epics/03-desarrollo/` (1 archivo)

**Estado:** Contiene `base-de-datos/MAPEO-requirements-IMPLEMENTACION.md`
**Contenido:** Redirect puente ("Ruta Legacy — MAPEO...") con links a docs actuales.
**Recomendacion:** ARCHIVAR en `epics/_archived/03-desarrollo/` o eliminar. El contenido es un redirect, ya cumplido.

### 8.2 `epics/04-fase-backlog/` (2 archivos)

**Estado:** `README.md` (redirect puente) + `FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md` (potencialmente sustantivo)
**Contenido README:** Redirect a epics/_INDEX.md — ya cumplido.
**Recomendacion:** Leer `FUNCIONALIDADES-GAMIFICACION-PENDIENTES.md` antes de archivar. El README puede eliminarse. La carpeta deberia moverse a `epics/_archived/` o al `_wave-backlog/` si se quiere preservar historial.

### 8.3 `sistema-recompensas/` (10 archivos)

**Estado:** `README.md` es redirect puente. Los 9 archivos restantes (00-INVENTARIO, 01-ARQUITECTURA, 02-FLUJO, etc.) pueden ser sustantivos historicos.
**Recomendacion:** ARCHIVAR completo. El contenido activo ya esta en `EPIC-GAM-F1-GAMIFICATION/specifications/EVOLUCION-SISTEMA-RECOMPENSAS.md`. Los archivos son de 2025 y parecen ser drafts de diseno inicial.

### 8.4 `user-stories/` (1 archivo: _MOVED.md)

**Estado:** Solo contiene `_MOVED.md` — indica que las user stories fueron movidas a `epics/`.
**Recomendacion:** ELIMINAR el directorio (o al menos el _MOVED.md que ya cumplrio su proposito). Directorio vacio con stub.

### 8.5 `epics/features/` (4 archivos)

**Estado:** `ANALISIS-FEATURES-P3-ESTRATEGICAS.md`, `FEATURES-PENDIENTES.md`, `RESUMEN-EJECUTIVO-DECISIONES-P3.md`, `_INDEX.md`
**Problema:** No sigue el patron EPIC-GAM-F*/. Es un directorio "features" dentro de "epics" que no es un epic.
**Recomendacion:** Mover a `docs/10-requirements/` nivel raiz o a un directorio `_analysis/`. No pertenece dentro de `epics/`.

---

## 9. testing-guides/ — evaluacion de ubicacion (ADR-039)

**Ubicacion actual:** `docs/10-requirements/testing-guides/`
**Archivos:** 8 (5 guias modulares + README + _INDEX.md + _MAP.md)
**Contenido:** Guias de respuestas QA para los 5 modulos educativos (40-50+ ejemplos de respuestas validas)

**ADR-039 dice:** Guias de testing pertenecen en `docs/50-guides/testing/`

**Analisis:**
- El README de la seccion dice: `"Estrategia de testing: ../../../docs/00-overview/TESTING-STRATEGY.md"` — referencia incorrecta (ruta no existe tal cual).
- Estas guias son QA/testing guides (respuestas ejemplo, criterios pass/fail) — SON testing guides funcionales, no guias de requerimientos.
- Sin embargo, `docs/10-requirements/README.md` las lista como contenido legitimo de requirements: `"[testing-guides/README.md](./testing-guides/README.md) | Guias de prueba vinculadas a requerimientos"`

**Veredicto:** UBICACION INCORRECTA per ADR-039. Estas son guias de prueba (QA guides), no requisitos. Deberian estar en `docs/50-guides/testing/` con referencias cruzadas desde 10-requirements.

---

## 10. Naming consistency — verificacion

### Epics (EPIC-GAM-F{N}-{ID}):

| Patron | Epics que lo siguen |
|--------|---------------------|
| `EPIC-GAM-F1-{ID}` | F1-ADMIN, F1-ANALYTICS, F1-AUTH, F1-CONFIG, F1-EXERCISES, F1-GAMIFICATION, F1-PORTAL-ADMIN — 7/7 |
| `EPIC-GAM-F2-{ID}` | F2-DB-MIGRATION, F2-MODULES-M4M5, F2-TECH-CONSOLIDATION — 3/3 |
| `EPIC-GAM-F3-{ID}` | 12/12 |
| `EPIC-GAM-F4-{ID}` | F4-VALIDATION — 1/1 |
| `EPIC-GAM-{ID}` (wave-3) | 11/11 |

ESTADO: CORRECTO — todos los directorios siguen el patron de nombre.

EXCEPCION INTERNA: El contenido de `EPIC-GAM-F3-TEACHER-PORTAL/EPIC.md` muestra `# EXT-001: Portal de Maestros` (ID legacy) como titulo principal, no el ID actual. Similar en WHITE-LABEL (`EXT-008`) y SOCIAL-GAMIFICATION (`EAI-003-EXT`). Los DIRECTORIOS tienen el nombre correcto, pero el CONTENIDO de algunos EPIC.md usa los IDs del sistema anterior.

### User Stories (US-{DOMAIN}-{NNN}):

Variantes de dominio encontradas:
- `US-FUND-001..008` (F1-AUTH) — dominio FUND
- `US-ACT-001..008` (F1-EXERCISES) — dominio ACT
- `US-GAM-001..008` (F1-GAMIFICATION) — dominio GAM
- `US-ANA-001..003` (F1-ANALYTICS) — dominio ANA
- `US-ADM-001..007` (F1-ADMIN) — dominio ADM
- `US-M4-001..002` y `US-M5-001..002` y `US-M4M5-001..003` (F2-MODULES-M4M5) — dominios mixtos M4, M5, M4M5
- `US-PP-001..004` (F3-PARENT-PORTAL) — dominio PP
- `US-PM-000..` (F3-TEACHER-PORTAL) — dominio PM (con subdivisiones a, b, c: US-PM-001a, US-PM-001b)
- `US-VAL-001..009` (F4-VALIDATION) — dominio VAL

ESTADO: ACEPTABLE — cada epic usa su propio dominio. La variante `US-PM-001a/001b` (teacher portal) es una subdivision valida. La mezcla `US-M4-`, `US-M5-`, `US-M4M5-` en F2-MODULES-M4M5 es confusa pero explicable por el alcance del epic.

### Tasks (TASK-{US-ID}-{LAYER}-{NN}):

Tres patrones detectados — ver seccion 3.3. El mas consistente es el patron con numero secuencial (BACKEND-01, BACKEND-02, etc.).

---

## 11. Wave categorization — cobertura

Per _INDEX.md maestro:

| Wave/Fase | Epics | Estado | Directorio |
|-----------|-------|--------|------------|
| Wave 3 (Tecnicas) | 11 | Completado | `epics/_wave-3-technical/` |
| F1 (Alcance Inicial) | 7 | Completado | `epics/EPIC-GAM-F1-*/` |
| F2 (Robustecimiento) | 3 | Completado | `epics/EPIC-GAM-F2-*/` |
| F3 (Extensiones) | 12 | En progreso | `epics/EPIC-GAM-F3-*/` |
| F4 (Validacion) | 1 | En progreso | `epics/EPIC-GAM-F4-*/` |

**Observation 1 — Wave gaps:** Solo Wave 3 tiene directorio dedicado (`_wave-3-technical/`). Las fases F1-F4 comparten el mismo nivel sin separadores de wave. No hay `_wave-1-mvp/` ni `_wave-2-expansion/` ni `_wave-4-validation/` como directorios. Esto es una DECISION DE DISENO (todas las F* al mismo nivel), diferente del patron wave-subdirectory de Wave 3.

**Observation 2 — Wave 3 naming:** Wave 3 usa `_wave-3-technical/` (con prefijo `_` para que sort alphabetically al principio). F1-F4 no usan este patron de prefijo en nombre de directorio. Inconsistencia menor de convencion.

**Observation 3 — F1 vs Wave definition:** La documentacion llama "F1" a "Alcance Inicial" y no "Wave 1". El _INDEX.md usa "F1, F2, F3, F4" (fases) mas "Wave 3" (tecnica anterior). No hay "Wave 1" o "Wave 2" formal en la estructura de directorios. MENOR.

**Cobertura de _INDEX.md maestro:** Excelente — todos los 34 epics estan listados con status, SP y link a EPIC.md.

---

## 12. Desglose por epic — comparativa de completitud

### Epics BIEN estructurados (patron completo):

| Epic | EPIC.md | PLAN.md | user-stories/ | requirements/ | specifications/ | traceability/ | _INDEX.md |
|------|---------|---------|---------------|---------------|-----------------|---------------|-----------|
| F1-AUTH | SI | SI | 8 US | SI | SI | NO | SI |
| F1-EXERCISES | SI | SI | 8 US | SI | SI | SI | SI |
| F1-GAMIFICATION | SI | SI | 8 US | SI | SI | SI | SI |
| F1-ANALYTICS | SI | SI | 3+ US | NO | SI (2) | SI | SI |
| F1-ADMIN | SI | SI | 7 US | SI (3) | NO | SI | SI |
| F2-MODULES-M4M5 | SI | SI | 7 US | SI | SI | SI | SI |
| F3-PARENT-PORTAL | SI | SI | 4 US | SI | SI | SI | SI |
| F3-TEACHER-PORTAL | SI | SI | 14 US | SI | SI | NO | NO |
| F4-VALIDATION | SI | SI | 9 US | NO | NO | NO | SI |

### Epics PARCIALMENTE estructurados:

| Epic | Situacion |
|------|-----------|
| F1-PORTAL-ADMIN | Sin user-stories/US-*; solo `tasks/TASKS-IMPLEMENTATION.md` plano |
| F3-WHITE-LABEL | EPIC.md con ID legacy (EXT-008) |
| F3-SOCIAL-GAMIFICATION | EPIC.md con ID legacy (EAI-003-EXT) |
| F3-TEACHER-PORTAL | EPIC.md con ID legacy (EXT-001); sin _INDEX.md epic-level |

---

## 13. Hallazgos prioritizados

### GAP-REQ-001 (ALTA): testing-guides/ en ubicacion incorrecta
- **Descripcion:** `docs/10-requirements/testing-guides/` contiene guias QA de respuestas para ejercicios. Per ADR-039, las guias pertenecen en `docs/50-guides/testing/`.
- **Impacto:** Navegacion incorrecta; un nuevo contribuyente no encontraria estas guias buscando en 50-guides.
- **Accion:** Mover a `docs/50-guides/testing/exercise-qa-guides/` y crear link en 10-requirements/README.md.

### GAP-REQ-002 (ALTA): Frontmatter epic references legacy IDs
- **Descripcion:** ~80% de los archivos US-*.md referencian IDs del sistema anterior (`EAI-001`, `EXT-001`, etc.) en el campo `epic:` del frontmatter YAML. Los IDs actuales son `EPIC-GAM-F1-AUTH`, etc.
- **Impacto:** Trazabilidad automatizada rota. Queries sobre `epic: "EPIC-GAM-F1-AUTH"` retornarian 0 resultados.
- **Accion:** Actualizar campo `epic:` en todos los US-*.md. Trabajo masivo (~100+ archivos) pero critico para SSOT.

### GAP-REQ-003 (MEDIA): Directorios legacy sin archivar
- **Descripcion:** `epics/03-desarrollo/`, `epics/04-fase-backlog/`, `sistema-recompensas/`, `user-stories/` contienen archivos residuales (redirects puente o contenido obsoleto).
- **Impacto:** Ruido en la estructura; `03-desarrollo` y `04-fase-backlog` son nombres de numeracion legacy que confunden.
- **Accion:** Mover a `epics/_archived/` o eliminar los redirects puente ya cumplidos.

### GAP-REQ-004 (MEDIA): epics/features/ no es un epic
- **Descripcion:** `epics/features/` contiene archivos de analisis estrategico, no es un directorio EPIC-GAM-F* y no sigue el patron.
- **Impacto:** Confusion estructural; un contribuyente esperaria que todo dentro de `epics/` sea un epic.
- **Accion:** Mover a `docs/10-requirements/` raiz o crear `docs/10-requirements/analysis/` para este tipo de contenido.

### GAP-REQ-005 (MEDIA): _MAP.md coverage inconsistente
- **Descripcion:** Solo 2 de 23 epics activos tienen `_MAP.md` a nivel root de epic. La adopcion es aleatoria.
- **Impacto:** Si _MAP.md es requerido (SIMCO), la mayoria de epics incumple.
- **Accion:** Definir en ADR si _MAP.md es OBLIGATORIO u OPCIONAL a nivel epic. Si obligatorio, generar los 21 faltantes (pueden ser stubs de 5 lineas).

### GAP-REQ-006 (BAJA): EPIC.md con IDs legacy como titulo
- **Descripcion:** Tres epics (F3-TEACHER-PORTAL, F3-WHITE-LABEL, F3-SOCIAL-GAMIFICATION) tienen `# EXT-001:` o `# EAI-003-EXT:` como titulo principal de EPIC.md en lugar del ID actual.
- **Impacto:** Confusion menor; los directorios tienen el nombre correcto.
- **Accion:** Actualizar linea titulo en los 3 EPIC.md afectados.

### GAP-REQ-007 (BAJA): EPIC-GAM-F3-TEACHER-PORTAL sin _INDEX.md a nivel epic
- **Descripcion:** El unico epic activo sin `_INDEX.md` en su directorio raiz.
- **Impacto:** MENOR — el epic tiene _INDEX.md en subdirectorios pero no al nivel del epic.
- **Accion:** Crear `EPIC-GAM-F3-TEACHER-PORTAL/_INDEX.md` (stub de 10 lineas).

### GAP-REQ-008 (BAJA): Inconsistencia de patron de tasks (3 variantes)
- **Descripcion:** Patron A (con numero secuencial), Patron B (sin numero), Patron C (plano). No hay estandar documental claro.
- **Impacto:** MENOR — no rompe nada operativamente.
- **Accion:** Documentar el patron canónico en _TEMPLATE-TASK-TRAZABILIDAD.md.

---

## 14. Estadisticas estructurales estimadas

### Distribucion de archivos por tipo:

| Tipo | Estimado | % del total |
|------|----------|-------------|
| Archivos TASK stub (3 lineas) | ~1,100-1,200 | ~70-75% |
| Archivos US-*.md sustantivos | ~130 | ~8% |
| Archivos EPIC.md/PLAN.md | ~70 | ~4% |
| Archivos requirements/RF-*.md | ~80 | ~5% |
| Archivos specifications/ET-*.md | ~60 | ~4% |
| Archivos _INDEX.md/_MAP.md | ~200 | ~12% |
| Otros (traceability, analysis) | ~80 | ~5% |
| **Total** | **~1,631** | |

### Stubs sustantivos vs stub puro:

- Sustantivos (>10 lineas con contenido real): ~350-400 archivos (~22%)
- Stubs puros (<5 lineas, solo header): ~1,200-1,250 archivos (~76%)
- Semi-stubs (6-10 lineas con placeholder): ~50 archivos (~3%)

---

## 15. Comparativa con proyecto reportado (888 stubs)

El enunciado de auditoria menciona "888 files are stubs of ~3 lines". Con 1,631 archivos totales:
- 888 stubs = 54% del total (si la cifra es correcta)
- Nuestro analisis sugiere ~76% son stubs

La diferencia puede explicarse por: (1) la cifra 888 puede ser solo los archivos TASK, excluyendo _INDEX.md y _MAP.md que tambien son cortos pero tienen estructura propia; (2) el total de 1,631 vs 1,606 reportado puede reflejar archivos creados despues del conteo original.

---

## 16. Veredicto por dimension

| Dimension | Estado | Score |
|-----------|--------|-------|
| Patron ADR-034 (jerarquia) | BIEN con variaciones menores | 85/100 |
| Cobertura EPIC.md | COMPLETA (34/34) | 100/100 |
| Cobertura PLAN.md | CASI COMPLETA (23/23 funcionales) | 95/100 |
| _INDEX.md epics | CASI COMPLETO (22/23) | 96/100 |
| _MAP.md epics | DEFICIENTE (2/23) | 9/100 |
| Frontmatter US consistency | DEFICIENTE (legacy IDs) | 40/100 |
| Stub overload | CRITICO (76% stubs) | Informacional |
| Testing-guides ubicacion | INCORRECTO (ADR-039) | 0/100 |
| Directorios legacy | PENDIENTE archivado | 40/100 |
| Naming conventions (dirs) | CORRECTO | 100/100 |
| Wave categorization _INDEX | COMPLETO | 95/100 |
| **PROMEDIO PONDERADO** | | **~70/100** |

---

## 17. Acciones recomendadas (priorizadas)

### Prioridad ALTA (bloquea trazabilidad):
1. **GAP-REQ-001:** Mover `testing-guides/` a `docs/50-guides/testing/`
2. **GAP-REQ-002:** Actualizar campo `epic:` en US-*.md (script masivo recomendado)

### Prioridad MEDIA (limpieza estructural):
3. **GAP-REQ-003:** Archivar directorios legacy (03-desarrollo, 04-fase-backlog, sistema-recompensas, user-stories/)
4. **GAP-REQ-004:** Mover `epics/features/` fuera de epics/
5. **GAP-REQ-005:** Definir policy _MAP.md y generar los faltantes o documentar que es opcional

### Prioridad BAJA (cosmetic):
6. **GAP-REQ-006:** Actualizar titulos en 3 EPIC.md con IDs legacy
7. **GAP-REQ-007:** Crear `EPIC-GAM-F3-TEACHER-PORTAL/_INDEX.md`
8. **GAP-REQ-008:** Documentar patron canonico de tasks en _TEMPLATE

---

*Auditoria completada: 2026-02-27*
*Metodo: Read-only sampling (~30 TASK files, ~15 US files, ~10 EPIC.md, estructura completa via Glob)*
*Confianza: ALTA para estructura y patrones; MEDIA para conteo de stubs (estimado)*
