# RECREATE-DB-GUIDE.md - Guia Unificada para Recreacion de Bases de Datos

**Version:** 1.0.0
**Fecha:** 2026-01-20
**Alias:** `@RECREAR-DB`

---

## FUENTE DE VERDAD

Todas las credenciales y configuraciones estan centralizadas en:

```
orchestration/inventarios/WORKSPACE-INTEGRATION.yml
```

**REGLA CRITICA:** Antes de ejecutar cualquier script de BD, verificar credenciales en WORKSPACE-INTEGRATION.yml

---

## CREDENCIALES OFICIALES DE DESARROLLO

| Proyecto | Database | Usuario | Password | Puerto |
|----------|----------|---------|----------|--------|
| **gamilit** | gamilit_platform | gamilit_user | gamilit_dev_2026 | 5432 |
| **template-saas** | template_saas_dev | template_saas_user | saas_dev_2026 | 5432 |
| **erp-core** | erp_generic | erp_admin | erp_dev_2026 | 5432 |
| **michangarrito** | michangarrito_dev | michangarrito_dev | mch_dev_2026 | 5432 |

**Password WSL sudo:** `developer_wsl_2026`

---

## PROCEDIMIENTO GENERAL

### Paso 1: Verificar PostgreSQL

```powershell
# Desde Windows PowerShell
wsl -d Ubuntu-24.04 -u developer -- sudo -S systemctl status postgresql <<< "developer_wsl_2026"
```

Resultado esperado: `active (running)`

### Paso 2: Verificar Base de Datos Existe

```powershell
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -c "SELECT datname FROM pg_database WHERE datistemplate = false;"
```

### Paso 3: Probar Conexion con Credenciales

```powershell
# Ejemplo para gamilit
wsl -d Ubuntu-24.04 -u developer -- bash -c "PGPASSWORD='gamilit_dev_2026' psql -h localhost -p 5432 -U gamilit_user -d gamilit_platform -c 'SELECT 1;'"
```

---

## RECREACION POR PROYECTO

### GAMILIT

**Script principal:** `projects/gamilit/apps/database/scripts/force-recreate-all.sh`

```bash
# Desde WSL
cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit/apps/database/scripts
./force-recreate-all.sh
```

**Alternativa con variables de entorno:**
```bash
export GAMILIT_DB_PASSWORD="gamilit_dev_2026"
./init-database.sh --env dev
```

**DDL ubicacion:** `projects/gamilit/apps/database/ddl/`

---

### TEMPLATE-SAAS

**Script principal:** `projects/template-saas/database/scripts/drop-and-recreate.sh`

```bash
# Desde WSL
cd /mnt/c/Empresas/ISEM/workspace-v2/projects/template-saas/database/scripts

# Opcion 1: Con variables de entorno explicitas
DB_NAME=template_saas_dev \
DB_USER=template_saas_user \
DB_PASSWORD=saas_dev_2026 \
./drop-and-recreate.sh

# Opcion 2: El script usa defaults correctos
./drop-and-recreate.sh
```

**DDL ubicacion:** `projects/template-saas/database/ddl/`

---

### ERP-CORE

**Script principal:** `projects/erp-core/database/scripts/recreate-database.sh`

```bash
# Desde WSL
cd /mnt/c/Empresas/ISEM/workspace-v2/projects/erp-core/database/scripts

# Opcion 1: Con variables de entorno explicitas
DB_NAME=erp_generic \
DB_USER=erp_admin \
DB_PASSWORD=erp_dev_2026 \
./recreate-database.sh --drop --seeds

# Opcion 2: El script usa defaults correctos
./recreate-database.sh --drop --seeds
```

**DDL ubicacion:** `projects/erp-core/database/ddl/`

---

## RECREACION MANUAL (SQL DIRECTO)

Si los scripts fallan, usar este procedimiento manual:

### 1. Conectar como postgres

```bash
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql
```

### 2. Terminar conexiones y eliminar BD

```sql
-- Reemplazar {database_name} y {db_user} con valores del proyecto

-- Terminar conexiones existentes
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = '{database_name}' AND pid <> pg_backend_pid();

-- Eliminar base de datos
DROP DATABASE IF EXISTS {database_name};

-- Eliminar usuario (opcional, si quieres recrearlo)
DROP USER IF EXISTS {db_user};
```

### 3. Recrear usuario y BD

