# Documentación de Referencia - ENUMs
## Fuente de Verdad para Objetos de Base de Datos

**Generado:** 2025-11-07
**Propósito:** Establecer la fuente de verdad única para TODOS los ENUMs del sistema
**Base:** Especificaciones funcionales + Análisis de implementación actual

---

## 📋 Metodología

Para cada ENUM documentamos:
1. **Valores correctos** según especificación funcional
2. **Ubicación canónica** donde DEBE definirse
3. **Uso/Propósito** funcional en el sistema
4. **Estado actual** (limpio, duplicado, conflictivo)
5. **Acción requerida** (ninguna, consolidar, corregir)

---

## ✅ CATEGORÍA 1: ENUMS CRÍTICOS DEL SISTEMA

### 1.1 `auth_management.gamilit_role`

**Propósito:** Roles de usuario en el sistema GAMILIT

**Valores correctos (3):**
```sql
CREATE TYPE auth_management.gamilit_role AS ENUM (
    'student',       -- Estudiante regular
    'admin_teacher', -- Profesor/Administrador
    'super_admin'    -- Super administrador del sistema
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:30` ✅ CORRECTO
- Definido en `auth_management/enums/gamilit_role.sql:6` ❌ DUPLICADO

**Referencias incorrectas:** 11 archivos usan `public.gamilit_role` que NO EXISTE
- `auth/tables/01-users.sql:15`
- `auth_management/tables/04-roles.sql:17`
- `system_configuration/tables/02-feature_flags.sql:20`
- 7 RLS policies en progress_tracking
- 1 función en public

**Acción requerida:**
1. ❌ Eliminar definición duplicada en `auth_management/enums/gamilit_role.sql`
2. 🔄 Cambiar 11 referencias de `public.gamilit_role` → `auth_management.gamilit_role`
3. ✅ Mantener definición en `00-prerequisites.sql`

**Prioridad:** 🔴 P0 - CRÍTICO (bloquea 3 tablas, 7 RLS policies)

---

### 1.2 `auth_management.user_status`

**Propósito:** Estados del ciclo de vida de una cuenta de usuario

**Valores correctos (5):**
```sql
CREATE TYPE auth_management.user_status AS ENUM (
    'active',    -- Usuario activo, puede acceder al sistema
    'inactive',  -- Usuario inactivo temporalmente
    'suspended', -- Suspendido por admin (puede reactivarse)
    'banned',    -- Baneado permanentemente
    'pending'    -- Registro pendiente de verificación
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:34`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:34` ✅ CORRECTO
- Definido en `auth_management/enums/user_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada en `auth_management/enums/user_status.sql`
2. ✅ Mantener definición en `00-prerequisites.sql`

**Prioridad:** 🟡 P1 - ALTO

---

### 1.3 `public.auth_provider`

**Propósito:** Proveedores de autenticación soportados (OAuth + local)

**Valores correctos (5):**
```sql
CREATE TYPE public.auth_provider AS ENUM (
    'local',     -- Autenticación con email/password
    'google',    -- Google OAuth
    'facebook',  -- Facebook OAuth
    'microsoft', -- Microsoft OAuth
    'apple'      -- Apple Sign In
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:38`

**Estado actual:** 🔴 CONFLICTO - Valores diferentes
- `00-prerequisites.sql:38`: 4 valores ❌ FALTA 'apple'
- `auth_management/tables/05-auth_providers.sql:14`: 5 valores ✅ INCLUYE 'apple'

**Acción requerida:**
1. 🔄 Actualizar `00-prerequisites.sql` para incluir 'apple'
2. ❌ Eliminar definición en `05-auth_providers.sql` (mover a 00-prerequisites)
3. ✅ Verificar que tablas usen el enum actualizado

**Prioridad:** 🔴 P0 - CRÍTICO (valores faltantes pueden causar errores)

---

## 🎮 CATEGORÍA 2: ENUMS DE GAMIFICACIÓN

