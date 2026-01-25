---
id: "US-PM-002b"
title: "Distribucion de Asignaciones"
type: "User Story"
status: "Done"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-001"
story_points: 6
budget: "$2,600 MXN"
sprint: "Sprint-6"
labels: ["portal-maestros", "assignments", "distribution", "notifications"]
created_date: "2025-11-02"
updated_date: "2026-01-25"
---

# US-PM-002b: Distribución de Asignaciones

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 2
**Story Points:** 6 SP
**Presupuesto:** $2,600 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** Done
**Relación:** Parte de US-PM-002 (dividida en a/b/c)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero distribuir assignments a uno o múltiples classrooms con fechas de entrega personalizadas para asignar trabajos a grupos específicos de estudiantes.

**Contexto:** Esta user story es parte de la funcionalidad de Gestión de Assignments, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en la distribución de assignments a classrooms y notificaciones.

## Criterios de Aceptación

### Funcionales

#### AC-01: Asignación a Classrooms
- [ ] **DADO** que tengo un assignment creado
- [ ] **CUANDO** envío POST /api/teacher/assignments/:id/assign con 3 classroom_ids
- [ ] **ENTONCES** se crean registros en assignment_classrooms para los 3 classrooms
- [ ] **Y** se calculan automáticamente los estudiantes asignados
- [ ] **Y** recibo confirmación con students_count por classroom

#### AC-02: Asignación Batch
- [ ] **DADO** que asigno a 5 classrooms simultáneamente
- [ ] **CUANDO** uno de los classroom_ids es inválido
- [ ] **ENTONCES** se asignan los válidos
- [ ] **Y** recibo lista de successful y failed assignments

#### AC-03: Override de Deadline por Classroom
- [ ] **DADO** que asigno un assignment con due_date específico
- [ ] **CUANDO** envío POST /assign con due_date diferente al deadline original
- [ ] **ENTONCES** el classroom recibe el due_date personalizado
- [ ] **Y** el deadline original se preserva para otros classrooms

#### AC-04: Validar Ownership de Classrooms
- [ ] **DADO** que intento asignar a un classroom que no es mío
- [ ] **CUANDO** envío POST /assign con classroom_id de otro profesor
- [ ] **ENTONCES** recibo error 403 Forbidden
- [ ] **Y** el mensaje indica "You don't own this classroom"

#### AC-05: Prevenir Asignación Duplicada
- [ ] **DADO** que un assignment ya está asignado a un classroom
- [ ] **CUANDO** intento asignarlo nuevamente al mismo classroom
- [ ] **ENTONCES** recibo error 409 Conflict
- [ ] **Y** el mensaje indica "Assignment already assigned to this classroom"

#### AC-06: Cálculo Automático de Estudiantes
- [ ] **DADO** que asigno a un classroom con 30 estudiantes
- [ ] **CUANDO** se completa la asignación
- [ ] **ENTONCES** el sistema calcula automáticamente students_count = 30
- [ ] **Y** se crean registros implícitos para cada estudiante

#### AC-07: Notificaciones Automáticas
- [ ] **DADO** que asigno un assignment a un classroom
- [ ] **CUANDO** la asignación se completa exitosamente
- [ ] **ENTONCES** se envían notificaciones a todos los estudiantes del classroom
- [ ] **Y** las notificaciones incluyen: assignment title, deadline, max_points

#### AC-08: Scheduling de Assignments
- [ ] **DADO** que asigno con due_date en el futuro
- [ ] **CUANDO** la fecha actual es anterior al due_date
- [ ] **ENTONCES** el assignment aparece como "upcoming" para estudiantes
- [ ] **Y** se activa automáticamente en la fecha programada

### No Funcionales

#### AC-09: Performance
- [ ] Response time p95 < 300ms para asignar a 5 classrooms
- [ ] Notificaciones enviadas async (job queue, no bloquear response)
- [ ] Batch assignment con transacción atómica

#### AC-10: Security
- [ ] Verificar ownership de assignment y classrooms
- [ ] Middleware verifyAssignmentOwnership
- [ ] Validación de UUIDs
- [ ] Rate limiting: 100 req/15min

