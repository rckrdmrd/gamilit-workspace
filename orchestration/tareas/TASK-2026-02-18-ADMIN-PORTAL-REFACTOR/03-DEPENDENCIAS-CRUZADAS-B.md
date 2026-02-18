# Dependencias Cruzadas -- Grupo B: Users + Roles + Institutions + ClassroomTeacher

**Agente:** B
**Fecha:** 2026-02-18

---

## 1. Componentes Compartidos con Otros Grupos

### 1.1 Shared Components Consumidos por Grupo B

| Componente | Path | Usado por | Posible dependencia con otro agente |
|------------|------|-----------|-------------------------------------|
| AdminLayout | `admin/layouts/AdminLayout.tsx` | 4/4 paginas | **Agente A** (si analiza layout) -- coordinar HOC/wrapper |
| DetectiveCard | `shared/components/base/DetectiveCard.tsx` | AdminUsersPage | Agentes C, D, E |
| DetectiveButton | `shared/components/base/DetectiveButton.tsx` | AdminUsersPage, AdminInstitutionsPage, AdminClassroomTeacherPage | Agentes C, D, E |
| Card | `shared/components/Card.tsx` | AdminRolesPage | **Inconsistencia** -- otros usan DetectiveCard |
| Button | `shared/components/Button.tsx` | AdminRolesPage | **Inconsistencia** -- otros usan DetectiveButton |
| Modal | `shared/components/common/Modal.tsx` | AdminInstitutionsPage, InstitutionDetailModal | Agentes C, D |
| FormField | `shared/components/common/FormField.tsx` | AdminInstitutionsPage | Agentes C, D |
| ConfirmDialog | `shared/components/common/ConfirmDialog.tsx` | AdminUsersPage, AdminInstitutionsPage | Agentes C, D |
| FeatureBadge | `shared/components/common/FeatureBadge.tsx` | AdminUsersPage | Agentes C, D |
| LoadingSpinner | `shared/components/LoadingSpinner.tsx` | AdminRolesPage, RoleEditor | Agentes C, D, E |
| ActivityTimeline | `shared/components/timeline/` | UserDetailModal | Posible uso en analytics (Agente D/E) |
| ToastContainer | `shared/components/base/Toast.tsx` | AdminUsersPage | Agentes C, D, E |

### 1.2 Hooks Compartidos Consumidos por Grupo B

| Hook | Path | Usado por |
|------|------|-----------|
| useAuth | `features/auth/hooks/useAuth.ts` | 4/4 paginas |
| useUserGamification | `shared/hooks/useUserGamification.ts` | 4/4 paginas |
| useToast | `shared/components/base/Toast.tsx` | AdminUsersPage |

### 1.3 API Services Consumidos por Grupo B

| Service | Path | Usado por | Patron |
|---------|------|-----------|--------|
| adminAPI | `services/api/adminAPI.ts` | useUserManagement, useOrganizations, useRoles, useRolePermissions | import * as adminAPI |
| apiClient | `services/api/apiClient.ts` | useUserManagement, useOrganizations | Direct calls |
| API_ENDPOINTS | `config/api.config.ts` | useUserManagement, useOrganizations | Endpoint resolution |
| classroomTeacherApi | `services/api/admin/classroomTeacherApi.ts` | useClassroomTeacher | React Query |
| getOrganizations | `services/api/adminAPI.ts` | AdminUsersPage (linea 15) | Direct import en page |
| getOrganizationStats | `services/api/adminAPI.ts` | AdminInstitutionsPage (linea 12) | Direct import en page |

---

## 2. Patrones que Necesitan Solucion Cross-Cutting

### 2.1 AdminLayout Boilerplate (IMPACTO: TODOS los agentes)

**Problema:** Todas las paginas admin repiten:
```
useAuth() + useUserGamification() + displayGamificationData fallback + handleLogout
```

**Solucion propuesta (Grupo B):** `useAdminPageSetup()` hook.

**Coordinacion necesaria:**
- Todos los agentes deben usar el MISMO hook
- Si Agente A analiza AdminLayout, podria proponer alternativa (HOC)
- **Recomendacion:** Un unico agente crea el hook, los demas lo consumen

### 2.2 Card vs DetectiveCard Inconsistencia (IMPACTO: Grupo B + potencialmente otros)

**Problema:** AdminRolesPage usa `Card` + `Button` mientras las otras 3 paginas usan `DetectiveCard` + `DetectiveButton`.

**Pregunta para otros agentes:** Que componentes usa el resto del admin portal? Si DetectiveCard es el estandar, Roles debe migrar. Si Card es aceptable en contexto de roles editor (tema claro), documentar la excepcion.

### 2.3 React Query vs Manual Fetch (IMPACTO: TODOS los hooks)

**Problema:** 4 de 5 hooks en Grupo B usan `useState` + `useCallback` manual. Solo `useClassroomTeacher` usa React Query.

**Coordinacion necesaria:**
- Otros grupos pueden tener el mismo problema
- La migracion a React Query debe usar query keys consistentes: `['admin-users']`, `['admin-roles']`, `['admin-organizations']`
- Definir QUERY_KEYS centralizado si multiples grupos lo necesitan

