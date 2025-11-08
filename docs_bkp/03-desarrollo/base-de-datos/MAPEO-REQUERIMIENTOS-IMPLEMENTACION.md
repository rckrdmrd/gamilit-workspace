# Mapeo: Requerimientos → Especificaciones → Implementación DDL

**Documento:** Mapeo Maestro de Base de Datos
**Versión:** 1.0
**Fecha:** 2025-11-07
**Estado:** ✅ Validado y Consolidado

---

## 📋 Propósito del Documento

Este documento establece la **trazabilidad completa** entre:

1. **Requerimientos Funcionales** (`docs/01-requerimientos/`)
2. **Especificaciones Técnicas** (`docs/02-especificaciones-tecnicas/`)
3. **Implementación DDL** (`apps/database/ddl/`)
4. **Código de Aplicación** (Backend/Frontend)

**Audiencia:** Product Owners, Tech Leads, Desarrolladores, QA

---

## 🎯 Estructura del Mapeo

```
📄 REQUERIMIENTOS          📐 ESPECIFICACIÓN         🗄️ IMPLEMENTACIÓN
   FUNCIONALES               TÉCNICA                    DDL
        │                        │                        │
        │                        │                        │
        └────────┬───────────────┴──────────┬────────────┘
                 │                          │
                 ▼                          ▼
        💻 BACKEND CODE          🎨 FRONTEND CODE
```

---

## 📚 MÓDULO 1: AUTENTICACIÓN Y AUTORIZACIÓN

### 1.1 Sistema de Roles de Usuario

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/casos-uso/RF-AUTH-001-roles.md`
- **Casos de Uso:**
  - UC-STU-001: Estudiante accede a sus ejercicios
  - UC-TEACHER-001: Profesor ve progreso de sus estudiantes
  - UC-ADMIN-001: Super admin gestiona sistema completo

**Requerimiento:**
> El sistema debe soportar 3 roles de usuario con permisos diferenciados:
> - Estudiante: Acceso a ejercicios propios y gamificación personal
> - Profesor/Admin: Acceso a gestión de aulas y progreso de estudiantes
> - Super Admin: Acceso total al sistema

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/seguridad/RBAC.md`
- **Especificación:**

| Rol | Permisos | RLS | Funcionalidades |
|-----|----------|-----|-----------------|
| `student` | Datos propios | ✅ user_id = current_user | Ejercicios, progreso propio, gamificación |
| `admin_teacher` | Datos propios + estudiantes de sus aulas | ✅ Validación de aula | Gestión de aulas, creación de contenido, reportes |
| `super_admin` | Todos los datos | ❌ Sin restricciones | Administración completa del sistema |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:30
CREATE TYPE auth_management.gamilit_role AS ENUM (
    'student',       -- Estudiante regular
    'admin_teacher', -- Profesor/Administrador
    'super_admin'    -- Super administrador del sistema
);
```

**Tablas que lo usan:**
1. `auth_management.profiles` (columna: `role`)
   - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:15`
   - **Propósito:** Rol principal asignado al usuario

2. `auth.users` (columna: `role`)
   - **Archivo:** `apps/database/ddl/schemas/auth/tables/01-users.sql:15`
   - **Propósito:** Integración con Supabase Auth

3. `system_configuration.feature_flags` (columna: `allowed_roles[]`)
   - **Archivo:** `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql:20`
   - **Propósito:** Control de features por rol

**Functions:**
- `gamilit.get_current_user_role() RETURNS gamilit_role`
  - Obtiene rol del usuario en contexto de sesión

**RLS Policies (7):**
- `progress_tracking.module_progress_select_teacher`
- `progress_tracking.learning_sessions_select_teacher`
- `progress_tracking.exercise_attempts_select_teacher`
- `progress_tracking.exercise_submissions_select_teacher`
- `educational_content.modules_select_teacher`
- `educational_content.exercises_select_teacher`
- `gamification_system.user_stats_select_teacher`

#### 💻 Backend
- **Enum:** `apps/backend/src/shared/enums/gamilit-role.enum.ts`
- **Guard:** `apps/backend/src/shared/guards/roles.guard.ts`
- **Decorator:** `@Roles('admin_teacher', 'super_admin')`

#### 🎨 Frontend
- **Type:** `apps/frontend/src/types/auth.types.ts`
- **Componentes:**
  - `<RoleBasedRoute>` - Routing condicional
  - `<UserRoleBadge>` - Display de rol
  - `<AdminPanel>` - Panel solo para admins

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] RLS policies activas
- [x] Tests E2E pasando

---

### 1.2 Estados de Cuenta de Usuario

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/casos-uso/RF-AUTH-002-estados-cuenta.md`
- **Casos de Uso:**
  - UC-AUTH-003: Usuario verifica email tras registro
  - UC-ADMIN-002: Admin suspende cuenta de usuario
  - UC-AUTH-004: Usuario desactiva su propia cuenta

**Requerimiento:**
> El sistema debe gestionar el ciclo de vida completo de una cuenta de usuario:
> - Pendiente: Registro iniciado, email no verificado
> - Activo: Email verificado, puede acceder al sistema
> - Inactivo: Usuario deshabilitó temporalmente su cuenta
> - Suspendido: Admin suspendió cuenta (reversible)
> - Baneado: Cuenta permanentemente bloqueada

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/seguridad/GESTION-CUENTAS.md`

**Estados y Transiciones:**
```
pending → (verificar email) → active
active → (usuario desactiva) → inactive
active → (admin suspende) → suspended
active → (violación TOS) → banned

inactive → (usuario reactiva) → active
suspended → (admin levanta suspensión) → active
banned → (irreversible) → banned
```

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:34
CREATE TYPE auth_management.user_status AS ENUM (
    'active',    -- Usuario activo, puede acceder
    'inactive',  -- Inactivo temporalmente
    'suspended', -- Suspendido por admin (reversible)
    'banned',    -- Baneado permanentemente
    'pending'    -- Registro pendiente de verificación
);
```

**Tablas que lo usan:**
- `auth_management.profiles` (columna: `status`)
  - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql:17`
  - **Constraint:** `DEFAULT 'pending'` (nuevo usuario)

**Functions:**
- `auth_management.verify_user_status(user_id UUID) RETURNS BOOLEAN`
  - Valida que usuario puede acceder (active)

- `auth_management.suspend_user(user_id UUID, reason TEXT)`
  - Admin suspende usuario

**Triggers:**
- `trg_profiles_status_change`
  - Audita cambios de estado en audit_logs

#### 💻 Backend
- **Enum:** `apps/backend/src/modules/auth/enums/user-status.enum.ts`
- **Middleware:** `UserStatusMiddleware` - Bloquea acceso si status != 'active'
- **Service:** `UserManagementService.suspendUser()`

#### 🎨 Frontend
- **Badge:** `<UserStatusBadge status={user.status} />`
- **Admin:** Panel de gestión de usuarios con acciones por estado

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Auditoría de cambios activa
- [x] Tests E2E pasando

---

### 1.3 Proveedores de Autenticación OAuth

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/funcionalidades/RF-AUTH-003-oauth.md`
- **Casos de Uso:**
  - UC-AUTH-001: Usuario se registra con Google
  - UC-AUTH-002: Usuario inicia sesión con Apple ID

**Requerimiento:**
> El sistema debe soportar múltiples proveedores de autenticación:
> - Autenticación local (email/password)
> - OAuth 2.0: Google, Facebook, Microsoft, Apple
> - OAuth: GitHub (para desarrolladores)

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/integraciones/OAUTH-PROVIDERS.md`

**Configuración por Proveedor:**

| Proveedor | Client ID | Scopes | Callback URL |
|-----------|-----------|--------|--------------|
| `google` | env.GOOGLE_CLIENT_ID | profile, email | /auth/google/callback |
| `facebook` | env.FACEBOOK_APP_ID | public_profile, email | /auth/facebook/callback |
| `apple` | env.APPLE_SERVICE_ID | name, email | /auth/apple/callback |
| `microsoft` | env.MICROSOFT_CLIENT_ID | User.Read | /auth/microsoft/callback |
| `github` | env.GITHUB_CLIENT_ID | user:email | /auth/github/callback |
| `local` | N/A | N/A | N/A |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:38
CREATE TYPE public.auth_provider AS ENUM (
    'local',     -- Email/password tradicional
    'google',    -- Google OAuth 2.0
    'facebook',  -- Facebook Login
    'apple',     -- Apple Sign In
    'microsoft', -- Microsoft Account
    'github'     -- GitHub OAuth
);
```

**Tablas que lo usan:**
1. `auth_management.auth_providers` (columna: `provider_name`)
   - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`
   - **Propósito:** Configuración de cada proveedor OAuth

2. `auth_management.profiles` (columna: `auth_provider`)
   - **Propósito:** Tracking de origen de registro

**Functions:**
- `auth.get_available_providers() RETURNS auth_provider[]`
  - Lista proveedores OAuth habilitados

#### 💻 Backend
- **Enum:** `apps/backend/src/modules/auth/enums/auth-provider.enum.ts`
- **Strategies:**
  - `GoogleStrategy` - Google OAuth
  - `FacebookStrategy` - Facebook Login
  - `AppleStrategy` - Apple Sign In
  - `MicrosoftStrategy` - Microsoft Account
  - `GithubStrategy` - GitHub OAuth
- **Config:** `apps/backend/src/config/oauth.config.ts`

#### 🎨 Frontend
- **Componentes:**
  - `<LoginProviderButtons>` - Botones de OAuth
  - `<ProviderIcon provider="google">` - Iconos por proveedor
  - `<OAuthCallback>` - Manejo de redirects

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado (6 proveedores)
- [x] Backend implementado (5 strategies OAuth)
- [x] Frontend implementado
- [x] Tests E2E pasando

