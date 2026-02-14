# TASK-2026-02-13-FIX-REDIS-WEBSOCKET-STARTUP

**Tipo:** ANALYSIS + FIX | **Prioridad:** P0 | **Fecha:** 2026-02-13
**Estado:** ANALISIS COMPLETADO - PENDIENTE EJECUCION

---

## 1. RESUMEN EJECUTIVO

### Error Reportado
```
[Nest] 75480 - 13/02/2026, 11:18:59 p.m.   LOG [MessagePersistenceService] Connecting to Redis for message persistence...
[Nest] 75480 - 13/02/2026, 11:18:59 p.m. ERROR [RedisIoAdapter] Redis sub client error: Socket closed unexpectedly
[Nest] 75480 - 13/02/2026, 11:18:59 p.m.  WARN [RedisIoAdapter] Redis reconnecting in 0ms (attempt 1/5)
Error: Socket closed unexpectedly
    at Socket.<anonymous> (...\node_modules\@redis\client\lib\client\socket.ts:303:29)
```

### Causa Raiz Confirmada
**Redis NO estaba corriendo** al momento del error (23:18:59). Redis fue iniciado despues (23:27:50). El backend intenta conectarse a `redis://127.0.0.1:6379` durante bootstrap y falla porque no hay servidor Redis escuchando.

### Estado Actual del Entorno (verificado 23:28)
| Servicio | Estado | Detalles |
|----------|--------|----------|
| Redis | ACTIVO | v7.0.15, bind 0.0.0.0:6379, uptime reciente |
| PostgreSQL | ACTIVO | v15, cluster online, port 5432 |
| Conectividad Redis Win->WSL | OK | Test-NetConnection: True |
| Base de datos gamilit_platform | EXISTE | Pero con brechas (ver seccion 4) |

---

## 2. DIAGNOSTICO DETALLADO - REDIS Y WEBSOCKET

### 2.1 Arquitectura Redis Actual

El backend usa Redis para **2 propositos** con **3 conexiones independientes**:

```
Backend (NestJS en Windows)
  |
  +-- RedisIoAdapter (redis-io.adapter.ts:235 lineas)
  |   +-- pubClient (conexion TCP #1) --> Socket.IO Pub/Sub
  |   +-- subClient (conexion TCP #2) --> Socket.IO Pub/Sub
  |
  +-- MessagePersistenceService (message-persistence.service.ts:335 lineas)
      +-- client (conexion TCP #3) --> Mensajes offline (Redis Lists)

Destino: redis://127.0.0.1:6379, DB 0 (.env) / DB 1 (default codigo)
```

### 2.2 Cadena de Fallo Detallada

```
TIMELINE DEL ERROR:

23:18:59.000 - main.ts:52    -> RedisIoAdapter creado
23:18:59.001 - main.ts:56    -> connectToRedis() llamado
23:18:59.002 - redis-io.adapter.ts:85-86 -> createClient() para pubClient y subClient
23:18:59.003 - redis-io.adapter.ts:119   -> Promise.all([pub.connect(), sub.connect()])
23:18:59.004 - @redis/client/socket.ts:303 -> Socket.close event (no hay servidor)
23:18:59.005 - redis-io.adapter.ts:94    -> ERROR "Redis sub client error: Socket closed unexpectedly"
23:18:59.006 - redis-io.adapter.ts:72-80 -> Reconnection strategy: intento 1/5
23:18:59.xxx - Intentos 2-5 fallan (Redis sigue sin correr)
23:18:59.xxx - main.ts:57    -> app.useWebSocketAdapter(redisIoAdapter) con isConnected=false
23:18:59.xxx - main.ts:62    -> WARN "Socket.IO using in-memory adapter"
23:18:59.xxx - WebSocketModule.onModuleInit -> MessagePersistenceService.connect()
23:18:59.xxx - message-persistence.service.ts:67 -> Segundo intento de conexion Redis
23:18:59.xxx - FALLA SILENCIOSA: isConnected=false, sin excepcion
```

### 2.3 Problemas Encontrados (por severidad)

#### P0 - CRITICOS

| # | Problema | Archivo:Linea | Impacto |
|---|----------|---------------|---------|
| 1 | Redis no inicia automaticamente con backend | Proceso de dev | Backend arranca degradado sin aviso claro |
| 2 | MessagePersistenceService falla silenciosamente | message-persistence.service.ts:100-104 | Mensajes offline perdidos sin alerta |
| 3 | No hay health check de Redis | health.service.ts | Admin no puede detectar Redis caido |
| 4 | @Optional() en NotificationsGateway | notifications.gateway.ts:57 | Feature critica tratada como opcional |

