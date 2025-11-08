# Datos Seed (Iniciales y de Prueba) - GAMILIT Platform

**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
**Base de datos:** PostgreSQL 14+
**Última actualización:** 2025-10-27

---

## Resumen Ejecutivo

- **Archivos de Seed:** 9 archivos principales
- **Achievements:** 30+ logros predefinidos
- **Módulos Educativos:** 5 módulos de Marie Curie
- **Ejercicios:** 50+ ejercicios (múltiples tipos)
- **Usuarios Demo:** 10+ usuarios de prueba
- **Configuración del Sistema:** 20+ settings

---

## 1. Estrategia de Datos Seed

### 1.1 Tipos de Datos Seed

#### Datos de Producción (Production Seed)
**Propósito:** Datos necesarios para que la aplicación funcione.

**Incluye:**
- Achievements base
- Configuración del sistema
- Módulos educativos de Marie Curie
- Ejercicios estándar

**Cuándo aplicar:** Siempre en producción

---

#### Datos de Desarrollo (Development Seed)
**Propósito:** Datos para testing y desarrollo local.

**Incluye:**
- Usuarios demo
- Datos de prueba
- Progreso de usuarios simulados

**Cuándo aplicar:** Solo en desarrollo/staging

---

### 1.2 Orden de Ejecución

```bash
# 1. Achievements (SIEMPRE PRIMERO)
psql -f seed_data/01_achievements_seed.sql

# 2. Configuración del Sistema
psql -f seed_data/02_system_config_seed.sql

# 3. Módulos Educativos
psql -f seed_data/03_educational_modules_seed.sql

# 4. Datos de Demo (OPCIONAL - solo dev/staging)
psql -f seed_data/04_demo_users_and_data_seed.sql

# 5. Contenido Específico (enhancements)
psql -f seed_data/05_enhanced_crossword.sql
psql -f seed_data/06_enhanced_timeline_update.sql
psql -f seed_data/07_enhanced_wordsearch_update.sql
psql -f seed_data/08_module1_marie_curie_exercises_update.sql
psql -f seed_data/09_module1_update_simple.sql
psql -f seed_data/09_enrich_exercises_questions.sql
```

---

## 2. Archivo 01: Achievements Seed

**Archivo:** `01_achievements_seed.sql`
**Propósito:** Logros base del sistema de gamificación.

### 2.1 Categorías de Achievements

#### Progress (Progreso)
```sql
INSERT INTO gamification_system.achievements (
    name,
    description,
    icon,
    category,
    rarity,
    difficulty_level,
    conditions,
    rewards
) VALUES
(
    'Primer Paso',
    'Completaste tu primer ejercicio. ¡El viaje comienza!',
    'star',
    'progress',
    'common',
    'beginner',
    '{"type": "progress", "requirements": {"exercises_completed": 1}}'::jsonb,
    '{"ml_coins": 10, "xp": 10, "badge": "first_exercise"}'::jsonb
),
(
    'Aprendiz Dedicado',
    'Has completado 10 ejercicios. ¡Tu dedicación se nota!',
    'medal',
    'progress',
    'common',
    'beginner',
    '{"type": "progress", "requirements": {"exercises_completed": 10}}'::jsonb,
    '{"ml_coins": 50, "xp": 50, "badge": "10_exercises"}'::jsonb
),
(
    'Estudiante Comprometido',
    '¡50 ejercicios completados! Tu compromiso es admirable.',
    'trophy',
    'progress',
    'rare',
    'intermediate',
    '{"type": "progress", "requirements": {"exercises_completed": 50}}'::jsonb,
    '{"ml_coins": 100, "xp": 150, "badge": "50_exercises"}'::jsonb
);
```

**Total:** ~8 achievements de progreso

---

