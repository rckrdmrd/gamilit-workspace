# Propuesta de Mejoras -- Grupo C: Content + Exercises + Gamification

**Agente:** C
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## Resumen de Impacto

| Archivo | Lineas Actuales | Lineas Objetivo | Reduccion |
|---------|:-:|:-:|:-:|
| AdminContentPage.tsx | 586 | ~120 | -79% |
| AdminExerciseCreatePage.tsx | 536 | ~180 | -66% |
| AdminGamificationPage.tsx | 650 | ~130 | -80% |
| useContentManagement.ts | 626 | ~0 (replaced) | -100% |
| useGamificationConfig.ts | 277 | ~200 | -28% |

**Total nuevo archivos a crear:** 16
**Total archivos a modificar:** 5
**Total archivos a eliminar:** 0 (marcar deprecated, eliminar en sprint posterior)

---

## 1. AdminContentPage.tsx: 586 -> ~120 lineas

### Propuesta

Extraer las 3 tabs como componentes independientes, eliminar manual fetch, y usar el boilerplate wrapper compartido.

### Archivos a Crear

#### 1.1 `hooks/useMediaLibraryQuery.ts` (~40 lineas)
Reemplaza las lineas 37-39, 73-89 del page con React Query.
```typescript
export function useMediaLibraryQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'content', 'media-library'],
    queryFn: () => adminAPI.content.getMediaLibrary(),
    enabled,
    select: (data) => data.items,
  });
}
```

#### 1.2 `hooks/useApprovalHistoryQuery.ts` (~40 lineas)
Reemplaza las lineas 41-44, 92-110 del page con React Query.
```typescript
export function useApprovalHistoryQuery(enabled: boolean) {
  return useQuery({
    queryKey: ['admin', 'content', 'approval-history'],
    queryFn: () => adminAPI.content.getApprovalHistory(),
    enabled,
    select: (data) => data.items,
  });
}
```

#### 1.3 `hooks/useExerciseDetailsQuery.ts` (~35 lineas)
Reemplaza las lineas 32-34, 112-128 con React Query.
```typescript
export function useExerciseDetailsQuery(exerciseId: string | null) {
  return useQuery({
    queryKey: ['exercise', 'details', exerciseId],
    queryFn: () => getExercise(exerciseId!),
    enabled: !!exerciseId,
  });
}
```

#### 1.4 `components/content/PendingExercisesTab.tsx` (~100 lineas)
Extrae lineas 162-234 (column defs) + 366-392 (pending tab render).

#### 1.5 `components/content/MediaLibraryTab.tsx` (~60 lineas)
Extrae lineas 237-269 (column defs) + 394-420 (media tab render). Usa `useMediaLibraryQuery`.

#### 1.6 `components/content/ApprovalHistoryTab.tsx` (~60 lineas)
Extrae lineas 271-310 (column defs) + 422-448 (versions tab render). Usa `useApprovalHistoryQuery`.

#### 1.7 `components/content/ExercisePreviewApprovalModal.tsx` (~100 lineas)
Extrae lineas 451-539 (preview modal). Usa `useExerciseDetailsQuery`.

#### 1.8 `components/content/ExerciseRejectModal.tsx` (~50 lineas)
Extrae lineas 541-583 (reject modal).

### Estructura JSX Simplificada

```tsx
export default function AdminContentPage() {
  const [activeTab, setActiveTab] = useState<'pending' | 'media' | 'versions'>('pending');
  const [selectedExercise, setSelectedExercise] = useState<PendingExercise | null>(null);
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);

  return (
    <AdminPageWrapper title="Gestion de Contenido" subtitle="...">
      <AdminTabSwitcher
        tabs={CONTENT_TABS}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      {activeTab === 'pending' && <PendingExercisesTab onPreview={setSelectedExercise} />}
      {activeTab === 'media' && <MediaLibraryTab />}
      {activeTab === 'versions' && <ApprovalHistoryTab />}

      <ExercisePreviewApprovalModal
        exercise={selectedExercise}
        onClose={() => setSelectedExercise(null)}
        onReject={() => setIsRejectModalOpen(true)}
      />
      <ExerciseRejectModal
        isOpen={isRejectModalOpen}
        exercise={selectedExercise}
        onClose={() => setIsRejectModalOpen(false)}
      />
    </AdminPageWrapper>
  );
}
```

