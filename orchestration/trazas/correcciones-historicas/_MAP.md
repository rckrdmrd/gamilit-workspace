# _MAP: Correcciones e Issues

**Carpeta:** docs/80-references/transversal/correcciones/
**Ultima Actualizacion:** 2026-01-07
**Proposito:** Backlog de issues pendientes y reportes de correcciones
**Estado:** Vigente

---

## Contenido Actual

| Archivo | Descripcion | Estado |
|---------|-------------|--------|
| `BACKEND-CRITICAL-ISSUES-PENDING.md` | Issues P0 Backend - estado actualizado | **SSOT** |
| `PLAN-RESTRUCTURACION-DOCUMENTACION-2026-01-06.md` | Plan de restructuracion documentacion | [ARCHIVADO - documento no disponible] |
| `ANALISIS-ERROR-404-PROGRESS-MODULES.md` | Error 404 en endpoint progress/modules | **CORREGIDO** |

### Archivos Movidos a Archivados (2026-01-06)

| Archivo Original | Destino | Razón |
|-----------------|---------|-------|
| `ISSUES-CRITICOS.md` | `archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md` | Deprecado desde Oct 2025, todos los 66 issues resueltos |
| `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md` | Pendiente mover | Completado - 23/23 resueltos |

---

## Estado de Issues P0 (Actualizado 2025-01-04)

**SSOT:** `BACKEND-CRITICAL-ISSUES-PENDING.md`

### Issues P0 Backend - TODOS IMPLEMENTADOS

| Issue | Descripcion | Estado |
|-------|-------------|--------|
| P0-001 | Auto-save userId | IMPLEMENTADO |
| P0-003 | Inconsistencia IDs BD | IMPLEMENTADO |
| P0-005 | Password Recovery | IMPLEMENTADO |
| P0-006 | Change Password | IMPLEMENTADO |
| P0-007 | Session Management | IMPLEMENTADO |

**Evidencia:** `docs/99-archivados/historicos-2025/reportes-analisis/EXECUTION-REPORT-2025-11-28.md`

---

## Correcciones Recientes (2026-01-07)

### CORR-011: Sincronizacion Documentacion M3-M5

