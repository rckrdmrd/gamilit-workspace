# Mapeo Cruzado: Documentación → Definiciones → Objetos DDL

**Generado:** 2025-11-07
**Versión:** 1.0
**Propósito:** Vincular EXPLÍCITAMENTE documentación funcional con implementación física DDL

---

## 🎯 Estructura del Mapeo

```
📄 DOCUMENTACIÓN               🎯 DEFINICIÓN FUNCIONAL        🗄️ OBJETO DDL FÍSICO
(docs/...)                    (¿Qué hace? ¿Para qué?)       (apps/database/ddl/...)
    │                                  │                              │
    │                                  │                              │
    └──────────────┬───────────────────┴──────────────────┬──────────┘
                   │                                       │
                   ▼                                       ▼
              [ESTE DOCUMENTO]                    [Backend/Frontend]
```

---

## 📚 SECCIÓN 1: AUTENTICACIÓN Y AUTORIZACIÓN

### 1.1 Sistema de Roles

#### Documentación
- **Ubicación:** `docs/03-desarrollo/autenticacion-y-autorizacion/ROLES.md`
- **Sección:** "2.1 Roles del Sistema GAMILIT"
- **Alcance:** Definir roles de usuario y sus permisos

#### Definición Funcional
**¿Qué es?** Sistema de roles basado en 3 niveles jerárquicos

**¿Para qué sirve?**
- Control de acceso a funcionalidades
- Row Level Security (RLS) en queries
- Routing condicional en frontend
- Permisos de API endpoints

**Roles definidos:**
1. **student** (Estudiante)
   - Acceso: Ejercicios, progreso propio, gamificación personal
   - Restricción: No puede ver datos de otros estudiantes

2. **admin_teacher** (Profesor/Administrador)
   - Acceso: Todo de student + ver progreso de sus estudiantes + crear contenido
   - Restricción: Solo estudiantes de sus aulas asignadas

3. **super_admin** (Super Administrador)
   - Acceso: Total al sistema
   - Restricción: Ninguna

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:30`
- **Definición:**
  ```sql
  CREATE TYPE auth_management.gamilit_role AS ENUM (
      'student',       -- Estudiante regular
      'admin_teacher', -- Profesor/Administrador
      'super_admin'    -- Super administrador del sistema
  );
  ```

**Usado en Tablas:**
1. `auth_management.profiles` (columna: `role`)
   - Archivo: `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:15`
   - Uso: Rol principal del usuario

2. `auth.users` (columna: `role`)
   - Archivo: `apps/database/ddl/schemas/auth/tables/01-users.sql:15`
   - Uso: Rol en tabla de autenticación

3. `auth_management.roles` (columna: `role_name`)
   - Archivo: `apps/database/ddl/schemas/auth_management/tables/04-roles.sql:17`
   - Uso: Definición de roles disponibles

4. `system_configuration.feature_flags` (columna: `allowed_roles`)
   - Archivo: `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql:20`
   - Uso: Array de roles permitidos por feature flag

**Usado en Functions:**
- `gamilit.get_current_user_role() RETURNS gamilit_role`
  - Archivo: `apps/database/ddl/schemas/gamilit/functions/02-get_current_user_role.sql`
  - Uso: Obtener rol del usuario actual en contexto

- `public.is_feature_enabled(flag_key, user_role)`
  - Archivo: `apps/database/ddl/schemas/public/functions/03-is_feature_enabled.sql`
  - Uso: Verificar si feature está habilitado para rol

**Usado en RLS Policies (7):**
1. `progress_tracking.module_progress_select_teacher`
2. `progress_tracking.learning_sessions_select_teacher`
3. `progress_tracking.exercise_attempts_select_teacher`
4. `progress_tracking.exercise_submissions_select_teacher`
5. `educational_content.modules_select_teacher`
6. `educational_content.exercises_select_teacher`
7. `gamification_system.user_stats_select_teacher`

#### Backend
- **Enum:** `apps/backend/src/shared/enums/gamilit-role.enum.ts`
- **Guards:** `apps/backend/src/shared/guards/roles.guard.ts`
- **Decorators:** `apps/backend/src/shared/decorators/roles.decorator.ts`

#### Frontend
- **Types:** `apps/frontend/src/types/auth.types.ts`
- **Componentes:** `RoleBasedRoute`, `UserRoleBadge`, `AdminPanel`

---

### 1.2 Estados de Usuario

#### Documentación
- **Ubicación:** `docs/03-desarrollo/autenticacion-y-autorizacion/ESTADOS-USUARIO.md`
- **Sección:** "2.2 Ciclo de vida de cuenta"
- **Alcance:** Gestionar estados del ciclo de vida de cuentas

#### Definición Funcional
**¿Qué es?** Estados de cuenta de usuario desde registro hasta eliminación

**¿Para qué sirve?**
- Control de acceso al sistema
- Auditoría de cuentas
- Gestión de suspensiones temporales/permanentes
- Proceso de verificación de email

**Estados definidos:**
1. **active** - Usuario activo, puede acceder
2. **inactive** - Inactivo temporalmente (usuario deshabilitó cuenta)
3. **suspended** - Suspendido por admin (reversible)
4. **banned** - Baneado permanentemente
5. **pending** - Registro pendiente de verificación de email

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:34`
- **Definición:**
  ```sql
  CREATE TYPE auth_management.user_status AS ENUM (
      'active', 'inactive', 'suspended', 'banned', 'pending'
  );
  ```

