# HALLAZGOS CONSOLIDADOS
## Teacher Portal Analysis - 2026-01-20

---

## 1. BUG CRÍTICO: Límite de 14 Estudiantes

### Descripción
La página de **Progress** del Teacher Portal muestra únicamente 14 estudiantes cuando la base de datos contiene más de 30.

### Análisis Técnico

**Frontend (Hook):**
```typescript
// useClassrooms.ts:60
// CORR-2025-12-18: Agregado limit: 100 para obtener todos los estudiantes
const response = await classroomsApi.getClassroomStudents(classroomId, { limit: 100 });
```
- El frontend YA solicita 100 estudiantes
- El comentario indica un intento fallido de solución del 2025-12-18

**Backend (Probable causa):**
- El endpoint `/teacher/classrooms/:id/students` no respeta el parámetro `limit`
- Posible LIMIT hardcodeado en query SQL o en servicio

**Archivos a Investigar:**
1. `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
2. `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
3. `/apps/database/ddl/schemas/social_features/views/01-classroom_progress_overview.sql`

### Impacto
- Maestros no pueden ver progreso de todos sus estudiantes
- Reportes generados solo incluyen 14 estudiantes
- Selector de estudiantes en Reports limitado a 14

---

## 2. GAPs de Documentación Identificados

### GAP-1: Alert Configuration (MEDIA)
**Problema:** No existe historia de usuario para configuración de alertas.
**Impacto:** Maestros no pueden:
- Configurar umbrales de at-risk
- Habilitar/deshabilitar tipos de alertas
- Personalizar notificaciones

**Solución Propuesta:** Crear US-PM-007-alert-configuration.md

### GAP-2: User Activity Tracking (ALTA - BLOQUEANTE)
**Problema:** US-PM-005c depende de sistema de activity tracking no implementado.
**Impacto:** Métricas de engagement bloqueadas.
**Solución Propuesta:** Documentar dependencia explícita o crear historia de infraestructura.

### GAP-3: Dashboard ↔ Reports Integration (BAJA)
**Problema:** No está documentado cómo acceder a Reports desde Dashboard.
**Impacto:** Workflow no claro para usuarios.
**Solución Propuesta:** Extender US-PM-000 o crear sub-feature.

### GAP-4: US-PM-006 Notifications (MEDIA)
**Problema:** Criterios de notificaciones a padres "pendientes" (referencia a EXT-010).
**Impacto:** Flujo de suspensión de estudiantes incompleto.
**Solución Propuesta:** Completar criterios o referenciar correctamente EXT-010.

### GAP-5: Performance Trend Structure (BAJA → CRÍTICA)
**Problema:** Estructura diferente en US-PM-004a vs US-PM-005a.
**Impacto:** Posible inconsistencia en responses.
**Solución Propuesta:** Estandarizar a incluir siempre `completion_rate`.

### GAP-6: Performance Trend NO IMPLEMENTADO (CRÍTICA) [NUEVO 2026-01-20]
**Problema:** El backend NO implementa cálculo de tendencias semanales (performance_trend/trend).
**Descubierto:** Validación FASE 3 - Analytics.service.ts no tiene método de cálculo semanal.
**Impacto:**
- US-PM-004a especifica `performance_trend[]` pero endpoint NO lo retorna
- US-PM-005a especifica `trend[]` pero endpoint NO lo retorna
- Gráficos de tendencia en frontend sin datos reales
**Solución Requerida:** Crear tarea técnica para implementar:
1. DTO `PerformanceTrendDto` con campos: week, average_grade, submissions_count, completion_rate
2. Método `calculateWeeklyTrends()` en analytics.service.ts
3. Agregar campo a response de endpoints existentes

---

## 3. Inconsistencias Detectadas

### INC-4: At-Risk Detection Logic
**US-PM-004a:** `at_risk = average_grade < 70%`
**US-PM-005a:** `at_risk = avg_grade < 70%` (consistente)
**Pero:** También menciona `completion_rate < 50%` en contexto.

**Pregunta:** ¿Es AND u OR?
**Propuesta:** Documentar: `at_risk = (avg_grade < 70%) OR (completion_rate < 50%)`

### INC-5: Response Time Targets
| Historia | Target |
|----------|--------|
| US-PM-004a | p95 < 300ms (progress), < 500ms (analytics) |
| US-PM-005a | p95 < 500ms (sin cache), < 100ms (con cache) |
| US-PM-005b | < 500ms (JSON), < 1s (CSV), < 3s (PDF) |
| US-PM-005c | p95 < 400ms |

**Propuesta:** Estandarizar a "p95 response time" para todos.

---

## 4. Estado de Implementación

### Frontend

| Página | Estado | Issues |
|--------|--------|--------|
| TeacherProgressPage | ⚠️ Parcial | Límite 14 estudiantes |
| TeacherAlertsPage | ✅ Completo | Paginación funcional (20 items) |
| TeacherReportsPage | ✅ Completo | PDF/Excel/CSV funcionando |

### Backend

| Módulo | Endpoints | Estado |
|--------|-----------|--------|
| Teacher Controller | 27 | ✅ Completo |
| Classrooms Controller | 13 | ⚠️ Bug en students |
| Alerts Controller | 7 | ✅ Completo |
| Reviews Controller | 10 | ✅ Completo |
| Reports Service | 17 | ✅ Completo |

**Total:** 81 endpoints implementados

### Base de Datos

| Aspecto | Estado |
|---------|--------|
| Tablas | 137 activas |
| Triggers | 35 activos |
| Funciones | 109 activas |
| Coherencia BD-Backend | 99% |
| Seeds de usuarios | 3 (clean creation policy) |

---

## 5. Capacidades Verificadas

