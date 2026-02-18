# Propuesta de Mejoras -- Grupo B: Users + Roles + Institutions + ClassroomTeacher

**Agente:** B
**Fecha:** 2026-02-18

---

## Resumen de Impacto

| Metrica | Antes | Despues | Reduccion |
|---------|-------|---------|-----------|
| Lineas en paginas | 1,922 | ~720 | ~63% |
| Lineas en hooks | 1,908 | ~950 | ~50% |
| Lineas en componentes | 4,000+ | ~3,200 | ~20% |
| Archivos nuevos | 0 | ~12 | -- |
| eslint-disable any | 5 | 0 | 100% |
| Modales inline | 8 | 0 | 100% |

---

## Fase 0: Cross-Cutting Infrastructure (Prioridad Maxima)

### 0.1 Hook `useAdminPageSetup` (NUEVO)

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useAdminPageSetup.ts`

Encapsula el boilerplate que se repite en las 4 paginas:

```typescript
export function useAdminPageSetup() {
  const { user, logout } = useAuth();
  const { gamificationData } = useUserGamification(user?.id);

  const displayGamificationData = gamificationData || {
    userId: user?.id || '',
    level: 1,
    totalXP: 0,
    mlCoins: 0,
    rank: 'Novato',
    achievements: [],
  };

  const handleLogout = useCallback(() => {
    logout();
    window.location.href = '/login';
  }, [logout]);

  return {
    user,
    displayGamificationData,
    handleLogout,
  };
}
```

**Lineas ahorradas:** ~80 (20 por pagina x 4 paginas)

### 0.2 Shared Utilities (NUEVO)

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/exportCSV.ts`

```typescript
export function exportToCSV(filename: string, headers: string[], rows: string[][]) {
  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
```

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/validators.ts`

```typescript
export function isValidUUID(uuid: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(uuid);
}
```

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/institutionMappers.ts`

```typescript
export function mapOrganizationFromBackend(apiOrg: Record<string, unknown>): Organization {
  return {
    ...apiOrg,
    features: Array.isArray(apiOrg.features) ? apiOrg.features : [],
    plan: (apiOrg.tier || apiOrg.plan || 'free') as Organization['plan'],
    userCount: (apiOrg.users ?? apiOrg.userCount ?? 0) as number,
    status: (apiOrg.status || (apiOrg.is_active !== false ? 'active' : 'inactive')) as Organization['status'],
    createdAt: (apiOrg.created_at || apiOrg.createdAt || new Date().toISOString()) as string,
  } as Organization;
}
```

**Archivo nuevo:** `apps/frontend/src/apps/admin/utils/institutionConstants.ts`

```typescript
export const planColors: Record<string, string> = { ... };
export const statusColors: Record<string, string> = { ... };
export const statusLabels: Record<string, string> = { ... };
export const availableFeatures = [ ... ];
```

---

## Fase 1: AdminUsersPage.tsx (892 -> ~150 lineas)

### 1.1 Extraer `UsersStatsBar` (NUEVO)

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/users/UsersStatsBar.tsx`
**Lineas:** ~50
**Descripcion:** Componente que recibe `stats: UserStats` y renderiza las 6 DetectiveCards.

### 1.2 Extraer `UsersFilterBar` (NUEVO)

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/users/UsersFilterBar.tsx`
**Lineas:** ~80
**Descripcion:** Combina search input, role filter, status filter, refresh button, create button y UserAdvancedFilters.

