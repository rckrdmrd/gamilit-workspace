# TRACK-A: Analisis de Paginas del Portal Maestro

**Fecha:** 2026-02-19
**Agente:** Claude Opus 4.6
**Alcance:** 19 paginas del portal teacher + hooks + tipos + componentes compartidos
**Tipo:** Analisis solamente (sin modificaciones a codigo fuente)

---

## 1. Resumen Ejecutivo

### Hallazgos Clave

| Metrica | Valor |
|---------|-------|
| Paginas analizadas | 19 |
| Paginas activas en rutas | 15 |
| Paginas removidas de navegacion | 4 (Communication, Content, Notifications, NotificationPreferences) |
| Adopcion de TeacherPageShell | **0/19 (0%)** |
| Uso de withTeacherLayout HOC (deprecated) | **15/19 (79%)** |
| Uso directo de TeacherLayout | **4/19 (21%)** |
| Paginas con data fetching legacy (useState+useEffect+apiClient) | **5/19 (26%)** |
| Paginas con loading states compartidos | **1/19 (5%)** |
| Paginas con error handling estandarizado | **0/19 (0%)** |
| Paginas con problemas de accesibilidad | **19/19 (100%)** |
| Paginas con tipos inline (no en types/) | **7/19 (37%)** |
| Paginas con imports de rutas relativas | **4/19 (21%)** |
| Paginas con doble layout potencial | **4/19 (21%)** |
| Paginas con datos mock hardcodeados | **1/19 (5%)** |

### Problema Principal

**Ninguna pagina usa TeacherPageShell** (el estandar correcto definido en Phase 3B). Todas las 15 paginas activas usan el HOC deprecated `withTeacherLayout` via App.tsx lazy imports. Las 4 paginas removidas de navegacion usan `TeacherLayout` directamente dentro del componente, lo que causaria doble layout si se reactivaran con el HOC.

### Nivel de Deuda Tecnica

| Prioridad | Cantidad | Descripcion |
|-----------|----------|-------------|
| P0 (Critico) | 3 | Mock data en produccion, doble layout, 0% adopcion PageShell |
| P1 (Alto) | 6 | Data fetching legacy, tipos inline, loading states inconsistentes |
| P2 (Medio) | 8 | Imports inconsistentes, accesibilidad, duplicacion de codigo |

---

## 2. Matriz de Evaluacion

### Leyenda

| Simbolo | Significado |
|---------|-------------|
| OK | Cumple el estandar |
| WARN | Parcialmente cumple / patron suboptimo |
| FAIL | No cumple el estandar / patron legacy |
| N/A | No aplica |

### Matriz Completa (19 paginas x 10 criterios)

| # | Pagina | Layout | Export | Data Fetch | Error | Loading | Empty | Shared | Types | Imports | A11y |
|---|--------|--------|--------|------------|-------|---------|-------|--------|-------|---------|------|
| 1 | TeacherDashboard | FAIL | OK | FAIL | WARN | OK | FAIL | OK | OK | WARN | FAIL |
| 2 | TeacherClasses | FAIL | OK | OK | WARN | FAIL | FAIL | OK | OK | OK | FAIL |
| 3 | TeacherStudents | FAIL | OK | FAIL | FAIL | FAIL | FAIL | OK | FAIL | OK | FAIL |
| 4 | TeacherAssignments | FAIL | OK | OK | WARN | FAIL | WARN | OK | WARN | OK | FAIL |
| 5 | TeacherProgress | FAIL | OK | OK | WARN | FAIL | WARN | OK | OK | WARN | FAIL |
| 6 | TeacherAnalytics | FAIL | OK | OK | WARN | FAIL | FAIL | OK | OK | WARN | FAIL |
| 7 | TeacherReports | FAIL | OK | FAIL | FAIL | FAIL | FAIL | WARN | FAIL | FAIL | FAIL |
| 8 | TeacherCommunication | FAIL | OK | OK | WARN | FAIL | OK | FAIL | WARN | FAIL | FAIL |
| 9 | TeacherContent | FAIL | OK | WARN | N/A | N/A | OK | OK | N/A | OK | N/A |
| 10 | TeacherContentMgmt | FAIL | OK | OK | FAIL | FAIL | FAIL | OK | WARN | OK | WARN |
| 11 | TeacherGamification | FAIL | OK | OK | FAIL | FAIL | FAIL | OK | FAIL | WARN | FAIL |
| 12 | TeacherAlerts | FAIL | OK | OK | N/A | N/A | OK | OK | OK | OK | FAIL |
| 13 | TeacherAlertConfig | FAIL | OK | OK | WARN | FAIL | OK | OK | OK | FAIL | FAIL |
| 14 | TeacherReviewPanel | FAIL | OK | OK | WARN | WARN | WARN | FAIL | WARN | FAIL | FAIL |
| 15 | TeacherMonitoring | FAIL | OK | OK | OK | FAIL | OK | OK | OK | OK | FAIL |
| 16 | TeacherExerciseResp | FAIL | OK | OK | FAIL | WARN | N/A | FAIL | OK | WARN | FAIL |
| 17 | TeacherNotifications | FAIL | OK | WARN | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | WARN |
| 18 | TeacherNotifPrefs | FAIL | OK | WARN | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL | FAIL |
| 19 | TeacherSettings | FAIL | OK | WARN | WARN | N/A | N/A | OK | WARN | OK | WARN |

### Resumen por Criterio

