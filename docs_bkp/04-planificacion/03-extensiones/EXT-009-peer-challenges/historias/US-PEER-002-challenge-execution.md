# US-PEER-002: 1v1 Challenge Execution

**Épica:** EXT-009: Peer Challenges
**Prioridad:** P1
**Story Points:** 8
**Esfuerzo:** 8 horas
**Sprint:** 12

---

## 📋 User Story

```
Como estudiante que aceptó un challenge,
Quiero completar el ejercicio y ver cómo me va vs mi oponente en tiempo real
Para sentir la emoción de la competencia
```

---

## ✅ Criterios de Aceptación

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
  - Real-time updates vía WebSocket
- [ ] Exercise player integrado en challenge mode
- [ ] Loading state "Esperando a [opponent]..."

---

**Creado:** 2025-11-07
