# TASK-009: Documentación

## Resumen Ejecutivo

| Campo | Valor |
|-------|-------|
| ID | TASK-009 |
| Título | Fix cache invalidation en Teacher Reviews |
| Tipo | bugfix |
| Prioridad | P1 |
| Estado | Completada |
| Duración | 15 minutos |
| Story Points | 2 |

---

## Problema Resuelto

**Bug:** Después de calificar un ejercicio en el portal teacher, el review completado no aparecía en la pestaña "Completadas" hasta refrescar la página manualmente.

**Causa:** Falta de invalidación de cache de React Query después de completar un review.

**Impacto:** UX degradada - teachers no veían feedback visual inmediato de su acción.

---

## Solución Implementada

Se agregó invalidación explícita de cache usando `queryClient.invalidateQueries()` con las query keys de manual reviews.

**Cambios (8 líneas):**
1. Import de `useQueryClient` de React Query
2. Import de `manualReviewKeys` del hook existente
3. Instancia de `queryClient` en el componente
4. Llamada a `invalidateQueries` después de `completeReview` exitoso

---

## Comportamiento Esperado (Post-Fix)

1. Teacher califica un ejercicio
2. Sistema guarda la evaluación y marca como completed
3. **Cache de React Query se invalida automáticamente**
4. Modal de éxito se muestra
5. Al cerrar modal y volver a la lista, se hace refetch automático
6. Review aparece correctamente en pestaña "Completadas"

---

## Archivos Modificados

| Archivo | Líneas |
|---------|--------|
| `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx` | +8 |

---

## Verificación de Calidad

| Check | Estado |
|-------|--------|
| Build pasa | ✅ |
| Lint sin errores nuevos | ✅ |
| Commit en submodule | ✅ f63bafc5 |
| Commit en workspace | ✅ 71094d55 |
| Push a remotes | ✅ |
| Documentación SIMCO | ✅ |

---

## Pruebas Recomendadas

### Test Manual

1. Login como teacher
2. Ir a `/teacher/reviews`
3. Abrir un review pendiente
4. Calificar todos los criterios de la rúbrica
5. Click en "Calificar Respuesta"
6. Confirmar en el modal
7. Cerrar modal de éxito
8. **Verificar:** Review aparece en pestaña "Completadas"

### Test de Regresión

- "Guardar Borrador" sigue funcionando
- Reviews guardados como borrador aparecen en "En Progreso"
- Lista se refresca al cambiar de pestaña

---

## Lecciones Aprendidas

1. **React Query Cache:** Cuando se usa React Query, SIEMPRE invalidar cache después de mutaciones que afectan datos listados en otras vistas.

2. **Hooks vs API directa:** Preferir usar hooks de React Query (`useMutation`) en lugar de llamar APIs directamente, ya que los hooks encapsulan la lógica de invalidación.

3. **Debugging UX:** Bugs de cache son difíciles de detectar porque el estado "funciona" en BD pero no en UI.

---

## Referencias

- `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts` - Hook con patrón correcto
- [React Query - Invalidation](https://tanstack.com/query/latest/docs/framework/react/guides/query-invalidation)

---

*Documentado según SIMCO v4.3.0*
*Completado: 2026-01-25*
