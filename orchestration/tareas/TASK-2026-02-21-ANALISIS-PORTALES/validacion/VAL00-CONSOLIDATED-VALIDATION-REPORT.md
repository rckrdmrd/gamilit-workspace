# VAL00 - Consolidated Validation Report

**Fecha:** 2026-02-21 | **Version:** 1.0.0
**Proyecto:** GAMILIT — Plataforma educativa gamificada
**Ambito:** 49 archivos modificados + 1 nuevo (changeset activo)
**Reportes consolidados:** VAL01 through VAL06

---

## Resumen Ejecutivo

### Score General

| Dimension | Score | Estado | Fuente |
|-----------|-------|--------|--------|
| Frontend Standards (STANDARD-*) | 55% | FAIL | VAL01 |
| Backend Standards (SOLID/Clean Architecture) | 48% | FAIL | VAL02 |
| Flow Documentation Alignment | 89% | WARN | VAL03 |
| Development Principles | 63% | WARN | VAL04 |
| WCAG Accessibility | 2.3% archivos PASS | FAIL | VAL05 |
| Detective Theme Compliance | ~50% | FAIL | VAL05 |
| Inventory & Documentation Accuracy | 54% | FAIL | VAL06 |

### Score Promedio Ponderado: 52%

> **Ponderacion aplicada:** Frontend Standards 20%, Backend Standards 15%, Flow Documentation 10%, Principles 15%, WCAG 20%, Detective Theme 10%, Inventory 10%.

> **Contexto critico:** La puntuacion global es baja pero NO refleja un sistema disfuncional. El codebase es **funcionalmente solido**: 100% de ejercicios usan FeedbackModal, useExerciseSubmission, UnifiedExerciseLayout, y texto en espanol. Las fallas son **sistematicas y repetitivas** (React.FC en 41 archivos, `import React` en 36, falta de ARIA roles en 25+), lo que significa que **correcciones automatizadas elevarian la puntuacion significativamente**. Una pasada de linting + ARIA + tokens detective sobre los shared components (ProgressTracker, TimerWidget, ScoreDisplay) propagaria mejoras a 30+ archivos consumidores.

---

## Top 10 Hallazgos Criticos (Cross-Validation)

Estos hallazgos fueron identificados en **multiples reportes** o representan riesgo funcional/seguridad directo.

| # | Hallazgo | Severidad | Reportes | Impacto |
|---|----------|-----------|----------|---------|
| 1 | **ExerciseTypeSelector no muestra Modulos 4 y 5** — EXERCISE_TYPES hardcodeado con 17 tipos (M1-M3 solamente), registrations.ts tiene 30. Admin no puede crear ejercicios de M4/M5. | P0 | VAL01, VAL04 | Funcionalidad bloqueada |
| 2 | **Campo `hintsAllowed` duplicado en StepBasicInfo.tsx** — Aparece en dos secciones del formulario admin. Bug de UX confirmado. | P0 | VAL04 | Bug de UX en produccion |
| 3 | **Sin transacciones en claimRewards** — addXp, addCoins, save(submission) ejecutados secuencialmente sin atomicidad. Fallo parcial causa inconsistencia de datos (XP sin ML Coins). | P0 | VAL02 | Integridad de datos |
| 4 | **25/44 archivos FAIL en WCAG** — TimerWidget, ProgressTracker, MatchingCard, ConceptNode, CompletarEspacios sin roles ARIA ni acceso por teclado. Ejercicios completamente inaccesibles para usuarios con discapacidad. | P0 | VAL05 | Accesibilidad critica |
| 5 | **React.FC en 41 archivos + `import React` en 36** — Deuda tecnica sistematica. No causa bugs pero viola 2 estandares en el 80%+ de archivos auditados. | P1 | VAL01, VAL04 | Deuda tecnica |
| 6 | **ExerciseHeader.tsx sin NINGUN token detective** — Usa bg-white, text-gray-900, bg-blue-50. Desviacion total del Detective Theme. Componente visible en TODOS los ejercicios. | P1 | VAL05 | Consistencia visual |
| 7 | **PORTAL-ADMIN-GUIDE.md lista 12 hooks (real: 31)** — 19 hooks no documentados. Severamente desactualizado. Conteos de controllers (17 vs 21) y services (15 vs 18) tambien incorrectos. | P1 | VAL03, VAL06 | Documentacion misleading |
| 8 | **URL de video sin validacion (SSRF risk)** — exercise-submission.service.ts acepta videoUrl del usuario sin validar protocolo/host. Riesgo de SSRF segun OWASP API7. | P1 | VAL02 | Seguridad |
| 9 | **Mock data hardcodeada en 3 componentes de produccion** — RuedaInferencias, AnalisisMemes, ComicDigital tienen datos de Marie Curie/memes como fallback. Si backend no envia datos, se muestran ejercicios falsos sin error. | P1 | VAL04, VAL05 | Integridad funcional |
| 10 | **10 archivos >500 LOC requieren split obligatorio** — RuedaInferencias (818), Podcast (766), QuizTikTok (758), Infografia (673), VideoCarta (666), AnalisisFuentes (587), AnalisisMemes (580), Diario (563), Matriz (554), Tribunal (523). | P2 | VAL01 | Mantenibilidad |

