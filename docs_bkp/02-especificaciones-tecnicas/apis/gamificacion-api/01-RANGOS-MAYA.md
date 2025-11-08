# Rangos Maya API

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** Rangos Maya System
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

El sistema de rangos proporciona progresión visible a través de 5 rangos militares inspirados en la cultura Maya: Ajaw, Nacom, Ah K'in, Halach Uinic, y K'uk'ulkan.

**Total de Endpoints:** 6

---

## Tipos Utilizados

Esta API utiliza los siguientes tipos definidos en [tipos-compartidos](../../tipos-compartidos/):

### MayaRank (Enum)
**Fuente:** [TYPES-GAMIFICATION.md](../../tipos-compartidos/TYPES-GAMIFICATION.md#mayarank)

```typescript
enum MayaRank {
  AJAW = "Ajaw",                    // Rank 1 - Señor/Gobernante (Iniciado)
  NACOM = "Nacom",                  // Rank 2 - Capitán de Guerra (Explorador)
  AH_KIN = "Ah K'in",               // Rank 3 - Sacerdote del Sol (Analítico)
  HALACH_UINIC = "Halach Uinic",    // Rank 4 - Hombre Verdadero (Crítico)
  KUKUKULKAN = "K'uk'ulkan"         // Rank 5 - Serpiente Emplumada (Maestro)
}
```

### UserGamificationProfile (Interface)
**Fuente:** [TYPES-GAMIFICATION.md](../../tipos-compartidos/TYPES-GAMIFICATION.md#usergamificationprofile)

Campos relacionados con rangos:
- `current_rank: MayaRank` - Rango actual del usuario
- `xp_total: number` - XP total acumulado
- `rank_multiplier: number` - Multiplicador del rango actual (1.0x - 2.0x)

---

## Endpoints

### 1.1 Get User Rank

**Endpoint:** `GET /ranks/user/:userId`

**Descripción:** Recupera información del rango actual de un usuario.

**Parámetros:**
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
    "multiplier": 1.25,
    "nextRank": "Ah K'in",
    "earnedAt": "2025-10-15T14:30:00Z",
    "benefits": {
      "coinMultiplier": 1.25,
      "powerUpDiscount": 0,
      "specialAccess": ["intermediate_quizzes"]
    }
  }
}
```

**Cache:** Redis, TTL 30s

---

### 1.2 Get Rank Progress

**Endpoint:** `GET /ranks/progress`

**Descripción:** Obtiene progreso detallado hacia el siguiente rango.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "currentRank": "Nacom",
    "nextRank": "Ah K'in",
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

**Descripción:** Obtiene información sobre todos los rangos disponibles.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "rank": "Ajaw",
      "level": 1,
      "name": "Ajaw",
      "nameSpanish": "Señor/Gobernante",
      "historicalMeaning": "Título maya para señor o gobernante, nivel iniciado en el aprendizaje.",
      "xpRange": [0, 1000],
      "multiplier": 1.0,
      "averageTime": "1-2 weeks",
      "rewards": {
        "coins": 50,
        "powerUps": [],
        "unlocks": ["basic_quizzes"]
      },
      "iconUrl": "/assets/ranks/ajaw.png"
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
        "xp": 1000,
        "quizzes": 2,
        "score": 70
      },
      "rewards": {
        "coins": 75,
        "badge": "nacom_warrior",
        "unlocks": ["intermediate_quizzes"]
      },
      "iconUrl": "/assets/ranks/nacom.png"
    }
  ]
}
```

**Cache:** Redis, TTL 3600s (static data)

---

### 1.4 Calculate XP Gain

**Endpoint:** `POST /ranks/calculate-xp`

