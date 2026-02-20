# FASE 4: Analisis de Configuracion, Puertos, CORS, SSL y PM2

**Fecha:** 2026-02-19
**Tipo:** RESEARCH-ONLY (sin cambios de codigo)
**Alcance:** Auditoria de archivos de entorno, ecosystem PM2, CORS, SSL, y consistencia de puertos

---

## 1. Inventario de Archivos de Entorno

### 1.1 Backend (`apps/backend/`)

| Archivo | Existe | En .gitignore | Proposito |
|---------|--------|---------------|-----------|
| `.env` | Si | Si (gitignored por `.env` rule) | Fallback de desarrollo |
| `.env.dev` | Si | Si (gitignored por `.env*` rule en backend/.gitignore) | Overrides WSL2 dev |
| `.env.production` | Si | Si (gitignored por root `.env.production`) | Produccion (con placeholders) |
| `.env.local` | No | Si | Override local (prioridad maxima) |

**Orden de carga** (ConfigModule en `app.module.ts` linea 50-54):
```
envFilePath: [
  '.env.local',                                          // 1. Override local
  NODE_ENV === 'production' ? '.env.production' : '.env.dev',  // 2. Segun ambiente
  '.env',                                                // 3. Fallback
]
```

### 1.2 Frontend (`apps/frontend/`)

| Archivo | Existe | En .gitignore | Proposito |
|---------|--------|---------------|-----------|
| `.env` | Si | Si | Desarrollo (activo) |
| `.env.example` | Si | No (excluido de gitignore) | Template con todos los vars |
| `.env.production.example` | Si | No (excluido de gitignore) | Template produccion |
| `.env.production` | **NO** | Si | **FALTA** -- necesario para builds de produccion |

**Hallazgo critico:** No existe `apps/frontend/.env.production`. El archivo `.env.production.example` existe como template, pero Vite necesita un `.env.production` real para `vite build --mode production`. Sin este archivo, la build de produccion usaria los valores de `.env` (localhost), lo cual el validador en `env.ts` linea 104-110 detectaria y lanzaria error: `"Invalid production configuration: VITE_API_HOST points to localhost"`.

---

## 2. Tabla de Variables de Entorno -- Estado y Recomendaciones

### 2.1 Backend

| Variable | `.env` (dev) | `.env.production` | Recomendacion |
|----------|-------------|-------------------|---------------|
| `NODE_ENV` | development | production | OK |
| `PORT` | 3006 | 3006 | OK |
| `DB_HOST` | localhost | localhost | OK (prod es local) |
| `DB_PORT` | 5432 | 5432 | OK |
| `DB_PASSWORD` | gamilit_dev_2026 | **CHANGE_ME_IN_PRODUCTION** | CRITICO: Reemplazar en servidor |
| `DB_SYNCHRONIZE` | false | false | OK |
| `DB_LOGGING` | true | false | OK |
| `DB_POOL_MAX` | 2 | **ausente** | ADVERTENCIA: Usara default 2; produccion deberia ser 5-10 |
| `JWT_SECRET` | gamilit-dev-jwt-... | **CHANGE_ME_IN_PRODUCTION** | CRITICO: Reemplazar en servidor |
| `JWT_EXPIRES_IN` | 24h | 15m | OK (prod mas restrictivo) |
| `JWT_REFRESH_SECRET` | **ausente** | **ausente** | CRITICO: main.ts valida este campo en prod; fallback es "your-refresh-secret-change-in-production" que falla validacion (<32 chars o contiene placeholder) |
| `JWT_REFRESH_EXPIRES_IN` | **ausente** | **ausente** | Default 7d via jwt.config.ts; explicitar |
| `SESSION_SECRET` | gamilit-dev-session-... | **CHANGE_ME_IN_PRODUCTION** | CRITICO: Reemplazar en servidor |
| `CORS_ORIGIN` | http://localhost:3005,3006 | https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102 | Ver seccion 4 |
| `ENABLE_SWAGGER` | true | false | OK |
| `FRONTEND_URL` | http://localhost:3005 | https://74.208.126.102:3005 | Ver seccion 4.2 |
| `REDIS_ENABLED` | true | **ausente** | ADVERTENCIA: Default es true (redis.config.ts); deberia ser explicito |
| `REDIS_URL` | redis://127.0.0.1:6379 | redis://localhost:6379 | OK |
| `REDIS_MAX_RETRIES` | 3 | 5 | OK (prod mas resiliente) |
| `CRON_ENABLED` | true | **ausente** | ADVERTENCIA: Default true; deberia ser explicito en prod |
| `LOG_LEVEL` | info | warn | OK |
| `LOG_TO_FILE` | false | true | OK |
| `RATE_LIMIT_TTL` | 60 | 60 | ADVERTENCIA: Considerar ajustar para prod |
| `RATE_LIMIT_MAX` | 100 | 100 | ADVERTENCIA: Muy generoso para prod; considerar 30-50 |
| `SESSION_MAX_AGE` | 86400000 (24h) | 86400000 (24h) | ADVERTENCIA: Produccion deberia ser menor (4-8h) |
| `DB_SSL` | ausente | ausente | OK para DB local; si DB remota, activar |

