<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Cron Jobs de Mantenimiento -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Cron Jobs de Mantenimiento

## Información General

Este documento describe las tareas programadas de mantenimiento y limpieza automática del sistema GAMILIT.

**Jobs Activos:** 2
**Jobs Planificados:** 3

---

## Tabla de Contenidos

1. [Jobs Activos](#jobs-activos)
   - [Cleanup Expired Missions](#cleanup-expired-missions)
   - [Cleanup Old Notifications](#cleanup-old-notifications)
2. [Jobs Planificados](#jobs-planificados)
   - [Daily Reset](#daily-reset)
   - [Streaks Update](#streaks-update)
   - [Leaderboards Update](#leaderboards-update)
3. [Políticas de Retención](#políticas-de-retención)
4. [Monitoreo y Alertas](#monitoreo-y-alertas)

---

## Jobs Activos

### Cleanup Expired Missions

**Cron:** `0 3 * * *` (Todos los días a las 03:00 UTC)

**Archivo:** `/src/modules/gamification/missions/missions.cron.ts`

**Propósito:** Elimina misiones expiradas antiguas para liberar espacio en DB

#### Flujo de Ejecución

```
1. Busca misiones con:
   - status = 'expired'
   - endDate < (now - 30 días)

2. Elimina registros de la base de datos

3. Registra número de misiones eliminadas
```

#### Código de Implementación

```typescript
export const cleanupExpiredMissions = cron.schedule('0 3 * * *', async () => {
  try {
    log.info('[CRON] Starting cleanup of expired missions...');

    const deletedCount = await missionsRepository.deleteExpiredMissions(30);

    log.info(`[CRON] Cleanup completed. Deleted ${deletedCount} expired missions`);
  } catch (error) {
    log.error('[CRON] Error in cleanup expired missions:', error);
  }
});
```

#### Query SQL

```sql
DELETE FROM gamification.missions
WHERE status = 'expired'
  AND end_date < NOW() - INTERVAL '30 days';
```

#### Políticas de Retención

- Misiones activas: se mantienen indefinidamente
- Misiones completadas: se mantienen 90 días
- Misiones expiradas: se mantienen 30 días
- Misiones reclamadas: se mantienen indefinidamente (historial)

#### Log de Ejemplo

```
[2025-10-27 03:00:00] [CRON] Starting cleanup of expired missions...
[2025-10-27 03:00:02] [CRON] Cleanup completed. Deleted 523 expired missions
```

---

### Cleanup Old Notifications

**Cron:** `0 2 * * *` (Todos los días a las 02:00 UTC)

**Archivo:** `/src/modules/notifications/notifications.cron.ts`

**Propósito:** Elimina notificaciones leídas antiguas para mantener DB limpia

#### Flujo de Ejecución

```
1. Busca notificaciones con:
   - is_read = true
   - read_at < (now - 30 días)

2. Elimina registros de la base de datos

3. Registra número de notificaciones eliminadas
```

#### Código de Implementación

```typescript
export function startNotificationsCronJobs(): void {
  log.info('Starting notifications cron jobs...');

  cleanupTask = cron.schedule('0 2 * * *', async () => {
    try {
      log.info('Running notifications cleanup cron job...');

      const deletedCount = await notificationsService.cleanupOldNotifications(30);

      log.info(`Notifications cleanup completed. Deleted ${deletedCount} old notifications.`);
    } catch (error) {
      log.error('Error in notifications cleanup cron job:', error);
    }
  });

  log.info('Notifications cron jobs started successfully');
  log.info('  - Cleanup job: Daily at 2:00 AM (deletes read notifications older than 30 days)');
}
```

#### Políticas de Retención

- Notificaciones no leídas: se mantienen indefinidamente
- Notificaciones leídas: se mantienen 30 días
- Notificaciones importantes (priority='urgent'): se mantienen 90 días

#### Query SQL

```sql
DELETE FROM notifications.user_notifications
WHERE is_read = true
  AND read_at < NOW() - INTERVAL '30 days'
  AND priority != 'urgent';
```

#### Log de Ejemplo

```
[2025-10-27 02:00:00] Running notifications cleanup cron job...
[2025-10-27 02:00:01] Notifications cleanup completed. Deleted 1247 old notifications.
```

---

## Jobs Planificados

### Daily Reset

**Cron:** `0 0 * * *` (00:00 UTC)

**Propósito:** Reset diario de contadores y estados

#### Tareas Planificadas

- Reset de intentos de login fallidos
- Reset de rate limits diarios
- Actualización de leaderboards diarios
- Envío de resumen diario a usuarios activos

#### Código Placeholder

```typescript
// TODO: Implement
// export const dailyResetCronJobs = cron.schedule('0 0 * * *', async () => {
//   // Reset login attempts
//   // Reset rate limits
//   // Update daily leaderboards
//   // Send daily summary emails
// });
```

---

### Streaks Update

**Cron:** `0 1 * * *` (01:00 UTC)

**Propósito:** Actualiza rachas de usuarios

#### Tareas Planificadas

- Verificar actividad del día anterior
- Incrementar streak si usuario estuvo activo
- Resetear streak a 0 si usuario no estuvo activo
- Enviar notificación si se rompe racha larga (>7 días)
- Otorgar bonus por rachas (7, 30, 100 días)

#### Código Placeholder

```typescript
// TODO: Implement
// export const streaksCronJobs = cron.schedule('0 1 * * *', async () => {
//   // Check yesterday's activity
//   // Update streaks
//   // Award streak bonuses
//   // Send notifications
// });
```

---

### Leaderboards Update

**Cron:** `0 2 * * *` (02:00 UTC)

**Propósito:** Recalcula tablas de clasificación

#### Tareas Planificadas

- Recalcular leaderboard global
- Recalcular leaderboards por classroom
- Recalcular leaderboards por guild
- Cachear resultados en Redis
- Enviar notificaciones a top 10

#### Código Placeholder

```typescript
// TODO: Implement
// export const leaderboardsCronJobs = cron.schedule('0 2 * * *', async () => {
//   // Recalculate global leaderboard
//   // Recalculate classroom leaderboards
//   // Recalculate guild leaderboards
//   // Cache results
//   // Notify top players
// });
```

---

## Políticas de Retención

### Tabla de Retención por Entidad

| Entidad | Estado | Período de Retención |
|---------|--------|---------------------|
| Misiones | Activa | Indefinido |
| Misiones | Completada | 90 días |
| Misiones | Expirada | 30 días |
| Misiones | Reclamada | Indefinido |
| Notificaciones | No leída | Indefinido |
| Notificaciones | Leída (normal) | 30 días |
| Notificaciones | Leída (urgente) | 90 días |
| Sesiones | Activa | Indefinido |
| Sesiones | Expirada | 7 días |
| Logs de Seguridad | - | 365 días |
| Actividades | - | 180 días |

### Justificación

**30 días para notificaciones leídas:**
- Balance entre historial útil y espacio en DB
- Usuario tiene tiempo suficiente para revisar
- Reduce carga en queries

**30 días para misiones expiradas:**
- Permite análisis post-mortem de misiones
- Mantiene datos para estadísticas mensuales
- Limpia datos no utilizados después de un ciclo

**90 días para misiones completadas:**
- Mantiene historial de logros recientes
- Útil para analytics trimestrales
- Usuario puede revisar su progreso

---

## Monitoreo y Alertas

### Métricas a Monitorear

```typescript
interface CronJobMetrics {
  jobName: string;
  lastRun: Date;
  lastDuration: number;
  lastSuccessCount: number;
  lastErrorCount: number;
  totalRuns: number;
  totalErrors: number;
}

const metrics: Map<string, CronJobMetrics> = new Map();

const recordMetrics = (
  jobName: string,
  duration: number,
  successCount: number,
  errorCount: number
) => {
  const existing = metrics.get(jobName) || {
    jobName,
    totalRuns: 0,
    totalErrors: 0,
  };

  metrics.set(jobName, {
    ...existing,
    lastRun: new Date(),
    lastDuration: duration,
    lastSuccessCount: successCount,
    lastErrorCount: errorCount,
    totalRuns: existing.totalRuns + 1,
    totalErrors: existing.totalErrors + errorCount,
  });
};
```

### Endpoint de Métricas

```typescript
router.get('/admin/cron/metrics',
  authenticateJWT,
  requireRole('super_admin'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        metrics: Array.from(metrics.values())
      }
    });
  }
);
```

### Sistema de Alertas

```typescript
const notifyAdminOnError = async (jobName: string, error: Error) => {
  // Log error
  log.error(`[CRON] Job ${jobName} failed:`, error);

  // Send email to admins
  await emailService.sendAdminAlert({
    subject: `Cron Job Failed: ${jobName}`,
    body: `
      Job: ${jobName}
      Error: ${error.message}
      Stack: ${error.stack}
      Time: ${new Date().toISOString()}
    `,
  });

  // Create notification for super_admins
  const admins = await getUsersByRole('super_admin');
  for (const admin of admins) {
    await notificationsService.createNotification({
      userId: admin.id,
      type: 'system_announcement',
      title: 'Cron Job Failed',
      message: `Job ${jobName} failed: ${error.message}`,
      priority: 'urgent',
    });
  }
};
```

---

## Ejecución Manual

### Función de Ejecución Manual

Para testing/debugging de tareas de limpieza:

```typescript
// En notifications.cron.ts
export async function runCleanupNow(daysOld: number = 30): Promise<number> {
  try {
    log.info(`Running manual notifications cleanup (${daysOld} days old)...`);

    const deletedCount = await notificationsService.cleanupOldNotifications(daysOld);

    log.info(`Manual cleanup completed. Deleted ${deletedCount} notifications.`);

    return deletedCount;
  } catch (error) {
    log.error('Error in manual cleanup:', error);
    throw error;
  }
}
```

### Endpoint Admin para Ejecución Manual

```typescript
// En admin.routes.ts
router.post('/system/maintenance/cleanup-notifications',
  authenticateJWT,
  requireRole('super_admin'),
  async (req, res) => {
    try {
      const { daysOld = 30 } = req.body;
      const count = await runCleanupNow(daysOld);

      res.json({
        success: true,
        data: {
          message: 'Cleanup completed',
          deletedCount: count
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## Logs Estructurados

### Formato de Logs

```typescript
log.info('[CRON] Starting cleanup...', {
  jobName: 'cleanupExpiredMissions',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV
});

log.info('[CRON] Cleanup completed', {
  jobName: 'cleanupExpiredMissions',
  deletedCount: 523,
  duration: 2341,
  timestamp: new Date().toISOString()
});
```

### Ejemplo de Log Completo

```
[2025-10-27 03:00:00] [CRON] Starting cleanup of expired missions...
[2025-10-27 03:00:00] {
  "jobName": "cleanupExpiredMissions",
  "timestamp": "2025-10-27T03:00:00.000Z",
  "environment": "production",
  "action": "start"
}
[2025-10-27 03:00:02] [CRON] Cleanup completed. Deleted 523 expired missions
[2025-10-27 03:00:02] {
  "jobName": "cleanupExpiredMissions",
  "deletedCount": 523,
  "duration": 2341,
  "timestamp": "2025-10-27T03:00:02.341Z",
  "action": "complete"
}
```

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Siguiente:** [Cron-Reportes.md](./Cron-Reportes.md)
- **Relacionado:** [Cron-Gamificacion.md](./Cron-Gamificacion.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
