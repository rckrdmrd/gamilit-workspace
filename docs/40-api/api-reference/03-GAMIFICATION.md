---
title: "API Reference - Gamification"
status: activo
last_updated: "2026-03-01"
---

# API Reference - Gamification

> Volver al [API Reference Hub](../API-REFERENCE.md)

---

## 6. Gamification Module (73 endpoints)

> Rutas reales extraidas de los 11 controladores. Base URL: `/api/v1`. Todos los endpoints requieren JWT salvo indicacion contraria.

### Achievements (9 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/achievements` | Listar todos los achievements disponibles | Si | any |
| GET | `/api/v1/gamification/achievements/:id` | Detalle de achievement por ID | Si | any |
| GET | `/api/v1/gamification/achievements/user/:userId/progress/:achievementId` | Progreso de un achievement para un usuario | Si | any |
| POST | `/api/v1/gamification/achievements/user/:userId/unlock/:achievementId` | Desbloquear achievement manualmente (admin) | Si | admin |
| GET | `/api/v1/gamification/users/:userId/achievements` | Todos los achievements del usuario (completados, en progreso, bloqueados) | Si | any |
| GET | `/api/v1/gamification/users/:userId/achievements/summary` | Resumen estadistico de achievements del usuario | Si | any |
| POST | `/api/v1/gamification/users/:userId/achievements/:achievementId` | Otorgar o actualizar progreso de achievement | Si | any |
| POST | `/api/v1/gamification/users/:userId/achievements/:achievementId/claim` | Reclamar recompensas de achievement completado | Si | any |
| PATCH | `/api/v1/gamification/achievements/:id` | Activar/desactivar achievement (toggle is_active) | Si | admin |

### Leaderboard (5 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/leaderboard/global` | Ranking global de todos los usuarios por XP | Si | any |
| GET | `/api/v1/gamification/leaderboards/user-rank` | Posicion del usuario autenticado en el leaderboard | Si | any |
| GET | `/api/v1/gamification/leaderboard/schools/:schoolId` | Ranking de una escuela por XP | Si | any |
| GET | `/api/v1/gamification/leaderboard/classrooms/:classroomId` | Ranking de un aula por XP | Si | any |
| GET | `/api/v1/gamification/leaderboard/friends/:userId` | Ranking de amigos de un usuario por XP | Si | any |

### User Stats (4 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/users/:userId/stats` | Estadisticas completas de gamificacion del usuario | Si | any |
| GET | `/api/v1/gamification/users/:userId/summary` | Resumen consolidado: nivel, XP, coins, rango, achievements | Si | any |
| GET | `/api/v1/gamification/users/:userId/rank` | Rango maya actual y progreso hacia el siguiente | Si | any |
| PATCH | `/api/v1/gamification/users/:userId/stats` | Actualizar estadisticas del usuario (XP, nivel, racha, etc.) | Si | any |

### Ranks — Rangos Maya (12 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/ranks` | Listar todos los rangos maya con metadata | No | public |
| GET | `/api/v1/gamification/ranks/current` | Rango actual del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-progress` | Progreso hacia el siguiente rango | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/progress` | Progreso completo (nivel, XP, rango, multiplicadores, streaks) | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/multipliers` | Desglose completo de multiplicadores (rango, racha, eventos) | Si | any |
| GET | `/api/v1/gamification/ranks/users/:userId/rank-history` | Historial completo de rangos del usuario | Si | any |
| GET | `/api/v1/gamification/ranks/check-promotion/:userId` | Verificar elegibilidad para promocion de rango | Si | any |
| POST | `/api/v1/gamification/ranks/promote/:userId` | Promocionar usuario al siguiente rango maya | Si | any |
| GET | `/api/v1/gamification/ranks/:id` | Detalle de un registro de rango por ID | No | public |
| POST | `/api/v1/gamification/ranks/admin/ranks` | Crear registro de rango manualmente | Si | admin, super_admin |
| PUT | `/api/v1/gamification/ranks/admin/ranks/:id` | Actualizar registro de rango | Si | admin, super_admin |
| DELETE | `/api/v1/gamification/ranks/admin/ranks/:id` | Eliminar registro de rango | Si | admin, super_admin |

### ML Coins — Economia Virtual (8 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/users/:userId/ml-coins` | Balance actual y estadisticas de ML Coins | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/transactions` | Historial de transacciones de ML Coins (paginado) | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/add` | Agregar ML Coins al balance del usuario | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/spend` | Gastar ML Coins con validacion de saldo | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/multiplier` | Informacion del multiplicador de rango actual | Si | any |
| GET | `/api/v1/gamification/ml-coins/multiplier-table` | Tabla completa de multiplicadores por rango | Si | any |
| GET | `/api/v1/gamification/users/:userId/ml-coins/calculate` | Calcular ML Coins con multiplicador de rango (?baseAmount=N) | Si | any |
| POST | `/api/v1/gamification/users/:userId/ml-coins/add-with-multiplier` | Agregar ML Coins aplicando multiplicador de rango automaticamente | Si | any |

