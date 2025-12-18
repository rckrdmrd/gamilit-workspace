# GUIA DE DEPLOYMENT PARA AGENTE EN PRODUCCION - GAMILIT

**Version:** 1.0
**Fecha:** 2025-12-18
**Servidor:** 74.208.126.102
**Proposito:** Guia estandarizada para el agente que ejecuta deployments en produccion

---

## INFORMACION DEL SERVIDOR

| Aspecto | Valor |
|---------|-------|
| **IP** | 74.208.126.102 |
| **Usuario** | gamilit (o el usuario configurado) |
| **Backend** | Puerto 3006 (PM2 cluster, 2 instancias) |
| **Frontend** | Puerto 3005 (PM2 fork, 1 instancia) |
| **Database** | PostgreSQL puerto 5432, database `gamilit_platform` |
| **Repositorio** | git@github.com:rckrdmrd/gamilit-workspace.git |

---

## ESTRUCTURA DE BACKUPS ESTANDAR

### Directorio Base
```
/home/gamilit/backups/
```

### Estructura por Deployment
```
/home/gamilit/backups/
├── YYYYMMDD_HHMMSS/                    # Timestamp del deployment
│   ├── database/
│   │   └── gamilit_YYYYMMDD_HHMMSS.sql.gz   # Backup comprimido de BD
│   ├── config/
│   │   ├── backend.env.production      # .env.production del backend
│   │   ├── backend.env                 # .env del backend (si existe)
│   │   ├── frontend.env.production     # .env.production del frontend
│   │   ├── frontend.env                # .env del frontend (si existe)
│   │   └── ecosystem.config.js         # Configuracion PM2
│   └── logs/
│       ├── backend-error.log           # Logs de error pre-deployment
│       ├── backend-out.log             # Logs de salida pre-deployment
│       ├── frontend-error.log
│       └── frontend-out.log
├── latest -> YYYYMMDD_HHMMSS/          # Symlink al ultimo backup
└── README.md                           # Documentacion de backups
```

### Crear Estructura Inicial
```bash
# Ejecutar UNA VEZ para crear la estructura base
mkdir -p /home/gamilit/backups
chmod 700 /home/gamilit/backups

# Crear README
cat > /home/gamilit/backups/README.md << 'EOF'
# Backups de GAMILIT

Este directorio contiene los backups automaticos generados durante deployments.

## Estructura
- Cada subdirectorio tiene formato YYYYMMDD_HHMMSS
- `latest` es un symlink al backup mas reciente
- Los backups de BD estan comprimidos con gzip

## Restaurar Base de Datos
```bash
gunzip -c /home/gamilit/backups/YYYYMMDD_HHMMSS/database/gamilit_*.sql.gz | psql "$DATABASE_URL"
```

## Restaurar Configuraciones
```bash
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/backend.env.production apps/backend/.env.production
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/frontend.env.production apps/frontend/.env.production
```

## Retencion
Se recomienda mantener los ultimos 10 backups y eliminar los antiguos.
EOF
```

---

## VARIABLES DE ENTORNO REQUERIDAS

Antes de cualquier deployment, verificar que estas variables esten configuradas:

```bash
# En ~/.bashrc o /etc/environment del servidor

# Database
export DB_HOST=localhost
export DB_PORT=5432
export DB_NAME=gamilit_platform
export DB_USER=gamilit_user
export DB_PASSWORD="[PASSWORD_SEGURO]"
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Seguridad (GENERAR VALORES UNICOS)
export JWT_SECRET="[VALOR_GENERADO_CON_openssl_rand_-base64_32]"
export SESSION_SECRET="[OTRO_VALOR_GENERADO]"

# CORS
export CORS_ORIGIN="https://gamilit.com,https://www.gamilit.com,http://74.208.126.102:3005"

# URLs
export FRONTEND_URL="https://gamilit.com"
export BACKEND_URL="https://gamilit.com/api"

# Backups
export BACKUP_BASE="/home/gamilit/backups"
```

**Generar secretos seguros:**
```bash
openssl rand -base64 32  # Para JWT_SECRET
openssl rand -base64 32  # Para SESSION_SECRET
```

---

## PROCEDIMIENTO ESTANDAR DE DEPLOYMENT

### FASE 1: BACKUP (Antes de tocar nada)

```bash
# 1.1 Crear timestamp y directorio de backup
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="${BACKUP_BASE:-/home/gamilit/backups}/$TIMESTAMP"
mkdir -p "$BACKUP_DIR"/{database,config,logs}

# 1.2 Backup de base de datos
echo "=== BACKUP DE BASE DE DATOS ==="
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

echo "Backup creado: $BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

# 1.3 Backup de configuraciones
echo "=== BACKUP DE CONFIGURACIONES ==="
cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production" 2>/dev/null || true
cp apps/backend/.env "$BACKUP_DIR/config/backend.env" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production" 2>/dev/null || true
cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/" 2>/dev/null || true

# 1.4 Backup de logs actuales
echo "=== BACKUP DE LOGS ==="
cp logs/*.log "$BACKUP_DIR/logs/" 2>/dev/null || true

# 1.5 Actualizar symlink 'latest'
ln -sfn "$BACKUP_DIR" "${BACKUP_BASE:-/home/gamilit/backups}/latest"

echo "Backup completado en: $BACKUP_DIR"
```

### FASE 2: DETENER SERVICIOS

```bash
echo "=== DETENIENDO SERVICIOS ==="
pm2 stop all
pm2 list
```

### FASE 3: PULL DEL REPOSITORIO

