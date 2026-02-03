# TASK-016: Ejecución

## Cambios Realizados

### 1. Mover DDL a _cross_schema/

```bash
mkdir -p apps/database/ddl/schemas/educational_content/tables/_cross_schema/
mv apps/database/ddl/schemas/educational_content/tables/23-classroom_modules.sql \
   apps/database/ddl/schemas/educational_content/tables/_cross_schema/
```

### 2. Modificar execute_sql_files en create-database.sh

**Antes:**
```bash
local file_count=$(find "$dir" -name "$pattern" -type f ! -path "*/_deprecated/*" ! -path "*/tests/*" 2>/dev/null | wc -l)
```

**Después:**
```bash
local file_count=$(find "$dir" -name "$pattern" -type f ! -path "*/_deprecated/*" ! -path "*/tests/*" ! -path "*/_cross_schema/*" 2>/dev/null | wc -l)
```

### 3. Agregar FASE 9.7

```bash
# ============================================================================
# FASE 9.7: TABLAS CROSS-SCHEMA (Dependen de social_features)
# ============================================================================
log "============================================================================"
log "FASE 9.7: TABLAS CROSS-SCHEMA (classroom_modules)"
log "============================================================================"

execute_sql "$DDL_DIR/schemas/educational_content/tables/_cross_schema/23-classroom_modules.sql" \
    "Tabla classroom_modules (cross-schema: educational_content + social_features)"

log_success "FASE 9.7 completada - Tablas cross-schema creadas"
```

### 4. Crear seed 14-classroom_modules.sql

```sql
-- Assign all published modules to the default classroom
INSERT INTO educational_content.classroom_modules (
    classroom_id,
    module_id,
    assigned_date,
    is_active,
    display_order,
    settings
)
SELECT
    c.id AS classroom_id,
    m.id AS module_id,
    NOW() AS assigned_date,
    true AS is_active,
    m.order_index AS display_order,
    jsonb_build_object(
        'allow_retries', true,
        'max_attempts', 3,
        'points_multiplier', 1.0,
        'is_optional', false
    ) AS settings
FROM social_features.classrooms c
CROSS JOIN educational_content.modules m
WHERE c.code = 'DEFAULT'
  AND m.status = 'published'
  AND m.is_published = true
ORDER BY m.order_index;
```

### 5. Agregar ejecución del seed

```bash
# 16.6.1: classroom_modules (assignment of modules to classrooms) - 2026-01-25
execute_sql "$SEEDS_DIR/educational_content/14-classroom_modules.sql" \
    "Seeds: classroom_modules (assign modules to DEFAULT classroom)"
```

## Verificación

### Recreación de Base de Datos

```bash
wsl -d Ubuntu-24.04 -u developer -- bash '/mnt/c/Empresas/ISEM/workspace-v2/projects/gamilit/apps/database/create-database.sh'
```

### Resultados

```
============================================================================
RESUMEN FINAL DE LA BASE DE DATOS
============================================================================
        Componente        │      Cantidad
══════════════════════════╪═══════════════
 Schemas                  │ 16
 Tablas                   │ 146
 Índices                  │ 275
 Foreign Keys             │ 78
 Triggers                 │ 108
 Functions                │ 85
 Views                    │ 12
══════════════════════════╧═══════════════
```

### Verificación de classroom_modules

```sql
SELECT COUNT(*) FROM educational_content.classroom_modules;
-- Result: 3

SELECT m.title, c.name as classroom
FROM educational_content.classroom_modules cm
JOIN educational_content.modules m ON cm.module_id = m.id
JOIN social_features.classrooms c ON cm.classroom_id = c.id;
-- Result: 3 modules assigned to DEFAULT classroom
```

## Estado Final

- **Tabla creada**: Sí
- **Seeds cargados**: 3 registros
- **Student portal**: Funcionando correctamente