**Documentacion:**
- `CORR-011-ANALISIS-SINCRONIZACION-DOC-M3-M5.md`
- `CORR-011-PLAN-EJECUCION.md`
- `CORR-011-VALIDACION.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Documentacion RF-M4-001 y RF-M5-001 desincronizada con tipos reales de ejercicios |
| **Inconsistencia 1** | RF-M4-001 listaba tipos incorrectos (linea_tiempo, mapa_mental, etc.) |
| **Inconsistencia 2** | RF-M5-001 listaba tipos incorrectos (ensayo, carta, proyecto_multimedia) |
| **Inconsistencia 3** | manualReviewExercises.ts no incluia quiz-tiktok (requiere evaluacion manual) |
| **Estado** | COMPLETADO - 3 archivos actualizados |
| **Agente** | Orquestador |

**Archivos Modificados:**

| Archivo | Cambio |
|---------|--------|
| `manualReviewExercises.ts` | Agregado quiz-tiktok a lista de evaluacion manual |
| `RF-M4-001-ejercicios-m4.md` | Actualizado con tipos reales |
| `RF-M5-001-ejercicios-m5.md` | Actualizado con tipos reales |

**Ejercicios Evaluacion Manual (Final):**

| Modulo | Cantidad |
|--------|----------|
| M3 | 5 (tribunal_opiniones, debate_digital, analisis_fuentes, podcast_argumentativo, matriz_perspectivas) |
| M4 | 5 (verificador_fake_news, infografia_interactiva, navegacion_hipertextual, analisis_memes, quiz_tiktok) |
| M5 | 3 (diario_multimedia, comic_digital, video_carta) |
| **Total** | **13** |

**Nota:** Todos los ejercicios M3-M5 requieren evaluacion manual (requires_manual_grading = true). No hay auto-grading ni interaccion con IA en estos modulos.

**Cambios BD:** NO - Solo documentacion y constante frontend.

---

### CORR-010: Error 400 ValidationError - statementId empty en tribunal_opiniones

**Documentacion:**
- `CORR-010-ANALISIS-STATEMENTID-EMPTY.md`
- `CORR-010-PLAN-EJECUCION.md`
- `CORR-010-VALIDACION.md`

| Aspecto | Detalle |
|---------|---------|
| **Error 1** | `ValidationError: evaluations.0.statementId: statementId should not be empty` |
| **Error 2** | `ValidationError: You have already submitted this exercise` |
| **Causas Raiz** | 5 causas identificadas (ver abajo) |
| **Estado** | ✅ COMPLETADO v4.0 - 5 fixes aplicados |
| **Agente** | Orquestador |

**Causas Raíz Identificadas:**

| # | Causa | Solución | Stack |
|---|-------|----------|-------|
| 1 | BD vacía (seeds no aplicados) | Aplicar seeds educational_content | Database |
| 2 | Bug frontend: handleCheck() sin fallback ID | Agregar fallback `stmt-${idx+1}` | Frontend |
| 3 | Bug frontend: onProgressUpdate no incluía evaluación actual | Modificar useEffect | Frontend |
| 4 | Bug backend: class-transformer perdía propiedades | Sanitización multicapa + @Expose | Backend |
| 5 | Bloqueo reenvíos M3-M5 | Lógica reenvío por status | Backend |

**Archivos Modificados:**

| Archivo | Cambio |
|---------|--------|
| `TribunalOpinionesExercise.tsx` | Fallback IDs + onProgressUpdate fix |
| `AnalisisFuentesExercise.tsx` | Sanitización ranking IDs |
| `VerificadorFakeNewsExercise.tsx` | Sanitización claim_ids |
| `exercises.controller.ts` | Pre-sanitización controller (CORR-010 v5) |
| `exercise-answer.validator.ts` | Post-transform sanitización |
| `tribunal-opiniones-answers.dto.ts` | Decoradores @Expose |
| `exercise-submission.service.ts` | Lógica reenvío M3-M5 (CORR-010 v6) |

**Métricas:**

| Métrica | Valor |
|---------|-------|
| Archivos frontend | 4 |
| Archivos backend | 4 |
| Cambios DDL | 0 |
| Total líneas | ~220 |

**Flujo Corregido M3-M5:**
```text
1. Estudiante envía → status = 'submitted'
2. Estudiante puede reenviar → actualiza submission
3. Teacher califica → status = 'graded'
4. Estudiante intenta reenviar → ❌ Bloqueado
```

**Comando de verificación:**
```sql
SELECT exercise_type, (content->'statements'->0->>'id') as first_id
FROM educational_content.exercises WHERE exercise_type = 'tribunal_opiniones';
-- Resultado: stmt-1
```

### CORR-009: Vista teacher_pending_reviews - DDL Errors

**Documentacion:**
- `CORR-009-ANALISIS-VISTA-TEACHER-PENDING-REVIEWS.md`
- `CORR-009-PLAN-EJECUCION.md`
- `CORR-009-VALIDACION.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Vista `progress_tracking.teacher_pending_reviews` no existía en BD por errores DDL |
| **Causa Raiz** | 10 columnas incorrectas + error de dependencia cross-schema (FASE 8 antes de FASE 9) |
| **Solucion** | 1) Corregir 10 columnas en DDL, 2) Crear FASE 9.6 en create-database.sh para vistas cross-schema |
| **Archivos modificados** | `02-teacher_pending_reviews.sql`, `create-database.sh` (FASE 9.6 agregada) |
| **Estado** | ✅ COMPLETADO - Recreación BD validada sin errores |
| **Agente** | Orquestador |
| **Cambios BD** | Vista creada correctamente en FASE 9.6 |
| **Detectado durante** | Validación de dependencias CORR-M3-001-002 |

### CORR-008: Valores Iniciales Usuarios de Testing

