# Hallazgos -- Grupo C: Content + Exercises + Gamification

**Agente:** C
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## Resumen

- Paginas analizadas: 3
- Hooks analizados: 2
- Componentes analizados: 17 (6 gamification + 6 content + 3 exercise-builder core + 2 exercise-builder inline)
- Total violaciones: 42 (5 CRITICA, 12 ALTA, 16 MEDIA, 9 BAJA)
- Total lineas analizadas: ~5,680

---

## 1. AdminContentPage.tsx (586 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminContentPage.tsx`

### Violaciones

1. **[CRITICA]** Lineas 73-110: Manual `useEffect` + `useState` para fetch de media y versions en lugar de React Query. Dos casi-identicos `useEffect` blocks que hacen `setLoading(true) -> try/catch -> setLoading(false)` cuando el tab cambia. Deberian ser queries con `enabled: activeTab === 'xxx'`.

2. **[CRITICA]** Lineas 37-44: Seis `useState` para loading/error/data de media y versions (loadingMedia, errorMedia, mediaFiles, loadingVersions, errorVersions, approvalHistory). Esto es estado manual que React Query elimina completamente.

3. **[ALTA]** Lineas 112-128: `fetchExerciseDetails` es un `useCallback` con manual loading/error state (3 useState adicionales en lineas 32-34). Deberia ser un `useQuery` con `enabled: !!exerciseId`.

4. **[ALTA]** Linea 586: Componente monolitico de 586 lineas (limite: 150). Viola SRP -- maneja 3 tabs completamente diferentes (pending, media, versions) mas 2 modales.

5. **[ALTA]** Lineas 59-70: Boilerplate `displayGamificationData` fallback (12 lineas). Patron duplicado en al menos 16 admin pages.

6. **[ALTA]** Lineas 137-140: `handleLogout` boilerplate duplicado en todas las admin pages.

7. **[ALTA]** Lineas 173-234: Column definitions inline (62 lineas). Deberian extraerse a un archivo de configuracion o a un componente dedicado.

8. **[MEDIA]** Lineas 237-310: Mas column definitions inline para media (33 lineas) y versions (39 lineas). Son dataTable configs que no cambian -- deberian ser constantes.

9. **[MEDIA]** Lineas 329-363: Tab switcher reimplementado inline (35 lineas). Mismo patron que GamificationPage pero con estilos ligeramente diferentes. No hay componente `AdminTabs` reutilizable.

10. **[MEDIA]** Lineas 366-448: Loading/error states con patron repetido 3 veces (una por tab). Spinner identico copy-paste en lineas 378-383, 405-410, 433-438.

11. **[MEDIA]** Lineas 451-539: Preview Modal inline (~89 lineas). Deberia ser un componente extraido.

12. **[MEDIA]** Lineas 541-583: Reject Modal inline (~43 lineas). Deberia ser un componente extraido.

13. **[BAJA]** Lineas 162-171: Mapping `PendingContent -> PendingExercise` que deberia estar en el hook o un utility.

### Boilerplate Duplicado

- `useAuth()` + `useUserGamification()` + `displayGamificationData` fallback + `handleLogout`: Lineas 23, 56-70, 137-140 (~30 lineas)
- `AdminLayout` wrapper con props identicos: Lineas 312-318

### Mapa de Dependencias

```
AdminContentPage.tsx
  +-- useAuth() -> @features/auth/hooks/useAuth
  +-- useUserGamification() -> @shared/hooks/useUserGamification
  +-- usePendingExercises() -> ../hooks/useContentManagement
  +-- adminAPI.content.getMediaLibrary() -> @/services/api/adminAPI (manual fetch)
  +-- adminAPI.content.getApprovalHistory() -> @/services/api/adminAPI (manual fetch)
  +-- getExercise() -> @/services/api/educationalAPI (manual fetch)
  +-- AdminLayout -> ../layouts/AdminLayout
  +-- DataTable + Column -> @shared/components/common
  +-- Modal -> @shared/components/common/Modal
  +-- FormField -> @shared/components/common/FormField
  +-- ExerciseContentRenderer -> @shared/components/mechanics/ExerciseContentRenderer
  +-- DetectiveButton -> @shared/components/base/DetectiveButton
  +-- PendingExercise type -> ../types
  +-- MediaFile, ApprovalHistory types -> @/services/api/adminTypes
```