### 2.2 Frontend

| Variable | `.env` (dev) | `.env.production.example` | Recomendacion |
|----------|-------------|--------------------------|---------------|
| `VITE_APP_ENV` | development | production | OK |
| `VITE_API_HOST` | localhost:3006 | 74.208.126.102:3006 | Ver seccion 4.2 |
| `VITE_API_PROTOCOL` | http | https | OK |
| `VITE_WS_HOST` | localhost:3006 | 74.208.126.102:3006 | Ver seccion 4.2 |
| `VITE_WS_PROTOCOL` | ws | wss | OK |
| `VITE_ENABLE_DEBUG` | true | false | OK |
| `VITE_ENABLE_ANALYTICS` | false | true | OK |
| `VITE_MOCK_API` | false | false | OK |

---

## 3. Placeholders CHANGE_ME_IN_PRODUCTION

Se encontraron **3 placeholders** en `apps/backend/.env.production`:

| Linea | Variable | Valor Placeholder | Impacto |
|-------|----------|-------------------|---------|
| 20 | `DB_PASSWORD` | `CHANGE_ME_IN_PRODUCTION` | App no conecta a BD |
| 25 | `JWT_SECRET` | `CHANGE_ME_IN_PRODUCTION` | main.ts linea 139: valida >32 chars y no placeholder -- **app falla al iniciar** |
| 43 | `SESSION_SECRET` | `CHANGE_ME_IN_PRODUCTION` | Sessions inseguras |

**Placeholder adicional no en .env pero en codigo:**
- `jwt.config.ts` linea 6: `process.env.JWT_SECRET || 'your-secret-key-change-in-production'`
- `jwt.config.ts` linea 21: `process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-change-in-production'`
- `app.config.ts` linea 26: `process.env.SESSION_SECRET || 'session-secret-change-in-production'`

**Variable critica faltante:** `JWT_REFRESH_SECRET` no aparece en ninguno de los 3 archivos .env del backend. En produccion, `main.ts` linea 134 lee `configService.get<string>('JWT_REFRESH_SECRET')` que sera `''`, y linea 142-143 valida que tenga >=32 chars. **El servidor NO arrancara sin este secreto.**

---

## 4. Evaluacion de Seguridad CORS

### 4.1 Configuracion Actual (main.ts lineas 28-51)

```typescript
const corsOrigin = configService.get<string>('app.corsOrigin')
  || 'http://localhost:3005,http://localhost:3006';
const allowedOrigins = corsOrigin.split(',').map(origin => origin.trim());
```

**Produccion `.env.production` linea 30:**
```
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
```

### 4.2 Hallazgos CORS

| # | Hallazgo | Severidad | Detalle |
|---|----------|-----------|---------|
| C-1 | **HTTP origenes en produccion** | ALTA | `http://74.208.126.102:3005` y `http://74.208.126.102` estan permitidos. Si Nginx redirige HTTP->HTTPS, estos origenes nunca deberian llegar. Eliminarlos refuerza seguridad. |
| C-2 | **Puerto :3005 en origen HTTPS** | MEDIA | `https://74.208.126.102:3005` sugiere que el frontend se sirve directamente en puerto 3005 via HTTPS. Si Nginx es reverse proxy en 443, el origin real sera `https://74.208.126.102` (sin puerto). |
| C-3 | **Wildcard check** | BAJA | main.ts linea 40 permite `'*'` si esta en la lista. No esta en .env.production, pero la logica existe. Documentar que `*` NUNCA debe usarse en prod. |
| C-4 | **Null origin permitido** | MEDIA | main.ts linea 35-37: requests sin origin (null) son aceptadas. Esto permite Postman/curl pero tambien ataques desde file:// y redirects. En produccion, considerar rechazar null origin o al menos loguear. |
| C-5 | **WebSocket CORS** | OK | `redis-io.adapter.ts` linea 174 usa las mismas `corsOrigins` que el HTTP CORS. Consistente. |
| C-6 | **`x-tenant-id` header** | OK | Incluido en `allowedHeaders` (main.ts linea 50). Necesario para multi-tenancy. |

