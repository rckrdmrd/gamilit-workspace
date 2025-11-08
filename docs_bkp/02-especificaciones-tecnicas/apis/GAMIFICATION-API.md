# API Specification - Gamification System

> **⚠️ DEPRECATION NOTICE - RFC-0001 VIOLATION**
>
> Este archivo tiene 2,424 líneas (6.1x el límite de 400L según RFC-0001).
>
> **POR FAVOR USA LOS ARCHIVOS MODULARES EN SU LUGAR:**
> - [gamificacion-api/README.md](./gamificacion-api/README.md) - Índice principal
> - [gamificacion-api/01-RANGOS-MAYA.md](./gamificacion-api/01-RANGOS-MAYA.md) - Sistema de rangos Maya
> - [gamificacion-api/02-ML-COINS.md](./gamificacion-api/02-ML-COINS.md) - Sistema de monedas virtuales
> - [gamificacion-api/03-ACHIEVEMENTS.md](./gamificacion-api/03-ACHIEVEMENTS.md) - Sistema de logros
> - [gamificacion-api/04-POWER-UPS.md](./gamificacion-api/04-POWER-UPS.md) - Power-ups y comodines
> - [gamificacion-api/05-LEADERBOARDS.md](./gamificacion-api/05-LEADERBOARDS.md) - Tablas de clasificación
> - [gamificacion-api/06-ALGORITMOS-SCHEMAS.md](./gamificacion-api/06-ALGORITMOS-SCHEMAS.md) - Algoritmos y schemas
> - [gamificacion-api/07-WEBSOCKET-EJEMPLOS.md](./gamificacion-api/07-WEBSOCKET-EJEMPLOS.md) - WebSocket en tiempo real
>
> **Este archivo se mantiene solo como referencia histórica y será removido en futuras versiones.**
>
> ---

## 🔗 Trazabilidad

**Casos de uso relacionados:**
- [UC-STU-003: Resolver ejercicio](../../../01-requerimientos/casos-uso/student/UC-STU-003-resolver-ejercicio.md) - Ganancia de XP y ML Coins
- [UC-STU-004: Ver progreso](../../../01-requerimientos/casos-uso/student/UC-STU-004-ver-progreso.md) - Visualización de rangos, logros y stats
- [UC-STU-007: Ver ranking](../../../01-requerimientos/casos-uso/student/UC-STU-007-ver-ranking.md) - Leaderboards globales y semanales

**User Stories:**
- [US-GAM-001: Sistema de rangos Maya](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-001-sistema-rangos-maya.md) - 5 rangos con progresión
- [US-GAM-002: Sistema de ML Coins](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-002-sistema-ml-coins.md) - Economía virtual
- [US-GAM-003: Sistema de logros](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-003-sistema-logros.md) - 64 achievements
- [US-GAM-004: Power-ups y comodines](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-004-powerups-comodines.md) - 8 power-ups estratégicos
- [US-GAM-005: Leaderboards y competencia](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/historias/US-GAM-005-leaderboards-competencia.md) - Rankings en tiempo real

**Épicas:**
- [EAI-002: Gamificación](../../../04-planificacion/01-alcance-inicial/EAI-002-gamificacion/_MAP.md) - 130 SP, $47,850 MXN

