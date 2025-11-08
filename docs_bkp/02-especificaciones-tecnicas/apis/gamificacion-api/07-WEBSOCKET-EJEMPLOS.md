# WebSocket Events y Ejemplos

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** WebSocket & Examples
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## WebSocket Events

### Conectar al Socket de Gamificación

**Endpoint:** `ws://api.gamilit.com/gamification`

**Autenticación:**
```javascript
const socket = io('/gamification', {
  auth: {
    token: 'JWT_TOKEN'
  }
});
```

---

## Eventos Emitidos por el Servidor

### 1. `leaderboard:update`
Emitido cuando las posiciones del leaderboard cambian.

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

### 2. `achievement:unlocked`
Emitido cuando el usuario desbloquea un logro.

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

### 3. `rank:promoted`
Emitido cuando el usuario sube de rango.

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

### 4. `coins:updated`
Emitido cuando el balance de coins cambia significativamente.

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

### 5. `streak:milestone`
Emitido cuando el usuario alcanza un milestone de streak.

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

### 6. `guild:event`
Emitido para eventos relacionados con guilds.

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

## Eventos Recibidos por el Servidor

### 1. `leaderboard:subscribe`
Suscribirse a actualizaciones de leaderboard.

**Payload:**
```json
{
  "type": "global",
  "metric": "xp"
}
```

### 2. `leaderboard:unsubscribe`
Desuscribirse de actualizaciones.

**Payload:**
```json
{
  "type": "global"
}
```

### 3. `user:status`
Solicitar estado actual del usuario.

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

## Ejemplos de Uso

### Ejemplo 1: Flujo Completo de Quiz

**1. Calcular recompensas esperadas**
```bash
POST /api/gamification/ranks/calculate-xp
POST /api/gamification/coins/calculate-reward

# Usuario ve: "Completa este quiz y gana ~45 ML Coins y ~150 XP"
```

**2. Usuario activa power-up**
```bash
POST /api/gamification/powerups/activate
{
  "powerupId": "pu_double_coins",
  "context": { "quizId": "quiz_456" }
}
```

**3. Quiz completado, otorgar recompensas**
```bash
POST /api/gamification/coins/award
{
  "userId": "usr_123",
  "amount": 88,
  "source": "QUIZ_COMPLETION"
}
```

**4. Verificar desbloqueo de logros**
```bash
POST /api/gamification/achievements/check-progress
{
  "userId": "usr_123",
  "eventType": "QUIZ_COMPLETED",
  "eventData": { "score": 100, "timeUsed": 180 }
}

# Response: Achievement "Speed Demon" unlocked! +150 ML Coins
```

**5. Actualizar leaderboard**
```bash
# Trabajo en segundo plano automático
# WebSocket emite leaderboard:update a clientes suscritos
```

---

### Ejemplo 2: Verificar Progreso de Rango

**1. Obtener progreso actual**
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

**2. Usuario completa requisitos a lo largo del tiempo**

**3. Verificar elegibilidad**
```bash
GET /api/gamification/ranks/progress

# Todos los requisitos cumplidos
```

**4. Promoción de rango automática**
```bash
# Trabajo en segundo plano detecta elegibilidad
# Promueve usuario a Nacom
# Otorga 500 ML Coins de bonus
# Desbloquea quizzes avanzados
# Emite rank:promoted por WebSocket
```

---

### Ejemplo 3: Flujo de Prestigio

**1. Verificar elegibilidad**
```bash
GET /api/gamification/ranks/prestige

Response:
{
  "eligible": true,
  "currentPrestige": 0,
  "requirements": { "all": "met" }
}
```

**2. Usuario confirma prestigio**
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

**3. Usuario reinicia progresión con bonuses**
- Todas las ganancias futuras de XP: +10% multiplicador permanente
- Retiene mitad de ML Coins
- Mantiene logros de maestría
- Obtiene badge exclusivo de prestigio

---

### Ejemplo 4: Actualizaciones en Tiempo Real de Leaderboard

**1. Cliente se suscribe**
```javascript
socket.emit('leaderboard:subscribe', {
  type: 'global',
  metric: 'xp'
});
```

**2. Usuario gana XP**
```bash
POST /api/gamification/coins/award
# XP actualizado
```

**3. Servidor emite actualización**
```javascript
socket.on('leaderboard:update', (data) => {
  console.log('Rank changed:', data.updates);
  // Actualizar UI: "You moved from #850 to #847!"
});
```

---

### Ejemplo 5: Uso Estratégico de Power-up

**1. Verificar inventario**
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

**2. Calcular uso óptimo**
```bash
POST /api/gamification/coins/calculate-reward
{
  "quizDifficulty": "HARD",
  "score": 100
}

Response: { "totalCoins": 44 }

# Con Double Coins: 44 × 2 = 88 coins
# Costo: 100 coins
# Neto: -12 coins (no óptimo)
```

**3. Esperar a quiz Expert**
```bash
POST /api/gamification/coins/calculate-reward
{
  "quizDifficulty": "EXPERT",
  "score": 100
}

Response: { "totalCoins": 65 }

# Con Double Coins: 65 × 2 = 130 coins
# Costo: 100 coins
# Neto: +30 coins (¡rentable!)
```

**4. Activar power-up**
```bash
POST /api/gamification/powerups/activate
{
  "powerupId": "pu_double_coins"
}
```

---

## Códigos de Error

| Código | HTTP Status | Descripción |
|--------|-------------|-------------|
| `INSUFFICIENT_BALANCE` | 400 | Usuario no tiene suficientes ML Coins |
| `POWERUP_ON_COOLDOWN` | 400 | Power-up está en cooldown |
| `POWERUP_NOT_IN_INVENTORY` | 404 | Usuario no posee este power-up |
| `ACHIEVEMENT_ALREADY_UNLOCKED` | 400 | Logro ya desbloqueado |
| `RANK_REQUIREMENTS_NOT_MET` | 400 | Requisitos para rango no cumplidos |
| `PRESTIGE_NOT_ELIGIBLE` | 400 | Usuario no elegible para prestigio |
| `INVALID_LEADERBOARD_METRIC` | 400 | Métrica inválida especificada |
| `USER_NOT_FOUND` | 404 | Usuario no existe |
| `UNAUTHORIZED` | 401 | JWT inválido o faltante |
| `RATE_LIMIT_EXCEEDED` | 429 | Demasiadas requests |

---

## Rate Limiting

- **Por Usuario:** 100 requests/minuto
- **Por IP:** 500 requests/minuto
- **Endpoints de Leaderboard:** 30 requests/minuto
- **Endpoints de Admin:** 10 requests/minuto

**Headers:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1698501600
```

---

## Changelog

### Version 1.0 (2025-10-28)
- Especificación inicial de API
- 32 endpoints en 5 áreas funcionales
- Soporte para WebSocket para actualizaciones en tiempo real
- Estrategia de cache Redis
- Documentación completa de algoritmos

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
**Contacto:** api@gamilit.com
**Documentación:** https://docs.gamilit.com/api/gamification
