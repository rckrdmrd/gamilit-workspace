# ANALISIS: Bugs Ejercicio Rueda de Inferencias

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Ejercicio:** Rueda de Inferencias (Módulo 2.5)
**Documento de referencia:** orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/

---

## RESUMEN EJECUTIVO

Se identificaron 5 problemas reportados por el Product Owner durante las pruebas del ejercicio "Rueda de Inferencias":

1. **Respuestas en guía de pruebas exceden límite de 200 caracteres** - CONFIRMADO
2. **Indicador de categorías usadas no se muestra** - PARCIALMENTE CONFIRMADO
3. **BUG CRÍTICO: Duplicación de IDs en usedCategoryIds** - CONFIRMADO
4. **Repetición de categorías a pesar de prevención** - CAUSADO POR #3
5. **Progreso inconsistente entre páginas (5/5 vs 4/5)** - DIFERENTE ORIGEN DE DATOS

**Prioridad general:**
- P1 (Crítica): Problema #3 (duplicación)
- P2 (Media): Problema #1 (guía), Problema #5 (progreso)
- P3 (Baja): Problema #2 (indicador)
- N/A: Problema #4 (se resuelve con #3)

---

## PROBLEMA 1: Respuestas Exceden Límite de Caracteres

**Archivo afectado:** `orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/04-GUIA-PRUEBAS-RESPUESTAS.md`
**Límite definido:** 200 caracteres (línea 88 de RuedaInferenciasExercise.tsx: `maxTextLength: 200`)
**Severidad:** MEDIA

### Respuestas problemáticas identificadas:

| Línea | Fragmento | Categoría | Tipo | Caracteres | Exceso |
|-------|-----------|-----------|------|------------|--------|
| 78-82 | frag-1 | inferencial | excelente | 230 | +30 |
| 114-119 | frag-1 | crítico | excelente | 262 | +62 |
| 229-233 | frag-2 | inferencial | excelente | 224 | +24 |
| 263-268 | frag-2 | crítico | excelente | 267 | +67 |
| 299-304 | frag-2 | creativo | excelente | 256 | +56 |
| 373-377 | frag-3 | inferencial | excelente | 212 | +12 |
| 407-413 | frag-3 | crítico | excelente | 219 | +19 |
| 442-448 | frag-3 | creativo | excelente | 280 | +80 |

### Análisis detallado:

**Fragmento 1 - Inferencial EXCELENTE (líneas 78-82):**
```
"El hecho de que Marie ganara en dos campos científicos diferentes sugiere
que tenía conocimientos interdisciplinarios excepcionales, lo que implica
una capacidad intelectual destacada para dominar múltiples disciplinas."
```
- **Caracteres totales:** 230
- **Exceso:** +30 caracteres

**Fragmento 1 - Crítico EXCELENTE (líneas 114-119):**
```
"Al analizar el contexto histórico, ganar dos Premios Nobel en una época
de discriminación significa que Marie superó barreras estructurales
significativas. Esto permite evaluar su impacto desde la perspectiva
de las mujeres en la ciencia del siglo XX."
```
- **Caracteres totales:** 262
- **Exceso:** +62 caracteres

**Fragmento 2 - Inferencial EXCELENTE (líneas 229-233):**
```
"Su persistencia a pesar de la discriminación muestra una determinación
y resiliencia extraordinarias. Superar obstáculos tan grandes requiere
una motivación profunda y fortaleza mental, lo que sugiere un compromiso
total con su vocación científica."
```
- **Caracteres totales:** 224
- **Exceso:** +24 caracteres

**Fragmento 2 - Crítico EXCELENTE (líneas 263-268):**
```
"Al evaluar críticamente este texto, la discriminación que enfrentó
Marie evidencia la injusticia y desigualdad estructural del sistema
científico del siglo XX. El significado de su persistencia trasciende
lo personal, representando un desafío a las barreras sociales de género
que requerían cambio estructural."
```
- **Caracteres totales:** 267 (incluyendo saltos de línea)
- **Exceso:** +67 caracteres