**Usado en Tablas:**
- `auth_management.profiles` (columna: `status`)
  - Archivo: `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:17`

**Usado en Functions:**
- `auth_management.check_user_status(user_id)`

#### Backend
- **Enum:** `apps/backend/src/modules/auth/enums/user-status.enum.ts`
- **Middleware:** Verificación de status en authentication middleware

#### Frontend
- **Badge:** UserStatusBadge component

---

### 1.3 Proveedores de Autenticación

#### Documentación
- **Ubicación:** `docs/03-desarrollo/autenticacion-y-autorizacion/OAUTH-PROVIDERS.md`
- **Sección:** "3. Proveedores Soportados"
- **Alcance:** Definir métodos de autenticación disponibles

#### Definición Funcional
**¿Qué es?** Proveedores de autenticación OAuth + local

**¿Para qué sirve?**
- Configurar métodos de login disponibles
- Tracking de origen de registro de usuarios
- Configuración de OAuth apps por proveedor

**Proveedores soportados:**
1. **local** - Email/password tradicional
2. **google** - Google OAuth 2.0
3. **facebook** - Facebook Login
4. **apple** - Apple Sign In
5. **microsoft** - Microsoft Account
6. **github** - GitHub OAuth

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:38`
- **Definición:**
  ```sql
  CREATE TYPE public.auth_provider AS ENUM (
      'local', 'google', 'facebook', 'apple', 'microsoft', 'github'
  );
  ```

**Usado en Tablas:**
- `auth_management.auth_providers` (columna: `provider_name`)
  - Archivo: `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`
  - Propósito: Configuración de cada proveedor OAuth

- `auth_management.profiles` (columna: `auth_provider`)
  - Tracking de cómo se registró el usuario

#### Backend
- **Enum:** `apps/backend/src/modules/auth/enums/auth-provider.enum.ts`
- **Strategies:** Google, Facebook, Apple, Microsoft, GitHub strategies
- **Config:** `apps/backend/src/config/oauth.config.ts`

#### Frontend
- **Componentes:** `LoginProviderButtons`, `ProviderIcon`, `OAuthCallback`

---

## 🎮 SECCIÓN 2: GAMIFICACIÓN

### 2.1 Tipos de Logros

#### Documentación
- **Ubicación:** `docs/03-desarrollo/gamificacion/SISTEMA-LOGROS.md`
- **Sección:** "3.1 Tipos de Achievements"
- **Alcance:** Clasificar logros por tipo

#### Definición Funcional
**¿Qué es?** Clasificación de logros según su naturaleza

**¿Para qué sirve?**
- Organizar sistema de achievements
- Definir mecánicas de desbloqueo
- UI diferenciada por tipo

**Tipos definidos:**
1. **badge** - Insignias coleccionables
2. **milestone** - Hitos de progreso
3. **special** - Logros especiales/eventos
4. **rank_promotion** - Promoción de rango Maya

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:51`
- **Definición:**
  ```sql
  CREATE TYPE gamification_system.achievement_type AS ENUM (
      'badge', 'milestone', 'special', 'rank_promotion'
  );
  ```

**Usado en Tablas:**
- `gamification_system.achievements` (columna: `type`)
  - Archivo: `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/gamification/enums/achievement-type.enum.ts`

#### Frontend
- **Componentes:** `AchievementCard`, `AchievementBadge`

---

### 2.2 Categorías de Logros

#### Documentación
- **Ubicación:** `docs/03-desarrollo/gamificacion/SISTEMA-LOGROS.md`
- **Sección:** "3.2 Categorías de Achievements"
- **Alcance:** Categorizar logros por área

#### Definición Funcional
**¿Qué es?** Categorías temáticas de logros

**¿Para qué sirve?**
- Filtrar logros en UI
- Balancear sistema de recompensas
- Tracking de áreas de logro del estudiante

