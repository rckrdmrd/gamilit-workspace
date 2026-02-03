---
id: PLAN-EAI-007-EVAL-MANUAL
title: Plan de Desarrollo - Ejercicios M3-M4-M5 con Evaluacion Manual
epic: EAI-007
status: In Progress
created: 2026-01-04
updated: 2026-01-04
author: "@Claude-Agent"
---

# Plan de Desarrollo: Ejercicios M3-M4-M5 con Evaluacion Manual

## Contexto

**Proyecto:** Gamilit - Plataforma de Gamificacion Educativa
**Alcance:** Garantizar funcionamiento correcto de ejercicios M3(Ej.5), M4(5 ejs), M5(3 ejs) con:
- Evaluacion desde portal Teacher
- Integracion con mecanicas de gamificacion (XP, ML Coins)
- Documentacion actualizada

---

## Resumen del Analisis Inicial

### Estado Encontrado (2026-01-04)

| Modulo | Seeds | requires_manual_grading | Frontend | Backend | Teacher Portal |
|--------|-------|------------------------|----------|---------|----------------|
| M3 Ej.5 | Verificar | - | Verificar | Verificar | Verificar |
| M4 (5 ejs) | 4/5 | 1/5 correctos | OK | OK | OK |
| M5 (3 ejs) | 3/3 | 3/3 correctos | OK | OK | OK |

### Gaps Criticos Identificados

| Gap | Descripcion | Prioridad | Estado |
|-----|-------------|-----------|--------|
| G1 | M4 Seeds incorrectos - 4/5 ejercicios con `requires_manual_grading=FALSE` | CRITICA | CORREGIDO |
| G2 | M4.4 Navegacion Hipertextual - Verificar seed | MEDIA | Verificado OK |
| G3 | M3 Ejercicio 5 - Sin seed consolidado | MEDIA | Pendiente |
| G4 | Teacher Portal sin vista previa respuestas | BAJA | Pendiente |
| G5 | Sin notificacion post-calificacion | BAJA | Pendiente |

---

## Fases de Desarrollo

### FASE 1: Correccion de Base de Datos (COMPLETADA)

#### 1.1 Corregir `requires_manual_grading` en M4
**Archivo:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
**Estado:** COMPLETADO

**Cambios realizados:**
- Ejercicio 4.1 (Verificador Fake News): `TRUE`
- Ejercicio 4.2 (Infografia Interactiva): `TRUE`
- Ejercicio 4.3 (Quiz TikTok): `TRUE`
- Ejercicio 4.4 (Navegacion Hipertextual): `TRUE`
- Ejercicio 4.5 (Analisis Memes): Ya era `TRUE`

#### 1.2 Actualizar constantes Frontend
**Archivo:** `apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`
**Estado:** COMPLETADO

**Cambios realizados:**
- Agregados 5 ejercicios M3 (Comprension Critica)
- Agregados 5 ejercicios M4 (Lectura Digital)
- Total: 13 ejercicios con evaluacion manual

---

### FASE 2: Validacion de Backend (PENDIENTE)

#### 2.1 Verificar validador M4/M5
**Archivo:** `apps/database/ddl/schemas/educational_content/functions/23-validate_module4_module5.sql`
**Estado:** Por verificar

#### 2.2 Verificar DTOs backend para M3.5
**Ubicacion:** `apps/backend/src/modules/educational/dto/`
**Estado:** Por verificar

---

### FASE 3: Verificacion Frontend (PENDIENTE)

#### 3.1 Verificar componente M3.5
**Ubicacion:** `apps/frontend/src/features/mechanics/module3/`
**Estado:** Por verificar

#### 3.2 Verificar M4.4 Navegacion Hipertextual
**Ubicacion:** `apps/frontend/src/features/mechanics/module4/NavegacionHipertextual/`
**Estado:** Por verificar

---

### FASE 4: Mejoras Portal Teacher (BACKLOG)

#### 4.1 Vista previa de respuestas
**Archivo:** `apps/frontend/src/apps/teacher/pages/ReviewPanel/ReviewDetail.tsx`
**Estado:** Backlog