### 4.3 FRONTEND_URL Inconsistencia

`.env.production` linea 51:
```
FRONTEND_URL=https://74.208.126.102:3005
```

Si Nginx sirve el frontend en puerto 443, `FRONTEND_URL` deberia ser `https://74.208.126.102` (sin :3005). Este valor se usa para links en emails, redirects, etc. (app.config.ts linea 37).

---

## 5. Evaluacion PM2 (ecosystem.config.js)

### 5.1 `env_file` -- Propiedad Invalida de PM2

**Hallazgo critico:** `env_file` en lineas 65 y 114 **NO es una propiedad valida de PM2**.

PM2 no soporta `env_file` nativamente. La documentacion oficial de PM2 solo reconoce `env`, `env_<name>`, y el flag `--env` al iniciar. La propiedad `env_file` es silenciosamente ignorada.

**Consecuencia:** Los archivos `.env.production` **NO se cargan** via PM2. El backend funciona porque NestJS ConfigModule tiene su propio `envFilePath` que carga `.env.production` cuando `NODE_ENV=production`. Pero las variables `env_production` del ecosystem (PORT, NODE_ENV) SI se inyectan.

**Para el frontend:** `env_file: './.env.production'` es ignorada por PM2. Como Vite bakes las variables en build time (no runtime), las variables VITE_* deben existir durante `npm run build`, no durante `vite preview`. El `env_file` en el bloque frontend es doblemente inutil.

**Recomendacion:** Eliminar `env_file` de ambos bloques para evitar confusion. Documentar que:
- Backend: env vars vienen de ConfigModule (.envFilePath)
- Frontend: env vars se embeben durante `npm run build --mode production`

### 5.2 `vite preview` para Produccion

**Hallazgo importante:** El frontend se sirve con `npx vite preview --port 3005 --host 0.0.0.0`.

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Idoneidad | INADECUADO | `vite preview` esta disenado para verificar builds localmente, NO para produccion. La documentacion oficial de Vite dice: "It is not meant to be used as a production server." |
| Performance | POBRE | No tiene: worker threads, gzip/brotli compresion, cache headers, connection pooling |
| Seguridad | POBRE | No tiene: rate limiting, security headers, request size limits |
| Confiabilidad | POBRE | Un solo proceso Node.js sin graceful shutdown optimizado |
| `npx` overhead | INNECESARIO | `npx` resuelve el binario cada vez. Usar `./node_modules/.bin/vite` directamente o (mejor) Nginx |

**Recomendacion:** Reemplazar `vite preview` con Nginx. El archivo `apps/frontend/nginx.conf` ya existe y tiene buena configuracion (security headers, gzip, cache, SPA fallback). Usarlo.

### 5.3 `wait_ready` sin `process.send('ready')`

**Hallazgo:** ecosystem.config.js linea 79 tiene `wait_ready: true` y linea 80 tiene `listen_timeout: 10000`.

Cuando `wait_ready: true`, PM2 espera recibir `process.send('ready')` del proceso antes de considerarlo "online". Sin embargo, `main.ts` **nunca llama** `process.send('ready')`.

**Consecuencia:** PM2 espera 10 segundos (`listen_timeout`) y luego marca la app como "online" por timeout. Esto significa:
- El health check de PM2 no es confiable (siempre "online" despues de 10s)
- Si la app tarda >10s en arrancar, PM2 podria reportar "online" antes de estar lista
- Si la app falla al arrancar pero dentro de 10s, PM2 podria no detectarlo correctamente

**Recomendacion:** Agregar `process.send?.('ready')` en `main.ts` despues de `await app.listen(port)`, o eliminar `wait_ready: true` del ecosystem.

### 5.4 Otras Observaciones PM2

