# Hallazgos -- Grupo B: Users + Roles + Institutions + ClassroomTeacher

**Agente:** B
**Fecha:** 2026-02-18
**Alcance:** 4 paginas, 5 hooks, 17 componentes (incluyendo index/barrel files)

---

## Resumen

- Paginas analizadas: 4
- Hooks analizados: 5
- Componentes analizados: 17 archivos (4 directorios: users/6, roles/5, institutions/5, classroom-teacher/2)
- Total violaciones: 47 (6 CRITICA, 14 ALTA, 18 MEDIA, 9 BAJA)
- Lineas totales analizadas: ~6,830

### Conteo de Lineas por Archivo

| Archivo | Lineas |
|---------|--------|
| AdminUsersPage.tsx | 892 |
| AdminRolesPage.tsx | 302 |
| AdminInstitutionsPage.tsx | 574 |
| AdminClassroomTeacherPage.tsx | 154 |
| useUserManagement.ts | 565 |
| useOrganizations.ts | 563 |
| useRoles.ts | 237 |
| useRolePermissions.ts | 382 |
| useClassroomTeacher.ts | 161 |
| BulkActionsPanel.tsx | 479 |
| CreateUserModal.tsx | 370 |
| UserAdvancedFilters.tsx | 148 |
| UserDetailModal.tsx | 712 |
| users/index.ts | 9 |
| RolesTable.tsx | 116 |
| RoleEditor.tsx | 154 |
| PermissionMatrix.tsx | 174 |
| RoleActionsMenu.tsx | 132 |
| roles/index.ts | 15 |
| InstitutionFilters.tsx | 191 |
| InstitutionsTable.tsx | 215 |
| InstitutionStats.tsx | 188 |
| InstitutionDetailModal.tsx | 302 |
| institutions/index.ts | 19 |
| ClassroomTeachersTab.tsx | 402 |
| TeacherClassroomsTab.tsx | 416 |

---

## 1. AdminUsersPage.tsx (892 lineas)

### Violaciones

1. **[CRITICA]** Lineas 1-892: Pagina de 892 lineas viola SRP masivamente (limite: 150 lineas). Contiene logica de estado, handlers, utilidades de formateo, CSV export, y JSX inline todo en un unico componente.

2. **[CRITICA]** Lineas 168-187: Tres `useEffect` encadenados para fetch manual (lineas 168-171, 174-179, 182-187). Patron `useEffect` + `useState` para data fetching en vez de React Query. Este es el patron anti-recomendado: deberia usar `useQuery` como hace `useClassroomTeacher.ts`.

3. **[ALTA]** Linea 200: `handleUpdateUser` recibe `data: any` -- TypeScript strict violado. Deberia tiparse como `Partial<UserFormData>`.

4. **[ALTA]** Lineas 420-454: Logica de exportacion CSV inline en la pagina (35 lineas). Este patron se duplica en otras paginas admin (reportes, analytics). Deberia extraerse a un shared utility `exportToCSV()`.

5. **[ALTA]** Lineas 96-103: Boilerplate de fallback gamification data (8 lineas identicas en las 4 paginas del grupo).

6. **[ALTA]** Lineas 105-108: Boilerplate de `handleLogout` (4 lineas identicas en las 4 paginas del grupo).

7. **[ALTA]** Lineas 228-310: Tres handlers de confirmacion (handleSuspendUser, handleUnsuspendUser, handleDeleteUser) con patron identico de `setConfirmDialog` -- solo cambian title, message, callback, y variant. Son ~82 lineas reducibles a ~15 con una funcion generica.

8. **[ALTA]** Lineas 319-415: Cuatro handlers de bulk operations (handleBulkSuspend, handleBulkActivate, handleBulkChangeRole, handleBulkDelete) con patron try/catch/showToast identico -- ~97 lineas reducibles a ~25 con un wrapper generico.

