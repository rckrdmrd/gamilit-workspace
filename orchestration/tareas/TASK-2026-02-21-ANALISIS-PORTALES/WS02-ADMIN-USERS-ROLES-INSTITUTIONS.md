# WS02 - Admin: Usuarios, Roles, Instituciones, Aula-Docente

**Fecha:** 2026-02-21
**Analista:** Claude Sonnet 4.6 (Claude Code)
**Scope:** 4 páginas, 20 componentes, 9 hooks
**Sprint:** Sprint 1 - Calidad y Estabilización

---

## 1. Inventario de Páginas

---

### 1.1 AdminUsersPage

- **Ruta:** `/admin/users`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminUsersPage.tsx`
- **Refactored:** 2026-02-18 (Sprint 1 Admin Portal refactor)

#### Componentes

| Componente | Path |
|---|---|
| AdminPageShell | `apps/frontend/src/apps/admin/components/shared/AdminPageShell` |
| DetectiveCard | `@shared/components/base/DetectiveCard` |
| FeatureBadge | `@shared/components/common` |
| ConfirmDialog | `@shared/components/common` |
| ToastContainer | `@shared/components/base/Toast` |
| UsersStatsGrid | `../components/users/UsersStatsGrid` |
| UsersTable | `../components/users/UsersTable` |
| UsersSearchFilters | `../components/users/UsersSearchFilters` |
| UserDetailModal | `../components/users/UserDetailModal` |
| CreateUserModal | `../components/users/CreateUserModal` |
| BulkActionsPanel | `../components/users/BulkActionsPanel` |

#### Hooks

| Hook | Propósito |
|---|---|
| `useUserManagement` | CRUD de usuarios, paginación, selección, filtros |
| `useUserActions` | Handlers de acciones con confirmation dialogs y toasts |
| `useCreateUserFlow` | Orquestación del modal de creación de usuario |

#### Árbol de componentes

```
AdminUsersPage
├── AdminPageShell
│   └── [contenido principal]
│       ├── Header (título + FeatureBadge "under-construction")
│       ├── UsersStatsGrid
│       ├── UsersSearchFilters
│       │   ├── [search input]
│       │   ├── [role select]
│       │   ├── [status select]
│       │   ├── [refresh button]
│       │   ├── [create user button]
│       │   └── UserAdvancedFilters (collapsible)
│       │       ├── [organization select]
│       │       ├── [dateFrom input]
│       │       └── [dateTo input]
│       ├── [error banner aria-live]
│       └── UsersTable
│           ├── DataTable (detective variant)
│           │   └── [columns: checkbox, nombre, email, rol, estado, institución, ultimo acceso, acciones]
│           ├── EmptyState
│           └── Pagination
├── UserDetailModal (3 tabs: Perfil, Actividad, Permisos)
├── ToastContainer
├── ConfirmDialog
├── CreateUserModal
└── BulkActionsPanel (floating panel, animado con Framer Motion)
    └── ConfirmationModal (interno)
```

#### Flujo de datos

```
useUserManagement (React Query)
  └── adminAPI.getUsers()  →  GET /admin/users?page&role&status&organizationId&search
      └── SystemUser[]  →  UsersTable

useUserActions (state local)
  ├── handleSuspendUser  →  adminAPI.suspendUser()  →  POST /admin/users/:id/suspend
  ├── handleUnsuspendUser  →  adminAPI.unsuspendUser()  →  POST /admin/users/:id/unsuspend (o activate)
  ├── handleDeleteUser  →  adminAPI.deleteUser()  →  DELETE /admin/users/:id
  ├── handleBulkSuspend  →  POST /admin/users/bulk/suspend
  ├── handleBulkActivate  →  POST /admin/users/:id/unsuspend (Promise.all — N requests)
  ├── handleBulkChangeRole  →  POST /admin/users/bulk/update-role
  ├── handleBulkDelete  →  POST /admin/users/bulk/delete
  └── handleExportCSV  →  downloadCSV utility (cliente, sin API)

useCreateUserFlow (React Query)
  ├── organizationsQuery  →  GET /admin/organizations?page=1&limit=100
  └── handleCreateUser  →  POST /admin/users  (via useUserManagement.createUser)

handleUpdateUser (local handler en page)
  └── useUserManagement.updateUser()  →  adminAPI.updateUser()  →  PUT /admin/users/:id
```

#### Endpoints API

| Endpoint | Método | Propósito |
|---|---|---|
| `/admin/users` | GET | Listar usuarios con filtros y paginación |
| `/admin/users` | POST | Crear usuario |
| `/admin/users/:id` | PUT | Actualizar usuario |
| `/admin/users/:id` | DELETE | Eliminar usuario |
| `/admin/users/:id/suspend` | POST | Suspender usuario |
| `/admin/users/:id/unsuspend` | POST | Reactivar usuario |
| `/admin/users/:id/reset-password` | POST | Reset de contraseña |
| `/admin/users/bulk/suspend` | POST | Suspensión masiva |
| `/admin/users/bulk/delete` | POST | Eliminación masiva |
| `/admin/users/bulk/update-role` | POST | Cambio de rol masivo |
| `/admin/organizations` | GET | Lista de organizaciones (para CreateUserModal) |

#### Estado

- React Query para datos del servidor (usuarios, organizaciones)
- `useState` local para: `searchTerm`, `debouncedSearch`, `editingUser`, `isEditModalOpen`
- `useUserManagement` gestiona internamente: `selectedUsers[]`, `filters`, `pagination`
- Stats calculadas con `useMemo` filtrando el array local de usuarios (solo la página actual, no el total)

#### Interacciones del usuario

1. **Buscar:** Typing con debounce de 300ms → filtro `search` → re-query React Query
2. **Filtrar por rol:** Select → `onFiltersChange` → re-query
3. **Filtrar por estado:** Select → `onFiltersChange` → re-query
4. **Filtros avanzados:** Toggle collapsible → filtros por organización, dateFrom, dateTo
5. **Refrescar:** Botón → `mgmt.fetchUsers()` (refetch React Query)
6. **Crear usuario:** Botón → `openCreateModal()` → `CreateUserModal` → formulario → `POST /admin/users`
7. **Editar usuario:** Botón en fila → `UserDetailModal` abierto → edición inline → `PUT /admin/users/:id`
8. **Suspender/Reactivar:** Botón en fila → `ConfirmDialog` → acción
9. **Eliminar:** Botón en fila → `ConfirmDialog` → `DELETE /admin/users/:id`
10. **Selección múltiple:** Checkboxes individuales o "seleccionar todos"
11. **Acciones masivas:** `BulkActionsPanel` flotante → suspender, activar, cambiar rol, eliminar, exportar CSV
12. **Paginación:** Botones prev/next en `UsersTable`

#### Manejo de errores

- Error de carga: banner `role="alert"` con `aria-live="polite"` — muestra `mgmt.error`
- Error en acciones: `showToast({ type: 'error', ... })` via `useUserActions`
- Error en `handleUpdateUser`: re-lanza el error (catch + throw) — solo toast, no UI inline
- `BulkActionsPanel`: errores solo en `console.error`, NO muestra feedback al usuario (issue)
- `UserDetailModal` Activity tab: actividad es MOCK hardcoded (issue)
- `UserDetailModal` Permissions tab: aviso explícito de "en desarrollo"

#### Estado de carga

- `UsersTable`: spinner inline (`animate-spin`) cuando `loading && users.length === 0`
- `UsersSearchFilters`: botón Refrescar con `RefreshCw` en `animate-spin` cuando `loading`
- `CreateUserModal`: botón con `Loader2 animate-spin` durante submit
- `BulkActionsPanel`: botón "Procesando..." con spinner SVG inline durante mutaciones

#### Accesibilidad

- Error banner: `role="alert"` + `aria-live="polite"` (correcto)
- Botones de tabla: `title` attribute (correcto pero insuficiente — sin `aria-label`)
- Checkboxes de selección: `title` attribute (sin `aria-label` explícito)
- Modales: `UserDetailModal` tiene `id="user-detail-modal-title"`, `CreateUserModal` tiene `id="create-user-modal-title"` — falta `aria-labelledby` en el elemento Modal wrapper
- `BulkActionsPanel.ConfirmationModal`: tiene `ariaLabelledBy="bulk-actions-title"` (correcto)
- Tabs en `UserDetailModal`: solo `button` sin `role="tab"` o `aria-selected` (no semántico)
- `FeatureBadge variant="under-construction"` visible en header — no bloquea funcionalidad

#### Responsividad

- Stats grid: `grid-cols-1 md:grid-cols-3 lg:grid-cols-6`
- Filtros: `flex-col md:flex-row`
- Filtros avanzados: `grid-cols-1 md:grid-cols-3`
- `UserDetailModal`: `md:grid-cols-2` en campos de formulario
- `BulkActionsPanel`: acciones con texto oculto en móvil (`hidden sm:inline`)
- Sin manejo de tabla responsive en `UsersTable` — scroll horizontal implícito en móvil

#### Issues detectados

| ID | Prioridad | Descripción |
|---|---|---|
| USR-01 | P1 | Stats en header calculan sobre la página actual (20 registros), no sobre `totalUsers`. El contador "Total" usa `mgmt.totalUsers` (correcto) pero "Activos/Inactivos/Estudiantes/Profesores/Admins" se calculan de `mgmt.users` (solo la página actual). |
| USR-02 | P1 | `handleBulkActivate` hace `Promise.all(userIds.map(id => deps.unsuspendUser(id)))` — N requests individuales en lugar de usar el endpoint bulk. No existe `POST /admin/users/bulk/activate`. |
| USR-03 | P1 | `UserDetailModal` - tab "Actividad" usa datos hardcoded (mock). Requiere endpoint backend para historial real de actividad del usuario. |
| USR-04 | P1 | `UserDetailModal` - tab "Permisos" muestra aviso de "Sistema de Permisos en Desarrollo" — no funcional. |
| USR-05 | P2 | `BulkActionsPanel.executeAction` atrapa errores en `console.error` pero no muestra feedback al usuario cuando una acción masiva falla. |
| USR-06 | P2 | Roles en `BulkActionsPanel.ConfirmationModal` (para "Cambiar Rol") usa valores hardcoded: 'student', 'teacher', 'manager', 'admin', 'owner' — inconsistente con el sistema real que usa 'student', 'admin_teacher', 'super_admin'. |
| USR-07 | P2 | `UsersTable`: acciones de fila (editar, suspender, eliminar) no tienen `aria-label` — solo `title`. |
| USR-08 | P2 | `useEffect` inicial llama `mgmt.fetchUsers()` — duplica la query que React Query ya dispara automáticamente al montar. |
| USR-09 | P2 | Debounce implementado manualmente con dos `useEffect` anidados — podría simplificarse con `useDeferredValue` o una librería de debounce. |
| USR-10 | P2 | Formulario de edición en `UserDetailModal` incluye campos `phone`, `department`, `position` que no existen en `SystemUser` ni se envían al backend (`handleUpdateUser` solo pasa `full_name`, `email`, `role`, `status`). |
| USR-11 | P3 | `organizationName` en `UserDetailModal` edit mode: se envía como string de nombre, no como ID — el backend espera `organizationId`. |

---

### 1.2 AdminRolesPage

- **Ruta:** `/admin/roles`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx`
- **Status comentado:** "MVP - Backend Integrated (2025-11-24)"
- **Refactored:** 2025-12-05 (US-ADMIN-P2-001)

