# CORR-009: Plan de Implementacion por Fases

**Fecha:** 2026-01-07
**Estado:** EN ELABORACION
**Version:** 1.0
**Autor:** Arquitecto de Integracion
**Referencia:** CORR-009-ANALISIS-INICIAL-INTEGRACION-M3-M5-TEACHER.md

---

## 1. VISION GENERAL

### 1.1 Objetivo
Implementar la integracion completa de los 13 ejercicios de los modulos 3, 4 y 5 con:
- Portal Teacher para calificacion manual con rubricas especificas
- Sistema de gamificacion (XP, ML Coins, Achievements, Misiones)
- Notificaciones al estudiante post-calificacion

### 1.2 Alcance Total
- 5 ejercicios Modulo 3 (Lectura Critica)
- 5 ejercicios Modulo 4 (Alfabetizacion Digital)
- 3 ejercicios Modulo 5 (Produccion Creativa)

---

## 2. FASES DE IMPLEMENTACION

### FASE 1: ANALISIS DETALLADO (Actual)

| Tarea | Estado | Archivo Output |
|-------|--------|----------------|
| Analisis inicial | COMPLETADO | CORR-009-ANALISIS-INICIAL-*.md |
| Analisis M3 | EN PROGRESO | CORR-009-ANALISIS-DETALLADO-MODULO3.md |
| Analisis M4 | EN PROGRESO | CORR-009-ANALISIS-DETALLADO-MODULO4.md |
| Analisis M5 | EN PROGRESO | CORR-009-ANALISIS-DETALLADO-MODULO5.md |

**Entregables:**
- Inventario completo de ejercicios
- Estructura de respuesta por ejercicio
- Rubricas propuestas por ejercicio
- Identificacion de gaps

---

### FASE 2: PLANEACION DE BASE DE DATOS

#### 2.1 Nuevas Tablas/Cambios

```sql
-- educational_content.exercise_rubrics
-- Rubricas especificas por tipo de ejercicio
CREATE TABLE educational_content.exercise_rubrics (
    id UUID PRIMARY KEY,
    exercise_type VARCHAR(100) NOT NULL,
    rubric_name VARCHAR(255) NOT NULL,
    criteria JSONB NOT NULL,
    -- criteria: [{ id, name, description, weight, levels: [{score, description}] }]
    total_weight INTEGER DEFAULT 100,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 2.2 Modificaciones a Tablas Existentes

```sql
-- educational_content.exercises
ALTER TABLE educational_content.exercises
ADD COLUMN IF NOT EXISTS rubric_id UUID REFERENCES educational_content.exercise_rubrics(id);

