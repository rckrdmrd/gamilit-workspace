# Funciones del Schema GAMILIT

**Schema:** `gamilit`
**Propósito:** Funciones y utilidades compartidas del sistema GAMILIT
**Total Funciones:** 16

---

## Categorías de Funciones

### 1. Funciones de Inicialización

Funciones ejecutadas automáticamente al crear nuevos usuarios/entidades.

#### `initialize_user_stats()`

**Archivo:** `04-initialize_user_stats.sql`
**Trigger:** `auth_management.profiles.trg_initialize_user_stats`
**Evento:** AFTER INSERT en `auth_management.profiles`
**Roles aplicables:** `student`, `admin_teacher`, `super_admin`

**Propósito:**
Inicializa estadísticas de gamificación para nuevos usuarios al momento del registro.

**Tablas Inicializadas (4):**

| # | Tabla | Schema | Descripción | FK Usado |
|---|-------|--------|-------------|----------|
| 1 | `user_stats` | `gamification_system` | Estadísticas base: XP, ML Coins, nivel | `auth.users.id` |
| 2 | `comodines_inventory` | `gamification_system` | Inventario de comodines (50/50, bomba, etc.) | `profiles.id` |
| 3 | `user_ranks` | `gamification_system` | Rango Maya inicial (Ajaw - nivel más bajo) | `auth.users.id` |
| 4 | `module_progress` | `progress_tracking` | Progreso de todos los módulos publicados | `profiles.id` |

**Valores Iniciales:**
- ML Coins: 100 (bono de bienvenida)
- Rango Maya: Ajaw (estudiante)
- Module Progress: `not_started`, 0% para todos los módulos publicados

**Flujo de Registro de Usuario:**

```
1. Backend crea usuario en auth.users
2. Backend crea perfil en auth_management.profiles
3. Trigger trg_initialize_user_stats se dispara
4. Función initialize_user_stats() ejecuta:
   ├─ INSERT en gamification_system.user_stats
   ├─ INSERT en gamification_system.comodines_inventory
   ├─ INSERT en gamification_system.user_ranks
   └─ INSERT en progress_tracking.module_progress (todos los módulos)
5. Usuario completo con gamificación lista
```

**Protecciones:**
- `ON CONFLICT DO NOTHING` en user_stats y comodines_inventory
- `WHERE NOT EXISTS` en user_ranks (no tiene unique constraint)
- Solo para roles con gamificación habilitada

**Bugs Corregidos (2025-11-24):**
1. Faltaba inicialización de `module_progress` (CRÍTICO)
2. Errores de clave duplicada en `user_ranks`
3. Llamada a función no implementada comentada
4. Documentación de FKs clarificada

**Ver:** `apps/database/docs/database/CHANGELOG.md` - [2.5.2] 2025-11-24

---

#### `set_profile_defaults()`

**Archivo:** `09-set_profile_defaults.sql`
**Propósito:** Establece valores por defecto en perfiles de usuario

---

### 2. Funciones de Auditoría

#### `audit_profile_changes()`

**Archivo:** `01-audit_profile_changes.sql`
**Propósito:** Registra cambios en perfiles de usuario para auditoría
**Trigger:** AFTER UPDATE en `auth_management.profiles`

---

### 3. Funciones de Contexto

Funciones que retornan información del contexto actual del usuario.

#### `get_current_user_id()`

**Archivo:** `02-get_current_user_id.sql`
**Retorna:** UUID del usuario actual
**Uso:** RLS policies, validaciones de permisos

---

#### `get_current_user_role()`

**Archivo:** `03-get_current_user_role.sql`
**Retorna:** Rol del usuario actual (student, admin_teacher, super_admin)
**Uso:** Control de acceso, RLS policies

---

#### `is_admin()`

**Archivo:** `05-is_admin.sql`
**Retorna:** BOOLEAN - true si usuario es admin_teacher o super_admin
**Uso:** RLS policies, endpoints administrativos

---

#### `is_super_admin()`

