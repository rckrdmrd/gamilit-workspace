# Guía de Despliegue - GAMILIT Platform

## 📋 Información General

Esta guía describe el proceso completo de despliegue de la plataforma GAMILIT en el servidor de producción.

### Servidor de Producción

- **IP**: 74.208.126.102
- **Usuario**: isem
- **Backend**: Puerto 3006 (2 instancias en cluster)
- **Frontend**: Puerto 3005 (1 instancia)
- **Base de datos**: PostgreSQL 15 (ya configurada)
- **Gestor de procesos**: PM2

---

## 🚀 Proceso de Despliegue Completo

### 1. Pre-requisitos

Antes de comenzar el despliegue, asegúrate de tener instalado:

```bash
# Node.js (v18 o superior)
node --version

# npm (v9 o superior)
npm --version

# PM2 (se instalará automáticamente si no está presente)
npm install -g pm2

# PostgreSQL client (opcional, para verificar BD)
psql --version
```

### 2. Verificación Pre-Despliegue

Ejecuta el script de verificación para asegurarte de que todo está listo:

```bash
./scripts/pre-deploy-check.sh
```

Este script verifica:
- ✅ Node.js y npm instalados
- ✅ PM2 instalado
- ✅ Archivos de configuración presentes
- ✅ Configuración de puertos correcta
- ✅ Configuración de CORS
- ✅ Configuración de base de datos
- ✅ Secrets de producción
- ✅ Conectividad a la base de datos
- ✅ Permisos de directorios

### 3. Build para Producción

Compila tanto el backend como el frontend:

```bash
./scripts/build-production.sh
```

Este script:
1. Instala las dependencias del proyecto
2. Compila el backend (TypeScript → JavaScript)
3. Compila el frontend (React + Vite → archivos estáticos optimizados)
4. Muestra el tamaño de los builds
5. Verifica que los builds fueron exitosos

**Resultado esperado:**
- `apps/backend/dist/main.js` - Backend compilado
- `apps/frontend/dist/` - Frontend compilado (archivos estáticos)

### 4. Despliegue con PM2

Una vez que los builds estén listos, despliega la aplicación:

```bash
./scripts/deploy-production.sh
```

Este script:
1. Verifica que PM2 esté instalado
2. Verifica que los builds existan
3. Verifica archivos `.env.production`
4. Crea el directorio de logs si no existe
5. Detiene procesos PM2 anteriores (si existen)
6. Inicia el backend (2 instancias en cluster)
7. Inicia el frontend (1 instancia)
8. Guarda la configuración de PM2
9. Muestra el estado de los procesos

**Resultado esperado:**
```
┌─────┬──────────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ mode    │ status  │ cpu     │ memory   │
├─────┼──────────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ gamilit-backend      │ cluster │ online  │ 0%      │ 120 MB   │
│ 1   │ gamilit-backend      │ cluster │ online  │ 0%      │ 115 MB   │
│ 2   │ gamilit-frontend     │ fork    │ online  │ 0%      │ 85 MB    │
└─────┴──────────────────────┴─────────┴─────────┴─────────┴──────────┘
```

---

## 📁 Estructura de Archivos de Configuración

### `ecosystem.config.js` (Raíz del proyecto)

Archivo de configuración de PM2 que define cómo se ejecutan los procesos:

```javascript
{
  apps: [
    {
      name: 'gamilit-backend',
      instances: 2,           // 2 instancias en cluster
      exec_mode: 'cluster',   // Modo cluster para balanceo de carga
      env_file: './.env.production'
    },
    {
      name: 'gamilit-frontend',
      instances: 1,
      exec_mode: 'fork'
    }
  ]
}
```

### `apps/backend/.env.production`

Variables de entorno del backend en producción:

```bash
NODE_ENV=production
PORT=3006
DB_HOST=74.208.126.102
DB_NAME=gamilit_platform
CORS_ORIGIN=http://74.208.126.102:3005,http://74.208.126.102
JWT_SECRET=PROD_IksGn8fpggQ2MlhAG3/dlzpIOrx+cNyAgEBmYF3nIYs=
# ... más variables
```

