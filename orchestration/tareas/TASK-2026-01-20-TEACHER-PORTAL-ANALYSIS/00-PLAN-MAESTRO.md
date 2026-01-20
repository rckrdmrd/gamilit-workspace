# PLAN MAESTRO: Análisis y Corrección del Teacher Portal
## TASK-2026-01-20-TEACHER-PORTAL-ANALYSIS

**Fecha:** 2026-01-20
**Módulos:** Progress, Alerts, Reports
**Proyecto:** gamilit
**Estado:** EN PLANEACIÓN

---

## RESUMEN EJECUTIVO

Este plan aborda el análisis integral del Teacher Portal de gamilit, específicamente las páginas de **Progress**, **Alerts** y **Reports**. Se identificaron problemas críticos incluyendo:

1. **BUG CRÍTICO:** La página Progress muestra solo 14 estudiantes de >30 existentes
2. **GAPs de Documentación:** Historias de usuario faltantes o incompletas
3. **Coherencia:** Verificar alineación DDL-Backend-Frontend
4. **Funcionalidades:** Validar exportación PDF/Excel y manejo multimedia

---

## HALLAZGOS DEL ANÁLISIS INICIAL

### 1. Problema de 14 Estudiantes (CRÍTICO)

| Aspecto | Estado |
|---------|--------|
| **Ubicación Frontend** | `useClassrooms.ts:60` - ya solicita `limit: 100` |
| **Causa Probable** | Backend no respeta el parámetro limit |
| **Comentario Existente** | "CORR-2025-12-18" - intento fallido de solución |
| **Acción Requerida** | Investigar endpoint `/teacher/classrooms/:id/students` |

### 2. Estado de Documentación (EXT-001-portal-maestros)

| Aspecto | Estado |
|---------|--------|
| **Historias Documentadas** | 14 completas |
| **Criterios de Aceptación** | 100% documentados (76 totales) |
| **Auditoría Previa** | AUDIT-002 corrigió 10 issues |
| **GAPs Identificados** | 5 gaps + 5 inconsistencias |

### 3. GAPs Identificados en Documentación

| GAP | Severidad | Descripción |
|-----|-----------|-------------|
| **GAP-1** | MEDIA | No existe historia de "Alert Management/Configuration" |
| **GAP-2** | ALTA | Dependencia bloqueante en User Activity Tracking |
| **GAP-3** | BAJA | Integración Dashboard ↔ Reports no documentada |
| **GAP-4** | MEDIA | US-PM-006 criterios pendientes de notificaciones |
| **GAP-5** | BAJA | Inconsistencia en "Performance Trend" data structure |

### 4. Estado del Backend

| Métrica | Valor |
|---------|-------|
| **Endpoints Implementados** | 81 |
| **Paginación** | Implementada parcialmente |
| **Exportación PDF/Excel/CSV** | ✅ Completa |
| **Multimedia** | ❌ No soportado |
| **Coherencia BD-Backend** | 99% |

### 5. Estado del Frontend

| Página | Estado |
|--------|--------|
| **TeacherProgressPage** | ⚠️ Limitada a 14 estudiantes |
| **TeacherAlertsPage** | ✅ Funcional con paginación |
| **TeacherReportsPage** | ✅ Funcional con exportación |

---

## ESTRUCTURA DE SUBTAREAS (CAPVED)

El plan se divide en **3 ÉPICAS** con múltiples subtareas, cada una siguiendo el ciclo CAPVED.

---

### ÉPICA 1: CORRECCIÓN DE BUGS CRÍTICOS
**Prioridad:** P0 - Bloqueante
**Dependencias:** Ninguna

#### SUBTAREA 1.1: Fix - Límite de 14 Estudiantes
**ID:** TASK-2026-01-20-001-BUG-STUDENTS-LIMIT

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Bug: Solo 14 estudiantes mostrados en Progress. Frontend solicita 100, backend retorna 14. |
| **A - Análisis** | Investigar `teacher-classrooms.controller.ts`, `teacher-classrooms-crud.service.ts`. Revisar query de BD. |
| **P - Planeación** | 1) Identificar límite hardcodeado. 2) Corregir query. 3) Implementar paginación real. |
| **V - Validación** | Tests unitarios y e2e. Validar con >30 registros en BD. |
| **E - Ejecución** | Aplicar fix en backend. Actualizar frontend si es necesario. |
| **D - Documentación** | Actualizar BACKEND_INVENTORY, crear changelog. |

**Archivos a Investigar:**
- `/apps/backend/src/modules/teacher/controllers/teacher-classrooms.controller.ts`
- `/apps/backend/src/modules/teacher/services/teacher-classrooms-crud.service.ts`
- `/apps/database/ddl/schemas/social_features/views/01-classroom_progress_overview.sql`

---

