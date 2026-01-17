# Admin Portal - Endpoints No Consumidos

**Fecha:** 2026-01-17
**Task ID:** TASK-2026-01-17-001
**Tipo:** Análisis de Coherencia Backend ↔ Frontend

---

## Resumen Ejecutivo

El Admin Portal consume **60%** de los endpoints disponibles en el backend.
Se identificaron **52 endpoints no consumidos** de un total de ~130.

### Métricas por Categoría

| Categoría | Endpoints | Consumidos | Pendientes | % |
|-----------|-----------|------------|------------|---|
| Organizations | 9 | 9 | 0 | 100% |
| Analytics | 7 | 7 | 0 | 100% |
| Alerts | 7 | 7 | 0 | 100% |
| Classroom-Teachers | 9 | 9 | 0 | 100% |
| Content | 10 | 8 | 2 | 80% |
| Reports | 5 | 4 | 1 | 80% |
| Users | 14 | 10 | 4 | 71% |
| Monitoring/System | 22 | 8 | 14 | 36% |
| Gamification | 10 | 3 | 7 | 30% |
| Dashboard | 11 | 3 | 8 | 27% |
| Roles & Permissions | 4 | 0 | 4 | 0% |
| Feature Flags | 9 | 0 | 9 | 0% |
| Bulk Operations | 6 | 0 | 6 | 0% |
| Assignments | 5 | 0 | 5 | 0% |
| Interventions | 5 | 0 | 5 | 0% |
| **TOTAL** | **~130** | **~78** | **~52** | **60%** |

---

## Gaps Críticos (0% Consumidos)

### 1. Roles & Permissions (P1 - Alta Prioridad)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/roles` | GET | Listar todos los roles |
| `/admin/roles/permissions` | GET | Obtener permisos disponibles |
| `/admin/roles/:id/permissions` | GET | Permisos de un rol |
| `/admin/roles/:id/permissions` | PUT | Actualizar permisos de rol |

**Impacto:** Sin esta UI, la gestión de permisos debe hacerse por BD.

---

### 2. Feature Flags (P1 - Alta Prioridad)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/feature-flags` | GET | Listar todas las flags |
| `/admin/feature-flags/:key` | GET | Obtener flag específica |
| `/admin/feature-flags/:key/check` | POST | Verificar si feature está habilitada |
| `/admin/feature-flags` | POST | Crear nueva flag |
| `/admin/feature-flags/:key` | PUT | Actualizar flag |
| `/admin/feature-flags/:key/enable` | POST | Habilitar flag |
| `/admin/feature-flags/:key/disable` | POST | Deshabilitar flag |
| `/admin/feature-flags/:key/rollout` | PUT | Actualizar rollout percentage |
| `/admin/feature-flags/:key` | DELETE | Eliminar flag |

**Impacto:** Rollout de features requiere acceso directo a BD.

---

### 3. Bulk Operations (P1 - Alta Prioridad)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/bulk-operations/suspend-users` | POST | Suspender usuarios masivamente |
| `/admin/bulk-operations/activate-users` | POST | Activar usuarios masivamente |
| `/admin/bulk-operations/update-role` | POST | Actualizar rol masivamente |
| `/admin/bulk-operations/delete-users` | POST | Eliminar usuarios masivamente |
| `/admin/bulk-operations/:id` | GET | Estado de operación |
| `/admin/bulk-operations` | GET | Listar operaciones |

**Impacto:** Gestión de usuarios en escala imposible desde UI.

---

### 4. Assignments Admin (P2 - Media Prioridad)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/assignments` | GET | Listar todas las asignaciones |
| `/admin/assignments/stats` | GET | Estadísticas de asignaciones |
| `/admin/assignments/:id` | GET | Detalle de asignación |
| `/admin/assignments/classrooms/:id` | GET | Asignaciones por aula |
| `/admin/assignments/students/:id` | GET | Asignaciones por estudiante |

**Impacto:** Sin visibilidad de tareas asignadas a nivel admin.

---