#### Streak (Rachas)
```sql
(
    'Racha de Fuego',
    '¡3 días consecutivos de aprendizaje! Mantén la llama encendida.',
    'fire',
    'streak',
    'common',
    'beginner',
    '{"type": "streak", "requirements": {"days": 3}}'::jsonb,
    '{"ml_coins": 25, "xp": 30, "badge": "streak_3"}'::jsonb
),
(
    'Semana de Dedicación',
    '7 días consecutivos. ¡Tu disciplina es impresionante!',
    'calendar',
    'streak',
    'rare',
    'intermediate',
    '{"type": "streak", "requirements": {"days": 7}}'::jsonb,
    '{"ml_coins": 75, "xp": 100, "badge": "streak_7"}'::jsonb
),
(
    'Mes Imparable',
    '30 días consecutivos. ¡Eres una leyenda!',
    'crown',
    'streak',
    'legendary',
    'advanced',
    '{"type": "streak", "requirements": {"days": 30}}'::jsonb,
    '{"ml_coins": 300, "xp": 500, "badge": "streak_30"}'::jsonb
);
```

**Total:** ~5 achievements de racha

---

#### Completion (Completación)
```sql
(
    'Primer Módulo Completo',
    'Completaste tu primer módulo completo. ¡Excelente trabajo!',
    'book',
    'completion',
    'common',
    'beginner',
    '{"type": "completion", "requirements": {"modules_completed": 1}}'::jsonb,
    '{"ml_coins": 100, "xp": 100, "badge": "first_module"}'::jsonb
),
(
    'Perfeccionista',
    'Completaste un módulo con 100% de precisión. ¡Impecable!',
    'crown',
    'completion',
    'epic',
    'advanced',
    '{"type": "completion", "requirements": {"module_score": 100}}'::jsonb,
    '{"ml_coins": 200, "xp": 250, "badge": "perfect_module"}'::jsonb
);
```

**Total:** ~6 achievements de completación

---

#### Social (Interacción Social)
```sql
(
    'Buen Compañero',
    'Agregaste tu primer amigo. ¡El aprendizaje es mejor en compañía!',
    'users',
    'social',
    'common',
    'beginner',
    '{"type": "social", "requirements": {"friends_added": 1}}'::jsonb,
    '{"ml_coins": 20, "xp": 15, "badge": "first_friend"}'::jsonb
),
(
    'Líder del Equipo',
    'Creaste un equipo de estudio. ¡Liderazgo en acción!',
    'flag',
    'social',
    'rare',
    'intermediate',
    '{"type": "social", "requirements": {"teams_created": 1}}'::jsonb,
    '{"ml_coins": 50, "xp": 40, "badge": "team_leader"}'::jsonb
);
```

**Total:** ~4 achievements sociales

---

#### Special (Especiales)
```sql
(
    'Madrugador',
    'Completaste ejercicios antes de las 6:00 AM. ¡Dedicación matutina!',
    'sunrise',
    'special',
    'rare',
    'intermediate',
    '{"type": "special", "requirements": {"early_morning_sessions": 5}}'::jsonb,
    '{"ml_coins": 75, "xp": 50, "badge": "early_bird"}'::jsonb
),
(
    'Noctámbulo Estudioso',
    'Estudiaste después de las 10:00 PM. ¡Esfuerzo nocturno!',
    'moon',
    'special',
    'rare',
    'intermediate',
    '{"type": "special", "requirements": {"late_night_sessions": 5}}'::jsonb,
    '{"ml_coins": 75, "xp": 50, "badge": "night_owl"}'::jsonb
);
```

**Total:** ~3 achievements especiales

---

#### Mastery (Maestría)
```sql
(
    'Experto en Marie Curie',
    'Dominaste todos los módulos de Marie Curie. ¡Conocimiento profundo!',
    'graduation-cap',
    'mastery',
    'legendary',
    'advanced',
    '{"type": "mastery", "requirements": {
        "modules_completed": 5,
        "average_score": 90,
        "topic": "marie_curie"
    }}'::jsonb,
    '{"ml_coins": 500, "xp": 1000, "badge": "marie_curie_master", "certificate": true}'::jsonb
);
```