#### Componentes

| Componente | Path |
|---|---|
| AdminPageShell | `apps/frontend/src/apps/admin/components/shared` |
| Card | `@shared/components/Card` |
| Button | `@shared/components/Button` |
| LoadingSpinner | `@shared/components/loading` |
| EmptyState | `@shared/components/feedback/EmptyState` |
| RolesTable | `../components/roles/RolesTable` |
| RoleEditor | `../components/roles/RoleEditor` |
| RoleActionsMenu | `../components/roles/RoleActionsMenu` |

#### Hooks

| Hook | Propósito |
|---|---|
| `useRoles` | Fetch de lista de roles y permisos disponibles |
| `useRolePermissions` | Fetch y actualización de permisos de un rol específico |

#### Árbol de componentes

```
AdminRolesPage
├── AdminPageShell
│   └── [contenido principal]
│       ├── Header
│       │   ├── RoleActionsMenu
│       │   │   ├── [Crear Rol - DISABLED, pending backend]
│       │   │   ├── [Editar Permisos - FUNCTIONAL]
│       │   │   ├── [Eliminar - DISABLED, pending backend]
│       │   │   └── [Info panel - toggle]
│       │   └── [Actualizar button]
│       ├── [error banners - rolesError, permissionsError]
│       ├── [success message banner]
│       ├── [loading spinner]
│       └── [grid lg:grid-cols-3]
│           ├── [lg:col-span-1] Card
│           │   └── RolesTable
│           │       └── [role buttons - seleccionables]
│           └── [lg:col-span-2] Card
│               └── [EmptyState "Selecciona un rol" o LoadingSpinner]
└── RoleEditor (Modal)
    ├── [header gradiente]
    ├── PermissionMatrix
    │   └── [checkboxes agrupados por módulo]
    └── [footer: Cancelar / Guardar Permisos]
```

#### Flujo de datos

```
useRoles (React Query)
  ├── adminAPI.getRoles()  →  GET /admin/roles  →  Role[]
  └── adminAPI.getAvailablePermissions()  →  GET /admin/roles/permissions  →  AvailablePermission[]

useRolePermissions
  ├── fetchRolePermissions(roleId)  →  adminAPI.getRolePermissions(roleId)  →  GET /admin/roles/:id/permissions
  │   └── transformBackendResponse()  →  RolePermissions (con Permission[])
  │       (parseo de clave "can_action_module" → {module, action, granted})
  └── updatePermissions(roleId, editingPermissions)  →  adminAPI.updateRolePermissions()  →  PUT /admin/roles/:id/permissions
```

#### Endpoints API

| Endpoint | Método | Propósito |
|---|---|---|
| `/admin/roles` | GET | Listar todos los roles |
| `/admin/roles/permissions` | GET | Permisos disponibles |
| `/admin/roles/:id/permissions` | GET | Permisos de un rol específico |
| `/admin/roles/:id/permissions` | PUT | Actualizar permisos de un rol |
| `/admin/roles` | POST | Crear rol (PENDIENTE — UI deshabilitada) |
| `/admin/roles/:id` | DELETE | Eliminar rol (PENDIENTE — UI deshabilitada) |

#### Estado

- React Query para roles y permisos disponibles
- Patrón manual de cache para permisos de rol: `queryClient.setQueryData()` + `getQueriesData()` en lugar de queries con enabled/disabled — patrón no convencional
- `useState` local: `selectedRoleId`, `editingPermissions[]`, `isSaving`, `successMessage`
- `editingPermissions` es copia local de `rolePermissions.permissions` para edición no destructiva

#### Interacciones del usuario

1. **Cargar la página:** Auto-fetch de roles al montar
2. **Seleccionar un rol:** Click en `RolesTable` → `handleSelectRole()` → fetch permisos → `RoleEditor` modal abre
3. **Toggle permiso:** Checkbox en `PermissionMatrix` → `togglePermission()` → actualiza `editingPermissions` local (optimistic local)
4. **Guardar permisos:** Botón → `handleSavePermissions()` → `PUT /admin/roles/:id/permissions` → success message
5. **Cancelar:** Botón → `handleCancelEdit()` → cierra `RoleEditor`, limpia estado
6. **Actualizar lista:** Botón "Actualizar" → `refetch()`
7. **Crear/Eliminar rol:** Botones disabled con badge "Próximamente"

#### Manejo de errores

