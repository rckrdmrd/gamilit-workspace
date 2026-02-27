---
titulo: Schema - gamilit (utility)
tipo: arquitectura
subtipo: schema-reference
schema: gamilit
ultima_actualizacion: 2026-02-27
---

# Schema: gamilit (0 tablas, 37 funciones, 1 view)

> Parte de [Schema Reference](_INDEX.md) - GAMILIT
> **Schema fisico DDL:** `gamilit`
> **Tipo:** utility
> **DDL Path:** `apps/database/ddl/schemas/gamilit/`
> **Constante Backend:** `DB_SCHEMAS.GAMILIT`

---

## Descripcion

Schema de funciones utilitarias compartidas por todos los demas schemas. Contiene funciones de infraestructura como timestamps, helpers RLS, validadores, y triggers genericos.

---

## Funciones (37)

### Infraestructura Core

| Funcion | Descripcion | Usada por |
|---------|-------------|-----------|
| `now_mexico()` | Retorna timestamp actual en zona horaria America/Mexico_City | Todos los schemas (DEFAULT en columnas) |
| `update_updated_at_column()` | Trigger generico para actualizar updated_at en UPDATE | 30+ tablas via triggers batch |
| `get_current_tenant_id()` | Retorna current_setting('app.current_tenant_id') | Policies RLS |
| `get_current_user_id()` | Retorna current_setting('app.current_user_id') | Policies RLS |
| `get_current_user_role()` | Retorna current_setting('app.current_user_role') | Policies RLS |
| `is_admin()` | Verifica si el usuario actual es admin | Policies RLS |

### Inicializacion de Usuarios

| Funcion | Descripcion |
|---------|-------------|
| `set_profile_defaults()` | Establece valores por defecto al crear un perfil |
| `set_default_tenant()` | Asigna tenant por defecto a un usuario nuevo |
| `initialize_user_stats()` | Crea registro de user_stats para nuevo usuario |
| `initialize_module_progress_for_users()` | Crea module_progress para todos los modulos activos |
| `initialize_user_missions()` | Asigna misiones iniciales a un nuevo usuario |
| `assign_default_classroom()` | Asigna al aula por defecto del tenant |

### Validacion

| Funcion | Descripcion |
|---------|-------------|
| `validate_email_format()` | Valida formato de email |
| `validate_username()` | Valida formato de username |
| `validate_date_range()` | Valida que fecha_inicio < fecha_fin |
| `normalize_text()` | Normaliza texto (trim, lowercase, remove accents) |

### Progreso y Gamificacion

| Funcion | Descripcion |
|---------|-------------|
| `update_user_stats_on_exercise_complete()` | Actualiza estadisticas al completar ejercicio |
| `update_user_stats_on_submission_graded()` | Actualiza estadisticas al calificar submission |
| `update_module_progress_on_exercise_complete()` | Actualiza progreso de modulo |
| `update_module_progress_on_submission_graded()` | Actualiza progreso al calificar |
| `update_mission_progress()` | Actualiza progreso de misiones |
| `mission_trigger_wrappers()` | Wrappers para triggers de misiones |

### Social

| Funcion | Descripcion |
|---------|-------------|
| `update_classroom_member_count()` | Actualiza conteo de miembros al agregar/eliminar |
| `update_user_last_login()` | Actualiza last_login_at en tabla de usuarios |

### Auditoria

| Funcion | Descripcion |
|---------|-------------|
| `audit_profile_changes()` | Registra cambios a perfiles en audit_logging |

### Utilidades

| Funcion | Descripcion |
|---------|-------------|
| `retry_helper_functions()` | Helpers para reintentos de operaciones |

### Funciones TEST (no produccion)

| Funcion | Descripcion |
|---------|-------------|
| `update_missions_on_complete_modules.TEST()` | Test para trigger de misiones por modulo |
| `update_missions_on_explore_modules.TEST()` | Test para trigger de misiones exploratorias |

---

## View (1)

### gamilit.number_series
Vista utilitaria que genera series numericas (helper para reportes y analytics).

---

## Notas

- **Sin tablas:** Este schema solo contiene logica (funciones, triggers, views).
- **Sin entities:** No se necesitan entities backend para este schema.
- **Dependencia:** Todos los schemas dependen de gamilit (debe cargarse primero en fase 2 del DDL).
- **Numeracion duplicada:** Algunos archivos comparten numero de prefijo (05, 09, 11, 15) - son funciones independientes.

---

*GAMILIT - Schema Reference: gamilit (utility)*
