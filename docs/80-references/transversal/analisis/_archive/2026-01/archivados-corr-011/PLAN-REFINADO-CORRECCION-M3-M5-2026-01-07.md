# PLAN REFINADO: CORRECCIONES M3-M5 Y DOCUMENTACION

**Agente:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 2.0 (REFINADO)
**Estado:** FASE 5 - PLAN FINAL
**Basado en:** Validacion que identifico gaps en plan original

---

## RESUMEN DE CAMBIOS vs PLAN ORIGINAL

| Cambio | Descripcion | Razon |
|--------|-------------|-------|
| Agregar CICLO 1.5 | Corregir manualReviewExercises.ts | quiz-tiktok esta listado (confirmado) |
| Agregar paso BUSQUEDA | Buscar otras referencias incorrectas | Completitud |
| Actualizar comentario M4 | El archivo tiene comentario incorrecto | Consistencia |

---

## PLAN FINAL DE EJECUCION

### CICLO 1: CORR-SEED-M4-001 - Corregir Seeds quiz_tiktok

**Objetivo:** Cambiar `requires_manual_grading = false` para quiz_tiktok.

**Archivos:**
1. `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`
2. `apps/database/seeds/dev/educational_content/05-exercises-module4.sql`

**Cambios:**
- Linea con quiz_tiktok: cambiar `true` a `false` en requires_manual_grading
- Agregar comentario: `-- CORR-SEED-M4-001: Auto-gradable (tiene gradeQuizTiktok())`

**Validacion:**
```sql
SELECT exercise_type, requires_manual_grading
FROM educational_content.exercises
WHERE exercise_type = 'quiz_tiktok';
-- Esperado: quiz_tiktok | false
```

---

### CICLO 1.5: CORR-FE-CONST-001 - Corregir Constante Frontend

**Objetivo:** Remover quiz-tiktok de la lista de ejercicios con revision manual.

**Archivo:**
`apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

**Cambios:**
1. Remover entrada de quiz-tiktok (lineas 84-90)
2. Actualizar comentario de M4 de "5 ejercicios" a "4 ejercicios"
3. Agregar comentario explicativo sobre quiz-tiktok

**Contenido final de seccion M4:**
```typescript
  // Módulo 4 - Lectura Digital (4 ejercicios con evaluación manual)
  // Nota: quiz_tiktok es auto-gradable y NO está en esta lista
  {
    id: 'verificador-fake-news',
    title: 'Verificador de Fake News',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  {
    id: 'infografia-interactiva',
    title: 'Infografía Interactiva',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  // quiz-tiktok REMOVIDO - es auto-gradable (CORR-FE-CONST-001)
  {
    id: 'navegacion-hipertextual',
    title: 'Navegación Hipertextual',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
  {
    id: 'analisis-memes',
    title: 'Análisis de Memes',
    moduleId: 'module-4',
    moduleName: 'Lectura Digital',
    moduleNumber: 4,
  },
```

---

### CICLO 2: CORR-DOC-M4-001 - Actualizar RF-M4-001

**Objetivo:** Actualizar documento de requerimientos M4 con tipos correctos.

**Archivo:**
`docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M4-001-ejercicios-m4.md`

**Cambios:**
- Reemplazar tipos incorrectos con tipos correctos
- Marcar quiz_tiktok como Auto
- Agregar nota explicativa
- Actualizar fecha

---

### CICLO 3: CORR-DOC-M5-001 - Actualizar RF-M5-001

**Objetivo:** Actualizar documento de requerimientos M5 con tipos correctos.

**Archivo:**
`docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/RF-M5-001-ejercicios-m5.md`

**Cambios:**
- Reemplazar tipos incorrectos (ensayo, carta, proyecto_multimedia)
- Con tipos correctos (diario_multimedia, comic_digital, video_carta)
- Agregar descripciones detalladas
- Actualizar fecha

---

### CICLO 4: CORR-DOC-FLUJO-001 - Actualizar Flujo Validacion

**Objetivo:** Agregar nota sobre quiz_tiktok en documento de flujo.

**Archivo:**
`docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md`

**Cambios:**
- Agregar seccion "Nota sobre Quiz TikTok" despues de tabla M4
- Explicar por que es auto-gradable
- Referenciar implementacion

---

## ORDEN DE EJECUCION FINAL

| Orden | Ciclo | ID | Tipo | Duracion |
|-------|-------|-----|------|----------|
| 1 | CICLO 1 | CORR-SEED-M4-001 | Codigo | 10 min |
| 2 | CICLO 1.5 | CORR-FE-CONST-001 | Codigo | 10 min |
| 3 | CICLO 2 | CORR-DOC-M4-001 | Documentacion | 10 min |
| 4 | CICLO 3 | CORR-DOC-M5-001 | Documentacion | 10 min |
| 5 | CICLO 4 | CORR-DOC-FLUJO-001 | Documentacion | 5 min |
| 6 | VALIDACION | - | Testing | 15 min |
| **TOTAL** | | | | **60 min** |

---

## CHECKLIST DE EJECUCION

### Pre-Ejecucion
- [ ] Verificar que no hay cambios sin commit
- [ ] Crear backup de archivos a modificar

### CICLO 1
- [ ] Modificar seed prod M4
- [ ] Modificar seed dev M4
- [ ] Ejecutar seed en BD local
- [ ] Validar con query SQL

### CICLO 1.5
- [ ] Remover quiz-tiktok de constante
- [ ] Actualizar comentario de M4
- [ ] Verificar sintaxis TypeScript

### CICLO 2
- [ ] Actualizar RF-M4-001
- [ ] Verificar tipos correctos

### CICLO 3
- [ ] Actualizar RF-M5-001
- [ ] Verificar tipos correctos

### CICLO 4
- [ ] Agregar nota en flujo
- [ ] Verificar formato markdown

### Validacion Final
- [ ] Query SQL muestra quiz_tiktok con false
- [ ] Constante no lista quiz-tiktok
- [ ] Documentacion tiene tipos correctos
- [ ] Sin errores de sintaxis

---

## CRITERIOS DE EXITO FINALES

| Criterio | Verificacion |
|----------|--------------|
| quiz_tiktok no aparece en portal teacher | Query a vista teacher_pending_reviews |
| Documentacion sincronizada | Comparacion con seeds |
| Codigo sin errores | npm run build |
| 12 ejercicios con evaluacion manual | Query SQL (5 M3 + 4 M4 + 3 M5) |

---

## ROLLBACK

### Para CICLO 1 (Seeds)
```sql
UPDATE educational_content.exercises
SET requires_manual_grading = true
WHERE exercise_type = 'quiz_tiktok';
```

### Para CICLO 1.5 (Constante)
```bash
git checkout apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts
```

### Para CICLO 2-4 (Documentacion)
```bash
git checkout docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/requerimientos/
git checkout docs/90-transversal/sistema-recompensas/03-FLUJO-VALIDACION-MAESTRO-M3-M5.md
```

---

**Creado por:** Claude Opus 4.5 (Orchestrator Agent)
**Fecha:** 2026-01-07
**Version:** 2.0
**Estado:** PLAN REFINADO - LISTO PARA EJECUCION