**Documentacion:** `orchestration/reportes/correcciones/CORR-008-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Usuarios de testing (@gamilit.com) iniciaban con XP elevado (3200), nivel 3 y achievements asignados |
| **Causa Raiz** | Seeds de gamification_system actualizaban valores despues de que trigger los inicializaba correctamente |
| **Solucion** | Comentar FASE 3 en user_stats.sql + exclusiones WHERE en user_ranks.sql, user_achievements.sql, comodines_inventory.sql |
| **Archivos PROD** | 3 modificados (05-user_stats, 06-user_ranks, 08-user_achievements) |
| **Archivos DEV** | 4 modificados + 1 eliminado (02-test-users.sql redundante) |
| **Cambios BD** | Seeds solamente - DDL sin cambios |
| **Estado** | COMPLETADO - Valores verificados (level=1, xp=0, ml_coins=100, rank='Ajaw') |
| **Agente** | Orquestador |
| **Usuarios afectados** | admin@gamilit.com, teacher@gamilit.com, student@gamilit.com |
| **Usuarios demo** | Sin cambios - mantienen valores de ejemplo |

### CORR-007: Flujo de Evaluacion Manual para Ejercicios M3-M5

**Documentacion:** `orchestration/reportes/correcciones/CORR-007-FLUJO-EVALUACION-MANUAL-M3-M5.md`
**Plan:** `orchestration/reportes/correcciones/CORR-007-PLAN-IMPLEMENTACION.md`
**Validacion:** `orchestration/reportes/correcciones/CORR-007-VALIDACION-INTEGRACION-COMPLETA.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Ejercicios M3-M5 se auto-calificaban y otorgaban rewards inmediatamente, ignorando `requires_manual_grading` |
| **Causa Raiz** | `submitExercise()` siempre llamaba `gradeSubmission()` + `claimRewards()` sin verificar flag |
| **Solucion** | Condicional en backend para skip auto-grade/rewards + auto-claim post teacher grading |
| **Archivos Backend** | `exercise-submission.service.ts` (2 cambios: lineas 330-351, 423-443) |
| **Archivos Frontend** | 5 archivos (TribunalOpiniones, MatrizPerspectivas, progressAPI, progressTypes, matrizPerspectivasTypes) |
| **Lineas agregadas** | ~80 lineas |
| **Estado** | ✅ COMPLETADO - TypeScript sin errores |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno (solo logica de aplicacion) |
| **Ejercicios afectados** | 13 ejercicios (5 M3 + 5 M4 + 3 M5) |
| **US Cumplimiento** | US-TEACH-003 (Evaluacion Manual), US-GAM-001 (XP), US-GAM-002 (ML Coins) |

### CORR-006: Estilos Headers Ejercicios Modulo 3

**Documentacion:** `orchestration/reportes/correcciones/CORR-006-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Headers de ejercicios M3 no seguian patron estandar de estilos |
| **Causa Raiz** | Uso de clases CSS no estandar (`rounded-detective-lg`, `shadow-detective-lg`, etc.) |
| **Solucion** | Aplicar patron de M4 (VerificadorFakeNews) a todos los ejercicios |
| **Archivos modificados** | 5 archivos Exercise.tsx en module3/ (~67 lineas) |
| **Estado** | COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | Ninguno |
| **Patron aplicado** | `rounded-xl`, `from-blue-800 to-orange-500`, `shadow-lg`, `<h2>`, `text-detective-2xl` |

### CORR-M3-001-002: requires_manual_grading en Modulo 3

**Documentacion:** `docs/80-references/transversal/correcciones/CORR-M3-001-002-requires-manual-grading.md`
**Validacion:** `docs/80-references/transversal/analisis/VALIDACION-CORR-M3-001-002-2026-01-07.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Ejercicios M3.1 y M3.5 sin `requires_manual_grading=true` - no aparecian en portal Teacher |
| **Causa Raiz** | Campos faltantes en seeds de ejercicios |
| **Solucion** | Agregar campo a INSERT, VALUES y ON CONFLICT en seeds |
| **Archivos modificados** | `04-exercises-module3.sql` prod y dev (12 lineas agregadas total) |
| **Cambios BD** | UPDATE a 2 ejercicios (analisis_fuentes, tribunal_opiniones) |
| **Estado** | COMPLETADO Y VALIDADO - 13 ejercicios listos para evaluacion manual |
| **Agente** | Orquestador |
| **Ejercicios afectados** | Analisis de Fuentes (M3.1/order 3), Tribunal de Opiniones (M3.5/order 1) |

### CORR-005: WebSocket Authentication Failed + Limpieza Codigo Muerto

**Documentacion:** `orchestration/reportes/correcciones/CORR-005-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | WebSocket Auth Failed + codigo muerto de leaderboard WebSocket |
| **Causa Raiz** | JWT secret inconsistente + feature no implementada mantenida en codigo |
| **Solucion** | Unificar JWT config + **eliminar codigo muerto** (hook, metodos, tipos, docs) |
| **Archivos modificados** | 6 archivos modificados, 3 archivos eliminados |
| **Lineas eliminadas** | ~1,050 lineas de codigo/documentacion muerta |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno |
| **Justificacion** | US-GAM-007 CA-02 acepta polling (30s), no requiere WebSocket |

### CORR-004: API LeaderboardPage y AchievementsPage

**Documentacion:** `orchestration/reportes/correcciones/CORR-004-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | 404 en `/leaderboards/user-rank`, AchievementsPage no muestra datos |
| **Causa Raiz** | Endpoint faltante + snake_case vs camelCase mismatch |
| **Solucion** | Crear endpoint user-rank + transformer snake_case->camelCase |
| **Archivos modificados** | `leaderboard.controller.ts`, `achievementTransformer.ts` (nuevo), `gamification.api.ts`, `socialAPI.ts` (+212 lineas) |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno |
| **US Cumplimiento** | US-GAM-007: 43%→86%, US-GAM-003: 50%→90% |

