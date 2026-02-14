# TRIGGER: DDL Cambios -> Recrear BD

**ID:** TRIGGER-DDL-RECREAR-BD-WSL
**Version:** 2.0.0
**Fecha:** 2026-02-11
**Aplica a:** Todos los agentes que modifiquen archivos DDL

---

## Proposito

Este trigger asegura que cuando un agente modifica archivos DDL, la base de datos se recree para reflejar los cambios. Aplica tanto en ambiente DEV (WSL) como PROD (servidor).

---

## Contexto Arquitectura

```
┌─────────────────────────────────────────────────────────────────────┐
│                    GAMILIT STANDALONE MONOREPO                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  gamilit-workspace/                                                  │
│  ├── apps/database/                                                  │
│  │   ├── ddl/              ← FUENTE DE VERDAD (archivos .sql)       │
│  │   ├── seeds/            ← Datos iniciales (dev/ | prod/)         │
│  │   └── scripts/          ← Scripts de recreacion                  │
│  │       ├── recreate-database.sh   (DROP user + BD + init)         │
│  │       ├── reset-database.sh      (DROP BD, mantiene user)        │
│  │       ├── init-database.sh       (CREATE user + BD + DDL)        │
│  │       └── force-recreate-all.sh  (Force + BYPASSRLS)            │
│  ├── apps/backend/         ← NestJS 11 (entities alineadas con DDL)│
│  └── apps/frontend/        ← React 19                               │
│                                                                      │
│  PostgreSQL 15: localhost:5432                                       │
│  Base de datos: gamilit_platform                                     │
│  Usuario: gamilit_user | Password: gamilit_dev_2026                 │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Regla Critica

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   SI MODIFICASTE UN ARCHIVO DDL → DEBES RECREAR LA BD                   ║
║                                                                           ║
║   Flujo obligatorio:                                                      ║
║                                                                           ║
║   1. Modificar archivo .sql en apps/database/ddl/                        ║
║   2. Recrear BD (ver procedimiento por ambiente abajo)                   ║
║   3. Verificar que la carga fue exitosa                                  ║
║   4. Commit cambios DDL                                                  ║
║                                                                           ║
║   SIN RECREACION = DDL NO VALIDADO = TAREA INCOMPLETA                    ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Condicion de Activacion

Este trigger se activa cuando:

1. Se crea un nuevo archivo `.sql` en cualquier carpeta `ddl/`
2. Se modifica un archivo `.sql` existente en cualquier carpeta `ddl/`
3. Se eliminan tablas o se cambia la estructura de schemas

---

## Accion Requerida

### Paso 1: Identificar Ambiente

| Ambiente | Plataforma | Deteccion |
|----------|-----------|-----------|
| DEV | Windows (win32) | Agente corre en `C:\Empresas\ISEM\gamilit-workspace` |
| PROD | Linux | Servidor 74.208.126.102, ruta `/home/isem/gamilit-workspace` |

### Paso 2: Recrear Base de Datos

**DEV (Windows + WSL):**

```powershell
# Recrear completo (recomendado)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force

# O reset rapido (mantiene usuario)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/reset-database.sh' --env dev --password 'gamilit_dev_2026' --force
```

**PROD (Servidor Linux):**

```bash
# BACKUP OBLIGATORIO primero
sudo -u postgres pg_dump gamilit_platform > /home/isem/backups/gamilit_platform_$(date +%Y%m%d_%H%M%S).sql

# Detener backend
pm2 stop ecosystem.config.js

# Recrear
bash /home/isem/gamilit-workspace/apps/database/scripts/recreate-database.sh --env prod --force

# Reiniciar backend
pm2 restart ecosystem.config.js
```

> **Procedimiento detallado:** Ver `@SIMCO-RECREAR-BD` para guia completa por ambiente.

### Paso 3: Verificar Carga

**DEV:**
```powershell
# Verificar que no hay errores
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dt *.*"

# Verificar estructura de tabla modificada
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\d {schema}.{tabla}"
```

**PROD:**
```bash
sudo -u postgres psql -d gamilit_platform -c "\dt *.*"
sudo -u postgres psql -d gamilit_platform -c "\d {schema}.{tabla}"
```

---

## Errores Comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| `FATAL: database does not exist` | BD no creada | Usar init-database.sh |
| `FATAL: password authentication failed` | Credenciales incorrectas | Verificar en CLAUDE.md RC5 |
| `relation already exists` | DDL sin DROP previo | Agregar `DROP TABLE IF EXISTS` |
| `PostgreSQL not running` | Servicio caido | `wsl ... sudo systemctl start postgresql` (DEV) o `sudo systemctl start postgresql` (PROD) |
| `permission denied` | Falta permisos | Verificar 99-post-ddl-permissions.sql |
| `new row violates row-level security` | Falta BYPASSRLS | Usar force-recreate-all.sh |

---

## Referencias

- `@SIMCO-RECREAR-BD` — **SSOT completo** de recreacion de BD (DEV y PROD)
- `@SIMCO-DDL` — Flujo DDL-First completo
- `@WSL-OPS` — Operaciones en WSL (SIMCO-LOCAL-WSL.md)
- `@AMBIENTES` — Diferencias DEV vs PROD

---

*TRIGGER-DDL-RECREAR-BD-WSL v2.0.0 - Sistema SIMCO v4.0.0*
