# US-GAM-EDU-02: 23 Tipos de Ejercicios Interactivos

**Sistema:** SIMCO v4.0.0 | **Template:** User Story Level 3 (L3)

**Epica:** EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND
**Modulo(s):** exercises, content, gamification
**Story Points:** 13
**Prioridad:** P0
**Sprint:** Completado

## Descripcion
**Como** estudiante de K-12
**Quiero** interactuar con 23 tipos diferentes de ejercicios de comprension lectora
**Para** practicar habilidades de lectura de forma variada, entretenida y adaptada a mi nivel

## Criterios de Aceptacion

### CA-1: Motor de Ejercicios Modular
**Given** el sistema con los 23 tipos de ejercicios registrados
**When** un estudiante solicita un ejercicio de un tipo especifico
**Then** el motor modular carga dinamicamente el componente del ejercicio correspondiente, renderiza la interfaz interactiva, carga el contenido asociado (lectura, preguntas, opciones) y presenta las instrucciones del ejercicio

### CA-2: Evaluacion Automatica (Modulos 1-4)
**Given** un estudiante que completa un ejercicio de los modulos 1 a 4 (Crucigrama, Detective textual, Tribunal de opiniones, Verificador fake news, etc.)
**When** envia sus respuestas
**Then** el sistema evalua automaticamente en menos de 500ms, calcula una puntuacion parcial (0-100%), muestra retroalimentacion inmediata indicando aciertos y errores, y registra el intento con detalle de respuestas

### CA-3: Evaluacion Manual (Modulo 5 - Produccion)
**Given** un estudiante que completa un ejercicio del Modulo 5 (Diario multimedia, Comic digital, o Video carta)
**When** envia su produccion
**Then** el sistema registra la entrega como pendiente de revision, notifica al maestro titular del aula, el maestro puede calificar con rubrica configurable, y al calificar se emite el evento de XP correspondiente

### CA-4: Retroalimentacion Inmediata
**Given** un estudiante que envia respuestas a un ejercicio automatico
**When** el sistema completa la evaluacion
**Then** muestra para cada respuesta si fue correcta o incorrecta, la explicacion del por que, la respuesta correcta si aplica, y un puntaje total con animacion de XP ganado

### CA-5: Historial de Intentos
**Given** un estudiante que ha realizado multiples intentos de un ejercicio
**When** consulta el historial de intentos
**Then** el sistema muestra todos los intentos previos con fecha, puntaje, tiempo empleado, y permite comparar rendimiento entre intentos

### CA-6: Randomizacion de Opciones
**Given** un ejercicio con opciones de respuesta (Verdadero/Falso, opcion multiple, etc.)
**When** se presenta al estudiante
**Then** el orden de las opciones se aleatoriza en cada intento para evitar memorizacion de posicion

## Tipos de Ejercicios

### Modulo 1: Comprension Literal (5 tipos)
| # | Tipo | Evaluacion | Descripcion |
|---|------|-----------|-------------|
| 1 | Crucigrama | Automatica | Resolver crucigrama basado en informacion del texto |
| 2 | Linea de tiempo | Automatica | Ordenar eventos cronologicamente |
| 3 | Completar espacios | Automatica | Rellenar blancos con palabras del texto |
| 4 | Verdadero/Falso | Automatica | Evaluar afirmaciones sobre el texto |
| 5 | Sopa de letras | Automatica | Encontrar terminos clave del texto |

### Modulo 2: Comprension Inferencial (5 tipos)
| # | Tipo | Evaluacion | Descripcion |
|---|------|-----------|-------------|
| 6 | Detective textual | Automatica | Resolver misterios usando pistas del texto |
| 7 | Construccion de hipotesis | Automatica | Formular hipotesis sobre contenido implicito |
| 8 | Prediccion narrativa | Automatica | Predecir continuacion de la historia |
| 9 | Puzzle de contexto | Automatica | Deducir significado de palabras por contexto |
| 10 | Rueda de inferencias | Automatica | Completar rueda de inferencias multiples |