| Criterio | OK | WARN | FAIL | N/A | % Cumplimiento |
|----------|-----|------|------|-----|----------------|
| Layout | 0 | 0 | 19 | 0 | **0%** |
| Export | 19 | 0 | 0 | 0 | **100%** |
| Data Fetch | 10 | 4 | 5 | 0 | **53%** |
| Error | 1 | 7 | 7 | 4 | **7%** (de 15 aplicables) |
| Loading | 1 | 2 | 13 | 3 | **6%** (de 16 aplicables) |
| Empty | 5 | 3 | 8 | 3 | **31%** (de 16 aplicables) |
| Shared | 13 | 1 | 5 | 0 | **68%** |
| Types | 8 | 5 | 5 | 1 | **44%** (de 18 aplicables) |
| Imports | 8 | 5 | 6 | 0 | **42%** |
| A11y | 0 | 3 | 16 | 0 | **0%** |

---

## 3. Hallazgos Detallados por Pagina

### 3.1 TeacherDashboard.tsx (542 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherDashboard.tsx`
**Estado en rutas:** Activo (via withTeacherLayout HOC en App.tsx)
**Lineas:** 542

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Bare `<div>`, usa withTeacherLayout HOC via App.tsx |
| Export | OK | `export default function TeacherDashboard()` |
| Data Fetch | FAIL | Mixed: useTeacherDashboard hook + 3 useEffect con apiClient manual (lineas 72-136) para students y deadlines |
| Error | WARN | DetectiveCard variant="danger" ad-hoc, no patron estandarizado |
| Loading | OK | SkeletonStats + SkeletonCard de `@shared/components/loading` (unica pagina que los usa) |
| Empty | FAIL | Divs inline con texto hardcodeado, sin componente EmptyState compartido |
| Shared | OK | Usa DetectiveCard, SkeletonCard, SkeletonStats de @shared |
| Types | OK | Usa StudentMonitoring de portal types |
| Imports | WARN | Mezcla imports de @shared y de @services/api, no sigue orden de 5 grupos estricto |
| A11y | FAIL | Tab buttons (lineas 298-358) sin role="tab", tabIndex, aria-selected; iconos sin aria-hidden |

**Hallazgos especificos:**
- **Lineas 72-100:** useEffect manual para fetch de students via `apiClient.get('/teacher/classrooms/...')` — deberia ser un hook React Query
- **Lineas 101-136:** useEffect manual para upcoming deadlines via `apiClient.get('/teacher/assignments/upcoming')` — deberia integrarse en useTeacherDashboard o hook separado
- **Lineas 298-358:** 10 tab buttons implementados como `<button>` sin semantica ARIA de tabs
- **Linea 218-226:** Uso correcto de SkeletonStats y SkeletonCard — patron a replicar en otras paginas

---

### 3.2 TeacherClasses.tsx (387 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherClasses.tsx`
**Estado en rutas:** Activo
**Lineas:** 387

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Bare `<div>`, usa withTeacherLayout HOC via App.tsx |
| Export | OK | `export default function TeacherClasses()` |
| Data Fetch | OK | useClassrooms hook (React Query-based) |
| Error | WARN | DetectiveCard variant="danger" ad-hoc |
| Loading | FAIL | Inline Loader2 spinner (lineas 171-176), no componente compartido |
| Empty | FAIL | Inline div con texto, sin componente EmptyState |
| Shared | OK | Usa Modal, FormField, ConfirmDialog de @shared |
| Types | OK | Usa Classroom de portal types |
| Imports | OK | Orden razonable |
| A11y | FAIL | Botones edit/delete (lineas 256, 263) sin aria-label descriptivo; modal sin aria-modal |

**Hallazgos especificos:**
- **Lineas 171-176:** Loading con Loader2 animado inline — deberia usar LoadingSpinner compartido
- **Lineas 252-270:** Iconos de accion (Edit, Trash2) como botones sin aria-label contextual ("Editar aula X")

---

### 3.3 TeacherStudents.tsx (512 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherStudents.tsx`
**Estado en rutas:** Activo
**Lineas:** 512

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Bare `<div>`, usa withTeacherLayout HOC via App.tsx |
| Export | OK | `export default function TeacherStudents()` |
| Data Fetch | FAIL | useClassrooms + manual useEffect con classroomsApi (lineas 55-106) — patron legacy |
| Error | FAIL | Inline styled div con texto de error (lineas 469-478), no usa DetectiveCard |
| Loading | FAIL | Inline CSS spinner `border-b-2 animate-spin` (linea 468) — no compartido |
| Empty | FAIL | Inline div con texto "No hay estudiantes" |
| Shared | OK | Usa DataTable de @shared |
| Types | FAIL | Define interfaz inline `StudentExtended` (lineas 20-32) en vez de usar portal types |
| Imports | OK | Correcto |
| A11y | FAIL | Sort buttons en headers sin aria-label; DataTable sin caption/summary |

**Hallazgos especificos:**
- **Lineas 20-32:** Interfaz `StudentExtended` definida inline — duplica campos de StudentMonitoring del portal types
- **Lineas 55-106:** Fetch manual de estudiantes por classroom via `classroomsApi.getStudents()` con useState — deberia ser hook React Query
- **Linea 468:** Spinner CSS crudo `<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600">` — 3er estilo diferente de loading

---

### 3.4 TeacherAssignments.tsx (383 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAssignments.tsx`
**Estado en rutas:** Activo
**Lineas:** 383

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Bare `<div>`, usa withTeacherLayout HOC via App.tsx |
| Export | OK | `export default function TeacherAssignments()` |
| Data Fetch | OK | useAssignments + useClassrooms hooks |
| Error | WARN | DetectiveCard variant="danger" ad-hoc |
| Loading | FAIL | Inline Loader2 (lineas 304-308) |
| Empty | WARN | DetectiveCard con contenido inline — patron aceptable pero no estandarizado |
| Shared | OK | Usa DetectiveCard, DetectiveButton, Modal, FormField |
| Types | WARN | Define inline `AssignmentWizardData` (lineas 39-46), resto desde portal types |
| Imports | OK | Buen orden, tiene JSDoc |
| A11y | FAIL | Filter selects sin label asociado; modal sin focus trap |

