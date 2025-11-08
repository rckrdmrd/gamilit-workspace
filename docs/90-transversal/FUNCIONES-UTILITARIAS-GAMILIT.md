# Funciones Utilitarias Globales - Schema: gamilit

**Schema:** `gamilit`
**Propósito:** Funciones helper reutilizables en toda la base de datos
**Total de funciones:** 13
**Estado:** ✅ Implementado
**Última actualización:** 2025-11-08

---

## 📋 Descripción

El schema `gamilit` contiene funciones utilitarias globales que son utilizadas por múltiples schemas a través de triggers, RLS policies y procedimientos almacenados. Estas funciones proporcionan funcionalidad común y reutilizable.

---

## 📊 Categorías de Funciones

| Categoría | Cantidad | Funciones |
|-----------|----------|-----------|
| **Auditoría** | 1 | audit_profile_changes |
| **Autenticación/Autorización** | 3 | get_current_user_id, get_current_user_role, is_admin |
| **Inicialización** | 2 | initialize_user_stats, set_profile_defaults |
| **Fecha/Hora** | 1 | now_mexico |
| **Triggers Helper** | 1 | update_updated_at_column |
| **Validación** | 2 | validate_email_format, validate_username |
| **Contadores** | 2 | update_classroom_member_count, update_user_last_login |
| **Gamificación** | 1 | update_user_stats_on_exercise_complete |

---

## 🔐 CATEGORÍA: AUDITORÍA

### 1. `audit_profile_changes()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/01-audit_profile_changes.sql`

**Propósito:** Registra cambios en perfiles de usuario para auditoría

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.audit_profile_changes()
RETURNS TRIGGER
```

**Parámetros:**
- Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Uso:**
```sql
CREATE TRIGGER trg_audit_profile_changes
AFTER UPDATE ON auth_management.profiles
FOR EACH ROW
EXECUTE FUNCTION gamilit.audit_profile_changes();
```

**Usado por:**
- Trigger en `auth_management.profiles`
- Sistema de auditoría

**Comportamiento:**
- Registra cambios en campos importantes del perfil
- Almacena estado anterior y nuevo
- Registra timestamp y usuario que realizó el cambio

---

## 🔑 CATEGORÍA: AUTENTICACIÓN/AUTORIZACIÓN

### 2. `get_current_user_id()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql`

**Propósito:** Obtiene el UUID del usuario actual de la sesión PostgreSQL

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.get_current_user_id()
RETURNS UUID
```

**Parámetros:** Ninguno

**Retorno:** `UUID` - ID del usuario actual o NULL

**Uso:**
```sql
SELECT gamilit.get_current_user_id();
-- Retorna: '550e8400-e29b-41d4-a716-446655440000'
```

**Usado por:**
- RLS policies en todos los schemas
- Triggers de auditoría
- Validaciones de permisos

**Implementación:**
Obtiene el user_id del JWT token almacenado en `current_setting('request.jwt.claims')` o de variables de sesión.

**Seguridad:** `STABLE SECURITY DEFINER`

---

### 3. `get_current_user_role()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/03-get_current_user_role.sql`

**Propósito:** Obtiene el rol del usuario actual

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.get_current_user_role()
RETURNS auth_management.gamilit_role
```

**Parámetros:** Ninguno

**Retorno:** `auth_management.gamilit_role` - Rol del usuario (student, admin_teacher, super_admin)

**Uso:**
```sql
SELECT gamilit.get_current_user_role();
-- Retorna: 'student' | 'admin_teacher' | 'super_admin'
```

**Usado por:**
- RLS policies para control de acceso basado en roles
- Validaciones de permisos
- Lógica condicional en funciones

**Ejemplo en RLS:**
```sql
CREATE POLICY teacher_access ON progress_tracking.exercise_attempts
FOR SELECT
USING (gamilit.get_current_user_role() = 'admin_teacher'::auth_management.gamilit_role);
```

**Seguridad:** `STABLE`

---

### 4. `is_admin()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/05-is_admin.sql`

**Propósito:** Verifica si el usuario actual es administrador (teacher o super_admin)

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.is_admin()
RETURNS BOOLEAN
```

