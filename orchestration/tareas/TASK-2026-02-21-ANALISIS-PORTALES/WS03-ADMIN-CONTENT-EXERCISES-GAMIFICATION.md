# WS03 - Admin: Content, Exercises, Gamification, Assignments, Progress

**Fecha:** 2026-02-21
**Agente:** Claude Opus 4.6
**Scope:** 5 paginas admin, ~50 componentes, ~8 hooks, ~22 exercise-builder files
**Estado:** Analisis completo

---

## 1. Inventario de Paginas

### 1.1 AdminContentPage

- **Ruta:** `/admin/content`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx` (141 lineas)
- **Componentes:**
  - `AdminPageShell` (shared wrapper)
  - `AdminTabBar` (shared tab navigation)
  - `PendingExercisesTab` (`components/content/PendingExercisesTab.tsx`)
  - `MediaLibraryTab` (`components/content/MediaLibraryTab.tsx`)
  - `ContentVersionsTab` (`components/content/ContentVersionsTab.tsx`)
  - `ContentPreviewModal` (`components/content/ContentPreviewModal.tsx`)
  - `RejectExerciseModal` (`components/content/RejectExerciseModal.tsx`)
- **Hooks:**
  - `usePendingExercisesQuery` (from `useContentQueries.ts`)
  - `useApiError` (shared)
- **Endpoints API:**
  - `GET /admin/content/pending` (pending exercises list)
  - `POST /admin/content/:id/approve` (approve exercise)
  - `POST /admin/content/:id/reject` (reject exercise with reason)
  - `GET /admin/content/media` (media library list)
  - `POST /admin/content/media` (upload media)
  - `DELETE /admin/content/media/:id` (delete media)
  - `GET /admin/content/version` (content versions)
  - `GET /admin/content/approval-history` (approval history)
  - `GET /educational/exercises/:id` (exercise detail for preview)
- **Estado:**
  - 3 tabs via `useState<ContentTabId>`: `pending` | `media` | `versions`
  - Selected exercise state + modal open states (preview, reject)
  - Pending badge count derived from query data
- **Interacciones:**
  - Tab switching (Pendientes, Multimedia, Versiones)
  - Preview exercise modal (Ver button on pending row)
  - Approve exercise from preview modal
  - Reject exercise via separate modal with reason textarea
  - DataTable search within each tab
- **Errores:**
  - `useApiError` hook for approve action (try/catch with handleError)
  - Each tab shows inline red error banner if query fails
  - RejectExerciseModal has try/catch with console.error
  - ContentPreviewModal shows AlertCircle icon on detail fetch error
- **Carga:**
  - Each tab manages its own loading via React Query's `isLoading`
  - Spinner animation (border-b-2 border-detective-orange animate-spin)
  - ContentPreviewModal shows Loader2 spinner during detail fetch
- **Accesibilidad:**
  - `role="region"` with `aria-label` on active tab content
  - No aria-live for tab switching (minor gap)
  - No focus management on modal open/close
- **Responsividad:**
  - No explicit breakpoints in page; relies on DataTable and DetectiveCard responsive behavior
- **Issues:**
  - [P2] `handleApproveFromPreview` has incomplete `useCallback` dependency array (missing `handleError`)
  - [P2] ContentVersionsTab tab label says "Versiones" but actually shows "Historial de Aprobaciones"
  - [P1] ContentPreviewModal uses `useState` + `useEffect` for exercise detail fetch instead of React Query (inconsistent with project pattern)
  - [P2] No pagination on PendingExercisesTab DataTable (data growth concern)

---

### 1.2 AdminExerciseCreatePage (Exercise Builder Wizard)

- **Ruta:** `/admin/exercises/create` and `/admin/exercises/:id/edit`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx` (367 lineas)
- **Componentes:**
  - `AdminPageShell` (shared wrapper)
  - `DetectiveCard`, `DetectiveButton` (shared base)
  - `StepBasicInfo` (`components/exercise-builder/StepBasicInfo.tsx`)
  - `ExerciseTypeSelector` (`components/exercise-builder/ExerciseTypeSelector.tsx`)
  - 17 TypeConfig components (`components/exercise-builder/type-configs/`)
  - `ExercisePreview` (`components/exercise-builder/ExercisePreview.tsx`)
  - `ContentEditor` (`components/exercise-builder/ContentEditor.tsx`)
  - `CreateModuleModal` (`components/exercise-builder/CreateModuleModal.tsx`)
- **Hooks:**
  - `useModulesQuery` (from `useContentQueries.ts`)
  - `useMutation` + `useQueryClient` (direct React Query)
- **Endpoints API:**
  - `POST /educational/exercises` (create exercise)
  - `GET /educational/modules` (fetch modules for dropdown)
  - `POST /educational/modules` (create module via CreateModuleModal)
- **Estado:**
  - `currentStep` (1-4): wizard step tracker
  - `formData: ExerciseFormData`: single state object for all fields
  - `createExerciseMutation`: React Query mutation for save/submit
  - No edit mode state (both `/create` and `/:id/edit` render same component - **P1 Issue**)
- **Interacciones:**
  - Step indicator (4 steps: Informacion Basica, Tipo de Ejercicio, Configuracion, Vista Previa)
  - Click completed steps to go back
  - Next/Previous navigation with validation
  - Step 1: Title, Description, Instructions, Module dropdown, Difficulty, Time, Hints, Pedagogical Notes, XP/ML Coins rewards, Create Module modal
  - Step 2: Exercise type selection grid with module filter tabs
  - Step 3: Dynamic type-specific configuration form (17 types)
  - Step 4: Preview with Save Draft and Submit for Review
  - framer-motion AnimatePresence for step transitions
- **Errores:**
  - `handleSaveDraft` and `handleSubmitForReview`: try/catch with `toast.error` showing backend message
  - No form-level validation UI (only `canAdvance()` gate)
- **Carga:**
  - `saving` derived from `createExerciseMutation.isPending`
  - Both Save Draft and Submit for Review share `loading` prop
  - Loader2 spinner in CreateModuleModal during module creation
- **Accesibilidad:**
  - Step indicator buttons have disabled state for inaccessible steps
  - Step labels hidden on small screens (`hidden md:inline`)
  - No aria-live for step change announcements
  - No form validation error messages tied to specific fields (no `aria-invalid`, `aria-describedby`)
