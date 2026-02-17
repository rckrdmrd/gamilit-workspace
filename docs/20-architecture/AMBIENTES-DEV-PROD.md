# Diferencias Dev (WSL) vs Prod (Servidor)

**Version:** 1.0.0
**Fecha:** 2026-02-11

---

## Conectividad

| Aspecto | Dev (WSL Windows) | Prod (74.208.126.102) |
|---------|-------------------|----------------------|
| Backend URL | http://localhost:3006 | https://74.208.126.102 (via Nginx:443) |
| Frontend URL | http://localhost:3005 | https://74.208.126.102 (via Nginx:443) |
| DB Host | 127.0.0.1 (IPv4 forzado) | localhost |
| DB Port | 5432 | 5432 |
| DB Pool Max | 2 (WSL2 limitado) | 2 |
| DB Timeout | 15000ms | 15000ms |
| Redis | localhost:6379 (sin auth) | localhost:6379 |
| WebSocket | ws://localhost:3006 | wss://74.208.126.102 |

## SSL/HTTPS

- **Dev:** Sin SSL, HTTP directo en puertos 3005/3006
- **Prod:** Nginx reverse proxy con SSL (self-signed o Let's Encrypt via Certbot)
- **CORS:** Manejado SOLO por NestJS (NUNCA duplicar en Nginx)

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
| DB_HOST | 127.0.0.1 | localhost |
| CORS_ORIGINS | http://localhost:3005 | https://domain.com |
| SWAGGER_ENABLED | true | false |
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
curl -s https://localhost:3006/health
```

### Scripts Disponibles

| Script | Uso |
|--------|-----|
| `recreate-database.sh` | DROP user + BD + init completo |
| `reset-database.sh` | DROP BD, mantiene user, recrea |
| `init-database.sh` | CREATE user + BD + DDL (primera vez) |
| `force-recreate-all.sh` | Force DROP + CREATE con BYPASSRLS |

---

## Notas Importantes

1. **NUNCA** usar .env de dev en produccion
2. **NUNCA** habilitar Swagger en produccion
3. **SIEMPRE** hacer backup de BD antes de recrear en prod
4. **SIEMPRE** verificar smoke-test.js despues de deploy
5. Pool de conexiones es 2 en ambos (funciona para carga actual)