**Descripción:** Calcula el XP que se ganaría por completar un quiz.

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
    "rankMultiplier": 1.25,
    "difficultyMultiplier": 2.0,
    "streakBonus": 1.12,
    "perfectBonus": 1.5,
    "speedBonus": 1.1,
    "totalXP": 207,
    "breakdown": {
      "base": 50,
      "afterRank": 62,
      "afterDifficulty": 125,
      "afterStreak": 140,
      "afterPerfect": 210,
      "afterSpeed": 207
    }
  }
}
```

---

### 1.5 Get Prestige Info

**Endpoint:** `GET /ranks/prestige`

**Descripción:** Obtiene información del sistema de prestigio y elegibilidad.

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

**Descripción:** Ejecuta acción de prestigio (resetea rango con beneficios permanentes).

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
      "title": "K'uk'ulkan [Prestige 1]",
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
- Resetea rango a Ajaw
- Resetea XP a 0
- Retiene 50% de ML Coins
- Mantiene logros de maestría
- Agrega bonus de multiplicador permanente

---

## Rangos Maya - Especificaciones

### Rango 1: Ajaw (Señor/Gobernante)
- **XP Range:** 0-1,000
- **Multiplier:** 1.0x
- **Tiempo Promedio:** 1-2 semanas
- **Requisitos:** 1 módulo completado, score ≥70%
- **Recompensas:** 50 ML Coins
- **Desbloqueos:** Basic Quizzes

### Rango 2: Nacom (Capitán de Guerra)
- **XP Range:** 1,000-3,000
- **Multiplier:** 1.25x
- **Tiempo Promedio:** 2-3 semanas
- **Requisitos:** 2 módulos completados, score ≥70%
- **Recompensas:** 75 ML Coins, Nacom Warrior Badge
- **Desbloqueos:** Intermediate Quizzes

### Rango 3: Ah K'in (Sacerdote del Sol)
- **XP Range:** 3,000-6,000
- **Multiplier:** 1.5x
- **Tiempo Promedio:** 3-4 semanas
- **Requisitos:** 3 módulos completados, score ≥70%
- **Recompensas:** 100 ML Coins
- **Desbloqueos:** Advanced Quizzes

### Rango 4: Halach Uinic (Hombre Verdadero)
- **XP Range:** 6,000-10,000
- **Multiplier:** 1.75x
- **Tiempo Promedio:** 4-6 semanas
- **Requisitos:** 4 módulos completados, score ≥70%
- **Recompensas:** 125 ML Coins
- **Desbloqueos:** Expert Quizzes

### Rango 5: K'uk'ulkan (Serpiente Emplumada)
- **XP Range:** 10,000+
- **Multiplier:** 2.0x
- **Tiempo Promedio:** 6+ semanas
- **Requisitos:** 5 módulos completados, score ≥70%
- **Recompensas:** 150 ML Coins
- **Desbloqueos:** All Content, Prestige System, VIP Features

---

## Sistema de Prestigio

### Requisitos para Prestigio
1. Alcanzar rango Halach Uinic
2. 10,000 XP total acumulado
3. 50 logros desbloqueados
4. Completar Grand Challenge

### Beneficios de Prestigio
- **Multiplicador Permanente:** +0.1x por nivel de prestigio
- **Retención de Coins:** 50% de ML Coins se mantienen
- **Título Permanente:** "Halach Uinic [Prestige X]"
- **Badge Exclusivo:** Badge de prestigio según nivel
- **Acceso VIP:** Contenido y features exclusivos
- **Logros Mantenidos:** Todos los logros de maestría se conservan

### Niveles de Prestigio
- **Prestige 1:** Silver Badge, +0.1x multiplier
- **Prestige 2:** Gold Badge, +0.2x multiplier
- **Prestige 3:** Platinum Badge, +0.3x multiplier
- **Prestige 5:** Diamond Badge, +0.5x multiplier
- **Prestige 10:** Legendary Badge, +1.0x multiplier

---

## Algoritmo de Cálculo de XP

Ver [06-ALGORITMOS-SCHEMAS.md](./06-ALGORITMOS-SCHEMAS.md#xp-calculation-algorithm) para detalles completos.

**Fórmula:**
```
XP_total = XP_base × mult_rank × mult_difficulty × mult_streak × mult_perfect × mult_speed
```

---

## Referencias

- [ML Coins API](./02-ML-COINS.md)
- [Achievements API](./03-ACHIEVEMENTS.md)
- [Algoritmos y Schemas](./06-ALGORITMOS-SCHEMAS.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
