# GAMILIT Platform - Deployment Ready

**Fecha de preparación:** 2025-11-09
**Servidor de producción:** 74.208.126.102
**Estado:** ✅ LISTO PARA DESPLEGAR

---

## ✅ Configuraciones Completadas

### 1. Configuración de Backend

**Puerto:** 3006 (Configurado en `apps/backend/.env.production`)

**Archivos configurados:**
- ✅ `apps/backend/.env.production` - Variables de entorno completas
- ✅ `apps/backend/src/main.ts` - CORS y puerto configurados
- ✅ `apps/backend/src/config/env.config.ts` - Configuración de entorno
- ✅ `apps/backend/src/config/app.config.ts` - Configuración de aplicación

**Configuración CORS:**
```
http://74.208.126.102:3005
http://74.208.126.102
https://gamilit.com
https://www.gamilit.com
```

**Base de Datos:**
- Host: 74.208.126.102
- Puerto: 5432
- Database: gamilit_platform
- Usuario: gamilit_user
- Pool: Min 5, Max 20 conexiones

**Secrets:**
- ✅ JWT_SECRET: Generado para producción
- ✅ JWT_REFRESH_SECRET: Generado para producción
- ✅ SESSION_SECRET: Configurado

### 2. Configuración de Frontend

**Puerto:** 3005 (Configurado en `vite.config.ts` y PM2)

**Archivos configurados:**
- ✅ `apps/frontend/.env.production` - Variables de entorno de producción
- ✅ `apps/frontend/vite.config.ts` - Configuración de Vite (puerto 3005)

**API URL:**
```
VITE_API_URL=http://74.208.126.102:3006/api
VITE_WS_URL=ws://74.208.126.102:3006
```

**Feature Flags (Producción):**
- VITE_ENABLE_DEBUG=false
- VITE_ENABLE_GAMIFICATION=true
- VITE_ENABLE_SOCIAL_FEATURES=true
- VITE_ENABLE_ANALYTICS=true

### 3. Configuración de PM2

**Archivo:** `ecosystem.config.js`

**Backend:**
- Nombre: gamilit-backend
- Instancias: 2 (cluster mode)
- Modo: cluster
- Max Memory: 1GB
- Logs: logs/backend-error.log, logs/backend-out.log

**Frontend:**
- Nombre: gamilit-frontend
- Instancias: 1 (fork mode)
- Max Memory: 512MB
- Comando: `npx vite preview --port 3005 --host 0.0.0.0`
- Logs: logs/frontend-error.log, logs/frontend-out.log

### 4. Scripts de Despliegue

**Scripts creados:**
- ✅ `scripts/pre-deploy-check.sh` - Verificación pre-despliegue
- ✅ `scripts/build-production.sh` - Build de backend y frontend
- ✅ `scripts/deploy-production.sh` - Despliegue con PM2

**Permisos:**
- ✅ Todos los scripts tienen permisos de ejecución (chmod +x)

### 5. Documentación

**Documentos creados/actualizados:**
- ✅ `docs/95-guias-desarrollo/DEPLOYMENT-GUIDE.md` - Guía completa de despliegue
- ✅ `README.md` - Actualizado con sección de despliegue
- ✅ `DEPLOYMENT-READY.md` - Este documento

---

## 🚀 Proceso de Despliegue

### Paso 1: Verificación Pre-Despliegue

```bash
./scripts/pre-deploy-check.sh
```

**Este script verifica:**
- Node.js y npm instalados
- PM2 instalado (o lo instala)
- Archivos de configuración presentes
- Configuración de puertos correcta
- Configuración de CORS
- Configuración de base de datos
- Secrets de producción configurados
- Conectividad a la base de datos
- Permisos de directorios

### Paso 2: Build para Producción

```bash
./scripts/build-production.sh
```

**Este script:**
1. Instala dependencias del proyecto
2. Compila el backend (TypeScript → JavaScript)
3. Compila el frontend (React + Vite → archivos estáticos)
4. Verifica que los builds fueron exitosos
5. Muestra el tamaño de los builds

**Resultado esperado:**
- `apps/backend/dist/main.js` creado
- `apps/frontend/dist/` creado con archivos estáticos

### Paso 3: Despliegue

```bash
./scripts/deploy-production.sh
```

**Este script:**
1. Verifica que los builds existan
2. Verifica archivos .env.production
3. Crea directorio de logs
4. Detiene procesos PM2 anteriores (si existen)
5. Inicia backend con PM2 (2 instancias cluster)
6. Inicia frontend con PM2 (1 instancia)
7. Guarda configuración de PM2
8. Muestra estado de los procesos

---

## 🌐 URLs de Acceso Post-Despliegue

Una vez desplegado, la aplicación estará disponible en:

- **Frontend:** http://74.208.126.102:3005
- **Backend API:** http://74.208.126.102:3006/api
- **API Documentation:** http://74.208.126.102:3006/api/docs
- **Health Check:** http://74.208.126.102:3006/api/health

