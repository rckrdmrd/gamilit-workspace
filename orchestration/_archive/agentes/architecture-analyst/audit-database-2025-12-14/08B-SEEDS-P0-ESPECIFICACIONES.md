# ESPECIFICACIONES SEEDS P0 - IMPLEMENTACIÓN

**Fecha:** 2025-12-14
**Prioridad:** P0 - CRÍTICO
**Fase:** 1 (Semana 1)

---

## SEEDS CRÍTICOS A IMPLEMENTAR

### 1. `auth_management/04-user_roles.sql`

**Tabla:** `auth_management.user_roles`
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Sin roles, el sistema de permisos no funciona

#### Estructura Esperada

```sql
-- =====================================================
-- SEED: User Roles - Sistema de Roles y Permisos
-- Schema: auth_management
-- Tabla: user_roles
-- Prioridad: P0 - CRÍTICO
-- =====================================================

-- Truncate para idempotencia
TRUNCATE TABLE auth_management.user_roles RESTART IDENTITY CASCADE;

-- Rol: Super Admin
INSERT INTO auth_management.user_roles (
    role_name,
    role_description,
    permissions,
    is_system_role,
    created_at,
    updated_at
) VALUES (
    'super_admin',
    'Super Administrador con acceso completo al sistema',
    jsonb_build_object(
        'admin', jsonb_build_array('*'),
        'users', jsonb_build_array('create', 'read', 'update', 'delete', 'suspend'),
        'content', jsonb_build_array('*'),
        'gamification', jsonb_build_array('*'),
        'reports', jsonb_build_array('*'),
        'system', jsonb_build_array('*')
    ),
    true,
    now(),
    now()
);

-- Rol: Admin
INSERT INTO auth_management.user_roles (
    role_name,
    role_description,
    permissions,
    is_system_role,
    created_at,
    updated_at
) VALUES (
    'admin',
    'Administrador con acceso a gestión de usuarios y contenido',
    jsonb_build_object(
        'users', jsonb_build_array('read', 'update', 'create'),
        'content', jsonb_build_array('create', 'read', 'update', 'delete'),
        'classrooms', jsonb_build_array('*'),
        'reports', jsonb_build_array('read', 'export'),
        'moderation', jsonb_build_array('*')
    ),
    true,
    now(),
    now()
);

-- Rol: Teacher
INSERT INTO auth_management.user_roles (
    role_name,
    role_description,
    permissions,
    is_system_role,
    created_at,
    updated_at
) VALUES (
    'teacher',
    'Profesor con acceso a gestión de aulas y asignaciones',
    jsonb_build_object(
        'classrooms', jsonb_build_array('create', 'read', 'update'),
        'assignments', jsonb_build_array('create', 'read', 'update', 'delete', 'grade'),
        'students', jsonb_build_array('read', 'progress'),
        'content', jsonb_build_array('read', 'create_teacher_content'),
        'reports', jsonb_build_array('read', 'classroom_reports')
    ),
    true,
    now(),
    now()
);

-- Rol: Student
INSERT INTO auth_management.user_roles (
    role_name,
    role_description,
    permissions,
    is_system_role,
    created_at,
    updated_at
) VALUES (
    'student',
    'Estudiante con acceso a ejercicios y progreso personal',
    jsonb_build_object(
        'exercises', jsonb_build_array('read', 'submit'),
        'assignments', jsonb_build_array('read', 'submit'),
        'progress', jsonb_build_array('read'),
        'gamification', jsonb_build_array('read', 'earn'),
        'social', jsonb_build_array('read', 'interact')
    ),
    true,
    now(),
    now()
);

-- Rol: Parent (Portal Padres - Extension EXT-010)
INSERT INTO auth_management.user_roles (
    role_name,
    role_description,
    permissions,
    is_system_role,
    created_at,
    updated_at
) VALUES (
    'parent',
    'Padre/Tutor con acceso a progreso de estudiantes vinculados',
    jsonb_build_object(
        'students', jsonb_build_array('read_linked'),
        'progress', jsonb_build_array('read_child_progress'),
        'notifications', jsonb_build_array('read'),
        'reports', jsonb_build_array('read_child_reports')
    ),
    true,
    now(),
    now()
);

-- Verificación
SELECT
    role_name,
    role_description,
    jsonb_pretty(permissions) as permissions,
    is_system_role
FROM auth_management.user_roles
ORDER BY
    CASE role_name
        WHEN 'super_admin' THEN 1
        WHEN 'admin' THEN 2
        WHEN 'teacher' THEN 3
        WHEN 'student' THEN 4
        WHEN 'parent' THEN 5
    END;
```

