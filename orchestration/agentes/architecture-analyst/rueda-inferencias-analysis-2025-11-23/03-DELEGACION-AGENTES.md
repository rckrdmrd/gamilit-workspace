# DELEGACIÓN A AGENTES ESPECIALIZADOS: Rueda de Inferencias

**Fecha:** 2025-11-23
**Architecture-Analyst:** Delegación de implementaciones
**Proyecto:** GAMILIT - Módulo 2.5
**Tipo:** Correcciones + Mejoras

---

## 🎯 OVERVIEW

Este documento registra la delegación de las correcciones del ejercicio "Rueda de Inferencias" a los agentes especializados correspondientes.

**Documentación de referencia:**
- `01-ANALISIS-HALLAZGOS.md` - Análisis de problemas identificados
- `02-ESPECIFICACIONES-CORRECCIONES.md` - Especificaciones técnicas detalladas

---

## 📋 TAREAS DELEGADAS

### TAREA 1: Correcciones Frontend (Prevención Repetición + UX)

**Agente:** Frontend-Developer
**Prioridad:** P1 (Alta)
**Estimación:** 4-6 horas
**Estado:** ⏳ Pendiente de implementación

#### Descripción
Implementar las siguientes mejoras en el componente Rueda de Inferencias:

1. **Prevención de repetición de categorías:**
   - Agregar tracking de categorías ya usadas
   - Filtrar categorías disponibles en WheelSpinner
   - Asegurar que cada ronda use una categoría diferente

2. **Mejora de flujo UX:**
   - Cambiar texto de botones según la ronda
   - Agregar pantalla de resumen antes del envío final
   - Implementar barra de progreso visual
   - Mostrar indicador de categorías usadas

3. **Feedback detallado:**
   - Mostrar feedback específico por fragmento/ronda
   - Incluir palabras clave encontradas
   - Mostrar puntuación por ronda

#### Archivos a modificar
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/WheelSpinner.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/RuedaInferenciasExercise.tsx`
- `apps/frontend/src/features/mechanics/module2/RuedaInferencias/ruedaInferenciasTypes.ts`

#### Especificaciones técnicas
Ver documento: `02-ESPECIFICACIONES-CORRECCIONES.md`
- Sección "CORRECCIÓN 1: Prevenir Repetición de Categorías" (líneas 47-180)
- Sección "CORRECCIÓN 3: Mejorar Flujo UX de Botones" (líneas 582-786)
- Sección "CORRECCIÓN 4: Indicador de Categorías Disponibles" (líneas 790-824)

#### Criterios de aceptación
- [ ] La ruleta NO puede seleccionar una categoría ya usada
- [ ] El botón muestra "Guardar y Continuar" en rondas intermedias
- [ ] Existe una pantalla de resumen antes del envío final
- [ ] La barra de progreso muestra el avance visualmente
- [ ] Se muestran las categorías ya usadas con checkmarks
- [ ] El feedback detalla puntuación por ronda

#### Tests requeridos
- Unitarios para lógica de filtrado de categorías
- E2E para flujo completo de 3 rondas
- Verificar reset correcto del ejercicio

---

### TAREA 2: Actualización de Base de Datos (Criterios por Categoría)

**Agente:** Database-Developer
**Prioridad:** P1 (Alta)
**Estimación:** 2-3 horas
**Estado:** ⏳ Pendiente de implementación

#### Descripción
Actualizar la estructura del campo `solution` en el seed del ejercicio Rueda de Inferencias para incluir criterios de calificación diferenciados por categoría.

#### Archivos a modificar
- `apps/database/seeds/prod/educational_content/03-exercises-module2.sql` (líneas 482-505)
- Crear nueva migración (opcional, se puede actualizar solo el seed)

#### Especificaciones técnicas
Ver documento: `02-ESPECIFICACIONES-CORRECCIONES.md`
- Sección "CORRECCIÓN 2: Parte 2.1 - Actualización de Base de Datos" (líneas 246-541)

#### Nueva estructura de solution

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
      "text": "...",
      "categoryExpectations": {
        "cat-literal": {
          "keywords": [...],
          "description": "...",
          "example": "...",
          "points": 20
        },
        "cat-inferencial": { ... },
        "cat-critico": { ... },
        "cat-creativo": { ... }
      }
    }
  ]
}
```