**Requerimientos funcionales:**
- Sistema de rangos Maya: 5 niveles (Ajaw, Nacom, Ah K'in, Halach Uinic, K'uk'ulkan)
- Economía virtual con ML Coins: control de inflación y balance earn/sink
- Sistema de logros: 64 achievements en 4 categorías (Progress, Mastery, Social, Secret)
- Power-ups estratégicos: 8 tipos que mejoran experiencia sin ser p2w
- Leaderboards: global, semanal, mensual, gremios y amigos

**Especificaciones técnicas relacionadas:**
- [gamificacion-api/01-RANGOS-MAYA.md](./gamificacion-api/01-RANGOS-MAYA.md) - Endpoints de rangos (6)
- [gamificacion-api/02-ML-COINS.md](./gamificacion-api/02-ML-COINS.md) - Endpoints de monedas (8)
- [gamificacion-api/03-ACHIEVEMENTS.md](./gamificacion-api/03-ACHIEVEMENTS.md) - Endpoints de logros (6)
- [gamificacion-api/04-POWER-UPS.md](./gamificacion-api/04-POWER-UPS.md) - Endpoints de power-ups (6)
- [gamificacion-api/05-LEADERBOARDS.md](./gamificacion-api/05-LEADERBOARDS.md) - Endpoints de rankings (6)
- [gamificacion-api/06-ALGORITMOS-SCHEMAS.md](./gamificacion-api/06-ALGORITMOS-SCHEMAS.md) - Algoritmos XP, coins, inflación
- [gamificacion-api/07-WEBSOCKET-EJEMPLOS.md](./gamificacion-api/07-WEBSOCKET-EJEMPLOS.md) - Eventos en tiempo real

**ADRs relacionados:**
- [ADR-002: JWT Security Implementation](../adr/ADR-002-jwt-security-implementation.md) - Autenticación en APIs de gamificación
- [ADR-003: RLS vs App-Layer Authorization](../adr/ADR-003-rls-vs-app-layer-authorization.md) - Seguridad multi-tenant de stats

---

**Version:** 1.0
**Last Updated:** 2025-10-28
**Status:** Production Ready (Use modular files above)
**Base URL:** `/api/gamification`

---

## Overview

The Gamification API provides a comprehensive system for student engagement through Maya-inspired ranks, virtual currency (ML Coins), achievements, power-ups, and competitive leaderboards.

### Key Features
- **Total Endpoints:** 32
- **Authentication:** JWT required for all endpoints
- **Rate Limiting:** 100 requests/minute per user
- **Cache Strategy:** Redis (TTL 60s for leaderboards, 30s for user stats)
- **WebSocket Support:** Real-time leaderboard updates

### Technology Stack
- **Backend:** Node.js + Express
- **Database:** PostgreSQL (primary), Redis (cache)
- **Real-time:** Socket.IO
- **Queue:** Bull (for async tasks)

---

## Table of Contents

1. [Rangos Maya System (6 endpoints)](#1-rangos-maya-system)
2. [ML Coins Economy (8 endpoints)](#2-ml-coins-economy)
3. [Achievements System (6 endpoints)](#3-achievements-system)
4. [Power-ups (6 endpoints)](#4-power-ups)
5. [Leaderboards (6 endpoints)](#5-leaderboards)
6. [Algorithms](#algorithms)
7. [Data Schemas](#data-schemas)
8. [WebSocket Events](#websocket-events)
9. [Examples](#examples)

---

## 1. Rangos Maya System

The rank system provides visible progression through 5 Maya military-inspired ranks: Ajaw, Nacom, Ah K'in, Halach Uinic, and K'uk'ulkan.

### 1.1 Get User Rank

**Endpoint:** `GET /ranks/user/:userId`

**Description:** Retrieve current rank information for a user.

**Parameters:**
- `userId` (path, required): User ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "currentRank": "Nacom",
    "rankLevel": 2,
    "xpCurrent": 845,
    "xpRequired": 1500,
    "xpProgress": 0.563,
    "multiplier": 1.2,
    "nextRank": "Nacom",
    "earnedAt": "2025-10-15T14:30:00Z",
    "benefits": {
      "coinMultiplier": 1.2,
      "powerUpDiscount": 0,
      "specialAccess": ["intermediate_quizzes", "guilds"]
    }
  }
}
```

**Cache:** Redis, TTL 30s

---

### 1.2 Get Rank Progress

**Endpoint:** `GET /ranks/progress`

**Description:** Get detailed progress towards next rank.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "currentRank": "Nacom",
    "nextRank": "Nacom",
    "requirements": {
      "xp": {
        "current": 845,
        "required": 1500,
        "completed": true
      },
      "quizzes": {
        "current": 32,
        "required": 75,
        "completed": false
      },
      "achievements": {
        "current": 5,
        "required": 10,
        "completed": false
      },
      "streak": {
        "current": 8,
        "required": 15,
        "completed": false
      },
      "guildEvents": {
        "current": 2,
        "required": 5,
        "completed": false
      }
    },
    "overallProgress": 0.42,
    "estimatedDays": 18
  }
}
```

---

### 1.3 Get All Ranks

**Endpoint:** `GET /ranks/all`

**Description:** Get information about all available ranks.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "rank": "Ajaw",
      "level": 1,
      "name": "Nacom",
      "nameSpanish": "Comandante Menor",
      "historicalMeaning": "Comandante militar Maya de menor rango, líder de escuadrones pequeños.",
      "xpRange": [0, 500],
      "multiplier": 1.0,
      "averageTime": "1-2 weeks",
      "rewards": {
        "coins": 100,
        "powerUps": ["hint_helper"],
        "unlocks": ["basic_quizzes"]
      },
      "iconUrl": "/assets/ranks/nacom.png"
    },
    {
      "rank": "Nacom",
      "level": 2,
      "name": "Nacom",
      "nameSpanish": "Capitán de Guerra",
      "historicalMeaning": "Capitán de guerra maya, líder militar respetado.",
      "xpRange": [1000, 3000],
      "multiplier": 1.25,
      "averageTime": "2-3 weeks",
      "requirements": {
        "xp": 500,
        "quizzes": 25,
        "achievements": 3,
        "streak": 5
      },
      "rewards": {
        "coins": 250,
        "badge": "holcan_warrior",
        "unlocks": ["intermediate_quizzes", "guilds"]
      },
      "iconUrl": "/assets/ranks/holcan.png"
    }
    // ... other ranks
  ]
}
```

**Cache:** Redis, TTL 3600s (static data)

---

### 1.4 Calculate XP Gain

**Endpoint:** `POST /ranks/calculate-xp`

**Description:** Calculate XP that would be earned for a quiz completion.

**Request Body:**
```json
{
  "quizDifficulty": "HARD",
  "score": 100,
  "timePercentage": 55,
  "streakDays": 12,
  "userId": "usr_123"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "baseXP": 50,
    "rankMultiplier": 1.2,
    "difficultyMultiplier": 2.0,
    "streakBonus": 1.12,
    "perfectBonus": 1.5,
    "speedBonus": 1.1,
    "totalXP": 199,
    "breakdown": {
      "base": 50,
      "afterRank": 60,
      "afterDifficulty": 120,
      "afterStreak": 134,
      "afterPerfect": 201,
      "afterSpeed": 199
    }
  }
}
```

---

### 1.5 Get Prestige Info

**Endpoint:** `GET /ranks/prestige`

**Description:** Get prestige system information and eligibility.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "eligible": false,
    "currentPrestige": 0,
    "requirements": {
      "rank": {
        "required": "K'uk'ulkan",
        "current": "Nacom",
        "met": false
      },
      "totalXP": {
        "required": 10000,
        "current": 845,
        "met": false
      },
      "achievements": {
        "required": 50,
        "current": 5,
        "met": false
      },
      "grandChallenge": {
        "required": true,
        "completed": false,
        "met": false
      }
    },
    "benefits": {
      "multiplierIncrease": 0.1,
      "coinsRetained": 0.5,
      "permanentTitle": true,
      "exclusiveBadge": true,
      "vipAccess": true
    }
  }
}
```

---

### 1.6 Prestige Rank

**Endpoint:** `POST /ranks/prestige`

**Description:** Execute prestige action (reset rank with permanent benefits).

**Request Body:**
```json
{
  "userId": "usr_123",
  "confirmation": true
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "newPrestigeLevel": 1,
    "rankReset": "Ajaw",
    "coinsRetained": 2500,
    "newMultiplier": 1.1,
    "permanentBenefits": {
      "title": "Halach Uinic [Prestige 1]",
      "badge": "prestige_silver_1",
      "multiplierBonus": 0.1,
      "vipAccess": true
    },
    "achievementsKept": ["master_algebra", "geometry_guru"],
    "prestigedAt": "2025-10-28T10:00:00Z"
  }
}
```

**Side Effects:**
- Resets rank to Nacom
- Resets XP to 0
- Retains 50% of ML Coins
- Keeps mastery achievements
- Adds permanent multiplier bonus

---

## 2. ML Coins Economy

ML Coins is the virtual currency system with controlled inflation and balanced earn/sink mechanisms.

### 2.1 Get Coin Balance

**Endpoint:** `GET /coins/balance`

**Description:** Get user's current ML Coins balance and statistics.

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

**Description:** Get paginated transaction history.

**Query Parameters:**
- `page` (optional, default: 1): Page number
- `limit` (optional, default: 20, max: 100): Items per page
- `type` (optional): Filter by type (EARN, SPEND)
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

**Description:** Award ML Coins to user (internal use, triggered by events).

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

**Algorithm Applied:**
- Base amount × rank multiplier
- Inflation adjustment if needed
- Balance update atomic transaction

---

### 2.4 Spend Coins

**Endpoint:** `POST /coins/spend`

**Description:** Deduct ML Coins from user balance.

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

**Description:** Get global economy statistics (admin only).

**Auth:** Requires admin role

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

**Description:** Calculate ML Coins for a quiz without awarding them.

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

**Description:** Get projected earnings based on current activity.

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

**Description:** Manually trigger inflation adjustment (admin only).

**Auth:** Requires admin role

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

## 3. Achievements System

Achievement system provides short, medium, and long-term goals across 4 categories: Progress, Mastery, Social, and Secret.

### 3.1 Get User Achievements

**Endpoint:** `GET /achievements/user/:userId`

**Description:** Get all achievements for a user with unlock status.

**Query Parameters:**
- `category` (optional): Filter by category (PROGRESS, MASTERY, SOCIAL, SECRET)
- `unlocked` (optional, boolean): Filter by unlock status

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "summary": {
      "total": 64,
      "unlocked": 12,
      "locked": 52,
      "progress": 0.1875
    },
    "achievements": [
      {
        "id": "ach_001",
        "name": "First Steps",
        "description": "Completa tu primer quiz",
        "category": "PROGRESS",
        "rarity": "COMMON",
        "unlocked": true,
        "unlockedAt": "2025-10-15T14:30:00Z",
        "reward": {
          "coins": 25,
          "xp": 10
        },
        "iconUrl": "/assets/achievements/first_steps.png"
      },
      {
        "id": "ach_015",
        "name": "Speed Demon",
        "description": "Completa un quiz en menos del 30% del tiempo",
        "category": "MASTERY",
        "rarity": "RARE",
        "unlocked": false,
        "progress": {
          "current": 45,
          "target": 30,
          "unit": "percentage",
          "percentage": 0.67
        },
        "reward": {
          "coins": 150,
          "xp": 50,
          "badge": "speed_demon"
        },
        "iconUrl": "/assets/achievements/speed_demon_locked.png"
      },
      {
        "id": "ach_045",
        "name": "???",
        "description": "???",
        "category": "SECRET",
        "rarity": "LEGENDARY",
        "unlocked": false,
        "hidden": true,
        "iconUrl": "/assets/achievements/mystery.png"
      }
    ]
  }
}
```

**Cache:** Redis, TTL 30s

---

### 3.2 Get Achievement Details

**Endpoint:** `GET /achievements/:achievementId`

**Description:** Get detailed information about a specific achievement.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ach_015",
    "name": "Speed Demon",
    "nameSpanish": "Demonio de Velocidad",
    "description": "Completa un quiz en menos del 30% del tiempo límite",
    "longDescription": "Demuestra tu maestría completando un quiz en tiempo récord. Solo los estudiantes más preparados pueden resolver problemas con esta velocidad mientras mantienen precisión.",
    "category": "MASTERY",
    "rarity": "RARE",
    "reward": {
      "coins": 150,
      "xp": 50,
      "badge": "speed_demon",
      "title": null
    },
    "requirements": {
      "quizCompletionTime": {
        "operator": "LESS_THAN",
        "value": 30,
        "unit": "percentage"
      }
    },
    "statistics": {
      "totalUnlocks": 1245,
      "unlockPercentage": 8.5,
      "averageTimeToUnlock": "3.2 weeks",
      "firstUnlockedBy": "user_789",
      "firstUnlockedAt": "2025-09-15T10:20:00Z"
    },
    "iconUrl": "/assets/achievements/speed_demon.png",
    "prerequisite": null,
    "chain": ["ach_001", "ach_010", "ach_015"]
  }
}
```

---

### 3.3 Check Achievement Progress

**Endpoint:** `POST /achievements/check-progress`

**Description:** Check if recent actions triggered any achievement unlocks.

**Request Body:**
```json
{
  "userId": "usr_123",
  "eventType": "QUIZ_COMPLETED",
  "eventData": {
    "quizId": "quiz_456",
    "score": 100,
    "timeUsed": 180,
    "timeLimit": 600,
    "difficulty": "HARD"
  }
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "achievementsUnlocked": [
      {
        "id": "ach_015",
        "name": "Speed Demon",
        "reward": {
          "coins": 150,
          "xp": 50
        },
        "rarity": "RARE"
      }
    ],
    "coinsAwarded": 150,
    "xpAwarded": 50,
    "updatedProgress": [
      {
        "id": "ach_020",
        "name": "Perfect Precision",
        "progress": {
          "current": 8,
          "target": 10,
          "percentage": 0.8
        }
      }
    ]
  }
}
```

**Side Effects:**
- Awards coins and XP for unlocked achievements
- Creates achievement unlock records
- Triggers notifications
- Updates achievement progress counters

---

### 3.4 Get Achievement Categories

**Endpoint:** `GET /achievements/categories`

**Description:** Get all achievement categories with counts.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "category": "PROGRESS",
      "name": "Progreso",
      "description": "Logros que recompensan avance continuo y consistencia",
      "total": 20,
      "unlocked": 8,
      "iconUrl": "/assets/categories/progress.png"
    },
    {
      "category": "MASTERY",
      "name": "Maestría",
      "description": "Logros que recompensan dominio y excelencia",
      "total": 18,
      "unlocked": 3,
      "iconUrl": "/assets/categories/mastery.png"
    },
    {
      "category": "SOCIAL",
      "name": "Social",
      "description": "Logros que recompensan participación en comunidad",
      "total": 12,
      "unlocked": 1,
      "iconUrl": "/assets/categories/social.png"
    },
    {
      "category": "SECRET",
      "name": "Secreto",
      "description": "Logros ocultos que recompensan exploración",
      "total": 14,
      "unlocked": 0,
      "iconUrl": "/assets/categories/secret.png"
    }
  ]
}
```

---

### 3.5 Get Leaderboard by Achievement Count

**Endpoint:** `GET /achievements/leaderboard`

**Description:** Get users ranked by achievement count.

**Query Parameters:**
- `limit` (optional, default: 100): Number of users
- `category` (optional): Filter by category

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_456",
        "username": "MathWizard",
        "achievementsUnlocked": 58,
        "totalAchievements": 64,
        "percentage": 90.6,
        "rareAchievements": 12,
        "epicAchievements": 5,
        "legendaryAchievements": 2
      },
      {
        "rank": 2,
        "userId": "usr_789",
        "username": "AlgebraKing",
        "achievementsUnlocked": 54,
        "totalAchievements": 64,
        "percentage": 84.4,
        "rareAchievements": 10,
        "epicAchievements": 4,
        "legendaryAchievements": 1
      }
    ],
    "userPosition": {
      "rank": 847,
      "achievementsUnlocked": 12,
      "percentage": 18.75
    }
  }
}
```

