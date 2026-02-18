Mapea el flujo completo de submit para TODOS los ejercicios en los 5 modulos educativos de gamilit.

ESTRUCTURA:
- apps/frontend/src/features/mechanics/module1/ hasta module5/ - cada subdirectorio es un tipo de ejercicio
- apps/frontend/src/apps/student/pages/ExercisePage.tsx - orquestador comun de todos los ejercicios
- apps/backend/src/modules/educational/services/ - evaluacion backend

MODULOS 1-2: Evaluacion automatica (backend calcula score)
MODULOS 3-5: Evaluacion por maestro (revision manual)

TAREAS:
1. Lista TODOS los subdirectorios de module1/ a module5/ en features/mechanics/
2. Lee ExercisePage.tsx COMPLETO - identifica handleSubmit y el flujo post-submit
3. Lee apps/backend/src/modules/educational/services/ - busca exercise-attempts.service.ts
4. Identifica que endpoints se llaman POST-SUBMIT: rank-progress, achievements, missions, leaderboard, XP
5. Para cada endpoint post-submit identifica si puede tener errores FK/CHECK similares
6. Documenta diferencias entre flujo automatico (mod 1-2) vs manual (mod 3-5)

SALIDA: Mapa de ejercicios, flujo de submit, endpoints post-submit con riesgo de error, diferencias auto vs manual.
