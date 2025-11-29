# US-PM-002a: CRUD de Asignaciones

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 2
**Story Points:** 10 SP
**Presupuesto:** $4,400 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-002 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero crear, editar y eliminar assignments (tareas, exámenes, proyectos) con rich text editor y archivos adjuntos para asignar trabajos a mis estudiantes.

**Contexto:** Esta user story es parte de la funcionalidad de Gestión de Assignments, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en las operaciones CRUD de assignments incluyendo rich text y recursos.

## Criterios de Aceptación

### Funcionales

#### AC-01: Creación de Assignment
- [ ] **DADO** que soy un profesor autenticado
- [ ] **CUANDO** envío POST /api/teacher/assignments con título y tipo válidos
- [ ] **ENTONCES** se crea el assignment con teacher_id = mi user_id
- [ ] **Y** recibo respuesta 201 Created con los datos del assignment
- [ ] **Y** el assignment aparece en mi lista con status='draft'

#### AC-02: Tipos de Assignment Soportados
- [ ] **DADO** que creo un assignment
- [ ] **CUANDO** selecciono type='quiz'
- [ ] **ENTONCES** el assignment se crea con tipo quiz
- [ ] **Y** los tipos soportados son: quiz, homework, project, exam, discussion

#### AC-03: Validación de Puntos
- [ ] **DADO** que intento crear un assignment
- [ ] **CUANDO** envío max_points <= 0 o max_points > 1000
- [ ] **ENTONCES** recibo error 400 Bad Request
- [ ] **Y** el mensaje indica "Points must be between 1 and 1000"

#### AC-04: Deadline Validation
- [ ] **DADO** que creo un assignment con deadline
- [ ] **CUANDO** envío deadline en el pasado
- [ ] **ENTONCES** recibo warning (no error) indicando "Deadline is in the past"
- [ ] **Y** el assignment se crea igual (permitir casos especiales)

#### AC-05: Rich Text en Description
- [ ] **DADO** que creo un assignment con description
- [ ] **CUANDO** envío HTML con formato (bold, lists, links)
- [ ] **ENTONCES** el HTML se sanitiza (XSS prevention)
- [ ] **Y** se almacena correctamente en la BD
- [ ] **Y** se renderiza correctamente en el frontend

#### AC-06: Listado con Filtros
- [ ] **DADO** que tengo 100 assignments de diferentes tipos
- [ ] **CUANDO** solicito GET /api/teacher/assignments?type=quiz&status=active
- [ ] **ENTONCES** recibo solo assignments de tipo quiz activos
- [ ] **Y** la paginación funciona correctamente

#### AC-07: Search Functionality
- [ ] **DADO** que tengo assignments con títulos diversos
- [ ] **CUANDO** solicito GET /api/teacher/assignments?search=Math%20Chapter
- [ ] **ENTONCES** recibo assignments que contienen "Math Chapter" en título o description
- [ ] **Y** la búsqueda es case-insensitive

#### AC-08: Detalles con Estadísticas
- [ ] **DADO** que solicito GET /api/teacher/assignments/:id
- [ ] **ENTONCES** recibo datos del assignment
- [ ] **Y** recibo estadísticas: total_assigned, submissions_count, graded_count, avg_score, completion_rate

#### AC-09: Actualización Condicional
- [ ] **DADO** que un assignment NO tiene submissions
- [ ] **CUANDO** envío PUT /api/teacher/assignments/:id
- [ ] **ENTONCES** el assignment se actualiza correctamente
- [ ] **DADO** que un assignment TIENE submissions
- [ ] **CUANDO** intento actualizarlo
- [ ] **ENTONCES** recibo error 422 "Cannot update assignment with existing submissions"

#### AC-10: Soft Delete Validation
- [ ] **DADO** que un assignment tiene submissions
- [ ] **CUANDO** envío DELETE /api/teacher/assignments/:id
- [ ] **ENTONCES** is_active = false
- [ ] **Y** las submissions se preservan (no eliminar)
- [ ] **Y** el assignment no aparece en listados por defecto

### No Funcionales

#### AC-11: Performance
- [ ] Response time p95 < 200ms para CRUD operations
- [ ] Listado con 1000+ assignments renderiza en <2s
- [ ] HTML sanitization no impacta performance