**Cache:** Redis, TTL 60s

---

### 3.6 Unlock Achievement (Manual)

**Endpoint:** `POST /achievements/unlock`

**Description:** Manually unlock an achievement (admin only, for testing/corrections).

**Auth:** Requires admin role

**Request Body:**
```json
{
  "userId": "usr_123",
  "achievementId": "ach_015",
  "reason": "Manual correction - achievement should have triggered on 2025-10-27"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "achievementId": "ach_015",
    "userId": "usr_123",
    "unlockedAt": "2025-10-28T10:00:00Z",
    "coinsAwarded": 150,
    "xpAwarded": 50,
    "manualUnlock": true,
    "unlockedBy": "admin_001"
  }
}
```

---

## 4. Power-ups

Power-ups are strategic tools that enhance the quiz-taking experience without being essential for learning.

### 4.1 Get Available Power-ups

**Endpoint:** `GET /powerups/available`

**Description:** Get all power-ups with prices and availability.

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
    },
    {
      "id": "pu_double_coins",
      "name": "Double Coins",
      "nameSpanish": "Monedas Dobles",
      "description": "Duplica los ML Coins ganados en el próximo quiz",
      "cost": 100,
      "discountedCost": 80,
      "discount": 0.2,
      "duration": "1 quiz",
      "restrictions": "No acumulable con otros multiplicadores",
      "cooldown": 3600,
      "iconUrl": "/assets/powerups/double_coins.png",
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

---

### 4.2 Get User Inventory

**Endpoint:** `GET /powerups/inventory`

**Description:** Get user's power-up inventory.

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
      },
      {
        "id": "pu_shield",
        "quantity": 1,
        "onCooldown": false,
        "cooldownEndsAt": null,
        "active": true,
        "activatedAt": "2025-10-20T10:00:00Z"
      },
      {
        "id": "pu_xp_booster",
        "quantity": 0,
        "onCooldown": true,
        "cooldownEndsAt": "2025-10-28T14:30:00Z"
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

---

### 4.3 Purchase Power-up

**Endpoint:** `POST /powerups/purchase`

**Description:** Purchase a power-up with ML Coins.

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

**Error Response:** `400 Bad Request`
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Balance insuficiente para comprar 2 Double Coins",
    "details": {
      "required": 160,
      "available": 100
    }
  }
}
```

---

### 4.4 Activate Power-up

**Endpoint:** `POST /powerups/activate`

**Description:** Activate a power-up from inventory.

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

---

### 4.5 Get Power-up Statistics

**Endpoint:** `GET /powerups/statistics`

**Description:** Get personal power-up usage statistics.

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
      },
      {
        "id": "pu_hint_helper",
        "name": "Hint Helper",
        "purchased": 12,
        "used": 10,
        "successRate": 0.9,
        "totalSpent": 900
      }
    ],
    "recommendations": [
      "Tu ROI promedio de Double Coins es 1.25x - úsalo en quizzes difíciles para mejor retorno",
      "Hint Helper te ha ayudado en 90% de los casos - buena inversión"
    ]
  }
}
```

