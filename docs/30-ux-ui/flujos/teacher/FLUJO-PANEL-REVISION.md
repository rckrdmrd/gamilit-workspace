---
title: Panel de Revision Manual
category: teacher
id: FL-TCH-13
version: 1.0.0
last_updated: 2026-02-27
---

# FL-TCH-13 - Panel de Revision Manual

**ID:** FL-TCH-13
**Version:** 1.0.0
**Fecha:** 2026-02-27
**Estado:** Activo
**Portal:** Teacher
**Prioridad:** P1

---

## 1. Resumen

Flujo de la pagina `/teacher/reviews` del portal docente (componente `TeacherReviewPanelPage`). Esta pagina centraliza la gestion del flujo completo de evaluacion manual para ejercicios creativos de modulos 3, 4 y 5. El docente puede ver las reviews pendientes con su prioridad (urgent/high/medium/normal), filtrarlas por modulo y aula, iniciar una revision marcandola `in_progress`, completar la evaluacion con una calificacion que distribuye automaticamente XP y ML Coins al estudiante, o devolver el submission al estudiante para correccion. A diferencia de `FLUJO-REVISION-MANUAL-M3-M5.md` que documenta el flujo de los modulos educativos, este flujo documenta el panel de administracion de las revisiones.

---

## 2. Actores

- Maestro: Evalua submissions creativos, asigna calificaciones, distribuye recompensas.
- Sistema (BE): Distribuye automaticamente XP y ML Coins al completar una revision.
- Estudiante: Receptor de la calificacion y recompensas (actor pasivo en este flujo).

---

## 3. Precondiciones

- Usuario autenticado con rol `teacher` o `admin_teacher`.
- Sesion activa con JWT valido.
- Estudiantes han enviado submissions de ejercicios M3/M4/M5 que requieren revision manual.
- El sistema de manual reviews esta configurado para los ejercicios del tipo correspondiente.

---

## 4. Diagrama Mermaid

```mermaid
flowchart TD
    A[Docente navega a /teacher/reviews] --> B[TeacherReviewPanelPage monta]
    B --> C[GET /teacher/reviews/config/exercises - cargar config de ejercicios manuales]
    B --> D[GET /teacher/reviews/stats - estadisticas de pendientes]
    B --> E[GET /teacher/reviews/pending - lista paginada de pendientes]

    C & D & E --> F[Renderizar panel principal]
    F --> G{Filtros?}
    G -- Por modulo --> H[GET /teacher/reviews/pending?moduleId=:id]
    G -- Por aula --> I[GET /teacher/reviews/pending?classroomId=:id]
    G -- Ver todos mis reviews --> J[GET /teacher/reviews/my-reviews?status=pending|completed|...]
    H & I & J --> K[Actualizar lista]

    F --> L{Accion en review?}
    L -- Iniciar revision --> M[POST /teacher/reviews/:id/start]
    M --> N[Review cambia a in_progress]
    N --> O[Renderizar formulario de calificacion]

    O --> P{Decision?}
    P -- Completar --> Q[POST /teacher/reviews/:id/complete]
    Q --> R[BE distribuye XP + ML Coins al estudiante]
    R --> S[Toast: Review completada - XP y coins distribuidos]

    P -- Devolver para correccion --> T[POST /teacher/reviews/:id/return]
    T --> U[Ingresar feedback de correccion]
    U --> V[Review cambia a returned - estudiante reintenta]

    P -- Actualizar borrador --> W[PUT /teacher/reviews/:id]
    W --> X[Guardar calificacion parcial]
```

---

## 5. Secuencia FE -> BE -> DB

