# Schema: educational_content

Contenido educativo: módulos, ejercicios, assignments, recursos multimedia.

## Estructura

- **tables/**: 14 archivos activos
- **enums/**: 3 archivos
- **functions/**: 3 archivos
- **triggers/**: 4 archivos
- **indexes/**: 16 archivos
- **rls-policies/**: 2 archivos

**Total:** 42 objetos DDL

## Tablas Principales

| Tabla | Propósito |
|-------|-----------|
| `modules` | 5 módulos educativos (Comprensión Literal → Creación) |
| `exercises` | Ejercicios con configuración JSONB por mecánica |
| `assignments` | Tareas asignadas por profesores |
| `assignment_exercises` | Ejercicios dentro de una tarea |
| `assignment_students` | Estudiantes asignados a tareas |
| `assignment_submissions` | Entregas de tareas |
| `assessment_rubrics` | Rúbricas de evaluación |
| `media_resources` | Recursos multimedia |
| `difficulty_criteria` | Configuración de niveles CEFR |

## Modelo de Datos

- **JSONB puro**: Configuración de ejercicios en campo `config`
- **23 tipos de ejercicios**: Definidos en ENUM `exercise_mechanic`
- **Niveles CEFR**: beginner (A1) → native (C2+)

## Funciones

| Función | Propósito |
|---------|-----------|
| `calculate_learning_path` | Calcula ruta de aprendizaje |
| `get_recommended_missions` | Obtiene misiones recomendadas |
| `validate_exercise_structure` | Valida estructura JSONB de ejercicio |

## Distribución de Ejercicios

- 5 módulos con ejercicios progresivos
- Niveles CEFR: beginner (35%), intermediate (35%), advanced (30%)
- Cada ejercicio incluye config JSONB específico para su tipo

---

**Última actualización:** 2025-12-29