### `apps/frontend/.env.production`

Variables de entorno del frontend en producción:

```bash
VITE_ENV=production
VITE_API_URL=http://74.208.126.102:3006/api
VITE_WS_URL=ws://74.208.126.102:3006
VITE_ENABLE_DEBUG=false
# ... más variables
```

---

## 🔧 Comandos de PM2

### Gestión de Procesos

```bash
# Ver estado de todos los procesos
pm2 status

# Ver logs en tiempo real
pm2 logs

# Ver logs solo del backend
pm2 logs gamilit-backend

# Ver logs solo del frontend
pm2 logs gamilit-frontend

# Monitor interactivo
pm2 monit
```

### Reiniciar Procesos

```bash
# Reiniciar todos los procesos
pm2 restart all

# Reiniciar solo el backend
pm2 restart gamilit-backend

# Reiniciar solo el frontend
pm2 restart gamilit-frontend

# Reload (zero-downtime restart) - solo para cluster mode
pm2 reload gamilit-backend
```

### Detener y Eliminar Procesos

```bash
# Detener todos los procesos
pm2 stop all

# Detener un proceso específico
pm2 stop gamilit-backend

# Eliminar todos los procesos
pm2 delete all

# Eliminar un proceso específico
pm2 delete gamilit-backend
```

### Guardar y Restaurar Configuración

```bash
# Guardar la configuración actual
pm2 save

# Restaurar procesos guardados
pm2 resurrect

# Configurar inicio automático en boot
pm2 startup
# (Seguir las instrucciones que muestra el comando)
```

---

## 🌐 URLs de Acceso

Una vez desplegado, la aplicación estará disponible en:

- **Frontend**: http://74.208.126.102:3005
- **Backend API**: http://74.208.126.102:3006/api
- **API Documentation**: http://74.208.126.102:3006/api/docs
- **Health Check**: http://74.208.126.102:3006/api/health

---

## 🔒 Configuración de CORS

El backend está configurado para aceptar requests desde:

- `http://74.208.126.102:3005` (Frontend en producción)
- `http://74.208.126.102` (Por si se accede sin puerto)
- `https://gamilit.com` (Dominio personalizado si se configura)
- `https://www.gamilit.com`

**Modificar CORS**: Editar `apps/backend/.env.production` → variable `CORS_ORIGIN`

---

## 📊 Monitoreo y Logs

### Ubicación de Logs

Los logs de PM2 se guardan en:

```
logs/
├── backend-error.log    # Errores del backend
├── backend-out.log      # Output del backend
├── frontend-error.log   # Errores del frontend
└── frontend-out.log     # Output del frontend
```

### Ver Logs

```bash
# Ver últimas 100 líneas de logs del backend
pm2 logs gamilit-backend --lines 100

# Ver logs en tiempo real con filtro
pm2 logs gamilit-backend | grep ERROR

# Ver logs de errores
tail -f logs/backend-error.log
```

### Monitoreo de Recursos

```bash
# Monitor interactivo con CPU y memoria
pm2 monit

# Información detallada de un proceso
pm2 show gamilit-backend

# Estadísticas
pm2 list
```

---

## 🔄 Actualización de la Aplicación

Para actualizar la aplicación después de cambios en el código:

### Opción 1: Actualización Completa

```bash
# 1. Detener los procesos
pm2 stop all

# 2. Obtener últimos cambios (si usas Git)
git pull origin main

# 3. Rebuild
./scripts/build-production.sh

# 4. Redesplegar
./scripts/deploy-production.sh
```

### Opción 2: Actualización con Zero-Downtime (Backend)

```bash
# 1. Obtener cambios
git pull origin main

# 2. Rebuild backend
cd apps/backend
npm install
npm run build

# 3. Reload (zero-downtime)
pm2 reload gamilit-backend
```

### Opción 3: Actualización Manual

