# Especificacion Tecnica: Modulo Tasks

**Modulo:** `apps/backend/src/modules/tasks/`
**Fecha creacion:** 2026-01-06
**Estado:** Implementado
**Version:** 1.0

---

## Descripcion General

Modulo de tareas programadas (CRON jobs) para mantenimiento automatico del sistema. Gestiona la expiracion de misiones, procesamiento de cola de notificaciones y limpieza de datos antiguos.

---

## Arquitectura

```
modules/tasks/
├── tasks.module.ts                          # Modulo NestJS
└── services/
    ├── missions-cron.service.ts             # CRON jobs de misiones (294 lineas)
    └── notifications-cron.service.ts        # CRON jobs de notificaciones (147 lineas)
```

---

## Dependencias

| Dependencia | Version | Uso |
|-------------|---------|-----|
| @nestjs/schedule | ^4.x | Programacion de tareas CRON |
| GamificationModule | - | Acceso a MissionsService |
| NotificationsModule | - | Acceso a NotificationService |

---

## CRON Jobs

### Servicio: MissionsCronService

| Job | Cron Expression | Horario UTC | Descripcion |
|-----|-----------------|-------------|-------------|
| `daily-missions-reset` | `0 0 * * *` | 00:00 diario | Expira misiones diarias vencidas |
| `weekly-missions-reset` | `0 0 * * 0` | 00:00 domingos | Expira misiones semanales vencidas |
| `check-missions-progress` | `*/5 * * * *` | Cada 5 min | Monitorea progreso de misiones |
| `cleanup-expired-missions` | `0 3 * * *` | 03:00 diario | Archiva misiones expiradas |

### Servicio: NotificationsCronService

| Job | Cron Expression | Horario UTC | Descripcion |
|-----|-----------------|-------------|-------------|
| `notifications-queue-processor` | `* * * * *` | Cada minuto | Procesa cola de notificaciones (max 100/ciclo) |
| `notifications-cleanup` | `0 2 * * *` | 02:00 diario | Elimina notificaciones leidas >30 dias |
| `notification-queue-cleanup` | `0 3 * * 0` | 03:00 domingos | Limpia items procesados de cola >30 dias |

---

## Detalles de Implementacion

### MissionsCronService

#### daily-missions-reset (00:00 UTC)
```
Proposito: Expirar misiones diarias que pasaron su fecha limite
Duracion tipica: <1s
Acciones:
  1. Llamar missionsService.expireOldMissions()
  2. Registrar count de misiones expiradas
  3. Log de duracion y estadisticas
```

#### check-missions-progress (cada 5 min)
```
Proposito: Monitoreo de progreso de misiones activas
Nota: El progreso real es manejado por triggers de BD
Acciones:
  1. Log de monitoreo
  2. Verificacion de salud del sistema
```

#### getCronJobsStatus()
```typescript
// Metodo publico para monitoreo
getCronJobsStatus(): CronJobStatus[]

interface CronJobStatus {
  name: string;
  schedule: string;
  nextRun: string | null;
  isRunning: boolean;
  description: string;
}
```

### NotificationsCronService

#### notifications-queue-processor (cada minuto)
```
Proposito: Procesar cola de notificaciones pendientes (email, push)
Max por ciclo: 100 notificaciones
Retry: Backoff exponencial (5min, 15min, 45min)
Estadisticas:
  - processed: total procesadas
  - succeeded: exitosas
  - failed: fallidas
  - skipped: omitidas
```

#### notifications-cleanup (02:00 UTC)
```
Proposito: Eliminar notificaciones leidas antiguas
Retencion: 30 dias
Acciones:
  1. notificationService.cleanupOldNotifications(30)
  2. Log de cantidad eliminada
```

#### runCleanupNow(daysOld)
```typescript
// Metodo manual para testing/mantenimiento
async runCleanupNow(daysOld: number = 30): Promise<number>
```

---

## Configuracion

### Timezone
Todos los jobs usan **UTC** para evitar problemas con horario de verano.

### ScheduleModule
```typescript
// tasks.module.ts
imports: [
  ScheduleModule.forRoot(),
  GamificationModule,
  NotificationsModule,
]
```

---

## Monitoreo

### Logs
Todos los jobs generan logs estructurados:
```
[CRON:job-name] Starting...
[CRON:job-name] Execution time: 2026-01-06T00:00:00.000Z
[CRON:job-name] Successfully processed X items
[CRON:job-name] Total duration: 150ms
```

### Errores
Los errores se capturan y loggean sin detener otros jobs:
```
[CRON:job-name] Error after 150ms: <error message>
[CRON:job-name] Error stack: <stack trace>
```

### Status Endpoint
```typescript
// Obtener estado de todos los CRON jobs
const status = missionsCronService.getCronJobsStatus();
```

---

## Flujo de Ejecucion

### Cola de Notificaciones
```
Usuario genera notificacion
        |
        v
notification_queue (tabla)
        |
        v [cada minuto]
notifications-queue-processor
        |
        +---> email (via MailService)
        +---> push (via WebPush)
        +---> in-app (ya guardada)
```

### Expiracion de Misiones
```
Mision creada con expires_at
        |
        v [00:00 UTC]
daily-missions-reset
        |
        v
missionsService.expireOldMissions()
        |
        v
status: 'expired'
```

---

## Tablas Afectadas

| Tabla | Operacion | Job |
|-------|-----------|-----|
| `gamification_system.user_missions` | UPDATE (status) | missions-reset |
| `notifications.notifications` | DELETE | notifications-cleanup |
| `notifications.notification_queue` | UPDATE, DELETE | queue-processor, queue-cleanup |

---

## Metricas

| Metrica | Valor |
|---------|-------|
| Total jobs CRON | 7 |
| Jobs de misiones | 4 |
| Jobs de notificaciones | 3 |
| Frecuencia minima | 1 minuto |
| Frecuencia maxima | 1 semana |

---

## Consideraciones de Performance

### Queue Processor
- **Limite por ciclo:** 100 notificaciones
- **Previene:** Sobrecarga del servidor de email
- **Retry:** Maximo 3 intentos con backoff

### Cleanup Jobs
- **Horario:** 02:00-03:00 UTC (baja actividad)
- **Retencion:** 30 dias
- **Impacto BD:** Bajo (DELETE con WHERE indexed)

---

## Testing

### Ejecucion Manual
```typescript
// Para testing
await notificationsCronService.runCleanupNow(7); // Limpiar >7 dias
```

### Mock en Tests
```typescript
// Mockear ScheduleModule para tests unitarios
jest.mock('@nestjs/schedule');
```

---

## Referencias

- **Codigo:** `apps/backend/src/modules/tasks/`
- **Dependencias:** GamificationModule, NotificationsModule
- **Documentacion NestJS:** https://docs.nestjs.com/techniques/task-scheduling

---

*Especificacion generada automaticamente - 2026-01-06*
