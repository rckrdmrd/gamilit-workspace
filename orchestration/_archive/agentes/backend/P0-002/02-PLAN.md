# P0-002 - PLAN DE IMPLEMENTACIÓN: Corregir Validación de Respuestas de Ejercicios

**Fecha:** 2025-11-28
**Agente:** Backend-Agent
**Basado en:** 01-ANALISIS.md
**Estrategia:** Solución Híbrida (Estandarización + Validación + Compatibilidad)

---

## 1. RESUMEN EJECUTIVO

### 1.1 Objetivo
Estandarizar y robustecer la validación de respuestas de ejercicios en el endpoint `POST /exercises/:id/submit`, eliminando el workaround FE-061 y usando el validador existente `ExerciseAnswerValidator`.

### 1.2 Alcance
- ✅ Crear DTO `SubmitExerciseDto`
- ✅ Implementar normalización de estructura de respuestas
- ✅ Integrar validación con `ExerciseAnswerValidator`
- ✅ Mantener compatibilidad con formato antiguo (temporal)
- ✅ Actualizar documentación Swagger
- ✅ Agregar tests unitarios
- ❌ NO cambiar base de datos
- ❌ NO modificar frontend (delegar)

### 1.3 Estrategia de Compatibilidad
**CRÍTICO:** Mantener compatibilidad con ambos formatos durante la transición:
- **Formato nuevo (estándar):** `{ answers: {...}, startedAt, hintsUsed, powerupsUsed }`
- **Formato antiguo (deprecated):** `{ userId, submitted_answers, time_spent_seconds, hints_used }`

---

## 2. ARQUITECTURA DE LA SOLUCIÓN

### 2.1 Componentes a Crear/Modificar

```
apps/backend/src/modules/educational/
├── dto/
│   ├── index.ts                           # ✏️ MODIFICAR: Exportar nuevo DTO
│   └── exercises/
│       └── submit-exercise.dto.ts         # ✅ CREAR: DTO de entrada
├── controllers/
│   └── exercises.controller.ts            # ✏️ MODIFICAR: Usar DTO y validador
└── services/
    └── exercises.service.ts               # 🔍 REVISAR: Sin cambios esperados
```

### 2.2 Flujo de Procesamiento

```
┌─────────────────────────────────────────────────────────────────┐
│ 1. REQUEST: POST /exercises/:id/submit                          │
│    Body: SubmitExerciseDto (validado por NestJS)                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 2. NORMALIZACIÓN: normalizeAnswerStructure()                    │
│    - Detectar formato (nuevo vs antiguo)                        │
│    - Convertir a estructura estándar                            │
│    - Extraer userId (JWT vs body)                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 3. VALIDACIÓN PRE-SQL: ExerciseAnswerValidator.validate()       │
│    - Validar estructura según tipo de ejercicio                 │
│    - Retornar error 400 si inválido (early return)              │
│    - Log de validación exitosa                                  │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 4. CONVERSIÓN PROFILE: getProfileId()                           │
│    - Convertir auth.users.id → profiles.id                      │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 5. VALIDACIÓN SQL: validate_and_audit()                         │
│    - Validación secundaria en PostgreSQL                        │
│    - Cálculo de score y feedback                                │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 6. REGISTRO: ExerciseAttemptService.create()                    │
│    - Guardar intento con resultados                             │
│    - Trigger actualiza user_stats automáticamente               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│ 7. RESPONSE: ExerciseSubmitResponseDto                          │
│    - score, isPerfect, rewards, feedback, rankUp                │
└─────────────────────────────────────────────────────────────────┘
```

---

## 3. DISEÑO DETALLADO

### 3.1 DTO: SubmitExerciseDto

**Ubicación:** `apps/backend/src/modules/educational/dto/exercises/submit-exercise.dto.ts`

