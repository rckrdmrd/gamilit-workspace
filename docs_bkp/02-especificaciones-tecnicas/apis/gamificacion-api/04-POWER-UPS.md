# Power-ups API

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** Power-ups System
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Power-ups son herramientas estratégicas que mejoran la experiencia de quizzes sin ser esenciales para el aprendizaje.

**Total de Endpoints:** 6

---

## Endpoints

### 4.1 Get Available Power-ups

**Endpoint:** `GET /powerups/available`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": "pu_time_extender",
      "name": "Time Extender",
      "nameSpanish": "Extensión de Tiempo",
      "description": "Añade 30 segundos adicionales al temporizador del quiz",
      "cost": 50,
      "discountedCost": 50,
      "discount": 0,
      "duration": "1 quiz",
      "restrictions": "1 uso por quiz",
      "cooldown": 0,
      "iconUrl": "/assets/powerups/time_extender.png",
      "active": true
    }
  ],
  "userDiscounts": {
    "rank": "Nacom",
    "discountPercentage": 0.1,
    "appliedTo": "all"
  }
}
```

### 4.2 Get User Inventory

**Endpoint:** `GET /powerups/inventory`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "powerups": [
      {
        "id": "pu_double_coins",
        "quantity": 3,
        "onCooldown": false,
        "cooldownEndsAt": null,
        "purchasedAt": "2025-10-27T15:00:00Z"
      }
    ],
    "statistics": {
      "totalPurchased": 45,
      "totalUsed": 42,
      "mostUsed": "pu_double_coins",
      "totalSpent": 4200
    }
  }
}
```

**Cache:** Redis, TTL 10s

### 4.3 Purchase Power-up

**Endpoint:** `POST /powerups/purchase`

**Request Body:**
```json
{
  "powerupId": "pu_double_coins",
  "quantity": 2
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "transactionId": "txn_800",
    "powerupId": "pu_double_coins",
    "quantity": 2,
    "costPerUnit": 80,
    "totalCost": 160,
    "discountApplied": 0.2,
    "newBalance": 1035,
    "newInventory": {
      "powerupId": "pu_double_coins",
      "quantity": 5
    }
  }
}
```

### 4.4 Activate Power-up

**Endpoint:** `POST /powerups/activate`

**Request Body:**
```json
{
  "powerupId": "pu_double_coins",
  "context": {
    "quizId": "quiz_456",
    "action": "PRE_QUIZ"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "powerupId": "pu_double_coins",
    "activated": true,
    "activatedAt": "2025-10-28T10:00:00Z",
    "expiresAt": "2025-10-28T10:30:00Z",
    "remainingQuantity": 2,
    "effect": {
      "type": "COIN_MULTIPLIER",
      "value": 2.0,
      "duration": "1 quiz"
    },
    "cooldownStartsAt": "2025-10-28T10:30:00Z",
    "cooldownEndsAt": "2025-10-28T11:30:00Z"
  }
}
```

### 4.5 Get Power-up Statistics

**Endpoint:** `GET /powerups/statistics`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalPurchased": 45,
    "totalUsed": 42,
    "totalSpent": 4200,
    "byPowerup": [
      {
        "id": "pu_double_coins",
        "name": "Double Coins",
        "purchased": 15,
        "used": 15,
        "averageROI": 1.25,
        "totalEarned": 1875,
        "totalSpent": 1500,
        "netProfit": 375
      }
    ]
  }
}
```

### 4.6 Get Power-up History

**Endpoint:** `GET /powerups/history`

**Query:** `?page=1&limit=20`

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "history": [
      {
        "id": "usage_123",
        "powerupId": "pu_double_coins",
        "powerupName": "Double Coins",
        "action": "ACTIVATED",
        "timestamp": "2025-10-28T09:30:00Z",
        "context": {
          "quizId": "quiz_456",
          "quizDifficulty": "HARD"
        },
        "result": {
          "coinsEarned": 88,
          "coinsWithoutPowerup": 44,
          "netProfit": -12
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 3,
      "totalItems": 42
    }
  }
}
```

---

## Power-ups Disponibles

### 1. Time Extender (Extensión de Tiempo)
- **Costo:** 50 ML Coins
- **Efecto:** +30 segundos al temporizador
- **Restricción:** 1 uso por quiz
- **Cooldown:** Ninguno

### 2. Hint Helper (Ayuda de Pistas)
- **Costo:** 75 ML Coins
- **Efecto:** Revela pista para pregunta actual
- **Restricción:** Máximo 3 por quiz
- **Cooldown:** Ninguno
- **Penalidad:** -10% en ML Coins ganados

### 3. Double Coins (Monedas Dobles)
- **Costo:** 100 ML Coins
- **Efecto:** 2x ML Coins del próximo quiz
- **Restricción:** No acumulable
- **Cooldown:** 1 hora

### 4. XP Booster (Impulsor de XP)
- **Costo:** 120 ML Coins
- **Efecto:** 1.5x XP del próximo quiz
- **Restricción:** No acumulable
- **Cooldown:** 2 horas

### 5. Shield (Escudo)
- **Costo:** 150 ML Coins
- **Efecto:** Protege streak por 1 día
- **Restricción:** Activo hasta usar
- **Cooldown:** 24 horas

### 6. Skip Question (Saltar Pregunta)
- **Costo:** 100 ML Coins
- **Efecto:** Marca pregunta como correcta
- **Restricción:** 1 uso por quiz
- **Cooldown:** Ninguno
- **Penalidad:** No cuenta para Perfect Score

### 7. Second Chance (Segunda Oportunidad)
- **Costo:** 80 ML Coins
- **Efecto:** Reintenta pregunta incorrecta
- **Restricción:** 1 uso por quiz
- **Cooldown:** Ninguno

### 8. Difficulty Reducer (Reductor de Dificultad)
- **Costo:** 60 ML Coins
- **Efecto:** Convierte quiz HARD a MEDIUM
- **Restricción:** Antes de empezar quiz
- **Cooldown:** 3 horas
- **Penalidad:** -20% en rewards

---

## Descuentos por Rango

- **Ajaw:** 0% descuento
- **Nacom:** 0% descuento
- **Ah K'in:** 10% descuento
- **Halach Uinic:** 15% descuento
- **K'uk'ulkan:** 20% descuento

---

## Referencias

- [ML Coins API](./02-ML-COINS.md)
- [Rangos Maya API](./01-RANGOS-MAYA.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