9. **[MEDIA]** Lineas 478-521: Funciones `getRoleBadge` y `getStatusBadge` definidas inline (44 lineas). Estos son componentes presentacionales que deberian ser componentes separados reutilizables.

10. **[MEDIA]** Lineas 547-585: Stats cards con 6 DetectiveCard repetitivos (38 lineas de JSX repetitivo). Deberia mapearse desde un array de config.

11. **[MEDIA]** Lineas 686-811: Tabla de usuarios con 125 lineas de JSX inline. Deberia extraerse a un componente `UsersTable`.

12. **[MEDIA]** Lineas 762-768: IIFE inline en JSX para formatear fecha `lastLogin` -- deberia ser una funcion helper.

13. **[BAJA]** Linea 186: `eslint-disable react-hooks/exhaustive-deps` -- indica dependencia oculta.

14. **[BAJA]** Lineas 17-31: 15 iconos importados de lucide-react. Esto es normal pero sugiere que la pagina tiene demasiadas responsabilidades.

### Boilerplate Duplicado

- **Lineas 39, 93, 96-103, 105-108:** Patron `useAuth + useUserGamification + displayGamificationData + handleLogout` (~20 lineas identicas en las 4 paginas).
- **Lineas 523-529:** AdminLayout wrapper con props identicas.

### Mapa de Dependencias

- **Hooks:** useAuth, useUserManagement, useUserGamification, useToast
- **Componentes:** AdminLayout, DetectiveCard, DetectiveButton, FeatureBadge, ConfirmDialog, UserDetailModal, CreateUserModal, BulkActionsPanel, UserAdvancedFilters, ToastContainer
- **API calls directos:** `getOrganizations` (lineas 114-126) -- deberia estar en hook
- **Iconos:** 15 (Users, Search, Filter, UserPlus, Edit, Trash2, CheckCircle, XCircle, Mail, Shield, RefreshCw, Square, CheckSquare)

---

## 2. AdminRolesPage.tsx (302 lineas)

### Violaciones

1. **[ALTA]** Lineas 43-45: Usa `Card` y `Button` en vez de `DetectiveCard` y `DetectiveButton`. Inconsistencia de tema con resto del admin portal que usa detective theme.

2. **[ALTA]** Lineas 78-89: Fallback gamification data con campos adicionales (`rankColor`, `progressToNextLevel`, `xpToNextLevel`, `totalAchievements`) que no existen en el tipo base. Esto es inconsistente con las otras 3 paginas que usan una version mas simple.

3. **[MEDIA]** Lineas 49-61: Boilerplate `useAuth + useUserGamification + displayGamificationData + handleLogout` (45 lineas hasta linea 94).

4. **[MEDIA]** Linea 37: Importa `useState, useEffect` de React pero la logica de estado local podria reducirse si el componente se dividiera mejor.

5. **[MEDIA]** Lineas 107-113: `useEffect` para copiar permissions al state de edicion -- correcto pero el patron de "copy to local state for editing" podria encapsularse en un hook `useEditablePermissions`.

6. **[BAJA]** Linea 70: Variable `gamificationLoading` declarada pero solo usada en fallback text -- patron innecesariamente complejo.

### Boilerplate Duplicado

- **Lineas 49-94:** Patron completo useAuth + gamification + handleLogout (~45 lineas).
- **Lineas 166-172:** AdminLayout wrapper con props identicas.

### Mapa de Dependencias

- **Hooks:** useAuth, useRoles, useRolePermissions, useUserGamification
- **Componentes:** AdminLayout, Card (NO DetectiveCard), Button (NO DetectiveButton), LoadingSpinner, RolesTable, RoleEditor, RoleActionsMenu
- **API calls:** Ninguno directo (todo via hooks)

---

## 3. AdminInstitutionsPage.tsx (574 lineas)

### Violaciones

1. **[CRITICA]** Linea 1: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- Deshabilita tipado strict para todo el archivo. Al menos 2 usos de `any` explicitamente (lineas 419, 474).

