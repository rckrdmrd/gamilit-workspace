# ANÁLISIS: Ejercicio 2.5 Rueda de Inferencias - Problemas Identificados

**Fecha:** 2025-11-23
**Analista:** Architecture-Analyst
**Solicitante:** Usuario / Product Owner
**Módulo afectado:** Módulo 2 - Comprensión Inferencial
**Ejercicio:** 2.5 - Rueda de Inferencias

---

## 🎯 CONTEXTO

El usuario reporta los siguientes problemas al probar el ejercicio:

1. **Repetición de categorías:** La ruleta puede repetir una categoría que ya fue elegida
2. **Criterios de calificación desconocidos:** No está claro cómo se califican las respuestas por categoría
3. **Flujo UX confuso:** Hay un botón para enviar la respuesta de la primera ronda que puede causar confusión - debería habilitarse solo cuando todas las respuestas estén completas

---

## 📋 HALLAZGOS DETALLADOS

### PROBLEMA 1: Repetición de Categorías en la Ruleta

**Ubicación del problema:**
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx:26-38`

**Análisis del código:**

```typescript
useEffect(() => {
  if (isSpinning) {
    // Generate random rotation (3-5 full rotations + random offset)
    const fullRotations = 3 + Math.random() * 2; // 3-5 rotations
    const randomDegrees = Math.random() * 360;
    const totalRotation = rotation + (fullRotations * 360) + randomDegrees;

    setRotation(totalRotation);

    // Calculate selected category after animation completes
    setTimeout(() => {
      const normalizedRotation = totalRotation % 360;
      const selectedIdx = Math.floor(normalizedRotation / segmentAngle) % categories.length;
      setSelectedIndex(selectedIdx);
      onSpinComplete(categories[selectedIdx]);
    }, 3000); // Match animation duration
  }
}, [isSpinning]);
```

**Problema identificado:**
- La selección es **completamente aleatoria** cada vez que se gira
- No existe ningún tracking de categorías ya seleccionadas
- No hay filtrado de categorías disponibles
- Posible girar la ruleta 3 veces y obtener "Inferencial" las 3 veces

**Severidad:** MEDIA
**Impacto en UX:** Alto - Genera repetición innecesaria y rompe la variedad del ejercicio

---

### PROBLEMA 2: Criterios de Calificación No Documentados/Implementados

**Ubicación de especificación:**
- `apps/database/seeds/prod/educational_content/03-exercises-module2.sql:482-505`

**Criterios encontrados en la base de datos:**

```json
{
  "validation": {
    "minKeywords": 2,
    "minLength": 20,
    "maxLength": 200
  },
  "fragments": [
    {
      "id": "frag-1",
      "keywords": ["pionera", "radiactividad", "nobel", "primera", "mujer",
                   "cientifico", "premio", "campos", "unica"],
      "points": 20
    },
    {
      "id": "frag-2",
      "keywords": ["discriminacion", "mujer", "persistio", "investigacion",
                   "laboratorio", "condiciones", "dificiles", "hombres", "campo"],
      "points": 20
    },
    {
      "id": "frag-3",
      "keywords": ["cuadernos", "radiactivos", "plomo", "cajas", "peligroso",
                   "descargo", "responsabilidad", "anos", "consultar"],
      "points": 20
    }
  ]
}
```

**Sistema de calificación:**
- ✅ **Validación por keywords:** Se requieren mínimo 2 keywords por fragmento
- ✅ **Puntos por fragmento:** 20 puntos × 3 fragmentos = 60 puntos base
- ✅ **Longitud de texto:** Mínimo 20, máximo 200 caracteres

**Problemas identificados:**

1. **No hay relación entre categoría y calificación:**
   - Las 4 categorías (Literal, Inferencial, Crítico, Creativo) NO tienen criterios diferenciados
   - La calificación solo valida keywords genéricas
   - Ejemplo: Si se selecciona "Crítico" pero el estudiante escribe algo literal, no se detecta

2. **Keywords no son específicas por categoría:**
   - Las keywords actuales son **descriptivas del contenido** (pionera, nobel, radiactivos)
   - NO son keywords de **tipo de inferencia** (analizar, comparar, evaluar, crear)

3. **Falta feedback específico por categoría:**
   - No se explica al estudiante QUÉ se espera de una inferencia "Literal" vs "Crítica"
   - No hay ejemplos de respuestas correctas por categoría

**Severidad:** ALTA
**Impacto pedagógico:** Crítico - El estudiante no sabe cómo responder según la categoría

---

### PROBLEMA 3: Flujo UX Confuso - Botón de Envío

**Ubicación del problema:**
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx:518-531`

**Análisis del código:**

```typescript
{/* Submit Button */}
<div className="flex justify-center">
  <button
    onClick={handleManualSubmit}  // <-- Línea 520
    disabled={!isTextValid || !isTimerRunning}
    className={`font-bold py-4 px-8 rounded-lg shadow-lg transition-all flex items-center gap-3 ${
      isTextValid && isTimerRunning
        ? 'bg-blue-600 hover:bg-blue-700 text-white transform hover:scale-105'
        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
    }`}
  >
    <Send className="w-6 h-6" />
    Enviar Respuesta  {/* <-- Texto confuso */}
  </button>
</div>
```

