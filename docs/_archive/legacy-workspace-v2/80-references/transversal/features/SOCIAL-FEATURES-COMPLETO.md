# Características Sociales - Schema: social_features

**Schema:** `social_features`
**Propósito:** Funcionalidades sociales y colaborativas de GAMILIT
**Total de tablas:** 7
**Estado:** ✅ Implementado
**Última actualización:** 2025-11-08

---

## 📋 Descripción

El schema `social_features` implementa todas las funcionalidades sociales y colaborativas de la plataforma GAMILIT, incluyendo:
- 🏫 Escuelas e instituciones educativas
- 👥 Aulas virtuales (classrooms)
- 🤝 Sistema de amistades
- 🎯 Equipos colaborativos
- 🏆 Desafíos entre equipos

---

## 📊 TABLAS DEL SCHEMA (7)

| Tabla | Propósito | Registros estimados | Estado Docs |
|-------|-----------|---------------------|-------------|
| **schools** | Escuelas/instituciones | ~100-1000 | ⚠️ Parcial |
| **classrooms** | Aulas virtuales | ~1000-10000 | ✅ EXT-001 |
| **classroom_members** | Estudiantes en aulas | ~10000-100000 | ✅ EXT-001 |
| **friendships** | Amistades entre usuarios | ~50000+ | ⚠️ Parcial |
| **teams** | Equipos de estudiantes | ~5000-20000 | ⚠️ Parcial |
| **team_members** | Miembros de equipos | ~20000-80000 | ⚠️ Parcial |
| **team_challenges** | Desafíos entre equipos | ~1000-5000 | ⚠️ Parcial |

---

## 🏫 TABLA: schools

**Archivo:** `apps/database/ddl/schemas/social_features/tables/02-schools.sql`

### Propósito
Gestión de escuelas e instituciones educativas en el sistema multi-tenant.

### Columnas Principales
```sql
CREATE TABLE social_features.schools (
    id UUID PRIMARY KEY,
    tenant_id UUID NOT NULL,              -- Tenant propietario
    name TEXT NOT NULL,                   -- Nombre de la escuela
    code TEXT,                            -- Código único de escuela
    short_name TEXT,                      -- Nombre corto/acrónimo
    description TEXT,

    -- Información de contacto
    address TEXT,
    city TEXT,
    region TEXT,
    country TEXT DEFAULT 'México',
    postal_code TEXT,
    phone TEXT,
    email TEXT,
    website TEXT,

    -- Personal administrativo
    principal_id UUID,                    -- Director
    administrative_contact_id UUID,       -- Contacto administrativo

    -- Configuración académica
    academic_year TEXT,                   -- Año académico actual
    semester_system BOOLEAN DEFAULT true, -- Sistema semestral o anual
    grade_levels TEXT[] DEFAULT ARRAY['6','7','8'], -- Grados que imparte
    settings JSONB DEFAULT '{}',

    -- Capacidades
    max_students INTEGER DEFAULT 1000,
    max_teachers INTEGER DEFAULT 100,
    current_students_count INTEGER DEFAULT 0,
    current_teachers_count INTEGER DEFAULT 0,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,    -- Escuela verificada
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);
```

### Características
- ✅ Multi-tenancy (una escuela por tenant)
- ✅ Verificación de instituciones
- ✅ Contadores automáticos de estudiantes y maestros
- ✅ Configuración flexible por escuela
- ✅ Soporta diferentes sistemas académicos

### Casos de Uso
1. **Registro de Escuela:** Director registra su institución
2. **Gestión Administrativa:** Asignación de personal
3. **Configuración Académica:** Definir grados, semestres
4. **Estadísticas:** Tracking de población estudiantil

### Relaciones
- `tenant_id` → `auth_management.tenants`
- `principal_id` → `auth.users` (rol: admin_teacher)
- `classrooms.school_id` → `schools.id`

### RLS Policies
- Directores pueden ver/editar su escuela
- Maestros pueden ver escuelas donde trabajan
- Super admins pueden ver todas

---

## 👥 TABLA: classrooms

**Archivo:** `apps/database/ddl/schemas/social_features/tables/03-classrooms.sql`

