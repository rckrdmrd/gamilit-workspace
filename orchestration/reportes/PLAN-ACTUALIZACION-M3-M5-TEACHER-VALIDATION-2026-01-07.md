# PLAN DE ACTUALIZACIÓN: Integración M3-M5 con Validación del Maestro

**Fecha:** 2026-01-07
**Autor:** Claude Opus 4.5 (Arquitecto de Soluciones)
**Versión:** 1.0
**Estado:** FASE 3 - Planeación Basada en Análisis

---

## OBJETIVO

Actualizar la documentación y definiciones del proyecto Gamilit para que todos los ejercicios de los módulos 3-5 estén completamente integrados con:
1. La validación por parte del maestro desde el portal teacher
2. Una página de respuestas M3-M5 donde se muestran las respuestas de los estudiantes
3. Un flujo claro: estudiante hace ejercicio → mensaje de confirmación → maestro evalúa → recompensas asignadas → notificación al estudiante

---

## RESUMEN DEL ANÁLISIS

### Estado Actual
| Componente | Estado | Acción |
|------------|--------|--------|
| Backend | ✅ Implementado | Validar y documentar |
| Frontend Teacher | ✅ Implementado | Documentar TeacherExerciseResponsesPage |
| Frontend Student | ✅ Implementado | Unificar mensajes |
| Database | ✅ Implementado | Validar triggers |
| Documentación | ⚠️ Incompleta | **CREAR/ACTUALIZAR** |

---

## PLAN DE EJECUCIÓN POR FASES

### FASE 1: DOCUMENTACIÓN DEL FLUJO COMPLETO (Prioridad: CRÍTICA)

#### 1.1 Crear Documento de Flujo Consolidado
**Archivo a crear:** `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

**Contenido:**
- Diagrama del flujo completo (estudiante → backend → teacher → rewards → notificación)
- Descripción de cada paso
- Estados de la submission (draft → submitted → pending_review → graded → reviewed)
- Mensajes que ve el estudiante
- Interfaz del maestro
- Triggers de base de datos
- Cálculo de recompensas

**Dependencias:** Ninguna
**Estimación:** 1 archivo nuevo

#### 1.2 Actualizar Especificaciones de Ejercicios M3
**Archivos a actualizar/crear:**
- `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M3-001-ejercicios-m3.md`

**Contenido a agregar:**
- Sección "Flujo de Validación" para cada ejercicio
- Mensaje de confirmación al estudiante
- Criterios de evaluación del maestro
- Recompensas configuradas

**Dependencias:** Documento 1.1
**Estimación:** 1 archivo

#### 1.3 Documentar Página de Respuestas M3-M5
**Archivos a actualizar:**
- `docs/99-finiquito/Manual_Portal_Maestros_ACTUALIZADO.md`

**Contenido a agregar:**
- Capítulo específico "Revisión de Ejercicios M3-M5"
- Cómo acceder a /teacher/reviews
- Cómo usar la rúbrica
- Flujo de calificación paso a paso
- Screenshots o descripciones de UI

**Dependencias:** Documentos 1.1 y 1.2
**Estimación:** 1 archivo actualizado

---

### FASE 2: VALIDACIÓN DE IMPLEMENTACIÓN (Prioridad: ALTA)

#### 2.1 Validar Ejercicios M3 tienen requires_manual_grading=TRUE
**Archivos a verificar:**
- `apps/database/seeds/dev/educational_content/04-exercises-module3.sql`
- `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`

**Validación:**
```sql
-- Todos deben retornar requires_manual_grading = true
SELECT exercise_type, requires_manual_grading
FROM educational_content.exercises
WHERE module_id IN (SELECT id FROM educational_content.modules WHERE order_index = 3);
```

**Acción si falla:** Crear migration para corregir

#### 2.2 Validar Ejercicios M4 tienen requires_manual_grading=TRUE
**Archivos a verificar:**
- `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`
- `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