**Archivo:** `05b-is_super_admin.sql`
**Retorna:** BOOLEAN - true si usuario es super_admin
**Uso:** RLS policies, operaciones críticas

---

### 4. Funciones de Actualización

Funciones trigger que actualizan automáticamente campos calculados.

#### `update_user_stats_on_exercise_complete()`

**Archivo:** `14-update_user_stats_on_exercise_complete.sql`
**Propósito:** Actualiza estadísticas de usuario al completar ejercicios
**Trigger:** AFTER INSERT/UPDATE en `progress_tracking.exercise_submissions`
**Actualiza:** XP, ML Coins, nivel, módulos completados

---

#### `update_updated_at_column()`

**Archivo:** `15-update_updated_at_column.sql`
**Propósito:** Actualiza automáticamente `updated_at` en tablas
**Trigger:** BEFORE UPDATE en múltiples tablas
**Uso:** Auditoría de cambios, tracking de modificaciones

---

#### `update_classroom_member_count()`

**Archivo:** `10-update_classroom_member_count.sql`
**Propósito:** Actualiza contador de miembros en aulas
**Trigger:** AFTER INSERT/DELETE en `social_features.classroom_members`

---

#### `update_user_last_login()`

**Archivo:** `11-update_user_last_login.sql`
**Propósito:** Actualiza timestamp del último login
**Trigger:** Login exitoso

---

### 5. Funciones de Validación

Funciones de validación de datos de entrada.

#### `validate_email_format()`

**Archivo:** `12-validate_email_format.sql`
**Retorna:** BOOLEAN
**Valida:** Formato de email según RFC 5322 (simplificado)

---

#### `validate_username()`

**Archivo:** `13-validate_username.sql`
**Retorna:** BOOLEAN
**Valida:** Username (3-50 chars, alfanumérico + underscore)

---

#### `validate_date_range()`

**Archivo:** `validate_date_range.sql`
**Retorna:** BOOLEAN
**Valida:** Rangos de fechas (start_date < end_date)

---

### 6. Funciones de Utilidad

#### `now_mexico()`

**Archivo:** `08-now_mexico.sql`
**Retorna:** TIMESTAMP WITH TIME ZONE
**Propósito:** Timestamp actual en zona horaria de Ciudad de México
**Uso:** Seeds, defaults, auditoría

---

#### `set_default_tenant()`

**Archivo:** `11-set_default_tenant.sql`
**Propósito:** Establece tenant por defecto en nuevos registros
**Trigger:** BEFORE INSERT en tablas multi-tenant

---

#### `normalize_text()`

**Archivo:** `16-normalize_text.sql`
**Retorna:** TEXT
**Propósito:** Normaliza texto para búsquedas (lowercase, sin acentos)
**Uso:** Búsquedas case-insensitive, comparaciones

---

## Convenciones de Nomenclatura

- **Funciones de inicialización:** `initialize_*`
- **Funciones de actualización:** `update_*`
- **Funciones de validación:** `validate_*`
- **Funciones de contexto:** `get_*`, `is_*`
- **Funciones de configuración:** `set_*`

---

## Notas Importantes

### FKs en funciones de inicialización

**IMPORTANTE:** Diferentes tablas usan diferentes FKs:

- `auth.users.id` → Usada por: `user_stats`, `user_ranks`
- `profiles.id` → Usada por: `comodines_inventory`, `module_progress`

**Razón:** Diseño histórico. `profiles` es tabla puente entre auth.users y sistema GAMILIT.

**Referencia:** Ver comentarios inline en `04-initialize_user_stats.sql`

---

## Referencias

- **Triggers:** `apps/database/ddl/schemas/auth_management/triggers/`
- **CHANGELOG:** `apps/database/docs/database/CHANGELOG.md`
- **Inventario:** `orchestration/inventarios/DATABASE_INVENTORY.yml`
- **_MAP.md:** `apps/database/ddl/schemas/gamilit/_MAP.md`

---

**Última actualización:** 2025-11-24
**Mantenido por:** Database-Agent
