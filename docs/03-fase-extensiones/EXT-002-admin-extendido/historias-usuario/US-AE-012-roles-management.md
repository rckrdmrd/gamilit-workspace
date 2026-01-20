---
id: "US-AE-012"
title: "Gestion de Roles y Permisos"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-002"
story_points: 6
budget: "$2,400 MXN"
sprint: "Sprint-2"
labels: ["admin-extendido", "roles-management", "permissions", "granular-access"]
created_date: "2025-10-28"
updated_date: "2026-01-20"
completed_date: "2025-11-24"
---

# US-AE-012: Gestion de Roles y Permisos

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | US-AE-012 |
| **Epica** | EXT-002 - Admin Extendido |
| **Titulo** | Gestion de Roles y Permisos |
| **Prioridad** | Alta (P1) |
| **Story Points** | 6 SP |
| **Estado** | Done |
| **Sprint** | Sprint 2 |
| **Duracion Estimada** | 2 dias |
| **Fecha Implementacion** | 2025-11-24 |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** gestionar roles del sistema y sus permisos granulares por modulo
**Para** controlar el acceso a funcionalidades de forma granular, mantener seguridad y cumplir con el principio de minimo privilegio

---

## Endpoints API (4 endpoints)

1. **GET /api/admin/roles** - Lista todos los roles del sistema con conteo de usuarios
2. **GET /api/admin/roles/permissions** - Lista todos los permisos disponibles organizados por categoria
3. **GET /api/admin/roles/:id/permissions** - Obtiene los permisos asignados a un rol especifico
4. **PUT /api/admin/roles/:id/permissions** - Actualiza los permisos de un rol especifico

**Guards:** `JwtAuthGuard` + `AdminGuard`
**Decorators:** `@ApiBearerAuth()`, `@CurrentUser()`

---

## Criterios de Aceptacion (Resumidos)

### Funcionales
- Listar todos los roles del sistema con conteo de usuarios asignados
- Ver permisos disponibles organizados por modulo (users, content, gamification, monitoring, system)
- Seleccionar un rol para ver sus permisos actuales
- Modificar permisos de un rol con toggle por permiso individual
- Roles de sistema (admin, super_admin) no pueden ser eliminados
- Guardar cambios de permisos con feedback visual de exito/error
- Actualizar lista de roles despues de cambios

### No Funcionales
- Response time p95 <300ms
- Solo usuarios con rol admin pueden acceder
- Audit logging automatico en cambios de permisos
- Validacion de inputs en togglePermission

---

## Definicion de Hecho (DoD)

- 4 endpoints implementados y documentados en Swagger
- Guards JwtAuthGuard y AdminGuard aplicados
- Frontend: RolesTable, RoleEditor, PermissionMatrix componentes
- Hook useRoles y useRolePermissions implementados
- Audit logging en cambios de permisos (FIX-2025-01-07 P0)
- Null checks y validaciones defensivas aplicadas (P2 Corrections 2025-11-26)
- Modularizacion en componentes (US-ADMIN-P2-001 Refactor 2025-12-05)

---

## Referencias de Implementacion

### Archivos Backend
- **Controller:** `apps/backend/src/modules/admin/controllers/admin-roles.controller.ts`
- **Service:** `apps/backend/src/modules/admin/services/admin-roles.service.ts`
- **DTOs:** `apps/backend/src/modules/admin/dto/roles/` (RoleDto, PermissionDto, UpdatePermissionsDto, RolePermissionsDto)
- **Guard:** `apps/backend/src/modules/admin/guards/admin.guard.ts`

### Archivos Frontend
- **Pagina:** `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx`
- **Hooks:** `apps/frontend/src/apps/admin/hooks/useRoles.ts`, `useRolePermissions.ts`
- **Componentes:** `apps/frontend/src/apps/admin/components/roles/` (RolesTable, RoleEditor, PermissionMatrix)
- **Types:** `apps/frontend/src/services/api/adminTypes.ts` (Permission type)

### Funcionalidades de la Pagina
- Lista de roles con seleccion interactiva
- Editor de permisos en modal/panel lateral
- Permisos agrupados por modulo
- Toggle individual de permisos
- Estados de carga y error manejados
- Mensajes de exito al guardar

---

## Trazabilidad

| Artefacto | Ubicacion |
|-----------|-----------|
| Controller | `apps/backend/src/modules/admin/controllers/admin-roles.controller.ts` |
| Pagina Frontend | `apps/frontend/src/apps/admin/pages/AdminRolesPage.tsx` |
| Historia de Usuario | `docs/03-fase-extensiones/EXT-002-admin-extendido/historias-usuario/US-AE-012-roles-management.md` |
| API Reference | `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` |

---

**Ultima actualizacion:** 2026-01-20
**Creacion original:** 2025-10-28
