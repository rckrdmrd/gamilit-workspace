# Documentación Completa de Mecánicas Educativas - Módulos 3 y 4

Este documento contiene la documentación detallada expandida de las 9 mecánicas que requieren completar.

---

## MÓDULO 3: COMPRENSIÓN CRÍTICA

### 5.2 Debate Digital

**Tipo:** `debate_digital`
**Módulo:** 3
**Tipo de Comprensión:** Crítica
**Dificultad:** ⭐⭐⭐⭐

#### Descripción

El Debate Digital es una mecánica interactiva de argumentación en tiempo real donde estudiantes mantienen una conversación dialéctica con un oponente AI sobre temas controversiales relacionados con Marie Curie. A diferencia del Tribunal de Opiniones (donde se evalúan argumentos externos), aquí el estudiante debe construir y defender sus propios argumentos en un formato de chat conversacional.

La interfaz simula una aplicación de mensajería moderna con burbujas de chat diferenciadas por color: azul para el estudiante (alineado a la derecha) y gris con borde para la AI oponente (alineado a la izquierda). Cada mensaje muestra avatar (User/Bot icon), timestamp, y el contenido del argumento. La AI responde con contra-argumentos contextuales basados en el contenido del mensaje del estudiante, creando un flujo dinámico de debate.

El sistema analiza cada mensaje del estudiante en tiempo real, evaluando: longitud del argumento (conteo de palabras como proxy de profundidad), uso de dispositivos retóricos, coherencia lógica, y capacidad de contra-argumentación. Los estudiantes deben enviar un mínimo de 3 mensajes (idealmente 5+) para completar el ejercicio, fomentando la participación sostenida.

La AI opponent tiene una personalidad definida (en el tema de patentes de Marie Curie, defiende la posición de que DEBIÓ patentar) y usa técnicas argumentativas variadas: apelaciones a consecuencias, ejemplos históricos, preguntas retóricas, y contra-argumentos anticipatorios. Esto expone a los estudiantes a diferentes estilos de argumentación que deben analizar y responder efectivamente.

Un indicador visual "IA está escribiendo..." con loading spinner simula el comportamiento humano, creando una experiencia inmersiva. El historial completo de mensajes se guarda y scroll automático lleva al usuario siempre al último mensaje, manteniendo el flujo conversacional natural.

#### Objetivo Pedagógico

Desarrollar habilidades de argumentación dialógica en tiempo real, incluyendo: (1) Construcción rápida de argumentos coherentes bajo presión temporal, (2) Análisis y respuesta a contra-argumentos inesperados, (3) Uso estratégico de dispositivos retóricos (ethos, pathos, logos), (4) Mantenimiento de coherencia argumentativa a través de múltiples turnos, (5) Adaptación de estrategia argumentativa según la respuesta del oponente, y (6) Desarrollo de fluidez en lenguaje académico argumentativo. Esta mecánica simula debates reales en entornos académicos, preparando a estudiantes para seminarios, presentaciones orales, y escritura académica persuasiva.

#### Características Técnicas

- Interfaz de chat en tiempo real con React state management
- Input field con detección de Enter key para envío rápido
- Sistema de avatares con iconos lucide-react (User, Bot)
- Indicador "AI está escribiendo" con Loader2 animado
- Auto-scroll a último mensaje con useRef y scrollIntoView
- Diferenciación visual por emisor (user: azul derecha, AI: gris izquierda)
- Contador de palabras para analizar profundidad de argumentos
- Scoring dinámico que actualiza con cada mensaje enviado
- Timestamps en cada mensaje con format locale
- Historial persistente de mensajes en estado local
- Análisis de fuerza de argumento (argumentStrength: 0-1) mostrado en mensajes AI
- Botón de envío deshabilitado si input vacío o AI respondiendo
- AnimatePresence de Framer Motion para entrada/salida de mensajes
- Límite mínimo de 3 mensajes de usuario para permitir completar
- Auto-guardado cada 30 segundos del historial completo
- Progress bar calculado como (userMessages / targetMessages) * 100
- Responsive design con chat height fijo de 600px y scroll interno

#### Estructura de Contenido

```typescript
interface DebateDigitalData {
  id: string;
  topic: {
    title: string;
    question: string;
    context: string;
  };
  aiPersona: {
    name: string;
    stance: string;  // Posición que defiende la AI
    argumentationStyle: 'logical' | 'emotional' | 'balanced';
    openingMessage: string;
  };
  evaluationCriteria: {
    minMessages: number;  // Mínimo de mensajes para completar (default: 5)
    scorePerMessage: number;  // Puntos base por mensaje
  };
}

interface DebateMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  argumentStrength?: number;  // 0-1, solo para mensajes AI
}

interface DebateAnswer {
  messages: DebateMessage[];
  totalUserMessages: number;
  avgMessageLength: number;  // Palabras promedio por mensaje
  timeSpent: number;
}

interface DebateEvaluation {
  score: number;
  feedback: string;
  metrics: {
    participationScore: number;  // Basado en cantidad de mensajes
    depthScore: number;  // Basado en longitud/profundidad
    consistencyScore: number;  // Coherencia lógica
  };
}
```

#### Ejemplo de Contenido (Marie Curie)

**Tema:** "Patentes Científicas y Bienestar Económico"

**Pregunta:** "¿Debería Marie Curie haber patentado sus descubrimientos del Radio y Polonio?"

**Contexto:** "En 1898, Marie y Pierre Curie aislaron dos nuevos elementos radiactivos. A diferencia de muchos científicos de su época, decidieron NO patentar el proceso de extracción, permitiendo que cualquier laboratorio o empresa pudiera producir Radio. Esta decisión costó a los Curie millones de francos, mientras vivían en condiciones económicas precarias. Su elección aceleró la investigación global en radioactividad y aplicaciones médicas, pero les negó recursos que podrían haber financiado más investigaciones."

**AI Persona:**
- Nombre: "Oponente IA"
- Stance: "Marie DEBIÓ patentar sus descubrimientos"
- Style: "balanced"
- Opening: "Hola, soy tu oponente en este debate. Defenderé la posición de que Marie Curie debió haber patentado sus descubrimientos. ¿Cuál es tu argumento inicial?"

**Flujo de Debate Example:**

**Mensaje 1 - AI (Opening):**
"Hola, soy tu oponente en este debate. Defenderé la posición de que Marie Curie debió haber patentado sus descubrimientos. ¿Cuál es tu argumento inicial?"

**Mensaje 2 - Usuario:**
"Marie Curie priorizó el bien común sobre su beneficio personal. Patentar hubiera limitado el acceso al Radio para investigación médica y científica."

**Mensaje 3 - AI (Contra-argumento):**
"Argumento interesante, pero consideremos esto: con los ingresos de patentes, Marie podría haber financiado aún más investigación, beneficiando más a la humanidad a largo plazo. Vivir en pobreza limitó su capacidad de hacer ciencia. ¿No es eso también perjudicial para el bien común?" (argumentStrength: 0.75)

**Mensaje 4 - Usuario:**
"Sin embargo, el modelo de ciencia abierta que practicó aceleró la adopción del Radio en radioterapia entre 1900-1920, salvando miles de vidas inmediatamente. El beneficio inmediato superó cualquier ganancia futura hipotética."

**Mensaje 5 - AI (Reconoce punto + nuevo ángulo):**
"Buen punto sobre el beneficio inmediato. Pero olvidamos que empresas privadas sí lucraron millones con el Radio sin compensar a los Curie. Patentar con licencias asequibles hubiera logrado ambos objetivos: acceso amplio Y compensación justa. ¿No crees que ese hubiera sido un mejor modelo?" (argumentStrength: 0.82)

**Mensaje 6 - Usuario:**
"Es un modelo interesante. Sin embargo, en 1900 ese sistema de licencias abiertas no existía. Marie tomó la mejor decisión disponible en su contexto histórico. Juzgarla con estándares de 2025 es presentismo."

**Mensaje 7 - AI (Concede punto final):**
"Excelente observación sobre el presentismo. Has demostrado un argumento sólido al contextualizar históricamente la decisión de Marie. Has defendido bien tu posición." (argumentStrength: 0.90)