```
=== Carga inicial del panel ===
1. FE: TeacherReviewPanelPage monta -> dispara 3 fetches en paralelo
2. FE: GET /api/v1/teacher/reviews/config/exercises
3. BE: ManualReviewController.getManualReviewConfig() -> ManualReviewService.getManualReviewConfig()
4. DB: SELECT m.id, m.name, m.module_order, e.id, e.title, e.exercise_type
        FROM educational_content.modules m
        JOIN educational_content.exercises e ON m.id = e.module_id
        WHERE e.requires_manual_review = true
5. BE: Retorna { modules: [], exercises: [] } con la config de ejercicios que necesitan revision

6. FE: GET /api/v1/teacher/reviews/stats
7. BE: ManualReviewController.getPendingStats() -> ManualReviewService.getPendingReviewsStats()
8. DB: SELECT priority, COUNT(*) FROM progress_tracking.manual_reviews
        WHERE teacher_id = :teacherId AND status IN ('pending', 'in_progress')
        GROUP BY priority
9. BE: Retorna { totalPending, urgentCount, highCount, mediumCount, normalCount }

10. FE: GET /api/v1/teacher/reviews/pending?page=1&limit=20
11. BE: ManualReviewController.getPendingReviews() -> ManualReviewService.findPendingReviews()
12. DB: SELECT mr.*, es.submitted_answers, u.full_name as student_name, e.title, m.name as module_name
         FROM progress_tracking.manual_reviews mr
         JOIN progress_tracking.exercise_submissions es ON mr.submission_id = es.id
         JOIN auth.users u ON es.user_id = u.id
         JOIN educational_content.exercises e ON es.exercise_id = e.id
         JOIN educational_content.modules m ON e.module_id = m.id
         WHERE mr.teacher_id = :teacherId AND mr.status IN ('pending')
         ORDER BY mr.priority DESC, mr.created_at ASC
         LIMIT :limit OFFSET :offset
13. BE: Retorna { reviews: ManualReview[], total, page, limit, totalPages }

=== Iniciar una revision ===
14. FE: Click en boton "Iniciar Revision" en una review pendiente
15. FE: POST /api/v1/teacher/reviews/:reviewId/start
16. BE: ManualReviewController.startReview() -> ManualReviewService.startReview(id)
17. DB: UPDATE progress_tracking.manual_reviews SET status = 'in_progress', started_at = NOW()
         WHERE id = :reviewId
18. BE: Retorna ManualReview actualizada con status = 'in_progress'
19. FE: Actualiza la review en la lista, muestra formulario de calificacion

=== Completar una revision ===
20. FE: Docente asigna calificacion y hace click en "Completar"
21. FE: POST /api/v1/teacher/reviews/:reviewId/complete
22. BE: ManualReviewController.completeReview() -> ManualReviewService.completeReview(id)
23. BE: Valida que la review tenga score asignado (no null)
24. DB: UPDATE progress_tracking.manual_reviews SET status = 'completed', completed_at = NOW()
         WHERE id = :reviewId
25. DB: UPDATE progress_tracking.exercise_submissions SET score = :score, status = 'graded'
         WHERE id = :submissionId
26. BE: Calcula XP = floor(score * maxXpForExercise / 100)
        Calcula ML Coins = floor(XP / 5)
27. DB: UPDATE gamification_system.user_stats SET total_xp += :xp WHERE user_id = :studentId
         INSERT INTO gamification_system.coin_transactions (amount = :mlCoins, reason = 'manual_review') ...
28. BE: Verifica si hay rank up (nuevo rango maya) por XP acumulado
29. BE: Retorna CompleteReviewResult { review, rewards: { xp_earned, ml_coins_earned, rankUp? } }
30. FE: Toast: "Revision completada - [xp] XP y [coins] ML Coins otorgados a [nombre]"
31. FE: Invalida query de pendientes -> refetch

=== Devolver submission para correccion ===
32. FE: Click en "Devolver para Correccion" -> modal de feedback
33. FE: Docente ingresa feedback explicativo
34. FE: POST /api/v1/teacher/reviews/:reviewId/return
         Body: { feedback: "Necesitas desarrollar mas el argumento principal..." }
35. BE: ManualReviewController.returnForRevision() -> ManualReviewService.returnForRevision(id, feedback)
36. DB: UPDATE progress_tracking.manual_reviews SET status = 'returned', teacher_feedback = :feedback
        UPDATE progress_tracking.exercise_submissions SET status = 'returned'
37. BE: Retorna ManualReview actualizada
38. FE: Toast: "Submission devuelto al estudiante", review desaparece de lista de pendientes
```

---

## 6. Componentes y artefactos implicados

### Frontend

| Tipo | Archivo |
|------|---------|
| Pagina | `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx` |
| Ruta | `apps/frontend/src/App.tsx` (ruta: `/teacher/reviews`) |

### Backend

| Tipo | Archivo |
|------|---------|
| Controller | `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts` |
| Service | `apps/backend/src/modules/teacher/services/manual-review.service.ts` |
| DTOs | `apps/backend/src/modules/teacher/dto/create-review.dto.ts` |
| Entity | `apps/backend/src/modules/progress/entities/manual-review.entity.ts` |

### Base de Datos