#### P1 - ALTOS

| # | Problema | Archivo:Linea | Impacto |
|---|----------|---------------|---------|
| 5 | Config mismatch DB: .env=0, codigo default=1 | redis-io.adapter.ts:50, message-persistence.service.ts:46 | Si .env no carga, usa DB incorrecto |
| 6 | Reconnection strategy demasiado conservadora | redis-io.adapter.ts:72-80 | Solo 5 reintentos (~15s total) |
| 7 | 3 conexiones Redis independientes | Ambos archivos | Sin connection pooling |
| 8 | Redis config NO centralizada en ConfigModule | Directo de process.env | Inconsistencia, no validado |

#### P2 - MEDIOS

| # | Problema | Archivo:Linea | Impacto |
|---|----------|---------------|---------|
| 9 | CacheModule usa in-memory, no Redis | app.module.ts (CacheModule.register) | Sin cache distribuido en produccion |
| 10 | No hay script de inicio unificado para dev | Scripts separados | Dev workflow fragil |
| 11 | Logging levels incorrectos | message-persistence.service.ts:147 | Storage failure logueado como `debug` |
| 12 | Sin documentacion Redis en guides | docs/50-guides/ | Desarrolladores sin referencia |

---

## 3. VALIDACION CONTRA DOCUMENTACION

### 3.1 CLAUDE.md (RC5) vs Realidad

| Aspecto | CLAUDE.md dice | Realidad |
|---------|---------------|----------|
| Redis Puerto | 6379 | 6379 - CORRECTO |
| Redis DB | 0 | .env=0, codigo default=1 - INCONSISTENTE |
| Redis Password | - (vacio) | No configurado - OK para dev |
| PostgreSQL | 5432, gamilit_platform | 5432, gamilit_platform - CORRECTO |
| Backend Puerto | 3006 | 3006 (.env PORT) - CORRECTO |

### 3.2 PROJECT-CONTEXT.md vs Realidad

| Aspecto | Documenta | Realidad |
|---------|-----------|----------|
| Redis para Socket.IO | Socket.IO 4.8+ | Implementado con @socket.io/redis-adapter@8.3.0 |
| Modulo comunicacion | 4 entities, datasource communication | Entities OK, datasource definido en app.module.ts |
| WebSocket Module | Listado en 22 modulos | Registrado en app.module.ts |
| Cache | No mencionado explicitamente | CacheModule.register() in-memory |

### 3.3 PROXIMA-ACCION.md - Items Relacionados

| # | Accion Pendiente | Relacion con este error |
|---|------------------|------------------------|
| 1 | Fix communication datasource | RELACIONADO - entities del communication module |
| 4 | Investigar 18 admin endpoints | NO RELACIONADO |
| 5 | Consolidar 6 duplicate API | NO RELACIONADO |

### 3.4 ecosystem.config.js vs Documentacion

| Aspecto | ecosystem.config.js | CLAUDE.md | Discrepancia |
|---------|---------------------|-----------|-------------|
| Backend port (prod) | 4006 | 3006 | SI - Requiere verificacion |
| Frontend port (prod) | 4005 | 3005 | SI - Requiere verificacion |
| Redis init | NO gestionado | No mencionado | Gap documentado |

---

## 4. ESTADO DE BASE DE DATOS - POST RECREACION LIMPIA (2026-02-14)

### 4.1 Metricas Post-Recreacion

Base de datos recreada limpiamente con `init-database.sh` corregido (v4.0 con superuser execution).

| Metrica | CLAUDE.md | BD Recreada | Delta | Causa de Gap |
|---------|-----------|-------------|-------|-------------|
| Schemas | 18 | 20 | +2 | pg_temp schemas |
| Tablas | 171 | 163 | **-8** | 4 tablas nunca crearon DDL + naming |
| Funciones | 183 | 249 | +66 | Doc era undercount (incluye helpers) |
| **Triggers** | **126** | **67** | **-59** | `auth.uid()` missing + naming singular/plural |
| **RLS Policies** | **263** | **203** | **-60** | `auth.uid()` missing + naming singular/plural |
| Views | 22 | 16 | **-6** | 5 DDL con naming errors + 1 missing DDL |
| MVs | 7 | 4 | **-3** | Solo 4 DDL files existen |
| ENUMs | 42 | 42 | OK | |
| FKs | 298 | 268 | **-30** | Tablas faltantes sin FKs |

