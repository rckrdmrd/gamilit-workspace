# Scripts de Instalación y Setup - GAMILIT Platform

**Épica:** EMR-001 - Migración y Robustecimiento de BD
**Fecha:** 2025-11-02
**Origen:** `/docs/03-desarrollo/base-de-datos/backup-ddl/setup/`

---

## Resumen Ejecutivo

- **Scripts de Setup:** 5 scripts principales
- **Archivos SQL:** 133 archivos SQL procesados
- **Archivos MD:** 8 archivos de documentación
- **Migración GAMILIT→ GAMILIT:** Completada (27 oct 2025)

---

## 1. Scripts Principales

### 1.1 install-all.sh
**Propósito:** Instalación completa de la BD desde cero

**Pasos:**
1. Create database y schemas
2. Create ENUMs
3. Install tables (9 schemas)
4. Install functions
5. Install triggers
6. Install RLS policies
7. Install indexes
8. Load seed data

**Uso:**
```bash
cd /docs/03-desarrollo/base-de-datos/backup-ddl/setup/
./install-all.sh
```

---

### 1.2 db-setup.sh
**Propósito:** Setup rápido con validación

**Features:**
- Validación de conexión a BD
- Verificación de dependencias
- Rollback automático en error

**Uso:**
```bash
./db-setup.sh
```

---

### 1.3 migrate-glit-to-gamilit.sh
**Propósito:** Migración de nombres GAMILIT→ GAMILIT

**Fecha de Ejecución:** 27 oct 2025, 20:32:27 CST

**Reemplazos realizados:**
- `glit_platform` → `gamilit_platform`
- `glit_user` → `gamilit_user`
- `glit_secure` → `gamilit_secure`
- "GAMILIT Platform" → "GAMILIT Platform"

**Estadísticas:**
- Archivos SQL: 133
- Archivos Markdown: 8
- Archivos Text: 4
- Total replacements: 0 (ya migrado)

**Backup location:**
```
/docs/03-desarrollo/base-de-datos/backup-ddl/backup_before_migration_20251027_203226
```

**Estado:** ✅ Completado exitosamente

---

### 1.4 install-critical-missing-objects.sh
**Propósito:** Instalar objetos críticos faltantes post-migración

**Objetos instalados:**
- Funciones críticas faltantes
- Triggers específicos
- Constraints adicionales

---

### 1.5 test-auth-functions.sql
**Propósito:** Testing de funciones de autenticación

**Tests incluidos:**
- `get_current_user_id()`
- `get_current_user_role()`
- `is_admin()`
- `is_super_admin()`
- `user_has_permission()`

**Uso:**
```bash
psql -f setup/test-auth-functions.sql
```

---

## 2. Orden de Instalación

### 2.1 Prerequisites (OBLIGATORIO PRIMERO)
```bash
psql -f 00-create-database.sql
psql -f 01-create-schemas.sql
psql -f 02-create-enums.sql
```

### 2.2 Tables por Schema
```bash
# Auth
psql -f schemas/auth/tables/01-users.sql

# Auth Management
psql -f schemas/auth_management/tables/01-tenants.sql
psql -f schemas/auth_management/tables/02-profiles.sql
# ... (9 tablas)

# Gamification System
psql -f schemas/gamification_system/tables/01-user_stats.sql
psql -f schemas/gamification_system/tables/02-user_ranks.sql
# ... (9 tablas)

# Educational Content
psql -f schemas/educational_content/tables/01-modules.sql
psql -f schemas/educational_content/tables/02-exercises.sql
# ... (4 tablas)

# Progress Tracking
psql -f schemas/progress_tracking/tables/01-module_progress.sql
# ... (4 tablas)

# Social Features
psql -f schemas/social_features/tables/01-schools.sql
# ... (7 tablas)

# Content Management
psql -f schemas/content_management/tables/01-content_templates.sql
# ... (4 tablas)

# System Configuration
psql -f schemas/system_configuration/tables/01-system_settings.sql
psql -f schemas/system_configuration/tables/02-feature_flags.sql

# Audit Logging
psql -f schemas/audit_logging/tables/01-audit_logs.sql
# ... (5 tablas)
```