**Parámetros:** Ninguno

**Retorno:** `BOOLEAN` - TRUE si es admin, FALSE si no

**Uso:**
```sql
SELECT gamilit.is_admin();
-- Retorna: true | false
```

**Lógica:**
```sql
-- Verifica si el rol está en ('admin_teacher', 'super_admin')
-- Y el status es 'active'
```

**Usado por:**
- RLS policies para funcionalidad admin-only
- Validaciones de permisos críticos
- Funciones que requieren privilegios elevados

**Ejemplo:**
```sql
CREATE POLICY admin_can_delete ON some_table
FOR DELETE
USING (gamilit.is_admin());
```

**Seguridad:** `STABLE SECURITY DEFINER`

**Manejo de errores:** Retorna FALSE en caso de excepción

---

## 🎯 CATEGORÍA: INICIALIZACIÓN

### 5. `initialize_user_stats()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`

**Propósito:** Inicializa estadísticas de gamificación para un nuevo usuario

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.initialize_user_stats()
RETURNS TRIGGER
```

**Parámetros:** Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Uso:**
```sql
CREATE TRIGGER trg_initialize_user_stats
AFTER INSERT ON auth_management.profiles
FOR EACH ROW
EXECUTE FUNCTION gamilit.initialize_user_stats();
```

**Comportamiento:**
- Crea registro en `gamification_system.user_stats` con valores iniciales:
  - `total_xp = 0`
  - `level = 1`
  - `ml_coins_balance = 0`
  - `current_streak = 0`
- Se ejecuta automáticamente al crear un perfil

**Usado por:**
- Trigger en `auth_management.profiles` (INSERT)

---

### 6. `set_profile_defaults()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/09-set_profile_defaults.sql`

**Propósito:** Establece valores por defecto en perfil de usuario

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.set_profile_defaults()
RETURNS TRIGGER
```

**Parámetros:** Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Comportamiento:**
- Asigna valores por defecto si no se proporcionaron
- Genera username automático si es NULL
- Establece avatar por defecto
- Configura timezone según región

**Usado por:**
- Trigger en `auth_management.profiles` (BEFORE INSERT)

---

## ⏰ CATEGORÍA: FECHA/HORA

### 7. `now_mexico()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/08-now_mexico.sql`

**Propósito:** Retorna timestamp actual en zona horaria de México (America/Mexico_City)

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMP WITH TIME ZONE
```

**Parámetros:** Ninguno

**Retorno:** `TIMESTAMPTZ` - Timestamp actual en zona horaria de México

**Uso:**
```sql
SELECT gamilit.now_mexico();
-- Retorna: '2025-11-08 01:45:00-06'

-- En defaults de columnas:
created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
```

**Usado por:**
- Defaults de columnas `created_at` y `updated_at` en ~50+ tablas
- Funciones que requieren timestamp actual
- Cálculos de fecha/hora

**Nota:** Marcada como `IMMUTABLE` para optimización

**Diferencia con NOW():**
```sql
-- NOW() retorna UTC o timezone del servidor
-- now_mexico() retorna siempre en timezone de México
```

---

## ⚡ CATEGORÍA: TRIGGERS HELPER

### 8. `update_updated_at_column()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/09-update_updated_at_column.sql`

**Propósito:** Actualiza automáticamente el campo `updated_at` en updates

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_updated_at_column()
RETURNS TRIGGER
```

**Parámetros:** Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Comportamiento:**
```sql
-- En cada UPDATE, automáticamente:
NEW.updated_at = gamilit.now_mexico();
RETURN NEW;
```

**Uso:**
```sql
CREATE TRIGGER trg_table_updated_at
BEFORE UPDATE ON schema.table
FOR EACH ROW
EXECUTE FUNCTION gamilit.update_updated_at_column();
```

**Usado por:** ~30+ triggers en todo el sistema