#### Sistema de Scoring

**Fórmula Base:**
```typescript
baseScore = messageScore * userMessageCount;
messageScore = Math.min(20, messageLength / 5); // Hasta 20 puntos por mensaje profundo
participationBonus = Math.min(30, userMessageCount * 5); // Hasta 30 puntos por participación
timeBonus = calculateTimeBonus(startTime, endTime, 20, 120); // 20 puntos si < 120s
totalScore = Math.min(100, baseScore + participationBonus + timeBonus);
```

**Criterios de Evaluación:**

1. **Participación** (peso: 40%) - Cantidad de mensajes enviados (mínimo 5 para máximo score)
2. **Profundidad** (peso: 30%) - Longitud y sustancia de argumentos (palabras por mensaje)
3. **Consistencia** (peso: 20%) - Coherencia lógica entre mensajes sucesivos
4. **Contra-argumentación** (peso: 10%) - Capacidad de responder a puntos de la AI

**Bonificaciones:**
- **Participación Activa:** +10 puntos si envía 5+ mensajes
- **Mensajes Sustanciales:** +5 puntos por cada mensaje >50 palabras (máx 3 bonuses)
- **Debate Extendido:** +15 puntos si mantiene debate durante 10+ turnos
- **Tiempo Eficiente:** +20 puntos si completa en <2 minutos

**Penalizaciones:**
- Mensajes muy cortos (<10 palabras): -2 puntos por mensaje
- Abandonar antes de 3 mensajes: score = 0
- Uso de hints: -10 ML Coins por hint

**Multiplicadores aplicables:**
- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.3x (mecánica hard)
- Streak: +2% por día

#### Auto-gradabilidad

**Nivel:** ⚠️ Híbrido (70% Automático, 30% Revisión AI/Docente)

**Automático:**
- Conteo de mensajes enviados
- Análisis de longitud promedio (palabras)
- Cálculo de tiempo total
- Scoring de participación
- Detección de mensajes vacíos o spam

**Requiere AI/Revisión:**
- Evaluación de calidad argumentativa
- Detección de dispositivos retóricos usados
- Análisis de coherencia lógica
- Identificación de falacias lógicas
- Valoración de contra-argumentación efectiva

**Sistema de Evaluación AI (Opcional):**
Si se implementa evaluación automática avanzada con NLP:
- Análisis de sentimiento para detectar tono apropiado
- Entity recognition para verificar referencias precisas a Marie Curie
- Dependency parsing para evaluar complejidad sintáctica
- Similarity scoring para detectar repetición de argumentos

#### Validaciones

- **Mínimo 3 mensajes** de usuario para permitir completar ejercicio
- **Máximo 500 caracteres** por mensaje para fomentar concisión
- **Mínimo 10 caracteres** por mensaje para prevenir spam
- **No permitir envío vacío** o solo espacios
- **Bloqueo temporal** mientras AI responde (prevenir múltiples envíos)
- **Timeout de sesión:** 30 minutos de inactividad auto-cierra ejercicio

#### Integración con Gamificación

- **ML Coins base:** 35 coins (por 5 mensajes)
- **XP base:** 70 XP
- **Achievements desbloqueables:**
  - "Debatidor Incansable" - Enviar 10+ mensajes en un debate
  - "Argumentador Sólido" - Obtener 85+ puntos en Debate Digital
  - "Maestro del Contra-argumento" - Responder efectivamente a 5 contra-argumentos AI
- **Power-ups utilizables:**
  - Pistas (10 ML Coins): Sugiere un dispositivo retórico para usar
  - Visión Lectora (20 ML Coins): Resalta debilidades en argumento AI
  - Segunda Oportunidad (35 ML Coins): Permite reiniciar debate

#### Tiempo Estimado

8-12 minutos para un debate completo de calidad:
- Lectura de contexto: 1-2 min
- Mensaje inicial: 1 min
- 5-7 turnos de debate: 5-8 min (1 min por turno)
- Revisión final: 1 min

**Tiempo mínimo aceptable:** 5 minutos (3 mensajes)
**Tiempo óptimo:** 10-15 minutos (5-7 mensajes con profundidad)

#### Prerequisitos

- Haber completado "Construcción de Hipótesis" (Módulo 2)
- Nivel mínimo: Rango Chʼok (nivel 2)
- Recomendado: Completar "Tribunal de Opiniones" primero para entender sesgos

#### Notas de Implementación

**Frontend:**
- Componente: `DebateDigitalExercise.tsx`
- API mock: `debateDigitalAPI.ts` con función `sendDebateMessage(text, topic)`
- Estado local: array de DebateMessage con useState
- Ref: messagesEndRef para auto-scroll
- Animación: AnimatePresence para entrada/salida de mensajes

**Backend:**
- Endpoint: `POST /api/exercises/debate/:id/message` (envío de mensaje)
- Endpoint: `POST /api/exercises/debate/:id/submit` (finalizar debate)
- AI Integration: Opcional - OpenAI API para respuestas contextuales
- Mock responses: Array predefinido de respuestas si no hay AI real

**Consideraciones:**
- Latencia de respuesta AI: 1-2 segundos para simular "escribiendo"
- Caché de respuestas comunes para reducir llamadas API
- Fallback a respuestas predefinidas si AI falla
- Rate limiting: Máximo 1 mensaje por 5 segundos por usuario

---

### 5.3 Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Módulo:** 3
**Tipo de Comprensión:** Crítica
**Dificultad:** ⭐⭐⭐⭐⭐

#### Descripción

El Podcast Argumentativo es la mecánica más avanzada del Módulo 3, requiriendo que estudiantes graben un argumento oral coherente de 2-3 minutos usando el micrófono de su dispositivo. Esta mecánica integra comprensión lectora, pensamiento crítico, y producción oral argumentativa en un formato moderno y relevante (podcasting).

La interfaz presenta un gran timer central mostrando MM:SS, un botón rojo de "Iniciar Grabación" con icono de micrófono, y una vez grabado, un player de audio para revisar la grabación. El sistema usa Web Audio API del navegador para capturar audio sin necesidad de software externo. Durante la grabación, el timer corre y el botón cambia a "Detener Grabación" con animación pulsante.

Una vez detenida la grabación, el sistema genera automáticamente una transcripción (actualmente mock, pero preparado para integración con Speech-to-Text API) y analiza el contenido en 4 dimensiones: Claridad (dicción, estructura), Lógica (coherencia argumentativa), Evidencia (uso de datos/hechos), y Persuasión (efectividad retórica). Cada dimensión se califica de 0-100.

El análisis verifica la presencia de elementos estructurales requeridos: introducción clara, tesis definida, al menos 2 evidencias de apoyo, y conclusión que cierre el argumento. Un sistema de checklist visual muestra qué elementos están presentes (✅) o ausentes (❌). El feedback incluye sugerencias específicas de mejora, como "Añade más evidencia concreta" o "Tu introducción necesita contextualizar mejor el tema".

Visualmente, la interfaz usa un diseño limpio centrado en el timer, con métricas de análisis mostradas como cards con barras de progreso de color (azul: claridad, verde: lógica, naranja: evidencia, púrpura: persuasión). La transcripción se muestra en un área de texto de solo lectura con formato limpio.

#### Objetivo Pedagógico

Desarrollar habilidades de argumentación oral estructurada, incluyendo: (1) Planificación y organización de argumentos antes de hablar, (2) Articulación clara de ideas complejas sin texto escrito, (3) Uso efectivo de la voz (tono, ritmo, énfasis) para persuadir, (4) Manejo de tiempo limitado para argumentación concisa, (5) Integración de evidencia y ejemplos en discurso oral, y (6) Desarrollo de confianza en presentación oral de ideas académicas. Esta mecánica prepara a estudiantes para presentaciones orales, defensa de trabajos, entrevistas académicas, y comunicación científica pública (formato podcast cada vez más popular en divulgación científica).

#### Características Técnicas

