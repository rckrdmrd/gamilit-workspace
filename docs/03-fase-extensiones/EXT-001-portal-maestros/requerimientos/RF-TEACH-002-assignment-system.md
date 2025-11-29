# RF-TEACH-002: Sistema de Asignaciones

**Epic:** EXT-001 - Portal de Maestros
**Fase:** 3 - Extensiones
**Prioridad:** ALTA
**Estado:** ✅ IMPLEMENTADO
**Tipo:** Feature - Sistema de Gestión de Asignaciones

---

## 📋 Descripción

Sistema completo de asignaciones que permite a los maestros crear tareas personalizadas, asignarlas a estudiantes (individual o grupalmente), y evaluar las entregas. El sistema integra ejercicios del contenido educativo existente con la capacidad de crear evaluaciones personalizadas.

---

## 🎯 Objetivo

Proporcionar a los maestros herramientas para:
- Crear asignaciones personalizadas combinando ejercicios existentes
- Asignar tareas a estudiantes individuales o grupos completos (classrooms)
- Realizar seguimiento de entregas y progreso
- Calificar y proporcionar retroalimentación
- Mantener notas privadas sobre el desempeño de estudiantes

---

## 👥 Actores

- **Maestro (Teacher)**: Crea, asigna, y califica assignments
- **Estudiante (Student)**: Recibe, completa, y entrega assignments
- **Sistema**: Gestiona notificaciones, deadlines, y tracking automático

---

## 📊 Modelo de Datos

### Tabla: `assignments`

**Schema:** `public`
**Descripción:** Tabla principal de asignaciones creadas por maestros

```sql
CREATE TABLE public.assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    assignment_type VARCHAR(50) NOT NULL CHECK (assignment_type IN ('practice', 'quiz', 'exam', 'homework')),
    due_date TIMESTAMP WITH TIME ZONE,
    total_points INTEGER NOT NULL DEFAULT 100,
    is_published BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Columnas clave:**
- `teacher_id`: Maestro creador (FK → auth.users)
- `assignment_type`: Tipo de asignación
  - `practice`: Práctica (sin calificación formal)
  - `quiz`: Quiz/prueba corta
  - `exam`: Examen formal
  - `homework`: Tarea
- `total_points`: Puntaje máximo (default: 100)
- `is_published`: Control de visibilidad (draft vs published)
- `due_date`: Fecha límite de entrega (opcional)

**Índices:**
- `idx_assignments_teacher_id` (btree)
- `idx_assignments_is_published` (btree)
- `idx_assignments_due_date` (btree, WHERE due_date IS NOT NULL)
- `idx_assignments_type` (btree)

---

### Tabla: `assignment_exercises`

**Schema:** `public`
**Descripción:** Relación M2M entre assignments y ejercicios del sistema

```sql
CREATE TABLE public.assignment_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id) ON DELETE CASCADE,
    order_index INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, exercise_id)
);
```

**Propósito:**
- Permite incluir múltiples ejercicios en un assignment
- Mantiene orden de presentación (`order_index`)
- Reutiliza ejercicios existentes del catálogo educativo

**Índices:**
- `idx_assignment_exercises_assignment_id` (btree)
- `idx_assignment_exercises_exercise_id` (btree)
- `idx_assignment_exercises_order` (btree composite: assignment_id, order_index)

---

### Tabla: `assignment_classrooms`

**Schema:** `social_features`
**Descripción:** Asignación de assignments a classrooms completos

> ⚠️ **NOTA (2025-11-29):** Esta tabla fue movida del schema `public` al schema `social_features`
> para mantener coherencia arquitectónica con las entidades de classrooms.
> Ver: `apps/backend/src/modules/social/entities/assignment-classroom.entity.ts`

```sql
CREATE TABLE social_features.assignment_classrooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    classroom_id UUID NOT NULL REFERENCES social_features.classrooms(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, classroom_id)
);
```

**Propósito:**
- Distribución masiva de assignment a todos los estudiantes de un classroom
- Simplifica administración para grupos grandes
- Timestamp de asignación para auditoría

**Índices:**
- `idx_assignment_classrooms_assignment_id` (btree)
- `idx_assignment_classrooms_classroom_id` (btree)

---

### Tabla: `assignment_students`

**Schema:** `public`
**Descripción:** Asignación de assignments a estudiantes individuales

```sql
CREATE TABLE public.assignment_students (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);
```

**Propósito:**
- Asignación individualizada (refuerzo, remediación, avanzados)
- Permite personalización por estudiante
- Complementa asignación por classroom

**Índices:**
- `idx_assignment_students_assignment_id` (btree)
- `idx_assignment_students_student_id` (btree)

---

### Tabla: `assignment_submissions`

**Schema:** `public`
**Descripción:** Entregas y calificaciones de estudiantes

```sql
CREATE TABLE public.assignment_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES public.assignments(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    submitted_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(50) NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'submitted', 'graded')),
    score NUMERIC(5,2),
    feedback TEXT,
    graded_at TIMESTAMP WITH TIME ZONE,
    graded_by UUID REFERENCES auth.users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(assignment_id, student_id)
);
```

**Propósito:**
- Tracking de entregas por estudiante
- Calificación y retroalimentación
- Workflow de estados (not_started → in_progress → submitted → graded)

**Estados:**
- `not_started`: Asignado pero no iniciado
- `in_progress`: Estudiante trabajando
- `submitted`: Entregado, pendiente de calificación
- `graded`: Calificado con score y feedback

**Columnas de calificación:**
- `score`: Calificación numérica (0.00-999.99)
- `feedback`: Retroalimentación textual del maestro
- `graded_by`: Maestro que calificó (FK → auth.users)
- `graded_at`: Timestamp de calificación

**Índices:**
- `idx_assignment_submissions_assignment_id` (btree)
- `idx_assignment_submissions_student_id` (btree)
- `idx_assignment_submissions_status` (btree)
- `idx_assignment_submissions_graded_by` (btree, WHERE graded_by IS NOT NULL)
- `idx_assignment_submissions_submitted_at` (btree, WHERE submitted_at IS NOT NULL)

---

### Tabla: `teacher_notes`

**Schema:** `public`
**Descripción:** Notas privadas de maestros sobre estudiantes

```sql
CREATE TABLE public.teacher_notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    teacher_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    note TEXT NOT NULL,
    is_private BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