### 1.3 Extraer `UsersTable` (NUEVO)

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/users/UsersTable.tsx`
**Lineas:** ~150
**Descripcion:** Tabla completa con checkbox selection, columnas, pagination. Recibe users, selectedUsers, handlers.

### 1.4 Extraer badge utilities a shared

**Archivo a modificar:** `apps/frontend/src/apps/admin/components/users/UserBadges.tsx` (NUEVO, ~40 lineas)
**Descripcion:** Componentes `RoleBadge` y `StatusBadge` reutilizables.

### 1.5 Simplificar handlers con wrapper

Los 3 handlers de confirmacion se reducen a:

```typescript
const showConfirmAction = (title: string, message: string, onConfirm: () => Promise<void>, variant: 'danger' | 'warning' | 'info') => {
  setConfirmDialog({ isOpen: true, title, message, onConfirm: async () => {
    try { await onConfirm(); } catch { /* toast error */ } finally { setConfirmDialog(prev => ({...prev, isOpen: false})); }
  }, variant });
};
```

### 1.6 Resultado AdminUsersPage simplificado

```tsx
export default function AdminUsersPage() {
  const { user, displayGamificationData, handleLogout } = useAdminPageSetup();
  const { toasts, showToast } = useToast();
  const userManagement = useUserManagement();
  // ... minimal local state for modals ...

  return (
    <AdminLayout user={user} gamificationData={displayGamificationData} onLogout={handleLogout}>
      <UsersPageHeader />
      <UsersStatsBar stats={stats} />
      <UsersFilterBar filters={...} onFiltersChange={...} />
      <UsersTable users={...} selectedUsers={...} onEdit={...} />
      <UserDetailModal ... />
      <CreateUserModal ... />
      <BulkActionsPanel ... />
      <ConfirmDialog ... />
      <ToastContainer toasts={toasts} />
    </AdminLayout>
  );
}
```

---

## Fase 2: AdminRolesPage.tsx (302 -> ~120 lineas)

### 2.1 Unificar tema a detective components

**Archivos a modificar:** `AdminRolesPage.tsx`
**Cambio:** Reemplazar `Card` con `DetectiveCard`, `Button` con `DetectiveButton`.

### 2.2 Usar `useAdminPageSetup`

Elimina 45 lineas de boilerplate auth/gamification.

### 2.3 Resultado

```tsx
export default function AdminRolesPage() {
  const { user, displayGamificationData, handleLogout } = useAdminPageSetup();
  const { roles, loading, error, refetch } = useRoles();
  const { rolePermissions, ... } = useRolePermissions();
  // ... minimal state ...

  return (
    <AdminLayout ...>
      <RolesPageHeader onRefresh={refetch} />
      <RolesContent roles={roles} selectedRoleId={...} ... />
      <RoleEditor ... />
    </AdminLayout>
  );
}
```

---

## Fase 3: AdminInstitutionsPage.tsx (574 -> ~120 lineas)

### 3.1 Extraer modales a componentes

**Archivo nuevo:** `apps/frontend/src/apps/admin/components/institutions/CreateInstitutionModal.tsx` (~70 lineas)
**Archivo nuevo:** `apps/frontend/src/apps/admin/components/institutions/EditInstitutionModal.tsx` (~60 lineas)
**Archivo nuevo:** `apps/frontend/src/apps/admin/components/institutions/FeatureFlagsModal.tsx` (~60 lineas)

### 3.2 Eliminar eslint-disable

Tipar correctamente el plan select con union type:
```typescript
onChange={(value: string) => setFormData({ ...formData, plan: value as Organization['plan'] })}
```

### 3.3 Mover stats loading a hook o React Query

```typescript
const { data: stats, isLoading: statsLoading } = useQuery({
  queryKey: ['org-stats', selectedOrg?.id],
  queryFn: () => getOrganizationStats(selectedOrg!.id),
  enabled: !!selectedOrg && isDetailModalOpen,
});
```

### 3.4 Resultado

```tsx
export default function AdminInstitutionsPage() {
  const { user, displayGamificationData, handleLogout } = useAdminPageSetup();
  const orgs = useOrganizations();
  // ... minimal modal state ...

  return (
    <AdminLayout ...>
      <InstitutionsPageHeader />
      <InstitutionFilters ... />
      <InstitutionsTable ... />
      <InstitutionDetailModal ... />
      <CreateInstitutionModal ... />
      <EditInstitutionModal ... />
      <FeatureFlagsModal ... />
      <ConfirmDialog ... />
    </AdminLayout>
  );
}
```

---

## Fase 4: AdminClassroomTeacherPage.tsx (154 -> ~100 lineas)

### 4.1 Usar `useAdminPageSetup`

Elimina ~18 lineas de boilerplate.

### 4.2 Resultado

Pagina ya esta bien modularizada. Solo necesita el hook de setup.

---

## Fase 5: Migracion de Hooks a React Query

### 5.1 useUserManagement.ts (565 -> ~200 lineas, split en 3)

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useUsersQuery.ts` (~80 lineas)
- `useUsersQuery(filters, pagination)` -> useQuery
- `useCreateUser()` -> useMutation
- `useUpdateUser()` -> useMutation
- `useSuspendUser()` -> useMutation
- `useDeleteUser()` -> useMutation

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useUserSelection.ts` (~40 lineas)
- `useUserSelection(users)` -> local state for selection

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useBulkUserActions.ts` (~80 lineas)
- `useBulkSuspend()` -> useMutation
- `useBulkDelete()` -> useMutation
- `useBulkUpdateRole()` -> useMutation

El `useUserManagement.ts` original se convierte en re-export barrel.