### Missions — Misiones (8 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/missions/daily` | Misiones diarias del usuario autenticado (genera si no existen) | Si | any |
| GET | `/api/v1/gamification/missions/weekly` | Misiones semanales del usuario autenticado (genera si no existen) | Si | any |
| GET | `/api/v1/gamification/missions/special` | Misiones especiales activas del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/missions/stats/me` | Estadisticas de misiones del usuario autenticado | Si | any |
| GET | `/api/v1/gamification/missions/stats/:userId` | Estadisticas de misiones de un usuario especifico | Si | any |
| POST | `/api/v1/gamification/missions/:id/start` | Iniciar una mision (status -> in_progress) | Si | any |
| PATCH | `/api/v1/gamification/missions/:id/progress` | Actualizar progreso de un objetivo de la mision | Si | any |
| POST | `/api/v1/gamification/missions/:id/claim` | Reclamar recompensas de mision completada (XP, ML Coins, rango) | Si | any |

### Mission Templates — Admin (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/admin/mission-templates` | Listar templates con filtros (type, difficulty, is_active, etc.) | Si | admin |
| GET | `/api/v1/admin/mission-templates/:id` | Obtener template por ID | Si | admin |
| POST | `/api/v1/admin/mission-templates` | Crear nuevo template de mision | Si | admin |
| PATCH | `/api/v1/admin/mission-templates/:id` | Actualizar template existente (partial update) | Si | admin |
| DELETE | `/api/v1/admin/mission-templates/:id` | Desactivar template (soft delete) | Si | admin |
| POST | `/api/v1/admin/mission-templates/seed/initial` | Sembrar templates iniciales en la base de datos | Si | admin |

### Classroom Missions — Misiones de Aula (5 endpoints)

> **Controller:** `ClassroomMissionsController` en `apps/backend/src/modules/gamification/controllers/classroom-missions.controller.ts`

| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| POST | `/api/v1/gamification/classrooms/:classroomId/missions` | Asignar mision a un aula (con bonificaciones opcionales) | Si | teacher |
| GET | `/api/v1/gamification/classrooms/:classroomId/missions` | Listar todas las misiones del aula | Si | teacher/student |
| GET | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Obtener mision especifica del aula | Si | teacher/student |
| DELETE | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Remover (desactivar) mision del aula | Si | teacher |
| PATCH | `/api/v1/gamification/classrooms/:classroomId/missions/:missionTemplateId` | Actualizar configuracion de mision del aula | Si | teacher |

### Shop — Tienda (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/shop/categories` | Listar categorias activas de la tienda | Si | any |
| GET | `/api/v1/gamification/shop/items` | Listar items con filtros opcionales (category, rarity, available) | Si | any |
| GET | `/api/v1/gamification/shop/items/:id` | Detalle de item por ID | Si | any |
| POST | `/api/v1/gamification/shop/purchase` | Comprar item con ML Coins (valida stock, saldo, requisitos) | Si | any |
| GET | `/api/v1/gamification/shop/purchases/:userId` | Historial de compras del usuario | Si | any |
| GET | `/api/v1/gamification/shop/owned/:userId/:itemId` | Verificar si usuario posee un item | Si | any |