- **Responsividad:**
  - Step labels hidden below md breakpoint
  - Grid responsive: `grid-cols-1 md:grid-cols-2` in StepBasicInfo
  - Type selector grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- **Issues:**
  - [P0] **Edit route (`/admin/exercises/:id/edit`) uses same component but has NO edit logic** - it renders a blank create form. No exercise data fetching, no pre-population. The route exists in App.tsx (line 698) but the component ignores the `:id` param.
  - [P1] `ExercisePreview` shows `MODULE_NAMES` by static logical ID (`module-1` etc.) but `formData.moduleId` is a real UUID from the backend. The preview will show the UUID as the module name since it won't match the static map.
  - [P1] `hintsAllowed` field is duplicated in StepBasicInfo - appears in both "Informacion Basica" section and "Recompensas" section with different contexts
  - [P1] `buildExercisePayload` sends both `config` and `content` with the same `typeConfig` value - possible backend confusion
  - [P2] `DIFFICULTY_MAP` maps `expert` to `proficient` without UI indication to the user
  - [P2] No unsaved changes warning when navigating away
  - [P2] TypeConfig validation is minimal - Step 3 only checks `Object.keys(formData.typeConfig).length > 0`

---

### 1.3 AdminGamificationPage

- **Ruta:** `/admin/gamification`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx` (231 lineas)
- **Componentes:**
  - `AdminPageShell` (shared wrapper)
  - `AdminTabBar` (shared tab navigation, variant="underline")
  - `RanksTab` (`components/gamification/RanksTab.tsx`)
  - `AchievementsTab` (`components/gamification/AchievementsTab.tsx`)
  - `EconomyTab` (`components/gamification/EconomyTab.tsx`)
  - `StatsTab` (`components/gamification/StatsTab.tsx`)
  - `ParameterEditModal` (`components/gamification/ParameterEditModal.tsx`)
  - `MayaRankEditModal` (`components/gamification/MayaRankEditModal.tsx`)
  - `BulkUpdateDialog` (`components/gamification/BulkUpdateDialog.tsx`)
  - `PreviewImpactDialog` (`components/gamification/PreviewImpactDialog.tsx`)
  - `RestoreDefaultsDialog` (`components/gamification/RestoreDefaultsDialog.tsx`)
- **Hooks:**
  - `useGamificationConfig` (from `hooks/useGamificationConfig.ts`)
  - Returns nested hooks: `useParameters()`, `useMayaRanks()`, `useStats()`
  - Mutations: `updateParameter`, `resetParameter`, `updateMayaRank`, `bulkUpdateParameters`, `restoreDefaults`
- **Endpoints API (via gamificationConfigApi):**
  - `GET /admin/gamification/parameters` (list all parameters)
  - `PATCH /admin/gamification/parameters/:key` (update parameter)
  - `POST /admin/gamification/parameters/:key/reset` (reset to default)
  - `PATCH /admin/gamification/parameters/bulk` (bulk update)
  - `GET /admin/gamification/maya-ranks` (list Maya ranks)
  - `PATCH /admin/gamification/maya-ranks/:id` (update rank XP range)
  - `POST /admin/gamification/preview-impact` (preview changes)
  - `POST /admin/gamification/restore-defaults` (restore all defaults)
  - `GET /admin/gamification/stats` (gamification statistics)
- **Estado:**
  - `activeTab` (4 tabs: ranks, achievements, economy, stats)
  - `modals: ModalState` (centralized modal state with 5 modal flags)
  - Each query independently managed via React Query
- **Interacciones:**
  - 4 tabs: Rangos Maya, Logros, Economia ML Coins, Estadisticas
  - Edit parameter (click from Economy tab opens ParameterEditModal)
  - Edit Maya rank (click from Ranks tab opens MayaRankEditModal)
  - Bulk parameter update (opens BulkUpdateDialog)
  - Preview impact of changes (opens PreviewImpactDialog)
  - Restore all defaults (opens RestoreDefaultsDialog with confirmation)
- **Errores:**
  - Full-page error state with AlertCircle icon, retry button (`window.location.reload()`)
  - Each mutation has `onError` with `toast.error`
  - Defensive data transformations in `useGamificationConfig` (null guards, snake_case normalization)
- **Carga:**
  - Full-page `LoadingSpinner` with aria-live="polite" and role="status"
  - isLoading combines all three query loading states
- **Accesibilidad:**
  - `aria-live="polite"` on loading and error states
  - `role="status"` on loading spinner
  - `role="alert"` on error state
  - `role="region"` with `aria-label` on tab content
  - Last modification date displayed
- **Responsividad:**
  - Relies on DetectiveCard and grid components for responsive behavior
  - No explicit breakpoint management in page
- **Issues:**
  - [P2] `PreviewImpactDialog` receives `impactData={null}` and `isLoading={false}` as hardcoded values - preview impact feature appears non-functional
  - [P2] Error state checks `hasErrors` as all three data arrays being empty AND not loading, which may false-positive if legitimately empty
  - [P2] Retry on error uses `window.location.reload()` instead of `queryClient.refetchQueries()`

---

### 1.4 AdminAssignmentsPage

- **Ruta:** `/admin/assignments`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminAssignmentsPage.tsx` (259 lineas)
- **Componentes:**
  - `AdminPageShell` (shared wrapper)
  - `DetectiveCard`, `DetectiveButton`, `Pagination`
  - `ToastContainer` + `useToast` (shared Toast component)
  - `AssignmentsTable` (`components/assignments/AssignmentsTable.tsx`)
  - `AssignmentDetailModal` (`components/assignments/AssignmentDetailModal.tsx`)
  - `AssignmentFiltersComponent` (`components/assignments/AssignmentFilters.tsx`)
- **Hooks:**
  - `useAssignments(filters)` (from `useAdminAssignments.ts`)
  - `useAssignmentsStats()` (from `useAdminAssignments.ts`)
  - `downloadAssignmentsCSV()` (utility function)
- **Endpoints API:**
  - `GET /admin/assignments` (paginated list with filters)
  - `GET /admin/assignments/:id` (assignment detail)
  - `GET /admin/assignments/stats` (global statistics)
  - `GET /admin/assignments/export` (CSV export, **marked as ORPHAN in api.config.ts**)
- **Estado:**
  - `filters: AssignmentFilters` with page/limit
  - `selectedAssignment` + `isDetailModalOpen` for detail modal
  - `isExporting` for CSV export loading
- **Interacciones:**
  - 5 stats cards (Total, Activas, Pendientes, Calificadas, Tarde)
  - Expandable filter panel (classroom, teacher, student, status, date range)
  - DataTable with sortable columns, clickable rows
  - Assignment detail modal with submissions table, grade distribution, engagement metrics
  - CSV export button
  - Refresh button with spinning animation
  - Pagination with scroll-to-top
- **Errores:**
  - Export: try/catch with Toast notification (success/error)
  - No error UI for main assignments query failure
  - No error UI for stats query failure
- **Carga:**
  - Stats loading: text placeholder "Cargando estadisticas..."
  - Table loading: spinner animation in AssignmentsTable
  - Actions bar shows "Cargando..." for pagination info
  - Detail modal: spinner while loading assignment detail
- **Accesibilidad:**
  - No explicit ARIA attributes on stats cards
  - No `aria-label` on filter panel or table region
  - Pagination not keyboard-accessible beyond native button behavior
  - Toast positioned top-right