**Total:** ~4 achievements de maestría

---

### 2.2 Estructura de Conditions y Rewards

#### Conditions (JSONB)
```json
{
    "type": "progress | streak | completion | social | special | mastery",
    "requirements": {
        "exercises_completed": 10,
        "days": 7,
        "modules_completed": 1,
        "average_score": 90,
        "topic": "marie_curie"
    }
}
```

#### Rewards (JSONB)
```json
{
    "ml_coins": 50,
    "xp": 100,
    "badge": "achievement_badge_id",
    "certificate": true,
    "special_item": "avatar_frame_gold"
}
```

---

## 3. Archivo 02: System Config Seed

**Archivo:** `02_system_config_seed.sql`
**Propósito:** Configuración global del sistema.

### 3.1 Categorías de Settings

#### General
```sql
INSERT INTO system_configuration.system_settings (
    setting_key,
    setting_category,
    setting_value,
    value_type,
    display_name,
    description
) VALUES
(
    'platform_name',
    'general',
    'GLIT - Gamified Learning Interactive Toolkit',
    'string',
    'Nombre de la Plataforma',
    'Nombre oficial de la plataforma educativa'
),
(
    'default_timezone',
    'general',
    'America/Mexico_City',
    'string',
    'Zona Horaria por Defecto',
    'Zona horaria predeterminada para la plataforma'
),
(
    'default_language',
    'general',
    'es',
    'string',
    'Idioma por Defecto',
    'Idioma predeterminado de la interfaz'
);
```

---

#### Gamification
```sql
(
    'ml_coins_welcome_bonus',
    'gamification',
    '100',
    'number',
    'ML Coins de Bienvenida',
    'Cantidad de ML Coins otorgados a nuevos usuarios'
),
(
    'comodin_pistas_cost',
    'gamification',
    '15',
    'number',
    'Costo de Comodín Pistas',
    'ML Coins necesarios para comprar comodín Pistas'
),
(
    'comodin_vision_lectora_cost',
    'gamification',
    '25',
    'number',
    'Costo de Visión Lectora',
    'ML Coins necesarios para Visión Lectora'
),
(
    'comodin_segunda_oportunidad_cost',
    'gamification',
    '40',
    'number',
    'Costo de Segunda Oportunidad',
    'ML Coins necesarios para Segunda Oportunidad'
),
(
    'daily_streak_bonus',
    'gamification',
    '25',
    'number',
    'Bonus de Racha Diaria',
    'ML Coins bonus por mantener racha diaria'
);
```

---

#### Security
```sql
(
    'max_login_attempts',
    'security',
    '5',
    'number',
    'Máximo Intentos de Login',
    'Intentos permitidos antes de bloqueo temporal'
),
(
    'session_timeout_minutes',
    'security',
    '480',
    'number',
    'Timeout de Sesión (minutos)',
    'Tiempo de inactividad antes de cerrar sesión (8 horas)'
),
(
    'password_min_length',
    'security',
    '8',
    'number',
    'Longitud Mínima de Contraseña',
    'Caracteres mínimos requeridos en contraseñas'
);
```

---

#### Email
```sql
(
    'smtp_host',
    'email',
    'smtp.example.com',
    'string',
    'Host SMTP',
    'Servidor SMTP para envío de emails'
),
(
    'from_email',
    'email',
    'noreply@glit.edu.mx',
    'string',
    'Email Remitente',
    'Email usado como remitente en notificaciones'
);
```

---

### 3.2 Feature Flags Iniciales

```sql
INSERT INTO system_configuration.feature_flags (
    feature_name,
    feature_key,
    description,
    is_enabled,
    rollout_percentage
) VALUES
(
    'Sistema de Misiones',
    'missions_system',
    'Habilitar sistema de misiones diarias y semanales',
    true,
    100
),
(
    'Leaderboards Globales',
    'global_leaderboards',
    'Habilitar rankings globales públicos',
    true,
    100
),
(
    'Equipos Colaborativos',
    'collaborative_teams',
    'Permitir creación y participación en equipos',
    true,
    100
),
(
    'Chat en Vivo',
    'live_chat',
    'Chat en tiempo real entre estudiantes',
    false,
    0
),
(
    'Modo Competitivo',
    'competitive_mode',
    'Desafíos 1v1 entre estudiantes',
    false,
    10  -- A/B testing: 10% de usuarios
);
```