### Propósito
Aulas virtuales donde maestros organizan estudiantes y asignan tareas.

### Columnas Principales
```sql
CREATE TABLE social_features.classrooms (
    id UUID PRIMARY KEY,
    school_id UUID,                       -- Escuela (opcional)
    tenant_id UUID NOT NULL,
    teacher_id UUID NOT NULL,             -- Maestro responsable

    name TEXT NOT NULL,                   -- "6to A - Matemáticas"
    code TEXT UNIQUE,                     -- Código de invitación
    description TEXT,
    subject TEXT,                         -- Materia
    grade_level TEXT,                     -- Grado escolar
    academic_year TEXT,
    semester TEXT,

    -- Capacidad
    max_students INTEGER DEFAULT 40,
    current_members_count INTEGER DEFAULT 0,

    -- Configuración
    allow_self_enrollment BOOLEAN DEFAULT false,
    require_approval BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_archived BOOLEAN DEFAULT false,

    -- Gamificación
    total_xp INTEGER DEFAULT 0,
    total_ml_coins INTEGER DEFAULT 0,

    settings JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',

    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);
```

### Características
- ✅ Códigos de invitación únicos
- ✅ Auto-inscripción opcional
- ✅ Gamificación grupal
- ✅ Archivado de clases pasadas
- ✅ Multi-materia y multi-grado

### Casos de Uso
1. **Crear Aula:** Maestro crea aula para su curso
2. **Invitar Estudiantes:** Compartir código de aula
3. **Organización:** Agrupar por materia/grado
4. **Seguimiento:** Métricas de progreso grupal

### Relaciones
- `school_id` → `schools.id`
- `teacher_id` → `auth.users` (rol: admin_teacher)
- `tenant_id` → `auth_management.tenants`

### Documentación Relacionada
- ✅ **EXT-001:** Portal de Maestros (US-PM-001a, US-PM-001b)
- ✅ Funciones: `assign_to_classroom()`, `calculate_classroom_progress()`

---

## 📚 TABLA: classroom_members

**Archivo:** `apps/database/ddl/schemas/social_features/tables/04-classroom_members.sql`

### Propósito
Relación estudiante-aula con información de inscripción.

### Columnas Principales
```sql
CREATE TABLE social_features.classroom_members (
    id UUID PRIMARY KEY,
    classroom_id UUID NOT NULL,
    user_id UUID NOT NULL,               -- Estudiante

    -- Inscripción
    enrollment_method TEXT,              -- 'invite','code','bulk','manual'
    enrolled_by UUID,                    -- Maestro que inscribió
    enrolled_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    -- Estado
    status TEXT DEFAULT 'active',        -- 'active','dropped','completed'
    is_active BOOLEAN DEFAULT true,

    -- Seguimiento
    attendance_rate NUMERIC(5,2),        -- % asistencia
    participation_score INTEGER,
    last_activity_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    UNIQUE(classroom_id, user_id)
);
```

### Características
- ✅ Constraint de unicidad (un estudiante una vez por aula)
- ✅ Tracking de método de inscripción
- ✅ Métricas de participación
- ✅ Estado de inscripción (activo/abandonado/completado)

### Casos de Uso
1. **Inscripción:** Estudiante se une a aula
2. **Gestión:** Maestro ve lista de estudiantes
3. **Analytics:** Asistencia y participación
4. **Graduación:** Marcar como completado al fin de curso

### Triggers
- `update_classroom_member_count()` - Actualiza contador en classroom

### Documentación Relacionada
- ✅ **EXT-001:** Portal de Maestros (US-PM-001b)

---

## 🤝 TABLA: friendships

**Archivo:** `apps/database/ddl/schemas/social_features/tables/01-friendships.sql`

### Propósito
Sistema de amistades entre estudiantes para interacción social.

### Columnas Principales
```sql
CREATE TABLE social_features.friendships (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL,               -- Usuario que envía solicitud
    friend_id UUID NOT NULL,             -- Usuario receptor

    status VARCHAR(20) DEFAULT 'pending', -- 'pending','accepted','rejected','blocked'

    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    CONSTRAINT friendships_check CHECK (user_id <> friend_id),
    CONSTRAINT friendships_status_check CHECK (
        status IN ('pending', 'accepted', 'rejected', 'blocked')
    ),

    UNIQUE(user_id, friend_id)
);
```