**Response codes adicionales para POST /gamification/shop/purchase:**
| HTTP | Condicion | Descripcion |
|------|-----------|-------------|
| 409 | Conflicto de concurrencia | `Conflicto de concurrencia en re-compra de consumible (CONSUMABLE_PURCHASE_CONFLICT)` |

> **Re-compra de consumibles:** Items consumibles permiten compras multiples. Cada nueva compra desactiva la compra anterior (`is_active=false, consumed_at=NOW()`) y crea un nuevo registro activo (`status='completed', is_active=true`). Items consumibles con `effect_data.type` = `hint`/`highlight`/`retry` sincronizan automáticamente al inventario de comodines post-compra.

> **Sincronizacion automatica:** Al comprar items consumibles (hint, highlight, retry), el sistema sincroniza automaticamente el inventario de comodines via `incrementFromShopPurchase()`. Los campos `*_available` y `*_purchased_total` en `comodines_inventory` se incrementan. Errores de sincronizacion se loguean como `[BRIDGE-ERROR]` pero no revierten la compra.

### Inventory — Equipamiento Cosmetico (4 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/inventory/equipped/batch` | Items equipados de multiples usuarios (?userIds=uuid1,uuid2) | Si | any |
| GET | `/api/v1/gamification/inventory/equipped` | Items equipados del usuario autenticado (skins activos) | Si | any |
| POST | `/api/v1/gamification/inventory/equip` | Equipar item cosmetico (requiere ownership) | Si | any |
| POST | `/api/v1/gamification/inventory/unequip` | Desequipar item cosmetico | Si | any |

> Ver contrato completo, validaciones y errores en [ENDPOINTS-INVENTORY-EQUIP.md](../ENDPOINTS-INVENTORY-EQUIP.md).

### Comodines — Power-ups (6 endpoints)
| Method | Endpoint | Description | Auth | Roles |
|--------|----------|-------------|------|-------|
| GET | `/api/v1/gamification/comodines` | Catalogo de comodines disponibles (precios, efectos) | Si | any |
| POST | `/api/v1/gamification/comodines/purchase` | Comprar comodines con ML Coins (PISTAS 15, VISION_LECTORA 25, SEGUNDA_OPORTUNIDAD 40) | Si | any |
| POST | `/api/v1/gamification/comodines/use` | Usar un comodin en un ejercicio (consume del inventario) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/inventory` | Inventario de comodines del usuario (cantidades disponibles) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/history` | Historial de compras y usos de comodines (?limit=N) | Si | any |
| GET | `/api/v1/gamification/comodines/users/:userId/stats` | Estadisticas agregadas de uso de comodines | Si | any |

**Request/Response Schemas:**

**GET /gamification/comodines**

Response (200):
```json
[
  {
    "id": "pistas",
    "name": "Pistas",
    "description": "Revela pistas contextuales para ayudarte en ejercicios dificiles",
    "cost": 15,
    "icon": "💡",
    "rarity": "common",
    "category": "premium",
    "effect": {
      "type": "hint",
      "description": "Muestra una pista contextual del ejercicio"
    }
  },
  {
    "id": "vision_lectora",
    "name": "Vision Lectora",
    "description": "Resalta palabras clave y conceptos importantes en el texto",
    "cost": 25,
    "icon": "👁️",
    "rarity": "rare",
    "category": "premium",
    "effect": {
      "type": "highlight",
      "description": "Resalta palabras clave en el texto del ejercicio"
    }
  },
  {
    "id": "segunda_oportunidad",
    "name": "Segunda Oportunidad",
    "description": "Permite reintentar un ejercicio sin perder puntos",
    "cost": 40,
    "icon": "🔄",
    "rarity": "epic",
    "category": "premium",
    "effect": {
      "type": "retry",
      "description": "Permite corregir una respuesta incorrecta"
    }
  }
]
```

