---
id: "US-M4-001"
title: "Backend DTOs para Modulo 4"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent"
epic: "EAI-007"
story_points: 5
budget: "5 horas"
sprint: "Sprint-7"
labels: ["backend", "dtos", "module-4", "validation"]
created_date: "2025-12-05"
updated_date: "2026-01-04"
---

# US-M4-001: Backend DTOs para Modulo 4

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-M4-001 |
| **Epica** | EAI-007 - Modulos 4 y 5 |
| **Modulo** | educational, progress |
| **Prioridad** | P0 |
| **Story Points** | 5 |
| **Sprint** | Sprint 7 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** desarrollador backend,
**quiero** crear DTOs de respuesta para los 5 tipos de ejercicio del Modulo 4,
**para** validar correctamente las respuestas de los estudiantes y procesarlas en el flujo de revision manual.

### Descripcion Detallada

El Modulo 4 "Lectura Digital y Multimodal" comprende 5 tipos de ejercicios que requieren DTOs especificos para validar la estructura de las respuestas antes de enviarlas a revision manual por docentes.

**Tipos de ejercicio:**
1. `verificador_fake_news` - Verificacion de noticias falsas
2. `infografia_interactiva` - Diseno de infografia
3. `quiz_tiktok` - Quiz estilo TikTok
4. `navegacion_hipertextual` - Navegacion entre paginas
5. `analisis_memes` - Analisis de memes educativos

---

### Criterios de Aceptacion

**Escenario 1: Validacion de Verificador Fake News**
```gherkin
DADO que un estudiante envia respuesta de verificador_fake_news
CUANDO el DTO valida la estructura
ENTONCES debe contener claims_verified (array de objetos)
Y cada claim debe tener claim_id, is_fake (boolean), evidence (string >= 10 chars)
```

**Escenario 2: Validacion de Infografia Interactiva**
```gherkin
DADO que un estudiante envia respuesta de infografia_interactiva
CUANDO el DTO valida la estructura
ENTONCES debe contener answers (objeto) y sections_explored (array >= 1)
```

**Escenario 3: Validacion de Quiz TikTok**
```gherkin
DADO que un estudiante envia respuesta de quiz_tiktok
CUANDO el DTO valida la estructura
ENTONCES debe contener answers (array de numeros >= 0)
```

**Escenario 4: Validacion de Navegacion Hipertextual**
```gherkin
DADO que un estudiante envia respuesta de navegacion_hipertextual
CUANDO el DTO valida la estructura
ENTONCES debe contener path (array >= 2 elementos) e information_found (objeto)
```

**Escenario 5: Validacion de Analisis de Memes**
```gherkin
DADO que un estudiante envia respuesta de analisis_memes
CUANDO el DTO valida la estructura
ENTONCES debe contener annotations (array) y analysis.message (string no vacio)
```

### Criterios Adicionales

- [ ] Todos los DTOs heredan de BaseExerciseAnswerDto
- [ ] Validacion con class-validator decorators
- [ ] Documentacion Swagger para cada DTO
- [ ] Tests unitarios para cada validacion

---

### Tareas Tecnicas

**Backend:**
- [ ] BE-M4-001.1: Crear VerificadorFakeNewsAnswerDto
- [ ] BE-M4-001.2: Crear InfografiaInteractivaAnswerDto
- [ ] BE-M4-001.3: Crear QuizTikTokAnswerDto
- [ ] BE-M4-001.4: Crear NavegacionHipertextualAnswerDto
- [ ] BE-M4-001.5: Crear AnalisisMemesAnswerDto

**Tests:**
- [ ] TEST-M4-001: Tests unitarios para 5 DTOs

---

### Dependencias

**Depende de:**
- [ ] Validador SQL validate_module4_module5_answer() - Estado: Done

**Bloquea:**
- [ ] US-M4-002: Integracion Gamificacion M4
- [ ] US-M5-002: Sistema de Revision Manual

---

### Notas Tecnicas

**Endpoints involucrados:**
| Metodo | Endpoint | Descripcion |
|--------|----------|-------------|
| POST | /api/v1/exercises/:id/submit | Envio de respuesta |
| POST | /api/v1/educational/exercises/m4/:type/submit | Nuevo endpoint especifico |

**Entidades/Tablas:**
- `educational_content.exercises`: Ejercicios con JSONB content
- `progress_tracking.exercise_submissions`: Almacena respuestas

**Estructura de DTOs:**
```typescript
// Ejemplo: VerificadorFakeNewsAnswerDto
interface ClaimVerification {
  claim_id: string;
  is_fake: boolean;
  evidence: string; // min 10 chars
}

interface VerificadorFakeNewsAnswerDto {
  claims_verified: ClaimVerification[];
}
```

---

### Definition of Ready (DoR)

- [x] Historia claramente escrita (quien, que, por que)
- [x] Criterios de aceptacion definidos
- [x] Story points estimados
- [x] Dependencias identificadas
- [x] Sin bloqueadores
- [x] Referencia a validador SQL disponible

### Definition of Done (DoD)

- [ ] Codigo implementado segun criterios
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integracion pasando
- [ ] Code review aprobado
- [ ] Documentacion actualizada
- [ ] Inventarios actualizados (BACKEND_INVENTORY.yml)
- [ ] Traza registrada (TRAZA-TAREAS-BACKEND.md)

---

### Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creacion | Requirements-Analyst |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Ultima actualizacion:** 2025-12-05
