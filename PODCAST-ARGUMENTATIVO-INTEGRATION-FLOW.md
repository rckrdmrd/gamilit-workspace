# FLUJO DE INTEGRACIÓN: PodcastArgumentativoExercise

## 🔄 DIAGRAMA DE FLUJO

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIO INICIA EJERCICIO                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
         ┌───────────────────────────────┐
         │   loadExercise()              │
         │   - Carga datos del ejercicio │
         │   - Inicializa selectedTopic  │
         └───────────────┬───────────────┘
                         │
                         ▼
         ┌───────────────────────────────────────────┐
         │   USUARIO ELIGE: ¿GRABAR O ESCRIBIR?     │
         └───────────┬───────────────────────────────┘
                     │
        ┌────────────┴──────────────┐
        │                           │
        ▼                           ▼
┌────────────────┐          ┌──────────────────┐
│  OPCIÓN A:     │          │   OPCIÓN B:      │
│  Grabar Audio  │          │   Escribir Guión │
└────────┬───────┘          └─────────┬────────┘
         │                            │
         ▼                            │
┌─────────────────────┐               │
│ startRecording()    │               │
│ - Accede micrófono  │               │
│ - Inicia timer      │               │
└──────────┬──────────┘               │
           │                          │
           ▼                          │
┌─────────────────────┐               │
│ stopRecording()     │               │
│ - Guarda audioBlob  │               │
│ - Genera audioUrl   │               │
└──────────┬──────────┘               │
           │                          │
           ▼                          │
┌─────────────────────────┐           │
│ handleAnalyze()         │           │
│ - Transcribe audio      │           │
│ - Analiza argumentación │           │
│ - Guarda en scriptText  │           │
└──────────┬──────────────┘           │
           │                          │
           └──────────┬───────────────┘
                      │
                      ▼
         ┌────────────────────────────┐
         │   USUARIO PRESIONA         │
         │   "Completar Ejercicio"    │
         └────────────┬───────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   handleComplete() - VALIDACIONES    │
         │                                      │
         │   ✓ Usuario autenticado?            │
         │   ✓ Script >= 200 caracteres?      │
         └────────────┬─────────────────────────┘
                      │
                      │ ✅ SI
                      ▼
         ┌──────────────────────────────────────┐
         │   Preparar Payload                   │
         │   {                                  │
         │     topicId: "topic-1",             │
         │     script: finalScript,            │
         │     audioUrl: audioUrl?             │
         │   }                                 │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   submitExercise(                    │
         │     exerciseId,                      │
         │     userId,                          │
         │     answers                          │
         │   )                                  │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   BACKEND PROCESA                    │
         │   - Evalúa script                    │
         │   - Calcula score                    │
         │   - Asigna rewards                   │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   Response recibido                  │
         │   {                                  │
         │     attemptId: "...",               │
         │     score: 85,                      │
         │     isPerfect: false,               │
         │     rewards: { mlCoins, xp },       │
         │     feedback: { ... }               │
         │   }                                 │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   Actualizar UI                      │
         │   - setCurrentScore(response.score)  │
         │   - setShowFeedback(true)           │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   FeedbackModal                      │
         │   - Muestra score                    │
         │   - Muestra confetti si >= 70        │
         └────────────┬─────────────────────────┘
                      │
                      ▼
         ┌──────────────────────────────────────┐
         │   onClose()                          │
         │   - Si score >= 70: onComplete()    │
         └──────────────────────────────────────┘
```

---

## 📊 ESTADOS DEL COMPONENTE

### Estados Core
```typescript
const { user } = useAuth();                    // Usuario autenticado
const [exercise, setExercise] = useState();    // Datos del ejercicio
const [recording, setRecording] = useState();  // Grabación de audio
const [analysis, setAnalysis] = useState();    // Análisis del argumento
const [currentScore, setCurrentScore] = useState(0); // Score actual
```

### Estados de UI
```typescript
const [isRecording, setIsRecording] = useState(false);   // Grabando?
const [analyzing, setAnalyzing] = useState(false);       // Analizando?
const [isSubmitting, setIsSubmitting] = useState(false); // Enviando?
const [showFeedback, setShowFeedback] = useState(false); // Mostrar feedback?
```

### Estados de Contenido
```typescript
const [scriptText, setScriptText] = useState('');        // Guión escrito
const [selectedTopic, setSelectedTopic] = useState();    // Tema elegido
const [audioUrl, setAudioUrl] = useState<string>();      // URL del audio
```

---

## 🔑 VALIDACIONES IMPLEMENTADAS

### 1. Validación de Autenticación
```typescript
if (!user?.id) {
  alert('Debes estar autenticado para enviar el ejercicio.');
  return;
}
```

### 2. Validación de Longitud de Script
```typescript
const finalScript = scriptText || recording.transcription;

