# Auditoria Documental: docs/60-portals/

**Tarea:** P1-1B-5 — Auditoria Estructural de Portales
**Fecha:** 2026-02-27
**Modo:** ANALYSIS (read-only, sin modificar archivos)
**Alcance:** `docs/60-portals/` — todos los archivos y subdirectorios

---

## 1. Inventario Completo de Archivos

### Estructura de Directorios

```
docs/60-portals/                                      DIRECTORIO RAIZ
├── _INDEX.md                                         37 ln
├── README.md                                         23 ln
├── PORTAL-ADMIN-API-REFERENCE.md                    915 ln
├── admin/                                            SUBDIR
│   └── PORTAL-ADMIN-GUIDE.md                       2228 ln  *** >500
├── parents/                                          SUBDIR
│   └── PORTAL-PARENTS-GUIDE.md                      826 ln  *** >500
├── student/                                          SUBDIR
│   ├── PORTAL-STUDENT-GUIDE.md                     1843 ln  *** >500
│   └── specs/                                        SUBDIR
│       ├── _INDEX.md                                  37 ln
│       ├── _MAP.md                                   201 ln
│       ├── README.md                                 858 ln  *** >500
│       ├── ASSIGNMENTS-SPEC.md                       622 ln  *** >500
│       ├── AUTH-PAGES-SPEC.md                        809 ln  *** >500
│       ├── SPEC-ACHIEVEMENTS.md                      241 ln
│       ├── SPEC-API-CONTRACTS.md                     295 ln
│       ├── SPEC-DASHBOARD.md                         268 ln
│       ├── SPEC-EXERCISES.md                         358 ln
│       ├── SPEC-GAMIFICATION.md                      274 ln
│       ├── SPEC-MODULES.md                           212 ln
│       ├── SPEC-MULTIMEDIA.md                        281 ln
│       ├── SPEC-PDF-EXCEL.md                         117 ln
│       ├── SPEC-PROFILE.md                           238 ln
│       ├── SPEC-PROGRESS.md                          233 ln
│       ├── SPEC-SOCIAL.md                            245 ln
│       ├── STUDENT-HOOKS-SPEC.md                    1236 ln  *** >500
│       ├── analysis/                                  SUBDIR
│       │   └── _MAP.md                                30 ln
│       ├── dependencies/                              SUBDIR
│       │   ├── _MAP.md                                16 ln
│       │   └── DEPENDENCY-MATRIX.md                 1112 ln  *** >500
│       ├── gaps/                                      SUBDIR
│       │   ├── _MAP.md                                31 ln
│       │   ├── STUDENT-GAP-001-missions-rewards.md   675 ln  *** >500
│       │   ├── STUDENT-GAP-002-missions-update-progress.md 220 ln
│       │   ├── STUDENT-GAP-006-profile-stats.md      846 ln  *** >500
│       │   ├── STUDENT-GAP-007-settings-persistence.md 1285 ln *** >500
│       │   └── STUDENT-GAP-008-backend-statistics.md 898 ln  *** >500
│       ├── inventory/                                 SUBDIR
│       │   ├── _MAP.md                                16 ln
│       │   └── IMPLEMENTATIONS-2025-11-24.md         967 ln  *** >500
│       └── traces/                                    SUBDIR
│           ├── _MAP.md                                18 ln
│           ├── TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md 426 ln
│           ├── TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md 222 ln
│           └── TRACE-P0-CORRECTIONS.md              1220 ln  *** >500
└── teacher/                                           SUBDIR
    ├── PORTAL-TEACHER-API-REFERENCE.md              1192 ln  *** >500
    ├── PORTAL-TEACHER-FLOWS.md                       761 ln  *** >500
    └── PORTAL-TEACHER-GUIDE.md                       930 ln  *** >500
```

**Total archivos:** 41
**Total lineas:** 15,280 (raiz+principal) + 7,982 (subdirectorios) = 23,262 lineas

---

