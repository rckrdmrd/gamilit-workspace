# ExerciseContentRenderer - Guía de Integración

## Descripción

El componente `ExerciseContentRenderer` reemplaza las vistas JSON crudas de respuestas de ejercicios con una presentación visual y amigable para profesores.

## Ubicación

```
apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx
```

## Uso Básico

```tsx
import ExerciseContentRenderer from '@/shared/components/mechanics/ExerciseContentRenderer';

// Renderizar solo respuesta del estudiante
<ExerciseContentRenderer
  exerciseType="podcast_argumentativo"
  answerData={student.answerData}
/>

// Renderizar con comparación de respuesta correcta
<ExerciseContentRenderer
  exerciseType="verdadero_falso"
  answerData={student.answerData}
  correctAnswer={exercise.correctAnswer}
  showComparison={true}
/>
```

## Integración en ResponseDetailModal.tsx

**Ubicación:** `apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx`

**Cambio requerido en líneas 105-138:**

```tsx
// ❌ ANTES (JSON crudo)
const AnswerComparison: React.FC<{
  studentAnswer: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
}> = ({ studentAnswer, correctAnswer }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Respuesta del Estudiante */}
      <div className="rounded-xl border-2 border-orange-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-gray-800">Respuesta del Estudiante</h4>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
            {JSON.stringify(studentAnswer, null, 2)}
          </pre>
        </div>
      </div>

      {/* Respuesta Correcta */}
      <div className="rounded-xl border-2 border-green-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-bold text-gray-800">Respuesta Correcta</h4>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <pre className="overflow-x-auto whitespace-pre-wrap font-mono text-sm text-gray-800">
            {JSON.stringify(correctAnswer, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};
```

```tsx
// ✅ DESPUÉS (Contenido visual)
import ExerciseContentRenderer from '@/shared/components/mechanics/ExerciseContentRenderer';

const AnswerComparison: React.FC<{
  studentAnswer: Record<string, unknown>;
  correctAnswer: Record<string, unknown>;
  exerciseType: string; // ← Agregar este prop
}> = ({ studentAnswer, correctAnswer, exerciseType }) => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {/* Respuesta del Estudiante */}
      <div className="rounded-xl border-2 border-orange-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <User className="h-5 w-5 text-orange-600" />
          <h4 className="font-bold text-gray-800">Respuesta del Estudiante</h4>
        </div>
        <div className="rounded-lg bg-orange-50 p-4">
          <ExerciseContentRenderer
            exerciseType={exerciseType}
            answerData={studentAnswer}
            showComparison={false}
          />
        </div>
      </div>

      {/* Respuesta Correcta */}
      <div className="rounded-xl border-2 border-green-200 bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <CheckCircle className="h-5 w-5 text-green-600" />
          <h4 className="font-bold text-gray-800">Respuesta Correcta</h4>
        </div>
        <div className="rounded-lg bg-green-50 p-4">
          <ExerciseContentRenderer
            exerciseType={exerciseType}
            answerData={correctAnswer}
            showComparison={false}
          />
        </div>
      </div>
    </div>
  );
};
```

**Actualizar el llamado en línea 343:**

```tsx
// ❌ ANTES
<AnswerComparison
  studentAnswer={attempt.submitted_answers}
  correctAnswer={attempt.correct_answer}
/>

// ✅ DESPUÉS
<AnswerComparison
  studentAnswer={attempt.submitted_answers}
  correctAnswer={attempt.correct_answer}
  exerciseType={attempt.exercise_type} // ← Pasar exercise_type
/>
```

## Integración en ReviewDetail.tsx

**Ubicación:** `apps/frontend/src/apps/teacher/pages/ReviewPanel/ReviewDetail.tsx`

**Cambio requerido en líneas 193-199:**

