# Integración Teacher Portal - APIs Backend/Frontend/Database

**Versión:** 1.0
**Fecha:** 2025-11-24
**Fase:** EAI-006 (Teacher Portal) + Correcciones de Integración
**Epic:** EXT-002 (Portal de Maestros)
**Status:** ✅ IMPLEMENTADO

---

## 1. RESUMEN EJECUTIVO

Este documento describe la integración completa entre Backend, Frontend y Database para el Teacher Portal de GAMILIT, incluyendo inventario de APIs, configuración de CORS, tipos compartidos y trazabilidad.

### Métricas de Integración

| Aspecto | Valor | Estado |
|---------|-------|--------|
| Endpoints Teacher | 59 | ✅ Documentados |
| Endpoints Admin | 119 | ✅ Documentados |
| Total Endpoints | 178 | ✅ |
| Constantes de Rutas | 165 | ✅ Centralizadas |
| Tipos Compartidos | 19 enums | ✅ Sincronizados |
| CORS Configurado | Sí | ✅ localhost + producción |
| Puertos | FE:3005, BE:3006 | ✅ Correctos |

---

## 2. ARQUITECTURA DE INTEGRACIÓN

### 2.1 Stack Tecnológico

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND                                 │
│  React 19 + Vite 7 + TypeScript 5.9                             │
│  Puerto: 3005                                                    │
│  Config: apps/frontend/src/config/api.config.ts                  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/REST + WebSocket
                              │ CORS: localhost:3005, :3006, :5173
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         BACKEND                                  │
│  NestJS 11 + TypeORM 0.3 + TypeScript 5                         │
│  Puerto: 3006                                                    │
│  Prefix: /api/v1                                                 │
│  Routes: apps/backend/src/shared/constants/routes.constants.ts   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ PostgreSQL + Multi-Schema
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                         DATABASE                                 │
│  PostgreSQL 14+ | 14 Schemas | 101 Tablas                       │
│  Puerto: 5432                                                    │
│  DB: gamilit_platform                                            │
└─────────────────────────────────────────────────────────────────┘
```

### 2.2 Configuración de CORS

**Backend (main.ts):**
```typescript
const corsOrigin = configService.get<string>('app.corsOrigin')
  || 'http://localhost:3005,http://localhost:5173';

app.enableCors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-tenant-id'],
});
```

**Variables de Entorno:**
```bash
# Desarrollo
CORS_ORIGIN=http://localhost:5173,http://localhost:3000,http://localhost:3005