### 2.3 Functions
```bash
# Gamilit (core utilities)
psql -f schemas/gamilit/functions/01-audit_profile_changes.sql
psql -f schemas/gamilit/functions/02-get_current_user_id.sql
# ... (11 funciones)

# Gamification System
psql -f schemas/gamification_system/functions/01-award_ml_coins.sql
psql -f schemas/gamification_system/functions/02-calculate_level_from_xp.sql
# ... (7 funciones)

# Progress Tracking
psql -f schemas/progress_tracking/functions/01-calculate_module_progress.sql
# ... (3 funciones)

# Auth Management
psql -f schemas/auth_management/functions/06-user_has_permission.sql
# ... (4 funciones)

# Audit Logging
psql -f schemas/audit_logging/functions/01-log_audit_event.sql
```

### 2.4 Triggers
```bash
# Auth Management
psql -f schemas/auth_management/triggers/02-trg_memberships_updated_at.sql
# ... (6 triggers)

# Content Management
psql -f schemas/content_management/triggers/08-trg_content_templates_updated_at.sql
# ... (3 triggers)

# Educational Content
psql -f schemas/educational_content/triggers/11-trg_assessment_rubrics_updated_at.sql
# ... (4 triggers)

# Gamification System
psql -f schemas/gamification_system/triggers/15-trg_achievements_updated_at.sql
# ... (6 triggers)

# Progress Tracking
psql -f schemas/progress_tracking/triggers/21-trg_update_user_stats_on_exercise.sql
# ... (3 triggers)

# Social Features
psql -f schemas/social_features/triggers/24-trg_classroom_members_updated_at.sql
# ... (5 triggers)

# System Configuration
psql -f schemas/system_configuration/triggers/29-trg_feature_flags_updated_at.sql
# ... (2 triggers)

# Audit Logging
psql -f schemas/audit_logging/triggers/01-trg_system_alerts_updated_at.sql
```

### 2.5 Indexes
```bash
# Auth Management
psql -f schemas/auth_management/indexes/01-idx_user_roles_permissions_gin.sql

# Content Management
psql -f schemas/content_management/indexes/01-idx_marie_content_grade_levels_gin.sql
psql -f schemas/content_management/indexes/02-idx_marie_content_keywords_gin.sql

# Gamification System
psql -f schemas/gamification_system/indexes/01-idx_achievements_metadata_gin.sql
psql -f schemas/gamification_system/indexes/02-idx_user_stats_leaderboard_optimizations.sql

# Progress Tracking
psql -f schemas/progress_tracking/indexes/01-idx_module_progress_analytics_gin.sql
```

### 2.6 RLS Policies
```bash
# Por cada schema con RLS:
psql -f schemas/[schema]/rls-policies/01-enable-rls.sql
psql -f schemas/[schema]/rls-policies/02-policies.sql
psql -f schemas/[schema]/rls-policies/03-grants.sql
```

### 2.7 Seed Data
```bash
# Gamification System
psql -f seed-data/gamification_system/01-seed-achievements.sql
psql -f seed-data/gamification_system/02-seed-leaderboard_metadata.sql

# Educational Content
psql -f seed-data/educational_content/01-seed-modules.sql
psql -f seed-data/educational_content/02-seed-assessment_rubrics.sql

# Content Management
psql -f seed-data/content_management/01-seed-marie_curie_content.sql

# System Configuration
psql -f seed-data/system_configuration/01-seed-system_settings.sql
psql -f seed-data/system_configuration/02-seed-feature_flags.sql
```

---

## 3. Documentos de Apoyo

### 3.1 README-INSTALLATION.md
**Contenido:**
- Instrucciones de instalación detalladas
- Pre-requisitos
- Troubleshooting

### 3.2 INSTALLATION-ORDER-DIAGRAM.md
**Contenido:**
- Diagrama de dependencias
- Orden correcto de ejecución
- Validaciones por fase

