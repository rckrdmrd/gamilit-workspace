# Requerimientos - Portal Docente (Teacher Portal)

**Proyecto:** Gamilit Platform
**Épica:** EP009 - Teacher Portal
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01
**Estado:** APROBADO

---

## Índice General

Este directorio contiene los requerimientos del Portal Docente (Teacher Portal) de la plataforma GAMILIT, modularizados por funcionalidad para facilitar su lectura y mantenimiento.

### Documentos Modulares

1. **[REQ-TEACHER-CLASSROOMS.md](./REQ-TEACHER-CLASSROOMS.md)** (110 líneas)
   - Gestión de Classrooms (HU-EP009-01)
   - Creación, listado, actualización y eliminación de aulas virtuales
   - Gestión de estudiantes en classrooms
   - 8 endpoints API

2. **[REQ-TEACHER-ASSIGNMENTS.md](./REQ-TEACHER-ASSIGNMENTS.md)** (97 líneas)
   - Gestión de Assignments (HU-EP009-02)
   - Creación, asignación y gestión de tareas/exámenes
   - Tipos de assignments: quiz, homework, project, exam, discussion
   - 8 endpoints API

3. **[REQ-TEACHER-GRADING-PROGRESS.md](./REQ-TEACHER-GRADING-PROGRESS.md)** (278 líneas)
   - Sistema de Calificación (HU-EP009-03)
   - Seguimiento de Progreso (HU-EP009-04)
   - Cola de calificación, feedback y notificaciones
   - Detección de estudiantes en riesgo
   - Notas privadas del profesor
   - 8 endpoints API

4. **[REQ-TEACHER-ANALYTICS.md](./REQ-TEACHER-ANALYTICS.md)** (268 líneas)
   - Analytics y Reportes (HU-EP009-05)
   - Analytics de classroom, estudiante y assignment
   - Métricas de engagement
   - Generación de reportes (weekly, monthly, quarterly, custom)
   - Exportación en JSON, CSV y PDF
   - Requerimientos No Funcionales (Performance, Seguridad, Escalabilidad)
   - 5 endpoints API

---

## Visión General del Portal

### Propósito
El Teacher Portal es un componente crítico que permite a los profesores gestionar sus aulas virtuales, crear y administrar tareas, calificar entregas de estudiantes, monitorear progreso y generar reportes analíticos.

### Alcance del Sistema
El Teacher Portal cubre las siguientes funcionalidades principales:
- Gestión de Classrooms (aulas virtuales)
- Gestión de Assignments (tareas, proyectos, exámenes)
- Sistema de Calificación y Feedback
- Seguimiento de Progreso Estudiantil
- Analytics y Generación de Reportes

### Métricas del Proyecto

| Métrica | Valor |
|---------|-------|
| Story Points Totales | 80 SP |
| Historias de Usuario | 5 historias |
| Endpoints API | 29 endpoints |
| Duración Estimada | 3 semanas (6 sprints) |
| Presupuesto | $12,000 USD |

### Valor de Negocio

**Impacto:** CRÍTICO
- Sin el Teacher Portal, los profesores no pueden gestionar sus clases ni evaluar estudiantes
- ROI Estimado: Alto - Fundamental para adopción de la plataforma
- Usuarios Afectados: 100% de profesores (rol crítico)
- Cobertura de Fase 2: Esta épica implementa 29 endpoints documentados en Fase 2

---

## Resumen de Endpoints por Módulo

### Classrooms (8 endpoints)
- POST /api/teacher/classrooms
- GET /api/teacher/classrooms
- GET /api/teacher/classrooms/:id
- PUT /api/teacher/classrooms/:id
- DELETE /api/teacher/classrooms/:id
- GET /api/teacher/classrooms/:id/students
- POST /api/teacher/classrooms/:id/students
- DELETE /api/teacher/classrooms/:id/students/:studentId

### Assignments (8 endpoints)
- POST /api/teacher/assignments
- GET /api/teacher/assignments
- GET /api/teacher/assignments/:id
- PUT /api/teacher/assignments/:id
- DELETE /api/teacher/assignments/:id
- POST /api/teacher/assignments/:id/assign
- GET /api/teacher/assignments/:id/submissions
- POST /api/teacher/assignments/:id/grade

