# PROMPT PARA AGENTE EN PRODUCCION - GAMILIT

**Usar este prompt cuando necesites que el agente ejecute un deployment en produccion.**
**IMPORTANTE: Todas las rutas son RELATIVAS al workspace. Backups van en ../backups/**

---

## PROMPT INICIAL (Primera vez o agente sin contexto)

Usar este prompt ANTES del primer pull cuando el agente no tiene documentacion:

```
Eres el agente de deployment de GAMILIT en el servidor de producción.
Estás ejecutándote DENTRO del workspace del proyecto.

## PASO 1: BACKUP (OBLIGATORIO)

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"/{database,config,logs}

PGPASSWORD="$DB_PASSWORD" pg_dump \
    -h localhost \
    -U gamilit_user \
    -d gamilit_platform \
    --no-owner --no-acl \
    | gzip > "$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production" 2>/dev/null || true
cp apps/backend/.env "$BACKUP_DIR/config/backend.env" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production" 2>/dev/null || true
cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/" 2>/dev/null || true
cp -r logs/* "$BACKUP_DIR/logs/" 2>/dev/null || true

ln -sfn "$BACKUP_DIR" "../backups/latest"

echo "Backup completado en: $BACKUP_DIR"
ls -la "$BACKUP_DIR"

## PASO 2: DETENER SERVICIOS

pm2 stop all
pm2 list

## PASO 3: PULL DEL REPOSITORIO

git fetch origin
git status
git reset --hard origin/master
git log --oneline -1

## PASO 4: LEER DIRECTIVAS

Lee: docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
Lee: PROMPT-AGENTE-PRODUCCION.md

## PASO 5: RESTAURAR CONFIGURACIONES

cp "$BACKUP_DIR/config/backend.env.production" apps/backend/.env.production
cp "$BACKUP_DIR/config/frontend.env.production" apps/frontend/.env.production

cd apps/backend && ln -sf .env.production .env && cd ../..
cd apps/frontend && ln -sf .env.production .env && cd ../..

## PASO 6: RECREAR BASE DE DATOS

cd apps/database
chmod +x create-database.sh
./create-database.sh
cd ../..

## PASO 7: INSTALAR Y BUILD

cd apps/backend && npm install --production=false && npm run build && cd ../..
cd apps/frontend && npm install --production=false && npm run build && cd ../..

## PASO 8: INICIAR SERVICIOS

pm2 start ecosystem.config.js --env production
pm2 save
pm2 list

## PASO 9: VALIDAR

curl -s http://localhost:3006/api/health | head -5
curl -s -o /dev/null -w "Frontend HTTP Status: %{http_code}\n" http://localhost:3005
pm2 logs --lines 10

## ROLLBACK (si falla)

pm2 stop all
gunzip -c "../backups/latest/database/gamilit_*.sql.gz" | PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform
cp "../backups/latest/config/backend.env.production" apps/backend/.env.production
cp "../backups/latest/config/frontend.env.production" apps/frontend/.env.production
cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..
pm2 start ecosystem.config.js

---
EJECUTA CADA PASO EN ORDEN mostrando outputs. Si falla, detente y reporta.
```

---

## PROMPT CORTO (Para deployments de rutina - cuando ya tiene documentacion)

```
Ejecuta el deployment de GAMILIT siguiendo el procedimiento en docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md

Resumen (rutas relativas, backups en ../backups/):
1. Backup BD y configs a ../backups/TIMESTAMP/
2. pm2 stop all
3. git reset --hard origin/master
4. Restaurar configs desde backup
5. Recrear BD con create-database.sh
6. npm install && npm run build (backend y frontend)
7. pm2 start ecosystem.config.js
8. Validar con health checks

Ejecuta paso a paso mostrando outputs.
```

---

## PROMPT PARA SOLO VALIDACION

```
Ejecuta el diagnostico de produccion de GAMILIT.

1. Lee docs/95-guias-desarrollo/GUIA-DEPLOYMENT-AGENTE-PRODUCCION.md
2. Verifica:
   - PM2 status: pm2 list
   - Health check backend: curl -s http://localhost:3006/api/health
   - Frontend status: curl -s -o /dev/null -w "%{http_code}" http://localhost:3005
   - Conexion a BD: PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform -c "SELECT 1"
   - Espacio en disco: df -h
   - Logs recientes: pm2 logs --lines 30

Reporta cualquier problema encontrado.
```

---

## PROMPT PARA SOLO BACKUP

```
Ejecuta un backup completo de GAMILIT sin hacer deployment.
Rutas relativas - backups van en ../backups/

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="../backups/$TIMESTAMP"

mkdir -p "$BACKUP_DIR"/{database,config,logs}

PGPASSWORD="$DB_PASSWORD" pg_dump -h localhost -U gamilit_user -d gamilit_platform --no-owner --no-acl | gzip > "$BACKUP_DIR/database/gamilit_$TIMESTAMP.sql.gz"

cp apps/backend/.env.production "$BACKUP_DIR/config/backend.env.production" 2>/dev/null || true
cp apps/backend/.env "$BACKUP_DIR/config/backend.env" 2>/dev/null || true
cp apps/frontend/.env.production "$BACKUP_DIR/config/frontend.env.production" 2>/dev/null || true
cp apps/frontend/.env "$BACKUP_DIR/config/frontend.env" 2>/dev/null || true
cp ecosystem.config.js "$BACKUP_DIR/config/" 2>/dev/null || true

ln -sfn "$BACKUP_DIR" "../backups/latest"

echo "Backup completado:"
ls -la "$BACKUP_DIR"
ls -la "$BACKUP_DIR/database/"
ls -la "$BACKUP_DIR/config/"
```

---

## PROMPT PARA ROLLBACK

```
Ejecuta un rollback de GAMILIT al ultimo backup.

pm2 stop all

gunzip -c "../backups/latest/database/gamilit_*.sql.gz" | PGPASSWORD="$DB_PASSWORD" psql -h localhost -U gamilit_user -d gamilit_platform

cp "../backups/latest/config/backend.env.production" apps/backend/.env.production
cp "../backups/latest/config/frontend.env.production" apps/frontend/.env.production

cd apps/backend && npm run build && cd ../..
cd apps/frontend && npm run build && cd ../..

pm2 start ecosystem.config.js
pm2 list
```

---

## ESTRUCTURA DE BACKUPS (Relativa al workspace)

```
../                              <- Carpeta padre del workspace
├── backups/                     <- Backups aqui (mismo nivel que workspace)
│   ├── 20251218_163045/
│   │   ├── database/gamilit_20251218_163045.sql.gz
│   │   ├── config/
│   │   │   ├── backend.env.production
│   │   │   ├── backend.env
│   │   │   ├── frontend.env.production
│   │   │   ├── frontend.env
│   │   │   └── ecosystem.config.js
│   │   └── logs/
│   ├── 20251218_180000/
│   └── latest -> 20251218_180000/
└── gamilit-workspace/           <- Tu workspace (donde ejecutas)
    ├── apps/
    ├── docs/
    └── ...
```

---

## VARIABLES DE ENTORNO REQUERIDAS

Verificar que existan antes de empezar:
- DB_PASSWORD (password de PostgreSQL)
- Opcional: JWT_SECRET, SESSION_SECRET (si no estan en .env.production)

---

## NOTAS IMPORTANTES

1. **Siempre hacer backup ANTES de cualquier cambio**
2. **Todas las rutas son RELATIVAS al workspace**
3. **Backups van en ../backups/ (mismo nivel que el workspace)**
4. **El symlink 'latest' siempre apunta al ultimo backup**
5. **Despues del pull, leer las directivas actualizadas**

---

*Prompts creados para GAMILIT Production Agent*
*Ultima actualizacion: 2025-12-18*
