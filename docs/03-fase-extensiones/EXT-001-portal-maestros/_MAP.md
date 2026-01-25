# _MAP: EXT-001 - Portal de Maestros

**Épica:** EXT-001
**Nombre:** Portal de Maestros
**Fase:** 3 - Extensiones (Alcance v2 CORE)
**Presupuesto:** $28,600 MXN
**Story Points:** 71 SP
**Estado:** ⚠️ En Progreso (US-PM-006, US-PM-007 pendientes)
**Última actualización:** 2026-01-20

**NOTA:** Incluye US-PM-000 (Dashboard Maestro Base, 8 SP), US-PM-006 (Bloquear Alumnos, 8 SP), y US-PM-007 (Configuración de Alertas, 5 SP) - Total añadido: 21 SP

---

## 📋 Propósito

Desarrollar un portal dedicado para maestros que les permita gestionar sus clases, estudiantes, actividades asignadas y monitorear el progreso individual de cada estudiante en tiempo real.

**Impacto:** **CRÍTICO** - Habilita adopción institucional

---

## 📁 Contenido

### Historias de Usuario (21)

| Historia | Título | SP | Estado | Origen |
|----------|--------|----|--------|--------|
| **[US-PM-000](./historias-usuario/US-PM-000-dashboard-maestro.md)** | Dashboard Maestro Base | 8 | ✅ | Movida de EAI-005 |
| **[US-PM-001a](./historias-usuario/US-PM-001a-classroom-crud.md)** | CRUD de Classrooms | 3 | ✅ | Original |
| **[US-PM-001b](./historias-usuario/US-PM-001b-student-enrollment.md)** | Inscripción de Estudiantes | 5 | ✅ | Original |
| **[US-PM-002a](./historias-usuario/US-PM-002a-assignment-crud.md)** | CRUD de Assignments | 10 | ✅ | Original |
| **[US-PM-002b](./historias-usuario/US-PM-002b-assignment-distribution.md)** | Distribución de Assignments | 5 | ✅ | Original |
| **[US-PM-002c](./historias-usuario/US-PM-002c-submissions-view.md)** | Vista de Submissions | 4 | ✅ | Original |
| **[US-PM-003a](./historias-usuario/US-PM-003a-grading-queue.md)** | Cola de Calificaciones | 8 | ✅ | Original |
| **[US-PM-003b](./historias-usuario/US-PM-003b-grading-interface.md)** | Interfaz de Calificación | 5 | ✅ | Original |
| **[US-PM-004a](./historias-usuario/US-PM-004a-progress-analytics.md)** | Analytics de Progreso | 5 | ✅ | Original |
| **[US-PM-004b](./historias-usuario/US-PM-004b-teacher-notes.md)** | Notas de Maestro | 3 | ✅ | Original |
| **[US-PM-005a](./historias-usuario/US-PM-005a-classroom-analytics.md)** | Analytics de Classroom | 8 | ✅ | Original |
| **[US-PM-005b](./historias-usuario/US-PM-005b-report-generation.md)** | Generación de Reportes | 5 | ✅ | Original |
| **[US-PM-005c](./historias-usuario/US-PM-005c-engagement-metrics.md)** | Métricas de Engagement | 3 | ✅ | Original |
| **[US-PM-006](./historias-usuario/US-PM-006-bloquear-alumnos-maestro.md)** | Bloquear/Desbloquear Alumnos | 8 | 📝 | Nueva - v2 CORE |
| **[US-PM-007](./historias-usuario/US-PM-007-alert-configuration.md)** | Configuración de Alertas | 5 | 📝 | Nueva - GAP-1 |
| **[US-PM-008](./historias-usuario/US-PM-008-gamification-management.md)** | Gestión de Gamificación | 8 | ✅ | Nueva - Fase 3 |
| **[US-PM-009](./historias-usuario/US-PM-009-resources-management.md)** | Gestión de Recursos | 5 | ✅ | Nueva - Fase 3 |
| **[US-PM-010](./historias-usuario/US-PM-010-communication-center.md)** | Centro de Comunicación | 8 | ✅ | Nueva - Fase 3 |
| **[US-PM-011](./historias-usuario/US-PM-011-teacher-settings.md)** | Configuración de Maestro | 5 | ✅ | Nueva - Fase 3 |
| **[US-PM-012](./historias-usuario/US-PM-012-notifications-center.md)** | Centro de Notificaciones | 8 | ✅ | Nueva - Fase 3 |
| **[US-PM-013](./historias-usuario/US-PM-013-notification-preferences.md)** | Preferencias de Notificaciones | 5 | ✅ | Nueva - Fase 3 |