## 2. Tabla Resumen — Todos los Archivos con Violaciones

| # | Archivo (path desde docs/60-portals/) | Lineas | >500 | Frontmatter | _INDEX.md dir | _MAP.md dir | Naming | Stub | 2FN | 1FN |
|---|---------------------------------------|--------|------|-------------|---------------|-------------|--------|------|-----|-----|
| 1 | `_INDEX.md` | 37 | - | NO | N/A | NO | OK | - | - | OK |
| 2 | `README.md` | 23 | - | NO | N/A | NO | WARN* | - | - | OK |
| 3 | `PORTAL-ADMIN-API-REFERENCE.md` | 915 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 4 | `admin/PORTAL-ADMIN-GUIDE.md` | 2228 | YES | NO | MISS | MISS | OK | - | YES | YES |
| 5 | `parents/PORTAL-PARENTS-GUIDE.md` | 826 | YES | NO | MISS | MISS | OK | - | YES | YES |
| 6 | `student/PORTAL-STUDENT-GUIDE.md` | 1843 | YES | NO | MISS | MISS | OK | - | YES | YES |
| 7 | `student/specs/_INDEX.md` | 37 | - | NO | N/A | N/A | OK | - | - | OK |
| 8 | `student/specs/_MAP.md` | 201 | - | NO | N/A | N/A | OK | - | - | OK |
| 9 | `student/specs/README.md` | 858 | YES | NO | N/A | N/A | WARN* | - | YES | YES |
| 10 | `student/specs/ASSIGNMENTS-SPEC.md` | 622 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 11 | `student/specs/AUTH-PAGES-SPEC.md` | 809 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 12 | `student/specs/SPEC-ACHIEVEMENTS.md` | 241 | - | NO | N/A | N/A | OK | - | - | OK |
| 13 | `student/specs/SPEC-API-CONTRACTS.md` | 295 | - | NO | N/A | N/A | OK | - | - | OK |
| 14 | `student/specs/SPEC-DASHBOARD.md` | 268 | - | NO | N/A | N/A | OK | - | - | OK |
| 15 | `student/specs/SPEC-EXERCISES.md` | 358 | - | NO | N/A | N/A | OK | - | - | OK |
| 16 | `student/specs/SPEC-GAMIFICATION.md` | 274 | - | NO | N/A | N/A | OK | - | - | OK |
| 17 | `student/specs/SPEC-MODULES.md` | 212 | - | NO | N/A | N/A | OK | - | - | OK |
| 18 | `student/specs/SPEC-MULTIMEDIA.md` | 281 | - | NO | N/A | N/A | OK | - | - | OK |
| 19 | `student/specs/SPEC-PDF-EXCEL.md` | 117 | - | NO | N/A | N/A | OK | - | - | OK |
| 20 | `student/specs/SPEC-PROFILE.md` | 238 | - | NO | N/A | N/A | OK | - | - | OK |
| 21 | `student/specs/SPEC-PROGRESS.md` | 233 | - | NO | N/A | N/A | OK | - | - | OK |
| 22 | `student/specs/SPEC-SOCIAL.md` | 245 | - | NO | N/A | N/A | OK | - | - | OK |
| 23 | `student/specs/STUDENT-HOOKS-SPEC.md` | 1236 | YES | NO | N/A | N/A | OK | - | YES | OK |
| 24 | `student/specs/analysis/_MAP.md` | 30 | - | NO | MISS | N/A | OK | - | - | OK |
| 25 | `student/specs/dependencies/_MAP.md` | 16 | - | NO | MISS | N/A | OK | STUB | - | OK |
| 26 | `student/specs/dependencies/DEPENDENCY-MATRIX.md` | 1112 | YES | NO | N/A | N/A | OK | - | YES | YES |
| 27 | `student/specs/gaps/_MAP.md` | 31 | - | NO | MISS | N/A | OK | - | - | OK |
| 28 | `student/specs/gaps/STUDENT-GAP-001-missions-rewards.md` | 675 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 29 | `student/specs/gaps/STUDENT-GAP-002-missions-update-progress.md` | 220 | - | NO | N/A | N/A | OK | - | - | OK |
| 30 | `student/specs/gaps/STUDENT-GAP-006-profile-stats.md` | 846 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 31 | `student/specs/gaps/STUDENT-GAP-007-settings-persistence.md` | 1285 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 32 | `student/specs/gaps/STUDENT-GAP-008-backend-statistics.md` | 898 | YES | NO | N/A | N/A | OK | - | NO | OK |
| 33 | `student/specs/inventory/_MAP.md` | 16 | - | NO | MISS | N/A | OK | STUB | - | OK |
| 34 | `student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | 967 | YES | NO | N/A | N/A | OK | - | YES | YES |
| 35 | `student/specs/traces/_MAP.md` | 18 | - | NO | MISS | N/A | OK | - | - | OK |
| 36 | `student/specs/traces/TRACE-DASHBOARD-ERRORS-FIX-2026-01-04.md` | 426 | - | NO | N/A | N/A | OK | - | - | OK |
| 37 | `student/specs/traces/TRACE-EXERCISE-BUTTONS-FIX-2025-11-29.md` | 222 | - | NO | N/A | N/A | OK | - | - | OK |
| 38 | `student/specs/traces/TRACE-P0-CORRECTIONS.md` | 1220 | YES | NO | N/A | N/A | OK | - | YES | YES |
| 39 | `teacher/PORTAL-TEACHER-API-REFERENCE.md` | 1192 | YES | NO | MISS | MISS | OK | - | NO | OK |
| 40 | `teacher/PORTAL-TEACHER-FLOWS.md` | 761 | YES | NO | MISS | MISS | OK | - | NO | OK |
| 41 | `teacher/PORTAL-TEACHER-GUIDE.md` | 930 | YES | NO | MISS | MISS | OK | - | YES | YES |

**Leyenda:** MISS = falta en directorio padre | WARN* = nombre no UPPERCASE-KEBAB (README.md es convension aceptada) | STUB = <10 lineas de contenido real | YES = violacion presente

---

## 3. Hallazgos por Categoria

### 3.1 Frontmatter YAML — CRITICO (41/41 archivos sin frontmatter)

**Todos los 41 archivos** carecen de bloque frontmatter YAML estandarizado. Ninguno tiene encabezado del tipo:

```yaml
---
title: "..."
type: guide|spec|api-reference|trace|gap|inventory
portal: student|teacher|admin|parents
version: x.y.z
status: VIGENTE|HISTORICO|DEPRECATED
last_updated: YYYY-MM-DD
---
```

Los archivos usan en su lugar metadata embebida en texto plano (ej. `**Version:** 2.0.0`, `**Fecha:** 2026-02-21`), que no es procesable por herramientas de indexacion automatica. Esta es la violacion mas extendida del directorio.

**Prioridad de correccion:** ALTA — afecta 100% de los archivos.

---

### 3.2 Archivos >500 Lineas — CRITICO

**17 archivos** superan el umbral de 500 lineas. Los 2 "definitivamente >1800 lineas" referenciados en la tarea:

| Archivo | Lineas | Nivel |
|---------|--------|-------|
| `admin/PORTAL-ADMIN-GUIDE.md` | **2228** | CRITICO — mayor del directorio |
| `student/PORTAL-STUDENT-GUIDE.md` | **1843** | CRITICO |
| `student/specs/gaps/STUDENT-GAP-007-settings-persistence.md` | 1285 | ALTO |
| `student/specs/traces/TRACE-P0-CORRECTIONS.md` | 1220 | ALTO |
| `student/specs/STUDENT-HOOKS-SPEC.md` | 1236 | ALTO |
| `student/specs/dependencies/DEPENDENCY-MATRIX.md` | 1112 | ALTO |
| `teacher/PORTAL-TEACHER-GUIDE.md` | 930 | ALTO |
| `student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | 967 | ALTO |
| `student/specs/gaps/STUDENT-GAP-008-backend-statistics.md` | 898 | ALTO |
| `student/specs/gaps/STUDENT-GAP-006-profile-stats.md` | 846 | MEDIO |
| `student/specs/README.md` | 858 | MEDIO |
| `student/specs/AUTH-PAGES-SPEC.md` | 809 | MEDIO |
| `parents/PORTAL-PARENTS-GUIDE.md` | 826 | MEDIO |
| `student/specs/gaps/STUDENT-GAP-001-missions-rewards.md` | 675 | MEDIO |
| `student/specs/ASSIGNMENTS-SPEC.md` | 622 | MEDIO |
| `teacher/PORTAL-TEACHER-FLOWS.md` | 761 | MEDIO |
| `teacher/PORTAL-TEACHER-API-REFERENCE.md` | 1192 | ALTO |
| `PORTAL-ADMIN-API-REFERENCE.md` | 915 | ALTO |