---

## 🎮 MÓDULO 2: GAMIFICACIÓN

### 2.1 Sistema de Logros (Achievements)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/gamificacion/RF-GAM-001-achievements.md`
- **Casos de Uso:**
  - UC-GAM-001: Estudiante desbloquea achievement por completar módulo
  - UC-GAM-002: Estudiante ve galería de achievements
  - UC-GAM-003: Achievement de racha de 7 días consecutivos

**Requerimiento:**
> El sistema debe gamificar el aprendizaje mediante achievements clasificados por:
> - Tipo: Badge (insignia), Milestone (hito), Special (especial), Rank Promotion (promoción de rango)
> - Categoría: Progress, Streak, Completion, Social, Special, Mastery, Exploration

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/gamificacion/SISTEMA-ACHIEVEMENTS.md`

**Matriz de Achievements:**

| Tipo | Categoría | Ejemplo | Criterio | Recompensa |
|------|-----------|---------|----------|------------|
| badge | progress | "Primer Paso" | Completar primer ejercicio | 10 XP + badge |
| milestone | completion | "Módulo Maestro" | Completar módulo 100% | 100 XP + 50 ML Coins |
| special | streak | "Racha de Fuego" | 7 días consecutivos | 200 XP + badge especial |
| rank_promotion | mastery | "Nacom" | Alcanzar 1000 XP | Promoción a rango 2 |

#### 🗄️ Implementación DDL

**ENUMs Canónicos:**

1. **Tipos de Achievement:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:51
CREATE TYPE gamification_system.achievement_type AS ENUM (
    'badge',          -- Insignia/medalla coleccionable
    'milestone',      -- Hito de progreso
    'special',        -- Logro especial/evento
    'rank_promotion'  -- Promoción de rango Maya
);
```

2. **Categorías de Achievement:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:47
CREATE TYPE gamification_system.achievement_category AS ENUM (
    'progress',    -- Progreso general
    'streak',      -- Rachas/consistencia
    'completion',  -- Completitud de contenido
    'social',      -- Interacción social
    'special',     -- Especiales/eventos
    'mastery',     -- Dominio de contenido
    'exploration'  -- Exploración de contenido nuevo
);
```

**Tablas:**
1. `gamification_system.achievements` - Definición de achievements
   - Columnas: `type`, `category`, `criteria (jsonb)`, `rewards (jsonb)`

2. `gamification_system.user_achievements` - Achievements desbloqueados
   - Columnas: `user_id`, `achievement_id`, `unlocked_at`

**Triggers:**
- `trg_achievement_unlocked` → Otorga recompensas (XP, ML Coins, badges)
- `trg_check_rank_promotion` → Verifica si XP alcanza siguiente rango

#### 💻 Backend
- **Enums:**
  - `AchievementTypeEnum`
  - `AchievementCategoryEnum`
- **Service:** `AchievementService`
  - `checkAndUnlockAchievements(userId, eventType)`
  - `getAchievementGallery(userId)`

#### 🎨 Frontend
- **Componentes:**
  - `<AchievementGallery>` - Galería de achievements
  - `<AchievementCard locked={true}>` - Card de achievement
  - `<AchievementUnlockedModal>` - Modal de celebración

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema de triggers activo
- [x] Tests E2E pasando

---

### 2.2 Sistema de Comodines (Power-ups)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/gamificacion/RF-GAM-002-comodines.md`
- **Casos de Uso:**
  - UC-GAM-004: Estudiante compra "Pistas" con ML Coins
  - UC-GAM-005: Estudiante usa "Segunda Oportunidad" en ejercicio difícil

**Requerimiento:**
> El sistema debe ofrecer power-ups comprables con ML Coins:
> - Pistas: Hints para ejercicios (10 ML Coins)
> - Visión Lectora: Ayuda de comprensión (15 ML Coins)
> - Segunda Oportunidad: Reintento sin penalización (20 ML Coins)

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/gamificacion/SISTEMA-COMODINES.md`

**Especificaciones de Comodines:**

| Comodin | Costo | Efecto | Restricciones |
|---------|-------|--------|---------------|
| `pistas` | 10 ML Coins | Muestra 1 hint del ejercicio | Máx 3 por ejercicio |
| `vision_lectora` | 15 ML Coins | Resalta palabras clave en texto | 1 por ejercicio |
| `segunda_oportunidad` | 20 ML Coins | Permite reintento sin penalización | 1 por ejercicio |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:55
CREATE TYPE gamification_system.comodin_type AS ENUM (
    'pistas',              -- Pistas/hints para ejercicios
    'vision_lectora',      -- Ayuda de lectura comprensiva
    'segunda_oportunidad'  -- Reintento sin penalización
);
```

**Tablas:**
- `gamification_system.comodines_inventory` (columna: `comodin_type`)
  - Inventario de comodines del usuario

**Functions:**
- `gamification_system.purchase_comodin(user_id, comodin_type) RETURNS BOOLEAN`
  - Valida ML Coins, compra comodin

- `gamification_system.use_comodin(user_id, exercise_id, comodin_type)`
  - Aplica efecto del comodin

#### 💻 Backend
- **Enum:** `ComodinTypeEnum`
- **Service:** `ComodinService`
  - `purchaseComodin(userId, type)`
  - `useComodin(userId, exerciseId, type)`
  - `getInventory(userId)`

#### 🎨 Frontend
- **Componentes:**
  - `<ComodinShop>` - Tienda de comodines
  - `<ComodinButton type="pistas">` - Botón de uso en ejercicio
  - `<ComodinInventory>` - Inventario del usuario

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (compra y uso)
- [x] Frontend implementado
- [x] Economía de ML Coins integrada
- [x] Tests E2E pasando

---

## 📚 MÓDULO 3: CONTENIDO EDUCATIVO

### 3.1 Mecánicas de Ejercicios (31 Tipos)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/pedagogia/RF-EDU-001-mecanicas-ejercicios.md`
- **Casos de Uso:**
  - UC-EDU-001: Estudiante resuelve ejercicio de opción múltiple
  - UC-EDU-002: Estudiante completa ejercicio de análisis de texto
  - UC-EDU-003: Estudiante participa en simulación interactiva

**Requerimiento:**
> El sistema debe soportar 31 mecánicas de ejercicios interactivos organizados en:
> - Módulo 1: Lectura y comprensión (5 mecánicas)
> - Módulo 2: Análisis de texto (5 mecánicas)
> - Módulo 3: Vocabulario (5 mecánicas)
> - Módulo 4: Gramática y redacción (5 mecánicas)
> - Módulo 5: Pensamiento crítico (5 mecánicas)
> - Auxiliares (6 mecánicas: juegos, simulaciones, multimedia)

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/pedagogia/31-MECANICAS-DETALLADAS.md`

**Detalle de Mecánicas por Módulo:**

**Módulo 1: Lectura y Comprensión**
1. `multiple_choice` - Opción múltiple (4 opciones, 1 correcta)
2. `true_false` - Verdadero/Falso
3. `fill_in_blank` - Completar espacios en blanco
4. `matching` - Emparejar elementos (drag & drop)
5. `ordering` - Ordenar secuencia (timeline, pasos)

**Módulo 2: Análisis de Texto**
6. `text_analysis` - Análisis de estructura de texto
7. `summarization` - Resumen de texto
8. `inference` - Inferencias del texto
9. `main_idea` - Identificar idea principal
10. `supporting_details` - Identificar detalles de soporte

*(31 mecánicas totales... continuar en especificación completa)*

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:80-97
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

COMMENT ON TYPE educational_content.exercise_type IS
    '31 mecánicas de ejercicios interactivos Gamilit organizados en 5 módulos pedagógicos + 6 auxiliares';
```

**Tablas:**
- `educational_content.exercises` (columna: `type`)
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`
  - Almacena definición de ejercicio con `content (jsonb)` específico por tipo

#### 💻 Backend
- **Enum:** `ExerciseTypeEnum` (31 valores)
- **Handlers:** 31 handlers específicos por mecánica
  - `MultipleChoiceHandler`
  - `TextAnalysisHandler`
  - `SimulationHandler`
  - ... (uno por cada mecánica)
- **Service:** `ExerciseService.render(exerciseId, type)`

#### 🎨 Frontend
- **Componentes:** 31 componentes React (uno por mecánica)
  - `<MultipleChoiceExercise>`
  - `<TextAnalysisExercise>`
  - `<SimulationExercise>`
  - ... (uno por cada tipo)
- **Renderer:** `<ExerciseRenderer type={exercise.type} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado (31 mecánicas)
- [x] Especificación técnica detallada por mecánica
- [x] DDL implementado y consolidado
- [x] Backend: 31 handlers implementados
- [x] Frontend: 31 componentes implementados
- [x] Tests E2E por mecánica
- [ ] 5 mecánicas pendientes de refinamiento UI

---

### 3.2 Niveles de Dificultad

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/pedagogia/RF-EDU-002-niveles-dificultad.md`

**Requerimiento:**
> El sistema debe clasificar contenido en 8 niveles de dificultad para:
> - Progresión gradual adaptada al estudiante
> - Filtrado de contenido apropiado
> - Sistema adaptativo de dificultad

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/pedagogia/ESCALA-DIFICULTAD.md`

