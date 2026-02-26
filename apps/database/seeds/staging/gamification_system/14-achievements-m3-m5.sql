-- =====================================================
-- Seed: gamification_system.achievements - Modulos M3, M4, M5
-- Description: 15 logros especificos para los modulos de Lectura Critica,
--              Alfabetizacion Digital y Produccion Creativa
-- Environment: PRODUCTION
-- Dependencies: gamification_system.achievement_categories
-- Order: 14
-- Created: 2026-01-07
-- Reference: CORR-009-RESUMEN-CONSOLIDADO.md
-- =====================================================
--
-- ACHIEVEMENTS INCLUIDOS:
-- - Modulo 3 - Lectura Critica (5 achievements)
-- - Modulo 4 - Alfabetizacion Digital (5 achievements)
-- - Modulo 5 - Produccion Creativa (5 achievements)
--
-- TOTAL: 15 achievements
--
-- IDs: gen_random_uuid() (v4), upsert via ON CONFLICT (name, tenant_id)
-- =====================================================

SET search_path TO gamification_system, educational_content, public;

-- =====================================================
-- MODULO 3: LECTURA CRITICA (5 achievements)
-- =====================================================

-- M3-1: Pensador Critico Emergente
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Pensador Critico Emergente',
    'Completa tu primer ejercicio del Modulo 3 - Lectura Critica',
    'brain',
    'progress'::gamification_system.achievement_category,
    'common',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_first_exercise',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-03-CRITICA',
            'exercises_completed', 1
        )
    ),
    jsonb_build_object(
        'xp', 75,
        'ml_coins', 25,
        'badge', 'critical_thinker_starter'
    ),
    25,
    false, true, false,
    301, 75,
    'Has iniciado tu camino como pensador critico. El analisis profundo comienza aqui.',
    'Completa cualquier ejercicio del Modulo 3 - Lectura Critica.',
    ARRAY[
        'Lee con detenimiento antes de emitir juicios',
        'Distingue entre hechos y opiniones'
    ],
    jsonb_build_object(
        'module_code', 'MOD-03-CRITICA',
        'achievement_tier', 'bronze',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M3-2: Juez de Opiniones
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Juez de Opiniones',
    'Obtiene 90% o mas en el ejercicio Tribunal de Opiniones',
    'gavel',
    'mastery'::gamification_system.achievement_category,
    'rare',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'tribunal_opiniones',
            'min_score', 90
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 40,
        'badge', 'opinion_judge'
    ),
    40,
    false, true, false,
    302, 100,
    'Tu capacidad para distinguir hechos de opiniones es impresionante. Eres un verdadero juez!',
    'Obtiene una calificacion de 90% o superior en el ejercicio Tribunal de Opiniones.',
    ARRAY[
        'Busca evidencias concretas para clasificar hechos',
        'Las opiniones suelen contener palabras como "creo", "pienso", "deberia"'
    ],
    jsonb_build_object(
        'module_code', 'MOD-03-CRITICA',
        'exercise_type', 'tribunal_opiniones',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M3-3: Maestro del Debate
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Maestro del Debate',
    'Obtiene 95% o mas en el ejercicio Debate Digital',
    'message-circle',
    'mastery'::gamification_system.achievement_category,
    'epic',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'debate_digital',
            'min_score', 95
        )
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 60,
        'badge', 'debate_master'
    ),
    60,
    false, true, false,
    303, 150,
    'Tus argumentos son solidos y tus refutaciones impecables. Eres un maestro del debate!',
    'Obtiene una calificacion de 95% o superior en el ejercicio Debate Digital.',
    ARRAY[
        'Usa evidencias solidas para respaldar tu posicion',
        'Anticipa los contraargumentos y preparate para refutarlos',
        'Mantene una logica clara en tu argumentacion'
    ],
    jsonb_build_object(
        'module_code', 'MOD-03-CRITICA',
        'exercise_type', 'debate_digital',
        'achievement_tier', 'gold',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M3-4: Verificador de Fuentes
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Verificador de Fuentes',
    'Obtiene 100% en el ejercicio Analisis de Fuentes CRAAP',
    'shield-check',
    'mastery'::gamification_system.achievement_category,
    'epic',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'analisis_fuentes',
            'min_score', 100
        )
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 50,
        'badge', 'source_verifier'
    ),
    50,
    false, true, false,
    304, 150,
    'Dominas el metodo CRAAP a la perfeccion. Ninguna fuente dudosa te engana!',
    'Obtiene una calificacion perfecta de 100% en el ejercicio Analisis de Fuentes.',
    ARRAY[
        'Recuerda CRAAP: Currency, Relevance, Authority, Accuracy, Purpose',
        'Ordena las fuentes de mas a menos confiable',
        'Justifica cada decision con criterios claros'
    ],
    jsonb_build_object(
        'module_code', 'MOD-03-CRITICA',
        'exercise_type', 'analisis_fuentes',
        'achievement_tier', 'gold',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M3-5: Comprension Critica Dominada
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Comprension Critica Dominada',
    'Completa todos los ejercicios del Modulo 3 - Lectura Critica',
    'award',
    'completion'::gamification_system.achievement_category,
    'legendary',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-03-CRITICA',
            'all_exercises', true
        )
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 150,
        'badge', 'critical_master',
        'title', 'Pensador Critico'
    ),
    150,
    false, true, false,
    305, 300,
    'Has dominado la lectura critica! Ahora puedes analizar cualquier texto con ojo experto.',
    'Completa los 5 ejercicios del Modulo 3 - Lectura Critica.',
    ARRAY[
        'Cada ejercicio te ensena una habilidad diferente',
        'Practica tribunal, debate, fuentes, podcast y matriz'
    ],
    jsonb_build_object(
        'module_code', 'MOD-03-CRITICA',
        'achievement_tier', 'platinum',
        'unlocks_title', true,
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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
-- MODULO 4: ALFABETIZACION DIGITAL (5 achievements)
-- =====================================================

-- M4-1: Detective de la Verdad
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Detective de la Verdad',
    'Realiza 5 verificaciones exitosas de fake news',
    'search',
    'progress'::gamification_system.achievement_category,
    'rare',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_repetition',
        'requirements', jsonb_build_object(
            'exercise_type', 'verificador_fake_news',
            'times_completed', 5,
            'min_score', 70
        )
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 30,
        'badge', 'truth_detective'
    ),
    30,
    false, true, false,
    401, 150,
    'Eres un detective de la verdad! Las fake news no escapan a tu ojo critico.',
    'Completa exitosamente 5 ejercicios de Verificador de Fake News.',
    ARRAY[
        'Siempre verifica con fuentes oficiales',
        'Las afirmaciones extraordinarias requieren evidencia extraordinaria'
    ],
    jsonb_build_object(
        'module_code', 'MOD-04-DIGITAL',
        'exercise_type', 'verificador_fake_news',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M4-2: Explorador Digital
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Explorador Digital',
    'Completa 3 ejercicios de Infografia Interactiva',
    'compass',
    'exploration'::gamification_system.achievement_category,
    'common',
    'elementary'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_repetition',
        'requirements', jsonb_build_object(
            'exercise_type', 'infografia_interactiva',
            'times_completed', 3,
            'min_score', 60
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 20,
        'badge', 'digital_explorer'
    ),
    20,
    false, true, false,
    402, 100,
    'Navegas el mundo digital con destreza. Cada infografia es una aventura!',
    'Completa 3 ejercicios de Infografia Interactiva.',
    ARRAY[
        'Explora cada seccion de la infografia',
        'Los iconos y colores tienen significado'
    ],
    jsonb_build_object(
        'module_code', 'MOD-04-DIGITAL',
        'exercise_type', 'infografia_interactiva',
        'achievement_tier', 'bronze',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M4-3: Velocista Digital
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Velocista Digital',
    'Completa Quiz TikTok en menos de 30 segundos con 100% de aciertos',
    'zap',
    'mastery'::gamification_system.achievement_category,
    'epic',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_speed',
        'requirements', jsonb_build_object(
            'exercise_type', 'quiz_tiktok',
            'max_time_seconds', 30,
            'min_score', 100
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 50,
        'badge', 'digital_speedster'
    ),
    50,
    false, true, false,
    403, 200,
    'Velocidad y precision! Eres un verdadero velocista del conocimiento digital.',
    'Completa el Quiz TikTok en menos de 30 segundos con todas las respuestas correctas.',
    ARRAY[
        'Lee rapido pero con atencion',
        'Confía en tu primer instinto si estudiaste bien'
    ],
    jsonb_build_object(
        'module_code', 'MOD-04-DIGITAL',
        'exercise_type', 'quiz_tiktok',
        'achievement_tier', 'gold',
        'module_specific', true,
        'speed_challenge', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M4-4: Memelogo
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Memelogo',
    'Analiza 10 memes de manera exitosa',
    'image',
    'progress'::gamification_system.achievement_category,
    'rare',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'content_analysis',
        'requirements', jsonb_build_object(
            'exercise_type', 'analisis_memes',
            'analyses_completed', 10,
            'min_score', 70
        )
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 25,
        'badge', 'meme_expert'
    ),
    25,
    false, true, false,
    404, 100,
    'Decodificas memes como un experto! La cultura digital no tiene secretos para ti.',
    'Completa exitosamente 10 analisis de memes.',
    ARRAY[
        'Los memes combinan imagen y texto para crear significado',
        'Conocer el formato ayuda a entender el humor'
    ],
    jsonb_build_object(
        'module_code', 'MOD-04-DIGITAL',
        'exercise_type', 'analisis_memes',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M4-5: Maestro de la Alfabetizacion Digital
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Maestro de la Alfabetizacion Digital',
    'Completa todos los ejercicios del Modulo 4 - Alfabetizacion Digital',
    'monitor',
    'completion'::gamification_system.achievement_category,
    'legendary',
    'intermediate'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-04-DIGITAL',
            'all_exercises', true
        )
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 75,
        'badge', 'digital_literacy_master',
        'title', 'Ciudadano Digital'
    ),
    75,
    false, true, false,
    405, 300,
    'Eres un ciudadano digital modelo! Navegas internet con sabiduria y criterio.',
    'Completa los 5 ejercicios del Modulo 4 - Alfabetizacion Digital.',
    ARRAY[
        'Fake news, infografias, memes, hipertexto - dominaste todo',
        'Usa estas habilidades en tu vida diaria digital'
    ],
    jsonb_build_object(
        'module_code', 'MOD-04-DIGITAL',
        'achievement_tier', 'platinum',
        'unlocks_title', true,
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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
-- MODULO 5: PRODUCCION CREATIVA (5 achievements)
-- =====================================================

-- M5-1: Escritor Creativo
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Escritor Creativo',
    'Obtiene 80% o mas en el ejercicio Diario Multimedia',
    'edit-3',
    'mastery'::gamification_system.achievement_category,
    'rare',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'diario_multimedia',
            'min_score', 80
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 100,
        'badge', 'creative_writer'
    ),
    100,
    false, true, false,
    501, 200,
    'Tu diario captura la esencia historica con creatividad unica. Eres un escritor nato!',
    'Obtiene una calificacion de 80% o superior en el Diario Multimedia.',
    ARRAY[
        'Imagina que eres Marie Curie escribiendo',
        'Combina hechos historicos con expresion personal'
    ],
    jsonb_build_object(
        'module_code', 'MOD-05-PRODUCCION',
        'exercise_type', 'diario_multimedia',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M5-2: Artista Narrativo
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Artista Narrativo',
    'Obtiene 80% o mas en el ejercicio Comic Digital',
    'layout',
    'mastery'::gamification_system.achievement_category,
    'rare',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'comic_digital',
            'min_score', 80
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 100,
        'badge', 'narrative_artist'
    ),
    100,
    false, true, false,
    502, 200,
    'Tu comic cuenta una historia visual impactante. Eres un artista narrativo!',
    'Obtiene una calificacion de 80% o superior en el Comic Digital.',
    ARRAY[
        'Combina arte visual con narrativa coherente',
        'Cada panel debe aportar a la historia'
    ],
    jsonb_build_object(
        'module_code', 'MOD-05-PRODUCCION',
        'exercise_type', 'comic_digital',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M5-3: Voz del Pasado
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Voz del Pasado',
    'Obtiene 80% o mas en el ejercicio Video-Carta',
    'video',
    'mastery'::gamification_system.achievement_category,
    'rare',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'exercise_score',
        'requirements', jsonb_build_object(
            'exercise_type', 'video_carta',
            'min_score', 80
        )
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 100,
        'badge', 'voice_from_past'
    ),
    100,
    false, true, false,
    503, 200,
    'Has dado voz a Marie Curie de manera autentica y emotiva. Eres la voz del pasado!',
    'Obtiene una calificacion de 80% o superior en el Video-Carta.',
    ARRAY[
        'Habla como si fueras Marie Curie',
        'Transmite emocion y autenticidad'
    ],
    jsonb_build_object(
        'module_code', 'MOD-05-PRODUCCION',
        'exercise_type', 'video_carta',
        'achievement_tier', 'silver',
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M5-4: Produccion Completa
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Produccion Completa',
    'Completa todos los ejercicios del Modulo 5 - Produccion Creativa',
    'film',
    'completion'::gamification_system.achievement_category,
    'legendary',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_completion',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-05-PRODUCCION',
            'all_exercises', true
        )
    ),
    jsonb_build_object(
        'xp', 500,
        'ml_coins', 250,
        'badge', 'complete_producer',
        'title', 'Creador Multimedia'
    ),
    250,
    false, true, false,
    504, 500,
    'Has creado un diario, un comic y un video. Eres un productor multimedia completo!',
    'Completa los 3 ejercicios del Modulo 5 - Produccion Creativa.',
    ARRAY[
        'Cada formato te ensena una forma diferente de expresion',
        'Combina escritura, arte visual y video'
    ],
    jsonb_build_object(
        'module_code', 'MOD-05-PRODUCCION',
        'achievement_tier', 'platinum',
        'unlocks_title', true,
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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

-- M5-5: Creador Multimedia Experto
INSERT INTO gamification_system.achievements (
    tenant_id, name, description, icon, category, rarity, difficulty_level,
    conditions, rewards, ml_coins_reward, is_secret, is_active, is_repeatable,
    order_index, points_value, unlock_message, instructions, tips, metadata,
    created_at, updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid,
    'Creador Multimedia Experto',
    'Obtiene promedio de 90% o mas en todos los ejercicios del Modulo 5',
    'star',
    'mastery'::gamification_system.achievement_category,
    'legendary',
    'advanced'::educational_content.difficulty_level,
    jsonb_build_object(
        'type', 'module_average_score',
        'requirements', jsonb_build_object(
            'module_code', 'MOD-05-PRODUCCION',
            'min_average_score', 90
        )
    ),
    jsonb_build_object(
        'xp', 400,
        'ml_coins', 200,
        'badge', 'multimedia_expert',
        'special_reward', 'golden_frame'
    ),
    200,
    false, true, false,
    505, 400,
    'Excelencia en cada formato! Eres un creador multimedia experto. Marie Curie estaria orgullosa!',
    'Obtiene un promedio de 90% o mas en todos los ejercicios del Modulo 5.',
    ARRAY[
        'La excelencia requiere practica y dedicacion',
        'Cada detalle cuenta en la produccion multimedia'
    ],
    jsonb_build_object(
        'module_code', 'MOD-05-PRODUCCION',
        'achievement_tier', 'diamond',
        'elite_achievement', true,
        'module_specific', true
    ),
    gamilit.now_mexico(),
    gamilit.now_mexico()
)
ON CONFLICT (name, tenant_id) DO UPDATE SET
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
-- Resumen de achievements creados
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Achievements M3-M5 Seed Completado';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Modulo 3 - Lectura Critica: 5 achievements';
    RAISE NOTICE '  - Pensador Critico Emergente (75 XP, 25 ML)';
    RAISE NOTICE '  - Juez de Opiniones (100 XP, 40 ML)';
    RAISE NOTICE '  - Maestro del Debate (150 XP, 60 ML)';
    RAISE NOTICE '  - Verificador de Fuentes (150 XP, 50 ML)';
    RAISE NOTICE '  - Comprension Critica Dominada (300 XP, 150 ML)';
    RAISE NOTICE '';
    RAISE NOTICE 'Modulo 4 - Alfabetizacion Digital: 5 achievements';
    RAISE NOTICE '  - Detective de la Verdad (150 XP, 30 ML)';
    RAISE NOTICE '  - Explorador Digital (100 XP, 20 ML)';
    RAISE NOTICE '  - Velocista Digital (200 XP, 50 ML)';
    RAISE NOTICE '  - Memelogo (100 XP, 25 ML)';
    RAISE NOTICE '  - Maestro Alfabetizacion Digital (300 XP, 75 ML)';
    RAISE NOTICE '';
    RAISE NOTICE 'Modulo 5 - Produccion Creativa: 5 achievements';
    RAISE NOTICE '  - Escritor Creativo (200 XP, 100 ML)';
    RAISE NOTICE '  - Artista Narrativo (200 XP, 100 ML)';
    RAISE NOTICE '  - Voz del Pasado (200 XP, 100 ML)';
    RAISE NOTICE '  - Produccion Completa (500 XP, 250 ML)';
    RAISE NOTICE '  - Creador Multimedia Experto (400 XP, 200 ML)';
    RAISE NOTICE '';
    RAISE NOTICE 'TOTAL: 15 achievements creados';
    RAISE NOTICE 'TOTAL XP: 2875';
    RAISE NOTICE 'TOTAL ML Coins: 1095';
    RAISE NOTICE '=====================================================';
END $$;
