# P0-002 - ANÁLISIS: Corregir Validación de Respuestas de Ejercicios

**Fecha:** 2025-11-28
**Agente:** Backend-Agent
**Prioridad:** P0 (Crítica)
**Estado:** En análisis

---

## 1. PROBLEMA IDENTIFICADO

### 1.1 Ubicación del Workaround
**Archivo:** `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
**Líneas:** 836-855

### 1.2 Descripción del Problema

El endpoint `POST /api/v1/educational/exercises/:id/submit` tiene un workaround temporal (Issues FE-049 + FE-061) que detecta y adapta dos formatos diferentes de envío de respuestas desde el frontend:

#### **Formato Antiguo (Correcto):**
```typescript
{
  userId: "uuid",
  submitted_answers: {
    clues: { "h1": "SORBONA", "v1": "NOBEL" }  // Estructura directa
  },
  time_spent_seconds: 120,
  hints_used: 2,
  comodines_used: ["hint_50_50"]
}
```

#### **Formato Nuevo (Problemático):**
```typescript
{
  // No incluye userId (se extrae del JWT)
  answers: {
    clues: { "h1": "SORBONA", "v1": "NOBEL" }  // Estructura directa
  },
  startedAt: 1638392400000,  // timestamp
  hintsUsed: 2,
  powerupsUsed: ["hint_50_50"]
}
```

### 1.3 Problema Específico FE-061

Según el comentario en línea 851-853:

> "FE-061: Frontend anida las respuestas dentro de 'answers'
> Por ejemplo, crucigrama envía {answers: {clues: {...}}}
> pero el validator espera directamente {clues: {...}}"

**Sin embargo**, analizando el código actual:
- **Línea 854:** `submittedAnswers = body.answers || {};`
- El workaround actual asume que `body.answers` ya contiene la estructura correcta

**Estructura esperada por validators:**
```typescript
// CrucigramaAnswersDto espera:
{
  clues: { "h1": "SORBONA", "v1": "NOBEL" }
}

// WordSearchAnswersDto espera:
{
  words: ["SORBONA", "NOBEL", "MARIE"]
}
```

### 1.4 Problema de Validación

**CRÍTICO:** El validador `ExerciseAnswerValidator` existe pero **NO SE ESTÁ USANDO** en el controller.

- **Archivo validador:** `apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`
- **DTOs disponibles:** 20 DTOs con validaciones específicas por tipo de ejercicio
- **Estado actual:** La validación se delega completamente a PostgreSQL (`validate_and_audit`)

**Riesgos:**
1. Si el frontend envía estructura incorrecta, se pasa a PostgreSQL sin validación previa
2. Errores SQL crípticos en lugar de mensajes claros de validación
3. No hay validación de tipos ni estructura antes de procesamiento
4. Logs de debug muestran que hay confusión sobre qué estructura llega

---

## 2. ANÁLISIS DE CÓDIGO ACTUAL

### 2.1 Workaround en `exercises.controller.ts` (líneas 836-855)

```typescript
// WORKAROUND TEMPORAL (Issue FE-049 + FE-061)
// Detectar qué formato está usando Frontend y adaptar
let userId: string;
let submittedAnswers: Record<string, any>;

