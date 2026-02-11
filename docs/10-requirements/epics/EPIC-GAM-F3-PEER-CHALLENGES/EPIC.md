# EXT-009: Peer Challenges

> **⚠️ BACKLOG - FUERA DEL MVP**
>
> Esta épica está **parcialmente implementada (50%)** y **NO forma parte del MVP actual**.
> Razón: Feature nice-to-have.
> Ver: [Fase 4: Backlog](../../04-fase-backlog/README.md)

**Versión:** 1.0
**Fecha de creación:** 2025-11-07
**Prioridad:** P2 (Promovida desde P3)
**Story Points:** 25 SP
**Presupuesto:** $3,750 USD
**Timeline:** v1.2 (Sprints 11-16)
**Estado:** ⏳ BACKLOG (50% implementado)

---

## 📋 Descripción

Sistema de desafíos 1v1 entre estudiantes donde pueden competir directamente en ejercicios de comprensión lectora, apostando ML Coins y ganando recompensas adicionales por victorias.

---

## 🎯 Objetivos de Negocio

### Problema a Resolver
- Estudiantes completan ejercicios de forma aislada (no social)
- Falta de motivación competitiva
- Gamificación actual es individual (no peer-to-peer)

### Valor Esperado
- **Engagement:** +40% (sesiones más frecuentes)
- **Retention:** +25% (usuarios activos a 30 días)
- **Session length:** +1.5x (por competencia)
- **Churn reduction:** -15%
- **ROI:** 560%

### Métricas de Éxito
- **Daily active challenges:** >500
- **Challenge acceptance rate:** >70%
- **Repeat users:** >60% crean 2+ challenges/semana
- **NPS:** +12 puntos

---

## 🏗️ Arquitectura Técnica

### Componentes

1. **Challenge System (Backend)**
   - Crear challenge (seleccionar oponente + ejercicio)
   - Matching system (encontrar oponente si no especificado)
   - Scoring y determinación de ganador
   - ML Coins wagering y payout

2. **Real-time Updates (WebSocket)**
   - Notificación de challenge recibido
   - Updates de progreso durante challenge
   - Resultado final broadcast

3. **UI Components (Frontend)**
   - Challenge creation modal
   - Challenge inbox
   - Versus screen durante ejecución
   - Results screen

### Database Schema

```sql
CREATE TABLE social_features.peer_challenges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id UUID NOT NULL REFERENCES auth_management.users(id),
  opponent_id UUID NOT NULL REFERENCES auth_management.users(id),
  exercise_id UUID NOT NULL REFERENCES educational_content.exercises(id),
  wager_amount INTEGER DEFAULT 0, -- ML Coins apostados
  status VARCHAR(20), -- 'pending', 'accepted', 'declined', 'completed', 'expired'
  winner_id UUID REFERENCES auth_management.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours'
);

CREATE TABLE social_features.challenge_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id UUID NOT NULL REFERENCES social_features.peer_challenges(id),
  user_id UUID NOT NULL REFERENCES auth_management.users(id),
  attempt_id UUID NOT NULL REFERENCES progress_tracking.exercise_attempts(id),
  score DECIMAL(5,2),
  completed_at TIMESTAMPTZ
);
```

---

## 👥 User Stories

| ID | Historia | Esfuerzo | Prioridad |
|----|----------|----------|-----------|
| [US-PEER-001](./historias/US-PEER-001-challenge-creation.md) | Challenge Creation and Matching | 10h | P1 |
| [US-PEER-002](./historias/US-PEER-002-challenge-execution.md) | 1v1 Challenge Execution | 8h | P1 |
| [US-PEER-003](./historias/US-PEER-003-scoring-wagering.md) | Scoring and ML Coins Wagering | 7h | P2 |

**Total:** 25 horas ($3,750 USD)

---

## 🔗 Dependencias

### Bloqueado por
- Sistema de gamificación (ML Coins) funcionando
- WebSocket infrastructure implementado
- Social features básicos (friendships)

---

## 🚀 Plan de Implementación

### Sprint 11-12 (Semanas 11-12) - 25h
- US-PEER-001: Challenge Creation (10h)
- US-PEER-002: Challenge Execution (8h)
- US-PEER-003: Scoring & Wagering (7h)

---

## 📚 Referencias

- [ANALISIS-FEATURES-P3-ESTRATEGICAS.md](../../features/ANALISIS-FEATURES-P3-ESTRATEGICAS.md)
- [FEATURES-PENDIENTES.md](../../features/FEATURES-PENDIENTES.md) - F-P2-021

---

**Creado:** 2025-11-07
**Responsable:** Full-stack Team + WebSocket Engineer
