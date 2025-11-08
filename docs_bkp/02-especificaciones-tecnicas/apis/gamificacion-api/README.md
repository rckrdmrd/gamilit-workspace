# Gamification API - Overview

**Proyecto:** Gamilit Platform
**Módulo:** Gamification API
**Categoría:** API Specification
**Archivo original:** GAMIFICATION-API.md
**Versión:** 2.0 (RFC-0001 Modularizado)
**Fecha:** 2025-11-01

---

## Descripción

La Gamification API proporciona un sistema completo de engagement estudiantil a través de rangos inspirados en la cultura Maya, moneda virtual (ML Coins), logros, power-ups y leaderboards competitivos.

## Características Principales

- **Total Endpoints:** 32
- **Autenticación:** JWT requerido para todos los endpoints
- **Rate Limiting:** 100 requests/minuto por usuario
- **Estrategia de Cache:** Redis (TTL 60s para leaderboards, 30s para user stats)
- **Soporte WebSocket:** Actualizaciones en tiempo real de leaderboards

## Stack Tecnológico

- **Backend:** Node.js + Express
- **Base de Datos:** PostgreSQL (primary), Redis (cache)
- **Real-time:** Socket.IO
- **Queue:** Bull (para tareas asíncronas)

---

## Módulos de Gamificación

### 1. Rangos Maya API (6 endpoints)
Sistema de progresión visible a través de 5 rangos militares Maya: Ajaw, Nacom, Ah K'in, Halach Uinic, y K'uk'ulkan.

**Archivo:** [01-RANGOS-MAYA.md](./01-RANGOS-MAYA.md)

**Endpoints:**
- `GET /ranks/user/:userId` - Obtener rango actual del usuario
- `GET /ranks/progress` - Obtener progreso detallado hacia el siguiente rango
- `GET /ranks/all` - Obtener información de todos los rangos
- `POST /ranks/calculate-xp` - Calcular XP que se ganaría
- `GET /ranks/prestige` - Obtener información del sistema de prestigio
- `POST /ranks/prestige` - Ejecutar acción de prestigio

### 2. ML Coins API (8 endpoints)
Sistema de moneda virtual con control de inflación y mecanismos balanceados de ganancia/gasto.

**Archivo:** [02-ML-COINS.md](./02-ML-COINS.md)

**Endpoints:**
- `GET /coins/balance` - Obtener balance de ML Coins
- `GET /coins/transactions` - Obtener historial de transacciones
- `POST /coins/award` - Otorgar ML Coins
- `POST /coins/spend` - Gastar ML Coins
- `GET /coins/economy/stats` - Obtener estadísticas de economía (admin)
- `POST /coins/calculate-reward` - Calcular recompensa de ML Coins
- `GET /coins/projections` - Obtener proyecciones de ganancias
- `POST /coins/economy/adjust-inflation` - Ajustar inflación (admin)

### 3. Achievements API (6 endpoints)
Sistema de logros con objetivos de corto, mediano y largo plazo en 4 categorías: Progress, Mastery, Social y Secret.

**Archivo:** [03-ACHIEVEMENTS.md](./03-ACHIEVEMENTS.md)

**Endpoints:**
- `GET /achievements/user/:userId` - Obtener logros del usuario
- `GET /achievements/:achievementId` - Obtener detalles de logro
- `POST /achievements/check-progress` - Verificar progreso de logros
- `GET /achievements/categories` - Obtener categorías de logros
- `GET /achievements/leaderboard` - Obtener leaderboard por logros
- `POST /achievements/unlock` - Desbloquear logro manualmente (admin)

### 4. Power-ups API (6 endpoints)
Herramientas estratégicas que mejoran la experiencia de quizzes sin ser esenciales para el aprendizaje.

**Archivo:** [04-POWER-UPS.md](./04-POWER-UPS.md)

