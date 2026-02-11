# TASK-VAL-006-F4-INTEG-M3: Submit 5 tipos M3 (critico)

**US:** US-VAL-006 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 4

## Descripcion
Enviar submissions para los 5 tipos de ejercicios del nivel M3 (critico), verificar que se flaggean para teacher-review.

## Acciones
1. Login como student
2. GET /api/v1/exercises?level=M3
3. Para cada tipo: POST /api/v1/submissions
4. Verificar submission marcado como "pending_review"
5. Login como teacher → verificar submission aparece en review queue

## Tipos M3 (5)
essay, debate, analysis, evaluation, creative-writing

## Criterio Pass
- 5/5 tipos submiteados
- Todos marcados como pending_review
- Teacher ve submissions en review queue