| Tipo | Archivo |
|------|---------|
| Tabla manual_reviews | `apps/database/ddl/schemas/progress_tracking/tables/manual_reviews.sql` |
| Tabla exercise_submissions | `apps/database/ddl/schemas/progress_tracking/tables/exercise_submissions.sql` |
| Tabla user_stats | `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql` |
| Tabla coin_transactions | `apps/database/ddl/schemas/gamification_system/tables/coin_transactions.sql` |
| Vista teacher_pending_reviews | `apps/database/ddl/schemas/progress_tracking/views/teacher_pending_reviews.sql` |

---

## 7. Endpoints Involucrados

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/api/v1/teacher/reviews/config/exercises` | Config de ejercicios que requieren revision manual |
| GET | `/api/v1/teacher/reviews/stats` | Estadisticas de reviews por prioridad |
| GET | `/api/v1/teacher/reviews/pending` | Lista paginada de reviews pendientes (filtros: moduleId, classroomId) |
| GET | `/api/v1/teacher/reviews/pending/module/:moduleOrder` | Reviews pendientes por numero de modulo |
| GET | `/api/v1/teacher/reviews/my-reviews` | Todos los reviews del docente (filtro por status, modulo, ejercicio, aula) |
| GET | `/api/v1/teacher/reviews/:id` | Detalle de un review especifico |
| POST | `/api/v1/teacher/reviews` | Crear nueva evaluacion manual |
| PUT | `/api/v1/teacher/reviews/:id` | Actualizar evaluacion (borrador parcial) |
| POST | `/api/v1/teacher/reviews/:id/start` | Marcar review como in_progress |
| POST | `/api/v1/teacher/reviews/:id/complete` | Completar review y distribuir recompensas |
| POST | `/api/v1/teacher/reviews/:id/return` | Devolver submission para correccion |

---

## 8. Reglas y validaciones

| Regla | Capa | Descripcion |
|-------|------|-------------|
| Autenticacion + rol teacher | BE | JwtAuthGuard + RolesGuard(@Roles(ADMIN_TEACHER)) |
| Solo reviews de propios estudiantes | BE | ManualReviewService filtra por teacherId |
| Score requerido para completar | BE | Valida que el score no sea null antes de completar |
| Distribucion XP automatica | BE | XP = floor(score * maxXpForExercise / 100) |
| ML Coins proporcionales a XP | BE | ML Coins = floor(XP / 5) |
| Feedback obligatorio para devolver | BE | ReturnForRevisionDto valida que feedback no este vacio |
| Prioridad calculada automaticamente | DB | Funcion SQL asigna prioridad segun tiempo pendiente |
| Vista optimizada en BD | DB | teacher_pending_reviews view mejora rendimiento de consultas |

---

## 9. Manejo de errores

| Escenario | Capa | Codigo HTTP | Comportamiento |
|-----------|------|-------------|----------------|
| Token JWT expirado | BE | 401 | Redirige a login |
| Review no encontrada | BE | 404 | Toast de error |
| Score no asignado al completar | BE | 400 | BadRequestException, formulario muestra error |
| Feedback vacio al devolver | BE | 400 | Validacion en DTO, error en formulario |
| Review ya completada | BE | 400 | Mensaje informativo en FE |
| Error en distribucion de XP | BE | 500 | Log de error, review completa pero sin XP (edge case) |

---

## 10. Trazabilidad cruzada

| Capa | Archivo | Evidencia |
|------|---------|-----------|
| Frontend Pagina | `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx` | Panel de revision manual |
| Backend Controller | `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts` | Flujo completo de revision |
| Backend Service | `apps/backend/src/modules/teacher/services/manual-review.service.ts` | Logica: start, complete, return |
| DDL manual_reviews | `apps/database/ddl/schemas/progress_tracking/tables/manual_reviews.sql` | Estados y metadatos |
| DDL user_stats | `apps/database/ddl/schemas/gamification_system/tables/01-user_stats.sql` | Acumulacion de XP |

---

## 11. Referencias

- Flujo revision manual M3-M5 (contexto educativo): [FL-TCH-07](./FLUJO-REVISION-MANUAL-M3-M5.md)
- Flujo respuestas ejercicios: [FL-TCH-12](./FLUJO-RESPUESTAS-EJERCICIOS.md)
- Flujo gestion estudiantes: [FL-TCH-09](./FLUJO-GESTION-ESTUDIANTES.md)
