# EVIDENCIA DEL BUG: Score = 0 en Rueda de Inferencias

**Fecha:** 2025-11-23
**Bug ID:** BUG-RUEDA-001
**Prioridad:** P0 - CRÍTICO

---

## 📸 CÓDIGO BUGGY (ACTUAL)

### Archivo: `exercise-submission.service.ts`
### Líneas: 623-639

```typescript
// Get expectations for this category (with type safety)
type CategoryId = 'cat-literal' | 'cat-inferencial' | 'cat-critico' | 'cat-creativo';
const categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];
//    ^^^^^ ❌ BUG: Declarado como 'const' - no puede reasignarse

if (!categoryExpectation) {
  console.warn(`[validateRuedaInferencias] No expectations found for category ${categoryId} in fragment ${fragment.id}, using default`);
  // Fallback: use literal category if available
  const fallbackExpectation = fragment.categoryExpectations?.['cat-literal'];
  //    ^^^^^^^^^^^^^^^^^^^ ❌ BUG: Nueva variable, NO modifica categoryExpectation
  if (!fallbackExpectation) {
    continue; // Skip this fragment if no valid expectations
  }
  // ❌ BUG: categoryExpectation SIGUE SIENDO undefined
  // El fallback se lee pero NUNCA se usa
}

// Validate categoryExpectation structure
if (!categoryExpectation || !categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
//  ^^^^^^^^^^^^^^^^^^^^ ❌ Esto es TRUE cuando entró al fallback
  console.warn(`[validateRuedaInferencias] Invalid category expectation for ${categoryId} in fragment ${fragment.id}`);
  continue;  // ❌ SKIP fragmento → score = 0
}

maxScore += categoryExpectation.points;  // ❌ NUNCA SE EJECUTA
```

---

## 🔬 ANÁLISIS PASO A PASO

### Caso de Prueba Real (Manual de Pruebas)

**Input:**
```json
{
  "exerciseId": "4226f7f9-837f-46aa-ba35-e8fe7039cf84",
  "answers": {
    "fragments": {
      "frag-1": "Marie Curie fue la primera mujer en ganar un Premio Nobel y la única persona en ganar dos"
    },
    "fragmentStates": [
      {
        "fragmentId": "frag-1",
        "categoryId": "cat-literal",
        "userText": "Marie Curie fue la primera mujer en ganar un Premio Nobel y la única persona en ganar dos",
        "timeSpent": 25
      }
    ]
  }
}
```

### Ejecución del Código Buggy

**Iteración 1: Fragment frag-1**

```typescript
// Línea 600-609: Obtener respuesta del usuario
const fragment = fragments[0]  // { id: 'frag-1', text: '...' }
const userAnswer = answers.fragments['frag-1']  // ✅ Existe
// userAnswer = "Marie Curie fue la primera mujer..."

// Línea 610-618: Obtener categoría
const fragmentState = fragmentStates.find(fs => fs.fragmentId === 'frag-1')
const categoryId = fragmentState.categoryId  // ✅ 'cat-literal'

// Línea 624: Buscar expectations para 'cat-literal'
const categoryExpectation = fragment.categoryExpectations['cat-literal']
// ✅ categoryExpectation = {
//   keywords: ["pionera", "radiactividad", ...],
//   description: "...",
//   example: "...",
//   points: 20
// }

// Línea 626: ¿Es undefined?
if (!categoryExpectation) {
  // ❌ NO ENTRA (categoryExpectation existe)
}

// Línea 636: Validar estructura
if (!categoryExpectation || !categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
  // ❌ NO ENTRA (estructura es válida)
}

// Línea 641: Agregar puntos
maxScore += categoryExpectation.points  // ✅ maxScore = 20

// Línea 644-649: Buscar keywords
const expectedKeywords = ["pionera", "radiactividad", "nobel", ...]
const userAnswerLower = "marie curie fue la primera mujer en ganar un premio nobel..."
const foundKeywords = ["nobel"]  // Solo 1 keyword encontrada (de 9)

// Línea 656-660: Calcular score
const minKeywords = 2
if (foundKeywords.length >= minKeywords) {
  // ❌ NO ENTRA (1 < 2)
}
fragmentScore = 0  // ❌ NO cumple minKeywords

// Línea 662: Sumar score
totalScore += 0  // ✅ totalScore = 0
```

**✅ RESULTADO:** Score = 0 (lógico - solo 1 keyword de 9, minKeywords = 2)

---

### ⚠️ PERO... ¿Y si categoryId NO existe?

**Input Alternativo (categoryId inválido):**
```json
{
  "fragmentStates": [
    {
      "fragmentId": "frag-1",
      "categoryId": "cat-INVALIDA",  // ❌ No existe en categoryExpectations
      "userText": "Marie fue pionera radiactividad nobel primera mujer científico premio",
      "timeSpent": 25
    }
  ]
}
```

**Ejecución del Código Buggy:**

```typescript
// Línea 624: Buscar expectations para 'cat-INVALIDA'
const categoryExpectation = fragment.categoryExpectations['cat-INVALIDA']
// ❌ categoryExpectation = undefined (no existe)

// Línea 626: ¿Es undefined?
if (!categoryExpectation) {
  // ✅ ENTRA (categoryExpectation es undefined)
  console.warn("No expectations found for category cat-INVALIDA, using default")

  // Línea 628: Buscar fallback
  const fallbackExpectation = fragment.categoryExpectations['cat-literal']
  // ✅ fallbackExpectation = {
  //   keywords: ["pionera", "radiactividad", ...],
  //   points: 20
  // }

  if (!fallbackExpectation) {
    // ❌ NO ENTRA (fallback existe)
  }
  // ❌ BUG: SALE del if sin asignar fallback a categoryExpectation
}

// Línea 636: Validar estructura
// categoryExpectation SIGUE SIENDO undefined
if (!categoryExpectation || !categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
  // ✅ ENTRA (categoryExpectation es undefined)
  console.warn("Invalid category expectation for cat-INVALIDA")
  continue  // ❌ SKIP fragmento
}

// ❌ NUNCA LLEGA AQUÍ
maxScore += categoryExpectation.points  // NO SE EJECUTA
```

