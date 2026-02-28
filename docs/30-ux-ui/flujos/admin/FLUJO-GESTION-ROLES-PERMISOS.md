---
title: Gestion de Roles y Permisos
category: admin
id: FL-ADM-22
version: 1.0.0
last_updated: 2026-02-27
---

# FL-ADM-22 - Gestion de Roles y Permisos

**ID:** FL-ADM-22
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Admin
**Prioridad:** P1

---

## 1. Resumen

Flujo de la pagina `/admin/roles` donde el super_admin gestiona los roles del sistema y sus permisos. La pagina muestra todos los roles disponibles en la plataforma con su cantidad de usuarios asignados, y permite visualizar y editar la matriz de permisos de cada rol. Los permisos estan organizados por modulo: users, content, gamification, monitoring y system. Los roles del sistema (super_admin, admin_teacher, student, parent) no pueden ser eliminados. Todos los cambios de permisos son auditados registrando el ID del administrador. Esta funcionalidad es distinta de la asignacion de roles a usuarios especificos (FL-ADM-01).

---

## 2. Precondiciones

- Usuario autenticado con rol `super_admin`.
- Sesion activa con JWT valido.
- Al menos los roles del sistema pre-configurados.

---

## 3. Diagrama Mermaid

```mermaid
flowchart TD
    A[Admin navega a /admin/roles] --> B[AdminRolesPage monta]
    B --> C[useRoles hook]
    B --> D[GET /admin/roles]
    D --> E[RolesTable renderiza lista de roles]

    E --> F{Admin selecciona rol?}
    F -- Si --> G[useRolePermissions hook]
    G --> H[GET /admin/roles/:id/permissions]
    H --> I[PermissionMatrix renderiza permisos del rol]

    B --> J[GET /admin/roles/permissions]
    J --> K[Lista de todos los permisos disponibles por modulo]

    I --> L{Admin edita permisos?}
    L -- Toggle permiso --> M[Estado local: togglePermission(permissionId)]
    M --> N[PermissionMatrix actualiza checkbox visualmente]

    L -- Guardar cambios --> O[PUT /admin/roles/:id/permissions { permissions: string[] }]
    O --> P{Exito?}
    P -- Si --> Q[Toast exito + permisos actualizados]
    P -- Error --> R[Toast error + estado revertido]

    E --> S{Crear nuevo rol?}
    S -- Si --> T[RoleEditor formulario]
    T --> U[POST /admin/roles { name, description, permissions[] }]
    U --> V[Nuevo rol aparece en lista]

    E --> W{Eliminar rol?}
    W -- Rol del sistema --> X[Opcion deshabilitada - icono lock]
    W -- Rol personalizado --> Y[RoleActionsMenu -> DELETE /admin/roles/:id]
    Y --> Z[Rol eliminado]
```

---

## 4. Secuencia FE -> BE -> DB

```
=== Carga de roles ===
1. FE: AdminRolesPage monta -> useRoles hook
2. FE: GET /api/v1/admin/roles
3. BE: AdminRolesController.getRoles()
4. BE: AdminRolesService.getRoles() -> todos los roles con user count
5. DB: SELECT r.*, COUNT(ur.user_id) as user_count
        FROM auth_management.roles r
        LEFT JOIN auth_management.user_roles ur ON r.id = ur.role_id
        GROUP BY r.id
6. BE: Retorna RoleDto[] { roleId, roleName, description, isSystem, userCount, permissions[] }
7. FE: RolesTable renderiza cada rol con badge de usuarios

=== Carga de permisos disponibles ===
8. FE: GET /api/v1/admin/roles/permissions
9. BE: AdminRolesController.getAvailablePermissions()
10. BE: Retorna PermissionDto[] { permissionId, permissionKey, module, description }
        organizados por modulo: users/content/gamification/monitoring/system
11. FE: PermissionMatrix renderiza columnas por modulo

=== Ver permisos de un rol especifico ===
12. FE: Admin click en rol -> useRolePermissions(roleId)
13. FE: GET /api/v1/admin/roles/:id/permissions
14. BE: AdminRolesController.getRolePermissions(id)
15. BE: AdminRolesService.getRolePermissions(roleId)
16. DB: SELECT p.* FROM permissions p
        JOIN role_permissions rp ON p.id = rp.permission_id
        WHERE rp.role_id = :roleId
17. BE: Retorna RolePermissionsDto { role: RoleDto, permissions: PermissionDto[] }
18. FE: PermissionMatrix muestra checkboxes marcados para los permisos actuales

=== Editar permisos de un rol ===
19. FE: Admin toggle checkbox -> togglePermission(permissionId) - solo estado local
20. FE: Admin click "Guardar" -> PUT /api/v1/admin/roles/:id/permissions
        { permissions: ['perm_manage_users', 'perm_view_content', ...] }
21. BE: AdminRolesController.updateRolePermissions(id, updateDto, admin)
22. BE: AdminRolesService.updateRolePermissions(roleId, updateDto, admin)
23. BE: Registra en audit log: adminId + roleId + cambios de permisos
24. DB: DELETE FROM role_permissions WHERE role_id = :roleId
        INSERT INTO role_permissions (role_id, permission_id) VALUES (...)
25. BE: Retorna RolePermissionsDto actualizado
26. FE: Toast "Permisos actualizados exitosamente"

=== Crear nuevo rol ===
27. FE: Admin abre RoleEditor -> completa { name, description }
28. FE: POST /api/v1/admin/roles { name: 'coordinator', description: '...', permissions: [] }
29. BE: AdminRolesController.createRole(dto, admin)
30. BE: AdminRolesService.createRole(dto)
31. DB: INSERT INTO auth_management.roles (name, description, is_system, created_at)
32. BE: Retorna CreateRoleResponseDto { roleId, roleName, ... }
33. FE: Nuevo rol aparece en RolesTable

=== Eliminar rol personalizado ===
34. FE: Admin click eliminar en RoleActionsMenu (solo para !isSystem)
35. FE: DELETE /api/v1/admin/roles/:id
36. BE: AdminRolesService.deleteRole(roleId) -> verifica !isSystem y sin usuarios asignados
37. DB: DELETE FROM auth_management.roles WHERE id = :roleId AND is_system = false
38. BE: Retorna DeleteRoleResponseDto { message: '...' }
39. FE: Rol removido de la lista
```

