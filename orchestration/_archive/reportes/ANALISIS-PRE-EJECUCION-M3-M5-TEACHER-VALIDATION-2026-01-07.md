# ANÁLISIS PRE-EJECUCIÓN: CORR-M3M5-001 - Integración M3-M5 con Validación del Maestro

**Agente:** Arquitecto de Soluciones (Claude Opus 4.5)
**Tipo de tarea:** Feature / Documentación
**Prioridad:** P1
**Fecha análisis:** 2026-01-07
**Relacionado con:** [EAI-007], [CORR-009], [CORR-AF-001]

---

## 📋 CONTEXTO DE LA TAREA

### Solicitud Original
Actualizar la documentación y definiciones para que todos los ejercicios de M3-M5 se integren con la validación por parte del maestro desde el portal teacher. El flujo debe ser: estudiante hace ejercicio → mensaje de confirmación → maestro evalúa → recompensas asignadas → notificación al estudiante.

### Objetivo Final
Asegurar que todos los ejercicios de módulos 3-5 tengan:
1. `requires_manual_grading = TRUE` en base de datos
2. Mensaje "pendiente de revisión" en frontend
3. Documentación completa del flujo
4. Validación de scripts de base de datos

### Módulo Relacionado
**Módulo MVP:** Módulos Educativos (M3-M5)
**Sección en MVP-APP.md:** Secciones 3.1-3.3 (Ejercicios)

### Justificación
Los ejercicios de M3-M5 requieren evaluación cualitativa que no puede automatizarse. El flujo de validación manual garantiza calidad pedagógica y permite feedback personalizado.

---

## 🔍 INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] MASTER_INVENTORY.yml
- [x] DATABASE_INVENTORY.yml
- [x] BACKEND_INVENTORY.yml
- [x] FRONTEND_INVENTORY.yml
- [x] DEVENV-MASTER-INVENTORY.yml