---

## 📊 Comandos PM2 Útiles

### Monitoreo

```bash
pm2 status                    # Estado de procesos
pm2 logs                      # Logs en tiempo real
pm2 logs gamilit-backend      # Logs solo del backend
pm2 logs gamilit-frontend     # Logs solo del frontend
pm2 monit                     # Monitor interactivo
```

### Gestión de Procesos

```bash
pm2 restart all               # Reiniciar todos
pm2 restart gamilit-backend   # Reiniciar solo backend
pm2 restart gamilit-frontend  # Reiniciar solo frontend
pm2 stop all                  # Detener todos
pm2 delete all                # Eliminar todos
```

### Configuración Persistente

```bash
pm2 save                      # Guardar configuración actual
pm2 startup                   # Configurar inicio automático
pm2 resurrect                 # Restaurar procesos guardados
```

---

## 🔍 Verificación Post-Despliegue

### 1. Verificar Procesos PM2

```bash
pm2 status
```

**Resultado esperado:**
```
┌─────┬──────────────────────┬─────────┬─────────┐
│ id  │ name                 │ mode    │ status  │
├─────┼──────────────────────┼─────────┼─────────┤
│ 0   │ gamilit-backend      │ cluster │ online  │
│ 1   │ gamilit-backend      │ cluster │ online  │
│ 2   │ gamilit-frontend     │ fork    │ online  │
└─────┴──────────────────────┴─────────┴─────────┘
```

### 2. Verificar Backend

```bash
# Health check
curl http://74.208.126.102:3006/api/health

# API docs
curl -I http://74.208.126.102:3006/api/docs
```

### 3. Verificar Frontend

```bash
# Página principal
curl -I http://74.208.126.102:3005
```

### 4. Verificar Logs

```bash
# Ver logs en tiempo real
pm2 logs --lines 50

# Ver logs de errores
tail -f logs/backend-error.log
tail -f logs/frontend-error.log
```

---

## ⚠️ Troubleshooting Rápido

### Backend no inicia

```bash
# Ver logs de error
pm2 logs gamilit-backend --err --lines 50

# Verificar .env.production
cat apps/backend/.env.production

# Verificar conexión a BD
psql -h 74.208.126.102 -U gamilit_user -d gamilit_platform
```

### Frontend no carga

```bash
# Ver logs
pm2 logs gamilit-frontend --lines 50

# Verificar build
ls -la apps/frontend/dist/

# Verificar API URL
cat apps/frontend/.env.production | grep VITE_API_URL
```

### Error de CORS

```bash
# Verificar CORS en backend
cat apps/backend/.env.production | grep CORS_ORIGIN

# Debe incluir: http://74.208.126.102:3005
```

---

## 📋 Checklist Final

Antes de considerar el despliegue como exitoso:

- [ ] Scripts de verificación ejecutados sin errores
- [ ] Backend compilado exitosamente
- [ ] Frontend compilado exitosamente
- [ ] Procesos PM2 iniciados (2 backend, 1 frontend)
- [ ] Backend responde en http://74.208.126.102:3006/api
- [ ] Frontend carga en http://74.208.126.102:3005
- [ ] API docs accesible en http://74.208.126.102:3006/api/docs
- [ ] Health check responde correctamente
- [ ] Logs no muestran errores críticos
- [ ] CORS configurado correctamente
- [ ] Base de datos conectada
- [ ] Configuración PM2 guardada
- [ ] Documentación actualizada

---

## 📚 Documentación Adicional

- **Guía Completa de Despliegue:** [docs/95-guias-desarrollo/DEPLOYMENT-GUIDE.md](./docs/95-guias-desarrollo/DEPLOYMENT-GUIDE.md)
- **README Principal:** [README.md](./README.md)
- **Configuración PM2:** [ecosystem.config.js](./ecosystem.config.js)

---

## 🆘 Soporte

Para problemas durante el despliegue:

1. Consultar logs: `pm2 logs`
2. Revisar esta guía
3. Consultar [DEPLOYMENT-GUIDE.md](./docs/95-guias-desarrollo/DEPLOYMENT-GUIDE.md)
4. Verificar configuración en archivos `.env.production`

---

## 📝 Notas de Versión

**Versión:** 1.0.0
**Fecha:** 2025-11-09
**Configurado por:** DevOps Team
**Última actualización:** 2025-11-09

**Cambios desde la última versión:**
- Configuración inicial de producción
- Scripts de despliegue automatizados
- Configuración PM2 para cluster mode
- Variables de entorno de producción completadas
- Documentación de despliegue creada

---

**ESTADO:** ✅ LISTO PARA DESPLEGAR

La plataforma GAMILIT está completamente configurada y lista para ser desplegada en el servidor de producción 74.208.126.102.

**Próximo paso:** Ejecutar `./scripts/pre-deploy-check.sh` para comenzar el proceso de despliegue.