#### AC-12: Security
- [ ] Solo el teacher owner puede modificar su assignment
- [ ] Middleware verifyAssignmentOwnership implementado
- [ ] HTML sanitization en description/instructions (prevenir XSS)
- [ ] Rate limiting: 100 req/15min por IP

#### AC-13: Validación
- [ ] Joi/Zod schemas implementados
- [ ] Enum validation para type (solo valores permitidos)
- [ ] Date validation para deadline (ISO 8601 format)
- [ ] Max length: title (255), description (10,000)

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. POST /api/teacher/assignments**
- Descripción: Crear nuevo assignment
- Auth: JWT Required (role: teacher)
- Rate Limit: 100 req/15min

Request Body:
```typescript
{
  title: string;              // Required, 1-255 chars
  description?: string;       // Optional, rich text HTML
  type: 'quiz' | 'homework' | 'project' | 'exam' | 'discussion';
  max_points: number;         // Required, > 0
  deadline?: string;          // Optional, ISO 8601 datetime
  instructions?: string;      // Optional, rich text HTML
  resources?: {               // Optional, attached resources
    url?: string;
    file_id?: string;
  }[];
}
```

Response (201 Created):
```typescript
{
  success: true,
  data: {
    id: string,
    teacher_id: string,
    title: string,
    description: string | null,
    type: string,
    max_points: number,
    deadline: string | null,
    instructions: string | null,
    resources: object[] | null,
    is_active: boolean,
    created_at: string,
    updated_at: string
  }
}
```

**2. GET /api/teacher/assignments**
- Descripción: Listar assignments del profesor con filtros
- Query Params:
  - `page`: number (default: 1)
  - `limit`: number (10, 25, 50, 100)
  - `status`: 'active' | 'draft' | 'archived'
  - `type`: 'quiz' | 'homework' | 'project' | 'exam' | 'discussion'
  - `classroom_id`: string (UUID)
  - `search`: string (buscar en title/description)

**3. GET /api/teacher/assignments/:id**
- Descripción: Detalles del assignment con estadísticas

**4. PUT /api/teacher/assignments/:id**
- Descripción: Actualizar assignment (solo si no tiene submissions)

**5. DELETE /api/teacher/assignments/:id**
- Descripción: Soft delete (is_active = false)

#### Tareas Backend (6 SP)

1. Setup & Infrastructure (1 SP)
   - Estructura de carpetas
   - Configurar HTML sanitizer (DOMPurify backend)
   - Configurar Joi/Zod schemas para assignments

2. Database (0.5 SP)
   - Verificar schema assignments
   - Crear indexes: `idx_assignments_teacher_id`, `idx_assignments_type`, `idx_assignments_is_active`
   - Migration scripts

3. Middleware (0.5 SP)
   - Implementar `verifyAssignmentOwnership` middleware
   - Tests unitarios middleware

4. Assignment CRUD (4 SP)
   - POST /api/teacher/assignments (con HTML sanitization)
   - GET /api/teacher/assignments (con filtros: type, status, classroom_id, search)
   - GET /api/teacher/assignments/:id (con stats)
   - PUT /api/teacher/assignments/:id (con validación condicional)
   - DELETE /api/teacher/assignments/:id (soft delete)
   - Tests unitarios CRUD

### Frontend

#### Componentes

- AssignmentList con filtros y search
- AssignmentCard
- CreateAssignmentForm con Rich Text Editor
- EditAssignmentForm (con validación condicional)
- Modal de confirmación para delete
- AssignmentDetails con stats

#### Tareas Frontend (4 SP)

1. Setup & Store (0.5 SP)
   - Zustand store: assignmentStore
   - API client functions
   - TypeScript types/interfaces

2. Assignment List (1.5 SP)
   - Componente AssignmentList
   - Componente AssignmentCard
   - Filtros (type, status, classroom, search)
   - Paginación
   - Loading skeletons

3. Create/Edit Forms (2 SP)
   - Formulario CreateAssignmentForm
   - Formulario EditAssignmentForm
   - Rich Text Editor integration (TipTap recomendado)
   - Validación Zod schemas
   - React Hook Form
   - File upload (resources)

### Database