**Categorías definidas:**
1. **progress** - Progreso general
2. **streak** - Rachas de días consecutivos
3. **completion** - Completitud de módulos/ejercicios
4. **social** - Interacción social (equipos, desafíos)
5. **special** - Eventos especiales
6. **mastery** - Dominio de contenido (100% + revisión)
7. **exploration** - Exploración de contenido nuevo

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:47`
- **Definición:**
  ```sql
  CREATE TYPE gamification_system.achievement_category AS ENUM (
      'progress', 'streak', 'completion', 'social',
      'special', 'mastery', 'exploration'
  );
  ```

**Usado en Tablas:**
- `gamification_system.achievements` (columna: `category`)
  - Archivo: `apps/database/ddl/schemas/gamification_system/tables/03-achievements.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/gamification/enums/achievement-category.enum.ts`

#### Frontend
- **Filtros:** Achievement filtering by category
- **UI:** Category icons and colors

---

### 2.3 Tipos de Comodines

#### Documentación
- **Ubicación:** `docs/03-desarrollo/gamificacion/SISTEMA-COMODINES.md`
- **Sección:** "4.1 Comodines Disponibles"
- **Alcance:** Definir power-ups disponibles para estudiantes

#### Definición Funcional
**¿Qué es?** Power-ups que estudiantes pueden comprar con ML Coins

**¿Para qué sirve?**
- Ayudar a estudiantes en ejercicios difíciles
- Monetizar ML Coins (economía interna)
- Balancear dificultad

**Comodines definidos:**
1. **pistas** - Hints/pistas para ejercicios (costo: 10 ML Coins)
2. **vision_lectora** - Ayuda de lectura comprensiva (costo: 15 ML Coins)
3. **segunda_oportunidad** - Reintento de ejercicio sin penalización (costo: 20 ML Coins)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:55`
- **Definición:**
  ```sql
  CREATE TYPE gamification_system.comodin_type AS ENUM (
      'pistas', 'vision_lectora', 'segunda_oportunidad'
  );
  ```

**Usado en Tablas:**
- `gamification_system.comodines_inventory` (columna: `comodin_type`)
  - Archivo: `apps/database/ddl/schemas/gamification_system/tables/07-comodines_inventory.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/gamification/enums/comodin-type.enum.ts`
- **Service:** Comodin purchase and usage logic

#### Frontend
- **Shop:** Comodines shop component
- **Usage:** In-exercise comodin usage UI

---

## 📚 SECCIÓN 3: CONTENIDO EDUCATIVO

### 3.1 Tipos de Ejercicios (31 Mecánicas)

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/MECANICAS-EJERCICIOS.md`
- **Sección:** "5. Las 31 Mecánicas de Ejercicios GAMILIT"
- **Alcance:** Definir todas las mecánicas interactivas de ejercicios

#### Definición Funcional
**¿Qué es?** 31 tipos de ejercicios interactivos organizados en 5 módulos + auxiliares

**¿Para qué sirve?**
- Diversificar experiencia de aprendizaje
- Cubrir diferentes niveles cognitivos (Bloom)
- Gamificar el aprendizaje

**Organización:**
- **Módulo 1: Lectura y comprensión** (5)
- **Módulo 2: Análisis de texto** (5)
- **Módulo 3: Vocabulario** (5)
- **Módulo 4: Gramática y redacción** (5)
- **Módulo 5: Pensamiento crítico** (5)
- **Auxiliares** (6)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:80-97`
- **Definición:** 31 valores documentados por módulo
- **Comentario:**
  ```sql
  COMMENT ON TYPE educational_content.exercise_type IS
    '31 mecánicas de ejercicios interactivos Gamilit (5 módulos + auxiliares)';
  ```

**Usado en Tablas:**
- `educational_content.exercises` (columna: `type`)
  - Archivo: `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/educational-content/enums/exercise-type.enum.ts`
- **Handlers:** 31 handlers específicos por tipo

#### Frontend
- **Componentes:** 31 componentes de ejercicio (uno por mecánica)
- **Rendering:** Dynamic exercise renderer based on type

---

### 3.2 Niveles de Dificultad

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/NIVELES-DIFICULTAD.md`
- **Sección:** "6.1 Escala de Dificultad"
- **Alcance:** Estandarizar niveles de dificultad de contenido

#### Definición Funcional
**¿Qué es?** Escala de 8 niveles de dificultad

**¿Para qué sirve?**
- Asignar dificultad a módulos/ejercicios
- Progresión adaptativa
- Filtrado de contenido

**Niveles definidos:**
1. **very_easy** - Muy fácil (introducción)
2. **easy** - Fácil
3. **beginner** - Principiante
4. **medium** - Medio
5. **intermediate** - Intermedio
6. **hard** - Difícil
7. **advanced** - Avanzado
8. **very_hard** - Muy difícil (desafío)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:99`
- **Definición:**
  ```sql
  CREATE TYPE public.difficulty_level AS ENUM (
      'very_easy', 'easy', 'beginner', 'medium',
      'intermediate', 'hard', 'advanced', 'very_hard'
  );
  ```

**Usado en Tablas:**
- `educational_content.modules` (columna: `difficulty_level`)
- `educational_content.exercises` (columna: `difficulty_level`)

#### Backend
- **Enum:** `apps/backend/src/modules/educational-content/enums/difficulty-level.enum.ts`

