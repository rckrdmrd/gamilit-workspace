# US-PEER-003: Scoring and ML Coins Wagering

**Épica:** EXT-009: Peer Challenges
**Prioridad:** P2
**Story Points:** 7
**Esfuerzo:** 7 horas
**Sprint:** 12

---

## 📋 User Story

```
Como estudiante que completó un challenge,
Quiero ver quién ganó y recibir/perder los ML Coins apostados
Para sentir las consecuencias de la competencia
```

---

## ✅ Criterios de Aceptación

### Backend (4h)
- [ ] Determinación de ganador:
  - Mayor score gana
  - Si empate → quien terminó primero
  - Si solo uno completa → ese gana
- [ ] ML Coins transaction:
  - Deducir wager_amount de perdedor
  - Agregar 2x wager_amount a ganador
  - Si empate → devolver wager a ambos
- [ ] Endpoint `GET /api/v1/challenges/:id/result`
- [ ] Guardar resultado en tabla `peer_challenges`

### Frontend (3h)
- [ ] Results screen:
  - Confetti animación si ganó 🎉
  - Scores comparados (challenger vs opponent)
  - ML Coins ganados/perdidos
  - Botón "Revancha"
  - Botón "Ver ejercicio"
- [ ] Update de ML Coins balance en navbar

---

**Creado:** 2025-11-07