**Validación Post-Seed:**
```sql
-- Debe retornar 5 roles
SELECT COUNT(*) FROM auth_management.user_roles WHERE is_system_role = true;
```

---

### 2. `content_management/02-marie_curie_content.sql`

**Tabla:** `content_management.marie_curie_content`
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Contenido biográfico central faltante

#### Estructura Esperada

```sql
-- =====================================================
-- SEED: Marie Curie Content - Contenido Biográfico
-- Schema: content_management
-- Tabla: marie_curie_content
-- Prioridad: P0 - CRÍTICO
-- =====================================================

TRUNCATE TABLE content_management.marie_curie_content RESTART IDENTITY CASCADE;

-- 1. Infancia y Juventud (1867-1891)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-childhood',
    'Infancia y Juventud de Marie Curie',
    'biography',
    'Marie Skłodowska nació el 7 de noviembre de 1867 en Varsovia, Polonia. Desde pequeña mostró un amor excepcional por el aprendizaje. A pesar de las dificultades económicas y las restricciones para mujeres en la educación, Marie se destacó en sus estudios. Trabajó como institutriz para ahorrar dinero y ayudar a su hermana Bronia a estudiar medicina en París, con el acuerdo de que luego Bronia la ayudaría a ella.',
    jsonb_build_object(
        'period', '1867-1891',
        'location', 'Varsovia, Polonia',
        'key_themes', jsonb_build_array('educación', 'determinación', 'familia'),
        'related_modules', jsonb_build_array('MOD-01-LITERAL'),
        'reading_time_minutes', 5
    ),
    ARRAY['5', '6', '7', '8'],
    ARRAY['infancia', 'educación', 'polonia', 'varsovia', 'familia'],
    now(),
    now()
);

-- 2. Estudios en París (1891-1894)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-paris-studies',
    'Estudios en la Sorbona',
    'biography',
    'En 1891, Marie llegó a París para estudiar en la Universidad de la Sorbona. Vivió en condiciones muy difíciles, en un pequeño ático sin calefacción. Se dedicó intensamente a sus estudios de Física y Matemáticas. En 1893, obtuvo su licenciatura en Física, siendo la primera de su clase. Un año después, obtuvo su segunda licenciatura en Matemáticas. Durante este periodo conoció a Pierre Curie, un físico brillante que trabajaba en cristalografía.',
    jsonb_build_object(
        'period', '1891-1894',
        'location', 'París, Francia',
        'key_themes', jsonb_build_array('educación superior', 'física', 'matemáticas'),
        'related_modules', jsonb_build_array('MOD-01-LITERAL', 'MOD-02-INFERENCIAL'),
        'reading_time_minutes', 6
    ),
    ARRAY['6', '7', '8', '9'],
    ARRAY['sorbona', 'física', 'matemáticas', 'parís', 'educación'],
    now(),
    now()
);

-- 3. Investigación sobre Radiactividad (1895-1903)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-radioactivity-research',
    'Descubrimiento de la Radiactividad',
    'scientific_achievement',
    'Marie y Pierre Curie se casaron en 1895 y comenzaron a trabajar juntos. Marie decidió investigar los rayos de uranio descubiertos por Henri Becquerel. Descubrió que la intensidad de la radiación era proporcional a la cantidad de uranio, independientemente de su forma química. Esto sugería que la radiación provenía del átomo mismo. Marie acuñó el término "radiactividad". Junto a Pierre, descubrió dos nuevos elementos: el polonio (nombrado por su país natal) y el radio. Este trabajo requirió procesar toneladas de mineral de uranio en condiciones precarias.',
    jsonb_build_object(
        'period', '1895-1903',
        'location', 'París, Francia',
        'key_themes', jsonb_build_array('investigación', 'radiactividad', 'descubrimientos'),
        'related_modules', jsonb_build_array('MOD-02-INFERENCIAL', 'MOD-03-CRITICA'),
        'reading_time_minutes', 8,
        'key_concepts', jsonb_build_array('radiactividad', 'polonio', 'radio', 'átomo')
    ),
    ARRAY['7', '8', '9'],
    ARRAY['radiactividad', 'polonio', 'radio', 'ciencia', 'descubrimiento', 'investigación'],
    now(),
    now()
);

-- 4. Premio Nobel de Física (1903)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-nobel-physics-1903',
    'Primer Premio Nobel (Física, 1903)',
    'award',
    'En 1903, Marie Curie, Pierre Curie y Henri Becquerel recibieron el Premio Nobel de Física por sus investigaciones sobre la radiactividad. Marie fue la primera mujer en recibir un Premio Nobel. Inicialmente, el comité solo consideraba a Pierre y Becquerel, pero Pierre insistió en que el trabajo de Marie era fundamental y debía ser reconocida. Este reconocimiento rompió barreras de género en la ciencia.',
    jsonb_build_object(
        'period', '1903',
        'award_type', 'Premio Nobel de Física',
        'shared_with', jsonb_build_array('Pierre Curie', 'Henri Becquerel'),
        'significance', 'Primera mujer en recibir Premio Nobel',
        'related_modules', jsonb_build_array('MOD-03-CRITICA'),
        'reading_time_minutes', 5
    ),
    ARRAY['7', '8', '9'],
    ARRAY['nobel', 'física', 'premio', 'reconocimiento', 'mujer', 'pionera'],
    now(),
    now()
);

-- 5. Muerte de Pierre y Continuación (1906-1911)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-after-pierre',
    'Después de la Muerte de Pierre',
    'biography',
    'En 1906, Pierre Curie murió trágicamente en un accidente de tráfico. Marie quedó devastada, pero decidió continuar su investigación. La Universidad de la Sorbona le ofreció la cátedra de Física que había ocupado Pierre, convirtiéndose en la primera mujer profesora de la Sorbona. Marie se dedicó a aislar el radio puro y determinar sus propiedades. Su trabajo fue tan significativo que en 1911 recibió un segundo Premio Nobel, esta vez en Química, siendo la primera persona en recibir dos Premios Nobel en diferentes disciplinas.',
    jsonb_build_object(
        'period', '1906-1911',
        'key_events', jsonb_build_array(
            'Muerte de Pierre (1906)',
            'Primera profesora Sorbona',
            'Segundo Nobel (1911)'
        ),
        'key_themes', jsonb_build_array('resiliencia', 'determinación', 'logros científicos'),
        'related_modules', jsonb_build_array('MOD-03-CRITICA', 'MOD-05-CREATIVO'),
        'reading_time_minutes', 7
    ),
    ARRAY['7', '8', '9'],
    ARRAY['nobel', 'química', 'sorbona', 'profesora', 'resiliencia', 'pionera'],
    now(),
    now()
);

-- 6. Primera Guerra Mundial y Unidades Móviles de Rayos X
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-wwi-xray',
    'Servicio durante la Primera Guerra Mundial',
    'contribution',
    'Durante la Primera Guerra Mundial (1914-1918), Marie Curie aplicó sus conocimientos para ayudar a los heridos. Desarrolló unidades móviles de rayos X que podían trasladarse al frente de batalla. Estas unidades, apodadas "petites Curies", permitían a los médicos localizar balas y metralla en los soldados heridos. Marie condujo personalmente una de estas unidades y capacitó a otras mujeres para operarlas. Se estima que estas unidades ayudaron a más de un millón de soldados.',
    jsonb_build_object(
        'period', '1914-1918',
        'key_themes', jsonb_build_array('servicio humanitario', 'aplicación práctica', 'liderazgo'),
        'impact', 'Más de 1 millón de soldados atendidos',
        'related_modules', jsonb_build_array('MOD-04-DIGITAL', 'MOD-05-CREATIVO'),
        'reading_time_minutes', 6
    ),
    ARRAY['8', '9'],
    ARRAY['guerra', 'rayos-x', 'servicio', 'humanitario', 'medicina', 'innovación'],
    now(),
    now()
);

-- 7. Legado y Muerte (1920-1934)
INSERT INTO content_management.marie_curie_content (
    content_id,
    title,
    content_type,
    content_text,
    metadata,
    grade_levels,
    keywords,
    created_at,
    updated_at
) VALUES (
    'marie-legacy',
    'Legado y Últimos Años',
    'biography',
    'En sus últimos años, Marie Curie continuó investigando y dirigiendo el Instituto del Radio en París. Luchó por la educación científica y el acceso de las mujeres a la ciencia. Sin embargo, su prolongada exposición a la radiactividad sin protección adecuada afectó gravemente su salud. Marie Curie murió el 4 de julio de 1934 de anemia aplásica, probablemente causada por la exposición a la radiación. Su legado perdura: fue pionera en la investigación de la radiactividad, rompió barreras de género en la ciencia, y sus descubrimientos han salvado millones de vidas a través de tratamientos médicos. Sus hijas también hicieron contribuciones científicas significativas: Irène Joliot-Curie ganó el Premio Nobel de Química en 1935.',
    jsonb_build_object(
        'period', '1920-1934',
        'key_themes', jsonb_build_array('legado', 'impacto', 'familia científica'),
        'family_legacy', jsonb_build_object(
            'daughter_irene', 'Premio Nobel Química 1935',
            'scientific_dynasty', 'Familia con más Premios Nobel'
        ),
        'related_modules', jsonb_build_array('MOD-05-CREATIVO'),
        'reading_time_minutes', 8
    ),
    ARRAY['7', '8', '9'],
    ARRAY['legado', 'impacto', 'familia', 'ciencia', 'pionera', 'inspiración'],
    now(),
    now()
);

-- Verificación
SELECT
    content_id,
    title,
    content_type,
    jsonb_pretty(metadata) as metadata_preview
FROM content_management.marie_curie_content
ORDER BY created_at;
```