#### Frontend
- **UI:** Difficulty badges with colors
- **Filters:** Filter content by difficulty

---

### 3.3 Niveles Cognitivos (Taxonomía de Bloom)

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/TAXONOMIA-BLOOM.md`
- **Sección:** "6.2 Niveles Cognitivos Adaptados"
- **Alcance:** Aplicar taxonomía de Bloom adaptada al español

#### Definición Funcional
**¿Qué es?** 6 niveles cognitivos según Bloom (versión revisada)

**¿Para qué sirve?**
- Clasificar ejercicios por nivel cognitivo
- Progresión de habilidades de pensamiento
- Reportes de desarrollo cognitivo

**Niveles definidos:**
1. **recordar** - Recordar información (nivel 1)
2. **comprender** - Comprender conceptos (nivel 2)
3. **aplicar** - Aplicar conocimiento (nivel 3)
4. **analizar** - Analizar información (nivel 4)
5. **evaluar** - Evaluar críticamente (nivel 5)
6. **crear** - Crear nuevo contenido (nivel 6)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:111`
- **Definición:**
  ```sql
  CREATE TYPE public.cognitive_level AS ENUM (
      'recordar', 'comprender', 'aplicar',
      'analizar', 'evaluar', 'crear'
  );
  ```

**Usado en Tablas:**
- `educational_content.exercises` (columna: `cognitive_level`)

#### Backend
- **Enum:** `apps/backend/src/modules/educational-content/enums/cognitive-level.enum.ts`

#### Frontend
- **Analytics:** Cognitive development charts
- **Filters:** Filter by cognitive level

---

## 📊 SECCIÓN 4: PROGRESO Y SEGUIMIENTO

### 4.1 Estados de Progreso

#### Documentación
- **Ubicación:** `docs/03-desarrollo/progreso-tracking/ESTADOS-PROGRESO.md`
- **Sección:** "7.1 Estados de Avance"
- **Alcance:** Tracking de progreso de módulos/ejercicios

#### Definición Funcional
**¿Qué es?** Estados del ciclo de progreso de contenido

**¿Para qué sirve?**
- Tracking de avance del estudiante
- Reportes de completitud
- Desbloqueo progresivo de contenido

**Estados definidos:**
1. **not_started** - No iniciado
2. **in_progress** - En progreso (iniciado pero no terminado)
3. **completed** - Completado (mínimo 70%)
4. **mastered** - Dominado (100% + revisión aprobada)
5. **needs_review** - Necesita revisión (completado < 70%)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:124`
- **Definición:**
  ```sql
  CREATE TYPE progress_tracking.progress_status AS ENUM (
      'not_started', 'in_progress', 'completed',
      'mastered', 'needs_review'
  );
  ```

**Usado en Tablas:**
- `progress_tracking.module_progress` (columna: `status`)
  - Archivo: `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/progress/enums/progress-status.enum.ts`
- **Logic:** Auto-transition between states based on score

#### Frontend
- **UI:** Progress bars with status
- **Badges:** Status badges (in progress, completed, mastered)

---

### 4.2 Estados de Intentos

#### Documentación
- **Ubicación:** `docs/03-desarrollo/progreso-tracking/INTENTOS-EJERCICIOS.md`
- **Sección:** "7.2 Ciclo de Intento de Ejercicio"
- **Alcance:** Estados de un intento individual de ejercicio

#### Definición Funcional
**¿Qué es?** Estados del ciclo de un intento de ejercicio

**¿Para qué sirve?**
- Control de flujo de ejercicios
- Revisión por profesores
- Tracking de submissions

**Estados definidos:**
1. **in_progress** - Estudiante está trabajando en él
2. **submitted** - Enviado para revisión/calificación automática
3. **graded** - Calificado (automático o manual)
4. **reviewed** - Revisado por profesor (feedback adicional)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:128`
- **Definición:**
  ```sql
  CREATE TYPE public.attempt_status AS ENUM (
      'in_progress', 'submitted', 'graded', 'reviewed'
  );
  ```

**Usado en Tablas:**
- `progress_tracking.exercise_attempts` (columna: `status`)
  - Archivo: `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/progress/enums/attempt-status.enum.ts`
- **Workflow:** State machine for attempt lifecycle

#### Frontend
- **UI:** Attempt status indicators
- **Actions:** Conditional actions based on status

---

## 👥 SECCIÓN 5: CARACTERÍSTICAS SOCIALES

### 5.1 Roles en Aulas

#### Documentación
- **Ubicación:** `docs/03-desarrollo/social-features/AULAS-VIRTUALES.md`
- **Sección:** "8.1 Roles dentro de Aula"
- **Alcance:** Roles de usuarios dentro de aulas virtuales

#### Definición Funcional
**¿Qué es?** Roles específicos dentro de un aula

**¿Para qué sirve?**
- Permisos dentro del aula
- Gestión de aulas por profesores
- Asistentes pueden ayudar

