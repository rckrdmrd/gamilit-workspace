# US-PM-001b: Gestión de Estudiantes en Aulas

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 1
**Story Points:** 8 SP
**Presupuesto:** $3,500 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-001 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero agregar y remover estudiantes de mis classrooms (aulas virtuales) para gestionar la matrícula de cada clase de forma eficiente, incluyendo operaciones batch.

**Contexto:** Esta user story es parte de la funcionalidad de Gestión de Classrooms, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca específicamente en la gestión de estudiantes dentro de las aulas virtuales.

## Criterios de Aceptación

### Funcionales

#### AC-01: Listar Estudiantes del Classroom
- [ ] **DADO** que soy el owner de un classroom con 30 estudiantes
- [ ] **CUANDO** solicito GET /api/teacher/classrooms/:id/students
- [ ] **ENTONCES** recibo lista paginada de estudiantes
- [ ] **Y** cada estudiante incluye: id, name, email, enrolled_at
- [ ] **Y** la paginación funciona correctamente

#### AC-02: Agregar Estudiante Individual
- [ ] **DADO** que soy el owner del classroom
- [ ] **CUANDO** envío POST /api/teacher/classrooms/:id/students con 1 student_id
- [ ] **ENTONCES** se crea registro en classroom_students
- [ ] **Y** enrolled_at = NOW()
- [ ] **Y** recibo confirmación con datos del estudiante agregado

#### AC-03: Agregar Estudiantes en Batch
- [ ] **DADO** que soy el owner del classroom
- [ ] **CUANDO** envío POST /api/teacher/classrooms/:id/students con array de 30 student_ids
- [ ] **ENTONCES** se agregan todos los estudiantes válidos
- [ ] **Y** recibo confirmación con lista de estudiantes agregados
- [ ] **Y** el proceso se ejecuta en transacción

#### AC-04: Validación en Batch Add
- [ ] **DADO** que envío array de 30 student_ids
- [ ] **CUANDO** algunos IDs son inválidos o duplicados
- [ ] **ENTONCES** se agregan solo los válidos
- [ ] **Y** recibo lista de successful y failed operations
- [ ] **Y** el mensaje indica razón del fallo (invalid ID, already enrolled, etc.)

#### AC-05: Prevenir Duplicados
- [ ] **DADO** que un estudiante ya está en el classroom
- [ ] **CUANDO** intento agregarlo nuevamente
- [ ] **ENTONCES** recibo error 409 Conflict
- [ ] **Y** el mensaje indica "Student already enrolled in classroom"

#### AC-06: Remover Estudiante
- [ ] **DADO** que soy el owner del classroom
- [ ] **CUANDO** envío DELETE /api/teacher/classrooms/:id/students/:studentId
- [ ] **ENTONCES** se elimina el registro de classroom_students
- [ ] **Y** el progreso del estudiante se preserva (no eliminar submissions)
- [ ] **Y** recibo confirmación de eliminación

#### AC-07: Preservar Datos al Remover
- [ ] **DADO** que un estudiante tiene 10 submissions en el classroom
- [ ] **CUANDO** lo remuevo del classroom
- [ ] **ENTONCES** las submissions NO se eliminan
- [ ] **Y** los datos históricos se preservan
- [ ] **Y** el estudiante puede ser re-agregado sin perder historial

### No Funcionales

#### AC-08: Performance
- [ ] Response time p95 < 200ms para GET students
- [ ] Response time p95 < 300ms para POST batch add (30 estudiantes)
- [ ] Batch operations con transacción atómica
- [ ] Indexes en: classroom_id, student_id en classroom_students

#### AC-09: Security
- [ ] Solo el teacher owner puede modificar estudiantes del classroom
- [ ] Verificar que student_ids existen en tabla users con role='student'
- [ ] Rate limiting: 100 req/15min por IP
- [ ] Validación de UUIDs

