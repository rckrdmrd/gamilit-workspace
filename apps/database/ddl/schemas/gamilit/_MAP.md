# Schema: gamilit

Funciones y utilidades compartidas del sistema GAMILIT

## Estructura

- **functions/**: 22 archivos
- **views/**: 1 archivo

**Total:** 23 objetos

## Contenido Detallado

### functions/ (22 archivos)

```
01-audit_profile_changes.sql
02-get_current_user_id.sql
03-get_current_user_role.sql
04-initialize_user_stats.sql
05-is_admin.sql
05b-is_super_admin.sql                           # ✨ NUEVO 2025-11-15
08-now_mexico.sql
09-set_profile_defaults.sql
10-update_classroom_member_count.sql
11-set_default_tenant.sql                        # ✨ NUEVO 2025-11-19
11-update_user_last_login.sql
12-validate_email_format.sql
13-validate_username.sql
14-update_user_stats_on_exercise_complete.sql
15-update_module_progress_on_exercise_complete.sql # ✨ NUEVO 2025-11-26
15-update_updated_at_column.sql
16-normalize_text.sql                            # ✨ NUEVO 2025-11-19
17-update_missions_on_exercise_complete.sql      # ✨ NUEVO 2025-11-26
18-initialize_user_missions.sql                  # ✨ NUEVO 2025-11-26
19-update_missions_on_correct_streak.sql         # ✨ NUEVO 2025-11-26
20-update_module_progress_on_submission_graded.sql # ✨ NUEVO 2025-11-28 (Student Portal)
validate_date_range.sql
```

### views/ (1 archivo)

```
number_series.sql    (migrado desde public 2025-11-11)
```

## Descripción

Funciones y vistas utilitarias reutilizables en todo el sistema:

- **Funciones de auditoría**: audit_profile_changes
- **Funciones de contexto**: get_current_user_id, get_current_user_role, is_admin
- **Funciones de inicialización**: initialize_user_stats, set_profile_defaults
- **Funciones de actualización**: update_*, set_*
- **Funciones de validación**: validate_*
- **Funciones de timestamp**: now_mexico (zona horaria Mexico City)
- **Vistas utilitarias**: number_series (generador de números 1-1000)

---

**Última actualización:** 2025-11-28 (Student Portal: +8 funciones misiones/progreso)
**Reorganización:** 2025-11-11 (agregada vista number_series migrada desde public)

## Changelog

### 2025-11-28 - Student Portal Corrections
- ✨ **1 función nueva**: update_module_progress_on_submission_graded (progreso para submissions calificadas)
- **Total objetos**: 22 → 23

### 2025-11-26 - Sistema de Misiones
- ✨ **4 funciones nuevas**: Sistema de misiones y progreso
  - 15-update_module_progress_on_exercise_complete.sql
  - 17-update_missions_on_exercise_complete.sql
  - 18-initialize_user_missions.sql
  - 19-update_missions_on_correct_streak.sql
- **Total objetos**: 18 → 22

### 2025-11-19 - Utilidades
- ✨ **2 funciones nuevas**: normalize_text, set_default_tenant
- **Total objetos**: 16 → 18

### 2025-11-15 - Super Admin
- ✨ **1 función nueva**: is_super_admin
- **Total objetos**: 15 → 16

### 2025-11-11 - Reorganización DDL
- Vista number_series migrada desde public
- **Total objetos**: 15