---

## Hallazgos por Categoria

### 1. Frontend Standards (VAL01)

**49 archivos auditados** contra 5 estandares (SC, ST, SI, SU, SA).

| Standard | PASS | WARN | FAIL | Score |
|----------|------|------|------|-------|
| STANDARD-COMPONENT | 6 | 4 | 41 | 13% |
| STANDARD-TYPES | 25 | 9 | 0 | 74% |
| STANDARD-IMPORTS | 7 | 4 | 36 | 15% |
| STANDARD-UX-PATTERNS | 28 | 3 | 0 | 90% |
| STANDARD-API | 1 | 3 | 0 | 25% |
| **Overall** | | | | **55%** |

**Violaciones sistematicas (V-001 a V-004):**
- **V-001:** `React.FC` usage en 41/49 archivos (STANDARD-COMPONENT SC2)
- **V-002:** `import React from 'react'` en 36/49 archivos (SC5/SI)
- **V-003:** Dual exports (named + default) en 24/49 archivos (SC3)
- **V-004:** 10 archivos >500 LOC requieren split obligatorio (SC6)

**Patrones positivos verificados:**
- 100% FeedbackModal adoption en todos los ejercicios
- 100% useExerciseSubmission adoption
- 100% texto en espanol
- 100% UnifiedExerciseLayout adoption
- Zero `any` en archivos de tipos
- lucide-react como unica libreria de iconos

### 2. Backend Standards (VAL02)

**1 archivo auditado:** `exercise-submission.service.ts` (1963 lineas, 11 metodos publicos, 7 privados, 10 dependencias inyectadas).

| Categoria | Resultado |
|-----------|-----------|
| SRP (Single Responsibility) | WARN — 10+ responsabilidades distintas |
| OCP (Open/Closed) | WARN — if/else por tipo de ejercicio |
| LSP (Liskov) | PASS |
| ISP (Interface Segregation) | WARN — sin interfaces segregadas |
| DIP (Dependency Inversion) | **FAIL** — dependencias concretas, sin interfaces de repositorio |
| Clean Architecture | WARN — SQL raw en capa de aplicacion, queries cross-schema |
| Repository Pattern | **FAIL** — sin interfaces, sin mappers |
| Error Handling | PASS (con observaciones) |
| Data Validation | WARN — type casting sin DTO, `as any` en puntos criticos |
| Security | WARN — URL sin sanitizar, IDs en errores, sin auth check en servicio |
| Code Quality | WARN — 1963 lineas, metodos de 100-230 lineas, numeros magicos |
| Transaction Handling | **FAIL** — operaciones multi-step sin transacciones |
| TypeORM Patterns | WARN — schemas hardcodeados, `as any` |
| Logger Usage | PASS |

**Violaciones criticas (CV-01 a CV-07):**
- **CV-01 [HIGH]:** Sin transacciones en claimRewards (addXp -> addCoins -> save sin atomicidad)
- **CV-02 [HIGH]:** Sin interfaces de repositorio (DIP violation, bloquea unit testing real)
- **CV-03 [HIGH]:** SQL raw con 6 schema names hardcodeados en capa de aplicacion
- **CV-04 [MEDIUM]:** URL de video_carta sin validacion SSRF
- **CV-05 [MEDIUM]:** Object.assign muta entidad TypeORM con propiedades transient
- **CV-06 [MEDIUM]:** IDs internos expuestos en mensajes de error
- **CV-07 [LOW-MEDIUM]:** getSubmissionStats carga todos los submissions en memoria

### 3. Flow Documentation Alignment (VAL03)

**8 documentos auditados**, 191 cross-references validadas.

