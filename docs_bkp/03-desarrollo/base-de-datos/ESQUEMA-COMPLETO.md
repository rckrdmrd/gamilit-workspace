# Esquema Completo de Base de Datos - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Timezone:** America/Mexico_City
**Última actualización:** 2025-11-07 (11 tablas adicionales documentadas)

---

## Resumen Ejecutivo

- **Total de Schemas:** 13 (100% documentados)
- **Total de Tablas:** 62 (100% documentadas)
- **Total de ENUMs:** 35
- **Total de Funciones:** 61
- **Total de Triggers:** 49
- **Total de Índices:** 150+

> **NOTA IMPORTANTE:** Para el inventario completo y actualizado de objetos de base de datos, consultar:
> [DATABASE-INVENTORY-MASTER.md](./DATABASE-INVENTORY-MASTER.md) (Fuente de verdad única)

---

## 1. Arquitectura de Schemas

### 1.1 Schema: `gamilit` (Core Utilities)

**Propósito:** Schema principal para funciones utilitarias de uso transversal en toda la plataforma.

**Funciones:**
- `now_mexico()` - Retorna timestamp en zona horaria de México (America/Mexico_City)
- `update_updated_at()` - Función trigger para actualización automática de timestamps

**Tablas:** 0 (solo funciones utilitarias)

---

### 1.2 Schema: `auth_management` (Autenticación y Gestión de Usuarios)

**Propósito:** Gestión completa de autenticación, perfiles de usuario, roles, sesiones y tenants.

**Tablas:** 12 tablas

