# GUIA: SSL Auto-firmado para Produccion (Sin Dominio)

**Servidor:** 74.208.126.102
**Uso:** Cuando NO tienes dominio configurado

---

## ARQUITECTURA

```
                    INTERNET
                        │
          ┌─────────────┴─────────────┐
          │                           │
          ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│ Nginx :3005     │       │ Nginx :3006     │
│ (HTTPS/SSL)     │       │ (HTTPS/SSL)     │
│ Frontend        │       │ Backend API     │
└────────┬────────┘       └────────┬────────┘
         │                         │
         ▼                         ▼
┌─────────────────┐       ┌─────────────────┐
│ Vite :4005      │       │ NestJS :4006    │
│ (HTTP interno)  │       │ (HTTP interno)  │
└─────────────────┘       └─────────────────┘
```

**Puertos:**
- Frontend: HTTPS :3005 → HTTP interno :4005
- Backend: HTTPS :3006 → HTTP interno :4006

---

## PASO 1: Generar Certificado Auto-firmado

```bash
# Crear directorio para certificados
sudo mkdir -p /etc/nginx/ssl

# Generar certificado (válido por 365 días)
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/gamilit.key \
    -out /etc/nginx/ssl/gamilit.crt \
    -subj "/C=MX/ST=Estado/L=Ciudad/O=Gamilit/CN=74.208.126.102"

# Verificar
sudo ls -la /etc/nginx/ssl/
```

---

## PASO 2: Instalar Nginx

```bash
sudo apt update
sudo apt install -y nginx
```

---

## PASO 3: Configurar Nginx con SSL

```bash
sudo tee /etc/nginx/sites-available/gamilit << 'NGINX'
# =============================================================================
# GAMILIT Production - SSL Auto-firmado
# Frontend: https://74.208.126.102:3005
# Backend:  https://74.208.126.102:3006
# =============================================================================

# Frontend HTTPS (puerto 3005)
server {
    listen 3005 ssl http2;
    server_name 74.208.126.102;

    # SSL con certificado auto-firmado
    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Proxy al frontend interno (puerto 4005)
    location / {
        proxy_pass http://localhost:4005;
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

# Backend HTTPS (puerto 3006)
server {
    listen 3006 ssl http2;
    server_name 74.208.126.102;

    # SSL con certificado auto-firmado
    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # IMPORTANTE: NO agregar headers CORS aqui
    # NestJS maneja CORS internamente

    # Proxy al backend interno (puerto 4006)
    location / {
        proxy_pass http://localhost:4006;
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
        proxy_pass http://localhost:4006;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }
}
NGINX

# Habilitar sitio
sudo ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuración
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## PASO 4: Modificar Puertos de las Aplicaciones

Las aplicaciones ahora corren en puertos internos (4005, 4006).

### Backend - Editar apps/backend/.env.production:

```bash
# Cambiar puerto interno
PORT=4006

# CORS con HTTPS
CORS_ORIGIN=https://74.208.126.102:3005

# Frontend URL
FRONTEND_URL=https://74.208.126.102:3005
```

### Frontend - Editar apps/frontend/.env.production:

```bash
# API a través de Nginx SSL
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=https

# WebSocket con SSL
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=wss
```

---

## PASO 5: Modificar ecosystem.config.js

Cambiar los puertos internos:

```javascript
// Backend - cambiar puerto a 4006
{
  name: 'gamilit-backend',
  cwd: './apps/backend',
  script: 'dist/main.js',
  // ... otras configs ...
  env_production: {
    NODE_ENV: 'production',
    PORT: 4006,  // <-- Cambiar de 3006 a 4006
  }
}

// Frontend - cambiar puerto a 4005
{
  name: 'gamilit-frontend',
  cwd: './apps/frontend',
  script: 'npx',
  args: 'vite preview --port 4005 --host 0.0.0.0',  // <-- Cambiar de 3005 a 4005
  // ... otras configs ...
}
```

---

## PASO 6: Rebuild y Reiniciar

```bash
# Rebuild frontend
cd apps/frontend && npm run build && cd ../..

# Reiniciar PM2
pm2 restart all
pm2 save

# Verificar
pm2 list
```

---

## PASO 7: Validar

```bash
# Verificar Nginx
sudo systemctl status nginx

# Verificar SSL backend (ignorar warning de certificado auto-firmado)
curl -k https://74.208.126.102:3006/api/v1/health

# Verificar SSL frontend
curl -k -I https://74.208.126.102:3005
```

---

## URLs de Acceso

| Servicio | URL | Nota |
|----------|-----|------|
| Frontend | https://74.208.126.102:3005 | Aceptar advertencia SSL |
| Backend | https://74.208.126.102:3006/api/v1/health | Aceptar advertencia SSL |
| Swagger | https://74.208.126.102:3006/api/v1/docs | Si está habilitado |

---

## IMPORTANTE: Advertencia del Navegador

Al acceder por primera vez, el navegador mostrará:
```
Your connection is not private
NET::ERR_CERT_AUTHORITY_INVALID
```

**Esto es NORMAL con certificados auto-firmados.**

Para continuar:
1. Click en "Advanced" o "Avanzado"
2. Click en "Proceed to 74.208.126.102 (unsafe)" o "Continuar"

---

## Troubleshooting

### Error: Puerto en uso
```bash
# Ver qué usa el puerto
sudo lsof -i :3005
sudo lsof -i :3006

# Matar proceso si es necesario
sudo kill -9 <PID>
```

### Error: Nginx no inicia
```bash
sudo nginx -t
sudo journalctl -u nginx --no-pager -n 50
```

### Error: CORS
Verificar que:
1. Backend CORS_ORIGIN tenga `https://74.208.126.102:3005`
2. Nginx NO tenga headers CORS (solo NestJS los maneja)

---

*Guia creada: 2025-12-18*