---

### 3.3 _INDEX.md Faltantes — ALTO

**Directorios sin _INDEX.md:**

| Directorio | Nivel |
|------------|-------|
| `docs/60-portals/admin/` | Falta _INDEX.md |
| `docs/60-portals/parents/` | Falta _INDEX.md |
| `docs/60-portals/student/` | Falta _INDEX.md (tiene specs/_INDEX.md pero no su propio) |
| `docs/60-portals/teacher/` | Falta _INDEX.md |
| `docs/60-portals/student/specs/analysis/` | Falta _INDEX.md (solo tiene _MAP.md) |
| `docs/60-portals/student/specs/dependencies/` | Falta _INDEX.md (solo tiene _MAP.md) |
| `docs/60-portals/student/specs/gaps/` | Falta _INDEX.md (solo tiene _MAP.md) |
| `docs/60-portals/student/specs/inventory/` | Falta _INDEX.md (solo tiene _MAP.md) |
| `docs/60-portals/student/specs/traces/` | Falta _INDEX.md (solo tiene _MAP.md) |

**Resumen:** 9 de 11 directorios carecen de _INDEX.md. Solo `docs/60-portals/` (raiz) y `docs/60-portals/student/specs/` tienen _INDEX.md.

---

### 3.4 _MAP.md Faltantes — MEDIO

