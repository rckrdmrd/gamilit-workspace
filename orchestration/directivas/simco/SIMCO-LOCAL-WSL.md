# SIMCO-LOCAL-WSL.md

> Directiva para operaciones en el ambiente de desarrollo local WSL

## Metadata

| Campo | Valor |
|-------|-------|
| **Version** | 1.0.0 |
| **Tipo** | Operacional |
| **Alcance** | Ambiente Local WSL |
| **Prioridad** | Alta |
| **Actualizado** | 2026-01-20 |

---

## Proposito

Esta directiva define como los agentes deben operar con el ambiente de desarrollo local montado en **WSL Ubuntu-24.04**. Incluye comandos, patrones y ejemplos para:

- Ejecutar comandos en WSL desde Windows
- Gestionar bases de datos PostgreSQL
- Operar servicios de infraestructura
- Cargar DDL y seeds
- Ejecutar pruebas

---

## Credenciales de Acceso WSL

```
╔══════════════════════════════════════════════════════════════════════════╗
║                    CREDENCIALES WSL UBUNTU-24.04                          ║
╠══════════════════════════════════════════════════════════════════════════╣
║  Usuario:    developer                                                    ║
║  Password:   developer_wsl_2026                                           ║
║  Sudo:       SI (con password)                                            ║
║  Home:       /home/developer                                              ║
╚══════════════════════════════════════════════════════════════════════════╝
```

**Uso de sudo:**
```bash
# El password es requerido para comandos sudo
echo "developer_wsl_2026" | sudo -S <comando>

# O usando sudo interactivo (pedira password)
│  │  │   Docker    │  │     PM2     │  │ Claude Code │           │  │
```

---

## Contexto del Ambiente

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WINDOWS HOST                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ C:\Empresas\ISEM\workspace-v2    (Codigo fuente)              │  │
│  │ C:\Empresas\ISEM\workspace-bootstrap (Bootstrap)              │  │
│  └───────────────────────────────────────────────────────────────┘  │
│                              │                                       │
│                              │ /mnt/c/...                           │
│                              ▼                                       │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    WSL Ubuntu-24.04                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │ PostgreSQL  │  │    Redis    │  │    Nginx    │           │  │
│  │  │   :5432     │  │    :6379    │  │     :80     │           │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐           │  │
│  │  │   Docker    │  │     PM2     │  │ Auto Mode   │           │  │
│  │  │   :2375     │  │   global    │  │    CLI      │           │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘           │  │
│  │                                                               │  │
│  │  /home/developer/workspaces/workspace-infra (Infraestructura)│  │
│  └───────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Regla Critica: Ejecutar Comandos en WSL

```
╔══════════════════════════════════════════════════════════════════════════╗
║                                                                           ║
║   DESDE WINDOWS (PowerShell/CMD):                                         ║
║                                                                           ║
║   powershell.exe -Command "wsl -d Ubuntu-24.04 -u developer -- <cmd>"    ║
║                                                                           ║
║   IMPORTANTE:                                                             ║
║   - Usar -d Ubuntu-24.04 para especificar la distribucion                ║
║   - Usar -u developer para ejecutar como usuario de desarrollo           ║
║   - Usar -- antes del comando a ejecutar                                 ║
║   - Para comandos complejos: wsl ... -- bash -c '<script>'               ║
║                                                                           ║
╚══════════════════════════════════════════════════════════════════════════╝
```

---

## Operaciones de Base de Datos

### Conectar a PostgreSQL

```powershell
# Conectar como postgres (admin)
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql

# Conectar a base de datos especifica
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform

# Ejecutar query
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "SELECT * FROM information_schema.tables LIMIT 5;"
```

### Credenciales de Desarrollo

| Base de Datos | Usuario | Password | Redis DB |
|---------------|---------|----------|----------|
| gamilit_platform | gamilit_user | gamilit_dev_2026 | 0 |
| erp_generic | erp_admin | erp_dev_2026 | 2 |
| template_saas_dev | template_saas_user | saas_dev_2026 | 9 |
| michangarrito_dev | michangarrito_dev | mch_dev_2026 | 8 |

### Cargar Archivos DDL

```powershell
# Patron general
powershell.exe -Command "wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d <database> -f '<path_wsl>'"

# Ejemplo: Cargar DDL de gamilit
powershell.exe -Command "wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -f '/mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit/apps/database/ddl/00-prerequisites.sql'"

# Ejemplo: Cargar DDL de erp-core
powershell.exe -Command "wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d erp_generic -f '/mnt/c/Empresas/ISEM/workspace-v2/projects/erp-core/docs/04-modelado/database-design/schemas/02-auth-schema.sql'"
```

### Crear Nueva Base de Datos

```powershell
# Crear usuario
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -c "CREATE USER nuevo_user WITH PASSWORD 'password123';"

# Crear base de datos
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres createdb -O nuevo_user nueva_db

# Otorgar permisos
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE nueva_db TO nuevo_user;"
```

### Listar Bases de Datos y Schemas

```powershell
# Listar bases de datos
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -c "\l"

# Listar schemas de una base
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dn"

# Listar tablas
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -c "\dt *.*"
```

---

