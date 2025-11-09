# PLAN DE CORRECCIÓN DDL - Alineación Backend-BD
## Proyecto Gamilit - Correcciones en Archivos de Definición
**Fecha:** 2025-11-08
**Enfoque:** Corregir archivos DDL directamente (NO migrations)

---

## ⚠️ ENFOQUE CORRECTO

**IMPORTANTE:** La base de datos AÚN NO SE CREA en producción. Por lo tanto:

- ✅ **CORRECTO:** Modificar archivos DDL en `apps/database/ddl/schemas/`
- ✅ **CORRECTO:** Alinear documentación con DDL
- ✅ **CORRECTO:** Validar conflictos entre objetos
- ❌ **INCORRECTO:** Crear scripts de migración
- ❌ **INCORRECTO:** Asumir que hay datos existentes

---

## 📋 PROBLEMAS A CORREGIR EN DDL

### P0-1: Crear ENUM `difficulty_level` faltante

**Problema:** El enum se usa en múltiples tablas pero no existe archivo DDL

**Archivo a crear:** `apps/database/ddl/schemas/educational_content/enums/difficulty_level.sql`

**Solución:**

```sql
-- =====================================================
-- ENUM: educational_content.difficulty_level
-- Descripción: 8 niveles de dificultad para contenido educativo
-- Documentación: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-EDUCATIONAL.md
-- Epic: EAI-002
-- Created: 2025-11-08
-- =====================================================

CREATE TYPE educational_content.difficulty_level AS ENUM (
    'very_easy',      -- Muy fácil, introductorio
    'easy',           -- Fácil, simple
    'beginner',       -- Principiante, para nuevos usuarios
    'medium',         -- Medio, dificultad estándar
    'intermediate',   -- Intermedio, requiere conocimiento previo
    'hard',           -- Difícil, desafiante
    'advanced',       -- Avanzado, para usuarios experimentados
    'very_hard'       -- Muy difícil, nivel experto
);

COMMENT ON TYPE educational_content.difficulty_level IS
'8 niveles de dificultad en orden ascendente: very_easy → easy → beginner → medium → intermediate → hard → advanced → very_hard.
Sincronizado con backend DifficultyLevelEnum (enums.constants.ts).
Usado en: modules, exercises, content_templates, marie_curie_content, achievements.';
```

**Tablas que lo usan:**
- `educational_content.modules` ✅ Ya lo usa
- `educational_content.exercises` ✅ Ya lo usa
- `content_management.content_templates` ✅ Ya lo usa
- `content_management.marie_curie_content` ✅ Ya lo usa
- `gamification_system.achievements` ✅ Ya lo usa

**Validación:** ✅ Sin conflictos - todas las tablas ya referencian el enum

---

### P0-2: Crear ENUM `notification_type` faltante

**Problema:** BD usa TEXT, debería ser ENUM

**Archivo a crear:** `apps/database/ddl/schemas/gamification_system/enums/notification_type.sql`

**Solución:**

```sql
-- =====================================================
-- ENUM: gamification_system.notification_type
-- Descripción: 11 tipos de notificaciones del sistema
-- Documentación: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
-- Epic: EXT-003
-- Created: 2025-11-08
-- =====================================================

CREATE TYPE gamification_system.notification_type AS ENUM (
    'achievement_unlocked',   -- Logro desbloqueado
    'rank_up',                -- Subida de rango maya
    'friend_request',         -- Solicitud de amistad
    'guild_invitation',       -- Invitación a equipo/guild
    'mission_completed',      -- Misión completada
    'level_up',               -- Subida de nivel
    'message_received',       -- Mensaje recibido
    'system_announcement',    -- Anuncio del sistema
    'ml_coins_earned',        -- ML Coins ganadas
    'streak_milestone',       -- Hito de racha alcanzado
    'exercise_feedback'       -- Retroalimentación de ejercicio
);

COMMENT ON TYPE gamification_system.notification_type IS
'Tipos de notificaciones del sistema (11 tipos).
Sincronizado con backend NotificationTypeEnum (enums.constants.ts).
Prioridades sugeridas: system_announcement (critical), message_received/rank_up (high), achievement_unlocked/mission_completed (medium), level_up/ml_coins_earned (low).';
```

**Archivo a modificar:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

**Cambio en tabla notifications:**

```sql
-- ANTES (línea ~35)
type TEXT NOT NULL,

-- DESPUÉS
type gamification_system.notification_type NOT NULL,
```

**Validación:** ✅ Sin conflictos - tabla aún no tiene datos

---

### P0-3: Crear ENUM `notification_priority` faltante

**Problema:** Columna priority no existe en tabla notifications

