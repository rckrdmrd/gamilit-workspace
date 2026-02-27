# GUIA-ACTUALIZACION-PRODUCCION.md

> [!WARNING]
> **Estado:** `DEPRECATED` para flujo maestro (2026-02-24).  
> Esta guia contiene pasos legacy; no usar como referencia principal de deploy.
>
> Fuentes canonicas:
> - `orchestration/referencias/MATRIZ-SSOT-DEV-PROD.md`
> - `orchestration/agents/perfiles/PERFIL-DEPLOY-SERVER.md`
> - `orchestration/directivas/simco/SIMCO-RECREAR-BD.md`

**Fecha:** 2025-12-18
**Version:** 1.0
**Proposito:** Guia paso a paso para actualizar el servidor de produccion desde el repositorio remoto

---

## IMPORTANTE - LEER PRIMERO

Este documento es la **guia maestra** que el agente en produccion debe seguir cuando:
1. Se notifica que hay un commit en remoto
2. Se necesita actualizar el servidor con los cambios del repositorio

**Principio:** Respaldar TODO antes de actualizar, dar preferencia a remoto, reintegrar configuraciones locales.

---

## FLUJO COMPLETO DE ACTUALIZACION

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO DE ACTUALIZACION                    │
├─────────────────────────────────────────────────────────────┤
│  1. DETENER SERVICIOS                                       │
│     └─> pm2 stop all                                        │
│                                                             │
│  2. RESPALDAR CONFIGURACIONES                               │
│     └─> Copiar .env files a /backup/config/                 │
│                                                             │
│  3. RESPALDAR BASE DE DATOS                                 │
│     └─> pg_dump completo a /backup/database/                │
│                                                             │
│  4. PULL DEL REPOSITORIO                                    │
│     └─> git fetch && git reset --hard origin/master           │
│                                                             │
│  5. RESTAURAR CONFIGURACIONES                               │
│     └─> Copiar .env files de vuelta                         │
│                                                             │
│  6. RECREAR BASE DE DATOS (limpia)                          │
│     └─> drop + create + seeds                               │
│                                                             │
│  7. INSTALAR DEPENDENCIAS                                   │
│     └─> npm install en backend y frontend                   │
│                                                             │
│  8. BUILD DE APLICACIONES                                   │
│     └─> npm run build                                       │
│                                                             │
│  9. INICIAR SERVICIOS                                       │
│     └─> pm2 start ecosystem.config.js                       │
│                                                             │
│  10. VALIDAR DEPLOYMENT                                     │
│      └─> ./scripts/diagnose-production.sh                   │
└─────────────────────────────────────────────────────────────┘
```

---

## PASO 1: DETENER SERVICIOS

```bash
# Detener todos los procesos PM2
pm2 stop all

# Verificar que estan detenidos
pm2 list
```

---

## PASO 2: RESPALDAR CONFIGURACIONES

### 2.1 Crear directorio de backup (si no existe)

```bash
# Directorio de backups fuera del workspace
BACKUP_DIR="/home/gamilit/backups/$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR/config"
mkdir -p "$BACKUP_DIR/database"

echo "Directorio de backup: $BACKUP_DIR"
```

### 2.2 Respaldar archivos de configuracion

```bash
# Respaldar .env de produccion
cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production"
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production"

# Respaldar ecosystem.config.js si tiene modificaciones locales
cp ecosystem.config.js "$BACKUP_DIR/config/ecosystem.config.js"

# Respaldar cualquier otro archivo de configuracion local
if [ -f "apps/backend/.env" ]; then
    cp apps/backend/.env "$BACKUP_DIR/config/backend.env"
fi

if [ -f "apps/frontend/.env" ]; then
    cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env"
fi

# Listar archivos respaldados
echo "=== Archivos de configuracion respaldados ==="
ls -la "$BACKUP_DIR/config/"
```

### 2.3 Archivos de configuracion criticos

| Archivo | Ubicacion | Contenido critico |
|---------|-----------|-------------------|
| `.env.production` | `apps/backend/` | DATABASE_URL, JWT_SECRET, CORS |
| `.env.production` | `apps/frontend/` | VITE_API_HOST, VITE_API_PORT |
| `ecosystem.config.js` | raiz | Configuracion PM2 |

---

## PASO 3: RESPALDAR BASE DE DATOS

### 3.1 Backup completo con pg_dump

```bash
# Variables de conexion (ajustar segun el servidor)
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="5432"

