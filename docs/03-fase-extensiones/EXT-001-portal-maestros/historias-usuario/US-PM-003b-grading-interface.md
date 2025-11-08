# US-PM-003b: Interfaz de Calificación

**Épica:** EXT-001 - Portal de Maestros Completo
**Sprint:** Mes 3, Semana 3
**Story Points:** 8 SP
**Presupuesto:** $3,500 MXN
**Prioridad:** Alta (Extensión Fase 3)
**Estado:** 📋 Planificada
**Relación:** Parte de US-PM-003 (dividida en a/b)

## Descripción

Como profesor autenticado en la plataforma GAMILIT, quiero calificar submissions de estudiantes con puntos, feedback detallado y notificaciones automáticas para evaluar su desempeño académico y guiar su aprendizaje.

**Contexto:** Esta user story es parte de la funcionalidad de Sistema de Calificación, dividida para cumplir con PF-001 (límite 400 líneas). Se enfoca en la interfaz y proceso de calificación con rúbricas y retroalimentación.

## Criterios de Aceptación

### Funcionales

#### AC-01: Ver Detalles de Submission
- [ ] **DADO** que selecciono una submission para calificar
- [ ] **CUANDO** solicito GET /api/teacher/grading/:submissionId
- [ ] **ENTONCES** recibo detalles completos: assignment, student, content, attachments
- [ ] **Y** veo el historial de previous_submissions si existen

#### AC-02: Calificar con Puntos Válidos
- [ ] **DADO** que un assignment tiene max_points=100
- [ ] **CUANDO** envío POST /grade con points_earned=85
- [ ] **ENTONCES** la submission se califica con 85 puntos
- [ ] **Y** status cambia a 'graded'
- [ ] **Y** graded_at = NOW()
- [ ] **Y** graded_by = teacher_id

#### AC-03: Validar Rango de Puntos
- [ ] **DADO** que intento calificar con points_earned=110 (max_points=100)
- [ ] **ENTONCES** recibo error 400 Bad Request
- [ ] **Y** el mensaje indica "Points cannot exceed max points (100)"
- [ ] **DADO** que intento calificar con points_earned=-10
- [ ] **ENTONCES** recibo error 400 "Points cannot be negative"

#### AC-04: Agregar Feedback con Rich Text
- [ ] **DADO** que califico una submission
- [ ] **CUANDO** envío feedback con HTML: "<p>Good work! <strong>Improve</strong> calculations.</p>"
- [ ] **ENTONCES** el feedback se sanitiza (XSS prevention)
- [ ] **Y** se almacena correctamente
- [ ] **Y** se renderiza correctamente en frontend

#### AC-05: Re-grading (Update Grade)
- [ ] **DADO** que una submission ya está graded
- [ ] **CUANDO** envío POST /grade con nuevos puntos
- [ ] **ENTONCES** se actualiza la calificación
- [ ] **Y** se crea un audit log del cambio (old_points → new_points)
- [ ] **Y** se notifica al estudiante del cambio

#### AC-06: Status: Needs Revision
- [ ] **DADO** que califico con status='needs_revision'
- [ ] **CUANDO** envío POST /grade
- [ ] **ENTONCES** la submission status = 'needs_revision'
- [ ] **Y** el estudiante puede re-enviar (permitir re-submission)
- [ ] **Y** se notifica al estudiante con el feedback

#### AC-07: Notificación Automática
- [ ] **DADO** que califico con notify_student=true
- [ ] **CUANDO** envío POST /grade
- [ ] **ENTONCES** se envía notificación al estudiante (email + in-app)
- [ ] **Y** la notificación incluye: assignment, puntos, feedback
- [ ] **Y** recibo confirmación notification_sent=true

#### AC-08: Feedback sin Calificación
- [ ] **DADO** que quiero agregar feedback sin calificar aún
- [ ] **CUANDO** envío POST /feedback con texto
- [ ] **ENTONCES** se agrega/actualiza el feedback
- [ ] **Y** la calificación (points_earned) permanece null
- [ ] **Y** status permanece 'pending'

