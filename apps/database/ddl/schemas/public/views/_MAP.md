# Mapa de Vistas SQL - Schema PUBLIC

**Propósito:** Catalogar todas las vistas SQL del schema public
**Responsabilidad:** SA-DB-031
**Última actualización:** 2025-11-02
**Total de vistas:** 3

---

## Estructura de Archivos

```
public/views/
├── 01-assignment_submission_stats.sql
├── 02-classroom_overview.sql
├── 03-for.sql
└── _MAP.md (este archivo)
```

---

## Catálogo de Vistas

### 1. assignment_submission_stats
**Archivo:** `01-assignment_submission_stats.sql`
**Tipo:** Analytics View (Aggregated)
**Prioridad:** P2
**Descripción:** Proporciona estadísticas comprensivas sobre envíos de tareas.

**Esquema:**
```sql
CREATE OR REPLACE VIEW public.assignment_submission_stats AS
SELECT
    assignment_id UUID,
    assignment_title TEXT,
    classroom_id UUID,
    classroom_name TEXT,
    total_submissions INTEGER,
    completed_submissions INTEGER,
    pending_submissions INTEGER,
    draft_submissions INTEGER,
    graded_submissions INTEGER,
    submission_rate_percent NUMERIC,
    avg_score NUMERIC,
    max_score NUMERIC,
    min_score NUMERIC,
    assignment_created_at TIMESTAMP,
    assignment_due_date TIMESTAMP,
    total_students INTEGER
```

**Columnas Principales:**
- `assignment_id`: Identificador único de la tarea
- `assignment_title`: Título de la tarea
- `classroom_id`: ID del aula
- `classroom_name`: Nombre del aula
- `total_submissions`: Cantidad total de envíos
- `completed_submissions`: Cantidad de tareas completadas
- `pending_submissions`: Cantidad de tareas pendientes
- `draft_submissions`: Cantidad de borradores
- `graded_submissions`: Cantidad de tareas calificadas
- `submission_rate_percent`: Porcentaje de estudiantes que enviaron
- `avg_score`: Promedio de calificaciones
- `max_score`: Calificación máxima
- `min_score`: Calificación mínima
- `assignment_created_at`: Fecha de creación de la tarea
- `assignment_due_date`: Fecha de vencimiento
- `total_students`: Cantidad total de estudiantes en el aula

**Tablas Base:**
- `educational_content.assignments`
- `educational_content.classrooms`
- `educational_content.exercise_submissions`
- `educational_content.exercise_grades`
- `gamilit.users`

**Casos de Uso:**
- Dashboard de estadísticas de tareas
- Reporte de tasas de envío por aula
- Análisis de desempeño académico
- Identificar tareas con baja tasa de envío
- Seguimiento de calificaciones

**Consultas Típicas:**
```sql
-- Ver todas las estadísticas de tareas
SELECT * FROM assignment_submission_stats;

-- Tareas con baja tasa de envío
SELECT assignment_id, assignment_title, submission_rate_percent
FROM assignment_submission_stats
WHERE submission_rate_percent < 75
ORDER BY submission_rate_percent ASC;

-- Estadísticas por aula
SELECT classroom_name, COUNT(*) as task_count,
       AVG(submission_rate_percent) as avg_submission_rate
FROM assignment_submission_stats
GROUP BY classroom_id, classroom_name;

-- Comparar rendimiento de tareas
SELECT assignment_title, avg_score, max_score, min_score
FROM assignment_submission_stats
WHERE graded_submissions > 0
ORDER BY avg_score DESC;
```

**Filtros Comunes:**
- Por aula: `WHERE classroom_id = '...'`
- Por fecha: `WHERE assignment_created_at >= NOW() - INTERVAL '30 days'`
- Por tasa de envío: `WHERE submission_rate_percent < X`
- Por rango de calificaciones: `WHERE avg_score BETWEEN X AND Y`

---

