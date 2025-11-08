# ML Coins Economy API

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** ML Coins Economy
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

ML Coins es el sistema de moneda virtual con control de inflación y mecanismos balanceados de earn/sink.

**Total de Endpoints:** 8

---

## Endpoints

### 2.1 Get Coin Balance

**Endpoint:** `GET /coins/balance`

**Descripción:** Obtiene el balance actual de ML Coins del usuario y estadísticas.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "balance": 1245,
    "statistics": {
      "totalEarned": 3890,
      "totalSpent": 2645,
      "netWorth": 1245,
      "earningVelocity": 0.92,
      "todayEarned": 85,
      "weekEarned": 425,
      "monthEarned": 1680
    },
    "lastUpdated": "2025-10-28T09:45:00Z"
  }
}
```

**Cache:** Redis, TTL 10s

---

### 2.2 Get Transaction History

**Endpoint:** `GET /coins/transactions`

**Descripción:** Obtiene historial paginado de transacciones.

**Query Parameters:**
- `page` (optional, default: 1): Número de página
- `limit` (optional, default: 20, max: 100): Items por página
- `type` (optional): Filtrar por tipo (EARN, SPEND)
- `startDate` (optional): ISO date
- `endDate` (optional): ISO date

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "txn_789",
        "type": "EARN",
        "amount": 49,
        "source": "QUIZ_COMPLETION",
        "description": "Quiz Difícil completado (Perfect Score)",
        "metadata": {
          "quizId": "quiz_456",
          "difficulty": "HARD",
          "perfectScore": true
        },
        "balanceAfter": 1245,
        "createdAt": "2025-10-28T09:30:00Z"
      },
      {
        "id": "txn_788",
        "type": "SPEND",
        "amount": -100,
        "source": "POWERUP_PURCHASE",
        "description": "Compra: Double Coins",
        "metadata": {
          "powerUpId": "pu_double_coins",
          "quantity": 1
        },
        "balanceAfter": 1196,
        "createdAt": "2025-10-28T08:15:00Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 15,
      "totalItems": 287,
      "itemsPerPage": 20
    }
  }
}
```

---

### 2.3 Award Coins

**Endpoint:** `POST /coins/award`

**Descripción:** Otorga ML Coins al usuario (uso interno, activado por eventos).

**Request Body:**
```json
{
  "userId": "usr_123",
  "amount": 50,
  "source": "QUIZ_COMPLETION",
  "metadata": {
    "quizId": "quiz_456",
    "difficulty": "HARD",
    "score": 100
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_790",
    "amount": 50,
    "newBalance": 1295,
    "inflationAdjusted": false,
    "adjustmentFactor": 1.0
  }
}
```

**Algoritmo Aplicado:**
- Base amount × rank multiplier
- Ajuste de inflación si es necesario
- Actualización de balance en transacción atómica

---

### 2.4 Spend Coins

**Endpoint:** `POST /coins/spend`

**Descripción:** Deduce ML Coins del balance del usuario.

**Request Body:**
```json
{
  "userId": "usr_123",
  "amount": 100,
  "purpose": "POWERUP_PURCHASE",
  "itemId": "pu_double_coins"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_791",
    "amount": -100,
    "newBalance": 1195,
    "purchaseConfirmed": true
  }
}
```

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Balance insuficiente. Necesitas 100 ML Coins, tienes 45.",
    "details": {
      "required": 100,
      "available": 45,
      "deficit": 55
    }
  }
}
```

---

### 2.5 Get Economy Stats

**Endpoint:** `GET /coins/economy/stats`

**Descripción:** Obtiene estadísticas globales de economía (solo admin).

**Auth:** Requiere rol admin

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSupply": 15847320,
    "activeUsers": 3240,
    "averageBalance": 4890,
    "medianBalance": 1250,
    "inflation": {
      "current": 2.8,
      "target": 3.0,
      "status": "HEALTHY"
    },
    "velocity": {
      "current": 1.05,
      "target": 1.0,
      "range": [0.8, 1.2],
      "status": "HEALTHY"
    },
    "giniCoefficient": 0.42,
    "distribution": {
      "top1Percent": 8.5,
      "top10Percent": 32.4,
      "bottom50Percent": 12.1
    },
    "volume7Days": {
      "earned": 2450000,
      "spent": 2340000,
      "net": 110000
    }
  }
}
```

**Cache:** Redis, TTL 300s

---

### 2.6 Calculate Coin Reward

**Endpoint:** `POST /coins/calculate-reward`

**Descripción:** Calcula ML Coins por un quiz sin otorgarlos.

