# Dependencias Cruzadas -- Grupo C: Content + Exercises + Gamification

**Agente:** C
**Fecha:** 2026-02-18
**Version:** 1.0.0

---

## 1. Componentes/Hooks Compartidos con Otros Grupos

### 1.1 Dependencia con Grupo A (Dashboard + Users + Roles)

| Item Compartido | Grupo C Usa | Grupo A Usa | Notas |
|-----------------|:-:|:-:|-------|
| `useAuth()` | AdminContentPage, AdminGamificationPage | Todos los admin pages | Boilerplate identico |
| `useUserGamification()` | AdminContentPage, AdminGamificationPage | Todos los admin pages | Boilerplate identico |
| `AdminLayout` | AdminContentPage, AdminGamificationPage | Todos los admin pages | Wrapper identico |
| `displayGamificationData` fallback | AdminContentPage | AdminDashboardPage, AdminUsersPage, etc. | 12 lineas identicas |
| `handleLogout` pattern | AdminContentPage, AdminGamificationPage | Todos los admin pages | 4 lineas identicas |

**Conflicto potencial:** Si Grupo A crea `AdminPageWrapper` para encapsular el boilerplate, Grupo C necesita usar exactamente el mismo componente. Se propone que sea Grupo A o un agente dedicado quien cree el wrapper compartido, y Grupo C lo consuma.

### 1.2 Dependencia con Grupo B (Settings + Monitoring + Alerts)

| Item Compartido | Grupo C Usa | Grupo B Usa | Notas |
|-----------------|:-:|:-:|-------|
| `AdminLayout` | Si | Si | Mismo wrapper |
| Tab Switcher pattern | AdminContentPage, AdminGamificationPage | AdminSettingsPage, AdminMonitoringPage | Patron duplicado con estilos levemente diferentes |

**Conflicto potencial:** Si Grupo B tambien propone un `AdminTabSwitcher`, debe coordinarse con Grupo C para usar la misma implementacion. La prop interface debe ser generica (`<T extends string>`) para soportar distintos conjuntos de tabs.

### 1.3 Dependencia con Grupo D (Classrooms + Reports)

| Item Compartido | Grupo C Usa | Grupo D Usa | Notas |
|-----------------|:-:|:-:|-------|
| DataTable component | AdminContentPage | AdminReportsPage, etc. | Componente compartido en `@shared/components/common` |
| CSV export pattern | No aplica en Grupo C | AdminReportsPage | No hay conflicto directo |
| `adminAPI` service | AdminContentPage | AdminReportsPage | Mismo API client |

**Sin conflicto:** DataTable es un componente estable compartido.

### 1.4 Dependencia con Grupo E (Analytics + Assignments + Progress)

| Item Compartido | Grupo C Usa | Grupo E Usa | Notas |
|-----------------|:-:|:-:|-------|
| `getExercise()` API | AdminContentPage (preview) | Posible en AdminAssignmentsPage | API educacional compartida |
| Loading spinner pattern | Multiples | Multiples | Patron inconsistente entre grupos |

---

## 2. Patrones Comunes que Necesitan Solucion Cross-Cutting

### 2.1 AdminPageWrapper (PRIORIDAD ALTA)

**Problema:** 18 admin pages tienen el mismo boilerplate de ~30 lineas.

**Propuesta Grupo C:** Crear `apps/admin/components/shared/AdminPageWrapper.tsx`.

**Coordinacion necesaria:**
- Grupo A debe validar que el wrapper funciona con su AdminDashboardPage (que puede tener props adicionales).
- Todos los grupos deben migrar simultaneamente o en fases. Recomiendo: Grupo que lo crea lo aplica a SUS pages, luego otros grupos migran.

**Ruta propuesta:** `apps/frontend/src/apps/admin/components/shared/AdminPageWrapper.tsx`

### 2.2 AdminTabSwitcher (PRIORIDAD ALTA)

**Problema:** Al menos 6 admin pages reimplementan tabs con estilos diferentes.

**Variantes encontradas en Grupo C:**
- ContentPage: 3 tabs, icono + texto + count badge, sin overflow-x
- GamificationPage: 4 tabs, icono + texto, con overflow-x-auto
- AchievementsTab: Category filter (variante de tabs)

**Interface propuesta:**
```typescript
interface AdminTabSwitcherProps<T extends string> {
  tabs: Array<{
    id: T;
    label: string;
    icon?: LucideIcon;
    count?: number;
  }>;
  activeTab: T;
  onTabChange: (tab: T) => void;
  overflow?: boolean; // default true for mobile
}
```

**Coordinacion necesaria:** Grupo B (Settings) y Grupo D (Reports) pueden tener tabs diferentes. El componente debe ser suficientemente flexible.

### 2.3 useModalBehavior Hook (PRIORIDAD MEDIA)

**Problema:** 6 modales en Grupo C + N modales en otros grupos duplican Esc handler + body overflow lock.

**Ruta propuesta:** `apps/frontend/src/shared/hooks/useModalBehavior.ts`

**Coordinacion necesaria:** El componente `Modal` de `@shared/components/common/Modal` PROBABLEMENTE ya maneja esto. Hay que verificar si los modales en `gamification/` no usan `Modal` (no lo usan -- todos implementan su propio overlay div). La solucion ideal es migrar todos a usar el `Modal` compartido, o al menos extraer el hook.

### 2.4 Loading/Error State Components (PRIORIDAD MEDIA)

**Problema:** 4 variantes de loading spinner y 3 variantes de error state en Grupo C.

**Variantes encontradas:**
1. `div.animate-spin` con CSS border trick (ContentPage)
2. `Loader2` lucide icon con `animate-spin` (GamificationPage, AchievementsTab)
3. `div` con border-4 trick (ContentApprovalQueue, ExerciseContentEditor, MediaLibraryManager)

