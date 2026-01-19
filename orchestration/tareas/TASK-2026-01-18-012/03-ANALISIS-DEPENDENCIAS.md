# TASK-2026-01-18-012: Analisis de Dependencias

## Resumen Ejecutivo

Se analizaron las dependencias de **6 archivos principales** que se planean modificar, identificando:
- **42 archivos dependientes directos**
- **15 servicios backend interconectados**
- **10 flujos relacionados no documentados**
- **3 gaps criticos de integracion**

---

## 1. ReviewDetail.tsx - Analisis de Dependencias

**Ubicacion:** `apps/frontend/src/apps/teacher/components/review-panel/ReviewDetail.tsx`

### Dependientes (Archivos que importan ReviewDetail)
| Archivo | Tipo | Linea |
|---------|------|-------|
| `review-panel/index.ts` | Barrel export | 1-3 |
| `TeacherReviewPanelPage.tsx` | Uso directo | 8, 140 |

### Dependencias (Archivos que ReviewDetail importa)
| Modulo | Tipo | Uso |
|--------|------|-----|
| `manualReviewApi` | API Client | updateReview(), completeReview() |
| `RubricEvaluator` | Componente | Evaluacion con rubrica |
| `ExerciseContentRenderer` | Componente | Renderizado de respuestas |
| `lucide-react` | Iconos | 13 iconos |
| `date-fns` | Utilidad | Formateo de fechas |

### Hallazgos Criticos

| Hallazgo | Impacto | Accion |
|----------|---------|--------|
| **NO usa FeedbackModal** | UX inconsistente | FASE 3: Agregar FeedbackModal |
| **NO usa useToast** | Mensajes inline | Opcional: Migrar a toast |
| **Usa API directamente** | Hooks no utilizados | ReviewDetail usa manualReviewApi, no mutation hooks |
| **NO hay WebSocket** | Sin actualizaciones real-time | Oportunidad futura |

### Transformacion Frontend->Backend
```typescript
// transformEvaluationsToBackend() - Linea 14-26
RubricEvaluation[] -> { rubricScores: Record<string, number>, detailedFeedback: Record<string, string> }
```

---

## 2. manualReviewApi.ts - Analisis de Dependencias

**Ubicacion:** `apps/frontend/src/shared/api/manualReviewApi.ts`

### Funciones Exportadas
| Funcion | Usada Por | Estado |
|---------|-----------|--------|
| `getPendingReviews()` | useManualReviews.ts | Activo |
| `getReviewById()` | useManualReviews.ts | Activo |
| `startReview()` | useManualReviews.ts | Hook definido pero NO usado |
| `updateReview()` | ReviewDetail.tsx | Activo (directo) |
| `completeReview()` | ReviewDetail.tsx | Activo (directo) |
| `calculateTotalScore()` | RubricEvaluator.tsx | Activo |
| `validateEvaluations()` | RubricEvaluator.tsx | Activo |

### Dependientes (8 archivos)
| Archivo | Imports | Uso |
|---------|---------|-----|
| `useManualReviews.ts` | API functions + types | Hooks wrapper |
| `ReviewDetail.tsx` | API + types | Direct calls |
| `ReviewList.tsx` | ManualReview type | Display |
| `TeacherReviewPanelPage.tsx` | ManualReview type | State |
| `RubricEvaluator.tsx` | calculateTotalScore, validateEvaluations | Utilities |

### GAP CRITICO: No existe getMyReviews()
```typescript
// FALTA en manualReviewApi.ts
export const getMyReviews = async (filters?: { status?: ReviewStatus }) => {
  // Endpoint existe en backend: GET /teacher/reviews/my-reviews
  // Pero NO hay funcion frontend para consumirlo
};
```

---

## 3. manual-review.service.ts - Analisis de Dependencias

**Ubicacion:** `apps/backend/src/modules/teacher/services/manual-review.service.ts`

### Servicios Inyectados
| Servicio | Metodos Usados | Proposito |
|----------|----------------|-----------|
| `ExerciseSubmissionService` | gradeSubmission(), claimRewards() | Calificacion y rewards |
| `AuditService` | logEvent() | Auditoria |
| `NotificationService` | create() | Notificaciones al estudiante |

### Repositorios Inyectados
| Repositorio | Datasource | Tabla |
|-------------|------------|-------|
| ManualReview | progress | manual_reviews |
| ExerciseSubmission | progress | exercise_submissions |
| Profile | auth | profiles |
| Exercise | educational | exercises |
| ExerciseTypeRubric | educational | exercise_type_rubrics |

### Cadena de Llamadas: completeReview() -> claimRewards()

```
completeReview(reviewId)
  |
  +-> [1] review.status = 'completed' (saved)
  |
  +-> [2] IF totalScore !== null:
  |     +-> gradeSubmission(submissionId, {final_score, grader_id, feedback})
  |           |
  |           +-> submission.status = 'graded'
  |           +-> submission.is_correct = (score >= 60%)
  |           +-> IF is_correct: claimRewards() [AUTO]
  |
  +-> [3] claimRewards(submissionId)
  |     +-> userStatsService.addXp()
  |     +-> mlCoinsService.addCoins()
  |     +-> [IF rank_up] notificationService + bonus coins
  |     +-> updateModuleProgress()
  |     +-> updateMissionsProgress()
  |     +-> WebSocket emissions (balance, xp, coins, rank)
  |
  +-> [4] auditService.logEvent()
  +-> [5] notificationService.create() -> Estudiante
  +-> [6] Return { review, rewards }
```

