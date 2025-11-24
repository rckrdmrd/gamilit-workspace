# EVIDENCIAS - VALIDACIÓN DE POLÍTICA DE CARGA LIMPIA

**Proyecto:** GAMILIT - Sistema de Gamificación Educativa
**Fecha:** 2025-11-23
**Reporte principal:** REPORTE-VALIDACION.md

---

## 1. EVIDENCIA: Carpetas Migrations Detectadas

### Comando Ejecutado
```bash
find /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database -type d -name "migrations"
```

### Output
```
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/ddl/migrations
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/migrations
/home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/scripts/migrations
```

### Análisis
- 3 carpetas migrations detectadas
- 2 están vacías (ddl/migrations, migrations)
- 1 contiene archivo (scripts/migrations)

---

## 2. EVIDENCIA: Contenido de scripts/migrations/

### Comando Ejecutado
```bash
ls -la /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/scripts/migrations
```

### Output
```
total 12
drwxr-xr-x 2 isem isem 4096 Nov 19 13:47 .
drwxr-xr-x 9 isem isem 4096 Nov 21 02:28 ..
-rw------- 1 isem isem 2643 Nov 19 13:47 DB-125-add-pedagogical-columns.sql
```

### Análisis
- 1 archivo migration detectado
- Creado: 2025-11-19
- Tamaño: 2643 bytes
- Propósito: Agregar 4 columnas pedagógicas a tabla exercises

---

## 3. EVIDENCIA: Archivo Migration DB-125

### Comando Ejecutado
```bash
cat /home/isem/workspace/workspace-gamilit/gamilit/projects/gamilit/apps/database/scripts/migrations/DB-125-add-pedagogical-columns.sql
```

### Contenido (primeras 30 líneas)
```sql
-- =====================================================
-- Migration: Add Pedagogical Content Columns to Exercises
-- Task: DB-125
-- Date: 2025-11-19
-- Description: Agrega 4 columnas TEXT para contenido pedagógico expandido
-- Scope: 15 ejercicios en módulos 1-3 (módulos 4-5 pendientes en DB-126)
-- Author: Database Agent
-- =====================================================

SET search_path TO educational_content, public;

-- Verificar que estamos en el schema correcto
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'educational_content'
          AND table_name = 'exercises'
    ) THEN
        RAISE EXCEPTION 'Tabla educational_content.exercises no encontrada';
    END IF;
END $$;

-- Agregar columnas (idempotente con IF NOT EXISTS)
ALTER TABLE educational_content.exercises
ADD COLUMN IF NOT EXISTS objective TEXT,
ADD COLUMN IF NOT EXISTS how_to_solve TEXT,
ADD COLUMN IF NOT EXISTS recommended_strategy TEXT,
ADD COLUMN IF NOT EXISTS pedagogical_notes TEXT;
```

### Análisis
- ❌ Archivo de tipo "migration incremental" (prohibido por Política de Carga Limpia)
- ❌ Usa ALTER TABLE en lugar de actualizar DDL base
- ❌ Está en carpeta migrations/ (prohibida)
- ⚠️ Pero las columnas YA están en el DDL base (ver evidencia 4)

---

## 4. EVIDENCIA: Columnas Pedagógicas en DDL Base

### Comando Ejecutado
```bash
grep -E "(objective|how_to_solve|recommended_strategy|pedagogical_notes)" \
  apps/database/ddl/schemas/educational_content/tables/02-exercises.sql
```

### Output
```sql
    objective TEXT,
    how_to_solve TEXT,
    recommended_strategy TEXT,
    pedagogical_notes TEXT,
COMMENT ON COLUMN educational_content.exercises.objective IS
COMMENT ON COLUMN educational_content.exercises.how_to_solve IS
COMMENT ON COLUMN educational_content.exercises.recommended_strategy IS
COMMENT ON COLUMN educational_content.exercises.pedagogical_notes IS
```

### Análisis
- ✅ Las 4 columnas SÍ están en el DDL base (02-exercises.sql)
- ✅ DDL está actualizado correctamente
- ✅ Comentarios SQL presentes
- **Conclusión:** Migration DB-125 es **REDUNDANTE** (ya aplicada en DDL)

---

## 5. EVIDENCIA: Columnas en BD Creada

### Comando Ejecutado
```bash
psql -d gamilit_platform -c "\d educational_content.exercises" | grep -E "(objective|how_to_solve|recommended_strategy|pedagogical_notes)"
```

### Output
```
 objective              | text     |           |          |
 how_to_solve           | text     |           |          |
 recommended_strategy   | text     |           |          |
 pedagogical_notes      | text     |           |          |
```

### Análisis
- ✅ Las 4 columnas existen en la BD creada
- ✅ Fueron creadas desde DDL base (no desde migration)
- ✅ Recreación completa funciona correctamente

---

## 6. EVIDENCIA: Seed 05-assignments.sql Existe

