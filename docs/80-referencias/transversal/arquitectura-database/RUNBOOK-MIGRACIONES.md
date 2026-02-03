# RUNBOOK: Migraciones de Base de Datos

**Proyecto:** GAMILIT Platform
**Version:** 3.5
**Fecha:** 2025-12-26
**Generado por:** Requirements-Analyst

---

## 1. RESUMEN

Este runbook documenta los procedimientos para inicializar, migrar y mantener la base de datos PostgreSQL de GAMILIT.

| Ambiente | Host | Base de Datos | Usuario |
|----------|------|---------------|---------|
| DEV | localhost:5432 | gamilit_platform | gamilit_user |
| PROD | localhost:5432 | gamilit_platform | gamilit_user |

---

## 2. PRE-REQUISITOS

### 2.1 Software Requerido

```bash
# PostgreSQL 16+
psql --version

# OpenSSL (para generacion de passwords)
openssl version

# Acceso sudo (para operaciones como postgres)
sudo -v
```

### 2.2 Estructura de Directorios

```
apps/database/
├── ddl/
│   ├── 00-prerequisites.sql    # ENUMs base y funciones utilitarias
│   ├── 99-post-ddl-permissions.sql  # Permisos para 16 schemas
│   └── schemas/
│       ├── auth/
│       ├── auth_management/
│       ├── gamification_system/
│       ├── educational_content/
│       ├── notifications/
│       ├── communication/
│       ├── lti_integration/
│       └── ... (16 schemas total)
├── seeds/
│   ├── dev/
│   └── prod/
└── scripts/
    ├── init-database.sh        # Script principal
    ├── manage-secrets.sh       # Gestion de credenciales
    ├── reset-database.sh       # Reset completo
    └── recreate-database.sh    # Recrear sin perder datos
```

---

## 3. INICIALIZACION COMPLETA

### 3.1 Flujo Recomendado (dotenv-vault)

```bash
cd apps/database/scripts

# Paso 1: Generar secrets
./manage-secrets.sh generate --env dev
./manage-secrets.sh sync --env dev

# Paso 2: Inicializar BD (lee automaticamente de vault)
./init-database.sh --env dev
```

### 3.2 Flujo con Password Manual

```bash
# Opcion A: Password exportado
./manage-secrets.sh export --env prod
source /tmp/gamilit-db-secrets-prod.sh
./init-database.sh --env prod --use-exported-password

# Opcion B: Password manual (no recomendado)
./init-database.sh --env prod --password "password_seguro_32chars"
```

### 3.3 Pasos de Inicializacion (9 pasos)

| Paso | Descripcion | Tiempo Estimado |
|------|-------------|-----------------|
| 1/9 | Crear usuario y base de datos | ~5 seg |
| 2/9 | Ejecutar DDL (ENUMs, schemas, tablas) | ~30 seg |
| 3/9 | Ejecutar funciones | ~10 seg |
| 4/9 | Ejecutar vistas | ~5 seg |
| 5/9 | Ejecutar vistas materializadas | ~5 seg |
| 6/9 | Ejecutar indices | ~60 seg |
| 7/9 | Ejecutar triggers | ~10 seg |
| 8/9 | Ejecutar RLS policies | ~10 seg |
| 9/9 | Cargar seeds | ~30 seg |

**Total aproximado:** 2-3 minutos

---

## 4. MIGRACIONES INCREMENTALES

### 4.1 Agregar Nuevas Tablas

1. Crear archivo SQL en el schema correspondiente:
   ```bash
   # Ejemplo: nueva tabla en gamification_system
   touch apps/database/ddl/schemas/gamification_system/tables/XX-new_table.sql
   ```

2. Seguir convencion de numeracion:
   - `01-` a `09-`: Tablas core sin dependencias
   - `10-` a `19-`: Tablas con FK a core
   - `20+`: Tablas con FK complejas

3. Ejecutar manualmente o reinicializar:
   ```bash
   # Opcion A: Ejecutar solo el archivo nuevo
   PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform -f path/to/new_table.sql

   # Opcion B: Reinicializar (desarrollo)
   ./init-database.sh --env dev --force
   ```

### 4.2 Agregar Nuevas Funciones

```bash
# 1. Crear archivo en schema/functions/
touch apps/database/ddl/schemas/gamification_system/functions/new_function.sql

# 2. Ejecutar
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform -f path/to/new_function.sql
```

### 4.3 Agregar Nuevos Triggers

```bash
# 1. Asegurar que la funcion trigger existe primero
# 2. Crear archivo en schema/triggers/
touch apps/database/ddl/schemas/gamification_system/triggers/new_trigger.sql

# 3. Ejecutar
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform -f path/to/new_trigger.sql
```

---

## 5. PROCEDIMIENTOS DE ROLLBACK

### 5.1 Rollback de Tabla

```sql
-- 1. Respaldar datos si es necesario
CREATE TABLE backup_table AS SELECT * FROM schema.table_to_drop;

-- 2. Eliminar tabla
DROP TABLE IF EXISTS schema.table_to_drop CASCADE;

-- 3. Restaurar si es necesario
CREATE TABLE schema.original_table AS SELECT * FROM backup_table;
```