| Document | References | Valid | Stale | Missing | Score |
|----------|-----------|-------|-------|---------|-------|
| FLUJO-CONSTRUCTOR-EJERCICIOS.md | 33 | 29 | 4 | 2 | 88% |
| FLUJO-EJERCICIO-M3-M5.md | 15 | 15 | 0 | 0 | 100% |
| FLUJO-REVISION-MANUAL-M3-M5.md | 13 | 13 | 0 | 0 | 100% |
| GUIA-DETECTIVE-THEME.md | 15 | 15 | 0 | 3 | 100% |
| PORTAL-ADMIN-GUIDE.md | 45 | 32 | 13 | 15+ | 71% |
| docs/30-ux-ui/README.md | 14 | 10 | 4 | 1 | 71% |
| FLUJO-EJERCICIO-COMPLETO.md | 30 | 30 | 0 | 3 | 100% |
| FLUJO-GESTION-GAMIFICACION.md | 26 | 26 | 0 | 0 | 100% |
| **Total** | **191** | **170** | **21** | **24+** | **89%** |

**Misalignments criticos:**
1. **PORTAL-ADMIN-GUIDE.md** es el documento mas desactualizado: 12 hooks documentados (real: 31), 17 controllers (real: 21), 15 services (real: 18). Rutas faltantes: branding, LTI, audit-logs, assignments, notifications.
2. **RBAC claims incorrectos** en PORTAL-ADMIN-GUIDE y FLUJO-CONSTRUCTOR: dicen `admin` o `admin_teacher` pero App.tsx restringe a `super_admin` unicamente. Inaccuracy de seguridad.
3. **Line numbers stale** en FLUJO-CONSTRUCTOR-EJERCICIOS: off by ~30-40 lineas en exercises.controller.ts.
4. **docs/30-ux-ui/README.md** tiene dos conteos de componentes distintos (590 y 580) en el mismo documento.

### 4. Development Principles (VAL04)

**16 archivos analizados** (11 arquitecturales + 5 mecanicas spot-check), 144 evaluaciones totales.

| Principio | PASS | WARN | FAIL | Score |
|-----------|------|------|------|-------|
| DRY | 5 | 9 | 2 | 31% PASS |
| KISS | 7 | 8 | 1 | 44% |
| YAGNI | 7 | 4 | 5 | 44% |
| SOLID | 6 | 9 | 1 | 38% |
| Clean Architecture | 16 | 0 | 0 | 100% |
| SoC (Separation of Concerns) | 16 | 0 | 0 | 100% |
| Anti-Duplicacion | 10 | 5 | 1 | 63% |
| Patterns | 16 | 0 | 0 | 100% |
| Validation | 8 | 7 | 1 | 50% |
| **Totales** | **91** | **42** | **11** | **63%** |

**FAIL items:**
- **FAIL-01:** Campo hintsAllowed duplicado en StepBasicInfo.tsx (DRY)
- **FAIL-02:** ExerciseTypeSelector no muestra M4/M5 (Anti-Duplicacion/YAGNI)
- **FAIL-03:** Mock data hardcodeada en 3 componentes de produccion (YAGNI)
- **FAIL-04:** adaptExerciseData duplica el Registry Pattern (DRY/OCP)
- **FAIL-05:** Patron extraccion de error sin abstraer — 12+ repeticiones (DRY)
- **FAIL-06:** exercise-submission.service.ts con 9 dependencias (SRP)

**Patrones positivos:**
- Clean Architecture: 100% (16/16) — todas las dependencias fluyen correctamente
- Separation of Concerns: 100% (16/16) — UI, logica y datos bien separados
- Patterns: 100% (16/16) — Registry, Adapter, Strategy correctamente aplicados

### 5. WCAG Accessibility (VAL05)

**44 archivos auditados** contra 15 reglas WCAG 2.1 AA.

| Categoria | PASS | WARN | FAIL |
|-----------|------|------|------|
| Admin (4 archivos) | 0 | 2 | 2 |
| Shared Components (8 archivos) | 1 | 1 | 6 |
| Module 1 (8 archivos) | 0 | 3 | 5 |
| Module 2 (8 archivos) | 0 | 1 | 7 |
| Module 3 (5 archivos) | 0 | 4 | 1 |
| Module 4 (8 archivos) | 0 | 5 | 3 |
| Module 5 (3 archivos) | 0 | 2 | 1 |
| **TOTALES** | **1** | **18** | **25** |

**Violaciones WCAG criticas (11):**