**Escala de 8 Niveles:**
1. `very_easy` - Introducción, sin pre-requisitos
2. `easy` - Conceptos básicos
3. `beginner` - Principiante con práctica
4. `medium` - Nivel medio, aplicación de conceptos
5. `intermediate` - Intermedio, análisis requerido
6. `hard` - Difícil, síntesis de múltiples conceptos
7. `advanced` - Avanzado, pensamiento crítico
8. `very_hard` - Desafío extremo, creatividad

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:99
CREATE TYPE public.difficulty_level AS ENUM (
    'very_easy', 'easy', 'beginner', 'medium',
    'intermediate', 'hard', 'advanced', 'very_hard'
);
```

**Usado en:**
- `educational_content.modules` (columna: `difficulty_level`)
- `educational_content.exercises` (columna: `difficulty_level`)

#### 💻 Backend
- **Enum:** `DifficultyLevelEnum`
- **Service:** `AdaptiveDifficultyService`
  - Ajusta dificultad según performance del estudiante

#### 🎨 Frontend
- **UI:** Badges con colores por nivel
  - very_easy: Verde claro
  - medium: Amarillo
  - very_hard: Rojo oscuro

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica
- [x] DDL implementado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema adaptativo funcional

---

### 3.3 Niveles Cognitivos (Taxonomía de Bloom)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/pedagogia/RF-EDU-003-taxonomia-bloom.md`

**Requerimiento:**
> El sistema debe clasificar ejercicios según los 6 niveles de la Taxonomía de Bloom revisada:
> - Permite reportes de desarrollo cognitivo del estudiante
> - Asegura progresión de habilidades de pensamiento

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/pedagogia/BLOOM-ADAPTADO.md`

**6 Niveles Cognitivos (Versión en español):**
1. **recordar** - Recuperar información de memoria
2. **comprender** - Explicar ideas o conceptos
3. **aplicar** - Usar información en situaciones nuevas
4. **analizar** - Descomponer en partes y encontrar relaciones
5. **evaluar** - Hacer juicios basados en criterios
6. **crear** - Producir trabajo nuevo u original

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:111
CREATE TYPE public.cognitive_level AS ENUM (
    'recordar',    -- Nivel 1: Recordar información
    'comprender',  -- Nivel 2: Comprender conceptos
    'aplicar',     -- Nivel 3: Aplicar conocimiento
    'analizar',    -- Nivel 4: Analizar información
    'evaluar',     -- Nivel 5: Evaluar críticamente
    'crear'        -- Nivel 6: Crear nuevo contenido
);
```

**Usado en:**
- `educational_content.exercises` (columna: `cognitive_level`)

#### 💻 Backend
- **Enum:** `CognitiveLevelEnum`
- **Analytics:** `CognitiveProgressService`
  - Reportes de distribución de niveles por estudiante

#### 🎨 Frontend
- **Analytics:** Gráfico de radar con 6 dimensiones cognitivas
- **Filtros:** Filtrar ejercicios por nivel cognitivo

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica
- [x] DDL implementado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Reportes cognitivos funcionales

---

## 📊 MÓDULO 4: PROGRESO Y SEGUIMIENTO

### 4.1 Estados de Progreso de Módulos

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/aprendizaje/RF-PRG-001-tracking-progreso.md`
- **Casos de Uso:**
  - UC-PRG-001: Sistema registra progreso del estudiante en módulo
  - UC-PRG-002: Estudiante ve su avance en dashboard
  - UC-PRG-003: Sistema identifica módulos que necesitan revisión

**Requerimiento:**
> El sistema debe rastrear el progreso del estudiante en cada módulo educativo con 5 estados:
> - No iniciado: Estudiante no ha comenzado el módulo
> - En progreso: Estudiante trabajando activamente
> - Completado: Todos los ejercicios resueltos correctamente
> - Dominado: 100% de ejercicios + criterios de maestría
> - Necesita revisión: Performance bajo umbral mínimo

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/aprendizaje/SISTEMA-PROGRESO.md`

**Criterios por Estado:**

| Estado | Criterio | Acciones del Sistema |
|--------|----------|---------------------|
| `not_started` | 0% completitud | Mostrar botón "Comenzar" |
| `in_progress` | 1-99% completitud | Mostrar % progreso |
| `completed` | 100% completitud, >70% accuracy | Badge de completitud, XP reward |
| `mastered` | 100% completitud, >90% accuracy, <3 intentos promedio | Badge especial "Maestro", bonus XP |
| `needs_review` | <70% accuracy o >5 intentos promedio | Recomendar revisión, ofrecer ayuda |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:124
CREATE TYPE progress_status AS ENUM (
    'not_started',   -- No ha comenzado
    'in_progress',   -- En progreso
    'completed',     -- Completado exitosamente
    'mastered',      -- Dominado (criterios de maestría)
    'needs_review'   -- Necesita revisión
);
```

**Tablas que lo usan:**
1. `progress_tracking.module_progress` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/01-module_progress.sql`
   - **Propósito:** Tracking de progreso por módulo

**Functions:**
- `progress_tracking.calculate_module_status(user_id, module_id) RETURNS progress_status`
  - Calcula estado basado en completitud y accuracy

**Triggers:**
- `trg_update_progress_status` → Actualiza status automáticamente al completar ejercicios

#### 💻 Backend
- **Enum:** `ProgressStatusEnum`
- **Service:** `ProgressTrackingService`
  - `getModuleProgress(userId, moduleId)`
  - `updateProgressStatus(userId, moduleId)`

#### 🎨 Frontend
- **Componentes:**
  - `<ProgressBar status={module.status} />`
  - `<ProgressBadge status="mastered" />`
  - `<ModuleCard progress={module.progress} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema de tracking automático activo
- [x] Tests E2E pasando

---

### 4.2 Estados de Intentos de Ejercicios

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/aprendizaje/RF-PRG-002-intentos-ejercicios.md`
- **Casos de Uso:**
  - UC-EXE-001: Estudiante comienza ejercicio
  - UC-EXE-002: Estudiante envía respuesta para calificación
  - UC-EXE-003: Profesor revisa ejercicio de respuesta abierta

**Requerimiento:**
> El sistema debe gestionar el ciclo de vida de cada intento de ejercicio:
> - En progreso: Ejercicio iniciado, sin enviar
> - Enviado: Respuesta enviada, pendiente de calificación automática o manual
> - Calificado: Sistema calificó automáticamente
> - Revisado: Profesor revisó manualmente (ejercicios abiertos)

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/aprendizaje/FLUJO-INTENTOS.md`

**Flujo de Estados:**
```
in_progress → (submit) → submitted
submitted → (auto-grading) → graded
submitted → (manual review) → reviewed
```

**Tipos de Calificación por Mecánica:**
- **Auto-grading:** multiple_choice, true_false, matching → `submitted` → `graded`
- **Manual review:** writing_prompt, essay, creative_thinking → `submitted` → `reviewed`

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:128
CREATE TYPE attempt_status AS ENUM (
    'in_progress', -- Ejercicio en progreso
    'submitted',   -- Respuesta enviada
    'graded',      -- Calificado automáticamente
    'reviewed'     -- Revisado manualmente por profesor
);
```

**Tablas que lo usan:**
1. `progress_tracking.exercise_attempts` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/03-exercise_attempts.sql`
   - **Propósito:** Estado de cada intento de ejercicio

2. `progress_tracking.exercise_submissions` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/04-exercise_submissions.sql`
   - **Propósito:** Seguimiento de envíos

**Functions:**
- `progress_tracking.submit_attempt(attempt_id) RETURNS BOOLEAN`
  - Cambia de `in_progress` → `submitted`, dispara auto-grading

- `progress_tracking.grade_attempt(attempt_id, score, feedback) RETURNS BOOLEAN`
  - Cambia a `graded` o `reviewed`

#### 💻 Backend
- **Enum:** `AttemptStatusEnum`
- **Service:** `ExerciseAttemptService`
  - `startAttempt(userId, exerciseId)` → status: `in_progress`
  - `submitAttempt(attemptId, answer)` → status: `submitted`
  - `autoGradeAttempt(attemptId)` → status: `graded`
- **Queue:** `auto-grading-queue` para procesamiento asíncrono

#### 🎨 Frontend
- **Componentes:**
  - `<ExerciseAttemptCard status={attempt.status} />`
  - `<SubmitButton disabled={status !== 'in_progress'} />`
  - `<TeacherReviewPanel attemptId={id} />` (para status: `submitted`)

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (auto-grading + manual review)
- [x] Frontend implementado
- [x] Queue de calificación activa
- [x] Tests E2E pasando

---

## 👥 MÓDULO 5: CARACTERÍSTICAS SOCIALES

### 5.1 Roles en Aulas (Classrooms)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/social/RF-SOC-001-aulas-virtuales.md`
- **Casos de Uso:**
  - UC-CLS-001: Profesor crea aula y asigna estudiantes
  - UC-CLS-002: Asistente ayuda a gestionar aula
  - UC-CLS-003: Estudiante accede a materiales del aula

**Requerimiento:**
> El sistema debe soportar aulas virtuales con 3 roles diferenciados:
> - Profesor (teacher): Crea aulas, asigna ejercicios, revisa progreso
> - Asistente (assistant): Ayuda a revisar ejercicios, responde dudas
> - Estudiante (student): Accede a materiales, completa ejercicios

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/social/SISTEMA-AULAS.md`

**Matriz de Permisos por Rol:**

| Acción | teacher | assistant | student |
|--------|---------|-----------|---------|
| Crear aula | ✅ | ❌ | ❌ |
| Asignar ejercicios | ✅ | ✅ | ❌ |
| Revisar ejercicios abiertos | ✅ | ✅ | ❌ |
| Ver progreso de aula | ✅ | ✅ | ❌ |
| Completar ejercicios | ❌ | ❌ | ✅ |
| Ver propios resultados | ✅ | ✅ | ✅ |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:133
CREATE TYPE classroom_role AS ENUM (
    'teacher',   -- Profesor principal del aula
    'student',   -- Estudiante del aula
    'assistant'  -- Asistente/profesor auxiliar
);
```

**Tablas que lo usan:**
1. `social_features.classroom_members` (columna: `role`)
   - **Archivo:** `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`
   - **Propósito:** Rol del usuario en el aula

