---
id: "ET-TCH-007"
title: "Sistema de Alertas y Bloqueo - Especificacion Tecnica"
type: "Especificacion Tecnica"
status: "Implementado"
priority: "P0"
epic: "EXT-001"
module: "teacher"
labels: ["teacher", "alerts", "intervention", "blocking", "permissions", "at-risk"]
created_date: "2026-01-27"
updated_date: "2026-01-27"
related_rf: ["RF-TCH-006", "RF-TCH-007"]
related_us: ["US-PM-006", "US-PM-007"]
---

# ET-TCH-007: Sistema de Alertas y Bloqueo - Especificacion Tecnica

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | ET-TCH-007 |
| **Epic** | EXT-001 - Portal de Maestros |
| **RF Relacionados** | RF-TCH-006 (Bloquear/Desbloquear), RF-TCH-007 (Alertas de Intervencion) |
| **US Relacionadas** | US-PM-006, US-PM-007 |
| **Prioridad** | P0 - Critico |
| **Estado** | Implementado |

---

## Descripcion Tecnica

Sistema de alertas e intervenciones que permite a los maestros:

1. **Alertas de Intervencion**: Detectar estudiantes en riesgo automaticamente
2. **Configuracion de Alertas**: Personalizar umbrales y notificaciones
3. **Bloqueo de Estudiantes**: Suspender temporalmente acceso
4. **Gestion de Permisos**: Controlar acceso granular a funciones
5. **Historial de Alertas**: Registro de intervenciones realizadas
6. **Notificaciones**: Alertas automaticas al maestro

---

## Componentes Frontend

### Paginas Principales

| Componente | Path | Descripcion |
|------------|------|-------------|
| `TeacherAlertsPage` | `apps/frontend/src/apps/teacher/pages/TeacherAlertsPage.tsx` | Pagina de alertas |
| `TeacherAlertConfigPage` | `apps/frontend/src/apps/teacher/pages/TeacherAlertConfigPage.tsx` | Configuracion de alertas |

### Componentes de Alertas

| Componente | Path | Descripcion |
|------------|------|-------------|
| `InterventionAlertsPanel` | `apps/frontend/src/apps/teacher/components/alerts/InterventionAlertsPanel.tsx` | Panel de alertas |
| `AlertCard` | `apps/frontend/src/apps/teacher/components/alerts/AlertCard.tsx` | Card de alerta individual |
| `StudentAlerts` | `apps/frontend/src/apps/teacher/components/dashboard/StudentAlerts.tsx` | Alertas en dashboard |

### Componentes de Bloqueo

| Componente | Path | Descripcion |
|------------|------|-------------|
| `SuspendStudentModal` | `apps/frontend/src/apps/teacher/components/monitoring/SuspendStudentModal.tsx` | Modal de suspension |
| `StudentActionsMenu` | `apps/frontend/src/apps/teacher/components/monitoring/StudentActionsMenu.tsx` | Menu de acciones |

### Hooks

| Hook | Path | Descripcion |
|------|------|-------------|
| `useInterventionAlerts` | `apps/frontend/src/apps/teacher/hooks/useInterventionAlerts.ts` | Hook de alertas |
| `useStudentBlocking` | `apps/frontend/src/apps/teacher/hooks/useStudentBlocking.ts` | Hook de bloqueo |
| `useAlertConfig` | `apps/frontend/src/apps/teacher/hooks/useAlertConfig.ts` | Hook de configuracion |

### Constantes

| Archivo | Path | Descripcion |
|---------|------|-------------|
| `alertTypes` | `apps/frontend/src/apps/teacher/constants/alertTypes.ts` | Tipos de alertas |

### API Frontend

| API | Path | Descripcion |
|-----|------|-------------|
| `interventionAlertsApi` | `apps/frontend/src/services/api/teacher/interventionAlertsApi.ts` | API de alertas |
| `alertConfigApi` | `apps/frontend/src/services/api/teacher/alertConfigApi.ts` | API de configuracion |

---

## Servicios Backend

### Servicios Principales

| Servicio | Path | Descripcion |
|----------|------|-------------|
| `StudentBlockingService` | `apps/backend/src/modules/teacher/services/student-blocking.service.ts` | Bloqueo y permisos |
| `InterventionAlertsService` | `apps/backend/src/modules/teacher/services/intervention-alerts.service.ts` | Alertas de intervencion |
| `StudentRiskAlertService` | `apps/backend/src/modules/teacher/services/student-risk-alert.service.ts` | Deteccion automatica (CRON) |
| `AlertConfigService` | `apps/backend/src/modules/teacher/services/alert-config.service.ts` | Configuracion de alertas |