---

### 4.6 Get Power-up History

**Endpoint:** `GET /powerups/history`

**Description:** Get power-up usage history.

**Query Parameters:**
- `page` (optional, default: 1)
- `limit` (optional, default: 20)

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
      },
      {
        "id": "usage_122",
        "powerupId": "pu_shield",
        "powerupName": "Shield",
        "action": "AUTO_ACTIVATED",
        "timestamp": "2025-10-27T00:00:00Z",
        "context": {
          "streakProtected": 25
        },
        "result": {
          "streakSaved": true
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

## 5. Leaderboards

Leaderboards provide competitive rankings across multiple timeframes and metrics.

### 5.1 Get Global Leaderboard

**Endpoint:** `GET /leaderboards/global`

**Description:** Get global leaderboard ranked by total XP.

**Query Parameters:**
- `metric` (optional, default: "xp"): Ranking metric (xp, streak, achievements, coins)
- `limit` (optional, default: 100, max: 500): Number of users

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "metric": "xp",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_456",
        "username": "MathMaster",
        "displayName": "Math Master",
        "avatar": "/avatars/usr_456.png",
        "xp": 12450,
        "rank": "K'uk'ulkan",
        "prestigeLevel": 2,
        "streak": 87,
        "achievementsUnlocked": 58,
        "guildName": "Maya Warriors",
        "changeFromLastWeek": 0
      },
      {
        "rank": 2,
        "userId": "usr_789",
        "username": "AlgebraQueen",
        "displayName": "Algebra Queen",
        "avatar": "/avatars/usr_789.png",
        "xp": 11890,
        "rank": "K'uk'ulkan",
        "prestigeLevel": 1,
        "streak": 65,
        "achievementsUnlocked": 52,
        "guildName": "Calculus Crew",
        "changeFromLastWeek": 1
      }
    ],
    "userPosition": {
      "rank": 847,
      "userId": "usr_123",
      "xp": 845,
      "percentile": 22.4
    },
    "lastUpdated": "2025-10-28T10:00:00Z"
  }
}
```

**Cache:** Redis, TTL 60s

---

### 5.2 Get Weekly Leaderboard

**Endpoint:** `GET /leaderboards/weekly`

**Description:** Get weekly leaderboard (resets every Monday).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "start": "2025-10-21T00:00:00Z",
      "end": "2025-10-27T23:59:59Z",
      "daysRemaining": 4
    },
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_321",
        "username": "WeeklyChamp",
        "xpThisWeek": 1240,
        "quizzesCompleted": 42,
        "perfectScores": 15,
        "projectedReward": 500
      }
    ],
    "userPosition": {
      "rank": 156,
      "xpThisWeek": 285,
      "projectedReward": 0,
      "needsForTop100": 115
    },
    "rewards": [
      {
        "rankRange": [1, 1],
        "coins": 500,
        "title": "Weekly Champion"
      },
      {
        "rankRange": [2, 3],
        "coins": 300
      },
      {
        "rankRange": [4, 10],
        "coins": 200
      }
    ]
  }
}
```

**Cache:** Redis, TTL 60s

---

### 5.3 Get Monthly Leaderboard

**Endpoint:** `GET /leaderboards/monthly`

