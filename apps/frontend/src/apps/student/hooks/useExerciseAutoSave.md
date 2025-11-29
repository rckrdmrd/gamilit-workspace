# useExerciseAutoSave Hook

Hook de React para auto-guardar progreso de ejercicios y recuperarlo en caso de que el estudiante cierre el navegador.

## Características

- ✅ **Auto-save periódico**: Guarda automáticamente cada 30 segundos (configurable)
- ✅ **Recuperación automática**: Carga el progreso guardado al montar el componente
- ✅ **Debounce inteligente**: Evita llamadas excesivas al API con debounce de 2 segundos
- ✅ **Indicadores de estado**: Estados visuales (saving, saved, error)
- ✅ **Fallback a localStorage**: Si el API falla, usa localStorage como respaldo
- ✅ **TypeScript completo**: Tipado fuerte y seguro

## Uso Básico

```typescript
import { useExerciseAutoSave } from '@/apps/student/hooks';

function ExercisePage() {
  const {
    status,              // 'idle' | 'saving' | 'saved' | 'error'
    lastSavedAt,         // Date | null
    recoveredData,       // AutoSaveProgressData | null
    saveProgress,        // (data) => void
    clearRecoveredData,  // () => void
  } = useExerciseAutoSave({
    exerciseId: 'exercise-123',
    enabled: true,
    intervalMs: 30000,   // 30 segundos
    debounceMs: 2000,    // 2 segundos
  });

  // Recuperar progreso al montar
  useEffect(() => {
    if (recoveredData?.partialAnswers) {
      setAnswers(recoveredData.partialAnswers);
      setTimeSpent(recoveredData.timeSpentSeconds);
      clearRecoveredData();
    }
  }, [recoveredData]);

  // Auto-guardar cuando cambian las respuestas
  useEffect(() => {
    if (answers) {
      saveProgress({
        partialAnswers: answers,
        timeSpentSeconds: timeSpent,
        metadata: {
          hintsUsed,
          comodinesUsed,
        }
      });
    }
  }, [answers, timeSpent]);

  // Indicador visual
  return (
    <div>
      {status === 'saving' && <Spinner />}
      {status === 'saved' && <CheckIcon />}
      {/* ... ejercicio ... */}
    </div>
  );
}
```

## API

### Opciones (`UseExerciseAutoSaveOptions`)

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `exerciseId` | `string` | - | **Requerido.** ID del ejercicio |
| `enabled` | `boolean` | `true` | Habilitar/deshabilitar auto-save |
| `intervalMs` | `number` | `30000` | Intervalo de auto-save en ms |
| `debounceMs` | `number` | `2000` | Delay de debounce en ms |
| `onRecovered` | `(data) => void` | - | Callback cuando se recuperan datos |
| `onSaveSuccess` | `(savedAt) => void` | - | Callback en save exitoso |
| `onSaveError` | `(error) => void` | - | Callback en error |

### Retorno (`UseExerciseAutoSaveReturn`)

| Propiedad | Tipo | Descripción |
|-----------|------|-------------|
| `status` | `'idle' \| 'saving' \| 'saved' \| 'error'` | Estado actual del auto-save |
| `lastSavedAt` | `Date \| null` | Timestamp del último guardado exitoso |
| `recoveredData` | `AutoSaveProgressData \| null` | Datos recuperados de sesión anterior |
| `error` | `string \| null` | Mensaje de error si status === 'error' |
| `saveProgress` | `(data) => void` | Función para guardar (con debounce) |
| `clearRecoveredData` | `() => void` | Limpiar datos recuperados |
| `clearAutoSave` | `() => Promise<void>` | Borrar todos los datos guardados |
| `forceSave` | `(data) => Promise<void>` | Guardar inmediatamente (sin debounce) |

### Tipos de Datos

```typescript
interface AutoSaveProgressData {
  partialAnswers: unknown;
  timeSpentSeconds: number;
  metadata?: {
    hintsUsed?: number;
    comodinesUsed?: string[];
    lastQuestionIndex?: number;
    [key: string]: unknown;
  };
}
```

## Ejemplos de Uso

### Recuperación con Confirmación