- **Responsividad:**
  - Stats grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-5`
  - Filter grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Detail modal stats: `grid-cols-1 md:grid-cols-4`
- **Issues:**
  - [P1] **Assignments endpoints are ORPHAN** - `api.config.ts` line 400 explicitly marks `/admin/assignments/export` as "ORPHAN: No backend endpoint". The `/admin/assignments` list and stats endpoints also appear to have no corresponding backend controller.
  - [P1] `AssignmentFiltersComponent` uses raw text inputs for classroom_id, teacher_id, student_id (user must type UUIDs). Should use dropdowns with API-backed options.
  - [P2] Date filter validation error is displayed but filtering still proceeds (validation does not block)
  - [P2] Page title is bilingual ("Assignments" in header, "Actualizar" in button) - inconsistent language
  - [P2] `handleClearFilters` keeps `page` and `limit` but should also reset to page 1

---

### 1.5 AdminProgressPage

- **Ruta:** `/admin/progress`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminProgressPage.tsx` (297 lineas)
- **Componentes:**
  - `AdminPageShell` (shared wrapper)
  - `DetectiveCard`, `DetectiveButton`
  - `OverviewView` (`components/progress/OverviewView.tsx`)
  - `ClassroomsView` (`components/progress/ClassroomsView.tsx`)
  - `StudentDetailView` (`components/progress/StudentDetailView.tsx`)
  - `ClassroomSelector` (`components/progress/ClassroomSelector.tsx`)
  - `StudentSearch` (`components/progress/StudentSearch.tsx`)
- **Hooks:**
  - `useProgress` (from `hooks/useProgress.ts`)
  - `useClassroomsList` (from `hooks/useClassroomsList.ts`)
- **Endpoints API:**
  - `GET /admin/progress/overview` (system-wide stats)
  - `GET /admin/progress/classrooms/:id` (classroom progress with students)
  - `GET /admin/progress/students/:id` (individual student progress)
  - `GET /admin/progress/modules/:id` (module progress stats)
  - `GET /admin/progress/exercises/:id` (exercise stats)
  - `GET /admin/progress/export` (CSV export)
  - `GET /admin/classrooms` (classrooms list)
- **Estado:**
  - `activeView`: 'overview' | 'classrooms' | 'students'
  - `selectedClassroomId`, `selectedStudentId`
  - `isExporting` for CSV export
  - `useProgress` internally manages active query IDs via useState
- **Interacciones:**
  - 3 view buttons: Resumen General, Por Aula, Por Estudiante
  - Breadcrumb navigation trail
  - Classroom selector dropdown (real data from API)
  - Student search with autocomplete (2-character minimum, click-outside dismiss)
  - Refresh button per active view
  - CSV export (disabled for overview view)
  - Overview: 6 stats cards + summary card
  - Classrooms: classroom info card + sortable students DataTable with drill-down
  - Students: user info card + stats cards + module progress bars + recent submissions list
- **Errores:**
  - Error banner (DetectiveCard variant="danger") with dismissible error message
  - `clearError` resets all query caches in `useProgress`
  - Export: try/catch with console.error
- **Carga:**
  - OverviewView: skeleton grid (6 animated pulse cards)
  - ClassroomsView: skeleton cards (2 animated pulse cards)
  - StudentDetailView: skeleton cards (3 animated pulse cards)
  - EmptyState component for no data
- **Accesibilidad:**
  - Breadcrumb nav with `aria-label="Ruta de navegacion"` and `aria-current="page"`
  - View selector buttons in `role="group"` with `aria-label`
  - Error region wrapped in `aria-live="polite"`
  - Content region has `role="region"` with `aria-label`
  - ClassroomSelector has `htmlFor` label
  - StudentSearch has `htmlFor` label and `aria-label` on clear button
- **Responsividad:**
  - Header: `flex-col gap-4 lg:flex-row lg:items-center lg:justify-between`
  - Filter grid: `grid-cols-1 md:grid-cols-2`
  - Stats grid: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
  - Student info: `grid-cols-2 md:grid-cols-4`
- **Issues:**
  - [P2] `useProgress` uses `enabled: false` for overview query with manual `refetch()` - this means data is not automatically re-fetched on window focus or cache invalidation
  - [P2] Export error only logs to console, no user-visible feedback
  - [P2] Student search only works from `studentsForSearch` derived from `classroomProgress.students` - must select a classroom first to search students
  - [P2] `useEffect` dependency on `fetchOverview` (stable via useCallback) causes initial double-fetch risk with React 18 StrictMode

---

## 2. Exercise Builder -- Analisis Detallado

### 2.1 Wizard Flow

The Exercise Builder is a 4-step wizard orchestrated by `AdminExerciseCreatePage.tsx`. State lives in a single `useState<ExerciseFormData>` at the page level and flows down to step components via props.

```
Step 1: Informacion Basica (StepBasicInfo)
  |-- Title, Description, Instructions (text fields)
  |-- Module selection (dropdown from API + Create Module modal)
  |-- Difficulty (4 levels: beginner, intermediate, advanced, expert)
  |-- Estimated Time (1-120 min)
  |-- Hints Allowed (0-10)
  |-- Pedagogical Notes (howToSolve, recommendedStrategy, pedagogicalNotes)
  |-- XP Reward, ML Coins Reward
  |
  v (canAdvance: title && description && moduleId)

Step 2: Tipo de Ejercicio (ExerciseTypeSelector)
  |-- Module filter tabs (Todos, M1 Literal, M2 Inferencial, M3 Critica)
  |-- 17 exercise type cards with icon, name, description, complexity badge
  |-- Grid layout: 1/2/3 columns responsive
  |-- Selecting a type resets typeConfig to {}
  |
  v (canAdvance: exerciseType selected)

Step 3: Configuracion (Dynamic TypeConfig component)
  |-- Dynamically loaded from TYPE_CONFIG_MAP[exerciseType]
  |-- Each TypeConfig receives { config, onChange } props
  |-- 17 individual configuration forms
  |
  v (canAdvance: typeConfig has at least 1 key)

Step 4: Vista Previa (ExercisePreview)
  |-- Read-only preview of all form data
  |-- Title, description, badges (module, difficulty, type)
  |-- Stats: time, XP, ML Coins, hints
  |-- Instructions section
  |-- Raw typeConfig key-value display
  |-- Pedagogical notes section
  |-- Action buttons: Save Draft, Submit for Review
```

### 2.2 ExerciseTypeSelector

**File:** `apps/frontend/src/apps/admin/components/exercise-builder/ExerciseTypeSelector.tsx` (210 lines)

**Architecture:**
- **Static data**: `EXERCISE_TYPES` array defines 17 types across 3 modules (M1: 7 types, M2: 5 types, M3: 5 types)
- **Module tab resolution**: UUID from Step 1 `moduleId` is mapped to logical IDs (`module-1`, `module-2`, etc.) via `uuidToLogicalId` map built from the `modules` prop
- **Dynamic tabs**: If the API returns modules beyond the 3 known ones, extra tabs are dynamically generated
- **Filter sync**: `useEffect` syncs `activeTab` when the resolved module filter changes (e.g., user goes back to Step 1, changes module, returns to Step 2)

