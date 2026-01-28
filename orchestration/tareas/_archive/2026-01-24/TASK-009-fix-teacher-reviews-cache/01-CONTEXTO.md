# TASK-009: Fix Cache Invalidation en Teacher Reviews

## Contexto

**Fecha:** 2026-01-25
**Agente:** CLAUDE-CODE
**Modo:** @QUICK

---

## Problema Reportado

Después de calificar un ejercicio como teacher, el review completado no aparece en la pestaña "Completadas". El usuario debe refrescar manualmente la página para ver el review en la pestaña correcta.

## Causa Raíz Identificada

En `ReviewDetail.tsx:231`, se llama directamente a `manualReviewApi.completeReview()` en lugar de usar el hook `useCompleteReview()`.

El hook `useCompleteReview` (definido en `useManualReviews.ts:263-275`) tiene la lógica de invalidar la cache de React Query en su callback `onSuccess`:

```typescript
onSuccess: (_, variables) => {
  // Invalidate all manual review queries
  queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });
  // Remove the specific review from cache as it's no longer pending
  queryClient.removeQueries({ queryKey: manualReviewKeys.detail(variables.reviewId) });
},
```

Al llamar directamente a la API, esta lógica de invalidación no se ejecuta, dejando la cache desactualizada.

## Flujo Actual (Buggy)

```
1. Teacher califica ejercicio
2. ReviewDetail.handleCompleteReview() llama a:
   - manualReviewApi.updateReview() -> guarda evaluación
   - manualReviewApi.completeReview() -> marca completed en BD
3. Modal de éxito se muestra
4. Teacher cierra modal -> onClose() -> vuelve a lista
5. Lista muestra datos CACHEADOS (sin invalidar)
6. Review NO aparece en "Completadas" porque cache tiene status viejo
```

## Flujo Esperado

```
1. Teacher califica ejercicio
2. ReviewDetail.handleCompleteReview() llama a:
   - manualReviewApi.updateReview()
   - manualReviewApi.completeReview()
   - queryClient.invalidateQueries() <-- FALTA ESTO
3. Modal de éxito se muestra
4. Teacher cierra modal -> vuelve a lista
5. Lista refetch automático por cache invalida
6. Review APARECE en "Completadas"
```

## Archivos Involucrados

| Archivo | Rol |
|---------|-----|
| `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx` | Componente con el bug |
| `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts` | Hook con lógica correcta de invalidación |

## Solución Propuesta

Agregar invalidación manual de cache en `ReviewDetail.tsx` después de llamar a `completeReview`:

1. Importar `useQueryClient` de `@tanstack/react-query`
2. Importar `manualReviewKeys` de `../../hooks/useManualReviews`
3. Agregar `const queryClient = useQueryClient();` al componente
4. Después de `completeReview` exitoso, agregar `queryClient.invalidateQueries({ queryKey: manualReviewKeys.all });`

---

*Documentado según SIMCO v4.3.0*