```typescript
useEffect(() => {
  if (recoveredData?.partialAnswers) {
    const shouldRecover = window.confirm(
      '¿Deseas continuar donde lo dejaste?'
    );

    if (shouldRecover) {
      setAnswers(recoveredData.partialAnswers);
      clearRecoveredData();
    } else {
      clearAutoSave();
    }
  }
}, [recoveredData]);
```

### Guardar Solo Cambios Importantes

```typescript
useEffect(() => {
  // Solo guardar si hay respuestas válidas
  if (answers && Object.keys(answers).length > 0) {
    saveProgress({
      partialAnswers: answers,
      timeSpentSeconds: timeSpent,
    });
  }
}, [answers]);
```

### Indicador Visual Completo

```typescript
<div className="flex items-center gap-2">
  {status === 'saving' && (
    <>
      <Loader2 className="animate-spin" />
      <span>Guardando...</span>
    </>
  )}
  {status === 'saved' && (
    <>
      <Check className="text-green-500" />
      <span>Guardado {formatTime(lastSavedAt)}</span>
    </>
  )}
  {status === 'error' && (
    <>
      <AlertCircle className="text-red-500" />
      <span>Error al guardar (usando almacenamiento local)</span>
    </>
  )}
</div>
```

### Force Save al Salir

```typescript
useEffect(() => {
  const handleBeforeUnload = async (e: BeforeUnloadEvent) => {
    if (answers) {
      await forceSave({
        partialAnswers: answers,
        timeSpentSeconds: timeSpent,
      });
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);
  return () => window.removeEventListener('beforeunload', handleBeforeUnload);
}, [answers, forceSave]);
```

## Integración con Backend

El hook consume estos endpoints del backend:

- **POST** `/api/v1/progress/exercises/:exerciseId/autosave` - Guardar progreso
- **GET** `/api/v1/progress/exercises/:exerciseId/autosave` - Recuperar progreso
- **DELETE** `/api/v1/progress/exercises/:exerciseId/autosave` - Borrar progreso

### Request (POST)

```json
{
  "partialAnswers": { /* formato específico del ejercicio */ },
  "timeSpentSeconds": 120,
  "metadata": {
    "hintsUsed": 2,
    "comodinesUsed": ["pista", "vision_lectora"],
    "currentStep": 3
  }
}
```

### Response (GET)

```json
{
  "exerciseId": "exercise-123",
  "userId": "user-456",
  "data": {
    "partialAnswers": { /* ... */ },
    "timeSpentSeconds": 120,
    "metadata": { /* ... */ }
  },
  "savedAt": "2025-11-26T10:30:00Z"
}
```

## Notas de Implementación

1. **Debounce**: El hook usa debounce para evitar múltiples llamadas al API cuando el usuario escribe rápidamente.

2. **Fallback a localStorage**: Si el API falla, automáticamente usa `localStorage` como respaldo para no perder datos.

3. **Cleanup**: El hook limpia automáticamente los timers al desmontarse para evitar memory leaks.

4. **Mounted Check**: Usa `isMountedRef` para evitar actualizaciones de estado en componentes desmontados.

## Testing

```typescript
import { renderHook, waitFor } from '@testing-library/react';
import { useExerciseAutoSave } from './useExerciseAutoSave';

test('should auto-save progress', async () => {
  const { result } = renderHook(() =>
    useExerciseAutoSave({ exerciseId: 'test-123' })
  );

  result.current.saveProgress({
    partialAnswers: { q1: 'answer1' },
    timeSpentSeconds: 60,
  });

  await waitFor(() => {
    expect(result.current.status).toBe('saved');
  });
});
```

## Troubleshooting

### El auto-save no funciona

- Verificar que `enabled={true}`
- Verificar que `exerciseId` no esté vacío
- Revisar la consola del navegador para errores

### Los datos no se recuperan

- Verificar que el componente se monta DESPUÉS de que `recoveredData` está disponible
- Asegurarse de llamar `clearRecoveredData()` después de usar los datos

### Múltiples guardados simultáneos

- Ajustar `debounceMs` a un valor más alto (ej: 3000)
- Considerar usar `forceSave()` solo cuando sea necesario

## Changelog

- **2025-11-26**: Versión inicial del hook
- Implementación completa de auto-save con debounce
- Soporte para recuperación de progreso
- Fallback a localStorage en caso de error de API
