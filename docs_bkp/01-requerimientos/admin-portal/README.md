# Requerimientos - Admin Portal

**Proyecto:** Gamilit Platform
**Épica:** EP010 - Admin Portal
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01
**Estado:** APROBADO

---

## Índice General

Este directorio contiene los requerimientos del Admin Portal de la plataforma GAMILIT, modularizados por funcionalidad para facilitar su lectura y mantenimiento.

### Documentos Modulares

1. **[REQ-ADMIN-USUARIOS.md](./REQ-ADMIN-USUARIOS.md)** (175 líneas)
   - Gestión de Usuarios (HU-EP010-01)
   - CRUD de usuarios, suspensiones, activaciones, reset de passwords
   - Log de actividad de usuarios
   - 10 endpoints API

2. **[REQ-ADMIN-ORGANIZACIONES.md](./REQ-ADMIN-ORGANIZACIONES.md)** (156 líneas)
   - Gestión de Organizaciones (HU-EP010-02)
   - CRUD de organizaciones/escuelas
   - Gestión de subscripciones y feature flags
   - 8 endpoints API

3. **[REQ-ADMIN-CONTENIDO.md](./REQ-ADMIN-CONTENIDO.md)** (130 líneas)
   - Gestión de Contenido (HU-EP010-03)
   - Moderación de contenido (aprobar/rechazar ejercicios)
   - Gestión de archivos multimedia
   - Versionamiento de contenido
   - 6 endpoints API

4. **[REQ-ADMIN-SISTEMA.md](./REQ-ADMIN-SISTEMA.md)** (377 líneas)
   - Monitoreo y Sistema (HU-EP010-04)
   - Health checks, logs del sistema, estadísticas
   - Modo de mantenimiento
   - Actualización de roles y status
   - Requerimientos No Funcionales (Seguridad, Performance, Confiabilidad)
   - 7 endpoints API

---

## Visión General del Portal

### Propósito
El Admin Portal es el módulo crítico de administración del sistema GAMILIT que permite a super admins gestionar todos los aspectos operativos de la plataforma: usuarios, organizaciones, contenido y monitoreo del sistema.

### Alcance

| Aspecto | Descripción |
|---------|-------------|
| **Épica** | EP010 - Admin Portal |
| **Story Points** | 70 SP |
| **Endpoints** | 31 endpoints |
| **Historias de Usuario** | 4 historias (HU-EP010-01 a HU-EP010-04) |
| **Duración Estimada** | 2.5 semanas (5 sprints) |
| **Prioridad** | Alta (P1) - Crítico para operaciones |

### Objetivos de Negocio

1. **Control Total de Usuarios:** Gestionar CRUD, suspensiones, activaciones, reset de passwords y auditoría de actividad de usuarios
2. **Gestión Institucional:** Administrar organizaciones/escuelas, subscripciones, feature flags y límites de usuarios
3. **Moderación de Contenido:** Revisar, aprobar y rechazar contenido creado por profesores/comunidad para mantener calidad
4. **Monitoreo Operacional:** Supervisar salud del sistema, logs, estadísticas y modo de mantenimiento

### Valor de Negocio

- **Impacto:** CRÍTICO - Sin Admin Portal no hay forma de gestionar usuarios, organizaciones ni monitorear el sistema
- **ROI Estimado:** Muy Alto - Reduce tiempo de administración manual en 95%
- **Usuarios Afectados:** Super admins (rol crítico para operaciones)
- **Cobertura:** Esta épica cubre 31 endpoints de administración documentados en Fase 2

---

## Resumen de Endpoints por Módulo

### User Management (10 endpoints)
1. GET /api/admin/users
2. GET /api/admin/users/:id
3. PATCH /api/admin/users/:id
4. DELETE /api/admin/users/:id
5. POST /api/admin/users/:id/suspend
6. POST /api/admin/users/:id/unsuspend
7. POST /api/admin/users/:id/activate
8. POST /api/admin/users/:id/deactivate
9. POST /api/admin/users/:id/reset-password
10. GET /api/admin/users/:id/activity

### Organization Management (8 endpoints)
1. GET /api/admin/organizations
2. GET /api/admin/organizations/:id
3. POST /api/admin/organizations
4. PUT /api/admin/organizations/:id
5. DELETE /api/admin/organizations/:id
6. GET /api/admin/organizations/:id/users
7. PATCH /api/admin/organizations/:id/subscription
8. PATCH /api/admin/organizations/:id/features

### Content Management (6 endpoints)
1. GET /api/admin/content/exercises/pending
2. POST /api/admin/content/exercises/:id/approve
3. POST /api/admin/content/exercises/:id/reject
4. GET /api/admin/content/media
5. DELETE /api/admin/content/media/:id
6. POST /api/admin/content/version

