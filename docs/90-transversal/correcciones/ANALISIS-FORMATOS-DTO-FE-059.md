# Análisis de Formatos DTO - FE-059

**Fecha:** 2025-11-19
**Tarea:** FE-059 - Integración Frontend con Backend API
**Responsable:** Frontend Agent
**Estado:** ⚠️ REQUIERE ALINEACIÓN

---

## 📋 Resumen Ejecutivo

Durante la implementación de FE-059 (integración de 9 componentes de ejercicios con backend API), se identificaron **discrepancias críticas** entre:
1. Los formatos de respuesta implementados en el frontend
2. Los formatos especificados en el HANDOFF Database → Backend (DB-117)
3. Las especificaciones originales en historias de usuario

Este documento analiza las discrepancias y propone soluciones.

---

## 🎯 Componentes Analizados

### ✅ FORMATOS CORRECTOS (Sin discrepancias)

#### 1. Verdadero/Falso
- **Historia de Usuario:** US-ACT-002
- **HANDOFF DB-117:** `{"statements": {"stmt1": true, "stmt2": false}}`
- **Frontend Implementado:** `{"s1": true, "s2": false}` (formato similar)
- **Estado:** ✅ **COMPATIBLE** - Solo difiere en nombres de keys (stmt1 vs s1)

#### 2. Completar Espacios
- **Historia de Usuario:** US-ACT-003
- **HANDOFF DB-117:** `{"blanks": {"blank1": "word1", "blank2": "word2"}}`
- **Frontend Implementado:** `{"blanks": {"b1": "word1", "b2": "word2"}}`
- **Estado:** ✅ **COMPATIBLE** - Solo difiere en nombres de keys (blank1 vs b1)

#### 3. Crucigrama
- **Historia de Usuario:** N/A (no documentada originalmente)
- **HANDOFF DB-117:** `{"clues": {"h1": "WORD1", "v1": "WORD2"}}`
- **Frontend Implementado:** `{"clues": {"c1": "WORD1", "c2": "WORD2"}}`
- **Estado:** ✅ **COMPATIBLE** - Solo difiere en nombres de keys (h1/v1 vs c1/c2)

---

### ⚠️ FORMATOS CON DISCREPANCIAS MENORES (Requieren ajuste)

#### 4. Línea de Tiempo (Timeline)
- **Historia de Usuario:** US-ACT-005
  - Formato especificado: `{"order": ["id1", "id2", "id3"]}`
- **HANDOFF DB-117:**
  - Formato especificado: `{"events": ["event_3", "event_1", "event_4"]}`
- **Frontend Implementado:**
  - Formato actual: `{"eventOrder": ["e1", "e2", "e3"]}`
- **Discrepancia:** 3 nombres diferentes para el mismo campo
- **Impacto:** ⚠️ MEDIO - Requiere alineación de nombres
- **Propuesta:** Usar `"events"` (como en HANDOFF DB-117)

#### 5. Sopa de Letras (Word Search)
- **Historia de Usuario:** US-ACT-006 (mecánica de asociación)
- **HANDOFF DB-117:**
  - Formato especificado: `{"words": ["RADIO", "NOBEL", "FISICA"]}`
- **Frontend Implementado:**
  - Formato actual: `{"foundWords": ["MARIE", "CURIE", "NOBEL"]}`
- **Discrepancia:** Campo llamado `words` vs `foundWords`
- **Impacto:** ⚠️ MEDIO - Requiere cambiar nombre del campo
- **Propuesta:** Usar `"words"` (como en HANDOFF DB-117)

---

### 🚨 FORMATOS CON DISCREPANCIAS CRÍTICAS (Requieren rediseño)

#### 6. Detective Textual
- **HANDOFF DB-117:**
  - Formato: `{"questions": {"q1": "option_b", "q2": "option_a"}}`
  - Descripción: "Multiple choice basado en inferencias del texto"
  - **Tipo de ejercicio:** Opción múltiple con preguntas
- **Frontend Implementado:**
  - Formato: `{"connections": [{"from": "ev1", "to": "ev2", "relationship": "..."}]}`
  - Descripción: Conectar evidencias en una investigación
  - **Tipo de ejercicio:** Conexión de nodos/grafos
- **Discrepancia:** ❌ **TIPO DE EJERCICIO DIFERENTE**
- **Impacto:** 🚨 **CRÍTICO** - Incompatibilidad total
- **Análisis:**
  - El componente `DetectiveTextualExercise.tsx` implementa un juego de investigación tipo "tablero de detective" donde el usuario conecta evidencias
  - El HANDOFF DB-117 espera un formato de múltiple choice estándar
  - **Estas son dos mecánicas completamente diferentes**
- **Propuestas:**
  1. **Opción A:** Crear validador `validate_detective_connections()` en DB
  2. **Opción B:** Reimplementar componente como múltiple choice
  3. **Opción C:** Renombrar el tipo de ejercicio (no es "detective_textual")

