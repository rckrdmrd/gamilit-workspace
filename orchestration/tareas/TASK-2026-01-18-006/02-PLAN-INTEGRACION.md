# Plan de Integración y Corrección

**Tarea:** TASK-2026-01-18-004
**Módulo:** Teacher/Responses
**Fecha:** 2026-01-18

---

## FASE 1: CORRECCIONES CRÍTICAS (Bloquean Uso)

### 1.1 Fix AnimatePresence en ResponsesTable.tsx

**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`
**Líneas:** 376-410

**Cambio Requerido:**

```diff
// Líneas 382-401
<tbody>
- <AnimatePresence mode="wait">
-   {loading ? (
-     <>
-       {[1, 2, 3, 4, 5].map((i) => (
-         <SkeletonRow key={i} />
-       ))}
-     </>
-   ) : data.length === 0 ? (
-     <EmptyState />
-   ) : (
-     data.map((attempt, index) => (
-       <TableRow
-         key={attempt.id}
-         attempt={attempt}
-         index={index}
-         onView={onViewDetail}
-       />
-     ))
-   )}
- </AnimatePresence>
+ {loading ? (
+   [1, 2, 3, 4, 5].map((i) => <SkeletonRow key={`skeleton-${i}`} />)
+ ) : data.length === 0 ? (
+   <EmptyState />
+ ) : (
+   data.map((attempt, index) => (
+     <TableRow
+       key={attempt.id}
+       attempt={attempt}
+       index={index}
+       onView={onViewDetail}
+     />
+   ))
+ )}
</tbody>
```

**Justificación:**
- `AnimatePresence mode="wait"` requiere UN solo hijo con key única
- Para animaciones de tabla, es mejor animar las filas individuales
- El componente TableRow ya tiene `motion.tr` con animaciones

**Validación:**
```bash
cd apps/frontend && npm run build && npm run lint
```

---

### 1.2 Fix WebSocket Cleanup (Menor Prioridad)

**Archivo:** `apps/frontend/src/features/notifications/hooks/useWebSocket.ts`
**Líneas:** 300-313

**Cambio Requerido:**

```diff
useEffect(() => {
+ let isMounted = true;
  const token = getAuthToken();

- if (user?.id && token) {
-   connect();
- } else {
+ if (user?.id && token && isMounted) {
+   // Delay para evitar race condition en StrictMode
+   const timeoutId = setTimeout(() => {
+     if (isMounted) connect();
+   }, 100);
+   return () => {
+     isMounted = false;
+     clearTimeout(timeoutId);
+     disconnect();
+   };
+ } else {
    console.log('⚠️ Skipping WebSocket connection: User not authenticated or token missing');
  }

  return () => {
+   isMounted = false;
    disconnect();
  };
-   // eslint-disable-next-line react-hooks/exhaustive-deps
- }, [user?.id]);
+ }, [user?.id, connect, disconnect]);
```

**Justificación:**
- React 18 StrictMode causa double-mount que cierra WebSocket prematuramente
- El flag `isMounted` previene operaciones después del cleanup
- El timeout da tiempo al cleanup de StrictMode

---

## FASE 2: FUNCIONALIDAD CORE

### 2.1 Agregar Campo needsManualReview

**Backend DTO:** `apps/backend/src/modules/teacher/dto/exercise-responses.dto.ts`

```typescript
// Agregar al AttemptResponseDto
@ApiProperty({ description: 'Indica si requiere revisión manual' })
requires_manual_review: boolean;
```

**Backend Service:** `apps/backend/src/modules/teacher/services/exercise-responses.service.ts`

```typescript
// En mapToAttemptResponse(), agregar:
const MANUAL_REVIEW_TYPES = [
  'tribunal_opiniones',
  'podcast_argumentativo',
  'debate_digital',
  'analisis_fuentes',
  'matriz_perspectivas',
  'video_carta',
  'comic_digital',
  'diario_multimedia',
  'collage_prensa',
  'call_to_action',
  'texto_en_movimiento',
];

return {
  ...existingFields,
  requires_manual_review: MANUAL_REVIEW_TYPES.includes(attempt.exercise.exercise_type),
};
```

**Frontend Interface:** `apps/frontend/src/services/api/teacher/exerciseResponsesApi.ts`

```typescript
export interface AttemptResponse {
  // ... campos existentes ...
  requires_manual_review: boolean;
}
```

---

### 2.2 Agregar Columna Estado a Tabla

**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponsesTable.tsx`

**En TableHeader (agregar después de Correcto):**
```tsx
<th className="px-4 py-3 text-center text-sm font-bold">Estado</th>
```

**En TableRow (agregar después de Correcto):**
```tsx
{/* Estado */}
<td className="px-4 py-3 text-center">
  {attempt.requires_manual_review && !attempt.is_correct ? (
    <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
      Pendiente
    </span>
  ) : attempt.is_correct ? (
    <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
      Calificado
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
      Incorrecto
    </span>
  )}
</td>
```

**Actualizar colSpan en EmptyState:** `colSpan={10}`

---

### 2.3 Agregar Filtro de Módulo