### 2.1 `gamification_system.achievement_type`

**Propósito:** Tipos de logros disponibles en el sistema

**Valores correctos (4):**
```sql
CREATE TYPE gamification_system.achievement_type AS ENUM (
    'badge',          -- Insignia/medalla
    'milestone',      -- Hito de progreso
    'special',        -- Logro especial/evento
    'rank_promotion'  -- Promoción de rango Maya
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:51`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:51` ✅ CORRECTO
- Definido en `gamification_system/enums/achievement_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada en schema-specific file
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 2.2 `gamification_system.achievement_category`

**Propósito:** Categorías para clasificar logros

**Valores correctos (7):**
```sql
CREATE TYPE gamification_system.achievement_category AS ENUM (
    'progress',    -- Progreso general
    'streak',      -- Rachas/consistencia
    'completion',  -- Completitud
    'social',      -- Interacción social
    'special',     -- Especiales/eventos
    'mastery',     -- Dominio de contenido
    'exploration'  -- Exploración de contenido
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:47`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:47` ✅ CORRECTO
- Definido en `gamification_system/enums/achievement_category.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 2.3 `gamification_system.comodin_type`

**Propósito:** Tipos de comodines/power-ups disponibles para estudiantes

**Valores correctos (3):**
```sql
CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',              -- Pistas/hints para ejercicios
    'vision_lectora',      -- Ayuda de lectura
    'segunda_oportunidad'  -- Reintento de ejercicio
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:55`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:55` ✅ CORRECTO
- Definido en `gamification_system/enums/comodin_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 📚 CATEGORÍA 3: ENUMS DE CONTENIDO EDUCATIVO

### 3.1 `educational_content.exercise_type`

**Propósito:** 31 mecánicas de ejercicios interactivos GAMILIT

**Valores correctos (31):**
```sql
CREATE TYPE educational_content.exercise_type AS ENUM (
    -- Módulo 1: Lectura y comprensión (5)
    'multiple_choice',
    'true_false',
    'fill_in_blank',
    'matching',
    'ordering',

    -- Módulo 2: Análisis de texto (5)
    'text_analysis',
    'summarization',
    'inference',
    'main_idea',
    'supporting_details',

    -- Módulo 3: Vocabulario (5)
    'vocabulary_context',
    'synonyms_antonyms',
    'word_parts',
    'analogies',
    'word_classification',

    -- Módulo 4: Gramática y redacción (5)
    'grammar_correction',
    'sentence_structure',
    'paragraph_organization',
    'writing_prompt',
    'peer_review',

    -- Módulo 5: Pensamiento crítico (5)
    'argument_evaluation',
    'evidence_analysis',
    'cause_effect',
    'problem_solving',
    'creative_thinking',

    -- Auxiliares (6)
    'interactive_game',
    'simulation',
    'drag_drop',
    'audio_comprehension',
    'video_analysis',
    'collaborative_task'
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:80-97`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:80` ✅ CORRECTO
- Definido en `educational_content/enums/exercise_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites (única fuente con comentarios)

**Prioridad:** 🟡 P1

---

### 3.2 `public.difficulty_level`

**Propósito:** Niveles de dificultad para contenido educativo

**Valores correctos (8):**
```sql
CREATE TYPE public.difficulty_level AS ENUM (
    'very_easy',    -- Muy fácil
    'easy',         -- Fácil
    'beginner',     -- Principiante
    'medium',       -- Medio
    'intermediate', -- Intermedio
    'hard',         -- Difícil
    'advanced',     -- Avanzado
    'very_hard'     -- Muy difícil
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:99`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:99` ✅ CORRECTO
- Definido en `public/enums/difficulty_level.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 3.3 `public.cognitive_level`

**Propósito:** Niveles cognitivos según Taxonomía de Bloom adaptada

