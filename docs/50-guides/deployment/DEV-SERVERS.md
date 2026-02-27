---
titulo: Guía de Servidores de Desarrollo
tipo: guia
dominio: deployment
ultima_actualizacion: 2026-02-27
---

# 🚀 GAMILIT - Guía de Servidores de Desarrollo

Guía rápida para iniciar y detener los servidores de desarrollo Frontend y Backend.

---

## 📦 Configuración de Puertos

| Servidor | Puerto | URL |
|----------|--------|-----|
| **Frontend** (Vite + React) | **3005** | http://localhost:3005 |
| **Backend** (NestJS) | **3006** | http://localhost:3006 |
| **Backend API Docs** | **3006** | http://localhost:3006/api/docs |

---

## 🚀 Inicio Rápido

### Opción 1: Usar Scripts Helper (Recomendado)

```bash
# Iniciar ambos servidores (Frontend + Backend)
./start-dev.sh

# Iniciar solo Frontend
./start-dev.sh frontend

# Iniciar solo Backend
./start-dev.sh backend
```

### Opción 2: Manual

```bash
# Terminal 1 - Backend
cd apps/backend
npm run dev

# Terminal 2 - Frontend
cd apps/frontend
npm run dev
```

---

## 🛑 Detener Servidores

### Opción 1: Usar Script Helper (Recomendado)

```bash
# Detener ambos servidores
./stop-dev.sh

# Detener solo Frontend
./stop-dev.sh frontend

# Detener solo Backend
./stop-dev.sh backend
```

### Opción 2: Manual

```bash
# Presionar Ctrl+C en cada terminal donde esté corriendo el servidor

# O matar procesos por puerto
lsof -ti:3005 | xargs kill -9  # Frontend
lsof -ti:3006 | xargs kill -9  # Backend
```

---

## 📋 Ver Logs

```bash
# Ver logs Frontend en tiempo real
tail -f /tmp/gamilit-frontend.log

# Ver logs Backend en tiempo real
tail -f /tmp/gamilit-backend.log

# Ver últimas 50 líneas
tail -50 /tmp/gamilit-frontend.log
tail -50 /tmp/gamilit-backend.log
```

---

## 🔍 Verificar Estado

```bash
# Verificar qué servidores están corriendo
lsof -i:3005 -i:3006 | grep LISTEN

# Verificar procesos
ps aux | grep "vite\|nest"

# Verificar PIDs guardados
cat /tmp/gamilit-frontend.pid
cat /tmp/gamilit-backend.pid
```

---

## 🌐 URLs Importantes

### Frontend
- **Aplicación:** http://localhost:3005
- **Dashboard:** http://localhost:3005/dashboard
- **Progreso:** http://localhost:3005/progress
- **Achievements:** http://localhost:3005/achievements
- **Leaderboard:** http://localhost:3005/leaderboard

### Backend
- **API Base:** http://localhost:3006/api
- **API Docs (Swagger):** http://localhost:3006/api/docs
- **Auth:** http://localhost:3006/api/auth
- **Educational:** http://localhost:3006/api/educational
- **Progress:** http://localhost:3006/api/progress
- **Social:** http://localhost:3006/api/social
- **Gamification:** http://localhost:3006/api/gamification
- **Admin:** http://localhost:3006/api/admin

---

## 🔧 Configuración CORS

El Backend está configurado para aceptar requests desde:

**Desarrollo:**
- `http://localhost:3005` (Frontend principal)
- `http://localhost:5173` (Vite default - fallback)

**Producción:**
- `http://74.208.126.102:3005`
- `http://74.208.126.102:5173`
- `http://74.208.126.102`
- `https://gamilit.com`
- `https://www.gamilit.com`

Para cambiar orígenes permitidos, editar:
- **Desarrollo:** `apps/backend/.env` → `CORS_ORIGIN`
- **Producción:** `apps/backend/.env.production` → `CORS_ORIGIN`

---

## 🐛 Solución de Problemas

### Error: Puerto en uso

```bash
# Liberar puertos manualmente
./stop-dev.sh

# O manualmente
lsof -ti:3005 | xargs kill -9
lsof -ti:3006 | xargs kill -9
```

### Error: Dependencias faltantes

```bash
# Reinstalar dependencias Frontend
cd apps/frontend
rm -rf node_modules package-lock.json
npm install

# Reinstalar dependencias Backend
cd apps/backend
rm -rf node_modules package-lock.json
npm install
```

### Error: Tailwind CSS no compila

```bash
# Limpiar cache de Vite
cd apps/frontend
rm -rf node_modules/.vite
npm run dev
```

### Error: Backend no conecta a Base de Datos

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql

# Verificar credenciales en .env
cat apps/backend/.env | grep DB_
```

---

## 📝 Variables de Entorno

### Frontend (`apps/frontend/.env`)
```bash
VITE_API_URL=http://localhost:3006
VITE_JWT_SECRET=IksGn8fpggQ2MlhAG3/dlzpIOrx+cNyAgEBmYF3nIYs=
```

### Backend (`apps/backend/.env`)
```bash
# Server
PORT=3006
NODE_ENV=dev

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=gamilit_platform
DB_USER=gamilit_user
DB_PASSWORD=ULwSaMu5uTNQYTaJTelPY3gGFMTKNOqo

# CORS
CORS_ORIGIN=http://localhost:3005,http://localhost:5173

# JWT
JWT_SECRET=IksGn8fpggQ2MlhAG3/dlzpIOrx+cNyAgEBmYF3nIYs=
JWT_REFRESH_SECRET=GXhorH2FV6M/kbXItZRcKGmPATRAb56rFNgwhtaqCDs=
```

---

## ✅ Checklist Antes de Desarrollar

- [ ] PostgreSQL corriendo (`sudo systemctl status postgresql`)
- [ ] Base de datos `gamilit_platform` creada
- [ ] Variables de entorno configuradas (`.env`)
- [ ] Dependencias instaladas (`npm install` en ambos proyectos)
- [ ] Puertos 3005 y 3006 libres
- [ ] Scripts helper tienen permisos de ejecución (`chmod +x *.sh`)

---

## 🎯 Next Steps

1. Iniciar servidores: `./start-dev.sh`
2. Abrir navegador: http://localhost:3005
3. Verificar API Docs: http://localhost:3006/api/docs
4. Happy coding! 🚀

---

**Última actualización:** 2025-11-02
**Versión:** 1.0.0