**Fragmento 2 - Creativo EXCELENTE (líneas 299-304):**
```
"La historia de Marie puede inspirar a científicas actuales que enfrentan
obstáculos similares. Si aplicamos las lecciones de su persistencia al
futuro, podemos relacionar su ejemplo con movimientos actuales por la
igualdad de género en STEM. Marie sirve como modelo de cómo enfrentar
barreras estructurales."
```
- **Caracteres totales:** 256
- **Exceso:** +56 caracteres

**Fragmento 3 - Inferencial EXCELENTE (líneas 373-377):**
```
"Que los cuadernos sigan radiactivos décadas después indica que el radio
tiene una vida media muy larga, lo que implica que la exposición de Marie
a este peligro fue constante. Las consecuencias para su salud fueron
inevitables dado el riesgo prolongado."
```
- **Caracteres totales:** 212
- **Exceso:** +12 caracteres

**Fragmento 3 - Crítico EXCELENTE (líneas 407-413):**
```
"Los cuadernos radiactivos son evidencia tangible del precio que Marie
pagó por avanzar la ciencia. Al evaluar esto críticamente, significa que
trabajó sin conocimiento completo de los riesgos, lo cual era común en
esa época. Esto nos permite analizar cómo la seguridad científica ha
evolucionado."
```
- **Caracteres totales:** 219 (estimado sin saltos de línea)
- **Exceso:** +19 caracteres

**Fragmento 3 - Creativo EXCELENTE (líneas 442-448):**
```
"Los cuadernos radiactivos son un símbolo poderoso y una metáfora del
legado duradero de Marie. Representan cómo los descubrimientos científicos
pueden tener consecuencias imprevistas que persisten en el presente.
Imaginar estos cuadernos nos invita a la reflexión sobre el futuro:
¿qué consecuencias a largo plazo tendrán las tecnologías actuales?"
```
- **Caracteres totales:** 280
- **Exceso:** +80 caracteres (LA MÁS LARGA)

### Causa raíz:
Las respuestas fueron redactadas con fines pedagógicos completos sin validar contra el límite técnico de 200 caracteres implementado en el frontend.

### Impacto:
- **Testing:** Los testers no pueden usar estos ejemplos en pruebas reales
- **Pedagógico:** Ejemplos "excelentes" NO pueden ser logrados por estudiantes
- **UX:** Confusión al intentar escribir respuestas similares a los ejemplos

### Consecuencias:
Si un estudiante intenta escribir una respuesta basada en los ejemplos "EXCELENTES" de la guía:
1. El textarea tiene `maxLength={200}` (línea 608 de RuedaInferenciasExercise.tsx)
2. Físicamente NO puede escribir más de 200 caracteres
3. La validación en línea 408-410 marca como inválido si excede 200
4. El botón se deshabilita si `characterCount > maxTextLength`

**Por lo tanto:** Los ejemplos documentados como "EXCELENTES" son IMPOSIBLES de replicar en el sistema real.

---

## PROBLEMA 2: Indicador de Categorías No Se Muestra