**Roles definidos:**
1. **teacher** - Profesor del aula (creador, gestión total)
2. **student** - Estudiante del aula (acceso a contenido asignado)
3. **assistant** - Asistente/ayudante (puede ayudar pero no calificar)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:133`
- **Definición:**
  ```sql
  CREATE TYPE public.classroom_role AS ENUM (
      'teacher', 'student', 'assistant'
  );
  ```

**Usado en Tablas:**
- `social_features.classroom_members` (columna: `role`)
  - Archivo: `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/social/enums/classroom-role.enum.ts`

#### Frontend
- **UI:** Role badges in classroom
- **Permissions:** Conditional UI based on classroom role

---

### 5.2 Roles en Equipos

#### Documentación
- **Ubicación:** `docs/03-desarrollo/social-features/EQUIPOS-COMPETENCIAS.md`
- **Sección:** "8.2 Estructura de Equipos"
- **Alcance:** Roles dentro de equipos de competencia

#### Definición Funcional
**¿Qué es?** Roles dentro de un equipo

**¿Para qué sirve?**
- Organización de equipos
- Responsabilidades dentro del equipo
- Gamificación de colaboración

**Roles definidos:**
1. **leader** - Líder del equipo (puede invitar, asignar tareas)
2. **member** - Miembro regular (participa en desafíos)
3. **coordinator** - Coordinador (organiza sin ser líder formal)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:137`
- **Definición:**
  ```sql
  CREATE TYPE public.team_role AS ENUM (
      'leader', 'member', 'coordinator'
  );
  ```

**Usado en Tablas:**
- `social_features.team_members` (columna: `role`)
  - Archivo: `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/social/enums/team-role.enum.ts`

#### Frontend
- **UI:** Team member cards with role badges
- **Actions:** Leader-only actions (invite, remove members)

---

### 5.3 Estados de Amistad

#### Documentación
- **Ubicación:** `docs/03-desarrollo/social-features/AMISTADES.md`
- **Sección:** "8.3 Sistema de Amistades"
- **Alcance:** Gestión de solicitudes de amistad

#### Definición Funcional
**¿Qué es?** Estados de solicitud de amistad

**¿Para qué sirve?**
- Gestión de red social interna
- Privacidad (usuarios pueden bloquear)
- Notificaciones de solicitudes

**Estados definidos:**
1. **pending** - Solicitud enviada, esperando aceptación
2. **accepted** - Amistad aceptada (activa)
3. **blocked** - Usuario bloqueado (no puede enviar más solicitudes)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:141`
- **Definición:**
  ```sql
  CREATE TYPE public.friendship_status AS ENUM (
      'pending', 'accepted', 'blocked'
  );
  ```

**Usado en Tablas:**
- `social_features.friendships` (columna: `status`)
  - Archivo: `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/social/enums/friendship-status.enum.ts`
- **Logic:** State transitions (pending → accepted, pending → blocked)

#### Frontend
- **UI:** Friend request notifications
- **Actions:** Accept, reject, block buttons

---

## 🔔 SECCIÓN 6: NOTIFICACIONES

### 6.1 Tipos de Notificaciones

#### Documentación
- **Ubicación:** `docs/03-desarrollo/notificaciones/TIPOS-NOTIFICACIONES.md`
- **Sección:** "9.1 Categorización de Notificaciones"
- **Alcance:** Definir todos los tipos de notificaciones del sistema

#### Definición Funcional
**¿Qué es?** Tipos de notificaciones push que reciben usuarios

**¿Para qué sirve?**
- Engagement de usuarios
- Recordatorios importantes
- Notificaciones de logros/eventos sociales

**Tipos definidos:**
1. **achievement_unlocked** - Logro desbloqueado
2. **rank_up** - Subida de rango Maya
3. **ml_coins_earned** - ML Coins ganados
4. **assignment_due** - Tarea próxima a vencer
5. **message_received** - Mensaje recibido
6. **friend_request** - Solicitud de amistad
7. **team_invite** - Invitación a equipo
8. **challenge_started** - Desafío iniciado
9. **challenge_completed** - Desafío completado
10. **system_announcement** - Anuncio del sistema
11. **custom** - Notificación personalizada

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:59-73`
- **Definición:** 11 valores con comentarios

**Usado en Tablas:**
- `gamification_system.notifications` (columna: `type`)
  - Archivo: `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/notifications/enums/notification-type.enum.ts`
- **Service:** Notification service with handlers per type

#### Frontend
- **UI:** Notification bell with type-specific icons
- **Rendering:** Different UI per notification type

---

### 6.2 Prioridades de Notificaciones

#### Documentación
- **Ubicación:** `docs/03-desarrollo/notificaciones/PRIORIDADES.md`
- **Sección:** "9.2 Niveles de Prioridad"
- **Alcance:** Priorización de notificaciones

#### Definición Funcional
**¿Qué es?** Niveles de prioridad para notificaciones