**Validación Post-Seed:**
```sql
-- Debe retornar 7 contenidos
SELECT COUNT(*) FROM content_management.marie_curie_content;

-- Verificar keywords
SELECT DISTINCT unnest(keywords) as keyword
FROM content_management.marie_curie_content
ORDER BY keyword;
```

---

### 3. `educational_content/11-module_dependencies.sql`

**Tabla:** `educational_content.module_dependencies`
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Progresión sin validación

#### Estructura Esperada

```sql
-- =====================================================
-- SEED: Module Dependencies - Dependencias de Módulos
-- Schema: educational_content
-- Tabla: module_dependencies
-- Prioridad: P0 - CRÍTICO
-- =====================================================

TRUNCATE TABLE educational_content.module_dependencies RESTART IDENTITY CASCADE;

-- Dependencia: MOD-02 requiere MOD-01
INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL'),
    'prerequisite',
    80.0,
    true,
    now()
);

-- Dependencia: MOD-03 requiere MOD-02
INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL'),
    'prerequisite',
    80.0,
    true,
    now()
);

-- Dependencia: MOD-03 recomienda MOD-01 (completado)
INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL'),
    'recommended',
    100.0,
    false,
    now()
);

-- Dependencia: MOD-04 requiere MOD-01 y MOD-02
INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL'),
    'prerequisite',
    75.0,
    true,
    now()
);

INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-02-INFERENCIAL'),
    'prerequisite',
    75.0,
    true,
    now()
);

-- Dependencia: MOD-05 requiere todos los anteriores
INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-05-CREATIVO'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA'),
    'prerequisite',
    80.0,
    true,
    now()
);

INSERT INTO educational_content.module_dependencies (
    module_id,
    depends_on_module_id,
    dependency_type,
    minimum_completion_percentage,
    is_strict,
    created_at
) VALUES (
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-05-CREATIVO'),
    (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-04-DIGITAL'),
    'recommended',
    70.0,
    false,
    now()
);

-- Verificación
SELECT
    m1.module_code || ' (' || m1.title || ')' as module,
    md.dependency_type,
    m2.module_code || ' (' || m2.title || ')' as depends_on,
    md.minimum_completion_percentage || '%' as min_completion,
    CASE WHEN md.is_strict THEN 'Sí' ELSE 'No' END as strict
FROM educational_content.module_dependencies md
JOIN educational_content.modules m1 ON md.module_id = m1.id
JOIN educational_content.modules m2 ON md.depends_on_module_id = m2.id
ORDER BY m1.module_code, md.dependency_type DESC;
```