**Description:** Get monthly leaderboard (resets first day of month).

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "period": {
      "month": "October 2025",
      "start": "2025-10-01T00:00:00Z",
      "end": "2025-10-31T23:59:59Z",
      "daysRemaining": 3
    },
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_654",
        "username": "MonthlyMaster",
        "xpThisMonth": 4850,
        "quizzesCompleted": 158,
        "ranksGained": 2,
        "projectedReward": 2000
      }
    ],
    "userPosition": {
      "rank": 234,
      "xpThisMonth": 845,
      "projectedReward": 0
    },
    "rewards": [
      {
        "rankRange": [1, 1],
        "coins": 2000,
        "title": "Champion"
      },
      {
        "rankRange": [2, 3],
        "coins": 1500
      },
      {
        "rankRange": [4, 10],
        "coins": 1000
      }
    ]
  }
}
```

**Cache:** Redis, TTL 60s

---

### 5.4 Get Guild Leaderboard

**Endpoint:** `GET /leaderboards/guilds`

**Description:** Get guild rankings.

**Query Parameters:**
- `limit` (optional, default: 50, max: 100)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "guildId": "guild_001",
        "guildName": "Maya Warriors",
        "guildLevel": 3,
        "totalPoints": 145820,
        "memberCount": 87,
        "avgXpPerMember": 1676,
        "activeMembers": 72,
        "eventsCompleted": 24,
        "icon": "/guilds/maya_warriors.png"
      },
      {
        "rank": 2,
        "guildId": "guild_002",
        "guildName": "Calculus Crew",
        "guildLevel": 3,
        "totalPoints": 138940,
        "memberCount": 92,
        "avgXpPerMember": 1510,
        "activeMembers": 78,
        "eventsCompleted": 21,
        "icon": "/guilds/calculus_crew.png"
      }
    ],
    "userGuild": {
      "rank": 28,
      "guildId": "guild_042",
      "guildName": "Math Explorers",
      "totalPoints": 45230
    }
  }
}
```

**Cache:** Redis, TTL 60s

---

### 5.5 Get Friends Leaderboard

**Endpoint:** `GET /leaderboards/friends`

**Description:** Get leaderboard of user's friends.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "friendsCount": 12,
    "leaderboard": [
      {
        "rank": 1,
        "userId": "usr_888",
        "username": "BestFriend",
        "xp": 3450,
        "userRank": "Nacom",
        "streak": 45,
        "isFriend": true,
        "lastActive": "2025-10-28T09:00:00Z"
      },
      {
        "rank": 2,
        "userId": "usr_123",
        "username": "YourUsername",
        "xp": 845,
        "userRank": "Nacom",
        "streak": 12,
        "isSelf": true,
        "lastActive": "2025-10-28T10:00:00Z"
      }
    ]
  }
}
```

**Cache:** Redis, TTL 30s

---

### 5.6 Get Leaderboard History

**Endpoint:** `GET /leaderboards/history/:userId`

**Description:** Get historical rank positions for a user.

**Query Parameters:**
- `period` (optional, default: "30d"): Time period (7d, 30d, 90d, all)
- `metric` (optional, default: "xp"): Metric to track

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "userId": "usr_123",
    "period": "30d",
    "metric": "xp",
    "dataPoints": [
      {
        "date": "2025-09-28",
        "rank": 1250,
        "xp": 450,
        "percentile": 15.2
      },
      {
        "date": "2025-10-05",
        "rank": 1089,
        "xp": 580,
        "percentile": 18.5
      },
      {
        "date": "2025-10-12",
        "rank": 952,
        "xp": 695,
        "percentile": 21.3
      },
      {
        "date": "2025-10-19",
        "rank": 891,
        "xp": 760,
        "percentile": 22.0
      },
      {
        "date": "2025-10-28",
        "rank": 847,
        "xp": 845,
        "percentile": 22.4
      }
    ],
    "summary": {
      "rankChange": -403,
      "xpGain": 395,
      "percentileChange": 7.2,
      "trend": "IMPROVING"
    }
  }
}
```

---

## Algorithms

### XP Calculation Algorithm

**Formula:**
```
XP_total = XP_base × mult_rank × mult_difficulty × mult_streak × mult_perfect × mult_speed
```

**Variables:**
- `XP_base`: Base XP for quiz completion (default: 50)
- `mult_rank`: Rank multiplier (1.0x - 2.0x + prestige bonus)
- `mult_difficulty`: Difficulty multiplier
  - Easy: 1.0x
  - Medium: 1.5x
  - Hard: 2.0x
  - Expert: 2.5x
- `mult_streak`: Streak bonus (1 + min(streak_days, 30) × 0.01), max 1.3x
- `mult_perfect`: Perfect score bonus (1.5x if 100% correct, else 1.0x)
- `mult_speed`: Speed bonus (1.1x if completed in <60% of time, else 1.0x)

**Example:**
```javascript
const calculateXP = (quiz) => {
  const baseXP = 50;
  const rankMultiplier = getRankMultiplier(user.rank) + user.prestigeBonus;
  const difficultyMultiplier = {
    EASY: 1.0,
    MEDIUM: 1.5,
    HARD: 2.0,
    EXPERT: 2.5
  }[quiz.difficulty];

  const streakBonus = 1 + Math.min(user.streakDays, 30) * 0.01;
  const perfectBonus = quiz.score === 100 ? 1.5 : 1.0;
  const speedBonus = quiz.timeUsed < quiz.timeLimit * 0.6 ? 1.1 : 1.0;

  const totalXP = Math.floor(
    baseXP *
    rankMultiplier *
    difficultyMultiplier *
    streakBonus *
    perfectBonus *
    speedBonus
  );

  return totalXP;
};
```

---

### ML Coins Calculation Algorithm

**Formula:**
```
Coins_total = (Coins_base + difficulty_bonus) × mult_rank × mult_perfect × mult_speed × penalty_powerups × factor_inflation
```

**Variables:**
- `Coins_base`: Base coins for quiz completion (default: 15)
- `difficulty_bonus`:
  - Easy: +0
  - Medium: +5
  - Hard: +10
  - Expert: +20
- `mult_rank`: Rank multiplier (1.0x - 2.0x)
- `mult_perfect`: Perfect score bonus (1.5x if 100%, else 1.0x)
- `mult_speed`: Speed bonus (1.1x if <60% time, else 1.0x)
- `penalty_powerups`: 0.9x per power-up used (min 0.5x)
- `factor_inflation`: Inflation adjustment factor (calculated dynamically)

**Example:**
```javascript
const calculateCoins = (quiz, user) => {
  const baseCoins = 15;
  const difficultyBonus = {
    EASY: 0,
    MEDIUM: 5,
    HARD: 10,
    EXPERT: 20
  }[quiz.difficulty];

  const rankMultiplier = getRankMultiplier(user.rank);
  const perfectBonus = quiz.score === 100 ? 1.5 : 1.0;
  const speedBonus = quiz.timeUsed < quiz.timeLimit * 0.6 ? 1.1 : 1.0;
  const powerupPenalty = Math.max(0.5, Math.pow(0.9, quiz.powerupsUsed));
  const inflationFactor = getInflationAdjustmentFactor();

  const totalCoins = Math.floor(
    (baseCoins + difficultyBonus) *
    rankMultiplier *
    perfectBonus *
    speedBonus *
    powerupPenalty *
    inflationFactor
  );

  return totalCoins;
};
```

