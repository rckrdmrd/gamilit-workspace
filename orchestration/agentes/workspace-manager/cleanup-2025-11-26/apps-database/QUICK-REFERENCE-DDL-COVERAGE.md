# Quick Reference: DDL Coverage

**Última Validación:** 2025-11-26
**Estado:** ⚠️ REQUIERE ACCIÓN
**Cobertura:** 97.4% (378/388 archivos)

---

## Archivos NO Cubiertos (10)

### Criticidad ALTA (6 archivos)

```bash
# content_management/functions (4 archivos)
apps/database/ddl/schemas/content_management/functions/01-apply_moderation_rules.sql
apps/database/ddl/schemas/content_management/functions/02-check_keyword_rule.sql
apps/database/ddl/schemas/content_management/functions/03-check_pattern_rule.sql
apps/database/ddl/schemas/content_management/functions/04-auto_moderate_content.sql

# system_configuration/functions (2 archivos)
apps/database/ddl/schemas/system_configuration/functions/is_feature_enabled.sql
apps/database/ddl/schemas/system_configuration/functions/update_feature_flag.sql
```

### Criticidad MEDIA (3 archivos)

```bash
# admin_dashboard (3 archivos)
apps/database/ddl/schemas/admin_dashboard/tables/01-materialized_views.sql
apps/database/ddl/schemas/admin_dashboard/tables/07-bulk_operations.sql
apps/database/ddl/schemas/admin_dashboard/functions/01-update_bulk_operation_progress.sql
```

### Criticidad BAJA (1 archivo)

```bash
# auth/views (1 archivo)
apps/database/ddl/schemas/auth/views/tenants_alias.sql
```

---

## Correcciones Requeridas

### 1. FASE 3 (auth) - Línea ~207

```bash
execute_sql_files "$DDL_DIR/schemas/auth/enums" "*.sql" "ENUMs de autenticación"
execute_sql_files "$DDL_DIR/schemas/auth/tables" "*.sql" "Tablas de autenticación"
execute_sql_files "$DDL_DIR/schemas/auth/views" "*.sql" "Vistas de autenticación"    # ← AGREGAR
execute_sql_files "$DDL_DIR/schemas/auth/functions" "*.sql" "Funciones de autenticación"
```

### 2. FASE 10 (content_management) - Línea ~355

```bash
execute_sql_files "$DDL_DIR/schemas/content_management/enums" "*.sql" "ENUMs de gestión de contenido"
execute_sql_files "$DDL_DIR/schemas/content_management/functions" "*.sql" "Funciones de moderación"    # ← AGREGAR
execute_sql_files "$DDL_DIR/schemas/content_management/tables" "*.sql" "Tablas de gestión de contenido"
```

### 3. FASE 12 (system_configuration) - Línea ~408

```bash
execute_sql_files "$DDL_DIR/schemas/system_configuration/functions" "*.sql" "Funciones de configuración"    # ← AGREGAR
execute_sql_files "$DDL_DIR/schemas/system_configuration/tables" "*.sql" "Tablas de configuración"
```

### 4. FASE 13 (admin_dashboard) - Línea ~423

```bash
execute_sql_files "$DDL_DIR/schemas/admin_dashboard/tables" "*.sql" "Tablas de dashboard administrativo"    # ← AGREGAR
execute_sql_files "$DDL_DIR/schemas/admin_dashboard/functions" "*.sql" "Funciones de dashboard"    # ← AGREGAR
execute_sql_files "$DDL_DIR/schemas/admin_dashboard/views" "*.sql" "Vistas de dashboard administrativo"
```

---

## Validación Rápida

```bash
# Ejecutar script de validación
cd apps/database
./validate-ddl-coverage.sh

# Salida esperada después de correcciones:
# ✅ TODOS LOS ARCHIVOS DDL ESTÁN CUBIERTOS
```

---

## Inventario Completo por Schema

| Schema | Archivos | Estado |
|--------|----------|--------|
| admin_dashboard | 10 | ⚠️ PARCIAL (7/10) |
| audit_logging | 29 | ✅ COMPLETO |
| auth | 4 | ⚠️ PARCIAL (3/4) |
| auth_management | 42 | ✅ COMPLETO |
| communication | 1 | ✅ COMPLETO |
| content_management | 24 | ⚠️ PARCIAL (20/24) |
| educational_content | 72 | ✅ COMPLETO |
| gamification_system | 89 | ✅ COMPLETO |
| gamilit | 21 | ✅ COMPLETO |
| lti_integration | 3 | ✅ COMPLETO |
| notifications | 9 | ✅ COMPLETO |
| progress_tracking | 38 | ✅ COMPLETO |
| social_features | 31 | ✅ COMPLETO |
| storage | 1 | ✅ COMPLETO |
| system_configuration | 14 | ⚠️ PARCIAL (12/14) |

**TOTAL:** 388 archivos SQL

---

## Reportes Relacionados

- **Reporte Completo:** `REPORTE-VALIDACION-DDL-COBERTURA-2025-11-26.md`
- **Script Validación:** `validate-ddl-coverage.sh`
- **Script Creación:** `create-database.sh`
