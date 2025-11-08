# _MAP: docs/01-requerimientos/admin-portal/

**Última actualización:** 2025-11-07
**Propósito:** Requerimientos funcionales del portal de administración (gestión de usuarios, organizaciones, contenido, sistema)
**Audiencia:** Product Owners, Desarrolladores Full-Stack, Administradores del Sistema
**Estado:** 🟡 En desarrollo activo

---

## 📁 Contenido de esta Carpeta

### Documentos Principales

| Documento | Descripción | Estado | Prioridad |
|-----------|-------------|--------|-----------|
| [REQUERIMIENTOS-ADMIN-PORTAL.md](./REQUERIMIENTOS-ADMIN-PORTAL.md) | Documento consolidado de requerimientos | ✅ Completo | Alta |

### Requerimientos Funcionales

| ID | Título | Archivo | Estado | Prioridad |
|----|--------|---------|--------|-----------|
| REQ-ADMIN-001 | Gestión de Usuarios | [REQ-ADMIN-USUARIOS.md](./REQ-ADMIN-USUARIOS.md) | ✅ Implementado | Alta |
| REQ-ADMIN-002 | Gestión de Organizaciones | [REQ-ADMIN-ORGANIZACIONES.md](./REQ-ADMIN-ORGANIZACIONES.md) | ✅ Implementado | Alta |
| REQ-ADMIN-003 | Gestión de Contenido Educativo | [REQ-ADMIN-CONTENIDO.md](./REQ-ADMIN-CONTENIDO.md) | 🟡 En desarrollo | Alta |
| REQ-ADMIN-004 | Configuración del Sistema | [REQ-ADMIN-SISTEMA.md](./REQ-ADMIN-SISTEMA.md) | 🟡 En desarrollo | Media |

**Total requerimientos:** 4

---

## 🔗 Interdependencias

### Módulos Relacionados

**Depende de:**
- [01-autenticacion-autorizacion](../01-autenticacion-autorizacion/) - Rol `super_admin`, permisos granulares
- [08-auditoria-configuracion](../08-auditoria-configuracion/) - Logging de acciones administrativas
- [03-contenido-educativo](../03-contenido-educativo/) - Contenido que se gestiona

**Usado por:**
- Super Admins (usuarios finales con máximos privilegios)
- Organization Admins (gestión limitada a su organización)

### Documentación Relacionada

**Especificaciones Técnicas:**
- [APIs Admin Portal](../../02-especificaciones-tecnicas/apis/ADMIN-PORTAL-API.md)
- [RBAC](../../02-especificaciones-tecnicas/01-autenticacion-autorizacion/ET-AUTH-001-rbac.md)
- [Multi-tenancy](../../02-especificaciones-tecnicas/adr/ADR-005-multi-tenancy-implementation.md)

**Desarrollo:**
- Backend: `apps/backend/src/modules/admin/`
- Frontend: `apps/frontend/src/features/admin/`

**Database:**
- Schema: `auth_management` (tenants, profiles, roles)
- Schema: `system_configuration` (feature_flags, system_settings)
- Schema: `audit_logging` (audit_logs)

---

## 📊 Métricas

- **Total documentos:** 5
- **RFs completos:** 2/4 (50%)
- **RFs implementados:** 2/4 (50%)
- **Cobertura implementación:** 65%

---

## 🎯 Funcionalidades Clave del Portal

### 1. Gestión de Usuarios (REQ-ADMIN-001)
- CRUD de usuarios (estudiantes, maestros, admins)
- Asignación de roles y permisos
- Activar/desactivar cuentas
- Reset de contraseñas
- Impersonación de usuarios (para soporte)

### 2. Gestión de Organizaciones (REQ-ADMIN-002)
- CRUD de organizaciones/tenants
- Configuración de planes y límites
- Asignación de organization admins
- Estadísticas por organización
- Facturación y suscripciones (futuro)

### 3. Gestión de Contenido Educativo (REQ-ADMIN-003) 🟡
- Aprobar/rechazar contenido de maestros
- Crear contenido global (disponible para todos)
- Gestión de banco de ejercicios
- Moderación de contenido
- Etiquetado y categorización

### 4. Configuración del Sistema (REQ-ADMIN-004) 🟡
- Feature flags (activar/desactivar funcionalidades)
- Configuración de gamificación global
- Parámetros del sistema (límites, timeouts)
- Mantenimiento (modo mantenimiento)
- Logs del sistema

---

## 🚀 Próximos Pasos

### En Desarrollo
- [ ] Completar gestión de contenido educativo (REQ-ADMIN-003)
- [ ] Completar configuración del sistema (REQ-ADMIN-004)
- [ ] Agregar referencias a implementación en todos los documentos

### Planeado (Futuras Extensiones)
- [ ] REQ-ADMIN-005: Dashboard de Métricas del Sistema
- [ ] REQ-ADMIN-006: Gestión de Facturación y Suscripciones
- [ ] REQ-ADMIN-007: Sistema de Soporte Integrado
- [ ] REQ-ADMIN-008: Gestión de Notificaciones Globales

---

## ⚠️ Issues Conocidos

### P0 (Crítico)
- [ ] Todos los documentos necesitan sección "Referencias a Implementación"

### P1 (Alto)
- [ ] REQ-ADMIN-CONTENIDO.md - En desarrollo, funcionalidades incompletas
- [ ] REQ-ADMIN-SISTEMA.md - Feature flags implementado, faltan otras configs
- [ ] Falta documentación de permisos granulares por acción

### P2 (Medio)
- [ ] Falta wireframes del admin portal
- [ ] Falta documentación de auditoría de acciones administrativas

---

## 🔒 Consideraciones de Seguridad

### Autenticación y Autorización
- **Solo rol `super_admin`** tiene acceso completo
- **Organization admins** tienen acceso limitado a su organización
- **MFA obligatorio** para todos los administradores
- **Audit logging** de todas las acciones administrativas

### Permisos Críticos
- Eliminar usuarios → Requiere confirmación + MFA
- Modificar roles → Auditoría obligatoria
- Cambiar feature flags → Solo super_admin
- Impersonar usuarios → Logged y limitado en tiempo

---

## 📚 Guía de Navegación

**Si buscas...**
- **Requerimientos consolidados:** Ver [REQUERIMIENTOS-ADMIN-PORTAL.md](./REQUERIMIENTOS-ADMIN-PORTAL.md)
- **Gestión de usuarios:** Ver [REQ-ADMIN-USUARIOS.md](./REQ-ADMIN-USUARIOS.md)
- **Multi-tenancy:** Ver [REQ-ADMIN-ORGANIZACIONES.md](./REQ-ADMIN-ORGANIZACIONES.md)
- **Implementación backend:** Ver `apps/backend/src/modules/admin/` (agregar referencias)
- **Implementación frontend:** Ver `apps/frontend/src/features/admin/` (agregar referencias)