| # | Componente | Violacion | Criterio WCAG |
|---|-----------|-----------|---------------|
| 1 | TimerWidget | Sin `role="timer"`, `aria-live`, `aria-label` | 4.1.2 |
| 2 | ProgressTracker | Sin `role="progressbar"`, `aria-valuenow/min/max` | 4.1.2 |
| 3 | CountdownTimer | Sin `role="timer"`, sin sr-only al tiempo critico | 4.1.2, 4.1.3 |
| 4 | MatchingCard | div interactivo sin role, tabIndex, teclado | 2.1.1 |
| 5 | ConceptNode | div arrastrable sin accesibilidad de teclado | 2.1.1 |
| 6 | WheelSpinner | Ruleta sin alternativa de teclado ni aria-live | 2.1.1, 4.1.3 |
| 7 | CompletarEspacios | Blancos como span sin role ni teclado | 2.1.1 |
| 8 | CausaEfectoExercise | DnD HTML5 sin alternativa teclado | 2.1.1 |
| 9 | StepBasicInfo | 10 inputs sin htmlFor/id | 1.3.1 |
| 10 | CreateModuleModal | 7 inputs sin htmlFor/id; error sin role="alert" | 1.3.1, 4.1.3 |
| 11 | ExerciseTypeSelector | Tabs sin role="tablist"/"tab", aria-selected | 4.1.2 |

**Componentes que propagan fallas a multiples ejercicios:**
- `ProgressTracker` — usado en 8+ ejercicios
- `TimerWidget` — usado en ejercicios con tiempo limite
- `ExerciseHeader` — visible en TODOS los ejercicios

### 6. Detective Theme (VAL05)

**7 violaciones criticas de tema identificadas:**

| # | Archivo | Violacion |
|---|---------|-----------|
| 1 | ExerciseHeader.tsx | CERO tokens detective — todo bg-white, text-gray-900, bg-blue-50 |
| 2 | ExerciseGradientHeader.tsx | Default gradient `from-indigo-600` — indigo no es color detective |
| 3 | ProgressTracker.tsx | Todo hardcodeado: bg-orange-500, bg-green-500, bg-gray-300 |
| 4 | ScoreDisplay.tsx | Gradient from-orange-500 to-amber-500 sin tokens detective |
| 5 | TimerWidget.tsx | bg-gray-100 text-gray-700 — no tokens detective |
| 6 | MatchingCard.tsx | bg-blue-500, bg-orange-100, bg-purple-100 — no detective |
| 7 | RuedaInferenciasExercise.tsx | Raw button bg-blue-600; gradient from-blue-600 to-purple-600 |

**Colores hardcodeados mas frecuentes:**

| Color hardcodeado | Frecuencia | Token correcto |
|------------------|-----------|----------------|
| `bg-blue-50`, `border-blue-200`, `text-blue-*` | 15+ usos | `bg-detective-card`, `border-detective-border` |
| `bg-purple-100`, `text-purple-*` | 8+ usos | `bg-detective-bg-secondary` |
| `bg-gray-100`, `text-gray-*` | 10+ usos | `bg-detective-bg-secondary`, `text-detective-text-secondary` |
| `from-indigo-600` en gradients | 2 usos | `from-detective-blue` |

### 7. Inventory & Documentation (VAL06)

**13 checks ejecutados, 7 pasaron (54%).**

| Item | Inventario | Real | Delta | Estado |
|------|-----------|------|-------|--------|
| Zustand stores | 13 | 13 | 0 | PASS |
| Routes | 73 | 73 | 0 | PASS |
| Unique mechanics | 30 | 30 | 0 | PASS |
| API service files | 67 | ~67 | 0 | PASS |
| Admin hooks (INVENTORY) | 31 | 31 | 0 | PASS |
| Admin components | 123 | 124 | +1 | FAIL (minor) |
| Teacher hooks | 24 | 25 | +1 | FAIL (minor) |
| Teacher components | 46 | 50 | +4 | FAIL |
| Total TSX (prod) | 591/592 | 586 | -5/-6 | FAIL (methodology) |
| Memes/ SVG assets | Not documented | 6 files | N/A | UNDOCUMENTED |
| createModule() in API docs | Not documented | Exists | N/A | UNDOCUMENTED |
| submitAsync pattern in mechanics docs | Not documented | 31 files use it | N/A | UNDOCUMENTED |
| PORTAL-ADMIN-GUIDE hooks | 12 | 31 | +19 | **FAIL (HIGH)** |

**Inconsistencias entre inventarios:**
- FRONTEND_INVENTORY.yml resumen: 592 componentes
- MASTER_INVENTORY.yml: 591 componentes
- Conteo real de produccion: 586 componentes
- Los tres valores son distintos. Se necesita un reconteo canonico.

---

## Patrones Positivos Identificados

Los siguientes patrones estan **bien implementados** y deben mantenerse como referencia:

1. **Registry Pattern (registrations.ts):** Excelente implementacion con lazy loading. Single place para registrar ejercicios. 30 tipos correctamente registrados. OCP bien aplicado.

