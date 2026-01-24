---
id: "CORR-003-ANALISIS"
title: "Analisis Pre-Ejecucion - Error 400 ValidationError en Submit de Ejercicios"
type: "Analisis"
status: "Done"
priority: "P0"
assignee: "@Orquestador"
related_task: "CORR-003"
affected_modules: ["progress", "educational"]
labels: ["correccion", "backend", "validacion", "dtos"]
created_date: "2026-01-07"
updated_date: "2026-01-07"
---

# CORR-003: Analisis Pre-Ejecucion - Error 400 ValidationError en Submit de Ejercicios

## 1. CONTEXTO DE LA TAREA

### Solicitud Original
El usuario reporto error 400 (Bad Request) al enviar respuestas del ejercicio "Tribunal de Opiniones" (Modulo 3.1):

```
POST http://localhost:3006/api/v1/educational/exercises/9ec17209-2442-4ace-9c31-7c3f1e76bb07/submit 400 (Bad Request)
ValidationError: Validation failed for exercise type 'tribunal_opiniones':
```

### Objetivo
Identificar la causa raiz del error de validacion y corregir para que todos los ejercicios de Modulos 3, 4 y 5 funcionen correctamente.

### Modulos Afectados
- `apps/backend/src/modules/progress/dto/answers/` - DTOs de validacion
- `apps/backend/src/modules/educational/controllers/exercises.controller.ts` - Endpoint submit
- Frontend: Componentes de ejercicios Modulos 2, 3 (potencialmente afectados)

### Justificacion
- **Criticidad:** P0 - Los estudiantes no pueden completar ejercicios
- **Impacto:** Bloquea el flujo principal de la aplicacion
- **Alcance:** 9 tipos de ejercicio afectados

---

## 2. INVENTARIO ACTUAL

### Archivos del Flujo de Submit

| Archivo | Ubicacion | Proposito |
|---------|-----------|-----------|
| `ExercisePage.tsx` | `apps/frontend/src/apps/student/pages/` | Pagina contenedor de ejercicios |
| `progressAPI.ts` | `apps/frontend/src/features/progress/api/` | API client para submit |
| `exercises.controller.ts` | `apps/backend/src/modules/educational/controllers/` | Endpoint POST /submit |
| `exercise-answer.validator.ts` | `apps/backend/src/modules/progress/dto/answers/` | Validador central de respuestas |
| `tribunal-opiniones-answers.dto.ts` | `apps/backend/src/modules/progress/dto/answers/` | DTO especifico para tribunal_opiniones |

### DTOs de Respuestas Existentes

| DTO | Tipo Ejercicio | Modulo | Tiene Constructor |
|-----|----------------|--------|-------------------|
| `TribunalOpinionesAnswersDto` | tribunal_opiniones | 3.1 | SI - PROBLEMA |
| `MatrizPerspectivasAnswersDto` | matriz_perspectivas | 3.5 | SI - PROBLEMA |
| `AnalisisFuentesAnswersDto` | analisis_fuentes | 3.2 | NO - OK |
| `DebateDigitalAnswersDto` | debate_digital | 3.3 | NO - OK |
| `PodcastArgumentativoAnswersDto` | podcast_argumentativo | 3.4 | NO - OK |
| `DetectiveTextualAnswersDto` | detective_textual | 2.1 | SI - PROBLEMA |
| `ConstruccionHipotesisAnswersDto` | construccion_hipotesis | 2.2 | SI - PROBLEMA |
| `PrediccionNarrativaAnswersDto` | prediccion_narrativa | 2.3 | SI - PROBLEMA |
| `RuedaInferenciasAnswersDto` | rueda_inferencias | 2.5 | SI - PROBLEMA |
| `DetectiveConnectionsAnswersDto` | detective_connections | Aux | SI - PROBLEMA |
| `PredictionScenariosAnswersDto` | prediction_scenarios | Aux | SI - PROBLEMA |
| `CauseEffectMatchingAnswersDto` | cause_effect_matching | Aux | SI - PROBLEMA |

