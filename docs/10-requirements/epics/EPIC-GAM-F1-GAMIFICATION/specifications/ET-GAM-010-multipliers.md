---
titulo: "ET-GAM-010: Multipliers System"
tipo: especificacion-tecnica
fecha_creacion: "2025-10-01"
ultima_actualizacion: "2026-02-28"
estado: activo
---

# ET-GAM-010: Multipliers System

## Metadata

| Campo | Valor |
|-------|-------|
| **ID** | ET-GAM-010 |
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
- RF-GAM-011: Reward Multipliers

### User Stories
- US-GAM-011: XP and Coin Multipliers

---

## Descripcion Funcional

Sistema de multiplicadores de recompensas:
- Multiplicador por rango Maya
- Multiplicador por streak
- Multiplicador por dificultad de ejercicio
- Boosts temporales (items de tienda)
- Eventos con multiplicadores especiales

---

## Arquitectura

### Flujo de Calculo

```
Ejercicio completado
        |
        v
ExerciseRewardsService.calculateRewards()
        |
        v
Base Reward (xp_base, coins_base)
        |
        v
Aplicar Multiplicadores:
  1. Rank Multiplier (1.0x - 2.0x)
  2. Streak Multiplier (1.0x - 1.5x)
  3. Difficulty Multiplier (1.0x - 2.5x)
  4. Active Boost Multiplier (1.0x - 3.0x)
  5. Event Multiplier (1.0x - 5.0x)
        |
        v
Final Reward = Base * (sum of multipliers)
        |
        v
Guardar en user_stats
```

---

## Implementacion Existente

### Backend - RanksService (Multipliers)

**Ubicacion:** `apps/backend/src/modules/gamification/services/ranks.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class RanksService {
  /**
   * Obtiene multiplicador por rango Maya
   */
  async getRankMultiplier(userId: string): Promise<RankMultiplier> {
    const stats = await this.userStatsService.findByUserId(userId);
    const rank = await this.getRankByName(stats.current_rank);

    return {
      xp: rank.xp_multiplier,
      coins: rank.coins_multiplier,
      rankName: rank.name,
    };
  }
}
```

### Database - Maya Ranks with Multipliers

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/tables/13-maya_ranks.sql`

**Estado:** COMPLETO (100%)

```sql
CREATE TABLE gamification_system.maya_ranks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  level_required INT NOT NULL,
  xp_required INT NOT NULL,
  xp_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  coins_multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.00,
  icon_url TEXT,
  color_primary TEXT,
  color_secondary TEXT
);

-- Seeds
INSERT INTO gamification_system.maya_ranks VALUES
('ajaw', 'Ajaw', 1, 0, 1.00, 1.00),
('nacom', 'Nacom', 10, 5000, 1.20, 1.10),
('ah_kin', 'Ah Kin', 25, 25000, 1.40, 1.20),
('halach_uinic', 'Halach Uinic', 50, 100000, 1.70, 1.35),
('kukulkan', 'Kukulkan', 100, 500000, 2.00, 1.50);
```

### Backend - Exercise Rewards Service

**Ubicacion:** `apps/backend/src/modules/progress/services/grading/exercise-rewards.service.ts`

**Estado:** COMPLETO (100%)

```typescript
@Injectable()
export class ExerciseRewardsService {
  /**
   * Calcula recompensas con todos los multiplicadores
   */
  async calculateRewards(
    userId: string,
    exerciseId: string,
    score: number
  ): Promise<CalculatedRewards> {
    const exercise = await this.exerciseService.findById(exerciseId);
    const baseRewards = this.getBaseRewards(exercise, score);

    // Obtener todos los multiplicadores
    const rankMultiplier = await this.ranksService.getRankMultiplier(userId);
    const streakMultiplier = await this.getStreakMultiplier(userId);
    const difficultyMultiplier = this.getDifficultyMultiplier(exercise.difficulty_level);
    const boostMultiplier = await this.getActiveBoostMultiplier(userId);
    const eventMultiplier = await this.getEventMultiplier();

    // Calcular total
    const totalXpMultiplier =
      rankMultiplier.xp +
      streakMultiplier.xp +
      difficultyMultiplier.xp +
      boostMultiplier.xp +
      eventMultiplier.xp - 4; // Restar 4 porque sumamos 5 bases de 1.0

    const totalCoinsMultiplier =
      rankMultiplier.coins +
      streakMultiplier.coins +
      difficultyMultiplier.coins +
      boostMultiplier.coins +
      eventMultiplier.coins - 4;

    return {
      xp: Math.floor(baseRewards.xp * totalXpMultiplier),
      coins: Math.floor(baseRewards.coins * totalCoinsMultiplier),
      breakdown: {
        base: baseRewards,
        rank: rankMultiplier,
        streak: streakMultiplier,
        difficulty: difficultyMultiplier,
        boost: boostMultiplier,
        event: eventMultiplier,
      },
    };
  }

  /**
   * Multiplicador por dificultad
   */
  private getDifficultyMultiplier(difficulty: DifficultyLevel): Multiplier {
    const multipliers: Record<DifficultyLevel, Multiplier> = {
      beginner: { xp: 1.0, coins: 1.0 },
      intermediate: { xp: 1.3, coins: 1.2 },
      advanced: { xp: 1.7, coins: 1.4 },
      expert: { xp: 2.5, coins: 2.0 },
    };
    return multipliers[difficulty];
  }
}
```

### Database - Active Boosts

**Ubicacion:** `apps/database/ddl/schemas/gamification_system/tables/11-active_boosts.sql`

**Estado:** COMPLETO (100%)

```sql
CREATE TABLE gamification_system.active_boosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth_management.profiles(id),
  boost_type TEXT NOT NULL, -- 'xp_boost', 'coins_boost', 'double_xp'
  multiplier DECIMAL(3,2) NOT NULL DEFAULT 1.50,
  activated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  source TEXT NOT NULL, -- 'shop', 'achievement', 'event'
  consumed BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX idx_active_boosts_user ON gamification_system.active_boosts(user_id);