**Validación Post-Seed:**
```sql
-- Debe retornar 7 dependencias
SELECT COUNT(*) FROM educational_content.module_dependencies;

-- Verificar que MOD-05 tiene más dependencias
SELECT module_code, COUNT(*) as dependencies
FROM educational_content.module_dependencies md
JOIN educational_content.modules m ON md.module_id = m.id
GROUP BY module_code
ORDER BY dependencies DESC;
```

---

### 4. `educational_content/12-taxonomies.sql`

**Tabla:** `educational_content.taxonomies`
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** Clasificación educativa faltante

#### Estructura Esperada

```sql
-- =====================================================
-- SEED: Taxonomies - Taxonomías Educativas
-- Schema: educational_content
-- Tabla: taxonomies
-- Prioridad: P0 - CRÍTICO
-- =====================================================

TRUNCATE TABLE educational_content.taxonomies RESTART IDENTITY CASCADE;

-- ========================================
-- BLOOM TAXONOMY
-- ========================================

INSERT INTO educational_content.taxonomies (
    taxonomy_type,
    taxonomy_code,
    taxonomy_name,
    taxonomy_description,
    level_order,
    metadata,
    created_at
) VALUES
    ('bloom_taxonomy', 'BLOOM-01-REMEMBER', 'Recordar',
     'Recuperar información relevante de la memoria a largo plazo',
     1,
     jsonb_build_object(
         'keywords', jsonb_build_array('definir', 'listar', 'recordar', 'identificar'),
         'related_modules', jsonb_build_array('MOD-01-LITERAL')
     ),
     now()),

    ('bloom_taxonomy', 'BLOOM-02-UNDERSTAND', 'Comprender',
     'Construir significado a partir de mensajes orales, escritos y gráficos',
     2,
     jsonb_build_object(
         'keywords', jsonb_build_array('explicar', 'resumir', 'interpretar', 'ejemplificar'),
         'related_modules', jsonb_build_array('MOD-01-LITERAL', 'MOD-02-INFERENCIAL')
     ),
     now()),

    ('bloom_taxonomy', 'BLOOM-03-APPLY', 'Aplicar',
     'Llevar a cabo o usar un procedimiento en una situación dada',
     3,
     jsonb_build_object(
         'keywords', jsonb_build_array('ejecutar', 'implementar', 'usar', 'demostrar'),
         'related_modules', jsonb_build_array('MOD-02-INFERENCIAL', 'MOD-04-DIGITAL')
     ),
     now()),

    ('bloom_taxonomy', 'BLOOM-04-ANALYZE', 'Analizar',
     'Descomponer material en sus partes y determinar cómo se relacionan',
     4,
     jsonb_build_object(
         'keywords', jsonb_build_array('diferenciar', 'organizar', 'atribuir', 'comparar'),
         'related_modules', jsonb_build_array('MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
     ),
     now()),

    ('bloom_taxonomy', 'BLOOM-05-EVALUATE', 'Evaluar',
     'Hacer juicios basados en criterios y estándares',
     5,
     jsonb_build_object(
         'keywords', jsonb_build_array('criticar', 'juzgar', 'defender', 'valorar'),
         'related_modules', jsonb_build_array('MOD-03-CRITICA', 'MOD-04-DIGITAL')
     ),
     now()),

    ('bloom_taxonomy', 'BLOOM-06-CREATE', 'Crear',
     'Reunir elementos para formar un todo coherente o funcional',
     6,
     jsonb_build_object(
         'keywords', jsonb_build_array('diseñar', 'construir', 'planificar', 'producir'),
         'related_modules', jsonb_build_array('MOD-05-CREATIVO')
     ),
     now());

-- ========================================
-- CEFR (Common European Framework of Reference for Languages)
-- ========================================

INSERT INTO educational_content.taxonomies (
    taxonomy_type,
    taxonomy_code,
    taxonomy_name,
    taxonomy_description,
    level_order,
    metadata,
    created_at
) VALUES
    ('cefr_level', 'CEFR-A1', 'Principiante (A1)',
     'Puede comprender y usar expresiones cotidianas muy básicas',
     1,
     jsonb_build_object(
         'reading_level', 'Textos muy simples, vocabulario básico',
         'word_count_range', jsonb_build_array(50, 150),
         'related_modules', jsonb_build_array('MOD-01-LITERAL')
     ),
     now()),

    ('cefr_level', 'CEFR-A2', 'Elemental (A2)',
     'Puede comprender frases y expresiones de uso frecuente',
     2,
     jsonb_build_object(
         'reading_level', 'Textos simples, temas familiares',
         'word_count_range', jsonb_build_array(150, 300),
         'related_modules', jsonb_build_array('MOD-01-LITERAL', 'MOD-02-INFERENCIAL')
     ),
     now()),

    ('cefr_level', 'CEFR-B1', 'Intermedio (B1)',
     'Puede comprender los puntos principales de textos claros sobre temas familiares',
     3,
     jsonb_build_object(
         'reading_level', 'Textos claros, temas conocidos',
         'word_count_range', jsonb_build_array(300, 500),
         'related_modules', jsonb_build_array('MOD-02-INFERENCIAL', 'MOD-03-CRITICA')
     ),
     now()),

    ('cefr_level', 'CEFR-B2', 'Intermedio Alto (B2)',
     'Puede comprender ideas principales de textos complejos',
     4,
     jsonb_build_object(
         'reading_level', 'Textos complejos, temas abstractos',
         'word_count_range', jsonb_build_array(500, 800),
         'related_modules', jsonb_build_array('MOD-03-CRITICA', 'MOD-04-DIGITAL')
     ),
     now()),

    ('cefr_level', 'CEFR-C1', 'Avanzado (C1)',
     'Puede comprender textos largos y exigentes, reconociendo sentidos implícitos',
     5,
     jsonb_build_object(
         'reading_level', 'Textos largos, matices implícitos',
         'word_count_range', jsonb_build_array(800, 1200),
         'related_modules', jsonb_build_array('MOD-04-DIGITAL', 'MOD-05-CREATIVO')
     ),
     now()),

    ('cefr_level', 'CEFR-C2', 'Maestría (C2)',
     'Puede comprender con facilidad prácticamente todo lo que lee',
     6,
     jsonb_build_object(
         'reading_level', 'Textos complejos, académicos',
         'word_count_range', jsonb_build_array(1200, 2000),
         'related_modules', jsonb_build_array('MOD-05-CREATIVO')
     ),
     now());

-- Verificación
SELECT
    taxonomy_type,
    taxonomy_code,
    taxonomy_name,
    level_order,
    jsonb_pretty(metadata) as metadata
FROM educational_content.taxonomies
ORDER BY taxonomy_type, level_order;
```

