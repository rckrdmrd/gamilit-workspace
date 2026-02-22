-- =====================================================
-- Seed: gamification_system.achievements (PROD)
-- Description: Logros y achievements demo para testing y producción
-- Environment: PRODUCTION
-- Dependencies: gamification_system.achievement_categories
-- Order: 04
-- Created: 2025-01-11
-- Version: 1.0
-- =====================================================
--
-- ACHIEVEMENTS INCLUIDOS:
-- - Progress (5): Primeros pasos, ejercicios completados, progreso
-- - Streak (3): Rachas de días consecutivos
-- - Completion (4): Completación de módulos
-- - Mastery (3): Dominio y maestría
-- - Exploration (2): Exploración de contenido
-- - Social (2): Interacción social
-- - Special (1): Logro especial
--
-- TOTAL: 20 achievements demo
--
-- IMPORTANTE: Estos achievements cubren casos de uso comunes
-- del sistema educativo de comprensión lectora GAMILIT.
-- =====================================================

SET search_path TO gamification_system, educational_content, public;

-- =====================================================
-- INSERT: Achievements Demo
-- =====================================================

INSERT INTO gamification_system.achievements (
    id,
    tenant_id,
    name,
    description,
    icon,
    category,
    rarity,
    difficulty_level,
    conditions,
    rewards,
    ml_coins_reward,
    is_secret,
    is_active,
    is_repeatable,
    order_index,
    points_value,
    unlock_message,
    instructions,
    tips,
    metadata,
    created_at,
    updated_at
) VALUES

-- =====================================================
-- CATEGORY: PROGRESS (5 achievements)
-- =====================================================

