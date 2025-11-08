# Mecánica: Debate Digital

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MECANICAS-DOCUMENTACION-COMPLETA.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Información General

**Tipo:** `debate_digital`
**Módulo:** 3 - Comprensión Crítica
**Tipo de Comprensión:** Crítica
**Dificultad:** ⭐⭐⭐⭐

---

## Descripción

El Debate Digital es una mecánica interactiva de argumentación en tiempo real donde estudiantes mantienen una conversación dialéctica con un oponente AI sobre temas controversiales relacionados con Marie Curie. A diferencia del Tribunal de Opiniones (donde se evalúan argumentos externos), aquí el estudiante debe construir y defender sus propios argumentos en un formato de chat conversacional.

La interfaz simula una aplicación de mensajería moderna con burbujas de chat diferenciadas por color: azul para el estudiante (alineado a la derecha) y gris con borde para la AI oponente (alineado a la izquierda). Cada mensaje muestra avatar (User/Bot icon), timestamp, y el contenido del argumento. La AI responde con contra-argumentos contextuales basados en el contenido del mensaje del estudiante, creando un flujo dinámico de debate.

El sistema analiza cada mensaje del estudiante en tiempo real, evaluando: longitud del argumento (conteo de palabras como proxy de profundidad), uso de dispositivos retóricos, coherencia lógica, y capacidad de contra-argumentación. Los estudiantes deben enviar un mínimo de 3 mensajes (idealmente 5+) para completar el ejercicio, fomentando la participación sostenida.

La AI opponent tiene una personalidad definida (en el tema de patentes de Marie Curie, defiende la posición de que DEBIÓ patentar) y usa técnicas argumentativas variadas: apelaciones a consecuencias, ejemplos históricos, preguntas retóricas, y contra-argumentos anticipatorios. Esto expone a los estudiantes a diferentes estilos de argumentación que deben analizar y responder efectivamente.

Un indicador visual "IA está escribiendo..." con loading spinner simula el comportamiento humano, creando una experiencia inmersiva. El historial completo de mensajes se guarda y scroll automático lleva al usuario siempre al último mensaje, manteniendo el flujo conversacional natural.

---

## Objetivo Pedagógico

Desarrollar habilidades de argumentación dialógica en tiempo real, incluyendo:

1. Construcción rápida de argumentos coherentes bajo presión temporal
2. Análisis y respuesta a contra-argumentos inesperados
3. Uso estratégico de dispositivos retóricos (ethos, pathos, logos)
4. Mantenimiento de coherencia argumentativa a través de múltiples turnos
5. Adaptación de estrategia argumentativa según la respuesta del oponente
6. Desarrollo de fluidez en lenguaje académico argumentativo

Esta mecánica simula debates reales en entornos académicos, preparando a estudiantes para seminarios, presentaciones orales, y escritura académica persuasiva.

---

## Características Técnicas

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

---

## Estructura de Contenido

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

---

## Ejemplo de Contenido (Marie Curie)

### Tema
**Título:** "Patentes Científicas y Bienestar Económico"

**Pregunta:** "¿Debería Marie Curie haber patentado sus descubrimientos del Radio y Polonio?"

**Contexto:** "En 1898, Marie y Pierre Curie aislaron dos nuevos elementos radiactivos. A diferencia de muchos científicos de su época, decidieron NO patentar el proceso de extracción, permitiendo que cualquier laboratorio o empresa pudiera producir Radio. Esta decisión costó a los Curie millones de francos, mientras vivían en condiciones económicas precarias. Su elección aceleró la investigación global en radioactividad y aplicaciones médicas, pero les negó recursos que podrían haber financiado más investigaciones."

### AI Persona
- **Nombre:** "Oponente IA"
- **Stance:** "Marie DEBIÓ patentar sus descubrimientos"
- **Style:** "balanced"
- **Opening:** "Hola, soy tu oponente en este debate. Defenderé la posición de que Marie Curie debió haber patentado sus descubrimientos. ¿Cuál es tu argumento inicial?"

### Flujo de Debate Ejemplo

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

---

## Sistema de Scoring

### Fórmula Base

```typescript
baseScore = messageScore * userMessageCount;
messageScore = Math.min(20, messageLength / 5); // Hasta 20 puntos por mensaje profundo
participationBonus = Math.min(30, userMessageCount * 5); // Hasta 30 puntos por participación
timeBonus = calculateTimeBonus(startTime, endTime, 20, 120); // 20 puntos si < 120s
totalScore = Math.min(100, baseScore + participationBonus + timeBonus);
```

### Criterios de Evaluación

1. **Participación** (peso: 40%) - Cantidad de mensajes enviados (mínimo 5 para máximo score)
2. **Profundidad** (peso: 30%) - Longitud y sustancia de argumentos (palabras por mensaje)
3. **Consistencia** (peso: 20%) - Coherencia lógica entre mensajes sucesivos
4. **Contra-argumentación** (peso: 10%) - Capacidad de responder a puntos de la AI

### Bonificaciones