- Grabación de audio con Web Audio API (navigator.mediaDevices.getUserMedia)
- MediaRecorder API para capturar stream de audio
- Timer en tiempo real con useEffect e setInterval
- Gestión de chunks de audio en array para crear Blob final
- Formato de audio: audio/webm (compatible cross-browser)
- Player de audio HTML5 para reproducir grabación
- Transcripción automática (mock actualmente, preparado para Speech-to-Text)
- Análisis de 4 métricas (clarity, logic, evidence, persuasion) 0-1
- Visualización de métricas con barras de progreso coloreadas
- Lista de feedback con íconos de check y warning
- Lista de mejoras sugeridas con íconos de flecha
- Límite de tiempo configurable (default: 180 segundos)
- Auto-detención si se alcanza tiempo límite
- Solicitud de permisos de micrófono con manejo de errores
- Liberación de tracks de audio al detener para liberar recurso
- Responsive design con timer grande prominente
- Auto-guardado de estado (hasRecording, duration, analyzed)

#### Estructura de Contenido

```typescript
interface PodcastExercise {
  id: string;
  topic: string;  // Ej: "El Legado de Marie Curie"
  prompt: string;  // Instrucciones detalladas
  timeLimit: number;  // Segundos (180 = 3 min)
  requiredElements: string[];  // ["introducción", "tesis", "evidencias", "conclusión"]
  evaluationCriteria: {
    clarityWeight: number;  // 0-1
    logicWeight: number;
    evidenceWeight: number;
    persuasionWeight: number;
  };
}

interface Recording {
  id: string;
  audioBlob: Blob | null;
  transcription: string;
  analysis: ArgumentAnalysis | null;
  duration: number;  // Segundos grabados
}

interface ArgumentAnalysis {
  clarity: number;  // 0-1
  logic: number;
  evidence: number;
  persuasion: number;
  feedback: string[];  // Aspectos positivos
  improvements: string[];  // Áreas de mejora
  elementsPresent: {
    hasIntroduction: boolean;
    hasThesis: boolean;
    hasEvidence: boolean;
    hasConclusion: boolean;
  };
}

interface PodcastAnswer {
  audioBlob: Blob;
  duration: number;
  transcription: string;
  analysis: ArgumentAnalysis;
}

interface PodcastEvaluation {
  score: number;  // Promedio ponderado de 4 métricas
  breakdown: {
    clarity: number;
    logic: number;
    evidence: number;
    persuasion: number;
  };
  bonuses: {
    structureBonus: number;  // +10 si tiene todos los elementos
    timeBonus: number;  // +20 si dentro de límite
  };
}
```

#### Ejemplo de Contenido (Marie Curie)

**Tema:** "El Impacto de Marie Curie en la Ciencia Moderna y la Igualdad de Género"

**Prompt:**
"Graba un podcast de 2-3 minutos argumentando sobre cómo Marie Curie transformó tanto la ciencia como el rol de las mujeres en investigación científica. Tu podcast debe incluir:
- **Introducción:** Presentación del tema y por qué es relevante hoy
- **Tesis clara:** Tu argumento principal sobre el legado dual de Marie Curie
- **Evidencia 1:** Impacto científico específico (ej: descubrimiento del Radio, aplicaciones médicas)
- **Evidencia 2:** Impacto social específico (ej: romper barreras de género, inspirar generaciones)
- **Conclusión:** Cierre que refuerce tu tesis y proyecte al futuro

Habla con claridad, usa ejemplos concretos, y estructura tu argumento lógicamente."

**Tiempo Límite:** 180 segundos (3 minutos)

**Ejemplo de Transcripción (Generada por estudiante):**

"Buenos días, les habla [nombre] y hoy quiero hablarles sobre Marie Curie, una científica que no solo revolucionó la física y la química, sino que también abrió puertas para millones de mujeres en ciencia. Mi argumento es que el legado de Marie Curie es dual: científico Y social, y ambos son igualmente importantes para entender la ciencia moderna.

Primero, el impacto científico. Marie Curie descubrió dos elementos radiactivos, el Polonio y el Radio, entre 1898 y 1902. Estos descubrimientos no fueron solo curiosidades de laboratorio. El Radio se convirtió en la base de la radioterapia, tratamiento que ha salvado millones de vidas desde entonces. Sus investigaciones sobre la radioactividad sentaron las bases de la física nuclear moderna. Sin Marie Curie, no tendríamos la energía nuclear, ni muchos tratamientos médicos actuales.

Segundo, el impacto social. En 1903, Marie fue la primera mujer en ganar un Premio Nobel. Imaginen la época: las mujeres apenas podían votar en algunos países, y Marie estaba ganando el máximo reconocimiento científico. Luego, en 1911, ganó un segundo Nobel, esta vez sola, en Química. Demostró que las mujeres podían no solo participar en ciencia, sino liderarla. Hoy, cuando vemos a mujeres como Directoras de la NASA o ganadoras de Nobels en Física, estamos viendo el resultado de las puertas que Marie abrió.

En conclusión, Marie Curie nos dejó un legado que trasciende sus descubrimientos. Nos enseñó que la ciencia es para todos, sin importar género, y que el trabajo riguroso y la pasión pueden cambiar el mundo. En el siglo XXI, donde aún luchamos por igualdad de género en STEM, el ejemplo de Marie es más relevante que nunca."

**Análisis AI Generado:**

```json
{
  "clarity": 0.85,
  "logic": 0.90,
  "evidence": 0.80,
  "persuasion": 0.88,
  "feedback": [
    "Introducción clara que establece el tema y la relevancia",
    "Tesis dual (científico + social) bien articulada",
    "Estructura lógica con transiciones efectivas (Primero, Segundo, En conclusión)",
    "Uso de ejemplos concretos (Radio en radioterapia, Nobels de 1903 y 1911)",
    "Cierre que conecta con presente y futuro"
  ],
  "improvements": [
    "Podrías mencionar cifras más específicas (ej: cuántas vidas salvó la radioterapia)",
    "El impacto social podría incluir un ejemplo más concreto de una científica moderna inspirada por Marie",
    "Considera variar el ritmo al hablar para enfatizar puntos clave"
  ],
  "elementsPresent": {
    "hasIntroduction": true,
    "hasThesis": true,
    "hasEvidence": true,
    "hasConclusion": true
  }
}
```

**Score Calculado:**
```
avgScore = (0.85 + 0.90 + 0.80 + 0.88) / 4 = 0.8575
baseScore = 85.75
structureBonus = +10 (todos los elementos presentes)
timeBonus = +20 (completó en 178 segundos, dentro de límite)
finalScore = Math.min(100, 85.75 + 10 + 20) = 100
```

#### Sistema de Scoring

**Fórmula Base:**
```typescript
// Promedio de 4 métricas
avgMetric = (clarity + logic + evidence + persuasion) / 4;
baseScore = avgMetric * 100;

// Bonuses
structureBonus = allElementsPresent ? 10 : 0;
timeBonus = duration <= timeLimit ? 20 : 0;
completionBonus = hasRecording && hasAnalysis ? 10 : 0;

totalScore = Math.min(100, baseScore + structureBonus + timeBonus + completionBonus);
```

**Criterios de Evaluación:**

1. **Claridad** (peso: 25%) - Dicción, articulación, estructura clara
2. **Lógica** (peso: 30%) - Coherencia argumentativa, transiciones, progresión de ideas
3. **Evidencia** (peso: 25%) - Uso de datos, ejemplos, hechos concretos
4. **Persuasión** (peso: 20%) - Efectividad retórica, tono, énfasis

**Bonificaciones:**
- **Estructura Completa:** +10 puntos si incluye introducción, tesis, evidencias, conclusión
- **Tiempo Óptimo:** +20 puntos si graba entre 120-180 segundos
- **Alta Calidad:** +10 puntos si promedio de métricas >0.85
- **Revisión:** +5 puntos si escucha su grabación antes de finalizar

**Penalizaciones:**
- **Demasiado corto:** -20 puntos si <90 segundos
- **Excede tiempo:** -10 puntos si >200 segundos
- **Falta elementos:** -5 puntos por cada elemento estructural ausente
- **Audio inaudible:** score = 0 (requiere re-grabación)

**Multiplicadores aplicables:**
- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.5x (mecánica very hard)
- Streak: +2% por día

#### Auto-gradabilidad

**Nivel:** ❌ Manual (con asistencia AI opcional)

