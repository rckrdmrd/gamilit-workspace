# Plan de Implementación: Corrección VAPID Keys y WebSocket Authentication

**ID:** PLAN-EXT-003-2026-01-04
**Fecha:** 2026-01-04
**Origen:** Error reportado en consola del backend
**Agente:** Orquestador-Agent (PERFIL-ORQUESTADOR)

---

## Resumen Ejecutivo

Plan para corregir dos errores críticos en el módulo de notificaciones:
1. Error VAPID: Claves inválidas impiden inicialización de Web Push
2. Error WebSocket: Conexiones rechazadas por autenticación fallida

## Análisis del Problema

### Error 1: VAPID Keys Inválidas
```
[PushNotificationService] ERROR: Vapid public key must be a URL safe Base 64 (without "=")
```

**Causa raíz:** El archivo `.env` contenía claves VAPID placeholder/dummy que no son formato Base64 URL-safe válido.

### Error 2: WebSocket Connection Failed
```
WebSocket connection to 'ws://localhost:3006/socket.io/' failed:
WebSocket is closed before the connection is established.
```

**Causa raíz:** El decorator `@UseGuards(WsJwtGuard)` en `handleConnection` no funciona porque los lifecycle hooks de Socket.IO no pasan por el sistema de guards de NestJS.

## Descomposición en Microciclos

### Micro 1-1: Diagnóstico
**Duración:** 10 min
**Objetivo:** Identificar causa raíz de ambos errores
**Subagentes:** 1 (Explore)
**Output:** Diagnóstico documentado

**Acciones:**
1. Leer servicio push-notification.service.ts
2. Leer archivo .env del backend
3. Leer notifications.gateway.ts
4. Verificar configuración de WebSocket

### Micro 1-2: Corrección VAPID
**Duración:** 5 min
**Objetivo:** Generar y configurar claves VAPID válidas
**Subagentes:** 0 (ejecución directa)
**Output:** .env actualizado

**Acciones:**
1. Ejecutar `node scripts/generate-vapid-keys.js`
2. Actualizar `.env` con claves generadas
3. Verificar formato Base64 URL-safe

### Micro 1-3: Corrección WebSocket
**Duración:** 15 min
**Objetivo:** Implementar autenticación manual en handleConnection
**Subagentes:** 0 (ejecución directa)
**Output:** notifications.gateway.ts corregido

**Acciones:**
1. Inyectar JwtService en NotificationsGateway
2. Mover lógica de autenticación a handleConnection
3. Remover @UseGuards innecesario
4. Implementar manejo de errores

### Micro 1-4: Validación
**Duración:** 10 min
**Objetivo:** Verificar que las correcciones funcionan
**Subagentes:** 0 (ejecución directa)
**Output:** Logs de validación

**Acciones:**
1. Compilar TypeScript (npm run build)
2. Iniciar backend (npm run dev)
3. Verificar logs de inicialización
4. Verificar conexión WebSocket

### Micro 1-5: Documentación
**Duración:** 15 min
**Objetivo:** Documentar cambios según estándares
**Subagentes:** 0 (ejecución directa)
**Output:** Trazas y documentación actualizadas

**Acciones:**
1. Actualizar TRAZA-TAREAS-BACKEND.md (BE-139, BE-140)
2. Actualizar WEB_PUSH_MIGRATION.md
3. Crear plan de implementación
4. Crear reporte de validación

## Orden de Ejecución

1. Micro 1-1 (prerequisito: ninguno)
2. Micro 1-2 (prerequisito: 1-1)
3. Micro 1-3 (prerequisito: 1-1)
4. Micro 1-4 (prerequisito: 1-2, 1-3)
5. Micro 1-5 (prerequisito: 1-4)

## Validación de Slots

- Subagentes totales: 1 (solo diagnóstico)
- Slots necesarios por micro: máximo 1
- Estrategia: Secuencial

## Criterios de Completitud

- [x] Todos los microciclos completados
- [x] Build exitoso (npm run build)
- [x] Error VAPID resuelto
- [x] Error WebSocket resuelto
- [x] Documentación actualizada

## Archivos Afectados

| Archivo | Tipo de Cambio |
|---------|----------------|
| `apps/backend/.env` | Actualizado (claves VAPID) |
| `apps/backend/src/modules/websocket/notifications.gateway.ts` | Modificado (auth manual) |
| `apps/backend/docs/WEB_PUSH_MIGRATION.md` | Actualizado (nota importante) |
| `orchestration/trazas/TRAZA-TAREAS-BACKEND.md` | Actualizado (BE-139, BE-140) |

## Impacto en Base de Datos

**Sin cambios en DDL/Seeds.** Los cambios son exclusivamente:
- Configuración de ambiente (.env)
- Código TypeScript del backend

## Referencias

- Servicio: `src/modules/notifications/services/push-notification.service.ts`
- Gateway: `src/modules/websocket/notifications.gateway.ts`
- Script VAPID: `scripts/generate-vapid-keys.js`
- Documentación: `docs/WEB_PUSH_MIGRATION.md`