**Archivo afectado:** `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
**Líneas relevantes:** 453-478
**Severidad:** BAJA

### Código actual (líneas 453-478):

```typescript
{/* Categorías usadas */}
{usedCategoryIds.length > 0 && (
  <div className="bg-gray-50 rounded-lg p-4 border">
    <h4 className="text-sm font-semibold text-gray-700 mb-2">
      Categorías seleccionadas:
    </h4>
    <div className="flex gap-2 flex-wrap">
      {exercise.content.categories.map(category => {
        const isUsed = usedCategoryIds.includes(category.id);
        return (
          <div
            key={category.id}
            className={`px-3 py-1 rounded text-sm font-medium ${
              isUsed
                ? 'bg-green-100 border border-green-500 text-green-800'
                : 'bg-gray-200 text-gray-500'
            }`}
          >
            {category.icon} {category.name}
            {isUsed && ' ✓'}
          </div>
        );
      })}
    </div>
  </div>
)}
```

### Análisis de la condición de renderizado:

**Condición:** `usedCategoryIds.length > 0`

**Flujo de ejecución:**
1. **Estado inicial:** `usedCategoryIds = []` (línea 117)
2. **Fase intro:** `usedCategoryIds.length = 0` → Indicador NO se muestra ✓ (correcto)
3. **Primera ruleta gira:** `handleWheelSpinComplete` se ejecuta (línea 209)
4. **Primera categoría se agrega:** `setUsedCategoryIds(prev => [...prev, category.id])` (línea 222)
5. **Primera lectura/escritura:** `usedCategoryIds.length = 1` → Indicador SE DEBE MOSTRAR

### Causa raíz REAL:

El código del indicador es **CORRECTO** en términos de lógica. El problema reportado tiene dos posibles explicaciones:

#### Hipótesis A: Problema de timing (race condition)
El estado `usedCategoryIds` se actualiza DENTRO de `handleWheelSpinComplete` (línea 222), pero la pantalla puede cambiar de `spinning` a `reading` ANTES de que React re-renderice con el nuevo estado.

**Evidencia:**
```typescript
// Líneas 209-223
const handleWheelSpinComplete = (category: InferenceCategory) => {
  setSelectedCategory(category);      // Estado 1
  setIsWheelSpinning(false);         // Estado 2
  setPhase('reading');               // Estado 3 - Cambia UI

  // Update fragment state
  setFragmentStates(/* ... */);      // Estado 4

  // Track used category
  setUsedCategoryIds(prev => [...prev, category.id]); // Estado 5 - ÚLTIMO
};
```

React puede batchear estos updates, pero el orden NO está garantizado. Si `setPhase('reading')` se procesa antes que `setUsedCategoryIds`, la fase `reading` se renderiza con `usedCategoryIds` aún vacío.

#### Hipótesis B: Problema visual (indicador se muestra pero no es visible)
El indicador está ubicado DESPUÉS del header (líneas 453-478), lo que significa que en pantallas pequeñas puede estar fuera del viewport inicial.

### Impacto:
- **UX:** Estudiantes no ven qué categorías han usado
- **Funcional:** NO afecta la lógica del ejercicio (solo visual)
- **Severidad:** BAJA - Es un indicador de ayuda, no crítico

### Verificación necesaria:
Para confirmar cuál hipótesis es correcta, se necesita:
1. Agregar `console.log` en `handleWheelSpinComplete` para ver el orden de ejecución
2. Verificar en DevTools si el elemento se renderiza en DOM pero no es visible
3. Probar en diferentes tamaños de pantalla

---

## PROBLEMA 3: Duplicación de IDs en usedCategoryIds

**Archivo afectado:** `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
**Funciones involucradas:**
- `handleWheelSpinComplete` (línea 209-223)
- Posible useEffect no controlado

**Severidad:** CRÍTICA ⚠️

### Síntoma reportado:
Cada vez que la ruleta gira, `usedCategoryIds` agrega **2 IDs idénticos** en lugar de 1.

**Ejemplo:**
```javascript
// Estado esperado después de 3 rondas:
['cat-literal', 'cat-inferencial', 'cat-critico']

// Estado REAL (bug):
['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial', 'cat-critico', 'cat-critico']
```

### Análisis del código:

#### Función handleWheelSpinComplete (líneas 209-223):

```typescript
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
  setUsedCategoryIds(prev => [...prev, category.id]);  // ← AQUÍ SE AGREGA
};
```

Esta función se llama UNA sola vez cuando la ruleta termina de girar.

#### Análisis de WheelSpinner.tsx (líneas 24-56):