---

## 2. AdminExerciseCreatePage.tsx (536 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminExerciseCreatePage.tsx`

### Violaciones

1. **[CRITICA]** Lineas 150-172: `handleSaveDraft` y `handleSubmitForReview` son stubs con `setTimeout(800)` -- no real API call. El ejercicio nunca se persiste al backend. Funcionalidad rota.

2. **[ALTA]** Lineas 20-36: 17 individual type-config imports. Deberia usar un registry pattern (ya hay `TYPE_CONFIG_MAP` en lineas 77-95 que lo resuelve parcialmente, pero los imports siguen siendo 17 lineas). Un barrel export o lazy loading reduciria esto.

3. **[ALTA]** Lineas 339-535: `StepBasicInfo` componente de 197 lineas definido inline en el mismo archivo. Deberia ser un componente separado.

4. **[ALTA]** Lineas 519-531: Campo "Pistas Permitidas" duplicado -- aparece en lineas 432-445 (Step Basic Info) Y en lineas 519-530 (Rewards section). El usuario puede editarlo en dos lugares con valores potencialmente inconsistentes.

5. **[MEDIA]** Lineas 536: Archivo total 536 lineas, excede significativamente el limite de 150.

6. **[MEDIA]** Linea 38: `ExerciseFormData` interface exportada desde un page component. Deberia estar en un archivo de tipos dedicado (`../types/exercise-builder.types.ts`). Se importa desde `ExercisePreview.tsx`.

7. **[MEDIA]** Lineas 55-68: `MODULE_OPTIONS` y `DIFFICULTY_OPTIONS` hardcodeadas. Deberian venir de la API o de un archivo de constantes compartido.

8. **[MEDIA]** Linea 114: No tiene boilerplate de `useAuth`/`AdminLayout`/gamification -- es el unico page sin wrapper de layout. Esto sugiere que se renderiza como child route dentro de otra page con layout.

9. **[BAJA]** Lineas 77-95: `TYPE_CONFIG_MAP` usa `Record<string, unknown>` en la type signature, lo cual pierde la tipificacion especifica de cada config component.

10. **[BAJA]** Lineas 97-112: `initialFormData` constante deberia estar en el archivo de tipos.

### Boilerplate Duplicado

- NO tiene el boilerplate de useAuth + gamification + AdminLayout -- es la EXCEPCION en el grupo
- Pero comparte patterns de form field rendering con otros builders

### Mapa de Dependencias

```
AdminExerciseCreatePage.tsx
  +-- ExerciseTypeSelector -> ../components/exercise-builder/ExerciseTypeSelector
  +-- ExercisePreview -> ../components/exercise-builder/ExercisePreview
  +-- 17x TypeConfig components -> ../components/exercise-builder/type-configs/*
  +-- DetectiveCard, DetectiveButton -> @shared/components/base
  +-- cn -> @shared/utils/cn
  +-- motion, AnimatePresence -> framer-motion
  +-- toast -> react-hot-toast
  +-- StepBasicInfo (inline) -> same file
```

---

## 3. AdminGamificationPage.tsx (650 lineas)

**Ruta:** `apps/frontend/src/apps/admin/pages/AdminGamificationPage.tsx`

### Violaciones

1. **[CRITICA]** Lineas 79-131: 53 lineas de defensive data transformation para `validatedRanks` con snake_case-to-camelCase mapping, null checks, and `as unknown as Record<string, unknown>` casts. Esta logica de normalizacion deberia estar en el API layer o en el hook, no en el page component.

2. **[CRITICA]** Lineas 134-163: 30 lineas adicionales de defensive `safeParameters` validation. Misma situacion -- deberia estar en `useGamificationConfig` hook, no en el page.