**POST /gamification/comodines/purchase**

Request body:
```json
{
  "user_id": "uuid",
  "comodin_type": "pistas | vision_lectora | segunda_oportunidad",
  "quantity": 1
}
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440001",
  "pistas": {
    "type": "pistas",
    "available": 8,
    "purchased_total": 8,
    "used_total": 0,
    "cost": 15
  },
  "vision_lectora": {
    "type": "vision_lectora",
    "available": 3,
    "purchased_total": 3,
    "used_total": 0,
    "cost": 25
  },
  "segunda_oportunidad": {
    "type": "segunda_oportunidad",
    "available": 1,
    "purchased_total": 1,
    "used_total": 0,
    "cost": 40
  },
  "metadata": {
    "last_purchase_date": "2026-03-01T10:00:00Z",
    "last_purchase_type": "pistas"
  },
  "created_at": "2026-01-15T08:00:00Z",
  "updated_at": "2026-03-01T10:00:00Z"
}
```

> **Nota importante:** La respuesta devuelve el inventario COMPLETO del usuario (InventoryResponseDto), no solo el item comprado.

**POST /gamification/comodines/use**

Request body:
```json
{
  "user_id": "uuid",
  "comodin_type": "pistas | vision_lectora | segunda_oportunidad",
  "quantity": 1,
  "exercise_id": "uuid (optional)",
  "context": "string (optional)"
}
```

Response:
```json
{
  "success": true,
  "used": {
    "comodin_type": "pistas",
    "quantity": 1,
    "exercise_id": "uuid | null"
  },
  "remaining_quantity": 1
}
```

**Error Codes para Comodines:**

| HTTP | Codigo | Descripcion |
|------|--------|-------------|
| 400 | INVALID_COMODIN_TYPE | Tipo de comodin no válido |
| 400 | INSUFFICIENT_COMODINES | No hay cantidad suficiente del comodin |
| 404 | INVENTORY_NOT_FOUND | Inventario del usuario no encontrado |
| 409 | CONSUMABLE_PURCHASE_CONFLICT | Conflicto en compra concurrente de consumible |
| 500 | INTERNAL_SERVER_ERROR | Error interno del servidor |

---

## 15. Achievements Module (~20 endpoints)

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | /achievements | Catalogo de logros | Si |
| GET | /achievements/:id | Detalle de logro | Si |
| GET | /achievements/my | Logros del estudiante actual | Si |
| GET | /achievements/my/recent | Logros recientes | Si |
| GET | /achievements/progress | Progreso hacia logros | Si |
| GET | /achievements/showcase | Logros en showcase del perfil | Si |
| PATCH | /achievements/showcase | Configurar showcase | Si |

---

## 16. Social Module (141 endpoints)

> **Guard:** `JwtAuthGuard` en todos los endpoints
> **Prefijo base:** `/api/v1/social` (via `extractBasePath(API_ROUTES.SOCIAL.BASE)`) o prefijos directos por controller
> **Controllers:** 13 archivos | Rutas reales extraidas de `apps/backend/src/modules/social/controllers/`

### 16.1 Guilds (16 endpoints)

