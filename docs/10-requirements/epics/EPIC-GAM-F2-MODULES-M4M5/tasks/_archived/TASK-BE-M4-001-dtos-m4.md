---
id: "TASK-BE-M4-001"
title: "Crear DTOs para Modulo 4"
type: "Task"
status: "To Do"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-007"
parent_us: "US-M4-001"
estimated_hours: 4
labels: ["backend", "dtos", "module-4", "validation"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# TASK-BE-M4-001: Crear DTOs para Modulo 4

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | TASK-BE-M4-001 |
| **US Padre** | US-M4-001 |
| **Epic** | EAI-007 |
| **Tipo** | Backend Development |
| **Estimacion** | 4 horas |
| **Estado** | To Do |

---

## Descripcion

Crear los 5 DTOs de validacion para los tipos de ejercicio del Modulo 4 (Lectura Digital y Multimodal).

---

## Subtareas

| ID | Descripcion | Estado |
|----|-------------|--------|
| BE-M4-001.1 | Crear VerificadorFakeNewsAnswerDto | To Do |
| BE-M4-001.2 | Crear InfografiaInteractivaAnswerDto | To Do |
| BE-M4-001.3 | Crear QuizTikTokAnswerDto | To Do |
| BE-M4-001.4 | Crear NavegacionHipertextualAnswerDto | To Do |
| BE-M4-001.5 | Crear AnalisisMemesAnswerDto | To Do |

---

## Especificaciones Tecnicas

### DTO 1: VerificadorFakeNewsAnswerDto

```typescript
interface ClaimVerification {
  claim_id: string;
  is_fake: boolean;
  evidence: string; // min 10 chars
}

class VerificadorFakeNewsAnswerDto extends BaseExerciseAnswerDto {
  @IsArray()
  @ValidateNested({ each: true })
  claims_verified: ClaimVerification[];
}
```

### DTO 2: InfografiaInteractivaAnswerDto

```typescript
class InfografiaInteractivaAnswerDto extends BaseExerciseAnswerDto {
  @IsObject()
  answers: Record<string, any>;

  @IsArray()
  @ArrayMinSize(1)
  sections_explored: string[];
}
```

### DTO 3: QuizTikTokAnswerDto

```typescript
class QuizTikTokAnswerDto extends BaseExerciseAnswerDto {
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(0, { each: true })
  answers: number[];
}
```

### DTO 4: NavegacionHipertextualAnswerDto

```typescript
class NavegacionHipertextualAnswerDto extends BaseExerciseAnswerDto {
  @IsArray()
  @ArrayMinSize(2)
  path: string[];

  @IsObject()
  information_found: Record<string, any>;
}
```

### DTO 5: AnalisisMemesAnswerDto

```typescript
class AnalisisMemesAnswerDto extends BaseExerciseAnswerDto {
  @IsArray()
  annotations: MemeAnnotation[];

  @IsObject()
  @IsNotEmpty()
  analysis: { message: string };
}
```

---

## Criterios de Aceptacion

- [ ] Todos los DTOs heredan de BaseExerciseAnswerDto
- [ ] Validacion con class-validator decorators
- [ ] Documentacion Swagger para cada DTO
- [ ] Archivos en `apps/backend/src/modules/educational/dtos/`

---

## Referencias

- **US Padre:** [US-M4-001](../../user-stories/US-M4-001/US-M4-001-backend-dtos.md)
- **Validador SQL:** `validate_module4_module5_answer()`
- **Schema BD:** `educational_content.exercises`

---

**Creado:** 2026-01-04
**Extraido de:** US-M4-001
