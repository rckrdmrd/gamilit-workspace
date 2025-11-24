# PLAN DE EJECUCIÓN - BUG-ADMIN-002, 003, 004

**Fecha:** 2025-11-23
**Agente:** Backend-Developer
**Tarea:** Implementar 3 endpoints faltantes de AdminDashboardPage

---

## 🎯 OBJETIVO

Implementar los 3 endpoints faltantes que actualmente retornan arrays vacíos en el frontend:
1. GET /admin/dashboard/actions/recent (BUG-ADMIN-002)
2. GET /admin/dashboard/alerts (BUG-ADMIN-003)
3. GET /admin/dashboard/analytics/user-activity (BUG-ADMIN-004)

---

## 📋 FASES DE IMPLEMENTACIÓN

### FASE 1: Crear DTOs
**Duración estimada:** 15 minutos

**Archivos a crear:**

1. **apps/backend/src/modules/admin/dto/dashboard/recent-actions.dto.ts**
   - RecentActionsQueryDto (query params)
   - RecentActionDto (response)
   - Validaciones: limit (1-50, default: 10)

2. **apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts**
   - AlertDto (response)
   - Campos: id, type, severity, message, timestamp, acknowledged

3. **apps/backend/src/modules/admin/dto/dashboard/user-activity.dto.ts**
   - UserActivityQueryDto (query params)
   - UserActivityDto (response)
   - GroupByEnum (day/week/month)
   - Validaciones: startDate, endDate (ISO 8601), groupBy (enum)

**Actualización:**
- Exportar en `apps/backend/src/modules/admin/dto/dashboard/index.ts`

---

### FASE 2: Implementar Métodos en Service
**Duración estimada:** 30 minutos

**Archivo:** `apps/backend/src/modules/admin/services/admin-dashboard.service.ts`

**Método 1: getRecentActions(limit: number)**
```typescript
async getRecentActions(limit: number = 10): Promise<RecentActionDto[]>
```

**Implementación:**
1. Query usuarios creados (auth.users WHERE created_at >= NOW() - INTERVAL '7 days')
2. Query organizaciones actualizadas (auth.tenants WHERE updated_at >= NOW() - INTERVAL '7 days')
3. Combinar resultados, ordenar por timestamp DESC
4. Limitar a `limit` resultados
5. Error handling: retornar [] si falla

**Método 2: getAlerts()**
```typescript
async getAlerts(): Promise<AlertDto[]>
```

**Implementación:**
1. Check: Pending content approvals (educational_content.content_approvals)
2. Check: Inactive users > 30 days (auth.users.last_sign_in_at)
3. Check: Unverified emails > 7 days (auth.users.email_confirmed_at)
4. Check: Low engagement < 20% (audit_logging.activity_log)
5. Ordenar por severity (critical > high > medium > low)
6. Error handling: retornar alerta genérica si falla

**Método 3: getUserActivity(query)**
```typescript
async getUserActivity(query: UserActivityQueryDto): Promise<UserActivityDto>
```

**Implementación:**
1. Calcular rango de fechas (default: last 30 days)
2. Determinar formato SQL según groupBy (day/week/month)
3. Query con DATE_TRUNC y TO_CHAR para agrupar
4. Mapear resultados a {labels: string[], data: number[]}
5. Error handling: retornar {labels: [], data: []} si falla

---

### FASE 3: Agregar Endpoints en Controller
**Duración estimada:** 15 minutos

**Archivo:** `apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts`

**Endpoint 1:**
```typescript
@Get('actions/recent')
@ApiOperation({ summary: 'Get recent admin actions', description: '...' })
async getRecentActions(@Query() query: RecentActionsQueryDto): Promise<RecentActionDto[]>
```

**Endpoint 2:**
```typescript
@Get('alerts')
@ApiOperation({ summary: 'Get active system alerts', description: '...' })
async getAlerts(): Promise<AlertDto[]>
```

**Endpoint 3:**
```typescript
@Get('analytics/user-activity')
@ApiOperation({ summary: 'Get user activity analytics', description: '...' })
async getUserActivity(@Query() query: UserActivityQueryDto): Promise<UserActivityDto>
```

