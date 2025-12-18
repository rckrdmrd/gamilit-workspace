# Corrección: requires_manual_grading para Ejercicios Módulo 3

**Fecha:** 2025-11-29
**Estado:** ✅ Implementado
**Prioridad:** Alta
**Afecta:** Módulo 3 - Comprensión Crítica

---

## 📋 Resumen del Problema

Los 5 ejercicios del Módulo 3 no podían enviarse correctamente al backend. El frontend enviaba a `/progress/submissions/submit`, pero el backend rechazaba la petición con el error:

```
This exercise is auto-graded and allows multiple attempts.
It should not use the submission service.
```

**Causa raíz:** La columna `requires_manual_grading` tiene DEFAULT `false` en la tabla `educational_content.exercises`. Los ejercicios del Módulo 3 no tenían este campo configurado explícitamente, por lo que el `ExerciseSubmissionService` los rechazaba.

---

## 🔧 Solución Implementada

### Archivo Modificado

`apps/database/seeds/prod/educational_content/04-exercises-module3.sql`

### Cambios Realizados

1. **Agregado columna `requires_manual_grading` a todos los INSERT statements**
   - Añadido a la lista de columnas de cada ejercicio
   - Configurado valor `true` para los 5 ejercicios

2. **Actualizado ON CONFLICT clauses**
   - Añadido `requires_manual_grading = EXCLUDED.requires_manual_grading` para que la actualización también aplique el nuevo valor

### Ejercicios Afectados

| Ejercicio | Tipo | requires_manual_grading |
|-----------|------|------------------------|
| 3.1 Análisis de Fuentes | `analisis_fuentes` | `true` |
| 3.2 Debate Digital | `debate_digital` | `true` |
| 3.3 Tribunal de Opiniones | `tribunal_opiniones` | `true` |
| 3.4 Podcast Argumentativo | `podcast_argumentativo` | `true` |
| 3.5 Matriz de Perspectivas | `matriz_perspectivas` | `true` |

---

## 📚 Contexto Arquitectónico

### Flujo de Envío de Ejercicios

El backend tiene dos servicios para ejercicios:

1. **ExerciseSubmissionService** (`/progress/submissions/submit`)
   - Para ejercicios con `requires_manual_grading = true`
   - Un solo intento por estudiante
   - Permite override manual del maestro
   - Auto-califica usando `validate_and_audit()` SQL

2. **ExerciseAttemptService** (`/progress/attempts`)
   - Para ejercicios con `requires_manual_grading = false`
   - Múltiples intentos permitidos
   - Solo auto-calificación

### Por qué `true` para Módulo 3

Los ejercicios del Módulo 3 involucran evaluación subjetiva:
- Scripts de podcast (creatividad, argumentación)
- Debates (calidad de argumentos)
- Análisis de perspectivas múltiples
- Justificaciones escritas

Aunque usan validación SQL automática, el flag `true` permite:
- Control de un solo envío definitivo
- Posibilidad de que el maestro revise/ajuste
- Consistencia con la naturaleza evaluativa del módulo

---

## ⚙️ Cómo Aplicar

### Opción 1: Recrear Base de Datos (Recomendado para desarrollo)

```bash
cd apps/database
./create-database.sh
```

### Opción 2: Actualización Manual (Producción)

```sql
UPDATE educational_content.exercises
SET requires_manual_grading = true
WHERE module_id = (
    SELECT id FROM educational_content.modules
    WHERE module_code = 'MOD-03-CRITICA'
);
```

---

## ✅ Verificación

Después de aplicar, verificar con:

```sql
SELECT
    title,
    exercise_type,
    requires_manual_grading
FROM educational_content.exercises
WHERE module_id = (
    SELECT id FROM educational_content.modules
    WHERE module_code = 'MOD-03-CRITICA'
)
ORDER BY order_index;
```

Resultado esperado: Todos deben mostrar `requires_manual_grading = true`.

---

## 📎 Referencias

- **Seed modificado:** `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
- **Backend service:** `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- **Arquitectura dual:** Ver ADR-008-sistema-dual-exercise-mechanics.md