3. **[ALTA]** Lineas 46-52: 7 useState declarations for modal state management (~30 lineas con los modals al final). Un objeto de estado unico o un custom hook `useModalState` reduciria esto.

4. **[ALTA]** Linea 650: Componente monolitico de 650 lineas. Maneja 4 tabs (ranks, achievements, economy, stats), 5 modales, defensive transformations, loading/error states.

5. **[ALTA]** Lineas 240-285: Tab switcher reimplementado inline (46 lineas). Mismo patron que ContentPage pero con 4 tabs en lugar de 3, y estilos ligeramente distintos.

6. **[ALTA]** Lineas 288-378: Ranks tab rendering inline (~91 lineas). Deberia ser un componente `RanksTab` separado, similar a `AchievementsTab`.

7. **[MEDIA]** Lineas 384-493: Economy tab rendering inline (~110 lineas). Deberia ser un componente `EconomyTab` separado.

8. **[MEDIA]** Lineas 497-573: Stats tab rendering inline (~77 lineas). Deberia ser un componente `StatsTab` separado.

9. **[MEDIA]** Lineas 165-168: `handleLogout` boilerplate duplicado.

10. **[MEDIA]** Lineas 576-647: Modal wiring inline (~72 lineas de modal props piping). Podria simplificarse con un modal manager pattern.

11. **[BAJA]** Lineas 96, 104, 317-318: Redundant null checks -- `validatedRanks` already filters nulls via `.filter()` but then checks again in render.

12. **[BAJA]** Lineas 82-83, 137-138: `console.warn` defensive logging en produccion. Deberia usar un logger configurable.

### Boilerplate Duplicado

- `useAuth()` + `useUserGamification()` + `handleLogout`: Lineas 40, 55, 165-168 (~15 lineas)
- `AdminLayout` wrapper con props identicos: Lineas 173-178, 193-198, 216-221 (aparece 3 veces! loading state, error state, main render)
- Tab switcher inline: Lineas 240-285 (~46 lineas, patron compartido con ContentPage)

### Mapa de Dependencias

```
AdminGamificationPage.tsx
  +-- useAuth() -> @features/auth/hooks/useAuth
  +-- useUserGamification() -> @shared/hooks/useUserGamification
  +-- useGamificationConfig() -> ../hooks/useGamificationConfig
      +-- useParameters() -> React Query
      +-- useMayaRanks() -> React Query
      +-- useStats() -> React Query
      +-- updateParameter -> mutation
      +-- resetParameter -> mutation
      +-- updateMayaRank -> mutation
      +-- bulkUpdateParameters -> mutation
      +-- restoreDefaults -> mutation
  +-- AdminLayout -> ../layouts/AdminLayout
  +-- ParameterEditModal -> ../components/gamification
  +-- MayaRankEditModal -> ../components/gamification
  +-- BulkUpdateDialog -> ../components/gamification
  +-- PreviewImpactDialog -> ../components/gamification
  +-- RestoreDefaultsDialog -> ../components/gamification
  +-- AchievementsTab -> ../components/gamification
  +-- DetectiveCard, DetectiveButton -> @shared/components/base
  +-- MayaRankConfig, Parameter types -> @/services/api/schemas/adminSchemas
```

---

## 4. useContentManagement.ts (626 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useContentManagement.ts`

### Violaciones

1. **[CRITICA]** Linea 17: `/* eslint-disable @typescript-eslint/no-explicit-any */` file-level disable. Hay 6 uses of `any` (lineas 38, 54, 247, 398, 405, 510) que deberian tener tipos propios.

2. **[ALTA]** Lineas 492-566: `useApprovals()` hook marcado como `@deprecated` con console.warn pero NO eliminado. 75 lineas de codigo muerto. Es consumido SOLO por `ContentApprovalQueue.tsx` -- ambos deberian migrar o eliminarse.

3. **[ALTA]** Lineas 572-625: `useExercises()` legacy hook sin deprecation notice pero sin React Query. 54 lineas de codigo manual fetch + state. Consumido SOLO por `ExerciseContentEditor.tsx`.

