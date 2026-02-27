# P2-2C-1: Auditoria de Consistencia Terminologica

**Tarea:** TASK-2026-02-27-AUDITORIA-INTEGRAL-DOCS
**Fase:** 2 (Analisis de Calidad)
**Subtarea:** 2C-1 Terminology Consistency
**Fecha:** 2026-02-27
**Agente:** Claude Sonnet 4.6 (read-only)
**Fuente canonica:** `docs/00-overview/GLOSARIO.md` (v2.0.0, 2026-02-11)

---

## RESUMEN EJECUTIVO

| Categoria | Inconsistencias | Severidad |
|-----------|-----------------|-----------|
| Nombres de schema (legacy vs actual) | 6 variantes activas | ALTA |
| Conteo de tipos de ejercicio | 4 valores distintos: 23, 27, 30, 33 | ALTA |
| Terminos de gamificacion (ML Coins) | 3 variantes en uso | MEDIA |
| Nombres de portal | Inconsistencia menor en terminologia | BAJA |
| Terminos de autenticacion | Bilingue por diseno — aceptable | INFO |
| Terminos de usuario (alumno vs estudiante) | Coexistencia parcial | BAJA |
| Multi-tenant/multitenancy | 3 formas — mayoria correcta | BAJA |

---

## 1. NOMBRES DE SCHEMA: LEGACY vs ACTUAL

### 1.1 Schema de Educacion

**Canonico (GLOSARIO.md):** `educational_content`

| Variante | Ocurrencias | Archivos | Tipo |
|----------|-------------|----------|------|
| `educational_content` | ~100+ | COHERENCE-ENTITIES-DDL, TRACEABILITY-US-SCHEMAS, schema-ref/03-education, etc. | CORRECTO |
| `education` (solo) | ~15 | SCHEMA-REFERENCE.md, schema-ref/\_INDEX.md (tabla mapeo), schema-ref/03-education.md (nota legacy) | LEGACY — nombre conceptual de archivo, no schema |
| `educativo` | 0 en contexto schema | — | No aplica |

**Hallazgo:** El archivo `03-education.md` usa el nombre conceptual "education" en el nombre de archivo pero **ya contiene** la nota explicatoria correcta: `"El schema fisico DDL es educational_content"`. El `SCHEMA-REFERENCE.md` dice `"Schema 3: education (13 tablas)"` en su arbol de archivos (solo referencia al nombre del archivo, no del schema).

**Problema real:** `docs/20-architecture/SCHEMA-REFERENCE.md:18` dice:
```
03-education.md           <- Schema 3: education (13 tablas)
```
Esto podria confundir porque llama al schema "education" sin aclarar que el nombre fisico DDL es `educational_content`.

**Archivos con variante legacy sin nota aclaratoria:**
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/SCHEMA-REFERENCE.md` (linea 18)
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md` (linea 21: "modules, exercises, content, gamification, leaderboard...")

### 1.2 Schema de Gamificacion

**Canonico (GLOSARIO.md):** `gamification_system`

| Variante | Ocurrencias | Archivos representativos | Tipo |
|----------|-------------|--------------------------|------|
| `gamification_system` | Predominante | COHERENCE-ENTITIES-DDL, TRACEABILITY-US-SCHEMAS, ADR-007, schema-ref/04 | CORRECTO |
| `gamification` (solo) | ~25+ | ET-GAM-009, ET-GAM-008 (DB_SCHEMAS.GAMIFICATION), PORTAL-TEACHER-FLOWS, ARQUITECTURA-GAMIFICACION | LEGACY/INCONSISTENTE |
| `gamification schema` | ~10 | specs/gaps/STUDENT-GAP-008, specs/dependencies/DEPENDENCY-MATRIX | LEGACY |