**Directorios sin _MAP.md:**

| Directorio | Tiene _INDEX.md | Tiene _MAP.md |
|------------|-----------------|---------------|
| `docs/60-portals/` | SI | NO |
| `docs/60-portals/admin/` | NO | NO |
| `docs/60-portals/parents/` | NO | NO |
| `docs/60-portals/student/` | NO | NO |
| `docs/60-portals/teacher/` | NO | NO |

Los subdirectorios `analysis/`, `dependencies/`, `gaps/`, `inventory/`, `traces/` tienen _MAP.md pero no _INDEX.md — la convencion del proyecto requiere ambos (se observa que `student/specs/` es el unico directorio con ambos presentes como modelo completo).

**Resumen:** 5 directorios sin _MAP.md en niveles 1 y 2.

---

### 3.5 Violaciones 2FN — Archivos que Mezclan Topicos Independientes

#### PORTAL-ADMIN-GUIDE.md (2228 lineas) — 2FN SEVERO
Mezcla 15+ topicos independientes:
- Vision general + arquitectura de carpetas (seccion 1-2)
- Modulos funcionales — 18 paginas del portal (seccion 3)
- Patrones de diseno — PageShell, TabBar, formularios (seccion 4)
- Rutas y navegacion (seccion 5)
- **APIs del Portal Admin** (seccion 6) — deberia ser archivo separado (como existe PORTAL-ADMIN-API-REFERENCE.md, hay duplicacion parcial)
- Estado y Stores Zustand (seccion 7)
- Seguridad y RBAC (seccion 8)
- Flujos principales (seccion 9)
- Testing patterns (seccion 10)
- Buenas practicas (seccion 11)
- Troubleshooting (seccion 12)
- Checklist de desarrollo (seccion 13)
- Referencias (seccion 14)
- Ejemplos de codigo completos (seccion 15) — contiene codigo TypeScript extenso

