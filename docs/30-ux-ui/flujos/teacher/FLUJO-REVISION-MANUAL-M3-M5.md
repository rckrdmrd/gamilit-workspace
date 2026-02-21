# Flujo Teacher - Revision Manual y Calificacion (Modulos 3-5)

**Version:** 1.0.0  
**Fecha:** 2026-02-17  
**Estado:** Activo

---

## Resumen

Modela el proceso docente de cola pendiente -> evaluacion con rubrica -> completado -> entrega de recompensas al estudiante.

Al completar la revision, backend genera notificacion in-app para estudiante con `notificationType=exercise_feedback` y datos de recompensas.

## Diagrama Mermaid

```mermaid
sequenceDiagram
    participant T as Teacher
    participant FE as ReviewPanel
    participant BE as ManualReviewService
    participant DB as Database
    participant GM as Rewards

    T->>FE: Abre pendientes M3-M5
    FE->>BE: GET /teacher/reviews/pending
    BE->>DB: Consulta submissions pending_review
    T->>FE: Guarda rubrica y score
    FE->>BE: PUT /teacher/reviews/:id
    T->>FE: Completar calificacion
    FE->>BE: POST /teacher/reviews/:id/complete
    BE->>DB: Marca review como completed y submission graded
    BE->>GM: claimRewards estudiante
    GM->>DB: Actualiza XP/coins
    BE-->>FE: Resultado final
```

## Trazabilidad

### Frontend
- `apps/frontend/src/apps/teacher/pages/TeacherReviewPanel.tsx`
- `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`
- `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts`

### Backend
- `apps/backend/src/modules/teacher/controllers/manual-review.controller.ts`
- `apps/backend/src/modules/teacher/services/manual-review.service.ts`
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`
- `apps/backend/src/modules/notifications/services/notification.service.ts`

### Datos
- `progress_tracking.manual_reviews`
- `progress_tracking.exercise_submissions`
- `gamification_system.user_stats`

## Riesgo funcional documentado

- Completar review y reclamar recompensas deben tratarse como unidad consistente para evitar `completed` sin recompensa aplicada.