if (body.userId && body.submitted_answers) {
  // Formato antiguo (correcto)
  userId = body.userId;
  submittedAnswers = body.submitted_answers;
} else {
  // Formato nuevo problemático (workaround)
  // Frontend no envía userId, extraerlo del token JWT autenticado
  userId = req.user.id; // Extraído del JWT por JwtAuthGuard

  // Frontend envía 'answers' en lugar de 'submitted_answers'
  // FE-061: Frontend anida las respuestas dentro de 'answers'
  submittedAnswers = body.answers || {};
}
```

### 2.2 Logs de Debug (líneas 861-869)

```typescript
console.log('[FE-061 DEBUG] Exercise submit received:', {
  exerciseId,
  userId: userId,
  profileId: profileId,
  bodyKeys: Object.keys(body),
  submittedAnswersKeys: Object.keys(submittedAnswers),
  submittedAnswersStructure: JSON.stringify(submittedAnswers, null, 2).substring(0, 500),
});
```

Estos logs indican que hay confusión sobre la estructura recibida.

### 2.3 Validación Actual (líneas 913-920)

```typescript
const validationResult = await this.dataSource.query(`
  SELECT * FROM educational_content.validate_and_audit(
    $1::UUID,  -- exercise_id
    $2::UUID,  -- user_id (profileId)
    $3::JSONB, -- submitted_answer
    $4::INTEGER -- attempt_number
  )
`, [exerciseId, profileId, JSON.stringify(submittedAnswers), attemptNumber]);
```

**Problema:** La validación se hace directamente en PostgreSQL sin validación previa en NestJS.

---

## 3. ANÁLISIS DE VALIDADORES EXISTENTES

### 3.1 ExerciseAnswerValidator

**Ubicación:** `apps/backend/src/modules/progress/dto/answers/exercise-answer.validator.ts`

**Funcionalidad:**
- Mapea 20 tipos de ejercicios a sus DTOs correspondientes
- Usa `class-validator` para validación robusta
- Transforma `plainToInstance` para garantizar tipos correctos
- Genera mensajes de error claros y específicos

**Ejemplo de uso esperado:**
```typescript
// Validar antes de enviar a PostgreSQL
await ExerciseAnswerValidator.validate(exercise.exercise_type, submittedAnswers);
```

### 3.2 DTOs de Respuestas

**Ejemplos analizados:**

#### CrucigramaAnswersDto
```typescript
export class CrucigramaAnswersDto {
  @IsObject({ message: 'clues must be an object' })
  @IsNotEmpty({ message: 'clues object is required' })
  clues!: Record<string, string>;
}
```

#### WordSearchAnswersDto
```typescript
export class WordSearchAnswersDto {
  @IsArray()
  @ArrayNotEmpty({ message: 'words array cannot be empty' })
  @IsString({ each: true })
  words!: string[];
}
```

**Nota:** Los DTOs ya tienen logs de debug FE-061 integrados (líneas 142-147 del validator).

---

## 4. ANÁLISIS DE IMPACTO

### 4.1 Impacto Actual

**ALTO:**
- Respuestas pueden no guardarse correctamente si la estructura es incorrecta
- Errores SQL en lugar de validaciones claras
- Frontend puede estar enviando estructuras inconsistentes
- Logs de debug indican problema activo

### 4.2 Módulos Afectados

1. **Educational Module**
   - `ExercisesController.submitExercise()`
   - `ExercisesService`

2. **Progress Module**
   - `ExerciseAttemptService`
   - `ExerciseSubmissionService`

3. **Frontend** (fuera de scope Backend-Agent)
   - Todos los componentes de mecánicas que envían respuestas
   - Hooks de envío de ejercicios

---

## 5. RAÍZ DEL PROBLEMA

### 5.1 Desalineación Frontend-Backend

**Problema principal:** No hay un contrato claro (DTO) para el endpoint de submit.

**Evidencia:**
- Método usa `body: { ... }` con múltiples campos opcionales
- No hay DTO único que defina el contrato
- Frontend puede enviar cualquier combinación de campos
- Documentación Swagger no refleja la estructura real

### 5.2 Falta de Validación Pre-PostgreSQL

**Problema secundario:** Se confía completamente en PostgreSQL para validación.

**Consecuencias:**
- Errores crípticos desde SQL
- Difícil debug para frontend
- No hay early return para datos inválidos
- Consume recursos de BD innecesariamente

### 5.3 Validador Existente No Utilizado

**Problema terciario:** Se construyó `ExerciseAnswerValidator` pero nunca se integró.

**Evidencia:**
- Validador tiene logs de debug FE-061
- No hay imports de `ExerciseAnswerValidator` en el controller
- Comentarios indican que se construyó para resolver este problema
- Tests del validador existen (`exercise-answer.validator.spec.ts`)

---

## 6. POSIBLES SOLUCIONES

### 6.1 Opción A: Estandarizar con DTO Único (RECOMENDADA)

**Crear `SubmitExerciseDto`:**
```typescript
export class SubmitExerciseDto {
  @ApiProperty({ required: false, description: 'Usuario (deprecated, usar JWT)' })
  @IsOptional()
  @IsUUID()
  userId?: string;

  @ApiProperty({ description: 'Respuestas del ejercicio (estructura varía por tipo)' })
  @IsObject()
  @IsNotEmpty()
  answers!: Record<string, any>;

  @ApiProperty({ required: false, description: 'Timestamp de inicio' })
  @IsOptional()
  @IsNumber()
  startedAt?: number;

  @ApiProperty({ required: false, description: 'Cantidad de pistas usadas' })
  @IsOptional()
  @IsInt()
  @Min(0)
  hintsUsed?: number;

  @ApiProperty({ required: false, description: 'Comodines utilizados' })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  powerupsUsed?: string[];
}
```

**Ventajas:**
- Contrato claro y documentado
- Validación automática por NestJS
- Swagger generado correctamente
- Fácil evolución futura

**Desventajas:**
- Requiere cambios en frontend (si no cumple)
- Breaking change si se elimina compatibilidad con formato antiguo

### 6.2 Opción B: Normalización con Método Privado

**Implementar `normalizeAnswerStructure()`:**
```typescript
private normalizeAnswerStructure(
  body: any,
  exerciseType: string
): Record<string, any> {
  // Si viene en formato antiguo
  if (body.submitted_answers) {
    return body.submitted_answers;
  }

  // Si viene en formato nuevo
  if (body.answers) {
    // ¿Es anidado? Ej: {answers: {clues: {...}}}
    if (this.isNestedAnswerStructure(body.answers, exerciseType)) {
      return body.answers.answers; // Desanidar
    }
    return body.answers; // Ya es correcto
  }

  throw new BadRequestException('Missing answers field');
}
```

**Ventajas:**
- Mantiene compatibilidad con ambos formatos
- No requiere cambios en frontend inmediatos
- Centraliza lógica de normalización

**Desventajas:**
- Mantiene deuda técnica
- Más complejo de mantener

### 6.3 Opción C: Integrar Validación Existente

**Usar `ExerciseAnswerValidator` antes de PostgreSQL:**
```typescript
// Después de normalizar
const normalizedAnswers = this.normalizeAnswerStructure(body, exercise.exercise_type);