**Archivos principales con variante legacy `gamification` (sin `_system`):**
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/ARQUITECTURA-GAMIFICACION.md:377` — `"## Tablas de Base de Datos (Schema gamification)"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md:65` — `"UserStats Repository (gamification schema)"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md:538` — `"// 2. Gamification schema"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md:25` — `"Schema gamification (tablas xp_transactions...)"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/EVOLUCION-SISTEMA-RECOMPENSAS.md:100` — `"**Schema Gamification:**"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/student/specs/gaps/STUDENT-GAP-008-backend-statistics.md:180` — `"nombres de conexion diferentes ('gamification', 'progress')"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/student/specs/dependencies/DEPENDENCY-MATRIX.md:681,750` — `"**Schema:** gamification"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md:21` — lista "gamification" sin "_system"
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-ARCHITECTURE/EPIC.md:33` — igual
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/EPIC.md:68` — lista con "gamification" sin "_system"

**Nota:** `schema-ref/04-gamification.md` tiene nota aclaratoria correcta en linea 7. El problema son los documentos restantes.

### 1.3 Schema Social

**Canonico (GLOSARIO.md):** `social_features`

| Variante | Ocurrencias | Archivos | Tipo |
|----------|-------------|----------|------|
| `social_features` | Predominante | COHERENCE-ENTITIES-DDL, TRACEABILITY-US-SCHEMAS | CORRECTO |
| `social` (solo) | ~5 | MODELO-DATOS.md (tabla mapeo conceptual), EPIC-GAM-DATABASE/EPIC.md | LEGACY/CONCEPTUAL |

**Archivos con variante legacy:**
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/MODELO-DATOS.md:457` — tabla mapeo usa "social" como alias conceptual (tiene nota aclaratoria en tabla)
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md:21` — "social" sin "_features"
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-ARCHITECTURE/EPIC.md:33` — igual

### 1.4 Schema Progress

**Canonico (GLOSARIO.md):** `progress_tracking`

| Variante | Ocurrencias | Archivos | Tipo |
|----------|-------------|----------|------|
| `progress_tracking` | Predominante | ADR-012, TRACEABILITY-US-SCHEMAS, flujos | CORRECTO |
| `progress` (solo) | ~5 | PORTAL-TEACHER-FLOWS.md (codigo comentario), STUDENT-GAP-008 (conexion) | LEGACY/COMENTARIO |

**Archivos con variante legacy:**
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md:62-63` — `"ModuleProgress Repository (progress schema)"`, `"ExerciseSubmission Repository (progress schema)"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md:532` — `"// 1. Progress schema"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/student/specs/gaps/STUDENT-GAP-008-backend-statistics.md:180` — `"nombres de conexion diferentes ('gamification', 'progress')"`

**Nota:** En TypeORM, la clave de conexion puede ser diferente al nombre del schema DDL. Estos usos en codigo de ejemplo pueden ser intencionales si `'progress'` es el nombre de la conexion TypeORM (no el schema DDL).

### 1.5 Schemas Varios en Documentos Historicos

Los documentos `EPIC-GAM-DATABASE/EPIC.md` y `EPIC-GAM-ARCHITECTURE/EPIC.md` usan la lista de schemas legacy con nombres cortos:
```
auth, users, tenants, modules, exercises, content, gamification, leaderboard,
missions, store, achievements, social, teachers, parents, analytics, reports,
notifications, settings
```
Estos son nombres conceptuales del diseno inicial, no los nombres fisicos DDL actuales. Son documentos de epics historicos que no se actualizaron cuando se renombraron los schemas.

---

## 2. CONTEO DE TIPOS DE EJERCICIO: INCONSISTENCIA GRAVE

Este es el hallazgo mas critico. Coexisten **cuatro** numeros distintos en la documentacion:

### 2.1 Los cuatro valores

| Valor | Descripcion | Fuente |
|-------|-------------|--------|
| **23** | Numero mas frecuente en docs generales | GLOSARIO.md, VISION-ALCANCE, MODULOS, ADR-004, ONBOARDING, README, API-REFERENCE, etc. |
| **27** | Numero en especificaciones de ejercicios | ET-EDU-001, RF-EDU-001, GUIA-REFERENCIAS-SIMCO, ET-GAM comentario DDL, schema-ref/03-education (linea 942) |
| **30** | Numero de mecanicas de interaccion frontend | GLOSARIO.md (exercise_mechanic), SPEC-EXERCISES, GUIA-E2E, FLUJO-EJERCICIO-COMPLETO, registrations.ts |
| **33** | Numero real de valores en ENUM DDL | Verificado en auditoria anterior (2026-02-27) |

### 2.2 Archivos con "23 tipos" (mayoria, correcto en sentido semantico externo)

Mas de 30 archivos en: `docs/00-overview/`, `docs/10-requirements/VISION-ALCANCE.md`, `docs/90-adr/ADR-004`, `docs/70-onboarding/`, `docs/40-api/API-REFERENCE.md`, `docs/50-guides/`, etc.

### 2.3 Archivos con "27 mecanicas" (especificacion tecnica interna)

- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/specifications/ET-EDU-001-mecanicas-ejercicios.md` — lineas 82, 126, 136, 784, 802, 1242
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-EXERCISES/requirements/RF-EDU-001-mecanicas-ejercicios.md:41`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/ESQUEMA-44-TABLAS.md:46,182`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F2-DB-MIGRATION/tasks/DATOS-SEED.md:14`
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/schema-reference/03-education.md:942`
- `C:/Empresas/ISEM/gamilit-workspace/docs/50-guides/GUIA-REFERENCIAS-SIMCO.md:69`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/user-stories/US-REP-001/US-REP-001-analytics-profesor.md:131`

### 2.4 Archivos con "30 mecanicas" (mecanicas frontend — distinto concepto)

- `C:/Empresas/ISEM/gamilit-workspace/docs/00-overview/GLOSARIO.md:66` — `"exercise_mechanic ... 30 mecanicas"` (este es CORRECTO — son las mecanicas de interaccion, no los tipos)
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/student/specs/SPEC-EXERCISES.md:304` — `"30 mecánicas registradas en registrations.ts"`
- `C:/Empresas/ISEM/gamilit-workspace/docs/30-ux-ui/flujos/student/FLUJO-EJERCICIO-COMPLETO.md:46,88`
- `C:/Empresas/ISEM/gamilit-workspace/docs/50-guides/frontend/impl/ESTRUCTURA-FEATURES.md:132`
- `C:/Empresas/ISEM/gamilit-workspace/docs/99-delivery/2025-11-16-entrega-final/Manual_Portal_Student_v1.0.md:1628`