#### QUÉ debe incluir cada categoría

**cat-literal:**
- Keywords: hechos explícitos mencionados en el texto
- Ejemplo: identificar datos directos

**cat-inferencial:**
- Keywords: "implica", "sugiere", "deducir", "consecuencia"
- Ejemplo: deducir información no explícita

**cat-critico:**
- Keywords: "evaluar", "analizar", "perspectiva", "significa"
- Ejemplo: analizar críticamente el significado

**cat-creativo:**
- Keywords: "imaginar", "si", "podría", "relacionar", "aplicar"
- Ejemplo: generar ideas originales relacionadas

#### Criterios de aceptación
- [ ] El seed actualizado carga correctamente
- [ ] Cada fragmento tiene 4 categoryExpectations
- [ ] Cada categoría tiene keywords, description, example, points
- [ ] Los ejemplos son claros y pedagógicamente útiles
- [ ] La estructura es válida JSON

#### Comando para aplicar
```sql
-- Si se necesita migración (opcional):
UPDATE educational_content.exercises
SET solution = '{ ... }'::jsonb
WHERE exercise_type = 'rueda_inferencias';
```

---

### TAREA 3: Lógica de Validación en Backend

**Agente:** Backend-Developer
**Prioridad:** P1 (Alta)
**Estimación:** 3-4 horas
**Estado:** ⏳ Pendiente de implementación

#### Descripción
Implementar lógica de validación que califique respuestas según la categoría seleccionada por el estudiante, utilizando keywords específicas y generando feedback detallado.

#### Archivos a modificar
- `apps/backend/src/modules/progress/services/exercise-submission.service.ts`

#### Especificaciones técnicas
Ver documento: `02-ESPECIFICACIONES-CORRECCIONES.md`
- Sección "CORRECCIÓN 2: Parte 2.2 - Lógica de Validación en Backend" (líneas 543-578)

#### Función a implementar

```typescript
private validateRuedaInferencias(
  answers: RuedaInferenciasAnswersDto,
  solution: any,
  fragmentStates: FragmentState[]
): ValidationResult {
  // 1. Iterar por cada fragmento
  // 2. Obtener la categoría usada (del fragmentState)
  // 3. Buscar categoryExpectations[categoryId] en solution
  // 4. Validar keywords en la respuesta del usuario
  // 5. Calcular puntuación proporcional a keywords encontradas
  // 6. Generar feedback específico por fragmento
  // 7. Retornar score total + feedback detallado
}
```

#### Lógica de puntuación

- **Mínimo:** 2 keywords encontradas → puntos proporcionales
- **Ratio:** (keywords encontradas / keywords esperadas) × points
- **Feedback:**
  - ≥80% puntos → "¡Excelente!"
  - ≥50% puntos → "Bien, pero podrías mejorar"
  - <50% puntos → "Intenta nuevamente" + ejemplo

#### Response structure

```typescript
{
  score: number,
  maxScore: number,
  feedback: {
    overall: string,
    byFragment: [
      {
        fragmentId: string,
        categoryUsed: string,
        keywordsFound: string[],
        keywordsExpected: string[],
        score: number,
        maxScore: number,
        feedback: string
      }
    ]
  }
}
```

#### Criterios de aceptación
- [ ] La función valida correctamente cada fragmento
- [ ] Se usa la categoría correcta del fragmentState
- [ ] Keywords se detectan correctamente (case-insensitive)
- [ ] Puntuación es proporcional a keywords encontradas
- [ ] Feedback es específico y útil pedagógicamente
- [ ] Se retorna feedback estructurado por fragmento

#### Tests requeridos
- Unitarios para la función de validación
- Casos de prueba:
  - Todas keywords encontradas
  - Solo mínimo de keywords
  - Ninguna keyword encontrada
  - Diferentes categorías para mismo fragmento

---

## 🔄 FLUJO DE IMPLEMENTACIÓN RECOMENDADO

