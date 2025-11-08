# Achievements System API

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** Achievements System
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

Sistema de logros que proporciona objetivos de corto, mediano y largo plazo en 4 categorías: Progress, Mastery, Social y Secret.

**Total de Endpoints:** 6

---

## Endpoints

### 3.1 Get User Achievements

**Endpoint:** `GET /achievements/user/:userId`

**Descripción:** Obtiene todos los logros de un usuario con estado de desbloqueo.

**Query Parameters:**
- `category` (optional): Filtrar por categoría (PROGRESS, MASTERY, SOCIAL, SECRET)
- `unlocked` (optional, boolean): Filtrar por estado de desbloqueo

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
      }
    ]
  }
}
```

**Cache:** Redis, TTL 30s

---

### 3.2 Get Achievement Details

**Endpoint:** `GET /achievements/:achievementId`

**Descripción:** Obtiene información detallada sobre un logro específico.

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": "ach_015",
    "name": "Speed Demon",
    "nameSpanish": "Demonio de Velocidad",
    "description": "Completa un quiz en menos del 30% del tiempo límite",
    "longDescription": "Demuestra tu maestría completando un quiz en tiempo récord.",
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
      "averageTimeToUnlock": "3.2 weeks"
    },
    "iconUrl": "/assets/achievements/speed_demon.png"
  }
}
```

---

### 3.3 Check Achievement Progress

**Endpoint:** `POST /achievements/check-progress`

**Descripción:** Verifica si acciones recientes activaron desbloqueos de logros.

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
- Otorga coins y XP por logros desbloqueados
- Crea registros de desbloqueo
- Activa notificaciones
- Actualiza contadores de progreso

---

### 3.4 Get Achievement Categories

**Endpoint:** `GET /achievements/categories`

**Descripción:** Obtiene todas las categorías de logros con conteos.

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

**Descripción:** Obtiene usuarios ordenados por cantidad de logros.

**Query Parameters:**
- `limit` (optional, default: 100): Número de usuarios
- `category` (optional): Filtrar por categoría

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

**Descripción:** Desbloquea un logro manualmente (solo admin, para testing/correcciones).

**Auth:** Requiere rol admin

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

## Categorías de Logros

### 1. PROGRESS (Progreso)
Logros que recompensan avance continuo y consistencia.

**Ejemplos:**
- First Steps (Common): Completa tu primer quiz
- Streak Warrior (Rare): Mantén un streak de 30 días
- Century Club (Epic): Completa 100 quizzes

### 2. MASTERY (Maestría)
Logros que recompensan dominio y excelencia.

**Ejemplos:**
- Perfect Score (Uncommon): Obtén 100% en un quiz
- Speed Demon (Rare): Completa quiz en <30% del tiempo
- Math Master (Legendary): Domina todos los tópicos de matemáticas

### 3. SOCIAL (Social)
Logros que recompensan participación en comunidad.

**Ejemplos:**
- Team Player (Common): Únete a un guild
- Guild Leader (Rare): Lidera un guild a top 10
- Mentor (Epic): Ayuda a 50 estudiantes

### 4. SECRET (Secreto)
Logros ocultos que recompensan exploración.

**Ejemplos:**
- Easter Egg Hunter: Encuentra contenido oculto
- Night Owl: Completa quiz a las 3 AM
- Lucky Seven: Completa 7 quizzes seguidos con score 77%

---

## Rareza de Logros

### COMMON (Común)
- **Porcentaje de Jugadores:** 50-100%
- **Recompensa:** 10-50 ML Coins, 5-25 XP
- **Tiempo Promedio:** 1-7 días

### UNCOMMON (Poco Común)
- **Porcentaje de Jugadores:** 25-50%
- **Recompensa:** 50-100 ML Coins, 25-50 XP
- **Tiempo Promedio:** 1-2 semanas

### RARE (Raro)
- **Porcentaje de Jugadores:** 10-25%
- **Recompensa:** 100-250 ML Coins, 50-100 XP
- **Tiempo Promedio:** 2-4 semanas

### EPIC (Épico)
- **Porcentaje de Jugadores:** 5-10%
- **Recompensa:** 250-500 ML Coins, 100-250 XP, Badge
- **Tiempo Promedio:** 1-2 meses

### LEGENDARY (Legendario)
- **Porcentaje de Jugadores:** <5%
- **Recompensa:** 500+ ML Coins, 250+ XP, Badge, Title
- **Tiempo Promedio:** 3+ meses

---

## Referencias

- [Rangos Maya API](./01-RANGOS-MAYA.md)
- [ML Coins API](./02-ML-COINS.md)
- [Leaderboards API](./05-LEADERBOARDS.md)

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
