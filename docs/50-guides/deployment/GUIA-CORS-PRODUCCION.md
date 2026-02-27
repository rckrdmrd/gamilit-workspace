---
titulo: Configuración CORS para Producción
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# Configuración CORS para Producción - GAMILIT

**Fecha**: 2025-12-18
**Problema resuelto**: Error `Access-Control-Allow-Origin contains multiple values`

---

## 1. Descripción del Problema

Al hacer requests desde el frontend (puerto 3005) al backend (puerto 3006) en producción con HTTPS, se recibe el error:

```
Access to XMLHttpRequest at 'https://74.208.126.102:3006/api/v1/auth/register'
from origin 'https://74.208.126.102:3005' has been blocked by CORS policy:
The 'Access-Control-Allow-Origin' header contains multiple values
'https://74.208.126.102:3005, https://74.208.126.102:3005', but only one is allowed.
```

---

## 2. Causa Raíz

El header `Access-Control-Allow-Origin` se está enviando **DOS VECES**:

1. **Nginx** (proxy SSL) agrega headers CORS
2. **NestJS** (backend) también agrega headers CORS via `app.enableCors()`

Cuando ambos envían el header, el navegador ve valores duplicados y rechaza la respuesta.

---

## 3. Solución Definitiva

### Regla de Oro: **Solo NestJS maneja CORS**

Nginx debe actuar únicamente como proxy SSL sin agregar headers CORS.

### 3.1 Configuración Backend (.env.production)

```bash
# CORS - CONFIGURACIÓN CRÍTICA
# ============================================================================
# ADVERTENCIA: HEADERS CORS DUPLICADOS
# ============================================================================
# Si usas Nginx como proxy SSL, NO agregar headers CORS en Nginx.
# NestJS maneja CORS internamente en main.ts.
# Headers duplicados causan error:
#   "The 'Access-Control-Allow-Origin' header contains multiple values"
# ============================================================================

# Incluye HTTPS y HTTP para compatibilidad durante transición
CORS_ORIGIN=https://74.208.126.102:3005,https://74.208.126.102,http://74.208.126.102:3005,http://74.208.126.102
ENABLE_CORS=true
```

### 3.2 Configuración Frontend (.env.production)

```bash
# SSL CONFIGURADO - Usar HTTPS/WSS
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=wss
```

### 3.3 Configuración Nginx (SIN CORS)

```nginx
# /etc/nginx/sites-available/gamilit-backend
server {
    listen 3006 ssl;
    server_name 74.208.126.102;

    ssl_certificate /etc/ssl/certs/gamilit.crt;
    ssl_certificate_key /etc/ssl/private/gamilit.key;

    location / {
        proxy_pass http://127.0.0.1:3007;  # PM2 cluster interno
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # ⚠️ NO AGREGAR headers CORS aquí
        # NestJS los maneja internamente
    }
}
```

---

## 4. Verificación

### 4.1 Verificar headers con curl

```bash
# Verificar que solo hay UN header Access-Control-Allow-Origin
curl -I -X OPTIONS \
  -H "Origin: https://74.208.126.102:3005" \
  -H "Access-Control-Request-Method: POST" \
  https://74.208.126.102:3006/api/v1/auth/register

# Salida esperada (UN solo header):
# Access-Control-Allow-Origin: https://74.208.126.102:3005
# Access-Control-Allow-Credentials: true
# Access-Control-Allow-Methods: GET,POST,PUT,PATCH,DELETE,OPTIONS
```

### 4.2 Verificar configuración Nginx

```bash
# Buscar headers CORS duplicados en configuración
grep -r "Access-Control" /etc/nginx/
```

Si encuentra líneas como `add_header Access-Control-Allow-Origin`, elimínelas.

---

## 5. Pasos de Deploy

1. **Backend**: Actualizar `.env.production` con HTTPS origins
2. **Frontend**: Actualizar `.env.production` con HTTPS/WSS
3. **Nginx**: Remover cualquier header CORS
4. **Reiniciar servicios**:
   ```bash
   sudo systemctl reload nginx
   pm2 restart gamilit-backend
   cd /path/to/frontend && npm run build
   ```

---

## 6. Troubleshooting

### Error persiste después de la configuración
1. Verificar que Nginx no tenga headers CORS en ningún include
2. Revisar si hay otro proxy (CloudFlare, etc.) agregando headers
3. Limpiar cache del navegador (F12 > Network > Disable cache)

### Error "CORS blocked request" en logs
- El origen que hace la petición no está en CORS_ORIGIN
- Verificar que el protocolo coincide (https vs http)

---

## 7. Referencias

- **Backend CORS**: `apps/backend/src/main.ts` líneas 27-46
- **Config CORS**: `apps/backend/src/config/app.config.ts`
- **Ejemplo .env**: `apps/backend/.env.production.example`