#### AC-10: Validación
- [ ] Joi/Zod schemas para student_ids array
- [ ] Validar UUIDs con regex o validator library
- [ ] Max batch size: 100 estudiantes por request
- [ ] Validar que classroom existe y pertenece al teacher

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/classrooms/:id/students**
- Descripción: Listar estudiantes del classroom con paginación
- Auth: JWT Required (role: teacher)
- Middleware: verifyClassroomOwnership

Query Params:
```typescript
{
  page?: number;        // default: 1
  limit?: number;       // 10, 25, 50, 100
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    id: string,
    name: string,
    email: string,
    enrolled_at: string
  }[],
  meta: {
    total: number,
    page: number,
    limit: number,
    totalPages: number
  }
}
```

**2. POST /api/teacher/classrooms/:id/students**
- Descripción: Agregar estudiantes (individual o batch)
- Auth: JWT Required (role: teacher)
- Middleware: verifyClassroomOwnership

Request Body:
```typescript
{
  student_ids: string[];  // Array de UUIDs, max 100
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    classroom_id: string,
    added: {
      student_id: string,
      student_name: string,
      enrolled_at: string
    }[],
    failed: {
      student_id: string,
      reason: 'invalid_id' | 'already_enrolled' | 'not_found'
    }[]
  }
}
```

**3. DELETE /api/teacher/classrooms/:id/students/:studentId**
- Descripción: Remover estudiante del classroom
- Auth: JWT Required (role: teacher)
- Middleware: verifyClassroomOwnership

Response (200 OK):
```typescript
{
  success: true,
  data: {
    classroom_id: string,
    student_id: string,
    message: 'Student removed from classroom'
  }
}
```

#### Tareas Backend (3 SP)

1. Student Management Endpoints (2 SP)
   - GET /api/teacher/classrooms/:id/students
   - POST /api/teacher/classrooms/:id/students (batch add)
   - DELETE /api/teacher/classrooms/:id/students/:studentId
   - Validación de UUIDs y duplicados
   - Transacciones para batch operations

2. Tests (1 SP)
   - Tests unitarios: StudentManagementService (5 tests)
   - Tests de integración: 3 endpoints
   - Tests de batch operations con casos edge

### Frontend

#### Componentes

- StudentList (dentro de ClassroomDetails)
- AddStudentsForm (con multi-select)
- StudentCard (card individual)
- Confirmación para remover estudiante

#### Tareas Frontend (3 SP)

1. Classroom Details View (1.5 SP)
   - Componente ClassroomDetails (vista principal)
   - StudentList dentro de details
   - Paginación de estudiantes
   - Loading states

2. Add/Remove Students (1.5 SP)
   - AddStudentsForm (multi-select component)
   - Search/filter estudiantes disponibles
   - Modal de confirmación para remove
   - Bulk add functionality
   - Success/error notifications

### Database

- Tabla: `classroom_students`
- Composite PK: (classroom_id, student_id)
- Indexes: classroom_id, student_id
- Foreign keys: classroom_id → classrooms(id), student_id → users(id)
- Campo: enrolled_at (timestamp)

## Dependencias

- **Requiere:**
  - US-PM-001a (Classroom CRUD) - classrooms deben existir
  - EP002 (Student Module) - tabla users con role='student'

- **Relacionada:** US-PM-001a (Classroom CRUD) - parte hermana

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Performance con batch de 100+ estudiantes | Media | Medio | Limitar batch size a 100, usar transacciones, indexes |
| UX confusa para multi-select | Alta | Bajo | Usar library probada (react-select), prototipo previo |
| Conflicto con EP002 (Student module) | Baja | Alto | Coordinar con equipo EP002, usar IDs dummy si es necesario |
| Datos perdidos al remover | Media | Alto | Tests exhaustivos, advertencia antes de remover |

## Testing

### Unit Tests
- StudentManagementService: 5 tests
- Validación de batch operations: 3 tests

