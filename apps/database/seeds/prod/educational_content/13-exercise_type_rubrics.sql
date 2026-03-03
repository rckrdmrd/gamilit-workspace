-- =====================================================
-- Seed Data: Exercise Type Rubrics (Rubricas por Tipo de Ejercicio)
-- =====================================================
-- Description: 13 rubricas estandar para ejercicios M3, M4, M5
-- Reference: CORR-009-RESUMEN-CONSOLIDADO.md
-- Date: 2026-01-07
-- Updated: 2026-03-03 (Rubric Audit M3/M4/M5 — weight rebalance, criterion alignment, typo fixes)
-- Modules:
--   - MOD-03-CRITICA (5 ejercicios manuales)
--   - MOD-04-DIGITAL (5 ejercicios manuales)
--   - MOD-05-PRODUCCION (3 ejercicios manuales)
-- =====================================================

SET search_path TO educational_content, public;

-- =====================================================
-- MODULO 3: LECTURA CRITICA (5 rubricas)
-- =====================================================

-- 3.1 tribunal_opiniones
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'tribunal_opiniones',
    'Rubrica: Tribunal de Opiniones',
    'MOD-03-CRITICA',
    '[
        {
            "id": "clasificacion",
            "name": "Clasificacion de Afirmaciones",
            "description": "Capacidad para distinguir hechos de opiniones correctamente",
            "weight": 35,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Clasifica correctamente todas las afirmaciones con justificacion clara"},
                {"score": 75, "label": "Bueno", "description": "Clasifica la mayoria correctamente con justificaciones adecuadas"},
                {"score": 50, "label": "Suficiente", "description": "Clasifica algunas correctamente, justificaciones basicas"},
                {"score": 25, "label": "Insuficiente", "description": "Clasificaciones incorrectas o sin justificacion"}
            ]
        },
        {
            "id": "veredicto",
            "name": "Veredicto Final",
            "description": "Calidad del veredicto basado en evidencia",
            "weight": 40,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Veredicto logico, bien fundamentado con multiples evidencias"},
                {"score": 75, "label": "Bueno", "description": "Veredicto coherente con evidencia suficiente"},
                {"score": 50, "label": "Suficiente", "description": "Veredicto basico con poca evidencia"},
                {"score": 25, "label": "Insuficiente", "description": "Veredicto sin fundamento o contradictorio"}
            ]
        },
        {
            "id": "justificacion",
            "name": "Justificacion del Razonamiento",
            "description": "Claridad y profundidad de la justificacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Justificacion clara, profunda y bien estructurada"},
                {"score": 75, "label": "Bueno", "description": "Justificacion clara con estructura adecuada"},
                {"score": 50, "label": "Suficiente", "description": "Justificacion basica, falta estructura"},
                {"score": 25, "label": "Insuficiente", "description": "Sin justificacion o incoherente"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 3.2 debate_digital
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'debate_digital',
    'Rubrica: Debate Digital',
    'MOD-03-CRITICA',
    '[
        {
            "id": "claridad",
            "name": "Claridad de Postura",
            "description": "Claridad al expresar la posicion en el debate",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Postura clara, consistente y bien articulada"},
                {"score": 75, "label": "Bueno", "description": "Postura clara con buena articulacion"},
                {"score": 50, "label": "Suficiente", "description": "Postura identificable pero poco clara"},
                {"score": 25, "label": "Insuficiente", "description": "Postura confusa o contradictoria"}
            ]
        },
        {
            "id": "evidencias",
            "name": "Uso de Evidencias",
            "description": "Calidad y relevancia de las evidencias presentadas",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Evidencias solidas, relevantes y bien integradas"},
                {"score": 75, "label": "Bueno", "description": "Evidencias relevantes y adecuadas"},
                {"score": 50, "label": "Suficiente", "description": "Algunas evidencias, relevancia limitada"},
                {"score": 25, "label": "Insuficiente", "description": "Sin evidencias o irrelevantes"}
            ]
        },
        {
            "id": "logica",
            "name": "Logica Argumentativa",
            "description": "Coherencia y logica en la construccion del argumento",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Argumento logico, sin falacias, bien estructurado"},
                {"score": 75, "label": "Bueno", "description": "Argumento coherente con buena estructura"},
                {"score": 50, "label": "Suficiente", "description": "Logica basica, algunas inconsistencias"},
                {"score": 25, "label": "Insuficiente", "description": "Falacias logicas o argumento incoherente"}
            ]
        },
        {
            "id": "contraargumentos",
            "name": "Respuesta a Contraargumentos",
            "description": "Capacidad de responder a objeciones",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Refuta contraargumentos efectivamente con evidencia"},
                {"score": 75, "label": "Bueno", "description": "Responde adecuadamente a objeciones"},
                {"score": 50, "label": "Suficiente", "description": "Intenta responder pero sin efectividad"},
                {"score": 25, "label": "Insuficiente", "description": "Ignora contraargumentos o respuesta inadecuada"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 3.3 analisis_fuentes
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'analisis_fuentes',
    'Rubrica: Analisis de Fuentes CRAAP',
    'MOD-03-CRITICA',
    '[
        {
            "id": "orden_confiabilidad",
            "name": "Orden de Confiabilidad",
            "description": "Precision al ordenar fuentes por nivel de confiabilidad",
            "weight": 40,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Orden perfecto o casi perfecto con justificacion"},
                {"score": 75, "label": "Bueno", "description": "Orden mayormente correcto"},
                {"score": 50, "label": "Suficiente", "description": "Algunos errores en el ordenamiento"},
                {"score": 25, "label": "Insuficiente", "description": "Orden incorrecto o sin logica"}
            ]
        },
        {
            "id": "comparacion_relativa",
            "name": "Comparacion Relativa",
            "description": "Capacidad de comparar fuentes entre si",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Comparaciones precisas y bien fundamentadas"},
                {"score": 75, "label": "Bueno", "description": "Comparaciones adecuadas"},
                {"score": 50, "label": "Suficiente", "description": "Comparaciones basicas"},
                {"score": 25, "label": "Insuficiente", "description": "Sin comparaciones o incorrectas"}
            ]
        },
        {
            "id": "aplicacion_craap",
            "name": "Aplicacion Criterios CRAAP",
            "description": "Uso correcto de Currency, Relevance, Authority, Accuracy, Purpose",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Aplica todos los criterios CRAAP correctamente"},
                {"score": 75, "label": "Bueno", "description": "Aplica la mayoria de criterios"},
                {"score": 50, "label": "Suficiente", "description": "Aplica algunos criterios"},
                {"score": 25, "label": "Insuficiente", "description": "No aplica criterios CRAAP"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 3.4 podcast_argumentativo
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'podcast_argumentativo',
    'Rubrica: Podcast Argumentativo',
    'MOD-03-CRITICA',
    '[
        {
            "id": "claridad_audio",
            "name": "Claridad de Expresion",
            "description": "Claridad y coherencia en la expresion del contenido",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Expresion clara, buena diccion, redaccion de calidad"},
                {"score": 75, "label": "Bueno", "description": "Expresion clara y coherente"},
                {"score": 50, "label": "Suficiente", "description": "Expresion entendible con algunas imprecisiones"},
                {"score": 25, "label": "Insuficiente", "description": "Dificil de entender o expresion confusa"}
            ]
        },
        {
            "id": "argumentacion",
            "name": "Calidad Argumentativa",
            "description": "Solidez y estructura de los argumentos presentados",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Argumentos solidos, bien estructurados, con evidencia"},
                {"score": 75, "label": "Bueno", "description": "Argumentos claros y estructurados"},
                {"score": 50, "label": "Suficiente", "description": "Argumentos basicos, estructura limitada"},
                {"score": 25, "label": "Insuficiente", "description": "Sin argumentos claros o incoherentes"}
            ]
        },
        {
            "id": "pensamiento_critico",
            "name": "Pensamiento Critico",
            "description": "Evidencia de analisis critico del tema",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Analisis profundo, considera multiples perspectivas"},
                {"score": 75, "label": "Bueno", "description": "Analisis critico adecuado"},
                {"score": 50, "label": "Suficiente", "description": "Algo de analisis critico"},
                {"score": 25, "label": "Insuficiente", "description": "Sin evidencia de pensamiento critico"}
            ]
        },
        {
            "id": "presentacion",
            "name": "Presentacion General",
            "description": "Estructura del podcast, intro, desarrollo, cierre",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Estructura profesional, intro y cierre claros"},
                {"score": 75, "label": "Bueno", "description": "Buena estructura general"},
                {"score": 50, "label": "Suficiente", "description": "Estructura basica"},
                {"score": 25, "label": "Insuficiente", "description": "Sin estructura clara"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 3.5 matriz_perspectivas
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'matriz_perspectivas',
    'Rubrica: Matriz de Perspectivas',
    'MOD-03-CRITICA',
    '[
        {
            "id": "multiperspectiva",
            "name": "Comprension de Perspectivas",
            "description": "Capacidad de comprender y distinguir las perspectivas presentadas",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Comprende profundamente todas las perspectivas y sus diferencias clave"},
                {"score": 75, "label": "Bueno", "description": "Buena comprension de la mayoria de perspectivas"},
                {"score": 50, "label": "Suficiente", "description": "Comprension parcial de las perspectivas"},
                {"score": 25, "label": "Insuficiente", "description": "No demuestra comprension de las perspectivas"}
            ]
        },
        {
            "id": "analisis_perspectivas",
            "name": "Analisis de Cada Perspectiva",
            "description": "Profundidad del analisis de cada perspectiva",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Analisis profundo de fortalezas y debilidades"},
                {"score": 75, "label": "Bueno", "description": "Analisis adecuado de cada perspectiva"},
                {"score": 50, "label": "Suficiente", "description": "Analisis superficial"},
                {"score": 25, "label": "Insuficiente", "description": "Sin analisis real de perspectivas"}
            ]
        },
        {
            "id": "evidencia_perspectivas",
            "name": "Evidencia por Perspectiva",
            "description": "Uso de evidencia para sustentar cada perspectiva",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Evidencia solida para cada perspectiva"},
                {"score": 75, "label": "Bueno", "description": "Evidencia adecuada para la mayoria"},
                {"score": 50, "label": "Suficiente", "description": "Alguna evidencia, limitada"},
                {"score": 25, "label": "Insuficiente", "description": "Sin evidencia o irrelevante"}
            ]
        },
        {
            "id": "sintesis",
            "name": "Sintesis Final",
            "description": "Capacidad de sintetizar las perspectivas en una conclusion",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Sintesis integradora que considera todas las perspectivas"},
                {"score": 75, "label": "Bueno", "description": "Buena sintesis de perspectivas"},
                {"score": 50, "label": "Suficiente", "description": "Sintesis basica"},
                {"score": 25, "label": "Insuficiente", "description": "Sin sintesis o conclusion arbitraria"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- =====================================================
-- MODULO 4: ALFABETIZACION DIGITAL (5 rubricas manuales)
-- =====================================================

-- 4.1 verificador_fake_news
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'verificador_fake_news',
    'Rubrica: Verificador de Fake News',
    'MOD-04-DIGITAL',
    '[
        {
            "id": "identificacion",
            "name": "Identificacion de Claims Sospechosos",
            "description": "Capacidad de identificar afirmaciones que requieren verificacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Identifica todos los claims sospechosos correctamente"},
                {"score": 75, "label": "Bueno", "description": "Identifica la mayoria de claims sospechosos"},
                {"score": 50, "label": "Suficiente", "description": "Identifica algunos claims"},
                {"score": 25, "label": "Insuficiente", "description": "No identifica claims o identifica incorrectamente"}
            ]
        },
        {
            "id": "verificacion",
            "name": "Razonamiento de Verificacion",
            "description": "Calidad del razonamiento al verificar las afirmaciones",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Razonamiento sistematico y bien fundamentado"},
                {"score": 75, "label": "Bueno", "description": "Buen razonamiento de verificacion"},
                {"score": 50, "label": "Suficiente", "description": "Razonamiento basico con poca fundamentacion"},
                {"score": 25, "label": "Insuficiente", "description": "Sin razonamiento de verificacion claro"}
            ]
        },
        {
            "id": "fuentes",
            "name": "Referencia a Fuentes",
            "description": "Referencias a fuentes confiables en las justificaciones",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Cita fuentes oficiales y de alta credibilidad"},
                {"score": 75, "label": "Bueno", "description": "Menciona fuentes mayormente confiables"},
                {"score": 50, "label": "Suficiente", "description": "Menciona algunas fuentes"},
                {"score": 25, "label": "Insuficiente", "description": "No menciona fuentes o cita fuentes no confiables"}
            ]
        },
        {
            "id": "conclusion",
            "name": "Conclusion y Veredicto",
            "description": "Calidad del veredicto final sobre la veracidad",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Veredicto correcto, bien fundamentado"},
                {"score": 75, "label": "Bueno", "description": "Veredicto adecuado con fundamentacion"},
                {"score": 50, "label": "Suficiente", "description": "Veredicto con fundamentacion limitada"},
                {"score": 25, "label": "Insuficiente", "description": "Veredicto incorrecto o sin fundamento"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 4.2 infografia_interactiva
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'infografia_interactiva',
    'Rubrica: Infografia Interactiva',
    'MOD-04-DIGITAL',
    '[
        {
            "id": "contenido",
            "name": "Comprension del Contenido",
            "description": "Extraccion correcta de informacion de la infografia",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Comprension completa de toda la informacion"},
                {"score": 75, "label": "Bueno", "description": "Buena comprension general"},
                {"score": 50, "label": "Suficiente", "description": "Comprension parcial"},
                {"score": 25, "label": "Insuficiente", "description": "Comprension muy limitada"}
            ]
        },
        {
            "id": "organizacion",
            "name": "Organizacion de Informacion",
            "description": "Capacidad de organizar la informacion extraida",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Informacion bien organizada y estructurada"},
                {"score": 75, "label": "Bueno", "description": "Buena organizacion"},
                {"score": 50, "label": "Suficiente", "description": "Organizacion basica"},
                {"score": 25, "label": "Insuficiente", "description": "Sin organizacion clara"}
            ]
        },
        {
            "id": "interactividad",
            "name": "Exploracion Interactiva",
            "description": "Uso de elementos interactivos de la infografia",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Explora todos los elementos interactivos"},
                {"score": 75, "label": "Bueno", "description": "Explora la mayoria de elementos"},
                {"score": 50, "label": "Suficiente", "description": "Explora algunos elementos"},
                {"score": 25, "label": "Insuficiente", "description": "No explora elementos interactivos"}
            ]
        },
        {
            "id": "respuestas",
            "name": "Respuestas a Preguntas",
            "description": "Precision en las respuestas basadas en la infografia",
            "weight": 35,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Todas las respuestas correctas y completas"},
                {"score": 75, "label": "Bueno", "description": "Mayoria de respuestas correctas"},
                {"score": 50, "label": "Suficiente", "description": "Algunas respuestas correctas"},
                {"score": 25, "label": "Insuficiente", "description": "Pocas o ninguna respuesta correcta"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 4.3 navegacion_hipertextual
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'navegacion_hipertextual',
    'Rubrica: Navegacion Hipertextual',
    'MOD-04-DIGITAL',
    '[
        {
            "id": "eficiencia",
            "name": "Eficiencia de Navegacion",
            "description": "Trayectoria optima para encontrar informacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Ruta optima o muy eficiente"},
                {"score": 75, "label": "Bueno", "description": "Ruta eficiente con pocas desviaciones"},
                {"score": 50, "label": "Suficiente", "description": "Ruta con varias desviaciones"},
                {"score": 25, "label": "Insuficiente", "description": "Navegacion ineficiente o perdida"}
            ]
        },
        {
            "id": "relevancia",
            "name": "Seleccion de Enlaces Relevantes",
            "description": "Relevancia de la informacion encontrada durante la navegacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Selecciona solo enlaces altamente relevantes"},
                {"score": 75, "label": "Bueno", "description": "Mayoria de enlaces seleccionados son relevantes"},
                {"score": 50, "label": "Suficiente", "description": "Algunos enlaces relevantes"},
                {"score": 25, "label": "Insuficiente", "description": "Selecciona enlaces irrelevantes"}
            ]
        },
        {
            "id": "sintesis",
            "name": "Sintesis de Informacion",
            "description": "Capacidad de sintetizar informacion de multiples paginas",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Sintesis completa integrando multiples fuentes"},
                {"score": 75, "label": "Bueno", "description": "Buena sintesis de informacion"},
                {"score": 50, "label": "Suficiente", "description": "Sintesis parcial"},
                {"score": 25, "label": "Insuficiente", "description": "Sin sintesis, informacion fragmentada"}
            ]
        },
        {
            "id": "respuesta_investigacion",
            "name": "Respuesta a Pregunta de Investigacion",
            "description": "Precision en responder la pregunta de investigacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Respuesta completa y precisa"},
                {"score": 75, "label": "Bueno", "description": "Respuesta adecuada"},
                {"score": 50, "label": "Suficiente", "description": "Respuesta parcial"},
                {"score": 25, "label": "Insuficiente", "description": "Respuesta incorrecta o incompleta"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 4.4 analisis_memes
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'analisis_memes',
    'Rubrica: Analisis de Memes',
    'MOD-04-DIGITAL',
    '[
        {
            "id": "decodificacion",
            "name": "Decodificacion del Mensaje",
            "description": "Capacidad de identificar el mensaje principal del meme",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Identifica mensaje principal y secundarios"},
                {"score": 75, "label": "Bueno", "description": "Identifica mensaje principal correctamente"},
                {"score": 50, "label": "Suficiente", "description": "Identifica mensaje parcialmente"},
                {"score": 25, "label": "Insuficiente", "description": "No identifica el mensaje o lo malinterpreta"}
            ]
        },
        {
            "id": "contexto_cultural",
            "name": "Contexto Cultural",
            "description": "Reconocimiento de referencias culturales y formato",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Reconoce formato, referencias y contexto cultural"},
                {"score": 75, "label": "Bueno", "description": "Reconoce la mayoria de referencias"},
                {"score": 50, "label": "Suficiente", "description": "Reconoce algunas referencias"},
                {"score": 25, "label": "Insuficiente", "description": "No reconoce referencias culturales"}
            ]
        },
        {
            "id": "intertextualidad",
            "name": "Analisis Intertextual",
            "description": "Relacion del meme con otros textos o conocimientos",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Conecta con conocimientos historicos y actuales"},
                {"score": 75, "label": "Bueno", "description": "Hace conexiones relevantes"},
                {"score": 50, "label": "Suficiente", "description": "Algunas conexiones"},
                {"score": 25, "label": "Insuficiente", "description": "Sin conexiones intertextuales"}
            ]
        },
        {
            "id": "critica",
            "name": "Evaluacion Critica",
            "description": "Analisis critico de precision historica y humor",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Evalua precision, humor e implicaciones criticamente"},
                {"score": 75, "label": "Bueno", "description": "Buena evaluacion critica"},
                {"score": 50, "label": "Suficiente", "description": "Evaluacion basica"},
                {"score": 25, "label": "Insuficiente", "description": "Sin evaluacion critica"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 4.5 quiz_tiktok (requiere manual grading por justificaciones)
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'quiz_tiktok',
    'Rubrica: Quiz TikTok',
    'MOD-04-DIGITAL',
    '[
        {
            "id": "precision_respuestas",
            "name": "Precision de Respuestas",
            "description": "Porcentaje de respuestas correctas seleccionadas",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "100% respuestas correctas"},
                {"score": 75, "label": "Bueno", "description": "75% o mas respuestas correctas"},
                {"score": 50, "label": "Suficiente", "description": "50-74% respuestas correctas"},
                {"score": 25, "label": "Insuficiente", "description": "Menos del 50% correctas"}
            ]
        },
        {
            "id": "calidad_justificaciones",
            "name": "Calidad de Justificaciones",
            "description": "Profundidad y relevancia de las justificaciones escritas para cada respuesta",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Justificaciones detalladas con razonamiento claro y evidencia"},
                {"score": 75, "label": "Bueno", "description": "Justificaciones claras con razonamiento adecuado"},
                {"score": 50, "label": "Suficiente", "description": "Justificaciones basicas sin profundidad"},
                {"score": 25, "label": "Insuficiente", "description": "Justificaciones vagas o irrelevantes"}
            ]
        },
        {
            "id": "pensamiento_critico",
            "name": "Pensamiento Critico",
            "description": "Capacidad de analizar la informacion y demostrar comprension critica del tema",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Demuestra analisis critico profundo del contenido"},
                {"score": 75, "label": "Bueno", "description": "Muestra comprension critica adecuada"},
                {"score": 50, "label": "Suficiente", "description": "Comprension superficial del tema"},
                {"score": 25, "label": "Insuficiente", "description": "Sin evidencia de pensamiento critico"}
            ]
        },
        {
            "id": "completitud",
            "name": "Completitud",
            "description": "Todas las preguntas respondidas con justificaciones completas",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Todas las preguntas respondidas y justificadas"},
                {"score": 75, "label": "Bueno", "description": "Mayoria respondidas con justificaciones"},
                {"score": 50, "label": "Suficiente", "description": "Algunas preguntas sin justificacion adecuada"},
                {"score": 25, "label": "Insuficiente", "description": "Multiples preguntas sin responder o justificar"}
            ]
        }
    ]'::jsonb,
    100, true
) ON CONFLICT (exercise_type) DO UPDATE SET
    rubric_name = EXCLUDED.rubric_name,
    criteria = EXCLUDED.criteria,
    total_weight = EXCLUDED.total_weight,
    updated_at = NOW();

