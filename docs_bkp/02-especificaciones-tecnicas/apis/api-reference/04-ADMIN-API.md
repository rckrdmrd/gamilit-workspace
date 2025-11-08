# Admin API (Referencia)

**Proyecto:** Gamilit Platform
**Módulo:** API Reference
**Categoría:** Admin Portal
**Archivo original:** API-REFERENCE.md (líneas 2160-2331)
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Nota

La documentación completa del Admin API (31 endpoints, 100% documentado) se encuentra en el archivo original API-REFERENCE.md, líneas 2160-2331.

**Estructura:**
- **User Management (10 endpoints):** Lista, Detalles, Actualizar, Eliminar, Suspend, Unsuspend, Activate, Deactivate, Reset Password, Activity
- **Organizations (8 endpoints):** Lista, Detalles, Crear, Actualizar, Eliminar, Get Users, Update Subscription, Update Features
- **Content Management (6 endpoints):** Pending Exercises, Approve, Reject, Media Library, Delete Media, Create Version
- **System (7 endpoints):** Health, Users, Update Role, Update Status, Logs, Maintenance, Statistics

---

## Endpoints Principales

### User Management
- `GET /api/admin/users` - Lista usuarios con filtros avanzados
- `GET /api/admin/users/:id` - Detalles de usuario específico
- `PATCH /api/admin/users/:id` - Actualiza información de usuario
- `DELETE /api/admin/users/:id` - Elimina (soft delete) usuario
- `POST /api/admin/users/:id/suspend` - Suspende cuenta de usuario
- `POST /api/admin/users/:id/unsuspend` - Remueve suspensión
- `POST /api/admin/users/:id/activate` - Activa cuenta de usuario
- `POST /api/admin/users/:id/deactivate` - Desactiva cuenta de usuario
- `POST /api/admin/users/:id/reset-password` - Fuerza reset de contraseña
- `GET /api/admin/users/:id/activity` - Obtiene log de actividad de usuario

### Organizations
- `GET /api/admin/organizations` - Lista organizaciones
- `GET /api/admin/organizations/:id` - Detalles de organización
- `POST /api/admin/organizations` - Crea nueva organización
- `PUT /api/admin/organizations/:id` - Actualiza organización
- `DELETE /api/admin/organizations/:id` - Elimina organización
- `GET /api/admin/organizations/:id/users` - Lista usuarios de organización
- `PATCH /api/admin/organizations/:id/subscription` - Actualiza suscripción
- `PATCH /api/admin/organizations/:id/features` - Actualiza feature flags

### Content Management
- `GET /api/admin/content/exercises/pending` - Ejercicios pendientes de aprobación
- `POST /api/admin/content/exercises/:id/approve` - Aprueba ejercicio
- `POST /api/admin/content/exercises/:id/reject` - Rechaza ejercicio
- `GET /api/admin/content/media` - Lista archivos multimedia
- `DELETE /api/admin/content/media/:id` - Elimina archivo multimedia
- `POST /api/admin/content/version` - Crea versión de contenido

### System
- `GET /api/admin/system/health` - Métricas de salud del sistema
- `GET /api/admin/system/users` - Lista usuarios (endpoint alternativo)
- `PATCH /api/admin/system/users/:id/role` - Actualiza rol de usuario
- `PATCH /api/admin/system/users/:id/status` - Actualiza status de usuario
- `GET /api/admin/system/logs` - Obtiene logs del sistema
- `POST /api/admin/system/maintenance` - Activa/desactiva modo mantenimiento
- `GET /api/admin/system/statistics` - Estadísticas del sistema (dashboard)

---

## Características Comunes

**Autenticación:** Requiere rol `super_admin`

**Rate Limiting:** 30 requests/min

**Middleware:**
- `authenticateJWT`
- `requireSuperAdmin`
- `adminRateLimit`
- `auditAdminAction` (audit logging automático)

---

## Documentación Completa

> **Fuentes de requerimientos:**
> - [Admin Portal - Requerimientos](../../../01-requerimientos/admin-portal/) - Funcionalidades del portal de administración
> - [UC-ADM-001 - Gestión de Usuarios](../../../01-requerimientos/casos-uso/admin/UC-ADM-001-gestion-usuarios.md)
> - [RNF-SEC-003 - Control de Acceso Basado en Roles](../../../01-requerimientos/requerimientos-no-funcionales/RNF-SEC-003-rbac.md)

Ver archivo original: [API-REFERENCE.md](../API-REFERENCE.md) (líneas 2160-2331)

**Referencias relacionadas:**
- [TYPES-ADMIN.md](../../tipos-compartidos/TYPES-ADMIN.md) - Tipos TypeScript para Admin Portal
- [ET-AUTH-001 - RBAC](../../01-autenticacion-autorizacion/ET-AUTH-001-rbac.md) - Sistema de roles y permisos
- [Backend - API Admin](../../../03-desarrollo/backend/api/API-Admin.md) - Implementación de endpoints

---

**Última actualización:** 2025-11-01
**Mantenido por:** GAMILIT Platform Team
