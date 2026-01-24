# REPORTE DE ANALISIS DE ERRORES - GAMILIT
**Fecha:** 2025-12-26
**Analista:** Requirements-Analyst (SIMCO)
**Proyecto:** Gamilit Platform

---

## RESUMEN EJECUTIVO

Se identificaron **3 problemas principales** que causan errores en el sistema:

| # | Error | Severidad | Causa Raíz | Afecta |
|---|-------|-----------|-----------|--------|
| 1 | `relation "notifications.notification_queue" does not exist` | CRITICO | RLS con columna inexistente | Notificaciones, Cron Jobs |
| 2 | 500 en `/notifications/unread-count` | CRITICO | Cascada del Error #1 | Frontend, Notificaciones |
| 3 | 400 Bad Request en misiones diarias | ALTO | ValidationPipe restrictivo | Misiones, Gamificacion |

---

## PROBLEMA #1: TABLAS DE NOTIFICACIONES FALTANTES

### Descripcion del Error
```
QueryFailedError: relation "notifications.notification_queue" does not exist
```

### Causa Raiz
El archivo RLS `/apps/database/ddl/schemas/notifications/rls-policies/01-notifications-policies.sql` tiene un error en la linea 166:

```sql
-- INCORRECTO (notification_logs NO tiene columna user_id):
CREATE POLICY notification_logs_select_own
    ON notifications.notification_logs
    USING (
        user_id = current_setting('app.current_user_id', true)::uuid
    );
```

La tabla `notification_logs` solo tiene: `id, notification_id, channel, status, sent_at, delivered_at, error_message, provider_response, metadata`

### Estado Actual de Tablas
| Tabla | Estado |
|-------|--------|
| `notifications.notifications` | EXISTE |
| `notifications.notification_preferences` | NO EXISTE |
| `notifications.notification_logs` | NO EXISTE |
| `notifications.notification_templates` | NO EXISTE |
| `notifications.notification_queue` | NO EXISTE |
| `notifications.user_devices` | NO EXISTE |

### Correccion Requerida

**Archivo:** `apps/database/ddl/schemas/notifications/rls-policies/01-notifications-policies.sql`
**Lineas:** 160-167

```sql
-- CORRECCION: Usar JOIN con notifications para obtener user_id
CREATE POLICY notification_logs_select_own
    ON notifications.notification_logs
    AS PERMISSIVE
    FOR SELECT
    TO public
    USING (
        EXISTS (
            SELECT 1 FROM notifications.notifications n
            WHERE n.id = notification_logs.notification_id
            AND n.user_id = current_setting('app.current_user_id', true)::uuid
        )
    );
```

### Script de Re-creacion de Tablas

Despues de corregir el RLS, ejecutar en orden:

```bash
# Conectar a la base de datos
PGPASSWORD=C5hq7253pdVyVKUC psql -h localhost -U gamilit_user -d gamilit_platform

# Ejecutar DDL en orden (las dependencias ya existen)
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/tables/03-notification_logs.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/tables/04-notification_templates.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/tables/05-notification_queue.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/tables/06-user_devices.sql

# Crear funciones
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/functions/01-send_notification.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/functions/02-get_user_preferences.sql
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/functions/03-queue_batch_notifications.sql

# Aplicar RLS (DESPUES de corregir el archivo)
\i /home/isem/workspace/projects/gamilit/apps/database/ddl/schemas/notifications/rls-policies/01-notifications-policies.sql
```

### Dependencias Validadas
- [x] `auth.users` existe
- [x] `gamilit.now_mexico()` existe
- [x] `notifications.notifications` existe
- [x] Schema `notifications` existe

---

## PROBLEMA #2: ERROR 500 EN NOTIFICACIONES

### Descripcion del Error
```
500 Internal Server Error: /api/v1/notifications/unread-count
error: relation "notifications.notification_queue" does not exist
```

### Causa Raiz
Es una **cascada del Problema #1**. El cron job `NotificationsCronService` intenta procesar la cola de notificaciones que no existe.

### Correccion
Se resuelve automaticamente al ejecutar la correccion del Problema #1.

### Archivos Afectados
- `apps/backend/src/modules/notifications/services/notification-queue.service.ts:210`
- `apps/backend/src/modules/tasks/services/notifications-cron.service.ts:42`

---

## PROBLEMA #3: ERROR 400 EN MISIONES DIARIAS

### Descripcion del Error
```
Error fetching daily missions: AxiosError
Failed to load resource: the server responded with a status of 400 (Bad Request)
```

### Causa Raiz
El `ValidationPipe` global en `main.ts` con `forbidNonWhitelisted: true` rechaza cualquier propiedad no declarada, incluso en GET requests que no usan DTOs.

**Archivo:** `apps/backend/src/main.ts` (lineas 55-64)
```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,  // <-- Causa del 400
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

### Investigacion Adicional Requerida
El error 400 puede tener multiples causas:

1. **apiClient transformando params innecesariamente** (`apiClient.ts:54-62`)
2. **Axios agregando propiedades internas** que ValidationPipe rechaza
3. **Query params no declarados** siendo enviados

### Verificacion Recomendada

```bash
# Probar endpoint directamente sin frontend
TOKEN="<JWT_TOKEN>"
curl -v -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/gamification/missions/daily
```

### Correcciones Posibles

**Opcion A - Modificar ValidationPipe (Menos restrictivo):**
```typescript
// main.ts
new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: false,  // Cambiar a false
  transform: true,
  ...
})
```

**Opcion B - Excluir GET requests de validacion (Recomendado):**
Crear un pipe personalizado que solo valide POST/PATCH/PUT.

**Opcion C - Revisar apiClient (Frontend):**
```typescript
// apiClient.ts - No transformar params vacios
if (config.params && typeof config.params === 'object' && Object.keys(config.params).length > 0) {
  config.params = camelToSnake(config.params);
}
```

---

## MATRIZ DE DEPENDENCIAS

### Correccion #1 (Notificaciones)

```
01-notifications-policies.sql (CORREGIR)
         |
         v