# Archivo de backup
BACKUP_FILE="$BACKUP_DIR/database/gamilit_backup_$(date +%Y%m%d_%H%M%S).sql"

# Ejecutar backup completo
PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h "$DB_HOST" \
    -p "$DB_PORT" \
    -U "$DB_USER" \
    -d "$DB_NAME" \
    --format=plain \
    --no-owner \
    --no-acl \
    > "$BACKUP_FILE"

# Verificar tamano del backup
ls -lh "$BACKUP_FILE"

# Comprimir backup
gzip "$BACKUP_FILE"
echo "Backup creado: ${BACKUP_FILE}.gz"
```

### 3.2 Verificar backup

```bash
# Verificar que el backup tiene contenido
gunzip -c "${BACKUP_FILE}.gz" | head -50

# Contar tablas en el backup
echo "Tablas en backup:"
gunzip -c "${BACKUP_FILE}.gz" | grep "CREATE TABLE" | wc -l
```

---

## PASO 4: PULL DEL REPOSITORIO

### 4.1 Verificar estado actual

```bash
# Ver estado actual
git status

# Ver rama actual
git branch

# Ver diferencias con remoto
git fetch origin
git log HEAD..origin/master --oneline
```

### 4.2 Hacer pull dando preferencia a remoto

```bash
# OPCION A: Reset completo a remoto (RECOMENDADO)
# Descarta TODOS los cambios locales y usa exactamente lo que hay en remoto
git fetch origin
git reset --hard origin/master

# OPCION B: Pull con estrategia de merge (si hay cambios locales importantes)
# git pull origin master --strategy-option theirs
```

### 4.3 Verificar el pull

```bash
# Verificar que estamos en el commit correcto
git log --oneline -5

# Verificar que no hay cambios pendientes
git status
```

---

## PASO 5: RESTAURAR CONFIGURACIONES

### 5.1 Restaurar archivos .env

```bash
# Restaurar configuraciones de produccion
cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

# Restaurar ecosystem.config.js si fue modificado
# cp "$BACKUP_DIR/config/ecosystem.config.js" ecosystem.config.js

# Crear enlaces simbolicos a .env si el backend los requiere
cd apps/backend
ln -sf .env.production .env
cd ../..

cd apps/frontend
ln -sf .env.production .env
cd ../..
```

### 5.2 Verificar configuraciones restauradas

```bash
# Verificar que los archivos existen
ls -la apps/backend/.env*
ls -la apps/frontend/.env*

# Verificar contenido critico (sin mostrar secrets)
echo "=== Backend Config ==="
grep -E "^(APP_|NODE_ENV|CORS)" apps/backend/.env.production

echo "=== Frontend Config ==="
grep -E "^VITE_" apps/frontend/.env.production
```

---

## PASO 6: RECREAR BASE DE DATOS (LIMPIA)

### 6.1 Ejecutar script de creacion

```bash
cd apps/database

# Configurar DATABASE_URL
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"

# Ejecutar script de creacion limpia
# IMPORTANTE: Este script hace DROP y CREATE de la base de datos
./create-database.sh

cd ../..
```

### 6.2 Proceso del script create-database.sh

El script ejecuta en orden:
1. DROP DATABASE (si existe)
2. CREATE DATABASE
3. Cargar DDL (16 fases - schemas, tablas, funciones, triggers)
4. Cargar Seeds de produccion (66 entries)

### 6.3 Verificar carga de datos

```bash
# Ejecutar script de diagnostico
./scripts/diagnose-production.sh

# O verificar manualmente las tablas criticas
psql "$DATABASE_URL" -c "
SELECT 'Tenants' as tabla, COUNT(*) as total FROM auth_management.tenants
UNION ALL SELECT 'Users', COUNT(*) FROM auth.users
UNION ALL SELECT 'Profiles', COUNT(*) FROM auth_management.profiles
UNION ALL SELECT 'Modules', COUNT(*) FROM educational_content.modules
UNION ALL SELECT 'Exercises', COUNT(*) FROM educational_content.exercises
UNION ALL SELECT 'Maya Ranks', COUNT(*) FROM gamification_system.maya_ranks
UNION ALL SELECT 'Achievements', COUNT(*) FROM gamification_system.achievements;
"
```

### 6.4 Si hay datos faltantes

```bash
# Ejecutar script de reparacion
./scripts/repair-missing-data.sh
```

---

## PASO 7: INSTALAR DEPENDENCIAS

### 7.1 Backend

```bash
cd apps/backend

