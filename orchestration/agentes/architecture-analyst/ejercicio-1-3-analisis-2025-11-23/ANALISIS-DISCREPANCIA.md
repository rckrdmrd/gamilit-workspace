# ANÁLISIS DE DISCREPANCIA - EJERCICIO 1.3 MÓDULO 1
## Completar Espacios en Blanco - Espacios 5 y 6

**Fecha:** 2025-11-23
**Agente:** Architecture-Analyst
**Prioridad:** P1 - Alta (Afecta experiencia del usuario)
**Tipo:** Discrepancia lógica en configuración de alternativas

---

## 1. PROBLEMA IDENTIFICADO

### 1.1 Reporte del Usuario

En el ejercicio 1.3 "Completar Espacios en Blanco", el texto presenta:

> "Marie mostró desde pequeña gran curiosidad por las **___⑤___** y **___⑥___**."

**Banco de palabras disponibles:**
- Varsovia
- Władysław
- Bronisława
- educación
- ciencias
- Polonia
- matemáticas
- física

**Configuración actual en seeds:**
- **Espacio 5:** "ciencias" (sin alternativas)
- **Espacio 6:** "matemáticas" (con alternativa "física")

### 1.2 Discrepancia Lógica Detectada

Si el usuario completa:
- Espacio 5 con "matemáticas" → Espacio 6 debería aceptar "física" O "ciencias" ✓ (pero el sistema rechazará "matemáticas" en espacio 5)
- Espacio 5 con "física" → Espacio 6 debería aceptar "matemáticas" O "ciencias" ✓ (pero el sistema rechazará "física" en espacio 5)

**Lógica correcta esperada:**
Cualquiera de las 3 opciones (ciencias, matemáticas, física) debería ser válida para AMBOS espacios 5 y 6.

---

## 2. ANÁLISIS TÉCNICO

### 2.1 Configuración Actual en Seeds