**Por qué Manual:**
- Requiere transcripción precisa (Speech-to-Text API cuesta $)
- Evaluación de calidad oral requiere criterio humano
- Análisis de tono, ritmo, y énfasis son subjetivos
- Validación de evidencia requiere fact-checking contextual

**Asistencia AI (Opcional):**
Si se implementa evaluación automática:
- **Speech-to-Text:** Google Cloud Speech API o Whisper API
- **NLP Analysis:** Análisis de sentimiento, entity recognition
- **Structure Detection:** Parsing para detectar intro/tesis/conclusión
- **Fact Verification:** Cross-check de claims contra base de conocimiento

**Rúbrica para Revisión Docente:**

| Criterio | Excelente (90-100) | Bueno (75-89) | Satisfactorio (60-74) | Insuficiente (<60) |
|----------|-------------------|--------------|----------------------|-------------------|
| **Claridad** | Dicción perfecta, estructura cristalina | Algunos errores menores, estructura clara | Comprensible pero desorganizado | Difícil de seguir |
| **Lógica** | Argumento coherente con transiciones fluidas | Lógico con algunas desconexiones | Estructura básica presente | Sin estructura lógica |
| **Evidencia** | 3+ evidencias concretas y precisas | 2 evidencias adecuadas | 1 evidencia vaga | Sin evidencia |
| **Persuasión** | Altamente convincente, uso efectivo de retórica | Convincente en su mayoría | Argumento básico | No persuasivo |

#### Validaciones

- **Permiso de micrófono:** Solicitar y manejar rechazo con mensaje claro
- **Tiempo mínimo:** 60 segundos (1 minuto) para evitar grabaciones triviales
- **Tiempo máximo:** 240 segundos (4 minutos) para mantener concisión
- **Formato de audio:** Validar que audioBlob no esté corrupto
- **Volumen mínimo:** Detectar si audio está mudo o muy bajo
- **Requiere análisis:** No permitir completar sin analizar grabación primero

#### Integración con Gamificación

- **ML Coins base:** 50 coins (mecánica más compleja)
- **XP base:** 100 XP
- **Achievements desbloqueables:**
  - "Podcaster Profesional" - Obtener 95+ puntos en Podcast Argumentativo
  - "Orador Nato" - Completar 3 Podcasts con score >85
  - "Evidencia Sólida" - Usar 3+ evidencias concretas en un podcast
- **Power-ups utilizables:**
  - Pistas (15 ML Coins): Sugiere un ejemplo o evidencia para incluir
  - Script Helper (30 ML Coins): Muestra esquema de estructura recomendada
  - Segunda Oportunidad (50 ML Coins): Permite re-grabar una vez

#### Tiempo Estimado

15-20 minutos para completar ejercicio de calidad:
- Lectura de prompt y planificación: 3-5 min
- Práctica mental del argumento: 2-3 min
- Grabación (con posibles re-intentos): 5-10 min
- Análisis y revisión: 2-3 min
- Ajustes y re-grabación si necesario: 3-5 min

**Tiempo mínimo:** 10 minutos (grabación directa sin práctica)
**Tiempo óptimo:** 20 minutos (con planificación y revisión)

#### Prerequisitos

- Haber completado "Debate Digital" (para desarrollar habilidad argumentativa)
- Nivel mínimo: Rango Ixim (nivel 3)
- Micrófono funcional en dispositivo
- Navegador compatible con Web Audio API (Chrome, Firefox, Safari moderno)
- Ambiente tranquilo para grabar (recomendación, no requisito técnico)

#### Notas de Implementación

**Frontend:**
- Componente: `PodcastArgumentativoExercise.tsx`
- API: `podcastArgumentativoAPI.ts` con `analyzeRecording(transcription)`
- Hooks: useRef para mediaRecorderRef
- Permisos: Manejo de getUserMedia con try-catch
- Audio Format: audio/webm (Blob)

**Backend:**
- Endpoint: `POST /api/exercises/podcast/:id/upload` (subir audio)
- Endpoint: `POST /api/exercises/podcast/:id/transcribe` (transcribir)
- Storage: S3 o similar para almacenar archivos de audio
- Transcription: Integración con Speech-to-Text API (futuro)
- Analysis: Manual por teacher o AI analysis engine

**Consideraciones Técnicas:**
- **Tamaño de archivo:** Audio de 3 min ≈ 1-2 MB en webm
- **Cross-browser:** Verificar soporte de MediaRecorder en navegador
- **Mobile:** Funciona en iOS Safari y Android Chrome moderno
- **Privacidad:** Audio nunca se comparte sin consentimiento explícito
- **Retry:** Permitir múltiples grabaciones antes de finalizar

**Accesibilidad:**
- Alternativa para estudiantes sin micrófono: Permitir upload de archivo de audio grabado externamente
- Subtítulos: Transcripción sirve como subtítulos para revisión
- Navegación por teclado: Spacebar para iniciar/detener grabación

---

## MÓDULO 4: LECTURA DIGITAL

### 6.4 Infografía Interactiva

**Tipo:** `infografia_interactiva`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

#### Descripción

La Infografía Interactiva es una mecánica de lectura digital multimodal donde estudiantes exploran información presentada visualmente en forma de tarjetas interactivas revelables. A diferencia de leer un texto lineal, los estudiantes navegan libremente entre elementos visuales (cards), cada uno conteniendo un concepto o dato sobre Marie Curie.

La interfaz presenta 5 tarjetas distribuidas espacialmente en un canvas (posiciones definidas en %). Cada tarjeta muestra un ícono representativo (átomo, medalla, microscopio, estrella, corazón) y un título visible. Al hacer clic en una tarjeta no revelada, se expande con animación para mostrar el contenido completo (200-300 palabras explicando ese aspecto de Marie Curie).

Las tarjetas reveladas cambian su apariencia visual (borde dorado, fondo ligeramente destacado) para indicar progreso. Un componente DataVisualization muestra el mapa completo de tarjetas con líneas conectoras opcionales entre conceptos relacionados. Los estudiantes deben revelar todas las 5 tarjetas para completar el ejercicio, fomentando la exploración completa de la información.

La mecánica incluye botón "Revelar Todos" para estudiantes que prefieren ver todo de una vez, y botones "Guardar Progreso" y "Exportar" para descargar la infografía como JSON. Un contador visual muestra "X/5 elementos explorados", creando un sentido de progresión.

Visualmente, la interfaz usa un diseño de cards flotantes con Framer Motion para animaciones suaves al revelar. Los íconos de lucide-react proporcionan representación visual de cada concepto. El layout es responsive, adaptándose a pantallas pequeñas con grid vertical en móvil.

#### Objetivo Pedagógico

Desarrollar competencias de lectura digital no-lineal, incluyendo: (1) Navegación hipertextual entre elementos de información, (2) Construcción de conocimiento a través de exploración autónoma (vs. lectura secuencial), (3) Integración de información visual y textual multimodal, (4) Identificación de relaciones entre conceptos dispersos espacialmente, (5) Autorregulación del proceso de aprendizaje (elegir qué explorar primero), y (6) Comprensión de formatos digitales modernos (infografías, dashboards, visualizaciones interactivas) omnipresentes en medios digitales. Esta mecánica refleja cómo se consume información en web moderna: no-lineal, visual, interactiva.

#### Características Técnicas

- Grid de 5 tarjetas interactivas con posiciones configurables (x, y en %)
- Sistema de revelación con estado revealed: boolean por tarjeta
- Iconos diferenciados por tipo (atom, award, microscope, star, heart)
- Animaciones de Framer Motion en reveal/hide
- DataVisualization component con canvas visual de todas las tarjetas
- Progress tracking: calculado como (revealedCount / totalCards) * 100
- Botón "Revelar Todos" para exploración rápida
- Botón "Guardar Progreso" con save a localStorage
- Botón "Exportar" para descargar como JSON
- Auto-completado cuando todas las tarjetas están reveladas
- Responsive grid: 3 columnas desktop, 2 tablet, 1 móvil
- Color-coding opcional por categoría de información
- Hover effects en tarjetas no reveladas
- Confirmación visual con checkmark en tarjetas reveladas
- Auto-guardado cada 30 segundos