**Propósito:**
- Seguimiento cualitativo de estudiantes
- Observaciones de comportamiento, progreso, áreas de mejora
- Notas privadas no visibles para estudiantes/padres

**Índices:**
- `idx_teacher_notes_teacher_id` (btree)
- `idx_teacher_notes_student_id` (btree)
- `idx_teacher_notes_created_at` (btree)
- `idx_teacher_notes_teacher_student` (btree composite)

---

## 🔄 Flujos de Trabajo

### 1. Creación de Assignment

```
Maestro → Crear Assignment (draft)
       → Agregar Ejercicios (assignment_exercises)
       → Configurar deadline, puntos, tipo
       → Publicar (is_published = true)
```

### 2. Distribución de Assignment

**Opción A: Por Classroom**
```
Maestro → Seleccionar Assignment
       → Asignar a Classroom(s) → assignment_classrooms
       → Sistema crea submissions automáticas para c/estudiante
```

**Opción B: Individual**
```
Maestro → Seleccionar Assignment
       → Asignar a Estudiante(s) → assignment_students
       → Sistema crea submissions individuales
```

### 3. Workflow de Estudiante

```
Estudiante → Ve assignment (status: not_started)
          → Inicia trabajo (status: in_progress)
          → Completa ejercicios
          → Entrega (status: submitted, submitted_at = NOW)
```

### 4. Calificación

```
Maestro → Ve queue de submissions (status = submitted)
       → Revisa trabajo
       → Asigna score + feedback
       → Guarda (status: graded, graded_at = NOW, graded_by = teacher_id)
```

### 5. Notas de Seguimiento

```
Maestro → Observa desempeño/comportamiento
       → Crea nota en teacher_notes
       → Nota privada (is_private = true)
       → Consulta histórico de notas por estudiante
```

---

## 🎓 Casos de Uso

### CU-1: Crear Tarea Semanal
**Actor:** Maestro
**Descripción:** Crear asignación semanal con ejercicios de comprensión lectora

**Flujo:**
1. Maestro crea assignment (title: "Semana 3 - Comprensión Literal")
2. Agrega 5 ejercicios de módulo 1 via assignment_exercises
3. Establece due_date: Viernes 5pm
4. Asigna a 3 classrooms via assignment_classrooms
5. Sistema crea ~90 submissions (30 estudiantes × 3 classrooms)

---

### CU-2: Asignación Remedial Individual
**Actor:** Maestro
**Descripción:** Asignar trabajo extra a estudiantes que necesitan refuerzo

**Flujo:**
1. Maestro identifica 3 estudiantes con bajo desempeño
2. Crea assignment tipo "practice" con ejercicios básicos
3. Asigna individualmente via assignment_students (no classrooms)
4. Sistema crea 3 submissions
5. Maestro monitorea progreso individual

---

### CU-3: Examen Final
**Actor:** Maestro
**Descripción:** Crear examen formal con tracking estricto

**Flujo:**
1. Maestro crea assignment tipo "exam"
2. Agrega 20 ejercicios variados (order_index 1-20)
3. Establece total_points: 100, due_date: día del examen
4. Asigna a todos los classrooms
5. Estudiantes completan y entregan
6. Maestro califica con scores y feedback detallado

---

### CU-4: Notas de Observación
**Actor:** Maestro
**Descripción:** Registrar observaciones sobre progreso de estudiante

**Flujo:**
1. Maestro nota que estudiante mejoró en ortografía
2. Crea nota: "María mostró gran mejora en uso de tildes, continuar reforzando"
3. is_private = true (no visible para estudiante)
4. Consulta historial de notas previas de María
5. Identifica patrón de mejora

---

## 🔗 Relaciones con Otros Schemas