2. **useExerciseSubmission hook:** Patron centralizado para submission a backend. 100% de adopcion en los 30 mecanicos. Evita duplicacion de logica submit/retry/feedback.

3. **UnifiedExerciseLayout + FeedbackModal:** 100% de adopcion. Todos los ejercicios usan el layout estandar y el modal de feedback canonico.

4. **React Query migration:** useContentQueries.ts demuestra migracion correcta de useState+useEffect a useQuery+useMutation. Cache, invalidacion, y loading states manejados apropiadamente.

5. **Adapter Pattern (exerciseAdapter.ts):** adaptToBaseExercise como base compartida. Cada adaptador es puro y testeable.

6. **Clean Architecture compliance (100%):** Todas las dependencias fluyen en la direccion correcta. UI no accede directamente a infraestructura. Hooks como capa de aplicacion.

7. **Separation of Concerns (100%):** UI en JSX, logica en hooks/handlers, datos via React Query. Sin mezcla de capas.

8. **FeedbackModal.tsx como referencia WCAG:** Mejor archivo del conjunto con ariaLabelledBy, aria-label en botones, aria-hidden en iconos decorativos. Debe usarse como modelo.

9. **Texto 100% en espanol:** Todos los archivos auditados muestran texto de usuario en espanol sin mezcla de idiomas.

10. **ExerciseAnswerValidator en backend:** Capa de validacion de estructura de respuestas correctamente implementada.

---

## Violaciones Sistematicas (aparecen en 2+ validaciones)

Estos hallazgos fueron flaggeados por **multiples reportes de validacion** y representan los problemas mas profundos y de mayor prioridad.

### VS-01: ExerciseTypeSelector incompleto (VAL01 + VAL04)
- **VAL01:** EXERCISE_TYPES hardcodeado con 17 tipos (M1-M3). Dual export violation.
- **VAL04:** YAGNI FAIL — funcionalidad incompleta. Anti-Duplicacion WARN — duplica registrations.ts parcialmente.
- **Impacto:** Admin no puede crear ejercicios de M4/M5. Dos fuentes de verdad para tipos de ejercicio.

### VS-02: Patron error extraction sin abstraer (VAL01 + VAL04)
- **VAL01:** W-003 — Direct apiClient usage in hooks. W-007 — Import order violations con toast.
- **VAL04:** FAIL-05 — 12+ repeticiones del patron `err?.response?.data?.message || fallback` sin funcion helper.
- **Impacto:** 14+ lugares donde la misma logica se repite; cambio en formato de error HTTP requiere editar todos.

### VS-03: Mock data en componentes de produccion (VAL04 + VAL05)
- **VAL04:** FAIL-03 — YAGNI violation en RuedaInferencias, AnalisisMemes, ComicDigital.
- **VAL05:** Los mismos archivos tienen desviaciones de tema en los datos mock (URLs a SVGs locales, textos de Marie Curie).
- **Impacto:** Ejercicios muestran datos falsos cuando backend no responde, sin error visible para el usuario.

### VS-04: Componentes shared propagan fallas (VAL01 + VAL05)
- **VAL01:** ProgressTracker, ScoreDisplay, TimerWidget todos FAIL en SC2 (React.FC) y SI (import React).
- **VAL05:** Los mismos 3 componentes FAIL en WCAG (sin roles ARIA) Y FAIL en tema (colores hardcodeados).
- **Impacto multiplicador:** Cada falla en estos shared components se propaga a 8-30+ ejercicios consumidores. Corregir estos 3 archivos mejora la compliance de ~25 archivos downstream.

### VS-05: exercise-submission.service.ts monolitico (VAL02 + VAL04)
- **VAL02:** SRP WARN (10+ responsabilidades), DIP FAIL (sin interfaces), Transaction FAIL.
- **VAL04:** FAIL-06 (9 dependencias), KISS WARN (constructor sobrecargado).
- **Impacto:** Archivo de 1963 lineas que es punto unico de falla para submission, grading, rewards, notificaciones.

### VS-06: PORTAL-ADMIN-GUIDE.md severamente desactualizado (VAL03 + VAL06)
- **VAL03:** Hooks count 12 vs 31. Controllers 17 vs 21. Services 15 vs 18. Routes faltantes. RBAC claims incorrectos.
- **VAL06:** Mismas discrepancias de conteo confirmadas. Changelog no tiene entrada para React Query migration hooks.
- **Impacto:** Documentacion de referencia para desarrollo admin es misleading. Developers duplican hooks existentes.

