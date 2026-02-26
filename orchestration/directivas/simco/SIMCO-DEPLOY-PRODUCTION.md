# SIMCO: Deploy a Produccion - GAMILIT

**Version:** 1.0.0
**Fecha:** 2026-01-25
**Tipo:** Procedimiento Critico
**Perfil:** PRODUCTION-MANAGER

---

## PROPOSITO

Define el procedimiento completo y seguro para desplegar GAMILIT a produccion,
incluyendo backup de datos criticos, migracion de esquema, y rollback automatico.

---

## PREREQUISITOS OBLIGATORIOS

### 1. Configuracion de Ambiente

```yaml
archivos_requeridos:
  - apps/backend/.env.production     # Configuracion de produccion
  - ecosystem.config.js              # Configuracion PM2
  - apps/devops/scripts/deploy-production.sh
  - apps/devops/scripts/backup-production-data.sh

servicios_requeridos:
  - PostgreSQL >= 14
  - Node.js >= 18
  - PM2 (global)
  - nginx (para produccion)
  - certbot (para SSL)
```

### 2. Configuracion CORS

```typescript
// apps/backend/src/main.ts - Ya configurado
// CORS soporta multiples origenes via variable de entorno

// .env.production
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com
```

### 3. Configuracion HTTPS/SSL

```bash
# Generar certificado SSL con Let's Encrypt
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# Verificar renovacion automatica
sudo certbot renew --dry-run

# Certificados se guardan en:
# /etc/letsencrypt/live/gamilit.com/
```

---

## PROCEDIMIENTO DE DEPLOY

### FASE 1: Pre-Deploy (5 min)

```bash
# 1. Verificar rama correcta
git checkout master
git pull origin master

# 2. Verificar estado de produccion actual
pm2 status
curl -s https://gamilit.com/api/v1/health

# 3. Notificar mantenimiento (si necesario)
```

### FASE 2: Backup de Datos (10 min)

```bash
# Ejecutar backup automatico
cd apps/devops/scripts
./backup-production-data.sh --env prod

# Verificar backup creado
ls -la ../backups/

# El backup incluye:
# - auth.users + profiles
# - progress_tracking.* (progreso estudiantes)
# - gamification_system.* (estadisticas, logros, transacciones)
# - educational_content.teacher_content
```

### FASE 3: Recreacion Limpia de BD (DDL-First) (5-15 min)

```bash
# Politica obligatoria:
# - NO usar migrations incrementales
# - NO usar fixes manuales fuera del flujo
# - SIEMPRE recrear desde DDL + seeds por ambiente
#
# Flujo recomendado cuando hay cambios en apps/database/ddl o apps/database/seeds:
# 1) Backup obligatorio
# 2) Detener PM2
# 3) Recrear BD con scripts oficiales
# 4) Reiniciar PM2
# 5) Smoke test
#
# Comando oficial:
# bash apps/database/scripts/recreate-database.sh --env prod --password '<PASSWORD_PRODUCCION>' --force
#
# SSOT:
# - orchestration/directivas/simco/SIMCO-DDL.md
# - orchestration/directivas/simco/SIMCO-RECREAR-BD.md
```

### FASE 4: Build y Deploy (15 min)

```bash
# Ejecutar deploy completo
./deploy-production.sh --env prod

# O paso a paso manual:
cd apps/backend && npm ci && npm run build
cd apps/frontend && npm ci && npm run build
pm2 startOrRestart ecosystem.config.js --env production
pm2 save
```

### FASE 5: Verificacion (5 min)

```bash
# Health checks
curl -s https://gamilit.com/api/v1/health

# Verificar logs
pm2 logs gamilit-backend --lines 50

# Verificar metricas
pm2 monit
```

---

## ROLLBACK DE EMERGENCIA

### Rollback Automatico (< 5 min)

```bash
# El script detecta fallos y hace rollback automatico
# Si necesitas rollback manual:

./deploy-production.sh --rollback backup_YYYYMMDD_HHMMSS.tar.gz
```

### Rollback Manual Completo