**Valores correctos (6):**
```sql
CREATE TYPE public.cognitive_level AS ENUM (
    'recordar',    -- Nivel 1: Recordar información
    'comprender',  -- Nivel 2: Comprender conceptos
    'aplicar',     -- Nivel 3: Aplicar conocimiento
    'analizar',    -- Nivel 4: Analizar información
    'evaluar',     -- Nivel 5: Evaluar críticamente
    'crear'        -- Nivel 6: Crear nuevo contenido
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:111`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:111` ✅ CORRECTO
- Definido en `public/enums/cognitive_level.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 📊 CATEGORÍA 4: ENUMS DE PROGRESO Y SEGUIMIENTO

### 4.1 `progress_tracking.progress_status`

**Propósito:** Estados de progreso de módulos/ejercicios

**Valores correctos (5):**
```sql
CREATE TYPE progress_tracking.progress_status AS ENUM (
    'not_started',   -- No iniciado
    'in_progress',   -- En progreso
    'completed',     -- Completado
    'mastered',      -- Dominado (100% + revisión)
    'needs_review'   -- Necesita revisión
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:124`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:124` ✅ CORRECTO
- Definido en `progress_tracking/enums/progress_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 4.2 `public.attempt_status`

**Propósito:** Estados de intentos de ejercicios

**Valores correctos (4):**
```sql
CREATE TYPE public.attempt_status AS ENUM (
    'in_progress', -- En progreso
    'submitted',   -- Enviado para revisión
    'graded',      -- Calificado
    'reviewed'     -- Revisado por profesor
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:128`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:128` ✅ CORRECTO
- Definido en `public/enums/attempt_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 👥 CATEGORÍA 5: ENUMS SOCIALES

### 5.1 `public.classroom_role`

**Propósito:** Roles dentro de un aula virtual

**Valores correctos (3):**
```sql
CREATE TYPE public.classroom_role AS ENUM (
    'teacher',   -- Profesor del aula
    'student',   -- Estudiante del aula
    'assistant'  -- Asistente/ayudante
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:133`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:133` ✅ CORRECTO
- Definido en `social_features/enums/classroom_role.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 5.2 `public.team_role`

**Propósito:** Roles dentro de un equipo

**Valores correctos (3):**
```sql
CREATE TYPE public.team_role AS ENUM (
    'leader',      -- Líder del equipo
    'member',      -- Miembro regular
    'coordinator'  -- Coordinador
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:137`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:137` ✅ CORRECTO
- Definido in `social_features/enums/team_role.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 5.3 `public.friendship_status`

**Propósito:** Estados de solicitudes de amistad

**Valores correctos (3):**
```sql
CREATE TYPE public.friendship_status AS ENUM (
    'pending',  -- Solicitud pendiente
    'accepted', -- Amistad aceptada
    'blocked'   -- Bloqueado
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:141`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:141` ✅ CORRECTO
- Definido en `social_features/enums/friendship_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 🔔 CATEGORÍA 6: ENUMS DE NOTIFICACIONES

### 6.1 `public.notification_type`

**Propósito:** Tipos de notificaciones del sistema

**Valores correctos (11):**
```sql
CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',  -- Logro desbloqueado
    'rank_up',              -- Subida de rango
    'ml_coins_earned',      -- ML Coins ganados
    'assignment_due',       -- Tarea próxima a vencer
    'message_received',     -- Mensaje recibido
    'friend_request',       -- Solicitud de amistad
    'team_invite',          -- Invitación a equipo
    'challenge_started',    -- Desafío iniciado
    'challenge_completed',  -- Desafío completado
    'system_announcement',  -- Anuncio del sistema
    'custom'                -- Personalizada
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:59-73`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:59` ✅ CORRECTO
- Definido en `gamification_system/enums/notification_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 6.2 `public.notification_priority`

**Propósito:** Niveles de prioridad para notificaciones