### CORR-003: Error 400 ValidationError en Submit de Ejercicios

**Documentacion:** `orchestration/reportes/correcciones/CORR-003-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | Error 400 ValidationError al enviar respuestas de ejercicios |
| **Causa Raiz** | Constructores en DTOs inicializaban arrays/objetos vacios, sobrescribiendo datos de class-transformer |
| **Solucion** | Eliminar constructores de 9 DTOs de respuestas |
| **Archivos modificados** | 9 DTOs en `progress/dto/answers/` (-36 lineas) |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno |
| **Tipos afectados** | tribunal_opiniones, matriz_perspectivas, detective_textual, construccion_hipotesis, prediccion_narrativa, rueda_inferencias, detective_connections, prediction_scenarios, cause_effect_matching |

### CORR-002: Bug Critico - LeaderboardPage No Carga Datos

**Documentacion:** `orchestration/reportes/correcciones/CORR-002-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | LeaderboardPage no cargaba datos del backend - pagina vacia |
| **Causa Raiz** | Falta de `useEffect` para inicializar carga de datos del store |
| **Solucion** | Agregar `useEffect` que llama `setLeaderboardType('global')` al montar |
| **Archivos modificados** | `LeaderboardPage.tsx` (+5 lineas) |
| **Archivos eliminados** | `AchievementsPage.tsx` (student) - codigo muerto (-567 lineas) |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador |
| **Cambios BD** | ❌ Ninguno |
| **Commit** | `3ea547e` |
| **US Afectada** | US-GAM-007 (Leaderboard simple) - 28% → 100% cumplimiento |

### CORR-001: Alineacion Paginas Leaderboard y Achievements (2026-01-04)

**Documentacion:** `orchestration/reportes/correcciones/CORR-001-*.md`

| Aspecto | Detalle |
|---------|---------|
| **Problema** | LeaderboardPage y AchievementsPage no seguian patrones de UI establecidos |
| **Causa Raiz** | Falta de uso de GamifiedHeader y estilos inconsistentes |
| **Solucion** | Alineacion con patrones de DashboardComplete y MissionsPage |
| **Archivos modificados** | `LeaderboardPage.tsx`, `AchievementsPage.tsx` |
| **Estado** | ✅ COMPLETADO - Build exitoso |
| **Agente** | Orquestador + Frontend-Agent |
| **Cambios BD** | ❌ Ninguno |

### CORR-2026-01-04-001: Error 404 en Progress Modules

**Documento:** `ANALISIS-ERROR-404-PROGRESS-MODULES.md`

| Aspecto | Detalle |
|---------|---------|
| **Error** | 404 en GET `/api/v1/progress/users/:userId/modules/:moduleId` |
| **Causa Raíz** | Falta sincronización bidireccional usuarios ↔ módulos |
| **Solución** | Trigger + función para crear module_progress automáticamente |
| **Nuevos objetos** | `gamilit.initialize_module_progress_for_users()`, `trg_initialize_module_progress` |
| **Estado** | ✅ CORREGIDO - Requiere recrear BD |
| **Sub-agentes** | 4 (Backend, Database, Frontend, Historical) |

---

## Correcciones Anteriores (2025-12-26)

### Portal Admin - Sprint 1-4

**Documento:** `CORRECCIONES-ADMIN-PORTAL-2025-12-26.md`

| Prioridad | Identificados | Corregidos | N/A |
|-----------|---------------|------------|-----|
| P0 - CRITICAL | 5 | 5 | 1 |
| P1 - HIGH | 5 | 2 | 3 |
| P2 - MEDIUM | 8 | 3 | 5 |
| P3 - LOW | 5 | 3 | 2 |
| **TOTAL** | **23** | **13** | **11** |

---

## Issues Pendientes de Verificacion (P1)

| Issue | Descripcion | Estado |
|-------|-------------|--------|
| P1-004 | Trigger exercise_submissions | A VERIFICAR |
| P1-005 | Validacion roles endpoints teacher | A VERIFICAR |

---