### Estados de Amistad

| Estado | Descripción |
|--------|-------------|
| `pending` | Solicitud enviada, esperando respuesta |
| `accepted` | Amigos confirmados |
| `rejected` | Solicitud rechazada |
| `blocked` | Usuario bloqueado |

### Características
- ✅ Constraint para evitar auto-amistad
- ✅ Unicidad bidireccional
- ✅ Estados bien definidos
- ✅ Sistema de bloqueo

### Casos de Uso
1. **Enviar Solicitud:** Estudiante envía solicitud de amistad
2. **Aceptar/Rechazar:** Receptor responde a solicitud
3. **Ver Amigos:** Lista de amigos aceptados
4. **Bloquear:** Prevenir interacción con usuario específico

### Funcionalidad Social
- Ver progreso de amigos
- Comparar logros
- Desafíos entre amigos
- Chat/mensajería (futuro)

### RLS Policies
- Solo usuarios involucrados pueden ver la relación
- Solo receptor puede cambiar estado de pending
- Solo user_id puede bloquear

---

## 🎯 TABLA: teams

**Archivo:** `apps/database/ddl/schemas/social_features/tables/05-teams.sql`

### Propósito
Equipos colaborativos de estudiantes para gamificación y aprendizaje grupal.

### Columnas Principales
```sql
CREATE TABLE social_features.teams (
    id UUID PRIMARY KEY,
    classroom_id UUID,                    -- Aula (opcional)
    tenant_id UUID NOT NULL,

    -- Identidad del equipo
    name TEXT NOT NULL,
    description TEXT,
    motto TEXT,                           -- Lema del equipo
    color_primary TEXT DEFAULT '#3B82F6',
    color_secondary TEXT DEFAULT '#10B981',
    avatar_url TEXT,
    banner_url TEXT,
    badges JSONB DEFAULT '[]',            -- Insignias del equipo

    -- Liderazgo
    creator_id UUID NOT NULL,             -- Fundador
    leader_id UUID,                       -- Líder actual

    -- Membresía
    team_code TEXT UNIQUE,                -- Código de invitación
    max_members INTEGER DEFAULT 5,
    current_members_count INTEGER DEFAULT 0,

    -- Configuración
    is_public BOOLEAN DEFAULT false,
    allow_join_requests BOOLEAN DEFAULT true,
    require_approval BOOLEAN DEFAULT true,

    -- Estadísticas de gamificación
    total_xp INTEGER DEFAULT 0,
    total_ml_coins INTEGER DEFAULT 0,
    modules_completed INTEGER DEFAULT 0,
    achievements_earned INTEGER DEFAULT 0,

    -- Estado
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    founded_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    last_activity_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);
```

### Características
- ✅ Personalización visual (colores, avatar, banner)
- ✅ Sistema de liderazgo
- ✅ Gamificación colaborativa (XP y coins compartidos)
- ✅ Control de privacidad y membresía
- ✅ Tracking de logros grupales

### Casos de Uso
1. **Formar Equipo:** Estudiantes crean equipo de estudio
2. **Unirse a Equipo:** Mediante código o solicitud
3. **Competir:** Desafíos contra otros equipos
4. **Colaborar:** Completar módulos juntos
5. **Ranking:** Leaderboard de equipos

### Gamificación de Equipos
```
XP del Equipo = Suma de XP individual de miembros
ML Coins del Equipo = Suma de coins de miembros
Módulos Completados = Módulos que TODOS completaron
Achievements = Logros grupales especiales
```

### Relaciones
- `classroom_id` → `classrooms.id` (opcional - equipos pueden ser inter-aulas)
- `creator_id` → `auth.users`
- `leader_id` → `auth.users`

---

## 👤 TABLA: team_members

**Archivo:** `apps/database/ddl/schemas/social_features/tables/06-team_members.sql`

### Propósito
Relación estudiante-equipo con roles y contribuciones.