### 2.4 Toast Systems (IMPACTO: Grupos B, posiblemente C, D, E)

**Problema:** Dos sistemas de toast coexisten:
- `react-hot-toast` (usado en useClassroomTeacher, ClassroomTeachersTab, TeacherClassroomsTab)
- `@shared/components/base/Toast.tsx` con `useToast()` (usado en AdminUsersPage)

**Coordinacion:** Todos los agentes deben verificar cual es el estandar y migrar al unico sistema.

### 2.5 adminAPI vs apiClient Directo (IMPACTO: Hooks de Grupo B + otros)

**Problema:** Algunos hooks importan AMBOS `adminAPI` y `apiClient`. Para endpoints cubiertos por adminAPI, deberian usar solo adminAPI. Para los no cubiertos, deberian agregarse a adminAPI.

**Endpoints usando apiClient directo (deberian migrarse a adminAPI):**
- `useUserManagement.ts`: `resetPassword`, `createUser`, `bulkSuspend`, `bulkDelete`, `bulkUpdateRole`
- `useOrganizations.ts`: `updateSubscription`, `fetchOrganizationUsers`

---

## 3. Tipos Compartidos

### 3.1 Tipos Definidos en admin/types.ts

| Tipo | Ubicacion | Consumidores |
|------|-----------|-------------|
| SystemUser | admin/types | AdminUsersPage, useUserManagement, UserDetailModal, BulkActionsPanel |
| Organization | admin/types | AdminInstitutionsPage, useOrganizations, InstitutionsTable, InstitutionDetailModal |
| UserManagementFilters | admin/types | AdminUsersPage, useUserManagement, UserAdvancedFilters |
| PaginationParams | admin/types | useUserManagement |
| BulkActionResult | admin/types | useUserManagement |
| OrganizationUser | admin/types | useOrganizations |
| PaginatedResponse | admin/types | useOrganizations |

### 3.2 Tipos Duplicados

| Tipo | Ubicacion 1 | Ubicacion 2 | Diferencia |
|------|------------|------------|------------|
| CreateUserFormData | CreateUserModal.tsx L17-24 | useUserManagement.ts L23-30 (CreateUserParams) | Casi identicos, nombres diferentes |
| CreatedUserResult | CreateUserModal.tsx L26-35 | useUserManagement.ts L32-45 | Modal version tiene menos campos |
| Permission | adminTypes.ts | useRolePermissions.ts (transformer) | Transformer define validActions/validModules inline |

### 3.3 Tipos de adminTypes.ts Consumidos

| Tipo | Consumidores |
|------|-------------|
| Role | useRoles, AdminRolesPage, RolesTable, RoleActionsMenu, RoleEditor |
| Permission | useRolePermissions, AdminRolesPage, RoleEditor, PermissionMatrix |
| RolePermissions | useRolePermissions, AdminRolesPage, RoleEditor |
| AvailablePermission | useRoles |

---

## 4. Potenciales Conflictos entre Agentes

### 4.1 AdminLayout Modifications

- **Riesgo:** Si Agente A modifica AdminLayout para agregar HOC/wrapper y Agente B crea `useAdminPageSetup`, ambas soluciones podrian chocar.
- **Resolucion:** Acordar UNA solucion. Recomendacion: hook `useAdminPageSetup` es menos invasivo que HOC.

### 4.2 Shared Components Modifications

- **Riesgo:** Si algun agente modifica `ConfirmDialog`, `Modal`, o `Toast` para mejorarlos, puede romper paginas del Grupo B.
- **Resolucion:** Modificaciones a shared components deben ser backward-compatible.

### 4.3 adminAPI.ts Changes

- **Riesgo:** Si otro agente agrega endpoints a `adminAPI.ts` que colisionan con los del Grupo B (e.g., cambiar firma de `getUsers`).
- **Resolucion:** Cambios a adminAPI deben ser aditivos, nunca destructivos.

### 4.4 Query Keys Namespace

- **Riesgo:** Si multiples agentes migran a React Query sin coordinar, pueden usar query keys que colisionan.
- **Resolucion:** Definir convencion: `['admin-{domain}', ...params]`.

---

## 5. Dependencias con Backend

### 5.1 Endpoints Consumidos por Grupo B