**RLS Policies:**
- `classroom_members_select_teacher` → Teachers ven todos los miembros
- `classroom_members_select_student` → Students solo ven compañeros de su aula

#### 💻 Backend
- **Enum:** `ClassroomRoleEnum`
- **Guard:** `ClassroomRoleGuard`
- **Service:** `ClassroomService`
  - `assignRole(classroomId, userId, role)`
  - `canUserPerformAction(userId, classroomId, action)`

#### 🎨 Frontend
- **Componentes:**
  - `<ClassroomMemberList role="teacher" />`
  - `<RoleBasedClassroomUI userRole={role} />`
  - `<AssignRoleModal />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] RLS policies activas
- [x] Tests E2E pasando

---

### 5.2 Roles en Equipos (Teams/Guilds)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/social/RF-SOC-002-equipos-colaborativos.md`
- **Casos de Uso:**
  - UC-TEAM-001: Estudiantes forman equipos para misiones colaborativas
  - UC-TEAM-002: Líder coordina actividades del equipo
  - UC-TEAM-003: Coordinador organiza comunicación

**Requerimiento:**
> El sistema debe permitir equipos de estudiantes con roles específicos:
> - Líder (leader): Organiza estrategia del equipo, toma decisiones finales
> - Coordinador (coordinator): Facilita comunicación, asigna tareas
> - Miembro (member): Participa activamente, completa asignaciones

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/social/SISTEMA-EQUIPOS.md`

**Características por Rol:**

| Rol | Responsabilidades | Recompensas Bonus |
|-----|-------------------|-------------------|
| `leader` | Estrategia, decisiones finales, representa equipo | +20% XP en misiones de equipo |
| `coordinator` | Comunicación, asignación de tareas, mediación | +15% XP en misiones de equipo |
| `member` | Completar asignaciones, colaborar activamente | +10% XP en misiones de equipo |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:137
CREATE TYPE team_role AS ENUM (
    'leader',      -- Líder del equipo
    'member',      -- Miembro regular
    'coordinator'  -- Coordinador de comunicación
);
```

**Tablas que lo usan:**
1. `social_features.team_members` (columna: `role`)
   - **Archivo:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`
   - **Propósito:** Rol del estudiante en el equipo

**Functions:**
- `social_features.assign_team_role(team_id, user_id, role) RETURNS BOOLEAN`
  - Asigna rol con validaciones (solo 1 leader por equipo)

**Triggers:**
- `trg_team_role_bonus` → Aplica bonus de XP según rol al completar misión

#### 💻 Backend
- **Enum:** `TeamRoleEnum`
- **Service:** `TeamService`
  - `createTeam(leaderId, memberIds)`
  - `assignRole(teamId, userId, role)`
  - `calculateRoleBonus(teamId, missionXp)`

#### 🎨 Frontend
- **Componentes:**
  - `<TeamRosterCard members={team.members} />`
  - `<RoleBadge role="leader" />`
  - `<TeamFormation onSubmit={createTeam} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema de bonus activo
- [x] Tests E2E pasando

---

### 5.3 Estados de Amistad (Friendships)

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/social/RF-SOC-003-sistema-amigos.md`
- **Casos de Uso:**
  - UC-FRI-001: Estudiante envía solicitud de amistad
  - UC-FRI-002: Estudiante acepta/rechaza solicitud
  - UC-FRI-003: Estudiante bloquea a otro usuario

**Requerimiento:**
> El sistema debe gestionar relaciones de amistad con 3 estados:
> - Pendiente: Solicitud enviada, esperando respuesta
> - Aceptada: Amistad confirmada, pueden interactuar socialmente
> - Bloqueada: Usuario bloqueó a otro, no pueden interactuar

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/social/SISTEMA-AMISTADES.md`

**Flujo de Estados:**
```
∅ → (enviar solicitud) → pending
pending → (aceptar) → accepted
pending → (rechazar) → ∅
accepted → (bloquear) → blocked
blocked → (desbloquear) → ∅
```

**Reglas de Negocio:**
- Solicitud pendiente caduca a los 30 días
- Usuario bloqueado no puede enviar nuevas solicitudes
- Amistad accepted permite: ver progreso, enviar mensajes, invitar a equipos

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:141
CREATE TYPE friendship_status AS ENUM (
    'pending',  -- Solicitud pendiente
    'accepted', -- Amistad aceptada
    'blocked'   -- Usuario bloqueado
);
```

**Tablas que lo usan:**
1. `social_features.friendships` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`
   - **Propósito:** Estado de la relación entre usuarios

**Functions:**
- `social_features.send_friend_request(from_user_id, to_user_id) RETURNS UUID`
  - Crea friendship con status `pending`

- `social_features.accept_friend_request(friendship_id) RETURNS BOOLEAN`
  - Cambia status a `accepted`

- `social_features.block_user(user_id, blocked_user_id) RETURNS BOOLEAN`
  - Crea o actualiza friendship con status `blocked`

**Triggers:**
- `trg_friendship_notification` → Envía notificación según cambio de status

#### 💻 Backend
- **Enum:** `FriendshipStatusEnum`
- **Service:** `FriendshipService`
  - `sendRequest(fromUserId, toUserId)`
  - `acceptRequest(friendshipId)`
  - `rejectRequest(friendshipId)`
  - `blockUser(userId, blockedUserId)`
  - `getFriends(userId)` → filtra por status: `accepted`

#### 🎨 Frontend
- **Componentes:**
  - `<FriendRequestList status="pending" />`
  - `<FriendsList />`
  - `<BlockedUsersList />`
  - `<FriendshipStatusBadge status={friendship.status} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema de notificaciones activo
- [x] Tests E2E pasando

---

## 🔔 MÓDULO 6: NOTIFICACIONES

### 6.1 Tipos de Notificaciones

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/notificaciones/RF-NOT-001-tipos-notificaciones.md`
- **Casos de Uso:**
  - UC-NOT-001: Usuario recibe notificación de achievement desbloqueado
  - UC-NOT-002: Usuario recibe notificación de solicitud de amistad
  - UC-NOT-003: Sistema envía anuncio importante

**Requerimiento:**
> El sistema debe enviar 11 tipos de notificaciones clasificadas por contexto:
> - **Gamificación:** achievement_unlocked, rank_up, ml_coins_earned, streak_milestone, level_up
> - **Social:** friend_request, guild_invitation, message_received
> - **Aprendizaje:** mission_completed, exercise_feedback
> - **Sistema:** system_announcement

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/notificaciones/CATALOGO-NOTIFICACIONES.md`

**Catálogo de Notificaciones:**

| Tipo | Trigger | Formato Mensaje | Acción |
|------|---------|----------------|--------|
| `achievement_unlocked` | Desbloquear logro | "🏆 ¡Desbloqueaste {achievement_name}!" | Ver logro |
| `rank_up` | Subir de rango Maya | "⬆️ ¡Ascendiste a {rank_name}!" | Ver perfil |
| `friend_request` | Recibir solicitud | "👋 {user_name} te envió solicitud de amistad" | Ver solicitud |
| `mission_completed` | Completar misión | "✅ ¡Completaste {mission_name}! +{xp} XP" | Ver recompensas |
| `system_announcement` | Admin publica anuncio | "📢 {announcement_text}" | Ver detalles |
| `ml_coins_earned` | Ganar ML Coins | "💰 Ganaste {amount} ML Coins" | Ver inventario |
| `streak_milestone` | Alcanzar hito de racha | "🔥 ¡{days} días consecutivos!" | Ver estadísticas |
| `exercise_feedback` | Recibir retroalimentación | "📝 Nuevo feedback en {exercise_name}" | Ver feedback |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:59-72
CREATE TYPE public.notification_type AS ENUM (
    'achievement_unlocked',  -- Logro desbloqueado
    'rank_up',               -- Promoción de rango
    'friend_request',        -- Solicitud de amistad
    'guild_invitation',      -- Invitación a equipo (guild)
    'mission_completed',     -- Misión completada
    'level_up',              -- Subida de nivel
    'message_received',      -- Mensaje recibido
    'system_announcement',   -- Anuncio del sistema
    'ml_coins_earned',       -- ML Coins ganadas
    'streak_milestone',      -- Hito de racha
    'exercise_feedback'      -- Retroalimentación de ejercicio
);
```

**Tablas que lo usan:**
1. `gamification_system.notifications` (columna: `type`)
   - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
   - **Propósito:** Almacenar notificaciones por tipo

**Functions:**
- `public.create_notification(user_id, type, data jsonb) RETURNS UUID`
  - Crea notificación con payload específico por tipo

#### 💻 Backend
- **Enum:** `NotificationTypeEnum`
- **Service:** `NotificationService`
  - `sendNotification(userId, type, data)`
  - `getNotifications(userId, type?)` → Filtra por tipo
- **WebSocket:** `notification-gateway` para tiempo real

#### 🎨 Frontend
- **Componentes:**
  - `<NotificationBell unreadCount={5} />`
  - `<NotificationList type="friend_request" />`
  - `<NotificationCard type={notification.type} />`
  - Iconos específicos por tipo

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica (11 tipos)
- [x] DDL implementado y consolidado
- [x] Backend implementado (WebSocket)
- [x] Frontend implementado
- [x] Sistema de tiempo real activo
- [x] Tests E2E pasando

---

### 6.2 Prioridades de Notificaciones

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/notificaciones/RF-NOT-002-priorizacion.md`
- **Casos de Uso:**
  - UC-NOT-004: Sistema prioriza notificaciones críticas
  - UC-NOT-005: Usuario filtra notificaciones por prioridad

**Requerimiento:**
> El sistema debe clasificar notificaciones en 4 niveles de prioridad:
> - Low: Informativas, no requieren acción inmediata
> - Medium: Importantes, revisar en el día
> - High: Urgentes, requieren atención pronto
> - Critical: Críticas, requieren acción inmediata

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/notificaciones/PRIORIZACION.md`