**Comandos ejecutados:**
```bash
# Verificación de seeds M3-M5
grep -rn "requires_manual_grading" apps/database/seeds/

# Resultado:
# ✅ 12/13 ejercicios con requires_manual_grading = TRUE
# ⚠️ quiz_tiktok es auto-evaluable (intencional)
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: `educational_content` → ✅ existe
- Schema: `progress_tracking` → ✅ existe
- Tabla: `exercises` → ✅ existe (con requires_manual_grading)
- Tabla: `exercise_submissions` → ✅ existe
- Trigger: `trg_update_user_stats_on_submission` → ✅ existe
- Vista: `teacher_pending_reviews` → ✅ existe

**Backend:**
- Módulo: `progress` → ✅ existe
- Módulo: `teacher` → ✅ existe
- Service: `ManualReviewService` → ✅ existe
- Service: `ExerciseSubmissionService` → ✅ existe

**Frontend:**
- Página: `TeacherReviewPanelPage` → ✅ existe
- Página: `TeacherExerciseResponsesPage` → ✅ existe
- Componente: `ReviewDetail` → ✅ existe
- Componentes M3-M5: 13 ejercicios → ✅ existen

### Objetos a Crear/Modificar

**Nuevos objetos:**
- [x] Documento: `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` (crear)
- [x] Documento: `RF-M3-001-ejercicios-m3.md` (crear)
- [x] Documento: `RESPONSES-M3-M5.md` (crear)

**Objetos a modificar:**
- [x] Componente: `AnalisisFuentesExercise.tsx` (agregar manejo pending_review)
- [x] Inventario: `DEVENV-MASTER-INVENTORY.yml` (agregar sección ejercicios_revision_manual)

---

## ⚠️ ANÁLISIS DE RIESGOS

### Riesgo de Duplicación

**Verificación:**
- [x] NO existe documento de flujo similar
- [x] NO existe RF-M3-001 (existe RF-M4 y RF-M5)
- [x] NO existe RESPONSES-M3-M5 específico

**Objetos similares encontrados:**
- `02-FLUJO-END-TO-END.md` - Flujo general de recompensas (complementario, no duplicado)
- `Manual_Portal_Maestros_ACTUALIZADO.md` - Manual de usuario (necesita capítulo específico)

**Decisión:**
- [x] Crear nuevos documentos (complementarios a existentes)
- [x] Actualizar inventario existente

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Inconsistencia AnalisisFuentes | ALTA | MEDIA | Corregir componente frontend |
| Quiz TikTok no documentado | BAJA | BAJA | Documentar como excepción |
| Scripts BD desactualizados | BAJA | ALTA | Verificar create-database.sh |

---

## 📊 ANÁLISIS DE IMPACTO

### Archivos Afectados

| Capa | Archivo | Cambio |
|------|---------|--------|
| Frontend | `AnalisisFuentesExercise.tsx` | Agregar manejo pending_review |
| Docs | `03-FLUJO-VALIDACION-MAESTRO-M3-M5.md` | Crear |
| Docs | `RF-M3-001-ejercicios-m3.md` | Crear |
| Docs | `RESPONSES-M3-M5.md` | Crear |
| Config | `DEVENV-MASTER-INVENTORY.yml` | Agregar sección |

### Dependencias
- `create-database.sh` ya incluye FASE 9.6 y seeds M3-M5 (CORR-009)
- Triggers de BD ya existen y funcionan
- Backend services ya implementados

### Módulos Afectados
- `features/mechanics/module3/` - AnalisisFuentes
- `docs/90-transversal/sistema-recompensas/`
- `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/`
- `docs/03-fase-extensiones/EXT-001-portal-maestros/`

---

## 📐 DECISIÓN DE APPROACH

### Approach Seleccionado
1. Corregir componente AnalisisFuentesExercise primero (único gap de código)
2. Crear documentación según templates estándar
3. Actualizar inventarios
4. Validar con recreación de BD

**Alternativas consideradas:**
1. Solo documentar sin corregir código - Descartado: dejaría inconsistencia
2. Modificar seeds de BD - Descartado: ya están correctos

---

## 🤖 NECESIDAD DE SUBAGENTES

### Análisis de Complejidad
- Complejidad: MEDIA
- Archivos a modificar: 5
- Líneas de código: ~15
- Líneas de documentación: ~800

### Plan de Subagentes
| Subagente | Tarea | Estado |
|-----------|-------|--------|
| Explore | Análisis de estructura | ✅ Completado |
| Explore | Análisis de seeds | ✅ Completado |
| Explore | Análisis de triggers | ✅ Completado |
| Explore | Análisis de documentación | ✅ Completado |

---

## ⏱️ ESTIMACIÓN PRELIMINAR

| Fase | Descripción | Duración |
|------|-------------|----------|
| Análisis | Exploración y validación | 30 min |
| Corrección código | AnalisisFuentesExercise | 5 min |
| Documentación | Crear 3 documentos | 20 min |
| Actualización | Inventarios | 5 min |
| Validación BD | Recrear y verificar | 10 min |
| **Total** | | **70 min** |

---

## 📚 REFERENCIAS CONSULTADAS

### Documentación
- `orchestration/templates/TEMPLATE-ANALISIS.md`
- `orchestration/templates/TEMPLATE-PLAN.md`
- `orchestration/patrones/NOMENCLATURA-UNIFICADA.md`
- `docs/90-transversal/sistema-recompensas/02-FLUJO-END-TO-END.md`

### Código Existente
- `apps/database/create-database.sh`
- `apps/database/seeds/prod/educational_content/04-exercises-module3.sql`
- `apps/frontend/src/features/mechanics/module3/`

### Inventarios
- `orchestration/inventarios/DEVENV-MASTER-INVENTORY.yml`
- `orchestration/inventarios/DATABASE_INVENTORY.yml`

---

## ✅ CONCLUSIÓN DEL ANÁLISIS

### Resumen
- El flujo de validación del maestro ya está **IMPLEMENTADO** en código
- La documentación estaba **INCOMPLETA** y necesitaba actualizarse
- Un componente (AnalisisFuentes) tenía **INCONSISTENCIA** con la BD
- Los scripts de BD ya incluyen cambios de CORR-009

### Decisiones Clave
1. Corregir AnalisisFuentesExercise (única corrección de código necesaria)
2. Crear documentación completa según estándares
3. Documentar Quiz TikTok como excepción auto-evaluable
4. Validar recreación de BD

### Recomendaciones
1. Ejecutar `./reset-database.sh` para validar scripts
2. Commit de cambios con mensaje descriptivo
3. Actualizar Manual del Portal Maestros con capturas

### Aprobación para Proceder
- [x] Análisis completado
- [x] Riesgos mitigados
- [x] Recursos identificados
- [x] Plan definido

**Estado:** ✅ APROBADO PARA EJECUCIÓN

---

*Documento generado según TEMPLATE-ANALISIS.md del sistema SIMCO*