> **Controller prefix:** `/guilds`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/guilds` | Crear nueva guild |
| GET | `/guilds` | Listar todas las guilds con filtros |
| GET | `/guilds/:id` | Obtener guild por ID |
| PATCH | `/guilds/:id` | Actualizar guild |
| DELETE | `/guilds/:id` | Eliminar guild |
| GET | `/guilds/:id/members` | Listar miembros de la guild |
| POST | `/guilds/:id/join-requests` | Enviar solicitud para unirse |
| GET | `/guilds/:id/join-requests` | Listar solicitudes pendientes |
| PATCH | `/guilds/:guildId/join-requests/:requestId` | Aprobar/rechazar solicitud |
| POST | `/guilds/:id/members/add` | Agregar miembro directamente |
| DELETE | `/guilds/:guildId/members/:memberId` | Remover miembro de la guild |
| PATCH | `/guilds/:guildId/members/:memberId/role` | Actualizar rol de miembro |
| GET | `/guilds/:id/stats` | Estadisticas de la guild |
| GET | `/guilds/:id/leaderboard` | Leaderboard de la guild |
| GET | `/guilds/:id/missions` | Misiones de la guild |
| POST | `/guilds/:guildId/missions/:missionId` | Asignar mision a la guild |

### 16.2 Teams (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/teams` | Crear equipo |
| GET | `/api/v1/social/teams` | Listar equipos con filtros |
| GET | `/api/v1/social/teams/:id` | Obtener equipo por ID |
| PATCH | `/api/v1/social/teams/:id` | Actualizar equipo |
| DELETE | `/api/v1/social/teams/:id` | Eliminar equipo |
| GET | `/api/v1/social/teams/:id/members` | Listar miembros del equipo |
| POST | `/api/v1/social/teams/:id/members` | Agregar miembro al equipo |
| DELETE | `/api/v1/social/teams/:teamId/members/:memberId` | Remover miembro del equipo |
| PATCH | `/api/v1/social/teams/:teamId/members/:memberId/role` | Actualizar rol de miembro |
| POST | `/api/v1/social/teams/:id/score` | Actualizar puntaje del equipo |
| POST | `/api/v1/social/teams/:id/xp` | Agregar XP al equipo |
| GET | `/api/v1/social/teams/leaderboard` | Leaderboard de equipos |
| GET | `/api/v1/social/teams/:id/stats` | Estadisticas del equipo |
| GET | `/api/v1/social/teams/classroom/:classroomId` | Equipos por aula |

### 16.3 Friendships (11 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/friendships/:userId` | Listar amigos de un usuario |
| GET | `/api/v1/social/friendships/:userId/pending` | Solicitudes de amistad pendientes |
| GET | `/api/v1/social/friendships/:userId/sent` | Solicitudes de amistad enviadas |
| POST | `/api/v1/social/friendships/request` | Enviar solicitud de amistad |
| PATCH | `/api/v1/social/friendships/:id/accept` | Aceptar solicitud de amistad |
| PATCH | `/api/v1/social/friendships/:id/reject` | Rechazar solicitud de amistad |
| DELETE | `/api/v1/social/friendships/:id` | Eliminar amistad |
| POST | `/api/v1/social/friendships/:id/block` | Bloquear usuario |
| POST | `/api/v1/social/friendships/:id/unblock` | Desbloquear usuario |
| GET | `/api/v1/social/friendships/:userId/blocked` | Lista de usuarios bloqueados |
| GET | `/api/v1/social/friendships/check/:userId1/:userId2` | Verificar estado de amistad entre dos usuarios |

### 16.4 Friends (10 endpoints)

> **Controller prefix:** `/friends`

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/friends` | Listar amigos del usuario autenticado |
| GET | `/friends/search` | Buscar usuarios para agregar |
| GET | `/friends/requests` | Solicitudes de amistad recibidas |
| GET | `/friends/leaderboard` | Leaderboard de amigos |
| POST | `/friends/request` | Enviar solicitud de amistad |
| POST | `/friends/respond` | Aceptar/rechazar solicitud |
| DELETE | `/friends/cancel/:requestId` | Cancelar solicitud enviada |
| DELETE | `/friends/remove/:friendId` | Eliminar amistad |
| GET | `/friends/:userId` | Obtener amigos de un usuario especifico |
| GET | `/friends/mutual/:userId` | Obtener amigos mutuos con un usuario |

### 16.5 Peer Challenges (14 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/peer-challenges` | Crear desafio peer-to-peer |
| GET | `/api/v1/social/peer-challenges` | Listar desafios con filtros (status, type, creator) |
| GET | `/api/v1/social/peer-challenges/open` | Desafios abiertos disponibles |
| GET | `/api/v1/social/peer-challenges/active` | Desafios actualmente en progreso |
| GET | `/api/v1/social/peer-challenges/:id` | Obtener desafio por ID |
| GET | `/api/v1/social/peer-challenges/creator/:userId` | Desafios creados por usuario |
| PATCH | `/api/v1/social/peer-challenges/:id` | Actualizar desafio (solo creador, solo open) |
| PATCH | `/api/v1/social/peer-challenges/:id/start` | Iniciar desafio (status -> in_progress) |
| PATCH | `/api/v1/social/peer-challenges/:id/complete` | Completar desafio |
| PATCH | `/api/v1/social/peer-challenges/:id/cancel` | Cancelar desafio (solo creador) |
| PATCH | `/api/v1/social/peer-challenges/mark-expired` | Marcar desafios expirados (batch) |
| DELETE | `/api/v1/social/peer-challenges/:id` | Eliminar desafio (solo creador) |
| GET | `/api/v1/social/peer-challenges/stats/by-type` | Estadisticas por tipo de desafio |
| GET | `/api/v1/social/peer-challenges/stats/by-status` | Estadisticas por estado |