### 5.2 Rollback de Funcion

```sql
-- Eliminar funcion
DROP FUNCTION IF EXISTS schema.function_name(param_types) CASCADE;
```

### 5.3 Rollback de Trigger

```sql
-- Eliminar trigger (la funcion puede quedarse)
DROP TRIGGER IF EXISTS trigger_name ON schema.table_name;
```

### 5.4 Rollback Completo

```bash
# PELIGRO: Esto elimina TODA la base de datos
./reset-database.sh --env dev --force

# Reinicializar desde cero
./init-database.sh --env dev
```

---

## 6. BACKUP Y RESTORE

### 6.1 Backup Completo

```bash
# Backup con pg_dump
PGPASSWORD=xxx pg_dump -h localhost -U gamilit_user -d gamilit_platform \
  --format=custom \
  --file=backup_$(date +%Y%m%d_%H%M%S).dump

# Backup solo schema (sin datos)
PGPASSWORD=xxx pg_dump -h localhost -U gamilit_user -d gamilit_platform \
  --schema-only \
  --file=schema_$(date +%Y%m%d_%H%M%S).sql
```

### 6.2 Restore

```bash
# Restore completo
PGPASSWORD=xxx pg_restore -h localhost -U gamilit_user -d gamilit_platform \
  --clean --if-exists \
  backup_20251226_120000.dump
```

---

## 7. TROUBLESHOOTING

### 7.1 Error: "permission denied"

```bash
# Solucion: Otorgar permisos como postgres
sudo -u postgres psql -d gamilit_platform -c "
  GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA schema_name TO gamilit_user;
  GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA schema_name TO gamilit_user;
  GRANT ALL PRIVILEGES ON ALL FUNCTIONS IN SCHEMA schema_name TO gamilit_user;
"
```

### 7.2 Error: "relation already exists"

```bash
# Solucion: Usar IF NOT EXISTS o reinicializar
./init-database.sh --env dev --force
```

### 7.3 Error: "foreign key constraint"

```sql
-- Verificar dependencias antes de eliminar
SELECT
  tc.table_schema,
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_schema AS foreign_table_schema,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'table_to_check';
```

### 7.4 Error: "trigger function does not exist"

```bash
# Solucion: Ejecutar funciones antes que triggers
# Verificar orden en init-database.sh (Paso 3 antes de Paso 7)
```

---

## 8. VALIDACION POST-MIGRACION

### 8.1 Verificar Objetos Creados

```bash
# Script de validacion integrado
PGPASSWORD=xxx psql -h localhost -U gamilit_user -d gamilit_platform << 'EOF'
SELECT 'Schemas' as tipo, COUNT(*) as cantidad FROM information_schema.schemata
  WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
UNION ALL
SELECT 'Tablas', COUNT(*) FROM pg_tables
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'Funciones', COUNT(*) FROM information_schema.routines
  WHERE routine_schema NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'Triggers', COUNT(*) FROM information_schema.triggers
  WHERE trigger_schema NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'Indices', COUNT(*) FROM pg_indexes
  WHERE schemaname NOT IN ('pg_catalog', 'information_schema')
UNION ALL
SELECT 'RLS Policies', COUNT(*) FROM pg_policies;
EOF
```

### 8.2 Metricas Esperadas (v3.5)

| Objeto | Cantidad Minima |
|--------|-----------------|
| Schemas | 12 |
| Tablas | 100+ |
| Funciones | 50+ |
| Triggers | 40+ |
| Indices | 200+ |
| RLS Policies | 100+ |

---

## 9. SCRIPTS DISPONIBLES

| Script | Proposito | Uso |
|--------|-----------|-----|
| `init-database.sh` | Inicializacion completa | `--env dev/prod` |
| `manage-secrets.sh` | Gestion de credenciales | `generate/sync/export --env` |
| `reset-database.sh` | Eliminar y recrear BD | `--env dev --force` |
| `recreate-database.sh` | Recrear preservando config | `--env dev` |
| `validate-ddl-organization.sh` | Validar estructura DDL | (sin params) |
| `verify-users.sh` | Verificar usuarios seed | (sin params) |
| `load-users-and-profiles.sh` | Cargar usuarios manualmente | `--env dev` |

---

## 10. CONTACTOS

| Rol | Contacto |
|-----|----------|
| DBA | isem@gamilit.com |
| Backend Lead | dev@gamilit.com |
| DevOps | ops@gamilit.com |

---

## 11. HISTORIAL DE CAMBIOS

| Version | Fecha | Cambio |
|---------|-------|--------|
| 3.5 | 2025-12-26 | Sincronizacion automatica .env |
| 3.4 | 2025-12-26 | Carga de 19 ENUMs adicionales |
| 3.0 | 2025-12 | Integracion dotenv-vault |
| 2.0 | 2025-11 | Soporte multi-ambiente |
| 1.0 | 2025-10 | Version inicial |

---

**Generado por:** Requirements-Analyst - GAMILIT
