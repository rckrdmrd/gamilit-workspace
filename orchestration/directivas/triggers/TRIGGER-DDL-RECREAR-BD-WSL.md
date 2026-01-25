# TRIGGER: DDL Cambios -> Recrear BD en WSL

**ID:** TRIGGER-DDL-RECREAR-BD-WSL
**Version:** 1.0.0
**Fecha:** 2026-01-24
**Aplica a:** Todos los agentes que modifiquen archivos DDL

---

## Proposito

Este trigger asegura que cuando un agente modifica archivos DDL, la base de datos en WSL se recree para reflejar los cambios.

---

## Contexto Arquitectura Local

```
┌────────────────────────────────────────────────────────────────────────┐
│                         ECOSISTEMA DE WORKSPACES                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  WORKSPACE-BOOTSTRAP              WORKSPACE-INFRA                       │
│  C:\Empresas\ISEM\workspace-      /home/developer/workspaces/           │
│  bootstrap                         workspace-infra (nativo WSL)         │
│  ┌─────────────────────┐          ┌─────────────────────────┐          │
│  │  RESPONSABILIDAD:   │          │  RESPONSABILIDAD:       │          │
│  │  Crear WSL nuevo    │          │  Gestionar WSL existente│          │
│  │  Configurar inicial │   ───>   │  Scripts de recreacion  │          │
│  │  Instalar servicios │          │  Definiciones de BDs    │          │
│  └─────────────────────┘          │  (FUENTE DE VERDAD)     │          │
│                                    └─────────────────────────┘          │
│                                             │                           │
│                                             │ PostgreSQL :5432          │
│                                             │ Redis :6379               │
│                                             ▼                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                      WSL Ubuntu-24.04                             │  │
│  │  Usuario: developer | Password: developer_wsl_2026               │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐              │  │
│  │  │ PostgreSQL   │ │    Redis     │ │    Nginx     │              │  │
│  │  │   :5432      │ │    :6379     │ │     :80      │              │  │
│  │  └──────────────┘ └──────────────┘ └──────────────┘              │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                             ▲                           │
│                                             │ DDL Files                 │
│                                             │                           │
│  WORKSPACE-V2                                                           │
│  C:\Empresas\ISEM\workspace-v2                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  projects/{proyecto}/database/ddl/*.sql                          │  │
│  │  RESPONSABILIDAD: Codigo fuente (DDL, Backend, Frontend)         │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                         │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Regla Critica

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   SI MODIFICASTE UN ARCHIVO DDL → DEBES RECREAR LA BD EN WSL             ║
║                                                                           ║
║   Flujo obligatorio:                                                      ║
║                                                                           ║
║   1. Modificar archivo .sql en projects/{proyecto}/database/ddl/         ║
║   2. Recrear BD en WSL (ver procedimiento abajo)                         ║
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

### Paso 1: Identificar Base de Datos Afectada

| Proyecto | Base de Datos | Usuario | Password |
|----------|---------------|---------|----------|
| gamilit | gamilit_platform | gamilit_user | gamilit_dev_2026 |
| erp-core | erp_generic | erp_admin | erp_dev_2026 |
| template-saas | template_saas_dev | template_saas_user | saas_dev_2026 |
| michangarrito | michangarrito_dev | michangarrito_dev | mch_dev_2026 |

### Paso 2: Recrear Base de Datos (SCRIPT UNIFICADO)

```powershell
# SIEMPRE usar el script unificado - funciona para TODOS los proyectos
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' {proyecto} --drop

# Ejemplos:
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' gamilit --drop
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' template-saas --drop
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' erp-core --drop

# Con seeds de desarrollo:
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' {proyecto} --drop --seeds

# Solo validar estructura (sin ejecutar):
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/scripts/database/unified-recreate-db.sh' {proyecto} --validate-only
```

> **NOTA:** El script unificado detecta automáticamente la estructura del proyecto
> (database/ o apps/database/) y lee credenciales desde WORKSPACE-INTEGRATION.yml.
> Ver `@SIMCO-DDL-UNIFIED` para documentación completa.

### Paso 3: Verificar Carga

```powershell
# Verificar que no hay errores
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database} -c "\dt *.*"

# Verificar estructura de tabla modificada
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database} -c "\d {schema}.{tabla}"
```

---

## Cuando Consultar workspace-infra

Consultar `C:\Empresas\ISEM\workspace-infra` (o `/home/developer/workspaces/workspace-infra` en WSL) cuando:

- Necesitas ver la definicion oficial de una base de datos
- Hay inconsistencias en credenciales
- Necesitas scripts avanzados de recreacion
- Quieres verificar la configuracion de PostgreSQL/Redis

**Archivo clave:** `workspace-infra/services/postgresql/databases.yml`

---

## Cuando Consultar workspace-bootstrap

Consultar `C:\Empresas\ISEM\workspace-bootstrap` cuando:

- El ambiente WSL esta corrupto y necesita recrearse
- Faltan servicios (PostgreSQL, Redis, Node)
- Necesitas reinstalar Claude Code en WSL
- El usuario developer no funciona

**Archivo clave:** `workspace-bootstrap/config/bootstrap.yaml`

---

## Errores Comunes

| Error | Causa | Solucion |
|-------|-------|----------|
| `FATAL: database does not exist` | BD no creada | Crear BD primero |
| `FATAL: password authentication failed` | Credenciales incorrectas | Verificar en @WORKSPACE-INTEGRATION |
| `relation already exists` | DDL sin DROP previo | Agregar `DROP TABLE IF EXISTS` |
| `PostgreSQL not running` | Servicio caido | `wsl ... sudo systemctl start postgresql` |
| `permission denied` | Falta sudo | Usar `sudo -u postgres` |

---

## Referencias

- `@SIMCO-DDL` - Flujo DDL-First completo
- `@WSL-OPS` - Operaciones en WSL
- `@WORKSPACE-INTEGRATION` - Credenciales y mapa de workspaces
- `@RECREAR-DB` - Procedimiento oficial de recreacion

---

*TRIGGER-DDL-RECREAR-BD-WSL v1.0.0 - Sistema SIMCO v4.0.0*