#### AC-09: Access Control
- [ ] **DADO** que soy profesor de Math 101
- [ ] **CUANDO** intento calificar submission de Science 201 (otro profesor)
- [ ] **ENTONCES** recibo error 403 Forbidden
- [ ] **Y** el mensaje indica "You don't have access to this submission"

### No Funcionales

#### AC-10: Performance
- [ ] Response time p95 < 300ms para POST /grade (incluye notificación)
- [ ] Notificaciones enviadas async (job queue, no bloquear response)
- [ ] Audit log eficiente (no impactar performance)

#### AC-11: Security
- [ ] Verificar que teacher tiene acceso a la submission (via classroom)
- [ ] HTML sanitization en feedback
- [ ] Audit log de cambios de calificación (quién, cuándo, old/new values)
- [ ] Rate limiting: 100 req/15min

#### AC-12: Validación
- [ ] Joi/Zod schemas para puntos y feedback
- [ ] Max length feedback: 2000 caracteres
- [ ] Validar que submission.assignment pertenece al teacher

## Especificaciones Técnicas

### Backend

#### Endpoints API

**1. GET /api/teacher/grading/:submissionId**
- Descripción: Ver detalles completos de una submission para calificar
- Auth: JWT Required (role: teacher)

Response (200 OK):
```typescript
{
  success: true,
  data: {
    id: string,
    assignment: {
      id: string,
      title: string,
      description: string,
      type: string,
      max_points: number,
      instructions: string
    },
    student: {
      id: string,
      name: string,
      email: string,
      avatar_url: string | null
    },
    classroom: {
      id: string,
      name: string
    },
    content: string,               // Student's work
    attachments: {
      id: string,
      filename: string,
      url: string,
      size: number
    }[],
    submitted_at: string,
    deadline: string,
    late: boolean,
    status: 'pending' | 'graded' | 'pending_review' | 'needs_revision',
    points_earned: number | null,
    feedback: string | null,
    graded_at: string | null,
    graded_by: string | null,
    previous_submissions: {       // History
      id: string,
      submitted_at: string,
      points_earned: number | null
    }[]
  }
}
```

**2. POST /api/teacher/grading/:submissionId/grade**
- Descripción: Calificar una submission con puntos y feedback
- Auth: JWT Required (role: teacher)

Request Body:
```typescript
{
  points_earned: number;         // Required, 0 <= points <= assignment.max_points
  feedback?: string;             // Optional, rich text HTML, max 2000 chars
  status?: 'graded' | 'pending_review' | 'needs_revision';  // default: graded
  notify_student?: boolean;      // default: true
}
```

Response (200 OK):
```typescript
{
  success: true,
  data: {
    submission_id: string,
    points_earned: number,
    feedback: string | null,
    status: string,
    graded_at: string,
    graded_by: string,
    notification_sent: boolean
  }
}
```

**3. POST /api/teacher/grading/:submissionId/feedback**
- Descripción: Agregar o actualizar feedback sin cambiar calificación
- Auth: JWT Required (role: teacher)

Request Body:
```typescript
{
  feedback: string;              // Required, rich text HTML, max 2000 chars
  notify_student?: boolean;      // default: false
}
```

#### Tareas Backend (5 SP)

1. Setup & Infrastructure (1 SP)
   - Configurar job queue (Bull/BullMQ) para notificaciones
   - HTML sanitizer setup
   - Joi/Zod schemas

2. Grading Endpoints (2.5 SP)
   - GET /api/teacher/grading/:submissionId (con detalles completos)
   - POST /api/teacher/grading/:submissionId/grade (con validación y audit)
   - POST /api/teacher/grading/:submissionId/feedback
   - Middleware verifySubmissionAccess
   - Tests unitarios

3. Notification System (1 SP)
   - Service: NotificationService (email + in-app)
   - Job worker: SendGradeNotificationJob
   - Email template: grade_notification.html
   - In-app notification creation
   - Tests unitarios notificaciones

4. Audit Logging (0.5 SP)
   - Service: AuditLogService
   - Crear log en re-grading (old_points → new_points)
   - Tests unitarios audit

### Frontend

#### Componentes