---

### Inflation Control Algorithm

**Logarithmic Adjustment:**
```
factor_adjustment = 1 / (1 + log10(1 + inflation_current / inflation_target))
```

**When to Apply:**
- Runs every 24 hours
- Triggers if inflation > 2.5%
- Adjusts all coin rewards globally

**Variables:**
- `inflation_current`: Current monthly inflation rate (%)
- `inflation_target`: Target inflation (3.0%)
- `factor_adjustment`: Multiplier applied to all coin rewards

**Example:**
```javascript
const calculateInflationFactor = () => {
  const currentInflation = getCurrentInflation(); // e.g., 3.5%
  const targetInflation = 3.0;

  if (currentInflation <= targetInflation) {
    return 1.0; // No adjustment needed
  }

  const adjustmentFactor = 1 / (
    1 + Math.log10(1 + currentInflation / targetInflation)
  );

  // Example: 3.5% inflation
  // = 1 / (1 + log10(1 + 3.5/3.0))
  // = 1 / (1 + log10(2.167))
  // = 1 / (1 + 0.336)
  // = 0.748

  return Math.max(0.7, adjustmentFactor); // Floor at 0.7x
};

const getCurrentInflation = () => {
  const supplyLastMonth = getTotalSupply(Date.now() - 30 * DAY);
  const supplyNow = getTotalSupply(Date.now());

  return ((supplyNow - supplyLastMonth) / supplyLastMonth) * 100;
};
```

---

### Rank Progression Algorithm

**Requirements Check:**
```javascript
const checkRankEligibility = (user, nextRank) => {
  const requirements = RANK_REQUIREMENTS[nextRank];

  return {
    xp: user.xp >= requirements.xp,
    quizzes: user.quizzesCompleted >= requirements.quizzes,
    achievements: user.achievementsUnlocked >= requirements.achievements,
    streak: user.currentStreak >= requirements.streak,
    guildEvents: user.guildEventsParticipated >= (requirements.guildEvents || 0),
    leaderboard: user.leaderboardRank <= (requirements.leaderboardRank || Infinity),
    challenges: user.eliteChallengesCompleted >= (requirements.challenges || 0)
  };
};

const canRankUp = (user) => {
  const nextRank = getNextRank(user.currentRank);
  if (!nextRank) return false;

  const eligibility = checkRankEligibility(user, nextRank);
  return Object.values(eligibility).every(req => req === true);
};
```

---

### Leaderboard Ranking Algorithm

**Efficient Position Calculation:**
```javascript
// Using PostgreSQL window functions
const getLeaderboardPosition = async (userId, metric = 'xp') => {
  const query = `
    WITH ranked_users AS (
      SELECT
        user_id,
        ${metric},
        RANK() OVER (ORDER BY ${metric} DESC) as rank,
        PERCENT_RANK() OVER (ORDER BY ${metric} DESC) as percentile
      FROM gamification_stats
      WHERE active = true
    )
    SELECT rank, percentile
    FROM ranked_users
    WHERE user_id = $1
  `;

  const result = await db.query(query, [userId]);
  return result.rows[0];
};

// Redis caching for top 100
const getCachedLeaderboard = async (metric, limit = 100) => {
  const cacheKey = `leaderboard:${metric}:${limit}`;
  const cached = await redis.get(cacheKey);

  if (cached) return JSON.parse(cached);

  const leaderboard = await db.query(`
    SELECT user_id, username, ${metric}, rank
    FROM gamification_stats
    WHERE active = true
    ORDER BY ${metric} DESC
    LIMIT $1
  `, [limit]);

  await redis.setex(cacheKey, 60, JSON.stringify(leaderboard.rows));
  return leaderboard.rows;
};
```

---

## Data Schemas

### User Gamification Profile
```typescript
interface UserGamificationProfile {
  userId: string;
  rank: 'Ajaw' | 'Nacom' | 'Nacom' | 'Halach Uinic' | 'K'uk'ulkan';
  rankLevel: number; // 1-5
  prestigeLevel: number;
  xp: number;
  coins: number;
  currentStreak: number;
  longestStreak: number;
  quizzesCompleted: number;
  achievementsUnlocked: number;
  guildId: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastActiveAt: Date;
}
```

### Achievement Schema
```typescript
interface Achievement {
  id: string;
  name: string;
  nameSpanish: string;
  description: string;
  longDescription: string;
  category: 'PROGRESS' | 'MASTERY' | 'SOCIAL' | 'SECRET';
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY';
  hidden: boolean;
  reward: {
    coins: number;
    xp: number;
    badge?: string;
    title?: string;
  };
  requirements: Record<string, any>;
  prerequisiteId?: string;
  iconUrl: string;
  createdAt: Date;
}
```

### Power-up Schema
```typescript
interface PowerUp {
  id: string;
  name: string;
  nameSpanish: string;
  description: string;
  cost: number;
  effect: {
    type: 'TIME_EXTEND' | 'HINT' | 'COIN_MULTIPLIER' | 'XP_BOOST' | 'SHIELD' | 'SKIP' | 'SECOND_CHANCE' | 'DIFFICULTY_REDUCE';
    value: number;
    duration: string;
  };
  restrictions: string;
  cooldown: number; // seconds
  maxPerQuiz: number;
  active: boolean;
  iconUrl: string;
}
```

### Transaction Schema
```typescript
interface CoinTransaction {
  id: string;
  userId: string;
  type: 'EARN' | 'SPEND';
  amount: number;
  source: string;
  description: string;
  metadata: Record<string, any>;
  balanceBefore: number;
  balanceAfter: number;
  createdAt: Date;
}
```

### Leaderboard Entry Schema
```typescript
interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  metric: number; // xp, coins, achievements, etc.
  userRank: string;
  prestigeLevel: number;
  streak: number;
  guildName?: string;
  changeFromLastPeriod: number;
  lastUpdated: Date;
}
```

---

## WebSocket Events

### Connect to Gamification Socket

**Endpoint:** `ws://api.gamilit.com/gamification`

