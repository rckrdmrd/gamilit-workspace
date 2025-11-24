# PLAN DE CORRECCIONES: Rueda de Inferencias

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Documento de análisis:** 01-ANALISIS-PROBLEMAS.md

---

## RESUMEN EJECUTIVO

**Total de correcciones:** 4 (Problema #4 se resuelve automáticamente con #3)
**Tiempo estimado total:** 4-7 horas
**Agentes involucrados:**
- Architecture-Analyst (documentación)
- Frontend-Developer (código React)
- Backend-Developer (alineación de APIs - Problema #5)

**Orden de ejecución recomendado:**
1. CORRECCIÓN 3 (P1 - Crítica) - Eliminar duplicación de IDs
2. CORRECCIÓN 1 (P2 - Rápida) - Ajustar respuestas en guía
3. CORRECCIÓN 5 (P2 - Compleja) - Alinear cálculo de progreso
4. CORRECCIÓN 2 (P3 - Opcional) - Fix indicador de categorías

---

## CORRECCIÓN 1: Ajustar Respuestas en Guía de Pruebas

**Agente responsable:** Architecture-Analyst (documentación)
**Prioridad:** P2 (Media)
**Estimación:** 30 minutos
**Dificultad:** BAJA

### Archivo a modificar:
```
orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/04-GUIA-PRUEBAS-RESPUESTAS.md
```

### Respuestas a acortar (máximo 200 caracteres):

#### Fragmento 1 - Inferencial EXCELENTE (línea 78-82)
**Actual (230 caracteres):**
```
"El hecho de que Marie ganara en dos campos científicos diferentes sugiere
que tenía conocimientos interdisciplinarios excepcionales, lo que implica
una capacidad intelectual destacada para dominar múltiples disciplinas."
```

**Propuesta (198 caracteres):**
```
"Ganar en dos campos científicos sugiere conocimientos interdisciplinarios excepcionales, implicando capacidad intelectual destacada para dominar múltiples disciplinas."
```

#### Fragmento 1 - Crítico EXCELENTE (línea 114-119)
**Actual (262 caracteres):**
```
"Al analizar el contexto histórico, ganar dos Premios Nobel en una época
de discriminación significa que Marie superó barreras estructurales
significativas. Esto permite evaluar su impacto desde la perspectiva
de las mujeres en la ciencia del siglo XX."
```

**Propuesta (195 caracteres):**
```
"Ganar dos Nobel en época de discriminación significa que Marie superó barreras estructurales significativas, evaluando su impacto en mujeres en ciencia del siglo XX."
```

#### Fragmento 2 - Inferencial EXCELENTE (línea 229-233)
**Actual (224 caracteres):**
```
"Su persistencia a pesar de la discriminación muestra una determinación
y resiliencia extraordinarias. Superar obstáculos tan grandes requiere
una motivación profunda y fortaleza mental, lo que sugiere un compromiso
total con su vocación científica."
```

**Propuesta (199 caracteres):**
```
"Su persistencia muestra determinación y resiliencia extraordinarias. Superar obstáculos tan grandes requiere motivación profunda y fortaleza mental, sugiriendo compromiso total científico."
```

#### Fragmento 2 - Crítico EXCELENTE (línea 263-268)
**Actual (267 caracteres):**
```
"Al evaluar críticamente este texto, la discriminación que enfrentó
Marie evidencia la injusticia y desigualdad estructural del sistema
científico del siglo XX. El significado de su persistencia trasciende
lo personal, representando un desafío a las barreras sociales de género
que requerían cambio estructural."
```

**Propuesta (197 caracteres):**
```
"La discriminación enfrentada evidencia injusticia estructural del sistema científico. Su persistencia trasciende lo personal, desafiando barreras sociales de género que requerían cambio."
```

#### Fragmento 2 - Creativo EXCELENTE (línea 299-304)
**Actual (256 caracteres):**
```
"La historia de Marie puede inspirar a científicas actuales que enfrentan
obstáculos similares. Si aplicamos las lecciones de su persistencia al
futuro, podemos relacionar su ejemplo con movimientos actuales por la
igualdad de género en STEM. Marie sirve como modelo de cómo enfrentar
barreras estructurales."
```

**Propuesta (196 caracteres):**
```
"Marie inspira a científicas actuales que enfrentan obstáculos. Aplicar lecciones de su persistencia al futuro relaciona su ejemplo con movimientos por igualdad de género en STEM actual."
```

#### Fragmento 3 - Inferencial EXCELENTE (línea 373-377)
**Actual (212 caracteres):**
```
"Que los cuadernos sigan radiactivos décadas después indica que el radio
tiene una vida media muy larga, lo que implica que la exposición de Marie
a este peligro fue constante. Las consecuencias para su salud fueron
inevitables dado el riesgo prolongado."
```

**Propuesta (199 caracteres):**
```
"Cuadernos radiactivos décadas después indican vida media larga del radio, implicando exposición constante de Marie. Las consecuencias para su salud fueron inevitables por riesgo prolongado."
```

#### Fragmento 3 - Crítico EXCELENTE (línea 407-413)
**Actual (219 caracteres):**
```
"Los cuadernos radiactivos son evidencia tangible del precio que Marie
pagó por avanzar la ciencia. Al evaluar esto críticamente, significa que
trabajó sin conocimiento completo de los riesgos, lo cual era común en
esa época. Esto nos permite analizar cómo la seguridad científica ha
evolucionado."
```

**Propuesta (196 caracteres):**
```
"Cuadernos radiactivos evidencian el precio pagado por Marie. Trabajó sin conocer riesgos completos, común en esa época. Permite analizar evolución de la seguridad científica actual."
```

#### Fragmento 3 - Creativo EXCELENTE (línea 442-448) - LA MÁS LARGA
**Actual (280 caracteres):**
```
"Los cuadernos radiactivos son un símbolo poderoso y una metáfora del
legado duradero de Marie. Representan cómo los descubrimientos científicos
pueden tener consecuencias imprevistas que persisten en el presente.
Imaginar estos cuadernos nos invita a la reflexión sobre el futuro:
¿qué consecuencias a largo plazo tendrán las tecnologías actuales?"
```

**Propuesta (197 caracteres):**
```
"Cuadernos radiactivos simbolizan el legado duradero de Marie. Representan consecuencias imprevistas de descubrimientos que persisten. Invitan a reflexionar: ¿qué consecuencias tendrán tecnologías actuales?"
```

### Criterios para las correcciones:

1. **Mantener palabras clave:** Las keywords pedagógicas deben conservarse
2. **Claridad:** El mensaje debe seguir siendo claro
3. **200 caracteres máximo:** Respetar el límite técnico
4. **Calidad pedagógica:** No sacrificar valor educativo

### Proceso de corrección:

1. Abrir archivo `04-GUIA-PRUEBAS-RESPUESTAS.md`
2. Buscar cada respuesta EXCELENTE que exceda 200 caracteres
3. Reemplazar con la versión propuesta
4. Validar conteo de caracteres:
   ```javascript
   "texto propuesto".length  // Debe ser ≤ 200
   ```
5. Verificar que keywords se mantienen
6. Guardar archivo

### Validación post-corrección:

```bash
# Script para validar caracteres (ejecutar en terminal)
grep -A 3 "Respuesta EXCELENTE" 04-GUIA-PRUEBAS-RESPUESTAS.md | \
  grep "^\"" | \
  while read line; do
    echo "$line" | wc -c
  done
```

Todos los valores deben ser ≤ 201 (200 + salto de línea).

---

## CORRECCIÓN 2: Fix Indicador de Categorías Usadas

**Agente responsable:** Frontend-Developer
**Prioridad:** P3 (Baja - Opcional)
**Estimación:** 15-30 minutos
**Dificultad:** BAJA

### Archivo a modificar:
```
apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx
```

### Análisis del problema:

El indicador tiene dos posibles problemas:

**Problema A: Race condition en actualización de estados**

El `setUsedCategoryIds` se ejecuta AL FINAL de `handleWheelSpinComplete`, después de `setPhase('reading')`. React puede batchear estos updates en orden incorrecto.

**Problema B: Indicador fuera de viewport**

En pantallas pequeñas, el indicador (líneas 453-478) puede estar debajo del fold.

### Opción de Solución A: Mover actualización de usedCategoryIds ANTES de cambiar fase

**Ubicación:** Función `handleWheelSpinComplete` (línea 209)

**Cambio:**
```typescript
// ❌ ACTUAL (líneas 209-223):
const handleWheelSpinComplete = (category: InferenceCategory) => {
  setSelectedCategory(category);
  setIsWheelSpinning(false);
  setPhase('reading');

  // Update fragment state
  setFragmentStates((prev) =>
    prev.map((state, idx) =>
      idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state
    )
  );

  // Track used category
  setUsedCategoryIds(prev => [...prev, category.id]);
};

// ✅ PROPUESTO:
const handleWheelSpinComplete = (category: InferenceCategory) => {
  // Track used category FIRST
  setUsedCategoryIds(prev => [...prev, category.id]);

  setSelectedCategory(category);
  setIsWheelSpinning(false);

  // Update fragment state
  setFragmentStates((prev) =>
    prev.map((state, idx) =>
      idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state
    )
  );

  // Set phase LAST (triggers re-render)
  setPhase('reading');
};
```

**Razón:** Si `setUsedCategoryIds` se ejecuta PRIMERO, el nuevo estado estará disponible cuando React renderice la fase `reading`.

### Opción de Solución B: Usar useEffect para garantizar orden

**Agregar useEffect:**
```typescript
// Después de las declaraciones de estado (línea ~120)
useEffect(() => {
  console.log('[DEBUG] usedCategoryIds updated:', usedCategoryIds);
}, [usedCategoryIds]);
```

Esto permite verificar si el problema es de timing.

### Opción de Solución C: Mover indicador ARRIBA en el render

**Ubicación actual:** Líneas 453-478 (después del header)
**Propuesta:** Mover dentro del header (líneas 423-451)

```typescript
// ✅ PROPUESTO (integrar en header):
<div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 text-white shadow-lg">
  <h2 className="text-2xl font-bold mb-2">{exercise.title}</h2>
  <p className="opacity-90 mb-4">{exercise.description}</p>

  <div className="space-y-2">
    {/* Stats */}
    <div className="flex items-center gap-4 text-sm">
      <div>📊 Ronda {currentFragmentIndex + 1} de {exercise.content.fragments.length}</div>
      <div>⏱️ Tiempo: {Math.floor(totalTimeSpent / 60)}:{String(totalTimeSpent % 60).padStart(2, '0')}</div>
      {score > 0 && <div>⭐ Puntuación: {score}/100</div>}
    </div>

    {/* Progress bar */}
    <div className="flex gap-2">
      {exercise.content.fragments.map((_, idx) => (
        <div key={idx} className={`h-2 flex-1 rounded ${/* ... */}`} />
      ))}
    </div>

    {/* ⭐ NUEVO: Categorías usadas (integrado en header) */}
    {usedCategoryIds.length > 0 && (
      <div className="flex items-center gap-2 text-sm">
        <span className="opacity-80">Categorías:</span>
        {exercise.content.categories.map(category => {
          const isUsed = usedCategoryIds.includes(category.id);
          return (
            <span
              key={category.id}
              className={`px-2 py-0.5 rounded text-xs ${
                isUsed
                  ? 'bg-white bg-opacity-30 border border-white'
                  : 'bg-white bg-opacity-10 text-white text-opacity-50'
              }`}
            >
              {category.icon} {isUsed && '✓'}
            </span>
          );
        })}
      </div>
    )}
  </div>
</div>
```

**Ventajas:**
- Siempre visible (dentro del header sticky)
- Más compacto y elegante
- Mejor UX

### Recomendación:

**Implementar Solución A + Solución C:**
1. Reordenar estados en `handleWheelSpinComplete` (Solución A)
2. Integrar indicador en el header (Solución C)
3. Agregar console.log temporal para debugging (Solución B)

### Validación post-corrección:

1. Abrir ejercicio en navegador
2. Girar ruleta en Ronda 1
3. **Verificar:** Indicador muestra 1 categoría marcada
4. Girar ruleta en Ronda 2
5. **Verificar:** Indicador muestra 2 categorías marcadas
6. Girar ruleta en Ronda 3
7. **Verificar:** Indicador muestra 3 categorías marcadas

---

## CORRECCIÓN 3: Eliminar Duplicación de IDs en usedCategoryIds

**Agente responsable:** Frontend-Developer
**Prioridad:** P1 (CRÍTICA)
**Estimación:** 30-60 minutos
**Dificultad:** MEDIA

### Archivo a modificar:
```
apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx
```

### CAUSA RAÍZ (ver análisis completo en 01-ANALISIS-PROBLEMAS.md):

El `useEffect` en WheelSpinner.tsx tiene `usedCategoryIds` como dependencia:

```typescript
}, [isSpinning, usedCategoryIds]);  // ← PROBLEMA AQUÍ
```

Cuando `onSpinComplete` llama a `setUsedCategoryIds`, el useEffect detecta el cambio y SE RE-EJECUTA, llamando a `onSpinComplete` por SEGUNDA vez con la MISMA categoría.

### SOLUCIÓN OPCIÓN A: Remover usedCategoryIds de dependencias + usar ref

**Paso 1:** Importar `useRef`

```typescript
import React, { useState, useEffect, useRef } from 'react';
```

**Paso 2:** Crear ref para evitar doble ejecución

```typescript
// Agregar después de línea 19:
const hasSpunRef = useRef(false);
```

**Paso 3:** Modificar useEffect (líneas 24-56)

```typescript
// ❌ ACTUAL:
useEffect(() => {
  if (isSpinning) {
    // Filter out already used categories
    const availableCategories = categories.filter(
      cat => !usedCategoryIds?.includes(cat.id)
    );

    // ... resto del código ...

    setTimeout(() => {
      setSelectedIndex(visualIndex);
      onSpinComplete(selectedCategory);
    }, 3000);
  }
}, [isSpinning, usedCategoryIds]);  // ← PROBLEMA


// ✅ PROPUESTO:
useEffect(() => {
  if (isSpinning && !hasSpunRef.current) {
    // Mark as spinning to prevent double execution
    hasSpunRef.current = true;

    // Filter out already used categories
    const availableCategories = categories.filter(
      cat => !usedCategoryIds?.includes(cat.id)
    );

    // If no available categories (edge case), use all
    const selectableCategories = availableCategories.length > 0
      ? availableCategories
      : categories;

    // Randomly select from available categories
    const randomIndex = Math.floor(Math.random() * selectableCategories.length);
    const selectedCategory = selectableCategories[randomIndex];

    // Find index in original categories array for visual rotation
    const visualIndex = categories.findIndex(cat => cat.id === selectedCategory.id);
    const targetAngle = visualIndex * segmentAngle;

    // Generate rotation to land on target angle
    const fullRotations = 3 + Math.random() * 2;
    const totalRotation = rotation + (fullRotations * 360) + targetAngle;

    setRotation(totalRotation);

    // Complete spin after animation
    setTimeout(() => {
      setSelectedIndex(visualIndex);
      onSpinComplete(selectedCategory);
      // Reset flag after completion
      hasSpunRef.current = false;
    }, 3000);
  }
}, [isSpinning, categories, rotation, segmentAngle, onSpinComplete]);
// ⭐ NOTA: Removido usedCategoryIds de dependencias
//          usedCategoryIds se lee DENTRO del useEffect pero NO es dependencia
```

**Paso 4:** Reset del ref cuando isSpinning cambia a false

```typescript
// Agregar nuevo useEffect después del anterior:
useEffect(() => {
  if (!isSpinning) {
    hasSpunRef.current = false;
  }
}, [isSpinning]);
```

### SOLUCIÓN OPCIÓN B: Pasar usedCategoryIds como prop estático

**Modificar la firma del componente:**

```typescript
// ❌ ACTUAL:
export const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  categories,
  isSpinning,
  onSpinComplete,
  usedCategoryIds,  // ← Se usa como dependencia
}) => {

// ✅ PROPUESTO:
export const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  categories,
  isSpinning,
  onSpinComplete,
  usedCategoryIds,
}) => {
  // Guardar usedCategoryIds en ref para evitar re-renders
  const usedCategoryIdsRef = useRef(usedCategoryIds);

  // Actualizar ref cuando cambia (pero no trigger re-render del useEffect)
  useEffect(() => {
    usedCategoryIdsRef.current = usedCategoryIds;
  }, [usedCategoryIds]);

  useEffect(() => {
    if (isSpinning) {
      // Usar el ref en lugar del prop directo
      const availableCategories = categories.filter(
        cat => !usedCategoryIdsRef.current?.includes(cat.id)
      );

      // ... resto del código sin cambios ...
    }
  }, [isSpinning]); // ← Solo depende de isSpinning
```

### SOLUCIÓN OPCIÓN C: useCallback para onSpinComplete

**En RuedaInferenciasExercise.tsx:**

```typescript
// Envolver handleWheelSpinComplete en useCallback
const handleWheelSpinComplete = useCallback((category: InferenceCategory) => {
  setSelectedCategory(category);
  setIsWheelSpinning(false);
  setPhase('reading');

  setFragmentStates((prev) =>
    prev.map((state, idx) =>
      idx === currentFragmentIndex ? { ...state, categoryId: category.id } : state
    )
  );

  setUsedCategoryIds(prev => [...prev, category.id]);
}, [currentFragmentIndex]);
```

**Y en WheelSpinner.tsx, agregar onSpinComplete a dependencias:**

```typescript
}, [isSpinning, onSpinComplete]);
```

Pero esto NO resuelve el problema porque `usedCategoryIds` sigue siendo dependencia.

### RECOMENDACIÓN:

**Implementar SOLUCIÓN A (useRef con flag hasSpunRef):**

**Razones:**
1. ✅ Más simple y directa
2. ✅ Evita completamente la doble ejecución
3. ✅ No cambia la interface del componente
4. ✅ Fácil de testear y debuggear

**Código completo propuesto:**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import type { WheelSpinnerProps } from './ruedaInferenciasTypes';

export const WheelSpinner: React.FC<WheelSpinnerProps> = ({
  categories,
  isSpinning,
  onSpinComplete,
  usedCategoryIds,
}) => {
  const [rotation, setRotation] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const hasSpunRef = useRef(false);

  // Calculate segment angle
  const segmentAngle = 360 / categories.length;

  useEffect(() => {
    if (isSpinning && !hasSpunRef.current) {
      // Mark as spinning to prevent double execution
      hasSpunRef.current = true;

      // Filter out already used categories
      const availableCategories = categories.filter(
        cat => !usedCategoryIds?.includes(cat.id)
      );

      // If no available categories (edge case), use all
      const selectableCategories = availableCategories.length > 0
        ? availableCategories
        : categories;

      // Randomly select from available categories
      const randomIndex = Math.floor(Math.random() * selectableCategories.length);
      const selectedCategory = selectableCategories[randomIndex];

      // Find index in original categories array for visual rotation
      const visualIndex = categories.findIndex(cat => cat.id === selectedCategory.id);
      const targetAngle = visualIndex * segmentAngle;

      // Generate rotation to land on target angle
      const fullRotations = 3 + Math.random() * 2;
      const totalRotation = rotation + (fullRotations * 360) + targetAngle;

      setRotation(totalRotation);

      // Complete spin after animation
      setTimeout(() => {
        setSelectedIndex(visualIndex);
        onSpinComplete(selectedCategory);
        // Reset flag after completion
        hasSpunRef.current = false;
      }, 3000);
    }
  }, [isSpinning, categories, rotation, segmentAngle, onSpinComplete]);

  // Reset flag when spinning stops
  useEffect(() => {
    if (!isSpinning) {
      hasSpunRef.current = false;
    }
  }, [isSpinning]);

  // ... resto del componente sin cambios ...
};
```

### Testing y Validación:

**Test 1: Verificar que usedCategoryIds tiene exactamente 3 elementos después de 3 rondas**

```javascript
// En DevTools Console después de completar 3 rondas:
// Buscar el componente RuedaInferenciasExercise en React DevTools
// Ver estado usedCategoryIds
// Debe ser: ['cat-literal', 'cat-inferencial', 'cat-critico'] (3 elementos únicos)
// NO debe ser: ['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial', ...]
```

**Test 2: Agregar logging temporal**

```typescript
// En handleWheelSpinComplete:
const handleWheelSpinComplete = (category: InferenceCategory) => {
  console.log('[DEBUG] handleWheelSpinComplete called', {
    categoryId: category.id,
    currentUsedIds: usedCategoryIds,
  });

  setUsedCategoryIds(prev => {
    const newIds = [...prev, category.id];
    console.log('[DEBUG] usedCategoryIds updated:', newIds);
    return newIds;
  });

  // ... resto del código ...
};
```

**Resultado esperado en consola:**
```
[DEBUG] handleWheelSpinComplete called { categoryId: 'cat-literal', currentUsedIds: [] }
[DEBUG] usedCategoryIds updated: ['cat-literal']

[DEBUG] handleWheelSpinComplete called { categoryId: 'cat-inferencial', currentUsedIds: ['cat-literal'] }
[DEBUG] usedCategoryIds updated: ['cat-literal', 'cat-inferencial']

[DEBUG] handleWheelSpinComplete called { categoryId: 'cat-critico', currentUsedIds: ['cat-literal', 'cat-inferencial'] }
[DEBUG] usedCategoryIds updated: ['cat-literal', 'cat-inferencial', 'cat-critico']
```

**❌ Si hay bug, verías:**
```
[DEBUG] handleWheelSpinComplete called { categoryId: 'cat-literal', currentUsedIds: [] }
[DEBUG] usedCategoryIds updated: ['cat-literal']
[DEBUG] handleWheelSpinComplete called { categoryId: 'cat-literal', currentUsedIds: ['cat-literal'] }  ← DUPLICADO
[DEBUG] usedCategoryIds updated: ['cat-literal', 'cat-literal']  ← PROBLEMA
```

**Test 3: Verificar que categorías NO se repiten**

```javascript
// Después de completar ejercicio, verificar que las 3 categorías sean DIFERENTES:
const uniqueCategories = new Set(usedCategoryIds);
console.assert(uniqueCategories.size === 3, 'Debe haber 3 categorías únicas');
console.assert(usedCategoryIds.length === 3, 'Debe haber exactamente 3 elementos');
```

### Impacto de la corrección:

- ✅ **Problema #3 resuelto:** usedCategoryIds NO tendrá duplicados
- ✅ **Problema #4 resuelto automáticamente:** Categorías NO se repetirán
- ✅ **Problema #2 mejorado:** Indicador mostrará información correcta

---

## CORRECCIÓN 5: Alinear Cálculo de Progreso

**Agente responsable:** Backend-Developer (con apoyo de Frontend-Developer)
**Prioridad:** P2 (Media)
**Estimación:** 2-4 horas
**Dificultad:** ALTA

### Problema identificado:

Dos páginas muestran progreso diferente para el MISMO módulo:

| Página | Progreso Mostrado | Fuente de Datos |
|--------|-------------------|-----------------|
| **ModuleDetailPage** | 5/5 ejercicios completados | `GET /educational/modules/{moduleId}/exercises` (filtra localmente) |
| **DashboardComplete** | 4/5 ejercicios completados | `GET /educational/users/{userId}/modules` (backend calcula) |

### Archivos afectados:

**Frontend:**
- `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx` (líneas 284-286)
- `apps/frontend/src/apps/student/hooks/useUserModules.ts` (líneas 101-102)
- `apps/frontend/src/services/api/educationalAPI.ts` (líneas 345-377, 425-442)

**Backend:**
- Controlador: `apps/backend/src/modules/educational/controllers/modules.controller.ts`
- Servicio: `apps/backend/src/modules/educational/services/modules.service.ts`
- Queries: SQL que calculan `completedExercises` para módulos

### OPCIÓN A: Frontend usa SIEMPRE datos del backend (RECOMENDADO)

**Ventajas:**
- ✅ Una sola fuente de verdad (backend)
- ✅ Cálculo consistente en todas las páginas
- ✅ Menos lógica de negocio en frontend
- ✅ Mejor performance (backend hace join eficiente)

**Desventajas:**
- ⚠️ Requiere que backend garantice datos correctos
- ⚠️ Frontend depende 100% del backend

**Implementación:**

**Paso 1: Backend - Garantizar que `/users/{userId}/modules` retorna datos correctos**

Verificar query SQL en backend:

```sql
-- Ejemplo de query CORRECTA:
SELECT
  m.*,
  COUNT(e.id) AS total_exercises,
  COUNT(CASE WHEN ue.completed = true THEN 1 END) AS completed_exercises,
  (COUNT(CASE WHEN ue.completed = true THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0)) AS progress
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id AND e.is_active = true
LEFT JOIN educational_content.user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = $1
WHERE m.organization_id = $2
GROUP BY m.id
ORDER BY m.order_index ASC;
```

**Criterios a validar:**
- Solo contar ejercicios activos (`e.is_active = true`)
- Solo contar ejercicios donde `ue.completed = true` (no null, no false)
- Usar `LEFT JOIN` para incluir módulos sin ejercicios

**Paso 2: Frontend - ModuleDetailPage usa datos del endpoint `/users/{userId}/modules`**

**Crear nuevo hook `useModuleProgress`:**

```typescript
// apps/frontend/src/apps/student/hooks/useModuleProgress.ts
import { useState, useEffect } from 'react';
import { getUserModules } from '@/services/api/educationalAPI';
import { useAuth } from '@/features/auth/hooks/useAuth';

export function useModuleProgress(moduleId: string) {
  const { user } = useAuth();
  const [moduleData, setModuleData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchModuleProgress() {
      if (!user?.id) return;

      try {
        setLoading(true);
        const modules = await getUserModules(user.id);
        const module = modules.find(m => m.id === moduleId);

        if (!module) {
          throw new Error('Module not found');
        }

        setModuleData(module);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    }

    fetchModuleProgress();
  }, [user?.id, moduleId]);

  return {
    completedExercises: moduleData?.completedExercises || 0,
    totalExercises: moduleData?.totalExercises || 0,
    progress: moduleData?.progress || 0,
    loading,
    error,
  };
}
```

**Paso 3: Modificar ModuleDetailPage.tsx**

```typescript
// ❌ ACTUAL (líneas 284-286):
const completedExercises = exercises.filter(ex => ex.completed).length;
const totalExercises = exercises.length;
const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;

// ✅ PROPUESTO:
// Usar hook nuevo en lugar de cálculo local
const {
  completedExercises,
  totalExercises,
  progress: progressPercentage,
  loading: progressLoading,
} = useModuleProgress(moduleId || '');

// Los ejercicios se siguen obteniendo de useModuleDetail para mostrar lista
// pero el PROGRESO viene del backend
```

**Paso 4: Verificar consistencia**

Ambas páginas ahora usan el MISMO endpoint y el MISMO cálculo:
- `DashboardComplete` → `useUserModules()` → `/users/{userId}/modules`
- `ModuleDetailPage` → `useModuleProgress()` → `/users/{userId}/modules`

### OPCIÓN B: Frontend filtra localmente en AMBAS páginas

**Ventajas:**
- ✅ Frontend tiene control total
- ✅ No depende de backend para cálculos

**Desventajas:**
- ❌ Duplicación de lógica
- ❌ Dos sources of truth (exercises vs modules)
- ❌ Más requests HTTP (necesita obtener exercises para cada módulo)
- ❌ Performance peor

**NO RECOMENDADO** - Solo considerar si backend no puede garantizar datos correctos.

### OPCIÓN C: Backend agrega endpoint específico `/modules/{moduleId}/progress`

**Crear endpoint nuevo:**
```
GET /educational/modules/{moduleId}/progress?userId={userId}

Response:
{
  "moduleId": "module-2",
  "totalExercises": 5,
  "completedExercises": 5,
  "progress": 100,
  "lastUpdated": "2025-11-23T10:30:00Z"
}
```

**Ventajas:**
- ✅ Endpoint específico y claro
- ✅ Backend controla cálculo
- ✅ Fácil de cachear

**Desventajas:**
- ⚠️ Requiere crear nuevo endpoint
- ⚠️ Más requests HTTP

**Implementación:**

**Backend - Crear endpoint:**
```typescript
// apps/backend/src/modules/educational/controllers/modules.controller.ts

@Get(':moduleId/progress')
@UseGuards(JwtAuthGuard)
async getModuleProgress(
  @Param('moduleId') moduleId: string,
  @Query('userId') userId: string,
) {
  return this.modulesService.getUserModuleProgress(userId, moduleId);
}
```

**Backend - Servicio:**
```typescript
// apps/backend/src/modules/educational/services/modules.service.ts

async getUserModuleProgress(userId: string, moduleId: string) {
  const result = await this.db.query(`
    SELECT
      $2 AS module_id,
      COUNT(e.id) AS total_exercises,
      COUNT(CASE WHEN ue.completed = true THEN 1 END) AS completed_exercises,
      (COUNT(CASE WHEN ue.completed = true THEN 1 END) * 100.0 / NULLIF(COUNT(e.id), 0)) AS progress
    FROM educational_content.exercises e
    LEFT JOIN educational_content.user_exercises ue
      ON ue.exercise_id = e.id AND ue.user_id = $1
    WHERE e.module_id = $2 AND e.is_active = true
  `, [userId, moduleId]);

  return {
    moduleId,
    totalExercises: parseInt(result.rows[0].total_exercises),
    completedExercises: parseInt(result.rows[0].completed_exercises),
    progress: parseFloat(result.rows[0].progress) || 0,
    lastUpdated: new Date().toISOString(),
  };
}
```

**Frontend - Usar endpoint:**
```typescript
// apps/frontend/src/services/api/educationalAPI.ts

export const getModuleProgress = async (
  moduleId: string,
  userId: string
): Promise<{
  moduleId: string;
  totalExercises: number;
  completedExercises: number;
  progress: number;
}> => {
  const { data } = await apiClient.get(
    `/educational/modules/${moduleId}/progress`,
    { params: { userId } }
  );
  return data;
};
```

### RECOMENDACIÓN:

**Implementar OPCIÓN A (Frontend usa siempre backend):**

**Razones:**
1. ✅ Más simple y rápida de implementar
2. ✅ No requiere crear nuevos endpoints
3. ✅ Consistencia garantizada
4. ✅ Mejor performance

**Plan de implementación:**

1. **Backend-Developer:** Revisar y validar query SQL en `/users/{userId}/modules`
2. **Frontend-Developer:** Crear hook `useModuleProgress`
3. **Frontend-Developer:** Modificar `ModuleDetailPage` para usar el hook
4. **QA:** Validar que ambas páginas muestran el mismo progreso

### Testing y Validación:

**Test 1: Completar ejercicio y verificar ambas páginas**

1. Ir a ModuleDetailPage del módulo 2
2. Completar ejercicio "Rueda de Inferencias"
3. Verificar progreso mostrado: X/Y
4. Ir a DashboardComplete
5. Verificar progreso mostrado para módulo 2: DEBE SER IGUAL a X/Y

**Test 2: Verificar query SQL en backend**

```sql
-- Ejecutar query directamente en DB:
SELECT
  m.id,
  m.title,
  COUNT(e.id) AS total_exercises,
  COUNT(CASE WHEN ue.completed = true THEN 1 END) AS completed_exercises
FROM educational_content.modules m
LEFT JOIN educational_content.exercises e ON e.module_id = m.id AND e.is_active = true
LEFT JOIN educational_content.user_exercises ue ON ue.exercise_id = e.id AND ue.user_id = 'user-test-id'
WHERE m.id = 'module-2'
GROUP BY m.id;
```

Comparar resultado con lo que muestra el frontend.

**Test 3: Logging de respuestas de API**

```typescript
// En useModuleProgress:
const modules = await getUserModules(user.id);
console.log('[DEBUG] Backend response for all modules:', modules);

const module = modules.find(m => m.id === moduleId);
console.log('[DEBUG] Module 2 progress:', {
  completedExercises: module.completedExercises,
  totalExercises: module.totalExercises,
});
```

Verificar en DevTools Network tab que la respuesta del backend es correcta.

---

## ORDEN DE EJECUCIÓN

### Día 1 (2-3 horas):

**Mañana:**
1. ✅ **CORRECCIÓN 3** (P1 - 1h) - Frontend-Developer
   - Implementar fix de duplicación en WheelSpinner.tsx
   - Agregar logging temporal para debugging
   - Testing manual de las 3 rondas

**Tarde:**
2. ✅ **CORRECCIÓN 1** (P2 - 30min) - Architecture-Analyst
   - Editar guía de pruebas con respuestas corregidas
   - Validar conteo de caracteres

3. ✅ **CORRECCIÓN 2** (P3 - 30min) - Frontend-Developer (OPCIONAL)
   - Reordenar estados en handleWheelSpinComplete
   - Integrar indicador en header
   - Testing visual

### Día 2 (2-4 horas):

**Mañana:**
4. ✅ **CORRECCIÓN 5 - Parte Backend** (P2 - 1-2h) - Backend-Developer
   - Revisar y validar query SQL
   - Asegurar que `/users/{userId}/modules` retorna datos correctos
   - Testing con queries SQL directas

**Tarde:**
5. ✅ **CORRECCIÓN 5 - Parte Frontend** (P2 - 1-2h) - Frontend-Developer
   - Crear hook `useModuleProgress`
   - Modificar ModuleDetailPage
   - Testing end-to-end

### Testing Final (30min):

6. ✅ **Validación completa** - QA + Product Owner
   - Verificar que NO hay duplicados en usedCategoryIds
   - Verificar que categorías NO se repiten
   - Verificar que progreso es consistente entre páginas
   - Verificar que guía tiene respuestas válidas (≤200 chars)

---

## CHECKLIST DE VALIDACIÓN POST-CORRECCIONES

### CORRECCIÓN 1 ✅
- [ ] Todas las respuestas EXCELENTES tienen ≤ 200 caracteres
- [ ] Keywords pedagógicas se mantienen
- [ ] Calidad del contenido NO se perdió

### CORRECCIÓN 2 ✅ (si se implementa)
- [ ] Indicador de categorías se muestra en Ronda 1
- [ ] Indicador de categorías se muestra en Ronda 2
- [ ] Indicador de categorías se muestra en Ronda 3
- [ ] Indicador muestra EXACTAMENTE las categorías usadas (sin duplicados)

### CORRECCIÓN 3 ✅
- [ ] usedCategoryIds tiene EXACTAMENTE 3 elementos después de 3 rondas
- [ ] usedCategoryIds NO contiene duplicados
- [ ] Console.log muestra handleWheelSpinComplete llamado 1 vez por ronda (NO 2)
- [ ] Categorías seleccionadas son TODAS diferentes

### CORRECCIÓN 5 ✅
- [ ] ModuleDetailPage muestra mismo progreso que DashboardComplete
- [ ] Backend query SQL retorna datos correctos
- [ ] Hook useModuleProgress funciona correctamente
- [ ] Progreso se actualiza inmediatamente después de completar ejercicio

---

## DOCUMENTOS GENERADOS

1. ✅ `01-ANALISIS-PROBLEMAS.md` - Análisis exhaustivo de los 5 problemas
2. ✅ `02-PLAN-CORRECCIONES.md` - Este documento
3. ⏳ `03-DELEGACION-AGENTES.md` - Siguiente paso

---

**Siguiente documento:** Ver `03-DELEGACION-AGENTES.md` para delegación específica a cada agente.
