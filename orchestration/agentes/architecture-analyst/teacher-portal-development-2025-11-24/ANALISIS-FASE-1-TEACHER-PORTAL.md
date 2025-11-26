# ANALISIS FASE 1: PORTAL TEACHER - PLAN DE DESARROLLO

**Fecha:** 2025-11-24
**Analista:** Architecture-Analyst
**Proyecto:** GAMILIT - Portal Teacher
**Version:** 1.0

---

## RESUMEN EJECUTIVO

Se ha realizado un analisis exhaustivo del Portal Teacher identificando:

- **13 paginas** en el portal teacher
- **9 paginas VIABLES** para desarrollo (tienen datos actualizados por Student)
- **3 paginas DESCARTADAS** (no tienen datos de actividad Student)
- **1 pagina NUEVA** a desarrollar (Respuestas de Ejercicios)
- **3 paginas** que requieren **ACOTAMIENTO DE ALCANCE**

---

## 1. MAPEO DE DEPENDENCIAS: PAGINA - BASE DE DATOS - PORTAL STUDENT

### LEYENDA
- **DATOS STUDENT**: Indica si la tabla se actualiza cuando el estudiante usa la plataforma
- **TRIGGER**: Indica si hay triggers automaticos que actualizan los datos
- **VIABILIDAD**: Si la pagina tiene datos reales para mostrar

---

### 1.1 PAGINAS VIABLES PARA DESARROLLO (DATOS ACTUALIZADOS POR STUDENT)

| # | Pagina | Tablas BD | Datos Student | Trigger | Viabilidad |
|---|--------|-----------|---------------|---------|------------|
| 1 | **TeacherDashboardPage** | `exercise_attempts`, `module_progress`, `user_stats`, `student_intervention_alerts` | SI | SI (trg_update_user_stats) | **VIABLE** |
| 2 | **TeacherProgressPage** | `module_progress`, `exercise_attempts` | SI | SI (trg_update_module_progress) | **VIABLE** |
| 3 | **TeacherAnalyticsPage** | `exercise_submissions`, `module_progress`, `user_stats`, `classroom_members` | SI | SI | **VIABLE** |
| 4 | **TeacherStudentsPage** | `classroom_members`, `profiles`, `module_progress`, `user_stats` | SI | SI | **VIABLE** |
| 5 | **TeacherAlertsPage** | `student_intervention_alerts` | SI | SI (trg_generate_alerts) | **VIABLE** |
| 6 | **TeacherMonitoringPage** | `classroom_members`, `user_stats` (last_activity_at) | SI | SI | **VIABLE** |
| 7 | **TeacherGamificationPage** | `user_stats` (XP, ML Coins, ranks), `user_ranks`, `achievements` | SI | SI (trg_check_rank) | **VIABLE** |
| 8 | **TeacherClassesPage** | `classrooms`, `classroom_members`, `teacher_classrooms` | PARCIAL (CRUD Teacher) | NO | **VIABLE** |
| 9 | **TeacherAssignmentsPage** | `assignments`, `assignment_submissions` | SI (cuando student entrega) | NO | **VIABLE** |

---

### 1.2 PAGINAS A DESCARTAR (SIN DATOS DE ACTIVIDAD STUDENT)

| # | Pagina | Razon de Descarte | Alternativa |
|---|--------|-------------------|-------------|
| 10 | **TeacherResourcesPage** | En construccion (placeholder). No tiene tablas BD ni datos | Fase 3 - Extension futura |
| 11 | **TeacherCommunicationPage** | Mensajeria entre usuarios. No depende de actividad academica Student | Desarrollar solo notificaciones basicas |
| 12 | **TeacherContentPage** | CRUD de contenido del Teacher. Es entrada de datos, no visualizacion de actividad Student | Mantener CRUD basico existente |

---

### 1.3 PAGINAS QUE REQUIEREN ACOTAMIENTO DE ALCANCE

| # | Pagina | Funcionalidad Original | Acotamiento Propuesto | Justificacion |
|---|--------|------------------------|----------------------|---------------|
| 1 | **TeacherReportsPage** | Generacion de reportes PDF/Excel con ML predicciones | **ACOTAR**: Solo reportes de datos existentes (progreso, scores, alertas). Sin ML predictions | MLPredictorService no esta implementado |
| 2 | **TeacherAnalyticsPage** | Analytics con insights ML y predicciones | **ACOTAR**: Solo metricas calculadas (promedios, completion rates, score distribution). Sin predictions | StudentInsightsResponseDto tiene campos simulados |
| 3 | **TeacherGamificationPage** | Gestion completa de gamificacion + bonus | **ACOTAR**: Solo visualizacion de stats + otorgar bonus ML Coins. Sin configuracion de rewards | Rewards vienen de la BD, no son configurables por teacher |

---

## 2. NUEVA PAGINA: VISUALIZACION DE RESPUESTAS DE EJERCICIOS

### 2.1 VIABILIDAD: **ALTA**