### VS-07: Formularios admin sin htmlFor/id (VAL04 + VAL05)
- **VAL04:** StepBasicInfo tiene campo hintsAllowed duplicado (DRY FAIL).
- **VAL05:** StepBasicInfo FAIL (10 inputs sin htmlFor/id), CreateModuleModal FAIL (7 inputs sin htmlFor/id). Errores sin role="alert".
- **Impacto:** 17 campos de formulario inaccesibles para lectores de pantalla. Bug de UX con campo duplicado.

### VS-08: adaptExerciseData duplica Registry Pattern (VAL01 + VAL04)
- **VAL01:** exerciseAdapter.ts tiene 945 lineas con routing duplicado.
- **VAL04:** FAIL-04 — adaptExerciseData mantiene segunda lista de tipos (77 lineas if/else).
- **Impacto:** Agregar nuevo tipo requiere cambios en 2 archivos. Inconsistencia entre registrations.ts y adaptExerciseData.

---

## Plan de Remediacion Consolidado

### Fase 1: Quick Wins (< 1 dia)

| # | Item | Origen | Esfuerzo | Archivos |
|---|------|--------|----------|----------|
| F1-01 | Eliminar campo `hintsAllowed` duplicado en StepBasicInfo.tsx | VAL04 FAIL-01 | 30 min | 1 |
| F1-02 | Agregar `role="progressbar"` + `aria-valuenow/min/max` a ProgressTracker.tsx | VAL05 P1-01 | 30 min | 1 (propaga a 8+) |
| F1-03 | Agregar `role="timer"` + `aria-live="off"` + `aria-label` a TimerWidget.tsx | VAL05 P1-02 | 30 min | 1 (propaga a 5+) |
| F1-04 | Agregar `role="timer"` + sr-only a CountdownTimer.tsx | VAL05 P1-03 | 30 min | 1 |
| F1-05 | Agregar `htmlFor`/`id` a 10 campos en StepBasicInfo.tsx | VAL05 P1-05 | 45 min | 1 |
| F1-06 | Agregar `htmlFor`/`id` a 7 campos + `role="alert"` en CreateModuleModal.tsx | VAL05 P1-05 | 45 min | 1 |
| F1-07 | Agregar `role="tablist"/"tab"` + `aria-selected` en ExerciseTypeSelector.tsx | VAL05 P1-04 | 30 min | 1 |
| F1-08 | Fix RBAC claims en PORTAL-ADMIN-GUIDE.md y FLUJO-CONSTRUCTOR.md (`super_admin` only) | VAL03 P0-1 | 30 min | 2 |
| F1-09 | Fix route `/admin/classroom-teacher` -> `/admin/classroom-teachers` en PORTAL-ADMIN-GUIDE.md | VAL03 P0-2 | 10 min | 1 |
| F1-10 | Crear `extractErrorMessage()` en `@shared/utils/` y reemplazar 14 usos | VAL04 FAIL-05 | 1 hora | 3 |

**Esfuerzo total Fase 1: ~5 horas. Impacto: corrige 5 bugs funcionales, 4 violaciones WCAG criticas con propagacion, 2 inaccuracies de seguridad documental.**

### Fase 2: Sprint Corto (1-2 semanas)

| # | Item | Origen | Esfuerzo | Archivos |
|---|------|--------|----------|----------|
| F2-01 | Agregar Modulos 4 y 5 a ExerciseTypeSelector.tsx (crear fuente de verdad compartida) | VAL01/VAL04 | 4 horas | 2-3 |
| F2-02 | Migrar ExerciseHeader.tsx a tokens detective | VAL05 P2-01 | 2 horas | 1 (propaga a todos los ejercicios) |
| F2-03 | Fix ExerciseGradientHeader gradient: `from-indigo-600` -> `from-blue-600` | VAL05 P2-02 | 30 min | 1 |
| F2-04 | Reparar MatchingCard: agregar role="button" + tabIndex + keyboard handler | VAL05 P1-06 | 2 horas | 1 |
| F2-05 | Reparar CompletarEspacios: span -> button para blancos interactivos | VAL05 P1-07 | 2 horas | 1 |
| F2-06 | Reparar WheelSpinner: aria-label + aria-live para resultado | VAL05 P1-08 | 1 hora | 1 |
| F2-07 | Envolver claimRewards en transaccion TypeORM | VAL02 REC-01 | 4 horas | 1 |
| F2-08 | Agregar UrlValidationService para videoUrl en exercise-submission | VAL02 REC-04 | 2 horas | 1-2 |
| F2-09 | Eliminar mock data de 3 componentes de ejercicio + agregar error handling | VAL04 P1-4 | 3 horas | 3 |
| F2-10 | Migrar ProgressTracker, ScoreDisplay, TimerWidget a tokens detective | VAL05 P3-01 | 3 horas | 3 (propaga a 25+) |
| F2-11 | Agregar `aria-pressed` en VerdaderoFalso y TribunalOpiniones | VAL05 P2-04 | 1 hora | 3 |
| F2-12 | Agregar alternativas teclado para DnD (CausaEfecto, ConceptNode, PuzzleContexto) | VAL05 P2-05 | 6 horas | 3-4 |
| F2-13 | Update PORTAL-ADMIN-GUIDE.md: hooks 12->31, controllers 17->21, add missing routes | VAL03/VAL06 | 3 horas | 1 |
| F2-14 | Document submitAsync pattern in MECANICAS-EDUCATIVAS.md | VAL06 P1-2 | 2 horas | 1 |
| F2-15 | Reconcile TSX counts across FRONTEND_INVENTORY and MASTER_INVENTORY | VAL06 P2-3 | 2 horas | 2 |
| F2-16 | Estandarizar CSS en CreateModuleModal.tsx (usar `input-detective`) | VAL04 P1-5 | 1 hora | 1 |