### 2.5 Causa raiz y convencion establecida

Segun auditoria previa (2026-02-27) y el GLOSARIO.md:
- `exercise_type` ENUM tiene **33 valores** reales en DDL
- El COMMENT del DDL dice **"27 mecanicas"** como convencion semantica (excluyendo tipos auxiliares no usados directamente)
- **"23 tipos"** es el numero de ejercicios que el producto presenta publicamente (los activamente usados en los 5 modulos mas auxiliares base)
- **"30 mecanicas"** se refiere a `exercise_mechanic` (mecanicas de interaccion frontend, concepto diferente)

**El problema:** Los documentos mezclan los cuatro numeros sin distinguir el concepto. El GLOSARIO.md deberia clarificar esto explicitamente.

---

## 3. TERMINOS DE GAMIFICACION

### 3.1 ML Coins

**Canonico (GLOSARIO.md):** `ML Coins (Maya Literacy Coins)`

| Variante | Ocurrencias (aprox) | Contexto | Evaluacion |
|----------|---------------------|----------|------------|
| `ML Coins` | ~200+ | Texto narrativo, docs de usuario, API docs | CORRECTO |
| `MLCoins` | ~30+ | Codigo TypeScript/TypeORM, tipos, variable names | ACEPTABLE — convencion camelCase de codigo |
| `ml_coins` | ~20+ | SQL, nombres de columnas, DB schemas | ACEPTABLE — convencion snake_case de BD |
| `mlCoins` | ~15+ | API responses (JSON), nomenclatura API | ACEPTABLE — camelCase JSON |
| `Monedas Lectoras` | ~9 | US-GAM-003 (titulo de user story), DATOS-SEED | VARIANTE HISTORICA |
| `monedas virtuales` | 0 encontrado | — | No aplica |
| `Maya Literacy Coins` | ~1 (definicion) | GLOSARIO.md | FORMA COMPLETA, uso correcto |

**Archivos con "Monedas Lectoras" (variante historica, no canonico):**
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/user-stories/US-GAM-003/US-GAM-003-monedas-lectoras.md` — titulo del US (9 ocurrencias internas)
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/TRACEABILITY-US-SCHEMAS.md:58` — `"US-GAM-003 | Monedas Lectoras (MLCoins)"`