**Tablas que lo usan:**
- `auth_management.*` (12 tablas)
- `gamification_system.*` (13 tablas)
- `educational_content.*` (4 tablas)
- `progress_tracking.*` (5 tablas)
- `social_features.*` (7 tablas)
- `system_configuration.*` (3 tablas)
- Y más...

**Beneficio:** Garantiza que `updated_at` siempre refleja la última modificación

---

## ✅ CATEGORÍA: VALIDACIÓN

### 9. `validate_email_format()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/12-validate_email_format.sql`

**Propósito:** Valida que un email tenga formato correcto

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.validate_email_format(email TEXT)
RETURNS BOOLEAN
```

**Parámetros:**
- `email` (TEXT) - Email a validar

**Retorno:** `BOOLEAN` - TRUE si válido, FALSE si no

**Uso:**
```sql
SELECT gamilit.validate_email_format('user@example.com');
-- Retorna: true

SELECT gamilit.validate_email_format('invalid-email');
-- Retorna: false

-- En constraint:
ALTER TABLE users ADD CONSTRAINT valid_email
CHECK (gamilit.validate_email_format(email));
```

**Regex usado:**
```regex
^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$
```

**Usado por:**
- Constraints en `auth_management.profiles`
- Validaciones de formularios (via backend)

---

### 10. `validate_username()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/13-validate_username.sql`

**Propósito:** Valida formato de username (alfanumérico, guiones, sin espacios)

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.validate_username(username TEXT)
RETURNS BOOLEAN
```

**Parámetros:**
- `username` (TEXT) - Username a validar

**Retorno:** `BOOLEAN` - TRUE si válido, FALSE si no

**Uso:**
```sql
SELECT gamilit.validate_username('john_doe123');
-- Retorna: true

SELECT gamilit.validate_username('john doe');  -- espacios
-- Retorna: false

SELECT gamilit.validate_username('a');  -- muy corto
-- Retorna: false
```

**Reglas de validación:**
- Mínimo 3 caracteres
- Máximo 30 caracteres
- Solo letras, números, guiones bajos y guiones medios
- Sin espacios
- Sin caracteres especiales

**Regex:**
```regex
^[A-Za-z0-9_-]{3,30}$
```

**Usado por:**
- Constraints en `auth_management.profiles`
- Validaciones en registro de usuario

---

## 🔢 CATEGORÍA: CONTADORES

### 11. `update_classroom_member_count()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/10-update_classroom_member_count.sql`

**Propósito:** Actualiza contador de miembros en un aula al agregar/remover estudiantes

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_classroom_member_count()
RETURNS TRIGGER
```

**Parámetros:** Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Comportamiento:**
```sql
-- Al INSERT en classroom_members:
UPDATE classrooms SET member_count = member_count + 1

-- Al DELETE en classroom_members:
UPDATE classrooms SET member_count = member_count - 1
```

**Uso:**
```sql
CREATE TRIGGER trg_update_classroom_count
AFTER INSERT OR DELETE ON social_features.classroom_members
FOR EACH ROW
EXECUTE FUNCTION gamilit.update_classroom_member_count();
```

**Usado por:**
- Trigger en `social_features.classroom_members`

**Beneficio:** Mantiene contador sincronizado sin queries adicionales

---

### 12. `update_user_last_login()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/11-update_user_last_login.sql`

**Propósito:** Actualiza timestamp de último login del usuario

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_last_login(p_user_id UUID)
RETURNS VOID
```

**Parámetros:**
- `p_user_id` (UUID) - ID del usuario

**Retorno:** `VOID`

**Uso:**
```sql
-- Llamada desde backend al hacer login exitoso:
SELECT gamilit.update_user_last_login('550e8400-e29b-41d4-a716-446655440000');
```

**Comportamiento:**
```sql
UPDATE auth_management.profiles
SET last_login_at = gamilit.now_mexico()
WHERE id = p_user_id;
```

**Usado por:**
- Auth service en backend (al hacer login)
- Analytics para calcular usuarios activos

---

## 🎮 CATEGORÍA: GAMIFICACIÓN

