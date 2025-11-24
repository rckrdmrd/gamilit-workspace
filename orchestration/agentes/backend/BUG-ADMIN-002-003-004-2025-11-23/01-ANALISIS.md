# ANÁLISIS - BUG-ADMIN-002, 003, 004

**Fecha:** 2025-11-23
**Agente:** Backend-Developer
**Contexto:** Implementación de endpoints faltantes para AdminDashboardPage

---

## 🎯 PROBLEMA IDENTIFICADO

AdminDashboardPage tiene 3 secciones que **SIEMPRE están vacías** porque los endpoints nunca fueron implementados. El frontend hace llamadas a endpoints inexistentes y usa arrays vacíos como fallback.

**Evidencia:**
- Archivo: `apps/frontend/src/apps/admin/pages/AdminDashboardPage.tsx`
- Líneas 152-186: useEffect hooks retornan arrays vacíos hardcodeados
- Reporte: `orchestration/reportes/REPORTE-ANALISIS-PORTALES-ADMIN-TEACHER-2025-11-23.md` (líneas 285-353)

---

## 📋 BUGS A CORREGIR

### BUG-ADMIN-002 (P0)
**Endpoint:** `GET /admin/dashboard/actions/recent`
**Problema:** Endpoint no implementado en backend
**Impacto:** Sección "Acciones Recientes" SIEMPRE vacía
**Prioridad:** P0 - Bloquea funcionalidad de dashboard admin

### BUG-ADMIN-003 (P0)
**Endpoint:** `GET /admin/dashboard/alerts`
**Problema:** Endpoint no implementado en backend
**Impacto:** Sección "Alertas" SIEMPRE vacía
**Prioridad:** P0 - Bloquea funcionalidad de dashboard admin

### BUG-ADMIN-004 (P0)
**Endpoint:** `GET /admin/dashboard/analytics/user-activity`
**Problema:** Endpoint no implementado en backend
**Impacto:** Gráfica de actividad de usuarios SIEMPRE vacía
**Prioridad:** P0 - Bloquea funcionalidad de dashboard admin

---

## 🔍 ANÁLISIS TÉCNICO

### Verificación de Tablas Disponibles

**Tablas existentes para implementación:**
- ✅ `auth.users` - Para usuarios creados, actualizaciones, last_sign_in_at
- ✅ `auth.tenants` - Para organizaciones creadas/actualizadas
- ✅ `audit_logging.activity_log` - Para acciones de administradores
- ✅ `educational_content.content_approvals` - Para aprobaciones pendientes
- ✅ `admin_dashboard.recent_activity` - Vista existente para actividad reciente

**Decisión:** Usar tablas existentes sin crear nuevas estructuras.

### Estructura de Controller Actual

**Ubicación:** `apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts`

Endpoints existentes:
- ✅ GET `/admin/dashboard` - Dashboard completo
- ✅ GET `/admin/dashboard/stats` - Estadísticas
- ✅ GET `/admin/dashboard/recent-activity` - Actividad reciente (diferente a actions)
- ✅ GET `/admin/dashboard/user-stats` - Stats de usuarios
- ✅ GET `/admin/dashboard/organization-stats` - Stats de organizaciones

**Endpoints a agregar:** 3 nuevos (actions/recent, alerts, analytics/user-activity)

### Estructura de Service Actual

**Ubicación:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`

Métodos existentes:
- getDashboard()
- getDashboardStats()
- getRecentActivity() - Usa view admin_dashboard.recent_activity
- getUserStatsSummary()
- getOrganizationStatsSummary()
- getModerationQueue()
- getClassroomOverview()
- getAssignmentSubmissionStats()

**Métodos a agregar:** 3 nuevos (getRecentActions, getAlerts, getUserActivity)

---

## 💡 DECISIONES DE DISEÑO

### 1. DTOs

**Ubicación:** `apps/backend/src/modules/admin/dto/dashboard/`

Archivos a crear:
1. `recent-actions.dto.ts` - RecentActionsQueryDto, RecentActionDto
2. `alerts.dto.ts` - AlertDto
3. `user-activity.dto.ts` - UserActivityQueryDto, UserActivityDto, GroupByEnum

**Patrón seguido:** Similar a `recent-activity.dto.ts` existente

### 2. Queries SQL

**getRecentActions:**
- Query 1: Usuarios creados en últimos 7 días (auth.users.created_at)
- Query 2: Organizaciones actualizadas en últimos 7 días (auth.tenants.updated_at)
- Combinar y ordenar por timestamp DESC

**getAlerts:**
- Alert 1: Content approvals pendientes > 10 (educational_content.content_approvals)
- Alert 2: Usuarios inactivos > 30 días > 50 (auth.users.last_sign_in_at)
- Alert 3: Usuarios sin verificar email > 7 días > 20 (auth.users.email_confirmed_at)
- Alert 4: Baja participación < 20% (audit_logging.activity_log)

**getUserActivity:**
- Query: COUNT(DISTINCT id) agrupado por DATE_TRUNC(day/week/month)
- Usar auth.users.last_sign_in_at como métrica de actividad
- Parámetros: startDate, endDate, groupBy

### 3. Validaciones

**class-validator decorators:**
- `@IsOptional()` - Parámetros opcionales
- `@IsInt()`, `@Min()`, `@Max()` - Validación numérica
- `@IsDateString()` - Validación de fechas ISO 8601
- `@IsEnum()` - Validación de enums (GroupByEnum)

### 4. Swagger Documentation

**Decorators obligatorios:**
- `@ApiOperation()` - Descripción del endpoint
- `@ApiProperty()` - Documentación de propiedades DTO
- `@ApiPropertyOptional()` - Propiedades opcionales

---

## 🚨 RESTRICCIONES TÉCNICAS

1. **NO crear nuevas tablas** - Usar solo tablas existentes
2. **Queries eficientes** - Target < 200ms por query
3. **Error handling** - Retornar arrays vacíos en caso de error (no romper UI)
4. **Type safety** - 100% TypeScript con tipos explícitos
5. **Seguir DIRECTIVA-CALIDAD-CODIGO.md** - Comentarios JSDoc, nomenclatura consistente

---

## ✅ CRITERIOS DE ACEPTACIÓN

- [ ] GET /admin/dashboard/actions/recent retorna acciones reales de últimas 24-48 horas
- [ ] GET /admin/dashboard/alerts retorna al menos 2-3 tipos de alertas dinámicas
- [ ] GET /admin/dashboard/analytics/user-activity retorna datos para gráfica funcional
- [ ] DTOs con validación completa (class-validator)
- [ ] Swagger docs actualizados y completos
- [ ] Queries optimizadas con índices existentes
- [ ] TypeScript compila sin errores
- [ ] No modificar AdminDashboardService.getUserStats() existente

---

## 📊 IMPACTO ESTIMADO

**Archivos a crear:** 3 DTOs nuevos
**Archivos a modificar:** 3 (service, controller, index.ts)
**Endpoints implementados:** 3
**Líneas de código:** ~350 líneas

**Riesgo:** BAJO - Implementación aislada sin dependencias externas