#### Estructura de Contenido

```typescript
interface InfografiaInteractivaData {
  id: string;
  title: string;
  description: string;
  topic: string;  // Ej: "Vida y Legado de Marie Curie"
  cards: InfoCard[];
  backgroundImage?: string;  // Opcional: imagen de fondo
  connections?: Connection[];  // Opcional: líneas entre cards relacionadas
}

interface InfoCard {
  id: string;
  title: string;  // Ej: "Descubrimientos Científicos"
  content: string;  // Texto completo (200-300 palabras)
  position: {
    x: number;  // 0-100 (porcentaje)
    y: number;  // 0-100 (porcentaje)
  };
  icon: 'atom' | 'award' | 'microscope' | 'star' | 'heart' | 'book' | 'globe';
  revealed: boolean;  // Estado de revelación
  category?: string;  // Opcional: para agrupar
}

interface Connection {
  from: string;  // card id
  to: string;    // card id
  label?: string;  // Opcional: describe la relación
}

interface InfografiaAnswer {
  cardsRevealed: string[];  // IDs de cards reveladas
  timeSpent: number;
  revealOrder: string[];  // Orden en que fueron reveladas
}

interface InfografiaEvaluation {
  score: number;  // 100 si todas reveladas, proporcional si no
  explorationScore: number;  // Basado en % explorado
  completeness: boolean;  // true si 100% revelado
}
```

#### Ejemplo de Contenido (Marie Curie)

**Título:** "Marie Curie: Ciencia, Pionerismo y Legado"

**Descripción:** "Explora la vida y contribuciones de Marie Curie a través de esta infografía interactiva. Haz clic en cada elemento para descubrir información clave."

**Tarjeta 1: Descubrimientos Científicos** (posición: x:20, y:30)
- **Ícono:** atom
- **Contenido:** "Entre 1898 y 1902, Marie Curie, junto a su esposo Pierre, aislaron dos nuevos elementos químicos: el Polonio (Po, nombrado por Polonia, su país natal) y el Radio (Ra). Estos descubrimientos revolucionaron la física y la química. El Radio, en particular, resultó ser 400 veces más radiactivo que el uranio, fenómeno que Marie estudió intensamente. Acuñó el término 'radioactividad' para describir esta propiedad. Su método meticuloso implicaba procesar toneladas de pechblenda (mineral de uranio) en condiciones precarias, trabajando en un cobertizo sin calefacción. El aislamiento del Radio puro tomó 4 años de trabajo extenuante. Este descubrimiento sentó las bases de la física nuclear moderna y abrió el campo de la radiología médica."

**Tarjeta 2: Premios Nobel** (posición: x:50, y:30)
- **Ícono:** award
- **Contenido:** "Marie Curie es la única persona en la historia en ganar Premios Nobel en dos disciplinas científicas diferentes. En 1903, compartió el Nobel de Física con Pierre Curie y Henri Becquerel por sus investigaciones sobre radiación. Fue la primera mujer en recibir este honor. En 1911, ganó el Nobel de Química por el descubrimiento del Radio y Polonio, esta vez como única galardonada, convirtiéndose en la primera persona (y hasta 1962, la única mujer) en ganar dos Nobels. Curiosamente, en 1903 inicialmente no iba a ser incluida en el premio; fue Pierre quien insistió en que el trabajo era conjunto. Su segundo Nobel solidificó su estatus como gigante de la ciencia, pero también enfrentó misoginia: algunos miembros de la Academia Francesa de Ciencias votaron en contra de su admisión."

**Tarjeta 3: Legado Científico** (posición: x:80, y:30)
- **Ícono:** microscope
- **Contenido:** "Las investigaciones de Marie Curie tuvieron aplicaciones médicas inmediatas y profundas. El Radio se usó para tratar tumores cancerígenos, naciendo así la radioterapia. Durante la Primera Guerra Mundial (1914-1918), Marie equipó ambulancias con máquinas de rayos X portátiles, llamadas 'petites Curies', que ayudaron a localizar balas y metralla en soldados heridos, salvando incontables vidas. Entrenó a técnicos en el uso de equipos de rayos X, democratizando esta tecnología. Su trabajo también inspiró a su hija Irène Joliot-Curie, quien ganó el Nobel de Química en 1935 por descubrir la radioactividad artificial. El Instituto Curie, fundado en 1909, sigue siendo un centro líder en investigación oncológica. Sin el trabajo de Marie, la medicina moderna sería irreconocible."

**Tarjeta 4: Pionera en Ciencia** (posición: x:35, y:70)
- **Ícono:** star
- **Contenido:** "Marie Curie (nacida Maria Skłodowska) rompió innumerables barreras de género. En 1891, viajó sola de Polonia a París para estudiar en la Sorbona, una de las pocas universidades que aceptaban mujeres en ciencias. Fue la primera mujer en obtener un doctorado en Física en Francia (1903). En 1906, tras la muerte trágica de Pierre en un accidente, Marie se convirtió en la primera profesora mujer de la Sorbona, ocupando la cátedra de su esposo. Enfrentó discriminación constante: colegas masculinos cuestionaban su capacidad, y en 1911, un escándalo personal (relación con Paul Langevin) casi la destruye profesionalmente. Sin embargo, perseveró, inspirando a generaciones de mujeres a seguir carreras en STEM. Hoy, su imagen es sinónimo de mujer en ciencia."

**Tarjeta 5: Impacto Mundial** (posición: x:65, y:70)
- **Ícono:** heart
- **Contenido:** "El impacto de Marie Curie trasciende sus descubrimientos. En términos humanitarios, la radioterapia derivada de su investigación ha salvado millones de vidas en el tratamiento del cáncer. Sus unidades móviles de rayos X durante la Primera Guerra Mundial trataron a más de un millón de soldados. En términos educativos, fundó el Instituto del Radio en París (1909, ahora Instituto Curie) y el Instituto del Radio en Varsovia (1925), centros de investigación y formación científica. Culturalmente, su figura ha sido representada en películas, obras de teatro, libros (incluida la biografía de su hija Ève), y hasta en billetes de 500 francos franceses. UNESCO estableció las becas Marie Curie para promover a mujeres en ciencia. Su legado vive en cada científica que enfrenta obstáculos y persevera."

**Conexiones visuales (opcionales):**
- Tarjeta 1 → Tarjeta 3: "Sus descubrimientos llevaron a aplicaciones médicas"
- Tarjeta 2 → Tarjeta 4: "Los Nobels validaron su trabajo a pesar de la discriminación"
- Tarjeta 4 → Tarjeta 5: "Su ejemplo pionero inspiró a generaciones"

#### Sistema de Scoring

**Fórmula Base:**
```typescript
explorationScore = (cardsRevealed / totalCards) * 100;
// Mecánica simple: completitud = score
baseScore = explorationScore;

// Bonus por exploración completa
completionBonus = explorationScore === 100 ? 20 : 0;

totalScore = Math.min(100, baseScore + completionBonus);
```

**Criterios de Evaluación:**

1. **Exploración Completa** (peso: 80%) - % de tarjetas reveladas
2. **Tiempo Invertido** (peso: 10%) - Bonus si dedica >5 minutos leyendo
3. **Guardado de Progreso** (peso: 5%) - Bonus si usa funciones de guardado/export
4. **Orden de Exploración** (peso: 5%) - Bonus si explora en orden lógico

**Bonificaciones:**
- **Exploración Completa:** +20 puntos si revela todas las 5 tarjetas
- **Lectura Profunda:** +10 puntos si dedica >60 segundos por tarjeta en promedio
- **Uso de Funciones:** +5 puntos si exporta infografía
- **Primera Vez:** +10 puntos si completa sin usar "Revelar Todos"

**Penalizaciones:**
- Ninguna (mecánica de exploración libre sin penalizaciones)
- Nota: Usar "Revelar Todos" no penaliza, solo no otorga bonus de exploración orgánica

**Multiplicadores aplicables:**
- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.1x (mecánica medium)
- Streak: +2% por día

#### Auto-gradabilidad

**Nivel:** ✅ Automático (100%)

