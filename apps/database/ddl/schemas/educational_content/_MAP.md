# Schema: educational_content

Contenido educativo: módulos, ejercicios, assignments, recursos multimedia.

## Estructura

- **tables/**: 22 archivos activos
- **enums/**: 6 archivos (bloom_taxonomy, cognitive_level, difficulty_level, exercise_mechanic, exercise_type, module_status)
- **functions/**: 28 archivos (validadores por mecanica + utilidades)
- **functions/_deprecated/**: 1 archivo (validate_rueda_inferencias_text - 2026-01-13)
- **triggers/**: 2 archivos activos (incluye 00-batch_updated_at_triggers.sql consolidado)
- **triggers/_deprecated/**: 4 archivos (triggers updated_at individuales)
- **indexes/**: 16 archivos
- **rls-policies/**: 2 archivos

**Total:** ~75 objetos DDL

## Tablas (22 archivos)

| # | Archivo | Tabla | Proposito |
|---|---------|-------|-----------|
| 01 | `01-modules.sql` | modules | 5 modulos educativos (Comprension Literal → Creacion) |
| 02 | `02-exercises.sql` | exercises | Ejercicios con configuracion JSONB por mecanica |
| 03 | `03-assessment_rubrics.sql` | assessment_rubrics | Rubricas de evaluacion |
| 04 | `04-media_resources.sql` | media_resources | Recursos multimedia |
| 05 | `05-assignments.sql` | assignments | Tareas asignadas por profesores |
| 06 | `06-assignment_exercises.sql` | assignment_exercises | Ejercicios dentro de una tarea |
| 07 | `07-assignment_students.sql` | assignment_students | Estudiantes asignados a tareas |
| 08 | `08-assignment_submissions.sql` | assignment_submissions | Entregas de tareas |
| 09 | `09-media_attachments.sql` | media_attachments | Adjuntos multimedia |
| 10 | `20-difficulty_criteria.sql` | difficulty_criteria | Configuracion de niveles CEFR |
| 11 | `21-exercise_mechanic_mapping.sql` | exercise_mechanic_mapping | Mapeo ejercicio-mecanica |
| 12 | `22-exercise_validation_config.sql` | exercise_validation_config | Config validacion ejercicios |
| 13 | `23-classroom_modules.sql` | classroom_modules | Modulos asignados a aulas |
| 14 | `24-alter_assignment_students.sql` | (ALTER) | Modificaciones a assignment_students |
| 15 | `25-teacher_content.sql` | teacher_content | Contenido creado por profesores |
| 16 | `26-exercise_validation_audit.sql` | exercise_validation_audit | Auditoria de validaciones |
| 17 | `27-exercise_type_rubrics.sql` | exercise_type_rubrics | Rubricas por tipo de ejercicio |
| 18 | `content_approvals.sql` | content_approvals | Aprobaciones de contenido |
| 19 | `content_metadata.sql` | content_metadata | Metadata de contenido |
| 20 | `content_tags.sql` | content_tags | Etiquetas de contenido |
| 21 | `module_dependencies.sql` | module_dependencies | Dependencias entre modulos |
| 22 | `taxonomies.sql` | taxonomies | Taxonomias educativas |

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

**Ultima actualizacion:** 2026-01-13
**Cambios recientes:**
- AUDITORIA: Inventario de tablas actualizado de 14 a 22 (2026-01-13)
- AUDITORIA: Archivo validate_rueda_inferencias_text.sql movido a _deprecated/ (2026-01-13)
- CONSOLIDACION BD: Triggers updated_at consolidados (2026-01-07)
- CONSOLIDACION BD: ENUMs migrados a archivos individuales (2026-01-07)