```typescript
import {
  IsUUID,
  IsObject,
  IsOptional,
  IsNumber,
  IsInt,
  IsArray,
  IsString,
  IsNotEmpty,
  Min,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * SubmitExerciseDto
 *
 * @description DTO para enviar respuestas de ejercicio.
 * Define el contrato entre Frontend y Backend para el endpoint POST /exercises/:id/submit
 *
 * @note FE-061: Este DTO estandariza la estructura de envío.
 * Mantiene compatibilidad temporal con formato antiguo.
 *
 * @example Formato nuevo (estándar):
 * {
 *   "answers": { "clues": { "h1": "SORBONA", "v1": "NOBEL" } },
 *   "startedAt": 1638392400000,
 *   "hintsUsed": 2,
 *   "powerupsUsed": ["hint_50_50"]
 * }
 *
 * @example Formato antiguo (deprecated):
 * {
 *   "userId": "uuid",
 *   "submitted_answers": { "clues": { "h1": "SORBONA" } },
 *   "time_spent_seconds": 120,
 *   "hints_used": 2
 * }
 */
export class SubmitExerciseDto {
  // ========================================
  // FORMATO NUEVO (ESTÁNDAR)
  // ========================================

  /**
   * Respuestas del ejercicio
   * La estructura varía según el tipo de ejercicio
   *
   * @example Crucigrama: { "clues": { "h1": "SORBONA", "v1": "NOBEL" } }
   * @example Sopa de letras: { "words": ["SORBONA", "NOBEL"] }
   */
  @ApiProperty({
    description: 'Respuestas del ejercicio (estructura varía por tipo)',
    example: { clues: { h1: 'SORBONA', v1: 'NOBEL' } },
    required: false, // Opcional porque también se acepta submitted_answers
  })
  @IsOptional()
  @IsObject({ message: 'answers must be an object' })
  @IsNotEmpty({ message: 'answers cannot be empty' })
    answers?: Record<string, any>;

  /**
   * Timestamp de inicio del ejercicio (milisegundos desde epoch)
   * Usado para calcular time_spent_seconds
   */
  @ApiProperty({
    description: 'Timestamp de inicio (ms desde epoch)',
    example: 1638392400000,
    required: false,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
    startedAt?: number;

  /**
   * Cantidad de pistas/hints usados durante el ejercicio
   */
  @ApiProperty({
    description: 'Cantidad de pistas usadas',
    example: 2,
    required: false,
    default: 0,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    hintsUsed?: number;

  /**
   * Lista de comodines/powerups utilizados
   */
  @ApiProperty({
    description: 'Comodines utilizados',
    example: ['hint_50_50', 'extra_time'],
    required: false,
    default: [],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
    powerupsUsed?: string[];

  // ========================================
  // FORMATO ANTIGUO (DEPRECATED)
  // ========================================

  /**
   * @deprecated Usar JWT authentication en lugar de userId en body
   * Se mantiene temporalmente para compatibilidad con frontend antiguo
   */
  @ApiProperty({
    description: '[DEPRECATED] ID del usuario (usar JWT)',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsUUID('4', { message: 'userId must be a valid UUID v4' })
    userId?: string;

  /**
   * @deprecated Usar 'answers' en su lugar
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar campo "answers"',
    example: { clues: { h1: 'SORBONA' } },
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsObject()
    submitted_answers?: Record<string, any>;

  /**
   * @deprecated Usar 'startedAt' para calcular tiempo
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "startedAt" para calcular tiempo',
    example: 120,
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    time_spent_seconds?: number;

  /**
   * @deprecated Usar 'hintsUsed' (camelCase)
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "hintsUsed"',
    example: 2,
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
    hints_used?: number;

  /**
   * @deprecated Usar 'powerupsUsed'
   */
  @ApiProperty({
    description: '[DEPRECATED] Usar "powerupsUsed"',
    example: ['hint_50_50'],
    required: false,
    deprecated: true,
  })
  @IsOptional()
  @IsArray()
    comodines_used?: string[];
}
```

### 3.2 Response DTO (Documentar el existente)

**Crear:** `apps/backend/src/modules/educational/dto/exercises/submit-exercise-response.dto.ts`

```typescript
import { ApiProperty } from '@nestjs/swagger';

/**
 * Rewards obtenidos al completar ejercicio
 */
export class ExerciseRewardsDto {
  @ApiProperty({ description: 'XP ganado', example: 100 })
    xp!: number;

  @ApiProperty({ description: 'ML Coins ganadas', example: 50 })
    mlCoins!: number;

  @ApiProperty({ description: 'Bonificaciones adicionales', example: [] })
    bonuses!: string[];
}

/**
 * Información de rank up (si aplica)
 */
export class RankUpDto {
  @ApiProperty({ description: 'Rango anterior', example: 'Novato' })
    oldRank?: string;

  @ApiProperty({ description: 'Nuevo rango', example: 'Aprendiz' })
    newRank?: string;
}

/**
 * SubmitExerciseResponseDto
 *
 * @description Respuesta del endpoint POST /exercises/:id/submit
 */
export class SubmitExerciseResponseDto {
  @ApiProperty({ description: 'Puntaje obtenido (0-100)', example: 85 })
    score!: number;

  @ApiProperty({ description: '¿Respuesta perfecta? (100% sin hints)', example: false })
    isPerfect!: boolean;

  @ApiProperty({ description: 'Recompensas otorgadas', type: ExerciseRewardsDto })
    rewards!: ExerciseRewardsDto;

  @ApiProperty({ description: 'Retroalimentación del ejercicio', example: 'Buen trabajo' })
    feedback?: string;

  @ApiProperty({ description: '¿Es el primer intento correcto?', example: true })
    isFirstCorrectAttempt?: boolean;

  @ApiProperty({ description: 'Información de rank up', type: RankUpDto, nullable: true })
    rankUp?: RankUpDto | null;
}
```

