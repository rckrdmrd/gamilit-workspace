# GUIA-CORS-PRODUCCION.md

**Fecha:** 2025-12-18
**Version:** 1.0
**Estado:** ACTIVA
**Prioridad:** CRITICA

---

## RESUMEN

Esta guia documenta la configuracion correcta de CORS para produccion, evitando el error comun de headers duplicados.

---

## ERROR COMUN: Headers CORS Duplicados

### Sintoma

```
Access to XMLHttpRequest at 'https://74.208.126.102:3006/api/...' from origin
'https://74.208.126.102:3005' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header contains multiple values
'https://74.208.126.102:3005, https://74.208.126.102:3005', but only one is allowed.
```

### Causa

El header `Access-Control-Allow-Origin` se envia DOS VECES porque:
1. **Nginx** agrega el header (como proxy SSL)
2. **NestJS** tambien agrega el header (en `main.ts`)

### Solucion

**SOLO UNO debe manejar CORS.** En GAMILIT, NestJS maneja CORS.

---

## CONFIGURACION CORRECTA

### 1. Backend (.env.production)

```bash
# CORS - Incluir HTTPS y HTTP para compatibilidad
# IMPORTANTE: NO agregar headers CORS en Nginx
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
ENABLE_CORS=true
```

**Archivo:** `apps/backend/.env.production`

### 2. Frontend (.env.production)

```bash
# API - Usar HTTPS
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https

# WebSocket - Usar WSS
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=wss
```

**Archivo:** `apps/frontend/.env.production`

### 3. Nginx - SIN Headers CORS

```nginx
# /etc/nginx/sites-available/gamilit-backend
server {
    listen 443 ssl;
    server_name 74.208.126.102;

    ssl_certificate /etc/letsencrypt/live/74.208.126.102/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/74.208.126.102/privkey.pem;

    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # ============================================
        # NO AGREGAR HEADERS CORS AQUI
        # NestJS maneja CORS internamente
        # ============================================
        # add_header 'Access-Control-Allow-Origin' ...  <-- NO HACER ESTO
        # add_header 'Access-Control-Allow-Methods' ... <-- NO HACER ESTO
    }
}
```

---

## VERIFICACION

### 1. Verificar que Nginx NO tiene headers CORS

```bash
# En el servidor de produccion
grep -r "Access-Control" /etc/nginx/sites-enabled/
grep -r "Access-Control" /etc/nginx/conf.d/
```

**Resultado esperado:** Sin resultados (vacio)

### 2. Verificar headers de respuesta

```bash
# Hacer request OPTIONS (preflight)
curl -v -X OPTIONS https://74.208.126.102:3006/api/v1/auth/register \
  -H "Origin: https://74.208.126.102:3005" \
  -H "Access-Control-Request-Method: POST" \
  2>&1 | grep -i "access-control"
```

**Resultado esperado:** Solo UN header `Access-Control-Allow-Origin`

### 3. Verificar desde el navegador

```javascript
// En la consola del navegador
fetch('https://74.208.126.102:3006/api/health')
  .then(r => {
    console.log('CORS OK:', r.headers.get('access-control-allow-origin'));
    return r.json();
  })
  .then(console.log)
  .catch(console.error);
```

---

## SI EL ERROR PERSISTE

### Paso 1: Verificar configuracion Nginx

```bash
# Ver configuracion actual
sudo cat /etc/nginx/sites-enabled/gamilit*

# Buscar headers CORS
sudo grep -rn "Access-Control" /etc/nginx/
```

### Paso 2: Remover headers CORS de Nginx

Si Nginx tiene headers CORS, removerlos:

```bash
# Editar configuracion
sudo nano /etc/nginx/sites-enabled/gamilit-backend

# Buscar y ELIMINAR lineas como:
# add_header 'Access-Control-Allow-Origin' '*';
# add_header 'Access-Control-Allow-Methods' 'GET, POST, OPTIONS';
# add_header 'Access-Control-Allow-Headers' 'DNT,User-Agent,X-Requested-With...';

# Recargar Nginx
sudo nginx -t && sudo systemctl reload nginx
```

### Paso 3: Verificar .env en produccion

```bash
# En el servidor
cat /path/to/gamilit/apps/backend/.env.production | grep CORS
```

**Debe mostrar:**
```
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
ENABLE_CORS=true
```

### Paso 4: Reiniciar backend

```bash
pm2 restart gamilit-backend
pm2 logs gamilit-backend --lines 20
```

Verificar que muestra los origenes CORS correctos al iniciar.

---

## CONFIGURACION NGINX COMPLETA (Referencia)

### Backend (puerto 3006)

```nginx
# /etc/nginx/sites-available/gamilit-backend
server {
    listen 80;
    server_name 74.208.126.102;
    return 301 https://$server_name:3006$request_uri;
}

server {
    listen 3006 ssl;
    server_name 74.208.126.102;

    ssl_certificate /etc/letsencrypt/live/74.208.126.102/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/74.208.126.102/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    location / {
        proxy_pass http://127.0.0.1:3006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # NO agregar headers CORS - NestJS los maneja
    }
}
```

### Frontend (puerto 3005)

```nginx
# /etc/nginx/sites-available/gamilit-frontend
server {
    listen 80;
    server_name 74.208.126.102;
    return 301 https://$server_name:3005$request_uri;
}

server {
    listen 3005 ssl;
    server_name 74.208.126.102;

    ssl_certificate /etc/letsencrypt/live/74.208.126.102/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/74.208.126.102/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

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
}
```

---

## ALTERNATIVA: CORS Solo en Nginx

Si prefieres manejar CORS en Nginx en lugar de NestJS:

### 1. Deshabilitar CORS en NestJS

```bash
# apps/backend/.env.production
ENABLE_CORS=false
```

### 2. Agregar CORS en Nginx

```nginx
location / {
    # ... proxy settings ...

    # CORS headers (solo si ENABLE_CORS=false en NestJS)
    add_header 'Access-Control-Allow-Origin' 'https://74.208.126.102:3005' always;
    add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS' always;
    add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, x-tenant-id' always;
    add_header 'Access-Control-Allow-Credentials' 'true' always;

    # Preflight requests
    if ($request_method = 'OPTIONS') {
        add_header 'Access-Control-Allow-Origin' 'https://74.208.126.102:3005';
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
        add_header 'Access-Control-Allow-Headers' 'Content-Type, Authorization, x-tenant-id';
        add_header 'Access-Control-Max-Age' 1728000;
        add_header 'Content-Type' 'text/plain; charset=utf-8';
        add_header 'Content-Length' 0;
        return 204;
    }
}
```

**IMPORTANTE:** Elegir UNA opcion, no ambas.

---

## RESUMEN DE ARCHIVOS MODIFICADOS

| Archivo | Cambio |
|---------|--------|
| `apps/backend/.env.production` | CORS_ORIGIN con HTTPS |
| `apps/frontend/.env.production` | VITE_API_PROTOCOL=https, VITE_WS_PROTOCOL=wss |
| `/etc/nginx/sites-enabled/*` | Remover headers CORS si existen |

---

## DOCUMENTACION RELACIONADA

- `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` - Configuracion completa
- `GUIA-VALIDACION-PRODUCCION.md` - Troubleshooting general

---

**Ultima actualizacion:** 2025-12-18
**Autor:** Sistema de documentacion GAMILIT