**Propuesta:** `AdminLoadingState` y `AdminErrorState` components en `apps/admin/components/shared/`.

### 2.5 React Query vs Manual Fetch Inconsistency (PRIORIDAD CRITICA)

**Problema:**
- `useGamificationConfig.ts` (277 lineas): Usa React Query correctamente
- `useContentManagement.ts` (626 lineas): Usa useState + useEffect + useCallback manual

**Este es el gap mas critico del grupo.** Todo el admin portal deberia usar React Query consistentemente. La migracion de `useContentManagement` es prerequisito para el refactor de AdminContentPage.

---

## 3. Conflictos Potenciales entre Agentes

### Conflicto C1: AdminPageWrapper -- Quien lo crea?

**Riesgo:** Si multiples agentes crean el mismo componente, habra conflicto de merge.

**Recomendacion:** Asignar a UN solo agente (preferiblemente Grupo A que tiene Dashboard) la creacion de:
- `AdminPageWrapper.tsx`
- `AdminTabSwitcher.tsx`
- `AdminLoadingState.tsx`
- `AdminErrorState.tsx`

Los demas grupos (B, C, D, E) solo CONSUMEN estos componentes.

### Conflicto C2: useModalBehavior -- shared vs admin-local?

**Riesgo:** Si Grupo C crea el hook en `shared/hooks/` y otro grupo crea algo similar, duplicacion.

**Recomendacion:** Verificar primero si el `Modal` compartido ya maneja esto. Si no, crear en `shared/hooks/` como utility global.

### Conflicto C3: Modificacion de useGamificationConfig.ts

**Riesgo:** Grupo C propone mover data transformation (validatedRanks, safeParameters) al hook. Si otro agente modifica el hook simultaneamente, merge conflict.

**Recomendacion:** Este hook es exclusivo de Grupo C. No deberia haber conflicto.

### Conflicto C4: Admin types y API files

**Riesgo:** Grupo C usa tipos de `@/services/api/schemas/adminSchemas` y `@/services/api/adminTypes`. Si Grupo A o B modifica estos archivos, puede haber conflictos.

**Recomendacion:** Solo agregar tipos nuevos, no modificar existentes. Cualquier tipo nuevo para Grupo C debe ir en `apps/admin/types/`.

### Conflicto C5: Exercise types compartidos

**Riesgo:** `ExerciseFormData` exportado desde `AdminExerciseCreatePage.tsx` es importado por `ExercisePreview.tsx`. Al mover el tipo a `types/exercise-builder.types.ts`, hay que actualizar ambos imports atomicamente.

**Recomendacion:** Hacer el move y update en un solo commit.

---

## 4. Archivos Compartidos que NO debe Modificar Grupo C

| Archivo | Razon |
|---------|-------|
| `apps/frontend/src/shared/hooks/useUserGamification.ts` | Compartido globalmente |
| `apps/frontend/src/features/auth/hooks/useAuth.ts` | Compartido globalmente |
| `apps/frontend/src/apps/admin/layouts/AdminLayout.tsx` | Compartido por 18 pages -- Grupo A |
| `apps/frontend/src/shared/components/common/Modal.tsx` | Componente global |
| `apps/frontend/src/shared/components/common/DataTable.tsx` | Componente global |
| `apps/frontend/src/services/api/adminAPI.ts` | Compartido por todos los admin hooks |
| `apps/frontend/src/config/api.config.ts` | Configuracion global |

---

## 5. Mapa de Archivos por Propiedad

### Exclusivo de Grupo C (puede modificar libremente)

```
apps/frontend/src/apps/admin/pages/
  AdminContentPage.tsx
  AdminExerciseCreatePage.tsx
  AdminGamificationPage.tsx

apps/frontend/src/apps/admin/hooks/
  useContentManagement.ts
  useGamificationConfig.ts

apps/frontend/src/apps/admin/components/gamification/
  AchievementsTab.tsx
  BulkUpdateDialog.tsx
  MayaRankEditModal.tsx
  ParameterEditModal.tsx
  PreviewImpactDialog.tsx
  RestoreDefaultsDialog.tsx
  index.ts

apps/frontend/src/apps/admin/components/content/
  ContentApprovalQueue.tsx
  ContentVersionControl.tsx
  ExerciseContentEditor.tsx
  ExercisePreviewModal.tsx
  MediaLibraryManager.tsx
  index.ts

apps/frontend/src/apps/admin/components/exercise-builder/
  ExerciseTypeSelector.tsx
  ExercisePreview.tsx
  ContentEditor.tsx
  type-configs/ (17 archivos)
```

### Compartido (necesita coordinacion)

```
apps/frontend/src/apps/admin/components/shared/  (a crear, coordinar con todos los grupos)
  AdminPageWrapper.tsx
  AdminTabSwitcher.tsx

apps/frontend/src/shared/hooks/  (a crear, coordinar globalmente)
  useModalBehavior.ts
```

---

## 6. Resumen de Coordinacion Requerida

| Accion | Agente Responsable | Agentes Afectados | Prioridad |
|--------|:--:|:--:|:--:|
| Crear AdminPageWrapper | A (o designado) | A, B, C, D, E | ALTA |
| Crear AdminTabSwitcher | A (o designado) | A, B, C | ALTA |
| Crear useModalBehavior | C (o designado) | C, potencialmente B | MEDIA |
| Migrar useContentManagement a React Query | C | Solo C | CRITICA |
| Mover transformations a useGamificationConfig | C | Solo C | ALTA |
| Traducir UI English->Spanish en content components | C | Solo C | BAJA |
| Verificar Modal compartido vs custom overlays | C | Todos | MEDIA |