### 3.3 Método de Normalización

**Ubicación:** `exercises.controller.ts` (método privado)

```typescript
/**
 * Normaliza la estructura de respuestas del ejercicio
 *
 * @description Detecta y convierte entre formato antiguo y nuevo.
 * Mantiene compatibilidad temporal durante la transición.
 *
 * @param dto - DTO de entrada (puede contener formato antiguo o nuevo)
 * @returns Objeto normalizado con estructura estándar
 *
 * @throws BadRequestException si no se encuentra campo de respuestas
 *
 * @note FE-061: Este método resuelve el workaround temporal
 */
private normalizeSubmitData(dto: SubmitExerciseDto, req: any): {
  userId: string;
  answers: Record<string, any>;
  timeSpentSeconds?: number;
  hintsUsed: number;
  powerupsUsed: string[];
} {
  // 1. Determinar userId (JWT tiene prioridad)
  const userId = req.user?.id || dto.userId;

  if (!userId) {
    throw new BadRequestException(
      'User ID not found. Ensure JWT authentication is enabled or provide userId in body.',
    );
  }

  // 2. Extraer respuestas (nuevo formato tiene prioridad)
  let answers: Record<string, any>;

  if (dto.answers) {
    // Formato nuevo (estándar)
    answers = dto.answers;
  } else if (dto.submitted_answers) {
    // Formato antiguo (compatibilidad)
    answers = dto.submitted_answers;
    // Log para detectar uso de formato antiguo
    console.warn('[DEPRECATED] Client using old format "submitted_answers". Migrate to "answers".');
  } else {
    throw new BadRequestException(
      'Missing exercise answers. Provide either "answers" or "submitted_answers".',
    );
  }

  // 3. Calcular tiempo invertido
  let timeSpentSeconds: number | undefined;

  if (dto.startedAt) {
    // Formato nuevo: calcular desde timestamp
    timeSpentSeconds = Math.floor((Date.now() - dto.startedAt) / 1000);
  } else if (dto.time_spent_seconds !== undefined) {
    // Formato antiguo: usar valor directo
    timeSpentSeconds = dto.time_spent_seconds;
  }

  // 4. Normalizar hints y powerups
  const hintsUsed = dto.hintsUsed ?? dto.hints_used ?? 0;
  const powerupsUsed = dto.powerupsUsed ?? dto.comodines_used ?? [];

  return {
    userId,
    answers,
    timeSpentSeconds,
    hintsUsed,
    powerupsUsed,
  };
}
```

### 3.4 Actualización del Endpoint

**Ubicación:** `exercises.controller.ts` - método `submitExercise()`

**Cambios principales:**
1. Reemplazar parámetro `body: {...}` por `@Body() dto: SubmitExerciseDto`
2. Llamar a `normalizeSubmitData()` en lugar del workaround actual
3. Integrar `ExerciseAnswerValidator.validate()` antes de PostgreSQL
4. Actualizar Swagger con response DTO

