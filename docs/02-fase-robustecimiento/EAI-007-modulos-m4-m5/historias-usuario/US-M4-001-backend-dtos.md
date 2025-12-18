# US-M4-001: Backend DTOs para Módulo 4

### Metadata

| Campo | Valor |
|-------|-------|
| **ID** | US-M4-001 |
| **Épica** | EAI-007 - Módulos 4 y 5 |
| **Módulo** | educational, progress |
| **Prioridad** | P0 |
| **Story Points** | 5 |
| **Sprint** | Sprint 7 |
| **Estado** | Backlog |
| **Asignado a** | Backend-Agent |

---

### Historia de Usuario

**Como** desarrollador backend,
**quiero** crear DTOs de respuesta para los 5 tipos de ejercicio del Módulo 4,
**para** validar correctamente las respuestas de los estudiantes y procesarlas en el flujo de revisión manual.

### Descripción Detallada

El Módulo 4 "Lectura Digital y Multimodal" comprende 5 tipos de ejercicios que requieren DTOs específicos para validar la estructura de las respuestas antes de enviarlas a revisión manual por docentes.

**Tipos de ejercicio:**
1. `verificador_fake_news` - Verificación de noticias falsas
2. `infografia_interactiva` - Diseño de infografía
3. `quiz_tiktok` - Quiz estilo TikTok
4. `navegacion_hipertextual` - Navegación entre páginas
5. `analisis_memes` - Análisis de memes educativos

---

### Criterios de Aceptación

**Escenario 1: Validación de Verificador Fake News**
```gherkin
DADO que un estudiante envía respuesta de verificador_fake_news
CUANDO el DTO valida la estructura
ENTONCES debe contener claims_verified (array de objetos)
Y cada claim debe tener claim_id, is_fake (boolean), evidence (string >= 10 chars)
```

**Escenario 2: Validación de Infografía Interactiva**
```gherkin
DADO que un estudiante envía respuesta de infografia_interactiva
CUANDO el DTO valida la estructura
ENTONCES debe contener answers (objeto) y sections_explored (array >= 1)
```

**Escenario 3: Validación de Quiz TikTok**
```gherkin
DADO que un estudiante envía respuesta de quiz_tiktok
CUANDO el DTO valida la estructura
ENTONCES debe contener answers (array de números >= 0)
```

**Escenario 4: Validación de Navegación Hipertextual**
```gherkin
DADO que un estudiante envía respuesta de navegacion_hipertextual
CUANDO el DTO valida la estructura
ENTONCES debe contener path (array >= 2 elementos) e information_found (objeto)
```

**Escenario 5: Validación de Análisis de Memes**
```gherkin
DADO que un estudiante envía respuesta de analisis_memes
CUANDO el DTO valida la estructura
ENTONCES debe contener annotations (array) y analysis.message (string no vacío)
```

### Criterios Adicionales

- [ ] Todos los DTOs heredan de BaseExerciseAnswerDto
- [ ] Validación con class-validator decorators
- [ ] Documentación Swagger para cada DTO
- [ ] Tests unitarios para cada validación

---

### Tareas Técnicas

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
- [ ] US-M4-002: Integración Gamificación M4
- [ ] US-M5-002: Sistema de Revisión Manual

---

### Notas Técnicas

**Endpoints involucrados:**
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | /api/v1/exercises/:id/submit | Envío de respuesta |
| POST | /api/v1/educational/exercises/m4/:type/submit | Nuevo endpoint específico |

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

- [x] Historia claramente escrita (quién, qué, por qué)
- [x] Criterios de aceptación definidos
- [x] Story points estimados
- [x] Dependencias identificadas
- [x] Sin bloqueadores
- [x] Referencia a validador SQL disponible

### Definition of Done (DoD)

- [ ] Código implementado según criterios
- [ ] Tests unitarios escritos y pasando
- [ ] Tests de integración pasando
- [ ] Code review aprobado
- [ ] Documentación actualizada
- [ ] Inventarios actualizados (BACKEND_INVENTORY.yml)
- [ ] Traza registrada (TRAZA-TAREAS-BACKEND.md)

---

### Historial de Cambios

| Fecha | Cambio | Autor |
|-------|--------|-------|
| 2025-12-05 | Creación | Requirements-Analyst |

---

**Creada por:** Requirements-Analyst
**Fecha:** 2025-12-05
**Última actualización:** 2025-12-05