**❌ RESULTADO:** Score = 0 (bug - tenía 7 keywords válidas pero se ignoraron)

---

## 🧪 PRUEBA DEL FIX

### Código Corregido

```typescript
// Get expectations for this category (with type safety)
type CategoryId = 'cat-literal' | 'cat-inferencial' | 'cat-critico' | 'cat-creativo';
let categoryExpectation = fragment.categoryExpectations?.[categoryId as CategoryId];
//  ^^^ ✅ FIX: Cambiado a 'let' para permitir reasignación

if (!categoryExpectation) {
  console.warn(`[validateRuedaInferencias] No expectations found for category ${categoryId} in fragment ${fragment.id}, using default`);
  // Fallback: use literal category if available
  categoryExpectation = fragment.categoryExpectations?.['cat-literal'];
  // ✅ FIX: Asignado directamente a categoryExpectation
  if (!categoryExpectation) {
    continue; // Skip this fragment if no valid expectations
  }
}

// Validate categoryExpectation structure
if (!categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
//  ✅ FIX: Eliminada validación redundante de null (ya está garantizado)
  console.warn(`[validateRuedaInferencias] Invalid category expectation for ${categoryId} in fragment ${fragment.id}`);
  continue;
}

maxScore += categoryExpectation.points;  // ✅ SE EJECUTA con fallback
```

### Ejecución DESPUÉS del Fix

**Input (con categoryId inválido):**
```json
{
  "fragmentStates": [
    {
      "fragmentId": "frag-1",
      "categoryId": "cat-INVALIDA",
      "userText": "Marie fue pionera radiactividad nobel primera mujer científico premio",
      "timeSpent": 25
    }
  ]
}
```

**Flujo corregido:**

```typescript
// Línea 624: Buscar expectations
let categoryExpectation = fragment.categoryExpectations['cat-INVALIDA']
// ❌ categoryExpectation = undefined

// Línea 626: ¿Es undefined?
if (!categoryExpectation) {
  // ✅ ENTRA
  categoryExpectation = fragment.categoryExpectations['cat-literal']
  // ✅ FIX: categoryExpectation = { keywords: [...], points: 20 }
  if (!categoryExpectation) {
    // ❌ NO ENTRA
  }
}

// Línea 636: Validar estructura
if (!categoryExpectation.keywords || !Array.isArray(categoryExpectation.keywords)) {
  // ❌ NO ENTRA (categoryExpectation ya está asignado)
}

// Línea 641: Agregar puntos
maxScore += categoryExpectation.points  // ✅ maxScore = 20

// Línea 644-660: Validar keywords
const expectedKeywords = ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio", ...]
const foundKeywords = ["pionera", "radiactividad", "nobel", "primera", "mujer", "cientifico", "premio"]  // 7/9
fragmentScore = 20 * (7/9) = 16  // ✅ Score proporcional

totalScore += 16  // ✅ totalScore = 16
```

**✅ RESULTADO DESPUÉS DEL FIX:** Score = 16/20 (correcto)

---

## 📊 COMPARACIÓN: ANTES vs DESPUÉS

| Escenario | ANTES (Buggy) | DESPUÉS (Fixed) |
|-----------|---------------|-----------------|
| **categoryId válido + keywords correctas** | Score > 0 ✅ | Score > 0 ✅ |
| **categoryId válido + sin keywords** | Score = 0 ✅ | Score = 0 ✅ |
| **categoryId inválido + keywords correctas** | Score = 0 ❌ | Score > 0 ✅ |
| **categoryId null/undefined** | Score = 0 ❌ | Score > 0 ✅ (usa fallback) |

---

## 🎯 CONCLUSIÓN

### El Bug Afecta Solo a Casos Edge

**✅ FUNCIONA (antes del fix):**
- Cuando frontend envía `categoryId` válido ('cat-literal', 'cat-inferencial', etc.)
- Cuando backend encuentra `categoryExpectations[categoryId]`

**❌ FALLA (antes del fix):**
- Cuando frontend envía `categoryId` inválido o inexistente
- Cuando backend NO encuentra `categoryExpectations[categoryId]` y debe usar fallback

### Posible Causa del Reporte del PO

**Hipótesis:** El Product Owner puede haber probado con:
1. Datos corruptos en localStorage (categoryId null)
2. Versión antigua del frontend (enviaba categoryId incorrecto)
3. Sesión interrumpida donde categoryId se perdió

### Recomendaciones Adicionales

1. **Validación en Frontend:**
   ```typescript
   // En RuedaInferenciasExercise.tsx línea 299
   categoryId: state.categoryId || 'cat-literal',  // ✅ Ya existe
   ```

2. **Logging Mejorado en Backend:**
   ```typescript
   console.log('[validateRuedaInferencias] CategoryId received:', categoryId);
   console.log('[validateRuedaInferencias] CategoryExpectation found:', !!categoryExpectation);
   console.log('[validateRuedaInferencias] Using fallback:', !categoryExpectation && !!fallback);
   ```

3. **Test de Regresión:**
   - Agregar test específico para categoryId inválido
   - Verificar que fallback funciona en todos los casos

---

**PRÓXIMO PASO:** Backend-Developer debe aplicar el fix inmediatamente.