4. **[ALTA]** Linea 626: Archivo de 626 lineas que contiene 5 hooks independientes: `usePendingExercises`, `useMediaLibrary`, `useContentVersions`, `useApprovals` (deprecated), `useExercises` (legacy). Viola SRP masivamente.

5. **[ALTA]** Lineas 136-226, 232-383, 389-453: Los 3 hooks activos (pending, media, versions) todos usan patron manual `useState + useEffect + useCallback` en lugar de React Query. La pagina ContentPage ya consume `usePendingExercises` -- pero este hook NO usa React Query a diferencia de `useGamificationConfig`.

6. **[MEDIA]** Lineas 30-43: Local `Exercise` type definition (14 lineas) con `content: any`. Duplica parcialmente el tipo global `Exercise` de `@shared/types/educational.types`.

7. **[MEDIA]** Lineas 54-89: `normalizeResponse<T>` utility function para normalizar respuestas backend -- deberia estar en un shared utility, no en un hooks file.

8. **[MEDIA]** Lineas 247-252: `useMediaLibrary` usa `apiClient.get<any>` raw en lugar de la API layer (`adminAPI`).

9. **[BAJA]** Lineas 210-211, 363-364, 554-556: `// eslint-disable-next-line react-hooks/exhaustive-deps` appears 3 times -- indicates incorrect dependency arrays in useEffect.

10. **[BAJA]** Linea 378: `deleteFile: deleteMedia` alias -- unnecessary backward compatibility wrapper.

### Boilerplate Duplicado

- El patron `useState(loading) + useState(error) + useCallback(async fetch => try/catch/finally)` se repite 7 veces a lo largo del archivo (una por cada operacion CRUD en cada hook).

### Mapa de Dependencias

```
useContentManagement.ts
  +-- apiClient -> @/services/api/apiClient (raw axios)
  +-- API_ENDPOINTS -> @/config/api.config
  +-- adminAPI -> @/services/api/adminAPI (wrapped)
  +-- PendingContent type -> @/services/api/adminTypes
  +-- MediaItem, ContentVersion types -> ../types

Consumers:
  +-- AdminContentPage.tsx (usePendingExercises)
  +-- ContentApprovalQueue.tsx (useApprovals -- deprecated!)
  +-- ExerciseContentEditor.tsx (useExercises -- legacy!)
  +-- MediaLibraryManager.tsx (useMediaLibrary)
```

---

## 5. useGamificationConfig.ts (277 lineas)

**Ruta:** `apps/frontend/src/apps/admin/hooks/useGamificationConfig.ts`

### Violaciones

1. **[MEDIA]** Linea 7: `/* eslint-disable @typescript-eslint/no-explicit-any */` file-level disable. Hay 5 uses of `any` (lineas 114, 183, 198, 213, 229, 239, 256) -- all in `onError` handlers. Could be typed as `AxiosError`.

2. **[MEDIA]** Lineas 52-81: Defensive validation in `useParameters` queryFn duplicates the same validation that page does in `safeParameters` useMemo (lineas 134-163 of GamificationPage). Validation should be in ONE place.

3. **[MEDIA]** Lineas 101-124: Defensive validation in `useMayaRanks` queryFn duplicates the validation that page does in `validatedRanks` useMemo (lineas 79-131 of GamificationPage). Same duplication issue.

4. **[BAJA]** Linea 277: Well-structured file at 277 lineas using React Query correctly. This is the MODEL hook in this group -- the pattern that `useContentManagement` should follow.

5. **[BAJA]** Lineas 183, 198, 213, 229, 239, 256: `error: any` in mutation onError handlers. Should use typed error.

### Boilerplate Duplicado

- None significant -- this hook is well-structured

### Mapa de Dependencias

```
useGamificationConfig.ts
  +-- React Query (useQuery, useMutation, useQueryClient)
  +-- gamificationConfigApi -> @/services/api/admin/gamificationConfigApi
  +-- types -> @/types/admin/gamification.types
  +-- toast -> react-hot-toast

Consumers:
  +-- AdminGamificationPage.tsx
```

