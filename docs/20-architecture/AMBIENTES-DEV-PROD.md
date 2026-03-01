---
titulo: Diferencias Dev vs Prod
tipo: arquitectura
ultima_actualizacion: 2026-02-27
---

# Diferencias Dev (WSL) vs Prod (Servidor)

**Version:** 1.2.0
**Fecha:** 2026-02-27

---

## Conectividad

| Aspecto | Dev (WSL Windows) | Prod (74.208.126.102) |
|---------|-------------------|----------------------|
| Backend URL | http://localhost:3006 | https://74.208.126.102/api/ (via Nginx:443 → localhost:3006) |
| Frontend URL | http://localhost:3005 | https://74.208.126.102 (via Nginx:443 → localhost:3005) |
| Frontend API Mode | **Proxy** (`VITE_API_HOST=proxy`) — URLs relativas via Vite dev server | **Proxy** (`VITE_API_HOST=proxy`) — URLs relativas `/api/v1/...`, Nginx rutea `/api/` a backend:3006 |
| WebSocket | Auto-detecta `window.location.hostname:3006` | wss://74.208.126.102/socket.io/ (via Nginx:443 → localhost:3006) |
| CORS LAN | Auto-acepta IPs privadas (192.168.x, 10.x, 172.16-31.x) | Solo whitelist explicita |
| DB Host | Deterministico via `DB_HOST_MODE` + `npm run predev` (`wsl-ip` o `localhost`) | localhost |
| DB Port | 5432 | 5432 |
| DB Pool Max | 2 (WSL2 limitado) | 2 |
| DB Timeout | 15000ms | 15000ms |
| Redis | Configurable via `REDIS_ENABLED` (true/false, defecto=true) | REQUERIDO (localhost:6379) |

## SSL/HTTPS — Arquitectura Nginx en Produccion