- `rolesError` y `permissionsError`: banners `role="alert"` con mensaje del error
- Error en save: `console.error` — el error queda en el hook (`error` de mutation) pero NO se muestra en UI (issue ROL-03)
- `PermissionMatrix`: validación defensiva con `console.error` para perms inválidos
- `RoleActionsMenu`: panel de info con endpoints pendientes documentados

#### Estado de carga

- `LoadingSpinner` + texto cuando `rolesLoading && !roles.length`
- `LoadingSpinner` dentro del panel derecho cuando `selectedRoleId && permissionsLoading`
- `RoleEditor`: `LoadingSpinner` dentro del modal cuando `loading`
- `RolesTable`: skeletons animados (`animate-pulse`) cuando `loading`
- Botón "Guardar Permisos" muestra "Guardando..." durante `saving`

#### Accesibilidad

- Regiones con `role="region"` y `aria-label` en el grid de dos columnas (correcto)
- `aria-live="polite"` en success message y loading states (correcto)
- `role="alert"` en banners de error (correcto)
- `RoleEditor` modal: `aria-label="Cerrar editor"` en botón de cierre (correcto)
- `RolesTable`: botones de selección de rol sin `aria-selected` — no implementa patrón `role="listbox"` o `role="option"`
- `PermissionMatrix`: checkboxes con `label` elemento wrapping (correcto para accesibilidad)
- `PermissionMatrix`: módulos con emojis como íconos sin `aria-hidden` (ruido para screen readers)

#### Responsividad

- Grid principal: `grid-cols-1 lg:grid-cols-3`
- Header: `flex-col sm:flex-row` (responsive)
- `PermissionMatrix` grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`
- Modal (`RoleEditor`): `max-h-[90vh] overflow-hidden` con scroll interno

#### Issues detectados

| ID | Prioridad | Descripción |
|---|---|---|
| ROL-01 | P0 | `useRolePermissions` usa un patrón antipatrón de React Query: una query con key `__none__` siempre deshabilitada, y extrae datos del cache con `getQueriesData()`. Esto hace que `loading` sea siempre `false` porque la query nunca corre. `fetchRolePermissions` está implementado como mutación manual imperativa, perdiendo los beneficios de React Query. |
| ROL-02 | P1 | `RoleEditor` se abre cuando `!!selectedRoleId && !permissionsLoading` — pero como `loading` siempre es `false` (ver ROL-01), el modal abre inmediatamente con `rolePermissions = null` si el fetch aún no terminó, mostrando "No hay datos disponibles" brevemente. |
| ROL-03 | P1 | Error al guardar permisos: `handleSavePermissions` tiene `console.error('Failed to save permissions:', error)` con comentario `// Error is already set in hook`, pero el hook devuelve `error: updateMutation.error` como string — no se renderiza en la UI del page. El usuario no ve feedback de error al fallar save. |
| ROL-04 | P1 | Crear y Eliminar roles están PENDIENTES de implementación backend (`POST /admin/roles`, `DELETE /admin/roles/:id`). Los botones en `RoleActionsMenu` están deshabilitados con badge "Próximamente". |
| ROL-05 | P2 | `transformPermissionsFromBackend` en `useRolePermissions` filtra permisos cuya clave no coincide con el regex `/^(?:can_)?(\w+)_(\w+)$/` o cuyos action/module no están en las listas hardcoded. Permisos nuevos del backend podrían silenciosamente ignorarse. |
| ROL-06 | P2 | La columna derecha del grid (`lg:col-span-2`) muestra `EmptyState` cuando no hay rol seleccionado, pero el `RoleEditor` modal se superpone. La columna derecha actúa solo como placeholder de espacio — podría eliminarse o mostrar instrucciones más claras. |
| ROL-07 | P2 | `PermissionMatrix` usa emojis como íconos de módulo sin `aria-hidden="true"` — serán leídos por screen readers. |
| ROL-08 | P2 | No hay paginación en la lista de roles — si hay muchos roles, todos se muestran sin scroll o paginación. |

---

### 1.3 AdminInstitutionsPage

- **Ruta:** `/admin/institutions`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminInstitutionsPage.tsx`
- **Refactored:** 2026-02-18 (Sprint 1) — extraído a `useInstitutionActions` + `InstitutionFormModals`

#### Componentes

| Componente | Path |
|---|---|
| AdminPageShell | `apps/frontend/src/apps/admin/components/shared` |
| DetectiveButton | `@shared/components/base/DetectiveButton` |
| InstitutionFilters | `../components/institutions/InstitutionFilters` |
| InstitutionsTable | `../components/institutions/InstitutionsTable` |
| InstitutionDetailModal | `../components/institutions/InstitutionDetailModal` |
| InstitutionStats | `../components/institutions/InstitutionStats` (dentro de InstitutionDetailModal) |
| InstitutionFormModals | `../components/institutions/InstitutionFormModals` |

#### Hooks

| Hook | Propósito |
|---|---|
| `useInstitutionActions` | Orquestación completa — estado de modales, CRUD, filtros, stats |
| `useOrganizations` | CRUD de organizaciones con React Query (consume `useInstitutionActions`) |

#### Árbol de componentes

```
AdminInstitutionsPage
├── AdminPageShell
│   └── [contenido principal]
│       ├── Header
│       ├── [Crear Organización button]
│       ├── [error banner - inst.error]
│       ├── [operationError banner - animate-fade-in]
│       ├── [operationSuccess banner - animate-fade-in]
│       ├── InstitutionFilters
│       │   ├── [search input]
│       │   └── [advanced filters: status multi-select, plan multi-select]
│       └── InstitutionsTable (role="region" aria-label aria-live="polite")
│           └── DataTable<Organization>
│               └── [columns: nombre+ID, plan badge, status badge, userCount, fecha, acciones (ver/editar/features)]
├── InstitutionDetailModal (Modal xl)
│   ├── [header: icono + nombre + badges]
│   ├── InstitutionStats (8 métricas: usuarios, ejercicios, progreso, XP, almacenamiento, actividad)
│   ├── [info contacto]
│   ├── [info suscripción]
│   ├── [features habilitadas]
│   └── [acciones: cerrar, gestionar features, editar]
└── InstitutionFormModals
    ├── [Modal crear]
    ├── [Modal editar]
    ├── [Modal features (feature flags)]
    └── ConfirmDialog (eliminar)
```

#### Flujo de datos

```
useInstitutionActions
  └── useOrganizations (React Query)
        ├── adminAPI.getOrganizations()  →  GET /admin/organizations?page&limit
        ├── adminAPI.createOrganization()  →  POST /admin/organizations
        ├── adminAPI.updateOrganization()  →  PATCH /admin/organizations/:id
        ├── adminAPI.deleteOrganization()  →  DELETE /admin/organizations/:id
        └── adminAPI.updateOrganizationFeatures()  →  PUT /admin/organizations/:id/features

filteredOrganizations = useMemo() sobre organizations[] aplicando filtros locales
  (búsqueda por nombre, filtro status[], filtro plan[])

loadOrganizationStats(orgId)
  └── getOrganizationStats(orgId)  →  GET /admin/organizations/:id/stats
      └── InstitutionStatsData → InstitutionDetailModal → InstitutionStats