---

## 6. Componentes Gamification (6 archivos)

### 6.1 AchievementsTab.tsx (387 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/AchievementsTab.tsx`

**Violaciones:**
1. **[MEDIA]** 387 lineas excede el limite de 150. Maneja queries, mutations, filtering, y rendering todo en un componente.
2. **[MEDIA]** Lineas 229-255: Category filter buttons inline (27 lineas) -- es otro tab/filter reimplementation.
3. **[BAJA]** Linea 109: `error: any` en mutation onError.
4. **[BAJA]** Linea 386: Double export (`export function` + `export default`).

### 6.2 BulkUpdateDialog.tsx (411 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/BulkUpdateDialog.tsx`

**Violaciones:**
1. **[ALTA]** 411 lineas excede el limite de 150 por 2.7x. Podria extraer: preview section, configuration form, actions bar.
2. **[MEDIA]** Lineas 56-72: Manual Esc key handler + body overflow lock -- patron duplicado en todos los modales (ver 6.3, 6.4, 6.5). Deberia ser un hook `useModalBehavior()`.

### 6.3 MayaRankEditModal.tsx (391 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/MayaRankEditModal.tsx`

**Violaciones:**
1. **[ALTA]** 391 lineas excede el limite de 150 por 2.6x.
2. **[MEDIA]** Lineas 49-65: Duplicated Esc key handler + body overflow lock (same as BulkUpdateDialog).
3. **[BAJA]** Lineas 153-166: `getHierarchyPreview` computed in render -- could use useMemo.

### 6.4 ParameterEditModal.tsx (330 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/ParameterEditModal.tsx`

**Violaciones:**
1. **[ALTA]** 330 lineas excede el limite de 150 por 2.2x.
2. **[MEDIA]** Lineas 47-65: Duplicated Esc key handler + body overflow lock.

### 6.5 PreviewImpactDialog.tsx (325 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/PreviewImpactDialog.tsx`

**Violaciones:**
1. **[ALTA]** 325 lineas excede el limite de 150 por 2.2x.
2. **[MEDIA]** Lineas 33-49: Duplicated Esc key handler + body overflow lock.

### 6.6 RestoreDefaultsDialog.tsx (237 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/gamification/RestoreDefaultsDialog.tsx`

**Violaciones:**
1. **[MEDIA]** 237 lineas excede el limite de 150 por 1.6x.
2. **[MEDIA]** Lineas 42-58: Duplicated Esc key handler + body overflow lock.
3. **[BAJA]** Linea 77: `alert()` for error feedback -- should use toast.

### 6.7 index.ts (14 lineas) -- Limpio, sin violaciones.

---

## 7. Componentes Content (6 archivos)

### 7.1 ContentApprovalQueue.tsx (307 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/content/ContentApprovalQueue.tsx`

**Violaciones:**
1. **[ALTA]** Linea 4: Uses deprecated `useApprovals` hook. Should migrate to `usePendingExercises`.
2. **[MEDIA]** 307 lineas excede limite.
3. **[BAJA]** Lineas 23, 41: Uses `alert()` for user feedback instead of toast.
4. **[BAJA]** UI text in English ("Pending", "Approved", "Approve", "Reject") while rest of admin portal is in Spanish.

### 7.2 ContentVersionControl.tsx (278 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/content/ContentVersionControl.tsx`

**Violaciones:**
1. **[ALTA]** Lineas 18-46: Hardcoded mock data (`useState<Version[]>([...])`) -- no API integration. Component is non-functional.
2. **[MEDIA]** 278 lineas excede limite.
3. **[BAJA]** Lineas 52-62: `handleRestore` uses `console.log` + `alert()` -- stub implementation.
4. **[BAJA]** UI text in English.

### 7.3 ExerciseContentEditor.tsx (367 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/content/ExerciseContentEditor.tsx`