```bash
# Solo backend
cd apps/backend
npm install
npm run build
pm2 restart gamilit-backend

# Solo frontend
cd apps/frontend
npm install
npm run build:prod
pm2 restart gamilit-frontend
```

---

## ⚠️ Troubleshooting

### El backend no inicia

```bash
# Ver logs de errores
pm2 logs gamilit-backend --err --lines 50

# Verificar archivo .env.production
cat apps/backend/.env.production

# Verificar conectividad a la BD
psql -h 74.208.126.102 -U gamilit_user -d gamilit_platform
```

### El frontend no carga

```bash
# Ver logs
pm2 logs gamilit-frontend --lines 50

# Verificar que el build existe
ls -la apps/frontend/dist/

# Verificar configuración de API
cat apps/frontend/.env.production | grep VITE_API_URL
```

### Error de CORS

```bash
# Verificar configuración de CORS en backend
cat apps/backend/.env.production | grep CORS_ORIGIN

# Debe incluir: http://74.208.126.102:3005
```

### Proceso se reinicia constantemente

```bash
# Ver logs para identificar el error
pm2 logs --lines 100

# Ver información del proceso
pm2 show gamilit-backend

# Aumentar límite de memoria si es necesario
pm2 delete gamilit-backend
# Editar ecosystem.config.js → max_memory_restart: '2G'
pm2 start ecosystem.config.js --only gamilit-backend --env production
```

### Puerto ocupado

```bash
# Ver qué proceso está usando el puerto
sudo lsof -i :3006  # Backend
sudo lsof -i :3005  # Frontend

# Detener el proceso conflictivo
pm2 delete <nombre-proceso>
# o
kill -9 <PID>
```

---

## 🔐 Seguridad

### Variables Sensibles

**NUNCA** commitear archivos `.env.production` al repositorio. Estos archivos contienen:
- Contraseñas de base de datos
- Secrets de JWT
- API keys

### Secrets de Producción

Los secrets deben ser únicos para producción. Para generar nuevos secrets:

```bash
# Generar JWT secret
openssl rand -base64 32

# Resultado ejemplo:
# PROD_IksGn8fpggQ2MlhAG3/dlzpIOrx+cNyAgEBmYF3nIYs=
```

### Permisos de Archivos

```bash
# Los archivos .env deben tener permisos restrictivos
chmod 600 apps/backend/.env.production
chmod 600 apps/frontend/.env.production
```

---

## 📝 Checklist de Despliegue

Antes de cada despliegue a producción:

- [ ] Código mergeado a rama `main`
- [ ] Tests pasando (`npm test`)
- [ ] Variables de entorno de producción actualizadas
- [ ] Secrets de producción configurados
- [ ] Pre-deploy check ejecutado sin errores
- [ ] Build exitoso
- [ ] Base de datos migrada (si hay cambios en esquema)
- [ ] CORS configurado correctamente
- [ ] Logs monitoreados después del despliegue
- [ ] Health check respondiendo correctamente
- [ ] Frontend cargando correctamente
- [ ] Backend API respondiendo

---

## 🆘 Soporte

Para problemas o preguntas sobre el despliegue:

1. Revisar logs: `pm2 logs`
2. Verificar estado: `pm2 status`
3. Consultar esta guía
4. Revisar documentación de PM2: https://pm2.keymetrics.io/

---

## 🔐 Configuración HTTPS/SSL

### Estado Actual

| Protocolo | Estado | Notas |
|-----------|--------|-------|
| HTTP | ✅ Activo | Puertos 3005 (frontend), 3006 (backend) |
| HTTPS | ⚠️ Pendiente | Requiere certificado SSL |

### Requisitos para HTTPS