## Gestion de Servicios

### Verificar Estado

```powershell
# PostgreSQL
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status postgresql --no-pager

# Redis
wsl -d Ubuntu-24.04 -u developer -- redis-cli ping

# Nginx
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status nginx --no-pager

# Docker
wsl -d Ubuntu-24.04 -u developer -- docker --version
```

### Iniciar/Detener Servicios

```powershell
# Iniciar PostgreSQL
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl start postgresql

# Detener Redis
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl stop redis-server

# Reiniciar Nginx
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl restart nginx
```

### Ver Logs

```powershell
# Logs de PostgreSQL
wsl -d Ubuntu-24.04 -u developer -- sudo journalctl -u postgresql --no-pager -n 50

# Logs de Nginx
wsl -d Ubuntu-24.04 -u developer -- sudo tail -50 /var/log/nginx/error.log
```

---

## Mapeo de Rutas

| Windows | WSL |
|---------|-----|
| `C:\Empresas\ISEM\workspace-v2` | `/mnt/c/Empresas/ISEM/workspace-v2` |
| `C:\Empresas\ISEM\workspace-bootstrap` | `/mnt/c/Empresas/ISEM/workspace-bootstrap` |
| N/A (nativo WSL) | `/home/developer/workspaces/workspace-infra` |

### Conversion de Rutas

```powershell
# Windows a WSL: Reemplazar C:\ por /mnt/c/ y \ por /
# Ejemplo: C:\Empresas\ISEM\workspace-v2\projects\gamilit
#       -> /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit
```

---

## workspace-infra

El repositorio de infraestructura esta clonado en WSL:

```
/home/developer/workspaces/workspace-infra/
├── databases/
│   ├── schemas/     # Schemas de BD
│   └── scripts/     # Scripts de BD
├── deploy/
│   ├── docker/      # Configs Docker
│   └── pipelines/   # CI/CD pipelines
└── services/
    ├── postgresql/  # Config PostgreSQL
    ├── redis/       # Config Redis
    ├── nginx/       # Config Nginx
    └── ...
```

### Usar Scripts de Infraestructura

```powershell
# Acceder al directorio
wsl -d Ubuntu-24.04 -u developer -- ls -la /home/developer/workspaces/workspace-infra/

# Ejecutar script de infraestructura
wsl -d Ubuntu-24.04 -u developer -- bash /home/developer/workspaces/workspace-infra/scripts/example.sh
```

---

## Patrones para Agentes

### Patron 1: Verificar Ambiente Antes de Operar

```powershell
# Verificar que WSL esta corriendo
wsl -l -v

# Verificar servicios
wsl -d Ubuntu-24.04 -u developer -- bash -c 'systemctl is-active postgresql && redis-cli ping'
```

### Patron 2: Ejecutar DDL de Proyecto

```powershell
# 1. Identificar archivos DDL
# Los DDL estan en: workspace-v2/projects/<proyecto>/database/ddl/ o apps/database/ddl/

# 2. Ejecutar en orden
# Primero schemas/prerequisitos, luego tablas, luego indexes, finalmente seeds
```

### Patron 3: Recrear Base de Datos

```powershell
# 1. Eliminar base existente
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres dropdb --if-exists nombre_db

# 2. Crear nueva base
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres createdb -O usuario nombre_db

# 3. Ejecutar DDL
# ... (ver patron 2)
```

### Patron 4: Backup y Restore

```powershell
# Backup
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres pg_dump gamilit_platform > /mnt/c/Empresas/ISEM/backups/gamilit_backup.sql

# Restore
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform < /mnt/c/Empresas/ISEM/backups/gamilit_backup.sql
```

---

## Troubleshooting

### WSL No Responde

```powershell
# Reiniciar WSL
wsl --shutdown
wsl -d Ubuntu-24.04
```

### PostgreSQL No Inicia

```powershell
# Verificar logs
wsl -d Ubuntu-24.04 -u developer -- sudo journalctl -u postgresql -n 100

# Verificar locale
wsl -d Ubuntu-24.04 -u developer -- locale -a | grep en_US

# Regenerar locale si falta
wsl -d Ubuntu-24.04 -u developer -- sudo locale-gen en_US.UTF-8
```

### Redis No Responde

```powershell
# Verificar estado
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl status redis-server

# Reiniciar
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl restart redis-server
```

---

## Referencias

| Referencia | Ubicacion |
|------------|-----------|
| Inventario WSL | `orchestration/inventarios/LOCAL-WSL-ENVIRONMENT.yml` |
| Inventario BD | `orchestration/inventarios/DATABASE_INVENTORY.yml` |
| DevEnv Master | `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml` |
| Bootstrap Docs | `../../../workspace-bootstrap/orchestration/` |

---

## Registro de Operaciones

Los agentes deben registrar operaciones significativas en sus trazas:

```yaml
operacion_wsl:
  timestamp: "ISO8601"
  tipo: "ddl|servicio|query|backup"
  comando: "<comando ejecutado>"
  resultado: "exitoso|fallido"
  notas: "<observaciones>"
```

---

*SIMCO-LOCAL-WSL v1.0.0 - Sistema SIMCO v4.0.0*
