# PROMPT: SUBTASK-3.1 - Evaluar Endpoints Consolidados

**Perfil:** @PERFIL_ARCHITECT
**Gap Relacionado:** GAP-SP-005
**Tipo:** Evaluacion Tecnica

---

## Prompt Enviado

```
**PERFIL:** @PERFIL_ARCHITECT
**SUBTAREA:** SUBTASK-3.1 - Evaluar Migracion a Endpoints Consolidados (GAP-SP-005)
**TAREA PADRE:** TASK-2026-01-20-STUDENT-PORTAL-ANALYSIS

## CONTEXTO

Se identificaron endpoints consolidados en backend que el frontend no consume:

1. /gamification/ranks/users/{userId}/progress
2. /gamification/ranks/users/{userId}/multipliers
3. /progress/modules/{moduleId}/stats
4. /progress/users/{userId}/learning-path

Actualmente el frontend hace multiples requests para obtener la misma informacion
que estos endpoints consolidados proporcionan.

## TAREA

1. ANALIZAR cada endpoint consolidado
2. IDENTIFICAR que requests actuales reemplazaria
3. EVALUAR beneficios vs riesgos de migracion
4. GENERAR matriz de decision GO/NO-GO
5. CREAR documento en orchestration/analisis/EVALUACION-ENDPOINTS-CONSOLIDADOS.md

## ESTRUCTURA DE EVALUACION

Para cada endpoint evaluar:

### Beneficio Potencial
- Reduccion de requests (N -> 1)
- Consistencia de datos
- Simplificacion de codigo frontend
- Mejora de performance

### Riesgo de Migracion
- Cambios requeridos en frontend
- Posible regresion
- Compatibilidad con flujos existentes
- Esfuerzo de implementacion

### Matriz de Decision

| Endpoint | Beneficio | Riesgo | Decision | Justificacion |
|----------|-----------|--------|----------|---------------|
| /progress | ALTO | BAJO | GO | Reduce 3 requests |
| /learning-path | BAJO | ALTO | NO-GO | Funcionalidad futura |

## ARCHIVOS A ANALIZAR

### Backend (endpoints consolidados)
- apps/backend/src/modules/gamification/controllers/ranks.controller.ts
- apps/backend/src/modules/progress/controllers/progress.controller.ts

### Frontend (requests actuales)
- apps/frontend/src/lib/api/gamification.api.ts
- apps/frontend/src/features/dashboard/hooks/useDashboardData.ts

## CRITERIOS DE DECISION

**GO si:**
- Reduce >= 2 requests
- Riesgo de regresion BAJO
- Esfuerzo < 4h

**NO-GO si:**
- Endpoint para funcionalidad futura
- Alto riesgo de regresion
- Beneficio marginal

## COMMIT

[SUBTASK-3.1] docs: Evaluate consolidated endpoints migration (GAP-SP-005)
```

---

## Contexto Adicional

### Endpoints Actuales del Dashboard

```typescript
// useDashboardData.ts hace estos requests:
const [stats, rank, missions, achievements] = await Promise.all([
  api.get('/gamification/users/{userId}/stats'),
  api.get('/ranks/current'),
  api.get('/missions/active'),
  api.get('/achievements/user')
]);
```

### Endpoint Consolidado Propuesto

```typescript
// Un solo request con toda la informacion
const dashboard = await api.get('/gamification/users/{userId}/progress');
// Retorna: { stats, rank, rankProgress, multipliers }
```

---

## Resultado Obtenido

**Entregable:** `orchestration/analisis/EVALUACION-ENDPOINTS-CONSOLIDADOS.md`

**Decision:** PARCIAL GO

| Endpoint | Decision | Beneficio |
|----------|----------|-----------|
| /progress | GO | -2 requests |
| /multipliers | GO | Nueva UI posible |
| /stats | NO-GO | No aplica |
| /learning-path | NO-GO | Futuro |

**Impacto:** 20% reduccion de requests (5 -> 4)

---

## Uso en Mejora Continua

Este prompt puede servir como template para:
- Evaluacion de refactorizaciones de API
- Decisiones de migracion
- Analisis de trade-offs tecnicos

**Framework de Evaluacion:**
1. Identificar alternativas
2. Definir criterios objetivos
3. Evaluar beneficios cuantificables
4. Evaluar riesgos
5. Documentar decision con justificacion
