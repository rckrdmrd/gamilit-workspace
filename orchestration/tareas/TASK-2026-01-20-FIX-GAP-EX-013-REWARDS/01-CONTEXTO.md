# Contexto de la Tarea: GAP-EX-013 Conexión de Recompensas Visuales

## Descripción del Problema
Se identificó el GAP-EX-013 durante la auditoría de ejercicios. El problema consistía en que aproximadamente el 85% de los ejercicios implementados no mostraban visualmente la recompensa obtenida (XP y Monedas) en el `FeedbackModal` al finalizar el ejercicio.

Aunque el backend calculaba y otorgaba las recompensas correctamente, el frontend no pasaba esta información al componente visual de feedback, resultando en una experiencia de usuario incompleta donde el estudiante no veía el fruto de su esfuerzo inmediato.

## Alcance
El problema afectaba a ejercicios en todos los módulos (M1 a M5).
Se requería una revisión y estandarización de la llamada a `setFeedback` en todos los componentes de ejercicios (`*Exercise.tsx`).

## Objetivos
1. **Estandarización**: Asegurar que todos los ejercicios extraigan el objeto `rewards` de la respuesta del backend (o lo calculen localmente si aplica) y lo pasen al `FeedbackModal`.
2. **Robustez**: Implementar valores por defecto (`|| 0`) para evitar errores si las recompensas no vienen definidas.
3. **Validación**: Verificar tipos de datos compatibles con `FeedbackData`.

## Componentes Relacionados
- `FeedbackModal.tsx`: Componente UI que recibe `xpEarned` y `mlCoinsEarned`.
- `useExerciseSubmission.ts`: Hook que maneja la respuesta del backend.
- Ejercicios individuales en `src/features/mechanics/`.