### Comando Ejecutado
```bash
ls -la apps/database/seeds/prod/educational_content/ | grep assignments
```

### Output
```
-rw------- 1 isem isem 16801 Nov 23 20:51 05-assignments.sql
```

### Análisis
- ✅ Archivo existe en ubicación correcta
- ✅ Tamaño: 16801 bytes (618 líneas)
- ✅ Fecha creación: 2025-11-23

---

## 7. EVIDENCIA: Seed NO Está en create-database.sh

### Comando Ejecutado
```bash
grep -n "05-assignments" apps/database/create-database.sh
```

### Output
```
(vacío - sin resultados)
```

### Análisis
- ❌ Seed 05-assignments.sql NO está referenciado en create-database.sh
- ❌ Por eso no se cargó en recreación
- **Línea esperada:** ~517 (después de 04-exercises-module3.sql)

---

## 8. EVIDENCIA: 0 Assignments Cargados en BD

### Comando Ejecutado
```bash
psql -d gamilit_platform -c \
  "SELECT COUNT(*) as total_assignments
   FROM educational_content.assignments
   WHERE teacher_id = 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';"
```

### Output
```
 total_assignments
-------------------
                 0
(1 row)
```

### Análisis
- ❌ 0 assignments cargados (esperados: 12)
- ❌ Confirma que seed no se ejecutó
- **Causa raíz:** Seed no incluido en create-database.sh

---

## 9. EVIDENCIA: Recreación Completa Exitosa

### Comando Ejecutado
```bash
cd apps/database
./drop-and-recreate-database.sh "postgresql://gamilit_user:***@localhost:5432/gamilit_platform"
```

### Output (resumen final)
```
[2025-11-23 22:37:50] ✅ ============================================================================
[2025-11-23 22:37:50] ✅ ✅ BASE DE DATOS CREADA EXITOSAMENTE
[2025-11-23 22:37:50] ✅ ============================================================================

Objetos creados:
  - Schemas:     18
  - Tablas:      119
  - ENUMs:       37
  - Funciones:   181
  - Triggers:    75

[2025-11-23 22:37:50] ✅ FASE 16 completada - Seeds de PROD cargados

============================================================================
✅ PROCESO COMPLETO: Base de datos lista para usar
============================================================================
```

### Tiempo de Ejecución
- Inicio: 2025-11-23 22:37:19 CST
- Fin: 2025-11-23 22:37:50 CST
- Duración: **31 segundos**

### Análisis
- ✅ Recreación exitosa sin errores
- ✅ Todos los DDL se aplicaron correctamente
- ✅ 119 tablas creadas (incluida assignments)
- ✅ 38 seeds cargados (excepto 05-assignments.sql)

---

## 10. EVIDENCIA: Estructura Tabla Assignments

### Comando Ejecutado
```bash
psql -d gamilit_platform -c "\d educational_content.assignments"
```

### Output
```
                        Table "educational_content.assignments"
     Column      |           Type           | Collation | Nullable |      Default
-----------------+--------------------------+-----------+----------+-------------------
 id              | uuid                     |           | not null | gen_random_uuid()
 teacher_id      | uuid                     |           | not null |
 title           | character varying(255)   |           | not null |
 description     | text                     |           |          |
 assignment_type | character varying(50)    |           | not null |
 due_date        | timestamp with time zone |           |          |
 total_points    | integer                  |           | not null | 100
 is_published    | boolean                  |           | not null | false
 created_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP
 updated_at      | timestamp with time zone |           |          | CURRENT_TIMESTAMP

Indexes:
    "assignments_pkey" PRIMARY KEY, btree (id)
    "idx_assignments_due_date" btree (due_date) WHERE due_date IS NOT NULL
    "idx_assignments_is_published" btree (is_published)
    "idx_assignments_teacher_id" btree (teacher_id)
    "idx_assignments_type" btree (assignment_type)

Check constraints:
    "assignments_assignment_type_check" CHECK (assignment_type::text = ANY
      (ARRAY['practice','quiz','exam','homework']::text[]))

Foreign-key constraints:
    "assignments_teacher_id_fkey" FOREIGN KEY (teacher_id)
      REFERENCES auth.users(id) ON DELETE CASCADE

Referenced by:
    TABLE "social_features.assignment_classrooms"
      CONSTRAINT "assignment_classrooms_assignment_id_fkey"
      FOREIGN KEY (assignment_id) REFERENCES educational_content.assignments(id) ON DELETE CASCADE
    TABLE "educational_content.assignment_exercises"
      CONSTRAINT "assignment_exercises_assignment_id_fkey"
      FOREIGN KEY (assignment_id) REFERENCES educational_content.assignments(id) ON DELETE CASCADE
    TABLE "educational_content.assignment_students"
      CONSTRAINT "assignment_students_assignment_id_fkey"
      FOREIGN KEY (assignment_id) REFERENCES educational_content.assignments(id) ON DELETE CASCADE
    TABLE "educational_content.assignment_submissions"
      CONSTRAINT "assignment_submissions_assignment_id_fkey"
      FOREIGN KEY (assignment_id) REFERENCES educational_content.assignments(id) ON DELETE CASCADE

Triggers:
    update_assignments_updated_at BEFORE UPDATE ON educational_content.assignments
      FOR EACH ROW EXECUTE FUNCTION gamilit.update_updated_at_column()
```