# Producción
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102
```

---

## 3. INVENTARIO DE APIs - TEACHER PORTAL

### 3.1 Endpoints por Controller

| Controller | Base Path | Endpoints | Archivo |
|------------|-----------|-----------|---------|
| TeacherController | `/teacher` | 22 | teacher.controller.ts |
| TeacherClassroomsController | `/teacher/classrooms` | 13 | teacher-classrooms.controller.ts |
| TeacherGradesController | `/teacher/grades` | 2 | teacher-grades.controller.ts |
| InterventionAlertsController | `/teacher/alerts` | 7 | intervention-alerts.controller.ts |
| TeacherCommunicationController | `/teacher/messages` | 8 | teacher-communication.controller.ts |
| TeacherContentController | `/teacher/content` | 7 | teacher-content.controller.ts |

**Total Teacher: 59 endpoints**

### 3.2 Detalle de Endpoints Teacher

#### Dashboard & Analytics
```yaml
GET /teacher/dashboard/stats          # Estadísticas del classroom
GET /teacher/dashboard/activities     # Actividades recientes
GET /teacher/dashboard/alerts         # Alertas de estudiantes
GET /teacher/dashboard/top-performers # Top estudiantes
GET /teacher/dashboard/module-progress # Progreso de módulos
GET /teacher/analytics                # Analytics del aula
GET /teacher/analytics/classroom/:id  # Analytics por aula
GET /teacher/analytics/engagement     # Métricas de engagement
POST /teacher/reports/generate        # Generar reportes
```

#### Classrooms
```yaml
GET    /teacher/classrooms                    # Listar aulas
POST   /teacher/classrooms                    # Crear aula
GET    /teacher/classrooms/:id                # Obtener aula
PUT    /teacher/classrooms/:id                # Actualizar aula
DELETE /teacher/classrooms/:id                # Eliminar aula
GET    /teacher/classrooms/:id/students       # Estudiantes del aula
GET    /teacher/classrooms/:id/stats          # Estadísticas
GET    /teacher/classrooms/:id/progress       # Progreso del aula
POST   /teacher/classrooms/:id/students/:sid/block    # Bloquear estudiante
POST   /teacher/classrooms/:id/students/:sid/unblock  # Desbloquear
```

#### Students
```yaml
GET  /teacher/students/:id/progress    # Progreso del estudiante
GET  /teacher/students/:id/overview    # Overview
GET  /teacher/students/:id/stats       # Estadísticas
GET  /teacher/students/:id/notes       # Notas del profesor
POST /teacher/students/:id/note        # Agregar nota
GET  /teacher/students/:id/insights    # Insights AI
POST /teacher/students/:id/bonus       # Otorgar ML Coins bonus
```

#### Intervention Alerts
```yaml
GET   /teacher/alerts                          # Listar alertas
GET   /teacher/alerts/:id                      # Detalle de alerta
PATCH /teacher/alerts/:id/acknowledge          # Reconocer alerta
PATCH /teacher/alerts/:id/resolve              # Resolver alerta
PATCH /teacher/alerts/:id/dismiss              # Descartar alerta
GET   /teacher/alerts/student/:id/history      # Historial
POST  /teacher/alerts/generate                 # Generar (testing)
```

#### Messages
```yaml
GET  /teacher/messages                         # Listar mensajes
POST /teacher/messages                         # Enviar mensaje
GET  /teacher/messages/conversations           # Conversaciones
GET  /teacher/messages/unread-count            # No leídos
GET  /teacher/messages/:id                     # Detalle
POST /teacher/messages/:id/read                # Marcar leído
POST /teacher/messages/classroom/:id/announcement # Anuncio
POST /teacher/messages/student/:id/feedback    # Feedback privado
```

#### Content
```yaml
GET    /teacher/content             # Listar contenido
GET    /teacher/content/:id         # Obtener contenido
POST   /teacher/content             # Crear contenido
PUT    /teacher/content/:id         # Actualizar
DELETE /teacher/content/:id         # Eliminar
POST   /teacher/content/:id/clone   # Clonar
PATCH  /teacher/content/:id/publish # Publicar
```

---

## 4. INVENTARIO DE APIs - ADMIN PORTAL

### 4.1 Endpoints por Controller

| Controller | Base Path | Endpoints |
|------------|-----------|-----------|
| AdminDashboardController | `/admin/dashboard` | 11 |
| AdminUsersController | `/admin/users` | 13 |
| AdminRolesController | `/admin/roles` | 4 |
| AdminContentController | `/admin/content` | 10 |
| AdminGamificationConfigController | `/admin/gamification` | 9 |
| ClassroomAssignmentsController | `/admin/classrooms` | 7 |
| ClassroomTeachersRestController | `/admin` | 7 |
| AdminReportsController | `/admin/reports` | 4 |
| AdminLogsController | `/admin/logs` | 1 |
| AdminSystemController | `/admin/system` | 13 |
| AdminAlertsController | `/admin/alerts` | 7 |
| AdminAnalyticsController | `/admin/analytics` | 7 |
| AdminMonitoringController | `/admin/monitoring` | 5 |
| AdminProgressController | `/admin/progress` | 6 |
| AdminOrganizationsController | `/admin/organizations` | 9 |
| AdminBulkOperationsController | `/admin/bulk-operations` | 6 |

**Total Admin: 119 endpoints**

---

## 5. CONSTANTES DE RUTAS CENTRALIZADAS

### 5.1 Archivo de Constantes

**Ubicación:** `apps/backend/src/shared/constants/routes.constants.ts`

**Estadísticas:**
- Total de constantes: 165 endpoints
- Teacher endpoints: 57
- Admin endpoints: 108
- Funciones arrow (rutas dinámicas): 236

### 5.2 Estructura de API_ROUTES

```typescript
export const API_ROUTES = {
  // Configuración base
  API_PREFIX: 'api',
  API_VERSION: 'v1',

  TEACHER: {
    BASE: '/teacher',
    DASHBOARD: { ... },
    CLASSROOMS: { ... },
    STUDENTS: { ... },
    ALERTS: { ... },
    MESSAGES: { ... },
    CONTENT: { ... },
    SUBMISSIONS: { ... },
    ANALYTICS: { ... },
    REPORTS: { ... },
  },

  ADMIN: {
    BASE: '/admin',
    DASHBOARD: { ... },
    USERS: { ... },
    ROLES: { ... },
    ORGANIZATIONS: { ... },
    CONTENT: { ... },
    GAMIFICATION: { ... },
    SYSTEM: { ... },
    ALERTS: { ... },
    ANALYTICS: { ... },
    MONITORING: { ... },
    PROGRESS: { ... },
    REPORTS: { ... },
    LOGS: '/admin/logs',
    BULK_OPERATIONS: { ... },
    CLASSROOM_TEACHERS: { ... },
  },
};
```

---

## 6. TIPOS COMPARTIDOS

### 6.1 Intervention Alerts (Teacher Portal)

**Archivo:** `apps/backend/src/shared/types/intervention-alerts.types.ts`

```typescript
export enum InterventionAlertType {
  NO_ACTIVITY = 'no_activity',
  LOW_SCORE = 'low_score',
  DECLINING_TREND = 'declining_trend',
  REPEATED_FAILURES = 'repeated_failures',
  EXCESSIVE_TIME = 'excessive_time',
  LOW_ENGAGEMENT = 'low_engagement',
}