### Columnas Estimadas
```sql
CREATE TABLE social_features.team_members (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL,
    user_id UUID NOT NULL,

    -- Rol en el equipo
    role TEXT DEFAULT 'member',          -- 'member','leader','co-leader'

    -- Ingreso
    join_method TEXT,                    -- 'invite','code','request','founding'
    joined_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    invited_by UUID,

    -- Contribución
    xp_contributed INTEGER DEFAULT 0,
    ml_coins_contributed INTEGER DEFAULT 0,
    modules_completed_count INTEGER DEFAULT 0,

    -- Estado
    status TEXT DEFAULT 'active',        -- 'active','inactive','kicked','left'
    is_active BOOLEAN DEFAULT true,
    last_active_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),

    UNIQUE(team_id, user_id)
);
```

### Roles en Equipos

| Rol | Permisos |
|-----|----------|
| `founding` | Fundador original (inmutable) |
| `leader` | Líder actual, puede invitar/expulsar |
| `co-leader` | Asistente del líder |
| `member` | Miembro regular |

### Contribuciones
- Se trackean contribuciones individuales al equipo
- Métricas de participación
- Identificar miembros más activos

---

## 🏆 TABLA: team_challenges

**Archivo:** `apps/database/ddl/schemas/social_features/tables/07-team_challenges.sql`

### Propósito
Desafíos y competencias entre equipos.

### Columnas Estimadas
```sql
CREATE TABLE social_features.team_challenges (
    id UUID PRIMARY KEY,

    -- Equipos participantes
    challenger_team_id UUID NOT NULL,    -- Equipo retador
    challenged_team_id UUID NOT NULL,    -- Equipo retado

    -- Desafío
    challenge_type TEXT,                 -- 'module_race','xp_battle','quiz_duel'
    challenge_name TEXT,
    description TEXT,
    rules JSONB DEFAULT '{}',

    -- Condiciones
    module_id UUID,                      -- Si es desafío de módulo específico
    target_score INTEGER,                -- Puntaje objetivo
    duration_minutes INTEGER,            -- Duración del desafío

    -- Estado
    status TEXT DEFAULT 'pending',       -- 'pending','accepted','in_progress','completed','cancelled'

    -- Resultado
    winner_team_id UUID,
    challenger_score INTEGER,
    challenged_score INTEGER,

    -- Premio
    reward_xp INTEGER,
    reward_ml_coins INTEGER,
    reward_badges JSONB DEFAULT '[]',

    -- Fechas
    challenged_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    accepted_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,

    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT gamilit.now_mexico(),
    updated_at TIMESTAMPTZ DEFAULT gamilit.now_mexico()
);
```

### Tipos de Desafíos

| Tipo | Descripción |
|------|-------------|
| `module_race` | Carrera para completar módulo |
| `xp_battle` | Competencia de XP en tiempo límite |
| `quiz_duel` | Duelo de preguntas |
| `achievement_hunt` | Caza de logros específicos |

### Flujo de Desafío
1. Equipo A reta a Equipo B
2. Equipo B acepta o rechaza
3. Desafío inicia (in_progress)
4. Al terminar, se determina ganador
5. Se otorgan recompensas

---

## 🔧 FUNCIONES DEL SCHEMA

### 1. `cleanup_old_notifications()`

**Archivo:** `apps/database/ddl/schemas/social_features/functions/cleanup_old_notifications.sql`

**Propósito:** Limpia notificaciones antiguas (más de X días)

**Firma:**
```sql
CREATE OR REPLACE FUNCTION social_features.cleanup_old_notifications(days INTEGER DEFAULT 90)
RETURNS INTEGER
```

**Uso:**
```sql
-- Limpiar notificaciones de más de 90 días
SELECT social_features.cleanup_old_notifications(90);
-- Retorna: número de notificaciones eliminadas
```

---

## 📊 VISTAS Y MATERIALIZED VIEWS

### Vistas Sugeridas (no implementadas aún)

1. **team_leaderboard** - Ranking de equipos por XP
2. **classroom_social_graph** - Grafo de relaciones en aula
3. **friendship_stats** - Estadísticas de amistades por usuario
4. **active_challenges** - Desafíos activos del momento