### Controladores

| Controlador | Path | Descripcion |
|-------------|------|-------------|
| `TeacherClassroomsController` | `apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts` | Endpoints de bloqueo |
| `InterventionAlertsController` | `apps/backend/src/modules/teacher/controllers/intervention-alerts.controller.ts` | Endpoints de alertas |
| `AlertConfigController` | `apps/backend/src/modules/teacher/controllers/alert-config.controller.ts` | Endpoints de configuracion |

### Entidades

| Entidad | Path | Descripcion |
|---------|------|-------------|
| `StudentInterventionAlert` | `apps/backend/src/modules/teacher/entities/student-intervention-alert.entity.ts` | Entidad de alerta |
| `TeacherAlertConfiguration` | `apps/backend/src/modules/progress/entities/teacher-alert-configuration.entity.ts` | Configuracion de alerta |

### DTOs

| DTO | Path | Descripcion |
|-----|------|-------------|
| `BlockStudentDto` | `apps/backend/src/modules/teacher/dto/student-blocking/block-student.dto.ts` | DTO de bloqueo |
| `UpdatePermissionsDto` | `apps/backend/src/modules/teacher/dto/student-blocking/update-permissions.dto.ts` | DTO de permisos |
| `StudentPermissionsResponseDto` | `apps/backend/src/modules/teacher/dto/student-blocking/student-permissions-response.dto.ts` | Response de permisos |
| `InterventionAlertsDto` | `apps/backend/src/modules/teacher/dto/intervention-alerts.dto.ts` | DTO de alertas |
| `AlertConfigDto` | `apps/backend/src/modules/teacher/dto/alert-config.dto.ts` | DTO de configuracion |

### Guards

| Guard | Path | Descripcion |
|-------|------|-------------|
| `TeacherGuard` | `apps/backend/src/modules/teacher/guards/teacher.guard.ts` | Verificar rol teacher |
| `ClassroomOwnershipGuard` | `apps/backend/src/modules/teacher/guards/classroom-ownership.guard.ts` | Verificar acceso a aula |

---

## Tablas/Schemas de Base de Datos

### Schema: `progress_tracking`

| Tabla | Descripcion | Columnas Clave |
|-------|-------------|----------------|
| `student_intervention_alerts` | Alertas generadas | id, student_id, classroom_id, alert_type, severity, status, created_by, resolved_at |
| `teacher_alert_configuration` | Configuracion por maestro | id, teacher_id, alert_type, threshold, is_enabled, notification_method |

### Tipos de Alerta

```sql
alert_type VARCHAR(50) CHECK (alert_type IN (
  'low_progress',        -- Bajo progreso
  'low_grades',          -- Bajas calificaciones
  'inactivity',          -- Inactividad prolongada
  'at_risk',             -- En riesgo (combinado)
  'failing_module',      -- Fallando modulo
  'missed_deadlines'     -- Deadlines perdidos
))
```

### Severidad

```sql
severity VARCHAR(20) CHECK (severity IN ('low', 'medium', 'high', 'critical'))
```

### Estados de Alerta

```sql
status VARCHAR(20) CHECK (status IN ('active', 'acknowledged', 'resolved', 'dismissed'))
```

### Permisos Granulares

```typescript
interface StudentPermissions {
  canAccessPlatform: boolean;  // Acceso general
  canSubmitExercises: boolean; // Entregar ejercicios
  canViewContent: boolean;     // Ver contenido
  canParticipateGamification: boolean; // Gamificacion
  canCommunicate: boolean;     // Comunicacion
  blockedUntil?: Date;         // Fecha de desbloqueo
  blockReason?: string;        // Razon del bloqueo
}
```

---

## APIs Endpoints

