---
id: "US-PEER-002"
title: "1v1 Challenge Execution"
type: "User Story"
status: "Backlog"
priority: "Alta"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-009"
story_points: 8
budget: "8 horas"
sprint: "Sprint-12"
labels: ["peer-challenges", "gamification", "websocket", "realtime"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PEER-002: 1v1 Challenge Execution

**Epica:** EXT-009: Peer Challenges
**Prioridad:** P1
**Story Points:** 8
**Esfuerzo:** 8 horas
**Sprint:** 12

---

## User Story

```
Como estudiante que acepto un challenge,
Quiero completar el ejercicio y ver como me va vs mi oponente en tiempo real
Para sentir la emocion de la competencia
```

---

## Criterios de Aceptacion

### Backend (4h)
- [ ] Endpoint `GET /api/v1/challenges/:id/start` (iniciar challenge)
- [ ] WebSocket events:
  - `challenge:opponent_started`
  - `challenge:opponent_completed`
  - `challenge:progress_update` (cada 25% del ejercicio)
- [ ] Tracking de attempts por challenge_id

### Frontend (4h)
- [ ] Versus screen:
  - Avatares de challenger vs opponent
  - Progress bars de ambos
  - Timer (opcional)
  - Real-time updates via WebSocket
- [ ] Exercise player integrado en challenge mode
- [ ] Loading state "Esperando a [opponent]..."

---

**Creado:** 2025-11-07
