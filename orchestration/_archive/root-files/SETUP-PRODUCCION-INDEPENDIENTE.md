# SETUP-PRODUCCION-INDEPENDIENTE.md
# Guía de Despliegue Productivo sin Workspace-V2

**Versión:** 1.0.0
**Fecha:** 2026-01-16
**Propósito:** Permitir despliegue de Gamilit sin acceso a workspace-v2

---

## PRERREQUISITOS

### Sistema
- Ubuntu 22.04+ o similar
- Node.js 20+
- PostgreSQL 16+
- Docker y Docker Compose (opcional)
- PM2 (para producción sin Docker)

### Credenciales Requeridas
- Acceso al repositorio git gamilit
- Variables de ambiente (.env)
- Certificados SSL (si aplica)

---

## PASO 1: CLONAR REPOSITORIO

```bash
# Clonar solo el repositorio gamilit (no el workspace completo)
git clone git@github.com:rckrdmrd/gamilit-workspace.git gamilit
cd gamilit
```

---

## PASO 2: CONFIGURAR VARIABLES DE AMBIENTE

### Backend (.env)
```bash
cp apps/backend/.env.example apps/backend/.env
```

Variables críticas:
```env
# Base de datos
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=gamilit
DATABASE_USER=gamilit_user
DATABASE_PASSWORD=<PASSWORD>

# JWT
JWT_SECRET=<SECRET>
JWT_EXPIRATION=1h
JWT_REFRESH_EXPIRATION=7d

# Aplicación
NODE_ENV=production
PORT=3000
API_PREFIX=api/v1

# CORS
CORS_ORIGINS=https://yourdomain.com

# Storage (si aplica)
STORAGE_TYPE=local
STORAGE_PATH=/var/gamilit/uploads
```

### Frontend (.env)
```bash
cp apps/frontend/.env.example apps/frontend/.env
```

Variables críticas:
```env
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=Gamilit
NODE_ENV=production
```

---

## PASO 3: CONFIGURAR BASE DE DATOS

### Opción A: PostgreSQL local
```bash
# Crear base de datos
sudo -u postgres psql -c "CREATE DATABASE gamilit;"
sudo -u postgres psql -c "CREATE USER gamilit_user WITH PASSWORD 'password';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE gamilit TO gamilit_user;"

# Ejecutar scripts de inicialización
cd apps/database
./scripts/init-database.sh
```

### Opción B: Docker PostgreSQL
```bash
docker-compose -f docker/docker-compose.db.yml up -d
```

---

## PASO 4: INSTALAR DEPENDENCIAS

```bash
# Desde la raíz del proyecto
npm install

# O si usas pnpm
pnpm install
```

---

## PASO 5: BUILD DE PRODUCCIÓN

### Backend
```bash
cd apps/backend
npm run build
```

### Frontend
```bash
cd apps/frontend
npm run build
```

---

## PASO 6: DESPLIEGUE

### Opción A: PM2 (Recomendado)
```bash
# Usar el ecosystem.config.js existente
pm2 start ecosystem.config.js --env production

# Verificar estado
pm2 status

# Ver logs
pm2 logs gamilit-backend
```

### Opción B: Docker
```bash
# Build de imágenes
docker-compose -f docker/docker-compose.prod.yml build

# Iniciar servicios
docker-compose -f docker/docker-compose.prod.yml up -d
```

---

## PASO 7: CONFIGURAR NGINX (Reverse Proxy)

```nginx
# /etc/nginx/sites-available/gamilit
server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl;
    server_name yourdomain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    # Frontend
    location / {
        root /var/www/gamilit/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # API
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## VERIFICACIÓN

### Verificar Backend
```bash
curl http://localhost:3000/api/v1/health
# Esperado: {"status":"ok","timestamp":"..."}
```

### Verificar Frontend
```bash
curl http://localhost:4173
# Esperado: HTML de la aplicación
```

### Verificar Base de Datos
```bash
psql -h localhost -U gamilit_user -d gamilit -c "SELECT count(*) FROM auth.users;"
```

---

## TROUBLESHOOTING

### Error: Cannot connect to database
1. Verificar que PostgreSQL esté corriendo
2. Verificar credenciales en .env
3. Verificar que el usuario tenga permisos

### Error: Port already in use
```bash
# Encontrar proceso usando el puerto
lsof -i :3000
# Matar proceso
kill -9 <PID>
```

### Error: Module not found
```bash
# Limpiar y reinstalar
rm -rf node_modules
npm install
```

---

## MONITOREO

### PM2 Monitoreo
```bash
pm2 monit
```

### Logs
```bash
# Backend
pm2 logs gamilit-backend --lines 100

# Frontend (si aplica)
pm2 logs gamilit-frontend --lines 100
```

---

## BACKUP

### Base de datos
```bash
pg_dump -h localhost -U gamilit_user -d gamilit > backup_$(date +%Y%m%d).sql
```

### Archivos
```bash
tar -czf gamilit_files_$(date +%Y%m%d).tar.gz /var/gamilit/uploads
```

---

## ROLLBACK

```bash
# Si usas PM2
pm2 stop gamilit-backend
git checkout <previous-tag>
npm install
npm run build
pm2 start ecosystem.config.js
```

---

## CONTACTO Y SOPORTE

- Documentación técnica: `docs/`
- Directivas SIMCO locales: `orchestration/simco-redundancia/`
- Principios CAPVED: `orchestration/principios/`

---

*Generado: 2026-01-16 | Sistema: SIMCO v4.0.0*