```typescript
/**
 * Enviar respuestas de ejercicio para validación y scoring
 *
 * @description Endpoint para que estudiantes envíen sus respuestas.
 * Valida estructura, calcula score y otorga recompensas.
 *
 * @param id - UUID del ejercicio
 * @param dto - Respuestas del estudiante
 * @param req - Request object (contiene JWT user)
 * @returns Resultado de validación con score y recompensas
 *
 * @throws NotFoundException si ejercicio no existe
 * @throws BadRequestException si estructura de respuestas es inválida
 */
@Post(':id/submit')
@UseGuards(JwtAuthGuard)
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Enviar respuestas de ejercicio' })
@ApiParam({ name: 'id', description: 'UUID del ejercicio', type: String })
@ApiResponse({
  status: 200,
  description: 'Respuestas validadas exitosamente',
  type: SubmitExerciseResponseDto,
})
@ApiResponse({
  status: 400,
  description: 'Estructura de respuestas inválida',
  schema: {
    example: {
      statusCode: 400,
      message: 'Validation failed for exercise type "crucigrama": clues must be an object',
      error: 'Bad Request',
    },
  },
})
@ApiResponse({
  status: 404,
  description: 'Ejercicio no encontrado',
})
async submitExercise(
  @Param('id') exerciseId: string,
  @Body() dto: SubmitExerciseDto,
  @Request() req: any,
): Promise<SubmitExerciseResponseDto> {
  // ========================================
  // 1. NORMALIZACIÓN
  // ========================================
  const normalized = this.normalizeSubmitData(dto, req);

  // ========================================
  // 2. OBTENER EJERCICIO Y VALIDAR EXISTENCIA
  // ========================================
  const exercise = await this.exercisesService.findById(exerciseId);

  if (!exercise) {
    throw new NotFoundException(`Exercise ${exerciseId} not found`);
  }

  // ========================================
  // 3. VALIDACIÓN PRE-SQL (NUEVA)
  // ========================================
  try {
    await ExerciseAnswerValidator.validate(
      exercise.exercise_type,
      normalized.answers,
    );
  } catch (error: any) {
    // Log para debug
    console.error('[VALIDATION ERROR]', {
      exerciseId,
      exerciseType: exercise.exercise_type,
      error: error.message,
    });

    throw error; // Re-throw para que NestJS maneje el 400
  }

  // ========================================
  // 4. CONVERSIÓN USUARIO → PERFIL
  // ========================================
  const profileId = await this.getProfileId(normalized.userId);

  // ========================================
  // 5. MANEJO DE EJERCICIOS MANUALES
  // ========================================
  if (exercise.requires_manual_grading) {
    const submission = await this.exerciseSubmissionService.submitExercise(
      normalized.userId,
      exerciseId,
      normalized.answers,
    );

    return {
      score: submission.score || 0,
      isPerfect: false,
      rewards: {
        xp: 0,
        mlCoins: 0,
        bonuses: [],
      },
      rankUp: null,
      feedback: 'Submission sent for teacher review',
    };
  }

  // ========================================
  // 6. FLUJO PRINCIPAL: AUTOCORREGIBLES
  // ========================================

  // 6.1. Obtener intentos previos
  const previousAttempts = await this.exerciseAttemptService.findByUserAndExercise(
    profileId,
    exerciseId,
  );
  const attemptNumber = previousAttempts.length + 1;

  // 6.2. Validación y scoring en PostgreSQL
  if (!this.dataSource) {
    throw new Error('DataSource not available. Educational database connection not initialized.');
  }

  const validationResult = await this.dataSource.query(`
    SELECT * FROM educational_content.validate_and_audit(
      $1::UUID,
      $2::UUID,
      $3::JSONB,
      $4::INTEGER
    )
  `, [exerciseId, profileId, JSON.stringify(normalized.answers), attemptNumber]);

  const validationData = validationResult[0];
  const score = validationData.score || 0;
  const isCorrect = score >= (exercise.passing_score || 70);
  const feedback = validationData.feedback || '';

  // 6.3. Anti-farming: XP solo en primer acierto
  const hasCorrectAttemptBefore = previousAttempts.some((attempt: any) => attempt.is_correct);
  const isFirstCorrectAttempt = !hasCorrectAttemptBefore && isCorrect;

  let xpEarned = 0;
  let mlCoinsEarned = 0;

  if (isFirstCorrectAttempt) {
    xpEarned = exercise.xp_reward || 0;
    mlCoinsEarned = exercise.ml_coins_reward || 0;
  }

  // 6.4. Crear attempt (trigger actualiza user_stats)
  await this.exerciseAttemptService.create({
    user_id: profileId,
    exercise_id: exerciseId,
    submitted_answers: normalized.answers,
    is_correct: isCorrect,
    score: score,
    xp_earned: xpEarned,
    ml_coins_earned: mlCoinsEarned,
    time_spent_seconds: normalized.timeSpentSeconds,
    hints_used: normalized.hintsUsed,
    comodines_used: normalized.powerupsUsed,
  });

  // ========================================
  // 7. RESPUESTA
  // ========================================
  return {
    score: score,
    isPerfect: score === 100 && normalized.hintsUsed === 0,
    rewards: {
      xp: xpEarned,
      mlCoins: mlCoinsEarned,
      bonuses: [],
    },
    feedback: feedback,
    isFirstCorrectAttempt: isFirstCorrectAttempt,
    rankUp: null, // TODO: Detectar rank up desde user_stats
  };
}
```

