# Diferencias Dev (WSL) vs Prod (Servidor)

**Version:** 1.1.0
**Fecha:** 2026-02-20

---

## Conectividad

| Aspecto | Dev (WSL Windows) | Prod (74.208.126.102) |
|---------|-------------------|----------------------|
| Backend URL | http://localhost:3006 | https://74.208.126.102 (via Nginx:443) |
| Frontend URL | http://localhost:3005 | https://74.208.126.102 (via Nginx:443) |
| Frontend API Mode | **Proxy** (`VITE_API_HOST=proxy`) — URLs relativas via Vite dev server | **Absoluto** (`VITE_API_HOST=74.208.126.102:3006`) |
| WebSocket | Auto-detecta `window.location.hostname:3006` | wss://74.208.126.102:3006 |
| CORS LAN | Auto-acepta IPs privadas (192.168.x, 10.x, 172.16-31.x) | Solo whitelist explicita |
| DB Host | Deterministico via `DB_HOST_MODE` + `npm run predev` (`wsl-ip` o `localhost`) | localhost |
| DB Port | 5432 | 5432 |
| DB Pool Max | 2 (WSL2 limitado) | 2 |
| DB Timeout | 15000ms | 15000ms |
| Redis | Configurable via `REDIS_ENABLED` (true/false, defecto=true) | REQUERIDO (localhost:6379) |

## SSL/HTTPS

- **Dev:** Sin SSL, HTTP directo en puertos 3005/3006
- **Prod:** Nginx reverse proxy con SSL (self-signed o Let's Encrypt via Certbot)
- **CORS:** Manejado SOLO por NestJS (NUNCA duplicar en Nginx)

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
| `VITE_API_HOST` | `proxy` | `74.208.126.102:3006` |
| `VITE_WS_HOST` | (vacio) | `74.208.126.102:3006` |
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

| Variable | Dev | Prod |
|----------|-----|------|
| NODE_ENV | development | production |
| DB_HOST_MODE | `auto` (recomendado), `localhost`, `wsl-ip` | N/A |
| DB_HOST | Gestionado por `predev` segun `DB_HOST_MODE` | localhost |
| REDIS_ENABLED | false (recomendado) o true si local disponible | true (OBLIGATORIO) |
| REDIS_URL | redis://localhost:6379 (si enabled=true) | redis://localhost:6379 (o remoto) |
| REDIS_PASSWORD | undefined | Rotado en prod (ver .env.production) |
| CORS_ORIGIN | http://localhost:3005 | https://74.208.126.102,https://74.208.126.102:3005 |
| ENABLE_SWAGGER | true | false |
| JWT_SECRET | dev_secret | prod_secret (rotado) |
| LOG_LEVEL | debug | warn |

## Scripts de Produccion

```bash
# Deploy completo
scripts/deploy-production.sh

# Actualizar desde git
scripts/update-production.sh

# Diagnosticar problemas
scripts/diagnose-production.sh

# Validar deployment
scripts/validate-deployment.sh

# SSL setup
scripts/setup-ssl-certbot.sh
```

## Contrato de Conectividad Dev (Windows + WSL2)

1. `npm run dev` (backend) ejecuta `predev` antes del boot NestJS.
2. `predev` detecta distro WSL activa (o `WSL_DISTRO` si fue configurada).
3. `DB_HOST_MODE` define la estrategia:
   - `auto`: usa IP WSL2 solo si es alcanzable desde Windows; si no, fallback a `localhost`.
   - `localhost`: no intenta usar IP WSL2.
   - `wsl-ip`: exige IP WSL2 valida; falla rapido si no existe.
4. `predev` valida PostgreSQL (`pg_isready`) y falla rapido si no queda listo.
5. Resultado: el backend no arranca con host estancado o ambiguo.

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
# 1. Verificar PostgreSQL activo
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql --no-pager

# 2. Recrear completo
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force

# 3. Verificar
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dn"
```

### PROD: Recrear BD via SSH

```bash
# 1. Conectar al servidor
ssh isem@74.208.126.102

# 2. BACKUP OBLIGATORIO
sudo -u postgres pg_dump gamilit_platform > /home/isem/backups/gamilit_platform_$(date +%Y%m%d_%H%M%S).sql

# 3. Detener backend
pm2 stop ecosystem.config.js

# 4. Recrear
bash /home/isem/gamilit-workspace/apps/database/scripts/recreate-database.sh --env prod --force

# 5. Reiniciar backend + smoke test
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