1. **Dominio configurado** (opcional pero recomendado)
2. **Certificado SSL** (Let's Encrypt gratuito o comercial)
3. **Nginx como reverse proxy**

### Paso 1: Instalar Nginx y Certbot

```bash
# Instalar Nginx
sudo apt update
sudo apt install nginx

# Instalar Certbot para Let's Encrypt
sudo apt install certbot python3-certbot-nginx
```

### Paso 2: Configurar Nginx

Crear archivo `/etc/nginx/sites-available/gamilit`:

```nginx
# Configuración HTTP (redirecciona a HTTPS cuando SSL esté activo)
server {
    listen 80;
    server_name 74.208.126.102;  # Cambiar a dominio si existe

    # Frontend - React App
    location / {
        proxy_pass http://127.0.0.1:3005;
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
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # WebSocket
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

Habilitar el sitio:

```bash
sudo ln -s /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Paso 3: Obtener Certificado SSL (Con Dominio)

```bash
# Si tienes un dominio configurado
sudo certbot --nginx -d tu-dominio.com -d www.tu-dominio.com

# Verificar renovación automática
sudo certbot renew --dry-run
```

### Paso 4: SSL con IP (Sin Dominio)

Si solo tienes IP sin dominio, necesitas un certificado autofirmado:

```bash
# Generar certificado autofirmado (solo para desarrollo/testing)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/gamilit-selfsigned.key \
  -out /etc/ssl/certs/gamilit-selfsigned.crt

# Configurar en Nginx (agregar al server block)
listen 443 ssl;
ssl_certificate /etc/ssl/certs/gamilit-selfsigned.crt;
ssl_certificate_key /etc/ssl/private/gamilit-selfsigned.key;
```

### Paso 5: Actualizar Variables de Entorno

**Backend** (`apps/backend/.env.production`):

```bash
# Cambiar CORS_ORIGIN de http a https
CORS_ORIGIN=https://74.208.126.102,https://tu-dominio.com

# Cambiar FRONTEND_URL
FRONTEND_URL=https://74.208.126.102
```

**Frontend** (`apps/frontend/.env.production`):

```bash
# Cambiar protocolos
VITE_API_PROTOCOL=https
VITE_WS_PROTOCOL=wss
```

### Paso 6: Reiniciar Servicios

```bash
# Reiniciar Nginx
sudo systemctl restart nginx

# Reiniciar aplicación
pm2 reload all
```

### Verificación HTTPS

```bash
# Verificar certificado SSL
curl -vI https://74.208.126.102 2>&1 | grep -E "SSL|certificate"

# Verificar API sobre HTTPS
curl https://74.208.126.102/api/v1/health

# Verificar WebSocket
# Usar herramienta como wscat o el navegador
```

### Configuración Nginx Completa (HTTPS)

```nginx
# Redirección HTTP → HTTPS
server {
    listen 80;
    server_name 74.208.126.102;
    return 301 https://$server_name$request_uri;
}

# Servidor HTTPS
server {
    listen 443 ssl http2;
    server_name 74.208.126.102;

    # Certificados SSL
    ssl_certificate /etc/ssl/certs/gamilit.crt;
    ssl_certificate_key /etc/ssl/private/gamilit.key;

    # Configuración SSL segura
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers on;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;

    # Headers de seguridad
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000" always;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket (wss://)
    location /socket.io {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
}
```

### Troubleshooting HTTPS

| Problema | Solución |
|----------|----------|
| ERR_SSL_PROTOCOL_ERROR | Verificar que Nginx escucha en 443 |
| Mixed Content | Cambiar todas las URLs a https:// |
| CORS con HTTPS | Agregar origen https:// a CORS_ORIGIN |
| WebSocket falla | Cambiar ws:// a wss:// |
| Certificado no válido | Verificar rutas de certificados |

---

## 📚 Referencias

- [PM2 Documentation](https://pm2.keymetrics.io/docs/usage/quick-start/)
- [NestJS Deployment](https://docs.nestjs.com/fundamentals/deployment)
- [Vite Production Build](https://vitejs.dev/guide/build.html)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Let's Encrypt / Certbot](https://certbot.eff.org/)

---

**Última actualización**: 2025-12-18
**Versión**: 1.1.0
**Servidor**: 74.208.126.102
**Responsable**: DevOps Team