**Props:**
```typescript
interface ExerciseTypeSelectorProps {
  selectedType: string;       // Currently selected exercise type ID
  moduleFilter: string;       // UUID of module selected in Step 1
  onSelect: (typeId: string) => void;  // Callback when type is selected
  modules?: Array<{ id: string; title: string; module_code?: string; order_index: number }>;
}
```

**Issues:**
- [P1] **Missing Module 4 and Module 5 types**: Only M1 (7), M2 (5), M3 (5) = 17 types are defined. The project has 23+ exercise types including M4 (Digital Literacy) and M5 (Text Production). Types like `analisis_memes`, `infografia_interactiva`, `quiz_tiktok`, `verificador_fake_news`, `comic_digital`, `diario_multimedia`, `video_carta`, `navegacion_hipertextual` are missing from the selector and from `TYPE_CONFIG_MAP`.
- [P2] `EXERCISE_TYPES` uses emoji icons (`\u{1F4DD}`) that may render inconsistently across OS/browsers
- [P2] No search/filter within types (with 23+ types, finding one requires scrolling)

### 2.3 State Management Between Steps

**Pattern:** Lifted state with prop drilling.

```
AdminExerciseCreatePage
  |-- formData: ExerciseFormData (single useState)
  |-- updateField: generic updater function
  |
  |-- StepBasicInfo
  |     receives: formData, updateField
  |     updates: title, description, instructions, moduleId, difficulty, estimatedTime,
  |              hintsAllowed, howToSolve, recommendedStrategy, pedagogicalNotes,
  |              xpReward, mlCoinsReward
  |
  |-- ExerciseTypeSelector
  |     receives: selectedType=formData.exerciseType, moduleFilter=formData.moduleId
  |     updates: exerciseType (via onSelect callback), typeConfig (reset to {})
  |
  |-- TypeConfigComponent (dynamic)
  |     receives: config=formData.typeConfig
  |     updates: typeConfig (via onChange callback)
  |
  |-- ExercisePreview
        receives: formData (read-only)
```

**Validation logic per step:**
| Step | Gate Condition |
|------|---------------|
| 1 | `title && description && moduleId` (all truthy) |
| 2 | `exerciseType` is truthy |
| 3 | `Object.keys(typeConfig).length > 0` |
| 4 | Always true (preview) |

**Missing validations:**
- No minimum length for title/description
- No typeConfig schema validation (just key count > 0)
- No confirmation before Submit for Review
- Instructions field is not required despite being important for students

### 2.4 TypeConfig Components (17 files)

All 17 TypeConfig components follow the same interface pattern:

```typescript
interface TypeConfigProps {
  config: Record<string, unknown>;
  onChange: (config: Record<string, unknown>) => void;
}
```

**Module 1 - Comprension Literal (7):**

| Component | File | Config Fields | Key Features |
|-----------|------|--------------|--------------|
| `CompletarEspaciosConfig` | type-configs/CompletarEspaciosConfig.tsx | passage, blanks[] | Text selection to mark blanks, live preview, distractors per blank |
| `CrucigramaConfig` | type-configs/CrucigramaConfig.tsx | words[], gridSize | Word/clue pairs, direction (horizontal/vertical) |
| `EmparejamientoConfig` | type-configs/EmparejamientoConfig.tsx | pairs[] | Left/right pairs, add/remove |
| `LineaTiempoConfig` | type-configs/LineaTiempoConfig.tsx | events[] | Date + event text, chronological ordering |
| `MapaConceptualConfig` | type-configs/MapaConceptualConfig.tsx | nodes[], connections[] | Concept nodes with connections/labels |
| `SopaLetrasConfig` | type-configs/SopaLetrasConfig.tsx | words[], gridSize | Hidden words, grid dimensions |
| `VerdaderoFalsoConfig` | type-configs/VerdaderoFalsoConfig.tsx | statements[] | Statement text, true/false toggle, explanation |

**Module 2 - Comprension Inferencial (5):**

| Component | File | Config Fields | Key Features |
|-----------|------|--------------|--------------|
| `ConstruccionHipotesisConfig` | type-configs/ConstruccionHipotesisConfig.tsx | passage, hypotheses[] | Evidence + hypothesis pairs |
| `DetectiveTextualConfig` | type-configs/DetectiveTextualConfig.tsx | passage, clues[], mystery | Mystery text with embedded clues |
| `PrediccionNarrativaConfig` | type-configs/PrediccionNarrativaConfig.tsx | narrative, breakpoints[] | Story segments with prediction points |
| `PuzzleContextoConfig` | type-configs/PuzzleContextoConfig.tsx | passage, words[] | Context clues for word meaning |
| `RuedaInferenciasConfig` | type-configs/RuedaInferenciasConfig.tsx | passage, inferences[] | Inference + evidence wheel |

**Module 3 - Comprension Critica (5):**

| Component | File | Config Fields | Key Features |
|-----------|------|--------------|--------------|
| `AnalisisFuentesConfig` | type-configs/AnalisisFuentesConfig.tsx | sources[], questions[] | Multiple source analysis |
| `DebateDigitalConfig` | type-configs/DebateDigitalConfig.tsx | topic, positions[] | Debate topic with argument positions |
| `MatrizPerspectivasConfig` | type-configs/MatrizPerspectivasConfig.tsx | topic, perspectives[] | Multiple viewpoint analysis |
| `PodcastArgumentativoConfig` | type-configs/PodcastArgumentativoConfig.tsx | topic, segments[] | Structured argument segments |
| `TribunalOpinionesConfig` | type-configs/TribunalOpinionesConfig.tsx | case, evidence[], arguments[] | Case study with evidence evaluation |

**Common pattern across all TypeConfig components:**
- Add/remove items via Plus/Trash2 icons
- Each item has a numbered label (e.g., "Afirmacion #1")
- Empty state with instructional message
- No built-in validation (all fields optional)
- ID generation via `Date.now()` (collision risk in rapid creation)

### 2.5 Exercise Builder File Inventory