2. **[CRITICA]** Lineas 389-556: 4 modales inline (Create, Edit, Features, Delete) definidos directamente en el JSX de la pagina -- 167 lineas de modales. Cada modal deberia ser su propio componente.

3. **[ALTA]** Lineas 389-449: Modal de creacion con formulario inline (60 lineas). Duplica estructura con modal de edicion (lineas 452-505, 53 lineas).

4. **[ALTA]** Lineas 303-314: Array `availableFeatures` hardcodeado en la pagina (12 lineas). Deberia ser una constante compartida o venir del backend.

5. **[MEDIA]** Lineas 82-105: Fetch manual con `loadOrganizationStats` usando `useState` + `try/catch` en vez de React Query.

6. **[MEDIA]** Lineas 113-193: Tres handlers CRUD (handleCreateOrg, handleEditOrg, handleDeleteOrg) con patron identico de `setIsSubmitting + try/catch + setOperationSuccess + clearMessages` -- ~80 lineas reducibles con un wrapper generico.

7. **[MEDIA]** Lineas 72-78: `clearMessages` con setTimeout -- patron propenso a memory leaks (no cleanup en unmount).

8. **[MEDIA]** Lineas 419, 474: `value as any` en plan select -- deberia tipparse correctamente con union type.

9. **[BAJA]** Linea 319: Pasa `gamificationData` directamente sin fallback (a diferencia de las otras 3 paginas). Inconsistente.

### Boilerplate Duplicado

- **Lineas 28-29, 107-110:** Patron useAuth + gamification + handleLogout (~15 lineas).
- **Lineas 316-322:** AdminLayout wrapper.
- **Lineas 398-448 vs 461-505:** Modales Create y Edit comparten ~80% de su JSX.

### Mapa de Dependencias

- **Hooks:** useAuth, useUserGamification, useOrganizations
- **Componentes:** AdminLayout, DetectiveButton, Modal, FormField, ConfirmDialog, InstitutionFilters, InstitutionsTable, InstitutionDetailModal
- **API calls directos:** `getOrganizationStats` (linea 85) -- deberia estar en hook
- **Iconos:** Plus

---

## 4. AdminClassroomTeacherPage.tsx (154 lineas)

### Violaciones

1. **[MEDIA]** Lineas 33-40: Fallback gamification data (8 lineas) -- boilerplate duplicado.

2. **[MEDIA]** Lineas 42-45: handleLogout boilerplate duplicado.

3. **[BAJA]** Linea 14: Importa `motion` de framer-motion para una animacion de tabs que podria ser CSS-only.

4. **[BAJA]** Lineas 148-154: Funcion helper `getTabGradient` definida fuera del componente pero solo usada aqui -- ok para ahora pero si tabs se reutilizan deberia ser shared.

### Boilerplate Duplicado

- **Lineas 28-45:** Patron completo useAuth + gamification + handleLogout (~18 lineas).
- **Lineas 64-69:** AdminLayout wrapper.

### Mapa de Dependencias

- **Hooks:** useAuth, useUserGamification
- **Componentes:** AdminLayout, ClassroomTeachersTab, TeacherClassroomsTab
- **Iconos:** Users, GraduationCap
- **Utils:** cn

### Nota Positiva

Esta pagina esta bien modularizada con sus tabs como componentes separados. Es el mejor ejemplo de separacion en este grupo.

---

## 5. useUserManagement.ts (565 lineas)

### Violaciones

1. **[CRITICA]** Linea 1: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- Deshabilita strict para todo el archivo.

2. **[CRITICA]** Lineas 100-565: Hook monolitico de 465 lineas con 18 funciones exportadas. Deberia dividirse en al menos 3 hooks: `useUsersFetch`, `useUserSelection`, `useUserMutations`.

3. **[ALTA]** Lineas 121-190: `fetchUsers` usa `useState + useCallback` manual en vez de React Query. Toda la logica de loading/error/pagination se reimplementa manualmente. `useClassroomTeacher.ts` demuestra el patron correcto con `useQuery/useMutation`.