```

#### Endpoints API

| Endpoint | Método | Propósito |
|---|---|---|
| `/admin/organizations` | GET | Listar organizaciones |
| `/admin/organizations` | POST | Crear organización |
| `/admin/organizations/:id` | PATCH | Actualizar organización |
| `/admin/organizations/:id` | DELETE | Eliminar organización |
| `/admin/organizations/:id/features` | PUT | Actualizar feature flags |
| `/admin/organizations/:id/stats` | GET | Estadísticas de la organización |

#### Estado

- React Query en `useOrganizations`: cache de lista de organizaciones
- `useState` local en `useInstitutionActions`: estados de modales, `selectedOrg`, `formData`, `filters`, `institutionStats`, `statsLoading`, `isSubmitting`, `operationError`, `operationSuccess`
- Filtrado hecho en cliente con `useMemo` (no re-fetching)
- Optimistic update para toggle de features: actualiza `selectedOrg.features` antes del request, rollback en error

#### Interacciones del usuario

1. **Cargar la página:** Auto-fetch de organizaciones al montar
2. **Buscar:** Input text → filtro local inmediato (sin debounce, sin API call)
3. **Filtrar por estado/plan:** Toggles multi-select → filtro local
4. **Limpiar filtros:** Botón → reset de filters
5. **Crear organización:** Botón → modal create → `name`, `slug` (opcional, auto-generado), `plan` → `POST /admin/organizations`
6. **Ver detalle:** Botón Eye → `InstitutionDetailModal` + carga stats desde API
7. **Editar:** Botón Edit → modal edit → `name`, `plan` → `PATCH /admin/organizations/:id`
8. **Gestionar features:** Botón Settings → modal features → checkboxes → `PUT /admin/organizations/:id/features`
9. **Eliminar:** Desde modal de detalle o tabla → `ConfirmDialog` → `DELETE /admin/organizations/:id`

#### Manejo de errores

- Error de carga: `inst.error` en banner `role="alert"`
- Error de operación: `inst.operationError` con `animate-fade-in` (auto-clear a los 5s via `clearMessages`)
- Success: `inst.operationSuccess` con `aria-live="polite"` (auto-clear a los 5s)
- `loadOrganizationStats`: error solo en `console.error` + `setOperationError` (correcto)
- Toggle feature: rollback optimista + `setOperationError`
- `InstitutionDetailModal`: usa `setTimeout 500ms` simulado si no hay stats (código legacy no eliminado)

#### Estado de carga

- `InstitutionsTable`: spinner de tabla completa cuando `inst.loading && !inst.organizations.length`
- `InstitutionStats`: skeletons de 4 cards con `animate-pulse`
- Botones en modales: texto "Creando..." / "Guardando..." cuando `isSubmitting`
- Botones deshabilitados (`disabled`) durante `isSubmitting`

#### Accesibilidad

- `InstitutionsTable` envuelta en `div role="region" aria-label="Tabla de organizaciones" aria-live="polite"` (correcto)
- Error banners con `role="alert"` (correcto)
- Success con `aria-live="polite"` (correcto)
- `InstitutionDetailModal`: usa el componente `Modal` que tiene manejo de `title=""` — el título del modal queda vacío (issue INST-04)
- Feature flags modal: checkboxes wrapeados en `label` con contenido (correcto)
- `InstitutionFormModals`: botones deshabilitados con `disabled` (correcto)

#### Responsividad

- Filtros: responsive (`flex gap-3`)
- `InstitutionsTable`: `DataTable` sin scroll horizontal declarado — misma situación que `UsersTable`
- `InstitutionDetailModal`: `md:grid-cols-2` para secciones de detalle
- `InstitutionStats`: `md:grid-cols-2 lg:grid-cols-4`

#### Issues detectados

| ID | Prioridad | Descripción |
|---|---|---|
| INST-01 | P1 | Filtrado completamente cliente-side. Con muchas organizaciones (>100), `GET /admin/organizations` carga todas en página 1 (limit: 20) pero `filteredOrganizations` filtra sobre ese subconjunto. Búsqueda no es global — no encuentra organizaciones en páginas 2+. |
| INST-02 | P1 | `useOrganizations.toggleFeature()` lanza si la org no está en el array local `organizations[]`. Esto puede fallar si `selectedOrg` fue cargada directamente (no de la lista paginada). |
| INST-03 | P1 | `InstitutionDetailModal` tiene un `setTimeout(500ms)` simulado en un `useEffect` para simular la carga de stats si `stats` es undefined. Este código simulado debería ser eliminado dado que `loadOrganizationStats` ya maneja el estado real. |
| INST-04 | P1 | `InstitutionDetailModal` usa `Modal isOpen={isOpen} onClose={onClose} title=""` — el `title` vacío hace que el modal no tenga nombre accesible. |
| INST-05 | P1 | `InstitutionStats` muestra 8 métricas pero `getOrganizationStats()` devuelve solo `totalStudents`, `activeStudents`, `averageProgress`, `storageUsed`, `lastActivity`. Los campos `totalExercises`, `completedExercises`, `totalXP` siempre mostrarán 0. |
| INST-06 | P2 | `useOrganizations.selectOrganization()` está declarada como `async` pero retorna `void` — TypeScript lo acepta pero el tipo de la interfaz dice `selectOrganization: (id: string | null) => void` (inconsistencia). |
| INST-07 | P2 | Error de creación/edición: `clearMessages()` usa `setTimeout(5000)` para limpiar `operationError` — si el usuario vuelve a intentar rápido, el timeout del intento anterior puede limpiar el error del segundo intento. |
| INST-08 | P3 | No hay paginación visible en la tabla de instituciones. `useOrganizations` gestiona `page`/`pageSize` internamente pero no hay controles en la UI. |

---

### 1.4 AdminClassroomTeacherPage

- **Ruta:** `/admin/classroom-teachers`
- **Archivo:** `apps/frontend/src/apps/admin/pages/AdminClassroomTeacherPage.tsx`
- **US:** US-AE-007

#### Componentes

| Componente | Path |
|---|---|
| AdminPageShell | `apps/frontend/src/apps/admin/components/shared` |
| ClassroomTeachersTab | `../components/classroom-teacher/ClassroomTeachersTab` |
| TeacherClassroomsTab | `../components/classroom-teacher/TeacherClassroomsTab` |

#### Hooks

| Hook | Propósito |
|---|---|
| `useClassroomTeacher` | React Query + mutaciones para asignaciones aula-docente |

#### Árbol de componentes

```
AdminClassroomTeacherPage
├── AdminPageShell
│   └── [contenido principal]
│       ├── Header
│       ├── [tab switcher con Framer Motion]
│       │   ├── [tab "Por Aula" - GraduationCap icon]
│       │   └── [tab "Por Docente" - Users icon]
│       └── [tab content con animación x-slide]
│           ├── ClassroomTeachersTab (currentTab === 'classroom')
│           │   ├── [formulario búsqueda por UUID de aula]
│           │   ├── [loading spinner]
│           │   ├── [error state]
│           │   ├── [classroom info card + teachersCount]
│           │   ├── [teachers grid md:grid-cols-2]
│           │   │   └── [motion.div] TeacherCard
│           │   │       ├── [nombre, email, fecha asignación]
│           │   │       ├── [copy ID button]
│           │   │       └── [remove button → confirm modal]
│           │   ├── [Asignar Docente modal - custom inline]
│           │   └── [Confirmar Remoción modal - custom inline]
│           └── TeacherClassroomsTab (currentTab === 'teacher')
│               ├── [formulario búsqueda por UUID de docente]
│               ├── [loading spinner]
│               ├── [error state]
│               ├── [teacher info card + classroomsCount]
│               ├── [classrooms grid md:grid-cols-2 lg:grid-cols-3]
│               │   └── [motion.div] ClassroomCard
│               │       ├── [nombre, grado, sección, fecha]
│               │       ├── [copy ID button]
│               │       └── [remove button → confirm modal]
│               ├── [Asignar Aulas modal - textarea CSV de UUIDs]
│               └── [Confirmar Remoción modal - custom inline]
```

#### Flujo de datos

```
useClassroomTeacher (hook factory que devuelve sub-queries y mutaciones)

Tab "Por Aula":
  useClassroomTeachers(classroomId, enabled)
    →  classroomTeacherApi.getClassroomTeachers(classroomId)
    →  GET /admin/classroom-teachers/classrooms/:classroomId/teachers
    →  ClassroomWithTeachers { name, grade, section, teachersCount, teachers[] }

  assignTeacherToClassroom.mutate({ classroomId, data: { teacherId } })
    →  POST /admin/classroom-teachers/classrooms/:classroomId/teachers
    →  invalidateQueries: classroomTeachers, teacherClassrooms, allAssignments

  removeTeacherFromClassroom.mutate({ classroomId, teacherId })
    →  DELETE /admin/classroom-teachers/classrooms/:classroomId/teachers/:teacherId
    →  invalidateQueries: classroomTeachers, teacherClassrooms, allAssignments

