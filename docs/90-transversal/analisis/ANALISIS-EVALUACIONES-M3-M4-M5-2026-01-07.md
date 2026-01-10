# ANALISIS PRE-EJECUCION: CORR-M3-001-002 - Evaluaciones Modulo 3

**Agente:** Orchestrator-Agent
**Tipo de tarea:** Correccion
**Prioridad:** P1
**Fecha analisis:** 2026-01-07
**Relacionado con:** [GAP-SEED-M3-001], [GAP-SEED-M3-002], [US-GAM-007]

---

## CONTEXTO DE LA TAREA

### Solicitud Original
Integrar los ejercicios del modulo 3 con las evaluaciones del portal de teacher y asignar las recompensas con base en las evaluaciones hechas por el maestro. Los modulos 4 y 5 ya estan implementados correctamente.

### Objetivo Final
Que todos los ejercicios del Modulo 3 (Comprension Critica) aparezcan en el portal Teacher para evaluacion manual y distribuyan recompensas correctamente al ser evaluados.

### Modulo Relacionado
**Modulo MVP:** EAI-007 - Modulos M4 y M5
**Seccion en MVP-APP.md:** Portal Teacher - Evaluaciones Manuales

### Justificacion
Los ejercicios "Analisis de Fuentes" (M3.1) y "Tribunal de Opiniones" (M3.5) no aparecian en el portal Teacher porque faltaba el campo `requires_manual_grading = true` en sus seeds. Esto impedia que los docentes pudieran evaluarlos y que los estudiantes recibieran recompensas.

---

## INVENTARIO ACTUAL

### Consultas Realizadas

**Inventarios revisados:**
- [x] DATABASE_INVENTORY.yml (schema educational_content)
- [x] Seeds educational_content/04-exercises-module3.sql
- [x] Vista teacher_pending_reviews

**Comandos ejecutados:**
```bash
# Verificar estado de ejercicios M3
SELECT e.title, e.exercise_type, e.requires_manual_grading
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code = 'MOD-03-CRITICA';

# Resultado inicial:
# analisis_fuentes: requires_manual_grading = FALSE <- GAP
# tribunal_opiniones: requires_manual_grading = FALSE <- GAP
# debate_digital: requires_manual_grading = TRUE
# podcast_argumentativo: requires_manual_grading = TRUE
# matriz_perspectivas: requires_manual_grading = TRUE
```

### Objetos Existentes Relacionados

**Base de Datos:**
- Schema: educational_content -> EXISTE
- Tabla: exercises -> EXISTE (campo requires_manual_grading presente)
- Vista: teacher_pending_reviews -> EXISTE (filtra por requires_manual_grading=true)
- Funcion: create_manual_review_on_submission -> EXISTE
- Trigger: trg_create_manual_review -> EXISTE

**Backend:**
- Entity: ExerciseEntity -> EXISTE (campo mapeado)
- Service: ExerciseSubmissionService -> EXISTE (valida campo)
- Service: ManualReviewService -> EXISTE
- Controller: ExercisesController -> EXISTE (branching por campo)

**Frontend:**
- Constante: manualReviewExercises.ts -> EXISTE (lista 5 ejercicios M3)
- Pagina: TeacherReviewPanelPage -> EXISTE

### Objetos a Crear/Modificar

**Objetos a modificar:**
- [x] Seed: 04-exercises-module3.sql (agregar requires_manual_grading a 2 ejercicios)

---

## ANALISIS DE RIESGOS

### Riesgo de Duplicacion

**Verificacion:**
- [x] NO existe campo similar (el campo ya existe en DDL)
- [x] NO existe seed duplicado

**Decision:**
- [x] Modificar objeto existente: 04-exercises-module3.sql

### Otros Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigacion |
|--------|-------------|---------|------------|
| Seed no ejecuta correctamente | Baja | Alto | Usar ON CONFLICT DO UPDATE |
| Campo no existe en tabla | Baja | Alto | Verificar DDL antes de ejecutar |
| Ejercicios existentes no se actualizan | Media | Alto | Incluir campo en ON CONFLICT clause |

---

## ANALISIS DE IMPACTO

### Archivos Afectados

**A modificar:**
- apps/database/seeds/prod/educational_content/04-exercises-module3.sql
- apps/database/seeds/dev/educational_content/04-exercises-module3.sql

**Total archivos:**
- Crear: 0
- Modificar: 2

### Dependencias

**Esta tarea depende de:**
- [DDL-exercises]: Campo requires_manual_grading en tabla -> Estado: Completado
- [Trigger-manual-review]: Trigger que crea ManualReview -> Estado: Completado

**Bloqueadores actuales:**
- Ninguno

**Esta tarea bloquea:**
- Portal Teacher: Evaluacion de ejercicios M3.1 y M3.5

### Modulos Afectados

**Impacto directo:**
- Modulo: educational_content (seeds)
- Stack: Database

**Impacto indirecto:**
- Modulos que consumen: progress_tracking (vista teacher_pending_reviews)
- Modulos relacionados: Portal Teacher, Sistema de recompensas