```bash
echo "=== ACTUALIZANDO DESDE REPOSITORIO ==="

# Mostrar estado actual
git status
git branch --show-current

# Fetch y mostrar commits pendientes
git fetch origin
git log HEAD..origin/main --oneline 2>/dev/null || echo "Ya actualizado"

# Pull forzado (preferencia a remoto)
git reset --hard origin/main

# Mostrar ultimo commit
git log --oneline -1
```

### FASE 4: RESTAURAR CONFIGURACIONES

```bash
echo "=== RESTAURANDO CONFIGURACIONES ==="

# Restaurar .env files desde backup
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# Crear symlinks .env -> .env.production
cd apps/backend && ln -sf .env.production .env && cd ../..
cd apps/frontend && ln -sf .env.production .env && cd ../..

echo "Configuraciones restauradas"
```

### FASE 5: RECREAR BASE DE DATOS

```bash
echo "=== RECREANDO BASE DE DATOS ==="

cd apps/database
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Ejecutar script de creacion limpia
chmod +x create-database.sh
./create-database.sh

cd ../..
echo "Base de datos recreada"
```

### FASE 6: INSTALAR DEPENDENCIAS Y BUILD

```bash
echo "=== INSTALANDO DEPENDENCIAS ==="

# Backend
cd apps/backend
npm install --production=false
npm run build
cd ../..

# Frontend
cd apps/frontend
npm install --production=false
npm run build
cd ../..

echo "Build completado"
```

### FASE 7: INICIAR SERVICIOS CON PM2

```bash
echo "=== INICIANDO SERVICIOS ==="

# Iniciar con ecosystem.config.js
pm2 start ecosystem.config.js --env production

# Guardar configuracion PM2
pm2 save

# Mostrar estado
pm2 list
```

### FASE 8: CONFIGURAR HTTPS CON CERTBOT (Si no esta configurado)

```bash
# SOLO SI ES PRIMERA VEZ O CERTIFICADO EXPIRADO

echo "=== CONFIGURANDO HTTPS ==="

# 1. Instalar certbot si no existe
sudo apt update
sudo apt install -y certbot python3-certbot-nginx

# 2. Obtener certificado (reemplazar gamilit.com con tu dominio)
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# 3. Verificar renovacion automatica
sudo certbot renew --dry-run
```

### FASE 9: CONFIGURAR NGINX COMO REVERSE PROXY

```bash
# SOLO SI ES PRIMERA VEZ

# Crear configuracion Nginx
sudo tee /etc/nginx/sites-available/gamilit << 'NGINX'
# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    # SSL Configuration (certbot lo configura automaticamente)
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # Frontend
    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://localhost:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINX

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### FASE 10: VALIDACION

```bash
echo "=== VALIDANDO DEPLOYMENT ==="

# Ejecutar script de diagnostico
./scripts/diagnose-production.sh

# O validacion manual:
echo "--- Health Check Backend ---"
curl -s https://gamilit.com/api/health | head -10

echo "--- Frontend Status ---"
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" https://gamilit.com

echo "--- PM2 Status ---"
pm2 list

echo "--- Logs ---"
pm2 logs --lines 20
```

---

## CONFIGURACION CORS PARA HTTPS

Una vez configurado HTTPS, actualizar las configuraciones:

### Backend .env.production
```bash
# Actualizar CORS para HTTPS
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com
FRONTEND_URL=https://gamilit.com
```

### Frontend .env.production
```bash
# Actualizar para HTTPS
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
VITE_API_HOST=gamilit.com
VITE_WS_HOST=gamilit.com
```

---

## ROLLBACK (Si algo falla)

```bash
# 1. Detener servicios
pm2 stop all

# 2. Restaurar base de datos desde ultimo backup
LATEST_BACKUP="${BACKUP_BASE:-/home/gamilit/backups}/latest"
gunzip -c "$LATEST_BACKUP/database/gamilit_*.sql.gz" | \
    PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME"

# 3. Restaurar configuraciones
cp "$LATEST_BACKUP/config/backend.env.production" apps/backend/.env.production
cp "$LATEST_BACKUP/config/frontend.env.production" apps/frontend/.env.production

# 4. Revertir codigo (si es necesario)
git reflog  # Ver commits anteriores
git reset --hard HEAD~1  # Volver un commit atras

# 5. Rebuild y reiniciar
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..
pm2 start ecosystem.config.js --env production
```

---

## TROUBLESHOOTING

### Error: CORS bloqueado
```bash
# Verificar CORS_ORIGIN en backend
grep CORS apps/backend/.env.production

# Debe incluir el dominio con protocolo correcto (https://)
```

### Error: Certificado SSL
```bash
# Renovar certificado
sudo certbot renew

# Verificar certificado
sudo certbot certificates
```

### Error: PM2 no inicia
```bash
# Ver logs de error
pm2 logs gamilit-backend --err --lines 50

# Verificar que el build existe
ls -la apps/backend/dist/main.js
ls -la apps/frontend/dist/
```

### Error: Base de datos no conecta
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql

# Verificar conexion
PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -U "$DB_USER" -d "$DB_NAME" -c "SELECT 1;"
```

---

## MANTENIMIENTO

### Limpiar backups antiguos (mantener ultimos 10)
```bash
cd /home/gamilit/backups
ls -dt */ | tail -n +11 | xargs rm -rf
```

### Renovar certificados SSL
```bash
# Ejecutar mensualmente o cuando expire
sudo certbot renew
sudo systemctl reload nginx
```

### Monitorear logs
```bash
pm2 logs --lines 100
pm2 monit
```

---

*Guia creada para el agente de produccion de GAMILIT*
*Ultima actualizacion: 2025-12-18*
