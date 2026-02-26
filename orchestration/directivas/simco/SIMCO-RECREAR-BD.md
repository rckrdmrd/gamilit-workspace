# SIMCO: RECREAR BASE DE DATOS (DEV vs PROD)

**ID:** SIMCO-RECREAR-BD
**Version:** 1.0.0
**Fecha:** 2026-02-11
**Aplica a:** Todo agente que necesite recrear la base de datos
**Prioridad:** CRITICA — SSOT para recreacion de BD

---

## RESUMEN EJECUTIVO

> **Este documento es la FUENTE DE VERDAD para recrear la base de datos gamilit_platform.**
> Reemplaza cualquier referencia a scripts de workspace-v2 o unified-recreate-db.sh.

---

## DETECCION DE AMBIENTE

```
╔══════════════════════════════════════════════════════════════════════════╗
║  DETECTAR AMBIENTE ANTES DE OPERAR:                                      ║
║                                                                          ║
║  platform == win32         → AMBIENTE DEV (WSL)                          ║
║  platform == linux         → AMBIENTE PROD (74.208.126.102)              ║
║                                                                          ║
║  Verificar en CLAUDE.md:                                                 ║
║    - Si ves C:\Empresas\ISEM\gamilit-workspace → DEV                    ║
║    - Si ves /home/isem/gamilit-workspace → PROD                         ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## ARQUITECTURA MONOREPO STANDALONE

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAMILIT STANDALONE MONOREPO                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  gamilit-workspace/                                                  │
│  ├── apps/                                                           │
│  │   ├── backend/          NestJS 11 (22 modulos)                    │
│  │   ├── frontend/         React 19 + Vite 6.x                      │
│  │   └── database/                                                   │
│  │       ├── ddl/          Archivos DDL (FUENTE DE VERDAD)           │
│  │       ├── seeds/        Seeds por ambiente (dev/ | prod/)         │
│  │       └── scripts/      Scripts de BD                             │
│  │           ├── recreate-database.sh    (DROP user + BD + init)     │
│  │           ├── reset-database.sh       (DROP BD, mantiene user)    │
│  │           ├── init-database.sh        (CREATE user + BD + DDL)    │
│  │           └── force-recreate-all.sh   (Force + BYPASSRLS)        │
│  ├── docs/                                                           │
│  └── orchestration/                                                  │
│                                                                      │
│  Remote: git@github.com:rckrdmrd/gamilit-workspace.git              │
│  Branch: master                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

---

## CREDENCIALES

| Dato | Valor |
|------|-------|
| Base de Datos | gamilit_platform |
| Usuario | gamilit_user |
| Password | gamilit_dev_2026 |
| Puerto | 5432 |
| Schemas | 18 (16 activos + 2 placeholder) |

**Config files:**
- `apps/database/scripts/config/dev.conf` — configuracion DEV
- `apps/database/scripts/config/prod.conf` — configuracion PROD

---

## MATRIZ DE DECISION: CUAL SCRIPT USAR

| Situacion | Script | Que Hace |
|-----------|--------|----------|
| Primera vez (usuario no existe) | `init-database.sh` | Crea usuario + BD + DDL + seeds |
| Cambio DDL (usuario existe) | `reset-database.sh` | DROP BD + CREATE + DDL + seeds (mantiene user) |
| Recreacion total | `recreate-database.sh` | DROP user + DROP BD + init completo |
| Problemas de permisos/RLS | `force-recreate-all.sh` | Force DROP + CREATE con BYPASSRLS |

---

## PROCEDIMIENTO DEV (Windows + WSL)

### Prerequisitos

```powershell
# 1. Verificar que WSL esta corriendo
wsl -l -v
# Debe mostrar Ubuntu-24.04 en estado Running

# 2. Verificar PostgreSQL activo
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql --no-pager
# Debe mostrar "active (running)"

# 3. Verificar Redis activo
wsl -d Ubuntu-24.04 -u developer -- redis-cli ping
# Debe responder "PONG"
```

### Opcion A: Recrear Completo (recomendado para cambios DDL)

```powershell
# Wrapper WSL — ejecuta recreate-database.sh dentro de WSL
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force
```

### Opcion B: Reset Rapido (mantiene usuario)

```powershell
# Usa password existente, solo recrea la BD
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/reset-database.sh' --env dev --password 'gamilit_dev_2026' --force
```

### Opcion C: Init (primera vez o usuario no existe)

```powershell
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/init-database.sh' --env dev --force
```

### Opcion D: Force Recreate (problemas RLS/permisos)

```powershell
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/force-recreate-all.sh'
```

### Validacion Post-Recreacion (DEV)

```powershell
# Verificar schemas
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dn"

# Verificar tablas
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"

# Verificar funciones
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM information_schema.routines WHERE routine_schema NOT IN ('pg_catalog', 'information_schema');"

# Verificar conexion como gamilit_user
wsl -d Ubuntu-24.04 -u developer -- bash -c "PGPASSWORD='gamilit_dev_2026' psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform -c 'SELECT current_user, current_database();'"
```

---

## PROCEDIMIENTO PROD (Servidor 74.208.126.102)

### Prerequisitos

```bash
# 1. Conectar al servidor
ssh isem@74.208.126.102

# 2. Verificar PostgreSQL activo
sudo systemctl status postgresql --no-pager

# 3. Verificar espacio en disco (backups necesitan espacio)
df -h /home/isem
```

### Paso 1: BACKUP OBLIGATORIO

```bash
# SIEMPRE hacer backup antes de recrear en PROD
cd /home/isem/gamilit-workspace