**Validación:** Similar a 2.1 pero order_index = 4

#### 2.3 Validar Ejercicios M5 tienen requires_manual_grading=TRUE
**Archivos a verificar:**
- `apps/database/seeds/dev/educational_content/06-exercises-module5.sql`
- `apps/database/seeds/prod/educational_content/06-exercises-module5.sql`

**Validación:** Similar a 2.1 pero order_index = 5

#### 2.4 Validar Triggers Existen y Funcionan
**Archivos a verificar:**
- `apps/database/ddl/schemas/progress_tracking/triggers/31-trg_update_user_stats_on_submission.sql`
- `apps/database/ddl/schemas/progress_tracking/triggers/27-trg_update_module_progress_on_submission.sql`
- `apps/database/ddl/schemas/progress_tracking/triggers/25-trg_update_missions_on_submission.sql`

**Validación:**
```sql
-- Verificar que existen
SELECT tgname, tgrelid::regclass, tgfoid::regproc
FROM pg_trigger
WHERE tgrelid = 'progress_tracking.exercise_submissions'::regclass;
```

---

### FASE 3: UNIFICACIÓN DE MENSAJES FRONTEND (Prioridad: MEDIA)

#### 3.1 Revisar Mensajes de Ejercicios M3
**Archivos a revisar:**
- `apps/frontend/src/features/mechanics/module3/TribunalOpiniones/TribunalOpinionesExercise.tsx`
- `apps/frontend/src/features/mechanics/module3/DebateDigital/DebateDigitalExercise.tsx`
- `apps/frontend/src/features/mechanics/module3/AnalisisFuentes/AnalisisFuentesExercise.tsx`
- `apps/frontend/src/features/mechanics/module3/PodcastArgumentativo/PodcastArgumentativoExercise.tsx`
- `apps/frontend/src/features/mechanics/module3/MatrizPerspectivas/MatrizPerspectivasExercise.tsx`

**Mensaje estándar a implementar:**
```typescript
if (result.status === 'pending_review' || result.requiresManualReview) {
  setFeedback({
    type: 'info',
    title: 'Respuesta Enviada',
    message: 'Tu respuesta ha sido enviada para revisión del maestro. ' +
             'Recibirás tus recompensas cuando sea evaluada.',
    pendingReview: true,
  });
}
```

#### 3.2 Revisar Mensajes de Ejercicios M4
**Archivos a revisar:**
- `apps/frontend/src/features/mechanics/module4/VerificadorFakeNews/VerificadorFakeNewsExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/InfografiaInteractiva/InfografiaInteractivaExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/QuizTiktok/QuizTiktokExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/NavegacionHipertextualExercise.tsx`
- `apps/frontend/src/features/mechanics/module4/AnalisisMemes/AnalisisMemesExercise.tsx`

#### 3.3 Verificar Mensajes de Ejercicios M5
**Archivos a revisar:**
- `apps/frontend/src/features/mechanics/module5/DiarioMultimedia/DiarioMultimediaExercise.tsx`
- `apps/frontend/src/features/mechanics/module5/ComicDigital/ComicDigitalExercise.tsx`
- `apps/frontend/src/features/mechanics/module5/VideoCarta/VideoCartaExercise.tsx`

---

### FASE 4: DOCUMENTACIÓN DE CONSTANTES (Prioridad: MEDIA)

#### 4.1 Documentar Constantes de Ejercicios con Revisión Manual
**Archivo a documentar:**
- `apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

**Contenido a agregar en docs:**
```markdown
## Constantes de Ejercicios con Revisión Manual

Los 13 tipos de ejercicio que requieren evaluación del maestro están definidos en:
`apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

### Lista Completa:
- M3: tribunal_opiniones, debate_digital, analisis_fuentes, podcast_argumentativo, matriz_perspectivas
- M4: verificador_fake_news, infografia_interactiva, quiz_tiktok, navegacion_hipertextual, analisis_memes
- M5: diario_multimedia, comic_digital, video_carta
```