export enum InterventionAlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum InterventionAlertStatus {
  ACTIVE = 'active',
  ACKNOWLEDGED = 'acknowledged',
  RESOLVED = 'resolved',
  DISMISSED = 'dismissed',
}
```

### 6.2 MessageType (Communication)

**Archivo:** `apps/backend/src/shared/constants/enums.constants.ts`

```typescript
export enum MessageTypeEnum {
  DIRECT = 'direct',
  CLASSROOM_ANNOUNCEMENT = 'classroom_announcement',
  CLASSROOM_CHAT = 'classroom_chat',
  PRIVATE_FEEDBACK = 'private_feedback',
  ASSIGNMENT_COMMENT = 'assignment_comment',
}
```

### 6.3 Mapeo de Tipos Database ↔ Backend ↔ Frontend

| Database Enum | Backend Enum | Frontend Type | Sincronizado |
|---------------|--------------|---------------|--------------|
| `gamification_system.maya_rank` | `MayaRank` | `MayaRank` | ✅ |
| `educational_content.difficulty_level` | `DifficultyLevelEnum` | `DifficultyLevel` | ✅ |
| `progress_tracking.progress_status` | `ProgressStatusEnum` | - | ✅ |
| N/A | `InterventionAlertType` | `InterventionAlertType` | ✅ |
| N/A | `MessageTypeEnum` | `MessageType` | ✅ |

---

## 7. CONFIGURACIÓN FRONTEND

### 7.1 API Config

**Archivo:** `apps/frontend/src/config/api.config.ts`

```typescript
// Variables de entorno
const API_HOST = import.meta.env.VITE_API_HOST || 'localhost:3006';
const API_PROTOCOL = import.meta.env.VITE_API_PROTOCOL || 'http';
const API_VERSION = import.meta.env.VITE_API_VERSION || 'v1';

// URL construida
export const API_BASE_URL = `${API_PROTOCOL}://${API_HOST}/api/${API_VERSION}`;
// Resultado: http://localhost:3006/api/v1
```

### 7.2 Servicios de API Teacher

| Servicio | Archivo | Endpoints |
|----------|---------|-----------|
| teacherApi | teacher/teacherApi.ts | Dashboard, students |
| classroomsApi | teacher/classroomsApi.ts | CRUD classrooms |
| interventionAlertsApi | teacher/interventionAlertsApi.ts | Alertas |
| teacherMessagesApi | teacher/teacherMessagesApi.ts | Comunicación |
| teacherContentApi | teacher/teacherContentApi.ts | Contenido |
| bonusCoinsApi | teacher/bonusCoinsApi.ts | ML Coins bonus |
| analyticsApi | teacher/analyticsApi.ts | Analytics |
| gradingApi | teacher/gradingApi.ts | Calificaciones |

---

## 8. DEPENDENCIAS Y RELACIONES

### 8.1 Dependencias Backend

```yaml
Teacher Module:
  depends_on:
    - AuthModule         # Autenticación JWT
    - DatabaseModule     # TypeORM datasources
    - SharedModule       # Constantes, tipos
  uses_datasources:
    - progress          # progress_tracking schema
    - social            # social_features schema
    - educational       # educational_content schema
    - gamification      # gamification_system schema

Shared Types:
  intervention-alerts.types.ts:
    exported_from: shared/types/index.ts
    consumed_by:
      - teacher/dto/intervention-alerts.dto.ts
      - teacher/entities/student-intervention-alert.entity.ts
      - teacher/services/intervention-alerts.service.ts

  MessageTypeEnum:
    defined_in: shared/constants/enums.constants.ts
    consumed_by:
      - teacher/dto/teacher-messages.dto.ts
      - teacher/services/teacher-messages.service.ts