#### 7. Predicción Narrativa
- **HANDOFF DB-117:**
  - Formato: `{"prediction": "El personaje principal decidirá..."}`
  - Descripción: Texto libre con validación heurística (30+ palabras)
  - **Tipo de ejercicio:** Respuesta abierta/ensayo
- **Frontend Implementado:**
  - Formato: `{"scenarios": {"s1": "pred_a", "s2": "pred_b"}}`
  - Descripción: Selección de predicciones predefinidas por escenario
  - **Tipo de ejercicio:** Múltiple choice con escenarios
- **Discrepancia:** ❌ **TIPO DE EJERCICIO DIFERENTE**
- **Impacto:** 🚨 **CRÍTICO** - Incompatibilidad total
- **Análisis:**
  - El componente `PrediccionNarrativaExercise.tsx` presenta múltiples escenarios con opciones predefinidas
  - El HANDOFF DB-117 espera texto libre del usuario
  - **Estas son dos mecánicas completamente diferentes**
- **Propuestas:**
  1. **Opción A:** Crear validador `validate_prediction_scenarios()` en DB
  2. **Opción B:** Reimplementar componente como texto libre
  3. **Opción C:** Renombrar el tipo de ejercicio

#### 8. Causa-Efecto (Construcción de Hipótesis)
- **HANDOFF DB-117:**
  - Tipo: `construccion_hipotesis`
  - Formato: `{"hypothesis": "Marie Curie descubrió..."}`
  - Descripción: Texto libre con validación heurística (20+ palabras)
  - **Tipo de ejercicio:** Respuesta abierta/ensayo
- **Frontend Implementado:**
  - Componente: `CausaEfectoExercise.tsx`
  - Formato: `{"causes": {"c1": ["cons1", "cons2"], "c2": ["cons3"]}}`
  - Descripción: Matching de causas con consecuencias (drag & drop)
  - **Tipo de ejercicio:** Asociación/matching
- **Discrepancia:** ❌ **TIPO DE EJERCICIO DIFERENTE**
- **Impacto:** 🚨 **CRÍTICO** - Incompatibilidad total
- **Análisis:**
  - El componente implementa mecánica de drag & drop para asociar causas con efectos
  - El HANDOFF DB-117 espera construcción de hipótesis en texto libre
  - **Estas son dos mecánicas completamente diferentes**
  - El componente parece ser una implementación de "Construcción de Hipótesis" pero con mecánica diferente
- **Propuestas:**
  1. **Opción A:** Crear validador `validate_cause_effect_matching()` en DB
  2. **Opción B:** Reimplementar componente como texto libre de hipótesis
  3. **Opción C:** Separar en dos ejercicios: "Causa-Efecto" y "Construcción de Hipótesis"

---

## 📊 Resumen de Discrepancias

| Componente | Compatibilidad | Impacto | Acción Requerida |
|-----------|---------------|---------|------------------|
| Verdadero/Falso | ✅ Compatible | Bajo | Ajuste menor de keys |
| Completar Espacios | ✅ Compatible | Bajo | Ajuste menor de keys |
| Crucigrama | ✅ Compatible | Bajo | Ajuste menor de keys |
| Timeline | ⚠️ Discrepancia menor | Medio | Renombrar `eventOrder` → `events` |
| Sopa de Letras | ⚠️ Discrepancia menor | Medio | Renombrar `foundWords` → `words` |
| Detective Textual | ❌ Incompatible | **CRÍTICO** | Rediseño requerido |
| Predicción Narrativa | ❌ Incompatible | **CRÍTICO** | Rediseño requerido |
| Causa-Efecto | ❌ Incompatible | **CRÍTICO** | Rediseño requerido |
| **Total** | **3/9 críticas** | - | **Requiere decisión de arquitectura** |

---

## 🎯 Propuestas de Solución

### Propuesta 1: Extender Base de Datos (RECOMENDADA)

**Ventaja:** Mantiene la implementación frontend actual
**Desventaja:** Requiere trabajo adicional en DB

**Acciones:**
1. Crear validador `validate_detective_connections()` para tipo `detective_textual_connections`
2. Crear validador `validate_prediction_scenarios()` para tipo `prediccion_narrativa_multiple_choice`
3. Crear validador `validate_cause_effect_matching()` para tipo `causa_efecto_matching`
4. Actualizar HANDOFF DB-117 con los nuevos formatos

**Estimación:** 4-6 horas de trabajo en DB

### Propuesta 2: Actualizar Frontend

**Ventaja:** Alineación con especificaciones DB existentes
**Desventaja:** Reescritura significativa de 3 componentes

**Acciones:**
1. Reimplementar `DetectiveTextualExercise` como múltiple choice
2. Reimplementar `PrediccionNarrativaExercise` como texto libre
3. Reimplementar `CausaEfectoExercise` como texto libre de hipótesis

**Estimación:** 12-16 horas de trabajo en frontend

### Propuesta 3: Renombrar Tipos de Ejercicio

