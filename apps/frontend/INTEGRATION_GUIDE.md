# Guía de Integración - Ejercicios Módulos 4 y 5

## Resumen de Implementación

Se ha completado la capa frontend para los módulos 4 y 5 de GAMILIT con los siguientes componentes:

### 1. Hooks Creados

#### `useVideoRecorder.ts`
Hook para grabación de video con funcionalidades:
- Permiso de cámara/micrófono
- Grabación con preview en vivo
- Pause/Resume
- Configuración de resolución y framerate
- Manejo completo de errores
- Ubicación: `/apps/frontend/src/shared/hooks/useVideoRecorder.ts`

**Uso:**
```tsx
import { useVideoRecorder } from '@/shared/hooks/useVideoRecorder';

const {
  videoBlob,
  previewUrl,
  startRecording,
  stopRecording,
  isRecording
} = useVideoRecorder();

// Iniciar grabación con opciones
await startRecording({
  width: 1280,
  height: 720,
  frameRate: 30
});
```

### 2. API Clients Creados

#### `manualReviewApi.ts`
Cliente para el servicio de revisiones manuales del backend.
- Ubicación: `/apps/frontend/src/shared/api/manualReviewApi.ts`

**Endpoints:**
- `getPendingReviews()` - Lista de revisiones pendientes
- `getReviewById(id)` - Obtener revisión específica
- `startReview(submissionId)` - Iniciar revisión
- `updateReview(id, updates)` - Guardar progreso
- `completeReview(id, completion)` - Completar y enviar

**Uso:**
```tsx
import { manualReviewApi } from '@/shared/api/manualReviewApi';

// Obtener revisiones pendientes
const reviews = await manualReviewApi.getPendingReviews({
  moduleId: 'module-4',
  exerciseId: 'verificador-fake-news'
});

// Completar revisión
await manualReviewApi.completeReview(reviewId, {
  evaluations: [...],
  generalFeedback: 'Excelente trabajo',
  notifyStudent: true
});
```

#### `mediaApi.ts`
Cliente para upload de archivos multimedia.
- Ubicación: `/apps/frontend/src/shared/api/mediaApi.ts`

**Funcionalidades:**
- Upload de imágenes, audio, video
- Validación de tipos y tamaños
- Progress tracking
- Multi-upload

**Uso:**
```tsx
import { mediaApi } from '@/shared/api/mediaApi';

// Upload con progress
const response = await mediaApi.uploadMedia(file, {
  type: 'video',
  exerciseId: exerciseId,
  onProgress: (progress) => {
    console.log(`Upload: ${progress}%`);
  }
});

console.log('URL:', response.url);
```

### 3. Componentes Creados

#### `MediaUploader.tsx`
Componente reutilizable para upload de archivos.
- Ubicación: `/apps/frontend/src/shared/components/mechanics/MediaUploader.tsx`

**Features:**
- Drag & drop
- Preview de archivos (imagen, audio, video)
- Progress bar
- Validación automática
- Multi-archivo

**Uso:**
```tsx
import { MediaUploader } from '@/shared/components/mechanics/MediaUploader';

<MediaUploader
  acceptedTypes={['image', 'video']}
  maxSize={10 * 1024 * 1024} // 10MB
  maxFiles={3}
  exerciseId={exerciseId}
  onUpload={(media) => {
    console.log('Uploaded:', media);
  }}
  onError={(error) => {
    console.error('Error:', error);
  }}
/>
```

#### `RubricEvaluator.tsx`
Componente para calificar según rúbricas.
- Ubicación: `/apps/frontend/src/shared/components/mechanics/RubricEvaluator.tsx`

**Features:**
- Sliders para cada criterio
- Cálculo automático de puntaje total
- Feedback por criterio
- Feedback general
- Validación

**Uso:**
```tsx
import { RubricEvaluator } from '@/shared/components/mechanics/RubricEvaluator';

<RubricEvaluator
  rubric={review.rubric}
  initialEvaluations={review.evaluations}
  onChange={(evaluations, feedback, score) => {
    console.log('Total score:', score);
  }}
  onValidation={(valid, errors) => {
    console.log('Valid:', valid);
  }}
/>
```

### 4. Panel de Revisión para Docentes

Ubicación: `/apps/frontend/src/apps/teacher/pages/ReviewPanel/`

**Componentes:**
- `ReviewPanelPage.tsx` - Página principal
- `ReviewList.tsx` - Lista de revisiones pendientes
- `ReviewDetail.tsx` - Vista detallada con evaluación