### 3.3 VERIFICATION-COMMANDS.md
**Contenido:**
- Comandos para verificar instalación
- Queries de validación
- Checklist post-instalación

### 3.4 UPDATE-CONFIRMATION.md
**Contenido:**
- Confirmación de updates aplicados
- Checksums de archivos
- Versiones de objetos

### 3.5 INSTALL-ALL-UPDATE-SUMMARY.md
**Contenido:**
- Resumen de instalación
- Estadísticas de objetos creados
- Logs de ejecución

---

## 4. Migración GAMILIT→ GAMILIT

### 4.1 Reporte de Migración
**Archivo:** `migration_report_20251027_203227.txt`
**Generado:** Mon Oct 27 20:32:27 CST 2025

**Reemplazos:**
- `glit_platform` → `gamilit_platform`
- `glit_user` → `gamilit_user`
- `glit_secure` → `gamilit_secure`
- "GAMILIT Platform" → "GAMILIT Platform"
- Referencias en comentarios y strings

**Verificación:**
- Remaining "glit_" references: 0 files ✅

**Next Steps Completados:**
1. ✅ Review changes (diff)
2. ✅ Test fresh installation
3. ✅ Update backend .env file
4. ✅ Update documentation
5. ⏳ Delete backup after verification (pendiente)

---

## 5. Validación Post-Instalación

### 5.1 Verificar Schemas
```sql
SELECT schema_name FROM information_schema.schemata
WHERE schema_name IN (
    'gamilit', 'auth_management', 'gamification_system',
    'educational_content', 'progress_tracking', 'social_features',
    'content_management', 'system_configuration', 'audit_logging'
)
ORDER BY schema_name;
-- Esperado: 9 schemas
```

### 5.2 Verificar Tablas
```sql
SELECT table_schema, COUNT(*) as table_count
FROM information_schema.tables
WHERE table_schema IN (
    'auth_management', 'gamification_system', 'educational_content',
    'progress_tracking', 'social_features', 'content_management',
    'system_configuration', 'audit_logging'
)
AND table_type = 'BASE TABLE'
GROUP BY table_schema
ORDER BY table_schema;
-- Esperado: 44 tablas total
```

### 5.3 Verificar ENUMs
```sql
SELECT typname FROM pg_type
WHERE typname IN (
    'gamilit_role', 'user_status', 'rango_maya',
    'achievement_category', 'exercise_type', 'difficulty_level',
    'comodin_type', 'content_status', 'processing_status'
)
ORDER BY typname;
-- Esperado: 24 ENUMs
```

### 5.4 Verificar Funciones
```sql
SELECT routine_schema, routine_name
FROM information_schema.routines
WHERE routine_schema IN ('gamilit', 'gamification_system', 'progress_tracking', 'auth_management')
ORDER BY routine_schema, routine_name;
-- Esperado: 26 funciones
```

### 5.5 Verificar Triggers
```sql
SELECT event_object_schema, event_object_table, trigger_name
FROM information_schema.triggers
WHERE event_object_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY event_object_schema, event_object_table;
-- Esperado: 30 triggers
```

### 5.6 Verificar Seed Data
```sql
-- Achievements
SELECT COUNT(*) FROM gamification_system.achievements;
-- Esperado: 30+

-- Modules
SELECT COUNT(*) FROM educational_content.modules;
-- Esperado: 5

-- System Settings
SELECT COUNT(*) FROM system_configuration.system_settings;
-- Esperado: 20+

-- Feature Flags
SELECT COUNT(*) FROM system_configuration.feature_flags;
-- Esperado: 5+
```

---

## 6. Referencias

- **Migraciones:** `tareas/01-migraciones/MIGRACIONES-HISTORICO.md`
- **Esquema:** `tareas/03-documentacion/ESQUEMA-44-TABLAS.md`
- **Seed Data:** `tareas/02-scripts/DATOS-SEED.md`
- **Setup Scripts:** `/docs/03-desarrollo/base-de-datos/backup-ddl/setup/`

---

**Última actualización:** 2025-11-02
**Consolidado por:** ARTEMIS (Agente de Migración)
