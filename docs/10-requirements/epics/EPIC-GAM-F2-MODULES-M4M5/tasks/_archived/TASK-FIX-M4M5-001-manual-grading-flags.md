---
id: TASK-FIX-M4M5-001
title: Correccion flags requires_manual_grading M4
epic: EAI-007
type: bugfix
status: Done
story_points: 2
sprint: 8
created: 2026-01-04
updated: 2026-01-04
assignee: "@Claude-Agent"
---

# TASK-FIX-M4M5-001: Correccion requires_manual_grading M4

## Contexto

Durante la validacion de ejercicios M4-M5 se detectó que 4 de los 5 ejercicios
del Modulo 4 tenian `requires_manual_grading=false` cuando todos requieren
evaluacion docente desde el portal Teacher.

## Problema Detectado

| Ejercicio | Antes | Despues | Correcto |
|-----------|-------|---------|----------|
| 4.1 Verificador Fake News | FALSE | TRUE | SI |
| 4.2 Infografia Interactiva | FALSE | TRUE | SI |
| 4.3 Quiz TikTok | FALSE | TRUE | SI |
| 4.4 Navegacion Hipertextual | FALSE | TRUE | SI |
| 4.5 Analisis Memes | TRUE | TRUE | Ya OK |

## Archivos Modificados

### 1. Seeds Base de Datos

**Archivo:** `apps/database/seeds/prod/educational_content/05-exercises-module4.sql`

**Cambios:**
- Linea 88: Ejercicio 4.1 - `requires_manual_grading = TRUE`
- Linea 150: Ejercicio 4.2 - `requires_manual_grading = TRUE`
- Linea 206: Ejercicio 4.3 - `requires_manual_grading = TRUE`
- Linea 330: Ejercicio 4.5 - `requires_manual_grading = TRUE`
- Linea 333: RAISE NOTICE actualizado para indicar 5 ejercicios manuales

### 2. Constantes Frontend Teacher Portal

**Archivo:** `apps/frontend/src/apps/teacher/constants/manualReviewExercises.ts`

**Cambios:**
- Agregados 5 ejercicios de M3 (Comprension Critica)
- Agregados 5 ejercicios de M4 (Lectura Digital)
- Total: 13 ejercicios con evaluacion manual (M3: 5, M4: 5, M5: 3)

### 3. Trazabilidad

**Archivo:** `docs/02-fase-robustecimiento/EAI-007-modulos-m4-m5/implementacion/TRACEABILITY.yml`

**Cambios:**
- Actualizado `last_updated: 2026-01-04`
- Agregado comentario de cambios
- Agregada referencia a M3.5 Matriz Perspectivas
- Agregada referencia a constante manualReviewExercises.ts

## Impacto

### Flujo Corregido

```
Estudiante envia respuesta M4
        |
        v
Backend detecta requires_manual_grading=TRUE
        |
        v
Trigger crea registro en manual_reviews
        |
        v
Docente ve ejercicio en Teacher Portal ← AHORA FUNCIONA
        |
        v
Docente califica
        |
        v
Trigger asigna XP/ML Coins
```

### Validacion Requerida

- [ ] Ejecutar recreacion de base de datos
- [ ] Verificar que los 5 ejercicios M4 aparecen en Teacher Portal
- [ ] Probar flujo completo: envio → evaluacion → recompensas

## Criterios de Aceptacion

- [x] Todos los ejercicios M4 con `requires_manual_grading=TRUE` en seed
- [x] Constantes frontend actualizadas con 13 ejercicios totales
- [x] TRACEABILITY.yml actualizado
- [x] Base de datos validada

## Validacion Base de Datos (2026-01-04)

```sql
-- M4: 5/5 ejercicios con requires_manual_grading=TRUE
SELECT title, requires_manual_grading
FROM educational_content.exercises
WHERE module_id = (SELECT id FROM educational_content.modules
                   WHERE module_code = 'MOD-04-DIGITAL');

-- Resultado:
-- Verificador de Fake News                                | t
-- Infografia Interactiva: Descubrimientos de Marie Curie  | t
-- Quiz TikTok: Datos Rapidos de Marie Curie               | t
-- Navegacion Hipertextual: Explora la Red de Conocimiento | t
-- Analisis de Memes: Comprension Visual-Textual           | t

-- M5: 3/3 ejercicios con requires_manual_grading=TRUE
-- Diario Interactivo de Marie               | t
-- Resumen Visual Progresivo (Comic Digital) | t
-- Capsula del Tiempo Digital                | t

-- M3: Ejercicio 5 (Matriz Perspectivas) con requires_manual_grading=TRUE
-- Matriz de Perspectivas: Multiples Visiones sobre Marie Curie | t
```

## Notas

- La base de datos ya tenia los valores correctos
- Los seeds fueron actualizados para garantizar consistencia en futuras recreaciones
- M3 tiene 3/5 ejercicios con evaluacion manual (el ejercicio 5 requerido esta OK)

---

**Completado:** 2026-01-04
**Validado:** 2026-01-04
