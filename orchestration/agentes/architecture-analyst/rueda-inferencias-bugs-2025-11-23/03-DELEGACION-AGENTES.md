# DELEGACIÓN DE TAREAS: Bugs Rueda de Inferencias

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Documentos de referencia:**
- `01-ANALISIS-PROBLEMAS.md` - Análisis exhaustivo
- `02-PLAN-CORRECCIONES.md` - Plan detallado de correcciones

---

## RESUMEN DE DELEGACIÓN

**Total de tareas delegadas:** 4
**Agentes involucrados:** 3

| Agente | Tareas Asignadas | Prioridad | Tiempo Estimado |
|--------|------------------|-----------|-----------------|
| **Architecture-Analyst** | 1 (Corrección #1) | P2 | 30 min |
| **Frontend-Developer** | 2 (Correcciones #2, #3, #5-Frontend) | P1, P2, P3 | 3-4 horas |
| **Backend-Developer** | 1 (Corrección #5-Backend) | P2 | 1-2 horas |

---

## DELEGACIÓN 1: Architecture-Analyst (YO MISMO)

**Tarea:** CORRECCIÓN 1 - Ajustar respuestas en guía de pruebas
**Prioridad:** P2 (Media)
**Estimación:** 30 minutos
**Estado:** PENDIENTE

### Descripción:

Editar el archivo de guía de pruebas para reducir todas las respuestas "EXCELENTES" a máximo 200 caracteres, manteniendo la calidad pedagógica y las palabras clave.

### Archivo a modificar:

```
orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/04-GUIA-PRUEBAS-RESPUESTAS.md
```

### Especificación exacta:

Ver sección "CORRECCIÓN 1" en `02-PLAN-CORRECCIONES.md` para:
- Lista de 8 respuestas a modificar con propuestas exactas
- Validación de caracteres
- Criterios de calidad

### Criterios de aceptación:

- [ ] Las 8 respuestas EXCELENTES tienen ≤ 200 caracteres
- [ ] Palabras clave pedagógicas se mantienen
- [ ] Calidad educativa NO se degrada
- [ ] Documento actualizado y guardado

### Notas:

Esta tarea la ejecutaré yo mismo (Architecture-Analyst) ya que es documentación pedagógica que está bajo mi responsabilidad.

---

## DELEGACIÓN 2: Frontend-Developer

**Agente responsable:** Frontend-Developer
**Tareas asignadas:** 3 correcciones (P1, P2, P3)
**Tiempo total estimado:** 3-4 horas

---

### TAREA 2A: CORRECCIÓN 3 - Eliminar duplicación de IDs (CRÍTICA)

**Prioridad:** P1 (CRÍTICA)
**Estimación:** 30-60 minutos
**Estado:** PENDIENTE

#### Descripción del problema:

El ejercicio "Rueda de Inferencias" tiene un bug crítico donde cada vez que la ruleta gira, el array `usedCategoryIds` agrega el ID de la categoría DOS veces en lugar de una. Esto causa:
- Categorías se repiten a pesar de la prevención
- Array tiene 6 elementos en lugar de 3 después de 3 rondas
- Indicador de progreso muestra información incorrecta

#### Causa raíz identificada:

El `useEffect` en `WheelSpinner.tsx` tiene `usedCategoryIds` como dependencia. Cuando `onSpinComplete` actualiza `usedCategoryIds`, el useEffect se re-ejecuta y llama a `onSpinComplete` por segunda vez.

Ver análisis completo en: `01-ANALISIS-PROBLEMAS.md` sección "PROBLEMA 3"

#### Archivos a modificar:

**Archivo principal:**
```
apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx
```

**Líneas afectadas:** 24-56 (useEffect)

#### Especificación de la solución:

**IMPLEMENTAR SOLUCIÓN A:** Usar `useRef` con flag `hasSpunRef`

Ver código completo propuesto en: `02-PLAN-CORRECCIONES.md` sección "CORRECCIÓN 3 - SOLUCIÓN OPCIÓN A"

**Pasos:**

1. Importar `useRef`:
```typescript
import React, { useState, useEffect, useRef } from 'react';
```

2. Crear ref:
```typescript
const hasSpunRef = useRef(false);
```

3. Modificar useEffect para:
   - Verificar `!hasSpunRef.current` antes de ejecutar
   - Setear `hasSpunRef.current = true` al inicio
   - Setear `hasSpunRef.current = false` después del setTimeout
   - Remover `usedCategoryIds` de las dependencias

4. Agregar useEffect adicional para reset cuando `isSpinning` cambia a false

#### Criterios de aceptación:

- [ ] Después de 3 rondas, `usedCategoryIds` tiene EXACTAMENTE 3 elementos
- [ ] `usedCategoryIds` NO contiene duplicados
- [ ] Console.log muestra `handleWheelSpinComplete` llamado 1 vez por ronda
- [ ] Las 3 categorías seleccionadas son TODAS diferentes
- [ ] NO se repiten categorías entre rondas

#### Testing requerido:

**Test manual:**
1. Iniciar ejercicio
2. Agregar `console.log` en `handleWheelSpinComplete` para contar llamadas
3. Completar 3 rondas
4. En React DevTools, inspeccionar `usedCategoryIds`
5. Verificar array: `['cat-X', 'cat-Y', 'cat-Z']` (3 elementos únicos)

**Test de integración:**
- Verificar que Problema #4 (repetición de categorías) también se resolvió

#### Documentación de referencia:

- Análisis: `01-ANALISIS-PROBLEMAS.md` - Problema #3
- Plan: `02-PLAN-CORRECCIONES.md` - Corrección #3
- Código propuesto completo en el plan de correcciones

---

### TAREA 2B: CORRECCIÓN 2 - Fix indicador de categorías (OPCIONAL)

**Prioridad:** P3 (Baja - Opcional)
**Estimación:** 15-30 minutos
**Estado:** PENDIENTE

#### Descripción del problema:

El indicador visual de categorías usadas no se muestra correctamente. Puede ser un problema de:
- Timing (race condition en actualización de estados)
- Visibilidad (fuera del viewport)

Ver análisis completo en: `01-ANALISIS-PROBLEMAS.md` sección "PROBLEMA 2"

#### Archivos a modificar:

**Archivo principal:**
```
apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx
```

**Líneas afectadas:**
- 209-223 (función `handleWheelSpinComplete`)
- 453-478 (indicador de categorías)

#### Especificación de la solución:

**IMPLEMENTAR:** Solución A + Solución C (ver plan de correcciones)

**Paso 1: Reordenar estados en handleWheelSpinComplete**
- Mover `setUsedCategoryIds` al INICIO de la función
- Mover `setPhase('reading')` al FINAL

**Paso 2: Integrar indicador en el header**
- Mover código del indicador (líneas 453-478) dentro del header (líneas 423-451)
- Hacerlo más compacto (inline en lugar de bloque separado)

Ver código completo propuesto en: `02-PLAN-CORRECCIONES.md` sección "CORRECCIÓN 2"

#### Criterios de aceptación:

- [ ] Indicador se muestra en Ronda 1 (después de girar)
- [ ] Indicador se muestra en Ronda 2
- [ ] Indicador se muestra en Ronda 3
- [ ] Indicador muestra correctamente las categorías usadas (sin duplicados)
- [ ] Indicador es visible en todas las resoluciones de pantalla

#### Testing requerido:

**Test visual:**
1. Completar ronda 1 → Verificar que indicador muestra 1 categoría marcada
2. Completar ronda 2 → Verificar que indicador muestra 2 categorías marcadas
3. Completar ronda 3 → Verificar que indicador muestra 3 categorías marcadas

**Test responsivo:**
- Probar en móvil, tablet, desktop
- Verificar que siempre es visible

#### Notas:

Esta corrección es OPCIONAL y de baja prioridad. Si después de implementar Corrección #3 el problema se resuelve solo, no es necesario implementar esta.

---

### TAREA 2C: CORRECCIÓN 5 (Parte Frontend) - Alinear cálculo de progreso

**Prioridad:** P2 (Media)
**Estimación:** 1-2 horas
**Estado:** PENDIENTE (depende de Backend-Developer)

#### Descripción del problema:

ModuleDetailPage muestra progreso diferente que DashboardComplete para el MISMO módulo:
- ModuleDetailPage: 5/5 ejercicios completados (filtra localmente)
- DashboardComplete: 4/5 ejercicios completados (usa dato del backend)

Ver análisis completo en: `01-ANALISIS-PROBLEMAS.md` sección "PROBLEMA 5"

#### Archivos a modificar:

**Nuevos archivos a crear:**
```
apps/frontend/src/apps/student/hooks/useModuleProgress.ts
```

**Archivos existentes a modificar:**
```
apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx
```

#### Especificación de la solución:

**OPCIÓN A (RECOMENDADA):** Frontend usa siempre datos del backend

**Paso 1: Crear hook `useModuleProgress`**

Ver código completo en: `02-PLAN-CORRECCIONES.md` sección "CORRECCIÓN 5 - Paso 2"

**Paso 2: Modificar ModuleDetailPage.tsx**

Reemplazar cálculo local (líneas 284-286):
```typescript
// ❌ ELIMINAR:
const completedExercises = exercises.filter(ex => ex.completed).length;
const totalExercises = exercises.length;

// ✅ AGREGAR:
const {
  completedExercises,
  totalExercises,
  progress: progressPercentage,
} = useModuleProgress(moduleId || '');
```

#### Dependencias:

**CRÍTICO:** Esta tarea depende de que Backend-Developer complete primero la parte backend (DELEGACIÓN 3).

**Coordinación necesaria:**
1. Backend-Developer valida query SQL
2. Backend-Developer confirma que endpoint retorna datos correctos
3. Frontend-Developer implementa hook y modifica ModuleDetailPage
4. QA valida que ambas páginas muestran mismo progreso

#### Criterios de aceptación:

- [ ] Hook `useModuleProgress` creado y funcional
- [ ] ModuleDetailPage usa el hook en lugar de cálculo local
- [ ] Progreso mostrado en ModuleDetailPage === Progreso en DashboardComplete
- [ ] Progreso se actualiza correctamente después de completar ejercicio
- [ ] NO hay regresiones (ejercicios se siguen mostrando correctamente)

#### Testing requerido:

**Test end-to-end:**
1. Ir a ModuleDetailPage del módulo 2
2. Anotar progreso mostrado: X/Y
3. Ir a DashboardComplete
4. Verificar que módulo 2 muestra: X/Y (MISMO valor)
5. Completar un ejercicio del módulo 2
6. Volver a ambas páginas
7. Verificar que AMBAS muestran: (X+1)/Y

**Test de logging:**
- Agregar console.log en hook para verificar datos del backend
- Comparar con respuesta en DevTools Network tab

#### Documentación de referencia:

- Análisis: `01-ANALISIS-PROBLEMAS.md` - Problema #5
- Plan: `02-PLAN-CORRECCIONES.md` - Corrección #5
- Código completo del hook en plan de correcciones

---

## DELEGACIÓN 3: Backend-Developer

**Agente responsable:** Backend-Developer
**Tareas asignadas:** 1 corrección (P2)
**Tiempo total estimado:** 1-2 horas

---

### TAREA 3: CORRECCIÓN 5 (Parte Backend) - Validar query de progreso

**Prioridad:** P2 (Media)
**Estimación:** 1-2 horas
**Estado:** PENDIENTE

#### Descripción del problema:

El endpoint `GET /educational/users/{userId}/modules` debe retornar datos de progreso consistentes con la realidad. Actualmente, hay inconsistencia con lo que muestra ModuleDetailPage (que filtra localmente los ejercicios completados).

Ver análisis completo en: `01-ANALISIS-PROBLEMAS.md` sección "PROBLEMA 5"

#### Archivos a revisar/modificar:

**Archivos del backend:**
```
apps/backend/src/modules/educational/controllers/modules.controller.ts
apps/backend/src/modules/educational/services/modules.service.ts
```

**Query SQL a validar:**
- Query que retorna módulos con progreso para el endpoint `/users/{userId}/modules`

#### Especificación de la solución:

**Paso 1: Identificar la query SQL actual**

Buscar en el código del servicio la query que calcula:
- `totalExercises`
- `completedExercises`
- `progress`

**Paso 2: Validar criterios de la query**

La query DEBE cumplir:

```sql
-- Ejemplo de query CORRECTA:
SELECT
  m.*,
  COUNT(e.id) AS total_exercises,
  COUNT(CASE WHEN ue.completed = true THEN 1 END) AS completed_exercises,
  (COUNT(CASE WHEN ue.completed = true THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0)) AS progress
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e
  ON e.module_id = m.id
  AND e.is_active = true  -- ⭐ IMPORTANTE: Solo ejercicios activos
LEFT JOIN educational_content.user_exercises ue
  ON ue.exercise_id = e.id
  AND ue.user_id = $1
WHERE m.organization_id = $2
GROUP BY m.id
ORDER BY m.order_index ASC;
```

**Criterios obligatorios:**
- ✅ Solo contar ejercicios donde `e.is_active = true`
- ✅ Solo contar como completado si `ue.completed = true` (no null, no false)
- ✅ Usar `LEFT JOIN` para incluir módulos sin ejercicios
- ✅ `NULLIF` para evitar división por cero
- ✅ Agrupar por `m.id` para evitar duplicados

**Paso 3: Testing de la query**

Ejecutar query directamente en base de datos:

```sql
-- Test manual en psql:
SELECT
  m.id,
  m.title,
  COUNT(e.id) AS total_exercises,
  COUNT(CASE WHEN ue.completed = true THEN 1 END) AS completed_exercises
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id AND e.is_active = true
LEFT JOIN educational_content.user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = 'USER_ID_DE_PRUEBA'
WHERE m.id = 'module-2'
GROUP BY m.id;
```

Comparar resultado con:
1. Lo que muestra DashboardComplete
2. Lo que muestra ModuleDetailPage
3. Conteo manual en tabla `user_exercises`

**Paso 4: Corregir query si es necesario**

Si la query tiene problemas:
- Corregir según criterios arriba
- Agregar tests unitarios para el servicio
- Validar con datos de prueba

#### Casos edge a validar:

1. **Módulo sin ejercicios:**
   - `totalExercises = 0`
   - `completedExercises = 0`
   - `progress = 0` (no debe ser null o error)

2. **Módulo con ejercicios pero usuario no ha iniciado ninguno:**
   - `totalExercises = N`
   - `completedExercises = 0`
   - `progress = 0`

3. **Módulo con algunos ejercicios completados:**
   - `totalExercises = 5`
   - `completedExercises = 3`
   - `progress = 60`

4. **Módulo 100% completado:**
   - `totalExercises = 5`
   - `completedExercises = 5`
   - `progress = 100`

5. **Ejercicios desactivados no se cuentan:**
   - Si hay 5 ejercicios totales pero 1 está `is_active = false`
   - `totalExercises = 4` (no 5)

#### Criterios de aceptación:

- [ ] Query SQL revisada y validada
- [ ] Query cumple con todos los criterios obligatorios
- [ ] Tests manuales pasados (casos edge validados)
- [ ] Endpoint `/users/{userId}/modules` retorna datos correctos
- [ ] Datos son consistentes con tabla `user_exercises` en DB
- [ ] Frontend-Developer puede proceder con su parte

#### Testing requerido:

**Test 1: Verificación en DB**
```bash
# En psql:
psql -d gamilit_db -c "SELECT * FROM educational_content.user_exercises WHERE user_id = 'USER_TEST';"
```

Contar manualmente cuántos ejercicios del módulo 2 tienen `completed = true`.

**Test 2: Verificación en endpoint**
```bash
# En terminal o Postman:
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:3000/educational/users/USER_TEST/modules
```

Verificar que el JSON retornado para módulo 2 coincide con conteo manual.

**Test 3: Testing con diferentes usuarios**
- Usuario con 0% progreso
- Usuario con 50% progreso
- Usuario con 100% progreso

#### Coordinación con Frontend:

Cuando la query esté validada y el endpoint retorne datos correctos:
1. Notificar a Frontend-Developer
2. Proporcionar ejemplos de respuestas del endpoint
3. Frontend-Developer procede con TAREA 2C

#### Documentación de referencia:

- Análisis: `01-ANALISIS-PROBLEMAS.md` - Problema #5
- Plan: `02-PLAN-CORRECCIONES.md` - Corrección #5 - OPCIÓN A
- Query SQL propuesta en plan de correcciones

---

## ORDEN DE EJECUCIÓN

### Día 1 - Mañana (1-2 horas):

**1. Frontend-Developer: TAREA 2A (CRÍTICA)**
- Implementar fix de duplicación en WheelSpinner.tsx
- Prioridad: P1
- Duración: 30-60 min

### Día 1 - Tarde (1 hora):

**2. Architecture-Analyst: TAREA 1 (YO)**
- Ajustar respuestas en guía de pruebas
- Prioridad: P2
- Duración: 30 min

**3. Frontend-Developer: TAREA 2B (OPCIONAL)**
- Fix indicador de categorías
- Prioridad: P3
- Duración: 15-30 min

### Día 2 - Mañana (1-2 horas):

**4. Backend-Developer: TAREA 3**
- Validar y corregir query SQL de progreso
- Prioridad: P2
- Duración: 1-2 horas

### Día 2 - Tarde (1-2 horas):

**5. Frontend-Developer: TAREA 2C** (después de que Backend complete)
- Implementar hook useModuleProgress
- Modificar ModuleDetailPage
- Prioridad: P2
- Duración: 1-2 horas

### Testing Final (30 min):

**6. QA + Product Owner**
- Validar todas las correcciones
- Verificar checklist de aceptación
- Sign-off final

---

## COMUNICACIÓN ENTRE AGENTES

### Frontend-Developer ↔ Backend-Developer

**Para CORRECCIÓN 5:**

**Backend-Developer debe notificar cuando:**
- ✅ Query SQL está validada
- ✅ Endpoint `/users/{userId}/modules` retorna datos correctos
- ✅ Tests manuales pasados

**Frontend-Developer debe esperar antes de:**
- ❌ NO crear hook `useModuleProgress` hasta que Backend confirme
- ❌ NO modificar ModuleDetailPage hasta tener datos correctos

**Comunicación recomendada:**
```
[Backend-Developer]
✅ CORRECCIÓN 5 (Backend) - COMPLETADA
- Query SQL validada
- Endpoint /users/{userId}/modules retorna datos correctos
- Tests pasados para módulos 1-3
- Frontend puede proceder con hook useModuleProgress

Ejemplo de respuesta del endpoint:
{
  "id": "module-2",
  "completedExercises": 5,
  "totalExercises": 5,
  "progress": 100
}
```

---

## CHECKLIST DE COMPLETITUD

### Architecture-Analyst (YO):
- [ ] TAREA 1 ejecutada (guía de pruebas corregida)
- [ ] Archivo 04-GUIA-PRUEBAS-RESPUESTAS.md actualizado
- [ ] Caracteres validados (≤200)

### Frontend-Developer:
- [ ] TAREA 2A completada (fix duplicación)
- [ ] TAREA 2B completada (indicador) - OPCIONAL
- [ ] TAREA 2C completada (hook progreso)
- [ ] Todos los tests pasados
- [ ] Código testeado manualmente

### Backend-Developer:
- [ ] TAREA 3 completada (query SQL validada)
- [ ] Endpoint retorna datos correctos
- [ ] Tests de DB pasados
- [ ] Frontend notificado para proceder

### QA Final:
- [ ] Problema #1 resuelto (guía corregida)
- [ ] Problema #2 resuelto (indicador se muestra)
- [ ] Problema #3 resuelto (NO hay duplicados)
- [ ] Problema #4 resuelto (categorías NO se repiten)
- [ ] Problema #5 resuelto (progreso consistente)

---

## REFERENCIAS

**Documentos de este análisis:**
1. `01-ANALISIS-PROBLEMAS.md` - Análisis exhaustivo de los 5 problemas
2. `02-PLAN-CORRECCIONES.md` - Plan detallado de correcciones con código
3. `03-DELEGACION-AGENTES.md` - Este documento

**Documentos del proyecto:**
- `orchestration/directivas/DIRECTIVA-VALIDACION-SUBAGENTES.md`
- `orchestration/directivas/POLITICAS-USO-AGENTES.md`
- `orchestration/prompts/PROMPT-FRONTEND-AGENT.md`
- `orchestration/prompts/PROMPT-BACKEND-AGENT.md`

---

**Estado:** DOCUMENTACIÓN COMPLETA - LISTO PARA DELEGACIÓN
**Siguiente paso:** Notificar a los agentes responsables para iniciar implementación