---

## 3. ANALISIS COMPARATIVO DETALLADO

### Flujo de Validacion Actual

```
Frontend (TribunalOpinionesExercise.tsx)
    |
    v
submitExercise(exerciseId, userId, answers)
    |
    v
progressAPI.ts → POST /api/v1/educational/exercises/:id/submit
    |
    v
exercises.controller.ts::submitExercise()
    |
    v
normalizeSubmitData() → Extrae 'answers' del body
    |
    v
ExerciseAnswerValidator.validate(exerciseType, answers)
    |
    v
plainToInstance(TribunalOpinionesAnswersDto, answers)  <-- PROBLEMA AQUI
    |
    v
validate(dto) → class-validator
    |
    v
ERROR: "evaluations array is required" (array vacio)
```

### Causa Raiz Identificada

**El problema esta en los constructores de los DTOs:**

```typescript
// ANTES - PROBLEMA
export class TribunalOpinionesAnswersDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StatementEvaluation)
  @IsNotEmpty({ message: 'evaluations array is required' })
  evaluations!: StatementEvaluation[];

  constructor() {
    this.evaluations = [];  // <-- SOBRESCRIBE LOS DATOS
  }
}
```

**Comportamiento de `class-transformer`:**

1. `plainToInstance()` crea una nueva instancia del DTO
2. El constructor se ejecuta e inicializa `evaluations = []`
3. Luego `class-transformer` intenta copiar las propiedades del objeto origen
4. **PERO el constructor ya sobrescribio con array vacio**
5. Validacion falla porque `evaluations` esta vacio

### Comparacion DTO Correcto vs Incorrecto

| Aspecto | DTO SIN Constructor (Correcto) | DTO CON Constructor (Incorrecto) |
|---------|-------------------------------|----------------------------------|
| Ejemplo | `AnalisisFuentesAnswersDto` | `TribunalOpinionesAnswersDto` |
| Transformacion | Datos se preservan | Datos se sobrescriben |
| Validacion | Pasa correctamente | Falla: "array is required" |
| class-transformer | Funciona como esperado | Constructor interfiere |

---

## 4. PROBLEMAS IDENTIFICADOS

| # | Problema | Severidad | Archivo |
|---|----------|-----------|---------|
| 1 | Constructor sobrescribe `evaluations = []` | P0 - CRITICAL | `tribunal-opiniones-answers.dto.ts` |
| 2 | Constructor sobrescribe `questions = {}` | P0 - CRITICAL | `matriz-perspectivas-answers.dto.ts` |
| 3 | Constructor sobrescribe `questions = {}` | P0 - CRITICAL | `detective-textual-answers.dto.ts` |
| 4 | Constructor sobrescribe `causes = {}` | P0 - CRITICAL | `construccion-hipotesis-answers.dto.ts` |
| 5 | Constructor sobrescribe `scenarios = {}` | P0 - CRITICAL | `prediccion-narrativa-answers.dto.ts` |
| 6 | Constructor sobrescribe `fragments = {}` | P0 - CRITICAL | `rueda-inferencias-answers.dto.ts` |
| 7 | Constructor sobrescribe `connections = []` | P0 - CRITICAL | `detective-connections-answers.dto.ts` |
| 8 | Constructor sobrescribe `scenarios = {}` | P0 - CRITICAL | `prediction-scenarios-answers.dto.ts` |
| 9 | Constructor sobrescribe `causes = {}` | P0 - CRITICAL | `cause-effect-matching-answers.dto.ts` |

---

## 5. ANALISIS DE IMPACTO

### Archivos a Modificar