#### 1.2.1 Tabla: `tenants`
```sql
CREATE TABLE auth_management.tenants (
    id UUID PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    domain TEXT,
    subscription_tier TEXT CHECK (subscription_tier IN
        ('free', 'basic', 'professional', 'enterprise')),
    max_users INTEGER DEFAULT 100,
    max_storage_gb INTEGER DEFAULT 5,
    is_active BOOLEAN DEFAULT true,
    settings JSONB,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Propósito:** Soporte multi-tenant para aislamiento de datos por organización.

**Relaciones:**
- Referenciado por: `profiles`, `schools`, `classrooms`, `teams`

---

#### 1.2.2 Tabla: `profiles`
```sql
CREATE TABLE auth_management.profiles (
    id UUID PRIMARY KEY,
    tenant_id UUID FK -> tenants(id),
    display_name TEXT,
    full_name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role gamilit_role DEFAULT 'student',
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT false,
    preferences JSONB,
    last_sign_in_at TIMESTAMPTZ,
    last_activity_at TIMESTAMPTZ,
    metadata JSONB,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Propósito:** Perfiles de usuario con información básica y configuraciones.

**Roles disponibles:** `student`, `admin_teacher`, `super_admin`

**Triggers:**
- `trg_profiles_updated_at` - Actualiza timestamp automáticamente
- `trg_audit_profile_changes` - Audita cambios de rol/status
- `trg_set_profile_defaults` - Establece valores por defecto
- `trg_initialize_user_stats` - Inicializa datos de gamificación

**Relaciones:**
- Referenciado por: `user_stats`, `user_ranks`, `module_progress`, `exercise_attempts`

---

#### 1.2.3 Tabla: `user_roles`

**Propósito:** Asignación de roles con permisos específicos y caducidad.

**Columnas clave:**
- `role` - gamilit_role ENUM
- `permissions` - JSONB con permisos específicos
- `expires_at` - Fecha de caducidad del rol

---

#### 1.2.4 Tabla: `user_sessions`

**Propósito:** Sesiones activas con información de dispositivo y geolocalización.

**Columnas clave:**
- `session_token` - JWT único
- `refresh_token` - Token de renovación
- `device_type` - (desktop, mobile, tablet, unknown)
- `ip_address` - INET para geolocalización
- `expires_at` - Fecha de expiración obligatoria

---

#### 1.2.5 Tabla: `auth_attempts`

**Propósito:** Registro de intentos de autenticación para seguridad.

**Índices especiales:**
- `idx_auth_attempts_failed` - Índice parcial para intentos fallidos

---

#### 1.2.6 Tabla: `memberships`

**Propósito:** Relaciones usuario-tenant con permisos.

**Constraint único:** `(user_id, tenant_id)`

---

#### 1.2.7 Tabla: `user_preferences`

**Propósito:** Preferencias personalizadas de cada usuario para la interfaz y experiencia de la aplicación.

**Columnas clave:**
- `user_id` UUID PRIMARY KEY FK → `profiles(id)` - 1:1 con profiles
- `theme` VARCHAR(20) - Tema visual (light, dark, auto)
- `language` VARCHAR(10) - Idioma (es, en)
- `notifications_enabled` BOOLEAN - Habilitar notificaciones push
- `email_notifications` BOOLEAN - Habilitar notificaciones por email
- `sound_enabled` BOOLEAN - Efectos de sonido
- `tutorial_completed` BOOLEAN - Estado del tutorial inicial
- `preferences` JSONB - Preferencias adicionales personalizadas

**Check Constraints:**
- `theme IN ('light', 'dark', 'auto')`
- `language IN ('es', 'en')`

**Índices:**
- GIN index en `preferences` para búsquedas en JSONB
- Partial index en `tutorial_completed = false` para nuevos usuarios

**RLS Policies:**
- Users can SELECT/UPDATE their own preferences
- Admins can SELECT all preferences

**Referencia:** `apps/database/ddl/schemas/auth_management/tables/09-user_preferences.sql`

---

#### 1.2.8 Tabla: `user_sessions`

**Propósito:** Sesiones activas de usuarios con información de dispositivo, ubicación e IP para seguridad y auditoría.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `user_id` UUID FK → `profiles(id)`
- `tenant_id` UUID FK → `tenants(id)`
- `session_token` TEXT UNIQUE - Token único de sesión
- `device_type` TEXT - Tipo de dispositivo (desktop, mobile, tablet)
- `device_name` TEXT - Nombre del dispositivo
- `browser` TEXT - Navegador utilizado
- `os` TEXT - Sistema operativo
- `ip_address` INET - Dirección IP
- `location` TEXT - Ubicación geográfica
- `is_active` BOOLEAN DEFAULT true - Sesión activa
- `last_activity_at` TIMESTAMPTZ - Última actividad
- `expires_at` TIMESTAMPTZ - Fecha de expiración
- `created_at` TIMESTAMPTZ

**Uso:**
- Gestión de sesiones múltiples por usuario
- Tracking de dispositivos y ubicaciones
- Revocación de sesiones remotas
- Detección de actividad sospechosa

**Foreign Keys:**
- → `auth_management.profiles`
- → `auth_management.tenants`

**Índices:**
- `idx_user_sessions_user_id` - Buscar sesiones por usuario
- `idx_user_sessions_active` - Sesiones activas
- `idx_user_sessions_token` - Lookup por token

**Referencia:** `apps/database/ddl/schemas/auth_management/tables/11-user_sessions.sql`

---

#### 1.2.9 Tabla: `user_suspensions`

**Propósito:** Registro de suspensiones y baneos de cuentas de usuario con historial completo.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `user_id` UUID FK → `profiles(id)` - Usuario suspendido
- `suspended_by` UUID FK → `profiles(id)` - Admin que suspendió
- `tenant_id` UUID FK → `tenants(id)`
- `suspension_type` TEXT - Tipo (temporary, permanent, warning)
- `reason` TEXT NOT NULL - Motivo de la suspensión
- `severity` TEXT - Severidad (low, medium, high, critical)
- `suspended_at` TIMESTAMPTZ - Fecha de suspensión
- `expires_at` TIMESTAMPTZ - Fecha de expiración (NULL para permanente)
- `is_active` BOOLEAN DEFAULT true - Suspensión activa
- `notes` TEXT - Notas adicionales del administrador
- `appeal_status` TEXT - Estado de apelación (pending, approved, rejected)
- `created_at` / `updated_at` TIMESTAMPTZ

**Tipos de suspensión:**
- `temporary` - Suspensión temporal con fecha de expiración
- `permanent` - Baneo permanente
- `warning` - Advertencia sin suspensión real

**Uso:**
- Moderación de usuarios
- Historial de infracciones
- Sistema de apelaciones
- Auditoría de acciones administrativas

**Referencia:** `apps/database/ddl/schemas/auth_management/tables/12-user_suspensions.sql`

---

#### Tablas adicionales:
- `password_reset_tokens` - Tokens para recuperación de contraseña
- `email_verification_tokens` - Tokens para verificación de email
- `security_events` - Eventos de seguridad (intentos de acceso no autorizado, etc.)

---

### 1.3 Schema: `gamification_system` (Gamificación y Economía)

**Propósito:** Sistema completo de gamificación incluyendo ML Coins, rangos Maya, achievements y power-ups.

**Tablas:** 13 tablas

#### 1.3.1 Tabla: `user_stats`
```sql
CREATE TABLE gamification_system.user_stats (
    id UUID PRIMARY KEY,
    user_id UUID UNIQUE FK -> profiles(id),
    tenant_id UUID FK -> tenants(id),

    -- Experiencia y Niveles
    level INTEGER DEFAULT 1 CHECK (level > 0),
    total_xp INTEGER DEFAULT 0 CHECK (total_xp >= 0),
    xp_to_next_level INTEGER DEFAULT 100,

    -- Economía ML Coins
    ml_coins INTEGER DEFAULT 100 CHECK (ml_coins >= 0),
    ml_coins_earned_total INTEGER DEFAULT 100,
    ml_coins_spent_total INTEGER DEFAULT 0,
    ml_coins_earned_today INTEGER DEFAULT 0,

    -- Rachas
    current_streak INTEGER DEFAULT 0,
    max_streak INTEGER DEFAULT 0,
    days_active_total INTEGER DEFAULT 0,

    -- Contadores de Progreso
    exercises_completed INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    average_score NUMERIC(5,2),

    -- Rankings (cached)
    global_rank_position INTEGER,
    class_rank_position INTEGER,
    school_rank_position INTEGER,

    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Propósito:** Estadísticas centrales de gamificación por usuario.

**Fórmula de nivel:** `level = floor(sqrt(total_xp / 100)) + 1`

**Triggers:**
- `trg_user_stats_updated_at`
- `trg_recalculate_level_on_xp_change` - Recalcula nivel automáticamente

---

#### 1.3.2 Tabla: `user_ranks`

**Propósito:** Progresión de rangos Maya con historial.

**Rangos Maya (en orden):**
1. **Ajaw** (Starter) - Multiplicador: 1.0x
2. **Nacom** (1 módulo) - Multiplicador: 1.25x
3. **Ah K'in** (2 módulos) - Multiplicador: 1.5x
4. **Halach Uinic** (3 módulos) - Multiplicador: 1.75x
5. **K'uk'ulkan** (5 módulos) - Multiplicador: 2.0x

**Columnas clave:**
- `current_rank` - rango_maya ENUM
- `rank_progress_percentage` - CHECK (0-100)
- `ml_coins_bonus` - Bonus otorgado al alcanzar el rango

---

#### 1.3.3 Tabla: `achievements`

**Propósito:** Definiciones de logros con condiciones y recompensas.

**Categorías:** progress, streak, completion, social, special, mastery, exploration

**Rareza:** common, rare, epic, legendary

**Estructura de condiciones (JSONB):**
```json
{
    "type": "progress",
    "requirements": {
        "exercises_completed": 10
    }
}
```

**Estructura de recompensas (JSONB):**
```json
{
    "ml_coins": 50,
    "xp": 100,
    "badge": "first_exercise"
}
```

---

#### 1.3.4 Tabla: `user_achievements`

**Propósito:** Logros desbloqueados por usuario con progreso.

**Constraint único:** `(user_id, achievement_id)`

---

#### 1.3.5 Tabla: `ml_coins_transactions`

**Propósito:** Ledger completo de transacciones de ML Coins.

**Tipos de transacción:**
- Ganadas: `earned_exercise`, `earned_achievement`, `earned_daily_bonus`, `earned_rank_promotion`
- Gastadas: `spent_hint`, `spent_unlock_content`, `spent_customization`
- Otros: `refund`, `admin_adjustment`, `gift`

**Columnas clave:**
- `amount` - Cantidad (positiva o negativa)
- `balance_before` / `balance_after` - Saldos para auditoría
- `multiplier` - Multiplicador de rango aplicado

---

#### 1.3.6 Tabla: `comodines_inventory`

**Propósito:** Inventario de power-ups del usuario.

**Power-ups disponibles:**
- **Pistas** - 15 ML Coins
- **Visión Lectora** - 25 ML Coins
- **Segunda Oportunidad** - 40 ML Coins

**Columnas para cada comodín:**
- `[tipo]_available` - Cantidad actual
- `[tipo]_purchased_total` - Total comprado
- `[tipo]_used_total` - Total usado
- `[tipo]_cost` - Costo actual

---

#### 1.3.7 Tabla: `missions`

**Propósito:** Misiones/quests diarias, semanales y especiales.

**Tipos:** daily, weekly, special

**Estados:** active, in_progress, completed, claimed, expired

**RLS:** Habilitado (usuarios solo ven sus propias misiones)

---

#### 1.3.8 Tabla: `notifications`

**Propósito:** Sistema de notificaciones del usuario con soporte para tipos múltiples y prioridades.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `user_id` UUID FK → `auth.users` - Usuario destinatario
- `tenant_id` UUID FK → `auth_management.tenants`
- `type` notification_type - Tipo de notificación
- `title` TEXT NOT NULL - Título de la notificación
- `message` TEXT - Mensaje completo
- `priority` notification_priority - Prioridad (low, medium, high, critical)
- `is_read` BOOLEAN DEFAULT false - Leída
- `read_at` TIMESTAMPTZ - Fecha de lectura
- `action_url` TEXT - URL de acción
- `metadata` JSONB - Datos adicionales
- `expires_at` TIMESTAMPTZ - Fecha de expiración
- `created_at` TIMESTAMPTZ

**Tipos de notificación (public.notification_type):**
- `achievement_unlocked` - Logro desbloqueado
- `rank_up` - Subida de rango Maya
- `friend_request` - Solicitud de amistad
- `guild_invitation` - Invitación a equipo
- `mission_completed` - Misión completada
- `level_up` - Subida de nivel
- `message_received` - Mensaje recibido
- `system_announcement` - Anuncio del sistema
- `ml_coins_earned` - ML Coins ganadas
- `streak_milestone` - Hito de racha
- `exercise_feedback` - Retroalimentación de ejercicio

**Prioridades:**
- `low` - Notificaciones informativas
- `medium` - Notificaciones normales
- `high` - Notificaciones importantes
- `critical` - Notificaciones urgentes

**Índices:**
- `idx_notifications_user_unread` - Notificaciones no leídas por usuario
- `idx_notifications_type` - Filtrar por tipo
- `idx_notifications_priority` - Filtrar por prioridad

**RLS:** Usuarios solo ven sus propias notificaciones

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

---

#### 1.3.9 Tabla: `leaderboard_metadata`

**Propósito:** Metadata para configuración de leaderboards y rankings.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `tenant_id` UUID FK → `auth_management.tenants`
- `name` TEXT NOT NULL - Nombre del leaderboard
- `description` TEXT - Descripción
- `leaderboard_type` TEXT - Tipo (global, classroom, school, weekly, monthly)
- `metric` TEXT - Métrica evaluada (xp, ml_coins, exercises_completed, streak)
- `scope` TEXT - Alcance (global, tenant, classroom, school)
- `aggregation_period` TEXT - Periodo (daily, weekly, monthly, all_time)
- `is_active` BOOLEAN DEFAULT true
- `settings` JSONB - Configuraciones adicionales
- `created_at` / `updated_at` TIMESTAMPTZ

**Uso:**
- Configuración de múltiples leaderboards
- Rankings por diferentes métricas
- Leaderboards por scope (global, escuela, aula)
- Leaderboards temporales (semanales, mensuales)

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/09-leaderboard_metadata.sql`

---

#### 1.3.10 Tabla: `achievement_categories`

**Propósito:** Categorías de logros para organización y agrupamiento.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `tenant_id` UUID FK → `auth_management.tenants`
- `name` TEXT NOT NULL - Nombre de la categoría
- `description` TEXT - Descripción
- `icon_url` TEXT - URL del ícono
- `color` TEXT - Color representativo (hex)
- `order_index` INTEGER - Orden de visualización
- `is_active` BOOLEAN DEFAULT true
- `metadata` JSONB - Metadata adicional
- `created_at` / `updated_at` TIMESTAMPTZ

**Categorías comunes:**
- Progress - Logros de progreso
- Streak - Logros de rachas
- Completion - Logros de completitud
- Social - Logros sociales
- Special - Logros especiales
- Mastery - Logros de maestría
- Exploration - Logros de exploración

**Relación:**
- `achievements.category_id` FK → `achievement_categories.id`

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/10-achievement_categories.sql`

---

#### 1.3.11 Tabla: `active_boosts`

**Propósito:** Boosts/potenciadores activos temporales del usuario.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `user_id` UUID FK → `auth.users`
- `tenant_id` UUID FK → `auth_management.tenants`
- `boost_type` TEXT - Tipo de boost (xp_multiplier, ml_coins_multiplier, hint_discount, etc.)
- `multiplier` NUMERIC - Multiplicador aplicado (e.g., 1.5 para +50%)
- `source` TEXT - Origen del boost (achievement, purchase, event, admin_grant)
- `activated_at` TIMESTAMPTZ - Fecha de activación
- `expires_at` TIMESTAMPTZ - Fecha de expiración
- `is_active` BOOLEAN DEFAULT true
- `metadata` JSONB - Datos adicionales
- `created_at` TIMESTAMPTZ

**Tipos de boost:**
- `xp_multiplier` - Multiplicador de XP (1.5x, 2x)
- `ml_coins_multiplier` - Multiplicador de ML Coins
- `hint_discount` - Descuento en hints
- `comodin_discount` - Descuento en comodines
- `streak_protection` - Protección de racha (1 día gratis)
- `double_rewards` - Recompensas dobles

**Uso:**
- Eventos especiales con bonificaciones
- Recompensas de logros
- Compras en tienda
- Promociones administrativas

**Índices:**
- `idx_active_boosts_user_active` - Boosts activos por usuario
- `idx_active_boosts_expires` - Expiración de boosts

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/11-active_boosts.sql`

---

#### 1.3.12 Tabla: `inventory_transactions`

**Propósito:** Historial de transacciones del inventario de comodines.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `user_id` UUID FK → `auth.users`
- `tenant_id` UUID FK → `auth_management.tenants`
- `comodin_type` comodin_type - Tipo (pistas, vision_lectora, segunda_oportunidad)
- `transaction_type` TEXT - Tipo de transacción (purchase, use, grant, refund)
- `quantity` INTEGER - Cantidad (positiva o negativa)
- `ml_coins_cost` INTEGER - Costo en ML Coins (para purchases)
- `balance_before` INTEGER - Balance antes de la transacción
- `balance_after` INTEGER - Balance después de la transacción
- `source` TEXT - Origen (user_purchase, admin_grant, achievement_reward, event_bonus)
- `metadata` JSONB - Datos adicionales
- `created_at` TIMESTAMPTZ

**Tipos de transacción:**
- `purchase` - Compra de comodín con ML Coins
- `use` - Uso de comodín en ejercicio
- `grant` - Otorgado por admin o evento
- `refund` - Reembolso

**Uso:**
- Auditoría completa del inventario
- Tracking de uso de comodines
- Analytics de compras
- Detección de patrones de uso

**Índices:**
- `idx_inventory_transactions_user` - Transacciones por usuario
- `idx_inventory_transactions_type` - Por tipo de comodín

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql`

---

#### 1.3.13 Tabla: `maya_ranks`

**Propósito:** Definición de rangos Maya con requisitos y recompensas.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `rank_name` gamification_system.maya_rank - Nombre del rango (Ajaw, Nacom, etc.)
- `order_index` INTEGER - Orden (1-5)
- `display_name` TEXT - Nombre para mostrar
- `description` TEXT - Descripción del rango
- `icon_url` TEXT - URL del ícono/badge
- `requirements` JSONB - Requisitos para alcanzar el rango
- `rewards` JSONB - Recompensas al alcanzar el rango
- `xp_multiplier` NUMERIC DEFAULT 1.0 - Multiplicador de XP
- `ml_coins_multiplier` NUMERIC DEFAULT 1.0 - Multiplicador de ML Coins
- `color` TEXT - Color representativo (hex)
- `is_active` BOOLEAN DEFAULT true
- `metadata` JSONB
- `created_at` / `updated_at` TIMESTAMPTZ

**Rangos Maya (orden):**
1. **Ajaw** (Señor) - Rango inicial
2. **Nacom** (Guerrero) - 1 módulo completado
3. **Ah K'in** (Sacerdote) - 2 módulos completados
4. **Halach Uinic** (Hombre Verdadero) - 3 módulos completados
5. **K'uk'ulkan** (Serpiente Emplumada) - 5 módulos completados

**Estructura de requirements (JSONB):**
```json
{
    "modules_completed": 2,
    "min_xp": 1000,
    "achievements_unlocked": 5
}
```

**Estructura de rewards (JSONB):**
```json
{
    "ml_coins": 500,
    "xp": 1000,
    "badge": "nacom_rank",
    "unlock_features": ["advanced_exercises"]
}
```

**Uso:**
- Configuración de requisitos de rangos
- Personalización de recompensas
- Modificación de multiplicadores

**Referencia:** `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`

---

### 1.4 Schema: `educational_content` (Contenido Educativo)

**Propósito:** Módulos educativos, ejercicios, rúbricas de evaluación y recursos multimedia.

**Tablas:** 4 tablas

#### 1.4.1 Tabla: `modules`
```sql
CREATE TABLE educational_content.modules (
    id UUID PRIMARY KEY,
    tenant_id UUID FK -> tenants(id),
    title TEXT NOT NULL,
    description TEXT,
    content JSONB, -- marie_curie_story, historical_context, etc.
    order_index INTEGER NOT NULL,
    difficulty_level difficulty_level,
    grade_levels TEXT[] DEFAULT ['6','7','8'],
    subjects TEXT[] DEFAULT ['Literatura','Ciencias'],
    learning_objectives TEXT[],
    competencies TEXT[],
    skills_developed TEXT[],
    prerequisites UUID[], -- Array de module IDs
    rango_maya_required rango_maya,
    rango_maya_granted rango_maya,
    xp_reward INTEGER DEFAULT 100,
    ml_coins_reward INTEGER DEFAULT 50,
    status content_status,
    is_published BOOLEAN DEFAULT false,
    version INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
);
```

**Propósito:** Módulos educativos sobre Marie Curie (5 módulos principales).

**Búsqueda full-text:** Índice GIN en español para title+description

---

#### 1.4.2 Tabla: `exercises`

**Propósito:** Ejercicios con 27 tipos de mecánicas diferentes.

**Tipos de ejercicios (27):**
- Básicos: multiple_choice, multiple_selection, true_false, fill_in_blank
- Interactivos: matching, ordering, classification, word_search, crossword
- Multimedia: drag_and_drop, image_selection, audio_question, video_question
- Avanzados: timeline, map_interaction, code_exercise, essay, short_answer
- Colaborativos: discussion, peer_review, simulation, virtual_lab
- Analíticos: interactive_diagram, calculation, graphing, data_analysis

**Estructura de contenido (JSONB):**
```json
{
    "question": "¿Cuándo nació Marie Curie?",
    "options": ["1867", "1870", "1875"],
    "correct_answers": ["1867"],
    "explanations": {
        "1867": "Correcto - Marie nació el 7 de noviembre de 1867",
        "1870": "Incorrecto - Nació 3 años antes",
        "1875": "Incorrecto - Nació 8 años antes"
    }
}
```

**Comodines permitidos:**
- Array `comodin_type[]`: ['pistas', 'vision_lectora', 'segunda_oportunidad']

---

#### 1.4.3 Tabla: `assessment_rubrics`

**Propósito:** Rúbricas de evaluación para ejercicios y módulos.

**Tipos de evaluación:** automatic, manual, hybrid, peer_review

---

#### 1.4.4 Tabla: `media_resources`

**Propósito:** Recursos multimedia para contenido educativo.

**Tipos de media:** image, video, audio, document, animation, 3d_model

---

### 1.5 Schema: `progress_tracking` (Seguimiento de Progreso)

**Propósito:** Tracking completo del progreso del estudiante.

**Tablas:** 5 tablas

#### 1.5.1 Tabla: `module_progress`

**Propósito:** Progreso del estudiante por módulo.

**Estados:** not_started, in_progress, completed, locked

**Columnas de analytics:**
- `completed_exercises` / `total_exercises`
- `progress_percentage` - CHECK (0-100)
- `total_score` / `max_possible_score` / `average_score`
- `time_spent` - INTERVAL
- `hints_used_total` / `comodines_used_total`

**Constraint único:** `(user_id, module_id)`

---

#### 1.5.2 Tabla: `exercise_attempts`

**Propósito:** Intentos de ejercicios con respuestas y puntuaciones.

**Columnas clave:**
- `attempt_number` - Número del intento
- `submitted_answers` - JSONB con respuestas del alumno
- `is_correct` - Boolean de resultado
- `score` - Puntuación obtenida
- `hints_used` - Cantidad de pistas usadas
- `comodines_used` - JSONB con comodines aplicados

**Trigger:** `trg_update_user_stats_on_exercise` - Actualiza stats al completar

---

#### 1.5.3 Tabla: `learning_sessions`

**Propósito:** Sesiones de aprendizaje con métricas de engagement.

**Tipos de sesión:** learning, practice, assessment, review

**Métricas capturadas:**
- `duration` / `active_time` / `idle_time`
- `exercises_attempted` / `exercises_completed`
- `clicks_count` / `page_views` / `resource_downloads`
- `device_info` / `browser_info` / `connection_quality`

---

#### 1.5.4 Tabla: `exercise_submissions`

**Propósito:** Entregas y calificaciones de ejercicios por estudiantes (diferente de exercise_attempts).

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `exercise_id` UUID FK → `educational_content.exercises`
- `student_id` UUID FK → `auth.users`
- `attempt_id` UUID FK → `exercise_attempts(id)` - Intento asociado
- `tenant_id` UUID FK → `auth_management.tenants`
- `submission_data` JSONB - Datos de la entrega
- `submitted_at` TIMESTAMPTZ - Fecha de entrega
- `status` attempt_status - Estado (in_progress, submitted, graded, reviewed)
- `score` NUMERIC - Calificación obtenida
- `max_score` NUMERIC - Calificación máxima posible
- `auto_graded` BOOLEAN - Calificado automáticamente
- `feedback` TEXT - Retroalimentación del profesor/sistema
- `graded_by` UUID FK → `auth.users` - Profesor que calificó
- `graded_at` TIMESTAMPTZ - Fecha de calificación
- `is_late` BOOLEAN - Entrega tardía
- `metadata` JSONB - Metadata adicional
- `created_at` / `updated_at` TIMESTAMPTZ

**Diferencia con exercise_attempts:**
- `exercise_attempts` - Todos los intentos de ejercicios (práctica, estudio)
- `exercise_submissions` - Entregas formales para calificación (assignments, exámenes)

**Estados (attempt_status):**
- `in_progress` - En progreso
- `submitted` - Entregado, pendiente de calificación
- `graded` - Calificado
- `reviewed` - Revisado por profesor

**Uso:**
- Assignments de profesores
- Exámenes y evaluaciones formales
- Calificación manual por profesores
- Tracking de entregas tardías

**Foreign Keys:**
- → `educational_content.exercises`
- → `auth.users` (student_id)
- → `auth.users` (graded_by)
- → `exercise_attempts` (attempt_id)
- → `auth_management.tenants`

**Índices:**
- `idx_exercise_submissions_student` - Entregas por estudiante
- `idx_exercise_submissions_exercise` - Entregas por ejercicio
- `idx_exercise_submissions_status` - Filtrar por estado
- `idx_exercise_submissions_graded_by` - Entregas por calificador

**Referencia:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`

---

#### 1.5.5 Tabla: `scheduled_missions`

**Propósito:** Misiones programadas asignadas a usuarios con fechas de inicio y fin.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `mission_id` UUID FK → `gamification_system.missions` - Misión asociada
- `user_id` UUID FK → `auth.users` - Usuario asignado
- `tenant_id` UUID FK → `auth_management.tenants`
- `assigned_at` TIMESTAMPTZ - Fecha de asignación
- `starts_at` TIMESTAMPTZ - Fecha de inicio
- `expires_at` TIMESTAMPTZ - Fecha de expiración
- `completed_at` TIMESTAMPTZ - Fecha de completitud
- `claimed_at` TIMESTAMPTZ - Fecha de reclamo de recompensa
- `progress` JSONB - Progreso actual de la misión
- `status` TEXT - Estado (pending, active, in_progress, completed, claimed, expired)
- `is_active` BOOLEAN DEFAULT true
- `metadata` JSONB - Metadata adicional
- `created_at` / `updated_at` TIMESTAMPTZ

**Estados:**
- `pending` - Programada, no ha iniciado
- `active` - Activa, disponible para completar
- `in_progress` - Usuario trabajando en ella
- `completed` - Completada, pendiente de reclamar recompensa
- `claimed` - Recompensa reclamada
- `expired` - Expirada sin completar

**Uso:**
- Misiones diarias asignadas a todos los usuarios
- Misiones semanales por grupos
- Misiones especiales por eventos
- Tracking de completitud y recompensas

**Estructura de progress (JSONB):**
```json
{
    "current": 5,
    "required": 10,
    "percentage": 50,
    "milestones": ["first_exercise", "halfway_point"]
}
```

**Foreign Keys:**
- → `gamification_system.missions`
- → `auth.users`
- → `auth_management.tenants`

**Índices:**
- `idx_scheduled_missions_user` - Misiones por usuario
- `idx_scheduled_missions_status` - Filtrar por estado
- `idx_scheduled_missions_active` - Misiones activas
- `idx_scheduled_missions_expires` - Expiraciones próximas

**Triggers:**
- Trigger para actualizar estado automáticamente basado en fechas
- Trigger para notificar al usuario cuando una misión se activa

**Referencia:** `apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql`

---

### 1.6 Schema: `social_features` (Características Sociales)

**Propósito:** Escuelas, aulas, equipos y características sociales.

**Tablas:** 7 tablas

#### 1.6.1 Tabla: `schools`

**Propósito:** Instituciones educativas.

**Columnas clave:**
- `code` - Código único UNIQUE
- `grade_levels` - TEXT[] DEFAULT ['6','7','8']
- `max_students` / `current_students_count`

---

#### 1.6.2 Tabla: `classrooms`

**Propósito:** Aulas virtuales por profesor.

**Columnas clave:**
- `teacher_id` - FK a profiles(id)
- `co_teachers` - UUID[] para co-profesores
- `capacity` / `current_students_count`

**Triggers:**
- `trg_classrooms_updated_at`
- `trg_update_classroom_count` - Actualiza contador de estudiantes

---

#### 1.6.3 Tabla: `classroom_members`

**Propósito:** Inscripción de estudiantes en aulas.

**Métodos de inscripción:** teacher_invite, self_enroll, admin_add, bulk_import

**Constraint único:** `(classroom_id, student_id)`

**Trigger:** `trg_update_classroom_count`

---

#### 1.6.4 Tabla: `teams`

**Propósito:** Equipos colaborativos de estudiantes.

**Columnas clave:**
- `team_code` - UNIQUE para invitaciones
- `leader_id` / `creator_id`
- `max_members` DEFAULT 5
- `total_xp` / `total_ml_coins` - Stats del equipo

---

#### Tablas adicionales:
- `friendships` - Relaciones de amistad entre usuarios
- `team_members` - Miembros de equipos
- `team_challenges` - Desafíos asignados a equipos

---

### 1.7 Schema: `content_management` (Gestión de Contenido)

**Propósito:** Contenido de Marie Curie, archivos multimedia y plantillas.

**Tablas:** 4 tablas

#### 1.7.1 Tabla: `marie_curie_content`

**Propósito:** Contenido educativo curado sobre Marie Curie.

**Categorías:**
- biography, discoveries, historical_context
- scientific_method, radioactivity, nobel_prizes
- women_in_science, modern_physics, legacy

**Búsqueda full-text:** Índice GIN en español

---

#### 1.7.2 Tabla: `media_files`

**Propósito:** Metadata de archivos multimedia subidos.

**Estados de procesamiento:** uploading, processing, ready, error, optimizing

---

#### 1.7.3 Tabla: `content_templates`

**Propósito:** Plantillas reutilizables de contenido.

**Tipos:** exercise, module, assessment, announcement, feedback

---

#### 1.7.4 Tabla: `flagged_content`

**Propósito:** Contenido marcado para moderación.

**Tipos de contenido:** exercise, comment, profile, post, message

**Estados:** pending, approved, rejected, removed

---

### 1.8 Schema: `system_configuration` (Configuración del Sistema)

**Propósito:** Configuración global y feature flags.

**Tablas:** 2 tablas

#### 1.8.1 Tabla: `system_settings`

**Propósito:** Configuración global de la plataforma.

**Categorías:** general, gamification, security, email, storage, analytics, integrations

**Tipos de valores:** string, number, boolean, json, array

---

#### 1.8.2 Tabla: `feature_flags`

**Propósito:** Feature toggles para despliegue gradual.

**Columnas clave:**
- `is_enabled` - Boolean de activación
- `rollout_percentage` - INTEGER (0-100) para A/B testing
- `target_users` / `target_roles` - Segmentación

---

### 1.9 Schema: `audit_logging` (Auditoría y Logs)

**Propósito:** Logs de sistema, auditoría, métricas de performance y alertas.

**Tablas:** 6 tablas

#### 1.9.1 Tabla: `audit_logs`

**Propósito:** Trail de auditoría completo de acciones del sistema.

**Columnas clave:**
- `event_type` / `action` / `resource_type`
- `actor_id` / `actor_type` (user, system, api, cron)
- `old_values` / `new_values` / `changes` - JSONB
- `severity` (debug, info, warning, error, critical)

---

#### 1.9.2 Tabla: `system_logs`

**Propósito:** Logs a nivel de sistema.

**Niveles:** TRACE, DEBUG, INFO, WARN, ERROR, FATAL

---

#### 1.9.3 Tabla: `performance_metrics`

**Propósito:** Métricas de performance.

**Tipos de métrica:** counter, gauge, histogram, timer

---

#### 1.9.4 Tabla: `user_activity_logs`

**Propósito:** Tracking de actividad de usuario para analytics.

**Tipos de actividad:**
- page_view, button_click, form_submit
- exercise_start, exercise_complete, module_access
- video_play, resource_download, search_query

---

#### 1.9.5 Tabla: `system_alerts`

**Propósito:** Alertas del sistema.

**Tipos:** performance_degradation, high_error_rate, security_breach, resource_limit

**Severidades:** low, medium, high, critical

---

#### 1.9.6 Tabla: `user_activity`

**Propósito:** Log de actividad de usuarios para administración.

---

### 1.10 Schema: `admin_dashboard` (Dashboard Administrativo)

**Propósito:** Vistas y objetos para el dashboard administrativo de la plataforma.

**Tablas:** 0 (solo vistas planificadas)

**Estado:** 🔧 En planificación

**Nota:** Este schema está reservado para vistas materializadas y objetos optimizados para el dashboard administrativo. Incluirá:
- Vistas de métricas agregadas por organización
- Estadísticas de uso de la plataforma
- Reportes de progreso de estudiantes
- Analytics de contenido educativo

**Referencia:** [DATABASE-INVENTORY-MASTER.md](./DATABASE-INVENTORY-MASTER.md#admin_dashboard)

---

### 1.11 Schema: `auth` (Supabase Authentication)

**Propósito:** Schema de autenticación de Supabase para gestión de usuarios base y autenticación OAuth.

**Tablas:** 1 tabla

#### 1.11.1 Tabla: `users`

**Propósito:** Tabla base de usuarios de Supabase Auth (integración oficial).

**Columnas clave:**
- `id` UUID - Primary key, sincronizado con auth_management.profiles
- `email` TEXT - Email único del usuario
- `encrypted_password` TEXT - Password hasheado (bcrypt)
- `email_confirmed_at` TIMESTAMPTZ - Timestamp de verificación de email
- `role` gamilit_role - Rol del usuario (student, admin_teacher, super_admin)
- `last_sign_in_at` TIMESTAMPTZ - Último inicio de sesión
- `created_at` / `updated_at` TIMESTAMPTZ - Auditoría

**Relaciones:**
- Referenciado por: `auth_management.profiles` (1:1)
- Referenciado por: Múltiples tablas de seguimiento de progreso y gamificación

**Funciones asociadas:**
- `auth.authenticate_user(email, password)` - Autenticación de usuarios

**Nota:** Esta es una tabla gestionada por Supabase Auth. La aplicación no debe modificarla directamente, sino usar las funciones y triggers de Supabase.

**Referencia:**
- DDL: `apps/database/ddl/schemas/auth/tables/01-users.sql`
- Documentación Supabase: https://supabase.com/docs/guides/auth

---

### 1.12 Schema: `public` (Objetos Públicos y Assignments)

**Propósito:** Schema público de PostgreSQL con objetos compartidos, ENUMs globales y tablas de asignaciones de profesores.

**Tablas:** 6 tablas (módulo de assignments)

#### 1.12.1 Tabla: `assignments`

**Propósito:** Asignaciones creadas por profesores para estudiantes.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `teacher_id` UUID FK → `auth.users` - Profesor creador
- `tenant_id` UUID FK → `auth_management.tenants`
- `title` TEXT NOT NULL - Título de la asignación
- `description` TEXT - Descripción detallada
- `instructions` TEXT - Instrucciones para estudiantes
- `due_date` TIMESTAMPTZ - Fecha límite de entrega
- `points_possible` INTEGER - Puntos máximos
- `is_published` BOOLEAN DEFAULT false - Estado de publicación
- `settings` JSONB - Configuración adicional
- `created_at` / `updated_at` TIMESTAMPTZ

**Relaciones:**
- `N:M` con `educational_content.exercises` (via `assignment_exercises`)
- `N:M` con `social_features.classrooms` (via `assignment_classrooms`)
- `N:M` con `auth.users` (estudiantes) (via `assignment_students`)
- `1:N` con `assignment_submissions`

---

#### 1.12.2 Tabla: `assignment_exercises`

**Propósito:** Relación N:M entre assignments y exercises.

**Columnas clave:**
- `assignment_id` UUID FK → `assignments`
- `exercise_id` UUID FK → `educational_content.exercises`
- `order_index` INTEGER - Orden del ejercicio en la asignación
- `points` INTEGER - Puntos asignados para este ejercicio

**Constraint:** UNIQUE (assignment_id, exercise_id)

---

#### 1.12.3 Tabla: `assignment_classrooms`

**Propósito:** Asignaciones asignadas a aulas completas.

**Columnas clave:**
- `assignment_id` UUID FK → `assignments`
- `classroom_id` UUID FK → `social_features.classrooms`
- `assigned_at` TIMESTAMPTZ

**Constraint:** UNIQUE (assignment_id, classroom_id)

---

#### 1.12.4 Tabla: `assignment_students`

**Propósito:** Asignaciones asignadas a estudiantes individuales.

**Columnas clave:**
- `assignment_id` UUID FK → `assignments`
- `student_id` UUID FK → `auth.users`
- `assigned_at` TIMESTAMPTZ
- `status` TEXT - Estado de la asignación (pending, in_progress, submitted, graded)

**Constraint:** UNIQUE (assignment_id, student_id)

---

#### 1.12.5 Tabla: `assignment_submissions`

**Propósito:** Entregas de estudiantes para asignaciones.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `assignment_id` UUID FK → `assignments`
- `student_id` UUID FK → `auth.users`
- `submitted_at` TIMESTAMPTZ
- `answers` JSONB - Respuestas del estudiante
- `score` NUMERIC - Calificación obtenida
- `feedback` TEXT - Retroalimentación del profesor
- `graded_at` TIMESTAMPTZ
- `graded_by` UUID FK → `auth.users` (profesor)

---

#### 1.12.6 Tabla: `teacher_notes`

**Propósito:** Notas de profesores sobre estudiantes para seguimiento individualizado.

**Columnas clave:**
- `id` UUID PRIMARY KEY
- `teacher_id` UUID FK → `auth.users`
- `student_id` UUID FK → `auth.users`
- `tenant_id` UUID FK → `auth_management.tenants`
- `note_type` TEXT - Tipo de nota (observation, concern, achievement, behavioral)
- `content` TEXT - Contenido de la nota
- `is_shared_with_student` BOOLEAN DEFAULT false
- `is_shared_with_parents` BOOLEAN DEFAULT false
- `tags` TEXT[] - Etiquetas para categorización
- `created_at` / `updated_at` TIMESTAMPTZ

**Uso:** Permite a los profesores llevar registro de observaciones, preocupaciones, logros y comportamiento de estudiantes para personalizar la enseñanza.

---

**ENUMs en schema public:**
- `auth_provider` - Proveedores de autenticación (local, google, facebook, apple, microsoft, github)
- `notification_type` - Tipos de notificaciones del sistema
- `notification_priority` - Prioridades de notificaciones (low, medium, high, critical)
- `difficulty_level` - Niveles de dificultad (very_easy, easy, beginner, intermediate, medium, advanced, hard, very_hard)
- `content_status` - Estados de contenido (draft, published, archived, under_review)
- `media_type` - Tipos de media (image, video, audio, document, interactive)
- `processing_status` - Estados de procesamiento (pending, processing, completed, failed)
- `setting_type` - Tipos de configuración (string, number, boolean, json, array)

**Referencia:**
- DDL: `apps/database/ddl/schemas/public/tables/*.sql`
- ENUMs: `apps/database/ddl/schemas/public/enums/*.sql`

---

### 1.13 Schema: `storage` (Supabase Storage)

**Propósito:** Schema de almacenamiento de archivos de Supabase Storage para gestión de media y archivos.

**Tablas:** 0 (gestionado por Supabase)

**Estado:** ✅ Integración externa

**Nota:** Este schema es gestionado completamente por Supabase Storage. Incluye:
- Buckets para organizar archivos por tipo
- Políticas de acceso a archivos
- Metadata de archivos subidos
- URLs firmadas para acceso seguro

**Tipos de archivos soportados:**
- Imágenes de perfil (avatars)
- Thumbnails de módulos educativos
- Recursos multimedia de ejercicios
- Archivos de entregas de estudiantes
- Certificados y badges de gamificación

**Integración:**
- Backend: Supabase Storage SDK
- Frontend: Supabase Storage Client
- Límites: Definidos en `auth_management.tenants.max_storage_gb`

**Referencia:**
- Documentación Supabase Storage: https://supabase.com/docs/guides/storage
- Configuración: Variables de entorno SUPABASE_URL, SUPABASE_ANON_KEY

---

## 2. Diagrama de Relaciones (ERD ASCII)

```
┌─────────────────┐
│    TENANTS      │
│   (Multi-Org)   │
└────────┬────────┘
         │
         │ 1:N
         ▼
┌────────────────────────────────────────────────────────────┐
│                        PROFILES                            │
│                   (Core User Data)                         │
└─┬─────┬────┬────────┬────────────┬──────────┬────────┬────┘
  │     │    │        │            │          │        │
  │ 1:1 │1:N │ 1:N    │ 1:N        │ 1:N      │ 1:N    │ 1:N
  ▼     ▼    ▼        ▼            ▼          ▼        ▼
┌──────┐ ┌─────┐ ┌──────────┐ ┌─────────┐ ┌────────┐ ┌──────────┐
│USER  │ │USER │ │  MODULE  │ │EXERCISE │ │CLASSRM │ │  TEAMS   │
│STATS │ │RANKS│ │ PROGRESS │ │ATTEMPTS │ │MEMBERS │ │ MEMBERS  │
└──────┘ └─────┘ └─────┬────┘ └────┬────┘ └────────┘ └──────────┘
                       │           │
                    N:1│        N:1│
                       ▼           ▼
              ┌─────────┐    ┌──────────┐
              │ MODULES │    │EXERCISES │
              └────┬────┘    └──────────┘
                   │
                1:N│
                   ▼
              ┌──────────┐
              │EXERCISES │
              └──────────┘

┌─────────────────────────────────────────────────────────────┐
│                    GAMIFICATION SYSTEM                      │
├─────────────────────────────────────────────────────────────┤
│  user_stats (1:1)      user_ranks (1:N)                    │
│  achievements (N)      user_achievements (N:M)              │
│  ml_coins_transactions (1:N)                                │
│  comodines_inventory (1:1)                                  │
│  missions (1:N)                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    EDUCATIONAL CONTENT                      │
├─────────────────────────────────────────────────────────────┤
│  modules (N)           exercises (N)                        │
│  assessment_rubrics    media_resources                      │
│                                                             │
│  modules ──1:N──> exercises                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                    SOCIAL FEATURES                          │
├─────────────────────────────────────────────────────────────┤
│  schools ──1:N──> classrooms ──N:M──> profiles             │
│  teams ──N:M──> profiles (via team_members)                │
│  friendships (N:M profiles ↔ profiles)                     │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Relaciones Clave

### Relaciones Principales

| Desde | Hacia | Tipo | Descripción |
|-------|-------|------|-------------|
| tenants | profiles | 1:N | Tenant tiene múltiples usuarios |
| profiles | user_stats | 1:1 | Usuario tiene un registro de stats |
| profiles | user_ranks | 1:N | Historial de progresión de rangos |
| modules | exercises | 1:N | Módulo contiene múltiples ejercicios |
| profiles | exercise_attempts | 1:N | Usuario puede tener múltiples intentos |
| profiles | module_progress | N:M | Progreso de usuario en módulos |
| schools | classrooms | 1:N | Escuela tiene múltiples aulas |
| classrooms | profiles | N:M | Aula con múltiples estudiantes (via classroom_members) |
| teams | profiles | N:M | Equipo con múltiples miembros (via team_members) |
| achievements | profiles | N:M | Logros desbloqueados (via user_achievements) |

### Restricciones de Integridad

**Unique Constraints importantes:**
- `(user_id, module_id)` en `module_progress`
- `(user_id, achievement_id)` en `user_achievements`
- `(classroom_id, student_id)` en `classroom_members`
- `(user_id, tenant_id, role)` en `user_roles`
- `(user_id, tenant_id)` en `memberships`

**Check Constraints importantes:**
- `ml_coins >= 0` en `user_stats`
- `progress_percentage BETWEEN 0 AND 100`
- `rollout_percentage BETWEEN 0 AND 100` en `feature_flags`
- Email format validation con regex

---

## 4. Configuración de Zona Horaria

**Todas las tablas usan `TIMESTAMPTZ` con zona horaria de México:**
```sql
-- Función utilitaria
CREATE FUNCTION gamilit.now_mexico()
RETURNS TIMESTAMPTZ AS $$
BEGIN
    RETURN NOW() AT TIME ZONE 'America/Mexico_City';
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Uso en defaults
created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
```

---

## 5. Patrones de Diseño Implementados

### 5.1 Soft Delete Pattern
Implementado mediante campos `is_active` y `deleted_at` en lugar de DELETE físico.

### 5.2 Audit Trail Pattern
Tabla `audit_logs` captura todos los cambios con `old_values` y `new_values` en JSONB.

### 5.3 Multi-tenancy Pattern
Aislamiento de datos mediante `tenant_id` en todas las tablas principales.

### 5.4 Event Sourcing (Partial)
`ml_coins_transactions` funciona como ledger con balance_before/balance_after.

### 5.5 JSONB for Flexibility
Uso extensivo de JSONB para:
- Settings y configuraciones
- Metadata dinámica
- Contenido educativo estructurado
- Condiciones de achievements

---

## 6. Notas Importantes

### Convenciones de Nombrado
- Schemas: `snake_case`
- Tablas: `snake_case` en plural
- Columnas: `snake_case`
- ENUMs: `snake_case`
- Funciones: `snake_case()`

### Grados Escolares
La plataforma está diseñada para grados **6, 7 y 8** (primaria superior/secundaria).

### Materias
Enfoque principal en **Literatura** y **Ciencias** (especialmente física y biografías científicas).

### Contenido Temático
Los 5 módulos principales están centrados en la vida y obra de **Marie Curie**:
1. Biografía y contexto histórico
2. Descubrimientos científicos (radio, polonio)
3. Premios Nobel
4. Mujeres en la ciencia
5. Legado en física moderna

---

## 7. Archivos SQL de Referencia

### DDL Limpio (Clean DDL)
```
/home/isem/workspace/projects/glit/database/clean_ddl/
├── 00_prerequisites.sql           # Schemas y ENUMs
├── 01_auth_management_tables.sql  # Autenticación
├── 02_gamification_tables.sql     # Gamificación
├── 03_educational_content_tables.sql
├── 04_progress_tracking_tables.sql
├── 05_social_features_tables.sql
├── 06_content_management_tables.sql
├── 07_system_configuration_tables.sql
├── 08_audit_logging_tables.sql
├── 09_constraints_and_indexes.sql # Índices adicionales
├── 10_functions.sql               # Funciones de negocio
├── 11_triggers.sql                # Triggers
└── 12_rls_policies.sql            # Row Level Security
```

### Migraciones
```
/home/isem/workspace/projects/glit/database/migrations/
├── 001_auth_advanced_tables.sql
├── 002_admin_tables.sql
├── 003_add_exercise_types.sql
├── 004_missions_tables.sql
├── 005_teacher_tables.sql
├── 006_teacher_module_updates.sql
├── 007_notifications_table.sql
├── 008_admin_module_tables.sql
├── 009_create_leaderboards_views.sql
├── 010_update_notification_types.sql
├── 011_fix_enums_critical.sql
├── 012_validate_enums.sql
├── 013_hash_refresh_tokens_security_fix.sql
└── backfill-user-levels.sql
```

---

**Documento generado:** 2025-11-07
**Última actualización:** 2025-11-07 (Agregadas 11 tablas: user_preferences, user_sessions, user_suspensions, notifications, leaderboard_metadata, achievement_categories, active_boosts, inventory_transactions, maya_ranks, exercise_submissions, scheduled_missions)
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Estado:** ✅ 100% de schemas y tablas documentadas
