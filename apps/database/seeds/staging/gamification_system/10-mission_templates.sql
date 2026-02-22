-- =====================================================
-- Seed: gamification_system.mission_templates
-- Description: Templates de misiones para generar misiones diarias/semanales/especiales
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- Created: 2025-12-14
-- =====================================================
--
-- Este seed crea los templates base para el sistema de misiones.
-- Los templates se usan para generar misiones automáticamente.
--
-- Tipos de misiones (ENUM mission_type):
-- - daily: Misiones diarias (reset cada día)
-- - weekly: Misiones semanales
-- - special: Misiones especiales/eventos
-- - classroom: Misiones de aula (asignadas por profesores)
--
-- Tipos de objetivos (target_type):
-- - complete_exercises: Completar N ejercicios
-- - study_minutes: Estudiar N minutos
-- - earn_xp: Ganar N XP
-- - correct_streak: Racha de N respuestas correctas
-- - use_comodines: Usar N comodines
-- - perfect_scores: Obtener N puntuaciones perfectas
-- - daily_streak: Mantener racha de N días
-- - complete_modules: Completar N módulos
-- - explore_modules: Explorar N módulos diferentes
-- =====================================================

-- =====================================================
-- MISIONES DIARIAS
-- =====================================================
INSERT INTO gamification_system.mission_templates (
    id,
    name,
    description,
    type,
    category,
    target_type,
    target_value,
    xp_reward,
    ml_coins_reward,
    difficulty,
    is_active,
    priority,
    min_level,
    icon,
    color,
    metadata
) VALUES
-- Misión diaria: Completar ejercicios
(
    '20000001-0000-0000-0000-000000000001'::uuid,
    'Calentamiento Científico',
    'Completa 3 ejercicios para comenzar tu día de aprendizaje',
    'daily',
    'exercise',
    'complete_exercises',
    3,
    50,
    10,
    'easy',
    true,
    100,
    1,
    '🔬',
    '#4CAF50',
    '{"description_es": "Ejercicios completados", "reward_multiplier": 1.0}'::jsonb
),
-- Misión diaria: Racha de respuestas correctas
(
    '20000001-0000-0000-0000-000000000002'::uuid,
    'Mente Brillante',
    'Consigue una racha de 5 respuestas correctas consecutivas',
    'daily',
    'streak',
    'correct_streak',
    5,
    75,
    15,
    'normal',
    true,
    90,
    1,
    '⚡',
    '#FF9800',
    '{"description_es": "Respuestas consecutivas correctas", "reward_multiplier": 1.0}'::jsonb
),
-- Misión diaria: Ganar XP
(
    '20000001-0000-0000-0000-000000000003'::uuid,
    'Acumulador de Sabiduría',
    'Gana 100 puntos de experiencia durante el día',
    'daily',
    'progress',
    'earn_xp',
    100,
    30,
    5,
    'easy',
    true,
    80,
    1,
    '📈',
    '#2196F3',
    '{"description_es": "XP ganado", "reward_multiplier": 1.0}'::jsonb
),
-- Misión diaria: Puntuación perfecta
(
    '20000001-0000-0000-0000-000000000004'::uuid,
    'Perfeccionista del Día',
    'Obtén al menos 1 puntuación perfecta en cualquier ejercicio',
    'daily',
    'mastery',
    'perfect_scores',
    1,
    100,
    25,
    'hard',
    true,
    70,
    2,
    '🌟',
    '#9C27B0',
    '{"description_es": "Puntuaciones perfectas", "reward_multiplier": 1.2}'::jsonb
),
-- REC-009: Misión diaria: Usar comodín (requerido por initialize_user_missions trigger)
(
    '20000001-0000-0000-0000-000000000005'::uuid,
    'Estrategia del Día',
    'Usa al menos un comodín estratégicamente en un ejercicio',
    'daily',
    'strategy',
    'use_comodines',
    1,
    20,
    10,
    'easy',
    true,
    60,
    1,
    '🃏',
    '#673AB7',
    '{"description_es": "Comodines usados hoy", "reward_multiplier": 1.0}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- MISIONES SEMANALES
-- =====================================================
INSERT INTO gamification_system.mission_templates (
    id,
    name,
    description,
    type,
    category,
    target_type,
    target_value,
    xp_reward,
    ml_coins_reward,
    difficulty,
    is_active,
    priority,
    min_level,
    icon,
    color,
    metadata
) VALUES
-- Misión semanal: Completar ejercicios
(
    '20000002-0000-0000-0000-000000000001'::uuid,
    'Maratón de Conocimiento',
    'Completa 15 ejercicios durante la semana',
    'weekly',
    'exercise',
    'complete_exercises',
    15,
    200,
    50,
    'normal',
    true,
    100,
    1,
    '🏃',
    '#4CAF50',
    '{"description_es": "Ejercicios completados esta semana", "reward_multiplier": 1.5}'::jsonb
),
-- Misión semanal: Racha diaria
(
    '20000002-0000-0000-0000-000000000002'::uuid,
    'Constancia Científica',
    'Mantén una racha de estudio de 5 días consecutivos',
    'weekly',
    'streak',
    'daily_streak',
    5,
    300,
    75,
    'hard',
    true,
    95,
    1,
    '🔥',
    '#FF5722',
    '{"description_es": "Días de racha", "reward_multiplier": 1.5}'::jsonb
),
-- Misión semanal: XP total
(
    '20000002-0000-0000-0000-000000000003'::uuid,
    'Ascenso Semanal',
    'Acumula 500 puntos de experiencia durante la semana',
    'weekly',
    'progress',
    'earn_xp',
    500,
    150,
    40,
    'normal',
    true,
    85,
    1,
    '📊',
    '#00BCD4',
    '{"description_es": "XP total semanal", "reward_multiplier": 1.5}'::jsonb
),
-- Misión semanal: Explorar módulos
(
    '20000002-0000-0000-0000-000000000004'::uuid,
    'Explorador Curioso',
    'Realiza ejercicios de al menos 3 módulos diferentes',
    'weekly',
    'exploration',
    'explore_modules',
    3,
    175,
    45,
    'normal',
    true,
    80,
    1,
    '🗺️',
    '#795548',
    '{"description_es": "Módulos explorados", "reward_multiplier": 1.5}'::jsonb
),
-- Misión semanal: Puntuaciones perfectas
(
    '20000002-0000-0000-0000-000000000005'::uuid,
    'Semana de Excelencia',
    'Consigue 5 puntuaciones perfectas durante la semana',
    'weekly',
    'mastery',
    'perfect_scores',
    5,
    400,
    100,
    'epic',
    true,
    75,
    3,
    '👑',
    '#FFD700',
    '{"description_es": "Puntuaciones perfectas semanales", "reward_multiplier": 2.0}'::jsonb
),
-- REC-009: Misión semanal: Completar módulo (requerido por initialize_user_missions trigger)
(
    '20000002-0000-0000-0000-000000000006'::uuid,
    'Dominio Semanal',
    'Completa un módulo completo durante la semana',
    'weekly',
    'completion',
    'complete_modules',
    1,
    200,
    100,
    'hard',
    true,
    90,
    1,
    '🎓',
    '#E91E63',
    '{"description_es": "Módulos completados esta semana", "reward_multiplier": 1.5}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- MISIONES ESPECIALES
-- =====================================================
INSERT INTO gamification_system.mission_templates (
    id,
    name,
    description,
    type,
    category,
    target_type,
    target_value,
    xp_reward,
    ml_coins_reward,
    difficulty,
    is_active,
    priority,
    min_level,
    icon,
    color,
    metadata
) VALUES
-- Misión especial: Completar módulo
(
    '20000003-0000-0000-0000-000000000001'::uuid,
    'Dominio del Módulo',
    'Completa todos los ejercicios de un módulo con al menos 80% de aciertos',
    'special',
    'completion',
    'complete_modules',
    1,
    500,
    150,
    'epic',
    true,
    100,
    1,
    '🎓',
    '#E91E63',
    '{"description_es": "Módulo completado con maestría", "min_score_percentage": 80, "reward_multiplier": 2.5}'::jsonb
),
-- Misión especial: Uso de comodines
(
    '20000003-0000-0000-0000-000000000002'::uuid,
    'Estratega Sabio',
    'Usa 3 comodines estratégicamente durante tus ejercicios',
    'special',
    'strategy',
    'use_comodines',
    3,
    75,
    20,
    'normal',
    true,
    60,
    2,
    '🃏',
    '#673AB7',
    '{"description_es": "Comodines usados", "reward_multiplier": 1.0}'::jsonb
)
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    xp_reward = EXCLUDED.xp_reward,
    ml_coins_reward = EXCLUDED.ml_coins_reward,
    is_active = EXCLUDED.is_active,
    updated_at = gamilit.now_mexico();

-- =====================================================
-- SPECIAL MISSIONS: Exercise-Linked
-- =====================================================
-- Idempotency: Skip if special missions already exist
DO $$ BEGIN
    IF EXISTS (SELECT 1 FROM gamification_system.mission_templates WHERE name = 'Maestro del Crucigrama' LIMIT 1) THEN
        RAISE NOTICE 'Special mission templates already exist, skipping';
        RETURN;
    END IF;
END $$;

-- 1. Maestro del Crucigrama
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Maestro del Crucigrama',
    'Completa 3 crucigramas con una puntuacion de 90% o mas.',
    'special', 'exercise_challenge', 'complete_exercise_type', 3,
    200, 50, 'hard', true, 3,
    1, 'crucigrama', '🧩', '#FF6B35',
    '{"min_score": 90, "description_long": "Demuestra tu dominio de las palabras completando crucigramas con alta precision."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 2. Detective de Inferencias
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Detective de Inferencias',
    'Completa 5 ejercicios de detective textual para agudizar tu mente deductiva.',
    'special', 'exercise_challenge', 'complete_exercise_type', 5,
    250, 60, 'hard', true, 3,
    2, 'detective_textual', '🔍', '#4A90D9',
    '{"description_long": "Usa tus habilidades deductivas para desentranar los misterios de cada texto."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 3. Explorador del Modulo 3
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Explorador del Modulo 3',
    'Completa todos los ejercicios disponibles del Modulo 3: Lectura Critica.',
    'special', 'module_challenge', 'complete_module', 1,
    500, 150, 'epic', true, 4,
    3, NULL, '🗺️', '#2ECC71',
    '{"description_long": "Conquista cada desafio del modulo de Lectura Critica y demuestra tu pensamiento analitico."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 4. Velocista de Lectura
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Velocista de Lectura',
    'Completa 3 ejercicios del Modulo 1 en menos de 2 minutos cada uno.',
    'special', 'speed_challenge', 'complete_exercise_type', 3,
    175, 40, 'hard', true, 3,
    1, NULL, '⚡', '#F39C12',
    '{"max_time_seconds": 120, "description_long": "La velocidad y la comprension van de la mano. Demuestra que puedes leer rapido y bien."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 5. Mente Analitica
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Mente Analitica',
    'Obtiene 100% en 2 ejercicios de analisis de memes.',
    'special', 'exercise_challenge', 'complete_exercise_type', 2,
    300, 75, 'epic', true, 4,
    4, 'analisis_memes', '🧠', '#9B59B6',
    '{"min_score": 100, "description_long": "Analiza memes con ojo critico y demuestra que puedes descifrar cualquier mensaje multimedia."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 6. Constructor de Hipotesis
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Constructor de Hipotesis',
    'Completa 3 ejercicios de causa y efecto para fortalecer tu razonamiento.',
    'special', 'exercise_challenge', 'complete_exercise_type', 3,
    200, 50, 'hard', true, 3,
    2, 'causa_efecto', '🔬', '#E74C3C',
    '{"description_long": "Conecta causas con efectos y construye hipotesis solidas como un verdadero cientifico."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 7. Explorador Multimedia
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Explorador Multimedia',
    'Completa 1 video carta y 1 infografia interactiva del Modulo 5.',
    'special', 'multi_exercise', 'complete_exercise_type', 2,
    225, 55, 'hard', true, 3,
    5, NULL, '🎬', '#1ABC9C',
    '{"required_types": ["video_carta", "infografia_interactiva"], "description_long": "Explora el mundo multimedia y demuestra tu creatividad con diferentes formatos."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- 8. Desafio Maya Supremo
INSERT INTO gamification_system.mission_templates (
    id, name, description, type, category, target_type, target_value,
    xp_reward, ml_coins_reward, difficulty, is_active, priority,
    required_module, required_exercise_type, icon, color, metadata
) VALUES (
    gen_random_uuid(),
    'Desafio Maya Supremo',
    'Completa 1 ejercicio perfecto (100%, sin pistas) de cada uno de los 5 modulos.',
    'special', 'ultimate_challenge', 'complete_exercise_type', 5,
    1000, 300, 'epic', true, 5,
    NULL, NULL, '👑', '#FFD700',
    '{"per_module_perfect": true, "min_score": 100, "max_hints": 0, "description_long": "El desafio supremo: demuestra maestria perfecta en cada modulo educativo. Solo los verdaderos Halach Uinic lo logran."}'::jsonb
)
ON CONFLICT DO NOTHING;

-- =====================================================
-- VERIFICACION
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM gamification_system.mission_templates;

    RAISE NOTICE '';
    RAISE NOTICE '=== MISSION TEMPLATES CREADOS ===';
    RAISE NOTICE 'Total templates: %', v_count;
    RAISE NOTICE 'Daily missions: %', (SELECT COUNT(*) FROM gamification_system.mission_templates WHERE type = 'daily');
    RAISE NOTICE 'Weekly missions: %', (SELECT COUNT(*) FROM gamification_system.mission_templates WHERE type = 'weekly');
    RAISE NOTICE 'Special missions: %', (SELECT COUNT(*) FROM gamification_system.mission_templates WHERE type = 'special');
    RAISE NOTICE 'Exercise-linked missions: %', (SELECT COUNT(*) FROM gamification_system.mission_templates WHERE required_exercise_type IS NOT NULL);

    IF v_count < 20 THEN
        RAISE WARNING 'Se esperaban al menos 20 mission_templates (12 base + 8 exercise-linked)';
    ELSE
        RAISE NOTICE 'Seed de mission_templates completado exitosamente';
    END IF;
END $$;