**Topicos separables:** Al menos 5 archivos distintos (architecture, api-reference, patterns, testing, flows).

#### PORTAL-STUDENT-GUIDE.md (1843 lineas) — 2FN SEVERO
Mezcla 17 topicos:
- Vision general + arquitectura (secciones 1-2)
- Modulos principales y componentes (seccion 3)
- Navegacion y rutas (seccion 4)
- Hooks principales (seccion 5) — duplica STUDENT-HOOKS-SPEC.md
- APIs (seccion 6) — duplica SPEC-API-CONTRACTS.md
- Estado y Stores (seccion 7)
- Flujos principales (seccion 8)
- Sistema de gamificacion detallado (seccion 9) — duplica SPEC-GAMIFICATION.md
- Responsive design (seccion 10)
- Buenas practicas (seccion 11)
- Testing (seccion 12)
- Checklist, troubleshooting, performance, seguridad, referencias (secciones 13-17)

**Nota:** Existe superposicion significativa con los archivos `SPEC-*.md` en `student/specs/`. El guide funciona como mega-documento monolitico que duplica contenido ya separado en las specs.

#### PORTAL-TEACHER-GUIDE.md (930 lineas) — 2FN MODERADO
Mezcla:
- Vision general + arquitectura (secciones 1-2)
- Patrones de diseno (seccion 3)
- Buenas practicas (seccion 4)
- APIs del Portal Teacher (seccion 5) — duplica PORTAL-TEACHER-API-REFERENCE.md
- Seguridad (seccion 6)
- Testing (seccion 7)
- Checklist + troubleshooting + referencias (secciones 8-10)

#### PORTAL-PARENTS-GUIDE.md (826 lineas) — 2FN MODERADO
Mezcla en un unico archivo:
- Vision general + arquitectura (secciones 1-2)
- Paginas del portal — 7 paginas detalladas (seccion 3)
- Flujo de autenticacion (seccion 4)
- Integracion API completa (seccion 5)
- Gestion de estado (seccion 6)
- Vinculacion padre-estudiante con codigo (seccion 7)
- Sistema de notificaciones detallado (seccion 8)
- Navegacion y rutas (seccion 9)
- Componentes reutilizables (seccion 10)
- Tipos y DTOs (seccion 11)
- Validaciones y seguridad (seccion 12)
- Tablas BD relacionadas (seccion 13)
- Flujos end-to-end (seccion 14)
- Gaps y pendientes (seccion 15)

**Nota:** El portal Parents no tiene subdirectorio `specs/` — toda la documentacion tecnica esta comprimida en una guia monolitica de 826 lineas.

#### student/specs/README.md (858 lineas) — 2FN SEVERO
Mezcla indice general, metricas, guia de navegacion, documentacion por gap, inventario de implementaciones, matriz de dependencias, trazas del proceso, busqueda rapida y referencias. Es un mega-README que duplica el rol de _INDEX.md y de los subdirectorios especializados.

#### STUDENT-HOOKS-SPEC.md (1236 lineas) — 2FN LEVE
Documenta 14 hooks en 5 categorias. Es 1FN correcto (un topico: hooks del student portal) pero supera el umbral de 500 lineas. La separacion por categoria en archivos individuales mejoraria la navegabilidad. No es violacion pura de 2FN ya que todos los hooks pertenecen al mismo dominio.

#### student/specs/dependencies/DEPENDENCY-MATRIX.md (1112 lineas) — 2FN MODERADO
Mezcla: indice de componentes, matriz de dependencias completa, matriz de acoplamiento, diagramas de flujo de datos, recomendaciones y conclusiones. Combina analisis de dependencias con recomendaciones de arquitectura — topicos relacionados pero separables.