### Análisis
- ✅ Tabla creada correctamente desde DDL
- ✅ Todas las columnas presentes
- ✅ Índices creados (5 índices)
- ✅ Constraints correctos (1 CHECK, 1 FK)
- ✅ 4 tablas referencian assignments (assignment_classrooms, assignment_exercises, assignment_students, assignment_submissions)
- ✅ Trigger de updated_at presente

---

## 11. EVIDENCIA: Contenido del Seed 05-assignments.sql

### Estadísticas del Archivo
```
Líneas totales: 618
Assignments definidos: 12
Tablas afectadas: 3
  - educational_content.assignments
  - social_features.assignment_classrooms
  - educational_content.assignment_exercises
```

### Distribución de Assignments
```
Classroom 1 (60000000-0000-0000-0000-000000000001 - 5to A): 6 assignments
Classroom 2 (60000000-0000-0000-0000-000000000002 - 5to B): 3 assignments
Classroom 3 (60000000-0000-0000-0000-000000000003 - 6to A): 3 assignments
Total: 12 assignments
```

### Tipos de Assignments
```
practice: 6 assignments
quiz: 1 assignment
exam: 2 assignments
homework: 3 assignments
```

### Validación de FKs
- ✅ teacher_id: bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb (exists)
- ✅ classroom_id: 3 classrooms referenciados (todos existen en seed 02-classrooms.sql)
- ✅ exercise_id: 12 ejercicios referenciados (todos existen en seeds de módulos 1-3)

---

## 12. EVIDENCIA: Documentación Pendiente

### MASTER_INVENTORY.yml

**Comando:**
```bash
grep -A 10 "05-assignments" orchestration/inventarios/MASTER_INVENTORY.yml
```

**Output:**
```
(vacío - sin resultados)
```

**Análisis:** ❌ Sin entrada para seed 05-assignments.sql

---

### TRAZA-TAREAS-DATABASE.md

**Comando:**
```bash
grep -A 5 "assignments" orchestration/trazas/TRAZA-TAREAS-DATABASE.md | head -20
```

**Output:**
```
- Grading queue (GET/PUT /api/teacher/assignments/grading)
- Communication (GET/POST /api/teacher/messages)
- Teacher content (POST /api/teacher/content)
- Analytics (GET /api/teacher/dashboard, /api/teacher/classrooms/:id/analytics)
```

**Análisis:** ❌ Sin entrada específica para creación del seed (solo menciones contextuales)

---

## 13. RESUMEN DE EVIDENCIAS

### Problemas Confirmados

| # | Problema | Evidencia | Sección |
|---|----------|-----------|---------|
| 1 | Carpetas migrations existen | Evidencia 1, 2 | 1-2 |
| 2 | Archivo migration DB-125 detectado | Evidencia 3 | 3 |
| 3 | Seed 05-assignments.sql no se carga | Evidencia 7, 8 | 7-8 |
| 4 | Documentación pendiente | Evidencia 12 | 12 |

### Validaciones Exitosas

| # | Validación | Evidencia | Sección |
|---|------------|-----------|---------|
| 1 | Recreación completa funciona | Evidencia 9 | 9 |
| 2 | Tabla assignments creada correctamente | Evidencia 10 | 10 |
| 3 | DDL de exercises actualizado | Evidencia 4, 5 | 4-5 |
| 4 | Seed 05-assignments.sql válido | Evidencia 6, 11 | 6, 11 |

### Hallazgo Importante
**Migration DB-125 es REDUNDANTE:**
- Las columnas pedagógicas YA están en DDL base (Evidencia 4)
- Las columnas existen en BD creada (Evidencia 5)
- El archivo migration puede moverse a documentación histórica

---

## 14. CONCLUSIÓN DE EVIDENCIAS

Todas las evidencias recopiladas **CONFIRMAN** los hallazgos del reporte principal:

1. ✅ **Recreación funciona** - BD completa en 31 segundos
2. ❌ **Carpetas migrations existen** - 3 detectadas (deben eliminarse)
3. ❌ **Seed no se carga** - 0 assignments en BD (esperados: 12)
4. ⚠️ **Migration redundante** - DB-125 ya aplicada en DDL
5. ❌ **Documentación pendiente** - Inventarios y trazas sin actualizar

**Veredicto:** Las evidencias son **SUFICIENTES Y CONCLUYENTES** para recomendar las acciones correctivas propuestas en REPORTE-VALIDACION.md Sección 5.

---

**Fin de Evidencias**