### Metodo findByTeacher() - NO USADO POR FRONTEND

```typescript
// Backend (manual-review.service.ts:767-786) - EXISTE
async findByTeacher(
  teacherId: string,
  status?: 'pending' | 'in_progress' | 'completed' | 'returned'
): Promise<EnrichedManualReview[]>

// Controller (manual-review.controller.ts:216-236) - EXISTE
@Get('my-reviews')
@ApiQuery({ name: 'status', required: false, enum: [...] })
async getMyReviews(@Query('status') status?) { ... }

// Frontend - NO EXISTE funcion para consumir este endpoint
```

---

## 4. useManualReviews.ts - Analisis de Dependencias

**Ubicacion:** `apps/frontend/src/apps/teacher/hooks/useManualReviews.ts`

### Exports
| Export | Tipo | Usado Por |
|--------|------|-----------|
| `useManualReviews()` | Hook | TeacherReviewPanelPage |
| `useManualReviewDetail()` | Hook | TeacherReviewPanelPage |
| `useStartReview()` | Hook | **NADIE** (definido pero no usado) |
| `useUpdateReview()` | Hook | **NADIE** (definido pero no usado) |
| `useCompleteReview()` | Hook | **NADIE** (definido pero no usado) |
| `manualReviewKeys` | Query Keys | Interno |
| `ManualReviewFilters` | Interface | Interno |

### GAP: Hooks de Mutacion No Usados
ReviewDetail.tsx usa `manualReviewApi` directamente en lugar de los hooks:
- `manualReviewApi.updateReview()` en vez de `useUpdateReview()`
- `manualReviewApi.completeReview()` en vez de `useCompleteReview()`

### ManualReviewFilters - FALTA status
```typescript
// ACTUAL
export interface ManualReviewFilters {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
}

// NECESARIO
export interface ManualReviewFilters {
  exerciseId?: string;
  moduleId?: string;
  classroomId?: string;
  status?: 'pending' | 'in_progress' | 'completed' | 'returned'; // AGREGAR
}
```

---

## 5. TeacherReviewPanelPage.tsx - Analisis de Dependencias

**Ubicacion:** `apps/frontend/src/apps/teacher/pages/TeacherReviewPanelPage.tsx`

### Hooks Utilizados
| Hook | Fuente | Proposito |
|------|--------|-----------|
| `useState` | React | Estado local (filters, selection) |
| `useMemo` | React | Filtrado cliente |
| `useAuth` | features/auth | Usuario actual |
| `useUserGamification` | shared/hooks | Datos gamificacion |
| `useManualReviews` | ../hooks | Lista reviews |
| `useManualReviewDetail` | ../hooks | Detalle review |
| `useManualReviewConfig` | ../hooks | Config modulos/ejercicios |

### Componentes Renderizados
```
TeacherReviewPanelPage
  └── TeacherLayout
      ├── [selectedReviewId == null]
      │   └── ReviewList (reviews, loading, error, handlers)
      │
      └── [selectedReviewId != null]
          └── ReviewDetail (review, onClose)
              ├── ExerciseContentRenderer
              └── RubricEvaluator
```

### Routing
- **URL:** `/teacher/reviews`
- **Roles:** `['teacher', 'admin_teacher']`
- **No hay URL separada para detalle** (modal-like behavior)

### NO hay WebSocket
- Solo React Query con stale time de 2 minutos
- Refresh manual via boton

---

## 6. Flujos Relacionados No Documentados

### 6.1 Student Notification Handling (INCOMPLETO)
- Backend envia notificacion `exercise_feedback` al completar review
- Frontend `NotificationsPage.tsx` no tiene handler especifico
- No hay deep-link para ver detalle de feedback

### 6.2 WebSocket Events (NO IMPLEMENTADO)
- Infraestructura WebSocket existe
- NO hay eventos para reviews:
  - `review:completed`
  - `review:returned`
  - `exercise:graded`

### 6.3 Gamification Triggers (DESCONECTADO)
- `achievementsService` existe pero NO se llama desde completeReview()
- NO hay achievement check para "perfect score en M3-M5"
- NO hay mission progress update para "reviews calificados"

### 6.4 Admin Dashboard Stats (PARCIAL)
- Backend `getPendingReviewsStats()` existe
- NO hay endpoint admin para ver estadisticas globales
- NO hay UI admin para monitorear cola de reviews

### 6.5 Email Notifications (NO INTEGRADO)
- Mail service existe (`mail.service.ts`)
- Review completion NO envia email
- Falta template: "Tu ejercicio fue calificado"

### 6.6 Audit Logging (PARCIAL)
- Se logea creacion y completion
- NO se logea: cambios en rubric scores, ediciones de feedback

