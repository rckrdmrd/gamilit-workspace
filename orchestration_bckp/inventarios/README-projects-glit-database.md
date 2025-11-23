# Inventario: Proyecto GLIT Database

**Generado por:** SA-DB-004 Inventariador  
**Fecha:** 2025-11-02 20:04:56  
**Fuente:** `/home/isem/workspace/projects/glit/database/`

---

## Resumen Ejecutivo

Se ha completado un inventario exhaustivo de todos los objetos de base de datos del proyecto GLIT. Se identificaron **54 archivos SQL** contendo **499 objetos únicos** distribuidos en diferentes categorías según su propósito.

### Métricas Principales

| Métrica | Valor |
|---------|-------|
| **Total de archivos SQL** | 54 |
| **Archivos únicos** | 48 |
| **Archivos con versiones alternativas** | 6 |
| **Grupos de duplicados** | 5 |
| **Total de objetos** | 499 |
| **Líneas de SQL** | ~13,000+ |

---

## Distribución por Categoría

### Por Cantidad de Archivos

```
MIGRATION               17 archivos (31.5%)  ████████░
SEED_DATA              14 archivos (25.9%)  ███████░░
MAIN_DDL               13 archivos (24.1%)  ███████░░
OLD_VERSION             4 archivos (7.4%)   ██░░░░░░░
ROLLBACK                2 archivos (3.7%)   █░░░░░░░░
PATCH                   2 archivos (3.7%)   █░░░░░░░░
OTHER                   2 archivos (3.7%)   █░░░░░░░░
────────────────────────────────────────────
TOTAL                  54 archivos
```

### Descripción de Categorías

- **MAIN_DDL**: Archivos DDL principales que definen el esquema base
- **MIGRATION**: Scripts de migración de base de datos numerados
- **SEED_DATA**: Scripts de carga de datos iniciales
- **OLD_VERSION**: Versiones antiguas de archivos (supersedidas)
- **ROLLBACK**: Scripts para revertir cambios
- **PATCH**: Parches y fixes puntuales
- **OTHER**: Otros archivos SQL diversos

---

## Distribución por Tipo de Objeto

| Tipo | Cantidad | Porcentaje |
|------|----------|-----------|
| INDEX | 311 | 62.3% |
| TABLE | 76 | 15.2% |
| TRIGGER | 45 | 9.0% |
| FUNCTION | 33 | 6.6% |
| TYPE | 24 | 4.8% |
| VIEW | 10 | 2.0% |
| **TOTAL** | **499** | **100%** |

---

## Archivos con Versiones Alternativas (Duplicados)

Se identificaron **5 grupos** de archivos con versiones alternativas, duplicados o historiales:

### 1. `011_fix_enums_critical`
- **Vigente:** `011_fix_enums_critical_DOWN.sql` (ROLLBACK, 168 líneas)
- **Obsoleto:** `011_fix_enums_critical.sql` (MIGRATION, 324 líneas)
- **Nota:** El rollback es más reciente. Investigar estado.

### 2. `013_hash_refresh_tokens_security_fix`
- **Vigente:** `013_hash_refresh_tokens_security_fix_ROLLBACK.sql` (ROLLBACK, 86 líneas)
- **Obsoleto:** `013_hash_refresh_tokens_security_fix.sql` (MIGRATION, 273 líneas)
- **Nota:** El rollback es más reciente. Verificar si fue revertida.

### 3. `01_achievements_seed`
- **Vigente:** `01_achievements_seed.sql` (SEED_DATA, 241 líneas)
- **Obsoleto:** `01_achievements_seed_OLD.sql` (OLD_VERSION, 475 líneas)
- **Nota:** Versión reducida más reciente.

### 4. `03_educational_modules_seed`
- **Vigente:** `03_educational_modules_seed.sql` (SEED_DATA, 2149 líneas)
- **Obsoleto:** `03_educational_modules_seed_OLD.sql` (OLD_VERSION, 343 líneas)
- **Nota:** Versión expandida (6x mayor).

### 5. `05_enhanced_crossword`
- **Vigente:** `05_enhanced_crossword.sql` (SEED_DATA, 357 líneas)
- **Obsoleto v2:** `05_enhanced_crossword_OLD_v2.sql` (OLD_VERSION, 413 líneas)
- **Obsoleto v1:** `05_enhanced_crossword_OLD_v1.sql` (OLD_VERSION, 536 líneas)
- **Nota:** Evolución de versiones con optimización de tamaño.

---

## Archivos Más Complejos (TOP 10)

