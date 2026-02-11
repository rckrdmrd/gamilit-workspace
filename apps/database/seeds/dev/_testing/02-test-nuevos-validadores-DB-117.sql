-- =====================================================
-- Seed Data: Testing para Nuevos Validadores DB-117
-- =====================================================
-- Description: Ejercicios de prueba para validar los 3 nuevos validadores
-- Validators: validate_detective_connections, validate_prediction_scenarios, validate_cause_effect_matching
-- Created by: Database Agent - DB-117 (Ajustado de seed FE-059)
-- Date: 2025-11-19
-- Status: READY FOR TESTING
-- Purpose: Proveer datos de prueba compatibles con validadores implementados
-- =====================================================

SET search_path TO educational_content, public;

DO $$
DECLARE
    mod_id UUID;
BEGIN
    -- Crear o usar módulo de prueba
    SELECT id INTO mod_id FROM educational_content.modules WHERE module_code = 'MOD-TEST-VALIDADORES';

    IF mod_id IS NULL THEN
        -- Crear módulo de prueba
        INSERT INTO educational_content.modules (
            module_code, title, description, order_index, is_published, status
        ) VALUES (
            'MOD-TEST-VALIDADORES',
            '[TEST] Módulo de Validadores DB-117',
            'Módulo de prueba para testing de nuevos validadores',
            999,
            false,
            'draft'
        ) RETURNING id INTO mod_id;

        RAISE NOTICE 'Módulo de prueba creado con ID: %', mod_id;
    END IF;

    -- ========================================================================
    -- TEST 1: DETECTIVE TEXTUAL - Conexión de Evidencias
    -- ========================================================================
    -- Tipo: detective_textual
    -- Validador: validate_detective_connections()
    -- Frontend DTO: { "connections": [{"from": "...", "to": "...", "relationship": "..."}] }
    -- DB Solution: { "connections": [{"from": "...", "to": "...", "relationship": "..."}] }
    -- ========================================================================

    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        '[TEST] Detective Textual: Investigación de los Descubrimientos de Curie',
        'Conecta las Evidencias para Resolver el Caso',
        'Analiza los documentos históricos y conecta las evidencias que están relacionadas. Explica la relación entre cada par de documentos.',
        'Lee cada evidencia cuidadosamente. Arrastra desde un documento hacia otro para crear una conexión. Escribe una breve descripción de la relación que identificas.',
        'detective_textual', 101,
        '{
            "allowMultipleConnections": true,
            "minConnectionsRequired": 3,
            "showEvidenceDetails": true,
            "validationFunction": "validate_detective_connections"
        }'::jsonb,
        '{
            "evidences": [
                {
                    "id": "evidence-1",
                    "title": "Artículo Científico: Comptes Rendus (1898)",
                    "type": "publication",
                    "content": "Presentamos el descubrimiento de dos nuevos elementos altamente radiactivos. El primero, al que denominamos POLONIO en honor a mi país natal, y el segundo, el RADIO, presenta una radiactividad extraordinaria.",
                    "date": "1898-12-26",
                    "author": "Pierre y Marie Curie"
                },
                {
                    "id": "evidence-2",
                    "title": "Cuaderno de Laboratorio Personal de Marie",
                    "type": "notes",
                    "content": "15 de diciembre, 1898: Después de procesar toneladas de pechblenda, finalmente hemos aislado una muestra pura. Los experimentos del 10 al 14 de diciembre confirmaron que el nuevo elemento mantiene una actividad constante.",
                    "date": "1898-12-15",
                    "author": "Marie Curie"
                },
                {
                    "id": "evidence-3",
                    "title": "Carta a la Academia de Ciencias",
                    "type": "correspondence",
                    "content": "Informo formalmente sobre el descubrimiento que hemos anunciado en Comptes Rendus. Los experimentos documentados en nuestros cuadernos de laboratorio desde septiembre confirman la naturaleza extraordinaria de este hallazgo.",
                    "date": "1899-01-03",
                    "author": "Marie Curie"
                },
                {
                    "id": "evidence-4",
                    "title": "Acta de Reunión de la Academia",
                    "type": "official_record",
                    "content": "Se recibió la comunicación de Madame Curie sobre sus descubrimientos. Tras examinar las muestras y revisar la documentación experimental, la Academia reconoce la importancia de este trabajo.",
                    "date": "1899-01-18",
                    "author": "Academia de Ciencias de Francia"
                }
            ]
        }'::jsonb,
        '{
            "connections": [
                {
                    "from": "evidence-1",
                    "to": "evidence-2",
                    "relationship": "documentation"
                },
                {
                    "from": "evidence-2",
                    "to": "evidence-3",
                    "relationship": "reference"
                },
                {
                    "from": "evidence-1",
                    "to": "evidence-3",
                    "relationship": "announcement"
                },
                {
                    "from": "evidence-3",
                    "to": "evidence-4",
                    "relationship": "response"
                }
            ]
        }'::jsonb,
        'intermediate', 100, 70,
        25, 3,
        ARRAY[
            'Busca fechas y referencias cruzadas entre documentos',
            'El cuaderno de laboratorio suele ser la fuente primaria de los artículos',
            'Las cartas oficiales típicamente hacen referencia a publicaciones previas'
        ]::text[],
        true, 20,
        150, 30,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        config = EXCLUDED.config,
        updated_at = NOW();

    -- ========================================================================
    -- TEST 2: PREDICCIÓN NARRATIVA - Escenarios Múltiples
    -- ========================================================================
    -- Tipo: prediccion_narrativa
    -- Validador: validate_prediction_scenarios()
    -- Frontend DTO: { "scenarios": { "s1": "pred_a", "s2": "pred_b" } }
    -- DB Solution: { "scenarios": { "scenario-1": "prediction-a", ... } }
    -- ========================================================================

    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        '[TEST] Predicción Narrativa: Las Decisiones de Marie Curie',
        'Predice las Acciones más Probables en Diferentes Escenarios',
        'Basándote en el contexto histórico y el carácter de Marie Curie, predice qué decisión tomaría en cada situación hipotética.',
        'Lee cada escenario cuidadosamente. Considera el contexto histórico, los valores de Marie, y sus motivaciones. Selecciona la predicción más probable.',
        'prediccion_narrativa', 102,
        '{
            "showContext": true,
            "allowExplanations": true,
            "multipleScenarios": true,
            "validationFunction": "validate_prediction_scenarios"
        }'::jsonb,
        '{
            "introduction": "Marie Curie fue una científica pionera conocida por su dedicación a la ciencia, su altruismo, y su determinación ante la adversidad.",
            "scenarios": [
                {
                    "id": "scenario-1",
                    "title": "La Oferta de Patente (1902)",
                    "context": "Tras descubrir el proceso de aislamiento del radio, Marie y Pierre reciben una oferta millonaria para patentar el proceso. La patente les haría inmensamente ricos.",
                    "question": "¿Qué decisión tomaría Marie?",
                    "predictions": [
                        {"id": "prediction-a", "text": "Rechazar la patente para que la ciencia sea libre y accesible"},
                        {"id": "prediction-b", "text": "Aceptar la patente para financiar más investigación"},
                        {"id": "prediction-c", "text": "Patentar pero licenciar gratuitamente a instituciones científicas"}
                    ]
                },
                {
                    "id": "scenario-2",
                    "title": "La Cátedra de la Sorbona (1906)",
                    "context": "La Universidad de la Sorbona ofrece a Marie suceder a su esposo como profesora de física, siendo la primera mujer profesora en 650 años.",
                    "question": "¿Qué haría Marie?",
                    "predictions": [
                        {"id": "prediction-d", "text": "Rechazar para continuar su investigación en el laboratorio"},
                        {"id": "prediction-e", "text": "Aceptar para inspirar a futuras mujeres científicas"},
                        {"id": "prediction-f", "text": "Delegar la cátedra en un colega masculino"}
                    ]
                },
                {
                    "id": "scenario-3",
                    "title": "El Segundo Nobel (1911)",
                    "context": "Marie es nominada para un segundo Nobel, pero enfrenta un escándalo mediático. Algunos le aconsejan rechazar el Nobel para evitar controversia.",
                    "question": "¿Qué decisión tomaría Marie?",
                    "predictions": [
                        {"id": "prediction-g", "text": "Rechazar el Nobel para proteger su reputación"},
                        {"id": "prediction-h", "text": "Retirarse de la vida pública por completo"},
                        {"id": "prediction-i", "text": "Aceptar el Nobel con dignidad, separando vida personal de logros científicos"}
                    ]
                },
                {
                    "id": "scenario-4",
                    "title": "La Primera Guerra Mundial (1914)",
                    "context": "Cuando estalla la Primera Guerra Mundial, Marie podría continuar su investigación en seguridad o contribuir directamente.",
                    "question": "¿Cómo contribuiría Marie?",
                    "predictions": [
                        {"id": "prediction-j", "text": "Permanecer en su laboratorio investigando"},
                        {"id": "prediction-k", "text": "Desarrollar unidades móviles de rayos X para hospitales de campaña"},
                        {"id": "prediction-l", "text": "Emigrar a un país neutral para proteger su trabajo"}
                    ]
                }
            ]
        }'::jsonb,
        '{
            "scenarios": {
                "scenario-1": "prediction-a",
                "scenario-2": "prediction-e",
                "scenario-3": "prediction-i",
                "scenario-4": "prediction-k"
            }
        }'::jsonb,
        'advanced', 100, 75,
        20, 3,
        ARRAY[
            'Considera los valores documentados de Marie: altruismo, dedicación científica',
            'Marie históricamente eligió el beneficio de la humanidad sobre el beneficio personal',
            'Nunca se rindió ante la adversidad o los prejuicios de género'
        ]::text[],
        true, 20,
        150, 30,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        config = EXCLUDED.config,
        updated_at = NOW();

    -- ========================================================================
    -- TEST 3: CONSTRUCCIÓN DE HIPÓTESIS - Asociación Causa-Efecto
    -- ========================================================================
    -- Tipo: construccion_hipotesis (NO causa_efecto - ese tipo no existe en ENUM)
    -- Validador: validate_cause_effect_matching()
    -- Frontend DTO: { "causes": { "c1": ["cons1", "cons2"], "c2": ["cons3"] } }
    -- DB Solution: { "causes": { "cause-1": ["consequence-a", ...], ... } }
    -- ========================================================================

    INSERT INTO educational_content.exercises (
        module_id, title, subtitle, description, instructions,
        exercise_type, order_index,
        config, content, solution,
        difficulty_level, max_points, passing_score,
        estimated_time_minutes, max_attempts,
        hints, enable_hints, hint_cost_ml_coins,
        xp_reward, ml_coins_reward,
        is_active, version
    ) VALUES (
        mod_id,
        '[TEST] Causa-Efecto: Impacto de los Descubrimientos de Curie',
        'Asocia Cada Causa con sus Consecuencias',
        'Identifica las consecuencias (efectos) que resultaron de cada causa relacionada con la vida y trabajo de Marie Curie.',
        'Lee cada causa en la columna izquierda. Arrastra las consecuencias correspondientes desde la columna derecha. Una causa puede tener 1-3 consecuencias.',
        'construccion_hipotesis', 103,
        '{
            "allowMultiple": true,
            "dragAndDrop": true,
            "showFeedback": true,
            "visualStyle": "columns",
            "validationFunction": "validate_cause_effect_matching"
        }'::jsonb,
        '{
            "causes": [
                {
                    "id": "cause-1",
                    "text": "Descubrimiento del radio y sus propiedades radiactivas (1898)",
                    "category": "scientific_discovery"
                },
                {
                    "id": "cause-2",
                    "text": "Decisión de no patentar el proceso de aislamiento del radio",
                    "category": "ethical_decision"
                },
                {
                    "id": "cause-3",
                    "text": "Exposición prolongada a radiación sin medidas de protección",
                    "category": "health_risk"
                },
                {
                    "id": "cause-4",
                    "text": "Ser la primera mujer profesora en la Universidad de la Sorbona (1906)",
                    "category": "social_milestone"
                },
                {
                    "id": "cause-5",
                    "text": "Ganar dos Premios Nobel en diferentes disciplinas (1903 y 1911)",
                    "category": "recognition"
                }
            ],
            "consequences": [
                {"id": "consequence-a", "text": "Desarrollo de tratamientos de radioterapia contra el cáncer"},
                {"id": "consequence-b", "text": "Fundación de la física nuclear como disciplina"},
                {"id": "consequence-c", "text": "Descubrimiento de la fisión nuclear por otros científicos"},
                {"id": "consequence-d", "text": "Otros científicos pudieron replicar la investigación libremente"},
                {"id": "consequence-e", "text": "No obtuvieron beneficios económicos significativos"},
                {"id": "consequence-f", "text": "La medicina nuclear se desarrolló más rápidamente"},
                {"id": "consequence-g", "text": "Marie desarrolló anemia aplásica y problemas de salud graves"},
                {"id": "consequence-h", "text": "Se establecieron protocolos de seguridad radiológica"},
                {"id": "consequence-i", "text": "Sus cuadernos siguen siendo radiactivos hoy en día"},
                {"id": "consequence-j", "text": "Inspiró a generaciones de mujeres a estudiar ciencia"},
                {"id": "consequence-k", "text": "Rompió barreras de género en la academia francesa"},
                {"id": "consequence-l", "text": "Estableció que las mujeres podían alcanzar el más alto nivel científico"},
                {"id": "consequence-m", "text": "Se convirtió en un icono científico reconocido mundialmente"},
                {"id": "consequence-n", "text": "Demostró que era posible ganar Nobel en más de una disciplina"},
                {"id": "consequence-o", "text": "Incrementó el prestigio de Francia en la comunidad científica"}
            ]
        }'::jsonb,
        '{
            "causes": {
                "cause-1": ["consequence-a", "consequence-b", "consequence-c"],
                "cause-2": ["consequence-d", "consequence-e", "consequence-f"],
                "cause-3": ["consequence-g", "consequence-h", "consequence-i"],
                "cause-4": ["consequence-j", "consequence-k", "consequence-l"],
                "cause-5": ["consequence-m", "consequence-n", "consequence-o"]
            }
        }'::jsonb,
        'advanced', 100, 70,
        25, 3,
        ARRAY[
            'Piensa en tres tipos de efectos: inmediatos, a largo plazo, y en otros',
            'Una causa científica puede tener efectos médicos, sociales y en futuras investigaciones',
            'Las decisiones éticas tienen consecuencias tanto positivas como negativas'
        ]::text[],
        true, 20,
        150, 30,
        true, 1
    ) ON CONFLICT (module_id, exercise_type, order_index) DO UPDATE SET
        content = EXCLUDED.content,
        solution = EXCLUDED.solution,
        config = EXCLUDED.config,
        updated_at = NOW();

    RAISE NOTICE '✅ Seeds de testing para nuevos validadores DB-117 creados exitosamente';
    RAISE NOTICE '📝 Ejercicios creados con order_index 101, 102, 103';
    RAISE NOTICE '🔧 Formato ajustado para compatibilidad con validadores implementados';
END $$;
