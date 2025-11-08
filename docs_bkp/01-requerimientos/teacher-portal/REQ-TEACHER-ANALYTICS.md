# Requerimientos Teacher Portal - Analytics y Reportes

**Proyecto:** Gamilit Platform
**Portal:** Teacher
**Archivo original:** REQUERIMIENTOS-TEACHER-PORTAL.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Tabla de Contenidos

1. [Analytics y Reportes](#analytics-y-reportes)
2. [Requerimientos No Funcionales](#requerimientos-no-funcionales)
3. [Matriz de Permisos](#matriz-de-permisos)
4. [Casos de Uso](#casos-de-uso)
5. [Criterios de Aceptación](#criterios-de-aceptación)
6. [Referencias](#referencias)

---

## Analytics y Reportes

### 2.5 Analytics y Reportes (HU-EP009-05)

**Historia de Usuario:** Como profesor, quiero generar reportes de desempeño de mis classrooms y ver analytics agregado para tomar decisiones informadas sobre mi enseñanza.

**Story Points:** 16 SP | **Prioridad:** Media (P2)

#### 2.5.1 Analytics de Classroom
**REQ-TCH-090:** El sistema debe proporcionar analytics agregado del classroom incluyendo:
- **Overall performance:** Total assignments, promedio de completitud, promedio de calificaciones, total submissions, pending grading
- **Grade distribution:** Distribución por rangos (90-100, 80-89, 70-79, 60-69, 0-59) con count y percentage
- **Performance by assignment:** Stats por assignment (average_grade, completion_rate, avg_time_to_complete)
- **Top performers:** Top 5 estudiantes con mejor promedio
- **At-risk students:** Estudiantes en riesgo con razones
- **Trend:** Tendencia de últimas 12 semanas (average_grade, submissions_count, completion_rate)

**REQ-TCH-091:** Los analytics deben ser filtrables por rango de fechas.

#### 2.5.2 Analytics Comparativo de Estudiante
**REQ-TCH-092:** El sistema debe proporcionar analytics comparativo mostrando:
- Performance del estudiante (average_grade, completion_rate, rank, percentile)
- Promedio del classroom
- Comparación (diferencia de calificaciones, above_average flag)
- Performance by topic (estudiante vs classroom)

**REQ-TCH-093:** El rank debe calcularse comparando al estudiante con todos los del classroom (1 = mejor).

**REQ-TCH-094:** El percentile debe representar la posición del estudiante (0-100).

#### 2.5.3 Analytics de Assignment
**REQ-TCH-095:** El sistema debe proporcionar estadísticas detalladas del assignment:
- **Statistics:** Total asignados, submissions, completion_rate, average_grade, median_grade, std_deviation, highest/lowest grade, avg_time_to_complete, late submissions
- **Grade distribution:** Por rangos
- **Difficulty assessment:**
  - 'too_easy' si average > 90%
  - 'appropriate' si 60% <= average <= 90%
  - 'too_hard' si average < 60%
- **Difficulty reason:** Justificación del assessment

#### 2.5.4 Métricas de Engagement
**REQ-TCH-096:** El sistema debe calcular métricas de engagement globales:
- **Overall engagement:** Total estudiantes, estudiantes activos (login últimos 7 días), tasa de actividad, frecuencia promedio de login, tiempo promedio en plataforma
- **By classroom:** Engagement score (0-100) por classroom
- **Activity timeline:** Actividad diaria de últimos 30 días (logins, submissions, time_on_platform)
- **Engagement alerts:** Alertas de estudiantes con:
  - no_login_7days: Sin login en 7 días
  - no_submission_14days: Sin submissions en 14 días
  - low_time: Tiempo en plataforma bajo

#### 2.5.5 Generación de Reportes
**REQ-TCH-097:** El sistema debe generar reportes predefinidos:
- **weekly:** Reporte semanal
- **monthly:** Reporte mensual
- **quarterly:** Reporte trimestral
- **custom:** Reporte personalizado con rango de fechas

**REQ-TCH-098:** Los reportes deben incluir:
- Summary general (total classrooms, students, assignments, overall avg_grade, completion_rate)
- Breakdown por classroom (students_count, assignments_count, average_grade, completion_rate, top_performer, at_risk_count)
- Metadata (report_id, generated_at, period)

#### 2.5.6 Exportación de Reportes
**REQ-TCH-099:** Los reportes deben ser exportables en los siguientes formatos:
- **JSON:** Respuesta API estándar
- **CSV:** Archivo CSV descargable
- **PDF:** Documento PDF con gráficas (si include_charts=true)

**REQ-TCH-100:** Los PDFs deben incluir:
- Logo de la plataforma
- Nombre del profesor
- Fecha de generación
- Gráficas visuales (si include_charts=true)
- Datos tabulares

**REQ-TCH-101:** Los archivos generados deben tener nombres descriptivos: `report_weekly_2025-10-28.pdf`

#### 2.5.7 Cache de Analytics
**REQ-TCH-102:** Los analytics deben cachearse en Redis con TTL de 5 minutos.

**REQ-TCH-103:** El cache debe invalidarse automáticamente cuando:
- Se crea nueva submission
- Se califica una submission
- Se modifica un assignment

**REQ-TCH-104:** El sistema debe lograr cache hit rate > 70%.

#### 2.5.8 Endpoints API
- GET /api/teacher/analytics/classroom/:id
- GET /api/teacher/analytics/student/:id
- GET /api/teacher/analytics/assignment/:id
- GET /api/teacher/analytics/engagement
- GET /api/teacher/analytics/reports

---

## 🔗 Referencias a Implementación

### Database
🗄️ **Tablas Relacionadas:**
- `progress_tracking.submissions` → `apps/database/ddl/schemas/progress_tracking/tables/submissions.sql`
  - **Propósito:** Base de datos de submissions para cálculo de analytics
  - **Columnas analytics:** `score`, `status`, `submitted_at`, `assignment_id`, `student_id`
- `educational_content.assignments` → `apps/database/ddl/schemas/educational_content/tables/assignments.sql`
  - **Propósito:** Datos de assignments para analytics de completitud
- `educational_content.classrooms` → `apps/database/ddl/schemas/educational_content/tables/classrooms.sql`
  - **Propósito:** Información de classrooms para agregación

🗄️ **Views/Materialized Views (planeadas):**
- `progress_tracking.classroom_analytics_view` - Vista materializada para analytics de classroom
  - **Campos:** classroom_id, avg_grade, completion_rate, total_submissions, pending_grading
- `progress_tracking.assignment_analytics_view` - Vista materializada para analytics de assignments
  - **Campos:** assignment_id, avg_grade, median_grade, std_deviation, completion_rate
- `auth.student_engagement_view` - Vista para métricas de engagement
  - **Campos:** student_id, last_login, login_frequency, avg_time_on_platform, activity_score

🗄️ **Indexes Críticos:**
- `submissions` índices en: (assignment_id, status), (student_id, submitted_at), (score)
- `assignments` índices en: (teacher_id, type, is_active)
- `classrooms` índices en: (teacher_id, is_active)

### Backend
💻 **Controllers:**
- `apps/backend/src/modules/teacher/controllers/analytics.controller.ts`
  - **Endpoints implementados:**
    - GET /api/teacher/analytics/classroom/:id
    - GET /api/teacher/analytics/student/:id
    - GET /api/teacher/analytics/assignment/:id
    - GET /api/teacher/analytics/engagement
    - GET /api/teacher/analytics/reports

💻 **Services:**
- `apps/backend/src/modules/teacher/services/analytics.service.ts`
  - **Métodos:** getClassroomAnalytics(), getStudentComparative(), getAssignmentStatistics(), getEngagementMetrics()
  - **Cálculos:** grade distribution, percentiles, trends, difficulty assessment
- `apps/backend/src/modules/teacher/services/report-generator.service.ts`
  - **Métodos:** generateWeeklyReport(), generateMonthlyReport(), generateQuarterlyReport(), generateCustomReport()
  - **Exportación:** exportToJSON(), exportToCSV(), exportToPDF()
- `apps/backend/src/modules/teacher/services/analytics-cache.service.ts`
  - **Métodos:** getCachedAnalytics(), setCachedAnalytics(), invalidateCache()
  - **Cache Strategy:** TTL 5 minutos, invalidación en submissions/grading

💻 **DTOs:**
- `apps/backend/src/modules/teacher/dto/analytics-query.dto.ts`
  - **Validación:** date ranges, classroom_id, format (json/csv/pdf)
- `apps/backend/src/modules/teacher/dto/report-options.dto.ts`
  - **Opciones:** report_type, period, format, include_charts

💻 **Utils:**
- `apps/backend/src/shared/utils/statistics.util.ts`
  - **Métodos:** calculateMean(), calculateMedian(), calculateStdDev(), calculatePercentile()
- `apps/backend/src/shared/utils/pdf-generator.util.ts`
  - **Library:** PDFKit o Puppeteer
  - **Métodos:** generateReportPDF(), addCharts(), addTables()

💻 **Cache:**
- `apps/backend/src/shared/cache/redis.service.ts`
  - **Propósito:** Cache de analytics con Redis
  - **Keys pattern:** `analytics:classroom:{id}`, `analytics:assignment:{id}`
  - **TTL:** 5 minutos (300 segundos)

💻 **Guards:**
- `apps/backend/src/shared/guards/roles.guard.ts` - Verifica rol admin_teacher
- `apps/backend/src/modules/teacher/guards/classroom-ownership.guard.ts` - Verifica ownership del classroom
- `apps/backend/src/modules/teacher/guards/student-access.guard.ts` - Verifica acceso a datos del estudiante

💻 **Middlewares:**
- `apps/backend/src/shared/middleware/rate-limit.middleware.ts`
  - **Config:** 100 requests/15 min por IP
- `apps/backend/src/shared/middleware/cache-invalidation.middleware.ts`
  - **Propósito:** Invalidar cache de analytics en eventos (submission, grading)

### Frontend
🎨 **Componentes Analytics:**
- `apps/frontend/src/features/teacher/components/ClassroomAnalyticsDashboard.tsx`
  - **Propósito:** Dashboard principal con overall performance, grade distribution, trends
- `apps/frontend/src/features/teacher/components/StudentComparativeView.tsx`
  - **Propósito:** Vista comparativa estudiante vs classroom promedio
- `apps/frontend/src/features/teacher/components/AssignmentStatisticsPanel.tsx`
  - **Propósito:** Panel de estadísticas de assignment con difficulty assessment
- `apps/frontend/src/features/teacher/components/EngagementMetricsDashboard.tsx`
  - **Propósito:** Dashboard de métricas de engagement con alertas

🎨 **Componentes Gráficas:**
- `apps/frontend/src/features/teacher/components/charts/GradeDistributionChart.tsx`
  - **Library:** Recharts o Chart.js
  - **Tipo:** Bar chart de distribución de calificaciones
- `apps/frontend/src/features/teacher/components/charts/TrendLineChart.tsx`
  - **Propósito:** Gráfica de tendencias (12 semanas)
- `apps/frontend/src/features/teacher/components/charts/PerformanceRadarChart.tsx`
  - **Propósito:** Radar chart para comparación estudiante vs classroom

🎨 **Componentes Reportes:**
- `apps/frontend/src/features/teacher/components/ReportGeneratorModal.tsx`
  - **Propósito:** Modal para configurar generación de reporte (tipo, periodo, formato)
- `apps/frontend/src/features/teacher/components/ReportPreview.tsx`
  - **Propósito:** Vista previa del reporte antes de exportar
- `apps/frontend/src/features/teacher/components/ReportExportButton.tsx`
  - **Propósito:** Botón con opciones de exportación (JSON, CSV, PDF)

🎨 **Hooks:**
- `apps/frontend/src/features/teacher/hooks/useClassroomAnalytics.ts`
  - **Métodos:** useGetClassroomAnalytics (con cache SWR)
- `apps/frontend/src/features/teacher/hooks/useStudentComparative.ts`
  - **Métodos:** useGetStudentComparative
- `apps/frontend/src/features/teacher/hooks/useAssignmentStatistics.ts`
  - **Métodos:** useGetAssignmentStatistics
- `apps/frontend/src/features/teacher/hooks/useEngagementMetrics.ts`
  - **Métodos:** useGetEngagementMetrics
- `apps/frontend/src/features/teacher/hooks/useReportGenerator.ts`
  - **Métodos:** useGenerateReport, useDownloadReport

🎨 **Types:**
- `apps/frontend/src/types/analytics.types.ts`
  - **Interfaces:** ClassroomAnalytics, StudentComparative, AssignmentStatistics, EngagementMetrics, Report
  - **Enums:** ReportType, ReportFormat, DifficultyAssessment

🎨 **Services:**
- `apps/frontend/src/services/api/analytics.service.ts`
  - **Métodos API:** getClassroomAnalytics(), getStudentComparative(), getAssignmentStatistics()
  - **Métodos reportes:** generateReport(), downloadReport()

🎨 **Utils:**
- `apps/frontend/src/utils/chart-formatters.ts`
  - **Propósito:** Formateo de datos para gráficas (labels, colors, tooltips)
- `apps/frontend/src/utils/export-helpers.ts`
  - **Propósito:** Helpers para exportación CSV/PDF desde cliente

---

## Requerimientos No Funcionales

### 3.1 Performance

#### 3.1.1 Tiempos de Respuesta
**REQ-NFR-001:** Los endpoints de CRUD (classrooms, assignments) deben responder en p95 < 200ms.

**REQ-NFR-002:** Los endpoints de grading deben responder en p95 < 300ms (incluye notificación asíncrona).

**REQ-NFR-003:** Los endpoints de progreso/analytics sin cache deben responder en p95 < 500ms.

**REQ-NFR-004:** Los endpoints de analytics con cache hit deben responder en p95 < 100ms.

**REQ-NFR-005:** La generación de reportes PDF debe completarse en < 3 segundos.

#### 3.1.2 Throughput
**REQ-NFR-006:** El sistema debe soportar mínimo 1000 requests/segundo.

**REQ-NFR-007:** La tasa de error debe ser < 0.1%.

#### 3.1.3 Paginación
**REQ-NFR-008:** Todos los listados deben implementar paginación eficiente con LIMIT/OFFSET.

**REQ-NFR-009:** Las opciones de paginación deben ser: 10, 25, 50, 100 items por página.

#### 3.1.4 Cache Strategy
**REQ-NFR-010:** El sistema debe implementar cache Redis para analytics con TTL de 5 minutos.

**REQ-NFR-011:** El cache hit rate debe ser > 70%.

### 3.2 Seguridad

#### 3.2.1 Autenticación y Autorización
**REQ-NFR-020:** Todos los endpoints deben requerir autenticación JWT válida.

**REQ-NFR-021:** Solo usuarios con role 'teacher', 'admin_teacher' o 'super_admin' pueden acceder al Teacher Portal.

**REQ-NFR-022:** El sistema debe implementar middleware de ownership verification:
- `verifyClassroomOwnership`: Verifica classroom.teacher_id === user.id
- `verifyAssignmentOwnership`: Verifica assignment.teacher_id === user.id
- `verifyStudentAccess`: Verifica relación teacher-student via classrooms
- `verifySubmissionAccess`: Verifica acceso a submission via classroom

#### 3.2.2 Validación de Inputs
**REQ-NFR-023:** Todos los endpoints deben implementar validación de inputs con Joi o Zod schemas.

**REQ-NFR-024:** El sistema debe sanitizar todos los inputs HTML (descriptions, feedback, notes) para prevenir XSS usando DOMPurify.

**REQ-NFR-025:** Los UUIDs deben validarse con regex o validator library.

**REQ-NFR-026:** Las fechas deben validarse en formato ISO 8601.

#### 3.2.3 Rate Limiting
**REQ-NFR-027:** Todos los endpoints del Teacher Portal deben implementar rate limiting:
- Window: 15 minutos
- Max requests: 100 por IP
- Headers: standardHeaders: true, legacyHeaders: false

#### 3.2.4 Privacidad de Datos
**REQ-NFR-028:** Las notas privadas de profesores deben ser visibles SOLO para el profesor que las creó.

**REQ-NFR-029:** Los datos de estudiantes solo deben ser accesibles a profesores que los tienen en sus classrooms.

**REQ-NFR-030:** No se deben exponer IDs internos en mensajes de error.

#### 3.2.5 Audit Logging
**REQ-NFR-031:** El sistema debe mantener audit logs de:
- Cambios de calificaciones (re-grading)
- Creación/modificación/eliminación de assignments
- Modificación de classrooms

### 3.3 Escalabilidad

#### 3.3.1 Base de Datos
**REQ-NFR-050:** El sistema debe implementar indexes en columnas frecuentemente consultadas:
- classrooms: teacher_id, is_active, subject, grade_level
- assignments: teacher_id, type, is_active
- submissions: student_id, assignment_id, status, submitted_at
- classroom_students: classroom_id, student_id

**REQ-NFR-051:** Las queries complejas de analytics deben optimizarse con EXPLAIN ANALYZE.

**REQ-NFR-052:** Se deben considerar materialized views para analytics de alta demanda.

#### 3.3.2 Procesamiento Asíncrono
**REQ-NFR-053:** Las notificaciones deben procesarse de forma asíncrona con job queue (Bull/BullMQ).

**REQ-NFR-054:** La generación de reportes PDF puede ser asíncrona si el tiempo excede 3 segundos.

---

## Matriz de Permisos

### Permisos de Analytics

| Endpoint | teacher | admin_teacher | super_admin | Notas |
|----------|---------|---------------|-------------|-------|
| GET /analytics/classroom/:id | ✓ | ✓ | ✓ | Solo si es owner del classroom |
| GET /analytics/student/:id | ✓ | ✓ | ✓ | Solo si student en sus classrooms |
| GET /analytics/assignment/:id | ✓ | ✓ | ✓ | Solo si es owner del assignment |
| GET /analytics/engagement | ✓ | ✓ | ✓ | Solo de sus classrooms |
| GET /analytics/reports | ✓ | ✓ | ✓ | Solo de sus classrooms |

---

## Casos de Uso

### Caso de Uso: Generar Reporte Mensual

**Actor Principal:** Profesor

**Precondiciones:**
- El profesor tiene classrooms con actividad del último mes
- Existen submissions y calificaciones

**Flujo Principal:**
1. El profesor navega a "Analytics & Reports"
2. El profesor hace clic en "Generate Report"
3. El sistema muestra formulario con opciones:
   - Report type: Monthly
   - Classroom: All
   - Format: PDF
   - Include charts: Yes
4. El profesor selecciona las opciones
5. El profesor hace clic en "Generate"
6. El sistema calcula el periodo (último mes completo)
7. El sistema consulta analytics agregado (con cache)
8. El sistema genera el reporte con:
   - Summary: 3 classrooms, 72 students, 45 assignments, 87% avg grade
   - Breakdown por classroom
   - Top performers y at-risk students
   - Grade distribution charts
   - Trend charts
9. El sistema genera el PDF con gráficas
10. El sistema retorna el archivo: "report_monthly_2025-10-28.pdf"
11. El navegador descarga el archivo
12. El profesor abre el PDF y revisa el contenido

**Flujos Alternativos:**

**9a. Generación de PDF tarda >3 segundos:**
1. El sistema mueve la generación a job queue
2. El sistema muestra: "Your report is being generated..."
3. El sistema muestra progress bar
4. Cuando termina, el sistema notifica al profesor
5. El profesor descarga el reporte

**7a. Cache miss:**
1. El sistema consulta base de datos
2. El sistema calcula analytics (500ms)
3. El sistema guarda en cache (TTL: 5 min)
4. El flujo continúa en paso 8

**Postcondiciones:**
- El profesor tiene un reporte PDF descargable con analytics del mes
- El reporte puede compartirse con administración o padres

---

## Criterios de Aceptación

### Funcionales
- [ ] Los profesores pueden ver analytics agregados de sus classrooms
- [ ] Los profesores pueden generar reportes semanales/mensuales/trimestrales
- [ ] Los reportes son exportables en JSON, CSV y PDF
- [ ] Los PDFs incluyen gráficas visuales
- [ ] El sistema detecta estudiantes en riesgo automáticamente
- [ ] El sistema calcula métricas de engagement por classroom

### No Funcionales
- [ ] Response time p95 < 500ms para analytics sin cache
- [ ] Response time p95 < 100ms para analytics con cache hit
- [ ] Cache hit rate > 70%
- [ ] Generación de PDF < 3 segundos
- [ ] Test coverage > 80% (backend), > 70% (frontend)

---

## Referencias

### Documentación Relacionada
- **Épica EP009:** `/docs/04-planificacion/epicas/EP009-teacher-portal/README.md`
- **Historia HU-EP009-05:** `/docs/04-planificacion/epicas/EP009-teacher-portal/historias/HU-EP009-05-analytics-reports.md`
- **API Reference:** `/docs/02-especificaciones-tecnicas/apis/API-REFERENCE.md` (líneas 597-2130)
- **Reporte Fase 2:** `/docs/projects/glit-analisys/05-REPORTE-FINAL-FASE-2-DOCUMENTACION.md`

### Stack Tecnológico

#### Backend
- Cache: Redis
- PDF Generation: PDFKit o Puppeteer
- Logging: Winston

#### Frontend
- Charts: Recharts o Chart.js
- PDF Export: jsPDF o react-pdf

---

**Última actualización:** 2025-11-01
**Versión:** 2.0 (RFC-0001)
**Estado:** APROBADO
