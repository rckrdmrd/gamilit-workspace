# API de Gamificación

**Proyecto:** GAMILIT
**RFC:** RFC-0001
**Versión:** 1.0.0
**Última Actualización:** 2025-11-01

---

## Información General

**Base:** `/api/gamification`
**Total Endpoints:** 25+
**Autenticación:** Requerida

---

## Índice de Endpoints

### Estadísticas y Monedas
1. [GET /stats](#get-stats) - Estadísticas del usuario
2. [POST /coins/add](#post-coinsadd) - Añadir ML Coins (admin)
3. [GET /coins/transactions](#get-coinstransactions) - Historial de transacciones

### Logros
4. [GET /achievements](#get-achievements) - Todos los logros
5. [GET /achievements/user](#get-achievementsuser) - Logros del usuario
6. [POST /achievements/:id/unlock](#post-achievementsidunlock) - Desbloquear logro

### Misiones
7. [GET /missions](#get-missions) - Misiones activas
8. [POST /missions/:id/progress](#post-missionsidprogress) - Actualizar progreso
9. [POST /missions/:id/claim](#post-missionsidclaim) - Reclamar recompensas

### Leaderboards
10. [GET /leaderboards/:type](#get-leaderboardstype) - Tabla de clasificación

---

## GET /stats

Obtiene estadísticas del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "userId": "uuid",
    "mlCoins": 1500,
    "mlCoinsEarnedTotal": 5000,
    "mlCoinsSpentTotal": 3500,
    "totalXP": 12500,
    "currentLevel": 15,
    "currentRank": "Gold",
    "rankProgress": 75.5,
    "streakDays": 7,
    "longestStreak": 21,
    "lastLoginAt": "2025-10-27T10:00:00Z",
    "totalExercisesCompleted": 150,
    "perfectScores": 45,
    "averageScore": 87.3,
    "updatedAt": "2025-10-27T10:30:00Z"
  }
}
```

---

## POST /coins/add

Añade ML Coins al usuario (admin only).

**Autenticación:** Requerida (super_admin)

### Request Body
```json
{
  "userId": "uuid",
  "amount": 100,
  "reason": "Manual adjustment",
  "transactionType": "admin_adjustment"
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "newBalance": 1600,
    "transaction": {
      "amount": 100,
      "reason": "Manual adjustment",
      "balanceAfter": 1600
    }
  }
}
```

---

## GET /coins/transactions

Obtiene historial de transacciones ML Coins.

**Autenticación:** Requerida

### Query Params
- `limit` (number, default: 20): Número de transacciones

### Response 200
```json
{
  "success": true,
  "data": {
    "transactions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "amount": 100,
        "transactionType": "exercise_completion",
        "reason": "Completed exercise: Variables",
        "referenceId": "exercise-uuid",
        "balanceAfter": 1600,
        "createdAt": "2025-10-27T10:30:00Z"
      }
    ]
  }
}
```

---

## GET /achievements

Obtiene todos los logros disponibles.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "name": "First Steps",
        "description": "Complete your first exercise",
        "category": "progress",
        "icon": "🎯",
        "rarity": "common",
        "mlCoinsReward": 50,
        "xpReward": 100,
        "isSecret": false
      }
    ]
  }
}
```

---

## GET /achievements/user

Obtiene logros desbloqueados del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "achievements": [
      {
        "id": "uuid",
        "userId": "uuid",
        "achievementId": "uuid",
        "achievement": {
          "name": "First Steps",
          "description": "Complete your first exercise",
          "icon": "🎯",
          "rarity": "common",
          "mlCoinsReward": 50,
          "xpReward": 100
        },
        "unlockedAt": "2025-10-20T15:30:00Z",
        "progress": 100
      }
    ]
  }
}
```

---

## GET /missions

Obtiene misiones activas del usuario.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "missions": [
      {
        "id": "uuid",
        "userId": "uuid",
        "templateId": "daily_exercise_3",
        "title": "Daily Practice",
        "description": "Complete 3 exercises today",
        "type": "daily",
        "objectives": [
          {
            "id": "obj1",
            "description": "Complete exercises",
            "target": 3,
            "current": 1,
            "completed": false
          }
        ],
        "rewards": {
          "mlCoins": 100,
          "xp": 200
        },
        "status": "active",
        "startDate": "2025-10-27T00:00:00Z",
        "endDate": "2025-10-27T23:59:59Z"
      }
    ]
  }
}
```

---

## POST /missions/:id/progress

Actualiza progreso de misión.

**Autenticación:** Requerida

### Request Body
```json
{
  "objectiveId": "obj1",
  "increment": 1
}
```

### Response 200
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "uuid",
      "status": "completed",
      "objectives": [
        {
          "id": "obj1",
          "current": 3,
          "completed": true
        }
      ],
      "completedAt": "2025-10-27T10:30:00Z"
    }
  }
}
```

---

## POST /missions/:id/claim

Reclama recompensas de misión completada.

**Autenticación:** Requerida

### Response 200
```json
{
  "success": true,
  "data": {
    "mission": {
      "id": "uuid",
      "status": "claimed",
      "claimedAt": "2025-10-27T10:35:00Z"
    },
    "rewards": {
      "mlCoins": 100,
      "xp": 200
    },
    "newBalance": {
      "mlCoins": 1700,
      "totalXP": 12700
    }
  }
}
```

---

## GET /leaderboards/:type

Obtiene tabla de clasificación.

**Autenticación:** Requerida
**Rate Limit:** 30 requests / minuto

### Params
- `type`: `global` | `friends` | `classroom` | `guild`

### Query Params
- `limit` (number, default: 100)
- `classroomId` (uuid, si type=classroom)
- `guildId` (uuid, si type=guild)

### Response 200
```json
{
  "success": true,
  "data": {
    "type": "global",
    "leaderboard": [
      {
        "rank": 1,
        "userId": "uuid",
        "displayName": "Top Player",
        "totalXP": 50000,
        "currentLevel": 30,
        "avatarUrl": "https://..."
      }
    ],
    "currentUser": {
      "rank": 45,
      "userId": "uuid",
      "displayName": "You",
      "totalXP": 12500,
      "currentLevel": 15
    }
  }
}
```

---

## Tipos de Transacciones

| Tipo | Descripción | Coins |
|------|-------------|-------|
| `exercise_completion` | Completar ejercicio | +50-200 |
| `mission_reward` | Recompensa de misión | +100-500 |
| `achievement_unlock` | Logro desbloqueado | +50-1000 |
| `daily_login` | Login diario | +10 |
| `streak_bonus` | Bonus por racha | +50-500 |
| `purchase` | Compra en tienda | -XXX |
| `admin_adjustment` | Ajuste manual | +/- any |

---

## Rareza de Logros

| Rareza | Recompensa Coins | Recompensa XP |
|--------|------------------|---------------|
| `common` | 50-100 | 100-200 |
| `uncommon` | 100-200 | 200-400 |
| `rare` | 200-500 | 500-1000 |
| `epic` | 500-1000 | 1000-2500 |
| `legendary` | 1000+ | 2500+ |

---

## Documentos Relacionados

- [GamificationService](../servicios/Servicios-Gamificacion.md) - Lógica de negocio
- [MissionsService](../servicios/Servicios-Gamificacion.md) - Sistema de misiones
- [README de API](./README.md) - Índice de endpoints

---

**Última revisión:** 2025-11-01