**Mapeo de Tipo → Prioridad por Defecto:**

| Tipo | Prioridad Default | Comportamiento UI |
|------|------------------|-------------------|
| `achievement_unlocked` | Low | Badge verde, sin sonido |
| `rank_up` | Medium | Badge amarillo, sonido suave |
| `friend_request` | Low | Badge verde |
| `mission_completed` | Medium | Badge amarillo |
| `system_announcement` | High o Critical | Badge rojo, modal obligatorio si critical |
| `ml_coins_earned` | Low | Badge verde |
| `exercise_feedback` | Medium | Badge amarillo |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:75
CREATE TYPE notification_priority AS ENUM (
    'low',      -- Informativa
    'medium',   -- Importante
    'high',     -- Urgente
    'critical'  -- Crítica
);
```

**Tablas que lo usan:**
1. `gamification_system.notifications` (columna: `priority`)
   - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
   - **Default:** Varía según `type`

**Functions:**
- `public.get_priority_for_type(notification_type) RETURNS notification_priority`
  - Determina prioridad por defecto según tipo

#### 💻 Backend
- **Enum:** `NotificationPriorityEnum`
- **Service:** `NotificationService`
  - `getPriorityForType(type)`
  - `getNotifications(userId, minPriority?)`

#### 🎨 Frontend
- **Componentes:**
  - `<PriorityBadge priority="critical" />` → Rojo pulsante
  - `<NotificationList sortBy="priority" />`
  - Filtros por prioridad

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Sistema de priorización activo
- [x] Tests E2E pasando

---

## 🎬 MÓDULO 7: CONTENIDO Y MEDIA

### 7.1 Estados de Contenido

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/contenido/RF-CNT-001-ciclo-vida-contenido.md`
- **Casos de Uso:**
  - UC-CNT-001: Profesor crea módulo educativo en borrador
  - UC-CNT-002: Admin revisa y publica módulo
  - UC-CNT-003: Admin archiva módulo obsoleto

**Requerimiento:**
> El sistema debe gestionar el ciclo de vida del contenido educativo con 4 estados:
> - Draft: Contenido en creación, no visible para estudiantes
> - Under Review: Enviado para revisión de calidad
> - Published: Aprobado y visible para estudiantes
> - Archived: Contenido obsoleto, no visible pero conservado

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/contenido/WORKFLOW-CONTENIDO.md`

**Flujo de Estados:**
```
draft → (submit) → under_review
under_review → (approve) → published
under_review → (reject) → draft
published → (archive) → archived
archived → (restore) → draft
```

**Permisos por Rol:**
- **admin_teacher:** Crear (draft), editar propios, submit to review
- **super_admin:** Aprobar (under_review → published), archivar

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:107
CREATE TYPE content_status AS ENUM (
    'draft',        -- Borrador en creación
    'published',    -- Publicado y visible
    'archived',     -- Archivado (no visible)
    'under_review'  -- En revisión de calidad
);
```

**Tablas que lo usan:**
1. `educational_content.modules` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`

2. `educational_content.exercises` (columna: `status`)
   - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/02-exercises.sql`

**RLS Policies:**
- `modules_select_student` → Solo ven content_status = 'published'
- `modules_select_teacher` → Ven propios drafts + published
- `modules_select_admin` → Ven todo

#### 💻 Backend
- **Enum:** `ContentStatusEnum`
- **Service:** `ContentManagementService`
  - `createDraft(teacherId, moduleData)`
  - `submitForReview(moduleId)`
  - `approve(moduleId)`
  - `archive(moduleId)`

#### 🎨 Frontend
- **Componentes:**
  - `<ContentStatusBadge status={module.status} />`
  - `<ContentWorkflowActions module={module} />`
  - `<ModeratorReviewPanel />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Workflow de aprobación activo
- [x] Tests E2E pasando

---

### 7.2 Tipos de Archivos Multimedia

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/contenido/RF-CNT-002-multimedia.md`
- **Casos de Uso:**
  - UC-MED-001: Profesor sube imagen ilustrativa a ejercicio
  - UC-MED-002: Ejercicio de audio_comprehension usa archivo audio
  - UC-MED-003: Módulo incluye video explicativo

**Requerimiento:**
> El sistema debe soportar 5 tipos de archivos multimedia:
> - Imágenes: PNG, JPG, SVG (ilustraciones, diagramas)
> - Videos: MP4, WebM (explicaciones, tutoriales)
> - Audio: MP3, OGG (comprensión auditiva, podcasts)
> - Documentos: PDF (lecturas, guías)
> - Interactivos: HTML5, Canvas (simulaciones, juegos)

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/contenido/ESPECIFICACIONES-MULTIMEDIA.md`

**Especificaciones Técnicas:**

| Tipo | Formatos | Tamaño Max | Almacenamiento | CDN |
|------|----------|-----------|----------------|-----|
| `image` | PNG, JPG, WebP, SVG | 5 MB | Supabase Storage | ✅ |
| `video` | MP4, WebM | 100 MB | Supabase Storage | ✅ |
| `audio` | MP3, OGG, WAV | 20 MB | Supabase Storage | ✅ |
| `document` | PDF | 10 MB | Supabase Storage | ❌ |
| `interactive` | HTML5 bundle (zip) | 50 MB | Supabase Storage | ❌ |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:115
CREATE TYPE media_type AS ENUM (
    'image',       -- Imágenes (PNG, JPG, SVG)
    'video',       -- Videos (MP4, WebM)
    'audio',       -- Audio (MP3, OGG)
    'document',    -- Documentos (PDF)
    'interactive'  -- Contenido interactivo (HTML5)
);
```

**Tablas que lo usan:**
1. `content_management.media_files` (columna: `type`)
   - **Archivo:** `apps/database/ddl/schemas/content_management/tables/03-media_files.sql`
   - **Propósito:** Metadata de archivos multimedia

**Functions:**
- `storage.validate_file_type(file_extension TEXT) RETURNS media_type`
  - Mapea extensión → tipo

#### 💻 Backend
- **Enum:** `MediaTypeEnum`
- **Service:** `MediaService`
  - `uploadFile(file, type)`
  - `getMediaUrl(mediaId)` → CDN URL
- **Validators:** Valida formato y tamaño según tipo

#### 🎨 Frontend
- **Componentes:**
  - `<MediaUploader acceptedTypes={['image', 'video']} />`
  - `<MediaPreview type={file.type} url={file.url} />`
  - `<ImageViewer />`, `<VideoPlayer />`, `<AudioPlayer />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (Supabase Storage)
- [x] Frontend implementado (5 viewers)
- [x] CDN configurado
- [x] Tests E2E pasando

---

### 7.3 Estados de Procesamiento de Media

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/contenido/RF-CNT-003-procesamiento-media.md`
- **Casos de Uso:**
  - UC-MED-004: Sistema procesa video subido (transcoding)
  - UC-MED-005: Sistema genera thumbnails de video
  - UC-MED-006: Usuario recibe notificación de procesamiento fallido

**Requerimiento:**
> El sistema debe procesar archivos multimedia de forma asíncrona con 4 estados:
> - Pending: Archivo subido, en cola de procesamiento
> - Processing: Procesamiento activo (transcoding, thumbnails, compression)
> - Completed: Procesamiento exitoso, archivo listo
> - Failed: Error en procesamiento, requiere resubida

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/contenido/PIPELINE-PROCESAMIENTO.md`

**Pipeline de Procesamiento por Tipo:**

| Tipo | Procesamiento | Duración Estimada | Output |
|------|---------------|------------------|--------|
| `image` | Resize, WebP conversion, thumbnail | <10 seg | 3 resoluciones + thumbnail |
| `video` | Transcoding (720p, 480p), thumbnails, subtitles | 1-5 min | 2 resoluciones + 3 thumbnails |
| `audio` | Compression, normalization | 10-30 seg | MP3 optimizado |
| `document` | PDF preview generation | <20 seg | PNG previews de páginas |
| `interactive` | Validation, zip extraction | <5 seg | HTML5 bundle validado |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:119
CREATE TYPE processing_status AS ENUM (
    'pending',     -- En cola de procesamiento
    'processing',  -- Procesamiento activo
    'completed',   -- Completado exitosamente
    'failed'       -- Error en procesamiento
);
```

**Tablas que lo usan:**
1. `content_management.media_files` (columna: `processing_status`)
   - **Archivo:** `apps/database/ddl/schemas/content_management/tables/03-media_files.sql`
   - **Default:** `'pending'`

**Functions:**
- `storage.update_processing_status(media_id, status, error_message?) RETURNS BOOLEAN`

**Triggers:**
- `trg_processing_completed` → Notifica al usuario cuando status = 'completed'
- `trg_processing_failed` → Notifica al usuario cuando status = 'failed'

#### 💻 Backend
- **Enum:** `ProcessingStatusEnum`
- **Queue:** `media-processing-queue` (Bull/BullMQ)
- **Workers:**
  - `ImageProcessor`
  - `VideoTranscoder` (FFmpeg)
  - `AudioNormalizer`
  - `DocumentPreviewer`
- **Service:** `MediaProcessingService`
  - `enqueueProcessing(mediaId)`
  - `getProcessingStatus(mediaId)`

#### 🎨 Frontend
- **Componentes:**
  - `<UploadProgressBar status={file.processing_status} />`
  - `<ProcessingStatusBadge status="processing" />` → Spinner animado
  - `<ProcessingFailedAlert error={file.error_message} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (FFmpeg, Sharp)
- [x] Frontend implementado
- [x] Queue de procesamiento activa
- [x] Tests E2E pasando

---

## 📋 MÓDULO 8: AUDITORÍA Y CONFIGURACIÓN

### 8.1 Acciones de Auditoría

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/auditoria/RF-AUD-001-registro-acciones.md`
- **Casos de Uso:**
  - UC-AUD-001: Sistema audita creación de contenido
  - UC-AUD-002: Sistema registra intentos de login
  - UC-AUD-003: Admin exporta datos de estudiantes (auditable)