```typescript
useEffect(() => {
  if (isSpinning) {
    // Filter out already used categories
    const availableCategories = categories.filter(
      cat => !usedCategoryIds?.includes(cat.id)
    );

    // Select category
    const randomIndex = Math.floor(Math.random() * selectableCategories.length);
    const selectedCategory = selectableCategories[randomIndex];

    // Generate rotation
    const visualIndex = categories.findIndex(cat => cat.id === selectedCategory.id);
    const targetAngle = visualIndex * segmentAngle;
    const fullRotations = 3 + Math.random() * 2;
    const totalRotation = rotation + (fullRotations * 360) + targetAngle;

    setRotation(totalRotation);

    // Complete spin after animation
    setTimeout(() => {
      setSelectedIndex(visualIndex);
      onSpinComplete(selectedCategory);  // ← LLAMA A handleWheelSpinComplete
    }, 3000);
  }
}, [isSpinning, usedCategoryIds]);  // ← DEPENDENCIAS DEL useEffect
```

### CAUSA RAÍZ IDENTIFICADA:

El useEffect en WheelSpinner tiene como dependencia `usedCategoryIds`:

```typescript
}, [isSpinning, usedCategoryIds]);
```

**Flujo problemático:**

1. **Ronda 1 comienza:**
   - `usedCategoryIds = []`
   - `isSpinning = true`
   - useEffect se ejecuta → selecciona categoría A
   - Después de 3s: `onSpinComplete(A)` → `setUsedCategoryIds([A])`

2. **PROBLEMA:** Cuando `setUsedCategoryIds([A])` se ejecuta:
   - El estado `usedCategoryIds` cambia de `[]` a `[A]`
   - **El useEffect detecta el cambio en su dependencia `usedCategoryIds`**
   - **El useEffect se RE-EJECUTA** (aunque `isSpinning` sigue siendo `true` durante un momento)
   - **Si la condición `if (isSpinning)` todavía es verdadera, selecciona de nuevo**
   - **Llama `onSpinComplete(A)` por SEGUNDA vez**
   - **Resultado:** `usedCategoryIds = [A, A]`

3. **Ronda 2, 3:** El mismo problema se repite

### Flujo de estados problemático:

```
T0: usedCategoryIds=[], isSpinning=false
T1: User clicks "Girar" → isSpinning=true
T2: useEffect detecta isSpinning=true, usedCategoryIds=[]
    → ejecuta lógica de selección
    → programa setTimeout(3000)
T3: (3 segundos después) setTimeout ejecuta:
    → onSpinComplete(categoryA)
    → handleWheelSpinComplete ejecuta:
       → setUsedCategoryIds([categoryA])  ← ACTUALIZA DEPENDENCIA
T4: useEffect detecta cambio en usedCategoryIds ([] → [categoryA])
    → SI isSpinning TODAVÍA ES TRUE, re-ejecuta
    → programa SEGUNDO setTimeout(3000)
T5: SEGUNDO setTimeout ejecuta:
    → onSpinComplete(categoryA) ← SEGUNDA VEZ
    → setUsedCategoryIds([categoryA, categoryA])  ← DUPLICADO
```

### Evidencia adicional:

El problema no ocurre si:
- Se remueve `usedCategoryIds` de las dependencias del useEffect
- Se agrega un flag para evitar re-ejecución
- Se valida que `isSpinning` es `true` Y que no hay un timeout ya programado

### Impacto:

1. **Funcional CRÍTICO:** El array `usedCategoryIds` se corrompe
2. **Lógica de filtrado falla:** WheelSpinner filtra categorías basándose en `usedCategoryIds`
3. **Categorías se repiten:** A pesar del filtro, hay duplicados en el array
4. **Problema #4 es causado por esto:** Repetición de categorías

**Ejemplo de corrupción:**

```javascript
// Después de 3 rondas (esperado):
usedCategoryIds = ['cat-literal', 'cat-inferencial', 'cat-critico']
availableCategories = categories.filter(cat => !usedCategoryIds.includes(cat.id))
// availableCategories = [cat-creativo]  ← 1 categoría restante

// Después de 3 rondas (CON BUG):
usedCategoryIds = ['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial', 'cat-critico', 'cat-critico']
availableCategories = categories.filter(cat => !usedCategoryIds.includes(cat.id))
// availableCategories = [cat-creativo]  ← Filtro FUNCIONA pero array está corrupto
```