---

## 4. Archivo 03: Educational Modules Seed

**Archivo:** `03_educational_modules_seed.sql`
**Propósito:** 5 módulos educativos sobre Marie Curie.

### 4.1 Módulo 1: Biografía de Marie Curie

```sql
INSERT INTO educational_content.modules (
    title,
    subtitle,
    description,
    content,
    order_index,
    difficulty_level,
    grade_levels,
    subjects,
    estimated_duration_minutes,
    learning_objectives,
    xp_reward,
    ml_coins_reward,
    rango_maya_granted,
    status,
    is_published
) VALUES (
    'Marie Curie: Biografía',
    'La vida extraordinaria de una científica pionera',
    'Explora la vida de Marie Curie desde su infancia en Polonia hasta convertirse en la primera mujer en ganar un Premio Nobel.',
    '{
        "introduction": "Marie Curie fue una física y química polaca...",
        "sections": [
            {
                "title": "Infancia en Polonia",
                "content": "Nacida como Maria Skłodowska en Varsovia, Polonia, el 7 de noviembre de 1867..."
            },
            {
                "title": "Estudios en París",
                "content": "En 1891, Marie se mudó a París para estudiar..."
            }
        ],
        "timeline": [
            {"year": 1867, "event": "Nace en Varsovia, Polonia"},
            {"year": 1891, "event": "Se muda a París para estudiar en la Sorbona"},
            {"year": 1895, "event": "Se casa con Pierre Curie"},
            {"year": 1903, "event": "Gana su primer Premio Nobel (Física)"}
        ]
    }'::jsonb,
    1,
    'beginner',
    ARRAY['6', '7', '8'],
    ARRAY['Literatura', 'Historia', 'Ciencias'],
    120,
    ARRAY[
        'Conocer la biografía de Marie Curie',
        'Identificar momentos clave en su vida',
        'Comprender el contexto histórico de su época'
    ],
    100,
    50,
    'batab',
    'published',
    true
);
```

**Ejercicios incluidos (10-15):**
- Multiple choice sobre fechas clave
- Timeline interactiva
- Matching de eventos y años
- Crossword con vocabulario
- Short answer sobre momentos importantes

---

### 4.2 Módulo 2: Descubrimientos Científicos

```sql
INSERT INTO educational_content.modules (
    title,
    subtitle,
    description,
    order_index,
    difficulty_level,
    rango_maya_required,
    rango_maya_granted,
    xp_reward,
    ml_coins_reward
) VALUES (
    'Descubrimientos de Marie Curie',
    'Radio, Polonio y Radiactividad',
    'Descubre los hallazgos científicos revolucionarios de Marie Curie',
    2,
    'intermediate',
    'batab',
    'holcatte',
    200,
    100
);
```

**Ejercicios incluidos (12-18):**
- Interactive diagram de elementos químicos
- Simulation de experimentos
- Video questions sobre radiactividad
- Data analysis de mediciones
- Calculation exercises

---

### 4.3 Módulo 3: Premios Nobel

```sql
INSERT INTO educational_content.modules (
    title,
    subtitle,
    description,
    order_index,
    difficulty_level,
    rango_maya_required,
    rango_maya_granted
) VALUES (
    'Los Premios Nobel de Marie Curie',
    'Única mujer con dos Premios Nobel en diferentes disciplinas',
    'Conoce los logros que llevaron a Marie Curie a ganar dos Premios Nobel',
    3,
    'intermediate',
    'holcatte',
    'guerrero'
);
```

---

### 4.4 Módulo 4: Mujeres en la Ciencia