**Authentication:**
```javascript
const socket = io('/gamification', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

---

### Events Emitted by Server

#### 1. `leaderboard:update`
Emitted when leaderboard positions change.

**Payload:**
```json
{
  "type": "global",
  "metric": "xp",
  "updates": [
    {
      "userId": "usr_123",
      "oldRank": 850,
      "newRank": 847,
      "xp": 845
    }
  ],
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

#### 2. `achievement:unlocked`
Emitted when user unlocks an achievement.

**Payload:**
```json
{
  "userId": "usr_123",
  "achievement": {
    "id": "ach_015",
    "name": "Speed Demon",
    "rarity": "RARE",
    "reward": {
      "coins": 150,
      "xp": 50
    }
  },
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

#### 3. `rank:promoted`
Emitted when user ranks up.

**Payload:**
```json
{
  "userId": "usr_123",
  "oldRank": "Nacom",
  "newRank": "Nacom",
  "rewards": {
    "coins": 500,
    "badge": "batabob_noble",
    "unlocks": ["advanced_quizzes", "guild_leadership"]
  },
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

#### 4. `coins:updated`
Emitted when user's coin balance changes significantly.

**Payload:**
```json
{
  "userId": "usr_123",
  "oldBalance": 1195,
  "newBalance": 1245,
  "change": 50,
  "reason": "QUIZ_COMPLETION",
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

#### 5. `streak:milestone`
Emitted when user reaches streak milestone.

**Payload:**
```json
{
  "userId": "usr_123",
  "streakDays": 30,
  "milestone": "MONTH",
  "reward": {
    "coins": 300,
    "badge": "unstoppable"
  },
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

#### 6. `guild:event`
Emitted for guild-related events.

**Payload:**
```json
{
  "guildId": "guild_042",
  "eventType": "RANK_CHANGE",
  "data": {
    "oldRank": 29,
    "newRank": 28,
    "points": 45230
  },
  "timestamp": "2025-10-28T10:00:00Z"
}
```

---

### Events Received by Server

#### 1. `leaderboard:subscribe`
Subscribe to leaderboard updates.

**Payload:**
```json
{
  "type": "global",
  "metric": "xp"
}
```

---

#### 2. `leaderboard:unsubscribe`
Unsubscribe from leaderboard updates.

**Payload:**
```json
{
  "type": "global"
}
```

---

#### 3. `user:status`
Request current user status.

**Payload:**
```json
{
  "userId": "usr_123"
}
```

**Response:**
```json
{
  "rank": "Nacom",
  "xp": 845,
  "coins": 1245,
  "streak": 12,
  "leaderboardRank": 847
}
```

---

## Examples

### Example 1: Complete Quiz Flow

**1. Calculate expected rewards**
```bash
POST /api/gamification/ranks/calculate-xp
POST /api/gamification/coins/calculate-reward

# User sees: "Completa este quiz y gana ~45 ML Coins y ~150 XP"
```

**2. User activates power-up**
```bash
POST /api/gamification/powerups/activate
{
  "powerupId": "pu_double_coins",
  "context": { "quizId": "quiz_456" }
}
```

**3. Quiz completed, award rewards**
```bash
POST /api/gamification/coins/award
{
  "userId": "usr_123",
  "amount": 88,
  "source": "QUIZ_COMPLETION"
}
```

**4. Check for achievement unlocks**
```bash
POST /api/gamification/achievements/check-progress
{
  "userId": "usr_123",
  "eventType": "QUIZ_COMPLETED",
  "eventData": { "score": 100, "timeUsed": 180 }
}

# Response: Achievement "Speed Demon" unlocked! +150 ML Coins
```

**5. Update leaderboard**
```bash
# Automatic background job
# WebSocket emits leaderboard:update to subscribed clients
```

---

### Example 2: Rank Progression Check

**1. Get current progress**
```bash
GET /api/gamification/ranks/progress

Response:
{
  "currentRank": "Nacom",
  "overallProgress": 0.42,
  "requirements": {
    "xp": { "completed": true },
    "quizzes": { "completed": false, "current": 32, "required": 75 },
    "achievements": { "completed": false, "current": 5, "required": 10 }
  }
}
```

**2. User completes requirements over time**

**3. Check eligibility**
```bash
GET /api/gamification/ranks/progress

# All requirements met
```

**4. Automatic rank promotion**
```bash
# Background job detects eligibility
# Promotes user to Nacom
# Awards 500 ML Coins bonus
# Unlocks advanced quizzes
# Emits rank:promoted WebSocket event
```

---

### Example 3: Prestige Flow

**1. Check eligibility**
```bash
GET /api/gamification/ranks/prestige

Response:
{
  "eligible": true,
  "currentPrestige": 0,
  "requirements": { "all": "met" }
}
```

**2. User confirms prestige**
```bash
POST /api/gamification/ranks/prestige
{
  "userId": "usr_123",
  "confirmation": true
}

Response:
{
  "newPrestigeLevel": 1,
  "rankReset": "Ajaw",
  "coinsRetained": 2500,
  "newMultiplier": 1.1,
  "permanentBenefits": { ... }
}
```

**3. User restarts progression with bonuses**
- All future XP gains: +10% permanent multiplier
- Retains half of ML Coins
- Keeps mastery achievements
- Gets exclusive prestige badge

---

### Example 4: Leaderboard Real-time Updates

**1. Client subscribes**
```javascript
socket.emit('leaderboard:subscribe', {
  type: 'global',
  metric: 'xp'
});
```

**2. User gains XP**
```bash
POST /api/gamification/coins/award
# XP updated
```

**3. Server emits update**
```javascript
socket.on('leaderboard:update', (data) => {
  console.log('Rank changed:', data.updates);
  // Update UI: "You moved from #850 to #847!"
});
```

---

### Example 5: Power-up Strategic Use

**1. Check inventory**
```bash
GET /api/gamification/powerups/inventory

Response:
{
  "powerups": [
    { "id": "pu_double_coins", "quantity": 3 },
    { "id": "pu_xp_booster", "quantity": 1, "onCooldown": false }
  ]
}
```

**2. Calculate optimal usage**
```bash
POST /api/gamification/coins/calculate-reward
{
  "quizDifficulty": "HARD",
  "score": 100
}

Response: { "totalCoins": 44 }

# With Double Coins: 44 × 2 = 88 coins
# Cost: 100 coins
# Net: -12 coins (not optimal)
```

**3. Wait for Expert quiz**
```bash
POST /api/gamification/coins/calculate-reward
{
  "quizDifficulty": "EXPERT",
  "score": 100
}

Response: { "totalCoins": 65 }

# With Double Coins: 65 × 2 = 130 coins
# Cost: 100 coins
# Net: +30 coins (profitable!)
```

**4. Activate power-up**
```bash
POST /api/gamification/powerups/activate
{
  "powerupId": "pu_double_coins"
}
```

---

## Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `INSUFFICIENT_BALANCE` | 400 | User doesn't have enough ML Coins |
| `POWERUP_ON_COOLDOWN` | 400 | Power-up is on cooldown |
| `POWERUP_NOT_IN_INVENTORY` | 404 | User doesn't own this power-up |
| `ACHIEVEMENT_ALREADY_UNLOCKED` | 400 | Achievement already unlocked |
| `RANK_REQUIREMENTS_NOT_MET` | 400 | Requirements for rank not met |
| `PRESTIGE_NOT_ELIGIBLE` | 400 | User not eligible for prestige |
| `INVALID_LEADERBOARD_METRIC` | 400 | Invalid metric specified |
| `USER_NOT_FOUND` | 404 | User doesn't exist |
| `UNAUTHORIZED` | 401 | Invalid or missing JWT |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |

---

## Performance Metrics

### Current Performance (p95)
- **Get User Rank:** 45ms
- **Get Leaderboard (cached):** 12ms
- **Get Leaderboard (uncached):** 142ms
- **Award Coins:** 38ms
- **Check Achievements:** 67ms
- **Purchase Power-up:** 52ms

### Cache Strategy
- **Leaderboards:** Redis, TTL 60s, 94% hit rate
- **User Stats:** Redis, TTL 30s, 89% hit rate
- **Rank Info:** Redis, TTL 3600s (static)
- **Achievement Definitions:** In-memory cache

### Database Indexes
```sql
-- Leaderboard queries
CREATE INDEX idx_gamification_xp ON gamification_stats(xp DESC, user_id);
CREATE INDEX idx_gamification_weekly ON gamification_stats(xp_this_week DESC) WHERE active = true;

-- Guild rankings
CREATE INDEX idx_guild_points ON guilds(total_points DESC, guild_id);

-- Transactions
CREATE INDEX idx_transactions_user_date ON coin_transactions(user_id, created_at DESC);
```

---

## Rate Limiting

- **Per User:** 100 requests/minute
- **Per IP:** 500 requests/minute
- **Leaderboard Endpoints:** 30 requests/minute
- **Admin Endpoints:** 10 requests/minute

**Rate Limit Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1698501600
```

---

## 🔗 Referencias a Implementación

### Requerimientos
📄 **[RF-GAM-001: Achievements](../../01-requerimientos/02-gamificacion/RF-GAM-001-achievements.md)**
📄 **[RF-GAM-002: Comodines](../../01-requerimientos/02-gamificacion/RF-GAM-002-comodines.md)**
📄 **[RF-GAM-003: Rangos Maya](../../01-requerimientos/02-gamificacion/RF-GAM-003-rangos-maya.md)**

### Database
🗄️ **Schema:** `gamification_system` → `apps/database/ddl/schemas/gamification_system/`
- `achievements` - Logros disponibles
- `user_achievements` - Logros desbloqueados por usuario
- `maya_ranks` - 9 rangos mayas (Tikal → Chichen Itza)
- `user_rank_history` - Historial de promociones de rango
- `comodines_inventory` - Inventario de power-ups por usuario
- `ml_coins_transactions` - Transacciones de ML Coins
- `leaderboards` - Rankings diarios/semanales/mensuales/all-time

🗄️ **ENUMs:**
- `achievement_type` → `apps/database/ddl/00-prerequisites.sql:47-54` (badge, milestone, special, rank_promotion)
- `achievement_category` → `apps/database/ddl/00-prerequisites.sql` (progress, streak, completion, social, special, mastery, exploration)
- `comodin_type` → `apps/database/ddl/00-prerequisites.sql:55-58` (hint, vision_lectora, segunda_oportunidad)
- `leaderboard_type` → daily, weekly, monthly, all_time

### Backend
💻 **Controllers:** `apps/backend/src/modules/gamification/controllers/`
- `achievement.controller.ts` - 6 endpoints de achievements
- `rank.controller.ts` - 4 endpoints de rangos Maya
- `comodin.controller.ts` - 6 endpoints de comodines
- `ml-coins.controller.ts` - 6 endpoints de ML Coins
- `leaderboard.controller.ts` - 10 endpoints de leaderboards

💻 **Services:** `apps/backend/src/modules/gamification/services/`
- `achievement.service.ts` - Desbloqueo automático de logros
- `rank.service.ts` - Cálculo de XP, promociones de rango
- `comodin.service.ts` - Compra y uso de power-ups (transaccional)
- `ml-coins.service.ts` - Sistema de economía, transacciones
- `leaderboard.service.ts` - Rankings con Redis cache

💻 **Algorithms:**
- `xp-calculator.util.ts` - Fórmula XP: baseDifficulty + scoreBonus + timeBonus + streakBonus
- `rank-promotion.util.ts` - Lógica de promoción automática
- `achievement-detector.util.ts` - Detección de unlock conditions

💻 **WebSocket:** `apps/backend/src/modules/gamification/gateways/`
- `gamification.gateway.ts` - Real-time updates de achievements, rank-ups, leaderboard changes

### Frontend
🎨 **Components:** `apps/frontend/src/features/gamification/components/`
- `AchievementGallery.tsx` - Galería de logros
- `RankBadge.tsx` - Badge visual de rango Maya
- `RankProgressBar.tsx` - Progress bar con XP actual/requerido
- `ComodinShop.tsx` - Tienda de power-ups
- `MLCoinsDisplay.tsx` - Display de ML Coins del usuario
- `LeaderboardTable.tsx` - Tabla de rankings

🎨 **Hooks:** `apps/frontend/src/features/gamification/hooks/`
- `useAchievements.ts` - useGetAchievements, useUnlockedAchievements
- `useRank.ts` - useGetRank, useRankProgress
- `useComodines.ts` - usePurchaseComodin, useComodinInventory
- `useMLCoins.ts` - useGetBalance, useTransactionHistory
- `useLeaderboard.ts` - useGetLeaderboard (daily/weekly/monthly/all-time)

🎨 **Types:** `apps/frontend/src/types/gamification.types.ts`
- Achievement, UserAchievement, MayaRank, Comodin, MLCoinTransaction, LeaderboardEntry

### WebSocket Events
- `achievement:unlocked` - Logro desbloqueado
- `rank:promoted` - Promoción de rango
- `leaderboard:position-changed` - Cambio en posición de ranking

---

## Changelog

### Version 1.0 (2025-10-28)
- Initial API specification
- 32 endpoints across 5 feature areas
- WebSocket support for real-time updates
- Redis caching strategy
- Comprehensive algorithms documentation

---

**Maintained by:** Backend Team + Game Design Team
**Contact:** api@gamilit.com
**Documentation:** https://docs.gamilit.com/api/gamification