#### 4.2 Actualizar Inventario de Ejercicios
**Archivo a actualizar:**
- `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml`

**Agregar sección:**
```yaml
ejercicios_revision_manual:
  modulo_3:
    - tribunal_opiniones
    - debate_digital
    - analisis_fuentes
    - podcast_argumentativo
    - matriz_perspectivas
  modulo_4:
    - verificador_fake_news
    - infografia_interactiva
    - quiz_tiktok
    - navegacion_hipertextual
    - analisis_memes
  modulo_5:
    - diario_multimedia
    - comic_digital
    - video_carta
  total: 13
  flujo: teacher_validation
```

---

### FASE 5: DOCUMENTACIÓN DE LA PÁGINA DE RESPUESTAS (Prioridad: ALTA)

#### 5.1 Crear Documento de TeacherExerciseResponsesPage
**Archivo a crear:** `docs/03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md`

**Contenido:**
```markdown
# Página de Respuestas M3-M5

## Ubicación
- Ruta: `/teacher/responses`
- Componente: `TeacherExerciseResponsesPage.tsx`
- Archivo: `apps/frontend/src/apps/teacher/pages/TeacherExerciseResponsesPage.tsx`

## Funcionalidades
1. Tabla paginada de respuestas de estudiantes
2. Filtros:
   - Por aula
   - Por estudiante
   - Por rango de fechas
   - Por estado (correcto/incorrecto)
   - Por módulo (M3, M4, M5)
3. Modal de detalle con:
   - Contenido multimedia
   - Comparación respuesta vs correcta
   - Métricas (tiempo, pistas, comodines)
   - Recompensas ganadas

## Flujo de Uso
1. Maestro accede a /teacher/responses
2. Filtra por módulo (M3, M4, M5)
3. Click en respuesta para ver detalle
4. Puede navegar a panel de revisión si pendiente

## Integración con Panel de Revisión
- Las respuestas pendientes muestran botón "Revisar"
- Al hacer click, redirige a /teacher/reviews?submissionId=...
```

---

### FASE 6: VALIDACIÓN CRUZADA (Prioridad: CRÍTICA)

#### 6.1 Crear Checklist de Validación
**Archivo a crear:** `orchestration/reportes/VALIDACION-M3-M5-CHECKLIST-2026-01-07.md`

**Contenido:**
```markdown
# Checklist de Validación M3-M5

## Base de Datos
- [ ] 5/5 ejercicios M3 con requires_manual_grading=TRUE
- [ ] 5/5 ejercicios M4 con requires_manual_grading=TRUE
- [ ] 3/3 ejercicios M5 con requires_manual_grading=TRUE
- [ ] Trigger trg_update_user_stats_on_submission existe
- [ ] Trigger trg_update_module_progress_on_submission existe
- [ ] Trigger trg_update_missions_on_submission existe

## Backend
- [ ] ExerciseSubmissionService maneja requires_manual_grading
- [ ] ManualReviewService.completeReview() distribuye rewards
- [ ] NotificationService envía exercise_feedback
- [ ] GradingService calcula XP/ML Coins correctamente

## Frontend Teacher
- [ ] TeacherReviewPanelPage muestra submissions pendientes
- [ ] ReviewDetail permite calificar con rúbrica
- [ ] Muestra recompensas asignadas después de calificar
- [ ] TeacherExerciseResponsesPage lista respuestas

## Frontend Student
- [ ] 5/5 ejercicios M3 muestran mensaje "pendiente de revisión"
- [ ] 5/5 ejercicios M4 muestran mensaje "pendiente de revisión"
- [ ] 3/3 ejercicios M5 muestran mensaje "pendiente de revisión"
- [ ] NotificationsPage muestra calificaciones

## Documentación
- [ ] Documento de flujo consolidado creado
- [ ] Especificaciones M3 actualizadas
- [ ] Manual del portal maestros actualizado
- [ ] Inventario de ejercicios actualizado
```