### 4.2 Tablas por Schema

| Schema | Tablas | Schema | Tablas |
|--------|--------|--------|--------|
| admin_dashboard | 3 | lti_integration | 3 |
| audit_logging | 7 | notifications | 7 |
| auth | 1 | progress_tracking | 20 |
| auth_management | 17 | social_features | 30 |
| communication | 4 | system_configuration | 9 |
| content_management | 8 | **data_warehouse** | **16** |
| educational_content | 20 | gamilit | 0 (schema only) |
| gamification_system | 18 | storage | 0 (schema only) |
| **Total** | **163** | | |

### 4.3 Causas Raiz de Gaps Restantes

| # | Causa Raiz | Impacto | Archivos Afectados |
|---|-----------|---------|-------------------|
| 1 | **`auth.uid()` function no existe** | ~60 RLS + ~24 triggers | TODOS los RLS que verifican usuario |
| 2 | **Naming singular vs plural** | ~20 refs en DDL | views, triggers, indexes, RLS |
| 3 | **`gamilit.is_super_admin()` no existe** | ~6 RLS admin | RLS de admin_dashboard, system_config |
| 4 | **4 tablas sin DDL** | -4 tablas, -30 FKs | media_files, media_metadata, classroom_missions, assignment_classrooms |
| 5 | **3 MVIEW files no existen** | -3 MVs | Documentacion sobrecontaba |

### 4.4 Correcciones Aplicadas al Script (init-database.sh v4.0)

1. **Bug critico:** `sudo -v` sin `-S` colgaba indefinidamente en WSL non-interactive
2. **Bug critico:** `set -e` + `sudo -S -v` exit 1 = script se cerraba silenciosamente
3. **Bug critico:** Todos los DDL objects se ejecutaban como `gamilit_user` sin permisos
4. **Fix:** Todas las funciones, views, MVIEWs, triggers, indexes, RLS ejecutan como superuser
5. **Fix:** Agregado `grant_all_permissions()` post-DDL para dar acceso a gamilit_user
6. **Fix:** Excluidos `.TEST.sql` files del pipeline de funciones
7. **Fix:** Validacion usa superuser para conteos precisos
8. **Fix:** Agregados schemas faltantes: `data_warehouse`, `optimization`, `communication`, `notifications`
9. **Fix:** Carga de cross-schema tables y FK constraints diferidos
10. **Fix:** Carga de RLS enable files globales (07-enable-rls*.sql)

---

## 5. PLAN DE CORRECCIONES POR FASES

### FASE 1: Infraestructura y Entorno (Pre-requisitos)
**Prioridad:** P0 | **Esfuerzo:** 30 min | **Riesgo:** Bajo

| # | Accion | Archivo/Comando | Dependencia |
|---|--------|-----------------|-------------|
| 1.1 | Verificar Redis corre en WSL | `wsl redis-cli ping` | Ninguna |
| 1.2 | Verificar PostgreSQL corre en WSL | `wsl pg_isready` | Ninguna |
| 1.3 | Recrear BD completa si gaps persisten | `bash recreate-database.sh --env dev --force` | 1.1, 1.2 |
| 1.4 | Ejecutar temp-phase2.sh (FK + cross-schema) | `bash temp-phase2.sh` | 1.3 |
| 1.5 | Ejecutar temp-phase3.sh (resiliencia) | `bash temp-phase3.sh` | 1.4 |
| 1.6 | Ejecutar temp-seeds.sh (datos) | `bash temp-seeds.sh` | 1.5 |
| 1.7 | Validar metricas finales vs esperadas | Queries de validacion | 1.6 |

### FASE 2: Configuracion Redis Centralizada
**Prioridad:** P1 | **Esfuerzo:** 2h | **Riesgo:** Bajo