**Evaluacion:** La coexistencia de `ML Coins` (texto), `MLCoins` (codigo), `ml_coins` (BD) y `mlCoins` (JSON) es la convencion correcta segun `ESTANDAR-NOMENCLATURA-API.md`. El termino "Monedas Lectoras" es legacy del nombre original del user story. No es un problema critico.

### 3.2 Rangos Maya

**Canonico (GLOSARIO.md):** `Rango Maya` (singular), rangos Maya

| Variante | Ocurrencias (archivos) | Evaluacion |
|----------|------------------------|------------|
| `rangos maya` / `Rango Maya` | ~120+ archivos | CORRECTO |
| `rangos` (solo) | En muchos contextos como abreviacion | ACEPTABLE — abreviacion comun |
| `ranks` (en ingles) | ~2 archivos (US-VAL-007, ET-GAM-003) | ACEPTABLE — codigo TypeScript/ADR |
| `maya ranks` | ~3 archivos (FLUJO-LOGIN-DOCENTE, etc.) | ACEPTABLE — en contexto ingles |

**Evaluacion:** No hay inconsistencia real. Las variantes respetan el contexto (espanol vs ingles, texto vs codigo).

### 3.3 XP / Experience Points

**Canonico (GLOSARIO.md):** `XP (Experience Points)`

| Variante | Archivos | Evaluacion |
|----------|----------|------------|
| `XP` (acronimo) | Predominante en todos los docs | CORRECTO |
| `experience points` (ingles) | En ADR-004, codigo TypeScript | ACEPTABLE — contexto ingles |
| `puntos de experiencia` | En documentos narrativos espanol | CORRECTO — traduccion |
| `xp points` | 0 encontrado — no existe este antipatron | OK |

**Evaluacion:** Consistente.

### 3.4 Logros / Achievements / Badges

**Canonico (GLOSARIO.md):** `Achievement (Logro)`

| Variante | Archivos | Evaluacion |
|----------|----------|------------|
| `achievements` | Muy frecuente en codigo y docs | CORRECTO |
| `logros` | Muy frecuente en docs en espanol | CORRECTO |
| `badges` | Ocasional en docs de usuario y specs | VARIANTE — no canonico para "logro", pero GLOSARIO menciona "badges" en definicion de achievements ("6 categorias: Progress, Streak...") |