Tab "Por Docente":
  useTeacherClassrooms(teacherId, enabled)
    →  classroomTeacherApi.getTeacherClassrooms(teacherId)
    →  GET /admin/classroom-teachers/teachers/:teacherId/classrooms
    →  TeacherWithClassrooms { firstName, lastName, email, classroomsCount, classrooms[] }

  assignClassroomsToTeacher.mutate({ teacherId, data: { classroomIds: string[] } })
    →  POST /admin/classroom-teachers/teachers/:teacherId/classrooms
    →  invalidateQueries: teacherClassrooms, classroomTeachers (todos), allAssignments

  removeTeacherFromClassroom.mutate({ classroomId, teacherId })
    →  DELETE /admin/classroom-teachers/classrooms/:classroomId/teachers/:teacherId
```

#### Endpoints API

| Endpoint | Método | Propósito |
|---|---|---|
| `/admin/classroom-teachers/classrooms/:id/teachers` | GET | Teachers de un aula |
| `/admin/classroom-teachers/classrooms/:id/teachers` | POST | Asignar teacher a aula |
| `/admin/classroom-teachers/classrooms/:id/teachers/:teacherId` | DELETE | Remover teacher de aula |
| `/admin/classroom-teachers/teachers/:id/classrooms` | GET | Aulas de un teacher |
| `/admin/classroom-teachers/teachers/:id/classrooms` | POST | Asignar aulas a teacher |
| `/admin/classroom-teachers` | GET | Listar todas las asignaciones |
| `/admin/classroom-teachers/bulk` | POST | Asignación masiva |
| `/admin/classroom-teachers/classrooms` | GET | Lista de aulas para dropdown |
| `/admin/classroom-teachers/teachers` | GET | Lista de teachers para dropdown |

#### Estado

- React Query para todas las queries (cache 5 min)
- `useState` local en cada Tab: `classroomId/teacherId` (input), `searchedId` (triggerd), `showAssignModal`, `teacherToRemove/classroomToRemove`, `teacherIdToAssign/classroomIdsToAssign`, `copiedId`
- `currentTab` en page con `useState`

#### Interacciones del usuario

1. **Cambiar tab:** Click → animación Framer Motion (slide + spring)
2. **Tab "Por Aula":**
   - Ingresar UUID de aula → validación UUID regex → submit → `useClassroomTeachers(id, true)`
   - Ver lista de teachers asignados
   - Copiar ID de teacher al portapapeles
   - "Asignar Docente" → modal inline → ingresar UUID de teacher → `assignTeacherToClassroom.mutate()`
   - "Remover" teacher → confirm modal → `removeTeacherFromClassroom.mutate()`
3. **Tab "Por Docente":**
   - Ingresar UUID de docente → validación UUID regex → submit → `useTeacherClassrooms(id, true)`
   - Ver lista de aulas asignadas
   - Copiar ID de aula al portapapeles
   - "Asignar Aulas" → modal inline → textarea CSV de UUIDs → validación → `assignClassroomsToTeacher.mutate()`
   - "Remover" aula → confirm modal → `removeTeacherFromClassroom.mutate()`

#### Manejo de errores

- Error de query: banner con `AlertCircle` → mensaje de `error.response.data.message` o fallback genérico
- Validación UUID: `toast.error()` via `react-hot-toast` antes del submit
- Mutaciones: `onError` en `useClassroomTeacher` → `toast.error()` con mensaje del backend o fallback
- Mutaciones: `onSuccess` → `toast.success()` (mensajes en español — LOW-004 fix aplicado)
- Error de clipboard: `toast.error('Error al copiar ID')`

#### Estado de carga

- Query loading: spinner `Loader2 animate-spin` centrado en panel blanco
- Mutación assign: botón muestra `Loader2 animate-spin` + "Asignando..." (`isPending`)
- Mutación remove: botón muestra `Loader2 animate-spin` + "Removiendo..." (`isPending`)

#### Accesibilidad

- Tab switcher: `motion.button` sin `role="tab"`, `aria-selected`, `aria-controls` — no es un tab accesible (issue CT-04)
- Modales inline: `div.fixed.inset-0` sin trap focus, sin `role="dialog"`, sin `aria-modal`, sin `aria-labelledby` — accesibilidad pobre (issue CT-03)
- Formularios de búsqueda: inputs con `placeholder` pero sin `label` explícito — solo en contexto visual (issue CT-05)
- Botones de copy/remove: solo `title` attribute, sin `aria-label`
- Error states: `div` con texto — sin `role="alert"` o `aria-live`

#### Responsividad

- Tab switcher: `flex flex-wrap gap-3` (correcto para móvil)
- Teachers grid: `md:grid-cols-2`
- Classrooms grid: `md:grid-cols-2 lg:grid-cols-3`
- Modales inline: `max-w-md w-full` centrado

#### Issues detectados

| ID | Prioridad | Descripción |
|---|---|---|
| CT-01 | P1 | La UX de búsqueda por UUID raw es poco amigable para administradores. Requiere conocer el UUID exacto de un aula o docente. No hay búsqueda por nombre, ni dropdown, ni autocompletado. `useClassroomTeacher` expone `useClassroomsList` y `useTeachersList` que no se usan en la UI. |
| CT-02 | P1 | `bulkAssign` mutation en `useClassroomTeacher` no tiene UI — el endpoint `/admin/classroom-teachers/bulk` no es accesible desde ninguna pantalla. |
| CT-03 | P1 | Modales de asignación y confirmación implementados como `div.fixed` custom sin accesibilidad: falta `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, y trap de foco. Debería usar el componente `Modal` de shared. |
| CT-04 | P2 | Tab switcher no implementa el patrón ARIA tabs (`role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`). |
| CT-05 | P2 | Inputs de búsqueda sin `label` visible o `aria-label` — solo `placeholder` (inapropiado como alternativa accesible). |
| CT-06 | P2 | Error states sin `role="alert"` — los errores de query no serán anunciados por screen readers. |
| CT-07 | P2 | Tema visual inconsistente: `ClassroomTeachersTab` y `TeacherClassroomsTab` usan `bg-white` y `text-gray-900` (tema claro) en lugar del tema detective oscuro (`bg-detective-card`, `text-detective-text`). |
| CT-08 | P3 | `isValidUUID` duplicada en ambos tabs — debería extraerse a un utilitario compartido. |
| CT-09 | P3 | `copiedId` state reseteado con `setTimeout 2000ms` duplicado en ambos tabs. |

---

## 2. Catálogo de Componentes