**Swagger documentation:**
- @ApiOperation con summary y description detallado
- @ApiQuery para parámetros opcionales
- @ApiResponse para documentar responses

---

### FASE 4: Validación
**Duración estimada:** 20 minutos

**Checklist de validación:**

1. **Compilación TypeScript**
   ```bash
   cd apps/backend
   npm run build
   ```
   ✅ Sin errores de TypeScript

2. **Iniciar servidor**
   ```bash
   npm run start:dev
   ```
   ✅ Backend inicia sin errores

3. **Probar endpoints manualmente**
   ```bash
   # Test 1: Recent actions
   curl http://localhost:3000/admin/dashboard/actions/recent?limit=5

   # Test 2: Alerts
   curl http://localhost:3000/admin/dashboard/alerts

   # Test 3: User activity
   curl http://localhost:3000/admin/dashboard/analytics/user-activity?groupBy=day
   ```
   ✅ Retornan datos dinámicos (no hardcodeados)

4. **Verificar Swagger UI**
   - Abrir http://localhost:3000/api
   - Buscar sección "Admin - Dashboard"
   - Verificar 3 endpoints nuevos están documentados
   ✅ Swagger docs completos

5. **Verificar datos dinámicos**
   - Crear usuario nuevo
   - Llamar GET /admin/dashboard/actions/recent
   - Verificar que aparece en la lista
   ✅ Datos son dinámicos

---

## 🚨 CONSIDERACIONES ESPECIALES

### Manejo de Errores

**Principio:** NO romper el frontend si hay error en backend

Todos los métodos deben tener try-catch y retornar:
- `getRecentActions`: [] (array vacío)
- `getAlerts`: [{ alerta genérica de error }]
- `getUserActivity`: { labels: [], data: [] }

### Performance

**Target:** < 200ms por endpoint

Queries optimizadas:
- WHERE con índices existentes (created_at, updated_at, last_sign_in_at)
- LIMIT en queries para evitar full table scans
- Usar vistas materialized si disponible (admin_dashboard.*)

### Compatibilidad

**NO modificar:**
- Métodos existentes de AdminDashboardService
- Estructura de DashboardDataDto existente
- Endpoints existentes del controller

**Razón:** Evitar regresiones en funcionalidad existente

---

## 📊 CRONOGRAMA

| Fase | Duración | Inicio | Fin |
|------|----------|--------|-----|
| Fase 1: DTOs | 15 min | 00:00 | 00:15 |
| Fase 2: Service | 30 min | 00:15 | 00:45 |
| Fase 3: Controller | 15 min | 00:45 | 01:00 |
| Fase 4: Validación | 20 min | 01:00 | 01:20 |
| **TOTAL** | **80 min** | | |

---

## ✅ CRITERIOS DE ÉXITO

- [ ] 3 DTOs creados con validaciones completas
- [ ] 3 métodos implementados en AdminDashboardService
- [ ] 3 endpoints agregados en AdminDashboardController
- [ ] Exports actualizados en dashboard/index.ts
- [ ] TypeScript compila sin errores
- [ ] Backend inicia sin errores
- [ ] Endpoints retornan datos dinámicos
- [ ] Swagger docs completos
- [ ] Queries < 200ms
- [ ] Error handling robusto
- [ ] JSDoc en todos los métodos públicos

---

## 🔄 ROLLBACK PLAN

En caso de problemas críticos:

1. **Revertir commits:**
   ```bash
   git revert HEAD
   ```

2. **Archivos afectados a limpiar:**
   - apps/backend/src/modules/admin/dto/dashboard/recent-actions.dto.ts
   - apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts
   - apps/backend/src/modules/admin/dto/dashboard/user-activity.dto.ts
   - apps/backend/src/modules/admin/dto/dashboard/index.ts
   - apps/backend/src/modules/admin/services/admin-dashboard.service.ts
   - apps/backend/src/modules/admin/controllers/admin-dashboard.controller.ts

3. **Recompilar:**
   ```bash
   cd apps/backend
   npm run build
   ```

**Riesgo de rollback:** BAJO - Cambios aislados sin dependencias