**Archivos con "badges" como sinonimo de logros (no canonico):**
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/user-stories/US-PM-006/US-PM-006-bloquear-alumnos-maestro.md:172-173` — "badge rojo/verde" como indicador visual (uso correcto — badge de UI, no logro)
- Varios docs de usuario usan "badges" para referirse a insignias visuales (aceptable en ese contexto)

**Evaluacion:** Bajo riesgo. "badges" se usa correctamente como termino UI (insignia visual), diferente del concepto "Achievement/Logro".

---

## 4. NOMBRES DE PORTAL

**Canonico (GLOSARIO.md):** Student Portal, Teacher Portal, Admin Portal, Parent Portal

| Portal | Variantes encontradas | Predominante |
|--------|----------------------|--------------|
| Estudiante | "Portal Estudiante", "Portal del Estudiante", "Student Portal", "Portal Student" | "Portal Estudiante" o "Student Portal" — coexisten por diseno bilingue |
| Maestro | "Portal Maestro", "Portal de Maestros", "Teacher Portal", "Portal Teacher" | "Portal Maestro" en espanol, "Teacher Portal" en ingles — OK |
| Admin | "Portal Admin", "Portal Administrador", "Admin Portal" | "Portal Admin" mas frecuente — GLOSARIO dice "Admin Portal" |
| Padres | "Portal Padres", "Portal de Padres", "Parent Portal" | Todos aceptables — bilingue por diseno |

**Hallazgo menor:** El GLOSARIO define "Student Portal", "Teacher Portal", "Admin Portal", "Parent Portal" (en ingles). Sin embargo los docs de usuario en espanol usan "Portal Estudiante", "Portal Maestro", etc. Esta dualidad es intencional y aceptable.

**Inconsistencia real:** El archivo `PORTAL-ADMIN-GUIDE.md` y el titulo del portal en la documentacion a veces usan "Admin" y a veces "Administrador". No es un error critico pero afecta la busqueda.

---

## 5. VARIANTES DE USUARIO: ALUMNO vs ESTUDIANTE

**Canonico (GLOSARIO.md):** `student` (rol tecnico), "Estudiante" (concepto)

| Variante | Archivos | Contexto |
|----------|----------|----------|
| `estudiante` / `student` | Predominante (100s de archivos) | CORRECTO |
| `alumno` / `alumnos` | ~25+ archivos | Especificamente en contexto pedagogy (maestro-alumno) |

**Archivos principales con "alumno":**
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/VISION-ALCANCE.md:123` — "Alumnos K-12"
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/user-stories/US-PM-006/US-PM-006-bloquear-alumnos-maestro.md` — titulo y contenido (varios)
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-TEACHER-PORTAL/requirements/RF-TCH-006-bloquear-alumnos.md` — titulo
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-ADMIN-EXTENDED/user-stories/US-AE-005/US-AE-005-parametrizacion-gamificacion.md:207,209,226,279,414,716` — "alumnos" como contexto pedagogico

**Evaluacion:** El termino "alumno" es un sinonimo aceptable de "estudiante" en espanol educativo. Su uso es coherente con el contexto (documentos sobre el rol del maestro hacia sus alumnos). No es un error, pero el GLOSARIO no lo menciona explicitamente como variante aceptada.

---

## 6. VARIANTES DE MAESTRO: DOCENTE vs MAESTRO

**Canonico (GLOSARIO.md):** `teacher` (rol tecnico), "Maestro" (concepto)

| Variante | Archivos | Evaluacion |
|----------|----------|------------|
| `maestro` / `teacher` | Predominante | CORRECTO |
| `docente` | ~120+ archivos | Usado especialmente en flujos del portal maestro |
| `profesor` | ~60+ archivos | Usado en requirements, analytics, reports |

**Archivos relevantes con "docente":**
- `C:/Empresas/ISEM/gamilit-workspace/docs/30-ux-ui/flujos/teacher/FLUJO-DASHBOARD-DOCENTE.md` — titulo completo usa "docente"
- `C:/Empresas/ISEM/gamilit-workspace/docs/30-ux-ui/flujos/teacher/FLUJO-LOGIN-DOCENTE.md` — titulo usa "docente"

**Archivos con "profesor":**
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/requirements/RF-REP-001-analytics-profesor.md` — usa "profesor" en titulo
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F3-REPORTS/user-stories/US-REP-001/US-REP-001-analytics-profesor.md`

**Evaluacion:** Los tres terminos (maestro/docente/profesor) son sinonimos en espanol educativo. El GLOSARIO define "teacher" como canonico pero no prohíbe las variantes espanolas. La coexistencia es funcional aunque no ideal desde el punto de vista de busqueda.

---

## 7. MULTI-TENANT / MULTITENANCY

**Canonico (GLOSARIO.md):** `Multi-tenant`

| Variante | Archivos | Evaluacion |
|----------|----------|------------|
| `multi-tenant` | ~55 archivos | CORRECTO — canonico |
| `multi-tenancy` | ~30 archivos | VARIANTE aceptable (sustantivo vs adjetivo) |
| `multitenancy` | ~15 archivos | VARIANTE menor |
| `multi tenancy` | 0 encontrado | No existe |

**Evaluacion:** La distincion entre "multi-tenant" (adjetivo) y "multi-tenancy" (sustantivo) es gramaticalmente correcta en ingles. ADR-003 se llama `ADR-003-rls-multitenancy.md` usando la forma sin guion. No es inconsistencia critica.

---

## 8. ROW LEVEL SECURITY / RLS

**Canonico (GLOSARIO.md):** `RLS (Row Level Security)` con definicion "Seguridad a nivel de fila"

| Variante | Archivos | Evaluacion |
|----------|----------|------------|
| `RLS` | Predominante | CORRECTO |
| `Row Level Security` | ~20 archivos | CORRECTO — forma completa |
| `seguridad a nivel de fila` | ~5 archivos | CORRECTO — traduccion |
| `row-level security` | ~5 archivos | ACEPTABLE — variante con guion |

**Evaluacion:** Consistente.

---

## 9. GAPS EN EL GLOSARIO

El GLOSARIO.md (v2.0.0) no cubre varios terminos usados ampliamente:

| Termino sin definir | Frecuencia | Recomendacion |
|--------------------|------------|---------------|
| `docente` / `alumno` | Alta | Agregar como sinonimos de teacher/student |
| `comodines` / `power-ups` | Alta | Solo power-ups definido — comodines es la traduccion usada |
| `exercise_type` vs `exercise_mechanic` | Critica | Definicion existe pero NO explica la diferencia entre 23/27/30/33 |
| `mecanica` (mechanic) | Alta | No hay entrada para el concepto de mecanica de ejercicio |
| `aula` / `classroom` | Alta | Concepto fundamental no definido |
| `submission` vs `attempt` | Media | Distincion tecnica importante no explicada |

---

## 10. RESUMEN DE INCONSISTENCIAS POR SEVERIDAD

### ALTA PRIORIDAD (correccion recomendada)

1. **Schema "gamification" vs "gamification_system"** — 10+ archivos usan el nombre legacy sin aclarar que es el nombre conceptual. Archivos principales:
   - `docs/20-architecture/ARQUITECTURA-GAMIFICACION.md:377`
   - `docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md:65,538`
   - `docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md:25`

2. **Conteo de ejercicios: 23 vs 27 vs 30 vs 33** — La ambiguedad sobre cuantos tipos existen requiere aclaracion en GLOSARIO.md. Propuesta de clarificacion:
   - 33 = valores totales del ENUM DDL `exercise_type`
   - 27 = mecanicas con implementacion activa (comentario DDL — convencion semantica)
   - 23 = tipos presentados publicamente en el producto (excluyendo algunos backlog)
   - 30 = mecanicas de interaccion frontend (`exercise_mechanic`, concepto diferente)

### MEDIA PRIORIDAD (documentar para claridad)

3. **Schema "education" en SCHEMA-REFERENCE.md** — El arbol de archivos en `SCHEMA-REFERENCE.md:18` llama al schema "education" sin aclarar que el nombre fisico DDL es `educational_content`.

4. **"Monedas Lectoras" como variante de ML Coins** — Solo en US-GAM-003 y TRACEABILITY. Historico aceptable.

### BAJA PRIORIDAD (aceptable, documentar en GLOSARIO)

5. **alumno/docente/profesor** como variantes de student/teacher — Sinonimos espanoles, uso coherente con contexto.

6. **multi-tenancy vs multi-tenant** — Distincion gramatical correcta en ingles.

7. **Variantes en nombres de portales** — Bilingue por diseno.

---

## 11. ARCHIVOS FUENTE PARA CORRECCIONES FUTURAS

Los siguientes archivos requieren atencion si se decide corregir las inconsistencias de alta prioridad:

**Para corregir "gamification" → "gamification_system":**
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/ARQUITECTURA-GAMIFICACION.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/teacher/PORTAL-TEACHER-FLOWS.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/PLAN.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F1-GAMIFICATION/specifications/EVOLUCION-SISTEMA-RECOMPENSAS.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/60-portals/student/specs/dependencies/DEPENDENCY-MATRIX.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-DATABASE/EPIC.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/_wave-3-technical/EPIC-GAM-ARCHITECTURE/EPIC.md`
- `C:/Empresas/ISEM/gamilit-workspace/docs/10-requirements/epics/EPIC-GAM-F4-VALIDATION/EPIC.md`

**Para aclarar conteo de ejercicios (actualizar GLOSARIO.md):**
- `C:/Empresas/ISEM/gamilit-workspace/docs/00-overview/GLOSARIO.md` — entrada `exercise_type` y `exercise_mechanic`
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/schema-reference/03-education.md:942` — "27 mecanicas" en descripcion

**Para aclarar "education" schema name:**
- `C:/Empresas/ISEM/gamilit-workspace/docs/20-architecture/SCHEMA-REFERENCE.md:18` — agregar comentario "(DDL: educational_content)"

---

## METODOLOGIA DE AUDITORIA

- **Fuente canonica:** `docs/00-overview/GLOSARIO.md` v2.0.0
- **Alcance:** Todo el directorio `docs/` (~500+ archivos .md)
- **Herramientas:** Grep con patrones regex en modo content y count
- **Modo:** READ-ONLY — ningun archivo fue modificado

---

*Reporte generado: 2026-02-27*
*Agente: Claude Sonnet 4.6 | TASK-2026-02-27-AUDITORIA-DOCS | P2-2C-1*