**Función llamada (línea 249-259):**

```typescript
const handleManualSubmit = () => {
  if (characterCount < exercise.content.settings.minTextLength) {
    alert(...);
    return;
  }

  setIsTimerRunning(false);
  handleSaveFragment(); // <-- NO envía al backend, solo guarda localmente
};
```

**Función handleSaveFragment (línea 215-246):**

```typescript
const handleSaveFragment = useCallback(() => {
  // ... actualiza estado local ...

  // Move to next fragment or complete
  if (currentFragmentIndex < exercise.content.fragments.length - 1) {
    setCurrentFragmentIndex((prev) => prev + 1);
    setPhase('intro');  // <-- Vuelve a girar la ruleta
    // ...
  } else {
    setPhase('completed');
    handleSubmitExercise();  // <-- AQUÍ es donde realmente envía
  }
}, [currentFragmentIndex, currentText, exercise.content.fragments.length]);
```

**Problemas identificados:**

1. **Texto del botón es engañoso:**
   - Dice "Enviar Respuesta" pero solo guarda localmente
   - NO envía al backend hasta completar las 3 rondas
   - El estudiante puede pensar que ya terminó el ejercicio

2. **No hay indicador de progreso claro:**
   - No se muestra "1 de 3 rondas completadas"
   - El estudiante no sabe cuántas rondas quedan
   - El header muestra "Fragmento X de 3" pero no es suficientemente visible

3. **Botón siempre visible en cada ronda:**
   - Debería haber UN solo botón "Enviar Ejercicio Completo"
   - Ese botón debería estar deshabilitado hasta completar las 3 rondas
   - Cada ronda debería tener un botón diferente como "Continuar" o "Siguiente Fragmento"

**Severidad:** MEDIA
**Impacto en UX:** Alto - Genera confusión sobre el estado del ejercicio

---

## 🔍 ANÁLISIS ADICIONAL: Flujo Actual vs Flujo Esperado

### Flujo Actual (Problemático)

```
1. [Intro] → Botón "Girar Ruleta"
2. [Spinning] → Animación ruleta
3. [Reading] → Mostrar categoría + fragmento → Botón "Comenzar a Escribir"
4. [Writing] → Timer 30s + Textarea → Botón "Enviar Respuesta" ❌ (confuso)
5. Si no es la última ronda → GOTO 1 (girar ruleta de nuevo)
6. Si es la última ronda → [Completed] → Envía al backend
```

**Problema:** El botón dice "Enviar Respuesta" en cada ronda, pero solo guarda localmente.

### Flujo Esperado (Propuesto)

```
1. [Intro] → Botón "Girar Ruleta"
2. [Spinning] → Animación ruleta
3. [Reading] → Mostrar categoría + fragmento → Botón "Comenzar a Escribir"
4. [Writing] → Timer 30s + Textarea → Botón "Guardar y Continuar" ✅
   - Indicador: "Ronda 1 de 3 completada ✓"
5. Si no es la última ronda → GOTO 1
6. Si es la última ronda → Mostrar resumen con botón "Enviar Ejercicio" ✅
7. [Completed] → Envía al backend
```

**Mejora:** Claridad en cada paso, botón final para envío real.

---

## 📊 RESUMEN DE PROBLEMAS

| ID | Problema | Severidad | Módulo Afectado | Requiere Cambio |
|----|----------|-----------|-----------------|-----------------|
| **P1** | Categorías se repiten en la ruleta | Media | Frontend | Frontend |
| **P2** | Criterios de calificación no diferenciados por categoría | Alta | Backend + Frontend | Backend + BD + Frontend |
| **P3** | Botón "Enviar Respuesta" confuso (no envía realmente) | Media | Frontend | Frontend |
| **P4** | Falta indicador de progreso de rondas | Baja | Frontend | Frontend |

---

## 🎯 IMPACTO GENERAL

### Impacto Pedagógico (P2 - Crítico)
- Los estudiantes NO saben cómo diferenciar respuestas Literales vs Inferenciales vs Críticas
- La mecánica de la ruleta pierde sentido si todas las categorías se califican igual
- Falta retroalimentación específica por tipo de inferencia

### Impacto en UX (P1, P3, P4 - Alto)
- Repetición de categorías genera frustración
- Confusión sobre cuándo se envía realmente el ejercicio
- Falta claridad sobre progreso del ejercicio

### Impacto Técnico (Bajo)
- Los cambios son localizados y no afectan arquitectura general
- No hay breaking changes en APIs existentes
- Cambios son incrementales y no requieren refactorización mayor

---

## 📋 PRÓXIMOS PASOS

1. ✅ **Análisis completado** (este documento)
2. ⏳ **Crear especificaciones de corrección** (siguiente documento)
3. ⏳ **Delegar implementaciones:**
   - Backend-Developer: Implementar validación por categoría
   - Database-Developer: Actualizar seed con criterios por categoría
   - Frontend-Developer: Implementar prevención de repetición + mejorar UX botones

---

**Documentado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Estado:** Análisis completo, pendiente de especificaciones de implementación