- **Participación Activa:** +10 puntos si envía 5+ mensajes
- **Mensajes Sustanciales:** +5 puntos por cada mensaje >50 palabras (máx 3 bonuses)
- **Debate Extendido:** +15 puntos si mantiene debate durante 10+ turnos
- **Tiempo Eficiente:** +20 puntos si completa en <2 minutos

### Penalizaciones

- Mensajes muy cortos (<10 palabras): -2 puntos por mensaje
- Abandonar antes de 3 mensajes: score = 0
- Uso de hints: -10 ML Coins por hint

### Multiplicadores aplicables

- Rango Maya: 1.0x - 2.0x
- Dificultad: 1.3x (mecánica hard)
- Streak: +2% por día

---

## Auto-gradabilidad

**Nivel:** ⚠️ Híbrido (70% Automático, 30% Revisión AI/Docente)

### Automático
- Conteo de mensajes enviados
- Análisis de longitud promedio (palabras)
- Cálculo de tiempo total
- Scoring de participación
- Detección de mensajes vacíos o spam

### Requiere AI/Revisión
- Evaluación de calidad argumentativa
- Detección de dispositivos retóricos usados
- Análisis de coherencia lógica
- Identificación de falacias lógicas
- Valoración de contra-argumentación efectiva

### Sistema de Evaluación AI (Opcional)

Si se implementa evaluación automática avanzada con NLP:
- Análisis de sentimiento para detectar tono apropiado
- Entity recognition para verificar referencias precisas a Marie Curie
- Dependency parsing para evaluar complejidad sintáctica
- Similarity scoring para detectar repetición de argumentos

---

## Validaciones

- **Mínimo 3 mensajes** de usuario para permitir completar ejercicio
- **Máximo 500 caracteres** por mensaje para fomentar concisión
- **Mínimo 10 caracteres** por mensaje para prevenir spam
- **No permitir envío vacío** o solo espacios
- **Bloqueo temporal** mientras AI responde (prevenir múltiples envíos)
- **Timeout de sesión:** 30 minutos de inactividad auto-cierra ejercicio

---

## Integración con Gamificación

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

---

## Tiempo Estimado

**Total:** 8-12 minutos para un debate completo de calidad

- Lectura de contexto: 1-2 min
- Mensaje inicial: 1 min
- 5-7 turnos de debate: 5-8 min (1 min por turno)
- Revisión final: 1 min

**Tiempo mínimo aceptable:** 5 minutos (3 mensajes)
**Tiempo óptimo:** 10-15 minutos (5-7 mensajes con profundidad)

---

## Prerequisitos

- Haber completado "Construcción de Hipótesis" (Módulo 2)
- Nivel mínimo: Rango Chʼok (nivel 2)
- Recomendado: Completar "Tribunal de Opiniones" primero para entender sesgos

---

## Notas de Implementación

### Frontend
- Componente: `DebateDigitalExercise.tsx`
- API mock: `debateDigitalAPI.ts` con función `sendDebateMessage(text, topic)`
- Estado local: array de DebateMessage con useState
- Ref: messagesEndRef para auto-scroll
- Animación: AnimatePresence para entrada/salida de mensajes

### Backend
- Endpoint: `POST /api/exercises/debate/:id/message` (envío de mensaje)
- Endpoint: `POST /api/exercises/debate/:id/submit` (finalizar debate)
- AI Integration: Opcional - OpenAI API para respuestas contextuales
- Mock responses: Array predefinido de respuestas si no hay AI real

### Consideraciones
- Latencia de respuesta AI: 1-2 segundos para simular "escribiendo"
- Caché de respuestas comunes para reducir llamadas API
- Fallback a respuestas predefinidas si AI falla
- Rate limiting: Máximo 1 mensaje por 5 segundos por usuario

---

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas

### Específico para Mecánica: Debate Digital

**Database:**
- `educational_content.exercises` WHERE `type` = 'debate_digital'
- Tabla JSONB `content` estructura:
  ```json
  {
    "topic": "¿El trabajo de Marie Curie justificaba los riesgos?",
    "context": "Texto sobre exposición a radiación",
    "sides": ["a_favor", "en_contra"],
    "min_arguments": 2,
    "max_characters_per_argument": 500
  }
  ```

**Backend:**
- `apps/backend/src/modules/educational/services/grading/debate-digital.grader.ts`
  - **Validación:** Mínimo 2 argumentos por lado, max 500 chars, coherencia
- `apps/backend/src/modules/ai/services/debate-ai.service.ts` (opcional)
  - **AI Opponent:** Generación de contra-argumentos usando GPT-3.5/4
  - **Fallback:** Respuestas predefinidas si AI no disponible

**Frontend:**
- `apps/frontend/src/features/educational/components/exercises/DebateDigitalExercise.tsx`
  - **Features:** Thread view, argumentos pro/contra, typing indicator, rate limiting
- `apps/frontend/src/features/educational/components/DebateThread.tsx`
  - **Propósito:** Vista de conversación estilo chat
- `apps/frontend/src/features/educational/components/ArgumentCard.tsx`
  - **Propósito:** Card de argumento con badge (a_favor/en_contra)

**Seed Data:**
- `apps/database/seed/exercises/modulo-2-ejercicios.json` - Debate sobre riesgos científicos de Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