| Aspecto | Valor | Evaluacion |
|---------|-------|------------|
| `max_memory_restart` backend | 1G | OK para produccion |
| `max_memory_restart` frontend | 512M | Excesivo para vite preview; OK si se migra a Nginx (no aplica) |
| `max_restarts` | 10 | OK |
| `min_uptime` | 10s | OK |
| `kill_timeout` | 5000 | OK |
| `instances` | 1 (fork) | OK para MVP; cluster mode recomendado si escala |
| `node_args` | `-r ./tsconfig-paths-bootstrap.js` | OK |
| `merge_logs` | true | OK |
| Log paths | `../../logs/` | Asegurar que el directorio existe en servidor |

---

## 6. SSL / HTTPS

### 6.1 Estado Actual

| Aspecto | Estado | Detalle |
|---------|--------|---------|
| Backend HTTPS nativo | NO | main.ts usa `app.listen(port)` sin TLS config |
| Frontend HTTPS nativo | NO | vite preview no tiene SSL |
| Nginx SSL | REFERENCIADO | CLAUDE.md menciona "Nginx + Certbot" pero no hay nginx config de servidor en el repo |
| DB SSL | DESHABILITADO | `DB_SSL` no esta en .env.production; database.config.ts linea 44 pone `false` por default |

**Arquitectura SSL esperada:**
```
Browser --[HTTPS:443]--> Nginx --[HTTP:3006]--> Backend NestJS
Browser --[HTTPS:443]--> Nginx --[static files]--> Frontend dist/
Browser --[WSS:443]----> Nginx --[WS:3006]-----> Backend Socket.IO
```

### 6.2 Hallazgos SSL

| # | Hallazgo | Severidad | Detalle |
|---|----------|-----------|---------|
| S-1 | **Sin Nginx reverse proxy config en repo** | ALTA | No hay archivo de configuracion Nginx del servidor (solo `apps/frontend/nginx.conf` para static serving). La config de reverse proxy + SSL termination no esta versionada. |
| S-2 | **CORS origins incluyen http://** | MEDIA | Si Nginx fuerza HTTPS, los origins HTTP nunca llegaran. Pero si alguien accede directamente al puerto 3006, HTTP CORS permite bypass. |
| S-3 | **`sourcemap: true` en produccion** | MEDIA | `vite.config.ts` linea 49 genera source maps en produccion. Expone codigo fuente. Deshabilitar o mover a hidden source maps. |
| S-4 | **`FRONTEND_URL` con :3005** | BAJA | Si Nginx sirve en 443, emails tendran links con :3005 que no funcionaran externamente. |
| S-5 | **Helmet habilitado** | OK | main.ts linea 76 usa `helmet()` para headers de seguridad HTTP. |
| S-6 | **Compression habilitada** | OK | main.ts linea 79. Redundante si Nginx comprime, pero no danino. |

---

## 7. Matriz de Consistencia de Puertos

### 7.1 Backend (3006)

| Archivo | Puerto | Consistente |
|---------|--------|-------------|
| `apps/backend/.env` | `PORT=3006` | OK |
| `apps/backend/.env.dev` | (no define PORT, hereda .env) | OK |
| `apps/backend/.env.production` | `PORT=3006` | OK |
| `ecosystem.config.js` env_production | `PORT: 3006` | OK |
| `ecosystem.config.js` env_development | `PORT: 3006` | OK |
| `main.ts` default | `configService.get('env.port', 3006)` | OK |
| `env.validation.ts` default | `PORT: number = 3006` | OK |
| `env.config.ts` default | `parseInt(process.env.PORT \|\| '3006', 10)` | OK |
| `apps/frontend/.env` VITE_API_HOST | `localhost:3006` | OK |
| `apps/frontend/.env.production.example` | `74.208.126.102:3006` | OK |
| `vite.config.ts` proxy target | `http://localhost:3006` | OK |
| `deploy-production.sh` health check | `${PORT:-3006}` | OK |
| CLAUDE.md | Puerto 3006 | OK |

**Resultado: 100% consistente para puerto 3006.**

### 7.2 Frontend (3005)