**Validación Post-Seed:**
```sql
-- Debe retornar 12 taxonomías (6 Bloom + 6 CEFR)
SELECT COUNT(*) FROM educational_content.taxonomies;

SELECT taxonomy_type, COUNT(*) as count
FROM educational_content.taxonomies
GROUP BY taxonomy_type;
```

---

### 5. `gamification_system/10-mission_templates.sql`

**Tabla:** `gamification_system.mission_templates`
**Prioridad:** P0 - BLOQUEANTE
**Impacto:** No hay misiones disponibles

#### Estructura Esperada

```sql
-- =====================================================
-- SEED: Mission Templates - Templates de Misiones
-- Schema: gamification_system
-- Tabla: mission_templates
-- Prioridad: P0 - CRÍTICO
-- =====================================================

TRUNCATE TABLE gamification_system.mission_templates RESTART IDENTITY CASCADE;

-- Misión Diaria: Completar 1 ejercicio
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'DAILY-COMPLETE-1-EXERCISE',
    'Aprendiz Diario',
    'Completa 1 ejercicio hoy',
    'exercise_completion',
    'daily',
    'easy',
    jsonb_build_object(
        'exercise_count', 1,
        'time_limit_hours', 24,
        'any_module', true
    ),
    jsonb_build_object(
        'xp', 50,
        'ml_coins', 10,
        'achievement_progress', jsonb_build_object(
            'daily_streak', 1
        )
    ),
    true,
    now(),
    now()
);

-- Misión Diaria: Obtener 100 XP
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'DAILY-EARN-100-XP',
    'Coleccionista de Experiencia',
    'Gana 100 XP hoy',
    'xp_earning',
    'daily',
    'medium',
    jsonb_build_object(
        'xp_amount', 100,
        'time_limit_hours', 24
    ),
    jsonb_build_object(
        'xp', 25,
        'ml_coins', 15
    ),
    true,
    now(),
    now()
);

-- Misión Semanal: Completar 1 módulo
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'WEEKLY-COMPLETE-MODULE',
    'Maestro del Módulo',
    'Completa todos los ejercicios de un módulo esta semana',
    'module_completion',
    'weekly',
    'hard',
    jsonb_build_object(
        'module_count', 1,
        'completion_percentage', 100,
        'time_limit_hours', 168
    ),
    jsonb_build_object(
        'xp', 300,
        'ml_coins', 100,
        'achievement_progress', jsonb_build_object(
            'module_master', 1
        )
    ),
    true,
    now(),
    now()
);

-- Misión Semanal: Racha de 5 días
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'WEEKLY-5-DAY-STREAK',
    'Constancia Semanal',
    'Mantén una racha de 5 días consecutivos',
    'streak_maintenance',
    'weekly',
    'medium',
    jsonb_build_object(
        'streak_days', 5,
        'min_exercise_per_day', 1
    ),
    jsonb_build_object(
        'xp', 200,
        'ml_coins', 75,
        'comodin', jsonb_build_object(
            'type', 'segunda_oportunidad',
            'quantity', 1
        )
    ),
    true,
    now(),
    now()
);

-- Misión Mensual: Completar 3 módulos
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'MONTHLY-3-MODULES',
    'Explorador del Conocimiento',
    'Completa 3 módulos diferentes este mes',
    'module_completion',
    'monthly',
    'hard',
    jsonb_build_object(
        'module_count', 3,
        'completion_percentage', 100,
        'different_modules', true
    ),
    jsonb_build_object(
        'xp', 1000,
        'ml_coins', 500,
        'achievement_unlock', 'EXPLORER-GOLD'
    ),
    true,
    now(),
    now()
);

-- Misión Especial: Perfección en Ejercicio
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'SPECIAL-PERFECT-SCORE',
    'Perfeccionista',
    'Obtén 100% en un ejercicio sin usar comodines',
    'achievement_based',
    'repeatable',
    'hard',
    jsonb_build_object(
        'score_percentage', 100,
        'no_comodines', true,
        'max_attempts', 1
    ),
    jsonb_build_object(
        'xp', 150,
        'ml_coins', 50,
        'achievement_progress', jsonb_build_object(
            'perfectionist', 1
        )
    ),
    true,
    now(),
    now()
);

-- Misión Social: Ayudar a 3 compañeros
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'WEEKLY-HELP-3-PEERS',
    'Tutor Solidario',
    'Ayuda a 3 compañeros con sus ejercicios esta semana',
    'social_interaction',
    'weekly',
    'medium',
    jsonb_build_object(
        'peer_help_count', 3,
        'interaction_type', jsonb_build_array('hint', 'explanation', 'encouragement')
    ),
    jsonb_build_object(
        'xp', 100,
        'ml_coins', 50,
        'social_points', 25
    ),
    true,
    now(),
    now()
);

-- Misión Creativa: Producción de Contenido
INSERT INTO gamification_system.mission_templates (
    template_code,
    template_name,
    template_description,
    mission_type,
    frequency,
    difficulty_level,
    requirements,
    rewards,
    is_active,
    created_at,
    updated_at
) VALUES (
    'MONTHLY-CREATE-CONTENT',
    'Creador de Contenido',
    'Completa 2 ejercicios creativos de MOD-05 con calidad alta',
    'creative_production',
    'monthly',
    'hard',
    jsonb_build_object(
        'module_code', 'MOD-05-CREATIVO',
        'exercise_count', 2,
        'min_quality_score', 80
    ),
    jsonb_build_object(
        'xp', 500,
        'ml_coins', 250,
        'achievement_unlock', 'CREATIVE-MASTER'
    ),
    true,
    now(),
    now()
);

-- Verificación
SELECT
    template_code,
    template_name,
    mission_type,
    frequency,
    difficulty_level,
    jsonb_pretty(rewards) as rewards
FROM gamification_system.mission_templates
ORDER BY
    CASE frequency
        WHEN 'daily' THEN 1
        WHEN 'weekly' THEN 2
        WHEN 'monthly' THEN 3
        WHEN 'repeatable' THEN 4
    END,
    difficulty_level;
```