| Endpoint | Hook/Page | Estado |
|----------|-----------|--------|
| GET /admin/users | useUserManagement via adminAPI | Funcional |
| POST /admin/users | useUserManagement via apiClient | Funcional |
| PUT /admin/users/:id | useUserManagement via adminAPI | Funcional |
| DELETE /admin/users/:id | useUserManagement via adminAPI | Funcional |
| PATCH /admin/users/:id/suspend | useUserManagement via adminAPI | Funcional |
| PATCH /admin/users/:id/unsuspend | useUserManagement via adminAPI | Funcional |
| POST /admin/users/:id/reset-password | useUserManagement via apiClient | Funcional |
| POST /admin/users/bulk/suspend | useUserManagement via apiClient | Funcional |
| POST /admin/users/bulk/delete | useUserManagement via apiClient | Funcional |
| POST /admin/users/bulk/update-role | useUserManagement via apiClient | Funcional |
| GET /admin/organizations | useOrganizations via adminAPI | Funcional |
| POST /admin/organizations | useOrganizations via adminAPI | Funcional |
| PUT /admin/organizations/:id | useOrganizations via adminAPI | Funcional |
| DELETE /admin/organizations/:id | useOrganizations via adminAPI | Funcional |
| PUT /admin/organizations/:id/features | useOrganizations via adminAPI | Funcional |
| PATCH /admin/organizations/:id/subscription | useOrganizations via apiClient | Funcional |
| GET /admin/organizations/:id/users | useOrganizations via apiClient | Funcional |
| GET /admin/organizations/:id/stats | AdminInstitutionsPage via getOrganizationStats | Funcional |
| GET /admin/roles | useRoles via adminAPI | Funcional |
| GET /admin/roles/permissions | useRoles via adminAPI | Funcional |
| GET /admin/roles/:id/permissions | useRolePermissions via adminAPI | Funcional |
| PUT /admin/roles/:id/permissions | useRolePermissions via adminAPI | Funcional |
| POST /admin/roles | RoleActionsMenu | PENDIENTE BACKEND |
| DELETE /admin/roles/:id | RoleActionsMenu | PENDIENTE BACKEND |
| GET /admin/classroom-teachers/classroom/:id | useClassroomTeacher | Funcional |
| GET /admin/classroom-teachers/teacher/:id | useClassroomTeacher | Funcional |
| POST /admin/classroom-teachers/classroom/:id | useClassroomTeacher | Funcional |
| DELETE /admin/classroom-teachers/classroom/:id/:teacherId | useClassroomTeacher | Funcional |
| POST /admin/classroom-teachers/teacher/:id | useClassroomTeacher | Funcional |
| POST /admin/classroom-teachers/bulk | useClassroomTeacher | Funcional |
| GET /admin/classroom-teachers/all | useClassroomTeacher | Funcional |
| GET /admin/classrooms/dropdown | useClassroomTeacher | Funcional |
| GET /admin/teachers/dropdown | useClassroomTeacher | Funcional |

**Total endpoints consumidos:** 33 (31 funcionales, 2 pendientes backend)

---

## 6. Grafo de Dependencias Visual

```
AdminUsersPage (892L)
  +-- useAdminPageSetup [PROPUESTO]
  |     +-- useAuth
  |     +-- useUserGamification
  +-- useUserManagement (565L)
  |     +-- adminAPI
  |     +-- apiClient
  +-- useToast
  +-- UserDetailModal (712L)
  |     +-- ActivityTimeline
  |     +-- detectiveRoles utils
  +-- CreateUserModal (370L)
  +-- BulkActionsPanel (479L)
  +-- UserAdvancedFilters (148L)
  +-- getOrganizations [DIRECT API CALL]

AdminRolesPage (302L)
  +-- useAdminPageSetup [PROPUESTO]
  +-- useRoles (237L)
  |     +-- adminAPI
  +-- useRolePermissions (382L)
  |     +-- adminAPI
  +-- RolesTable (116L)
  +-- RoleEditor (154L)
  |     +-- PermissionMatrix (174L)
  +-- RoleActionsMenu (132L)
  +-- Card, Button [INCONSISTENTE]

AdminInstitutionsPage (574L)
  +-- useAdminPageSetup [PROPUESTO]
  +-- useOrganizations (563L)
  |     +-- adminAPI
  |     +-- apiClient
  +-- InstitutionFilters (191L)
  +-- InstitutionsTable (215L)
  +-- InstitutionDetailModal (302L)
  |     +-- InstitutionStats (188L)
  +-- Modal [INLINE MODALS x4]
  +-- getOrganizationStats [DIRECT API CALL]

AdminClassroomTeacherPage (154L)
  +-- useAdminPageSetup [PROPUESTO]
  +-- ClassroomTeachersTab (402L)
  |     +-- useClassroomTeacher (161L)
  |           +-- classroomTeacherApi
  |           +-- React Query
  +-- TeacherClassroomsTab (416L)
        +-- useClassroomTeacher (161L)
```

---

## 7. Recomendaciones de Coordinacion

1. **Agente A y B** deben acordar sobre solucion de boilerplate AdminLayout antes de implementar. Propuesta B: `useAdminPageSetup` hook.

2. **Todos los agentes** deben verificar si sus paginas usan `Card/Button` o `DetectiveCard/DetectiveButton` y unificar.

3. **Todos los agentes** deben verificar si sus hooks usan React Query o fetch manual, y planificar la migracion en conjunto para definir QUERY_KEYS globales.

4. **Agente que analice shared components** debe verificar que `Toast`/`useToast` vs `react-hot-toast` se unifique en un solo sistema.

5. **Nadie debe modificar** `adminAPI.ts`, `apiClient.ts`, o `api.config.ts` sin coordinar -- son dependencias de todos los grupos.
