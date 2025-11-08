# Requerimientos Teacher Portal - Gestión de Classrooms

**Proyecto:** Gamilit Platform
**Portal:** Teacher
**Archivo original:** REQUERIMIENTOS-TEACHER-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Gestión de Classrooms](#gestión-de-classrooms)
2. [Matriz de Permisos](#matriz-de-permisos)
3. [Casos de Uso](#casos-de-uso)
4. [Referencias](#referencias)

---

## Gestión de Classrooms

### 2.1 Gestión de Classrooms (HU-EP009-01)

**Historia de Usuario:** Como profesor, quiero crear y administrar mis classrooms (aulas virtuales) para organizar a mis estudiantes por clase, grado y materia de forma eficiente.

**Story Points:** 16 SP | **Prioridad:** Alta (P1)

#### 2.1.1 Creación de Classrooms
**REQ-TCH-001:** El sistema debe permitir a los profesores crear nuevos classrooms con los siguientes datos:
- Nombre (obligatorio, 1-255 caracteres)
- Descripción (opcional, máximo 1000 caracteres)
- ID de escuela (opcional, UUID)
- Nivel de grado (opcional, máximo 50 caracteres)
- Materia (opcional, máximo 100 caracteres)

**REQ-TCH-002:** Cada classroom creado debe ser asignado automáticamente al teacher_id del profesor autenticado.

**REQ-TCH-003:** El sistema debe validar que el nombre del classroom no esté vacío y no exceda 255 caracteres.

#### 2.1.2 Listado y Búsqueda de Classrooms
**REQ-TCH-004:** El sistema debe proporcionar un listado paginado de classrooms con las siguientes opciones:
- Tamaños de página: 10, 25, 50, 100 items
- Filtros: estado activo/inactivo, materia, nivel de grado
- Ordenamiento por fecha de creación

**REQ-TCH-005:** El listado debe incluir estadísticas básicas para cada classroom:
- Total de estudiantes
- Assignments activos
- Promedio de calificaciones

#### 2.1.3 Visualización de Detalles
**REQ-TCH-006:** El sistema debe mostrar información detallada de un classroom incluyendo:
- Datos básicos del classroom
- Estadísticas completas (total_students, active_assignments, avg_grade)
- Lista de estudiantes matriculados
- Historial de actividad reciente

#### 2.1.4 Actualización de Classrooms
**REQ-TCH-007:** Los profesores deben poder actualizar la información de sus classrooms (nombre, descripción, grado, materia).

**REQ-TCH-008:** El sistema debe actualizar automáticamente el campo updated_at con la fecha y hora actual al realizar cambios.

**REQ-TCH-009:** Solo el profesor propietario del classroom puede modificar su información.

#### 2.1.5 Eliminación de Classrooms
**REQ-TCH-010:** El sistema debe implementar soft delete, marcando el classroom como inactivo (is_active = false) en lugar de eliminación física.

**REQ-TCH-011:** Los classrooms inactivos no deben aparecer en listados por defecto pero deben preservar todos sus datos históricos.

**REQ-TCH-012:** Al eliminar un classroom, los estudiantes y sus submissions deben preservarse para mantener integridad de datos.

#### 2.1.6 Gestión de Estudiantes
**REQ-TCH-013:** El sistema debe permitir agregar estudiantes a un classroom de forma individual o en lote (batch).

**REQ-TCH-014:** El sistema debe listar estudiantes de un classroom con paginación.

**REQ-TCH-015:** Los profesores deben poder remover estudiantes de un classroom.

**REQ-TCH-016:** Al agregar estudiantes en lote, el sistema debe:
- Validar cada student_id
- Agregar solo los IDs válidos
- Reportar operaciones exitosas y fallidas por separado

**REQ-TCH-017:** Al remover un estudiante, el progreso y submissions del estudiante deben preservarse.

#### 2.1.7 Endpoints API
- POST /api/teacher/classrooms
- GET /api/teacher/classrooms
- GET /api/teacher/classrooms/:id
- PUT /api/teacher/classrooms/:id
- DELETE /api/teacher/classrooms/:id
- GET /api/teacher/classrooms/:id/students
- POST /api/teacher/classrooms/:id/students
- DELETE /api/teacher/classrooms/:id/students/:studentId

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas:**
- `educational_content.classrooms` → `apps/database/ddl/schemas/educational_content/tables/classrooms.sql`
  - **Propósito:** Almacena información de aulas virtuales
  - **Columnas clave:** `id`, `teacher_id`, `name`, `description`, `grade_level`, `subject`, `is_active`
- `educational_content.classroom_students` → `apps/database/ddl/schemas/educational_content/tables/classroom_students.sql`
  - **Propósito:** Relación muchos-a-muchos entre classrooms y estudiantes
  - **Columnas clave:** `classroom_id`, `student_id`, `enrolled_at`

🗄️ **Foreign Keys:**
- `classrooms.teacher_id` → `auth.users(id)`
- `classroom_students.classroom_id` → `classrooms(id)`
- `classroom_students.student_id` → `auth.users(id)`

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/teacher/controllers/classroom.controller.ts`
  - **Endpoints implementados:** POST, GET, PUT, DELETE /api/teacher/classrooms
  - **Endpoints students:** GET, POST, DELETE /api/teacher/classrooms/:id/students

💻 **Services:**
- `apps/backend/src/modules/teacher/services/classroom.service.ts`
  - **Métodos:** create(), findAll(), findOne(), update(), remove()
  - **Métodos students:** addStudent(), addStudentsBatch(), removeStudent(), getStudents()

💻 **DTOs:**
- `apps/backend/src/modules/teacher/dto/create-classroom.dto.ts`
- `apps/backend/src/modules/teacher/dto/update-classroom.dto.ts`
- `apps/backend/src/modules/teacher/dto/add-student.dto.ts`
- `apps/backend/src/modules/teacher/dto/add-students-batch.dto.ts`

💻 **Entities:**
- `apps/backend/src/modules/teacher/entities/classroom.entity.ts`
- `apps/backend/src/modules/teacher/entities/classroom-student.entity.ts`

💻 **Guards:**
- `apps/backend/src/shared/guards/roles.guard.ts` - Verifica rol admin_teacher
- `apps/backend/src/modules/teacher/guards/classroom-ownership.guard.ts` - Verifica ownership del classroom

### Frontend
🎨 **Componentes:**
- `apps/frontend/src/features/teacher/components/ClassroomList.tsx`
  - **Propósito:** Lista paginada de classrooms
- `apps/frontend/src/features/teacher/components/ClassroomCard.tsx`
  - **Propósito:** Tarjeta de classroom con estadísticas
- `apps/frontend/src/features/teacher/components/CreateClassroomModal.tsx`
  - **Propósito:** Modal para crear nuevo classroom
- `apps/frontend/src/features/teacher/components/EditClassroomModal.tsx`
  - **Propósito:** Modal para editar classroom
- `apps/frontend/src/features/teacher/components/ClassroomStudentsList.tsx`
  - **Propósito:** Lista de estudiantes del classroom
- `apps/frontend/src/features/teacher/components/AddStudentsModal.tsx`
  - **Propósito:** Modal para agregar estudiantes

🎨 **Hooks:**
- `apps/frontend/src/features/teacher/hooks/useClassrooms.ts`
  - **Métodos:** useCreateClassroom, useUpdateClassroom, useDeleteClassroom
- `apps/frontend/src/features/teacher/hooks/useClassroomStudents.ts`
  - **Métodos:** useAddStudent, useAddStudentsBatch, useRemoveStudent

🎨 **Types:**
- `apps/frontend/src/types/teacher.types.ts`
  - **Interfaces:** Classroom, ClassroomWithStats, ClassroomStudent, CreateClassroomDto, UpdateClassroomDto

🎨 **Services:**
- `apps/frontend/src/services/api/teacher.service.ts`
  - **Métodos API:** createClassroom(), getClassrooms(), updateClassroom(), deleteClassroom()
  - **Métodos students:** addStudent(), addStudentsBatch(), removeStudent(), getClassroomStudents()

---

## Matriz de Permisos

### Permisos de Classrooms

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| POST /api/teacher/classrooms | ✓ | ✓ | ✓ | Crea classroom propio |
| GET /api/teacher/classrooms | ✓ | ✓ | ✓ | Solo ve propios |
| GET /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| PUT /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /api/teacher/classrooms/:id | ✓ | ✓ | ✓ | Solo si es owner |
| GET /classrooms/:id/students | ✓ | ✓ | ✓ | Solo si es owner |
| POST /classrooms/:id/students | ✓ | ✓ | ✓ | Solo si es owner |
| DELETE /classrooms/:id/students/:sid | ✓ | ✓ | ✓ | Solo si es owner |

### Reglas de Ownership

**REQ-PERM-001:** Un profesor solo puede ver, modificar o eliminar sus propios classrooms (classroom.teacher_id === user.id).

---

## Casos de Uso

### Caso de Uso: Crear y Gestionar Classroom

**Actor Principal:** Profesor

**Precondiciones:**
- El profesor está autenticado en el sistema
- El profesor tiene rol 'teacher', 'admin_teacher' o 'super_admin'

**Flujo Principal:**
1. El profesor navega a la sección "My Classrooms"
2. El profesor hace clic en "Create Classroom"
3. El sistema muestra el formulario de creación
4. El profesor ingresa:
   - Nombre del classroom: "Mathematics 101"
   - Descripción: "Advanced mathematics for 6th grade"
   - Grade level: "6"
   - Subject: "Mathematics"
5. El profesor hace clic en "Create"
6. El sistema valida los datos
7. El sistema crea el classroom con teacher_id del profesor
8. El sistema muestra mensaje de éxito
9. El sistema redirige a la lista de classrooms

**Flujos Alternativos:**

**4a. Validación falla (nombre vacío):**
1. El sistema muestra error "Classroom name is required"
2. El profesor corrige el error
3. El flujo continúa en paso 5

**Postcondiciones:**
- El classroom es creado y visible en la lista del profesor
- El classroom está activo (is_active = true)

---

## Referencias

### Documentación Relacionada
- **Épica EP009:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **Historia HU-EP009-01:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-01-classroom-management.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/content_management/`

### Stack Tecnológico

#### Backend
- Framework: Node.js + TypeScript + Express
- Database: PostgreSQL 16
- ORM: Prisma (preferido) o TypeORM
- Validación: Joi o Zod
- Authentication: JWT (reusa EP001)

#### Frontend
- Framework: React + TypeScript
- State Management: Zustand
- UI Library: Tailwind CSS + shadcn/ui
- Forms: React Hook Form + Zod validation

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
