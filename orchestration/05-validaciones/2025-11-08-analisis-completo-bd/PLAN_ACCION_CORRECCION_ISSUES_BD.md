# PLAN DE ACCIÓN: Corrección de Issues de Base de Datos GAMILIT
**Fecha:** 2025-11-08
**Objetivo:** Corregir 14 issues detectados + validación completa de coherencia
**Esfuerzo estimado:** 21.5 horas de corrección + 4 horas de validación = 25.5 horas (~3.5 días)

---

## ÍNDICE
1. [Fase 1: Corrección de Issues Críticos](#fase-1-corrección-de-issues-críticos)
2. [Fase 2: Corrección de Issues de Documentación](#fase-2-corrección-de-issues-de-documentación)
3. [Fase 3: Optimización y Consolidación](#fase-3-optimización-y-consolidación)
4. [Fase 4: Validación Completa](#fase-4-validación-completa)
5. [Checklist Final](#checklist-final)

---

## FASE 1: CORRECCIÓN DE ISSUES CRÍTICOS
**Duración estimada:** 7 horas
**Prioridad:** 🔴 CRÍTICA - Ejecutar primero

---

### TASK 1.1: Corregir referencia a `public.gamilit_role` → `auth_management.gamilit_role`
**Issue:** P0-001
**Severidad:** 🔴 CRÍTICO - BLOQUEANTE
**Esfuerzo:** 3 horas
**Plan existente:** ✅ `orchestration/05-validaciones/consolidacion/PLAN-CONSOLIDACION-ENUM-GAMILIT-ROLE-2025-11-07.md`

#### Pasos:
1. **Identificar archivos afectados** (11 archivos según reporte)
   ```bash
   cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
   grep -r "public\.gamilit_role" ddl/ --include="*.sql"
   ```

2. **Crear backup de archivos afectados**
   ```bash
   mkdir -p backups/2025-11-08-gamilit-role-fix
   grep -rl "public\.gamilit_role" ddl/ --include="*.sql" | xargs -I {} cp {} backups/2025-11-08-gamilit-role-fix/
   ```

3. **Reemplazar todas las referencias**
   ```bash
   find ddl/ -name "*.sql" -type f -exec sed -i 's/public\.gamilit_role/auth_management.gamilit_role/g' {} +
   ```

4. **Verificar cambios**
   ```bash
   # Verificar que no queden referencias a public.gamilit_role
   grep -r "public\.gamilit_role" ddl/ --include="*.sql"
   # Debe retornar: (ningún resultado)

   # Verificar que las nuevas referencias existen
   grep -r "auth_management\.gamilit_role" ddl/ --include="*.sql" | wc -l
   # Debe retornar: al menos 11 líneas
   ```

5. **Validar sintaxis SQL**
   ```bash
   # Validar cada archivo modificado con psql --dry-run (si disponible)
   # O usar pg_format para validar sintaxis
   for file in $(grep -rl "auth_management\.gamilit_role" ddl/ --include="*.sql"); do
       echo "Validando: $file"
       psql -U postgres -d gamilit_dev --set ON_ERROR_STOP=on --dry-run -f "$file" 2>&1 | grep -i error
   done
   ```

6. **Documentar cambio**
   ```bash
   cat > ddl/CHANGELOG-2025-11-08-gamilit-role-fix.md << 'EOF'
   # Changelog: Corrección gamilit_role enum reference

   **Fecha:** 2025-11-08
   **Issue:** P0-001
   **Cambio:** Corregir referencia incorrecta de `public.gamilit_role` a `auth_management.gamilit_role`

   ## Archivos modificados:
   - [Listar archivos modificados]

   ## Razón:
   El enum `gamilit_role` nunca existió en el schema `public`.
   El enum correcto siempre fue `auth_management.gamilit_role`.

   ## Impacto:
   - Desbloquea 11 archivos SQL
   - Permite creación correcta de tablas que dependen del enum
   - Permite ejecución de RLS policies
   EOF
   ```

#### Validación Post-Corrección:
- [ ] No hay más referencias a `public.gamilit_role`
- [ ] Todas las referencias apuntan a `auth_management.gamilit_role`
- [ ] Sintaxis SQL validada sin errores
- [ ] Changelog documentado

---

### TASK 1.2: Documentar schema `system_configuration`
**Issue:** CRITICAL-001
**Severidad:** 🔴 CRÍTICO
**Esfuerzo:** 4 horas

#### Pasos:

**1. Crear estructura de documentación**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs

# Determinar en qué fase/épica va
# Opción A: Crear nueva épica en fase-alcance-inicial
mkdir -p 01-fase-alcance-inicial/EAI-006-configuracion-sistema/{requerimientos,especificaciones,historias-usuario,implementacion,pruebas}

# Opción B: Agregar a épica existente (ej: EAI-005-admin-base)
mkdir -p 01-fase-alcance-inicial/EAI-005-admin-base/requerimientos-adicionales
```

**2. Crear requerimientos funcionales**

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/requerimientos/RF-SYS-001-settings.md`
```markdown
# RF-SYS-001: Sistema de Configuración Global

## Descripción
La plataforma debe permitir configurar parámetros del sistema de forma centralizada.

## Requerimientos
1. Almacenar configuraciones clave-valor del sistema
2. Configuraciones con tipos de datos flexibles (JSON)
3. Versionado de cambios de configuración
4. Auditoría de modificaciones

## Alcance
- Tabla `system_settings` para configuraciones globales
- Validación de tipos de datos
- Permisos de modificación solo para administradores

## Prioridad
Alta

## Estado
Implementado
```

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/requerimientos/RF-SYS-002-feature-flags.md`
```markdown
# RF-SYS-002: Feature Flags (Banderas de Funcionalidad)

## Descripción
Sistema de feature flags para habilitar/deshabilitar funcionalidades dinámicamente.

## Requerimientos
1. Activar/desactivar features sin redesplegar código
2. Feature flags por ambiente (dev, staging, prod)
3. Feature flags por tenant
4. Programación de activación de features

## Alcance
- Tabla `feature_flags`
- API para consultar estado de features
- Panel de administración para gestionar flags

## Prioridad
Alta

## Estado
Implementado
```

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/requerimientos/RF-SYS-003-notifications.md`
```markdown
# RF-SYS-003: Configuración de Notificaciones

## Descripción
Configurar preferencias de notificaciones del sistema.

## Requerimientos
1. Configurar canales de notificación (email, push, in-app)
2. Templates de notificaciones
3. Configuración por tipo de evento

## Alcance
- Tabla `notification_settings`
- Integración con sistema de notificaciones

## Prioridad
Media

## Estado
Implementado
```

**3. Crear especificaciones técnicas**

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/especificaciones/ET-SYS-001-database-schema.md`
```markdown
# ET-SYS-001: Schema de Base de Datos para Configuración

## Schema
`system_configuration`

## Tablas

### 1. system_settings
**Propósito:** Almacenar configuraciones globales del sistema

**Columnas:**
- `id` UUID PK
- `key` VARCHAR UNIQUE - Clave de configuración
- `value` JSONB - Valor (flexible)
- `data_type` VARCHAR - Tipo de dato esperado
- `description` TEXT
- `is_public` BOOLEAN - Si es visible públicamente
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

**Índices:**
- idx_system_settings_key (UNIQUE)

### 2. feature_flags
**Propósito:** Feature flags dinámicos

**Columnas:**
- `id` UUID PK
- `flag_name` VARCHAR UNIQUE
- `is_enabled` BOOLEAN
- `rollout_percentage` INTEGER (0-100)
- `tenant_id` UUID (opcional)
- `environment` VARCHAR
- `description` TEXT
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

**Índices:**
- idx_feature_flags_name
- idx_feature_flags_tenant

### 3. notification_settings
**Propósito:** Configuración de notificaciones

**Columnas:**
- `id` UUID PK
- `notification_type` VARCHAR
- `channel` VARCHAR (email, push, in-app)
- `template` TEXT
- `is_enabled` BOOLEAN
- `created_at` TIMESTAMPTZ
- `updated_at` TIMESTAMPTZ

## Triggers
- `trg_system_settings_updated_at` - Actualiza updated_at
- `trg_feature_flags_updated_at` - Actualiza updated_at

## RLS Policies
- Solo administradores pueden modificar
- Lectura pública para configuraciones marcadas como `is_public`

## Referencias
- RF-SYS-001, RF-SYS-002, RF-SYS-003
```

**4. Crear TRACEABILITY.yml**

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/implementacion/TRACEABILITY.yml`
```yaml
epic_code: EAI-006
epic_name: Configuración del Sistema
phase: 1
phase_name: Alcance Inicial
status: completed

documentation:
  requirements:
    - id: RF-SYS-001
      file: requerimientos/RF-SYS-001-settings.md
      title: Sistema de Configuración Global
      status: implemented

    - id: RF-SYS-002
      file: requerimientos/RF-SYS-002-feature-flags.md
      title: Feature Flags
      status: implemented

    - id: RF-SYS-003
      file: requerimientos/RF-SYS-003-notifications.md
      title: Configuración de Notificaciones
      status: implemented

  specifications:
    - id: ET-SYS-001
      file: especificaciones/ET-SYS-001-database-schema.md
      rf: [RF-SYS-001, RF-SYS-002, RF-SYS-003]
      title: Schema de Base de Datos
      status: implemented

implementation:
  database:
    schemas:
      - name: system_configuration
        path: apps/database/ddl/schemas/system_configuration/
        description: Configuración del sistema

    tables:
      - name: system_settings
        schema: system_configuration
        file: apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql
        description: Configuraciones globales
        rf: RF-SYS-001

      - name: feature_flags
        schema: system_configuration
        file: apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql
        description: Feature flags dinámicos
        rf: RF-SYS-002

      - name: notification_settings
        schema: system_configuration
        file: apps/database/ddl/schemas/system_configuration/tables/03-notification_settings.sql
        description: Configuración de notificaciones
        rf: RF-SYS-003

    triggers:
      - name: trg_feature_flags_updated_at
        table: feature_flags
        file: apps/database/ddl/schemas/system_configuration/triggers/29-trg_feature_flags_updated_at.sql
        rf: RF-SYS-002

      - name: trg_system_settings_updated_at
        table: system_settings
        file: apps/database/ddl/schemas/system_configuration/triggers/30-trg_system_settings_updated_at.sql
        rf: RF-SYS-001

    rls_policies:
      - name: system_configuration_policies
        file: apps/database/ddl/schemas/system_configuration/rls-policies/01-policies.sql
        rf: [RF-SYS-001, RF-SYS-002, RF-SYS-003]
```

**5. Crear _MAP.md del schema**

Archivo: `docs/01-fase-alcance-inicial/EAI-006-configuracion-sistema/_MAP.md`
```markdown
# _MAP: EAI-006 - Configuración del Sistema

**Épica:** EAI-006
**Nombre:** Configuración del Sistema
**Fase:** 1 - Alcance Inicial
**Estado:** ✅ Completado (documentación retroactiva)

## Propósito
Sistema de configuración centralizada para la plataforma.

## Contenido
- 3 RF (RF-SYS-001 a RF-SYS-003)
- 1 ET (ET-SYS-001)
- 1 TRACEABILITY.yml

## Módulos Afectados
- BD: `system_configuration` schema
- Backend: `config` module (pendiente documentar)
```

#### Validación Post-Documentación:
- [ ] 3 archivos RF creados
- [ ] 1 archivo ET creado
- [ ] TRACEABILITY.yml completo
- [ ] _MAP.md creado
- [ ] Todas las tablas/triggers documentados

---

### TASK 1.3: Documentar schema `storage`
**Issue:** CRITICAL-002
**Severidad:** 🔴 CRÍTICO
**Esfuerzo:** 30 minutos

#### Pasos:

**1. Investigar propósito del enum `buckettype`**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database
cat ddl/schemas/storage/enums/buckettype.sql
grep -r "buckettype" ddl/ --include="*.sql"
```

**2. Crear documentación mínima**

Archivo: `docs/90-transversal/STORAGE-SYSTEM.md`
```markdown
# Sistema de Almacenamiento (Storage)

## Schema: `storage`

### Propósito
Integración con sistema de almacenamiento de archivos (probablemente Supabase Storage).

### Objetos

#### Enum: `buckettype`
**Archivo:** `apps/database/ddl/schemas/storage/enums/buckettype.sql`

**Valores:**
- [Listar valores después de leer el archivo]

**Uso:**
- [Describir dónde se usa este enum]

### Referencias
- Integración con Supabase Storage
- Usado por: [Listar tablas que lo usan]
```

**3. Agregar referencia en TRACEABILITY si aplica**

Si el enum es usado por otras tablas, agregarlo al TRACEABILITY de esa épica.

#### Validación:
- [ ] Documentación creada
- [ ] Propósito del enum clarificado
- [ ] Referencias identificadas

---

## FASE 2: CORRECCIÓN DE ISSUES DE DOCUMENTACIÓN
**Duración estimada:** 10 horas
**Prioridad:** 🟡 ALTA - Ejecutar después de Fase 1

---

### TASK 2.1: Documentar funciones utilitarias del schema `gamilit`
**Issue:** ISSUE-009
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 3 horas

#### Pasos:

**1. Crear documento maestro de funciones utilitarias**

Archivo: `docs/90-transversal/FUNCIONES-UTILITARIAS.md`
```markdown
# Funciones Utilitarias Globales (Schema: gamilit)

## Propósito
Funciones helper reutilizables en toda la base de datos.

## Categorías

### Auditoría
1. **audit_profile_changes()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/01-audit_profile_changes.sql`
   - **Propósito:** Registra cambios en perfiles de usuario
   - **Parámetros:** [Detallar]
   - **Retorno:** [Detallar]
   - **Usado por:** Trigger en `auth_management.profiles`

### Autenticación/Autorización
2. **get_current_user_id()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql`
   - **Propósito:** Obtiene ID del usuario actual de la sesión
   - **Retorno:** UUID
   - **Usado por:** RLS policies, triggers

3. **get_current_user_role()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/03-get_current_user_role.sql`
   - **Propósito:** Obtiene rol del usuario actual
   - **Retorno:** gamilit_role
   - **Usado por:** RLS policies

4. **is_admin()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/05-is_admin.sql`
   - **Propósito:** Verifica si usuario actual es admin
   - **Retorno:** BOOLEAN
   - **Usado por:** RLS policies

### Inicialización
5. **initialize_user_stats()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/04-initialize_user_stats.sql`
   - **Propósito:** Inicializa estadísticas para nuevo usuario
   - **Parámetros:** user_id UUID
   - **Usado por:** Trigger en `auth_management.profiles`

6. **set_profile_defaults()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/09-set_profile_defaults.sql`
   - **Propósito:** Establece valores por defecto en perfil
   - **Usado por:** Trigger en creación de perfil

### Utilidades de Fecha/Hora
7. **now_mexico()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/08-now_mexico.sql`
   - **Propósito:** Retorna timestamp actual en zona horaria de México
   - **Retorno:** TIMESTAMPTZ
   - **Usado por:** Defaults de created_at/updated_at en múltiples tablas

### Triggers Helper
8. **update_updated_at_column()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/09-update_updated_at_column.sql`
   - **Propósito:** Función trigger para actualizar updated_at automáticamente
   - **Retorno:** TRIGGER
   - **Usado por:** ~30+ triggers en todo el sistema

### Validación
9. **validate_email_format()**
   - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/12-validate_email_format.sql`
   - **Propósito:** Valida formato de email
   - **Parámetros:** email TEXT
   - **Retorno:** BOOLEAN
   - **Usado por:** Constraints en tablas de usuario

10. **validate_username()**
    - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/13-validate_username.sql`
    - **Propósito:** Valida formato de username
    - **Parámetros:** username TEXT
    - **Retorno:** BOOLEAN
    - **Usado por:** Constraints en perfiles

### Contadores
11. **update_classroom_member_count()**
    - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/10-update_classroom_member_count.sql`
    - **Propósito:** Actualiza contador de miembros en aula
    - **Usado por:** Trigger en `social_features.classroom_members`

12. **update_user_last_login()**
    - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/11-update_user_last_login.sql`
    - **Propósito:** Actualiza timestamp de último login
    - **Usado por:** Auth service en backend

### Gamificación
13. **update_user_stats_on_exercise_complete()**
    - **Archivo:** `apps/database/ddl/schemas/gamilit/functions/14-update_user_stats_on_exercise_complete.sql`
    - **Propósito:** Actualiza estadísticas al completar ejercicio
    - **Usado por:** Trigger en `progress_tracking.exercise_attempts`

## Diagrama de Dependencias
```
[Crear diagrama mostrando qué tablas/triggers usan cada función]
```

## Recomendaciones
- No modificar estas funciones sin revisar impacto en todos los schemas
- Mantener funciones genéricas y reutilizables
- Documentar cualquier cambio de firma
```

**2. Crear TRACEABILITY para utilidades**

Archivo: `docs/90-transversal/TRACEABILITY-UTILIDADES.yml`
```yaml
component: gamilit-utilities
type: database-functions
scope: global

implementation:
  database:
    schema: gamilit
    functions:
      - name: audit_profile_changes
        file: apps/database/ddl/schemas/gamilit/functions/01-audit_profile_changes.sql
        category: auditing

      - name: get_current_user_id
        file: apps/database/ddl/schemas/gamilit/functions/02-get_current_user_id.sql
        category: auth

      # [Agregar todas las 13 funciones]

dependencies:
  used_by_schemas:
    - auth_management
    - gamification_system
    - progress_tracking
    - social_features
    - educational_content
    - audit_logging
```

#### Validación:
- [ ] 13 funciones documentadas
- [ ] Categorías claras (auditoría, auth, validación, etc.)
- [ ] Parámetros y retornos especificados
- [ ] Dependencias identificadas

---

### TASK 2.2: Completar documentación de `social_features`
**Issue:** ISSUE-003
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 2 horas

#### Pasos:

**1. Buscar documentación existente**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/docs
find . -name "*social*" -o -name "*SOC-*" -o -name "*classroom*"
grep -r "social_features" . --include="*.yml" --include="*.md"
```

**2. Verificar en qué épica corresponde**
- Buscar en EAI-005-admin-base
- Buscar en EXT-* (extensiones)
- Puede estar en "Portal de Maestros" (EXT-001)

**3. Completar TRACEABILITY existente o crear nuevo**

Si existe documentación parcial, completarla.
Si no existe, crear en épica apropiada (probablemente EXT-001 o crear EXT-SOC).

**4. Documentar objetos faltantes**
- Tabla `friendships`
- Tabla `schools`
- Tabla `classrooms`
- Tabla `classroom_members`
- Tabla `teams`
- Tabla `team_members`
- Tabla `team_challenges`
- Función `cleanup_old_notifications`
- 5 triggers
- 8 archivos RLS

#### Validación:
- [ ] RF creados o identificados
- [ ] TRACEABILITY completo
- [ ] Todas las tablas documentadas

---

### TASK 2.3: Documentar tablas `assignments` en schema `public`
**Issue:** ISSUE-008
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 2 horas

#### Pasos:

**1. Identificar épica a la que pertenece**
- Las tablas de `assignments` probablemente son parte de "Portal de Maestros"
- Verificar en `docs/03-fase-extensiones/EXT-001-portal-maestros/`

**2. Crear o completar documentación**

Archivo: `docs/03-fase-extensiones/EXT-001-portal-maestros/requerimientos/RF-TEACH-002-assignments.md`
```markdown
# RF-TEACH-002: Sistema de Tareas/Asignaciones

## Descripción
Los maestros pueden crear y asignar tareas a sus estudiantes.

## Requerimientos
1. Crear asignaciones con ejercicios específicos
2. Asignar a aulas completas o estudiantes individuales
3. Establecer fechas de entrega
4. Recibir y calificar envíos

## Tablas Involucradas
- `public.assignments` - Definiciones de tareas
- `public.assignment_classrooms` - Asignaciones a aulas
- `public.assignment_exercises` - Ejercicios de la tarea
- `public.assignment_students` - Asignaciones a estudiantes individuales
- `public.assignment_submissions` - Envíos de estudiantes
- `public.teacher_notes` - Notas del maestro sobre envíos
```

**3. Actualizar TRACEABILITY de EXT-001**

Agregar sección de base de datos al TRACEABILITY de portal-maestros.

#### Validación:
- [ ] RF creado o actualizado
- [ ] 6 tablas documentadas
- [ ] TRACEABILITY actualizado

---

### TASK 2.4: Documentar funciones utilitarias en schema `public`
**Issue:** ISSUE-007
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 1 hora

#### Pasos:

Similar a TASK 2.1, pero para las 7 funciones en `public`:
1. `cleanup_old_system_logs`
2. `cleanup_old_user_activity`
3. `is_feature_enabled`
4. `log_system_event`
5. `send_notification`
6. `update_feature_flag`
7. `validate_date_range`

Agregar a `docs/90-transversal/FUNCIONES-UTILITARIAS.md` en una sección "Funciones del Schema Public".

#### Validación:
- [ ] 7 funciones documentadas
- [ ] Propósito y parámetros clarificados

---

### TASK 2.5: Documentar schemas parciales (audit_logging, content_management, admin_dashboard)
**Issues:** ISSUE-004, ISSUE-005, ISSUE-006
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 2 horas total (40 min c/u)

Para cada schema:
1. Buscar documentación existente
2. Identificar épica correspondiente
3. Completar TRACEABILITY
4. Documentar objetos faltantes

#### Validación:
- [ ] 3 schemas documentados
- [ ] TRACEABILITY completo para cada uno

---

## FASE 3: OPTIMIZACIÓN Y CONSOLIDACIÓN
**Duración estimada:** 5 horas
**Prioridad:** 🟢 MEDIA - Ejecutar después de Fase 2

---

### TASK 3.1: Consolidar funciones `cleanup_old_*`
**Issue:** DUPLICATION-001
**Severidad:** 🟢 BAJO
**Esfuerzo:** 2 horas

#### Análisis:
Actualmente existen 3 funciones similares:
1. `public.cleanup_old_system_logs`
2. `public.cleanup_old_user_activity`
3. `social_features.cleanup_old_notifications`

#### Opción A: Crear función genérica
```sql
CREATE OR REPLACE FUNCTION gamilit.cleanup_old_records(
    p_schema_name TEXT,
    p_table_name TEXT,
    p_date_column TEXT DEFAULT 'created_at',
    p_days_to_keep INTEGER DEFAULT 90
)
RETURNS INTEGER AS $$
DECLARE
    v_rows_deleted INTEGER;
    v_sql TEXT;
BEGIN
    v_sql := format(
        'DELETE FROM %I.%I WHERE %I < NOW() - INTERVAL ''%s days''',
        p_schema_name,
        p_table_name,
        p_date_column,
        p_days_to_keep
    );

    EXECUTE v_sql;
    GET DIAGNOSTICS v_rows_deleted = ROW_COUNT;

    RETURN v_rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

#### Opción B: Mantener funciones específicas pero estandarizar nombre
Renombrar para consistencia:
- `gamilit.cleanup_old_records_system_logs(days INTEGER DEFAULT 90)`
- `gamilit.cleanup_old_records_user_activity(days INTEGER DEFAULT 90)`
- `gamilit.cleanup_old_records_notifications(days INTEGER DEFAULT 30)`

#### Pasos:
1. Decidir entre Opción A o B (consultar con equipo)
2. Implementar solución elegida
3. Migrar código existente
4. Actualizar documentación
5. Deprecar funciones antiguas

#### Validación:
- [ ] Solución implementada
- [ ] Tests de funciones
- [ ] Documentación actualizada

---

### TASK 3.2: Revisar duplicidad leaderboards (views vs materialized views)
**Issue:** OVERLAP-001
**Severidad:** 🟢 BAJO
**Esfuerzo:** 1 hora

#### Análisis:
Posible solapamiento entre:
- View: `leaderboard_global`
- MV: `mv_global_leaderboard`

#### Pasos:
1. Leer SQL de ambas vistas
   ```bash
   cat apps/database/ddl/schemas/gamification_system/views/02-leaderboard_global.sql
   cat apps/database/ddl/schemas/gamification_system/materialized-views/01-mv_global_leaderboard.sql
   ```

2. Comparar queries
   - ¿Son idénticos?
   - ¿Uno es subconjunto del otro?
   - ¿Tienen propósitos diferentes?

3. Decisión:
   - Si son idénticos → Eliminar view regular, usar solo MV
   - Si tienen diferencias → Documentar cuándo usar cada uno
   - Si MV es para caché → Asegurar refresh automático

4. Documentar decisión

#### Validación:
- [ ] Análisis completado
- [ ] Decisión documentada
- [ ] Código optimizado si aplica

---

### TASK 3.3: Consolidar ENUMs duplicados
**Issue:** P1-001 (ya identificado)
**Severidad:** 🟡 MEDIO
**Esfuerzo:** 2 horas

**Plan existente:** ✅ `orchestration/05-validaciones/consolidacion/REPORTE-COMPLETO-ENUMS-2025-11-07.md`

#### Pasos:
1. Usar plan existente
2. Consolidar 24 ENUMs duplicados
3. Mantener solo definiciones en `00-prerequisites.sql`
4. Eliminar definiciones duplicadas de otros archivos
5. Validar que no se rompa nada

#### Validación:
- [ ] Solo 1 definición por ENUM
- [ ] Todas las referencias funcionan
- [ ] Tests pasan

---

## FASE 4: VALIDACIÓN COMPLETA
**Duración estimada:** 4 horas
**Prioridad:** ✅ FINAL - Ejecutar al terminar todas las correcciones

---

### VALIDACIÓN 4.1: Coherencia de Definiciones
**Esfuerzo:** 1 hora

#### Checklist:

**1. Validar que todos los ENUMs existen y son únicos**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database

# Listar todos los ENUMs definidos
grep -r "CREATE TYPE" ddl/ --include="*.sql" | grep -v "^--" > /tmp/enums_defined.txt

# Verificar duplicados
cat /tmp/enums_defined.txt | awk -F':' '{print $2}' | sort | uniq -d

# Resultado esperado: No debe haber duplicados (excepto si están en diferentes schemas intencionalmente)
```

**2. Validar que todos los ENUMs referenciados existen**
```bash
# Buscar todas las referencias a ENUMs
grep -rE "::([a-z_]+\.)?\w+_(type|status|role|level|category|method)" ddl/ --include="*.sql" \
    | grep -v "^--" \
    | grep -v "CREATE TYPE" \
    > /tmp/enum_references.txt

# Para cada referencia, verificar que existe la definición
# (Script más complejo, revisar manualmente los más comunes)
```

**3. Validar schema references**
```bash
# Verificar que no hay referencias a schemas inexistentes
grep -rE "(public|auth|auth_management|gamification_system|educational_content|progress_tracking|social_features|audit_logging|system_configuration|content_management|admin_dashboard|storage|gamilit)\." ddl/ --include="*.sql" \
    | grep -v "^--" \
    > /tmp/schema_references.txt

# Revisar que todos los schemas referenciados existen
```

**Validación:**
- [ ] No hay ENUMs duplicados
- [ ] Todas las referencias a ENUMs son válidas
- [ ] No hay referencias a `public.gamilit_role`
- [ ] Todas las referencias de schema son correctas

---

### VALIDACIÓN 4.2: Integridad Referencial
**Esfuerzo:** 1.5 horas

#### Checklist:

**1. Validar todas las Foreign Keys**
```bash
# Extraer todas las FOREIGN KEY constraints
grep -rE "FOREIGN KEY.*REFERENCES" ddl/ --include="*.sql" \
    | grep -v "^--" \
    > /tmp/foreign_keys.txt

# Verificar que las tablas referenciadas existen
# (Revisión manual o script)
```

**2. Validar funciones referenciadas por triggers**
```bash
# Listar todos los triggers
grep -rE "CREATE TRIGGER|CREATE OR REPLACE TRIGGER" ddl/schemas/*/triggers/ --include="*.sql" \
    > /tmp/triggers.txt

# Para cada trigger, verificar que la función existe
grep -rE "EXECUTE (PROCEDURE|FUNCTION)" ddl/schemas/*/triggers/ --include="*.sql" \
    | awk -F'FUNCTION' '{print $2}' \
    > /tmp/trigger_functions.txt

# Listar todas las funciones definidas
find ddl/schemas/*/functions/ -name "*.sql" -exec basename {} \; \
    > /tmp/functions_defined.txt

# Comparar ambas listas
```

**3. Validar vistas y MVs**
```bash
# Verificar que todas las tablas referenciadas en vistas existen
for view_file in $(find ddl/schemas/*/views/ -name "*.sql"); do
    echo "Validando: $view_file"
    # Extraer nombres de tablas en FROM y JOIN
    grep -iE "FROM|JOIN" "$view_file" | grep -v "^--"
done
```

**Validación:**
- [ ] Todas las FKs apuntan a tablas existentes
- [ ] Todas las funciones de triggers existen
- [ ] Todas las tablas en vistas existen
- [ ] No hay referencias circulares

---

### VALIDACIÓN 4.3: Funcionalidad de Archivos SQL
**Esfuerzo:** 1 hora

#### Checklist:

**1. Validación de sintaxis**
```bash
# Para cada archivo SQL, validar sintaxis
for sql_file in $(find ddl/ -name "*.sql" -type f); do
    echo "Validando sintaxis: $sql_file"

    # Opción A: Usar pg_format (si está instalado)
    pg_format --check "$sql_file" 2>&1 | grep -i error

    # Opción B: Intentar parsear con psql (dry-run)
    # psql -U postgres --set ON_ERROR_STOP=on -f "$sql_file" --single-transaction --dry-run
done
```

**2. Orden de ejecución**
```bash
# Verificar que no hay dependencias circulares en orden de archivos
# Los archivos numerados deben ejecutarse en orden correcto

# Ejemplo: verificar que schemas se crean antes que tablas
# 1. Schemas
# 2. Enums
# 3. Tablas
# 4. Índices
# 5. Funciones
# 6. Triggers
# 7. Views
# 8. RLS Policies
```

**3. Testing en base de datos de prueba**
```bash
# Crear DB de prueba
createdb gamilit_validation_test

# Ejecutar todos los DDL en orden
psql -U postgres -d gamilit_validation_test -f ddl/00-prerequisites.sql
psql -U postgres -d gamilit_validation_test -f ddl/01-create-schemas.sql
# ... [ejecutar todos los scripts]

# Verificar que no hay errores
psql -U postgres -d gamilit_validation_test -c "SELECT schema_name FROM information_schema.schemata WHERE schema_name NOT IN ('pg_catalog', 'information_schema');"

# Cleanup
dropdb gamilit_validation_test
```

**Validación:**
- [ ] Todos los archivos SQL tienen sintaxis válida
- [ ] Los DDL se pueden ejecutar en orden sin errores
- [ ] No hay dependencias no resueltas

---

### VALIDACIÓN 4.4: Documentación Completa
**Esfuerzo:** 30 minutos

#### Checklist:

**1. Verificar cobertura de documentación**
```bash
cd /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit

# Contar schemas documentados
find docs/ -name "TRACEABILITY.yml" -exec grep -l "schema:" {} \; | wc -l

# Debe ser >= 13 (o al menos los principales)
```

**2. Verificar consistencia de TRACEABILITY**
```bash
# Para cada TRACEABILITY.yml, verificar que los archivos referenciados existen
for trace_file in $(find docs/ -name "TRACEABILITY.yml"); do
    echo "Validando: $trace_file"

    # Extraer rutas de archivos SQL
    grep -E "file:.*\.sql" "$trace_file" | awk '{print $2}' | while read sql_path; do
        if [ ! -f "$sql_path" ]; then
            echo "  ⚠️  MISSING: $sql_path"
        fi
    done
done
```

**3. Verificar que todos los objetos implementados están documentados**
```bash
# Listar todas las tablas implementadas
find apps/database/ddl/schemas/*/tables/ -name "*.sql" | wc -l

# Listar todas las tablas documentadas en TRACEABILITY
find docs/ -name "TRACEABILITY.yml" -exec grep -h "name:.*" {} \; | grep "schema:" -A 50 | grep "- name:" | wc -l

# Comparar números (deben ser iguales o muy cercanos)
```

**Validación:**
- [ ] Todos los schemas tienen documentación
- [ ] Todas las referencias en TRACEABILITY son válidas
- [ ] Cobertura de documentación >= 90%

---

## CHECKLIST FINAL
**Antes de cerrar el plan de acción:**

### Correcciones Críticas
- [ ] P0-001: Referencia `public.gamilit_role` corregida
- [ ] CRITICAL-001: Schema `system_configuration` documentado
- [ ] CRITICAL-002: Schema `storage` documentado

### Documentación
- [ ] ISSUE-009: Funciones `gamilit.*` documentadas
- [ ] ISSUE-003: Schema `social_features` completo
- [ ] ISSUE-008: Tablas `assignments` documentadas
- [ ] ISSUE-007: Funciones `public.*` documentadas
- [ ] ISSUE-004: Schema `audit_logging` documentado
- [ ] ISSUE-005: Schema `content_management` documentado
- [ ] ISSUE-006: Schema `admin_dashboard` documentado
- [ ] ISSUE-001: Tabla `auth_attempts` documentada

### Optimización
- [ ] DUPLICATION-001: Funciones cleanup consolidadas
- [ ] OVERLAP-001: Views vs MVs leaderboard revisado
- [ ] P1-001: ENUMs duplicados consolidados

### Validación
- [ ] ✅ Coherencia de definiciones (ENUMs, schemas)
- [ ] ✅ Integridad referencial (FKs, triggers, vistas)
- [ ] ✅ Funcionalidad de archivos SQL
- [ ] ✅ Documentación completa y consistente

---

## MÉTRICAS DE ÉXITO

Al finalizar este plan:

| Métrica | Antes | Objetivo | Después |
|---------|-------|----------|---------|
| **Schemas documentados** | 46% (6/13) | 100% (13/13) | ___ |
| **Tablas documentadas** | ~75% | 95%+ | ___ |
| **Funciones documentadas** | ~65% | 90%+ | ___ |
| **Issues críticos** | 3 | 0 | ___ |
| **Issues medios** | 9 | 0 | ___ |
| **ENUMs duplicados** | 24 | 0 | ___ |
| **Referencias rotas** | 11 | 0 | ___ |

---

## PRÓXIMOS PASOS POST-CORRECCIÓN

1. **Actualizar DATABASE_INVENTORY**
   - Regenerar inventario completo
   - Actualizar `apps/database/_MAP.md`

2. **Crear guía de mantenimiento**
   - Proceso para agregar nuevas tablas
   - Proceso para actualizar documentación
   - Standards de naming

3. **Automatizar validaciones**
   - Script de validación de coherencia
   - CI/CD checks para PRs
   - Pre-commit hooks

4. **Capacitación del equipo**
   - Presentar nuevo sistema de documentación
   - Guías de uso de TRACEABILITY.yml

---

**Plan generado:** 2025-11-08
**Versión:** 1.0
**Autor:** Claude Code
**Estado:** ⏳ Pendiente de ejecución