**Integración en routing:**
```tsx
import { ReviewPanelPage } from '@/apps/teacher/pages/ReviewPanel';

// En teacher routes
<Route path="/teacher/reviews" element={<ReviewPanelPage />} />
```

## Cómo Conectar Ejercicios Módulo 4 a API Real

### Patrón General

Los ejercicios del módulo 4 ya tienen frontend completo pero usan mock data. Para conectarlos:

#### 1. Importar el hook de submission
```tsx
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
```

#### 2. Usar el hook en el componente
```tsx
const { submissionState, submitAnswers } = useExerciseSubmission({
  onSuccess: (response) => {
    setFeedback({
      score: response.score,
      correctAnswers: response.correctAnswers,
      totalQuestions: response.totalQuestions,
      xpEarned: response.xpEarned,
      mlCoinsEarned: response.mlCoinsEarned,
      explanations: response.feedback.explanations,
    });
    setShowFeedback(true);
    onComplete?.(response);
  },
  onError: (error) => {
    console.error('Submission error:', error);
    alert('Error al enviar respuestas: ' + error);
  }
});
```

#### 3. Reemplazar mock submission con API real
```tsx
// ANTES (mock):
const handleSubmit = async () => {
  const mockScore = calculateScore();
  setFeedback({ score: mockScore, ... });
};

// DESPUÉS (API real):
const handleSubmit = async () => {
  if (!exerciseId) return;

  await submitAnswers(exerciseId, {
    // Estructura específica del ejercicio
    selectedArticleId,
    claims,
    results,
  });
};
```

### Ejemplo Específico: VerificadorFakeNews

```tsx
// En VerificadorFakeNewsExercise.tsx

import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const VerificadorFakeNewsExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
  onProgressUpdate,
  initialData,
  exercise,
}) => {
  // ... existing state ...

  // ADD: Submission hook
  const { submissionState, submitAnswers } = useExerciseSubmission({
    onSuccess: (response) => {
      setFeedback({
        score: response.score,
        correct: response.correctAnswers,
        total: response.totalQuestions,
        xpEarned: response.xpEarned,
        mlCoinsEarned: response.mlCoinsEarned,
        bonuses: response.bonuses,
        feedback: response.feedback,
      });
      setShowFeedback(true);
      onComplete?.(response);
    },
    onError: (error) => {
      alert('Error al enviar: ' + error);
    }
  });

  // MODIFY: Submit handler
  const handleSubmit = async () => {
    if (!exerciseId) return;

    await submitAnswers(exerciseId, {
      selectedArticleId,
      claims,
      verificationResults: results,
    }, 0); // hintsUsed
  };

  // En el JSX, agregar loading state
  return (
    <>
      {/* ... existing UI ... */}

      <button
        onClick={handleSubmit}
        disabled={submissionState.loading || results.length === 0}
        className="..."
      >
        {submissionState.loading ? 'Enviando...' : 'Enviar Verificación'}
      </button>

      {submissionState.error && (
        <div className="error">
          {submissionState.error}
        </div>
      )}
    </>
  );
};
```

### Ejercicios a Actualizar (Módulo 4)

1. **VerificadorFakeNews** - Patrón mostrado arriba
2. **QuizTikTok** - Similar, enviar `selectedOptions` y `swipeHistory`
3. **NavegacionHipertextual** - Enviar `navigationPath` y `documentsVisited`
4. **AnalisisMemes** - Enviar `annotations` y `analysisText`
5. **InfografiaInteractiva** - Enviar `interactedElements` y `answers`

## Cómo Conectar Ejercicios Módulo 5 a API Real

Los ejercicios del módulo 5 requieren upload de multimedia:

### Patrón General

#### 1. Importar componentes necesarios
```tsx
import { MediaUploader } from '@/shared/components/mechanics/MediaUploader';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MediaAttachmentResponse } from '@/shared/api/mediaApi';
```

#### 2. State para media attachments
```tsx
const [uploadedMedia, setUploadedMedia] = useState<MediaAttachmentResponse[]>([]);
```

#### 3. Usar MediaUploader en UI
```tsx
<MediaUploader
  acceptedTypes={['image', 'audio']} // o ['video']
  maxFiles={5}
  exerciseId={exerciseId}
  onUpload={(media) => {
    setUploadedMedia(media);
  }}
  onError={(error) => {
    console.error('Upload error:', error);
  }}
/>
```