### Grading (4 endpoints)
- GET /api/teacher/grading/pending
- GET /api/teacher/grading/:submissionId
- POST /api/teacher/grading/:submissionId/grade
- POST /api/teacher/grading/:submissionId/feedback

### Student Progress (4 endpoints)
- GET /api/teacher/students/:id/progress
- GET /api/teacher/students/:id/analytics
- GET /api/teacher/students/:id/notes
- POST /api/teacher/students/:id/notes

### Analytics (5 endpoints)
- GET /api/teacher/analytics/classroom/:id
- GET /api/teacher/analytics/student/:id
- GET /api/teacher/analytics/assignment/:id
- GET /api/teacher/analytics/engagement
- GET /api/teacher/analytics/reports

**Total:** 29 endpoints

---

## Roadmap de Implementación

### Sprint 1 (Semana 1) - Classroom Management (16 SP)
- Implementar 8 endpoints de classrooms
- Middleware verifyClassroomOwnership
- Frontend: ClassroomList, CreateClassroomForm, ClassroomDetails
- Tests unitarios >80%

### Sprint 2 (Semana 1-2) - Assignment Management (20 SP)
- Implementar 8 endpoints de assignments
- Rich Text Editor (TipTap)
- HTML sanitization
- Frontend: AssignmentList, CreateAssignmentForm, AssignToClassrooms
- Tests unitarios >80%

### Sprint 3 (Semana 2) - Grading System (16 SP)
- Implementar 4 endpoints de grading
- Sistema de notificaciones (email + in-app)
- Job queue (Bull/BullMQ)
- Frontend: GradingQueue, GradingInterface
- Tests unitarios >80%

### Sprint 4 (Semana 2-3) - Student Progress (12 SP)
- Implementar 4 endpoints de progreso
- Middleware verifyStudentAccess
- Frontend: StudentProgress, ProgressChart, StudentNotes
- Tests unitarios >80%

### Sprint 5 (Semana 3) - Analytics & Reports (16 SP)
- Implementar 5 endpoints de analytics
- Cache Redis
- PDF generation
- Frontend: AnalyticsDashboard, ReportGenerator
- Tests unitarios >80%

### Sprint 6 (Semana 3) - Integration & Polish
- Integración completa de todos los módulos
- Tests E2E completos (29 endpoints)
- Performance testing y optimización
- Code review y refactoring
- Bug fixing
- Documentación final

---

## Criterios de Aceptación Global

### Funcionales
- [ ] Los 29 endpoints API están implementados y funcionando
- [ ] Los profesores pueden crear y gestionar classrooms
- [ ] Los profesores pueden crear y asignar assignments a classrooms
- [ ] Los profesores pueden calificar submissions y enviar feedback
- [ ] Los profesores pueden monitorear progreso de estudiantes
- [ ] Los profesores pueden generar reportes y analytics
- [ ] El sistema envía notificaciones a estudiantes cuando son calificados
- [ ] El sistema detecta automáticamente estudiantes en riesgo
- [ ] El sistema permite exportar datos en CSV y PDF

### No Funcionales
- [ ] Response time p95 < 200ms para CRUD, < 500ms para analytics
- [ ] Test coverage > 80% (backend), > 70% (frontend)
- [ ] Zero critical security vulnerabilities
- [ ] Cache hit rate > 70% para analytics
- [ ] Uptime > 99.9%
- [ ] API documentation 100% completa
- [ ] Code review aprobado para todas las PRs
- [ ] ESLint y TypeScript sin errores

### UX/UI
- [ ] Todas las interfaces son responsive (desktop, tablet, mobile)
- [ ] Loading states implementados en todas las operaciones asíncronas
- [ ] Error messages claros y accionables
- [ ] Toast notifications para feedback inmediato
- [ ] Rich text editors funcionando correctamente
- [ ] Charts y gráficas renderizando correctamente
- [ ] Exportación de reportes funciona sin errores

---

## Métricas de Éxito

### KPIs Técnicos
- 29 endpoints implementados y funcionando con 100% uptime
- Test coverage: Backend >80%, Frontend >70%
- Response time p95 <200ms (CRUD), <500ms (analytics)
- Cache hit rate >70%
- Zero critical bugs en producción
- API documentation 100% completa

