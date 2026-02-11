# Deployment Cheatsheet - GAMILIT

**Ultima actualizacion:** 2026-01-04

---

## Pre-Deployment Checklist

- [ ] Tests pasando (backend + frontend)
- [ ] Build sin errores
- [ ] Variables de entorno configuradas
- [ ] Base de datos migrada
- [ ] Seeds aplicados (si necesario)

---

## Build

### Backend

```bash
cd apps/backend

# Build
npm run build

# Verificar build
ls -la dist/
```

### Frontend

```bash
cd apps/frontend

# Build produccion
npm run build

# Preview local
npm run preview
```

---

## Variables de Entorno

### Backend (.env)

```env
NODE_ENV=production
PORT=3000
DATABASE_URL=postgresql://user:pass@host:5432/db
JWT_SECRET=your-secret-key
JWT_EXPIRATION=24h
CORS_ORIGIN=https://gamilit.example.com
```

### Frontend (.env)

```env
VITE_API_URL=https://api.gamilit.example.com
VITE_APP_NAME=GAMILIT
```

---

## Base de Datos

### Migraciones

```bash
# Aplicar DDL
./apps/database/scripts/create-database.sh

# Solo seeds
./apps/database/scripts/seed-database.sh
```

### Backup Pre-Deploy

```bash
pg_dump -h host -U user -d gamilit_platform > backup_$(date +%Y%m%d).sql
```

---

## Deployment Steps

### 1. Preparar Release

```bash
# Tag version
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### 2. Deploy Backend

```bash
# SSH al servidor
ssh user@server

# Pull cambios
cd /app/backend
git pull origin main

# Install deps
npm ci --production

# Build
npm run build

# Restart service
pm2 restart gamilit-backend
```

### 3. Deploy Frontend

```bash
# Build local
npm run build

# Copy a servidor
rsync -avz dist/ user@server:/var/www/gamilit/
```

---

## Rollback

```bash
# Ver tags anteriores
git tag -l

# Checkout version anterior
git checkout v0.9.0

# Rebuild y restart
npm run build
pm2 restart gamilit-backend
```

---

## Monitoreo Post-Deploy

```bash
# Ver logs
pm2 logs gamilit-backend

# Status
pm2 status

# Health check
curl https://api.gamilit.example.com/health
```

---

## Troubleshooting

| Problema | Solucion |
|----------|----------|
| 502 Bad Gateway | Verificar que backend esta corriendo |
| DB Connection Error | Verificar DATABASE_URL y firewall |
| CORS Error | Verificar CORS_ORIGIN en backend |
| Build Failed | Limpiar node_modules y reinstalar |

---

## Referencias

- [DEPLOYMENT-MASTER.md](../../40-estandares/guias/DEPLOYMENT-MASTER.md)
- [PM2 Docs](https://pm2.keymetrics.io/docs/)