| # | File | Type | Lines | Purpose |
|---|------|------|-------|---------|
| 1 | AdminExerciseCreatePage.tsx | Page | 367 | Wizard orchestrator |
| 2 | exercise-builder.types.ts | Types | 17 | ExerciseFormData interface |
| 3 | ExerciseTypeSelector.tsx | Component | 210 | Step 2: type selection grid |
| 4 | StepBasicInfo.tsx | Component | 249 | Step 1: basic info form |
| 5 | ExercisePreview.tsx | Component | 173 | Step 4: preview |
| 6 | ContentEditor.tsx | Component | 119 | Markdown editor (unused in wizard) |
| 7 | CreateModuleModal.tsx | Component | 314 | Inline module creation modal |
| 8 | type-configs/index.ts | Barrel | 18 | Type config exports |
| 9 | type-configs/CompletarEspaciosConfig.tsx | Config | 196 | Fill-in-the-blanks config |
| 10 | type-configs/CrucigramaConfig.tsx | Config | ~150 | Crossword config |
| 11 | type-configs/EmparejamientoConfig.tsx | Config | ~120 | Matching pairs config |
| 12 | type-configs/LineaTiempoConfig.tsx | Config | ~140 | Timeline config |
| 13 | type-configs/MapaConceptualConfig.tsx | Config | ~180 | Concept map config |
| 14 | type-configs/SopaLetrasConfig.tsx | Config | ~130 | Word search config |
| 15 | type-configs/VerdaderoFalsoConfig.tsx | Config | 133 | True/false config |
| 16 | type-configs/ConstruccionHipotesisConfig.tsx | Config | ~150 | Hypothesis building config |
| 17 | type-configs/DetectiveTextualConfig.tsx | Config | ~160 | Textual detective config |
| 18 | type-configs/PrediccionNarrativaConfig.tsx | Config | ~140 | Narrative prediction config |
| 19 | type-configs/PuzzleContextoConfig.tsx | Config | ~130 | Context puzzle config |
| 20 | type-configs/RuedaInferenciasConfig.tsx | Config | ~150 | Inference wheel config |
| 21 | type-configs/AnalisisFuentesConfig.tsx | Config | ~160 | Source analysis config |
| 22 | type-configs/DebateDigitalConfig.tsx | Config | ~150 | Digital debate config |
| 23 | type-configs/MatrizPerspectivasConfig.tsx | Config | ~160 | Perspectives matrix config |
| 24 | type-configs/PodcastArgumentativoConfig.tsx | Config | ~150 | Argumentative podcast config |
| 25 | type-configs/TribunalOpinionesConfig.tsx | Config | ~170 | Opinions tribunal config |

**Total: 25 files, ~3,700+ lines**

---

## 3. Catalogo de Componentes

### 3.1 Content Components

| Component | Path | Props | Purpose | Dependencies |
|-----------|------|-------|---------|-------------|
| `PendingExercisesTab` | components/content/PendingExercisesTab.tsx | `onPreview`, `onReject` | DataTable of pending exercises with approve/reject/view actions | `usePendingExercisesQuery`, `DataTable` |
| `MediaLibraryTab` | components/content/MediaLibraryTab.tsx | (none) | DataTable of media files with filename, type, size, date | `useMediaLibraryQuery`, `DataTable` |
| `ContentVersionsTab` | components/content/ContentVersionsTab.tsx | (none) | DataTable of approval history | `adminAPI.content.getApprovalHistory`, `DataTable` |
| `ContentPreviewModal` | components/content/ContentPreviewModal.tsx | `isOpen`, `exercise`, `onClose`, `onApprove`, `onReject` | Full exercise preview with content rendering | `Modal`, `ExerciseContentRenderer`, `getExercise` |
| `RejectExerciseModal` | components/content/RejectExerciseModal.tsx | `isOpen`, `exercise`, `onClose`, `onReject` | Reason input for exercise rejection | `Modal`, `FormField`, `useModalBehavior` |
| `ContentApprovalQueue` | components/content/ContentApprovalQueue.tsx | (barrel export) | Legacy approval queue component | (not analyzed - not in active page flow) |
| `ExerciseContentEditor` | components/content/ExerciseContentEditor.tsx | (barrel export) | Legacy exercise CRUD editor | `useLegacyExercises` |
| `MediaLibraryManager` | components/content/MediaLibraryManager.tsx | (barrel export) | Legacy media upload/manage component | `useMediaLibrary` |
| `ContentVersionControl` | components/content/ContentVersionControl.tsx | (barrel export) | Legacy version control component | `useContentVersions` |

### 3.2 Exercise Builder Components

| Component | Path | Props | Purpose | Dependencies |
|-----------|------|-------|---------|-------------|
| `StepBasicInfo` | components/exercise-builder/StepBasicInfo.tsx | `formData`, `updateField` | Form fields for step 1 | `useModulesQuery`, `CreateModuleModal` |
| `ExerciseTypeSelector` | components/exercise-builder/ExerciseTypeSelector.tsx | `selectedType`, `moduleFilter`, `onSelect`, `modules?` | Grid of 17 exercise type cards with module tabs | `DetectiveCard`, `framer-motion` |
| `ExercisePreview` | components/exercise-builder/ExercisePreview.tsx | `formData` | Read-only preview of exercise configuration | `DetectiveCard`, lucide icons |
| `ContentEditor` | components/exercise-builder/ContentEditor.tsx | `value`, `onChange`, `placeholder?`, `label?` | Markdown text editor with toolbar | (standalone) |
| `CreateModuleModal` | components/exercise-builder/CreateModuleModal.tsx | `isOpen`, `onClose`, `onModuleCreated`, `existingModuleCount` | Modal form to create new educational module | `useModulesQuery`, `Modal`, `DetectiveButton` |

### 3.3 Gamification Components

| Component | Path | Props | Purpose | Dependencies |
|-----------|------|-------|---------|-------------|
| `RanksTab` | components/gamification/RanksTab.tsx | `ranks`, `onEditRank`, `isLoading` | Sortable list of Maya ranks with color-coded cards | `DetectiveCard`, `DetectiveButton` |
| `AchievementsTab` | components/gamification/AchievementsTab.tsx | (self-contained) | Achievement management grid | (analyzed via barrel, self-fetching) |
| `EconomyTab` | components/gamification/EconomyTab.tsx | `parameters`, `stats`, `onEditParameter`, `onBulkUpdate`, `onPreviewImpact`, `onRestoreDefaults`, `isLoading` | Economy parameter cards with action buttons | `DetectiveCard`, `DetectiveButton` |
| `StatsTab` | components/gamification/StatsTab.tsx | `stats`, `parameters`, `isLoading` | Statistics dashboard with charts/numbers | `DetectiveCard` |
| `ParameterEditModal` | components/gamification/ParameterEditModal.tsx | `isOpen`, `onClose`, `parameter`, `onSuccess`, `onUpdate`, `onReset` | Edit single gamification parameter value | `Modal` |
| `MayaRankEditModal` | components/gamification/MayaRankEditModal.tsx | `isOpen`, `onClose`, `rank`, `allRanks`, `onSuccess`, `onUpdate` | Edit Maya rank XP range and properties | `Modal` |
| `BulkUpdateDialog` | components/gamification/BulkUpdateDialog.tsx | `isOpen`, `onClose`, `parameters`, `onSuccess`, `onBulkUpdate` | Bulk parameter update with reason | `Modal` |
| `PreviewImpactDialog` | components/gamification/PreviewImpactDialog.tsx | `isOpen`, `onClose`, `impactData`, `isLoading`, `onConfirm` | Preview impact of parameter changes | `Modal` |
| `RestoreDefaultsDialog` | components/gamification/RestoreDefaultsDialog.tsx | `isOpen`, `onClose`, `parameters`, `onConfirm` | Confirmation dialog for restoring defaults | `Modal` |