```tsx
// ❌ ANTES
<div className="mb-6 rounded-detective bg-gray-50 p-4">
  <h4 className="mb-2 font-medium text-gray-700">Respuestas</h4>
  <pre className="whitespace-pre-wrap text-sm text-gray-800">
    {JSON.stringify(review.submission?.answers, null, 2)}
  </pre>
</div>

// ✅ DESPUÉS
import ExerciseContentRenderer from '@/shared/components/mechanics/ExerciseContentRenderer';

<div className="mb-6 rounded-detective bg-gray-50 p-4">
  <h4 className="mb-2 font-medium text-gray-700">Respuestas</h4>
  <ExerciseContentRenderer
    exerciseType={review.exercise?.type || 'unknown'}
    answerData={review.submission?.answers || {}}
    showComparison={false}
  />
</div>
```

## Tipos de Ejercicio Soportados

### Módulo 1: Comprensión Literal
- `verdadero_falso` - Iconos ✓/✗ visuales
- `completar_espacios` - Blanks resaltados con comparación
- `crucigrama` - Grid de palabras
- `sopa_letras` - Tags de palabras encontradas
- `mapa_conceptual` - Conexiones visuales
- `timeline` - Eventos numerados

### Módulo 2: Comprensión Inferencial
- `lectura_inferencial`
- `prediccion_narrativa`
- `puzzle_contexto`
- `detective_textual`
- `rueda_inferencias`
- `causa_efecto`

**Renderizado:** Opción múltiple con comparación verde/rojo

### Módulo 3: Pensamiento Crítico
- `analisis_fuentes`
- `debate_digital`
- `matriz_perspectivas`
- `tribunal_opiniones`
- `podcast_argumentativo` - Tema + Guión + Audio player

**Renderizado:** Texto formateado con campos separados

### Módulos 4 y 5: Creativos/Multimedia
- `verificador_fake_news`
- `quiz_tiktok`
- `analisis_memes`
- `infografia_interactiva`
- `navegacion_hipertextual`
- `diario_multimedia`
- `comic_digital`
- `video_carta`

**Renderizado:** Detección automática de imágenes, videos, audio y renderizado inline

## Ejemplo con Comparación de Respuestas

Para ejercicios autocorregibles (Módulo 1 y 2), se puede mostrar comparación lado a lado:

```tsx
<ExerciseContentRenderer
  exerciseType="verdadero_falso"
  answerData={{
    q1: true,
    q2: false,
    q3: true
  }}
  correctAnswer={{
    q1: true,
    q2: true,   // ← Error del estudiante
    q3: true
  }}
  showComparison={true}
/>
```

**Resultado visual:**
- ✅ Verde: Respuesta correcta
- ❌ Rojo: Respuesta incorrecta (muestra respuesta correcta al lado)

## Fallback para Tipos Desconocidos

Si el `exerciseType` no está mapeado, el componente renderiza JSON formateado automáticamente:

```tsx
<ExerciseContentRenderer
  exerciseType="nuevo_tipo_ejercicio"
  answerData={{ foo: 'bar' }}
/>
// Renderiza:
// {
//   "foo": "bar"
// }
```

## Ventajas

1. **UX mejorada para profesores** - Ver contenido visual en lugar de JSON
2. **Detección de multimedia** - Imágenes, videos, audio se muestran inline
3. **Comparación visual** - Verde/rojo para respuestas correctas/incorrectas
4. **Fallback robusto** - JSON formateado si el tipo no es reconocido
5. **Tipo-safe** - TypeScript garantiza tipos correctos
6. **Sin dependencias nuevas** - Solo usa Lucide icons ya en el proyecto

## Testing

Para validar el componente:

```bash
cd apps/frontend
npm run build  # ✅ PASA
npm run lint   # ✅ PASA (sin warnings en ExerciseContentRenderer)
```

## Próximos Pasos (Opcional)

Una vez integrado en ResponseDetailModal y ReviewDetail, considerar:

1. Agregar soporte para más tipos de ejercicio según se agreguen
2. Mejorar detección de URLs multimedia (detectar hosted URLs además de extensiones)
3. Agregar "Ver JSON crudo" como toggle opcional para debugging
4. Agregar tests unitarios para cada sub-renderer

## Contacto

Para dudas sobre la integración, consultar:
- Archivo: `apps/frontend/src/shared/components/mechanics/ExerciseContentRenderer.tsx`
- Documentación Frontend: `docs/95-guias-desarrollo/frontend/`