**Archivo a crear:** `apps/database/ddl/schemas/gamification_system/enums/notification_priority.sql`

**Solución:**

```sql
-- =====================================================
-- ENUM: gamification_system.notification_priority
-- Descripción: 4 niveles de prioridad para notificaciones
-- Documentación: docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md
-- Epic: EXT-003
-- Created: 2025-11-08
-- =====================================================

CREATE TYPE gamification_system.notification_priority AS ENUM (
    'low',        -- Prioridad baja: informativas, sin urgencia
    'medium',     -- Prioridad media: estándar (DEFAULT)
    'high',       -- Prioridad alta: requieren atención inmediata
    'critical'    -- Prioridad crítica: alertas del sistema, emergencias
);

COMMENT ON TYPE gamification_system.notification_priority IS
'Niveles de prioridad de notificaciones (4 niveles).
Sincronizado con backend NotificationPriorityEnum (enums.constants.ts).
Valor por defecto: medium.';
```

**Archivo a modificar:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

**Agregar columna priority:**

```sql
-- Agregar después de la columna 'type' (línea ~36)
priority gamification_system.notification_priority DEFAULT 'medium' NOT NULL,
```

**Validación:** ✅ Sin conflictos - es una nueva columna

---

### P0-4: Corregir ENUM `progress_status` - Agregar 'mastered'

**Problema:** Backend usa 'mastered', BD solo tiene 'abandoned'

**Archivo a modificar:** `apps/database/ddl/schemas/progress_tracking/enums/progress_status.sql`

**Solución:**

```sql
-- ANTES
CREATE TYPE progress_tracking.progress_status AS ENUM (
    'not_started',
    'in_progress',
    'completed',
    'needs_review',
    'abandoned'
);

-- DESPUÉS
CREATE TYPE progress_tracking.progress_status AS ENUM (
    'not_started',    -- Sin iniciar (estado inicial)
    'in_progress',    -- En progreso (0% < progreso < 100%)
    'completed',      -- Completado (100%, cumple requisitos mínimos)
    'needs_review',   -- Requiere revisión por docente
    'mastered',       -- Dominado (nivel de excelencia/maestría)
    'abandoned'       -- Abandonado (módulo no completado por largo tiempo)
);

COMMENT ON TYPE progress_tracking.progress_status IS
'Estados de progreso para módulos y ejercicios (6 estados).
Backend usa principalmente: not_started, in_progress, completed, needs_review, mastered.
''abandoned'' se usa para tracking de módulos abandonados (feature tracking futuro).
Sincronizado con backend ProgressStatusEnum (enums.constants.ts).';
```

**Validación:** ✅ Sin conflictos - solo agregamos un valor

---

### P0-5: Verificar referencias en tablas que usan estos enums

**Archivos a verificar:**

1. `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
   - ✅ Línea ~45: `status progress_tracking.progress_status DEFAULT 'not_started'`
   - **Validar:** DEFAULT sigue siendo válido

2. `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_submissions.sql`
   - ✅ Línea ~38: `status progress_tracking.progress_status DEFAULT 'not_started'`
   - **Validar:** DEFAULT sigue siendo válido

3. `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
   - ⚠️ Cambiar columna `type` de TEXT a ENUM
   - ✅ Agregar columna `priority`

**Resultado:** ✅ Todos los DEFAULTs siguen siendo válidos

---

## 📝 ACTUALIZACIÓN DE DOCUMENTACIÓN

### Doc-1: Actualizar ET-EDU-001 (Mecánicas de ejercicios)

**Archivo:** `docs/01-fase-alcance-inicial/EAI-002-actividades/especificaciones/ET-EDU-001-mecanicas-ejercicios.md`

**Validar sección de difficulty_level:**

```markdown
## Niveles de Dificultad

El enum `educational_content.difficulty_level` define 8 niveles:

1. `very_easy` ⭐ - Muy fácil, contenido introductorio básico
2. `easy` ⭐⭐ - Fácil, contenido simple
3. `beginner` ⭐⭐ - Principiante, para usuarios nuevos
4. `medium` ⭐⭐⭐ - Medio, dificultad estándar
5. `intermediate` ⭐⭐⭐⭐ - Intermedio, requiere conocimiento previo
6. `hard` ⭐⭐⭐⭐ - Difícil, contenido desafiante
7. `advanced` ⭐⭐⭐⭐⭐ - Avanzado, para usuarios experimentados
8. `very_hard` ⭐⭐⭐⭐⭐ - Muy difícil, contenido experto

### Sincronización Backend

Backend enum: `DifficultyLevelEnum` (enums.constants.ts)
DDL: `educational_content.difficulty_level`
```

---