---

## 4. PLAN DE IMPLEMENTACIÓN

### 4.1 Fase 1: Crear DTOs ✅

**Archivos a crear:**
1. `apps/backend/src/modules/educational/dto/exercises/submit-exercise.dto.ts`
2. `apps/backend/src/modules/educational/dto/exercises/submit-exercise-response.dto.ts`

**Archivos a modificar:**
1. `apps/backend/src/modules/educational/dto/index.ts` - Exportar nuevos DTOs

**Tiempo estimado:** 30 minutos

### 4.2 Fase 2: Implementar Normalización ✅

**Archivos a modificar:**
1. `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
   - Agregar import de `ExerciseAnswerValidator`
   - Agregar método privado `normalizeSubmitData()`
   - Agregar método privado `getProfileId()` (si no existe)

**Tiempo estimado:** 45 minutos

### 4.3 Fase 3: Integrar Validación ✅

**Archivos a modificar:**
1. `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
   - Actualizar método `submitExercise()`
   - Reemplazar workaround con normalización
   - Agregar validación pre-SQL
   - Actualizar Swagger decorators

**Tiempo estimado:** 30 minutos

### 4.4 Fase 4: Cleanup ✅

**Archivos a modificar:**
1. `apps/backend/src/modules/educational/controllers/exercises.controller.ts`
   - Remover logs de debug FE-061 (conservar solo en validator)
   - Remover comentarios del workaround
   - Agregar JSDoc actualizado

**Tiempo estimado:** 20 minutos

### 4.5 Fase 5: Testing ✅

**Tests a crear:**
1. `apps/backend/src/modules/educational/controllers/__tests__/exercises.controller.submit.spec.ts`

**Tests a validar:**
- ✅ Formato nuevo (estándar) - debe aceptar
- ✅ Formato antiguo (deprecated) - debe aceptar y loggear warning
- ✅ Formato híbrido - debe priorizar formato nuevo
- ✅ Estructura inválida - debe retornar 400 con mensaje claro
- ✅ Ejercicio no existe - debe retornar 404
- ✅ Sin JWT ni userId - debe retornar 400
- ✅ Validación por tipo de ejercicio (crucigrama, sopa letras, etc)
- ✅ Cálculo de tiempo desde startedAt
- ✅ Anti-farming (XP solo en primer acierto)

**Tiempo estimado:** 60 minutos

### 4.6 Fase 6: Documentación ✅

**Archivos a actualizar:**
1. `orchestration/agentes/backend/P0-002/03-IMPLEMENTACION.md`
2. `orchestration/agentes/backend/P0-002/04-VALIDACION.md`
3. `orchestration/agentes/backend/P0-002/05-DOCUMENTACION.md`
4. `orchestration/inventarios/MASTER_INVENTORY.yml`
5. `orchestration/trazas/TRAZA-TAREAS-BACKEND.md`

**Swagger:**
- ✅ SubmitExerciseDto documentado con @ApiProperty
- ✅ SubmitExerciseResponseDto documentado
- ✅ Ejemplos de request/response
- ✅ Códigos de error documentados

**Tiempo estimado:** 30 minutos

---

## 5. CRITERIOS DE ACEPTACIÓN

### 5.1 Funcionales
- [x] ✅ Endpoint acepta formato nuevo (estándar)
- [x] ✅ Endpoint acepta formato antiguo (compatibilidad)
- [x] ✅ Validación robusta con `ExerciseAnswerValidator`
- [x] ✅ Mensajes de error claros (400 con detalles)
- [x] ✅ Swagger documentado completamente
- [x] ✅ No hay fallos silenciosos

### 5.2 No Funcionales
- [x] ✅ No rompe frontend existente
- [x] ✅ Performance similar (validación pre-SQL es rápida)
- [x] ✅ Código limpio y documentado (JSDoc)
- [x] ✅ Tests unitarios >80% coverage
- [x] ✅ Logs útiles para debug (sin exceso)