**Valores correctos (4):**
```sql
CREATE TYPE public.notification_priority AS ENUM (
    'low',      -- Baja prioridad
    'medium',   -- Prioridad media
    'high',     -- Alta prioridad
    'critical'  -- Crítica (requiere atención inmediata)
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:75`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:75` ✅ CORRECTO
- Definido in `public/enums/notification_priority.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 🗂️ CATEGORÍA 7: ENUMS DE CONTENIDO Y MEDIA

### 7.1 `public.content_status`

**Propósito:** Estados de contenido (módulos, ejercicios, etc.)

**Valores correctos (4):**
```sql
CREATE TYPE public.content_status AS ENUM (
    'draft',        -- Borrador
    'published',    -- Publicado
    'archived',     -- Archivado
    'under_review'  -- En revisión
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:107`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:107` ✅ CORRECTO
- Definido in `public/enums/content_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 7.2 `public.media_type`

**Propósito:** Tipos de archivos multimedia

**Valores correctos (5):**
```sql
CREATE TYPE public.media_type AS ENUM (
    'image',       -- Imagen (jpg, png, etc.)
    'video',       -- Video (mp4, webm, etc.)
    'audio',       -- Audio (mp3, wav, etc.)
    'document',    -- Documento (pdf, docx, etc.)
    'interactive'  -- Contenido interactivo (H5P, etc.)
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:115`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:115` ✅ CORRECTO
- Definido in `public/enums/media_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 7.3 `public.processing_status`

**Propósito:** Estados de procesamiento de archivos multimedia

**Valores correctos (4):**
```sql
CREATE TYPE public.processing_status AS ENUM (
    'pending',     -- Pendiente de procesamiento
    'processing',  -- En procesamiento
    'completed',   -- Procesamiento completado
    'failed'       -- Falló el procesamiento
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:119`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:119` ✅ CORRECTO
- Definido in `public/enums/processing_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

## 🛡️ CATEGORÍA 8: ENUMS DE AUDITORÍA Y SISTEMA

### 8.1 `public.audit_action`

**Propósito:** Acciones registradas en audit logs

**Valores correctos (6):**
```sql
CREATE TYPE public.audit_action AS ENUM (
    'create',  -- Creación de registro
    'read',    -- Lectura de registro
    'update',  -- Actualización de registro
    'delete',  -- Eliminación de registro
    'login',   -- Inicio de sesión
    'logout'   -- Cierre de sesión
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:145`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:145` ✅ CORRECTO
- Definido in `audit_logging/enums/audit_action.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 8.2 `public.log_level`

**Propósito:** Niveles de severidad de logs

