---
titulo: "ET-GAM-007: Leaderboards System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-007: Leaderboards System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-007 |
| **Modulo** | Gamificacion |
| **Tipo** | Especificacion Tecnica |
| **Estado** | Implementado |
| **Completitud** | 85% |
| **Version** | 1.0 |
| **Fecha Creacion** | 2026-01-27 |
| **Ultima Actualizacion** | 2026-01-27 |
| **Autor** | Architecture Analyst |

---

## Referencias

### Requerimiento Funcional
- RF-GAM-007: Leaderboard System

### User Stories
- US-GAM-007: Competitive Rankings

---

## Descripcion Funcional

Sistema de rankings y tablas de posiciones:
- Leaderboard global (todos los usuarios)
- Leaderboard por aula
- Leaderboard por escuela
- Leaderboard semanal/mensual
- Leaderboard por mecanica (XP, ML Coins, Streaks)
- Posicion relativa del usuario

---

## Arquitectura

### Diagrama de Componentes

```
+----------------------------------------------------------+
|                   FRONTEND (React)                        |
|  - LeaderboardPage                                        |
|  - LeaderboardTabs                                        |
|  - LeaderboardTable                                       |
|  - LeaderboardPodium                                      |
|  - UserPositionCard                                       |
|  - LiveLeaderboard (real-time)                            |
+-----------------------------+----------------------------+
                              | REST API + WebSocket
+-----------------------------v----------------------------+
|                  BACKEND (NestJS)                        |
|  - LeaderboardController                                 |
|  - LeaderboardService                                    |
|  - WebSocketGateway (updates)                            |
+-----------------------------+----------------------------+
                              | TypeORM + Redis Cache
+-----------------------------v----------------------------+
|               DATABASE (PostgreSQL)                       |
|  - gamification_system.user_stats                        |
|  - gamification_system.leaderboard_metadata              |
|  - Materialized Views (mv_global_leaderboard, etc.)      |
+----------------------------------------------------------+
```

---

## Implementacion Existente

### Backend - LeaderboardService

**Ubicacion:** `apps/backend/src/modules/gamification/services/leaderboard.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class LeaderboardService {
  /**
   * Obtiene leaderboard global
   */
  async getGlobalLeaderboard(
    limit: number = 100,
    offset: number = 0,
    timePeriod?: string
  ): Promise<LeaderboardResult>;

  /**
   * Obtiene leaderboard por aula
   */
  async getClassroomLeaderboard(
    classroomId: string,
    limit: number = 50
  ): Promise<LeaderboardResult>;

  /**
   * Obtiene posicion del usuario
   */
  async getUserPosition(userId: string): Promise<UserPosition>;

  /**
   * Obtiene leaderboard de amigos
   */
  async getFriendsLeaderboard(userId: string): Promise<LeaderboardResult>;

  /**
   * Obtiene top performers por mecanica
   */
  async getTopByMechanic(
    mechanic: 'xp' | 'coins' | 'streaks' | 'achievements'
  ): Promise<LeaderboardResult>;
}
```

### Backend - LeaderboardController

**Ubicacion:** `apps/backend/src/modules/gamification/controllers/leaderboard.controller.ts`

**Estado:** COMPLETO (100%)

| Endpoint | Metodo | Descripcion |
|----------|--------|-------------|
| `/leaderboard/global` | GET | Leaderboard global |
| `/leaderboard/classroom/:id` | GET | Leaderboard de aula |
| `/leaderboard/friends` | GET | Leaderboard de amigos |
| `/leaderboard/my-position` | GET | Posicion del usuario |
| `/leaderboard/top/:mechanic` | GET | Top por mecanica |

### Database - Materialized Views

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/materialized-views/`

**Estado:** COMPLETO (100%)

```sql
-- mv_global_leaderboard.sql
CREATE MATERIALIZED VIEW gamification_system.mv_global_leaderboard AS
SELECT
  ROW_NUMBER() OVER (ORDER BY total_xp DESC, level DESC) as rank,
  user_id,
  total_xp,
  level,
  current_rank,
  achievements_earned,
  exercises_completed,
  current_streak
FROM gamification_system.user_stats
WHERE total_xp > 0
ORDER BY total_xp DESC
LIMIT 1000;

-- Refresh cada hora via cron
CREATE INDEX idx_mv_global_rank ON gamification_system.mv_global_leaderboard(rank);
CREATE INDEX idx_mv_global_user ON gamification_system.mv_global_leaderboard(user_id);
```

```sql
-- mv_classroom_leaderboard.sql
CREATE MATERIALIZED VIEW gamification_system.mv_classroom_leaderboard AS
SELECT
  cm.classroom_id,
  ROW_NUMBER() OVER (
    PARTITION BY cm.classroom_id
    ORDER BY us.total_xp DESC
  ) as rank,
  us.user_id,
  us.total_xp,
  us.level,
  us.current_rank