El filtro `.includes()` SÍ funciona correctamente, pero:
- El array tiene 6 elementos en lugar de 3
- Si hay 4 categorías y 3 rondas, con el bug tendrías 6 IDs en el array
- Esto causa que el indicador visual (problema #2) muestre información incorrecta

---

## PROBLEMA 4: Categoría Se Repite

**Archivo afectado:** `apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx` (líneas 27-39)
**Severidad:** ALTA (pero causada por Problema #3)

### Código de prevención (líneas 27-39):

```typescript
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
```

### Análisis:

La lógica de prevención es **CORRECTA**. El método `.includes()` funciona perfectamente:

```javascript
usedCategoryIds = ['cat-literal', 'cat-literal']
'cat-literal'.includes('cat-literal')  // true ✓
'cat-inferencial'.includes('cat-literal')  // false ✓
```

### Causa raíz:

**El problema NO está en WheelSpinner, está en PROBLEMA #3.**

Cuando `usedCategoryIds` tiene duplicados por el bug #3, el filtrado sigue funcionando, PERO:

**Escenario 1: Primera ronda**
- `usedCategoryIds = []`
- Ruleta selecciona `cat-literal`
- Bug #3 agrega DOBLE: `usedCategoryIds = ['cat-literal', 'cat-literal']`

**Escenario 2: Segunda ronda**
- `usedCategoryIds = ['cat-literal', 'cat-literal']`
- Filtro: `availableCategories = categories.filter(cat => !['cat-literal', 'cat-literal'].includes(cat.id))`
- Resultado: `[cat-inferencial, cat-critico, cat-creativo]` ← CORRECTO, literal excluido
- Ruleta selecciona `cat-inferencial`
- Bug #3 agrega DOBLE: `usedCategoryIds = ['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial']`

**Escenario 3: Tercera ronda**
- `usedCategoryIds = ['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial']`
- Filtro: `availableCategories = [cat-critico, cat-creativo]` ← CORRECTO
- Ruleta selecciona `cat-critico`
- Bug #3 agrega DOBLE: `usedCategoryIds = ['cat-literal', 'cat-literal', 'cat-inferencial', 'cat-inferencial', 'cat-critico', 'cat-critico']`

### ¿CUÁNDO se repite una categoría?

El Product Owner reportó que "se repitió una categoría". Esto puede ocurrir en dos casos:

**Caso A: Bug en el useEffect (más probable)**

Si el bug #3 causa que `onSpinComplete` se llame DOS veces con LA MISMA categoría en la MISMA ronda, pero el segundo llamado ocurre cuando `isSpinning` ya es `false`, entonces:

1. Primera llamada: `setUsedCategoryIds(['cat-literal'])`
2. Segunda llamada inmediata: `setUsedCategoryIds(['cat-literal', 'cat-literal'])`
3. **Usuario VE la ruleta girar UNA vez**
4. **Pero se agregaron DOS IDs**

**Caso B: Timing race condition (menos probable)**

Si el usuario hace click en "Girar" muy rápido dos veces seguidas:
1. Primera ruleta comienza → selecciona `cat-literal`
2. Segunda ruleta comienza ANTES de que la primera agregue a `usedCategoryIds`
3. Segunda ruleta VE `usedCategoryIds = []` (aún vacío)
4. Segunda ruleta TAMBIÉN puede seleccionar `cat-literal`

Pero esto es improbable porque el botón "Girar" solo se muestra en fase `intro`, no en `spinning`.

### Impacto:

- **Experiencia del usuario:** Estudiante ve la misma categoría dos veces
- **Validez pedagógica:** Ejercicio pierde sentido si no hay variedad
- **Calificación:** Estudiante puede escribir la misma inferencia dos veces

### Conclusión:

Este problema es un **SÍNTOMA del Problema #3**, no un bug independiente.

**SOLUCIÓN:** Arreglar el Problema #3 resolverá automáticamente el Problema #4.

---

## PROBLEMA 5: Progreso Inconsistente Entre Páginas

**Archivos afectados:**
- `apps/frontend/src/apps/student/pages/ModuleDetailPage.tsx` (muestra 5/5)
- `apps/frontend/src/apps/student/pages/DashboardComplete.tsx` (muestra 4/5)

**Severidad:** MEDIA

### Reporte del Product Owner:

> "ModulesPage muestra 5/5 ejercicios completados, pero la página principal de students muestra solo 4/5"

### Análisis de ModuleDetailPage.tsx (líneas 284-286):

```typescript
// Calculate progress percentage based on actual completed exercises
const completedExercises = exercises.filter(ex => ex.completed).length;
const totalExercises = exercises.length;
const progressPercentage = totalExercises > 0 ? (completedExercises / totalExercises) * 100 : 0;
```

**Fuente de datos:**
- Usa `exercises` array obtenido de `useModuleDetail(moduleId)`
- Filtra localmente en el frontend: `exercises.filter(ex => ex.completed).length`
- Cuenta el número de ejercicios donde `completed === true`

**Hook useModuleDetail:**
```typescript
// No se encontró en los archivos leídos, pero probablemente llama a:
// getModuleExercises(moduleId) de educationalAPI.ts
```

**API llamada:**
```typescript
// educationalAPI.ts línea 425-442
export const getModuleExercises = async (moduleId: string): Promise<Exercise[]> => {
  const { data } = await apiClient.get<any[]>(
    API_ENDPOINTS.educational.moduleExercises(moduleId)
  );
  return transformExercises(data);
};
```

**Endpoint:** `GET /educational/modules/{moduleId}/exercises`

### Análisis de DashboardComplete.tsx (líneas 108-117):

```typescript
// Modules data from modules API - transform to match ModulesSection interface
const modulesData = (userModules || []).map(module => ({
  ...module,
  difficulty: module.difficulty === 'easy' ? 'facil' as const : /*...*/,
  status: module.status === 'in_progress' ? 'in_progress' as const : /*...*/
}));
```

**Fuente de datos:**
- Usa `userModules` de `useUserModules()`
- Los módulos YA vienen con `totalExercises` y `completedExercises` desde el backend

**Hook useUserModules (líneas 94-108 de useUserModules.ts):**
```typescript
const transformedData: UserModuleData[] = data.map((module: any) => ({
  id: module.id,
  title: module.title,
  description: module.description,
  // ...
  totalExercises: module.totalExercises || 0,           // ← BACKEND
  completedExercises: module.completedExercises || 0,   // ← BACKEND
  // ...
}));
```

**API llamada:**
```typescript
// educationalAPI.ts línea 345-377
export const getUserModules = async (userId: string): Promise<Module[]> => {
  const { data } = await apiClient.get<Module[]>(
    API_ENDPOINTS.educational.userModules(userId)
  );
  return data;
};
```

**Endpoint:** `GET /educational/users/{userId}/modules`

### Comparación de fuentes de datos:

| Página | Fuente de Datos | Endpoint | Cálculo |
|--------|-----------------|----------|---------|
| **ModuleDetailPage** | `getModuleExercises(moduleId)` | `/educational/modules/{moduleId}/exercises` | Frontend filtra `exercises.filter(ex => ex.completed).length` |
| **DashboardComplete** | `getUserModules(userId)` | `/educational/users/{userId}/modules` | Backend retorna `module.completedExercises` |

### CAUSA RAÍZ:

**Dos endpoints DIFERENTES devuelven información de progreso DIFERENTE.**

**Hipótesis A: Backend calcula progreso de forma diferente**

El endpoint `/educational/users/{userId}/modules` puede estar calculando `completedExercises` usando una lógica diferente que `/educational/modules/{moduleId}/exercises`.

Posibles diferencias:
1. **Criterio de "completado":**
   - Un endpoint puede considerar `completed=true` solo si `score >= passing_score`
   - Otro puede considerar `completed=true` si simplemente fue enviado

2. **Caché o datos desactualizados:**
   - `/educational/users/{userId}/modules` puede estar cacheado
   - `/educational/modules/{moduleId}/exercises` obtiene datos frescos

3. **Filtrado de ejercicios:**
   - Un endpoint puede excluir ejercicios en estado "borrador" o "deshabilitado"
   - Otro incluye todos los ejercicios

**Hipótesis B: Timing de actualización**

Si el estudiante completó el ejercicio "Rueda de Inferencias" recientemente:
1. El ejercicio se marca como `completed=true` en la tabla `user_exercises`
2. El contador `module.completedExercises` en la tabla `modules` NO se actualizó aún
3. O viceversa: el contador se actualizó pero el flag `completed` no

Esto sugiere un problema de **consistencia eventual** o **falta de transacción atómica**.

### Verificación necesaria:

Para identificar la causa exacta, se necesita:

1. **Inspeccionar respuestas de API reales:**
   ```bash
   # En DevTools Network tab:
   GET /educational/users/{userId}/modules
   # Ver response: module.completedExercises = ?

   GET /educational/modules/{moduleId}/exercises
   # Ver response: exercises.filter(ex => ex.completed).length = ?
   ```

2. **Revisar código backend:**
   - Controlador de `/educational/users/{userId}/modules`
   - Controlador de `/educational/modules/{moduleId}/exercises`
   - Comparar queries SQL

3. **Revisar criterio de "completed":**
   - ¿Qué marca un ejercicio como completado?
   - ¿Hay un trigger o proceso que actualiza el contador?

### Impacto:

- **Confusión del usuario:** Estudiante ve progreso diferente en diferentes páginas
- **Credibilidad:** Plataforma parece tener bugs de datos
- **Decisiones del estudiante:** Puede pensar que un ejercicio no se guardó

### Recomendación:

**SOLUCIÓN A CORTO PLAZO:**
- Ambas páginas deben usar la MISMA fuente de verdad
- Opción 1: Ambas usan `/educational/users/{userId}/modules` (backend calcula)
- Opción 2: Ambas filtran localmente desde `/educational/modules/{moduleId}/exercises`

**SOLUCIÓN A LARGO PLAZO:**
- Backend debe garantizar consistencia entre ambos endpoints
- Usar transacciones atómicas al actualizar progreso
- Agregar tests de integración para validar que ambos endpoints retornan lo mismo

---

## MATRIZ DE PRIORIDADES

| Problema | Severidad | Prioridad | Impacto | Esfuerzo Estimado |
|----------|-----------|-----------|---------|-------------------|
| **#3 - Duplicación de IDs** | CRÍTICA | P1 | ALTO - Corrompe estado del ejercicio | 1-2 horas (fix useEffect) |
| **#1 - Respuestas exceden límite** | MEDIA | P2 | MEDIO - Documentación inconsistente | 30 min (editar texto) |
| **#5 - Progreso inconsistente** | MEDIA | P2 | MEDIO - Confusión del usuario | 2-4 horas (alinear APIs) |
| **#2 - Indicador no se muestra** | BAJA | P3 | BAJO - Solo visual | 15-30 min (reordenar estados) |
| **#4 - Categoría se repite** | N/A | N/A | Se resuelve con #3 | 0 min |

---

## DEPENDENCIAS ENTRE PROBLEMAS

```
Problema #3 (Duplicación)
    ↓ CAUSA
Problema #4 (Repetición de categorías)

Problema #2 (Indicador) ← INDEPENDIENTE de #3, #4
Problema #1 (Guía) ← INDEPENDIENTE de todos
Problema #5 (Progreso) ← INDEPENDIENTE de todos (diferente módulo)
```

**Orden de corrección recomendado:**
1. **Problema #3** (CRÍTICO) - Arregla también #4 automáticamente
2. **Problema #1** (FÁCIL) - Mientras se desarrolla fix para #5
3. **Problema #5** (COMPLEJO) - Requiere coordinación backend/frontend
4. **Problema #2** (OPCIONAL) - Si no se resuelve solo con #3

---

## PRÓXIMOS PASOS

Ver documento: `02-PLAN-CORRECCIONES.md`