**Endpoints:**
- `GET /powerups/available` - Obtener power-ups disponibles
- `GET /powerups/inventory` - Obtener inventario del usuario
- `POST /powerups/purchase` - Comprar power-up
- `POST /powerups/activate` - Activar power-up
- `GET /powerups/statistics` - Obtener estadísticas de uso
- `GET /powerups/history` - Obtener historial de uso

### 5. Leaderboards API (6 endpoints)
Rankings competitivos a través de múltiples marcos temporales y métricas.

**Archivo:** [05-LEADERBOARDS.md](./05-LEADERBOARDS.md)

**Endpoints:**
- `GET /leaderboards/global` - Obtener leaderboard global
- `GET /leaderboards/weekly` - Obtener leaderboard semanal
- `GET /leaderboards/monthly` - Obtener leaderboard mensual
- `GET /leaderboards/guilds` - Obtener leaderboard de guilds
- `GET /leaderboards/friends` - Obtener leaderboard de amigos
- `GET /leaderboards/history/:userId` - Obtener historial de posiciones

### 6. Algoritmos y Schemas
Algoritmos de cálculo y esquemas de datos utilizados en el sistema de gamificación.

**Archivo:** [06-ALGORITMOS-SCHEMAS.md](./06-ALGORITMOS-SCHEMAS.md)

**Contenido:**
- Algoritmo de cálculo de XP
- Algoritmo de cálculo de ML Coins
- Algoritmo de control de inflación
- Algoritmo de progresión de rangos
- Algoritmo de ranking de leaderboard
- Schemas TypeScript de datos

### 7. WebSocket y Ejemplos
Eventos WebSocket y ejemplos de uso completos.

**Archivo:** [07-WEBSOCKET-EJEMPLOS.md](./07-WEBSOCKET-EJEMPLOS.md)

**Contenido:**
- Eventos WebSocket (servidor y cliente)
- Ejemplos de flujos completos
- Códigos de error
- Métricas de performance
- Rate limiting
- Changelog

---

## Formato de Respuesta

```typescript
interface APIResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
  };
}
```

---

## Autenticación

Todos los endpoints requieren autenticación JWT:

```
Authorization: Bearer <token>
```

---

## Rate Limiting

- **Por Usuario:** 100 requests/minuto
- **Por IP:** 500 requests/minuto
- **Endpoints de Leaderboard:** 30 requests/minuto
- **Endpoints de Admin:** 10 requests/minuto

**Headers de Rate Limit:**
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 87
X-RateLimit-Reset: 1698501600
```

---

## Base URL

- **Development:** `http://localhost:3001/api/gamification`
- **Production:** `https://api.gamilit.com/api/gamification`

---

## Referencias

> **Fuentes de requerimientos:**
> - [Sistema de Gamificación - Requerimientos](../../../01-requerimientos/gamificacion/) - Requerimientos funcionales completos
> - [RNF-GAM-001 - Sistema de Rangos Maya](../../../01-requerimientos/requerimientos-no-funcionales/RNF-GAM-001-rangos-maya.md)

**Especificaciones técnicas:**
- [Backend Architecture](../../arquitectura/BACKEND-ARCHITECTURE.md) - Módulo de gamificación
- [ADR-004 - Gamification System Design](../../adr/ADR-004-gamification-system-design.md) - Decisiones de diseño
- [TYPES-GAMIFICATION](../../tipos-compartidos/TYPES-GAMIFICATION.md) - Tipos TypeScript

**Desarrollo:**
- [Servicios de Gamificación](../../../03-desarrollo/backend/servicios/Servicios-Gamificacion.md) - Implementación backend
- [API de Gamificación](../../../03-desarrollo/backend/api/API-Gamification.md) - Endpoints implementados

---

**Última actualización:** 2025-11-01
**Mantenido por:** Backend Team + Game Design Team
**Contacto:** api@gamilit.com
**Documentación:** https://docs.gamilit.com/api/gamification
