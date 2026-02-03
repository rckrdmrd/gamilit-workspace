# ANÁLISIS PRE-EJECUCIÓN: CORR-009 - Vista teacher_pending_reviews DDL Errors

**Agente:** Orchestrator-Agent
**Tipo de tarea:** Corrección
**Prioridad:** P1
**Fecha análisis:** 2026-01-07
**Relacionado con:** [CORR-M3-001-002], [GAP-VIEW-001]

---

## CONTEXTO DE LA TAREA

### Solicitud Original
Durante la validación de CORR-M3-001-002 (requires_manual_grading en Módulo 3), se detectó que la vista `progress_tracking.teacher_pending_reviews` no existe en la base de datos debido a múltiples errores en el DDL.

### Objetivo Final
Corregir el DDL de la vista para que se pueda crear correctamente en la BD y funcione como parte del sistema de evaluaciones manuales del portal Teacher.

### Módulo Relacionado
**Módulo MVP:** Progress Tracking / Teacher Portal
**Sección en MVP-APP.md:** Teacher Portal - Pending Reviews Dashboard

### Justificación
- **Por qué es necesario?** La vista es crítica para el portal Teacher - muestra las submissions pendientes de revisión manual
- **Qué problema resuelve?** Sin la vista, los teachers no pueden ver qué ejercicios necesitan evaluación
- **Qué valor aporta?** Completa la integración del sistema de evaluaciones manuales

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] DATABASE_INVENTORY.yml
- [x] DEPENDENCY_GRAPH (via análisis de código)

**Comandos ejecutados:**
```bash
# Verificar si la vista existe
PGPASSWORD=*** psql -c "\dv progress_tracking.*"
# Resultado: ❌ Vista teacher_pending_reviews NO existe

# Intentar crear la vista
psql -f ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql
# Resultado: ERROR: column p.username does not exist
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: `progress_tracking` → EXISTE
- Tabla: `exercise_submissions` → EXISTE
- Vista: `teacher_pending_reviews` → NO EXISTE (ERROR DDL)
- Función: `get_teacher_pending_reviews_count()` → NO EXISTE (depende de vista)

**Backend:**
- No hay servicios que usen directamente esta vista (consultan tablas directamente)

**Frontend:**
- Portal Teacher usa APIs que eventualmente consultarían esta vista

### Objetos a Crear/Modificar

**Objetos a modificar:**
- [x] Vista DDL: `02-teacher_pending_reviews.sql` (corregir columnas)

---

## ANÁLISIS DE RIESGOS

### Riesgo de Duplicación

**Verificación:**
- [x] NO existe schema similar
- [x] NO existe vista similar
- [x] El archivo DDL ya existe, solo necesita corrección

**Decisión:**
- [x] Modificar objeto existente: `02-teacher_pending_reviews.sql`

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|-------------|---------|------------|
| Romper recreación BD | Media | Alto | Validar con script create-database.sh |
| Columnas incorrectas en SELECT | Alta | Alto | Verificar estructura de tablas fuente |
| ENUM values inválidos | Alta | Alto | Consultar valores válidos del ENUM |

---

## ANÁLISIS DE IMPACTO

### Archivos Afectados

**A modificar:**
- `apps/database/ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql`

**Total archivos:**
- Crear: 0
- Modificar: 1

### Dependencias

**Esta tarea depende de:**
- [DDL-exercises]: Tabla exercises con columnas correctas → COMPLETADO
- [DDL-profiles]: Tabla profiles con columnas correctas → COMPLETADO
- [DDL-submissions]: Tabla exercise_submissions con columnas correctas → COMPLETADO

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Portal Teacher: Dashboard de pending reviews

### Módulos Afectados

**Impacto directo:**
- Módulo: Progress Tracking
- Stack: Database

**Impacto indirecto:**
- Portal Teacher (cuando use la vista)

---

## DECISIÓN DE APPROACH

### Approach Seleccionado
Corregir el DDL de la vista mapeando las columnas correctas según la estructura actual de las tablas fuente.

**Razones:**
1. El archivo DDL ya existe, solo tiene errores de columnas
2. Las tablas fuente tienen la información necesaria

### Alternativas Consideradas

**Alternativa 1:** Crear las columnas faltantes en las tablas
- **Contras:** Modifica DDL estable, agrega complejidad innecesaria
- **Razón de descarte:** Las columnas no son necesarias, la vista estaba mal diseñada

---

## ANÁLISIS DE ERRORES DETECTADOS

### Columnas Incorrectas en el DDL

| Columna en DDL | Tabla | Error | Corrección |
|----------------|-------|-------|------------|
| `p.username` | profiles | NO EXISTE | `p.email` |
| `e.mechanic_type` | exercises | NO EXISTE | Remover (usar solo exercise_type) |
| `m.module_order` | modules | NO EXISTE | `m.order_index AS module_order` |
| `es.time_spent` | exercise_submissions | NO EXISTE | `es.time_spent_seconds` |
| `es.attempts` | exercise_submissions | NO EXISTE | `es.attempt_number` |
| `es.answers` | exercise_submissions | NO EXISTE | `es.answer_data` |
| `es.graded_by` | exercise_submissions | NO EXISTE | Remover |
| `es.metadata` | exercise_submissions | NO EXISTE | Remover |
| `es.tenant_id` | exercise_submissions | NO EXISTE | Remover |

### WHERE Clause con ENUM Inválidos

```sql
-- INCORRECTO: Estos valores no existen en el ENUM exercise_type
OR e.mechanic_type IN (
    'respuesta_abierta',        -- NO EXISTE
    'escritura_creativa',       -- NO EXISTE
    'debate_guiado',            -- NO EXISTE
    ...
)

-- CORRECTO: Simplificar a solo el flag
AND e.requires_manual_grading = true
```

---

## NECESIDAD DE SUBAGENTES

### Análisis de Complejidad

**Criterios:**
- Número de pasos: 3 → Simple
- Módulos afectados: 1 → Simple
- Archivos a crear: 0, modificar: 1 → Simple
- Coordinación entre capas: No

**Decisión:**
- [x] **NO usar subagentes** - Tarea simple, ejecutar directamente

---

## ESTIMACIÓN PRELIMINAR

### Tiempo Estimado por Fase

| Fase | Duración Estimada | Notas |
|------|-------------------|-------|
| Análisis | 15 min | Este documento |
| Planificación | 5 min | Plan simple |
| Ejecución | 10 min | Edición DDL |
| Validación | 15 min | Recreación BD |
| Documentación | 10 min | Actualizar _MAP |
| **TOTAL** | **55 min** | |

---

## CONCLUSIÓN DEL ANÁLISIS

### Resumen
La vista `teacher_pending_reviews` tiene 10 errores de columnas en su DDL, causados por referencias a columnas que no existen en las tablas fuente. La corrección es directa: mapear las columnas correctas y simplificar el WHERE clause para usar solo `requires_manual_grading = true`.

### Decisiones Clave
1. **Approach:** Corregir DDL existente con columnas correctas
2. **Subagentes:** No usar - tarea simple
3. **Objetos a modificar:** 1 archivo DDL
4. **Duración estimada:** ~55 minutos

### Aprobación para Proceder
- [x] Análisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA EJECUCIÓN**

---

**Analizado por:** Claude Code (Orchestrator Agent)
**Fecha:** 2026-01-07
**Versión:** 1.0
**Estado:** Aprobado