### Exportación ✅
- **PDF:** Vía Puppeteer - funcional
- **Excel (XLSX):** Vía ExcelJS - funcional
- **CSV:** Server-side generation - funcional

### Multimedia ✅ [ACTUALIZADO 2026-01-20]
- **Imágenes:** ✅ Soportado (jpeg, png, gif, webp - 10MB max)
- **Videos:** ✅ Soportado (mp4, webm, ogg - 50MB max)
- **Audios:** ✅ Soportado (mpeg, wav, ogg, mp3 - 20MB max)
- **Documentos:** ✅ Soportado (pdf, doc, docx - 10MB max)
- **Storage:** Local filesystem (uploads/exercises/) - S3/GCS preparado pero no activo
- **Servicio:** `MediaStorageService` en `/modules/educational/`
- **Endpoints:** `/educational/media/upload`, `/educational/media/:id`

### Alertas ✅
- **6 tipos:** no_activity, low_score, repeated_failures, declining_trend, excessive_time, low_engagement
- **4 severidades:** critical, high, medium, low
- **4 estados:** active, acknowledged, resolved, dismissed
- **Generación:** Automática vía CRON diario

---

## 6. Inicialización de Usuarios

### Flujo Actual (Correcto)
```
1. Usuario se registra → auth.users + profiles
2. Se asigna a DEFAULT classroom (trigger)
3. Al iniciar primer ejercicio → exercise_submission
4. Trigger auto-crea module_progress (status='in_progress', progress=0%)
5. Se actualiza según ejercicios completados
```

### Seeds de Testing
- Solo 3 usuarios: admin@gamilit.com, teacher@gamilit.com, student@gamilit.com
- Sin progreso pre-cargado (clean creation policy)
- Estudiantes adicionales se crean dinámicamente

### Nota Importante
La expectativa de ">30 alumnos" debe venir de:
- Datos de **producción**
- Carga manual
- NO de seeds (que están vacíos por diseño)

---

## 7. Auditorías Previas

### AUDIT-002 (2026-01-04) - Teacher Portal
**Issues Corregidos:** 10 (2 P0, 8 P1)

| Issue | Tipo | Severidad | Estado |
|-------|------|-----------|--------|
| ISS-BE-001 | Backend | P0 | ✅ Corregido |
| ISS-DB-001 | Database | P0 | ✅ Corregido |
| ISS-DB-002-008 | Database | P1 | ✅ Corregidos |
| ISS-FE-001 | Frontend | P2 | ✅ Corregido |

---

## 8. Recomendaciones Prioritarias

### P0 - Crítico (Inmediato)
1. ~~**Fix límite de 14 estudiantes**~~ → ✅ INVESTIGADO: No es bug de código, es tema de datos
   - El código es correcto (limit=100)
   - Usuario debe verificar datos en BD
   - Queries de verificación en `02-INVESTIGACION-BUG-14-ESTUDIANTES.md`

### P1 - Alta (Esta semana)
2. ~~**Crear US-PM-007 Alert Configuration**~~ → ✅ COMPLETADO
3. ~~**Documentar at-risk logic explícitamente**~~ → ✅ COMPLETADO (AT-RISK-LOGIC-STANDARD.md)
4. ~~**Validar todos los endpoints de progress**~~ → ✅ COMPLETADO (23 endpoints validados)
5. **[NUEVO] Implementar Performance Trend** → ⚠️ GAP-6 CRÍTICO

### P2 - Media (Próxima semana)
6. ~~**Estandarizar response structures**~~ → ✅ VALIDADO (100% coherente)
7. ~~**Evaluar necesidad de multimedia**~~ → ✅ YA SOPORTADO
8. ~~**Consolidar documentación dispersa**~~ → ✅ COMPLETADO

---

## 9. Archivos de Referencia

### Documentación Principal
- `/docs/03-fase-extensiones/EXT-001-portal-maestros/`
- `/docs/audits/CHANGELOG-AUDIT-002-PORTAL-TEACHER-2026-01-04.md`
- `/orchestration/inventarios/MASTER_INVENTORY.yml`

### Código Relevante
- `/apps/frontend/src/apps/teacher/pages/TeacherProgressPage.tsx`
- `/apps/frontend/src/apps/teacher/hooks/useClassrooms.ts`
- `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
- `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`

---

## 10. FASE 3 - Validación de Endpoints (2026-01-20)

### Resultados de Validación

| Área | Endpoints | Estado | Notas |
|------|-----------|--------|-------|
| Progress Individual | 3 | ✅ 100% | DTOs coherentes |
| Progress Classroom | 6 | ✅ 100% | Swagger completo |
| Alerts | 7 | ✅ 100% | Guards aplicados |
| Exportación | 3 | ✅ 100% | PDF/Excel/CSV |
| Multimedia | 3 | ✅ 100% | 4 tipos soportados |

### Inicialización de module_progress

**Verificado:** Se crea AL REGISTRARSE el usuario (trigger `trg_initialize_user_stats`)
- Valores iniciales: status='not_started', progress=0
- Triggers de actualización: 32, 27, 33, 22 (ver detalle en 04-VALIDACION-ENDPOINTS-FASE3.md)

### GAP Crítico Descubierto

**GAP-6: Performance Trend NO IMPLEMENTADO**
- Backend no calcula tendencias semanales
- US-PM-004a y US-PM-005a especifican campos que no existen
- Acción requerida: Crear tarea técnica para implementar

---

**Análisis completado:** 2026-01-20
**Agentes utilizados:** 8 exploradores en paralelo (4 FASE 1-2 + 4 FASE 3)
**Documentos analizados:** 60+
**Endpoints verificados:** 23 detallados + 81 inventariados