#### student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md (967 lineas) — 2FN SEVERO
Mezcla inventario de archivos, matriz de cambios por gap, matriz de dependencias consolidada, metricas de calidad, cobertura de testing, proximos pasos y notas finales. Es una mezcla de inventario + analisis + planificacion en un solo documento.

#### student/specs/traces/TRACE-P0-CORRECTIONS.md (1220 lineas) — 2FN MODERADO
Incluye reporte completo de 3 gaps distintos (GAP-001, GAP-006, GAP-007) en un solo documento de traza. Cada gap ya tiene su propio archivo en `gaps/`, pero la traza los combina — redundancia parcial con duplicacion de contenido.

---

### 3.6 Violaciones 1FN — Archivos con Multiples Topicos no Relacionados

Los siguientes archivos violan 1FN (cada archivo debe ser UN topico):

| Archivo | Topicos mezclados |
|---------|-------------------|
| `admin/PORTAL-ADMIN-GUIDE.md` | Guide + API reference + Testing + Flows + Patterns + Examples |
| `student/PORTAL-STUDENT-GUIDE.md` | Guide + Hooks (dup STUDENT-HOOKS-SPEC) + APIs (dup SPEC-API-CONTRACTS) + Gamification (dup SPEC-GAMIFICATION) |
| `parents/PORTAL-PARENTS-GUIDE.md` | Guide + API reference + Types/DTOs + DB tables + Flows |
| `student/specs/README.md` | Index + Metrics + Gap docs + Inventory + Dependencies + Traces |
| `student/specs/inventory/IMPLEMENTATIONS-2025-11-24.md` | Inventory + Quality metrics + Testing coverage + Recommendations |
| `student/specs/dependencies/DEPENDENCY-MATRIX.md` | Dependencies + Coupling analysis + Data flow diagrams + Architecture recommendations |
| `student/specs/traces/TRACE-P0-CORRECTIONS.md` | 3 gap traces mezcladas (GAP-001 + GAP-006 + GAP-007) |
| `teacher/PORTAL-TEACHER-GUIDE.md` | Guide + API summary (dup PORTAL-TEACHER-API-REFERENCE) + Patterns + Testing |

---

### 3.7 Archivos Stub (<10 lineas de contenido real)

| Archivo | Lineas totales | Contenido real | Problema |
|---------|---------------|----------------|---------|
| `student/specs/dependencies/_MAP.md` | 16 | ~10 lineas utiles | Borderline stub — lista un solo archivo |
| `student/specs/inventory/_MAP.md` | 16 | ~10 lineas utiles | Borderline stub — lista un solo archivo |
| `student/specs/traces/_MAP.md` | 18 | ~12 lineas utiles | Borderline stub — lista 3 archivos |

Nota: Ningun archivo supera la condicion de stub (<10 lineas absolutas), pero los 3 _MAP.md de subdirectorios son minimalistas con contenido escaso. El directorio `student/specs/analysis/` solo contiene un _MAP.md que actua como redirect — el directorio esta efectivamente vacio de contenido.

---

### 3.8 Convencion de Nombres

**Convencion esperada:** UPPERCASE-KEBAB-CASE para archivos de documentacion.

| Archivo | Estado | Observacion |
|---------|--------|-------------|
| `README.md` (raiz) | WARN | Convencion estandar aceptada en ecosistemas Git, pero inconsistente con el patron UPPERCASE del proyecto |
| `README.md` (student/specs/) | WARN | Mismo caso — deberia ser `_INDEX.md` o `PORTAL-STUDENT-SPECS-OVERVIEW.md` |
| Todos los demas | OK | UPPERCASE-KEBAB-CASE correcto |

Notas adicionales:
- Los archivos `_INDEX.md` y `_MAP.md` usan prefijo underscore — convencion correcta para archivos de navegacion.
- `STUDENT-GAP-00X-*.md` usa numeracion con ceros — convencion interna coherente.
- `TRACE-*.md` e `IMPLEMENTATIONS-*.md` con fechas embebidas en nombre — aceptable para archivos historicos.