-- 1. Primeros Pasos
(
    '90000001-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,  -- Tenant principal
    'Primeros Pasos',
    'Completa tu primer ejercicio de comprensión lectora',
    'footprints',
    'progress'::gamification_system.achievement_category,
    'common',
    'beginner'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_completion',
        'requirements', jsonb_build_object(
            'exercises_completed', 1
        )
    ),
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 10,
        'badge', 'first_steps'
    ),
    10,
    false,
    true,
    false,
    1,
    50,
    '¡Felicidades! Has dado tus primeros pasos en tu viaje de aprendizaje.',
    'Completa cualquier ejercicio de comprensión lectora para desbloquear este logro.',
    ARRAY[
        'Lee el texto con atención antes de responder',
        'No tengas miedo de equivocarte, es parte del aprendizaje'
    ],
    jsonb_build_object(
        'achievement_tier', 'starter',
        'demo_achievement', true,
        'module_required', null
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 2. Lector Principiante
(
    '90000001-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Lector Principiante',
    'Completa 10 ejercicios de comprensión lectora',
    'book-open',
    'progress'::gamification_system.achievement_category,
    'common',
    'elementary'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_completion',
        'requirements', jsonb_build_object(
            'exercises_completed', 10
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 25,
        'badge', 'beginner_reader'
    ),
    25,
    false,
    true,
    false,
    2,
    100,
    '¡Excelente! Ya eres un lector principiante. ¡Sigue así!',
    'Completa 10 ejercicios de comprensión lectora en cualquier módulo.',
    ARRAY[
        'Practica diferentes tipos de textos',
        'Lee con atención los detalles'
    ],
    jsonb_build_object(
        'achievement_tier', 'bronze',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 3. Lector Experimentado
(
    '90000001-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Lector Experimentado',
    'Completa 50 ejercicios de comprensión lectora',
    'book-open',
    'progress'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_completion',
        'requirements', jsonb_build_object(
            'exercises_completed', 50
        )
    ),
    jsonb_build_object(
        'xp', 250,
        'ml_coins', 75,
        'badge', 'experienced_reader'
    ),
    75,
    false,
    true,
    false,
    3,
    250,
    '¡Impresionante! Tu experiencia como lector está creciendo enormemente.',
    'Completa 50 ejercicios de comprensión lectora.',
    ARRAY[
        'Varía los tipos de ejercicios',
        'Intenta ejercicios más difíciles'
    ],
    jsonb_build_object(
        'achievement_tier', 'silver',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 4. Lector Experto
(
    '90000001-0000-0000-0000-000000000004'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Lector Experto',
    'Completa 100 ejercicios de comprensión lectora',
    'footprints',
    'progress'::gamification_system.achievement_category,
    'epic',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_completion',
        'requirements', jsonb_build_object(
            'exercises_completed', 100
        )
    ),
    jsonb_build_object(
        'xp', 500,
        'ml_coins', 150,
        'badge', 'expert_reader'
    ),
    150,
    false,
    true,
    false,
    4,
    500,
    '¡Extraordinario! Has alcanzado el nivel de lector experto.',
    'Completa 100 ejercicios de comprensión lectora.',
    ARRAY[
        'Mantén tu constancia',
        'Ayuda a otros estudiantes'
    ],
    jsonb_build_object(
        'achievement_tier', 'gold',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 5. Maestro de la Lectura
(
    '90000001-0000-0000-0000-000000000005'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Maestro de la Lectura',
    'Completa 200 ejercicios de comprensión lectora',
    'graduation-cap',
    'progress'::gamification_system.achievement_category,
    'legendary',
    'proficient'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_completion',
        'requirements', jsonb_build_object(
            'exercises_completed', 200
        )
    ),
    jsonb_build_object(
        'xp', 1000,
        'ml_coins', 300,
        'badge', 'reading_master'
    ),
    300,
    false,
    true,
    false,
    5,
    1000,
    '¡LEGENDARIO! Te has convertido en un verdadero Maestro de la Lectura.',
    'Completa 200 ejercicios de comprensión lectora.',
    ARRAY[
        'Eres un ejemplo para todos',
        'Tu dedicación es inspiradora'
    ],
    jsonb_build_object(
        'achievement_tier', 'legendary',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: STREAK (3 achievements)
-- =====================================================

-- 6. Racha de 3 Días
(
    '90000002-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Racha de 3 Días',
    'Mantén una racha de 3 días consecutivos practicando',
    'flame',
    'streak'::gamification_system.achievement_category,
    'common',
    'elementary'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'streak',
        'requirements', jsonb_build_object(
            'consecutive_days', 3
        )
    ),
    jsonb_build_object(
        'xp', 75,
        'ml_coins', 20,
        'badge', 'streak_3'
    ),
    20,
    false,
    true,
    false,
    10,
    75,
    '¡Genial! Has mantenido tu racha por 3 días. ¡La constancia es clave!',
    'Practica al menos un ejercicio durante 3 días consecutivos.',
    ARRAY[
        'Establece un horario diario para practicar',
        'Aunque sea un ejercicio corto, mantén la racha'
    ],
    jsonb_build_object(
        'streak_milestone', 3,
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 7. Racha de 7 Días
(
    '90000002-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Racha de 7 Días',
    'Mantén una racha de 7 días consecutivos practicando',
    'flame',
    'streak'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'streak',
        'requirements', jsonb_build_object(
            'consecutive_days', 7
        )
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 50,
        'badge', 'streak_7'
    ),
    50,
    false,
    true,
    false,
    11,
    150,
    '¡Increíble! Una semana completa de práctica. ¡Tu dedicación es admirable!',
    'Practica al menos un ejercicio durante 7 días consecutivos.',
    ARRAY[
        'Ya has creado un hábito sólido',
        'Sigue así para alcanzar rachas más largas'
    ],
    jsonb_build_object(
        'streak_milestone', 7,
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 8. Racha de 30 Días
(
    '90000002-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Racha de 30 Días',
    'Mantén una racha de 30 días consecutivos practicando',
    'flame',
    'streak'::gamification_system.achievement_category,
    'epic',
    'proficient'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'streak',
        'requirements', jsonb_build_object(
            'consecutive_days', 30
        )
    ),
    jsonb_build_object(
        'xp', 500,
        'ml_coins', 200,
        'badge', 'streak_30'
    ),
    200,
    false,
    true,
    false,
    12,
    500,
    '¡ÉPICO! 30 días de racha. Tu compromiso con el aprendizaje es extraordinario.',
    'Practica al menos un ejercicio durante 30 días consecutivos.',
    ARRAY[
        'Has desarrollado un hábito excepcional',
        'Eres un modelo de constancia'
    ],
    jsonb_build_object(
        'streak_milestone', 30,
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: COMPLETION (4 achievements)
-- =====================================================

-- 9. Módulo 1 Completado
(
    '90000003-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Comprensión Literal Dominada',
    'Completa todos los ejercicios del Módulo 1: Comprensión Literal',
    'brain',
    'completion'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-01-LITERAL',
            'completion_percentage', 100
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 100,
        'badge', 'module_1_complete'
    ),
    100,
    false,
    true,
    false,
    20,
    200,
    '¡Felicidades! Has dominado la Comprensión Literal. ¡Sigue adelante!',
    'Completa todos los ejercicios del Módulo 1 con al menos 60% de aciertos.',
    ARRAY[
        'Identifica información explícita en los textos',
        'Presta atención a los detalles'
    ],
    jsonb_build_object(
        'module', 'MÓDULO 1: Comprensión Literal',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 10. Módulo 2 Completado
(
    '90000003-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Comprensión Inferencial Dominada',
    'Completa todos los ejercicios del Módulo 2: Comprensión Inferencial',
    'brain',
    'completion'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-02-INFERENCIAL',
            'completion_percentage', 100
        )
    ),
    jsonb_build_object(
        'xp', 250,
        'ml_coins', 125,
        'badge', 'module_2_complete'
    ),
    125,
    false,
    true,
    false,
    21,
    250,
    '¡Excelente! Has dominado la Comprensión Inferencial. Tu habilidad crece.',
    'Completa todos los ejercicios del Módulo 2 con al menos 60% de aciertos.',
    ARRAY[
        'Lee entre líneas para encontrar significados implícitos',
        'Usa tu conocimiento previo para hacer inferencias'
    ],
    jsonb_build_object(
        'module', 'MÓDULO 2: Comprensión Inferencial',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 11. Módulo 3 Completado
(
    '90000003-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Comprensión Crítica Dominada',
    'Completa todos los ejercicios del Módulo 3: Comprensión Crítica',
    'brain',
    'completion'::gamification_system.achievement_category,
    'epic',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-03-CRITICA',
            'completion_percentage', 100
        )
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 150,
        'badge', 'module_3_complete'
    ),
    150,
    false,
    true,
    false,
    22,
    300,
    '¡Impresionante! Has dominado la Comprensión Crítica. Tu pensamiento es agudo.',
    'Completa todos los ejercicios del Módulo 3 con al menos 60% de aciertos.',
    ARRAY[
        'Evalúa la calidad y veracidad de la información',
        'Desarrolla tu pensamiento crítico'
    ],
    jsonb_build_object(
        'module', 'MÓDULO 3: Comprensión Crítica',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 12. Todos los Módulos Completados
(
    '90000003-0000-0000-0000-000000000004'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Completista Total',
    'Completa todos los módulos del sistema',
    'trophy',
    'completion'::gamification_system.achievement_category,
    'legendary',
    'proficient'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'all_modules_completion',
        'requirements', jsonb_build_object(
            'modules_completed', 5,
            'min_score_average', 70
        )
    ),
    jsonb_build_object(
        'xp', 1000,
        'ml_coins', 500,
        'badge', 'completionist'
    ),
    500,
    false,
    true,
    false,
    23,
    1000,
    '¡LEGENDARIO! Has completado todos los módulos. Eres un verdadero completista.',
    'Completa los 5 módulos del sistema con promedio de 70% o superior.',
    ARRAY[
        'Tu dedicación es ejemplar',
        'Has alcanzado el nivel más alto'
    ],
    jsonb_build_object(
        'achievement_tier', 'ultimate',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: MASTERY (3 achievements)
-- =====================================================

-- 13. Perfeccionista
(
    '90000004-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Perfeccionista',
    'Obtén 100% de aciertos en 10 ejercicios',
    'target',
    'mastery'::gamification_system.achievement_category,
    'rare',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'perfect_score',
        'requirements', jsonb_build_object(
            'perfect_exercises', 10,
            'score_required', 100
        )
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 150,
        'badge', 'perfectionist'
    ),
    150,
    false,
    true,
    false,
    30,
    300,
    '¡Perfecto! Tu precisión es admirable. 10 ejercicios perfectos.',
    'Obtén 100% de aciertos en 10 ejercicios diferentes.',
    ARRAY[
        'Lee cuidadosamente antes de responder',
        'Revisa tus respuestas antes de enviar'
    ],
    jsonb_build_object(
        'mastery_type', 'perfect_score',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 14. Experto en Inferencias
(
    '90000004-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Experto en Inferencias',
    'Completa 20 ejercicios de inferencia con 90% o más de aciertos',
    'brain',
    'mastery'::gamification_system.achievement_category,
    'epic',
    'upper_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'skill_mastery',
        'requirements', jsonb_build_object(
            'skill_type', 'inferencial',
            'exercises_completed', 20,
            'min_score', 90
        )
    ),
    jsonb_build_object(
        'xp', 400,
        'ml_coins', 200,
        'badge', 'inference_expert'
    ),
    200,
    false,
    true,
    false,
    31,
    400,
    '¡Extraordinario! Eres un experto en hacer inferencias. Tu comprensión es profunda.',
    'Completa 20 ejercicios de comprensión inferencial con 90% o más.',
    ARRAY[
        'Conecta la información del texto con tu conocimiento',
        'Busca pistas en el contexto'
    ],
    jsonb_build_object(
        'mastery_type', 'skill_expert',
        'skill', 'inferencial',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 15. Crítico Avanzado
(
    '90000004-0000-0000-0000-000000000003'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Crítico Avanzado',
    'Completa 20 ejercicios de pensamiento crítico con 90% o más',
    'footprints',
    'mastery'::gamification_system.achievement_category,
    'epic',
    'proficient'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'skill_mastery',
        'requirements', jsonb_build_object(
            'skill_type', 'critico',
            'exercises_completed', 20,
            'min_score', 90
        )
    ),
    jsonb_build_object(
        'xp', 500,
        'ml_coins', 250,
        'badge', 'critical_thinker'
    ),
    250,
    false,
    true,
    false,
    32,
    500,
    '¡ÉPICO! Tu pensamiento crítico es de nivel avanzado. Sobresaliente.',
    'Completa 20 ejercicios de comprensión crítica con 90% o más.',
    ARRAY[
        'Evalúa argumentos y evidencias',
        'Cuestiona y analiza la información'
    ],
    jsonb_build_object(
        'mastery_type', 'skill_expert',
        'skill', 'critico',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: EXPLORATION (2 achievements)
-- =====================================================

-- 16. Explorador Curioso
(
    '90000005-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Explorador Curioso',
    'Explora al menos 3 módulos diferentes',
    'compass',
    'exploration'::gamification_system.achievement_category,
    'common',
    'elementary'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exploration',
        'requirements', jsonb_build_object(
            'different_modules', 3,
            'min_exercises_per_module', 1
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 50,
        'badge', 'curious_explorer'
    ),
    50,
    false,
    true,
    false,
    40,
    100,
    '¡Genial! Tu curiosidad te ha llevado a explorar diferentes módulos.',
    'Completa al menos un ejercicio en 3 módulos diferentes.',
    ARRAY[
        'Varía tus actividades de aprendizaje',
        'Descubre nuevos tipos de textos'
    ],
    jsonb_build_object(
        'exploration_type', 'module_variety',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 17. Aventurero del Conocimiento
(
    '90000005-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Aventurero del Conocimiento',
    'Completa ejercicios de todos los niveles de dificultad',
    'compass',
    'exploration'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exploration',
        'requirements', jsonb_build_object(
            'difficulty_levels', jsonb_build_array('beginner', 'elementary', 'pre_intermediate', 'upper_intermediate'),
            'min_exercises_per_level', 2
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 100,
        'badge', 'knowledge_adventurer'
    ),
    100,
    false,
    true,
    false,
    41,
    200,
    '¡Increíble! Has explorado todos los niveles de dificultad. Eres un verdadero aventurero.',
    'Completa al menos 2 ejercicios de cada nivel de dificultad.',
    ARRAY[
        'Reta tus límites con ejercicios difíciles',
        'La variedad enriquece tu aprendizaje'
    ],
    jsonb_build_object(
        'exploration_type', 'difficulty_variety',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: SOCIAL (2 achievements)
-- =====================================================

-- 18. Compañero de Aula
(
    '90000006-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Compañero de Aula',
    'Únete a tu primera aula virtual',
    'users',
    'social'::gamification_system.achievement_category,
    'common',
    'beginner'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'social',
        'requirements', jsonb_build_object(
            'classrooms_joined', 1
        )
    ),
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 25,
        'badge', 'classroom_member'
    ),
    25,
    false,
    true,
    false,
    50,
    50,
    '¡Bienvenido! Te has unido a tu primera aula. El aprendizaje colaborativo comienza.',
    'Únete a un aula virtual para desbloquear este logro.',
    ARRAY[
        'Colabora con tus compañeros',
        'Aprende de las experiencias de otros'
    ],
    jsonb_build_object(
        'social_type', 'classroom_join',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- 19. Estudiante Colaborativo
(
    '90000006-0000-0000-0000-000000000002'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Estudiante Colaborativo',
    'Participa en 5 actividades sociales (aulas, desafíos, etc.)',
    'handshake',
    'social'::gamification_system.achievement_category,
    'rare',
    'pre_intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'social',
        'requirements', jsonb_build_object(
            'social_activities', 5
        )
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 75,
        'badge', 'collaborative_student'
    ),
    75,
    false,
    true,
    false,
    51,
    150,
    '¡Excelente! Tu participación social es notable. Sigues creciendo con otros.',
    'Participa en 5 actividades sociales (unirte a aulas, aceptar desafíos, etc.).',
    ARRAY[
        'El aprendizaje es más rico cuando es social',
        'Comparte tus logros con otros'
    ],
    jsonb_build_object(
        'social_type', 'social_participation',
        'demo_achievement', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
),

-- =====================================================
-- CATEGORY: SPECIAL (1 achievement)
-- =====================================================

-- 20. Primera Visita
(
    '90000007-0000-0000-0000-000000000001'::uuid,
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Primera Visita',
    'Inicia sesión por primera vez en GAMILIT',
    'footprints',
    'special'::gamification_system.achievement_category,
    'common',
    'beginner'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'special',
        'requirements', jsonb_build_object(
            'first_login', true
        )
    ),
    jsonb_build_object(
        'xp', 25,
        'ml_coins', 10,
        'badge', 'first_visit'
    ),
    10,
    false,
    true,
    false,
    60,
    25,
    '¡Bienvenido a GAMILIT! Este es el comienzo de tu aventura de aprendizaje.',
    'Este logro se desbloquea automáticamente al iniciar sesión por primera vez.',
    ARRAY[
        'Explora la plataforma',
        'Comienza con ejercicios fáciles'
    ],
    jsonb_build_object(
        'special_type', 'welcome',
        'demo_achievement', true,
        'auto_unlock', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)

ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    icon = EXCLUDED.icon,
    category = EXCLUDED.category,
    rarity = EXCLUDED.rarity,
    difficulty_level = EXCLUDED.difficulty_level,
    conditions = EXCLUDED.conditions,
    rewards = EXCLUDED.rewards,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    is_secret = EXCLUDED.is_secret,
    is_active = EXCLUDED.is_active,
    is_repeatable = EXCLUDED.is_repeatable,
    order_index = EXCLUDED.order_index,
    points_value = EXCLUDED.points_value,
    unlock_message = EXCLUDED.unlock_message,
    instructions = EXCLUDED.instructions,
    tips = EXCLUDED.tips,
    metadata = EXCLUDED.metadata,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- Verification Query
-- =====================================================

DO $$
DECLARE
    achievement_count INTEGER;
    progress_count INTEGER;
    streak_count INTEGER;
    completion_count INTEGER;
    mastery_count INTEGER;
    exploration_count INTEGER;
    social_count INTEGER;
    special_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO achievement_count
    FROM gamification_system.achievements
    WHERE metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO progress_count
    FROM gamification_system.achievements
    WHERE category = 'progress'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO streak_count
    FROM gamification_system.achievements
    WHERE category = 'streak'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO completion_count
    FROM gamification_system.achievements
    WHERE category = 'completion'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO mastery_count
    FROM gamification_system.achievements
    WHERE category = 'mastery'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO exploration_count
    FROM gamification_system.achievements
    WHERE category = 'exploration'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO social_count
    FROM gamification_system.achievements
    WHERE category = 'social'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    SELECT COUNT(*) INTO special_count
    FROM gamification_system.achievements
    WHERE category = 'special'::gamification_system.achievement_category AND metadata->>'demo_achievement' = 'true';

    RAISE NOTICE '========================================';
    RAISE NOTICE 'ACHIEVEMENTS DEMO CREADOS EXITOSAMENTE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Total achievements: %', achievement_count;
    RAISE NOTICE '  - Progress: %', progress_count;
    RAISE NOTICE '  - Streak: %', streak_count;
    RAISE NOTICE '  - Completion: %', completion_count;
    RAISE NOTICE '  - Mastery: %', mastery_count;
    RAISE NOTICE '  - Exploration: %', exploration_count;
    RAISE NOTICE '  - Social: %', social_count;
    RAISE NOTICE '  - Special: %', special_count;
    RAISE NOTICE '========================================';

    IF achievement_count = 20 THEN
        RAISE NOTICE ' Todos los achievements demo fueron creados correctamente';
    ELSE
        RAISE WARNING '¡ Se esperaban 20 achievements, se crearon %', achievement_count;
    END IF;
END $$;

-- =====================================================
-- Listado de achievements por categoría
-- =====================================================

DO $$
DECLARE
    achievement_record RECORD;
    current_category TEXT := '';
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE 'Listado de achievements demo:';
    RAISE NOTICE '========================================';

    FOR achievement_record IN
        SELECT
            name,
            category,
            rarity,
            difficulty_level,
            points_value,
            ml_coins_reward
        FROM gamification_system.achievements
        WHERE metadata->>'demo_achievement' = 'true'
        ORDER BY category, order_index
    LOOP
        IF current_category != achievement_record.category::text THEN
            current_category := achievement_record.category::text;
            RAISE NOTICE '';
            RAISE NOTICE '=== % ===', UPPER(current_category);
        END IF;

        RAISE NOTICE '  - % [%/%]',
            achievement_record.name,
            achievement_record.rarity,
            achievement_record.difficulty_level;
        RAISE NOTICE '    Puntos: % | ML Coins: %',
            achievement_record.points_value,
            achievement_record.ml_coins_reward;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
END $$;