# Limpiar node_modules si hay problemas
# rm -rf node_modules package-lock.json

# Instalar dependencias
npm install

cd ../..
```

### 7.2 Frontend

```bash
cd apps/frontend

# Limpiar node_modules si hay problemas
# rm -rf node_modules package-lock.json

# Instalar dependencias
npm install

cd ../..
```

---

## PASO 8: BUILD DE APLICACIONES

### 8.1 Build Backend

```bash
cd apps/backend

# Build de produccion
npm run build

# Verificar que el build fue exitoso
ls -la dist/

cd ../..
```

### 8.2 Build Frontend

```bash
cd apps/frontend

# Build de produccion
npm run build

# Verificar que el build fue exitoso
ls -la dist/

cd ../..
```

---

## PASO 9: INICIAR SERVICIOS

### 9.1 Iniciar con PM2

```bash
# Iniciar usando ecosystem.config.js
pm2 start ecosystem.config.js

# Verificar estado
pm2 list

# Guardar configuracion de PM2
pm2 save
```

### 9.2 Verificar logs

```bash
# Ver logs de todos los procesos
pm2 logs --lines 50

# Ver logs solo del backend
pm2 logs gamilit-backend --lines 30

# Ver logs solo del frontend
pm2 logs gamilit-frontend --lines 30
```

---

## PASO 10: VALIDAR DEPLOYMENT

### 10.1 Ejecutar script de diagnostico

```bash
./scripts/diagnose-production.sh
```

### 10.2 Verificaciones manuales

```bash
# Health check del backend
curl -s http://localhost:3006/api/health | jq .

# Verificar frontend
curl -s -o /dev/null -w "%{http_code}" http://localhost:3005

# Verificar tenant principal
psql "$DATABASE_URL" -c "SELECT slug, is_active FROM auth_management.tenants WHERE slug = 'gamilit-prod';"
```

### 10.3 Prueba de registro (opcional)

```bash
# Probar endpoint de registro
curl -X POST http://localhost:3006/api/v1/auth/register \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test-deploy@example.com",
        "password": "TestPassword123!",
        "first_name": "Test",
        "last_name": "Deploy"
    }'

# Si funciona, eliminar usuario de prueba
# psql "$DATABASE_URL" -c "DELETE FROM auth.users WHERE email = 'test-deploy@example.com';"
```

---

## SCRIPT AUTOMATIZADO COMPLETO

Para automatizar todo el proceso, usar el siguiente script:

```bash
#!/bin/bash
# update-production.sh
# Uso: ./scripts/update-production.sh

set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuracion
PROJECT_DIR="/ruta/al/proyecto/gamilit"
BACKUP_BASE="/home/gamilit/backups"
DB_NAME="gamilit_platform"
DB_USER="gamilit_user"
DB_HOST="localhost"
DB_PORT="5432"
# DB_PASSWORD debe estar en variable de entorno

# Crear timestamp
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE/$TIMESTAMP"

cd "$PROJECT_DIR"

echo -e "${BLUE}"
echo "=============================================="
echo "   ACTUALIZACION PRODUCCION GAMILIT"
echo "   Timestamp: $TIMESTAMP"
echo "=============================================="
echo -e "${NC}"

# 1. Detener servicios
echo -e "${YELLOW}[1/10] Deteniendo servicios...${NC}"
pm2 stop all

# 2. Crear directorios de backup
echo -e "${YELLOW}[2/10] Creando backup de configuraciones...${NC}"
mkdir -p "$BACKUP_DIR/config" "$BACKUP_DIR/database"

cp apps/backend/.env.production "$BACKUP_DIR/config/" 2>/dev/null || true
cp apps/backend/.env "$BACKUP_DIR/config/backend.env" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/" 2>/dev/null || true
cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/" 2>/dev/null || true

echo -e "${GREEN}Configuraciones respaldadas en $BACKUP_DIR/config/${NC}"