### 13. `update_user_stats_on_exercise_complete()`

**Archivo:** `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`

**Propósito:** Actualiza estadísticas de usuario al completar un ejercicio (XP, ML Coins, racha)

**Firma:**
```sql
CREATE OR REPLACE FUNCTION gamilit.update_user_stats_on_exercise_complete()
RETURNS TRIGGER
```

**Parámetros:** Ninguno (función trigger)

**Retorno:** `TRIGGER`

**Comportamiento:**
```sql
-- Al completar ejercicio con éxito:
1. Incrementa XP según dificultad del ejercicio
2. Otorga ML Coins
3. Actualiza racha diaria (streak)
4. Recalcula nivel si XP suficiente
5. Verifica y desbloquea achievements
```

**Uso:**
```sql
CREATE TRIGGER trg_update_stats_on_exercise
AFTER INSERT ON progress_tracking.exercise_attempts
FOR EACH ROW
WHEN (NEW.status = 'completed' AND NEW.is_correct = true)
EXECUTE FUNCTION gamilit.update_user_stats_on_exercise_complete();
```

**Usado por:**
- Trigger en `progress_tracking.exercise_attempts`

**Lógica de recompensas:**
```sql
-- XP según dificultad:
beginner: 10 XP
intermediate: 20 XP
advanced: 30 XP
expert: 50 XP

-- ML Coins: Variable según configuración (default: 10 coins)
-- Streak: +1 si ejercicio completado en día actual
```

**Interdependencias:**
- Lee de `educational_content.exercises` (dificultad)
- Actualiza `gamification_system.user_stats`
- Llama a `gamification_system.check_and_award_achievements()`

---

## 📊 DIAGRAMA DE DEPENDENCIAS

```
Funciones Base (sin dependencias):
├── now_mexico()
└── validate_email_format()
    validate_username()

Funciones de Sesión:
├── get_current_user_id()
└── get_current_user_role() ──> usa: get_current_user_id()
    └── is_admin() ──> usa: get_current_user_role()

Triggers de Auditoría/Actualización:
├── update_updated_at_column() ──> usa: now_mexico()
├── audit_profile_changes() ──> usa: get_current_user_id(), now_mexico()
└── update_user_last_login() ──> usa: now_mexico()

Triggers de Inicialización:
├── set_profile_defaults()
└── initialize_user_stats() ──> crea registro en user_stats

Triggers de Contadores:
└── update_classroom_member_count()

Triggers de Gamificación:
└── update_user_stats_on_exercise_complete()
    ├── usa: gamification_system.check_and_award_achievements()
    └── usa: gamification_system.calculate_level_from_xp()
```

---

## 🔗 SCHEMAS QUE USAN ESTAS FUNCIONES

| Schema | Funciones Usadas | Uso Principal |
|--------|------------------|---------------|
| **auth_management** | get_current_user_id, get_current_user_role, is_admin, update_updated_at_column, audit_profile_changes, initialize_user_stats, set_profile_defaults, now_mexico | RLS, triggers, validación |
| **gamification_system** | get_current_user_id, update_updated_at_column, update_user_stats_on_exercise_complete, now_mexico | RLS, triggers, gamificación |
| **educational_content** | get_current_user_id, get_current_user_role, update_updated_at_column, now_mexico | RLS, triggers |
| **progress_tracking** | get_current_user_id, get_current_user_role, update_updated_at_column, update_user_stats_on_exercise_complete, now_mexico | RLS, triggers, tracking |
| **social_features** | get_current_user_id, is_admin, update_updated_at_column, update_classroom_member_count, now_mexico | RLS, triggers, contadores |
| **system_configuration** | is_admin, update_updated_at_column, now_mexico | RLS, triggers |
| **audit_logging** | get_current_user_id, now_mexico | Auditoría |
| **content_management** | get_current_user_role, is_admin, now_mexico | RLS, permisos |

---

## ⚠️ CONSIDERACIONES IMPORTANTES

### Seguridad