- Tabla: `assignments`
- Indexes: teacher_id, type, is_active
- Foreign keys configuradas
- Triggers para updated_at

## Dependencias

- **Requiere:**
  - HU-EP009-01 (Classroom Management) - para filtrar por classroom
  - EP001 (Auth System) - JWT auth

- **Relacionada:**
  - US-PM-002b (Assignment Distribution)
  - US-PM-002c (Submissions View)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Rich Text Editor complejo | Alta | Medio | Usar TipTap (simple, TypeScript-first), limitar features |
| Performance al listar 10K+ assignments | Media | Alto | Paginación obligatoria, indexes en BD, considerar ElasticSearch para search |
| XSS via rich text | Alta | Crítico | HTML sanitization estricta (DOMPurify), CSP headers |
| Actualización de assignment con submissions | Media | Medio | Validar en backend, mostrar warning en frontend |

## Testing

### Unit Tests
- AssignmentService: 8 tests
- Validación HTML sanitization: 3 tests
- Middleware: 3 tests

### Integration Tests
- 5 endpoints API
- Tests de filtros y búsqueda

### E2E Tests
- Flujo: Login → Create assignment con rich text → Edit → Delete

## Métricas de Éxito

- 5 endpoints funcionando
- Test coverage >80% backend, >70% frontend
- Response time p95 <200ms
- HTML sanitization 100% efectiva (zero XSS)
- 100% profesores pueden crear assignments
- Tiempo promedio de creación <3 minutos

## Notas de Implementación

### Rich Text Editor
**Recomendación: TipTap**
```typescript
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';

const Editor = () => {
  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Start typing...</p>',
  });

  return <EditorContent editor={editor} />;
};
```

### HTML Sanitization (Backend)
```typescript
import DOMPurify from 'isomorphic-dompurify';

const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li', 'a'],
    ALLOWED_ATTR: ['href', 'target'],
  });
};
```

## Tareas de Implementación

### Backend (20h = 50%)

#### 1. Setup & Infrastructure (4h)
- [x] Estructura de carpetas: src/modules/teacher/assignments
- [x] Configurar DOMPurify para HTML sanitization
- [x] Configurar Joi/Zod schemas para assignments
- [ ] File upload middleware con Multer (resources)

#### 2. Database & Migrations (2h)
- [x] Verificar schema de tabla assignments
- [x] Crear índice idx_assignments_teacher_id_type
- [ ] Crear índice idx_assignments_is_active
- [ ] Migration para columna resources (JSONB)

#### 3. Middleware (2h)
- [x] Implementar verifyAssignmentOwnership middleware
- [ ] HTML sanitization middleware para description/instructions
- [ ] Tests unitarios middleware (3 tests)

#### 4. Assignment CRUD Endpoints (12h)
- [x] POST /api/teacher/assignments: crear con rich text
- [x] Implementar HTML sanitization en backend
- [ ] GET /api/teacher/assignments: listar con filtros (type, status, classroom_id)
- [ ] Implementar search en title/description con ILIKE
- [ ] GET /api/teacher/assignments/:id: detalles con stats
- [ ] PUT /api/teacher/assignments/:id: actualizar con validación condicional
- [ ] DELETE /api/teacher/assignments/:id: soft delete
- [ ] Tests unitarios CRUD (8 tests)

### Frontend (12h = 30%)

#### 5. Setup & Store (2h)
- [x] Zustand store: assignmentStore con actions CRUD
- [x] API client: assignmentAPI.ts con 5 métodos
- [ ] TypeScript interfaces: Assignment, AssignmentFilters
- [ ] Error handling con toast notifications

#### 6. Assignment List (4.8h)
- [ ] Componente AssignmentList con filtros
- [ ] AssignmentCard con type badge
- [ ] Filtros: type (dropdown), status, classroom
- [ ] Search bar para title/description
- [ ] Paginación component
- [ ] Loading skeletons

#### 7. Create/Edit Forms (5.2h)
- [ ] Formulario CreateAssignmentForm con React Hook Form
- [ ] Integrar TipTap rich text editor para description/instructions
- [ ] Configurar TipTap extensions: StarterKit, Bold, Italic, List
- [ ] File upload para resources (drag-and-drop)
- [ ] Validación Zod: max_points > 0, deadline ISO format
- [ ] Modal de confirmación para delete
- [ ] Success/error notifications