#### AC-11: Validación
- [ ] Joi/Zod schemas para classroom_ids array
- [ ] Date validation para due_date (ISO 8601)
- [ ] Max batch size: 50 classrooms por request

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. POST /api/teacher/assignments/:id/assign**
- Descripción: Asignar assignment a uno o múltiples classrooms
- Auth: JWT Required (role: teacher)
- Middleware: verifyAssignmentOwnership

Request Body:
```typescript
{
  classroom_ids: string[];  // Array de UUIDs, max 50
  due_date?: string;        // Override deadline por classroom, ISO 8601
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    assignment_id: string,
    assigned_to: {
      classroom_id: string,
      classroom_name: string,
      students_count: number,
      assigned_at: string,
      due_date: string | null
    }[]
  }
}
```

**2. GET /api/teacher/assignments/:id/classrooms**
- Descripción: Ver a qué classrooms está asignado el assignment
- Auth: JWT Required (role: teacher)

Response (200 OK):
```typescript
{
  success: true,
  data: {
    classroom_id: string,
    classroom_name: string,
    students_count: number,
    assigned_at: string,
    due_date: string | null,
    submissions_count: number,
    graded_count: number
  }[]
}
```

#### Tareas Backend (4 SP)

1. Assignment Assignment Endpoints (2.5 SP)
   - POST /api/teacher/assignments/:id/assign (batch assign a classrooms)
   - GET /api/teacher/assignments/:id/classrooms
   - Validación de ownership de classrooms
   - Prevención de duplicados
   - Cálculo de students_count
   - Transacciones atómicas

2. Notification System (1 SP)
   - Service: NotificationService (email + in-app)
   - Job worker: SendAssignmentNotificationJob
   - Email template: assignment_notification.html
   - In-app notification creation
   - Tests unitarios notificaciones

3. Tests (0.5 SP)
   - Tests unitarios: AssignmentService
   - Tests de integración: 2 endpoints
   - Tests de batch operations

### Frontend

#### Componentes

- AssignToClassrooms (multi-select)
- ClassroomSelector con búsqueda
- DeadlineOverride (opcional por classroom)
- AssignmentDistribution (vista de classrooms asignados)

#### Tareas Frontend (2 SP)

1. Assignment Distribution UI (1.5 SP)
   - Modal AssignToClassrooms (multi-select)
   - Classroom selector con búsqueda
   - Due date override por classroom (opcional)
   - Bulk assign functionality
   - Success/error notifications

2. Assignment Details View (0.5 SP)
   - Componente AssignmentDistribution
   - Lista de classrooms asignados
   - Estadísticas por classroom (submissions, graded)
   - Botón para asignar a más classrooms

### Database

- Tabla: `assignment_classrooms`
- Composite PK: (assignment_id, classroom_id)
- Campos: assigned_at, due_date (override), students_count
- Indexes: assignment_id, classroom_id
- Foreign keys configuradas

## Dependencias

- **Requiere:**
  - US-PM-002a (Assignment CRUD) - assignments deben existir
  - US-PM-001a (Classroom Management) - classrooms deben existir
  - Notification Service - para notificaciones

- **Relacionada:**
  - US-PM-002a (Assignment CRUD)
  - US-PM-002c (Submissions View)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Notificaciones fallan (email down) | Media | Medio | Job queue con retry, fallback a in-app only |
| Performance con batch de 50 classrooms | Media | Alto | Limitar batch size, transacciones, async notifications |
| UX confusa para override deadline | Alta | Bajo | Tooltip explicativo, preview antes de asignar |
| Cálculo incorrecto de students_count | Baja | Medio | Tests exhaustivos, recalcular si classroom cambia |

## Testing

### Unit Tests
- AssignmentService (assign): 6 tests
- NotificationService: 4 tests
- Validación de duplicados: 3 tests

### Integration Tests
- 2 endpoints API
- Batch assign a 10 classrooms
- Override de deadline

### E2E Tests
- Flujo: Login → Create assignment → Assign to 3 classrooms → Verify notifications

## Métricas de Éxito

- 2 endpoints funcionando
- Test coverage >80%
- Response time p95 <300ms
- 100% notificaciones enviadas
- <3% error rate en asignación

## Notas

- ✅ Archivo modularizado desde US-PM-002-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Distribución de assignments a classrooms
- 🔗 Complementa con US-PM-002a (CRUD) y US-PM-002c (Submissions)
- ⚠️ IMPORTANTE: Notificaciones async para no bloquear response

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