---

### 3.9 Cobertura de Portales

| Portal | Directorio | Guia | API Reference | Flujos | Specs | Estado |
|--------|------------|------|---------------|--------|-------|--------|
| Student | `student/` | SI (1843 ln) | Parcial (en SPEC-API-CONTRACTS.md) | NO dedicated | SI (specs/) | COMPLETO pero mal organizado |
| Teacher | `teacher/` | SI (930 ln) | SI (1192 ln) | SI (761 ln) | NO | COMPLETO |
| Admin | `admin/` | SI (2228 ln) | SI (915 ln en raiz) | NO dedicated | NO | INCOMPLETO — API ref en raiz, no en admin/ |
| Parents | `parents/` | SI (826 ln) | Embebida en guia | NO dedicated | NO | INCOMPLETO — todo en un archivo |

**Observaciones de cobertura:**

1. **Admin:** `PORTAL-ADMIN-API-REFERENCE.md` esta en la raiz de `docs/60-portals/` en vez de en `admin/` — ubicacion incorrecta. Los otros 3 portales tienen su API reference dentro del subdirectorio del portal.

2. **Parents:** Unico portal sin subdirectorio `specs/`. Toda la documentacion tecnica (tipos, DTOs, tablas BD, flujos) esta comprimida en `PORTAL-PARENTS-GUIDE.md`. Requiere separacion.

3. **Student:** Portal mejor documentado en terminos de specs, pero con duplicacion significativa entre `PORTAL-STUDENT-GUIDE.md` y los archivos `SPEC-*.md`.

4. **Teacher:** Unico portal con separacion clara (guide + api-reference + flows) aunque sin specs/ dedicado.

5. **Flujos UX/UI:** Ningun portal tiene flujos en `docs/60-portals/`. Los flujos estan en `docs/30-ux-ui/flujos/` — esto es arquitecturalmente correcto segun el _INDEX.md raiz, que apunta explicitamente a ese directorio. Sin embargo, el portal Teacher (PORTAL-TEACHER-FLOWS.md) duplica algunos flujos.

---

### 3.10 Observaciones Adicionales

#### Directorio `analysis/` vacio de contenido
`student/specs/analysis/` contiene solo un `_MAP.md` de 30 lineas que funciona como redirect. Todo el contenido de analisis fue movido a `orchestration/`. El directorio es efectivamente un placeholder vacio.

#### Duplicacion student guide vs specs
`student/PORTAL-STUDENT-GUIDE.md` (1843 ln) tiene secciones que duplican:
- Seccion 5 "Hooks Principales" <-> `specs/STUDENT-HOOKS-SPEC.md` (1236 ln)
- Seccion 6 "APIs del Portal Student" <-> `specs/SPEC-API-CONTRACTS.md` (295 ln)
- Seccion 9 "Sistema de Gamificacion Detallado" <-> `specs/SPEC-GAMIFICATION.md` (274 ln)

La guia principal deberia referenciar las specs, no duplicarlas.

#### PORTAL-ADMIN-API-REFERENCE.md en ubicacion incorrecta
Este archivo (915 ln) esta en `docs/60-portals/` (raiz) cuando deberia estar en `docs/60-portals/admin/`. Es el unico API reference file no ubicado en el subdirectorio de su portal.

#### gaps/ como archivo historico sin cierre
El directorio `student/specs/gaps/` esta marcado como "archivo historico" en su _MAP.md — todos los gaps estan RESUELTOS. Sin embargo, los 5 archivos siguen en el directorio activo sin ser movidos a `_deprecated/` o `_archive/`. Esto crea ruido navegacional.

---

## 4. Conteo de Violaciones por Tipo

