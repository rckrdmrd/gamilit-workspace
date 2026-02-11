# ET-TSK-001: Sistema de Tareas Programadas (Cron Jobs)

**Versión:** 1.0.0
**Fecha:** 2025-12-18
**Estado:** Implementado
**Módulo Backend:** `apps/backend/src/modules/tasks/`

---

## 1. DESCRIPCIÓN

El módulo de tareas programadas gestiona los cron jobs del sistema GAMILIT. Ejecuta procesos automáticos como reset de misiones diarias, limpieza de notificaciones y mantenimiento del sistema.

---

## 2. COMPONENTES

### 2.1 MissionsCronService

**Ubicación:** `tasks/missions-cron.service.ts`

**Responsabilidades:**
- Resetear misiones diarias a medianoche
- Generar nuevas misiones para usuarios activos
- Calcular expiración de misiones semanales

**Cron Jobs:**

| Job | Schedule | Descripción |
|-----|----------|-------------|
| `resetDailyMissions` | `0 0 * * *` (00:00 UTC) | Reset misiones diarias |
| `generateWeeklyMissions` | `0 0 * * 1` (Lunes 00:00) | Generar misiones semanales |
| `cleanExpiredMissions` | `0 2 * * *` (02:00 UTC) | Limpiar misiones expiradas |

**Dependencias:**
- `GamificationModule.MissionsService`

### 2.2 NotificationsCronService

**Ubicación:** `tasks/notifications-cron.service.ts`

**Responsabilidades:**
- Enviar notificaciones en batch
- Limpiar notificaciones leídas antiguas
- Procesar cola de emails

**Cron Jobs:**

| Job | Schedule | Descripción |
|-----|----------|-------------|
| `processNotificationQueue` | `*/5 * * * *` (cada 5 min) | Procesar cola pendiente |
| `cleanOldNotifications` | `0 3 * * *` (03:00 UTC) | Limpiar >30 días |
| `sendDigestEmails` | `0 8 * * *` (08:00 UTC) | Enviar resúmenes diarios |

**Dependencias:**
- `NotificationsModule.NotificationQueueService`
- `MailModule.MailService`

---

## 3. CONFIGURACIÓN

### 3.1 Módulo

```typescript
@Module({
  imports: [
    ScheduleModule.forRoot(),
    GamificationModule,
    NotificationsModule,
    MailModule,
  ],
  providers: [
    MissionsCronService,
    NotificationsCronService,
  ],
})
export class TasksModule {}
```

### 3.2 Decoradores de Schedule

```typescript
import { Cron, CronExpression } from '@nestjs/schedule';

@Injectable()
export class MissionsCronService {
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async resetDailyMissions() {
    // ...
  }
}
```

---

## 4. MONITOREO

### 4.1 Logs de Ejecución

Cada job registra:
- Inicio de ejecución
- Duración
- Registros procesados
- Errores encontrados

```typescript
this.logger.log(`[CRON] resetDailyMissions started`);
// ... proceso
this.logger.log(`[CRON] resetDailyMissions completed: ${count} missions reset in ${duration}ms`);
```

### 4.2 Alertas

| Condición | Alerta |
|-----------|--------|
| Job falla 3 veces consecutivas | CRITICAL |
| Job toma >5 minutos | WARNING |
| Job no se ejecuta en 24h | CRITICAL |

---

## 5. DEPENDENCIAS

### 5.1 Módulos Requeridos

```
TasksModule
├── GamificationModule (MissionsService)
├── NotificationsModule (NotificationQueueService)
└── MailModule (MailService)
```

### 5.2 Es Usado Por

- **AdminModule** (para monitoreo de jobs)

---

## 6. CONSIDERACIONES DE PRODUCCIÓN

### 6.1 Timezone

- Todos los cron jobs usan **UTC**
- Frontend convierte a timezone del usuario

### 6.2 Concurrencia

- Solo una instancia ejecuta cron jobs (usar distributed lock)
- Implementar idempotencia en cada job

### 6.3 Retry Logic

```typescript
@Cron('0 0 * * *')
async resetDailyMissions() {
  const MAX_RETRIES = 3;
  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      await this.executeMissionReset();
      return;
    } catch (error) {
      if (attempt === MAX_RETRIES) throw error;
      await this.delay(attempt * 1000);
    }
  }
}
```

---

## 7. TESTING

### 7.1 Unit Tests

```typescript
describe('MissionsCronService', () => {
  it('should reset daily missions', async () => {
    // Mock MissionsService
    // Execute cron handler
    // Verify missions were reset
  });
});
```

### 7.2 Integration Tests

- Verificar que jobs se registran correctamente
- Simular ejecución manual de jobs
- Verificar side effects en BD

---

*Especificación generada: 2025-12-18*