1. **SECURITY DEFINER:**
   - `is_admin()` - Ejecuta con permisos del creador
   - **Riesgo:** Puede escalar privilegios si no se valida correctamente
   - **Mitigación:** Incluye validaciones exhaustivas

2. **STABLE vs VOLATILE:**
   - `get_current_user_id()` - STABLE (no modifica BD)
   - `get_current_user_role()` - STABLE (cacheable en query)
   - `now_mexico()` - IMMUTABLE (optimización incorrecta, debería ser STABLE)

3. **Validación de entrada:**
   - `validate_email_format()` y `validate_username()` usan regex
   - Protegen contra inyección SQL en constraints

### Performance

1. **Funciones más llamadas:**
   - `update_updated_at_column()` - ~30+ triggers
   - `now_mexico()` - ~50+ defaults + triggers
   - `get_current_user_id()` - Cientos de RLS policies

2. **Optimización:**
   - Funciones STABLE se cachean por transacción
   - Evitar lógica compleja en funciones de triggers masivos

3. **Monitoreo:**
   - Rastrear tiempo de ejecución de `update_user_stats_on_exercise_complete()`
   - Es la función más compleja (actualiza múltiples tablas)

### Mantenimiento

1. **Cambios en firmas:**
   - Verificar TODAS las dependencias antes de modificar
   - Usar `pg_depend` para encontrar objetos dependientes

2. **Versionado:**
   - Documentar cambios en funciones críticas
   - Considerar functions versionadas (`get_user_role_v2`)

3. **Testing:**
   - Tests unitarios para cada función
   - Tests de integración para funciones complejas

---

## 🎯 MEJORES PRÁCTICAS

### Al Usar Estas Funciones

1. **RLS Policies:**
   ```sql
   -- ✅ Correcto:
   USING (user_id = gamilit.get_current_user_id())

   -- ❌ Evitar llamar múltiples veces en mismo query:
   USING (user_id = gamilit.get_current_user_id() OR
          created_by = gamilit.get_current_user_id())

   -- ✅ Mejor:
   USING (gamilit.get_current_user_id() IN (user_id, created_by))
   ```

2. **Triggers:**
   ```sql
   -- ✅ Especificar WHEN para evitar ejecuciones innecesarias:
   CREATE TRIGGER trg_name
   AFTER UPDATE ON table
   FOR EACH ROW
   WHEN (NEW.status <> OLD.status)  -- Solo si cambió status
   EXECUTE FUNCTION gamilit.some_function();
   ```

3. **Validaciones:**
   ```sql
   -- ✅ Usar en constraints:
   ALTER TABLE users ADD CONSTRAINT valid_username
   CHECK (gamilit.validate_username(username));

   -- También validar en backend como primera línea de defensa
   ```

---

## 📝 PRÓXIMOS PASOS

### Mejoras Sugeridas

1. **Documentación de código:**
   - Agregar ejemplos de uso en comentarios SQL
   - Documentar casos edge y manejo de errores

2. **Testing:**
   - Crear suite de tests para cada función
   - Tests de performance para funciones críticas

3. **Monitoring:**
   - Agregar métricas de llamadas y tiempo de ejecución
   - Alertas para funciones que excedan thresholds

4. **Nuevas funciones útiles:**
   - `gamilit.is_teacher()` - Verificar solo admin_teacher
   - `gamilit.is_super_admin()` - Verificar solo super_admin
   - `gamilit.get_user_tenant_id()` - Obtener tenant del usuario
   - `gamilit.log_error()` - Función helper para logging

---

## 🔗 Referencias

- **Directorio:** `apps/database/ddl/schemas/gamilit/functions/`
- **_MAP.md:** `apps/database/ddl/schemas/gamilit/functions/_MAP.md`
- **Dependencias:** Ver diagrama de dependencias arriba
- **Usado por:** Todos los schemas de GAMILIT

---

**Creado:** 2025-11-08
**Tipo:** Documentación retroactiva
**Total de funciones:** 13
**Estado:** ✅ Documentación completa