---

## 2. AdminExerciseCreatePage.tsx: 536 -> ~180 lineas

### Propuesta

Extraer `StepBasicInfo` a su propio archivo, mover types y constants, implement real API save.

### Archivos a Crear

#### 2.1 `types/exercise-builder.types.ts` (~30 lineas)
Mueve `ExerciseFormData` interface (lineas 38-53) y `initialFormData` (lineas 97-112).

#### 2.2 `components/exercise-builder/StepBasicInfo.tsx` (~200 lineas)
Extrae lineas 334-535 (actualmente inline). Componente bien separado.

#### 2.3 `components/exercise-builder/StepGamificationRewards.tsx` (~50 lineas)
Extrae la seccion de Rewards (lineas 492-532 del StepBasicInfo) que contiene el campo duplicado "Pistas Permitidas". Eliminaria la duplicacion.

#### 2.4 `components/exercise-builder/type-configs/index.ts` (~30 lineas) [barrel export]
```typescript
// Barrel export to replace 17 individual imports
export const TYPE_CONFIG_MAP: Record<string, React.LazyExoticComponent<...>> = {
  completar_espacios: lazy(() => import('./CompletarEspaciosConfig')),
  // ... etc
};
```
Esto convierte las 17 lineas de import en 1 import.

### Archivos a Modificar

- `AdminExerciseCreatePage.tsx`: Importar desde barrel, extraer StepBasicInfo, implementar API save real.

### Estructura JSX Simplificada

```tsx
export default function AdminExerciseCreatePage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ExerciseFormData>(initialFormData);
  const createExercise = useCreateExerciseMutation();

  return (
    <div className="space-y-6">
      <PageHeader title="Crear Ejercicio" subtitle="..." />
      <StepIndicator steps={STEPS} current={currentStep} onSelect={setCurrentStep} />
      <AnimatePresence mode="wait">
        <StepContent step={currentStep} formData={formData} onChange={setFormData} />
      </AnimatePresence>
      <StepNavigation
        current={currentStep}
        canAdvance={canAdvance()}
        onNext={handleNext}
        onBack={handleBack}
        onSaveDraft={createExercise.saveDraft}
        onSubmit={createExercise.submitForReview}
      />
    </div>
  );
}
```

---

## 3. AdminGamificationPage.tsx: 650 -> ~130 lineas

### Propuesta

Extraer 3 tabs (ranks, economy, stats) como componentes separados. Mover data transformation al hook. Usar shared AdminPageWrapper.

### Archivos a Crear

#### 3.1 `components/gamification/RanksTab.tsx` (~100 lineas)
Extrae lineas 288-378. Recibe `validatedRanks` y callbacks como props.

#### 3.2 `components/gamification/EconomyTab.tsx` (~120 lineas)
Extrae lineas 384-493. Recibe `safeParameters`, `stats`, y modal open callbacks como props.

#### 3.3 `components/gamification/StatsTab.tsx` (~80 lineas)
Extrae lineas 497-573. Recibe `stats` y `safeParameters` como props.

### Archivos a Modificar

#### 3.4 `hooks/useGamificationConfig.ts`: Absorber data transformation
Mover `validatedRanks` transformation (53 lineas) y `safeParameters` validation (30 lineas) DENTRO de los queryFn o como `select` transforms. Eliminar la duplicacion entre hook validation y page validation.

```typescript
// Inside useMayaRanks:
const useMayaRanks = () => useQuery({
  queryKey: QUERY_KEYS.mayaRanks(),
  queryFn: () => gamificationConfigApi.listMayaRanks(),
  select: (data) => normalizeRanks(data), // <-- transformation here
});
```

Esto elimina ~83 lineas del page y ~20 lineas del hook (por deduplicacion).

