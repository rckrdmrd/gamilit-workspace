# CORR-011: PLAN DE EJECUCION - Sincronizacion Documentacion M3-M5

**Correccion:** CORR-011
**Tipo:** Sincronizacion Documentacion/Codigo
**Fecha:** 2026-01-07
**Agente:** Claude Opus 4.5 (Orchestrator Agent)
**Estado:** COMPLETADO

---

## Plan de Ejecucion

### CICLO 1: CORR-SEED-M4-001 - Verificar Seeds quiz_tiktok

**Objetivo:** Confirmar que quiz_tiktok tiene `requires_manual_grading = false`

**Archivos:**
1. `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
2. `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Resultado:** YA CORRECTO - No requiere modificacion

---

### CICLO 1.5: CORR-FE-CONST-001 - Corregir Constante Frontend

**Objetivo:** Remover quiz-tiktok de la lista de ejercicios con revision manual

**Archivo:**
`apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

**Cambios:**
1. Remover entrada de quiz-tiktok
2. Actualizar comentario de M4 de "5 ejercicios" a "4 ejercicios"
3. Agregar comentario explicativo: `// Nota: quiz_tiktok es auto-gradable y NO esta en esta lista (CORR-FE-CONST-001)`

---

### CICLO 2: CORR-DOC-M4-001 - Actualizar RF-M4-001

**Objetivo:** Actualizar documento de requerimientos M4 con tipos correctos

**Archivo:**
`docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M4-001-ejercicios-m4.md`

**Cambios:**
- Reemplazar tabla de tipos incorrectos con:

| # | Tipo | Descripcion | Validacion | XP | ML Coins |
|---|------|-------------|------------|-----|----------|
| 1 | verificador_fake_news | Verificador de Fake News | Manual | 150 | 30 |
| 2 | infografia_interactiva | Infografia Interactiva | Manual | 150 | 30 |
| 3 | quiz_tiktok | Quiz estilo TikTok | **Auto** | 100 | 20 |
| 4 | navegacion_hipertextual | Navegacion Hipertextual | Manual | 150 | 30 |
| 5 | analisis_memes | Analisis de Memes | Manual | 150 | 30 |

- Agregar nota sobre quiz_tiktok y su evaluacion automatica
- Actualizar fecha de modificacion

---

### CICLO 3: CORR-DOC-M5-001 - Actualizar RF-M5-001

**Objetivo:** Actualizar documento de requerimientos M5 con tipos correctos

**Archivo:**
`docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M5-001-ejercicios-m5.md`

**Cambios:**
- Reemplazar tabla de tipos incorrectos con:

| # | Tipo | Descripcion | Validacion | XP | ML Coins |
|---|------|-------------|------------|-----|----------|
| 1 | diario_multimedia | Diario Multimedia de Marie Curie | Manual | 200 | 40 |
| 2 | comic_digital | Comic Digital Narrativo | Manual | 200 | 40 |
| 3 | video_carta | Video-Carta a Marie Curie | Manual | 200 | 40 |

- Actualizar descripciones detalladas de cada ejercicio
- Actualizar fecha de modificacion

---

### CICLO 4: CORR-DOC-FLUJO-001 - Verificar Flujo Validacion

**Objetivo:** Verificar que documento de flujo tenga nota sobre quiz_tiktok

**Archivo:**
`docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

**Resultado:** YA CORRECTO - El documento ya contiene la nota correcta sobre quiz_tiktok

---

## Orden de Ejecucion

| Orden | Ciclo | ID | Tipo |
|-------|-------|-----|------|
| 1 | CICLO 1 | CORR-SEED-M4-001 | Verificacion |
| 2 | CICLO 1.5 | CORR-FE-CONST-001 | Codigo |
| 3 | CICLO 2 | CORR-DOC-M4-001 | Documentacion |
| 4 | CICLO 3 | CORR-DOC-M5-001 | Documentacion |
| 5 | CICLO 4 | CORR-DOC-FLUJO-001 | Verificacion |
| 6 | VALIDACION | - | Testing |

---

## Cambios en Base de Datos

**Resultado del analisis:** NO hay cambios de base de datos requeridos.

Los seeds ya tienen los valores correctos:
- `quiz_tiktok` tiene `requires_manual_grading = false`
- Todos los demas ejercicios de M3-M5 tienen `requires_manual_grading = true`

---

**Creado por:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 1.0