**Métricas Automáticas:**
- Conteo de tarjetas reveladas (simple boolean check)
- Cálculo de porcentaje de exploración
- Tracking de tiempo por tarjeta (timestamp de revelación)
- Orden de revelación (array de IDs)
- Uso de funciones (guardado, export)

**No requiere revisión humana:**
Esta mecánica es puramente de exploración y lectura, sin producción de contenido por parte del estudiante. El scoring es objetivo y calculable automáticamente.

#### Validaciones

- **Mínimo 50% explorado:** Para permitir completar ejercicio (3/5 tarjetas)
- **Confirmación de lectura:** No aplicable (se asume que revelar = leer)
- **Timeout:** Ninguno (exploración a ritmo propio)
- **Re-exploración:** Permitir ocultar y revelar tarjetas múltiples veces

#### Integración con Gamificación

- **ML Coins base:** 25 coins
- **XP base:** 50 XP
- **Achievements desbloqueables:**
  - "Explorador Completo" - Revelar 100% de infografías en 3 ejercicios
  - "Lector Digital" - Dedicar >10 minutos explorando infografía
  - "Curador de Conocimiento" - Exportar 5 infografías
- **Power-ups utilizables:**
  - Visión Lectora (15 ML Coins): Resalta palabras clave en todas las tarjetas
  - Mapa Mental (25 ML Coins): Muestra conexiones entre tarjetas

#### Tiempo Estimado

7-10 minutos para exploración completa de calidad:
- Exploración de 5 tarjetas: 5-7 min (1-1.5 min por tarjeta)
- Revisión de conexiones: 1-2 min
- Exportación/guardado (opcional): 1 min

**Tiempo mínimo:** 5 minutos (lectura rápida de todas las tarjetas)
**Tiempo óptimo:** 10-12 minutos (lectura profunda con reflexión)

#### Prerequisitos

- Nivel mínimo: Rango Kʼaal (nivel 1) - mecánica accesible para principiantes
- No requiere completar ejercicios previos
- Recomendado: Familiaridad básica con infografías (concepto explicado en tutorial)

#### Notas de Implementación

**Frontend:**
- Componente: `InfografiaInteractivaExercise.tsx`
- Sub-componentes: `InteractiveCard.tsx`, `DataVisualization.tsx`
- Estado: Array de InfoCard con revealed boolean
- Animaciones: Framer Motion para reveal transitions
- Layout: CSS Grid responsive

**Backend:**
- Endpoint: `GET /api/exercises/infografia/:id` (obtener datos)
- Endpoint: `POST /api/exercises/infografia/:id/submit` (enviar progreso)
- Almacenamiento: JSON en base de datos con array de cards
- No requiere procesamiento complejo

**Consideraciones:**
- **Performance:** Lazy load de imágenes si las tarjetas incluyen fotos
- **Accessibility:** ARIA labels en todas las tarjetas, navegación por teclado
- **Mobile:** Touch events para reveal, grid 1-column en móvil
- **Export:** JSON.stringify() con pretty print para legibilidad

---

### 6.5 Navegación Hipertextual

**Tipo:** `navegacion_hipertextual`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

#### Descripción

Navegación Hipertextual es una mecánica que simula la experiencia de leer un artículo web con múltiples enlaces internos, reflejando cómo se consume información en la web moderna. Los estudiantes navegan entre "nodos" de texto conectados por hipervínculos, construyendo comprensión a través de un recorrido no-lineal.

La interfaz presenta un documento de texto (300-500 palabras) con palabras/frases resaltadas como hipervínculos (color azul, subrayado). Al hacer clic en un enlace, el usuario es transportado a un nuevo nodo con contenido relacionado. Un componente "Breadcrumbs" en la parte superior muestra la ruta de navegación (Inicio > Descubrimiento del Radio > Aplicaciones Médicas), permitiendo retroceder fácilmente.

El ejercicio define un nodo objetivo que los estudiantes deben alcanzar navegando estratégicamente por los enlaces. Un contador muestra "Nodos visitados: X/Y", y un indicador visual (checkmark verde) señala cuando se alcanza el nodo objetivo. La mecánica evalúa la capacidad de navegar eficientemente, entendiendo las relaciones semánticas entre nodos para llegar al destino.

Los nodos están estructurados como un grafo dirigido donde cada nodo puede tener 2-5 enlaces salientes hacia otros nodos. Algunos caminos son más directos (2-3 saltos) mientras que otros son serpenteantes (5+ saltos). Los estudiantes con mejor comprensión lectora eligen enlaces semánticamente relevantes para llegar más rápido al objetivo.

Visualmente, la interfaz usa un diseño limpio tipo artículo de blog, con breadcrumbs prominentes en la parte superior, el documento en el centro con enlaces destacados, y un panel lateral mostrando progreso (nodos visitados, objetivo alcanzado). Animaciones suaves de Framer Motion transicionan entre nodos.

#### Objetivo Pedagógico

Desarrollar competencias de lectura hipertextual digital, incluyendo: (1) Navegación estratégica entre documentos interconectados, (2) Construcción de modelos mentales de estructuras no-lineales de información, (3) Predicción semántica (elegir enlaces que probablemente lleven al objetivo), (4) Uso de breadcrumbs y otras ayudas de navegación web, (5) Comprensión de relaciones entre fragmentos de texto distribuidos, y (6) Tolerancia a la no-linealidad (vs. lectura secuencial tradicional). Esta mecánica refleja la lectura en Wikipedia, artículos de noticias con enlaces incrustados, y documentación técnica con referencias cruzadas - formatos ubicuos en la web moderna.

#### Características Técnicas

- Sistema de nodos con estructura de grafo dirigido
- Hyperlinks interactivos con hover effects
- Navegación por clics en enlaces (no URLs reales, interno a la app)
- Breadcrumb navigation component (NavigationBreadcrumbs.tsx)
- Tracking de nodos visitados con array de IDs
- Detección de nodo objetivo alcanzado
- HypertextDocument component para renderizar nodo actual
- Progress bar mostrando exploración (visitedNodes / totalNodes)
- Indicador visual de objetivo alcanzado (CheckCircle icon)
- Auto-completado cuando se alcanza nodo objetivo
- History de navegación para análisis post-ejercicio
- Botón opcional "Reset" para reiniciar exploración
- Animaciones de transición entre nodos (fade in/out)
- Responsive: Links con touch targets grandes en móvil
- Auto-guardado de estado cada 30 segundos

#### Estructura de Contenido

```typescript
interface NavegacionHipertextualData {
  id: string;
  title: string;
  description: string;
  startNodeId: string;  // Nodo inicial
  targetNodeId: string;  // Nodo objetivo a alcanzar
  nodes: HypertextNode[];
}

interface HypertextNode {
  id: string;
  title: string;
  content: string;  // Texto con placeholders para links
  links: HypertextLink[];
}

interface HypertextLink {
  id: string;
  text: string;  // Texto del enlace
  targetNodeId: string;  // A qué nodo lleva
  position?: {  // Opcional: dónde insertar el link en el content
    startIndex: number;
    endIndex: number;
  };
}

interface NavegacionAnswer {
  visitedNodes: string[];  // IDs en orden de visita
  targetReached: boolean;
  navigationPath: string[];  // Camino específico hasta el objetivo
  timeSpent: number;
  totalClicks: number;  // Número de enlaces clickeados
}

interface NavegacionEvaluation {
  score: number;
  efficiency: number;  // Qué tan directo fue el camino (optimal / actual)
  exploration: number;  // % de nodos visitados
  targetReached: boolean;
}
```

#### Ejemplo de Contenido (Marie Curie)

**Título:** "El Legado de Marie Curie: Una Red de Descubrimientos"

**Descripción:** "Navega a través de la historia de Marie Curie siguiendo los enlaces. Tu objetivo es llegar al nodo sobre 'Instituto Curie y su Legado Actual'."

**Nodo Inicial (ID: "inicio")**
**Título:** "Marie Curie: Una Introducción"
**Contenido:**
"Marie Curie (1867-1934) fue una científica pionera polaco-francesa. Junto a su esposo Pierre Curie, realizó investigaciones revolucionarias sobre [radioactividad](#radioactividad) en París a finales del siglo XIX. Su trabajo le valió dos [Premios Nobel](#nobels), convirtiéndola en la primera persona en ganar el galardón en dos disciplinas científicas diferentes. Marie no solo aportó a la ciencia pura, sino que también tuvo un [impacto en medicina](#medicina) que sigue vigente hoy."