**Validación Post-Seed:**
```sql
-- Debe retornar 8 templates
SELECT COUNT(*) FROM gamification_system.mission_templates WHERE is_active = true;

-- Contar por frecuencia
SELECT frequency, COUNT(*) as count
FROM gamification_system.mission_templates
GROUP BY frequency
ORDER BY count DESC;
```

---

## ORDEN DE EJECUCIÓN

**IMPORTANTE:** Ejecutar en este orden debido a dependencias FK:

1. `auth_management/04-user_roles.sql`
2. `content_management/02-marie_curie_content.sql`
3. `educational_content/12-taxonomies.sql`
4. `educational_content/11-module_dependencies.sql` (requiere `modules`)
5. `gamification_system/10-mission_templates.sql`

---

## SCRIPT DE VALIDACIÓN COMPLETO

```bash
#!/bin/bash
# validate-p0-seeds.sh

echo "=== VALIDACIÓN SEEDS P0 ==="

echo ""
echo "1. Validando user_roles..."
psql -d gamilit_db -c "SELECT COUNT(*) as roles_count FROM auth_management.user_roles WHERE is_system_role = true;"

echo ""
echo "2. Validando marie_curie_content..."
psql -d gamilit_db -c "SELECT COUNT(*) as content_count FROM content_management.marie_curie_content;"

echo ""
echo "3. Validando taxonomies..."
psql -d gamilit_db -c "SELECT taxonomy_type, COUNT(*) FROM educational_content.taxonomies GROUP BY taxonomy_type;"

echo ""
echo "4. Validando module_dependencies..."
psql -d gamilit_db -c "SELECT COUNT(*) as dependencies_count FROM educational_content.module_dependencies;"

echo ""
echo "5. Validando mission_templates..."
psql -d gamilit_db -c "SELECT COUNT(*) as templates_count FROM gamification_system.mission_templates WHERE is_active = true;"

echo ""
echo "=== VALIDACIÓN COMPLETA ==="
```

---

**Próximos Pasos:**
1. Crear archivos SQL en rutas especificadas
2. Ejecutar en orden indicado
3. Validar con script de verificación
4. Actualizar SEEDS_INVENTORY.yml a v2.2.0

**Fecha Estimada Implementación:** 2025-12-15 a 2025-12-20
**Responsable:** Database Team