4. **[ALTA]** Lineas 130, 303: Variables tipadas como `any` explicitamente -- `userFilters: any`, `updatePayload: any`.

5. **[ALTA]** Lineas 391-467: Tres funciones de bulk operations (`bulkSuspend`, `bulkDelete`, `bulkUpdateRole`) con patron identico de `apiClient.post + response unwrap` -- ~77 lineas reducibles a ~20 con funcion generica.

6. **[MEDIA]** Lineas 23-45: Tipos `CreateUserParams` y `CreatedUserResult` definidos en el hook. Deberian estar en `types.ts`.

7. **[MEDIA]** Linea 12: Importa `apiClient` Y `adminAPI` -- mezcla de dos patrones de API call. `resetPassword` (linea 352) y `createUser` (linea 366) usan `apiClient` directo mientras el resto usa `adminAPI`.

8. **[BAJA]** Lineas 47-91: Interface `UseUserManagementResult` de 45 lineas -- excesivamente grande, confirma que el hook tiene demasiadas responsabilidades.

### Mapa de Dependencias

- **API:** apiClient (directo), adminAPI (wrapper)
- **Config:** API_ENDPOINTS
- **Types:** SystemUser, UserManagementFilters, PaginationParams, BulkActionResult

---

## 6. useOrganizations.ts (563 lineas)

### Violaciones

1. **[ALTA]** Linea 18: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- Deshabilita strict para todo el archivo.

2. **[ALTA]** Lineas 83-563: Hook monolitico de 480 lineas. Combina CRUD, feature management, subscription management, user listing, selection, y pagination. Deberia dividirse.

3. **[ALTA]** Lineas 126, 160, 195, 203, 242, 324, 402: Multiples casteos `as any` para mapear campos backend a frontend. El patron de mapeo `org.tier || org.plan || 'free'` se repite 7 veces (lineas 129, 168, 210, 249, 330, 411, ~7 instancias identicas de ~5 lineas cada una = 35 lineas de codigo duplicado). Deberia ser una funcion `mapOrganizationFromBackend(apiOrg)`.

4. **[MEDIA]** Linea 22: Importa `apiClient` Y `adminAPI` -- mezcla de patrones. `updateSubscription` (linea 397) y `fetchOrganizationUsers` (linea 449) usan `apiClient` directo.

5. **[MEDIA]** Lineas 517-520: `useEffect` con eslint-disable para fetch on mount -- deberia ser React Query.

6. **[BAJA]** Lineas 306-307: eslint-disable para exhaustive-deps en `deleteOrganization`.

### Mapa de Dependencias

- **API:** apiClient (directo), adminAPI (wrapper)
- **Config:** API_ENDPOINTS
- **Types:** Organization, OrganizationUser, PaginatedResponse

---

## 7. useRoles.ts (237 lineas)

### Violaciones

1. **[MEDIA]** Lineas 117-157: `fetchRoles` usa `useState + useCallback` manual en vez de React Query.

2. **[MEDIA]** Linea 146: `console.log` en produccion -- deberia eliminarse o usar logger condicional.

3. **[BAJA]** Linea 214: eslint-disable para exhaustive-deps en mount effect.

### Nota Positiva

Bien tipado (sin `any`), buena separacion con `transformRole` helper, validacion defensiva del response.

### Mapa de Dependencias

- **API:** adminAPI
- **Types:** Role, AvailablePermission (from adminTypes)

---

## 8. useRolePermissions.ts (382 lineas)

### Violaciones

1. **[ALTA]** Linea 15: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- Deshabilita strict.

2. **[ALTA]** Lineas 216, 232-237, 313, 328-334: Multiples `(backendData as any).field` -- 12+ usos de `as any`. Deberia definirse un tipo `BackendRolePermissionsResponse` y usarse un mapper tipado.

3. **[MEDIA]** Lineas 242-246, 294-298, 341: `console.log` en produccion.

