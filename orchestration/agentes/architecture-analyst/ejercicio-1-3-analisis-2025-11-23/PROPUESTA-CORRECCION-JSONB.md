# PROPUESTA DE CORRECCIÓN - JSONB EXACTO
## Ejercicio 1.3: Completar Espacios en Blanco

**Fecha:** 2025-11-23
**Archivo afectado:** `02-exercises-module1.sql` (PROD y DEV)
**Líneas a modificar:** 346-353

---

## ANTES (Configuración actual incorrecta)

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

**Problema:**
- Espacio 5: Solo acepta "ciencias" (sin alternativas)
- Espacio 6: Acepta "matemáticas" O "física"
- **Asimetría lógica:** No permite combinaciones válidas como "matemáticas + física" o "física + ciencias"

---

## DESPUÉS (Configuración propuesta correcta)

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

**Mejora:**
- Espacio 5: Acepta "ciencias", "matemáticas" O "física"
- Espacio 6: Acepta "matemáticas", "ciencias" O "física"
- **Simetría lógica:** Permite todas las combinaciones históricamente válidas
- **Restricción adicional (backend):** Espacio 5 ≠ Espacio 6 (prevenir redundancias)

---

## CAMBIO EXACTO EN SEEDS

### Archivo 1: `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`

**Buscar líneas 346-353:**

```sql
"blanks": [
    {"id": "1", "position": 0, "correctAnswer": "Varsovia", "alternatives": []},
    {"id": "2", "position": 1, "correctAnswer": "Władysław", "alternatives": []},
    {"id": "3", "position": 2, "correctAnswer": "Bronisława", "alternatives": []},
    {"id": "4", "position": 3, "correctAnswer": "educación", "alternatives": []},
    {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": []},
    {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["física"]}
]
```

**Reemplazar con:**

```sql
"blanks": [
    {"id": "1", "position": 0, "correctAnswer": "Varsovia", "alternatives": []},
    {"id": "2", "position": 1, "correctAnswer": "Władysław", "alternatives": []},
    {"id": "3", "position": 2, "correctAnswer": "Bronisława", "alternatives": []},
    {"id": "4", "position": 3, "correctAnswer": "educación", "alternatives": []},
    {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]},
    {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
]
```

### Archivo 2: `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`

**Aplicar el MISMO cambio en líneas 346-353.**

---

## VALIDACIÓN BACKEND REQUERIDA

El cambio en seeds debe ir acompañado de validación en backend para prevenir redundancias.

### Pseudocódigo de validación:

```typescript
function validateBlanks5And6(blank5: string, blank6: string): ValidationResult {
  const validWords = ['ciencias', 'matemáticas', 'física'];

  // 1. Verificar que ambos sean válidos
  if (!validWords.includes(blank5)) {
    return { valid: false, message: 'Espacio 5 debe ser: ciencias, matemáticas o física' };
  }

  if (!validWords.includes(blank6)) {
    return { valid: false, message: 'Espacio 6 debe ser: ciencias, matemáticas o física' };
  }

  // 2. Verificar que NO sean iguales (prevenir redundancia)
  if (blank5 === blank6) {
    return {
      valid: false,
      message: 'Los espacios 5 y 6 no pueden tener la misma palabra. Marie mostró curiosidad por DOS disciplinas diferentes.'
    };
  }

  // 3. Si llega aquí, es válido
  return { valid: true, message: '¡Correcto!' };
}
```

### Ubicación esperada de validación:

**Backend (NestJS):**
```
apps/backend/src/modules/educational-content/services/exercise-validation.service.ts
```

**O función SQL (si existe):**
```
apps/database/ddl/schemas/educational_content/functions/03-validate_completar_espacios.sql
```

---

## COMBINACIONES VÁLIDAS DESPUÉS DE LA CORRECCIÓN

| Espacio 5 | Espacio 6 | Resultado | Texto resultante |
|-----------|-----------|-----------|------------------|
| ciencias | matemáticas | ✓ Válido | "...curiosidad por las ciencias y matemáticas." |
| ciencias | física | ✓ Válido | "...curiosidad por las ciencias y física." |
| matemáticas | ciencias | ✓ Válido | "...curiosidad por las matemáticas y ciencias." |
| matemáticas | física | ✓ Válido | "...curiosidad por las matemáticas y física." |
| física | ciencias | ✓ Válido | "...curiosidad por las física y ciencias." |
| física | matemáticas | ✓ Válido | "...curiosidad por las física y matemáticas." |
| ciencias | ciencias | ✗ Redundante | **Rechazar:** "...curiosidad por las ciencias y ciencias." |
| matemáticas | matemáticas | ✗ Redundante | **Rechazar:** "...curiosidad por las matemáticas y matemáticas." |
| física | física | ✗ Redundante | **Rechazar:** "...curiosidad por las física y física." |

**Total de combinaciones válidas:** 6 de 9 posibles
**Probabilidad de acierto aleatorio:** 6/9 × 1/8 × 1/7 ≈ 1.2% (considerando banco completo)

---

## SCRIPT DE ACTUALIZACIÓN (OPCIONAL)

Si se prefiere un script SQL para aplicar el cambio directamente:

```sql
-- Script de corrección para Ejercicio 1.3 - Espacios 5 y 6
-- Fecha: 2025-11-23
-- Aplicar en: DEV primero, luego PROD tras validación

SET search_path TO educational_content, public;

UPDATE educational_content.exercises
SET content = jsonb_set(
    jsonb_set(
        content,
        '{blanks,4,alternatives}',
        '["matemáticas", "física"]'::jsonb
    ),
    '{blanks,5,alternatives}',
    '["ciencias", "física"]'::jsonb
)
WHERE
    module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL')
    AND exercise_type = 'completar_espacios'
    AND order_index = 3;

-- Verificar el cambio
SELECT
    title,
    content->'blanks'->4 as espacio_5,
    content->'blanks'->5 as espacio_6
FROM educational_content.exercises
WHERE
    module_id = (SELECT id FROM educational_content.modules WHERE module_code = 'MOD-01-LITERAL')
    AND exercise_type = 'completar_espacios'
    AND order_index = 3;
```