**Justificacion:**
- Los datos YA EXISTEN en las tablas `exercise_attempts` y `exercise_submissions`
- El portal Student YA ACTUALIZA estas tablas cuando responde ejercicios
- Los endpoints de consulta YA EXISTEN en el backend (`GradingService.getSubmissions`)

### 2.2 DATOS DISPONIBLES EN BD

**Tabla `exercise_attempts`** (autocorregibles):
```typescript
{
  id: UUID,
  user_id: UUID,              // Estudiante
  exercise_id: UUID,          // Ejercicio
  attempt_number: number,     // Numero de intento
  submitted_answers: JSONB,   // RESPUESTAS DEL ESTUDIANTE
  is_correct: boolean,        // Resultado
  score: number,              // Puntaje
  time_spent_seconds: number, // Tiempo
  hints_used: number,         // Pistas usadas
  comodines_used: string[],   // Power-ups
  xp_earned: number,          // XP ganado
  ml_coins_earned: number,    // Monedas ganadas
  submitted_at: timestamp     // Fecha envio
}
```

**Tabla `exercise_submissions`** (calificacion manual):
```typescript
{
  id: UUID,
  user_id: UUID,
  exercise_id: UUID,
  answer_data: JSONB,         // RESPUESTAS DEL ESTUDIANTE
  is_correct: boolean,
  score: number,
  max_score: number,
  feedback: string,           // Retroalimentacion del teacher
  status: 'draft'|'submitted'|'graded'|'reviewed',
  submitted_at: timestamp,
  graded_at: timestamp
}
```

### 2.3 ESPECIFICACION DE LA PAGINA

**Nombre:** `TeacherExerciseResponsesPage`
**Ruta:** `/teacher/responses`

**Funcionalidades:**
1. **Listado de respuestas** con filtros:
   - Por estudiante
   - Por ejercicio/modulo
   - Por fecha
   - Por estado (correcto/incorrecto/pendiente)
   - Por classroom

2. **Detalle de respuesta**:
   - Mostrar `submitted_answers` / `answer_data` formateado
   - Mostrar respuesta correcta del ejercicio (JOIN con `exercises.content`)
   - Comparacion visual respuesta vs correcta
   - Tiempo invertido
   - Intentos previos del mismo ejercicio

3. **Acciones del Teacher**:
   - Agregar feedback (para submissions)
   - Ajustar calificacion (override)
   - Exportar respuestas a CSV

### 2.4 ENDPOINTS NECESARIOS

| Endpoint | Existe | Accion |
|----------|--------|--------|
| `GET /teacher/submissions` | SI | Usar existente |
| `GET /teacher/submissions/:id` | SI | Usar existente |
| `GET /teacher/attempts` | NO | **CREAR** |
| `GET /teacher/attempts/:exerciseId/student/:studentId` | NO | **CREAR** |
| `GET /teacher/exercises/:id/responses` | NO | **CREAR** |

---

## 3. CLASIFICACION FINAL DE PAGINAS

### 3.1 DESARROLLAR (9 paginas)

| Prioridad | Pagina | Estado Actual | Desarrollo Requerido |
|-----------|--------|---------------|---------------------|
| **P0** | TeacherDashboardPage | 80% funcional | Conectar widgets restantes |
| **P0** | TeacherProgressPage | 70% funcional | Completar filtros y charts |
| **P0** | TeacherStudentsPage | 75% funcional | Completar detalle estudiante |
| **P1** | TeacherAlertsPage | 90% funcional | Minor fixes UI |
| **P1** | TeacherAnalyticsPage | 70% funcional | Acotar a metricas sin ML |
| **P1** | TeacherMonitoringPage | 85% funcional | Mejorar auto-refresh |
| **P2** | TeacherClassesPage | 95% funcional | CRUD completo |
| **P2** | TeacherAssignmentsPage | 80% funcional | Mejorar flujo creacion |
| **P2** | TeacherGamificationPage | 70% funcional | Acotar a visualizacion |

### 3.2 NUEVA PAGINA A CREAR (P0)

| Pagina | Prioridad | Justificacion |
|--------|-----------|---------------|
| **TeacherExerciseResponsesPage** | **P0** | Solicitud explicita del usuario. Datos disponibles. |

### 3.3 DESCARTAR (3 paginas)

| Pagina | Razon |
|--------|-------|
| TeacherResourcesPage | Fase 3 - Sin BD ni datos |
| TeacherCommunicationPage | No depende de actividad Student |
| TeacherContentPage | Entrada de datos, no visualizacion |

### 3.4 ACOTAR ALCANCE (3 paginas)

| Pagina | Alcance Original | Alcance Acotado |
|--------|------------------|-----------------|
| TeacherReportsPage | Reportes + ML | Solo reportes de datos existentes |
| TeacherAnalyticsPage | Analytics + Insights ML | Solo metricas calculadas |
| TeacherGamificationPage | Gestion completa | Solo visualizacion + bonus |

---

## 4. DEPENDENCIAS DEL DESARROLLO