```bash
# 1. Detener servicios
pm2 stop all

# 2. Restaurar datos
./backup-production-data.sh --env prod --restore backups/backup_XXX.tar.gz

# 3. Rollback de codigo (si necesario)
git checkout <commit-anterior>
npm ci
npm run build

# 4. Reiniciar servicios
pm2 start ecosystem.config.js --env production

# 5. Verificar
curl -s https://gamilit.com/api/v1/health
```

---

## CHECKLIST DEPLOY PRODUCCION

### Pre-Deploy
- [ ] Build exitoso en CI/CD
- [ ] Tests pasando (unit + integration)
- [ ] .env.production verificado
- [ ] Backup de BD creado y verificado
- [ ] Rollback plan documentado
- [ ] Version actual anotada

### Deploy
- [ ] Pull de codigo
- [ ] npm ci --production
- [ ] npm run build
- [ ] pm2 reload con --update-env
- [ ] nginx -t && systemctl reload nginx (si cambio config)

### Post-Deploy
- [ ] Health check responde OK
- [ ] Logs sin errores criticos
- [ ] Funcionalidad critica verificada
- [ ] CORS funcionando correctamente
- [ ] SSL/HTTPS funcionando

---

## CONFIGURACION NGINX PRODUCCION

```nginx
# /etc/nginx/sites-available/gamilit

upstream gamilit_backend {
    server 127.0.0.1:3006;
    keepalive 64;
}

server {
    listen 80;
    server_name gamilit.com www.gamilit.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name gamilit.com www.gamilit.com;

    # SSL - Let's Encrypt
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Frontend (archivos estaticos)
    root /var/www/gamilit/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Backend API - NO agregar headers CORS aqui (NestJS los maneja)
    location /api {
        proxy_pass http://gamilit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # WebSocket support
    location /socket.io {
        proxy_pass http://gamilit_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Gzip
    gzip on;
    gzip_types text/plain application/json application/javascript text/css;
}
```

---

## IMPORTANTE: CORS EN PRODUCCION

### Evitar Conflictos de Headers Duplicados

```yaml
problema_comun: |
  nginx y NestJS ambos agregan headers CORS = headers duplicados = error

solucion: |
  1. NestJS maneja CORS completamente (ya configurado en main.ts)
  2. nginx NO debe agregar headers Access-Control-*
  3. Solo nginx hace proxy_pass sin modificar headers CORS

verificacion:
  # Verificar que no hay headers duplicados
  curl -I -X OPTIONS https://gamilit.com/api/v1/health \
    -H "Origin: https://gamilit.com" \
    -H "Access-Control-Request-Method: GET"

  # Debe mostrar UN SOLO Access-Control-Allow-Origin
```

---

## SCRIPTS DISPONIBLES

| Script | Proposito | Uso |
|--------|-----------|-----|
| `deploy-production.sh` | Deploy completo | `./deploy-production.sh --env prod` |
| `backup-production-data.sh` | Backup de datos | `./backup-production-data.sh --env prod` |
| `deploy.sh` | Deploy dev/staging | `./deploy.sh --env dev` |

---

## ALIAS RELEVANTES

```yaml
@PROD_DEPLOY: "apps/devops/scripts/deploy-production.sh"
@PROD_BACKUP: "apps/devops/scripts/backup-production-data.sh"
@PROD_MANAGER: "orchestration/agents/perfiles/PERFIL-PRODUCTION-MANAGER.md"
@NGINX_CONFIG: "/etc/nginx/sites-available/gamilit"
@SSL_CERTS: "/etc/letsencrypt/live/gamilit.com/"
```

---

## REFERENCIAS

- `@PROD_MANAGER` - Perfil del agente Production-Manager
- `apps/backend/.env.production.example` - Template de configuracion
- `k8s/backend/ingress.yaml` - Configuracion Kubernetes
- `.github/workflows/deploy-production.yml` - CI/CD Pipeline

---

**Version:** 1.0.0 | **Sistema:** SIMCO | **Tipo:** Procedimiento Critico