---

## MATRIZ DE ARCHIVOS A MODIFICAR/CREAR

### Archivos NUEVOS a Crear

| # | Archivo | Fase | Prioridad |
|---|---------|------|-----------|
| 1 | `docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` | 1.1 | CRÍTICA |
| 2 | `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M3-001-ejercicios-m3.md` | 1.2 | ALTA |
| 3 | `docs/03-fase-extensiones/EXT-001-portal-maestros/paginas/RESPONSES-M3-M5.md` | 5.1 | ALTA |
| 4 | `orchestration/reportes/VALIDACION-M3-M5-CHECKLIST-2026-01-07.md` | 6.1 | CRÍTICA |

### Archivos EXISTENTES a Actualizar

| # | Archivo | Fase | Cambio |
|---|---------|------|--------|
| 1 | `docs/99-finiquito/Manual_Portal_Maestros_ACTUALIZADO.md` | 1.3 | Agregar capítulo M3-M5 |
| 2 | `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml` | 4.2 | Agregar sección ejercicios_revision_manual |

### Archivos a VALIDAR (sin modificar si correctos)

| # | Archivo | Fase | Validación |
|---|---------|------|------------|
| 1-5 | Seeds de ejercicios M3 | 2.1 | requires_manual_grading=TRUE |
| 6-10 | Seeds de ejercicios M4 | 2.2 | requires_manual_grading=TRUE |
| 11-13 | Seeds de ejercicios M5 | 2.3 | requires_manual_grading=TRUE |
| 14-16 | Triggers de submissions | 2.4 | Existen y funcionan |
| 17-21 | Ejercicios M3 frontend | 3.1 | Mensaje pendiente review |
| 22-26 | Ejercicios M4 frontend | 3.2 | Mensaje pendiente review |
| 27-29 | Ejercicios M5 frontend | 3.3 | Mensaje pendiente review |

---

## DEPENDENCIAS ENTRE FASES

```
FASE 1.1 (Documento flujo)
    ↓
FASE 1.2 (Specs M3) ←──────────────────────┐
    ↓                                       │
FASE 1.3 (Manual maestros)                  │
    ↓                                       │
FASE 2.1-2.4 (Validación DB) ──────────────┤
    ↓                                       │
FASE 3.1-3.3 (Mensajes frontend)            │
    ↓                                       │
FASE 4.1-4.2 (Constantes)                   │
    ↓                                       │
FASE 5.1 (Página responses)                 │
    ↓                                       │
FASE 6.1 (Checklist validación) ───────────┘
```

---

## CRITERIOS DE ÉXITO

### Documentación
- [ ] Documento de flujo consolidado explica el proceso completo
- [ ] Especificaciones de cada ejercicio M3-M5 incluyen flujo de validación
- [ ] Manual del maestro tiene capítulo específico de revisión M3-M5
- [ ] Inventario de ejercicios actualizado con flag de revisión manual

### Código
- [ ] 13/13 ejercicios con requires_manual_grading=TRUE en BD
- [ ] 13/13 ejercicios muestran mensaje "pendiente de revisión" en frontend
- [ ] Triggers funcionan correctamente (XP/ML Coins distribuidos)
- [ ] Notificaciones enviadas al estudiante

### Validación
- [ ] Checklist completado al 100%
- [ ] Prueba manual del flujo completo exitosa
- [ ] Documentación revisada por par

---

## PRÓXIMOS PASOS

1. **Fase 4 (Validación del Plan):** Revisar este plan contra el análisis detallado
2. **Fase 5 (Refinamiento):** Ajustar según feedback
3. **Fase 6 (Ejecución):** Implementar cambios en orden de prioridad
4. **Fase 7 (Validación Final):** Verificar todos los criterios de éxito

---

*Plan creado como parte de la integración M3-M5 con validación del maestro*
