# US-PEER-001: Challenge Creation and Matching

**Épica:** EXT-009: Peer Challenges
**Prioridad:** P1
**Story Points:** 10
**Esfuerzo:** 10 horas
**Sprint:** 11

---

## 📋 User Story

```
Como estudiante,
Quiero desafiar a un compañero a un duelo de comprensión lectora
Para competir y hacer el aprendizaje más divertido
```

---

## ✅ Criterios de Aceptación

### Backend (6h)
- [ ] Endpoint `POST /api/v1/challenges` (crear challenge)
  - Body: `{ opponent_id, exercise_id, wager_amount }`
  - Validations: oponente existe, ejercicio válido, suficientes ML Coins
- [ ] Endpoint `GET /api/v1/challenges/inbox` (challenges recibidos)
- [ ] Endpoint `POST /api/v1/challenges/:id/accept`
- [ ] Endpoint `POST /api/v1/challenges/:id/decline`
- [ ] Auto-expiración de challenges después de 24h (cron job)

### Frontend (4h)
- [ ] Botón "Desafiar" en perfil de usuario
- [ ] Modal de creación de challenge:
  - Selector de ejercicio
  - Slider de apuesta (0-500 ML Coins)
  - Preview de recompensa (2x wager si gana)
- [ ] Challenge inbox con notificaciones
- [ ] Botones Accept/Decline

---

**Creado:** 2025-11-07