// Validar con class-validator
await ExerciseAnswerValidator.validate(
  exercise.exercise_type,
  normalizedAnswers
);

// Ahora sí, enviar a PostgreSQL
const validationResult = await this.dataSource.query(...);
```

**Ventajas:**
- Usa código ya existente y testeado
- Mensajes de error claros
- Early return para datos inválidos
- No requiere crear nuevo código de validación

**Desventajas:**
- Duplica validación (class-validator + PostgreSQL)
- Overhead de procesamiento (mínimo)

---

## 7. RECOMENDACIÓN

### 7.1 Solución Propuesta: HÍBRIDA (A + C)

**Fase 1: Estandarizar con DTO**
1. Crear `SubmitExerciseDto` con formato nuevo como estándar
2. Mantener compatibilidad temporal con formato antiguo
3. Actualizar Swagger

**Fase 2: Normalizar e Integrar Validación**
1. Implementar `normalizeAnswerStructure()`
2. Integrar `ExerciseAnswerValidator.validate()`
3. Mejorar mensajes de error

**Fase 3: Deprecar Formato Antiguo**
1. Marcar campos antiguos como `@deprecated` en DTO
2. Logging cuando se use formato antiguo
3. Coordinar con Frontend-Agent para migración

**Fase 4: Cleanup**
1. Eliminar soporte para formato antiguo
2. Remover logs de debug FE-061
3. Simplificar lógica

### 7.2 Justificación

- **No rompe frontend actual** (mantiene compatibilidad)
- **Mejora validación inmediatamente** (usa validador existente)
- **Documenta contrato** (DTO + Swagger)
- **Ruta clara de migración** (4 fases bien definidas)
- **Reusa código existente** (ExerciseAnswerValidator)

---

## 8. DEPENDENCIAS Y DELEGACIONES

### 8.1 Cambios en Backend (Backend-Agent - YO)
- ✅ Crear `SubmitExerciseDto`
- ✅ Implementar normalización
- ✅ Integrar validador
- ✅ Actualizar Swagger
- ✅ Escribir tests

### 8.2 Cambios en Frontend (DELEGAR a Frontend-Agent)
```markdown
## Delegación a Frontend-Agent

**Contexto:** Backend estandarizó estructura de envío de respuestas de ejercicios

**Endpoint actualizado:** POST /api/v1/educational/exercises/:id/submit

**Estructura esperada (nueva):**
{
  answers: { clues: {...} },  // Estructura varía por tipo
  startedAt: number,
  hintsUsed: number,
  powerupsUsed: string[]
}

**Compatibilidad:** Backend sigue aceptando formato antiguo temporalmente

**Pendiente:**
1. Verificar que todos los componentes de mecánicas envíen estructura correcta
2. Unificar formato en todos los hooks de envío
3. Eliminar campos deprecated (userId, submitted_answers)
4. Actualizar tests de integración

**Fecha límite migración:** [A definir]
```

### 8.3 Sin Cambios en Base de Datos
- ❌ No requiere cambios en tablas
- ❌ No requiere cambios en funciones SQL
- ✅ PostgreSQL sigue siendo validador final

---

## 9. ESTIMACIÓN

**Complejidad:** Media
**Tiempo estimado:** 3-4 horas
**Riesgo:** Bajo (mantiene compatibilidad)

### 9.1 Desglose

| Tarea | Tiempo |
|-------|--------|
| Crear SubmitExerciseDto | 30 min |
| Implementar normalización | 45 min |
| Integrar validador | 30 min |
| Actualizar Swagger | 20 min |
| Escribir tests unitarios | 60 min |
| Validar con tests e2e | 30 min |
| Documentación | 30 min |

**Total:** ~3.5 horas

---

## 10. PRÓXIMOS PASOS

1. ✅ **Análisis completado** (este documento)
2. ⏭️ **Crear plan de implementación** (02-PLAN.md)
3. ⏭️ **Implementar cambios**
4. ⏭️ **Ejecutar tests**
5. ⏭️ **Actualizar documentación**
6. ⏭️ **Delegar a Frontend-Agent**

---

**Análisis completado por:** Backend-Agent
**Fecha:** 2025-11-28
**Revisión requerida:** No (P0 - Proceder directamente a implementación)