**¿Para qué sirve?**
- Ordenar notificaciones en UI
- Alertas críticas destacadas
- Control de spam (low priority puede agruparse)

**Prioridades definidas:**
1. **low** - Baja (informativa, puede esperar)
2. **medium** - Media (normal)
3. **high** - Alta (importante, requiere atención pronto)
4. **critical** - Crítica (requiere atención inmediata)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:75`
- **Definición:**
  ```sql
  CREATE TYPE public.notification_priority AS ENUM (
      'low', 'medium', 'high', 'critical'
  );
  ```

**Usado en Tablas:**
- `gamification_system.notifications` (columna: `priority`)

#### Backend
- **Enum:** `apps/backend/src/modules/notifications/enums/notification-priority.enum.ts`
- **Logic:** Priority-based sorting and grouping

#### Frontend
- **UI:** Color coding by priority (critical = red, high = orange, etc.)
- **Sound:** Different notification sounds by priority

---

## 🗂️ SECCIÓN 7: CONTENIDO Y MEDIA

### 7.1 Estados de Contenido

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/ESTADOS-CONTENIDO.md`
- **Sección:** "10.1 Ciclo de Publicación"
- **Alcance:** Estados del ciclo de vida de contenido educativo

#### Definición Funcional
**¿Qué es?** Estados de publicación de módulos/ejercicios

**¿Para qué sirve?**
- Control de calidad antes de publicar
- Workflow de aprobación de contenido
- Archivado de contenido obsoleto

**Estados definidos:**
1. **draft** - Borrador (en creación, no visible para estudiantes)
2. **published** - Publicado (visible para estudiantes)
3. **archived** - Archivado (no visible, pero conservado)
4. **under_review** - En revisión (pendiente de aprobación)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:107`
- **Definición:**
  ```sql
  CREATE TYPE public.content_status AS ENUM (
      'draft', 'published', 'archived', 'under_review'
  );
  ```

**Usado en Tablas:**
- `educational_content.modules` (columna: `status`)
- `educational_content.exercises` (columna: `status`)
- `content_management.marie_curie_content` (columna: `status`)

#### Backend
- **Enum:** `apps/backend/src/modules/content/enums/content-status.enum.ts`
- **Middleware:** Filter content by status (students only see published)

#### Frontend
- **UI:** Status badges on content cards
- **Admin:** Content moderation interface

---

### 7.2 Tipos de Media

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/TIPOS-MEDIA.md`
- **Sección:** "10.2 Archivos Multimedia Soportados"
- **Alcance:** Tipos de archivos multimedia en la plataforma

#### Definición Funcional
**¿Qué es?** Clasificación de archivos multimedia

**¿Para qué sirve?**
- Validación de uploads
- Procesamiento específico por tipo
- UI diferenciada (players, viewers)

**Tipos definidos:**
1. **image** - Imágenes (jpg, png, webp)
2. **video** - Videos (mp4, webm)
3. **audio** - Audio (mp3, wav)
4. **document** - Documentos (pdf, docx)
5. **interactive** - Contenido interactivo (H5P, SCORM)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:115`
- **Definición:**
  ```sql
  CREATE TYPE public.media_type AS ENUM (
      'image', 'video', 'audio', 'document', 'interactive'
  );
  ```

**Usado en Tablas:**
- `content_management.media_files` (columna: `media_type`)
- `educational_content.media_resources` (columna: `type`)

#### Backend
- **Enum:** `apps/backend/src/modules/content/enums/media-type.enum.ts`
- **Processors:** Type-specific media processors (video transcoding, image optimization)

#### Frontend
- **Players:** VideoPlayer, AudioPlayer, PDFViewer, H5PPlayer
- **Icons:** Type-specific file icons

---

### 7.3 Estados de Procesamiento

#### Documentación
- **Ubicación:** `docs/03-desarrollo/contenido-educativo/PROCESAMIENTO-MEDIA.md`
- **Sección:** "10.3 Pipeline de Procesamiento"
- **Alcance:** Estados de procesamiento de archivos multimedia

#### Definición Funcional
**¿Qué es?** Estados del pipeline de procesamiento de media

**¿Para qué sirve?**
- Tracking de procesamiento asíncrono
- Feedback a usuarios sobre upload
- Manejo de errores de procesamiento

**Estados definidos:**
1. **pending** - Upload completado, esperando procesamiento
2. **processing** - En procesamiento (transcoding, optimización, etc.)
3. **completed** - Procesamiento exitoso, listo para usar
4. **failed** - Procesamiento falló (error)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:119`
- **Definición:**
  ```sql
  CREATE TYPE public.processing_status AS ENUM (
      'pending', 'processing', 'completed', 'failed'
  );
  ```

**Usado en Tablas:**
- `content_management.media_files` (columna: `processing_status`)

#### Backend
- **Enum:** `apps/backend/src/modules/content/enums/processing-status.enum.ts`
- **Workers:** Background workers that process media and update status