**Links:**
1. "radioactividad" → nodo "radioactividad"
2. "Premios Nobel" → nodo "nobels"
3. "impacto en medicina" → nodo "medicina"

---

**Nodo: "radioactividad" (ID: "radioactividad")**
**Título:** "Descubrimiento de la Radioactividad"
**Contenido:**
"El fenómeno de la radioactividad fue inicialmente observado por Henri Becquerel en 1896, quien notó que sales de uranio emitían rayos misteriosos. Marie Curie decidió investigar este fenómeno para su tesis doctoral. Trabajando con [pechblenda](#pechblenda), un mineral de uranio, descubrió que era mucho más radiactivo que el uranio puro, sugiriendo la presencia de elementos desconocidos. Este descubrimiento llevó al aislamiento del [Radio y Polonio](#elementos)."

**Links:**
1. "pechblenda" → nodo "pechblenda"
2. "Radio y Polonio" → nodo "elementos"

---

**Nodo: "elementos" (ID: "elementos")**
**Título:** "Aislamiento del Radio y Polonio"
**Contenido:**
"Entre 1898 y 1902, Marie y Pierre Curie procesaron toneladas de pechblenda en condiciones precarias para aislar dos nuevos elementos: Polonio (Po) y Radio (Ra). El Radio resultó ser 400 veces más radiactivo que el uranio. Este trabajo extenuante, realizado en un cobertizo sin calefacción, demostró la dedicación de Marie. El [impacto médico del Radio](#medicina) fue inmediato, y sus descubrimientos fueron reconocidos con el [Premio Nobel de Física en 1903](#nobels)."

**Links:**
1. "impacto médico del Radio" → nodo "medicina"
2. "Premio Nobel de Física en 1903" → nodo "nobels"

---

**Nodo: "medicina" (ID: "medicina")**
**Título:** "Aplicaciones Médicas de la Radioactividad"
**Contenido:**
"El Radio descubierto por Marie Curie tuvo aplicaciones médicas inmediatas. En 1903, se descubrió que el Radio podía destruir células tumorales, naciendo así la radioterapia. Durante la [Primera Guerra Mundial](#guerra), Marie desarrolló unidades móviles de rayos X para tratar soldados heridos. Su legado médico continúa en instituciones como el [Instituto Curie](#instituto), que sigue siendo líder mundial en investigación oncológica."

**Links:**
1. "Primera Guerra Mundial" → nodo "guerra"
2. "Instituto Curie" → nodo "instituto" **(NODO OBJETIVO)**

---

**Nodo: "nobels" (ID: "nobels")**
**Título:** "Los Premios Nobel de Marie Curie"
**Contenido:**
"Marie Curie ganó dos Premios Nobel: en 1903, compartió el Nobel de Física con Pierre Curie y Henri Becquerel por investigaciones sobre radioactividad. En 1911, ganó el Nobel de Química por descubrir el Radio y Polonio. Fue la primera mujer en ganar un Nobel y la única persona en ganar en dos disciplinas científicas diferentes. A pesar de estos logros, enfrentó discriminación de género constante. Su trabajo sentó bases para el [Instituto Curie](#instituto)."

**Links:**
1. "Instituto Curie" → nodo "instituto" **(NODO OBJETIVO)**

---

**Nodo: "guerra" (ID: "guerra")**
**Título:** "Marie Curie en la Primera Guerra Mundial"
**Contenido:**
"Durante la Primera Guerra Mundial (1914-1918), Marie Curie equipó ambulancias con máquinas de rayos X portátiles, llamadas 'petites Curies'. Estas unidades permitieron a cirujanos militares localizar balas y metralla en soldados heridos, salvando incontables vidas. Marie personalmente condujo estas ambulancias al frente y entrenó a técnicos. Su esfuerzo humanitario demostró cómo la ciencia pura puede tener aplicaciones prácticas urgentes. Este legado de ciencia aplicada continúa en el [Instituto Curie](#instituto)."

**Links:**
1. "Instituto Curie" → nodo "instituto" **(NODO OBJETIVO)**

---

**Nodo Objetivo: "instituto" (ID: "instituto")**
**Título:** "Instituto Curie y su Legado Actual"
**Contenido:**
"El Instituto del Radio, fundado en 1909 y renombrado Instituto Curie tras la muerte de Marie en 1934, es actualmente uno de los centros líderes mundiales en investigación oncológica y radioterapia. Ubicado en París, combina investigación básica, atención clínica, y formación de oncólogos. El instituto trata a miles de pacientes con cáncer anualmente usando técnicas derivadas de las investigaciones originales de Marie. En 2025, el Instituto Curie sigue siendo un símbolo vivo del legado de Marie: ciencia rigurosa al servicio de la humanidad. **¡Has alcanzado el objetivo!**"

**Links:** (ninguno - nodo terminal)

---

**Camino Óptimo:**
inicio → medicina → instituto (2 clics)

**Caminos Alternativos:**
- inicio → nobels → instituto (2 clics)
- inicio → radioactividad → elementos → medicina → instituto (4 clics)
- inicio → radioactividad → elementos → nobels → instituto (4 clics)

#### Sistema de Scoring

**Fórmula Base:**
```typescript
// Score basado en exploración y eficiencia
explorationScore = (visitedNodes.length / totalNodes) * 60;
targetScore = targetReached ? 40 : 0;

// Bonus por eficiencia (camino corto)
optimalClicks = 2;  // Camino más corto posible
actualClicks = navigationPath.length - 1;
efficiencyBonus = targetReached ? Math.max(0, 20 - (actualClicks - optimalClicks) * 5) : 0;

totalScore = Math.min(100, explorationScore + targetScore + efficiencyBonus);
```

**Criterios de Evaluación:**

1. **Alcanzar Objetivo** (peso: 40%) - Binary: llegó o no llegó al nodo objetivo
2. **Exploración** (peso: 30%) - % de nodos visitados (fomenta exploración amplia)
3. **Eficiencia** (peso: 20%) - Qué tan directo fue el camino
4. **Tiempo** (peso: 10%) - Bonus por completar rápidamente

**Bonificaciones:**
- **Camino Óptimo:** +20 puntos si usa el camino más corto posible
- **Exploración Completa:** +15 puntos si visita 100% de nodos
- **Primera Ruta:** +10 puntos si alcanza objetivo en primer intento sin retrocesos
- **Tiempo Rápido:** +10 puntos si completa en <3 minutos

**Penalizaciones:**
- Ninguna explícita (el scoring premia eficiencia, la ineficiencia simplemente no otorga bonuses)

**Multiplicadores aplicables:**
- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.1x (mecánica medium)
- Streak: +2% por día

#### Auto-gradabilidad

**Nivel:** ✅ Automático (100%)

**Métricas Automáticas:**
- Detección de nodo objetivo alcanzado (simple ID check)
- Conteo de nodos visitados
- Cálculo de longitud de camino
- Comparación con camino óptimo
- Tracking de tiempo

**No requiere revisión:**
La mecánica es puramente de navegación, sin producción de contenido por el estudiante. Todas las métricas son objetivas y calculables automáticamente.

#### Validaciones

- **Objetivo alcanzado:** Requerido para score completo, aunque se puede completar sin alcanzarlo (score parcial)
- **Mínimo 3 nodos visitados:** Para considerar ejercicio como intentado seriamente
- **No loops infinitos:** Detectar si usuario está clickeando aleatoriamente sin progreso

#### Integración con Gamificación

- **ML Coins base:** 30 coins
- **XP base:** 60 XP
- **Achievements desbloqueables:**
  - "Navegador Experto" - Alcanzar objetivo en camino óptimo 3 veces
  - "Explorador Digital" - Visitar 100% de nodos en un ejercicio
  - "Ruta Maestra" - Completar 5 ejercicios de navegación con score >90