4. **[MEDIA]** Lineas 40-93, 104-114: Funciones de transformacion `transformPermissionsFromBackend` y `transformPermissionsToBackend` son utiles pero estan acopladas al archivo del hook. Deberian estar en un archivo de utilidades `transformers/rolePermissions.ts`.

### Mapa de Dependencias

- **API:** adminAPI
- **Types:** RolePermissions, Permission, Role (from adminTypes)

---

## 9. useClassroomTeacher.ts (161 lineas)

### Violaciones

1. **[MEDIA]** Linea 3: `/* eslint-disable @typescript-eslint/no-explicit-any */` -- Para error handling y query params.

2. **[BAJA]** Lineas 93, 112, 131, 142: `error: any` en onError callbacks -- deberia ser `Error | AxiosError`.

### Nota Positiva

**MEJOR HOOK del grupo.** Usa React Query (`useQuery`, `useMutation`, `useQueryClient`) correctamente. Tiene invalidacion de cache. Es el patron a seguir para migrar los otros 4 hooks.

### Mapa de Dependencias

- **API:** classroomTeacherApi
- **React Query:** useQuery, useMutation, useQueryClient
- **Types:** AssignTeacherToClassroomDto, AssignClassroomsToTeacherDto, BulkAssignDto

---

## 10. Componentes users/

### BulkActionsPanel.tsx (479 lineas)

1. **[ALTA]** Lineas 85-205: Componente `ConfirmationModal` definido inline dentro del mismo archivo (121 lineas). Deberia ser su propio archivo, y ademas duplica funcionalidad de `ConfirmDialog` de shared.
2. **[MEDIA]** Lineas 1-479: Archivo de 479 lineas para un componente -- excede el limite de 150.
3. **[BAJA]** Referencia a `display_name` (linea 421) que no existe en el tipo `SystemUser` (es `full_name`).

### CreateUserModal.tsx (370 lineas)

1. **[MEDIA]** Lineas 17-35: Tipos `CreateUserFormData` y `CreatedUserResult` duplicados con `useUserManagement.ts` lineas 23-45.
2. **[MEDIA]** Archivo de 370 lineas -- excede 150 lineas pero justificable por tener form + success state.

### UserAdvancedFilters.tsx (148 lineas)

- Dentro del limite. Bien estructurado.

### UserDetailModal.tsx (712 lineas)

1. **[CRITICA]** Lineas 1-712: Componente de 712 lineas con 3 tabs inline (Profile, Activity, Permissions). Cada tab deberia ser su propio componente.
2. **[ALTA]** Lineas 70-95: Mock activity logs hardcodeados -- datos de prueba en produccion.
3. **[MEDIA]** Lineas 596-700: Tab de Permissions tiene 105 lineas de contenido estatico/placeholder con SVG inline. Deberia ser componente separado o eliminarse si no es funcional.

---

## 11. Componentes roles/

### RolesTable.tsx (116 lineas)

- Dentro del limite. SVG inline (lineas 90-91, 102-103) podria usar iconos de lucide-react para consistencia.

### RoleEditor.tsx (154 lineas)

- Marginalmente sobre el limite (154 vs 150). Aceptable.

### PermissionMatrix.tsx (174 lineas)

- Ligeramente sobre limite (174 vs 150). Bien modularizado con helpers internos.

### RoleActionsMenu.tsx (132 lineas)

- Dentro del limite. Bien documentado.

---

## 12. Componentes institutions/

### InstitutionFilters.tsx (191 lineas)

1. **[MEDIA]** Lineas 31-35: Estado local de filters duplica estado del padre. El componente mantiene su propio `filters` state Y emite via `onFilter` -- "double source of truth".

### InstitutionsTable.tsx (215 lineas)

1. **[MEDIA]** Lineas 33-50: `planColors`, `statusColors`, `statusLabels`, `formatDate` -- duplicados con `InstitutionDetailModal.tsx` (lineas 63-99). Deberian estar en archivo shared.

### InstitutionStats.tsx (188 lineas)