**Hallazgos especificos:**
- **Lineas 39-46:** Interfaz inline `AssignmentWizardData` — deberia estar en portal types
- **Lineas 304-308:** Loading con Loader2 animate-spin — mismo patron suboptimo que otras paginas

---

### 3.5 TeacherProgress.tsx (737 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherProgress.tsx`
**Estado en rutas:** Activo
**Lineas:** 737

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Bare `<div className="space-y-6">` sin min-h-screen, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherProgress()` |
| Data Fetch | OK | useClassrooms + useClassroomsStats + useAnalytics hooks |
| Error | WARN | DetectiveCard variant="danger" ad-hoc |
| Loading | FAIL | Inline Loader2 (multiples instancias) |
| Empty | WARN | DetectiveCard con contenido inline |
| Shared | OK | Usa FormField, DetectiveCard, DetectiveButton |
| Types | OK | Buen uso de useMemo para datos derivados |
| Imports | WARN | toast de react-hot-toast con emojis hardcodeados (lineas 63, 124, 143) |
| A11y | FAIL | Custom dropdown (lineas 289-365) sin keyboard navigation; tab buttons sin role="tab" |

**Hallazgos especificos:**
- **Lineas 289-365:** Dropdown custom implementado como `<div>` con `onClick` — no tiene soporte para teclado (Escape, ArrowDown, ArrowUp, Enter)
- **Lineas 63, 124, 143:** `toast.success('emoji message')` con emojis — inconsistente con patron de notificaciones
- **Duplicacion:** Seccion de engagement metrics (lineas ~500-650) tiene logica casi identica a TeacherAnalytics

---

### 3.6 TeacherAnalytics.tsx (718 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAnalytics.tsx`
**Estado en rutas:** Activo
**Lineas:** 718

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="min-h-screen">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherAnalytics()` |
| Data Fetch | OK | useAnalytics + useClassrooms hooks |
| Error | WARN | DetectiveCard variant="danger" ad-hoc |
| Loading | FAIL | Inline Loader2 |
| Empty | FAIL | Inline divs sin componente compartido |
| Shared | OK | Usa FormField, DetectiveCard, DetectiveButton |
| Types | OK | Buen uso de portal types |
| Imports | WARN | chart.js imports (Chart.js, CategoryScale, etc.) al inicio — dependencia especifica |
| A11y | FAIL | Tab buttons (lineas 287-320) sin role="tab", aria-selected; graficos Chart.js sin alt text |

**Hallazgos especificos:**
- **Linea 33:** `ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)` — registra plugins de Chart.js a nivel de modulo
- **Lineas 287-320:** 4 tab buttons implementados como `<button>` sin semantica ARIA de tabs
- **Duplicacion:** Logica de engagement metrics duplicada de TeacherProgress

---

### 3.7 TeacherReports.tsx (565 lineas) -- P0 CRITICO

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReports.tsx`
**Estado en rutas:** Activo
**Lineas:** 565

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="space-y-6 p-6">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherReports()` |
| Data Fetch | **FAIL** | useState + useEffect + apiClient.get directo (lineas 117-243) — PEOR patron del portal |
| Error | **FAIL** | Solo console.error + toast, sin UI de error |
| Loading | FAIL | Full-page RefreshCw spinner como early return |
| Empty | **FAIL** | MOCK DATA HARDCODEADO como fallback en produccion (lineas 168-175, 190-223, 236-242) |
| Shared | WARN | Usa DetectiveCard pero tambien apiClient directo |
| Types | FAIL | Interfaces inline (ReportTemplate, GeneratedReport, ClassroomSummary) + portal types mezclados |
| Imports | **FAIL** | Importa apiClient y API_ENDPOINTS directamente — bypasses capa de servicio |
| A11y | FAIL | Sin semantica ARIA; iconos sin aria-hidden; botones solo con icono sin label |

**Hallazgos especificos (P0 CRITICO):**
- **Lineas 117-145:** `apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.TEMPLATES)` en useEffect — NO usa capa de servicio ni React Query
- **Lineas 146-176:** `apiClient.get(API_ENDPOINTS.TEACHER.REPORTS.LIST)` con fallback a MOCK DATA:
  ```typescript
  // lineas 168-175: Mock data hardcodeado en produccion
  const mockReports = [
    { id: '1', name: 'Reporte Semanal', type: 'weekly', ... },
    { id: '2', name: 'Progreso por Modulo', type: 'module', ... },
  ];
  ```
- **Lineas 190-223:** Mock classrooms data con nombres hardcodeados ("3er Grado A", "4to Grado B")
- **Lineas 236-242:** Mock report templates
- **Lineas 44-54:** Funcion `formatFileSize` definida inline — deberia estar en utils compartidos
- **Este es el archivo con mayor deuda tecnica del portal completo**

---

### 3.8 TeacherCommunication.tsx (428 lineas) -- Removido de Nav

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherCommunication.tsx`
**Estado en rutas:** Removido de navegacion (codigo preservado)
**Lineas:** 428

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | **FAIL** | Usa TeacherLayout DIRECTAMENTE dentro del componente (lineas 31, 209) — doble layout si HOC activo |
| Export | OK | `export default function TeacherCommunication()` |
| Data Fetch | OK | useTeacherMessages hook |
| Error | WARN | Early return con DetectiveCard |
| Loading | FAIL | Inline CSS spinner `animate-spin` |
| Empty | OK | Feature flag SHOW_UNDER_CONSTRUCTION + UnderConstruction component |
| Shared | FAIL | Imports con rutas relativas `../../../shared/components/` (lineas 29-30) en vez de `@shared/` |
| Types | WARN | Importa tipos desde `../../../services/api/teacher/` directamente |
| Imports | **FAIL** | Rutas relativas para shared y services en vez de path aliases |
| A11y | FAIL | Sin semantica ARIA; lista de mensajes sin role="list" |