### Fase 1: Base de Datos (Database-Developer)
1. Actualizar seed con nueva estructura de solution
2. Verificar que carga correctamente
3. **BLOQUEA:** Backend-Developer (necesita nueva estructura)

### Fase 2: Backend (Backend-Developer)
1. Implementar función de validación
2. Retornar feedback estructurado
3. Crear tests unitarios
4. **BLOQUEA:** Frontend-Developer (necesita estructura de response)

### Fase 3: Frontend (Frontend-Developer)
1. Implementar prevención de repetición (independiente)
2. Mejorar UX de botones (independiente)
3. Integrar feedback detallado (depende de Fase 2)
4. Tests E2E completos

---

## 📊 TRACKING DE PROGRESO

| Agente | Tarea | Estado | Inicio | Fin | Notas |
|--------|-------|--------|--------|-----|-------|
| Database-Developer | Actualizar seed con categoryExpectations | ⏳ Pendiente | - | - | Prioridad alta |
| Backend-Developer | Implementar validación por categoría | ⏳ Pendiente | - | - | Depende de DB |
| Frontend-Developer | Prevención repetición categorías | ⏳ Pendiente | - | - | Independiente |
| Frontend-Developer | Mejora UX botones y summary | ⏳ Pendiente | - | - | Independiente |
| Frontend-Developer | Mostrar feedback detallado | ⏳ Pendiente | - | - | Depende de Backend |

---

## ✅ VALIDACIÓN FINAL

Una vez completadas todas las tareas, verificar:

### Prueba de Usuario Completa
1. Iniciar ejercicio → Girar ruleta → Categoría X seleccionada
2. Escribir respuesta → "Guardar y Continuar"
3. Girar ruleta → Categoría Y seleccionada (diferente de X)
4. Escribir respuesta → "Guardar y Continuar"
5. Girar ruleta → Categoría Z seleccionada (diferente de X e Y)
6. Escribir respuesta → "Guardar Respuesta"
7. Ver pantalla de resumen con 3 respuestas
8. Click "Enviar Ejercicio Completo"
9. Ver feedback detallado:
   - Puntuación por ronda
   - Keywords encontradas
   - Feedback específico por categoría
   - Puntuación total

### Checklist de Validación
- [ ] NO se repiten categorías entre rondas
- [ ] Barra de progreso muestra avance
- [ ] Categorías usadas tienen checkmarks
- [ ] Botones tienen textos claros según fase
- [ ] Pantalla de resumen muestra todas las respuestas
- [ ] Feedback es específico por categoría
- [ ] Puntuación refleja criterios diferenciados
- [ ] Tests unitarios y E2E pasan

---

## 📝 COMUNICACIÓN CON PO

**Mensaje propuesto para Product Owner:**

> He completado el análisis del ejercicio "Rueda de Inferencias" y he identificado 4 problemas principales:
>
> 1. **Categorías se repiten** - La ruleta puede elegir la misma categoría múltiples veces
> 2. **Calificación no diferenciada** - Todas las categorías se califican igual, perdiendo el sentido pedagógico
> 3. **Flujo UX confuso** - El botón dice "Enviar Respuesta" pero no envía realmente
> 4. **Falta visibilidad de progreso** - No es claro cuántas rondas quedan
>
> **Propuesta de solución:**
> - Prevenir repetición de categorías en la ruleta
> - Implementar criterios de calificación específicos por tipo de inferencia (Literal, Inferencial, Crítica, Creativa)
> - Mejorar claridad de botones y agregar pantalla de resumen
> - Agregar indicadores visuales de progreso
>
> **Estimación:** 9-13 horas de desarrollo total (3 agentes trabajando en paralelo)
>
> Las especificaciones técnicas completas están documentadas en:
> - `orchestration/agentes/architecture-analyst/rueda-inferencias-analysis-2025-11-23/`
>
> ¿Apruebas que proceda con las implementaciones?

---

**Documentado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Estado:** Delegaciones documentadas, esperando aprobación para iniciar implementaciones
**Próximo paso:** Iniciar Task tool para agentes especializados