### KPIs de Negocio
- 100% de profesores pueden crear classrooms
- 100% de profesores pueden asignar tareas
- 100% de profesores pueden calificar submissions
- Tiempo promedio de calificación <5 minutos
- Tiempo promedio de creación de assignment <3 minutos
- >90% satisfaction rate en encuestas de profesores
- >70% de profesores usan analytics regularmente
- >60% de profesores generan reportes mensualmente

---

## 🔗 Referencias a Implementación

### Documentos con Referencias Detalladas

Cada documento modular incluye una sección completa "🔗 Referencias a Implementación" con paths a:
- 🗄️ **Database:** Tablas, ENUMs, Foreign Keys, Indexes (en `apps/database/ddl/`)
- 💻 **Backend:** Controllers, Services, DTOs, Entities, Guards, Utils (en `apps/backend/src/`)
- 🎨 **Frontend:** Componentes, Hooks, Types, Services (en `apps/frontend/src/`)

**Consultar:**
1. [REQ-TEACHER-CLASSROOMS.md → Referencias](./REQ-TEACHER-CLASSROOMS.md#-referencias-a-implementación)
2. [REQ-TEACHER-ASSIGNMENTS.md → Referencias](./REQ-TEACHER-ASSIGNMENTS.md#-referencias-a-implementación)
3. [REQ-TEACHER-GRADING-PROGRESS.md → Referencias](./REQ-TEACHER-GRADING-PROGRESS.md#-referencias-a-implementación)
4. [REQ-TEACHER-ANALYTICS.md → Referencias](./REQ-TEACHER-ANALYTICS.md#-referencias-a-implementación)

### Resumen Rápido de Implementación

**Database Schemas:**
- `educational_content`: classrooms, assignments, assignment_classrooms
- `progress_tracking`: submissions, student_notes
- `audit_logging`: grading_audit_log

**Backend Modules:**
- `apps/backend/src/modules/teacher/` - Controllers, Services, DTOs, Guards
- `apps/backend/src/shared/` - HTML Sanitizer, Statistics Utils, PDF Generator, Redis Cache
- `apps/backend/src/modules/notifications/` - Job Queue (Bull/BullMQ)

**Frontend Features:**
- `apps/frontend/src/features/teacher/` - Components, Hooks
- `apps/frontend/src/types/` - teacher.types.ts, analytics.types.ts, grading.types.ts
- `apps/frontend/src/services/api/` - teacher.service.ts, analytics.service.ts, grading.service.ts

---

## Referencias

### Documentación de Épica
- **README Épica:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)
- **Database Schema:** `/docs/03-desarrollo/base-de-datos/schemas/content_management/`
- **Reporte Fase 2:** `/docs/projects/glit-analisys/05-REPORTE-FINAL-FASE-2-DOCUMENTACION.md`

### Historias de Usuario
- **HU-EP009-01:** Classroom Management
- **HU-EP009-02:** Assignment Management
- **HU-EP009-03:** Grading System
- **HU-EP009-04:** Student Progress
- **HU-EP009-05:** Analytics & Reports

### Stack Tecnológico

#### Backend
- Framework: Node.js + TypeScript + Express
- Database: PostgreSQL 16
- ORM: Prisma (preferido) o TypeORM
- Validación: Joi o Zod
- Authentication: JWT (reusa EP001)
- Cache: Redis
- Job Queue: Bull/BullMQ
- PDF Generation: PDFKit o Puppeteer
- HTML Sanitization: DOMPurify (isomorphic-dompurify)
- Logging: Winston

#### Frontend
- Framework: React + TypeScript
- State Management: Zustand
- UI Library: Tailwind CSS + shadcn/ui
- Forms: React Hook Form + Zod validation
- Rich Text Editor: TipTap
- Charts: Recharts o Chart.js
- PDF Export: jsPDF o react-pdf
- Testing: Vitest + React Testing Library

#### DevOps
- Testing Backend: Jest
- Testing E2E: Playwright o Cypress
- CI/CD: GitHub Actions
- Monitoring: (TBD)

---

## Aprobaciones

| Rol | Nombre | Fecha | Firma |
|-----|--------|-------|-------|
| Product Owner | TBD | - | - |
| Tech Lead | TBD | - | - |
| Backend Lead | TBD | - | - |
| Frontend Lead | TBD | - | - |
| QA Lead | TBD | - | - |

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001 Modularizado)
**Estado:** APROBADO
**Archivo original respaldado:** REQUERIMIENTOS-TEACHER-PORTAL.md.backup
