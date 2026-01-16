# _MAP: educational_content/

**Ultima actualizacion:** 2026-01-14
**Estado:** Produccion
**Tipo:** Domain/Educational
**Objetos activos:** 45

---

## Proposito

Contenido educativo: modulos, ejercicios, assignments, recursos multimedia.
5 modulos progresivos (Comprension Literal → Creacion) con 23 tipos de ejercicios.

**Audiencia:** Backend Developers, Frontend Developers, Content Team

## Estructura

- **tables/**: 14 archivos activos
- **enums/**: 6 archivos (bloom_taxonomy, cognitive_level, difficulty_level, exercise_mechanic, exercise_type, module_status)
- **functions/**: 3 archivos
- **triggers/**: 2 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 4 archivos (triggers updated_at individuales)
- **indexes/**: 16 archivos
- **rls-policies/**: 2 archivos

**Total:** 45 objetos DDL

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

## Consolidacion de Triggers (2026-01-07)

Triggers de `updated_at` consolidados en `00-batch_updated_at_triggers.sql`:
- `assessment_rubrics_updated_at`
- `exercises_updated_at`
- `media_resources_updated_at`
- `modules_updated_at`

Archivos originales movidos a `triggers/_deprecated/`.

## Migracion de ENUMs (2026-01-07)

ENUMs migrados desde `00-prerequisites.sql` a archivos individuales en `enums/`:
- `exercise_type` - Tipos de ejercicio
- `module_status` - Estados de modulo
- `cognitive_level` - Niveles cognitivos

---

**Ultima actualizacion:** 2026-01-07
**Cambios recientes:**
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