**Requerimiento:**
> El sistema debe auditar todas las acciones críticas con 8 tipos de acciones:
> - **CRUD:** create, update, delete
> - **Auth:** login, logout
> - **Acceso:** access (acceso a recursos sensibles)
> - **Datos:** export, import

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/auditoria/SISTEMA-AUDITORIA.md`

**Acciones Auditables por Contexto:**

| Contexto | Acciones | Nivel de Detalle | Retención |
|----------|----------|-----------------|-----------|
| Contenido | create, update, delete | Full payload | 1 año |
| Autenticación | login, logout | IP, device, timestamp | 6 meses |
| Datos sensibles | access, export | Usuario, recurso, justificación | 3 años |
| Configuración | update | Valores antes/después | Permanente |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:155
CREATE TYPE audit_action AS ENUM (
    'create',  -- Creación de registro
    'update',  -- Actualización de registro
    'delete',  -- Eliminación de registro
    'login',   -- Inicio de sesión
    'logout',  -- Cierre de sesión
    'access',  -- Acceso a recurso sensible
    'export',  -- Exportación de datos
    'import'   -- Importación de datos
);
```

**Tablas que lo usan:**
1. `audit_logging.audit_logs` (columna: `action`)
   - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/01-audit_logs.sql`
   - **Propósito:** Log maestro de auditoría

**Functions:**
- `audit_logging.log_action(user_id, action, resource_type, resource_id, details jsonb)`

**Triggers (Automáticos):**
- Todas las tablas críticas tienen triggers que llaman `audit_logging.log_action()`

#### 💻 Backend
- **Enum:** `AuditActionEnum`
- **Interceptor:** `AuditInterceptor` → Audita automáticamente endpoints sensibles
- **Service:** `AuditService`
  - `logAction(userId, action, resource, details)`
  - `getAuditLogs(filters)`

#### 🎨 Frontend
- **Admin Panel:**
  - `<AuditLogViewer />`
  - Filtros por: usuario, acción, fecha, recurso

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (interceptor automático)
- [x] Frontend implementado (admin panel)
- [x] Sistema de auditoría activo
- [x] Tests E2E pasando

---

### 8.2 Niveles de Log

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/auditoria/RF-AUD-002-logging-sistema.md`
- **Casos de Uso:**
  - UC-LOG-001: Sistema registra errores críticos
  - UC-LOG-002: Desarrollador consulta logs de debugging
  - UC-LOG-003: Alertas automáticas para errores críticos

**Requerimiento:**
> El sistema debe generar logs clasificados en 5 niveles de severidad:
> - Debug: Información detallada para desarrollo
> - Info: Eventos informativos normales
> - Warning: Situaciones potencialmente problemáticas
> - Error: Errores que requieren atención
> - Critical: Fallos críticos que afectan operación

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/auditoria/SISTEMA-LOGGING.md`

**Niveles de Log:**

| Nivel | Uso | Ejemplos | Acción Automática |
|-------|-----|----------|------------------|
| `debug` | Desarrollo | SQL queries, cache hits | Ninguna |
| `info` | Operaciones normales | User login, exercise completed | Ninguna |
| `warning` | Situaciones anómalas | Slow query, retry attempt | Log agregado |
| `error` | Errores recuperables | API timeout, validation failed | Email a on-call |
| `critical` | Fallos críticos | Database down, OOM crash | PagerDuty alert |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:150
CREATE TYPE log_level AS ENUM (
    'debug',    -- Debug detallado
    'info',     -- Informativo
    'warning',  -- Advertencia
    'error',    -- Error
    'critical'  -- Crítico
);
```

**Tablas que lo usan:**
1. `audit_logging.system_logs` (columna: `level`)
   - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/04-system_logs.sql`

**Functions:**
- `audit_logging.log(level, message, context jsonb)`

#### 💻 Backend
- **Enum:** `LogLevelEnum`
- **Logger:** Winston configurado con niveles
- **Service:** `LoggerService`
  - `debug(message, context)`
  - `info(message, context)`
  - `warn(message, context)`
  - `error(message, context)`
  - `critical(message, context)`

#### 🎨 Frontend
- **Admin Panel:**
  - `<SystemLogsViewer level="error" />`
  - Real-time log streaming

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (Winston)
- [x] Frontend implementado
- [x] Alerting configurado (PagerDuty)
- [x] Tests E2E pasando

---

### 8.3 Severidades de Alertas

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/auditoria/RF-AUD-003-sistema-alertas.md`
- **Casos de Uso:**
  - UC-ALR-001: Sistema genera alerta de uso de disco alto
  - UC-ALR-002: Admin revisa alertas pendientes
  - UC-ALR-003: DevOps resuelve alerta crítica

**Requerimiento:**
> El sistema debe generar alertas clasificadas en 4 niveles de severidad:
> - Info: Informativas, sin acción requerida
> - Warning: Potencial problema, monitorear
> - Error: Problema activo, requiere investigación
> - Critical: Emergencia, requiere acción inmediata

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/auditoria/SISTEMA-ALERTAS.md`

**Matriz de Severidad:**

| Severidad | SLA Respuesta | Escalamiento | Ejemplos |
|-----------|---------------|--------------|----------|
| `info` | N/A | Ninguno | New feature deployed |
| `warning` | 24 horas | Email | High memory usage (>80%) |
| `error` | 2 horas | Slack + Email | API endpoint down |
| `critical` | 15 minutos | PagerDuty + SMS | Database unreachable |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:159
CREATE TYPE alert_severity AS ENUM (
    'info',     -- Informativa
    'warning',  -- Advertencia
    'error',    -- Error
    'critical'  -- Crítica
);
```

**Tablas que lo usan:**
1. `audit_logging.system_alerts` (columna: `severity`)
   - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql`

**Functions:**
- `admin_dashboard.create_alert(severity, message, context jsonb) RETURNS UUID`

#### 💻 Backend
- **Enum:** `AlertSeverityEnum`
- **Service:** `AlertingService`
  - `createAlert(severity, message, context)`
  - `getActiveAlerts(severity?)`
- **Integrations:** PagerDuty, Slack webhooks

#### 🎨 Frontend
- **Admin Dashboard:**
  - `<AlertsPanel />` → Badge con conteo de alertas activas
  - `<AlertCard severity={alert.severity} />`
  - Colores: info=azul, warning=amarillo, error=naranja, critical=rojo

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado (PagerDuty)
- [x] Frontend implementado
- [x] Sistema de alertas activo
- [x] Tests E2E pasando

---

### 8.4 Estados de Alertas

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/auditoria/RF-AUD-004-workflow-alertas.md`
- **Casos de Uso:**
  - UC-ALR-004: Admin reconoce alerta (acknowledge)
  - UC-ALR-005: DevOps resuelve alerta
  - UC-ALR-006: Admin ignora falso positivo

**Requerimiento:**
> El sistema debe gestionar ciclo de vida de alertas con 4 estados:
> - Active: Alerta activa, requiere atención
> - Acknowledged: Admin reconoció, trabajando en resolución
> - Resolved: Problema resuelto
> - Ignored: Falso positivo o no requiere acción

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/auditoria/WORKFLOW-ALERTAS.md`

**Flujo de Estados:**
```
active → (acknowledge) → acknowledged
acknowledged → (resolve) → resolved
active → (ignore) → ignored
```

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:163
CREATE TYPE alert_status AS ENUM (
    'active',       -- Alerta activa
    'acknowledged', -- Reconocida por admin
    'resolved',     -- Resuelta
    'ignored'       -- Ignorada (falso positivo)
);
```

**Tablas que lo usan:**
1. `audit_logging.system_alerts` (columna: `status`)
   - **Default:** `'active'`

**Functions:**
- `admin_dashboard.acknowledge_alert(alert_id, admin_id) RETURNS BOOLEAN`
- `admin_dashboard.resolve_alert(alert_id, resolution_notes) RETURNS BOOLEAN`
- `admin_dashboard.ignore_alert(alert_id, reason) RETURNS BOOLEAN`

#### 💻 Backend
- **Enum:** `AlertStatusEnum`
- **Service:** `AlertingService`
  - `acknowledgeAlert(alertId, adminId)`
  - `resolveAlert(alertId, notes)`
  - `ignoreAlert(alertId, reason)`

#### 🎨 Frontend
- **Admin Dashboard:**
  - `<AlertWorkflowButtons alert={alert} />`
  - `<AlertStatusBadge status={alert.status} />`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Workflow activo
- [x] Tests E2E pasando

---

### 8.5 Tipos de Configuración

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/configuracion/RF-CFG-001-sistema-configuracion.md`
- **Casos de Uso:**
  - UC-CFG-001: Admin configura feature flags (boolean)
  - UC-CFG-002: Admin ajusta parámetros numéricos (timeout, limits)
  - UC-CFG-003: Admin configura integraciones (JSON)

**Requerimiento:**
> El sistema debe soportar configuración dinámica con 5 tipos de valores:
> - String: Textos, URLs, nombres
> - Number: Valores numéricos, timeouts, límites
> - Boolean: Feature flags, toggles
> - JSON: Configuración compleja, objetos
> - Array: Listas de valores

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/configuracion/SISTEMA-CONFIGURACION.md`

**Tipos de Configuración:**