```sql
INSERT INTO educational_content.modules (
    title,
    subtitle,
    description,
    order_index,
    difficulty_level,
    rango_maya_required
) VALUES (
    'Mujeres en la Ciencia: El Legado de Marie Curie',
    'Rompiendo barreras en un mundo de hombres',
    'Analiza el impacto de Marie Curie en la participación de mujeres en STEM',
    4,
    'advanced',
    'guerrero'
);
```

---

### 4.5 Módulo 5: Física Moderna

```sql
INSERT INTO educational_content.modules (
    title,
    subtitle,
    description,
    order_index,
    difficulty_level,
    rango_maya_required,
    rango_maya_granted
) VALUES (
    'Marie Curie y la Física Moderna',
    'El impacto de sus descubrimientos en la ciencia actual',
    'Explora cómo los descubrimientos de Marie Curie sentaron las bases de la física moderna',
    5,
    'advanced',
    'guerrero',
    'mercenario'
);
```

---

## 5. Archivo 04: Demo Users and Data Seed

**Archivo:** `04_demo_users_and_data_seed.sql`
**Propósito:** Usuarios de prueba y datos para desarrollo.

### 5.1 Tenant Demo

```sql
INSERT INTO auth_management.tenants (
    id,
    name,
    slug,
    subscription_tier,
    is_active
) VALUES (
    'demo-tenant-uuid',
    'Escuela Demo GAMILIT,
    'escuela-demo',
    'professional',
    true
);
```

---

### 5.2 Usuarios Demo

#### Estudiante Demo 1
```sql
INSERT INTO auth_management.profiles (
    id,
    tenant_id,
    email,
    display_name,
    full_name,
    role,
    status,
    grade_level
) VALUES (
    'student-1-uuid',
    'demo-tenant-uuid',
    'estudiante1@demo.glit.edu.mx',
    'Ana García',
    'Ana María García López',
    'student',
    'active',
    '7'
);

-- User stats inicializados automáticamente por trigger
-- Progreso simulado
INSERT INTO progress_tracking.module_progress (
    user_id,
    module_id,
    status,
    progress_percentage,
    completed_exercises,
    total_exercises,
    total_score
) VALUES (
    'student-1-uuid',
    'module-1-uuid',
    'completed',
    100,
    10,
    10,
    950
);
```

---

#### Profesor Demo
```sql
INSERT INTO auth_management.profiles (
    id,
    tenant_id,
    email,
    display_name,
    full_name,
    role,
    status
) VALUES (
    'teacher-1-uuid',
    'demo-tenant-uuid',
    'profesor1@demo.glit.edu.mx',
    'Prof. Carlos Ramírez',
    'Carlos Alberto Ramírez Sánchez',
    'admin_teacher',
    'active'
);
```

---

#### Super Admin Demo
```sql
INSERT INTO auth_management.profiles (
    id,
    tenant_id,
    email,
    display_name,
    role,
    status
) VALUES (
    'admin-1-uuid',
    'demo-tenant-uuid',
    'admin@demo.glit.edu.mx',
    'Admin GAMILIT,
    'super_admin',
    'active'
);
```

---

### 5.3 Escuela y Aula Demo

```sql
-- Escuela
INSERT INTO social_features.schools (
    id,
    tenant_id,
    name,
    code,
    city,
    is_active
) VALUES (
    'school-demo-uuid',
    'demo-tenant-uuid',
    'Secundaria Benito Juárez',
    'SBJ001',
    'Ciudad de México',
    true
);

-- Aula
INSERT INTO social_features.classrooms (
    id,
    school_id,
    tenant_id,
    name,
    code,
    teacher_id,
    grade_level,
    is_active
) VALUES (
    'classroom-demo-uuid',
    'school-demo-uuid',
    'demo-tenant-uuid',
    'Grupo 7-A',
    'CLASE-7A',
    'teacher-1-uuid',
    '7',
    true
);

-- Membresía de estudiante en aula
INSERT INTO social_features.classroom_members (
    classroom_id,
    student_id,
    status
) VALUES (
    'classroom-demo-uuid',
    'student-1-uuid',
    'active'
);
```