**Resultado esperado de la verificación:**

```
espacio_5: {"id": "5", "position": 4, "correctAnswer": "ciencias", "alternatives": ["matemáticas", "física"]}
espacio_6: {"id": "6", "position": 5, "correctAnswer": "matemáticas", "alternatives": ["ciencias", "física"]}
```

---

## CHECKLIST DE IMPLEMENTACIÓN

### Pre-implementación
- [ ] Crear backup de `02-exercises-module1.sql` (PROD y DEV)
- [ ] Notificar al equipo de cambio inminente
- [ ] Verificar que validación backend soporta múltiples alternativas

### Implementación
- [ ] Modificar seed DEV: `apps/database/seeds/dev/educational_content/02-exercises-module1.sql`
- [ ] Ejecutar seed en DEV
- [ ] Verificar que cambio se aplicó correctamente (query de verificación)
- [ ] Testing QA en DEV (todas las combinaciones válidas/inválidas)
- [ ] Modificar seed PROD: `apps/database/seeds/prod/educational_content/02-exercises-module1.sql`
- [ ] Ejecutar seed en PROD (tras aprobación)
- [ ] Verificar que cambio se aplicó correctamente en PROD

### Post-implementación
- [ ] Actualizar DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
- [ ] Actualizar GUIA-PRUEBAS-MODULO1-Respuestas-Ejemplo.md
- [ ] Testing QA completo en PROD
- [ ] Monitorear submissions de usuarios por 24-48 horas
- [ ] Confirmar que redundancias son correctamente rechazadas

### Rollback (en caso de problemas)
- [ ] Restaurar backup de seeds
- [ ] Re-ejecutar seeds originales
- [ ] Notificar al equipo del rollback
- [ ] Investigar causa del problema

---

## TESTING EXHAUSTIVO

### Casos de prueba obligatorios:

```javascript
// Test Suite: Ejercicio 1.3 - Espacios 5 y 6

describe('Completar Espacios - Espacios 5 y 6', () => {

  // Casos válidos (deben pasar con 100 puntos)
  test('ciencias + matemáticas → válido', () => {
    const result = validate({ "5": "ciencias", "6": "matemáticas" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  test('ciencias + física → válido', () => {
    const result = validate({ "5": "ciencias", "6": "física" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  test('matemáticas + ciencias → válido', () => {
    const result = validate({ "5": "matemáticas", "6": "ciencias" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  test('matemáticas + física → válido', () => {
    const result = validate({ "5": "matemáticas", "6": "física" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  test('física + ciencias → válido', () => {
    const result = validate({ "5": "física", "6": "ciencias" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  test('física + matemáticas → válido', () => {
    const result = validate({ "5": "física", "6": "matemáticas" });
    expect(result.valid).toBe(true);
    expect(result.score).toBe(100);
  });

  // Casos inválidos (redundancias - deben rechazarse)
  test('ciencias + ciencias → inválido (redundancia)', () => {
    const result = validate({ "5": "ciencias", "6": "ciencias" });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('no pueden tener la misma palabra');
  });

  test('matemáticas + matemáticas → inválido (redundancia)', () => {
    const result = validate({ "5": "matemáticas", "6": "matemáticas" });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('no pueden tener la misma palabra');
  });

  test('física + física → inválido (redundancia)', () => {
    const result = validate({ "5": "física", "6": "física" });
    expect(result.valid).toBe(false);
    expect(result.message).toContain('no pueden tener la misma palabra');
  });

  // Casos inválidos (palabras no permitidas)
  test('educación + matemáticas → inválido (espacio 5 incorrecto)', () => {
    const result = validate({ "5": "educación", "6": "matemáticas" });
    expect(result.valid).toBe(false);
  });

  test('física + Polonia → inválido (espacio 6 incorrecto)', () => {
    const result = validate({ "5": "física", "6": "Polonia" });
    expect(result.valid).toBe(false);
  });

});
```

---

## COMUNICACIÓN A STAKEHOLDERS

### Mensaje para equipo pedagógico:

**Asunto:** Mejora en Ejercicio 1.3 - Mayor flexibilidad y coherencia

**Cuerpo:**
> Estimado equipo,
>
> Hemos identificado una oportunidad de mejora en el Ejercicio 1.3 "Completar Espacios en Blanco" del Módulo 1.
>
> **Cambio:** Los espacios 5 y 6 ("Marie mostró curiosidad por las ___ y ___") ahora aceptarán cualquiera de las tres opciones: ciencias, matemáticas, física.
>
> **Beneficio:** Mayor coherencia pedagógica y flexibilidad. Todas las combinaciones históricamente correctas serán aceptadas.
>
> **Restricción:** El sistema seguirá rechazando respuestas redundantes (ej: "ciencias + ciencias").
>
> **Impacto:** Estudiantes tendrán mejor experiencia, menos frustración, y el ejercicio será más alineado con la realidad histórica de Marie Curie.
>
> Cualquier duda, estamos disponibles.
>
> Saludos,
> Architecture-Analyst Team

---

**Documento generado por:** Architecture-Analyst
**Fecha:** 2025-11-23
**Estado:** ✅ Propuesta técnica completa - Lista para implementación
**Próxima acción:** Backend-Developer + Database-Agent
