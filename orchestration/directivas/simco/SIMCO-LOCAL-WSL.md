# SIMCO-LOCAL-WSL.md

> Directiva para operaciones en el ambiente de desarrollo local WSL

## Metadata

| Campo | Valor |
|-------|-------|
| **Version** | 2.0.0 |
| **Tipo** | Operacional |
| **Alcance** | Ambiente Local WSL |
| **Prioridad** | Alta |
| **Actualizado** | 2026-02-11 |

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
sudo <comando>
```

---

## Contexto del Ambiente

```
┌─────────────────────────────────────────────────────────────────────┐
│                         WINDOWS HOST                                 │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │ C:\Empresas\ISEM\gamilit-workspace  (Monorepo standalone)    │  │
│  │   apps/backend     NestJS 11                                  │  │
│  │   apps/frontend    React 19                                   │  │
│  │   apps/database    DDL + seeds + scripts                      │  │
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
║   wsl -d Ubuntu-24.04 -u developer -- <cmd>                             ║
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

| Base de Datos | Usuario | Password | Puerto | Redis DB |
|---------------|---------|----------|--------|----------|
| gamilit_platform | gamilit_user | gamilit_dev_2026 | 5432 | 0 |

### Recrear Base de Datos

```powershell
# Usar scripts del monorepo — ver @SIMCO-RECREAR-BD para procedimiento completo

# Recrear completo (DROP user + BD + init)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force

# Reset rapido (mantiene usuario)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/reset-database.sh' --env dev --password 'gamilit_dev_2026' --force

# Init (primera vez)
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/init-database.sh' --env dev --force
```

### Cargar Archivo DDL Individual

```powershell
# Cargar un archivo DDL especifico de gamilit
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d gamilit_platform -f '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/ddl/00-prerequisites.sql'
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
| `C:\Empresas\ISEM\gamilit-workspace` | `/mnt/c/Empresas/ISEM/gamilit-workspace` |

### Conversion de Rutas

```powershell
# Windows a WSL: Reemplazar C:\ por /mnt/c/ y \ por /
# Ejemplo: C:\Empresas\ISEM\gamilit-workspace\apps\database\ddl
#       -> /mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/ddl
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
# Los DDL estan en: gamilit-workspace/apps/database/ddl/
# Usar scripts de recreacion en vez de psql manual — ver @SIMCO-RECREAR-BD

# Recrear completo
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/gamilit-workspace/apps/database/scripts/recreate-database.sh' --env dev --force
```

### Patron 3: Backup y Restore

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
| Recrear BD (SSOT) | `@SIMCO-RECREAR-BD` (orchestration/directivas/simco/SIMCO-RECREAR-BD.md) |
| Inventario BD | `orchestration/inventarios/DATABASE_INVENTORY.yml` |
| Flujo DDL | `@SIMCO-DDL` (orchestration/directivas/simco/SIMCO-DDL.md) |
| Ambientes | `@AMBIENTES` (docs/20-architecture/AMBIENTES-DEV-PROD.md) |

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

*SIMCO-LOCAL-WSL v2.0.0 - Sistema SIMCO v4.0.0*