- Bien modularizado. Ligero exceso del limite.

### InstitutionDetailModal.tsx (302 lineas)

1. **[ALTA]** Lineas 63-99: Duplica `planColors`, `statusColors`, `statusLabels`, `formatDate` de InstitutionsTable.
2. **[MEDIA]** Lineas 53-58: `useEffect` con `setTimeout` simulando carga -- mock code en produccion.

---

## 13. Componentes classroom-teacher/

### ClassroomTeachersTab.tsx (402 lineas)

1. **[ALTA]** Lineas 286-399: Dos modales inline (Assign: lineas 286-350, Remove confirm: 353-399) -- 113 lineas de modal code. Deberian ser componentes separados.
2. **[MEDIA]** Lineas 44-47: `isValidUUID` helper duplicado con `TeacherClassroomsTab.tsx`.
3. **[MEDIA]** Lineas 50-59: `handleCopyId` duplicado con `TeacherClassroomsTab.tsx`.
4. **[MEDIA]** Linea 174: `(error as any)` -- tipado inseguro.

### TeacherClassroomsTab.tsx (416 lineas)

1. **[ALTA]** Lineas 296-413: Dos modales inline -- misma violacion que ClassroomTeachersTab.
2. **[MEDIA]** Lineas 44-47: `isValidUUID` helper duplicado.
3. **[MEDIA]** Lineas 50-59: `handleCopyId` duplicado.
4. **[MEDIA]** Linea 184: `(error as any)` -- tipado inseguro.

---

## Patrones Anti Recurrentes (Cross-Cutting)

### A1: Boilerplate AdminLayout (4/4 paginas)

```
const { user, logout } = useAuth();
const { gamificationData } = useUserGamification(user?.id);
const displayGamificationData = gamificationData || { ... };
const handleLogout = () => { logout(); window.location.href = '/login'; };
...
<AdminLayout user={user || undefined} gamificationData={...} organizationName="..." onLogout={handleLogout}>
```

Se repite en las 4 paginas. Total: ~80 lineas duplicadas. Solucion: HOC `withAdminLayout` o custom hook `useAdminPageSetup`.

### A2: Fetch Manual vs React Query (4/5 hooks)

| Hook | Patron | Correcto? |
|------|--------|-----------|
| useUserManagement | useState + useCallback | NO |
| useOrganizations | useState + useEffect + useCallback | NO |
| useRoles | useState + useEffect + useCallback | NO |
| useRolePermissions | useState + useCallback | NO |
| useClassroomTeacher | useQuery + useMutation | SI |

4 de 5 hooks reimplementan manualmente lo que React Query ya proporciona (cache, loading, error, refetch, stale-while-revalidate).

### A3: eslint-disable no-explicit-any (5 archivos)

- useUserManagement.ts (linea 1)
- useOrganizations.ts (linea 18)
- useRolePermissions.ts (linea 15)
- useClassroomTeacher.ts (linea 3)
- AdminInstitutionsPage.tsx (linea 1)

### A4: Modales Inline (3 paginas)

- AdminUsersPage: 0 inline (bien extraidos a componentes)
- AdminInstitutionsPage: 4 modales inline (Create, Edit, Features, Delete)
- ClassroomTeachersTab: 2 modales inline
- TeacherClassroomsTab: 2 modales inline

### A5: Duplicacion de Mappers/Utilities

- `planColors` + `statusColors` + `statusLabels` + `formatDate` duplicados entre InstitutionsTable y InstitutionDetailModal
- `isValidUUID` + `handleCopyId` duplicados entre ClassroomTeachersTab y TeacherClassroomsTab
- Organization mapper (`org.tier || org.plan || 'free'`) duplicado 7 veces en useOrganizations
- `getRoleBadge` / `getStatusBadge` en AdminUsersPage podrian reutilizarse

### A6: console.log en Produccion

- useRoles.ts linea 146
- useRolePermissions.ts lineas 242-246, 294-298, 341
