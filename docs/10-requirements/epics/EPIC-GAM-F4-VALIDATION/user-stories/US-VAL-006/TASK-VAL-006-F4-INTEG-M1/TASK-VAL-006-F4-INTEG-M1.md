# TASK-VAL-006-F4-INTEG-M1: Submit 7 tipos M1 (literal)

**US:** US-VAL-006 | **Tipo:** Integration | **Estado:** Pendiente | **SP:** 4

## Descripcion
Enviar submissions para los 7 tipos de ejercicios del nivel M1 (literal).

## Acciones
1. Login como student con JWT
2. GET /api/v1/exercises?level=M1 — obtener ejercicios disponibles
3. Para cada tipo: POST /api/v1/submissions con respuesta correcta
4. Verificar grading automatico (score)
5. Verificar XP otorgado en user_stats
6. Verificar submission record en DB

## Tipos M1 (7)
multiple-choice, true-false, fill-blank, matching, ordering, word-search, identification

## Criterio Pass
- 7/7 tipos submiteados exitosamente
- Auto-grading funciona
- XP acreditado en user_stats