| Componente | Path | Props principales | Propósito | Dependencias notables |
|---|---|---|---|---|
| `UsersStatsGrid` | `components/users/UsersStatsGrid.tsx` | `stats: {total, active, inactive, students, teachers, admins}` | Grid 6 columnas con conteos de usuarios | `DetectiveCard` |
| `UsersSearchFilters` | `components/users/UsersSearchFilters.tsx` | `searchTerm, onSearchChange, filters, onFiltersChange, onRefresh, onCreateUser, loading, organizations[], isLoadingOrganizations` | Barra de búsqueda + filtros + botones de acción | `DetectiveCard`, `DetectiveButton`, `UserAdvancedFilters` |
| `UserAdvancedFilters` | `components/users/UserAdvancedFilters.tsx` | `filters, onFiltersChange, organizations[], isLoadingOrganizations?` | Panel colapsable con filtros de organización y rango de fechas | `DetectiveButton` |
| `UsersTable` | `components/users/UsersTable.tsx` | `users[], loading, selectedUsers[], allUsersSelected, onSelectAll, onDeselectAll, onToggleSelection, onEdit, onSuspend, onUnsuspend, onDelete, currentPage, totalPages, totalUsers, onPrevPage, onNextPage` | Tabla de usuarios con selección, acciones y paginación | `DetectiveCard`, `DataTable`, `Pagination`, `EmptyState`, `RoleBadge`, `StatusBadge` |
| `UserBadges` | `components/users/UserBadges.tsx` | `role: string` / `status: string` | Badges de rol y estado del usuario | — |
| `UserDetailModal` | `components/users/UserDetailModal.tsx` | `user, isOpen, onClose, onUpdate?` | Modal de 3 tabs (Perfil, Actividad, Permisos) para editar y ver detalles | `Modal`, `ActivityTimeline`, Framer Motion |
| `CreateUserModal` | `components/users/CreateUserModal.tsx` | `isOpen, onClose, onSubmit, organizations[], isLoadingOrganizations?` | Modal de creación de usuario con resultado (contraseña temporal) | `Modal`, `DetectiveButton` |
| `BulkActionsPanel` | `components/users/BulkActionsPanel.tsx` | `selectedUsers[], users[], onClearSelection, onBulkSuspend, onBulkActivate, onBulkChangeRole, onBulkDelete, onExportCSV` | Panel flotante de acciones masivas con animación slide-up | Framer Motion, `Modal` |
| `RolesTable` | `components/roles/RolesTable.tsx` | `roles[], selectedRoleId, onSelectRole, loading?` | Lista de roles seleccionables con info de usuarios y badges de sistema | — |
| `RoleEditor` | `components/roles/RoleEditor.tsx` | `isOpen, rolePermissions, editingPermissions[], loading, saving, onTogglePermission, onSave, onClose` | Modal para editar permisos de un rol | `Modal`, `PermissionMatrix`, `Button`, `LoadingSpinner`, `EmptyState` |
| `RoleActionsMenu` | `components/roles/RoleActionsMenu.tsx` | `selectedRole, onEditPermissions, onRefresh?` | Menú de acciones para roles (Crear/Editar/Eliminar) con 2 pendientes | `DetectiveButton` |
| `PermissionMatrix` | `components/roles/PermissionMatrix.tsx` | `permissions[], onTogglePermission, disabled?` | Matrix de checkboxes de permisos agrupados por módulo | — |
| `InstitutionFilters` | `components/institutions/InstitutionFilters.tsx` | `onFilter, onReset?` | Búsqueda + filtros multi-select de estado/plan | `DetectiveButton` |
| `InstitutionsTable` | `components/institutions/InstitutionsTable.tsx` | `institutions[], loading?, onView?, onEdit?, onManageFeatures?` | Tabla de organizaciones con badges y acciones | `DataTable`, `EmptyState` |
| `InstitutionStats` | `components/institutions/InstitutionStats.tsx` | `stats: InstitutionStatsData \| null, loading?` | Grid de 8 métricas con barras de progreso | — |
| `InstitutionDetailModal` | `components/institutions/InstitutionDetailModal.tsx` | `isOpen, institution, stats?, loading?, onClose, onEdit?, onManageFeatures?` | Modal completo con stats, contacto, suscripción y features | `Modal`, `InstitutionStats`, `DetectiveButton` |
| `InstitutionFormModals` | `components/institutions/InstitutionFormModals.tsx` | `isCreateModalOpen, onCloseCreateModal, onCreateOrg, isEditModalOpen, ...` (14 props) | Container de 4 modales: crear, editar, features, confirmar borrado | `Modal`, `FormField`, `ConfirmDialog`, `DetectiveButton` |
| `ClassroomTeachersTab` | `components/classroom-teacher/ClassroomTeachersTab.tsx` | — (sin props) | Tab de búsqueda de aulas y gestión de docentes asignados | `useClassroomTeacher`, Framer Motion, `react-hot-toast` |
| `TeacherClassroomsTab` | `components/classroom-teacher/TeacherClassroomsTab.tsx` | — (sin props) | Tab de búsqueda de docentes y gestión de aulas asignadas | `useClassroomTeacher`, Framer Motion, `react-hot-toast` |

---

## 3. Análisis de Hooks

### 3.1 `useUserManagement`

- **Path:** `apps/frontend/src/apps/admin/hooks/useUserManagement.ts`
- **Migrado a React Query:** 2026-02-20
- **API calls:**
  - `adminAPI.getUsers(filters)` → `GET /admin/users`
  - `adminAPI.suspendUser(userId)` → `POST /admin/users/:id/suspend`
  - `adminAPI.unsuspendUser(userId)` → mutación
  - `adminAPI.deleteUser(userId)` → `DELETE /admin/users/:id`
  - `adminAPI.updateUser(userId, data)` → `PUT /admin/users/:id`
  - `apiClient.post('/admin/users', data)` → `POST /admin/users` (createUser)
  - `apiClient.post('/admin/users/bulk/suspend', { userIds })` → bulk suspend
  - `apiClient.post('/admin/users/bulk/delete', { userIds })` → bulk delete
  - `apiClient.post('/admin/users/bulk/update-role', { userIds, role })` → bulk role change
  - `apiClient.post(resetPassword(userId))` → reset password
- **Tipo de retorno:** `UseUserManagementResult` (26 campos)
- **Consumidores:** `AdminUsersPage`
- **Notas:** La query key incluye `filters` y `pagination` completos — cualquier cambio de filtro o página activa una nueva query. `loading` agrega el estado de todas las mutaciones. `fetchUsers` llama `usersQuery.refetch()` pero también acepta params para actualizar paginación.

---

### 3.2 `useUserActions`

- **Path:** `apps/frontend/src/apps/admin/hooks/useUserActions.ts`
- **API calls:** Ninguno directo — delega a los callbacks inyectados por `deps`
- **Tipo de retorno:** `UseUserActionsResult` (10 campos)
- **Consumidores:** `AdminUsersPage`
- **Notas:** Patrón de inyección de dependencias correcto. `handleBulkActivate` usa `Promise.all` con `unsuspendUser` individual en lugar de bulk endpoint. `handleExportCSV` usa `downloadCSV` utility (solo cliente).

---

### 3.3 `useCreateUserFlow`

- **Path:** `apps/frontend/src/apps/admin/hooks/useCreateUserFlow.ts`
- **Migrado a React Query:** 2026-02-20
- **API calls:**
  - `getOrganizations({ page: 1, limit: 100 })` → `GET /admin/organizations`
- **Tipo de retorno:** `{ isCreateModalOpen, organizations[], isLoadingOrganizations, openCreateModal, closeCreateModal, handleCreateUser }`
- **Consumidores:** `AdminUsersPage`
- **Notas:** Obtiene hasta 100 organizaciones para el select del modal. La query se refresca cada vez que se abre el modal.

---

### 3.4 `useRoles`

- **Path:** `apps/frontend/src/apps/admin/hooks/useRoles.ts`
- **Migrado a React Query:** 2026-02-20
- **API calls:**
  - `adminAPI.getRoles()` → `GET /admin/roles`
  - `adminAPI.getAvailablePermissions()` → `GET /admin/roles/permissions`
- **Tipo de retorno:** `UseRolesResult` (7 campos)
- **Consumidores:** `AdminRolesPage`
- **Notas:** Dos queries independientes que se combinan. `transformRole()` normaliza campos snake_case/camelCase del backend. `staleTime: SEMI_STATIC`.

---

### 3.5 `useRolePermissions`

- **Path:** `apps/frontend/src/apps/admin/hooks/useRolePermissions.ts`
- **Migrado a React Query:** 2026-02-20 (parcialmente — patrón antipatrón)
- **API calls:**
  - `adminAPI.getRolePermissions(roleId)` → `GET /admin/roles/:id/permissions`
  - `adminAPI.updateRolePermissions(roleId, permissions)` → `PUT /admin/roles/:id/permissions`
