# _MAP: docs/02-especificaciones-tecnicas/01-autenticacion-autorizacion/

**Última actualización:** 2025-11-07
**Propósito:** Especificaciones técnicas de autenticación, autorización y seguridad
**Audiencia:** Desarrolladores Backend/Frontend, Security Engineers, Tech Leads
**Estado:** 🟢 Completo

---

## 📁 Contenido de esta Carpeta

### Especificaciones Técnicas

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| ET-AUTH-001 | RBAC (Control de Acceso Basado en Roles) | [ET-AUTH-001-rbac.md](./ET-AUTH-001-rbac.md) | ✅ Implementado | Alta |
| ET-AUTH-002 | Estados de Cuenta de Usuario | [ET-AUTH-002-estados-cuenta.md](./ET-AUTH-002-estados-cuenta.md) | ✅ Implementado | Alta |
| ET-AUTH-003 | OAuth y Autenticación Social | [ET-AUTH-003-oauth.md](./ET-AUTH-003-oauth.md) | 🟡 En desarrollo | Media |

**Total especificaciones:** 3

---

## 🔗 Interdependencias

### Requerimientos Relacionados

**Implementa:**
- [RF-AUTH-001: Roles de Usuario](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-001-roles.md)
- [RF-AUTH-002: Estados de Cuenta](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-002-estados-cuenta.md)
- [RF-AUTH-003: OAuth](../../01-requerimientos/01-autenticacion-autorizacion/RF-AUTH-003-oauth.md)

### Módulos Relacionados

**Usado por:**
- Todos los módulos - Sistema transversal de autenticación y autorización

### Documentación Relacionada

**Desarrollo:**
- Backend: `apps/backend/src/modules/auth/`
- Frontend: `apps/frontend/src/features/auth/`

**Database:**
- Schema: `auth_management` → `apps/database/ddl/schemas/auth_management/`
- Schema: `auth` → `apps/database/ddl/schemas/auth/` (Supabase)

**ADRs:**
- [ADR-005: Multi-tenancy Implementation](../adr/ADR-005-multi-tenancy-implementation.md)

---

## 📊 Métricas

- **Total documentos:** 3
- **ETs completas:** 3/3 (100%)
- **Cobertura implementación:** 90% (OAuth pendiente completar)

---

## 🎯 Especificaciones Clave

### ET-AUTH-001: RBAC ⭐⭐⭐⭐⭐

**Calidad:** Excelente - Tiene referencias completas

**Cubre:**
- 3 roles: `student`, `admin_teacher`, `super_admin`
- Permisos granulares por recurso
- Guards de autorización en backend
- Row Level Security (RLS) policies en database
- Componentes de autorización en frontend

**Implementación:**
- ENUM: `apps/database/ddl/00-prerequisites.sql:30-32` (`auth_management.gamilit_role`)
- Guard: `apps/backend/src/shared/guards/roles.guard.ts`
- Decorator: `@Roles(...)`

### ET-AUTH-002: Estados de Cuenta ⭐⭐⭐⭐⭐

**Cubre:**
- Estados: `active`, `inactive`, `suspended`, `pending_verification`
- Transiciones de estado permitidas
- Validaciones en backend
- UI de estados en frontend

**Implementación:**
- ENUM: `apps/database/ddl/00-prerequisites.sql` (`auth_management.user_status`)
- Service: `apps/backend/src/modules/auth/services/user-status.service.ts`

### ET-AUTH-003: OAuth ⭐⭐⭐

**Cubre:**
- Providers: Google, Microsoft (planeado)
- Flujo OAuth 2.0
- Vinculación de cuentas
- Sincronización de perfiles

**Estado:** 80% implementado (Google funcional, Microsoft pendiente)

---

## 🚀 Próximos Pasos

### En Desarrollo
- [ ] Completar OAuth con Microsoft (ET-AUTH-003)
- [ ] Implementar MFA (Multi-Factor Authentication)

### Planeado (Futuras Extensiones)
- [ ] ET-AUTH-004: Multi-tenancy (ya existe ADR-005)
- [ ] ET-AUTH-005: Session Management
- [ ] ET-AUTH-006: Password Policies
- [ ] ET-AUTH-007: API Key Authentication (para integraciones)

---

## 🔒 Consideraciones de Seguridad

**Implementadas:**
- ✅ JWT tokens con expiración
- ✅ Refresh tokens
- ✅ Password hashing (bcrypt)
- ✅ HTTPS obligatorio
- ✅ CORS configurado
- ✅ Rate limiting en endpoints de auth

**Pendientes:**
- ⚪ MFA obligatorio para admin_teacher y super_admin
- ⚪ Detección de anomalías en login
- ⚪ Password rotation policies

---

## 📚 Guía de Navegación

**Si buscas...**
- **RBAC y permisos:** Ver [ET-AUTH-001-rbac.md](./ET-AUTH-001-rbac.md)
- **Estados de cuenta:** Ver [ET-AUTH-002-estados-cuenta.md](./ET-AUTH-002-estados-cuenta.md)
- **OAuth:** Ver [ET-AUTH-003-oauth.md](./ET-AUTH-003-oauth.md)
- **Multi-tenancy:** Ver [ADR-005](../adr/ADR-005-multi-tenancy-implementation.md)
- **Implementación backend:** Ver `apps/backend/src/modules/auth/`
- **Database schema:** Ver `apps/database/ddl/schemas/auth_management/`