### Bloqueo de Estudiantes

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/classrooms/:classroomId/students/:studentId/block` | POST | Bloquear estudiante |
| `/api/v1/teacher/classrooms/:classroomId/students/:studentId/unblock` | POST | Desbloquear estudiante |
| `/api/v1/teacher/classrooms/:classroomId/students/:studentId/permissions` | GET | Ver permisos |
| `/api/v1/teacher/classrooms/:classroomId/students/:studentId/permissions` | PATCH | Actualizar permisos |

### Alertas de Intervencion

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/alerts` | GET | Listar alertas |
| `/api/v1/teacher/alerts/:id` | GET | Obtener alerta |
| `/api/v1/teacher/alerts/:id/acknowledge` | POST | Reconocer alerta |
| `/api/v1/teacher/alerts/:id/resolve` | POST | Resolver alerta |
| `/api/v1/teacher/alerts/:id/dismiss` | POST | Descartar alerta |

### Configuracion de Alertas

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/api/v1/teacher/alert-config` | GET | Ver configuracion |
| `/api/v1/teacher/alert-config` | PUT | Actualizar configuracion |
| `/api/v1/teacher/alert-config/reset` | POST | Resetear a defaults |

### Ejemplo Request POST /teacher/classrooms/:id/students/:id/block

```json
{
  "reason": "Comportamiento inapropiado en plataforma",
  "blockedUntil": "2026-02-01T00:00:00Z",
  "blockAllAccess": false,
  "permissions": {
    "canAccessPlatform": true,
    "canSubmitExercises": false,
    "canViewContent": true,
    "canParticipateGamification": false,
    "canCommunicate": false
  },
  "notifyParent": true
}
```

### Ejemplo Response GET /teacher/alerts

```json
{
  "alerts": [
    {
      "id": "uuid-alert-1",
      "studentId": "uuid-student-1",
      "studentName": "Juan Perez",
      "classroomId": "uuid-classroom-1",
      "classroomName": "Matematicas 6A",
      "alertType": "at_risk",
      "severity": "high",
      "status": "active",
      "message": "Progreso bajo (45%) y calificacion promedio bajo (62%)",
      "metrics": {
        "completionRate": 45,
        "averageGrade": 62,
        "daysSinceLastActivity": 5
      },
      "createdAt": "2026-01-25T10:00:00Z",
      "createdBy": "system"
    }
  ],
  "stats": {
    "total": 8,
    "critical": 2,
    "high": 3,
    "medium": 2,
    "low": 1
  }
}
```

### Ejemplo PUT /teacher/alert-config

```json
{
  "alertConfigs": [
    {
      "alertType": "low_progress",
      "threshold": 40,
      "isEnabled": true,
      "notificationMethod": "dashboard"
    },
    {
      "alertType": "inactivity",
      "threshold": 7,
      "isEnabled": true,
      "notificationMethod": "email"
    },
    {
      "alertType": "at_risk",
      "isEnabled": true,
      "notificationMethod": "both"
    }
  ]
}
```

---

## Flujos de Usuario

### Flujo 1: Bloquear Estudiante

```
1. Maestro en detalle de estudiante
2. Click en "Suspender Acceso"
3. SuspendStudentModal se abre
4. Seleccionar razon y duracion
5. Configurar permisos granulares
6. POST /teacher/classrooms/:id/students/:id/block
7. Estudiante bloqueado
8. Notificacion a padre (opcional)
```

### Flujo 2: Desbloquear Estudiante

```
1. Maestro en estudiantes bloqueados
2. Click en "Desbloquear"
3. Confirmacion
4. POST /teacher/classrooms/:id/students/:id/unblock
5. Permisos restaurados
```

### Flujo 3: Ver y Gestionar Alertas

```
1. Maestro accede a /teacher/alerts
2. GET /teacher/alerts
3. Ver lista ordenada por severidad
4. Filtrar por tipo, classroom, estado
5. Click en alerta -> detalle
6. Opciones: Reconocer, Resolver, Descartar
```

### Flujo 4: Configurar Umbrales

```
1. Maestro accede a configuracion de alertas
2. GET /teacher/alert-config
3. Ver configuracion actual
4. Ajustar umbrales (ej: progreso < 40%)
5. Habilitar/deshabilitar tipos
6. Seleccionar metodo de notificacion
7. PUT /teacher/alert-config
```

### Flujo 5: Deteccion Automatica (CRON)

```
1. StudentRiskAlertService ejecuta cada hora
2. Consulta estudiantes activos
3. Aplica formula at_risk
4. Si at_risk = true y no hay alerta activa:
   - Crear StudentInterventionAlert
   - Notificar a maestro (segun config)