**Ventaja:** Mantiene ambas implementaciones
**Desventaja:** Requiere nuevos tipos en DB y confusion en nomenclatura

**Acciones:**
1. Renombrar `detective_textual` → `conexion_evidencias`
2. Renombrar `prediccion_narrativa` → `escenarios_predictivos`
3. Crear nuevo tipo `causa_efecto_matching`
4. Mantener los tipos originales para uso futuro

**Estimación:** 2-3 horas de renombrado y documentación

---

## 🔧 Ajustes Menores Requeridos (Timeline y Sopa de Letras)

Independientemente de la propuesta elegida, se deben realizar estos ajustes:

### Timeline
```typescript
// ANTES
const response = await submitExercise(exercise.id, user.id, {
  eventOrder: userOrder
});

// DESPUÉS
const response = await submitExercise(exercise.id, user.id, {
  events: userOrder
});
```

### Sopa de Letras
```typescript
// ANTES
const response = await submitExercise(exercise.id, user.id, {
  foundWords: foundWordsList
});

// DESPUÉS
const response = await submitExercise(exercise.id, user.id, {
  words: foundWordsList
});
```

---

## 📝 Decisión Requerida

**Pregunta para el equipo:**
¿Qué propuesta deberíamos seguir para resolver las discrepancias críticas?

**Recomendación del Frontend Agent:**
- **Propuesta 1** (Extender Base de Datos) es la más práctica a corto plazo
- Los componentes frontend ya están implementados y funcionan correctamente
- Crear validadores adicionales en DB es más eficiente que reescribir frontend
- Permite mantener la experiencia de usuario ya diseñada

**Próximos pasos (actualizado):**
1. ✅ HANDOFF generado para Database Agent (ver `orchestration/HANDOFF-FE-059-TO-DB.md`)
2. ✅ **Decisión del equipo:** Propuesta 1 aprobada por usuario
3. ✅ Implementar cambios menores (Timeline y Sopa de Letras) - COMPLETADO
4. ✅ Especificaciones SQL creadas (ver `orchestration/SQL-SPECS-NUEVOS-VALIDADORES-FE-059.md`)
5. ✅ Seeds de testing creados (ver `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql`)
6. ⏳ **Database Agent:** Implementar 3 nuevos validadores SQL
7. ⏳ Actualizar HANDOFF DB-117 con nuevos formatos (post-implementación)
8. ⏳ Validar integración end-to-end

---

## 🔄 ACTUALIZACIÓN DE ESTADO (2025-11-19)

**Decisión Final:** ✅ Propuesta 1 (Extender Base de Datos) - APROBADA

### Progreso de Implementación:

#### ✅ Completado por Frontend Agent:
1. **Ajustes menores aplicados:**
   - Timeline: `eventOrder` → `events` (TimelineExercise.tsx:92)
   - SopaLetras: `foundWords` → `words` (SopaLetrasExercise.tsx:264)

2. **Especificaciones SQL completas:**
   - Documento: `orchestration/SQL-SPECS-NUEVOS-VALIDADORES-FE-059.md`
   - Incluye: 3 funciones SQL completas con casos de prueba
   - Instrucciones de integración con sistema existente

3. **Seeds de datos para testing:**
   - Archivo: `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql`
   - 3 ejercicios completos con datos reales de Marie Curie
   - order_index: 101, 102, 103 (distinguible de producción)

#### ⏳ Pendiente (Database Agent):
1. Implementar `validate_detective_connections()`
2. Implementar `validate_prediction_scenarios()`
3. Implementar `validate_causa_efecto_matching()`
4. Actualizar `validate_and_audit()` con routing
5. Ejecutar seeds de testing
6. Validar funciones con casos de prueba

#### ⏳ Pendiente (Testing Conjunto):
1. Testing end-to-end de integración
2. Validación con backend API
3. Pruebas funcionales de 9/9 tipos de ejercicios

### Estado Actual:
**Frontend:** ✅ Listo para integración
**Database:** ⏳ Especificaciones listas, implementación pendiente
**Backend:** ⏳ Esperando nuevos validadores de DB

---

**Documento creado:** 2025-11-19
**Última actualización:** 2025-11-19 (Estado: Propuesta 1 en implementación)
**Ubicación:** `docs/90-transversal/correcciones/`
**Revisión requerida:** Database Agent (para implementación)

**Documentos relacionados:**
- `orchestration/HANDOFF-FE-059-TO-DB.md` - Informe para Database Agent (ACTUALIZADO con progreso)
- `orchestration/SQL-SPECS-NUEVOS-VALIDADORES-FE-059.md` - Especificaciones técnicas SQL (NUEVO)
- `orchestration/TRAZA-DECISIONES-FE-059.md` - Traza de decisiones técnicas
- `apps/database/seeds/dev/educational_content/10-test-nuevos-validadores-FE-059.sql` - Seeds de testing (NUEVO)
- `docs/90-transversal/correcciones/REPORTE-VALIDACION-DOCS-FE-059-2025-11-19.md` - Reporte de validación