### 16.6 Team Challenges (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/team-challenges/team/:teamId` | Desafios de un equipo |
| GET | `/api/v1/social/team-challenges/:id` | Obtener team challenge por ID |
| POST | `/api/v1/social/team-challenges` | Crear team challenge |
| POST | `/api/v1/social/team-challenges/:id/assign` | Asignar challenge a equipo |
| PATCH | `/api/v1/social/team-challenges/:id/status` | Actualizar estado del challenge |
| PATCH | `/api/v1/social/team-challenges/:id/score` | Actualizar puntaje |
| PATCH | `/api/v1/social/team-challenges/:id/complete` | Completar challenge |
| PATCH | `/api/v1/social/team-challenges/:id/fail` | Marcar challenge como fallido |
| GET | `/api/v1/social/team-challenges/leaderboard` | Leaderboard de team challenges |
| GET | `/api/v1/social/team-challenges/challenge/:challengeId` | Participaciones por challenge |

### 16.7 Challenge Participants (15 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/challenge-participants` | Agregar participante a challenge |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId` | Participantes de un challenge |
| GET | `/api/v1/social/challenge-participants/user/:userId` | Challenges de un usuario |
| GET | `/api/v1/social/challenge-participants/:id` | Obtener participante por ID |
| DELETE | `/api/v1/social/challenge-participants/:id` | Remover participante |
| PATCH | `/api/v1/social/challenge-participants/:id/accept` | Aceptar invitacion al challenge |
| PATCH | `/api/v1/social/challenge-participants/:id/status` | Actualizar estado de participacion |
| PATCH | `/api/v1/social/challenge-participants/:id/score` | Actualizar puntaje del participante |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/rankings` | Rankings del challenge |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/winner` | Obtener ganador del challenge |
| POST | `/api/v1/social/challenge-participants/:id/rewards` | Distribuir recompensas |
| PATCH | `/api/v1/social/challenge-participants/:id/forfeit` | Abandonar challenge |
| PATCH | `/api/v1/social/challenge-participants/:id/disqualify` | Descalificar participante |
| GET | `/api/v1/social/challenge-participants/user/:userId/stats` | Estadisticas de challenges del usuario |
| GET | `/api/v1/social/challenge-participants/challenge/:challengeId/stats` | Estadisticas del challenge |

### 16.8 Team Members (9 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/team-members/team/:teamId` | Miembros de un equipo |
| GET | `/api/v1/social/team-members/user/:userId` | Equipos de un usuario |
| POST | `/api/v1/social/team-members` | Unirse a un equipo |
| PATCH | `/api/v1/social/team-members/:id/role` | Actualizar rol de miembro |
| DELETE | `/api/v1/social/team-members/:id` | Salir del equipo |
| GET | `/api/v1/social/team-members/:id` | Obtener miembro por ID |
| GET | `/api/v1/social/team-members/team/:teamId/active` | Miembros activos del equipo |
| POST | `/api/v1/social/team-members/team/:teamId/transfer-ownership` | Transferir propiedad del equipo |
| DELETE | `/api/v1/social/team-members/team/:teamId/leave` | Abandonar equipo |