### 5. Interventions (P2 - Media Prioridad)

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/admin/interventions` | GET | Listar intervenciones |
| `/admin/interventions/:id` | GET | Detalle de intervención |
| `/admin/interventions/:id/acknowledge` | PATCH | Marcar como vista |
| `/admin/interventions/:id/resolve` | PATCH | Resolver intervención |
| `/admin/interventions/:id/dismiss` | DELETE | Descartar intervención |

**Impacto:** Sistema de alertas de estudiantes en riesgo no visible.

---

## Gaps Parciales (27-71% Consumidos)

### Dashboard (27% - 8 endpoints pendientes)

| Endpoint | Método | Descripción | Prioridad |
|----------|--------|-------------|-----------|
| `/admin/dashboard` | GET | Dashboard completo | P2 |
| `/admin/dashboard/stats` | GET | Solo estadísticas | P2 |
| `/admin/dashboard/recent-activity` | GET | Actividad reciente | P2 |
| `/admin/dashboard/user-stats` | GET | Stats de usuarios | P3 |
| `/admin/dashboard/organization-stats` | GET | Stats de organización | P3 |
| `/admin/dashboard/moderation-queue` | GET | Cola de moderación | P1 |
| `/admin/dashboard/classroom-overview` | GET | Overview de aulas | P2 |
| `/admin/dashboard/assignment-stats` | GET | Stats de asignaciones | P3 |

---

### Gamification Config (30% - 7 endpoints pendientes)

| Endpoint | Método | Descripción | Prioridad |
|----------|--------|-------------|-----------|
| `/admin/gamification/settings/preview` | POST | Preview impacto | P3 |
| `/admin/gamification/settings/restore-defaults` | POST | Restaurar defaults | P2 |
| `/admin/gamification/parameters` | GET | Listar parámetros | P2 |
| `/admin/gamification/parameters/:id` | GET | Obtener parámetro | P3 |
| `/admin/gamification/parameters/:id` | PUT | Actualizar parámetro | P2 |
| `/admin/gamification/maya-ranks/:name` | PUT | Actualizar rango Maya | P3 |

---

### System/Monitoring (36% - 14 endpoints pendientes)

| Endpoint | Método | Descripción | Prioridad |
|----------|--------|-------------|-----------|
| `/admin/system/logs` | GET | Logs del sistema | P2 |
| `/admin/system/config/categories` | GET | Categorías de config | P3 |
| `/admin/system/config/validate` | POST | Validar config | P3 |
| `/admin/system/config/:category` | GET | Config por categoría | P3 |
| `/admin/system/config/:category` | PUT | Actualizar por categoría | P3 |
| `/admin/system/maintenance/cleanup-logs` | POST | Limpiar logs | P2 |
| `/admin/system/maintenance/cleanup-activity` | POST | Limpiar actividad | P2 |
| `/admin/system/maintenance/optimize-database` | POST | Optimizar BD | P2 |
| `/admin/system/maintenance/clear-cache` | POST | Limpiar cache | P2 |
| `/admin/system/maintenance/cleanup-sessions` | POST | Limpiar sesiones | P2 |
| `/admin/system/cron/status` | GET | Estado de CRON | P3 |

---

### Users (71% - 4 endpoints pendientes)

| Endpoint | Método | Descripción | Prioridad |
|----------|--------|-------------|-----------|
| `/admin/users/:id/reset-password` | POST | Reset password | P2 |
| `/admin/users/bulk/suspend` | POST | Suspender bulk | P2 |
| `/admin/users/bulk/delete` | POST | Eliminar bulk | P2 |
| `/admin/users/bulk/update-role` | POST | Actualizar rol bulk | P2 |

---

## Plan de Implementación Sugerido

### Sprint 1 - Críticos (P1)

1. **Roles & Permissions UI**
   - Componentes: RolesPage, PermissionsMatrix
   - Estimación: 3-5 días

2. **Feature Flags UI**
   - Componentes: FeatureFlagsPage, FlagEditor, RolloutConfig
   - Estimación: 3-5 días

3. **Bulk Operations UI**
   - Componentes: BulkActionsModal, OperationProgress
   - Estimación: 2-3 días

### Sprint 2 - Importantes (P2)

4. **Dashboard Enhancements**
   - Agregar widgets: Moderation Queue, Classroom Overview
   - Estimación: 2-3 días

5. **Interventions System**
   - Componentes: InterventionsPage, InterventionDetail
   - Estimación: 2-3 días

6. **System Maintenance**
   - Componentes: MaintenancePanel, CleanupActions
   - Estimación: 2 días

### Sprint 3 - Mejoras (P3)

7. **Assignments Admin View**
8. **Gamification Parameters**
9. **Advanced System Config**

---

## Referencias

- **Backend Controllers:** `apps/backend/src/modules/admin/controllers/`
- **Frontend API Service:** `apps/frontend/src/services/api/adminAPI.ts`
- **Análisis de Coherencia:** `COHERENCIA-CAPAS-ANALYSIS.md`

---

*Generado por Claude Opus 4.5*
*Sistema SIMCO v4.0.0 + CAPVED*
*Proyecto GAMILIT - Workspace V2*
