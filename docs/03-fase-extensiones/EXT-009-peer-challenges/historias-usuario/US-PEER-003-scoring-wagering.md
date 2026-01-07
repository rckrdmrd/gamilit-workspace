---
id: "US-PEER-003"
title: "Scoring and ML Coins Wagering"
type: "User Story"
status: "Backlog"
priority: "Media"
assignee: "@Backend-Agent, @Frontend-Agent"
epic: "EXT-009"
story_points: 7
budget: "7 horas"
sprint: "Sprint-12"
labels: ["peer-challenges", "gamification", "ml-coins", "scoring"]
created_date: "2025-11-07"
updated_date: "2026-01-04"
---

# US-PEER-003: Scoring and ML Coins Wagering

**Epica:** EXT-009: Peer Challenges
**Prioridad:** P2
**Story Points:** 7
**Esfuerzo:** 7 horas
**Sprint:** 12

---

## User Story

```
Como estudiante que completo un challenge,
Quiero ver quien gano y recibir/perder los ML Coins apostados
Para sentir las consecuencias de la competencia
```

---

## Criterios de Aceptacion

### Backend (4h)
- [ ] Determinacion de ganador:
  - Mayor score gana
  - Si empate -> quien termino primero
  - Si solo uno completa -> ese gana
- [ ] ML Coins transaction:
  - Deducir wager_amount de perdedor
  - Agregar 2x wager_amount a ganador
  - Si empate -> devolver wager a ambos
- [ ] Endpoint `GET /api/v1/challenges/:id/result`
- [ ] Guardar resultado en tabla `peer_challenges`

### Frontend (3h)
- [ ] Results screen:
  - Confetti animacion si gano
  - Scores comparados (challenger vs opponent)
  - ML Coins ganados/perdidos
  - Boton "Revancha"
  - Boton "Ver ejercicio"
- [ ] Update de ML Coins balance en navbar

---

**Creado:** 2025-11-07