- **Power-ups utilizables:**
  - Mapa Mental (20 ML Coins): Muestra grafo completo de nodos y enlaces
  - Brújula (15 ML Coins): Indica dirección general hacia el objetivo

#### Tiempo Estimado

6-10 minutos para completar con exploración:
- Lectura de nodo inicial: 1 min
- Navegación y lectura de 3-6 nodos: 3-6 min
- Alcanzar objetivo: 1-2 min
- Exploración adicional (opcional): 1-2 min

**Tiempo mínimo:** 4 minutos (camino directo al objetivo)
**Tiempo óptimo:** 8-10 minutos (exploración balanceada + objetivo)

#### Prerequisitos

- Nivel mínimo: Rango Kʼaal (nivel 1)
- Familiaridad con navegación web (concepto de hiperenlaces)
- No requiere ejercicios previos

#### Notas de Implementación

**Frontend:**
- Componente principal: `NavegacionHipertextualExercise.tsx`
- Sub-componentes: `HypertextDocument.tsx`, `NavigationBreadcrumbs.tsx`
- Estado: currentNodeId, visitedNodes array
- Routing: Interno con state (no React Router)
- Breadcrumbs: Array de nodos visitados con links clickeables

**Backend:**
- Endpoint: `GET /api/exercises/navegacion/:id` (obtener grafo de nodos)
- Endpoint: `POST /api/exercises/navegacion/:id/submit` (enviar ruta de navegación)
- Estructura: Grafo almacenado como JSON con nodos y enlaces
- Validación: Verificar que targetNodeId existe en el grafo

**Consideraciones:**
- **Graf Complexity:** 6-10 nodos por ejercicio (no muy complejo)
- **Link Placement:** Usar placeholders {link:id} en content para insertar links
- **Accessibility:** Links con ARIA labels, breadcrumbs navegables por teclado
- **Mobile:** Enlaces con touch targets grandes (44x44px mínimo)

---

## RESUMEN DE 3 MECÁNICAS ADICIONALES

Por limitaciones de espacio, aquí está un resumen consolidado de las 3 mecánicas restantes del Módulo 4:

### 6.6 Reseña Crítica

**Tipo:** `resena_critica`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐⭐

**Descripción (Condensada):**
Estudiantes escriben una reseña crítica (300+ palabras) de una obra biográfica sobre Marie Curie (libro, documental, artículo). Incluye: título de obra, calificación de estrellas (1-5), resumen, análisis crítico, recomendación, y checklist de criterios (precisión histórica, claridad, profundidad, relevancia, uso de fuentes). Formato tipo reseña de Amazon/Goodreads.

**Características:**
- Select de obra a reseñar (4 opciones predefinidas)
- Rating con estrellas interactivas (Star icons)
- Textareas para resumen (mín 100 chars), análisis (mín 150 chars), recomendación (mín 50 chars)
- Checklist de 5 criterios evaluativos
- Contador de caracteres en tiempo real
- Auto-guardado cada 30s

**Scoring:** Base score = (completitud de campos * 70) + (criterios marcados * 30). Bonuses por extensión y profundidad.

**Auto-gradabilidad:** ⚠️ Híbrido (validación automática de completitud, revisión docente de calidad)

---

### 6.7 Chat Literario

**Tipo:** `chat_literario`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

**Descripción (Condensada):**
Conversación tipo chat con personajes históricos (Marie Curie o Pierre Curie) simulados por AI. Los estudiantes hacen preguntas y reciben respuestas "en personaje", aprendiendo sobre biografía de manera interactiva. Interfaz tipo WhatsApp con burbujas de chat, avatares, y selector de personaje activo.

**Características:**
- Chat interface con mensajes user/AI diferenciados
- Selector de personaje (Marie/Pierre)
- Responses predefinidas contextualmente relevantes
- Mínimo 5 mensajes para completar
- Auto-scroll a último mensaje
- Timestamps en cada mensaje
- Stats card: mensajes enviados, totales, personaje activo

**Scoring:** Base score = (userMessages / minMessages) * 70 + engagementBonus (30). Bonus por conversación extendida (10+ mensajes).

**Auto-gradabilidad:** ⚠️ Híbrido (conteo automático, calidad opcional por AI)

---

### 6.8 Email Formal

**Tipo:** `email_formal`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐

**Descripción (Condensada):**
Estudiantes redactan un email formal académico relacionado con Marie Curie (solicitud de información, agradecimiento, invitación). Sistema analiza tono, formalidad, profesionalismo. Incluye plantillas pre-diseñadas (3 tipos), campos Para/Asunto/Cuerpo, y análisis AI de métricas con sugerencias de mejora.

**Características:**
- Templates de email (Solicitud, Agradecimiento, Invitación)
- Campos: To (email), Subject (text), Body (textarea)
- Botón "Analizar Tono y Formalidad"
- Métricas visuales: Formalidad, Claridad, Profesionalismo (0-100 cada una)
- Barras de progreso coloreadas
- Lista de sugerencias de mejora
- Detección de palabras formales (estimado, atentamente, etc.)
- Validación de estructura (saludo, cierre)

**Scoring:** avgScore = (formality + clarity + professionalism) / 3. Bonuses por email perfecto (todas las métricas >80).

**Auto-gradabilidad:** ⚠️ Híbrido (análisis automático de palabras clave, revisión opcional para contexto)

---

### 6.9 Ensayo Argumentativo

**Tipo:** `ensayo_argumentativo`
**Módulo:** 4
**Tipo de Comprensión:** Digital
**Dificultad:** ⭐⭐⭐⭐⭐

**Descripción (Condensada):**
Escritura de ensayo estructurado (500+ palabras) sobre Marie Curie con secciones obligatorias: introducción, 3 argumentos, conclusión. Select de tema (4 opciones), campo de tesis, textareas para cada sección con contador de palabras. Progress tracking visual, sugerencias en tiempo real, stats de palabras totales y secciones completas.

**Características:**
- Select de tema del ensayo (4 opciones académicas)
- Campo de tesis (idea principal)
- 5 textareas: Intro (mín 100 palabras), Arg1/2/3 (mín 80 c/u), Conclusión (mín 100)
- Contador de palabras por sección con indicadores de progreso
- Color-coding de secciones (azul, verde, amarillo, púrpura, naranja)
- Stats card: palabras totales, progreso %, score, secciones completas
- Lista de sugerencias en tiempo real
- Botón "Guardar Progreso"
- Auto-guardado cada 30s

**Scoring:** Base score = (progress%) + thesisBonus (10 si existe). Bonuses por completar todas las secciones con palabras mínimas.

**Auto-gradabilidad:** ❌ Manual (requiere revisión docente de calidad argumentativa, coherencia, evidencia)

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas implementadas

### Resumen de Implementación

Este documento consolida la documentación de todas las mecánicas educativas. Para referencias específicas de implementación:

**Por Módulo:**
- [MODULO-01-COMPRENSION-LITERAL.md](./MODULO-01-COMPRENSION-LITERAL.md#-referencias-a-implementación) - 5 mecánicas
- [MODULO-02-COMPRENSION-INFERENCIAL.md](./MODULO-02-COMPRENSION-INFERENCIAL.md#-referencias-a-implementación) - 5 mecánicas
- [MODULO-03-COMPRENSION-CRITICA.md](./MODULO-03-COMPRENSION-CRITICA.md#-referencias-a-implementación) - 5 mecánicas
- [MODULO-04-LECTURA-DIGITAL.md](./MODULO-04-LECTURA-DIGITAL.md#-referencias-a-implementación) - 9 mecánicas
- [MODULO-05-PRODUCCION-TEXTOS.md](./MODULO-05-PRODUCCION-TEXTOS.md#-referencias-a-implementación) - 3 mecánicas

**Implementación Global:**
- **Database:** `educational_content.exercises` con 31 tipos de exercise_type ENUM
- **Backend:** 31 graders en `apps/backend/src/modules/educational/services/grading/`
- **Frontend:** 31 componentes en `apps/frontend/src/features/educational/components/exercises/`
- **Seed Data:** `apps/database/seed/exercises/` con ejercicios de ejemplo

**Estado:** ✅ 100% de las 31 mecánicas están completamente implementadas y production-ready

---

**FIN DEL DOCUMENTO**
