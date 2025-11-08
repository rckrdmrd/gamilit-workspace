# HU-EP010-01: Gestión de Usuarios

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | HU-EP010-01 |
| **Épica** | EP010 - Admin Portal |
| **Título** | Gestión de Usuarios del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 20 SP |
| **Estado** | NOT STARTED |
| **Sprint** | Sprint 1 |
| **Duración Estimada** | 6 días |

---

## Historia de Usuario

**Como** super admin del sistema GAMILIT
**Quiero** gestionar usuarios del sistema (CRUD, suspender, activar, reset password, ver activity logs)
**Para** mantener control sobre accesos, seguridad, resolver problemas de usuarios y hacer cumplir políticas

---

## Endpoints API (10 endpoints)

1. **GET /api/admin/users** - Lista usuarios con filtros avanzados (role, status, org, search)
2. **GET /api/admin/users/:id** - Detalles completos de usuario
3. **PATCH /api/admin/users/:id** - Actualiza información del usuario
4. **DELETE /api/admin/users/:id** - Elimina usuario (soft delete)
5. **POST /api/admin/users/:id/suspend** - Suspende cuenta (violación de políticas)
6. **POST /api/admin/users/:id/unsuspend** - Remueve suspensión
7. **POST /api/admin/users/:id/activate** - Activa cuenta inactiva
8. **POST /api/admin/users/:id/deactivate** - Desactiva cuenta temporalmente
9. **POST /api/admin/users/:id/reset-password** - Fuerza reset de contraseña
10. **GET /api/admin/users/:id/activity** - Log de actividad del usuario (logins, actions)

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 30 req/min

---

## Criterios de Aceptación (Resumidos)

### Funcionales
- ✓ Listar usuarios con filtros: role, status, organization, search (name/email)
- ✓ Paginación: 10, 25, 50, 100 items
- ✓ Ver detalles: user info, organizations, roles, statistics
- ✓ Actualizar: name, email, profile (pero NO role, usar endpoint específico)
- ✓ Soft delete: is_active=false, preservar datos para audit
- ✓ Suspend: Bloquea login, requiere reason obligatorio
- ✓ Unsuspend: Permite login de nuevo
- ✓ Reset password: Genera token y envía email
- ✓ Activity log: Últimos 100 eventos (logins, actions, IP, user-agent)
- ✓ Audit logging: Todas las acciones se loguean en admin_audit_log

### No Funcionales
- ✓ Response time p95 <300ms
- ✓ Solo role='super_admin' puede acceder
- ✓ Rate limiting: 30 req/min
- ✓ Audit log automático en todas las acciones
- ✓ Test coverage >85%

---

## Definición de Hecho (DoD)

- [ ] 10 endpoints implementados
- [ ] Middleware requireSuperAdmin y auditAdminAction
- [ ] Frontend: UserList, UserDetails, Suspend/Activate modals
- [ ] Tests unitarios >85% coverage
- [ ] Tests E2E para flujos críticos (suspend, reset password)
- [ ] Audit logging funcionando
- [ ] Documentación API completa

---

**Referencia API:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2139-2149)
**Última actualización:** 2025-10-28