### System Monitoring (7 endpoints)
1. GET /api/admin/system/health
2. GET /api/admin/system/users
3. PATCH /api/admin/system/users/:id/role
4. PATCH /api/admin/system/users/:id/status
5. GET /api/admin/system/logs
6. POST /api/admin/system/maintenance
7. GET /api/admin/system/statistics

**Total:** 31 endpoints

---

## Matriz de Permisos por Rol

| Categoría | super_admin | content_moderator | system_operator | admin | teacher | student |
|-----------|-------------|-------------------|-----------------|-------|---------|---------|
| **User Management** | ✓ Completo | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Organization Management** | ✓ Completo | ✗ | ✗ | ✗ | ✗ | ✗ |
| **Content Management** | ✓ Completo | ✓ Limitado | ✗ | ✗ | ✗ | ✗ |
| **System Monitoring** | ✓ Completo | ✗ | ✓ Limitado | ✗ | ✗ | ✗ |
| **Audit Logs** | ✓ Completo | ✗ | ✗ | ✗ | ✗ | ✗ |

### Notas sobre Roles
- **super_admin:** Acceso completo a todas las funciones del Admin Portal
- **content_moderator:** Solo acceso a Content Management (aprobar/rechazar contenido)
- **system_operator:** Solo acceso a System Monitoring (health, logs, maintenance)
- **admin, teacher, student:** Sin acceso al Admin Portal

---

## Middleware Stack

Todos los endpoints admin utilizan el siguiente middleware stack:

```typescript
[
  authenticateJWT,        // Verifica JWT válido
  requireSuperAdmin,      // Verifica role = 'super_admin'
  adminRateLimit,         // 30 req/min
  auditAdminAction        // Log automático de acción
]
```

---

## Requerimientos No Funcionales Críticos

### Seguridad
- **Autenticación:** Solo usuarios con rol 'super_admin' pueden acceder
- **Rate Limiting:** 30 requests por minuto por super_admin
- **Audit Logging:** Todas las acciones se registran automáticamente en admin_audit_log
- **Input Validation:** Validación exhaustiva con Joi/Zod
- **IP Whitelisting:** Opcional, restringir acceso a IPs específicas

### Performance
- Response time promedio: < 150ms
- Response time p95: < 300ms
- Health endpoint: < 200ms
- Paginación obligatoria: límite máximo 100 items
- Cache: Statistics (5 min), Organization details (10 min), User details (5 min)

### Confiabilidad
- Uptime: > 99.9%
- Error rate: < 0.05%
- Backup diario de base de datos
- Retention de audit logs: 2 años mínimo
- Monitoring 24/7 con alertas automáticas

---

## Reglas de Negocio Principales

### Gestión de Usuarios
- Suspensión requiere reason (mínimo 10 caracteres)
- Eliminación es soft delete (preservar datos para auditoría)
- Reset de password genera token válido por 24 horas
- Todas las acciones invalidan sesiones activas del usuario afectado

### Gestión de Organizaciones
- **Subscription Tiers:**
  - free: max_users = 20, no features
  - basic: max_users = 100, advanced_analytics
  - premium: max_users = 500, advanced_analytics + api_access + custom_branding
  - enterprise: max_users = ilimitado, todas las features
- Feature flags se actualizan automáticamente al cambiar tier
- No superar max_users del tier actual

### Gestión de Contenido
- Contenido de profesores en status 'pending' hasta aprobación
- Rejection_reason obligatorio al rechazar (mínimo 20 caracteres)
- Email de notificación obligatorio al aprobar/rechazar
- Verificar si media está en uso antes de eliminar

### Monitoreo y Sistema
- Health check no debe depender de BD lenta (usar Prometheus)
- Modo de mantenimiento requiere confirmación obligatoria
- Solo super_admin puede promover a super_admin
- Audit logs no pueden ser eliminados o modificados

---

## Criterios de Aceptación Global

### Funcionales
- [ ] Los 31 endpoints API están implementados y funcionando
- [ ] Super admins pueden gestionar usuarios (CRUD, suspender, activar, reset password)
- [ ] Super admins pueden gestionar organizaciones y subscripciones
- [ ] Content moderators pueden aprobar/rechazar contenido
- [ ] Super admins pueden monitorear salud del sistema
- [ ] Super admins pueden activar modo de mantenimiento
- [ ] Todas las acciones se registran en audit log
- [ ] Notificaciones por email funcionan correctamente

### No Funcionales
- [ ] Response time p95 < 300ms
- [ ] Test coverage > 85% (backend)
- [ ] Zero critical security vulnerabilities
- [ ] Uptime > 99.9%
- [ ] API documentation 100% completa
- [ ] Audit logs con retention de 2 años
- [ ] Rate limiting funcionando (30 req/min)
- [ ] ESLint y TypeScript sin errores

---

## Métricas de Éxito

### KPIs Técnicos
- 31 endpoints implementados y funcionando con 100% uptime
- Test coverage: Backend >85%
- Response time p95 <300ms
- Error rate <0.05%
- Zero critical bugs en producción
- API documentation 100% completa
- Audit log coverage 100%