**Violaciones:**
1. **[ALTA]** Linea 4: Uses legacy `useExercises` hook with manual state management.
2. **[MEDIA]** 367 lineas excede limite.
3. **[MEDIA]** Linea 142: `dangerouslySetInnerHTML` for exercise instructions -- XSS vulnerability.
4. **[BAJA]** UI text in English.

### 7.4 ExercisePreviewModal.tsx (231 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/content/ExercisePreviewModal.tsx`

**Violaciones:**
1. **[MEDIA]** 231 lineas excede limite.
2. **[MEDIA]** Linea 173: `dangerouslySetInnerHTML` for exercise instructions -- XSS vulnerability.
3. **[BAJA]** Lineas 39-63: Manual Esc key + body overflow lock (same pattern as gamification modals).

### 7.5 MediaLibraryManager.tsx (299 lineas)

**Ruta:** `apps/frontend/src/apps/admin/components/content/MediaLibraryManager.tsx`

**Violaciones:**
1. **[MEDIA]** 299 lineas excede limite.
2. **[BAJA]** Lineas 30, 41, 47: Uses `alert()` for user feedback.
3. **[BAJA]** UI text in English.

### 7.6 index.ts (6 lineas) -- Limpio.

---

## 8. Componentes Exercise Builder (3 archivos core + 17 type-configs)

### 8.1 ExerciseTypeSelector.tsx (142 lineas) -- Dentro del limite. Bien estructurado.

### 8.2 ExercisePreview.tsx (173 lineas) -- Ligeramente excede limite.

**Violaciones:**
1. **[BAJA]** Linea 4: Imports `ExerciseFormData` from page component (circular dependency direction).

### 8.3 ContentEditor.tsx (119 lineas) -- Dentro del limite. Bien estructurado.

### 8.4 17 Type Config Components

No se analizaron individualmente (fuera del scope directo), pero representan el patron de registry que ya resuelve parcialmente el problema de imports en `AdminExerciseCreatePage.tsx`.

---

## Patrones Anti-Pattern Transversales

### AP-1: useAuth + useUserGamification + displayGamificationData + handleLogout (BOILERPLATE)
- Presente en: AdminContentPage (30 lineas), AdminGamificationPage (15 lineas)
- Ausente en: AdminExerciseCreatePage (no tiene layout wrapper)
- Impacto: 18 admin pages tienen este patron = ~540 lineas de boilerplate total

### AP-2: Tab Switcher Reimplementation
- AdminContentPage: 35 lineas (3 tabs, inline buttons)
- AdminGamificationPage: 46 lineas (4 tabs, inline buttons con overflow-x-auto)
- Estilos ligeramente diferentes entre ambas implementaciones
- No hay componente `AdminTabSwitcher` reutilizable

### AP-3: Modal Esc + Body Overflow Lock (Duplicado 6 veces)
- BulkUpdateDialog, MayaRankEditModal, ParameterEditModal, PreviewImpactDialog, RestoreDefaultsDialog, ExercisePreviewModal
- ~15 lineas identicas cada vez = ~90 lineas de duplicacion
- Solucion: hook `useModalBehavior(isOpen, onClose)`

### AP-4: Manual Fetch Pattern (vs React Query)
- useContentManagement.ts: 5 hooks con useState+useEffect+useCallback manual
- useGamificationConfig.ts: Usa React Query correctamente
- Inconsistencia fundamental entre los dos enfoques en el mismo dominio

### AP-5: Loading/Error State Presentation Inconsistency
- GamificationPage: Early return para loading y error
- ContentPage: Inline conditional rendering per-tab
- Gamification components: DetectiveCard + Loader2
- Content components: raw `div` + CSS spinner
- No hay componente compartido `LoadingState` / `ErrorState`

### AP-6: English vs Spanish UI Text Inconsistency
- Content components (ContentApprovalQueue, ContentVersionControl, ExerciseContentEditor, MediaLibraryManager): English
- Pages and Gamification components: Spanish
- Inconsistencia en la experiencia de usuario