#### 4. Incluir media IDs en submission
```tsx
const handleSubmit = async () => {
  await submitAnswers(exerciseId, {
    textContent: diaryContent,
    mediaIds: uploadedMedia.map(m => m.id),
    // ... otros datos específicos
  });
};
```

### Ejemplo Específico: DiarioMultimedia

```tsx
import React, { useState } from 'react';
import { MediaUploader } from '@/shared/components/mechanics/MediaUploader';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';
import { MediaAttachmentResponse } from '@/shared/api/mediaApi';

export const DiarioMultimediaExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
}) => {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [currentTitle, setCurrentTitle] = useState('');
  const [currentContent, setCurrentContent] = useState('');
  const [uploadedMedia, setUploadedMedia] = useState<MediaAttachmentResponse[]>([]);

  const { submissionState, submitAnswers } = useExerciseSubmission({
    onSuccess: (response) => {
      alert(`Diario guardado! Puntaje: ${response.score}`);
      onComplete?.(response);
    }
  });

  const handleSaveEntry = async () => {
    if (!currentTitle || !currentContent) return;

    const newEntry: DiaryEntry = {
      id: Date.now().toString(),
      date: new Date(),
      title: currentTitle,
      content: currentContent,
      mediaIds: uploadedMedia.map(m => m.id),
    };

    const updatedEntries = [newEntry, ...entries];
    setEntries(updatedEntries);

    // Clear form
    setCurrentTitle('');
    setCurrentContent('');
    setUploadedMedia([]);
  };

  const handleSubmitDiary = async () => {
    if (!exerciseId) return;

    await submitAnswers(exerciseId, {
      entries: entries.map(e => ({
        title: e.title,
        content: e.content,
        mediaIds: e.mediaIds,
        date: e.date,
      }))
    });
  };

  return (
    <div>
      {/* Entry Form */}
      <input
        value={currentTitle}
        onChange={(e) => setCurrentTitle(e.target.value)}
        placeholder="Título"
      />

      <textarea
        value={currentContent}
        onChange={(e) => setCurrentContent(e.target.value)}
        placeholder="Contenido"
      />

      {/* Media Upload */}
      <MediaUploader
        acceptedTypes={['image', 'audio']}
        maxFiles={3}
        exerciseId={exerciseId}
        onUpload={setUploadedMedia}
        onError={(err) => alert(err)}
      />

      <button onClick={handleSaveEntry}>
        Guardar Entrada
      </button>

      {/* Submit All */}
      <button
        onClick={handleSubmitDiary}
        disabled={submissionState.loading || entries.length === 0}
      >
        {submissionState.loading ? 'Enviando...' : 'Enviar Diario'}
      </button>
    </div>
  );
};
```

### Ejemplo Específico: VideoCarta

```tsx
import { useVideoRecorder } from '@/shared/hooks/useVideoRecorder';
import { mediaApi } from '@/shared/api/mediaApi';
import { useExerciseSubmission } from '@/features/mechanics/shared/hooks/useExerciseSubmission';

export const VideoCartaExercise: React.FC<ExerciseProps> = ({
  exerciseId,
  onComplete,
}) => {
  const [videoId, setVideoId] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const {
    videoBlob,
    videoUrl,
    previewUrl,
    startRecording,
    stopRecording,
    isRecording,
    resetRecording,
  } = useVideoRecorder();

  const { submissionState, submitAnswers } = useExerciseSubmission({
    onSuccess: (response) => {
      alert(`Video enviado! Puntaje: ${response.score}`);
      onComplete?.(response);
    }
  });

  const handleUploadVideo = async () => {
    if (!videoBlob) return;

    try {
      // Create File from Blob
      const file = new File([videoBlob], 'video-carta.webm', {
        type: 'video/webm'
      });

      // Upload
      const response = await mediaApi.uploadMedia(file, {
        type: 'video',
        exerciseId: exerciseId,
        onProgress: setUploadProgress
      });

      setVideoId(response.id);
      alert('Video subido exitosamente!');
    } catch (error) {
      alert('Error al subir video: ' + error);
    }
  };

  const handleSubmit = async () => {
    if (!exerciseId || !videoId) return;

    await submitAnswers(exerciseId, {
      videoId: videoId,
      duration: Math.floor(videoBlob?.size || 0 / 1000), // estimate
    });
  };

  return (
    <div>
      {/* Preview */}
      {previewUrl && isRecording && (
        <video src={previewUrl} autoPlay muted />
      )}

      {/* Playback */}
      {videoUrl && !isRecording && (
        <video src={videoUrl} controls />
      )}

      {/* Controls */}
      {!isRecording && !videoUrl && (
        <button onClick={() => startRecording({ width: 1280, height: 720 })}>
          Iniciar Grabación
        </button>
      )}

      {isRecording && (
        <button onClick={stopRecording}>
          Detener Grabación
        </button>
      )}

      {videoUrl && !videoId && (
        <button onClick={handleUploadVideo}>
          Subir Video ({uploadProgress}%)
        </button>
      )}

      {videoUrl && (
        <button onClick={resetRecording}>
          Grabar Nuevo Video
        </button>
      )}

      {videoId && (
        <button
          onClick={handleSubmit}
          disabled={submissionState.loading}
        >
          {submissionState.loading ? 'Enviando...' : 'Enviar Video Carta'}
        </button>
      )}
    </div>
  );
};
```