if (!finalScript || finalScript.length < 200) {
  alert(`El guión debe tener al menos 200 caracteres.
         Actualmente tiene ${finalScript?.length || 0} caracteres.`);
  return;
}
```

### 3. Validación de UI (Button Disabled)
```typescript
<DetectiveButton
  disabled={!analysis || isSubmitting}  // Solo habilita si hay analysis
  loading={isSubmitting}                // Muestra loader mientras envía
>
```

---

## 🎯 FORMATO DE DATOS

### Input: Payload Enviado al Backend
```typescript
interface PodcastArgumentativoAnswers {
  topicId: string;        // "topic-1"
  script: string;         // Mínimo 200 caracteres
  audioUrl?: string;      // Opcional
}
```

### Output: Respuesta del Backend
```typescript
interface SubmitExerciseResponse {
  attemptId: string;
  score: number;                  // 0-100
  isPerfect: boolean;
  correctAnswersCount: number;
  totalQuestions: number;
  rewards: {
    mlCoins: number;
    xp: number;
    bonuses: { ... };
  };
  feedback: {
    overall: string;
    answerReview: [...];
  };
  achievements?: [...];
  rankUp?: {...} | null;
}
```

---

## 🧪 CASOS DE USO

### Caso 1: Usuario Graba Audio
1. Presiona "Iniciar Grabación"
2. Habla durante 2-3 minutos
3. Presiona "Detener Grabación"
4. Presiona "Analizar Podcast"
5. Sistema transcribe y analiza
6. `scriptText` se llena con transcripción
7. Presiona "Completar Ejercicio"
8. Se envía `{ script: transcription, audioUrl: blob:... }`

### Caso 2: Usuario Escribe Guión
1. Escribe directamente en textarea (futuro)
2. `scriptText` se llena manualmente
3. Presiona "Completar Ejercicio"
4. Se envía `{ script: manualText, audioUrl: undefined }`

### Caso 3: Usuario Escribe Y Graba
1. Escribe guión en textarea
2. Graba audio como respaldo
3. `scriptText` contiene texto manual
4. `audioUrl` contiene blob del audio
5. Se envía ambos al backend

---

## ⚠️ MANEJO DE ERRORES

### Error de Autenticación
```typescript
if (!user?.id) {
  alert('Debes estar autenticado...');
  return;
}
```

### Error de Validación
```typescript
if (finalScript.length < 200) {
  alert('El guión debe tener al menos 200 caracteres...');
  return;
}
```

### Error de Red/Backend
```typescript
try {
  const response = await submitExercise(...);
} catch (error) {
  console.error('[PodcastArgumentativo] Error al enviar:', error);
  alert('Hubo un error al enviar tu podcast...');
}
```

---

## 🔄 CICLO DE VIDA DEL SUBMIT

```
1. Usuario → handleComplete()
2. Validar autenticación
3. Validar longitud script
4. setIsSubmitting(true)
5. Preparar payload
6. await submitExercise()
7. Backend procesa
8. Response recibido
9. setCurrentScore(response.score)
10. setShowFeedback(true)
11. FeedbackModal aparece
12. Usuario cierra modal
13. onComplete() llamado (si score >= 70)
14. setIsSubmitting(false)
```

---

## 📈 MÉTRICAS DE ÉXITO

- ✅ Build exitoso sin errores TypeScript
- ✅ Validaciones implementadas correctamente
- ✅ Manejo de errores robusto
- ✅ UI responsive durante submit
- ✅ Feedback claro al usuario
- ✅ Integración completa con backend

---

## 🔗 REFERENCIAS

- **API:** `/api/progress/submissions/submit`
- **Hook:** `useAuth()`
- **Función:** `submitExercise()`
- **Componente Ref:** `TribunalOpinionesExercise.tsx`

---

**Versión:** 1.0
**Fecha:** 2025-11-24
**Status:** ✅ PRODUCTION READY