CREATE INDEX idx_active_boosts_expires ON gamification_system.active_boosts(expires_at);
```

### Frontend - Multiplier Display

**Ubicacion:** `apps/frontend/src/features/gamification/ranks/components/MultiplierWidget.tsx`

**Estado:** COMPLETO (100%)

```typescript
interface MultiplierWidgetProps {
  multipliers: MultiplierBreakdown;
  showDetails?: boolean;
}

export const MultiplierWidget: React.FC<MultiplierWidgetProps> = ({
  multipliers,
  showDetails = false,
}) => {
  const totalXp = Object.values(multipliers).reduce((sum, m) => sum + m.xp - 1, 1);
  const totalCoins = Object.values(multipliers).reduce((sum, m) => sum + m.coins - 1, 1);

  return (
    <div className="multiplier-widget">
      <div className="multiplier-total">
        <span className="label">XP</span>
        <span className="value">{totalXp.toFixed(1)}x</span>
      </div>
      <div className="multiplier-total">
        <span className="label">Coins</span>
        <span className="value">{totalCoins.toFixed(1)}x</span>
      </div>

      {showDetails && (
        <div className="multiplier-breakdown">
          {Object.entries(multipliers).map(([key, value]) => (
            <div key={key} className="multiplier-row">
              <span>{key}</span>
              <span>+{((value.xp - 1) * 100).toFixed(0)}%</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## Tabla de Multiplicadores

### Por Rango Maya

| Rango | XP Multiplier | Coins Multiplier |
|-------|---------------|------------------|
| Ajaw | 1.00x | 1.00x |
| Nacom | 1.20x | 1.10x |
| Ah K'in | 1.40x | 1.20x |
| Halach Uinic | 1.70x | 1.35x |
| K'uk'ulkan | 2.00x | 1.50x |

### Por Streak

| Dias | XP Multiplier | Coins Multiplier |
|------|---------------|------------------|
| 0-6 | 1.00x | 1.00x |
| 7-13 | 1.10x | 1.05x |
| 14-29 | 1.20x | 1.10x |
| 30-59 | 1.30x | 1.15x |
| 60+ | 1.50x | 1.25x |

### Por Dificultad

| Nivel | XP Multiplier | Coins Multiplier |
|-------|---------------|------------------|
| Beginner | 1.00x | 1.00x |
| Intermediate | 1.30x | 1.20x |
| Advanced | 1.70x | 1.40x |
| Expert | 2.50x | 2.00x |

### Boosts de Tienda

| Item | XP Multiplier | Duracion |
|------|---------------|----------|
| XP Boost | +50% | 1 hora |
| Double XP | +100% | 30 min |
| Weekend Special | +25% | 48 horas |

---

## Lo que Falta para Completar (15%)

### 1. Event Multipliers (10%)

```typescript
// services/event-multipliers.service.ts (NUEVO)
@Injectable()
export class EventMultipliersService {
  /**
   * Obtiene multiplicador de evento activo
   */
  async getActiveEventMultiplier(): Promise<Multiplier | null>;

  /**
   * Crea evento con multiplicador
   */
  async createEvent(data: CreateEventDto): Promise<Event>;

  /**
   * Lista eventos activos
   */
  async getActiveEvents(): Promise<Event[]>;
}

interface Event {
  id: string;
  name: string;
  description: string;
  xpMultiplier: number;
  coinsMultiplier: number;
  startsAt: Date;
  endsAt: Date;
}
```

### 2. Guild Multipliers (5%)

- Multiplicador por pertenecer a un gremio
- Bonus adicional por nivel del gremio

---

## API REST Endpoints

| Metodo | Ruta | Descripcion |
|--------|------|-------------|
| GET | `/gamification/multipliers` | Todos mis multiplicadores |
| GET | `/gamification/multipliers/breakdown` | Desglose detallado |
| GET | `/gamification/boosts/active` | Boosts activos |
| POST | `/gamification/boosts/activate/:itemId` | Activar boost |

---

## Criterios de Aceptacion

### Funcionales
- [x] Multiplicador por rango Maya
- [x] Multiplicador por streak
- [x] Multiplicador por dificultad
- [x] Boosts temporales de tienda
- [x] Visualizacion de multiplicadores
- [ ] Eventos con multiplicadores especiales
- [ ] Multiplicadores de gremio

### No Funcionales
- [x] Calculo eficiente (single query)
- [x] Cache de multiplicadores
- [x] Desglose visible al usuario

---

## Dependencias

### Bloqueado Por
- Ranks Service (COMPLETO)
- Streak Service (COMPLETO)
- Shop System (COMPLETO)

### Bloquea
- Event System
- Guild Bonuses
- VIP Multipliers

---

## Estimacion de Esfuerzo Restante

| Componente | Horas Estimadas |
|------------|-----------------|
| EventMultipliersService | 6h |
| Guild Multipliers | 4h |
| Frontend Event UI | 3h |
| Tests | 2h |
| **Total** | **15h** |

---

## Historial de Cambios

| Version | Fecha | Autor | Cambios |
|---------|-------|-------|---------|
| 1.0 | 2026-01-27 | Architecture Analyst | Creacion inicial |

---

*Documento: ET-GAM-010-multipliers.md*
*Generado: 2026-01-27*