-- =====================================================
-- MODULO 5: PRODUCCION CREATIVA (3 rubricas)
-- =====================================================

-- 5.1 diario_multimedia
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'diario_multimedia',
    'Rubrica: Diario Multimedia',
    'MOD-05-PRODUCCION',
    '[
        {
            "id": "creatividad",
            "name": "Creatividad e Imaginacion",
            "description": "Originalidad y creatividad en la presentacion del diario",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Altamente creativo, perspectiva unica y original"},
                {"score": 75, "label": "Bueno", "description": "Creativo con elementos originales"},
                {"score": 50, "label": "Suficiente", "description": "Algo de creatividad"},
                {"score": 25, "label": "Insuficiente", "description": "Sin creatividad, muy generico"}
            ]
        },
        {
            "id": "precision_historica",
            "name": "Precision Historica",
            "description": "Exactitud de hechos historicos incorporados",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Hechos historicos precisos y bien integrados"},
                {"score": 75, "label": "Bueno", "description": "Mayoria de hechos correctos"},
                {"score": 50, "label": "Suficiente", "description": "Algunos hechos correctos, otros imprecisos"},
                {"score": 25, "label": "Insuficiente", "description": "Errores historicos significativos"}
            ]
        },
        {
            "id": "multimedia",
            "name": "Uso de Multimedia",
            "description": "Integracion de elementos multimedia (audio, imagen, etc.)",
            "weight": 15,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Multimedia bien integrado y de calidad"},
                {"score": 75, "label": "Bueno", "description": "Buen uso de multimedia"},
                {"score": 50, "label": "Suficiente", "description": "Uso basico de multimedia"},
                {"score": 25, "label": "Insuficiente", "description": "Sin multimedia o mal integrado"}
            ]
        },
        {
            "id": "expresion",
            "name": "Expresion y Voz Narrativa",
            "description": "Calidad de la escritura y voz del personaje",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Voz autentica, expresion emotiva y coherente"},
                {"score": 75, "label": "Bueno", "description": "Buena expresion, voz consistente"},
                {"score": 50, "label": "Suficiente", "description": "Expresion basica"},
                {"score": 25, "label": "Insuficiente", "description": "Sin voz clara o expresion pobre"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 5.2 comic_digital
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'comic_digital',
    'Rubrica: Comic Digital',
    'MOD-05-PRODUCCION',
    '[
        {
            "id": "narrativa",
            "name": "Narrativa y Guion",
            "description": "Calidad de la historia y estructura narrativa",
            "weight": 30,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Historia coherente, bien estructurada, dialogos naturales"},
                {"score": 75, "label": "Bueno", "description": "Buena narrativa y dialogos"},
                {"score": 50, "label": "Suficiente", "description": "Narrativa basica"},
                {"score": 25, "label": "Insuficiente", "description": "Historia confusa o incoherente"}
            ]
        },
        {
            "id": "visual",
            "name": "Organizacion Visual",
            "description": "Claridad en la estructura de paneles y flujo narrativo visual",
            "weight": 20,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Paneles bien estructurados con flujo narrativo claro"},
                {"score": 75, "label": "Bueno", "description": "Buena estructura de paneles"},
                {"score": 50, "label": "Suficiente", "description": "Estructura basica de paneles"},
                {"score": 25, "label": "Insuficiente", "description": "Estructura confusa o incoherente"}
            ]
        },
        {
            "id": "precision",
            "name": "Precision Historica/Tematica",
            "description": "Exactitud del contenido sobre Marie Curie",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Contenido historico preciso y bien investigado"},
                {"score": 75, "label": "Bueno", "description": "Mayoria de informacion correcta"},
                {"score": 50, "label": "Suficiente", "description": "Informacion parcialmente correcta"},
                {"score": 25, "label": "Insuficiente", "description": "Errores significativos de contenido"}
            ]
        },
        {
            "id": "creatividad_comic",
            "name": "Creatividad e Innovacion",
            "description": "Originalidad en el enfoque y presentacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Enfoque unico y muy creativo"},
                {"score": 75, "label": "Bueno", "description": "Creativo con elementos originales"},
                {"score": 50, "label": "Suficiente", "description": "Algo de creatividad"},
                {"score": 25, "label": "Insuficiente", "description": "Sin creatividad, muy convencional"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- 5.3 video_carta
INSERT INTO educational_content.exercise_type_rubrics (
    exercise_type, rubric_name, module_code, criteria, total_weight, is_default
) VALUES (
    'video_carta',
    'Rubrica: Video-Carta',
    'MOD-05-PRODUCCION',
    '[
        {
            "id": "autenticidad",
            "name": "Autenticidad de la Voz",
            "description": "Credibilidad como voz de Marie Curie",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Voz autentica, personalidad de Curie bien capturada"},
                {"score": 75, "label": "Bueno", "description": "Buena representacion de la voz"},
                {"score": 50, "label": "Suficiente", "description": "Representacion basica"},
                {"score": 25, "label": "Insuficiente", "description": "Voz inautentica o anacronica"}
            ]
        },
        {
            "id": "mensaje",
            "name": "Claridad del Mensaje",
            "description": "Claridad y profundidad del mensaje transmitido",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Mensaje claro, profundo e inspirador"},
                {"score": 75, "label": "Bueno", "description": "Mensaje claro y bien articulado"},
                {"score": 50, "label": "Suficiente", "description": "Mensaje identificable pero superficial"},
                {"score": 25, "label": "Insuficiente", "description": "Mensaje confuso o ausente"}
            ]
        },
        {
            "id": "presentacion_video",
            "name": "Presentacion y Produccion",
            "description": "Calidad tecnica del video y presentacion",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Produccion de calidad, buena iluminacion y audio"},
                {"score": 75, "label": "Bueno", "description": "Buena produccion general"},
                {"score": 50, "label": "Suficiente", "description": "Produccion basica pero aceptable"},
                {"score": 25, "label": "Insuficiente", "description": "Produccion pobre, problemas tecnicos graves"}
            ]
        },
        {
            "id": "emocion",
            "name": "Conexion Emocional",
            "description": "Capacidad de conectar emocionalmente con la audiencia",
            "weight": 25,
            "levels": [
                {"score": 100, "label": "Excelente", "description": "Muy emotivo, genera conexion profunda"},
                {"score": 75, "label": "Bueno", "description": "Genera buena conexion emocional"},
                {"score": 50, "label": "Suficiente", "description": "Algo de conexion emocional"},
                {"score": 25, "label": "Insuficiente", "description": "Sin conexion emocional, plano"}
            ]
        }
    ]'::jsonb,
    100, true
);