---

## 6. Archivos 05-09: Content Enhancements

### 6.1 Enhanced Crossword (05)
**Archivo:** `05_enhanced_crossword.sql`
**Propósito:** Crucigramas mejorados con mejor contenido.

**Ejemplo de ejercicio:**
```sql
INSERT INTO educational_content.exercises (
    module_id,
    title,
    exercise_type,
    order_index,
    content,
    difficulty_level,
    max_points
) VALUES (
    'module-1-uuid',
    'Crucigrama: Vida de Marie Curie',
    'crossword',
    5,
    '{
        "clues": {
            "across": [
                {"number": 1, "clue": "País de nacimiento de Marie", "answer": "POLONIA"},
                {"number": 3, "clue": "Ciudad donde estudió", "answer": "PARIS"}
            ],
            "down": [
                {"number": 2, "clue": "Elemento descubierto en 1898", "answer": "RADIO"},
                {"number": 4, "clue": "Apellido de soltera", "answer": "SKLODOWSKA"}
            ]
        },
        "grid_size": {"rows": 10, "cols": 10}
    }'::jsonb,
    'intermediate',
    100
);
```

---

### 6.2 Enhanced Timeline (06)
**Archivo:** `06_enhanced_timeline_update.sql`
**Propósito:** Timeline interactiva mejorada.

---

### 6.3 Enhanced Wordsearch (07)
**Archivo:** `07_enhanced_wordsearch_update.sql`
**Propósito:** Sopas de letras con vocabulario científico.

---

### 6.4 Module 1 Exercises Update (08)
**Archivo:** `08_module1_marie_curie_exercises_update.sql`
**Propósito:** Actualización completa de ejercicios del módulo 1.

---

### 6.5 Module 1 Simple Update (09)
**Archivo:** `09_module1_update_simple.sql`
**Propósito:** Simplificación de algunos ejercicios.

---

### 6.6 Enrich Exercises Questions (09b)
**Archivo:** `09_enrich_exercises_questions.sql`
**Propósito:** Enriquecimiento de preguntas con explicaciones.

---

## 7. Seeds Comunes (Legacy)

**Archivo:** `seeds/seed_common_achievements.sql`
**Propósito:** Achievements comunes (versión legacy, reemplazado por 01_achievements_seed.sql)

---

## 8. Scripts de Testing

### 8.1 Seed Final Completo
**Archivo:** `seed_final.sql`
**Propósito:** Script all-in-one para seed completo (desarrollo).

### 8.2 Seed Test Data
**Archivo:** `seed_test_data.sql`
**Propósito:** Datos de testing específicos.

### 8.3 Seed Data General
**Archivo:** `seed_data.sql`
**Propósito:** Script legacy de seed general.

---

## 9. Estrategia de Aplicación

### 9.1 Producción
```bash
# Solo datos esenciales
psql -f seed_data/01_achievements_seed.sql
psql -f seed_data/02_system_config_seed.sql
psql -f seed_data/03_educational_modules_seed.sql
```

### 9.2 Staging
```bash
# Datos esenciales + enhancements
psql -f seed_data/01_achievements_seed.sql
psql -f seed_data/02_system_config_seed.sql
psql -f seed_data/03_educational_modules_seed.sql
psql -f seed_data/05_enhanced_crossword.sql
psql -f seed_data/06_enhanced_timeline_update.sql
psql -f seed_data/07_enhanced_wordsearch_update.sql
```

### 9.3 Desarrollo
```bash
# TODO: datos de prueba
psql -f seed_final.sql  # All-in-one
```

---

## 10. Validación Post-Seed