#### SUBTAREA 1.2: Verificar Inicialización de module_progress
**ID:** TASK-2026-01-20-002-VERIFY-INIT

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Validar que users nuevos tengan module_progress creado automáticamente. |
| **A - Análisis** | Revisar trigger `trg_update_submitted_progress`, función `sync_module_progress_scores()`. |
| **P - Planeación** | 1) Test de creación de usuario. 2) Verificar trigger. 3) Confirmar datos en BD. |
| **V - Validación** | Query directa a BD de producción/staging para contar registros. |
| **E - Ejecución** | Corregir triggers si es necesario. |
| **D - Documentación** | Documentar flujo de inicialización en docs/. |

---

### ÉPICA 2: COMPLETAR DOCUMENTACIÓN Y DEFINICIONES
**Prioridad:** P1 - Alta
**Dependencias:** ÉPICA 1 completada

#### SUBTAREA 2.1: Crear Historia US-PM-007 - Alert Configuration
**ID:** TASK-2026-01-20-003-US-ALERTS

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | GAP-1: No existe historia para configuración de alertas. Los maestros no pueden personalizar umbrales. |
| **A - Análisis** | Revisar US-PM-005c, backend alerts endpoints, tipos de alertas existentes. |
| **P - Planeación** | Crear US-PM-007 con criterios de aceptación para configurar umbrales y suscripciones. |
| **V - Validación** | Revisar con criterios de Definition of Ready. |
| **E - Ejecución** | Crear archivo `US-PM-007-alert-configuration.md`. |
| **D - Documentación** | Actualizar _MAP.md de EXT-001. |

**Criterios de Aceptación Propuestos:**
- AC-01: Maestro puede ver umbrales actuales de alertas
- AC-02: Maestro puede modificar umbral de at-risk (default 70%)
- AC-03: Maestro puede habilitar/deshabilitar tipos de alertas
- AC-04: Cambios se persisten por classroom
- AC-05: UI muestra preview de estudiantes afectados por nuevo umbral

---

#### SUBTAREA 2.2: Documentar Integración Dashboard ↔ Reports
**ID:** TASK-2026-01-20-004-DASHBOARD-REPORTS

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | GAP-3: No está documentado cómo acceder a Reports desde Dashboard. |
| **A - Análisis** | Revisar US-PM-000 (Dashboard), ubicación actual del botón Reports en UI. |
| **P - Planeación** | Extender US-PM-000 o crear sub-feature documentando workflow. |
| **V - Validación** | Validar contra UI existente. |
| **E - Ejecución** | Actualizar documentación. |
| **D - Documentación** | Commit y push. |

---

#### SUBTAREA 2.3: Estandarizar At-Risk Detection Logic
**ID:** TASK-2026-01-20-005-STANDARDIZE-RISK

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | INC-4: Lógica at-risk ambigua (AND vs OR). |
| **A - Análisis** | Revisar US-PM-004a, US-PM-005a, backend implementation. |
| **P - Planeación** | Definir lógica oficial: `at_risk = (avg_grade < 70%) OR (completion_rate < 50%)`. |
| **V - Validación** | Verificar consistencia en backend. |
| **E - Ejecución** | Actualizar todas las historias con lógica consistente. |
| **D - Documentación** | Crear documento de referencia `AT-RISK-LOGIC.md`. |

---

#### SUBTAREA 2.4: Estandarizar Performance Trend Response
**ID:** TASK-2026-01-20-006-PERF-TREND

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | GAP-5: Estructura diferente en US-PM-004a vs US-PM-005a. |
| **A - Análisis** | Comparar DTOs de backend para ambos endpoints. |
| **P - Planeación** | Estandarizar a incluir siempre: week, average_grade, submissions_count, completion_rate. |
| **V - Validación** | Verificar no breaking changes en frontend. |
| **E - Ejecución** | Actualizar DTOs si es necesario. |
| **D - Documentación** | Actualizar ambas historias. |

---

### ÉPICA 3: VALIDACIÓN Y COHERENCIA ENTRE CAPAS
**Prioridad:** P1 - Alta
**Dependencias:** ÉPICA 2 completada

#### SUBTAREA 3.1: Validar Endpoints de Progress
**ID:** TASK-2026-01-20-007-VALIDATE-PROGRESS

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Verificar que endpoints de progress retornen datos correctos. |
| **A - Análisis** | Listar endpoints: `/students/:id/progress`, `/classrooms/:id/progress`. |
| **P - Planeación** | Crear test scripts. Ejecutar contra staging. |
| **V - Validación** | Comparar response vs DTO documentado. |
| **E - Ejecución** | Corregir discrepancias. |
| **D - Documentación** | Actualizar QUICK-API.yml si hay cambios. |

---

#### SUBTAREA 3.2: Validar Endpoints de Alerts
**ID:** TASK-2026-01-20-008-VALIDATE-ALERTS

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Verificar funcionamiento de intervention alerts. |
| **A - Análisis** | Endpoints: `/alerts`, `/alerts/:id/acknowledge`, `/alerts/:id/resolve`. |
| **P - Planeación** | Ejecutar tests e2e existentes. Verificar generación automática. |
| **V - Validación** | Confirmar estados: active → acknowledged → resolved. |
| **E - Ejecución** | Corregir si es necesario. |
| **D - Documentación** | Documentar flujo de alerts en docs/. |