**Valores correctos (5):**
```sql
CREATE TYPE public.log_level AS ENUM (
    'debug',   -- Debug (desarrollo)
    'info',    -- Información general
    'warning', -- Advertencia
    'error',   -- Error
    'critical' -- Crítico (requiere atención inmediata)
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:149`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido en `00-prerequisites.sql:149` ✅ CORRECTO
- Definido in `public/enums/log_level.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 8.3 `public.alert_severity`

**Propósito:** Niveles de severidad de alertas del sistema

**Valores correctos (4):**
```sql
CREATE TYPE public.alert_severity AS ENUM (
    'info',     -- Informativa
    'warning',  -- Advertencia
    'error',    -- Error
    'critical'  -- Crítica
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:159`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido in `00-prerequisites.sql:159` ✅ CORRECTO
- Definido in `public/enums/alert_severity.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener en prerequisites

**Prioridad:** 🟡 P1

---

### 8.4 `public.alert_status`

**Propósito:** Estados de alertas del sistema

**Valores correctos (4):**
```sql
CREATE TYPE public.alert_status AS ENUM (
    'active',     -- Alerta activa
    'acknowledged', -- Reconocida pero no resuelta
    'resolved',   -- Resuelta
    'ignored'     -- Ignorada
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:163`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido in `00-prerequisites.sql:163` ✅ CORRECTO
- Definido in `public/enums/alert_status.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener in prerequisites

**Prioridad:** 🟡 P1

---

### 8.5 `public.setting_type`

**Propósito:** Tipos de configuraciones del sistema

**Valores correctos (5):**
```sql
CREATE TYPE public.setting_type AS ENUM (
    'string',  -- Texto
    'number',  -- Número
    'boolean', -- Booleano (true/false)
    'json',    -- JSON object
    'array'    -- Array
);
```

**Ubicación canónica:** `apps/database/ddl/00-prerequisites.sql:153`

**Estado actual:** ⚠️ DUPLICADO IDÉNTICO
- Definido in `00-prerequisites.sql:153` ✅ CORRECTO
- Definido in `system_configuration/enums/setting_type.sql:6` ❌ DUPLICADO

**Acción requerida:**
1. ❌ Eliminar definición duplicada
2. ✅ Mantener in prerequisites

**Prioridad:** 🟡 P1

---

## 📊 RESUMEN EJECUTIVO

### Por Estado

| Estado | Cantidad | Prioridad | Acción |
|--------|----------|-----------|--------|
| 🔴 CONFLICTO | 2 | P0 | Corregir valores + consolidar |
| ⚠️ DUPLICADO IDÉNTICO | 21 | P1 | Eliminar duplicados |
| ✅ LIMPIO | 11+ | - | Ninguna (usar como referencia) |

### Por Prioridad

**P0 - CRÍTICO (2 enums):**
1. `auth_management.gamilit_role` - Referencias incorrectas bloquean 3 tablas + 7 RLS
2. `public.auth_provider` - Falta valor 'apple', puede causar errores en runtime

**P1 - ALTO (21 enums):**
- Todos los duplicados idénticos (consolidar para evitar confusión en mantenimiento)

---

## 🎯 PRINCIPIOS DE CONSOLIDACIÓN

### 1. Ubicación Canónica
**REGLA:** TODOS los enums deben definirse en `00-prerequisites.sql`

**Razón:**
- Un solo archivo para verificar tipos disponibles
- Se ejecuta primero (prerequisitos)
- Evita duplicaciones accidentales

### 2. Schema Explícito
**REGLA:** SIEMPRE usar schema completo en definición

**Ejemplo:**
```sql
✅ CORRECTO: CREATE TYPE auth_management.gamilit_role AS ENUM (...)
❌ INCORRECTO: CREATE TYPE gamilit_role AS ENUM (...)
```

### 3. Comentarios Funcionales
**REGLA:** Cada enum DEBE tener COMMENT ON TYPE explicando su propósito

**Ejemplo:**
```sql
COMMENT ON TYPE auth_management.gamilit_role IS 'Roles de usuario en GAMILIT: student, admin_teacher, super_admin';
```

### 4. Valores Descriptivos
**REGLA:** Usar snake_case, inglés, descriptivos

**Ejemplo:**
```sql
✅ CORRECTO: 'second_chance', 'earned_achievement'
❌ INCORRECTO: 'sc', 'ea', 'logro'
```

---

## 🚀 ORDEN DE EJECUCIÓN DE CONSOLIDACIÓN

### Fase 1: P0 - CRÍTICO (3-4 horas)
1. Fix `gamilit_role` - 11 archivos
   - Eliminar duplicado en schema-specific file
   - Cambiar referencias `public.gamilit_role` → `auth_management.gamilit_role`

2. Fix `auth_provider` - 2 archivos
   - Agregar 'apple' en prerequisites
   - Eliminar definición en table file

### Fase 2: P1 - Consolidación Masiva (2-3 horas)
3. Eliminar 21 archivos de enums duplicados en schema-specific directories
4. Validar que todas las referencias apunten a prerequisites
5. Ejecutar tests

### Fase 3: Validación (1 hora)
6. Regenerar Database Inventory Master
7. Verificar 0 duplicados
8. Actualizar _MAP.md files

---

**Última actualización:** 2025-11-07
**Mantenedor:** SQL Agent / Database Team
**Próxima revisión:** Después de consolidación P0
