<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Cron Jobs de Reportes y Verificación -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Cron Jobs de Reportes y Verificación

## Información General

Este documento describe las tareas programadas de verificación de progreso y auto-completado de misiones en GAMILIT

**Jobs Activos:** 1
**Frecuencia:** Cada hora

---

## Tabla de Contenidos

1. [Check Missions Progress](#check-missions-progress)
2. [Sistema de Auto-completado](#sistema-de-auto-completado)
3. [Notificaciones Automáticas](#notificaciones-automáticas)
4. [Testing y Debugging](#testing-y-debugging)
5. [Monitoreo](#monitoreo)

---

## Check Missions Progress

**Cron:** `0 * * * *` (Cada hora)

**Archivo:** `/src/modules/gamification/missions/missions.cron.ts`

**Propósito:** Verifica progreso de misiones activas y auto-completa las que llegaron a 100%

### Flujo de Ejecución

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

### Código de Implementación

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

### Log de Ejemplo

```
[2025-10-27 10:00:00] [CRON] Checking missions progress...
[2025-10-27 10:00:35] [CRON] Missions progress check completed
[2025-10-27 10:00:35] [CRON] Stats: 1250 users checked, 87 missions auto-completed
[2025-10-27 10:00:35] [CRON] Duration: 35234ms
```

---

## Sistema de Auto-completado

### Criterios de Auto-completado

Una misión se auto-completa cuando:

1. **Estado actual:** `status = 'active'`
2. **Objetivos completados:** Todos los objetivos tienen `current >= target`
3. **No expirada:** `endDate > now`

### Ejemplo de Auto-completado

#### Estado Inicial

```json
{
  "id": "mission-uuid",
  "userId": "user-123",
  "title": "Daily Practice",
  "status": "active",
  "objectives": [
    {
      "description": "Complete exercises",
      "target": 3,
      "current": 2,
      "type": "exercise_completion"
    }
  ],
  "rewards": {
    "mlCoins": 100,
    "xp": 200
  },
  "endDate": "2025-10-27T23:59:59Z"
}
```

#### Usuario Completa 1 Ejercicio Más

```json
{
  "objectives": [
    {
      "description": "Complete exercises",
      "target": 3,
      "current": 3,  // ← Incrementado
      "type": "exercise_completion"
    }
  ]
}
```

#### Cron Job Detecta y Auto-completa

```json
{
  "status": "completed",  // ← Cambiado de 'active'
  "completedAt": "2025-10-27T10:00:00Z",  // ← Timestamp agregado
  "objectives": [
    {
      "description": "Complete exercises",
      "target": 3,
      "current": 3,
      "type": "exercise_completion"
    }
  ]
}
```

### Lógica de Verificación

```typescript
// En missionsService.checkMissionsProgress()
async checkMissionsProgress(userId: string): Promise<Mission[]> {
  const activeMissions = await missionsRepository.getActiveMissionsByUser(userId);
  const completedMissions: Mission[] = [];

  for (const mission of activeMissions) {
    // Verificar si todos los objetivos están completados
    const allObjectivesComplete = mission.objectives.every(
      obj => obj.current >= obj.target
    );

    if (allObjectivesComplete) {
      // Marcar como completada
      await missionsRepository.updateMissionStatus(
        mission.id,
        'completed',
        new Date()
      );

      completedMissions.push(mission);
    }
  }

  return completedMissions;
}
```

---

## Notificaciones Automáticas

### Flujo de Notificación

```
1. Cron Job detecta misión completada
   ↓
2. Crea notificación en DB
   ↓
3. Emite evento WebSocket en tiempo real
   ↓
4. Cliente recibe y muestra notificación
```

### Payload de Notificación

```typescript
{
  id: 'notification-uuid',
  userId: 'user-123',
  type: 'mission_completed',
  title: 'Mission Completed!',
  message: 'You completed "Daily Practice"',
  data: {
    missionId: 'mission-uuid',
    missionTitle: 'Daily Practice',
    rewards: {
      mlCoins: 100,
      xp: 200
    }
  },
  priority: 'medium',
  isRead: false,
  createdAt: '2025-10-27T10:00:00Z'
}
```

### Evento WebSocket

```typescript
// Servidor emite
socket.to(`user:${userId}`).emit('new_notification', {
  notification: {
    id: 'notification-uuid',
    type: 'mission_completed',
    title: 'Mission Completed!',
    message: 'You completed "Daily Practice"',
    data: { ... }
  },
  timestamp: '2025-10-27T10:00:00Z'
});
```

### Respuesta del Cliente

```javascript
// Cliente recibe
socket.on('new_notification', (data) => {
  console.log('Mission completed:', data.notification);

  // Mostrar modal celebratorio
  showMissionCompleteModal(data.notification.data);

  // Reproducir sonido
  playNotificationSound();

  // Actualizar contador de notificaciones
  updateNotificationBadge();
});
```

---

## Testing y Debugging

### Test Unitario con Jest

```typescript
import { checkMissionsProgress } from '@/modules/gamification/missions/missions.cron';
import { missionsRepository } from '@/modules/gamification/missions/missions.repository';
import { missionsService } from '@/modules/gamification/missions/missions.service';

// Mock dependencies
jest.mock('@/modules/gamification/missions/missions.repository');
jest.mock('@/modules/gamification/missions/missions.service');

describe('Check Missions Progress Cron Job', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should detect and complete missions when objectives are met', async () => {
    // Mock data
    const mockActiveUsers = ['user1', 'user2'];
    const mockCompletedMissions = [
      {
        id: 'mission-1',
        title: 'Daily Practice',
        rewards: { mlCoins: 100, xp: 200 }
      }
    ];

    missionsRepository.getActiveUserIds.mockResolvedValue(mockActiveUsers);
    missionsService.checkMissionsProgress.mockResolvedValue(mockCompletedMissions);

    // Trigger cron job manually
    await checkMissionsProgress.now();

    // Assertions
    expect(missionsRepository.getActiveUserIds).toHaveBeenCalled();
    expect(missionsService.checkMissionsProgress).toHaveBeenCalledWith('user1');
    expect(missionsService.checkMissionsProgress).toHaveBeenCalledWith('user2');
  });

  test('should send notifications for completed missions', async () => {
    const mockUserId = 'user-123';
    const mockCompletedMissions = [
      {
        id: 'mission-1',
        title: 'Daily Practice',
        rewards: { mlCoins: 100, xp: 200 }
      }
    ];

    missionsRepository.getActiveUserIds.mockResolvedValue([mockUserId]);
    missionsService.checkMissionsProgress.mockResolvedValue(mockCompletedMissions);

    // Trigger cron job manually
    await checkMissionsProgress.now();

    // Verify notification was created
    expect(notificationsService.createNotification).toHaveBeenCalledWith({
      userId: mockUserId,
      type: 'mission_completed',
      title: 'Mission Completed!',
      message: expect.stringContaining('Daily Practice'),
      data: expect.objectContaining({
        missionId: 'mission-1'
      }),
      priority: 'medium'
    });
  });
});
```

### Ejecución Manual para Testing

```typescript
// Exportar función manual
export async function runCheckMissionsProgressNow(): Promise<void> {
  try {
    log.info('[MANUAL] Running missions progress check...');

    // Ejecutar lógica del cron job
    await checkMissionsProgress.now();

    log.info('[MANUAL] Missions progress check completed');
  } catch (error) {
    log.error('[MANUAL] Error in missions progress check:', error);
    throw error;
  }
}
```

### Endpoint Admin para Testing

```typescript
// En admin.routes.ts
router.post('/system/cron/check-missions-progress',
  authenticateJWT,
  requireRole('super_admin'),
  async (req, res) => {
    try {
      await runCheckMissionsProgressNow();

      res.json({
        success: true,
        data: {
          message: 'Missions progress check executed successfully'
        }
      });
    } catch (error) {
      next(error);
    }
  }
);
```

---

## Monitoreo

### Métricas a Recolectar

```typescript
interface MissionsCheckMetrics {
  lastRun: Date;
  usersChecked: number;
  missionsCompleted: number;
  duration: number;
  errors: number;
}

let checkMetrics: MissionsCheckMetrics = {
  lastRun: new Date(),
  usersChecked: 0,
  missionsCompleted: 0,
  duration: 0,
  errors: 0
};

// Actualizar métricas después de cada ejecución
const updateMetrics = (
  usersChecked: number,
  missionsCompleted: number,
  duration: number,
  errors: number
) => {
  checkMetrics = {
    lastRun: new Date(),
    usersChecked,
    missionsCompleted,
    duration,
    errors
  };
};
```

### Endpoint de Métricas

```typescript
router.get('/admin/cron/missions-check/metrics',
  authenticateJWT,
  requireRole('super_admin'),
  (req, res) => {
    res.json({
      success: true,
      data: {
        metrics: checkMetrics,
        nextRun: getNextCronRunTime('0 * * * *')
      }
    });
  }
);
```

### Dashboard de Monitoreo

```typescript
// Respuesta típica del endpoint de métricas
{
  "success": true,
  "data": {
    "metrics": {
      "lastRun": "2025-10-27T10:00:00Z",
      "usersChecked": 1250,
      "missionsCompleted": 87,
      "duration": 35234,
      "errors": 0
    },
    "nextRun": "2025-10-27T11:00:00Z"
  }
}
```

### Alertas de Rendimiento

```typescript
// Si el job tarda más de 5 minutos
if (duration > 5 * 60 * 1000) {
  log.warn('[CRON] Missions check taking too long', {
    duration,
    usersChecked,
    missionsCompleted
  });

  // Enviar alerta a admins
  await notifyAdmins({
    type: 'performance_warning',
    message: `Missions check took ${duration}ms`,
    data: { duration, usersChecked, missionsCompleted }
  });
}
```

---

## Optimizaciones

### Procesamiento por Lotes

Para mejorar rendimiento con muchos usuarios:

```typescript
const BATCH_SIZE = 100;

for (let i = 0; i < activeUserIds.length; i += BATCH_SIZE) {
  const batch = activeUserIds.slice(i, i + BATCH_SIZE);

  // Procesar batch en paralelo
  await Promise.all(
    batch.map(userId => checkUserMissions(userId))
  );

  log.info(`[CRON] Processed batch ${Math.floor(i / BATCH_SIZE) + 1}`);
}
```

### Caching de Usuarios Activos

```typescript
// Cachear lista de usuarios activos por 1 hora
const cacheKey = 'active_user_ids';
let activeUserIds = await cache.get(cacheKey);

if (!activeUserIds) {
  activeUserIds = await missionsRepository.getActiveUserIds();
  await cache.set(cacheKey, activeUserIds, 3600); // 1 hora
}
```

### Query Optimization

```sql
-- Índice para mejorar performance
CREATE INDEX idx_missions_active_users
ON gamification.missions (user_id, status, end_date)
WHERE status = 'active';

-- Query optimizada
SELECT DISTINCT user_id
FROM gamification.missions
WHERE status = 'active'
  AND end_date > NOW()
  AND user_id IN (
    SELECT id FROM users.users
    WHERE last_login > NOW() - INTERVAL '7 days'
  );
```

---

## Navegación

- **Índice Principal:** [README.md](./README.md)
- **Anterior:** [Cron-Mantenimiento.md](./Cron-Mantenimiento.md)
- **Siguiente:** [Cron-Gamificacion.md](./Cron-Gamificacion.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
