---
titulo: Directiva Deployment en Producción
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# DIRECTIVA: Deployment en Producción

**Versión:** 1.0
**Servidor:** 74.208.126.102
**Ejecutar después de:** Backup configs + Pull + Restaurar configs

---

## PREREQUISITOS

Antes de ejecutar esta directiva, debes haber completado:
- [x] Backup de configuraciones en ../backups/TIMESTAMP/
- [x] Pull del repositorio (git reset --hard origin/master)
- [x] Restauración de .env.production desde backup

---

## PROCESO DE DEPLOYMENT

### PASO 1: Verificar SSL/Nginx

```bash
# Verificar si Nginx está instalado y corriendo
if ! command -v nginx &> /dev/null; then
    echo "Nginx no instalado. Ejecutar GUIA-SSL-AUTOFIRMADO.md primero"
    exit 1
fi

if ! systemctl is-active --quiet nginx; then
    echo "Nginx no está corriendo. Iniciando..."
    sudo systemctl start nginx
fi

# Verificar certificado SSL existe
if [ ! -f /etc/nginx/ssl/gamilit.crt ]; then
    echo "Certificado SSL no encontrado. Ejecutar GUIA-SSL-AUTOFIRMADO.md"
    exit 1
fi

echo "✓ SSL/Nginx configurado"
```

### PASO 2: Recrear Base de Datos

```bash
cd apps/database
chmod +x create-database.sh
./create-database.sh
cd ../..

echo "✓ Base de datos recreada"
```

### PASO 3: Instalar Dependencias

```bash
# Backend
cd apps/backend
npm install --production=false
cd ../..

# Frontend
cd apps/frontend
npm install --production=false
cd ../..

echo "✓ Dependencias instaladas"
```

### PASO 4: Build

```bash
# Backend
cd apps/backend
npm run build
cd ../..

# Frontend
cd apps/frontend
npm run build
cd ../..

echo "✓ Build completado"
```

### PASO 5: Iniciar Servicios con PM2

```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 list

echo "✓ Servicios iniciados"
```

### PASO 6: Validación

```bash
# Esperar a que los servicios inicien
sleep 5

# Health check backend (interno)
echo "=== Health Check Backend (interno) ==="
curl -s http://localhost:3006/api/v1/health | head -10

# Health check frontend (interno)
echo "=== Health Check Frontend (interno) ==="
curl -s -o /dev/null -w "HTTP Status: %{http_code}\n" http://localhost:3005

# Health check via Nginx (HTTPS)
echo "=== Health Check HTTPS ==="
curl -sk https://74.208.126.102/api/v1/health | head -10

echo "=== Frontend HTTPS ==="
curl -sk -o /dev/null -w "HTTP Status: %{http_code}\n" https://74.208.126.102

# PM2 status
echo "=== PM2 Status ==="
pm2 list

# Logs recientes
echo "=== Logs Recientes ==="
pm2 logs --lines 10 --nostream
```

---

## CONFIGURACIÓN ESPERADA

### Puertos

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| Backend | 3006 | HTTP (interno) |
| Frontend | 3005 | HTTP (interno) |
| Nginx | 443 | HTTPS (externo) |

### URLs de Acceso

| Servicio | URL |
|----------|-----|
| Frontend | https://74.208.126.102 |
| Backend API | https://74.208.126.102/api/v1 |
| Health Check | https://74.208.126.102/api/v1/health |

---

## SI FALLA ALGO

### Error en Base de Datos
```bash
# Verificar PostgreSQL
sudo systemctl status postgresql
PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT 1"
```

### Error en Build
```bash
# Ver logs de error
cd apps/backend && npm run build 2>&1 | tail -50
cd apps/frontend && npm run build 2>&1 | tail -50
```

### Error en PM2
```bash
pm2 logs gamilit-backend --err --lines 50
pm2 logs gamilit-frontend --err --lines 50
```

### Error en Nginx/SSL
```bash
sudo nginx -t
sudo systemctl status nginx
curl -vk https://74.208.126.102:3006/api/v1/health
```

### Rollback Completo
```bash
pm2 stop all

# Restaurar configs
cp "../backups/latest/config/backend.env.production" apps/backend/.env.production
cp "../backups/latest/config/frontend.env.production" apps/frontend/.env.production

# Rebuild
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

# Reiniciar
pm2 start ecosystem.config.js --env production
```

---

## CHECKLIST FINAL

- [ ] Nginx corriendo con SSL
- [ ] Base de datos recreada
- [ ] Backend build exitoso
- [ ] Frontend build exitoso
- [ ] PM2 servicios online
- [ ] Health check backend OK
- [ ] Health check frontend OK
- [ ] HTTPS funcionando en :3005 y :3006

---

*Directiva creada: 2025-12-18*