| # | Archivo | Objetos | Tipos | Líneas |
|---|---------|---------|-------|--------|
| 1 | `008_admin_module_tables.sql` | 45 | F,I,T,Tr,V | 349 |
| 2 | `006_teacher_module_updates.sql` | 40 | F,I,T,Tr,V | 306 |
| 3 | `11_triggers.sql` | 34 | F,Tr | 337 |
| 4 | `08_audit_logging_tables.sql` | 31 | I,T | 318 |
| 5 | `05_social_features_tables.sql` | 30 | I,T | 312 |
| 6 | `02_gamification_tables.sql` | 28 | I,T | 341 |
| 7 | `005_teacher_tables.sql` | 28 | F,I,T,Tr | 212 |
| 8 | `09_constraints_and_indexes.sql` | 26 | I | 116 |
| 9 | `01_auth_management_tables.sql` | 25 | I,T | 269 |
| 10 | `03_educational_content_tables.sql` | 24 | I,T | 338 |

*Leyenda: F=Function, I=Index, T=Table, Tr=Trigger, V=View*

---

## Listado Completo de Archivos

### MAIN_DDL (13 archivos)

#### DDL Module 01: Autenticación
- `01_auth_management_tables.sql` - 269 líneas, 25 objetos
  - Tables: tenants, profiles, user_roles, user_sessions, auth_attempts, memberships
  - Indexes: 19 índices para optimización

#### DDL Module 02: Gamificación
- `02_gamification_tables.sql` - 341 líneas, 28 objetos
  - Tables: user_stats, user_ranks, achievements, user_achievements, ml_coins_transactions, comodines_inventory
  - Indexes: 19 índices

#### DDL Module 03: Contenido Educativo
- `03_educational_content_tables.sql` - 338 líneas, 24 objetos
  - Tables: modules, exercises, assessment_rubrics, media_resources
  - Indexes: 20 índices

#### DDL Module 04: Seguimiento de Progreso
- `04_progress_tracking_tables.sql` - 202 líneas, 16 objetos
  - Tables: module_progress, exercise_attempts, learning_sessions
  - Indexes: 13 índices

#### DDL Module 05: Características Sociales
- `05_social_features_tables.sql` - 312 líneas, 30 objetos
  - Tables: schools, classrooms, classroom_members, teams, friendships
  - Indexes: 21 índices

#### DDL Module 05b: Tablas Sociales Faltantes
- `05b_social_features_missing_tables.sql` - 94 líneas, 12 objetos
  - Tables: friendships, team_members, team_challenges

#### DDL Module 06: Gestión de Contenidos
- `06_content_management_tables.sql` - 230 líneas, 17 objetos
  - Tables: marie_curie_content, media_files, content_templates
  - Indexes: 14 índices

#### DDL Module 07: Configuración del Sistema
- `07_system_configuration_tables.sql` - 107 líneas, 8 objetos
  - Tables: system_settings, feature_flags
  - Indexes: 6 índices

#### DDL Module 08: Auditoría
- `08_audit_logging_tables.sql` - 318 líneas, 31 objetos
  - Tables: audit_logs, system_logs, performance_metrics, user_activity_logs, system_alerts
  - Indexes: 26 índices

#### DDL Module 09: Constraints e Índices
- `09_constraints_and_indexes.sql` - 116 líneas, 26 objetos
  - Índices compuestos y GIN para búsquedas full-text

#### DDL Module 10: Funciones
- `10_functions.sql` - 351 líneas, 9 objetos
  - Functions: Utilidades, cálculos, triggers helpers

#### DDL Module 11: Triggers
- `11_triggers.sql` - 337 líneas, 34 objetos
  - Triggers: 26+ triggers para updated_at automático y auditoría

#### DDL Module 12: RLS Policies
- `12_rls_policies.sql` - 410 líneas, 3 objetos
  - Row-level security para todas las tablas principales

### MIGRATIONS (17 archivos)

Los scripts de migración están numerados secuencialmente:
- `001_auth_advanced_tables.sql` - 87 líneas
- `001_remove_email_requirement.sql` - 167 líneas
- `001_remove_email_requirement_rollback.sql` - 187 líneas
- `002_admin_tables.sql` - 267 líneas, 17 objetos
- `003_add_exercise_types.sql` - 30 líneas
- `004_missions_install.sql` - 120 líneas, 9 objetos
- `004_missions_tables.sql` - 195 líneas, 9 objetos
- `005_teacher_tables.sql` - 212 líneas, 28 objetos
- `006_teacher_module_updates.sql` - 306 líneas, 40 objetos
- `007_notifications_table.sql` - 86 líneas, 9 objetos
- `008_admin_module_tables.sql` - 349 líneas, 45 objetos (MÁS GRANDE)
- `009_create_leaderboards_views.sql` - 153 líneas, 10 objetos
- `010_update_notification_types.sql` - 41 líneas
- `011_fix_enums_critical.sql` - 324 líneas, 5 objetos
- `011_fix_enums_critical_DOWN.sql` - 168 líneas, 1 objeto (ROLLBACK)
- `012_validate_enums.sql` - 366 líneas
- `013_hash_refresh_tokens_security_fix.sql` - 273 líneas, 6 objetos
- `013_hash_refresh_tokens_security_fix_ROLLBACK.sql` - 86 líneas (ROLLBACK)
- `backfill-user-levels.sql` - 40 líneas