### Modulo 3: Comprension Critica y Valorativa (5 tipos)
| # | Tipo | Evaluacion | Descripcion |
|---|------|-----------|-------------|
| 11 | Tribunal de opiniones | Automatica | Juicio simulado sobre temas del texto |
| 12 | Debate digital | Automatica | Debate estructurado con posiciones argumentadas |
| 13 | Analisis de fuentes | Automatica | Evaluar credibilidad y sesgo de fuentes |
| 14 | Podcast argumentativo | Manual | Crear argumento en formato audio |
| 15 | Matriz de perspectivas | Automatica | Analizar tema desde multiples perspectivas |

### Modulo 4: Lectura Digital y Multimodal (5 tipos)
| # | Tipo | Evaluacion | Descripcion |
|---|------|-----------|-------------|
| 16 | Verificador de fake news | Automatica | Identificar noticias falsas con criterios |
| 17 | Infografia interactiva | Automatica | Crear infografias a partir de textos |
| 18 | Quiz TikTok | Automatica | Cuestionario en formato de video corto |
| 19 | Navegacion hipertextual | Automatica | Navegar y sintetizar informacion de multiples fuentes |
| 20 | Analisis de memes | Automatica | Analizar contenido semiotico de memes |

### Modulo 5: Produccion y Expresion Lectora (3 tipos, estudiante elige 1)
| # | Tipo | Evaluacion | Descripcion |
|---|------|-----------|-------------|
| 21 | Diario multimedia | Manual | Escribir reflexiones con elementos multimedia |
| 22 | Comic digital | Manual | Crear comic basado en la lectura |
| 23 | Video carta | Manual | Grabar video-carta expresando opinion sobre el texto |

## Notas Tecnicas

| Aspecto | Detalle |
|---------|---------|
| Stack | NestJS 11, React 19, TypeORM 0.3, PostgreSQL 15 |
| Entidades BD | exercises, exercise_types, exercise_attempts, exercise_results, exercise_feedback, exercise_config |
| Endpoints API | `GET /api/v1/exercises` `GET /api/v1/exercises/:id` `POST /api/v1/exercises/:id/submit` `GET /api/v1/exercises/:id/evaluate` `GET /api/v1/exercises/:id/attempts` `POST /api/v1/exercises/:id/feedback` |
| Componentes FE | ExerciseEngine, CrucigranmaExercise, TimelineExercise, FillBlanksExercise, TrueFalseExercise, WordSearchExercise, DetectiveExercise, HypothesisExercise, PredictionExercise, ContextPuzzleExercise, InferenceWheelExercise, OpinionCourtExercise, DigitalDebateExercise, SourceAnalysisExercise, PodcastExercise, PerspectiveMatrixExercise, FakeNewsExercise, InfographicExercise, TikTokQuizExercise, HypertextNavExercise, MemeAnalysisExercise, MultimediaDiaryExercise, DigitalComicExercise, VideoLetterExercise |
| Dependencias | US-GAM-EDU-01 (Modulos), US-GAM-GAM-01 (XP), US-GAM-TCH-01 (Revision manual) |

## Definition of Done
- [ ] 23 tipos de ejercicios implementados y funcionales
- [ ] Motor de evaluacion automatica para modulos 1-4
- [ ] Flujo de evaluacion manual para modulo 5
- [ ] Retroalimentacion inmediata con scoring parcial
- [ ] Historial de intentos con comparacion
- [ ] Tests unitarios (cobertura >= 80%)
- [ ] Inventarios actualizados

## Trazabilidad

| Artefacto | Referencia |
|-----------|------------|
| Requerimiento | RF-GAM-006, RF-GAM-007, RF-GAM-008 |
| Epica padre | EPIC-GAM-BACKEND, EPIC-GAM-FRONTEND |