```sql
-- 1. Verificar achievements
SELECT category, COUNT(*) FROM gamification_system.achievements
GROUP BY category;
-- Debe retornar: progress, streak, completion, social, special, mastery

-- 2. Verificar módulos
SELECT order_index, title, is_published
FROM educational_content.modules
ORDER BY order_index;
-- Debe retornar 5 módulos

-- 3. Verificar ejercicios
SELECT m.title, COUNT(e.id) as ejercicios
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON m.id = e.module_id
GROUP BY m.id, m.title
ORDER BY m.order_index;
-- Cada módulo debe tener 10-18 ejercicios

-- 4. Verificar settings
SELECT setting_category, COUNT(*)
FROM system_configuration.system_settings
GROUP BY setting_category;

-- 5. Verificar usuarios demo (solo dev)
SELECT role, COUNT(*)
FROM auth_management.profiles
WHERE email LIKE '%@demo.glit.edu.mx'
GROUP BY role;
```

---

## 11. Question Bank (Bancos de Preguntas)

**Ubicación:** `/home/isem/workspace/projects/glit/database/question_bank/`

### 11.1 Module 01 - Literal

#### marie_biography_complete.json
**Propósito:** Preguntas literales sobre biografía de Marie Curie.

**Estructura:**
```json
{
    "module": "module_01_literal",
    "topic": "marie_biography",
    "difficulty": "beginner",
    "questions": [
        {
            "id": "bio-001",
            "type": "multiple_choice",
            "question": "¿En qué año nació Marie Curie?",
            "options": ["1865", "1867", "1870", "1872"],
            "correct_answer": "1867",
            "explanation": "Marie Curie nació el 7 de noviembre de 1867 en Varsovia, Polonia.",
            "ml_coins_reward": 5,
            "xp_reward": 10
        }
    ]
}
```

---

#### marie_discoveries_complete.json
**Propósito:** Preguntas sobre descubrimientos científicos.

**Total de preguntas:** 50+ por archivo

---

## 12. Archivos de Referencia

```
/home/isem/workspace/projects/glit/database/
├── seed_data/
│   ├── 01_achievements_seed.sql          # ESENCIAL
│   ├── 02_system_config_seed.sql         # ESENCIAL
│   ├── 03_educational_modules_seed.sql   # ESENCIAL
│   ├── 04_demo_users_and_data_seed.sql   # OPCIONAL (dev)
│   ├── 05_enhanced_crossword.sql
│   ├── 06_enhanced_timeline_update.sql
│   ├── 07_enhanced_wordsearch_update.sql
│   ├── 08_module1_marie_curie_exercises_update.sql
│   ├── 09_module1_update_simple.sql
│   └── 09_enrich_exercises_questions.sql
├── question_bank/
│   └── module_01_literal/
│       ├── marie_biography_complete.json
│       └── marie_discoveries_complete.json
├── seeds/
│   └── seed_common_achievements.sql      # LEGACY
├── seed_final.sql                        # All-in-one (dev)
├── seed_test_data.sql                    # Testing
└── seed_data.sql                         # LEGACY
```

---

## 13. Mantenimiento de Seeds

### 13.1 Actualizar Achievements
- Editar `01_achievements_seed.sql`
- Agregar nuevos achievements al final
- Mantener categorías balanceadas

### 13.2 Actualizar Módulos
- Editar `03_educational_modules_seed.sql`
- Incrementar `version` del módulo
- Documentar cambios en `version_notes`

### 13.3 Testing de Seeds
```bash
# 1. Drop y recrear database
dropdb glit_test
createdb glit_test

# 2. Aplicar schema
psql glit_test -f 00_prerequisites.sql
psql glit_test -f clean_ddl/*.sql

# 3. Aplicar seeds
psql glit_test -f seed_data/01_achievements_seed.sql
psql glit_test -f seed_data/02_system_config_seed.sql
psql glit_test -f seed_data/03_educational_modules_seed.sql

# 4. Validar
psql glit_test -f validate_seeds.sql
```

---

**Documento generado:** 2025-10-27
**Versión de base de datos:** PostgreSQL 14+
**Plataforma:** GAMILIT(Gamified Learning Interactive Toolkit)
