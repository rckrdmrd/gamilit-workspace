# GUIA: SSL Auto-firmado para Produccion (Sin Dominio)

**Servidor:** 74.208.126.102
**Uso:** Cuando NO tienes dominio configurado

---

## ARQUITECTURA

```
                    INTERNET
                        │
                        ▼
              ┌─────────────────┐
              │   Nginx :443    │  ◄── HTTPS (SSL auto-firmado)
              │   (Reverse      │
              │    Proxy)       │
              └────────┬────────┘
                       │
         ┌─────────────┴─────────────┐
         │                           │
         ▼                           ▼
┌─────────────────┐       ┌─────────────────┐
│ Backend :3006   │       │ Frontend :3005  │
│ (NestJS)        │       │ (Vite Preview)  │
│ /api/*          │       │ /*              │
└─────────────────┘       └─────────────────┘
```

**Puertos (NO SE CAMBIAN):**
- Frontend: 3005 (HTTP interno)
- Backend: 3006 (HTTP interno)
- Nginx: 443 (HTTPS externo)

**Acceso:**
- https://74.208.126.102 → Frontend
- https://74.208.126.102/api → Backend

---

## PASO 1: Generar Certificado Auto-firmado

```bash
sudo mkdir -p /etc/nginx/ssl

sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/gamilit.key \
    -out /etc/nginx/ssl/gamilit.crt \
    -subj "/C=MX/ST=Estado/L=Ciudad/O=Gamilit/CN=74.208.126.102"

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
# Acceso: https://74.208.126.102
# =============================================================================

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name 74.208.126.102;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name 74.208.126.102;

    # SSL con certificado auto-firmado
    ssl_certificate /etc/nginx/ssl/gamilit.crt;
    ssl_certificate_key /etc/nginx/ssl/gamilit.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # IMPORTANTE: NO agregar headers CORS aqui
    # NestJS maneja CORS internamente

    # Frontend (default) - proxy a puerto 3005
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

    # Backend API - proxy a puerto 3006
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

sudo ln -sf /etc/nginx/sites-available/gamilit /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

---

## PASO 4: Configurar Backend (.env.production)

**NO cambiar PORT.** Solo actualizar CORS:

```bash
# En apps/backend/.env.production
# Puerto se mantiene en 3006
PORT=3006

# CORS apunta al acceso HTTPS via Nginx
CORS_ORIGIN=https://74.208.126.102

# Frontend URL
FRONTEND_URL=https://74.208.126.102
```

---

## PASO 5: Configurar Frontend (.env.production)

```bash
# En apps/frontend/.env.production
# API a través de Nginx (mismo host, path /api)
VITE_API_HOST=74.208.126.102
VITE_API_PROTOCOL=https

# WebSocket
VITE_WS_HOST=74.208.126.102
VITE_WS_PROTOCOL=wss
```

---

## PASO 6: Rebuild Frontend

```bash
cd apps/frontend
npm run build
cd ../..
```

---

## PASO 7: Reiniciar Servicios

```bash
pm2 restart all
pm2 list
```

---

## PASO 8: Validar

```bash
# Verificar Nginx
sudo systemctl status nginx

# Health check via HTTPS
curl -sk https://74.208.126.102/api/v1/health

# Frontend via HTTPS
curl -sk -o /dev/null -w "HTTP Status: %{http_code}\n" https://74.208.126.102

# PM2 status
pm2 list
```

---

## URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | https://74.208.126.102 |
| Backend API | https://74.208.126.102/api/v1 |
| Health Check | https://74.208.126.102/api/v1/health |

---

## IMPORTANTE

1. **NO cambiar puertos de las apps** - Backend 3006, Frontend 3005
2. **Solo Nginx expone HTTPS** - Puerto 443
3. **Acceso unificado** - Todo via https://74.208.126.102
4. **CORS apunta a Nginx** - https://74.208.126.102 (no a puertos internos)

---

## Troubleshooting

### Error: Puerto 443 en uso
```bash
sudo lsof -i :443
sudo systemctl stop apache2  # Si Apache está corriendo
```

### Error: CORS
Verificar que CORS_ORIGIN sea `https://74.208.126.102` (sin puerto)

### Error: Nginx no inicia
```bash
sudo nginx -t
sudo journalctl -u nginx --no-pager -n 50
```

---

*Guia actualizada: 2025-12-18*