| Archivo | Puerto | Consistente |
|---------|--------|-------------|
| `apps/frontend/.env` | (no define puerto; Vite server default) | -- |
| `vite.config.ts` server.port | `3005` | OK |
| `ecosystem.config.js` args | `--port 3005` | OK |
| `apps/backend/.env` CORS_ORIGIN | `http://localhost:3005` | OK |
| `apps/backend/.env.production` CORS_ORIGIN | `https://74.208.126.102:3005` | OK |
| `apps/backend/.env.production` FRONTEND_URL | `https://74.208.126.102:3005` | OK |
| `apps/backend/.env` FRONTEND_URL | `http://localhost:3005` | OK |
| `main.ts` default CORS | `http://localhost:3005` | OK |
| CLAUDE.md | Puerto 3005 | OK |

**Resultado: 100% consistente para puerto 3005.**

### 7.3 Database (5432)

| Archivo | Puerto | Consistente |
|---------|--------|-------------|
| `apps/backend/.env` | `DB_PORT=5432` | OK |
| `apps/backend/.env.dev` | `DB_PORT=5432` | OK |
| `apps/backend/.env.production` | `DB_PORT=5432` | OK |
| `database.config.ts` default | `'5432'` | OK |
| `env.validation.ts` default | `DB_PORT: number = 5432` | OK |
| CLAUDE.md | Puerto 5432 | OK |

**Resultado: 100% consistente para puerto 5432.**

### 7.4 Redis (6379)

| Archivo | Puerto | Consistente |
|---------|--------|-------------|
| `apps/backend/.env` | `redis://127.0.0.1:6379` | OK |
| `apps/backend/.env.dev` | `redis://127.0.0.1:6379` | OK |
| `apps/backend/.env.production` | `redis://localhost:6379` | OK |
| `redis.config.ts` default | `redis://localhost:6379` | OK |
| `redis-io.adapter.ts` default | `redis://localhost:6379` | OK |
| CLAUDE.md | Puerto 6379 | OK |

**Resultado: 100% consistente para puerto 6379.**

### 7.5 Staging (3015/3016)

| Archivo | Puerto Backend | Puerto Frontend | Consistente |
|---------|---------------|-----------------|-------------|
| `ecosystem.staging.config.js` | 3016 | 3015 | OK (separado de prod) |

**Resultado: Sin conflicto con produccion.**

---

## 8. Resumen de Hallazgos por Severidad

### CRITICOS (bloquean arranque en produccion)

| # | Hallazgo | Archivo | Accion Requerida |
|---|----------|---------|------------------|
| P-1 | `JWT_REFRESH_SECRET` ausente en todos los .env | Todos los .env del backend | Agregar variable con secreto >=32 chars, diferente de JWT_SECRET |
| P-2 | 3 placeholders `CHANGE_ME_IN_PRODUCTION` | `.env.production` | Reemplazar en servidor (NO commitear secretos reales) |
| P-3 | Frontend `.env.production` no existe | `apps/frontend/` | Crear a partir de `.env.production.example` con valores reales |

### ALTOS (degradan seguridad o rendimiento en produccion)

| # | Hallazgo | Archivo | Accion Requerida |
|---|----------|---------|------------------|
| A-1 | `env_file` no es propiedad valida de PM2 | `ecosystem.config.js` | Eliminar propiedad; confiar en ConfigModule y build-time vars |
| A-2 | `vite preview` inadecuado para produccion | `ecosystem.config.js` | Migrar a Nginx usando `apps/frontend/nginx.conf` existente |
| A-3 | `wait_ready: true` sin `process.send('ready')` | `ecosystem.config.js` + `main.ts` | Agregar `process.send?.('ready')` en main.ts o eliminar `wait_ready` |
| A-4 | HTTP origins en CORS de produccion | `.env.production` linea 30 | Eliminar `http://74.208.126.102:3005` y `http://74.208.126.102` |
| A-5 | Nginx reverse proxy config no versionada | (no existe) | Crear y versionar config Nginx del servidor en `apps/devops/` |
| A-6 | `sourcemap: true` expone codigo fuente | `vite.config.ts` linea 49 | Cambiar a `sourcemap: 'hidden'` o `false` para produccion |

### MEDIOS (mejoras recomendadas)