**Hallazgos especificos:**
- **Lineas 29-30:** `import { ... } from '../../../shared/components/...'` — deberia usar `@shared/components/`
- **Lineas 33-34:** `import { ... } from '../../../services/api/teacher/...'` — deberia usar `@services/api/teacher`
- **DOBLE LAYOUT:** Si esta pagina se reactivara en rutas con withTeacherLayout, tendria TeacherLayout anidado dos veces

---

### 3.9 TeacherContent.tsx (82 lineas) -- Removido de Nav

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherContent.tsx`
**Estado en rutas:** Removido de navegacion
**Lineas:** 82

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | **FAIL** | Usa TeacherLayout DIRECTAMENTE — doble layout si HOC activo |
| Export | OK | `export default function TeacherContent()` |
| Data Fetch | WARN | useAuth + useUserGamification manual — exactamente lo que PageShell elimina |
| Error | N/A | Delega a TeacherContentManagement |
| Loading | N/A | Delega a TeacherContentManagement |
| Empty | OK | Feature flag + UnderConstruction |
| Shared | OK | Correcto |
| Types | N/A | Thin wrapper |
| Imports | OK | Correcto |
| A11y | N/A | Thin wrapper |

**Hallazgos especificos:**
- **Lineas 10-15:** Fetches useAuth + useUserGamification manualmente + construye displayGamificationData + handleLogout — exactamente el boilerplate que `useTeacherPageSetup` y `TeacherPageShell` estan disenados para eliminar
- Este archivo es el ejemplo perfecto de POR QUE se necesita TeacherPageShell

---

### 3.10 TeacherContentManagement.tsx (726 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherContentManagement.tsx`
**Estado en rutas:** Renderizado dentro de TeacherContent
**Lineas:** 726

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | Sin layout propio (renderizado como child de TeacherContent) |
| Export | OK | `export default function TeacherContentManagement()` |
| Data Fetch | OK | useTeacherContent hook (React Query-based) |
| Error | FAIL | Inline styled alert div con bg-red-50 (lineas ~380-395) — no usa DetectiveCard |
| Loading | FAIL | Inline CSS spinner animate-spin |
| Empty | FAIL | Inline div con texto |
| Shared | OK | Usa componentes compartidos |
| Types | WARN | Importa tipos desde service layer directamente |
| Imports | OK | Correcto |
| A11y | **WARN** | Tiene aria-label en botones de accion (lineas 448, 455, 463, 471) — UNICA pagina con algo de a11y |

**Hallazgos especificos:**
- **Lineas 448, 455, 463, 471:** `aria-label="Editar"`, `aria-label="Eliminar"`, etc. — ejemplo positivo a replicar
- **Lineas 516-696:** Modal custom implementado como `<div className="fixed inset-0">` — deberia usar componente Modal compartido
- **Unico punto de accesibilidad positivo** en todo el portal maestro

---

### 3.11 TeacherGamification.tsx (917 lineas) -- Pagina mas larga

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherGamification.tsx`
**Estado en rutas:** Activo
**Lineas:** 917 (la mas larga del portal)

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="space-y-6">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherGamification()` |
| Data Fetch | OK | useGrantBonus + useEconomyAnalytics + useStudentsEconomy + useAchievementsStats hooks |
| Error | **FAIL** | Inline styled alert divs con border-l-4 (lineas 277-330) — patron unico, no compartido |
| Loading | FAIL | Inline Loader2 en multiples secciones |
| Empty | FAIL | Inline divs sin componente compartido |
| Shared | OK | Usa DetectiveCard, Modal, DetectiveButton |
| Types | **FAIL** | Interfaces inline: StudentEconomyData (lineas 26-36), ClassEconomyStats (lineas 38-47) |
| Imports | WARN | Usa `@apps/teacher` path alias (lineas 5-8) — inconsistente con otras paginas que usan rutas relativas |
| A11y | FAIL | Tabs sin role="tab"; stat cards sin semantica; graficos sin alt text |

**Hallazgos especificos:**
- **Lineas 26-47:** 2 interfaces definidas inline — deberian estar en portal types
- **Lineas 171-186:** Objeto `economyConfig` hardcodeado — deberia venir del backend o de constantes compartidas
- **Lineas 277-330:** Patron de error unico con `<div className="bg-red-50 border-l-4 border-red-500 p-4">` — no se usa en ningun otro lugar
- **917 lineas:** Candidato fuerte para descomposicion en sub-componentes (EconomyOverview, StudentEconomyTable, AchievementsStats, BonusPanel)

---