### Dependencias del Campo requires_manual_grading

El campo tiene **11 dependencias** en el sistema:

| Componente | Archivo | Linea | Tipo de Uso |
|------------|---------|-------|-------------|
| DDL | 02-exercises.sql | 45, 112 | Definicion, Indice |
| Vista | teacher_pending_reviews.sql | 96 | Filtro WHERE |
| Funcion | create_manual_review_on_submission.sql | 49, 54 | Condicion logica |
| Entity | exercise.entity.ts | 193-203 | Mapeo TypeORM |
| Service | exercise-submission.service.ts | 231, 344 | Validacion |
| Service | exercise-validator.service.ts | 614-621 | Consulta |
| Controller | exercises.controller.ts | 993 | Branching |

---

## DECISION DE APPROACH

### Approach Seleccionado
Modificar los seeds de ejercicios para agregar `requires_manual_grading = true` a los 2 ejercicios faltantes, utilizando la clausula ON CONFLICT para actualizar registros existentes.

**Razones:**
1. Solucion quirurgica - solo modifica 6 lineas por archivo
2. ON CONFLICT garantiza actualizacion de registros existentes
3. Compatible con flujo de recreacion de BD

### Alternativas Consideradas

**Alternativa 1:** UPDATE directo en BD
- **Pros:** Rapido, no requiere recrear BD
- **Contras:** No persiste en seeds, se pierde al recrear
- **Razon de descarte:** No es solucion permanente

**Alternativa 2:** Modificar DDL para DEFAULT true
- **Pros:** Automatico para todos los ejercicios
- **Contras:** Rompe semantica (no todos requieren evaluacion manual)
- **Razon de descarte:** Semanticamente incorrecto

---

## NECESIDAD DE SUBAGENTES

### Analisis de Complejidad

**Criterios:**
- Numero de pasos: 3 -> Simple
- Modulos afectados: 1 -> Simple
- Archivos a crear: 0, modificar: 2 -> Simple
- Coordinacion entre capas: No

**Decision:**
- [x] **NO usar subagentes** - Tarea simple, ejecutar directamente

---

## ESTIMACION PRELIMINAR

### Tiempo Estimado por Fase

| Fase | Duracion Estimada | Notas |
|------|-------------------|-------|
| Analisis | 15 min | Este documento |
| Planificacion | 10 min | Plan de correccion |
| Ejecucion | 10 min | Editar seeds |
| Validacion | 10 min | Ejecutar seed + query verificacion |
| Documentacion | 15 min | Actualizar _MAP, crear validacion |
| **TOTAL** | **60 min** | |

### Recursos Necesarios

**Agentes:**
- Agente principal: Orchestrator-Agent
- Subagentes: Ninguno

**Herramientas:**
- Edit tool para modificar seeds
- Bash para ejecutar SQL
- Read para verificar archivos

---

## REFERENCIAS CONSULTADAS

### Documentacion del Proyecto
- [x] docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/implementacion/PLAN-EVALUACION-MANUAL-M3M4M5.md
- [x] docs/90-transversal/correcciones/_MAP.md

### Codigo Existente
**Archivos de referencia:**
- apps/database/seeds/prod/educational_content/05-exercises-module4.sql - Usado como template (tiene estructura correcta)
- apps/database/ddl/schemas/progress_tracking/views/02-teacher_pending_reviews.sql - Referencia de como se usa el campo

### Inventarios y Trazas
- [x] _MAP.md de correcciones

---

## CONCLUSION DEL ANALISIS

### Resumen
El analisis identifico que 2 de 5 ejercicios del Modulo 3 carecen del campo `requires_manual_grading = true` en sus seeds. Esto causa que no aparezcan en el portal Teacher y los estudiantes no reciban recompensas. La solucion es agregar el campo a los INSERT statements y las clausulas ON CONFLICT en ambos seeds (prod y dev).

### Decisiones Clave
1. **Approach:** Modificar seeds con ON CONFLICT UPDATE
2. **Subagentes:** No usar - tarea simple
3. **Objetos a crear:** 0
4. **Objetos a modificar:** 2 archivos (prod y dev)
5. **Duracion estimada:** 60 minutos

### Recomendaciones
1. Ejecutar seed en BD de desarrollo antes de produccion
2. Verificar con query SQL que 5/5 ejercicios tengan el campo

### Aprobacion para Proceder
- [x] Analisis completo y documentado
- [x] Sin bloqueadores identificados
- [x] Recursos disponibles
- [x] Estimaciones validadas
- [x] **APROBADO PARA PLANIFICACION**

---

## PROXIMO PASO

**Accion:** Crear documento de planificacion (PLAN-CORRECCION-EVALUACIONES-M3-2026-01-07.md)

**Template:** TEMPLATE-PLAN.md

---

**Analizado por:** Claude Code (Orchestrator Agent)
**Fecha:** 2026-01-07 13:00
**Version:** 2.0
**Estado:** Aprobado