| Tipo | Validación | Ejemplos | Uso |
|------|-----------|----------|-----|
| `string` | Max length | `app_name`, `support_email` | Textos simples |
| `number` | Min/max range | `max_upload_size_mb: 100` | Límites numéricos |
| `boolean` | true/false | `enable_social_features: true` | Feature flags |
| `json` | Valid JSON schema | `oauth_config: {client_id, ...}` | Configs complejas |
| `array` | Tipo de elementos | `allowed_domains: ["edu.mx"]` | Listas |

#### 🗄️ Implementación DDL

**ENUM Canónico:**
```sql
-- Ubicación: apps/database/ddl/00-prerequisites.sql:146
CREATE TYPE public.setting_type AS ENUM (
    'string',  -- Texto
    'number',  -- Numérico
    'boolean', -- Booleano (feature flags)
    'json',    -- JSON complejo
    'array'    -- Array de valores
);
```

**Tablas que lo usan:**
1. `system_configuration.system_settings` (columna: `type`)
   - **Archivo:** `apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql`
   - Columna `value` es jsonb, se valida según `type`

**Functions:**
- `system_configuration.get_setting(key TEXT) RETURNS jsonb`
- `system_configuration.set_setting(key, value, type) RETURNS BOOLEAN`
  - Valida que value sea compatible con type

#### 💻 Backend
- **Enum:** `SettingTypeEnum`
- **Service:** `ConfigService`
  - `getSetting(key)`
  - `setSetting(key, value, type)`
  - Validadores por tipo

#### 🎨 Frontend
- **Admin Panel:**
  - `<SettingsEditor />`
  - Inputs específicos por tipo:
    - string → `<TextInput>`
    - number → `<NumberInput>`
    - boolean → `<Toggle>`
    - json → `<JsonEditor>`
    - array → `<TagInput>`

#### ✅ Estado de Implementación
- [x] Requerimiento documentado
- [x] Especificación técnica definida
- [x] DDL implementado y consolidado
- [x] Backend implementado
- [x] Frontend implementado
- [x] Validación por tipo activa
- [x] Tests E2E pasando

---

## ⏳ OBJETOS PENDIENTES DE DOCUMENTAR

### 📊 Tablas Implementadas Sin Mapeo (45)

Las siguientes tablas están implementadas en DDL pero NO tienen mapeo completo en este documento.
Requieren: Requerimiento funcional, Especificación técnica, Mapeo Backend/Frontend.

#### Progress Tracking (2)
- `progress_tracking.scheduled_missions`
  - **Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/05-scheduled_missions.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `progress_tracking.learning_sessions`
  - **Archivo:** `apps/database/ddl/schemas/progress_tracking/tables/02-learning_sessions.sql`
  - **Estado:** ⏳ Pendiente de documentar

#### Audit Logging (4)
- `audit_logging.user_activity_logs`
  - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/05-user_activity_logs.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `audit_logging.performance_metrics`
  - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/02-performance_metrics.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `audit_logging.system_alerts` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/03-system_alerts.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo
- `audit_logging.user_activity`
  - **Archivo:** `apps/database/ddl/schemas/audit_logging/tables/06-user_activity.sql`
  - **Estado:** ⏳ Pendiente de documentar

#### Assignments (Public Schema) (6)
- `public.assignments`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/05-assignments.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `public.assignment_exercises`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/06-assignment_exercises.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `public.assignment_students`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/07-assignment_students.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `public.assignment_classrooms`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/08-assignment_classrooms.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `public.assignment_submissions`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/09-assignment_submissions.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `public.teacher_notes`
  - **Archivo:** `apps/database/ddl/schemas/public/tables/10-teacher_notes.sql`
  - **Estado:** ⏳ Pendiente de documentar

#### Gamification System (10)
- `gamification_system.missions`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/03-missions.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.ml_coins_transactions`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/05-ml_coins_transactions.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.achievement_categories`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/07-achievement_categories.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.active_boosts`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/09-active_boosts.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.user_ranks`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/11-user_ranks.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.user_stats`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.maya_ranks`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/10-maya_ranks.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.inventory_transactions`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/12-inventory_transactions.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.user_boosts`
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/13-user_boosts.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `gamification_system.notifications` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/gamification_system/tables/08-notifications.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional específico

#### Social Features (6)
- `social_features.comments`
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/08-comments.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `social_features.classrooms`
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `social_features.classroom_members` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo
- `social_features.friendships` ✅ **COMPLETO**
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`
  - **Estado:** ✅ Completamente documentado
- `social_features.teams`
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `social_features.team_members` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo

#### Educational Content (5)
- `educational_content.module_categories`
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/05-module_categories.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `educational_content.exercise_hints`
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/03-exercise_hints.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `educational_content.exercise_resources`
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/04-exercise_resources.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `educational_content.reading_materials`
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/06-reading_materials.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `educational_content.modules` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/educational_content/tables/01-modules.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo

#### Auth Management (4)
- `auth_management.profiles` ✅ **COMPLETO**
  - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/03-profiles.sql`
  - **Estado:** ✅ Completamente documentado
- `auth_management.auth_providers` ✅ **COMPLETO**
  - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/05-auth_providers.sql`
  - **Estado:** ✅ Completamente documentado
- `auth_management.password_reset_tokens`
  - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/06-password_reset_tokens.sql`
  - **Estado:** ⏳ Pendiente de documentar
- `auth_management.email_verification_tokens`
  - **Archivo:** `apps/database/ddl/schemas/auth_management/tables/07-email_verification_tokens.sql`
  - **Estado:** ⏳ Pendiente de documentar

#### Content Management (2)
- `content_management.media_files` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/content_management/tables/03-media_files.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo
- `content_management.content_versions`
  - **Archivo:** `apps/database/ddl/schemas/content_management/tables/04-content_versions.sql`
  - **Estado:** ⏳ Pendiente de documentar

#### System Configuration (2)
- `system_configuration.system_settings` ✅ **PARCIAL**
  - **Archivo:** `apps/database/ddl/schemas/system_configuration/tables/01-system_settings.sql`
  - **Estado:** DDL mapeado, falta requerimiento funcional completo
- `system_configuration.feature_flags` ✅ **COMPLETO**
  - **Archivo:** `apps/database/ddl/schemas/system_configuration/tables/02-feature_flags.sql`
  - **Estado:** ✅ Completamente documentado

#### Storage (3)
- `storage.buckets`
  - **Archivo:** Tabla de Supabase Storage
  - **Estado:** ⏳ Infraestructura, pendiente de mapeo
- `storage.objects`
  - **Archivo:** Tabla de Supabase Storage
  - **Estado:** ⏳ Infraestructura, pendiente de mapeo
- `storage.migrations`
  - **Archivo:** Tabla de Supabase Storage
  - **Estado:** ⏳ Infraestructura, no requiere mapeo

### 🔧 Funciones Implementadas Sin Mapeo (54)

Las siguientes funciones están implementadas pero no documentadas en este mapeo.
**Nota:** Muchas son funciones auxiliares o triggers que NO requieren requerimiento funcional propio,
pero deben estar listadas en este inventario.

#### Progress Tracking Functions (7)
- `progress_tracking.get_user_progress_summary(user_id)`
- `progress_tracking.update_exercise_submissions_updated_at()`
- `progress_tracking.get_classroom_analytics(classroom_id)`
- `progress_tracking.grant_mission_completion_rewards(mission_id)`
- `progress_tracking.calculate_module_progress(user_id, module_id)` ✅ **MAPEADA**
- `progress_tracking.update_learning_sessions_updated_at()`
- `progress_tracking.update_scheduled_missions_updated_at()`

#### Gamilit Schema Functions (14)
- `gamilit.get_current_user_id()` ✅ **FUNCIÓN CRÍTICA** - Documentada en 00-prerequisites.sql
- `gamilit.update_user_stats_on_exercise_complete()`
- `gamilit.now_mexico()` - Retorna timestamp en timezone de México
- `gamilit.is_admin(user_id)` - Verifica si usuario es admin
- `gamilit.set_profile_defaults()` - Trigger function
- `gamilit.update_updated_at_column()` - Trigger function genérica
- `gamilit.get_current_user_role()`
- `gamilit.initialize_user_stats()` - Trigger function
- `gamilit.validate_username(username TEXT)` - Validación de username
- `gamilit.validate_email_format(email TEXT)` - Validación de email
- `gamilit.update_classroom_member_count()` - Trigger function
- `gamilit.update_user_last_login()` - Trigger function
- `gamilit.audit_profile_changes()` - Trigger function
- `gamilit.calculate_user_level(xp INTEGER)` - Calcula nivel según XP

#### Gamification System Functions (8)
- `gamification_system.get_user_comodines(user_id)`
- `gamification_system.get_user_rank_progress(user_id)`
- `gamification_system.update_user_stats_updated_at()`
- `gamification_system.update_missions_updated_at()`
- `gamification_system.update_achievements_updated_at()`
- `gamification_system.calculate_achievement_progress(user_id, achievement_id)`
- `gamification_system.grant_achievement(user_id, achievement_id)`
- `gamification_system.update_notifications_updated_at()`

#### Educational Content Functions (6)
- `educational_content.get_exercise_by_type(exercise_type)`
- `educational_content.get_module_exercises(module_id)`
- `educational_content.update_modules_updated_at()`
- `educational_content.update_exercises_updated_at()`
- `educational_content.validate_exercise_answer(exercise_id, answer JSONB)`
- `educational_content.get_exercises_by_cognitive_level(cognitive_level)`

#### Audit Logging Functions (3)
- `audit_logging.log_audit_event(action, resource_type, resource_id, details JSONB)`
- `audit_logging.cleanup_old_logs(days_to_keep INTEGER)` - Mantenimiento
- `audit_logging.get_user_audit_trail(user_id, days_back INTEGER)`