#### Frontend
- **UI:** Processing progress indicators
- **Notifications:** Notify when processing completes/fails

---

## 🛡️ SECCIÓN 8: AUDITORÍA Y SISTEMA

### 8.1 Acciones de Auditoría

#### Documentación
- **Ubicación:** `docs/03-desarrollo/auditoria/ACCIONES-AUDITABLES.md`
- **Sección:** "11.1 Acciones a Auditar"
- **Alcance:** Acciones del sistema que se registran en audit log

#### Definición Funcional
**¿Qué es?** Tipos de acciones registradas en audit log

**¿Para qué sirve?**
- Compliance (cumplimiento legal)
- Debugging de problemas
- Seguridad (detectar actividad sospechosa)

**Acciones definidas:**
1. **create** - Creación de registro
2. **read** - Lectura de registro (solo queries sensibles)
3. **update** - Actualización de registro
4. **delete** - Eliminación de registro
5. **login** - Inicio de sesión
6. **logout** - Cierre de sesión

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:145`
- **Definición:**
  ```sql
  CREATE TYPE public.audit_action AS ENUM (
      'create', 'read', 'update', 'delete', 'login', 'logout'
  );
  ```

**Usado en Tablas:**
- `audit_logging.audit_logs` (columna: `action`)
  - Archivo: `apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/audit/enums/audit-action.enum.ts`
- **Interceptors:** Audit interceptor that logs all CRUD operations

#### Frontend
- **Admin:** Audit log viewer

---

### 8.2 Niveles de Log

#### Documentación
- **Ubicación:** `docs/03-desarrollo/auditoria/NIVELES-LOG.md`
- **Sección:** "11.2 Niveles de Severidad de Logs"
- **Alcance:** Niveles de logging del sistema

#### Definición Funcional
**¿Qué es?** Niveles de severidad de logs de aplicación

**¿Para qué sirve?**
- Debugging (development)
- Monitoring (production)
- Alertas automáticas (errors/critical)

**Niveles definidos:**
1. **debug** - Debug (solo development)
2. **info** - Información general
3. **warning** - Advertencias (posible problema)
4. **error** - Errores (requiere atención)
5. **critical** - Crítico (sistema en riesgo)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:150`
- **Definición:**
  ```sql
  CREATE TYPE public.log_level AS ENUM (
      'debug', 'info', 'warning', 'error', 'critical'
  );
  ```

**Usado en Tablas:**
- `audit_logging.system_logs` (columna: `level`)
  - Archivo: `apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql`

#### Backend
- **Enum:** `apps/backend/src/shared/enums/log-level.enum.ts`
- **Logger:** Winston/Pino logger with level filtering

#### Frontend
- **Admin:** Log viewer with level filtering

---

### 8.3 Severidad de Alertas

#### Documentación
- **Ubicación:** `docs/03-desarrollo/auditoria/ALERTAS-SISTEMA.md`
- **Sección:** "11.3 Sistema de Alertas"
- **Alcance:** Alertas del sistema (performance, security, errors)

#### Definición Funcional
**¿Qué es?** Niveles de severidad de alertas del sistema

**¿Para qué sirve?**
- Monitoring proactivo
- Notificaciones a admins según severidad
- Priorización de resolución

**Severidades definidas:**
1. **info** - Informativa (FYI)
2. **warning** - Advertencia (revisar cuando sea posible)
3. **error** - Error (requiere atención pronto)
4. **critical** - Crítica (requiere atención inmediata)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:159`
- **Definición:**
  ```sql
  CREATE TYPE public.alert_severity AS ENUM (
      'info', 'warning', 'error', 'critical'
  );
  ```

**Usado en Tablas:**
- `audit_logging.system_alerts` (columna: `severity`)
  - Archivo: `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/monitoring/enums/alert-severity.enum.ts`
- **Service:** Alert service that sends notifications based on severity

#### Frontend
- **Admin:** Alert dashboard with color coding

---

### 8.4 Estados de Alertas

#### Documentación
- **Ubicación:** `docs/03-desarrollo/auditoria/ALERTAS-SISTEMA.md`
- **Sección:** "11.4 Ciclo de Vida de Alerta"
- **Alcance:** Estados del ciclo de vida de una alerta

#### Definición Funcional
**¿Qué es?** Estados de una alerta del sistema

**¿Para qué sirve?**
- Tracking de resolución de alertas
- Evitar duplicados de alertas activas
- Historial de alertas

**Estados definidos:**
1. **active** - Alerta activa (problema en curso)
2. **acknowledged** - Reconocida (admin vio, trabajando en ello)
3. **resolved** - Resuelta (problema solucionado)
4. **ignored** - Ignorada (falso positivo o no requiere acción)

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:163`
- **Definición:**
  ```sql
  CREATE TYPE public.alert_status AS ENUM (
      'active', 'acknowledged', 'resolved', 'ignored'
  );
  ```