### 3.12 TeacherAlerts.tsx (314 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAlerts.tsx`
**Estado en rutas:** Activo
**Lineas:** 314

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="space-y-6">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherAlerts()` |
| Data Fetch | OK | useClassrooms hook |
| Error | N/A | Delega a InterventionAlertsPanel |
| Loading | N/A | Delega a InterventionAlertsPanel |
| Empty | OK | DetectiveCard variant="info" para estado vacio |
| Shared | OK | Usa constantes ALERT_TYPES, ALERT_PRIORITIES; delega a InterventionAlertsPanel |
| Types | OK | Usa AlertPriority, AlertType de portal types |
| Imports | OK | Correcto |
| A11y | FAIL | Filter buttons sin aria-pressed; priority badges sin semantica |

**Hallazgos especificos:**
- Pagina bien estructurada que delega correctamente a componente InterventionAlertsPanel
- Usa constantes centralizadas — buen patron

---

### 3.13 TeacherAlertConfig.tsx (421 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherAlertConfig.tsx`
**Estado en rutas:** Activo
**Lineas:** 421

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="space-y-6">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherAlertConfig()` |
| Data Fetch | OK | useAlertConfig hook (React Query-based) |
| Error | WARN | Early return con DetectiveCard — patron diferente al resto |
| Loading | FAIL | Early return con RefreshCw spinner animado (lineas 306-315) |
| Empty | OK | DetectiveCard con contenido descriptivo |
| Shared | OK | Usa DetectiveCard, DetectiveButton, FormField |
| Types | OK | Usa tipos exportados de useAlertConfig hook |
| Imports | **FAIL** | Import relativo a servicio: `../../../services/api/teacher/alertConfigApi` (linea 29) |
| A11y | FAIL | Toggle enable/disable sin aria-checked; sin role="switch" |

**Hallazgos especificos:**
- **Linea 29:** `import { alertConfigApi } from '../../../services/api/teacher/alertConfigApi'` — deberia usar path alias `@services/api/teacher/alertConfigApi`
- **Lineas 306-315:** Early return para loading — diferente patron al resto del portal (la mayoria usa inline loading)

---

### 3.14 TeacherReviewPanel.tsx (316 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherReviewPanel.tsx`
**Estado en rutas:** Activo
**Lineas:** 316

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="mx-auto max-w-7xl">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherReviewPanel()` |
| Data Fetch | OK | useMyReviews + useManualReviewDetail + useManualReviewConfig (React Query) |
| Error | WARN | Delega a ReviewList component |
| Loading | WARN | Delega a ReviewList — no maneja propio |
| Empty | WARN | StatusTab inline component (lineas 17-73) — deberia ser extraido |
| Shared | **FAIL** | No usa DetectiveCard — usa bg-white/text-gray-900 styling crudo |
| Types | WARN | Define StatusTabProps inline (linea 17) |
| Imports | **FAIL** | `import { ... } from '@/shared/api/manualReviewApi'` (linea 3) — ruta incorrecta, deberia ser `@services/api` |
| A11y | FAIL | StatusTab buttons sin role="tab"; review cards sin semantica |

**Hallazgos especificos:**
- **Linea 3:** Import desde `@/shared/api/manualReviewApi` — capa incorrecta, API calls deberian estar en `@services/api/`
- **Lineas 17-73:** Componente `StatusTab` definido inline — deberia extraerse a componente separado
- **Styling:** Usa bg-white/rounded-xl/shadow — inconsistente con tema detective del resto del portal

---

### 3.15 TeacherMonitoring.tsx (197 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherMonitoring.tsx`
**Estado en rutas:** Activo
**Lineas:** 197

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="space-y-6">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherMonitoring()` |
| Data Fetch | OK | useClassrooms hook |
| Error | **OK** | DetectiveCard variant="danger" con retry button — MEJOR error handling del portal |
| Loading | FAIL | Inline Loader2 spinner (lineas 58-63) |
| Empty | OK | DetectiveCard con contenido descriptivo |
| Shared | OK | Usa DetectiveCard, StudentMonitoringPanel de @apps/teacher/components |
| Types | OK | Tipos implicitos desde hooks |
| Imports | OK | Correcto |
| A11y | FAIL | Classroom selector sin label; sin keyboard navigation para cambio de aula |

**Hallazgos especificos:**
- **Lineas 66-87:** Mejor implementacion de error handling del portal — usa DetectiveCard variant="danger" con boton de retry y mensaje descriptivo. Patron a replicar.
- Pagina relativamente limpia y bien estructurada

---

### 3.16 TeacherExerciseResponses.tsx (229 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherExerciseResponses.tsx`
**Estado en rutas:** Activo
**Lineas:** 229

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="min-h-screen">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherExerciseResponses()` |
| Data Fetch | OK | useExerciseResponses hook (React Query) |
| Error | **FAIL** | motion.div styled inline con gradiente — completamente diferente al resto |
| Loading | WARN | Delega a ResponsesTable |
| Empty | N/A | |
| Shared | **FAIL** | No usa DetectiveCard; usa gradient cards (from-blue-50 to-blue-100); usa framer-motion |
| Types | OK | Importa desde @services/api/teacher |
| Imports | WARN | framer-motion (motion) — dependencia usada solo aqui y en Notifications |
| A11y | FAIL | Cards sin semantica; stats sin role="status"; animaciones sin prefers-reduced-motion |

**Hallazgos especificos:**
- **Lineas 31-108:** 3 sub-componentes inline (PageHeader, StatsCard, StatsGrid) — deberian extraerse
- **Styling:** Usa gradientes (from-blue-50, from-green-50) — completamente diferente al tema detective
- **framer-motion:** Unica pagina activa que usa motion (TeacherNotifications tambien lo usa pero esta removida de nav)

---

### 3.17 TeacherNotifications.tsx (423 lineas) -- Removido de Nav

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherNotifications.tsx`
**Estado en rutas:** Removido de navegacion
**Lineas:** 423

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | **FAIL** | Usa TeacherLayout DIRECTAMENTE (lineas 39, 180) — doble layout si HOC activo |
| Export | OK | `export default function TeacherNotifications()` |
| Data Fetch | WARN | useNotificationsStore (Zustand) en vez de React Query; useAuth + useUserGamification manual |
| Error | FAIL | Inline styled div |
| Loading | FAIL | Inline RefreshCw spinner |
| Empty | FAIL | Inline styled div |
| Shared | **FAIL** | Usa framer-motion (AnimatePresence, motion.div, motion.button); styling bg-white/10 diferente |
| Types | FAIL | Inline Record types; no usa portal types |
| Imports | **FAIL** | TeacherLayout como default import; usa `@/features/` paths mezclados |
| A11y | WARN | Tiene title attributes en botones — algo de accesibilidad |