-- progress_tracking.manual_reviews
-- Ya existe, verificar columnas rubric_scores
```

#### 2.3 Nuevos Seeds Requeridos

| Archivo | Descripcion |
|---------|-------------|
| XX-exercise_rubrics.sql | Rubricas para 13 ejercicios M3-M5 |
| XX-achievements-m3-m5.sql | Achievements especificos de modulos |

**Validacion:**
- [ ] DDL validado con esquema existente
- [ ] Seeds alineados con documentacion v6.x
- [ ] Script create-database.sh actualizado
- [ ] Recrear BD y verificar

---

### FASE 3: IMPLEMENTACION BACKEND

#### 3.1 Modulos a Modificar

| Modulo | Archivos | Cambios |
|--------|----------|---------|
| teacher | manual-review.service.ts | Agregar soporte para rubrica especifica |
| teacher | create-review.dto.ts | Validar estructura de rubric_scores |
| teacher | rubric-scoring.service.ts | Calcular score por criterio |
| progress | exercise-rewards.service.ts | Bonus por feedback detallado |
| gamification | achievements.service.ts | Detectar achievements M3-M5 |
| notifications | - | Evento de calificacion completada |

#### 3.2 Nuevos Endpoints (si aplica)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| /api/v1/teacher/rubrics/:exerciseType | GET | Obtener rubrica por tipo ejercicio |
| /api/v1/teacher/reviews/:id/preview-score | POST | Preview de score antes de confirmar |

#### 3.3 Eventos de Dominio

```typescript
// Eventos a emitir
REVIEW_COMPLETED: {
  submissionId: string;
  studentId: string;
  teacherId: string;
  score: number;
  feedback: string;
  rewards: {
    xp: number;
    mlCoins: number;
    achievements: string[];
  }
}
```

**Validacion:**
- [ ] Tests unitarios nuevos
- [ ] Tests integracion
- [ ] Swagger actualizado

---

### FASE 4: IMPLEMENTACION FRONTEND

#### 4.1 Portal Teacher

| Componente | Cambio |
|------------|--------|
| GradingPage.tsx | Agregar formulario de rubrica dinamica |
| RubricForm.tsx | CREAR - Form por criterio con niveles |
| SubmissionViewer.tsx | Soportar visualizacion multimedia M5 |
| FeedbackPanel.tsx | CREAR - Panel de feedback por criterio |

#### 4.2 Portal Estudiante

| Componente | Cambio |
|------------|--------|
| GradeNotification.tsx | CREAR - Notificacion push de calificacion |
| AchievementUnlock.tsx | Animacion de logro desbloqueado |
| ExerciseResult.tsx | Mostrar rubrica con scores por criterio |

**Validacion:**
- [ ] UI/UX revisado
- [ ] Responsive verificado
- [ ] A11y verificado

---

### FASE 5: IMPLEMENTACION GAMIFICACION

#### 5.1 Nuevos Achievements

| Achievement | Condicion | XP | ML Coins |
|-------------|-----------|-----|----------|
| Critico Literario M3 | Completar 5 ejercicios M3 | 200 | 50 |
| Experto Digital M4 | Completar 5 ejercicios M4 | 200 | 50 |
| Creador Multimedia M5 | Completar 3 ejercicios M5 | 300 | 75 |
| Graduado Gamilit | Completar M1-M5 | 500 | 150 |
| Perfeccionista | Score 100% en cualquier ejercicio manual | 100 | 25 |

#### 5.2 Misiones Relacionadas

| Mision | Tipo | Objetivo |
|--------|------|----------|
| Semana de Lectura Critica | Weekly | Completar 3 ejercicios M3 |
| Desafio Digital | Weekly | Completar 3 ejercicios M4 |
| Creador de la Semana | Weekly | Completar 1 ejercicio M5 |

**Validacion:**
- [ ] Seeds de achievements/missions creados
- [ ] Triggers de deteccion funcionando
- [ ] UI de achievements actualizada

---

### FASE 6: NOTIFICACIONES

#### 6.1 Tipos de Notificacion

| Evento | Canal | Template |
|--------|-------|----------|
| review_completed | Push + InApp | "Tu ejercicio '{exercise}' ha sido calificado: {score}/100" |
| achievement_unlocked | Push + InApp | "Desbloqueaste el logro '{achievement}'!" |
| rank_up | Push + InApp | "Subiste al rango {rank}!" |

#### 6.2 Implementacion

| Componente | Cambio |
|------------|--------|
| notifications.service.ts | Agregar event handlers |
| notification_templates seed | Agregar templates |
| WebSocket gateway | Emitir eventos en tiempo real |

---

### FASE 7: VALIDACION END-TO-END

#### 7.1 Casos de Prueba

| ID | Caso | Resultado Esperado |
|----|------|-------------------|
| E2E-001 | Estudiante envia ejercicio M3 | Review creado, aparece en Teacher |
| E2E-002 | Teacher califica con rubrica | Score calculado, rewards distribuidos |
| E2E-003 | Estudiante recibe notificacion | Push/InApp con score y feedback |
| E2E-004 | Achievement desbloqueado | Animacion y registro en BD |
| E2E-005 | Ejercicio multimedia M5 | Visor de audio/video funciona |

#### 7.2 Validacion de Datos

| Verificacion | Query |
|--------------|-------|
| Submissions sin review | `SELECT * FROM exercise_submissions WHERE requires_manual AND review IS NULL` |
| Reviews sin rewards | `SELECT * FROM manual_reviews WHERE status='completed' AND rewards_claimed=false` |
| Achievements no otorgados | Verificar triggers de deteccion |

---

### FASE 8: DOCUMENTACION Y HOMOLOGACION

#### 8.1 Documentacion a Actualizar

| Archivo | Cambio |
|---------|--------|
| apps/database/_MAP.md | Agregar tabla exercise_rubrics |
| docs/02-especificaciones-tecnicas/ | Actualizar specs de grading |
| apps/backend/_MAP.md | Documentar nuevos servicios |
| CONTRIBUTING.md | Agregar guia de rubricas |

#### 8.2 Homologacion

- [ ] Verificar alineacion con DocumentoDeDiseño_Mecanicas_GAMILIT_v6_1.md
- [ ] Verificar consistencia entre M3, M4 y M5
- [ ] Verificar naming conventions
- [ ] Code review final

---

## 3. CRONOGRAMA ESTIMADO

| Fase | Descripcion | Status |
|------|-------------|--------|
| 1 | Analisis Detallado | EN PROGRESO |
| 2 | Base de Datos | PENDIENTE |
| 3 | Backend | PENDIENTE |
| 4 | Frontend | PENDIENTE |
| 5 | Gamificacion | PENDIENTE |
| 6 | Notificaciones | PENDIENTE |
| 7 | Validacion E2E | PENDIENTE |
| 8 | Documentacion | PENDIENTE |

---

## 4. DEPENDENCIAS CRITICAS

### 4.1 Prerrequisitos
- Seeds de modulos M3, M4, M5 deben estar completos
- ManualReviewService funcional (VERIFICADO)
- ExerciseRewardsService funcional (VERIFICADO)
- Portal Teacher existente (VERIFICADO)

### 4.2 Riesgos
| Riesgo | Mitigacion |
|--------|------------|
| Cambios en BD rompen datos existentes | Backup antes de migracion |
| Rubricas muy complejas | Limitar a 4 criterios max |
| Performance en multimedia M5 | Lazy loading, compression |

---

## 5. SIGUIENTES PASOS INMEDIATOS

1. **Esperar analisis detallado** de agentes M3, M4, M5
2. **Consolidar rubricas** propuestas en un documento unico
3. **Disenar DDL** de exercise_rubrics
4. **Crear seeds** de rubricas
5. **Implementar backend** con TDD

---

**Estado:** EN ELABORACION - Esperando resultados de analisis detallado
