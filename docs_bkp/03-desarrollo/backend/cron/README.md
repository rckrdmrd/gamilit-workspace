<!-- RFC-0001: Estándar de Documentación Técnica -->
<!-- Proyecto: GAMILIT - Plataforma Gamificada de Machine Learning -->
<!-- Documento: Cron Jobs - Índice Principal -->
<!-- Versión: 1.0.0 -->
<!-- Última Actualización: 2025-11-01 -->

# Cron Jobs y Tareas Programadas

## Información General

**Librería:** node-cron 4.2.1
**Sintaxis:** Cron expressions (formato Unix)
**Total Jobs:** 6 cron jobs activos

---

## Índice de Documentación

### 1. [Cron-Mantenimiento.md](./Cron-Mantenimiento.md)
Documentación de tareas de mantenimiento y limpieza automática del sistema.

**Contenido:**
- Cleanup de Misiones Expiradas
- Cleanup de Notificaciones Antiguas
- Políticas de Retención de Datos
- Tareas de Mantenimiento Planificadas

**Jobs Documentados:** 2 activos + 3 planificados

---

### 2. [Cron-Reportes.md](./Cron-Reportes.md)
Documentación de verificación de progreso y generación de reportes.

**Contenido:**
- Check Missions Progress (cada hora)
- Auto-completado de Misiones
- Sistema de Notificaciones Automáticas
- Métricas y Monitoreo

**Jobs Documentados:** 1 activo

---

### 3. [Cron-Gamificacion.md](./Cron-Gamificacion.md)
Documentación de tareas relacionadas con el sistema de gamificación.

**Contenido:**
- Daily Missions Reset
- Weekly Missions Reset
- Plantillas de Misiones
- Sistema de Recompensas

**Jobs Documentados:** 2 activos

---

## Recursos Comunes

### Sintaxis de Cron

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
| `*/5 * * * *` | Cada 5 minutos | Health checks |

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

### Graceful Shutdown

```typescript
const gracefulShutdown = async (signal: string) => {
  log.info(`\n${signal} received. Starting graceful shutdown...`);

  // Stop cron jobs
  stopMissionsCronJobs();
  stopNotificationsCronJobs();

  // ... resto de shutdown
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
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

### Ejecutar Job Manualmente

Para testing/debugging, se pueden exportar funciones manuales:

```typescript
export async function runCleanupNow(daysOld: number = 30): Promise<number> {
  try {
    log.info(`Running manual cleanup (${daysOld} days old)...`);
    const deletedCount = await cleanupService.cleanup(daysOld);
    log.info(`Manual cleanup completed. Deleted ${deletedCount} items.`);
    return deletedCount;
  } catch (error) {
    log.error('Error in manual cleanup:', error);
    throw error;
  }
}
```

---

## Navegación

- **Inicio:** [Backend README](../README.md)
- **Cron Mantenimiento:** [Cron-Mantenimiento.md](./Cron-Mantenimiento.md)
- **Cron Reportes:** [Cron-Reportes.md](./Cron-Reportes.md)
- **Cron Gamificación:** [Cron-Gamificacion.md](./Cron-Gamificacion.md)

---

**Documentación generada siguiendo RFC-0001**
**Proyecto:** GAMILIT - Plataforma Gamificada de Machine Learning
**Última Actualización:** 2025-11-01