-- =====================================================
-- Resumen de rubricas creadas
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Exercise Type Rubrics Seed Completado';
    RAISE NOTICE '=====================================================';
    RAISE NOTICE 'Modulo 3 - Lectura Critica: 5 rubricas';
    RAISE NOTICE '  - tribunal_opiniones';
    RAISE NOTICE '  - debate_digital';
    RAISE NOTICE '  - analisis_fuentes';
    RAISE NOTICE '  - podcast_argumentativo';
    RAISE NOTICE '  - matriz_perspectivas';
    RAISE NOTICE '';
    RAISE NOTICE 'Modulo 4 - Alfabetizacion Digital: 5 rubricas';
    RAISE NOTICE '  - verificador_fake_news';
    RAISE NOTICE '  - infografia_interactiva';
    RAISE NOTICE '  - navegacion_hipertextual';
    RAISE NOTICE '  - analisis_memes';
    RAISE NOTICE '  - quiz_tiktok';
    RAISE NOTICE '';
    RAISE NOTICE 'Modulo 5 - Produccion Creativa: 3 rubricas';
    RAISE NOTICE '  - diario_multimedia';
    RAISE NOTICE '  - comic_digital';
    RAISE NOTICE '  - video_carta';
    RAISE NOTICE '';
    RAISE NOTICE 'TOTAL: 13 rubricas creadas';
    RAISE NOTICE '=====================================================';
END $$;
