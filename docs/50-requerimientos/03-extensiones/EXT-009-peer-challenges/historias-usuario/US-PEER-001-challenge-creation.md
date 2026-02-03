---
id: "US-PEER-001"
title: "Challenge Creation and Matching"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-009"
story_points: 10
budget: "10 horas"
sprint: "Sprint-11"
labels: ["peer-challenges", "gamification", "social"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PEER-001: Challenge Creation and Matching

**Epica:** EXT-009: Peer Challenges
**Prioridad:** P1
**Story Points:** 10
**Esfuerzo:** 10 horas
**Sprint:** 11

---

## User Story

```
Como estudiante,
Quiero desafiar a un companero a un duelo de comprension lectora
Para competir y hacer el aprendizaje mas divertido
```

---

## Criterios de Aceptacion

### Backend (6h)
- [ ] Endpoint `POST /api/v1/challenges` (crear challenge)
  - Body: `{ opponent_id, exercise_id, wager_amount }`
  - Validations: oponente existe, ejercicio valido, suficientes ML Coins
- [ ] Endpoint `GET /api/v1/challenges/inbox` (challenges recibidos)
- [ ] Endpoint `POST /api/v1/challenges/:id/accept`
- [ ] Endpoint `POST /api/v1/challenges/:id/decline`
- [ ] Auto-expiracion de challenges despues de 24h (cron job)

### Frontend (4h)
- [ ] Boton "Desafiar" en perfil de usuario
- [ ] Modal de creacion de challenge:
  - Selector de ejercicio
  - Slider de apuesta (0-500 ML Coins)
  - Preview de recompensa (2x wager si gana)
- [ ] Challenge inbox con notificaciones
- [ ] Botones Accept/Decline

---

**Creado:** 2025-11-07
