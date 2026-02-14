# Guía: Crear Base de Datos Gamilit

**Fecha**: 2025-11-08
**Versión**: 1.0
**Estado**: ✅ Listo para usar

---

## Descripción

Este directorio contiene todos los archivos DDL (Data Definition Language) necesarios para crear la base de datos completa de Gamilit desde cero.

---

## Estructura de Archivos

```
apps/database/
├── create-database.sh          ← Script maestro de creación
├── 00-prerequisites.sql        ← Schemas y ENUMs base
├── ddl/
│   └── schemas/
│       ├── auth/               ← Autenticación base
│       ├── auth_management/    ← Gestión de usuarios
│       ├── educational_content/← Contenido educativo
│       ├── gamification_system/← Sistema de gamificación
│       ├── progress_tracking/  ← Seguimiento de progreso
│       ├── social_features/    ← Características sociales
│       ├── content_management/ ← Gestión de contenido
│       ├── audit_logging/      ← Auditoría y logs
│       ├── system_configuration/← Configuración
│       ├── admin_dashboard/    ← Dashboard administrativo
│       ├── gamilit/            ← Funciones compartidas
│       └── storage/            ← Storage del sistema
└── migrations/                 ← Migraciones de BD
```

---

## Requisitos Previos

### 1. PostgreSQL 14 o superior

```bash
# Verificar versión instalada
psql --version
```

### 2. Base de datos creada

```bash
# Crear base de datos local
createdb gamilit
```

### 3. Variable DATABASE_URL configurada

```bash
# Formato para PostgreSQL local
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit"
```

---

## Método 1: Script Automático (Recomendado)

### Opción A: Usando variable de entorno

```bash
# 1. Configurar DATABASE_URL
export DATABASE_URL="postgresql://usuario:password@localhost:5432/gamilit"

# 2. Ejecutar script
cd apps/database
./create-database.sh
```

### Opción B: Pasando URL como argumento

```bash
cd apps/database
./create-database.sh "postgresql://usuario:password@localhost:5432/gamilit"
```

### Salida Esperada

```
============================================================================
INICIO: Creación de Base de Datos Gamilit
============================================================================
DATABASE_URL: postgresql://localhost:5432/gamilit
DDL_DIR: /path/to/ddl
LOG_FILE: /path/to/create-database-20251108_143022.log

✅ Conexión exitosa a la base de datos

============================================================================
FASE 1: PREREQUISITES - Schemas y ENUMs
============================================================================
✅ Completado: Crear schemas y ENUMs base
✅ FASE 1 completada

============================================================================
FASE 2: FUNCIONES COMPARTIDAS
============================================================================
✅ Completado: Funciones compartidas (gamilit schema) (13 archivos)
✅ FASE 2 completada

... (continúa con todas las fases)

============================================================================
RESUMEN FINAL
============================================================================
Objetos creados:
  - Schemas: 13
  - Tablas: 63
  - ENUMs: 35
  - Funciones: 80
  - Triggers: 45

✅ BASE DE DATOS CREADA EXITOSAMENTE
============================================================================

Log completo disponible en: create-database-20251108_143022.log
```

---

## Método 2: Paso a Paso Manual

### 1. Ejecutar prerequisites

```bash
psql "$DATABASE_URL" -f ddl/00-prerequisites.sql
```

### 2. Ejecutar esquemas en orden

```bash
# Funciones compartidas
psql "$DATABASE_URL" -f ddl/schemas/gamilit/functions/*.sql

# Auth (sistema)
psql "$DATABASE_URL" -f ddl/schemas/auth/enums/*.sql
psql "$DATABASE_URL" -f ddl/schemas/auth/tables/*.sql

# Auth Management
psql "$DATABASE_URL" -f ddl/schemas/auth_management/tables/*.sql
psql "$DATABASE_URL" -f ddl/schemas/auth_management/triggers/*.sql
psql "$DATABASE_URL" -f ddl/schemas/auth_management/rls-policies/*.sql

# Educational Content
psql "$DATABASE_URL" -f ddl/schemas/educational_content/tables/*.sql
psql "$DATABASE_URL" -f ddl/schemas/educational_content/functions/*.sql
psql "$DATABASE_URL" -f ddl/schemas/educational_content/triggers/*.sql

# ... (continuar con otros schemas)
```

---

## Método 3: Aplicar Migraciones (Base de Datos Existente)

Si ya tienes una base de datos con el schema `public` legacy y quieres migrar a la nueva arquitectura:

### 1. Migrar ENUMs de public a schemas correctos

```bash
cd migrations

# P1: Alta Prioridad
psql "$DATABASE_URL" -f 2025-11-08-migrate-auth-provider-enum.sql
psql "$DATABASE_URL" -f 2025-11-08-migrate-notification-enums.sql

# P2: Media Prioridad
psql "$DATABASE_URL" -f 2025-11-08-migrate-difficulty-level-enum.sql
psql "$DATABASE_URL" -f 2025-11-08-migrate-content-management-enums.sql
psql "$DATABASE_URL" -f 2025-11-08-migrate-setting-type-enum.sql

# P3: Baja Prioridad (si aplica)
# ... migraciones adicionales
```

### 2. Aplicar otras migraciones

```bash
psql "$DATABASE_URL" -f 2025-11-08-add-fk-profiles-school.sql
```

---

## Orden de Ejecución (Fases)

El script `create-database.sh` ejecuta los archivos DDL en este orden:

| Fase | Schema | Componentes | Archivos |
|------|--------|-------------|----------|
| 1 | prerequisites | Schemas + ENUMs | 1 |
| 2 | gamilit | Funciones comunes | ~13 |
| 3 | auth | Tables + Enums | ~5 |
| 4 | storage | Enums | ~1 |
| 5 | auth_management | Tables + Functions + Triggers + RLS | ~25 |
| 6 | educational_content | Tables + Functions + Triggers + RLS | ~50 |
| 7 | gamification_system | Tables + Functions + Triggers + Views + RLS | ~55 |
| 8 | progress_tracking | Tables + Functions + Triggers + Views + RLS | ~25 |
| 9 | social_features | Tables + Functions + Triggers + RLS | ~20 |
| 10 | content_management | Tables + Triggers + RLS | ~10 |
| 11 | audit_logging | Tables + Functions + Triggers + RLS | ~15 |
| 12 | system_configuration | Tables + Triggers + RLS | ~3 |
| 13 | admin_dashboard | Views | ~1 |

**Total**: ~225 archivos DDL

---

## Verificación Post-Creación

### 1. Verificar schemas creados

```sql
SELECT schema_name
FROM information_schema.schemata
WHERE schema_name NOT IN ('pg_catalog', 'information_schema', 'pg_toast')
ORDER BY schema_name;
```

**Resultado esperado**: 13 schemas

### 2. Verificar tablas creadas

```sql
SELECT
    table_schema,
    COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
GROUP BY table_schema
ORDER BY table_schema;
```

**Resultado esperado**: ~63 tablas distribuidas en los schemas

### 3. Verificar ENUMs creados

```sql
SELECT
    n.nspname as schema,
    t.typname as enum_name,
    COUNT(e.enumlabel) as value_count
FROM pg_type t
JOIN pg_namespace n ON t.typnamespace = n.oid
LEFT JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typcategory = 'E'
AND n.nspname NOT IN ('pg_catalog', 'information_schema')
GROUP BY n.nspname, t.typname
ORDER BY n.nspname, t.typname;
```

**Resultado esperado**: 35 ENUMs distribuidos en los schemas

### 4. Verificar funciones creadas

```sql
SELECT
    n.nspname as schema,
    COUNT(*) as function_count
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname NOT IN ('pg_catalog', 'information_schema')
GROUP BY n.nspname
ORDER BY n.nspname;
```

**Resultado esperado**: ~80 funciones distribuidas en los schemas

---

## Troubleshooting

### Error: "psql: command not found"

```bash
# Ubuntu/Debian
sudo apt-get install postgresql-client

# macOS
brew install postgresql

# Windows
# Descargar desde https://www.postgresql.org/download/windows/
```

### Error: "connection refused"

```bash
# Verificar que PostgreSQL esté corriendo
sudo systemctl status postgresql  # Linux
brew services list                # macOS

# Verificar la URL de conexión
echo $DATABASE_URL
```

### Error: "permission denied"

```bash
# Asegurarse de tener permisos de superusuario
psql "$DATABASE_URL" -c "SELECT current_user, current_database();"

# Si es necesario, conectarse como superusuario
export DATABASE_URL="postgresql://postgres:password@localhost:5432/gamilit"
```

### Error: "duplicate key value violates unique constraint"

```bash
# La base de datos ya tiene datos
# Opción 1: Borrar y recrear
dropdb gamilit && createdb gamilit

# Opción 2: Usar migraciones en lugar de create-database.sh
cd migrations
psql "$DATABASE_URL" -f [migration-file].sql
```

### Error en fase específica

```bash
# Revisar el log generado
cat apps/database/create-database-YYYYMMDD_HHMMSS.log

# Ejecutar manualmente la fase que falló
psql "$DATABASE_URL" -f ddl/schemas/[schema]/[type]/[file].sql
```

---

## Logs y Depuración

### Ubicación de logs

Cada ejecución de `create-database.sh` genera un log con timestamp:

```
apps/database/create-database-20251108_143022.log
```

### Contenido del log

- Timestamp de cada operación
- Archivos ejecutados
- Errores de PostgreSQL
- Warnings y notices
- Resumen de objetos creados

### Ver log en tiempo real

```bash
tail -f create-database-*.log
```

---

## Siguientes Pasos

Después de crear la base de datos:

1. **Verificar integridad**: Ejecutar queries de verificación
2. **Aplicar datos semilla** (si existen): `psql "$DATABASE_URL" -f seed-data.sql`
3. **Configurar backend**: Actualizar `.env` con DATABASE_URL
4. **Ejecutar migraciones**: Si hay migraciones pendientes
5. **Testing**: Ejecutar tests de integración del backend

---

## Scripts Relacionados

- `create-database.sh` - Script maestro de creación
- `migrations/*.sql` - Migraciones individuales
- `seed-data.sql` - Datos iniciales (si existe)
- `backup-database.sh` - Backup de base de datos (si existe)
- `reset-database.sh` - Resetear base de datos (si existe)

---

## Documentación Adicional

- `REPORTE-COMPLETITUD-DDL-2025-11-08.md` - Inventario completo de archivos DDL
- `PLAN-MIGRACION-ENUMS-PUBLIC-SCHEMA.md` - Plan de migración de ENUMs
- `REPORTE-MIGRACION-ENUMS-2025-11-08.md` - Reporte de migración de ENUMs
- `docs/20-architecture/arquitectura-base-datos/` - Documentación técnica

---

## Contacto y Soporte

Para problemas o preguntas:
1. Revisar este README y los logs
2. Consultar documentación en `docs/`
3. Crear issue en el repositorio del proyecto

---

**Documento creado**: 2025-11-08
**Última actualización**: 2025-11-08
**Versión del script**: 1.0
