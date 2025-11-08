# Leaderboards API

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** Leaderboards System
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Leaderboards proporcionan rankings competitivos a través de múltiples marcos temporales y métricas.

**Total de Endpoints:** 6

---

## Endpoints

### 5.1 Get Global Leaderboard

**Endpoint:** `GET /leaderboards/global`

**Query Parameters:**
- `metric` (optional, default: "xp"): Métrica de ranking (xp, streak, achievements, coins)
- `limit` (optional, default: 100, max: 500): Número de usuarios

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
      }
    ]
  }
}
```

**Cache:** Redis, TTL 60s

---

### 5.4 Get Guild Leaderboard

**Endpoint:** `GET /leaderboards/guilds`

**Query:** `?limit=50`

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
      }
    ]
  }
}
```

**Cache:** Redis, TTL 30s

---

### 5.6 Get Leaderboard History

**Endpoint:** `GET /leaderboards/history/:userId`

**Query Parameters:**
- `period` (optional, default: "30d"): Periodo de tiempo (7d, 30d, 90d, all)
- `metric` (optional, default: "xp"): Métrica a trackear

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

## Métricas de Leaderboard

### XP (Experience Points)
Métrica principal de progresión general.

### Streak
Días consecutivos con actividad.

### Achievements
Cantidad de logros desbloqueados.

### Coins
Balance total de ML Coins.

---

## Periodos de Leaderboard

### Global (All-Time)
- **Reseteo:** Nunca
- **Rewards:** Solo reconocimiento

### Weekly
- **Reseteo:** Lunes 00:00 UTC
- **Rewards:** Top 1-100
- **Prize Pool:** 10,000 ML Coins

### Monthly
- **Reseteo:** Primer día del mes 00:00 UTC
- **Rewards:** Top 1-50
- **Prize Pool:** 50,000 ML Coins + Titles

---

## Recompensas por Leaderboard

### Weekly Rewards
1. **Rank 1:** 500 ML Coins + "Weekly Champion"
2. **Rank 2-3:** 300 ML Coins
3. **Rank 4-10:** 200 ML Coins
4. **Rank 11-50:** 100 ML Coins
5. **Rank 51-100:** 50 ML Coins

### Monthly Rewards
1. **Rank 1:** 2,000 ML Coins + "Monthly Champion" + Crown Badge
2. **Rank 2-3:** 1,500 ML Coins + Crown Badge
3. **Rank 4-10:** 1,000 ML Coins + Medal Badge
4. **Rank 11-25:** 500 ML Coins
5. **Rank 26-50:** 250 ML Coins

---

## Algoritmo de Ranking

Ver [06-ALGORITMOS-SCHEMAS.md](./06-ALGORITMOS-SCHEMAS.md#leaderboard-ranking-algorithm)

**PostgreSQL Window Functions:**
```sql
WITH ranked_users AS (
  SELECT
    user_id,
    xp,
    RANK() OVER (ORDER BY xp DESC) as rank,
    PERCENT_RANK() OVER (ORDER BY xp DESC) as percentile
  FROM gamification_stats
  WHERE active = true
)
SELECT rank, percentile
FROM ranked_users
WHERE user_id = $1
```

---

## Cache Strategy

- **Top 100:** Redis, TTL 60s
- **User Position:** Redis, TTL 30s
- **Full Leaderboard:** PostgreSQL query, cached 60s

---

## Referencias

- [Rangos Maya API](./01-RANGOS-MAYA.md)
- [Achievements API](./03-ACHIEVEMENTS.md)
- [WebSocket Events](./07-WEBSOCKET-EJEMPLOS.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