**Archivo:** `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

**Líneas 346-353 (PROD):**
```json
"blanks": [
    {"id": "1", "position": 0, "correctAnswer": "Varsovia", "alternatives": []},
    {"id": "2", "position": 1, "correctAnswer": "Władysław", "alternatives": []},
    {"id": "3", "position": 2, "correctAnswer": "Bronisława", "alternatives": []},
    {"id": "4", "position": 3, "correctAnswer": "educación", "alternatives": []},
    {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
    {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["física"]}
]
```

**Problema detectado:**
- ✓ Espacio 6 tiene alternativas: `["física"]`
- ✗ Espacio 5 NO tiene alternativas: `[]`

Esto crea una asimetría lógica donde:
- El espacio 6 es flexible (acepta matemáticas O física)
- El espacio 5 es rígido (solo acepta ciencias)

### 2.2 Validación del Documento de Diseño

**Archivo:** `docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md`

**Líneas 292-299:**
```markdown
**Respuestas correctas:**

1. **Varsovia** – Ciudad natal de Marie.
2. **Władysław** – Nombre del padre.
3. **Bronisława** – Nombre de la madre.
4. **educación** – Valor fundamental familiar.
5. **ciencias** – Primer interés de Marie.
6. **matemáticas** o **física** – Ambas válidas.
```

**Análisis del DocumentoDeDiseño:**
- El documento especifica que el espacio 6 acepta "matemáticas" O "física" ✓ (esto está implementado)
- El documento NO menciona explícitamente que el espacio 5 pueda aceptar alternativas
- Sin embargo, **la lógica pedagógica sugiere que debería ser simétrico**

### 2.3 Validación en Guía de Pruebas

**Archivo:** `docs/00-vision-general/GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md`

**Líneas 364-377:**
```markdown
**Todos los espacios completados correctamente:**

1. **Varsovia** ✓ (ciudad natal)
2. **Władysław** ✓ (nombre del padre)
3. **Bronisława** ✓ (nombre de la madre)
4. **educación** ✓ (valor familiar)
5. **ciencias** ✓ (interés de Marie)
6. **matemáticas** ✓ o **física** ✓ (ambas aceptables)

**Texto completo resultante:**
> "... Marie mostró desde pequeña gran curiosidad por las **ciencias** y **matemáticas**."
```

La guía confirma que solo el espacio 6 tiene alternativas, pero **no valida la lógica inversa**.

---

## 3. ANÁLISIS PEDAGÓGICO Y LÓGICO

### 3.1 Contexto Histórico y Semántico

Del texto biográfico de Marie Curie sabemos:
- Su padre era profesor de **matemáticas Y física**
- Mostró interés temprano en **ciencias** (término general que incluye matemáticas y física)
- Estudió **física Y matemáticas** en la Sorbona

**Semánticamente:**
- "ciencias" es un hiperónimo (categoría general)
- "matemáticas" y "física" son hipónimos (disciplinas específicas)

### 3.2 Lógica de Combinaciones Válidas

El texto dice: "gran curiosidad por las ___ y ___"

**Combinaciones lógicamente válidas:**

| Espacio 5 | Espacio 6 | Validez Pedagógica | Implementado |
|-----------|-----------|-------------------|--------------|
| ciencias | matemáticas | ✓ Válido (general → específico) | ✓ SÍ |
| ciencias | física | ✓ Válido (general → específico) | ✓ SÍ (alternativa) |
| matemáticas | física | ✓ Válido (específico → específico) | ✗ NO |
| matemáticas | ciencias | ✓ Válido (específico → general) | ✗ NO |
| física | matemáticas | ✓ Válido (específico → específico) | ✗ NO |
| física | ciencias | ✓ Válido (específico → general) | ✗ NO |

**Combinaciones NO válidas (semánticamente redundantes):**

| Espacio 5 | Espacio 6 | Validez Pedagógica |
|-----------|-----------|-------------------|
| ciencias | ciencias | ✗ Redundante |
| matemáticas | matemáticas | ✗ Redundante |
| física | física | ✗ Redundante |

### 3.3 Análisis de Expectativas del Usuario

**Escenario problemático actual:**

Un estudiante podría razonar:
1. "Marie mostró curiosidad por las matemáticas y la física" (históricamente correcto)
2. Completa espacio 5: "matemáticas"
3. Completa espacio 6: "física"
4. **Sistema rechaza** porque espacio 5 solo acepta "ciencias"

**Frustración del usuario:**
- La respuesta es semánticamente correcta
- Está históricamente fundamentada
- Pero es rechazada por restricción técnica arbitraria

---

## 4. ANÁLISIS DE SOLUCIONES

### 4.1 Opción A: Hacer AMBOS espacios simétricos (RECOMENDADA)

**Implementación:**
```json
"blanks": [
    {"id": "1", "position": 0, "correctAnswer": "Varsovia", "alternatives": []},
    {"id": "2", "position": 1, "correctAnswer": "Władysław", "alternatives": []},
    {"id": "3", "position": 2, "correctAnswer": "Bronisława", "alternatives": []},
    {"id": "4", "position": 3, "correctAnswer": "educación", "alternatives": []},
    {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
    {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
]
```

**Ventajas:**
- ✓ Lógica simétrica y consistente
- ✓ Acepta todas las combinaciones válidas
- ✓ Reduce frustración del usuario
- ✓ Refleja mejor la realidad histórica

**Desventajas:**
- ⚠️ Aumenta complejidad de validación (debe prevenir redundancias)
- ⚠️ Requiere lógica adicional para rechazar "ciencias + ciencias" o "matemáticas + matemáticas"

**Validación necesaria:**
El sistema debe verificar que espacio 5 ≠ espacio 6 (prevenir redundancias).

### 4.2 Opción B: Mantener configuración actual (NO RECOMENDADA)

**Justificación hipotética:**
- El DocumentoDeDiseño especifica "ciencias" para espacio 5
- La flexibilidad en espacio 6 es suficiente

**Problemas:**
- ✗ Asimetría lógica injustificada
- ✗ Rechaza respuestas históricamente correctas
- ✗ Puede generar confusión pedagógica
- ✗ No hay justificación didáctica clara para la restricción

### 4.3 Opción C: Eliminar todas las alternativas (NO RECOMENDADA)

**Implementación:**
```json
{"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
{"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": []}
```

**Ventajas:**
- ✓ Simplicidad máxima
- ✓ Una sola respuesta correcta posible

**Desventajas:**
- ✗ Rechaza "física" en espacio 6 (históricamente válida)
- ✗ Reduce flexibilidad pedagógica
- ✗ Contradice el DocumentoDeDiseño actual

---

## 5. CORRECCIÓN PROPUESTA

### 5.1 Solución Recomendada: Opción A (Simetría completa)

**Modificación en Seeds:**

**Antes:**
```json
{"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
{"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["física"]}
```

**Después:**
```json
{"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
{"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
```

### 5.2 Lógica de Validación Necesaria

**Regla adicional a implementar:**
- ✓ Espacio 5 puede ser: ciencias, matemáticas, física
- ✓ Espacio 6 puede ser: ciencias, matemáticas, física
- ✗ **Restricción:** Espacio 5 ≠ Espacio 6 (prevenir redundancias)

**Implementación en backend:**
```javascript
function validateCompletarEspacios(answers) {
  const blank5 = answers["5"];
  const blank6 = answers["6"];

  // Validar que ambos espacios tengan valores permitidos
  const validWords5 = ["ciencias", "matemáticas", "física"];
  const validWords6 = ["ciencias", "matemáticas", "física"];

  if (!validWords5.includes(blank5)) return { valid: false, error: "Espacio 5 incorrecto" };
  if (!validWords6.includes(blank6)) return { valid: false, error: "Espacio 6 incorrecto" };

  // Validar que no sean la misma palabra (prevenir redundancia)
  if (blank5 === blank6) {
    return {
      valid: false,
      error: "Los espacios 5 y 6 no pueden tener la misma palabra. Marie mostró curiosidad por DOS áreas diferentes."
    };
  }

  return { valid: true };
}
```

### 5.3 Combinaciones Válidas Finales

Con la corrección propuesta:

| Espacio 5 | Espacio 6 | Resultado |
|-----------|-----------|-----------|
| ciencias | matemáticas | ✓ Válido |
| ciencias | física | ✓ Válido |
| matemáticas | ciencias | ✓ Válido |
| matemáticas | física | ✓ Válido |
| física | ciencias | ✓ Válido |
| física | matemáticas | ✓ Válido |
| ciencias | ciencias | ✗ Redundante (rechazar) |
| matemáticas | matemáticas | ✗ Redundante (rechazar) |
| física | física | ✗ Redundante (rechazar) |

---

## 6. ARCHIVOS A MODIFICAR

### 6.1 Seeds (Prioridad P0 - Crítico)

**1. Seed PROD:**
```bash
apps/database/seeds/prod/educational_content/02-exercises-module1.sql
```

**Líneas 351-352:**
```json
// ANTES:
{"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
{"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["física"]}

// DESPUÉS:
{"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
{"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
```

**2. Seed DEV:**
```bash
apps/database/seeds/dev/educational_content/02-exercises-module1.sql
```

**Misma modificación en líneas 351-352.**

### 6.2 Documentación (Prioridad P1 - Alta)

**1. Documento de Diseño:**
```bash
docs/00-vision-general/DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
```

**Líneas 292-299 - ACTUALIZAR:**
```markdown
**Respuestas correctas:**

1. **Varsovia** – Ciudad natal de Marie.
2. **Władysław** – Nombre del padre.
3. **Bronisława** – Nombre de la madre.
4. **educación** – Valor fundamental familiar.
5. **ciencias**, **matemáticas** o **física** – Cualquiera de las tres es válida.
6. **matemáticas**, **física** o **ciencias** – Cualquiera de las tres es válida.

**Restricción:** Los espacios 5 y 6 NO pueden tener la misma palabra (para evitar redundancias como "ciencias y ciencias").
```

**2. Guía de Pruebas:**
```bash
docs/00-vision-general/GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md
```

**Líneas 364-385 - ACTUALIZAR sección de respuestas excelentes:**
```markdown
**Todos los espacios completados correctamente:**

1. **Varsovia** ✓ (ciudad natal)
2. **Władysław** ✓ (nombre del padre)
3. **Bronisława** ✓ (nombre de la madre)
4. **educación** ✓ (valor familiar)
5. **ciencias** ✓ o **matemáticas** ✓ o **física** ✓ (cualquiera de las tres)
6. **matemáticas** ✓ o **física** ✓ o **ciencias** ✓ (cualquiera de las tres, pero diferente a espacio 5)

**Ejemplos de textos resultantes válidos:**

Opción 1:
> "... Marie mostró desde pequeña gran curiosidad por las **ciencias** y **matemáticas**."

Opción 2:
> "... Marie mostró desde pequeña gran curiosidad por las **matemáticas** y **física**."

Opción 3:
> "... Marie mostró desde pequeña gran curiosidad por las **física** y **ciencias**."

**Respuesta INCORRECTA (redundante):**
> "... Marie mostró desde pequeña gran curiosidad por las **ciencias** y **ciencias**." ✗
```

**Agregar nueva sección en errores comunes:**
```markdown
### ❌ RESPUESTA INCORRECTA - Redundancia

**Espacios con palabras repetidas:**

5. **ciencias** ✗ (redundante con espacio 6)
6. **ciencias** ✗ (redundante con espacio 5)

**Problema:**
El texto pide "curiosidad por las ___ y ___", lo que implica DOS áreas diferentes.
Usar la misma palabra dos veces es semánticamente incorrecto.

**Feedback del sistema:**
> "Los espacios 5 y 6 no pueden tener la misma palabra. Marie mostró curiosidad por DOS disciplinas diferentes. Revisa tus respuestas. ❌ Penalización: -20 puntos."
```

### 6.3 Backend - Función de Validación (Prioridad P0 - Crítico)

**Archivo esperado (si existe):**
```bash
apps/database/ddl/schemas/educational_content/functions/03-validate_completar_espacios.sql
```

**O implementación en backend (NestJS):**
```bash
apps/backend/src/modules/educational-content/services/exercise-validation.service.ts
```

**Lógica de validación a implementar:**
```typescript
validateCompletarEspacios(exerciseId: string, answers: Record<string, string>): ValidationResult {
  // ... validación de espacios 1-4 (sin cambios)

  // Validación especial para espacios 5 y 6
  const validWords = ['ciencias', 'matemáticas', 'física'];
  const blank5 = answers['5'].toLowerCase().trim();
  const blank6 = answers['6'].toLowerCase().trim();

  // Verificar que ambos sean válidos
  if (!validWords.includes(blank5)) {
    return {
      valid: false,
      score: 0,
      feedback: `El espacio 5 debe ser una de: ${validWords.join(', ')}`
    };
  }

  if (!validWords.includes(blank6)) {
    return {
      valid: false,
      score: 0,
      feedback: `El espacio 6 debe ser una de: ${validWords.join(', ')}`
    };
  }

  // Verificar que NO sean iguales (prevenir redundancia)
  if (blank5 === blank6) {
    return {
      valid: false,
      score: 0,
      feedback: 'Los espacios 5 y 6 no pueden tener la misma palabra. Marie mostró curiosidad por DOS disciplinas diferentes.'
    };
  }

  // Si llegamos aquí, la combinación es válida
  return {
    valid: true,
    score: 100,
    feedback: '¡Excelente! Todas las respuestas son correctas.'
  };
}
```

---

## 7. JUSTIFICACIÓN PEDAGÓGICA

### 7.1 Modelo de Cassany - Nivel 1 (Comprensión Literal)

**Objetivo del Módulo 1:**
Identificar información explícita del texto.

**¿La corrección propuesta afecta este objetivo?**
- ✓ NO. El ejercicio sigue evaluando comprensión literal.
- ✓ Las tres palabras (ciencias, matemáticas, física) están explícitamente mencionadas en el texto biográfico.
- ✓ La flexibilidad aumenta la validez pedagógica sin reducir el rigor.

### 7.2 Alineación con CEFR (A2)

**Nivel del ejercicio:** Beginner-Intermediate (A2)

**¿La corrección propuesta afecta la dificultad?**
- ⚠️ Ligeramente más fácil (más opciones aceptadas)
- ✓ Pero más realista y menos arbitraria
- ✓ La restricción de no-redundancia mantiene el desafío cognitivo

### 7.3 Principio de Coherencia Semántica

**Antes de la corrección:**
- Sistema acepta: "ciencias + física" ✓
- Sistema rechaza: "física + ciencias" ✗ (semánticamente idéntico)
- **Inconsistencia:** El orden no debería importar

**Después de la corrección:**
- Sistema acepta: "ciencias + física" ✓
- Sistema acepta: "física + ciencias" ✓
- Sistema rechaza: "física + física" ✗ (redundancia real)
- **Coherencia:** Lógica semántica consistente

---

## 8. PLAN DE IMPLEMENTACIÓN

### 8.1 Fase 1: Corrección de Seeds (Inmediato)

**Tareas:**
1. Modificar `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`
2. Modificar `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
3. Crear backup de archivos originales
4. Ejecutar seeds en DEV y validar
5. Ejecutar seeds en PROD (previa aprobación)

**Tiempo estimado:** 30 minutos

### 8.2 Fase 2: Actualización de Validación Backend (Alta Prioridad)

**Tareas:**
1. Localizar función de validación existente
2. Implementar lógica de no-redundancia (espacio 5 ≠ espacio 6)
3. Escribir tests unitarios para nuevas combinaciones
4. Desplegar en DEV
5. Testing QA completo
6. Desplegar en PROD

**Tiempo estimado:** 2-3 horas

### 8.3 Fase 3: Actualización de Documentación (Media Prioridad)

**Tareas:**
1. Actualizar DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
2. Actualizar GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md
3. Agregar ejemplos de combinaciones válidas/inválidas
4. Notificar a equipo pedagógico del cambio

**Tiempo estimado:** 1 hora

### 8.4 Fase 4: Testing y Validación (Crítico)

**Casos de prueba:**

| Espacio 5 | Espacio 6 | Resultado Esperado | Validar |
|-----------|-----------|-------------------|---------|
| ciencias | matemáticas | ✓ 100 puntos | ☐ |
| ciencias | física | ✓ 100 puntos | ☐ |
| matemáticas | ciencias | ✓ 100 puntos | ☐ |
| matemáticas | física | ✓ 100 puntos | ☐ |
| física | ciencias | ✓ 100 puntos | ☐ |
| física | matemáticas | ✓ 100 puntos | ☐ |
| ciencias | ciencias | ✗ Error: redundancia | ☐ |
| matemáticas | matemáticas | ✗ Error: redundancia | ☐ |
| física | física | ✗ Error: redundancia | ☐ |
| educación | matemáticas | ✗ Error: espacio 5 incorrecto | ☐ |
| matemáticas | educación | ✗ Error: espacio 6 incorrecto | ☐ |

**Tiempo estimado:** 1 hora

---

## 9. IMPACTO Y RIESGOS

### 9.1 Impacto en Usuarios Existentes

**Usuarios que YA completaron el ejercicio:**
- ✓ No afectados (sus puntajes no cambian)
- ⚠️ Podrían ver mensajes diferentes si reintentan

**Usuarios que NO han completado:**
- ✓ Beneficiados (más flexibilidad)
- ✓ Mejor experiencia (menos frustración)

### 9.2 Riesgos Técnicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Validación backend no implementa restricción de redundancia | Media | Alto | Testing exhaustivo antes de deploy |
| Seeds corruptos tras modificación | Baja | Alto | Backups obligatorios antes de cambios |
| Inconsistencia entre DEV y PROD | Media | Medio | Sincronización automática de seeds |
| Documentación desactualizada | Alta | Bajo | Review obligatorio post-implementación |

### 9.3 Riesgos Pedagógicos

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Ejercicio se vuelve demasiado fácil | Baja | Bajo | La restricción de no-redundancia mantiene desafío |
| Maestros confundidos por el cambio | Media | Bajo | Comunicación clara en notas de versión |
| Estudiantes aprovechan para "adivinar" | Baja | Bajo | 3 opciones válidas de 8 totales = 37.5% probabilidad aleatoria |

---

## 10. DECISIÓN Y PRÓXIMOS PASOS

### 10.1 Decisión Recomendada

**IMPLEMENTAR OPCIÓN A: Simetría completa con restricción de no-redundancia**

**Justificación final:**
1. ✓ Lógica pedagógicamente consistente
2. ✓ Refleja mejor la realidad histórica de Marie Curie
3. ✓ Reduce frustración del usuario
4. ✓ Mantiene rigor académico (prevención de redundancias)
5. ✓ Alineado con principio de comprensión literal (todas las opciones están explícitas en el texto)

### 10.2 Próximos Pasos Inmediatos

**Para Backend-Developer:**
1. Crear ticket: "FIX: Ejercicio 1.3 - Implementar simetría en espacios 5 y 6"
2. Prioridad: P1 (Alta)
3. Asignar a: Backend team + Database team

**Para Database-Agent:**
1. Modificar seeds PROD y DEV (Fase 1)
2. Validar integridad de datos tras cambio
3. Documentar cambios en changelog

**Para Architecture-Analyst (este agente):**
1. Notificar al equipo pedagógico del cambio
2. Actualizar documentación (Fase 3)
3. Supervisar testing QA (Fase 4)

**Para QA-Tester:**
1. Ejecutar casos de prueba de Fase 4
2. Validar todos los escenarios de combinaciones
3. Confirmar que redundancias son rechazadas correctamente

---

## 11. CONCLUSIÓN

**Discrepancia confirmada:** ✓ SÍ

**Tipo de discrepancia:** Asimetría lógica en configuración de alternativas

**Gravedad:** P1 - Alta (Afecta experiencia del usuario y coherencia pedagógica)

**Corrección requerida:** Modificar seeds para hacer espacios 5 y 6 simétricamente flexibles, con validación adicional para prevenir redundancias.

**Beneficio esperado:** Mejora en experiencia del usuario, coherencia semántica y alineación con realidad histórica de Marie Curie.

**Riesgo:** Bajo (con testing adecuado)

**Recomendación final:** PROCEDER CON LA CORRECCIÓN según Opción A propuesta.

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Estado:** ✅ Análisis completo - Listo para implementación
**Próxima acción:** Crear tickets para Backend-Developer y Database-Agent