### 3.4 Assignment Components

| Component | Path | Props | Purpose | Dependencies |
|-----------|------|-------|---------|-------------|
| `AssignmentFiltersComponent` | components/assignments/AssignmentFilters.tsx | `filters`, `onFiltersChange`, `onClear` | Expandable filter panel (classroom, teacher, student, status, dates) | lucide icons |
| `AssignmentsTable` | components/assignments/AssignmentsTable.tsx | `assignments`, `loading?`, `onRowClick?` | Sortable data table with progress bars, status badges | `DataTable`, `StatusBadge`, `EmptyState` |
| `AssignmentDetailModal` | components/assignments/AssignmentDetailModal.tsx | `assignment`, `isOpen`, `onClose` | Full detail view with stats, submissions, grade distribution | `Modal`, `DataTable`, `useAssignmentDetail` |

### 3.5 Progress Components

| Component | Path | Props | Purpose | Dependencies |
|-----------|------|-------|---------|-------------|
| `OverviewView` | components/progress/OverviewView.tsx | `overview`, `isLoading` | 6 system-wide stats cards + summary card | `DetectiveCard`, `EmptyState` |
| `ClassroomsView` | components/progress/ClassroomsView.tsx | `classroomProgress`, `isLoading`, `onStudentClick` | Classroom info card + sortable student DataTable | `DataTable`, `DetectiveCard`, `DetectiveButton` |
| `StudentDetailView` | components/progress/StudentDetailView.tsx | `studentProgress`, `isLoading` | Student info, stats cards, module progress bars, recent submissions | `DetectiveCard` |
| `ClassroomSelector` | components/progress/ClassroomSelector.tsx | `classrooms`, `selectedClassroomId`, `onSelect`, `isLoading?` | Dropdown with School icon and chevron | (standalone) |
| `StudentSearch` | components/progress/StudentSearch.tsx | `students`, `onSelect`, `isLoading?`, `placeholder?` | Autocomplete search with 2-char minimum, click-outside dismiss | (standalone) |

### 3.6 Shared Components Used

| Component | Path | Used By |
|-----------|------|---------|
| `AdminPageShell` | components/shared/AdminPageShell.tsx | All 5 pages |
| `AdminTabBar` | components/shared/AdminTabBar.tsx | AdminContentPage, AdminGamificationPage |

---

## 4. Analisis de Hooks

### 4.1 useContentQueries

- **File:** `apps/frontend/src/apps/admin/hooks/useContentQueries.ts` (708 lines)
- **Exported hooks:**
  - `usePendingExercisesQuery()` -> React Query for pending content review
  - `useMediaLibraryQuery()` -> React Query for media library (list/upload/delete)
  - `useContentVersionsQuery()` -> React Query for content versions
  - `useApprovalsQuery()` -> React Query for approval workflow
  - `useLegacyExercises()` -> React Query for CRUD on exercises
  - `useModulesQuery()` -> React Query for educational modules
- **API Calls:** 11 distinct endpoints via `adminAPI` and `apiClient`
- **Query Keys:** Centralized `CONTENT_QUERY_KEYS` factory
- **Return type:** Each hook returns both React Query standard interface AND backward-compatible interface
- **Consumers:** AdminContentPage, PendingExercisesTab, MediaLibraryTab, AdminExerciseCreatePage, StepBasicInfo, CreateModuleModal
- **Stale times:** 2-5 minutes depending on data volatility
- **Pattern note:** All hooks use `toast.success`/`toast.error` in mutation callbacks for user feedback

### 4.2 useContentManagement

- **File:** `apps/frontend/src/apps/admin/hooks/useContentManagement.ts` (185 lines)
- **Purpose:** Backward compatibility layer - re-exports from `useContentQueries.ts`
- **Exported functions:** `usePendingExercises`, `useMediaLibrary`, `useContentVersions`, `useApprovals` (deprecated), `useExercises` (deprecated)
- **Consumers:** Referenced in hooks/index.ts barrel, ContentApprovalQueue, ExerciseContentEditor, MediaLibraryManager
- **Note:** Scheduled for removal once all consumers migrate to `useContentQueries` directly

### 4.3 useGamificationConfig

- **File:** `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts` (349 lines)
- **Pattern:** Returns factory hooks (not data directly)
- **Returned hooks:** `useParameters()`, `useParameter(key)`, `useMayaRanks()`, `useMayaRank(id)`, `useStats()`
- **Returned mutations:** `updateParameter`, `resetParameter`, `bulkUpdateParameters`, `updateMayaRank`, `previewImpact`, `restoreDefaults`
- **API Calls:** 10 endpoints via `gamificationConfigApi`
- **Key feature:** Defensive data transformations:
  - `normalizeRank()`: snake_case to camelCase, null guards, type validation
  - `selectSafeParameters()`: filters out invalid parameters
  - `useStats` queryFn: validates all numeric fields
- **Consumers:** AdminGamificationPage (sole consumer)
- **Stale times:** 2-10 minutes (stats=2min, params=5min, ranks=10min)

### 4.4 useProgress

- **File:** `apps/frontend/src/apps/admin/hooks/useProgress.ts` (237 lines)
- **Pattern:** On-demand queries with manual trigger via state changes
- **Queries:** overview (manual), classroom (auto on ID change), student (auto on ID change), module (auto on ID change), exercise (auto on ID change)
- **Utility:** `exportToCSV()` creates blob download link
- **API Calls:** 6 endpoints via `adminAPI.progress.*`
- **Return type:** `UseProgressResult` with data, loading, error, and action functions
- **Consumers:** AdminProgressPage (sole consumer)
- **Query key factory:** `progressKeys` with nested structure
- **Combined loading:** `isLoading` combines all 5 query `isFetching` states

### 4.5 useAdminAssignments

- **File:** `apps/frontend/src/apps/admin/hooks/useAdminAssignments.ts` (292 lines)
- **Contains both API functions and React Query hooks in same file**
- **Hooks:**
  - `useAssignments(filters)` -> paginated assignments list
  - `useAssignmentDetail(id)` -> single assignment detail
  - `useAssignmentsStats()` -> global stats with auto-refetch every 60s
  - `useClassroomAssignments(classroomId)` -> classroom-specific assignments
- **Utility:** `downloadAssignmentsCSV(filters)` -> blob download
- **API calls:** 5 direct `apiClient.get` calls (not via adminAPI)
- **Return type:** Standard React Query hook returns
- **Consumers:** AdminAssignmentsPage, AssignmentDetailModal
- **Issue:** API functions use raw string URLs (`/admin/assignments`) instead of `API_ENDPOINTS` constants (except export)