### Integration Tests
- 3 endpoints API
- Batch add con 50 estudiantes
- Validación de duplicados

### E2E Tests
- Flujo: Login → Open classroom → Add 3 students → Remove 1 student

## Métricas de Éxito

- 3 endpoints funcionando con 100% uptime
- Test coverage >80% (backend), >70% (frontend)
- Response time p95 <300ms para batch operations
- <5% error rate en agregar estudiantes
- 100% preservación de datos al remover estudiantes

## Tareas de Implementación

### Backend (16h = 50%)

#### 1. Student Management Endpoints (10h)
- [x] GET /api/teacher/classrooms/:id/students: listar estudiantes
- [x] Implementar paginación (limit, offset)
- [x] POST /api/teacher/classrooms/:id/students: agregar estudiantes
- [ ] Validación de UUIDs con validator library
- [ ] Batch add: transacción atómica para array de student_ids
- [ ] Prevención de duplicados con ON CONFLICT
- [ ] DELETE /api/teacher/classrooms/:id/students/:studentId: remover
- [ ] Verificar preservación de submissions al remover

#### 2. Validación & Security (3h)
- [x] Joi/Zod schema para student_ids array (max 100)
- [ ] Middleware verifyClassroomOwnership
- [ ] Verificar student_ids existen en users con role='student'
- [ ] Rate limiting: 100 req/15min
- [ ] Tests de seguridad: intentar agregar estudiante de otro profesor

#### 3. Tests Backend (3h)
- [ ] Unit tests: StudentManagementService (5 tests)
- [ ] Test: batch add con 30 estudiantes
- [ ] Test: validación de duplicados
- [ ] Integration tests: 3 endpoints API
- [ ] Test: preservación de submissions al remover

### Frontend (9.6h = 30%)

#### 4. Classroom Details View (4.8h)
- [x] Componente ClassroomDetails: layout principal
- [x] StudentList: tabla de estudiantes paginada
- [ ] Loading states con skeletons
- [ ] Empty state cuando classroom no tiene estudiantes
- [ ] Botón "Add Students" → abrir modal

#### 5. Add/Remove Students (4.8h)
- [ ] AddStudentsForm: multi-select con react-select
- [ ] Search/filter estudiantes disponibles
- [ ] Bulk add functionality: checkbox para seleccionar múltiples
- [ ] Modal de confirmación para remove con advertencia
- [ ] Success notifications: "3 students added successfully"
- [ ] Error handling: mostrar lista de failed operations

### Testing & QA (4.8h = 15%)

#### 6. Unit Tests (2.4h)
- [ ] Backend: StudentManagementService (5 tests)
- [ ] Frontend: StudentList component tests (3 tests)
- [ ] Test: batch operations con casos edge

#### 7. Integration Tests (1.6h)
- [ ] Test suite: 3 endpoints API
- [ ] Test: agregar 50 estudiantes en batch
- [ ] Test: validación de duplicados y errores

#### 8. E2E Tests (0.8h)
- [ ] Flujo: Login → Open classroom → Add 3 students → Remove 1
- [ ] Verificar submissions preservadas

### Deploy & Documentación (1.6h = 5%)

#### 9. Deploy (1h)
- [ ] Build y deploy a staging
- [ ] Smoke tests: agregar/remover estudiante
- [ ] Verificar transacciones batch en producción

#### 10. Documentación (0.6h)
- [ ] Actualizar API docs: 3 endpoints nuevos
- [ ] README: instrucciones para gestión de estudiantes
- [ ] CHANGELOG entry para US-PM-001b

**Progreso Global:** 50% completado (16h de 32h)

## Notas

- ✅ Archivo modularizado desde US-PM-001-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Gestión de estudiantes en classrooms
- 🔗 Complementa con US-PM-001a para CRUD de classrooms
- ⚠️ IMPORTANTE: Preservar submissions al remover estudiantes

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
