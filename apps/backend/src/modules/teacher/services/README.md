# Teacher Services

Documentación de los servicios del módulo Teacher.

## Servicios Expuestos (Controllers)

| Servicio | Descripción | Controller |
|----------|-------------|------------|
| `AnalyticsService` | Analytics y métricas del aula | TeacherController |
| `BonusCoinsService` | Otorgar ML Coins bonus a estudiantes | TeacherController |
| `ExerciseResponsesService` | Respuestas e intentos de ejercicios | ExerciseResponsesController |
| `GradingService` | Calificación de tareas | TeacherGradesController |
| `InterventionAlertsService` | Alertas de intervención automáticas | InterventionAlertsController |
| `ManualReviewService` | Revisión manual de ejercicios M4-M5 | ManualReviewController |
| `ReportsService` | Generación de reportes PDF/Excel | TeacherController |
| `StudentBlockingService` | Bloqueo/desbloqueo de estudiantes | TeacherClassroomsController |
| `StudentProgressService` | Progreso individual de estudiantes | TeacherController |
| `TeacherClassroomsCrudService` | CRUD de aulas del teacher | TeacherClassroomsController |
| `TeacherContentService` | Gestión de contenido educativo | TeacherContentController |
| `TeacherDashboardService` | Dashboard principal del teacher | TeacherController |
| `TeacherMessagesService` | Sistema de mensajería | TeacherCommunicationController |
| `TeacherReportsService` | Reportes del teacher | TeacherController |

## Servicios Internos (No expuestos directamente)

| Servicio | Descripción | Uso |
|----------|-------------|-----|
| `MLPredictorService` | Predicciones de riesgo de estudiantes | Usado por `StudentRiskAlertService` |
| `StudentRiskAlertService` | Generación automática de alertas | Ejecutado por CRON (`TasksModule`) |
| `StorageService` | Almacenamiento de archivos | Usado internamente por `ReportsService` |

## Notas Técnicas

### MLPredictorService

**ADVERTENCIA:** Este servicio usa HEURÍSTICAS SIMPLES como placeholder, NO modelos de Machine Learning reales.

Las predicciones son aproximaciones y NO deben usarse para decisiones críticas sin supervisión humana.

Para integrar ML real, ver opciones documentadas en el archivo del servicio:
- Python/FastAPI microservice
- TensorFlow.js
- AWS SageMaker / Azure ML / Google Cloud AI

### ManualReviewService

Arquitectura cross-database: el servicio usa la vista `teacher_pending_reviews` para obtener datos de ejercicios y módulos que están en schemas diferentes.

Métodos principales:
- `findPendingReviews(teacherId, filters?)` - Revisiones pendientes
- `findPendingByModule(teacherId, moduleOrder)` - Filtrado por módulo
- `getPendingReviewsStats(teacherId, classroomId?)` - Estadísticas

### InterventionAlertsService

Las alertas se generan automáticamente por la función de base de datos `generate_student_alerts()`.

Prioridades de alertas basadas en días de espera:
- `urgent`: > 7 días
- `high`: 3-7 días
- `medium`: 1-3 días
- `normal`: < 1 día

## Dependencias entre Servicios

```
TeacherDashboardService
  └── StudentProgressService
  └── AnalyticsService

StudentRiskAlertService
  └── MLPredictorService
  └── InterventionAlertsService

ReportsService
  └── StorageService
  └── AnalyticsService

ManualReviewService
  └── (cross-database queries)
```

---

**Actualizado:** 2025-12-28
**Generado por:** Requirements-Analyst
