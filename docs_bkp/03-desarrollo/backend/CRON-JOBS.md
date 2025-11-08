# Cron Jobs y Tareas Programadas

## Información General

**Librería:** node-cron 4.2.1
**Sintaxis:** Cron expressions (formato Unix)
**Total Jobs:** 6 cron jobs activos

---

## Tabla de Contenidos

1. [Cron Jobs de Misiones](#1-cron-jobs-de-misiones) (4 jobs)
2. [Cron Jobs de Notificaciones](#2-cron-jobs-de-notificaciones) (1 job)
3. [Cron Jobs Planificados](#3-cron-jobs-planificados-futuro) (3 jobs)
4. [Sintaxis de Cron](#sintaxis-de-cron)
5. [Gestión de Cron Jobs](#gestión-de-cron-jobs)

---

## 1. Cron Jobs de Misiones

**Archivo:** `/src/modules/gamification/missions/missions.cron.ts`

### Job 1: Daily Missions Reset

**Cron:** `0 0 * * *` (Todos los días a las 00:00 UTC)

**Propósito:** Expira misiones diarias antiguas y genera nuevas para usuarios activos

**Flujo:**
```
1. Expira todas las misiones diarias caducadas
   - Cambia status de 'active' a 'expired'
   - Para misiones con endDate < now

2. Obtiene lista de usuarios activos
   - Usuarios con login en últimos 7 días
   - O usuarios con progreso reciente

3. Para cada usuario activo:
   a. Verifica si ya tiene misiones diarias activas
   b. Si no tiene:
      - Selecciona 3 plantillas aleatorias de misiones diarias
      - Crea 3 nuevas misiones con endDate = 23:59:59 del día
      - Inicializa objetivos en current=0

4. Registra estadísticas:
   - Usuarios procesados exitosamente
   - Errores ocurridos
   - Tiempo de ejecución
```

**Código Relevante:**
```typescript
export const dailyMissionsReset = cron.schedule('0 0 * * *', async () => {
  try {
    log.info('[CRON] Starting daily missions reset...');

    const startTime = Date.now();

    // Paso 1: Expirar misiones antiguas
    const expiredCount = await missionsRepository.expireMissions();
    log.info(`[CRON] Expired ${expiredCount} missions`);

    // Paso 2: Obtener usuarios activos
    const activeUserIds = await missionsRepository.getActiveUserIds();
    log.info(`[CRON] Found ${activeUserIds.length} active users`);

    // Paso 3: Crear misiones para cada usuario
    let successCount = 0;
    let errorCount = 0;

    for (const userId of activeUserIds) {
      try {
        const existingMissions = await missionsRepository.getActiveMissionsByType(
          userId,
          'daily'
        );

        if (existingMissions.length === 0) {
          const templates = getRandomDailyTemplates(3);

          const endDate = new Date();
          endDate.setUTCHours(23, 59, 59, 999);

          for (const template of templates) {
            const objectives = template.objectives.map((obj) => ({
              ...obj,
              current: 0,
            }));

            await missionsRepository.createMission(
              userId,
              template.id,
              template.title,
              template.description,
              'daily',
              objectives,
              template.rewards,
              endDate
            );
          }

          successCount++;
        }
      } catch (error) {
        log.error(`[CRON] Error creating daily missions for user ${userId}:`, error);
        errorCount++;
      }
    }

    const duration = Date.now() - startTime;

    log.info('[CRON] Daily missions reset completed');
    log.info(`[CRON] Stats: ${successCount} users processed, ${errorCount} errors`);
    log.info(`[CRON] Duration: ${duration}ms`);
  } catch (error) {
    log.error('[CRON] Error in daily missions reset:', error);
  }
});
```

**Plantillas de Misiones Diarias:**
```typescript
const DAILY_MISSION_TEMPLATES = [
  {
    id: 'daily_exercise_3',
    title: 'Daily Practice',
    description: 'Complete 3 exercises today',
    objectives: [
      { description: 'Complete exercises', target: 3, type: 'exercise_completion' }
    ],
    rewards: { mlCoins: 100, xp: 200 }
  },
  {
    id: 'daily_perfect_2',
    title: 'Perfectionist',
    description: 'Get perfect scores on 2 exercises',
    objectives: [
      { description: 'Perfect scores', target: 2, type: 'perfect_score' }
    ],
    rewards: { mlCoins: 150, xp: 300 }
  },
  {
    id: 'daily_streak',
    title: 'Keep the Streak',
    description: 'Login and complete at least 1 exercise',
    objectives: [
      { description: 'Login', target: 1, type: 'daily_login' },
      { description: 'Exercise', target: 1, type: 'exercise_completion' }
    ],
    rewards: { mlCoins: 50, xp: 100 }
  },
  // ... más plantillas
];
```

**Log de Ejemplo:**
```
[2025-10-27 00:00:00] [CRON] Starting daily missions reset...
[2025-10-27 00:00:01] [CRON] Expired 1523 missions
[2025-10-27 00:00:02] [CRON] Found 1250 active users
[2025-10-27 00:00:45] [CRON] Daily missions reset completed
[2025-10-27 00:00:45] [CRON] Stats: 1248 users processed, 2 errors
[2025-10-27 00:00:45] [CRON] Duration: 45123ms
```

---

### Job 2: Weekly Missions Reset

**Cron:** `0 0 * * 1` (Todos los lunes a las 00:00 UTC)

**Propósito:** Expira misiones semanales antiguas y genera nuevas

**Flujo:**
```
1. Expira todas las misiones semanales caducadas

2. Obtiene lista de usuarios activos

3. Calcula fecha de fin (próximo lunes a las 00:00 UTC)

4. Para cada usuario activo:
   a. Verifica si ya tiene misiones semanales activas
   b. Si no tiene:
      - Selecciona 5 plantillas aleatorias de misiones semanales
      - Crea 5 nuevas misiones con endDate = próximo lunes
      - Inicializa objetivos en current=0

5. Registra estadísticas
```

**Plantillas de Misiones Semanales:**
```typescript
const WEEKLY_MISSION_TEMPLATES = [
  {
    id: 'weekly_exercise_15',
    title: 'Weekly Practice',
    description: 'Complete 15 exercises this week',
    objectives: [
      { description: 'Complete exercises', target: 15, type: 'exercise_completion' }
    ],
    rewards: { mlCoins: 500, xp: 1000 }
  },
  {
    id: 'weekly_streak_5',
    title: 'Consistent Learner',
    description: 'Login 5 days this week',
    objectives: [
      { description: 'Login days', target: 5, type: 'login_days' }
    ],
    rewards: { mlCoins: 300, xp: 600 }
  },
  {
    id: 'weekly_module',
    title: 'Module Master',
    description: 'Complete an entire module',
    objectives: [
      { description: 'Complete module', target: 1, type: 'module_completion' }
    ],
    rewards: { mlCoins: 1000, xp: 2000 }
  },
  // ... más plantillas
];
```

**Diferencias con Daily:**
- Más objetivos (target más alto)
- Más recompensas (3-5x más coins/XP)
- Plazo de 7 días en lugar de 1 día
- Menos misiones por usuario (5 vs 3)

---

### Job 3: Check Missions Progress

**Cron:** `0 * * * *` (Cada hora)

**Propósito:** Verifica progreso de misiones activas y auto-completa las que llegaron a 100%

**Flujo:**
```
1. Obtiene lista de usuarios activos

2. Para cada usuario:
   a. Obtiene todas sus misiones activas
   b. Para cada misión:
      - Verifica si todos los objetivos están completados
      - Si todos complete (current >= target):
        * Cambia status a 'completed'
        * Registra completedAt timestamp
        * Envía notificación al usuario

3. Registra estadísticas:
   - Usuarios verificados
   - Misiones auto-completadas
```

**Código Relevante:**
```typescript
export const checkMissionsProgress = cron.schedule('0 * * * *', async () => {
  try {
    log.info('[CRON] Checking missions progress...');

    const startTime = Date.now();
    const activeUserIds = await missionsRepository.getActiveUserIds();

    let missionsChecked = 0;
    let missionsCompleted = 0;

    for (const userId of activeUserIds) {
      try {
        const completedMissions = await missionsService.checkMissionsProgress(userId);
        missionsChecked += 1;
        missionsCompleted += completedMissions.length;

        // Enviar notificación por cada misión completada
        for (const mission of completedMissions) {
          await notificationsService.createNotification({
            userId,
            type: 'mission_completed',
            title: 'Mission Completed!',
            message: `You completed "${mission.title}"`,
            data: {
              missionId: mission.id,
              rewards: mission.rewards
            },
            priority: 'medium'
          });

          // Emitir en tiempo real
          realtimeService.emitNotificationToUser(userId, notification);
        }
      } catch (error) {
        log.error(`[CRON] Error checking missions for user ${userId}:`, error);
      }
    }

    const duration = Date.now() - startTime;

    log.info('[CRON] Missions progress check completed');
    log.info(`[CRON] Stats: ${missionsChecked} users checked, ${missionsCompleted} missions auto-completed`);
    log.info(`[CRON] Duration: ${duration}ms`);
  } catch (error) {
    log.error('[CRON] Error in check missions progress:', error);
  }
});
```

**Ejemplo de Auto-completado:**
```
Usuario tiene misión:
{
  id: 'mission-uuid',
  title: 'Daily Practice',
  objectives: [
    { description: 'Complete exercises', target: 3, current: 2 }
  ],
  status: 'active'
}

Usuario completa 1 ejercicio más (current = 3)

Cron job ejecuta cada hora:
- Detecta que objective.current >= objective.target
- Auto-completa misión: status = 'completed', completedAt = now
- Envía notificación "Mission Completed!"
```

---

### Job 4: Cleanup Expired Missions

**Cron:** `0 3 * * *` (Todos los días a las 03:00 UTC)

**Propósito:** Elimina misiones expiradas antiguas para liberar espacio en DB

**Flujo:**
```
1. Busca misiones con:
   - status = 'expired'
   - endDate < (now - 30 días)

2. Elimina registros de la base de datos

3. Registra número de misiones eliminadas
```

**Código Relevante:**
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

**Query SQL:**
```sql
DELETE FROM gamification.missions
WHERE status = 'expired'
  AND end_date < NOW() - INTERVAL '30 days';
```

**Políticas de Retención:**
- Misiones activas: se mantienen indefinidamente
- Misiones completadas: se mantienen 90 días
- Misiones expiradas: se mantienen 30 días
- Misiones reclamadas: se mantienen indefinidamente (historial)

---

## 2. Cron Jobs de Notificaciones

**Archivo:** `/src/modules/notifications/notifications.cron.ts`

### Job: Cleanup Old Notifications

**Cron:** `0 2 * * *` (Todos los días a las 02:00 UTC)

**Propósito:** Elimina notificaciones leídas antiguas para mantener DB limpia

**Flujo:**
```
1. Busca notificaciones con:
   - is_read = true
   - read_at < (now - 30 días)

2. Elimina registros de la base de datos

3. Registra número de notificaciones eliminadas
```

**Código:**
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

**Políticas de Retención:**
- Notificaciones no leídas: se mantienen indefinidamente
- Notificaciones leídas: se mantienen 30 días
- Notificaciones importantes (priority='urgent'): se mantienen 90 días

**Query SQL:**
```sql
DELETE FROM notifications.user_notifications
WHERE is_read = true
  AND read_at < NOW() - INTERVAL '30 days'
  AND priority != 'urgent';
```

---

## 3. Cron Jobs Planificados (Futuro)

### Job: Daily Reset

**Cron:** `0 0 * * *` (00:00 UTC)

**Propósito:** Reset diario de contadores y estados

**Tareas:**
- Reset de intentos de login fallidos
- Reset de rate limits diarios
- Actualización de leaderboards diarios
- Envío de resumen diario a usuarios activos

**Código Placeholder:**
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

### Job: Streaks Update

**Cron:** `0 1 * * *` (01:00 UTC)

**Propósito:** Actualiza rachas de usuarios

**Tareas:**
- Verificar actividad del día anterior
- Incrementar streak si usuario estuvo activo
- Resetear streak a 0 si usuario no estuvo activo
- Enviar notificación si se rompe racha larga (>7 días)
- Otorgar bonus por rachas (7, 30, 100 días)

**Código Placeholder:**
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

### Job: Leaderboards Update

**Cron:** `0 2 * * *` (02:00 UTC)

**Propósito:** Recalcula tablas de clasificación

**Tareas:**
- Recalcular leaderboard global
- Recalcular leaderboards por classroom
- Recalcular leaderboards por guild
- Cachear resultados en Redis
- Enviar notificaciones a top 10

**Código Placeholder:**
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

## Sintaxis de Cron

### Formato Básico

```
┌───────────── minuto (0 - 59)
│ ┌───────────── hora (0 - 23)
│ │ ┌───────────── día del mes (1 - 31)
│ │ │ ┌───────────── mes (1 - 12)
│ │ │ │ ┌───────────── día de la semana (0 - 6) (Domingo=0)
│ │ │ │ │
│ │ │ │ │
* * * * *
```

### Ejemplos Comunes

| Cron Expression | Descripción | Uso en GAMILIT|
|-----------------|-------------|-------------|
| `* * * * *` | Cada minuto | Testing |
| `0 * * * *` | Cada hora en punto | Check missions progress |
| `0 0 * * *` | Todos los días a medianoche | Daily missions reset |
| `0 2 * * *` | Todos los días a las 2 AM | Cleanup notificaciones |
| `0 3 * * *` | Todos los días a las 3 AM | Cleanup misiones |
| `0 0 * * 1` | Todos los lunes a medianoche | Weekly missions reset |
| `0 0 1 * *` | Primer día de cada mes | Monthly reports |
| `0 0 1 1 *` | 1 de enero cada año | Yearly reset |
| `*/5 * * * *` | Cada 5 minutos | Health checks |
| `0 9-17 * * 1-5` | 9 AM - 5 PM, lunes-viernes | Business hours tasks |

### Sintaxis Avanzada

**Rangos:**
```
0 9-17 * * *    # Cada hora de 9 AM a 5 PM
```

**Listas:**
```
0 0 * * 1,3,5   # Lunes, miércoles, viernes a medianoche
```

**Steps:**
```
*/15 * * * *    # Cada 15 minutos
0 */2 * * *     # Cada 2 horas
```

**Combinaciones:**
```
0 0,12 * * *    # Medianoche y mediodía
30 9-17 * * 1-5 # 9:30 AM - 5:30 PM, días laborales
```

---

## Gestión de Cron Jobs

### Inicialización

**Archivo:** `/src/server.ts`

```typescript
import { startMissionsCronJobs } from './modules/gamification/missions/missions.cron';
import { startNotificationsCronJobs } from './modules/notifications/notifications.cron';

async function bootstrap(): Promise<void> {
  try {
    // ... inicialización del servidor

    // Iniciar cron jobs
    startMissionsCronJobs();
    startNotificationsCronJobs();

    log.info('All cron jobs started successfully');

    // ... resto de inicialización
  } catch (error) {
    log.error('Failed to start server:', error);
    process.exit(1);
  }
}
```

---

### Función Start Cron Jobs

```typescript
export function startMissionsCronJobs(): void {
  log.info('[CRON] Initializing missions cron jobs...');

  dailyMissionsReset.start();
  log.info('[CRON] ✓ Daily missions reset: 0 0 * * * (every day at 00:00 UTC)');

  weeklyMissionsReset.start();
  log.info('[CRON] ✓ Weekly missions reset: 0 0 * * 1 (every Monday at 00:00 UTC)');

  checkMissionsProgress.start();
  log.info('[CRON] ✓ Check missions progress: 0 * * * * (every hour)');

  cleanupExpiredMissions.start();
  log.info('[CRON] ✓ Cleanup expired missions: 0 3 * * * (every day at 03:00 UTC)');

  log.info('[CRON] All missions cron jobs started successfully');
}
```

---

### Función Stop Cron Jobs

```typescript
export function stopMissionsCronJobs(): void {
  log.info('[CRON] Stopping missions cron jobs...');

  dailyMissionsReset.stop();
  weeklyMissionsReset.stop();
  checkMissionsProgress.stop();
  cleanupExpiredMissions.stop();

  log.info('[CRON] All missions cron jobs stopped');
}
```

---

### Graceful Shutdown

**En server.ts:**

```typescript
const gracefulShutdown = async (signal: string) => {
  log.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop cron jobs
  stopMissionsCronJobs();
  stopNotificationsCronJobs();

  // Disconnect WebSocket
  disconnectAllSockets();

  // Close HTTP server
  httpServer.close(async () => {
    log.info('HTTP server closed');

    // Close database connections
    await closePool();

    log.info('Graceful shutdown completed');
    process.exit(0);
  });

  // Force shutdown after timeout
  setTimeout(() => {
    log.error('Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
```

---

## Testing Cron Jobs

### Test Manual con node-cron

```typescript
import cron from 'node-cron';

// Test job que ejecuta cada minuto
const testJob = cron.schedule('* * * * *', () => {
  console.log('Test job executed at', new Date().toISOString());
});

testJob.start();

// Detener después de 5 minutos
setTimeout(() => {
  testJob.stop();
  console.log('Test job stopped');
}, 5 * 60 * 1000);
```

---

### Test con Jest

```typescript
import { dailyMissionsReset } from '@/modules/gamification/missions/missions.cron';
import { missionsRepository } from '@/modules/gamification/missions/missions.repository';

// Mock dependencies
jest.mock('@/modules/gamification/missions/missions.repository');

describe('Daily Missions Reset Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should expire old missions and create new ones', async () => {
    // Mock data
    const mockActiveUsers = ['user1', 'user2', 'user3'];
    const mockExpiredCount = 100;

    missionsRepository.expireMissions.mockResolvedValue(mockExpiredCount);
    missionsRepository.getActiveUserIds.mockResolvedValue(mockActiveUsers);
    missionsRepository.getActiveMissionsByType.mockResolvedValue([]);
    missionsRepository.createMission.mockResolvedValue({});

    // Trigger cron job manually
    await dailyMissionsReset.now();

    // Assertions
    expect(missionsRepository.expireMissions).toHaveBeenCalled();
    expect(missionsRepository.getActiveUserIds).toHaveBeenCalled();
    expect(missionsRepository.createMission).toHaveBeenCalledTimes(9); // 3 users × 3 missions
  });
});
```

---

### Ejecutar Job Manualmente

**Para testing/debugging:**

```typescript
// En notifications.cron.ts, exportar función manual
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

**Usar desde endpoint admin:**

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

## Monitoreo de Cron Jobs

### Logs Estructurados

```typescript
log.info('[CRON] Starting daily missions reset...', {
  jobName: 'dailyMissionsReset',
  timestamp: new Date().toISOString(),
  environment: process.env.NODE_ENV
});

log.info('[CRON] Daily missions reset completed', {
  jobName: 'dailyMissionsReset',
  successCount: 1248,
  errorCount: 2,
  duration: 45123,
  timestamp: new Date().toISOString()
});
```

---

### Métricas

**Recolectar métricas de ejecución:**

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

// Endpoint para ver métricas
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

---

### Alertas

**Enviar alerta si cron job falla:**

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

## Diagrama de Horario de Cron Jobs

```
00:00 UTC ──► Daily Missions Reset
              Daily Reset (futuro)

01:00 UTC ──► Streaks Update (futuro)

02:00 UTC ──► Cleanup Notifications
              Leaderboards Update (futuro)

03:00 UTC ──► Cleanup Expired Missions

Every Hour ─► Check Missions Progress

Every Monday 00:00 ──► Weekly Missions Reset
```

---

## Mejores Prácticas

1. **Idempotencia:** Los cron jobs deben poder ejecutarse múltiples veces sin efectos secundarios
2. **Timeouts:** Implementar timeouts para evitar jobs que se cuelgan
3. **Logging:** Log detallado de inicio, progreso y fin de cada job
4. **Error Handling:** Capturar y loggear errores, no dejar que maten el proceso
5. **Métricas:** Registrar duración, éxito/fallo de cada ejecución
6. **Alertas:** Notificar a admins si un job crítico falla
7. **Testing:** Proveer función manual para testing sin esperar el schedule
8. **Locks:** Usar locks distribuidos (Redis) para evitar ejecuciones concurrentes
9. **Graceful Shutdown:** Detener jobs limpiamente al cerrar servidor
10. **Timezone:** Usar UTC para evitar problemas con horarios de verano

---

## Resumen de Configuración

```typescript
// server.ts - Punto de entrada

import { startMissionsCronJobs, stopMissionsCronJobs } from './modules/gamification/missions/missions.cron';
import { startNotificationsCronJobs, stopNotificationsCronJobs } from './modules/notifications/notifications.cron';

async function bootstrap() {
  // ... inicialización

  // Iniciar cron jobs
  startMissionsCronJobs();
  startNotificationsCronJobs();

  log.info('='.repeat(50));
  log.info('Cron Jobs Active:');
  log.info('  - Daily Missions Reset: 00:00 UTC');
  log.info('  - Weekly Missions Reset: Monday 00:00 UTC');
  log.info('  - Check Missions Progress: Every hour');
  log.info('  - Cleanup Expired Missions: 03:00 UTC');
  log.info('  - Cleanup Old Notifications: 02:00 UTC');
  log.info('='.repeat(50));

  // Graceful shutdown
  process.on('SIGTERM', () => {
    stopMissionsCronJobs();
    stopNotificationsCronJobs();
    // ... resto de shutdown
  });
}

bootstrap();
```

---

## Próximos Pasos

Con los 6 documentos creados, tienes documentación completa del backend de GAMILIT

1. ✓ **ESTRUCTURA-Y-MODULOS.md** - Arquitectura y 11 módulos
2. ✓ **SERVICIOS-PRINCIPALES.md** - Lógica de negocio core
3. ✓ **GUARDS-Y-SEGURIDAD.md** - NestJS Guards, RLS y seguridad
4. ✓ **API-ENDPOINTS.md** - 177+ endpoints documentados
5. ✓ **WEBSOCKET-REALTIME.md** - Socket.IO y eventos
6. ✓ **CRON-JOBS.md** - Tareas programadas

**Recursos Adicionales:**
- Código fuente: `/home/isem/workspace/projects/glit/backend/`
- Variables de entorno: `/home/isem/workspace/projects/glit/backend/.env.example`
- Tests: `/home/isem/workspace/projects/glit/backend/src/__tests__/`
