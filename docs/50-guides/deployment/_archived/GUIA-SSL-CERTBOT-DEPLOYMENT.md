---
titulo: Guía SSL con Certbot
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# Guia SSL con Certbot - GAMILIT

**Version:** 1.0.0
**Fecha:** 2025-12-18
**Autor:** Requirements-Analyst (SIMCO)

---

## 1. INTRODUCCION Y PROPOSITO

### Que hace el script `setup-ssl-certbot.sh`

Configura SSL/HTTPS automaticamente para la plataforma GAMILIT usando:
- **Let's Encrypt (Certbot):** Certificados SSL gratuitos y automaticos para dominios reales
- **Auto-firmado:** Certificados locales para servidores sin dominio publico

### Cuando usar cada opcion

| Escenario | Opcion | Comando |
|-----------|--------|---------|
| Servidor con dominio real (produccion) | Let's Encrypt | `./scripts/setup-ssl-certbot.sh gamilit.com` |
| Servidor sin dominio (desarrollo/staging) | Auto-firmado | `./scripts/setup-ssl-certbot.sh --self-signed` |
| Multiples dominios | Let's Encrypt | `./scripts/setup-ssl-certbot.sh gamilit.com www.gamilit.com` |

---

## 2. ARQUITECTURA

### Diagrama de Flujo HTTP a HTTPS

```
                    Internet
                       │
                       ▼
              ┌─────────────────┐
              │  Puerto 80/443  │
              │     (Nginx)     │
              └────────┬────────┘
                       │
        ┌──────────────┼──────────────┐
        │              │              │
        ▼              ▼              ▼
   /api/*         /socket.io     /*
        │              │              │
        ▼              ▼              ▼
┌───────────┐  ┌───────────┐  ┌───────────┐
│  Backend  │  │ WebSocket │  │ Frontend  │
│   :3006   │  │   :3006   │  │   :3005   │
└───────────┘  └───────────┘  └───────────┘
```

### Puertos Utilizados

| Puerto | Servicio | Tipo |
|--------|----------|------|
| 80 | Nginx HTTP | Externo (redirect a 443) |
| 443 | Nginx HTTPS | Externo |
| 3005 | Frontend (PM2) | Interno |
| 3006 | Backend (PM2) | Interno |
| 5432 | PostgreSQL | Interno |

---

## 3. REQUISITOS PREVIOS

### Sistema
- [x] Ubuntu/Debian
- [x] Acceso root (sudo)
- [x] Puertos 80 y 443 abiertos en firewall

### Servicios
- [x] PM2 instalado y ejecutando
- [x] `gamilit-backend` activo en PM2
- [x] `gamilit-frontend` activo en PM2

### DNS (solo para Let's Encrypt)
- [x] Dominio registrado
- [x] DNS A record apuntando al servidor (IP: 74.208.126.102 o tu IP)

### Verificar requisitos

```bash
# Verificar PM2
pm2 list

# Verificar puertos
sudo ufw status

# Verificar DNS (reemplaza con tu dominio)
dig +short tu-dominio.com
```

---

## 4. INSTALACION RAPIDA

### Opcion A: Con Dominio Real (Let's Encrypt)

```bash
# 1. Hacer script ejecutable
chmod +x scripts/setup-ssl-certbot.sh

# 2. Ejecutar con tu dominio
sudo ./scripts/setup-ssl-certbot.sh gamilit.com

# 3. Para multiples dominios
sudo ./scripts/setup-ssl-certbot.sh gamilit.com www.gamilit.com
```

### Opcion B: Sin Dominio (Auto-firmado)

```bash
# 1. Hacer script ejecutable
chmod +x scripts/setup-ssl-certbot.sh

# 2. Ejecutar con flag auto-firmado
sudo ./scripts/setup-ssl-certbot.sh --self-signed
```

### Ayuda

```bash
./scripts/setup-ssl-certbot.sh --help
```

---

## 5. CONFIGURACION DETALLADA

### Paso a Paso: Let's Encrypt

1. **Verificacion de prerequisitos**
   - Instala Nginx si no existe
   - Instala Certbot si no existe
   - Verifica procesos PM2

2. **Verificacion DNS**
   - Resuelve el dominio
   - Verifica que apunte al servidor correcto
   - Si hay discrepancia, pregunta confirmacion

3. **Configuracion Nginx inicial (HTTP)**
   - Crea config en `/etc/nginx/sites-available/gamilit`
   - Configura proxies para Frontend, API, WebSocket
   - Habilita sitio y recarga Nginx

4. **Obtencion de certificado**
   - Ejecuta Certbot con el dominio
   - Configura renovacion automatica
   - Actualiza config Nginx con SSL

5. **Actualizacion de variables de entorno**
   - Modifica `.env.production` del backend
   - Modifica `.env.production` del frontend

6. **Rebuild y restart**
   - Rebuild del frontend con nuevas variables
   - Restart de todos los servicios PM2

7. **Validacion**
   - Verifica HTTPS en Frontend
   - Verifica HTTPS en API
   - Verifica redirect HTTP->HTTPS