### 16.9 User Activities (5 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/activities/user/:userId` | Actividades de un usuario |
| GET | `/api/v1/social/activities/feed` | Feed de actividades |
| POST | `/api/v1/social/activities` | Crear actividad |
| GET | `/api/v1/social/activities/:id` | Obtener actividad por ID |
| GET | `/api/v1/social/activities/public` | Actividades publicas |

### 16.10 User Follows (7 endpoints)

> **Controller prefix:** `/api/v1/social/follows`

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/social/follows` | Seguir a un usuario |
| DELETE | `/api/v1/social/follows/:followedId` | Dejar de seguir |
| GET | `/api/v1/social/follows/:userId/followers` | Seguidores de un usuario |
| GET | `/api/v1/social/follows/:userId/following` | Usuarios que sigue |
| GET | `/api/v1/social/follows/is-following/:followedId` | Verificar si sigue a un usuario |
| GET | `/api/v1/social/follows/:userId/counts` | Conteo de seguidores/siguiendo |
| GET | `/api/v1/social/follows/:userId/mutual` | Seguidores mutuos |

### 16.11 Classroom Members (10 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/classroom-members/classroom/:classroomId` | Miembros de un aula |
| GET | `/api/v1/social/classroom-members/user/:userId` | Aulas de un usuario |
| POST | `/api/v1/social/classroom-members` | Inscribir miembro en aula |
| PATCH | `/api/v1/social/classroom-members/:id/status` | Actualizar estado de membresia |
| PATCH | `/api/v1/social/classroom-members/:id/grade` | Actualizar calificacion |
| PATCH | `/api/v1/social/classroom-members/:id/attendance` | Registrar asistencia |
| DELETE | `/api/v1/social/classroom-members/:id` | Retirar miembro del aula |
| GET | `/api/v1/social/classroom-members/:id` | Obtener membresia por ID |
| GET | `/api/v1/social/classroom-members/classroom/:classroomId/active` | Miembros activos del aula |
| GET | `/api/v1/social/classroom-members/classroom/:classroomId/leaderboard` | Leaderboard del aula |

### 16.12 Classrooms (12 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/classrooms` | Listar aulas con filtros |
| GET | `/api/v1/social/classrooms/code/:code` | Buscar aula por codigo |
| GET | `/api/v1/social/classrooms/:id` | Obtener aula por ID |
| POST | `/api/v1/social/classrooms` | Crear aula |
| PATCH | `/api/v1/social/classrooms/:id` | Actualizar aula |
| DELETE | `/api/v1/social/classrooms/:id` | Eliminar aula |
| GET | `/api/v1/social/classrooms/:id/stats` | Estadisticas del aula |
| GET | `/api/v1/social/classrooms/teacher/:teacherId/active` | Aulas activas de un profesor |
| POST | `/api/v1/social/classrooms/:id/enroll` | Inscribir estudiante |
| DELETE | `/api/v1/social/classrooms/:classroomId/students/:studentId` | Remover estudiante |
| GET | `/api/v1/social/classrooms/:id/schedule` | Horario del aula |
| GET | `/api/v1/social/classrooms/:id/members` | Miembros del aula |

### 16.13 Schools (8 endpoints)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/social/schools` | Listar escuelas |
| GET | `/api/v1/social/schools/:id` | Obtener escuela por ID |
| GET | `/api/v1/social/schools/code/:code` | Buscar escuela por codigo |
| POST | `/api/v1/social/schools` | Crear escuela |
| PATCH | `/api/v1/social/schools/:id` | Actualizar escuela |
| DELETE | `/api/v1/social/schools/:id` | Eliminar escuela |
| GET | `/api/v1/social/schools/:id/stats` | Estadisticas de la escuela |
| PATCH | `/api/v1/social/schools/:id/settings` | Actualizar configuracion de escuela |

---

Prev: [Educational](02-EDUCATIONAL.md) | Next: [Classrooms, Students & Teachers](04-CLASSROOMS-STUDENTS-TEACHERS.md)