## GAPs Identificados (Mejoras Futuras)

### GAP-FE-001: Frontend hardcoded requiresManualGrading list

| Aspecto | Detalle |
|---------|---------|
| **Ubicacion** | `apps/frontend/src/apps/teacher/components/responses/ResponseDetailModal.tsx:86-106` |
| **Descripcion** | Frontend usa lista hardcodeada de `exercise_type` para determinar si requiere evaluacion manual |
| **Problema** | Lista puede desincronizarse con BD (actualmente falta `analisis_fuentes`, `matriz_perspectivas`) |
| **Solucion Propuesta** | Usar campo `requires_manual_grading` del exercise retornado por API |
| **Prioridad** | P3 - LOW (funcionalidad actual opera correctamente via backend) |
| **Estado** | PENDIENTE |

---

## Documentacion Movida

Los siguientes archivos fueron movidos a `orchestration/reportes/correcciones/`:

### 2026-01-07

| Archivo | Razon |
|---------|-------|
| `CORR-006-ANALISIS-ESTILOS-HEADERS-M3.md` | Correccion completada - Estilos Headers M3 |
| `CORR-006-PLAN-EJECUCION.md` | Correccion completada - Estilos Headers M3 |
| `CORR-006-REPORTE-EJECUCION.md` | Correccion completada - Estilos Headers M3 |
| `CORR-005-ANALISIS-DETALLADO-WEBSOCKET.md` | Correccion completada - WebSocket Auth |
| `CORR-005-PLAN-EJECUCION.md` | Correccion completada - WebSocket Auth |
| `CORR-005-REPORTE-EJECUCION.md` | Correccion completada - WebSocket Auth |
| `CORR-004-ANALISIS-DETALLADO-LEADERBOARD-ACHIEVEMENTS-API.md` | Correccion completada - API Endpoints |
| `CORR-004-PLAN-EJECUCION.md` | Correccion completada - API Endpoints |
| `CORR-004-REPORTE-EJECUCION.md` | Correccion completada - API Endpoints |
| `CORR-003-ANALISIS-VALIDACION-DTOS-CONSTRUCTORES.md` | Correccion completada - Backend DTOs |
| `CORR-003-PLAN-EJECUCION.md` | Correccion completada - Backend DTOs |
| `CORR-003-REPORTE-EJECUCION.md` | Correccion completada - Backend DTOs |
| `CORR-002-ANALISIS-DETALLADO-LEADERBOARD-ACHIEVEMENTS.md` | Correccion completada - Frontend |
| `CORR-002-PLAN-EJECUCION.md` | Correccion completada - Frontend |
| `CORR-002-REPORTE-EJECUCION.md` | Correccion completada - Frontend |

### 2026-01-04

| Archivo | Razon |
|---------|-------|
| `CORR-001-ANALISIS-LEADERBOARD-ACHIEVEMENTS.md` | Correccion completada - Frontend |
| `CORR-001-PLAN-EJECUCION.md` | Correccion completada - Frontend |
| `CORR-001-REPORTE-EJECUCION.md` | Correccion completada - Frontend |

### 2025-12-18

| Archivo | Razon |
|---------|-------|
| `CORRECCIONES-BUILD-AUTH-2025-11-25.md` | Correccion completada |
| `CORRECCION-GAMIFICACION-RANGOS-2025-11-29.md` | Correccion completada |
| `CORRECCION-EJERCICIOS-MODULO3-REQUIRES-MANUAL-GRADING-2025-11-29.md` | Correccion completada |

**Ver traza completa:** `orchestration/trazas/TRAZA-DOCUMENTACION-DEPRECADA.md`

---

## Navegacion

### Para ver estado actual de issues:
- **Consultar:** `BACKEND-CRITICAL-ISSUES-PENDING.md` (SSOT)

### Para ver correcciones aplicadas:
- Consultar `orchestration/reportes/correcciones/`

### Para ver historico de issues (Oct 2025):
- Consultar `archivados/historicos-2025/correcciones-obsoletas/ISSUES-CRITICOS-2025-10-DEPRECATED.md`

---

## Metricas de Integracion (Ultima validacion: 2025-11-26)

```text
Database → Backend:              89.0%
Database → Frontend (via APIs):  86.0%
PROMEDIO GLOBAL:                 87.5%
ESTADO:                          PRODUCTION READY
```

---

**Actualizado:** 2026-01-07 (CORR-011 agregado - Sincronizacion Documentacion M3-M5)
**Por:** Claude Code (Orchestrator Agent)