### 2. classroom_overview
**Archivo:** `02-classroom_overview.sql`
**Tipo:** Analytics View (Aggregated, Status-based)
**Prioridad:** P2
**Descripción:** Proporciona una vista general comprensiva de estadísticas y estado del aula.

**Esquema:**
```sql
CREATE OR REPLACE VIEW public.classroom_overview AS
SELECT
    classroom_id UUID,
    classroom_name TEXT,
    classroom_description TEXT,
    teacher_id UUID,
    teacher_name TEXT,
    total_students INTEGER,
    active_students INTEGER,
    inactive_students INTEGER,
    total_assignments INTEGER,
    pending_assignments INTEGER,
    upcoming_deadline_assignments INTEGER,
    total_chapters INTEGER,
    total_exercises INTEGER,
    avg_class_progress_percent NUMERIC,
    last_updated TIMESTAMP,
    classroom_created_at TIMESTAMP,
    classroom_status TEXT
```

**Columnas Principales:**
- `classroom_id`: Identificador único del aula
- `classroom_name`: Nombre del aula
- `classroom_description`: Descripción del aula
- `teacher_id`: ID del docente
- `teacher_name`: Nombre del docente
- `total_students`: Cantidad total de estudiantes
- `active_students`: Estudiantes activos
- `inactive_students`: Estudiantes inactivos
- `total_assignments`: Cantidad total de tareas
- `pending_assignments`: Tareas con fecha de vencimiento futura
- `upcoming_deadline_assignments`: Tareas con vencimiento en próximos 7 días
- `total_chapters`: Cantidad de capítulos de contenido
- `total_exercises`: Cantidad de ejercicios
- `avg_class_progress_percent`: Progreso promedio de la clase
- `last_updated`: Última actualización
- `classroom_created_at`: Fecha de creación
- `classroom_status`: Estado (EMPTY, ACTIVE, INACTIVE)

**Estados de Aula:**
- `EMPTY`: Sin estudiantes inscritos
- `ACTIVE`: Al menos un estudiante activo
- `INACTIVE`: Solo estudiantes inactivos

**Tablas Base:**
- `educational_content.classrooms`
- `gamilit.users` (múltiples roles)
- `educational_content.assignments`
- `educational_content.chapters`
- `educational_content.exercises`
- `progress_tracking.user_progress`

**Casos de Uso:**
- Dashboard administrativo de aulas
- Monitoreo de estado de aulas
- Identificar aulas con bajo progreso
- Reportes de actividad de docentes
- Planificación de recursos

**Consultas Típicas:**
```sql
-- Ver todas las aulas activas
SELECT * FROM classroom_overview
WHERE classroom_status = 'ACTIVE';

-- Aulas con bajo progreso
SELECT classroom_name, avg_class_progress_percent, total_students
FROM classroom_overview
WHERE avg_class_progress_percent < 50
ORDER BY avg_class_progress_percent ASC;

-- Aulas con tareas próximas a vencer
SELECT classroom_name, upcoming_deadline_assignments, teacher_name
FROM classroom_overview
WHERE upcoming_deadline_assignments > 0
ORDER BY upcoming_deadline_assignments DESC;

-- Comparar progreso entre aulas
SELECT classroom_name, total_students, avg_class_progress_percent
FROM classroom_overview
WHERE classroom_status = 'ACTIVE'
ORDER BY avg_class_progress_percent DESC;

-- Identificar aulas inactivas
SELECT classroom_name, total_students, last_updated
FROM classroom_overview
WHERE classroom_status = 'INACTIVE'
ORDER BY last_updated ASC;
```

**Filtros Comunes:**
- Por estado: `WHERE classroom_status = 'ACTIVE'`
- Por progreso: `WHERE avg_class_progress_percent < X`
- Por cantidad de estudiantes: `WHERE total_students BETWEEN X AND Y`
- Por docente: `WHERE teacher_id = '...'`
- Por fecha: `WHERE last_updated >= NOW() - INTERVAL '7 days'`

---