```sql
-- Crear usuario
CREATE USER {db_user} WITH PASSWORD '{password}';

-- Crear base de datos
CREATE DATABASE {database_name} OWNER {db_user};

-- Conectar a la nueva BD
\c {database_name}

-- Crear extensiones
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- Otorgar permisos
GRANT ALL PRIVILEGES ON DATABASE {database_name} TO {db_user};
GRANT ALL PRIVILEGES ON SCHEMA public TO {db_user};
```

### 4. Cargar DDL

```bash
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql -d {database_name} -f '/mnt/c/Empresas/ISEM/workspace-v2/projects/{proyecto}/database/ddl/{archivo}.sql'
```

---

## EJEMPLOS COMPLETOS

### Ejemplo: Recrear gamilit_platform desde cero

```bash
# 1. Conectar como postgres
wsl -d Ubuntu-24.04 -u developer -- sudo -u postgres psql

# 2. Ejecutar SQL
```

```sql
-- Terminar conexiones
SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'gamilit_platform';

-- Eliminar y recrear
DROP DATABASE IF EXISTS gamilit_platform;
DROP USER IF EXISTS gamilit_user;

CREATE USER gamilit_user WITH PASSWORD 'gamilit_dev_2026';
CREATE DATABASE gamilit_platform OWNER gamilit_user;

\c gamilit_platform

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

GRANT ALL PRIVILEGES ON DATABASE gamilit_platform TO gamilit_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO gamilit_user;

\q
```

```bash
# 3. Cargar DDL
cd /mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit/apps/database
./scripts/init-database.sh --env dev
```

---

## TROUBLESHOOTING

### Error: "password authentication failed"

**Causa:** Password incorrecto en archivo .env o script

**Solucion:**
1. Verificar credenciales en `WORKSPACE-INTEGRATION.yml`
2. Verificar que los archivos .env tienen las credenciales correctas
3. Si persiste, recrear el usuario:

```sql
ALTER USER {db_user} WITH PASSWORD '{password_correcto}';
```

### Error: "database does not exist"

**Causa:** La base de datos no existe

**Solucion:**
```sql
CREATE DATABASE {database_name} OWNER {db_user};
```

### Error: "role does not exist"

**Causa:** El usuario no existe

**Solucion:**
```sql
CREATE USER {db_user} WITH PASSWORD '{password}';
```

### Error: "connection refused on port 5433"

**Causa:** Script usa puerto incorrecto (5433 en lugar de 5432)

**Solucion:**
1. El puerto correcto es **5432**
2. Verificar que el script use: `DB_PORT=5432`
3. Si el script esta hardcodeado con 5433, corregirlo

### Error: PostgreSQL no esta corriendo

**Solucion:**
```bash
wsl -d Ubuntu-24.04 -u developer -- sudo systemctl start postgresql
```

---

## SCRIPTS DISPONIBLES POR PROYECTO

| Proyecto | Script | Descripcion |
|----------|--------|-------------|
| **gamilit** | force-recreate-all.sh | Elimina y recrea todo |
| **gamilit** | init-database.sh | Inicializa BD existente |
| **gamilit** | recreate-database.sh | Wrapper de recreacion |
| **template-saas** | create-database.sh | Crea BD nueva |
| **template-saas** | drop-and-recreate.sh | Elimina y recrea |
| **erp-core** | recreate-database.sh | Elimina y recrea |

---

## VALIDACION POST-RECREACION

Despues de recrear, validar:

```bash
# 1. Verificar conexion
PGPASSWORD='{password}' psql -h localhost -p 5432 -U {user} -d {database} -c "SELECT current_database(), current_user;"

# 2. Verificar tablas creadas
PGPASSWORD='{password}' psql -h localhost -p 5432 -U {user} -d {database} -c "\dt"

# 3. Verificar extensiones
PGPASSWORD='{password}' psql -h localhost -p 5432 -U {user} -d {database} -c "SELECT extname FROM pg_extension;"
```

---

## REFERENCIAS

- `@WORKSPACE-INTEGRATION` - Fuente de verdad de credenciales
- `@WSL-ENV` - Configuracion del ambiente WSL
- `@FUENTE-VERDAD-DB` - workspace-infra databases.yml
- `@WSL-OPS` - Operaciones en WSL

---

*Documento generado: 2026-01-20*
*Autor: Claude Opus 4.5*