### 4.1 DEPENDENCIAS DE BASE DE DATOS

| Tabla | Schema | Estado | Necesita Cambios |
|-------|--------|--------|------------------|
| `exercise_attempts` | progress_tracking | COMPLETA | NO |
| `exercise_submissions` | progress_tracking | COMPLETA | NO |
| `module_progress` | progress_tracking | COMPLETA | NO |
| `student_intervention_alerts` | progress_tracking | COMPLETA | NO |
| `user_stats` | gamification_system | COMPLETA | NO |
| `classrooms` | social_features | COMPLETA | NO |
| `classroom_members` | social_features | COMPLETA | NO |
| `exercises` | educational_content | COMPLETA | NO |

**Conclusion BD:** No se requieren cambios en la base de datos.

### 4.2 DEPENDENCIAS DE BACKEND

| Servicio | Estado | Cambios Necesarios |
|----------|--------|-------------------|
| `GradingService` | COMPLETO | Agregar endpoint para attempts |
| `AnalyticsService` | COMPLETO | Ninguno |
| `InterventionAlertsService` | COMPLETO | Ninguno |
| `TeacherClassroomsCrudService` | COMPLETO | Ninguno |
| **NUEVO: ExerciseResponsesService** | NO EXISTE | **CREAR** |

### 4.3 DEPENDENCIAS DE FRONTEND

| Componente/Hook | Estado | Cambios Necesarios |
|-----------------|--------|-------------------|
| `useGrading` | EXISTE | Extender para attempts |
| `useAnalytics` | EXISTE | Ninguno |
| `useInterventionAlerts` | EXISTE | Ninguno |
| **NUEVO: useExerciseResponses** | NO EXISTE | **CREAR** |
| **NUEVO: ExerciseResponsesPage** | NO EXISTE | **CREAR** |
| **NUEVO: ResponseDetailModal** | NO EXISTE | **CREAR** |

---

## 5. IMPACTO EN CAPAS

```
                    IMPACTO POR CAPA
┌────────────────────────────────────────────────────┐
│                   FRONTEND                         │
│  ✅ 9 paginas a completar/mejorar                  │
│  🆕 1 pagina nueva (ExerciseResponses)             │
│  🆕 2-3 componentes nuevos                         │
│  🆕 1 hook nuevo (useExerciseResponses)            │
├────────────────────────────────────────────────────┤
│                   BACKEND                          │
│  ✅ Servicios existentes suficientes               │
│  🆕 3 endpoints nuevos para attempts/responses     │
│  🆕 1 servicio nuevo (ExerciseResponsesService)    │
│  📝 DTOs nuevos para responses                     │
├────────────────────────────────────────────────────┤
│                   DATABASE                         │
│  ✅ Sin cambios requeridos                         │
│  ✅ Tablas y triggers existentes son suficientes   │
│  ✅ RLS policies ya configuradas                   │
└────────────────────────────────────────────────────┘
```

---

## 6. ARCHIVOS Y TRAZAS RELEVANTES

### Trazas Actualizadas
- `orchestration/trazas/TRAZA-TAREAS-FRONTEND.md` - Tareas frontend teacher
- `orchestration/trazas/TRAZA-TAREAS-BACKEND.md` - Tareas backend teacher

### Inventarios
- `docs/90-transversal/inventarios/FRONTEND_INVENTORY.yml` - v2.6
- `docs/90-transversal/inventarios/BACKEND_INVENTORY.yml` - v2.6
- `docs/90-transversal/inventarios/DATABASE_INVENTORY.yml` - v2.4

### Archivos Backend Relevantes
- `apps/backend/src/modules/teacher/services/grading.service.ts`
- `apps/backend/src/modules/teacher/services/analytics.service.ts`
- `apps/backend/src/modules/progress/entities/exercise-attempt.entity.ts`
- `apps/backend/src/modules/progress/entities/exercise-submission.entity.ts`

### Archivos Frontend Relevantes
- `apps/frontend/src/apps/teacher/pages/` - 13 paginas
- `apps/frontend/src/apps/teacher/hooks/` - 15 hooks
- `apps/frontend/src/apps/teacher/components/` - 30+ componentes

---

## 7. CONCLUSION FASE 1

### Hallazgos Principales

1. **El Portal Teacher tiene buena base** - 90% de las paginas son funcionales
2. **Los datos del Student SI estan disponibles** - Triggers automaticos actualizan tablas
3. **La nueva pagina de respuestas ES VIABLE** - Datos ya existen en BD
4. **Se requiere acotamiento de alcance** en 3 paginas por funcionalidad ML no implementada
5. **3 paginas se descartan** por no tener datos de actividad Student

### Proximos Pasos (FASE 2)

1. Crear plan de desarrollo priorizado con tareas especificas
2. Definir agentes a orquestar (Backend-Agent, Frontend-Agent)
3. Estimar orden de ejecucion (paralelo vs secuencial)

---

**Estado:** FASE 1 COMPLETADA
**Siguiente:** FASE 2 - PLANEACION
