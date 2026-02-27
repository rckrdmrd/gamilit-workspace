---
titulo: Guía Rápida Deployment en Producción
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# GUIA RAPIDA: Deployment en Produccion

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Servidor:** 74.208.126.102

---

## CHECKLIST RAPIDO (10 PASOS)

```bash
# 1. BACKUP (SIEMPRE PRIMERO)
BACKUP_DIR="/home/gamilit/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/config"
cp apps/backend/.env.production "$BACKUP_DIR/config/"
cp apps/frontend/.env.production "$BACKUP_DIR/config/"

# 2. BACKUP BASE DE DATOS
pg_dump "$DATABASE_URL" | gzip > "$BACKUP_DIR/gamilit.sql.gz"

# 3. PULL CAMBIOS
git fetch origin && git reset --hard origin/master

# 4. RESTAURAR CONFIG
cp "$BACKUP_DIR/config/.env.production" apps/backend/
cp "$BACKUP_DIR/config/.env.production" apps/frontend/

# 5. INSTALAR DEPENDENCIAS
npm install && cd apps/backend && npm install && cd ../frontend && npm install && cd ../..

# 6. BUILD
cd apps/backend && npm run build && cd ../frontend && npm run build && cd ../..

# 7. RECREAR BASE DE DATOS (si hay cambios DDL)
cd apps/database && ./drop-and-recreate-database.sh "$DATABASE_URL" && cd ..

# 8. DEPLOY PM2
pm2 delete all 2>/dev/null; pm2 start ecosystem.config.js --env production; pm2 save

# 9. VALIDAR
./scripts/validate-deployment.sh --ssl

# 10. STARTUP (solo primera vez)
pm2 startup && pm2 save
```

---

## ESCENARIOS COMUNES

### A. Solo actualizar codigo (sin cambios BD)

```bash
git pull origin master
cd apps/backend && npm install && npm run build && cd ..
cd apps/frontend && npm install && npm run build && cd ..
pm2 restart all
```

### B. Cambios en frontend unicamente

```bash
git pull origin master
cd apps/frontend && npm install && npm run build && cd ..
pm2 restart gamilit-frontend
```

### C. Cambios en backend unicamente

```bash
git pull origin master
cd apps/backend && npm install && npm run build && cd ..
pm2 restart gamilit-backend
```

### D. Cambios en variables de entorno (.env)

```bash
# Editar archivo
nano apps/backend/.env.production
# O
nano apps/frontend/.env.production

# Rebuild frontend si cambian VITE_*
cd apps/frontend && npm run build && cd ..

# Restart
pm2 restart all
```

### E. Recrear base de datos completa

```bash
cd apps/database
./drop-and-recreate-database.sh "$DATABASE_URL"
cd ..
```

---

## COMANDOS DE EMERGENCIA

### Rollback rapido

```bash
# Restaurar desde backup
pg_restore "$BACKUP_DIR/gamilit.sql.gz" | psql "$DATABASE_URL"
cp "$BACKUP_DIR/config/.env.production" apps/backend/
cp "$BACKUP_DIR/config/.env.production" apps/frontend/
pm2 restart all
```

### Ver logs de errores

```bash
pm2 logs --err --lines 100
```

### Restart de emergencia

```bash
pm2 kill && pm2 start ecosystem.config.js --env production
```

### Status completo

```bash
pm2 list && pm2 logs --lines 10 --nostream
```

---

## VARIABLES DE ENTORNO CRITICAS

### Backend `.env.production`

```bash
NODE_ENV=production
PORT=3006
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=<PASSWORD>
JWT_SECRET=<GENERAR: openssl rand -base64 32>
CORS_ORIGIN=https://gamilit.com
FRONTEND_URL=https://gamilit.com
ENABLE_SWAGGER=false
```

### Frontend `.env.production`

```bash
VITE_ENV=production
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss
VITE_MOCK_API=false
VITE_ENABLE_DEBUG=false
```

---

## SSL CON CERTBOT (NUEVO SERVIDOR)

> **Guia completa:** Ver [GUIA-SSL-CERTBOT-DEPLOYMENT.md](./GUIA-SSL-CERTBOT-DEPLOYMENT.md) para documentacion detallada, troubleshooting y renovacion.

```bash
# Automatizado con Let's Encrypt
sudo ./scripts/setup-ssl-certbot.sh gamilit.com www.gamilit.com

# Auto-firmado (sin dominio)
sudo ./scripts/setup-ssl-certbot.sh --self-signed

# Ayuda
./scripts/setup-ssl-certbot.sh --help

# Manual
sudo apt install -y nginx certbot python3-certbot-nginx
sudo certbot --nginx -d gamilit.com -d www.gamilit.com
```

---

## VALIDACION

```bash
# Basica (sin SSL)
./scripts/validate-deployment.sh

# Completa con SSL
./scripts/validate-deployment.sh --ssl --verbose

# Opciones disponibles
./scripts/validate-deployment.sh --help
#   --ssl       Incluir validaciones de SSL/HTTPS
#   --verbose   Mostrar informacion adicional

# Manual
curl http://localhost:3006/api/health
curl http://localhost:3005
curl https://gamilit.com/api/health
pm2 list
```

> **Nota:** El script `validate-deployment.sh` verifica archivos .env, builds, PM2, endpoints, SSL (opcional) y base de datos.

---

## TROUBLESHOOTING

| Problema | Solucion |
|----------|----------|
| PM2 no inicia | `pm2 kill && pm2 start ecosystem.config.js --env production` |
| CORS error | Verificar CORS_ORIGIN en backend y rebuildar frontend |
| SSL no funciona | `sudo nginx -t && sudo systemctl restart nginx` |
| BD no conecta | Verificar DB_PASSWORD y que PostgreSQL este corriendo |
| Build falla | `rm -rf node_modules && npm install` |

---

## CONTACTO

- Logs: `/home/isem/workspace/projects/gamilit/logs/`
- Config PM2: `ecosystem.config.js`
- Guia completa: `docs/50-guides/GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md`