- **Tipo de retorno:** `UseRolePermissionsResult` (5 campos)
- **Consumidores:** `AdminRolesPage`
- **Notas críticas:** Hook usa un patrón no estándar. `fetchRolePermissions` es imperativo (no declarativo): hace la llamada directa y guarda en cache con `setQueryData`. La query inicial con key `__none__` nunca se ejecuta. El loading derivado de `activeRoleQuery.isLoading` es siempre `false`. `latestPermissions` se obtiene con `getQueriesData()` — si hay múltiples roles en cache, usa el último (correcto pero frágil).

---

### 3.6 `useInstitutionActions`

- **Path:** `apps/frontend/src/apps/admin/hooks/useInstitutionActions.ts`
- **API calls:** Delegados a `useOrganizations` y a `getOrganizationStats` directamente
  - `getOrganizationStats(orgId)` → `GET /admin/organizations/:id/stats`
- **Tipo de retorno:** Objeto con ~25 campos (estados, handlers, closers)
- **Consumidores:** `AdminInstitutionsPage`
- **Notas:** Agrega lógica de UI sobre `useOrganizations`. Gestiona filtrado cliente-side con `useMemo`. Optimistic update para `toggleFeature` con rollback.

---

### 3.7 `useOrganizations`

- **Path:** `apps/frontend/src/apps/admin/hooks/useOrganizations.ts`
- **Migrado a React Query:** 2026-02-20
- **API calls:**
  - `adminAPI.getOrganizations({ page, limit })` → `GET /admin/organizations`
  - `adminAPI.createOrganization(payload)` → `POST /admin/organizations`
  - `adminAPI.updateOrganization(id, data)` → `PATCH /admin/organizations/:id`
  - `adminAPI.deleteOrganization(id)` → `DELETE /admin/organizations/:id`
  - `adminAPI.updateOrganizationFeatures(id, features)` → `PUT /admin/organizations/:id/features`
  - `apiClient.patch(organizationSubscription(id), subscription)` → suscripción
  - `apiClient.get(organizationUsers(id), params)` → usuarios de org
- **Tipo de retorno:** `UseOrganizationsResult` (16 campos)
- **Consumidores:** `useInstitutionActions`, `useCreateUserFlow`
- **Notas:** `mapOrganization()` normaliza campos del backend (tier→plan, is_active→status, etc.). `selectOrganization` declarada como `async` pero el tipo dice `void`. `organizationUsers` se gestiona con estado local (no React Query).

---

### 3.8 `useClassroomTeacher`

- **Path:** `apps/frontend/src/apps/admin/hooks/useClassroomTeacher.ts`
- **API calls:**
  - `classroomTeacherApi.getClassroomTeachers(classroomId)` → `GET /admin/classroom-teachers/classrooms/:id/teachers`
  - `classroomTeacherApi.getTeacherClassrooms(teacherId)` → `GET /admin/classroom-teachers/teachers/:id/classrooms`
  - `classroomTeacherApi.listAllAssignments(query)` → `GET /admin/classroom-teachers`
  - `classroomTeacherApi.listClassroomsForDropdown(query)` → `GET /admin/classroom-teachers/classrooms`
  - `classroomTeacherApi.listTeachersForDropdown(query)` → `GET /admin/classroom-teachers/teachers`
  - `classroomTeacherApi.assignTeacherToClassroom(classroomId, data)` → `POST`
  - `classroomTeacherApi.removeTeacherFromClassroom(classroomId, teacherId)` → `DELETE`
  - `classroomTeacherApi.assignClassroomsToTeacher(teacherId, data)` → `POST`
  - `classroomTeacherApi.bulkAssign(data)` → `POST /admin/classroom-teachers/bulk`
- **Tipo de retorno:** `{ useClassroomTeachers, useTeacherClassrooms, useAllAssignments, useClassroomsList, useTeachersList, assignTeacherToClassroom, removeTeacherFromClassroom, assignClassroomsToTeacher, bulkAssign }`
- **Consumidores:** `ClassroomTeachersTab`, `TeacherClassroomsTab`
- **Notas:** Patrón de "hook que devuelve hooks" — `useClassroomTeachers` y `useTeacherClassrooms` son funciones que retornan queries de React Query. `bulkAssign` no tiene UI. `staleTime: 5 min`. Invalidación correcta de queries relacionadas al mutar.

---

### 3.9 `useClassroomsList`

- **Path:** `apps/frontend/src/apps/admin/hooks/useClassroomsList.ts`
- **API calls:**
  - `adminAPI.classrooms.getAll({ schoolId })` → lista de aulas
- **Tipo de retorno:** `UseClassroomsListReturn { classrooms[], isLoading, error, refetch }`
- **Consumidores:** Admin progress page selectors (no relacionado directamente a WS02)
- **Notas:** Este hook es de propósito diferente al de `useClassroomTeacher.useClassroomsList` — su nombre causa confusión. `gcTime: 10 min`, `refetchOnWindowFocus: false`.

---

## 4. Issues y Recomendaciones

### P0 - Críticos (requieren acción inmediata)

| ID | Página | Descripción | Impacto |
|---|---|---|---|
| ROL-01 | AdminRolesPage | `useRolePermissions` tiene patrón antipatrón: query `__none__` nunca ejecutada, `loading` siempre `false`, fetch imperativo fuera del ciclo React Query. | Causa ROL-02: modal puede abrir sin datos. Rompe DevTools de React Query. Dificulta testing. |

---

### P1 - Altos (resolver en sprint próximo)

| ID | Página | Descripción | Recomendación |
|---|---|---|---|
| USR-01 | AdminUsersPage | Stats calculadas sobre página actual (20 registros), no sobre el total real. | Obtener stats desde `GET /admin/users/stats` o incluirlas en la respuesta paginada del backend. |
| USR-02 | AdminUsersPage | `handleBulkActivate` hace N requests individuales en lugar de bulk. | Implementar `POST /admin/users/bulk/activate` en backend, o usar el endpoint bulk existente. |
| USR-03 | AdminUsersPage | Tab "Actividad" en `UserDetailModal` usa datos mock hardcoded. | Implementar `GET /admin/users/:id/activity` en backend y conectarlo. |
| USR-04 | AdminUsersPage | Tab "Permisos" en `UserDetailModal` no funcional. | Conectar con los permisos reales del rol del usuario via `GET /admin/roles/:id/permissions`. |
| ROL-02 | AdminRolesPage | Modal `RoleEditor` abre con `rolePermissions = null` mostrando empty state brevemente antes de cargar datos. | Resolver ROL-01 primero; usar `enabled` query con `selectedRoleId`. |
| ROL-03 | AdminRolesPage | Error al guardar permisos no se muestra en UI. | Añadir manejo de error en `handleSavePermissions` con toast o banner de error. |
| ROL-04 | AdminRolesPage | Crear y Eliminar roles deshabilitados (backend pendiente). | Implementar `POST /admin/roles` y `DELETE /admin/roles/:id` en backend. |
| INST-01 | AdminInstitutionsPage | Filtrado cliente-side no es global — no alcanza orgs en páginas 2+. | Mover filtros de búsqueda al backend: pasar `search`, `status`, `plan` como query params. |
| INST-03 | AdminInstitutionsPage | `setTimeout(500ms)` simulado en `InstitutionDetailModal.useEffect`. | Eliminar el `setTimeout` de simulación — `loadOrganizationStats` ya gestiona el estado correctamente. |
| INST-04 | AdminInstitutionsPage | `InstitutionDetailModal` con `title=""` no tiene nombre accesible. | Usar `aria-labelledby` apuntando al `h2` del modal. |
| INST-05 | AdminInstitutionsPage | `InstitutionStats` muestra 8 métricas pero backend devuelve solo 5 — 3 siempre en cero. | Alinear con backend: añadir `totalExercises`, `completedExercises`, `totalXP` a `GET /admin/organizations/:id/stats`. |
| CT-01 | AdminClassroomTeacherPage | UX de búsqueda por UUID raw — sin búsqueda por nombre ni dropdown. | Usar `useClassroomsList` y `useTeachersList` (ya implementados en el hook) para mostrar selects con búsqueda. |
| CT-03 | AdminClassroomTeacherPage | Modales inline sin accesibilidad (falta `role="dialog"`, trap de foco, `aria-labelledby`). | Reemplazar `div.fixed` custom con el componente `Modal` de shared. |

