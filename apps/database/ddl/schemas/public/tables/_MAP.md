# Tablas del Schema Public (P0)

**Total:** 9 tablas base implementadas
**Creado por:** SA-DB-009
**Fecha:** 2025-11-02
**Microciclo:** 4 - Fase 2

## Lista de Tablas Implementadas

| # | Tabla | Descripción | Foreign Keys | Archivo Fuente | Notas |
|---|-------|-------------|--------------|----------------|-------|
| 1 | classrooms | Aulas virtuales | auth.users (teacher_id) | 005_teacher_tables.sql | Tabla base del módulo de profesores |
| 2 | classroom_students | Estudiantes en aula (M2M) | classrooms, auth.users (student_id) | 005_teacher_tables.sql | Relación M2M |
| 3 | assignments | Tareas/asignaciones | auth.users (teacher_id) | 005_teacher_tables.sql | Soporta 4 tipos: practice, quiz, exam, homework |
| 4 | assignment_exercises | Ejercicios de tarea (M2M) | assignments, exercises | 005_teacher_tables.sql | Incluye order_index |
| 5 | assignment_classrooms | Asignaciones a aulas (M2M) | assignments, classrooms | 005_teacher_tables.sql | Asignación a aulas completas |
| 6 | assignment_students | Asignaciones a estudiantes (M2M) | assignments, auth.users (student_id) | 005_teacher_tables.sql | Asignación individual |
| 7 | assignment_submissions | Entregas de estudiantes | assignments, auth.users (student, graded_by) | 005_teacher_tables.sql | Incluye calificación y feedback |
| 8 | teacher_notes | Notas del profesor | auth.users (teacher, student) | 006_teacher_module_updates.sql | Notas privadas sobre estudiantes |
| 9 | notifications | Notificaciones del sistema | auth.users (user_id) | 007_notifications_table.sql | Sistema de notificaciones en tiempo real |

## Tabla No Encontrada

**10. `for`**: La matriz de gaps lista esta tabla como P0, pero NO se encontró en ningún archivo fuente. Posibles causas:
- Error en la matriz de gaps
- Nombre incorrecto (palabra reservada SQL)
- Tabla renombrada o eliminada

**ACCIÓN REQUERIDA**: Verificar con equipo si la tabla `for` realmente existe o si es un error en la matriz.

## Dependencias de ENUMs

Las tablas creadas NO utilizan ENUMs directamente. En su lugar, usan VARCHAR con CHECK constraints:
- `assignments.assignment_type`: CHECK IN ('practice', 'quiz', 'exam', 'homework')
- `assignment_submissions.status`: CHECK IN ('not_started', 'in_progress', 'submitted', 'graded')

**Nota:** Si se requiere migrar a ENUMs, se deben crear primero los tipos:
- `public.assignment_type_enum`
- `public.submission_status_enum`

## Orden de Creación Recomendado

1. **Tablas base:**
   - `classrooms` (depende solo de auth.users)
   - `assignments` (depende solo de auth.users)
   - `notifications` (depende solo de auth.users)

2. **Tablas de relación M2M:**
   - `classroom_students` (requiere classrooms)
   - `assignment_classrooms` (requiere assignments, classrooms)
   - `assignment_students` (requiere assignments)
   - `assignment_exercises` (requiere assignments, exercises)

3. **Tablas dependientes:**
   - `assignment_submissions` (requiere assignments)
   - `teacher_notes` (requiere auth.users)

## Funciones/Triggers Requeridos

Las siguientes tablas requieren que existan estas funciones antes de ejecutar los DDL:

1. **`update_updated_at_column()`**:
   - Usada por: classrooms, assignments, assignment_submissions
   - Debe existir antes de crear estas tablas

2. **`update_notifications_updated_at()`**:
   - Usada por: notifications
   - Es una función específica para notificaciones

**ACCIÓN REQUERIDA**: Verificar que estas funciones existan en el schema `public` o crearlas primero.

## Referencias Externas

Todas las tablas referencian:
- **auth.users**: Schema de Supabase para usuarios
- **public.exercises**: Tabla que debe existir (verificar implementación previa)

## Índices y Optimizaciones

Todas las tablas incluyen:
- Índices en foreign keys para performance
- Índices en campos de búsqueda frecuente (is_active, status, etc.)
- Índices parciales con WHERE para optimizar queries comunes
- Índice GIN en notifications.data (campo JSONB)

## Comentarios SQL

Todas las tablas incluyen:
- COMMENT ON TABLE para descripción
- COMMENT ON COLUMN para columnas importantes
- Documentación inline en el código

## Validación de Sintaxis

Estado: PENDIENTE
- Ejecutar validaciones con psql --dry-run (si está disponible)
- Verificar dependencias de tablas externas (exercises, auth.users)

---

## Notas de Implementación

### Decisiones Técnicas

1. **VARCHAR vs ENUM**: Se mantuvieron los CHECK constraints originales en lugar de convertir a ENUMs para mantener compatibilidad con el código fuente.

2. **Triggers**: Se mantuvieron los triggers originales. Algunos son genéricos (`update_updated_at_column`) y otros específicos.

3. **Palabra reservada "for"**: No se encontró evidencia de que esta tabla exista. Requiere investigación adicional.

### Fuentes Consultadas

- `/home/isem/workspace/projects/glit/database/migrations/005_teacher_tables.sql`
- `/home/isem/workspace/projects/glit/database/migrations/006_teacher_module_updates.sql`
- `/home/isem/workspace/projects/glit/database/migrations/007_notifications_table.sql`
- `/home/isem/workspace/projects/glit/database/migrations/008_admin_module_tables.sql` (para verificar "for")
- `/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/orchestration/analisis/matriz-gaps.json`

---

**SA-DB-009 - Microciclo 4 Fase 2**
**Status:** ✅ 9/10 tablas implementadas | ⚠️ 1 tabla no encontrada (for)