# Backup completo
sudo -u postgres pg_dump gamilit_platform > /home/isem/backups/gamilit_platform_$(date +%Y%m%d_%H%M%S).sql

# Verificar que el backup se creo
ls -lh /home/isem/backups/gamilit_platform_*.sql | tail -1
```

### Paso 2: Detener Backend

```bash
# Detener PM2 para evitar conexiones durante recreacion
pm2 stop ecosystem.config.js
```

### Paso 3: Recrear BD

```bash
cd /home/isem/gamilit-workspace

# Leer password productivo desde .env.production (sin hardcodear)
DB_PASSWORD=$(grep '^DB_PASSWORD=' apps/backend/.env.production | cut -d'=' -f2- | tr -d '"' | tr -d "'")
[ -z "$DB_PASSWORD" ] && echo "DB_PASSWORD no encontrado en apps/backend/.env.production" && exit 1

# Opcion A: Recrear completo
bash apps/database/scripts/recreate-database.sh --env prod --password "$DB_PASSWORD" --force

# Opcion B: Reset rapido (mantiene usuario)
bash apps/database/scripts/reset-database.sh --env prod --password "$DB_PASSWORD" --force
```

### Paso 3.1: Post-recreacion (si hay errores de funciones/permisos)

```bash
cd /home/isem/gamilit-workspace/apps/database
for schema in gamilit auth_management gamification_system educational_content content_management social_features progress_tracking audit_logging communication notifications admin_dashboard system_configuration; do
  dir="ddl/schemas/$schema/functions"
  [ -d "$dir" ] && for f in "$dir"/*.sql; do
    [ -f "$f" ] && sudo -u postgres psql -d gamilit_platform -f "$f" 2>/dev/null
  done
done
```

### Paso 4: Reiniciar Backend

```bash
# Reiniciar PM2
pm2 restart ecosystem.config.js

# Verificar estado
pm2 status

# Verificar logs
pm2 logs --lines 20
```

### Paso 5: Smoke Test

```bash
# Verificar que el backend responde
curl -s http://localhost:3006/api/v1/health | head -20

# Verificar conexion BD desde backend
pm2 logs gamilit-backend --lines 5 | grep -i "database"
```

### Validacion Post-Recreacion (PROD)

```bash
# Verificar schemas (directo, sin wrapper WSL)
sudo -u postgres psql -d gamilit_platform -c "\dn"

# Verificar tablas
sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM pg_tables WHERE schemaname NOT IN ('pg_catalog', 'information_schema');"

# Verificar RLS policies
sudo -u postgres psql -d gamilit_platform -c "SELECT COUNT(*) FROM pg_policies;"
```

---

## TABLA COMPARATIVA DEV vs PROD

| Aspecto | DEV (WSL) | PROD (74.208.126.102) |
|---------|-----------|----------------------|
| Wrapper | `wsl -d Ubuntu-24.04 -u developer --` | Directo (SSH) |
| Ruta Windows | `C:\Empresas\ISEM\gamilit-workspace` | N/A |
| Ruta WSL/Linux | `/mnt/c/Empresas/ISEM/gamilit-workspace` | `/home/isem/gamilit-workspace` |
| Backup antes | Opcional | OBLIGATORIO |
| Detener backend | No necesario (dev server) | PM2 stop OBLIGATORIO |
| Password default | gamilit_dev_2026 | Rotado (ver .env.prod) |
| Smoke test | Opcional | OBLIGATORIO |
| Puerto DB | 5432 | 5432 |
| Variables backend | `DB_USER` | `DB_USER` y `DB_USERNAME` deben coincidir |

---

## ERRORES COMUNES Y SOLUCIONES

| Error | Causa | Solucion |
|-------|-------|----------|
| `FATAL: database does not exist` | BD no creada o nombre incorrecto | Usar init-database.sh primero |
| `FATAL: password authentication failed` | Password incorrecto | Verificar en CLAUDE.md RC5 |
| `FATAL: role "gamilit_user" does not exist` | Usuario no creado | Usar init-database.sh o recreate-database.sh |
| `PostgreSQL not running` | Servicio caido | DEV: `wsl ... sudo systemctl start postgresql` / PROD: `sudo systemctl start postgresql` |
| `relation already exists` | DDL sin DROP previo | Agregar `DROP TABLE IF EXISTS` al DDL |
| `new row violates row-level security` | Falta BYPASSRLS | Usar force-recreate-all.sh |
| `permission denied for schema` | Permisos insuficientes | Verificar 99-post-ddl-permissions.sql ejecutado |
| `could not connect to server` (WSL) | WSL no esta corriendo | `wsl --shutdown` y reiniciar |
| Puerto 5433 en error | Script con puerto incorrecto | Puerto correcto es 5432 (ver config/*.conf) |

---

## REFERENCIAS

- `@SIMCO-DDL` — Flujo DDL-First y convenciones
- `@TRIGGER-DDL-WSL` — Trigger de recreacion cuando cambian archivos DDL
- `@WSL-OPS` — SIMCO-LOCAL-WSL.md para operaciones en WSL
- `@AMBIENTES` — docs/20-architecture/AMBIENTES-DEV-PROD.md
- `@PERFIL-DEPLOY` — Workflow completo de deployment en produccion

---

*SIMCO-RECREAR-BD v1.0.0 - Sistema SIMCO v4.0.0*