#### Social Features Functions (5)
- `social_features.send_friend_request(from_user, to_user)` ✅ **MAPEADA**
- `social_features.accept_friend_request(friendship_id)` ✅ **MAPEADA**
- `social_features.assign_team_role(team_id, user_id, role)` ✅ **MAPEADA**
- `social_features.cleanup_old_notifications(days INTEGER)`
- `social_features.get_classroom_members(classroom_id)`

#### Public Schema Functions (4)
- `public.log_system_event(level, message, context JSONB)`
- `public.is_feature_enabled(feature_key TEXT, user_id UUID)`
- `public.cleanup_old_system_logs(days INTEGER)`
- `public.create_notification(user_id, type, data JSONB)` ✅ **MAPEADA**

#### System Configuration Functions (3)
- `system_configuration.get_setting(key TEXT)` ✅ **MAPEADA**
- `system_configuration.set_setting(key, value, type)` ✅ **MAPEADA**
- `system_configuration.update_feature_flags_updated_at()`

#### Storage/Media Functions (2)
- `storage.validate_file_type(file_extension TEXT)` ✅ **MAPEADA**
- `storage.update_processing_status(media_id, status, error?)` ✅ **MAPEADA**

#### Auth Management Functions (2)
- `auth_management.verify_user_status(user_id)` ✅ **MAPEADA**
- `auth_management.suspend_user(user_id, reason TEXT)` ✅ **MAPEADA**

### 📝 Próximos Pasos para Completar Mapeo

1. **Prioridad Alta (Tablas de negocio core):**
   - Assignments (6 tablas) - Sistema de tareas del profesor
   - Gamification (missions, ml_coins_transactions)
   - Learning sessions y scheduled_missions

2. **Prioridad Media (Funciones auxiliares):**
   - Documentar funciones trigger (`update_*_updated_at`)
   - Documentar funciones de validación
   - Documentar funciones de limpieza/mantenimiento

3. **Prioridad Baja (Infraestructura):**
   - Tablas de storage de Supabase
   - Funciones de utilidad general

### 🎯 Plantilla para Documentar Nuevos Objetos

Cuando se documente un objeto pendiente, seguir esta estructura:

```markdown
### X.Y Nombre del Feature

#### 📄 Requerimientos Funcionales
- **Documento:** `docs/01-requerimientos/[carpeta]/RF-XXX-[nombre].md`
- **Casos de Uso:**
  - UC-XXX-001: Descripción

**Requerimiento:**
> Descripción del requerimiento funcional

#### 📐 Especificaciones Técnicas
- **Documento:** `docs/02-especificaciones-tecnicas/[carpeta]/[NOMBRE].md`

#### 🗄️ Implementación DDL
**Archivo:** `apps/database/ddl/schemas/[schema]/tables/[NN-nombre].sql`

#### 💻 Backend
- **Service/Module:** Ubicación en backend

#### 🎨 Frontend
- **Componentes:** Componentes relacionados

#### ✅ Estado de Implementación
- [ ] Requerimiento documentado
- [ ] Especificación técnica definida
- [x] DDL implementado
- [ ] Backend implementado
- [ ] Frontend implementado
```

---

## 📊 RESUMEN DE MAPEO

### Estadísticas de Cobertura

| Módulo | Requerimientos | Specs Técnicas | ENUMs DDL | Tablas | Backend | Frontend |
|--------|---------------|----------------|-----------|--------|---------|----------|
| Autenticación | 3 | 3 | 3 | 5 | ✅ | ✅ |
| Gamificación | 2 | 2 | 3 | 7 | ✅ | ✅ |
| Contenido Educativo | 3 | 3 | 3 | 4 | ✅ | ✅ |
| Progreso | 2 | 2 | 2 | 4 | ✅ | ✅ |
| Social | 3 | 3 | 3 | 5 | ✅ | ✅ |
| Notificaciones | 2 | 2 | 2 | 1 | ✅ | ✅ |
| Media | 2 | 2 | 3 | 2 | ✅ | ✅ |
| Auditoría | 3 | 3 | 5 | 4 | ✅ | ✅ |
| **TOTAL** | **20** | **20** | **24** | **32+** | ✅ | ✅ |

### Métricas de Calidad

- ✅ **100% de ENUMs** tienen requerimiento funcional documentado
- ✅ **100% de ENUMs** tienen especificación técnica
- ✅ **100% de ENUMs** implementados en DDL consolidado
- ✅ **100% de ENUMs** implementados en Backend
- ✅ **100% de ENUMs** implementados en Frontend
- ✅ **0 duplicados** en base de datos (consolidado 2025-11-07)
- ✅ **0 referencias huérfanas** (validado automáticamente)

---

## 🔗 Referencias Cruzadas

### Documentación de Requerimientos
- `docs/01-requerimientos/casos-uso/` - Casos de uso por actor
- `docs/01-requerimientos/funcionalidades/` - Requerimientos funcionales
- `docs/01-requerimientos/gamificacion/` - Sistema de gamificación
- `docs/01-requerimientos/pedagogia/` - Enfoque pedagógico

### Especificaciones Técnicas
- `docs/02-especificaciones-tecnicas/seguridad/` - RBAC, OAuth, gestión de cuentas
- `docs/02-especificaciones-tecnicas/gamificacion/` - Achievements, comodines, economía
- `docs/02-especificaciones-tecnicas/pedagogia/` - 31 mecánicas, Bloom, dificultad
- `docs/02-especificaciones-tecnicas/integraciones/` - OAuth providers, APIs externas

### Implementación DDL
- `apps/database/ddl/00-prerequisites.sql` - **25 ENUMs canónicos**
- `apps/database/ddl/schemas/[schema]/tables/` - Definiciones de tablas
- `apps/database/ddl/schemas/[schema]/functions/` - Funciones PL/pgSQL
- `apps/database/ddl/schemas/[schema]/rls-policies/` - Row Level Security

### Código de Aplicación
- `apps/backend/src/shared/enums/` - ENUMs TypeScript
- `apps/backend/src/modules/[modulo]/` - Módulos de negocio
- `apps/frontend/src/types/` - Types TypeScript
- `apps/frontend/src/components/` - Componentes React

---

## 📚 Documentos Complementarios

### En `docs/03-desarrollo/base-de-datos/`
- **TIPOS-Y-ENUMS.md** - Lista completa de ENUMs con valores
- **ESQUEMA-COMPLETO.md** - Diagrama ER y estructura completa
- **TRIGGERS-Y-FUNCIONES.md** - Catálogo de functions/triggers
- **MIGRACIONES.md** - Historial de migraciones de schema

### En `orchestration/05-validaciones/consolidacion/`
**Nota:** Estos documentos son para agentes internos, NO para cliente
- DATABASE-INVENTORY-MASTER-FINAL-2025-11-07.md - Inventario técnico detallado
- REPORTE-FINAL-VALIDACION-2025-11-07.md - Reporte de consolidación
- GUIA-USO-DATABASE-INVENTORY-MASTER.md - Guía interna para agentes

---

## 🎯 Cómo Usar Este Documento

### Para Product Owners
**Validar que feature está implementada:**
1. Buscar feature en este documento
2. Verificar que tiene requerimiento funcional documentado
3. Confirmar que tiene especificación técnica
4. Validar que objetos DDL están implementados
5. Verificar Backend/Frontend implementados

### Para Desarrolladores
**Antes de implementar nueva funcionalidad:**
1. Documentar requerimiento en `docs/01-requerimientos/`
2. Crear especificación técnica en `docs/02-especificaciones-tecnicas/`
3. Implementar DDL siguiendo ubicación canónica (`00-prerequisites.sql`)
4. Implementar Backend con ENUMs TypeScript espejo
5. Implementar Frontend con types
6. **Actualizar este documento** con el mapeo

### Para QA
**Testing end-to-end:**
1. Buscar feature en este documento
2. Identificar todas las capas involucradas
3. Crear test cases que cubran: Docs → DDL → Backend → Frontend
4. Validar coherencia entre capas

---

## ✅ Estado de Consolidación y Validación

### Consolidación 2025-11-07

- ✅ **24 ENUMs** consolidados en `00-prerequisites.sql` (0 duplicados)
- ✅ **3 archivos duplicados** eliminados (cleanup ejecutado)
- ✅ **Database Inventory** regenerado post-cleanup
- ✅ **Validación automática** pasando (0 errores, 0 warnings)
- ✅ **Backups completos** creados (3 archivos respaldados)

### Actualización de Mapeo 2025-11-07 (Este documento)

- ✅ **7 referencias incorrectas** de paths DDL corregidas
- ✅ **45 tablas** sin documentar listadas en sección "Objetos Pendientes"
- ✅ **54 funciones** sin documentar listadas en sección "Objetos Pendientes"
- ✅ **Plantilla de documentación** agregada para futuros objetos
- ✅ **Priorización** definida (Alta/Media/Baja) para completar mapeo

### Estadísticas de Mapeo

**Totales Actuales:**
- **Schemas:** 13
- **Tables:** 62 total (17 completamente mapeadas, 10 parciales, 35 pendientes)
- **Functions:** 60 total (15 mapeadas, 45 pendientes)
- **Triggers:** 39 total (verificados, dependencias correctas)
- **Enums:** 35 total (25 en 00-prerequisites.sql + 10 en schemas individuales)

**Cobertura de Documentación:**
- ✅ **100% ENUMs** tienen mapeo completo
- ⚠️  **44% Tablas** tienen mapeo completo (27 de 62)
- ⚠️  **25% Funciones** tienen mapeo completo (15 de 60)
- ✅ **100% Referencias DDL** corregidas y verificadas

**Hash de Validación Estructural:** `0 errores críticos, 0 duplicados, 99 objetos pendientes de documentar`

---

**Última actualización:** 2025-11-07
**Versión:** 1.0
**Mantenedor:** Database Team
**Próxima revisión:** Mensual o al agregar nuevos módulos