---

### P2 - Medios (deuda técnica a resolver)

| ID | Página | Descripción | Recomendación |
|---|---|---|---|
| USR-05 | AdminUsersPage | `BulkActionsPanel` no muestra feedback de errores en acciones masivas fallidas. | Añadir toast de error en `catch` del `executeAction`. |
| USR-06 | AdminUsersPage | Roles hardcoded incorrectos en `BulkActionsPanel.ConfirmationModal`. | Usar los roles reales del sistema: 'student', 'admin_teacher', 'super_admin'. |
| USR-07 | AdminUsersPage | Botones de tabla sin `aria-label`. | Añadir `aria-label` descriptivos (e.g., `aria-label="Editar usuario Juan Pérez"`). |
| USR-08 | AdminUsersPage | `useEffect` inicial duplica la query automática de React Query. | Eliminar el `useEffect(() => { mgmt.fetchUsers(); }, [mgmt.fetchUsers])`. |
| USR-09 | AdminUsersPage | Debounce manual con dos `useEffect` anidados. | Usar `useDeferredValue` de React 18 o hook `useDebounce` compartido. |
| USR-10 | AdminUsersPage | Campos `phone`, `department`, `position` en `UserDetailModal` no se envían al backend. | Eliminar campos o implementar el soporte en backend/DTO. |
| ROL-05 | AdminRolesPage | Parser de permisos silencia permisos del backend que no coinciden con listas hardcoded. | Hacer las listas de validación dinámicas o loggear advertencia en modo desarrollo. |
| ROL-07 | AdminRolesPage | Emojis en `PermissionMatrix` sin `aria-hidden`. | Añadir `aria-hidden="true"` al span de emoji. |
| ROL-08 | AdminRolesPage | Lista de roles sin paginación. | Añadir scroll o paginación si el número de roles crece. |
| INST-02 | AdminInstitutionsPage | `toggleFeature` puede fallar si la org no está en el array local paginado. | Cargar la org completa antes de hacer el toggle, o usar `getOrganization(id)`. |
| INST-06 | AdminInstitutionsPage | `selectOrganization` declarada como `async` con tipo `void`. | Corregir tipo a `Promise<void>` o hacer la función síncrona. |
| INST-07 | AdminInstitutionsPage | Race condition posible con `clearMessages setTimeout`. | Usar `useRef` para almacenar el timer y cancelar el anterior antes de crear uno nuevo. |
| INST-08 | AdminInstitutionsPage | Paginación de organizaciones sin controles de UI. | Añadir `Pagination` component al footer de `InstitutionsTable`. |
| CT-02 | AdminClassroomTeacherPage | `bulkAssign` mutation sin UI. | Añadir una sección de asignación masiva o eliminar la mutation del hook si no se usará. |
| CT-04 | AdminClassroomTeacherPage | Tab switcher no implementa patrón ARIA tabs. | Añadir `role="tablist"`, `role="tab"`, `aria-selected`, `aria-controls`. |
| CT-05 | AdminClassroomTeacherPage | Inputs de búsqueda sin label visible ni `aria-label`. | Añadir `label` o `aria-label` a los inputs. |
| CT-06 | AdminClassroomTeacherPage | Error states sin `role="alert"`. | Añadir `role="alert"` o `aria-live="assertive"` a los divs de error. |
| CT-07 | AdminClassroomTeacherPage | Inconsistencia de tema visual (claro vs detective oscuro). | Aplicar tokens de tema detective: `bg-detective-card`, `text-detective-text`. |

---

### P3 - Bajos (mejoras menores)

| ID | Página | Descripción | Recomendación |
|---|---|---|---|
| USR-11 | AdminUsersPage | `organizationName` se envía como string en lugar de `organizationId`. | Corregir el campo enviado al backend. |
| ROL-06 | AdminRolesPage | Panel derecho del grid solo como placeholder. | Mejorar con instrucciones claras o eliminar el col-span innecesario. |
| CT-08 | AdminClassroomTeacherPage | `isValidUUID` duplicada en ambos tabs. | Extraer a `@shared/utils/validation.ts`. |
| CT-09 | AdminClassroomTeacherPage | `copiedId setTimeout` duplicado. | Extraer a hook `useCopyToClipboard`. |

---

## 5. Cobertura de Documentación

### Documentado

| Documento | Cubre | Estado |
|---|---|---|
| `docs/30-ux-ui/flujos/admin/FLUJO-GESTION-USUARIOS-ROLES.md` (FL-ADM-01) | AdminUsersPage + AdminRolesPage — flujo completo, endpoints, DB, errores | Actualizado — incluye hooks extraídos en refactor 2026-02-18 |
| `docs/30-ux-ui/flujos/admin/FLUJO-INSTITUCIONES-ROLES.md` (FL-ADM-10) | AdminInstitutionsPage + AdminRolesPage (instituciones) — flujo, endpoints, DB, errores | Actualizado — incluye `useInstitutionActions` |
| `docs/60-portals/admin/PORTAL-ADMIN-GUIDE.md` | Portal admin general | Presente |

### No documentado / Gaps

| Área | Gap | Recomendación |
|---|---|---|
| `AdminClassroomTeacherPage` | No existe flujo dedicado `FL-ADM-XX` para asignaciones aula-docente. | Crear `FLUJO-AULA-DOCENTE.md` documentando el flujo US-AE-007. |
| `classroomTeacherApi.ts` | Sin documentación de los endpoints que consume. | Añadir al flujo de aula-docente o a `docs/40-api/`. |
| `useCreateUserFlow` | No documentado en ningún flujo existente (solo `useUserManagement` aparece). | Actualizar FL-ADM-01 para incluir este hook. |
| `BulkActionsPanel` | Documentado en FL-ADM-01 en la lista de componentes pero sin descripción funcional del flujo de acciones masivas. | Añadir diagrama de flujo de acciones masivas en FL-ADM-01. |
| Issues detectados (USR-01..11, ROL-01..08, INST-01..08, CT-01..09) | Ninguno está registrado como work item. | Crear items en backlog o como bugs. |
| `FeatureBadge variant="under-construction"` en AdminUsersPage | Indica funcionalidad en desarrollo — sin tracking de cuándo se completará. | Registrar en backlog como épica de "CRUD completo de usuarios". |

---

## 6. Resumen Ejecutivo

### Estado por página

| Página | Funcionalidad | API | Accesibilidad | UX | Deuda técnica |
|---|---|---|---|---|---|
| AdminUsersPage | 75% — CRUD funcional, bulk parcial, actividad/permisos pendientes | 85% — endpoints principales conectados | 60% — faltan aria-labels en tabla | 80% — filtros completos, debounce manual | Media — USR-01..11 |
| AdminRolesPage | 60% — solo editar permisos funcional, crear/eliminar pendientes | 70% — read+update OK, create/delete pendientes | 70% — regiones declaradas, emojis sin aria-hidden | 70% — UX clara pero panel derecho confuso | Alta — ROL-01 antipatrón crítico |
| AdminInstitutionsPage | 85% — CRUD completo, feature flags, stats parciales | 80% — 5/6 endpoints mapeados, stats incompletas | 65% — title vacío en modal | 75% — filtrado no global | Media — INST-01..08 |
| AdminClassroomTeacherPage | 70% — buscar+asignar+remover funcional, bulk sin UI | 80% — 5/9 endpoints usados en UI | 40% — modales custom sin accesibilidad | 50% — búsqueda por UUID requiere mejora | Alta — CT-01..09 |

### Issues totales: 29

- P0: 1 (ROL-01)
- P1: 13 (USR-01..04, ROL-02..04, INST-01,03..05, CT-01,03)
- P2: 13 (USR-05..10, ROL-05,07,08, INST-02,06..08, CT-02,04..07)
- P3: 5 (USR-11, ROL-06, CT-08,09, INST pendiente)