### KPIs de Negocio
- Tiempo de gestión de usuarios reducido en 95%
- 100% de acciones críticas auditadas
- 100% de contenido moderado antes de publicación
- >99.9% uptime del sistema
- <1 hora de downtime mensual
- <4 horas RTO (recovery time objective)

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP010-admin-portal/README.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2131-2187)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/`
- **Reporte Fase 2:** `/docs/projects/glit-analisys/05-REPORTE-FINAL-FASE-2-DOCUMENTACION.md`

### Historias de Usuario
- **HU-EP010-01:** User Management
- **HU-EP010-02:** Organizations
- **HU-EP010-03:** Content Management
- **HU-EP010-04:** System Monitoring

### Épicas Relacionadas
- **EP001 - Auth System:** Dependencia bloqueante (JWT authentication requerido)
- **EP005 - Admin Module (Partial):** Épica previa con cobertura parcial (40%) de endpoints admin

---

## 🔗 Referencias a Implementación

### Documentos con Referencias Detalladas

Cada documento modular incluye una sección completa "🔗 Referencias a Implementación" con paths a:
- 🗄️ **Database:** Tablas, ENUMs, Foreign Keys, Indexes (en `apps/database/ddl/`)
- 💻 **Backend:** Controllers, Services, DTOs, Entities, Guards, Utils (en `apps/backend/src/`)
- 🎨 **Frontend:** Componentes, Hooks, Types, Services (en `apps/frontend/src/`)

**Consultar:**
1. [REQ-ADMIN-USUARIOS.md → Referencias](./REQ-ADMIN-USUARIOS.md#-referencias-a-implementación)
   - User management, suspensiones, activity logs, audit
2. [REQ-ADMIN-ORGANIZACIONES.md → Referencias](./REQ-ADMIN-ORGANIZACIONES.md#-referencias-a-implementación)
   - Organizations, subscriptions, feature flags, limites de usuarios
3. [REQ-ADMIN-CONTENIDO.md → Referencias](./REQ-ADMIN-CONTENIDO.md#-referencias-a-implementación)
   - Content moderation, media management, versioning, S3 storage
4. [REQ-ADMIN-SISTEMA.md → Referencias](./REQ-ADMIN-SISTEMA.md#-referencias-a-implementación)
   - System health, logs, maintenance mode, statistics, Prometheus

### Resumen Rápido de Implementación

**Database Schemas:**
- `auth`: users, organizations, organization_users, user_activity_log, password_reset_tokens
- `educational_content`: exercises (con status moderation), content_versions
- `storage`: media_files
- `system_configuration`: system_logs, system_health, maintenance_mode
- `audit_logging`: admin_audit_log

**Backend Modules:**
- `apps/backend/src/modules/admin/` - User, Organization, Content, System Management
  - Controllers: user-management, organization-management, content-moderation, media-management, system-monitoring
  - Services: +15 servicios especializados
  - Guards: super-admin, content-moderator
- `apps/backend/src/shared/` - System Metrics Utils, Prometheus Exporter, Winston Logger, S3 Storage

**Frontend Features:**
- `apps/frontend/src/features/admin/` - Admin components y hooks
  - User Management: UserList, SuspendUserModal, ActivityLogViewer
  - Organizations: OrganizationList, SubscriptionManager, FeatureFlagsPanel
  - Content Moderation: ContentModerationQueue, RejectContentModal, MediaFilesList
  - System Monitoring: SystemHealthDashboard, SystemLogsViewer, MaintenanceModeToggle, SystemStatisticsDashboard
- `apps/frontend/src/types/` - admin.types.ts, organization.types.ts, content-moderation.types.ts, system-monitoring.types.ts

---

## Stack Tecnológico

### Backend
- Framework: Node.js + TypeScript + Express
- Database: PostgreSQL 16
- ORM: Prisma (preferido) o TypeORM
- Validación: Joi o Zod
- Authentication: JWT (reusa EP001)
- Cache: Redis
- Logging: Winston
- Monitoring: Prometheus (opcional)

### Frontend
- Framework: React + TypeScript
- State Management: Zustand
- UI Library: Tailwind CSS + shadcn/ui
- Forms: React Hook Form + Zod validation
- Charts: Recharts o Chart.js
- Testing: Vitest + React Testing Library

### DevOps
- Testing Backend: Jest
- Testing E2E: Playwright o Cypress
- CI/CD: GitHub Actions
- Monitoring: Prometheus + Grafana (opcional)

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | TBD | - | - |
| Tech Lead | TBD | - | - |
| Security Lead | TBD | - | - |
| Backend Lead | TBD | - | - |
| Frontend Lead | TBD | - | - |

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001 Modularizado)
**Estado:** APROBADO
**Archivo original respaldado:** REQUERIMIENTOS-ADMIN-PORTAL.md.backup