**Esfuerzo total Fase 2: ~38 horas (~1 sprint de 2 semanas). Impacto: corrige todos los P0/P1, resuelve violaciones WCAG criticas, actualiza documentacion clave.**

### Fase 3: Tech Debt (backlog)

| # | Item | Origen | Esfuerzo |
|---|------|--------|----------|
| F3-01 | Automated linting pass: remove `import React from 'react'` en 36 archivos | VAL01 V-002 | 2 horas |
| F3-02 | Gradual migration: React.FC -> `export function` en 41 archivos (touch-on-change) | VAL01 V-001 | Continuo |
| F3-03 | Split 10 archivos >500 LOC en sub-componentes | VAL01 V-004 | 40 horas |
| F3-04 | Deprecar adaptExerciseData en favor de Registry Pattern | VAL04 FAIL-04 | 4 horas |
| F3-05 | Dividir useContentQueries.ts (708 LOC) en hooks por dominio | VAL04 P2-7 | 4 horas |
| F3-06 | Dividir educationalAPI.ts (1039 LOC) en APIs por dominio | VAL04 P2-8 | 3 horas |
| F3-07 | Crear interfaces de repositorio en modulo progress (DIP fix) | VAL02 REC-02 | 8 horas |
| F3-08 | Mover SQL raw a repositorios de infraestructura | VAL02 REC-03 | 8 horas |
| F3-09 | Separar ExerciseSubmissionService en 4 servicios especializados | VAL02 REC-05 | 16 horas |
| F3-10 | Strategy Pattern para validadores por tipo de ejercicio | VAL02 REC-06 | 8 horas |
| F3-11 | Reemplazar numeros magicos por constantes nombradas | VAL02 REC-07 | 2 horas |
| F3-12 | Crear jerarquia de excepciones de dominio | VAL02 REC-11 | 4 horas |
| F3-13 | Agregar paginacion a findPendingReview y findByUserId | VAL02 REC-09 | 2 horas |
| F3-14 | Reemplazar getSubmissionStats con query SQL agregada | VAL02 REC-10 | 2 horas |
| F3-15 | Agregar aria-hidden a iconos decorativos (6 archivos) | VAL05 P3-03 | 1 hora |
| F3-16 | Estandarizar badges en ejercicios a tokens detective | VAL05 P3-04 | 2 horas |
| F3-17 | Reemplazar spinners manuales con LoadingSpinner canonico | VAL05 P3-05 | 1 hora |
| F3-18 | Mover mock data de educationalAPI a archivo separado | VAL04 P3-10 | 1 hora |
| F3-19 | Limpiar tags de fix/bug en logs de produccion del backend | VAL02 REC-12 | 1 hora |
| F3-20 | Remove line number references from flow docs (use function names) | VAL03 P2-10 | 2 horas |

**Esfuerzo total Fase 3: ~111 horas (~3 sprints).**

### Esfuerzo Estimado Total

| Fase | Items | Esfuerzo | Timeline |
|------|-------|----------|----------|
| Fase 1: Quick Wins | 10 | ~5 horas | < 1 dia |
| Fase 2: Sprint Corto | 16 | ~38 horas | 1-2 semanas |
| Fase 3: Tech Debt | 20 | ~111 horas | 3 sprints (backlog) |
| **TOTAL** | **46** | **~154 horas** | **~8 semanas** |

---

## Metricas Finales