### 4.6 useClassroomsList

- **File:** `apps/frontend/src/apps/admin/hooks/useClassroomsList.ts` (72 lines)
- **API Call:** `adminAPI.classrooms.getAll({ schoolId })`
- **Return type:** `UseClassroomsListReturn` with classrooms array, loading, error, refetch
- **Consumers:** AdminProgressPage
- **Stale time:** 5 minutes, no refetch on window focus
- **Note:** Clean, well-documented hook following best practices

---

## 5. Issues y Recomendaciones

### P0 - Critico (Funcionalidad Rota)

| ID | Issue | Ubicacion | Descripcion |
|----|-------|-----------|-------------|
| P0-01 | Edit route sin logica de edicion | AdminExerciseCreatePage.tsx | La ruta `/admin/exercises/:id/edit` (App.tsx:698) renderiza `AdminExerciseCreatePage` pero el componente no lee el parametro `:id`, no hace fetch del ejercicio existente, ni pre-popula el formulario. El usuario ve un formulario vacio de creacion. |

### P1 - Alto (Funcionalidad Degradada)

| ID | Issue | Ubicacion | Descripcion |
|----|-------|-----------|-------------|
| P1-01 | Endpoints de Assignments ORPHAN | useAdminAssignments.ts, api.config.ts:400 | Los endpoints `/admin/assignments`, `/admin/assignments/stats`, `/admin/assignments/classrooms/:id` no tienen backend controller correspondiente. `api.config.ts` marca el export como "ORPHAN: No backend endpoint". La pagina entera depende de endpoints inexistentes. |
| P1-02 | Tipos de ejercicio M4/M5 ausentes | ExerciseTypeSelector.tsx, TYPE_CONFIG_MAP | Solo 17 de 23+ tipos de ejercicio estan definidos. Faltan todos los de Modulo 4 (AnalisisMemes, InfografiaInteractiva, QuizTikTok, NavegacionHipertextual, VerificadorFakeNews) y Modulo 5 (ComicDigital, DiarioMultimedia, VideoCarta). Estos no pueden crearse via el wizard. |
| P1-03 | Preview muestra UUID en lugar de nombre de modulo | ExercisePreview.tsx | `MODULE_NAMES` usa IDs estaticos (`module-1`, etc.) pero `formData.moduleId` contiene un UUID real del backend. El preview mostrara el UUID como nombre de modulo. |
| P1-04 | ContentPreviewModal no usa React Query | ContentPreviewModal.tsx | Usa `useState` + `useEffect` + `useCallback` manual para fetch de detalle de ejercicio. Inconsistente con el patron del proyecto y pierde beneficios de cache/deduplication. |
| P1-05 | Campo hintsAllowed duplicado | StepBasicInfo.tsx | El campo "Pistas Permitidas" aparece en la seccion "Informacion Basica" (linea 137) Y en la seccion "Recompensas" (linea 223), ambos controlando el mismo campo `hintsAllowed`. Confuso para el usuario. |
| P1-06 | buildExercisePayload envia config y content duplicados | AdminExerciseCreatePage.tsx:123-124 | El payload envia `config: formData.typeConfig` y `content: formData.typeConfig` con el mismo valor. El backend puede interpretar estos campos de forma diferente. |
| P1-07 | Filtros de Assignments usan UUIDs manuales | AssignmentFilters.tsx | Los campos classroom_id, teacher_id y student_id son inputs de texto donde el usuario debe escribir UUIDs. Deberian ser dropdowns con datos de la API. |

### P2 - Medio (Mejoras de Calidad)