### Doc-2: Crear/Actualizar TYPES-NOTIFICATIONS.md

**Archivo:** `docs/02-especificaciones-tecnicas/tipos-compartidos/TYPES-NOTIFICATIONS.md`

**Contenido:**

```markdown
# Tipos Compartidos: Notificaciones

## notification_type ENUM

**Schema:** `gamification_system.notification_type`
**Valores:** 11 tipos

### Tipos de Notificaciones

1. `achievement_unlocked` - Logro desbloqueado
2. `rank_up` - Subida de rango maya
3. `friend_request` - Solicitud de amistad
4. `guild_invitation` - Invitación a equipo
5. `mission_completed` - Misión completada
6. `level_up` - Subida de nivel
7. `message_received` - Mensaje recibido
8. `system_announcement` - Anuncio del sistema
9. `ml_coins_earned` - ML Coins ganadas
10. `streak_milestone` - Hito de racha alcanzado
11. `exercise_feedback` - Retroalimentación de ejercicio

### Sincronización Backend

Backend enum: `NotificationTypeEnum` (enums.constants.ts)
DDL: `gamification_system.notification_type`

## notification_priority ENUM

**Schema:** `gamification_system.notification_priority`
**Valores:** 4 niveles

### Niveles de Prioridad

1. `low` - Prioridad baja (informativas)
2. `medium` - Prioridad media (DEFAULT)
3. `high` - Prioridad alta (urgentes)
4. `critical` - Prioridad crítica (alertas)

### Mapeo Sugerido

- **critical:** system_announcement
- **high:** message_received, rank_up
- **medium:** achievement_unlocked, mission_completed, guild_invitation, friend_request
- **low:** level_up, ml_coins_earned, streak_milestone, exercise_feedback
```

---

### Doc-3: Actualizar DATABASE_INVENTORY.yml

**Archivo:** `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml`

**Sección de enums - Agregar:**

```yaml
enums:
  - name: difficulty_level
    schema: educational_content
    file: apps/database/ddl/schemas/educational_content/enums/difficulty_level.sql
    values: [very_easy, easy, beginner, medium, intermediate, hard, advanced, very_hard]
    total_values: 8
    rf: [RF-EDU-001, RF-EDU-003]
    status: ✅ CREADO (2025-11-08)

  - name: notification_type
    schema: gamification_system
    file: apps/database/ddl/schemas/gamification_system/enums/notification_type.sql
    values: [achievement_unlocked, rank_up, friend_request, guild_invitation, mission_completed, level_up, message_received, system_announcement, ml_coins_earned, streak_milestone, exercise_feedback]
    total_values: 11
    rf: EXT-003
    status: ✅ CREADO (2025-11-08)

  - name: notification_priority
    schema: gamification_system
    file: apps/database/ddl/schemas/gamification_system/enums/notification_priority.sql
    values: [low, medium, high, critical]
    total_values: 4
    rf: EXT-003
    status: ✅ CREADO (2025-11-08)

  - name: progress_status
    schema: progress_tracking
    file: apps/database/ddl/schemas/progress_tracking/enums/progress_status.sql
    values: [not_started, in_progress, completed, needs_review, mastered, abandoned]
    total_values: 6
    rf: [EAI-002, EAI-004]
    status: ✅ ACTUALIZADO (2025-11-08 - agregado 'mastered')
```

---

## 🔍 VALIDACIÓN DE CONFLICTOS

### Validación 1: ENUMs vs Tablas

**Query de validación:**

```sql
-- Verificar que todas las tablas que usan difficulty_level compilen
SELECT
    n.nspname AS schema,
    c.relname AS table,
    a.attname AS column
FROM pg_attribute a
JOIN pg_class c ON a.attrelid = c.oid
JOIN pg_namespace n ON c.relnamespace = n.oid
JOIN pg_type t ON a.atttypid = t.oid
WHERE t.typname = 'difficulty_level'
ORDER BY schema, table;
```

**Resultado esperado:**
```
schema                | table                 | column
----------------------|-----------------------|------------------
educational_content   | modules              | difficulty_level
educational_content   | exercises            | difficulty_level
content_management    | content_templates    | difficulty_level
content_management    | marie_curie_content  | difficulty_level
gamification_system   | achievements         | difficulty_level
```

✅ **Sin conflictos:** Todas las tablas esperan el enum

---

### Validación 2: Orden de Creación (prerequisites.sql)

**Archivo:** `apps/database/ddl/00-prerequisites.sql`

**Verificar orden:**