| # | Accion | Archivo | Dependencia |
|---|--------|---------|-------------|
| 2.1 | Crear `redis.config.ts` centralizado | `apps/backend/src/config/redis.config.ts` | Ninguna |
| 2.2 | Alinear defaults: DB 0 en codigo y .env | `redis-io.adapter.ts:50`, `message-persistence.service.ts:46` | 2.1 |
| 2.3 | Agregar REDIS_PASSWORD a .env.production.example | `.env.production.example` | 2.1 |
| 2.4 | Agregar REDIS_RETRY_DELAY_MS y REDIS_MAX_RETRIES a .env | `.env` | 2.1 |
| 2.5 | Inyectar ConfigService en RedisIoAdapter | `redis-io.adapter.ts` | 2.1 |
| 2.6 | Inyectar ConfigService en MessagePersistenceService | `message-persistence.service.ts` | 2.1 |

### FASE 3: Robustez de Conexion Redis
**Prioridad:** P0 | **Esfuerzo:** 3h | **Riesgo:** Medio

| # | Accion | Archivo | Dependencia |
|---|--------|---------|-------------|
| 3.1 | Mejorar reconnection strategy (exponential backoff + jitter) | `redis-io.adapter.ts:72-80` | Fase 2 |
| 3.2 | Aumentar max retries a 10 | `redis-io.adapter.ts`, `message-persistence.service.ts` | 3.1 |
| 3.3 | Agregar log levels correctos (storage fail = error, no debug) | `message-persistence.service.ts:147` | Ninguna |
| 3.4 | Hacer MessagePersistenceService falle loudly en produccion | `message-persistence.service.ts:100-104` | Ninguna |
| 3.5 | Evaluar remover @Optional() en NotificationsGateway | `notifications.gateway.ts:57` | 3.4 |

### FASE 4: Health Check y Monitoreo
**Prioridad:** P0 | **Esfuerzo:** 2h | **Riesgo:** Bajo

| # | Accion | Archivo | Dependencia |
|---|--------|---------|-------------|
| 4.1 | Agregar Redis health check en HealthService | `health.service.ts` | Ninguna |
| 4.2 | Agregar WebSocket status en HealthController | `health.controller.ts` | 4.1 |
| 4.3 | Exponer status de MessagePersistenceService | `health.service.ts` | 4.1 |
| 4.4 | Agregar endpoint /health/redis para monitoreo | `health.controller.ts` | 4.1-4.3 |

### FASE 5: Script de Inicio Unificado Dev
**Prioridad:** P2 | **Esfuerzo:** 1h | **Riesgo:** Bajo

| # | Accion | Archivo | Dependencia |
|---|--------|---------|-------------|
| 5.1 | Crear script `dev-start.sh` que valide Redis+PG antes de npm run dev | `apps/backend/scripts/dev-start.sh` o predev script | Ninguna |
| 5.2 | Agregar check de Redis en `predev` script existente | `package.json` scripts | 5.1 |

### FASE 6: Documentacion
**Prioridad:** P2 | **Esfuerzo:** 1h | **Riesgo:** Nulo

| # | Accion | Archivo | Dependencia |
|---|--------|---------|-------------|
| 6.1 | Crear guia de troubleshooting Redis | `docs/50-guides/troubleshooting/errores-comunes/backend/ERR-BE-009-redis-connection.md` | Fases 2-4 |
| 6.2 | Documentar discrepancia puertos ecosystem.config.js vs docs | Issue/ADR | Ninguna |
| 6.3 | Actualizar CLAUDE.md seccion Redis con configuracion completa | `CLAUDE.md` | Fases 2-4 |

### FASE 7: Validacion Final
**Prioridad:** P0 | **Esfuerzo:** 30 min | **Riesgo:** Bajo

| # | Accion | Comando | Dependencia |
|---|--------|---------|-------------|
| 7.1 | `npm run build` en backend | `cd apps/backend && npm run build` | Fases 2-4 |
| 7.2 | `npm run lint` en backend | `cd apps/backend && npm run lint` | 7.1 |
| 7.3 | `npm run dev` sin errores Redis | `cd apps/backend && npm run dev` | 7.2 |
| 7.4 | Verificar health endpoint incluye Redis | `curl localhost:3006/api/v1/health` | 7.3 |
| 7.5 | Verificar metricas BD = 171 tablas, 126 triggers, etc. | Queries SQL | Fase 1 |

---

## 6. GRAFO DE DEPENDENCIAS