**Usado en Tablas:**
- `audit_logging.system_alerts` (columna: `status`)

#### Backend
- **Enum:** `apps/backend/src/modules/monitoring/enums/alert-status.enum.ts`
- **Workflow:** State transitions (active → acknowledged → resolved)

#### Frontend
- **Admin:** Alert management interface with status updates

---

### 8.5 Tipos de Configuración

#### Documentación
- **Ubicación:** `docs/03-desarrollo/configuracion/TIPOS-SETTINGS.md`
- **Sección:** "12.1 Sistema de Configuración"
- **Alcance:** Tipos de datos de configuraciones del sistema

#### Definición Funcional
**¿Qué es?** Tipos de datos de valores de configuración

**¿Para qué sirve?**
- Validación de configuraciones
- UI diferenciada por tipo (toggle para boolean, input para string, etc.)
- Type safety

**Tipos definidos:**
1. **string** - Texto
2. **number** - Número (int o float)
3. **boolean** - Booleano (true/false)
4. **json** - JSON object complejo
5. **array** - Array de valores

#### Objetos DDL Físicos

**ENUM:**
- **Ubicación:** `apps/database/ddl/00-prerequisites.sql:146`
- **Definición:**
  ```sql
  CREATE TYPE public.setting_type AS ENUM (
      'string', 'number', 'boolean', 'json', 'array'
  );
  ```

**Usado en Tablas:**
- `system_configuration.system_settings` (columna: `setting_type`)
  - Archivo: `apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql`

#### Backend
- **Enum:** `apps/backend/src/modules/config/enums/setting-type.enum.ts`
- **Validators:** Type-specific validators

#### Frontend
- **Admin:** Configuration editor with type-appropriate inputs

---

## 📊 RESUMEN DE MAPEO

### Estadísticas de Cobertura

| Categoría | ENUMs Documentados | Tablas Vinculadas | Functions Vinculadas |
|-----------|-------------------|-------------------|---------------------|
| Autenticación | 3 | 5 | 2 |
| Gamificación | 3 | 7 | 5+ |
| Contenido Educativo | 3 | 4 | 3+ |
| Progreso | 2 | 4 | 4+ |
| Social | 3 | 5 | 2+ |
| Notificaciones | 2 | 1 | 1 |
| Media | 3 | 2 | 2+ |
| Auditoría | 5 | 4 | 1+ |
| **TOTAL** | **24** | **32+** | **20+** |

### Ubicaciones Consolidadas

**Documentación:** `docs/03-desarrollo/`
- autenticacion-y-autorizacion/
- gamificacion/
- contenido-educativo/
- progreso-tracking/
- social-features/
- notificaciones/
- auditoria/
- configuracion/

**Objetos DDL:** `apps/database/ddl/`
- 00-prerequisites.sql ← **25 ENUMs canónicos**
- schemas/[schema]/tables/
- schemas/[schema]/functions/
- schemas/[schema]/rls-policies/

**Backend:** `apps/backend/src/`
- shared/enums/ ← ENUMs TypeScript
- modules/[modulo]/entities/ ← TypeORM entities
- modules/[modulo]/enums/ ← ENUMs específicos de módulo

**Frontend:** `apps/frontend/src/`
- types/ ← TypeScript types
- components/ ← UI components

---

## 🔗 Cómo Usar Este Mapeo

### Para Agentes de Desarrollo

**Antes de crear un nuevo ENUM:**
1. Buscar en este documento si ya está documentado
2. Si está: usar definición existente en `00-prerequisites.sql`
3. Si no está: documentar primero en docs/, luego implementar

**Antes de modificar un ENUM:**
1. Buscar en este documento todas sus dependencias
2. Planificar cambios en cascada (DDL → Backend → Frontend)
3. Actualizar documentación

### Para Product Owners

**Para validar que feature está implementada:**
1. Buscar feature en docs/
2. Verificar que tiene sección en este documento
3. Verificar que objetos DDL existen
4. Verificar que Backend/Frontend están implementados

### Para QA

**Para testear una funcionalidad:**
1. Buscar en este documento el mapeo completo
2. Verificar cada capa: Docs → DDL → Backend → Frontend
3. Tests end-to-end cubriendo toda la cadena

---

## 📚 Referencias

- **Database Inventory Master:** `orchestration/05-validaciones/consolidacion/DATABASE-INVENTORY-MASTER-FINAL-2025-11-07.md`
- **Documentación de Referencia ENUMs:** `orchestration/05-validaciones/consolidacion/DOCUMENTACION-REFERENCIA-ENUMS.md`
- **Guía de Mapeo DDL:** `orchestration/05-validaciones/consolidacion/GUIA-MAPEO-DOCUMENTACION-DDL.md`

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Mantenedor:** SQL Agent / Database Team
**Próxima revisión:** Al agregar nuevos ENUMs o tablas