---

## 5. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx` |
| Hook roles | `apps/frontend/src/apps/admin/hooks/useRoles.ts` |
| Hook permisos | `apps/frontend/src/apps/admin/hooks/useRolePermissions.ts` |
| Componente tabla | `apps/frontend/src/apps/admin/components/roles/RolesTable.tsx` |
| Componente editor | `apps/frontend/src/apps/admin/components/roles/RoleEditor.tsx` |
| Componente menu | `apps/frontend/src/apps/admin/components/roles/RoleActionsMenu.tsx` |
| Tipos | `apps/frontend/src/services/api/adminTypes.ts` |
| Layout | `apps/frontend/src/apps/admin/components/shared/AdminPageShell.tsx` |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller | `apps/backend/src/modules/admin/controllers/admin-roles.controller.ts` |
| Service | `apps/backend/src/modules/admin/services/admin-roles.service.ts` |
| DTOs roles | `apps/backend/src/modules/admin/dto/roles/` |
| Decorator | `apps/backend/src/shared/decorators/current-user.decorator.ts` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla roles | `apps/database/ddl/schemas/auth_management/tables/` (roles table) |
| Tabla user_roles | `apps/database/ddl/schemas/auth_management/tables/` (user_roles) |
| Tabla permissions | `apps/database/ddl/schemas/auth_management/tables/` (permissions, role_permissions) |

---

## 6. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Solo super_admin | BE | JwtAuthGuard + AdminGuard |
| Roles del sistema no eliminables | BE | isSystem=true bloquea DELETE |
| Auditoria de cambios de permisos | BE | CurrentUser decorator captura adminId |
| Edicion optimistica en FE | FE | Checkboxes se actualizan localmente, PUT al guardar |
| Permisos organizados por modulo | FE | groupPermissionsByModule helper |
| UUID validos en params | BE | ParseUUIDPipe no usado aqui - roles usan string IDs |

---

## 7. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Rol insuficiente | BE | 403 | ForbiddenException |
| Rol no encontrado | BE | 404 | NotFoundException |
| Intentar eliminar rol del sistema | BE | 400 | "Cannot delete system role" |
| Error al actualizar permisos | BE | 500 | Revierte cambios visuales, toast error |
| Rol con usuarios asignados | BE | 400 | "Role has active users" al intentar eliminar |

---

## 8. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx` | CRUD de roles y permisos |
| Frontend Hook | `apps/frontend/src/apps/admin/hooks/useRoles.ts` | Carga y estado de roles |
| Frontend Hook | `apps/frontend/src/apps/admin/hooks/useRolePermissions.ts` | Permisos por rol |
| Backend Controller | `apps/backend/src/modules/admin/controllers/admin-roles.controller.ts` | 6 endpoints roles |
| Backend Service | `apps/backend/src/modules/admin/services/admin-roles.service.ts` | Logica de roles |

---

## 9. Referencias

- Flujo gestion usuarios: [FL-ADM-01](./FLUJO-GESTION-USUARIOS-ROLES.md)
- Flujo audit logs: [FL-ADM-06](./FLUJO-AUDIT-LOGS.md)
- Flujo configuracion sistema: [FL-ADM-12](./FLUJO-CONFIGURACION-AJUSTES.md)