---

## 🔐 SEGURIDAD (RLS)

**Archivo:** `apps/database/ddl/schemas/social_features/rls-policies/*.sql`

### Políticas Implementadas

1. **schools:** Solo directores y admins
2. **classrooms:** Maestros ven sus aulas, estudiantes ven aulas donde están
3. **classroom_members:** Ver solo miembros de aulas propias
4. **friendships:** Solo usuarios involucrados
5. **teams:** Miembros ven detalles completos, otros ven resumen público
6. **team_members:** Miembros del equipo
7. **team_challenges:** Equipos participantes y espectadores (si público)

---

## 📈 INTERDEPENDENCIAS

### Schema Dependencies

```
social_features depende de:
├── auth_management (users, profiles, tenants)
├── gamification_system (achievements, user_stats)
└── educational_content (modules para team challenges)

social_features es usado por:
├── progress_tracking (analytics por classroom)
├── gamification_system (logros sociales)
└── admin_dashboard (vistas de escuelas/aulas)
```

---

## 🎯 CASOS DE USO COMPLETOS

### Caso 1: Escuela se Registra
1. Super admin crea tenant
2. Director crea school
3. Director crea classrooms
4. Director invita maestros
5. Maestros invitan estudiantes a classrooms

### Caso 2: Estudiantes Forman Equipo
1. Estudiante A crea team
2. Envía invitaciones a compañeros
3. Compañeros aceptan
4. Equipo participa en challenges
5. Ganan rewards grupales

### Caso 3: Competencia entre Equipos
1. Team A reta a Team B
2. Team B acepta desafío
3. Ambos completan módulos
4. Sistema determina ganador
5. Rewards distribuidos

---

## 📝 DOCUMENTACIÓN RELACIONADA

### Épicas que Usan social_features

| Épica | Tablas Usadas | Funcionalidad |
|-------|---------------|---------------|
| **EAI-001** | schools (indirecto) | Multi-tenancy |
| **EXT-001** | classrooms, classroom_members | Portal de Maestros |
| **EXT-004** | friendships, teams | Perfiles Sociales |
| *(Pendiente)* | teams, team_challenges | Gamificación Social |

### Referencias Cruzadas
- ✅ **TRACEABILITY:** `docs/03-fase-extensiones/EXT-001-portal-maestros/implementacion/TRACEABILITY.yml`
- ⚠️ **PENDIENTE:** RF para friendships, teams, team_challenges

---

## 🚀 PRÓXIMOS PASOS

### Documentación Faltante

1. **Crear RFs:**
   - RF-SOC-001: Sistema de Amistades
   - RF-SOC-002: Equipos Colaborativos
   - RF-SOC-003: Desafíos entre Equipos
   - RF-SOC-004: Gestión de Escuelas

2. **Crear TRACEABILITY:**
   - Épica EXT-002 o EXT-003 para funcionalidades sociales
   - Mapear tablas faltantes

3. **Backend:**
   - Documentar servicios sociales
   - APIs de teams, friendships, challenges

4. **Frontend:**
   - Componentes de perfil social
   - UI de equipos
   - Pantalla de desafíos

---

## 🔍 ANÁLISIS DE COBERTURA

| Componente | Implementado | Documentado | Gap |
|------------|--------------|-------------|-----|
| **schools** | ✅ | ⚠️ Parcial | Falta RF |
| **classrooms** | ✅ | ✅ EXT-001 | Completo |
| **classroom_members** | ✅ | ✅ EXT-001 | Completo |
| **friendships** | ✅ | ⚠️ Parcial | Falta RF/ET |
| **teams** | ✅ | ⚠️ Parcial | Falta RF/ET |
| **team_members** | ✅ | ⚠️ Parcial | Falta RF/ET |
| **team_challenges** | ✅ | ⚠️ Parcial | Falta RF/ET |

**Cobertura actual:** ~30% completo, ~70% parcial

---

**Creado:** 2025-11-08
**Tipo:** Documentación consolidada
**Total de tablas:** 7
**Estado:** ✅ Documentación básica completa, ⚠️ Falta TRACEABILITY formal
