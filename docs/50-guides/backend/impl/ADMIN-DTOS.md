# Admin Module DTOs - GAMILIT Backend

**Proyecto:** GAMILIT Platform
**Version:** 3.4
**Fecha:** 2025-12-26
**Total DTOs:** 125

---

## 1. RESUMEN

El modulo Admin contiene 125 DTOs organizados en 17 categorias funcionales.

| Categoria | DTOs | Descripcion |
|-----------|------|-------------|
| alerts | 8 | Alertas del sistema |
| analytics | 10 | Analiticas y metricas |
| assignments | 6 | Asignaciones de contenido |
| bulk-operations | 5 | Operaciones masivas |
| classroom-assignments | 14 | Asignacion aulas-profesores |
| content | 8 | Gestion de contenido |
| dashboard | 12 | Dashboard admin |
| feature-flags | 4 | Feature flags |
| gamification-config | 6 | Configuracion gamificacion |
| interventions | 8 | Alertas de intervencion |
| monitoring | 6 | Monitoreo del sistema |
| organizations | 5 | Organizaciones/escuelas |
| progress | 8 | Progreso de estudiantes |
| reports | 10 | Generacion de reportes |
| roles | 4 | Gestion de roles |
| system | 6 | Configuracion del sistema |
| users | 9 | Gestion de usuarios |

---

## 2. DTOS POR CATEGORIA

### 2.1 Users (9 DTOs)

**Ubicacion:** `modules/admin/dto/users/`

| DTO | Proposito |
|-----|-----------|
| `list-users.dto.ts` | Query params para listar usuarios |
| `paginated-users.dto.ts` | Respuesta paginada de usuarios |
| `user-details.dto.ts` | Detalle completo de usuario |
| `user-stats.dto.ts` | Estadisticas de usuario |
| `update-user.dto.ts` | Actualizacion de usuario |
| `suspend-user.dto.ts` | Suspension de usuario |
| `reset-password.dto.ts` | Reset de password |
| `create-user.dto.ts` | Creacion de usuario |
| `user-response.dto.ts` | Respuesta estandar usuario |

---

### 2.2 Bulk Operations (5 DTOs)

**Ubicacion:** `modules/admin/dto/bulk-operations/`

| DTO | Proposito |
|-----|-----------|
| `bulk-suspend-users.dto.ts` | Suspension masiva |
| `bulk-delete-users.dto.ts` | Eliminacion masiva |
| `bulk-activate-users.dto.ts` | Activacion masiva |
| `bulk-update-role.dto.ts` | Cambio de rol masivo |
| `bulk-operation-status.dto.ts` | Estado de operacion |

---

### 2.3 Classroom Assignments (14 DTOs)

**Ubicacion:** `modules/admin/dto/classroom-assignments/`

| DTO | Proposito |
|-----|-----------|
| `assign-classroom.dto.ts` | Asignar aula a profesor |
| `assign-classrooms-rest.dto.ts` | Asignacion REST |
| `assign-teacher-rest.dto.ts` | Asignar profesor REST |
| `assignment-history-response.dto.ts` | Historial de asignaciones |
| `classroom-assignment-response.dto.ts` | Respuesta de asignacion |
| `classroom-list-item.dto.ts` | Item de lista de aulas |
| `classroom-with-teachers.dto.ts` | Aula con sus profesores |
| `list-all-assignments-query.dto.ts` | Query todas las asignaciones |
| `list-classrooms-query.dto.ts` | Query listar aulas |
| `list-teachers-query.dto.ts` | Query listar profesores |
| `reassign-classroom.dto.ts` | Reasignar aula |
| `remove-assignment.dto.ts` | Remover asignacion |
| `teacher-list-item.dto.ts` | Item de lista profesores |
| `teacher-with-classrooms.dto.ts` | Profesor con sus aulas |

---

### 2.4 Feature Flags (4 DTOs)

**Ubicacion:** `modules/admin/dto/feature-flags/`

| DTO | Proposito |
|-----|-----------|
| `create-feature-flag.dto.ts` | Crear feature flag |
| `update-feature-flag.dto.ts` | Actualizar feature flag |
| `check-feature-flag.dto.ts` | Verificar estado |
| `feature-flag-query.dto.ts` | Query params |

---

### 2.5 Dashboard (12 DTOs)

**Ubicacion:** `modules/admin/dto/dashboard/`

| DTO | Proposito |
|-----|-----------|
| `dashboard-stats.dto.ts` | Estadisticas generales |
| `user-activity.dto.ts` | Actividad de usuarios |
| `platform-health.dto.ts` | Salud de plataforma |
| `recent-registrations.dto.ts` | Registros recientes |
| `active-sessions.dto.ts` | Sesiones activas |
| `content-stats.dto.ts` | Estadisticas contenido |
| `engagement-metrics.dto.ts` | Metricas engagement |
| `error-summary.dto.ts` | Resumen de errores |
| `growth-metrics.dto.ts` | Metricas de crecimiento |
| `quick-actions.dto.ts` | Acciones rapidas |
| `system-alerts.dto.ts` | Alertas del sistema |
| `top-performers.dto.ts` | Mejores estudiantes |

---

### 2.6 Analytics (10 DTOs)

**Ubicacion:** `modules/admin/dto/analytics/`