| Tipo | Count | Severidad |
|------|-------|-----------|
| Sin frontmatter YAML | 41/41 archivos | ALTA — universal |
| Archivos >500 lineas | 17 archivos | ALTA |
| Archivos >1800 lineas | 2 archivos | CRITICA |
| _INDEX.md faltante en directorio | 9 directorios | ALTA |
| _MAP.md faltante en directorio | 5 directorios | MEDIA |
| Violacion 2FN | 8 archivos | ALTA |
| Violacion 1FN | 8 archivos | ALTA |
| Archivos stub o casi-stub | 3 archivos | BAJA |
| Naming no UPPERCASE | 2 archivos (README.md) | BAJA |
| Ubicacion incorrecta | 1 archivo | MEDIA |
| Directorio vacio de contenido | 1 directorio | BAJA |
| Duplicacion entre archivos | 3 pares | MEDIA |
| Contenido historico sin archivar | 1 directorio (gaps/) | BAJA |

---

## 5. Prioridad de Remediacion

### P0 — Inmediato (estructural critico)
1. Agregar _INDEX.md a los 4 directorios de portal (`admin/`, `parents/`, `student/`, `teacher/`)
2. Agregar _MAP.md a los 4 directorios de portal
3. Mover `PORTAL-ADMIN-API-REFERENCE.md` de la raiz a `admin/`
4. Actualizar `_INDEX.md` raiz tras el movimiento del punto 3

### P1 — Corto plazo (contenido mas urgente)
5. Splitting de `admin/PORTAL-ADMIN-GUIDE.md` (2228 ln) en al menos: guide (vision+arquitectura+patrones), flows, testing-patterns
6. Splitting de `student/PORTAL-STUDENT-GUIDE.md` (1843 ln) eliminando duplicaciones con specs/
7. Crear subdirectorio `parents/specs/` con separacion de API reference, types/DTOs, flows
8. Agregar _INDEX.md a los 5 subdirectorios de `student/specs/` que solo tienen _MAP.md

### P2 — Medio plazo (calidad documental)
9. Agregar frontmatter YAML estandarizado a todos los archivos (41 archivos)
10. Refactorizar `student/specs/README.md` (858 ln) — convertir en _INDEX.md correcto
11. Splitting de `STUDENT-HOOKS-SPEC.md` (1236 ln) por categoria
12. Splitting de `student/specs/dependencies/DEPENDENCY-MATRIX.md` (1112 ln)
13. Mover contenido de `student/specs/gaps/` a `_deprecated/` o subdirectorio `_archive/`

### P3 — Backlog (mejora continua)
14. Renombrar `README.md` en raiz y `student/specs/` a nombres UPPERCASE-KEBAB conformes
15. Limpiar directorio `student/specs/analysis/` (vacio, solo un redirect _MAP.md)
16. Agregar specs/ a portal Teacher (actualmente sin especificaciones tecnicas separadas)

---

## 6. Score de Salud Documental

| Dimension | Score | Detalle |
|-----------|-------|---------|
| Cobertura de portales (4/4 presentes) | 9/10 | Todos presentes, Parents incompleto en estructura |
| Frontmatter YAML | 0/10 | 0% de archivos con frontmatter |
| _INDEX.md coverage | 2/10 | Solo 2/11 directorios tienen _INDEX.md |
| _MAP.md coverage | 6/10 | 6/11 directorios tienen _MAP.md |
| 1FN compliance | 5/10 | 8 archivos con violaciones claras |
| 2FN compliance | 4/10 | 8 archivos mezclando topicos independientes |
| Tamano de archivos | 4/10 | 17/41 archivos >500 ln (41%), 2 >1800 ln |
| Convencion nombres | 9/10 | Solo 2 README.md fuera de convencion |
| Organizacion de contenido | 5/10 | Duplicaciones, ubicacion incorrecta, analisis vacio |
| **TOTAL** | **44/100** | Estado: NECESITA REMEDIACION |

---

*Generado por: Agente ANALYSIS — SIMCO CAPVED*
*Fecha: 2026-02-27*
*Archivos auditados: 41 | Directorios: 11 | Lineas totales: 23,262*