| # | Hallazgo | Archivo | Accion Requerida |
|---|----------|---------|------------------|
| M-1 | `DB_POOL_MAX` ausente en .env.production | `.env.production` | Agregar `DB_POOL_MAX=5` (o mas segun carga) |
| M-2 | `REDIS_ENABLED` ausente en .env.production | `.env.production` | Agregar `REDIS_ENABLED=true` explicito |
| M-3 | `CRON_ENABLED` ausente en .env.production | `.env.production` | Agregar `CRON_ENABLED=true` explicito |
| M-4 | `FRONTEND_URL` con :3005 | `.env.production` | Cambiar a `https://74.208.126.102` si Nginx sirve en 443 |
| M-5 | CORS origin `https://74.208.126.102:3005` | `.env.production` | Si Nginx en 443, origin real es sin :3005 |
| M-6 | `RATE_LIMIT_MAX=100` mismo en dev y prod | `.env.production` | Considerar reducir a 30-50 para produccion |
| M-7 | Null origin permitido en CORS | `main.ts` linea 35-37 | Considerar rechazar en produccion |
| M-8 | `SESSION_MAX_AGE=86400000` (24h) en prod | `.env.production` | Considerar reducir a 4-8h |

### BAJOS (cosmeticos o documentacion)

| # | Hallazgo | Archivo | Accion Requerida |
|---|----------|---------|------------------|
| B-1 | `DB_USER` y `DB_USERNAME` duplicados | `.env`, `.env.dev`, `.env.production` | Estandarizar a uno solo; database.config.ts acepta ambos |
| B-2 | `DB_DATABASE` y `DB_NAME` duplicados | `.env`, `.env.dev`, `.env.production` | Estandarizar a uno solo |
| B-3 | deploy-production.sh health check busca `/api/health` | `deploy-production.sh` linea 434 | Backend usa prefix `/api/v1`, verificar ruta correcta |
| B-4 | deploy-production.sh checks Swagger docs | `deploy-production.sh` linea 451 | Swagger esta deshabilitado en prod; check siempre falla |

---

## 9. Recomendaciones Arquitectonicas

### 9.1 Arquitectura de Produccion Recomendada

```
                                   +------------------+
                                   |   Nginx (443)    |
                                   |  SSL Termination |
                                   |  Reverse Proxy   |
                                   +--------+---------+
                                            |
                          +-----------------+-----------------+
                          |                                   |
                   /api/* & /socket.io/*              /* (static)
                          |                                   |
                   +------+------+                  +---------+---------+
                   | Backend     |                  | Frontend dist/    |
                   | NestJS:3006 |                  | (Nginx sirve      |
                   | (PM2 fork)  |                  |  archivos estaticos)|
                   +-------------+                  +-------------------+
```

### 9.2 Prioridad de Acciones

1. **Inmediato (P0):** Agregar `JWT_REFRESH_SECRET` a `.env.production` y al servidor
2. **Inmediato (P0):** Verificar que placeholders estan reemplazados en servidor real
3. **Inmediato (P0):** Crear `apps/frontend/.env.production` en el servidor
4. **Corto plazo (P1):** Migrar frontend de `vite preview` a Nginx
5. **Corto plazo (P1):** Agregar `process.send?.('ready')` a main.ts
6. **Corto plazo (P1):** Limpiar `env_file` del ecosystem.config.js
7. **Corto plazo (P1):** Versionar Nginx server config
8. **Medio plazo (P2):** Ajustar CORS origins, rate limits, session ages para produccion
9. **Medio plazo (P2):** Deshabilitar source maps en build de produccion

---

## 10. Validaciones de Seguridad en Codigo (Positivas)

El codigo tiene varias validaciones de seguridad bien implementadas:

1. **main.ts lineas 131-157:** Validacion de secretos al arrancar en produccion. Si JWT_SECRET, JWT_REFRESH_SECRET, o DB_PASSWORD no cumplen requisitos, `process.exit(1)`.
2. **env.ts lineas 104-110 (frontend):** Error si `VITE_API_HOST` apunta a localhost en produccion.
3. **env.ts lineas 114-120 (frontend):** Validacion de protocolos (solo http/https y ws/wss).
4. **env.validation.ts (backend):** Validacion de tipos con class-validator al iniciar.
5. **Swagger deshabilitado en produccion:** main.ts linea 100 verifica NODE_ENV.
6. **Helmet habilitado:** main.ts linea 76.
7. **ValidationPipe global:** Whitelist + forbidNonWhitelisted (main.ts lineas 82-91).
8. **nginx.conf (frontend):** Security headers (X-Frame-Options, X-Content-Type-Options, CSP, etc.).

---

*Generado por TASK-2026-02-19-ANALISIS-DEPLOY-PROD | Agente: Claude Opus 4.6 | Modo: ANALYSIS*
