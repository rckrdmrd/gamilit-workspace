---
id: "TASK-TEST-M4-001"
title: "Tests unitarios para DTOs M4"
type: "Task"
status: "To Do"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-007"
parent_us: "US-M4-001"
estimated_hours: 2
labels: ["testing", "unit-tests", "dtos", "module-4"]
created_date: "2026-01-04"
updated_date: "2026-01-04"
---

# TASK-TEST-M4-001: Tests unitarios para DTOs M4

## Informacion General

| Campo | Valor |
|-------|-------|
| **ID** | TASK-TEST-M4-001 |
| **US Padre** | US-M4-001 |
| **Epic** | EAI-007 |
| **Tipo** | Testing |
| **Estimacion** | 2 horas |
| **Estado** | To Do |

---

## Descripcion

Crear tests unitarios para validar los 5 DTOs del Modulo 4.

---

## Casos de Prueba

### 1. VerificadorFakeNewsAnswerDto

| Caso | Input | Expected |
|------|-------|----------|
| Valid | `{ claims_verified: [{ claim_id: "c1", is_fake: true, evidence: "..." }] }` | Pass |
| Invalid - no evidence | `{ claims_verified: [{ claim_id: "c1", is_fake: true }] }` | Fail |
| Invalid - short evidence | `{ claims_verified: [{ claim_id: "c1", is_fake: true, evidence: "abc" }] }` | Fail |

### 2. InfografiaInteractivaAnswerDto

| Caso | Input | Expected |
|------|-------|----------|
| Valid | `{ answers: {}, sections_explored: ["s1"] }` | Pass |
| Invalid - empty sections | `{ answers: {}, sections_explored: [] }` | Fail |

### 3. QuizTikTokAnswerDto

| Caso | Input | Expected |
|------|-------|----------|
| Valid | `{ answers: [0, 1, 2] }` | Pass |
| Invalid - negative | `{ answers: [-1, 0] }` | Fail |
| Invalid - non-number | `{ answers: ["a"] }` | Fail |

### 4. NavegacionHipertextualAnswerDto

| Caso | Input | Expected |
|------|-------|----------|
| Valid | `{ path: ["p1", "p2"], information_found: {} }` | Pass |
| Invalid - single path | `{ path: ["p1"], information_found: {} }` | Fail |

### 5. AnalisisMemesAnswerDto

| Caso | Input | Expected |
|------|-------|----------|
| Valid | `{ annotations: [], analysis: { message: "test" } }` | Pass |
| Invalid - empty message | `{ annotations: [], analysis: { message: "" } }` | Fail |

---

## Estructura de Tests

```typescript
// apps/backend/src/modules/educational/dtos/__tests__/module4-dtos.spec.ts

describe('Module 4 DTOs', () => {
  describe('VerificadorFakeNewsAnswerDto', () => {
    it('should validate correct structure', async () => {...});
    it('should reject missing evidence', async () => {...});
    it('should reject short evidence', async () => {...});
  });

  // ... tests para cada DTO
});
```

---

## Criterios de Aceptacion

- [ ] 100% coverage de validaciones
- [ ] Tests para casos validos e invalidos
- [ ] Mensajes de error verificados
- [ ] Tests corriendo en CI/CD

---

## Referencias

- **US Padre:** [US-M4-001](../historias-usuario/US-M4-001-backend-dtos.md)
- **Tarea Backend:** [TASK-BE-M4-001](./TASK-BE-M4-001-dtos-m4.md)

---

**Creado:** 2026-01-04
**Extraido de:** US-M4-001