FROM social_features.classroom_members cm
JOIN gamification_system.user_stats us ON cm.user_id = us.user_id
WHERE cm.role = 'student'
ORDER BY cm.classroom_id, us.total_xp DESC;
```

### Frontend - LeaderboardPage

**Ubicacion:** `apps/frontend/src/apps/student/pages/LeaderboardPage.tsx`

**Estado:** COMPLETO (100%)

### Frontend - Components

**Ubicacion:** `apps/frontend/src/features/gamification/social/components/Leaderboards/`

**Estado:** COMPLETO (100%)

| Componente | Descripcion |
|------------|-------------|
| LeaderboardTabs | Tabs para diferentes leaderboards |
| LeaderboardTable | Tabla con paginacion |
| LeaderboardPodium | Top 3 con estilo podio |
| LeaderboardEntry | Fila de usuario |
| UserPositionCard | Card con posicion del usuario |
| RankChangeIndicator | Indicador de cambio de posicion |
| LeaderboardFilters | Filtros de tiempo/mecanica |

### Frontend - LiveLeaderboard

**Ubicacion:** `apps/frontend/src/features/gamification/leaderboard/LiveLeaderboard.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface LiveLeaderboardProps {
  classroomId?: string;
  limit?: number;
  showPodium?: boolean;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

export const LiveLeaderboard: React.FC<LiveLeaderboardProps> = ({
  classroomId,
  limit = 10,
  showPodium = true,
  autoRefresh = true,
  refreshInterval = 30000,
}) => {
  // WebSocket subscription for real-time updates
  // Auto-refresh every 30 seconds
  // Animated rank changes
};
```

---

## Tipos de Leaderboard

### Por Alcance

| Tipo | Descripcion | Usuarios |
|------|-------------|----------|
| Global | Todos los usuarios activos | ~10,000+ |
| Escuela | Usuarios de una escuela | ~500-2000 |
| Aula | Usuarios de un aula | ~20-40 |
| Amigos | Amigos del usuario | Variable |

### Por Tiempo

| Tipo | Periodo | Refresh |
|------|---------|---------|
| All-time | Historico completo | 1 hora |
| Weekly | Ultimos 7 dias | 15 min |
| Monthly | Ultimos 30 dias | 30 min |
| Daily | Ultimas 24 horas | 5 min |

### Por Mecanica

| Tipo | Metrica | Ordenamiento |
|------|---------|--------------|
| XP | total_xp | DESC |
| Coins | ml_coins | DESC |
| Streaks | current_streak | DESC |
| Achievements | achievements_earned | DESC |
| Exercises | exercises_completed | DESC |

---

## Lo que Falta para Completar (15%)

### 1. Seasonal Leaderboards (10%)

```typescript
// services/seasonal-leaderboard.service.ts (NUEVO)
@Injectable()
export class SeasonalLeaderboardService {
  /**
   * Obtiene leaderboard de temporada actual
   */
  async getCurrentSeasonLeaderboard(): Promise<LeaderboardResult>;

  /**
   * Finaliza temporada y distribuye recompensas
   */
  async endSeason(): Promise<SeasonResult>;

  /**
   * Obtiene historial de temporadas
   */
  async getSeasonHistory(userId: string): Promise<SeasonHistory[]>;
}
```

### 2. Real-time Position Updates (5%)

- WebSocket push cuando cambia posicion
- Notificacion "Subiste al puesto #X"

---

## API REST Endpoints

| Metodo | Ruta | Descripcion | Cache |
|--------|------|-------------|-------|
| GET | `/leaderboard/global` | Global (limit, offset) | 1h |
| GET | `/leaderboard/classroom/:id` | Por aula | 15min |
| GET | `/leaderboard/school/:id` | Por escuela | 30min |
| GET | `/leaderboard/friends` | Amigos | 5min |
| GET | `/leaderboard/my-position` | Mi posicion | 1min |
| GET | `/leaderboard/top/:mechanic` | Por mecanica | 15min |
| GET | `/leaderboard/weekly` | Semanal | 15min |
| GET | `/leaderboard/season/current` | Temporada actual | 5min |

---

## Criterios de Aceptacion

### Funcionales
- [x] Leaderboard global con paginacion
- [x] Leaderboard por aula
- [x] Posicion del usuario visible
- [x] Filtros por tiempo (semanal, mensual)
- [x] Podium para top 3
- [x] Indicador de cambio de posicion
- [ ] Leaderboard por temporadas
- [ ] Push notifications de cambios

### No Funcionales
- [x] Cache para performance
- [x] Materialized views para queries rapidas
- [x] Refresh automatico
- [x] Animaciones de cambio de posicion

---

## Dependencias

### Bloqueado Por
- UserStats Entity (COMPLETO)
- Classroom Members (COMPLETO)
- Cache Module (COMPLETO)

### Bloquea
- Seasonal Rewards
- Tournament System
- Guild Leaderboards

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| SeasonalLeaderboardService | 6h |
| Real-time Position Updates | 4h |
| Frontend Season UI | 4h |
| Tests | 2h |
| **Total** | **16h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-007-leaderboards.md*
*Generado: 2026-01-27*