### Ejercicios a Actualizar (Módulo 5)

1. **DiarioMultimedia** - Texto + audio/imágenes (patrón mostrado arriba)
2. **ComicDigital** - Imágenes + texto en viñetas
3. **VideoCarta** - Video grabado (patrón mostrado arriba)

## Integración de Notificaciones

Para notificar cuando se completa una revisión:

### 1. En el componente ReviewDetail

```tsx
// Ya implementado en ReviewDetail.tsx
const handleCompleteReview = async () => {
  await manualReviewApi.completeReview(review.id, {
    evaluations,
    generalFeedback,
    notifyStudent: true, // ← Activa notificación
  });
};
```

### 2. El backend enviará notificación automáticamente

El `ManualReviewService` del backend ya maneja:
- Crear notificación para el estudiante
- Actualizar el score en la submission
- Marcar la revisión como completada

### 3. Para mostrar notificaciones en el frontend

Si existe un sistema de notificaciones toast:

```tsx
import { useToast } from '@/shared/hooks/useToast'; // si existe

const { showToast } = useToast();

// En onSuccess del submission
onSuccess: (response) => {
  showToast({
    type: 'success',
    title: 'Ejercicio enviado',
    message: `Has obtenido ${response.score} puntos!`
  });
}
```

Si no existe, crear un componente Toast básico o usar el componente Toast existente en:
`/apps/frontend/src/shared/components/base/Toast.tsx`

## Configuración de API Endpoints

Los endpoints ya están configurados en `/apps/frontend/src/config/api.config.ts`:

```typescript
teacher: {
  reviews: {
    pending: '/teacher/reviews/pending',
    get: (id: string) => `/teacher/reviews/${id}`,
    start: (submissionId: string) => `/teacher/reviews/${submissionId}/start`,
    update: (id: string) => `/teacher/reviews/${id}`,
    complete: (id: string) => `/teacher/reviews/${id}/complete`,
  },
},

media: {
  upload: '/educational/media/upload',
  get: (id: string) => `/educational/media/${id}`,
  delete: (id: string) => `/educational/media/${id}`,
  validate: '/educational/media/validate',
},
```

## Testing

### Probar MediaUploader
```tsx
// En un componente de prueba
<MediaUploader
  acceptedTypes={['image']}
  maxSize={5 * 1024 * 1024}
  maxFiles={3}
  onUpload={(media) => console.log(media)}
  onError={(err) => console.error(err)}
/>
```

### Probar useVideoRecorder
```tsx
const TestVideo = () => {
  const { videoUrl, startRecording, stopRecording } = useVideoRecorder();

  return (
    <div>
      <button onClick={startRecording}>Record</button>
      <button onClick={stopRecording}>Stop</button>
      {videoUrl && <video src={videoUrl} controls />}
    </div>
  );
};
```

## Próximos Pasos

1. **Actualizar cada ejercicio individualmente** siguiendo los patrones mostrados
2. **Probar upload de media** con archivos reales
3. **Probar flujo completo de revisión** desde teacher panel
4. **Agregar validaciones adicionales** según necesidades específicas
5. **Implementar sistema de notificaciones** más robusto si es necesario

## Notas Importantes

- Todos los archivos creados usan TypeScript estricto
- Se sigue el patrón de estilos detective theme existente
- Los componentes son reutilizables y están bien documentados
- El manejo de errores es completo con mensajes user-friendly
- No se crearon archivos de test (como se solicitó)