### Con `educational_content`
- `assignment_exercises.exercise_id` → `educational_content.exercises.id`
- Reutiliza ejercicios existentes del catálogo

### Con `social_features`
- `assignment_classrooms.classroom_id` → `social_features.classrooms.id`
- Distribución masiva por classroom

### Con `auth_management`
- `assignments.teacher_id` → `auth.users.id` (role: teacher)
- `assignment_students.student_id` → `auth.users.id` (role: student)
- `assignment_submissions.student_id` → `auth.users.id`
- `assignment_submissions.graded_by` → `auth.users.id` (role: teacher)

---

## 🔒 Seguridad y RLS

**Políticas RLS requeridas:**

### `assignments`
- Maestros ven solo sus propios assignments
- Estudiantes ven solo assignments published asignados a ellos

### `assignment_submissions`
- Maestros ven submissions de sus assignments
- Estudiantes ven solo sus propias submissions
- Admin/coordinador puede ver todas

### `teacher_notes`
- Solo el teacher creador puede ver/editar sus notas
- Estudiantes NO pueden ver notas privadas
- Admin puede ver para auditoría

---

## 📈 Métricas y Analytics

### Por Maestro
- Total de assignments creados
- Submissions pendientes de calificar
- Promedio de tiempo de calificación
- Tasa de entrega a tiempo vs tarde

### Por Estudiante
- Assignments asignados vs completados
- Promedio de scores
- Tasa de entregas a tiempo
- Tendencia de desempeño

### Por Assignment
- Tasa de completitud (submitted/assigned)
- Score promedio
- Distribución de scores
- Tiempo promedio de completitud

---

## 🧪 Validaciones

### Al Crear Assignment
- ✅ teacher_id debe tener role 'teacher' o 'admin_teacher'
- ✅ assignment_type debe ser válido (practice/quiz/exam/homework)
- ✅ total_points > 0
- ✅ title no vacío

### Al Distribuir
- ✅ Assignment debe estar published (is_published = true)
- ✅ Classroom debe existir y estar activo
- ✅ Estudiante debe estar enrolled en classroom (si aplica)
- ✅ No duplicar asignación (UNIQUE constraints)

### Al Calificar
- ✅ Submission debe estar submitted
- ✅ graded_by debe ser maestro del assignment
- ✅ score debe estar entre 0 y total_points del assignment
- ✅ feedback opcional pero recomendado

---

## ⚙️ Configuración y Defaults

- **Default total_points:** 100
- **Default is_published:** false (draft)
- **Default status (submissions):** not_started
- **Default is_private (notes):** true
- **Cascade deletes:** ON DELETE CASCADE en todas las FKs (excepto graded_by)

---

## 🚀 Mejoras Futuras

1. **Auto-grading para ejercicios cerrados**
   - Calificación automática de multiple choice
   - Reducir carga de maestros

2. **Rúbricas de evaluación**
   - Tabla `assignment_rubrics` con criterios
   - Evaluación por dimensiones

3. **Extensiones de deadline**
   - Tabla `assignment_extensions` para casos especiales
   - Aprobación de maestro

4. **Notificaciones automáticas**
   - Assignment nuevo asignado
   - Deadline próximo (24h antes)
   - Submission calificada

5. **Análisis de plagio**
   - Integración con sistema anti-plagio
   - Comparación entre submissions

6. **Exportación masiva**
   - Export de calificaciones a CSV/Excel
   - Integración con sistemas escolares (SIS)

---

## 📝 Notas de Implementación

### Discrepancias con TRACEABILITY Inicial

El diseño inicial documentado en `TRACEABILITY.yml` especificaba:
- Tablas en schemas `educational_content` y `progress_tracking`
- Solo 3 tablas (assignments, assignment_submissions, teacher_notes)
- Columna `content_refs JSONB` en assignments

**Implementación real:**
- Tablas principales en schema `public` (assignments, assignment_exercises, assignment_students, assignment_submissions, teacher_notes)
- Tabla `assignment_classrooms` en schema `social_features` (movida 2025-11-29)
- 6 tablas total (assignments + 4 M2M + submissions + notes)
- M2M table `assignment_exercises` en vez de JSONB (mejor normalización)

**Ventajas del diseño implementado:**
- Mejor normalización (M2M vs JSONB)
- Separación clara de asignación por classroom vs individual
- Mayor flexibilidad para queries y reportes
- Indexes optimizados para búsquedas comunes

---

## 🔗 Referencias

- **Épica:** EXT-001 - Portal de Maestros
- **User Stories:** US-PM-002a, US-PM-002b, US-PM-002c, US-PM-003a, US-PM-003b, US-PM-004b
- **Schemas relacionados:**
  - `educational_content` (exercises)
  - `social_features` (classrooms)
  - `auth_management` (users, roles)

---

**Creado:** 2025-11-08
**Actualizado:** 2025-11-29 (schema assignment_classrooms → social_features)
**Tipo:** Documentación retroactiva (implementación ya existente)
**Estado:** ✅ Documentación completa de implementación real