**Hallazgos especificos:**
- **DOBLE LAYOUT** si se reactivara
- **Zustand vs React Query:** Usa useNotificationsStore (Zustand) en vez de React Query hooks — diferente patron de estado
- **framer-motion:** Animaciones extensivas con AnimatePresence — inconsistente con portal

---

### 3.18 TeacherNotificationPreferences.tsx (392 lineas) -- Removido de Nav

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherNotificationPreferences.tsx`
**Estado en rutas:** Removido de navegacion
**Lineas:** 392

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | **FAIL** | Usa TeacherLayout DIRECTAMENTE (linea 141) — doble layout si HOC activo |
| Export | OK | `export default function TeacherNotificationPreferences()` |
| Data Fetch | WARN | useNotificationsStore + usePushNotifications — Zustand-based |
| Error | FAIL | Inline styled div |
| Loading | FAIL | Inline Loader2 |
| Empty | FAIL | Inline text |
| Shared | **FAIL** | Usa framer-motion, cn; styling diferente al detective theme |
| Types | FAIL | Inline state types, no usa portal types |
| Imports | **FAIL** | Mezcla de paths (`@/features/`, relative, `@shared/`) |
| A11y | FAIL | Toggle buttons sin role="switch", aria-checked; grid layout sin semantica |

**Hallazgos especificos:**
- **DOBLE LAYOUT** si se reactivara
- **Toggle pattern:** Botones toggle para preferencias sin accesibilidad adecuada

---

### 3.19 TeacherSettings.tsx (491 lineas)

**Archivo:** `apps/frontend/src/apps/teacher/pages/TeacherSettings.tsx`
**Estado en rutas:** Activo
**Lineas:** 491

| Criterio | Evaluacion | Detalle |
|----------|------------|---------|
| Layout | FAIL | `<div className="mx-auto max-w-7xl">`, usa withTeacherLayout HOC |
| Export | OK | `export default function TeacherSettings()` |
| Data Fetch | WARN | useAuth + useUserPreferences + profileAPI directamente — patron mixto |
| Error | WARN | toast.error para errores — sin UI de error visible |
| Loading | N/A | Delega a sub-secciones |
| Empty | N/A | Delega a sub-secciones |
| Shared | OK | Usa DetectiveCard, cn |
| Types | WARN | Define inline `TeacherPreferencesPayload` + importa de service types |
| Imports | OK | Correcto |
| A11y | WARN | Tab buttons usan cn para styling, tienen semantica basica pero sin role="tab" completo |

**Hallazgos especificos:**
- **Lineas 19-20:** Importa profileAPI directamente desde service layer — mezcla capas
- **5 useState blocks:** Gestiona estado de formulario complejo manualmente — candidato para hook dedicado `useTeacherSettingsForm`
- **Buena decomposicion:** Delega a 4 sub-componentes (ProfileSettingsSection, SecuritySection, etc.)

---

## 4. Analisis de Hooks del Portal Teacher

### 4.1 Inventario de Hooks

**Archivo barrel:** `apps/frontend/src/apps/teacher/hooks/index.ts` (75 lineas)

| Hook | Tipo | React Query | Usado por Paginas | Estado |
|------|------|-------------|-------------------|--------|
| useTeacherPageSetup | Setup | No (composicion) | 0 (solo TeacherPageShell) | Nuevo, sin adopcion |
| useTeacherDashboard | Data | Si | 1 (Dashboard) | Activo |
| useStudentProgress | Data | Si | 0 directamente | Activo |
| useAnalytics | Data | Si | 2 (Analytics, Progress) | Activo |
| useGrading | Data | Si | 0 directamente | Activo |
| useClassrooms | Data | Si | 7 paginas | **Mas usado** |
| useClassroomsStats | Data | Si | 1 (Progress) | Activo |
| useAssignments | Data | Si | 1 (Assignments) | Activo |
| useInterventionAlerts | Data | Si | 1 (via panel) | Activo |
| useStudentBlocking | Data | Si | 0 directamente | Activo |
| useAlertConfig | Data | Si | 1 (AlertConfig) | Activo |
| useTeacherMessages | Data | Si | 1 (Communication) | Activo |
| useGrantBonus | Action | Si | 1 (Gamification) | Activo |
| useEconomyAnalytics | Data | Si | 1 (Gamification) | Activo |
| useStudentsEconomy | Data | Si | 1 (Gamification) | Activo |
| useAchievementsStats | Data | Si | 1 (Gamification) | Activo |
| useMissionStats | Data | Si | 0 directamente | Activo |
| useMasteryTracking | Data | Si | 0 directamente | Activo |
| useClassroomRealtime | Realtime | WebSocket | 0 directamente | Activo |
| useClassroomData | Data | ? | Importado legacy | **Legacy** |
| useStudentMonitoring | Data | ? | Importado legacy | **Legacy** |

### 4.2 Problemas Detectados en Hooks

1. **useTeacherPageSetup** (0% adopcion): Creado para TeacherPageShell pero ninguna pagina lo usa porque ninguna pagina usa PageShell
2. **useClassroomData** y **useStudentMonitoring** marcados como legacy pero siguen exportados — verificar si alguna pagina los importa directamente
3. **Hooks sin uso directo por paginas:** useStudentProgress, useGrading, useStudentBlocking, useMissionStats, useMasteryTracking, useClassroomRealtime — pueden estar usados por componentes hijos, pero verificar cobertura
4. **5 paginas NO usan hooks del barrel:** TeacherStudents (usa classroomsApi directo), TeacherReports (usa apiClient directo), TeacherNotifications (usa Zustand store), TeacherNotificationPreferences (usa Zustand store), TeacherSettings (usa profileAPI directo)

### 4.3 Tipos del Portal

**Archivo:** `apps/frontend/src/apps/teacher/types/index.ts` (535 lineas)

Tipos bien definidos pero con baja adopcion:

| Tipo | Definido en types/ | Usado por paginas | Duplicado inline |
|------|-------------------|-------------------|------------------|
| StudentMonitoring | Si | 2 | Si (StudentExtended en TeacherStudents) |
| Classroom | Si | 5+ | No |
| Assignment | Si | 2 | Si (AssignmentWizardData en TeacherAssignments) |
| InterventionAlert | Si | 1 | No |
| TeacherDashboardStats | Si | 1 | No |
| StudentEconomyData | **No** | 1 | Si (en TeacherGamification) |
| ClassEconomyStats | **No** | 1 | Si (en TeacherGamification) |
| StatusTabProps | **No** | 1 | Si (en TeacherReviewPanel) |
| TeacherPreferencesPayload | **No** | 1 | Si (en TeacherSettings) |

---

## 5. Hallazgos Criticos Priorizados

### P0 -- Critico (Resolver antes de siguiente sprint)

| ID | Hallazgo | Pagina(s) | Impacto |
|----|----------|-----------|---------|
| P0-01 | **0% adopcion de TeacherPageShell** — Todas las paginas usan HOC deprecated | 19/19 | Deuda tecnica masiva; bloqueador de deprecacion de HOC |
| P0-02 | **Mock data hardcodeado en produccion** en TeacherReports | TeacherReports | Datos falsos visibles a usuarios finales |
| P0-03 | **4 paginas con doble layout potencial** — usan TeacherLayout directo + podrian tener HOC | Communication, Content, Notifications, NotifPrefs | Layout roto si se reactivan rutas |

### P1 -- Alto (Resolver en proximo sprint)

| ID | Hallazgo | Pagina(s) | Impacto |
|----|----------|-----------|---------|
| P1-01 | **5 paginas con data fetching legacy** (useState+useEffect+apiClient) | Dashboard, Students, Reports, Settings, Content | Patron no-estandar, sin cache, sin retry, sin dedup |
| P1-02 | **7 tipos definidos inline** en vez de en portal types/ | Students, Assignments, Gamification, ReviewPanel, Settings | Duplicacion, inconsistencia, dificultad de mantenimiento |
| P1-03 | **18/19 paginas sin loading states compartidos** | Todas excepto Dashboard | 5+ estilos diferentes de spinner (Loader2, RefreshCw, CSS border, SkeletonCard) |
| P1-04 | **0/19 paginas con error handling estandarizado** | Todas | 4+ patrones diferentes (DetectiveCard, inline div, toast only, console.error) |
| P1-05 | **Pagina TeacherGamification de 917 lineas** sin descomposicion | TeacherGamification | Mantenibilidad pobre; dificil de testear |
| P1-06 | **Duplicacion de logica** engagement metrics entre TeacherProgress y TeacherAnalytics | Progress, Analytics | Cambio en uno debe replicarse en otro |

### P2 -- Medio (Backlog para estandarizacion gradual)

| ID | Hallazgo | Pagina(s) | Impacto |
|----|----------|-----------|---------|
| P2-01 | **4 paginas con imports de rutas relativas** en vez de path aliases | Communication, AlertConfig, ReviewPanel, NotifPrefs | Inconsistencia, refactoring mas dificil |
| P2-02 | **19/19 paginas con problemas de accesibilidad** | Todas | No cumple WCAG 2.1 AA; sin role, aria-label, keyboard nav |
| P2-03 | **framer-motion usado inconsistentemente** en 3 paginas | ExerciseResponses, Notifications, NotifPrefs | Dependencia extra, inconsistencia visual |
| P2-04 | **Styling inconsistente** — detective theme vs gradients vs white/gray | ReviewPanel, ExerciseResponses, Notifications | UX inconsistente |
| P2-05 | **3 paginas con sub-componentes inline** que deberian extraerse | ExerciseResponses (3), ReviewPanel (1), Gamification (conceptual) | Testabilidad, reusabilidad |
| P2-06 | **Modal custom en ContentManagement** en vez de Modal compartido | ContentManagement | Duplicacion de patron modal |
| P2-07 | **toast con emojis hardcodeados** en TeacherProgress | Progress | Inconsistencia en notificaciones |
| P2-08 | **formatFileSize inline** en TeacherReports | Reports | Funcion utilitaria no compartida |

---

## 6. Acciones Correctivas Recomendadas

### Fase 1: Migracion a TeacherPageShell (P0-01)

**Esfuerzo estimado:** 1-2 horas para las 15 paginas activas

Para cada pagina activa:

1. Reemplazar wrapper `<div>` por `<TeacherPageShell>`
2. En App.tsx, cambiar de:
   ```tsx
   // ANTES (deprecated)
   const Page = lazy(() =>
     import('./pages/Page').then(m => ({ default: withTeacherLayout(m.default) }))
   );
   ```
   a:
   ```tsx
   // DESPUES (estandar)
   const Page = lazy(() => import('./pages/Page'));
   ```
3. Dentro de cada pagina:
   ```tsx
   import { TeacherPageShell } from '../components/shared/TeacherPageShell';

   export default function Page() {
     return (
       <TeacherPageShell>
         {/* contenido existente */}
       </TeacherPageShell>
     );
   }
   ```

Para las 4 paginas removidas: Reemplazar TeacherLayout directo por TeacherPageShell.

### Fase 2: Eliminar Mock Data y Legacy Fetching (P0-02, P1-01)

1. **TeacherReports:** Crear hook `useTeacherReports` (React Query) que reemplace los 3 useEffect con apiClient. Eliminar mock data fallbacks.
2. **TeacherDashboard:** Mover fetching de students y deadlines a useTeacherDashboard o hooks dedicados.
3. **TeacherStudents:** Crear hook `useClassroomStudents` (React Query) para reemplazar useEffect con classroomsApi.
4. **TeacherSettings:** Crear hook `useTeacherSettingsForm` para centralizar los 5 useState.

### Fase 3: Estandarizar Loading y Error States (P1-03, P1-04)

1. Definir 2 componentes compartidos:
   - `TeacherLoadingState` (SkeletonCard-based, consistente con Dashboard)
   - `TeacherErrorState` (DetectiveCard variant="danger" con retry, consistente con Monitoring)
2. Reemplazar los 5+ estilos de spinner por TeacherLoadingState
3. Reemplazar los 4+ patrones de error por TeacherErrorState

### Fase 4: Mover Tipos Inline a Portal Types (P1-02)

1. Mover a `apps/frontend/src/apps/teacher/types/index.ts`:
   - StudentExtended (de TeacherStudents)
   - AssignmentWizardData (de TeacherAssignments)
   - StudentEconomyData, ClassEconomyStats (de TeacherGamification)
   - StatusTabProps (de TeacherReviewPanel)
   - TeacherPreferencesPayload (de TeacherSettings)

### Fase 5: Accesibilidad Basica (P2-02)

1. Todos los tab buttons: agregar `role="tab"`, `aria-selected`, `tabIndex`
2. Todos los toggle buttons: agregar `role="switch"`, `aria-checked`
3. Iconos decorativos: agregar `aria-hidden="true"`
4. Botones con solo icono: agregar `aria-label` descriptivo
5. Modals: agregar `role="dialog"`, `aria-modal="true"`, focus trap

---

## 7. Archivos de Referencia

| Archivo | Ruta Absoluta | Proposito |
|---------|---------------|-----------|
| withTeacherLayout (deprecated) | `apps/frontend/src/apps/teacher/components/withTeacherLayout.tsx` | HOC a reemplazar |
| TeacherPageShell (estandar) | `apps/frontend/src/apps/teacher/components/shared/TeacherPageShell.tsx` | Wrapper correcto |
| useTeacherPageSetup | `apps/frontend/src/apps/teacher/hooks/useTeacherPageSetup.ts` | Hook de setup para PageShell |
| hooks/index.ts | `apps/frontend/src/apps/teacher/hooks/index.ts` | Barrel export de hooks |
| types/index.ts | `apps/frontend/src/apps/teacher/types/index.ts` | Tipos del portal |
| components/index.ts | `apps/frontend/src/apps/teacher/components/index.ts` | Barrel export de componentes |
| App.tsx | `apps/frontend/src/App.tsx` | Definicion de rutas y lazy imports |

---

## 8. Patron Modelo (Pagina Ideal)

Basado en el analisis, la pagina que mas se acerca al estandar es **TeacherMonitoring** (197 lineas). Una pagina ideal del portal teacher seria:

```tsx
// apps/frontend/src/apps/teacher/pages/TeacherIdealPage.tsx