**Archivo:** `apps/frontend/src/apps/teacher/components/responses/ResponseFilters.tsx`

**Agregar al componente:**
```tsx
// Import adicional
import { useQuery } from '@tanstack/react-query';
import { modulesApi } from '@services/api/modules';

// En el componente, agregar query de módulos
const { data: modules } = useQuery({
  queryKey: ['modules'],
  queryFn: modulesApi.getModules,
});

// Agregar select de módulo
<div className="flex flex-col gap-1">
  <label className="text-xs font-medium text-gray-600">Módulo</label>
  <select
    value={filters.module_id || ''}
    onChange={(e) => onChange({ ...filters, module_id: e.target.value || undefined })}
    className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
  >
    <option value="">Todos los módulos</option>
    {modules?.map((mod) => (
      <option key={mod.id} value={mod.id}>{mod.name}</option>
    ))}
  </select>
</div>
```

---

### 2.4 Agregar Criterios de Evaluación al Modal

**Backend:** Crear endpoint `/teacher/attempts/:id/evaluation`

**Frontend:** Agregar sección en ResponseDetailModal.tsx

```tsx
// Después de la sección de Comparación de Respuestas
{attempt.evaluation_criteria && (
  <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
    <h3 className="mb-3 flex items-center gap-2 font-bold text-gray-800">
      <ClipboardCheck className="h-5 w-5 text-blue-600" />
      Criterios de Evaluación
    </h3>
    <div className="space-y-2">
      {attempt.evaluation_criteria.criteria.map((criterion, idx) => (
        <div key={idx} className="flex items-center justify-between rounded-lg bg-white p-3">
          <div>
            <p className="font-medium text-gray-800">{criterion.name}</p>
            <p className="text-xs text-gray-500">Peso: {criterion.weight}%</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{criterion.score}%</p>
            {criterion.feedback && (
              <p className="text-xs text-gray-500">{criterion.feedback}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  </div>
)}
```

---

## FASE 3: VALIDACIÓN

### 3.1 Checklist Pre-Implementación

- [ ] Backup de archivos a modificar
- [ ] Verificar que backend está corriendo
- [ ] Verificar datos de prueba en BD

### 3.2 Checklist Post-Implementación

- [ ] `npm run build` pasa en frontend
- [ ] `npm run lint` pasa en frontend
- [ ] `npm run test` pasa en backend
- [ ] Página carga sin errores en consola
- [ ] AnimatePresence warning eliminado
- [ ] Maximum update depth warning eliminado
- [ ] WebSocket se conecta sin errores
- [ ] Modal muestra respuesta correcta
- [ ] Filtros funcionan correctamente

### 3.3 Tests Manuales

1. **Navegación:** Ir a `/teacher/responses`
2. **Carga:** Verificar que tabla carga sin errores
3. **Paginación:** Cambiar página, verificar no hay errores
4. **Filtros:** Aplicar filtro por aula, verificar resultados
5. **Detalle:** Click en "Ver", verificar modal
6. **Comparación:** Verificar que muestra respuesta del estudiante vs correcta
7. **Multimedia:** Para ejercicios M3-M5, verificar reproductor de video/audio

---

## ORDEN DE EJECUCIÓN

```
1. [P0-1] Fix AnimatePresence → ResponsesTable.tsx
2. [P0-2] Verificar build + lint
3. [P0-3] Test manual básico
4. [P1-1] Agregar requires_manual_review (Backend)
5. [P1-2] Agregar requires_manual_review (Frontend)
6. [P1-3] Agregar columna Estado
7. [P1-4] Agregar filtro Módulo
8. [P2-1] Fix WebSocket (opcional)
9. [P2-2] Agregar criterios evaluación (si hay tiempo)
10. [DOCS] Actualizar documentación
```

---

## RIESGOS Y MITIGACIONES

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Backend no devuelve correct_answer | Media | Alto | Verificar con curl antes de implementar |
| Cambio en AnimatePresence rompe animaciones | Baja | Bajo | Probar en dev antes de commit |
| Filtro módulo sin endpoint | Media | Medio | Verificar API modules existe |

---

## NOTAS TÉCNICAS

### ExerciseContentRenderer
- Soporta 25+ tipos de ejercicios
- Tiene fallback a JSON formateado
- Ya maneja correctamente la comparación

### Tipos de Ejercicios con Revisión Manual
```typescript
const MANUAL_TYPES = [
  // M3
  'tribunal_opiniones', 'podcast_argumentativo', 'debate_digital',
  'analisis_fuentes', 'matriz_perspectivas',
  // M4
  'analisis_memes',
  // M5
  'video_carta', 'comic_digital', 'diario_multimedia',
  // Auxiliares
  'collage_prensa', 'call_to_action', 'texto_en_movimiento'
];
```

### Estructura correct_answer por Tipo
| Tipo | Estructura |
|------|-----------|
| verdadero_falso | `{ statements: { "1": true } }` |
| completar_espacios | `{ blanks: { "1": "respuesta" } }` |
| lectura_inferencial | `{ question_1: "A" }` |
| Manual (M3-M5) | `{}` (vacío, se evalúa manualmente) |
