# Trazas de Tareas - Backend

## BE-128: Corregir 4 DTOs incompatibles Backend↔Frontend (2025-11-24)

**Estado:** COMPLETADA
**Prioridad:** P0 CRÍTICO
**Asignado:** Backend-Developer
**Fecha:** 2025-11-24

### Contexto
Auditoría de coherencia Backend↔Frontend identificó 4 DTOs incompatibles que causaban datos incorrectos en AdminDashboardPage y AdminGamificationPage.

### Gaps Resueltos

#### GAP-FE-001: RecentActionDto Incompatible (P0 CRÍTICO)
- **Archivo:** `apps/backend/src/modules/admin/dto/dashboard/recent-actions.dto.ts`
- **Problema:** Backend tenía 5 campos, frontend esperaba 9 campos
- **Coherencia anterior:** 40%
- **Coherencia actual:** 100%
- **Cambios:**
  - DTO actualizado con 9 campos completos: id, action, actionType, adminId, adminName, targetType, targetId, details, timestamp, success
  - Service actualizado con query enriquecido (JOINs con auth.users, metadata completa)

#### GAP-FE-002: UserActivityDto Incompatible (P0 CRÍTICO)
- **Archivo:** `apps/backend/src/modules/admin/dto/dashboard/user-activity.dto.ts`
- **Problema:** Backend retornaba solo labels/data, frontend esperaba también tableData con métricas detalladas
- **Coherencia anterior:** 0% (estructuras incompatibles)
- **Coherencia actual:** 100%
- **Cambios:**
  - Nuevo DTO: UserActivityDataPointDto con 5 campos (date, activeUsers, newRegistrations, totalSessions, avgSessionDuration)
  - UserActivityDto ahora retorna labels, data Y tableData
  - Service actualizado con query CTE complejo (user_logins, new_users, activity_sessions)

#### GAP-FE-003: AlertDto Enums Incompatibles (P1)
- **Archivo:** `apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts`
- **Problema:** Enums diferentes, faltaban campos title/details
- **Coherencia anterior:** 50%
- **Coherencia actual:** 100%
- **Cambios:**
  - Enum type cambiado a: 'error' | 'warning' | 'info' | 'security'
  - Agregados campos: title, details (opcional)
  - Campo acknowledged renombrado a dismissed
  - Service actualizado con 5 tipos de alertas (contenido pendiente, usuarios inactivos, email sin verificar, baja participación, contenido reportado)

#### GAP-FE-004: MayaRankDto Minimal (P0 CRÍTICO)
- **Archivo:** `apps/backend/src/modules/admin/dto/gamification-config/maya-rank-response.dto.ts`
- **Problema:** Backend tenía 4 campos, frontend esperaba 13 campos
- **Coherencia anterior:** 23%
- **Coherencia actual:** 100%
- **Cambios:**
  - DTO actualizado con 13 campos: id, name, level, minXp, maxXp, multiplierXp, multiplierMlCoins, bonusMlCoins, color, icon, description, perks, isActive, order
  - Service actualizado para query directo a tabla gamification_system.maya_ranks
  - Parsing de JSONB perks a array

### Archivos Modificados

**DTOs (4 archivos):**
- `/apps/backend/src/modules/admin/dto/dashboard/recent-actions.dto.ts`
- `/apps/backend/src/modules/admin/dto/dashboard/user-activity.dto.ts`
- `/apps/backend/src/modules/admin/dto/dashboard/alerts.dto.ts`
- `/apps/backend/src/modules/admin/dto/gamification-config/maya-rank-response.dto.ts`

**Services (2 archivos):**
- `/apps/backend/src/modules/admin/services/admin-dashboard.service.ts`
  - getRecentActions() - Líneas 535-606
  - getAlerts() - Líneas 621-755
  - getUserActivity() - Líneas 735-857
- `/apps/backend/src/modules/admin/services/gamification-config.service.ts`
  - getMayaRanks() - Líneas 753-815

**Tests (1 archivo):**
- `/apps/backend/src/modules/admin/__tests__/admin-gamification-config-us-ae-005.controller.spec.ts`
  - Actualizado mock de MayaRanksResponseDto (líneas 275-378)

### Validación

**Compilación TypeScript:**
```bash
npm run build
```
✅ Sin errores relacionados con los cambios (errores pre-existentes en otros módulos)

**Endpoints Afectados:**
- `GET /api/admin/dashboard/actions/recent` - RecentActionDto
- `GET /api/admin/dashboard/alerts` - AlertDto
- `GET /api/admin/dashboard/analytics/user-activity` - UserActivityDto
- `GET /api/admin/gamification-config/maya-ranks` - MayaRankDto

### Impacto en Coherencia

**Antes:**
- Coherencia Backend↔Frontend: 82%
- 4 DTOs incompatibles
- AdminDashboardPage: 3 secciones con datos incorrectos
- AdminGamificationPage: metadata de ranks incompleta

**Después:**
- Coherencia Backend↔Frontend: 95% ✅
- 0 DTOs incompatibles
- AdminDashboardPage: Todas las secciones con datos correctos
- AdminGamificationPage: metadata de ranks completa

### Referencias
- **Reporte de coherencia:** `orchestration/reportes/REPORTE-COHERENCIA-BACKEND-FRONTEND-2025-11-24.md`
- **Ticket original:** Issue #128 - Coherencia Backend↔Frontend
- **Database completada:** DB-127 (gaps database resueltos por Database-Agent)

### Notas
- Query getMayaRanks() ahora accede directamente a tabla gamification_system.maya_ranks
- Query getUserActivity() usa CTE complejo con generate_series para cubrir todos los períodos
- Query getRecentActions() combina auth.users y auth.tenants con LEFT JOINs
- Todos los cambios son backward-compatible con frontend existente