#### 4.2 Rubricas visibles
**Archivo:** `apps/frontend/src/apps/teacher/components/dashboard/GradeSubmissionModal.tsx`
**Estado:** Backlog

---

### FASE 5: Documentacion (EN PROGRESO)

#### 5.1 Crear US para M3 Ejercicio 5
**Ubicacion:** `docs/01-fase-alcance-inicial/EAI-002-actividades/historias-usuario/`
**Estado:** Pendiente

#### 5.2 Actualizar TRACEABILITY.yml
**Archivo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/implementacion/TRACEABILITY.yml`
**Estado:** COMPLETADO

#### 5.3 Documentar tarea de correccion
**Archivo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/tareas/TASK-FIX-M4M5-001-manual-grading-flags.md`
**Estado:** COMPLETADO

---

## Orden de Ejecucion

```
FASE 1 (DB Seeds) - COMPLETADA
 |
 +- 1.1 Corregir requires_manual_grading M4 [DONE]
 +- 1.2 Actualizar constantes frontend [DONE]
     |
     v
FASE 2 (Backend) - PENDIENTE
 |
 +- 2.1 Verificar validador
 +- 2.2 Verificar DTOs M3
     |
     v
FASE 3 (Frontend) - PENDIENTE
 |
 +- 3.1 Verificar componente M3.5
 +- 3.2 Verificar M4.4
     |
     v
FASE 4 (Teacher Portal) - BACKLOG
 |
 +- 4.1 Vista previa respuestas
 +- 4.2 Rubricas visibles
     |
     v
FASE 5 (Documentacion) - EN PROGRESO
 |
 +- 5.1 US M3.5 [PENDIENTE]
 +- 5.2 TRACEABILITY [DONE]
 +- 5.3 TASK-FIX [DONE]
```

---

## Criterios de Aceptacion

- [x] M4 Seeds: 5/5 ejercicios con `requires_manual_grading=TRUE`
- [x] M5 Seeds: 3/3 ejercicios funcionando
- [ ] M3.5: Ejercicio con seed y evaluacion
- [x] Frontend: Constantes actualizadas con 13 ejercicios
- [ ] BD: Recreacion ejecutada y validada
- [x] Documentacion: Tarea de correccion documentada

---

## Decisiones Confirmadas

1. **M4 ejercicios:** Todos los 5 ejercicios requieren evaluacion manual
2. **Prioridad:** M4-M5 primero, luego M3.5
3. **Portal Teacher:** Mejoras de UI en backlog (vista previa, rubricas)

---

## Resultado de Validacion (2026-01-04)

### Validacion Ejecutada

Se valido backend, frontend (student y teacher), seeds e integracion de gamificacion.

### Estado General

| Area | Estado | Gaps Criticos | Gaps Medios |
|------|--------|---------------|-------------|
| Backend | OK | 0 | 3 |
| Frontend Student | OK | 1 | 1 |
| Frontend Teacher | ATENCION | 1 | 3 |
| Seeds | OK | 0 | 2 |
| Gamificacion | OK | 0 | 0 |

### Gaps Criticos Identificados

1. **GAP-CRIT-001:** Teacher Portal no envia rewards al calificar
2. **GAP-CRIT-002:** Componente ProgressToKukulkan no existe

### Documentacion Detallada

Ver: [TASK-VAL-M4M5-001](../tareas/TASK-VAL-M4M5-001-gaps-correccion.md)

---

## Acciones Inmediatas Requeridas

1. ~~Ejecutar recreacion de base de datos~~ (BD ya tiene valores correctos)
2. **CRITICO:** Corregir integracion de rewards en Teacher Portal
3. Clarificar requerimiento de ProgressToKukulkan
4. Agregar plantillas de notificacion faltantes

---

## Referencias

- EPIC: [EPICA-EAI-007.md](../EPICA-EAI-007.md)
- Tarea: [TASK-FIX-M4M5-001](../tareas/TASK-FIX-M4M5-001-manual-grading-flags.md)
- Trazabilidad: [TRACEABILITY.yml](./TRACEABILITY.yml)
- Diseno: [DocumentoDeDiseño v6.1](../../../00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md)

---

**Creado:** 2026-01-04
**Autor:** @Claude-Agent