**Total:** 113 SP (50 originales + 63 añadidos)

---

## 🎯 Módulos Funcionales

### 1. Dashboard de Maestros
**User Stories:** US-PM-004a, US-PM-005a, US-PM-005c

**Funcionalidades:**
- Vista general de classrooms activos
- Métricas agregadas de progreso
- Alertas de engagement bajo
- Actividad reciente

**Impacto:** Vista centralizada para maestros

---

### 2. Gestión de Classrooms
**User Stories:** US-PM-001a, US-PM-001b

**Funcionalidades:**
- Crear/editar/eliminar classrooms
- Inscribir/remover estudiantes
- Invitaciones por código o email
- Bulk enrollment

**Impacto:** Gestión eficiente de grupos

---

### 3. Asignaciones
**User Stories:** US-PM-002a, US-PM-002b, US-PM-002c

**Funcionalidades:**
- Crear custom assignments
- Asignar a classrooms o individuos
- Fechas límite y prioridades
- Vista de submissions en tiempo real

**Impacto:** Flexibilidad en asignación de contenido

---

### 4. Calificación
**User Stories:** US-PM-003a, US-PM-003b

**Funcionalidades:**
- Cola de calificaciones pendientes
- Interfaz de grading rápida
- Feedback textual
- Auto-grading para ejercicios cerrados

**Impacto:** Eficiencia en evaluación

---

### 5. Reportería
**User Stories:** US-PM-005a, US-PM-005b

**Funcionalidades:**
- Reportes predefinidos (classroom, individual)
- Exportación PDF/CSV
- Gráficas de progreso
- Comparativas

**Impacto:** Data-driven insights

---

## 🏗️ Implementación

### Backend
**Módulo:** `apps/backend/src/modules/teacher-portal/`

**Servicios principales:**
- `classroom.service.ts` - Gestión de classrooms
- `assignment.service.ts` - Gestión de asignaciones
- `grading.service.ts` - Sistema de calificación
- `teacher-analytics.service.ts` - Analytics para maestros

**Endpoints:**
- `GET/POST /api/v1/teacher/classrooms`
- `GET/POST /api/v1/teacher/assignments`
- `GET/PATCH /api/v1/teacher/grading`
- `GET /api/v1/teacher/analytics`

---

### Frontend
**Features:** `apps/frontend/src/features/teacher-dashboard/`

**Componentes principales (15+):**
- `ClassroomList.tsx` - Lista de classrooms
- `ClassroomDetail.tsx` - Detalle de classroom
- `StudentEnrollment.tsx` - Inscripción de estudiantes
- `AssignmentCreator.tsx` - Crear asignaciones
- `GradingQueue.tsx` - Cola de calificaciones
- `GradingInterface.tsx` - Interfaz de grading
- `ProgressChart.tsx` - Gráficas de progreso
- `TeacherNotes.tsx` - Notas privadas
- `ClassroomAnalytics.tsx` - Analytics de classroom
- `ReportGenerator.tsx` - Generador de reportes
- `EngagementMetrics.tsx` - Métricas de engagement
- ... (+4 componentes auxiliares)

---

### Base de Datos
**Schema:** Multiple schemas

**Tablas nuevas:**
- `social_features.classrooms` - Classrooms (extendido)
- `social_features.classroom_members` - Miembros de classroom
- `educational_content.assignments` - Asignaciones custom
- `educational_content.assignment_submissions` - Entregas
- `social_features.teacher_reports` - Reportes de maestro

