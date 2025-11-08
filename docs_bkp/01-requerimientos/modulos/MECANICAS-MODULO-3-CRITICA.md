# Mecánicas Detalladas - Módulo 3: Comprensión Crítica

**Proyecto:** Gamilit Platform
**Módulo:** Contenido Educativo
**Archivo original:** MECANICAS-DOCUMENTACION-COMPLETA.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Contenido

Este documento contiene la documentación detallada de 2 mecánicas adicionales del Módulo 3 (Comprensión Crítica) que requieren especificaciones extendidas.

**Mecánicas incluidas:**
1. Podcast Argumentativo
2. Análisis de Fuentes (resumen)

**Nota:** La mecánica "Debate Digital" se encuentra en archivo separado: `MECANICA-DEBATE-DIGITAL.md`

---

## 5.3 Podcast Argumentativo

**Tipo:** `podcast_argumentativo`
**Módulo:** 3
**Tipo de Comprensión:** Crítica
**Dificultad:** ⭐⭐⭐⭐⭐

### Descripción

El Podcast Argumentativo es la mecánica más avanzada del Módulo 3, requiriendo que estudiantes graben un argumento oral coherente de 2-3 minutos usando el micrófono de su dispositivo. Esta mecánica integra comprensión lectora, pensamiento crítico, y producción oral argumentativa en un formato moderno y relevante (podcasting).

La interfaz presenta un gran timer central mostrando MM:SS, un botón rojo de "Iniciar Grabación" con icono de micrófono, y una vez grabado, un player de audio para revisar la grabación. El sistema usa Web Audio API del navegador para capturar audio sin necesidad de software externo. Durante la grabación, el timer corre y el botón cambia a "Detener Grabación" con animación pulsante.

Una vez detenida la grabación, el sistema genera automáticamente una transcripción (actualmente mock, pero preparado para integración con Speech-to-Text API) y analiza el contenido en 4 dimensiones: Claridad (dicción, estructura), Lógica (coherencia argumentativa), Evidencia (uso de datos/hechos), y Persuasión (efectividad retórica). Cada dimensión se califica de 0-100.

El análisis verifica la presencia de elementos estructurales requeridos: introducción clara, tesis definida, al menos 2 evidencias de apoyo, y conclusión que cierre el argumento. Un sistema de checklist visual muestra qué elementos están presentes (✅) o ausentes (❌). El feedback incluye sugerencias específicas de mejora, como "Añade más evidencia concreta" o "Tu introducción necesita contextualizar mejor el tema".

Visualmente, la interfaz usa un diseño limpio centrado en el timer, con métricas de análisis mostradas como cards con barras de progreso de color (azul: claridad, verde: lógica, naranja: evidencia, púrpura: persuasión). La transcripción se muestra en un área de texto de solo lectura con formato limpio.

### Objetivo Pedagógico

Desarrollar habilidades de argumentación oral estructurada, incluyendo:

1. Planificación y organización de argumentos antes de hablar
2. Articulación clara de ideas complejas sin texto escrito
3. Uso efectivo de la voz (tono, ritmo, énfasis) para persuadir
4. Manejo de tiempo limitado para argumentación concisa
5. Integración de evidencia y ejemplos en discurso oral
6. Desarrollo de confianza en presentación oral de ideas académicas

Esta mecánica prepara a estudiantes para presentaciones orales, defensa de trabajos, entrevistas académicas, y comunicación científica pública (formato podcast cada vez más popular en divulgación científica).

### Características Técnicas

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

### Estructura de Contenido

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

### Ejemplo de Contenido (Marie Curie)

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

### Sistema de Scoring

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

### Auto-gradabilidad

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

### Validaciones

- **Permiso de micrófono:** Solicitar y manejar rechazo con mensaje claro
- **Tiempo mínimo:** 60 segundos (1 minuto) para evitar grabaciones triviales
- **Tiempo máximo:** 240 segundos (4 minutos) para mantener concisión
- **Formato de audio:** Validar que audioBlob no esté corrupto
- **Volumen mínimo:** Detectar si audio está mudo o muy bajo
- **Requiere análisis:** No permitir completar sin analizar grabación primero

### Integración con Gamificación

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

### Tiempo Estimado

15-20 minutos para completar ejercicio de calidad:
- Lectura de prompt y planificación: 3-5 min
- Práctica mental del argumento: 2-3 min
- Grabación (con posibles re-intentos): 5-10 min
- Análisis y revisión: 2-3 min
- Ajustes y re-grabación si necesario: 3-5 min

**Tiempo mínimo:** 10 minutos (grabación directa sin práctica)
**Tiempo óptimo:** 20 minutos (con planificación y revisión)

### Prerequisitos

- Haber completado "Debate Digital" (para desarrollar habilidad argumentativa)
- Nivel mínimo: Rango Ixim (nivel 3)
- Micrófono funcional en dispositivo
- Navegador compatible con Web Audio API (Chrome, Firefox, Safari moderno)
- Ambiente tranquilo para grabar (recomendación, no requisito técnico)

### Notas de Implementación

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

## 🔗 Referencias a Implementación

### Documento Principal
📄 **[MODULOS-EDUCATIVOS.md](./MODULOS-EDUCATIVOS.md#-referencias-a-implementación)** - Referencias completas de las 31 mecánicas
📄 **[MODULO-03-COMPRENSION-CRITICA.md](./MODULO-03-COMPRENSION-CRITICA.md#-referencias-a-implementación)** - Referencia del módulo completo

### Específico para Mecánicas Módulo 3

**Database:**
- `educational_content.exercises` WHERE `module_id` = (SELECT id FROM modules WHERE name = 'Comprensión Crítica')
- Tipos: 'analisis_argumento', 'ensayo_corto', 'evaluacion_fuentes', 'comparar_versiones', 'analisis_critico'

**Backend Graders:**
- `apps/backend/src/modules/educational/services/grading/analisis-argumento.grader.ts` - Identificación de premisas/conclusiones
- `apps/backend/src/modules/educational/services/grading/ensayo-corto.grader.ts` - Manual grading (teacher required)
- `apps/backend/src/modules/educational/services/grading/evaluacion-fuentes.grader.ts` - Rubrica de credibilidad
- `apps/backend/src/modules/educational/services/grading/comparar-versiones.grader.ts` - Matriz de diferencias
- `apps/backend/src/modules/educational/services/grading/analisis-critico.grader.ts` - Pensamiento crítico

**Frontend Components:**
- `apps/frontend/src/features/educational/components/exercises/AnalisisArgumentoExercise.tsx`
- `apps/frontend/src/features/educational/components/exercises/EnsayoCortoExercise.tsx` - TipTap rich text editor
- `apps/frontend/src/features/educational/components/exercises/EvaluacionFuentesExercise.tsx` - Rubrica interactiva
- `apps/frontend/src/features/educational/components/exercises/CompararVersionesExercise.tsx` - Vista split-screen
- `apps/frontend/src/features/educational/components/exercises/AnalisisCriticoExercise.tsx`

**Seed Data:**
- `apps/database/seed/exercises/modulo-3-ejercicios.json` - 5 ejercicios de pensamiento crítico sobre Marie Curie

---

**Documento preparado por:** Equipo de Análisis Técnico
**Última actualización:** 2025-11-01
**Versión:** 2.0 (Modularizado)