```
FASE 1 (Entorno)
  |
  +---> FASE 2 (Config Redis)
  |       |
  |       +---> FASE 3 (Robustez)
  |       |       |
  |       |       +---> FASE 4 (Health Check)
  |       |                |
  |       |                +---> FASE 5 (Dev Script)
  |       |                |
  |       |                +---> FASE 6 (Documentacion)
  |       |                |
  |       |                +---> FASE 7 (Validacion Final)
  |       |
  |       +---> FASE 7 (Validacion Final) [parcial]
  |
  +---> FASE 7.5 (Validacion BD) [independiente]
```

---

## 7. OBJETOS IMPACTADOS

### Archivos a Modificar

| Archivo | Fase | Tipo de Cambio |
|---------|------|---------------|
| `apps/backend/src/config/redis.config.ts` | 2 | CREAR |
| `apps/backend/src/adapters/redis-io.adapter.ts` | 2,3 | MODIFICAR |
| `apps/backend/src/modules/websocket/services/message-persistence.service.ts` | 2,3 | MODIFICAR |
| `apps/backend/src/modules/websocket/notifications.gateway.ts` | 3 | MODIFICAR |
| `apps/backend/src/modules/health/health.service.ts` | 4 | MODIFICAR |
| `apps/backend/src/modules/health/health.controller.ts` | 4 | MODIFICAR |
| `apps/backend/.env` | 2 | MODIFICAR |
| `apps/backend/.env.production.example` | 2 | MODIFICAR |
| `docs/50-guides/troubleshooting/errores-comunes/backend/ERR-BE-009-redis-connection.md` | 6 | CREAR |

### Archivos de Referencia (solo lectura)

| Archivo | Razon |
|---------|-------|
| `apps/backend/src/main.ts` | Verificar bootstrap flow |
| `apps/backend/src/app.module.ts` | Verificar CacheModule y datasources |
| `apps/backend/src/modules/websocket/websocket.module.ts` | Verificar providers |
| `apps/backend/package.json` | Verificar dependencias Redis |
| `apps/database/scripts/recreate-database.sh` | Proceso de recreacion |
| `apps/database/scripts/temp-phase2.sh` | FK y cross-schema |
| `apps/database/scripts/temp-phase3.sh` | Resiliencia |

### Documentos a Actualizar

| Documento | Cambio |
|-----------|--------|
| `orchestration/PROXIMA-ACCION.md` | Agregar esta tarea y resultados |
| `orchestration/inventarios/BACKEND_INVENTORY.yml` | Actualizar metricas si cambian |
| `CLAUDE.md` | Agregar seccion Redis config si aplica |

---

## 8. ESTIMACION DE ESFUERZO

| Fase | Esfuerzo | Tipo | Dependencias |
|------|----------|------|-------------|
| Fase 1: Entorno | 30 min | Operativo (scripts BD) | Redis + PG running |
| Fase 2: Config Redis | 2h | Desarrollo (nuevo archivo + refactor) | Fase 1 |
| Fase 3: Robustez | 3h | Desarrollo (modificar 3 archivos) | Fase 2 |
| Fase 4: Health Check | 2h | Desarrollo (modificar 2 archivos) | Ninguna |
| Fase 5: Dev Script | 1h | Operativo (script bash) | Ninguna |
| Fase 6: Documentacion | 1h | Documentacion | Fases 2-4 |
| Fase 7: Validacion | 30 min | Verificacion | Todas |
| **Total** | **~10h** | | |

---

## 9. RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Recrear BD rompe seeds existentes | Media | Alto | Usar --force solo en dev, backup antes |
| Cambios en Redis config rompen produccion | Baja | Alto | Mantener backwards-compatible, test en dev primero |
| Health check expone info sensible | Baja | Medio | No incluir passwords en health response |
| NotificationsGateway falla si se remueve @Optional() | Media | Alto | Evaluar si Redis es mandatorio o degradar gracefully |

---

## 10. CRITERIOS DE ACEPTACION

- [ ] `npm run dev` arranca sin errores de Redis (Redis corriendo)
- [ ] `npm run dev` arranca con WARNING claro si Redis NO esta corriendo
- [ ] Health endpoint `/api/v1/health` incluye estado de Redis
- [ ] Base de datos tiene 171 tablas, 126 triggers, 263 RLS policies
- [ ] Config Redis centralizada en `redis.config.ts`
- [ ] Defaults alineados: DB=0 en codigo y .env
- [ ] Reconnection usa exponential backoff (no linear)
- [ ] `npm run build` y `npm run lint` pasan sin errores
- [ ] Documentacion de troubleshooting Redis creada
