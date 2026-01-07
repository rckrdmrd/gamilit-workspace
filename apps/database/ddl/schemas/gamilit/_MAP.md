# Schema: gamilit

Funciones y utilidades compartidas del sistema GAMILIT.

## Estructura

- **functions/**: 29 archivos SQL activos
- **functions/_deprecated/**: 8 archivos (funciones unificadas)
- **views/**: 1 archivo

**Total:** 30 objetos DDL activos

## Arquitectura de Funciones de Misiones

Las funciones de actualización de misiones siguen una arquitectura unificada:

```
                    ┌─────────────────────────────────────┐
                    │   update_mission_progress()         │
                    │   (Función central parametrizada)   │
                    └─────────────────┬───────────────────┘
                                      │
        ┌─────────────────────────────┼─────────────────────────────┐
        │             │               │               │             │
        ▼             ▼               ▼               ▼             ▼
┌───────────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐
│trigger_on_    │ │trigger_on_│ │trigger_on_│ │trigger_on_│ │  ...más   │
│exercise_      │ │earn_xp()  │ │use_       │ │perfect_   │ │  wrappers │
│complete()     │ │           │ │comodines()│ │scores()   │ │           │
└───────────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘
```

## Funciones Principales

### Sistema de Misiones (Arquitectura Unificada)

| Función | Archivo | Propósito |
|---------|---------|-----------|
| `update_mission_progress(user_id, type, increment)` | 50-update_mission_progress.sql | Función central que actualiza cualquier tipo de misión |

**Wrappers de Trigger (archivo 51-mission_trigger_wrappers.sql):**

| Wrapper | Tipo de Objetivo | Tabla Trigger |
|---------|------------------|---------------|
| `trigger_missions_on_exercise_complete()` | complete_exercises | exercise_attempts |
| `trigger_missions_on_earn_xp()` | earn_xp | user_stats |
| `trigger_missions_on_correct_streak()` | correct_streak | exercise_attempts |
| `trigger_missions_on_daily_streak()` | daily_streak | user_stats |
| `trigger_missions_on_use_comodines()` | use_comodines | comodin_usage_log |
| `trigger_missions_on_perfect_scores()` | perfect_scores | exercise_attempts |
| `trigger_missions_on_complete_modules()` | complete_modules | module_progress |
| `trigger_missions_on_explore_modules()` | explore_modules | module_progress |
| `trigger_missions_on_submission()` | submit_exercises | exercise_submissions |

### Inicialización de Usuarios

| Función | Propósito |
|---------|-----------|
| `initialize_user_stats` | Crea user_stats, comodines, ranks y module_progress al registrar usuario |
| `initialize_user_missions` | Crea 3 misiones diarias + 5 semanales para usuario nuevo |
| `assign_default_classroom` | Asigna estudiantes nuevos al classroom default |
| `set_profile_defaults` | Establece valores por defecto en profiles |

### Auditoría y Seguridad

| Función | Propósito |
|---------|-----------|
| `audit_profile_changes` | Registra cambios de rol/status en audit_logs |
| `get_current_user_id` | Obtiene ID del usuario actual de sesión |
| `get_current_user_role` | Obtiene rol del usuario actual |
| `is_admin` / `is_super_admin` | Verifica permisos de administrador |

### Actualización de Progreso

| Función | Propósito |
|---------|-----------|
| `update_user_stats_on_exercise_complete` | Actualiza XP/ML tras completar ejercicio |
| `update_user_stats_on_submission_graded` | Actualiza XP/ML tras calificación manual |
| `update_module_progress_on_exercise_complete` | Actualiza progreso de módulo |
| `update_module_progress_on_submission_graded` | Actualiza progreso tras calificación manual |

### Utilidades

| Función | Propósito |
|---------|-----------|
| `now_mexico` | Timestamp en zona horaria Mexico City |
| `normalize_text` | Normaliza texto para comparaciones |
| `validate_email_format` | Valida formato de email |
| `validate_username` | Valida formato de username |
| `validate_date_range` | Valida rangos de fechas |
| `update_updated_at_column` | Trigger para updated_at automático |
| `set_default_tenant` | Asigna tenant por defecto |
| `update_classroom_member_count` | Actualiza conteo de miembros |
| `update_user_last_login` | Actualiza timestamp de último login |

### Vistas

| Vista | Propósito |
|-------|-----------|
| `number_series` | Generador de números 1-1000 |

## Características de Seguridad

Todas las funciones críticas de inicialización incluyen:
- **EXCEPTION handling**: Captura errores sin bloquear operaciones principales
- **Logging**: Errores registrados en `audit_logging.pending_user_initialization`
- **Retry**: Errores pueden reintentarse automáticamente
- **SECURITY DEFINER**: Permisos elevados controlados

## Directorio _deprecated

Funciones antiguas reemplazadas por la arquitectura unificada (DB-157):

| Archivo Deprecado | Reemplazado Por |
|-------------------|-----------------|
| 17-update_missions_on_exercise_complete.sql | trigger_missions_on_exercise_complete() |
| 19-update_missions_on_correct_streak.sql | trigger_missions_on_correct_streak() |
| 21-update_missions_on_use_comodines.sql | trigger_missions_on_use_comodines() |
| 22-update_missions_on_earn_xp.sql | trigger_missions_on_earn_xp() |
| 23-update_missions_on_daily_streak.sql | trigger_missions_on_daily_streak() |
| 24-update_missions_on_perfect_scores.sql | trigger_missions_on_perfect_scores() |
| 25-update_missions_on_complete_modules.sql | trigger_missions_on_complete_modules() |
| 26-update_missions_on_explore_modules.sql | trigger_missions_on_explore_modules() |

## Correcciones Aplicadas

| Archivo | Cambio | Fecha |
|---------|--------|-------|
| `51-mission_trigger_wrappers.sql` | DB-166: Corregida funcion `trigger_missions_on_explore_modules()` - eliminada referencia a columna inexistente `modules_explored` | 2026-01-04 |

---

**Última actualización:** 2026-01-04