| # | Archivo | Cambio | Lineas |
|---|---------|--------|--------|
| 1 | `tribunal-opiniones-answers.dto.ts` | Eliminar constructor (lineas 80-82) | -4 |
| 2 | `matriz-perspectivas-answers.dto.ts` | Eliminar constructor (lineas 28-30) | -4 |
| 3 | `detective-textual-answers.dto.ts` | Eliminar constructor (lineas 28-30) | -4 |
| 4 | `construccion-hipotesis-answers.dto.ts` | Eliminar constructor (lineas 28-30) | -4 |
| 5 | `prediccion-narrativa-answers.dto.ts` | Eliminar constructor (lineas 28-30) | -4 |
| 6 | `rueda-inferencias-answers.dto.ts` | Eliminar constructor (lineas 51-53) | -4 |
| 7 | `detective-connections-answers.dto.ts` | Eliminar constructor (lineas 59-61) | -4 |
| 8 | `prediction-scenarios-answers.dto.ts` | Eliminar constructor (lineas 32-34) | -4 |
| 9 | `cause-effect-matching-answers.dto.ts` | Eliminar constructor (lineas 32-34) | -4 |

**Total:** 9 archivos, -36 lineas

### Dependencias Verificadas

```bash
grep -r "new TribunalOpinionesAnswersDto" apps/backend/
# No matches found

grep -r "new MatrizPerspectivasAnswersDto" apps/backend/
# No matches found
```

**Resultado:** Ningun codigo instancia estos DTOs con `new`. Solo se usan via `plainToInstance()` en el validador. Es seguro eliminar los constructores.

### Ejercicios NO Afectados (Sin constructor)

- Modulo 4: Todos los 5 ejercicios (sin constructor)
- Modulo 5: Todos los 3 ejercicios (sin constructor)
- Modulo 3: `analisis_fuentes`, `debate_digital`, `podcast_argumentativo`
- Modulo 1: Todos los 7 ejercicios

---

## 6. DECISION DE APPROACH

### Approach Seleccionado: Eliminar Constructores

**Justificacion:**
1. Los constructores no son necesarios para DTOs de validacion
2. `class-transformer` funciona correctamente sin constructores
3. Cambio minimo (solo eliminar 4 lineas por archivo)
4. Sin riesgo de regresion (verificado que no hay `new DtoClass()`)

### Alternativas Descartadas

| Alternativa | Razon de Rechazo |
|-------------|------------------|
| Usar `@Exclude()` decorator | No resuelve el problema del constructor |
| Modificar validador | Cambio mas invasivo, mayor riesgo |
| Usar factory pattern | Sobre-ingenieria para este caso |

---

## 7. NECESIDAD DE SUBAGENTES

### Criterios de Complejidad

| Criterio | Evaluacion |
|----------|------------|
| Numero de archivos | 9 archivos (umbral: >5) |
| Cambios en BD | NO |
| Cambios en Frontend | NO |
| Cambios en Backend | SI (solo DTOs) |
| Complejidad del cambio | BAJA (solo eliminar lineas) |

### Decision

**NO se requieren subagentes.** El cambio es simple (eliminar constructores) y puede ejecutarse directamente por el orquestador.

---

## 8. ESTIMACIONES

| Concepto | Estimacion |
|----------|------------|
| Archivos a modificar | 9 |
| Lineas a eliminar | 36 |
| Riesgo | BAJO |
| Validacion post-cambio | Compilacion TypeScript |

---

## 9. CONCLUSION DEL ANALISIS

### Resumen

El error 400 ValidationError en el submit de ejercicios se debe a que **9 DTOs de respuestas tienen constructores que inicializan arrays/objetos vacios**, lo cual sobrescribe los datos reales durante la transformacion con `class-transformer`.

### Solucion

Eliminar los constructores de los 9 DTOs afectados. Esto permite que `plainToInstance()` funcione correctamente y preserve los datos del frontend.

### Aprobacion

- [x] Analisis completado
- [x] Causa raiz identificada
- [x] Solucion validada
- [x] Dependencias verificadas
- [x] Listo para ejecucion

---

**Fecha:** 2026-01-07
**Autor:** Claude Code (Orchestrator Agent)
**Version:** 1.0
