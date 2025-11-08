<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Cron Jobs de Gamificación -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Cron Jobs de Gamificación

## Información General

Este documento describe las tareas programadas del sistema de gamificación, específicamente el reset de misiones diarias y semanales.

**Jobs Activos:** 2
**Archivo:** `/src/modules/gamification/missions/missions.cron.ts`

---

## Tabla de Contenidos

1. [Daily Missions Reset](#daily-missions-reset)
2. [Weekly Missions Reset](#weekly-missions-reset)
3. [Plantillas de Misiones](#plantillas-de-misiones)
4. [Sistema de Recompensas](#sistema-de-recompensas)
5. [Gestión de Cron Jobs](#gestión-de-cron-jobs)

---

## Daily Missions Reset

**Cron:** `0 0 * * *` (Todos los días a las 00:00 UTC)

**Propósito:** Expira misiones diarias antiguas y genera nuevas para usuarios activos

### Flujo de Ejecución

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

### Código de Implementación

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

### Log de Ejemplo

```
[2025-10-27 00:00:00] [CRON] Starting daily missions reset...
[2025-10-27 00:00:01] [CRON] Expired 1523 missions
[2025-10-27 00:00:02] [CRON] Found 1250 active users
[2025-10-27 00:00:45] [CRON] Daily missions reset completed
[2025-10-27 00:00:45] [CRON] Stats: 1248 users processed, 2 errors
[2025-10-27 00:00:45] [CRON] Duration: 45123ms
```

---

## Weekly Missions Reset

**Cron:** `0 0 * * 1` (Todos los lunes a las 00:00 UTC)

**Propósito:** Expira misiones semanales antiguas y genera nuevas

### Flujo de Ejecución

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

### Diferencias con Daily

| Aspecto | Daily | Weekly |
|---------|-------|--------|
| Frecuencia | Diaria | Semanal (lunes) |
| Número de misiones | 3 por usuario | 5 por usuario |
| Duración | 24 horas | 7 días |
| Objetivos (target) | Bajo (2-5) | Alto (10-30) |
| Recompensas | 50-200 coins | 300-1000 coins |
| XP | 100-300 | 600-2000 |

### Código de Implementación

```typescript
export const weeklyMissionsReset = cron.schedule('0 0 * * 1', async () => {
  try {
    log.info('[CRON] Starting weekly missions reset...');

    const startTime = Date.now();

    // Paso 1: Expirar misiones antiguas
    const expiredCount = await missionsRepository.expireWeeklyMissions();
    log.info(`[CRON] Expired ${expiredCount} weekly missions`);

    // Paso 2: Obtener usuarios activos
    const activeUserIds = await missionsRepository.getActiveUserIds();
    log.info(`[CRON] Found ${activeUserIds.length} active users`);

    // Paso 3: Calcular fecha de fin (próximo lunes)
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);
    endDate.setUTCHours(0, 0, 0, 0);

    // Paso 4: Crear misiones para cada usuario
    let successCount = 0;
    let errorCount = 0;

    for (const userId of activeUserIds) {
      try {
        const existingMissions = await missionsRepository.getActiveMissionsByType(
          userId,
          'weekly'
        );

        if (existingMissions.length === 0) {
          const templates = getRandomWeeklyTemplates(5);

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
              'weekly',
              objectives,
              template.rewards,
              endDate
            );
          }

          successCount++;
        }
      } catch (error) {
        log.error(`[CRON] Error creating weekly missions for user ${userId}:`, error);
        errorCount++;
      }
    }

    const duration = Date.now() - startTime;

    log.info('[CRON] Weekly missions reset completed');
    log.info(`[CRON] Stats: ${successCount} users processed, ${errorCount} errors`);
    log.info(`[CRON] Duration: ${duration}ms`);
  } catch (error) {
    log.error('[CRON] Error in weekly missions reset:', error);
  }
});
```

---

## Plantillas de Misiones

### Plantillas Diarias

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
  {
    id: 'daily_time_30',
    title: 'Study Session',
    description: 'Spend 30 minutes learning today',
    objectives: [
      { description: 'Study time (minutes)', target: 30, type: 'time_spent' }
    ],
    rewards: { mlCoins: 120, xp: 250 }
  },
  {
    id: 'daily_module',
    title: 'Module Progress',
    description: 'Complete 1 module lesson',
    objectives: [
      { description: 'Lessons completed', target: 1, type: 'lesson_completion' }
    ],
    rewards: { mlCoins: 200, xp: 400 }
  }
];
```

### Plantillas Semanales

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
  {
    id: 'weekly_perfect_5',
    title: 'Perfectionist Week',
    description: 'Get 5 perfect scores this week',
    objectives: [
      { description: 'Perfect scores', target: 5, type: 'perfect_score' }
    ],
    rewards: { mlCoins: 600, xp: 1200 }
  },
  {
    id: 'weekly_time_180',
    title: 'Dedicated Learner',
    description: 'Study for 3 hours this week',
    objectives: [
      { description: 'Study time (minutes)', target: 180, type: 'time_spent' }
    ],
    rewards: { mlCoins: 400, xp: 800 }
  },
  {
    id: 'weekly_variety',
    title: 'Topic Explorer',
    description: 'Complete exercises from 3 different modules',
    objectives: [
      { description: 'Different modules', target: 3, type: 'module_diversity' }
    ],
    rewards: { mlCoins: 350, xp: 700 }
  }
];
```

### Selección Aleatoria de Plantillas

```typescript
function getRandomDailyTemplates(count: number): MissionTemplate[] {
  const shuffled = [...DAILY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function getRandomWeeklyTemplates(count: number): MissionTemplate[] {
  const shuffled = [...WEEKLY_MISSION_TEMPLATES].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}
```

---

## Sistema de Recompensas

### Tabla de Recompensas

| Tipo de Misión | Dificultad | ML Coins | XP | Duración |
|----------------|------------|----------|----|---------|
| Daily - Fácil | Baja | 50-100 | 100-200 | 24h |
| Daily - Media | Media | 100-150 | 200-300 | 24h |
| Daily - Difícil | Alta | 150-200 | 300-400 | 24h |
| Weekly - Fácil | Baja | 300-400 | 600-800 | 7 días |
| Weekly - Media | Media | 400-600 | 800-1200 | 7 días |
| Weekly - Difícil | Alta | 600-1000 | 1200-2000 | 7 días |

### Factores de Dificultad

**Fácil:**
- Objetivos bajos (1-3 completions)
- Tipos simples (login, 1 ejercicio)
- Sin requisitos de perfección

**Media:**
- Objetivos moderados (3-10 completions)
- Requiere dedicación diaria
- Puede incluir tiempo o perfección

**Difícil:**
- Objetivos altos (10-30 completions)
- Requiere compromiso sostenido
- Incluye múltiples objetivos o perfección

### Otorgamiento de Recompensas

Las recompensas se otorgan cuando el usuario **reclama** la misión completada:

```typescript
// En missions.service.ts
async claimMission(userId: string, missionId: string): Promise<void> {
  const mission = await missionsRepository.getMissionById(missionId);

  // Verificar que está completada
  if (mission.status !== 'completed') {
    throw new Error('Mission not completed');
  }

  // Otorgar recompensas
  if (mission.rewards.mlCoins > 0) {
    await gamificationService.addCoins(
      userId,
      mission.rewards.mlCoins,
      'mission_reward',
      { missionId }
    );
  }

  if (mission.rewards.xp > 0) {
    await gamificationService.addXP(
      userId,
      mission.rewards.xp,
      'mission_reward',
      { missionId }
    );
  }

  // Marcar como reclamada
  await missionsRepository.updateMissionStatus(missionId, 'claimed');

  // Enviar notificación
  await notificationsService.createNotification({
    userId,
    type: 'rewards_claimed',
    title: 'Rewards Claimed!',
    message: `You earned ${mission.rewards.mlCoins} coins and ${mission.rewards.xp} XP`,
    data: { missionId, rewards: mission.rewards },
    priority: 'medium'
  });
}
```

---

## Gestión de Cron Jobs

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

### Resumen de Configuración

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

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Anterior:** [Cron-Reportes.md](./Cron-Reportes.md)
- **Relacionado:** [Cron-Mantenimiento.md](./Cron-Mantenimiento.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