### Estructura JSX Simplificada

```tsx
export default function AdminGamificationPage() {
  const [activeTab, setActiveTab] = useState('ranks');
  const config = useGamificationConfig();
  const modalState = useModalManager(['parameter', 'rank', 'bulk', 'preview', 'restore']);

  return (
    <AdminPageWrapper title="Gamificacion" subtitle="..." icon={Trophy}>
      <AdminTabSwitcher tabs={GAMIFICATION_TABS} active={activeTab} onChange={setActiveTab} />

      {activeTab === 'ranks' && <RanksTab onEditRank={modalState.open('rank')} />}
      {activeTab === 'achievements' && <AchievementsTab />}
      {activeTab === 'economy' && <EconomyTab onEditParam={modalState.open('parameter')} />}
      {activeTab === 'stats' && <StatsTab />}

      <ParameterEditModal {...modalState.props('parameter')} />
      <MayaRankEditModal {...modalState.props('rank')} />
      <BulkUpdateDialog {...modalState.props('bulk')} />
      <PreviewImpactDialog {...modalState.props('preview')} />
      <RestoreDefaultsDialog {...modalState.props('restore')} />
    </AdminPageWrapper>
  );
}
```

---

## 4. useContentManagement.ts: 626 -> 0 (reemplazar)

### Propuesta

Dividir en 3 hooks independientes con React Query, eliminar los 2 deprecated/legacy.

### Archivos a Crear

#### 4.1 `hooks/usePendingExercisesQuery.ts` (~60 lineas)
Reemplaza `usePendingExercises` (lineas 136-226) con React Query:
```typescript
export function usePendingExercisesQuery() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin', 'content', 'pending'],
    queryFn: () => adminAPI.getPendingContent({ page: 1, limit: 20 }),
    select: (data) => data.items,
  });

  const approveMutation = useMutation({...});
  const rejectMutation = useMutation({...});

  return { ...query, approve: approveMutation, reject: rejectMutation };
}
```

#### 4.2 `hooks/useMediaLibraryQuery.ts` (~80 lineas)
Reemplaza `useMediaLibrary` (lineas 232-383) con React Query. Incluye upload y delete mutations.

#### 4.3 `hooks/useContentVersionsQuery.ts` (~50 lineas)
Reemplaza `useContentVersions` (lineas 389-453) con React Query.

### Archivos a Eliminar (sprint posterior)

- `useContentManagement.ts`: Marcar TODO el archivo como `@deprecated` apuntando a los 3 nuevos hooks. Eliminar en sprint siguiente despues de migrar consumidores.
- `ContentApprovalQueue.tsx`: Migrar a usar `usePendingExercisesQuery`. Actualmente usa `useApprovals` deprecated.
- `ExerciseContentEditor.tsx`: Migrar a usar un hook con React Query.

---

## 5. Componentes Compartidos a Crear (Cross-Cutting)

### 5.1 `shared/hooks/useModalBehavior.ts` (~25 lineas)
Elimina las ~90 lineas de duplicacion de Esc handler + body overflow en 6 modales.
```typescript
export function useModalBehavior(isOpen: boolean, onClose: () => void) {
  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);
}
```

### 5.2 `apps/admin/components/shared/AdminTabSwitcher.tsx` (~40 lineas)
Componente reutilizable para tabs en admin pages. Elimina ~80 lineas entre Content y Gamification pages.
```typescript
interface AdminTabSwitcherProps<T extends string> {
  tabs: Array<{ id: T; label: string; icon?: LucideIcon; count?: number }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
}
```

### 5.3 `apps/admin/components/shared/AdminPageWrapper.tsx` (~30 lineas)
Wrapper que encapsula useAuth + useUserGamification + AdminLayout + handleLogout.
```typescript
export function AdminPageWrapper({ title, subtitle, icon, children }) {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);
  const handleLogout = () => { logout(); window.location.href = '/login'; };
  return (
    <AdminLayout user={user} gamificationData={gamificationData} onLogout={handleLogout}>
      <PageHeader title={title} subtitle={subtitle} icon={icon} />
      {children}
    </AdminLayout>
  );
}
```
Esto elimina ~30 lineas de boilerplate por cada una de las 18 admin pages = ~540 lineas ahorradas en total.