- GradingInterface (formulario de calificación)
- SubmissionViewer (ver contenido del estudiante)
- Rich Text Editor para feedback (TipTap)
- Modal de confirmación para re-grading
- NotificationToggle (checkbox notify student)

#### Tareas Frontend (3 SP)

1. Grading Interface (2.5 SP)
   - Componente GradingInterface
   - SubmissionViewer (mostrar contenido del estudiante)
   - Formulario de calificación (puntos + feedback)
   - Rich Text Editor para feedback (TipTap)
   - Validación Zod (puntos en rango)
   - Modal de confirmación para re-grading
   - NotificationToggle
   - Success/error notifications

2. Tests (0.5 SP)
   - Component tests: GradingInterface (validación)
   - Store tests: gradingStore

### Database

- Tabla: `submissions` (ya existe)
- Tabla: `grading_audit_log` (nueva)
  - id, submission_id, teacher_id, old_points, new_points, changed_at, reason
- Tabla: `notifications` (ya existe)

## Dependencias

- **Requiere:**
  - US-PM-003a (Grading Queue) - submissions pendientes
  - Notification Service - email + in-app notifications

- **Relacionada:**
  - US-PM-003a (Grading Queue)

## Riesgos y Mitigación

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Notificaciones fallan (email down) | Media | Medio | Job queue con retry, fallback a in-app only |
| Re-grading sin audit trail | Baja | Alto | Implementar audit_log desde día 1 |
| XSS en feedback | Alta | Crítico | HTML sanitization estricta |
| Acceso no autorizado | Media | Crítico | Verificar teacher-submission relationship en cada request |

## Testing

### Unit Tests
- GradingService: 10 tests
  - Calificar con puntos válidos (2 tests)
  - Validación de rango (2 tests)
  - Re-grading (2 tests)
  - Feedback (2 tests)
  - Access control (2 tests)
- NotificationService: 5 tests
- AuditLogService: 3 tests

### Integration Tests
- 3 endpoints API
- Re-grading workflow completo

### E2E Tests
- Flujo: Login → View pending → Grade submission → Verify notification

## Wireframe

```
┌──────────────────────────────────────────────────────────┐
│ Grade Submission                                    [X]  │
├──────────────────────────────────────────────────────────┤
│ Assignment: Chapter 5 Quiz (100 points)                 │
│ Student: John Doe (john.doe@school.edu)                 │
│ Submitted: Oct 26, 2025 10:30 AM (2 days late)          │
├──────────────────────────────────────────────────────────┤
│ Student's Submission:                                    │
│ ┌────────────────────────────────────────────────────┐  │
│ │ 1. Answer to question 1...                         │  │
│ │ 2. Answer to question 2...                         │  │
│ │ [attachment.pdf] [view]                            │  │
│ └────────────────────────────────────────────────────┘  │
├──────────────────────────────────────────────────────────┤
│ Points Earned *                                          │
│ [85___] / 100                                            │
│                                                          │
│ Feedback                                                 │
│ ┌────────────────────────────────────────────────────┐  │
│ │ [B] [I] [U] [List]                                 │  │
│ ├────────────────────────────────────────────────────┤  │
│ │ Good work overall! Watch calculations on #3.       │  │
│ └────────────────────────────────────────────────────┘  │
│                                                          │
│ Status: [Graded ▼] ☑ Notify student                     │
│                                                          │
│         [Cancel]          [Submit Grade]                 │
└──────────────────────────────────────────────────────────┘
```

## Métricas de Éxito

- 3 endpoints funcionando
- Test coverage >80%
- Response time p95 <300ms
- 100% notificaciones enviadas (email + in-app)
- Zero XSS vulnerabilities
- Tiempo promedio de calificación <5 minutos

## Notas

- ✅ Archivo modularizado desde US-PM-003-FULL.md (2025-11-02)
- ✅ Cumple PF-001 (<400L)
- 📋 Enfoque: Interfaz de calificación y retroalimentación
- 🔗 Complementa con US-PM-003a para cola de calificaciones
- ⚠️ IMPORTANTE: Audit log obligatorio para re-grading

---

**Última actualización:** 2025-11-02
**Versión:** 1.0 (Modular)
**Estado:** READY FOR DEVELOPMENT