| DTO | Proposito |
|-----|-----------|
| `analytics-query.dto.ts` | Query params analiticas |
| `engagement-report.dto.ts` | Reporte engagement |
| `performance-report.dto.ts` | Reporte rendimiento |
| `usage-stats.dto.ts` | Estadisticas de uso |
| `trend-analysis.dto.ts` | Analisis de tendencias |
| `comparative-report.dto.ts` | Reporte comparativo |
| `cohort-analysis.dto.ts` | Analisis de cohortes |
| `retention-metrics.dto.ts` | Metricas retencion |
| `activity-heatmap.dto.ts` | Mapa de actividad |
| `export-analytics.dto.ts` | Exportar analiticas |

---

### 2.7 Reports (10 DTOs)

**Ubicacion:** `modules/admin/dto/reports/`

| DTO | Proposito |
|-----|-----------|
| `report.dto.ts` | DTO base de reporte |
| `generate-report.dto.ts` | Generar reporte |
| `report-config.dto.ts` | Configuracion reporte |
| `report-schedule.dto.ts` | Programar reporte |
| `report-template.dto.ts` | Plantilla de reporte |
| `export-format.dto.ts` | Formato exportacion |
| `report-filters.dto.ts` | Filtros de reporte |
| `report-response.dto.ts` | Respuesta reporte |
| `report-history.dto.ts` | Historial reportes |
| `scheduled-report.dto.ts` | Reporte programado |

---

### 2.8 Interventions (8 DTOs)

**Ubicacion:** `modules/admin/dto/interventions/`

| DTO | Proposito |
|-----|-----------|
| `intervention-alert.dto.ts` | Alerta de intervencion |
| `create-intervention.dto.ts` | Crear intervencion |
| `update-intervention.dto.ts` | Actualizar intervencion |
| `intervention-history.dto.ts` | Historial |
| `intervention-query.dto.ts` | Query params |
| `intervention-response.dto.ts` | Respuesta |
| `intervention-summary.dto.ts` | Resumen |
| `intervention-stats.dto.ts` | Estadisticas |

---

### 2.9 Alerts (8 DTOs)

**Ubicacion:** `modules/admin/dto/alerts/`

| DTO | Proposito |
|-----|-----------|
| `list-alerts.dto.ts` | Listar alertas |
| `alert-response.dto.ts` | Respuesta alerta |
| `create-alert.dto.ts` | Crear alerta |
| `update-alert.dto.ts` | Actualizar alerta |
| `acknowledge-alert.dto.ts` | Reconocer alerta |
| `resolve-alert.dto.ts` | Resolver alerta |
| `alert-config.dto.ts` | Configuracion |
| `alert-stats.dto.ts` | Estadisticas |

---

### 2.10 Content (8 DTOs)

**Ubicacion:** `modules/admin/dto/content/`

| DTO | Proposito |
|-----|-----------|
| `content-list.dto.ts` | Listar contenido |
| `content-detail.dto.ts` | Detalle contenido |
| `create-content.dto.ts` | Crear contenido |
| `update-content.dto.ts` | Actualizar contenido |
| `publish-content.dto.ts` | Publicar contenido |
| `archive-content.dto.ts` | Archivar contenido |
| `content-stats.dto.ts` | Estadisticas |
| `content-approval.dto.ts` | Aprobacion contenido |

---

### 2.11 Gamification Config (6 DTOs)

**Ubicacion:** `modules/admin/dto/gamification-config/`

| DTO | Proposito |
|-----|-----------|
| `xp-config.dto.ts` | Configuracion XP |
| `coins-config.dto.ts` | Configuracion ML Coins |
| `ranks-config.dto.ts` | Configuracion rangos |
| `achievements-config.dto.ts` | Configuracion logros |
| `missions-config.dto.ts` | Configuracion misiones |
| `rewards-config.dto.ts` | Configuracion recompensas |

---

### 2.12 Otras Categorias

| Categoria | DTOs | Descripcion |
|-----------|------|-------------|
| assignments | 6 | Asignaciones de tareas |
| monitoring | 6 | Monitoreo sistema |
| organizations | 5 | Gestion escuelas |
| progress | 8 | Progreso estudiantes |
| roles | 4 | Gestion roles |
| system | 6 | Config sistema |

---

## 3. PATRONES DE NOMENCLATURA

### 3.1 Sufijos

| Sufijo | Uso |
|--------|-----|
| `-query.dto.ts` | Query params para GET |
| `-response.dto.ts` | Respuesta de endpoint |
| `-list.dto.ts` | Lista de items |
| `-stats.dto.ts` | Estadisticas |
| `-config.dto.ts` | Configuracion |

### 3.2 Prefijos

| Prefijo | Uso |
|---------|-----|
| `create-` | Creacion de recurso |
| `update-` | Actualizacion |
| `list-` | Listado |
| `bulk-` | Operacion masiva |

---

## 4. VALIDACIONES COMUNES

Todos los DTOs usan `class-validator`:

```typescript
import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
```

---

## 5. USO EN CONTROLLERS

```typescript
@Controller('admin/users')
export class AdminUsersController {
  @Get()
  async listUsers(@Query() query: ListUsersDto): Promise<PaginatedUsersDto> {
    // ...
  }

  @Post()
  async createUser(@Body() dto: CreateUserDto): Promise<UserResponseDto> {
    // ...
  }
}
```

---

**Generado por:** Requirements-Analyst - GAMILIT