5. Log de ejecucion
```

---

## Dependencias

### Dependencias de Modulos

- `NotificationsModule` - Para notificaciones
- `ScheduleModule` - Para CRON de deteccion
- `AuthModule` - Para permisos

### Dependencias de User Stories

- Depende de: `US-PM-001*` (Classrooms), `US-PM-004*` (Analytics)
- Habilita: Intervenciones tempranas, compliance

---

## Criterios de Aceptacion

### CA-01: Bloqueo de Estudiantes
- [x] Bloquear estudiante con razon
- [x] Establecer fecha de desbloqueo
- [x] Permisos granulares
- [x] Historial de bloqueos

### CA-02: Desbloqueo
- [x] Desbloquear manualmente
- [x] Desbloqueo automatico por fecha
- [x] Restaurar permisos

### CA-03: Alertas de Intervencion
- [x] Detectar estudiantes at-risk automaticamente
- [x] Mostrar alertas en dashboard
- [x] Estados: active, acknowledged, resolved, dismissed

### CA-04: Configuracion
- [x] Personalizar umbrales por tipo
- [x] Habilitar/deshabilitar tipos de alerta
- [x] Seleccionar metodo de notificacion

### CA-05: Formula At-Risk
- [x] Aplicar: `at_risk = (avg_grade < 70%) OR (completion_rate < 50%)`
- [x] Verificar inactividad > 7 dias
- [x] Ejecutar deteccion periodica (CRON)

### CA-06: Notificaciones
- [x] Notificacion en dashboard
- [x] Notificacion por email (opcional)
- [x] Badge de alertas en menu

---

## Notas de Implementacion

### CRON de Deteccion

```typescript
@Injectable()
export class StudentRiskAlertService {
  @Cron(CronExpression.EVERY_HOUR)
  async detectAtRiskStudents() {
    const activeStudents = await this.getActiveStudents();

    for (const student of activeStudents) {
      const stats = await this.getStudentStats(student.id);
      const isAtRisk = stats.averageGrade < 70 || stats.completionRate < 50;

      if (isAtRisk) {
        const existingAlert = await this.findActiveAlert(student.id, 'at_risk');
        if (!existingAlert) {
          await this.createAlert({
            studentId: student.id,
            alertType: 'at_risk',
            severity: this.calculateSeverity(stats),
            metrics: stats,
          });
          await this.notifyTeacher(student.classroomId, student.id);
        }
      }
    }
  }
}
```

### Formula At-Risk (Referencia)

Ver: [AT-RISK-LOGIC-STANDARD.md](./AT-RISK-LOGIC-STANDARD.md)

```typescript
function calculateAtRisk(stats: StudentStats): {
  isAtRisk: boolean;
  severity: Severity;
  factors: string[];
} {
  const factors: string[] = [];
  let riskScore = 0;

  if (stats.averageGrade < 70) {
    factors.push('low_grades');
    riskScore += stats.averageGrade < 50 ? 40 : 20;
  }

  if (stats.completionRate < 50) {
    factors.push('low_progress');
    riskScore += stats.completionRate < 30 ? 40 : 20;
  }

  if (stats.daysSinceActivity > 7) {
    factors.push('inactivity');
    riskScore += stats.daysSinceActivity > 14 ? 30 : 15;
  }

  return {
    isAtRisk: factors.length > 0,
    severity: riskScore >= 60 ? 'critical' : riskScore >= 40 ? 'high' : riskScore >= 20 ? 'medium' : 'low',
    factors,
  };
}
```

### Permisos Middleware

```typescript
// Middleware para verificar permisos del estudiante
@Injectable()
export class StudentPermissionsMiddleware implements NestMiddleware {
  async use(req: Request, res: Response, next: NextFunction) {
    const userId = req.user?.id;
    if (!userId) return next();

    const permissions = await this.blockingService.getPermissions(userId);

    if (!permissions.canAccessPlatform) {
      throw new ForbiddenException('Acceso suspendido');
    }

    req['studentPermissions'] = permissions;
    next();
  }
}
```

---

## Referencias

- US-PM-006: Bloquear/Desbloquear Alumnos
- US-PM-007: Configuracion de Alertas
- AT-RISK-LOGIC-STANDARD.md: Formula estandarizada
- TRACEABILITY.yml: Mapeo de implementacion

---

**Creado:** 2026-01-27
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
