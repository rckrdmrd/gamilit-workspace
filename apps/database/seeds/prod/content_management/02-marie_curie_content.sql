-- =====================================================
-- Seed: content_management.marie_curie_contents
-- Description: Contenido curado sobre Marie Curie - biografía, descubrimientos, legado
-- Priority: P0 - CRÍTICO (Auditoría AUDIT-DB-001)
-- Created: 2025-12-14
-- =====================================================
--
-- Este seed crea el contenido educativo principal de GAMILIT
-- basado en la vida y obra de Marie Curie.
--
-- Categorías de contenido (CHECK constraint):
-- - biography: Datos biográficos
-- - discoveries: Descubrimientos científicos
-- - historical_context: Contexto histórico
-- - scientific_method: Metodología científica
-- - radioactivity: Radiactividad
-- - nobel_prizes: Premios Nobel
-- - women_in_science: Mujeres en la ciencia
-- - modern_physics: Física moderna
-- - legacy: Legado
-- =====================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_admin_id UUID;
BEGIN
    -- Obtener tenant principal (puede ser 'GAMILIT Platform' o 'GAMILIT Principal')
    SELECT id INTO v_tenant_id FROM auth_management.tenants
    WHERE name LIKE 'GAMILIT%' OR id = 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid
    LIMIT 1;

    -- Admin para created_by
    v_admin_id := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'::uuid;

    IF v_tenant_id IS NULL THEN
        -- Usar UUID por defecto si no se encuentra
        v_tenant_id := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11'::uuid;
        RAISE NOTICE 'Usando tenant por defecto: %', v_tenant_id;
    END IF;

    RAISE NOTICE 'Creando contenido de Marie Curie...';

    -- =====================================================
    -- 1. BIOGRAFÍA - PRIMEROS AÑOS
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000001'::uuid,
        v_tenant_id,
        'Marie Curie: Primeros Años en Polonia',
        'El nacimiento de una mente brillante',
        'Explora la infancia y juventud de Maria Sklodowska en Varsovia, Polonia, su temprano amor por el aprendizaje y los desafíos que enfrentó como mujer en busca de educación en el siglo XIX.',
        'biography',
        '{
            "introduction": "Maria Salomea Sklodowska nació el 7 de noviembre de 1867 en Varsovia, Polonia, cuando el país estaba bajo el dominio del Imperio Ruso.",
            "main_content": "Desde muy joven, Maria demostró una extraordinaria capacidad intelectual. Era la menor de cinco hermanos en una familia de educadores. Su padre, Wladyslaw, era profesor de matemáticas y física, y su madre, Bronislawa, dirigía una prestigiosa escuela para niñas. La educación era profundamente valorada en la familia Sklodowski.",
            "key_points": [
                "Nació el 7 de noviembre de 1867 en Varsovia, Polonia",
                "Era la menor de cinco hermanos",
                "Su padre era profesor de matemáticas y física",
                "Desde niña mostró memoria excepcional y amor por el aprendizaje",
                "Aprendió a leer a los 4 años"
            ],
            "timeline": [
                {"year": 1867, "event": "Nacimiento en Varsovia"},
                {"year": 1876, "event": "Muerte de su hermana Zofia por tifus"},
                {"year": 1878, "event": "Muerte de su madre por tuberculosis"},
                {"year": 1883, "event": "Graduación con medalla de oro"}
            ],
            "quotes": [
                {"text": "Nada en la vida debe ser temido, solo debe ser entendido.", "context": "Sobre el conocimiento científico"}
            ]
        }'::jsonb,
        ARRAY['6', '7', '8'],
        'beginner',
        ARRAY['Conocer los orígenes de Marie Curie', 'Comprender el contexto histórico de Polonia', 'Identificar influencias familiares en su educación'],
        ARRAY['Polonia', 'Varsovia', 'Imperio Ruso', 'educación', 'familia Sklodowski'],
        '1867-1891',
        'Biography',
        'published',
        true,
        ARRAY['marie curie', 'biografía', 'polonia', 'infancia', 'educación'],
        ARRAY['#marie-curie', '#biografia', '#primeros-años', '#polonia'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Biografía: Primeros Años en Polonia';

    -- =====================================================
    -- 2. BIOGRAFÍA - LLEGADA A PARÍS
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000002'::uuid,
        v_tenant_id,
        'El Sueño de París: Marie en la Sorbona',
        'Persiguiendo la educación contra todo pronóstico',
        'La determinación de Marie para estudiar en la Universidad de París y sus primeros años como estudiante de física y matemáticas en la Sorbona.',
        'biography',
        '{
            "introduction": "En 1891, a los 24 años, Maria Sklodowska finalmente llegó a París para cumplir su sueño de estudiar ciencias en la prestigiosa Universidad de la Sorbona.",
            "main_content": "Marie vivía en condiciones muy humildes en el Barrio Latino. Su pequeña habitación en el sexto piso no tenía calefacción ni agua corriente. A menudo se olvidaba de comer, tan absorta estaba en sus estudios. A pesar de las dificultades económicas y el frío parisino, Marie se graduó primera de su promoción en física en 1893, y segunda en matemáticas en 1894.",
            "key_points": [
                "Llegó a París en noviembre de 1891",
                "Se inscribió en la Facultad de Ciencias de la Sorbona",
                "Cambió su nombre a Marie",
                "Primera de su promoción en física (1893)",
                "Segunda en matemáticas (1894)"
            ],
            "timeline": [
                {"year": 1891, "event": "Llegada a París e inscripción en la Sorbona"},
                {"year": 1893, "event": "Licenciatura en Física (1ª de su promoción)"},
                {"year": 1894, "event": "Licenciatura en Matemáticas"},
                {"year": 1894, "event": "Conoce a Pierre Curie"}
            ],
            "quotes": [
                {"text": "La vida no es fácil para ninguno de nosotros. Pero... ¡qué importa! Debemos tener perseverancia.", "context": "Sobre su tiempo en París"}
            ]
        }'::jsonb,
        ARRAY['6', '7', '8'],
        'beginner',
        ARRAY['Valorar la perseverancia académica', 'Comprender las barreras para mujeres en educación', 'Conocer la vida universitaria del siglo XIX'],
        ARRAY['Sorbona', 'París', 'universidad', 'Barrio Latino', 'física', 'matemáticas'],
        '1891-1894',
        'Biography',
        'published',
        true,
        ARRAY['marie curie', 'sorbona', 'paris', 'universidad', 'educación'],
        ARRAY['#marie-curie', '#sorbona', '#paris', '#universidad'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Biografía: Llegada a París';

    -- =====================================================
    -- 3. DESCUBRIMIENTOS - RADIACTIVIDAD
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000003'::uuid,
        v_tenant_id,
        'El Descubrimiento de la Radiactividad',
        'Una nueva era en la física',
        'El revolucionario trabajo de Marie Curie que llevó al descubrimiento del polonio y el radio, y la acuñación del término "radiactividad".',
        'discoveries',
        '{
            "introduction": "En 1898, Marie Curie descubrió dos nuevos elementos químicos y acuñó el término radiactividad para describir la emisión espontánea de radiación por ciertos materiales.",
            "main_content": "Marie eligió estudiar los misteriosos rayos de uranio descubiertos por Henri Becquerel para su tesis doctoral. Trabajando en un cobertizo frío y húmedo en la Escuela de Física, desarrolló técnicas innovadoras para medir la intensidad de la radiación. Descubrió que el mineral pechblenda era más radiactivo que el uranio puro, lo que sugería la presencia de elementos desconocidos.",
            "key_points": [
                "Acuñó el término ''radiactividad'' en 1898",
                "Descubrió el polonio (nombrado en honor a Polonia)",
                "Descubrió el radio (del latín radius, rayo)",
                "Trabajó en condiciones extremadamente difíciles",
                "Procesó toneladas de pechblenda para aislar el radio"
            ],
            "timeline": [
                {"year": 1897, "event": "Inicio de investigación sobre rayos de uranio"},
                {"year": 1898, "event": "Descubrimiento del polonio (julio)"},
                {"year": 1898, "event": "Descubrimiento del radio (diciembre)"},
                {"year": 1902, "event": "Aislamiento de radio puro"},
                {"year": 1903, "event": "Tesis doctoral sobre sustancias radiactivas"}
            ],
            "quotes": [
                {"text": "Uno nunca nota lo que se ha hecho; uno solo puede ver lo que queda por hacer.", "context": "Sobre el trabajo científico"}
            ]
        }'::jsonb,
        ARRAY['7', '8', '9'],
        'intermediate',
        ARRAY['Comprender el concepto de radiactividad', 'Conocer el proceso del descubrimiento científico', 'Valorar la metodología de investigación'],
        ARRAY['radiactividad', 'polonio', 'radio', 'pechblenda', 'uranio', 'elementos químicos'],
        '1897-1903',
        'Physics',
        'published',
        true,
        ARRAY['radiactividad', 'polonio', 'radio', 'descubrimiento', 'física'],
        ARRAY['#radiactividad', '#polonio', '#radio', '#descubrimiento'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Descubrimientos: Radiactividad';

    -- =====================================================
    -- 4. PREMIOS NOBEL
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000004'::uuid,
        v_tenant_id,
        'Dos Premios Nobel: Un Logro Histórico',
        'La primera persona en ganar dos Premios Nobel',
        'Marie Curie hizo historia al ser la primera mujer en ganar un Premio Nobel y la primera persona en ganar dos en diferentes disciplinas científicas.',
        'nobel_prizes',
        '{
            "introduction": "Marie Curie es la única persona en la historia en recibir Premios Nobel en dos ciencias diferentes: Física (1903) y Química (1911).",
            "main_content": "En 1903, Marie compartió el Premio Nobel de Física con su esposo Pierre y Henri Becquerel por sus investigaciones sobre radiactividad. Inicialmente, el comité solo había nominado a Pierre y Becquerel, pero Pierre insistió en que Marie fuera incluida. En 1911, recibió el Premio Nobel de Química en solitario por el descubrimiento del polonio y el radio.",
            "key_points": [
                "Primera mujer en ganar un Premio Nobel (1903)",
                "Premio Nobel de Física 1903 (compartido)",
                "Premio Nobel de Química 1911 (individual)",
                "Única persona con Nobel en dos ciencias diferentes",
                "Primera mujer en ser profesora en la Sorbona"
            ],
            "timeline": [
                {"year": 1903, "event": "Premio Nobel de Física (con Pierre y Becquerel)"},
                {"year": 1906, "event": "Sucede a Pierre como profesora en la Sorbona"},
                {"year": 1911, "event": "Premio Nobel de Química (individual)"}
            ],
            "quotes": [
                {"text": "Soy de las que piensan que la ciencia tiene una gran belleza.", "context": "Sobre su pasión por la ciencia"}
            ]
        }'::jsonb,
        ARRAY['7', '8', '9'],
        'intermediate',
        ARRAY['Conocer los logros históricos de Marie Curie', 'Comprender la importancia de los Premios Nobel', 'Valorar el reconocimiento científico'],
        ARRAY['Premio Nobel', 'Física', 'Química', 'Estocolmo', 'reconocimiento científico'],
        '1903-1911',
        'Physics',
        'published',
        true,
        ARRAY['premio nobel', 'física', 'química', 'historia', 'logros'],
        ARRAY['#nobel', '#premio', '#historia', '#logros'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Premios Nobel';

    -- =====================================================
    -- 5. MUJERES EN LA CIENCIA
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000005'::uuid,
        v_tenant_id,
        'Rompiendo Barreras: Marie Curie y las Mujeres en la Ciencia',
        'Un legado de inspiración',
        'El impacto de Marie Curie como pionera para las mujeres en la ciencia y su lucha contra los prejuicios de género en la academia.',
        'women_in_science',
        '{
            "introduction": "Marie Curie no solo hizo contribuciones monumentales a la ciencia, sino que abrió puertas para las mujeres en campos tradicionalmente dominados por hombres.",
            "main_content": "En una época donde las mujeres tenían acceso limitado a la educación superior, Marie tuvo que superar innumerables obstáculos. Fue la primera mujer en obtener un doctorado en ciencias en Francia, la primera profesora en la Sorbona, y la primera mujer en ser enterrada en el Panteón de París por méritos propios. Su hija Irène continuó su legado y también ganó el Premio Nobel.",
            "key_points": [
                "Primera mujer con doctorado en ciencias en Francia",
                "Primera profesora de la Universidad de París",
                "Primera mujer enterrada en el Panteón por méritos propios",
                "Su hija Irène también ganó el Premio Nobel (1935)",
                "Inspiración para generaciones de científicas"
            ],
            "timeline": [
                {"year": 1903, "event": "Primera mujer en ganar un Premio Nobel"},
                {"year": 1906, "event": "Primera profesora en la Sorbona"},
                {"year": 1995, "event": "Primera mujer enterrada en el Panteón por méritos propios"}
            ],
            "quotes": [
                {"text": "Sé menos curioso sobre las personas y más curioso sobre las ideas.", "context": "Consejo a jóvenes científicos"}
            ]
        }'::jsonb,
        ARRAY['6', '7', '8', '9'],
        'beginner',
        ARRAY['Valorar la lucha por la igualdad de género', 'Conocer barreras históricas para mujeres', 'Inspirarse en el legado de Marie Curie'],
        ARRAY['igualdad', 'mujeres', 'ciencia', 'pionera', 'Irène Joliot-Curie'],
        '1867-presente',
        'History of Science',
        'published',
        true,
        ARRAY['mujeres', 'ciencia', 'igualdad', 'pionera', 'inspiración'],
        ARRAY['#mujeres-en-ciencia', '#igualdad', '#pionera', '#inspiración'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Mujeres en la Ciencia';

    -- =====================================================
    -- 6. LEGADO
    -- =====================================================
    INSERT INTO content_management.marie_curie_contents (
        id,
        tenant_id,
        title,
        subtitle,
        description,
        category,
        content,
        target_grade_levels,
        difficulty_level,
        learning_objectives,
        key_vocabulary,
        historical_period,
        scientific_field,
        status,
        is_featured,
        keywords,
        search_tags,
        created_by
    ) VALUES (
        '50000001-0000-0000-0000-000000000006'::uuid,
        v_tenant_id,
        'El Legado Eterno de Marie Curie',
        'Una vida dedicada a la ciencia y la humanidad',
        'El impacto duradero de Marie Curie en la ciencia, la medicina y la sociedad, desde el tratamiento del cáncer hasta la inspiración de futuras generaciones.',
        'legacy',
        '{
            "introduction": "El legado de Marie Curie trasciende sus descubrimientos científicos: sus contribuciones salvaron millones de vidas y continúan inspirando a científicos de todo el mundo.",
            "main_content": "Durante la Primera Guerra Mundial, Marie organizó unidades móviles de rayos X (''petites Curies'') para ayudar a los médicos del frente a localizar balas y metralla en los cuerpos de los soldados. Ella misma condujo estas unidades y entrenó a otras mujeres para operarlas. El Instituto del Radio que fundó en París (hoy Instituto Curie) sigue siendo un centro líder en investigación del cáncer.",
            "key_points": [
                "Fundó el Instituto del Radio (hoy Instituto Curie)",
                "Creó unidades móviles de rayos X en la WWI",
                "Sus investigaciones llevaron a tratamientos contra el cáncer",
                "El elemento 96 (Curio) lleva su nombre",
                "Inspiración para generaciones de científicos"
            ],
            "timeline": [
                {"year": 1914, "event": "Organización de unidades de rayos X en WWI"},
                {"year": 1921, "event": "Visita a EE.UU. - Recibe 1g de radio"},
                {"year": 1934, "event": "Fallecimiento por anemia aplásica"},
                {"year": 1944, "event": "Elemento 96 (Curio) nombrado en su honor"},
                {"year": 1995, "event": "Traslado al Panteón de París"}
            ],
            "quotes": [
                {"text": "En la vida no hay cosas que temer, solo cosas que comprender.", "context": "Su filosofía de vida"}
            ]
        }'::jsonb,
        ARRAY['7', '8', '9'],
        'intermediate',
        ARRAY['Comprender el impacto de la ciencia en la sociedad', 'Valorar las contribuciones humanitarias', 'Conocer aplicaciones médicas de la radiactividad'],
        ARRAY['legado', 'Instituto Curie', 'rayos X', 'medicina', 'cáncer', 'Primera Guerra Mundial'],
        '1914-presente',
        'Medicine',
        'published',
        true,
        ARRAY['legado', 'instituto curie', 'medicina', 'rayos x', 'humanidad'],
        ARRAY['#legado', '#instituto-curie', '#medicina', '#humanidad'],
        v_admin_id
    )
    ON CONFLICT (id) DO UPDATE SET
        title = EXCLUDED.title,
        content = EXCLUDED.content,
        status = 'published',
        updated_at = gamilit.now_mexico();

    RAISE NOTICE '✅ Legado';

    -- =====================================================
    -- VERIFICACIÓN
    -- =====================================================
    RAISE NOTICE '';
    RAISE NOTICE '=== CONTENIDO MARIE CURIE CREADO ===';
    RAISE NOTICE 'Total artículos: %', (SELECT COUNT(*) FROM content_management.marie_curie_contents);
    RAISE NOTICE 'Publicados: %', (SELECT COUNT(*) FROM content_management.marie_curie_contents WHERE status = 'published');
    RAISE NOTICE 'Destacados: %', (SELECT COUNT(*) FROM content_management.marie_curie_contents WHERE is_featured = true);

END $$;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================
DO $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM content_management.marie_curie_contents;

    IF v_count < 5 THEN
        RAISE WARNING '⚠️ Se esperaban al menos 5 artículos de Marie Curie';
    ELSE
        RAISE NOTICE '✅ Seed de marie_curie_contents completado exitosamente';
    END IF;
END $$;
