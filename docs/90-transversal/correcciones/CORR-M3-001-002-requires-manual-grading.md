---
id: CORR-M3-001-002
title: Correccion requires_manual_grading en Modulo 3
project: GAMILIT
date: 2026-01-07
status: COMPLETADO
author: "@Claude-Orchestrator"
version: 1.0.0
---

# CORRECCION: requires_manual_grading en Modulo 3

## Resumen

Correccion aplicada a los ejercicios del Modulo 3 (Comprension Critica) para agregar el campo `requires_manual_grading = true` a todos los ejercicios que requieren evaluacion manual del maestro.

---

## Problema Identificado

### GAP-SEED-M3-001 y GAP-SEED-M3-002

**Descripcion:** Los ejercicios "Analisis de Fuentes" y "Tribunal de Opiniones" del Modulo 3 no tenian el campo `requires_manual_grading = true` en sus seeds, causando que no aparecieran en el portal Teacher para evaluacion manual.

**Impacto:** Estos ejercicios no aparecian en la vista `teacher_pending_reviews`, impidiendo que los maestros pudieran evaluarlos y los estudiantes no recibian recompensas.

---

## Archivos Modificados

| Archivo | Lineas Modificadas | Descripcion |
|---------|-------------------|-------------|
| 04-exercises-module3.sql | 37, 146, 149 | CORR-M3-001: Analisis de Fuentes |
| 04-exercises-module3.sql | 506, 606, 609 | CORR-M3-002: Tribunal de Opiniones |

---

## Cambios Realizados

### CORR-M3-001: Analisis de Fuentes

**Linea 37** - Agregado en columnas del INSERT:
```sql
requires_manual_grading  -- CORR-M3-001: Agregar evaluacion manual
```

**Linea 146** - Agregado valor en VALUES:
```sql
true  -- requires_manual_grading = true (CORR-M3-001)
```

**Linea 149** - Agregado en ON CONFLICT:
```sql
requires_manual_grading = EXCLUDED.requires_manual_grading,  -- CORR-M3-001
```

### CORR-M3-002: Tribunal de Opiniones

**Linea 506** - Agregado en columnas del INSERT:
```sql
requires_manual_grading  -- CORR-M3-002: Agregar evaluacion manual
```

**Linea 606** - Agregado valor en VALUES:
```sql
true  -- requires_manual_grading = true (CORR-M3-002)
```

**Linea 609** - Agregado en ON CONFLICT:
```sql
requires_manual_grading = EXCLUDED.requires_manual_grading,  -- CORR-M3-002
```

---

## Estado Final - Modulo 3

| # | Ejercicio | exercise_type | requires_manual_grading | Estado |
|---|-----------|---------------|-------------------------|--------|
| 3.1 | Analisis de Fuentes | analisis_fuentes | TRUE | CORREGIDO |
| 3.2 | Debate Digital | debate_digital | TRUE | OK |
| 3.3 | Matriz de Perspectivas | matriz_perspectivas | TRUE | OK |
| 3.4 | Podcast Argumentativo | podcast_argumentativo | TRUE | OK |
| 3.5 | Tribunal de Opiniones | tribunal_opiniones | TRUE | CORREGIDO |

**Resultado: 5/5 ejercicios con requires_manual_grading = TRUE**

---

## Validacion

### Verificacion en Seed

```bash
grep -n "requires_manual_grading" 04-exercises-module3.sql
```

**Resultado esperado:** 15 ocurrencias (3 por ejercicio x 5 ejercicios)

### Verificacion en BD (post-recreacion)

```sql
SELECT
    e.title,
    e.exercise_type,
    e.order_index,
    e.requires_manual_grading
FROM educational_content.exercises e
JOIN educational_content.modules m ON e.module_id = m.id
WHERE m.module_code = 'MOD-03-CRITICA'
ORDER BY e.order_index;
```

**Resultado esperado:** 5 filas, todas con requires_manual_grading = true

---

## Pasos para Aplicar

### Opcion A: Desarrollo (recrear BD)

```bash
cd /home/isem/workspace-v2/projects/gamilit/apps/database
./scripts/drop-and-recreate-database.sh
```

### Opcion B: Produccion (UPDATE directo)

```sql
-- Correccion CORR-M3-001
UPDATE educational_content.exercises
SET requires_manual_grading = true,
    updated_at = gamilit.now_mexico()
WHERE module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA')
  AND exercise_type = 'analisis_fuentes';

-- Correccion CORR-M3-002
UPDATE educational_content.exercises
SET requires_manual_grading = true,
    updated_at = gamilit.now_mexico()
WHERE module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-03-CRITICA')
  AND exercise_type = 'tribunal_opiniones';
```

---

## Documentos Relacionados

- Analisis: [ANALISIS-EVALUACIONES-M3-M4-M5-2026-01-07.md](../analisis/ANALISIS-EVALUACIONES-M3-M4-M5-2026-01-07.md)
- Plan: [PLAN-CORRECCION-EVALUACIONES-M3-2026-01-07.md](../analisis/PLAN-CORRECCION-EVALUACIONES-M3-2026-01-07.md)
- Validacion: [VALIDACION-CORR-M3-001-002-2026-01-07.md](../analisis/VALIDACION-CORR-M3-001-002-2026-01-07.md)
- Seed Prod: [04-exercises-module3.sql](../../../apps/database/seeds/prod/educational_content/04-exercises-module3.sql)
- Seed Dev: [04-exercises-module3.sql](../../../apps/database/seeds/dev/educational_content/04-exercises-module3.sql)

---

**Fecha:** 2026-01-07
**Autor:** @Claude-Orchestrator
**Estado:** COMPLETADO Y VALIDADO