---

#### SUBTAREA 3.3: Validar Exportación PDF/Excel/CSV
**ID:** TASK-2026-01-20-009-VALIDATE-EXPORT

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Confirmar que exportación funciona correctamente. |
| **A - Análisis** | Endpoint `/reports/generate`. Servicios: PDFService, ExcelJS. |
| **P - Planeación** | Test manual de cada formato. |
| **V - Validación** | Archivos generados deben ser válidos y contener datos correctos. |
| **E - Ejecución** | Fix si hay problemas. |
| **D - Documentación** | Actualizar documentación con formatos soportados. |

---

#### SUBTAREA 3.4: Evaluar Soporte Multimedia
**ID:** TASK-2026-01-20-010-EVAL-MULTIMEDIA

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Determinar necesidad de soporte para imágenes/videos/audios. |
| **A - Análisis** | Storage service actual solo soporta PDF/Excel/CSV. |
| **P - Planeación** | Si se requiere: Crear historia para upload multimedia. |
| **V - Validación** | Definir scope con stakeholders. |
| **E - Ejecución** | N/A si no se requiere. |
| **D - Documentación** | Documentar capacidades actuales vs requeridas. |

---

### ÉPICA 4: PURGA Y LIMPIEZA DE DOCUMENTACIÓN
**Prioridad:** P2 - Media
**Dependencias:** ÉPICA 3 completada

#### SUBTAREA 4.1: Identificar Documentación Obsoleta
**ID:** TASK-2026-01-20-011-IDENTIFY-OBSOLETE

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Limpiar docs de tareas ya completadas o definiciones obsoletas. |
| **A - Análisis** | Revisar orchestration/analisis-*, docs/99-archivados/. |
| **P - Planeación** | Crear lista de archivos a purgar o mover a archivados. |
| **V - Validación** | Verificar que no se elimine nada activo. |
| **E - Ejecución** | Mover a 99-archivados/ o eliminar. |
| **D - Documentación** | Crear log de purga. |

---

#### SUBTAREA 4.2: Consolidar Documentación del Teacher Portal
**ID:** TASK-2026-01-20-012-CONSOLIDATE-DOCS

| Fase | Actividad |
|------|-----------|
| **C - Contexto** | Asegurar que toda documentación esté en ubicación correcta. |
| **A - Análisis** | Verificar EXT-001, audits/, orchestration/. |
| **P - Planeación** | Mover docs dispersos a ubicación canónica. |
| **V - Validación** | Todos los links deben funcionar. |
| **E - Ejecución** | Reorganizar si es necesario. |
| **D - Documentación** | Actualizar _MAP.md. |

---

## ORDEN DE EJECUCIÓN RECOMENDADO

```
FASE 1: BUGS CRÍTICOS (Inmediato)
├── 1.1 Fix límite 14 estudiantes (BLOQUEANTE)
└── 1.2 Verificar inicialización module_progress

FASE 2: DOCUMENTACIÓN (Después de FASE 1)
├── 2.1 Crear US-PM-007 Alert Configuration
├── 2.2 Documentar Dashboard ↔ Reports
├── 2.3 Estandarizar At-Risk Logic
└── 2.4 Estandarizar Performance Trend

FASE 3: VALIDACIÓN (Después de FASE 2)
├── 3.1 Validar endpoints Progress
├── 3.2 Validar endpoints Alerts
├── 3.3 Validar exportación PDF/Excel/CSV
└── 3.4 Evaluar soporte multimedia

FASE 4: PURGA (Después de FASE 3)
├── 4.1 Identificar documentación obsoleta
└── 4.2 Consolidar documentación
```

---

## CRITERIOS DE ÉXITO

| Criterio | Métrica |
|----------|---------|
| **Bug de 14 estudiantes** | Progress muestra todos los estudiantes (>30) |
| **Documentación** | 100% historias con criterios completos |
| **Coherencia** | 100% endpoints documentados = implementados |
| **Exportación** | PDF/Excel/CSV funcionando en producción |
| **Limpieza** | 0 archivos obsoletos en orchestration/ activo |

---

## RECURSOS REQUERIDOS

- **Agentes:** Backend-Agent, Frontend-Agent, Documentation-Agent
- **Acceso:** BD de staging para verificación
- **Tiempo Estimado:** 4-6 horas de trabajo distribuido

---

## PRÓXIMOS PASOS INMEDIATOS

1. **Crear subtareas individuales** en carpetas separadas
2. **Investigar bug de 14 estudiantes** (SUBTAREA 1.1)
3. **Validar datos en BD** para confirmar cantidad real de estudiantes
4. **Ejecutar FASE 1** antes de continuar con documentación

---

**Documento creado:** 2026-01-20
**Versión:** 1.0.0
**Autor:** Arquitecto de Soluciones (Orquestador)
