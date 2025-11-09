# Schema: educational_content

Contenido educativo: módulos, ejercicios, assignments, recursos multimedia

## Estructura

- **tables/**: 15 archivos
- **enums/**: 3 archivos
- **functions/**: 3 archivos
- **triggers/**: 4 archivos
- **indexes/**: 16 archivos
- **rls-policies/**: 2 archivos

**Total:** 43 objetos

## Contenido Detallado

### tables/ (15 archivos)

```
01-modules.sql
02-exercises.sql
03-assessment_rubrics.sql
04-media_resources.sql
assignment_exercises.sql
assignment_students.sql
assignment_submissions.sql
assignments.sql
content_approvals.sql
content_metadata.sql
content_tags.sql
exercise_answers.sql
exercise_options.sql
module_dependencies.sql
taxonomies.sql
```

### enums/ (3 archivos)

```
bloom_taxonomy.sql
difficulty_level.sql
exercise_mechanic.sql
```

### functions/ (3 archivos)

```
calculate_learning_path.sql
get_recommended_missions.sql
validate_exercise_structure.sql
```

### triggers/ (4 archivos)

```
11-trg_assessment_rubrics_updated_at.sql
12-trg_exercises_updated_at.sql
13-trg_media_resources_updated_at.sql
14-trg_modules_updated_at.sql
```

### indexes/ (16 archivos)

```
idx_assignment_classrooms_assignment_id.sql
idx_assignment_classrooms_classroom_id.sql
idx_assignment_exercises_assignment_id.sql
idx_assignment_exercises_exercise_id.sql
idx_assignment_exercises_order.sql
idx_assignment_students_assignment_id.sql
idx_assignment_students_student_id.sql
idx_assignment_submissions_assignment_id.sql
idx_assignment_submissions_graded_by.sql
idx_assignment_submissions_status.sql
idx_assignment_submissions_student_id.sql
idx_assignment_submissions_submitted_at.sql
idx_assignments_due_date.sql
idx_assignments_is_published.sql
idx_assignments_teacher_id.sql
idx_assignments_type.sql
```

### rls-policies/ (2 archivos)

```
01-enable-rls.sql
02-modules-exercises-policies.sql
```

---

**Última actualización:** 2025-11-09
**Reorganización:** 2025-11-09
