# _MAP: EAI-001 - Fundamentos

**Épica:** EAI-001
**Nombre:** Fundamentos
**Fase:** 1 - Alcance Inicial
**Presupuesto:** $22,000 MXN
**Story Points:** 60 SP
**Estado:** ✅ Completado
**Sprint:** Mes 1, Semana 1-2
**Última actualización:** 2025-11-08

---

## 📋 Propósito

Establecer las bases técnicas y funcionales de la plataforma GAMILIT:
- Autenticación y autorización (JWT, OAuth, RBAC)
- Infraestructura base (DB, API, frontend)
- Perfiles de usuario básicos
- Dashboard principal
- Sistema de sesiones

---

## 📁 Contenido

### Requerimientos Funcionales (3)

| ID | Archivo | Título | Estado |
|----|---------|--------|--------|
| RF-AUTH-001 | [RF-AUTH-001-roles.md](./requerimientos/RF-AUTH-001-roles.md) | Sistema de Roles | ✅ |
| RF-AUTH-002 | [RF-AUTH-002-estados-cuenta.md](./requerimientos/RF-AUTH-002-estados-cuenta.md) | Estados de Cuenta | ✅ |
| RF-AUTH-003 | [RF-AUTH-003-oauth.md](./requerimientos/RF-AUTH-003-oauth.md) | OAuth Providers | ✅ |

### Especificaciones Técnicas (3)

| ID | Archivo | Título | RF | Estado |
|----|---------|--------|-------|--------|
| ET-AUTH-001 | [ET-AUTH-001-rbac.md](./especificaciones/ET-AUTH-001-rbac.md) | RBAC Implementation | RF-AUTH-001 | ✅ |
| ET-AUTH-002 | [ET-AUTH-002-estados-cuenta.md](./especificaciones/ET-AUTH-002-estados-cuenta.md) | Estados de Cuenta | RF-AUTH-002 | ✅ |
| ET-AUTH-003 | [ET-AUTH-003-oauth.md](./especificaciones/ET-AUTH-003-oauth.md) | OAuth Implementation | RF-AUTH-003 | ✅ |

### Historias de Usuario (8)

| ID | Archivo | Título | SP | Estado |
|----|---------|--------|----|--------|
| US-FUND-001 | [US-FUND-001-autenticacion-basica-jwt.md](./historias-usuario/US-FUND-001-autenticacion-basica-jwt.md) | Autenticación Básica JWT | 8 | ✅ |
| US-FUND-002 | [US-FUND-002-perfiles-usuario-basicos.md](./historias-usuario/US-FUND-002-perfiles-usuario-basicos.md) | Perfiles de Usuario Básicos | 5 | ✅ |
| US-FUND-003 | [US-FUND-003-dashboard-principal-estudiante.md](./historias-usuario/US-FUND-003-dashboard-principal-estudiante.md) | Dashboard Principal Estudiante | 8 | ✅ |
| US-FUND-004 | [US-FUND-004-infraestructura-tecnica-base.md](./historias-usuario/US-FUND-004-infraestructura-tecnica-base.md) | Infraestructura Técnica Base | 12 | ✅ |
| US-FUND-005 | [US-FUND-005-sistema-sesiones-estado.md](./historias-usuario/US-FUND-005-sistema-sesiones-estado.md) | Sistema de Sesiones y Estado | 6 | ✅ |
| US-FUND-006 | [US-FUND-006-api-restful-basica.md](./historias-usuario/US-FUND-006-api-restful-basica.md) | API RESTful Básica | 8 | ✅ |
| US-FUND-007 | [US-FUND-007-navegacion-routing.md](./historias-usuario/US-FUND-007-navegacion-routing.md) | Navegación y Routing | 5 | ✅ |
| US-FUND-008 | [US-FUND-008-ui-ux-base.md](./historias-usuario/US-FUND-008-ui-ux-base.md) | UI/UX Base | 8 | ✅ |

**Total Story Points:** 60 SP

### Implementación

📊 **Inventarios de trazabilidad:**
- [TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) - Matriz completa de trazabilidad
- [DATABASE.yml](./implementacion/DATABASE.yml) - Objetos de base de datos (pendiente)
- [BACKEND.yml](./implementacion/BACKEND.yml) - Módulos backend (pendiente)
- [FRONTEND.yml](./implementacion/FRONTEND.yml) - Componentes frontend (pendiente)

### Pruebas

📋 Documentación de testing (pendiente)

---

## 🔗 Referencias

- **README:** [README.md](./README.md) - Descripción detallada de la épica
- **Fase 1:** [../README.md](../README.md) - Información de la fase completa
- **Planificación original:** `docs_bkp/04-planificacion/01-alcance-inicial/EAI-001-fundamentos/`

---

## 📊 Métricas

| Métrica | Valor |
|---------|-------|
| **Presupuesto estimado** | $22,000 MXN |
| **Presupuesto real** | $23,100 MXN |
| **Varianza presupuesto** | +5% |
| **Story Points estimados** | 60 SP |
| **Story Points reales** | 63 SP |
| **Varianza SP** | +5% |
| **Duración estimada** | 10 días |
| **Duración real** | 11 días |
| **RF implementados** | 3/3 (100%) |
| **ET implementados** | 3/3 (100%) |
| **US completadas** | 8/8 (100%) |

---

## 🎯 Módulos Afectados

### Base de Datos
- **Schemas:** `auth`, `auth_management`, `public`
- **Tablas:** ~15 tablas de autenticación y perfiles
- **Funciones:** Funciones de RBAC, verificación de permisos

### Backend
- **Módulo:** `auth`
- **Path:** `apps/backend/src/modules/auth/`
- **Services:** AuthService, JwtService, OAuth Providers
- **Guards:** JwtAuthGuard, RolesGuard, PermissionsGuard

### Frontend
- **Features:** `auth`, `dashboard`
- **Path:** `apps/frontend/src/features/`
- **Componentes:** Login, Register, Dashboard, Profile
- **Guards:** AuthGuard, RoleGuard

---

**Generado:** 2025-11-08
**Mantenedores:** @tech-lead @backend-team @frontend-team @database-team
**Estado:** ✅ Migrado y consolidado