```sql
-- 1. Crear schemas
CREATE SCHEMA IF NOT EXISTS educational_content;
CREATE SCHEMA IF NOT EXISTS gamification_system;
CREATE SCHEMA IF NOT EXISTS progress_tracking;

-- 2. Crear ENUMs (ANTES de tablas)
\i schemas/educational_content/enums/difficulty_level.sql
\i schemas/gamification_system/enums/notification_type.sql
\i schemas/gamification_system/enums/notification_priority.sql
\i schemas/progress_tracking/enums/progress_status.sql

-- 3. Crear tablas (DESPUÉS de enums)
\i schemas/educational_content/tables/01-modules.sql
-- ... etc
```

✅ **Orden correcto:** ENUMs antes de tablas

---

### Validación 3: Sincronización Backend

**Archivo:** `apps/backend/src/shared/constants/enums.constants.ts`

**Verificar que backend tenga los mismos valores:**

```typescript
// ✅ CORRECTO
export enum DifficultyLevelEnum {
  BEGINNER = 'beginner',
  INTERMEDIATE = 'intermediate',
  ADVANCED = 'advanced',
  VERY_EASY = 'very_easy',
  EASY = 'easy',
  MEDIUM = 'medium',
  HARD = 'hard',
  VERY_HARD = 'very_hard',
}

// ✅ CORRECTO
export enum NotificationTypeEnum {
  ACHIEVEMENT_UNLOCKED = 'achievement_unlocked',
  RANK_UP = 'rank_up',
  FRIEND_REQUEST = 'friend_request',
  GUILD_INVITATION = 'guild_invitation',
  MISSION_COMPLETED = 'mission_completed',
  LEVEL_UP = 'level_up',
  MESSAGE_RECEIVED = 'message_received',
  SYSTEM_ANNOUNCEMENT = 'system_announcement',
  ML_COINS_EARNED = 'ml_coins_earned',
  STREAK_MILESTONE = 'streak_milestone',
  EXERCISE_FEEDBACK = 'exercise_feedback',
}

// ✅ CORRECTO
export enum NotificationPriorityEnum {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// ⚠️ AGREGAR 'mastered'
export enum ProgressStatusEnum {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  NEEDS_REVIEW = 'needs_review',
  MASTERED = 'mastered',  // ✅ YA EXISTE - OK
}
```

✅ **Backend ya está correcto** - Solo validar que esté sincronizado

---

## 📋 CHECKLIST DE IMPLEMENTACIÓN

### Fase 1: Crear ENUMs Faltantes (1 hora)

- [ ] Crear `educational_content/enums/difficulty_level.sql`
- [ ] Crear `gamification_system/enums/notification_type.sql`
- [ ] Crear `gamification_system/enums/notification_priority.sql`
- [ ] Actualizar `progress_tracking/enums/progress_status.sql` (agregar 'mastered')

### Fase 2: Actualizar Tablas (30 min)

- [ ] Modificar `gamification_system/tables/08-notifications.sql`:
  - Cambiar columna `type` de TEXT a ENUM
  - Agregar columna `priority`

### Fase 3: Actualizar prerequisites.sql (15 min)

- [ ] Agregar `\i` para nuevos ENUMs en orden correcto

### Fase 4: Validación (30 min)

- [ ] Ejecutar script completo de creación de BD
- [ ] Verificar que no haya errores
- [ ] Validar que todas las tablas se creen correctamente

```bash
cd apps/database
./create-database.sh  # O el script que uses para crear BD
```

### Fase 5: Actualizar Documentación (1 hora)

- [ ] Actualizar DATABASE_INVENTORY.yml (sección enums)
- [ ] Crear/actualizar TYPES-NOTIFICATIONS.md
- [ ] Verificar ET-EDU-001.md (difficulty_level)
- [ ] Actualizar comentarios en DDL

### Fase 6: Testing Backend (30 min)

- [ ] Verificar que backend compile sin errores
- [ ] Probar queries con nuevos enums
- [ ] Validar inserts con valores de enum

---

## ⚠️ NOTAS IMPORTANTES

1. **NO crear scripts de migración** - La BD aún no existe
2. **Modificar DDL directamente** - Son archivos de definición
3. **Validar orden de ejecución** - ENUMs antes de tablas
4. **Sincronizar backend** - Verificar que enums.constants.ts coincida
5. **Documentar cambios** - Actualizar inventarios y docs

---

## 🎯 RESULTADO ESPERADO

Después de aplicar estos cambios:

- ✅ 4 ENUMs correctamente definidos en DDL
- ✅ Tabla notifications con columnas type (ENUM) y priority
- ✅ Backend 100% sincronizado con BD
- ✅ Documentación actualizada
- ✅ 0 conflictos entre objetos
- ✅ BD se crea exitosamente desde DDL

**Sin scripts de migración innecesarios** ✅

---

**FIN DEL PLAN**