### 5.4 `apps/admin/hooks/useModalManager.ts` (~40 lineas)
Gestiona multiples modales con un solo estado:
```typescript
export function useModalManager<T extends string>(modalNames: T[]) {
  const [openModal, setOpenModal] = useState<T | null>(null);
  const [selectedItem, setSelectedItem] = useState<unknown>(null);
  return {
    open: (name: T, item?: unknown) => { setOpenModal(name); setSelectedItem(item); },
    close: () => { setOpenModal(null); setSelectedItem(null); },
    isOpen: (name: T) => openModal === name,
    selectedItem,
  };
}
```

---

## Resumen de Nuevos Archivos

| # | Archivo | Lineas Est. | Descripcion |
|---|---------|:-:|-------------|
| 1 | hooks/useMediaLibraryQuery.ts | 40 | React Query para media |
| 2 | hooks/useApprovalHistoryQuery.ts | 40 | React Query para approval history |
| 3 | hooks/useExerciseDetailsQuery.ts | 35 | React Query para exercise details |
| 4 | hooks/usePendingExercisesQuery.ts | 60 | React Query para pending exercises |
| 5 | hooks/useContentVersionsQuery.ts | 50 | React Query para content versions |
| 6 | components/content/PendingExercisesTab.tsx | 100 | Tab de ejercicios pendientes |
| 7 | components/content/MediaLibraryTab.tsx | 60 | Tab de multimedia |
| 8 | components/content/ApprovalHistoryTab.tsx | 60 | Tab de historial |
| 9 | components/content/ExercisePreviewApprovalModal.tsx | 100 | Modal de preview |
| 10 | components/content/ExerciseRejectModal.tsx | 50 | Modal de rechazo |
| 11 | components/gamification/RanksTab.tsx | 100 | Tab de rangos maya |
| 12 | components/gamification/EconomyTab.tsx | 120 | Tab de economia |
| 13 | components/gamification/StatsTab.tsx | 80 | Tab de estadisticas |
| 14 | types/exercise-builder.types.ts | 30 | Tipos del builder |
| 15 | components/shared/AdminTabSwitcher.tsx | 40 | Tab switcher reutilizable |
| 16 | components/shared/AdminPageWrapper.tsx | 30 | Wrapper de layout admin |

**Total lineas nuevas:** ~995
**Total lineas eliminadas del refactor:** ~1,872 - 630 (lo que queda) = ~1,242
**Balance neto:** -247 lineas, con mucho mejor organizacion y reusabilidad

---

## Orden de Implementacion Recomendado

1. **Fase 1 - Infraestructura compartida** (no rompe nada):
   - `useModalBehavior`, `AdminTabSwitcher`, `AdminPageWrapper`, `useModalManager`

2. **Fase 2 - Hooks React Query** (reemplazo gradual):
   - `usePendingExercisesQuery`, `useMediaLibraryQuery`, `useApprovalHistoryQuery`, `useExerciseDetailsQuery`, `useContentVersionsQuery`

3. **Fase 3 - Extraccion de componentes** (depende de Fase 1-2):
   - Tab components (RanksTab, EconomyTab, StatsTab, PendingExercisesTab, MediaLibraryTab, ApprovalHistoryTab)
   - Modal extractions (ExercisePreviewApprovalModal, ExerciseRejectModal)

4. **Fase 4 - Page simplification** (depende de Fase 3):
   - AdminContentPage refactor
   - AdminGamificationPage refactor
   - AdminExerciseCreatePage refactor

5. **Fase 5 - Cleanup**:
   - Delete deprecated `useApprovals`, `useExercises` from useContentManagement.ts
   - Migrate ContentApprovalQueue, ExerciseContentEditor to new hooks
   - Translate English UI text to Spanish in content components