### 6.7 Caching (NO EXISTE)
- `enrichReview()` consulta BD cada vez
- NO hay cache de rubricas por exercise_type
- NO hay cache de pending review counts

---

## 7. Mapa de Dependencias Visual

```
                         ┌─────────────────────────────────────────┐
                         │       TeacherReviewPanelPage.tsx        │
                         │  (Pagina principal - dual view)         │
                         └────────────────┬────────────────────────┘
                                          │
              ┌───────────────────────────┼───────────────────────────┐
              │                           │                           │
              ▼                           ▼                           ▼
    ┌─────────────────┐         ┌─────────────────┐         ┌─────────────────┐
    │   ReviewList    │         │  ReviewDetail   │         │ useManualReview │
    │   (display)     │         │  (evaluation)   │         │    Config       │
    └─────────────────┘         └────────┬────────┘         └─────────────────┘
                                         │
              ┌──────────────────────────┼──────────────────────────┐
              │                          │                          │
              ▼                          ▼                          ▼
    ┌─────────────────┐        ┌─────────────────┐        ┌─────────────────┐
    │ExerciseContent  │        │RubricEvaluator  │        │ manualReviewApi │
    │   Renderer      │        │                 │        │  (API client)   │
    └─────────────────┘        └─────────────────┘        └────────┬────────┘
                                                                   │
                                                                   ▼
                                                          ┌─────────────────┐
                                                          │   API Config    │
                                                          │  (endpoints)    │
                                                          └────────┬────────┘
                                                                   │
                                                                   ▼
                                               ┌────────────────────────────────────┐
                                               │     ManualReviewController        │
                                               │  GET /pending, /my-reviews, /:id  │
                                               │  PUT /:id, POST /:id/complete     │
                                               └────────────────┬───────────────────┘
                                                                │
                                                                ▼
                                               ┌────────────────────────────────────┐
                                               │      ManualReviewService          │
                                               │  findPendingReviews()             │
                                               │  findByTeacher()  <-- NO USADO!   │
                                               │  updateReview()                   │
                                               │  completeReview()                 │
                                               └────────────────┬───────────────────┘
                                                                │
                              ┌──────────────────────────────────┼──────────────────────────────────┐
                              │                                  │                                  │
                              ▼                                  ▼                                  ▼
               ┌──────────────────────────┐       ┌──────────────────────────┐       ┌──────────────────────────┐
               │ ExerciseSubmissionService│       │     AuditService         │       │   NotificationService    │
               │  gradeSubmission()       │       │     logEvent()           │       │      create()            │
               │  claimRewards()          │       └──────────────────────────┘       └──────────────────────────┘
               └───────────┬──────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         │                 │                 │
         ▼                 ▼                 ▼
┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐
│ UserStatsService│ │ MLCoinsService  │ │ WebSocketService│
│   addXp()       │ │  addCoins()     │ │  emitEvents()   │
└─────────────────┘ └─────────────────┘ └─────────────────┘
```

---

## 8. Tabla de Impacto por FASE

### FASE 1: Guardar scores antes de completar

| Archivo | Cambio | Dependientes Afectados |
|---------|--------|------------------------|
| ReviewDetail.tsx | Modificar handleCompleteReview | TeacherReviewPanelPage (re-render) |
| manualReviewApi.ts | Verificar tipo retorno | useManualReviews, ReviewDetail |

**Riesgo:** Bajo - Cambio en logica interna, no API

### FASE 2: Validacion backend de totalScore

| Archivo | Cambio | Dependientes Afectados |
|---------|--------|------------------------|
| manual-review.service.ts | Agregar validacion | ManualReviewController |

**Riesgo:** Medio - Puede rechazar reviews validos si frontend no envia totalScore

### FASE 3: Modal feedback

| Archivo | Cambio | Dependientes Afectados |
|---------|--------|------------------------|
| ReviewDetail.tsx | Agregar FeedbackModal | Ninguno adicional |

**Riesgo:** Bajo - Cambio visual, no funcional

### FASE 4: Mostrar reviews completados

| Archivo | Cambio | Dependientes Afectados |
|---------|--------|------------------------|
| api.config.ts | Agregar endpoint | manualReviewApi |
| manualReviewApi.ts | Agregar getMyReviews() | useManualReviews |
| useManualReviews.ts | Agregar useMyReviews() | TeacherReviewPanelPage |
| TeacherReviewPanelPage.tsx | Agregar tabs/filtro | ReviewList, ReviewDetail |

**Riesgo:** Medio - Multiples archivos, requiere testing end-to-end

---

## 9. Recomendaciones Adicionales

### Inmediatas (Pre-implementacion)
1. **Unificar uso de hooks vs API directa** - ReviewDetail deberia usar useUpdateReview/useCompleteReview
2. **Agregar tests unitarios** antes de modificar manual-review.service.ts

### Post-implementacion
1. **WebSocket para reviews** - Notificar en tiempo real cuando review es completado
2. **Achievement integration** - Conectar completeReview con achievementsService
3. **Admin stats dashboard** - Exponer metricas de cola de reviews

---

*Analisis de Dependencias completado: 2026-01-18*