### 5.2 useOrganizations.ts (563 -> ~200 lineas, split en 2)

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useOrganizationsQuery.ts` (~120 lineas)
- `useOrganizationsQuery(page, pageSize)` -> useQuery
- `useCreateOrganization()` -> useMutation
- `useUpdateOrganization()` -> useMutation
- `useDeleteOrganization()` -> useMutation

**Archivo nuevo:** `apps/frontend/src/apps/admin/hooks/useOrganizationFeatures.ts` (~60 lineas)
- `useUpdateFeatureFlags()` -> useMutation
- `useToggleFeature()` -> useMutation

Mapper logic moves to `utils/institutionMappers.ts`.

### 5.3 useRoles.ts (237 -> ~100 lineas)

Convertir a React Query:

```typescript
export function useRoles() {
  const { data: roles = [], isLoading, error, refetch } = useQuery({
    queryKey: ['admin-roles'],
    queryFn: async () => {
      const data = await adminAPI.getRoles();
      return data.map(transformRole);
    },
  });
  // ...
}
```

### 5.4 useRolePermissions.ts (382 -> ~150 lineas)

Convertir a React Query, mover transformers a `utils/rolePermissionTransformers.ts` (~80 lineas).

---

## Fase 6: Componentes Sobre-Dimensionados

### 6.1 UserDetailModal.tsx (712 -> ~120 lineas, split en 4)

**Archivo nuevo:** `components/users/UserDetailProfileTab.tsx` (~180 lineas)
**Archivo nuevo:** `components/users/UserDetailActivityTab.tsx` (~60 lineas)
**Archivo nuevo:** `components/users/UserDetailPermissionsTab.tsx` (~100 lineas)

`UserDetailModal.tsx` se reduce a orquestador de tabs.

### 6.2 BulkActionsPanel.tsx (479 -> ~200 lineas)

Extraer `ConfirmationModal` inline a usar el `ConfirmDialog` de shared.

### 6.3 ClassroomTeachersTab.tsx (402 -> ~180 lineas)

**Archivo nuevo:** `components/classroom-teacher/AssignTeacherModal.tsx` (~70 lineas)
**Archivo nuevo:** `components/classroom-teacher/RemoveConfirmModal.tsx` (~50 lineas, shared entre ambos tabs)

### 6.4 TeacherClassroomsTab.tsx (416 -> ~180 lineas)

**Archivo nuevo:** `components/classroom-teacher/AssignClassroomsModal.tsx` (~80 lineas)
Reutiliza `RemoveConfirmModal.tsx`.

---

## Fase 7: Eliminar console.log en Produccion

| Archivo | Lineas | Accion |
|---------|--------|--------|
| useRoles.ts | 146 | Eliminar o usar logger condicional |
| useRolePermissions.ts | 242-246, 294-298, 341 | Eliminar o usar logger condicional |

---

## Resumen de Archivos Nuevos

| # | Archivo | Lineas Est. | Proposito |
|---|---------|-------------|-----------|
| 1 | hooks/useAdminPageSetup.ts | 25 | Boilerplate auth/gamification |
| 2 | utils/exportCSV.ts | 15 | CSV export utility |
| 3 | utils/validators.ts | 10 | UUID validation |
| 4 | utils/institutionMappers.ts | 20 | Backend->Frontend org mapper |
| 5 | utils/institutionConstants.ts | 25 | Shared colors/labels/features |
| 6 | utils/rolePermissionTransformers.ts | 80 | Permission format transforms |
| 7 | components/users/UsersStatsBar.tsx | 50 | Stats cards grid |
| 8 | components/users/UsersFilterBar.tsx | 80 | Filter bar composite |
| 9 | components/users/UsersTable.tsx | 150 | Full users table |
| 10 | components/users/UserBadges.tsx | 40 | Role/Status badge components |
| 11 | components/users/UserDetailProfileTab.tsx | 180 | Profile editing tab |
| 12 | components/users/UserDetailActivityTab.tsx | 60 | Activity timeline tab |
| 13 | components/users/UserDetailPermissionsTab.tsx | 100 | Permissions display tab |
| 14 | components/institutions/CreateInstitutionModal.tsx | 70 | Create org modal |
| 15 | components/institutions/EditInstitutionModal.tsx | 60 | Edit org modal |
| 16 | components/institutions/FeatureFlagsModal.tsx | 60 | Feature flags modal |
| 17 | components/classroom-teacher/AssignTeacherModal.tsx | 70 | Assign teacher modal |
| 18 | components/classroom-teacher/AssignClassroomsModal.tsx | 80 | Assign classrooms modal |
| 19 | components/classroom-teacher/RemoveConfirmModal.tsx | 50 | Shared removal confirmation |
| 20 | hooks/useUsersQuery.ts | 80 | React Query for users |
| 21 | hooks/useUserSelection.ts | 40 | Selection state hook |
| 22 | hooks/useBulkUserActions.ts | 80 | Bulk mutations |
| 23 | hooks/useOrganizationsQuery.ts | 120 | React Query for orgs |
| 24 | hooks/useOrganizationFeatures.ts | 60 | Feature mutations |

**Total nuevos:** 24 archivos, ~1,605 lineas estimadas

---

## Orden de Ejecucion Recomendado

1. **Sprint 1 (Alta prioridad, bajo riesgo):** Fase 0 (utils/hooks compartidos) + Fase 7 (console.log cleanup)
2. **Sprint 2 (Alta prioridad, medio riesgo):** Fase 1 (AdminUsersPage) + Fase 3 (AdminInstitutionsPage)
3. **Sprint 3 (Media prioridad):** Fase 5 (React Query migration)
4. **Sprint 4 (Media prioridad):** Fase 2 (AdminRolesPage tema) + Fase 6 (componentes split)
5. **Sprint 5 (Baja prioridad):** Fase 4 (ClassroomTeacher cleanup)