```

### 8.2 Dependencias Frontend

```yaml
Teacher Portal:
  pages:
    - TeacherDashboard     → teacherApi, classroomsApi
    - TeacherClasses       → classroomsApi, teacherApi
    - TeacherProgressPage  → progressApi, analyticsApi
    - TeacherAlertsPage    → interventionAlertsApi
    - TeacherCommunication → teacherMessagesApi
    - TeacherContentMgmt   → teacherContentApi

  hooks:
    - useInterventionAlerts → interventionAlertsApi
    - useTeacherMessages    → teacherMessagesApi
    - useTeacherContent     → teacherContentApi
    - useGrantBonus         → bonusCoinsApi
    - useClassroomData      → classroomsApi, teacherApi
```

---

## 9. TRAZABILIDAD

### 9.1 User Stories Relacionadas

| US ID | Nombre | Estado | Endpoints |
|-------|--------|--------|-----------|
| US-PM-001 | Dashboard Profesor | ✅ | /teacher/dashboard/* |
| US-PM-002 | Gestión de Aulas | ✅ | /teacher/classrooms/* |
| US-PM-003 | Seguimiento de Estudiantes | ✅ | /teacher/students/* |
| US-PM-004 | Alertas de Intervención | ✅ | /teacher/alerts/* |
| US-PM-005 | Comunicación | ✅ | /teacher/messages/* |
| US-PM-006 | Bloqueo de Alumnos | ✅ | /teacher/classrooms/*/block |
| US-AE-007 | Asignar Grupos a Maestros | ✅ | /admin/classroom-teachers |

### 9.2 GAPs Resueltos

| GAP ID | Descripción | Resolución |
|--------|-------------|------------|
| GAP-T002 | Alertas gestión | ✅ InterventionAlertsController |
| GAP-T003 | Content CRUD | ✅ TeacherContentController |
| GAP-T004 | Grant Bonus ML Coins | ✅ POST /teacher/students/:id/bonus |
| GAP-T005 | Selectores dinámicos | ✅ Frontend hooks |
| GAP-011 | API Config centralizada | ✅ routes.constants.ts |

---

## 10. ARCHIVOS MODIFICADOS

### 10.1 Backend

| Archivo | Cambio | Líneas |
|---------|--------|--------|
| shared/constants/routes.constants.ts | +139 endpoints | 661 |
| shared/types/intervention-alerts.types.ts | Creado | ~80 |
| shared/types/index.ts | Export agregado | +1 |
| shared/constants/enums.constants.ts | +MessageTypeEnum | +20 |
| modules/teacher/dto/intervention-alerts.dto.ts | Imports | Actualizado |
| modules/teacher/dto/teacher-messages.dto.ts | Imports | Actualizado |
| modules/teacher/entities/student-intervention-alert.entity.ts | Imports | Actualizado |
| modules/teacher/services/teacher-messages.service.ts | Imports | Actualizado |

### 10.2 Frontend

| Archivo | Cambio |
|---------|--------|
| shared/constants/api-endpoints.deprecated.ts | Eliminado |
| services/api/teacher/interventionAlertsApi.ts | Comentario sync |

---

## 11. PRÓXIMOS PASOS

### 11.1 Prioridad Alta
- [ ] Refactorizar controllers para usar API_ROUTES constantes
- [ ] Crear tests de contrato Backend↔Frontend

### 11.2 Prioridad Media
- [ ] Aumentar test coverage (actual <30%, target 70%)
- [ ] Documentar Swagger con referencias a constantes

### 11.3 Prioridad Baja
- [ ] Migrar frontend a usar tipos generados desde Swagger
- [ ] Automatizar sincronización de tipos

---

## 12. REFERENCIAS

### Documentación Relacionada
- `docs/90-transversal/INDEX-GAPS-APIS-2025-11-24.md`
- `docs/90-transversal/GAP-011-ENDPOINTS-COMPLETION-SUMMARY.md`
- `docs/97-adr/ADR-015-centralized-api-routes-configuration.md`
- `docs/finiquito/Manual_Portal_Maestros_ACTUALIZADO.md`

### Inventarios
- `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml`
- `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml`
- `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`

### Trazas
- `orchestration/trazas/TRAZA-TAREAS-BACKEND.md`
- `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md`

---

**Autor:** Architecture-Analyst
**Fecha:** 2025-11-24
**Versión:** 1.0