# 3. Backup de base de datos
echo -e "${YELLOW}[3/10] Creando backup de base de datos...${NC}"
BACKUP_FILE="$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql"
PGPASSWORD="$DB_PASSWORD" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE"
gzip "$BACKUP_FILE"
echo -e "${GREEN}Base de datos respaldada: ${BACKUP_FILE}.gz${NC}"

# 4. Pull del repositorio
echo -e "${YELLOW}[4/10] Actualizando desde repositorio remoto...${NC}"
git fetch origin
git reset --hard origin/master
echo -e "${GREEN}Repositorio actualizado${NC}"

# 5. Restaurar configuraciones
echo -e "${YELLOW}[5/10] Restaurando configuraciones...${NC}"
cp "$BACKUP_DIR/config/.env.production" apps/backend/ 2>/dev/null || true
cp "$BACKUP_DIR/config/.env.production" apps/frontend/ 2>/dev/null || true

# 6. Recrear base de datos
echo -e "${YELLOW}[6/10] Recreando base de datos...${NC}"
cd apps/database
export DATABASE_URL="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
./create-database.sh
cd ../..

# 7. Instalar dependencias
echo -e "${YELLOW}[7/10] Instalando dependencias backend...${NC}"
cd apps/backend && npm install && cd ../..

echo -e "${YELLOW}[8/10] Instalando dependencias frontend...${NC}"
cd apps/frontend && npm install && cd ../..

# 8. Build
echo -e "${YELLOW}[9/10] Construyendo aplicaciones...${NC}"
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

# 9. Iniciar servicios
echo -e "${YELLOW}[10/10] Iniciando servicios...${NC}"
pm2 start ecosystem.config.js
pm2 save

# 10. Validar
echo -e "${BLUE}"
echo "=============================================="
echo "   VALIDACION"
echo "=============================================="
echo -e "${NC}"

./scripts/diagnose-production.sh

echo -e "${GREEN}"
echo "=============================================="
echo "   ACTUALIZACION COMPLETADA"
echo "=============================================="
echo -e "${NC}"
echo "Backup disponible en: $BACKUP_DIR"
echo ""
```

---

## ROLLBACK (Si algo falla)

### Restaurar configuraciones

```bash
# Copiar archivos de configuracion del backup
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/* apps/backend/
cp /home/gamilit/backups/YYYYMMDD_HHMMSS/config/* apps/frontend/
```

### Restaurar base de datos

```bash
# Restaurar desde backup
BACKUP_FILE="/home/gamilit/backups/YYYYMMDD_HHMMSS/database/gamilit_*.sql.gz"

# Descomprimir
gunzip -c "$BACKUP_FILE" > /tmp/restore.sql

# Restaurar
psql "$DATABASE_URL" < /tmp/restore.sql

# Limpiar
rm /tmp/restore.sql
```

### Volver a commit anterior

```bash
# Ver commits anteriores
git log --oneline -10

# Volver a commit especifico
git reset --hard <commit_hash>

# Reinstalar y reconstruir
cd apps/backend && npm install && npm run build && cd ../..
cd apps/frontend && npm install && npm run build && cd ../..

# Reiniciar
pm2 restart all
```

---

## DOCUMENTACION RELACIONADA

Despues del pull, el agente debe leer estas guias si necesita mas detalle:

| Guia | Proposito |
|------|-----------|
| `GUIA-DESPLIEGUE-PRODUCCION-COMPLETA.md` | Configuracion completa del servidor |
| `GUIA-VALIDACION-PRODUCCION.md` | Validaciones y troubleshooting |
| `GUIA-CREAR-BASE-DATOS.md` | Detalle del proceso de creacion de BD |

---

## CHECKLIST RAPIDO

```
[ ] 1. pm2 stop all
[ ] 2. Backup configuraciones a /home/gamilit/backups/
[ ] 3. Backup base de datos (pg_dump)
[ ] 4. git fetch && git reset --hard origin/master
[ ] 5. Restaurar .env files
[ ] 6. cd apps/database && ./create-database.sh
[ ] 7. npm install (backend y frontend)
[ ] 8. npm run build (backend y frontend)
[ ] 9. pm2 start ecosystem.config.js
[ ] 10. ./scripts/diagnose-production.sh
```

---

**Ultima actualizacion:** 2025-12-18
**Autor:** Sistema de documentacion GAMILIT
