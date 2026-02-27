---
titulo: Configuración SSL con Nginx para Producción
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# GUIA: Configuracion SSL con Nginx para Produccion

**Servidor:** 74.208.126.102
**Requisito:** Dominio apuntando al servidor (ej: gamilit.com)

---

## ARQUITECTURA

```
                    INTERNET
                        │
                        ▼
              ┌─────────────────┐
              │   Nginx :443    │  ◄── SSL/HTTPS (certbot)
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

---

## PASO 1: Instalar Nginx y Certbot

```bash
sudo apt update
sudo apt install -y nginx certbot python3-certbot-nginx
```

---

## PASO 2: Configurar DNS

Asegurar que el dominio apunte al servidor:
```bash
# Verificar DNS
dig gamilit.com +short
# Debe mostrar: 74.208.126.102
```

---

## PASO 3: Configuracion Nginx (SIN SSL primero)

```bash
sudo tee /etc/nginx/sites-available/gamilit << 'NGINX'
server {
    listen 80;
    server_name gamilit.com www.gamilit.com;

    # Frontend (default)
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
sudo rm -f /etc/nginx/sites-enabled/default

# Verificar configuracion
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
```

---

## PASO 4: Obtener Certificado SSL con Certbot

```bash
# Obtener certificado (reemplazar dominio)
sudo certbot --nginx -d gamilit.com -d www.gamilit.com

# Certbot modifica automaticamente la configuracion de Nginx para HTTPS
# Verificar renovacion automatica
sudo certbot renew --dry-run
```

---

## PASO 5: Configuracion Nginx FINAL (con SSL)

Despues de certbot, la configuracion se ve asi:

```nginx
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

    # SSL (certbot configura esto automaticamente)
    ssl_certificate /etc/letsencrypt/live/gamilit.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/gamilit.com/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # IMPORTANTE: NO agregar headers CORS aqui
    # NestJS maneja CORS internamente
    # Headers duplicados causan: "multiple values" error

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
```

---

## PASO 6: Configurar Backend para HTTPS

Editar `apps/backend/.env.production`:

```bash
# CORS con HTTPS
CORS_ORIGIN=https://gamilit.com,https://www.gamilit.com

# Frontend URL
FRONTEND_URL=https://gamilit.com
```

---

## PASO 7: Configurar Frontend para HTTPS

Editar `apps/frontend/.env.production`:

```bash
# API con HTTPS (a traves de Nginx)
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_API_VERSION=v1

# WebSocket con SSL
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss
```

---

## PASO 8: Rebuild y Reiniciar

```bash
# Rebuild frontend con nueva config
cd apps/frontend && npm run build && cd ../..

# Reiniciar servicios
pm2 restart all

# Verificar
curl -I https://gamilit.com
curl https://gamilit.com/api/v1/health
```

---

## TROUBLESHOOTING

### Error: CORS multiple values
```
The 'Access-Control-Allow-Origin' header contains multiple values
```
**Causa:** Nginx y NestJS ambos agregan headers CORS
**Solucion:** NO agregar headers CORS en Nginx. Solo NestJS los maneja.

### Error: SSL Certificate
```bash
# Verificar certificado
sudo certbot certificates

# Renovar manualmente
sudo certbot renew

# Ver logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log
```

### Error: Nginx no inicia
```bash
sudo nginx -t
sudo systemctl status nginx
sudo journalctl -u nginx
```

---

## PUERTOS FINALES

| Servicio | Puerto Interno | Puerto Externo | Protocolo |
|----------|---------------|----------------|-----------|
| Nginx | 80, 443 | 80, 443 | HTTP/HTTPS |
| Backend | 3006 | - (via Nginx) | HTTP interno |
| Frontend | 3005 | - (via Nginx) | HTTP interno |
| PostgreSQL | 5432 | - (local only) | TCP |

---

## URLS DE ACCESO

- **Frontend:** https://gamilit.com
- **Backend API:** https://gamilit.com/api/v1/health
- **Swagger:** https://gamilit.com/api/v1/docs

---

*Guia creada: 2025-12-18*