### 3. for
**Archivo:** `03-for.sql`
**Tipo:** Utility View (Iteration Support)
**Prioridad:** P2
**Estado:** Placeholder - Verificar intención
**Descripción:** Vista utilitaria para soportar consultas iterativas y operaciones FOR-EACH.

**ADVERTENCIA:** Este nombre de vista sugiere que puede ser un placeholder o tener
un caso de uso no estándar. Se recomienda revisar la funcionalidad prevista.

**Esquema:**
```sql
CREATE OR REPLACE VIEW public.for AS
SELECT
    iteration_number INTEGER,
    generated_at TIMESTAMP,
    query_user TEXT
```

**Columnas:**
- `iteration_number`: Número secuencial de 1 a 1000
- `generated_at`: Timestamp de generación
- `query_user`: Usuario de base de datos que ejecuta

**Propósito Presumido:**
Vista para generar series numéricas que pueden usarse en:
- Operaciones JOIN para iteración
- Cross-joins para multiplicación cartesiana
- Procesamiento en lote

**Casos de Uso Potenciales:**
- Generar ID secuenciales temporales
- Realizar JOINs basados en posiciones
- Crear registros múltiples en una operación
- Suportar patrones de iteración SQL

**Consultas Típicas:**
```sql
-- Generar series de números
SELECT * FROM for LIMIT 10;

-- JOIN con tabla para replicación
SELECT t.*, f.iteration_number
FROM some_table t
JOIN for f ON t.id = f.iteration_number;

-- Limitar iteraciones
SELECT * FROM for WHERE iteration_number <= 100;

-- Usar en generación de datos
SELECT
    iteration_number as id,
    'generated_' || iteration_number as name
FROM for
LIMIT 50;
```

**IMPORTANTE - RECOMENDACIONES:**

1. **Verificar intención real**: Este nombre no es estándar SQL
2. **Considerar alternativas:**
   - Usar función que retorna `SETOF RECORD`
   - Usar `generate_series()` directamente
   - Implementar CTE recursivo

3. **Revisar implementación original:**
   - Confirmar rango (1-1000 es suficiente?)
   - Verificar si debería ser función en lugar de vista
   - Evaluar si hay permisos correctos

4. **Documentación incompleta:**
   - ¿Por qué se llama "for"?
   - ¿Cómo se usa en el sistema?
   - ¿Hay dependencias conocidas?

---

## Gestión de Dependencias

### Vistas Relacionadas
```
public.assignment_submission_stats
  ├── educational_content.assignments
  ├── educational_content.classrooms
  ├── educational_content.exercise_submissions
  ├── educational_content.exercise_grades
  └── gamilit.users

public.classroom_overview
  ├── educational_content.classrooms
  ├── gamilit.users
  ├── educational_content.assignments
  ├── educational_content.chapters
  ├── educational_content.exercises
  └── progress_tracking.user_progress

public.for
  └── (no dependencies - generated view)
```

### Tablas Requeridas
- `educational_content.assignments`
- `educational_content.classrooms`
- `educational_content.chapters`
- `educational_content.exercises`
- `educational_content.exercise_submissions`
- `educational_content.exercise_grades`
- `gamilit.users`
- `progress_tracking.user_progress`
- `audit_logging.system_logs` (para auditoría)

### Permisos Requeridos
```sql
-- Crear vistas requiere
GRANT CREATE ON SCHEMA public TO role_name;
GRANT USAGE ON SCHEMA public TO role_name;

-- Leer vistas requiere
GRANT SELECT ON public.assignment_submission_stats TO role_name;
GRANT SELECT ON public.classroom_overview TO role_name;
GRANT SELECT ON public.for TO role_name;

-- Permisos en tablas base
GRANT SELECT ON educational_content.assignments TO role_name;
GRANT SELECT ON educational_content.classrooms TO role_name;
-- ... etc
```

---

## Estadísticas de Implementación