**Request Body:**
```json
{
  "userId": "usr_123",
  "quizDifficulty": "HARD",
  "score": 100,
  "timePercentage": 55,
  "powerUpsUsed": ["hint_helper"]
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "baseCoins": 15,
    "difficultyBonus": 10,
    "rankMultiplier": 1.2,
    "perfectScoreBonus": 1.5,
    "speedBonus": 1.1,
    "powerUpPenalty": 0.9,
    "totalCoins": 44,
    "breakdown": {
      "base": 15,
      "afterDifficulty": 25,
      "afterRank": 30,
      "afterPerfect": 45,
      "afterSpeed": 50,
      "afterPenalty": 44
    }
  }
}
```

---

### 2.7 Get Earning Projections

**Endpoint:** `GET /coins/projections`

**Descripción:** Obtiene proyecciones de ganancias basadas en actividad actual.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "currentWeeklyRate": 425,
    "projectedMonthly": 1840,
    "breakdown": {
      "quizzes": 1200,
      "streaks": 200,
      "achievements": 300,
      "leaderboard": 100,
      "guild": 40
    },
    "recommendations": [
      "Mantén tu streak de 12 días para bonificación de día 14 (+100 ML)",
      "Completa 3 quizzes más esta semana para alcanzar top 50 (+100 ML)",
      "Desbloquea 2 logros pendientes para ganar +150 ML"
    ]
  }
}
```

---

### 2.8 Adjust Inflation

**Endpoint:** `POST /coins/economy/adjust-inflation`

**Descripción:** Activa ajuste de inflación manualmente (solo admin).

**Auth:** Requiere rol admin

**Request Body:**
```json
{
  "targetInflation": 3.0,
  "adjustmentStrength": "MODERATE"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "previousFactor": 1.0,
    "newFactor": 0.95,
    "adjustmentPercentage": -5.0,
    "reason": "Inflation at 3.2% exceeded target 3.0%",
    "appliedAt": "2025-10-28T10:00:00Z",
    "estimatedImpact": {
      "dailySupplyReduction": 12000,
      "expectedStabilizationDays": 7
    }
  }
}
```

---

## Algoritmo de Cálculo

Ver [06-ALGORITMOS-SCHEMAS.md](./06-ALGORITMOS-SCHEMAS.md#ml-coins-calculation-algorithm) para detalles completos.

**Fórmula:**
```
Coins_total = (Coins_base + difficulty_bonus) × mult_rank × mult_perfect × mult_speed × penalty_powerups × factor_inflation
```

**Variables:**
- `Coins_base`: Coins base por completar quiz (default: 15)
- `difficulty_bonus`: Easy: +0, Medium: +5, Hard: +10, Expert: +20
- `mult_rank`: Multiplicador de rango (1.0x - 2.0x)
- `mult_perfect`: Bonus por score perfecto (1.5x si 100%, sino 1.0x)
- `mult_speed`: Bonus por velocidad (1.1x si <60% time, sino 1.0x)
- `penalty_powerups`: 0.9x por power-up usado (mín 0.5x)
- `factor_inflation`: Factor de ajuste de inflación (calculado dinámicamente)

---

## Control de Inflación

### Ajuste Logarítmico
```
factor_adjustment = 1 / (1 + log10(1 + inflation_current / inflation_target))
```

### Cuándo Aplicar
- Se ejecuta cada 24 horas
- Se activa si inflación > 2.5%
- Ajusta todas las recompensas de coins globalmente

### Ejemplo
```javascript
// Inflación actual: 3.5%, target: 3.0%
// = 1 / (1 + log10(1 + 3.5/3.0))
// = 1 / (1 + log10(2.167))
// = 1 / (1 + 0.336)
// = 0.748 (factor de ajuste)
```

---

## Fuentes de ML Coins

### Earn (Ganancias)
1. **Quiz Completion:** 10-65 coins (según dificultad y performance)
2. **Daily Streak:** +10 coins por día, bonus en milestones
3. **Achievements:** 10-500 coins según rareza
4. **Leaderboard Rewards:** Top 100 weekly/monthly
5. **Guild Events:** 20-100 coins por evento
6. **Rank-Up Bonuses:** 100-2,500 coins

### Sink (Gastos)
1. **Power-ups:** 30-150 coins
2. **Hints:** 10 coins por hint
3. **Guild Contributions:** Opcional
4. **Cosmetic Items:** 50-500 coins
5. **Skip Quiz:** 100 coins

---

## Métricas de Economía

### Indicadores Saludables
- **Inflación:** 2.5% - 3.5%
- **Velocity:** 0.8 - 1.2
- **Gini Coefficient:** < 0.5
- **Supply Growth:** 2-4% mensual

### Indicadores de Alerta
- Inflación > 5%: Reducir rewards
- Velocity < 0.5: Incentivar gasto
- Gini > 0.6: Redistribución necesaria

---

## Referencias

- [Rangos Maya API](./01-RANGOS-MAYA.md)
- [Power-ups API](./04-POWER-UPS.md)
- [Algoritmos y Schemas](./06-ALGORITMOS-SCHEMAS.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