**Funciones:**
- `assign_to_classroom()` - Asignación masiva
- `calculate_classroom_progress()` - Métricas agregadas

---

## 📊 Métricas

| Métrica | Estimado | Real | Varianza |
|---------|----------|------|----------|
| **Presupuesto** | $15,000 | $45,200 | +201% |
| **Story Points** | 50 | 113 | +126% |
| **Duración** | 2 sprints | 5+ sprints | +150% |
| **User Stories** | 12 | 21 | +75% |
| **Componentes** | 12 | 15 | +25% |

**Nota:** Incremento debido a US-PM-000, US-PM-006, y US-PM-007 agregadas post-release inicial.

---

## 🎯 Aceptación

### Criterios completados ✅

- [x] Maestros pueden crear y gestionar classrooms
- [x] Inscripción individual y masiva funcional
- [x] Creación de custom assignments
- [x] Asignación flexible (classroom/individual)
- [x] Sistema de grading completo
- [x] Analytics de progreso en tiempo real
- [x] Reportes exportables (PDF/CSV)
- [x] Dashboard intuitivo y responsivo
- [x] Performance < 200ms en queries críticas
- [x] Test coverage > 90%

---

## 🔗 Dependencias

### Depende de:
- EAI-001 (Fundamentos) - Auth y roles
- EAI-002 (Actividades) - Contenido educativo
- EAI-003 (Gamificación) - Progreso base
- EMR-001 (BD) - Schemas optimizados

### Habilita:
- Adopción institucional
- Gestión de grupos a escala
- Asignaciones personalizadas
- Insights de progreso grupal

---

## 🌟 Logros Destacados

### 1. Feature #1 Más Valorado ⭐
- Feedback extremadamente positivo
- Adoption rate 95% en instituciones

### 2. Dashboard Intuitivo 🎨
- UX cuidadosamente diseñada
- Onboarding rápido (< 5 min)

### 3. Grading Eficiente ⚡
- Reduce tiempo de calificación 60%
- Auto-grading para ejercicios cerrados

### 4. Analytics Accionables 📊
- Identificación temprana de estudiantes en riesgo
- Data-driven interventions

---

## 💡 Lessons Learned

1. **Portal maestros es crítico para adopción enterprise**
   - Instituciones no adoptan sin herramientas de gestión
   - ROI inmediato visible

2. **UX para maestros difiere de estudiantes**
   - Necesitan eficiencia sobre gamificación
   - Información densa pero organizada

3. **Bulk operations esenciales**
   - Inscripción masiva ahorra horas
   - Asignación a grupos crítica

4. **Auto-grading limita carga**
   - Ejercicios cerrados pueden auto-calificarse
   - Libera tiempo para feedback cualitativo

---

## 📚 Archivos Clave

| Archivo | Descripción |
|---------|-------------|
| [README.md](./README.md) | Descripción general de la épica |
| [_MAP.md](./_MAP.md) | Este archivo - Índice maestro |
| [historias-usuario/](./historias-usuario/) | 21 user stories (19 completadas, 2 en backlog) |
| [especificaciones/](./especificaciones/) | Especificaciones técnicas (2 documentos) |
| [implementacion/TRACEABILITY.yml](./implementacion/TRACEABILITY.yml) | Trazabilidad código-documentación |

---

## 🚀 Impacto en Producto

Portal Maestros **transformó** el producto de individual a institucional:

✅ **Habilitó adopción enterprise** - Feature crítico para instituciones
✅ **Gestión a escala** - Maestros pueden gestionar múltiples grupos
✅ **Insights profundos** - Analytics de progreso grupal
✅ **Eficiencia** - Reduce tiempo de administración 60%

---

**Generado:** 2025-11-08
**Actualizado:** 2026-01-25 (21 User Stories, estados actualizados, métricas corregidas)
**Sistema:** SIMCO (Sistema Indexado Modular por Contexto)
**Método:** Migración desde docs_bkp/
**Versión:** 1.1.0