| ID | Issue | Ubicacion | Descripcion |
|----|-------|-----------|-------------|
| P2-01 | Sin advertencia de cambios sin guardar | AdminExerciseCreatePage.tsx | El wizard no tiene proteccion contra navegacion accidental. No hay `beforeunload` handler ni `Prompt`/`blocker` de React Router. |
| P2-02 | Validacion de typeConfig minima | AdminExerciseCreatePage.tsx:163 | Step 3 solo verifica `Object.keys(typeConfig).length > 0`. No valida que los campos requeridos del tipo especifico esten completos. |
| P2-03 | PreviewImpactDialog no funcional | AdminGamificationPage.tsx:214-215 | `impactData={null}` y `isLoading={false}` estan hardcodeados. La funcionalidad de preview de impacto no esta conectada. |
| P2-04 | Error state de gamificacion puede falso-positivo | AdminGamificationPage.tsx:76 | `hasErrors` es true cuando las 3 listas estan vacias Y no hay loading. Un sistema sin ranks/params/stats configurados mostraria el error. |
| P2-05 | Retry usa window.location.reload() | AdminGamificationPage.tsx:121 | Deberia usar `queryClient.refetchQueries()` para retry sin perder estado de React. |
| P2-06 | ContentVersionsTab mal etiquetada | AdminContentPage.tsx:40 | Tab label dice "Versiones" pero el contenido muestra "Historial de Aprobaciones" (`approval-history`). |
| P2-07 | Idioma mixto en AdminAssignmentsPage | AdminAssignmentsPage.tsx | Titulo "Assignments" (ingles) mezclado con botones "Actualizar", "Exportar CSV" (espanol). |
| P2-08 | Export de Progress sin feedback visual | AdminProgressPage.tsx:129 | Error de export solo se logea a consola, sin toast ni mensaje al usuario. |
| P2-09 | Student search requiere seleccion previa de aula | AdminProgressPage.tsx:72-79 | `studentsForSearch` se deriva de `classroomProgress.students`. Sin aula seleccionada, la lista de estudiantes esta vacia y no se puede buscar. |
| P2-10 | IDs generados con Date.now() | type-configs/*.tsx | Todas las type-configs generan IDs con `Date.now()`. Creacion rapida de multiples items puede causar colisiones. |
| P2-11 | DIFFICULTY_MAP silencioso | AdminExerciseCreatePage.tsx:97-102 | `expert` se mapea a `proficient` sin ningun indicador visual para el admin de que los valores difieren. |
| P2-12 | useProgress overview con enabled:false | useProgress.ts:103 | Query de overview usa `enabled: false` con refetch manual. No se beneficia de refetch automatico ni staleTime. |
| P2-13 | handleClearFilters no resetea pagina | AdminAssignmentsPage.tsx:78 | `handleClearFilters` mantiene page y limit pero no incluye `page: 1`. Si el usuario esta en pagina 5 y limpia filtros, queda en pagina 5. |
| P2-14 | useCallback dependency missing | AdminContentPage.tsx:87 | `handleApproveFromPreview` omite `handleError` del array de dependencias de `useCallback`. |

---

## 6. Cobertura de Documentacion

### 6.1 Documentacion Existente

| Documento | Path | Relevancia | Estado |
|-----------|------|-----------|--------|
| PORTAL-ADMIN-GUIDE.md | docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md | General admin portal guide | Existe pero puede estar desactualizado |
| FLUJO-CONSTRUCTOR-EJERCICIOS.md | docs/30-ux-ui/flujos/admin/FLUJO-CONSTRUCTOR-EJERCICIOS.md | Exercise builder wizard flow | Existe |
| FLUJO-APROBACION-CONTENIDO.md | docs/30-ux-ui/flujos/admin/FLUJO-APROBACION-CONTENIDO.md | Content approval flow | Existe |
| FLUJO-GESTION-GAMIFICACION.md | docs/30-ux-ui/flujos/admin/FLUJO-GESTION-GAMIFICACION.md | Gamification configuration flow | Existe |

### 6.2 Documentacion Faltante

| Documento Faltante | Descripcion | Prioridad |
|--------------------|-------------|-----------|
| FLUJO-ASSIGNMENTS-ADMIN.md | Flujo de visualizacion y monitoreo de assignments | P1 |
| FLUJO-PROGRESS-ADMIN.md | Flujo de seguimiento de progreso (overview, por aula, por estudiante) | P1 |
| Exercise Builder API Contract | Mapeo frontend->backend de ExerciseFormData a exercise entity | P1 |
| TypeConfig Schema Reference | Schema esperado por cada tipo de ejercicio con campos requeridos | P2 |
| Admin Content Management Guide | Flujo completo de gestion de contenido (pending, media, versions) | P2 |

### 6.3 Coherencia con Documentacion Existente

- El FLUJO-CONSTRUCTOR-EJERCICIOS.md documenta el wizard de 4 pasos, pero debe actualizarse para reflejar:
  - La existencia de `CreateModuleModal` (creacion inline de modulos)
  - La ausencia de tipos M4/M5 en el selector
  - La ruta de edicion rota (`/admin/exercises/:id/edit`)
- PORTAL-ADMIN-GUIDE.md es general y no detalla las 5 paginas analizadas

---

## 7. Resumen de Metricas

| Metrica | Valor |
|---------|-------|
| Paginas analizadas | 5 |
| Componentes totales | 42 |
| Hooks analizados | 8 (6 en useContentQueries + useGamificationConfig + useProgress + useAdminAssignments + useClassroomsList) |
| Endpoints API mapeados | ~35 |
| TypeConfig components | 17 |
| Issues P0 | 1 |
| Issues P1 | 7 |
| Issues P2 | 14 |
| Archivos Exercise Builder | 25 |
| Lineas Exercise Builder | ~3,700+ |
| Documentacion existente | 4 documentos |
| Documentacion faltante | 5 documentos |

---

## 8. Mapa de Dependencias

```
AdminContentPage
  +-- usePendingExercisesQuery -> adminAPI.getPendingContent
  +-- PendingExercisesTab -> usePendingExercisesQuery -> adminAPI
  +-- MediaLibraryTab -> useMediaLibraryQuery -> apiClient
  +-- ContentVersionsTab -> adminAPI.content.getApprovalHistory
  +-- ContentPreviewModal -> getExercise (educationalAPI)
  +-- RejectExerciseModal -> (receives onReject from parent)

AdminExerciseCreatePage
  +-- useModulesQuery -> educationalAPI.getModules
  +-- useMutation -> apiClient.post(educational.exercises)
  +-- StepBasicInfo -> useModulesQuery
  |     +-- CreateModuleModal -> useModulesQuery.createModule
  +-- ExerciseTypeSelector (static data + modules prop)
  +-- TypeConfigComponent (17 variants, all stateless)
  +-- ExercisePreview (read-only)

AdminGamificationPage
  +-- useGamificationConfig
  |     +-- gamificationConfigApi.listParameters
  |     +-- gamificationConfigApi.listMayaRanks
  |     +-- gamificationConfigApi.getStats
  |     +-- gamificationConfigApi.updateParameter
  |     +-- gamificationConfigApi.resetParameter
  |     +-- gamificationConfigApi.bulkUpdateParameters
  |     +-- gamificationConfigApi.updateMayaRank
  |     +-- gamificationConfigApi.previewImpact
  |     +-- gamificationConfigApi.restoreDefaults
  +-- RanksTab, AchievementsTab, EconomyTab, StatsTab
  +-- ParameterEditModal, MayaRankEditModal
  +-- BulkUpdateDialog, PreviewImpactDialog, RestoreDefaultsDialog

AdminAssignmentsPage
  +-- useAssignments -> apiClient.get(/admin/assignments) [ORPHAN]
  +-- useAssignmentsStats -> apiClient.get(/admin/assignments/stats) [ORPHAN]
  +-- downloadAssignmentsCSV -> apiClient.get(.../export) [ORPHAN]
  +-- AssignmentFiltersComponent (stateless filter UI)
  +-- AssignmentsTable -> DataTable, StatusBadge, EmptyState
  +-- AssignmentDetailModal -> useAssignmentDetail [ORPHAN]

AdminProgressPage
  +-- useProgress
  |     +-- adminAPI.progress.getOverview
  |     +-- adminAPI.progress.getClassroomProgress
  |     +-- adminAPI.progress.getStudentProgress
  |     +-- adminAPI.progress.getModuleProgress
  |     +-- adminAPI.progress.getExerciseStats
  |     +-- adminAPI.progress.exportCSV
  +-- useClassroomsList -> adminAPI.classrooms.getAll
  +-- OverviewView (stats cards)
  +-- ClassroomsView -> DataTable
  +-- StudentDetailView (module progress + submissions)
  +-- ClassroomSelector (dropdown)
  +-- StudentSearch (autocomplete)
```

---

## 9. Rutas de Navegacion

### Incoming Routes (from App.tsx)

| Route | Component | Auth Required |
|-------|-----------|--------------|
| `/admin/content` | AdminContentPage | Yes (admin) |
| `/admin/gamification` | AdminGamificationPage | Yes (admin) |
| `/admin/progress` | AdminProgressPage | Yes (admin) |
| `/admin/assignments` | AdminAssignmentsPage | Yes (admin) |
| `/admin/exercises/create` | AdminExerciseCreatePage | Yes (admin) |
| `/admin/exercises/:id/edit` | AdminExerciseCreatePage | Yes (admin) |

### Outgoing Navigation

- AdminContentPage: No outgoing navigation (all actions in-page via modals)
- AdminExerciseCreatePage: No outgoing navigation (no redirect after save/submit)
- AdminGamificationPage: No outgoing navigation (all actions in-page via modals)
- AdminAssignmentsPage: No outgoing navigation (detail in modal)
- AdminProgressPage: Internal view switching (overview <-> classrooms <-> students) but no external navigation

### Missing Navigation

- No "Back to Content" link from ExerciseCreatePage
- No redirect to content list after successful exercise creation
- No navigation from AdminContentPage to AdminExerciseCreatePage (no "Create Exercise" button)
- No navigation from AdminProgressPage to student's exercise detail
