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
-- VERIFICACIÓN
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

    IF v_count < 10 THEN
        RAISE WARNING '⚠️ Se esperaban al menos 10 mission_templates';
    ELSE
        RAISE NOTICE '✅ Seed de mission_templates completado exitosamente';
    END IF;
END $$;
