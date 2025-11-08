# HU-EP010-04: Monitoreo y Sistema

## Información General

| Campo | Valor |
|-------|-------|
| **ID** | HU-EP010-04 |
| **Épica** | EP010 - Admin Portal |
| **Título** | Monitoreo y Configuración del Sistema |
| **Prioridad** | Alta (P1) |
| **Story Points** | 16 SP |
| **Estado** | NOT STARTED |
| **Sprint** | Sprint 4 |
| **Duración Estimada** | 4 días |

---

## Historia de Usuario

**Como** super admin o system operator
**Quiero** monitorear la salud del sistema y gestionar configuraciones operativas
**Para** asegurar uptime, detectar problemas temprano y realizar mantenimiento planificado

---

## Endpoints API (7 endpoints)

1. **GET /api/admin/system/health** - Métricas de salud del sistema (CPU, memoria, DB, Redis)
2. **GET /api/admin/system/users** - Endpoint alternativo de gestión de usuarios
3. **PATCH /api/admin/system/users/:id/role** - Actualiza rol de usuario (promote/demote)
4. **PATCH /api/admin/system/users/:id/status** - Actualiza status (active/inactive/suspended)
5. **GET /api/admin/system/logs** - Obtiene logs del sistema con filtros
6. **POST /api/admin/system/maintenance** - Activa/desactiva modo mantenimiento
7. **GET /api/admin/system/statistics** - Estadísticas del sistema (dashboard data)

**Middleware:** `authenticateJWT` → `requireSuperAdmin` → `adminRateLimit` → `auditAdminAction`
**Rate Limit:** 30 req/min

---

## Criterios de Aceptación (Resumidos)

### Funcionales
- ✓ Health: CPU, memoria, disk, DB connections, Redis status, uptime
- ✓ Health alerts: Si CPU>80% o memoria>90%, mostrar warning
- ✓ Role update: Cambiar role (student→teacher, teacher→admin, etc.)
- ✓ Status update: Activar/desactivar/suspender usuarios batch
- ✓ Logs: Filtrar por level (error, warn, info), date range, module
- ✓ Logs streaming: Real-time logs (opcional, WebSocket)
- ✓ Maintenance mode: Bloquea acceso a usuarios (excepto super_admins)
- ✓ Maintenance message: Mensaje personalizado para usuarios
- ✓ Statistics: Total users, active users, submissions today, avg response time
- ✓ Audit logging: Todas las acciones críticas se loguean

### No Funcionales
- ✓ Response time p95 <500ms (health/stats puede ser pesado)
- ✓ Health endpoint NO debe depender de BD (usar Prometheus metrics)
- ✓ Solo role='super_admin'
- ✓ Rate limiting: 30 req/min
- ✓ Test coverage >85%

---

## Definición de Hecho (DoD)

- [ ] 7 endpoints implementados
- [ ] Frontend: HealthDashboard, LogsViewer, MaintenanceMode toggle, StatisticsDashboard
- [ ] Tests unitarios >85%
- [ ] Tests E2E para flujos críticos
- [ ] Prometheus metrics integrado (health)
- [ ] Audit logging funcionando
- [ ] Documentación API completa

---

**Referencia API:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 2169-2176)
**Última actualización:** 2025-10-28