| Métrica | Valor |
|---------|-------|
| Total de vistas | 3 |
| Vistas de análisis | 2 |
| Vistas utilitarias | 1 |
| Vistas simples | 0 |
| Vistas materializadas | 0 |
| Archivos SQL | 3 |
| Líneas de código totales | ~250 |
| Tablas base totales | 8 |
| JOINs totales | 12 |

---

## Instrucciones de Deployment

### Prerequisitos
- PostgreSQL 12+ (compatible con 10+)
- Todos los schemas base deben existir
- Todas las tablas deben estar creadas

### Ejecución Individual
```bash
# Copiar archivo al servidor
scp 01-assignment_submission_stats.sql user@host:/tmp/

# Ejecutar con psql
psql -U postgres -d gamilit_platform < 01-assignment_submission_stats.sql
```

### Ejecución en Lote
```bash
# Ejecutar todas las vistas en orden
for file in *.sql; do
    echo "Ejecutando $file..."
    psql -U postgres -d gamilit_platform < "$file"
done
```

### Verificación Post-Deployment
```sql
-- Listar todas las vistas creadas
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'VIEW'
ORDER BY table_name;

-- Verificar estructura de vista
\d+ public.assignment_submission_stats

-- Probar consulta
SELECT COUNT(*) FROM public.assignment_submission_stats;

-- Ver definición
SELECT pg_get_viewdef('public.assignment_submission_stats'::regclass);
```

---

## Rendimiento y Optimización

### Recomendaciones de Índices
```sql
-- Para assignment_submission_stats
CREATE INDEX idx_assignments_classroom_id
  ON educational_content.assignments(classroom_id);
CREATE INDEX idx_exercise_submissions_assignment_id
  ON educational_content.exercise_submissions(assignment_id);
CREATE INDEX idx_exercise_grades_submission_id
  ON educational_content.exercise_grades(submission_id);

-- Para classroom_overview
CREATE INDEX idx_users_classroom_id
  ON gamilit.users(classroom_id);
CREATE INDEX idx_users_status
  ON gamilit.users(status);
CREATE INDEX idx_chapters_classroom_id
  ON educational_content.chapters(classroom_id);
CREATE INDEX idx_user_progress_user_id
  ON progress_tracking.user_progress(user_id);
```

### Consideraciones de Caché
- Ambas vistas usan agregaciones (COUNT, AVG, MAX, MIN)
- Se recomienda materializar para sistemas de alto uso
- Refreshes periódicos si se materializan

### Monitoreo de Queries
```sql
-- Ver planes de ejecución
EXPLAIN ANALYZE SELECT * FROM assignment_submission_stats WHERE classroom_id = '...';

-- Monitorear uso de índices
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

---

## Documentación Relacionada

- **Schema PUBLIC**: `/schemas/public/README.md`
- **Funciones del PUBLIC**: `/schemas/public/functions/_MAP.md`
- **Tablas del PUBLIC**: `/schemas/public/tables/_MAP.md`
- **Índices del PUBLIC**: `/schemas/public/indexes/_MAP.md`
- **Directrices Database**: `.claude/directivas/DIRECTIVAS-DATABASE.md`

---

## Notas de Implementación

### Validaciones Post-Creación
1. Todas las vistas deben ser consultables
2. Sin errores en los JOINs
3. Tipos de datos correctos
4. Agregaciones coherentes

### Problemas Conocidos
1. Vista `for` - Nombre poco claro, verificar uso real
2. `classroom_overview` puede ser lenta con muchos datos - considerar materializar
3. Agregaciones en `assignment_submission_stats` con muchas clases

### Mejoras Futuras
1. Considerar materializar vistas para mejor performance
2. Agregar vistas adicionales de reporting
3. Optimizar JOINs en vistas complejas
4. Implementar políticas RLS si es necesario

---

**Creado:** 2025-11-02
**Responsabilidad:** SA-DB-031
**Estado:** Implementado (con advertencia en vista `for`)
**Versión:** 1.0