### Paso a Paso: Auto-firmado

Similar al anterior pero:
- Genera certificado con OpenSSL (365 dias)
- Almacena en `/etc/nginx/ssl/`
- No requiere validacion DNS

---

## 6. VARIABLES DE ENTORNO ACTUALIZADAS

### Backend (.env.production)

```env
# ANTES
CORS_ORIGIN=http://74.208.126.102:3005
FRONTEND_URL=http://74.208.126.102:3005

# DESPUES (Let's Encrypt)
CORS_ORIGIN=https://gamilit.com
FRONTEND_URL=https://gamilit.com

# DESPUES (Auto-firmado)
CORS_ORIGIN=https://74.208.126.102
FRONTEND_URL=https://74.208.126.102
```

### Frontend (.env.production)

```env
# ANTES
VITE_API_HOST=74.208.126.102:3006
VITE_API_PROTOCOL=http
VITE_WS_HOST=74.208.126.102:3006
VITE_WS_PROTOCOL=ws

# DESPUES
VITE_API_HOST=gamilit.com
VITE_API_PROTOCOL=https
VITE_WS_HOST=gamilit.com
VITE_WS_PROTOCOL=wss
```

---

## 7. VALIDACION POST-INSTALACION

### Validacion Automatica

```bash
./scripts/validate-deployment.sh --ssl --verbose
```

### Validacion Manual

```bash
# Frontend HTTPS
curl -I https://gamilit.com

# API HTTPS
curl https://gamilit.com/api/health

# Redirect HTTP->HTTPS
curl -I http://gamilit.com

# Certificado
echo | openssl s_client -connect gamilit.com:443 2>/dev/null | openssl x509 -noout -dates
```

### URLs de Acceso (post-SSL)

| Servicio | URL |
|----------|-----|
| Frontend | https://gamilit.com |
| API | https://gamilit.com/api |
| Health | https://gamilit.com/api/health |
| WebSocket | wss://gamilit.com/socket.io |

---

## 8. TROUBLESHOOTING

### DNS no resuelve

```
Error: No se pudo resolver dominio gamilit.com
```

**Solucion:**
1. Verificar DNS: `dig +short gamilit.com`
2. Esperar propagacion DNS (hasta 48h)
3. Verificar A record en registrador de dominio

### Certbot falla

```
Error: Challenge failed for domain
```

**Solucion:**
1. Verificar puerto 80 abierto: `sudo ufw allow 80`
2. Verificar que Nginx responde: `curl http://localhost`
3. Revisar logs: `sudo tail -f /var/log/letsencrypt/letsencrypt.log`

### Nginx no inicia

```
Error: Configuracion Nginx invalida
```

**Solucion:**
1. Verificar sintaxis: `sudo nginx -t`
2. Revisar config: `sudo cat /etc/nginx/sites-available/gamilit`
3. Revisar logs: `sudo tail -f /var/log/nginx/error.log`

### CORS errors despues de SSL

```
Error: CORS policy blocked
```

**Solucion:**
1. Verificar CORS_ORIGIN en backend: `grep CORS apps/backend/.env.production`
2. Debe ser exactamente `https://tu-dominio.com` (sin trailing slash)
3. Restart backend: `pm2 restart gamilit-backend`

### Certificado expirado

```
Error: SSL certificate has expired
```

**Solucion:**
1. Renovar manualmente: `sudo certbot renew`
2. Verificar cron de renovacion: `sudo systemctl status certbot.timer`
3. Si falla, regenerar: `sudo certbot certonly --nginx -d gamilit.com`

---

## 9. RENOVACION Y MANTENIMIENTO

### Renovacion Automatica

Certbot configura automaticamente un cron/timer para renovacion.

```bash
# Verificar timer
sudo systemctl status certbot.timer

# Ver proxima renovacion
sudo certbot certificates
```

### Renovacion Manual

```bash
# Dry-run (sin cambios)
sudo certbot renew --dry-run

# Renovacion forzada
sudo certbot renew --force-renewal
```

### Logs de Renovacion

```bash
# Logs de Certbot
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Historial de renovaciones
sudo ls -la /etc/letsencrypt/renewal-hooks/
```

---

## 10. REFERENCIAS

- [Documentacion Certbot](https://certbot.eff.org/docs/)
- [Nginx SSL Configuration](https://nginx.org/en/docs/http/configuring_https_servers.html)
- [Let's Encrypt](https://letsencrypt.org/docs/)

### Documentacion Relacionada

- `GUIA-SSL-NGINX-PRODUCCION.md` - Configuracion manual de SSL
- `GUIA-SSL-AUTOFIRMADO.md` - Certificados auto-firmados
- `GUIA-DEPLOYMENT-RAPIDO.md` - Deployment general
- `GUIA-VALIDACION-PRODUCCION.md` - Validaciones post-deployment

---

**Script:** `/scripts/setup-ssl-certbot.sh`
**Ultima actualizacion:** 2025-12-18