- **Dev:** Sin SSL, HTTP directo en puertos 3005/3006
- **Prod:** Nginx reverse proxy con SSL (Let's Encrypt via Certbot)
- **CORS:** Manejado SOLO por NestJS (NUNCA duplicar en Nginx)

### Flujo de Trafico en Produccion (Puerto Unico: 443)

```
Browser
  │
  ├─ https://74.208.126.102/api/v1/...   ──→ Nginx :443 ──→ proxy_pass 127.0.0.1:3006 (Backend)
  ├─ wss://74.208.126.102/socket.io/     ──→ Nginx :443 ──→ proxy_pass 127.0.0.1:3006 (WebSocket)
  ├─ https://74.208.126.102/*.js,*.css    ──→ Nginx :443 ──→ proxy_pass 127.0.0.1:3005 (Static assets)
  └─ https://74.208.126.102/             ──→ Nginx :443 ──→ proxy_pass 127.0.0.1:3005 (SPA HTML)
```

**Puertos 3005 y 3006 son INTERNOS (localhost only).** El browser nunca accede directamente a estos puertos.
Nginx escucha en **puerto 443** y usa **location blocks** para dirigir el trafico:
- `/api/` y `/api/v1/auth/` → backend (3006)
- `/socket.io/` → backend (3006) con upgrade WebSocket
- `*.js, *.css, *.png, ...` → frontend (3005) con cache 1 año
- `/` (todo lo demas) → frontend (3005) sin cache (SPA entry point)

**Config Nginx:** `apps/devops/nginx/gamilit.conf` (copiar a `/etc/nginx/sites-available/gamilit`)

## Redis: Requerido vs Opcional

### Produccion (REQUERIDO)

**Redis es obligatorio en producción** para:
- **WebSocket real-time:** Socket.IO adapter distribuido (múltiples instancias backend)
- **Cache distribuido:** Session persistence, leaderboard updates, notificaciones pendientes
- **Message persistence:** Garantizar entrega de mensajes incluso con desconexiones inesperadas

Si Redis no está disponible en producción, **el sistema fallará**:
- WebSocket desconexiones permanentes, no se recuperan
- Session timeouts inesperados, usuarios desconectados
- Perdida de notificaciones en tiempo real
- Cache inefectivo, carga excesiva en BD

**Configuracion en prod:**
- `REDIS_ENABLED=true` (obligatorio, no cambiar)
- `REDIS_URL=redis://localhost:6379` (o Redis remoto con password)

### Desarrollo (OPCIONAL)

**Redis es opcional en desarrollo** para máxima flexibilidad durante desarrollo iterativo:
- Set `REDIS_ENABLED=false` en `.env.dev` para deshabilitar completamente Redis
- El sistema **funciona 100% para desarrollo normal** sin Redis
- WebSocket usa **in-memory adapter** (funciona perfectamente con 1 instancia backend)
- Cache usa **in-memory store** (defecto de @nestjs/cache-manager, ~100 items)
- Session management usa memoria local por peticion

**Limitaciones sin Redis en dev (no afecta desarrollo normal):**
- WebSocket solo funciona con 1 instancia backend (no escalable, pero dev usa 1 instancia)
- Cache de memoria no persiste entre restarts (reload de navegador reinicia memoria)
- Notificaciones pendientes se pierden si el backend crashea (durante dev esto es normal)
- Leaderboard updates no se sincronizan en multi-instancia (dev no usa multi-instancia)

**Para habilitar Redis en dev:** Set `REDIS_ENABLED=true` en `.env.dev` si tienes Redis corriendo en WSL2
- Util para testing de features distribuidas (multi-browser, simulaciones multi-instancia)
- NO requerido para desarrollo diario

### Configuracion de Flags (Backend)

Definido en `apps/backend/src/config/redis.config.ts`:

| Variable | Default | Efecto |
|----------|---------|--------|
| `REDIS_ENABLED` | true | Si false, todas las features Redis se deshabilitan gracefully (socket.io in-memory, cache in-memory) |
| `REDIS_URL` | redis://localhost:6379 | URL de conexion (protocolo redis:// o rediss:// con SSL) |
| `REDIS_PASSWORD` | undefined | Password si Redis esta protegido con AUTH |
| `REDIS_SOCKET_DB` | 0 | Database number para Socket.IO adapter (redis db 0) |
| `REDIS_SOCKET_PREFIX` | gamilit:socket: | Prefix para keys de Socket.IO |

### Checklist de Configuracion

**Dev:**
- `.env.dev`: `REDIS_ENABLED=false` (recomendado) o `REDIS_ENABLED=true` si Redis local disponible
- No necesita acceso a Redis para funcionar

**Prod:**
- `.env.production`: `REDIS_ENABLED=true` (OBLIGATORIO)
- `REDIS_URL=redis://localhost:6379` (o parametros separados)
- **Verificar:** `redis-cli ping` debe responder PONG antes de iniciar backend

## Modo Proxy y Acceso LAN (Dev)

En desarrollo, el frontend usa **modo proxy** (`VITE_API_HOST=proxy`) para permitir acceso desde cualquier dispositivo en la red local sin configuracion adicional.

### Como Funciona

```
Dispositivo LAN → http://192.168.1.X:3005 (Vite dev server, host:true)
                  ↓ /api/v1/* (URL relativa)
                  Vite proxy (server-side) → http://localhost:3006
                  ↓ respuesta
                  ← Dispositivo LAN
```

1. `VITE_API_HOST=proxy` activa modo proxy en `api.config.ts`
2. `API_BASE_URL` se construye como `/api/v1` (relativo, sin hostname)
3. Vite dev server intercepta `/api/*` y lo redirige a `localhost:3006` (server-side)
4. Como el proxy corre en el servidor, funciona para cualquier cliente independientemente de su IP

### WebSocket en Modo Proxy

WebSocket no puede usar proxy relativo, asi que usa `window.location.hostname:3006`:
- Desde `localhost` → `ws://localhost:3006`
- Desde `192.168.1.50` → `ws://192.168.1.50:3006` (conecta directo al backend)

### CORS para Red Local

En dev (`NODE_ENV !== 'production'`), el backend auto-acepta origenes de:
- `192.168.x.x` (redes privadas clase C)
- `10.x.x.x` (redes privadas clase A)
- `172.16-31.x.x` (redes privadas clase B)
- `localhost` (siempre en whitelist)

En produccion, CORS es estrictamente por whitelist explicita (sin auto-accept).

### Configuracion por Ambiente

| Variable | Dev (proxy) | Prod (absoluto) |
|----------|-------------|-----------------|
| `VITE_API_HOST` | `proxy` | `proxy` (Nginx rutea `/api/` a backend:3006 — URLs relativas) |
| `VITE_WS_HOST` | (vacio) | (vacio) (usa `window.location.host` — Nginx rutea `/socket.io/`) |
| `VITE_API_PROTOCOL` | `http` | `https` |
| `VITE_WS_PROTOCOL` | `ws` | `wss` |

## Despliegue

| Aspecto | Dev | Prod |
|---------|-----|------|
| Comando | `npm run dev` (ts-node-dev hot-reload) | `npm run build` -> PM2 fork mode |
| PM2 | No requerido | `pm2 start ecosystem.config.js` |
| Nginx | No requerido | Reverse proxy + SSL termination |
| DB Recrear | `bash apps/database/scripts/recreate-database.sh` | SSH + backup + recrear |
| Logs | Console output | `logs/backend-*.log`, `pm2 logs` |

## Configuracion PM2 (ecosystem.config.js)

Identica en ambos ambientes:
- **Backend:** puerto 3006, fork mode, 1GB max memory
- **Frontend:** puerto 3005 (vite preview), fork mode, 512MB max memory
- **Auto-restart:** habilitado en ambos

## Variables de Entorno

### Servidor y Aplicacion

| Variable | Dev | Prod | Config file |
|----------|-----|------|-------------|
| `NODE_ENV` | `development` | `production` | env.config.ts |
| `PORT` | `3006` | `3006` | env.config.ts |
| `API_PREFIX` | `api` | `api` | env.config.ts |
| `APP_NAME` | `GAMILIT` | `GAMILIT` | env.config.ts |
| `APP_VERSION` | `4.1.0` | `4.1.0` | env.config.ts |
| `LOG_LEVEL` | `debug` | `warn` | env.config.ts |
| `LOG_TO_FILE` | `false` | `true` | env.config.ts |
| `MAINTENANCE_MODE` | `false` | `false` | app.config.ts |
| `ENABLE_SWAGGER` | `true` | `false` (OBLIGATORIO) | env.config.ts |
| `ENABLE_CORS` | `true` | `true` | env.config.ts |
| `CORS_ORIGIN` | `http://localhost:3005,http://localhost:3006` | `https://74.208.126.102` (origen del browser via Nginx:443) | app.config.ts |
| `ALLOWED_ORIGINS` | `http://localhost:3005,http://localhost:3006` | (mismo que CORS_ORIGIN) | env.config.ts |
| `FRONTEND_URL` | `http://localhost:3005` | `https://74.208.126.102` (URL publica via Nginx, sin puerto) | app.config.ts |

### Base de Datos

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `DB_HOST_MODE` | `auto` (recomendado), `localhost`, `wsl-ip` | N/A | Solo backend predev hook |
| `DB_HOST` | Gestionado por `predev` segun `DB_HOST_MODE` | `localhost` | database.config.ts |
| `DB_PORT` | `5432` | `5432` | database.config.ts |
| `DB_DATABASE` | `gamilit_platform` | `gamilit_platform` | database.config.ts |
| `DB_USERNAME` | `gamilit_user` | `gamilit_user` | Leido por TypeORM (database.config.ts) |
| `DB_USER` | `gamilit_user` | `gamilit_user` | Leido por scripts DDL/seeds |
| `DB_PASSWORD` | `gamilit_dev_2026` | Rotado en prod (ver .env.production) | database.config.ts |
| `DB_SYNCHRONIZE` | `false` | `false` (NUNCA true en prod) | database.config.ts |
| `DB_LOGGING` | `false` | `false` | database.config.ts |
| `DB_SSL` | `false` | `false` (Nginx termina SSL) | database.config.ts |
| `DB_POOL_MAX` | `2` | `2` (2 × 11 datasources = 22 total) | database.config.ts |
| `DB_CONNECTION_TIMEOUT` | `15000` | `15000` | ms; database.config.ts |
| `DB_IDLE_TIMEOUT` | `30000` | `30000` | ms; database.config.ts |
| `DB_RETRY_ATTEMPTS` | `5` | `5` | database.config.ts |
| `DB_RETRY_DELAY` | `5000` | `5000` | ms; database.config.ts |

### JWT y Autenticacion

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `JWT_SECRET` | `dev-only-jwt-secret-...` | Rotado, 32+ chars (OBLIGATORIO) | jwt.config.ts |
| `JWT_EXPIRES_IN` | `24h` | `15m` (recomendado en prod) | jwt.config.ts |
| `JWT_REFRESH_SECRET` | `dev-only-refresh-secret-...` | Rotado, 32+ chars, distinto de JWT_SECRET | jwt.config.ts |
| `JWT_REFRESH_EXPIRES_IN` | `7d` | `7d` | jwt.config.ts |
| `JWT_ISSUER` | `gamilit-api` | `gamilit-api` | jwt.config.ts |
| `JWT_AUDIENCE` | `gamilit-app` | `gamilit-app` | jwt.config.ts |

> **Prod OBLIGATORIO:** `JWT_SECRET` y `JWT_REFRESH_SECRET` deben ser distintos, >= 32 chars. El backend no arranca si son iguales o inseguros.

### Session

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `SESSION_SECRET` | `dev-only-session-secret-...` | Rotado, 32+ chars (OBLIGATORIO en prod) | app.config.ts |
| `SESSION_MAX_AGE` | `86400000` | `86400000` | ms (24h); app.config.ts |

### Rate Limiting

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `RATE_LIMIT_TTL` | `60` | `60` | segundos por ventana; app.config.ts |
| `RATE_LIMIT_MAX` | `100` | `100` | requests por ventana por IP; app.config.ts |

> Implementado via `ThrottlerModule` en `app.module.ts`. Auth y password endpoints tienen limites mas estrictos via `@Throttle()`.

### Redis (Socket.IO y Message Persistence)

Ver seccion detallada **Redis: Requerido vs Opcional** mas arriba para la logica de habilitacion.

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `REDIS_ENABLED` | `false` (recomendado) o `true` si local disponible | `true` (OBLIGATORIO) | redis.config.ts |
| `REDIS_URL` | `redis://127.0.0.1:6379` (si enabled=true) | `redis://localhost:6379` (o remoto) | redis.config.ts |
| `REDIS_PASSWORD` | vacío | Rotado en prod (ver .env.production) | redis.config.ts |
| `REDIS_SOCKET_DB` | `0` | `0` | DB number para Socket.IO adapter |
| `REDIS_SOCKET_PREFIX` | `gamilit:socket:` | `gamilit:socket:` | Prefix keys Socket.IO |
| `REDIS_MESSAGE_PREFIX` | `gamilit:pending:` | `gamilit:pending:` | Prefix keys message persistence |
| `REDIS_MESSAGE_TTL` | `86400` | `86400` | segundos (24h) TTL mensajes pendientes |
| `REDIS_MAX_PENDING_MESSAGES` | `100` | `100` | max mensajes offline por usuario |
| `REDIS_RETRY_DELAY_MS` | `1000` | `1000` | ms entre reintentos de conexion |
| `REDIS_MAX_RETRIES` | `5` | `5` | max reintentos de conexion |

### Cron Jobs

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `CRON_ENABLED` | `false` (recomendado — 19 jobs saturan pool DB) | `true` | tasks.module.ts + main.ts |

### Email (SMTP / SendGrid)

El servicio de email (`MailService`) soporta SMTP generico y SendGrid. Si no se configura ninguno, los emails se loggean en consola (graceful degradation).

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `EMAIL_FROM` | `noreply@gamilit.com` | `noreply@gamilit.com` | Alias remitente; app.config.ts |
| `EMAIL_REPLY_TO` | `support@gamilit.com` | `support@gamilit.com` | Reply-to header; app.config.ts |
| `SMTP_FROM` | (vacio — logs only) | `GAMILIT <notifications@gamilit.com>` | Usado por MailService directamente |
| `SMTP_HOST` | (vacio — modo log) | p.ej. `smtp.mailtrap.io` | mail.service.ts |
| `SMTP_PORT` | (vacio — modo log) | `587` | mail.service.ts |
| `SMTP_USER` | (vacio — modo log) | Credencial SMTP | mail.service.ts |
| `SMTP_PASS` | (vacio — modo log) | Credencial SMTP | mail.service.ts |
| `SMTP_SECURE` | `false` | `false` (587 usa STARTTLS) | mail.service.ts |
| `SENDGRID_API_KEY` | (vacio — usa SMTP si configurado) | SendGrid API Key (alternativa a SMTP) | mail.service.ts; toma precedencia sobre SMTP |
| `FRONTEND_URL` | `http://localhost:3005` | `https://74.208.126.102` (URL publica via Nginx, sin puerto) | Links en emails de reset/verify |

> **Logica de seleccion:** Si `SENDGRID_API_KEY` esta definido, se usa SendGrid (via SMTP relay). Si no, se usa SMTP generico con `SMTP_HOST/PORT/USER/PASS`. Si ninguno esta configurado, los emails solo se loggean.

### Web Push Notifications (VAPID)

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `VAPID_PUBLIC_KEY` | `dev-placeholder-public-key` | Generar con `npx web-push generate-vapid-keys` | Compartida con frontend |
| `VAPID_PRIVATE_KEY` | `dev-placeholder-private-key` | Clave privada generada (SECRETO) | Nunca exponer al cliente |
| `VAPID_SUBJECT` | `mailto:admin@gamilit.com` | `mailto:admin@gamilit.com` | Contacto del servidor |

> Si no se configuran en prod, push notifications quedan deshabilitadas (graceful degradation).

### SMS Notifications (Twilio)

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `TWILIO_ACCOUNT_SID` | `dev-placeholder` | Account SID de Twilio (empieza con `AC...`) | notifications module |
| `TWILIO_AUTH_TOKEN` | `dev-placeholder` | Auth Token de Twilio | notifications module |
| `TWILIO_PHONE_NUMBER` | `+1234567890` | Numero Twilio en formato E.164 | notifications module |

> Si no se configuran, SMS queda deshabilitado (graceful degradation).

### Feature Flags

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `ENABLE_DATA_WAREHOUSE` | `false` | `false` (hasta que data_warehouse schema este provisionado) | app.module.ts; habilita modulos ETL, ML, Visualization |

> Con `ENABLE_DATA_WAREHOUSE=true`, se cargan condicionalmente los modulos `etl`, `ml`, y `visualization`. Requiere que el schema `data_warehouse` exista en PostgreSQL.

### Observabilidad (OpenTelemetry) — Opcional

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `OTEL_ENABLED` | `false` | `false` (opcional) | telemetry.ts; habilita tracing distribuido |
| `OTEL_EXPORTER_OTLP_ENDPOINT` | `http://localhost:4318` | URL del colector OTLP | telemetry.ts |
| `OTEL_PROMETHEUS_PORT` | `9464` | `9464` | Puerto para metricas Prometheus |

### Paginacion y Uploads — Opcionales

| Variable | Dev | Prod | Notas |
|----------|-----|------|-------|
| `PAGINATION_DEFAULT_LIMIT` | `20` | `20` | app.config.ts |
| `PAGINATION_MAX_LIMIT` | `100` | `100` | app.config.ts |
| `MAX_FILE_SIZE` | `5242880` | `5242880` | bytes (5MB); app.config.ts |
| `UPLOAD_DESTINATION` | `./uploads` | `./uploads` | app.config.ts |
| `ALLOWED_MIME_TYPES` | `image/jpeg,image/png,image/gif,application/pdf` | (mismo) | app.config.ts |

## Scripts de Produccion

```bash
## Deploy completo
scripts/deploy-production.sh

## Actualizar desde git
scripts/update-production.sh

## Diagnosticar problemas
scripts/diagnose-production.sh

## Validar deployment
scripts/validate-deployment.sh

## SSL setup
scripts/setup-ssl-certbot.sh
```

## Contrato de Conectividad Dev (Windows + WSL2)

1. `npm run dev` (backend) ejecuta `predev` antes del boot NestJS.
2. `predev` detecta distro WSL activa (o `WSL_DISTRO` si fue configurada).
3. `DB_HOST_MODE` define la estrategia:
   - `auto`: usa IP WSL2 solo si es alcanzable desde Windows; si no, fallback a `localhost`.
   - `localhost`: no intenta usar IP WSL2.
   - `wsl-ip`: exige IP WSL2 valida; falla rapido si no existe.
4. `predev` valida PostgreSQL con un check TCP de Node.js antes de intentar conectar TypeORM. Falla rapido si el puerto no esta listo.
5. Resultado: el backend no arranca con host estancado o ambiguo.

### Connection Stagger (Windows Dev Only)

En Windows, la inicializacion simultanea de 11+ datasources TypeORM puede saturar el proxy TCP de `svchost.exe` (WSL2 localhost forwarding) o el firewall Hyper-V, causando `ECONNREFUSED` / `ECONNRESET` en las primeras conexiones.

**Solucion:** `app.module.ts` implementa un stagger de conexion escalonado:
- Cada datasource espera `n x 500ms` antes de conectar (donde `n` = indice del datasource, comenzando en 0).
- Total: ~5.5s de delay escalonado para 11 datasources activos.
- **Deshabilitado automaticamente** en produccion y en plataformas no-Windows.
- Controlado por: `process.platform === 'win32' && process.env.NODE_ENV !== 'production'`

**Prerequisito en Windows:** Regla de firewall Hyper-V para el puerto 5432. Sin esta regla, el forwarding TCP de WSL2 puede ser bloqueado por el firewall de Hyper-V antes de llegar al proxy de `svchost.exe`:

```powershell
New-NetFirewallHyperVRule `
  -Name 'WSL2-PostgreSQL-5432' `
  -Direction Inbound `
  -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' `
  -Protocol TCP `
  -LocalPorts 5432 `
  -Action Allow
```

> **Nota:** Este stagger no aplica en produccion (Linux). PM2 en el servidor inicia con conexiones directas sin delay.

## Recreacion de Base de Datos por Ambiente

> **SSOT completo:** Ver `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`

### Tabla Comparativa

| Aspecto | DEV (WSL) | PROD (74.208.126.102) |
|---------|-----------|----------------------|
| Wrapper comando | `wsl -d Ubuntu-24.04 -u developer --` | Directo (SSH) |
| Ruta scripts | `/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/` | `/home/isem/gamilit-workspace/apps/database/scripts/` |
| Backup antes | Opcional | OBLIGATORIO |
| Detener backend | No necesario (`npm run dev`) | `pm2 stop ecosystem.config.js` OBLIGATORIO |
| Password default | gamilit_dev_2026 | Rotado (ver .env.production) |
| Smoke test | Opcional | OBLIGATORIO |
| Puerto PostgreSQL | 5432 | 5432 |

### DEV: Recrear BD via WSL

```powershell
## 1. Verificar PostgreSQL activo
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql --no-pager

## 2. Recrear completo
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force

## 3. Verificar
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dn"
```

### PROD: Recrear BD via SSH

```bash
## 1. Conectar al servidor
ssh isem@74.208.126.102

## 2. BACKUP OBLIGATORIO
sudo -u postgres pg_dump gamilit_platform > /home/isem/backups/gamilit_platform_$(date +%Y%m%d_%H%M%S).sql

## 3. Detener backend
pm2 stop ecosystem.config.js

## 4. Recrear
bash /home/isem/gamilit-workspace/apps/database/scripts/recreate-database.sh --env prod --force

## 5. Reiniciar backend + smoke test
pm2 restart ecosystem.config.js
curl -s http://localhost:3006/api/v1/health
```

### Scripts Disponibles

| Script | Uso |
|--------|-----|
| `recreate-database.sh` | DROP user + BD + init completo |
| `reset-database.sh` | DROP BD, mantiene user, recrea |
| `init-database.sh` | CREATE user + BD + DDL (primera vez) |
| `force-recreate-all.sh` | Force DROP + CREATE con BYPASSRLS |

---

## Scripts de Base de Datos y WSL2

Los scripts de recreacion/inicializacion de BD tienen awareness de WSL2 para manejar la conectividad automaticamente:

| Script | WSL2 Awareness | Detalle |
|--------|---------------|---------|
| `recreate-database-dev.sh` | Si | Detecta si corre dentro de WSL2 (localhost) o desde Windows (IP WSL2 auto) |
| `recreate-database.sh` | No (base) | Usa `DB_HOST` del entorno o de config/ |
| `init-database.sh` | No (base) | Usa `ENV_DB_HOST` de config/ |
| `scripts/update-wsl-ip.sh` | Si | Script `predev` del backend: detecta distro WSL, resuelve DB_HOST_MODE, valida pg_isready |

### Flujo de Deteccion WSL2 en `recreate-database-dev.sh`

```
1. Detectar entorno:
   a. /proc/version contiene "microsoft" → DENTRO de WSL2 → DB_HOST=localhost
   b. wsl.exe disponible → WINDOWS → DB_HOST = wsl.exe hostname -I (primera IP)
   c. Ninguno → DB_HOST=localhost (fallback)
2. Exportar DB_HOST
3. Ejecutar recreate-database.sh --env dev
```

### DB_HOST_MODE (Backend `predev`)

El backend usa `scripts/update-wsl-ip.sh` como hook `predev` que lee `DB_HOST_MODE` de `.env.dev`:

| Modo | Comportamiento |
|------|---------------|
| `auto` (default) | Detecta IP WSL2, valida alcanzabilidad desde Windows, fallback a localhost |
| `localhost` | Siempre usa localhost (para PostgreSQL nativo o WSL2 con port forwarding) |
| `wsl-ip` | Exige IP WSL2 valida; falla rapido si no existe |

---

## Notas Importantes

1. **NUNCA** usar .env de dev en produccion
2. **NUNCA** habilitar Swagger en produccion
3. **SIEMPRE** hacer backup de BD antes de recrear en prod
4. **SIEMPRE** verificar smoke-test.js despues de deploy
5. Pool de conexiones es 2 en ambos (funciona para carga actual)