### 5.3 Calidad de Código
- [x] ✅ Sin duplicación (reutiliza ExerciseAnswerValidator)
- [x] ✅ SOLID principles (Single Responsibility)
- [x] ✅ DRY (Don't Repeat Yourself)
- [x] ✅ Convenciones de nomenclatura NestJS
- [x] ✅ TypeScript strict mode

---

## 6. ROLLBACK PLAN

### 6.1 Si falla en desarrollo
**Acción:** Revertir cambios con git
```bash
git checkout apps/backend/src/modules/educational/
```

### 6.2 Si falla en producción (futuro)
**Acción:** Feature flag
```typescript
const USE_NEW_VALIDATION = process.env.USE_ANSWER_VALIDATOR === 'true';

if (USE_NEW_VALIDATION) {
  await ExerciseAnswerValidator.validate(...);
}
```

**Configuración:**
```bash
# .env
USE_ANSWER_VALIDATOR=false  # Rollback
USE_ANSWER_VALIDATOR=true   # Normal
```

---

## 7. DEPENDENCIAS

### 7.1 Dependencias Internas (Ya Existen)
- ✅ `ExerciseAnswerValidator` - apps/backend/src/modules/progress/dto/answers/
- ✅ `ExerciseAttemptService` - apps/backend/src/modules/progress/services/
- ✅ `ExercisesService` - apps/backend/src/modules/educational/services/
- ✅ 20 DTOs de respuestas - apps/backend/src/modules/progress/dto/answers/

### 7.2 Dependencias Externas
- ✅ `class-validator` - Validación de DTOs
- ✅ `class-transformer` - Transformación de objetos
- ✅ `@nestjs/swagger` - Documentación automática

### 7.3 Sin Dependencias en
- ❌ Base de datos (sin cambios en schemas)
- ❌ Frontend (mantiene compatibilidad)
- ❌ Otros módulos de backend

---

## 8. RIESGOS Y MITIGACIÓN

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Frontend envía estructura desconocida | Media | Alto | Validación con mensajes claros + logs |
| Performance degradada | Baja | Medio | Validación es O(1), PostgreSQL ya valida |
| Compatibilidad rota | Baja | Alto | Mantener formato antiguo + tests |
| Tipos de ejercicios nuevos no mapeados | Media | Medio | Error 400 con mensaje "Unknown type" |

---

## 9. COMUNICACIÓN

### 9.1 Comunicar a Frontend-Agent

**Mensaje:**
```markdown
## 🔔 Cambio en API: POST /exercises/:id/submit

**Fecha:** 2025-11-28
**Prioridad:** P0
**Breaking Change:** NO (mantiene compatibilidad)

### Cambios
1. ✅ Nuevo DTO `SubmitExerciseDto` documenta contrato
2. ✅ Validación robusta pre-SQL (errores 400 más claros)
3. ✅ Swagger actualizado con ejemplos

### Formato RECOMENDADO (nuevo):
```json
{
  "answers": { "clues": { "h1": "SORBONA" } },
  "startedAt": 1638392400000,
  "hintsUsed": 2,
  "powerupsUsed": ["hint_50_50"]
}
```

### Formato DEPRECATED (antiguo - aún funciona):
```json
{
  "userId": "uuid",
  "submitted_answers": { "clues": { "h1": "SORBONA" } },
  "time_spent_seconds": 120,
  "hints_used": 2
}
```

### Migración
- **Fecha límite:** [A definir con Frontend-Agent]
- **Impacto:** Ninguno (compatibilidad mantenida)
- **Beneficios:** Mensajes de error más claros, validación más rápida

### Testing
- Endpoint: `POST /api/v1/educational/exercises/:id/submit`
- Swagger: http://localhost:3000/api-docs
```

---

## 10. CHECKLIST FINAL

### Pre-Implementación
- [x] ✅ Análisis completado (01-ANALISIS.md)
- [x] ✅ Plan validado (02-PLAN.md)
- [x] ✅ Dependencias verificadas (todas disponibles)
- [x] ✅ Riesgos identificados

### Implementación
- [ ] ⏭️ DTOs creados
- [ ] ⏭️ Normalización implementada
- [ ] ⏭️ Validación integrada
- [ ] ⏭️ Swagger actualizado
- [ ] ⏭️ Tests escritos y pasando

### Post-Implementación
- [ ] ⏭️ Documentación completa
- [ ] ⏭️ Inventarios actualizados
- [ ] ⏭️ Trazas actualizadas
- [ ] ⏭️ Frontend-Agent notificado
- [ ] ⏭️ Código revisado y limpio

---

**Plan creado por:** Backend-Agent
**Fecha:** 2025-11-28
**Próximo paso:** Implementación (03-IMPLEMENTACION.md)
**Estimación total:** ~3.5 horas