// 1. React/external imports
import { useState, useMemo } from 'react';

// 2. Shared components
import { DetectiveCard, DetectiveButton, FormField } from '@shared/components';

// 3. Teacher components
import { TeacherPageShell } from '../components/shared/TeacherPageShell';

// 4. Teacher hooks
import { useClassrooms } from '../hooks';

// 5. Types
import type { Classroom } from '../types';

/**
 * TeacherIdealPage - Description
 *
 * Estandar: TeacherPageShell + React Query hooks + DetectiveCard loading/error
 */
export default function TeacherIdealPage() {
  const { data, isLoading, error, refetch } = useClassrooms();

  return (
    <TeacherPageShell>
      <div className="space-y-6">
        {/* Loading - SkeletonCard o LoadingSpinner compartido */}
        {isLoading && <TeacherLoadingState />}

        {/* Error - DetectiveCard variant="danger" con retry */}
        {error && (
          <DetectiveCard variant="danger">
            <p>{error.message}</p>
            <DetectiveButton onClick={() => refetch()}>Reintentar</DetectiveButton>
          </DetectiveCard>
        )}

        {/* Empty - DetectiveCard variant="info" */}
        {!isLoading && !error && data?.length === 0 && (
          <DetectiveCard variant="info">
            <p>No hay datos disponibles</p>
          </DetectiveCard>
        )}

        {/* Content */}
        {data && data.length > 0 && (
          <section aria-label="Contenido principal">
            {/* ... */}
          </section>
        )}
      </div>
    </TeacherPageShell>
  );
}
```

---

*Generado por Claude Opus 4.6 — Analisis solamente, sin modificaciones a archivos fuente*