| Metrica | Valor |
|---------|-------|
| Total archivos auditados (codigo) | 49 (48 modified + 1 new) |
| Total archivos auditados (WCAG+Tema) | 44 |
| Total archivos auditados (docs) | 8 documentos, 191 cross-references |
| Total archivos auditados (inventarios) | 2 inventarios, 13 checks |
| Total reglas verificadas | 5 FE standards + 9 BE standards + 9 principles + 15 WCAG rules + 10 theme rules = **48 reglas** |
| | |
| **Frontend Standards** | |
| PASS | 63/245 checks (26%) |
| WARN | 23/245 checks (9%) |
| FAIL | 77/245 checks (31%) |
| N/A | 82/245 checks (33%) |
| | |
| **Development Principles** | |
| PASS | 91/144 evaluaciones (63%) |
| WARN | 42/144 evaluaciones (29%) |
| FAIL | 11/144 evaluaciones (8%) |
| | |
| **WCAG + Theme** | |
| Archivos PASS | 1/44 (2.3%) |
| Archivos WARN | 18/44 (40.9%) |
| Archivos FAIL | 25/44 (56.8%) |
| Violaciones WCAG criticas | 11 |
| Violaciones tema criticas | 7 |
| | |
| **Backend** | |
| Categorias PASS | 3/15 (20%) |
| Categorias WARN | 9/15 (60%) |
| Categorias FAIL | 3/15 (20%) |
| Violaciones criticas (CV) | 7 |
| | |
| **Documentacion** | |
| Cross-references valid | 170/191 (89%) |
| Inventory checks PASS | 7/13 (54%) |
| | |
| **Consolidado** | |
| Violaciones criticas P0 | 4 (hintsAllowed dup, M4/M5 missing, transactions, WCAG blocking) |
| Violaciones altas P1 | 9 (React.FC, import React, ExerciseHeader theme, SSRF, mocks, admin guide, 3 shared WCAG) |
| Violaciones medias P2 | 13 |
| Violaciones bajas P3 | 20 |
| Violaciones sistematicas (multi-reporte) | 8 |
| Items de remediacion totales | 46 |
| Esfuerzo estimado total | ~154 horas |

---

## Apendice: Mapeo de Violaciones Deduplicadas

Las siguientes violaciones aparecen en multiples reportes VAL01-VAL06. Se listan una sola vez con todas las referencias cruzadas.

| ID Consolidado | VAL01 | VAL02 | VAL03 | VAL04 | VAL05 | VAL06 | Descripcion |
|----------------|-------|-------|-------|-------|-------|-------|-------------|
| CS-001 | V-001 | — | — | — | — | — | React.FC en 41 archivos |
| CS-002 | V-002 | — | — | — | — | — | import React en 36 archivos |
| CS-003 | V-003 | — | — | — | — | — | Dual exports en 24 archivos |
| CS-004 | V-004 | — | — | — | — | — | 10 archivos >500 LOC |
| CS-005 | W-001 | — | — | — | — | — | Inline types in useContentQueries |
| CS-006 | W-003 | — | — | FAIL-05 | — | — | Error extraction sin abstraer (14+) |
| CS-007 | — | — | — | FAIL-01 | — | — | hintsAllowed duplicado |
| CS-008 | — | — | — | FAIL-02 | — | — | ExerciseTypeSelector sin M4/M5 |
| CS-009 | — | — | — | FAIL-03 | — | — | Mock data en 3 componentes |
| CS-010 | — | — | — | FAIL-04 | — | — | adaptExerciseData duplica Registry |
| CS-011 | — | CV-01 | — | — | — | — | Sin transacciones en claimRewards |
| CS-012 | — | CV-02 | — | FAIL-06 | — | — | DIP + SRP en submission service |
| CS-013 | — | CV-03 | — | — | — | — | SQL raw con schemas hardcodeados |
| CS-014 | — | CV-04 | — | — | — | — | SSRF en videoUrl |
| CS-015 | — | — | — | — | WCAG-11 | — | 11 violaciones WCAG criticas |
| CS-016 | — | — | — | — | THEME-7 | — | 7 violaciones tema criticas |
| CS-017 | — | — | P1-1..6 | — | — | P1-1 | PORTAL-ADMIN-GUIDE desactualizado |
| CS-018 | — | — | P2-7..9 | — | — | — | README.md conteos inconsistentes |
| CS-019 | — | — | — | — | — | P1-2 | submitAsync no documentado |
| CS-020 | — | — | — | — | — | P2-3..5 | Inventarios inconsistentes entre si |

---

*Consolidado generado: 2026-02-21 | Fuentes: VAL01 v2.0.0, VAL02 v1.0.0, VAL03 v1.0.0, VAL04 v1.0.0, VAL05 v1.0.0, VAL06 v1.0.0*
*Sistema: SIMCO v4.0.0 | Agente: Claude Opus 4.6*