### Testing & QA (6h = 15%)

#### 8. Unit Tests (3h)
- [ ] Backend: AssignmentService tests (8 tests)
- [ ] Backend: HTML sanitization tests (3 tests)
- [ ] Frontend: assignmentStore tests (4 tests)

#### 9. Integration Tests (2h)
- [ ] Test suite: 5 endpoints API
- [ ] Test: filtros y búsqueda combinados
- [ ] Test: XSS prevention con HTML malicioso

#### 10. E2E Tests (1h)
- [ ] Flujo: Login → Create assignment con rich text → Edit → Delete
- [ ] Verificar HTML rendering correcto

### Deploy & Documentación (2h = 5%)

#### 11. Deploy (1.2h)
- [ ] Build y deploy a staging
- [ ] Smoke tests: crear assignment con file upload
- [ ] Verificar CSP headers para XSS prevention

#### 12. Documentación (0.8h)
- [ ] Actualizar API docs: 5 endpoints nuevos
- [ ] README: instrucciones para TipTap editor
- [ ] CHANGELOG entry para US-PM-002a

**Progreso Global:** 50% completado (20h de 40h)

## Implementación Frontend - Hooks

> **Actualizado:** 2025-11-29

### Hook Principal: `useAssignments`

**Ubicación:** `apps/frontend/src/apps/teacher/hooks/useAssignments.ts`

```typescript
interface UseAssignmentsReturn {
  assignments: Assignment[];
  exercises: Exercise[];
  loading: boolean;
  error: Error | null;
  getAssignmentById: (id: string) => Promise<Assignment>;
  createAssignment: (data: CreateAssignmentDto) => Promise<Assignment>;
  updateAssignment: (id: string, data: UpdateAssignmentDto) => Promise<Assignment>;
  deleteAssignment: (id: string) => Promise<void>;
  getSubmissions: (assignmentId: string) => Promise<Submission[]>;
  gradeSubmission: (submissionId: string, data: GradeSubmissionDto) => Promise<Submission>;
  refresh: () => Promise<void>;
}
```

**Uso en páginas:**
- `TeacherAssignments.tsx` - Gestión principal de asignaciones
- Integrado con `useClassrooms` para selección de classroom

### Hook Complementario: `useGrading`

**Ubicación:** `apps/frontend/src/apps/teacher/hooks/useGrading.ts`

Maneja la calificación de submissions con queue de pendientes.

### API Service: `assignmentsApi`

**Ubicación:** `apps/frontend/src/services/api/teacher/assignmentsApi.ts`

| Método | Función | Endpoint Backend |
|--------|---------|------------------|
| `getAssignments(filters)` | Listar asignaciones | `GET /assignments` |
| `getAssignmentById(id)` | Detalle de asignación | `GET /assignments/:id` |
| `createAssignment(data)` | Crear asignación | `POST /assignments` |
| `updateAssignment(id, data)` | Actualizar asignación | `PUT /assignments/:id` |
| `deleteAssignment(id)` | Eliminar asignación | `DELETE /assignments/:id` |
| `getAssignmentSubmissions(id)` | Submissions de asignación | `GET /assignments/:id/submissions` |
| `gradeSubmission(id, data)` | Calificar submission | `POST /assignments/submissions/:id/grade` |
| `getAvailableExercises()` | Ejercicios disponibles | `GET /assignments/exercises` |

### Correcciones Recientes (2025-11-29)

- ✅ Corregido uso de `classroomId` hardcodeado → ahora usa `useClassrooms` hook
- ✅ Agregado estado de "sin classrooms disponibles"
- ✅ Cálculo dinámico de `maxScore` desde ejercicios del assignment

---

## Notas

- ✅ Archivo modularizado desde US-PM-002-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- ✅ **Hooks documentados (2025-11-29)**
- 📋 Enfoque: CRUD de assignments con rich text
- 🔗 Complementa con US-PM-002b (Distribution) y US-PM-002c (Submissions)

---

**Última actualización:** 2025-11-29
**Versión:** 1.1 (Modular + Hooks)
**Estado:** ✅ IMPLEMENTADO