+--------+--------+
|                 |
v                 v
02-notification_preferences.sql    03-notification_logs.sql
                                         |
                                         v
04-notification_templates.sql      05-notification_queue.sql
                                         |
                                         v
06-user_devices.sql
         |
         v
functions/*.sql (3 archivos)
         |
         v
RLS policies (aplicar al final)
```

### Correccion #2 (Error 500)
- Depende de: Correccion #1
- No requiere cambios de codigo

### Correccion #3 (Error 400)
- Independiente de las otras correcciones
- Requiere decision de arquitectura

---

## ORDEN DE EJECUCION RECOMENDADO

### Fase 1: Correccion Base de Datos (CRITICO)

1. Corregir archivo RLS:
   - `apps/database/ddl/schemas/notifications/rls-policies/01-notifications-policies.sql`
   - Linea 166: Cambiar politica para usar JOIN

2. Ejecutar DDL de tablas faltantes (en orden)

3. Ejecutar funciones

4. Aplicar RLS corregido

5. Verificar:
   ```sql
   SELECT COUNT(*) FROM notifications.notification_queue;
   -- Debe retornar 0 (sin error)
   ```

### Fase 2: Verificacion Backend

1. Reiniciar backend:
   ```bash
   cd apps/backend && npm run dev
   ```

2. Verificar logs - no debe haber errores de:
   - `relation "notifications.notification_queue" does not exist`

### Fase 3: Correccion Error 400 (INVESTIGAR)

1. Probar endpoint con curl
2. Revisar logs del backend para mensaje exacto
3. Decidir estrategia de correccion
4. Implementar y probar

---

## ARCHIVOS AFECTADOS

### Para Editar
| Archivo | Tipo | Lineas | Descripcion |
|---------|------|--------|-------------|
| `apps/database/ddl/schemas/notifications/rls-policies/01-notifications-policies.sql` | SQL | 160-167 | Corregir politica RLS |

### Para Ejecutar (No editar)
| Archivo | Tipo | Descripcion |
|---------|------|-------------|
| `apps/database/ddl/schemas/notifications/tables/02-notification_preferences.sql` | SQL | Crear tabla |
| `apps/database/ddl/schemas/notifications/tables/03-notification_logs.sql` | SQL | Crear tabla |
| `apps/database/ddl/schemas/notifications/tables/04-notification_templates.sql` | SQL | Crear tabla |
| `apps/database/ddl/schemas/notifications/tables/05-notification_queue.sql` | SQL | Crear tabla |
| `apps/database/ddl/schemas/notifications/tables/06-user_devices.sql` | SQL | Crear tabla |
| `apps/database/ddl/schemas/notifications/functions/01-send_notification.sql` | SQL | Crear funcion |
| `apps/database/ddl/schemas/notifications/functions/02-get_user_preferences.sql` | SQL | Crear funcion |
| `apps/database/ddl/schemas/notifications/functions/03-queue_batch_notifications.sql` | SQL | Crear funcion |

### Para Investigar (Problema 400)
| Archivo | Tipo | Lineas | Descripcion |
|---------|------|--------|-------------|
| `apps/backend/src/main.ts` | TS | 55-64 | ValidationPipe config |
| `apps/frontend/src/services/api/apiClient.ts` | TS | 54-62 | Request interceptor |
| `apps/frontend/src/features/gamification/missions/hooks/useMissions.ts` | TS | 435-456 | Hook de misiones |

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|--------------|---------|-----------|
| Error al ejecutar DDL | Baja | Alto | Backup previo, transaccion |
| Datos inconsistentes | Baja | Medio | Las tablas son nuevas, sin datos |
| ValidationPipe afecta otros endpoints | Media | Alto | Probar exhaustivamente |
| Cron job falla por otra razon | Baja | Medio | Revisar logs post-fix |

---

## VALIDACION POST-IMPLEMENTACION

### Verificar Problema #1
```sql
-- Todas las tablas deben existir
\dt notifications.*
-- Resultado esperado: 6 tablas
```

### Verificar Problema #2
```bash
# No debe haber errores en logs del backend
tail -f apps/backend/logs/error.log
```

### Verificar Problema #3
```bash
# Endpoint debe retornar 200 con misiones
curl -H "Authorization: Bearer $TOKEN" \
  http://localhost:3006/api/v1/gamification/missions/daily
```

---

## CONCLUSION

Los errores identificados tienen causas raiz claras y correcciones definidas. El Problema #1 es el mas critico y su resolucion tambien resuelve el Problema #2. El Problema #3 requiere investigacion adicional antes de implementar una correccion definitiva.

**Prioridad de Ejecucion:**
1. Problema #1 (Critico) - Corregir RLS y crear tablas
2. Problema #2 (Critico) - Se resuelve con #1
3. Problema #3 (Alto) - Investigar y decidir estrategia

---

**Reporte generado por Requirements-Analyst usando SIMCO**
**Version:** 1.0
**Estado:** Listo para revision