### SEED_DATA (14 archivos)

Scripts para carga inicial de datos:
- `01_achievements_seed.sql` - 241 líneas
- `02_system_config_seed.sql` - 513 líneas
- `03_educational_modules_seed.sql` - 2149 líneas (MAYOR)
- `04_demo_users_and_data_seed.sql` - 1062 líneas
- `05_enhanced_crossword.sql` - 357 líneas
- `06_enhanced_timeline_update.sql` - 575 líneas
- `07_enhanced_wordsearch_update.sql` - 525 líneas
- `08_module1_marie_curie_exercises_update.sql` - 618 líneas
- `09_enrich_exercises_questions.sql` - 810 líneas
- `09_module1_update_simple.sql` - 304 líneas
- `seed_common_achievements.sql` - 251 líneas
- `seed_data.sql` - 478 líneas
- `seed_final.sql` - 375 líneas
- `seed_test_data.sql` - 406 líneas

### OTROS (Patches, Prerequisites, etc.)

- `00_prerequisites.sql` - 242 líneas, 20 objetos (tipos de datos base)
- `fix_auth_schema.sql` - 47 líneas, 4 objetos
- `P0-001-social-tables-fix.sql` - 337 líneas, 19 objetos
- `P0-001-rollback.sql` - 44 líneas

---

## Análisis de Dependencias

### Orden Sugerido de Ejecución

1. **00_prerequisites.sql** - Define tipos de datos base
2. **01_auth_management_tables.sql** - Schema de autenticación (sin dependencias)
3. **02_gamification_tables.sql** - Gamificación (referencia a auth)
4. **03_educational_content_tables.sql** - Contenido educativo
5. **04_progress_tracking_tables.sql** - Progreso (referencia a content)
6. **05_social_features_tables.sql** - Características sociales (referencia a auth)
7. **05b_social_features_missing_tables.sql** - Complemento social
8. **06_content_management_tables.sql** - Gestión de contenidos
9. **07_system_configuration_tables.sql** - Configuración
10. **08_audit_logging_tables.sql** - Auditoría
11. **09_constraints_and_indexes.sql** - Índices adicionales
12. **10_functions.sql** - Funciones auxiliares
13. **11_triggers.sql** - Triggers para auditoría
14. **12_rls_policies.sql** - Seguridad a nivel de fila
15. **MIGRATIONS/** - Scripts de migración en orden
16. **SEED_DATA/** - Datos iniciales

---

## Archivos Generados

### 1. projects-glit-database.json (90 KB)
Inventario completo en formato JSON con:
- Metadatos de cada archivo (ruta, líneas, tamaño, modificación)
- Lista completa de objetos extraídos
- Análisis de duplicados
- Estadísticas agregadas

### 2. projects-glit-database-REPORT.txt (19 KB)
Reporte legible con:
- Resumen ejecutivo
- Tablas de distribución
- Listado detallado por categoría
- Análisis de duplicados
- Top 20 archivos más complejos

---

## Recomendaciones

### Limpieza y Mantenimiento

1. **Archivos OLD_VERSION**: 4 archivos (~1,700 líneas) pueden ser archivados
   - `01_achievements_seed_OLD.sql`
   - `03_educational_modules_seed_OLD.sql`
   - `05_enhanced_crossword_OLD_v1.sql`
   - `05_enhanced_crossword_OLD_v2.sql`

2. **Migraciones 001 Duplicadas**: Revisar si `001_auth_advanced_tables.sql` y `001_remove_email_requirement.sql` son realmente alternativas

3. **Rollbacks Pendientes**: 
   - Migración 011 y 013 tienen rollbacks más recientes
   - Verificar estado de aplicación

4. **Consolidación**: 
   - `004_missions_install.sql` vs `004_missions_tables.sql` - consolidar en uno

### Mejoras Sugeridas

1. **Documentación**: Agregar comentarios de descripción al inicio de cada archivo
2. **Versionado**: Implementar sistema de versionado semántico (v1.0.0, v1.1.0, etc.)
3. **Testing**: Crear suite de tests para validar esquema
4. **Backup**: Mantener histórico de cambios en repositorio Git

---

## Contacto y Soporte

Para consultas sobre este inventario, contactar al agente:
- **Agente:** SA-DB-004 Inventariador
- **Función:** Análisis y catalogación de objetos de base de datos
- **Última actualización:** 2025-11-02

---

*Este documento fue generado automáticamente. Para información actualizada, regenerar el inventario.*
